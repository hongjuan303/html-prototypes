import {materialFeedback,materialHistoryButton} from './material-feedback-v15.js?v=20261109-overview-merge';
import * as M from './model-v2.js?v=20261109-overview-merge';
import * as A from './access-v3.js?v=20261109-overview-merge';
import {renderMaterialMetadata,groupedMaterialFiles} from './material-display-v14.js?v=20261109-overview-merge';

export function productionViews(s,h){
 const {E,button,link,badge,panel,fileList,issue}=h;
 const platform=()=>s.ui.system==='platform';
 const readable=p=>!!p&&s.ui.business==='matching'&&A.visible(s,p,'matching')&&(platform()||M.isMaker(s,p));
 const own=p=>readable(p)&&M.isMaker(s,p);
 const names=['人物及场景资产','一卡demo','全集初稿'];
 const itemLabel=status=>({none:'待提交',pending:'待审核',approved:'审核通过',revision:'审核驳回',resubmit:'待修改',waiting:'待制片复审'})[status]||'待提交';
 const color=status=>({pending:'blue',approved:'green',revision:'orange',resubmit:'orange',waiting:'orange'})[status]||'';
 const passed=p=>p.production?.slice(0,3).length===3&&p.production.slice(0,3).every(x=>x.status==='approved')&&p.production[3]?.status==='approved';
 const denied=()=>issue('当前账号不可查看此项目的制作资料。');
 function reviewDetails(x){
  const time=x.reviewedAt||x.submittedAt;
  return `${x.opinion?`<p class="subtle"><strong>审核意见：</strong>${E(x.opinion)}</p>`:''}${x.recheckReason?`<p class="subtle">${E(x.recheckReason)}</p>`:''}${time?`<small>${x.reviewedAt?'审核时间':'提交时间'}：${E(time)}${platform()&&x.reviewedBy?' · '+E(x.reviewedBy):''}</small>`:''}`;
 }
 function versions(item){
  const history=item.previousResults||[];
  if(!history.length)return '';
  return `<details class="supporting-file"><summary>历史版本（${history.length}）</summary>${[...history].reverse().map(x=>`<section class="script-version"><h4>V${E(x.version||1)} ${badge(itemLabel(x.status),color(x.status))}</h4>${fileList(x.files||[])}${reviewDetails(x)}</section>`).join('')}</details>`;
 }
 function production(p){
  if(!readable(p))return denied();
  const eligible=[0,1,2].filter(i=>own(p)&&M.canSubmitProduction(s,p,i));
  const body=`<p class="subtle">三项可分别提交或同时提交，制片分别审核；三项全部通过后，全集终版进入安全审核。</p><div class="table-wrap"><table class="catalog-table production-table"><colgroup><col style="width:20%"><col style="width:13%"><col style="width:49%"><col style="width:18%"></colgroup><thead><tr><th>交付项</th><th>审核状态</th><th>当前文件 / 审核意见</th><th>操作</th></tr></thead><tbody>${names.map((name,index)=>{
   const item=p.production[index]||{status:'none',files:[]};
   const submit=own(p)&&M.canSubmitProduction(s,p,index),review=M.canReviewProduction(s,p,index);
   return `<tr><td><strong>${name}</strong>${item.files?.length?`<small>当前版本 V${E(item.version||1)}</small>`:''}</td><td>${badge(itemLabel(item.status),color(item.status))}</td><td>${item.files?.length?fileList(item.files):'<p class="muted">尚未提交文件</p>'}${reviewDetails(item)}${versions(item)}</td><td><div class="catalog-actions">${submit?link(item.status==='none'?'提交文件':'修改后提交','deliver',p.id,`data-value="${index}"`):''}${review?link('审核','production',p.id,`data-value="${index}"`):''}${!submit&&!review?'<span class="muted">—</span>':''}</div></td></tr>`;
  }).join('')}</tbody></table></div>`;
  let result=panel(platform()?'制作审核':'制作交付',body,(eligible.length>1?button('批量提交','deliver',p.id,'primary','data-value=""'):'')+(M.canTerminateProduction(s,p)?button('终止承制合作','terminate',p.id,'danger'):''));
  const final=p.production[3];
  if(final?.status==='approved')result+=panel('全集终版',`<div class="inline-status">${badge('已确定','green')}<span>V${E(final.version||1)} · 制片最终审核通过的全集版本</span></div><p class="subtle">${passed(p)?'三项制作交付均已通过，当前全集终版已进入安全审核。':'等待其余交付项通过后，当前全集终版进入安全审核。'}</p>`);
  if(platform()&&p.production[1]?.status==='approved')result+=issue('一卡制作已通过，可由对接商务安排试卖。');
  return result;
 }
 function safety(p){
  if(!readable(p))return denied();
  const film=p.film||{status:'none',files:[]},ready=passed(p);
  const label=({approved:'审核通过',revision:'审核驳回',pending:ready?'待安全审核':'待制作通过',waiting:'待制片复审',resubmit:'待修改',none:'待制作通过'})[film.status]||'待制作通过';
  const review=ready&&p.stage==='release'&&film.status==='pending'&&A.canFor(s,p,'film');
  const assign=platform()&&A.canFor(s,p,'filmLead')&&(ready||['revision','waiting'].includes(film.status));
  const resubmit=own(p)&&p.stage==='release'&&film.status==='revision';
  const actions=(assign?button('分配正片安审','match-review-assign',p.id):'')+(review?button('审核正片','film',p.id,'primary'):'')+(resubmit?button('提交修改版本','filmResubmit',p.id,'primary'):'');
  const files=film.files?.length?film.files:ready?p.production[3].files:[];
  let body=`<div class="inline-status">${badge(label,color(film.status))}${film.version&&files.length?`<span>送审版本 V${E(film.version)}</span>`:''}</div>`;
  if(film.status==='revision')body+=issue('请按安全审核意见修改全集，提交后先由制片复审，通过后再次进入安全审核。');
  else if(film.status==='waiting')body+=issue('修改版已提交，等待制片复审通过后重新进入安全审核。');
  else if(!ready&&film.status!=='approved')body+=issue('人物及场景资产、一卡demo、全集初稿三项均通过后，开启安全审核。');
  if(files.length)body+=`<h4>送审的全集终版</h4>${fileList(files)}`;
  body+=reviewDetails(film);
  if(platform()&&p.filmAssignee)body+=`<p class="subtle">安全审核人：${E(s.users.find(u=>u.id===p.filmAssignee)?.name||'待分配')}</p>`;
  const results=(film.previousResults||[]).filter(x=>['approved','revision'].includes(x.status));
  if(results.length)body+=`<details class="archive-history"><summary>历史安全审核结果<span>${results.length} 次</span></summary><div class="archive-history-body">${[...results].reverse().map(x=>`<section class="script-version"><h4>送审版本 V${E(x.version||1)} ${badge(itemLabel(x.status),color(x.status))}</h4>${reviewDetails(x)}${fileList(x.files||[])}</section>`).join('')}</div></details>`;
  return panel('安全审核',body,actions);
 }
 function materials(p){
  if(!readable(p))return denied();
  const material=p.makerMaterial||{status:'none',values:{},files:[]};
  const label=({none:'待上传',draft:'草稿',pending:'待核验',approved:'已确认',revision:'待修改'})[material.status]||'待上传';
  const editable=own(p),display=editable?M.materialForEdit(material):material,draft=editable&&!!material.draft;
  const metadata=renderMaterialMetadata(display.values||{},'makerMaterial',{E});
  let content=`<p class="subtle">承制方提交 · 项目制片核验</p><div class="inline-status"><span>制作物料状态：</span>${badge(label,color(material.status))}${material.version&&['pending','approved','revision'].includes(material.status)?`<span>正式版本 V${E(material.version)}</span>`:''}${draft&&material.status!=='draft'?badge('另有未提交草稿','orange'):''}</div>${draft?issue('下方为当前草稿。保存草稿不改变已提交版本，正式提交后重新核验。'):''}${materialFeedback(material,{E,fileList})}${metadata||'<p class="muted">尚未补充制作物料信息</p>'}<h4>制作物料附件${draft?' · 当前草稿':''}</h4>${groupedMaterialFiles(display.files||[],{E,fileList})}`;
  if(material.confirmedSnapshot&&(draft||material.confirmedSnapshot.version!==material.version))content+=`<details class="archive-history"><summary>已确认版本<span>V${E(material.confirmedSnapshot.version||1)}</span></summary><div class="archive-history-body">${renderMaterialMetadata(material.confirmedSnapshot.values||{},'makerMaterial',{E})}${groupedMaterialFiles(material.confirmedSnapshot.files||[],{E,fileList})}</div></details>`;
  const actions=materialHistoryButton(p,'makerMaterial',{button})+(editable?button(draft?'继续填写制作物料':material.status==='none'?'上传制作物料':'补充制作物料','makerMaterial',p.id,'primary'):'')+(platform()&&A.canFor(s,p,'producer')&&material.status==='pending'?button('核验制作物料','confirmMaker',p.id,'primary'):'');
  return panel('制作物料',content,actions);
 }
 return {production,safety,materials};
}
