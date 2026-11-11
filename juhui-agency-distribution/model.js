const CHANNELS = ['国内渠道', '海外 YouTube', '海外 TikTok 端原生', '海外 TT 小程序'];
const EXCLUSIONS = ['不含字节系（红果和抖音）', '不含拼多多', '不含微信视频号'];
const RELEASE = ['国内全渠道', '微信视频号', '微信小程序', '字节系', '拼多多', '快手', ...CHANNELS.slice(1)];
const TYPES = ['国内漫剧（AI真人剧集、沙雕漫、3D、2D漫）', '国内真人剧（真人实拍）', '海外本土漫剧（AI真人剧集、沙雕漫、3D、2D漫）', '海外本土真人剧（真人实拍）'];
const GROUPS = ['审核组评估', '红果评估', '运营评估'];
const STAGES = ['待授权书', '待排播确认', '待发行', '已发行'];
const WECHAT = ['已送审', '未送审', '无权益'];
const REVIEW_CHANNELS = ['微信视频号', '微信小程序', '字节系', '快手'];
const STORE = 'juhui-agency-distribution-v1';
const attachments = new Map();

function now() {
  const utc = new Date(Date.now() + 8 * 3600000);
  return utc.toISOString().slice(0, 16).replace('T', ' ');
}

function bSkipped(record) {
  return record.intent.includes(CHANNELS[0]) && record.exclude.includes(EXCLUSIONS[0]);
}

function groupStatus(record, index) {
  return index === 1 && bSkipped(record) ? '无需评估' : record.groups[index] || '待评估';
}

function combined(record) {
  if (record.quality !== '通过') return '待内容质量评估';
  const results = GROUPS.map((_, index) => groupStatus(record, index));
  if (results.includes('驳回')) return '驳回';
  return results.every(result => ['通过', '无需评估'].includes(result)) ? '通过' : '审核中';
}

function needsAI(record) {
  return record.type === TYPES[0] || record.type === TYPES[2];
}

function needsWechat(record) {
  return record.release.some(channel => ['国内全渠道', '微信视频号'].includes(channel));
}

function channelsFor(record) {
  return [...new Set(record.release.flatMap(channel => channel === '国内全渠道' ? REVIEW_CHANNELS : [channel]))];
}

function issuanceStatus(record) {
  return [STAGES[2], STAGES[3]].includes(record.stage) ? record.stage : '待生成';
}

function newRecord(id, fields = {}) {
  return {
    id, name: '', supplier: '星帆文化（演示）', episodes: 24, link: 'https://example.com/preview',
    submitted: now(), intent: [], exclude: [], quality: '待评估', groups: ['', '', ''], reviews: [],
    type: TYPES[0], round: '首发', release: ['国内全渠道'], contract: '无',
    synopsis: '', partner: '', contact: '周商务', supplierDate: '', materials: {}, materialStatus: '待提交',
    filmStatus: '待提交', film: null, authorization: [], launch: '', freeTime: '', stage: '', assignment: {},
    wechat: null, wechatHistory: [], logs: [], ...fields
  };
}

function seedData() {
  return [
    newRecord(106, {
      name: '长街灯影', episodes: 32, submitted: '2026-11-10 10:25', intent: [CHANNELS[0], CHANNELS[1]],
      exclude: [EXCLUSIONS[0]], quality: '通过', groups: ['通过', '', ''], release: ['微信视频号']
    }),
    newRecord(105, {
      name: '海岸来信', episodes: 24, submitted: '2026-11-09 15:40', intent: [CHANNELS[0]],
      quality: '通过', groups: ['通过', '通过', '通过'], release: ['微信视频号'],
      filmStatus: '通过', partner: '星帆文化（演示）', synopsis: '一封寄错的来信，让离乡多年的少女重新认识故乡。',
      supplierDate: '2026-11-21'
    }),
    newRecord(104, {
      name: '山雨初晴', episodes: 28, submitted: '2026-11-08 14:12', quality: '通过',
      groups: ['通过', '通过', '通过'], release: ['微信视频号', '微信小程序', '字节系', '快手'],
      materialStatus: '通过', filmStatus: '通过', stage: STAGES[0], supplierDate: '2026-11-20',
      materials: { ai: [{ name: '创作过程佐证.jpg' }], wx: [{ name: '微信权利声明.pdf' }] }
    }),
    newRecord(103, {
      name: '月落归途', episodes: 30, submitted: '2026-11-07 13:10', quality: '通过',
      groups: ['通过', '通过', '通过'], release: ['微信视频号', '微信小程序', '字节系', '快手'],
      materialStatus: '通过', filmStatus: '通过', stage: STAGES[2], launch: '2026-11-19 19:30',
      authorization: [{ name: '发行授权书.pdf' }],
      assignment: { 微信视频号: '视频号运营', 微信小程序: '小程序运营', 字节系: '字节系运营', 快手: '快手运营' },
      wechat: { status: '未送审', time: '' }
    }),
    newRecord(102, {
      name: '雾中花信', episodes: 36, submitted: '2026-11-04 09:20', quality: '通过',
      groups: ['通过', '通过', '通过'], release: ['微信视频号', '微信小程序', '字节系'],
      materialStatus: '通过', filmStatus: '通过', stage: STAGES[3], launch: '2026-11-09',
      authorization: [{ name: '发行授权书.pdf' }]
    })
  ];
}

function readData() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE) || 'null');
    if (Array.isArray(data) && data.length) return data;
  } catch {}
  return seedData();
}

function persist() {
  try { localStorage.setItem(STORE, JSON.stringify(records)); } catch {}
}

function rememberFile(file) {
  const id = crypto.randomUUID();
  attachments.set(id, { url: URL.createObjectURL(file), type: file.type });
  return { id, name: file.name };
}

function recordLog(record, text) {
  record.logs.unshift({ time: now(), text });
}

function syncBusiness(record) {
  if (!record.stage && record.materialStatus === '通过' && record.filmStatus === '通过') {
    record.stage = STAGES[0];
    recordLog(record, '物料和正片审核通过，进入待授权书');
  }
}

let records = readData();
