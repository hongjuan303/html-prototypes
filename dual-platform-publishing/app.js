'use strict';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const PLATFORMS=['抖音','视频号','快手'];
const STORE='dual-platform-publishing-demo-v1';
const DRAMAS=[{id:'10086',name:'长街有月',cover:'长街\n有月',c:'c1'},{id:'10087',name:'春风知我意',cover:'春风\n知我意',c:'c2'},{id:'10088',name:'逆光而来的你',cover:'逆光\n而来的你',c:'c3'}];
const ACCOUNTS=[{id:'dy01',platform:'抖音',name:'星河短剧',group:'自营矩阵',owner:'运营一组',ok:true},{id:'dy02',platform:'抖音',name:'拾光剧场',group:'自营矩阵',owner:'运营一组',ok:true},{id:'dy03',platform:'抖音',name:'青禾看剧',group:'投流账号',owner:'投流二组',ok:false},{id:'wx01',platform:'视频号',name:'星河剧场',group:'自营矩阵',owner:'运营一组',ok:true},{id:'wx02',platform:'视频号',name:'晚风追剧',group:'自营矩阵',owner:'运营二组',ok:true},{id:'wx03',platform:'视频号',name:'微光故事',group:'外部合作',owner:'运营二组',ok:true}];
const STATUSES=['待上传','上传中','待发布','发布中','已提交待结果','已发布','发布失败','待确认','已取消'];
const HANGS=['自营小程序','自营端原生','外部小程序','外部端原生'];
const seedRows=()=>Array.from({length:18},(_,i)=>{const p=i%3===1?'视频号':'抖音',accounts=ACCOUNTS.filter(a=>a.platform===p),a=accounts[i%accounts.length],d=DRAMAS[i%3];let status=['已发布','已发布','发布失败','待发布','发布中','待确认','已发布','待发布','已发布'][i%9];const issue=i===1?'推广链创建失败':i===2?'账号授权失效':i===5?'平台结果待确认':i===8?'审核不通过':i===11?'视频格式不支持':'';if(issue==='账号授权失效')status='发布失败';return {id:'P'+(230001+i),batch:i<6?'FB20260923003':i<12?'FB20260923002':'FB20260923001',platform:p,account:issue==='账号授权失效'?'dy03':a.id,drama:d.id,name:`${d.id}_片段${String(i+1).padStart(2,'0')}_${p==='抖音'?'DY':'WX'}_V1.mp4`,desc:`${d.name}，故事才刚刚开始。 #短剧 #好剧推荐`,business:i%3===2?'投流':'自然流',status,issue,hang:p==='视频号'?HANGS[i%4]:'端原生',time:`2026-09-23 ${i<5?'18':'19'}:${String(i%6*10).padStart(2,'0')}`,created:'2026-09-23 15:20',audit:issue==='审核不通过'?'不通过':status==='已发布'?'通过':'未返回',link:issue==='推广链创建失败'?'创建推广链失败':status==='已发布'?'成功':'待处理',owner:'演示运营',privacy:'公开',retries:0};});
ACCOUNTS.push({id:'ks01',platform:'快手',name:'星河短剧社',group:'自营矩阵',owner:'运营一组',ok:true},{id:'ks02',platform:'快手',name:'晚风故事馆',group:'自营矩阵',owner:'运营二组',ok:true},{id:'ks03',platform:'快手',name:'青禾说剧',group:'合作账号',owner:'运营二组',ok:false});
let saved={};try{saved=JSON.parse(localStorage.getItem(STORE)||'{}')}catch(e){}
let rows=saved.rows||seedRows(),accounts=ACCOUNTS.map(a=>({...a,...(saved.accounts||[]).find(x=>x.id===a.id)})), draft=saved.draft||null;
let mappings=saved.mappings||[]; // Kept only for old local data; never used to choose publishing targets.
let templates=saved.templates||[{id:'t1',name:'自然流 · 剧情推荐',platform:'全部',business:'自然流',text:'{剧目名}，故事才刚刚开始。 #短剧 #好剧推荐',ok:true},{id:'t2',name:'投流 · 悬念片段',platform:'抖音',business:'投流',text:'没想到，{剧目名}的结局竟然是这样！ #短剧',ok:true}];
if(!templates.some(t=>t.id==='ks-default'))templates.push({id:'ks-default',name:'快手 · 剧名与题材',platform:'快手',text:'#{剧名}#{短剧题材}',ok:true});
let state={page:'list',platform:'抖音',view:'detail',filters:{},pageNo:1,pageSize:8,selected:new Set(),configTab:'mapping',batch:null,step:1,wizard:null,activePlatform:'抖音',assetSelected:new Set(),collapsed:false};
const persist=()=>{try{localStorage.setItem(STORE,JSON.stringify({rows,accounts,draft,mappings,templates,triPlatform:true}))}catch(e){toast('当前浏览器无法保存本地记录',true)}};
const drama=id=>DRAMAS.find(d=>d.id===id), account=id=>accounts.find(a=>a.id===id);
const cover=id=>{const d=drama(id)||DRAMAS[0];return `<span class="cover ${d.c}">${esc(d.cover).replace(/\n/g,'<br>')}</span>`};
const platformBadge=p=>`<span class="platform"><span class="platform-icon ${p==='视频号'?'wx':p==='快手'?'ks':''}">${p==='视频号'?'◉':p==='快手'?'∞':'♪'}</span>${p}</span>`;

// Demo catalogs deliberately have different availability and target IDs for each account and link type.
const CATALOG=ACCOUNTS.filter(a=>a.platform!=='快手').flatMap((ac,index)=>(ac.platform==='抖音'?['端原生']:HANGS).flatMap((type,ti)=>{
  const available=ac.id==='dy01'?[0,1]:ac.id==='dy02'?[0,2]:[(index+ti)%3,(index+ti+1)%3];
  return available.map(di=>({id:`${ac.id.toUpperCase()}-${ac.platform==='抖音'?'N':ti+1}-${DRAMAS[di].id}`,account:ac.id,platform:ac.platform,type,drama:DRAMAS[di].id,name:DRAMAS[di].name}));
}));
const KS_SERVICES=[{key:'author',label:'作者服务',type:'关联变现任务'},{key:'banner',label:'通栏服务',type:'关联短剧变现任务'}];
const KS_DECLARATION='演绎情节，仅供娱乐';
const KS_TASKS=ACCOUNTS.filter(a=>a.platform==='快手').flatMap((ac,i)=>KS_SERVICES.flatMap(service=>[0,1,2].map((n)=>({id:`${ac.id.toUpperCase()}-${service.key==='banner'?'B':'A'}-${n+1}`,account:ac.id,service:service.key,dramaName:DRAMAS[(i+n)%3].name,genre:['都市情感','古装爱情','逆袭成长'][(i+n)%3],name:DRAMAS[(i+n)%3].name+' · '+(service.key==='banner'?'短剧变现':'作者变现'),start:'2026-01-01',end:n===2?'2026-01-31':'2027-12-31',enabled:n!==2}))));
const ksCandidates=(id,service)=>KS_TASKS.filter(t=>t.account===id&&t.service===service);
const ksSelection=(w,assetId,id)=>Object.fromEntries(KS_SERVICES.map(s=>[s.key,ksCandidates(id,s.key).find(t=>t.id===w.ksTargets?.[targetKey(assetId,id)]?.[s.key])]));
const ksTaskValid=(task,time=new Date())=>!!task?.enabled&&time>=new Date(task.start+'T00:00:00+08:00')&&time<=new Date(task.end+'T23:59:59+08:00');
const ksOptions=(id,service,current='')=>'<option value="">请选择具体任务</option>'+ksCandidates(id,service).map(t=>`<option value="${t.id}" ${current===t.id?'selected':''} ${ksTaskValid(t)?'':'disabled'}>${esc(t.name)} · ${t.end} 截止${ksTaskValid(t)?'':'（已失效）'}</option>`).join('');
function setKsTarget(w,assetId,id,service,value){
 if(!KS_SERVICES.some(s=>s.key===service)||ksService(w,id,assetId)!==service)return;
 const key=targetKey(assetId,id);w.ksTargets[key] ||= {};
 const task=ksCandidates(id,service).find(t=>t.id===value&&ksTaskValid(t));
 w.ksTargets[key]=task?{[service]:value}:{};w.ksMetadata[key]=task?{dramaName:task.dramaName||'',genre:task.genre||''}:{};
}
if(!saved.triPlatform){
 rows.unshift(...['ks01','ks02'].map((id,i)=>({id:'KS-DEMO-'+i,batch:'FB202609240KS',platform:'快手',account:id,name:`短剧片段_0${i+1}_KS.mp4`,desc:'精彩故事，持续更新。 #短剧',services:{[i?'banner':'author']:{...ksCandidates(id,i?'banner':'author')[0]}},service:i?'banner':'author',coverMode:'视频第一帧',declaration:KS_DECLARATION,dramaName:DRAMAS[i].name,genre:['都市情感','古装爱情'][i],status:'已发布',issue:'',hang:i?'通栏服务 · 关联短剧变现任务':'作者服务 · 关联变现任务',time:'2026-09-24 18:00',created:'2026-09-24 15:20',audit:'通过',link:'成功',privacy:'公开',owner:'演示运营'})));
}
const targetKey=(assetId,accountId)=>assetId+'::'+accountId;
const accountType=(w,id,assetId)=>account(id)?.platform==='抖音'?'端原生':w.materialTypes?.[targetKey(assetId,id)]??w.accountTypes[id]??w.materialConfigs?.[account(id)?.platform+'::'+assetId]?.hang??'';
const availableTargets=(w,id,assetId)=>CATALOG.filter(t=>t.account===id&&t.type===accountType(w,id,assetId));
const selectedTarget=(w,assetId,id)=>availableTargets(w,id,assetId).find(t=>t.id===w.targets[targetKey(assetId,id)]);
const publishedDramaName=r=>r.platform==='快手'?(r.services?.[r.service]?.name||'未选变现任务'):r.targetName||drama(r.drama)?.name||'—';
const rowTargetSummary=r=>r.platform==='快手'?KS_SERVICES.filter(s=>s.key===r.service).map(s=>`<div class="target-summary"><b>${s.label}</b> ${esc(r.services?.[s.key]?.name||'未选任务')}<span class="cell-sub">${esc(r.services?.[s.key]?.id||'—')}</span></div>`).join(''):`${esc(publishedDramaName(r))}<span class="cell-sub">${esc(r.targetId||'历史记录')}</span>`;
const unitTargetSummary=u=>u.platform==='快手'?!u.service?'<span class="cell-sub">未选择挂链类型</span>':KS_SERVICES.filter(s=>s.key===u.service).map(s=>`<span class="cell-sub"><b>${s.label}</b> · ${s.type}</span><div>${esc(u.services?.[s.key]?.name||'未选择具体任务')}</div><span class="cell-sub">${esc(u.services?.[s.key]?.id||'—')}${u.services?.[s.key]?' · 截止 '+u.services[s.key].end:''}</span>`).join(''):`<span class="cell-sub">${esc(u.target?.name||'未选剧目')} · ${esc(u.config?.hang||'未选挂链类型')}</span><span class="cell-sub">${esc(u.target?.id||'—')}</span>`;
function setAssignments(w,p,assetId,ids){
  const previous=w.assignments[p+assetId]||[];
  // Only an unchanged account may retain its own target. Removed/re-added accounts must choose again.
  new Set([...previous,...ids]).forEach(id=>{if(!previous.includes(id)||!ids.includes(id)){delete w.targets[targetKey(assetId,id)];delete w.ksTargets[targetKey(assetId,id)];delete w.ksMetadata[targetKey(assetId,id)];delete w.materialTypes?.[targetKey(assetId,id)];delete w.materialAccountConfigs?.[targetKey(assetId,id)];delete w.materialServices?.[targetKey(assetId,id)];if(!w.assets.some(a=>a.id!==assetId&&(w.assignments[p+a.id]||[]).includes(id))){delete w.accountTypes[id];delete w.ksTypes[id]}}});
  w.assignments[p+assetId]=[...ids];
}
function setAccountType(w,id,type){
  if(accountType(w,id)===type)return;
  w.accountTypes[id]=type;
  w.assets.forEach(a=>delete w.targets[targetKey(a.id,id)]);
}
function normalizeDraft(value){
  const w=JSON.parse(JSON.stringify(value));
  if(![2,3,4,5,6].includes(w.schema)){w.targets={};w.accountTypes={};}
  w.schema=6;w.materialAccountConfigs ||= {};w.excluded ||= {};w.materialConfigs ||= {};w.materialTypes ||= {};w.materialServices ||= {};w.targets ||= {};w.ksTargets ||= {};w.ksTypes ||= {};w.ksMetadata ||= {};w.accountTypes ||= {};w.configs={...newWizard().configs,...w.configs};delete w.business;
  w.assets.forEach(a=>delete a.drama);
  w.configs['抖音'].hang='端原生';
  return w;
}
function targetOptions(w,id,current='',assetId){
  return '<option value="">请选择'+(account(id)?.platform==='抖音'?'该账号的端上剧':'对应剧目')+'</option>'+availableTargets(w,id,assetId).map(t=>`<option value="${t.id}" ${current===t.id?'selected':''}>${esc(t.name)} · ${t.id}</option>`).join('');
}

const LIST_SCHEMAS={
 '抖音':{filters:[['account','抖音号名称'],['description','视频描述'],['status','发布状态','status'],['publish','发布时间','date'],['dramaName','端上合集名称'],['material','素材名']],columns:[['account','抖音号',140],['name','素材名',190],['cover','素材封面',85],['desc','视频描述',240],['drama','端上合集',150],['status','发布状态',125],['issue','失败原因',180],['publishedAt','发布成功时间',165],['time','发布时间',165]]},
 '视频号':{filters:[['account','视频号名称'],['material','素材名'],['status','发布状态','status'],['hang','挂链类型','hang'],['publish','发布时间','date']],columns:[['account','视频号名称',145],['name','素材名',185],['cover','素材封面',85],['desc','素材描述',220],['annotation','视频标注',120],['drama','关联合集',145],['hang','挂链类型',130],['miniProgram','关联小程序',150],['status','发布状态',125],['issue','发布失败原因',180],['publishedAt','发布成功时间',165],['time','发布时间',165]]},
 '快手':{filters:[['account','快手号名称'],['material','素材名'],['status','发布状态','status'],['publish','发布时间','date'],['dramaName','挂载短剧名称'],['hang','挂链类型','hang']],columns:[['account','快手号',140],['name','素材名',190],['cover','素材封面',85],['desc','作品描述',230],['hang','挂链类型',115],['drama','挂载短剧名称',150],['status','发布状态',125],['issue','失败原因',180],['publishedAt','发布成功时间',165],['time','发布时间',165]]}
};
const mountedDramaName=r=>r.platform==='快手'?(r.dramaName||r.services?.[r.service]?.dramaName||'—'):r.targetName||drama(r.drama)?.name||'—';
const serviceLabel=r=>r.platform==='快手'?(KS_SERVICES.find(s=>s.key===r.service)?.label||'未配置'):r.hang||'—';
function legacyStatus(r){
 if(r.platform==='视频号')return r.issue==='推广链创建失败'?'发布成功但创建推广链失败':r.status==='已取消'?'已删除':r.status;
 return r.status==='已取消'?'已取消':r.status;
}

const statusBadge=s=>`<span class="status ${s==='已发布'?'green':s==='发布失败'?'red':['待确认','待发布'].includes(s)?'orange':['已取消','未返回'].includes(s)?'gray':'blue'}">${esc(s)}</span>`;
const pin=n=>`<span class="annotation-pin">${n}</span>`;
function toast(t,error=false){$('#toast').innerHTML=`<div class="toast ${error?'error':''}">${esc(t)}</div>`;clearTimeout(toast.timer);toast.timer=setTimeout(()=>$('#toast').innerHTML='',3300)}
function syncNote(){parent.postMessage({type:'publishing-page',page:state.page,step:state.step,tab:state.configTab,platform:state.platform},location.origin)}
const PUBLISHING_MENU='抖微快批量发视频';
function menu(){
 const group=(title,children)=>`<section><button class="menu-group-title" data-action="toggle-menu"><i class="nav-icon"></i><span class="menu-text">${title}</span><span class="menu-caret">⌃</span></button><div class="menu-children">${children}</div></section>`;
 const link=(text,action,active=false,value='')=>`<button class="menu-link ${active?'active':''}" data-action="${action}" data-value="${value}"><i class="nav-icon"></i><span class="menu-text">${text}</span></button>`;
 $('#menu').innerHTML=`<div class="nav-label"><i class="nav-icon"></i><span class="menu-text">业务功能</span></div>${group('版权管理',link(PUBLISHING_MENU,'nav-list',['list','wizard','batch'].includes(state.page),'全部'))}${group('内容分发',link('发布配置','nav-config',state.page==='config'))}${group('抖音号管理',link('抖音号列表','accounts',false,'抖音')+link('抖音号授权管理','accounts',false,'抖音'))}${group('视频号管理',link('视频号列表','accounts',false,'视频号'))}${group('快手号管理',link('快手号列表','accounts',false,'快手'))}`;
}
function render(){
 menu();$('#shell').classList.toggle('collapsed',state.collapsed);
 const title=state.page==='wizard'?'新增发视频':state.page==='batch'?'批次详情':state.page==='config'?'发布配置':PUBLISHING_MENU;
 $('#breadcrumb').innerHTML=state.page==='config'?`内容分发 <span>/</span> <em>${title}</em>`:`版权管理 <span>/</span> ${state.page==='list'?`<em>${PUBLISHING_MENU}</em>`:`${PUBLISHING_MENU} <span>/</span> <em>${title}</em>`}`;
 $('#tabbar').innerHTML=`<button class="page-tab ${state.page==='list'?'active':''}" data-action="nav-list" data-value="全部">${PUBLISHING_MENU} <span class="tab-x">×</span></button>${state.page!=='list'?`<button class="page-tab active" data-action="back-list">${title}<span class="tab-x">×</span></button>`:''}`;
 $('#main').innerHTML=state.page==='wizard'?renderWizard():state.page==='config'?renderConfig():state.page==='batch'?renderBatch():renderList();syncNote();
}
function selectedOptions(values,current,blank='全部'){return `<option value="">${blank}</option>`+values.map(v=>`<option ${v===current?'selected':''}>${esc(v)}</option>`).join('')}
function filtered(){
 const f=state.filters;
 return rows.filter(r=>r.platform===state.platform&&(!f.account||(account(r.account)?.name||'').includes(f.account))&&(!f.material||r.name.includes(f.material))&&(!f.description||r.desc?.includes(f.description))&&(!f.dramaName||mountedDramaName(r).includes(f.dramaName))&&(!f.status||legacyStatus(r)===f.status)&&(!f.hang||serviceLabel(r)===f.hang)&&(!f.publishStart||r.time?.slice(0,10)>=f.publishStart)&&(!f.publishEnd||r.time?.slice(0,10)<=f.publishEnd));
}

function renderList(){
 const p=state.platform,f=state.filters,schema=LIST_SCHEMAS[p],list=filtered(),pages=Math.max(1,Math.ceil(list.length/state.pageSize));state.pageNo=Math.min(state.pageNo,pages);
 return `<section class="filter-card"><div class="platform-tabs" role="tablist" aria-label="发布平台">${pin(1)}${PLATFORMS.map(v=>`<button role="tab" aria-selected="${p===v}" data-action="platform" data-value="${v}" class="platform-tab ${p===v?'active':''}">${v}</button>`).join('')}</div><form id="filters" class="filter-panel native-filter-panel">${schema.filters.map(([key,label,type])=>{
 if(type==='date')return `<div class="filter-field date-range-field"><span>${label}</span><div class="date-range"><input type="date" name="publishStart" aria-label="${p}发布时间开始" value="${esc(f.publishStart||'')}"><span>至</span><input type="date" name="publishEnd" aria-label="${p}发布时间结束" value="${esc(f.publishEnd||'')}"></div></div>`;
 const statuses=p==='视频号'?['待上传','上传中','视频上传成功待发布','发布中','已发布','发布失败','已删除','发布成功但创建推广链失败','待确认']:p==='抖音'?['待发布','已发布','发布失败']:['待发布','发布中','已发布','发布失败','待确认','已取消'];
 const vals=type==='status'?statuses:type==='hang'?(p==='快手'?['作者服务','通栏服务']:HANGS):null;
 return `<label class="filter-field"><span>${label}</span>${vals?`<select name="${key}" aria-label="${p}${label}">${selectedOptions(vals,f[key],'全部')}</select>`:`<input name="${key}" aria-label="${p}${label}" value="${esc(f[key]||'')}" placeholder="请输入${label}">`}</label>`;
 }).join('')}<div class="filter-actions"><button class="btn primary" type="submit">搜索</button><button class="btn" type="button" data-action="reset-filters">重置</button><button class="btn" type="button" data-action="export">导出</button></div><div id="filterError" class="inline-error" role="alert"></div></form></section><section class="list-panel"><div class="list-toolbar">${pin(2)}<button class="btn primary" data-action="new">＋ 新增发视频</button><button class="btn" data-action="batch-cancel" ${state.selected.size?'':'disabled'}>批量取消</button>${draft?'<button class="link-button" data-action="resume">继续草稿（1）</button>':''}<div class="switch-view"><button class="${state.view==='detail'?'active':''}" data-action="view" data-value="detail">发布明细</button><button class="${state.view==='batch'?'active':''}" data-action="view" data-value="batch">批次任务</button></div></div>${state.view==='detail'?renderPlatformTable(list.slice((state.pageNo-1)*state.pageSize,state.pageNo*state.pageSize),p):renderBatchTable(list)}<div class="pagination"><span class="selection">已选择 <span style="color:#1890ff">${state.selected.size}</span> 项</span><span>共 ${state.view==='detail'?list.length:new Set(list.map(r=>r.batch)).size} 条</span>${state.view==='detail'?`<select id="pageSize" aria-label="每页条数">${[8,15,30].map(n=>`<option value="${n}" ${state.pageSize===n?'selected':''}>${n}条 / 页</option>`).join('')}</select><button class="page-num" data-action="page" data-value="${state.pageNo-1}" ${state.pageNo===1?'disabled':''}>‹</button>${Array.from({length:pages},(_,i)=>`<button class="page-num ${state.pageNo===i+1?'active':''}" data-action="page" data-value="${i+1}">${i+1}</button>`).join('')}<button class="page-num" data-action="page" data-value="${state.pageNo+1}" ${state.pageNo===pages?'disabled':''}>›</button>`:''}</div></section>`;
}

function rowAction(r){if(r.issue==='推广链创建失败')return `<button class="link-button" data-action="repair" data-id="${r.id}">补建推广链</button>`;if(r.issue==='账号授权失效')return `<button class="link-button" data-action="auth" data-id="${r.id}">处理授权</button>`;if(r.status==='发布失败')return `<button class="link-button" data-action="retry" data-id="${r.id}">重试</button>`;if(r.status==='待确认')return `<button class="link-button" data-action="reconcile" data-id="${r.id}">核对结果</button>`;if(r.status==='待发布')return `<button class="link-button" data-action="cancel" data-id="${r.id}">取消</button>`;return ''}
function listCell(r,key,html=true){
 const text=key==='account'?account(r.account)?.name||'—':key==='drama'?mountedDramaName(r):key==='hang'?serviceLabel(r):key==='publishedAt'?r.publishedAt||'—':key==='status'?legacyStatus(r):key==='annotation'?r.annotation||'—':key==='miniProgram'?r.miniProgram||'—':r[key]||'—';
 if(!html)return key==='cover'?'示例封面':text;
 if(key==='cover'&&r.coverUrl)return `<img class="material-cover-image" src="${esc(r.coverUrl)}" alt="素材封面">`;
 if(key==='cover')return r.platform==='快手'?'<span class="cover file-cover" title="视频第一帧示例占位">▶</span>':cover(r.drama);
 if(key==='status')return statusBadge(text);
 if(key==='issue')return `<span class="${r.issue?'exception error':''}">${esc(text)}</span>`;
 if(key==='account')return `${esc(text)}<span class="cell-sub">${esc(r.account)}</span>`;
 if(['publishedAt','time'].includes(key))return `<span class="cell-date">${esc(text)}</span>`;
 return `<div class="list-text" title="${esc(text)}">${esc(text)}</div>`;
}
function renderPlatformTable(list,p){
 const cols=LIST_SCHEMAS[p].columns,minWidth=cols.reduce((n,c)=>n+c[2],190);
 return `<div class="table-wrap platform-record-wrap"><table class="data-table native-record-table" style="min-width:${minWidth}px"><colgroup><col style="width:37px">${cols.map(c=>`<col style="width:${c[2]}px">`).join('')}<col style="width:152px"></colgroup><thead><tr><th class="check-col"><input type="checkbox" id="selectAll" aria-label="选择当前页" ${list.length&&list.every(r=>state.selected.has(r.id))?'checked':''}></th>${cols.map(c=>`<th>${c[1]}</th>`).join('')}<th class="action-col">操作 ${pin(3)}</th></tr></thead><tbody>${list.length?list.map(r=>`<tr><td class="check-col"><input type="checkbox" data-select-row="${r.id}" aria-label="选择${esc(r.name)}" ${state.selected.has(r.id)?'checked':''}></td>${cols.map(c=>`<td>${listCell(r,c[0])}</td>`).join('')}<td class="action-col"><div class="ops"><button class="link-button" data-action="detail" data-id="${r.id}">详情</button>${rowAction(r)}</div></td></tr>`).join(''):`<tr><td class="empty" colspan="${cols.length+2}"><strong>暂无符合条件的发布记录</strong><button class="link-button" data-action="reset-filters">清空筛选条件</button></td></tr>`}</tbody></table></div>`;
}

function renderTable(list){return `<div class="table-wrap"><table class="data-table"><colgroup><col class="check-col"><col class="platform-col"><col class="account-col"><col class="asset-col"><col class="drama-col"><col class="time-col"><col class="status-col"><col class="action-col"></colgroup><thead><tr><th class="check-col"><input type="checkbox" id="selectAll" aria-label="选择当前页" ${list.length&&list.every(r=>state.selected.has(r.id))?'checked':''}></th><th>平台</th><th>发布账号</th><th>素材</th><th>挂链目标</th><th>计划发布时间</th><th>发布状态</th><th class="action-col">操作 ${pin(3)}</th></tr></thead><tbody>${list.length?list.map(r=>`<tr><td class="check-col"><input type="checkbox" data-select-row="${r.id}" aria-label="选择${esc(r.name)}" ${state.selected.has(r.id)?'checked':''}></td><td>${platformBadge(r.platform)}</td><td>${esc(account(r.account)?.name||'—')}<span class="cell-sub">${esc(r.account)}</span></td><td><div class="asset-cell">${r.platform==='快手'?'<span class="cover file-cover" title="视频第一帧（示例占位）">▶</span>':cover(r.drama)}<div class="asset-info"><div class="asset-name" title="${esc(r.name)}">${esc(r.name)}</div><span class="cell-sub">${esc(r.hang||'未配置')} · ${r.privacy||'公开'}</span></div></div></td><td>${rowTargetSummary(r)}</td><td>${esc(r.time?.split(' ')[0]||'立即发布')}<span class="cell-sub">${esc(r.time?.split(' ')[1]||'提交后执行')}</span></td><td>${statusBadge(r.status)}${r.issue?`<div class="exception ${r.status==='发布失败'?'error':''}">${esc(r.issue)}</div>`:''}</td><td class="action-col"><div class="ops"><button class="link-button" data-action="detail" data-id="${r.id}">详情</button>${rowAction(r)}</div></td></tr>`).join(''):'<tr><td class="empty" colspan="8"><span style="font-size:30px">▤</span><strong>暂无符合条件的发布记录</strong><button class="link-button" data-action="reset-filters">清空筛选条件</button></td></tr>'}</tbody></table></div>`}
function renderBatchTable(list){const ids=[...new Set(list.map(r=>r.batch))];return `<div class="table-wrap"><table class="data-table"><thead><tr><th style="width:175px">批次编号</th><th style="width:150px">发布平台</th><th>素材 / 发布明细</th><th>发布进度</th><th>待处理</th><th>提交人</th><th style="width:150px">提交时间</th><th style="width:80px">操作</th></tr></thead><tbody>${ids.map(id=>{const rr=list.filter(r=>r.batch===id),done=rr.filter(r=>r.status==='已发布').length;return `<tr><td><button class="batch-id" data-action="batch" data-id="${id}">${id}</button></td><td>${[...new Set(rr.map(r=>r.platform))].join('、')}</td><td>${new Set(rr.map(r=>r.name)).size} 份 / ${rr.length} 条</td><td>${done} / ${rr.length} 已发布<div class="progress-track"><i style="width:${done/rr.length*100}%"></i></div></td><td><span class="${rr.some(r=>r.issue)?'exception':''}">${rr.filter(r=>r.issue).length} 条异常</span></td><td>演示运营</td><td>${rr[0].created}</td><td><button class="link-button" data-action="batch" data-id="${id}">查看</button></td></tr>`}).join('')||'<tr><td colspan="8" class="empty">暂无批次任务</td></tr>'}</tbody></table></div>`}
function renderBatch(){const list=rows.filter(r=>r.batch===state.batch);return `<section class="config-panel"><div class="back-row"><button class="icon-button" data-action="back-list" aria-label="返回列表">←</button><h1>批次详情</h1><span class="badge">${esc(state.batch)}</span><button class="btn small" style="margin-left:auto" data-action="export">导出明细</button></div><div class="batch-info"><p>提交人：<strong>演示运营</strong></p><p>提交时间：<strong>${esc(list[0]?.created||'—')}</strong></p></div><div class="summary-strip">${[['发布明细',list.length],['已发布',list.filter(r=>r.status==='已发布').length],['处理中',list.filter(r=>['待上传','发布中','待发布'].includes(r.status)).length],['待处理',list.filter(r=>r.issue).length],['已取消',list.filter(r=>r.status==='已取消').length]].map(([l,n])=>`<div class="summary-item"><span>${l}</span><strong>${n}<em>条</em></strong></div>`).join('')}</div>${list.some(r=>r.issue)?'<div class="notice warn">部分明细需要处理。已成功发布的作品不会随失败任务重试。</div>':''}${renderTable(list)}</section>`}
function newWizard(){
  const tomorrow=new Date(Date.now()+86400000);tomorrow.setHours(18,0,0,0);
  const time=tomorrow.getFullYear()+'-'+String(tomorrow.getMonth()+1).padStart(2,'0')+'-'+String(tomorrow.getDate()).padStart(2,'0')+'T18:00';
  const config=()=>({text:'{剧目名}，故事才刚刚开始。 #短剧 #好剧推荐',privacy:'公开',mode:'立即发布',time,interval:10});
  return {schema:6,materialAccountConfigs:{},excluded:{},materialConfigs:{},materialTypes:{},materialServices:{},assets:[],platforms:[...PLATFORMS],configs:{'抖音':config(),'视频号':config(),'快手':{...config(),text:'#{剧名}#{短剧题材}',coverMode:'视频第一帧',declaration:KS_DECLARATION}},assignments:{},accountTypes:{},targets:{},ksTargets:{},ksTypes:{},ksMetadata:{},onlyValid:false,urgent:false};
}
function startWizard(){state.wizard=newWizard();state.page='wizard';state.step=1;state.assetSelected=new Set();state.folded={};render()}
function renderWizard(){const w=state.wizard;return `<section class="wizard"><div class="page-head"><button class="icon-button" data-action="exit-wizard" aria-label="返回">←</button><h1>新增发视频</h1><div class="head-actions"><button class="btn" data-action="save-draft">保存草稿</button></div></div><div class="steps">${['选择素材','分配账号与挂链','确认发布'].map((t,i)=>`<div class="step ${state.step===i+1?'active':state.step>i+1?'done':''}"><span class="step-index">${state.step>i+1?'✓':i+1}</span>${t}</div>`).join('')}</div><div class="wizard-body">${state.step===1?renderImport():state.step===2?renderAssign():renderConfirm()}</div><div class="wizard-footer"><span class="footer-info">${state.step===1?`已选 ${w.assets.length} / 100 份素材`:state.step===2?`已选 ${w.platforms.length} 个平台 · ${makeUnits().filter(u=>!u.error).length} 条可发布明细`:`确认后将创建发布任务，可在列表查看执行结果`}</span><button class="btn" data-action="${state.step===1?'exit-wizard':'previous-step'}">${state.step===1?'取消':'上一步'}</button><button class="btn primary" data-action="${state.step===3?'submit-task':'next-step'}">${state.step===3?'确认提交，共 '+makeUnits().filter(u=>!u.error).length+' 条':'下一步'}</button></div></section>`}

function renderImport(){const w=state.wizard;return `
 <div class="import-heading">${pin(1)}<span>选择发布素材</span><small>素材由剪辑同学提前上传至 OSS 文件库</small></div>
 <div class="source-library-bar"><div><strong>OSS 文件库</strong><p>从已上传素材中选择，一次选择可用于抖音、视频号和快手。</p></div><button class="btn primary" data-action="open-library">选择素材</button></div>
 <div class="section-title">${pin(2)}已选素材<small>${w.assets.length} / 100 份 · 在下一步配置账号和挂链目标</small></div>
 ${w.assets.length?`<div class="table-wrap"><table class="data-table compact" style="min-width:760px"><thead><tr><th style="width:47%">素材</th><th>来源文件夹</th><th>文件状态</th><th style="width:100px">操作</th></tr></thead><tbody>${w.assets.map(a=>`<tr><td><div class="asset-cell"><span class="cover file-cover">▶</span><div class="asset-info"><div class="asset-name">${esc(a.name)}</div><span class="cell-sub">${esc(a.size||'—')} · ${esc(a.duration||'—')}</span></div></div></td><td>${esc(a.folder||'旧草稿素材')}<span class="cell-sub">${a.source==='oss'?'OSS 文件库 · '+esc(a.ossVersion):'请改用 OSS 文件库素材'}</span></td><td>${a.source==='oss'?'<span class="status green">可用</span>':'<span class="status orange">需重新选择</span>'}</td><td><button class="link-button danger" data-action="remove-asset" data-id="${a.id}">移除</button></td></tr>`).join('')}</tbody></table></div>`:'<div class="no-files library-empty"><span class="empty-file-icon">▤</span><strong>暂未选择素材</strong><p>点击「选择素材」，从 OSS 文件库勾选剪辑已上传的视频。</p></div>'}
 <div id="wizardError" class="inline-error" role="alert"></div><p class="inline-note">加入任务后保留素材来源及版本。移除只取消本次任务引用，不删除 OSS 原文件。</p>`}
const platformAssets=(w,p)=>w.assets.filter(a=>!(w.excluded?.[p]||[]).includes(a.id));
const assetConfig=(w,p,assetId,id)=>({...w.configs[p],...w.materialConfigs?.[p+'::'+assetId],...w.materialAccountConfigs?.[targetKey(assetId,id)]});
const ksService=(w,id,assetId)=>w.materialServices?.[targetKey(assetId,id)]??w.ksTypes[id]??w.materialConfigs?.['快手::'+assetId]?.ksService??'';
function renderAssign(){
 const w=state.wizard;
 return `<div class="form-line">${pin(1)}<span class="field-title required">发布平台</span><div class="platform-picks">${PLATFORMS.map(p=>`<label class="platform-pick ${w.platforms.includes(p)?'selected':''}"><input type="checkbox" data-wizard-platform="${p}" ${w.platforms.includes(p)?'checked':''}>${platformBadge(p)}</label>`).join('')}</div></div><div class="platform-stack">${w.platforms.length?PLATFORMS.filter(p=>w.platforms.includes(p)).map(p=>renderPlatformSection(p)).join(''):'<div class="notice warn">请至少选择一个发布平台。</div>'}</div><div id="wizardError" class="inline-error" role="alert"></div>`;
}
function renderPlatformSection(p){
 const w=state.wizard,assets=platformAssets(w,p),open=!state.folded?.[p],units=makeUnits().filter(u=>u.platform===p),configured=assets.filter(a=>(w.assignments[p+a.id]||[]).length).length;
 return `<section class="platform-section" data-platform-section="${p}"><h2><button class="platform-section-toggle" data-action="toggle-platform" data-platform="${p}" aria-expanded="${open}" aria-controls="platform-body-${p}"><span class="collapse-chevron ${open?'expanded':''}"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="m7 4 6 6-6 6"/></svg></span>${platformBadge(p)}<span class="section-stats">${assets.length} 份素材 · ${configured} 份已分配账号</span><span class="fold-text">${open?'收起':'展开'}</span></button></h2><div id="platform-body-${p}" class="platform-section-body" ${open?'':'hidden'}><div class="config-toolbar"><button class="btn primary small" data-action="platform-library" data-platform="${p}">选择素材</button>${p==='视频号'?`<button class="btn small" data-action="match-accounts" data-platform="${p}">匹配视频号</button>`:''}<button class="btn small" data-action="assign-platform" data-platform="${p}" ${assets.length?'':'disabled'}>批量选择${p==='视频号'?'视频号':p+'号'}</button><span class="subtle">先选择账号，再点击「编辑素材」</span></div>${assets.length?`<div class="table-wrap"><table class="data-table material-grid"><colgroup><col style="width:190px"><col style="width:78px"><col style="width:135px"><col style="width:175px"><col style="width:180px"><col style="width:135px"><col style="width:208px"></colgroup><thead><tr><th>素材名</th><th>素材封面</th><th>${p==='抖音'?'抖音号':p==='视频号'?'视频号':'快手号'}</th><th>${p==='抖音'?'端上合集':p==='视频号'?'挂链类型 / 关联合集':'挂链类型 / 挂载短剧'}</th><th>${p==='抖音'?'视频描述':p==='视频号'?'素材描述':'作品描述'}</th><th>发布时间</th><th class="action-col">操作</th></tr></thead><tbody>${assets.map(a=>{
  const aa=units.filter(u=>u.asset.id===a.id&&u.account),slots=aa.length?aa:[null];
  return slots.map(u=>{const visible=u?[u]:[],c=assetConfig(w,p,a.id,u?.account);
   return `<tr data-material-id="${a.id}" data-material-account="${u?.account||''}"><td><div class="asset-name" title="${esc(a.name)}">${esc(a.name)}</div><span class="cell-sub">${esc(a.size)} · ${esc(a.duration)}</span></td><td>${c.coverUrl?`<img class="material-cover-image" src="${esc(c.coverUrl)}" alt="素材封面">`:'<span class="cover file-cover" title="素材封面示例占位">▶</span>'}</td><td><button class="link-button" data-action="assign-one" data-platform="${p}" data-id="${a.id}">${esc(account(u?.account)?.name||'选择'+(p==='视频号'?'视频号':p+'号'))}</button></td><td>${visible.length?visible.map(x=>`<div class="material-target"><span>${esc(p==='快手'?KS_SERVICES.find(s=>s.key===x.service)?.label||'未选类型':p==='视频号'?x.config.hang:'端原生')}</span><span class="cell-sub">${esc(p==='快手'?x.metadata.dramaName||'待选择短剧':x.target?.name||'待选择合集')}</span></div>`).join(''):'—'}</td><td><div class="list-text">${esc(visible[0]?.desc||c.text||'—')}</div></td><td>${esc(c.mode==='定时发布'?(c.time||'待选择时间').replace('T',' '):'立即发布')}</td><td class="action-col"><div class="ops"><button class="link-button" data-action="edit-material" data-platform="${p}" data-id="${a.id}" data-account="${u?.account||''}" ${!u?'disabled':''}>编辑素材</button><button class="link-button" data-action="sync-material" data-platform="${p}" data-id="${a.id}" data-account="${u?.account||''}" ${!u?'disabled':''}>同步信息</button><button class="link-button danger" data-action="exclude-material" data-platform="${p}" data-id="${a.id}">移除</button></div></td></tr>`;
  }).join('');
 }).join('')}</tbody></table></div>`:'<div class="target-empty">暂未选择'+p+'素材，请从 OSS 文件库选择。</div>'}<div class="platform-section-foot"><span>${pin(2)}素材配置仅用于${p}，展开和收起保留已填内容。</span><span>${units.filter(u=>!u.error).length} 条配置通过</span></div></div></section>`;
}

const ORIGINAL_FORM_SOURCE={url:'https://manage.qiguoread.com/dist/static/js/chunk-5c07a0dc.3a6ee410.js',douyin:'4543',channels:'b25d',checked:'2026-10-10'};
const WX_MINI_PROGRAMS=[{id:'mini01',name:'星河短剧小程序'},{id:'mini02',name:'晚风剧场小程序'}];
const localDateTime=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}T${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}:${String(date.getSeconds()).padStart(2,'0')}`;
const demoCover=title=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"><rect width="300" height="300" fill="#eef2f6"/><rect x="22" y="22" width="256" height="256" fill="#5e7387" rx="3"/><path d="M195 30 285 270M20 220 230 30" stroke="#7c92a5" stroke-width="1"/><text x="150" y="126" fill="#fff" text-anchor="middle" font-size="22" font-family="sans-serif">${esc(title)}</text><text x="150" y="171" fill="#cbd7e2" text-anchor="middle" font-size="14" font-family="sans-serif">封面示例</text></svg>`);
function openNativeMaterialEditor(p,assetId,accountId){
 const w=normalizeDraft(state.wizard),ids=w.assignments[p+assetId]||[],id=accountId||ids[0];
 if(!id||!ids.includes(id))return toast(p==='抖音'?'请先选择抖音号':'请先选择视频号',true);
 const key=targetKey(assetId,id),asset=w.assets.find(a=>a.id===assetId),hadOwn=!!w.materialAccountConfigs[key],legacy=w.materialConfigs[p+'::'+assetId],old=assetConfig(w,p,assetId,id),target=selectedTarget(w,assetId,id);
 const c={...old,nativeMatched:true,privacy:'公开',text:hadOwn?old.text:legacy?.text||asset.videoDesc||asset.description||'',coverUrl:old.coverUrl||asset.coverUrl||'',title:asset.name};
 if(target&&!c.coverUrl)c.coverUrl=demoCover(target.name);
 if(target)c.text=c.text.replaceAll('{剧目名}',target.name);
 if(p==='视频号'){
  w.materialTypes[key]=accountType(w,id,assetId)||'自营小程序';
  c.mode='定时发布';c.time=old.mode==='定时发布'?old.time:'';c.tagType=old.tagType??(old.annotation===1?1:null);c.useClientId=old.useClientId||WX_MINI_PROGRAMS.find(x=>x.name===old.miniProgram)?.id||'';
 }
 w.materialAccountConfigs[key]=c;materialEditor={platform:p,assetId,accountId:id,working:w,native:true};renderNativeMaterialEditor();
}
function renderNativeMaterialEditor(){
 materialEditor.selectingCollection=false;
 const {platform:p,assetId,accountId:id,working:w}=materialEditor,key=targetKey(assetId,id),c=w.materialAccountConfigs[key],type=accountType(w,id,assetId),target=selectedTarget(w,assetId,id),self=type.startsWith('自营'),external=type.startsWith('外部'),mini=type==='自营小程序';
 const field=(label,content,required=false)=>`<div class="native-form-field" data-native-field="${label}"><label class="native-form-label ${required?'required':''}">${label}</label><div class="native-form-control">${content}</div></div>`;
 const cover=field('视频封面',c.coverUrl?`<div class="native-cover-preview"><img src="${esc(c.coverUrl)}" alt="视频封面"><button type="button" class="native-cover-remove" data-action="native-delete-cover" aria-label="删除视频封面">×</button></div>`:`<label class="native-cover-upload"><span>＋</span><input type="file" accept="image/*" data-native-cover-file aria-label="上传视频封面"></label>`,true);
 const description=(label,limited)=>field(label,`<div class="native-description"><textarea data-native-config="text" aria-label="${label}" placeholder="请输入描述" rows="4" ${limited?'maxlength="100"':''}>${esc(c.text)}</textarea>${limited?`<span class="native-word-count">${c.text.length}/100</span>`:''}</div>`,true);
 let fields='';
 if(p==='抖音'){
  fields+=field('添加标签',`<div class="native-tag-row"><select disabled aria-label="标签类型"><option>付费内容</option></select><select data-native-target aria-label="端上合集"><option value="">请选择</option>${availableTargets(w,id,assetId).map(t=>`<option value="${t.id}" ${target?.id===t.id?'selected':''}>${esc(t.name)}</option>`).join('')}</select></div>`,true);
  fields+=cover+description('视频描述',true);
  fields+=field('发布时间',`<div class="native-publish-radios" role="radiogroup" aria-label="发布时间">${['立即发布','定时发布'].map(mode=>`<label class="radio-label"><input type="radio" name="nativePublishMode" data-native-config="mode" value="${mode}" ${c.mode===mode?'checked':''}>${mode}</label>`).join('')}</div>`,true);
  if(c.mode==='定时发布')fields+=field('',`<input type="datetime-local" step="1" data-native-config="time" aria-label="定时发布时间" value="${esc(c.time||'')}" min="${localDateTime(new Date(Date.now()+7200000))}" max="${localDateTime(new Date(Date.now()+14*86400000))}"><p class="native-time-tips">支持2小时后及14天内的定时发布。发布后如需修改时间，可前往作品管理修改</p>`);
 }else{
  fields+=field('挂链类型',`<div class="native-scene-radios" role="radiogroup" aria-label="挂链类型">${HANGS.map(h=>`<label class="radio-label"><input type="radio" name="nativeHang" data-native-hang value="${h}" ${type===h?'checked':''}>${h}</label>`).join('')}</div>`,true);
  fields+=field('关联合集',self?`<button type="button" class="btn primary small" data-action="native-select-collection">选择合集</button>${target?`<span class="native-selected-collection">${esc(target.name)}（ID：${esc(target.id)}）</span>`:''}`:`<select data-native-target aria-label="关联合集"><option value="">请选择合集</option>${availableTargets(w,id,assetId).map(t=>`<option value="${t.id}" ${target?.id===t.id?'selected':''}>${esc(t.name)}${type==='外部小程序'?'（'+t.id+'）-合作剧场':''}</option>`).join('')}</select>`,true);
  fields+=field('视频标注',`<label class="radio-label"><input type="checkbox" data-native-ai ${c.tagType===1?'checked':''}>该视频含AI生成内容</label>`);
  if(self)fields+=field('标题',`<input disabled aria-label="标题" placeholder="请输入标题" value="${esc(c.title)}">`);
  if(mini)fields+=field('关联小程序',`<select data-native-config="useClientId" aria-label="关联小程序"><option value="">请选择小程序</option>${WX_MINI_PROGRAMS.map(x=>`<option value="${x.id}" ${c.useClientId===x.id?'selected':''}>${esc(x.name)}</option>`).join('')}</select>`,true);
  fields+=cover+description(external?'视频描述':'描述',external);
  fields+=field('发布时间',`<input type="datetime-local" step="1" data-native-config="time" aria-label="发布时间" value="${esc(c.time||'')}" min="${localDateTime(new Date(new Date().setHours(0,0,0,0)))}">`,true);
 }
 modal('编辑素材信息',`<form class="native-material-form" onsubmit="return false">${fields}<div id="modalError" class="inline-error" role="alert"></div></form>`,`<button class="btn" data-action="close-modal">取 消</button><button class="btn primary" data-action="save-material">确 定</button>`,'native-material-modal');
}
function nativeEditorChange(t){
 if(!materialEditor?.native)return false;
 const {platform:p,assetId,accountId:id,working:w}=materialEditor,key=targetKey(assetId,id),c=w.materialAccountConfigs[key];
 if(t.hasAttribute('data-native-hang')){
  w.materialTypes[key]=t.value;delete w.targets[key];c.useClientId='';c.miniProgram='';renderNativeMaterialEditor();return true;
 }
 if(t.hasAttribute('data-native-target')){
  const target=availableTargets(w,id,assetId).find(x=>x.id===t.value);if(target){w.targets[key]=target.id;if(p==='抖音')c.coverUrl=demoCover(target.name)}else delete w.targets[key];if(p==='抖音')renderNativeMaterialEditor();return true;
 }
 if(t.hasAttribute('data-native-ai')){c.tagType=t.checked?1:null;return true}
 if(t.dataset.nativeConfig){if(t.type==='radio'&&!t.checked)return true;c[t.dataset.nativeConfig]=t.value;if(t.dataset.nativeConfig==='mode')renderNativeMaterialEditor();if(t.dataset.nativeConfig==='text'){const count=$('.native-word-count');if(count)count.textContent=t.value.length+'/100'}return true}
 if(t.hasAttribute('data-native-cover-file')){
  const file=t.files?.[0];if(!file)return true;const editor=materialEditor;
  if(!file.type.startsWith('image/')){$('#modalError').textContent='请选择封面图片';return true}
  const reader=new FileReader();reader.onload=()=>{if(materialEditor!==editor)return;c.coverUrl=String(reader.result);renderNativeMaterialEditor()};reader.readAsDataURL(file);return true;
 }
 return false;
}
function nativeEditorError(w,p,assetId,id){
 const c=assetConfig(w,p,assetId,id),type=accountType(w,id,assetId),target=selectedTarget(w,assetId,id);
 if(!target)return p==='抖音'?'请选择端上合集':'请选择关联合集ID不能为空';
 if(!c.coverUrl)return '请上传视频封面';
 if(!c.text?.trim())return p==='抖音'?'请输入视频描述':'请输入描述';
 if((p==='抖音'||type.startsWith('外部'))&&c.text.length>100)return '视频描述不能超过100字';
 if(p==='视频号'&&type==='自营小程序'&&!c.useClientId)return '请选择关联小程序不能为空';
 if(p==='视频号'||c.mode==='定时发布'){
  const time=new Date(c.time),now=Date.now();if(!c.time||!Number.isFinite(time.getTime()))return '请选择发布时间';
  if(p==='抖音'&&(time.getTime()<now+7200000||time.getTime()>now+14*86400000))return '请选择2小时后及14天内的发布时间';
  if(p==='视频号'&&time<new Date(new Date().setHours(0,0,0,0)))return '请选择今天或之后的发布时间';
 }
 return '';
}
function saveNativeMaterialEditor(){
 const {platform:p,assetId,accountId:id,working:e}=materialEditor,w=state.wizard,key=targetKey(assetId,id),error=nativeEditorError(e,p,assetId,id);
 if(error){$('#modalError').textContent=error;return}
 const c=e.materialAccountConfigs[key];c.nativeMatched=true;c.privacy='公开';c.miniProgram=WX_MINI_PROGRAMS.find(x=>x.id===c.useClientId)?.name||'';
 w.materialAccountConfigs[key]=JSON.parse(JSON.stringify(c));w.materialTypes[key]=accountType(e,id,assetId);w.targets[key]=e.targets[key];
 closeModal();materialEditor=null;render();toast('素材信息已保存');
}
function openNativeCollection(){
 materialEditor.selectingCollection=true;
 let query='';
 const show=()=>{
  const {assetId,accountId:id,working:w}=materialEditor,list=availableTargets(w,id,assetId).filter(t=>t.name.includes(query)||t.id.includes(query));
  modal('选择合集',`<form id="nativeCollectionFilters" class="native-collection-filters"><label>合集名称<input name="query" aria-label="合集名称" value="${esc(query)}" placeholder="请输入合集名称或ID"></label><button class="btn primary" type="submit">搜索</button></form><div class="table-wrap"><table class="data-table compact" style="min-width:570px"><thead><tr><th>合集名称</th><th>合集ID</th><th style="width:80px">操作</th></tr></thead><tbody>${list.map(t=>`<tr><td>${esc(t.name)}</td><td>${esc(t.id)}</td><td><button class="link-button" type="button" data-native-collection="${t.id}">选择</button></td></tr>`).join('')||'<tr><td colspan="3" class="empty">暂无匹配合集</td></tr>'}</tbody></table></div>`,`<button class="btn" id="nativeCollectionCancel">取消</button>`,'large-modal');
  $('#nativeCollectionFilters').onsubmit=e=>{e.preventDefault();query=new FormData(e.target).get('query').trim();show()};$('#nativeCollectionCancel').onclick=()=>renderNativeMaterialEditor();
  $$('[data-native-collection]').forEach(button=>button.onclick=()=>{const target=availableTargets(w,id,assetId).find(t=>t.id===button.dataset.nativeCollection),c=w.materialAccountConfigs[targetKey(assetId,id)];if(!target)return;w.targets[targetKey(assetId,id)]=target.id;c.coverUrl=demoCover(target.name);c.text=target.name+'剧情推荐#容量短剧#好剧推荐#'+target.name;renderNativeMaterialEditor()});
 };show();
}

let materialEditor=null;
function openMaterialEditor(p,assetId,accountId){
 if(p!=='快手')return openNativeMaterialEditor(p,assetId,accountId);
 const w=normalizeDraft(state.wizard),ids=w.assignments[p+assetId]||[],id=accountId||ids[0];
 if(!id||!ids.includes(id))return toast('请先选择快手号',true);
 const key=targetKey(assetId,id),old=assetConfig(w,p,assetId,id),meta=w.ksMetadata[key]||{},task=ksSelection(w,assetId,id)[ksService(w,id,assetId)];
 const auto=old.ksAutoDescription??(old.text==='#{剧名}#{短剧题材}'||old.text==='#剧名#短剧题材'||old.text===`#${meta.dramaName}#${meta.genre}`);
 const text=auto?(task?`#${task.dramaName||'剧名'}#${task.genre||'短剧题材'}`:'#剧名#短剧题材'):old.text;
 w.materialAccountConfigs[key]={...old,text,ksAutoDescription:auto,coverUrl:'',coverMode:'视频第一帧',declaration:KS_DECLARATION};
 materialEditor={platform:p,assetId,accountId:id,working:w};renderMaterialEditor();
}
function renderMaterialEditor(){
 if(materialEditor?.native)return renderNativeMaterialEditor();
 const {assetId,accountId:id,working:w}=materialEditor,key=targetKey(assetId,id),c=w.materialAccountConfigs[key],service=ksService(w,id,assetId),definition=KS_SERVICES.find(s=>s.key===service),task=ksSelection(w,assetId,id)[service];
 const field=(label,content,required=false)=>`<div class="native-form-field" data-native-field="${label}"><label class="native-form-label ${required?'required':''}">${label}</label><div class="native-form-control">${content}</div></div>`;
 const fields=field('作品描述',`<div class="native-description"><textarea data-editor-config="text" aria-label="作品描述" placeholder="#剧名#短剧题材">${esc(c.text)}</textarea></div><p class="native-time-tips">默认 #剧名#短剧题材，选择任务后带入；可直接修改。</p>`,true)
 +field('封面设置','<div class="default-field">视频第一帧<span class="badge">默认</span></div>')
 +field('挂链类型',`<div class="native-publish-radios" role="radiogroup" aria-label="挂链类型">${KS_SERVICES.map(s=>`<label class="radio-label"><input type="radio" name="editorService" data-editor-service="${id}" value="${s.key}" ${s.key===service?'checked':''}>${s.label}</label>`).join('')}</div>${definition?`<div class="ks-task-select"><div class="ks-service-default">${definition.type}<span class="badge">默认</span></div><select data-editor-task="${id}" aria-label="${definition.type}">${ksOptions(id,service,task?.id)}</select>${task?`<p class="native-time-tips">任务 ID：${esc(task.id)} · 有效期 ${esc(task.start)} ~ ${esc(task.end)}</p>`:''}</div>`:'<p class="native-time-tips">选择挂链类型后，关联对应变现任务。</p>'}`,true)
 +field('作者声明',`<div class="default-field">${KS_DECLARATION}<span class="badge">默认</span></div>`)
 +field('发布时间',`<div class="native-publish-radios" role="radiogroup" aria-label="发布时间">${['立即发布','定时发布'].map(mode=>`<label class="radio-label"><input type="radio" name="editorMode" data-editor-config="mode" value="${mode}" ${c.mode===mode?'checked':''}>${mode}</label>`).join('')}</div>${c.mode==='定时发布'?`<input type="datetime-local" step="1" data-editor-config="time" aria-label="定时发布时间" value="${esc(c.time||'')}">`:''}`,true);
 modal('编辑素材信息',`<form class="native-material-form ks-material-form">${fields}<div id="modalError" class="inline-error" role="alert"></div></form>`,`<button class="btn" data-action="close-modal">取 消</button><button class="btn primary" data-action="save-material">确 定</button>`,'native-material-modal ks-material-modal');
}
function saveMaterialEditor(){
 if(materialEditor?.native)return saveNativeMaterialEditor();
 const {assetId,accountId:id,working:e}=materialEditor,w=state.wizard,key=targetKey(assetId,id);
 const error=makeUnits(e).find(u=>u.platform==='快手'&&u.asset.id===assetId&&u.account===id)?.error;
 if(error){$('#modalError').textContent=error;return}
 w.materialAccountConfigs[key]=JSON.parse(JSON.stringify(e.materialAccountConfigs[key]));
 w.materialServices[key]=ksService(e,id,assetId);w.ksTargets[key]={...(e.ksTargets[key]||{})};w.ksMetadata[key]={...(e.ksMetadata[key]||{})};
 closeModal();materialEditor=null;render();toast('素材信息已保存');
}
function editorChange(t){
 if(!materialEditor)return false;if(materialEditor.native)return nativeEditorChange(t);
 const {assetId,accountId:id,working:w}=materialEditor,key=targetKey(assetId,id),c=w.materialAccountConfigs[key];
 if(t.dataset.editorService){
  if(!t.checked)return true;
  const previous=ksService(w,id,assetId),value=t.value;if(previous===value)return true;
  const change=()=>{w.materialServices[key]=value;delete w.ksTargets[key];delete w.ksMetadata[key];if(c.ksAutoDescription)c.text='#剧名#短剧题材';renderMaterialEditor()};
  if(Object.keys(w.ksTargets[key]||{}).length){$$('[data-editor-service]').forEach(x=>x.checked=x.value===previous);$('#modalError').innerHTML='更换类型将清空当前任务，请重新选择。<button class="link-button" id="editorConfirmType">确认更换</button>';$('#editorConfirmType').onclick=change}else change();return true;
 }
 if(t.dataset.editorTask){setKsTarget(w,assetId,id,ksService(w,id,assetId),t.value);const task=ksSelection(w,assetId,id)[ksService(w,id,assetId)];if(c.ksAutoDescription)c.text=task?`#${task.dramaName||'剧名'}#${task.genre||'短剧题材'}`:'#剧名#短剧题材';renderMaterialEditor();return true}
 if(t.dataset.editorConfig){if(t.type==='radio'&&!t.checked)return true;c[t.dataset.editorConfig]=t.value;if(t.dataset.editorConfig==='text')c.ksAutoDescription=false;if(t.dataset.editorConfig==='mode')renderMaterialEditor();return true}
 return false;
}

// The original DY sync includes the source account; WX keeps each destination account.
function materialSyncCandidates(w,p,assetId,id){
 if(p==='抖音')return platformAssets(w,p).map(a=>({assetId:a.id,accountId:id,name:a.name,enabled:true}));
 return platformAssets(w,p).flatMap(a=>{const ids=w.assignments[p+a.id]||[];return (ids.length?ids:['']).map(ac=>({assetId:a.id,accountId:ac,name:a.name,enabled:true}))});
}
function applyMaterialSync(w,p,assetId,id,destinations){
 if(!(w.assignments[p+assetId]||[]).includes(id))return {count:0,needsTarget:0};
 const sourceKey=targetKey(assetId,id),source=assetConfig(w,p,assetId,id),type=accountType(w,id,assetId),service=ksService(w,id,assetId),target=selectedTarget(w,assetId,id),task=ksSelection(w,assetId,id)[service];
 const allowed=materialSyncCandidates(w,p,assetId,id);let count=0,needsTarget=0;
 for(const dest of destinations){
  if(!allowed.some(x=>x.enabled&&x.assetId===dest.assetId&&x.accountId===dest.accountId))continue;
  const asset=w.assets.find(a=>a.id===dest.assetId),destId=dest.accountId,key=targetKey(dest.assetId,destId),previous=assetConfig(w,p,dest.assetId,destId),same=id===destId;
  if(dest.assetId===assetId&&same){count++;continue}
  if(!destId){
   // Original dialog lets every material be selected before an account is assigned.
   const c={...assetConfig(w,p,dest.assetId),text:source.text,mode:source.mode,time:source.time,interval:source.interval,coverUrl:source.coverUrl||'',title:asset.name,privacy:'公开'};
   if(p==='视频号')Object.assign(c,{hang:type,nativeMatched:true,mode:'定时发布',useClientId:source.useClientId||'',miniProgram:source.miniProgram||''});
   else Object.assign(c,{ksService:service,ksAutoDescription:source.ksAutoDescription,text:source.ksAutoDescription?'#剧名#短剧题材':source.text,coverUrl:'',coverMode:'视频第一帧',declaration:KS_DECLARATION});
   w.materialConfigs[p+'::'+dest.assetId]=c;count++;needsTarget++;continue;
  }
  if(p==='抖音'){
   setAssignments(w,p,dest.assetId,[id]);w.materialAccountConfigs[key]={...previous,text:source.text,coverUrl:source.coverUrl||'',mode:source.mode,time:source.time,interval:source.interval,nativeMatched:true,privacy:'公开',title:asset.name};
   if(target)w.targets[key]=target.id;else{delete w.targets[key];needsTarget++}
  }else if(p==='视频号'){
   w.materialTypes[key]=type;
   w.materialAccountConfigs[key]={...previous,text:source.text,coverUrl:source.coverUrl||'',time:source.time,mode:'定时发布',useClientId:source.useClientId||'',miniProgram:source.miniProgram||'',nativeMatched:true,privacy:'公开',title:asset.name};
   if(same&&target)w.targets[key]=target.id;else{delete w.targets[key];needsTarget++}
  }else{
   w.materialServices[key]=service;w.materialAccountConfigs[key]={...previous,text:source.text,ksAutoDescription:source.ksAutoDescription,mode:source.mode,time:source.time,interval:source.interval,coverUrl:'',coverMode:'视频第一帧',declaration:KS_DECLARATION};
   if(same&&task){w.ksTargets[key]={[service]:task.id};w.ksMetadata[key]={...(w.ksMetadata[sourceKey]||{})}}else{delete w.ksTargets[key];delete w.ksMetadata[key];needsTarget++;if(source.ksAutoDescription)w.materialAccountConfigs[key].text='#剧名#短剧题材'}
  }
  count++;
 }
 return {count,needsTarget};
}
function openMaterialSync(p,assetId,id){
 const w=state.wizard;if(!(w.assignments[p+assetId]||[]).includes(id))return toast('请先选择发布账号',true);
 // Match the existing green admin dialog: one checkbox per material, including source.
 const list=platformAssets(w,p),destinations=materialSyncCandidates(w,p,assetId,id);
 modal('同步信息',`<p class="sync-hint">同步后则所选素材信息一致</p><label class="sync-checkbox sync-all"><input id="syncAll" type="checkbox" checked>全选</label><div class="sync-destinations">${list.map(a=>`<label class="sync-checkbox"><input type="checkbox" name="syncMaterial" value="${esc(a.id)}" checked><span>${esc(a.name)}</span></label>`).join('')}</div>`,`<button class="btn" data-action="close-modal">取 消</button><button class="btn primary" id="applyMaterialSync">确 定</button>`,'sync-material-modal');
 $('#overlay').classList.add('native-sync-overlay');
 const refresh=()=>{$('#syncAll').checked=$$('input[name=syncMaterial]:checked').length===list.length};
 $('#syncAll').onchange=e=>{$$('input[name=syncMaterial]').forEach(x=>x.checked=e.target.checked)};$$('input[name=syncMaterial]').forEach(x=>x.onchange=refresh);
 $('#applyMaterialSync').onclick=()=>{const selected=new Set($$('input[name=syncMaterial]:checked').map(x=>x.value));applyMaterialSync(w,p,assetId,id,destinations.filter(x=>selected.has(x.assetId)));closeModal();render();toast('同步信息成功')};
}


function setKsService(w,id,service){
 if(!KS_SERVICES.some(s=>s.key===service)||w.ksTypes[id]===service)return;
 w.ksTypes[id]=service;
 w.assets.forEach(a=>{delete w.ksTargets[targetKey(a.id,id)];delete w.ksMetadata[targetKey(a.id,id)]});
}
function renderKsGroups(){
 const w=state.wizard,ids=[...new Set(w.assets.flatMap(a=>w.assignments['快手'+a.id]||[]))];
 if(!ids.length)return '<div class="target-empty">请先分配快手号，再选择挂链类型和具体任务。</div>';
 return ids.map(id=>{
  const ac=account(id),aa=w.assets.filter(a=>(w.assignments['快手'+a.id]||[]).includes(id)),service=KS_SERVICES.find(s=>s.key===w.ksTypes[id]);
  return `<section class="target-group ks-group" data-account-group="${id}"><header class="target-group-head"><strong>${esc(ac.name)}</strong><span class="subtle">${id} · ${aa.length} 份素材</span><button class="btn small" data-action="bulk-ks" data-account="${id}" ${service?'':'disabled'}>批量选择任务</button></header>
  <div class="ks-service-choice"><span class="required">挂链类型</span><div role="radiogroup" aria-label="${ac.name}挂链类型">${KS_SERVICES.map(s=>`<label class="radio-label"><input type="radio" name="ksType-${id}" data-ks-type="${id}" value="${s.key}" ${service?.key===s.key?'checked':''}>${s.label}</label>`).join('')}</div>${service?`<span class="service-preset">${service.type}<span class="badge">默认</span></span>`:'<span class="subtle">单选一种服务</span>'}</div>
  ${service?`<div class="table-wrap"><table class="data-table compact target-table ks-target-table"><thead><tr><th style="width:28%">已分配素材</th><th style="width:39%">${service.label} · 具体任务 <span class="required-star">*</span></th><th>作品描述变量 <span class="required-star">*</span></th></tr></thead><tbody>${aa.map(a=>{
   const task=ksSelection(w,a.id,id)[service.key],meta=w.ksMetadata[targetKey(a.id,id)]||{};
   return `<tr><td><div class="asset-name" title="${esc(a.name)}">${esc(a.name)}</div><span class="cell-sub">封面：视频第一帧</span></td><td><select data-ks-asset="${a.id}" data-ks-account="${id}" data-ks-service="${service.key}" aria-label="${ac.name} ${a.name} ${service.label}任务">${ksOptions(id,service.key,task?.id)}</select>${task?`<span class="cell-sub">任务 ID：${task.id}</span><span class="cell-sub">有效期：${task.start} ~ ${task.end}</span>`:'<span class="cell-sub">按当前账号及服务类型选择</span>'}</td><td><label class="ks-meta-label"><span>剧名</span><input aria-label="${ac.name} ${a.name} 剧名" data-ks-meta="dramaName" data-meta-asset="${a.id}" data-meta-account="${id}" value="${esc(meta.dramaName||'')}" placeholder="确认剧名" ${task?'':'disabled'}></label><label class="ks-meta-label"><span>题材</span><input aria-label="${ac.name} ${a.name} 短剧题材" data-ks-meta="genre" data-meta-asset="${a.id}" data-meta-account="${id}" value="${esc(meta.genre||'')}" placeholder="确认短剧题材" ${task?'':'disabled'}></label></td></tr>`;
  }).join('')}</tbody></table></div><p class="target-group-note">剧名、题材有来源时带入，可逐条修改；更换挂链类型后重新选择任务。<span>示例任务数据</span></p>`:'<div class="target-empty">选择作者服务或通栏服务后，配置该类型的变现任务。</div>'}</section>`;
 }).join('');
}
function bulkKs(id){
 const w=state.wizard,service=KS_SERVICES.find(s=>s.key===w.ksTypes[id]);if(!service)return;
 const aa=w.assets.filter(a=>(w.assignments['快手'+a.id]||[]).includes(id));
 modal('批量选择快手任务',`<div class="bulk-brief">${esc(account(id).name)} · ${service.label} · ${service.type}<br>只对勾选的素材应用本账号任务，同时更新对应剧名、题材。</div><div class="modal-field"><label for="bulkKsTask">具体任务</label><select id="bulkKsTask">${ksOptions(id,service.key)}</select></div>${aa.map(a=>`<label class="checkbox-row"><input type="checkbox" name="ksTaskAsset" value="${a.id}">${esc(a.name)}</label>`).join('')}<div id="modalError" class="inline-error"></div>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="applyKsTask">应用到所选素材</button>`);
 $('#applyKsTask').onclick=()=>{const task=$('#bulkKsTask').value,ids=$$('input[name=ksTaskAsset]:checked').map(x=>x.value);if(!task||!ids.length){$('#modalError').textContent='请选择具体任务并勾选素材';return}ids.forEach(a=>setKsTarget(w,a,id,service.key,task));closeModal();render();toast(`已为 ${ids.length} 份素材设置快手任务`)};
}

function renderTargetGroups(p){
 if(p==='快手')return renderKsGroups();
 const w=state.wizard,ids=[...new Set(w.assets.flatMap(a=>w.assignments[p+a.id]||[]))];
 if(!ids.length)return '<div class="target-empty">请先分配发布账号，选剧区域将按账号显示。</div>';
 return ids.map(id=>{const ac=account(id),aa=w.assets.filter(a=>(w.assignments[p+a.id]||[]).includes(id)),type=accountType(w,id),catalog=availableTargets(w,id);return `<section class="target-group" data-account-group="${id}"><header class="target-group-head"><strong>${esc(ac.name)}</strong><span class="subtle">${id} · ${aa.length} 份素材</span>${p==='视频号'?`<label class="target-type-label">挂链类型<select data-account-type="${id}" aria-label="${ac.name}挂链类型"><option value="">请先选择挂链类型</option>${HANGS.map(h=>`<option ${h===type?'selected':''}>${h}</option>`).join('')}</select></label>`:'<span class="badge">端原生 · 仅当前账号端上剧</span>'}<button class="btn small" data-action="bulk-target" data-account="${id}" ${!type||!catalog.length?'disabled':''}>批量选剧</button></header><div class="table-wrap"><table class="data-table compact target-table"><thead><tr><th style="width:43%">已分配素材</th><th>${p==='抖音'?'该账号的端上剧':'当前挂链类型对应剧目'} <span class="required-star">*</span></th></tr></thead><tbody>${aa.map(a=>`<tr><td><div class="asset-name">${esc(a.name)}</div></td><td><select data-target-asset="${a.id}" data-target-account="${id}" aria-label="${ac.name} ${esc(a.name)} 发布剧目" ${!type||!catalog.length?'disabled':''}>${!type?'<option>请先选择挂链类型</option>':!catalog.length?'<option>当前范围暂无可用剧目</option>':targetOptions(w,id,w.targets[targetKey(a.id,id)])}</select></td></tr>`).join('')}</tbody></table></div><p class="target-group-note">${p==='抖音'?'剧目列表来自此抖音号。更换账号后需重新选剧。':'切换此账号的挂链类型，将清空该账号已选剧目。'} <span>当前为示例剧目数据</span></p></section>`}).join('');
}
function bulkTarget(id){
 const w=state.wizard,p=account(id).platform,aa=w.assets.filter(a=>(w.assignments[p+a.id]||[]).includes(id));
 modal('批量选择发布剧目',`<div class="bulk-brief">发布账号：<strong>${esc(account(id).name)}</strong> · ${esc(accountType(w,id))}<br>勾选同一部剧的素材后应用，只影响此账号。</div><div class="modal-field"><label for="bulkTarget">发布剧目</label><select id="bulkTarget">${targetOptions(w,id)}</select></div>${aa.map(a=>`<label class="checkbox-row"><input type="checkbox" name="targetAsset" value="${a.id}">${esc(a.name)}</label>`).join('')}<p class="inline-note">将覆盖所选素材在此账号下的原选剧结果，其他账号不变。</p><div id="modalError" class="inline-error"></div>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="applyTargets">应用到所选素材</button>`);
 $('#applyTargets').onclick=()=>{const target=$('#bulkTarget').value,assets=$$('input[name=targetAsset]:checked').map(el=>el.value);if(!target||!assets.length){$('#modalError').textContent='请选择发布剧目并勾选对应素材';return}assets.forEach(a=>w.targets[targetKey(a,id)]=target);closeModal();render();toast(`已为 ${assets.length} 份素材设置 ${account(id).name} 的发布剧目`)};
}
function makeUnits(w=state.wizard){
 if(!w)return [];const units=[],counts={};
 for(const p of w.platforms)for(const a of platformAssets(w,p)){
  if(w.pendingOnly&&!Object.hasOwn(w.assignments,p+a.id))continue;
  const ids=w.assignments[p+a.id]||[];
  if(!ids.length){units.push({platform:p,asset:a,error:'尚未分配账号'});continue}
  for(const id of ids){
   const ac=account(id),ks=p==='快手',service=ks?ksService(w,id,a.id):'',serviceDef=KS_SERVICES.find(s=>s.key===service),type=ks?(serviceDef?serviceDef.label+' · '+serviceDef.type:''):accountType(w,id,a.id),target=ks?null:selectedTarget(w,a.id,id),services=ks&&serviceDef?{[service]:ksSelection(w,a.id,id)[service]}:null,metadata=ks?w.ksMetadata[targetKey(a.id,id)]||{}:{},c={...assetConfig(w,p,a.id,id),hang:type};
   let error=a.source!=='oss'||!OSS_FILES.some(f=>f.id===a.id&&f.ossVersion===a.ossVersion&&f.availability==='可用')?'OSS 素材不可用或版本已变更':!ac?.ok?'账号授权失效':ac.platform!==p?'账号与平台不一致':!ks&&!type?'请先选择挂链类型':!ks&&!target?(p==='抖音'?'请选择该抖音号的端上剧':'请选择当前挂链类型对应剧目'):!c.text.trim()?'发布文案为空':'';
   let time='立即发布',planned=new Date();
   if(c.mode==='定时发布'){
    planned=new Date(c.time);if(!c.time||!Number.isFinite(planned.getTime())||planned<=new Date())error='请选择未来的发布时间';
    if(!Number.isFinite(+c.interval)||+c.interval<1)error='发布间隔需至少1分钟';
    const explicitTime=Object.hasOwn(w.materialConfigs?.[p+'::'+a.id]||{},'time')||Object.hasOwn(w.materialAccountConfigs?.[targetKey(a.id,id)]||{},'time');planned.setMinutes(planned.getMinutes()+(explicitTime?0:counts[id]||0)*(+c.interval||1));
    time=Number.isFinite(planned.getTime())?`${planned.getFullYear()}-${String(planned.getMonth()+1).padStart(2,'0')}-${String(planned.getDate()).padStart(2,'0')} ${String(planned.getHours()).padStart(2,'0')}:${String(planned.getMinutes()).padStart(2,'0')}`:'时间未设置';if(Number.isFinite(planned.getTime())&&/T\d{2}:\d{2}:\d{2}/.test(c.time))time+=':'+String(planned.getSeconds()).padStart(2,'0');
   }
   if(!ks&&!error)error=nativeEditorError(w,p,a.id,id);
   if(ks&&!error){
    if(!serviceDef)error='请选择快手挂链类型';
    else if(!services[service])error='请选择'+serviceDef.label+'的具体任务';
    else if(!ksTaskValid(services[service],planned))error=serviceDef.label+'任务在计划发布时间不可用';
    else if(c.text.includes('{剧名}')&&!metadata.dramaName?.trim())error='请填写作品描述中的剧名';
    else if(c.text.includes('{短剧题材}')&&!metadata.genre?.trim())error='请填写作品描述中的短剧题材';
    else if(c.text.includes('{剧目名}'))error='快手请使用 {剧名} 和 {短剧题材} 或直接填写描述';
   }else if(!ks&&/{(任务名|剧名|短剧题材)}/.test(c.text))error='当前平台请使用 {剧目名} 或直接填写文案';
   const desc=c.text.replaceAll('{剧目名}',target?.name||'【待选择发布剧目】').replaceAll('{剧名}',metadata.dramaName?.trim()||'【待填剧名】').replaceAll('{短剧题材}',metadata.genre?.trim()||'【待填题材】').replaceAll('{素材编号}',a.name.split('_')[1]||a.name);
   counts[id]=(counts[id]||0)+1;units.push({platform:p,asset:a,account:id,target,service,services,metadata,time,config:c,desc,error});
  }
 }
 return units;
}

function renderConfirm(){const w=state.wizard,units=makeUnits(),valid=units.filter(u=>!u.error),bad=units.length-valid.length;return `<div class="summary-strip">${[['源素材',w.assets.length,'份'],['发布账号',new Set(valid.map(u=>u.account)).size,'个'],['抖音',valid.filter(u=>u.platform==='抖音').length,'条'],['视频号',valid.filter(u=>u.platform==='视频号').length,'条'],['快手',valid.filter(u=>u.platform==='快手').length,'条'],['可提交合计',valid.length,'条']].map(([l,n,u])=>`<div class="summary-item"><span>${l}</span><strong>${n}<em>${u}</em></strong></div>`).join('')}</div>${bad?`<div class="notice warn">${bad} 项配置未通过校验，请返回修改。也可以明确选择仅提交通过项，其余保留草稿。</div><label class="check-summary" style="margin-bottom:18px"><input type="checkbox" id="onlyValid" ${w.onlyValid?'checked':''}>仅提交校验通过的 ${valid.length} 条，问题项保留草稿</label>`:'<div class="notice success">发布前校验通过，请核对目标账号、挂链目标及发布时间。</div>'}<div class="section-title">${pin(3)}发布确认清单<small>${units.length} 项分配结果</small></div><div class="table-wrap"><table class="data-table compact" style="min-width:880px"><thead><tr><th style="width:160px">平台 / 账号</th><th style="width:225px">素材 / 挂载目标</th><th>发布文案</th><th style="width:143px">计划发布时间</th><th style="width:110px">校验结果</th></tr></thead><tbody>${units.map(u=>`<tr><td>${platformBadge(u.platform)}<span class="cell-sub">${esc(account(u.account)?.name||'未分配')}</span></td><td><div class="asset-name">${esc(u.asset.name)}</div>${unitTargetSummary(u)}</td><td>${esc(u.desc||'—')}<span class="cell-sub">${u.config?.privacy||'公开'}</span>${u.platform==='快手'?`<span class="cell-sub">封面：${esc(u.config?.coverMode||'视频第一帧')}</span><span class="cell-sub">声明：${esc(u.config?.declaration||KS_DECLARATION)}</span>`:''}</td><td>${esc(u.time||'—')}</td><td>${u.error?`<span class="status red">未通过</span><span class="cell-sub" style="color:#d96a60">${esc(u.error)}</span>`:'<span class="status green">通过</span>'}</td></tr>`).join('')}</tbody></table></div><div class="form-line"><label class="radio-label"><input type="checkbox" id="urgent" ${w.urgent?'checked':''}>标记为紧急任务</label><span class="subtle">仅优先处理待执行任务，不提前定时发布</span></div><div id="wizardError" class="inline-error" role="alert"></div>`}
function renderConfig(){return `<section class="config-panel"><div class="config-heading"><h1>发布配置</h1><span class="subtle">模板仅影响后续应用的任务</span></div><div class="config-tabs"><button class="active">文案模板</button></div><div class="config-toolbar"><button class="btn primary" data-action="edit-template">＋ 新增模板</button><span class="subtle">抖音 / 视频号用 {剧目名}；快手用 #{剧名}#{短剧题材}</span></div><div class="table-wrap"><table class="data-table" style="min-width:820px"><thead><tr><th>模板名称</th><th style="width:120px">适用平台</th><th>文案内容</th><th style="width:85px">状态</th><th style="width:115px">操作</th></tr></thead><tbody>${templates.map(x=>`<tr><td>${esc(x.name)}</td><td>${x.platform==='全部'?'全部平台':platformBadge(x.platform)}</td><td>${esc(x.text)}</td><td><span class="status ${x.ok?'green':'gray'}">${x.ok?'已启用':'已停用'}</span></td><td><div class="ops"><button class="link-button" data-action="edit-template" data-id="${x.id}">编辑</button><button class="link-button" data-action="toggle-config" data-id="${x.id}">${x.ok?'停用':'启用'}</button></div></td></tr>`).join('')}</tbody></table></div><p class="inline-note">发布剧目在任务内按平台、账号及挂链类型选择，本页不设置跨账号通用的剧目映射。</p></section>`}

const OSS_FILES=Array.from({length:14},(_,i)=>({
 id:'OSS'+String(i+1).padStart(3,'0'),name:i===2?'旧素材_高光片段03.mp4':`${DRAMAS[i%3].id}_片段${String(i+1).padStart(2,'0')}_V1.${i===5?'mov':'mp4'}`,
 source:'oss',ossKey:`clips/2026-09-${i<8?'24':'23'}/clip-${String(i+1).padStart(3,'0')}.mp4`,ossVersion:'v1',
 folder:i<8?'09-24 剪辑素材':'09-23 剪辑素材',size:(32.4+i*2.7).toFixed(1)+' MB',duration:'01:'+String(12+i*3).padStart(2,'0'),
 uploaded:i<8?'2026-09-24 09:30':'2026-09-23 16:20',uploader:i%2?'剪辑二组':'剪辑一组',availability:i===12?'处理中':i===13?'不可用':'可用'
}));
let library={query:'',folder:'',page:1,selected:new Set()};
function openLibrary(platform=null){library={platform,query:'',folder:'',page:1,selected:new Set()};renderLibrary()}
function renderLibrary(){
 const existing=new Set((library.platform?platformAssets(state.wizard,library.platform):state.wizard.assets).filter(a=>a.source==='oss').map(a=>a.id));
 const filtered=OSS_FILES.filter(f=>(!library.query||f.name.includes(library.query))&&(!library.folder||f.folder===library.folder));
 const maxPage=Math.max(1,Math.ceil(filtered.length/6));library.page=Math.min(library.page,maxPage);const shown=filtered.slice((library.page-1)*6,library.page*6);
 modal('从 OSS 文件库选择素材',`<form id="libraryFilters" class="library-filters"><label>素材名<input name="query" aria-label="OSS素材名" value="${esc(library.query)}" placeholder="输入素材名搜索"></label><label>文件夹<select name="folder" aria-label="OSS文件夹"><option value="">全部文件夹</option>${[...new Set(OSS_FILES.map(f=>f.folder))].map(folder=>`<option ${folder===library.folder?'selected':''}>${folder}</option>`).join('')}</select></label><button class="btn primary" type="submit">搜索</button><button class="btn" type="button" data-action="library-reset">重置</button></form><div class="library-caption">剪辑同学已上传的共享素材 · 当前为 OSS 文件库示例数据</div><div class="table-wrap"><table class="data-table compact library-table"><thead><tr><th class="check-col"><input id="librarySelectPage" type="checkbox" aria-label="选择本页可用素材" ${shown.some(f=>f.availability==='可用'&&!existing.has(f.id))&&shown.filter(f=>f.availability==='可用'&&!existing.has(f.id)).every(f=>library.selected.has(f.id))?'checked':''}></th><th style="width:36%">素材 / 文件夹</th><th>大小 / 时长</th><th>上传人 / 时间</th><th style="width:100px">状态</th></tr></thead><tbody>${shown.map(f=>`<tr><td class="check-col"><input type="checkbox" data-library-file="${f.id}" aria-label="选择 ${esc(f.name)}" ${existing.has(f.id)||f.availability!=='可用'?'disabled':''} ${existing.has(f.id)||library.selected.has(f.id)?'checked':''}></td><td><div class="asset-cell"><span class="cover file-cover">▶</span><div class="asset-info"><div class="asset-name" title="${esc(f.name)}">${esc(f.name)}</div><span class="cell-sub">${f.folder}</span></div></div></td><td>${f.size}<span class="cell-sub">${f.duration}</span></td><td>${f.uploader}<span class="cell-sub">${f.uploaded}</span></td><td>${existing.has(f.id)?'<span class="badge">已加入</span>':`<span class="status ${f.availability==='可用'?'green':f.availability==='处理中'?'orange':'gray'}">${f.availability}</span>`}</td></tr>`).join('')||'<tr><td colspan="5" class="empty">未找到匹配素材，请调整筛选条件</td></tr>'}</tbody></table></div><div class="pagination"><span class="selection">共 ${filtered.length} 份素材</span><button class="page-num" data-action="library-page" data-value="${library.page-1}" ${library.page===1?'disabled':''}>‹</button><span>${library.page} / ${maxPage}</span><button class="page-num" data-action="library-page" data-value="${library.page+1}" ${library.page===maxPage?'disabled':''}>›</button></div><div id="modalError" class="inline-error" role="alert"></div>`,`<span class="subtle" id="librarySelectedCount">已选 ${library.selected.size} 份 · 本任务已有 ${state.wizard.assets.length}/100</span><button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="addLibraryAssets">加入任务（${library.selected.size}）</button>`,'library-modal');
 $('#libraryFilters').onsubmit=e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target));library.query=data.query.trim();library.folder=data.folder;library.page=1;renderLibrary()};
 $('#librarySelectPage').onchange=e=>{shown.filter(f=>f.availability==='可用'&&!existing.has(f.id)).forEach(f=>e.target.checked?library.selected.add(f.id):library.selected.delete(f.id));renderLibrary()};
 $$('[data-library-file]').forEach(el=>el.onchange=()=>{el.checked?library.selected.add(el.dataset.libraryFile):library.selected.delete(el.dataset.libraryFile);$('#librarySelectedCount').textContent=`已选 ${library.selected.size} 份 · 本任务已有 ${state.wizard.assets.length}/100`;$('#addLibraryAssets').textContent=`加入任务（${library.selected.size}）`});
 $('#addLibraryAssets').onclick=()=>{const files=OSS_FILES.filter(f=>library.selected.has(f.id)&&f.availability==='可用'&&!existing.has(f.id));if(!files.length){$('#modalError').textContent='请至少选择一份可用素材';return}const w=state.wizard,newFiles=files.filter(f=>!w.assets.some(a=>a.id===f.id));if(w.assets.length+newFiles.length>100){$('#modalError').textContent='单批最多100份素材，请减少选择';return}w.assets.push(...newFiles.map(f=>({...f})));if(library.platform){const p=library.platform;w.excluded[p]=(w.excluded[p]||[]).filter(id=>!files.some(f=>f.id===id));for(const other of PLATFORMS.filter(x=>x!==p)){w.excluded[other] ||= [];w.excluded[other].push(...newFiles.map(f=>f.id))}}closeModal();render();toast(`已从 OSS 文件库加入 ${files.length} 份素材`)};
}

let lastFocus=null;
function modal(title,body,footer='',cls=''){lastFocus=document.activeElement;$('#overlay').hidden=false;$('#overlay').className='';$('#overlay').innerHTML=`<section class="modal ${cls}" role="dialog" aria-modal="true" aria-label="${esc(title)}"><header class="modal-header"><h2>${title}</h2><button class="icon-button" data-action="close-modal" aria-label="关闭弹窗">×</button></header><div class="modal-body">${body}</div><footer class="modal-footer">${footer||'<button class="btn" data-action="close-modal">关闭</button>'}</footer></section>`;$('#shell').inert=true;$('#overlay button')?.focus()}
function closeModal(){if($('#overlay').hidden)return;$('#overlay').hidden=true;$('#overlay').innerHTML='';$('#overlay').className='';$('#shell').inert=false;lastFocus?.isConnected&&lastFocus.focus()}
function confirmAction(title,body,label,fn){modal(title,`<div class="modal-copy">${body}</div>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="confirmAction">${label}</button>`,'small-modal');$('#confirmAction').onclick=()=>{closeModal();fn()}}
function openDetail(id){const r=rows.find(r=>r.id===id);if(!r)return;const d=drama(r.drama),a=account(r.account),published=r.status==='已发布';lastFocus=document.activeElement;$('#overlay').hidden=false;$('#overlay').className='drawer-layer';$('#shell').inert=true;$('#overlay').innerHTML=`<section class="drawer" role="dialog" aria-modal="true" aria-label="发布详情"><header class="modal-header"><h2>发布详情 <small style="margin-left:10px">${r.id}</small></h2><button class="icon-button" data-action="close-modal" aria-label="关闭详情">×</button></header><div class="drawer-content"><div class="detail-head">${r.platform==='快手'?'<span class="cover file-cover" title="视频第一帧（示例占位）">▶</span>':cover(r.drama)}<div><h3>${esc(r.platform==='快手'?'快手发布任务':d?.name||'发布任务')}</h3><span class="subtle">${esc(r.name)}</span></div>${statusBadge(r.status)}</div>${r.issue?`<div class="notice ${r.status==='发布失败'?'error':'warn'}">${esc(r.issue)}${published?'。作品已发布，请只处理失败步骤。':'。请处理后继续当前任务。'}</div>`:''}<div class="detail-grid">${[['发布平台',r.platform],['发布账号',a?.name],...(r.platform==='快手'?KS_SERVICES.filter(s=>s.key===r.service).flatMap(s=>[[s.label+'类型',s.type],[s.label+'任务',r.services?.[s.key]?.name],[s.label+'任务 ID',r.services?.[s.key]?.id],[s.label+'有效期',r.services?.[s.key]?r.services[s.key].start+' ~ '+r.services[s.key].end:'未返回']]):[['发布剧目',publishedDramaName(r)],['平台剧目 ID',r.targetId||'历史记录未保留']]),...(r.platform==='快手'?[['封面设置',r.coverMode||'视频第一帧'],['作者声明',r.declaration||KS_DECLARATION],['描述剧名',r.dramaName],['短剧题材',r.genre]]:[]),['素材来源',r.ossKey?'OSS 文件库':'历史记录'],['素材版本',r.ossVersion||'历史记录未保留'],['挂链类型',r.hang],['可见范围',r.privacy||'公开'],['计划发布时间',r.time],['所属批次',r.batch]].map(([l,v])=>`<div class="detail-field"><label>${l}</label><div>${esc(v||'—')}</div></div>`).join('')}<div class="detail-field full"><label>发布文案</label><div>${esc(r.desc)}</div></div></div><div class="section-title">各阶段结果</div><div class="detail-steps"><div class="detail-step"><span>发布</span>${statusBadge(r.status)}</div><div class="detail-step"><span>平台审核</span>${esc(r.audit||'未返回')}</div><div class="detail-step"><span>${r.platform==='快手'?'快手任务挂载':'短剧挂载'}</span>${published?'挂载成功':'校验通过，待挂载'}</div><div class="detail-step"><span>后续处理</span>${esc(r.link||'待处理')}</div></div><div class="section-title">操作记录</div><ol class="timeline"><li>创建发布任务<small>${esc(r.created)} · 演示运营</small></li><li>素材与挂载目标校验通过<small>挂链目标：${esc(r.platform==='快手'?KS_SERVICES.filter(s=>s.key===r.service).map(s=>s.label+' '+(r.services?.[s.key]?.name||'未记录')).join('；'):publishedDramaName(r))}；账号：${esc(a?.name)}</small></li><li class="${r.issue?'fail':published?'':'wait'}">${published?'作品已发布':esc(r.status)}<small>${r.issue?esc(r.issue):published?'平台确认成功，作品信息已同步':'等待当前阶段完成'}</small></li>${r.retries?`<li>已完成补处理<small>本次只处理失败环节，未重复创建作品</small></li>`:''}</ol><div class="detail-grid"><div class="detail-field"><label>作品 ID</label><div>${published?'DEMO'+r.id.slice(1):'待同步'}</div></div><div class="detail-field"><label>最后同步时间</label><div>${esc(r.updated||r.created)}</div></div></div><div class="inline-note">此页面使用本地示例数据，未连接平台账号或发布服务。</div></div><footer class="modal-footer"><button class="btn" data-action="close-modal">关闭</button>${rowAction(r)}</footer></section>`;$('#overlay button').focus()}
function showAccounts(p='全部'){const rr=accounts.filter(a=>p==='全部'||a.platform===p);modal(`${p==='全部'?'发布':p}账号`, `<div class="notice">沿用绿台已有账号和授权管理。本弹窗只展示演示账号。</div><div class="table-wrap"><table class="data-table compact" style="min-width:620px"><thead><tr><th>账号</th><th>分组</th><th>负责人</th><th>授权状态</th><th style="width:120px">操作</th></tr></thead><tbody>${rr.map(a=>`<tr><td>${a.name}<span class="cell-sub">${a.platform} · ${a.id}</span></td><td>${a.group}</td><td>${a.owner}</td><td><span class="status ${a.ok?'green':'red'}">${a.ok?'授权有效':'授权失效'}</span></td><td><button class="link-button" data-action="mock-auth" data-id="${a.id}" ${a.ok?'disabled':''}>模拟恢复授权</button></td></tr>`).join('')}</tbody></table></div>`,null,'large-modal')}
function assignAccounts(ids,p=state.activePlatform){const w=state.wizard,choices=accounts.filter(a=>a.platform===p);let selected=ids.length===1?w.assignments[p+ids[0]]||[]:[];modal('分配'+p+'账号',`<div class="bulk-brief">将所选 <strong>${ids.length}</strong> 份素材分配至以下账号。<br>每份素材会分别发给你勾选的每个账号。</div>${choices.map(a=>`<label class="checkbox-row"><input type="checkbox" name="assignAccount" value="${a.id}" ${selected.includes(a.id)?'checked':''} ${!a.ok?'disabled':''}>${a.name}<span class="account-extra">${a.ok?a.group:'授权失效，暂不可选'}</span></label>`).join('')}<div id="assignCount" class="inline-note">请勾选本次需要发布的账号</div><div id="modalError" class="inline-error"></div>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="applyAccounts">确认分配</button>`);$$('input[name=assignAccount]').forEach(el=>el.onchange=()=>$('#assignCount').textContent=`已选 ${$$('input[name=assignAccount]:checked').length} 个账号，将生成 ${ids.length*$$('input[name=assignAccount]:checked').length} 条${p}发布明细`);$('#applyAccounts').onclick=()=>{const selected=$$('input[name=assignAccount]:checked').map(x=>x.value);if(!selected.length){$('#modalError').textContent='请至少选择一个账号';return}for(const id of ids)setAssignments(w,p,id,selected);closeModal();render();toast(`已为 ${ids.length} 份素材分配 ${selected.length} 个${p}账号`)}}
function openConfigEditor(id){const x=templates.find(v=>v.id===id);modal(x?'编辑文案模板':'新增文案模板',`<form id="configForm"><div class="modal-field"><label>模板名称</label><input name="name" aria-label="模板名称" value="${esc(x?.name||'')}" placeholder="请输入模板名称" required></div><div class="modal-field"><label>平台</label><select name="platform" aria-label="平台">${['全部',...PLATFORMS].map(p=>`<option ${x?.platform===p?'selected':''}>${p}</option>`).join('')}</select></div><div class="modal-field"><label>文案内容</label><textarea name="text" aria-label="文案内容" required placeholder="输入文案，可使用 {剧目名} 变量">${esc(x?.text||'')}</textarea></div><div id="modalError" class="inline-error"></div><p class="inline-note">抖音、视频号用 {剧目名}；快手用 #{剧名}#{短剧题材}。保存不覆盖已应用的文案和已提交任务。</p></form>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="saveConfig">保存</button>`);$('#saveConfig').onclick=()=>{const data=Object.fromEntries(new FormData($('#configForm')));if(!data.name?.trim()||!data.text?.trim()){$('#modalError').textContent='请填写完整的必填信息';return}if(x)Object.assign(x,data);else templates.unshift({...data,id:'C'+Date.now(),ok:true});persist();closeModal();render();toast('模板已保存')};}
function errorWizard(message){$('#wizardError').textContent=message;$('#wizardError').scrollIntoView({block:'nearest'});toast(message,true)}
function saveDraft(){if(!state.wizard)return;draft=JSON.parse(JSON.stringify(state.wizard));draft.assets=draft.assets.map(a=>({...a,url:null,file:null}));persist();toast('草稿已保存到本地演示环境')}
function nextStep(){const w=state.wizard;if(state.step===1){if(!w.assets.length)return errorWizard('请先从 OSS 文件库选择素材');if(w.assets.some(a=>a.source!=='oss'||!OSS_FILES.some(f=>f.id===a.id&&f.ossVersion===a.ossVersion&&f.availability==='可用')))return errorWizard('存在不可用或旧草稿素材，请从 OSS 文件库重新选择');state.assetSelected=new Set(w.assets.map(a=>a.id));state.activePlatform=w.platforms[0]||'抖音'}else {if(!w.platforms.length)return errorWizard('请至少选择一个发布平台');if(!makeUnits().some(u=>u.account))return errorWizard('请先为素材分配发布账号')}state.step++;render();window.scrollTo(0,0)}
function submitTask(){const w=state.wizard,units=makeUnits(),valid=units.filter(u=>!u.error),bad=units.filter(u=>u.error);if(!valid.length)return errorWizard('没有可提交的发布明细，请返回检查配置');if(bad.length&&!w.onlyValid)return errorWizard('存在未通过的配置，请修改或勾选仅提交通过项');const batch='FB'+new Date().toISOString().replace(/\D/g,'').slice(0,14);const now=new Date().toLocaleString('sv-SE').slice(0,16);const newRows=valid.map((u,i)=>({id:'P'+Date.now()+i,batch,platform:u.platform,account:u.account,drama:u.target?.drama||'',targetId:u.target?.id||'',targetName:u.target?.name||'',service:u.service,services:u.services?JSON.parse(JSON.stringify(u.services)):null,dramaName:u.metadata.dramaName||'',genre:u.metadata.genre||'',coverUrl:u.config.coverUrl||'',coverMode:u.config.coverMode||'',declaration:u.config.declaration||'',name:u.asset.name,assetId:u.asset.id,ossKey:u.asset.ossKey,ossVersion:u.asset.ossVersion,desc:u.desc,status:u.config.mode==='定时发布'?'待发布':'发布中',issue:'',hang:u.config.hang,time:u.time,created:now,audit:'未返回',link:'待处理',owner:'演示运营',annotation:u.config.tagType===1?'该视频含AI生成内容':u.config.annotation||'',miniProgram:u.config.miniProgram||'',privacy:u.config.privacy,retries:0}));rows.unshift(...newRows);if(bad.length){draft=JSON.parse(JSON.stringify(w));draft.pendingOnly=true;draft.onlyValid=false;draft.assignments={};for(const u of bad){const key=u.platform+u.asset.id;draft.assignments[key] ||= [];if(u.account)draft.assignments[key].push(u.account)}draft.platforms=PLATFORMS.filter(p=>bad.some(u=>u.platform===p));draft.assets=draft.assets.filter(a=>bad.some(u=>u.asset.id===a.id))}else draft=null;state.page='batch';state.batch=batch;state.wizard=null;state.selected.clear();persist();render();toast(`已创建 ${valid.length} 条演示发布任务`);setTimeout(()=>{for(const r of newRows)if(r.status==='发布中'){r.status='已发布';r.audit='通过';r.link='成功';r.updated=new Date().toLocaleString('sv-SE').slice(0,16);r.publishedAt=r.updated}persist();if(['list','batch'].includes(state.page))render()},1600)}
function exportRows(){
 const batch=state.page==='batch',data=batch?rows.filter(r=>r.batch===state.batch):filtered(),cols=batch?[['platform','平台'],['account','发布账号'],['name','素材名'],['desc','作品描述'],['hang','挂链类型'],['drama','挂载短剧名称'],['status','发布状态'],['issue','失败原因'],['publishedAt','发布成功时间'],['time','发布时间']]:LIST_SCHEMAS[state.platform].columns;
 const quote=s=>'"'+String(s??'').replaceAll('"','""')+'"',csv='\ufeff'+[cols.map(c=>c[1]),...data.map(r=>cols.map(c=>listCell(r,c[0],false)))].map(r=>r.map(quote).join(',')).join('\r\n');
 const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=(batch?'三平台':state.platform)+'发布明细-演示.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),500);toast(`已导出 ${data.length} 条演示明细`);
}

function applyOperation(r,type){closeModal();if(type==='repair'){r.link='成功';r.issue='';r.retries=(r.retries||0)+1;persist();render();toast('推广链已补建，未重新发布视频');return}if(type==='reconcile'){r.status='已发布';r.issue='';r.link='成功';r.audit='通过';r.publishedAt ||= new Date().toLocaleString('sv-SE').slice(0,16);persist();render();toast('已模拟确认平台发布成功，未重复提交');return}r.status='发布中';r.issue='';r.retries=(r.retries||0)+1;persist();render();toast('已重新执行失败步骤');setTimeout(()=>{r.status='已发布';r.audit='通过';r.link='成功';persist();if(state.page==='list'||state.page==='batch')render()},1000)}
const actions={
'collapse':()=>{state.collapsed=!state.collapsed;$('#shell').classList.toggle('collapsed',state.collapsed)},
'nav-list':el=>{if(state.page==='wizard'){confirmAction('离开新增页面','将保存当前配置为草稿，再返回发布列表。','保存并返回',()=>{saveDraft();state.page='list';state.platform=PLATFORMS.includes(el.dataset.value)?el.dataset.value:'抖音';render()});return}state.page='list';state.platform=PLATFORMS.includes(el.dataset.value)?el.dataset.value:'抖音';state.selected.clear();state.filters={};state.pageNo=1;render()},
'back-list':()=>{if(state.page==='wizard'){actions['exit-wizard']();return}state.page='list';render()},
'nav-config':()=>{if(state.page==='wizard')saveDraft();state.page='config';render()},
'platform':el=>{state.filterCache ||= {};state.filterCache[state.platform]=state.filters;state.platform=el.dataset.value;state.filters=state.filterCache[state.platform]||{};state.selected.clear();state.pageNo=1;render()},
'view':el=>{state.view=el.dataset.value;state.selected.clear();render()},
'page':el=>{state.pageNo=+el.dataset.value;render()},
'reset-filters':()=>{state.filters={};state.selected.clear();state.pageNo=1;render()},
'new':()=>startWizard(),
'open-library':()=>openLibrary(),
'library-reset':()=>{library.query='';library.folder='';library.page=1;renderLibrary()},
'library-page':el=>{library.page=+el.dataset.value;renderLibrary()},
'resume':()=>{state.wizard=normalizeDraft(draft);state.page='wizard';state.step=1;state.activePlatform=state.wizard.platforms[0]||'抖音';render()},
'save-draft':()=>saveDraft(),
'exit-wizard':()=>confirmAction('返回发布列表','可将当前配置保存为草稿，稍后继续。','保存并返回',()=>{saveDraft();state.page='list';render()}),
'remove-asset':el=>{const w=state.wizard,id=el.dataset.id;for(const p of PLATFORMS){setAssignments(w,p,id,[]);delete w.assignments[p+id]}Object.keys(w.targets).filter(k=>k.startsWith(id+'::')).forEach(k=>delete w.targets[k]);w.assets=w.assets.filter(a=>a.id!==id);state.assetSelected.delete(id);render()},
'next-step':()=>nextStep(),
'previous-step':()=>{state.step--;render()},
'toggle-platform':el=>{state.folded ||= {};state.folded[el.dataset.platform]=!state.folded[el.dataset.platform];render()},
'platform-library':el=>openLibrary(el.dataset.platform),
'assign-platform':el=>assignAccounts(platformAssets(state.wizard,el.dataset.platform).map(a=>a.id),el.dataset.platform),
'edit-material':el=>openMaterialEditor(el.dataset.platform,el.dataset.id,el.dataset.account),
'sync-material':el=>openMaterialSync(el.dataset.platform,el.dataset.id,el.dataset.account),
'native-select-collection':()=>openNativeCollection(),
'native-delete-cover':()=>{const e=materialEditor;e.working.materialAccountConfigs[targetKey(e.assetId,e.accountId)].coverUrl='';renderNativeMaterialEditor()},
'save-material':()=>saveMaterialEditor(),
'exclude-material':el=>{const w=state.wizard,p=el.dataset.platform,id=el.dataset.id;setAssignments(w,p,id,[]);delete w.materialConfigs[p+'::'+id];w.excluded[p] ||= [];w.excluded[p].push(id);render()},
'assign-bulk':()=>assignAccounts([...state.assetSelected]),
'assign-one':el=>assignAccounts([el.dataset.id],el.dataset.platform||state.activePlatform),
'bulk-target':el=>bulkTarget(el.dataset.account),
'bulk-ks':el=>bulkKs(el.dataset.account),
'match-accounts':el=>{const p=el.dataset.platform||state.activePlatform,w=state.wizard;let n=0;for(const a of platformAssets(w,p)){const found=accounts.filter(ac=>ac.platform===p&&ac.ok&&a.name.includes(ac.name));if(found.length===1){setAssignments(w,p,a.id,[found[0].id]);n++}}render();toast(n?`已匹配 ${n} 份素材的账号`:'未识别到唯一账号，请使用“批量分配账号”',!n)},
'submit-task':()=>submitTask(),
'close-modal':()=>{if(materialEditor?.selectingCollection){renderNativeMaterialEditor();return}closeModal();materialEditor=null},
'detail':el=>openDetail(el.dataset.id),
'batch':el=>{state.batch=el.dataset.id;state.page='batch';state.selected.clear();render()},
'cancel':el=>{const r=rows.find(r=>r.id===el.dataset.id);confirmAction('取消待发布任务',`将取消 <strong>${esc(account(r.account)?.name)}</strong> 的这条待发布任务。已发布作品不受影响。`,'确认取消',()=>{r.status='已取消';r.issue='';persist();render();toast('待发布任务已取消')})},
'batch-cancel':()=>{const eligible=rows.filter(r=>state.selected.has(r.id)&&['待上传','待发布'].includes(r.status));if(!eligible.length)return toast('所选记录均已进入执行或完成，暂无可取消任务',true);confirmAction('批量取消待执行任务',`已选 ${state.selected.size} 条，其中 <strong>${eligible.length} 条</strong>可以取消，其余记录保持不变。`,'取消这'+eligible.length+'条',()=>{eligible.forEach(r=>{r.status='已取消';r.issue=''});state.selected.clear();persist();render();toast(`已取消 ${eligible.length} 条任务`)})},
'repair':el=>{const r=rows.find(r=>r.id===el.dataset.id);confirmAction('补建推广链',`作品已发布。本次仅为 <strong>${esc(drama(r.drama)?.name)}</strong> 补建推广链，不会重新发视频。`,'确认补建',()=>applyOperation(r,'repair'))},
'retry':el=>{const r=rows.find(r=>r.id===el.dataset.id);if(r.issue==='视频格式不支持')return modal('素材需要修改','<div class="notice error">当前素材格式不符合要求，直接重试无法解决。</div><p class="modal-copy">请在新任务中替换素材，原记录保留供追溯。</p>',`<button class="btn" data-action="close-modal">关闭</button><button class="btn primary" id="newFromFailure">新建发布任务</button>`),$('#newFromFailure').onclick=()=>{closeModal();startWizard()};confirmAction('重试失败步骤','仅重新执行这条失败任务，其他成功记录不受影响。','确认重试',()=>applyOperation(r,'retry'))},
'reconcile':el=>{const r=rows.find(r=>r.id===el.dataset.id);confirmAction('核对平台结果','模拟查询后确认作品已经发布，将同步结果，不重复提交。','模拟确认已发布',()=>applyOperation(r,'reconcile'))},
'auth':el=>{const r=rows.find(r=>r.id===el.dataset.id);modal('处理账号授权',`<div class="notice error">${esc(account(r.account)?.name)} 授权已失效。</div><p class="modal-copy">真实业务中应进入原账号管理重新授权。演示可恢复账号并重试当前明细。</p>`,`<button class="btn" data-action="close-modal">取消</button><button class="btn primary" id="authAndRetry">模拟恢复并重试</button>`);$('#authAndRetry').onclick=()=>{account(r.account).ok=true;applyOperation(r,'retry')}},
'accounts':el=>showAccounts(el.dataset.value),
'mock-auth':el=>{const a=account(el.dataset.id);a.ok=true;persist();showAccounts(a.platform);toast('已模拟恢复账号授权')},
'export':()=>exportRows(),
'config-tab':el=>{state.configTab=el.dataset.value;render()},
'edit-template':el=>openConfigEditor(el.dataset.id,false),
 'toggle-config':el=>{const list=templates,x=list.find(v=>v.id===el.dataset.id);confirmAction(x.ok?'停用配置':'启用配置',x.ok?'停用后，新任务无法使用这条配置。已有发布记录不受影响。':'启用后，可在新任务中使用。',x.ok?'确认停用':'确认启用',()=>{x.ok=!x.ok;persist();render();toast('配置状态已更新')})},
 'toggle-menu':el=>{const children=el.nextElementSibling;children.hidden=!children.hidden;el.querySelector('.menu-caret').textContent=children.hidden?'⌄':'⌃'}
};
document.addEventListener('click',e=>{const btn=e.target.closest('[data-action]');if(btn&&!btn.disabled){const fn=actions[btn.dataset.action];fn?.(btn)}});
document.addEventListener('submit',e=>{if(e.target.id==='filters'){e.preventDefault();const f=Object.fromEntries(new FormData(e.target));if(f.publishStart&&f.publishEnd&&f.publishStart>f.publishEnd){$('#filterError').textContent='发布时间开始日期不能晚于结束日期';return}state.filters=f;state.selected.clear();state.pageNo=1;render()}});
document.addEventListener('change',e=>{const t=e.target;if(editorChange(t))return;if(t.id==='pageSize'){state.pageSize=+t.value;state.pageNo=1;render()}if(t.dataset.selectRow){t.checked?state.selected.add(t.dataset.selectRow):state.selected.delete(t.dataset.selectRow);render()}if(t.id==='selectAll'){const list=state.page==='batch'?rows.filter(r=>r.batch===state.batch):filtered().slice((state.pageNo-1)*state.pageSize,state.pageNo*state.pageSize);list.forEach(r=>t.checked?state.selected.add(r.id):state.selected.delete(r.id));render()}if(!state.wizard)return;const w=state.wizard;if(t.dataset.ksType){const id=t.dataset.ksType,type=t.value,count=w.assets.filter(a=>Object.keys(w.ksTargets[targetKey(a.id,id)]||{}).length).length;if(count){render();confirmAction('更换快手挂链类型',`将清空 ${esc(account(id).name)} 下 ${count} 条已选任务及描述变量，请在新类型下重新选择。`,'更换并重新选择',()=>{setKsService(w,id,type);render()})}else{setKsService(w,id,type);render()}}if(t.dataset.ksMeta){const key=targetKey(t.dataset.metaAsset,t.dataset.metaAccount);w.ksMetadata[key] ||= {};w.ksMetadata[key][t.dataset.ksMeta]=t.value.trim();render()}if(t.dataset.ksAsset){setKsTarget(w,t.dataset.ksAsset,t.dataset.ksAccount,t.dataset.ksService,t.value);render()}if(t.dataset.accountType){const id=t.dataset.accountType,type=t.value,previous=accountType(w,id),chosen=w.assets.filter(a=>w.targets[targetKey(a.id,id)]).length;if(chosen){t.value=previous;confirmAction('更换挂链类型',`将清空 <strong>${esc(account(id).name)}</strong> 下 ${chosen} 条已选剧目，需在新类型中重新选择。其他账号不受影响。`,'更换并重新选剧',()=>{setAccountType(w,id,type);render();toast('挂链类型已更换，请重新选剧')})}else{setAccountType(w,id,type);render()}}if(t.dataset.targetAsset){const id=t.dataset.targetAccount,key=targetKey(t.dataset.targetAsset,id);if(availableTargets(w,id).some(x=>x.id===t.value))w.targets[key]=t.value;else delete w.targets[key];render()}if(t.dataset.wizardPlatform){const p=t.dataset.wizardPlatform;t.checked?w.platforms.push(p):w.platforms=w.platforms.filter(x=>x!==p);if(!w.platforms.includes(state.activePlatform))state.activePlatform=w.platforms[0]||'抖音';render()}if(t.dataset.config){w.configs[state.activePlatform][t.dataset.config]=t.value;if(['mode','hang'].includes(t.dataset.config))render()}if(t.id==='allAssets'){state.assetSelected=new Set(t.checked?w.assets.map(a=>a.id):[]);render()}if(t.dataset.selectAsset){t.checked?state.assetSelected.add(t.dataset.selectAsset):state.assetSelected.delete(t.dataset.selectAsset);render()}if(t.id==='wizardTemplate'&&t.value){const template=templates.find(x=>x.id===t.value);confirmAction('应用文案模板','将替换当前平台的批量文案配置，其他平台保持不变。','应用模板',()=>{w.configs[state.activePlatform].text=template.text;render()})}if(t.id==='onlyValid')w.onlyValid=t.checked;if(t.id==='urgent')w.urgent=t.checked});
document.addEventListener('input',e=>{if(e.target.type!=='radio'&&editorChange(e.target))return;if(e.target.type==='radio'&&!e.target.checked)return;if(state.wizard&&e.target.dataset.config)state.wizard.configs[state.activePlatform][e.target.dataset.config]=e.target.value});
document.addEventListener('keydown',e=>{if($('#overlay').hidden)return;if(e.key==='Escape'){if(materialEditor?.selectingCollection)renderNativeMaterialEditor();else{closeModal();materialEditor=null}};if(e.key==='Tab'){const focusables=$$('#overlay button:not(:disabled),#overlay input:not(:disabled),#overlay select,#overlay textarea,#overlay a').filter(el=>el.offsetParent!==null);const first=focusables[0],last=focusables[focusables.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}});
window.addEventListener('storage',e=>{if(e.key!==STORE||!e.newValue)return;try{const data=JSON.parse(e.newValue);rows=data.rows||rows;accounts=data.accounts||accounts;templates=data.templates||templates;draft=data.draft||null;if(state.page!=='wizard'&&$('#overlay').hidden)render()}catch(_) {}});
if(new URLSearchParams(location.search).get('annotated'))document.body.classList.add('annotated');
render();
persist();
