import {currentPreferences,issueRangeLabel} from './feedback-model.js?v=20261008-interaction1';
import {modeLabel} from './engine.js?v=20261008-interaction1';
import {reviewable} from './workflow-model.js?v=20261008-interaction1';

export function outputStatus(o){
 if(o.reworkPending)return ['重新制作中','orange'];
 if(o.repairing)return ['修复中','orange'];
 if(o.status==='pending')return [o.quality?.status==='repairing'?'自动修复中':o.quality?.status==='checking'?'自动检查中':'制作中','orange'];
 if(o.status==='failed')return [o.quality?.status==='failed'?'检查未通过':'制作失败','red'];
 if(o.status==='issue')return ['需处理','orange'];
 return o.confirmed&&o.confirmedVersion===o.contentVersion?['已确认','green']:['待检查',''];
}

export function outputTable(rows,{h,syncUI,selected=new Set(),selectable=false}){
 const {button,esc,tag,fmt}=h;
 const canSelect=o=>o.status==='ready'&&reviewable(o)&&!o.narrationDraft;
 const eligible=rows.filter(({b,o})=>canSelect(o)&&!syncUI.locked(b,o));
 const head=selectable?`<th class="select-col"><input type="checkbox" aria-label="全选已生成素材" data-action="select-all" ${eligible.length?'':'disabled'} ${eligible.length&&eligible.every(({o})=>selected.has(o.id))?'checked':''}></th>`:'';
 return `<div class="table-wrap output-table"><table><thead><tr>${head}<th>素材</th><th>时长</th><th>素材同步</th><th>操作</th></tr></thead><tbody>${rows.map(({b,o})=>{
  const [label,color]=outputStatus(o),attrs=`data-batch="${esc(b.id)}" data-id="${esc(o.id)}"`;
  const checkable=reviewable(o);
  return `<tr>${selectable?`<td><input type="checkbox" aria-label="选择素材 ${esc(o.title)}" data-output="${esc(o.id)}" ${selected.has(o.id)?'checked':''} ${canSelect(o)&&!syncUI.locked(b,o)?'':'disabled'}></td>`:''}<td class="output-name"><div class="output-identity"><button class="output-thumb" data-action="review-item" ${attrs} aria-label="快速预览 ${esc(o.title)}" ${checkable?'':'disabled'}><img src="./assets/drama-confrontation.jpg" alt="故事板封面"><span>▶</span></button><div>${button(esc(o.title),'review-item','output-title',attrs+(checkable?'':' disabled'))}<p>${modeLabel(b.config)} · ${new Date(b.created).toLocaleString('zh-CN',{month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})}</p><details class="output-meta"><summary>详细信息</summary><p>任务 ${esc(b.id)}<br>素材 ${esc(o.id)} · V${o.contentVersion}<br>取材第 ${esc(o.episodes.join('、'))} 集</p></details>${o.status==='failed'||o.status==='pending'||o.status==='issue'||o.repairing||o.reworkPending?`<small class="output-alert ${o.status==='failed'?'danger':''}">${esc(o.status==='issue'?o.issues.length+' 项质量问题待处理':label)}</small>`:currentPreferences(o).length?'<small class="output-alert">有创作调整建议</small>':''}</div></div></td><td class="mono">${fmt(o.duration)}</td><td>${syncUI.badgeFor(b,o)}</td><td><div class="result-actions">${o.status==='failed'?button('补生成','retry-output','text-btn',attrs):button('单条返工','rework','text-btn',attrs+(checkable&&!syncUI.locked(b,o)?'':' disabled'))}${syncUI.rowAction(b,o).replace('data-id=',`data-batch="${esc(b.id)}" data-id=`)}</div></td></tr>`;
 }).join('')||`<tr><td colspan="${selectable?5:4}" class="task-empty-row">暂无符合条件的成片</td></tr>`}</tbody></table></div>`;
}

export function qualitySummary(o,{tag,button,esc,fmt}){
 const q=o.quality;
 if(o.reworkPending)return '<div class="qc-status"><strong>正在重新制作这一条</strong><span>当前展示原版本，新版本完成后重新检查。</span></div>';
 if(!q)return '';
 return `<div class="qc-status"><div><strong>${q.status==='attention'?'有待人工核对的位置':'自动检查完成'}</strong><span>${q.repaired?(q.repairType==='music'?'已自动处理 1 项音频问题':'已完成问题修复'):'画面、声音及字幕基础检查'}</span></div>${tag(q.status==='attention'?'需核对':o.confirmed&&o.confirmedVersion===o.contentVersion?'已人工确认':'待人工确认',q.status==='attention'?'orange':'')}<details><summary>检查记录</summary><p>画面连续性 · 声音与句子边界 · 字幕与包装</p>${q.repairType==='music'?'<p>已降低伴奏音量，并重新检查。</p>':''}${o.issues.map(i=>`<p>${esc(i.label)} · ${issueRangeLabel(i)} ${button('定位','quality-locate','text-btn',`data-at="${i.at}"`)}</p>`).join('')}<p class="helper">当前为流程演示，未检测真实视频；剧情连贯与图文对应仍需人工检查。</p></details></div>`;
}

export function costBreakdown(c,{esc}){
 return `<div class="cost-breakdown"><span>本次预计消耗${c.quoted>c.analysis+c.production?'（授权上限）':''}</span><strong>${c.quoted} 积分</strong><span>实际扣除</span><strong>${c.net} 积分</strong><span class="cost-indent">剧情分析</span><span>${c.analysis} 积分</span><span class="cost-indent">已结算制作</span><span>${c.production} 积分</span><span>处理中冻结</span><strong>${c.frozen} 积分</strong><span>失败 / 取消释放</span><strong>${c.released} 积分</strong><span>已扣费用退回</span><strong>${c.refunded} 积分</strong></div><p class="helper">冻结是暂占额度；释放回到可用余额，不属于已扣费用的退款。</p><details class="cost-average"><summary>每条可用素材的平均消费</summary><p>${c.accepted?`${c.net} 积分 ÷ ${c.accepted} 条已确认 = ${esc(c.perAccepted)} 积分/条`:'暂无已确认素材，暂不计算平均消费。'}</p><p class="helper">按当前版本已确认数量计算，包含本任务分摊的分析费和重做费用，不是单条制作售价。</p></details>`;
}
