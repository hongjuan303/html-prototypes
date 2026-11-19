/* Retain existing decision, detail and file-preview entry points. */
const liveContentView = views.eval;
views.eval = () => {
  const dom = document.createElement('div'); dom.innerHTML = liveContentView();
  dom.querySelectorAll('[data-act="v13-content-result"]').forEach(button => {
    if (button.textContent !== '审核') return;
    button.outerHTML = act('同意', 'live-content-pass', button.dataset.id) + act('驳回', 'live-content-reject', button.dataset.id, 'link danger');
  }); return dom.innerHTML;
};
for (const [action, result] of [['live-content-pass', '通过'], ['live-content-reject', '驳回']]) clickActions[action] = r => {
  clickActions['v13-content-result'](r); if (ui.modal?.type === 'v13-content-result') { ui.modal.draft.result = result; ui.modal.liveDirect = true; render(); }
};
// Business baseline columns and V2 increments are rendered together in v13BusinessView.
const liveScheduleView = views.schedule;
views.schedule = () => {
  const dom = document.createElement('div'); dom.innerHTML = liveScheduleView();
  dom.querySelectorAll('tbody tr').forEach(tr => { const r = val(tr.querySelector('[data-act="history"]')?.dataset.id); if (r) tr.children[1].innerHTML = act(r.name, 'open-detail', r.id); });
  return dom.innerHTML;
};
clickActions['live-preview-episode'] = async (_, value) => {
  const [id, index] = value.split('|'), r = val(id), ep = r?.episodeFiles?.find(e => e.index === Number(index));
  if (!ep) return announce('尚未上传该集文件');
  const previous = structuredClone(ui.modal);
  try { const url = ep.url || URL.createObjectURL(await v2File(ep)); openModal('live-preview-episode', r.id, { url, name: ep.name }, { returnModal: previous, objectUrl: ep.url ? '' : url }); }
  catch (e) { announce(e.message || '文件不可用'); }
};
const liveDetailDialog = dialogBody;
dialogBody = m => {
  if (m.type === 'live-preview-episode') return [m.draft.name, '<video class="live-episode-preview" controls preload="metadata" src="' + esc(m.draft.url) + '"></video>', ''];
  if (m.type === 'v13-content-result' && m.liveDirect) return [m.draft.result === '通过' ? '审核通过 — 填写审核意见' : '驳回评估', '<input type="hidden" name="result" value="' + esc(m.draft.result) + '">' + formField('剧集名称', input('collection', val(m.id).name, '', 'text', 'readonly')) + formField(m.draft.result === '驳回' ? '驳回原因' : '审核意见', '<textarea name="opinion" rows="4"' + (m.draft.result === '驳回' ? ' required' : '') + ' placeholder="' + (m.draft.result === '驳回' ? '请输入驳回原因' : '请输入审核意见（选填）') + '">' + esc(m.draft.opinion) + '</textarea>', m.draft.result === '驳回'), '确认' + m.draft.result, 2];
  const result = liveDetailDialog(m), r = val(m.id);
  if (m.type === 'collection-info' && m.draft.tab === '正片详情' && !r.onlineSnapshot) {
    result[1] = tabs([['物料详情', '物料详情'], ['正片详情', '正片详情']], m.draft.tab, 'inspect-tab') + table(['序号', '集数', '标题', '操作'], (r.episodeFiles || []).map((ep, i) => line(String(i + 1), String(ep.index), esc(ep.name), buttons(act('预览', 'live-preview-episode', r.id + '|' + ep.index), act('下载', 'v2-download', encodeURIComponent(JSON.stringify(ep)))))), { key: 'live-inspect-episodes-' + r.id }).replace('暂无匹配的合集', '暂无已上传的正片文件');
  }
  return result;
};
const liveDetailClose = closeModal;
closeModal = () => { const url = ui.modal?.objectUrl; liveDetailClose(); if (url) URL.revokeObjectURL(url); };
for (const key of ['channel', 'operator']) {
  V2_NOTES[key].sections = [V2_NOTES[key].sections[0], ['操作项', [['剧集名称', '点击进入合集详情，返回保留筛选；操作列不另放查看详情。'], ['查看渠道、分配渠道运营', '渠道明细保留搜索、上线状态及分配状态筛选。负责人可按渠道配置运营，运营仅查看本渠道；名单读取用户权限中的具体渠道关联。']]]];
}
V2_NOTES['live-preview-episode'] = v2Note('正片预览', '播放已上传的视频文件，关闭返回原正片详情。');
// Match production menu ordering; all task menus remain independently accessible.
const liveMenuOrder = ['eval', 'materialAudit', 'filmAuditV2', 'materialTasksV2', 'filmTasksV2', 'business', 'schedule', 'channel', 'operator', 'dataV2', 'permissionsV2', 'suppliersV2', 'exportV2'];
NAV.platform.sort((a, b) => liveMenuOrder.indexOf(a[0]) - liveMenuOrder.indexOf(b[0]));
const liveDetailRender = render;
render = function (options) {
  liveDetailRender(options);
  // Avoid adding an administrator-only audit action inside the manager's read-only detail.
  if (ui.view === 'detail' && ui.detailFrom === 'materialAudit') root.querySelectorAll('[data-act="material-result"]').forEach(button => button.remove());
  if (ui.modal?.type === 'live-preview-episode') root.querySelector('.dialog')?.classList.add('wide');
  const settings = root.querySelector('.sidebar nav .nav-label');
  if (settings && ui.side === 'platform') { const first = root.querySelector('.sidebar [data-id="permissionsV2"]'); first?.before(settings); }
};
render();
