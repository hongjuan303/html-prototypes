import {assetKey,clone} from './engine.js?v=20261027-update19c';

const ANALYSIS_CODES=new Set(['analysis_parse','analysis_validation']);
const COMPOSITION_CODES=new Set(['interrupted','timeout','temporary_io']);
const busyRetry=j=>['submitting','running'].includes(j?.retryRequest?.status);

// Explicit service failure classification only; unknown errors never default to retryable.
export function retryScope(j,b){
 if(!j||j.dismissed||j.replacementJobId||j.stage==='cancelled')return null;
 if(busyRetry(j))return {...j.retryRequest,busy:true};
 if(!b){
  const saved=j.analysisResult;
  if(j.stage==='failed'&&ANALYSIS_CODES.has(j.failureKind)&&saved?.raw&&saved.sourceKey===assetKey(j.config)&&saved.start===j.config.start&&saved.end===j.config.end)
   return {kind:'analysis',outputIds:[],busy:false};
  return null;
 }
 const outputIds=b.outputs.filter(o=>o.status==='failed'&&!o.cancelled&&!o.replacementJobId&&!o.failureDismissed&&!o.repairing&&!o.reworkPending&&!o.retryStarting&&o.failure?.stage==='composition'&&o.failure?.recoverable===true&&COMPOSITION_CODES.has(o.failure?.code)&&o.segments?.length).map(o=>o.id);
 return outputIds.length?{kind:'composition',outputIds,busy:false}:null;
}

export function validateSavedAnalysis(j){
 const saved=j.analysisResult;
 if(!saved?.raw||saved.sourceKey!==assetKey(j.config)||saved.start!==j.config.start||saved.end!==j.config.end)throw Error('已有分析结果不可用');
 const result=JSON.parse(saved.raw);
 if(!Array.isArray(result.episodes)||!Number.isInteger(result.revision)||result.revision<1)throw Error('已有分析结果校验未通过');
 for(let ep=j.config.start;ep<=j.config.end;ep++)if(!result.episodes.includes(ep))throw Error('已有分析结果缺少所选剧集');
 return result;
}

export function beginTaskRetry(state,j,b){
 const scope=retryScope(j,b);
 if(!scope||scope.busy)throw Error('任务状态已变化，请刷新后重试');
 const now=new Date().toISOString();
 if(scope.kind==='composition'){
  b.status='running';delete b.completedAt;
  for(const o of b.outputs.filter(o=>scope.outputIds.includes(o.id))){
   (o.failureHistory||=[]).push({failure:clone(o.failure),at:now,attempt:o.attempt});
   // Persist the charge for this attempt so refresh and repeated failures remain free.
   o.pendingCharge=0;
   o.status='pending';delete o.failure;delete o.simulatedDueAt;o.generationScenario='normal';
  }
  j.stage='generating';
 }else{
  (j.failureHistory||=[]).push({kind:j.failureKind,error:j.error,at:now});
  j.stage='validating';
 }
 j.retryRequest={id:crypto.randomUUID(),kind:scope.kind,outputIds:scope.outputIds,status:'running',created:now};
 delete j.error;delete j.completedAt;
 return scope;
}

export function finishTaskRetries(state){
 for(const j of state.productionJobs||[]){
  const retry=j.retryRequest;if(retry?.status!=='running')continue;
  const b=state.batches.find(b=>b.id===j.batchId);
  const complete=retry.kind==='composition'?b&&!b.outputs.some(o=>retry.outputIds.includes(o.id)&&o.status==='pending'):j.stage==='failed'||(b&&!b.outputs.some(o=>o.status==='pending'));
  if(complete){retry.status='done';retry.completedAt=new Date().toISOString();}
 }
}
