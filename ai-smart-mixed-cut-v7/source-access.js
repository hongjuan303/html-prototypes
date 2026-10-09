// The demo models employee-to-source authorization. Production obtains these
// grants from the signed-in platform account and validates them server-side.
export const SOURCE_ACCESS_SCENARIOS=Object.freeze([
 Object.freeze({id:'domestic',label:'国内员工 · 国内合集权限',matched:true,markets:['domestic']}),
 Object.freeze({id:'overseas',label:'海外员工 · 海外合集权限',matched:true,markets:['overseas']}),
 Object.freeze({id:'both',label:'内部员工 · 国内与海外合集权限',matched:true,markets:['domestic','overseas']}),
 Object.freeze({id:'unmatched',label:'账号未匹配员工',matched:false,markets:[]}),
 Object.freeze({id:'none',label:'内部员工 · 无合集权限',matched:true,markets:[]}),
]);
export function sourceAccess(state={}){
 const scenario=SOURCE_ACCESS_SCENARIOS.find(item=>item.id===(state.sourceAccessScenario===undefined?'domestic':state.sourceAccessScenario))||SOURCE_ACCESS_SCENARIOS.find(item=>item.id==='unmatched');
 return {scenario:scenario.id,employeeMatched:scenario.matched,markets:[...scenario.markets],canUseCollections:scenario.matched&&scenario.markets.length>0};
}
export function canAccessMarket(state,market){return sourceAccess(state).markets.includes(market);}
export function isConfiguredSource(config={}){
 const source=config.source;
 return !!source&&(source.kind==='green'&&!!source.collectionId||source.kind==='manual'&&(source.simulated===true||Array.isArray(source.files)&&source.files.length>0));
}
export function sourcePermissionError(state,config={}){
 if(!isConfiguredSource(config))return '请选择片源';
 return config.source.kind==='green'&&!canAccessMarket(state,config.source.market)?'暂无此合集权限，请更换片源':'';
}
export function clearUnavailableSource(state){
 let changed=false;
 if(state.config?.source?.kind==='green'&&sourcePermissionError(state,state.config)){
  state.config={...state.config,source:{kind:'empty'},start:1,end:1};changed=true;
 }
 if(state.plan?.config&&sourcePermissionError(state,state.plan.config)){state.plan=null;changed=true;}
 return changed;
}
