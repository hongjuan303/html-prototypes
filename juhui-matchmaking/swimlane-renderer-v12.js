import {diagrams,updated,footnotes} from './swimlane-data-v11.js?v=20261108-routing';
import {layouts} from './swimlane-layout-v12.js?v=20261108-routing';
const E=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const font="-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif";
const colors={task:['#fff','#8b9fbe'],auto:['#eef7fa','#5790a3'],return:['#fff8f2','#b77950'],terminal:['#fff1f0','#ba625c']};
const byId=new Map(diagrams.flatMap(d=>d.nodes.map(n=>[n.id,{...n,diagram:d.id,laneInfo:d.lanes.find(l=>l.id===n.lane)}])));
const rendered=new Map();
const wrap=(value,max=13)=>{const out=[];let line='',w=0;for(const c of String(value??'')){const size=/[\x00-\xff]/.test(c)?.55:1;if(c==='\n'||w+size>max){out.push(line);line=c==='\n'?'':c;w=c==='\n'?0:size;}else{line+=c;w+=size;}}if(line)out.push(line);return out;};
const text=(lines,x,y,size=13,color='#334760',weight=400,dy=19)=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}">${lines.map((v,i)=>`<tspan x="${x}" dy="${i?dy:0}">${E(v)}</tspan>`).join('')}</text>`;
const pathD=points=>points.map((p,i)=>`${i?'L':'M'}${p[0]} ${p[1]}`).join(' ');

// One inter-column corridor per transition. Only declared forks/merges share
// a trunk; repeated nodes express returns without routing across other edges.
function renderSVG(panel,phase,type){
 const compact=panel.compact,left=compact?20:156,column=282,nodeW=190,nodeH=112,top=compact?20:52,row=142;
 const lanes=compact?[]:panel.lanes.map(id=>phase.lanes.find(l=>l.id===id));
 const nodes=panel.steps.flatMap((ids,col)=>ids.map((id,index)=>{
  const original=byId.get(id);if(!original)throw Error('Unknown node '+id);
  const lane=compact?index:lanes.findIndex(l=>l.id===original.lane);if(lane<0)throw Error('Missing lane '+id);
  const gateRef=type==='prerequisite'&&id==='C8';
  return {...original,title:gateRef?'计入排期条件汇总':original.title,lines:gateRef?['全部适用条件齐备才放行','继续 3.1 的 C8 节点']:original.lines,col,index,x:left+col*column+24,y:top+lane*row+16,w:nodeW,h:nodeH};
 }));
 const rows=compact?Math.max(...panel.steps.map(s=>s.length)):lanes.length,width=left+panel.steps.length*column+8,height=top+rows*row+12;
 const color=type==='exception'?'#ac663f':'#466c9e',marker=panel.id+'-arrow';let edges='',labels='',logical=[];
 const line=(points,arrow=false,attrs='')=>`<path ${attrs} d="${pathD(points)}" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" ${type==='exception'?'stroke-dasharray="6 4"':''} ${arrow?`marker-end="url(#${marker})"`:''}/>`;
 const chip=(value,x,y,max=6,above=false)=>{if(!value)return;const lines=wrap(value,max),w=Math.max(...lines.map(l=>[...l].reduce((s,c)=>s+(/[\x00-\xff]/.test(c)?6:12),0)))+12,h=lines.length*16+6;if(above)y-=h/2+12;labels+=`<g class="edge-label"><rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="3" fill="white" stroke="#e2e8f0"/>${text(lines,x-w/2+6,y-h/2+15,12,color,500,16)}</g>`;};
 const dot=(x,y)=>`<circle class="flow-junction" cx="${x}" cy="${y}" r="4" fill="${color}" stroke="white" stroke-width="1.5"/>`;
 for(let col=0;col<panel.steps.length-1;col++){
  const from=nodes.filter(n=>n.col===col),to=nodes.filter(n=>n.col===col+1),mid=(from[0].x+nodeW+to[0].x)/2,cy=n=>n.y+n.h/2;
  if(from.length>1&&to.length>1)throw Error('Many-to-many corridor');
  for(const a of from)for(const b of to)logical.push({from:a.id,to:b.id});
  const attr=`class="flow-edge" data-corridor="${col}"`;
  if(from.length===1&&to.length===1){
   const a=from[0],b=to[0],ay=cy(a),by=cy(b);edges+=line([[a.x+a.w,ay],[mid,ay],[mid,by],[b.x,by]],true,`${attr} data-from="${a.id}" data-to="${b.id}"`);chip(panel.labels?.[col],mid,(ay+by)/2,6,ay===by);
  }else{
   const all=[...from,...to],levels=[...new Set(all.map(cy))].sort((a,b)=>a-b),low=levels[0],high=levels.at(-1);
   edges+=line([[mid,low],[mid,high]],false,`${attr} data-junction="true"`);
   for(const a of from)edges+=line([[a.x+a.w,cy(a)],[mid,cy(a)]],false,attr)+dot(mid,cy(a));
   for(const b of to)edges+=line([[mid,cy(b)],[b.x,cy(b)]],true,attr)+dot(mid,cy(b));
   chip(from.length>1?(compact?panel.branch:panel.merge):panel.branch,mid,(levels[0]+levels[1])/2);
   if(to.length>1)to.forEach((n,i)=>chip(panel.branchLabels?.[i],(mid+n.x)/2,cy(n),5,true));
  }
 }
 const bg=`<rect width="${width}" height="${height}" fill="#fff"/>`;
 const laneMarkup=compact?'':`<rect width="${width}" height="${top}" fill="#f2f5fa"/>${text(['操作角色'],18,33,13,'#536783',600)}${panel.steps.map((_,i)=>text([`步骤 ${i+1}`],left+i*column+24,33,12,'#71829a')).join('')}${lanes.map((l,i)=>`<rect x="0" y="${top+i*row}" width="${width}" height="${row}" fill="${i%2?'#f8fafc':'#fff'}"/><rect x="0" y="${top+i*row}" width="${left}" height="${row}" fill="#eff3f8"/>${text(wrap(l.label,9),18,top+i*row+57,14,'#354f70',600,21)}<path d="M0 ${top+(i+1)*row} H${width}" stroke="#e0e7f0"/>`).join('')}<path d="M${left} ${top} V${height}" stroke="#d9e3ef"/>`;
 const boxes=nodes.map(n=>{
  let shortRole=({A1:'剧本方／内部上传人',A5:'剧本方／内部上传人',C1:'剧本方／内部上传人',C14:'承制供应商／项目制片',C17:'渠道运营／系统同步'})[n.id]||n.laneInfo.label;
  if(n.id==='C1'&&panel.id.includes('external'))shortRole='外部剧本供应商';
  if(n.id==='C1'&&panel.id.includes('internal'))shortRole='内部剧本上传人';
  const [fill,stroke]=colors[n.kind]||colors.task,title=wrap(n.title,11.5),details=compact?wrap('操作：'+shortRole,14):(n.lines||[]).flatMap(l=>wrap(l,14)).slice(0,2);
  return `<g class="swim-node" role="button" tabindex="0" data-diagram="${n.diagram}" data-node="${n.id}" data-occurrence="${panel.id}-${n.col}-${n.index}" aria-label="${E(n.id+' '+n.title+'，'+n.role)}"><title>${E(n.title+'｜'+n.role+'｜'+n.operation)}</title><rect class="node-box" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="1.5"/>${text([n.id],n.x+12,n.y+17,10,'#6f819b',500)}${text(title,n.x+12,n.y+39,14,n.kind==='terminal'?'#9d4845':'#253e5e',600,19)}${text(details,n.x+12,n.y+43+title.length*19,11.5,'#5e7189',400,16)}</g>`;
 }).join('');
 rendered.set(panel.id,{panel,nodes,logical,width,height});
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="group" aria-labelledby="${panel.id}-title" style="font-family:${font}"><title id="${panel.id}-title">${E(panel.title)}。从左向右阅读。</title><defs><marker id="${marker}" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0 L9 4.5 L0 9 Z" fill="${color}"/></marker></defs><style>.swim-node{cursor:pointer}.swim-node:hover .node-box,.swim-node:focus .node-box{stroke:#3268f7;stroke-width:2.5}.swim-node:focus{outline:none}</style>${bg}${laneMarkup}${edges}${boxes}${labels}</svg>`;
}
const handoffs={
 'script-review':{from:'A7',to:'A8',target:'script-match',label:'审核通过入库后，继续 1.2 评级与承制匹配'},
 'script-match':{from:'A14',to:'B1',target:'production-delivery',label:'承制方确认选中，继续 2.1 制作交付'},
 'production-delivery':{from:'B5',to:'B6',target:'production-safety',label:'三项均通过形成终版，继续 2.2 正片安审'},
 'production-safety':{from:'B9',to:'C7',target:'release-result',label:'安审通过结果计入发行条件⑤；物料、合同可提前并行准备'},
 'release-schedule':{from:'C11',to:'C12',target:'release-online',label:'确定本渠道运营后，继续 3.2 渠道送审与上线'}
};
function renderPanel(panel,phase,type){const h=handoffs[panel.id];return `<article class="flow-panel ${type}" id="${panel.id}"><header class="panel-header"><div><h3>${E(panel.title)}</h3>${panel.note?`<p>${E(panel.note)}</p>`:''}</div><button type="button" class="btn" data-download="${panel.id}">下载 SVG</button></header><div class="chart-scroll" tabindex="0" aria-label="${E(panel.title)}；从左到右；可横向滚动">${renderSVG(panel,phase,type)}</div>${h?`<a class="flow-handoff" href="#${h.target}" data-from="${h.from}" data-to="${h.to}"><b>${h.from} → ${h.to}</b>${E(h.label)} <span>继续查看 →</span></a>`:''}</article>`;}
document.getElementById('updated').textContent=updated+' · 连线修订';
document.getElementById('phase-nav').innerHTML=diagrams.map(d=>`<a href="#${d.id}">${E(d.title)}</a>`).join('');
document.getElementById('diagrams').innerHTML=diagrams.map(d=>{
 const layout=layouts[d.id],prep=layout.prerequisites?`<section class="preparation"><h3 class="group-title">并行准备 · 不必等正片安审结束</h3><p class="group-note">①按内部 / 外部来源选择一条；②④⑤每个项目都需要，③仅外部剧本需要。每项结果进入 C8 汇总，单项完成不代表可以排期。</p>${layout.prerequisites.map(p=>renderPanel(p,d,'prerequisite')).join('')}</section>`:'';
 return `<section class="phase" id="${d.id}"><header class="phase-header"><div><h2>${E(d.title)}</h2><p>${E(d.subtitle)}</p></div></header>${prep}<div class="normal-flow">${layout.main.map(p=>renderPanel(p,d,'main')).join('')}</div><section class="exception-flows"><h3 class="group-title">修改、退回与终止路径</h3><p class="group-note">每条路径仍从左向右读。末端重复出现的编号表示回到原节点，不是新增一道审批。</p>${layout.exceptions.map(p=>renderPanel(p,d,'exception')).join('')}</section><div class="phase-notes"><ul>${d.notes.map(n=>`<li>${E(n)}</li>`).join('')}</ul></div></section>`;
}).join('');
document.getElementById('role-table').innerHTML=diagrams.map(d=>`<div class="role-group"><h3>${E(d.title)}</h3><div class="role-table-wrap"><table><thead><tr><th>流程节点</th><th>操作角色</th><th>操作内容</th><th>完成结果</th></tr></thead><tbody>${d.nodes.map(n=>`<tr><td><button class="role-node-link" data-node="${n.id}">${n.id} · ${E(n.title)}</button></td><td>${E(n.role)}</td><td>${E(n.operation)}</td><td>${E(n.output)}</td></tr>`).join('')}</tbody></table></div></div>`).join('');
document.getElementById('flow-footnotes').innerHTML='<h2>流程口径与补充说明</h2><ul>'+footnotes.map(n=>`<li>${E(n)}</li>`).join('')+'</ul>';
function openNode(id){const n=byId.get(id);if(!n)return;document.getElementById('node-phase').textContent=diagrams.find(d=>d.id===n.diagram).title;document.getElementById('node-title').textContent=n.id+' · '+n.title;document.getElementById('node-role').textContent=n.role;document.getElementById('node-operation').textContent=n.operation;document.getElementById('node-output').textContent=n.output;document.getElementById('node-detail').showModal();}
document.getElementById('print-flow').addEventListener('click',()=>window.print());
document.addEventListener('click',event=>{
 const node=event.target.closest('[data-node]');if(node){openNode(node.dataset.node);return;}
 const download=event.target.closest('[data-download]');if(!download)return;
 const entry=rendered.get(download.dataset.download),svg=document.querySelector(`#${CSS.escape(download.dataset.download)} svg`);if(!svg)return;
 const copy=svg.cloneNode(true),lines=wrap(entry.panel.note||'从左向右阅读；重复编号表示返回原节点。',Math.floor(entry.width/14)-4),extra=56+lines.length*20;
 copy.setAttribute('height',entry.height+extra);copy.setAttribute('viewBox',`0 0 ${entry.width} ${entry.height+extra}`);
 const group=document.createElementNS('http://www.w3.org/2000/svg','g');group.setAttribute('transform',`translate(0 ${extra})`);while(copy.firstChild)group.append(copy.firstChild);copy.append(group);
 const label=(s,x,y,size,bold=false)=>{const el=document.createElementNS('http://www.w3.org/2000/svg','text');el.setAttribute('x',x);el.setAttribute('y',y);el.setAttribute('font-size',size);el.setAttribute('fill','#334760');if(bold)el.setAttribute('font-weight','600');el.textContent=s;copy.append(el);};
 label(entry.panel.title,18,26,17,true);lines.forEach((s,i)=>label(s,18,49+i*20,12));
 const url=URL.createObjectURL(new Blob(['<?xml version="1.0" encoding="UTF-8"?>\n',new XMLSerializer().serializeToString(copy)],{type:'image/svg+xml;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download=entry.panel.title+'.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
});
document.addEventListener('keydown',event=>{const node=event.target.closest('g[data-node]');if(node&&['Enter',' '].includes(event.key)){event.preventDefault();openNode(node.dataset.node);}});
document.getElementById('node-detail').addEventListener('click',event=>{if(event.target===event.currentTarget)event.currentTarget.close();});
window.swimlaneAudit={panels:[...rendered.values()].map(({panel,nodes,logical,width,height})=>({id:panel.id,nodes,logical,width,height})),source:diagrams.map(d=>({id:d.id,edges:d.edges})),handoffs};
