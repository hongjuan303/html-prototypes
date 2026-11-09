const frame = document.getElementById('prototype');
const notes = document.getElementById('notes');
// Keep the prototype at its native width; scroll the combined canvas when needed.

const bullets = items => `<ul>${items.map(text => `<li>${text}</li>`).join('')}</ul>`;
const steps = items => `<ol>${items.map(text => `<li>${text}</li>`).join('')}</ol>`;
const bindAttr = binding => binding ? ` data-spec-binding="${JSON.stringify(typeof binding==='string'?{selector:binding}:binding).replaceAll('&','&amp;').replaceAll('"','&quot;')}"` : '';
const fields = items => `<ul class="spec-fields">${items.map(([label, text, binding]) => `<li class="spec-field" data-spec-field="${label}"${bindAttr(binding)}><strong>${label}：</strong><span>${text}</span></li>`).join('')}</ul>`;
const section = (title, body, pending = false, group, binding) => ({
  title, body, pending, binding,
  group: group || ({'筛选项': 'filters', '列表项': 'columns'}[title] || 'actions')
});
function pageSpecContext(title,intro){
 const contexts={
  '抖音号 · 发布管理':['抖音素材按发布账号分别配置合集和作品信息，需要逐条跟进发布结果。','绿台发布任务记录、爬虫账号管理的全部抖音号，以及抖音返回的发布结果。'],
  '视频号 · 发布管理':['视频号按账号和挂链类型选择对应合集，发布与推广链创建结果需要分别跟进。','绿台视频号发布记录、账号及挂链配置，以及平台返回的发布和推广链处理结果。'],
  '快手号 · 发布管理':['二创素材通过作者服务或通栏服务关联变现任务，需要按账号查看发布结果。','绿台快手号发布记录、账号及变现任务配置，以及快手返回的发布结果。'],
  '抖音版权中台 · 素材管理':['同一份推剧素材在抖音和红果分别审核、发布，两端结果可能不同。','版权中台当前身份下的素材记录、关联正片或线索、双端账号及审核发布结果。'],
  '快手经管平台 · 剪辑管理':['经管平台的短剧剪辑独立配置标题、剪辑类型和作者声明，需要与快手号二创任务分开管理。','绿台经管账号、素材及剪辑提交记录，剪辑状态以快手返回结果为准。短剧匹配来源见待确认项。'],
  '新增发视频 · 选择素材':['剪辑同学提前上传视频，运营从共享文件库选择本次要发布的素材。','OSS文件库中的视频文件及其名称、文件夹、大小、时长、上传信息和可用状态。'],
  '新增发视频 · 分配账号与挂链':['各平台的发布账号、挂链方式和作品字段不同，同一素材需要分别配置。','已选OSS素材、各平台账号及其可选合集或变现任务；AI生成文案使用素材合集ID对应的绿台短剧简介。'],
  '新增发视频 · 确认发布':['同一素材可对应多个平台和账号，提交前需要核对每条明细及最终排期。','本次素材、账号和作品配置，以及提交前的素材可用状态、账号授权和挂链有效性校验结果。'],
  '发布文案模板':['常用发布文案需要复用，并允许在具体素材上继续调整。','绿台保存的发布文案模板、适用平台和启停状态。'],
  '批次详情':['一次提交可生成多条独立明细，需要分别跟进成功、失败和待处理结果。','本次提交生成的发布或提审记录、排期及各平台返回结果。']
 };
 const [background,source]=contexts[title]||['按当前页面的业务范围维护发布配置。','本次已选素材、账号和已保存配置。'];
 return {page:title==='发布文案模板'?'本页是绿台 → 内容分发 → 发布配置页。':`本页是绿台 → 版权管理 → 多平台批量发视频的${title}页。`,purpose:intro,background,requirement:intro,source};
}
function modalSpecContext(ctx,platform){
 if(ctx.sections.includes('模板编辑弹窗'))return {page:`本页是${ctx.title}弹窗。`,purpose:'设置模板名称、适用平台和文案内容，保存后供后续任务使用。',background:'常用文案通过模板维护，具体素材仍可单独修改。',requirement:'填写完整后保存；取消或关闭时保留原模板。',source:'绿台已保存的文案模板及本次填写的内容。'};
 const contexts={
  library:['从OSS文件库查找并选择本次需要的视频素材。','剪辑已将素材上传至共享文件库，运营按本次发布范围选取视频。','OSS文件库中的素材及文件元信息；已经加入的素材用于去重。'],
  editor:['编辑当前素材的信息，确认后保存；取消保留原配置。','不同平台使用独立的作品字段，编辑需明确当前素材和发布账号。','当前素材与账号已保存的配置，以及该账号可选的合集、挂链任务或关联内容。'],
  sync:['将来源素材的信息同步到本平台选定的素材。','同平台多份素材需要复用配置，同步前应确认覆盖范围和账号关联。','来源素材及其账号配置、本平台待发布素材；具体同步字段见下方说明。'],
  ai:['设置生成字段与字数，检查结果后应用到当前平台。','不同平台使用不同文案字段和字数要求，生成结果需要分别确认。','当前平台勾选的素材，以及按素材名称中的合集ID找到的绿台短剧简介。'],
  accounts:['选择本次素材使用的发布账号。','一份素材可发布到多个账号，账号决定后续可选的合集或任务范围。','当前平台账号及授权状态、当前素材已有的账号分配。'],
  collection:['搜索并选择当前视频号可使用的合集。','同一视频号在不同挂链类型下，可选择的合集不同。','当前视频号、当前挂链类型对应的合集列表。'],
  submit:['核对提交规则，确认后创建发布或提审任务。','提交前需再次校验素材、账号、挂链信息和最终排期。','确认页的待提交明细及发布间隔设置。'],
  confirm:['核对当前操作；确认后执行，取消保留原状态。','当前操作将更新草稿或记录状态，需要在执行前确认。','当前页面选定的记录和未保存配置。']
 };
 const [purpose,background,source]=contexts[ctx.kind]||['核对当前操作的内容和处理规则。','当前操作仅作用于选定的记录或配置。','当前记录及已填写的信息。'];
 const scoped=['editor','sync','accounts','collection'].includes(ctx.kind)&&platform;
 return {page:`本页是${scoped?displayPlatform(platform)+' · ':''}${ctx.title}弹窗。`,purpose,background,requirement:purpose,source};
}
function applySpecContext(root,context){
 const write=(selector,text)=>{const el=root.querySelector(selector);if(el)el.textContent=text;};
 write('.spec-page-title',context.page);write('.spec-intro',context.purpose);
 for(const key of ['background','requirement','source'])write(`[data-spec-context="${key}"]`,context[key]);
}
const spec = (title, intro, sections) => {
  const context=pageSpecContext(title,intro);
  const renderGroup = (key, label, fallback) => {
    const content = sections.filter(item => item.group === key).map(item =>
      `<div class="spec-subsection${item.pending ? ' spec-pending' : ''}" data-spec-section="${item.title}"${bindAttr(item.binding)}>${item.title === label ? '' : `<h3>${item.title}</h3>`}${item.body.replace(/<p>([\s\S]*?)<\/p>/g,'<ul class="spec-rules"><li>$1</li></ul>')}</div>`
    ).join('');
    return `<section class="spec-section" data-spec-group="${key}"><h2>${label}</h2>${content || `<p>${fallback}</p>`}</section>`;
  };
  return `<p class="spec-label">说明文档</p>
    <div class="spec-overview"><h1>#页面说明</h1><ul><li class="spec-page-title">${context.page}</li><li><strong>页面作用：</strong><span class="spec-intro">${context.purpose}</span></li></ul></div>
    <div class="spec-details"><h1>#原型说明</h1><ul class="spec-context"><li><strong>背景：</strong><span data-spec-context="background">${context.background}</span></li><li><strong>需求：</strong><span data-spec-context="requirement">${context.requirement}</span></li><li><strong>数据源：</strong><span data-spec-context="source">${context.source}</span></li></ul>
      ${renderGroup('filters', '筛选项', '本页无筛选项。')}
      ${renderGroup('columns', '列表项', '本页无列表。')}
      ${renderGroup('actions', '操作项', '本页无操作项。')}
    </div><p class="spec-footer">点击左侧橙色序号，定位对应说明。同一规则重复出现时使用同一序号。</p>`;
};


const displayPlatform = p => ({'抖音':'抖音号','快手':'快手号'}[p]||p);
const at = (selector,platform) => ({selector,platform});
const col = (column,scope='#main') => ({column,scope});
const act = (name,scope='') => `${scope} [data-action="${name}"]`.trim();
const inputPoint = (form,name) => ({selector:`${form} [name="${name}"], ${form} #${name}`,closest:'label,.filter-field,.km-filter-field'});
const filterFields = (form,items) => fields(items.map(([name,label,text])=>[label,text,inputPoint(form,name)]));
const columnFields = (items,scope) => fields(items.map(([label,text])=>[label,text,col(label,scope)]));
const actionSection = (title,text,binding) => section(title,`<p>${text}</p>`,false,'actions',binding);
const keyword = '文本输入，默认空；按名称关键词模糊匹配，空值不限制。';
const scheduleFilter = '日期范围，默认不选。按预约执行日期查询，包含起止日；只填写一端时按单边范围查询。开始日期晚于结束日期时提示纠正，不执行查询。';
const listCommon = {
 '素材名':'视频文件原名，用于定位剪辑素材。长名称省略显示，悬停查看完整名称。',
 '素材封面':'展示本条素材设置的封面缩略图；快手号使用视频第一帧。',
 '作品标题':'发布到该抖音号的作品标题，与作品简介分别保存；无历史值时显示“—”。',
 '作品简介':'发布到该抖音号的作品简介，不与标题合并，也不因生成标题被覆盖。',
 '素材描述':'本条视频号素材使用的描述内容；对应编辑弹窗中的“描述”或“视频描述”。',
 '视频标注':'勾选AI声明时展示“该视频含AI生成内容”；未勾选时显示“—”。',
 '关联合集':'本条素材在当前视频号及挂链类型下选定的合集名称。',
 '关联小程序':'自营小程序场景展示选择的小程序名称；其他场景无配置时显示“—”。',
 '端上合集':'当前抖音号下选定的端原生合集名称，以发布配置为准。',
 '作品描述':'本条快手二创视频的作品描述，默认格式为“#剧名#短剧题材”，展示最终保存内容。',
 '挂载短剧名称':'从所选快手变现任务带入的短剧名称，未取得时显示“—”。',
 '失败原因':'展示任务执行失败或需人工处理的具体原因；没有原因时显示“—”。',
 '发布失败原因':'展示发布或推广链处理失败的具体原因；视频发布成功但推广链创建失败时仍保留原因。',
 '实际发布时间':'平台返回的实际发布成功时间；尚未成功或未返回时间时显示“—”。',
 '预约发布时间':'业务设置的执行时间；定时任务展示具体日期和时间，立即发布任务显示“立即发布”。'
};
const ordinaryFilters={
 '抖音':[['account','抖音号名称','下拉多选，支持按账号名称模糊搜索，默认空。数据源取爬虫账号管理的所有抖音号列表，包含授权失效账号；搜索只缩小候选项，不清除已选账号。选择多个账号时匹配其中任一账号，未选时不限制账号。'],['title','作品标题','文本输入，默认空；按作品标题关键词模糊搜索，空值不限制。'],['status','发布状态','下拉多选，默认全部；可选待发布、已发布、发布失败。选择多个状态时匹配其中任一状态；点击“全部”或取消所有选择后不限制发布状态。'],['publishStart','预约发布时间',scheduleFilter],['dramaName','端上合集名称',keyword],['material','素材名',keyword]],
 '视频号':[['account','视频号名称',keyword],['material','素材名',keyword],['status','发布状态','下拉单选，默认全部；可选待上传、上传中、视频上传成功待发布、发布中、已发布、发布失败、已删除、发布成功但创建推广链失败、待确认。'],['hang','挂链类型','下拉单选，默认全部；可选自营小程序、自营端原生、外部小程序、外部端原生。'],['publishStart','预约发布时间',scheduleFilter]],
 '快手':[['account','快手号名称',keyword],['material','素材名',keyword],['status','发布状态','下拉单选，默认全部；可选待发布、发布中、已发布、发布失败、待确认、已取消。'],['publishStart','预约发布时间',scheduleFilter],['dramaName','挂载短剧名称',keyword],['hang','挂链类型','下拉单选，默认全部；可选作者服务、通栏服务。']]
};
const ordinaryColumns={
 '抖音':['抖音号','素材名','素材封面','作品标题','作品简介','端上合集','发布状态','失败原因','实际发布时间','预约发布时间'],
 '视频号':['视频号名称','素材名','素材封面','素材描述','视频标注','关联合集','挂链类型','关联小程序','发布状态','发布失败原因','实际发布时间','预约发布时间'],
 '快手':['快手号','素材名','素材封面','作品描述','挂链类型','挂载短剧名称','发布状态','失败原因','实际发布时间','预约发布时间']
};
function draftResumeAction(){return [
 actionSection('继续草稿','仅存在已保存草稿时展示。恢复素材、平台和已填配置，从选择素材步骤继续；保存草稿不会提交发布。',act('resume'))
]}
function publishingList(platform='抖音'){
 if(platform==='抖音版权中台')return copyrightList();
 if(platform==='快手经管平台')return operatorList();
 const p=ordinaryFilters[platform]?platform:'抖音';
 return spec(`${displayPlatform(p)} · 发布管理`,'按素材与发布账号查询任务。一个素材发给多个账号时，每个账号各占一条明细。',[
 section('筛选项',filterFields('#filters',ordinaryFilters[p])),
 section('列表项',columnFields(ordinaryColumns[p].map(label=>[label,listCommon[label]||(label==='发布状态'?'展示本条任务当前执行结果，枚举与筛选项对应；“待确认”表示尚未确认最终结果，不能按已发布处理。':label==='挂链类型'?(p==='快手'?'展示作者服务或通栏服务，以及对应关联的变现任务类型。':'展示提交时选用的四种挂链类型之一。'):'展示本条发布任务使用的账号名称。')]))),
 ...draftResumeAction(),
 actionSection('勾选明细','行首复选框选择单条；表头复选框选择或取消当前页全部明细。切换平台或重新查询后清空选择。勾选本身不执行发布或删除。','#selectAll, [data-select-row]'),
 actionSection('分页','默认每页8条，可切换8、15、30条。切换每页条数后回到第1页；首页不能上一页，末页不能下一页。','#pageSize, [data-action="page"]'),
 p==='视频号'?actionSection('删除','已删除记录不可再次删除。点击删除打开确认框，确认后记录标记为“已删除”，待执行任务取消；取消或关闭不处理。不表示已删除平台上的已发布作品。',act('delete-video-record')):actionSection('编辑','仅未到预约发布时间且尚未发布的任务可编辑；立即发布、已到时间、已发布、发布中、待确认、已取消或已删除均不可编辑。弹窗回填当前配置；保存时再次核对状态和时间，若任务已经开始执行则阻止保存并提示刷新。',act('edit-video-record')),
 actionSection('新增发视频','进入“选择素材 → 分配账号与挂链 → 确认发布”。素材选好后可同时配置五个平台。',act('new')),
 ...(p==='视频号'?[section('删除确认',fields([
 ['确认删除','执行取消待执行任务及标记删除，成功后更新列表状态。','#confirmAction'],
 ['取消 / 关闭','关闭确认框，保留原记录及状态。','#overlay [data-action="close-modal"]']
 ]))]:[editorSection(p)])
 ]);
}
function copyrightList(){return spec('抖音版权中台 · 素材管理','查询当前身份下素材在抖音、红果的审核和发布结果，处理审核失败的素材。',[
 section('筛选项',filterFields('#cpFilters',[
 ['cpIdentity','当前身份','下拉单选，默认版权机构；可选版权机构、投资出品方机构、版权个人。切换身份后仅展示对应身份的数据。机构管理员查看机构素材，成员及个人仅查看本人素材。'],
 ['asset','素材名称',keyword],['drama','短剧名称',keyword],['contentId','短剧ID','文本输入，默认空；输入完整数字ID精确查询，不带关联类型前缀。'],
 ['type','关联类型','下拉单选，默认全部；可选正片、线索。切换后素材类型候选随之更新。'],
 ['materialType','素材类型','下拉单选，默认全部。正片：花絮、剧情回顾、剧情解析；线索：预告片、花絮、剧情解析。关联类型为全部时展示两类的去重合集。'],
 ['dyAccount','抖音发布账号','下拉单选，默认全部；按素材关联的抖音账号查询。'],['hgAccount','红果发布账号','下拉单选，默认全部；按素材关联的红果厂牌账号查询。'],
 ['audit','审核状态','下拉单选，默认全部；可选审核中、审核成功、审核失败。抖音或红果任一端满足即命中；与其他查询条件同时生效。']
 ])),
 section('列表项',columnFields([
 ['素材信息','展示封面、素材名称和视频时长；不展示素材ID。长名称省略显示。'],['关联内容','展示正片/线索、短剧名称及短剧ID。短剧ID仅展示数字，不带类型前缀。'],['素材类型','展示本条素材提审时选择的类型。'],
 ['抖音审核状态','单独展示抖音端结果：审核中、审核成功、审核失败；待投稿或已删除等状态按平台返回展示。审核失败时可展开失败原因。审核成功不等于发布成功。'],
 ['抖音发布状态','展示抖音端待发布、发布中、已发布、未发布或已删除。正片未上架导致待投稿时显示待发布；审核失败但未发布时显示未发布。'],['抖音发布账号','展示抖音端使用的发布账号名称。'],
 ['红果审核状态','单独展示红果端审核结果；审核失败时可展开失败原因，不与抖音结果合并。'],['红果发布状态','单独展示红果端发布进度；是否发布成功以该端结果为准。'],['红果发布账号','展示红果厂牌账号名称。'],
 ['提审时间','放在红果发布账号之后，记录首次提交审核的日期和时间。历史记录无可靠时间时显示“—”；重新提审是否改为最近提审时间待业务确认。']
 ])),...draftResumeAction(),
 actionSection('新增发视频','先选OSS素材，再选择参与发布的平台并编辑素材信息。版权中台按素材提审，与其他平台配置相互独立。',act('cp-upload')),
 actionSection('编辑与重新提审','任一端审核中，或两端均审核成功时不可编辑。仅失败端允许修改；最多修改5次。双端已删除、达到次数上限、红果失败且抖音待投稿时不可编辑。按钮置灰并说明原因。',act('cp-edit')),
 section('重新提审弹窗',fields([
 ['素材及关联内容','只读回显文件名和关联短剧；重新提审不能更换视频文件、关联内容、素材类型及双端账号。','.cp-edit-fixed'],
 ['抖音视频标题','必填；仅抖音失败且允许编辑时可改，支持话题及@；抖音已成功时只读。','#cpEditDY'],
 ['红果视频标题','必填；仅红果失败且允许编辑时可改。不能在标题中自由输入#话题或@。','#cpEditHG'],
 ['红果话题','从已有话题中多选，随红果标题一同提审；红果不允许编辑时不可修改。','.cp-retry-form .cp-topic-options'],
 ['封面','仅双端均失败时可更换；单端失败时保留原封面。','.cp-retry-form .cp-draft-cover'],['是否AI作品','仅双端均失败时可修改，仍须明确选择是或否。','.cp-retry-form [data-cp-boolean="ai"]'],
 ['是否挂载锚点','仅线索类型显示；已挂载锚点在双端均失败时可取消，已保存后不能新增锚点。正片不显示。','.cp-retry-form [data-cp-boolean="anchor"]'],
 ['重新提审','校验可编辑字段后仅重新提交失败端，成功端不重复提交；重新提交的端变为审核中。接口对分端编辑及提审的支持范围待技术核验。','#cpSaveEdit'],
 ['取消 / 关闭','放弃本次未保存修改，保留上次提审内容及状态。','.cp-material-modal [data-action="close-modal"]']
 ]))
])}
function operatorList(){return spec('快手经管平台 · 剪辑管理','查询经管账号的短剧剪辑和发布结果。剪辑类型、账号及发布信息与快手号二创任务分别管理。',[
 section('筛选项',filterFields('#kmFilters',[
 ['account','快手号名称',keyword],['material','素材名',keyword],['status','发布状态','下拉单选，默认全部；当前展示发布中、已发布、发布失败，与列表剪辑状态对应。最终枚举待接口确认。'],
 ['start','发布时间','日期范围，默认不选；按实际发布成功日期查询，包含起止日。未发布成功记录不命中该条件；开始日期不能晚于结束日期。'],
 ['drama','短剧名称',keyword],['dramaId','短剧ID','文本输入，默认空；按完整平台短剧ID精确匹配。'],['type','剪辑类型','下拉单选，默认全部；暂用高光、花絮，与编辑弹窗一致。原需求中的“素材”是否为“花絮”待确认。']
 ])),section('列表项',columnFields([
 ['快手号','展示本条剪辑使用的经管账号名称。'],['素材名',listCommon['素材名']],['素材封面','展示本条剪辑的封面缩略图。'],['短剧名称','展示关联的平台短剧名称；未取得时显示“—”。'],['短剧ID','展示平台返回的短剧ID；与绿台合集ID分别保存，不相互替代。'],['剪辑标题','展示最终提交的剪辑标题，最多20字。'],['剪辑状态','展示发布中、已发布、发布失败；失败时点击“失败原因”展开具体原因。最终状态口径待接口确认。'],['提交发布时间','点击确认提交并创建发布明细的时间，北京时间，位于剪辑状态之后。成功或失败后均保留；历史无可靠时间显示“—”，不以实际发布成功时间补填。']
 ])),...draftResumeAction(),
 actionSection('新增发视频','先选择OSS素材，再选择快手经管账号，最后编辑剪辑标题、剪辑类型和作者声明。全部校验通过后提交。',act('km-new')),
 section('待确认',bullets(['短剧关联暂按素材合集ID与所选账号匹配；是否需要业务手动选剧待确认。','本平台没有定时字段，暂按提交后发布演示，真实能力及状态口径待技术核验。']),true)
])}
const nativeField=(p,label,text,selector)=>[label,text,at(selector||`#overlay [data-native-field="${label}"]`,p)];
function editorSection(p){
 const n=displayPlatform(p),f=(label,text,selector)=>nativeField(p,label,text,selector);
 let rows=[];
 if(p==='抖音')rows=[
 f('添加标签','必填。标签类型固定为“付费内容”，端上合集下拉单选，默认未选；候选来自本条已选抖音号。更换账号后必须重新选该账号下的合集。'),
 f('视频封面','必填。已有封面时回显，选择端上合集后带入对应封面；可删除后重新上传图片。未设置封面或上传非图片时提示纠正。'),
 f('作品标题','必填，独立文本输入。回显当前标题；可手动填写或使用本平台AI生成结果，保存时不允许全空格。平台字数上限待确认。'),
 f('作品简介','必填，多行文本。回显素材已有描述或保存内容；与标题分别保存，AI生成标题不覆盖简介。字数上限待确认。'),
 f('发布时间','必填，单选立即发布/定时发布，新素材默认立即发布。立即发布不填日期；切换定时发布后须填写具体时间。'),
 f('定时发布时间','定时发布时必填，精确到秒。新增任务支持当前时间2小时后至14天内；已有未执行任务修改时以任务时间及状态复核为准。超出允许范围不保存。','#overlay [aria-label="定时发布时间"]')
 ];
 if(p==='视频号')rows=[
 f('挂链类型','必填，单选四项：自营小程序、自营端原生、外部小程序、外部端原生。首次默认自营小程序；再次打开回显已保存类型。切换类型清空关联合集及小程序，需要重新选择。'),
 f('关联合集','必填。自营小程序、自营端原生点击“选择合集”打开列表；外部小程序、外部端原生在当前框下拉单选。候选由当前视频号和挂链类型共同限定，不能跨账号直接复用。'),
 f('视频标注','非必填复选框，“该视频含AI生成内容”默认不勾选。按实际内容选择，保存到当前素材、当前账号。'),
 f('标题','仅两种自营类型展示，默认素材文件名，只读。两种外部类型不展示此字段。'),
 f('关联小程序','仅自营小程序场景展示，必填、下拉单选、默认未选。切换挂链类型后清空，其他三种类型不要求填写。'),
 f('视频封面','四种挂链类型均必填。已有封面回显；选择自营合集后带入封面，可删除并重新上传图片。没有封面时不允许保存。'),
 f('描述','仅两种自营类型展示，必填、多行文本。选择合集会带入剧目相关默认描述，支持手动修改。自营场景字数限制待确认。'),
 f('视频描述','仅两种外部类型展示，必填、多行文本，最多100字，展示实时字数。超出限制不允许保存。'),
 f('发布时间','四种类型均必填，直接选择日期和时间，初始为空；支持今天及之后的日期。此弹窗沿用原视频号交互，不增加立即/定时单选。')
 ];
 if(p==='快手')rows=[
 f('作品描述','必填，多行文本。默认“#剧名#短剧题材”，选择任务后带入剧名和题材；业务手动修改后，更换任务不自动覆盖手填文案。字数上限待平台确认。'),
 f('封面设置','固定使用视频第一帧，展示默认值，本期不提供更换入口。'),
 f('挂链类型','必填，单选作者服务/通栏服务，初始未选。作者服务默认“关联变现任务”，通栏服务默认“关联短剧变现任务”。已有任务时更换类型需确认，并清空原任务后重选。'),
 f('变现任务','选择挂链类型后展示，必填、下拉单选。仅选择当前账号、当前服务下可用的任务；展示任务ID和有效期。缺少任务、任务过期或排期超出有效期时阻止保存/提交。','#overlay [data-editor-task]'),
 f('作者声明','固定默认“演绎情节，仅供娱乐”，本期不提供其他选项。'),
 f('发布时间','必填，单选立即发布/定时发布，新素材默认立即发布。定时发布须填写具体时间，并校验时间有效及任务有效期。'),
 f('定时发布时间','仅定时发布展示，必填；时间必须晚于当前时间，排期须落在所选任务有效期内。平台允许的最远预约范围待确认。','#overlay [aria-label="定时发布时间"]')
 ];
 const modalSelector=p==='快手'?'.ks-material-modal':'.native-material-modal:not(.cp-material-modal):not(.ks-material-modal)';
 rows.push(f('确定','校验必填项及关联关系。通过后仅保存当前素材、当前账号的配置，关闭弹窗并更新列表；失败时保留填写内容并显示具体错误，不提交发布。',`${modalSelector} [data-action="save-material"]`));
 rows.push(f('取消 / 关闭','放弃本次弹窗内未保存修改，保留上次配置，返回当前列表。',`${modalSelector} [data-action="close-modal"]`));
 return section(n+' · 编辑素材',fields(rows));
}
function kmEditorSection(){return section('快手经管平台 · 编辑素材',fields([
 ['剪辑标题','必填，多行文本，默认空或回显已保存值（含已应用的AI生成标题）；最多20字，实时计数。空值或超限时不能保存，不自动截断输入。','#kmClipTitle'],
 ['剪辑类型','必填，单选高光/花絮，初始不选；再次编辑时回显原值。',{selector:'#kmEditForm [name="kmClipType"]',closest:'.modal-field'}],
 ['作者声明','必填，单选“内容无需添加声明（作品不涉及AI生成）”或“含AI生成内容”，初始不选。由业务按素材实际内容判断。',{selector:'#kmEditForm [name="kmDeclaration"]',closest:'.modal-field'}],
 ['素材 / 账号 / 短剧','只读回显当前素材、已选快手号及匹配的平台短剧名称、ID。匹配不到显示未匹配到短剧，提交前须解决。','.km-edit-context'],
 ['保存','逐项校验标题、类型和声明，通过后保存到当前素材及账号。此时不发布；短剧映射及授权在提交前继续校验。','#kmSaveEditor'],
 ['取消 / 关闭','关闭弹窗，不保存本次修改。','.km-editor [data-action="close-modal"]']
]))}
function cpEditorSection(){const cp=(label,text,selector)=>[label,text,{selector:selector||`[data-cp-field="${label}"]`,platform:'抖音版权中台',closest:selector?.includes('data-cp-editor')||selector?.includes('data-cp-boolean')?'.native-form-field':undefined}];return section('抖音版权中台 · 编辑素材',fields([
 cp('关联类型','必填，单选正片/线索，默认正片。切换后清空关联内容并重置素材类型及依赖账号。','[data-cp-editor="type"]'),
 cp('关联正片 / 关联线索','必填。输入名称或ID搜索，在同一输入框展开的候选中单选；仅输入文字不算选中。支持上下键选择、回车确认、清空重选；无结果时调整关键词。','#cpContentSearch'),
 cp('素材类型','必填，下拉单选。正片可选花絮/剧情回顾/剧情解析，默认花絮；线索可选预告片/花絮/剧情解析，切换线索后默认预告片。','[data-cp-editor="materialType"]'),
 cp('抖音发布账号','必填。正片选好后自动带入对应抖音账号，不可修改；线索从有效授权账号中下拉单选，默认未选。','[data-cp-editor="dyAccount"]'),
 cp('红果厂牌账号','必填，从可用厂牌账号中下拉单选，默认未选，独立于抖音发布账号。','[data-cp-editor="hgAccount"]'),
 cp('视频封面','必填，回显当前封面，点击更换封面上传图片；保存及提审时不得为空。图片规格待接口确认。','.cp-draft-cover'),
 cp('抖音视频标题','必填，多行文本，允许话题和@；支持手动输入或本平台AI生成。字数限制待确认。','[data-cp-editor="dyTitle"]'),
 cp('红果视频标题','必填，多行文本，不允许自由输入#或@；话题从下方已有选项选择。字数限制待确认。','[data-cp-editor="hgTitle"]'),
 cp('红果话题','非必填，多选已有话题，默认不选。不能新建话题，选中内容随红果标题保存。','.cp-topic-options'),
 cp('是否AI作品','始终展示，不受关联类型影响。必填，单选是/否，初始不选；是、否均为有效选择。','[data-cp-boolean="ai"]'),
 cp('是否挂载锚点','关联类型为线索时显示且必填，单选是/否，初始不选，选择否也视为完成。正片不显示、不校验；切换关联类型时清空选择。实际挂载仍需符合平台资格及关联内容上架状态。','[data-cp-boolean="anchor"]'),
 cp('确定','校验关联内容、类型、双端账号、标题、封面和是否AI作品，线索另校验是否挂载锚点；同身份同短剧下相同素材不重复提交。校验通过保存当前素材配置，暂不提审；失败保留内容并提示原因。','[data-action="cp-save-draft-editor"]'),
 cp('取消 / 关闭','放弃本次未保存内容，返回当前平台列表。','.cp-material-modal [data-action="close-modal"]')
]))}
function librarySections(){return [
 section('OSS文件库 · 筛选项',filterFields('#libraryFilters',[
 ['query','素材名','文本输入，默认空，按文件名关键词匹配。'],['folder','文件夹','下拉单选，默认全部文件夹，与素材名条件同时生效。']
 ]),false,'filters'),
 section('OSS文件库 · 列表项',columnFields([
 ['素材 / 文件夹','展示素材原文件名及所属文件夹；不在此步骤选择所属剧目。'],['大小 / 时长','展示文件大小与视频时长，用于核对素材规格。'],['上传人 / 时间','展示剪辑上传人员及上传时间。'],['状态','可用：允许选择；处理中或不可用：置灰不可选；已加入：已在当前任务/平台中，不能重复加入。']
 ],'#overlay .library-table'),false,'columns'),
 section('OSS文件库 · 操作',fields([
 ['勾选 / 本页全选','行首勾选单份可用素材；表头仅选择本页可用且未加入的素材。跨页勾选保留，已选数量累计。','#librarySelectPage, [data-library-file]'],
 ['翻页','每页6份素材，首页/末页对应按钮置灰。翻页不清空勾选。','#overlay [data-action="library-page"]'],
 ['加入任务','至少勾选1份；全任务最多100份不同素材，重复素材不增加份数。超过上限保留弹窗并提示减少选择；通过后加入并关闭。平台内补选只加入当前平台。','#addLibraryAssets'],
 ['取消 / 关闭','关闭文件库，不加入本次新勾选素材，已加入的素材不受影响。','.library-modal [data-action="close-modal"]']
 ]))
]}
function chooseMaterials(){return spec('新增发视频 · 选择素材','从OSS文件库选择本次发布素材，确认后进入各平台账号和作品信息配置。',[
 ...librarySections(),
 section('已选素材 · 列表项',columnFields([
 ['素材名称','展示已加入任务的视频文件名。'],['来源文件夹','展示该文件在OSS文件库中的来源文件夹。'],['大小 / 时长','展示视频大小、时长，便于确认文件。'],['状态','展示可用状态；提交前复核文件版本，文件失效或版本变化时需重新选择。']
 ]),false,'columns'),
 actionSection('选择素材','打开OSS文件库弹窗，按条件查询并勾选素材。',act('open-library')),
 actionSection('移除素材','将该素材从本任务移除，不删除OSS原文件。返回本步骤移除已配置素材时，同时移除其在本任务各平台的待发布配置。',act('remove-asset')),
 actionSection('保存草稿','保存已选素材及已有平台配置。后续从管理页继续草稿；补选素材不覆盖已有素材配置。',act('save-draft')),
 actionSection('返回 / 取消','打开返回确认框。点击“保存并返回”保存当前草稿并回到管理页；点击取消继续编辑。',act('exit-wizard')),
 section('返回确认',fields([['保存并返回','保存当前素材及平台配置为草稿，返回管理列表。','#confirmAction'],['取消 / 关闭','继续停留在当前步骤，不退出。',{selector:'#overlay [data-action="close-modal"]',requires:'#confirmAction'}]])),
 actionSection('下一步','至少选1份素材后进入分配账号与挂链；没有素材时提示先选择素材。',act('next-step'))
])}
function platformColumnSection(p){
 const scope=`[data-platform-section="${p}"]`;
 let rows=[['素材名','展示当前平台使用的素材文件名、大小和时长。'],['素材封面','展示当前明细设置的封面缩略图。'],[displayPlatform(p),'展示该条明细的发布账号；点击账号名称可重新选择。多账号分别生成配置行。']];
 if(p==='抖音')rows.push(['端上合集','展示当前抖音号选定的端上合集；未配置显示待选择合集。'],['作品标题 / 作品简介','分别展示作品标题和作品简介，两个字段独立保存。'],['发布时间','立即发布显示立即发布；定时发布展示日期及时间，未填显示待选择时间。']);
 if(p==='视频号')rows.push(['挂链类型 / 关联合集','分别展示挂链类型、该账号在该类型下选定的合集。'],['素材描述','展示当前账号对应的描述/视频描述。'],['发布时间','展示已设置的日期时间，未填时显示待选择时间。']);
 if(p==='快手')rows.push(['挂链类型 / 挂载短剧','分别展示作者服务或通栏服务、所选任务关联的短剧名称。'],['作品描述','展示当前快手号发布的文案，默认按任务带入剧名及题材。'],['发布时间','展示立即发布或已设置的定时日期时间。']);
 if(p==='快手经管平台')rows=[['素材名','本平台选定的视频文件名。'],['快手号','本条明细的经管账号；点击可调整。'],['短剧名称 / 短剧ID','展示当前账号匹配的平台短剧名称与ID；未匹配时显示原因，不能提交。'],['剪辑标题','展示手动填写或AI生成后确认应用的剪辑标题，最多20字；未填显示“—”。'],['剪辑类型','展示高光或花絮；未选显示“—”。'],['作者声明','展示作品不涉及AI生成或含AI生成内容；未选显示“—”。']];
 if(p==='抖音版权中台')rows=[['素材名称','展示OSS视频文件名。'],['短剧名称','展示选定的关联正片或线索名称。'],['关联类型','展示正片或线索。'],['素材类型','展示花絮、剧情回顾、剧情解析或预告片。'],['抖音发布账号','展示该素材关联的抖音账号。'],['红果厂牌账号','展示选定的红果厂牌账号。'],['是否挂载锚点','线索类型展示是/否，尚未填写显示“—”；正片显示“—”。'],['是否AI作品','展示是/否；尚未填写显示“—”。'],['抖音视频标题','展示将提交到抖音的标题。'],['红果视频标题','展示将提交到红果的标题。'],['审核状态','尚未提审显示“—（未提审）”。提交后在管理列表分别查看两端审核结果。']];
 return section(displayPlatform(p)+' · 列表项',columnFields(rows,scope),false,'columns');
}
function assignPlatforms(){return spec('新增发视频 · 分配账号与挂链','同一批素材可发布至多个平台。按平台选择账号、编辑作品信息，全部配置完成后统一确认。',[
 ...librarySections(),...['抖音','视频号','快手','快手经管平台','抖音版权中台'].map(platformColumnSection),
 actionSection('发布平台','多选抖音号、视频号、快手号、快手经管平台、抖音版权中台，至少选择1个。勾选后上下排列；取消的平台不参与提交，重新勾选恢复已填配置。','.form-line > .field-title'),
 actionSection('展开 / 收起','点击平台标题展开或收起，保留素材及已填信息，不改变提交范围。',{selector:'.platform-section-toggle',each:'.platform-section'}),
 actionSection('选择素材','位于各平台列表上方右侧，用于新增素材。点击打开OSS文件库，为当前平台补选视频；补选只加入当前平台，同一文件在全任务中不重复占份数。',{selector:'[data-action="platform-library"]',each:'.platform-section'}),
 actionSection('勾选素材','当前平台内勾选需要批量分配账号或AI生成的素材，两项操作共用勾选范围。表头全选仅影响该平台；同一素材分配多个账号仍按1份素材计数。取消全部勾选后，两项操作恢复置灰。',{selector:'[data-ai-all]',each:'.platform-section'}),
 section('选择账号','<p>未勾选素材时，“批量选择账号”置灰不可点击；勾选后启用，仅作用于当前平台已勾选素材，未勾选素材的账号和配置保留。行内入口只调整当前素材，无需先勾选。支持多选，至少选择1个有效账号，失效账号置灰。确认后按素材与账号分别生成明细，取消保留原分配。</p>'+fields([
 ['抖音号','先选择抖音号，再在编辑弹窗中选择该账号的端上合集。'],
 ['视频号','选择视频号后，按挂链类型选择该账号对应范围的合集。'],
 ['快手号','使用快手创作者账号；任务按账号和作者服务/通栏服务分别选择。'],
 ['快手经管平台','从经管账号中选择，短剧信息按素材与账号匹配。版权中台的双端账号在编辑素材弹窗中设置。']
 ])),
 section('编辑素材','<p>点击当前行编辑素材，先回填该素材及账号的信息。抖音号、视频号、快手号及快手经管平台先选账号再编辑；版权中台在编辑弹窗内设置双端账号。保存前校验必填项，失败保留填写内容。取消不写入。</p>'+fields([
 ['抖音号','配置端上合集、封面、作品标题、作品简介及发布时间。'],
 ['视频号','按四种挂链类型展示对应的合集、小程序、描述、视频标注、封面及时间字段。'],
 ['快手号','配置作品描述、挂链类型与变现任务、发布时间；默认第一帧封面及作者声明。'],
 ['快手经管平台','填写20字内剪辑标题，选择高光/花絮及作者声明。'],
 ['抖音版权中台','配置关联内容、素材类型、双端账号与标题、封面、是否AI作品；线索类型另选是否挂载锚点。打开弹窗后，右侧按当前平台逐字段说明。']
 ])),
 ...['抖音','视频号','快手'].map(editorSection),kmEditorSection(),
 section('选择账号 · 弹窗',fields([
 ['账号勾选','显示当前平台可选账号及授权状态，支持多选；单素材编辑回显已选账号，批量操作初始不勾选。',{selector:'[name="assignAccount"], [name="kmAccount"]',closest:'.checkbox-row'}],
 ['确认分配 / 确定','至少选择1个有效账号。确认后按本次操作范围内的“素材×账号”生成配置明细，更新列表；未选时保留弹窗并提示。','#applyAccounts, #kmSaveAccounts'],
 ['取消 / 关闭','关闭弹窗，不改变原账号分配。',{selector:'#overlay [data-action="close-modal"]',requires:'[name="assignAccount"], [name="kmAccount"]'}]
 ])),
 section('视频号 · 选择合集',fields([
 ['合集名称','支持输入合集名称或ID，默认空；搜索当前账号、当前挂链类型下的候选。','#nativeCollectionFilters [name="query"]'],
 ['合集名称','展示候选合集名称，与输入关键词匹配。',{column:'合集名称',scope:'#overlay'}],
 ['合集ID','展示候选合集ID，用于区分同名合集。',{column:'合集ID',scope:'#overlay'}],
 ['选择','点击候选行“选择”，回到编辑弹窗并带入合集、封面和默认描述。确认前可继续修改描述。','[data-native-collection]'],
 ['取消','返回编辑弹窗，保留原来选定的合集。','#nativeCollectionCancel']
 ])),
 ...[cpEditorSection(),aiSection(),syncSection()],
 actionSection('移除素材','仅移出当前平台的待发布范围；同一素材的多个账号配置一并退出该平台提交范围，不删除OSS文件，也不影响其他平台。',{selector:'[data-action="exclude-material"], [data-action="km-remove"], [data-action="cp-remove-asset"]',each:'.platform-section'}),
 actionSection('保存草稿','保存素材、所选平台、账号及已填配置，未填完也可保存；不创建发布或审核任务。',act('save-draft')),
 actionSection('上一步','返回选择素材，保留当前平台配置，可继续补选视频。',act('previous-step')),
 actionSection('返回','打开返回确认框。选择“保存并返回”后保存草稿并回管理页；取消则留在当前步骤。',act('exit-wizard')),
 section('返回确认',fields([['保存并返回','保存当前草稿并返回管理列表。','#confirmAction'],['取消 / 关闭','保留本页配置，继续编辑。',{selector:'#overlay [data-action="close-modal"]',requires:'#confirmAction'}]])),
 actionSection('下一步','至少选择一个平台后进入确认页，逐条展示校验结果；此时尚未发布或提审。',act('next-step')),
 section('待确认',bullets(['抖音及版权中台标题、简介的正式字数限制及计数方式；快手描述字数和最远预约范围。','快手经管平台短剧匹配方式、类型名称和状态枚举；版权中台的分端编辑及提审接口。']),true)
])}
function aiSection(){return section('AI生成标题 / 文案',`<p>先勾选当前平台素材，再打开生成弹窗。抖音号、快手经管平台、版权中台生成标题，视频号、快手号生成描述。AI生成操作紧随“已勾选 x 份”显示，未勾选素材时置灰。</p>`+fields([
 ['生成字段','至少勾选1项，首次默认全部勾选。抖音号：作品标题；视频号：素材描述；快手号：作品描述；快手经管平台：剪辑标题；版权中台：抖音视频标题、红果视频标题，可分别勾选。','[data-ai-field]'],
 ['字数上限','快手经管平台默认20字内，可自定义1～20的整数；剪辑标题生成、手动修改和应用均不得超过20字。其他平台每个字段单独设置，默认30字内，可选50字内或自定义1～200的整数；30/50是业务生成目标，不代表平台上限，视频号外部描述仍不得超过100字。','[data-ai-preset], [data-ai-limit]'],
 ['应用方式','默认“仅填充空白内容”，保留已有文案。选择“覆盖已有内容”后才替换已填值；一份素材多个账号分别判断是否已有内容。','[name="aiOverwrite"]'],
 ['生成预览','按素材名称中的合集ID找到绿台短剧简介后生成。无法识别、匹配多部短剧或缺少简介时显示原因并跳过，不猜测剧目。修改字段或上限后需重新生成。','#platformAIGenerate'],
 ['素材 / 目标字段','展示素材名称、目标字段及识别的剧目和合集ID，版权中台双端标题分别成行。',{column:'素材 / 目标字段',scope:'.platform-ai-table'}],
 ['绿台短剧简介','展示本次生成使用的简介；无法获取时显示原因。',{column:'绿台短剧简介',scope:'.platform-ai-table'}],
 ['生成结果（可编辑）','可手动改写，实时显示字数/上限。空内容或超限时不能应用；无法生成项不提供应用内容。',{column:'生成结果（可编辑）',scope:'.platform-ai-table'}],
 ['重新生成','结果行入口只重做该素材的该字段；上方重新生成重做当前勾选范围。预览尚未写入正式配置。','[data-ai-regenerate]'],
 ['确认应用','仅写入当前平台、所选素材和字段；更新数量及跳过数量给出提示。没有有效结果时置灰，校验失败保留弹窗；抖音标题生成不会覆盖作品简介，也不改OSS文件名。快手经管平台仅更新剪辑标题，保留剪辑类型和作者声明；未选账号时先保存素材标题，后续选好账号自动带入。','#platformAIApply'],
 ['取消 / 关闭','关闭弹窗，丢弃未应用结果，原素材配置保持原样。','.ai-title-modal [data-action="close-modal"]']
 ]),false,'actions',{selector:'[data-action="platform-ai"]',each:'.platform-section'})}
function syncSection(){return section('同步信息','<p>以当前行已保存的信息为来源，打开弹窗选择要同步的本平台素材。抖音号、视频号、快手号和快手经管平台未选账号时按钮置灰；版权中台须先编辑并保存来源素材。弹窗勾选独立于列表勾选。</p>'+fields([
 ['全选','打开弹窗默认全选当前平台素材，包括来源素材；取消全选后可逐份勾选。','#syncAll'],
 ['素材名称','每份素材一行复选框，展示完整名称。选择某素材即选择该素材在本平台的目标明细，不跨平台同步。',{selector:'[name="syncMaterial"]',closest:'.sync-checkbox'}],
 ['抖音号同步范围','同步来源抖音账号、端上合集、视频封面、作品标题、作品简介和发布时间。目标素材原账号分配会替换为来源账号，确认前应核对范围。'],
 ['视频号同步范围','保留目标素材原视频号；同步挂链类型、小程序、封面、描述、发布时间，标题仍为各素材文件名，视频标注保留各素材原值。同账号可同步合集，跨账号须重新选择目标合集。'],
 ['快手号同步范围','保留目标快手号；同步挂链类型、描述及发布时间，封面仍为第一帧，声明仍用默认值。同账号可同步任务；跨账号清空任务并重新选，自动描述等待新任务带入。'],
 ['快手经管平台同步范围','同步剪辑标题、剪辑类型、作者声明，覆盖目标素材各账号的对应字段；保留目标素材的快手号及按素材、账号匹配的短剧。未选账号的素材先保存这些信息，后续选账号时回填。'],
 ['抖音版权中台同步范围','同步关联类型及关联内容、素材类型、抖音发布账号、红果厂牌账号、视频封面、双端标题、红果话题、是否AI作品，以及线索类型的是否挂载锚点；同步正片时清空锚点选择。目标素材原配置会被覆盖；素材文件、当前身份及审核结果不复制。同步后仍按每份素材校验重复投稿、账号及必填信息，确认提交时才提审。'],
 ['确定','按勾选范围立即覆盖对应待发布配置，关闭弹窗并提示同步完成。来源素材不会产生重复明细；未勾选任何素材时不改动。尚未选账号的目标仍须补选账号及挂链目标。','#applyMaterialSync'],
 ['取消 / 关闭','关闭弹窗，不同步任何内容。','.sync-material-modal [data-action="close-modal"]']
 ]),false,'actions',{selector:'[data-action="sync-material"], [data-action="km-sync"], [data-action="cp-sync-draft"]',each:'.platform-section'})}

function confirmPublishing() {
  return spec('新增发视频 · 确认发布', '核对发布明细后提交。抖音号、视频号、快手号创建发布任务，快手经管平台提交剪辑，版权中台素材提交审核。', [
    section('列表项', fields([
      ['平台 / 账号', '展示每条明细的目标平台和发布账号。'],
      ['素材与关联内容', '展示素材名称及该账号下关联的短剧或挂链目标。'],
      ['作品信息', '按平台展示标题、简介或描述；快手经管平台同时展示剪辑类型和作者声明。'],
      ['提交方式 / 时间', '普通平台展示设置的发布时间；快手经管平台显示立即发布，版权中台显示提交审核。'],
      ['校验结果', '展示通过或未通过。未通过时列出原因，可返回上一步修改。']
    ])),
    section('保存草稿', '<p>保存当前配置和待处理明细，稍后可继续编辑。</p>'),
    section('上一步', '<p>返回分配账号与挂链，保留当前配置并补齐问题项。</p>'),
    section('提交前校验', bullets([
      '逐条校验素材可用状态及版本、账号授权、挂链目标、必填内容和发布时间。异常原因展示在对应明细中。',
      '有异常明细时，默认阻止整批提交。业务明确勾选“仅提交通过项”后，只提交校验通过的明细，其余保留为草稿。',
      '确认提交时再次校验，避免编辑期间账号授权或素材状态发生变化。'
    ])),
    section('发布间隔', bullets([
      '点击“批量发布”后打开现有确认弹窗。发布间隔为下拉单选，必填，默认15分钟；可选15、30、60、75、90、120、180、240分钟。',
      '同一账号下的多个视频按间隔依次顺延，不同账号分别计算。顺延后再次检查定时范围及挂链任务有效期。',
      '间隔设置适用于抖音、视频号、快手的发布任务；快手经管平台提交后发布，版权中台按素材提审，两者不按该间隔排期。'
    ])),
    section('版权中台提审', bullets([
      '校验关联内容、素材类型、双端账号、双端标题、封面、是否AI作品；线索另校验是否挂载锚点，正片不校验；同一身份、同一短剧下不重复提交相同素材。',
      '关联内容在两端均未上架时，不允许提交。仅抖音端未上架时待投稿，上架后自动投稿；仅红果端未上架时可发布，但不挂锚点。',
      '正片每剧最多30条，线索每剧最多200条。任一端发布成功计1条，两端均成功不重复计数，删除不返还额度。'
    ])),
    section('提交确认弹窗',fields([
 ['确定','再次校验素材、账号授权、必填信息及顺延后的时间和任务有效期。通过后创建发布或审核任务；失败留在弹窗并给出原因，调整后再提交。','#confirmBatchPublish, #kmConfirmSubmit'],
 ['取消 / 关闭','关闭确认框，保留配置并返回确认页，不提交任务。','#overlay [data-action="close-modal"]']
 ])),
 section('提交结果', bullets([
      '提交成功后进入任务结果页，记录本批任务。版权中台素材直接进入审核流程，可在版权中台列表查看双端结果。',
      '已提交成功的明细从草稿待提交范围中排除；业务补齐剩余明细后，只提交尚未成功的部分。'
    ]))
  ]);
}

const pages = {
  list: message => publishingList(message.platform),
  wizard: message => message.step === 1 ? chooseMaterials() : message.step === 2 ? assignPlatforms() : confirmPublishing(),
  config: () => spec('发布文案模板', '为后续任务设置默认文案，业务可在编辑素材时逐条调整。', [
    section('列表项',columnFields([['模板名称','展示模板名称，用于区分不同文案。'],['适用平台','展示全部平台或指定的抖音号、视频号、快手号。'],['文案内容','展示保存的模板原文和变量。'],['状态','展示已启用或已停用；停用后不用于后续配置。']])),
    section('新增模板', '<p>打开弹窗，设置模板名称、适用平台及文案内容。</p>'),
    section('编辑模板', '<p>修改当前模板的名称、平台和文案内容，保存后用于后续配置。</p>'),
    section('启用 / 停用', '<p>调整模板状态，停用后不再用于后续配置；不改写已提交内容。</p>'),
    section('模板变量', fields([
      ['抖音号 / 视频号', '支持“{剧目名}”，生成任务内容时替换为所选剧目名称。'],
      ['快手号', '支持“#{剧名}#{短剧题材}”，作为作品描述的默认内容。']
    ])),
    section('模板编辑弹窗',fields([
 ['模板名称','必填文本，新增时为空，编辑时回显；全空格不能保存。','#configForm [name="name"]'],
 ['平台','下拉单选，默认全部；可选择抖音、视频号、快手，限定模板适用范围。','#configForm [name="platform"]'],
 ['文案内容','必填多行文本，支持模板变量；空内容不能保存。','#configForm [name="text"]'],
 ['保存','校验名称和文案后保存；新增模板默认启用，编辑保留原状态。更新列表并关闭弹窗，不覆盖已应用文案或已提交任务。','#saveConfig'],
 ['取消 / 关闭','放弃未保存修改。',{selector:'#overlay [data-action="close-modal"]',requires:'#configForm'}]
 ])),
 section('生效规则', bullets([
      '保存模板后用于后续配置，不改写已提交任务的发布内容。',
      'AI生成在“分配账号与挂链”页面按平台操作，生成并确认后才写入已选素材。'
    ]))
  ]),
  batch: () => spec('批次详情', '按提交批次核对各账号的排期、发布结果及异常明细。', [
    section('列表项', bullets([
      '一份素材发布到多个平台或账号时，分别形成发布明细，各自记录账号、挂链目标、发布时间和结果。',
      '记录提交时使用的素材版本和发布内容。抖音作品标题、作品简介分别保存。',
      '同账号多条视频展示顺延后的最终时间，发布成功时间以实际成功结果为准。'
    ])),
    section('结果处理', bullets([
      '失败明细显示具体原因，已成功的任务不随失败任务重复提交。',
      '混合批次中的版权中台素材可进入对应管理列表，查看抖音、红果各自的审核和发布结果。'
    ]))
  ])
};

const annotations = createReviewAnnotations(frame, notes);
let pageKey = '';
function show(message) {
  const key = [message.page, message.step, message.page === 'list' ? message.platform : ''].join(':');
  if (key !== pageKey) {
    pageKey = key;
    notes.innerHTML = (pages[message.page] || pages.list)(message);
    notes.scrollTop = 0;
  }
  annotations.update(message);
}
window.addEventListener('message', event => {
  if (event.origin === location.origin && event.source === frame.contentWindow && event.data?.type === 'publishing-page') show(event.data);
});
show({page: 'list', platform: '抖音'});
