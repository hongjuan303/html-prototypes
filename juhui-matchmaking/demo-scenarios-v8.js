import {appendMatchingScenarios} from './demo-matching-v8.js?v=20261109-overview-merge';
import {appendDistributionScenarios} from './demo-distribution-v8.js?v=20261109-overview-merge';
export const DEMO_BATCH='20261107-unified-review-v1';
export function ensureDemoScenarios(s){
 if(s.demoDatasetVersion===DEMO_BATCH)return s;
 const before=new Set([...s.projects,...s.distribution].map(p=>p.id));
 appendMatchingScenarios(s);appendDistributionScenarios(s);
 const fixture=new URL('./demo-assets/preview.html',import.meta.url),base=/^https?:$/.test(fixture.protocol)?fixture.href:'https://hongjuan303.github.io/html-prototypes/juhui-matchmaking/demo-assets/preview.html';
 const linkFixtures=value=>{if(!value||typeof value!=='object')return;for(const [k,v]of Object.entries(value)){if(typeof v==='string'&&/^https:\/\/example\.com\//.test(v))value[k]=base+'#'+encodeURIComponent(v.slice('https://example.com/'.length));else if(v&&typeof v==='object')linkFixtures(v);}};
 for(const p of [...s.projects,...s.distribution])if(p.demoScenario&&!before.has(p.id))linkFixtures(p);
 s.demoDatasetVersion=DEMO_BATCH;return s;
}
export function scenarioRows(s,line){
 const groups=new Map();
 for(const p of line==='distribution'?s.distribution:s.projects){const d=p.demoScenario;if(!d)continue;
  if(!groups.has(d.id))groups.set(d.id,{...d,records:[]});groups.get(d.id).records.push(p);
 }
 return [...groups.values()].map(g=>({...g,records:g.records.sort((a,b)=>a.demoScenario.copy-b.demoScenario.copy)}));
}
export function sceneSupplier(p,line,actor){
 if(actor==='platform')return '';
 if(line==='distribution'||actor==='script')return p.supplier||'';
 return p.demoScenario?.makerId||p.selected||p.offers?.[0]?.supplier||'';
}
export function scenarioPanel(s,d,h){
 const {E,button,field}=h,line=d.demoBusiness||s.ui.business,actor=d.demoActor||'platform',rows=scenarioRows(s,line),groups=[...new Set(rows.map(x=>x.group))],chosen=groups.includes(d.demoGroup)?d.demoGroup:'';
 const shown=rows.filter(x=>!chosen||x.group===chosen);
 return `<p class="subtle">每个初始场景提供 2 条独立数据。操作结果仅保存在当前浏览器；可切换身份继续流程，或重置示例后重新体验。</p><div class="scenario-filters">${field('业务','demoBusiness',line,{select:[['matching','撮合业务'],['distribution','代发行业务']],placeholder:false})}${field('流程','demoGroup',chosen,{select:[['','全部流程'],...groups],placeholder:false})}${field('体验身份','demoActor',actor,{select:line==='distribution'?[['platform','平台管理员'],['copyright','版权方']]:[['platform','平台管理员'],['script','剧本方'],['maker','承制方']],placeholder:false})}</div><p class="scenario-count">${shown.length} 个初始场景 · ${shown.reduce((n,x)=>n+x.records.length,0)} 条测试数据${actor==='platform'?' · 进入后可切换具体岗位检验权限':''}</p><div class="scenario-table-wrap"><table class="scenario-table"><thead><tr><th>流程</th><th>初始状态 / 场景</th><th>进入测试记录</th></tr></thead><tbody>${shown.map(g=>`<tr><td>${E(g.group)}</td><td>${E(g.label)}</td><td>${g.records.map(p=>{const available=actor==='platform'||!!sceneSupplier(p,line,actor);return button('样例 '+E(p.demoScenario.copy),'demo-open',p.id,'link',`title="${E(p.name)}" ${available?'':'disabled'} aria-label="${E(g.label+' · 样例 '+p.demoScenario.copy)}"`);}).join('')}</td></tr>`).join('')}</tbody></table></div><p class="subtle">灰色入口表示该场景未关联所选供应商身份。<a href="./demo-assets/test-fixtures.zip" download>下载合成测试附件</a></p>`;
}
