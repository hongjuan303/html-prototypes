/* All titles, account IDs, attachments and states are fictional prototype data. */
window.KSData = (() => {
  const names=['长街有月','春风知我意','逆光而来的你','山河入梦','第七次心动','重生后我在城里开书店','月落时与你相逢','误入星河'];
  const colors=[['#293e50','#d8b88c'],['#647e74','#e8dcbd'],['#41536e','#d2b196'],['#484654','#ddbc85'],['#8b6768','#f1d6bb'],['#536854','#d7c297'],['#3a5367','#a8c7cf'],['#5c5576','#c9c1e0']];
  const plots=[
    '灯火渐起的长街上，修复师林知月回到阔别多年的故乡，接手一家即将关门的旧书店。一次偶然的书信发现，让她与经营茶馆的沈砚再次相遇。两人一边寻找信件的主人，一边帮助街坊守护老街的记忆，在一次次误会与和解中，慢慢看清各自真正珍惜的东西。面对新的生活选择，他们终于放下过去的遗憾，携手为老街留下一盏灯，也为彼此找到能够安心停靠的地方。',
    '年轻设计师许清和离开城市，回到家乡筹备自己的第一场作品展。她与多年未见的好友重新相遇，在修缮老屋、寻找灵感的过程中，逐渐解开成长岁月里的误会。面对工作受挫和家庭期待，她没有放弃自己的热爱，而是用一次次实际行动赢得理解。最终，作品展如期举行，她也学会坦诚表达自己的心意，与伙伴一起开启了新的生活。'
  ];
  const counts=[40,36,48,60,24,40,50,30];
  const collections=names.map((name,i)=>({
    id:String(20261001+i),name,title:name,desc:plots[i%2],type:i===2?'1':'2',sourceType:i===2?'真人剧':'AI剧',method:i===2?'':'3',tags:i%2?['甜宠','都市']:['古风','悬疑'],declaration:'',completed:'true',cover:i,coverValid:i!==4,
    copyrightType:i===1?'':'1',copyrightMaterial:i===1?'':'3',proof:i===1?'':name+'-权属声明（演示）.pdf',authorization:'',authStart:'',authEnd:'',subAuth:'',
    filing:'true',filingType:i===1?'':'3',filingNo:i===1?'':'备案号示例-'+String(1001+i),sale:'',price:'',singlePrice:'',unlock:'',smallFree:'',
    productionCost:'',avgMinutes:'',productionForm:'',productionYear:'',producerName:'',productionCompany:'',productionTaxId:'',productionLicensePrefix:'',productionLicenseNumber:'',productionCountry:'',productionProvince:'',productionMonths:'',productionPermit:'',directors:'',directorGender:'',screenwriters:'',screenwriterGender:'',producerGender:'',actors:'',displayPlatform:'',displayChannel:'',displayDate:'',specialTheme:'',
    total:counts[i],updated:'2026-10-'+String(15-i).padStart(2,'0'),episodes:Array.from({length:counts[i]},(_,j)=>({id:`ep-${i+1}-${j+1}`,seq:j+1,title:`第${j+1}集`,cover:i,free:true,price:'',file:`${name}_第${String(j+1).padStart(2,'0')}集.mp4`,duration:96+j%6*9,size:180+j%4*20,ready:!(i===2&&j===11),url:''}))
  }));
  const accounts=[{id:'ks-demo-01',name:'星河短剧',uid:'DEMO 10001',company:'示例经营主体',valid:true},{id:'ks-demo-02',name:'青禾漫剧',uid:'DEMO 10002',company:'示例经营主体',valid:true},{id:'ks-demo-03',name:'拾光剧场',uid:'DEMO 10003',company:'示例经营主体',valid:false}];
  const tags=['脑洞','甜宠','逆袭','热血','复仇','家庭','乡村','古风','年代','穿越','悬疑','武侠','校园','搞笑','都市'];
  const methods={'1':'简笔动画','2':'小说剧','3':'AIGC剧','4':'沙雕动画','5':'3D动画','6':'2D动画'};
  const records=[
    {id:'R-DEMO-01',collectionId:collections[6].id,title:names[6],cover:6,account:'ks-demo-01',total:50,uploaded:50,stage:'complete',audit:'approved',saleState:'online',sale:'3',miniId:'KS-DEMO-001',date:'2026-10-16 09:20',batch:'B-DEMO-01',fail:'',type:'2'},
    {id:'R-DEMO-02',collectionId:'demo-history-02',title:'故园有信',cover:0,account:'ks-demo-01',total:40,uploaded:40,stage:'complete',audit:'pending',saleState:'offline',sale:'3',miniId:'KS-DEMO-002',date:'2026-10-16 10:35',batch:'B-DEMO-02',fail:'',type:'2'},
    {id:'R-DEMO-03',collectionId:'demo-history-03',title:'人间四月',cover:1,account:'ks-demo-02',total:36,uploaded:30,stage:'failed',audit:'unsubmitted',saleState:'offline',sale:'3',miniId:'KS-DEMO-003',date:'2026-10-16 10:42',batch:'B-DEMO-02',fail:'第31～36集视频链接拉取失败',failedSeq:[31,32,33,34,35,36],type:'2'},
    {id:'R-DEMO-04',collectionId:'demo-history-04',title:'南风知归处',cover:2,account:'ks-demo-02',total:32,uploaded:32,stage:'complete',audit:'rejected',saleState:'offline',sale:'0',miniId:'KS-DEMO-004',date:'2026-10-15 16:08',batch:'B-DEMO-03',fail:'短剧封面文字不清晰，请调整后重新提审',type:'1'},
    {id:'R-DEMO-05',collectionId:'demo-history-05',title:'昨日星辰',cover:7,account:'ks-demo-01',total:45,uploaded:45,stage:'complete',audit:'approved',saleState:'offline',sale:'3',miniId:'KS-DEMO-005',date:'2026-10-15 11:50',batch:'B-DEMO-04',fail:'',type:'2'}
  ];
  // Explicit fixture metadata is separate from the independently editable Kuaishou title.
  for(const r of records){
    const source=collections.find(c=>c.id===r.collectionId);
    r.collectionName=source?.name||r.title;r.createdBy='运营同学';r.modifiedBy='';r.modifiedAt='';
    const c=JSON.parse(JSON.stringify(source||collections[r.type==='1'?2:0]));
    Object.assign(c,{id:r.collectionId,name:r.collectionName,title:r.title,cover:r.cover,coverValid:true,type:r.type,total:r.total,declaration:r.type==='1'?'0':'1',sale:r.sale,price:r.sale==='0'?'9.90':'',unlock:r.sale==='3'?'2':'',smallFree:r.sale==='3'?'false':''});
    c.episodes=Array.from({length:r.total},(_,i)=>({...JSON.parse(JSON.stringify(c.episodes[i%c.episodes.length])),id:r.id+'-ep-'+(i+1),seq:i+1,title:'第'+(i+1)+'集',file:r.collectionName+'_第'+(i+1)+'集.mp4',ready:true}));
    r.config=c;
  }
  const future=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(Date.now()+86400000));
  const extras=[
    {id:'R-DEMO-06',title:'旧巷听雨',collectionName:'旧巷听雨·完整版',miniId:'KS-DEMO-006',schedule:{status:'pending',time:future,reason:''}},
    {id:'R-DEMO-07',title:'星光未眠',collectionName:'星光未眠',miniId:'KS-DEMO-007',schedule:{status:'failed',time:'2026-10-18 10:00:00',reason:'预约执行时账号授权失效，授权已恢复，请重新预约'}},
    {id:'R-DEMO-08',title:'此心安处',collectionName:'此心安处',miniId:'KS-DEMO-008',saleState:'offline',platformRestricted:true,disposeReason:'示例：版权资料需进一步核验，请前往平台处理'}
  ];
  for(const extra of extras){const r={...JSON.parse(JSON.stringify(records[4])),...extra,collectionId:'demo-history-'+extra.id.slice(-2)};r.config={...r.config,id:r.collectionId,name:r.collectionName,title:r.title};records.push(r);}
  return {collections,accounts,tags,methods,colors,records};
})();
