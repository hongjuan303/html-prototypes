/* V1.3 has no changes to these menus. Keep navigation without demonstrating baseline workflows. */
const V2_UNCHANGED_MENUS = new Map([
  ['materialAudit', '物料审核负责人'],
  ['filmAuditV2', '正片审核负责人'],
  ['materialTasksV2', '物料审核人员'],
  ['dataV2', '短剧数据'],
  ['supplierDataV2', '短剧数据'],
  ['supplierProfileV2', '个人中心']
]);
for (const [view, title] of V2_UNCHANGED_MENUS) {
  views[view] = () => heading(title) + '<p class="v2-unchanged-message">v1.3 版本未涉及此功能，无需调整，保持线上逻辑即可。</p>';
}
const v2ScopeRender = render;
render = function(options) {
  v2ScopeRender(options);
  if (ui.modal || !V2_UNCHANGED_MENUS.has(ui.view)) return;
  root.querySelector('.canvas')?.classList.add('v2-unchanged-page');
  root.querySelector('.notes')?.remove();
  root.querySelector('[data-act="toggle-notes"]')?.remove();
};
render();
