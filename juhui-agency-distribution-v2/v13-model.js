/* 最新代发行优化v1.3；只作用于独立V2原型。 */
const V13_WECHAT = '仅微信视频号';
const V13_QUALITY_COLUMNS = [['国内渠道', '国内渠道'], [V13_WECHAT, V13_WECHAT], ['YouTube', '海外 YouTube'], ['TT端原生', '海外 TikTok 端原生'], ['TT小程序', '海外 TT 小程序']];
// 线上权限页关联渠道：2026-11-17 用户提供的完整下拉截图；不同于意向／质量评估职责。
const V13_ASSOCIATED_CHANNELS = ['字节系（红果和抖音）', '拼多多', '美团', '爱奇艺', '优酷视频', '腾讯视频', '芒果TV', '支付宝', '咪咕', '搜狐', 'UC浏览器', '小米', '淘宝', '微博', '快手', '全民K歌（全民短剧）', '微信视频号', '版权代售', '海外YouTube', '海外Tiktok端原生', '海外自有产品', '河马APP', '百家号', '海外TT小程序', 'B站', '华为'];
// Actual release choices follow the user's complete screenshots. Keep stable keys
// for existing channel assignments, materials and submitted records.
const V13_RELEASE_KEYS = { '字节系（红果和抖音）': '字节系', '海外YouTube': '海外 YouTube', '海外Tiktok端原生': '海外 TikTok 端原生', '海外TT小程序': '海外 TT 小程序' };
const V13_RELEASE_OPTIONS = V13_ASSOCIATED_CHANNELS.map(label => [V13_RELEASE_KEYS[label] || label, label]);
v2Release = () => V13_RELEASE_OPTIONS.map(([value]) => value);
function v13ReleaseSelection(values = []) {
  return [...new Set(v2ChannelList({ release: values }).map(value => V13_RELEASE_KEYS[value] || value))];
}
const v13HasChannelRole = roles => roles.some(role => ['渠道负责人', '渠道运营'].includes(role));
function v13AssociatedChannels(user) {
  if (Array.isArray(user.associatedChannels)) return [...user.associatedChannels];
  // 只兼容渠道岗位旧记录，不把质量评估职责推定成渠道授权。
  if (!v13HasChannelRole(user.roles)) return [];
  if (user.roles.includes('内容质量评估')) return (user.channels || []).filter(c => V13_ASSOCIATED_CHANNELS.includes(c));
  const aliases = { '字节系': '字节系（红果和抖音）', '海外 YouTube': '海外YouTube', '海外 TikTok 端原生': '海外Tiktok端原生', '海外 TT 小程序': '海外TT小程序' };
  return [...new Set((user.channels || []).map(c => aliases[c] || c).filter(c => V13_ASSOCIATED_CHANNELS.includes(c)))];
}
const v13QualityChannels = user => (user.channels || []).filter(c => V2_QUALITY_CHANNELS.includes(c));
const v13OnlyWechat = r => Boolean(r.domesticOnlyWechat && r.intent?.includes('国内渠道'));
const v13Intent = r => (r.intent || []).map(c => c === '国内渠道' && v13OnlyWechat(r) ? V13_WECHAT : c);
const v13Businesses = () => v2Config.users.filter(u => u.roles.some(role => ['商务负责人', '商务人员'].includes(role)));
const v13BusinessActor = () => v2User(ui.businessActor) || v13Businesses()[0];
const v13QualityIsBusiness = user => Boolean(user?.roles.some(role => ['商务负责人', '商务人员'].includes(role)));
const v13FeedbackActor = () => { const actor = ui.view === 'qualityV2' ? v2User(ui.qualityActor) : null; return v13QualityIsBusiness(actor) ? actor : null; };
const v13SupplierBusinessIds = s => [...new Set(Array.isArray(s.businessIds) ? s.businessIds : s.business ? [s.business] : [])];
const v13AuthorizationStatus = r => r.authorization?.length ? '已上传' : r.onlineSnapshot ? '未读取' : '未上传';
changedFields.add('授权书状态');
const v13BusinessLead = () => Boolean(v13BusinessActor()?.roles.includes('商务负责人'));
const v13ContentReady = r => !r.onlineSnapshot && r.quality === '通过';
const v13ContentResubmitted = r => Boolean(r.contentResubmitted || (r.qualityHistory || []).some(h => h.action === '内容评估驳回后重提'));
const v13CanChangeResult = (r, index) => v13ContentReady(r) && combined(r) === '审核中' && ['通过', '驳回'].includes(groupStatus(r, index));
const v13BusinessConfirmed = r => Object.hasOwn(r, 'businessChannelConfirmed') ? r.businessChannelConfirmed === true : Boolean(r.onlineSnapshot || r.stage || r.materialStatus !== '待提交');
const v13MaterialAllowed = r => r.filmStatus === '通过' && v13BusinessConfirmed(r);
const v13MaterialWait = r => r.filmStatus !== '通过' ? '待正片审核通过后上传物料' : '待商务确认发行渠道后上传物料';
const v13DeliveryExists = r => Boolean(r.deliverySubmittedAt || r.episodeFiles?.length);
const v13ActorName = (r, index) => r.reviews?.find(x => x.group === index)?.actor || (r.groups[index] ? '未记录' : '');
const v13QualityResult = t => tag(t.result || '待评估') + (t.result ? ' <span class="reviewer-name">' + esc(t.actor || v2User(t.userId)?.name || '未记录') + '</span>' : '');
const v13CanWithdrawQuality = (r, task) => ['通过', '驳回'].includes(task?.result) && (!r.qualityFinal || task.result === '驳回');
function v13QualityChannelCell(r, channel) {
  const tasks = (r.qualityTasks || []).filter(t => t.channel === channel);
  if (!tasks.length) return v13Intent(r).includes(channel) ? tag('未分配') : '<span class="muted">—</span>';
  return tasks.map(t => '<div class="v13-channel-quality">' + tag(t.result || '待评估') + '<span class="reviewer-name">' + esc(t.actor || v2User(t.userId)?.name || '未记录') + '</span></div>').join('');
}
const v13Finished = message => { persist(); closeModal(); announce(message); };
if (!v2Config.users.some(u => u.id === 'q-wechat')) v2Config.users.push({ id: 'q-wechat', name: '视频号质量评估员（演示）', roles: ['内容质量评估'], channels: [V13_WECHAT] });
if (!v2Config.users.some(u => u.id === 'biz-staff')) v2Config.users.push({ id: 'biz-staff', name: '普通商务（演示）', roles: ['商务人员'], channels: [] });
ui.businessActor = 'admin';
changedFields.add('供应商白名单'); changedFields.add('关联渠道'); changedFields.add('仅微信视频号');
changedFields.add('负责质量评估渠道');
changedFields.add('供应商名称');
changedFields.add('国内发行范围');
changedFields.add('意向发行渠道');
V13_QUALITY_COLUMNS.forEach(([label]) => changedFields.add(label));
changedFields.add('商务最终反馈');
changedFields.add('首次提审');
const v13QualityActorParam = new URLSearchParams(location.search).get('qualityActor');
if (v2User(v13QualityActorParam)?.roles.some(role => ['内容质量评估', '商务负责人', '商务人员'].includes(role))) ui.qualityActor = v13QualityActorParam;
const v13OldBSkipped = bSkipped;
bSkipped = r => v13OnlyWechat(r) || v13OldBSkipped(r);
v2MakeTasks = r => v13Intent(r).flatMap(channel => v2Config.users.filter(u => u.roles.includes('内容质量评估') && u.channels.includes(channel)).map(u => ({ id: channel + ':' + u.id, channel, userId: u.id, result: '', opinion: '', time: '' })));
v2QualityReady = r => {
  const tasks = r.qualityTasks || [];
  if (r.qualityBypass || !tasks.length || v13Intent(r).some(c => !tasks.some(t => t.channel === c))) return false;
  const domestic = tasks.filter(t => ['国内渠道', V13_WECHAT].includes(t.channel));
  return tasks.every(t => t.result) || domestic.length > 0 && domestic.every(t => t.result);
};
const v13OldQualityStatus = v2QualityStatus;
v2QualityStatus = r => r.qualityBypass ? '白名单免评' : ['评估中', '待商务反馈'].includes(v13OldQualityStatus(r)) ? '待审核' : v13OldQualityStatus(r);
const v13OldIntentChannels = intentChannels;
intentChannels = r => v13OnlyWechat(r) ? '<div class="intent-channels"><div><span>意向：</span>' + esc(v13Intent(r).join('、')) + '</div><div><span>剔除：</span>不适用（仅微信视频号）</div></div>' : v13OldIntentChannels(r);
function v13AuditItems(r) {
  const rows = [];
  (r.qualityHistory || []).forEach(h => {
    if (h.snapshot?.opinion !== undefined) rows.push({ type: '内容质量评估', person: h.snapshot.actor || v2User(h.snapshot.userId)?.name || h.snapshot.actor || '未记录', result: h.snapshot.result, opinion: h.snapshot.opinion, time: h.time, action: h.action });
  });
  (r.qualityTasks || []).filter(t => t.result && !rows.some(x => x.time === t.time && x.opinion === t.opinion)).forEach(t => rows.push({ type: t.channel + '质量评估', person: t.actor || v2User(t.userId)?.name || '未记录', result: t.result, opinion: t.opinion, time: t.time, action: '提交意见' }));
  if (r.qualityFinal && !rows.some(x => x.time === r.qualityFinal.time && x.opinion === r.qualityFinal.opinion)) rows.push({ type: '商务最终反馈', person: r.qualityFinal.actor || '未记录', ...r.qualityFinal, action: '最终反馈' });
  (r.reviews || []).forEach(x => rows.push({ type: x.group < 0 ? '内容质量评估' : GROUPS[x.group], person: x.actor || '未记录', ...x, action: '提交意见' }));
  (r.contentReviewHistory || []).forEach(h => rows.push({ type: GROUPS[h.group], person: h.actor || '未记录', ...h, action: h.action || '修改意见' }));
  (r.evaluationHistory || []).forEach(h => (h.reviews || []).forEach(x => rows.push({ type: x.group < 0 ? '历史内容质量评估' : '历史' + GROUPS[x.group], person: x.actor || '未记录', ...x, action: '重提前意见' })));
  (r.qualityHistory || []).forEach(h => {
    (h.snapshot?.tasks || []).filter(t => t.result).forEach(t => rows.push({ type: '历史' + t.channel + '质量评估', person: t.actor || v2User(t.userId)?.name || '未记录', ...t, action: '重提前意见' }));
    if (h.snapshot?.final) rows.push({ type: '历史商务最终反馈', person: h.snapshot.final.actor || '未记录', ...h.snapshot.final, action: '重提前意见' });
  });
  (r.filmHistory || []).forEach(h => Object.entries(h.results || {}).filter(([id]) => h.round?.ids?.includes(id)).forEach(([id, result]) => {
    const index = result.index || r.episodeFiles.find(e => e.id === id)?.index || r.episodeHistory?.find(e => e.id === id)?.index || '—';
    rows.push({ type: '正片审核 · 第' + index + '集', person: h.actor || '未记录', result: result.result, opinion: result.opinion || '未填写', time: h.time, action: '第' + (h.round?.number || 1) + '轮完成审核' });
  }));
  return rows.sort((a, b) => String(b.time || '').localeCompare(String(a.time || '')));
}
function v13OpinionSummary(r) {
  if (r.qualityBypass) return '<p class="field-hint">供应商白名单：本轮跳过内容质量评估。</p>';
  const names = v13Intent(r), rows = names.map(channel => {
    const tasks = (r.qualityTasks || []).filter(t => t.channel === channel);
    return line(esc(channel), tasks.length ? tasks.map(t => '<div>' + v13QualityResult(t) + '<p class="v13-opinion-text">' + esc(t.opinion || (t.result ? '未填写' : '尚未提交意见')) + '</p></div>').join('') : '未参与');
  });
  rows.push(line('商务最终意见', r.qualityFinal ? tag(r.qualityFinal.result) + ' ' + esc(r.qualityFinal.actor || '') + '<p class="v13-opinion-text">' + esc(r.qualityFinal.opinion || '未填写') + '</p>' : '尚未提交最终意见'));
  return '<div class="v13-opinion-summary"><h3>内容质量评估与商务意见</h3>' + table(['评估渠道／角色', '意见'], rows, { key: 'v13-delivery-opinions', className: 'v13-opinion-compact' }) + '</div>';
}

// Shared rendering helpers for the 11.18 review changes.
function v24FilmDuration(r) {
  if (!r.episodeFiles?.length) return '—';
  const count = r.filmRound?.ids?.length || r.episodeFiles.length;
  return '<span>' + v2Duration(v2RoundDuration(r)) + '</span><span class="v24-duration-scope">' + (r.filmRound?.kind === '复审' ? '本次替换 ' : '全集 ') + count + ' 集</span>';
}
function v24QualityRemark(label, d) {
  return formField(label, '<textarea name="opinion" data-quality-opinion rows="4" placeholder="通过时选填；驳回时必填"' + (d.result === '驳回' ? ' required' : '') + '>' + esc(d.opinion || '') + '</textarea>', d.result === '驳回');
}
function v24RenderFilm() {
  const current = root.querySelector('#v2-player'), time = current?.currentTime || 0, playing = current && !current.paused;
  render();
  const next = root.querySelector('#v2-player'); if (!next) return;
  const restore = () => { next.currentTime = time; next.playbackRate = ui.filmSpeed || 1; if (playing) next.play().catch(() => {}); };
  if (next.readyState >= 1) restore(); else next.addEventListener('loadedmetadata', restore, { once: true });
}
