/* Material delivery prototype. All catalogs and material identifiers are fictional.
 * No network request or wallet mutation is made by this module.
 */

function deepFreeze(value) {
  Object.values(value).forEach(child => {
    if (child && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child);
  });
  return Object.freeze(value);
}

export const TARGETS = deepFreeze([
  {id: 'domestic', label: '国内素材', systemLabel: '国内投放系统'},
  {id: 'overseas', label: '海外素材', systemLabel: '海外投放系统'},
]);

// Keep every lookup scoped by target. A Green Console collection ID is not a
// material-system drama ID, and the same collection ID may exist in both markets.
export const TARGET_DATA = deepFreeze({
  domestic: {
    directories: [
      {id: 'domestic-dir-001', label: '国内投放 / 短剧混剪'},
      {id: 'domestic-dir-002', label: '国内投放 / AI 解说'},
      {id: 'domestic-dir-003', label: '国内投放 / 测试素材'},
    ],
    designers: [
      {id: 'domestic-designer-001', label: '陈剪辑（当前用户）'},
      {id: 'domestic-designer-002', label: '李剪辑'},
    ],
    dramas: [
      {id: 'domestic-drama-001', label: '重逢时，她已是王牌（虚构示例）', greenCollectionId: 'collection-001'},
      {id: 'domestic-drama-002', label: '她的第二次选择（虚构示例）', greenCollectionId: 'collection-002'},
      {id: 'domestic-drama-004', label: '回到相逢那天（虚构示例）', greenCollectionId: null},
    ],
    tags: [
      {id: 'domestic-tag-001', label: '原片混剪'},
      {id: 'domestic-tag-002', label: 'AI 解说'},
      {id: 'domestic-tag-003', label: '剧情反转'},
      {id: 'domestic-tag-004', label: '女性成长'},
    ],
  },
  overseas: {
    directories: [
      {id: 'overseas-dir-001', label: '海外投放 / 短剧混剪'},
      {id: 'overseas-dir-002', label: '海外投放 / AI 解说'},
      {id: 'overseas-dir-003', label: '海外投放 / 测试素材'},
    ],
    designers: [
      {id: 'overseas-designer-001', label: '陈剪辑（当前用户）'},
      {id: 'overseas-designer-002', label: '周剪辑'},
    ],
    dramas: [
      {id: 'overseas-drama-001', label: '归来后的新身份（虚构示例）', greenCollectionId: 'collection-001'},
      {id: 'overseas-drama-002', label: '最后一页合约（虚构示例）', greenCollectionId: 'collection-002'},
      {id: 'overseas-drama-004', label: '重逢的季节（虚构示例）', greenCollectionId: null},
    ],
    tags: [
      {id: 'overseas-tag-001', label: '原片混剪'},
      {id: 'overseas-tag-002', label: 'AI 解说'},
      {id: 'overseas-tag-003', label: '身份反转'},
      {id: 'overseas-tag-004', label: '都市情感'},
    ],
  },
});

const targetExists = target => TARGETS.some(item => item.id === target);
const NON_RETRYABLE = new Set(['pending', 'processing', 'unknown', 'success']);
const STATUS_LABELS = {
  pending: '等待同步', processing: '正在同步', unknown: '同步结果待确认', success: '已同步',
};

export function targetForBatch(batch) {
  const source = batch?.config?.source;
  return source?.kind === 'green' && targetExists(source.market) ? source.market : null;
}

export function outputVersion(output) {
  return Number.isSafeInteger(output?.contentVersion) && output.contentVersion > 0 ? output.contentVersion : 1;
}

export function syncKey(batchId, output, target) {
  // JSON encoding avoids collisions when IDs themselves include separators.
  return JSON.stringify([String(batchId), String(output?.id), outputVersion(output), target]);
}

function isCalendarDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12 || day < 1) return false;
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  return day <= [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
}

/**
 * Form schema: {directoryId:string, designerId:string, dramaId:string,
 * tagIds:string[], onlineDate:string (YYYY-MM-DD)}. Every field is required.
 * extraTags: [{id:string, label:string, target:'domestic'|'overseas'}].
 * Returns {valid:boolean, errors:{[field]:string}, normalized:form}.
 * Date validation deliberately does not derive the destination protection period.
 */
export function validateSyncForm(form, target, extraTags = []) {
  const values = form && typeof form === 'object' && !Array.isArray(form) ? form : {};
  const text = field => typeof values[field] === 'string' ? values[field].trim() : '';
  const normalized = {
    directoryId: text('directoryId'), designerId: text('designerId'), dramaId: text('dramaId'),
    tagIds: Array.isArray(values.tagIds) ? [...new Set(values.tagIds.filter(id => typeof id === 'string').map(id => id.trim()))] : [],
    onlineDate: text('onlineDate'),
  };
  const errors = {};
  if (!targetExists(target)) errors.target = '请选择国内素材或海外素材';
  const data = targetExists(target) ? TARGET_DATA[target] : null;
  const fields = [
    ['directoryId', 'directories', '上传目录'],
    ['designerId', 'designers', '设计师（剪辑）'],
    ['dramaId', 'dramas', '关联剧集'],
  ];
  for (const [field, options, label] of fields) {
    if (!normalized[field]) errors[field] = '请选择' + label;
    else if (!data?.[options].some(item => item.id === normalized[field])) errors[field] = label + '不属于当前投放系统，请重新选择';
  }
  const allowedTags = new Set([
    ...(data?.tags || []).map(item => item.id),
    ...(Array.isArray(extraTags) ? extraTags : [])
      .filter(item => item && item.target === target && typeof item.id === 'string' && typeof item.label === 'string' && item.label.trim())
      .map(item => item.id),
  ]);
  if (!Array.isArray(values.tagIds) || !values.tagIds.length) errors.tagIds = '请至少选择一个素材标签';
  else if (values.tagIds.some(id => typeof id !== 'string') || normalized.tagIds.some(id => !allowedTags.has(id))) errors.tagIds = '素材标签不属于当前投放系统，请重新选择';
  if (!normalized.onlineDate) errors.onlineDate = '请选择上线时间';
  else if (!isCalendarDate(normalized.onlineDate)) errors.onlineDate = '请输入有效的上线日期';
  return {valid: Object.keys(errors).length === 0, errors, normalized};
}

function matchesForOutput(batchId, output, jobs, target) {
  const matches = [];
  for (const job of Array.isArray(jobs) ? jobs : []) {
    if (!job || job.batchId !== batchId || (target != null && job.target !== target)) continue;
    for (const item of Array.isArray(job.items) ? job.items : []) {
      if (item?.outputId === output?.id && (item.version ?? 1) === outputVersion(output)) matches.push({
        status: item.status, target: job.target, version: item.version ?? 1, item, job, isCurrent: true,
      });
    }
  }
  // The application prepends new jobs. Prefer their timestamp when available,
  // retaining newest-first insertion order for missing or equal timestamps.
  return matches.map((match, index) => ({match, index, time: Date.parse(match.job.createdAt) || 0}))
    .sort((a, b) => b.time - a.time || a.index - b.index).map(entry => entry.match);
}

/** Current-content-version delivery only; app may render older jobs as history.
 * The optional fourth argument scopes a lookup to one target after manual routing.
 * Returns null, or {status,target,version,item,job,isCurrent:true}.
 */
export function getOutputSync(batchId, output, jobs, target = null) {
  const matches = matchesForOutput(batchId, output, jobs, target);
  // A late failure must not hide a confirmed success or an unresolved attempt.
  return matches.find(match => NON_RETRYABLE.has(match.status)) || matches[0] || null;
}

function fail(message, code, details) {
  const error = new Error(message);
  error.code = code;
  if (details) error.details = details;
  throw error;
}

/**
 * Returns a new pending-items array; never mutates batch, jobs, form, or wallet.
 * Only explicit failed attempts may be retried. Unresolved results must first
 * be checked and recorded as success or failed by the application.
 * Errors expose a Chinese message plus code and optional validation details.
 */
export function prepareSync(batch, outputs, target, form, jobs = [], extraTags = []) {
  if (!batch || typeof batch.id !== 'string' || !batch.id) fail('未找到当前混剪任务', 'INVALID_BATCH');
  if (!targetExists(target)) fail('请选择国内素材或海外素材', 'TARGET_REQUIRED');
  const routedTarget = targetForBatch(batch);
  if (routedTarget && routedTarget !== target) fail('所选合集属于' + TARGETS.find(item => item.id === routedTarget).systemLabel + '，无法跨系统同步', 'TARGET_MISMATCH');
  const validation = validateSyncForm(form, target, extraTags);
  if (!validation.valid) fail(Object.values(validation.errors)[0], 'INVALID_FORM', validation.errors);
  if (!Array.isArray(outputs) || !outputs.length) fail('请先选择已确认可用的成片', 'EMPTY_SELECTION');
  const ids = new Set();
  return outputs.map(candidate => {
    if (!candidate || typeof candidate.id !== 'string' || ids.has(candidate.id)) fail('选择的素材重复或无效，请重新选择', 'INVALID_SELECTION');
    ids.add(candidate.id);
    const output = batch.outputs?.find(item => item.id === candidate.id);
    if (!output || outputVersion(output) !== outputVersion(candidate)) fail('成片版本已变化，请重新选择并确认', 'STALE_OUTPUT');
    if (output.status !== 'ready' || output.confirmed !== true || (output.confirmedVersion != null && output.confirmedVersion !== outputVersion(output))) fail('仅可同步剪辑已确认当前版本可用的成片，请先完成检查', 'NOT_CONFIRMED');
    const crossTargetDuplicate = matchesForOutput(batch.id, output, jobs)
      .find(match => match.target !== target && NON_RETRYABLE.has(match.status));
    if (crossTargetDuplicate) {
      const systemLabel = TARGETS.find(item => item.id === crossTargetDuplicate.target)?.systemLabel || '其他投放系统';
      const message = crossTargetDuplicate.status === 'unknown'
        ? '该版本在' + systemLabel + '的同步结果待确认，请先查询结果，无法跨系统重复上传'
        : '该版本在' + systemLabel + STATUS_LABELS[crossTargetDuplicate.status] + '，无法跨系统重复上传';
      fail(message, crossTargetDuplicate.status === 'unknown' ? 'RESULT_UNKNOWN' : 'DUPLICATE_SYNC');
    }
    const matches = matchesForOutput(batch.id, output, jobs, target);
    const duplicate = matches.find(match => NON_RETRYABLE.has(match.status));
    if (duplicate) {
      const message = duplicate.status === 'unknown' ? '该版本同步结果待确认，请先查询结果，避免重复上传'
        : '该版本' + STATUS_LABELS[duplicate.status] + '，无需重复上传';
      fail(message, duplicate.status === 'unknown' ? 'RESULT_UNKNOWN' : 'DUPLICATE_SYNC');
    }
    // Corrupt or unsupported statuses are not an authorization to retry.
    if (matches.some(match => match.status !== 'failed')) fail('该版本同步状态异常，请先确认结果', 'INVALID_SYNC_STATUS');
    return {
      outputId: output.id, version: outputVersion(output), status: 'pending',
      key: syncKey(batch.id, output, target), materialId: null, error: null,
      ...(matches[0] ? {retryOf: matches[0].job.id} : {}),
    };
  });
}
