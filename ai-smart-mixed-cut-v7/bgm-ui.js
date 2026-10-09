import {BGM_LIBRARY, normalizeBgmSelection, validateBgmSelection, bgmLocalMetadata, listBgmLocalAssets, getBgmLocalAsset, commitBgmLocalAssets, inspectBgmFile} from './bgm-model.js?v=20261009-update11';

const durationLabel = seconds => Math.floor(seconds / 60) + ':' + String(Math.floor(seconds % 60)).padStart(2, '0');
const sizeLabel = size => size < 1048576 ? Math.max(1, Math.round(size / 1024)) + ' KB' : (size / 1048576).toFixed(1) + ' MB';
const sameFile = (left, right) => left.name === right.name && left.size === right.size && left.lastModified === right.lastModified;
const noteIcon = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 17V6l11-2v11M9 9l11-2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="6" cy="18" rx="3" ry="2.3" stroke="currentColor" stroke-width="1.6"/><ellipse cx="17" cy="16" rx="3" ry="2.3" stroke="currentColor" stroke-width="1.6"/></svg>';

export function createBgmUI({getConfig, onApply, modal, closeModal, toast, button, esc}) {
  let active = false, session = 0, committing = false, loading = false, loadError = '', rows = [], removed = new Set(), removingId = null;
  let draft = normalizeBgmSelection(), libraryChoice = null, localChoice = null, playback = null, playbackToken = 0;
  const audio = document.createElement('audio'); audio.id = 'bgmAudioPreview'; audio.preload = 'metadata'; audio.hidden = true;
  const ownsDialog = token => active && token === session && document.querySelector('#bgmSourceTabs') && document.querySelector('#dialog')?.open;
  function updatePlayback() {
    if (!active) return;
    for (const control of document.querySelectorAll('[data-action="bgm-preview"]')) {
      const playing = playback?.id === control.dataset.id && !audio.paused;
      control.textContent = playing ? '暂停' : '试听';
      control.setAttribute('aria-label', (playing ? '暂停试听 ' : '试听 ') + (control.dataset.name || 'BGM'));
      control.setAttribute('aria-pressed', String(playing));
    }
    const status = document.querySelector('#bgmPreviewStatus');
    if (status) {
      status.hidden = !playback;
      status.textContent = playback ? playback.name + ' · ' + (audio.paused ? '已暂停 ' : '试听中 ') + durationLabel(audio.currentTime || 0) + ' / ' + durationLabel(Number.isFinite(audio.duration) ? audio.duration : playback.duration || 0) : '';
    }
  }
  function stopPreview() {
    playbackToken++; audio.pause(); audio.removeAttribute('src'); audio.load();
    if (playback?.url) URL.revokeObjectURL(playback.url);
    playback = null; updatePlayback();
  }
  audio.addEventListener('timeupdate', updatePlayback);
  audio.addEventListener('play', updatePlayback);
  audio.addEventListener('pause', updatePlayback);
  audio.addEventListener('ended', () => { stopPreview(); });
  audio.addEventListener('error', () => { if (playback && active) { stopPreview(); toast('试听失败，请检查音频后重试'); } });
  function cancel() {
    session++; active = false; committing = false; loading = false; stopPreview();
    rows = []; removed = new Set(); removingId = null; loadError = '';
  }
  function selectionError() {
    const error = validateBgmSelection(draft);
    if (error) return error;
    if (draft.bgmSource === 'local') {
      const row = rows.find(item => item.id === draft.bgmLocal?.id && !removed.has(item.id));
      if (!row || row.status !== 'ready') return '所选本地 BGM 已不可用，请重新上传或选择';
    }
    return null;
  }
  function trackRow(track, local = false) {
    const chosen = local ? draft.bgmLocal?.id === track.id : draft.bgmTrack === track.id;
    const ready = !local || track.status === 'ready';
    return `<div class="bgm-track-row ${chosen ? 'is-selected' : ''} ${ready ? '' : 'is-unavailable'}" data-bgm-id="${esc(track.id)}">
      <label class="bgm-track-choice"><input type="radio" name="bgmTrackChoice" value="${esc(track.id)}" ${chosen ? 'checked' : ''} ${!ready || committing ? 'disabled' : ''}><span class="bgm-track-symbol">${noteIcon}</span><span class="bgm-track-name"><b title="${esc(track.name)}">${esc(track.name)}</b><small class="${track.status === 'error' || track.status === 'unavailable' ? 'error-text' : ''}">${local ? track.status === 'reading' ? '读取中…' : track.status === 'error' ? esc(track.error) : track.status === 'unavailable' ? '文件不可用，请重新上传' : sizeLabel(track.size) : '平台素材'}</small></span></label>
      <span class="bgm-track-duration">${ready ? durationLabel(track.duration) : '—'}</span><div class="bgm-track-actions">${button('试听', 'bgm-preview', 'text-btn', `data-id="${esc(track.id)}" data-name="${esc(track.name)}" aria-label="试听 ${esc(track.name)}" aria-pressed="false" ${!ready || committing ? 'disabled' : ''}`)}${local ? button('删除', 'bgm-remove', 'text-btn danger', `data-id="${esc(track.id)}" aria-label="删除 ${esc(track.name)}" ${committing ? 'disabled' : ''}`) : ''}</div>
      ${removingId === track.id ? `<div class="bgm-remove-confirm"><span>删除这首音频？</span>${button('取消', 'bgm-remove-cancel', 'text-btn')}${button('确认删除', 'bgm-remove-confirm', 'text-btn danger', `data-id="${esc(track.id)}"`)}</div>` : ''}</div>`;
  }
  function render() {
    if (!active) return;
    stopPreview();
    const source = draft.bgmSource, visibleRows = rows.filter(row => !removed.has(row.id)), reading = rows.some(row => !removed.has(row.id) && row.status === 'reading');
    const tabs = `<div id="bgmSourceTabs" class="bgm-source-tabs" role="tablist" aria-label="BGM方式">${[['library', '系统曲库'], ['local', '本地上传'], ['smart', '智能匹配']].map(([value, label]) => button(label, 'bgm-source', source === value ? 'is-active' : '', `id="bgmTab-${value}" role="tab" aria-selected="${source === value}" aria-controls="bgmPanel" data-value="${value}" ${committing ? 'disabled' : ''}`)).join('')}</div>`;
    let panel;
    if (source === 'library') panel = `<div class="bgm-list-heading"><span>曲目</span><span>时长</span><span>操作</span></div><div id="bgmLibraryList" class="bgm-track-list" role="radiogroup" aria-label="选择系统 BGM">${BGM_LIBRARY.map(track => trackRow(track)).join('')}</div>${draft.bgmTrack && !BGM_LIBRARY.some(track => track.id === draft.bgmTrack) ? '<p class="bgm-inline-error">原选曲目已不可用，请重新选择。</p>' : ''}`;
    else if (source === 'local') panel = `<div class="bgm-local-toolbar"><div><b>我的音频</b><span>${visibleRows.length ? ' · ' + visibleRows.length + ' 首' : ''}</span></div><label class="bgm-upload-button ${committing || loading ? 'disabled' : ''}">上传音频<input id="bgmLocalFile" type="file" aria-label="上传 BGM 音频" accept=".mp3,.wav,.m4a,.aac,.ogg,audio/mpeg,audio/wav,audio/mp4,audio/aac,audio/ogg" multiple ${committing || loading ? 'disabled' : ''}></label></div><p class="bgm-upload-hint">支持 MP3、WAV、M4A、AAC、OGG，选择一首用于本次生成。</p><div id="bgmLocalList" class="bgm-track-list bgm-local-list" role="radiogroup" aria-label="选择本地 BGM">${loading ? '<div class="bgm-empty">正在读取音频…</div>' : loadError ? `<div class="bgm-empty"><p class="error-text">${esc(loadError)}</p>${button('重新读取', 'bgm-reload', 'secondary')}</div>` : visibleRows.length ? visibleRows.map(track => trackRow(track, true)).join('') : `<div class="bgm-empty"><span class="bgm-empty-symbol">${noteIcon}</span><b>还没有上传音频</b><p>上传后可试听并选择 BGM</p></div>`}</div>`;
    else if (source === 'smart') panel = `<div class="bgm-smart-panel"><span class="bgm-smart-symbol">${noteIcon}</span><div><h3>为每条成片智能选曲</h3><p>根据每条成片的剧情与节奏，从系统曲库匹配 BGM。</p></div></div>`;
    else panel = '<p class="bgm-inline-error">原 BGM 方式已不可用，请重新选择。</p>';
    const disabled = committing || reading || (source === 'local' && (loading || !!loadError)) || !!selectionError();
    modal('选择BGM', `${tabs}<div id="bgmPanel" role="tabpanel" aria-labelledby="bgmTab-${esc(source)}">${panel}</div><div id="bgmPreviewStatus" class="bgm-preview-status" role="status" hidden></div>`, button('取消', 'bgm-cancel', 'secondary', committing ? 'disabled' : '') + button(committing ? '正在保存…' : '使用BGM', 'bgm-apply', 'primary', disabled ? 'disabled' : ''));
    const dialog = document.querySelector('#dialog'); dialog.classList.add('bgm-dialog');
    dialog.querySelector('[aria-label="关闭弹窗"]').disabled = committing;
    document.querySelector('#dialogBody').append(audio);
  }
  async function loadLocal(token) {
    loading = true; loadError = ''; render();
    try {
      const stored = await listBgmLocalAssets();
      if (!ownsDialog(token)) return;
      const additions = rows.filter(row => !row.existing);
      rows = [...stored.map(row => ({...row, existing: true, status: row.available ? 'ready' : 'unavailable'})), ...additions];
      if (localChoice && !rows.some(row => row.id === localChoice.id)) rows.unshift({...localChoice, existing: true, status: 'unavailable'});
    } catch { if (ownsDialog(token)) loadError = '无法读取本地音频，请重试'; }
    if (ownsDialog(token)) { loading = false; render(); }
  }
  function open() {
    cancel(); active = true; draft = normalizeBgmSelection(getConfig());
    libraryChoice = draft.bgmSource === 'library' ? draft.bgmTrack : null;
    localChoice = draft.bgmSource === 'local' ? draft.bgmLocal : null;
    render(); loadLocal(session);
  }
  async function inspect(row, token) {
    try { Object.assign(row, await inspectBgmFile(row.file), {status: 'ready'}); }
    catch (error) { row.status = 'error'; row.error = error.message; }
    if (ownsDialog(token) && rows.includes(row) && !removed.has(row.id)) {
      // Uploading never replaces an explicitly selected or unavailable saved file.
      if (row.status === 'ready' && !localChoice) { localChoice = bgmLocalMetadata(row); if (draft.bgmSource === 'local') draft = {bgmSource: 'local', bgmTrack: null, bgmLocal: localChoice}; }
      render();
    }
  }
  function add(files) {
    if (!active || committing || loading || draft.bgmSource !== 'local') return;
    let duplicates = 0;
    const added = [];
    for (const file of files) {
      if (rows.some(row => !removed.has(row.id) && row.status !== 'unavailable' && row.status !== 'error' && sameFile(row, file))) { duplicates++; continue; }
      const row = {id: 'bgm-local-' + crypto.randomUUID(), name: file.name, size: file.size, type: file.type, lastModified: file.lastModified, duration: 0, file, existing: false, status: 'reading'};
      rows.push(row); added.push(row);
    }
    render();
    if (duplicates) toast('已跳过 ' + duplicates + ' 个重复音频');
    for (const row of added) inspect(row, session);
  }
  async function preview(id) {
    if (playback?.id === id) { if (audio.paused) { try { await audio.play(); } catch { toast('试听失败，请重新点击试听'); } } else audio.pause(); updatePlayback(); return; }
    stopPreview();
    const token = session, playToken = playbackToken, local = draft.bgmSource === 'local';
    const track = local ? rows.find(row => row.id === id && !removed.has(id) && row.status === 'ready') : BGM_LIBRARY.find(row => row.id === id);
    if (!track) return;
    let url;
    try {
      if (local) {
        const file = track.file || (await getBgmLocalAsset(id))?.file;
        if (!ownsDialog(token) || playToken !== playbackToken) return;
        if (!file) { track.status = 'unavailable'; render(); toast('音频文件已不可用，请重新上传'); return; }
        url = URL.createObjectURL(file);
      }
      if (!ownsDialog(token) || playToken !== playbackToken) { if (url) URL.revokeObjectURL(url); return; }
      playback = {id, name: track.name, duration: track.duration, url}; audio.src = url || track.audioUrl; await audio.play();
      if (ownsDialog(token) && playToken === playbackToken) updatePlayback();
    } catch {
      if (ownsDialog(token) && playToken === playbackToken) { stopPreview(); toast('试听失败，请检查音频后重试'); }
      else if (url && playback?.url !== url) URL.revokeObjectURL(url);
    }
  }
  async function apply() {
    const error = selectionError();
    if (error) { toast(error); return; }
    if (rows.some(row => !removed.has(row.id) && row.status === 'reading')) { toast('请等待音频读取完成'); return; }
    const token = session; committing = true; render(); let rollback;
    try {
      if (draft.bgmSource === 'local') {
        const row = rows.find(item => item.id === draft.bgmLocal?.id);
        if (row.existing && !(await getBgmLocalAsset(row.id))) { row.status = 'unavailable'; throw Error('所选本地 BGM 已不可用，请重新上传或选择'); }
      }
      const additions = rows.filter(row => !row.existing && !removed.has(row.id) && row.status === 'ready');
      const removeIds = rows.filter(row => row.existing && removed.has(row.id)).map(row => row.id);
      if (additions.length || removeIds.length) rollback = await commitBgmLocalAssets({additions, removeIds});
      if (!ownsDialog(token)) { if (rollback) await rollback(); return; }
      await onApply(normalizeBgmSelection(draft));
      cancel(); closeModal(); toast('已更新 BGM');
    } catch (error) {
      if (rollback) { try { await rollback(); } catch {} }
      if (ownsDialog(token)) { committing = false; render(); toast(error?.message?.includes('BGM') ? error.message : '保存失败，请检查浏览器存储空间后重试'); }
    }
  }
  async function handle(action, element) {
    if (!action.startsWith('bgm-')) return false;
    if (!active || committing) return true;
    if (action === 'bgm-source') {
      const source = element.dataset.value;
      if (!['library', 'local', 'smart'].includes(source)) return true;
      removingId = null;
      draft = normalizeBgmSelection({bgmSource: source, bgmTrack: source === 'library' ? libraryChoice : 'auto', bgmLocal: source === 'local' ? localChoice : null}); render();
    } else if (action === 'bgm-preview') await preview(element.dataset.id);
    else if (action === 'bgm-remove') { removingId = element.dataset.id; render(); }
    else if (action === 'bgm-remove-cancel') { removingId = null; render(); }
    else if (action === 'bgm-remove-confirm') {
      const id = element.dataset.id;
      removed.add(id); removingId = null;
      if (localChoice?.id === id) { localChoice = null; draft.bgmLocal = null; }
      render();
    } else if (action === 'bgm-reload') await loadLocal(session);
    else if (action === 'bgm-cancel') { cancel(); closeModal(); }
    else if (action === 'bgm-apply') await apply();
    return true;
  }
  document.addEventListener('change', event => {
    if (!active || committing || !event.target.closest('#dialog')) return;
    if (event.target.id === 'bgmLocalFile') { add([...event.target.files]); return; }
    if (event.target.name !== 'bgmTrackChoice') return;
    const id = event.target.value;
    if (draft.bgmSource === 'library' && BGM_LIBRARY.some(track => track.id === id)) { libraryChoice = id; draft.bgmTrack = id; }
    if (draft.bgmSource === 'local') {
      const row = rows.find(item => item.id === id && !removed.has(id) && item.status === 'ready');
      if (row) { localChoice = bgmLocalMetadata(row); draft.bgmLocal = localChoice; }
    }
    removingId = null; render();
  });
  document.addEventListener('keydown', event => {
    if (!active || committing || !event.target.closest('#bgmSourceTabs') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const tabs = [...document.querySelectorAll('#bgmSourceTabs [role="tab"]')], index = tabs.indexOf(event.target);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    event.preventDefault(); const value = tabs[next].dataset.value; handle('bgm-source', tabs[next]); document.querySelector('#bgmTab-' + value)?.focus();
  });
  document.querySelector('#dialog')?.addEventListener('close', () => { if (active) cancel(); });
  document.querySelector('#dialog')?.addEventListener('cancel', event => { if (active && committing) event.preventDefault(); else if (active) cancel(); });
  return {open, handle, add, cancel, reset: cancel, isBusy: () => committing};
}
