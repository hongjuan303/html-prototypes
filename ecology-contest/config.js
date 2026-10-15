// Demo 配置与展示规则；真实赛事资料、商务二维码由业务提供。
export const STUDIO_URL = 'https://aidrama.hzrlhy.com/tools/create';
export const stageNames = ['作品提交', '主办单位审核', '结果公示'];
export const publicStatus = w => ['待初审','待复审'].includes(w.status) ? '审核中' : w.status;
export const addDays = (date, days) => new Date(Date.parse(date+'T00:00:00Z')+days*86400000).toISOString().slice(0,10);
export const deadline = e => e.tracks.map(t=>t.end).sort().at(-1);
export const firstDay = e => e.tracks.map(t=>t.start).sort()[0];
// 展示名称与原有类型键分离，保留已有草稿、投稿及自定义赛道名称。
export const trackTypeLabel = name => ({'剧本':'剧本赛道','AI漫剧样片':'漫剧样片赛道','AI漫剧成片':'漫剧成片赛道'})[name] || name;
export const trackLabel = t => trackTypeLabel(t.title || t.name);
export const trackHistoryLabel = text => text.replace(/^获得 (剧本|AI漫剧样片|AI漫剧成片) 赛道晋级资格$/, (_,name) => '获得 '+trackTypeLabel(name)+' 晋级资格');
export const publicEvents = s => s.events.filter(e=>!['草稿','已取消'].includes(e.status));
export const projectOwner = p => p.user || 'me';
export function trackDefaults(t) {
  return {...t,title:trackLabel(t),requirements:t.requirements||(t.name==='剧本'?'提交原创剧本正文，可附故事大纲与人物介绍。支持 Word、PDF 等格式。':'提交可完整播放的'+t.name+'视频；可上传文件或选择容量万相平台项目中的已完成作品。支持 MP4 等视频格式。'),
    reviewStart:t.reviewStart||addDays(t.end,1),reviewEnd:t.reviewEnd||addDays(t.end,10),resultStart:t.resultStart||addDays(t.end,11),resultEnd:t.resultEnd||addDays(t.end,17)};
}
export const examplePrizes = tracks => tracks.map((t,i)=>({track:t.name,rank:i===0?'一等奖':'二等奖',count:i===0?1:3,cash:i===0?30000:10000,credits:i===0?20000:10000,goods:i===0?'创作礼盒 × 1':''}));
export function upgrade(s) {
  if(s.version===2)return s;
  const intros={
    yandang:'山海之间，藏着许多尚未被讲述的故事。本次示例赛事以雁荡山的山水意象、村落生活与地方文化为灵感，邀请创作者通过剧本或 AI 漫剧，把风景转化为有角色、有情感的叙事。\n创作可以从一个普通人的相遇出发，也可以让传说与当代生活交织。我们期待作品中的山水不只是背景，而能推动人物选择、形成故事冲突。\n创意示例：一名年轻录音师沿山路收集声音，从一段旧录音里寻找祖辈的故事；一位返乡青年修复老店招牌，意外串起几代人的记忆；雨夜迷路的旅人循着钟声，进入只存在于传说中的村庄。以上仅作灵感示例，不限制题材或风格。',
    city:'每座城市都有自己的节奏，也有被匆忙忽略的人。本次示例创作计划聚焦街巷、职业与日常生活，鼓励创作者用一个具体的人物，讲述城市的温度。\n创意示例：深夜末班车司机遇见一位寻找旧地址的乘客；老桥修缮前，摄影师为附近居民拍下最后一张合影；一名实习生在旧地图上发现家人从未提及的往事。\n本赛事采用关联晋级形式。入选作品可沿所开放的赛道继续创作，赛道入口与时间以本页安排为准。',
    future:'当技术拓展表达边界，故事如何仍然打动人？本次示例赛事邀请创作者探索未来生活、人与技术及想象中的日常，以样片或成片呈现独特的视听语言。\n创意示例：机器人第一次记录一场雨；一个只靠声音导航的城市迎来陌生旅客；能保存梦境的相机拍到了主人的童年。无需使用固定风格，重点是清晰的叙事与完整的创作表达。',
    heritage:'古城不仅属于过去，也属于仍在其中生活的人。本次示例赛事围绕传统技艺、街区记忆与代际关系，征集具有当代表达的文化故事。\n创意示例：手艺人和年轻学徒共同修复一盏旧灯；一封迟到多年的信改变了街坊对老邻居的认识；一场集市让多年未见的朋友重新相遇。\n本赛事已完成评审，可查看公示作品与获奖名单。'};
  s.events=s.events.map(e=>({...e, intro:intros[e.id]||e.intro,tracks:e.tracks.map(trackDefaults),organizer:'容量万相赛事运营组（示例）',supporters:'',benefits:'提供赛事主题创作指南与投稿答疑；不默认赠送积分。',consultQR:'',awardQR:'',resources:[{title:'主题创作指南（示例）',url:'./assets/contest-guide.txt',usage:'本地演示资料，仅用于理解创作方向；不包含真实景区授权素材。'}],prizes:examplePrizes(e.tracks)}));
  const future=s.events.find(e=>e.id==='future');if(future)future.prizes[0].cash=20000;
  const city=s.events.find(e=>e.id==='city');
  if(city){Object.assign(city.tracks[0],{end:'2026-10-08',reviewStart:'2026-10-09',reviewEnd:'2026-10-11',resultStart:'2026-10-12',resultEnd:'2026-10-13'});Object.assign(city.tracks[1],{start:'2026-10-14'});Object.assign(city.tracks[2],{start:'2026-11-28',end:'2026-12-10'});}
  const base=s.events.find(e=>e.id==='yandang');
  const examples=[
    {id:'script-only',title:'山间来信 · 原创剧本征集',subtitle:'用文字，留下山野与人的故事',region:'全国征集',status:'评审中',name:'剧本',start:'2026-09-01',end:'2026-10-10',image:'mountains.png',intro:'本次示例赛事仅征集剧本，不设置样片或成片赛道。以山野生活、返乡经历与人与自然的关系为创作起点，鼓励完整的人物弧光与有温度的叙事。\n创意示例：一位山村邮递员在退休前送出最后一封信，途中遇见了三个等待不同答案的人。'},
    {id:'film-only',title:'光影来处 · 漫剧成片征集',subtitle:'一个完整故事，一次全新的表达',region:'全国征集',status:'征集中',name:'AI漫剧成片',start:'2026-10-01',end:'2026-11-20',image:'city.png',intro:'本次示例赛事仅征集 AI 漫剧成片。以城市中的相遇与告别为主题，期待结构完整、人物鲜明的故事。\n创意示例：一间即将关闭的照相馆，迎来了过去十年里拍过照片的客人。每张照片背后，都有一次重新选择的机会。'},
    {id:'sample-only',title:'灵感先行 · 漫剧样片计划',subtitle:'让一个精彩片段，打开故事的可能',region:'全国征集',status:'即将开始',name:'AI漫剧样片',start:'2026-11-01',end:'2026-11-30',image:'studio.jpg',intro:'本次示例赛事只征集 AI 漫剧样片。你可以通过一个关键片段，展示人物设计、叙事风格及视听表达，不需要为参赛另行提交成片。\n创意示例：从一次有悬念的相遇、一个角色的关键抉择或一段充满张力的对白入手，让观众期待故事继续。'}];
  for(const x of examples)if(!s.events.some(e=>e.id===x.id)){const t=trackDefaults({name:x.name,start:x.start,end:x.end,brief:'围绕赛事主题完成原创作品。'});s.events.push({...base,...x,host:'主题创作合作项目组（示例）',mode:'独立赛道',tracks:[t],prizes:examplePrizes([t]),resultsPublished:false,date:x.start.replaceAll('-','.')+' — '+x.end.replaceAll('-','.')});}
  const rejected=s.works.find(w=>w.id==='w7');if(rejected){rejected.event='heritage';rejected.reason='本次评选未入选，感谢你的参与。';rejected.history=[{at:'2026-09-12 10:30',text:'提交作品'},{at:'2026-09-25 15:30',text:'评选结果：未通过'}];}
  const pending=s.works.find(w=>w.id==='w1');if(pending)pending.event='script-only';
  if(!s.works.some(w=>w.id==='w8')&&pending)s.works.push({...pending,id:'w8',title:'山路的另一端',status:'待复审',files:[],project:'',history:[{at:'2026-10-08 10:00',text:'提交作品'},{at:'2026-10-13 11:30',text:'初审通过'}]});
  s.projects=s.projects.map(p=>({...p,user:p.user||'me',image:p.image||'mountains.png',outputs:p.outputs||(p.ready?[{id:p.id+'-video',title:p.title+' · 导出视频',duration:'02:18'}]:[])}));
  for(const p of [{id:'p-history',title:'城市里的第七封信',track:'AI漫剧成片',ready:true,created:'2026-09-10 15:20',image:'city.png'},{id:'p-progress',title:'风穿过旧街',track:'AI漫剧样片',ready:false,created:'2026-10-14 09:30',image:'city.png'},{id:'p-sample',title:'雨后 · 故事片段',track:'AI漫剧样片',ready:true,created:'2026-08-20 18:00',image:'studio.jpg'}])if(!s.projects.some(x=>x.id===p.id))s.projects.push({...p,user:'me',event:'',outputs:p.ready?[{id:p.id+'-video',title:p.title+' · 导出视频',duration:'01:36'}]:[]});
  s.version=2;return s;
}
export function validateEvent(e) {
  if(!e.title?.trim()||!e.host?.trim()||!e.intro?.trim())throw Error('请填写赛事名称、主办单位和赛事介绍');
  if(!e.tracks.length)throw Error('至少开放一个赛道');
  if(e.mode==='逐级晋级'&&e.tracks.length<2)throw Error('逐级晋级至少需要两个赛道；单赛道请选择独立赛道');
  for(const [i,t] of e.tracks.entries()){
    const dates=[t.start,t.end,t.reviewStart,t.reviewEnd,t.resultStart,t.resultEnd];
    if(dates.some(d=>!/^\d{4}-\d{2}-\d{2}$/.test(d||''))||dates.some((d,j)=>j&&d<dates[j-1]))throw Error(trackLabel(t)+'：请按作品提交、主办单位审核、结果公示的顺序设置完整起止日期');
    if(!t.title?.trim()||!t.brief?.trim()||!t.requirements?.trim())throw Error(trackTypeLabel(t.name)+'：请补全赛道名称、创作方向及提交材料');
    if(e.mode==='逐级晋级'&&i>0&&t.start<=e.tracks[i-1].resultEnd)throw Error('后续赛道须在上一赛道结果公示结束后开始');
  }
  if(!e.prizes.length)throw Error('请至少配置一项奖励');
  for(const p of e.prizes)if(!e.tracks.some(t=>t.name===p.track)||!p.rank.trim()||!Number.isInteger(p.count)||p.count<1||!Number.isFinite(p.cash)||p.cash<0||!Number.isInteger(p.credits)||p.credits<0||!(p.cash||p.credits||p.goods.trim()))throw Error('请检查奖项的赛道、名称、正整数名额及奖励内容');
  for(const r of e.resources)if(!r.title.trim()||!r.url.trim()||!r.usage.trim())throw Error('请补全创作资料名称、链接及使用范围');
}
