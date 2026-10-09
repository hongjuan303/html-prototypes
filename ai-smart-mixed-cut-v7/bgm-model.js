import {platformAccount} from './platform-context.js?v=20261009-update11';

// The catalog represents the platform material library in this prototype.
// Audition files are original, synthesized demonstration music, not production catalog assets.
export const BGM_LIBRARY_SOURCE = '工具箱→小说转投放素材→解说素材→BGM→平台素材';
export const BGM_LIBRARY = Object.freeze([
  {id: 'tension-01', name: '暗涌', duration: 24, audioUrl: './assets/bgm-undercurrent.wav', tags: ['悬念', '秘密', '质疑', '危机', '真相', '紧张']},
  {id: 'rise-01', name: '破局', duration: 24, audioUrl: './assets/bgm-breakthrough.wav', tags: ['逆袭', '反击', '胜利', '揭晓', '力量', '突破']},
  {id: 'soft-01', name: '心事', duration: 24, audioUrl: './assets/bgm-heartfelt.wav', tags: ['情感', '守护', '重逢', '告白', '回忆', '温柔']},
]);

export function bgmLocalMetadata(value) {
  if (!value || typeof value !== 'object' || typeof value.id !== 'string') return null;
  return {id: value.id, name: String(value.name || ''), duration: Number(value.duration) || 0,
    size: Number(value.size) || 0, type: String(value.type || ''), lastModified: Number(value.lastModified) || 0};
}

export function normalizeBgmSelection(config = {}) {
  const source = config.bgmSource || (config.bgmTrack && config.bgmTrack !== 'auto' ? 'library' : 'smart');
  if (source === 'smart') return {bgmSource: 'smart', bgmTrack: 'auto', bgmLocal: null};
  if (source === 'local') return {bgmSource: 'local', bgmTrack: null, bgmLocal: bgmLocalMetadata(config.bgmLocal)};
  // Keep unknown IDs and sources invalid: a saved choice must never turn into a different track.
  return {bgmSource: source, bgmTrack: typeof config.bgmTrack === 'string' ? config.bgmTrack : null, bgmLocal: null};
}

export function validateBgmSelection(config = {}) {
  if (config.bgm === false) return null;
  const selection = normalizeBgmSelection(config);
  if (selection.bgmSource === 'smart') return BGM_LIBRARY.length ? null : '系统曲库暂无可用 BGM';
  if (selection.bgmSource === 'library') return BGM_LIBRARY.some(track => track.id === selection.bgmTrack) ? null : '请选择一首可用的系统 BGM';
  if (selection.bgmSource === 'local') {
    const local = selection.bgmLocal;
    return local?.id && local.name && local.size > 0 && Number.isFinite(local.duration) && local.duration > 0 ? null : '请选择一首可用的本地 BGM';
  }
  return '请选择 BGM 方式';
}

export function bgmSelectionLabel(config = {}) {
  const selection = normalizeBgmSelection(config);
  if (selection.bgmSource === 'smart') return '智能匹配';
  if (selection.bgmSource === 'local') return selection.bgmLocal?.name ? selection.bgmLocal.name + ' · 本地上传' : '请选择本地 BGM';
  if (selection.bgmSource === 'library') return (BGM_LIBRARY.find(track => track.id === selection.bgmTrack)?.name || '曲目不可用') + ' · 系统曲库';
  return '请选择 BGM 方式';
}

let database;
function openDatabase() {
  if (database) return database;
  database = new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(Error('当前浏览器无法保存本地音频')); return; }
    const request = indexedDB.open('mixed-cut-v7-bgm', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('assets', {keyPath: 'id'});
    request.onsuccess = () => { const db = request.result; db.onversionchange = () => { db.close(); database = null; }; resolve(db); };
    request.onerror = () => { database = null; reject(request.error || Error('无法打开本地音频库')); };
    request.onblocked = () => { database = null; reject(Error('本地音频库暂不可用，请关闭其他窗口后重试')); };
  });
  return database;
}

async function readRecords(id) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('assets', 'readonly');
    const request = id === undefined ? transaction.objectStore('assets').getAll() : transaction.objectStore('assets').get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || Error('无法读取本地音频'));
  });
}

export async function listBgmLocalAssets() {
  return (await readRecords()).filter(record => record.owner === platformAccount.id && record.active !== false).map(record => ({
    ...bgmLocalMetadata(record.metadata), available: record.file instanceof Blob && record.file.size > 0,
  }));
}

export async function getBgmLocalAsset(id, {includeRemoved = false} = {}) {
  const record = await readRecords(id);
  if (!record || record.owner !== platformAccount.id || (!includeRemoved && record.active === false) || !(record.file instanceof Blob) || !record.file.size) return null;
  return {metadata: bgmLocalMetadata(record.metadata), file: record.file};
}

export async function assertBgmAvailable(config = {}) {
  const selection = normalizeBgmSelection(config);
  if (config.bgm === false) return selection;
  const error = validateBgmSelection(config);
  if (error) throw Error(error);
  if (selection.bgmSource === 'local') {
    let asset;
    try { asset = await getBgmLocalAsset(selection.bgmLocal.id); }
    catch { throw Error('无法读取本地 BGM，请重新打开 BGM 设置后重试'); }
    if (!asset) throw Error('所选本地 BGM 已不可用，请重新上传或选择');
    if (asset.file.size !== selection.bgmLocal.size || asset.metadata.duration !== selection.bgmLocal.duration) throw Error('所选本地 BGM 已变化，请重新选择');
  }
  return selection;
}

// Deactivation removes an asset from the picker while retaining its Blob for historical tasks.
// The returned rollback restores the old catalog if saving the creation settings fails.
export async function commitBgmLocalAssets({additions = [], removeIds = []} = {}) {
  const db = await openDatabase();
  const changedIds = [...new Set([...additions.map(row => row.id), ...removeIds])];
  if (!changedIds.length) return async () => {};
  const previous = await Promise.all(changedIds.map(id => readRecords(id)));
  if (previous.some(record => record && record.owner !== platformAccount.id)) throw Error('当前账号无法修改此 BGM');
  async function write(records, deleteIds = []) {
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('assets', 'readwrite'), store = transaction.objectStore('assets');
      for (const record of records) store.put(record);
      for (const id of deleteIds) store.delete(id);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error || Error('保存音频失败'));
      transaction.onabort = () => reject(transaction.error || Error('保存音频失败'));
    });
  }
  const removals = previous.filter(record => record && removeIds.includes(record.id)).map(record => ({...record, active: false}));
  const added = additions.map(row => ({id: row.id, owner: platformAccount.id, metadata: bgmLocalMetadata(row), file: row.file, active: true}));
  if (added.some(record => !(record.file instanceof Blob) || !record.file.size)) throw Error('音频文件已不可用，请重新上传');
  await write([...removals, ...added]);
  return () => write(previous.filter(Boolean), changedIds.filter((id, index) => !previous[index]));
}

export async function inspectBgmFile(file) {
  if (!(file instanceof Blob) || !file.size) throw Error('文件为空，请重新选择');
  if (!/\.(mp3|wav|m4a|aac|ogg)$/i.test(file.name || '')) throw Error('请选择 MP3、WAV、M4A、AAC 或 OGG 音频');
  const url = URL.createObjectURL(file), audio = document.createElement('audio');
  audio.preload = 'auto';
  try {
    await new Promise((resolve, reject) => {
      let completed = false;
      const cleanup = () => { clearTimeout(timeout); audio.removeEventListener('loadeddata', success); audio.removeEventListener('error', failure); };
      const finish = error => { if (completed) return; completed = true; cleanup(); error ? reject(error) : resolve(); };
      const success = () => finish();
      const failure = () => finish(Error('无法读取音频，请检查文件或转换格式后重试'));
      const timeout = setTimeout(() => finish(Error('读取音频超时，请重新选择')), 15000);
      audio.addEventListener('loadeddata', success, {once: true});
      audio.addEventListener('error', failure, {once: true});
      audio.src = url; audio.load();
    });
    if (!Number.isFinite(audio.duration) || audio.duration <= 0) throw Error('无法读取音频时长，请重新选择');
    return {duration: audio.duration};
  } finally { audio.pause(); audio.removeAttribute('src'); audio.load(); URL.revokeObjectURL(url); }
}
