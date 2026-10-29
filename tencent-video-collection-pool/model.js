/* 所有账号、合集、CID和回执均为虚构示例，不请求真实渠道。 */
window.TV = (() => {
  const themes=['玄幻','异能','武侠','仙侠','都市','历史','悬疑','奇幻','科幻','穿越','系统','搞笑','灵异','古风','青春','言情'].map((label,i)=>[String(123134900+i),label]);
  const keywords=['主旋律','脱贫攻坚','青春校园','职业剧','情感','都市','喜剧','古装','科幻','奇幻','玄幻','公安刑侦','乡村','犯罪','年代剧','探险','美食','武侠','体育竞技','战争军旅'].map((label,i)=>[String(123130782+i),label]);
  const types=['未知','抖音','快手','微信','QQ浏览器','华为视频百花号','OPPO','全民K歌','腾讯视频'];
  const contentTypes=[['duanfan','短番'],['ai','AI真人短剧']];
  const assets='/html-prototypes/tencent-video-collection-pool/assets/';
  const submissionStates=['未提交','提交中','提交成功','提交失败'];
  function normalizeSubmissionStatus(d){
    const legacy={'未推送':'未提交','待完善':'未提交','待提交分集':'未提交','推送中':'提交中','结果待确认':'提交中','已提交':'提交成功','推送失败':'提交失败'};
    d.status=d.unknownStage?'提交中':submissionStates.includes(d.status)?d.status:legacy[d.status]||'未提交';
    return d;
  }
  function submissionFailureReason(d){
    if(d.status!=='提交失败')return '';
    const failed=(d.logs||[]).find(log=>['明确失败','提交失败'].includes(log.state));
    const message=String(failed?.message||'').trim();
    return message?(failed.stage?failed.stage+'：':'')+message:'暂无失败原因';
  }
  const basic=[
    {key:'kind',label:'内容品类',type:'select',options:[['duanfan','短番'],['ai','AI真人短剧']],desc:'必填，按品类调用对应专辑接口；短番的is_ai_real_person_short_drama传false，AI真人短剧传true。普通真人实拍短剧的适用范围待腾讯确认。'},
    {key:'user_title',label:'专辑名称',desc:'必填，默认带入合集名称，可维护腾讯专辑名称，不回写源合集。'},
    {key:'second_title',label:'副标题',desc:'必填，填写专辑副标题，去除首尾空白后不可为空。'},
    {key:'user_description',label:'内容简介',type:'textarea',desc:'必填，默认带入现有合集简介，可维护腾讯版本；文本长度上限待确认。'},
    {key:'micro_comic_theme',label:'题材',type:'select',options:themes,desc:'必填，单选腾讯16项题材，提交对应枚举ID；不直接沿用其他渠道分类ID。'},
    {key:'budget',label:'投资成本（万元）',type:'number',desc:'必填，填写整数万元；不自动四舍五入已有小数成本。成本文件另行必传。'},
    {key:'total_episode',label:'总集数',type:'number',readonly:true,desc:'必填，带入当前合集已有剧集总数并只读；分集来源沿用现有合集，不新增分集管理页面。'},
    {key:'micro_series_duration',label:'单集时长（分钟）',type:'number',desc:'必填，填写正整数分钟；实际剧集文件仍使用现有合集的视频来源。'},
    {key:'is_end_update',label:'是否完结',type:'select',options:[['true','已完结'],['false','连载中']],desc:'必填，已完结传true，连载中传false。'},
    {key:'is_ai_creation',label:'是否AI创作',type:'select',options:[['true','是'],['false','否']],desc:'必填；短番可选择，AI真人短剧固定为是。选择是时必须上传两份AI声明文件。'}
  ];
  const auth=[
    {key:'aboard_area_limit',label:'授权地区',type:'select',options:[['1337734','仅中国大陆'],['8251197','中国大陆及港澳台'],['1502215','全世界']],desc:'必填，单选仅中国大陆、中国大陆及港澳台、全世界，提交对应腾讯枚举。'},
    {key:'auth_duration',label:'授权年限（年）',type:'number',desc:'必填，填写正整数年；可授权范围须与实际版权材料一致。'},
    {key:'granted_rights',label:'授权权利',type:'checks',options:[['123133205','广播权'],['123133206','信息网络传播权']],desc:'必填，至少选择一项：广播权、信息网络传播权；按数组提交对应枚举。'}
  ];
  const ai=[
    {key:'cover_video_ratio',label:'视频比例',type:'select',options:[['hz','横版'],['vt','竖版']],desc:'AI真人短剧必填，横版传hz，竖版传vt；不据此擅自推定封面像素标准。'},
    {key:'plot_year_drama',label:'年代',type:'select',options:[['92630','古代'],['92631','近代'],['92632','现代'],['92633','当代']],desc:'AI真人短剧必填，选择古代、近代、现代或当代。'},
    {key:'micro_series_guzhuang',label:'是否古装',type:'select',options:[['1','非古装'],['2','古装']],desc:'AI真人短剧必填，非古装传字符串1，古装传字符串2。'},
    {key:'micro_series_keyword',label:'关键词',type:'keywords',options:keywords,desc:'AI真人短剧必填，至少选择2项腾讯关键词；从20项枚举中选择。'},
    {key:'is_adapted_from_ip',label:'是否IP改编',type:'select',options:[['false','否'],['true','是']],desc:'由绿台合集内容来源映射，内容来源为IP改编时传true；本页不重复编辑。'}
  ];
  function contentTypeFields(d){
    return [{...basic.find(f=>f.key==='kind'),label:'内容类型',options:contentTypes},basic.find(f=>f.key==='is_ai_creation'),...(d.kind==='ai'?[ai.find(f=>f.key==='cover_video_ratio')]:[])];
  }
  function changeContentType(d,kind){
    if(!contentTypes.some(([value])=>value===kind))return false;
    if(d.kind==='duanfan'&&(typeof d.is_ai_creation==='boolean'||d.is_ai_creation===null))d.short_is_ai_creation=d.is_ai_creation;
    d.kind=kind;d.is_ai_real_person_short_drama=kind==='ai';
    if(kind==='ai')d.is_ai_creation=true;
    else if(typeof d.short_is_ai_creation==='boolean'||d.short_is_ai_creation===null)d.is_ai_creation=d.short_is_ai_creation;
    return true;
  }
  function editableMetadata(d){
    const keys=['micro_comic_theme',...(d.kind==='ai'?['micro_series_keyword','plot_year_drama','micro_series_guzhuang']:[]),'aboard_area_limit','granted_rights','auth_duration'];
    return [...contentTypeFields(d),...keys.map(key=>({...[...basic,...ai,...auth].find(f=>f.key===key),...(key==='micro_comic_theme'?{label:'短剧题材'}:{})}))];
  }
  function metadataIssues(d){
    return editableMetadata(d).flatMap(f=>{
      const value=d[f.key];let message='';
      if(f.type==='select'&&!f.options.some(([id])=>id===String(value??'')))message=`请选择${f.label}`;
      if(f.key==='is_ai_creation'&&d.kind==='ai'&&value!==true)message='AI真人短剧必须为AI创作';
      if(f.type==='checks'||f.type==='keywords'){
        const values=Array.isArray(value)?value:[],minimum=f.type==='keywords'?2:1;
        if(values.some(v=>!f.options.some(([id])=>id===v)))message=`请重新选择有效的${f.label}`;
        else if(new Set(values).size<minimum)message=f.type==='keywords'?'请至少选择2个关键词':'请至少选择一项授权权利';
      }
      if(f.type==='number'&&(String(value??'').trim()===''||!Number.isSafeInteger(Number(value))||Number(value)<=0))message='授权年限请填写正整数年';
      return message?[{field:f.key,label:f.label,step:0,message}]:[];
    });
  }
  function applyEditableMetadata(target,draft){
    editableMetadata(draft).forEach(f=>{const value=draft[f.key];target[f.key]=Array.isArray(value)?[...value]:f.type==='number'&&String(value??'').trim()!==''&&Number.isFinite(Number(value))?Number(value):value;});
    // 保存隐藏字段供切回原类型时恢复；校验与素材上传仍仅使用当前类型的有效项。
    ['micro_series_keyword','plot_year_drama','micro_series_guzhuang','cover_video_ratio','short_is_ai_creation'].forEach(key=>{if(Object.prototype.hasOwnProperty.call(draft,key))target[key]=Array.isArray(draft[key])?[...draft[key]]:draft[key];});
    target.is_ai_real_person_short_drama=draft.kind==='ai';
  }
  const covers=[
    {key:'user_new_pic_hz',label:'横版封面',desc:'必填，上传横版图片，使用腾讯专辑封面上传接口返回的URL，对应user_new_pic_hz。'},
    {key:'user_new_pic_vt',label:'竖版封面',desc:'必填，默认取绿台合集列表的封面并展示预览，可手动更换；已有手动选择优先，保存不回写合集封面。合集无封面或主动移除后需手动上传，移除后不自动补回。推送时上传该图片取得腾讯封面URL，对应user_new_pic_vt。'},
    {key:'user_karios_ranklist_pic',label:'火龙榜单',desc:'必填，上传榜单图片，使用腾讯专辑封面上传接口返回的URL，对应user_karios_ranklist_pic。'}
  ];
  const copyrightTypes=[['agreement','协议声明文件'],['certificate','版权证书文件'],['personal','个人承诺函＋版权补充材料']];
  const conditionalAttachments=[
    {key:'record_url',label:'上线备案文件',desc:'本页“是否重点备案”选择“是”时展示且必传PDF；选择“否”时隐藏，不参与校验和提交。切换为否保留已选文件，再选是时恢复；备案号仍从合集资料映射。对应record_url。'},
    {key:'micro_series_ipfile',label:'IP改编文件',desc:'绿台合集“内容来源”为“IP改编”时展示且必传PDF；其他来源时隐藏，不参与校验、上传和提交。仅按内容来源判断，不限制内容品类；内容来源从绿台合集映射，本页不提供切换。对应micro_series_ipfile。'}
  ];
  function selectedProofTypes(d){
    if(d.has_own_copyright==='1543607')return ['chain'];
    // 兼容既有单一路径草稿；空数组代表用户主动取消所有勾选。
    const selected=Array.isArray(d.proofTypes)?d.proofTypes:[d.proofMode];
    return copyrightTypes.map(([key])=>key).filter(key=>selected.includes(key));
  }
  function copyrightAttachments(d){
    const selected=selectedProofTypes(d),a=[];
    if(selected.includes('chain'))a.push({key:'auth_chain_files',label:'版权链文件',multiple:true,desc:'无自有版权时必传，支持多个PDF；对应auth_chain_files数组。'});
    if(selected.includes('agreement'))a.push({key:'rights_agreement_file',label:'协议声明文件',desc:'勾选协议声明文件时必传PDF；对应rights_agreement_file。'});
    if(selected.includes('certificate'))a.push({key:'certificate_file',label:'版权证书文件',desc:'勾选版权证书文件时必传PDF；对应certificate_file。'});
    if(selected.includes('personal'))a.push({key:'personal_commitment_letter_file',label:'个人承诺函',desc:'勾选个人承诺函＋版权补充材料时必传PDF；对应personal_commitment_letter_file。'},{key:'rights_supplementary_files',label:'版权补充材料',multiple:true,desc:'与个人承诺函一并必传，支持多个PDF；对应rights_supplementary_files数组。'});
    return a;
  }
  function copyrightGroups(d){
    const slots={chain:['auth_chain_files'],agreement:['rights_agreement_file'],certificate:['certificate_file'],personal:['personal_commitment_letter_file','rights_supplementary_files']};
    const labels=Object.fromEntries([['chain','版权链文件'],...copyrightTypes]),fields=copyrightAttachments(d);
    return selectedProofTypes(d).map(key=>({key,label:labels[key],fields:fields.filter(f=>slots[key].includes(f.key))}));
  }
  function attachments(d){
    const a=[{key:'other_micro_cover_costing',label:'成本配置',desc:'所有专辑必传PDF；投资成本为0也不自动免除该文件。对应other_micro_cover_costing。'}];
    if(d.kind==='ai'||d.is_ai_creation===true)a.push({key:'ai_creation_declaration',label:'AI创作声明',desc:'AI创作时必传PDF；AI真人短剧强制必传。对应ai_creation_declaration。'},{key:'rights_non_infringement_declaration',label:'权利声明',desc:'AI创作时必传PDF；AI真人短剧强制必传。对应rights_non_infringement_declaration。'});
    if(d.is_cp_key_record)a.push(conditionalAttachments[0]);
    if(d.content_source==='IP改编')a.push(conditionalAttachments[1]);
    a.push(...copyrightAttachments(d));
    return a;
  }
  function assetList(d){
    const a=covers.flatMap(f=>(d.files[f.key]||[]).map((file,index)=>({file,label:f.label,slot:f.key,index})));
    d.roles.forEach((r,i)=>{if(r.image)a.push({file:r.image,label:`角色${i+1}剧照`,slot:'role',index:i});});
    attachments(d).forEach(f=>(d.files[f.key]||[]).forEach((file,index)=>a.push({file,label:f.label,slot:f.key,index})));
    return a;
  }
  function validate(d,step=null,push=false){
    const out=[];const add=(field,label,s,msg)=>out.push({field,label,step:s,message:msg||`请补充${label}`});
    if(step===null||step===0){
      ['user_title','second_title','user_description'].forEach(k=>{if(!String(d[k]??'').trim())add(k,[...basic,...auth].find(f=>f.key===k)?.label,0);});
      out.push(...metadataIssues(d));
      if(d.budget===''||!Number.isInteger(Number(d.budget))||Number(d.budget)<0)add('budget','投资成本（万元）',0,'投资成本请填写非负整数万元，不自动取整');
      if(!Number.isInteger(Number(d.micro_series_duration))||Number(d.micro_series_duration)<=0)add('micro_series_duration','单集时长（分钟）',0,'单集时长请填写正整数分钟');
    }
    if(step===null||step===1){
      covers.forEach(f=>{if(!(d.files[f.key]||[]).length)add(f.key,f.label,1);});
      if(d.roles.length<2||d.roles.length>4)add('roles','角色信息',1,'角色数量须为2～4个');
      d.roles.forEach((r,i)=>{if(!r.name.trim())add('roles',`角色${i+1}名称`,1);if(!r.image)add('roles',`角色${i+1}剧照`,1);});
    }
    if(step===null||step===2){
      if(d.is_cp_key_record&&!d.record_num_text.trim())add('record_num_text','上线备案号',2);
      if(!selectedProofTypes(d).length)add('proofTypes','版权证明材料类型',2,'请至少选择一种版权证明材料类型');
      attachments(d).forEach(f=>{if(!(d.files[f.key]||[]).length)add(f.key,f.label,2);});
    }
    if(push&&!d.is_ai_creation)add('is_ai_creation','非AI创作声明',0,'非AI分集创作声明的枚举配置待腾讯确认，当前暂不可推送');
    return out;
  }
  function file(name,kind='pdf',uploaded=false){return {name,size:kind==='image'?185320:98240,kind,preview:assets+(kind==='image'?'sample-cover.svg':'sample-document.pdf'),uploaded,ref:uploaded?'demo_reference':''};}
  function actorPhoto(name){return {...file(name+'-演员照片.svg','image'),preview:assets+'sample-actor.svg'};}
  function mappedRole(name){const actor_photo=actorPhoto(name);return {name,actor_photo,image:{...actor_photo,origin:'actor'}};}
  function fresh(id,title,kind='duanfan',count=8){return {id,title,sourceIntro:'讲述主人公在命运转折中重新出发，与伙伴共同寻找答案的成长故事。',count,kind,user_title:title,second_title:'以热爱奔赴每一个明天',user_description:'讲述主人公在命运转折中重新出发，与伙伴共同寻找答案的成长故事。',micro_comic_theme:'123134904',budget:30,total_episode:count,micro_series_duration:3,is_end_update:true,is_ai_creation:true,aboard_area_limit:'1337734',auth_duration:3,granted_rights:['123133206'],cover_video_ratio:'vt',plot_year_drama:'92633',micro_series_guzhuang:'1',micro_series_keyword:['123130784','123130786'],is_adapted_from_ip:false,is_cp_key_record:false,record_num_text:'',has_own_copyright:'1543606',proofMode:'certificate',roles:[mappedRole('林知夏'),mappedRole('陈予安')],files:{},cid:'',status:'未提交',submitted:0,lastTime:'',unknownStage:'',logs:[],saved:false,episodes:Array.from({length:count},(_,i)=>({index:i+1,title:`第${i+1}集`,ready:true,uploaded:false,coverUploaded:false}))};}
  function fill(d,uploaded=false){covers.forEach(f=>d.files[f.key]=[file(f.label+'.png','image',uploaded)]);d.roles.forEach(r=>r.image=r.actor_photo?{...r.actor_photo,origin:'actor',uploaded,ref:uploaded?'demo_reference':''}:file(r.name+'剧照.png','image',uploaded));attachments(d).forEach(f=>d.files[f.key]=[file(f.label+'.pdf','pdf',uploaded)]);d.saved=true;return d;}
  function prepareConditionalExample(db){
    if(db.conditionalExampleVersion===1)return false;
    const d=db.dramas.find(d=>d.id===900321);
    if(d){
      // 仅将用户当前评审的虚构样例调整为正向条件，不重置已选文件、版权类型或提交记录。
      Object.assign(d,{kind:'ai',is_cp_key_record:true,record_num_text:'示例备案-2026-0321',is_adapted_from_ip:true});
      conditionalAttachments.forEach(f=>{if(!Object.prototype.hasOwnProperty.call(d.files,f.key))d.files[f.key]=[file(f.label+'.pdf')];});
    }
    db.conditionalExampleVersion=1;
    return true;
  }
  function prepareContentSourceExamples(db){
    let changed=false;
    db.dramas.forEach(d=>{
      // 为旧版虚构样例补入绿台内容来源；已有映射及用户文件保持原值。
      if(!Object.prototype.hasOwnProperty.call(d,'content_source')){d.content_source=[900321,900322].includes(d.id)?'IP改编':'';changed=true;}
      if(d.content_source==='IP改编'&&!Object.prototype.hasOwnProperty.call(d.files,'micro_series_ipfile')){d.files.micro_series_ipfile=[file('IP改编文件.pdf')];changed=true;}
    });
    return changed;
  }
  function prepareCollectionCoverDefaults(db){
    if(db.collectionCoverDefaultsVersion===1)return false;
    db.dramas.forEach(d=>{
      // 旧版虚构合集补入源封面；只替换原始占位图，保留手动选择和主动移除。
      if(!Object.prototype.hasOwnProperty.call(d,'collection_cover')&&d.id>=900321&&d.id<=900327)d.collection_cover=file(d.title+'-合集封面.svg','image');
      const selected=d.files.user_new_pic_vt,source=d.collection_cover;
      const legacyDemo=selected?.length===1&&selected[0].name==='竖版封面.png'&&selected[0].preview===assets+'sample-cover.svg';
      if(source?.kind==='image'&&source.preview&&(!Object.prototype.hasOwnProperty.call(d.files,'user_new_pic_vt')||legacyDemo))d.files.user_new_pic_vt=[{...source,origin:'collection',uploaded:false,ref:''}];
    });
    db.collectionCoverDefaultsVersion=1;
    return true;
  }
  function prepareActorPhotoDefaults(db){
    if(db.actorPhotoDefaultsVersion===1)return false;
    db.dramas.forEach(d=>d.roles.forEach(r=>{
      const legacyDemo=r.image?.name===r.name+'剧照.png'&&r.image.preview===assets+'sample-cover.svg';
      if(!Object.prototype.hasOwnProperty.call(r,'actor_photo'))r.actor_photo=legacyDemo?actorPhoto(r.name):null;
      if(r.actor_photo?.kind==='image'&&r.actor_photo.preview&&(r.image===undefined||legacyDemo))r.image={...r.actor_photo,origin:'actor',uploaded:false,ref:''};
    }));
    db.actorPhotoDefaultsVersion=1;
    return true;
  }
  function seed(){
    const dramas=[fill(fresh(900321,'雾隐山河录')),fill(fresh(900322,'重启人生的她','ai',12)),fill(fresh(900323,'山海食光','duanfan',6),true),fill(fresh(900324,'星河来信','ai',10)),fill(fresh(900325,'掌心微光','duanfan',6),true),fill(fresh(900326,'风起长安','ai',6),true),fresh(900327,'云端茶馆','duanfan',4)];
    // 既有单一路径作为版权材料多选的初始值，其他条件继续由合集映射。
    Object.assign(dramas[1],{is_cp_key_record:true,record_num_text:'示例备案-2026-0322',is_adapted_from_ip:true,proofMode:'personal'});delete dramas[1].files.certificate_file;fill(dramas[1]);
    dramas[3].proofMode='agreement';delete dramas[3].files.certificate_file;fill(dramas[3]);
    dramas[4].has_own_copyright='1543607';delete dramas[4].files.certificate_file;fill(dramas[4],true);
    dramas[0].files.other_micro_cover_costing=[];dramas[0].status='未提交';
    dramas[2].cid='mzc_demo_900323';dramas[2].status='未提交';
    dramas[3].status='提交失败';dramas[3].lastTime='2026-10-26 10:20';dramas[3].logs=[{id:'DEMO-TV-900324-01',time:'2026-10-26 10:20',stage:'素材上传',state:'明确失败',message:'图片上传请求明确失败，尚未创建专辑。可重新推送。',request:'DEMO-REQ-0324',count:10}];
    dramas[4].status='提交中';dramas[4].unknownStage='专辑创建';dramas[4].lastTime='2026-10-26 10:18';dramas[4].logs=[{id:'DEMO-TV-900325-01',time:'2026-10-26 10:18',stage:'专辑创建',state:'结果待确认',message:'创建专辑请求超时，CID发放结果未知。核实前禁止重复创建。',request:'DEMO-REQ-0325',count:6}];
    dramas[5].cid='mzc_demo_900326';dramas[5].status='提交成功';dramas[5].submitted=6;dramas[5].lastTime='2026-10-26 09:40';dramas[5].episodes.forEach(e=>{e.uploaded=true;e.coverUploaded=true;});dramas[5].logs=[{id:'DEMO-TV-900326-01',time:'2026-10-26 09:40',stage:'分集提交',state:'提交成功',message:'专辑和6集分集已被接口接收；审核及上线结果另行核实。',request:'DEMO-REQ-0326',count:6}];
    const db={version:1,dramas,pools:[{id:36,name:'腾讯视频漫剧合作池',type:'腾讯视频',enabled:true,ids:dramas.slice(0,6).map(d=>d.id)},{id:37,name:'腾讯视频待推送合集池',type:'腾讯视频',enabled:false,ids:[900321,900327]},{id:26,name:'OPPO精品短剧推送池',type:'OPPO',enabled:true,ids:[900323]},{id:28,name:'全民K歌精品短剧推送池',type:'全民K歌',enabled:true,ids:[900322]},{id:3,name:'公号推广合集池',type:'微信',enabled:true,ids:[900321,900323]}],nextPool:38};
    prepareConditionalExample(db);prepareContentSourceExamples(db);prepareCollectionCoverDefaults(db);prepareActorPhotoDefaults(db);return db;
  }
  return {themes,keywords,types,contentTypes,basic,auth,ai,contentTypeFields,changeContentType,editableMetadata,metadataIssues,applyEditableMetadata,covers,submissionStates,normalizeSubmissionStatus,submissionFailureReason,conditionalAttachments,prepareConditionalExample,prepareContentSourceExamples,prepareCollectionCoverDefaults,prepareActorPhotoDefaults,copyrightTypes,selectedProofTypes,copyrightAttachments,copyrightGroups,attachments,assetList,validate,file,seed};
})();
