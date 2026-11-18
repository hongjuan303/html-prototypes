const v13OldSubmitAction = clickActions.submit;
clickActions['v13-supplier-new'] = () => openModal('v2-supplier', null, { name: '', business: '', account: '', phone: '', qualityWhitelist: false }, { isNew: true });
root.addEventListener('input', event => {
  if (!event.target.hasAttribute('data-v13-channel-search')) return;
  const menu = event.target.closest('.v13-channel-menu'), keyword = event.target.value.trim().toLowerCase();
  let matches = 0;
  menu.querySelectorAll('.v13-channel-options label').forEach(label => { label.hidden = !label.textContent.toLowerCase().includes(keyword); if (!label.hidden) matches++; });
  menu.querySelector('.v13-channel-empty').hidden = matches > 0;
});
root.addEventListener('change', event => {
  if (ui.modal?.type !== 'v2-user') return;
  const form = event.target.closest('form'); if (!form) return;
  if (event.target.name === 'roles') {
    const roles = new FormData(form).getAll('roles');
    form.querySelector('[data-v13-user-section="associated"]').hidden = !v13HasChannelRole(roles);
    form.querySelector('[data-v13-user-section="quality"]').hidden = !roles.includes('内容质量评估');
    form.querySelector('[data-v13-user-section="film"]').hidden = !roles.includes('正片审核人员');
  }
  if (event.target.name === 'associatedChannels') form.querySelector('.v13-channel-tags').innerHTML = v13AssociatedTags(new FormData(form).getAll('associatedChannels'));
});
root.addEventListener('click', event => {
  const remove = event.target.closest('[data-v13-channel-remove]');
  if (remove) {
    event.preventDefault(); event.stopPropagation();
    const picker = remove.closest('.v13-channel-select'), field = [...picker.querySelectorAll('[name="associatedChannels"]')].find(f => f.value === remove.dataset.v13ChannelRemove);
    if (field) { field.checked = false; field.dispatchEvent(new Event('change', { bubbles: true })); }
    return;
  }
  root.querySelectorAll('.v13-channel-select[open]').forEach(menu => { if (!menu.contains(event.target)) menu.open = false; });
});
function v13PositionChannelMenu(picker) {
  if (!picker.open) return;
  const box = picker.querySelector('summary').getBoundingClientRect(), menu = picker.querySelector('.v13-channel-menu');
  const below = window.innerHeight - box.bottom - 16, above = box.top - 16, downward = below >= 220 || below >= above;
  const height = Math.min(300, Math.max(120, downward ? below : above));
  menu.style.width = box.width + 'px'; menu.style.left = box.left + 'px';
  menu.querySelector('.v13-channel-options').style.maxHeight = Math.max(60, height - 66) + 'px';
  menu.style.top = (downward ? box.bottom + 8 : Math.max(8, box.top - height - 8)) + 'px';
}
root.addEventListener('toggle', event => {
  if (event.target.matches('.v13-channel-select')) { event.target.querySelector('summary').setAttribute('aria-expanded', String(event.target.open)); v13PositionChannelMenu(event.target); }
}, true);
document.addEventListener('scroll', () => root.querySelectorAll('.v13-channel-select[open]').forEach(v13PositionChannelMenu), true);
window.addEventListener('resize', () => root.querySelectorAll('.v13-channel-select[open]').forEach(v13PositionChannelMenu));
root.addEventListener('keydown', event => {
  const picker = root.querySelector('.v13-channel-select[open]');
  if (event.key === 'Escape' && picker) { event.preventDefault(); event.stopImmediatePropagation(); picker.open = false; picker.querySelector('summary').focus(); }
}, true);
clickActions.submit = r => { v13OldSubmitAction(r); ui.modal.draft.domesticOnlyWechat = Boolean(r?.domesticOnlyWechat); render(); };
clickActions['v13-quality-withdraw'] = (_, id) => {
  const [rid, taskId] = id.split('|'), r = val(rid), task = r?.qualityTasks.find(t => t.id === taskId);
  if (!task || task.userId !== ui.qualityActor || !task.result) return announce('当前人员没有可撤回的评估意见');
  r.qualityHistory.unshift({ time: now(), action: '撤回' + task.channel + task.result, snapshot: structuredClone(task) });
  Object.assign(task, { result: '', opinion: '', actor: '', time: '' });
  persist(); render(); announce('评估意见已撤回');
};
clickActions['v2-withdraw-quality'] = clickActions['v13-quality-withdraw'];
clickActions['v2-business-final'] = r => {
  const actor = v13FeedbackActor();
  if (!actor) return announce('仅商务人员可填写最终反馈');
  if (!v2QualityReady(r) || r.qualityFinal) return announce('当前不满足填写最终反馈的条件');
  openModal('v2-business-final', r.id, { result: '通过', opinion: '' }, { businessActorId: actor.id });
};
clickActions['v13-business-withdraw'] = r => {
  if (!v13FeedbackActor()) return announce('仅商务人员可撤回商务反馈');
  if (r.qualityFinal?.result !== '驳回') return announce('通过的商务反馈不可撤回');
  r.qualityHistory.unshift({ time: now(), action: '商务撤回驳回', snapshot: structuredClone(r.qualityFinal) });
  r.qualityFinal = null; r.quality = '待评估'; persist(); render(); announce('商务驳回意见已撤回');
};
clickActions['v13-content-result'] = r => {
  const index = ui.group, old = r.reviews.find(x => x.group === index);
  if (!v13ContentReady(r) || !['待评估'].includes(groupStatus(r, index)) && !v13CanChangeResult(r, index)) return announce('当前组暂不可修改评估意见');
  openModal('v13-content-result', r.id, { result: r.groups[index] || '通过', opinion: old?.opinion || '' }, { group: index });
};
clickActions['v13-change-business'] = r => {
  if (!v13BusinessLead()) return announce('仅商务负责人可修改对接商务');
  openModal('v13-change-business', r.id, { businessOwner: r.businessOwner || v2Supplier(r).business });
};
clickActions['v13-business-confirm'] = r => {
  if (!v13DeliveryExists(r)) return announce('待供应商提交正片和发行渠道后确认');
  openModal('v13-business-confirm', r.id, { release: [...r.release], files: structuredClone(r.authorization) });
};
clickActions['v13-business-auth'] = r => v13DeliveryExists(r) && !v13BusinessConfirmed(r) ? clickActions['v13-business-confirm'](r) : clickActions['v2-auth'](r);
clickActions['v2-material'] = r => { if (!v13MaterialAllowed(r)) return announce(v13MaterialWait(r)); ui.edit = structuredClone(r); navigate('materialsV2'); };
const v13OldMaterialChannel = clickActions['v2-material-channel'];
clickActions['v2-material-channel'] = r => !v13MaterialAllowed(r) ? announce(v13MaterialWait(r)) : v13OldMaterialChannel(r);
const v13OldFilmUpload = clickActions['v2-film-upload'];
clickActions['v2-film-upload'] = r => { v13OldFilmUpload(r); if (ui.modal?.type === 'v2-film-upload') { ui.modal.draft.release = [...r.release]; render(); } };

const v13OldSubmit = submitDialog;
submitDialog = form => {
  const modal = ui.modal, d = modal.draft, r = val(modal.id), data = new FormData(form), text = name => String(data.get(name) || '').trim();
  if (modal.type === 'v2-user') {
    const u = v2User(modal.userId), roles = data.getAll('roles'), associatedChannels = data.getAll('associatedChannels'), qualityChannels = data.getAll('channels');
    if (!text('displayName') || !roles.length) return error('请填写姓名并至少选择一个角色。');
    if (roles.some(role => !V2_ROLES.includes(role))) return error('请选择有效角色。');
    if (v13HasChannelRole(roles) && (!associatedChannels.length || associatedChannels.some(c => !V13_ASSOCIATED_CHANNELS.includes(c)))) return error('请选择关联渠道。');
    if (roles.includes('内容质量评估') && (!qualityChannels.length || qualityChannels.some(c => !V2_QUALITY_CHANNELS.includes(c)))) return error('请配置负责质量评估的渠道。');
    Object.assign(u, { name: text('displayName'), roles, associatedChannels: v13HasChannelRole(roles) ? associatedChannels : v13AssociatedChannels(u), channels: roles.includes('内容质量评估') ? qualityChannels : [...(u.channels || [])], backup: roles.includes('正片审核人员') && data.has('backup') });
    v2SaveConfig(); closeModal(); announce('人员权限已保存'); return;
  }
  if (modal.type === 'v2-submit') {
    if (!text('name') || !Number.isInteger(Number(text('episodes'))) || Number(text('episodes')) < 1 || Number(text('episodes')) > 1000) return error('请填写剧名及1～1000的整数集数。');
    if (!/^https?:\/\//i.test(text('link')) || !text('intro') || Array.from(text('intro')).length > 1000) return error('请填写有效的一卡链接及1000字以内的剧集简介。');
    if (!d.intent.length) return error('请至少选择一个意向发行渠道。');
    if (d.intent.includes('海外 YouTube') && !['是', '否'].includes(text('youtubeFirst'))) return error('请选择海外YouTube是否首发。');
    const supplier = v2Supplier({ supplierId: ui.supplierId }), fields = { name: text('name'), episodes: Number(text('episodes')), link: text('link'), type: text('type'), round: text('round'), intro: text('intro'), youtubeFirst: d.intent.includes('海外 YouTube') ? text('youtubeFirst') : '', intent: [...d.intent], domesticOnlyWechat: Boolean(d.domesticOnlyWechat && d.intent.includes('国内渠道')), exclude: d.intent.includes('国内渠道') && !d.domesticOnlyWechat ? [...d.exclude] : [] };
    const contentResubmit = r && r.quality === '通过' && combined(r) === '驳回';
    const onlyEpisodes = contentResubmit && r.episodes !== fields.episodes && ['name', 'link', 'type', 'round', 'intro', 'youtubeFirst'].every(k => String(r[k] || '') === String(fields[k] || '')) && JSON.stringify(r.intent) === JSON.stringify(fields.intent) && JSON.stringify(r.exclude) === JSON.stringify(fields.exclude) && Boolean(r.domesticOnlyWechat) === fields.domesticOnlyWechat;
    const next = r ? structuredClone(r) : newRecord(Math.max(0, ...records.map(x => Number(x.id) || 0)) + 1);
    if (r) {
      (next.evaluationHistory ||= []).unshift({ time: now(), intent: [...r.intent], exclude: [...r.exclude], reviews: structuredClone(r.reviews), groups: [...r.groups] });
      next.qualityHistory.unshift({ time: now(), action: contentResubmit ? '内容评估驳回后重提' : '质量评估修改后重提', snapshot: { tasks: structuredClone(r.qualityTasks), final: structuredClone(r.qualityFinal) } });
    }
    Object.assign(next, fields, { supplierId: supplier.id, supplier: supplier.name, businessOwner: next.businessOwner || supplier.business, contact: v2User(next.businessOwner || supplier.business)?.name || '', submitted: now(), qualityHistory: next.qualityHistory || [], qualityTasks: next.qualityTasks || [], episodeFiles: next.episodeFiles || [], channelReturns: next.channelReturns || {}, channelMaterialReturns: next.channelMaterialReturns || {}, customMaterials: next.customMaterials || {}, orientation: next.orientation || '横屏' });
    if (contentResubmit) {
      const reuse = onlyEpisodes && Boolean(r.groups[0] && r.groups[1]);
      next.groups = reuse ? [r.groups[0], r.groups[1], ''] : ['', '', ''];
      next.reviews = reuse ? r.reviews.filter(x => [0, 1].includes(x.group)).map(x => ({ ...x, reused: true })) : [];
      next.contentResubmitted = true; next.contentReuse = Boolean(reuse);
      recordLog(next, reuse ? '仅修改集数重提，复用审核组和红果组意见，重新进行运营评估' : '修改后重新进行本轮内容评估');
    } else {
      next.groups = ['', '', '']; next.reviews = []; next.qualityFinal = null;
      next.qualityBypass = Boolean(supplier.qualityWhitelist); next.quality = supplier.qualityWhitelist ? '通过' : '待评估';
      next.qualityTasks = supplier.qualityWhitelist ? [] : v2MakeTasks(next);
      const missing = v13Intent(next).filter(c => !next.qualityTasks.some(t => t.channel === c));
      if (!supplier.qualityWhitelist && missing.length) return error('请先配置这些渠道的质量评估人员：' + missing.join('、'));
      recordLog(next, supplier.qualityWhitelist ? '供应商白名单：跳过内容质量评估，进入内容评估' : '供应商提交渠道质量评估');
    }
    if (r) Object.assign(r, next); else records.unshift(next);
    return v13Finished(contentResubmit ? '剧集已重提内容评估' : supplier.qualityWhitelist ? '已直接进入内容评估' : '剧集已提交质量评估');
  }
  if (modal.type === 'v2-supplier') {
    const s = v2Config.suppliers.find(x => x.id === modal.supplierId), account = modal.isNew ? text('account') : s?.account;
    if (!modal.isNew && !s) return error('供应商记录不存在，请返回列表重试。');
    if (!text('supplierName') || Array.from(text('supplierName')).length > 20) return error('请填写20字以内的供应商名称。');
    if (modal.isNew && (!account || Array.from(account).length > 20)) return error('请填写20字以内的账号。');
    if (text('phone') && !/^1\d{10}$/.test(text('phone'))) return error('请填写有效的11位手机号，或留空。');
    if (!v13Businesses().some(u => u.id === text('business'))) return error('请选择负责商务。');
    if (modal.isNew && !text('password')) return error('请填写初始密码。');
    if (v2Config.suppliers.some(x => x.id !== s?.id && (modal.isNew && x.account === account || Boolean(text('phone')) && x.phone === text('phone')))) return error('账号或手机号已被其他供应商使用。');
    const target = s || { id: String(Math.max(0, ...v2Config.suppliers.map(x => Number(x.id) || 0)) + 1), managed: false }, previousName = target.name;
    Object.assign(target, { name: text('supplierName'), business: text('business'), account, phone: text('phone'), qualityWhitelist: data.has('qualityWhitelist') });
    if (text('password')) target.password = text('password');
    if (modal.isNew) { v2Config.suppliers.unshift(target); Object.keys(ui.tablePages).filter(k => k.startsWith('suppliersV2')).forEach(k => ui.tablePages[k].page = 1); }
    else records.filter(r => !r.onlineSnapshot && (r.supplierId === target.id || !r.supplierId && r.supplier === previousName)).forEach(r => r.supplier = target.name);
    v2SaveConfig(); return v13Finished(modal.isNew ? '供应商已创建' : '供应商资料已保存');
  }
  if (modal.type === 'v2-quality-result') {
    const task = r.qualityTasks.find(t => t.id === modal.taskId);
    if (!task || task.result || task.userId !== ui.qualityActor) return error('当前人员没有该项待处理评估。');
    if (!text('opinion') || !['通过', '驳回'].includes(text('result'))) return error('请选择结果并填写评估意见。');
    Object.assign(task, { result: text('result'), opinion: text('opinion'), actor: v2User(ui.qualityActor)?.name || '未记录', time: now() });
    r.qualityHistory.unshift({ time: now(), action: task.channel + '提交' + task.result, snapshot: structuredClone(task) });
    return v13Finished('渠道评估意见已提交');
  }
  if (modal.type === 'v2-business-final') {
    const actor = v13FeedbackActor();
    if (!actor || actor.id !== modal.businessActorId) return error('当前人员无填写权限，请重新打开反馈。');
    if (!v2QualityReady(r) || r.qualityFinal) return error('当前不满足提交最终反馈条件。');
    if (!text('opinion') || !['通过', '驳回'].includes(text('result'))) return error('请选择结果并填写反馈意见。');
    r.qualityFinal = { result: text('result'), opinion: text('opinion'), actor: actor.name, userId: actor.id, time: now() };
    r.quality = text('result'); r.qualityHistory.unshift({ time: now(), action: '商务提交最终反馈：' + r.quality, snapshot: structuredClone(r.qualityFinal) });
    return v13Finished('最终反馈已提交');
  }
  if (modal.type === 'v13-content-result') {
    const index = modal.group;
    if (!v13ContentReady(r) || groupStatus(r, index) !== '待评估' && !v13CanChangeResult(r, index)) return error('已产生最终结果或当前组不可处理。');
    if (!['通过', '驳回'].includes(text('result')) || text('result') === '驳回' && !text('opinion')) return error('驳回时请填写审核意见。');
    const old = r.reviews.find(x => x.group === index);
    if (old) (r.contentReviewHistory ||= []).unshift({ ...structuredClone(old), action: '修改前意见' });
    r.reviews = r.reviews.filter(x => x.group !== index);
    r.groups[index] = text('result'); r.reviews.unshift({ group: index, result: text('result'), opinion: text('opinion'), actor: GROUPS[index] + '人员', time: now() });
    recordLog(r, GROUPS[index] + '提交' + text('result')); return v13Finished('评估意见已保存');
  }
  if (modal.type === 'v13-change-business') {
    if (!v13BusinessLead()) return error('仅商务负责人可修改对接商务。');
    if (!v13Businesses().some(u => u.id === text('businessOwner'))) return error('请选择有效的商务人员。');
    r.businessOwner = text('businessOwner'); r.contact = v2User(r.businessOwner).name; recordLog(r, '修改对接商务为' + r.contact); return v13Finished('对接商务已更新');
  }
  if (modal.type === 'v13-business-confirm') {
    if (!v13DeliveryExists(r)) return error('待供应商提交正片和发行渠道。');
    if (!d.release?.length || d.release.some(c => !v2Release().includes(c))) return error('请至少选择一个有效发行渠道。');
    if (!d.files.length) return error('请上传授权书后确认。');
    r.release = [...d.release]; r.authorization = structuredClone(d.files); r.businessChannelConfirmed = true; r.businessConfirmedAt = now(); r.businessConfirmedBy = v13BusinessActor()?.name || '未记录';
    if (v2IsHuman(r) && !v2ContractVisible(r)) r.contract = '有';
    recordLog(r, '商务确认发行渠道：' + r.release.join('、')); syncBusiness(r); return v13Finished('发行渠道已确认，授权书已保存');
  }
  if (modal.type === 'v2-film-upload') {
    if (!d.release?.length || d.release.some(c => !v2Release().includes(c))) return error('请至少选择一个有效发行渠道。');
    const confirmed = v13BusinessConfirmed(r), release = confirmed ? [...r.release] : [...d.release];
    v13OldSubmit(form);
    if (!ui.modal) { r.release = release; if (v2IsHuman(r) && !v2ContractVisible(r)) r.contract = '有'; r.deliverySubmittedAt ||= now(); if (!confirmed) r.businessChannelConfirmed = false; recordLog(r, '供应商提交正片及发行渠道，正片审核与商务确认并行'); persist(); render(); }
    return;
  }
  return v13OldSubmit(form);
};

const v13OldReadMaterial = v2ReadMaterial;
v2ReadMaterial = () => {
  const locked = ui.edit && v13BusinessConfirmed(val(ui.edit.id)), release = locked ? [...val(ui.edit.id).release] : null;
  v13OldReadMaterial();
  if (release && ui.edit) ui.edit.release = release;
  if (ui.edit && !v2ContractVisible(ui.edit)) ui.edit.contract = '有';
};
document.addEventListener('submit', event => {
  if (event.target.dataset.v2Form && ui.edit && !v13MaterialAllowed(val(ui.edit.id))) {
    event.preventDefault(); event.stopImmediatePropagation(); error(v13MaterialWait(val(ui.edit.id)), '#v2-material-error');
  }
}, true);
document.addEventListener('change', event => {
  const f = event.target;
  if (f.dataset.v2Upload && !['auth', 'film', 'channel-film'].includes(f.dataset.v2Upload) && ui.edit && !v13MaterialAllowed(val(ui.edit.id))) { event.stopImmediatePropagation(); f.value = ''; announce(v13MaterialWait(val(ui.edit.id))); }
}, true);
root.addEventListener('change', event => {
  const f = event.target, modal = ui.modal;
  if (modal?.type === 'v2-submit' && ['intent', 'exclude', 'domesticOnlyWechat'].includes(f.name)) {
    event.stopImmediatePropagation();
    const data = new FormData(f.closest('form')), draft = modal.draft, scrollTop = root.querySelector('.dialog-body').scrollTop;
    draft.intent = data.getAll('intent'); draft.exclude = data.getAll('exclude'); draft.domesticOnlyWechat = data.has('domesticOnlyWechat');
    if (!draft.intent.includes('国内渠道')) { draft.exclude = []; draft.domesticOnlyWechat = false; }
    else if (f.name === 'domesticOnlyWechat' && f.checked) draft.exclude = [];
    else if (f.name === 'exclude' && f.checked) draft.domesticOnlyWechat = false;
    render();
    root.querySelector('.dialog-body').scrollTop = scrollTop;
    [...root.querySelectorAll('.dialog [name="' + f.name + '"]')].find(input => input.value === f.value)?.focus({ preventScroll: true });
    return;
  }
  if (modal && f.name === 'v13release') { modal.draft.release = [...root.querySelectorAll('[name="v13release"]:checked')].map(n => n.value); }
}, true);

const v13OldFieldsFor = v2FieldsFor;
v2FieldsFor = r => {
  const fields = v13OldFieldsFor(r), selected = v2ChannelList(r);
  if (selected.length === 1 && selected[0] === '海外 TikTok 端原生') {
    for (const [key, name] of [['cleanFilm', '净版无字幕成片'], ['srt', 'SRT字幕文件']]) if (!fields.some(f => f.key === key || f.name === name)) fields.push({ key, name, component: '文件上传', required: false, hint: '仅海外Tiktok原生时选填。' });
  }
  return fields;
};
