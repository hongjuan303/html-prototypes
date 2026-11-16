// V1：11.13 更新。渠道改动按渠道保存，附件原名与原件独立留存。
const attachmentWrites = new Map();
let attachmentDb;
function fileDb() {
  return attachmentDb ||= new Promise((resolve, reject) => {
    const req = indexedDB.open('juhui-agency-distribution-v1-files', 1);
    req.onupgradeneeded = () => req.result.createObjectStore('files');
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(Error('附件保存失败，请重试。'));
  });
}
function storeOriginal(file, id) {
  const pending = fileDb().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction('files', 'readwrite');
    tx.objectStore('files').put(file, id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(Error('附件保存失败，请重试。'));
  }));
  attachmentWrites.set(id, pending);
  pending.catch(() => {});
}
async function waitForFiles() { await Promise.all(attachmentWrites.values()); }
const attachmentName = file => file?.originalName || file?.name || '未记录文件名';
async function restoreAttachment(file) {
  if (attachments.has(file.id)) return attachments.get(file.id);
  if (file.url && /^(https?:|\.\/)/.test(file.url)) return { url: file.url, type: file.type || '' };
  if (!file.id) return null;
  const db = await fileDb();
  const blob = await new Promise((resolve, reject) => {
    const req = db.transaction('files').objectStore('files').get(file.id);
    req.onsuccess = () => resolve(req.result);
    req.onerror = reject;
  });
  if (!blob) return null;
  const value = { url: URL.createObjectURL(blob), type: blob.type };
  attachments.set(file.id, value);
  return value;
}
const rejected = status => ['拒绝', '驳回'].includes(status);
const isReviewRework = r => rejected(r.materialStatus) || rejected(r.filmStatus);
const channelVersion = (r, channel) => r.channelVersions?.[channel] || {};
const channelTitle = (r, channel) => channelVersion(r, channel).name || r.name;
const channelEpisodes = (r, channel) => channelVersion(r, channel).episodes ?? r.episodes;
const videosFor = (r, channel) => (channel ? channelVersion(r, channel).videos : null) ?? r.episodeVideos ?? (r.film ? [r.film] : []);
function countError(episodes, videos) {
  if (!Number.isInteger(Number(episodes)) || Number(episodes) < 1) return '集数须为大于0的整数，请重新修改。';
  return Number(episodes) !== videos.length ? '集数为 ' + episodes + ' 集，已上传 ' + videos.length + ' 个视频，数量不一致，请重新修改集数或上传视频。' : '';
}
function canRework(r, channel) {
  return r && (channel ? channelsFor(r).includes(channel) && rejected(channelVersion(r, channel).status) : !r.stage && isReviewRework(r));
}
function startRework(r, channel = '') {
  if (!canRework(r, channel)) return announce('当前审核状态不能编辑或提审。');
  const version = channelVersion(r, channel);
  const previous = ui.modal?.type === 'supplier-channels' ? structuredClone(ui.modal) : null;
  openModal('rework', r.id, {
    name: channel ? channelTitle(r, channel) : r.name,
    episodes: channel ? channelEpisodes(r, channel) : r.episodes,
    videos: structuredClone(videosFor(r, channel)),
    materials: structuredClone(channel ? version.materials || r.materials : r.materials)
  }, { channel, returnModal: previous });
}
function reworkDialog(modal) {
  const r = val(modal.id), d = modal.draft;
  const reason = modal.channel ? channelVersion(r, modal.channel).opinion : r.logs?.find(log => /拒绝|驳回/.test(log.text))?.text;
  const labels = { ai: '漫剧专项AI创作佐证材料', wx: '权利声明及不侵权承诺（微信模板）', copyright: '版权文件', paymentPromise: '片酬承诺书', screenshots: '物料截图文件', costReport: '真人短剧成本配置比例报告', actorPhoto0: '男主照片', actorPhoto1: '女主照片', actorStill0: '男主演剧照', actorStill1: '女主演剧照', crewPhoto0: '导演照片', crewPhoto1: '编剧照片', posterHorizontal: '横版剧集海报', posterVertical: '竖版剧集海报', wechatCost: '微信视频端成本配置文件', hippo: '河马专属权利声明+成本文件', redfruitRights: '权利声明及不侵权承诺函（红果模板）', alipay: '支付宝承诺函', kuaishou: '快手自建站授权书' };
  const keys = new Set([...Object.keys(d.materials), ...(needsAI(r) ? ['ai'] : []), ...(needsWechat(r) ? ['wx'] : [])]);
  return [modal.channel ? '编辑 · ' + modal.channel : '编辑/提审 · ' + r.name,
    (reason ? '<p class="rework-reason">驳回原因：' + esc(reason) + '</p>' : '') +
    '<div class="two-fields rework-fields"><div>' + formField('剧集名称', input('name', d.name, '请输入剧集名称', 'text', modal.channel ? 'required' : 'readonly'), true) + '</div><div>' +
    formField('集数', input('episodes', d.episodes, '请输入集数', 'number', 'required min="1" step="1"'), true) + '</div></div>' +
    '<h3 class="rework-heading">' + fieldName('正片视频') + ' ' + mark(1) + '</h3><p class="video-count">已上传 ' + d.videos.length + ' 个视频；提交时须与集数一致。</p>' +
    uploader('rework-videos', '上传分集视频', 'video/*', d.videos, '支持多选；同名文件再次上传时替换原文件') +
    (keys.size ? '<h3 class="rework-heading">物料文件</h3>' + [...keys].map(key => '<div class="rework-file-field"><strong>' + esc(labels[key] || '物料附件') + '</strong>' +
      uploader('rework-' + key, '上传文件', key === 'ai' || key === 'screenshots' ? 'image/*,.pdf' : /Photo|Still|poster/.test(key) ? 'image/*,.psd' : '.pdf', d.materials[key], '保留文件原名') + '</div>').join('') : ''),
    '提交审核', 2];
}
async function saveRework() {
  const modal = ui.modal, r = val(modal.id), d = structuredClone(modal.draft);
  if (!canRework(r, modal.channel)) return error('审核状态已变化，请关闭后重新查看。');
  const name = String(d.name).trim();
  if (!name) return error('请填写剧集名称。');
  const invalid = countError(d.episodes, d.videos);
  if (invalid) return error(invalid);
  if (needsAI(r) && !d.materials.ai?.length) return error('请补齐漫剧专项AI创作佐证材料。');
  if (needsWechat(r) && !d.materials.wx?.length) return error('请补齐权利声明及不侵权承诺（微信模板）。');
  try { await waitForFiles(); } catch (e) { return error(e.message); }
  if (ui.modal !== modal || !canRework(r, modal.channel)) return;
  if (modal.channel) {
    const previous = structuredClone(channelVersion(r, modal.channel));
    (r.channelEditHistory ||= []).unshift({ channel: modal.channel, ...previous, savedAt: now() });
    (r.channelVersions ||= {})[modal.channel] = { ...previous, name, episodes: Number(d.episodes), videos: structuredClone(d.videos), materials: structuredClone(d.materials), status: '审核中', submitted: now() };
    recordLog(r, modal.channel + '重新提审：' + name + '，' + d.episodes + '集');
  } else {
    const videosChanged = JSON.stringify(videosFor(r)) !== JSON.stringify(d.videos) || r.episodes !== Number(d.episodes);
    (r.reworkHistory ||= []).unshift({ episodes: r.episodes, videos: structuredClone(videosFor(r)), materials: structuredClone(r.materials), time: now() });
    r.episodes = Number(d.episodes); r.episodeVideos = structuredClone(d.videos); r.film = r.episodeVideos[0] || null; r.materials = structuredClone(d.materials);
    if (rejected(r.materialStatus)) r.materialStatus = '审核中';
    if (rejected(r.filmStatus) || videosChanged) r.filmStatus = '审核中';
    r.submitted = now();
    recordLog(r, '供应商重新提审，集数与' + r.episodeVideos.length + '个视频一致');
  }
  persist(); ui.modal = null; render(); announce('已提交审核');
}
function supplierChannels(r) {
  const rows = channelsFor(r).map(channel => line(esc(channel), esc(channelTitle(r, channel)), esc(channelEpisodes(r, channel)) + ' 集', tag(channelVersion(r, channel).status || (r.stage === STAGES[3] ? '已上线' : '待处理')), esc(channelVersion(r, channel).opinion || '—'),
    canRework(r, channel) ? act('编辑', 'channel-rework', channel) : '—'));
  return ['渠道明细 · ' + r.name, table(['渠道', '剧集名称', '集数', '审核状态', '驳回原因', '操作 ' + mark(2)], rows, { key: 'supplier-channels' }) + '<div class="rework-note">' + mark(1) + ' 各渠道分别记录剧名、集数及提审资料。</div>'];
}
function fullDownloadDialog(modal) {
  const r = val(modal.id), files = videosFor(r, modal.channel);
  return ['下载全集', '<p class="download-lead">请使用迅雷下载全集</p><div class="download-folder"><span class="folder-shape" aria-hidden="true"></span><div><strong>' + esc(channelTitle(r, modal.channel)) + '</strong><p>共 ' + files.length + ' 个文件</p></div></div>' +
    (!files.length ? '<p class="muted">当前未获取到全集视频文件，请联系供应商补齐。</p>' : '') +
    '<div class="thunder-actions">' + act('安装迅雷 开始下载', 'thunder-install', '', 'btn primary') + act('已有迅雷 开始下载', 'thunder-start', '', 'btn') + '</div><div class="rework-note">' + mark(1) + ' 如未唤起迅雷，请确认已安装并允许浏览器打开应用。</div>'];
}
let thunderSdk;
function loadThunder() {
  if (window.thunderLink) return Promise.resolve(window.thunderLink);
  return thunderSdk ||= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://open.thunderurl.com/thunder-link.js';
    const timeout = setTimeout(() => { thunderSdk = null; script.remove(); reject(Error('下载服务暂不可用，请稍后重试。')); }, 10000);
    script.onload = () => { clearTimeout(timeout); window.thunderLink ? resolve(window.thunderLink) : (thunderSdk = null, reject(Error('下载服务暂不可用，请重试。'))); };
    script.onerror = () => { clearTimeout(timeout); thunderSdk = null; script.remove(); reject(Error('下载服务暂不可用，请重试。')); };
    document.head.append(script);
  });
}
async function startThunder() {
  const modal = ui.modal;
  if (modal?.type !== 'full-download') return;
  const r = val(modal.id), files = videosFor(r, modal.channel);
  if (!files.length) return error('暂无可下载的正片文件。');
  const tasks = files.map(file => {
    const source = file.downloadUrl || file.url;
    if (!source || !/^(https?:\/\/|\.\/)/i.test(source)) return null;
    return { url: new URL(source, location.href).href, name: attachmentName(file), ...(file.size ? { size: file.size } : {}) };
  });
  if (tasks.some(task => !task)) return error('部分视频缺少有效下载链接，请联系供应商补齐后重试。');
  try {
    const sdk = await loadThunder();
    if (ui.modal !== modal) return;
    sdk.newTask({ taskGroupName: channelTitle(r, modal.channel), tasks });
    announce('已请求迅雷打开下载任务，请在迅雷中确认。');
  } catch (e) { if (ui.modal === modal) error(e.message); }
}
function reworkSamples() {
  const videos = () => [1, 2, 3].map(i => ({ name: '第' + i + '集 演示视频.webm', originalName: '第' + i + '集 演示视频.webm', url: './assets/demo-720p.webm', type: 'video/webm' }));
  const base = (id, name, fields) => newRecord(id, { name, episodes: 3, quality: '通过', groups: ['通过', '通过', '通过'], intent: [CHANNELS[0]], release: ['微信视频号', '字节系'], materials: { ai: [{ name: 'AI创作佐证（演示）.pdf' }], wx: [{ name: '微信权利声明（演示）.pdf' }] }, episodeVideos: videos(), ...fields });
  return [
    base(11301, '11.13物料驳回示例', { materialStatus: '拒绝', filmStatus: '通过', logs: [{ time: now(), text: '物料审核拒绝 · 请核对集数并补齐材料' }] }),
    base(11302, '11.13正片驳回示例', { materialStatus: '通过', filmStatus: '驳回', logs: [{ time: now(), text: '正片审核驳回 · 请核对分集视频' }] }),
    base(11303, '11.13渠道驳回示例', { materialStatus: '通过', filmStatus: '通过', stage: STAGES[2], assignment: { 微信视频号: '视频号运营', 字节系: '字节系运营' }, channelVersions: { 微信视频号: { status: '驳回', opinion: '请调整本渠道剧名，并确认集数与正片一致。' } } })
  ];
}
