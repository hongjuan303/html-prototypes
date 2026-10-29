import {findDrama,listDramas} from './dramas.js?v=20261029-update21d';
import {clone,normalizeCreationConfig} from './engine.js?v=20261029-update21d';
import {sourcePermissionError} from './source-access.js?v=20261029-update21d';
import {importSelectionError} from './import-state.js?v=20261029-update21d';

function selectionError(state,drama){
 return sourcePermissionError(state,drama.config)||importSelectionError(drama.source)||(!drama.source.availableEpisodes.length?'剧集信息未就绪':'');
}
export function importableDramas(state){
 return listDramas(state).map(drama=>({...drama,selectionError:selectionError(state,drama)}));
}
export function librarySelectionConfig(state,id){
 const drama=findDrama(state,id);
 if(!drama)throw Error('剧目已失效，请重新选择');
 const error=selectionError(state,drama);if(error)throw Error(error);
 const episodes=[...drama.source.availableEpisodes].sort((a,b)=>a-b),available=new Set(episodes);
 let {start,end}=drama.config;
 const savedRange=episodes.filter(n=>n>=start&&n<=end);
 if(!Number.isInteger(start)||!Number.isInteger(end)||start<1||end<start||savedRange.length!==end-start+1||!available.has(start)||!available.has(end)){
  start=episodes[0];end=start;
  for(const n of episodes.slice(1)){if(n!==end+1||end-start>=29)break;end=n;}
 }
 // Reuse the existing source identity and version, while retaining the current
 // production draft. A rename is display metadata, not a new source asset.
 const source={...clone(drama.config.source),displayName:drama.title};
 return normalizeCreationConfig({...clone(state.config),source,start,end});
}
