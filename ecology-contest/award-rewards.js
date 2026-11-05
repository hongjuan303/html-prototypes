const kinds = [
  {key:'cash', choice:'rewardCash', label:'现金', field:'现金奖励（元）'},
  {key:'credits', choice:'rewardCredits', label:'积分', field:'积分奖励'},
  {key:'goods', choice:'rewardGoods', label:'实物', field:'实物奖励'}
];

export function selectedRewards(award = {}) {
  return {cash:Number(award.cash)>0, credits:Number(award.credits)>0, goods:!!String(award.goods||'').trim()};
}

export function rewardFields(award, esc) {
  const selected=selectedRewards(award);
  return `<fieldset class="award-reward-types"><legend>奖励类型 <span class="required-mark">*</span></legend><div>${kinds.map(k=>`<label><input type="checkbox" name="${k.choice}" ${selected[k.key]?'checked':''}> ${k.label}</label>`).join('')}</div><p>至少选择一种奖励，勾选后填写对应内容。</p></fieldset><div class="award-reward-fields">${kinds.map(k=>`<label class="field" data-reward-field="${k.key}" ${selected[k.key]?'':'hidden'}><span>${k.field}<em class="required-mark" data-reward-required="${k.key}" ${selected[k.key]?'':'hidden'}> *</em></span><input name="${k.key}" ${k.key==='goods'?'type="text"':'type="number" min="'+(k.key==='cash'?'0.01':'1')+'" max="10000000" step="'+(k.key==='cash'?'0.01':'1')+'"'} value="${esc(award[k.key]||'')}" placeholder="${selected[k.key]?(k.key==='cash'?'请输入现金金额':k.key==='credits'?'请输入积分数量':'如：创作礼盒 × 1'):'请先勾选'+k.label+'奖励'}" ${selected[k.key]?'required':'disabled'}></label>`).join('')}</div>`;
}

export function bindRewardFields(form) {
  for (const k of kinds) {
    const choice=form.elements[k.choice], field=form.elements[k.key];
    const sync=()=>{
      form.querySelector('[data-reward-field="'+k.key+'"]').hidden=!choice.checked;
      field.disabled=!choice.checked;
      field.required=choice.checked;
      form.querySelector('[data-reward-required="'+k.key+'"]').hidden=!choice.checked;
      field.placeholder=choice.checked?(k.key==='cash'?'请输入现金金额':k.key==='credits'?'请输入积分数量':'如：创作礼盒 × 1'):'请先勾选'+k.label+'奖励';
      const error=form.querySelector('.form-error');
      if(choice.checked&&error?.textContent==='请至少选择一种奖励')error.textContent='';
    };
    choice.addEventListener('change',sync);
    sync();
  }
}

export function readRewardFields(data) {
  const chosen=k=>data[k]===true||data[k]==='on';
  const cashSelected=chosen('rewardCash'), creditsSelected=chosen('rewardCredits'), goodsSelected=chosen('rewardGoods');
  if(!cashSelected&&!creditsSelected&&!goodsSelected)throw Error('请至少选择一种奖励');
  const cash=cashSelected?Number(data.cash):0, credits=creditsSelected?Number(data.credits):0, goods=goodsSelected?String(data.goods||'').trim():'';
  if(cashSelected&&(!Number.isFinite(cash)||cash<=0||cash>10000000||Math.abs(cash*100-Math.round(cash*100))>0.000001))throw Error('请填写有效的现金金额：大于 0，最多两位小数，不超过 1000 万元');
  if(creditsSelected&&(!Number.isInteger(credits)||credits<=0||credits>10000000))throw Error('请填写有效的积分数量：大于 0 的整数，不超过 1000 万');
  if(goodsSelected&&!goods)throw Error('请填写实物奖励内容');
  return {cash,credits,goods};
}
