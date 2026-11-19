/* Entry reminder follows the production audit notice. Only current corrections trigger it. */
const v61Rejected = status => ['拒绝', '驳回'].includes(status);
function v61SupplierCorrections(r) {
  const channels = channelsFor(r).map(channel => ({
    channel,
    material: r.channelMaterialReturns?.[channel]?.status === '待修改' ? r.channelMaterialReturns[channel] : null,
    films: (r.channelReturns?.[channel] || []).filter(item => item.status === '待修改')
  })).filter(item => item.material || item.films.length);
  return { material: v61Rejected(r.materialStatus), film: v61Rejected(r.filmStatus), channels };
}
const v61HasCorrections = pending => pending.material || pending.film || pending.channels.length > 0;
function v61PlatformFilmReasons(r) {
  const currentIds = r.filmRound?.ids;
  return (r.episodeFiles || []).filter(ep => v61Rejected(ep.result) && (!currentIds?.length || currentIds.includes(ep.id)))
    .map(ep => '第' + ep.index + '集：' + (ep.opinion || '未记录驳回原因'));
}
function v61SupplierNoticeDialog(modal) {
  const r = val(modal.id), pending = v61SupplierCorrections(r);
  const action = (label, kind, channel = '') => act(label, 'v61-correct-audit', r.id + '|' + kind + '|' + encodeURIComponent(channel), 'btn primary small');
  const row = (label, status, reasons = [], button = '') => '<div class="v61-audit-row"><span class="v61-audit-label">' + esc(label) + '</span>' +
    '<span>' + tag(v61Rejected(status) ? '驳回' : status || '—') + '</span><div class="v61-audit-reasons">' + reasons.map(reason => '<p>' + esc(reason) + '</p>').join('') + '</div><div class="v61-audit-action">' + button + '</div></div>';
  const platform = row('物料初审', r.materialStatus, pending.material ? [r.materialOpinion || '未记录驳回原因'] : [], pending.material ? action('修改物料', 'material') : '') +
    row('正片审核', r.filmStatus, pending.film ? v61PlatformFilmReasons(r).length ? v61PlatformFilmReasons(r) : ['未记录驳回原因'] : [], pending.film ? action('修改正片', 'film') : '');
  const channels = pending.channels.map(item => '<section class="v61-audit-channel"><h4>' + esc(liveChannelName(item.channel)) + '</h4>' +
    (item.material ? row('物料驳回', '驳回', [item.material.opinion || '未记录驳回原因'], action('修改物料', 'channel-material', item.channel)) : '') +
    (item.films.length ? row('正片驳回', '驳回', item.films.map(film => '第' + film.index + '集：' + (film.opinion || '未记录驳回原因')), action('修改正片', 'channel-film', item.channel)) : '') + '</section>').join('');
  return ['审核通知', '<div class="v61-audit-notice"><div class="v61-audit-intro">你提交的短剧《' + esc(r.name) + '》' + (v61HasCorrections(pending) ? '有待修改提交的内容，请查看审核结果并修改。' : '暂无待修改提交的内容。') + '</div>' +
    '<div class="v61-platform-results">' + platform + '</div>' + (channels ? '<h3 class="changed-field">渠道发行</h3>' + channels : '') + '</div>'];
}
const v61PreviousSupplierDetail = clickActions['live-supplier-detail'];
clickActions['live-supplier-detail'] = r => {
  if (!v59SupplierOwns(r)) return announce('无本供应商查看权限');
  v61PreviousSupplierDetail(r);
  if (v61HasCorrections(v61SupplierCorrections(r))) openModal('v61-supplier-audit-notice', r.id);
};
clickActions['v61-correct-audit'] = (_, value) => {
  const [id, kind, encodedChannel] = value.split('|'), r = val(Number(id)), channel = decodeURIComponent(encodedChannel || '');
  if (!v59SupplierOwns(r) || ui.modal?.type !== 'v61-supplier-audit-notice' || ui.modal.id !== r.id) return;
  const pending = v61SupplierCorrections(r), target = pending.channels.find(item => item.channel === channel);
  if (kind === 'material' && pending.material) {
    if (!v13MaterialAllowed(r)) return announce(v13MaterialWait(r));
    ui.modal = null; return clickActions['v2-material'](r);
  }
  if (kind === 'film' && pending.film) return clickActions['v2-film-upload'](r);
  if (kind === 'channel-material' && target?.material) return clickActions['v2-material-channel'](r, r.id + '|' + encodeURIComponent(channel));
  if (kind === 'channel-film' && target?.films.length) return clickActions['v59-channel-film-edit'](r, r.id + '|' + encodeURIComponent(channel));
  render(); announce('该项已提交或审核状态已变更，请按最新状态处理');
};
const v61PreviousDialog = dialogBody;
dialogBody = modal => modal.type === 'v61-supplier-audit-notice' ? v61SupplierNoticeDialog(modal) : v61PreviousDialog(modal);
const v61PreviousRender = render;
render = function(options) {
  v61PreviousRender(options);
  if (ui.modal?.type !== 'v61-supplier-audit-notice') return;
  const dialog = root.querySelector('.dialog');
  dialog?.classList.add('v61-supplier-notice-dialog');
  dialog?.querySelector('header h2')?.insertAdjacentHTML('beforeend', ' ' + mark(1));
  const close = dialog?.querySelector('footer [data-act="close"]');
  if (close) { close.textContent = '知道了'; close.classList.add('primary'); }
};
V2_NOTES['v61-supplier-audit-notice'] = v2Note('供应商端 · 内容管理 · 合集详情 · 审核通知', '进入合集详情时提醒当前待修改提交的审核项。', [['列表项／操作项', [
  ['弹出条件', '平台物料／正片被驳回，或任一渠道物料／正片处于待修改时，供应商点击合集进入详情自动弹出。新建待提交、已重提待复核及已处理的历史记录不触发；仍有待修改项时，再次进入仍提示。'],
  ['平台审核', '保留物料初审、正片审核两行，显示当前结果；驳回时展示原因和对应修改入口，沿用平台审核的原修改及重提流程。'],
  ['渠道发行', '按具体渠道分组，分别展示物料驳回、正片驳回及完整原因；正片注明对应集数。同一渠道两类均待修改时分别展示，不合并为一个拒绝结果。'],
  ['修改物料／修改正片', '直接进入对应平台或渠道的修改页面。渠道修改入口保持当前渠道归属，仅提交本渠道复核；实际处理前重新核对待修改状态和权限。'],
  ['知道了／关闭', '关闭提示并停留在合集详情，不修改审核结果、不标记任务完成。可继续在渠道列表查看记录和修改；同一次详情浏览中不会因切换Tab或重绘重复弹出。']
]]], '11.19 更新。');
for (const section of V2_NOTES.supplierContent.sections) for (const item of section[1]) if (item[0] === '合集名称') item[1] = '点击进入合集详情；有当前待修改提交的数据时自动弹出审核通知，渠道发行按渠道区分物料、正片驳回。也可在剧集管理的渠道列表查看审核记录及修改，列表不再提供渠道修改意见按钮。';
render();
