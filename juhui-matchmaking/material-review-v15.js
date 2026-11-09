import * as M from './model-v2.js?v=20261109-channels';
import {materialForm} from './material-form-v14.js?v=20261109-channels';
import {materialLabel,materialFeedback,materialReviewRecords,materialHistoryButton} from './material-feedback-v15.js?v=20261109-channels';

export const isMaterialReview=type=>['confirmScript','confirmMaker'].includes(type);
export function materialReviewSurface(s,p,d,h){
 const kind=d.type==='confirmScript'?'scriptMaterial':'makerMaterial',item=p[kind],{E,field,fileInput}=h;
 d.materialVersion??=item.version;
 const title=materialLabel(kind)+'核验';
 const role=kind==='makerMaterial'?'承制方提交 · 项目制片核验':p.source==='internal'?'剧本商务上传 · 总编核验':'剧本方提交 · 剧本商务核验';
 const readonly=materialForm(s,p,kind,item,h,{readOnly:true,introExtra:`<p class="material-review-role">${role}</p>`});
 const decision=`<aside class="material-review-decision" aria-label="物料核验操作"><div class="material-decision-heading"><h3>整份物料核验</h3>${materialHistoryButton(p,kind,h)}</div><p class="subtle">核验范围包含本次提交的全部资料与附件。</p>${field('核验结果','result','',{required:true,select:[['approved','通过'],['revision','驳回修改']]})}${field('修改意见','opinion','',{area:true,help:'驳回修改时必填，请写明对应分区与修改要求。'})}${fileInput('reviewFiles','审核附件（选填）')}<p class="subtle">可上传批注文件、标注图片等，不限制格式。提交方可查看、预览和下载。</p></aside>`;
 return {title,body:`<div class="material-review-layout">${readonly}${decision}</div>`,submit:'提交核验结果'};
}

function canRead(s,p,kind){
 if(!p||s.ui.business!=='matching'||!M.visible(s).some(x=>x.id===p.id))return false;
 if(s.ui.system==='platform')return true;
 return kind==='scriptMaterial'?s.ui.identity==='script'&&M.isWriter(s,p):s.ui.identity==='maker'&&p.selected===s.ui.supplier;
}
export function materialHistoryModal(s,p,d,h){
 if(!['material-review-history','material-version'].includes(d.type))return null;
 const [kind,position]=String(d.value||'').split(':'),{E,button}=h;
 const title=materialLabel(kind)+(d.type==='material-version'?' · 提交版本':'核验记录');
 if(!['scriptMaterial','makerMaterial'].includes(kind)||!canRead(s,p,kind))return {title,body:'<p class="muted">当前账号不可查看该物料记录。</p>'};
 const rows=materialReviewRecords(p[kind]);
 if(d.type==='material-version'){
  const item=rows[Number(position)];
  if(!item)return {title,body:'<p class="muted">未找到对应版本。</p>'};
  return {title,body:materialForm(s,p,kind,item,h,{readOnly:true,introExtra:materialFeedback(item,h)})};
 }
 return {title,body:`<div class="review-project"><strong>${E(kind==='makerMaterial'?p.projectName||p.name:p.name)}</strong><small>${E(p.id)}</small></div><div class="material-review-records">${rows.map((item,i)=>`<article class="material-review-record"><header><h3>${materialLabel(kind)} · ${item.version?'V'+E(item.version):'版本未记录'}</h3>${button('查看该版物料','material-version',p.id,'',`data-value="${kind}:${i}"`)}</header><p class="subtle">提交时间：${E(item.submittedAt||'未记录')}${item.submittedBy?' · '+E(item.submittedBy):''}</p>${materialFeedback(item,h)}</article>`).join('')||'<p class="muted">暂无核验记录。</p>'}</div>`};
}
