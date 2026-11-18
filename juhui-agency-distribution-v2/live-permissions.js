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
    backup: role === '正片审核人员' && u.backup, aliasName: u.aliasName || '', created: u.permissionCreated || ''
  })));
}
function liveSavePermissions(rows) {
  v2Config.permissionRecords = rows;
  v2Config.users.forEach(u => {
    const own = rows.filter(r => r.userId === u.id);
    u.roles = [...new Set(own.map(r => r.role))];
    u.associatedChannels = [...new Set(own.flatMap(r => r.associatedChannels || []))];
    u.channels = [...new Set(own.flatMap(r => r.qualityChannels || []))];
    u.backup = Boolean(own.find(r => r.role === '正片审核人员')?.backup);
    u.aliasName = own.find(r => r.role === '商务人员')?.aliasName || '';
  });
  v2SaveConfig();
}
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
root.addEventListener('change', e => {
  if (ui.modal?.type === 'live-permission' && e.target.name === 'liveBackup') ui.modal.draft.backup = e.target.checked;
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
  const d = modal.draft, multiple = ['associatedChannels', 'qualityChannels'].includes(name) || name === 'roles' && !modal.permissionId;
  if (name === 'roles' && !d.roles.includes(value) && liveRoleError(d.userId, modal.permissionId ? [value] : [...d.roles, value], modal.permissionId)) return;
  if (name === 'userId') { Object.assign(d, { userId: value, roles: [], associatedChannels: [], qualityChannels: [], aliasName: '', backup: false }); }
  else if (name === 'roles') { d.roles = multiple ? d.roles.includes(value) ? d.roles.filter(x => x !== value) : [...d.roles, value] : [value]; }
  else if (multiple) { d[name] = d[name].includes(value) ? d[name].filter(x => x !== value) : [...d[name], value]; }
  render();
  const picker = root.querySelector('[data-picker="' + name + '"]');
  if (multiple && picker) { picker.open = true; livePositionPicker(picker); picker.querySelector('[data-live-search]').focus(); }
  else picker?.querySelector('summary').focus();
};
clickActions['live-permission-new'] = () => openModal('live-permission', null, { userId: '', roles: [], associatedChannels: [], qualityChannels: [], aliasName: '', backup: false });
clickActions['live-permission-edit'] = (_, id) => {
  const row = livePermissions().find(r => r.id === id); if (!row) return;
  openModal('live-permission', null, { userId: row.userId, roles: [row.role], associatedChannels: [...row.associatedChannels], qualityChannels: [...row.qualityChannels], aliasName: row.aliasName, backup: row.backup }, { permissionId: row.id });
};
clickActions['live-permission-delete'] = (_, id) => {
  const row = livePermissions().find(r => r.id === id); if (!row) return;
  openModal('live-permission-delete', null, {}, { permissionId: row.id });
};
// Retain old deep entry points while routing to the production per-role editor.
clickActions['v2-user-edit'] = (_, id) => {
  const row = livePermissions().find(r => r.userId === id); if (row) clickActions['live-permission-edit'](null, row.id);
};
function livePermissionView() {
  const f = ui.filters;
  const list = livePermissions().filter(r => (!f.userId || f.userId === '全部' || r.userId === f.userId) && (!f.role || f.role === '全部' || r.role === f.role) && (!f.associatedChannel || f.associatedChannel === '全部' || r.associatedChannels.includes(f.associatedChannel)));
  const filter = filters([['userId', '用户'], ['role', '角色', LIVE_ROLES], ['associatedChannel', '关联渠道', V13_ASSOCIATED_CHANNELS]]);
  const dom = document.createElement('div'); dom.innerHTML = filter;
  const field = dom.querySelector('[name="userId"]'); field.outerHTML = '<select name="userId" aria-label="用户"><option value="全部">全部用户</option>' + liveUserOptions().map(([id, name]) => '<option value="' + esc(id) + '"' + (ui.filterDraft.userId === id ? ' selected' : '') + '>' + esc(name) + '</option>').join('') + '</select>';
  dom.querySelectorAll('[name="role"] option').forEach(o => o.textContent = liveRoleName(o.textContent));
  return heading('用户权限分配') + dom.innerHTML + listing('用户权限列表', ['序号', '用户', '关联角色', '关联渠道', '负责质量评估渠道', '正片自动分配', '创建时间', '操作 ' + mark(3)], list.map((r, i) => line(String(i + 1), esc(v2User(r.userId)?.name || '—'), '<span class="live-role-tag">' + esc(liveRoleName(r.role)) + '</span>', esc(r.associatedChannels.join('、') || '—'), esc(r.qualityChannels.join('、') || '—'), r.role === '正片审核人员' ? r.backup ? '仅手动调配' : '参与自动分配' : '—', timestamp(r.created), buttons(act('编辑', 'live-permission-edit', r.id), act('删除', 'live-permission-delete', r.id, 'link danger')))), act('＋ 新增权限', 'live-permission-new', '', 'btn primary'), { note: 2, className: 'live-permission-table' }).replace('暂无匹配的合集', '暂无数据');
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
      (d.roles.includes('内容质量评估') ? field(fieldName('负责质量评估渠道'), livePicker('qualityChannels', '负责质量评估渠道', V2_QUALITY_CHANNELS, d.qualityChannels, true)) : '') +
      (d.roles.includes('正片审核人员') ? field(fieldName('正片自动分配'), '<label class="check"><input type="checkbox" name="liveBackup"' + (d.backup ? ' checked' : '') + '>正片备选审核人员（不参与自动分配）</label>', false) : '') +
      (d.roles.includes('商务人员') ? field('化名', input('aliasName', d.aliasName, '请输入化名', 'text', 'maxlength="20"'), false) : '');
    return [modal.permissionId ? '编辑用户权限' : '新增用户权限', '<div class="live-permission-form">' + body + '</div>', modal.permissionId ? '保存' : '创建', 2];
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
  if (d.roles.includes('内容质量评估') && (!d.qualityChannels.length || d.qualityChannels.some(c => !V2_QUALITY_CHANNELS.includes(c)))) return error('请配置负责质量评估的渠道');
  if (Array.from(d.aliasName).length > 20) return error('化名不能超过20字');
  const rows = structuredClone(livePermissions()), old = rows.find(r => r.id === m.permissionId);
  if (m.permissionId && !old) return error('该权限记录已不存在，请关闭后重试');
  const next = d.roles.map((role, i) => ({ id: old?.id || 'permission:' + Date.now() + ':' + i, userId: d.userId, role, associatedChannels: v13HasChannelRole([role]) ? [...d.associatedChannels] : [], qualityChannels: role === '内容质量评估' ? [...d.qualityChannels] : [], backup: role === '正片审核人员' && d.backup, aliasName: role === '商务人员' ? d.aliasName.trim() : '', created: old ? old.created : now() }));
  liveSavePermissions([...rows.filter(r => r.id !== m.permissionId), ...next]);
  closeModal(); announce(old ? '保存成功' : '创建成功');
};
V2_NOTES.permissionsV2 = v13Note('用户权限分配', '沿用线上用户权限记录及新增、编辑、删除交互，补充V2人员配置。', [
  ['筛选项', [['关联渠道', '在原用户、角色筛选后追加，按已保存具体渠道关联检索全量记录后分页；不按意向或质量职责匹配。']]],
  ['列表项', [['负责质量评估渠道、正片自动分配', '在原用户、关联角色、关联渠道及创建时间基础上展示V2配置；一条关联角色一行，不合并成整个人员。']]],
  ['操作项', [['新增权限、编辑', '复用线上用户下拉、已有角色标签、角色下拉及关联渠道多选。新增可关联多个角色；编辑只修改本条关联，其他角色保持。质量角色另配五类职责，正片审核人员可设为备选。'], ['删除', '确认后只删除本条权限，用户及其他角色保留；不清空历史任务和评估意见。']]]
]);
V2_NOTES['live-permission'] = v13Note('用户权限配置弹窗', '沿用线上480px弹窗结构，在相关角色下追加V2配置。', [
  ['配置项', [['用户、已有角色、关联角色', '从已有用户选择，不修改姓名；显示该用户已有角色。新增角色多选、编辑单条角色单选，禁止重复，评估A/B/C组互斥，管理员按V13-37可兼任商务／商务负责人；其他业务角色仍与管理员互斥。'], ['关联渠道', '渠道负责人或运营必填，沿用线上26项具体渠道，支持搜索、多选、移除。'], ['负责质量评估渠道', '仅质量角色展示并必选，五类职责与具体关联渠道分别保存。'], ['正片自动分配', '仅正片审核角色显示备选开关。'], ['化名', '商务角色选填，20字以内。']]],
  ['操作项', [['创建／保存', '校验本条配置与该用户其他角色，不替换整个人员的全部权限。成功回显列表，后续任务使用新配置；已提交任务和历史不改写。'], ['取消', '不保存本次新增或修改。']]]
]);
V2_NOTES['live-permission-delete'] = v13Note('删除权限确认', '删除单条用户角色关联。', [['操作项', [['确认、取消', '确认删除当前关联；取消保留原权限。账号、其他角色与历史记录保持。']]]]);
const livePermissionRender = render;
render = function (options) {
  livePermissionRender(options);
  if (ui.modal?.type.startsWith('live-permission')) root.querySelector('.dialog')?.classList.add('live-permission-dialog');
};
const permissionNav = NAV.platform.find(([id]) => id === 'permissionsV2'); if (permissionNav) permissionNav[1] = '用户权限分配';
render();
