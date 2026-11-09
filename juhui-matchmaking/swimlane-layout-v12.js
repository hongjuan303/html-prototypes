// Separate the normal sequence from revisions. Repeated nodes are references,
// not additional approvals. Every connector advances one column.
const chain=(id,title,refs,labels=[],note='')=>({id,title,steps:refs.map(ref=>[ref]),labels,note,compact:true});
export const layouts={
 script:{
  main:[
   {id:'script-review',title:'1.1 提交与并行审核',steps:[['A1'],['A2'],['A3','A4'],['A7']],lanes:['writer','system','content','safety'],branch:'两项并行',merge:'两项均通过',note:'内容审核与安全审核同时进行。只有同一版全集的两项审核都通过，才进入剧本库。'},
   {id:'script-match',title:'1.2 评级、推送与确认承制',steps:[['A8'],['A9','A10'],['A11'],['A14']],lanes:['rating','producer','system','maker'],branch:'按评级匹配',branchLabels:['人工','自动'],merge:'收到任一推送',labels:['','','确认选中'],note:'承接 A7 入库。S / A 人工匹配；B 按题材自动推送，也允许人工补推。承制方选中后即开发中，继续 2.1。'}
  ],
  exceptions:[
   {id:'script-revise',title:'审核驳回：两项审核重新开始',steps:[['A3','A4'],['A5'],['A2']],compact:true,branch:'任一项驳回',labels:['驳回修改','新全集重提'],note:'末端 A2 回到 1.1 的创建审核任务：内容审核和安全审核均重新待审核。'},
   chain('script-stop','终止剧本：只由内容审核决定',['A3','A6'],['确认终止'],'流程结束；安全审核没有终止权限。'),
   chain('script-timeout','S / A 推送超时：收回后人工重新挑选',['A9','A12','A13','A11'],['24h 未反馈','自动收回','重新推送'],'仅限评级为 S / A 的待反馈推送；B 级（包括人工补推）不套用此超时条件。末端 A11 回到选本。'),
   chain('script-decline','承制方未选中：结束本方推送，可另行补推',['A11','A13','A11'],['本方未选中','重新推送'],'其他承制方仍有效的推送保留。人工撤回后也由项目制片重新挑选；推送与撤回时间留档。')
  ]
 },
 production:{
  main:[
   {id:'production-delivery',title:'2.1 制作交付与分项审核',steps:[['B1'],['B2'],['B3'],['B5']],lanes:['maker','producer','system'],labels:['开始制作','分项提交','三项均通过'],note:'承接 A14 确认承制。人物及场景资产、一卡 demo、全集初稿可一起或分别提交，也分别审核和退回。'},
   {id:'production-safety',title:'2.2 全集终版进入正片安审',steps:[['B5'],['B6'],['B9']],lanes:['system','film'],labels:['送审全集终版','审核通过'],note:'B5 是 2.1 的同一节点。制片通过的全集就是终版，无需再上传第四份文件；安审通过结果进入发行条件汇总。'}
  ],
  exceptions:[
   chain('production-revise','制作审核驳回：只修改被退回的交付项',['B3','B4','B3'],['该项驳回','修改重提'],'末端 B3 重新审核该项；其他已通过且未修改的交付项保留结果。'),
   chain('film-revise','正片安审驳回：必须先经过制片复审',['B6','B7','B8','B6'],['驳回修改','新全集交制片','复审通过'],'末端 B6 回到 2.2。不能由承制方修改后直接跳回安审；原资产和一卡 demo 的通过结果保留。'),
   chain('film-revise-again','制片复审仍需修改',['B8','B7','B8'],['驳回修改','修改后重提'],'通过后才更新全集终版，再进入 B6 正片安审。'),
   chain('producer-stop','制作审核阶段：项目制片独立终止合作',['B3','B10','B12','A9'],['决定终止','直接生效','回库待匹配'],'保存旧合作历史，保留评级、制片和剧本资料；返回 1.2 重新匹配，不是永久终止剧本。'),
   chain('manager-stop','制作阶段：陈真可独立终止合作',['B1','B11','B12','A9'],['阶段内终止','直接生效','回库待匹配'],'与项目制片是二选一的独立权限，不需要两人共同确认；正片安审和制作物料核验不提供终止入口。')
  ]
 },
 release:{
  prerequisites:[
   chain('material-external','① 剧本物料 · 外部剧本',['C1','C2','C8'],['剧本商务确认','计入条件①'],'外部剧本走此路径；与下方内部剧本路径按来源择一。'),
   chain('material-internal','① 剧本物料 · 内部剧本',['C1','C2i','C8'],['总编确认','计入条件①'],'内部剧本走此路径，不需要再由外部剧本商务确认。'),
   chain('material-production','② 制作物料 · 全部项目',['C3','C4','C8'],['项目制片核验','计入条件②'],'建立承制归属后即可随时上传，不等待正片安审。'),
   chain('contract-script','③ 剧本合同 · 仅外部剧本',['C5','C8'],['计入条件③'],'线下已签，上传留档；内部自有剧本不需要。'),
   chain('contract-production','④ 制作合同 · 全部项目',['C6','C8'],['计入条件④'],'由承制商务上传留档，不设置合同审核。'),
   chain('release-result','⑤ 制作和正片安审结果',['C7','C8'],['计入条件⑤'],'承接 2.2 的 B9；三项制作审核与正片安审均已通过。')
  ],
  main:[
   {id:'release-schedule',title:'3.1 适用条件齐备后，由平台排期',steps:[['C8'],['C9'],['C10'],['C11']],lanes:['system','schedule','channelLead'],labels:['全部齐备','保存时间与渠道','分配运营'],note:'C8 同时检查上方①②④⑤；外部剧本还需③。内部 / 外部剧本物料按来源择一。撮合供应商不填写计划上线时间与渠道。'},
   {id:'release-online',title:'3.2 各渠道分别送审、上线与同步数据',steps:[['C12'],['C13'],['C16'],['C17']],lanes:['channelOps','system'],labels:['材料齐备','实际已上线','后续数据'],note:'承接 C11 分配的渠道运营；各端口分别准备材料、记录上线结果。不以计划时间自动判断实际上线。'}
  ],
  exceptions:[
   chain('external-material-revise','外部剧本物料驳回',['C2','C1','C2'],['驳回补充','更新后重审']),
   chain('internal-material-revise','内部剧本物料驳回',['C2i','C1','C2i'],['驳回补充','更新后重审']),
   chain('production-material-revise','制作物料驳回',['C4','C3','C4'],['驳回补充','更新后重审'],'此处只有通过 / 驳回，没有终止承制合作。'),
   chain('channel-material-revise','渠道退回资料：运营补齐后重送',['C13','C12','C13'],['资料退回','补齐重送']),
   chain('channel-content-revise','渠道退回内容：修改后经制片确认',['C13','C14','C15','C13'],['内容退回','提交内容修改','确认后重送'],'修改可由承制方或项目制片提交；确认后回到渠道运营重新送审。')
  ]
 }
};
