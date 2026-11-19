function v13QualityDialog(modal) {
  const r = val(modal.id), d = modal.draft;
  const sections = modal.qualityTaskIds.map((id, i) => {
    const task = r.qualityTasks.find(t => t.id === id);
    if (!task) return '';
    const result = d['qualityResult' + i], opinion = d['qualityOpinion' + i], rejected = result === '驳回';
    const controls = '<div class="quality-review-fields">' + formField('评估结果', '<select name="qualityResult' + i + '" data-quality-channel-result="' + i + '"><option value="">请选择评估结果</option>' + options(['通过', '驳回'], result) + '</select>') +
        formField('评估意见', '<textarea name="qualityOpinion' + i + '" rows="3" data-quality-channel-opinion="' + i + '" aria-required="' + rejected + '" aria-describedby="quality-channel-error-' + i + '" placeholder="通过时选填，驳回时必填">' + esc(opinion) + '</textarea><span id="quality-channel-error-' + i + '" class="error" role="alert"></span>', rejected) + '</div>';
    return '<section class="quality-review-channel" data-quality-channel="' + i + '"><div class="quality-review-channel-heading"><h3 class="changed-field">' + esc(task.channel) + '</h3>' + tag(task.result ? '已提交' : '待审核') + '</div>' + controls + '</section>';
  }).join('');
  return ['渠道质量评估 · ' + r.name, '<div class="quality-channel-review"><div class="quality-review-intro"><strong>分渠道评估 ' + mark(1) + '</strong><span>各渠道独立填写，提交后可继续修改。</span></div>' + sections + '</div>', '提交意见', 2];
}
function v13QualityView() {
  const actors = v2Config.users.filter(u => u.roles.includes('内容质量评估') || v13QualityIsBusiness(u));
  const actor = actors.find(u => u.id === ui.qualityActor) || actors[0];
  if (actor) ui.qualityActor = actor.id;
  const business = v13QualityIsBusiness(actor);
  const items = filtered(records.filter(r => !r.qualityBypass && (business ? r.qualityTasks?.length : r.qualityTasks?.some(t => t.userId === actor?.id))), v2QualityStatus);
  const rows = items.map(r => {
    const tasks = v13OwnQualityTasks(r, actor.id);
    const actions = business ? r.qualityFinal ? r.qualityFinal.result === '驳回' ? act('修改最终反馈', 'v2-business-final', r.id) + act('撤回驳回', 'v13-business-withdraw', r.id) : '' : v2QualityReady(r) ? act('最终反馈', 'v2-business-final', r.id) : '<button type="button" class="link" disabled title="待国内或本轮参与渠道完成评估后填写">最终反馈</button>' :
      (tasks.length ? act('审核', 'v2-quality-result', r.id) : '') + tasks.filter(t => v13CanWithdrawQuality(r, t)).map(t => act('撤回' + (tasks.length > 1 ? t.channel : '') + t.result, 'v13-quality-withdraw', r.id + '|' + t.id)).join('');
    const opinion = r.qualityFinal ? r.qualityFinal.opinion || '未填写' : r.qualityTasks.filter(t => t.result).map(t => t.channel + '：' + (t.opinion || '未填写')).join('；') || '—';
    return line(esc(r.id), esc(r.name), v2SupplierLabel(r), esc(r.type || '—'), esc(r.episodes), link(r), intentChannels(r), esc(r.round || '—'), v2SubmittedIntroCell(r), esc(r.youtubeFirst || '—'),
      ...V13_QUALITY_COLUMNS.map(([, channel]) => v13QualityChannelCell(r, channel)),
      tag(v2QualityStatus(r)) + (r.qualityFinal?.actor ? '<div class="reviewer-name">' + esc(r.qualityFinal.actor) + '</div>' : ''), '<span title="' + esc(opinion) + '">' + esc(opinion) + '</span>', buttons(actions, act('审核记录', 'history', r.id)));
  });
  return heading('内容评估') + tabs(V2_EVALUATION_TABS, 'qualityV2', 'nav') + '<div class="v2-role-line v13-identity"><label>当前处理人员<select data-v2-switch="qualityActor">' + actors.map(u => '<option value="' + esc(u.id) + '"' + (u.id === actor?.id ? ' selected' : '') + '>' + esc(u.name) + ' · ' + esc(v13QualityIsBusiness(u) ? '商务' : '内容质量评估') + '</option>').join('') + '</select></label><span>' + (business ? '当前职责：商务最终反馈' : '负责渠道：' + esc(actor?.channels.join('、') || '未配置')) + '</span></div>' +
    filters([supplierFilter, collectionFilter, ['status', '质量评估状态', ['待审核', '通过', '驳回']]]) + listing('质量评估列表', ['ID', '合集名称', '供应商', '内容类型', '集数', '一卡链接', '意向渠道', '发行轮次', '剧集简介', 'YouTube是否首发', ...V13_QUALITY_COLUMNS.map(([label]) => label), '质量评估状态', '审核意见', '操作 ' + mark(3)], rows, '', { note: 2, className: 'v24-quality-table' });
}
function v13ContentView() {
  const state = r => ['通过', '驳回'].includes(combined(r)) ? combined(r) : '待审核';
  const items = filtered(records.filter(v13ContentReady), state);
  ui.evaluationItems = items.map(r => r.id);
  const rows = items.map(r => line('<input type="checkbox" data-row-select="' + r.id + '" aria-label="选择' + esc(r.name) + '"' + (ui.checked.has(r.id) ? ' checked' : '') + '>', esc(r.id), esc(r.supplier), esc(r.name) + (v13ContentResubmitted(r) ? '<span class="tag amber v13-resubmitted">重提</span>' : ''), esc(r.episodes) + ' 集', v13ContentResubmitted(r) ? '否' : '是', esc(r.type || '—'), esc(r.round || '—'), v2SubmittedIntroCell(r), intentChannels(r), link(r), ...GROUPS.map((_, i) => '<span class="group-result">' + tag(groupStatus(r, i)) + (['通过', '驳回'].includes(groupStatus(r, i)) ? '<span class="reviewer-name">' + esc(v13ActorName(r, i)) + '</span>' : '') + '</span>'), tag(state(r)), esc(r.reviews?.find(x => x.opinion)?.opinion || '—'), timestamp(r.submitted), buttons(groupStatus(r, ui.group) === '待评估' ? act('审核', 'v13-content-result', r.id) : v13CanChangeResult(r, ui.group) ? act('修改意见', 'v13-content-result', r.id) : '', act('审核记录', 'history', r.id))));
  return heading('内容评估') + tabs(V2_EVALUATION_TABS, 'eval', 'nav') + filters([supplierFilter, collectionFilter, ['status', '综合结果', ['待审核', '通过', '驳回']], ['firstSubmission', '首次提审', ['是', '否']], ['start', '最近提交日期', 'date'], ['end', '结束日期', 'date']]) + listing('评估列表', ['选择', 'ID', '供应商', '剧集名称', '集数', '首次提审', '内容类型', '发行轮次', '剧集简介', '意向渠道', '查看链接', ...GROUPS, '综合结果', '审核意见', '最近提交时间', '操作 ' + mark(3)], rows, '<span class="selected-count">已选' + ui.checked.size + '条</span><button type="button" class="btn primary small" data-act="download-evaluation"' + (!ui.checked.size ? ' disabled' : '') + '>批量下载</button>', { note: 2, className: 'evaluation-table v13-content-table' });
}
function v13BusinessView() {
  const actor = v13BusinessActor();
  const people = '<div class="v2-role-line v13-identity"><label>当前商务身份<select data-v2-switch="businessActor">' + v13Businesses().map(u => '<option value="' + esc(u.id) + '"' + (actor?.id === u.id ? ' selected' : '') + '>' + esc(u.name) + '</option>').join('') + '</select></label></div>';
  const rows = filtered(records, v2QualityStatus).filter(r => !ui.filters.authorizationStatus || ui.filters.authorizationStatus === '全部' || ui.filters.authorizationStatus === v13AuthorizationStatus(r)).map(r => line(esc(r.id), act(r.name, 'open-detail', r.id), v2SupplierLabel(r), tag(r.materialStatus), tag(r.filmStatus), timestamp(r.submitted), timestamp(v2LaunchTime(r)), esc(v2User(r.businessOwner || v2Supplier(r).business)?.name || r.contact || '—'), '<div>物料：' + esc(v2User(r.materialReviewer)?.name || r.materialReviewerName || '—') + '</div><div>正片：' + esc(v2User(r.filmReviewer)?.name || r.filmReviewerName || '—') + '</div>', tag(v2QualityStatus(r)), ...GROUPS.map((_, i) => tag(groupStatus(r, i))), '<span class="tag ' + (v13AuthorizationStatus(r) === '未上传' ? 'red' : v13AuthorizationStatus(r) === '已上传' ? 'green' : 'gray') + '">' + v13AuthorizationStatus(r) + '</span>', buttons(act('授权书上传', 'v13-business-auth', r.id), act('查看详情', 'open-detail', r.id), act('审核记录', 'history', r.id), v13BusinessLead() ? act('修改对接商务', 'v13-change-business', r.id) : '')));
  return heading('商务负责人', '对接供应商，跟进合集发行进度') + people + filters([supplierFilter, collectionFilter, ['contact', '商务', v13Businesses().map(u => u.name)], ['authorizationStatus', '授权书状态', ['未上传', '已上传']], ['status', '内容质量评估', ['待审核', '通过', '驳回']]]) + listing('商务跟进列表', ['ID', '剧集名称', '供应商', '物料状态', '正片状态', '提交时间', '上线时间', '对接商务', '审核人员', '内容质量评估', ...GROUPS, '授权书状态', '操作 ' + mark(3)], rows, '', { note: 2, className: 'v24-business-table' });
}
function v13PermissionView() {
  const channel = ui.filters.associatedChannel;
  const people = v2Config.users.filter(u => !channel || channel === '全部' || v13AssociatedChannels(u).includes(channel));
  return heading('人员权限配置') + filters([['associatedChannel', '关联渠道', V13_ASSOCIATED_CHANNELS]]) + listing('人员列表', ['姓名', '角色', '关联渠道', '内容质量评估渠道', '操作 ' + mark(3)], people.map(u => line(esc(u.name), esc(u.roles.join('、')), esc(v13AssociatedChannels(u).join('、') || '—'), u.roles.includes('内容质量评估') ? esc(v13QualityChannels(u).join('、') || '—') : '—', act('配置', 'v2-user-edit', u.id))), '', { note: 2, className: 'v13-permission-table' });
}
function v13AssociatedPicker(selected) {
  return '<details class="v13-channel-select"><summary role="combobox" aria-label="关联渠道" aria-expanded="false"><span class="v13-channel-tags">' + v13AssociatedTags(selected) + '</span><span class="chevron">⌄</span></summary><div class="v13-channel-menu"><input type="search" data-v13-channel-search aria-label="搜索关联渠道" placeholder="搜索渠道"><div class="v13-channel-options">' + V13_ASSOCIATED_CHANNELS.map(channel => '<label class="check"><input type="checkbox" name="associatedChannels" value="' + esc(channel) + '"' + (selected.includes(channel) ? ' checked' : '') + '><span>' + esc(channel) + '</span></label>').join('') + '</div><p class="field-hint v13-channel-empty" hidden>暂无匹配渠道</p></div></details>';
}
function v13AssociatedTags(selected) {
  return selected.length ? selected.map(channel => '<span class="select-chip">' + esc(channel) + '<button type="button" data-v13-channel-remove="' + esc(channel) + '" aria-label="移除' + esc(channel) + '">×</button></span>').join('') : '<span class="placeholder">请选择渠道</span>';
}
// Supplier issuance is per actual release channel, independent of business confirmation.
function v13SupplierChannelStates(r) {
  return channelsFor(r).map(channel => {
    const actual = r.onlineSnapshot?.channels.find(c => c.key === channel);
    const returns = [...(r.channelReturns?.[channel] || []), ...(r.channelMaterialReturns?.[channel] ? [r.channelMaterialReturns[channel]] : [])];
    const rejected = returns.some(item => item.status === '待修改');
    const pending = returns.some(item => item.status === '待复核');
    const status = rejected ? '驳回' : pending ? '待发行' : actual?.status === '驳回' && !returns.length ? '驳回' : issuanceStatus(r);
    return { channel, label: actual?.label || (channel === '字节系' ? '字节系（红果和抖音）' : channel), status };
  });
}
function v13SupplierIssuanceCell(r) {
  const channels = v13SupplierChannelStates(r);
  return channels.length ? '<div class="v13-supplier-channel-status">' + channels.map(({ label, status }) => '<span class="tag ' + (status === '驳回' ? 'red' : status === '已发行' ? 'green' : status === '待发行' ? 'blue' : 'gray') + '">' + esc(label) + '：' + esc(status) + '</span>').join('') + '</div>' : '—';
}
function v13SupplierContentView() {
  const items = records.filter(r => v2Supplier(r).id === ui.supplierId && combined(r) === '通过').filter(r => {
    const wanted = ui.filters.channelIssuance, release = ui.filters.release;
    if (!wanted || wanted === '全部') return true;
    return v13SupplierChannelStates(r).some(item => item.status === wanted && (!release || release === '全部' || ['国内全渠道', '海外全渠道'].includes(release) || item.channel === release));
  });
  const rows = filtered(items).map(r => {
    const material = ['待提交', '拒绝', '驳回'].includes(r.materialStatus) ? '<button type="button" class="link' + (v13MaterialAllowed(r) ? '' : ' disabled-action') + '"' + (v13MaterialAllowed(r) ? '' : ' aria-disabled="true"') + ' data-act="v2-material" data-id="' + r.id + '">填写物料</button>' : '';
    return line(esc(r.id), act(r.name, 'live-supplier-detail', r.id), esc(r.episodes), timestamp(r.created || r.submitted), tag(r.materialStatus), tag(r.filmStatus), v13SupplierIssuanceCell(r), timestamp(v2LaunchTime(r)), timestamp(v2FreeTime(r)), buttons(act('查看详情', 'live-supplier-detail', r.id), !['审核中', '通过'].includes(r.filmStatus) ? act(r.filmStatus === '驳回' ? '替换并重提正片' : '上传正片', 'v2-film-upload', r.id) : '', material));
  });
  return heading('内容管理') + filters([collectionFilter, ['release', '渠道', v2Release()], ['type', '剧集类型', V2_TYPES], ['round', '发行轮次', ['首发', '二轮']], ['material', '物料状态', ['待提交', '待分配', '审核中', '通过', '拒绝']], ['film', '正片状态', ['待提交', '待分配', '审核中', '通过', '驳回']], ['channelIssuance', '渠道发行状态', ['待生成', '待发行', '已发行', '驳回']]]) + listing('评估记录', ['ID', '合集名称', '集数', '创建时间', '物料审核状态', '正片审核状态', '渠道发行状态', '上线时间', '转免时间', '操作 ' + mark(2)], rows, act('＋ 提交剧集信息', 'submit', '', 'btn primary'), { note: 1, className: 'v13-supplier-content' });
}

views.supplierEval = () => {
  const items = filtered(records.filter(r => v2Supplier(r).id === ui.supplierId), v2QualityStatus);
  return heading('内容评估') + filters([collectionFilter, ['status', '质量评估状态', ['评估中', '待商务反馈', '通过', '驳回', '白名单免评']]]) + listing('评估记录', ['ID', '合集名称', '集数', '内容类型', '意向渠道', '内容质量评估状态', '内容评估状态', '操作 ' + mark(2)], items.map(r => line(esc(r.id), esc(r.name) + (v13ContentResubmitted(r) ? '<span class="tag amber v13-resubmitted">重提</span>' : ''), esc(r.episodes), esc(r.type), intentChannels(r), tag(v2QualityStatus(r)), v2QualityStatus(r) === '待审核' ? '-' : tag(combined(r)), buttons(act('查看评估意见', 'v2-opinions', r.id), v2QualityStatus(r) === '驳回' || combined(r) === '驳回' ? act('修改后重提', 'submit', r.id) : ''))), mark(1) + act('＋ 提交剧集信息', 'submit', '', 'btn primary'));
};
views.eval = v13ContentView; views.qualityV2 = v13QualityView; views.business = v13BusinessView; views.permissionsV2 = v13PermissionView; views.supplierContent = v13SupplierContentView;
const v13OldSuppliers = views.suppliersV2;
views.suppliersV2 = () => {
  const html = v13OldSuppliers(), fragment = document.createElement('div'); fragment.innerHTML = html;
  fragment.querySelector('th:last-child').insertAdjacentHTML('beforebegin', '<th>' + fieldName('供应商白名单') + '</th>');
  fragment.querySelectorAll('tbody tr').forEach(tr => { const supplier = v2Config.suppliers.find(s => s.id === tr.querySelector('[data-act="v2-supplier-edit"]')?.dataset.id); if (supplier) tr.lastElementChild.insertAdjacentHTML('beforebegin', '<td>' + tag(supplier.qualityWhitelist ? '已启用' : '未启用') + '</td>'); });
  fragment.querySelector('.list-panel .panel-header .actions').insertAdjacentHTML('afterbegin', '<span class="actions">' + mark(3) + act('新建供应商', 'v13-supplier-new', '', 'btn primary') + '</span>');
  return fragment.innerHTML;
};
const v13OldMaterialView = views.materialsV2;
views.materialsV2 = () => {
  const r = ui.edit, fragment = document.createElement('div'); fragment.innerHTML = v13OldMaterialView();
  fragment.querySelectorAll('[name="v2release"]').forEach(f => f.disabled = v13BusinessConfirmed(r));
  if (v13BusinessConfirmed(r)) fragment.querySelector('[name="v2release"]')?.closest('.field').insertAdjacentHTML('beforeend', '<p class="field-hint">发行渠道已由商务确认，供应商不可修改。</p>');
  if (v13BusinessConfirmed(r) && typeof filmReleasePicker === 'function') {
    const list = fragment.querySelector('[name="v2release"]')?.closest('.check-list');
    if (list) list.outerHTML = filmReleasePicker(r.release, true);
  }
  fragment.querySelector('.v2-flow-steps').innerHTML = '① 正片审核与商务确认 <span>→</span><strong>② 填写物料</strong><span>→</span>③ 物料审核';
  return fragment.innerHTML.replace('当前渠道及条件下暂无适用字段，可在物料字段配置中维护。', '当前渠道及条件下暂无适用字段。');
};
const v13OldDialog = dialogBody;
dialogBody = modal => {
  const r = val(modal.id), d = modal.draft;
  if (modal.type === 'v13-content-result') return ['内容评估 · ' + GROUPS[modal.group], '<div class="form-group"><strong>评估意见 ' + mark(1) + '</strong></div>' + formField('评估结果', select('result', ['通过', '驳回'], d.result)) + formField('审核意见', '<textarea name="opinion" rows="5">' + esc(d.opinion) + '</textarea>'), '保存意见', 2];
  if (modal.type === 'v13-change-business') return ['修改对接商务', '<div class="form-group"><strong>商务归属 ' + mark(1) + '</strong></div>' + formField('对接商务', '<select name="businessOwner">' + v13Businesses().map(u => '<option value="' + u.id + '"' + (u.id === d.businessOwner ? ' selected' : '') + '>' + esc(u.name) + '</option>').join('') + '</select>'), '保存', 2];
  if (modal.type === 'v13-business-confirm') return ['授权书上传 · ' + r.name, '<div class="form-group"><strong>评估意见 ' + mark(1) + '</strong></div>' + v13OpinionSummary(r) + '<h3 class="changed-field"><b class="required">*</b> 发行渠道 ' + mark(2) + '</h3>' + v2Checks('v13release', v2Release(), d.release) + '<h3 class="v2-subtitle">授权书</h3><p class="field-hint">单文件100MB、单次500MB为当前评审建议。</p><label class="btn upload-label">＋ 上传授权书<input type="file" accept=".doc,.docx,.pdf" multiple data-v2-upload="auth"></label>' + v2FileList(d.files, 'v2-remove-auth'), '保存', 3];
  if (modal.type === 'v2-business-final') {
    const rows = (r.qualityTasks || []).map(t => line(esc(t.channel), esc(t.actor || v2User(t.userId)?.name || '未记录'), tag(t.result || '待评估'), '<div class="v13-opinion-text">' + esc(t.opinion || (t.result ? '未填写' : '尚未提交意见')) + '</div>', timestamp(t.time)));
    return ['商务最终反馈', '<p class="v2-dialog-summary"><strong>' + esc(r.name) + '</strong> · ' + esc(v13Intent(r).join('、')) + '</p><div class="form-group"><strong>填写最终反馈 ' + mark(1) + '</strong></div>' + formField('最终结果', select('result', ['通过', '驳回'], d.result), true) + v24QualityRemark('反馈意见', d) + '<h3 class="v2-subtitle">本轮渠道评估意见</h3>' + table(['渠道', '评估人员', '意见', '评估说明', '提交时间'], rows, { key: 'v13-business-opinions', className: 'v2-opinion-table' }), '提交最终反馈', 2];
  }
  if (modal.type === 'v2-supplier') return [modal.isNew ? '新建供应商' : '编辑供应商', '<div class="form-group"><strong>供应商资料 ' + mark(1) + '</strong></div>' + formField('供应商名称', input('supplierName', d.name || '', '请输入供应商名称', 'text', 'required maxlength="20"'), true) + formField('负责商务', livePicker('businessIds', '负责商务', v13Businesses().map(u => [u.id, u.name]), v13SupplierBusinessIds(d), true), true) + '<div class="two-fields">' + formField('登录账号', input('account', d.account || '', '请输入登录账号', 'text', modal.isNew ? 'required maxlength="20"' : 'disabled'), Boolean(modal.isNew)) + formField('绑定手机号', input('phone', d.phone || '', '选填，11位手机号码', 'tel', 'pattern="1[0-9]{10}"')) + '</div>' + (modal.isNew ? formField('初始密码', input('password', d.passwordDraft || '', '请输入初始密码', 'password', 'required'), true) : '') + '<label class="check"><input type="checkbox" name="qualityWhitelist"' + (d.qualityWhitelist ? ' checked' : '') + '>' + fieldName('供应商白名单') + '</label><p class="field-hint">启用后，新提交跳过内容质量评估，直接进入内容评估；已提交记录不自动改写。</p>', modal.isNew ? '创建' : '保存', 2];
  const content = v13OldDialog(modal);
  if (modal.type === 'v2-submit') {
    const dom = document.createElement('div'); dom.innerHTML = content[1];
    const intent = dom.querySelector('[name="intent"]')?.closest('.field');
    if (intent) {
      intent.classList.add('v13-intent-field');
      intent.querySelector('span').innerHTML = '<b class="required" aria-hidden="true">*</b>' + fieldName('意向发行渠道');
      const selected = v13Intent(d);
      intent.querySelector('.check-list').outerHTML = '<div class="check-list v13-intent-options">' + ['国内渠道', V13_WECHAT, ...CHANNELS.slice(1)].map(channel => {
        const disabled = channel === '国内渠道' ? selected.includes(V13_WECHAT) : channel === V13_WECHAT && selected.includes('国内渠道');
        return '<label class="check"><input type="checkbox" name="intent" value="' + esc(channel) + '"' + (selected.includes(channel) ? ' checked' : '') + (disabled ? ' disabled' : '') + '><span>' + esc(channel) + '</span></label>';
      }).join('') + '</div>';
    }
    const exclude = dom.querySelector('[name="exclude"]')?.closest('.field');
    if (exclude && d.domesticOnlyWechat) exclude.remove();
    else if (exclude) {
      exclude.classList.add('v13-domestic-scope');
      exclude.innerHTML = '<span>' + fieldName('国内发行范围') + '</span><div class="v13-scope-options">' + EXCLUSIONS.map(value => '<label class="check"><input type="checkbox" name="exclude" value="' + esc(value) + '"' + (d.exclude.includes(value) ? ' checked' : '') + '><span>' + esc(value) + '</span></label>').join('') + '</div><p class="field-hint">不勾选时包含全部国内渠道。</p>';
    }
    content[1] = dom.innerHTML;
  }
  if (modal.type === 'v2-user') {
    const u = v2User(modal.userId);
    content[1] = '<div class="form-group"><strong>人员权限 ' + mark(1) + '</strong></div>' + formField('姓名', input('displayName', u.name, '', 'text', 'required'), true) + '<div class="field"><span>角色</span>' + v2Checks('roles', V2_ROLES, u.roles) + '</div><div class="field v13-user-section" data-v13-user-section="associated"' + (v13HasChannelRole(u.roles) ? '' : ' hidden') + '><span>' + fieldName('关联渠道') + ' <b class="error">*</b></span>' + v13AssociatedPicker(v13AssociatedChannels(u)) + '</div><div class="field v13-user-section" data-v13-user-section="quality"' + (u.roles.includes('内容质量评估') ? '' : ' hidden') + '><span>' + fieldName('内容质量评估渠道') + ' <b class="error">*</b></span>' + v2Checks('channels', V2_QUALITY_CHANNELS, v13QualityChannels(u)) + '</div>';
  }
  if (modal.type === 'v2-film-upload') content[1] = '<h3>评估意见 ' + mark(1) + '</h3>' + v13OpinionSummary(r) + '<h3 class="v2-subtitle">实际发行渠道 ' + mark(2) + '</h3><div class="v13-release-options">' + v2Checks('v13release', v2Release(), d.release || r.release) + '</div>' + (v13BusinessConfirmed(r) ? '<p class="field-hint">渠道已确认，替换正片沿用原渠道。</p>' : '') + content[1].replace(mark(1), '').replace('<div class="field-hint">', '<h3 class="v2-subtitle">正片分集 ' + mark(3) + '</h3><div class="field-hint">');
  if (modal.type === 'v2-film-upload') content[3] = 4;
  if (modal.type === 'v2-film-upload' && v13BusinessConfirmed(r)) {
    const dom = document.createElement('div'); dom.innerHTML = content[1]; dom.querySelectorAll('[name="v13release"]').forEach(f => f.disabled = true); content[1] = dom.innerHTML;
  }
  if (modal.type === 'v2-delivery') content[1] = '<dl class="detail-grid">' + detailField('上线时间', timestamp(v2LaunchTime(r))) + detailField('转免时间', timestamp(v2FreeTime(r))) + '</dl>' + content[1];

  return content;
};
