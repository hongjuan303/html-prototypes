import * as M from './model-v2.js?v=20261106-test-scenarios';
import * as N from './navigation-v2.js?v=20261106-test-scenarios';

export function supplierProgress(p){
 if(p.stage==='ended')return '已终止';
 const tasks=p.channelTasks||[],online=tasks.filter(t=>t.status==='online').length;
 if(tasks.length)return online===tasks.length?'已上线':online?`${online}/${tasks.length} 个渠道已上线`:'发行中';
 if(p.stage==='scheduling')return '待排播';
 if(p.stage==='online')return '已上线';
 if(p.stage==='release')return '发行准备中';
 if(p.selected)return '制作中';
 if([p.quality?.status,p.safety?.status].every(x=>x==='approved'))return '待合作';
 return '评估中';
}

export function supplierRelease(s,p,h){
 const {E,button,badge,panel,fileList,issue}=h;
 const maker=M.isMaker(s,p),writer=M.isWriter(s,p);
 if(!p||!(maker||writer)||!M.visible(s).some(x=>x.id===p.id))return issue('当前账号不可查看此项目的发行进度。');
 const tasks=p.channelTasks||[],labels={preparing:'准备上线',submitted:'渠道审核中',revision:'内容待修改',confirm:'修改稿确认中',resubmit:'待重新送审',online:'已上线'};
 const body=(p.schedule?`<p class="subtle">计划上线：${E(p.schedule.replace('T',' '))}</p>`:'')+
  (tasks.length?`<div class="table-wrap"><table class="catalog-table"><colgroup><col style="width:14%"><col style="width:18%"><col style="width:45%"><col style="width:23%"></colgroup><thead><tr><th>渠道</th><th>发行状态</th><th>反馈 / 上线结果</th><th>操作</th></tr></thead><tbody>${tasks.map(t=>{
   const canFix=maker&&p.stage!=='ended'&&t.status==='revision'&&t.returnType!=='material',safeUrl=typeof t.url==='string'&&/^https?:\/\//i.test(t.url);
   const feedback=maker&&['revision','confirm','resubmit'].includes(t.status)&&t.returnType!=='material'?(t.opinion?`<p class="subtle">${E(t.opinion)}</p>`:'')+(t.files?.length?fileList(t.files):''):'';
   return `<tr><td>${E(t.channel)}</td><td>${badge(labels[t.status]||'跟进中',t.status==='online'?'green':t.status==='revision'?'orange':'blue')}</td><td>${feedback}${t.actual?`<p class="subtle">实际上线：${E(t.actual.replace('T',' '))}</p>`:''}${safeUrl?`<a href="${E(t.url)}" target="_blank" rel="noopener">查看上线页面 ↗</a>`:''}${!feedback&&!t.actual&&!safeUrl?'<span class="muted">等待发行进度更新</span>':''}</td><td>${canFix?button('提交内容修改','channel-fix',p.id,'primary',`data-value="${E(t.channel)}"`):'<span class="muted">—</span>'}</td></tr>`;
  }).join('')}</tbody></table></div>`:'<p class="muted">暂无渠道任务，后续排播与上线结果将在这里同步。</p>');
 return panel('发行进度',body);
}

// Contractor views expose only the selection task or the selected contractor's work.
export function makerViews(s,h){
 const {E,heading,field,button,link,badge,panel,fileList,issue,empty,listNavigation,productionTab,filmTab,makerMaterials,releaseProgress}=h;
 const isAccount=()=>s.ui.system==='supplier'&&s.ui.business==='matching'&&s.ui.identity==='maker';
 const visible=p=>isAccount()&&M.visible(s).some(x=>x.id===p?.id);
 const owned=p=>visible(p)&&M.isMaker(s,p);
 const offer=p=>M.latestOffer(p,s.ui.supplier);
 const selectable=p=>visible(p)&&p.stage==='matching'&&!p.selected&&offer(p)?.status==='pending'&&(!offer(p).expires||offer(p).expires>M.now(s));
 const offerStatus=p=>{
  if(owned(p))return ['已选中','green'];
  if(p.selected)return ['已被其他承制方选中',''];
  const o=offer(p);
  if(o?.status==='pending'&&o.expires&&o.expires<=M.now(s))return ['已超时',''];
  return ({pending:['待选择','orange'],selected:['已选中','green'],declined:['未选中',''],expired:['已超时',''],withdrawn:['已撤回',''],locked:['不可再选','']})[o?.status]||['不可再选',''];
 };
 const statusBadge=p=>badge(...offerStatus(p));
 const deadline=p=>{
  const o=offer(p);
  if(!o)return '—';
  if(!o.expires)return '不限时';
  const date=new Date(o.expires);
  return Number.isNaN(date.getTime())?'—':date.toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false})+' 截止';
 };
 const selectionActions=(p,compact=false)=>{
  const action=compact?link:(label,key,id)=>button(label,key,id,key==='select'?'primary':'');
  if(owned(p))return action('进入制作','manage-project',p.id);
  if(selectable(p))return action('确认选中','select',p.id)+action('未选中','decline',p.id);
  return compact?'':button('不可再选择','noop',p.id,'','disabled');
 };
 const work=p=>{
  const tasks=p.channelTasks||[],channel=tasks.find(t=>t.status==='revision'&&t.returnType!=='material');
  if(p.stage==='ended')return {text:'项目已终止',label:'查看记录',action:'production-workspace'};
  if(channel)return {text:channel.channel+'：'+(channel.opinion||'内容需要修改'),label:'处理渠道修改',action:'channel-fix',value:channel.channel};
  if(p.stage==='release'&&p.film?.status==='revision')return {text:p.film.opinion||'按安全审核意见修改全集',label:'修改后提交',action:'filmResubmit'};
  const eligible=[0,1,2].filter(i=>M.canSubmitProduction(s,p,i)),rejected=eligible.filter(i=>['revision','resubmit'].includes(p.production[i].status));
  if(eligible.length){const chosen=rejected.length?rejected:eligible,names=['人物及场景资产','一卡demo','全集初稿'];return {text:chosen.map(i=>names[i]).join('、')+(rejected.length?'需修改':'待提交'),label:rejected.length?'修改交付':'提交制作资料',action:'deliver',value:chosen.length===1?String(chosen[0]):''};}
  if(p.film?.status==='waiting')return {text:'修改版已提交，等待制片复审',label:'查看审核反馈',action:'production-workspace'};
  if(p.film?.status==='pending')return {text:'全集终版等待安全审核',label:'查看审核进度',action:'maker-safety'};
  if(p.production?.slice(0,3).some(x=>x.status==='pending'))return {text:'制作资料已提交，等待审核',label:'查看审核反馈',action:'production-workspace'};
  const material=p.makerMaterial||{};
  if(material.draft||['none','draft','revision'].includes(material.status))return {text:material.draft||material.status==='draft'?'制作物料草稿待提交':material.status==='revision'?'制作物料需按意见补充':'待补充制作物料',label:material.draft||material.status==='draft'?'继续填写制作物料':'补充制作物料',action:'makerMaterial'};
  if(tasks.length)return {text:supplierProgress(p),label:'查看发行进度',action:'supplier-progress'};
  return {text:material.status==='pending'?'制作物料已提交，等待项目制片核验':'当前没有待处理事项',label:'查看项目',action:'detail'};
 };
 const workStatus=p=>{
  if(p.stage==='ended')return badge('已终止','red');
  if(p.stage==='online')return badge('已上线','green');
  if(p.stage==='scheduling')return badge('待上线','blue');
  if(['revision','resubmit'].includes(p.film?.status))return badge('待修改','orange');
  if(p.film?.status==='waiting')return badge('待制片复审','orange');
  if(p.film?.status==='approved')return badge('发行准备中','blue');
  if(p.film?.status==='pending'&&p.production?.slice(0,3).length===3&&p.production.slice(0,3).every(x=>x.status==='approved'))return badge('安全审核中','blue');
  return badge('制作交付中','blue');
 };
 function pagination(rows){return `<div class="pagination"><span>共 ${rows.length} 条 · 每页 8 条</span>${button('‹','page','','',`data-page="${Math.max(1,s.ui.page-1)}" ${s.ui.page===1?'disabled':''}`)}<span class="current-page">${s.ui.page}</span>${button('›','page','','',`data-page="${s.ui.page+1}" ${s.ui.page*8>=rows.length?'disabled':''}`)}</div>`;}
 function list(){
  if(!isAccount())return '';
  const selecting=s.ui.view==='intake',rows=N.rows(s).filter(p=>visible(p)&&(selecting||owned(p)));
  s.ui.page=Math.min(Math.max(1,s.ui.page||1),Math.max(1,Math.ceil(rows.length/8)));
  const headingText=selecting?'剧本评估':'内容管理';
  const headers=selecting?['剧本名称','题材','选本状态','反馈期限','操作']:['项目名称','项目进度','当前待办','操作'];
  const columns=selecting?[29,14,17,17,23]:[27,16,33,24];
  let html=heading(headingText,selecting?'预览分配给你的剧本一卡，选中后即可获取全集并进入制作。':'优先处理需要你提交或修改的事项，制作物料可随时补充。')+listNavigation();
  html+=`<section class="panel filter-panel"><form id="filters">${field(selecting?'剧本名称 / ID':'项目名称 / 剧本名称 / ID','keyword',s.ui.keyword)}<div class="filter-actions"><button class="btn primary">搜索</button>${button('重置','clear')}</div></form></section>`;
  html+=`<section class="panel"><div class="table-toolbar"><h3>${selecting?'剧本列表':'制作项目'} <span>${rows.length} 项</span></h3></div><div class="table-wrap"><table class="catalog-table"><colgroup>${columns.map(width=>`<col style="width:${width}%">`).join('')}</colgroup><thead><tr>${headers.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>`;
  html+=rows.slice((s.ui.page-1)*8,s.ui.page*8).map(p=>{
   const locked=selecting&&!owned(p)&&!selectable(p);
   if(selecting)return `<tr class="${locked?'locked':''}"><td><button class="title-link" data-action="detail" data-id="${E(p.id)}">${E(p.name)}</button><small>${E(p.id)} · ${E(p.episodes)}集</small></td><td>${E((p.tags||[]).join(' / ')||'—')}</td><td>${statusBadge(p)}</td><td>${E(deadline(p))}</td><td><div class="catalog-actions">${p.card?link('预览一卡','maker-preview',p.id):''}${selectionActions(p,true)}</div></td></tr>`;
   const task=work(p),extra=task.value===undefined?'':`data-value="${E(task.value)}"`;
   const secondary=task.action==='makerMaterial'?(p.channelTasks?.length?link('查看发行进度','supplier-progress',p.id):link('查看项目','detail',p.id)):link(p.makerMaterial?.draft?'制作物料草稿':'补充制作物料','makerMaterial',p.id);
   return `<tr><td><button class="title-link" data-action="detail" data-id="${E(p.id)}">${E(M.projectName(p))}</button><small>${E(p.id)} · ${E(p.episodes)}集</small></td><td>${workStatus(p)}</td><td class="project-pending">${E(task.text)}</td><td><div class="catalog-actions">${link(task.label,task.action,p.id,extra)}${secondary}</div></td></tr>`;
  }).join('');
  return html+`</tbody></table>${rows.length?'':empty(selecting?'暂无分配给你的剧本':'暂无已选中的制作项目')}</div>${pagination(rows)}</section>`;
 }
 function selectionDetail(p){
  const readable=M.readableScriptFiles(s,p),card=p.card&&readable.includes(p.card)?[p.card]:[];
  return `<section class="scoped-detail" data-detail-kind="maker-selection"><div class="detail-back">${link('‹ 返回剧本评估','back')}</div><div class="detail-title"><div><span>${E(p.id)} · ${E(p.episodes)}集</span><h1>${E(p.name)} ${statusBadge(p)}</h1></div><div class="actions">${selectionActions(p)}</div></div>${panel('剧本简介',`<div class="inline-status">${(p.tags||[]).map(t=>badge(t)).join(' ')}${p.category?`<span>${E(p.category)}</span>`:''}</div><p class="subtle">${E(p.intro||'暂无简介，请预览剧本一卡。')}</p>${selectable(p)?`<p class="subtle">反馈期限：${E(deadline(p))}</p>`:''}`)}${panel('剧本一卡',fileList(card))}${selectable(p)?issue('确认选中后可获取剧本全集并进入制作。'):''}</section>`;
 }
 function detail(p){
  if(!visible(p))return empty('当前账号无法查看该剧本');
  // An expired offer still permits the card, never another contractor's production.
  if(s.ui.view==='intake'||!owned(p))return selectionDetail(p);
  const tabs=[['production','制作交付'],['safety','安全审核'],['materials','制作物料'],...(p.channelTasks?.length?[['release','发行进度']]:[])];
  if(s.ui.tab==='channels')s.ui.tab='release';
  if(s.ui.tab==='release'&&!p.channelTasks?.length)s.ui.tab='materials';
  if(!tabs.some(([key])=>key===s.ui.tab))s.ui.tab='production';
  let html=`<section class="scoped-detail" data-detail-kind="maker-production"><div class="detail-back">${link('‹ 返回内容管理','back')}</div><div class="detail-title"><div><span>${E(p.id)} · ${E(p.episodes)}集</span><h1>${E(M.projectName(p))} ${workStatus(p)}</h1></div></div><div class="tabs" role="tablist" aria-label="制作项目">${tabs.map(([key,label])=>`<button role="tab" aria-selected="${s.ui.tab===key}" data-tab="${key}" class="${s.ui.tab===key?'active':''}">${label}</button>`).join('')}</div>`;
  if(s.ui.tab==='production'){
   const readable=M.readableScriptFiles(s,p),full=p.full&&readable.includes(p.full)?[p.full]:[];
   html+=productionTab(p)+`<details class="archive-history"><summary>剧本全集<span>查看制作参考剧本</span></summary><div class="archive-history-body">${fileList(full)}</div></details>`;
  }else if(s.ui.tab==='safety')html+=filmTab(p);
  else if(s.ui.tab==='release')html+=releaseProgress?releaseProgress(p):supplierRelease(s,p,h);
  else html+=makerMaterials(p);
  return html+'</section>';
 }
 return {list,detail};
}
