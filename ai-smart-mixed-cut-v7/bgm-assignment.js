import {BGM_LIBRARY,BGM_LIBRARY_SOURCE,normalizeBgmSelection,validateBgmSelection} from './bgm-model.js?v=20261027-update18a';

import {bgmVolume} from './packaging.js?v=20261027-update18a';

// Snapshot the explicitly selected music for each output.
export function assignBgmSnapshot(config,output){
 if(!config.bgm)return null;
 const error=validateBgmSelection(config);if(error)throw Error(error);
 const selected=normalizeBgmSelection(config);
 const timing={duration:Math.max(0,Number(output?.duration)||0),volumePercent:bgmVolume(config),gain:bgmVolume(config)/100,ducking:true,fadeIn:true,fadeOut:true};
 if(selected.bgmSource==='local'){
  const track=selected.bgmLocal;
  return {source:'local',trackId:track.id,name:track.name,trackDuration:track.duration,...timing,simulated:true};
 }
 const track=BGM_LIBRARY.find(item=>item.id===selected.bgmTrack);
 if(!track)throw Error('暂无可用BGM，请更换配乐');
 return {source:selected.bgmSource,trackId:track.id,name:track.name,trackDuration:track.duration,librarySource:BGM_LIBRARY_SOURCE,...timing,simulated:true};
}
