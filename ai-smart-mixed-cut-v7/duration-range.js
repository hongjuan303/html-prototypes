// Persist final output bounds in seconds; display units never change the bounds.
export const DURATION_LIMITS = Object.freeze({min:10,max:1200});
export const DURATION_PRESETS = Object.freeze([[10,30],[30,60],[60,300],[120,600],[300,720]]);
const LEGACY = {'1':[45,80],'3':[150,210],'5':[270,330],'10':[540,660],'3-5':[180,300],'5-7':[300,420],'30s':[27,35],'60s':[55,65],'90s':[85,95],'120s':[110,130]};
export function durationRange(config={}){
 if(Object.hasOwn(config,'durationMinSeconds')||Object.hasOwn(config,'durationMaxSeconds'))return [config.durationMinSeconds,config.durationMaxSeconds];
 return [...(LEGACY[config.duration]||[180,300])];
}
export function normalizeDuration(config,input=config){
 const [min,max]=durationRange(input);
 return {...config,duration:'custom',durationMinSeconds:min,durationMaxSeconds:max,durationMinUnit:input.durationMinUnit==='s'?'s':'m',durationMaxUnit:input.durationMaxUnit==='s'?'s':'m'};
}
export function durationError(config){
 const [min,max]=durationRange(config);
 if(!Number.isInteger(min)||!Number.isInteger(max))return '请填写最短和最长成片时长';
 if(min<10||max>1200||min>1200||max<10)return '成片时长范围为10秒～20分钟';
 if(min>max)return '最短时长不能大于最长时长';
 return '';
}
export function secondsLabel(value){
 if(!Number.isFinite(value))return '待填写';
 return value<60?value+'秒':value%60===0?value/60+'分钟':Math.floor(value/60)+'分'+value%60+'秒';
}
export function durationRangeLabel(config){const [min,max]=durationRange(config);return durationError(config)?'待设置有效时长':min===max?secondsLabel(min):secondsLabel(min)+'～'+secondsLabel(max);}
export function durationDisplay(seconds,unit){return Number.isFinite(seconds)?unit==='s'?seconds:Number((seconds/60).toFixed(3)):'';}
export function durationInput(value,unit){if(String(value).trim()==='')return null;const number=Number(value);if(!Number.isFinite(number))return null;if(unit==='s'&&!Number.isInteger(number))return null;return unit==='s'?number:Math.round(number*60);}
