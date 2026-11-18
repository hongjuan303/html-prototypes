/* V2 is isolated from the V1 directory, storage and public deployment. */
const V2_CONFIG_KEY = 'juhui-agency-distribution-v2-config';
const V2_TYPES = [...TYPES, '海外本土-AI仿真人'];
const V2_CHANNELS = ['微信视频号', '微信小程序', '字节系', '拼多多', '快手', '优酷视频', ...CHANNELS.slice(1)];
const V2_QUALITY_CHANNELS = [...CHANNELS, '仅微信视频号'];
const V2_ROLES = ['管理员', '内容质量评估', '商务负责人', '商务人员', '正片审核负责人', '正片审核人员', '渠道负责人', '渠道运营'];
const V2_TEMPLATE = '版权声明-多个版权方-（各个版权方出具-授权发行方）.docx';
const V2_REUSE_FIELDS = [
  ['synopsis', '剧集梗概'], ['extra-intro', '10字以内剧集简介'], ['extra-shortSynopsis', '100-200字剧集梗概'], ['extra-recommendation', '剧集推荐文案'], ['extra-tags', '剧集标签'],
  ['extra-paidEpisodes', '付费集数'], ['extra-duration', '平均单集时长'], ['extra-audience', '男女频'],
  ...[0, 1].flatMap(i => [['extra-actorName' + i, (i ? '女主' : '男主') + '真实姓名'], ['extra-roleName' + i, (i ? '女主' : '男主') + '角色名'], ['actorBio' + i, (i ? '女主' : '男主') + '简介'], ['extra-roleBio' + i, (i ? '女主' : '男主') + '角色简介']]),
  ['extra-company', '承制公司'], ['extra-producer', '制片人姓名'], ...[0, 1].flatMap(i => [['extra-crewName' + i, (i ? '编剧' : '导演') + '姓名'], ['extra-crewGender' + i, (i ? '编剧' : '导演') + '性别'], ['extra-crewBio' + i, (i ? '编剧' : '导演') + '简介']])
];
const V2_SAMPLE = { name: '演示正片.webm', url: './assets/demo-720p.webm', width: 1280, height: 720, duration: 1.896998 };
const v2Defaults = () => ({
  users: [
    { id: 'admin', name: '管理员兼商务', roles: ['管理员', '商务负责人'], channels: [], backup: false },
    { id: 'q-domestic', name: '国内质量评估员', roles: ['内容质量评估'], channels: ['国内渠道'], backup: false },
    { id: 'q-youtube', name: 'YouTube评估员', roles: ['内容质量评估'], channels: ['海外 YouTube'], backup: false },
    { id: 'q-tiktok', name: 'TikTok评估员', roles: ['内容质量评估'], channels: ['海外 TikTok 端原生', '海外 TT 小程序'], backup: false },
    { id: 'film-a', name: '正片审核员甲', roles: ['正片审核人员'], channels: [], backup: false },
    { id: 'film-b', name: '正片备选审核员', roles: ['正片审核人员'], channels: [], backup: true }
  ],
  suppliers: [
    { id: 's1', name: '星帆文化（演示）', business: 'admin', account: 'xingfan-demo', phone: '13800000001', password: 'DemoOnly123', managed: false, middleAccount: '', middlePassword: '' },
    { id: 's2', name: '光影文化（演示）', business: 'admin', account: 'guangying-demo', phone: '13800000002', password: 'DemoOnly123', managed: true, middleAccount: 'bytedance-demo', middlePassword: 'DemoOnly123' }
  ],
  channels: V2_CHANNELS.map((name, index) => ({ id: 'ch-' + index, name, market: CHANNELS.slice(1).includes(name) ? '海外' : '国内', active: true })),
  fields: [
    { key: 'screenshots', name: '物料截图文件', component: '图片上传', group: '合规文件', required: true, channels: ['*'], condition: '真人有合同', active: true },
    { key: 'copyright', name: '版权文件', component: '文件上传', group: '合规文件', required: true, channels: ['*'], condition: '真人有合同', active: true },
    { key: 'ai', name: '漫剧专项AI创作佐证材料', component: '图片上传', group: '合规文件', required: true, channels: ['*'], condition: '所有漫剧', active: true },
    { key: 'wx', name: '权利声明及不侵权承诺（微信模板）', component: '文件上传', group: '合规文件', required: true, channels: ['微信视频号'], condition: '全部类型', hint: '推荐提供拍照版本，扫描件容易被渠道驳回。', active: true },
    { key: 'youku', name: '优酷版权文件', component: '文件上传', group: '合规文件', required: true, channels: ['优酷视频'], condition: '横屏剧集', hint: '横屏剧集上线优酷需提供', template: V2_TEMPLATE, active: true }
  ],
  authorizationLimitMB: 100,
  authorizationTotalMB: 500,
  managedSkipFields: V2_REUSE_FIELDS.map(([key]) => key),
  managedRulesEnabled: true
});
let v2Config;
try { v2Config = JSON.parse(localStorage.getItem(V2_CONFIG_KEY)) || v2Defaults(); } catch { v2Config = v2Defaults(); }
if (!Number.isFinite(v2Config.authorizationLimitMB)) v2Config.authorizationLimitMB = 100;
if (!Number.isFinite(v2Config.authorizationTotalMB)) v2Config.authorizationTotalMB = 500;
if (!Object.hasOwn(v2Config, 'managedRulesEnabled')) { v2Config.managedRulesEnabled = true; v2Config.managedSkipFields = V2_REUSE_FIELDS.map(([key]) => key); }
const v2SaveConfig = () => localStorage.setItem(V2_CONFIG_KEY, JSON.stringify(v2Config));
const v2Supplier = r => r.onlineSnapshot ? { id: r.supplierId, name: r.supplier, managed: false } : { ...(v2Config.suppliers.find(s => s.id === r.supplierId || s.name === r.supplier) || v2Config.suppliers[0]), managed: false };
const v2User = id => v2Config.users.find(u => u.id === id);
const v2HasAuthorization = r => r.authorization?.some(file => file && (file.name || file.id));
const v2ReadyForSchedule = r => r.materialStatus === '通过' && r.filmStatus === '通过' && v2HasAuthorization(r);
const v2AwaitingSchedule = r => v2ReadyForSchedule(r) && ![STAGES[2], STAGES[3]].includes(r.stage);
const v2FlowStage = r => v2AwaitingSchedule(r) ? STAGES[1] : r.stage;
const v2LaunchTime = r => String(r?.launch || r?.supplierDate || '').trim().replace('T', ' ');
function v2SetLaunchTime(r, value) {
  r.launch = String(value || '').trim().replace('T', ' ');
  r.supplierDate = r.launch;
}
const v2FreeTime = r => String(r?.freeTime || (r && !r.onlineSnapshot && v2AwaitingSchedule(r) ? v2LaunchTime(r) : '')).trim().replace('T', ' ');
function v2SetSupplierLaunchTime(r, value) {
  const previousLaunch = v2LaunchTime(r), previousFree = String(r.freeTime || '').trim().replace('T', ' ');
  v2SetLaunchTime(r, value);
  if (!previousFree || previousFree === previousLaunch) r.freeTime = r.launch;
}
function v2SupplierDateInput(r) {
  const value = v2LaunchTime(r), timed = /[T ]\d{2}:\d{2}$/.test(value);
  return input('supplierDate', timed ? value.replace(' ', 'T') : value, '', timed ? 'datetime-local' : 'date', timed ? 'step="60"' : '') + '<span class="field-hint">转免时间默认与首发时间一致，无需另填。</span>';
}
syncBusiness = function (r) {
  if ([STAGES[2], STAGES[3]].includes(r.stage)) return;
  if (v2ReadyForSchedule(r)) {
    if (r.stage !== STAGES[1]) { r.stage = STAGES[1]; recordLog(r, '物料、正片审核通过且已有授权书，进入待排播确认'); }
  } else if (!r.stage && r.materialStatus === '通过' && r.filmStatus === '通过') {
    r.stage = STAGES[0]; recordLog(r, '物料和正片审核通过，待商务保存授权书');
  }
};
function v2ValidScheduleDate(value, requireTime = false) {
  const match = String(value || '').match(requireTime ? /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/ : /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}))?$/);
  if (!match) return false;
  const [, year, month, day, hour = 0, minute = 0] = match.map((v, i) => i ? Number(v || 0) : v);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day && hour < 24 && minute < 60;
}
function v2CompleteSchedule(r, launch, freeTime) {
  if (!v2ReadyForSchedule(r)) return false;
  const pending = v2AwaitingSchedule(r);
  v2SetLaunchTime(r, launch);
  if (freeTime !== undefined) r.freeTime = freeTime.replace('T', ' ');
  if (pending) r.stage = STAGES[2];
  recordLog(r, (pending ? '排播确认，流转至运营阶段；上线时间 ' : '更新上线时间 ') + r.launch + (r.freeTime ? '；转免时间 ' + r.freeTime : ''));
  return true;
}
const v2ActiveChannels = () => v2Config.channels.filter(c => c.active).map(c => c.name);
const v2Release = () => ['国内全渠道', '海外全渠道', ...v2ActiveChannels()];
const v2ChannelList = r => [...new Set(r.release.flatMap(c => ['国内全渠道', '海外全渠道'].includes(c) ? v2Config.channels.filter(item => item.active && (item.market || (CHANNELS.slice(1).includes(item.name) ? '海外' : '国内')) === (c === '国内全渠道' ? '国内' : '海外')).map(item => item.name) : [c]))];
const v2IsHuman = r => r.type.includes('真人实拍');
const v2IsComic = r => r.type.includes('漫剧');
const v2ContractVisible = r => !v2IsHuman(r) || v2ChannelList(r).includes('海外 TikTok 端原生');
const v2EffectiveContract = (r, channel) => v2IsHuman(r) && channel !== '海外 TikTok 端原生' ? '有' : r.contract;
function v2FieldsFor(r) {
  const selected = v2ChannelList(r.channelReworkMode ? { ...r, release: r.reworkChannels } : r);
  return v2Config.fields.filter(f => f.active && selected.some(c => (f.channels.includes('*') || f.channels.includes(c)) &&
    (f.condition === '全部类型' || f.condition === '所有漫剧' && v2IsComic(r) || f.condition === '真人有合同' && v2IsHuman(r) && v2EffectiveContract(r, c) === '有' || f.condition === '横屏剧集' && r.orientation === '横屏')));
}
function v2SourceText(r, key) { return v2Supplier(r).managed && v2Config.managedRulesEnabled && v2Config.managedSkipFields.includes(key) && !r.managedManual?.includes(key) ? String(r.managedSource?.[key] || '').trim() : ''; }
function v2ApplySource(r) { for (const [key] of V2_REUSE_FIELDS) { const value = v2SourceText(r, key); if (!value) continue; if (key.startsWith('extra-')) (r.materialExtras ||= {})[key.slice(6)] = value; else if (key.startsWith('actorBio')) (r.materialExtras ||= {})[key] = value; else r[key] = value; } }
function v2SourceHint(r, key) { if (!r.managedSource?.[key] || !v2Config.managedSkipFields.includes(key) || !v2Supplier(r).managed) return ''; return '<div class="field-hint">' + (v2SourceText(r, key) ? '已引用字节中台资料（示例） ' + act('改为手动填写', 'v2-managed-manual', key) : act('恢复引用中台资料', 'v2-managed-use', key)) + '</div>'; }
function v2MakeTasks(r) {
  return r.intent.flatMap(channel => v2Config.users.filter(u => u.roles.includes('内容质量评估') && u.channels.includes(channel)).map(u => ({ id: channel + ':' + u.id, channel, userId: u.id, result: '', opinion: '', time: '' })));
}
function v2QualityReady(r) {
  const tasks = r.qualityTasks || [];
  if (!tasks.length || r.intent.some(c => !tasks.some(t => t.channel === c))) return false;
  const domestic = tasks.filter(t => t.channel === '国内渠道');
  return tasks.every(t => t.result) || domestic.length > 0 && domestic.every(t => t.result);
}
function v2QualityStatus(r) {
  if (r.onlineSnapshot) return '未读取';
  if (r.qualityFinal?.result) return r.qualityFinal.result;
  if (r.quality === '通过' && !r.qualityTasks?.length) return '通过';
  return v2QualityReady(r) ? '待商务反馈' : '评估中';
}
function v2Episodes(count = 3) {
  return Array.from({ length: count }, (_, i) => ({ ...V2_SAMPLE, id: 'ep-' + (i + 1), index: i + 1, name: '第' + (i + 1) + '集.webm', version: 1, result: '', opinion: '' }));
}
function v2EnsureScheduleConfirmationCase() {
  if (records.some(r => r.demoScenario === 'supplier-time-schedule-confirm')) return;
  const record = newRecord(Math.max(1000, ...records.map(r => Number(r.id) || 0)) + 1, {
    name: '排播确认案例（演示）', supplierId: 's1', supplier: '星帆文化（演示）', episodes: 3,
    demoScenario: 'supplier-time-schedule-confirm', type: V2_TYPES[0], round: '首发', orientation: '横屏',
    intent: ['国内渠道'], release: ['微信视频号', '字节系'], quality: '通过', groups: ['通过', '通过', '通过'],
    qualityTasks: [], qualityHistory: [], qualityFinal: { result: '通过', opinion: '本地演示：内容已通过评估。', time: '2026-11-17 09:00' },
    filmStatus: '通过', materialStatus: '通过', stage: STAGES[1],
    authorization: [{ name: '演示授权记录（未附文件原件）', demo: true }],
    episodeFiles: v2Episodes().map(e => ({ ...e, result: '通过' })),
    channelReturns: {}, channelMaterialReturns: {}, customMaterials: {},
    assignment: { 微信视频号: '视频号运营', 字节系: '字节系运营' }
  });
  v2SetSupplierLaunchTime(record, '2026-11-20 10:00');
  recordLog(record, '本地演示：供应商已填写首发时间，上线时间、默认转免时间均为2026-11-20 10:00');
  recordLog(record, '本地演示：正片、物料审核通过且已有授权记录，待排播上线负责人确认');
  records.unshift(record);
}
function v2Seed() {
  const base = (id, name, fields = {}) => newRecord(id, { name, supplierId: 's1', supplier: '星帆文化（演示）', episodes: 3,
    intent: ['国内渠道', '海外 YouTube'], exclude: [], type: V2_TYPES[0], round: '首发', intro: '一段关于归途与重逢的故事。', youtubeFirst: '是',
    orientation: '横屏', release: ['微信视频号', '字节系', '优酷视频'], quality: '通过', groups: ['通过', '通过', '通过'],
    qualityFinal: { result: '通过', opinion: '内容题材符合本次引入方向。', time: '2026-11-12 09:00', actor: '管理员兼商务' },
    qualityTasks: [], qualityHistory: [], episodeFiles: [], channelReturns: {}, customMaterials: {}, filmReviewer: 'film-a', ...fields });
  const a = base(201, '星河来信', { quality: '待评估', qualityFinal: null, groups: ['', '', ''] }); a.qualityTasks = v2MakeTasks(a);
  const b = base(202, '山海之间', { quality: '待评估', qualityFinal: null, groups: ['', '', ''] }); b.qualityTasks = v2MakeTasks(b); b.qualityTasks.filter(t => t.channel === '国内渠道').forEach(t => Object.assign(t, { result: '通过', opinion: '国内题材适配，可引入。', time: '2026-11-12 09:30' }));
  const c = base(203, '风起长街', { groups: ['', '', ''], exclude: ['不含字节系（红果和抖音）'] });
  const d = base(204, '春日归途', { filmStatus: '审核中', episodeFiles: v2Episodes(), filmRound: { number: 1, ids: ['ep-1', 'ep-2', 'ep-3'], kind: '初审' } });
  const e = base(205, '月色入怀', { filmStatus: '通过', episodeFiles: v2Episodes() });
  const f = base(206, '旧巷新声', { filmStatus: '通过', materialStatus: '通过', stage: STAGES[0], episodeFiles: v2Episodes() });
  const g = base(207, '向光而行', { filmStatus: '通过', materialStatus: '通过', stage: STAGES[2], launch: '2026-11-20 18:30', freeTime: '2026-11-27 10:00', authorization: [{ name: '发行授权书（示例）.pdf' }], episodeFiles: v2Episodes(), assignment: { 微信视频号: '视频号运营', 字节系: '字节系运营', 优酷视频: '优酷运营' }, wechat: { status: '未送审', time: '' } });
  const h = base(208, '光影日记', { supplierId: 's2', supplier: '光影文化（演示）', filmStatus: '通过', materialStatus: '通过', stage: STAGES[2], launch: '2026-11-21 19:00', episodeFiles: v2Episodes(), assignment: { 字节系: '字节系运营', 微信视频号: '视频号运营', 优酷视频: '优酷运营' }, qualityTasks: [], qualityFinal: { result: '通过', opinion: '代运营供应商跳过内容质量评估。', time: now() } });
  h.managedSource = { 'extra-intro': '光影里的温暖日常', synopsis: '示例已同步梗概：以城市中的小小重逢串联一段温暖故事。', actorBio0: '示例已同步男主简介。', actorBio1: '示例已同步女主简介。', 'extra-company': '光影示例制作公司' };
  const i = base(209, '光影新章', { supplierId: 's2', supplier: '光影文化（演示）', filmStatus: '通过', episodeFiles: v2Episodes(), managedSource: { ...h.managedSource } });
  return [a, b, c, d, e, f, g];
}
if (!localStorage.getItem(STORE)) { records = v2Seed(); records.filter(r => r.filmStatus === '通过').forEach(r => r.episodeFiles.forEach(e => e.result = '通过')); }
records.forEach(r => { r.qualityTasks ||= []; r.qualityHistory ||= []; r.episodeFiles ||= []; r.channelReturns ||= {}; r.channelMaterialReturns ||= {}; r.customMaterials ||= {}; r.release = r.release.map(c => c === 1 || c === '1' ? '国内全渠道' : c); });

const v2FileDb = new Promise((resolve, reject) => {
  const req = indexedDB.open('juhui-agency-distribution-v2-files', 1);
  req.onupgradeneeded = () => req.result.createObjectStore('files');
  req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error);
});
async function v2Remember(file, extra = {}) {
  const id = crypto.randomUUID(), meta = { id, name: file.name, size: file.size, type: file.type, ...extra };
  const db = await v2FileDb;
  await new Promise((resolve, reject) => { const tx = db.transaction('files', 'readwrite'); tx.objectStore('files').put(file, id); tx.oncomplete = resolve; tx.onerror = () => reject(tx.error); });
  attachments.set(id, { url: URL.createObjectURL(file), type: file.type });
  return meta;
}
async function v2File(meta) {
  if (meta.url) return fetch(meta.url).then(r => { if (!r.ok) throw Error('文件暂不可用'); return r.blob(); }).then(b => new File([b], meta.name, { type: b.type }));
  if (!meta.id) throw Error('此历史记录未附文件原件');
  const db = await v2FileDb;
  return new Promise((resolve, reject) => { const req = db.transaction('files').objectStore('files').get(meta.id); req.onsuccess = () => req.result ? resolve(req.result) : reject(Error('文件原件不可用，请重新上传')); req.onerror = () => reject(req.error); });
}
async function v2Download(meta) {
  const popup = window.open('./download.html', '_blank');
  if (!popup) { announce('请允许打开下载窗口后重试'); return; }
  try { await v2File(meta); popup.location.replace('./download.html#' + encodeURIComponent(JSON.stringify(meta))); } catch (e) { popup.close(); announce(e.message); }
}
async function v2VideoMetadata(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video'), url = URL.createObjectURL(file);
    const timer = setTimeout(() => { URL.revokeObjectURL(url); reject(Error('无法读取视频信息，请更换文件')); }, 12000);
    video.preload = 'metadata'; video.src = url;
    video.onloadedmetadata = () => { clearTimeout(timer); URL.revokeObjectURL(url); const { videoWidth: width, videoHeight: height, duration } = video;
      if (!Number.isFinite(duration) || !width || !height) reject(Error('无法读取视频尺寸或时长'));
      else if (Math.min(width, height) < 720) reject(Error(file.name + '：视频短边需至少720像素，当前' + width + '×' + height));
      else resolve({ width, height, duration }); };
    video.onerror = () => { clearTimeout(timer); URL.revokeObjectURL(url); reject(Error(file.name + '：文件无法识别为可播放视频')); };
  });
}
function v2Duration(seconds = 0) { const s = Math.round(seconds); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
function v2RoundDuration(r) { const ids = r.filmRound?.ids || r.episodeFiles.map(e => e.id); return r.episodeFiles.filter(e => ids.includes(e.id)).reduce((sum, e) => sum + e.duration, 0); }
function v2Flatten(value, prefix = '', result = {}) {
  if (!prefix && Object.hasOwn(value, 'supplierDate')) value = { ...value, launch: v2LaunchTime(value), freeTime: v2FreeTime(value) };
  Object.entries(value).forEach(([key, item]) => { const k = prefix ? prefix + '.' + key : key;
    if (!prefix && key === 'supplierDate') return;
    if (item && typeof item === 'object' && !Array.isArray(item)) v2Flatten(item, k, result);
    else result[k] = Array.isArray(item) ? JSON.stringify(item) : item ?? ''; });
  return result;
}
function v2Csv(items) {
  const rows = items.map(item => v2Flatten(item)), headers = [...new Set(rows.flatMap(Object.keys))];
  const cell = v => '"' + String(v ?? '').replace(/^[=+@-]/, "'$&").replace(/"/g, '""') + '"';
  return '\uFEFF' + [headers, ...rows.map(row => headers.map(h => row[h]))].map(row => row.map(cell).join(',')).join('\r\n');
}
async function v2Zip(files) {
  const bytes = [], central = []; let offset = 0;
  const encoder = new TextEncoder();
  const crcTable = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ c >>> 1 : c >>> 1; return c >>> 0; });
  const crc = b => { let c = 0xffffffff; for (const n of b) c = crcTable[(c ^ n) & 255] ^ c >>> 8; return (c ^ 0xffffffff) >>> 0; };
  const header = (size, values) => { const b = new Uint8Array(size), view = new DataView(b.buffer); values.forEach(([at, value, width]) => width === 2 ? view.setUint16(at, value, true) : view.setUint32(at, value, true)); return b; };
  for (const { name, blob } of files) {
    const data = new Uint8Array(await blob.arrayBuffer()), fileName = encoder.encode(name), checksum = crc(data);
    const local = header(30, [[0,0x04034b50,4],[4,20,2],[6,0x800,2],[14,checksum,4],[18,data.length,4],[22,data.length,4],[26,fileName.length,2]]);
    const entry = header(46, [[0,0x02014b50,4],[4,20,2],[6,20,2],[8,0x800,2],[16,checksum,4],[20,data.length,4],[24,data.length,4],[28,fileName.length,2],[42,offset,4]]);
    bytes.push(local, fileName, data); central.push(entry, fileName); offset += local.length + fileName.length + data.length;
  }
  const centralSize = central.reduce((n, b) => n + b.length, 0);
  const end = header(22, [[0,0x06054b50,4],[8,files.length,2],[10,files.length,2],[12,centralSize,4],[16,offset,4]]);
  return new Blob([...bytes, ...central, end], { type: 'application/zip' });
}
