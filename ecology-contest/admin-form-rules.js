// 绿台填写规则；表单提示、保存校验与原型说明共用，中文名称不约定接口参数。
export const CASH_REWARD_MAX=100000;
const text=(label,max,required=false,multiline=false)=>({label,max,required,kind:'text',multiline});
const integer=(label,min,max,required=false)=>({label,min,max,required,kind:'integer'});
const money=(label,min=0,required=false)=>({label,min,max:CASH_REWARD_MAX,required,kind:'money'});
export const baseRules={
  title:text('赛事名称',60,true),subtitle:text('赛事副标题',100),region:text('合作城市 / 地区',50),
  host:text('主办单位',100,true),organizer:text('承办单位',200),supporters:text('支持单位',200),
  rewardSummary:text('卡片奖励摘要',60,true),intro:text('赛事介绍',5000,true,true),benefits:text('参赛支持 / 福利',2000,false,true)
};
export const trackRules={title:text('赛道名称',30,true),brief:text('创作方向',1000,true,true),requirements:text('提交材料',2000,true,true)};
export const prizeRules={rank:text('奖项名称',30,true),count:integer('名额',1,10000,true),cash:money('现金（元 / 件）'),credits:integer('积分（分 / 件）',0,10000000),goods:text('实物（每件获奖作品所得）',200)};
export const resourceRules={title:text('资料名称',100,true),url:{label:'资料链接',kind:'url',max:2000,required:true},usage:text('允许使用范围',500,true)};
export const formRules={
  'award-form':{rank:text('奖项 / 名次',30,true),cash:money('现金奖励（元）',0.01,true),credits:integer('积分奖励',1,10000000,true),goods:text('实物奖励',200,true),proof:text('线下确认记录',1000,false,true)},
  'manual-credit-form':{amount:integer('积分数量',1,10000000,true),note:text('操作原因',500,true,true)},
  'cancel-event-form':{reason:text('取消原因',500,true,true)},
  'offline-form':{proof:text('发放记录',1000,true,true)},
  'review-form':{note:text('评语',500,false,true)}
};
export const textLength=value=>Array.from(String(value??'').trim()).length;
export const commonTextRule='文本规则：去除首尾空白后计数；中文、英文、数字、标点、内部空格及换行各计 1 字符。单行文本不可换行，多行文本支持换行；均按纯文本展示，不解析 HTML。超限保留输入并阻止保存，不自动截断。';
export function ruleHint(r){
  if(r.kind==='text')return `${r.multiline?'多行':'单行'}纯文本，${r.required?'1–'+r.max:'最多 '+r.max} 字符`;
  if(r.kind==='url')return 'HTTP/HTTPS 完整链接，最多 2000 字符';
  if(r.kind==='date')return '日期选择，YYYY-MM-DD（北京时间）';
  return `${r.kind==='integer'?'整数':'金额，最多 2 位小数'}，${r.min.toLocaleString('en-US')}–${r.max.toLocaleString('en-US')}；不支持科学计数法`;
}
export function validResourceURL(value){
  if(/^\.\/assets\/[A-Za-z0-9_./-]+$/.test(value)&&!value.split('/').includes('..'))return true; // 保留已有站内演示资料
  if(!/^https?:\/\//i.test(value)||/\s/.test(value))return false;
  try{const u=new URL(value);return ['http:','https:'].includes(u.protocol)&&!!u.hostname&&!u.username&&!u.password;}catch{return false;}
}
export function validateValue(value,r){
  const v=String(value??'').trim();
  if(!v)return r.required?`请填写${r.label}`:'';
  if(r.max&&['text','url'].includes(r.kind)&&textLength(v)>r.max)return `${r.label}最多 ${r.max} 字符`;
  if(r.kind==='text'){
    if(!r.multiline&&/[\r\n]/.test(v))return `${r.label}请使用单行文本`;
    return '';
  }
  if(r.kind==='url')return validResourceURL(v)?'':`${r.label}须为有效的 HTTP/HTTPS 完整链接`;
  if(r.kind==='date')return /^\d{4}-\d{2}-\d{2}$/.test(v)&&!v.startsWith('0000')&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v?'':`${r.label}请选择有效日期`;
  const pattern=r.kind==='integer'?/^\d+$/:/^\d+(\.\d{1,2})?$/;
  return pattern.test(v)&&Number.isFinite(Number(v))&&Number(v)>=r.min&&Number(v)<=r.max?'':`${r.label}：${ruleHint(r)}`;
}
export function validateEventFields(e){
  const check=(data,rules)=>{for(const [key,r] of Object.entries(rules)){const error=validateValue(data[key],r);if(error)throw Error(error);}};
  check(e,baseRules);
  for(const t of e.tracks||[]){check(t,trackRules);for(const key of ['start','end','reviewStart','reviewEnd','resultStart','resultEnd']){const error=validateValue(t[key],{label:'赛程日期',kind:'date',required:true});if(error)throw Error(error);}}
  for(const p of e.prizes||[]){try{check(p,prizeRules);}catch(error){throw Error('奖项：'+error.message);}}
  for(const r of e.resources||[])check(r,resourceRules);
}
function controlRule(form,el){
  if(form.id!=='event-form')return formRules[form.id]?.[el.name];
  if(el.dataset.prize)return prizeRules[el.dataset.prize];
  if(el.dataset.resource)return resourceRules[el.dataset.resource];
  if(baseRules[el.name])return baseRules[el.name];
  const m=el.name?.match(/^(trackTitle|brief|requirements)([0-2])$/);
  if(m)return trackRules[{trackTitle:'title',brief:'brief',requirements:'requirements'}[m[1]]];
  if(el.type==='date')return {label:el.closest('.field')?.querySelector('span')?.textContent.replace(' *','')||'日期',kind:'date',required:true};
}
export function bindAdminRules(form){
  if(!form||!(form.id==='event-form'||formRules[form.id]))return;
  form.noValidate=true;
  const update=(el,showError=false)=>{
    const r=controlRule(form,el);if(!r||el.readOnly)return;
    const help=el.parentElement.querySelector('[data-field-rule]');
    if(help)help.textContent=ruleHint(r)+(['text','url'].includes(r.kind)?` · ${textLength(el.value)} / ${r.max}`:'');
    const error=el.disabled?'':el.validity.badInput?`${r.label}输入类型不正确`:validateValue(el.value,{...r,required:el.required});
    const box=el.parentElement.querySelector('[data-field-error]');
    if(box)box.textContent=showError?error:'';
    el.setAttribute('aria-invalid',showError&&error?'true':'false');
  };
  let serial=0;
  const enhance=()=>{
    for(const el of form.querySelectorAll('input,textarea')){
      const r=controlRule(form,el);if(!r||el.dataset.ruleReady)continue;
      el.dataset.ruleReady='1';
      // 不截断历史内容/粘贴内容；超长时提示并阻止保存。
      if(['text','url'].includes(r.kind))el.removeAttribute('maxlength');
      if(['integer','money'].includes(r.kind)){el.min=r.min;el.max=r.max;el.step=r.kind==='integer'?'1':'0.01';el.inputMode=r.kind==='integer'?'numeric':'decimal';}
      const id=`${form.id}-rule-${++serial}`,help=document.createElement('small'),error=document.createElement('small');
      help.id=id;help.dataset.fieldRule='';help.className='field-rule';
      error.id=id+'-error';error.dataset.fieldError='';error.className='field-validation-error';error.setAttribute('aria-live','polite');
      el.setAttribute('aria-describedby',id+' '+error.id);el.after(help,error);update(el);
    }
  };
  enhance();
  form.addEventListener('input',e=>update(e.target,!!e.target.value||e.target.getAttribute('aria-invalid')==='true'));
  form.addEventListener('change',e=>update(e.target,true));
  form.addEventListener('focusout',e=>update(e.target,true));
  // 动态奖项/资料行沿用同一规则，无需观察整个页面。
  form.addEventListener('click',()=>queueMicrotask(enhance));
  form.validateAdminRules=()=>{
    enhance();let first;
    for(const el of form.querySelectorAll('input,textarea,select')){
      if(el.disabled||el.readOnly)continue;
      const r=controlRule(form,el);let message=r?(el.validity.badInput?`${r.label}输入类型不正确`:validateValue(el.value,{...r,required:el.required})):'';
      if(!message&&!el.checkValidity())message=el.validationMessage;
      update(el,true);
      if(message&&!first)first={el,message};
    }
    const summary=form.querySelector('.form-error');
    if(first){if(summary)summary.textContent=first.message;first.el.focus();first.el.scrollIntoView({block:'center',behavior:'smooth'});return false;}
    if(summary)summary.textContent='';
    for(const el of form.querySelectorAll('input,textarea'))if(!el.disabled&&!el.readOnly&&controlRule(form,el)?.kind==='text')el.value=el.value.trim();
    return true;
  };
}

// 将长度与类型直接补到对应字段说明，不增添逐字段编号。
export function withFieldRules(doc){
  let rules={};
  if(['新建赛事','配置赛事'].includes(doc.title))rules={...baseRules,...Object.fromEntries(Object.entries(trackRules).map(([k,v])=>['track-'+k,v])),...Object.fromEntries(Object.entries(prizeRules).map(([k,v])=>['prize-'+k,v])),...Object.fromEntries(Object.entries(resourceRules).map(([k,v])=>['resource-'+k,v]))};
  else if(['录入获奖作品','编辑获奖作品'].includes(doc.title))rules=formRules['award-form'];
  else if(doc.title==='人工调整积分')rules=formRules['manual-credit-form'];
  else if(doc.title==='取消赛事')rules=formRules['cancel-event-form'];
  else if(['登记现金发放','登记实物发货'].includes(doc.title))rules={proof:{...formRules['offline-form'].proof,label:doc.title==='登记现金发放'?'转账记录 / 凭据':'物流公司 / 运单号 / 发放记录'}};
  const byLabel=Object.fromEntries(Object.values(rules).map(r=>[r.label,r]));
  if(!Object.keys(rules).length)return doc;
  const sections=doc.sections.map(s=>({...s,items:s.items.map(item=>{const i=item.indexOf('：'),r=byLabel[item.slice(0,i)];return r?item+' '+ruleHint(r)+'。':item;})}));
  sections.at(-1)?.items.push(commonTextRule,'校验失败：定位首个错误字段并提示，保留已填写内容；修正后可再次提交。'+(['新建赛事','配置赛事'].includes(doc.title)?'未开放赛道的隐藏字段不参与校验。':['录入获奖作品','编辑获奖作品'].includes(doc.title)?'未勾选奖励的隐藏字段不参与校验。':''));
  return {...doc,sections};
}
