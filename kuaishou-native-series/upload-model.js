/* Multi-account upload planning for the local prototype. */
window.KSUpload = (() => {
  const unique=ids=>[...new Set(Array.isArray(ids)?ids:ids?[ids]:[])];
  function migrateTargets(draft){
    const ids=unique([...(draft.selected||[]),...Object.keys(draft.targets||{})]);
    return Object.fromEntries(ids.map(id=>[id,unique(draft.targets?draft.targets[id]:draft.account)]));
  }
  function plan(selected,targets){
    return unique(selected).flatMap(id=>unique(targets[id]).map(account=>({collectionId:id,account})));
  }
  function assign(selected,accounts,targets,available){
    const next={...targets},skipped=[];
    for(const id of unique(selected))next[id]=unique(accounts).filter(account=>{
      const error=!available.find(a=>a.id===account)?.valid?'账号授权已失效':'';
      if(error)skipped.push({collectionId:id,account,reason:error});
      return !error;
    });
    return {targets:next,skipped};
  }
  function issues(selected,targets,available){
    const errors=[];
    for(const id of unique(selected)){
      const ids=unique(targets[id]);
      if(!ids.length)errors.push({id,message:'请至少选择一个目标快手账号'});
      for(const aid of ids){
        const a=available.find(a=>a.id===aid);
        if(!a?.valid)errors.push({id,message:(a?.name||'目标账号')+'授权已失效，请重新选择'});
      }
    }
    return errors;
  }
  function createRecords({selected,targets,configs,records,accounts,batch,date,actor='运营人员',failureCollection=''}){
    const errors=issues(selected,targets,accounts);
    if(records.some(r=>r.batch===batch))errors.push({id:'',message:'本次上传已创建，请查看上传记录'});
    if(!selected.length)errors.push({id:'',message:'请先选择合集'});
    const rows=plan(selected,targets);
    for(const id of unique(selected)){
      const d=configs[id];
      if(!d){errors.push({id,message:'合集资料缺失'});continue;}
      errors.push(...window.KSModel.validate(d).map(x=>({id,message:x.message})));
      if(window.KSModel.titleConflict(records,unique(targets[id]),d))errors.push({id,message:'目标账号下其他合集已有同名短剧'});
      if(rows.some(p=>p.collectionId!==id&&configs[p.collectionId]?.title.trim()===d.title.trim()&&rows.some(q=>q.collectionId===id&&q.account===p.account)))errors.push({id,message:'同一账号下存在同名短剧'});
    }
    if(errors.length)return {errors,records:[]};
    return {errors:[],records:rows.map((p,i)=>{
      const d=JSON.parse(JSON.stringify(configs[p.collectionId]));
      const source=window.KSData?.collections.find(c=>c.id===p.collectionId);
      if(source){d.episodes=window.KSModel.sourceEpisodes(d,source);d.total=source.total;}
      return {id:batch+'-'+i,collectionId:d.id,collectionName:d.name,createdBy:actor,modifiedBy:'',modifiedAt:'',auditReason:'',uploadReason:'',schedule:{status:'none',time:'',reason:''},offlineSchedule:{status:'none',time:'',reason:''},offlineAt:'',logs:[],title:d.title,cover:d.cover,coverUrl:d.coverUrl||'',account:p.account,total:d.total,uploaded:0,stage:'queued',audit:'unsubmitted',saleState:'offline',sale:d.sale,miniId:'',date,batch,fail:'',type:d.type,attempt:0,simulateFailure:d.id===failureCollection,config:d};
    })};
  }
  return {unique,migrateTargets,plan,assign,issues,createRecords};
})();
