// Incremental requirements for the status overview embedded in management lists.
export const overviewMarker=n=>`<button type="button" class="overview-marker" data-overview-note="${Number(n)}" aria-label="查看状态说明${Number(n)}">${Number(n)}</button>`;

const item=(name,text)=>`<li><b>${name}：</b>${text}</li>`;
const list=items=>`<ul>${items.join('')}</ul>`;
const section=(n,title,items)=>`<section id="overview-note-${n}" class="overview-note-section" tabindex="-1"><h3><span class="overview-note-number">${n}</span>${title}</h3>${list(items)}</section>`;
const intro=(page,background,need)=>`<h2>#页面说明</h2>${list([`<li>本页是${page}。</li>`])}<h2>#原型说明</h2>${list([item('背景',background),item('需求',need)])}`;
const platform=s=>s.ui.system==='platform';
const maker=s=>s.ui.system==='supplier'&&s.ui.identity==='maker';
const writer=s=>s.ui.system==='supplier'&&s.ui.identity==='script';
const phaseName=phase=>phase==='awaiting'?'待立项剧本':'待分配剧本';

function scopeItems(s){
 if(platform(s))return [
  item('可见范围','按当前账号的撮合业务权限统计；未匹配剧本与已匹配项目分别进入对应指标，点击指标不会扩大数据权限。'),
  item('剧本来源','可选全部来源、内部自有剧本、外部剧本；同时约束概览计数和下方列表，并随待分配／待立项入口带入剧本库。')
 ];
 if(maker(s))return [item('可见范围','待筛选统计有效推送给当前承制方的剧本；制作及发行阶段统计当前由本方承制的项目；终止记录按本方曾参与的合作范围展示。')];
 return [item('可见范围','仅统计当前剧本供应商提交的剧本及其后续项目，包含审核中的剧本；不展示其他剧本方的数据。')];
}

function metricItems(s){
 const production=[
  item('开发中剧集','承制方确认选中即进入开发中，包含制作交付、制作审核、正片安全审核和发行资料准备；满足待排期条件后移出。'),
  item('待排期剧集','三项制作交付与终版审核通过、正片安审通过、两类适用物料确认、适用合同留档完成，尚未完成平台上线排期配置。'),
  item('已排期剧集','平台已配置计划上线时间及发行渠道，尚无渠道实际上线；供应商查看同步结果。'),
  item('已上线剧集','至少一个发行渠道已实际上线；未全部渠道上线时，该项目同时计入项目进行中。')
 ];
 const before=maker(s)?[
  item('待筛选剧本','本方收到仍有效、待反馈且未被其他承制方选中的剧本推送。点击进入剧本评估，只筛选本方当前可处理的待反馈记录。')
 ]:[
  item('待分配剧本','内容审核与安全审核均通过，尚未匹配承制方，且没有有效的待反馈推送；包含待评级及终止承制合作后回库待重新匹配的剧本。'+(platform(s)?'点击进入剧本库并精确筛选此范围。':'点击在当前内容管理列表筛选。')),
  item('待立项剧本','尚未确定承制方，已有有效推送，等待承制方确认选中；该名称表示等待选本结果，不增加立项审批。'+(platform(s)?'点击进入剧本库并精确筛选此范围。':'点击在当前内容管理列表筛选。'))
 ];
 const ongoing=writer(s)?'本方所有尚未结束的剧本及项目，包括审核中、待分配、待立项和后续制作发行；全部渠道上线或剧本已终止后移出。':maker(s)?'当前已由本方选中、合作未终止且尚未全部渠道上线的项目；有效推送但尚未选中的剧本归待筛选。':'当前已匹配承制方、合作未终止且尚未全部渠道上线的项目；未匹配剧本通过待分配／待立项入口进入剧本库。';
 const ended=writer(s)?'当前已终止的本方剧本。承制合作终止并回库后，剧本继续按当前状态推进，不计为剧本已终止。':'当前已终止的所属记录及已终止承制合作的历史记录。终止合作后回库的剧本按当前状态继续统计，旧合作独立保留。';
 return [...before,...production,item('项目进行中',ongoing),item('项目已终止',ended),item('计数关系','阶段指标与总体状态不能相加。拒选、推送超时和撤回不计为项目终止；同一项目可同时计入已上线与项目进行中。')];
}

function listItems(s){
 const defaultScope=platform(s)?'默认展示当前账号可见、已匹配承制方的当前项目记录；未匹配剧本通过顶部指标进入剧本库。':maker(s)?'默认展示当前由本承制方选中的项目；尚未选中的有效推送通过待筛选入口进入剧本评估。':'默认展示本方全部当前剧本及项目，包括审核中、待匹配、制作发行和当前已终止记录。';
 return [
  item('默认列表范围',defaultScope+(writer(s)?'承制合作终止后，本方继续查看剧本当前状态。':'历史承制合作仅在项目已终止范围展示。')),
  item('状态与列表','顶部状态概览作为唯一状态筛选入口；全部记录、总体状态和阶段状态单选切换，直接筛选下方列表并从第一页展示，不再重复展示原阶段Tab。'),
  item('关键词'+(platform(s)&&s.ui.overviewMetric!=='ended'?'与只看我的待办':''),'仅筛选下方当前状态的记录，不改变顶部概览计数。概览计数按权限'+(platform(s)?'与剧本来源':'')+'计算，列表叠加查询条件后条数可少于概览数字。'),
  item('列表操作','沿用当前角色、当前记录状态对应的操作入口；查看详情、上传、审核等仍针对所选记录处理。'),
  item('空结果','当前状态或查询条件下无记录时显示空态，保留状态入口与查询条件，允许继续切换。')
 ];
}

function endedItems(s){
 return [
  item('项目 / 剧本名称','展示当前已终止记录的名称；历史合作使用该次合作留档名称，并保留所属剧本编号。'),
  item('记录类型',writer(s)?'标明当前已终止剧本。':'区分当前已终止记录与已终止承制合作，避免把历史合作当作当前项目。'),
  ...(platform(s)?[item('承制方','显示当前记录或该次历史合作对应的承制方；未记录时显示“—”。')]:[]),
  item('终止时间','显示该记录实际保留的终止时间；历史记录缺少时间时显示未记录，不补造。'),
  item('终止原因','显示该次终止时填写的原因；旧记录缺失时明确标识未记录。'),
  item('操作',writer(s)?'查看详情：进入当前已终止剧本的详情，沿用原有查看权限。':'查看终止记录：只读查看该次历史合作及其留档资料；查看详情：进入当前已终止记录，沿用原有权限。'),
  ...(!writer(s)?[item('重新匹配后的记录','剧本回库后可继续匹配新的承制方；原合作终止记录保持只读，不带入新合作的交付与审核结果。')]:[])
 ];
}

function mainNotes(s){
 const role=platform(s)?'平台端':maker(s)?'供应商端 · 承制方':'供应商端 · 剧本方',page=platform(s)?'撮合管理':'内容管理';
 let html=intro(`${role} · 撮合业务 · ${page}页`,'业务人员需要从同一工作页面了解进度并处理当前记录。','将撮合状态概览嵌入管理列表，按角色显示统计范围，点击状态直接筛选或进入对应业务列表。');
 html+=section(1,'筛选项 · 状态概览',[...scopeItems(s),...metricItems(s)]);
 html+=section(2,'列表项与操作项 · 范围联动',listItems(s));
 if(s.ui.overviewMetric==='ended')html+=section(3,'列表项与操作项 · 已终止记录',endedItems(s));
 return {title:`${page} · 状态概览`,html};
}

function libraryNotes(s){
 const label=phaseName(s.ui.overviewLibraryPhase),definition=s.ui.overviewLibraryPhase==='awaiting'?'审核通过、尚未确定承制方且存在有效待反馈推送的剧本。':'审核通过、尚未匹配承制方且无有效待反馈推送的剧本，包含待评级与终止合作回库待重配。';
 return {title:`剧本库 · ${label}`,html:intro('平台端 · 撮合业务 · 剧本库的状态筛选页','撮合管理中的未匹配剧本需要回到剧本库继续评级或匹配。',`从撮合管理的${label}指标进入，只展示该指标对应的剧本范围。`)+section(1,'筛选项与操作项 · 来源状态',[
  item('当前状态',`${label}：${definition}列表限定为该精确状态范围。`),
  item('权限与来源','沿用进入前的账号可见范围和剧本来源条件；其他列表查询条件在此基础上继续筛选。'),
  item('查看全部剧本','清除本次精确状态范围，返回剧本库的全部剧本列表；保留已填写的常规查询条件。'),
  item('返回撮合管理','返回来源管理页并恢复其状态及查询条件。'),
  item('后续处理','在剧本库使用原有评级、匹配和查看入口；操作完成后按最新推送及匹配结果更新对应状态。')
 ])};
}

function selectionNotes(){
 return {title:'剧本评估 · 待筛选剧本',html:intro('供应商端 · 承制方 · 撮合业务 · 剧本评估的待筛选页','承制方需要从内容管理快速进入尚待自己选择的剧本。','从待筛选剧本指标进入，仅展示本方当前有效的待反馈剧本。')+section(1,'筛选项与操作项 · 来源状态',[
  item('当前状态','待筛选剧本：本方收到有效推送，尚未反馈且未被其他承制方选中；过期、撤回、拒选及被其他方选中的记录移出此范围。'),
  item('列表范围','沿用本承制方的账号及数据权限；关键词继续在当前待筛选范围内查询。'),
  item('查看全部剧本','清除本次待筛选限定，展示剧本评估全部选本记录；保留已填写的关键词。'),
  item('返回内容管理','返回来源内容管理页并恢复其状态及查询条件。'),
  item('确认选中','沿用现有选本操作；确认选中后获取全集并进入开发中，制作交付在内容管理继续处理。')
 ])};
}

export function overviewNotes(s,dialog){
 if(!s?.ui||s.ui.business!=='matching'||dialog||s.ui.id)return '';
 let notes;
 if(platform(s)&&s.ui.view==='library'&&['unassigned','awaiting'].includes(s.ui.overviewLibraryPhase))notes=libraryNotes(s);
 else if(maker(s)&&s.ui.view==='intake'&&s.ui.overviewSelection)notes=selectionNotes();
 else if(platform(s)&&s.ui.view==='projects'||(maker(s)||writer(s))&&s.ui.view==='content')notes=mainNotes(s);
 if(!notes)return '';
 return `<aside class="overview-notes" aria-label="撮合状态需求说明"><div class="overview-notes-meta">${notes.title}<span>2026.11.09 更新</span></div>${notes.html}</aside>`;
}
