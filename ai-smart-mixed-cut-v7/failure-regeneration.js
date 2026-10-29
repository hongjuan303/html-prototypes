import {clone,validate} from './engine.js?v=20261029-update21c';
import {failedRevision} from './production-tasks.js?v=20261029-update21c';
import {beginFailedRework,beginNarrationUpdate} from './workflow-model.js?v=20261029-update21c';

export function regenerationAvailability(o){
 if(o.status==='failed'&&!o.cancelled){
  if(o.replacementJobId)return {reason:'已发起重做任务'};
  if(o.failureDismissed)return {reason:'已结束处理'};
  return {kind:'initial'};
 }
 const kind=failedRevision(o),result=kind==='narration'?o.lastNarrationResult:o.lastReworkResult;
 if(!kind)return {reason:'状态已变化'};
 if(!result?.request)return {reason:'原修改参数缺失，请在成片详情重新发起'};
 return {kind};
}

// Validate the complete selection against a draft before reserving any points.
export function prepareFailedRegeneration(state,b,ids,isLocked=()=>false){
 if(!ids.length||new Set(ids).size!==ids.length)throw Error('请选择失败素材');
 const items=ids.map(id=>b.outputs.find(o=>o.id===id));
 if(items.some(o=>!o||!regenerationAvailability(o).kind||o.retryStarting||isLocked(o)))throw Error('素材状态已变化，请重新选择');
 const error=validate(b.config);if(error)throw Error(error);
 const draft=clone(state),db=draft.batches.find(item=>item.id===b.id),initial=[],revisions=[];
 for(const item of items){
  const o=db.outputs.find(o=>o.id===item.id),kind=regenerationAvailability(o).kind;
  if(kind==='initial'){
   const amount=Number(db.cost.unit)||0;if(draft.balance<amount)throw Error('积分不足，请减少选择数量');
   draft.balance-=amount;db.cost.frozen+=amount;db.status='running';
   draft.ledger.unshift({id:'RE-'+crypto.randomUUID(),batch:db.id,output:o.id,type:'失败项重新生成 · 冻结制作额度',points:-amount,at:new Date().toISOString()});
   (o.failureHistory||=[]).push({failure:clone(o.failure||{}),at:new Date().toISOString(),attempt:o.attempt});
   o.status='pending';delete o.failure;delete o.simulatedDueAt;initial.push(o.id);
  }else{
   const job=kind==='narration'?beginNarrationUpdate(draft,db,o,o.lastNarrationResult.request.texts):beginFailedRework(draft,db,o);
   revisions.push({id:o.id,operationId:job.operationId,kind});
  }
 }
 state.balance=draft.balance;state.ledger=draft.ledger;b.cost=db.cost;b.status=db.status;
 for(const item of items){Object.assign(item,db.outputs.find(o=>o.id===item.id));if(initial.includes(item.id)){delete item.failure;delete item.simulatedDueAt;}}
 const owner=(state.productionJobs||[]).find(j=>j.batchId===b.id);if(owner)delete owner.dismissed;
 return {initial,revisions};
}
