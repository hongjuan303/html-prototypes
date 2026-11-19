/* V2 film review overlays its source task list; V1 and stored records are untouched. */
ui.filmDialogLayout = true;
const v30FilmSource = () => LIVE_QUEUES[ui.liveFilmFrom]?.[1] === 'film' ? ui.liveFilmFrom : 'filmTasksV2';
ui.filmBackdrop = () => {
  const previous = { view: ui.view, filters: ui.filters, filterDraft: ui.filterDraft };
  const source = v30FilmSource();
  ui.view = source;
  ui.filters = ui.listState[source]?.filters || {};
  ui.filterDraft = ui.listState[source]?.draft || {};
  try { return views[source](); } finally { Object.assign(ui, previous); }
};
const v30OpenFilm = clickActions['live-film-review'];
clickActions['live-film-review'] = async r => {
  ui.filmListScroll = root.querySelector('.screen')?.scrollTop || 0;
  return v30OpenFilm(r);
};

function v26FilmContext() {
  const r = val(ui.selected);
  if (!r) return null;
  if (!ui.filmDraft) { ui.filmPicked = []; ui.filmRejectAttempted = new Set(); ui.filmDraft = Object.fromEntries(r.episodeFiles.map(e => [e.id, { result: e.result || '', opinion: e.opinion || '' }])); }
  const ids = r.filmRound?.ids || r.episodeFiles.map(e => e.id);
  const writable = r.filmStatus === '审核中' && !r.onlineSnapshot && (!ui.liveFilmFrom || r.filmReviewer === ui.livefilmActor);
  const selectable = writable ? ids.filter(id => ui.filmDraft[id] && ui.filmDraft[id].result !== '通过') : [];
  ui.filmPicked = (ui.filmPicked || []).filter(id => selectable.includes(id));
  const valid = writable && ids.length > 0 && ids.every(id => ['通过', '驳回'].includes(ui.filmDraft[id]?.result) && (ui.filmDraft[id].result !== '驳回' || ui.filmDraft[id].opinion.trim()));
  return { r, ids, writable, selectable, valid };
}
function v28EpisodeNavigation(r, episode) {
  const position = r.episodeFiles.indexOf(episode), total = r.episodeFiles.length;
  const button = (step, label, path) => {
    const adjacent = r.episodeFiles[position + step], disabled = position < 0 || !adjacent;
    const title = disabled ? total ? step < 0 ? '已是第一集' : '已是最后一集' : '暂无分集' : label + '（第' + adjacent.index + '集）';
    return '<button type="button" class="btn v28-episode-nav" data-act="v28-episode-step" data-id="' + step + '" aria-label="' + label + '" title="' + title + '"' + (disabled ? ' disabled' : '') + '><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + path + '"></path></svg></button>';
  };
  return '<div class="v28-episode-navigation" aria-label="视频分集切换">' + button(-1, '上一集', 'M6 5v14M18 5l-9 7 9 7z') + '<span class="v28-episode-position" aria-label="当前分集位置">' + (position + 1) + ' / ' + total + '</span>' + button(1, '下一集', 'M18 5v14M6 5l9 7-9 7z') + mark(3) + '</div>';
}
views.filmReviewV2 = () => {
  const c = v26FilmContext(); if (!c) return heading('正片审核');
  const { r, ids, writable, selectable, valid } = c, draft = ui.filmDraft;
  const episode = r.episodeFiles.find(e => e.id === ui.episodeId) || r.episodeFiles[0];
  const editable = writable && ids.includes(episode?.id), state = draft[episode?.id] || {};
  return '<div class="v30-film-overlay"><section class="v26-film-dialog" role="dialog" aria-modal="true" aria-labelledby="film-dialog-title" tabindex="-1">' +
    '<header class="v26-film-header"><h2 id="film-dialog-title">正片审核 - ' + esc(r.name) + '</h2><button type="button" class="close" data-act="v2-review-back" aria-label="关闭正片审核">×</button></header>' +
    '<div class="v26-film-body"><div class="v26-film-summary">' + mark(1) + '<span class="changed-field">本次需审核总集数：' + ids.length + ' 集</span><span class="changed-field">本次需审核总时长：' + v2Duration(v2RoundDuration(r)) + '</span><span class="muted">' + esc(r.filmRound?.kind || '已完成审核') + ' · 审核人员：' + esc(v2User(r.filmReviewer)?.name || '待分配') + '</span></div>' +
    '<div class="v26-film-workspace"><aside class="v26-film-episodes"><div class="v26-film-batch"><label class="check"><input type="checkbox" data-film-all aria-label="全选本轮未通过集"' + (!selectable.length ? ' disabled' : '') + (selectable.length && selectable.length === ui.filmPicked.length ? ' checked' : '') + '>全选（仅未通过集）</label><div class="actions"><button class="btn small v26-pass" type="button" data-act="v26-batch-pass"' + (!ui.filmPicked.length ? ' disabled' : '') + '>批量通过</button><button class="btn small v26-reject" type="button" data-act="v26-batch-reject"' + (!ui.filmPicked.length ? ' disabled' : '') + '>批量驳回</button>' + mark(3) + '</div><span class="muted">已选 ' + ui.filmPicked.length + ' 集 / 可选 ' + selectable.length + ' 集</span></div><div class="v26-episode-scroll">' +
    r.episodeFiles.map(e => '<div class="v26-episode-row' + (e.id === episode?.id ? ' active' : '') + '"><input type="checkbox" data-film-pick="' + esc(e.id) + '" aria-label="选择第' + e.index + '集"' + (!selectable.includes(e.id) ? ' disabled' : '') + (ui.filmPicked.includes(e.id) ? ' checked' : '') + '><button type="button" data-act="v2-episode" data-id="' + esc(e.id) + '"><span><strong>第' + e.index + '集</strong>' + tag(draft[e.id].result || '待审核') + '</span></button></div>').join('') + '</div></aside>' +
    '<div class="v26-video-area"><div class="v26-video-frame"><label class="v26-speed">倍速 <select data-v2-speed aria-label="播放倍速">' + [0.5,1,1.5,2,2.5].map(n => '<option value="' + n + '"' + (n === (ui.filmSpeed || 1) ? ' selected' : '') + '>' + n + 'x</option>').join('') + '</select></label>' + (episode ? '<video id="v2-player" data-episode-id="' + esc(episode.id) + '" controls preload="auto"' + (episode.url || ui.filmUrls?.[episode.id] ? ' src="' + esc(episode.url || ui.filmUrls[episode.id]) + '"' : '') + '></video>' : '<p>暂无正片文件</p>') + '</div><div class="v28-video-controls"><p class="v26-video-meta muted">' + (episode ? esc(episode.name) + ' · ' + episode.width + '×' + episode.height + ' · ' + v2Duration(episode.duration) : '') + '</p>' + v28EpisodeNavigation(r, episode) + '</div></div>' +
    '<aside class="v26-film-opinion"><h3 class="changed-field">单集审核备注 ' + mark(2) + '</h3><label><span class="v29-opinion-episode"><strong>第' + (episode?.index || '—') + '集</strong>' + tag(state.result || '待审核') + '</span><textarea rows="8" maxlength="200" aria-label="第' + (episode?.index || '—') + '集审核备注" aria-describedby="film-remark-error" data-v2-episode-opinion="' + esc(episode?.id || '') + '" placeholder="通过选填，驳回必填（最多200字）"' + (!editable ? ' readonly' : '') + '>' + esc(state.opinion || '') + '</textarea></label><p id="film-remark-error" class="error v27-remark-error" role="alert" hidden>必填驳回原因</p>' + (!editable ? '<p class="muted">此集仅可查看。</p>' : '') + '<p id="v2-film-error" class="error" role="alert"></p><div class="actions v29-review-actions">' + (editable ? mark(3) + act('通过', 'v2-episode-pass', episode.id, 'btn v26-pass') + act('驳回', 'v2-episode-reject', episode.id, 'btn v26-reject') : '') + '</div></aside></div></div>' +
    '<footer class="v26-film-footer"><span class="muted">' + (writable ? valid ? '本轮结果已填写，完成审核后生效。' : '请完成本轮分集审核，并填写驳回原因。' : '已保存的审核结果') + '</span><div class="actions">' + mark(3) + act('关闭', 'v2-review-back', '', 'btn') + (writable ? '<button type="button" class="btn primary" data-act="v2-finish-film" data-id="' + r.id + '"' + (!valid ? ' disabled' : '') + '>完成审核</button>' : '') + '</div></footer></section></div>';
};
function v26CanEdit(id) { const c = v26FilmContext(); return c && c.writable && c.ids.includes(id); }
clickActions['v28-episode-step'] = (_, direction) => {
  if (ui.view !== 'filmReviewV2' || ui.modal) return;
  const r = val(ui.selected), step = Number(direction);
  if (!r || ![-1, 1].includes(step)) return;
  const current = r.episodeFiles.findIndex(e => e.id === ui.episodeId), target = r.episodeFiles[current + step];
  if (current < 0 || !target) return;
  const player = root.querySelector('#v2-player'), playing = player && !player.paused;
  clickActions['v2-episode'](null, target.id);
  const next = root.querySelector('#v2-player');
  if (playing && next) next.play().catch(() => {});
  const same = root.querySelector('[data-act="v28-episode-step"][data-id="' + step + '"]');
  (same && !same.disabled ? same : root.querySelector('.v28-episode-nav:not(:disabled)'))?.focus({ preventScroll: true });
  const row = root.querySelector('.v26-episode-row.active'), list = root.querySelector('.v26-episode-scroll');
  if (row && list) {
    const a = row.getBoundingClientRect(), b = list.getBoundingClientRect();
    if (a.top < b.top) list.scrollTop -= b.top - a.top;
    else if (a.bottom > b.bottom) list.scrollTop += a.bottom - b.bottom;
  }
};
function v26FilmModal(type, draft) {
  ui.modal = { type, id: ui.selected, draft }; v24RenderFilm();
  root.querySelector('.dialog textarea, .dialog')?.focus({ preventScroll: true });
}
function v27FilmRemarkError(focus = false) {
  const field = root.querySelector('[data-v2-episode-opinion]'), message = root.querySelector('#film-remark-error');
  if (!field || !message) return;
  const id = field.dataset.v2EpisodeOpinion, draft = ui.filmDraft?.[id];
  const required = !field.readOnly && (ui.filmRejectAttempted?.has(id) || draft?.result === '驳回');
  const missing = required && !draft?.opinion.trim();
  message.hidden = !missing; field.setAttribute('aria-invalid', String(!!missing)); field.setAttribute('aria-required', String(!!required));
  if (missing && focus) field.focus({ preventScroll: true });
}
clickActions['v2-episode-pass'] = (_, id) => { if (!v26CanEdit(id)) return; ui.filmRejectAttempted?.delete(id); ui.filmDraft[id].result = '通过'; v24RenderFilm(); };
clickActions['v2-episode-reject'] = (_, id) => {
  if (!v26CanEdit(id)) return;
  (ui.filmRejectAttempted ||= new Set()).add(id);
  if (!ui.filmDraft[id].opinion.trim()) return v27FilmRemarkError(true);
  ui.filmDraft[id].result = '驳回'; v24RenderFilm();
};
clickActions['v26-batch-pass'] = () => { const c = v26FilmContext(); if (!c?.writable || !ui.filmPicked.length) return; ui.filmPicked.forEach(id => { ui.filmDraft[id].result = '通过'; ui.filmRejectAttempted?.delete(id); }); ui.filmPicked = []; v24RenderFilm(); };
clickActions['v26-batch-reject'] = () => { if (v26FilmContext()?.writable && ui.filmPicked.length) v26FilmModal('v26-film-reject', { ids: [...ui.filmPicked], opinion: '' }); };
const v26FinishFilm = clickActions['v2-finish-film'];
clickActions['v2-finish-film'] = () => { const c = v26FilmContext(); if (!c?.valid) return error('请完成本轮分集审核，并填写所有驳回原因。', '#v2-film-error'); v26FilmModal('v26-film-finish', {}); };
function v26LeaveFilm() { ui.modal = null; ui.filmDraft = null; ui.filmPicked = []; navigate(ui.liveFilmFrom || 'filmTasksV2'); }
clickActions['v2-review-back'] = () => {
  const c = v26FilmContext();
  const dirty = c?.writable && c.ids.some(id => { const e = c.r.episodeFiles.find(e => e.id === id), d = ui.filmDraft[id]; return e && (d.result !== (e.result || '') || d.opinion !== (e.opinion || '')); });
  if (dirty) v26FilmModal('v26-film-leave', {}); else v26LeaveFilm();
};
const v26PriorDialogBody = dialogBody;
dialogBody = modal => {
  if (modal.type === 'v26-film-reject') {
    const r = val(modal.id), indices = modal.draft.ids.map(id => r.episodeFiles.find(e => e.id === id)?.index).join('、');
    return ['批量驳回正片', '<p>请输入第 ' + indices + ' 集的驳回原因 ' + mark(1) + '</p>' + (modal.draft.ids.length > 1 ? '<p class="field-hint">本次原因应用到所选分集，完成审核前可逐集修改。</p>' : '') + '<textarea name="filmRejectReason" rows="3" required maxlength="200" placeholder="请输入具体驳回原因（最多200字）">' + esc(modal.draft.opinion) + '</textarea>', '确认驳回', 2];
  }
  if (modal.type === 'v26-film-finish') return ['完成正片审核', '<p>确认提交本轮审核结果？提交后返回正片审核任务列表。</p>', '确认完成', 0];
  if (modal.type === 'v26-film-leave') return ['关闭正片审核', '<p>本次未确认的审核结果和备注将不保存，确认关闭？</p>', '放弃并关闭', 0];
  return v26PriorDialogBody(modal);
};
const v26PriorSubmit = submitDialog;
submitDialog = form => {
  const m = ui.modal;
  if (m?.type === 'v26-film-reject') {
    if (!m.draft.ids.every(v26CanEdit)) return error('当前分集不可审核，请关闭后刷新');
    const opinion = String(new FormData(form).get('filmRejectReason') || '').trim();
    if (!opinion || opinion.length > 200) return error('请填写200字以内的驳回原因');
    m.draft.ids.forEach(id => Object.assign(ui.filmDraft[id], { result: '驳回', opinion }));
    ui.modal = null; ui.filmPicked = []; v24RenderFilm(); return;
  }
  if (m?.type === 'v26-film-finish') { const c = v26FilmContext(); if (!c?.valid) return error('审核状态已变化，请返回核对'); ui.modal = null; v26FinishFilm(c.r); return; }
  if (m?.type === 'v26-film-leave') return v26LeaveFilm();
  return v26PriorSubmit(form);
};
const v26PriorClose = closeModal;
closeModal = () => { if (ui.view === 'filmReviewV2' && ui.modal?.type.startsWith('v26-film-')) { ui.modal = null; v24RenderFilm(); } else v26PriorClose(); };
clickActions.close = closeModal;
root.addEventListener('change', event => {
  const f = event.target;
  if (f.matches('[data-film-all]')) { const c = v26FilmContext(); ui.filmPicked = f.checked ? [...c.selectable] : []; v24RenderFilm(); }
  if (f.matches('[data-film-pick]')) { const id = f.dataset.filmPick; if (!v26FilmContext()?.selectable.includes(id)) return; ui.filmPicked = f.checked ? [...new Set([...ui.filmPicked, id])] : ui.filmPicked.filter(x => x !== id); v24RenderFilm(); }
});
root.addEventListener('input', event => {
  if (ui.view !== 'filmReviewV2' || !event.target.matches('[data-v2-episode-opinion]')) return;
  v27FilmRemarkError();
  const button = root.querySelector('[data-act="v2-finish-film"]'); if (button) button.disabled = !v26FilmContext()?.valid;
});
const v26PriorRender = render;
render = function(options) {
  const wasOpen = !!root.querySelector('.v26-film-dialog'), scroll = root.querySelector('.v26-episode-scroll')?.scrollTop || 0;
  v26PriorRender(options);
  const film = root.querySelector('.v26-film-dialog');
  if (!film) {
    if (wasOpen && LIVE_QUEUES[ui.view]) root.querySelector('.screen').scrollTop = ui.filmListScroll || 0;
    return;
  }
  root.querySelector('.screen').scrollTop = ui.filmListScroll || 0;
  root.querySelectorAll('.sidebar nav button').forEach(button => button.classList.toggle('active', button.dataset.id === v30FilmSource()));
  root.querySelector('.product-inner').inert = true;
  film.inert = !!ui.modal;
  const all = film.querySelector('[data-film-all]'); if (all) all.indeterminate = ui.filmPicked.length > 0 && ui.filmPicked.length < v26FilmContext().selectable.length;
  film.querySelector('.v26-episode-scroll').scrollTop = scroll;
  const player = film.querySelector('video'); if (player) player.playbackRate = ui.filmSpeed || 1;
  v27FilmRemarkError();
  if (!wasOpen && !ui.modal) film.focus({ preventScroll: true });
};
document.addEventListener('keydown', event => {
  if (ui.view !== 'filmReviewV2') return;
  if (event.key === 'Escape') { event.preventDefault(); event.stopImmediatePropagation(); if (ui.modal) closeModal(); else clickActions['v2-review-back'](); }
}, true);
V2_NOTES.filmReviewV2.goal = '在正片审核人员任务列表上方居中弹窗审核，保留可见菜单和列表背景；分集处理后以完成审核确认本轮结果。';
V2_NOTES.filmReviewV2.sections[1][1].push(['播放倍速', '位于播放器右上角，支持0.5、1、1.5、2、2.5倍速。']);
V2_NOTES.filmReviewV2.sections[0][1] = V2_NOTES.filmReviewV2.sections[0][1].filter(([name]) => name !== '播放倍速');
V2_NOTES.filmReviewV2.sections[0][1].push(['分集列表', '仅展示第X集、审核状态和勾选框，删除标题下方的文件名等附加文案；非本轮分集仍仅可查看，不改变可审核范围。']);
V2_NOTES.filmReviewV2.sections[2][1] = [['通过、驳回', '单集操作位于右侧审核备注下方，同一区域展示当前集数与审核状态；移除底部重复的当前剧集操作栏。仅操作本轮分集；点击驳回直接校验右侧审核备注，不弹出填写原因窗口。为空或仅空格时，在输入框下方红字提示“必填驳回原因”，保持原结果；填写后再次点击驳回才更新草稿。通过备注选填，完成审核前可继续改判。'], ['全选与批量审核', '仅勾选本轮未通过分集；已通过、非本轮分集不可勾选。批量通过更新草稿；批量驳回填写统一原因，确认后可逐集调整。'], ['完成审核', '本轮分集均有结果且驳回原因齐全时可用；二次确认后保存结果、实际审核人及历史，返回本人任务列表。'], ['关闭', '存在改动时提示放弃；取消继续审核，确认后放弃本次草稿，已保存记录保持不变。']];
V2_NOTES.filmReviewV2.sections[2][1].unshift(['上一集／下一集', '播放器下方图标按左侧分集列表顺序切换；首集上一集置灰，末集下一集置灰，单集时两者置灰。同步左侧选中项、视频、右侧备注与结果，保留各集草稿、勾选及播放倍速；播放中切集继续播放，暂停时切集保持暂停。仅切换查看，不改变审核结果或本轮总量，非本轮分集继续只读。']);
for (const [type, page, goal] of [['v26-film-reject','批量驳回正片','填写所选分集的统一驳回原因。'],['v26-film-finish','完成正片审核','确认提交本轮审核结果。'],['v26-film-leave','关闭正片审核','确认是否放弃本次未提交的草稿。']]) {
  V2_NOTES[type] = v2Note(page, goal, []);
  V2_NOTES[type].caution = '11.18 更新。';
}
V2_NOTES['v26-film-reject'].sections = [['配置项', [['驳回原因', '批量驳回原因必填且最多200字，应用到本次所选分集，之后仍可在右侧逐集调整。']]], ['操作项', [['确认驳回', '更新所选分集的本轮草稿，最终以完成审核确认生效。'], ['取消', '不改变分集结果或已填写的外置备注，返回审核弹窗。']]]];
V2_NOTES['v26-film-finish'].goal = '确认后保存本轮结果、备注及实际审核人员，返回本人任务列表；取消继续审核，草稿保留。';
V2_NOTES['v26-film-leave'].goal = '确认后放弃本轮未提交结果与备注；取消继续审核，已保存的历史始终保留。';
render();
