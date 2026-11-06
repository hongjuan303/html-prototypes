import * as M from './model-v2.js?v=20261106-test-scenarios';
import * as N from './navigation-v2.js?v=20261106-test-scenarios';
import {supplierRelease,supplierProgress} from './supplier-v6.js?v=20261106-test-scenarios';

export function writerViews(s,h){
 const {E,heading,field,button,link,badge,panel,fileList,issue,empty,listNavigation,scriptTab,writerMaterials,releaseProgress}=h;
 const visible=p=>!!p&&M.isWriter(s,p)&&M.visible(s).some(x=>x.id===p.id);
 const audit=(review,p)=>{
  const status=M.scriptAuditStatus(review?.status||'pending');
  const label=p.stage==='ended'&&status==='pending'?'已停止审核':(M.scriptAudits[status]||'待审核');
  return badge(label,({pending:'blue',revision:'orange',rejected:'red',approved:'green'})[status]||'');
 };
 const hasRevision=p=>p.stage==='review'&&[p.quality?.status,p.safety?.status].some(x=>['revision','resubmit'].includes(x));
 const materialStatus=material=>{
  const status=material?.status||'none',labels={none:'待上传',draft:'草稿',pending:'待核验',approved:'已确认',revision:'待修改'};
  return badge(labels[status]||'待上传',({pending:'blue',approved:'green',revision:'orange'})[status]||'')+(material?.draft&&status!=='draft'?'<small>另有未提交草稿</small>':'');
 };
 const materialAction=p=>p.scriptMaterial?.draft||p.scriptMaterial?.status==='draft'?'继续填写剧本物料':p.scriptMaterial?.status==='revision'?'修改剧本物料':'补充剧本物料';
 const outcome=p=>p.stage==='ended'?badge('已终止','red'):[p.quality?.status,p.safety?.status].every(x=>x==='approved')?badge('审核通过','green'):hasRevision(p)?badge('审核驳回','orange'):badge('待审核','blue');
 function pagination(rows){return `<div class="pagination"><span>共 ${rows.length} 条 · 每页 8 条</span>${button('‹','page','','',`data-page="${Math.max(1,s.ui.page-1)}" ${s.ui.page===1?'disabled':''}`)}<span class="current-page">${s.ui.page}</span>${button('›','page','','',`data-page="${s.ui.page+1}" ${s.ui.page*8>=rows.length?'disabled':''}`)}</div>`;}
 function list(){
  if(s.ui.system!=='supplier'||s.ui.identity!=='script'||s.ui.business!=='matching')return '';
  const evaluation=s.ui.view==='intake',rows=N.rows(s).filter(visible);
  s.ui.page=Math.min(Math.max(1,s.ui.page||1),Math.max(1,Math.ceil(rows.length/8)));
  const headers=evaluation?['剧本名称','内容审核','安全审核','提交版本','操作']:['剧本名称','剧本物料状态','发行进度','当前可办'];
  const columns=evaluation?[28,17,17,16,22]:[29,18,25,28];
  let html=heading(evaluation?'剧本评估':'内容管理',evaluation?'提交剧本，查看审核意见和结果；需要修改时可直接重新提交。':'随时维护本人的剧本物料，跟进合作与发行进度。')+listNavigation();
  html+=`<section class="panel filter-panel"><form id="filters">${field('剧本名称 / ID','keyword',s.ui.keyword)}${evaluation?field('审核结果','stage',s.ui.stage,{select:[['','全部结果'],...Object.entries(M.scriptAudits)],placeholder:false}):''}<div class="filter-actions"><button class="btn primary">搜索</button>${button('重置','clear')}</div></form></section>`;
  html+=`<section class="panel"><div class="table-toolbar"><h3>${evaluation?'提交记录':'我的剧本'} <span>${rows.length} 项</span></h3>${evaluation?button('＋ 提交剧本','new','','primary'):''}</div><div class="table-wrap"><table class="catalog-table"><colgroup>${columns.map(width=>`<col style="width:${width}%">`).join('')}</colgroup><thead><tr>${headers.map(label=>`<th>${label}</th>`).join('')}</tr></thead><tbody>`;
  html+=rows.slice((s.ui.page-1)*8,s.ui.page*8).map(p=>{
   const name=`<td><button class="title-link" data-action="detail" data-id="${E(p.id)}">${E(p.name)}</button><small>${E(p.id)} · ${E(p.episodes)}集</small></td>`;
   if(evaluation){const actions=hasRevision(p)?link('修改后提交','full',p.id)+link('查看审核意见','reply-workspace',p.id):link(p.stage==='ended'?'查看终止原因':'查看审核结果','reply-workspace',p.id)+link(materialAction(p),'scriptMaterial',p.id);return `<tr>${name}<td>${audit(p.quality,p)}</td><td>${audit(p.safety,p)}</td><td>全集 V${E(p.full?.version||1)}${p.full?.at?`<small>${E(p.full.at)}</small>`:''}</td><td><div class="catalog-actions">${actions}</div></td></tr>`;}
   return `<tr>${name}<td>${materialStatus(p.scriptMaterial)}</td><td>${E(supplierProgress(p))}</td><td><div class="catalog-actions">${link(materialAction(p),'scriptMaterial',p.id)}${p.channelTasks?.length?link('查看发行进度','supplier-progress',p.id):link('查看审核结果','reply-workspace',p.id)}</div></td></tr>`;
  }).join('');
  return html+`</tbody></table>${rows.length?'':empty(evaluation?'暂无符合条件的提交记录':'暂无本人提交的剧本')}</div>${pagination(rows)}</section>`;
 }
 function detail(p){
  if(!visible(p))return empty('当前账号不可查看该剧本');
  const tabs=[['script','审核反馈'],['materials','剧本物料'],...(p.channelTasks?.length?[['release','发行进度']]:[])];
  if(s.ui.tab==='channels')s.ui.tab='release';
  if(s.ui.tab==='release'&&!p.channelTasks?.length)s.ui.tab='materials';
  if(!tabs.some(([key])=>key===s.ui.tab))s.ui.tab=s.ui.view==='intake'?'script':'materials';
  let html=`<section class="scoped-detail" data-detail-kind="writer"><div class="detail-back">${link('‹ 返回'+(s.ui.view==='intake'?'剧本评估':'内容管理'),'back')}</div><div class="detail-title"><div><span>${E(p.id)} · ${E(p.episodes)}集</span><h1>${E(p.name)} ${outcome(p)}</h1></div></div><div class="tabs" role="tablist" aria-label="我的剧本">${tabs.map(([key,label])=>`<button role="tab" aria-selected="${s.ui.tab===key}" data-tab="${key}" class="${s.ui.tab===key?'active':''}">${label}</button>`).join('')}</div>`;
  if(s.ui.tab==='script'){
   html+=scriptTab(p);
   html+=`<details class="archive-history"><summary>已提交剧本<span>一卡与全集</span></summary><div class="archive-history-body">${p.intro?`<p class="subtle">${E(p.intro)}</p>`:''}${fileList(M.readableScriptFiles(s,p))}${M.canManageCard(s,p)?button('更新一卡','card',p.id):''}</div></details>`;
  }else if(s.ui.tab==='materials')html+=writerMaterials(p);
  else html+=releaseProgress?releaseProgress(p):supplierRelease(s,p,h);
  return html+'</section>';
 }
 return {list,detail};
}
