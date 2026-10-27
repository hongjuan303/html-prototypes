import {estimate,getEpisodes} from './engine.js?v=20261027-update19c';
import {resolveSource} from './sources.js?v=20261027-update19c';

// Source readiness is determined by the selected episodes, never the entry page.
export function selectedSourceInfo(config){
 const source=resolveSource(config),{start,end}=config;
 if(!source)return {status:'empty'};
 if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<1||end<start||end>(source.totalEpisodes||source.requestedRange?.end||0))return {status:'invalid-range'};
 const files=Array.isArray(source.files)?source.files:source.simulated===true?getEpisodes(config).map(episode=>({...episode,episode:episode.id})):[];
 const selected=[];
 for(let id=start;id<=end;id++){
  const matches=files.filter((file,index)=>Number(file.episode??file.order??index+1)===id);
  if(matches.length!==1||!source.availableEpisodes?.includes(id)||!Number.isFinite(Number(matches[0].duration))||Number(matches[0].duration)<=0||['error','reading','unavailable'].includes(matches[0].status))return {status:'unknown',cloud:source.kind==='cloud'};
  selected.push(matches[0]);
 }
 return {status:'known',seconds:selected.reduce((sum,file)=>sum+Number(file.duration),0),episodes:selected.length};
}
export function creationQuote(state,config=state.config){
 const info=selectedSourceInfo(config);
 if(info.status!=='known')return info;
 // This static prototype reuses its existing illustrative quote/ledger rates.
 // Production must replace estimate() with the platform's quote response;
 // no conversion from the 0.5 yuan/min reference is assumed here.
 const quote=estimate({...state,assets:state.assets||{}},{...config,bgm:false,title:false},config.count);
 return quote.valid?{...info,status:'quoted',...quote}:{...info,status:'incomplete',error:quote.error};
}
export const sourceMinutes=seconds=>(seconds/60).toLocaleString('zh-CN',{maximumFractionDigits:2});
