/* Client-side source import interaction. Media is kept in this browser,
 * independently of the fictional generation fixtures. */
const mediaDatabase = new Promise((resolve, reject) => {
  const request = indexedDB.open('mixed-cut-v7-local-media', 1);
  request.onupgradeneeded = () => request.result.createObjectStore('videos', {keyPath: 'id'});
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});
mediaDatabase.catch(() => {});
async function retainFiles(rows) {
  const db = await mediaDatabase;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('videos', 'readwrite');
    for (const row of rows) transaction.objectStore('videos').put({id: row.id, file: row.file});
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error);
  });
}
const sizeLabel = size => size < 1048576 ? (size / 1024).toFixed(0) + ' KB' : (size / 1048576).toFixed(1) + ' MB';
const timeLabel = seconds => Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
const sameFile = (left, right) => left.name === right.name && left.size === right.size
  && (!Number.isFinite(left.lastModified) || !Number.isFinite(right.lastModified) || left.lastModified === right.lastModified);
function waitMedia(video, event, operation) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => finish(new Error('无法读取视频，请检查文件后重新添加')), 15000);
    const cleanup = () => { clearTimeout(timeout); video.removeEventListener(event, success); video.removeEventListener('error', failure); };
    const finish = error => { cleanup(); error ? reject(error) : resolve(); };
    const success = () => finish();
    const failure = () => finish(new Error('无法读取视频，请检查文件格式'));
    video.addEventListener(event, success, {once: true});
    video.addEventListener('error', failure, {once: true});
    operation();
  });
}
async function inspectVideo(file, url) {
  if (!file.size) throw Error('文件为空，请重新选择');
  if (!file.type.startsWith('video/') && !/\.(mp4|mov|m4v|webm|avi|mkv)$/i.test(file.name)) throw Error('请选择视频文件');
  const video = document.createElement('video');
  video.muted = true; video.preload = 'auto'; video.playsInline = true;
  try {
    await waitMedia(video, 'loadeddata', () => { video.src = url; video.load(); });
    let duration = video.duration;
    // Some recorded WebM files publish their duration only after seeking.
    if (duration === Infinity) {
      await waitMedia(video, 'seeked', () => { video.currentTime = 1e8; });
      duration = Number.isFinite(video.duration) ? video.duration : video.currentTime;
      await waitMedia(video, 'seeked', () => { video.currentTime = 0; });
    }
    if (!Number.isFinite(duration) || duration <= 0 || !video.videoWidth) throw Error('无法读取视频时长，请重新选择');
    const canvas = document.createElement('canvas');
    canvas.width = 144; canvas.height = Math.max(1, Math.round(144 * video.videoHeight / video.videoWidth));
    // Keep cover metadata small enough for the existing local state store.
    if (canvas.height > 256) { canvas.width = Math.max(1, Math.round(256 * video.videoWidth / video.videoHeight)); canvas.height = 256; }
    const context = canvas.getContext('2d', {willReadFrequently: true});
    let cover = '';
    for (const at of [...new Set([0, Math.min(.5, duration / 3), Math.min(1, duration / 2), Math.min(2, duration * .75)])]) {
      if (at > 0) await waitMedia(video, 'seeked', () => { video.currentTime = at; });
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      cover = canvas.toDataURL('image/jpeg', .65);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      let light = 0;
      for (let index = 0; index < pixels.length; index += 4) light += (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
      if (light / (pixels.length / 4) > 8) break;
    }
    return {duration, cover, width: video.videoWidth, height: video.videoHeight};
  } finally { video.removeAttribute('src'); video.load(); }
}

export function createLocalUpload({modal, closeModal, button, esc, toast, onImport, onAppend}) {
  let rows = [], session = 0, active = false, committing = false, appendSource = null;
  const release = () => { for (const row of rows) if (row.url) URL.revokeObjectURL(row.url); rows = []; };
  function cancel() { session++; active = false; committing = false; appendSource = null; release(); }
  function render() {
    if (!active) return;
    const added = rows.filter(row => !row.existing), ready = added.filter(row => row.status === 'ready').length, append = !!appendSource;
    const count = append ? ' · 已导入 ' + appendSource.files.length + ' 集 · 新增 ' + added.length + ' 集' : rows.length ? ' · ' + rows.length + ' 集' : '';
    const body = `<div class="local-upload-toolbar"><div><b>原片视频</b><span class="muted">${count}</span></div><label class="local-file-button ${committing ? 'disabled' : ''}">添加视频<input type="file" id="localFile" aria-label="选择原片视频" accept="video/*,.mp4,.mov,.m4v,.webm" multiple ${committing ? 'disabled' : ''}></label></div>
      <p class="helper local-upload-hint">${append ? '新视频追加到已有集数后，已有集序保持不变。' : '每个视频作为一集，按列表顺序混剪。可添加、删除或调整顺序。'}</p>
      <div class="local-upload-list ${rows.length ? '' : 'is-empty'}">${rows.length ? `<table class="local-file-table"><thead><tr><th>集序</th><th>视频</th><th>时长 / 大小</th><th>状态</th><th>操作</th></tr></thead><tbody>${rows.map((row, index) => `<tr data-local-id="${esc(row.id)}" data-local-existing="${!!row.existing}" class="${row.existing ? 'local-existing-row' : ''}"><td>${index + 1}</td><td><div class="local-file-name">${row.cover ? `<img src="${row.cover}" alt="视频封面">` : '<span class="local-file-placeholder" aria-hidden="true">▹</span>'}<span title="${esc(row.file.name)}">${esc(row.file.name)}</span></div></td><td>${row.duration ? timeLabel(row.duration) : '—'}<small>${sizeLabel(row.file.size)}</small></td><td><span class="${row.status === 'error' ? 'error-text' : row.status === 'ready' ? 'local-ready' : 'muted'}">${row.existing ? '已导入' : row.status === 'ready' ? append ? '待追加' : '已添加' : row.status === 'error' ? '添加失败' : '读取中…'}</span>${row.error ? `<small class="error-text">${esc(row.error)}</small>` : ''}</td><td>${row.existing ? '<span class="local-existing-note">已有剧集</span>' : `<div class="local-file-actions">${button('↑', 'local-up', 'icon-btn', `data-id="${row.id}" aria-label="上移第 ${index + 1} 集" ${!index || rows[index - 1]?.existing || committing ? 'disabled' : ''}`)}${button('↓', 'local-down', 'icon-btn', `data-id="${row.id}" aria-label="下移第 ${index + 1} 集" ${index === rows.length - 1 || committing ? 'disabled' : ''}`)}${row.status === 'error' ? button('重试', 'local-retry', 'text-btn', `data-id="${row.id}" ${committing ? 'disabled' : ''}`) : ''}${button('删除', 'local-remove', 'text-btn danger', `data-id="${row.id}" aria-label="删除 ${esc(row.file.name)}" ${committing ? 'disabled' : ''}`)}</div>`}</td></tr>`).join('')}</tbody></table>` : '<div class="local-upload-empty"><span aria-hidden="true">＋</span><b>添加原片视频</b><p>支持一次选择多个视频</p></div>'}</div>`;
    modal(append ? '添加视频' : '导入本地原片', body, button('取消', 'close', 'secondary', committing ? 'disabled' : '') + button(committing ? append ? '正在追加…' : '正在导入…' : (append ? '确认追加' : '确认导入') + (added.length ? ' ' + added.length + ' 集' : ''), 'local-confirm', 'primary', !added.length || ready !== added.length || committing ? 'disabled' : ''));
    const dialog = document.querySelector('#dialog'); dialog.classList.add('wide', 'local-upload-dialog');
    dialog.querySelector('[aria-label="关闭弹窗"]').disabled = committing;
  }
  function open() { cancel(); active = true; render(); }
  function openAppend(source) {
    if (source?.kind !== 'manual' || source.simulated === true || !Array.isArray(source.files) || !source.files.length) { toast('请先导入本地原片'); return; }
    cancel();
    appendSource = JSON.parse(JSON.stringify(source));
    rows = appendSource.files.map(file => ({...file, existing: true, file: {name: file.name, size: file.size, type: file.type, lastModified: file.lastModified}, status: 'ready'}));
    active = true; render();
  }
  async function inspect(row, token) {
    row.status = 'reading'; row.error = ''; render();
    try { Object.assign(row, await inspectVideo(row.file, row.url), {status: 'ready'}); }
    catch (error) { row.status = 'error'; row.error = error.message; }
    if (active && session === token && rows.includes(row)) render();
  }
  function add(files) {
    if (!active || committing) return;
    const duplicates = []; const added = [];
    for (const file of files) {
      if (rows.some(row => sameFile(row.file, file))) { duplicates.push(file.name); continue; }
      const row = {id: 'local-' + crypto.randomUUID(), file, url: URL.createObjectURL(file), status: 'reading', existing: false};
      rows.push(row); added.push(row);
    }
    render();
    if (duplicates.length) toast('已跳过 ' + duplicates.length + ' 个重复视频');
    for (const row of added) inspect(row, session);
  }
  async function handle(action, element) {
    if (!action.startsWith('local-')) return false;
    if (!active || committing) return true;
    const index = rows.findIndex(row => row.id === element.dataset.id), editable = index >= 0 && !rows[index].existing;
    if (action === 'local-remove' && editable) { URL.revokeObjectURL(rows[index].url); rows.splice(index, 1); render(); }
    if (['local-up', 'local-down'].includes(action) && editable) { const next = index + (action === 'local-up' ? -1 : 1); if (rows[next] && !rows[next].existing) { [rows[index], rows[next]] = [rows[next], rows[index]]; render(); } }
    if (action === 'local-retry' && editable) inspect(rows[index], session);
    if (action === 'local-confirm') {
      const added = rows.filter(row => !row.existing), previous = appendSource;
      if (!added.length || added.some(row => row.status !== 'ready')) { toast('请先完成视频添加，或删除失败的视频'); return true; }
      committing = true; render();
      try {
        await retainFiles(added);
        const offset = previous?.files.length || 0;
        const newFiles = added.map((row, index) => ({id: row.id, name: row.file.name, size: row.file.size, type: row.file.type, lastModified: row.file.lastModified, duration: row.duration, width: row.width, height: row.height, cover: row.cover, order: offset + index + 1, status: 'ready'}));
        const files = previous ? [...previous.files, ...newFiles] : newFiles;
        const source = previous
          ? {...previous, market: null, files, fileVersion: (Number(previous.fileVersion) || 1) + 1, title: previous.title || previous.files[0].name, cover: previous.cover || previous.files[0].cover || '', totalEpisodes: files.length, availableEpisodes: files.map((file, index) => !file.status || file.status === 'ready' ? index + 1 : null).filter(Boolean), simulated: false}
          : {kind: 'manual', market: null, assetId: 'local-' + crypto.randomUUID(), fileVersion: 1, files, title: files[0].name, cover: files[0].cover, totalEpisodes: files.length, availableEpisodes: files.map(file => file.order), simulated: false};
        if (previous) await onAppend(source, previous); else await onImport(source);
        cancel(); document.querySelector('#dialog [aria-label="关闭弹窗"]').disabled = false; closeModal();
        toast(previous ? '已追加 ' + newFiles.length + ' 集' : '已导入 ' + files.length + ' 集');
      } catch (error) {
        committing = false; render();
        const sourceErrors = ['当前片源已变化，请重新添加视频', '已有片源已变化，请重新添加视频'];
        toast(sourceErrors.includes(error?.message) ? error.message : (previous ? '追加' : '导入') + '失败，请检查浏览器存储空间后重试');
      }
    }
    return true;
  }
  return {open, openAppend, add, handle, cancel, isBusy: () => committing};
}
