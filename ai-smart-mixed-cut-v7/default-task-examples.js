import {initialState,normalizeCreationConfig,clone,assetKey,analyze,planBatch,activeRule,createBatch} from './engine.js?v=20261027-update19d';
import {newJob} from './production-tasks.js?v=20261027-update19d';
import {nameBatch} from './material-identity.js?v=20261027-update19d';
import {canAccessMarket} from './source-access.js?v=20261027-update19d';

// Prototype fixtures only: seed completed failure records, without running jobs or charging the wallet.
export function ensureDefaultRetryExamples(state){
 if(state.defaultRetryExamplesVersion===1)return false;
 const scratch=initialState(),template=normalizeCreationConfig(scratch.config);
 if(!canAccessMarket(state,'domestic'))template.source=canAccessMarket(state,'overseas')?{...template.source,market:'overseas'}:{kind:'manual',simulated:true,assetId:'default-retry-source',displayName:'重试样例（虚构示例）'};
 const prepared=[{count:3,ready:0,kind:'all-fail'},{count:10,ready:8,kind:'partial-two'}].map((sample,i)=>{
  const config={...clone(template),count:sample.count,source:{...clone(template.source),fileVersion:Date.now()+i}};
  analyze(scratch,config);
  const plans=planBatch(config,activeRule(scratch),scratch.assets[assetKey(config)]).candidates.slice(0,sample.count);
  if(plans.length!==sample.count)throw Error('重试样例选段不足');
  return {...sample,config,batch:createBatch(scratch,config,plans)};
 });
 for(const sample of prepared){
  const {config,batch:b}=sample,j=newJob(state,config,'normal');
  j.demoExampleKind=sample.kind;j.defaultRetryExample=true;j.analysisSettled=true;j.analysisCharge=0;
  j.stage='generating';j.batchId=b.id;j.completedAt=j.created;
  b.productionJobId=j.id;b.taskVersion=j.taskVersion;b.created=j.created;b.completedAt=j.created;b.status='done';
  b.cost={...b.cost,quoted:0,analysis:0,production:0,frozen:0,released:0,refunded:0};
  b.outputs.forEach((o,i)=>{
   o.attempt=1;o.status=i<sample.ready?'ready':'failed';
   o.quality={status:i<sample.ready?'passed':'failed',checkedAt:j.created};
   if(i<sample.ready)o.generatedAt=j.created;
   else o.failure={kind:'timeout',stage:'composition',recoverable:true,code:i%2?'temporary_io':'interrupted'};
  });
  nameBatch(b,j.number,j.created);
  state.assets[assetKey(config)]=clone(scratch.assets[assetKey(config)]);
  state.batches.unshift(b);
 }
 state.defaultRetryExamplesVersion=1;
 return true;
}
