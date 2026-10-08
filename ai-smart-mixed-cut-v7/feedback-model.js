import {isFullNarration} from './engine.js?v=20261008-interaction1';

// Labels are shared by the picker, saved feedback, and preview. Category controls
// the next action; a creative suggestion must never become a free quality repair.
export const ISSUE_TYPES=[
 {id:'dialogue',label:'对白吞字 / 断句',category:'quality',modes:['highlight','mixed']},
 {id:'context',label:'剧情不连贯 / 缺少铺垫',category:'quality'},
 {id:'duplicate',label:'成片内片段重复',category:'quality'},
 {id:'narration',label:'解说句子不完整',category:'quality',modes:['mixed','full']},
 {id:'narration-fact',label:'解说事实错误',category:'quality',modes:['mixed','full']},
 {id:'character',label:'人物称呼 / 关系错误',category:'quality',modes:['mixed','full']},
 {id:'narration-join',label:'解说与原片衔接不自然',category:'quality',modes:['mixed']},
 {id:'alignment',label:'解说与画面不对应',category:'quality',modes:['mixed','full']},
 {id:'subtitle-text',label:'字幕错字 / 漏字',category:'quality'},
 {id:'subtitle',label:'字幕缺失 / 不同步',category:'quality'},
 {id:'subtitle-layout',label:'字幕遮挡 / 超出画面',category:'quality'},
 {id:'voice-pronunciation',label:'配音读音错误',category:'quality',modes:['mixed','full']},
 {id:'voice-audio',label:'人声缺失 / 爆音 / 音量异常',category:'quality'},
 {id:'music',label:'BGM 压住人声',category:'quality',bgm:true},
 {id:'music-missing',label:'BGM 缺失',category:'quality',bgm:true},
 {id:'black',label:'黑屏 / 画面缺失',category:'quality'},
 {id:'freeze',label:'卡帧 / 闪帧',category:'quality'},
 {id:'title-layout',label:'小标题遮挡内容',category:'quality',title:true},
 {id:'opening',label:'开场不够吸引',category:'creative',direction:'opening',reason:'opening'},
 {id:'pacing',label:'节奏拖沓 / 速度不合适',category:'creative',direction:'angle',reason:'slow'},
 {id:'ending',label:'结尾悬念不足',category:'creative',direction:'angle',reason:'angle'},
 {id:'narration-style',label:'解说表达 / 风格不合适',category:'creative',modes:['mixed','full'],direction:'angle',reason:'angle'},
 {id:'bgm-mood',label:'BGM 情绪不合适',category:'creative',bgm:true,direction:'angle',reason:'angle'},
 {id:'similar',label:'与其他成片过于相似',category:'creative',direction:'angle',reason:'similar'}
];
export function issueTypes(c){
 const mode=isFullNarration(c)?'full':c.mode==='narrated'?'mixed':'highlight';
 return ISSUE_TYPES.filter(t=>(!t.modes||t.modes.includes(mode))&&(!t.bgm||c.bgm)&&(!t.title||c.title));
}
export function parseTimeCode(value){
 const text=String(value??'').trim();if(!text)return null;
 if(/^\d+(?:\.\d+)?$/.test(text))return Number(text);
 const parts=text.split(':');if(parts.length<2||parts.length>3||!parts.every((p,i)=>i===parts.length-1?/^\d{1,2}(?:\.\d+)?$/.test(p):/^\d+$/.test(p)))return null;
 const numbers=parts.map(Number);if(numbers.slice(1).some(n=>n>=60))return null;
 return numbers.reduce((s,n)=>s*60+n,0);
}
export function formatTimeCode(value){
 const rounded=Math.round(Number(value||0)*10),minutes=Math.floor(rounded/600),seconds=Math.floor(rounded%600/10),tenths=rounded%10;
 return minutes+':'+String(seconds).padStart(2,'0')+(tenths?'.'+tenths:'');
}
export function issueRangeLabel(item){
 if(item.scope==='all')return '整条素材';
 return formatTimeCode(item.at)+(item.endAt!=null?'–'+formatTimeCode(item.endAt):' 起');
}
export function feedbackRange({scope,start,end},duration){
 if(scope==='all')return {scope:'all',at:0,endAt:duration};
 if(scope!=='segment')throw Error('请选择反馈范围');
 const at=parseTimeCode(start),endAt=String(end??'').trim()?parseTimeCode(end):null;
 if(at===null||!Number.isFinite(at)||at<0||at>duration)throw Error('请填写成片范围内的起始时间');
 if(String(end??'').trim()&&(endAt===null||!Number.isFinite(endAt)||endAt<=at||endAt>duration))throw Error('结束时间需晚于起始时间，且不超过成片时长');
 return {scope:'segment',at,endAt};
}
export function duplicateFeedback(list,type,range){
 return list.some(item=>item.type===type&&(item.scope||'segment')===range.scope&&Math.abs(item.at-range.at)<0.5&&((item.endAt==null&&range.endAt==null)||(item.endAt!=null&&range.endAt!=null&&Math.abs(item.endAt-range.endAt)<0.5)));
}
export function currentPreferences(o){return (o.preferences||[]).filter(p=>p.version===o.contentVersion);}
export function recordOutputIssue(o,c,type,range,detail=''){
 const definition=issueTypes(c).find(t=>t.id===type);if(!definition)throw Error('请选择适用于当前素材的问题类型');
 const list=definition.category==='quality'?o.issues:(o.preferences ||= []);
 const existing=definition.category==='quality'?list:currentPreferences(o);
 if(duplicateFeedback(existing,type,range))throw Error('这段的问题已记录');
 const segment=o.segments.find(s=>s.end>range.at)||o.segments.at(-1);
 const item={id:'ISS-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),type,label:definition.label,category:definition.category,...range,segmentId:segment.id,detail:String(detail).trim().slice(0,200),recordOnly:true,version:o.contentVersion};
 list.push(item);
 if(definition.category==='quality'){o.status='issue';o.quality={...(o.quality||{}),status:'attention'};}
 o.confirmed=false;o.confirmedVersion=null;o.confirmedAt=null;
 return item;
}
