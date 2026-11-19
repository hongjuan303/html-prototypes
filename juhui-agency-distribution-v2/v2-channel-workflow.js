/* Channel corrections are separate versions; platform-approved deliveries remain intact. */
const V59_MATERIAL_KEYS = ['materials', 'materialExtras', 'customMaterials', 'synopsis', 'filmLink', 'partner', 'contact', 'orientation', 'contract', 'managedManual'];
const v59MaterialSnapshot = r => Object.fromEntries(V59_MATERIAL_KEYS.filter(key => r[key] !== undefined).map(key => [key, structuredClone(r[key])]));
const v59ChannelKey = value => { const [id, channel] = String(value).split('|'); return [val(Number(id)), decodeURIComponent(channel || '')]; };
const v59SupplierOwns = r => r && ui.side === 'supplier' && v2Supplier(r).id === ui.supplierId;
const v59CanOperate = (r, channel) => r && ui.side === 'platform' && (ui.view === 'detail' && ui.detailFrom === 'operator' || ui.view === 'operator') && ui.channel === channel && Boolean(r.assignment?.[channel]) && channelsFor(r).includes(channel);
const v59ReturnToken = item => item ? item.time + '|' + item.opinion : '';
function v59ChannelEpisodes(r, channel) {
  if (r.channelEpisodes?.[channel]?.files) return r.channelEpisodes[channel].files;
  return (r.episodeFiles || []).map(ep => {
    const latest = [...(r.channelReturns?.[channel] || [])].reverse().find(item => item.episodeId === ep.id && item.replacement);
    return latest ? { ...latest.replacement, index: ep.index } : ep;
  });
}
function v59ChannelMaterialRecord(r, channel) {
  const snapshot = r.channelMaterials?.[channel]?.snapshot;
  if (!snapshot) return r.channelEpisodes?.[channel]?.files ? { ...r, episodes: r.channelEpisodes[channel].files.length } : r;
  const copy = { ...r, ...structuredClone(snapshot), release: [channel], channelReworkMode: true, reworkChannels: [channel] };
  if (r.channelEpisodes?.[channel]?.files) copy.episodes = r.channelEpisodes[channel].files.length;
  delete copy.onlineSnapshot;
  return copy;
}
function v59OpenChannelMaterial(record, value) {
  let [r, channel] = String(value || '').includes('|') ? v59ChannelKey(value) : [record, ''];
  if (!v59SupplierOwns(r)) return announce('无本供应商修改权限');
  if (!v13MaterialAllowed(r)) return announce(v13MaterialWait(r));
  if (!channel) {
    const pending = Object.keys(r.channelMaterialReturns || {}).filter(key => r.channelMaterialReturns[key].status === '待修改');
    if (pending.length !== 1) return clickActions['v2-channel-feedback'](r);
    channel = pending[0];
  }
  const item = r.channelMaterialReturns?.[channel];
  if (!channelsFor(r).includes(channel) || item?.status !== '待修改') return announce('当前渠道暂无待修改物料');
  const version = r.channelMaterials?.[channel];
  ui.edit = { ...structuredClone(r), ...structuredClone(version?.draft || version?.snapshot || {}), channelReworkMode: true, reworkChannels: [channel], release: [channel], channelReturnToken: v59ReturnToken(item) };
  ui.modal = null;
  navigate('materialsV2');
}
clickActions['v2-material-channel'] = v59OpenChannelMaterial;
function v59SaveChannelMaterial(draft, submit) {
  const r = val(draft.id), channel = draft.reworkChannels?.[0], item = r?.channelMaterialReturns?.[channel];
  if (!v59SupplierOwns(r) || draft.reworkChannels.length !== 1 || !channelsFor(r).includes(channel)) return error('无本渠道物料修改权限。', '#v2-material-error');
  if (item?.status !== '待修改' || draft.channelReturnToken !== v59ReturnToken(item)) return error('本渠道修改任务已变更，请返回并重新打开。', '#v2-material-error');
  const version = (r.channelMaterials ||= {})[channel] ||= {};
  if (submit) {
    if (version.snapshot) (version.history ||= []).push({ snapshot: version.snapshot, time: version.submittedAt });
    version.snapshot = v59MaterialSnapshot(draft);
    version.submittedAt = now();
    delete version.draft;
    item.status = '待复核'; item.resubmittedAt = version.submittedAt;
  } else { version.draft = v59MaterialSnapshot(draft); version.draftSavedAt = now(); }
  persist();
  if (submit) { ui.edit = null; navigate('supplierContent'); } else render();
  announce(submit ? '物料已提交' + liveChannelName(channel) + '复核' : '本渠道物料草稿已保存');
}
function v59ChannelFeedbackDialog(modal) {
  const r = val(modal.id), d = modal.draft;
  if (!modal.channel) {
    const rows = [];
    for (const channel of channelsFor(r)) {
      const key = r.id + '|' + encodeURIComponent(channel), material = r.channelMaterialReturns?.[channel], films = r.channelReturns?.[channel] || [];
      if (material) rows.push(line(esc(liveChannelName(channel)), '物料', tag(material.status), esc(material.opinion), material.status === '待修改' ? act('修改渠道物料', 'v2-material-channel', key, 'btn primary small') : '—'));
      if (films.length) rows.push(line(esc(liveChannelName(channel)), '正片', films.map(item => '<p>第' + item.index + '集 ' + tag(item.status) + '</p>').join(''), films.map(item => '<p>第' + item.index + '集：' + esc(item.opinion) + '</p>').join(''), films.some(item => item.status === '待修改') ? act('修改渠道正片', 'v59-channel-film-edit', key, 'btn primary small') : '—'));
    }
    return ['渠道修改意见 · ' + r.name, '<h3>渠道修改任务 ' + mark(1) + '</h3>' + table(['渠道', '修改内容', '状态', '修改意见', '操作 ' + mark(2)], rows, { key: 'channel-rework-tasks-' + r.id, className: 'v59-channel-tasks' }), ''];
  }
  const pending = (r.channelReturns?.[modal.channel] || []).filter(item => item.status === '待修改');
  const files = d.videos || [], busy = d.uploading;
  const inputFor = (id, text, multiple = false) => '<label class="btn upload-label' + (multiple ? ' primary' : ' small') + '">' + text + '<input type="file" accept="video/*"' + (multiple ? ' multiple' : '') + (busy ? ' disabled' : '') + ' data-v2-upload="channel-film" data-v2-key="' + encodeURIComponent(modal.channel) + '|' + esc(id) + '"></label>';
  const rows = files.map((ep, i) => line('第' + (i + 1) + '集', '<div class="audit-full-text">' + esc(ep.name) + '</div>' + (ep.originalId && ep.id !== ep.originalId ? '<span class="changed-field">已替换</span>' : !ep.originalId ? '<span class="changed-field">新增视频</span>' : ''), v2Duration(ep.duration) + '<br><span class="muted">' + ep.width + '×' + ep.height + '</span>', buttons(inputFor(ep.id, '替换'), '<button type="button" class="link danger" data-act="v59-channel-film-remove" data-id="' + i + '"' + (busy ? ' disabled' : '') + '>删除</button>')));
  const body = '<div class="v59-channel-film-editor"><p><strong>' + esc(liveChannelName(modal.channel)) + '</strong> · ' + esc(r.name) + ' ' + mark(1) + '</p><div class="v59-channel-reasons">' + pending.map(item => '<p><strong>第' + item.index + '集驳回原因：</strong>' + esc(item.opinion) + '</p>').join('') + '</div><div class="v59-channel-drop"><strong>拖拽视频到此处，或批量选择视频</strong><p>支持新增、替换、删除本渠道视频，短边至少720像素。</p>' + inputFor('new', '添加视频', true) + '</div><h3>渠道正片 · 共 ' + files.length + ' 集 <span class="muted">总时长 ' + v2Duration(files.reduce((sum, ep) => sum + ep.duration, 0)) + '</span></h3>' + (busy ? '<p role="status">正在校验视频，请稍候…</p>' : '') + table(['集序', '视频文件', '时长／规格', '操作'], rows, { key: 'channel-edit-films-' + r.id, className: 'v59-channel-videos' }) + '</div>';
  return ['修改渠道正片', body, '提交本渠道复核', 2];
}
clickActions['v59-channel-film-edit'] = (_, value) => {
  const [r, channel] = v59ChannelKey(value);
  if (!v59SupplierOwns(r) || !channelsFor(r).includes(channel)) return announce('无本渠道修改权限');
  const pending = (r.channelReturns?.[channel] || []).filter(item => item.status === '待修改');
  if (!pending.length) return announce('当前渠道暂无待修改正片');
  const files = v59ChannelEpisodes(r, channel);
  openModal('v2-channel-feedback', r.id, { videos: files.map(ep => ({ ...structuredClone(ep), originalId: ep.id })), originalSignature: JSON.stringify(files), tokens: Object.fromEntries(pending.map(item => [item.episodeId, v59ReturnToken(item)])) }, { channel });
};
clickActions['v59-channel-film-remove'] = (_, index) => {
  const modal = ui.modal;
  if (modal?.type !== 'v2-channel-feedback' || !modal.channel || modal.draft.uploading || !v59SupplierOwns(val(modal.id))) return;
  modal.draft.videos.splice(Number(index), 1);
  modal.draft.videos.forEach((ep, i) => ep.index = i + 1);
  render();
};
async function v59UploadChannelFilm(field, files) {
  const modal = ui.modal, r = val(modal?.id), [encodedChannel, id] = field.dataset.v2Key.split('|'), channel = decodeURIComponent(encodedChannel);
  if (!v59SupplierOwns(r) || modal?.channel !== channel || modal.type !== 'v2-channel-feedback' || modal.draft.uploading) throw Error('请重新打开本渠道修改任务');
  const row = id === 'new' ? null : modal.draft.videos.find(ep => ep.id === id);
  if (id !== 'new' && !row) throw Error('该视频已移除，请重新选择');
  modal.draft.uploading = true; render();
  try {
    const prepared = [];
    for (const file of row ? files.slice(0, 1) : files) {
      const metadata = await v2VideoMetadata(file);
      prepared.push(await v2Remember(file, { ...metadata, version: (row?.version || 0) + 1, result: '', opinion: '' }));
    }
    if (ui.modal !== modal) return;
    if (row) modal.draft.videos.splice(modal.draft.videos.indexOf(row), 1, { ...prepared[0], originalId: row.originalId });
    else modal.draft.videos.push(...prepared.map(ep => ({ ...ep, originalId: null })));
    modal.draft.videos.forEach((ep, i) => ep.index = i + 1);
    announce(row ? '已替换本渠道视频' : '已添加本渠道视频');
  } finally { if (ui.modal === modal) { modal.draft.uploading = false; render(); } }
}
function v59SubmitChannelFilm(modal) {
  const r = val(modal.id), channel = modal.channel, d = modal.draft, files = d.videos || [];
  if (!v59SupplierOwns(r) || !channel || !channelsFor(r).includes(channel)) return error('无本渠道正片修改权限。');
  if (d.uploading) return error('请等待视频校验完成。');
  if (!files.length) return error('请至少保留一集视频。');
  if (JSON.stringify(v59ChannelEpisodes(r, channel)) !== d.originalSignature) return error('渠道视频已变更，请重新打开。');
  const pending = (r.channelReturns?.[channel] || []).filter(item => item.status === '待修改');
  if (!pending.length || pending.some(item => d.tokens[item.episodeId] !== v59ReturnToken(item))) return error('本渠道修改任务已变更，请重新打开。');
  if (pending.some(item => files.some(ep => ep.originalId === item.episodeId && ep.id === item.episodeId))) return error('请替换或删除本渠道被驳回的视频后再提交。');
  if (files.some(ep => !ep.id || Math.min(ep.width || 0, ep.height || 0) < 720 || !Number.isFinite(ep.duration))) return error('请上传符合规格的视频。');
  const version = (r.channelEpisodes ||= {})[channel] ||= {};
  (version.history ||= []).push({ files: structuredClone(v59ChannelEpisodes(r, channel)), time: version.submittedAt || '' });
  version.files = files.map(({ originalId, ...ep }, i) => ({ ...structuredClone(ep), index: i + 1 }));
  version.submittedAt = now();
  for (const item of pending) {
    const replacement = files.find(ep => ep.originalId === item.episodeId);
    item.replacement = replacement ? version.files.find(ep => ep.id === replacement.id) : null;
    item.removed = !replacement; item.status = '待复核'; item.resubmittedAt = version.submittedAt;
  }
  persist(); closeModal(); announce('共' + version.files.length + '集，已提交' + liveChannelName(channel) + '复核');
}
root.addEventListener('dragover', event => { if (event.target.closest('.v59-channel-drop')) event.preventDefault(); });
root.addEventListener('drop', async event => {
  const drop = event.target.closest('.v59-channel-drop'); if (!drop) return;
  event.preventDefault(); event.stopPropagation();
  try { if (event.dataTransfer.files.length) await v59UploadChannelFilm({ dataset: { v2Key: encodeURIComponent(ui.modal.channel) + '|new' } }, [...event.dataTransfer.files]); }
  catch (e) { announce(e.message); }
});
for (const action of ['v2-channel-material-approve', 'v2-channel-approve']) {
  const previous = clickActions[action];
  clickActions[action] = r => { if (!v59CanOperate(r, ui.channel)) return announce('无本渠道复核权限'); previous(r); };
}
clickActions['v59-channel-online'] = (_, value) => {
  const [r, channel] = v59ChannelKey(value);
  if (!v59CanOperate(r, channel)) return announce('无本渠道上线权限');
  if (v59ChannelOnlineStatus(r, channel) !== '待上线') return announce('当前渠道状态已变更');
  (r.channelOnline ||= {})[channel] = { status: '已上线', time: now() };
  persist(); render(); announce(liveChannelName(channel) + '已上线');
};
clickActions['channel-detail'] = (_, channel) => {
  const r = val(ui.modal?.id), from = ui.view === 'operator' ? 'operator' : 'channel';
  if (!r || !channelsFor(r).includes(channel)) return;
  ui.channel = channel; openDetail(r, from);
};
const v59PreviousMaterialView = views.materialsV2;
views.materialsV2 = () => {
  const html = v59PreviousMaterialView(), r = ui.edit;
  if (!r?.channelReworkMode) return html;
  const dom = document.createElement('div'); dom.innerHTML = html;
  const channel = r.reworkChannels[0], item = val(r.id).channelMaterialReturns[channel];
  dom.querySelector('h1').textContent = '修改渠道物料 · ' + liveChannelName(channel) + ' · ' + r.name;
  dom.querySelector('.v2-flow-steps').innerHTML = '<strong>① 修改渠道物料</strong><span>→</span>② 提交本渠道<span>→</span>③ 渠道运营复核';
  dom.querySelector('.v2-flow-steps').insertAdjacentHTML('afterend', '<p class="v2-intro"><strong>修改意见：</strong>' + esc(item.opinion) + '</p>');
  const releaseField = dom.querySelector('[name="v2release"]')?.closest('.field');
  if (releaseField) releaseField.innerHTML = '<span>当前渠道</span><strong>' + esc(liveChannelName(channel)) + '</strong>';
  dom.querySelectorAll('[name="v2type"], [name="v2round"], [name="supplierDate"]').forEach(field => field.disabled = true);
  dom.querySelector('[value="submit"]').textContent = '提交本渠道复核';
  return dom.innerHTML;
};
const v59PreviousReadMaterial = v2ReadMaterial;
v2ReadMaterial = () => {
  v59PreviousReadMaterial();
  if (!ui.edit?.channelReworkMode) return;
  const base = val(ui.edit.id);
  for (const key of ['type', 'round', 'supplierDate', 'launch', 'freeTime']) ui.edit[key] = base[key];
};
const v59PreviousMaterialAreas = collectionMaterialAreas;
collectionMaterialAreas = (r, ...args) => v59PreviousMaterialAreas(ui.modal?.type === 'collection-info' && ui.modal.channel ? v59ChannelMaterialRecord(r, ui.modal.channel) : r, ...args);
const v59PreviousDialog = dialogBody;
dialogBody = modal => {
  if (modal.type === 'v59-channel-history') return v59ChannelHistoryDialog(modal);
  const result = v59PreviousDialog(modal), r = val(modal.id);
  if (modal.type !== 'collection-info' || !modal.channel || modal.draft.tab !== '正片详情' || !r.episodeFiles?.length) return result;
  result[1] = tabs([['物料详情', '物料详情'], ['正片详情', '正片详情']], modal.draft.tab, 'inspect-tab') + table(['集数', '文件名', '时长', '操作'], v59ChannelEpisodes(r, modal.channel).map(ep => line('第' + ep.index + '集', esc(ep.name), v2Duration(ep.duration), buttons(act('预览', 'v59-preview-channel-film', r.id + '|' + encodeURIComponent(modal.channel) + '|' + ep.index), act('下载', 'v2-download', encodeURIComponent(JSON.stringify(ep)))))), { key: 'channel-episodes-' + r.id + '-' + modal.channel });
  return result;
};
function v59ChannelRejectionItems(r, channel, type) {
  const items = type === 'material' ? [r.channelMaterialReturns?.[channel]].filter(Boolean) : r.channelReturns?.[channel] || [];
  return items.flatMap(item => [...(item.history || []).map(old => ({ ...old, historical: true })), item]).reverse().sort((a, b) => String(b.time || '').localeCompare(String(a.time || '')));
}
function v59ChannelHistoryDialog(modal) {
  const r = val(modal.id), type = modal.draft.tab || 'material', items = v59ChannelRejectionItems(r, modal.channel, type);
  const navigation = '<div class="audit-tab-row">' + tabs([['material', '物料驳回记录'], ['film', '正片驳回记录']], type, 'v59-channel-history-tab') + mark(1) + '</div>';
  const cards = items.map(item => '<article class="audit-card"><div class="audit-card-meta"><strong>' + (type === 'material' ? '渠道物料' : '第' + item.index + '集') + '</strong>' + auditMeta('驳回时间', item.time) + (ui.side === 'supplier' ? '' : auditMeta('渠道运营', item.actor)) + '<span class="audit-result">' + tag('驳回') + '</span></div><div class="audit-opinion"><div class="audit-full-text">' + esc(item.opinion || '未记录驳回原因') + '</div><p class="field-hint">' + (item.historical ? '历史记录' : '处理状态：' + esc(item.status)) + (item.removed ? ' · 供应商已删除该视频' : '') + (item.resubmittedAt ? ' · 重提时间：' + esc(item.resubmittedAt) : '') + (item.reviewedAt ? ' · 复核时间：' + esc(item.reviewedAt) : '') + '</p></div></article>').join('');
  return ['审核记录 · ' + liveChannelName(modal.channel) + ' · ' + r.name, '<div class="v59-channel-history">' + navigation + (cards || auditEmpty(type === 'material' ? '本渠道物料驳回' : '本渠道正片驳回')) + '</div>', ''];
}
clickActions['v59-channel-history'] = (_, value) => {
  const [r, channel] = v59ChannelKey(value);
  if (!r || !channelsFor(r).includes(channel) || (ui.side === 'supplier' && !v59SupplierOwns(r))) return;
  openModal('v59-channel-history', r.id, { tab: r.channelMaterialReturns?.[channel] ? 'material' : 'film' }, { channel });
};
clickActions['v59-channel-history-tab'] = (_, tab) => {
  if (ui.modal?.type !== 'v59-channel-history' || !['material', 'film'].includes(tab)) return;
  ui.modal.draft.tab = tab; render();
};
V2_NOTES['v59-channel-history'] = v2Note('合集详情 · 剧集管理 · 渠道审核记录', '11.19更新：分渠道查看物料和正片的历次驳回原因。', [['列表项／操作项', [['物料驳回记录', '展示当前渠道物料历次驳回时间、完整原因及处理进度；重复驳回保留历史。'], ['正片驳回记录', '按被驳回分集展示原因与处理进度，支持查看重提及复核时间；删除视频后仍保留原驳回记录。'], ['查看范围', '仅展示所选渠道，不混入其他渠道或平台审核；切换Tab和关闭不会改变数据。供应商可查看原因。']]]]);
clickActions['v59-preview-channel-film'] = async (_, value) => {
  const [id, encodedChannel, index] = value.split('|'), r = val(Number(id)), ep = v59ChannelEpisodes(r, decodeURIComponent(encodedChannel)).find(item => item.index === Number(index));
  if (!ep) return announce('尚未上传该集文件');
  const previous = structuredClone(ui.modal);
  try { const url = ep.url || URL.createObjectURL(await v2File(ep)); openModal('live-preview-episode', r.id, { url, name: ep.name }, { returnModal: previous, objectUrl: ep.url ? '' : url }); }
  catch (e) { announce(e.message || '文件不可用'); }
};
V2_NOTES['v2-channel-feedback'] = v2Note('供应商端 · 内容管理 · 渠道修改意见', '按渠道分别修改并提交物料或正片。', [['配置项', [['修改渠道物料', '打开所选渠道物料，回填该渠道草稿或最近提交版本；首次修改引用合集物料。保存草稿和提交均独立到当前渠道。'], ['修改渠道正片', '回显当前渠道完整视频列表和驳回原因，可批量添加、替换、删除视频；显示当前总集数和总时长。至少保留一集，被驳回视频需替换或删除，保留渠道历史版本。']]], ['操作项', [['提交本渠道复核', '只推进当前渠道的物料或视频版本到待复核，由本渠道运营处理。不重新进入平台物料／正片审核，不覆盖合集公共资料、原平台通过结果或其他渠道。']]]]);
const v59PreviousNoteInfo = noteInfo;
noteInfo = () => {
  const info = v59PreviousNoteInfo();
  if (ui.modal?.type === 'v2-channel-feedback' && !ui.modal.channel) return v2Note('供应商端 · 内容管理 · 渠道修改意见', '11.19更新：物料和正片分别按渠道修改并提交。', [['列表项', [['渠道修改任务', '按渠道区分物料与正片的修改意见和状态，待修改任务显示对应修改入口。']]], ['操作项', [['修改渠道物料', '进入该渠道物料填写页，草稿和提审版本独立保存，提交后仅该渠道进入待复核。'], ['修改渠道正片', '回填该渠道全部视频，可新增、删除、替换后提交本渠道复核；不进入平台审核，不影响其他渠道。']]]]);
  if (ui.view !== 'materialsV2' || !ui.edit?.channelReworkMode || ui.modal) return info;
  const copy = structuredClone(info);
  copy.page = '供应商端 · 内容管理 · 修改渠道物料';
  copy.goal = '11.19更新：渠道运营驳回物料后，供应商仅修改并提交对应渠道物料。';
  copy.sections[0] = ['配置项 · 基础信息', [['当前渠道', '明确本次修改渠道，只加载本渠道适用字段；内容类型、发行轮次及首发时间沿用合集信息。'], ['修改意见', '回显当前渠道运营的驳回意见。']]];
  copy.sections[7] = ['操作项', [['保存草稿', '仅保存当前渠道草稿，返回后可继续编辑，渠道状态仍为待修改。'], ['提交本渠道复核', '校验通过后保存当前渠道物料版本，状态变为待复核，由该渠道运营复核；不重走平台物料审核，不覆盖公共物料或其他渠道。']]];
  return copy;
};
V2_NOTES.channelList = v2Note('平台端 · 渠道明细', '11.19更新：渠道运营可将本渠道从待上线变更为已上线。', [['列表项', [['上线状态', '逐渠道展示当前状态，与合集详情及运营列表同步。']]], ['操作项', [['上线', '仅本渠道待上线时可操作，点击后更新为已上线并移除按钮；其他渠道及计划上线时间保持。']]]]);
for (const section of V2_NOTES.detail.sections) {
  section[1] = section[1].filter(([name]) => !['渠道修改意见', '渠道审核意见'].includes(name));
  for (const item of section[1]) if (item[0] === '发布状态') item[1] = '物料或正片任一项被渠道运营驳回，即显示驳回；重提待复核期间保持驳回，全部复核通过后恢复待上线或原已上线状态。';
  if (section[0].includes('操作')) section[1].push(
    ['上线', '11.19更新：本渠道处于待上线时展示；渠道运营点击后仅该渠道变为已上线，操作按钮移除，其他渠道及计划上线时间保持。'],
    ['审核记录', '原渠道意见列移除，改由操作项进入；按物料、正片Tab查看该渠道历次驳回记录和原因。'],
    ['供应商修改物料／修改正片', '供应商查看自己的合集时，当前渠道物料被驳回显示修改物料；正片被驳回显示修改正片。回填该渠道全部视频，支持替换、删除、批量新增，提交后仅该渠道待复核，合集及其他渠道版本保持。']
  );
}
function v59EnsureChannelExample() {
  const existing = records.find(r => r.demoScenario === 'channel-rework-v59');
  if (existing) return existing;
  const source = records.find(r => r.demoScenario === 'audit-evaluation-v59');
  if (!source) return null;
  const r = structuredClone(source);
  r.id = Math.max(1600, ...records.map(item => Number(item.id) || 0)) + 1;
  r.name = '渠道修改示例（演示）'; r.demoScenario = 'channel-rework-v59';
  r.release = ['微信视频号', '字节系']; r.assignment = { '微信视频号': '视频号运营', '字节系': '字节系运营' };
  r.channelMaterialReturns = {
    '微信视频号': { status: '待修改', opinion: '请替换微信视频号使用的横版海报，并补充本渠道推荐文案。', time: '2026-11-19 10:40' },
    '字节系': { status: '待修改', opinion: '请补充字节系渠道物料截图。', time: '2026-11-19 10:45' }
  };
  r.channelReturns = {
    '微信视频号': [{ episodeId: r.episodeFiles[0].id, index: 1, status: '待修改', opinion: '请替换第1集，修正片尾字幕。', time: '2026-11-19 10:50' }],
    '字节系': [{ episodeId: r.episodeFiles[1].id, index: 2, status: '待修改', opinion: '请修正第2集音量。', time: '2026-11-19 10:55' }]
  };
  r.channelMaterials = {}; r.channelOnline = {};
  records.unshift(r); persist(); return r;
}
v59EnsureChannelExample();
render();
