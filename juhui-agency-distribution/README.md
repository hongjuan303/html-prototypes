# 代理发行 V1 本地原型

本次发布版本：`20261116-permission18`。四项新增需求及送审权限说明按用户指定标注【11.13 更新】。

[公开原型](https://hongjuan303.github.io/html-prototypes/juhui-agency-distribution/?v=20261116-permission18#channel)

[供应商内容管理](http://127.0.0.1:4186/juhui-agency-distribution/?v=20261116-permission18#supplierContent) · [渠道运营](http://127.0.0.1:4186/juhui-agency-distribution/?v=20261116-permission18#operator)

新增物料／正片驳回后改集数、渠道驳回后改本渠道剧名及集数、按实际视频清单校验数量、文件原名回显和渠道卡片【下载全集】。右侧说明与橙色序号遵循工作区`99-模板/产品原型说明标准.md`。

渠道负责人和渠道运营均点击列表剧集名称进入详情，操作列没有【查看详情】。微信视频号卡片的【送审情况】对所有有合集访问权的人员可见，仅微信视频号渠道运营可填写；其他人员点击提示【无填写权限】。

点击评审顶栏【11.13需求示例】可追加三条演示记录，不覆盖现有记录；再次点击不重置已操作的示例。示例视频是自制短视频，PDF只演示历史文件名，未伪造业务附件原件。

合集继续保存在原有`juhui-agency-distribution-v1`键，新上传附件原件存于IndexedDB `juhui-agency-distribution-v1-files`；渠道版本保存在本合集的`channelVersions`内，不覆盖合集原名及其他渠道。

【下载全集】展示本渠道视频清单，安装入口打开迅雷官网，已有迅雷入口按[官方JS-SDK](https://open.thunderurl.com/)提交批量任务。SDK在点击后加载；本地上传原件只有浏览器地址时会提示缺少有效下载链接。正式文件服务及客户端唤起仍需技术集成，本地验证不代表真实迅雷下载完成。

用户已于2026-11-16授权本次V1更新同步GitHub；V2、V3原型及需求文件保持独立，不在发布范围。
