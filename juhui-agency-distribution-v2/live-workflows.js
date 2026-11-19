/* Shared live task/list patterns; V1.3 flow rules remain authoritative. */
const liveChannelName = channel => ({ '字节系': '字节系（红果和抖音）', '海外 YouTube': '海外YouTube', '海外 TikTok 端原生': '海外Tiktok端原生', '海外 TT 小程序': '海外TT小程序' }[channel] || channel);
const LIVE_QUEUES = { materialAudit: ['物料审核负责人', 'material', true], filmAuditV2: ['正片审核负责人', 'film', true], materialTasksV2: ['物料审核人员', 'material', false], filmTasksV2: ['正片审核人员', 'film', false] };
const liveReviewers = kind => v2Config.users.filter(u => u.roles.includes(kind === 'film' ? '正片审核人员' : '物料审核人员'));
const liveQueueStatus = (r, kind) => ['审核中', '待分配'].includes(r[kind + 'Status']) ? r[kind + 'Reviewer'] ? '审核中' : '待分配' : r[kind + 'Status'] === '驳回' ? '拒绝' : r[kind + 'Status'];
const liveAssignable = (r, kind) => r && !r.onlineSnapshot && ['审核中', '待分配'].includes(r[kind + 'Status']);
const liveQueueSelected = () => (ui.liveQueueSelected ||= {})[ui.view] ||= new Set();
function liveQueueRows() {
  const [, kind, manager] = LIVE_QUEUES[ui.view], actor = ui['live' + kind + 'Actor'] || liveReviewers(kind)[0]?.id;
  ui['live' + kind + 'Actor'] = actor || '';
  const status = (ui.liveQueueTabs ||= {})[ui.view] || '全部';
  return filtered(records.filter(r => r[kind + 'Status'] !== '待提交' && (manager || actor && r[kind + 'Reviewer'] === actor) && (status === '全部' || liveQueueStatus(r, kind) === status)));
}
function liveQueueView() {
  const [title, kind, manager] = LIVE_QUEUES[ui.view], rows = liveQueueRows(), picked = liveQueueSelected(), people = liveReviewers(kind);
  const identity = manager ? '' : '<div class="v2-role-line"><label>当前审核人员<select data-live-reviewer="' + kind + '"><option value="">请选择</option>' + people.map(u => '<option value="' + esc(u.id) + '"' + (ui['live' + kind + 'Actor'] === u.id ? ' selected' : '') + '>' + esc(u.name) + '</option>').join('') + '</select></label></div>';
  const selectors = [['全部', '全部'], ['待分配', '待分配'], ['审核中', '审核中'], ['通过', '通过'], ['拒绝', '拒绝']].filter(([key]) => manager || key !== '待分配');
  return heading(title, manager ? '负责分配' + (kind === 'film' ? '正片' : '物料') + '审核任务给审核人员' : '负责本人已分配的审核任务') + identity + filters([supplierFilter, collectionFilter, ...(manager ? [[kind + 'Reviewer', '审核人员', people.map(u => u.name)]] : [])]) + tabs(selectors, ui.liveQueueTabs[ui.view] || '全部', 'live-queue-tab') + listing(manager ? kind === 'film' ? '正片审核列表' : '物料审核列表' : kind === 'film' ? '我的正片审核任务' : '我的物料审核任务', [...(manager ? ['<input type="checkbox" data-live-review-all aria-label="选择本页可分配记录">'] : []), 'ID', '剧集名称', '供应商', '集数', kind === 'film' ? '正片状态' : '物料状态', ...(manager ? ['审核人员'] : []), '提交时间', ...(kind === 'film' ? ['本次审核总时长'] : []), '操作 ' + mark(kind === 'film' ? 2 : 1)], rows.map(r => line(...(manager ? ['<input type="checkbox" data-live-review-row="' + r.id + '" aria-label="选择' + esc(r.name) + '"' + (!liveAssignable(r, kind) ? ' disabled' : '') + (picked.has(r.id) ? ' checked' : '') + '>'] : []), esc(r.id), act(r.name, 'open-detail', r.id), esc(r.supplier), esc(r.episodes), tag(liveQueueStatus(r, kind)), ...(manager ? [esc(liveReviewerName(r, kind) || '—')] : []), timestamp(r.submitted), ...(kind === 'film' ? [v24FilmDuration(r)] : []), buttons(manager ? liveAssignable(r, kind) ? act(r[kind + 'Reviewer'] ? '修改审核人' : '分配' + (kind === 'film' ? '正片' : '物料') + '审核', 'live-assign-review', r.id, 'btn primary small') : '' : kind === 'film' ? act(r.filmStatus === '审核中' ? '正片审核' : '查看审核', 'live-film-review', r.id, r.filmStatus === '审核中' ? 'btn primary small' : 'btn small') : r.materialStatus === '审核中' ? act('审核物料', 'live-material-review', r.id, 'btn primary small') : '', act('审核记录', 'history', r.id)))), (kind === 'film' ? act('正片审核演示', 'v24-film-cases', '', 'btn') : '') + (manager ? '<span data-live-selected-count>已选择 ' + picked.size + ' 项</span><button type="button" class="btn primary" data-act="live-batch-review"' + (!picked.size ? ' disabled' : '') + '>批量分配审核</button>' : ''), { note: kind === 'film' ? 1 : 0, className: 'live-review-table' });
}
Object.keys(LIVE_QUEUES).forEach(key => views[key] = liveQueueView);
clickActions['live-queue-tab'] = (_, value) => { ui.liveQueueTabs[ui.view] = value; liveQueueSelected().clear(); if (ui.tablePages[ui.view]) ui.tablePages[ui.view].page = 1; render(); };
root.addEventListener('change', e => {
  if (e.target.hasAttribute('data-live-reviewer')) { ui['live' + e.target.dataset.liveReviewer + 'Actor'] = e.target.value; render(); }
  if (!LIVE_QUEUES[ui.view]) return;
  if (e.target.hasAttribute('data-live-review-row')) { const id = Number(e.target.dataset.liveReviewRow); e.target.checked ? liveQueueSelected().add(id) : liveQueueSelected().delete(id); }
  if (e.target.hasAttribute('data-live-review-all')) root.querySelectorAll('[data-live-review-row]:not(:disabled)').forEach(f => { f.checked = e.target.checked; const id = Number(f.dataset.liveReviewRow); f.checked ? liveQueueSelected().add(id) : liveQueueSelected().delete(id); });
  liveRefreshQueueSelection();
});
function liveRefreshQueueSelection() {
  if (!LIVE_QUEUES[ui.view]) return;
  const valid = new Set(liveQueueRows().filter(r => liveAssignable(r, LIVE_QUEUES[ui.view][1])).map(r => r.id)), picked = liveQueueSelected();
  [...picked].forEach(id => { if (!valid.has(id)) picked.delete(id); });
  const label = root.querySelector('[data-live-selected-count]'); if (label) label.textContent = '已选择 ' + picked.size + ' 项';
  const button = root.querySelector('[data-act="live-batch-review"]'); if (button) button.disabled = !picked.size;
  const all = root.querySelector('[data-live-review-all]'), fields = [...root.querySelectorAll('[data-live-review-row]:not(:disabled)')];
  if (all) { all.checked = fields.length > 0 && fields.every(f => picked.has(Number(f.dataset.liveReviewRow))); all.indeterminate = fields.some(f => f.checked) && !all.checked; }
}
clickActions['live-assign-review'] = r => { const [, kind, manager] = LIVE_QUEUES[ui.view] || []; if (manager && liveAssignable(r, kind)) openModal('live-assign-review', r.id, { reviewer: r[kind + 'Reviewer'] || '' }, { kind, recordIds: [r.id], from: ui.view }); };
clickActions['live-batch-review'] = () => { const [, kind, manager] = LIVE_QUEUES[ui.view] || []; if (manager && liveQueueSelected().size) openModal('live-assign-review', null, { reviewer: '' }, { kind, recordIds: [...liveQueueSelected()], from: ui.view }); };
clickActions['live-material-review'] = r => { if (r.materialReviewer !== ui.livematerialActor || r.materialStatus !== '审核中') return announce('当前没有此任务的审核权限'); ui.selected = r.id; navigate('materialReviewV2'); };
views.materialReviewV2 = () => {
  const r = val(ui.selected); if (!r) return heading('物料审核', '', 'live-material-back');
  const areas = collectionMaterialAreas(r, 0, false);
  return heading('物料审核 · ' + r.name, '', 'live-material-back') + '<div class="live-material-review"><section>' + MATERIAL_SECTIONS.map(([, label]) => '<section class="panel live-material-area"><h2>' + esc(label) + '</h2>' + areas[label] + '</section>').join('') + '</section><aside class="panel live-review-side"><h2>审核操作 ' + mark(1) + '</h2>' + act(ui.liveMaterialCollapsed ? '展开审核操作' : '收起审核操作', 'live-material-collapse', '', 'link') + (ui.liveMaterialCollapsed ? '' : '<label class="field"><span>审核意见</span><textarea name="liveMaterialOpinion" rows="8" placeholder="驳回时必填，通过时可选">' + esc(ui.liveMaterialOpinion || '') + '</textarea></label><div class="actions">' + act('通过', 'live-material-decision', '通过', 'btn primary') + act('驳回', 'live-material-decision', '驳回', 'btn danger') + '</div><p class="error" id="live-material-error"></p>') + '</aside></div>';
};
clickActions['live-material-collapse'] = () => { ui.liveMaterialCollapsed = !ui.liveMaterialCollapsed; render(); };
clickActions['live-material-back'] = () => { ui.liveMaterialOpinion = ''; navigate('materialTasksV2'); };
root.addEventListener('input', e => { if (e.target.name === 'liveMaterialOpinion') ui.liveMaterialOpinion = e.target.value; });
clickActions['live-material-decision'] = (_, result) => {
  const r = val(ui.selected); if (!r || r.onlineSnapshot || r.materialReviewer !== ui.livematerialActor || r.materialStatus !== '审核中') return announce('审核资格已变化，请返回列表刷新');
  if (result === '驳回' && !ui.liveMaterialOpinion?.trim()) return error('请输入驳回原因', '#live-material-error');
  openModal('live-material-confirm', r.id, { result, opinion: ui.liveMaterialOpinion?.trim() || '' });
};
const liveOpenFilm = clickActions['v2-review-film'];
clickActions['live-film-review'] = async r => {
  if (r.filmReviewer !== ui.livefilmActor) return announce('当前没有此任务的查看权限');
  ui.liveFilmFrom = ui.view; await liveOpenFilm(r);
};
const liveFinishFilm = clickActions['v2-finish-film'];
clickActions['v2-finish-film'] = r => {
  if (ui.liveFilmFrom && (r.filmReviewer !== ui.livefilmActor || r.filmStatus !== '审核中')) return error('审核资格已变化，请返回列表刷新', '#v2-film-error');
  liveFinishFilm(r); if (ui.view === 'filmAuditV2' && ui.liveFilmFrom) navigate(ui.liveFilmFrom);
};
clickActions['v2-review-back'] = () => { if (ui.filmDraft && val(ui.selected)?.filmStatus === '审核中' && !confirm('返回后本次未确认的单集结果将不保存，确认返回？')) return; ui.filmDraft = null; navigate(ui.liveFilmFrom || 'filmAuditV2'); };
const liveWorkName = (r, channel) => r.channelVersions?.[channel]?.name || r.channelNames?.[channel] || r.onlineSnapshot?.channels.find(c => c.key === channel)?.workName || r.name;
function liveChannelListView() {
  const operator = ui.view === 'operator';
  const list = filtered(records.filter(r => v2ScheduleConfirmed(r) && (!operator || channelsFor(r).includes(ui.channel) && (r.assignment[ui.channel] || r.stage === STAGES[3]))).map(r => operator ? { ...r, name: liveWorkName(r, ui.channel) } : r)).filter(r => (!ui.filters.launchStart || v2LaunchTime(r).slice(0, 10) >= ui.filters.launchStart) && (!ui.filters.launchEnd || v2LaunchTime(r).slice(0, 10) <= ui.filters.launchEnd));
  return heading(operator ? '渠道运营' : '渠道负责人', operator ? '负责对应渠道的上线运营与跟进' : '分配合集给渠道运营') + filters([supplierFilter, collectionFilter, ...reviewerFilters, ['launchStart', '上线时间', 'date'], ['launchEnd', '结束日期', 'date']]) + listing(operator ? '渠道运营列表' : '渠道管理列表', ['ID', '剧集名称', '供应商', '渠道', '发行状态', '上线状态', '审核人员', '上线时间', '转免时间', '操作 ' + mark(2)], list.map(r => line(esc(r.id), act(r.name, 'open-detail', r.id), esc(r.supplier), act('共 ' + (operator ? 1 : channelsFor(r).length) + ' 个渠道', 'channel-list', r.id), tag(issuanceStatus(r)), tag(r.stage === STAGES[3] ? '已上线' : '未上线'), '<span title="' + esc('物料：' + (liveReviewerName(r, 'material') || '—') + '；正片：' + (liveReviewerName(r, 'film') || '—')) + '">' + esc('物料：' + (liveReviewerName(r, 'material') || '—') + '；正片：' + (liveReviewerName(r, 'film') || '—')) + '</span>', timestamp(v2LaunchTime(r)), timestamp(v2FreeTime(r)), buttons(act('审核记录', 'history', r.id), act('查看渠道', 'channel-list', r.id), !operator && !r.onlineSnapshot ? act(Object.keys(r.assignment).length ? '修改渠道运营' : '分配渠道运营', 'live-assign-operators', r.id, 'btn primary small') : ''))), '', { note: 1, className: 'v2-collection-channel-table' });
}
views.channel = liveChannelListView; views.operator = liveChannelListView;
function liveOperatorOptions(channel) {
  const ids = new Set(livePermissions().filter(p => p.role === '渠道运营' && p.associatedChannels.some(c => liveChannelName(c) === liveChannelName(channel))).map(p => p.userId));
  return v2Config.users.filter(u => ids.has(u.id)).map(u => [u.id, u.name]);
}
clickActions['channel-list'] = r => openModal('channelList', r.id, { keyword: '', online: '全部', assignment: '全部' });
clickActions['live-assign-operators'] = (r, id) => {
  const collection = r || val(ui.modal?.id), channels = r ? channelsFor(r) : [decodeURIComponent(id)]; if (!collection || collection.onlineSnapshot || ui.view === 'operator') return;
  const draft = { assignments: Object.fromEntries(channels.map(ch => [ch, [...(collection.operatorIds?.[ch] || [])]])) };
  openModal('live-assign-operators', collection.id, draft, { channels, returnModal: ui.modal?.type === 'channelList' ? structuredClone(ui.modal) : null });
};
const livePermissionPick = clickActions['live-pick'];
clickActions['live-pick'] = (_, id) => {
  if (ui.modal?.type !== 'live-assign-operators') return livePermissionPick(_, id);
  const [key, encoded] = id.split('|'), channel = decodeURIComponent(key.slice(3)), userId = decodeURIComponent(encoded), chosen = ui.modal.draft.assignments[channel];
  if (!chosen || !liveOperatorOptions(channel).some(([id]) => id === userId)) return;
  ui.modal.draft.assignments[channel] = chosen.includes(userId) ? chosen.filter(id => id !== userId) : [...chosen, userId]; render();
  const picker = [...root.querySelectorAll('[data-picker]')].find(p => p.dataset.picker === key); if (picker) { picker.open = true; livePositionPicker(picker); }
};
root.addEventListener('input', e => {
  if (ui.modal?.type !== 'channelList' || !e.target.hasAttribute('data-live-channel-filter')) return;
  ui.modal.draft[e.target.dataset.liveChannelFilter] = e.target.value;
});
root.addEventListener('change', e => {
  if (ui.modal?.type === 'channelList' && e.target.hasAttribute('data-live-channel-filter')) { ui.modal.draft[e.target.dataset.liveChannelFilter] = e.target.value; render(); }
});
clickActions['live-channel-search'] = () => render();
const liveFlowDialog = dialogBody;
dialogBody = m => {
  const r = val(m.id), d = m.draft;
  if (m.type === 'live-assign-review') return [m.recordIds.length > 1 ? '批量分配' + (m.kind === 'film' ? '正片' : '物料') + '审核' : '分配' + (m.kind === 'film' ? '正片' : '物料') + '审核人员', '<p>' + (m.recordIds.length === 1 ? esc(val(m.recordIds[0])?.name || '') : '已选择 ' + m.recordIds.length + ' 项合集') + '</p>' + formField('审核人员', '<select name="reviewer" required><option value="">请选择审核人员</option>' + liveReviewers(m.kind).map(u => '<option value="' + esc(u.id) + '"' + (d.reviewer === u.id ? ' selected' : '') + '>' + esc(u.name) + '</option>').join('') + '</select>', true) + (!liveReviewers(m.kind).length ? '<p class="field-hint">暂无该岗位人员，请先在用户权限分配中关联角色。</p>' : ''), m.recordIds.length > 1 ? '确认批量分配' : '确认分配', 2];
  if (m.type === 'live-material-confirm') return ['提示', '<p>确认物料审核' + esc(d.result) + '？</p>' + (d.opinion ? '<p>' + esc(d.opinion) + '</p>' : ''), '确认'];
  if (m.type === 'live-assign-operators') return ['分配渠道运营', '<p>' + esc(r.name) + '</p>' + m.channels.map(ch => formField(liveChannelName(ch), livePicker('op:' + encodeURIComponent(ch), '渠道运营', liveOperatorOptions(ch), d.assignments[ch], true) + (!liveOperatorOptions(ch).length ? '<p class="field-hint">暂无可分配渠道运营，请在用户权限分配中配置该渠道。</p>' : ''), true)).join(''), '确认分配', 2];
  if (m.type === 'channelList') {
    const channels = channelsFor(r).filter(ch => (!d.keyword || liveChannelName(ch).includes(d.keyword)) && (ui.view !== 'operator' || ch === ui.channel) && liveMatches(d.online, r.stage === STAGES[3] ? '已上线' : '未上线') && (d.assignment === '全部' || !d.assignment || (Boolean(r.assignment[ch]) ? '已分配' : '未分配') === d.assignment));
    return [r.name + ' — 渠道明细', '<div class="live-channel-filters">' + input('channelKeyword', d.keyword, '搜索渠道名称', 'search', 'data-live-channel-filter="keyword"') + select('channelOnline', ['全部', '未上线', '已上线'], d.online || '全部', 'data-live-channel-filter="online"') + (ui.view !== 'operator' ? select('channelAssignment', ['全部', '已分配', '未分配'], d.assignment || '全部', 'data-live-channel-filter="assignment"') : '') + act('搜索', 'live-channel-search', '', 'btn') + (ui.view !== 'operator' && !r.onlineSnapshot ? act('批量分配运营', 'live-assign-operators', r.id, 'btn primary') : '') + '</div><p class="field-hint">共 ' + channelsFor(r).length + ' 个渠道，当前显示 ' + channels.length + ' 个</p>' + table(['渠道记录ID', '渠道名称', '发行状态', '上线状态', '渠道运营', '驳回原因', '操作'], channels.map(ch => line(esc(r.channelRecordIds?.[ch] || '—'), esc(liveChannelName(ch)), tag(issuanceStatus(r)), tag(r.stage === STAGES[3] ? '已上线' : '未上线'), esc(r.assignment[ch] || '—'), esc(r.channelMaterialReturns?.[ch]?.opinion || '—'), ui.view !== 'operator' ? !r.onlineSnapshot ? act('分配运营', 'live-assign-operators', encodeURIComponent(ch)) : '—' : act('查看详情', 'channel-detail', ch))), { key: 'live-channel-detail', className: 'live-channel-dialog-table' }), ''];
  }
  return liveFlowDialog(m);
};
const liveFlowSubmit = submitDialog;
submitDialog = form => {
  const m = ui.modal, data = new FormData(form), r = val(m.id);
  if (m.type === 'live-assign-review') {
    const reviewer = String(data.get('reviewer') || ''); if (!liveReviewers(m.kind).some(u => u.id === reviewer)) return error('请选择审核人员');
    if (m.recordIds.some(id => !liveAssignable(val(id), m.kind))) return error('部分记录的审核状态已变化，请返回列表重新选择');
    m.recordIds.forEach(id => { const record = val(id); record[m.kind + 'Reviewer'] = reviewer; record[m.kind + 'Status'] = '审核中'; recordLog(record, '分配' + (m.kind === 'film' ? '正片' : '物料') + '审核人员：' + v2User(reviewer).name); });
    liveQueueSelected().clear(); persist(); closeModal(); announce('分配成功'); return;
  }
  if (m.type === 'live-material-confirm') {
    if (r.onlineSnapshot || r.materialReviewer !== ui.livematerialActor || r.materialStatus !== '审核中') return error('审核资格已变化，请返回列表刷新');
    (r.materialHistory ||= []).unshift({ submitted: r.materialSubmitted || '', time: now(), actor: v2User(ui.livematerialActor)?.name || '未记录', result: m.draft.result, opinion: m.draft.opinion });
    r.materialStatus = m.draft.result === '驳回' ? '拒绝' : '通过'; r.materialOpinion = m.draft.opinion;
    recordLog(r, '物料审核' + m.draft.result + ' · ' + (v2User(ui.livematerialActor)?.name || '') + (m.draft.opinion ? '：' + m.draft.opinion : '')); syncBusiness(r); persist(); ui.modal = null; ui.liveMaterialOpinion = ''; navigate('materialTasksV2'); announce('物料审核' + m.draft.result); return;
  }
  if (m.type === 'live-assign-operators') {
    if (r.onlineSnapshot || ui.view === 'operator') return error('当前无分配权限');
    for (const ch of m.channels) { const ids = m.draft.assignments[ch]; if (!ids?.length || ids.some(id => !liveOperatorOptions(ch).some(([uid]) => uid === id))) return error('请为“' + liveChannelName(ch) + '”选择有该渠道权限的运营人员'); }
    r.operatorIds ||= {}; m.channels.forEach(ch => { r.operatorIds[ch] = [...m.draft.assignments[ch]]; r.assignment[ch] = r.operatorIds[ch].map(id => v2User(id).name).join('、'); }); recordLog(r, '渠道运营已分配'); persist(); closeModal(); announce('渠道运营已分配'); return;
  }
  return liveFlowSubmit(form);
};
for (const [id, title, iconName] of [['materialTasksV2', '物料审核人员', 'folder'], ['filmTasksV2', '正片审核人员', 'video']]) { if (!NAV.platform.some(x => x[0] === id)) NAV.platform.splice(3, 0, [id, title, iconName]); if (!platformViews.includes(id)) platformViews.push(id); if (!entryViews.includes(id)) entryViews.push(id); }
if (!platformViews.includes('materialReviewV2')) platformViews.push('materialReviewV2');
for (const [key, [title, kind, manager]] of Object.entries(LIVE_QUEUES)) V2_NOTES[key] = v2Note(title, '沿用线上负责人分派、审核人员办理的独立岗位入口。', [['列表项', [[kind === 'film' ? '本次审核总时长' : '物料审核状态', kind === 'film' ? '初审汇总全集，复审仅汇总本轮替换视频；保持原审核人员与提交时间。' : '读取本轮物料审核状态，未分配与审核中分别展示。']]], ['操作项', [[manager ? '分配审核、修改审核人、批量分配审核' : '审核', manager ? '选择对应岗位人员。批量确认前复核状态，失败保留选择，不改已提交意见。' : '仅办理本人已分配且审核中的任务；记录意见与实际审核人。'], ['审核记录、剧集名称', '查看已有记录或进入合集详情；返回保留列表筛选。']]]]);
for (const key of ['materialAudit', 'materialTasksV2']) V2_NOTES[key] = v2Note(LIVE_QUEUES[key][0], '本期补充审核记录的完整评估意见；列表、分派和审核操作沿用线上。', [['操作项', [['审核记录', '按Tab展示内容质量评估（含商务最终反馈）、内容评估、物料和正片审核记录；保留完整意见及修改前、撤回、重提前的历史。']]]], '11.18 更新。');
V2_NOTES.materialReviewV2 = v2Note('物料审核', '沿用线上审核操作，按更新后的物料字段查看提交资料，并衔接排播流程。', [['操作项', [['审核后流转', '仅当物料审核通过、正片审核通过且有授权书三项齐备，剧集进入排播负责人；物料驳回不进入排播。审核意见及通过／驳回沿用现有操作。']]]], '11.18 更新。');
V2_NOTES['live-assign-review'] = v2Note('分配审核人员', '复用线上单条与批量分配弹窗。', [['配置项', [['审核人员', '仅选择对应角色人员，保留已分配人回显。']]], ['操作项', [['确认分配', '仅修改选中待分配／审核中记录的审核人员，保留原意见与历史；取消不修改。']]]]);
V2_NOTES['live-assign-operators'] = v2Note('分配渠道运营', '按线上方式逐渠道选择运营，可从列表或渠道明细进入。', [['配置项', [['渠道运营', '只显示用户权限中关联该具体渠道的运营，支持多选；无匹配人员时不伪造候选。']]], ['操作项', [['确认分配', '全部渠道选择有效后保存，同步渠道列表及合集详情；取消不改原分配。']]]]);
const liveFlowRender = render;
render = function (options) {
  liveFlowRender(options); liveRefreshQueueSelection();
  if (ui.modal && ['live-assign-review', 'live-material-confirm'].includes(ui.modal.type)) root.querySelector('.dialog')?.classList.add('live-permission-dialog');
  if (ui.modal?.type === 'live-assign-operators') root.querySelector('.dialog')?.classList.add('live-operator-dialog');
  if (ui.modal?.type === 'channelList') root.querySelector('.dialog')?.classList.add('live-channel-dialog');
  if (ui.modal?.type === 'live-data-import') root.querySelector('.dialog')?.classList.add('live-data-dialog');
  const nav = root.querySelector('.sidebar nav');
  const settings = nav?.querySelector('[data-id="' + (ui.side === 'platform' ? 'suppliersV2' : 'supplierProfileV2') + '"]');
  if (settings) settings.insertAdjacentHTML('beforebegin', '<div class="nav-label">系统设置</div>');
  if (ui.view === 'filmReviewV2') { nav?.querySelector('[data-id="filmTasksV2"]')?.classList.add('active'); }
  if (ui.view === 'materialReviewV2') { nav?.querySelector('[data-id="materialTasksV2"]')?.classList.add('active'); }
};
if (['materialTasksV2', 'filmTasksV2', 'supplierDataV2', 'supplierProfileV2'].includes(location.hash.slice(1))) { ui.view = location.hash.slice(1); ui.side = platformViews.includes(ui.view) ? 'platform' : 'supplier'; }
render();
