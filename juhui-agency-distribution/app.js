const root = document.querySelector('#app');
const toastNode = document.querySelector('#toast');
const NAV = {
  supplier: [['supplierEval', '内容评估', 'review'], ['supplierContent', '内容管理', 'folder']],
  platform: [['eval', '内容评估', 'review'], ['materialAudit', '物料审核负责人', 'folder'],
    ['business', '商务负责人', 'user'], ['schedule', '排播上线负责人', 'calendar'],
    ['channel', '渠道负责人', 'grid'], ['operator', '渠道运营', 'send']]
};
const ICONS = {
  video: '<rect x="3" y="5" width="12" height="14" rx="2"/><path d="m15 9 6-3v12l-6-3"/>',
  review: '<rect x="4" y="4" width="16" height="13" rx="1.5"/><path d="M8 21h8m-4-4v4M8 9v3m4-5v5m4-3v3"/>',
  folder: '<path d="M3 7V5h7l2 2h8v2M3 7v12h16l3-10H7l-4 10"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18m-13 5h3"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7Zm0 0L11 13"/>',
  notes: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M14 4v16m3-11h1m-1 4h1"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'
};
const platformViews = [...NAV.platform.map(([id]) => id), 'quality', 'detail'];
const entryViews = [...NAV.supplier.map(([id]) => id), ...platformViews.filter(id => id !== 'detail')];
const first = location.hash.slice(1);
const previewParams = new URLSearchParams(location.search);
const linkedCollection = first === 'detail' ? records.find(r => r.id === Number(previewParams.get('id'))) : null;
const initial = linkedCollection ? 'detail' : entryViews.includes(first) ? first : 'supplierEval';
const ui = {
  view: initial, side: platformViews.includes(initial) ? 'platform' : 'supplier',
  modal: null, selected: linkedCollection?.id || null, edit: null, filters: {}, group: 2, channel: '微信视频号',
  detailFrom: ['business', 'materialAudit', 'channel', 'operator'].includes(previewParams.get('from')) ? previewParams.get('from') : 'channel',
  detailTab: '剧集管理', materialTab: '全部', releaseMenu: false,
  filterDraft: {}, tablePages: {}, checked: new Set(), collapsedSections: new Set(), listState: {}
};
let toastTimer;

function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
const icon = name => '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
const mark = number => '<button type="button" class="mark" data-note="' + number + '" aria-label="查看说明 ' + number + '">' + number + '</button>';
const changedFields = new Set(['意向发行渠道', '意向渠道', '国内渠道排除项', '红果评估', '综合结果', '漫剧专项AI创作佐证材料',
  '权利声明及不侵权承诺（微信模板）', '上线时间', '转免时间', '内容评估状态', '送审情况', '送审状态', '送审时间']);
const fieldName = name => '<span' + (changedFields.has(name) ? ' class="changed-field"' : '') + '>' + esc(name) + '</span>';
const opt = (value, current) => '<option value="' + esc(value) + '"' + (value === current ? ' selected' : '') + '>' + esc(value) + '</option>';
const options = (values, current) => values.map(value => opt(value, current)).join('');
const buttons = (...items) => '<div class="actions">' + items.join('') + '</div>';
function act(label, action, id = '', css = 'link') {
  return '<button type="button" class="' + css + '" data-act="' + action + '" data-id="' + esc(id) + '">' + esc(label) + '</button>';
}
function tag(label) {
  const tone = ['通过', '已发行', '已送审', '已上线'].includes(label) ? 'green' :
    ['驳回', '拒绝'].includes(label) ? 'red' :
    ['无需评估', '无权益', '—', '待提交', '待评估', '未上线'].includes(label) ? 'gray' :
    label.startsWith('待') || label === '未送审' ? 'amber' : 'blue';
  return '<span class="tag ' + tone + '">' + esc(label === '待评估' ? '待审核' : label) + '</span>';
}
const val = record => records.find(item => item.id === Number(record));
const td = value => '<td>' + value + '</td>';
const timestamp = value => '<span class="timestamp">' + esc(value || '—') + '</span>';
const line = (...values) => '<tr>' + values.map(td).join('') + '</tr>';
const formField = (label, control, required = false) => '<label class="field"><span>' + (required ? '<b class="required">*</b>' : '') + fieldName(label) + '</span>' + control + '</label>';
const input = (name, value = '', hint = '', type = 'text', extra = '') => '<input name="' + name + '" type="' + type + '" value="' + esc(value) + '" placeholder="' + esc(hint) + '" ' + extra + '>';
const select = (name, values, value, extra = '') => '<select name="' + name + '" ' + extra + '>' + options(values, value) + '</select>';
const detailField = (label, value) => '<div><dt>' + fieldName(label) + '</dt><dd>' + value + '</dd></div>';
const heading = (name, desc = '', back = '') => '<div class="page-heading"><div><div class="crumb">业务功能 <span>/</span> ' + esc(name) + '</div><h1>' + esc(name) + '</h1></div>' + (back ? act('返回列表', back, '', 'btn') : '') + '</div>' + (desc ? '<p class="page-desc">' + esc(desc) + '</p>' : '');
function tabs(list, current, action) {
  return '<div class="tabs" role="tablist">' + list.map(([id, title]) => '<button type="button" role="tab" aria-selected="' + (id === current) + '" data-act="' + action + '" data-id="' + id + '">' + esc(title) + '</button>').join('') + '</div>';
}

function table(head, rows, settings = {}) {
  const key = settings.key || ui.view;
  const state = ui.tablePages[key] ||= { page: 1, size: 20 };
  const pages = Math.max(1, Math.ceil(rows.length / state.size));
  state.page = Math.min(state.page, pages);
  const visible = rows.slice((state.page - 1) * state.size, state.page * state.size);
  const firstPage = Math.max(1, Math.min(state.page - 2, pages - 4));
  const pageButtons = Array.from({ length: Math.min(5, pages) }, (_, index) => firstPage + index).map(page =>
    act(String(page), 'page', key + ':' + page, page === state.page ? 'page-button current-page' : 'page-button')).join('');
  const previous = '<button type="button" class="page-button" data-act="page" data-id="' + key + ':' + (state.page - 1) + '" aria-label="上一页"' + (state.page === 1 ? ' disabled' : '') + '>‹</button>';
  const next = '<button type="button" class="page-button" data-act="page" data-id="' + key + ':' + (state.page + 1) + '" aria-label="下一页"' + (state.page === pages ? ' disabled' : '') + '>›</button>';
  return '<div class="table-wrap ' + (settings.className || '') + '"><table><thead><tr>' + head.map(h => '<th scope="col">' + (changedFields.has(h) ? fieldName(h) : h) + '</th>').join('') + '</tr></thead><tbody>' +
    (visible.join('') || '<tr><td colspan="' + head.length + '" class="empty">暂无匹配的合集</td></tr>') +
    '</tbody></table></div><div class="pagination"><span>共 ' + rows.length + ' 条</span>' +
    '<select aria-label="每页条数" data-page-size="' + key + '">' + [20, 50, 100].map(size => '<option value="' + size + '"' + (size === state.size ? ' selected' : '') + '>' + size + '条/页</option>').join('') + '</select>' +
    '<div class="page-buttons">' + previous + pageButtons + next + '</div><label>前往 <input type="number" aria-label="前往页码" min="1" max="' + pages + '" value="' + state.page + '" data-page-jump="' + key + '"> 页</label></div>';
}

function listing(title, head, rows, tools = '', settings = {}) {
  return '<section class="panel list-panel"><div class="panel-header"><h2>' + esc(title) + (settings.note ? ' ' + mark(settings.note) : '') + '</h2><div class="actions">' + tools + '</div></div>' + table(head, rows, settings) + '</section>';
}

function multiSelect(name, values, selected) {
  return '<details class="multi-select" data-multi="' + name + '"><summary role="combobox" aria-label="' + esc(name === 'supplier' ? '供应商名称' : '综合结果') + '">' +
    '<span class="select-values">' + (selected.length ? selected.map(value => '<span class="select-chip">' + esc(value) + ' <button type="button" data-act="clear-filter-value" data-id="' + name + ':' + esc(value) + '" aria-label="移除' + esc(value) + '">×</button></span>').join('') : '<span class="placeholder">全部</span>') + '</span><span class="chevron">⌄</span></summary>' +
    '<div class="select-options"><input type="search" class="option-search" placeholder="搜索选项" aria-label="搜索' + esc(name === 'supplier' ? '供应商' : '综合结果') + '">' +
    values.map(value => '<label class="select-option"><input type="checkbox" name="' + name + '" value="' + esc(value) + '"' + (selected.includes(value) ? ' checked' : '') + '><span>' + esc(value) + '</span></label>').join('') + '</div></details>';
}

function filters(fields) {
  const draft = ui.filterDraft;
  const dateEnd = fields.find(([name]) => ['end', 'launchEnd'].includes(name));
  const controls = fields.filter(([name]) => !dateEnd || name !== dateEnd[0]).map(([name, label, values]) => {
    if (values === 'date') {
      return '<div class="field"><span>' + esc(label) + '</span><div class="date-range">' +
        input(name, draft[name], '开始日期', 'date', 'aria-label="' + esc(label) + '开始日期"') + '<span>至</span>' +
        (dateEnd ? input(dateEnd[0], draft[dateEnd[0]], '结束日期', 'date', 'aria-label="结束日期"') : '') + '</div></div>';
    }
    if (Array.isArray(values) && (name === 'supplier' || (name === 'status' && ui.view === 'eval'))) {
      const selected = Array.isArray(draft[name]) ? draft[name] : draft[name] && draft[name] !== '全部' ? [draft[name]] : [];
      return '<div class="field"><span>' + fieldName(label) + '</span>' + multiSelect(name, values, selected) + '</div>';
    }
    return formField(label, Array.isArray(values) ? select(name, ['全部', ...values], draft[name] || '全部') : input(name, draft[name], '请输入' + label + (name === 'name' ? '关键词' : '')));
  });
  return '<section class="panel filter-panel"><div class="panel-header"><h2>筛选条件</h2></div><form class="filters" data-form="filters">' + controls.join('') + '<div class="filter-actions"><button class="btn primary" type="submit">⌕ 搜索</button>' +
    act('↻ 重置', 'reset-filter', '', 'btn') + '</div><p class="error filter-error" role="alert"></p></form></section>';
}

function filtered(items, status) {
  const f = ui.filters;
  return items.filter(record => {
    const compare = (key, value) => !f[key] || f[key] === '全部' || (Array.isArray(f[key]) ? !f[key].length || f[key].includes(value) : f[key] === value);
    const contains = (key, value) => !f[key] || String(value).includes(f[key]);
    const date = record.submitted.slice(0, 10);
    return contains('name', record.name) && compare('status', status?.(record)) &&
      compare('supplier', record.supplier) && compare('contact', record.contact) &&
      compare('type', record.type) && compare('round', record.round) &&
      compare('material', record.materialStatus) && compare('film', record.filmStatus) &&
      compare('materialReviewer', '示例审核员') && compare('filmReviewer', '示例审核员') && compare('channelLead', '示例负责人') &&
      (!f.release || f.release === '全部' || channelsFor(record).includes(f.release) || record.release.includes(f.release)) &&
      (!f.start || date >= f.start) && (!f.end || date <= f.end);
  });
}

function link(record, label = '查看链接') {
  return /^https?:\/\//i.test(record.link) ? '<a class="link" href="' + esc(record.link) + '" target="_blank" rel="noopener">' + label + '</a>' : '—';
}

function supplierEval() {
  const rows = filtered(records, combined).map(r => line(esc(r.id), esc(r.name), esc(r.episodes), link(r), esc(r.submitted),
    tag(r.quality), tag(combined(r)), esc(r.reviews.find(review => review.opinion)?.opinion || '—'),
    combined(r) === '驳回' || r.quality === '驳回' ? act('修改后重提', 'submit', r.id) : '—'));
  return heading('内容评估') + filters([
    ['name', '合集名称'], ['status', '状态', ['待内容质量评估', '审核中', '通过', '驳回']], ['start', '提交时间', 'date'], ['end', '结束日期', 'date']
  ]) + listing('评估记录', ['ID', '合集名称', '集数', '一卡链接', '提交时间', '内容质量评估状态', '内容评估状态', '审核意见', '操作'], rows,
    mark(2) + act('＋ 提交剧集信息', 'submit', '', 'btn primary'), { note: 1 });
}

function supplierContent() {
  const rows = filtered(records.filter(r => combined(r) === '通过'), issuanceStatus)
    .map(r => line(esc(r.id), esc(r.name), esc(r.episodes), esc(r.submitted), tag(r.materialStatus), tag(r.filmStatus),
      tag(issuanceStatus(r)),
      !r.stage && r.materialStatus !== '审核中' ? act('编辑合集', 'edit-material', r.id) : act('查看详情', 'supplier-info', r.id)));
  return heading('内容管理') + filters([
    ['name', '合集名称'], ['release', '渠道', RELEASE], ['type', '剧集类型', TYPES], ['round', '发行轮次', ['首发', '二轮']],
    ['material', '物料状态', ['待提交', '审核中', '通过', '拒绝']], ['film', '正片状态', ['待提交', '审核中', '通过']],
    ['status', '渠道发行状态', ['待生成', ...STAGES]]
  ]) + listing('合集列表', ['ID', '合集名称', '集数', '创建时间', '物料审核状态', '正片审核状态', '渠道发行状态', '操作 ' + mark(1)], rows,
    act('＋ 提交剧集信息', 'submit', '', 'btn primary'));
}

function checkList(name, values, selected, kind = 'checkbox') {
  return '<div class="check-list">' + values.map(value => '<label class="check"><input type="' + kind + '" name="' + name + '" value="' +
    esc(value) + '"' + (selected.includes(value) ? ' checked' : '') + '><span>' + esc(value) + '</span></label>').join('') + '</div>';
}

function fileList(items, key) {
  return (items || []).map((file, index) => '<li><span class="file-name">' + esc(file.name) + '</span>' +
    act('移除', 'remove-file', key + ':' + index) + '</li>').join('');
}

function uploader(name, label, accept, files, hint) {
  return '<div class="upload-item"><div class="upload-control"><label class="btn upload-button">＋ ' + esc(label) +
    '<input type="file" name="' + name + '" accept="' + accept + '" multiple aria-label="' + esc(label) + '"></label>' +
    (hint ? '<span class="muted">' + esc(hint) + '</span>' : '') + '</div>' +
    (files?.length ? '<ul class="files">' + fileList(files, name) + '</ul>' : '') + '</div>';
}

const MATERIAL_SECTIONS = [['basic', '基础信息'], ['synopsis', '剧情文案'], ['filing', '备案信息'], ['cast', '角色资料'], ['crew', '主创团队'], ['assets', '成片素材'], ['compliance', '合规文件']];
function materialSection(id, title, body, marker = '') {
  const collapsed = ui.collapsedSections.has(id);
  return '<section class="editor-section" id="' + id + '"><header><h2>' + title + ' ' + marker + '</h2>' +
    '<button type="button" class="link" data-act="collapse-section" data-id="' + id + '" aria-expanded="' + !collapsed + '">' + (collapsed ? '⌄ 展开' : '⌃ 收起') + '</button></header>' +
    '<div class="section-body"' + (collapsed ? ' hidden' : '') + '>' + body + '</div></section>';
}

function editMaterial() {
  const r = ui.edit;
  const step = ['material', 'film', 'deliver'].indexOf(ui.view);
  const steps = '<ol class="steps">' + ['填写物料信息', '填写正片视频信息', '提交审核'].map((title, i) =>
    '<li class="' + (i === step ? 'active' : i < step ? 'done' : '') + '"><span>' + (i + 1) + '</span>' + title + '</li>').join('') + '</ol>';
  const ai = needsAI(r), wx = needsWechat(r);
  const extra = r.materialExtras || {};
  const extraField = (name, label, type = 'text', hint = '', required = true) => formField(label,
    input('extra-' + name, extra[name], hint || '请输入' + label, type, 'data-extra="' + name + '"'), required);
  const extraArea = (name, label, rows = 3, hint = '', required = true) => formField(label,
    '<textarea name="extra-' + name + '" data-extra="' + name + '" rows="' + rows + '" placeholder="' + esc(hint || '请输入' + label) + '">' + esc(extra[name]) + '</textarea>', required);
  const baselineFile = (key, label, accept = '.pdf', hint = '支持多个 PDF 文件；单个文件不超过 100MB', template = '', required = true) =>
    '<div class="file-field"><strong>' + (required ? '<b class="required">*</b>' : '') + esc(label) + '</strong>' +
    (template ? ' <a class="link" href="' + template + '" target="_blank" rel="noopener">模板</a>' : '') +
    uploader(key, '点击上传' + label, accept, r.materials[key], hint) + '</div>';
  const basic = '<div class="two-fields">' +
    formField('剧集名称', input('collection', r.name, '', 'text', 'readonly'), true) +
    formField('剧集集数', input('episodes', r.episodes, '', 'number', 'readonly'), true) +
    '<div class="subfield type-field"><strong><b class="required">*</b>剧集类型</strong>' + checkList('type', TYPES, [r.type], 'radio') + '</div>' +
    '<div class="subfield"><strong><b class="required">*</b>发行轮次</strong>' + checkList('round', ['首发', '二轮'], [r.round], 'radio') + '</div>' +
    '<div class="subfield full-width"><strong><b class="required">*</b>发行渠道</strong><div class="muted">选择该剧需要分发的渠道（可多选）</div>' +
    '<details class="release-select"' + (ui.releaseMenu ? ' open' : '') + '><summary aria-label="发行渠道">' +
    (r.release.map(item => '<span class="release-chip">' + esc(item) + ' <button type="button" class="chip-remove" data-act="remove-release" data-id="' + esc(item) + '" aria-label="移除' + esc(item) + '">×</button></span>').join('') || '<span class="muted">请选择发行渠道</span>') +
    '</summary>' + checkList('release', RELEASE, r.release) + '</details></div>' +
    formField('对接商务', select('contact', ['周商务', '许商务'], r.contact), true) +
    formField('合作方名称', input('partner', r.partner, '授权书内完整版权主体名称'), true) +
    '<div class="field"><span><b class="required">*</b>剧集首发时间</span>' + select('extra-dateConfirmed', ['未确认', '已确认'], extra.dateConfirmed || (r.supplierDate ? '已确认' : '未确认'), 'data-extra="dateConfirmed" aria-label="剧集首发时间确认状态"') +
    ((extra.dateConfirmed || (r.supplierDate ? '已确认' : '未确认')) === '已确认' ? input('supplierDate', r.supplierDate, '', 'date', 'aria-label="剧集首发日期"') : '') + '</div>' +
    extraField('paidEpisodes', '剧集付费集数', 'text', '第xx集免费，第xx集付费') +
    '<div class="field"><span>转免时间</span><label class="check"><input type="radio" checked disabled>默认付免同跑</label></div>' +
    extraField('duration', '剧集平均单集时长', 'number', '分钟') +
    formField('男女频', select('extra-audience', ['请选择', '男频', '女频', '无性别'], extra.audience || '请选择', 'data-extra="audience"'), true) +
    formField('是否涉及投流', select('extra-advertising', ['请选择', '是', '否'], extra.advertising || '请选择', 'data-extra="advertising"'), true) + '</div>';
  const synopsis = extraField('intro', '10字以内剧集简介', 'text', '10字以内') +
    formField('550-1000 字剧集梗概', '<textarea name="synopsis" rows="5" placeholder="请输入550-1000字梗概">' + esc(r.synopsis) + '</textarea>', true) +
    extraArea('shortSynopsis', '100-200 字剧集梗概') + extraArea('recommendation', '剧集推荐文案', 3, '填写高光集数及推荐理由') + extraField('tags', '剧集标签', 'text', '最多3个标签，以顿号分隔');
  const filing = '<div class="two-fields">' + extraField('cost', '剧集制作成本', 'number', '万元') + extraField('actorCost', '演员总片酬占比', 'number', '%') +
    extraField('leadCost', '主要演员片酬占总片酬百分比', 'number', '%') + '</div>' + baselineFile('costReport', '真人短剧成本配置比例报告');
  const cast = ['男主', '女主'].map((prefix, index) => '<h3 class="form-subtitle">' + prefix + '角信息</h3><div class="two-fields">' +
    extraField('actorName' + index, prefix + '真实姓名') + extraField('roleName' + index, prefix + '饰演角色名') + '</div>' +
    extraArea('actorBio' + index, prefix + '简介') + extraArea('roleBio' + index, prefix + '饰演角色简介', 3, '非必填', false) +
    baselineFile('actorPhoto' + index, prefix + '照片', 'image/jpeg,image/png', '支持 JPG / PNG，单个文件不超过 10MB，比例1:1') +
    baselineFile('actorStill' + index, prefix + '演剧照', 'image/jpeg,image/png', '支持 JPG / PNG，单个文件不超过 10MB', '', false)).join('');
  const crew = extraField('company', '承制公司') + ['导演', '编剧'].map((prefix, index) => '<div class="two-fields">' +
    extraField('crewName' + index, prefix + '真实姓名') + formField(prefix + '性别', select('extra-crewGender' + index, ['请选择', '男', '女'], extra['crewGender' + index] || '请选择', 'data-extra="crewGender' + index + '"'), true) + '</div>' +
    baselineFile('crewPhoto' + index, prefix + '照片', 'image/jpeg,image/png', '支持 JPG / PNG，50KB-10MB，推荐2MB', '', index === 0) + extraArea('crewBio' + index, prefix + '简介')).join('') + extraField('producer', '制片人真实姓名');
  const assets = formField('全集资源', input('filmLink', r.filmLink, '请输入网盘链接', 'url'), true) + extraField('previewLink', '试看链接', 'url', '请输入网盘链接') +
    extraField('highlightLink', '高光素材视频', 'url', '请输入网盘链接') + baselineFile('posterHorizontal', '横版剧集海报', '.jpg,.jpeg,.png,.psd', '支持 JPG / PNG / PSD；图片不超过 10MB，PSD 不超过 200MB') +
    baselineFile('posterVertical', '竖版剧集海报', '.jpg,.jpeg,.png,.psd', '支持 JPG / PNG / PSD；图片不超过 10MB，PSD 不超过 200MB') + extraField('aiEpisodes', 'AI具体集数', 'text', '标注使用AI的具体集数');
  const domesticAll = r.release.includes('国内全渠道');
  const compliance =
    formField('制作合同', select('contract', ['有', '无'], r.contract)) +
    (ai ? '<div class="file-field"><strong><b class="required">*</b>' + fieldName('漫剧专项AI创作佐证材料') + '</strong>' +
      '<div class="field-hint changed-field">所有漫剧均需上传，不受制作合同有无影响。</div>' +
      uploader('ai', '点击上传佐证材料', 'image/*,.pdf', r.materials.ai, '支持图片（JPG、PNG等）和 PDF，可上传多个文件') + '</div>' : '') +
    baselineFile('screenshots', '物料截图文件', 'image/jpeg,image/png', '支持 JPG / PNG，单个文件不超过 10MB') +
    baselineFile('paymentPromise', '片酬承诺书') + baselineFile('copyright', '版权文件', '.pdf', '拼多多提交高清分页拍照PDF，字节系提交扫描PDF；单个文件不超过 100MB') +
    (wx ? baselineFile('wechatCost', '微信视频端成本配置文件') : '') +
    (domesticAll ? baselineFile('hippo', '河马专属权利声明+成本文件') : '') +
    (wx ? '<div class="file-field"><strong><b class="required">*</b>' + fieldName('权利声明及不侵权承诺（微信模板）') + '</strong> ' +
      '<a class="link" href="https://xtlmcmusfp.feishu.cn/file/EVPLbKuTPoMaXdxaf9wcLov6nmg" target="_blank" rel="noopener">【制作方】权利声明及不侵权承诺模版</a>' +
    '<div class="field-hint changed-field">推荐提供拍照版本，扫描件容易被渠道驳回。</div>' +
      uploader('wx', '点击上传微信模板文件', '.pdf', r.materials.wx, '支持 PDF') + '</div>' : '') +
    (domesticAll || r.release.includes('字节系') ? baselineFile('redfruitRights', '权利声明及不侵权承诺函（红果模板）') : '') +
    (domesticAll ? baselineFile('alipay', '支付宝承诺函') : '') +
    (domesticAll || r.release.includes('快手') ? baselineFile('kuaishou', '快手自建站授权书') : '');
  const bodies = { basic, synopsis, filing, cast, crew, assets, compliance };
  const materials = '<div class="notice supplier-notice">合集名称、剧集集数由内容评估带出，不可修改。</div><div class="editor-grid"><div>' +
    MATERIAL_SECTIONS.map(([id, title]) => materialSection(id, title, bodies[id], id === 'compliance' && (ai || wx) ? mark(1) : '')).join('') +
    '</div><aside class="anchor-nav"><h3>♧ 快速定位 <small>7 项</small></h3>' + MATERIAL_SECTIONS.map(([id, title]) => act(title, 'anchor', id)).join('') + '</aside></div>';
  const film = '<section class="editor-section"><h2>正片视频信息</h2><p>' +
    (r.filmStatus === '通过' ? '正片已通过审核。' : '填写全集资源链接或选择本地视频文件。') + '</p>' +
    (r.filmStatus === '通过' ? tag('通过') : formField('全集资源', input('filmLink', r.filmLink, 'https://…', 'url')) +
      uploader('film', '选择正片视频', 'video/*', r.film ? [r.film] : [], '演示用视频文件')) + '</section>';
  const deliver = '<section class="editor-section"><h2>确认交付信息</h2><dl class="detail-grid">' +
    detailField('剧集名称', esc(r.name)) + detailField('发行渠道', esc(r.release.join('、'))) +
    (ai ? detailField('漫剧专项AI创作佐证材料', esc((r.materials.ai || []).map(f => f.name).join('、') || '待上传')) : '') +
    (wx ? detailField('权利声明及不侵权承诺（微信模板）', esc((r.materials.wx || []).map(f => f.name).join('、') || '待上传')) : '') +
    detailField('正片状态', tag(r.filmStatus)) + '</dl></section>';
  const forward = step === 2 ? act('提交审核', 'deliver', '', 'btn primary') : act('下一步', 'next-step', '', 'btn primary');
  const markers = step === 0 ? mark(ai || wx ? 2 : 1) : step === 2 ? mark(1) : '';
  return heading('编辑合集', '', 'material-back') + '<section class="panel editor">' + steps +
    [materials, film, deliver][step] + '<div class="editor-footer">' + markers +
    (step === 0 ? act('保存物料信息', 'save-material', '', 'btn') : act('上一步', 'prev-step', '', 'btn')) + forward +
    '<p class="error" id="editor-error" role="alert"></p></div></section>';
}

const supplierFilter = ['supplier', '供应商', ['星帆文化（演示）']];
const collectionFilter = ['name', '合集名称'];
const reviewerFilters = [['materialReviewer', '物料审核人员', ['示例审核员']], ['filmReviewer', '正片审核人员', ['示例审核员']]];

function intentChannels(record) {
  const intent = record.intent?.length ? record.intent.join('、') : '—';
  const excluded = record.intent?.length && Array.isArray(record.exclude) ? record.exclude.map(channel => channel.replace(/^不含/, '')).join('、') || '无' : '—';
  return '<div class="intent-channels"><div><span>意向：</span>' + esc(intent) + '</div><div><span>剔除：</span>' + esc(excluded) + '</div></div>';
}

function evaluation() {
  const quality = ui.view === 'quality';
  const control = (record, index) => act(index < 0 ? '同意' : '审核', 'result', record.id + ':' + index);
  const result = r => ['通过', '驳回'].includes(combined(r)) ? combined(r) : '待审核';
  const items = filtered(quality ? records : records.filter(r => r.quality === '通过'), quality ? r => r.quality === '待评估' ? '待审核' : r.quality : result);
  ui.evaluationItems = items.map(r => r.id);
  const rows = items.map(r => {
    if (quality) {
      const actions = r.quality === '待评估'
        ? buttons(control(r, -1), act('驳回', 'result', r.id + ':-2')) : '—';
      return line(esc(r.id), esc(r.supplier), esc(r.name), esc(r.episodes), intentChannels(r), link(r), tag(r.quality), esc(r.reviews.find(a => a.group === -1)?.opinion || '—'), actions);
    }
    const state = groupStatus(r, ui.group);
    return line('<input type="checkbox" data-row-select="' + r.id + '" aria-label="选择' + esc(r.name) + '"' + (ui.checked.has(r.id) ? ' checked' : '') + '>', esc(r.id), esc(r.supplier), esc(r.name), esc(r.episodes) + ' 集', intentChannels(r), link(r),
      ...GROUPS.map((_, i) => '<span class="group-result">' + tag(groupStatus(r, i)) + (groupStatus(r, i) === '通过' ? '<span class="reviewer-name">' + esc(r.reviews.find(review => review.group === i)?.actor || '示例评估员') + '</span>' : '') + '</span>'),
      result(r) === '待审核' ? '—' : tag(result(r)), esc(r.reviews.find(a => a.opinion)?.opinion || '—'),
      esc(r.submitted), buttons(state === '待评估' ? control(r, ui.group) : '', act('审核记录', 'review', r.id)));
  });
  const head = quality
    ? ['ID', '供应商', '合集名称', '集数', '意向渠道', '一卡链接', '状态', '审核意见', '操作']
    : ['<input type="checkbox" data-select-all aria-label="选择所有行">', 'ID', '供应商', '剧集名称', '集数', '意向渠道', '查看链接', GROUPS[0], '红果评估', GROUPS[2], '综合结果', '审核意见', '最近提交时间', '操作'];
  const downloadTools = quality ? '' : '<span class="selected-count">已选' + ui.checked.size + '条</span><button type="button" class="btn primary small" data-act="download-evaluation"' + (!ui.checked.size ? ' disabled' : '') + '>批量下载</button>';
  return heading('内容评估') + tabs([['quality', '内容质量评估'], ['eval', '内容评估']], ui.view, 'nav') +
    filters([['supplier', '供应商名称', ['星帆文化（演示）']], collectionFilter, ['status', quality ? '状态' : '综合结果', ['待审核', '通过', '驳回']],
      ...(!quality ? [['start', '最近提交日期', 'date'], ['end', '结束日期', 'date']] : [])]) +
    listing(quality ? '质量评估列表' : '评估列表', head, rows, downloadTools, { className: 'evaluation-table' + (quality ? ' quality-evaluation-table' : ''), note: 1 });
}

function materialAudit() {
  const all = records.filter(r => r.materialStatus !== '待提交');
  const items = filtered(ui.materialTab === '全部' ? all : all.filter(r => r.materialStatus === ui.materialTab));
  return heading('物料审核负责人') + filters([supplierFilter, collectionFilter, ['materialReviewer', '审核人员', ['示例审核员']]]) +
    tabs(['全部', '待分配', '审核中', '通过', '拒绝'].map(item => [item, item]), ui.materialTab, 'material-tab') +
    listing('剧集列表', ['ID', '剧集名称', '供应商', '物料状态', '审核人员', '提交时间', '操作 ' + mark(1)], items.map(r =>
      line(esc(r.id), esc(r.name), esc(r.supplier), tag(r.materialStatus), '示例审核员', esc(r.submitted),
        buttons(act('查看物料', 'open-compliance', r.id), act('审核记录', 'history', r.id)))));
}

function business() {
  const items = filtered(records.filter(r => r.stage || r.materialStatus !== '待提交'));
  return heading('商务负责人') +
    filters([supplierFilter, collectionFilter, ['contact', '商务', ['周商务', '许商务']]]) +
    listing('剧集列表', ['ID', '剧集名称', '供应商', '物料状态', '正片状态', '提交时间', '上线时间', '对接商务', '审核人员', '操作 ' + mark(1)],
      items.map(r => line(esc(r.id), esc(r.name), esc(r.supplier), tag(r.materialStatus), tag(r.filmStatus), esc(r.submitted),
        esc(r.launch || r.supplierDate || '—'), esc(r.contact), '—', buttons(
          r.stage === STAGES[0] ? act('编辑', 'auth', r.id) : '', act('查看详情', 'open-detail', r.id), act('审核记录', 'history', r.id)))));
}

function schedule() {
  const items = filtered(records.filter(r => r.authorization.length && r.stage !== STAGES[0]), r => r.stage === STAGES[1] ? '待设置' : '已设置');
  const rows = items.map(r => {
    const when = r.stage === STAGES[1] ? tag('待确认') + (r.supplierDate ? '<span class="subline">供应商预填 ' + esc(r.supplierDate) + '</span>' : '') : timestamp(r.launch);
    return line(esc(r.id), esc(r.name), esc(r.supplier), when, timestamp(r.freeTime), buttons(
      act('审核记录', 'history', r.id), act('设置上线时间', 'scheduling', r.id)));
  });
  return heading('排播上线负责人') +
    filters([supplierFilter, collectionFilter, ['status', '上线时间设置', ['待设置', '已设置']], ...reviewerFilters, ['channelLead', '渠道负责人', ['示例负责人']]]) +
    listing('剧集列表', ['ID', '剧集名称', '供应商', '上线时间', '转免时间', '操作 ' + mark(2)], rows, '', { note: 1 });
}

function channelPage() {
  const operator = ui.view === 'operator';
  const items = filtered(records.filter(r => [STAGES[2], STAGES[3]].includes(r.stage)
    && (!operator || (channelsFor(r).includes(ui.channel) && (r.assignment[ui.channel] || r.stage === STAGES[3])))))
    .filter(r => (!ui.filters.launchStart || r.launch.slice(0, 10) >= ui.filters.launchStart) &&
      (!ui.filters.launchEnd || r.launch.slice(0, 10) <= ui.filters.launchEnd));
  const rows = items.map(r => {
    const channels = operator ? esc(ui.channel) : act('共 ' + channelsFor(r).length + ' 个渠道', 'channel-list', r.id);
    return line(esc(r.id), esc(r.name), esc(r.supplier), channels, tag(issuanceStatus(r)), tag(r.stage === STAGES[3] ? '已上线' : '待上线'),
      '示例审核员', timestamp(r.launch), timestamp(r.freeTime), buttons(act('审核记录', 'history', r.id),
        operator ? act('查看详情', 'open-detail', r.id) : act('查看渠道', 'channel-list', r.id)));
  });
  return heading(operator ? '渠道运营' : '渠道负责人') +
    filters([supplierFilter, collectionFilter, ...reviewerFilters, ['launchStart', '上线时间', 'date'], ['launchEnd', '结束日期', 'date']]) +
    listing('剧集列表', ['ID', '剧集名称', '供应商', '渠道', '发行状态', '上线状态', '审核人员', '上线时间', '转免时间', '操作'], rows, '', { note: 1 });
}

function canSeeWechat(record) {
  return ['channel', 'operator'].includes(ui.detailFrom) && channelsFor(record).includes(ui.channel)
    && ['微信视频号', '字节系'].includes(ui.channel)
    && (ui.detailFrom === 'channel' || record.assignment[ui.channel] || record.stage === STAGES[3]);
}

function canEditWechat(record) {
  return canSeeWechat(record) && ui.detailFrom === 'operator' && ui.channel === '微信视频号' && Boolean(record.assignment[ui.channel]);
}

function collectionMaterialAreas(r, marker = 2, allowAudit = true) {
  const hasFiles = needsAI(r) || needsWechat(r);
  const fileGroup = (label, key) => detailField(label, (r.materials[key] || []).map((file, index) =>
    '<div class="file-view">' + esc(file.name) + act('查看', 'preview-material', key + ':' + index) + '</div>').join('') || '—');
  const extra = r.materialExtras || {};
  const extraDetails = fields => fields.map(([key, label]) => detailField(label, esc(extra[key] || '—'))).join('');
  const descriptionArea = content => '<dl class="bordered-descriptions tab-content">' + content + '</dl>';
  const compliance = '<section class="editor-section"><h2>合规文件 ' + (hasFiles && marker ? mark(marker) : '') + '</h2><dl class="bordered-descriptions">' +
    Object.entries({ screenshots: '物料截图文件', paymentPromise: '片酬承诺书', copyright: '版权文件', wechatCost: '微信视频端成本配置文件', hippo: '河马专属权利声明+成本文件', redfruitRights: '权利声明及不侵权承诺函（红果模板）', alipay: '支付宝承诺函', kuaishou: '快手自建站授权书' }).filter(([key]) => r.materials[key]?.length).map(([key, label]) => fileGroup(label, key)).join('') +
    (needsAI(r) ? fileGroup('漫剧专项AI创作佐证材料', 'ai') : '') +
    (needsWechat(r) ? fileGroup('权利声明及不侵权承诺（微信模板）', 'wx') : '') + '</dl>' +
    (allowAudit && ui.detailFrom === 'materialAudit' && r.materialStatus === '审核中'
      ? '<div class="panel-tools">' + act('审核物料', 'material-result', r.id, 'btn primary') + '</div>' : '') + '</section>';
  return {
    基础信息: descriptionArea(detailField('剧集类型', esc(r.type)) + detailField('发行轮次', esc(r.round)) +
      detailField('发行渠道', esc(r.release.join('、'))) + detailField('对接商务', esc(r.contact)) + detailField('合作方名称', esc(r.partner || '—')) +
      detailField('剧集首发时间', esc(r.supplierDate || '未确认')) + extraDetails([['paidEpisodes', '剧集付费集数'], ['duration', '剧集平均单集时长'], ['audience', '男女频'], ['advertising', '是否涉及投流']])),
    剧情文案: descriptionArea(extraDetails([['intro', '10字以内剧集简介']]) + detailField('550-1000 字剧集梗概', esc(r.synopsis || '—')) +
      extraDetails([['shortSynopsis', '100-200 字剧集梗概'], ['recommendation', '剧集推荐文案'], ['tags', '剧集标签']])),
    备案信息: descriptionArea(extraDetails([['cost', '剧集制作成本'], ['actorCost', '演员总片酬占比'], ['leadCost', '主要演员片酬占总片酬百分比']]) + fileGroup('真人短剧成本配置比例报告', 'costReport')),
    角色资料: descriptionArea(['男主', '女主'].map((prefix, index) => extraDetails([['actorName' + index, prefix + '真实姓名'], ['roleName' + index, prefix + '饰演角色名'],
      ['actorBio' + index, prefix + '简介'], ['roleBio' + index, prefix + '饰演角色简介']]) + fileGroup(prefix + '照片', 'actorPhoto' + index) + fileGroup(prefix + '演剧照', 'actorStill' + index)).join('')),
    主创团队: descriptionArea(extraDetails([['company', '承制公司'], ['producer', '制片人真实姓名']]) + ['导演', '编剧'].map((prefix, index) =>
      extraDetails([['crewName' + index, prefix + '真实姓名'], ['crewGender' + index, prefix + '性别'], ['crewBio' + index, prefix + '简介']]) + fileGroup(prefix + '照片', 'crewPhoto' + index)).join('')),
    成片素材: descriptionArea(detailField('全集资源', esc(r.filmLink || '—')) + extraDetails([['previewLink', '试看链接'], ['highlightLink', '高光素材视频'], ['aiEpisodes', 'AI具体集数']]) +
      fileGroup('横版剧集海报', 'posterHorizontal') + fileGroup('竖版剧集海报', 'posterVertical')),
    合规文件: compliance,
    授权书: '<div class="tab-content">' + (r.authorization.map(f => '<div>' + esc(f.name) + '</div>').join('') || '暂无授权书') + '</div>'
  };
}

function channelCards(r) {
  const channelName = channel => channel === '字节系' ? '字节系（红果和抖音）' : channel;
  const status = r.stage === STAGES[3] ? '已上线' : '未上线';
  const cards = channelsFor(r).map(channel => {
    const seeWechat = channel === '微信视频号' && canSeeWechat(r);
    const wechat = seeWechat ? detailField('送审情况', '<div class="status-inline">' + tag(r.wechat?.status || '—') +
      (r.wechat?.time ? '<span>' + esc(r.wechat.time) + '</span>' : '') +
      (canEditWechat(r) ? act('填写', 'wechat', r.id) : '') + '</div>') : '';
    return '<article class="channel-card"><header><h2>' + esc(channelName(channel)) + (seeWechat ? ' ' + mark(2) : '') + '</h2>' + tag(status) + '</header>' +
    '<div class="channel-card-body"><dl class="bordered-descriptions channel-descriptions">' +
    detailField('作品名称', esc(r.name)) + detailField('发布状态', tag(status)) +
    detailField('上线时间', timestamp(r.launch)) + detailField('转免时间', timestamp(r.freeTime)) +
    detailField('渠道内容ID', esc(r.channelContentIds?.[channel] || '—')) + detailField('渠道运营', esc(r.assignment[channel] || '—')) + wechat + '</dl>' +
    '<footer><button type="button" class="btn" data-act="inspect-channel" data-id="' + esc(channel) + '">' + icon('eye') + '查看</button></footer></div></article>';
  });
  return '<div class="channel-card-grid">' + (cards.join('') || '<div class="panel empty-channels">暂无渠道信息</div>') + '</div>';
}

function detail() {
  const r = val(ui.selected);
  if (!r) return '';
  const details = '<section class="panel collection-summary"><header><h2>' + esc(r.name) + '</h2>' +
    '<button type="button" class="btn primary" data-act="inspect-collection">' + icon('eye') + '查看详情</button></header>' +
    '<dl class="bordered-descriptions summary-descriptions">' + detailField('短剧ID', esc(r.id)) + detailField('集数', esc(r.episodes) + ' 集') + detailField('提交时间', esc(r.submitted)) +
    detailField('物料审核状态', tag(r.materialStatus)) + '<div class="description-span-two"><dt>正片审核状态</dt><dd>' + tag(r.filmStatus) + '</dd></div>' +
    detailField('上线时间', timestamp(r.launch)) + detailField('转免时间', timestamp(r.freeTime) + ' ' + mark(1)) + '</dl></section>';
  const areas = { 剧集管理: channelCards(r), ...collectionMaterialAreas(r) };
  return '<div class="page-heading collection-heading"><h1>合集详情</h1>' + act('← 返回列表', 'detail-back', '', 'btn') + '</div>' + details +
    tabs(Object.keys(areas).map(key => [key, key]), ui.detailTab, 'detail-tab') +
    (ui.detailTab === '剧集管理' ? areas[ui.detailTab] : '<section class="panel detail-tab-panel">' + areas[ui.detailTab] + '</section>');
}

function dialogBody(modal) {
  const r = val(modal.id);
  const d = modal.draft;
  switch (modal.type) {
    case 'submit': {
      const fields = formField('合集名称', input('name', d.name, '请输入合集名称', 'text', 'maxlength="50" required'), true) +
        formField('集数', input('episodes', d.episodes, '请输入剧集集数', 'number', 'required min="1" step="1"'), true) +
        formField('一卡链接', input('link', d.link, '请输入一卡链接', 'url', 'required'), true);
      return ['提交剧集信息', fields + '<div class="form-group"><strong><b class="required">*</b>' + fieldName('意向发行渠道') + '</strong> ' + mark(1) +
        checkList('intent', CHANNELS, d.intent) + (d.intent.includes(CHANNELS[0]) ?
          '<div class="nested-field"><strong>' + fieldName('国内渠道排除项') + '</strong>' + checkList('exclude', EXCLUSIONS, d.exclude) + '</div>' : '') + '</div>', '提交评估', 2];
    }
    case 'review': {
      const history = r.reviews.map(review => '<li><time>' + esc(review.time) + '</time><dl class="review-descriptions">' +
        detailField('审核组', esc(review.group < 0 ? '内容质量评估' : GROUPS[review.group])) + detailField('审核结果', tag(review.result)) +
        detailField('审核人', esc(review.actor || '示例评估员')) + detailField('审核时间', esc(review.time)) +
        detailField('意见', esc(review.opinion || '—')) + '</dl></li>').join('');
      return ['审核记录', '<dl class="detail-grid">' +
        detailField('剧集名称', esc(r.name)) + detailField('意向发行渠道', esc(r.intent.join('、') || '—')) +
        detailField('国内渠道排除项', esc(r.exclude.join('、') || '—')) + '</dl>' +
        '<div class="review-summary"><strong>' + fieldName('红果评估') + '</strong> ' + tag(groupStatus(r, 1)) + ' ' + mark(1) + '</div>' +
        '<ol class="review-timeline">' + (history || '<li><time>' + esc(r.submitted) + '</time><p class="muted">暂无审核记录</p></li>') + '</ol>'];
    }
    case 'result':
    case 'material-result': {
      const label = modal.type === 'material-result' ? '审核物料' : modal.group < 0 ? '内容质量评估' : GROUPS[modal.group];
      return [label, formField('剧集名称', input('collection', r.name, '', 'text', 'readonly')) +
        formField('审核结果', select('result', ['通过', '驳回'], d.result), true) +
        formField('审核意见', '<textarea name="opinion" rows="3" placeholder="驳回时填写原因">' + esc(d.opinion) + '</textarea>'), '确认'];
    }
    case 'auth':
      return ['编辑商务信息 — ' + r.name, formField('合集', input('collection', r.name, '', 'text', 'readonly')) +
        formField('对接商务', select('contact', ['周商务', '许商务'], d.contact), true) +
        '<div class="file-field"><strong>授权书</strong>' +
        uploader('auth', '点击上传授权书（Word / PDF，可多选）', '.doc,.docx,.pdf', d.authorization, '') + '</div>', '保存', 1];
    case 'scheduling':
      return ['设置上线时间', '<div class="form-group"><strong>排播时间</strong> ' + mark(1) +
        formField('上线时间', input('launch', d.launch, '', 'datetime-local', 'required step="60"'), true) +
        formField('转免时间', input('freeTime', d.freeTime, '', 'datetime-local', 'required step="60"'), true) +
        '</div>' +
        (/^\d{4}-\d{2}-\d{2}$/.test(r.launch || r.supplierDate) ? '<div class="notice">已有上线日期为 ' +
          esc(r.launch || r.supplierDate) + '，请在选择器中确认日期和时分。</div>' : ''), '确认', 2];
    case 'channelList': {
      const rows = channelsFor(r).map(channel => line(esc(r.id + '-' + (channelsFor(r).indexOf(channel) + 1)), esc(channel), tag(issuanceStatus(r)),
        tag(r.stage === STAGES[3] ? '已上线' : '待上线'), esc(r.assignment[channel] || '—'), '—',
        buttons(act('查看详情', 'channel-detail', channel), r.stage === STAGES[2] ? act(r.assignment[channel] ? '修改运营' : '分配运营', 'assign', channel) : '')));
      return [r.name + ' — 渠道明细', '<dl class="detail-grid">' + detailField('转免时间', timestamp(r.freeTime) + ' ' + mark(1)) + '</dl>' +
        table(['渠道记录ID', '渠道名称', '发行状态', '上线状态', '渠道运营', '驳回原因', '操作'], rows, { key: 'channelList' })];
    }
    case 'assign':
      return ['分配运营', formField('发行渠道', input('channelLabel', modal.channel, '', 'text', 'readonly')) +
        formField('渠道运营', select('operator', [modal.channel + '运营', '备用运营'], d.operator), true), '确认'];
    case 'wechat':
      return ['填写送审情况', '<div class="form-group"><strong>送审信息</strong> ' + mark(1) +
        formField('送审状态', select('status', WECHAT, d.status), true) +
        (d.status === '已送审' ? formField('送审时间', input('time', d.time, '', 'datetime-local', 'required step="60"'), true) : '') + '</div>', '保存', 2];
    case 'history':
      return ['审核记录', '<dl class="detail-grid">' + detailField('剧集名称', esc(r.name)) +
        detailField('业务进度', tag(r.stage || r.materialStatus)) + '</dl>' +
        table(['操作时间', '记录'], r.logs.map(log => line(esc(log.time), esc(log.text))), { key: 'history' })];
    case 'supplier-info':
      return ['合集详情', '<dl class="detail-grid">' + detailField('剧集名称', esc(r.name)) +
        detailField('物料审核状态', tag(r.materialStatus)) + detailField('正片审核状态', tag(r.filmStatus)) +
        detailField('上线时间', esc(r.launch || '—')) + detailField('转免时间', timestamp(r.freeTime) + ' ' + mark(1)) + '</dl>'];
    case 'collection-info': {
      const areas = collectionMaterialAreas(r, 0, false);
      const material = '<div class="inspection-material"><nav aria-label="物料分组">' + MATERIAL_SECTIONS.map(([id, label]) =>
        act(label, 'inspect-section', id, d.section === id ? 'inspection-nav active' : 'inspection-nav')).join('') + '</nav><div class="inspection-sections">' +
        MATERIAL_SECTIONS.map(([id, label]) => '<section id="inspect-' + id + '"><h3>' + esc(label) +
          (id === 'compliance' && (needsAI(r) || needsWechat(r)) ? ' ' + mark(1) : '') + '</h3>' + areas[label] + '</section>').join('') + '</div></div>';
      const episodes = table(['序号', '集数', '标题', '操作'], Array.from({ length: r.episodes }, (_, i) => line(i + 1, i + 1,
        esc(r.name) + ' 第 ' + (i + 1) + ' 集', '<button type="button" class="btn small" disabled>预览</button>')), { key: 'inspect-episodes-' + r.id });
      return [modal.channel ? (modal.channel === '字节系' ? '字节系（红果和抖音）' : modal.channel) + '详情' : '合集详情',
        tabs([['物料详情', '物料详情'], ['正片详情', '正片详情']], d.tab, 'inspect-tab') + (d.tab === '物料详情' ? material : episodes)];
    }
    case 'attachment': {
      const stored = attachments.get(modal.file.id);
      return ['查看附件', '<div class="file-preview"><strong>' + esc(modal.file.name) + '</strong>' +
        (stored ? (stored.type.startsWith('image/') ? '<img src="' + stored.url + '" alt="' + esc(modal.file.name) + '">' : '') +
          '<a class="btn" href="' + stored.url + '" download="' + esc(modal.file.name) + '">下载附件</a>'
          : '<p class="muted">当前记录保留了附件名称。上传本地文件后可在本次浏览器会话查看文件。</p>') + '</div>'];
    }
    default: return ['', ''];
  }
}

function dialog(modal) {
  const [title, body, submit, footerMark] = dialogBody(modal);
  const wide = ['review', 'channelList', 'history'].includes(modal.type);
  return '<div class="shade"><section class="dialog ' + (modal.type === 'collection-info' ? 'inspection-dialog' : wide ? 'wide' : '') + '" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1">' +
    '<header><h2 id="dialog-title">' + esc(title) + '</h2><button type="button" class="close" data-act="close" aria-label="关闭此对话框">×</button></header>' +
    '<form data-form="dialog"><div class="dialog-body">' + body + '<p id="dialog-error" class="error" role="alert"></p></div>' +
    '<footer>' + (footerMark ? mark(footerMark) : '') + act(submit ? '取消' : '关闭', 'close', '', 'btn') +
    (submit ? '<button class="btn primary" type="submit">' + submit + '</button>' : '') + '</footer></form></section></div>';
}

function noteInfo() {
  const key = ui.modal?.type || ui.view;
  if (key === 'collection-info') {
    const r = val(ui.modal.id);
    const items = ui.modal.draft.tab === '物料详情' ? NOTES.compliance.sections[0][1].filter(([name]) => name.startsWith('漫剧') ? needsAI(r) : needsWechat(r)) : [];
    return { ...NOTES.collectionInfo, sections: items.length ? [['列表项', items]] : [] };
  }
  if (key === 'detail') {
    const r = val(ui.selected);
    const see = ui.detailTab === '剧集管理' && channelsFor(r).includes('微信视频号') && canSeeWechat(r);
    const context = see ? NOTES.detail : NOTES.detailHidden;
    if (ui.detailTab === '合规文件' && (needsAI(r) || needsWechat(r))) {
      const section = NOTES.compliance.sections[0];
      const items = section[1].filter(([name]) => name.startsWith('漫剧') ? needsAI(r) : needsWechat(r));
      return { ...NOTES.compliance, sections: [...context.sections, [section[0], items]], caution: context.caution };
    }
    return context;
  }
  if (key === 'material') {
    const rules = NOTES.material;
    const items = rules.sections[0][1].filter(([name]) => name.startsWith('漫剧') ? needsAI(ui.edit) : needsWechat(ui.edit));
    return { ...rules, sections: [...(items.length ? [['配置项', items]] : []), rules.sections[1]] };
  }
  if (key === 'submit' && !ui.modal.draft.intent.includes(CHANNELS[0])) {
    return { ...NOTES.submit, sections: [['配置项', [NOTES.submit.sections[0][1][0]]], NOTES.submit.sections[1]] };
  }
  return NOTES[key] || (key === 'operator' ? NOTES.channel : NOTES.history);
}

function notes() {
  const n = noteInfo();
  return '<aside class="notes" id="prototype-notes" aria-label="原型说明"><div class="notes-body">' +
    '<h2>#页面说明</h2><p>' + esc(n.page) + '</p><h2>#原型说明</h2><ul class="context">' +
    '<li><strong>背景</strong> ' + esc(n.background) + '</li><li><strong>需求</strong> ' + esc(n.goal) + '</li></ul>' +
    (n.sections || []).map(([title, items], i) => '<section class="note-section" id="note-' + (i + 1) +
      '" tabindex="-1"><h3><span class="mark">' + (i + 1) + '</span>' + esc(title) + '</h3><ul>' +
      items.map(([field, description]) => '<li><strong>' + esc(field) + '</strong>：' + esc(description) + '</li>').join('') +
      '</ul></section>').join('') + (n.caution ? '<p class="caution">' + esc(n.caution) + '</p>' : '') +
    '</div></aside>';
}

const views = {
  supplierEval, supplierContent, material: editMaterial, film: editMaterial, deliver: editMaterial,
  quality: evaluation, eval: evaluation, materialAudit, business, schedule, channel: channelPage, operator: channelPage, detail
};

function render({ reset = false, focusDialog = false } = {}) {
  const before = root.querySelector('.canvas');
  const screenTop = reset ? 0 : root.querySelector('.screen')?.scrollTop || 0;
  const notesTop = reset ? 0 : root.querySelector('.notes')?.scrollTop || 0;
  const dialogTop = root.querySelector('.dialog-body')?.scrollTop || 0;
  const scrollLeft = reset ? 0 : before?.scrollLeft || 0;
  const channel = ['channel', 'operator'].includes(ui.view) || (ui.view === 'detail' && ['channel', 'operator'].includes(ui.detailFrom));
  const active = ui.view === 'quality' ? 'eval' : ['material', 'film', 'deliver'].includes(ui.view) ? 'supplierContent' :
    ui.view === 'detail' ? ui.detailFrom : ui.view;
  const nav = NAV[ui.side].map(([id, title, glyph]) => '<button type="button" class="' + (active === id ? 'active' : '') +
    '" data-act="nav" data-id="' + id + '">' + icon(glyph) + esc(title) + '</button>').join('');
  const roles = channel ? '<label class="review-select">演示渠道' + select('demo-channel', REVIEW_CHANNELS, ui.channel, 'data-switch="channel"') + '</label>' :
    ui.view === 'eval' ? '<label class="review-select">演示评估组' + select('demo-group', GROUPS, GROUPS[ui.group], 'data-switch="group"') + '</label>' : '';
  root.innerHTML = '<header class="review-bar"><div class="review-name"><span class="review-badge">T0</span><strong>代理发行需求原型</strong></div>' +
    '<nav aria-label="切换系统">' + act('供应商端', 'side', 'supplier', ui.side === 'supplier' ? 'selected' : '') +
    act('平台端', 'side', 'platform', ui.side === 'platform' ? 'selected' : '') + '</nav>' +
    '<div class="review-tools">' + roles + '<button class="review-note" type="button" data-act="toggle-notes">' +
    icon('notes') + '查看说明</button></div></header>' +
    '<div class="canvas"><div class="product ' + ui.side + (ui.view === 'detail' ? ' collection-view' : '') + '"><div class="product-inner"' + (ui.modal ? ' inert' : '') + '>' +
    '<aside class="sidebar"><div class="logo">' + icon('video') + '<strong>容量剧汇</strong><span>' +
    (ui.side === 'supplier' ? '供应商端' : '平台方端') + '</span></div><div class="nav-label">业务功能</div><nav>' + nav +
    '</nav><div class="profile"><span class="avatar">' + (ui.side === 'supplier' ? '星' : '剧') + '</span>' +
    (ui.side === 'supplier' ? '星帆文化' : '平台演示账号') + '</div></aside>' +
    '<div class="app-workspace">' + (ui.side === 'platform' ? '<header class="app-topbar">' + icon('user') + '<span>平台演示账号</span><span>⌄</span></header>' : '') +
    '<main class="screen">' + views[ui.view]() + '</main></div></div>' + (ui.modal ? dialog(ui.modal) : '') + '</div>' + notes() + '</div>';
  root.querySelector('.canvas').scrollLeft = scrollLeft;
  root.querySelector('.screen').scrollTop = screenTop;
  root.querySelector('.notes').scrollTop = notesTop;
  const body = root.querySelector('.dialog-body');
  if (body) body.scrollTop = focusDialog ? 0 : dialogTop;
  if (ui.modal?.type === 'collection-info' && ui.modal.draft.tab === '物料详情') {
    const section = root.querySelector('#inspect-' + ui.modal.draft.section);
    const list = root.querySelector('.inspection-sections');
    if (section && list) list.scrollTop = section.offsetTop;
  }
  refreshSelection();
  if (focusDialog) root.querySelector('.dialog')?.focus({ preventScroll: true });
}

function navigate(view) {
  if (entryViews.includes(ui.view)) ui.listState[ui.view] = { filters: structuredClone(ui.filters), draft: structuredClone(ui.filterDraft) };
  ui.view = view;
  ui.side = platformViews.includes(view) ? 'platform' : 'supplier';
  ui.modal = null;
  ui.filters = structuredClone(ui.listState[view]?.filters || {});
  ui.filterDraft = structuredClone(ui.listState[view]?.draft || {});
  ui.checked.clear();
  ui.releaseMenu = false;
  if (entryViews.includes(view)) {
    history.replaceState(null, '', '#' + view);
  }
  render({ reset: true });
}

function showNote(number) {
  const rail = root.querySelector('.notes');
  const canvas = root.querySelector('.canvas');
  const behavior = matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  canvas.scrollTo({ left: canvas.scrollWidth - canvas.clientWidth, behavior });
  if (number) {
    rail.querySelectorAll('.note-section').forEach(section => section.classList.remove('highlighted'));
    const section = rail.querySelector('#note-' + number);
    if (section) {
      section.classList.add('highlighted');
      const railTop = rail.getBoundingClientRect().top;
      const sectionTop = section.getBoundingClientRect().top;
      rail.scrollTo({ top: rail.scrollTop + sectionTop - railTop - 22, behavior });
      section.focus({ preventScroll: true });
    }
  }
}

function announce(message) {
  clearTimeout(toastTimer);
  toastNode.textContent = message;
  toastNode.classList.add('visible');
  toastTimer = setTimeout(() => toastNode.classList.remove('visible'), 3400);
}

function error(message, selector = '#dialog-error') {
  const node = document.querySelector(selector);
  if (!node) return;
  node.textContent = message;
  node.scrollIntoView({ block: 'nearest', inline: 'nearest' });
}

function openModal(type, id, draft = {}, extra = {}) {
  ui.modal = { type, id: Number(id), draft, ...extra };
  render({ focusDialog: true });
}

function closeModal() {
  if (ui.modal?.type === 'assign') return openModal('channelList', ui.modal.id);
  if (ui.modal?.returnModal) { ui.modal = ui.modal.returnModal; render({ focusDialog: true }); return; }
  ui.modal = null;
  render();
}

function saveMaterial(nextView) {
  const r = ui.edit;
  if (nextView) {
    if (!r.release.length) return materialError('请至少选择一个发行渠道。', 'basic');
    if (needsAI(r) && !r.materials.ai?.length) return materialError('所有漫剧均需上传漫剧专项AI创作佐证材料，与制作合同有无无关。', 'compliance');
    if (needsWechat(r) && !r.materials.wx?.length) return materialError('请上传权利声明及不侵权承诺（微信模板）。', 'compliance');
    if (nextView === 'deliver' && r.filmStatus !== '通过' && !r.film && !r.filmLink) {
      return error('请填写全集资源链接或上传正片视频。', '#editor-error');
    }
  }
  if (nextView && nextView !== 'submit') return navigate(nextView);
  Object.assign(val(r.id), structuredClone(r));
  const saved = val(r.id);
  if (nextView === 'submit') {
    saved.materialStatus = '审核中';
    if (saved.filmStatus !== '通过') saved.filmStatus = '审核中';
    recordLog(saved, '供应商提交物料审核');
  }
  persist();
  if (nextView === 'submit') {
    navigate('supplierContent');
    announce('已提交审核');
  } else {
    announce('物料信息已保存');
  }
}

function materialError(message, anchor) {
  if (ui.view !== 'material') navigate('material');
  if (ui.collapsedSections.has(anchor)) { ui.collapsedSections.delete(anchor); render(); }
  error(message, '#editor-error');
  document.getElementById(anchor)?.scrollIntoView({ block: 'start' });
  const section = document.getElementById(anchor);
  let inline = section.querySelector('.material-error');
  if (!inline) {
    inline = document.createElement('p');
    inline.className = 'error material-error';
    inline.setAttribute('role', 'alert');
    section.querySelector('h2').after(inline);
  }
  inline.textContent = message;
}

function openDetail(record, from, tab = '剧集管理') {
  ui.selected = record.id;
  ui.detailFrom = from;
  ui.detailTab = tab;
  navigate('detail');
}

const clickActions = {
  nav: (_, view) => navigate(view),
  side: (_, side) => navigate(side === 'platform' ? 'eval' : 'supplierEval'),
  'toggle-notes': () => {
    const canvas = root.querySelector('.canvas');
    if (canvas.scrollLeft >= canvas.scrollWidth - canvas.clientWidth - 8) canvas.scrollTo({ left: 0, behavior: 'smooth' });
    else showNote();
  },
  'reset-filter': () => { ui.filters = {}; ui.filterDraft = {}; ui.checked.clear(); if (ui.tablePages[ui.view]) ui.tablePages[ui.view].page = 1; render(); },
  'clear-filter-value': (_, key) => {
    const [name, value] = key.split(':');
    ui.filterDraft[name] = (ui.filterDraft[name] || []).filter(item => item !== value);
    render();
  },
  page: (_, key) => {
    const [name, page] = key.split(':');
    if (ui.tablePages[name] && Number(page) > 0) ui.tablePages[name].page = Number(page);
    render();
  },
  'download-evaluation': () => {
    const selected = records.filter(r => ui.checked.has(r.id));
    if (!selected.length) return;
    const cells = value => '"' + String(value ?? '').replace(/"/g, '""') + '"';
    const rows = [['ID', '供应商', '剧集名称', '集数', ...GROUPS, '综合结果', '最近提交时间'], ...selected.map(r =>
      [r.id, r.supplier, r.name, r.episodes, ...GROUPS.map((_, i) => groupStatus(r, i)), combined(r), r.submitted])];
    const blob = new Blob(['\ufeff' + rows.map(row => row.map(cells).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = '内容评估合集列表_原型演示.csv'; a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    ui.checked.clear(); render(); announce('已下载所选合集列表');
  },
  close: closeModal,
  submit: r => openModal('submit', r?.id, {
    name: r?.name || '', episodes: r?.episodes || '', link: r?.link || '', intent: r?.intent.slice() || [], exclude: r?.exclude.slice() || []
  }),
  'edit-material': r => { ui.edit = structuredClone(r); navigate('material'); },
  'remove-release': (_, channel) => { ui.edit.release = ui.edit.release.filter(item => item !== channel); render(); },
  'material-back': () => navigate('supplierContent'),
  'save-material': () => saveMaterial(),
  'next-step': () => saveMaterial(ui.view === 'material' ? 'film' : 'deliver'),
  'prev-step': () => navigate(ui.view === 'deliver' ? 'film' : 'material'),
  deliver: () => saveMaterial('submit'),
  anchor: (_, anchor) => {
    ui.collapsedSections.delete(anchor); render();
    document.getElementById(anchor)?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  },
  'collapse-section': (_, anchor) => { ui.collapsedSections.has(anchor) ? ui.collapsedSections.delete(anchor) : ui.collapsedSections.add(anchor); render(); },
  'material-tab': (_, tab) => { ui.materialTab = tab; render(); },
  'open-compliance': r => openDetail(r, 'materialAudit', '合规文件'),
  'open-detail': r => openDetail(r, ui.view),
  'detail-back': () => navigate(ui.detailFrom),
  'detail-tab': (_, tab) => { ui.detailTab = tab; render(); },
  'inspect-collection': () => openModal('collection-info', ui.selected, { tab: '物料详情', section: 'basic' }),
  'inspect-channel': (_, channel) => {
    if (channelsFor(val(ui.selected)).includes(channel)) openModal('collection-info', ui.selected, { tab: '物料详情', section: 'basic' }, { channel });
  },
  'inspect-tab': (_, tab) => { ui.modal.draft.tab = tab; render(); },
  'inspect-section': (_, section) => {
    ui.modal.draft.section = section; render();
    const list = root.querySelector('.inspection-sections');
    const target = document.getElementById('inspect-' + section);
    if (list && target) list.scrollTo({ top: target.offsetTop, behavior: 'auto' });
  },
  'supplier-info': r => openModal('supplier-info', r.id),
  'preview-material': (_, key) => {
    const [field, index] = key.split(':');
    const record = val(ui.selected);
    const file = record.materials[field]?.[index];
    if (file) openModal('attachment', record.id, {}, { file, returnModal: ui.modal?.type === 'collection-info' ? structuredClone(ui.modal) : null });
  },
  'remove-file': (_, key) => {
    const [field, index] = key.split(':');
    if (field === 'auth') ui.modal.draft.authorization.splice(Number(index), 1);
    else if (field === 'film') ui.edit.film = null;
    else ui.edit.materials[field]?.splice(Number(index), 1);
    render();
  },
  result: (_, key) => {
    const [id, group] = key.split(':').map(Number);
    openModal('result', id, { result: group === -2 ? '驳回' : '通过', opinion: '' }, { group });
  },
  'material-result': r => openModal('material-result', r.id, { result: '通过', opinion: '' }),
  review: r => openModal('review', r.id),
  history: r => openModal('history', r.id),
  auth: r => openModal('auth', r.id, { contact: r.contact, authorization: [] }),
  scheduling: r => {
    const launch = r.launch || r.supplierDate || '';
    openModal('scheduling', r.id, {
      launch: launch.length > 10 ? launch.replace(' ', 'T') : '',
      freeTime: (r.freeTime || '').replace(' ', 'T')
    });
  },
  'channel-list': r => openModal('channelList', r.id),
  'channel-detail': (_, channel) => {
    ui.channel = channel;
    openDetail(val(ui.modal.id), 'channel');
  },
  assign: (_, channel) => openModal('assign', ui.modal.id, { operator: channel + '运营' }, { channel }),
  wechat: r => {
    if (!canEditWechat(r)) return;
    openModal('wechat', r.id, { status: r.wechat?.status || '未送审', time: r.wechat?.time?.replace(' ', 'T') || '' });
  }
};

root.addEventListener('click', event => {
  const button = event.target.closest('button');
  if (!button) return;
  if (['clear-filter-value', 'remove-release'].includes(button.dataset.act)) event.preventDefault();
  if (button.dataset.note) return showNote(button.dataset.note);
  const { act: action, id } = button.dataset;
  clickActions[action]?.(val(id), id);
});

function refreshSelection() {
  const selected = root.querySelectorAll('[data-row-select]');
  const all = root.querySelector('[data-select-all]');
  const count = [...selected].filter(input => input.checked).length;
  if (all) { all.checked = selected.length > 0 && count === selected.length; all.indeterminate = count > 0 && count < selected.length; }
  const label = root.querySelector('.selected-count');
  if (label) label.textContent = '已选' + ui.checked.size + '条';
  const download = root.querySelector('[data-act="download-evaluation"]');
  if (download) download.disabled = !ui.checked.size;
}

function readFilters(form) {
  const data = new FormData(form), result = Object.fromEntries(data);
  form.querySelectorAll('[data-multi]').forEach(control => { result[control.dataset.multi] = data.getAll(control.dataset.multi); });
  return result;
}

document.addEventListener('click', event => {
  root.querySelectorAll('.multi-select[open], .release-select[open]').forEach(menu => {
    if (!menu.contains(event.target)) menu.open = false;
  });
});

function fileChanged(field) {
  const files = [...field.files];
  const allowed = file => {
    if (field.name === 'ai') return file.type.startsWith('image/') || /\.(pdf|png|jpe?g|gif|webp|bmp|svg|avif|heic|heif|tiff?)$/i.test(file.name);
    if (field.name === 'wx') return /\.pdf$/i.test(file.name);
    if (field.name === 'auth') return /\.(docx?|pdf)$/i.test(file.name);
    if (field.name === 'film') return file.type.startsWith('video/') || /\.(mp4|mov|webm)$/i.test(file.name);
    return field.accept.includes('image') ? /\.(png|jpe?g)$/i.test(file.name) : field.accept.includes('.psd') ? /\.(png|jpe?g|psd)$/i.test(file.name) : /\.pdf$/i.test(file.name);
  };
  const accepted = files.filter(allowed).map(rememberFile);
  if (field.name === 'auth') ui.modal.draft.authorization.push(...accepted);
  else if (field.name === 'film' && accepted.length) ui.edit.film = accepted[0];
  else if (ui.edit) (ui.edit.materials[field.name] ||= []).push(...accepted);
  render();
  if (accepted.length !== files.length) announce('已跳过格式不支持的文件');
}

root.addEventListener('input', event => {
  const f = event.target;
  if (f.matches('.option-search')) {
    const term = f.value.trim().toLowerCase();
    f.parentElement.querySelectorAll('.select-option').forEach(option => { option.hidden = !option.textContent.toLowerCase().includes(term); });
    return;
  }
  if (f.closest('[data-form="filters"]')) { ui.filterDraft = readFilters(f.closest('form')); return; }
  if (!f.name || ['checkbox', 'file'].includes(f.type)) return;
  if (f.closest('[data-form="dialog"]') && ui.modal && Object.hasOwn(ui.modal.draft, f.name)) ui.modal.draft[f.name] = f.value;
  if (ui.edit && f.closest('.editor') && ['type', 'round', 'partner', 'contact', 'supplierDate', 'synopsis', 'contract', 'filmLink'].includes(f.name)) {
    ui.edit[f.name] = f.value;
  }
  if (ui.edit && f.dataset.extra) (ui.edit.materialExtras ||= {})[f.dataset.extra] = f.value;
});

root.addEventListener('change', event => {
  const f = event.target;
  if (f.dataset.rowSelect) {
    f.checked ? ui.checked.add(Number(f.dataset.rowSelect)) : ui.checked.delete(Number(f.dataset.rowSelect));
    refreshSelection(); return;
  }
  if (f.hasAttribute('data-select-all')) {
    root.querySelectorAll('[data-row-select]').forEach(row => {
      row.checked = f.checked;
      f.checked ? ui.checked.add(Number(row.dataset.rowSelect)) : ui.checked.delete(Number(row.dataset.rowSelect));
    });
    refreshSelection(); return;
  }
  if (f.dataset.pageSize) { ui.tablePages[f.dataset.pageSize] = { page: 1, size: Number(f.value) }; render(); return; }
  if (f.dataset.pageJump) {
    const maximum = Number(f.max);
    ui.tablePages[f.dataset.pageJump].page = Math.max(1, Math.min(maximum, Number(f.value) || 1)); render(); return;
  }
  if (f.closest('[data-form="filters"]')) {
    ui.filterDraft = readFilters(f.closest('form'));
    const menu = f.closest('.multi-select');
    if (menu) {
      const selected = ui.filterDraft[menu.dataset.multi] || [];
      menu.querySelector('.select-values').innerHTML = selected.length ? selected.map(value => '<span class="select-chip">' + esc(value) +
        ' <button type="button" data-act="clear-filter-value" data-id="' + menu.dataset.multi + ':' + esc(value) + '" aria-label="移除' + esc(value) + '">×</button></span>').join('') : '<span class="placeholder">全部</span>';
    }
    return;
  }
  if (f.dataset.switch === 'channel') {
    ui.channel = f.value;
    if (ui.modal?.type === 'wechat' && !canEditWechat(val(ui.modal.id))) ui.modal = null;
    render();
    return;
  }
  if (f.dataset.switch === 'group') {
    ui.group = GROUPS.indexOf(f.value);
    if (ui.modal?.type === 'result') ui.modal = null;
    render();
    return;
  }
  if (f.type === 'file') return fileChanged(f);
  const checked = name => [...root.querySelectorAll('input[name="' + name + '"]:checked')].map(i => i.value);
  if (ui.modal?.type === 'submit' && f.type === 'checkbox') {
    ui.modal.draft.intent = checked('intent');
    ui.modal.draft.exclude = ui.modal.draft.intent.includes(CHANNELS[0]) ? checked('exclude') : [];
    render();
  } else if (ui.modal?.type === 'wechat' && f.name === 'status') {
    if (f.value !== '已送审') ui.modal.draft.time = '';
    render();
  } else if (ui.view === 'material' && f.name === 'release') {
    ui.releaseMenu = f.closest('details').open;
    ui.edit.release = checked('release');
    render();
  } else if (ui.view === 'material' && f.name === 'type') {
    render();
  } else if (ui.view === 'material' && f.dataset.extra === 'dateConfirmed') {
    render();
  } else {
    return;
  }
  const replacement = [...root.querySelectorAll('[name="' + f.name + '"]')]
    .find(control => control.value === f.value);
  replacement?.focus({ preventScroll: true });
});

root.addEventListener('toggle', event => {
  if (event.target.matches('.release-select')) ui.releaseMenu = event.target.open;
}, true);

function submitDialog(form) {
  const modal = ui.modal;
  const d = modal.draft;
  const r = val(modal.id);
  const data = new FormData(form);
  let success = '已保存';
  switch (modal.type) {
    case 'submit': {
      if (!d.intent.length) return error('请选择至少一个意向发行渠道。');
      const title = String(data.get('name')).trim();
      const linkValue = String(data.get('link')).trim();
      if (!title) return error('请填写合集名称。');
      if (!/^https?:\/\//i.test(linkValue)) return error('一卡链接需以 http:// 或 https:// 开头。');
      const fields = {
        name: title, episodes: Number(data.get('episodes')), link: linkValue, submitted: now(),
        intent: d.intent, exclude: d.intent.includes(CHANNELS[0]) ? d.exclude : [], quality: '待评估', groups: ['', '', ''], reviews: []
      };
      if (r) {
        (r.evaluationHistory ||= []).unshift({ intent: r.intent, exclude: r.exclude, reviews: r.reviews, time: r.submitted });
        Object.assign(r, fields);
      } else {
        records.unshift(newRecord(Math.max(...records.map(item => item.id)) + 1, fields));
      }
      success = '已提交评估';
      break;
    }
    case 'result':
    case 'material-result': {
      const result = data.get('result');
      const opinion = String(data.get('opinion') || '').trim();
      if (result === '驳回' && !opinion) return error('请填写驳回原因。');
      if (modal.type === 'material-result') {
        r.materialStatus = result === '通过' ? '通过' : '拒绝';
        recordLog(r, '物料审核' + r.materialStatus + (opinion ? ' · ' + opinion : ''));
        syncBusiness(r);
      } else {
        if (modal.group < 0) {
          r.quality = result;
        } else {
          if (r.quality !== '通过' || groupStatus(r, modal.group) !== '待评估') return error('该组当前无待处理评估。');
          r.groups[modal.group] = result;
        }
        r.reviews.unshift({ group: modal.group < 0 ? -1 : modal.group, result, opinion, time: now() });
      }
      success = '审核结果已保存';
      break;
    }
    case 'auth':
      if (r.stage !== STAGES[0]) return error('该合集已离开待授权书。');
      if (!d.authorization.length) return error('请先上传授权书。');
      r.contact = String(data.get('contact'));
      r.authorization.push(...d.authorization);
      r.stage = STAGES[1];
      recordLog(r, '授权书已关联合集，进入待排播确认');
      success = '授权书已保存，已流转至排播上线负责人';
      break;
    case 'scheduling':
      if (!r.authorization.length || r.stage === STAGES[0]) return error('请先由商务保存授权书。');
      if (!data.get('launch')) return error('请选择完整的上线日期和时分。');
      if (!data.get('freeTime')) return error('请选择完整的转免日期和时分。');
      r.launch = data.get('launch').replace('T', ' ');
      r.freeTime = data.get('freeTime').replace('T', ' ');
      if (r.stage === STAGES[1]) {
        r.stage = STAGES[2];
        recordLog(r, '确认上线时间 ' + r.launch + '、转免时间 ' + r.freeTime + '，全部发行渠道进入渠道分派');
        success = '排播已确认，已流转至渠道负责人';
      } else {
        recordLog(r, '更新上线时间 ' + r.launch + '、转免时间 ' + r.freeTime);
        success = '排播时间已更新';
      }
      break;
    case 'assign':
      if (r.stage !== STAGES[2] || !channelsFor(r).includes(modal.channel)) return error('该渠道当前无法分配。');
      r.assignment[modal.channel] = String(data.get('operator'));
      recordLog(r, '已分配' + modal.channel + '渠道运营');
      success = '已分配渠道运营';
      break;
    case 'wechat': {
      if (!canEditWechat(r)) return error('当前身份无法编辑此合集。');
      const status = String(data.get('status'));
      const time = status === '已送审' ? String(data.get('time') || '').replace('T', ' ') : '';
      if (!WECHAT.includes(status) || (status === '已送审' && !time)) return error('请选择送审状态并补齐时间。');
      if (r.wechat) r.wechatHistory.unshift({ ...r.wechat, changedAt: now() });
      r.wechat = { status, time };
      recordLog(r, '送审情况更新为' + status + (time ? ' · ' + time : ''));
      success = '送审情况已保存';
      break;
    }
    default:
      return;
  }
  persist();
  closeModal();
  announce(success);
}

root.addEventListener('submit', event => {
  event.preventDefault();
  if (event.target.dataset.form === 'filters') {
    const draft = readFilters(event.target);
    if ((draft.start && draft.end && draft.start > draft.end) || (draft.launchStart && draft.launchEnd && draft.launchStart > draft.launchEnd)) {
      return error('开始日期不能晚于结束日期。', '.filter-error');
    }
    ui.filterDraft = draft;
    ui.filters = structuredClone(draft);
    ui.checked.clear();
    if (ui.tablePages[ui.view]) ui.tablePages[ui.view].page = 1;
    render();
  } else if (event.target.dataset.form === 'dialog' && ui.modal) {
    submitDialog(event.target);
  }
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && ui.modal) closeModal();
});

window.addEventListener('hashchange', () => {
  const requested = location.hash.slice(1);
  navigate(entryViews.includes(requested) ? requested : 'supplierEval');
});

render();
