import {clone,normalizeCreationConfig} from './engine.js?v=20261029-update21c';
import {dramaKey,findDrama,registerDrama} from './dramas.js?v=20261029-update21c';
import {importSummary} from './import-state.js?v=20261029-update21c';

export function applyDramaImport(state,input,start,end,{inLibrary=false,now=Date.now()}={}){
 const source=clone(input),total=source.kind==='manual'?source.files.length:end-start+1;
 source.importProgress={status:source.kind==='cloud'?'importing':'complete',completed:source.kind==='cloud'?0:total,total};
 if(source.kind==='cloud')source.mockImportDue=now+7000;
 const config=normalizeCreationConfig({...(inLibrary?{title:false,titleText:''}:state.config),source,start,end});
 const entry=registerDrama(state,config);
 if(!entry)throw Error('剧目已删除，请重新导入');
 if(!inLibrary){state.config=config;state.plan=null;}
 return entry.id;
}
export function retryDramaImport(state,id,{now=Date.now()}={}){
 const drama=findDrama(state,id);
 if(!drama||importSummary(drama.source).status!=='failed')throw Error('剧目状态已变化，请刷新后重试');
 const source=clone(drama.config.source),total=importSummary(drama.source).total;
 source.importProgress={status:'importing',completed:0,total};
 source.mockImportDue=now+7000;
 // Retry the saved import, keeping its identity, files, range and version.
 registerDrama(state,{...drama.config,source},{touch:false});
 if(dramaKey(state.config)===id)state.config.source=clone(source);
 return id;
}
export function removeFailedDrama(state,id){
 const drama=findDrama(state,id);if(!drama||importSummary(drama.source).status!=='failed')throw Error('仅导入失败的剧目可删除');
 state.deletedDramaIds=[...new Set([...(state.deletedDramaIds||[]),id])];
 if(Array.isArray(state.dramas))state.dramas=state.dramas.filter(d=>d.id!==id);else delete state.dramas[id];
 if(dramaKey(state.config)===id){state.config={...state.config,source:{kind:'empty'},start:1,end:1};state.plan=null;}
 // Historical jobs, outputs and analysis snapshots remain immutable.
}
export function advanceDemoImports(state,now=Date.now()){
 let changed=false;
 for(const entry of Object.values(state.dramas||{})){
  const s=entry.config?.source,p=s?.importProgress;if(!s?.mockImportDue||p?.status!=='importing')continue;
  const completed=now>=s.mockImportDue?p.total:Math.min(p.total-1,Math.floor(p.total*Math.max(0,1-(s.mockImportDue-now)/7000)));
  if(completed===p.completed&&now<s.mockImportDue)continue;
  p.completed=completed;if(now>=s.mockImportDue){p.status='complete';s.importStatus='resolved';s.files=(s.files||[]).map(file=>['error','unavailable'].includes(file.status)?{...file,status:'ready'}:file);delete s.mockImportDue;}
  if(dramaKey(state.config)===entry.id)state.config.source=clone(s);
  changed=true;
 }
 return changed;
}
export function ensureImportExamples(state){
 if(state.importExamplesV21)return false;
 const specs=[['importing','导入进度示例',30,8],['partial','部分导入失败示例',10,8],['failed','全部导入失败示例',10,0]];
 for(const [kind,title,total,completed] of specs){
  const source={kind:'cloud',assetId:'import-example-'+kind,title,market:'domestic',fileVersion:1,importStatus:'resolved',totalEpisodes:total,availableEpisodes:Array.from({length:total},(_,i)=>i+1),requestedRange:{start:1,end:total},files:Array.from({length:total},(_,i)=>({id:`${kind}-${i+1}`,name:`第${i+1}集.mp4`,episode:i+1})),cover:'',simulated:false,mockImport:true,importProgress:{status:kind==='importing'?'importing':'failed',total,completed}};
  const config=normalizeCreationConfig({source,start:1,end:total,title:false,bgm:false}),id=dramaKey(config);
  if(!state.deletedDramaIds?.includes(id)&&!state.dramas?.[id])registerDrama(state,config);
 }
 state.importExamplesV21=true;return true;
}
