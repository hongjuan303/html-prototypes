window.KSModel = (() => {
  const clone=x=>JSON.parse(JSON.stringify(x));
  const sourceContentTypes={'真人剧':'1','漫剧':'2','AI剧':'2','解说剧':'2','沙雕漫':'2','演绎剧':'2'};
  const declarationDefaults={'1':'0','2':'1'};
  const filingValue=value=>[true,'true'].includes(value)?'true':[false,'false'].includes(value)?'false':'';
  const limitDescription=value=>[...String(value??'').trim()].slice(0,400).join('');
  const collectionTerms=(value,ids=false)=>[...new Set(String(value||'').split(ids?/[\s,，、;；]+/:/[\n,，、;；]+/).map(x=>x.trim()).filter(Boolean))];
  function queryCollections(collections,filters){
    if(!filters)return [];
    const names=collectionTerms(filters.names),ids=collectionTerms(filters.ids,true),types=filters.types||[];
    return collections.filter(c=>(!names.length||names.some(name=>c.name.toLowerCase().includes(name.toLowerCase())))&&(!ids.length||ids.includes(c.id))&&(!types.length||types.includes(c.sourceType)));
  }
  function batchEpisodePricing(d,cut,price){
    const errors=[];
    if(d.sale!=='2')errors.push({field:'priceBulkAmount',message:'仅单集+全剧付费可批量设置单集价格'});
    if(!/^[1-9]\d*$/.test(String(cut))||!Number.isSafeInteger(Number(cut))||Number(cut)>=d.total)errors.push({field:'priceBulkCut',message:'卡点集须为大于等于1且小于全集数的正整数'});
    if(!validPrice(price,100))errors.push({field:'priceBulkAmount',message:'付费金额为0.10～100元，最多两位小数'});
    if(errors.length)return errors;
    const amount=Number(price).toFixed(2),start=Number(cut);
    d.episodes.forEach(e=>{e.free=e.seq<start;e.price=e.free?'':amount;});
    d.batchPricing={cut:String(start),price:amount};
    return [];
  }
  function setContentType(d,type){
    d.type=type;d.declaration=declarationDefaults[type]??'';
  }
  function createConfig(source){
    const d=clone(source);
    d.title=source.title||source.name||'';
    d.desc=limitDescription(source.desc);
    setContentType(d,sourceContentTypes[source.sourceType]??'');
    d.completed='true';
    d.filing=filingValue(source.filing);
    return d;
  }
  function restoreConfig(config,source={}){
    const d=clone(config),empty=value=>value==null||value==='';
    if(empty(d.type))d.type=sourceContentTypes[source.sourceType||d.sourceType]??'';
    if(empty(d.declaration))d.declaration=declarationDefaults[d.type]??'';
    if(empty(d.completed))d.completed='true';
    d.filing=filingValue(empty(d.filing)?source.filing:d.filing);
    return d;
  }
  const peopleGroups={
    actors:{label:'演员',min:2,max:5,legacy:'actors',role:true},
    directors:{label:'导演',min:1,legacy:'directors',gender:'directorGender'},
    screenwriters:{label:'编剧',min:1,legacy:'screenwriters',gender:'screenwriterGender'},
    producers:{label:'制片人',min:1,max:1,legacy:'producerName',gender:'producerGender'}
  };
  const blankPerson=()=>({name:'',gender:'',role:'',birthday:'',nationality:'',company:''});
  function personnel(d,key){
    const group=peopleGroups[key],saved=d.people?.[key];
    const rows=Array.isArray(saved)?saved.map(p=>({...blankPerson(),...p})):String(d[group.legacy]||'').split(/[、,，]/).map(name=>name.trim()).filter(Boolean).map((name,i)=>({...blankPerson(),name,gender:i===0?d[group.gender]||'':''}));
    while(rows.length<group.min)rows.push(blankPerson());
    return rows;
  }
  function setPersonnel(d,key,rows){d.people??={};d.people[key]=rows;}
  const broadcastChannels=['大屏有线电视APP','大屏有线电视SDK','大屏IPTV APP','大屏IPTV SDK','大屏OTT APP','大屏OTT SDK','小屏小程序','小屏APP','PC端'];
  const blankBroadcast=()=>({name:'',channel:'',date:''});
  function broadcastPlatforms(d){
    if(Array.isArray(d.broadcastPlatforms))return d.broadcastPlatforms.length?d.broadcastPlatforms.map(p=>({...blankBroadcast(),...p})):[blankBroadcast()];
    return [{name:d.displayPlatform||'',channel:d.displayChannel||'',date:String(d.displayDate||'').slice(0,10)}];
  }
  // Proof types may coexist; each selected type owns its attachment slots.
  const copyrightKinds={
    '2':{label:'作品登记证书',slots:['registration']},
    '3':{label:'短剧制作协议',slots:['agreement']},
    '4':{label:'承诺函+现场拍摄图/短剧工程文件',slots:['shootPromise','shoot']},
    '5':{label:'承诺函+可信时间戳认证',slots:['timePromise','timestamp']}
  };
  const copyrightSlots={
    authorization:{label:'授权推广文件',min:1},
    registration:{label:'作品登记证书',min:1,max:2,imageMB:5},
    agreement:{label:'短剧制作协议/权属声明',min:1,imageMB:5},
    shootPromise:{label:'承诺函',min:1,imageMB:5},
    shoot:{label:'现场拍摄图/短剧工程文件',min:4,imageMB:5},
    timePromise:{label:'承诺函',min:1,imageMB:5},
    timestamp:{label:'可信时间戳认证证书',min:1,imageMB:5}
  };
  function copyrightTypes(d){
    const values=Array.isArray(d.copyrightMaterials)?d.copyrightMaterials:Array.isArray(d.copyrightMaterial)?d.copyrightMaterial:[d.copyrightMaterial];
    return [...new Set(values.map(String).filter(v=>copyrightKinds[v]))];
  }
  function copyrightUpload(d,slot){
    const saved=d.copyrightUploads?.[slot];
    if(saved)return {mode:saved.mode==='pdf'?'pdf':'image',images:clone(saved.images||[]),pdfs:clone(saved.pdfs||[])};
    // Only associate an old proof with its original type, never with every new selection.
    const legacySlot={'2':'registration','3':'agreement','4':'shoot','5':'timestamp'}[d.copyrightMaterial];
    const name=slot==='authorization'?d.authorization:slot===legacySlot?d.proof:'';
    const pdf=/\.pdf$/i.test(name||'');
    return {mode:pdf?'pdf':'image',images:name&&!pdf?[{name,size:null}]:[],pdfs:name&&pdf?[{name,size:null}]:[]};
  }
  function setCopyrightUpload(d,slot,value){d.copyrightUploads??={};d.copyrightUploads[slot]=clone(value);}
  function copyrightFileError(slot,mode,files){
    const spec=copyrightSlots[slot];
    if(mode==='image'&&spec.max&&files.length>spec.max)return `${spec.label}最多上传${spec.max}张图片`;
    for(const f of files){
      if(!(mode==='pdf'?/\.pdf$/i:/\.(jpe?g|png)$/i).test(f.name))return mode==='pdf'?'请选择PDF文件':'请选择JPEG、JPG或PNG图片';
      if(mode==='image'&&spec.imageMB&&f.size>spec.imageMB*1024*1024)return `${spec.label}每张图片不能超过${spec.imageMB}M`;
    }
    return '';
  }
  function copyrightIssues(d){
    const issues=[],add=(field,message)=>issues.push({tab:'rights',field,message}),types=copyrightTypes(d);
    if(!types.length)add('copyrightMaterial','请至少选择一种版权证明材料');
    const slots=[...(d.copyrightType==='2'?['authorization']:[]),...types.flatMap(t=>copyrightKinds[t].slots)];
    for(const slot of slots){
      const spec=copyrightSlots[slot],value=copyrightUpload(d,slot),files=value.mode==='pdf'?value.pdfs:value.images,field=slot==='authorization'?slot:'proof-'+slot;
      const error=copyrightFileError(slot,value.mode,files);
      if(error)add(field,error);
      else if(files.length<(value.mode==='pdf'?1:spec.min))add(field,`请上传${spec.label}${value.mode==='image'&&spec.min>1?'（至少'+spec.min+'张图片）':''}`);
    }
    return issues;
  }
  const validPrice=(value,max)=>/^\d+(\.\d{1,2})?$/.test(String(value))&&Number(value)>=.1&&Number(value)<=max;
  function sourceEpisodes(d,source){
    const prices=new Map((d.episodes||[]).map(e=>[e.seq,e]));
    return clone(source.episodes).map(e=>d.sale==='2'&&prices.has(e.seq)?{...e,free:prices.get(e.seq).free,price:prices.get(e.seq).price}:e);
  }
  function episodeIssues(d,e){
    const messages=[];
    if(!e.title.trim()||[...e.title].length>30)messages.push(`第${e.seq}集标题缺失或超过30字`);
    if(e.cover==null)messages.push(`第${e.seq}集缺少封面`);
    if(!e.ready)messages.push(`第${e.seq}集缺少可用源视频`);
    if(e.duration<15||e.duration>1200||e.size>1024)messages.push(`第${e.seq}集视频规格不符合要求`);
    return messages;
  }
  function validate(d){
    const issues=[]; const add=(tab,field,message)=>issues.push({tab,field,message});
    if(!d.title.trim()||[...d.title.trim()].length>20)add('base','title','短剧标题需为1～20个字符');
    if([...d.desc.trim()].length<100||[...d.desc.trim()].length>400)add('base','desc','短剧简介需为100～400个字符');
    if(!d.coverValid)add('base','cover','请补充8:5的短剧封面');
    if(!d.tags.length||d.tags.length>3)add('base','tags','请选择1～3个快手分类');
    if(!['1','2'].includes(d.type))add('base','type','请选择内容类型');
    if(d.type==='2'&&!['1','2','3','4','5','6'].includes(d.method))add('base','method','请选择漫剧制作方式');
    if(!['0','1'].includes(d.declaration))add('base','declaration','请选择作者声明');
    if(!['true','false'].includes(d.completed))add('base','completed','请选择完结状态');
    if(!['1','2'].includes(d.copyrightType))add('rights','copyrightType','请选择版权证明类型');
    issues.push(...copyrightIssues(d));
    if(d.copyrightType==='2'){
      const validDate=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString().slice(0,10)===value;
      if(!d.authStart||!d.authEnd)add('rights','authRange','请选择完整的授权有效期（开始日期～结束日期）');
      else if(!validDate(d.authStart)||!validDate(d.authEnd)||d.authStart>d.authEnd)add('rights','authRange','授权有效期无效，结束日期不能早于开始日期');
      if(d.subAuth==='')add('rights','subAuth','请选择是否具有转授权权利');
    }
    if(d.filing==='true'){
      if(!['2','3'].includes(d.filingType))add('rights','filingType','请选择备案号类型');
      if(!d.filingNo.trim())add('rights','filingNo','请补充备案号');
    }else if(d.filing==='false'){
      const fields={productionCost:'制作成本',avgMinutes:'单集时长',productionForm:'制作形式',productionYear:'出品年份',productionCompany:'制作机构',specialTheme:'特殊题材说明'};
      for(const [f,label] of Object.entries(fields))if(d[f]==='')add('rights',f,`请填写${label}`);
      if(d.productionCost!==''&&(!/^\d+(\.\d)?$/.test(d.productionCost)||Number(d.productionCost)<=0))add('rights','productionCost','制作成本须大于0，最多一位小数');
      if(Number(d.productionCost)>30)add('rights','productionCost','制作成本超过30万元，请核对备案要求后选择有备案号');
      if(d.avgMinutes!==''&&Number(d.avgMinutes)<=0)add('rights','avgMinutes','单集时长须大于0');
      const months=String(d.productionMonths??'').trim(),licensePrefix=String(d.productionLicensePrefix??'').trim(),licenseNumber=String(d.productionLicenseNumber??'').trim();
      if(months&&(!/^\d+(\.\d+)?$/.test(months)||Number(months)<=0))add('rights','productionMonths','制作周期填写时须为大于0的月数');
      if(Boolean(licensePrefix)!==Boolean(licenseNumber))add('rights','productionLicense','请完整填写制作许可证编号的两部分，或全部留空');
      for(const [key,g] of Object.entries(peopleGroups)){
        const rows=personnel(d,key);
        if(g.max&&rows.length>g.max)add('rights',key,`${g.label}信息最多添加${g.max}名`);
        rows.forEach((p,i)=>{
          const prefix=`${g.label}${i+1}`;
          if(!p.name.trim())add('rights',`people-${key}-${i}-name`,`请填写${prefix}姓名`);
          if(!['男','女'].includes(p.gender))add('rights',`people-${key}-${i}-gender`,`请选择${prefix}性别`);
          if(g.role&&!p.role.trim())add('rights',`people-${key}-${i}-role`,`请填写${prefix}角色`);
          if(p.birthday&&(!/^\d{4}-\d{2}-\d{2}$/.test(p.birthday)||!Number.isFinite(Date.parse(p.birthday))||new Date(p.birthday).toISOString().slice(0,10)!==p.birthday))add('rights',`people-${key}-${i}-birthday`,`${prefix}出生日期无效`);
        });
      }
      broadcastPlatforms(d).forEach((p,i)=>{
        const prefix=`播出平台${i+1}`;
        if(!p.name.trim())add('rights',`broadcast-${i}-name`,`请填写${prefix}的播出平台`);
        if(!broadcastChannels.includes(p.channel))add('rights',`broadcast-${i}-channel`,`请选择${prefix}的播出途径`);
        if(!p.date)add('rights',`broadcast-${i}-date`,`请选择${prefix}的播出时间`);
        else if(!/^\d{4}-\d{2}-\d{2}$/.test(p.date)||!Number.isFinite(Date.parse(p.date))||new Date(p.date).toISOString().slice(0,10)!==p.date)add('rights',`broadcast-${i}-date`,`${prefix}的播出日期无效`);
      });
      if(d.productionYear&&!/^(19|20)\d{2}$/.test(d.productionYear))add('rights','productionYear','请填写有效的四位出品年份');
      if(d.specialTheme==='true')add('rights','specialTheme','特殊题材需补充平台专项资料，当前原型暂不放行');
    }else add('rights','filing','请选择是否有备案号');
    if(!['0','2','3'].includes(d.sale))add('sale','sale','请选择全剧付费、单集+全剧付费或观看广告解锁');
    if(['0','2'].includes(d.sale)&&!validPrice(d.price,99999))add('sale','price','全剧价格为0.10～99999元，最多两位小数');
    if(d.sale==='2')for(const e of d.episodes||[])if(!e.free&&!validPrice(e.price,100))add('sale',`episode-price-${e.seq}`,`第${e.seq}集付费价格为0.10～100元，最多两位小数`);
    if(d.sale==='3'){
      if(!d.unlock||Number(d.unlock)<1||Number(d.unlock)>8)add('sale','unlock','请选择每次广告解锁集数（1～8集）');
      if(d.smallFree==='')add('sale','smallFree','请选择是否支持小额免广');
    }
    return issues;
  }
  function videoIssues(d){
    const episodes=d?.episodes||[],issues=[];
    if(!d||episodes.length!==d.total)issues.push({seq:null,message:'后台读取的分集数量与合集总集数不一致'});
    const seqs=new Set(episodes.map(e=>e.seq));
    if(d&&Array.from({length:d.total},(_,i)=>i+1).some(seq=>!seqs.has(seq)))issues.push({seq:null,message:'合集原始集序不完整，后台无法上传全集'});
    for(const e of episodes)for(const message of episodeIssues(d,e))issues.push({seq:e.seq,message});
    return issues;
  }
  const stages={queued:['等待上传','muted'],creating:['创建短剧','blue'],uploading:['上传中','blue'],submitting:['提交中','blue'],complete:['上传完成','green'],failed:['上传失败','red']};
  const audits={unsubmitted:['待提交','muted'],pending:['审核中','orange'],publishing:['发布中','blue'],rejected:['审核未通过','red'],approved:['发布成功','green']};
  const sales={'0':'全剧付费','2':'单集+全剧付费','3':'观看广告解锁'};
  function duplicate(records,account,id){return records.find(r=>r.account===account&&r.collectionId===id);}
  return {clone,createConfig,restoreConfig,setContentType,sourceContentTypes,limitDescription,collectionTerms,queryCollections,batchEpisodePricing,validate,videoIssues,episodeIssues,stages,audits,sales,duplicate,peopleGroups,blankPerson,personnel,setPersonnel,sourceEpisodes,broadcastChannels,blankBroadcast,broadcastPlatforms,copyrightKinds,copyrightSlots,copyrightTypes,copyrightUpload,setCopyrightUpload,copyrightFileError,copyrightIssues};
})();
