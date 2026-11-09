import {diagrams,footnotes} from './swimlane-data-v11.js?v=20261108-whole';

const E=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const wrap=(value,max=13)=>{const result=[];let s='',size=0;for(const c of String(value??'')){const w=/[\x00-\xff]/.test(c)?.55:1;if(c==='\n'||size+w>max){result.push(s);s=c==='\n'?'':c;size=c==='\n'?0:w;}else{s+=c;size+=w;}}if(s)result.push(s);return result;};
const text=(lines,x,y,size=14,color='#3b506b',weight=400,dy=20)=>`<text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}">${lines.map((v,i)=>`<tspan x="${x}" dy="${i?dy:0}">${E(v)}</tspan>`).join('')}</text>`;
const nodesById=new Map(diagrams.flatMap(d=>d.nodes.map(n=>[n.id,{...n,phase:d.id}])));
const WIDTH=1644,HEIGHT=8050,NODE_W=214;
const lanes=[
 {x:32,w:250,title:'剧本提交方',sub:'外部供应商 / 内部上传人'},
 {x:282,w:250,title:'承制供应商',sub:'选本、制作、修改与物料'},
 {x:532,w:500,title:'平台审核与制片',sub:'内容 / 安审 / 评级 / 总编 / 制片 / 陈真'},
 {x:1032,w:300,title:'平台商务与发行',sub:'剧本商务 / 承制商务 / 排播 / 渠道岗位'},
 {x:1332,w:280,title:'平台系统',sub:'自动流转、匹配、归档与同步'}
];
// Fixed role columns. Y advances in business order; parallel preparation has
// independent starts and no dependency from the safety pass node.
const cx={writer:157,maker:407,review:657,review2:907,business:1182,system:1472};
const positions={
 A1:['writer',230],A2:['system',470],A3:['review',740],A4:['review2',740],A5:['writer',740],A6:['review',1020],A7:['system',1020],A8:['review',1300],A9:['review',1580],A10:['system',1580],A11:['maker',1860],A12:['system',1860],A13:['review',2140],A14:['system',2140],
 B1:['maker',2480],B2:['maker',2740],B3:['review',3000],B4:['maker',3000],B5:['system',3260],B10:['review',3260],B11:['review2',3260],B6:['review2',3520],B7:['maker',3780],B9:['system',3780],B8:['review',4040],B12:['system',4040],
 C1:['writer',4410],C2:['business',4670],C2i:['review',4670],C3:['maker',4930],C4:['review2',5190],C5:['business',4410],C6:['business',4930],C7:['system',4410],C8:['system',5540],C9:['business',5800],C10:['system',6060],C11:['business',6320],C12:['business',6580],C13:['business',6840],C14:['maker',7100],C15:['review',7360],C16:['system',7100],C17:['business',7620]
};
const roles={
 A1:'剧本供应商 / 内部上传人',A2:'平台系统',A3:'内容审核人员',A4:'剧本安审人员',A5:'剧本供应商 / 内部上传人',A6:'内容审核人员',A7:'平台系统',A8:'总编 / 项目负责人 / 评级岗',A9:'项目制片',A10:'平台系统',A11:'承制供应商',A12:'平台系统',A13:'项目制片',A14:'平台系统',
 B1:'承制供应商',B2:'承制供应商',B3:'项目制片',B4:'承制供应商',B5:'平台系统',B6:'正片安审人员',B7:'承制供应商',B8:'项目制片',B9:'平台系统',B10:'项目制片 · 可独立终止',B11:'陈真 · 可独立终止',B12:'平台系统',
 C1:'剧本供应商 / 内部上传人',C2:'对应剧本商务',C2i:'对应总编',C3:'当前承制供应商',C4:'项目制片',C5:'对应剧本商务',C6:'对应承制商务',C7:'平台系统',C8:'平台系统',C9:'平台排播上线负责人',C10:'平台系统',C11:'本业务 / 本渠道负责人',C12:'本渠道运营',C13:'本渠道运营',C14:'承制供应商 / 项目制片',C15:'项目制片',C16:'平台系统',C17:'渠道运营查看 / 系统同步'
};
const descriptions={
 A1:'外部一卡＋全集必填；Word',A2:'同一版全集，双审同时开始',A3:'通过 / 驳回修改 / 终止',A4:'通过 / 驳回；无终止权限',A5:'保留版本、意见和批注附件',A6:'剧本已终止，不进入撮合',A7:'两项通过才入库，待评级',A8:'S/A/B、题材、制片同次配置',A9:'S/A人工推送；B可人工补推',A10:'同时推给所有匹配承制方',A11:'先看一卡，选中后才开放全集',A12:'仅S/A，24小时未反馈',A13:'重新挑选承制方，不自动轮转',A14:'选中即开发中，其他接收方置灰',
 B1:'从已通过的剧本全集开始',B2:'资产 / 一卡demo / 全集初稿',B3:'三项分别审核，分别退回',B4:'只改退回项，其他结果保留',B5:'制片通过的全集就是终版',B6:'通过 / 驳回；无终止权限',B7:'按安审意见修改，再交制片',B8:'通过后更新终版，再送安审',B9:'加入发行条件，非直接排期',B10:'制作审核阶段，直接生效',B11:'制作阶段，无需共同签批',B12:'保留剧本、评级、制片与旧档案',
 C1:'可随时上传；文件格式不限',C2:'仅外部本，确认或驳回修改',C2i:'仅内部本，确认或驳回修改',C3:'选中建立归属后即可上传',C4:'通过 / 驳回；无终止权限',C5:'仅外部本，上传留档不审核',C6:'所有项目，上传留档不审核',C7:'三项制作＋本版正片安审通过',C8:'①②④⑤齐备；外部还需③',C9:'计划上线时间＋发行渠道',C10:'各渠道分别形成发行任务',C11:'确认或分配本渠道运营',C12:'各端口自行准备所需材料',C13:'登记反馈、实际时间和链接',C14:'依据渠道意见修改正片',C15:'确认修改后回运营重新送审',C16:'实际已上线；不按计划日推断',C17:'按业务、渠道权限同步与查询'
};

// Paired, visible connectors replace only long returns or multi-input
// prerequisites. They carry exact destination IDs in the exported SVG, too.
const links=[
 {id:'R1',from:['A3','A4'],to:['A5'],label:'驳回修改'},
 {id:'R2',from:['A5'],to:['A2'],label:'新全集重提，双审重开'},
 {id:'R3',from:['A3'],to:['A6'],label:'终止剧本'},
 {id:'R4',from:['A9'],to:['A12'],label:'S/A推送24h未反馈'},
 {id:'R5',from:['A12'],to:['A13'],label:'收回后人工重配'},
 {id:'R6',from:['A13'],to:['A11'],label:'重新推送一卡'},
 {id:'R7',from:['B3'],to:['B4'],label:'制作项驳回'},
 {id:'R8',from:['B4'],to:['B3'],label:'修改项重新审核'},
 {id:'R9',from:['B1'],to:['B11'],label:'制作阶段可由陈真终止'},
 {id:'R10',from:['B10','B11'],to:['B12'],label:'任一人独立终止即回库'},
 {id:'R11',from:['B8'],to:['B6'],label:'制片复审通过，再安审'},
 {id:'R12',from:['B8'],to:['B7'],label:'制片复审仍需修改'},
 {id:'R13',from:['B12'],to:['A9'],label:'回库待匹配承制方'},
 {id:'R14',from:['C2','C2i'],to:['C1'],label:'剧本物料退回补充'},
 {id:'R15',from:['C4'],to:['C3'],label:'制作物料退回补充'},
 {id:'R16',from:['C13'],to:['C12'],label:'渠道资料退回'},
 {id:'R17',from:['C15'],to:['C13'],label:'内容修改确认后重送'},
 {id:'P0',from:['B9'],to:['C7'],label:'正片安审通过结果'},
 {id:'P1',from:['C2','C2i'],to:['C8'],label:'条件①：按剧本来源择一'},
 {id:'P2',from:['C4'],to:['C8'],label:'条件②：制作物料通过'},
 {id:'P3',from:['C5'],to:['C8'],label:'条件③：仅外部本剧本合同'},
 {id:'P4',from:['C6'],to:['C8'],label:'条件④：制作合同留档'},
 {id:'P5',from:['C7'],to:['C8'],label:'条件⑤：制作与正片安审通过'}
];
const references=id=>links.flatMap(link=>[...(link.from.includes(id)?[{...link,direction:'out',peer:link.to}]:[]),...(link.to.includes(id)?[{...link,direction:'in',peer:link.from}]:[])]);
const shortConditions={R1:'驳回',R2:'重提',R3:'终止',R4:'超时',R5:'收回',R6:'重推',R7:'驳回',R8:'重提',R9:'终止',R10:'终止',R11:'通过',R12:'驳回',R13:'回库',R14:'驳回',R15:'驳回',R16:'资料',R17:'重送',P0:'结果',P1:'①',P2:'②',P3:'③',P4:'④',P5:'⑤'};
const nodes=[...nodesById.values()].map(n=>{const [column,y]=positions[n.id],refs=references(n.id),h=132+Math.ceil(refs.length/2)*26;return {...n,x:cx[column]-NODE_W/2,y,w:NODE_W,h,cx:cx[column],refs};});
const nodeMap=new Map(nodes.map(n=>[n.id,n]));
const normals=[];
const add=(from,to,label='',kind='normal')=>normals.push({from,to,label,kind});
add('A1','A2','提交全集');add('A2','A3','并行内容审');add('A2','A4','并行安全审');add('A3','A7','通过');add('A4','A7','通过');add('A7','A8','双审均通过，入库');add('A8','A9','人工：S/A；B可补推');add('A8','A10','B级自动');add('A9','A11','推送一卡');add('A10','A11','推送一卡');add('A11','A13','本方未选中','return');add('A11','A14','确认选中');add('A14','B1','立即进入开发中');
add('B1','B2','开始交付');add('B2','B3','可同时或分别提交');add('B3','B5','三项全部通过');add('B3','B10','决定终止','return');add('B5','B6','全集终版');add('B6','B7','驳回修改','return');add('B6','B9','审核通过');add('B7','B8','修改后先交制片');
add('C1','C2','外部本');add('C1','C2i','内部本');add('C3','C4','提交核验');add('C8','C9','全部适用条件齐备');add('C9','C10','保存计划时间与渠道');add('C10','C11','分配渠道任务');add('C11','C12','指定运营');add('C12','C13','材料齐备');add('C13','C14','内容退回','return');add('C13','C16','实际已上线');add('C14','C15','提交内容修改');add('C16','C17','后续数据');

let paths='',labels='';const pathRecords=[];
const pointsD=ps=>ps.map((p,i)=>(i?'L':'M')+p[0]+' '+p[1]).join(' ');
function drawPath(points,arrow=true,kind='normal',meta={}){const color=kind==='return'?'#b76636':'#416b9e';paths+=`<path class="whole-edge" d="${pointsD(points)}" fill="none" stroke="${color}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" ${kind==='return'?'stroke-dasharray="7 5"':''} ${arrow?`marker-end="url(#whole-${kind==='return'?'return':'arrow'})"`:''} data-from="${meta.from||''}" data-to="${meta.to||''}"/>`;pathRecords.push({points,arrow,kind,...meta});}
function chip(value,x,y,color='#42658a'){if(!value)return;const lines=wrap(value,13),w=Math.max(...lines.map(l=>[...l].reduce((s,c)=>s+(/[\x00-\xff]/.test(c)?7:13),0)))+16,h=lines.length*18+8;labels+=`<g class="whole-edge-label"><rect x="${x-w/2}" y="${y-h/2}" width="${w}" height="${h}" rx="4" fill="white" stroke="#dbe4ef"/>${text(lines,x-w/2+8,y-h/2+18,13,color,500,18)}</g>`;}
function junction(x,y){paths+=`<circle cx="${x}" cy="${y}" r="4.5" fill="#416b9e" stroke="white" stroke-width="1.5"/>`;}
const groups=[
 {from:['A2'],to:['A3','A4'],label:'双审并行',y:660},
 {from:['A3','A4'],to:['A7'],label:'同版两项均通过',y:966},
 {from:['A8'],to:['A9','A10'],label:'按评级匹配',y:1518},
 {from:['A9','A10'],to:['A11'],label:'收到任一有效推送即可选本',y:1806},
 {from:['A11'],to:['A13','A14'],label:'按选本结果分流',y:2078},
 {from:['B3'],to:['B10','B5'],label:'制作审核结论',y:3216},
 {from:['B6'],to:['B7','B9'],label:'正片安审结论',y:3730},
 {from:['C1'],to:['C2i','C2'],label:'按来源择一',y:4620},
 {from:['C13'],to:['C14','C16'],label:'按渠道结果处理',y:7050}
];
const grouped=new Set();
for(const group of groups){const from=group.from.map(id=>nodeMap.get(id)),to=group.to.map(id=>nodeMap.get(id)),all=[...from,...to],xs=all.map(n=>n.cx),lo=Math.min(...xs),hi=Math.max(...xs),y=group.y-(group.from[0]==='A2'?10:30);
 drawPath([[lo,y],[hi,y]],false,'normal',{junction:true});
 for(const a of from){drawPath([[a.cx,a.y+a.h],[a.cx,y]],false,'normal',{from:a.id,junction:true});junction(a.cx,y);}
 for(const b of to){const edge=normals.find(e=>group.from.includes(e.from)&&e.to===b.id),kind=edge?.kind||'normal';drawPath([[b.cx,y],[b.cx,b.y]],true,kind,{to:b.id,junction:true});junction(b.cx,y);if(to.length>1)chip(edge?.label,b.cx,b.y-46,kind==='return'?'#a96035':'#42658a');}
 chip(group.label,group.from[0]==='C1'?lo:(lo+hi)/2,y+19);
 for(const a of from)for(const b of to)grouped.add(a.id+'>'+b.id);
}
for(const edge of normals){if(grouped.has(edge.from+'>'+edge.to))continue;const a=nodeMap.get(edge.from),b=nodeMap.get(edge.to),y=edge.from==='A14'?2450:(a.y+a.h+b.y)/2;
 if(b.y<=a.y)throw Error('Normal paths must advance downwards: '+edge.from+'>'+edge.to);
 drawPath([[a.cx,a.y+a.h],[a.cx,y],[b.cx,y],[b.cx,b.y]],true,edge.kind,edge);
 chip(edge.label,a.cx===b.cx?a.cx:(a.cx+b.cx)/2,edge.from==='A14'?2470:y,edge.kind==='return'?'#a96035':'#42658a');
}

const phaseBands=[
 {y:150,title:'01  剧本提交、并行审核与承制匹配',sub:'一卡用于选本，不做一卡评估；选中后开放全集并进入开发中。'},
 {y:2375,title:'02  制作交付、制片审核与正片安全审核',sub:'三项交付分别处理、全通过才送安审；退回的新全集先经制片复审。'},
 {y:4300,title:'03  发行准备、平台排期与各渠道上线',sub:'物料、合同可提前并行准备；①按来源择一，②④⑤必需，③仅外部本适用。'}
];
const laneBG=lanes.map((l,i)=>`<rect x="${l.x}" y="90" width="${l.w}" height="${HEIGHT-170}" fill="${i%2?'#f6f9fc':'#fff'}" stroke="#e0e7f0"/>${text([l.title],l.x+17,113,17,'#304967',600)}${text(wrap(l.sub,l.w/15),l.x+17,138,12,'#6b7c92',400,17)}`).join('');
const bands=phaseBands.map(p=>`<g class="phase-band"><rect x="32" y="${p.y}" width="1580" height="58" fill="#eaf0f8" stroke="#d9e3ef"/>${text([p.title],49,p.y+24,18,'#284667',600)}${text([p.sub],49,p.y+46,13,'#516b89')}</g>`).join('');
const palette={task:['#fff','#91a4c0'],auto:['#ecf7fa','#6296a9'],return:['#fff7ee','#bd845d'],terminal:['#fff1ef','#bd716a']};
const boxes=nodes.map(n=>{const [fill,stroke]=palette[n.kind]||palette.task,titles=wrap(n.title,11.5),roleLines=wrap(roles[n.id],15),detailLines=wrap(descriptions[n.id],16),titleY=n.y+40,roleY=titleY+titles.length*21+3,detailY=roleY+roleLines.length*17+5;
 const refs=n.refs.map((ref,i)=>{const col=i%2,row=Math.floor(i/2),x=n.x+9+col*100,y=n.y+130+row*26,isReturn=ref.id[0]==='R',color=isReturn?'#a65d32':'#277b7d',peer=ref.peer.join('/'),label=ref.id+(ref.direction==='out'?shortConditions[ref.id]+'→':' ← ')+peer;return `<g class="whole-link" data-link="${ref.id}" data-link-direction="${ref.direction}" data-link-peer="${ref.peer.join(',')}" data-link-node="${n.id}" role="button" tabindex="0" aria-label="${E(ref.id+' '+ref.label+'；'+(ref.direction==='out'?'到':'来自')+peer)}"><title>${E(ref.id+'｜'+ref.label+'｜'+(ref.direction==='out'?'前往':'来自')+peer)}</title><rect x="${x}" y="${y}" width="96" height="21" rx="4" fill="${isReturn?'#fff2e5':'#e6f4f3'}" stroke="${isReturn?'#dfbb9b':'#a0cccc'}"/>${text([label],x+5,y+15,10.8,color,600,16)}</g>`;}).join('');
 return `<g class="whole-node" id="whole-node-${n.id}" data-node="${n.id}" role="button" tabindex="0" aria-label="${E(n.id+' '+n.title+'；操作角色：'+roles[n.id])}"><title>${E(n.id+'｜'+n.title+'｜'+n.role+'｜'+n.operation)}</title><rect class="whole-node-box" x="${n.x}" y="${n.y}" width="${n.w}" height="${n.h}" rx="7" fill="${fill}" stroke="${stroke}" stroke-width="1.7"/>${text([n.id],n.x+13,n.y+20,11,'#627c9c',600)}${text(titles,n.x+13,titleY,17,n.kind==='terminal'?'#a14f46':'#263e5d',600,21)}${text(roleLines,n.x+13,roleY,13,'#4c6481',500,17)}${text(detailLines,n.x+13,detailY,11.5,'#6d7d91',400,16)}${refs}</g>`;
}).join('');
const keyBlock=`<rect x="32" y="7865" width="1580" height="134" rx="6" fill="#f5f8fc" stroke="#dce5ef"/>${text(['读图说明'],50,7891,16,'#35516f',600)}${text(['蓝线沿主流程向下；橙色虚线表示退回或终止分支。R编号连接修改、终止、重新分配等分支，标出条件与目标；同号入口写明来源。','P编号是发行条件连接：P1对应①剧本物料（内外择一），P2对应②制作物料，P3对应③外部剧本合同，P4对应④制作合同，P5对应⑤制作与正片安审结果。','所有节点均标出具体操作角色；责任泳道为归类，不增加审批岗位。剧本物料、制作物料和合同准备不必等待正片安审通过。','安全审核无终止权限；终止承制合作返回待匹配，终止剧本则结束。各渠道实际上线分别记录，整剧上线汇总口径另行确认。'],50,7917,13,'#526c88',400,23)}`;

const svg=`<svg xmlns="http://www.w3.org/2000/svg" id="integrated-swimlane" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" role="group" aria-labelledby="whole-title" style="font-family:-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif"><title id="whole-title">剧汇撮合业务全流程泳道总图：44个业务节点，含具体操作角色与全部分支路径</title><defs><marker id="whole-arrow" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0L9 4.5L0 9Z" fill="#416b9e"/></marker><marker id="whole-return" markerWidth="9" markerHeight="9" refX="8" refY="4.5" orient="auto"><path d="M0 0L9 4.5L0 9Z" fill="#b76636"/></marker></defs><style>.whole-node,.whole-link{cursor:pointer}.whole-node:focus{outline:none}.whole-node:focus>.whole-node-box,.whole-node:hover>.whole-node-box{stroke:#3268f7;stroke-width:2.6}.whole-link:focus{outline:none}.whole-link:focus>rect,.whole-link:hover>rect{stroke:#3268f7;stroke-width:2}.whole-node.is-highlighted>.whole-node-box{stroke:#f28c18;stroke-width:4}</style><rect width="${WIDTH}" height="${HEIGHT}" fill="white"/>${text(['剧汇撮合业务 · 全流程泳道总图'],32,36,24,'#263e5d',650)}${text(['从上到下阅读主流程；每个节点写明角色。R为修改、终止与重新分配等分支连接，P为发行条件连接；节点编号与分段详图一致。'],32,65,14,'#58708f')}${laneBG}${bands}${paths}${boxes}${labels}${keyBlock}</svg>`;
document.getElementById('whole-diagram').innerHTML=svg;
window.wholeFlowAudit={width:WIDTH,height:HEIGHT,nodes,normalEdges:normals,referenceLinks:links,pathRecords,originalEdges:diagrams.flatMap(d=>d.edges),footnotes};
window.dispatchEvent(new CustomEvent('flow-ready'));
