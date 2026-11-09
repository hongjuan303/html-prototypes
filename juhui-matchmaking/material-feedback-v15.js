export const materialLabel=kind=>kind==='scriptMaterial'?'剧本物料':'制作物料';
export function materialReviewRecords(material={}){
 return [material,...[...(material.history||[])].reverse()].filter(x=>['approved','revision'].includes(x.status));
}
export function materialFeedback(item={},h,{heading='核验反馈'}={}){
 const {E,fileList}=h;
 if(!['approved','revision'].includes(item.status)&&!item.reviewedAt&&!item.reviewFiles?.length)return '';
 return `<section class="material-feedback ${item.status==='revision'?'is-revision':''}"><h4>${heading}<span>${item.status==='approved'?'已通过':'驳回修改'}</span></h4><p>${E(item.opinion||'未填写补充意见')}</p><small>${item.reviewedVersion||item.version?'物料 V'+E(item.reviewedVersion||item.version)+' · ':''}${E(item.reviewedBy||'')}${item.reviewedBy?' · ':''}${E(item.reviewedAt||'核验时间未记录')}</small>${item.reviewFiles?.length?`<div class="material-review-attachments"><strong>审核附件</strong>${fileList(item.reviewFiles.map(f=>({...f,reviewAttachment:true})))}</div>`:''}</section>`;
}
export function materialHistoryButton(p,kind,h){
 return materialReviewRecords(p[kind]).length?h.button('核验记录','material-review-history',p.id,'',`data-value="${kind}"`):'';
}
