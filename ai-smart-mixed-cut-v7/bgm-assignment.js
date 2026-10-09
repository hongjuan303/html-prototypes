import {BGM_LIBRARY,BGM_LIBRARY_SOURCE,normalizeBgmSelection,validateBgmSelection} from './bgm-model.js?v=20261009-update11';

// A deterministic fixture for the storyboard prototype, not a production AI
// matcher. It reads each output's selected words independently; no batch emotion,
// output index or forced different-track rotation is used. Production evaluates
// the final video timeline and the shared platform catalog described in the PRD.
const fixtureSignals={
 'tension-01':['质疑','异常','秘密','悬念','疑点','隐瞒','核查','被换','阻止'],
 'rise-01':['认可','反击','赢回','证明','更正','署名','王牌','成功','独立'],
 'soft-01':['道歉','情感','离开','重逢','遗憾','思念','安慰','难过'],
};
export function assignBgmSnapshot(config,output){
 if(!config.bgm)return null;
 const error=validateBgmSelection(config);if(error)throw Error(error);
 const selected=normalizeBgmSelection(config);
 const timing={duration:Math.max(0,Number(output?.duration)||0),ducking:true,fadeIn:true,fadeOut:true};
 if(selected.bgmSource==='local'){
  const track=selected.bgmLocal;
  return {source:'local',trackId:track.id,name:track.name,trackDuration:track.duration,...timing,simulated:true};
 }
 let track;
 if(selected.bgmSource==='library')track=BGM_LIBRARY.find(item=>item.id===selected.bgmTrack);
 else{
  const content=(output?.segments||[]).map(segment=>String(segment.text||'')).join(' ');
  const score=item=>(fixtureSignals[item.id]||[]).reduce((n,word)=>n+content.split(word).length-1,0);
  track=[...BGM_LIBRARY].sort((a,b)=>score(b)-score(a))[0];
 }
 if(!track)throw Error('暂无可用BGM，请更换配乐');
 return {source:selected.bgmSource,trackId:track.id,name:track.name,trackDuration:track.duration,librarySource:BGM_LIBRARY_SOURCE,...timing,simulated:true,...(selected.bgmSource==='smart'?{matching:'per-output-storyboard-fixture'}:{})};
}
