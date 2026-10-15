import {upgrade, trackTypeLabel, projectOwner, publicEvents, publicStatus, validateEvent} from './config.js?v=20261015-v5';
export {publicEvents, publicStatus, validateEvent};
export const KEY = 'wanxiang-contest-demo-20261014-v1';
export const TRACKS = ['剧本', 'AI漫剧样片', 'AI漫剧成片'];
export const TODAY = '2026-10-15';
export const USER = { id: 'me', name: '林予安', phone: '13800000000', type: '个人', entity: '林予安', email: 'creator@example.com' };
export function uid(prefix='x') { return prefix + '-' + Date.now().toString(36) + Math.random().toString(36).slice(2,7); }
export function time() { return new Date().toLocaleString('sv-SE').slice(0,16); }
const track = (i, start='2026-10-01', end='2026-11-15') => ({ name: TRACKS[i], start, end, brief: i === 0 ? '围绕赛事主题创作原创剧本，题材与创作形式不限。' : i === 1 ? '以完整的叙事片段呈现故事风格与角色，可使用万相漫剧制作平台。' : '提交叙事完整的原创 AI 漫剧成片，展现故事与视听表达。' });
export function seed() {
  const common = { intro: '以城市与山水为创作起点，用好故事连接文化与想象。面向所有创作者征集原创剧本与 AI 漫剧作品，个人、团队、企业及其他主体均可参加。', rules: '容量进行初审及复审，均采用通过制。通过审核的作品进入主办方线下评议，最终名次经确认后统一公示。', rewardText: '一等奖：现金 30,000 元 + 20,000 积分\n二等奖：现金 10,000 元 + 10,000 积分\n优秀作品：创作礼盒 + 5,000 积分', review: '双审', resultsPublished: false, cancelReason: '' };
  const events = [
    {...common,id:'yandang',title:'山海有回响 · AI漫剧创作大赛',subtitle:'让山水成为故事，让创意被看见',region:'浙江 · 雁荡山',host:'山海文旅合作项目组（示例）',image:'mountains.png',mode:'独立赛道',status:'征集中',tracks:[track(0),track(1),track(2)],date:'2026.10.01 — 2026.11.15',rewardSummary:'最高 30,000 元现金奖励'},
    {...common,id:'city',title:'一城一故事 · 青年创作计划',subtitle:'从一页剧本，到一部属于城市的漫剧',region:'浙江 · 杭州',host:'城市影像合作项目组（示例）',image:'city.png',mode:'逐级晋级',status:'征集中',tracks:[track(0,'2026-10-01','2026-10-20'),track(1,'2026-10-10','2026-11-10'),track(2,'2026-11-11','2026-12-10')],date:'2026.10.01 — 2026.12.10',rewardSummary:'现金 · 创作积分 · 创作礼盒'},
    {...common,id:'future',title:'未来叙事 · AI影像探索季',subtitle:'用新技术，讲述新的可能',region:'全国征集',host:'未来影像联合项目组（示例）',image:'studio.jpg',mode:'独立赛道',status:'即将开始',tracks:[track(1,'2026-11-01','2026-12-15'),track(2,'2026-11-01','2026-12-15')],date:'2026.11.01 — 2026.12.15',rewardSummary:'最高 20,000 元现金奖励',rewardText:'一等奖：现金 20,000 元 + 20,000 积分\n二等奖：现金 10,000 元 + 10,000 积分\n优秀作品：创作礼盒 + 5,000 积分'},
    {...common,id:'heritage',title:'古城新生 · 文化创作大赛',subtitle:'在光影中，遇见城市的另一面',region:'浙江 · 文化专题',host:'古城文旅合作项目组（示例）',image:'city.png',mode:'独立赛道',status:'结果公示',tracks:[track(0,'2026-08-01','2026-09-15'),track(2,'2026-08-01','2026-09-15')],date:'2026.08.01 — 2026.09.15',resultsPublished:true,rewardSummary:'获奖作品已公布'},
  ];
  const make = (id,event,trackName,title,status,user='me',extra={}) => ({id,event,track:trackName,title,summary:'一位年轻创作者沿着山海的线索，寻找遗落在城市中的记忆。以东方美学与轻幻想叙事，呈现人与文化之间的联结。',user,identity:user==='me'?{...USER}:{id:user,name:'陈知夏',phone:'13900000000',type:'团队',entity:'逐光创作团队',email:'studio@example.com'},status,created:'2026-10-12 10:30',updated:'2026-10-12 10:30',version:1,files:[{id:'seed-'+id,name:title+(trackName==='剧本'?'.pdf':'.mp4'),size:trackName==='剧本'?248000:24800000,demo:true}],history:[{at:'2026-10-12 10:30',text:'提交作品 V1'}],advanced:false,public:false,agreed:true,...extra});
  return upgrade({version:1,events,works:[
    make('w1','yandang',TRACKS[0],'听见山海','待初审'),
    make('w2','city',TRACKS[0],'桥下的时间','已通过','me',{advanced:true,history:[{at:'2026-10-10 09:20',text:'提交作品 V1'},{at:'2026-10-12 14:00',text:'复审通过'},{at:'2026-10-13 16:00',text:'获得 漫剧样片赛道 晋级资格'}]}),
    make('w3','yandang',TRACKS[1],'山海之间','待复审','other'),
    make('w4','yandang',TRACKS[2],'雁归时','已通过','other'),
    make('w5','heritage',TRACKS[0],'古城来信','已通过','me',{public:true}),
    make('w6','heritage',TRACKS[2],'长街入梦','已通过','other',{public:true}),
    make('w7','yandang',TRACKS[0],'风从山里来','未通过','me',{reason:'故事梗概与正文主题关联不够清晰，请完善主线后重新提交。',history:[{at:'2026-10-11 11:30',text:'提交作品 V1'},{at:'2026-10-12 15:30',text:'初审未通过：请完善故事主线'}]}),
  ],awards:[{id:'a1',event:'heritage',work:'w5',rank:'一等奖',cash:30000,credits:20000,goods:'创作礼盒 × 1',confirmed:true,proof:'2026-10-10 主办方线下确认，运营已留档',cashDone:false,creditsDone:false,goodsDone:false},{id:'a2',event:'heritage',work:'w6',rank:'二等奖',cash:10000,credits:10000,goods:'',confirmed:true,proof:'2026-10-10 主办方线下确认，运营已留档',cashDone:true,creditsDone:false,goodsDone:false}],balance:1200,ledger:[{id:'l1',at:'2026-10-01 09:00',user:'me',amount:1200,kind:'人工赠送',note:'创作体验积分（示例）',event:''}],projects:[{id:'p1',title:'山海之间 · 先导片',event:'yandang',track:TRACKS[1],ready:true,created:'2026-10-12 12:00'}]});
}
export function load() { try { const s=JSON.parse(localStorage.getItem(KEY)); if(s?.version===1||s?.version===2) return upgrade(s); } catch {} return seed(); }
export function save(s) { localStorage.setItem(KEY,JSON.stringify(s)); }
export const eventBy = (s,id) => s.events.find(e=>e.id===id);
export const workBy = (s,id) => s.works.find(w=>w.id===id);
export function gate(s,eventId,trackName,parent='',editing='') {
  const e=eventBy(s,eventId); if(!e) return '赛事不存在';
  if(e.status!=='征集中') return e.status==='已取消'?'赛事已取消，停止接收作品':'当前赛事不在征集阶段';
  const i=e.tracks.findIndex(t=>t.name===trackName), t=e.tracks[i];
  if(!t) return '请选择有效赛道';
  if(TODAY<t.start) return '该赛道尚未开放'; if(TODAY>t.end) return '该赛道征集已截止';
  const current=editing&&workBy(s,editing);
  if(editing && (!current||current.user!=='me'||current.status!=='草稿'||current.event!==eventId||current.track!==trackName)) return '当前作品不能修改；未通过为最终评选结果，不支持重新投稿';
  if(s.works.filter(w=>w.user==='me'&&w.event===eventId&&w.track===trackName&&w.id!==editing).length>=5) return '每场赛事每个赛道最多提交 5 件作品，当前名额已满';
  if(e.mode==='逐级晋级'&&i>0) {
    const p=workBy(s,parent);
    if(!p||p.user!=='me'||p.event!==e.id||p.track!==e.tracks[i-1].name||!p.advanced) return '需获得上一赛道的晋级资格后才能参赛';
    if(s.works.some(w=>w.id!==editing&&w.parent===parent&&w.track===trackName)) return '该晋级作品已创建本赛道投稿，请在我的赛事中继续编辑';
  }
  return '';
}
export function submitWork(s,payload,draft=false) {
  const error=gate(s,payload.event,payload.track,payload.parent,payload.id); if(error) throw Error(error);
  if(!payload.title.trim()) throw Error('请填写作品名称');
  if(payload.project&&!s.projects.some(p=>p.id===payload.project&&p.ready&&projectOwner(p)==='me'&&(p.outputs||[]).some(o=>o.id===payload.output))) throw Error('请选择本人容量万相项目中的已完成视频作品');
  if(payload.project&&payload.track==='剧本')throw Error('剧本赛道请上传剧本文件');
  if(!draft) {
    if(!payload.summary.trim()) throw Error('请填写作品简介');
    if(!payload.identity.name.trim()||!payload.identity.entity.trim()) throw Error('请填写参赛主体与联系人');
    if(!/^1[3-9]\d{9}$/.test(payload.identity.phone)) throw Error('请输入正确的 11 位手机号');
    if(!payload.files.length&&!payload.project) throw Error('请上传参赛文件或选择平台作品');
    if(!payload.agreed) throw Error('请阅读并同意参赛声明');
  }
  const old=workBy(s,payload.id),at=time();
  const w={...payload,id:old?.id||uid('work'),user:'me',status:draft?'草稿':'待初审',version:old?.version||1,created:old?.created||at,updated:at,advanced:false,public:false,history:[...(old?.history||[]),{at,text:draft?'保存草稿':`提交作品 V${old?.version||1}`}],versions:old?.versions||[]};
  if(old) s.works[s.works.indexOf(old)]=w; else s.works.unshift(w); return w;
}
export function reviewWork(s,id,result,note) {
  const w=workBy(s,id),e=eventBy(s,w?.event); if(!w||!['待初审','待复审'].includes(w.status)) throw Error('该作品已处理，请刷新列表');
  if(e.status==='已取消'||e.resultsPublished) throw Error('赛事已取消或公示，不能继续审核');
  const t=e.tracks.find(t=>t.name===w.track);
  if(TODAY<=t.end&&e.status==='征集中')throw Error('该赛道尚未结束征集，请在征集截止后审核');
  if(!['通过','拒绝'].includes(result))throw Error('请选择有效审核结果');
  note=String(note??'').trim();
  if(result==='拒绝'&&!note) throw Error('拒绝时请填写评语，说明未通过原因');
  if(note.length>500) throw Error('评语最多填写 500 字');
  const stage=w.status==='待初审'?'初审':'复审';
  const at=time();
  w.status=result==='拒绝'?'未通过':stage==='初审'&&e.review==='双审'?'待复审':'已通过';
  w.reviews=[...(w.reviews||[]),{stage,result,note,at}];
  w.reason=result==='拒绝'?note:'';w.updated=at;w.history.push({at,text:`${stage}${result==='拒绝'?'未通过':'通过'}${note?'：'+note:''}`});
}
export function reviewFeedback(w) {
  const notes=(w.reviews||[]).filter(r=>r.note?.trim());
  if(notes.length)return notes.slice().reverse();
  return w.status==='未通过'&&w.reason?.trim()?[{stage:'',result:'拒绝',note:w.reason,at:w.updated}]:[];
}
export function advanceWork(s,id) {
  const w=workBy(s,id),e=eventBy(s,w?.event),i=e?.tracks.findIndex(t=>t.name===w.track);
  if(!w||e.mode!=='逐级晋级'||w.status!=='已通过'||w.advanced||i>=e.tracks.length-1||e.status==='已取消') throw Error('该作品当前不能晋级');
  w.advanced=true;w.history.push({at:time(),text:`获得 ${trackTypeLabel(e.tracks[i+1].name)} 晋级资格`});
}
export function credit(s,{user='me',amount,kind,note,event='',award=''}) {
  amount=Number(amount); if(!Number.isInteger(amount)||amount===0||Math.abs(amount)>10000000) throw Error('积分请输入非零整数，绝对值不超过 1000 万');
  if(!note.trim()) throw Error('请填写操作原因');
  if(user==='me'&&s.balance+amount<0) throw Error('可用积分不足');
  if(award&&s.ledger.some(l=>l.award===award)) throw Error('该奖励积分已发放');
  if(user==='me') s.balance+=amount;
  s.ledger.unshift({id:uid('ledger'),at:time(),user,amount,kind,note,event,award});
}
export function cancelEvent(s,id,reason) {
  const e=eventBy(s,id);if(!reason.trim()) throw Error('请填写取消原因');
  if(!e||e.status==='已取消'||e.resultsPublished) throw Error('当前赛事不能取消');
  e.status='已取消';e.cancelReason=reason;
}
export function publishResults(s,id) {
  const e=eventBy(s,id),awards=s.awards.filter(a=>a.event===id);
  if(!e||e.status==='已取消'||e.status==='草稿'||e.resultsPublished) throw Error('当前赛事不能公示');
  if(s.works.some(w=>w.event===id&&['待初审','待复审'].includes(w.status)))throw Error('仍有审核中的作品，请完成评选后再公示');
  if(!awards.length||awards.some(a=>!a.confirmed||!a.proof.trim())) throw Error('请先录入获奖名单并完成主办方线下确认');
  e.resultsPublished=true;e.status='结果公示';
  for(const w of s.works.filter(w=>w.event===id&&w.status==='已通过'))w.public=true;
}
export function dbOpen() { return new Promise((resolve,reject)=>{const r=indexedDB.open(KEY+'-files',1);r.onupgradeneeded=()=>r.result.createObjectStore('files');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);}); }
export async function storeFiles(files) { const db=await dbOpen();const records=[];for(const file of files){const id=uid('file');await new Promise((resolve,reject)=>{const tx=db.transaction('files','readwrite');tx.objectStore('files').put(file,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});records.push({id,name:file.name,size:file.size,type:file.type});}db.close();return records; }
export async function getFile(id) {const db=await dbOpen();return new Promise((resolve,reject)=>{const r=db.transaction('files').objectStore('files').get(id);r.onsuccess=()=>{db.close();resolve(r.result);};r.onerror=()=>{db.close();reject(r.error);};});}
