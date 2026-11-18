/* Restore existing list/page controls without touching production services. */
const liveReviewerName = (r, kind) => v2User(r[kind + 'Reviewer'])?.name || r[kind + 'ReviewerName'] || '';
const liveSupplierNames = () => [...new Set([...v2Config.suppliers.map(s => s.name), ...records.map(r => r.supplier)].filter(Boolean))];
const liveMatches = (f, value) => !f || f === '全部' || (Array.isArray(f) ? !f.length || f.includes(value) : f === value);
filtered = (items, status) => items.filter(r => {
  const f = ui.filters, date = (r.submitted || '').slice(0, 10);
  return (!f.name || r.name.includes(f.name)) && liveMatches(f.status, status?.(r)) && liveMatches(f.supplier, r.supplier) &&
    liveMatches(f.contact, v2User(r.businessOwner || v2Supplier(r).business)?.name || r.contact) && liveMatches(f.type, r.type) && liveMatches(f.round, r.round) &&
    liveMatches(f.material, r.materialStatus) && liveMatches(f.film, r.filmStatus) && liveMatches(f.materialReviewer, liveReviewerName(r, 'material')) && liveMatches(f.filmReviewer, liveReviewerName(r, 'film')) &&
    liveMatches(f.channelLead, r.channelLead || '') && (!f.release || f.release === '全部' || channelsFor(r).includes(f.release) || r.release.includes(f.release)) &&
    (!f.start || date >= f.start) && (!f.end || date <= f.end);
});
const liveOldFilters = filters;
filters = fields => liveOldFilters(fields.map(([name, label, values]) => [name, label,
  name === 'supplier' ? liveSupplierNames() : ['materialReviewer', 'filmReviewer'].includes(name) ? [...new Set(records.map(r => liveReviewerName(r, name === 'filmReviewer' ? 'film' : 'material')).filter(Boolean))] :
  name === 'channelLead' ? [...new Set(records.map(r => r.channelLead).filter(Boolean))] : values]));
const liveOldTable = table;
table = (head, rows, settings = {}) => liveOldTable(head, rows, settings).replace('<option value="20"', '<option value="10"' + (ui.tablePages[settings.key || ui.view]?.size === 10 ? ' selected' : '') + '>10条/页</option><option value="20"');

views.suppliersV2 = () => {
  const list = v2Config.suppliers.filter(s => !ui.filters.supplierName || s.name.includes(ui.filters.supplierName));
  return heading('供应商管理') + filters([['supplierName', '供应商名称']]) + listing('供应商列表', ['序号', '供应商名称', '登录账号', '创建时间', '账号状态', '负责商务', '绑定手机号', '供应商白名单', '操作 ' + mark(2)], list.map((s, i) => line(String(i + 1), esc(s.name), esc(s.account), timestamp(s.created || ''), tag(s.frozen ? '冻结' : '正常'), esc(v2User(s.business)?.name || '—'), esc(s.phone || '—'), tag(s.qualityWhitelist ? '已启用' : '未启用'), buttons(act('编辑', 'v2-supplier-edit', s.id), act(s.frozen ? '恢复' : '冻结', 'live-supplier-freeze', s.id, s.frozen ? 'link' : 'link danger'), act('重置密码', 'live-supplier-password', s.id)))), mark(3) + act('新建供应商', 'v13-supplier-new', '', 'btn primary') + act('演示账号登录', 'v2-login', '', 'btn'), { note: 1, className: 'live-supplier-table' }).replace('暂无匹配的合集', '暂无供应商数据');
};
clickActions['live-supplier-freeze'] = (_, id) => { const s = v2Config.suppliers.find(x => x.id === id); if (s) openModal('live-supplier-freeze', null, { frozen: !s.frozen }, { supplierId: id }); };
clickActions['live-supplier-password'] = (_, id) => openModal('live-supplier-password', null, {}, { supplierId: id });

const liveQualityView = views.qualityV2;
views.qualityV2 = () => {
  const dom = document.createElement('div'); dom.innerHTML = liveQualityView();
  const filter = dom.querySelector('.filter-panel'); filter.outerHTML = filters([supplierFilter, collectionFilter, ['status', '质量评估状态', ['待审核', '待商务反馈', '通过', '驳回']]]);
  const table = dom.querySelector('table'); table.classList.add('live-quality-table');
  const heads = table.querySelectorAll('th');
  heads[4].insertAdjacentHTML('beforebegin', '<th>集数</th><th>一卡链接</th>');
  heads[6].insertAdjacentHTML('beforebegin', '<th>' + fieldName('YouTube是否首发') + '</th>');
  heads[heads.length - 1].insertAdjacentHTML('beforebegin', '<th>审核意见</th>');
  table.querySelectorAll('tbody tr').forEach(tr => {
    const r = val(tr.querySelector('[data-act="history"]')?.dataset.id); if (!r) { tr.querySelector('.empty')?.setAttribute('colspan', table.querySelectorAll('th').length); return; }
    const cells = [...tr.children]; cells[4].insertAdjacentHTML('beforebegin', td(esc(r.episodes)) + td(link(r)));
    cells[6].insertAdjacentHTML('beforebegin', td(esc(r.youtubeFirst || '—')));
    cells[cells.length - 1].insertAdjacentHTML('beforebegin', td('<span title="' + esc(r.qualityFinal?.opinion || r.qualityTasks?.filter(t => t.opinion).map(t => t.channel + '：' + t.opinion).join('；') || '') + '">' + esc(r.qualityFinal?.opinion || r.qualityTasks?.filter(t => t.opinion).map(t => t.channel + '：' + t.opinion).join('；') || '—') + '</span>'));
  });
  return dom.innerHTML;
};
views.supplierEval = () => {
  const status = r => v2QualityStatus(r) === '驳回' || combined(r) === '驳回' ? '拒绝' : r.quality === '通过' && combined(r) === '通过' ? '通过' : '审核中';
  const list = filtered(records.filter(r => v2Supplier(r).id === ui.supplierId && !r.onlineSnapshot), status);
  return heading('内容评估') + filters([collectionFilter, ['status', '状态', ['审核中', '通过', '拒绝']], ['start', '提交时间', 'date'], ['end', '结束日期', 'date']]) + listing('评估记录', ['ID', '合集名称', '集数', '一卡链接', '提交时间', '内容类型', '意向渠道', '内容质量评估状态', '内容评估状态', '审核意见', '操作 ' + mark(2)], list.map(r => line(esc(r.id), esc(r.name) + (v13ContentResubmitted(r) ? '<span class="tag amber">重提</span>' : ''), esc(r.episodes), link(r), timestamp(r.submitted), esc(r.type), intentChannels(r), tag(v2QualityStatus(r)), tag(combined(r)), esc(r.qualityFinal?.opinion || r.reviews?.find(x => x.opinion)?.opinion || '—'), buttons(act('查看评估意见', 'v2-opinions', r.id), status(r) === '拒绝' ? act('修改后重提', 'submit', r.id) : ''))), mark(1) + act('＋ 提交剧集信息', 'submit', '', 'btn primary'), { className: 'live-wide-table' });
};
const liveSupplierContent = views.supplierContent;
views.supplierContent = () => {
  const dom = document.createElement('div'); dom.innerHTML = liveSupplierContent();
  dom.querySelector('.filter-panel').outerHTML = filters([collectionFilter, ['release', '渠道', v2Release()], ['type', '剧集类型', V2_TYPES], ['round', '发行轮次', ['首发', '二轮']], ['material', '物料状态', ['待提交', '待分配', '审核中', '通过', '拒绝']], ['film', '正片状态', ['待提交', '待分配', '审核中', '通过', '驳回']]]);
  const table = dom.querySelector('table'); table.classList.add('live-supplier-content-table'); table.querySelectorAll('th')[3].insertAdjacentHTML('beforebegin', '<th>创建时间</th>');
  table.querySelectorAll('tbody tr').forEach(tr => {
    const r = val(tr.querySelector('[data-act="history"]')?.dataset.id); if (!r) { tr.querySelector('.empty')?.setAttribute('colspan', table.querySelectorAll('th').length); return; }
    tr.children[3].insertAdjacentHTML('beforebegin', td(timestamp(r.created || r.submitted)));
    tr.lastElementChild.querySelector('.actions').insertAdjacentHTML('afterbegin', act('查看详情', 'live-supplier-detail', r.id));
  });
  return dom.innerHTML;
};
clickActions['live-supplier-detail'] = r => { openDetail(r, 'supplierContent'); ui.side = 'supplier'; render(); };

const LIVE_DATA_KEY = 'juhui-agency-distribution-v2-play-data';
let livePlayData; try { livePlayData = JSON.parse(localStorage.getItem(LIVE_DATA_KEY)) || []; } catch { livePlayData = []; }
function liveDataView() {
  const supplier = ui.side === 'supplier', current = v2Config.suppliers.find(s => s.id === ui.supplierId);
  const list = livePlayData.filter(r => (!supplier || r.supplierId === current?.id) && (!ui.filters.compilationId || String(r.compilationId) === ui.filters.compilationId) && (!ui.filters.name || r.compilationName.includes(ui.filters.name)) && liveMatches(ui.filters.release, r.channelName) && liveMatches(ui.filters.supplier, r.supplierName));
  return heading('短剧数据') + filters([['compilationId', '合集ID'], collectionFilter, ['release', '渠道', V13_ASSOCIATED_CHANNELS], ...(!supplier ? [supplierFilter] : [])]) + listing('播放数据列表', ['合集ID', '合集名称', '渠道', ...(!supplier ? ['供应商'] : []), '累计播放量'], list.map(r => line(esc(r.compilationId), esc(r.compilationName), esc(r.channelName), ...(!supplier ? [esc(r.supplierName)] : []), Number(r.accPlayCnt).toLocaleString('zh-CN'))), !supplier ? mark(3) + act('导入数据', 'live-data-import', '', 'btn primary') : '', { note: 2 }).replace('暂无匹配的合集', '暂无播放数据');
}
views.dataV2 = liveDataView; views.supplierDataV2 = liveDataView;
clickActions['live-data-import'] = () => openModal('live-data-import', null, { file: null, rows: [] });
function liveDownloadText(name, text) { const url = URL.createObjectURL(new Blob(['\ufeff' + text], { type: 'text/csv;charset=utf-8' })), a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
clickActions['live-data-template'] = () => liveDownloadText('短剧数据导入模板.csv', '内容渠道ID,合集名称,渠道名称,累计播放量\r\n');
function liveCsv(text) {
  const rows = []; let row = [], cell = '', quoted = false;
  text = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < text.length; i++) { const c = text[i]; if (c === '"') { if (quoted && text[i + 1] === '"') { cell += '"'; i++; } else quoted = !quoted; } else if (c === ',' && !quoted) { row.push(cell); cell = ''; } else if ((c === '\n' || c === '\r') && !quoted) { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); if (row.some(x => x.trim())) rows.push(row); row = []; cell = ''; } else cell += c; }
  if (quoted) throw Error('CSV引号未闭合'); row.push(cell); if (row.some(x => x.trim())) rows.push(row); return rows;
}
async function liveReadCsv(file) {
  if (!file || !/\.csv$/i.test(file.name)) return error('请选择 CSV 文件');
  const m = ui.modal; if (m?.type !== 'live-data-import') return;
  try {
    const rows = liveCsv(await file.text()), expected = ['内容渠道ID', '合集名称', '渠道名称', '累计播放量'];
    if (JSON.stringify(rows.shift()?.map(x => x.trim())) !== JSON.stringify(expected)) throw Error('CSV表头应为：' + expected.join('、'));
    if (!rows.length) throw Error('CSV没有数据行');
    const entries = rows.map((r, i) => {
      if (r.length !== 4 || r.some(x => !x.trim()) || !/^\d+$/.test(r[3].trim())) throw Error('第' + (i + 2) + '行数据不完整或播放量不是非负整数');
      const collection = records.find(c => c.name === r[1].trim() && channelsFor(c).some(ch => liveChannelName(ch) === liveChannelName(r[2].trim())) && channelsFor(c).some(ch => liveChannelName(ch) === liveChannelName(r[2].trim()) && String(c.channelContentIds?.[ch] || '') === r[0].trim()));
      if (!collection) throw Error('第' + (i + 2) + '行内容渠道ID、剧名、渠道与本地合集不匹配，请先核对合集渠道ID');
      return { contentId: r[0].trim(), compilationId: collection.id, compilationName: collection.name, channelName: r[2].trim(), supplierName: collection.supplier, supplierId: v2Supplier(collection).id, accPlayCnt: Number(r[3]) };
    });
    if (ui.modal !== m) return; m.draft = { fileName: file.name, rows: entries }; render();
  } catch (e) { if (ui.modal === m) { m.draft = { rows: [] }; error(e.message); } }
}
root.addEventListener('change', e => { if (e.target.hasAttribute('data-live-csv')) { e.stopImmediatePropagation(); liveReadCsv(e.target.files[0]); } }, true);
root.addEventListener('dragover', e => { if (e.target.closest('.live-upload-drop')) e.preventDefault(); });
root.addEventListener('drop', e => { if (e.target.closest('.live-upload-drop')) { e.preventDefault(); liveReadCsv(e.dataTransfer.files[0]); } });
views.supplierProfileV2 = () => {
  const s = v2Config.suppliers.find(s => s.id === ui.supplierId);
  return heading('个人中心') + '<section class="panel"><div class="panel-header"><h2>账号信息 ' + mark(1) + '</h2></div><form data-live-profile class="live-profile-form">' + formField('供应商名称', input('supplierName', s?.name, '', 'text', 'disabled')) + formField('登录账号', input('account', s?.account, '', 'text', 'disabled')) + formField('原密码', input('oldPwd', '', '请输入原密码', 'password', 'required'), true) + formField('新密码', input('newPwd', '', '请输入新密码', 'password', 'required'), true) + formField('确认密码', input('confirmPwd', '', '请再次输入新密码', 'password', 'required'), true) + '<p class="field-hint">密码需要字母、数字、符号至少两种，长度8–20位</p><p class="error" id="live-profile-error"></p><div class="actions">' + mark(2) + '<button class="btn primary" type="submit">保存</button></div></form></section>';
};
root.addEventListener('submit', e => {
  if (!e.target.hasAttribute('data-live-profile')) return;
  e.preventDefault(); const data = new FormData(e.target), s = v2Config.suppliers.find(s => s.id === ui.supplierId), pwd = String(data.get('newPwd') || '');
  const fail = text => error(text, '#live-profile-error');
  if (s.password !== data.get('oldPwd')) return fail('原密码不正确');
  if (pwd.length < 8 || pwd.length > 20 || [/[a-zA-Z]/, /\d/, /[^a-zA-Z0-9]/].filter(re => re.test(pwd)).length < 2) return fail('密码需包含字母、数字、符号至少两种，长度8–20位');
  if (pwd !== data.get('confirmPwd')) return fail('两次输入的新密码不一致');
  s.password = pwd; v2SaveConfig(); e.target.reset(); announce('密码修改成功');
});
const livePagesDialog = dialogBody;
dialogBody = m => {
  const s = v2Config.suppliers.find(s => s.id === m.supplierId);
  if (m.type === 'live-supplier-freeze') return ['提示', '<p>确认' + (m.draft.frozen ? '冻结' : '恢复') + '供应商“' + esc(s?.name) + '”的账号？</p>', '确认'];
  if (m.type === 'live-supplier-password') return ['重置供应商密码', '<p>正在重置：' + esc(s?.name) + '</p>' + mark(1) + formField('新密码', input('newPassword', '', '请输入新密码', 'password', 'required'), true), '确认重置', 2];
  if (m.type === 'live-data-import') return ['导入短剧数据', mark(1) + '<p class="notice">仅支持 CSV 文件，字段：内容渠道ID、合集名称、渠道名称、累计播放量</p><label class="live-upload-drop">⇧<span>将 CSV 文件拖到此处，或<span class="link">点击选择</span></span><input type="file" accept=".csv" data-live-csv></label>' + (m.draft.fileName ? '<p>' + esc(m.draft.fileName) + ' · ' + m.draft.rows.length + '条</p>' : '') + act('下载导入模板', 'live-data-template'), '确认导入', 2];
  return livePagesDialog(m);
};
const livePagesSubmit = submitDialog;
submitDialog = form => {
  const m = ui.modal, data = new FormData(form), s = v2Config.suppliers.find(s => s.id === m.supplierId);
  if (m.type === 'live-supplier-freeze') { s.frozen = m.draft.frozen; v2SaveConfig(); closeModal(); announce(s.frozen ? '已冻结' : '已恢复'); return; }
  if (m.type === 'live-supplier-password') { const password = String(data.get('newPassword') || '').trim(); if (!password) return error('请输入新密码'); s.password = password; v2SaveConfig(); closeModal(); announce('密码已重置'); return; }
  if (m.type === 'live-data-import') {
    if (!m.draft.rows?.length) return error('请选择要导入的 CSV 文件');
    for (const row of m.draft.rows) { const i = livePlayData.findIndex(r => r.contentId === row.contentId && r.channelName === row.channelName); if (i < 0) livePlayData.push(row); else livePlayData[i] = row; }
    localStorage.setItem(LIVE_DATA_KEY, JSON.stringify(livePlayData)); const n = m.draft.rows.length; closeModal(); announce('导入成功，共 ' + n + ' 条'); return;
  }
  if (m.type === 'v2-login') { const identity = String(data.get('identity') || data.get('account') || '').trim(), target = v2Config.suppliers.find(s => [s.account, s.phone].includes(identity)); if (target?.frozen) return error('该供应商账号已冻结'); }
  const before = m.type === 'v2-supplier' && m.isNew ? new Set(v2Config.suppliers.map(s => s.id)) : null;
  const result = livePagesSubmit(form);
  if (before && !ui.modal) { v2Config.suppliers.filter(s => !before.has(s.id)).forEach(s => s.created = now()); v2SaveConfig(); render(); }
  return result;
};
for (const [id, title] of [['supplierDataV2', '短剧数据'], ['supplierProfileV2', '个人中心']]) { if (!NAV.supplier.some(x => x[0] === id)) NAV.supplier.push([id, title, id === 'supplierDataV2' ? 'grid' : 'user']); if (!entryViews.includes(id)) entryViews.push(id); }
V2_NOTES.suppliersV2.sections[1][1].push(['冻结／恢复、重置密码', '沿用线上独立操作及确认弹窗；冻结后本地账号登录不可用，恢复不修改资料；重置不改登录账号。']);
for (const key of ['dataV2', 'supplierDataV2']) V2_NOTES[key] = v2Note('短剧数据', '查询合集各渠道累计播放量。', [
  ['筛选项', [['合集ID、合集名称、渠道', '按输入条件搜索，重置后显示当前身份全部可见记录。平台另可按供应商筛选。']]],
  ['列表项', [['合集与渠道', '展示对应合集、渠道及累计播放量；供应商仅可查看本方合集，平台同时展示供应商。']]],
  ...(key === 'dataV2' ? [['操作项', [['导入数据', '上传CSV并确认后更新本地播放量，失败保留原数据；可下载空白字段模板。']]]] : [])
], '正式报表未读取，列表不伪造线上播放数据；导入仅写本地，内容渠道ID须匹配相应合集渠道。');
V2_NOTES.supplierProfileV2 = v2Note('个人中心', '查看本账号信息并修改登录密码。', [
  ['配置项', [['供应商名称、登录账号', '只读，账号不支持编辑。'], ['原密码、新密码、确认密码', '三项必填；校验原密码及两次新密码一致，新密码8–20位且包含字母、数字、符号至少两种。']]],
  ['操作项', [['保存', '校验通过后更新本地演示账号密码并清空密码输入，错误时保留输入及提示。']]]
]);
V2_NOTES['live-data-import'] = v2Note('导入短剧数据', '上传CSV文件并确认导入。', [
  ['配置项', [['CSV文件', '拖入或点击选择，显示文件名称和有效行数；格式或数据错误显示原因，不能提交。'], ['模板', '下载内容渠道ID、合集名称、渠道名称、累计播放量四个表头的CSV。']]],
  ['操作项', [['确认导入、取消', '全部校验通过后更新本地数据；取消不导入。']]]
], '本地导入不连接正式数据服务，校验合集与相应渠道的内容ID匹配。');
V2_NOTES['live-supplier-freeze'] = v2Note('供应商账号状态确认', '确认后更新本地账号状态；取消保留原状态。');
V2_NOTES['live-supplier-password'] = v2Note('重置供应商密码', '管理员为供应商重置本地演示密码。', [
  ['配置项', [['新密码', '必填；当前供应商名称用于核对操作对象，登录账号保持。']]],
  ['操作项', [['确认重置、取消', '确认后新密码生效；取消不修改原密码。']]]
]);
const livePageNotesRender = render;
render = function(options) {
  livePageNotesRender(options);
  if (!ui.modal && ['dataV2','supplierDataV2'].includes(ui.view)) root.querySelector('.filter-panel .panel-header h2')?.insertAdjacentHTML('beforeend', ' ' + mark(1));
};
