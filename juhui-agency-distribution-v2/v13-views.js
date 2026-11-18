function v13QualityView() {
  const actors = v2Config.users.filter(u => u.roles.includes('内容质量评估') || v13QualityIsBusiness(u));
  const actor = actors.find(u => u.id === ui.qualityActor) || actors[0];
  if (actor) ui.qualityActor = actor.id;
  const business = v13QualityIsBusiness(actor);
  const items = filtered(records.filter(r => !r.qualityBypass && (business ? r.qualityTasks?.length : r.qualityTasks?.some(t => t.userId === actor?.id))), r => v2QualityStatus(r) === '评估中' ? '待审核' : v2QualityStatus(r));
  const rows = items.map(r => {
    const tasks = r.qualityTasks.filter(t => t.userId === actor.id);
    const ownStatus = business ? r.qualityFinal ? tag(r.qualityFinal.result) + ' <span class="reviewer-name">' + esc(r.qualityFinal.actor || '未记录') + '</span>' : tag(v2QualityReady(r) ? '待填写' : '待渠道评估') : tasks.map(t => '<div class="v2-task-state">' + esc(t.channel) + ' ' + v13QualityResult(t) + '</div>').join('');
    const actions = business ? r.qualityFinal ? r.qualityFinal.result === '驳回' ? act('撤回驳回', 'v13-business-withdraw', r.id) : '' : v2QualityReady(r) ? act('最终反馈', 'v2-business-final', r.id) : '<button type="button" class="link" disabled title="待国内或本轮参与渠道完成评估后填写">最终反馈</button>' : tasks.map(t => t.result ? act('撤回' + t.result, 'v13-quality-withdraw', r.id + '|' + t.id) : act('评估' + t.channel, 'v2-quality-result', r.id + '|' + t.id)).join('');
    return line(esc(r.id), esc(r.name), v2SupplierLabel(r), esc(r.type), intentChannels(r), esc(r.round),
      ...V13_QUALITY_COLUMNS.map(([, channel]) => v13QualityChannelCell(r, channel)),
      ownStatus, tag(v2QualityStatus(r)), buttons(actions, act('审核记录', 'history', r.id)));
  });
  return heading('内容评估') + tabs(V2_EVALUATION_TABS, 'qualityV2', 'nav') + '<div class="v2-role-line v13-identity"><label>当前处理人员<select data-v2-switch="qualityActor">' + actors.map(u => '<option value="' + esc(u.id) + '"' + (u.id === actor?.id ? ' selected' : '') + '>' + esc(u.name) + ' · ' + esc(u.roles.includes('商务负责人') ? '商务负责人' : u.roles.includes('商务人员') ? '商务人员' : '内容质量评估') + '</option>').join('') + '</select></label><span>' + (business ? '当前职责：商务最终反馈' : '负责渠道：' + esc(actor?.channels.join('、') || '未配置')) + '</span></div>' +
    filters([collectionFilter, ['status', '质量评估状态', ['待审核', '待商务反馈', '通过', '驳回']]]) + listing('质量评估列表', ['ID', '合集名称', '供应商', '内容类型', '意向渠道', '发行轮次', ...V13_QUALITY_COLUMNS.map(([label]) => label), business ? '商务最终反馈' : '本人渠道评估', '质量评估状态', '操作 ' + mark(3)], rows, '', { note: 2, className: 'v2-wide-table v13-quality-table' });
}
function v13ContentView() {
  const state = r => ['通过', '驳回'].includes(combined(r)) ? combined(r) : '待审核';
  const items = filtered(records.filter(v13ContentReady), state);
  ui.evaluationItems = items.map(r => r.id);
  const rows = items.map(r => line('<input type="checkbox" data-row-select="' + r.id + '" aria-label="选择' + esc(r.name) + '"' + (ui.checked.has(r.id) ? ' checked' : '') + '>', esc(r.id), esc(r.supplier), esc(r.name) + (v13ContentResubmitted(r) ? '<span class="tag amber v13-resubmitted">重提</span>' : ''), esc(r.episodes) + ' 集', v13ContentResubmitted(r) ? '否' : '是', intentChannels(r), link(r), ...GROUPS.map((_, i) => '<span class="group-result">' + tag(groupStatus(r, i)) + (['通过', '驳回'].includes(groupStatus(r, i)) ? '<span class="reviewer-name">' + esc(v13ActorName(r, i)) + '</span>' : '') + '</span>'), tag(state(r)), esc(r.reviews?.find(x => x.opinion)?.opinion || '—'), timestamp(r.submitted), buttons(groupStatus(r, ui.group) === '待评估' ? act('审核', 'v13-content-result', r.id) : v13CanChangeResult(r, ui.group) ? act('修改意见', 'v13-content-result', r.id) : '', act('审核记录', 'history', r.id))));
  return heading('内容评估') + tabs(V2_EVALUATION_TABS, 'eval', 'nav') + filters([supplierFilter, collectionFilter, ['status', '综合结果', ['待审核', '通过', '驳回']], ['start', '最近提交日期', 'date'], ['end', '结束日期', 'date']]) + listing('评估列表', ['选择', 'ID', '供应商', '剧集名称', '集数', '首次提审', '意向渠道', '查看链接', ...GROUPS, '综合结果', '审核意见', '最近提交时间', '操作 ' + mark(3)], rows, '<span class="selected-count">已选' + ui.checked.size + '条</span><button type="button" class="btn primary small" data-act="download-evaluation"' + (!ui.checked.size ? ' disabled' : '') + '>批量下载</button>', { note: 2, className: 'evaluation-table v13-content-table' });
}
function v13BusinessView() {
  const actor = v13BusinessActor();
  const people = '<div class="v2-role-line v13-identity"><label>当前商务身份<select data-v2-switch="businessActor">' + v13Businesses().map(u => '<option value="' + esc(u.id) + '"' + (actor?.id === u.id ? ' selected' : '') + '>' + esc(u.name) + ' · ' + esc(u.roles.filter(r => r.includes('商务')).join('、')) + '</option>').join('') + '</select></label></div>';
  const rows = filtered(records, v2QualityStatus).map(r => line(esc(r.id), esc(r.name), v2SupplierLabel(r),
    tag(v2QualityStatus(r)) + (v2QualityReady(r) && !r.qualityFinal ? '<div>' + act('最终反馈', 'v2-business-final', r.id) + '</div>' : r.qualityFinal?.result === '驳回' ? '<div>' + act('撤回驳回', 'v13-business-withdraw', r.id) + '</div>' : ''), ...GROUPS.map((_, i) => tag(groupStatus(r, i))), tag(r.filmStatus), tag(r.materialStatus), tag(v13BusinessConfirmed(r) ? '已确认' : v13DeliveryExists(r) ? '待确认' : '待提交'), esc(v2User(r.businessOwner || v2Supplier(r).business)?.name || r.contact || '—'), buttons(act('授权书上传', 'v13-business-auth', r.id), act('查看详情', 'open-detail', r.id), act('审核记录', 'history', r.id), v13BusinessLead() ? act('修改对接商务', 'v13-change-business', r.id) : '')));
  return heading('商务负责人') + people + filters([collectionFilter, supplierFilter]) + listing('剧集列表', ['ID', '合集名称', '供应商', '内容质量评估', ...GROUPS, '正片审核状态', '物料审核状态', '发行渠道确认', '对接商务', '操作 ' + mark(3)], rows, '', { note: 2, className: 'v2-wide-table v13-business-table' });
}
function v13PermissionView() {
  const channel = ui.filters.associatedChannel;
  const people = v2Config.users.filter(u => !channel || channel === '全部' || v13AssociatedChannels(u).includes(channel));
  return heading('人员权限配置') + filters([['associatedChannel', '关联渠道', V13_ASSOCIATED_CHANNELS]]) + listing('人员列表', ['姓名', '角色', '关联渠道', '负责质量评估渠道', '正片自动分配', '操作 ' + mark(3)], people.map(u => line(esc(u.name), esc(u.roles.join('、')), esc(v13AssociatedChannels(u).join('、') || '—'), u.roles.includes('内容质量评估') ? esc(v13QualityChannels(u).join('、') || '—') : '—', u.roles.includes('正片审核人员') ? tag(u.backup ? '仅手动调配' : '参与自动分配') : '—', act('配置', 'v2-user-edit', u.id))), '', { note: 2, className: 'v13-permission-table' });
}
function v13AssociatedPicker(selected) {
  return '<details class="v13-channel-select"><summary role="combobox" aria-label="关联渠道" aria-expanded="false"><span class="v13-channel-tags">' + v13AssociatedTags(selected) + '</span><span class="chevron">⌄</span></summary><div class="v13-channel-menu"><input type="search" data-v13-channel-search aria-label="搜索关联渠道" placeholder="搜索渠道"><div class="v13-channel-options">' + V13_ASSOCIATED_CHANNELS.map(channel => '<label class="check"><input type="checkbox" name="associatedChannels" value="' + esc(channel) + '"' + (selected.includes(channel) ? ' checked' : '') + '><span>' + esc(channel) + '</span></label>').join('') + '</div><p class="field-hint v13-channel-empty" hidden>暂无匹配渠道</p></div></details>';
}
function v13AssociatedTags(selected) {
  return selected.length ? selected.map(channel => '<span class="select-chip">' + esc(channel) + '<button type="button" data-v13-channel-remove="' + esc(channel) + '" aria-label="移除' + esc(channel) + '">×</button></span>').join('') : '<span class="placeholder">请选择渠道</span>';
}
function v13SupplierContentView() {
  const rows = filtered(records.filter(r => v2Supplier(r).id === ui.supplierId && combined(r) === '通过')).map(r => {
    const material = ['待提交', '拒绝'].includes(r.materialStatus) ? '<button type="button" class="link' + (v13MaterialAllowed(r) ? '' : ' disabled-action') + '"' + (v13MaterialAllowed(r) ? '' : ' aria-disabled="true"') + ' data-act="v2-material" data-id="' + r.id + '">填写物料</button>' : '';
    return line(esc(r.id), esc(r.name), esc(r.episodes), tag(r.filmStatus), tag(r.materialStatus), timestamp(v2LaunchTime(r)), timestamp(v2FreeTime(r)), tag(v13BusinessConfirmed(r) ? '已确认' : v13DeliveryExists(r) ? '待商务确认' : '待提交'), buttons(r.filmStatus !== '通过' ? act(r.filmStatus === '驳回' ? '替换并重提正片' : '上传正片', 'v2-film-upload', r.id) : '', material, act('查看交付记录', 'v2-delivery', r.id), act('审核记录', 'history', r.id), Object.values(r.channelReturns || {}).some(list => list.length) || Object.keys(r.channelMaterialReturns || {}).length ? act('渠道修改意见', 'v2-channel-feedback', r.id) : ''));
  });
  return heading('内容管理') + filters([collectionFilter, ['film', '正片状态', ['待提交', '审核中', '通过', '驳回']], ['material', '物料状态', ['待提交', '审核中', '通过', '拒绝']]]) + listing('合集列表', ['ID', '合集名称', '集数', '正片审核状态', '物料审核状态', '上线时间', '转免时间', '发行渠道确认', '操作 ' + mark(2)], rows, '', { note: 1, className: 'v13-supplier-content' });
}
views.supplierEval = () => {
  const items = filtered(records.filter(r => v2Supplier(r).id === ui.supplierId), v2QualityStatus);
  return heading('内容评估') + filters([collectionFilter, ['status', '质量评估状态', ['评估中', '待商务反馈', '通过', '驳回', '白名单免评']]]) + listing('评估记录', ['ID', '合集名称', '集数', '内容类型', '意向渠道', '内容质量评估状态', '内容评估状态', '操作 ' + mark(2)], items.map(r => line(esc(r.id), esc(r.name) + (v13ContentResubmitted(r) ? '<span class="tag amber v13-resubmitted">重提</span>' : ''), esc(r.episodes), esc(r.type), intentChannels(r), tag(v2QualityStatus(r)), tag(combined(r)), buttons(act('查看评估意见', 'v2-opinions', r.id), v2QualityStatus(r) === '驳回' || combined(r) === '驳回' ? act('修改后重提', 'submit', r.id) : ''))), mark(1) + act('＋ 提交剧集信息', 'submit', '', 'btn primary'));
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
  if (v2IsHuman(r) && v2ContractVisible(r)) fragment.querySelector('[name="v2contract"]')?.parentElement.insertAdjacentHTML('beforeend', '<p class="field-hint">制作合同选择仅用于海外TikTok原生渠道，其他真人剧渠道默认有。</p>');
  fragment.querySelector('.v2-flow-steps').innerHTML = '① 正片审核与商务确认 <span>→</span><strong>② 填写物料</strong><span>→</span>③ 物料审核';
  return fragment.innerHTML.replace('当前渠道及条件下暂无适用字段，可在物料字段配置中维护。', '当前渠道及条件下暂无适用字段。');
};
const v13OldDialog = dialogBody;
dialogBody = modal => {
  const r = val(modal.id), d = modal.draft;
  if (modal.type === 'v13-content-result') return ['内容评估 · ' + GROUPS[modal.group], '<div class="form-group"><strong>评估意见 ' + mark(1) + '</strong></div>' + formField('评估结果', select('result', ['通过', '驳回'], d.result)) + formField('审核意见', '<textarea name="opinion" rows="5">' + esc(d.opinion) + '</textarea>'), '保存意见', 2];
  if (modal.type === 'v13-change-business') return ['修改对接商务', '<div class="form-group"><strong>商务归属 ' + mark(1) + '</strong></div>' + formField('对接商务', '<select name="businessOwner">' + v13Businesses().map(u => '<option value="' + u.id + '"' + (u.id === d.businessOwner ? ' selected' : '') + '>' + esc(u.name) + '</option>').join('') + '</select>'), '保存', 2];
  if (modal.type === 'v13-business-confirm') return ['确认发行渠道 · ' + r.name, '<div class="form-group"><strong>评估意见 ' + mark(1) + '</strong></div>' + v13OpinionSummary(r) + '<h3>实际发行渠道 ' + mark(2) + '</h3>' + v2Checks('v13release', v2Release(), d.release) + '<h3 class="v2-subtitle">授权书</h3><p class="field-hint">单文件100MB、单次500MB为当前评审建议。</p><label class="btn upload-label">＋ 上传授权书<input type="file" accept=".doc,.docx,.pdf" multiple data-v2-upload="auth"></label>' + v2FileList(d.files, 'v2-remove-auth'), '确认渠道并保存授权书', 3];
  if (modal.type === 'v2-business-final') {
    const rows = (r.qualityTasks || []).map(t => line(esc(t.channel), esc(t.actor || v2User(t.userId)?.name || '未记录'), tag(t.result || '待评估'), '<div class="v13-opinion-text">' + esc(t.opinion || '尚未提交意见') + '</div>', timestamp(t.time)));
    return ['商务最终反馈', '<p class="v2-dialog-summary"><strong>' + esc(r.name) + '</strong> · ' + esc(v13Intent(r).join('、')) + '</p><div class="form-group"><strong>填写最终反馈 ' + mark(1) + '</strong></div>' + formField('最终结果', select('result', ['通过', '驳回'], d.result), true) + formField('反馈意见', '<textarea name="opinion" rows="3" required placeholder="请输入反馈意见">' + esc(d.opinion) + '</textarea>', true) + '<h3 class="v2-subtitle">本轮渠道评估意见</h3>' + table(['渠道', '评估人员', '意见', '评估说明', '提交时间'], rows, { key: 'v13-business-opinions', className: 'v2-opinion-table' }), '提交最终反馈', 2];
  }
  if (modal.type === 'v2-supplier') return [modal.isNew ? '新建供应商' : '编辑供应商', '<div class="form-group"><strong>供应商资料 ' + mark(1) + '</strong></div>' + formField('供应商名称', input('supplierName', d.name || '', '请输入供应商名称', 'text', 'required maxlength="20"'), true) + formField('负责商务', '<select name="business" required>' + '<option value="">请选择</option>' + v13Businesses().map(u => '<option value="' + esc(u.id) + '"' + (u.id === d.business ? ' selected' : '') + '>' + esc(u.name) + '</option>').join('') + '</select>', true) + '<div class="two-fields">' + formField('登录账号', input('account', d.account || '', '请输入登录账号', 'text', modal.isNew ? 'required maxlength="20"' : 'disabled'), Boolean(modal.isNew)) + formField('绑定手机号', input('phone', d.phone || '', '选填，11位手机号码', 'tel', 'pattern="1[0-9]{10}"')) + '</div>' + formField(modal.isNew ? '初始密码' : '设置登录密码', input('password', '', modal.isNew ? '请输入初始密码' : '留空则保留原密码', 'password', modal.isNew ? 'required' : ''), Boolean(modal.isNew)) + '<label class="check"><input type="checkbox" name="qualityWhitelist"' + (d.qualityWhitelist ? ' checked' : '') + '>' + fieldName('供应商白名单') + '</label><p class="field-hint">启用后，新提交跳过内容质量评估，直接进入内容评估；已提交记录不自动改写。</p>', modal.isNew ? '创建' : '保存', 2];
  const content = v13OldDialog(modal);
  if (modal.type === 'v2-submit') {
    const dom = document.createElement('div'); dom.innerHTML = content[1];
    const intent = dom.querySelector('[name="intent"]')?.closest('.field');
    if (intent) {
      intent.classList.add('v13-intent-field');
      intent.querySelector('span').innerHTML = '<b class="required" aria-hidden="true">*</b>' + fieldName('意向发行渠道');
      intent.querySelector('.check-list')?.classList.add('v13-intent-options');
    }
    const exclude = dom.querySelector('[name="exclude"]')?.closest('.field');
    if (exclude) {
      exclude.classList.add('v13-domestic-scope');
      exclude.innerHTML = '<span>' + fieldName('国内发行范围') + '</span><div class="v13-scope-options"><label class="check"><input type="checkbox" name="domesticOnlyWechat"' + (d.domesticOnlyWechat ? ' checked' : '') + '>' + fieldName(V13_WECHAT) + '</label>' + EXCLUSIONS.map(value => '<label class="check"><input type="checkbox" name="exclude" value="' + esc(value) + '"' + (!d.domesticOnlyWechat && d.exclude.includes(value) ? ' checked' : '') + '><span>' + esc(value) + '</span></label>').join('') + '</div><p class="field-hint">不勾选时包含全部国内渠道；“仅微信视频号”与其他选项互斥。</p>';
    }
    content[1] = dom.innerHTML;
  }
  if (modal.type === 'v2-user') {
    const u = v2User(modal.userId);
    content[1] = '<div class="form-group"><strong>人员权限 ' + mark(1) + '</strong></div>' + formField('姓名', input('displayName', u.name, '', 'text', 'required'), true) + '<div class="field"><span>角色</span>' + v2Checks('roles', V2_ROLES, u.roles) + '</div><div class="field v13-user-section" data-v13-user-section="associated"' + (v13HasChannelRole(u.roles) ? '' : ' hidden') + '><span>' + fieldName('关联渠道') + ' <b class="error">*</b></span>' + v13AssociatedPicker(v13AssociatedChannels(u)) + '</div><div class="field v13-user-section" data-v13-user-section="quality"' + (u.roles.includes('内容质量评估') ? '' : ' hidden') + '><span>' + fieldName('负责质量评估渠道') + ' <b class="error">*</b></span>' + v2Checks('channels', V2_QUALITY_CHANNELS, v13QualityChannels(u)) + '</div><label class="check v13-user-section" data-v13-user-section="film"' + (u.roles.includes('正片审核人员') ? '' : ' hidden') + '><input type="checkbox" name="backup"' + (u.backup ? ' checked' : '') + '>正片备选审核人员（不参与自动分配）</label>';
  }
  if (modal.type === 'v2-film-upload') content[1] = '<h3>评估意见 ' + mark(1) + '</h3>' + v13OpinionSummary(r) + '<h3 class="v2-subtitle">实际发行渠道 ' + mark(2) + '</h3><div class="v13-release-options">' + v2Checks('v13release', v2Release(), d.release || r.release) + '</div>' + (v13BusinessConfirmed(r) ? '<p class="field-hint">渠道已确认，替换正片沿用原渠道。</p>' : '') + content[1].replace(mark(1), '').replace('<div class="field-hint">', '<h3 class="v2-subtitle">正片分集 ' + mark(3) + '</h3><div class="field-hint">');
  if (modal.type === 'v2-film-upload') content[3] = 4;
  if (modal.type === 'v2-film-upload' && v13BusinessConfirmed(r)) {
    const dom = document.createElement('div'); dom.innerHTML = content[1]; dom.querySelectorAll('[name="v13release"]').forEach(f => f.disabled = true); content[1] = dom.innerHTML;
  }
  if (modal.type === 'v2-delivery') content[1] = '<dl class="detail-grid">' + detailField('上线时间', timestamp(v2LaunchTime(r))) + detailField('转免时间', timestamp(v2FreeTime(r))) + '</dl>' + content[1];
  if (['history', 'review'].includes(modal.type)) {
    const rows = v13AuditItems(r).map(x => line(esc(x.type), esc(x.person), tag(x.result || '—'), '<div class="v13-opinion-text">' + esc(x.opinion || '—') + '</div>', esc(x.action || ''), timestamp(x.time)));
    content[1] = '<h3>评估文字意见 ' + mark(1) + '</h3>' + table(['类型', '评估人', '结果', '文字意见', '操作', '时间'], rows, { key: 'v13-audit-opinions', className: 'v2-opinion-table' }).replace('暂无匹配的合集', '暂无已记录的评估意见') + '<h3 class="v2-subtitle">流转记录</h3>' + content[1].replaceAll(mark(1), '');
  }
  return content;
};
