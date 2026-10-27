import {issueTypes,issueRangeLabel,formatTimeCode,currentPreferences,ISSUE_TYPES} from './feedback-model.js?v=20261027-update18a';

const required='<span class="required" aria-hidden="true">*</span>';
export function feedbackForm(c,o,at,{esc,option}){
 const types=issueTypes(c),groups=[['quality','质量问题'],['creative','创作调整']],start=Math.min(Math.floor(at),Math.max(0,Math.ceil(o.duration)-1));
 const time=(id,label,value,mandatory)=>`<div class="field"><label for="${id}Minutes">${mandatory?required:''}${label}</label><div class="minute-second"><input type="number" id="${id}Minutes" aria-label="${label}分钟" ${mandatory?'required aria-required="true"':''} min="0" max="${Math.floor(o.duration/60)}" step="1" inputmode="numeric" placeholder="00" value="${value==null?'':Math.floor(value/60)}"><span>分</span><input type="number" id="${id}Seconds" aria-label="${label}秒" ${mandatory?'required aria-required="true"':''} min="0" max="59" step="1" inputmode="numeric" placeholder="00" value="${value==null?'':value%60}"><span>秒</span></div></div>`;
 return `<div class="field"><label for="issueType">${required}问题类型</label><select id="issueType" aria-label="问题类型" required aria-required="true">${groups.map(([id,label])=>`<optgroup label="${label}">${types.filter(t=>t.category===id).map(t=>option(t.id,t.label,types[0].id)).join('')}</optgroup>`).join('')}</select></div><div class="field feedback-scope"><label>${required}反馈范围</label><div class="pills" role="group" aria-label="反馈范围"><button type="button" class="active" data-action="issue-scope" data-value="segment" aria-pressed="true">局部片段</button><button type="button" data-action="issue-scope" data-value="all" aria-pressed="false">整条素材</button></div></div><div class="fields feedback-time-range" id="issueTimeRange">${time('issueStart','开始时间',start,true)}${time('issueEnd','结束时间',null,false)}</div><p class="helper">素材时长 ${formatTimeCode(o.duration)}</p><div class="field"><label for="issueDetail">补充说明</label><textarea id="issueDetail" maxlength="200" rows="3" placeholder="选填，最多200字"></textarea></div><p class="helper" id="issueCategoryHint">提交后记录该素材的问题。</p>`;
}
export function readFeedbackTime(root,id,label,{required=false}={}){
 const m=root.querySelector('#'+id+'Minutes'),s=root.querySelector('#'+id+'Seconds');
 if(m.value===''&&s.value===''){if(required)throw Error('请填写'+label);return '';}
 if(m.value===''||s.value===''||!m.validity.valid||!s.validity.valid||!Number.isInteger(Number(m.value))||!Number.isInteger(Number(s.value)))throw Error('请完整填写'+label+'的分、秒（秒为0–59）');
 return Number(m.value)*60+Number(s.value);
}
export function feedbackItems(b,o,locked,{esc,button,tag}){
 const quality=(o.issues||[]).map((item,index)=>({item,index,quality:true}));
 const creative=currentPreferences(o).map(item=>({item,quality:false}));
 return [...quality,...creative].map(({item,index,quality})=>{
  const definition=ISSUE_TYPES.find(t=>t.id===item.type),whole=item.scope==='all'||item.type==='continuity';
  const attrs=`data-batch="${esc(b.id)}" data-id="${esc(o.id)}" ${locked?'disabled':''}`;
  const action='';
  return `<div class="issue ${quality?'':'creative-feedback'}"><div><div class="issue-heading"><b>${esc(item.label)}</b>${tag(quality?'质量问题':'创作调整',quality?'orange':'')}</div><small>${issueRangeLabel(item)}</small>${item.detail?`<p>${esc(item.detail)}</p>`:''}</div>${action}</div>`;
 }).join('');
}
