/* Fictional, deterministic product-demo data. No video or AI processing occurs here. */
import { resolveSource } from './sources.js?v=20260914-green';

export const DEFAULT_CONFIG = Object.freeze({
  mode: 'narrated', preset: 'short', start: 1, end: 30, count: 10,
  duration: '3-5', speed: 1.5, narrationSeconds: 15, language: 'zh',
  bgm: true, title: false, subtitles: true, position: 'intro', music: 'tension',
});

const episodeStories = [
  ['重返签约会', '林知夏重返陆氏，在签约会上被误认成助理。她坚持核对自己的项目合同。', '这份合同，我需要看一下附页。'],
  ['被换掉的附页', '陆承川质疑林知夏的资历。林知夏指出合同附页被人调换，要求当场核验。', '如果附页没有被换过，为什么签章的日期对不上？'],
  ['被拒绝的核验', '项目主管阻止核验合同。林知夏拿出留存邮件，陆承川决定暂缓签约。', '先别签。把她说的那封邮件调出来。'],
  ['旧项目的名字', '邮件中出现三年前的旧项目。林知夏承认自己曾参与设计，但不愿解释离开的原因。', '设计是我做的，离开也不是我的选择。'],
  ['迟到的证人', '旧项目同事来到陆氏，证明林知夏曾是主创。原本质疑她的人开始动摇。', '她的名字，本来就应该在主创名单里。'],
  ['第一轮反击', '林知夏要求恢复主创署名。项目主管提出公开比稿，想让她在众人面前失手。', '可以比。但评审规则，要先写清楚。'],
  ['比稿规则', '林知夏发现比稿规则对自己不利。陆承川同意公开评分，并让双方使用同一份需求。', '既然要比，就用同一套标准。'],
  ['被删掉的需求', '林知夏发现客户需求缺失一页。她重新联系客户，拿到完整需求，开始准备方案。', '客户要解决的问题，你们少写了最重要的一条。'],
  ['交稿前夜', '方案提交前，林知夏的演示文件无法打开。她拿出纸质底稿，决定直接讲解。', '文件可以坏，思路不会凭空消失。'],
  ['纸上的答案', '林知夏用纸质底稿完成提案，指出对手方案的关键漏洞。评审要求进一步核对原始设计。', '我可以解释每一条线，为什么画在这里。'],
  ['原始设计', '原始设计文件证明林知夏更早完成方案。陆承川询问她三年前为何没有申诉。', '当时我说过，只是没有人愿意听。'],
  ['未送达的申诉', '林知夏拿出当年的申诉记录。陆承川发现申诉没有进入正式流程，开始追查经手人。', '这封申诉，为什么没有送到我这里？'],
  ['重新立项', '陆承川同意重新立项，并邀请林知夏负责设计。林知夏要求先公开确认旧项目的责任。', '新的合作可以谈，旧的事情必须先说清楚。'],
  ['责任归属', '旧项目的审批记录出现矛盾。林知夏逐页核验，找到一份被替换过的预算说明。', '数字没有变，可这段用途说明被改过。'],
  ['预算疑点', '预算说明指向一笔异常支出。陆承川决定暂停付款，项目主管却催促按时执行。', '在这笔钱查清之前，付款先停下来。'],
  ['被追问的支出', '项目主管无法解释异常支出。林知夏发现收款方与旧项目曾有合作，需要继续核查。', '同一个名字，怎么又出现在这份账上？'],
  ['旧记录重现', '林知夏找回旧项目的会议记录，确认有人曾要求修改验收标准。陆承川要求复核验收。', '验收标准是谁改的，就请谁来解释。'],
  ['复核现场', '复核现场暴露出旧方案的问题。林知夏拿出原版设计，证明自己曾提前提示风险。', '这不是今天才出现的问题，我当时就标出来了。'],
  ['撤回的指控', '项目组撤回对林知夏设计失误的指控。她仍要求公开更正，不接受私下和解。', '误会发生在所有人面前，更正也应该是。'],
  ['公开更正', '陆氏公开更正旧项目说明，恢复林知夏署名。陆承川为未及时核查向她道歉。', '这一次，我会把完整的事实说清楚。'],
  ['新的合作条件', '陆承川邀请林知夏继续合作。林知夏提出独立评审、署名透明和完整留档三个条件。', '合作可以继续，但规则必须重新定。'],
  ['独立工作室', '林知夏以独立工作室负责人身份参加谈判。陆承川意识到她早已建立自己的团队。', '今天我代表自己的工作室，来谈这份合作。'],
  ['王牌提案', '林知夏提交新项目的核心提案。客户认可方案，却要求她说明短时间内如何落地。', '方向我们认可。现在，请讲讲怎么做到。'],
  ['落地计划', '林知夏展示分阶段实施计划，并预留风险缓冲。陆承川支持方案，评审进入最后一轮。', '每一步谁负责、什么时候验收，都在这里。'],
  ['最后一轮质疑', '评审质疑林知夏团队规模。她邀请关键成员远程说明分工，用既往交付记录回应。', '团队有多大，不如先看看我们做成了什么。'],
  ['关键成员上线', '关键成员逐一说明履历和分工。客户确认林知夏有能力独立交付，准备进入合同阶段。', '方案负责人是我，交付责任也由我承担。'],
  ['合作名单', '合作名单出现未经确认的供应商。林知夏坚持重新审核，不肯为了签约速度放松标准。', '名字可以晚一点签，审核不能少一步。'],
  ['签约前的审核', '审核发现供应商资料存在遗漏。陆承川支持林知夏延后签约，要求对方补齐证据。', '这次，我们等资料齐了再签。'],
  ['重回聚光灯', '资料核验完成，林知夏以主创与合作方身份回到签约现场。曾经的质疑让位于认可。', '这次，我的名字就在它应该在的位置。'],
  ['未揭晓的来信', '签约结束，林知夏收到一封有关旧项目的新邮件。她与陆承川意识到仍有线索未被查清。', '先别关掉邮件。这个附件，我们还没有看过。'],
];

const episodeResponses = [
  ['你为什么一定要看附页？', '因为我记得，原来的合同不是这样。'],
  ['把原件拿过来，当场核对。', '核对完以后，我还想问一个问题。'],
  ['邮件在这里，附件也有完整记录。', '签约先暂停，我要看完这份记录。'],
  ['三年前，你为什么离开？', '要说清那件事，就得从这份设计开始。'],
  ['你能证明她是主创吗？', '当年的底稿，大家都见过。'],
  ['公开比稿，你敢不敢接？', '我接受。先把规则拿来。'],
  ['评分过程也要公开。', '好，我会让双方拿到同一份需求。'],
  ['这一页，原来没有交给你吗？', '现在有完整需求了，我们可以开始。'],
  ['没有演示文件，你怎么讲？', '请给我一块白板。'],
  ['这和提交的方案不一样。', '所以，我希望你们查一下原始文件。'],
  ['文件时间说明什么？', '说明这份设计，比你们看到的版本更早。'],
  ['经手记录里没有你的名字。', '那就查一查，这份记录由谁接收。'],
  ['先把新项目做起来，不可以吗？', '旧的责任没有说清，新合作就没有基础。'],
  ['说明改了，会有什么影响？', '这决定了那笔预算，究竟应该用在哪里。'],
  ['现在停款，会影响进度。', '查清用途，比抢这几天进度更重要。'],
  ['你认识这家收款单位？', '我在旧项目的记录里见过它。'],
  ['会议上真的提过这项修改？', '记录里写得很清楚，请把下一页翻开。'],
  ['你当时提醒过风险？', '原版上有标注，日期也在。'],
  ['指控已经撤回，还需要做什么？', '请把更正写进正式说明。'],
  ['这份署名，更正回来了。', '谢谢。接下来的合作，我们按新规则谈。'],
  ['这三个条件，缺一不可？', '对。责任清楚，合作才能走得长。'],
  ['这家工作室，是你的？', '是我的，也是我的团队一起建立的。'],
  ['你们准备了多长时间？', '时间花在哪里，实施计划会告诉你。'],
  ['如果中途出现问题呢？', '每个阶段都有检查点，也有调整余量。'],
  ['这么小的团队，能保证交付吗？', '让负责交付的人，亲自回答你。'],
  ['每个人的职责都已经确认？', '确认了，节点和责任写进合同。'],
  ['供应商已经在名单里了。', '列进名单，不等于通过审核。'],
  ['一定要等资料补齐？', '一定。这是我们开始合作时定下的规则。'],
  ['这次，大家都在等你签字。', '我先确认最后一页。'],
  ['旧项目不是已经查清了吗？', '也许，还有一页我们没有看到。'],
];

export const EPISODES = Object.freeze(episodeStories.map(([name, story, dialogue], index) => Object.freeze({
  id: index + 1, name: `第 ${index + 1} 集 · ${name}`, title: name,
  duration: 180, story, dialogue, dialogues: Object.freeze([dialogue, ...episodeResponses[index]]),
  drama: '重逢时，她已是王牌', simulated: true,
})));

export function getEpisodes(config = {}) {
  const source = resolveSource(config);
  if (!source) return [];
  return source.availableEpisodes.map(id => {
    const episode = EPISODES[(id - 1) % EPISODES.length];
    return {...episode, id, name: `第 ${id} 集 · ${episode.title}`, drama: source.title,
      sourceMarket: source.market, sourceCollectionId: source.collectionId};
  });
}

export const PRESETS = Object.freeze([
  {id: 'original', name: '原片高光', description: '保留原声对白，紧凑推进剧情', config: {...DEFAULT_CONFIG, mode: 'original', preset: 'original', count: 5, speed: 1.2, narrationSeconds: 0, bgm: false}},
  {id: 'short', name: '短解说引入', description: '15 秒解说开场，接入完整原片对白', config: {...DEFAULT_CONFIG}},
  {id: 'story', name: '剧情解说组合', description: '30 秒解说穿插，原片保持 1.5 倍速', config: {...DEFAULT_CONFIG, preset: 'story', count: 20, duration: '5-7', narrationSeconds: 30, position: 'middle'}},
]);

export const DURATION_RANGES = Object.freeze({
  '1': [50, 70], '3': [150, 210], '5': [270, 330], '10': [540, 660],
  '3-5': [180, 300], '5-7': [300, 420],
});

const round = value => Math.round(value * 1000) / 1000;
const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
const numberOrDefault = (value, fallback) => value === undefined || value === null || value === '' ? fallback : Number(value);

export function normalizeConfig(config = {}) {
  const normalized = {...DEFAULT_CONFIG, ...config};
  for (const key of ['start', 'end', 'count', 'speed', 'narrationSeconds']) {
    normalized[key] = numberOrDefault(config[key], DEFAULT_CONFIG[key]);
  }
  normalized.duration = String(normalized.duration);
  for (const key of ['bgm', 'title', 'subtitles']) {
    normalized[key] = normalized[key] === 'false' ? false : Boolean(normalized[key]);
  }
  if (normalized.mode === 'original') normalized.narrationSeconds = 0;
  return normalized;
}

export function validateConfig(config = {}) {
  const c = normalizeConfig(config);
  const errors = [];
  const source = resolveSource(c);
  if (!['original', 'narrated'].includes(c.mode)) errors.push('请选择原片混剪或 AI 解说 + 原片。');
  if (!source) {
    errors.push('片源已失效，请重新选择国内短剧或海外短剧的合集。');
  } else if (!source.availableEpisodes.length) {
    errors.push('当前合集暂无可用剧集，请更换合集或等待片源准备完成。');
  } else if (!Number.isInteger(c.start) || !Number.isInteger(c.end) || c.start < 1 || c.end > source.totalEpisodes || c.start > c.end) {
    errors.push(`请选择第 1–${source.totalEpisodes} 集内的有效范围，起始集不能大于结束集。`);
  } else {
    const availableIds = new Set(source.availableEpisodes);
    const missing = Array.from({length: c.end - c.start + 1}, (_, index) => c.start + index).filter(id => !availableIds.has(id));
    if (missing.length) errors.push(`所选范围内第 ${missing.join('、')} 集暂不可用，请调整选集范围。`);
  }
  if (!Number.isInteger(c.count) || c.count < 1 || c.count > 20) errors.push('每批支持生成 1–20 条，请调整生成条数。');
  if (![1, 1.1, 1.2, 1.5].includes(c.speed)) errors.push('原片速度请选择 1、1.1、1.2 或 1.5 倍。');
  if (!own(DURATION_RANGES, c.duration)) errors.push('请选择有效的成片时长。');
  if (c.mode === 'narrated' && (!Number.isFinite(c.narrationSeconds) || c.narrationSeconds < 5 || c.narrationSeconds > 120)) {
    errors.push('解说段长度需在 5–120 秒之间。');
  }
  if (!['intro', 'middle', 'interleaved'].includes(c.position)) errors.push('请选择前置引入或剧情间穿插。');
  if (errors.length === 0) {
    const [minimum, maximum] = DURATION_RANGES[c.duration];
    const available = getEpisodes(c).filter(episode => episode.id >= c.start && episode.id <= c.end).reduce((sum, episode) => sum + episode.duration, 0);
    if (c.narrationSeconds >= maximum - 15) errors.push('解说过长，当前成片时长无法保留足够原片；请缩短解说或增加成片时长。');
    if (available / c.speed + c.narrationSeconds < minimum) {
      errors.push(`所选原片按 ${c.speed} 倍速后不足 ${Math.ceil(minimum / 60)} 分钟，请增加集数、降低速度或缩短成片。`);
    }
  }
  return {ok: errors.length === 0, errors};
}

export function quote(config = {}) {
  const c = normalizeConfig(config);
  if (!Number.isInteger(c.count) || c.count < 1 || c.count > 20) throw new Error('报价条数必须为 1–20 的整数。');
  if (!['original', 'narrated'].includes(c.mode)) throw new Error('未知制作模式。');
  const unitPoints = c.mode === 'original' ? 30 : 60;
  return {unitPoints, totalPoints: unitPoints * c.count, unitYuan: unitPoints / 100, totalYuan: unitPoints * c.count / 100, pointsPerYuan: 100, illustrative: true};
}

function makeSourcePieces(episodes, requiredSeconds, outputIndex) {
  const available = episodes.reduce((sum, episode) => sum + episode.duration, 0);
  const spare = Math.max(0, available - requiredSeconds);
  // Vary openings while keeping every source interval in the selected range.
  const preferredOffset = (outputIndex * 263 + (outputIndex % 3) * 17) % Math.max(1, Math.floor(spare + 1));
  let offset = Math.min(preferredOffset, spare);
  let remaining = requiredSeconds;
  const pieces = [];
  for (const episode of episodes) {
    if (offset >= episode.duration) { offset -= episode.duration; continue; }
    let cursor = offset;
    offset = 0;
    while (remaining > 0.00001 && cursor < episode.duration - 0.00001) {
      let length = Math.min(84, remaining, episode.duration - cursor);
      // Avoid creating a tiny residual segment merely because of the display split.
      if (remaining > length && remaining - length < 12 && remaining <= episode.duration - cursor) length = remaining;
      pieces.push({episode, sourceStart: round(cursor), sourceEnd: round(cursor + length)});
      cursor += length;
      remaining -= length;
    }
    if (remaining <= 0.00001) break;
  }
  if (remaining > 0.01) throw new Error('所选集数无法提供足够原片时长。');
  return pieces;
}

function makeNarration(episode, seconds, language) {
  if (language === 'en') {
    return seconds <= 17
      ? 'Lin Zhixia has a question no one wants to answer. Before the next decision is made, she asks everyone to look at the evidence.'
      : 'Lin Zhixia asks everyone to pause and look at the evidence. Lu Chengchuan has to decide whether to keep things moving or hear her out. The answer lies in the conversation that follows.';
  }
  // This fictional wording is scoped to the next selected episode, never unseen episodes.
  return seconds <= 17
    ? `${episode.story}事情到了这一步，听听他们接下来怎么说。`
    : `${episode.story}一个尚未解释清楚的细节，让原本要继续推进的事情停了下来。林知夏没有回避，陆承川也必须给出回应。接下来的这段对话，就是事情转折的关键。`;
}

export function buildOutputs(config = {}, batchId = 'demo') {
  const c = normalizeConfig(config);
  const validation = validateConfig(c);
  if (!validation.ok) throw new Error(validation.errors.join(' '));
  const source = resolveSource(c);
  const episodes = getEpisodes(c).filter(episode => episode.id >= c.start && episode.id <= c.end);
  const [minimum, maximum] = DURATION_RANGES[c.duration];
  const available = episodes.reduce((sum, episode) => sum + episode.duration, 0);
  const maxDuration = Math.min(maximum, available / c.speed + c.narrationSeconds);
  const middle = (minimum + maxDuration) / 2;
  const variations = [0, 8, -12, 16, -7, 3, -18, 11, -3, 20];
  const openings = new Map();
  return Array.from({length: c.count}, (_, index) => {
    const duration = round(Math.max(minimum, Math.min(maxDuration, middle + variations[index % variations.length])));
    const sourceSeconds = (duration - c.narrationSeconds) * c.speed;
    const pieces = makeSourcePieces(episodes, sourceSeconds, index);
    const narrationIndex = c.position !== 'intro' ? Math.min(2, Math.max(0, pieces.length - 1)) : 0;
    const nextPiece = pieces[narrationIndex];
    const narrationText = c.mode === 'narrated' ? makeNarration(nextPiece.episode, c.narrationSeconds, c.language) : '';
    const segments = [];
    let elapsed = 0;
    pieces.forEach((piece, pieceIndex) => {
      if (c.mode === 'narrated' && pieceIndex === narrationIndex) {
        const sourceStart = Math.min(piece.sourceStart, piece.episode.duration - c.narrationSeconds);
        segments.push({type: 'narration', label: c.position === 'intro' ? 'AI 解说 · 前置引入' : 'AI 解说 · 剧情转折', text: narrationText,
          sourceEp: piece.episode.id, sourceStart: round(sourceStart), sourceEnd: round(sourceStart + c.narrationSeconds),
          sourceMarket: source.market, sourceCollectionId: source.collectionId, drama: source.title,
          start: round(elapsed), end: round(elapsed + c.narrationSeconds), sourceSpeed: 1, simulated: true});
        elapsed += c.narrationSeconds;
      }
      const length = (piece.sourceEnd - piece.sourceStart) / c.speed;
      const dialogueIndex = Math.min(2, Math.floor(piece.sourceStart / 84));
      segments.push({type: 'original', label: piece.episode.title, text: piece.episode.dialogues[dialogueIndex],
        sourceEp: piece.episode.id, sourceStart: piece.sourceStart, sourceEnd: piece.sourceEnd,
        sourceMarket: source.market, sourceCollectionId: source.collectionId, drama: source.title,
        start: round(elapsed), end: round(elapsed + length), sourceSpeed: c.speed, simulated: true});
      elapsed += length;
    });
    const lastSegment = segments[segments.length - 1];
    if (Math.abs(lastSegment.end - duration) < 0.02) lastSegment.end = duration;
    const firstEpisode = pieces[0].episode;
    const openingKey = `${firstEpisode.id}:${Math.floor(pieces[0].sourceStart / 30)}`;
    const similarity = openings.has(openingKey);
    openings.set(openingKey, true);
    const checks = [
      {key: 'range', label: '来源范围', status: 'pass', detail: `演示时间线全部取自《${source.title}》第 ${c.start}–${c.end} 集。`},
      {key: 'dialogue', label: '对白完整', status: 'pass', detail: '模拟检查项；真实声音的首字、尾音与语义完整性尚未检测。'},
      {key: 'junction', label: '解说衔接', status: c.mode === 'narrated' ? 'pass' : 'na', detail: c.mode === 'narrated' ? '演示文案绑定下一段原片；需要真实样片验证接句。' : '本条无解说段。'},
      {key: 'music', label: '音乐覆盖', status: c.bgm ? 'pass' : 'na', detail: c.bgm ? '演示配乐已选；本 Demo 不合成音轨。' : '本次关闭附加 BGM。'},
      {key: 'frames', label: '黑屏卡帧', status: 'pass', detail: '模拟检查项；本 Demo 未解码或渲染真实视频。'},
    ];
    return {id: `${batchId}-${String(index + 1).padStart(2, '0')}`, title: `${firstEpisode.title} · ${['正面冲突', '证据反转', '人物视角', '悬念推进'][index % 4]}`,
      duration, narrationText, segments, checks, status: 'ready', confirmed: false, simulated: true,
      source: {...source, availableEpisodes: [...source.availableEpisodes]},
      sourceRange: {start: c.start, end: c.end}, sourceEpisodes: [...new Set(pieces.map(piece => piece.episode.id))],
      analyzedEpisodes: episodes.map(episode => episode.id), speed: c.speed, narrationSeconds: c.narrationSeconds,
      sourceSeconds: round(sourceSeconds), similarityNote: similarity ? '开场来源接近，可查看相似版本或调整选集。' : '',
      bgm: c.bgm, subtitles: c.subtitles, mode: c.mode, position: c.position, language: c.language,
      junctions: segments.slice(1).map(segment => segment.start),
    };
  });
}

export function createWallet() {
  return {initialBalance: 10000, balance: 10000, frozen: 0, spent: 0, refunded: 0, transactions: [], batches: Object.create(null)};
}

function assertPoints(points, allowZero = false) {
  if (!Number.isSafeInteger(points) || points < (allowZero ? 0 : 1)) throw new Error('积分必须为有效的非负整数。');
}

function assertBatchId(batchId) {
  if (typeof batchId !== 'string' || !batchId.trim() || ['__proto__', 'prototype', 'constructor'].includes(batchId)) throw new Error('批次编号无效。');
}

function record(wallet, type, batchId, points) {
  wallet.transactions.push({type, batchId, points, time: new Date().toISOString()});
}

export function freeze(wallet, batchId, points) {
  assertBatchId(batchId);
  assertPoints(points);
  if (own(wallet.batches, batchId)) {
    if (wallet.batches[batchId].reserved === points) return wallet;
    throw new Error('该批次已冻结积分，不能重复冻结不同金额。');
  }
  if (points > wallet.balance) throw new Error('可用积分不足，请减少条数。');
  wallet.balance -= points;
  wallet.frozen += points;
  wallet.batches[batchId] = {reserved: points, settled: false, used: 0, refunded: 0, refundOperations: Object.create(null)};
  record(wallet, 'freeze', batchId, points);
  return wallet;
}

export function settle(wallet, batchId, usedPoints) {
  assertBatchId(batchId);
  assertPoints(usedPoints, true);
  if (!own(wallet.batches, batchId)) throw new Error('该批次尚未冻结积分。');
  const batch = wallet.batches[batchId];
  if (batch.settled) {
    if (batch.used === usedPoints) return wallet;
    throw new Error('批次已经结算，不能重复扣款。');
  }
  if (usedPoints > batch.reserved) throw new Error('实际扣款不能超过已确认的最高消耗。');
  const released = batch.reserved - usedPoints;
  wallet.frozen -= batch.reserved;
  wallet.balance += released;
  wallet.spent += usedPoints;
  batch.used = usedPoints;
  batch.settled = true;
  record(wallet, 'settle', batchId, usedPoints);
  if (released > 0) record(wallet, 'release', batchId, released);
  return wallet;
}

export function refund(wallet, batchId, points, operationId) {
  assertBatchId(batchId);
  assertPoints(points);
  if (!own(wallet.batches, batchId) || !wallet.batches[batchId].settled) throw new Error('仅已结算批次可退还积分。');
  const batch = wallet.batches[batchId];
  if (operationId !== undefined) {
    assertBatchId(operationId);
    if (own(batch.refundOperations, operationId)) {
      if (batch.refundOperations[operationId] === points) return wallet;
      throw new Error('同一次退款操作不能变更积分数。');
    }
  }
  if (points > batch.used - batch.refunded) throw new Error('退款累计不能超过该批次的实际扣款。');
  wallet.balance += points;
  wallet.spent -= points;
  wallet.refunded += points;
  batch.refunded += points;
  if (operationId !== undefined) batch.refundOperations[operationId] = points;
  record(wallet, 'refund', batchId, points);
  return wallet;
}

export function formatTime(seconds = 0) {
  const numeric = Number(seconds);
  const total = Number.isFinite(numeric) ? Math.max(0, Math.floor(numeric)) : 0;
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor(total % 3600 / 60);
  const remainder = String(total % 60).padStart(2, '0');
  return hours ? `${hours}:${String(minutes).padStart(2, '0')}:${remainder}` : `${minutes}:${remainder}`;
}
