const v2Badge = text => '<span class="tag blue">' + esc(text) + '</span>';
const V2_EVALUATION_TABS = [['qualityV2', '内容质量评估'], ['eval', '内容评估']];
const v2SupplierLabel = r => esc(v2Supplier(r).name);
const v2Area = (title, body, number) => '<section class="panel v2-section"><header><h2>' + esc(title) + (number ? ' ' + mark(number) : '') + '</h2></header>' + body + '</section>';
const v2Checks = (name, values, selected = []) => checkList(name, values, selected);
const v2Label = (text, body, required = false) => formField(text, body, required);
const v2FileList = (items = [], removeAction = '', prefix = '') => items.length ? '<ul class="v2-files">' + items.map((file, index) => '<li><span>▤ ' + esc(file.name) + '</span><div class="actions">' + act('下载', 'v2-download', encodeURIComponent(JSON.stringify(file))) + (removeAction ? act('删除', removeAction, prefix + index) : '') + '</div></li>').join('') + '</ul>' : '<p class="muted">暂无文件</p>';
const v2Upload = (key, items, label = '上传文件', accept = '', action = 'v2-file') => '<label class="btn upload-label">＋ ' + esc(label) + '<input type="file" data-v2-upload="' + action + '" data-v2-key="' + esc(key) + '" multiple' + (accept ? ' accept="' + esc(accept) + '"' : '') + '></label>' + v2FileList(items, 'v2-remove-material', key + ':');
function v2Overview() {
  const rows = [
    ['供应商管理', '绑定负责商务、修改账号／手机号及密码登录', 'suppliersV2'],
    ['内容质量评估', '5类内容、发行轮次、简介、YouTube首发、分渠道评估与商务反馈', 'qualityV2'],
    ['内容评估', '仅改集数复用意见、未出最终结果可改意见、重提标签（待补原型）', 'eval'],
    ['正片与商务并行', '正片选择发行渠道、展示五类意见、商务确认渠道（待补原型）', 'supplierContent'],
    ['物料填写', '支付宝删除、优酷文件、原文件名、梗概及成片字段关联', 'supplierContent'],
    ['正片审核', '备选人员、常驻备注、最终确认、720尺寸、2.5倍速及审核时长', 'filmAuditV2'],
    ['商务面板与授权书', '双角色共存、授权书删除和放宽大小、各评估组状态', 'business'],
    ['排播', '双审与授权书齐备；已有上线时间确认，未填时补充', 'schedule'],
    ['渠道运营', '内容ID修改、分集驳回、复制、新窗口下载及全渠道名称', 'operator'],
    ['管理员导出', '批量导出合集全部业务字段', 'exportV2']
  ].map(([name, text, target]) => line(esc(name), esc(text), act('查看页面', 'nav', target)));
  return heading('V2 需求总览') + '<p class="v2-intro">业务范围：代发行优化v1.3 · 独立本地版本 · 通知由技术处理</p>' + listing('本期业务模块', ['模块', '本期要求', '操作'], rows, '', { note: 1 }) +
    v2Area('待核对事项', '<ul class="v2-pending"><li>物料黄标表、剧集梗概海外关联图片、B站及净版／字幕字段映射。</li><li>质量评估撤回边界、国内多评估员完成口径、授权书上限及优酷模板原件。</li><li>原型缺项见范围核对说明，不以现有演示替代本期完整需求。</li></ul>', 2);
}
function v2SupplierEvaluation() {
  const items = filtered(records.filter(r => v2Supplier(r).id === ui.supplierId), r => v2QualityStatus(r));
  return heading('内容评估') + filters([['name', '合集名称'], ['status', '质量评估状态', ['评估中', '待商务反馈', '通过', '驳回']]]) +
    listing('评估记录', ['ID', '合集名称', '内容类型', '意向渠道', '内容质量评估状态', '内容评估状态', '操作 ' + mark(2)], items.map(r => line(esc(r.id), esc(r.name), esc(r.type), intentChannels(r), tag(v2QualityStatus(r)), tag(r.quality === '通过' ? combined(r) : '待质量评估'),
      buttons(act('查看评估意见', 'v2-opinions', r.id), v2QualityStatus(r) === '驳回' ? act('修改后重提', 'submit', r.id) : ''))), mark(1) + act('＋ 提交剧集信息', 'submit', '', 'btn primary'));
}
function v2SupplierContent() {
  const rows = filtered(records.filter(r => v2Supplier(r).id === ui.supplierId && r.quality === '通过' && combined(r) === '通过')).map(r => line(esc(r.id), esc(r.name), esc(r.episodes), tag(r.filmStatus), tag(r.materialStatus), tag(v2FlowStage(r) || '交付中'), buttons(
    r.filmStatus !== '通过' ? act(r.filmStatus === '驳回' ? '替换并重提正片' : '上传正片', 'v2-film-upload', r.id) : '',
    r.filmStatus === '通过' && ['待提交', '拒绝'].includes(r.materialStatus) ? act('填写物料', 'v2-material', r.id) : '',
    r.filmStatus === '通过' && Object.values(r.channelMaterialReturns || {}).some(item => item.status === '待修改') ? act('修改渠道物料', 'v2-material-channel', r.id) : '',
    r.filmStatus !== '通过' ? '<button type="button" class="link disabled-action" aria-disabled="true" data-act="v2-material" data-id="' + r.id + '">填写物料</button>' : '',
    act('查看交付记录', 'v2-delivery', r.id), Object.values(r.channelReturns).some(list => list.length) || Object.keys(r.channelMaterialReturns || {}).length ? act('渠道修改意见', 'v2-channel-feedback', r.id) : '')));
  return heading('内容管理') + filters([['name', '合集名称'], ['film', '正片状态', ['待提交', '审核中', '通过', '驳回']], ['material', '物料状态', ['待提交', '审核中', '通过', '拒绝']]]) +
    listing('合集列表', ['ID', '合集名称', '集数', '正片审核状态', '物料审核状态', '发行进度', '操作 ' + mark(1)], rows);
}
function v2Quality() {
  const actors = v2Config.users.filter(u => u.roles.includes('内容质量评估'));
  const actor = actors.find(u => u.id === ui.qualityActor) || actors[0];
  if (actor) ui.qualityActor = actor.id;
  const rows = filtered(records.filter(r => r.qualityTasks.some(t => t.userId === actor?.id)), v2QualityStatus).map(r => {
    const tasks = r.qualityTasks.filter(t => t.userId === actor?.id);
    return line(esc(r.id), esc(r.name), v2SupplierLabel(r), esc(r.type), intentChannels(r), esc(r.round), esc(r.youtubeFirst || '—'),
      tasks.map(t => '<div class="v2-task-state">' + esc(t.channel) + ' ' + tag(t.result || '待评估') + '</div>').join('') || '—', tag(v2QualityStatus(r)),
      buttons(...tasks.map(t => t.result ? t.result === '驳回' && !r.qualityFinal ? act('撤回驳回', 'v2-withdraw-quality', r.id + '|' + t.id) : '' : act('评估' + t.channel, 'v2-quality-result', r.id + '|' + t.id)), act('查看意见', 'v2-opinions', r.id)));
  });
  return heading('内容评估') + tabs(V2_EVALUATION_TABS, ui.view, 'nav') + '<div class="v2-role-line"><label>当前评估人员 <select data-v2-switch="qualityActor">' + actors.map(u => '<option value="' + u.id + '"' + (actor?.id === u.id ? ' selected' : '') + '>' + esc(u.name) + '</option>').join('') + '</select></label><span>负责渠道：' + esc(actor?.channels.join('、') || '未配置') + '</span></div>' +
    filters([collectionFilter, ['status', '质量评估状态', ['评估中', '待商务反馈', '通过', '驳回']]]) +
    listing('质量评估列表', ['ID', '合集名称', '供应商', '内容类型', '意向渠道', '发行轮次', 'YouTube是否首发', '本人渠道评估', '质量评估状态', '操作 ' + mark(2)], rows, '', { className: 'v2-wide-table', note: 1 });
}
function v2Business() {
  const rows = filtered(records, v2QualityStatus).map(r => line(esc(r.id), esc(r.name), v2SupplierLabel(r), tag(v2QualityStatus(r)), ...GROUPS.map((_, i) => tag(groupStatus(r, i))), tag(r.filmStatus), tag(r.materialStatus), tag(v2FlowStage(r) || '—'),
    buttons(act('评估意见', 'v2-opinions', r.id), !r.qualityFinal && v2QualityReady(r) ? act('最终反馈', 'v2-business-final', r.id) : '', r.stage || combined(r) === '通过' ? act('维护授权书', 'v2-auth', r.id) : '')));
  return heading('商务负责人') + filters([collectionFilter, supplierFilter]) + listing('剧集列表', ['ID', '合集名称', '供应商', '内容质量评估', ...GROUPS, '正片审核状态', '物料审核状态', '进度', '操作 ' + mark(2)], rows, '', { className: 'v2-wide-table', note: 1 });
}
function v2Schedule() {
  const items = filtered(records.filter(v2ReadyForSchedule), r => v2AwaitingSchedule(r) ? '待设置' : '已设置');
  const rows = items.map(r => {
    const pending = v2AwaitingSchedule(r), supplied = v2LaunchTime(r);
    const when = supplied ? timestamp(supplied) + (pending ? '<span class="subline">' + tag('待确认') + '</span>' : '') : tag('待填写');
    return line(esc(r.id), esc(r.name), v2SupplierLabel(r), when, timestamp(v2FreeTime(r)), buttons(
      act('审核记录', 'history', r.id), pending && supplied ? act('确认', 'v2-schedule-confirm', r.id) : act('设置上线时间', 'scheduling', r.id)));
  });
  return heading('排播上线负责人') + filters([supplierFilter, collectionFilter, ['status', '上线时间设置', ['待设置', '已设置']], ...reviewerFilters, ['channelLead', '渠道负责人', ['示例负责人']]]) +
    listing('剧集列表', ['ID', '剧集名称', '供应商', '上线时间', '转免时间', '操作 ' + mark(2)], rows, '', { note: 1 });
}
function v2FilmQueue() {
  const rows = filtered(records.filter(r => r.episodeFiles.length)).map(r => line(esc(r.id), esc(r.name), v2SupplierLabel(r), esc(r.episodeFiles.length), tag(r.filmStatus), esc(r.filmRound?.kind || '—'), v2Duration(v2RoundDuration(r)), esc(v2User(r.filmReviewer)?.name || '待分配'),
    buttons(r.filmStatus === '审核中' ? act('开始审核', 'v2-review-film', r.id) : act('查看审核', 'v2-review-film', r.id), act('调配审核人员', 'v2-assign-film', r.id))));
  return heading('正片审核负责人') + filters([collectionFilter]) + listing('正片审核列表', ['ID', '合集名称', '供应商', '集数', '审核状态', '本轮类型', '本次审核总时长', '审核人员', '操作 ' + mark(2)], rows, '', { note: 1 });
}
function v2FilmReview() {
  const r = val(ui.selected), ids = r.filmRound?.ids || r.episodeFiles.map(e => e.id);
  const episode = r.episodeFiles.find(e => e.id === ui.episodeId) || r.episodeFiles[0];
  if (!episode) return heading('正片审核', '', 'v2-review-back') + '<p>暂无正片文件</p>';
  const draft = ui.filmDraft ||= Object.fromEntries(r.episodeFiles.map(e => [e.id, { result: e.result || '', opinion: e.opinion || '' }]));
  const state = draft[episode.id], writable = r.filmStatus === '审核中' && ids.includes(episode.id);
  return heading('正片审核 · ' + r.name, '', 'v2-review-back') +
    '<div class="panel v2-audit-summary"><strong>' + esc(r.filmRound?.kind || '已完成审核') + '</strong><span>本次审核 ' + ids.length + ' 集</span><span class="changed-field">本次审核总时长 ' + v2Duration(v2RoundDuration(r)) + '</span>' + mark(1) + '<span>审核人员：' + esc(v2User(r.filmReviewer)?.name || '待分配') + '</span></div>' +
    '<div class="v2-film-layout"><aside class="panel v2-episode-list"><h2>剧集列表</h2>' + r.episodeFiles.map(e => '<button class="episode-button' + (e.id === episode.id ? ' active' : '') + '" data-act="v2-episode" data-id="' + e.id + '"><span>第' + e.index + '集' + (ids.includes(e.id) ? '' : ' · 非本轮') + '</span>' + tag(draft[e.id].result || '待审核') + '</button>').join('') + '</aside>' +
    '<section class="panel v2-player-panel"><div class="v2-player-toolbar"><strong>第' + episode.index + '集 · V' + episode.version + '</strong><label>播放倍速 <select data-v2-speed>' + [0.5, 1, 1.5, 2, 2.5].map(n => opt(n, 1)).join('') + '</select></label></div>' +
    '<video id="v2-player" data-episode-id="' + esc(episode.id) + '" controls preload="auto"' + (episode.url || ui.filmUrls?.[episode.id] ? ' src="' + esc(episode.url || ui.filmUrls[episode.id]) + '"' : '') + '></video><div class="muted">' + episode.width + '×' + episode.height + ' · ' + v2Duration(episode.duration) + '</div>' +
    '<div class="actions v2-review-actions">' + (writable ? act('单集通过', 'v2-episode-pass', episode.id, 'btn primary') + act('单集驳回', 'v2-episode-reject', episode.id, 'btn') : tag(state.result || '本轮无需审核')) + '</div></section>' +
    '<aside class="panel v2-review-opinion"><h2>' + fieldName('单集审核备注') + ' ' + mark(2) + '</h2><label>第' + episode.index + '集<textarea rows="9" data-v2-episode-opinion="' + episode.id + '" placeholder="审核时可随时填写；单集驳回必须有备注"' + (!writable ? ' readonly' : '') + '>' + esc(state.opinion) + '</textarea></label><p class="muted">单集结果在最终确认前可继续修改。</p><p class="error" id="v2-film-error" role="alert"></p></aside></div>' +
    '<footer class="panel v2-audit-footer"><span>本轮通过 ' + ids.filter(id => draft[id]?.result === '通过').length + ' / ' + ids.length + ' 集</span><div class="actions">' + mark(3) + act('返回列表', 'v2-review-back', '', 'btn') + (r.filmStatus === '审核中' ? act('完成审核', 'v2-finish-film', r.id, 'btn primary') : '') + '</div></footer>';
}
function v2Material() {
  const r = ui.edit;
  v2ApplySource(r);
  const extra = r.materialExtras ||= {}, applicable = v2FieldsFor(r);
  const extraField = (key, label, type = 'text') => formField(label, input('extra-' + key, extra[key] || '', '', type, 'data-v2-extra="' + key + '"' + (v2SourceText(r, 'extra-' + key) ? ' readonly' : '')) + v2SourceHint(r, 'extra-' + key));
  const extraArea = (key, label) => formField(label, '<textarea rows="3" data-v2-extra="' + key + '"' + (v2SourceText(r, 'extra-' + key) ? ' readonly' : '') + '>' + esc(extra[key] || '') + '</textarea>' + v2SourceHint(r, 'extra-' + key));
  const baseFile = (key, label) => '<div class="v2-dynamic-field"><strong>' + esc(label) + '</strong>' + v2Upload(key, r.materials[key]) + '</div>';
  const plot = v2Area('剧情文案', extraField('intro', '10字以内剧集简介') + formField('550-1000字剧集梗概', '<textarea name="synopsis" rows="5"' + (v2SourceText(r, 'synopsis') ? ' readonly' : '') + '>' + esc(r.synopsis) + '</textarea>' + v2SourceHint(r, 'synopsis')) + extraArea('shortSynopsis', '100-200字剧集梗概') + extraArea('recommendation', '剧集推荐文案') + extraField('tags', '剧集标签'));
  const filing = v2Area('备案信息', '<div class="three-fields">' + extraField('cost', '剧集制作成本', 'number') + extraField('actorCost', '演员总片酬占比', 'number') + extraField('leadCost', '主要演员片酬占比', 'number') + '</div>' + baseFile('costReport', '真人短剧成本配置比例报告'));
  const cast = ['男主', '女主'].map((name, i) => '<h3 class="v2-subtitle">' + name + '角信息</h3><div class="two-fields">' + extraField('actorName' + i, name + '真实姓名') + extraField('roleName' + i, name + '饰演角色名') + '</div>' + formField(name + '简介', '<textarea name="actorBio' + i + '"' + '' + ' rows="4" placeholder="请输入简介"' + (v2SourceText(r, 'actorBio' + i) ? ' readonly' : '') + '>' + esc(extra['actorBio' + i] || '') + '</textarea>' + '' + v2SourceHint(r, 'actorBio' + i)) + extraArea('roleBio' + i, name + '饰演角色简介') + baseFile('actorPhoto' + i, name + '照片') + baseFile('actorStill' + i, name + '演剧照')).join('');
  const crew = v2Area('主创团队', extraField('company', '承制公司') + extraField('producer', '制片人真实姓名') + ['导演', '编剧'].map((name, i) => '<div class="two-fields">' + extraField('crewName' + i, name + '真实姓名') + extraField('crewGender' + i, name + '性别') + '</div>' + extraArea('crewBio' + i, name + '简介') + baseFile('crewPhoto' + i, name + '照片')).join(''));
  const assets = v2Area('成片素材', formField('全集资源', input('filmLink', r.filmLink || '', '网盘地址', 'url')) + extraField('previewLink', '试看链接', 'url') + extraField('highlightLink', '高光素材链接', 'url') + baseFile('posterHorizontal', '横版剧集海报') + baseFile('posterVertical', '竖版剧集海报') + extraField('aiEpisodes', 'AI具体集数'));
  const fields = applicable.map(f => '<div class="v2-dynamic-field"><label><strong>' + (f.required ? '<b class="required">*</b>' : '') + fieldName(f.name) + '</strong></label>' +
    (f.hint ? '<p class="field-hint">' + esc(f.hint) + '</p>' : '') +
    (f.template ? '<p class="field-hint">模板：' + esc(f.template) + ' <span class="muted">（原件待提供）</span></p>' : '') +
    (f.component.includes('上传') ? v2Upload(f.key, r.materials[f.key], '上传' + (f.component === '图片上传' ? '图片 / PDF' : '文件'), f.component === '图片上传' ? 'image/*,.pdf' : '') : '<textarea data-v2-material-value="' + f.key + '" rows="3">' + esc(r.customMaterials[f.key] || '') + '</textarea>') + '</div>').join('');
  return heading('填写物料 · ' + r.name, '', 'v2-material-back') + '<div class="v2-flow-steps">① 正片审核已通过 <span>→</span><strong>② 填写物料</strong><span>→</span>③ 物料审核</div>' +
    '<form data-v2-form="material" class="v2-editor">' + v2Area('基础信息', '<div class="three-fields">' + formField('内容类型', select('v2type', V2_TYPES, r.type)) + formField('发行轮次', select('v2round', ['首发', '二轮'], r.round)) + formField('画面方向', select('orientation', ['横屏', '竖屏'], r.orientation || '横屏')) + '</div><div class="field"><span>' + fieldName('发行渠道') + '</span>' + v2Checks('v2release', v2Release(), r.release) + '</div><div class="two-fields">' + formField('合作方名称', input('partner', r.partner)) + formField('对接商务', input('contact', r.contact)) + formField('剧集首发时间', v2SupplierDateInput(r)) + extraField('paidEpisodes', '剧集付费集数', 'number') + extraField('duration', '平均单集时长') + extraField('audience', '男女频') + '</div>', 1) + plot + filing +
    v2Area('角色资料', cast, 2) + crew + assets +
    v2Area('合规文件', (v2ContractVisible(r) ? formField('制作合同', select('v2contract', ['有', '无'], r.contract)) : '') + fields + (!applicable.length ? '<p class="muted">当前渠道及条件下暂无适用字段，可在物料字段配置中维护。</p>' : ''), 3) +
    '<div class="panel v2-form-footer"><p id="v2-material-error" class="error" role="alert"></p><div class="actions">' + mark(4) + '<button type="submit" name="saveMode" value="draft" class="btn">保存草稿</button><button type="submit" name="saveMode" value="submit" class="btn primary">提交物料审核</button></div></div></form>';
}
function v2Suppliers() {
  return heading('供应商管理') + listing('供应商列表', ['供应商名称', '负责商务', '登录账号', '绑定手机号', '操作 ' + mark(2)], v2Config.suppliers.map(s => line(esc(s.name), esc(v2User(s.business)?.name || '未绑定'), esc(s.account), esc(s.phone || '—'), act('编辑', 'v2-supplier-edit', s.id))), act('演示账号登录', 'v2-login', '', 'btn'), { note: 1 });
}
function v2Personnel() {
  return heading('人员权限配置') + listing('人员列表', ['姓名', '角色', '负责评估渠道', '正片自动分配', '操作 ' + mark(2)], v2Config.users.map(u => line(esc(u.name), esc(u.roles.join('、')), esc(u.channels.join('、') || '—'), u.roles.includes('正片审核人员') ? tag(u.backup ? '仅手动调配' : '参与自动分配') : '—', act('配置', 'v2-user-edit', u.id))), '', { note: 1 });
}
function v2MaterialConfig() {
  const mode = ui.configTab || '物料字段';
  const content = mode === '发行渠道' ? listing('渠道列表', ['渠道名称', '状态', '操作 ' + mark(2)], v2Config.channels.map(c => line(esc(c.name), tag(c.active ? '启用' : '已删除'), buttons(c.active ? act('删除', 'v2-channel-delete', c.id) : act('恢复', 'v2-channel-restore', c.id)))), act('新增渠道', 'v2-channel-new', '', 'btn primary'), { note: 1 }) :
    listing('物料字段列表', ['字段名称', '录入组件', '关联渠道', '显示条件', '必填', '状态', '操作 ' + mark(2)], v2Config.fields.map(f => line(esc(f.name), esc(f.component), esc(f.channels.includes('*') ? '全部渠道' : f.channels.join('、')), esc(f.condition), f.required ? '是' : '否', tag(f.active ? '启用' : '已删除'), buttons(act('配置', 'v2-field-edit', f.key), f.active ? act('删除', 'v2-field-delete', f.key) : act('恢复', 'v2-field-restore', f.key)))), act('新增字段', 'v2-field-new', '', 'btn primary'), { note: 1 });
  return heading('物料字段配置') + tabs([['物料字段', '物料字段'], ['发行渠道', '发行渠道']], mode, 'v2-config-tab') + content;
}
function v2Export() {
  const list = filtered(records);
  return heading('合集信息导出') + filters([collectionFilter]) + listing('合集列表', ['选择', '合集名称', '供应商', '内容类型', '提交时间', '操作'], list.map(r => line('<input type="checkbox" data-v2-export-id="' + r.id + '"' + (ui.exportIds.has(r.id) ? ' checked' : '') + ' aria-label="选择' + esc(r.name) + '">', esc(r.name), v2SupplierLabel(r), esc(r.type), esc(r.submitted), act('查看全部字段', 'v2-export-fields', r.id))),
    '<span>已选' + ui.exportIds.size + '条</span>' + act('选择当前结果', 'v2-export-all', '', 'btn') + act('导出全部字段', 'v2-export', '', 'btn primary'), { note: 1 });
}
function v2DataView() {
  return heading('短剧数据') + '<p class="muted">线上既有菜单，报表数据尚未读取。</p>' + listing('短剧数据', ['剧集名称', '渠道', '数据日期', '数据'], []).replace('暂无匹配的合集', '暂无已读取数据');
}
function v2Opinions(r, annotated = false) {
  const rows = r.qualityTasks.map(t => line(esc(t.channel), esc(v2User(t.userId)?.name || t.userId), tag(t.result || '待评估'), esc(t.opinion || '—'), esc(t.time || '—')));
  return '<div class="v2-opinions"><dl class="detail-grid v2-opinion-summary">' + detailField('合集名称', esc(r.name)) + detailField('YouTube是否首发', esc(r.youtubeFirst || '—')) + detailField('意向渠道', intentChannels(r)) + detailField('剧集简介', esc(r.intro || '—')) + '</dl>' +
    '<div class="v2-opinion-heading"><h3>渠道评估意见</h3>' + (annotated ? mark(1) : '') + '</div>' + table(['渠道', '评估人员', '意见', '评估说明', '提交时间'], rows, { key: 'v2-opinions', className: 'v2-opinion-table' }) +
    '<section class="v2-opinion-feedback"><h3 class="v2-subtitle">商务最终反馈</h3>' + (r.qualityFinal ? '<p>' + tag(r.qualityFinal.result) + ' ' + esc(r.qualityFinal.opinion) + '</p><p class="muted">' + esc(r.qualityFinal.actor || '') + ' · ' + esc(r.qualityFinal.time || '') + '</p>' : '<p class="muted">商务尚未提交最终反馈</p>') + '</section>' +
    '<section class="v2-opinion-history"><h3 class="v2-subtitle">历史记录</h3>' + (r.qualityHistory.length ? r.qualityHistory.map(h => '<p>' + esc(h.time) + ' · ' + esc(h.action) + '</p>').join('') : '<p class="muted">暂无历史记录</p>') + '</section></div>';
}
