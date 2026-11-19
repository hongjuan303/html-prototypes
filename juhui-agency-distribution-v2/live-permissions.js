/* Existing production interaction baseline. Local V2 data only. */
const LIVE_ROLES = ['审核组评估', '红果评估', '运营评估', '物料审核负责人', '正片审核负责人', '物料审核人员', '正片审核人员', '排播上线负责人', '渠道负责人', '渠道运营', '商务人员', '内容质量评估', '管理员', '商务负责人'];
LIVE_ROLES.forEach(role => { if (!V2_ROLES.includes(role)) V2_ROLES.push(role); });
const liveRoleName = role => role === '商务人员' ? '商务' : role;
const liveUserOptions = () => v2Config.users.map(u => [u.id, u.name + (u.account && u.account !== u.name ? '（' + u.account + '）' : '')]);
function livePermissions() {
  return v2Config.permissionRecords || v2Config.users.flatMap(u => u.roles.map(role => ({
    id: 'legacy:' + u.id + ':' + role, userId: u.id, role,
    associatedChannels: v13HasChannelRole([role]) ? v13AssociatedChannels(u) : [],
    qualityChannels: role === '内容质量评估' ? v13QualityChannels(u) : [],
    aliasName: u.aliasName || '', created: u.permissionCreated || ''
  })));
}
function liveSavePermissions(rows) {
  v2Config.permissionRecords = rows;
  v2Config.users.forEach(u => {
    const own = rows.filter(r => r.userId === u.id);
    u.roles = [...new Set(own.map(r => r.role))];
    u.associatedChannels = [...new Set(own.flatMap(r => r.associatedChannels || []))];
    u.channels = [...new Set(own.flatMap(r => r.qualityChannels || []))];
    u.aliasName = own.find(r => r.role === '商务人员')?.aliasName || '';
  });
  v2SaveConfig();
}
const liveUserQualityChannels = userId => [...new Set(livePermissions().filter(r => r.userId === userId && r.role === '内容质量评估').flatMap(r => r.qualityChannels || []))];
const liveNeedsQualityChannels = modal => modal.draft.roles.includes('内容质量评估') || livePermissions().some(r => r.userId === modal.draft.userId && r.role === '内容质量评估' && r.id !== modal.permissionId);
function liveRoleError(userId, roles, omit = '') {
  if (!v2User(userId) || !roles.length) return '请选择用户和角色';
  const others = livePermissions().filter(r => r.userId === userId && r.id !== omit).map(r => r.role);
  if (roles.some(r => !LIVE_ROLES.includes(r))) return '请选择有效角色';
  if (roles.some(r => others.includes(r))) return '所选用户已关联该角色，请勿重复选择';
  const all = [...others, ...roles];
  if (all.filter(r => ['审核组评估', '红果评估', '运营评估'].includes(r)).length > 1) return '内容评估 A、B、C 组只能选择一个';
  if (all.includes('管理员') && all.some(r => !['管理员', '商务负责人', '商务人员'].includes(r))) return '管理员仅可兼任商务或商务负责人，不能与其他业务角色同时选择';
  return '';
}
function livePicker(name, label, values, selected, multiple = false, disabled = () => '') {
  const chosen = Array.isArray(selected) ? selected : selected ? [selected] : [];
  const options = values.map(value => Array.isArray(value) ? value : [value, value]);
  const tags = chosen.map(value => {
    const title = options.find(([id]) => id === value)?.[1] || value;
    return multiple ? '<span class="live-select-tag">' + esc(title) + '<button type="button" data-act="live-pick" data-id="' + name + '|' + encodeURIComponent(value) + '" aria-label="移除' + esc(title) + '">×</button></span>' : esc(title);
  }).join('');
  return '<details class="live-select" data-picker="' + name + '"><summary role="combobox" aria-label="' + esc(label) + '" aria-expanded="false"><span class="live-selected">' + (tags || '<span class="placeholder">请选择' + esc(label) + '</span>') + '</span><span class="chevron">⌄</span></summary><div class="live-select-menu"><input type="search" data-live-search aria-label="搜索' + esc(label) + '" placeholder="搜索' + esc(label) + '"><div class="live-select-options">' + options.map(([value, title]) => {
    const reason = disabled(value);
    return '<button type="button" class="live-option' + (chosen.includes(value) ? ' selected' : '') + '" data-act="live-pick" data-id="' + name + '|' + encodeURIComponent(value) + '"' + (reason ? ' disabled title="' + esc(reason) + '"' : '') + '><span>' + esc(title) + '</span><span>' + (chosen.includes(value) ? '✓' : '') + '</span></button>';
  }).join('') + '</div><p class="field-hint live-no-match" hidden>暂无匹配选项</p></div></details>';
}
function livePositionPicker(picker) {
  if (!picker.open) return;
  const box = picker.querySelector('summary').getBoundingClientRect(), menu = picker.querySelector('.live-select-menu');
  const below = innerHeight - box.bottom - 16, above = box.top - 16, down = below > 230 || below > above;
  const height = Math.min(300, Math.max(130, down ? below : above));
  Object.assign(menu.style, { width: box.width + 'px', left: box.left + 'px', top: (down ? box.bottom + 7 : Math.max(8, box.top - height - 7)) + 'px' });
  menu.querySelector('.live-select-options').style.maxHeight = height - 57 + 'px';
}
root.addEventListener('toggle', e => {
  if (!e.target.matches('.live-select')) return;
  e.target.querySelector('summary').setAttribute('aria-expanded', String(e.target.open)); livePositionPicker(e.target);
}, true);
root.addEventListener('input', e => {
  if (e.target.hasAttribute('data-live-search')) {
    const menu = e.target.closest('.live-select-menu'), text = e.target.value.trim().toLowerCase();
    let count = 0;
    menu.querySelectorAll('.live-option').forEach(o => { o.hidden = !o.textContent.toLowerCase().includes(text); if (!o.hidden) count++; });
    menu.querySelector('.live-no-match').hidden = Boolean(count);
  }
  if (ui.modal?.type === 'live-permission' && e.target.name === 'aliasName') ui.modal.draft.aliasName = e.target.value;
});
document.addEventListener('click', e => root.querySelectorAll('.live-select[open]').forEach(p => { if (!p.contains(e.target)) p.open = false; }));
root.addEventListener('click', e => {
  const button = e.target.closest('[data-act="live-pick"]');
  if (!button) return;
  e.preventDefault(); e.stopImmediatePropagation();
  if (!button.disabled) clickActions['live-pick'](null, button.dataset.id);
}, true);
document.addEventListener('scroll', () => root.querySelectorAll('.live-select[open]').forEach(livePositionPicker), true);
window.addEventListener('resize', () => root.querySelectorAll('.live-select[open]').forEach(livePositionPicker));
root.addEventListener('keydown', e => {
  const picker = e.target.closest('.live-select');
  if (!picker || !picker.open) return;
  if (e.key === 'Escape') { e.preventDefault(); e.stopImmediatePropagation(); picker.open = false; picker.querySelector('summary').focus(); }
  if (['ArrowDown', 'ArrowUp'].includes(e.key)) {
    e.preventDefault(); const options = [...picker.querySelectorAll('.live-option:not(:disabled):not([hidden])')];
    const i = options.indexOf(document.activeElement); options[(i + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length]?.focus();
  }
}, true);
clickActions['live-pick'] = (_, id) => {
  const [name, encoded] = id.split('|'), value = decodeURIComponent(encoded), modal = ui.modal;
  if (modal?.type !== 'live-permission') return;
  const wasOpen = root.querySelector('[data-picker="' + name + '"]')?.open;
  const d = modal.draft, multiple = ['associatedChannels', 'qualityChannels'].includes(name) || name === 'roles' && !modal.permissionId;
  if (name === 'roles' && !d.roles.includes(value) && liveRoleError(d.userId, modal.permissionId ? [value] : [...d.roles, value], modal.permissionId)) return;
  if (name === 'userId') { Object.assign(d, { userId: value, roles: [], associatedChannels: [], qualityChannels: liveUserQualityChannels(value), aliasName: '' }); }
  else if (name === 'roles') { d.roles = multiple ? d.roles.includes(value) ? d.roles.filter(x => x !== value) : [...d.roles, value] : [value]; }
  else if (multiple) { d[name] = d[name].includes(value) ? d[name].filter(x => x !== value) : [...d[name], value]; }
  render();
  const picker = root.querySelector('[data-picker="' + name + '"]');
  if (multiple && picker && wasOpen) { picker.open = true; livePositionPicker(picker); picker.querySelector('[data-live-search]').focus(); }
  else picker?.querySelector('summary').focus();
};
clickActions['live-permission-new'] = () => openModal('live-permission', null, { userId: '', roles: [], associatedChannels: [], qualityChannels: [], aliasName: '' });
clickActions['live-permission-edit'] = (_, id) => {
  const row = livePermissions().find(r => r.id === id); if (!row) return;
  openModal('live-permission', null, { userId: row.userId, roles: [row.role], associatedChannels: [...row.associatedChannels], qualityChannels: liveUserQualityChannels(row.userId), aliasName: row.aliasName }, { permissionId: row.id });
};
clickActions['live-permission-delete'] = (_, id) => {
  const row = livePermissions().find(r => r.id === id); if (!row) return;
  openModal('live-permission-delete', null, {}, { permissionId: row.id });
};
// Retain old deep entry points while routing to the production per-role editor.
clickActions['v2-user-edit'] = (_, id) => {
  const row = livePermissions().find(r => r.userId === id); if (row) clickActions['live-permission-edit'](null, row.id);
};
changedFields.add('内容质量评估渠道');
const livePermissionFilterChannels = value => Array.isArray(value) ? value : value && value !== '全部' ? [value] : [];
function livePermissionView() {
  ui.filterDraft.associatedChannel = livePermissionFilterChannels(ui.filterDraft.associatedChannel);
  const f = ui.filters, channels = livePermissionFilterChannels(f.associatedChannel);
  const list = livePermissions().filter(r => (!f.userId || f.userId === '全部' || r.userId === f.userId) && (!f.role || f.role === '全部' || r.role === f.role) && (!channels.length || channels.some(channel => r.associatedChannels.includes(channel))));
  const filter = filters([['userId', '用户'], ['role', '角色', LIVE_ROLES], ['associatedChannel', '关联渠道', V13_ASSOCIATED_CHANNELS]]);
  const dom = document.createElement('div'); dom.innerHTML = filter;
  dom.querySelector('[name="associatedChannel"]').outerHTML = multiSelect('associatedChannel', V13_ASSOCIATED_CHANNELS, livePermissionFilterChannels(ui.filterDraft.associatedChannel));
  const channelFilter = dom.querySelector('[data-multi="associatedChannel"]');
  channelFilter.classList.add('permission-channel-filter');
  channelFilter.querySelector('summary').setAttribute('aria-label', '关联渠道');
  channelFilter.querySelector('.option-search').setAttribute('aria-label', '搜索关联渠道');

  const field = dom.querySelector('[name="userId"]'); field.outerHTML = '<select name="userId" aria-label="用户"><option value="全部">全部用户</option>' + liveUserOptions().map(([id, name]) => '<option value="' + esc(id) + '"' + (ui.filterDraft.userId === id ? ' selected' : '') + '>' + esc(name) + '</option>').join('') + '</select>';
  dom.querySelectorAll('[name="role"] option').forEach(o => o.textContent = liveRoleName(o.textContent));
  return heading('用户权限分配') + dom.innerHTML + listing('用户权限列表', ['序号', '用户', '关联角色', '关联渠道', '内容质量评估渠道', '创建时间', '操作 ' + mark(3)], list.map((r, i) => line(String(i + 1), esc(v2User(r.userId)?.name || '—'), '<span class="live-role-tag">' + esc(liveRoleName(r.role)) + '</span>', esc(r.associatedChannels.join('、') || '—'), esc(r.qualityChannels.join('、') || '—'), timestamp(r.created), buttons(act('编辑', 'live-permission-edit', r.id), act('删除', 'live-permission-delete', r.id, 'link danger')))), act('＋ 新增权限', 'live-permission-new', '', 'btn primary'), { note: 2, className: 'live-permission-table' }).replace('暂无匹配的合集', '暂无数据');
}
views.permissionsV2 = livePermissionView;
const livePermissionDialogBody = dialogBody;
dialogBody = modal => {
  const d = modal.draft;
  if (modal.type === 'live-permission') {
    const own = livePermissions().filter(r => r.userId === d.userId);
    const roleDisabled = role => d.roles.includes(role) ? '' : liveRoleError(d.userId, modal.permissionId ? [role] : [...d.roles, role], modal.permissionId);
    const field = (label, control, required = true) => '<div class="field"><span>' + (required ? '<b class="required">*</b>' : '') + label + '</span>' + control + '</div>';
    const body = field('用户 ' + mark(1), livePicker('userId', '用户', liveUserOptions(), d.userId)) +
      (own.length ? field(modal.permissionId ? '该用户已有角色' : '已关联角色', '<div class="live-existing-roles">' + own.map(r => '<span>' + esc(liveRoleName(r.role)) + '</span>').join('') + '</div>', false) : '') +
      field('关联角色', livePicker('roles', '关联角色', LIVE_ROLES.map(r => [r, liveRoleName(r)]), d.roles, !modal.permissionId, roleDisabled)) +
      (v13HasChannelRole(d.roles) ? field('关联渠道', livePicker('associatedChannels', '关联渠道', V13_ASSOCIATED_CHANNELS, d.associatedChannels, true)) : '') +
      (liveNeedsQualityChannels(modal) ? field(fieldName('内容质量评估渠道'), livePicker('qualityChannels', '内容质量评估渠道', V2_QUALITY_CHANNELS, d.qualityChannels, true)) : '') +
      (d.roles.includes('商务人员') ? field('化名', input('aliasName', d.aliasName, '请输入化名', 'text', 'maxlength="20"'), false) : '');
    return [modal.permissionId ? '编辑用户权限' : '新增用户权限', '<div class="live-permission-form">' + body + '</div>', modal.permissionId ? '保存' : '创建'];
  }
  if (modal.type === 'live-permission-delete') {
    const row = livePermissions().find(r => r.id === modal.permissionId);
    return ['提示', '<p>确认删除该权限记录？</p><p class="field-hint">' + esc(v2User(row?.userId)?.name) + ' · ' + esc(liveRoleName(row?.role)) + '</p>', '确认'];
  }
  return livePermissionDialogBody(modal);
};
const livePermissionSubmit = submitDialog;
submitDialog = form => {
  const m = ui.modal, d = m.draft;
  if (m.type === 'live-permission-delete') { liveSavePermissions(livePermissions().filter(r => r.id !== m.permissionId)); closeModal(); announce('已删除'); return; }
  if (m.type !== 'live-permission') return livePermissionSubmit(form);
  const reason = liveRoleError(d.userId, d.roles, m.permissionId); if (reason) return error(reason);
  if (v13HasChannelRole(d.roles) && (!d.associatedChannels.length || d.associatedChannels.some(c => !V13_ASSOCIATED_CHANNELS.includes(c)))) return error('请选择关联渠道');
  if (liveNeedsQualityChannels(m) && (!d.qualityChannels.length || d.qualityChannels.some(c => !V2_QUALITY_CHANNELS.includes(c)))) return error('请选择内容质量评估渠道');
  if (Array.from(d.aliasName).length > 20) return error('化名不能超过20字');
  const rows = structuredClone(livePermissions()), old = rows.find(r => r.id === m.permissionId);
  if (m.permissionId && !old) return error('该权限记录已不存在，请关闭后重试');
  const next = d.roles.map((role, i) => ({ id: old?.id || 'permission:' + Date.now() + ':' + i, userId: d.userId, role, associatedChannels: v13HasChannelRole([role]) ? [...d.associatedChannels] : [], qualityChannels: role === '内容质量评估' ? [...d.qualityChannels] : [], aliasName: role === '商务人员' ? d.aliasName.trim() : '', created: old ? old.created : now() }));
  const remaining = rows.filter(r => r.id !== m.permissionId);
  if (liveNeedsQualityChannels(m)) remaining.filter(r => r.userId === d.userId && r.role === '内容质量评估').forEach(r => { r.qualityChannels = [...d.qualityChannels]; });
  liveSavePermissions([...remaining, ...next]);
  closeModal(); announce(old ? '保存成功' : '创建成功');
};
V2_NOTES.permissionsV2 = v13Note('用户权限分配', '新增【内容质量评估渠道】配置。', [
  ['筛选项', [['关联渠道', '下拉多选。']]],
  ['列表项', [['内容质量评估渠道', '内容质量评估角色需要必填内容质量评估渠道。']]],
  ['操作项', [['新增权限、编辑', '复用线上用户下拉、已有角色标签、角色下拉及关联渠道多选。新增可关联多个角色；编辑维护当前关联，用户已有内容质量评估角色时同时维护其评估渠道，其他角色配置保留。'], ['删除', '确认后只删除本条权限，用户及其他角色保留；不清空历史任务和评估意见。']]]
]);
V2_NOTES['live-permission'] = v13Note('用户权限配置弹窗', '增加内容质量评估渠道的配置。', [
  ['配置项', [['角色', '管理员和商务负责人可以兼容并存。'], ['内容质量评估渠道', '若有【内容质量评估】角色，则必填【内容质量评估渠道】，下拉多选，枚举：国内渠道、YouTube、Tiktok端原生、TT小程序、仅微信视频号。']]]
]);
V2_NOTES['live-permission-delete'] = v13Note('删除权限确认', '删除单条用户角色关联。', [['操作项', [['确认、取消', '确认删除当前关联；取消保留原权限。账号、其他角色与历史记录保持。']]]]);
V2_NOTES.permissionsV2.caution = '11.18 更新。';
V2_NOTES['live-permission'].caution = '11.19 更新。';
const livePermissionNote = noteInfo;
noteInfo = () => { const n = livePermissionNote(); return ui.modal?.type === 'live-permission' ? { ...n, page: '用户权限分配 / ' + (ui.modal.permissionId ? '编辑用户权限' : '新增用户权限') } : n; };
const livePermissionRender = render;
render = function (options) {
  livePermissionRender(options);
  if (ui.modal?.type.startsWith('live-permission')) root.querySelector('.dialog')?.classList.add('live-permission-dialog');
};
const permissionNav = NAV.platform.find(([id]) => id === 'permissionsV2'); if (permissionNav) permissionNav[1] = '用户权限分配';
render();
