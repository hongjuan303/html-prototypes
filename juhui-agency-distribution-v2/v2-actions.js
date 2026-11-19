const v2OriginalDialogBody = dialogBody;
dialogBody = function (modal) {
  const r = val(modal.id), d = modal.draft;
  switch (modal.type) {
    case 'v2-submit':
      return ['提交剧集信息', '<div class="two-fields">' + formField('合集名称', input('name', d.name, '', 'text', 'required maxlength="100"'), true) + formField('集数', input('episodes', d.episodes, '', 'number', 'required min="1" max="1000"'), true) + '</div>' +
        formField('一卡链接', input('link', d.link, 'https://', 'url', 'required'), true) + '<div class="two-fields">' + formField('内容类型', '<select name="type" required>' + (V2_TYPES.includes(d.type) ? '' : '<option value="" disabled selected>请选择内容类型</option>') + options(V2_TYPES, d.type) + '</select>', true) + formField('发行轮次', select('round', ['首发', '二轮'], d.round), true) + '</div>' +
        formField('剧集简介', '<textarea name="intro" rows="4" maxlength="1000" required placeholder="最多1000字">' + esc(d.intro) + '</textarea>', true) +
        '<div class="field"><span>意向发行渠道</span>' + v2Checks('intent', CHANNELS, d.intent) + '</div>' +
        (d.intent.includes('国内渠道') ? '<div class="field"><span>国内渠道排除项</span>' + v2Checks('exclude', EXCLUSIONS, d.exclude) + '</div>' : '') +
        (d.intent.includes('海外 YouTube') ? formField('海外YouTube是否首发', select('youtubeFirst', ['请选择', '是', '否'], d.youtubeFirst || '请选择'), true) : ''), '提交评估', 2];
    case 'v2-quality-result': return v13QualityDialog(modal);
    case 'v2-scheduling':
      return ['设置上线时间', '<div class="form-group"><strong>排播时间 ' + mark(1) + '</strong>' +
        formField('上线时间', input('launch', d.launch, '', 'datetime-local', 'required step="60"'), true) +
        formField('转免时间', input('freeTime', d.freeTime, '', 'datetime-local', 'step="60"')) + '</div>', '确认', 2];
    case 'v2-opinions': return ['评估意见 · ' + r.name, v2Opinions(r, true), '', 0];
    case 'v2-business-final':
      return ['商务最终反馈', v2Opinions(r) + '<div class="v2-dialog-divider"><strong>最终反馈 ' + mark(1) + '</strong></div>' + formField('最终结果', select('result', ['通过', '驳回'], d.result), true) + formField('反馈意见', '<textarea name="opinion" rows="4" required>' + esc(d.opinion) + '</textarea>', true), '提交最终反馈', 2];
    case 'v2-film-upload':
      return ['上传正片 · ' + r.name, '<div class="field-hint">视频短边需≥720像素。按集上传，审核通过前不能提交物料。</div>' + mark(1) +
        Array.from({ length: r.episodes }, (_, index) => { const old = r.episodeFiles.find(e => e.index === index + 1); const added = d.files.find(e => e.index === index + 1); return '<div class="v2-episode-upload"><strong>第' + (index + 1) + '集</strong>' + (old ? '<span>' + tag(old.result || '已上传') + ' ' + esc(old.name) + '</span>' + (old.opinion ? '<p class="error">' + esc(old.opinion) + '</p>' : '') : '') + '<label class="btn upload-label">' + (old ? '替换文件' : '选择视频') + '<input type="file" accept="video/*" data-v2-upload="film" data-v2-key="' + (index + 1) + '"></label>' + (added ? '<span class="changed-field">已选择：' + esc(added.name) + ' · ' + added.width + '×' + added.height + '</span>' : '') + '</div>'; }).join(''), '提交正片审核', 2];
    case 'v2-assign-film': {
      const people = v2Config.users.filter(u => u.roles.includes('正片审核人员'));
      return ['调配正片审核人员', '<p>' + esc(r.name) + '</p>' + mark(1) + formField('审核人员', '<select name="reviewer" required>' + people.map(u => '<option value="' + u.id + '"' + (r.filmReviewer === u.id ? ' selected' : '') + '>' + esc(u.name) + '</option>').join('') + '</select>', true), '确认调配', 2];
    }
    case 'v2-delivery':
      return ['交付记录 · ' + r.name, '<h3>正片文件 ' + mark(1) + '</h3>' + v2FileList(r.episodeFiles) + '<h3 class="v2-subtitle">单集审核意见</h3>' + r.episodeFiles.map(e => '<p>第' + e.index + '集 ' + tag(e.result || '待审核') + ' ' + esc(e.opinion || '') + '</p>').join('') + '<h3 class="v2-subtitle">物料附件</h3>' + Object.entries(r.materials).map(([key, files]) => '<p>' + esc(v2Config.fields.find(f => f.key === key)?.name || key) + '</p>' + v2FileList(files)).join(''), '', 0];
    case 'v2-supplier': {
      const s = v2Config.suppliers.find(s => s.id === modal.supplierId);
      return ['编辑供应商', '<p>' + esc(s.name) + '</p><div class="form-group"><strong>供应商资料 ' + mark(1) + '</strong></div><div class="two-fields">' + formField('负责商务', '<select name="business">' + v2Config.users.filter(u => u.roles.includes('商务负责人')).map(u => '<option value="' + u.id + '"' + (s.business === u.id ? ' selected' : '') + '>' + esc(u.name) + '</option>').join('') + '</select>', true) +
        formField('登录账号', input('account', s.account, '', 'text', 'required'), true) + formField('绑定手机号', input('phone', s.phone, '11位手机号码', 'tel', 'pattern="1[0-9]{10}" required'), true) + formField('设置登录密码', input('password', '', '留空则保留原密码', 'password')) + '</div>' +
        '<p class="field-hint">账号、手机号均可用于密码登录。此处仅使用演示资料。</p>', '保存', 2];
    }
    case 'v2-user': {
      const u = v2User(modal.userId);
      return ['人员权限配置', formField('姓名', input('displayName', u.name, '', 'text', 'required'), true) + '<div class="field"><span>角色 ' + mark(1) + '</span>' + v2Checks('roles', V2_ROLES, u.roles) + '</div><div class="field"><span>负责质量评估渠道</span>' + v2Checks('channels', CHANNELS, u.channels) + '</div>', '保存', 2];
    }
    case 'v2-field': {
      return [modal.fieldKey ? '配置物料字段' : '新增物料字段', mark(1) + '<div class="two-fields">' + formField('字段名称', input('fieldName', d.name || '', '', 'text', 'required'), true) + formField('录入组件', select('component', ['文本框', '文件上传', '图片上传'], d.component || '文本框'), true) + '</div>' +
        '<div class="field"><span>关联渠道</span>' + v2Checks('channels', ['*', ...v2ActiveChannels()], d.channels || []) + '<span class="field-hint">* 表示全部渠道</span></div>' + formField('显示条件', select('condition', ['全部类型', '所有漫剧', '真人有合同', '横屏剧集'], d.condition || '全部类型')) +
        '<label class="check"><input type="checkbox" name="required"' + (d.required ? ' checked' : '') + '>适用时必填</label>' + formField('上传提示', input('hint', d.hint || '')), '保存配置', 2];
    }
    case 'v2-channel': return ['新增发行渠道', mark(1) + formField('渠道名称', input('channelName', '', '', 'text', 'required'), true) + formField('渠道范围', select('market', ['国内', '海外'], '国内')), '新增', 2];
    case 'v2-auth':
      return ['维护授权书 · ' + r.name, '<strong>授权书 ' + mark(1) + '</strong><p class="field-hint">支持Word、PDF，单文件不超过100MB，单次上传合计不超过500MB。</p>' + '<label class="btn upload-label">＋ 上传授权书<input type="file" accept=".doc,.docx,.pdf" multiple data-v2-upload="auth"></label>' + v2FileList(d.files, 'v2-remove-auth'), '保存', 2];
    case 'v2-channel-edit': {
      const wechat = modal.channel === '微信视频号', writable = wechat && canEditWechat(r);
      const status = wechat ? '<select name="status"' + (writable ? '' : ' disabled') + '><option value="">请选择送审情况</option>' + options(WECHAT, d.status) + '</select>' : input('notApplicable', '不适用', '', 'text', 'disabled');
      return ['编辑渠道信息', '<div class="form-group">' + esc(r.name) + ' · ' + esc(modal.channel) + ' ' + mark(1) + '</div>' + formField('渠道内容ID', input('contentId', d.contentId, '请输入渠道内容ID', 'text', 'maxlength="100"')) + formField('送审情况', status) + (wechat && d.status === '已送审' ? formField('送审时间', input('time', d.time, '', 'datetime-local', 'step="60"' + (writable ? ' required' : ' disabled')), writable) : ''), '保存', 2];
    }
    case 'v2-channel-id': return ['修改渠道内容ID', '<p>' + esc(r.name) + ' · ' + esc(modal.channel) + '</p>' + mark(1) + formField('渠道内容ID', input('contentId', d.contentId || '', '', 'text', 'required maxlength="100"'), true), '保存', 2];
    case 'v2-channel-reject':
      return ['驳回渠道正片', '<p>' + esc(r.name) + ' · ' + esc(modal.channel) + '</p>' + mark(1) + '<div class="v2-channel-rejections">' + v59ChannelEpisodes(r, modal.channel).map(e => '<div><label class="check"><input type="checkbox" name="episodeIds" value="' + e.id + '">第' + e.index + '集</label><textarea name="opinion-' + e.id + '" rows="2" placeholder="本渠道该集的修改意见"></textarea>' + ((r.channelReturns[modal.channel] || []).some(item => item.episodeId === e.id && item.status === '待修改') ? '<span class="tag amber">已驳回待修改</span>' : '') + '</div>').join('') + '</div>', '确认驳回', 2];
    case 'v2-channel-feedback': return v59ChannelFeedbackDialog(modal);
    case 'v2-channel-material-reject': return ['驳回渠道物料', '<p>' + esc(r.name) + ' · ' + esc(modal.channel) + '</p>' + mark(1) + formField('修改意见', '<textarea name="opinion" rows="4" required></textarea>', true), '确认驳回', 2];
    case 'v2-export-fields': return ['合集全部字段', mark(1) + '<dl class="bordered-descriptions">' + Object.entries(v2Flatten(r)).map(([key, value]) => detailField(key, esc(value))).join('') + '</dl>', '', 0];
    case 'v2-data-history': return ['采集记录', mark(1) + (r.dataTask ? '<dl class="detail-grid">' + detailField('供应商', v2SupplierLabel(r)) + detailField('采集账号', esc(v2Supplier(r).middleAccount)) + detailField('状态', tag(r.dataTask.status)) + detailField('创建时间', esc(r.dataTask.time)) + '</dl>' : '<p>暂无采集任务</p>'), '', 0];
    case 'v2-managed-rules': return ['代运营物料规则', mark(1) + '<div class="field"><span>中台已有有效值时免重复录入的字段</span><div class="check-list">' + V2_REUSE_FIELDS.map(([key, label]) => '<label class="check"><input type="checkbox" name="skipFields" value="' + key + '"' + (v2Config.managedSkipFields.includes(key) ? ' checked' : '') + '>' + esc(label) + '</label>').join('') + '</div></div><p class="field-hint">缺失项继续手动填写。正片、授权书、版权及渠道合规文件按原要求提交。</p><label class="check"><input type="checkbox" name="enabled"' + (v2Config.managedRulesEnabled ? ' checked' : '') + '>启用以上规则（V2建议方案）</label>', '保存规则', 2];
    default: {
      const content = v2OriginalDialogBody(modal);
      if (modal.type === 'collection-info') content[1] = '<div class="v2-detail-actions">资料与附件 ' + mark(1) + '</div>' + content[1];
      return content;
    }
  }
};

Object.assign(clickActions, {
  submit: r => openModal('v2-submit', r?.id, { name: r?.name || '', episodes: r?.episodes || 3, link: r?.link || '', type: r?.type || V2_TYPES[0], round: r?.round || '首发', intro: r?.intro || '', intent: [...(r?.intent || [])], exclude: [...(r?.exclude || [])], youtubeFirst: r?.youtubeFirst || '请选择' }),
  'v2-opinions': r => openModal('v2-opinions', r.id),
  'v2-quality-result': (_, id) => {
    const r = val(String(id).split('|')[0]), tasks = v13OwnQualityTasks(r);
    if (!tasks.length) return announce('当前没有可处理的渠道评估。');
    const draft = {};
    tasks.forEach((t, i) => { draft['qualityResult' + i] = t.result || ''; draft['qualityOpinion' + i] = t.opinion || ''; });
    openModal('v2-quality-result', r.id, draft, { qualityActorId: ui.qualityActor, qualityTaskIds: tasks.map(t => t.id), qualityTaskRefs: [...tasks] });
  },
  'v2-withdraw-quality': (_, id) => { const [rid, taskId] = id.split('|'), r = val(rid), task = r.qualityTasks.find(t => t.id === taskId); if (r.qualityFinal || task.userId !== ui.qualityActor || task.result !== '驳回') return; r.qualityHistory.unshift({ time: now(), action: '撤回' + task.channel + '驳回意见', snapshot: { ...task } }); Object.assign(task, { result: '', opinion: '', time: '' }); persist(); render(); announce('驳回意见已撤回'); },
  'v2-business-final': r => { if (v2QualityReady(r) && !r.qualityFinal) openModal('v2-business-final', r.id, { result: '通过', opinion: '' }); },
  'v2-film-upload': r => { if (combined(r) === '通过' && r.filmStatus !== '审核中') openModal('v2-film-upload', r.id, { files: [] }); else announce('该合集当前不能提交正片'); },
  'v2-assign-film': r => openModal('v2-assign-film', r.id),
  'v2-delivery': r => openModal('v2-delivery', r.id),
  'v2-material': r => { if (r.filmStatus !== '通过') return announce('待正片审核通过后上传物料'); ui.edit = structuredClone(r); navigate('materialsV2'); },
  'v2-material-back': () => { ui.edit = null; navigate('supplierContent'); },
  'v2-material-channel': (r, value) => v59OpenChannelMaterial(r, value),
  scheduling: r => {
    if (!v2ReadyForSchedule(r)) return announce('物料、正片审核通过且有授权书后才能排播');
    if (v2AwaitingSchedule(r) && v2LaunchTime(r)) return clickActions['v2-schedule-confirm'](r);
    openModal('v2-scheduling', r.id, { launch: v2ValidScheduleDate(v2LaunchTime(r), true) ? v2LaunchTime(r).replace(' ', 'T') : '', freeTime: v2ValidScheduleDate(r.freeTime, true) ? r.freeTime.replace(' ', 'T') : '' });
  },
  'v2-schedule-confirm': r => {
    if (!v2ReadyForSchedule(r)) return announce('物料、正片审核通过且有授权书后才能排播');
    if (!v2AwaitingSchedule(r)) return announce('该剧集已完成排播确认');
    const supplied = v2LaunchTime(r);
    if (!v2ValidScheduleDate(supplied)) return announce('请核对已填写的上线时间');
    v2CompleteSchedule(r, supplied, v2FreeTime(r) || undefined); persist(); render(); announce('上线时间已确认，已流转至渠道负责人阶段');
  },
  'v2-review-film': async r => { ui.selected = r.id; ui.filmDraft = null; ui.filmUrls = {}; for (const e of r.episodeFiles) if (e.id && !e.url) { try { ui.filmUrls[e.id] = URL.createObjectURL(await v2File(e)); } catch {} } ui.episodeId = r.filmRound?.ids[0] || r.episodeFiles[0]?.id; navigate('filmReviewV2'); },
  'v2-episode': (_, id) => { ui.episodeId = id; render(); const video = root.querySelector('#v2-player'); if (video) video.playbackRate = ui.filmSpeed || 1; },
  'v2-episode-pass': (_, id) => { if (val(ui.selected).filmStatus !== '审核中') return; if (!val(ui.selected).filmRound?.ids.includes(id)) return; ui.filmDraft[id].result = '通过'; v24RenderFilm(); },
  'v2-episode-reject': (_, id) => { if (val(ui.selected).filmStatus !== '审核中') return; if (!val(ui.selected).filmRound?.ids.includes(id)) return; ui.filmDraft[id].result = '驳回'; v24RenderFilm(); },
  'v2-finish-film': r => {
    const ids = r.filmRound.ids;
    if (ids.some(id => !ui.filmDraft[id]?.result)) return error('请完成本轮所有分集的审核。', '#v2-film-error');
    if (ids.some(id => ui.filmDraft[id].result === '驳回' && !ui.filmDraft[id].opinion.trim())) return error('请为所有驳回分集填写修改意见。', '#v2-film-error');
    r.filmHistory ||= []; r.filmHistory.unshift({ time: now(), actor: v2User(r.filmReviewer)?.name || '未记录', round: structuredClone(r.filmRound), results: structuredClone(ui.filmDraft), duration: v2RoundDuration(r) });
    r.episodeFiles.forEach(e => { if (ids.includes(e.id)) Object.assign(e, ui.filmDraft[e.id]); });
    r.filmStatus = r.episodeFiles.some(e => e.result === '驳回') ? '驳回' : '通过'; syncBusiness(r); persist(); ui.filmDraft = null; navigate('filmAuditV2'); announce('本轮正片审核已完成');
  },
  'v2-review-back': () => { if (ui.filmDraft && val(ui.selected)?.filmStatus === '审核中' && !confirm('返回后本次未确认的单集结果将不保存，确认返回？')) return; ui.filmDraft = null; navigate('filmAuditV2'); },
  'v2-supplier-edit': (_, id) => { const s = v2Config.suppliers.find(s => s.id === id); openModal('v2-supplier', null, { ...s }, { supplierId: id }); },
  'v2-user-edit': (_, id) => openModal('v2-user', null, {}, { userId: id }),
  'v2-field-edit': (_, key) => openModal('v2-field', null, structuredClone(v2Config.fields.find(f => f.key === key)), { fieldKey: key }),
  'v2-field-new': () => openModal('v2-field', null, { name: '', channels: [], component: '文本框', condition: '全部类型', required: false }),
  'v2-field-delete': (_, key) => { v2Config.fields.find(f => f.key === key).active = false; v2SaveConfig(); render(); announce('字段已删除，历史资料保留'); },
  'v2-field-restore': (_, key) => { v2Config.fields.find(f => f.key === key).active = true; v2SaveConfig(); render(); },
  'v2-channel-delete': (_, id) => { v2Config.channels.find(c => c.id === id).active = false; v2SaveConfig(); render(); announce('渠道已删除，历史记录保留'); },
  'v2-channel-restore': (_, id) => { v2Config.channels.find(c => c.id === id).active = true; v2SaveConfig(); render(); },
  'v2-channel-new': () => openModal('v2-channel', null, {}),
  'v2-config-tab': (_, id) => { ui.configTab = id; render(); },
  'v2-auth': r => openModal('v2-auth', r.id, { release: [...r.release], files: structuredClone(r.authorization) }),
  'v2-remove-auth': (_, index) => { ui.modal.draft.files.splice(Number(index), 1); render(); },
  'v2-remove-material': (_, id) => { const [key, index] = id.split(':'); ui.edit.materials[key].splice(Number(index), 1); render(); },
  'v2-download': (_, value) => v2Download(JSON.parse(decodeURIComponent(value))),
  'v2-channel-edit': r => {
    if (!['channel', 'operator'].includes(ui.detailFrom) || !v2ChannelList(r).includes(ui.channel)) return;
    const contentId = r.channelContentIds?.[ui.channel] || r.onlineSnapshot?.channels.find(c => c.key === ui.channel)?.contentId || '';
    openModal('v2-channel-edit', r.id, { contentId, status: r.wechat?.status || '', time: r.wechat?.time?.replace(' ', 'T') || '' }, { channel: ui.channel, originalContentId: contentId, wechatWritable: ui.channel === '微信视频号' && canEditWechat(r) });
  },
  'v2-channel-id': r => { if (!['channel', 'operator'].includes(ui.detailFrom) || !v2ChannelList(r).includes(ui.channel)) return; openModal('v2-channel-id', r.id, { contentId: r.channelContentIds?.[ui.channel] || '' }, { channel: ui.channel }); },
  'v2-channel-reject': r => { if (ui.detailFrom !== 'operator' || !r.assignment[ui.channel]) return; openModal('v2-channel-reject', r.id, {}, { channel: ui.channel }); },
  'v2-channel-material-reject': r => { if (ui.detailFrom !== 'operator' || !r.assignment[ui.channel]) return; openModal('v2-channel-material-reject', r.id, {}, { channel: ui.channel }); },
  'v2-channel-material-approve': r => { const item = r.channelMaterialReturns?.[ui.channel]; if (item?.status !== '待复核') return; item.status = '已通过'; item.reviewedAt = now(); persist(); render(); announce('本渠道物料复核通过'); },
  'v2-channel-feedback': r => openModal('v2-channel-feedback', r.id, { files: {} }),
  'v2-channel-approve': r => { const entries = r.channelReturns[ui.channel] || []; entries.filter(e => e.status === '待复核').forEach(e => { e.status = '已通过'; e.reviewedAt = now(); }); persist(); render(); announce('本渠道已替换分集复核通过'); },
  'v2-download-films': async r => {
    if (!r.episodeFiles.length) return announce('暂无正片原件');
    const popup = window.open('./download.html', '_blank'); if (!popup) return announce('请允许打开下载窗口后重试');
    try { const files = await Promise.all(r.episodeFiles.map(async e => ({ name: '第' + e.index + '集_' + e.name, blob: await v2File(e) }))); const blob = await v2Zip(files); const meta = await v2Remember(new File([blob], r.name + '_全部正片.zip', { type: 'application/zip' })); popup.location.replace('./download.html#' + encodeURIComponent(JSON.stringify(meta))); announce('正片打包完成'); } catch (e) { popup.close(); announce(e.message); }
  },
  'v2-copy': async (_, text) => { try { await navigator.clipboard.writeText(decodeURIComponent(text)); announce('已复制'); } catch { announce('复制失败，请选中文本手动复制'); } },
  'v2-export-fields': r => openModal('v2-export-fields', r.id),
  'v2-export-all': () => { ui.exportIds = new Set(filtered(records).map(r => r.id)); render(); },
  'v2-export': async () => { if (!ui.exportIds.size) return announce('请先选择合集'); const content = v2Csv(records.filter(r => ui.exportIds.has(r.id))); const meta = await v2Remember(new File([content], '合集全部字段.csv', { type: 'text/csv;charset=utf-8' })); v2Download(meta); },
  'v2-data-task': r => { const s = v2Supplier(r); if (!s.middleAccount || !s.middlePassword) return announce('请先在供应商管理配置字节中台账号'); r.dataTask = { status: '待采集', account: s.middleAccount, supplierId: s.id, time: now() }; persist(); render(); announce('采集任务已创建'); },
  'v2-data-history': r => openModal('v2-data-history', r.id),
  'v2-managed-rules': () => openModal('v2-managed-rules', null, {}),
  'v2-managed-manual': (_, key) => { (ui.edit.managedManual ||= []).push(key); render(); },
  'v2-managed-use': (_, key) => { ui.edit.managedManual = (ui.edit.managedManual || []).filter(item => item !== key); render(); },
  'v2-login': () => window.open('./login.html', '_blank', 'noopener')
});

const v2OriginalSubmitDialog = submitDialog;
submitDialog = function (form) {
  const modal = ui.modal, d = modal.draft, r = val(modal.id), data = new FormData(form);
  const text = name => String(data.get(name) || '').trim();
  if (!modal.type.startsWith('v2-')) return v2OriginalSubmitDialog(form);
  let message = '已保存';
  switch (modal.type) {
    case 'v2-scheduling': {
      if (!v2ReadyForSchedule(r)) return error('物料、正片审核通过且有授权书后才能排播');
      if (v2AwaitingSchedule(r) && v2LaunchTime(r)) return error('已填写上线时间，请返回列表点击确认');
      if (!v2ValidScheduleDate(text('launch'), true)) return error('请选择完整的上线日期和时分。');
      if (text('freeTime') && !v2ValidScheduleDate(text('freeTime'), true)) return error('请选择完整的转免日期和时分。');
      const pending = v2AwaitingSchedule(r);
      v2CompleteSchedule(r, text('launch'), text('freeTime'));
      message = pending ? '上线时间已确认，已流转至渠道负责人阶段' : '排播时间已更新'; break;
    }
    case 'v2-submit': {
      if (!d.intent.length) return error('请至少选择一个意向发行渠道。');
      if (d.intent.includes('海外 YouTube') && !['是', '否'].includes(text('youtubeFirst'))) return error('请选择海外YouTube是否首发。');
      if (Array.from(text('intro')).length > 1000) return error('剧集简介不能超过1000字。');
      const supplier = v2Supplier({ supplierId: ui.supplierId });
      const next = r ? structuredClone(r) : newRecord(Math.max(...records.map(r => r.id)) + 1);
      if (r) next.qualityHistory.unshift({ time: now(), action: '供应商修改后重提', snapshot: { tasks: structuredClone(r.qualityTasks), final: r.qualityFinal } });
      Object.assign(next, { name: text('name'), episodes: Number(data.get('episodes')), link: text('link'), type: text('type'), round: text('round'), intro: text('intro'), youtubeFirst: d.intent.includes('海外 YouTube') ? text('youtubeFirst') : '',
        intent: [...d.intent], exclude: d.intent.includes('国内渠道') ? [...d.exclude] : [], supplierId: supplier.id, supplier: supplier.name, businessOwner: supplier.business, contact: v2User(supplier.business)?.name || '', submitted: now(), quality: '待评估', qualityFinal: null, groups: ['', '', ''], reviews: [], qualityTasks: [], qualityHistory: next.qualityHistory || [], episodeFiles: next.episodeFiles || [], channelReturns: next.channelReturns || {}, customMaterials: next.customMaterials || {}, orientation: next.orientation || '横屏' });
      next.qualityTasks = v2MakeTasks(next); const missing = next.intent.filter(c => !next.qualityTasks.some(t => t.channel === c)); if (missing.length) return error('请先配置这些渠道的质量评估人员：' + missing.join('、'));
      if (!r) records.unshift(next); else Object.assign(r, next); message = '剧集已提交'; break;
    }
    case 'v2-quality-result': {
      const task = r.qualityTasks.find(t => t.id === modal.taskId);
      if (!task || task.result || task.userId !== ui.qualityActor) return error('当前人员没有该项待处理评估。');
      if (!text('opinion')) return error('请填写评估意见。');
      Object.assign(task, { result: text('result'), opinion: text('opinion'), time: now() });
      r.qualityHistory.unshift({ time: now(), action: task.channel + '提交' + task.result, snapshot: { ...task } }); message = '渠道评估意见已提交'; break;
    }
    case 'v2-business-final':
      if (!v2QualityReady(r) || r.qualityFinal) return error('当前不满足提交最终反馈的条件。');
      if (!text('opinion')) return error('请填写反馈意见。');
      r.qualityFinal = { result: text('result'), opinion: text('opinion'), actor: '管理员兼商务', time: now() }; r.quality = text('result'); r.qualityHistory.unshift({ time: now(), action: '商务提交最终反馈：' + r.quality, snapshot: { ...r.qualityFinal } }); message = '最终反馈已提交'; break;
    case 'v2-film-upload': {
      if (!d.files.length) return error('请至少选择一个新视频。');
      const merged = [...new Map([...r.episodeFiles, ...d.files].map(e => [e.index, e])).values()].sort((a, b) => a.index - b.index);
      if (merged.some((e, index) => e.index !== index + 1)) return error('请保持集序从第1集开始连续排列。');
      if (r.episodeFiles.some(e => e.result === '驳回' && !d.files.some(f => f.index === e.index))) return error('请替换所有被驳回的分集后重提。');
      const main = v2Config.users.filter(u => u.roles.includes('正片审核人员'));
      if (!main.length) return error('请先配置参与自动分配的正片审核人员。');
      r.episodeHistory ||= []; d.files.forEach(file => { const old = r.episodeFiles.find(e => e.index === file.index); if (old) r.episodeHistory.push({ ...old, archivedAt: now() }); });
      r.episodeFiles = merged; r.episodes = merged.length; if (!v2User(r.filmReviewer)?.roles.includes('正片审核人员')) r.filmReviewer = main[0].id; r.filmStatus = '审核中'; r.filmRound = { submitted: now(), number: (r.filmRound?.number || 0) + 1, ids: d.files.map(e => e.id), kind: r.filmRound ? '复审' : '初审' }; message = '正片已提交审核'; break;
    }
    case 'v2-assign-film': if (!v2User(text('reviewer'))?.roles.includes('正片审核人员')) return error('请选择正片审核人员。'); r.filmReviewer = text('reviewer'); message = '审核人员已调配'; break;
    case 'v2-supplier': {
      const s = v2Config.suppliers.find(s => s.id === modal.supplierId);
      if (v2Config.suppliers.some(other => other.id !== s.id && (other.account === text('account') || other.phone === text('phone')))) return error('账号或手机号已被其他供应商使用。');
      Object.assign(s, { business: text('business'), account: text('account'), phone: text('phone') });
      if (text('password')) s.password = text('password'); v2SaveConfig(); break;
    }
    case 'v2-user': { const u = v2User(modal.userId); const roles = data.getAll('roles'), channels = roles.includes('内容质量评估') ? data.getAll('channels') : []; if (!roles.length) return error('请至少选择一个角色。'); if (roles.includes('内容质量评估') && !channels.length) return error('请配置负责质量评估的渠道。'); Object.assign(u, { name: text('displayName'), roles, channels }); v2SaveConfig(); break; }
    case 'v2-field': {
      const channels = data.getAll('channels'); if (!channels.length) return error('请选择关联渠道。');
      if (v2Config.fields.some(f => f.key !== modal.fieldKey && f.active && f.name === text('fieldName'))) return error('已有同名物料字段。');
      const field = { key: modal.fieldKey || 'custom-' + crypto.randomUUID(), name: text('fieldName'), component: text('component'), channels, condition: text('condition'), required: data.has('required'), hint: text('hint'), group: '合规文件', active: true };
      if (modal.fieldKey) Object.assign(v2Config.fields.find(f => f.key === modal.fieldKey), field); else v2Config.fields.push(field); v2SaveConfig(); message = '字段配置已生效'; break;
    }
    case 'v2-channel': {
      const name = text('channelName'); if (!name || name === '支付宝' || v2Config.channels.some(c => c.name === name)) return error('渠道名称为空、重复或已停用。');
      v2Config.channels.push({ id: crypto.randomUUID(), name, market: text('market'), active: true }); v2SaveConfig(); break;
    }
    case 'v2-auth':
      if ([STAGES[1], STAGES[2], STAGES[3]].includes(r.stage) && !d.files.length) return error('该合集已进入后续环节，请保留至少一份有效授权书。');
      r.authorization = d.files;
      syncBusiness(r); message = '授权书已保存'; break;
    case 'v2-channel-edit': {
      if (modal.channel !== ui.channel || !['channel', 'operator'].includes(ui.detailFrom) || !v2ChannelList(r).includes(modal.channel)) return error('当前身份无法修改。');
      if (modal.wechatWritable && !canEditWechat(r)) return error('送审情况填写权限已变化，请关闭后重新打开。');
      const contentId = text('contentId'), idChanged = contentId !== modal.originalContentId;
      if (contentId.length > 100 || idChanged && !contentId) return error('请填写渠道内容ID，最多100字。');
      const status = modal.wechatWritable ? text('status') : r.wechat?.status || '';
      const time = modal.wechatWritable && status === '已送审' ? text('time').replace('T', ' ') : '';
      const statusChanged = modal.wechatWritable && (status !== (r.wechat?.status || '') || time !== (r.wechat?.time || ''));
      if (statusChanged && (!WECHAT.includes(status) || status === '已送审' && (!time || !v2ValidScheduleDate(time, true)))) return error('请选择送审情况，已送审时请补齐送审时间。');
      if (!idChanged && !statusChanged) { closeModal(); announce('未修改渠道信息'); return; }
      if (idChanged) (r.channelContentIds ||= {})[modal.channel] = contentId;
      if (statusChanged) {
        if (r.wechat) (r.wechatHistory ||= []).unshift({ ...r.wechat, changedAt: now() });
        r.wechat = { status, time };
        recordLog(r, '送审情况更新为' + status + (time ? ' · ' + time : ''));
      }
      message = '渠道信息已保存'; break;
    }
    case 'v2-channel-id':
      if (modal.channel !== ui.channel || !['channel', 'operator'].includes(ui.detailFrom)) return error('当前身份无法修改。');
      (r.channelContentIds ||= {})[modal.channel] = text('contentId'); message = '渠道内容ID已保存'; break;
    case 'v2-channel-reject': {
      if (!v59CanOperate(r, modal.channel)) return error('无本渠道操作权限。');
      const ids = data.getAll('episodeIds'); if (!ids.length) return error('请至少选择一个分集。');
      if (ids.some(id => !v59ChannelEpisodes(r, modal.channel).some(ep => ep.id === id))) return error('渠道分集已更新，请重新打开。');
      if (ids.some(id => !text('opinion-' + id))) return error('请为每个选中分集填写本渠道意见。');
      const list = r.channelReturns[modal.channel] ||= [];
      ids.forEach(id => {
        const ep = v59ChannelEpisodes(r, modal.channel).find(e => e.id === id);
        const existing = list.find(e => e.episodeId === id && ['待修改', '待复核'].includes(e.status));
        const item = { episodeId: id, index: ep.index, opinion: text('opinion-' + id), status: '待修改', time: now(), actor: r.assignment[modal.channel] };
        if (existing) { (existing.history ||= []).push({ ...existing, history: undefined }); Object.assign(existing, item); }
        else list.push(item);
      }); message = '选中分集已驳回，可继续处理其他分集'; break;
    }
    case 'v2-channel-feedback': return v59SubmitChannelFilm(modal);
    case 'v2-channel-material-reject': {
      if (!v59CanOperate(r, modal.channel)) return error('无本渠道操作权限。');
      if (!text('opinion')) return error('请填写物料修改意见。');
      const old = r.channelMaterialReturns?.[modal.channel];
      (r.channelMaterialReturns ||= {})[modal.channel] = { status: '待修改', opinion: text('opinion'), time: now(), actor: r.assignment[modal.channel], history: old ? [...(old.history || []), { ...old, history: undefined }] : [] };
      message = '本渠道物料已驳回'; break;
    }
    case 'v2-managed-rules': v2Config.managedSkipFields = data.getAll('skipFields').filter(key => V2_REUSE_FIELDS.some(([id]) => id === key)); v2Config.managedRulesEnabled = data.has('enabled'); v2SaveConfig(); break;
    default: return;
  }
  persist(); closeModal(); announce(message);
};

root.addEventListener('input', event => {
  const f = event.target;
  if (f.dataset.v2EpisodeOpinion) ui.filmDraft[f.dataset.v2EpisodeOpinion].opinion = f.value;
  if (ui.modal?.type === 'v2-submit' && f.name && !['checkbox', 'file'].includes(f.type)) ui.modal.draft[f.name] = f.value;
  if (ui.view === 'materialsV2') v2ReadMaterial();
});
function v2ReadMaterial() {
  const form = root.querySelector('[data-v2-form="material"]'); if (!form || !ui.edit) return;
  const data = new FormData(form), r = ui.edit;
  r.type = String(data.get('v2type')); r.round = String(data.get('v2round')); r.orientation = String(data.get('orientation')); if (!r.channelReworkMode) r.release = data.getAll('v2release');
  if (data.has('v2contract')) r.contract = String(data.get('v2contract'));
  r.materialExtras ||= {}; [0, 1].forEach(i => r.materialExtras['actorBio' + i] = String(data.get('actorBio' + i) || ''));
  ['synopsis', 'filmLink', 'partner', 'contact'].forEach(key => { if (data.has(key)) r[key] = String(data.get(key)); });
  if (data.has('supplierDate')) v2SetSupplierLaunchTime(r, data.get('supplierDate'));
  form.querySelectorAll('[data-v2-extra]').forEach(f => r.materialExtras[f.dataset.v2Extra] = f.value);
  form.querySelectorAll('[data-v2-material-value]').forEach(f => r.customMaterials[f.dataset.v2MaterialValue] = f.value);
}
root.addEventListener('change', async event => {
  const f = event.target;
  if (ui.modal?.type === 'v2-channel-edit' && f.name === 'status') { ui.modal.draft.status = f.value; if (f.value !== '已送审') ui.modal.draft.time = ''; render(); return; }
  if (f.dataset.v2Switch) { ui[f.dataset.v2Switch] = f.value; render(); }
  if (f.dataset.v2Supplier) { ui.supplierId = f.value; render(); }
  if (f.hasAttribute('data-v2-speed')) { const video = root.querySelector('#v2-player'); if (video) { ui.filmSpeed = Number(f.value); video.playbackRate = ui.filmSpeed; } }
  if (f.dataset.v2ExportId) { f.checked ? ui.exportIds.add(Number(f.dataset.v2ExportId)) : ui.exportIds.delete(Number(f.dataset.v2ExportId)); render(); }
  if (ui.modal?.type === 'v2-submit' && f.type === 'checkbox') {
    const form = f.closest('form'), data = new FormData(form); ui.modal.draft.intent = data.getAll('intent'); ui.modal.draft.exclude = ui.modal.draft.intent.includes('国内渠道') ? data.getAll('exclude') : []; render();
  }
  if (ui.modal?.type === 'v2-supplier' && f.name === 'managed') { const form = f.closest('form'); for (const [key, value] of new FormData(form)) ui.modal.draft[key] = value; ui.modal.draft.managed = f.checked; render(); }
  if (ui.view === 'materialsV2' && ['v2type', 'v2release', 'orientation', 'v2contract'].includes(f.name)) { v2ReadMaterial(); render(); }
  if (!f.dataset.v2Upload) return;
  event.stopImmediatePropagation();
  const files = [...f.files]; if (!files.length) return;
  try {
    if (f.dataset.v2Upload === 'channel-film') return await v59UploadChannelFilm(f, files);
    if (f.dataset.v2Upload === 'film') {
      const file = files[0], metadata = await v2VideoMetadata(file), r = val(ui.modal.id);
      const index = f.dataset.v2Upload === 'film' ? Number(f.dataset.v2Key) : r.episodeFiles.find(e => e.id === f.dataset.v2Key.split('|')[1])?.index;
      const old = r.episodeFiles.find(e => e.index === index), meta = await v2Remember(file, { ...metadata, index, version: (old?.version || 0) + 1, result: '', opinion: '' });
      if (f.dataset.v2Upload === 'film') { ui.modal.draft.files = ui.modal.draft.files.filter(e => e.index !== index); ui.modal.draft.files.push(meta); }
      else { const [encodedChannel, id] = f.dataset.v2Key.split('|'); ui.modal.draft.files[decodeURIComponent(encodedChannel) + '|' + id] = meta; }
    } else if (f.dataset.v2Upload === 'auth') {
      if (files.some(file => !/\.(pdf|docx?)$/i.test(file.name))) throw Error('授权书只支持Word或PDF');
      if (files.some(file => file.size > v2Config.authorizationLimitMB * 1024 * 1024)) throw Error('授权书单文件不能超过100MB');
      if (files.reduce((sum, file) => sum + file.size, 0) > v2Config.authorizationTotalMB * 1024 * 1024) throw Error('单次上传合计不能超过500MB');
      for (const file of files) ui.modal.draft.files.push(await v2Remember(file));
    } else {
      if (!ui.edit || val(ui.edit.id)?.filmStatus !== '通过') throw Error('待正片审核通过后上传物料');
      const key = f.dataset.v2Key, field = v2Config.fields.find(field => field.key === key);
      for (const file of files) { if (field?.component === '图片上传' && !file.type.startsWith('image/') && !/\.pdf$/i.test(file.name)) throw Error('此字段支持图片和PDF'); (ui.edit.materials[key] ||= []).push(await v2Remember(file)); }
    }
    render(); announce('文件已添加');
  } catch (e) { announce(e.message); }
}, true);
root.addEventListener('submit', event => {
  if (!event.target.dataset.v2Form) return;
  event.preventDefault(); event.stopImmediatePropagation(); v2ReadMaterial();
  const r = ui.edit, submit = event.submitter?.value === 'submit';
  if (val(r.id)?.filmStatus !== '通过') return error('待正片审核通过后上传物料', '#v2-material-error');
  if (submit) {
    if (r.filmStatus !== '通过') return error('请先完成正片审核。', '#v2-material-error');
    if (!r.release.length) return error('请选择发行渠道。', '#v2-material-error');
    const missing = v2FieldsFor(r).filter(f => f.required && (f.component.includes('上传') ? !r.materials[f.key]?.length : !r.customMaterials[f.key]?.trim()));
    if (missing.length) return error('请补充：' + missing.map(f => f.name).join('、'), '#v2-material-error');
    if (!r.channelReworkMode) { r.materialStatus = '审核中'; r.materialSubmitted = now(); }
  }
  if (r.channelReworkMode) return v59SaveChannelMaterial(r, submit);
  const saved = structuredClone(r); delete saved.channelReworkMode; delete saved.reworkChannels;
  Object.assign(val(r.id), saved); persist(); if (submit) { ui.edit = null; navigate('supplierContent'); } else render(); announce(submit ? '物料已提交审核' : '物料草稿已保存');
}, true);
