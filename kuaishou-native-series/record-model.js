/* Local prototype state rules; no remote calls. */
window.KSRecords = (() => {
  const selling={online:'已上架',offline:'已下架'};
  const schedules={none:'未预约',pending:'待执行',success:'已执行',failed:'执行失败',cancelled:'已取消'};
  const defaultFilters=()=>({account:[],title:'',collectionName:'',collectionId:'',audit:'',type:'',sale:'',saleState:'',miniId:'',start:'',end:''});
  const beijing=(time=Date.now())=>new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Shanghai',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit',hour12:false}).format(new Date(time));
  function parseTime(value){
    if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value))return NaN;
    const full=value.length===16?value+':00':value,ms=Date.parse(full+'+08:00');
    return Number.isFinite(ms)&&beijing(ms).replace(' ','T')===full?ms:NaN;
  }
  function normalize(r,collections,seeds){
    const seed=seeds.find(x=>x.id===r.id),source=collections.find(x=>x.id===r.collectionId);
    r.collectionName??=r.config?.name||source?.name||seed?.collectionName||'';
    r.createdBy??=seed?.createdBy||'';r.modifiedBy??='';r.modifiedAt??='';
    r.auditReason??=r.audit==='rejected'?r.fail||'':'';
    r.uploadReason??=r.stage==='failed'?r.fail||'':'';
    // Preserve legacy platform restrictions separately from the two selling states.
    if(r.saleState==='forced_offline'){r.saleState='offline';r.platformRestricted=true;}
    r.platformRestricted??=false;
    r.disposeReason??='';r.schedule??={status:'none',time:'',reason:''};r.logs??=[];
    // Only real down-shelf history can supply a missing timestamp; offline status alone cannot.
    if(r.offlineAt==null){
      const times=r.logs.filter(log=>log.action==='下架').map(log=>parseTime(String(log.time||'').replace(' ','T'))).filter(Number.isFinite);
      r.offlineAt=times.length?beijing(Math.max(...times)):'';
    }
    if(!r.config&&seed?.config)r.config=JSON.parse(JSON.stringify(seed.config));
    return r;
  }
  function matches(r,f){
    const contains=(value,query)=>!query||String(value||'').toLowerCase().includes(query.toLowerCase());
    return (!(Array.isArray(f.account)?f.account.length:f.account)||(Array.isArray(f.account)?f.account.includes(r.account):r.account===f.account))&&contains(r.title,f.title)&&contains(r.collectionName,f.collectionName)&&(!f.collectionId||r.collectionId===f.collectionId)&&(!f.miniId||r.miniId===f.miniId)&&(!f.audit||r.audit===f.audit)&&(!f.type||r.type===f.type)&&(!f.sale||r.sale===f.sale)&&(!f.saleState||r.saleState===f.saleState)&&(!f.start||r.date.slice(0,10)>=f.start)&&(!f.end||r.date.slice(0,10)<=f.end);
  }
  function reason(r,action,valid=true){
    if(!valid)return '快手号授权已失效，请先更新授权';
    if(action==='retry')return r.stage==='failed'?'':'当前没有失败分集';
    if(action==='offline')return r.saleState==='online'?'':'只有已上架短剧可下架';
    if(r.platformRestricted||r.saleState==='forced_offline')return '短剧被平台强制下架，请先处理平台处置原因';
    if(['queued','creating','uploading','submitting'].includes(r.stage))return '当前任务处理中，请完成后操作';
    if(action==='edit'){
      if(r.stage==='failed')return '请先重试失败的上传任务';
      if(r.stage!=='complete'||r.uploaded!==r.total)return '请先完成全部分集上传';
      if(!['unsubmitted','rejected'].includes(r.audit))return '仅待提交或审核未通过的记录可编辑';
      if(r.saleState!=='offline'||r.schedule.status==='pending')return '请先下架并取消预约';
      return r.config?'':'历史记录缺少完整资料，请先同步平台资料';
    }
    if(r.stage!=='complete'||r.uploaded!==r.total||!r.miniId)return '请先完成全部分集上传';
    if(r.audit!=='approved')return '审核状态为发布成功后才可上架或预约上架';
    if(r.saleState!=='offline')return '短剧已上架';
    if(['modify-schedule','cancel-schedule'].includes(action))return r.schedule.status==='pending'?'':'当前没有待执行预约';
    if(['online','schedule'].includes(action)&&r.schedule.status==='pending')return '已有待执行预约，请修改或取消预约';
    return '';
  }
  function touch(r,action,actor='运营人员',time=Date.now(),detail=''){
    r.modifiedAt=beijing(time);r.modifiedBy=actor;
    r.logs.unshift({time:r.modifiedAt,actor,action,detail});
  }
  function apply(r,action,{valid=true,time=Date.now(),value='',actor='运营人员'}={}){
    const error=reason(r,action,valid);if(error)return error;
    if(action==='schedule'||action==='modify-schedule'){
      const ms=parseTime(value);if(!Number.isFinite(ms)||ms<=time)return '请选择晚于当前时间的有效预约时间（北京时间）';
      r.schedule={status:'pending',time:beijing(ms),reason:''};
      touch(r,action==='schedule'?'设置预约上架':'修改预约上架',actor,time,r.schedule.time+'（北京时间）');
    }else if(action==='cancel-schedule'){
      r.schedule.status='cancelled';r.schedule.reason='';touch(r,'取消预约上架',actor,time,r.schedule.time);
    }else if(action==='online'||action==='offline'){
      r.saleState=action==='online'?'online':'offline';
      if(action==='offline')r.offlineAt=beijing(time);
      touch(r,action==='online'?'上架':'下架',actor,time);
    }else return '不支持此操作';
    return '';
  }
  function executeDue(r,valid=true,time=Date.now()){
    if(r.schedule.status!=='pending')return false;
    const ms=parseTime(r.schedule.time.replace(' ','T'));if(!Number.isFinite(ms)||ms>time)return false;
    const failure=!valid?'预约执行时快手号授权已失效':(r.platformRestricted||r.saleState==='forced_offline')?'短剧被平台强制下架':r.audit!=='approved'?'预约执行时审核状态不是发布成功':r.stage!=='complete'||r.uploaded!==r.total?'分集上传尚未完成':r.saleState!=='offline'?'短剧已上架，预约未执行':'';
    r.schedule.status=failure?'failed':'success';r.schedule.reason=failure;r.schedule.executedAt=beijing(time);
    if(!failure)r.saleState='online';
    r.logs.unshift({time:beijing(time),actor:'系统',action:failure?'预约执行失败':'预约上架成功',detail:failure||r.schedule.time});
    return true;
  }
  return {selling,schedules,defaultFilters,beijing,parseTime,normalize,matches,reason,touch,apply,executeDue};
})();
