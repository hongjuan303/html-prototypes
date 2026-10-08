import {issueTypes,issueRangeLabel,formatTimeCode,currentPreferences,ISSUE_TYPES} from './feedback-model.js?v=20261008-interaction1';

export function feedbackForm(c,o,at,{esc,option}){
 const types=issueTypes(c);
 const groups=[['quality','质量问题'],['creative','创作调整']];
 return `<div class="field"><label for="issueType">问题类型</label><select id="issueType" aria-label="问题类型">${groups.map(([id,label])=>`<optgroup label="${label}">${types.filter(t=>t.category===id).map(t=>option(t.id,t.label,types[0].id)).join('')}</optgroup>`).join('')}</select></div><div class="field feedback-scope"><label>问题时间段</label><div class="pills" role="group" aria-label="反馈范围"><button type="button" class="active" data-action="issue-scope" data-value="segment" aria-pressed="true">局部片段</button><button type="button" data-action="issue-scope" data-value="all" aria-pressed="false">整条素材</button></div></div><div class="fields feedback-time-range" id="issueTimeRange"><div class="field"><label for="issueStart">起始时间</label><input type="text" id="issueStart" aria-label="起始时间" placeholder="分:秒" value="${formatTimeCode(at)}"><small>已带入当前播放位置</small></div><div class="field"><label for="issueEnd">结束时间（选填）</label><input type="text" id="issueEnd" aria-label="结束时间" placeholder="分:秒"><small>素材时长 ${formatTimeCode(o.duration)}</small></div></div><div class="field"><label for="issueDetail">补充说明（选填）</label><textarea id="issueDetail" maxlength="200" rows="3" placeholder="描述需要处理的问题"></textarea></div><p class="helper" id="issueCategoryHint">质量问题按修复流程处理。</p>`;
}
export function feedbackItems(b,o,locked,{esc,button,tag}){
 const quality=(o.issues||[]).map((item,index)=>({item,index,quality:true}));
 const creative=currentPreferences(o).map(item=>({item,quality:false}));
 return [...quality,...creative].map(({item,index,quality})=>{
  const definition=ISSUE_TYPES.find(t=>t.id===item.type),whole=item.scope==='all'||item.type==='continuity';
  const attrs=`data-batch="${esc(b.id)}" data-id="${esc(o.id)}" ${locked?'disabled':''}`;
  const action=quality?button(whole?'整条修复':'局部修复',whole?'rework':'repair','secondary',`${attrs} data-index="${index}" data-kind="quality"`):button('调整这一条','rework','secondary',`${attrs} data-kind="creative" data-direction="${definition?.direction||'angle'}" data-reason="${definition?.reason||'angle'}" data-preference="${esc(item.id)}"`);
  return `<div class="issue ${quality?'':'creative-feedback'}"><div><div class="issue-heading"><b>${esc(item.label)}</b>${tag(quality?'质量问题':'创作调整',quality?'orange':'')}</div><small>${issueRangeLabel(item)}</small>${item.detail?`<p>${esc(item.detail)}</p>`:''}</div>${button('定位','quality-locate','text-btn',`data-at="${item.at}"`)}${action}</div>`;
 }).join('');
}
