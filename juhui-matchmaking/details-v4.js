import * as M from './model-v2.js?v=20261106-test-scenarios';
import * as A from './access-v3.js?v=20261106-test-scenarios';
import * as N from './navigation-v2.js?v=20261106-test-scenarios';

export function details(s,h){
 const {E,button,link,badge,audit,stage,panel,fileList,scriptTab,matchTab,productionTab,filmTab,releaseTab,channels,data,back,cardPanel=()=>'',reviewAttachments=()=>'',internalMaterials=()=>'',scriptVersionHistory=()=>''}=h;
 const source=p=>p.source==='internal'?'内部自有':M.nameOf(s,p.supplier);
 const fields=items=>`<dl class="record-fields">${items.map(([label,value])=>`<div><dt>${E(label)}</dt><dd>${E(value||'—')}</dd></div>`).join('')}</dl>`;
 const reviewEvents=p=>(p.history||[]).filter(x=>/^(剧本资料已提交|供应商提交一卡|供应商提交剧本|内部剧本提交|内部剧本修改重提|一卡评估|重新提交一卡|上传全集|全集剧本评估|剧本内容审核|剧本安审|总编定稿评级|评级时分配项目制片|完成剧本评级|调整剧本评级|全集两项审核|分配剧本安审)/.test(x.text));
 function events(items){return items.length?`<div class="history">${items.map(x=>`<div><span class="history-dot"></span><small>${E(x.at)}</small><strong>${E(x.text)}</strong><p>${E(x.actor)}</p></div>`).join('')}</div>`:'<p class="muted">暂无流转记录</p>';}
 function reviewSummary(p){
  const rows=[['内容审核',p.quality],['安全审核',p.safety]];
  return `<table class="review-record-table"><thead><tr><th>审核环节</th><th>审核结果</th><th>审核意见</th><th>审核附件</th></tr></thead><tbody>${rows.map(([name,r])=>`<tr><td>${name}</td><td>${audit(r.status)}</td><td>${E(r.opinion||'—')}${r.reviewedBy?`<small>${E(r.reviewedBy)} · 全集 V${r.version||1}</small>`:''}</td><td>${reviewAttachments(r)||'—'}</td></tr>${(r.previousResults||[]).map((old,i)=>`<tr class="previous-result"><td>${name} · 历史结论 ${i+1}</td><td>${audit(old.status)}</td><td>${E(old.opinion||'—')}</td><td>${reviewAttachments(old)||'—'}</td></tr>`).join('')}`).join('')}</tbody></table>`;
 }
 function basic(p){return panel('剧本基本资料',fields([['剧本来源',source(p)],['剧本类型',p.category],['剧本集数',p.episodes+' 集'],['编剧',p.writer],['剧本商务',p.business],['交付日期',p.deliveryDate]])+`<div class="record-description"><h4>剧本简介</h4><p>${E(p.intro||'暂无简介')}</p><h4>备选剧名</h4><p>${E((p.alternates||[]).filter(Boolean).join('、')||'—')}</p></div>`);}
 function cooperationHistory(p){
  const records=[...(p.previousProduction||[]).map(x=>({...x,legacy:true})),...(p.previousCooperations||p.cooperationHistory||[])],legacy=p.legacyReleaseArchives||[];
  if(!records.length&&!legacy.length)return '';
  const result=x=>badge(({none:'待提交',pending:'待审核',approved:'审核通过',revision:'审核驳回',resubmit:'待修改',waiting:'待制片复审',rejected:'不通过'})[x?.status]||'未记录',x?.status==='approved'?'green':x?.status==='revision'?'orange':'');
  const recordsHtml=[...records].reverse().map((record,index)=>{
   const contractReadable=A.isAdmin(s)||A.canFor(s,p,'business')||A.has(s,'prodBusiness')&&A.current(s)?.name===record.productionBusiness;
   const documents=(record.production||[]).slice(0,4).map((item,i)=>`<section class="script-version"><h4>${E(M.productionNames[i])} ${result(item)}</h4>${item.opinion?`<p>${E(item.opinion)}</p>`:''}${fileList(item.files||[])}</section>`).join('');
   const approvals=(record.termination?.confirmationDetails||[]).map(x=>`<p>${E(x.name)} · ${E(x.role==='business'?'承制商务':'合作确认')} · ${E(x.at||'时间未记录')}${x.opinion?' · '+E(x.opinion):''}</p>`).join('');
   const contract=record.productionContract?`<h4>制作合同</h4>${contractReadable?fileList([record.productionContract])+((record.contractHistory||[]).length?`<details class="supporting-file"><summary>历史合同（${record.contractHistory.length}）</summary>${fileList(record.contractHistory.map(x=>x.file||x))}</details>`:''):'<p class="muted">已留档</p>'}`:'';
   const material=record.makerMaterial?`<h4>制作物料 ${result(record.makerMaterial)}</h4>${record.makerMaterial.opinion?`<p>${E(record.makerMaterial.opinion)}</p>`:''}${fileList(record.makerMaterial.files||[])}`:'';
   const film=record.film?`<h4>安全审核 ${result(record.film)}</h4>${record.film.opinion?`<p>${E(record.film.opinion)}</p>`:''}${fileList(record.film.files||[])}`:'';
   const channelHistory=record.channelTasks?.length?`<h4>历史渠道记录</h4>${record.channelTasks.map(t=>`<p>${E(t.channel)} · ${E(({preparing:'准备材料',submitted:'渠道审核中',revision:'内容待修改',confirm:'待制片确认',resubmit:'待重新送审',online:'已上线'})[t.status]||t.status)}${t.actual?' · '+E(t.actual):''}</p>`).join('')}`:'';
   return `<details class="cooperation-record"><summary>${E(record.maker?M.nameOf(s,record.maker):'历史合作')}<span>${E(record.archivedAt||'时间未记录')}</span></summary><div class="archive-history-body">${fields([['合作项目',record.projectName||p.name],['项目制片',record.producer],['承制商务',record.productionBusiness],['处理结果',record.termination?.mode==='rematch'?'重新匹配承制方':record.termination?.mode==='end'?'结束项目':record.legacy?'历史合作':'已归档'],['终止说明',record.termination?.reason],['归档人',record.archivedBy]])}${approvals}${documents}${film}${material}${contract}${record.schedule?`<p>历史排期：${E(record.schedule)}</p>`:''}${channelHistory}</div></details>`;
  }).join('');
  const recovered=legacy.map(x=>`<section class="script-version"><h4>${E(x.reason||'历史排期与渠道')}</h4>${x.schedule?`<p>历史排期：${E(x.schedule)}</p>`:''}${(x.channelTasks||[]).map(t=>`<p>${E(t.channel)} · ${E(t.status)}</p>`).join('')}<p class="muted">历史记录未提供完整合作归属和时间。</p></section>`).join('');
  return `<details class="archive-history cooperation-history"><summary>合作历史<span>${records.length} 次合作${legacy.length?' · 含历史排期记录':''}</span></summary><div class="archive-history-body">${recordsHtml}${recovered}</div></details>`;
 }
 function documents(p,title=p.grade?'定稿剧本':'待评级剧本'){return panel(title,`<div class="document-status"><span>${p.full?badge('全集 · V'+(p.full.version||1),'blue'):badge('暂无全集')} ${p.grade?badge('已定稿','green'):''}</span><span class="muted">${p.grade?'评级：'+E(p.grade)+'级':'审核通过 · 待评级'}</span></div>${fileList(p.full?[p.full]:[])}`);}
 function usage(p){
  if(M.isAwaitingRating(p))return panel('撮合进度','<p class="muted">评级时一并选择项目制片，确认后在剧本库匹配承制方。承制方确认选中后进入撮合管理。</p>');
  const text=({matching:p.selected?'已选中':'待匹配',production:'制作中',release:'发行准备中',scheduling:'待排期',online:'已上线',ended:'已终止'})[p.stage]||M.stages[p.stage];
  return panel('使用状态',`<div class="usage-state">${badge(text,p.stage==='online'?'green':'blue')}<p>${p.selected?'承制方已选中该剧本':p.stage==='ended'?'项目已终止':'尚未确认承制方'}</p></div>${fields([['关联项目',p.selected?M.projectName(p):'承制方选中后生成'],['承制方',p.selected?M.nameOf(s,p.selected):'待匹配'],['项目制片',p.producer||'待分配']])}${N.canOpenProject(s,p)?`<div class="usage-action">${button('查看撮合项目','open-matching-project',p.id,'primary')}</div>`:''}`);
 }
 function library(p){
  const pending=M.isAwaitingRating(p);
  const rating=panel('剧本评级',pending?`<div class="archive-grade">${badge('待评级','orange')}</div><p class="muted">剧本评估、安审均已通过。确认 S / A / B 级、题材标签及项目制片后，在剧本库匹配承制方。</p><p class="rating-owner">在剧本库列表完成评级并选择项目制片</p>`:`<div class="archive-grade">${badge(p.grade+'级剧本','grade')}<span>${(p.tags||[]).map(t=>badge(t)).join(' ')}</span></div><p class="muted">已完成定稿评级</p>${p.rating?fields([['最近评级人',p.rating.by],['最近评级时间',p.rating.at]]):''}`);
  return `<div class="library-layout"><div>${documents(p)}${basic(p)}${cardPanel(p)}${internalMaterials(p)}</div><aside class="library-status">${rating}${usage(p)}</aside></div><details class="archive-history"><summary>历史审核记录<span>查看评估结论与修改记录</span></summary><div class="archive-history-body">${reviewSummary(p)}${events(reviewEvents(p))}</div></details>${scriptVersionHistory(p)}${cooperationHistory(p)}`;
 }

 function evaluationStatus(p){
  return audit(M.evaluationStatus(p));
 }
 function evaluation(p){
  let content=s.ui.tab==='review-history'?panel('评估记录',reviewSummary(p)+events(reviewEvents(p)))+scriptVersionHistory(p):scriptTab(p);
  return `<div class="evaluation-brief"><span>当前审核资料 <b>${'全集 V'+(p.full?.version||1)}</b></span><span>剧本来源 <b>${E(source(p))}</b></span><span>剧本商务 <b>${E(p.business)}</b></span></div>${content}`;
 }
 function projectProgress(p){const steps=[['production','制作审核'],['safety','安全审核'],['release','发行准备'],['scheduling','排播上线'],['online','已上线']];const current=p.stage==='release'&&p.film.status!=='approved'?'safety':p.stage;const at=steps.findIndex(([key])=>key===current);return `<div class="stepper execution-progress">${steps.map(([key,label],i)=>`<div class="${i<at?'done':i===at?'current':''}"><span>${i<at?'✓':i+1}</span>${label}</div>`).join('')}</div>`;}
 return function render(p){
  const kind=N.detailKind(s),tabs=N.detailTabs(s,p);
  if(tabs.length&&!tabs.some(([key])=>key===s.ui.tab))s.ui.tab=N.detailTab(s,p);
  if(tabs.length&&!tabs.some(([key])=>key===s.ui.tab))s.ui.tab=tabs[0][0];
  const tabBar=tabs.length?`<div class="tabs" role="tablist" aria-label="${kind==='evaluation'?'评估详情':'项目详情'}">${tabs.map(([key,label])=>`<button role="tab" aria-selected="${s.ui.tab===key}" data-tab="${key}" class="${s.ui.tab===key?'active':''}">${label}</button>`).join('')}</div>`:'';
  let result=`<section class="scoped-detail" data-detail-kind="${kind}"><div class="detail-back">${back}</div><div class="detail-title"><div><span>${N.title(s.ui.view)}${kind==='library'&&s.ui.tab==='match'?' / 匹配承制方':''} / ${E(p.id)}</span><h1>${E(kind==='project'?M.projectName(p):p.name)} ${kind==='evaluation'?evaluationStatus(p):kind==='library'?badge(p.grade?'已定稿':'待评级',p.grade?'green':'orange'):stage(p)}</h1></div>${kind==='project'&&M.canRenameProject(s,p)?button('修改项目名称','rename-project',p.id):''}${kind==='evaluation'&&p.grade?badge(p.grade+'级剧本','grade'):''}</div>`;
  if(kind==='library')return result+tabBar+(s.ui.tab==='match'&&p.grade?matchTab(p):library(p))+'</section>';
  if(kind==='evaluation')return result+tabBar+evaluation(p)+'</section>';
  result+=fields([['原剧本名称',p.name],['项目制片',p.producer||'待分配'],['承制方',p.selected?M.nameOf(s,p.selected):'待匹配'],['剧本评级',p.grade?p.grade+'级':'—']])+projectProgress(p)+tabBar;
  const pages={match:()=>matchTab(p),production:()=>productionTab(p),safety:()=>filmTab(p),release:()=>releaseTab(p),channels:()=>channels(p),data:()=>data(p),script:()=>documents(p,'剧本文件')+basic(p)+cardPanel(p),history:()=>panel('流转记录',events(p.history||[]))+cooperationHistory(p)};
  return result+(pages[s.ui.tab]||pages.match)()+'</section>';
 };
}
