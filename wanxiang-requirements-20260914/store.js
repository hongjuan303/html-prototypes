const KEY = 'wanxiang-0914-users-v1';
const EVENT = 'wanxiang-0914-users-changed';
export const SESSION_KEY = 'wanxiang-0914-session-v1';
function seeds() {
  return Array.from({length: 12}, (_, i) => {
    const status = i === 0 ? 'pending' : i === 1 ? 'approved' : i === 2 ? 'rejected' : ['pending','approved','pending'][i % 3];
    return {id: `demo-${i+1}`, phone: `1380000${String(i+1).padStart(4,'0')}`, region:i % 2 ? '海外版' : '国内版', source:i % 3 ? '顶部登录' : '小说IP库查看更多', createdAt:`2026-09-${i < 6 ? '14' : '13'}T${String(9 + i % 6).padStart(2,'0')}:20:00+08:00`, lastRequestedAt:'', status, reviewer:status === 'pending' ? '' : '演示审核员', reviewedAt:status === 'pending' ? '' : '2026-09-15T10:30:00+08:00', rejectionReason:status === 'rejected' ? '尚未确认合作意向（演示）' : '', noticeStatus:status === 'approved' ? 'sent' : 'not-sent'};
  });
}
export function readUsers() {
  const data = localStorage.getItem(KEY);
  if (!data) { const rows=seeds(); localStorage.setItem(KEY,JSON.stringify(rows)); return rows; }
  try { const rows=JSON.parse(data); if(!Array.isArray(rows)) throw new Error(); return rows; }
  catch { throw new Error('本地演示记录读取失败，请使用“重置演示数据”恢复。'); }
}
function save(rows) { localStorage.setItem(KEY,JSON.stringify(rows)); window.dispatchEvent(new Event(EVENT)); }
export function updateUser(id, patch) {
  const rows=readUsers(); const row=rows.find(x=>x.id===id);
  if(!row) throw new Error('未找到该申请，请刷新后重试。');
  Object.assign(row,patch); save(rows); return {...row};
}
export function requestAccess(phone,region,source) {
  const rows=readUsers(); let row=rows.find(x=>x.phone===phone);
  const now=new Date().toISOString();
  if(row) row.lastRequestedAt=now;
  else { row={id:`request-${Date.now()}`,phone,region,source,createdAt:now,lastRequestedAt:now,status:'pending',reviewer:'',reviewedAt:'',rejectionReason:'',noticeStatus:'not-sent'}; rows.unshift(row); }
  save(rows); return {...row};
}
export function subscribeUsers(callback) {
  const onStorage=e=>{if(e.key===KEY)callback();};
  window.addEventListener(EVENT,callback);window.addEventListener('storage',onStorage);
  return ()=>{window.removeEventListener(EVENT,callback);window.removeEventListener('storage',onStorage);};
}
export function submitBusiness(business,region='国内版') {
  const rows=readUsers(); const phone=business.contact; const now=new Date().toISOString();
  let row=rows.find(x=>x.phone===phone);
  if(!row){row={id:`request-${Date.now()}`,phone,region,source:'联系商务',createdAt:now,lastRequestedAt:now,status:'pending',reviewer:'',reviewedAt:'',rejectionReason:'',noticeStatus:'not-sent'};rows.unshift(row);}
  row.business={name:business.name,company:business.company,contact:phone,role:business.role,direction:[...business.direction],needs:business.needs};
  save(rows); return {...row};
}
export function resetDemo() { localStorage.removeItem(SESSION_KEY); save(seeds()); }
export function formatTime(value) { if(!value)return '—'; const d=new Date(value); if(Number.isNaN(d.getTime()))return '—'; const pad=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`; }
