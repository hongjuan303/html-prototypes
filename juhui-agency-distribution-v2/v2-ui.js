ui.qualityActor = 'q-domestic'; ui.supplierId = sessionStorage.getItem('juhui-agency-distribution-v2-supplier') || 's1'; ui.exportIds = new Set();
ui.v2Collapsed = new Set();
v2EnsureScheduleConfirmationCase();
v2EnsureScheduleExamples();
if (!localStorage.getItem(V2_CONFIG_KEY)) v2SaveConfig();
changedFields.clear();
['内容类型', '发行轮次', '剧集简介', '海外YouTube是否首发', '优酷版权文件', '渠道内容ID', '本次审核总时长', '单集审核备注', '负责商务', '登录账号', '绑定手机号', '关联渠道', '录入组件', '评估意见', '反馈意见', '剧集首发时间', '上线时间', '转免时间'].forEach(name => changedFields.add(name));
['YouTube是否首发', '质量评估状态', '本人渠道评估', '负责评估渠道', '字段名称', '显示条件', '业务标签', '本轮类型', '评估结果', '最终结果', '渠道名称', '渠道范围'].forEach(name => changedFields.add(name));
NAV.platform.splice(0, NAV.platform.length,
  ['eval', '内容评估', 'review'], ['materialAudit', '物料审核负责人', 'folder'],
  ['filmAuditV2', '正片审核负责人', 'video'], ['business', '商务负责人', 'user'], ['schedule', '排播上线负责人', 'calendar'],
  ['channel', '渠道负责人', 'grid'], ['operator', '渠道运营', 'send'], ['dataV2', '短剧数据', 'grid'],
  ['suppliersV2', '供应商管理', 'user'], ['permissionsV2', '人员权限配置', 'user']);
const v2PlatformViews = [...NAV.platform.map(([id]) => id), 'overviewV2', 'filmReviewV2', 'qualityV2', 'exportV2'];
v2PlatformViews.forEach(view => { if (!platformViews.includes(view)) platformViews.push(view); if (!entryViews.includes(view)) entryViews.push(view); });
channelsFor = v2ChannelList;
const v2OriginalAreas = collectionMaterialAreas;
collectionMaterialAreas = function (r, marker, allowAudit) {
  const areas = v2OriginalAreas(r, 0, allowAudit);
  areas.合规文件 = '<section class="editor-section"><h2>合规文件</h2><dl class="bordered-descriptions">' + v2FieldsFor(r).map(f => detailField(f.name, f.component.includes('上传') ? v2FileList(r.materials[f.key] || []) : esc(r.customMaterials[f.key] || '—'))).join('') + '</dl>' +
    (ui.detailFrom === 'materialAudit' && r.materialStatus === '审核中' ? '<div class="panel-tools">' + act('审核物料', 'material-result', r.id, 'btn primary') + '</div>' : '') + '</section>';
  areas.授权书 = '<div class="tab-content">' + v2FileList(r.authorization) + '</div>';
  return areas;
};
channelCards = function (r) {
  const channels = v2ChannelList(r), status = r.stage === STAGES[3] ? '已上线' : '未上线';
  const showWechat = channels.includes('微信视频号') && canSeeWechat(r);
  const showMiddle = channels.includes('字节系') && ui.channel === '字节系' && ['channel', 'operator'].includes(ui.detailFrom) && v2Supplier(r).managed && ['待发行', '已发行'].includes(r.stage);
  const copyValue = (value, label, html = '') => value && value !== '—' ? '<div class="v2-channel-value"><span>' + (html || esc(value)) + '</span><button type="button" class="v2-copy" data-act="v2-copy" data-id="' + esc(encodeURIComponent(value)) + '" aria-label="复制' + esc(label) + '">复制</button></div>' : '—';
  const rows = channels.map(channel => {
    const actual = r.onlineSnapshot?.channels.find(c => c.key === channel);
    const current = channel === ui.channel && ['channel', 'operator'].includes(ui.detailFrom), operator = current && ui.detailFrom === 'operator' && r.assignment[channel];
    const wechat = channel === '微信视频号' ? '<div class="v2-channel-status">' + tag(r.wechat?.status || (r.onlineSnapshot ? '未读取' : '—')) + (r.wechat?.time ? timestamp(r.wechat.time) : '') + '</div>' : '—';
    const pending = r.channelReturns[channel] || [];
    const materialReturn = r.channelMaterialReturns?.[channel];
    const feedback = pending.map(item => '<p><strong>第' + item.index + '集</strong> ' + tag(item.status) + '<span>' + esc(item.opinion) + '</span></p>').join('') + (materialReturn ? '<p><strong>物料</strong> ' + tag(materialReturn.status) + '<span>' + esc(materialReturn.opinion) + '</span></p>' : '');
    const cells = [esc(actual?.label || (channel === '字节系' ? '字节系（红果和抖音）' : channel)), copyValue(actual?.workName || r.name, '作品名称'), tag(actual?.status || status), copyValue(v2LaunchTime(r) || actual?.launch, '上线时间'), copyValue(v2FreeTime(r), '转免时间'),
      copyValue(r.channelContentIds?.[channel] || actual?.contentId, '渠道内容ID'), copyValue(r.assignment[channel], '渠道运营')];
    if (showWechat) cells.push(wechat);
    if (showMiddle) cells.push(channel === '字节系' ? copyValue(v2Supplier(r).middleAccount || '未配置', '字节中台账号') : '—', channel === '字节系' ? '<div class="v2-channel-secret"><span class="v2-password">••••••••</span>' + act('查看', 'v2-reveal-middle', r.id) + '</div>' : '—');
    cells.push(feedback ? '<div class="v2-channel-feedback">' + feedback + '</div>' : '—', '<div class="actions v2-channel-row-actions">' + (current ? act('编辑', 'v2-channel-edit', r.id) : '') + (operator ? act('驳回物料', 'v2-channel-material-reject', r.id) + act('驳回正片', 'v2-channel-reject', r.id) + (pending.some(e => e.status === '待复核') ? act('复核通过', 'v2-channel-approve', r.id) : '') + (materialReturn?.status === '待复核' ? act('物料复核通过', 'v2-channel-material-approve', r.id) : '') : '') + act('查看', 'inspect-channel', channel) + '</div>');
    return line(...cells).replace('<tr>', '<tr data-channel-row="' + esc(channel) + '">');
  });
  const columns = ['渠道', '作品名称', '发布状态', '上线时间', '转免时间', '渠道内容ID', '渠道运营', ...(showWechat ? ['送审情况'] : []), ...(showMiddle ? ['字节中台账号', '字节中台密码'] : []), '渠道修改意见', '操作'];
  return '<div class="v2-channel-list' + (showMiddle ? ' with-middle-account' : '') + '" data-collection-id="' + r.id + '">' + listing('渠道列表', columns, rows, '<span class="muted">横向滚动查看全部字段</span>', { key: 'v2-channel-list-' + r.id, className: 'v2-channel-table' }).replace('暂无匹配的合集', '暂无渠道信息') + '</div>';
};
clickActions['v2-reveal-middle'] = r => {
  if (ui.channel !== '字节系' || !['channel', 'operator'].includes(ui.detailFrom) || !['待发行', '已发行'].includes(r.stage)) return;
  const value = root.querySelector('.v2-password'); if (value) value.textContent = value.textContent === '••••••••' ? v2Supplier(r).middlePassword || '未配置' : '••••••••';
};
clickActions['v2-collapse-material'] = (_, id) => { ui.v2Collapsed.has(id) ? ui.v2Collapsed.delete(id) : ui.v2Collapsed.add(id); render(); };
clickActions['v2-material-anchor'] = (_, id) => {
  ui.v2Collapsed.delete(id); render();
  const target = root.querySelector('#v2-material-section-' + id), screen = root.querySelector('.screen');
  if (target && screen) screen.scrollTo({ top: target.getBoundingClientRect().top - screen.getBoundingClientRect().top + screen.scrollTop - 12, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
};
const v2OriginalDetail = detail;
function v2Detail() {
  const fragment = document.createElement('div'); fragment.innerHTML = v2OriginalDetail();
  fragment.querySelectorAll('[data-note]').forEach(n => n.remove());
  fragment.querySelector('h1')?.insertAdjacentHTML('beforeend', ' ' + mark(1));
  if (ui.detailTab === '剧集管理') {
    fragment.querySelector('.v2-channel-list .panel-header h2')?.insertAdjacentHTML('beforeend', ' ' + mark(2));
    fragment.querySelector('.v2-channel-table th:last-child')?.insertAdjacentHTML('beforeend', ' ' + mark(3));
  }
  if (ui.detailTab === '合规文件') fragment.querySelector('.editor-section h2')?.insertAdjacentHTML('beforeend', ' ' + mark(2));
  return fragment.innerHTML;
}
const v2OriginalEvaluation = evaluation;
function v2ContentEvaluation() { const fragment = document.createElement('div'); fragment.innerHTML = v2OriginalEvaluation(); const bar = fragment.querySelector('.tabs'); if (bar) bar.outerHTML = tabs(V2_EVALUATION_TABS, ui.view, 'nav'); return fragment.innerHTML; }
Object.assign(views, { overviewV2: v2Overview, supplierEval: v2SupplierEvaluation, supplierContent: v2SupplierContent, qualityV2: v2Quality, eval: v2ContentEvaluation,
  business: v2Business, schedule: v2Schedule, filmAuditV2: v2FilmQueue, filmReviewV2: v2FilmReview, materialsV2: v2Material,
  suppliersV2: v2Suppliers, permissionsV2: v2Personnel, exportV2: v2Export, detail: v2Detail, dataV2: v2DataView });

const v2Note = (page, goal, sections = [], caution = '') => ({ page, background: '', goal, sections, caution });
const V2_NOTES = {
  'v2-submit': v2Note('提交剧集信息', '新增内容类型、轮次、简介与YouTube首发信息。', [['配置项', [['内容类型', '单选国内漫剧、国内真人、海外本土漫剧、海外本土真人、海外本土-AI仿真人。'], ['发行轮次', '单选首发、二轮。'], ['剧集简介', '上限1000字。'], ['海外YouTube是否首发', '意向渠道包含海外YouTube时展示并选择是／否；取消该渠道后不再提交此值。']]], ['操作项', [['提交评估', '按本轮意向渠道和人员权限生成评估任务。新提交保存本轮资料，重提保留历史意见；消息推送由技术另行处理。'], ['取消', '本次输入不写入合集。']]]]),
  qualityV2: v2Note('内容评估 · 内容质量评估', '在【内容评估】菜单的【内容质量评估】Tab中按意向渠道分配任务。', [['列表项', [['本人渠道评估', '只允许当前评估人员处理分配给自己的渠道任务，已给出意见和待评估分别展示。'], ['质量评估状态', '全部渠道完成或国内渠道完成即可进入商务待反馈，不因海外待评估阻止国内已完成的商务反馈。']]], ['操作项', [['渠道评估', '通过／驳回均填写意见并向供应商展示。'], ['撤回驳回', '商务最终反馈前，可撤回本人驳回并恢复待评估，历史留痕；最终反馈后的撤回口径待确认。']]]]),
  'v2-quality-result': v2Note('渠道质量评估', '独立维护本人的渠道意见。', [['配置项', [['评估结果', '通过或驳回，意见不能为空。']]], ['操作项', [['提交意见', '提交到本轮渠道任务，供应商及商务均可查阅。'], ['取消', '不保存本次输入。']]]]),
  'v2-opinions': v2Note('评估意见', '供应商与商务查看全部人员和商务意见。', [['列表项', [['渠道意见', '展示渠道、人员、结果、完整意见及时间，评估说明按列宽换行，不省略内容。'], ['历史记录', '展示驳回撤回及修改重提记录，保留原意见快照。']]]]),
  'v2-delivery': v2Note('交付记录', '查看分集结果、原始文件名及物料附件。', [['列表项', [['正片与物料', '展示当前文件原名和分集意见，下载从新窗口发起，原页面保持不变。历史无原件时反馈不可用，不生成虚假文件。']]]]),
  'v2-export-fields': v2Note('合集全部字段', '在导出前查看该合集已经记录的全部字段。', [['列表项', [['合集字段', '展示当前合集的完整字段和值，包括嵌套信息和附件元数据；导出不含独立供应商配置中的账号密码。']]]]),
  'collection-info': v2Note('合集／渠道详情弹窗', '在原有物料及正片分组核对V2资料。', [['列表项', [['资料与附件', '物料字段按V2渠道配置和条件展示，保留原始文件名，新窗口下载。正片审核及真实分集处理从独立正片审核入口进行。']]]]),
  'v2-channel-material-reject': v2Note('渠道物料驳回', '保留运营原有的物料驳回操作。', [['配置项', [['修改意见', '记录本渠道物料需要补充或替换的内容。']]], ['操作项', [['确认驳回', '供应商收到该渠道修改意见，补齐后仅该渠道进入待复核，其他渠道及原平台通过结果保留。']]]]),
  'v2-business-final': v2Note('商务最终反馈', '国内渠道完成即允许反馈，海外未完成时仍保留待评估任务。', [['配置项', [['最终结果', '通过／驳回及必填反馈意见，提交前可查全部历史意见。']]], ['操作项', [['提交最终反馈', '通过后进入内容评估，驳回后供应商可修改重提；意见向客户展示。']]]]),
  filmAuditV2: v2Note('正片审核负责人', '统计本轮待审视频时长，沿用现有审核人员分配。', [['列表项', [['本次审核总时长', '初审按全集视频时长汇总；复审仅统计本轮替换集数，读取实际视频元数据。']]], ['操作项', [['调配审核人员', '沿用负责人分配审核人员，保存后队列立即更新。'], ['开始审核', '进入分集播放器，备注外置且单集结果在完成审核前可反复修改。']]]]),
  filmReviewV2: v2Note('分集正片审核', '把单集结果与本轮最终确认分开。', [['列表项', [['本次审核总时长', '只合计本轮审核集数，非本轮分集可查看但不可改判。'], ['倍速', '包含0.5、1、1.5、2、2.5倍，不提供3倍。']]], ['配置项', [['单集审核备注', '在播放器旁常驻，审核过程中可随时填写，驳回集必须填写意见。'], ['单集结果', '点击通过后仍可改为驳回，反之亦然；此时只更新本轮草稿。']]], ['操作项', [['完成审核', '本轮每集均有结果、驳回集备注齐全后才可最终确认；保存历史后更新合集审核状态。'], ['返回列表', '有未确认草稿时提示，确认返回才放弃本次草稿。']]]]),
  'v2-film-upload': v2Note('上传正片', '实际读取视频尺寸并校验短边。', [['配置项', [['正片分集', '每集选择视频，短边≥720。首次补齐全部分集；复审需替换所有驳回集，保持未替换集和已通过结论。']]], ['操作项', [['提交正片审核', '记录本轮替换集及真实时长，沿用现有审核任务分配。'], ['取消', '不保存本次替换。']]]]),
  'v2-assign-film': v2Note('调配正片审核人员', '沿用负责人分配正片审核人员。', [['配置项', [['审核人员', '选择具有正片审核权限的人员。']]], ['操作项', [['确认调配', '更新该合集审核人员，不改已保存单集意见。']]]]),
  business: v2Note('商务负责人', '增加质量评估及三组内容评估状态，并维护授权书。', [['列表项', [['评估状态', '分别显示质量最终状态、审核组、红果组和运营组状态。']]], ['操作项', [['最终反馈', '国内评估完成或全部评估完成时出现。'], ['维护授权书', '允许新增和删除附件。已进入后续环节时保存至少一份有效文件，防止误删后资料缺失；删除最后一份的正式回退规则待确认。']]]]),
  'v2-auth': v2Note('维护授权书', '上传后可删除文件，保留正确原名。', [['配置项', [['授权书', 'V2建议方案：Word／PDF，单文件100MB、单次上传合计500MB；选择超限文件时提示并阻止新增，历史原件保留可查。']]], ['操作项', [['删除', '从本次附件草稿移除，保存才生效。'], ['保存', '与物料审核通过、正片审核通过同时满足时进入待排播确认；授权书先保存时等待两项审核通过。已进入运营的历史记录不重复流转。'], ['取消', '保留原附件。']]]]),
  schedule: v2Note('排播上线负责人', '按上线时间确认状态筛选，已确认后才流转至渠道负责人阶段。', [
    ['筛选项', [['上线时间', '下拉单选：全部／待确认／已确认，默认及重置为全部。待确认包含供应商已填但排播负责人未确认，以及供应商未填写；已确认包含供应商已填且排播负责人确认，以及供应商未填、排播负责人补填并保存。']]],
    ['列表项', [['进入条件', '物料审核通过、正片审核通过且有授权书，三项同时满足后进入本菜单。'], ['上线时间', '与供应商【剧集首发时间】为同一字段，回显时间及待确认／已确认状态；未填写显示“待填写”及待确认，仅填写时间不视为已确认。'], ['转免时间', '供应商填写首发时间后默认取同一值，排播负责人无需再填；已单独设置的值保留。']]],
    ['操作项', [['确认', '供应商已填写时，点击确认沿用上线、转免时间；状态变为已确认，剧集流转至渠道负责人阶段。'], ['设置上线时间', '供应商未填写时，由排播负责人填写并保存，状态变为已确认，流转至渠道负责人阶段；两端时间同步。已确认记录保留修改时间入口。'], ['流转校验', '只有已确认上线时间的剧集才进入渠道负责人阶段。确认或保存时重查双审、授权书及时间有效性；取消或校验失败保持待确认，重复确认不重复流转。']]]
  ], '11.19 更新。'),
  'v2-scheduling': v2Note('设置上线时间', '与供应商的剧集首发时间共用同一个值，由排播负责人补充或维护。', [['配置项', [['上线时间', '必填，使用同一个日期时间选择器填写日期和时分，精确到分钟；保存后同步供应商首发时间及平台各引用页面。'], ['转免时间', '供应商已填首发时间时默认同值，仅确认即可；此弹窗用于未填首发时间或后续维护，保留原有值且不额外必填。']]], ['操作项', [['确认', '重新核对物料、正片均通过且有授权书；上线时间完整有效后保存，标记已确认并流转至渠道负责人阶段；缺项或条件变化时保留表单并提示。'], ['取消', '关闭弹窗返回原列表，不修改时间、流程或渠道归属。']]]]),
  permissionsV2: v2Note('人员权限配置', '渠道质量评估人员按负责渠道配置，商务与管理员可共存。', [['列表项', [['角色', '同一人员允许管理员与商务负责人同时选择。'], ['质量评估渠道', '只分配匹配渠道的本轮任务。']]], ['操作项', [['配置', '保存角色及负责渠道，不重写已经分配的历史任务。']]]]),
  'v2-user': v2Note('人员权限配置', '在同一人员上维护多角色与负责渠道。', [['配置项', [['角色', '可多选，管理员和商务可共存；至少一个角色。'], ['负责质量评估渠道', '配置质量评估角色后必选。']]], ['操作项', [['保存', '更新后续任务分配规则；既有任务需负责人调配。']]]]),
  exportV2: v2Note('合集信息导出', '管理员可勾选多部合集导出全部字段。', [['操作项', [['导出全部字段', '按勾选合集导出UTF-8 CSV，包含当前合集全部已记录字段、嵌套字段、附件原名及分集元数据。供应商登录密码、中台密码不属于合集导出数据。未选择时提示，下载在新窗口发起。']]]]),
  channel: v2Note('渠道负责人', '沿用既有渠道列表，文本可复制。', [['列表项', [['单行展示', '每条记录单行展示；剧集名称、供应商等长文本省略，悬停查看完整内容，横向滚动可查看全部列，操作列固定在右侧。'], ['文本字段', '悬停或键盘聚焦时显示复制按钮，复制完整内容；点击查看渠道继续既有分派操作。']]]]),
  operator: v2Note('渠道运营', '沿用既有渠道列表，进入详情处理本渠道操作。', [['列表项', [['单行展示', '每条记录单行展示；剧集名称、供应商等长文本省略，悬停查看完整内容，横向滚动可查看全部列，操作列固定在右侧。'], ['文本字段', '悬停或键盘聚焦时显示复制按钮，复制完整内容。']]]]),
  detail: v2Note('合集详情', '剧集管理按一行一个渠道展示，保留当前渠道信息与可用操作。', [['列表项（合集信息）', [['文本字段', '只读字段提供复制按钮，复制完整文本并反馈成功。']]], ['列表项（渠道列表，11.16 更新）', [
    ['渠道', '一行一个已配置发行渠道，顺序沿用当前渠道集合，不增加或删除渠道。'], ['作品名称', '展示当前合集作品名，长名称完整换行，悬停可复制。'], ['发布状态', '沿用当前渠道发布状态。'], ['上线时间', '保留已保存的日期和时分，历史未填显示“—”。'], ['转免时间', '供应商首发时间已填时默认同值，保留日期及时分精度；单独维护过的值沿用，其他未填显示“—”。'], ['渠道内容ID', '只展示本渠道已保存的内容ID；通过操作列【编辑】修改。'], ['渠道运营', '显示该渠道已分配的运营，无记录显示“—”。'], ['送审情况', '只展示微信视频号的状态和时间，其他行显示“—”；通过操作列【编辑】填写。'], ['字节中台账号', '仅符合当前V2身份、供应商及阶段条件时显示，字节系行展示账号，其他行显示“—”。'], ['字节中台密码', '与账号同条件展示列；字节系行默认遮罩，点击查看切换，其他行显示“—”。'], ['渠道修改意见', '完整展示本渠道分集与物料的修改意见及处理状态，长文本换行，不串用其他渠道反馈。']
  ]], ['操作项（11.18 更新）', [['编辑', '合并渠道内容ID与送审情况入口，弹窗展示两个字段；按字段原权限编辑，送审情况仅适用于微信视频号，已送审需补充时间。保存一次校验并更新对应行；取消不保存。'], ['查看', '各行均可查看该渠道的物料及正片详情，关闭返回原列表。'], ['批量下载正片', '仅当前有权渠道运营显示，在新窗口获取全部原始分集ZIP，不覆盖当前页面。'], ['驳回物料、驳回正片', '仅当前有权渠道运营显示，沿用原弹窗、校验及本渠道独立留档。'], ['复核通过、物料复核通过', '本渠道存在对应待复核资料时显示，保存后只更新本渠道状态。']]]]),
  'v2-channel-edit': v2Note('编辑渠道信息', '在一个弹窗维护渠道内容ID和送审情况。', [['配置项', [['渠道内容ID', '回填当前渠道内容ID，最长100字；已有值不可清空。尚未填写时可先单独维护送审情况。'], ['送审情况', '微信视频号显示已送审、未送审、无权益；仅微信视频号渠道运营可编辑，其他人员只读。其他渠道显示不适用。'], ['送审时间', '选择已送审后显示且必填，沿用日期时间选择器；切换为其他状态后不保存送审时间。']]], ['操作项', [['保存', '校验全部已修改字段与当前权限，通过后一次保存并更新本渠道行；校验失败保留输入，其他渠道不变。'], ['取消', '关闭弹窗，原内容ID、送审情况及历史记录不变。']]]], '11.18 更新。'),
  'v2-channel-id': v2Note('修改渠道内容ID', '维护本渠道内容标识。', [['配置项', [['渠道内容ID', '必填文本，保留原值并可修改。']]], ['操作项', [['保存', '按当前渠道写入并立即展示。'], ['取消', '保留原内容ID。']]]]),
  'v2-channel-reject': v2Note('渠道正片驳回', '按渠道及分集提交修改意见。', [['配置项', [['分集', '可多选，每个选中分集必填独立意见。已有驳回状态不限制选择其他分集。']]], ['操作项', [['确认驳回', '只影响本渠道分集，不覆盖其他渠道的反馈和物料审核结果。']]]]),
  'v2-channel-feedback': v2Note('供应商渠道修改意见', '按渠道展示分集反馈并上传替换视频。', [['配置项', [['替换视频', '短边仍需≥720，保留旧视频，记录本渠道替换文件及版本。']]], ['操作项', [['提交已替换分集', '仅所替换分集进入本渠道待复核，其他驳回保持待修改；是否重走平台审核仍待确认。']]]]),
  dataV2: v2Note('短剧数据', '代运营供应商按其自己的字节账号建立采集任务。', [['操作项', [['创建采集任务', '读取供应商绑定的中台账号，进入待采集。当前本地原型不接入真实采集服务，也不生成虚假报表。'], ['查看采集记录', '展示账号归属和任务时间，真实采集结果由研发服务接入。']]]]),
};
Object.assign(V2_NOTES, {
  overviewV2: v2Note('需求总览 · 代发行优化v1.3', '本期只纳入v1.3正文及其引用的字段调整，通知交技术处理。', [['列表项', [['业务模块', '按v1.3章节定位本期页面；原型覆盖状态以范围核对文件为准，不能把演示存在等同于本期全部完成。']]], ['其他注意说明', [['待核细则', '物料黄标表、原文图片中的关联、撤回边界、授权书上限和优酷模板仍需核实。']]]], '原型待补：内容评估复用／改意见／重提标记，以及正片与商务确认渠道的并行交付。'),
  supplierEval: v2Note('供应商端 · 内容评估', '展示供应商提交的剧集信息及评估结果。', [['列表项', [['发行轮次', '回显供应商提交的发行轮次：首发／二轮；历史未填写显示“—”。'], ['剧情简介', '回显供应商提交的剧集简介，超长内容省略展示，悬停查看完整内容；未填写显示“—”。'], ['质量评估状态', '按实际意向渠道分派及商务最终反馈展示。'], ['内容评估状态', '内容质量评估为待审核时显示“-”；其他状态沿用实际内容评估结果。']]], ['操作项', [['提交剧集信息', '提交本轮剧集资料和意向渠道，按白名单及渠道配置分派评估任务。'], ['查看评估意见', '按内容质量评估、内容评估两个Tab展示；前者含对应渠道与商务负责人结果，后者含各评估组结果，不展示审核人员。']]]]),
  eval: v2Note('内容评估', '补充仅改集数复用意见、综合结果前改意见及重提标签。', [['列表项', [['仅改集数重提', '只有仅修改集数且审核组／红果组之前均有意见时，复用两组意见，只重新进行运营组评估。'], ['修改意见', '已有一组通过、其他组未处理且无综合最终结果时，可修改已提交意见。'], ['重提', '驳回后重提的剧集在面板显示标签。']]]], '上述三项需补齐原型交互，不以当前演示视为已完成。'),
  supplierContent: v2Note('供应商内容管理', '提交正片时选发行渠道，正片审核与商务确认并行完成后提交物料。', [['操作项', [['上传正片', '本期需同时选择实际发行渠道，并在上方展示四个渠道质量意见及商务最终意见。'], ['填写物料', '正片审核通过前置灰，点击toast【待正片审核通过后上传物料】；正片与商务确认均完成后开放，发行渠道对供应商锁定。'], ['渠道修改意见', '按渠道查看分集及物料意见，替换后保留该渠道记录。']]]], '原型待补：正片提交选渠道、五类意见展示、商务确认门槛及渠道锁定。'),
  materialsV2: v2Note('填写物料', '落实v1.3物料调整，引用黄标表中的字段与渠道规则。', [['配置项', [['发行渠道', '支付宝不再提供；海外TT小程序可见。商务确认后供应商不可修改，完整锁定流程待补。'], ['剧集首发时间', '与平台【上线时间】为同一字段，保存后两端回显同值并保留已有时分；转免时间默认相同，无需另填，修改首发时间时默认值同步。']]], ['配置项', [['剧集梗概', '支持数字；海外关联的具体映射需核对原文图片。'], ['净版无字幕成片、SRT字幕文件', '仅海外Tiktok原生时为选填；B站及其他渠道映射需核对黄标表。']]], ['配置项', [['优酷版权文件', '提供指定模板及【横屏剧集上线优酷需提供】提示；条件和必填细则待核。当前条件为此前评审建议。'], ['文件名', '平台回显及下载保持供应商原名。']]], ['操作项', [['保存草稿', '允许不完整，保留已填写及已上传资料。'], ['提交物料审核', '需正片审核、商务确认均完成且适用字段完整。当前还需补商务确认门槛和部分字段匹配。']]]], '黄标表和原文图片细则未读全，不能用旧版500字等规则替代本次确认。'),
  suppliersV2: v2Note('供应商管理', '配置负责商务，维护登录账号、手机号及密码登录。', [['列表项', [['负责商务', '管理员绑定对应商务，新剧提交读取该归属。'], ['登录账号、绑定手机号', '维护供应商可用的登录标识，密码登录需可用。']]], ['操作项', [['编辑', '保存商务归属、账号、手机号及本地演示密码；取消保留原配置。']]]]),
  'v2-supplier': v2Note('编辑供应商', '维护本期商务归属及登录资料。', [['配置项', [['负责商务', '选择已有商务角色的人员。'], ['登录账号、绑定手机号', '保持唯一，手机号校验11位。'], ['设置登录密码', '仅本地演示，留空保留原值，正式认证由研发实现。']]], ['操作项', [['保存', '更新本地配置及后续新剧商务归属。'], ['取消', '不改现有资料。']]]]),
  dataV2: v2Note('短剧数据', '保留线上既有菜单，本期没有新增账号采集需求。', [])
});
V2_NOTES.supplierEval.caution = '11.19 更新。';
V2_NOTES['v2-film-upload'].caution = '原型待补：本次提交需选择实际发行渠道，并展示四渠道及商务的五类意见。';
V2_NOTES['v2-auth'].caution = '原型待补：商务确认并修改实际发行渠道，同时查看五类意见；该确认应与正片审核并行。';
V2_NOTES.detail.sections[2][1] = V2_NOTES.detail.sections[2][1].filter(([name]) => name !== '批量下载正片');
['materialConfigV2', 'v2-field', 'v2-channel', 'v2-managed-rules', 'v2-data-history'].forEach(key => delete V2_NOTES[key]);
['v2-field-edit', 'v2-field-new', 'v2-field-delete', 'v2-field-restore', 'v2-channel-new', 'v2-channel-delete', 'v2-channel-restore', 'v2-managed-rules', 'v2-managed-manual', 'v2-managed-use', 'v2-reveal-middle', 'v2-data-task', 'v2-data-history'].forEach(key => delete clickActions[key]);
const v2OriginalNoteInfo = noteInfo;
noteInfo = function () {
  const key = ui.modal?.type || ui.view;
  if (key === 'detail' && ui.detailTab === '剧集管理') {
    const r = val(ui.selected), rules = V2_NOTES.detail;
    const showWechat = v2ChannelList(r).includes('微信视频号') && canSeeWechat(r);
    const showMiddle = v2ChannelList(r).includes('字节系') && ui.channel === '字节系' && ['channel', 'operator'].includes(ui.detailFrom) && v2Supplier(r).managed && ['待发行', '已发行'].includes(r.stage);
    return { ...rules, sections: [rules.sections[0], [rules.sections[1][0], rules.sections[1][1].filter(([field]) => field === '送审情况' ? showWechat : field.startsWith('字节中台') ? showMiddle : true)], rules.sections[2]] };
  }
  if (key === 'detail' && ui.detailTab !== '剧集管理') {
    const sections = [V2_NOTES.detail.sections[0]];
    if (ui.detailTab === '合规文件') sections.push(['列表项', [['合规文件', '按V2管理员配置和适用条件展示已交付文件；优酷版权文件及新字段与供应商一致，保留中文原名。']]]);
    return { ...V2_NOTES.detail, sections };
  }
  return V2_NOTES[key] || v2Note(v2OriginalNoteInfo().page, '沿用既有功能，当前页面没有新增的V2需求标注。');
};
const v2OriginalRender = render;
render = function (options) {
  const previousChannels = root.querySelector('.v2-channel-list');
  if (previousChannels) (ui.channelListScroll ||= {})[previousChannels.dataset.collectionId] = previousChannels.querySelector('.table-wrap').scrollLeft;
  v2Config.fields.filter(f => f.key.startsWith('custom-')).forEach(f => changedFields.add(f.name));
  REVIEW_CHANNELS.splice(0, REVIEW_CHANNELS.length, ...v2ActiveChannels());
  v2OriginalRender(options);
  const currentChannels = root.querySelector('.v2-channel-list');
  if (currentChannels) currentChannels.querySelector('.table-wrap').scrollLeft = ui.channelListScroll?.[currentChannels.dataset.collectionId] || 0;
  if (ui.view === 'filmReviewV2') {
    const player = root.querySelector('#v2-player'), r = val(ui.selected), episode = r?.episodeFiles.find(e => e.id === player?.dataset.episodeId);
    if (episode && !episode.url && !ui.filmUrls?.[episode.id]) {
      const key = r.id + ':' + episode.id; ui.videoLoads ||= new Set();
      if (!ui.videoLoads.has(key)) { ui.videoLoads.add(key); v2File(episode).then(file => { const url = URL.createObjectURL(file); (ui.filmUrls ||= {})[episode.id] = url; const current = root.querySelector('#v2-player'); if (ui.view === 'filmReviewV2' && current?.dataset.episodeId === episode.id) current.src = url; }).catch(e => announce(e.message)).finally(() => ui.videoLoads.delete(key)); }
    }
  }
  const tools = root.querySelector('.review-tools');
  tools?.insertAdjacentHTML('afterbegin', act('V2需求总览', 'nav', 'overviewV2', 'review-note'));
  if (ui.side === 'supplier') tools?.insertAdjacentHTML('afterbegin', '<label class="review-select">演示供应商<select data-v2-supplier="true">' + v2Config.suppliers.map(s => '<option value="' + s.id + '"' + (s.id === ui.supplierId ? ' selected' : '') + '>' + esc(s.name) + '</option>').join('') + '</select></label>');
  if (ui.side === 'supplier') { const s = v2Config.suppliers.find(s => s.id === ui.supplierId) || v2Config.suppliers[0], profile = root.querySelector('.profile'); if (profile) profile.innerHTML = '<span class="avatar">' + esc(s.name.slice(0, 1)) + '</span>' + esc(s.name); }
  if (ui.view === 'materialsV2') {
    const form = root.querySelector('.v2-editor'), sections = [...form.querySelectorAll(':scope > .v2-section')];
    const layout = document.createElement('div'); layout.className = 'editor-grid'; layout.innerHTML = '<div class="v2-material-content"></div><aside class="anchor-nav"><h3>快速定位 <small>7项</small></h3>' + sections.map((section, index) => act(section.querySelector('h2').textContent.replace(/\d+$/, '').trim(), 'v2-material-anchor', String(index))).join('') + '</aside>';
    form.insertBefore(layout, sections[0]);
    sections.forEach((section, index) => { section.id = 'v2-material-section-' + index; const header = section.querySelector('header'), body = document.createElement('div'); body.className = 'v2-material-body'; [...section.childNodes].filter(n => n !== header).forEach(n => body.append(n)); section.append(body); body.hidden = ui.v2Collapsed.has(String(index)); header.insertAdjacentHTML('beforeend', act(body.hidden ? '展开' : '收起', 'v2-collapse-material', String(index))); layout.firstElementChild.append(section); });
  }
  if (ui.view === 'materialsV2' && ui.edit.channelReworkMode) { root.querySelectorAll('[name="v2release"]').forEach(f => f.disabled = true); root.querySelector('.v2-flow-steps')?.insertAdjacentHTML('afterend', '<p class="v2-intro">本次补充渠道：' + esc(ui.edit.reworkChannels.join('、')) + '</p>'); }
  const allowed = new Set([...root.querySelectorAll('.note-section')].map(n => n.id.slice(5)));
  root.querySelectorAll('main [data-note], .dialog [data-note]').forEach(n => { if (!allowed.has(n.dataset.note)) n.remove(); });
  root.querySelectorAll('dl dd').forEach(dd => {
    if (!['detail', 'channel', 'operator'].includes(ui.view)) return;
    if (dd.querySelector('input,select,textarea,.v2-password') || dd.querySelector('.v2-files') || dd.querySelector('.file-view')) return;
    const copy = dd.cloneNode(true); copy.querySelectorAll('button').forEach(n => n.remove()); const text = copy.textContent.trim();
    if (text && text !== '—') (dd.querySelector('.status-inline') || dd).insertAdjacentHTML('beforeend', '<button type="button" class="v2-copy" data-act="v2-copy" data-id="' + esc(encodeURIComponent(text)) + '" aria-label="复制' + esc(dd.previousElementSibling?.textContent || '文本') + '">复制</button>');
  });
  root.querySelectorAll('.v2-collection-channel-table tbody td').forEach(td => {
    if (!['channel', 'operator'].includes(ui.view)) return;
    if (td.classList.contains('empty') || td.querySelector('button,input,a,select,textarea') || !td.textContent.trim() || td.textContent.trim() === '—') return;
    const text = td.textContent.trim(), label = td.closest('table').querySelectorAll('th')[td.cellIndex].textContent.trim();
    td.classList.add('v2-copy-cell');
    td.innerHTML = '<div class="v2-list-value"><span class="v2-list-text" title="' + esc(text) + '">' + td.innerHTML + '</span><button type="button" class="v2-copy v2-list-copy" data-act="v2-copy" data-id="' + esc(encodeURIComponent(text)) + '" aria-label="复制' + esc(label) + '" title="复制' + esc(label) + '"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg></button></div>';
  });
  root.querySelectorAll('a[download]').forEach(a => { a.target = '_blank'; a.rel = 'noopener'; });
};
const initialV2 = location.hash.slice(1);
ui.view = views[initialV2] ? initialV2 : 'overviewV2';
if (v2ActiveChannels().includes(previewParams.get('channel'))) ui.channel = previewParams.get('channel');
if (['filmReviewV2', 'materialsV2'].includes(ui.view)) {
  const r = val(previewParams.get('id'));
  if (!r) ui.view = 'overviewV2';
  else { ui.selected = r.id; if (ui.view === 'materialsV2') { if (r.filmStatus !== '通过') ui.view = 'supplierContent'; else ui.edit = structuredClone(r); } }
}
ui.side = platformViews.includes(ui.view) ? 'platform' : 'supplier';
if (ui.view === 'detail' && !ui.selected) { ui.view = 'overviewV2'; ui.side = 'platform'; }
render();
