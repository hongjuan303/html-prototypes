/* Fixed baseline controls from the published material schema.
 * Server-provided per-channel field conditions remain an explicit audit item. */
function liveMaterialChoice(key, values, value) {
  return '<div class="live-material-choices" role="radiogroup"><input type="hidden" data-v2-extra="' + key + '" value="' + esc(value || '') + '">' + values.map(option => '<button type="button" role="radio" aria-checked="' + (value === option) + '" class="live-material-choice' + (value === option ? ' selected' : '') + '" data-act="live-material-choice" data-id="' + key + '|' + encodeURIComponent(option) + '">' + esc(option) + '</button>').join('') + '</div>';
}
clickActions['live-material-choice'] = (_, id) => { if (!ui.edit || ui.view !== 'materialsV2') return; const [key, value] = id.split('|'); v2ReadMaterial(); ui.edit.materialExtras[key] = decodeURIComponent(value); render(); };
const LIVE_MATERIAL_EXTRAS = {
  基础信息: [['firstDate', '全网首发时间', 'date'], ['animeType', '漫剧类型', ['小说漫解', '仿真人动态漫', '2D动态漫', '仿真人漫解', '3D动态漫']], ['advertising', '是否涉及投流', ['是', '否']]],
  备案信息: [['recordNo', '广电备案号', 'text']],
  角色资料: [['maleHongguoRegistered', '男主是否入驻红果', ['是', '否']], ['maleHongguoName', '男主红果姓名', 'text'], ['femaleHongguoRegistered', '女主是否入驻红果', ['是', '否']], ['femaleHongguoName', '女主红果姓名', 'text'], ['animeMaleName', '动漫男主角名', 'text'], ['animeMaleIntro', '动漫男主简介', 'textarea'], ['animeFemaleName', '动漫女主角名', 'text'], ['animeFemaleIntro', '动漫女主简介', 'textarea']],
  成片素材: [['hongguoLink', '红果链接', 'url'], ['distributionMaterial', '分销素材（海外小程序）', 'url']]
};
function liveMaterialExtraVisible(r, key) {
  const human = v2IsHuman(r), e = r.materialExtras || {};
  if (key === 'firstDate') return r.round === '二轮';
  if (key === 'animeType' || key.startsWith('anime')) return v2IsComic(r);
  if (key.includes('Hongguo')) return human && (!key.endsWith('Name') || e[key.replace('Name', 'Registered')] === '是');
  if (key === 'recordNo') return r.type.includes('国内') && Number(e.cost) > (human ? 100 : 30);
  return true;
}
const LIVE_LINK_MATERIALS = [['cleanFilm', '净版无字幕成片'], ['srt', 'SRT字幕文件']];
const liveOriginalMaterialFields = v2FieldsFor;
v2FieldsFor = r => liveOriginalMaterialFields(r).map(field => LIVE_LINK_MATERIALS.some(([key]) => key === field.key) ? { ...field, component: '网盘链接' } : field);
function liveRemoveDetailField(html, label) {
  const dom = document.createElement('div'); dom.innerHTML = html;
  [...dom.querySelectorAll('dt')].filter(dt => dt.textContent.trim() === label).forEach(dt => { if (dt.nextElementSibling?.tagName === 'DD') dt.nextElementSibling.remove(); dt.remove(); });
  return dom.innerHTML;
}
const liveStoredMaterialFiles = (r, key) => r.materials[key]?.length ? '<div class="live-stored-material-files"><p class="field-hint">已上传附件</p>' + v2FileList(r.materials[key]) + '</div>' : '';
const liveMaterialView = views.materialsV2;
views.materialsV2 = () => {
  const r = ui.edit, e = r.materialExtras ||= {}, dom = document.createElement('div'); dom.innerHTML = liveMaterialView();
  for (const section of dom.querySelectorAll('.v2-section')) {
    const title = section.querySelector('h2').textContent.replace(/\d+$/, '').trim();
    if (title === '角色资料' && v2IsComic(r)) [...section.children].filter(child => child.tagName !== 'HEADER').forEach(child => child.remove());
    if (title === '角色资料' && v2IsHuman(r)) {
      for (const [index, prefix, stem] of [[0, '男主', 'male'], [1, '女主', 'female']]) {
        const field = section.querySelector('[data-v2-extra="actorName' + index + '"]')?.closest('.field');
        if (!field) continue;
        field.closest('.two-fields').insertAdjacentHTML('beforebegin', formField(prefix + '是否入驻红果', liveMaterialChoice(stem + 'HongguoRegistered', ['是', '否'], e[stem + 'HongguoRegistered'])));
        if (e[stem + 'HongguoRegistered'] === '是') field.outerHTML = formField(prefix + '红果姓名', input('extra-' + stem + 'HongguoName', e[stem + 'HongguoName'] || '', '须与红果站内姓名一致', 'text', 'data-v2-extra="' + stem + 'HongguoName"'));
      }
    }
    const fields = (LIVE_MATERIAL_EXTRAS[title] || []).filter(([key]) => !key.includes('Hongguo') && liveMaterialExtraVisible(r, key));
    section.insertAdjacentHTML('beforeend', fields.map(([key, label, type]) => formField(label, Array.isArray(type) ? liveMaterialChoice(key, type, e[key]) : type === 'textarea' ? '<textarea rows="3" data-v2-extra="' + key + '">' + esc(e[key] || '') + '</textarea>' : input('extra-' + key, e[key] || '', '', type, 'data-v2-extra="' + key + '"'), ['firstDate', 'recordNo'].includes(key))).join(''));
    if (title === '备案信息' && r.type.includes('国内') && v2IsComic(r)) section.insertAdjacentHTML('beforeend', '<div class="v2-dynamic-field"><strong>动画短剧成本情况报告</strong>' + v2Upload('animeCostReport', r.materials.animeCostReport) + '</div>');
    if (title === '角色资料' && v2IsComic(r)) section.insertAdjacentHTML('beforeend', [['animeMalePhoto', '动漫男主角色照片'], ['animeFemalePhoto', '动漫女主角色图']].map(([key, label]) => '<div class="v2-dynamic-field"><strong>' + label + '</strong>' + v2Upload(key, r.materials[key], '上传图片', 'image/jpeg,image/png') + '</div>').join(''));
  }
  const assetSection = [...dom.querySelectorAll('.v2-section')].find(section => section.querySelector('h2').textContent.replace(/\d+$/, '').trim() === '成片素材');
  for (const [key, label] of LIVE_LINK_MATERIALS) {
    const field = dom.querySelector('[data-v2-material-value="' + key + '"]');
    if (!field || !assetSection) continue;
    field.closest('.v2-dynamic-field')?.remove();
    assetSection.insertAdjacentHTML('beforeend', '<div class="v2-dynamic-field">' + formField(label, input('material-' + key, r.customMaterials[key] || '', '请输入网盘链接', 'url', 'data-v2-material-value="' + key + '"') + '<span class="field-hint">仅海外TikTok原生时选填，可提供网盘链接。</span>') + liveStoredMaterialFiles(r, key) + '</div>');
  }
  // Restore online select controls where the previous prototype used plain text boxes.
  for (const [key, values] of [['audience', ['男频', '女频', '无性别']], ['crewGender0', ['男', '女']], ['crewGender1', ['男', '女']]]) {
    const field = dom.querySelector('[data-v2-extra="' + key + '"]'); if (field) field.outerHTML = key === 'audience' ? liveMaterialChoice(key, values, e[key]) : select('extra-' + key, ['请选择', ...values], e[key] || '请选择', 'data-v2-extra="' + key + '"');
  }
  dom.querySelectorAll('.v2-section h2').forEach((h, index) => { h.querySelectorAll('[data-note]').forEach(m => m.remove()); h.insertAdjacentHTML('beforeend', ' ' + mark(index + 1)); });
  const footerMark = dom.querySelector('.v2-form-footer [data-note]'); if (footerMark) footerMark.outerHTML = mark(8);
  const paid = dom.querySelector('[data-v2-extra="paidEpisodes"]'); if (paid) { paid.type = 'text'; paid.placeholder = '第xx集免费，第xx集付费'; }
  return dom.innerHTML;
};
root.addEventListener('change', event => {
  if (ui.view === 'materialsV2' && (event.target.name === 'v2round' || event.target.hasAttribute('data-live-material-condition') || ['cost'].includes(event.target.dataset.v2Extra))) { v2ReadMaterial(); render(); }
});
const liveMaterialRead = v2ReadMaterial;
v2ReadMaterial = () => {
  const draft = ui.edit, form = root.querySelector('[data-v2-form="material"]');
  if (!draft || !form) return liveMaterialRead();
  const retained = ['actorBio0', 'actorBio1'].filter(key => !form.elements.namedItem(key)).map(key => ({ key, present: Object.hasOwn(draft.materialExtras || {}, key), value: draft.materialExtras?.[key] }));
  const result = liveMaterialRead();
  if (ui.edit === draft) retained.forEach(({ key, present, value }) => { if (present) draft.materialExtras[key] = value; else delete draft.materialExtras[key]; });
  return result;
};
document.addEventListener('submit', event => {
  if (event.target.dataset.v2Form !== 'material' || event.submitter?.value !== 'submit' || !ui.edit) return;
  v2ReadMaterial();
  const r = ui.edit, missing = [];
  if (r.round === '二轮' && !String(r.materialExtras.firstDate || '').trim()) missing.push('全网首发时间');
  if (liveMaterialExtraVisible(r, 'recordNo') && !String(r.materialExtras.recordNo || '').trim()) missing.push('广电备案号');
  const invalid = LIVE_LINK_MATERIALS.filter(([key]) => v2FieldsFor(r).some(field => field.key === key) && r.customMaterials[key] && !/^https?:\/\/\S+$/i.test(r.customMaterials[key])).map(([, label]) => label);
  if (!missing.length && !invalid.length) return;
  event.preventDefault(); event.stopImmediatePropagation();
  error(missing.length ? '请补充：' + missing.join('、') : '请输入有效的http或https网盘链接：' + invalid.join('、'), '#v2-material-error');
}, true);
clickActions['preview-material'] = async (_, value) => {
  const [key, index] = value.split(':'), record = val(ui.modal?.id || ui.selected), file = record?.materials[key]?.[Number(index)];
  if (!file) return;
  const previewFile = { ...file, id: file.id || (file.url ? 'url:' + file.url : undefined) };
  const previous = ui.modal, view = ui.view, selected = ui.selected;
  try {
    if (!attachments.has(previewFile.id) && (file.id || file.url)) {
      const original = await v2File(file);
      attachments.set(previewFile.id, { url: URL.createObjectURL(original), type: original.type || file.type || '' });
    }
    if (ui.modal !== previous || ui.view !== view || ui.selected !== selected) return;
    openModal('attachment', record.id, {}, { file: previewFile, returnModal: previous?.type === 'collection-info' ? structuredClone(previous) : null });
  } catch (e) { announce(e.message || '文件原件暂不可用'); }
};
const liveMaterialAreas = collectionMaterialAreas;
collectionMaterialAreas = (r, ...args) => {
  const areas = liveMaterialAreas(r, ...args); if (r.onlineSnapshot) return areas;
  if (v2IsComic(r)) areas.角色资料 = '';
  else if (v2IsHuman(r)) {
    const roles = document.createElement('div'); roles.innerHTML = areas.角色资料;
    for (const [prefix, stem] of [['男主', 'male'], ['女主', 'female']]) {
      if (r.materialExtras?.[stem + 'HongguoRegistered'] !== '是') continue;
      const label = [...roles.querySelectorAll('dt')].find(dt => dt.textContent.trim() === prefix + '真实姓名');
      if (label) { if (label.nextElementSibling?.tagName === 'DD') label.nextElementSibling.remove(); label.remove(); }
    }
    areas.角色资料 = roles.innerHTML;
  }
  for (const [section, fields] of Object.entries(LIVE_MATERIAL_EXTRAS)) {
    areas[section] += '<dl class="bordered-descriptions live-restored-fields">' + fields.filter(([key]) => key !== 'advertising' && liveMaterialExtraVisible(r, key)).map(([key, label]) => detailField(label, esc(r.materialExtras?.[key] || '—'))).join('') + '</dl>';
  }
  for (const [section, key, label] of [['备案信息', 'animeCostReport', '动画短剧成本情况报告'], ['角色资料', 'animeMalePhoto', '动漫男主角色照片'], ['角色资料', 'animeFemalePhoto', '动漫女主角色图']]) if (v2IsComic(r) && (key !== 'animeCostReport' || r.type.includes('国内'))) areas[section] += '<h3 class="v2-subtitle">' + label + '</h3>' + v2FileList(r.materials[key] || []);
  for (const [key, label] of LIVE_LINK_MATERIALS) {
    areas.合规文件 = liveRemoveDetailField(areas.合规文件, label);
    if (!v2FieldsFor(r).some(field => field.key === key) && !r.customMaterials[key] && !r.materials[key]?.length) continue;
    const value = r.customMaterials[key] || '', link = /^https?:\/\/\S+$/i.test(value) ? '<a class="link" href="' + esc(value) + '" target="_blank" rel="noopener">' + esc(value) + '</a>' : esc(value || '—');
    areas.成片素材 += '<dl class="bordered-descriptions live-restored-fields">' + detailField(label, link + liveStoredMaterialFiles(r, key)) + '</dl>';
  }
  return areas;
};
V2_NOTES.materialsV2.sections = [
  ['配置项 · 基础信息', [['类型、轮次及发行渠道', '沿用已确认资料，商务确认的实际发行渠道锁定；二轮展示并必填全网首发时间，漫剧展示漫剧类型。'], ['首发、转免时间', '供应商首发即平台上线时间，转免默认同值；平台后续修改同步回显。'], ['付费集数、男女频、投流', '付费集数按原线上文本格式填写，男女频及是否投流使用单选标签。']]],
  ['配置项 · 剧情文案', [['简介、梗概、推荐文案、标签', '保留对应输入字段；剧集梗概支持数字，海外关联图片细则另待核。']]],
  ['配置项 · 备案信息', [['制作成本、片酬占比、成本报告', '保留录入与上传；国内真人成本超过100万元、国内漫剧超过30万元时展示并必填广电备案号。']]],
  ['配置项 · 角色资料', [['真人男女主信息', '选择是否入驻红果，已入驻填写红果姓名，未入驻填写真实姓名；角色名、简介、照片与剧照分别维护。'], ['动漫角色信息', '漫剧分别填写男女主角名、简介和角色图片。']]],
  ['配置项 · 主创团队', [['承制公司、制片人、导演、编剧', '分别维护姓名、简介及图片；导演和编剧性别为下拉选择。']]],
  ['配置项 · 成片素材', [['资源、链接与海报', '保留对应网盘链接、红果链接、试看、高光素材、横竖海报及AI集数。'], ['净版成片、SRT字幕', '填写HTTP(S)网盘链接；已有附件保留可查看。仅海外TikTok原生时选填，其他渠道映射以物料配置为准。']]],
  ['配置项 · 合规文件', [['AI材料、微信声明、优酷版权', '所有漫剧AI材料支持图片；微信声明适用且必填，提示推荐拍照版本；优酷条件按此前评审建议。']]],
  ['操作项', [['保存草稿、提交物料审核', '再次校验正片已通过及商务已确认；保存保留已有资料，提交校验当前适用的必填材料。'], ['收起、展开、快速定位', '按资料分区操作，折叠不清空已填写资料。']]]
];
V2_NOTES.materialsV2.caution += ' 物料字段按剧集类型与发行渠道展示；渠道级显隐、必填及合规文件以线上字段配置为准，未取得的配置在核查记录中单列待核。';
render();
