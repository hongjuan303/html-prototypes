import {prizeRules,validateValue} from './admin-form-rules.js?v=20261124-v2';

// 奖项取当前赛事配置；保存获奖记录时保留奖励快照，不回写历史名单。
export const prizeKey=p=>JSON.stringify([p.track,p.rank,Number(p.cash)||0,Number(p.credits)||0,String(p.goods||'').trim()]);
export function prizesForWork(event,work){
  if(!event||!work||work.event!==event.id||!event.tracks.some(t=>t.name===work.track))return [];
  return (event.prizes||[]).map((prize,index)=>({value:String(index),key:prizeKey(prize),prize})).filter(x=>x.prize.track===work.track);
}
export function initialPrizeValue(choices,award){
  if(!award?.work)return '';
  const exact=choices.filter(x=>x.key===(award.prizeKey||prizeKey({...award,track:x.prize.track})));
  if(exact.length===1)return exact[0].value;
  const named=choices.filter(x=>x.prize.rank===award.rank);
  return named.length===1?named[0].value:'';
}
export function selectedPrize(event,work,value,expectedKey){
  const choice=prizesForWork(event,work).find(x=>x.value===value);
  if(!choice)throw Error('请选择该作品所属赛道已配置的奖项 / 名次');
  if(expectedKey!==choice.key)throw Error('奖项配置已更新，请重新选择奖项并核对奖励内容');
  const p=choice.prize;
  for(const key of ['rank','cash','credits','goods']){
    const error=validateValue(p[key],prizeRules[key]);
    if(error)throw Error('赛事奖项配置有误：'+error+'，请先在赛事配置中调整');
  }
  const cash=Number(p.cash)||0,credits=Number(p.credits)||0,goods=String(p.goods||'').trim();
  if(!cash&&!credits&&!goods)throw Error('该奖项尚未配置奖励，请先在赛事配置中补充');
  return {rank:p.rank.trim(),cash,credits,goods,prizeKey:choice.key};
}
export function rewardSummary(prize,esc){
  if(!prize)return '<p class="muted">选择奖项后自动展示对应奖励。</p>';
  const parts=[Number(prize.cash)>0?['现金奖励（元）',Number(prize.cash).toLocaleString('zh-CN')]:null,Number(prize.credits)>0?['积分奖励',Number(prize.credits).toLocaleString('zh-CN')]:null,String(prize.goods||'').trim()?['实物奖励',prize.goods]:null].filter(Boolean);
  if(!parts.length)return '<p class="notice">该奖项尚未配置奖励，请先在赛事配置中补充。</p>';
  return '<div class="award-reward-summary">'+parts.map(([label,value])=>'<label class="field"><span>'+label+'</span><input value="'+esc(value)+'" readonly></label>').join('')+'</div><p class="muted">奖励内容来自赛事奖项配置。</p>';
}
