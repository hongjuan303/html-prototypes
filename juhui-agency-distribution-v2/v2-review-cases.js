/* 11.18 local review scenarios; keep existing records and production snapshots intact. */
root.addEventListener('change', event => {
  if (!['v2-quality-result', 'v2-business-final'].includes(ui.modal?.type) || event.target.name !== 'result') return;
  ui.modal.draft.result = event.target.value;
  const textarea = event.target.closest('form').querySelector('[data-quality-opinion]');
  if (!textarea) return;
  textarea.required = event.target.value === '驳回';
  const label = textarea.closest('.field').querySelector('span'); label.querySelector('.required')?.remove();
  if (textarea.required) label.insertAdjacentHTML('afterbegin', '<b class="required">*</b>');
});
const v24PreviousPick = clickActions['live-pick'];
clickActions['live-pick'] = (_, id) => {
  if (ui.modal?.type !== 'v2-supplier') return v24PreviousPick(_, id);
  const [key, encoded] = id.split('|'), userId = decodeURIComponent(encoded);
  if (key !== 'businessIds' || !v13Businesses().some(u => u.id === userId)) return;
  const d = ui.modal.draft, form = root.querySelector('[data-form="dialog"]'), data = new FormData(form), picker = root.querySelector('[data-picker="businessIds"]');
  const keyword = picker?.querySelector('[data-live-search]')?.value || '';
  Object.assign(d, { name: data.get('supplierName') || '', account: data.get('account') || d.account, phone: data.get('phone') || '', passwordDraft: data.get('password') || '', qualityWhitelist: data.has('qualityWhitelist') });
  const ids = v13SupplierBusinessIds(d); d.businessIds = ids.includes(userId) ? ids.filter(x => x !== userId) : [...ids, userId];
  render();
  const next = root.querySelector('[data-picker="businessIds"]'); next.open = true; livePositionPicker(next);
  const search = next.querySelector('[data-live-search]'); search.value = keyword; search.dispatchEvent(new Event('input', { bubbles: true })); search.focus();
};
const V24_SAMPLE = {"url":"./assets/review-demo-720p.webm","width":1280,"height":720,"duration":29.961886};
const V24_FILM_CASES = [
  ['initial', '正片初审案例（演示）', '3集可播放样片，体验外置备注、通过后改判及完成审核。'],
  ['revision', '正片复审案例（演示）', '第2集已替换，仅复核本轮视频，其他已通过分集只读。'],
  ['upload', '正片上传案例（演示）', '供应商批量拖拽上传，核对集序与总集数、校验短边≥720，补齐后提交审核。']
];
function v24CreateFilmCase(kind) {
  const definition = V24_FILM_CASES.find(x => x[0] === kind); if (!definition) return null;
  let reviewer = liveReviewers('film')[0];
  if (!reviewer) { reviewer = { id: 'v24-film-main', name: '正片主审（演示）', roles: ['正片审核人员'], channels: [] }; v2Config.users.push(reviewer); }
  const supplier = v2Config.suppliers.find(s => s.id === 's1') || v2Config.suppliers[0];
  const id = Math.max(1100, ...records.map(r => Number(r.id) || 0)) + 1;
  const files = v2Episodes().map(e => ({ ...e, ...V24_SAMPLE, id: 'demo-' + id + '-' + e.index, name: '演示正片-第' + e.index + '集.webm' }));
  const r = newRecord(id, { name: definition[1], demoScenario: 'v24-film-' + kind, supplierId: supplier.id, supplier: supplier.name, episodes: 3,
    type: V2_TYPES[0], round: '首发', intent: ['国内渠道'], release: ['微信视频号'], intro: '供演示正片审核流程使用的合成样片。',
    quality: '通过', groups: ['通过', '通过', '通过'], qualityTasks: [], qualityHistory: [],
    qualityFinal: { result: '通过', opinion: '演示案例：质量评估已完成。', actor: '商务负责人（演示）', time: now() },
    filmStatus: kind === 'upload' ? '待提交' : '审核中', filmReviewer: kind === 'upload' ? '' : reviewer.id,
    materialStatus: '待提交', episodeFiles: kind === 'upload' ? [] : files, channelReturns: {}, channelMaterialReturns: {}, customMaterials: {},
    filmHistory: [], businessChannelConfirmed: kind !== 'upload', businessOwner: supplier.business, contact: v2User(supplier.business)?.name || '',
    authorization: [], orientation: '横屏' });
  if (kind !== 'upload') r.filmRound = { number: kind === 'revision' ? 2 : 1, ids: kind === 'revision' ? [files[1].id] : files.map(e => e.id), kind: kind === 'revision' ? '复审' : '初审' };
  if (kind === 'revision') {
    files.forEach(e => { e.result = e.index === 2 ? '' : '通过'; if (e.index === 2) { e.version = 2; e.name = '演示正片-第2集-修改版.webm'; } });
    r.filmHistory.push({ time: now(), actor: v2User(reviewer.id)?.name, round: { number: 1, kind: '初审', ids: files.map(e => e.id) }, duration: files.reduce((sum,e) => sum + e.duration, 0), results: Object.fromEntries(files.map(e => [e.id, { index: e.index, result: e.index === 2 ? '驳回' : '通过', opinion: e.index === 2 ? '演示意见：请补齐第2集片尾字幕。' : '' }])) });
    r.episodeHistory = [{ ...files[1], version: 1, result: '驳回', opinion: '演示意见：请补齐第2集片尾字幕。' }];
  }
  recordLog(r, '本地正片审核演示案例，不代表线上业务数据'); records.unshift(r); return r;
}
V24_FILM_CASES.forEach(([kind]) => { if (!records.some(r => r.demoScenario === 'v24-film-' + kind)) v24CreateFilmCase(kind); });
// Older upload examples were pre-confirmed without a business action. Preserve files,
// selected channels and actual confirmations; correct only this seeded demo flag.
records.filter(r => r.demoScenario === 'v24-film-upload' && r.businessChannelConfirmed === true && !r.businessConfirmedAt && !r.businessConfirmedBy && !r.authorization?.length).forEach(r => { r.businessChannelConfirmed = false; });
clickActions['v24-film-cases'] = () => openModal('v24-film-cases');
function v24OpenFilmCase(kind, fresh = false, manager = false) {
  let r = fresh ? v24CreateFilmCase(kind) : records.find(r => r.demoScenario === 'v24-film-' + kind);
  if (manager && r && !liveAssignable(r, 'film')) { r = v24CreateFilmCase(kind); fresh = true; }
  if (!r) return;
  if (fresh) { persist(); v2SaveConfig(); }
  if (kind === 'upload') { ui.supplierId = r.supplierId; navigate('supplierContent'); if (['待提交', '驳回'].includes(r.filmStatus)) clickActions['v2-film-upload'](r); else clickActions['v2-delivery'](r); return; }
  ui.livefilmActor = r.filmReviewer;
  const view = manager ? 'filmAuditV2' : 'filmTasksV2';
  ui.listState[view] = { filters: { name: r.name }, draft: { name: r.name } };
  (ui.liveQueueTabs ||= {})[view] = '全部'; navigate(view);
  if (!manager) clickActions['live-film-review'](r);
}
clickActions['v24-film-case-open'] = (_, kind) => v24OpenFilmCase(kind);
clickActions['v24-film-case-new'] = (_, kind) => v24OpenFilmCase(kind, true);
clickActions['v24-fill-film-sample'] = async r => {
  const m = ui.modal; if (m?.type !== 'v2-film-upload' || !r.demoScenario?.startsWith('v24-film-') || m.fillingSample) return;
  m.fillingSample = true;
  const button = root.querySelector('[data-act="v24-fill-film-sample"]'); if (button) { button.disabled = true; button.textContent = '正在读取样片…'; }
  try {
    const response = await fetch(V24_SAMPLE.url); if (!response.ok) throw Error('样片加载失败，请重试'); const blob = await response.blob();
    for (let index = 1; index <= r.episodes; index++) {
      const old = r.episodeFiles.find(e => e.index === index); if (old && old.result !== '驳回') continue;
      const file = new File([blob], '演示正片-第' + index + '集.webm', { type: blob.type });
      const metadata = await v2VideoMetadata(file), meta = await v2Remember(file, { ...metadata, index, version: (old?.version || 0) + 1, result: '', opinion: '' });
      if (ui.modal !== m) return;
      m.draft.files = m.draft.files.filter(e => e.index !== index); m.draft.files.push(meta);
    }
    if (ui.modal === m) { m.fillingSample = false; render(); announce('样片已补齐，请确认后提交审核'); }
  } catch (e) { if (ui.modal === m) { m.fillingSample = false; render(); error(e.message); } }
};
const v24PreviousDialog = dialogBody;
dialogBody = modal => {
  if (modal.type === 'v24-film-cases') return ['正片审核演示', '<p class="field-hint">使用本地合成样片；操作保存在演示记录中。已完成的案例可查看，也可新建一例重新体验。</p>' + V24_FILM_CASES.map(([kind, name, description]) => {
    const r = records.find(r => r.demoScenario === 'v24-film-' + kind);
    return '<section class="v24-case-row"><h3>' + name + ' ' + tag(r?.filmStatus || '待提交') + '</h3><p>' + description + '</p><div class="actions">' + act('进入案例', 'v24-film-case-open', kind, 'btn primary') + act('新建一例', 'v24-film-case-new', kind, 'btn') + '</div></section>';
  }).join(''), '', 0];
  const body = v24PreviousDialog(modal), r = val(modal.id);
  if (modal.type === 'v2-film-upload' && r?.demoScenario?.startsWith('v24-film-')) body[1] = '<div class="v24-sample-tools"><strong>演示素材</strong><span>可选择自己的视频，或使用合成样片。</span><div class="actions">' + act('使用合格样片补齐本轮', 'v24-fill-film-sample', r.id, 'btn') + '<a class="link" href="./assets/review-demo-720p.webm" download="720p合格演示样片.webm">下载合格样片</a><a class="link" href="./assets/demo-360p.webm" download="360p不合格演示样片.webm">下载不合格样片</a></div></div>' + body[1];
  return body;
};
// The actual processing entry points remain in the live menus; the demo chooser is supplemental.
const v24OriginalOverview = views.overviewV2;
views.overviewV2 = () => '<div class="v24-demo-entry"><span>正片审核：初审、复审及上传校验</span>' + act('正片审核演示', 'v24-film-cases', '', 'btn primary') + '</div>' + v24OriginalOverview();
changedFields.delete('本人渠道评估'); changedFields.delete('本轮类型');
['内容质量评估', ...GROUPS].forEach(name => changedFields.add(name));
V2_NOTES.qualityV2 = v2Note('内容评估 · 内容质量评估', '按实际意向分配质量评估，展示评估人员及完整意见。', [
  ['筛选项', [['质量评估状态', '全部／待审核／通过／驳回；状态取商务最终结果，商务未提交或撤回驳回后为待审核。']]],
  ['列表项', [
    ['内容类型', '回显供应商填写的内容类型。'],
    ['发行轮次', '回显供应商填写的发行轮次。'],
    ['剧集简介', '回显供应商提交的简介，超长省略、悬停查看完整内容，未填写显示“—”。'],
    ['YouTube是否首发', '回显供应商填写的YouTube是否首发。'],
    ['国内渠道', '读取国内渠道质量任务，展示评估状态及人员。'],
    ['仅微信视频号', '读取本轮仅微信视频号质量任务，展示评估状态及人员。'],
    ['YouTube', '读取本轮海外YouTube质量任务，展示评估状态及人员。'],
    ['TT端原生', '读取本轮海外TikTok端原生质量任务，展示评估状态及人员。'],
    ['TT小程序', '读取本轮海外TT小程序质量任务，展示评估状态及人员。'],
    ['渠道结果展示', '五列顺序固定，同渠道多人逐项展示。无需审核显示“—”；已有任务待处理显示“待审核”；已审核显示审核状态。'],
    ['质量评估状态', '取本轮商务审核结果：通过／驳回；未提交为待审核。']
  ]],
  ['操作项', [
    ['审核', '按本人负责渠道和本轮分配任务打开对应渠道弹窗，通过备注选填、驳回必填。如果一个用户有多个渠道需要审核，则分别处理。'],
    ['最终反馈', '仅在本Tab提供商务质量审核入口；国内渠道产出意见后，即使其他渠道待审核，商务负责人也可填写最终反馈；填写后其他渠道待审核的仍保留审核入口。质量评估通过则进入内容评估，驳回则流程终止。'],
    ['撤回', '商务负责人未填写最终反馈时，渠道通过／驳回均可撤回；商务填写后，通过不可撤回，驳回可撤回。'],
    ['审核记录', '查看各渠道及商务的审核结果和审核备注；通过未填写备注显示“未填写”。']
  ]]
]);
V2_NOTES['v2-quality-result'] = v2Note('渠道质量评估', '处理本轮分配给当前人员的对应渠道评估。', [['配置项', [['评估结果', '选择通过或驳回。'], ['评估意见', '通过选填，驳回必填；修改结果时同步必填标识，保留已输入文字。']]], ['操作项', [['提交意见', '再次校验渠道职责和本人待处理任务，保存结果、意见、人员与时间。'], ['取消', '不提交本次意见。']]]]);
V2_NOTES['v2-business-final'] = v2Note('商务最终反馈', '在内容质量评估Tab统一处理商务质量审核。', [['配置项', [['最终结果', '通过／驳回；前置条件沿用国内优先、纯海外全部完成。'], ['反馈意见', '通过选填，驳回必填；下方查看本轮实际参与渠道意见。']]], ['操作项', [['提交最终反馈', '保存结果、实际商务人员及时间；通过后进入内容评估，驳回则流程终止。其他渠道待审核入口继续保留，后续渠道意见不覆盖商务最终结果。状态同步商务列表及供应商。'], ['取消', '不保存本次反馈。']]]]);
V2_NOTES.business = v2Note('商务负责人', '保留线上商务跟进列表，补充评估状态和授权书状态。', [['筛选项', [['授权书状态', '下拉单选，枚举未上传、已上传，默认全部；按列表授权书状态筛选。'], ['内容质量评估', '下拉单选，枚举待审核、通过、驳回，默认全部；按商务审核结果筛选，可与其他条件组合，筛选后分页。']]], ['列表项', [['内容质量评估', '只读显示商务质量最终结果；审核与允许的驳回撤回统一在内容质量评估Tab。'], ...GROUPS.map(name => [name, '显示本轮该组内容评估状态。']), ['授权书状态', '至少一份已保存授权书为已上传，没有为未上传；未上传以红色标签突出，上传不代表审核通过。未取得真实资料时显示未读取。']]], ['操作项', [['授权书上传', '回显供应商提交的发行渠道，商务可修改；至少选择一个渠道并上传授权书后保存，以商务保存的渠道为准，渠道与附件同时生效，与正片审核并行。'], ['查看详情、审核记录', '进入合集详情或只读查看评估意见及历史。'], ['修改对接商务', '仅商务负责人可操作；不会因供应商多商务通知而新增多人审批。']]]]);
V2_NOTES.suppliersV2.sections[1][1].push(['负责商务', '展示供应商关联的全部商务人员，一个供应商可能存在多个商务。']);
V2_NOTES['v2-supplier'].sections[0][1] = V2_NOTES['v2-supplier'].sections[0][1].map(([name, desc]) => [name, name === '负责商务' ? '多选已有商务人员或商务负责人，至少选一人；支持搜索、移除及完整回显，保留原单人关联。' : desc]);
V2_NOTES['v2-supplier'].sections[1][1][0][1] = '保存完整商务名单和其他资料，取消不保存；供应商关联变更不自动改写已有合集的对接商务。';
for (const key of ['filmAuditV2', 'filmTasksV2']) {
  V2_NOTES[key].sections[0][1][0] = ['本次审核总时长', '初审统计全集实际时长；复审只统计本轮替换视频，时长下方注明全集／本次替换集数，不另设本轮类型列。'];
  V2_NOTES[key].caution = '可通过列表工具栏【正片审核演示】进入初审、复审和供应商上传案例。样片为本地合成视频，已有演示结果保留，新建一例不会覆盖原记录。';
}
V2_NOTES.filmReviewV2 = v2Note('正片审核', '分集查看视频与备注，以完成审核确认本轮结果。', [['列表项', [['本次需审核总集数', '本轮审核范围内的分集总数；初审为全集，复审只计本次替换且需要重审的分集。审核过程中不因通过或驳回而增减。'], ['本次需审核总时长', '上述本轮分集的实际视频时长之和；审核过程中保持不变，不统计已审核时长或播放时长。非本轮分集只读查看，不计入本轮合计。'], ['播放倍速', '0.5、1、1.5、2、2.5倍速，实际控制播放器。']]], ['配置项', [['单集审核备注', '常驻播放器右侧，观看时可直接填写；通过选填，驳回必填，切换分集保留本轮草稿。']]], ['操作项', [['单集通过、单集驳回', '完成审核前均可反复改判；仅当前轮次待审分集可操作。'], ['完成审核', '校验本轮全部分集已有结果、驳回均有备注；确认后写入实际审核人和历史，返回本人任务列表。'], ['返回列表', '未确认结果不写入记录；返回前确认是否放弃草稿。']]]]);
V2_NOTES['v24-film-cases'] = v2Note('正片审核演示', '使用合成样片查看V1.3正片审核交互。', [], '案例只写本地；可新建一例继续体验，现有记录和真实快照不重置。');
for (const key of ['qualityV2', 'eval', 'business', 'suppliersV2', 'v2-supplier', 'filmAuditV2', 'filmTasksV2', 'filmReviewV2', 'v2-quality-result', 'v2-business-final']) V2_NOTES[key].caution = '11.18 更新。' + (V2_NOTES[key].caution || '');
V2_NOTES.business.caution = '11.19 更新。';
V2_NOTES.qualityV2.caution = '11.19 更新。';
V2_NOTES.eval.caution = '11.19 更新。';
const v24CaseParam = new URLSearchParams(location.search).get('filmCase');
if (V24_FILM_CASES.some(([kind]) => kind === v24CaseParam)) v24OpenFilmCase(v24CaseParam);
else render();
