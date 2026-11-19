/* 11.18: shared, read-only audit history tabs, matching the live dialog. */
const AUDIT_TABS = [['quality', '内容质量评估'], ['content', '内容评估'], ['material', '物料审核记录'], ['film', '正片审核记录']];
function auditEvaluationItems(r) {
  const rows = [];
  const add = (x, stage, type, action, eventTime) => rows.push({ stage, type, person: x.actor || v2User(x.userId)?.name || '未记录', result: x.result || '', opinion: x.opinion, time: eventTime || x.time || '', action });
  const qualityType = x => x.channel ? x.channel + '质量评估' : '商务最终反馈';
  const recorded = x => rows.some(y => y.stage === 'quality' && y.type === qualityType(x) && y.person === (x.actor || v2User(x.userId)?.name || '未记录') && y.result === x.result && y.opinion === x.opinion && y.time === x.time);
  (r.qualityHistory || []).forEach(h => {
    const x = h.snapshot;
    if (x?.opinion !== undefined) add(x, 'quality', qualityType(x), h.action || '提交意见', h.time);
    (x?.tasks || []).filter(t => t.result).forEach(t => add(t, 'quality', qualityType(t), '重提前意见'));
    if (x?.final) add(x.final, 'quality', '商务最终反馈', '重提前意见');
  });
  (r.qualityTasks || []).filter(x => x.result && !recorded(x)).forEach(x => add(x, 'quality', qualityType(x), '提交意见'));
  if (r.qualityFinal && !recorded(r.qualityFinal)) add(r.qualityFinal, 'quality', '商务最终反馈', '最终反馈');
  const content = (x, action) => add(x, x.group < 0 ? 'quality' : 'content', x.group < 0 ? '内容质量评估' : GROUPS[x.group] || '内容评估', action);
  (r.reviews || []).forEach(x => content(x, '提交意见'));
  (r.contentReviewHistory || []).forEach(x => content(x, x.action || '修改前意见'));
  (r.evaluationHistory || []).forEach(h => (h.reviews || []).forEach(x => content(x, '重提前意见')));
  return rows.sort((a, b) => String(b.time).localeCompare(String(a.time)));
}
function auditMaterialItems(r) {
  const saved = r.materialHistory || [];
  // Older versions only stored the full material audit text in the event log.
  const legacy = (r.logs || []).filter(x => /^物料审核(?:通过|驳回|拒绝)/.test(x.text || '') && !saved.some(h => h.time === x.time && x.text.startsWith('物料审核' + h.result)))
    .map(x => ({ time: x.time, result: /^物料审核通过/.test(x.text) ? '通过' : '驳回', legacyText: x.text }));
  if (!saved.length && !legacy.length && r.materialOpinion) legacy.push({ result: r.materialStatus, opinion: r.materialOpinion });
  return [...saved, ...legacy].sort((a, b) => String(b.time || '').localeCompare(String(a.time || '')));
}
const auditMeta = (name, value) => '<span class="audit-meta"><span>' + esc(name) + '</span><span>' + esc(value || '—') + '</span></span>';
const auditEmpty = label => '<div class="audit-empty">暂无' + esc(label) + '记录</div>';
function auditEvaluationCards(items, showPerson = true) {
  return items.map(x => '<article class="audit-card"><div class="audit-card-meta"><strong>' + esc(x.type) + '</strong>' + (showPerson ? auditMeta('评估人', x.person) : '') + auditMeta('时间', x.time) + '<span class="audit-result">' + tag(x.result || '—') + '</span></div><div class="audit-opinion"><div class="audit-action">' + esc(x.action) + '</div><div class="audit-full-text">' + esc(x.opinion || (x.result ? '未填写' : '—')) + '</div></div></article>').join('');
}
function auditMaterialCards(items) {
  return items.map(x => '<article class="audit-card"><div class="audit-card-meta">' + auditMeta('提交时间', x.submitted) + auditMeta('审核时间', x.time) + auditMeta('审核人', x.actor) + '<span class="audit-result">' + tag(x.result || '—') + '</span></div><div class="audit-opinion"><div class="audit-action">' + (x.legacyText ? '历史审核记录' : '审核意见') + '</div><div class="audit-full-text">' + esc(x.legacyText || x.opinion || '未填写') + '</div></div></article>').join('');
}
function auditFilmCards(r, items, draft) {
  return items.map((h, index) => {
    const entries = Object.entries(h.results || {}).filter(([id]) => h.round?.ids?.includes(id));
    const result = entries.some(([, x]) => ['驳回', '拒绝'].includes(x.result)) ? '驳回' : entries.length && entries.every(([, x]) => x.result === '通过') ? '通过' : '—';
    const rows = entries.map(([id, x]) => line('第' + esc(x.index || r.episodeFiles?.find(e => e.id === id)?.index || r.episodeHistory?.find(e => e.id === id)?.index || '—') + '集', tag(x.result || '—'), '<div class="audit-full-text">' + esc(x.opinion || (x.result ? '未填写' : '—')) + '</div>')).join('');
    return '<article class="audit-card"><div class="audit-card-meta">' + auditMeta('提交时间', h.submitted || h.round?.submitted) + auditMeta('审核时间', h.time) + auditMeta('审核人', h.actor) + '<span class="audit-result">' + tag(result) + '</span></div><details class="audit-episodes" data-audit-round="' + index + '"' + (draft.expanded?.[index] ? ' open' : '') + '><summary>逐集审核结果<span>第' + esc(h.round?.number || 1) + '轮 · ' + entries.length + '集</span></summary><table class="audit-episode-table"><thead><tr><th>集数</th><th>审核结果</th><th>审核备注</th></tr></thead><tbody>' + rows + '</tbody></table></details></article>';
  }).join('');
}
function auditHistoryBody(r, modal) {
  const d = modal.draft, evaluations = auditEvaluationItems(r);
  d.auditTab ||= ui.view === 'qualityV2' ? 'quality' : ['eval', 'supplierEval'].includes(ui.view) || modal.type === 'review' ? 'content' : ui.view.startsWith('film') ? 'film' : 'material';
  const groups = { quality: evaluations.filter(x => x.stage === 'quality'), content: evaluations.filter(x => x.stage === 'content'), material: auditMaterialItems(r), film: [...(r.filmHistory || [])].sort((a, b) => String(b.time).localeCompare(String(a.time))) };
  const nav = '<div class="audit-tab-row"><div class="tabs audit-tabs" role="tablist" aria-label="审核记录类型">' + AUDIT_TABS.map(([key, label]) => '<button type="button" role="tab" id="audit-tab-' + key + '" aria-controls="audit-panel" aria-selected="' + (key === d.auditTab) + '" data-act="audit-history-tab" data-id="' + key + '"><span' + (['quality', 'content'].includes(key) ? ' class="changed-field"' : '') + '>' + esc(label) + '</span>' + (groups[key].length ? '<span class="audit-count">' + groups[key].length + '</span>' : '') + '</button>').join('') + '</div>' + mark(1) + '</div>';
  const items = groups[d.auditTab];
  const cards = ['quality', 'content'].includes(d.auditTab) ? auditEvaluationCards(items) : d.auditTab === 'material' ? auditMaterialCards(items) : auditFilmCards(r, items, d);
  const logs = r.logs?.length ? '<details class="audit-flow" data-audit-flow' + (d.flowOpen ? ' open' : '') + '><summary>流转记录</summary>' + r.logs.map(x => '<div class="audit-flow-item"><time>' + esc(x.time) + '</time><div class="audit-full-text">' + esc(x.text) + '</div></div>').join('') + '</details>' : '';
  return nav + '<div id="audit-panel" role="tabpanel" aria-labelledby="audit-tab-' + d.auditTab + '">' + (cards || auditEmpty(AUDIT_TABS.find(([key]) => key === d.auditTab)[1].replace('记录', ''))) + '</div>' + logs;
}
const OPINION_TABS = [['quality', '内容质量评估'], ['content', '内容评估']];
function opinionResultRow(label, item, result) {
  const decided = ['通过', '驳回', '拒绝'].includes(result);
  return line(esc(label), tag(result), '<div class="audit-full-text">' + esc(item?.opinion || (decided ? '未填写' : '—')) + '</div>', timestamp(item?.time));
}
function opinionQualityRows(r) {
  const tasks = r.qualityTasks || [], rows = [];
  const channels = [...new Set([...v13Intent(r), ...tasks.map(t => t.channel)])];
  if (!r.qualityBypass || tasks.length) channels.forEach(channel => {
    const items = tasks.filter(t => t.channel === channel);
    if (items.length) items.forEach(t => rows.push(opinionResultRow(channel, t, t.result || '待审核')));
    else rows.push(opinionResultRow(channel, null, r.onlineSnapshot ? '未读取' : r.qualityFinal ? '未记录' : '未分配'));
  });
  rows.push(opinionResultRow('商务负责人', r.qualityFinal, r.qualityFinal?.result || (r.qualityBypass ? '无需评估' : r.onlineSnapshot ? '未读取' : '待审核')));
  return rows;
}
function opinionContentRows(r) {
  return GROUPS.map((group, index) => {
    const item = (r.reviews || []).find(x => x.group === index), state = groupStatus(r, index);
    if (state === '无需评估') return opinionResultRow(group, null, state);
    const result = r.onlineSnapshot && !item ? '未读取' : state === '待评估' ? (r.quality === '通过' ? '待审核' : '未开始') : state;
    return opinionResultRow(group, item, result);
  });
}
function opinionHistory(r, tab) {
  const history = auditEvaluationItems({ ...r, qualityTasks: [], qualityFinal: null, reviews: (r.reviews || []).filter(x => x.group < 0) }).filter(x => x.stage === tab);
  const legacy = tab === 'quality' ? (r.qualityHistory || []).filter(h => !h.snapshot).map(h => '<div class="audit-flow-item"><time>' + esc(h.time || '—') + '</time><div class="audit-full-text">' + esc(h.action || '历史记录') + '</div></div>').join('') : '';
  return '<section class="opinion-history"><h3>历史记录</h3>' + (auditEvaluationCards(history, false) + legacy || '<p class="muted">暂无历史记录</p>') + '</section>';
}
function opinionTabsBody(r, modal) {
  const d = modal.draft; d.opinionTab ||= 'quality';
  const nav = '<div class="audit-tab-row"><div class="tabs opinion-tabs" role="tablist" aria-label="评估意见类型">' + OPINION_TABS.map(([key, label]) => '<button type="button" role="tab" id="opinion-tab-' + key + '" aria-controls="opinion-panel" aria-selected="' + (key === d.opinionTab) + '" tabindex="' + (key === d.opinionTab ? '0' : '-1') + '" class="' + (key === d.opinionTab ? 'active' : '') + '" data-act="opinion-tab" data-id="' + key + '"><span class="changed-field">' + label + '</span></button>').join('') + '</div>' + mark(1) + '</div>';
  const rows = d.opinionTab === 'quality' ? opinionQualityRows(r) : opinionContentRows(r);
  const tableBody = '<div class="opinion-results"><table><thead><tr>' + [d.opinionTab === 'quality' ? '评估渠道／角色' : '评估组', '审核结果', '审核备注', '审核时间'].map(label => '<th>' + label + '</th>').join('') + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>';
  return nav + '<div id="opinion-panel" role="tabpanel" aria-labelledby="opinion-tab-' + d.opinionTab + '">' + (d.opinionTab === 'quality' && r.qualityBypass ? '<p class="field-hint">供应商白名单，本轮无需内容质量评估。</p>' : '') + tableBody + opinionHistory(r, d.opinionTab) + '</div>';
}
const auditPreviousBody = dialogBody;
dialogBody = modal => modal.type === 'v2-opinions' ? ['评估意见 · ' + val(modal.id).name, opinionTabsBody(val(modal.id), modal), ''] : ['history', 'review'].includes(modal.type) ? ['审核记录 - ' + val(modal.id).name, auditHistoryBody(val(modal.id), modal), ''] : auditPreviousBody(modal);
const auditPreviousDialog = dialog;
dialog = modal => {
  const html = auditPreviousDialog(modal);
  return modal.type === 'v2-opinions' ? html.replace('class="dialog ', 'class="dialog opinion-tabs-dialog ') : ['history', 'review'].includes(modal.type) ? html.replace('class="dialog ', 'class="dialog audit-history-dialog ') : html;
};
clickActions['opinion-tab'] = (_, key) => {
  const m = ui.modal;
  if (m?.type !== 'v2-opinions' || !OPINION_TABS.some(([id]) => id === key)) return;
  (m.draft.opinionScroll ||= {})[m.draft.opinionTab] = root.querySelector('.dialog-body').scrollTop;
  m.draft.opinionTab = key; render();
  root.querySelector('.dialog-body').scrollTop = m.draft.opinionScroll[key] || 0;
  root.querySelector('#opinion-tab-' + key)?.focus({ preventScroll: true });
};
clickActions['audit-history-tab'] = (_, key) => {
  const m = ui.modal;
  if (!m || !['history', 'review'].includes(m.type) || !AUDIT_TABS.some(([id]) => id === key)) return;
  (m.draft.scroll ||= {})[m.draft.auditTab] = root.querySelector('.dialog-body').scrollTop;
  m.draft.auditTab = key; render();
  root.querySelector('.dialog-body').scrollTop = m.draft.scroll[key] || 0;
  root.querySelector('#audit-tab-' + key)?.focus({ preventScroll: true });
};
root.addEventListener('toggle', e => {
  if (!ui.modal || !['history', 'review'].includes(ui.modal.type)) return;
  if (e.target.hasAttribute('data-audit-round')) (ui.modal.draft.expanded ||= {})[e.target.dataset.auditRound] = e.target.open;
  if (e.target.hasAttribute('data-audit-flow')) ui.modal.draft.flowOpen = e.target.open;
}, true);
root.addEventListener('keydown', e => {
  if (e.target.matches('.opinion-tabs [role="tab"]') && ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
    e.preventDefault();
    const next = e.key === 'Home' ? 'quality' : e.key === 'End' ? 'content' : e.target.dataset.id === 'quality' ? 'content' : 'quality';
    clickActions['opinion-tab'](null, next); return;
  }
  if (!e.target.matches('.audit-tabs [role="tab"]') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
  e.preventDefault(); const index = AUDIT_TABS.findIndex(([key]) => key === e.target.dataset.id);
  const next = e.key === 'Home' ? 0 : e.key === 'End' ? 3 : (index + (e.key === 'ArrowRight' ? 1 : 3)) % 4;
  clickActions['audit-history-tab'](null, AUDIT_TABS[next][0]);
});
V2_NOTES['v2-opinions'] = v13Note('查看评估意见', '正文仅展示审核结果及历史意见，按两个Tab分别查看。', [['列表项／操作项', [
  ['评估意见Tab', '默认选中内容质量评估，可切换内容评估；切换只读，不修改结果。关闭返回原列表。'],
  ['内容质量评估', '展示本轮对应渠道及商务负责人的审核结果、完整备注和时间，不展示审核人员；同渠道多条意见分别保留，商务最终结果归入此Tab。'],
  ['内容评估', '分别展示审核组评估、红果评估、运营评估的结果、完整备注和时间，不展示审核人员；红果不参与时显示无需评估。'],
  ['待审核及历史', '未进入内容评估阶段显示未开始，已进入但未处理显示待审核。历史按两个Tab保留，也不展示审核人员；缺失时间不补造，通过未填备注显示未填写。平台内部审核记录仍保留人员信息。']
]]], '11.18 更新。');
for (const key of ['history', 'review']) V2_NOTES[key] = v13Note('审核记录', '沿用线上弹窗与Tab结构，补充两类评估完整意见。', [['列表项／操作项', [
  ['审核记录Tab', '按内容质量评估、内容评估、物料审核记录、正片审核记录分开展示；从对应审核页面进入默认选中对应Tab，其他入口默认物料审核记录。切换仅查看，不修改审核结果。'],
  ['内容质量评估', '展示各参与渠道及商务最终反馈，保留撤回、修改和重提前的意见；完整显示评估人、结果、时间与文字意见。'],
  ['内容评估', '展示审核组、红果组、运营组的实际意见及历史，不混入质量评估或正片意见。'],
  ['物料／正片审核记录', '保留线上审核卡片结构；正片可展开逐集审核结果和备注，暂无记录时显示空态。历史缺少的人员与时间不推测补齐。']
]]], '11.18 更新。');
render();
