# 合集池 · 小程序剧目授权

2026-10-13 用户明确需求：容量提供过审微信剧目，外部分销商提供小程序，在「合集池管理 → 更多」增加「小程序剧目授权」。

原型包含右侧需求说明及对应编号 ①～⑩；弹窗只覆盖左侧画板，说明随当前步骤定位。

入口为 `index.html`。从工作区根目录启动静态服务后访问 `/html-prototypes/wechat-outbound-drama-authorization/`；资源基础路径已配置为 GitHub Pages 仓库子目录。

演示路径：更多 → 小程序剧目授权（初始为空）→ 剧目授权 → 多选审核通过记录 → 下一步 → 输入AppID → 确认授权 → 返回五列授权列表 → 取消授权。

顶部「演示返回」可切换全部成功、部分失败、请求失败、请求超时。授权及取消均为内存模拟，不发微信请求，不含凭证；刷新后恢复空列表。部分失败只重试失败项，超时通过核实操作确认。

产品补充建议：仅当前合集池的过审记录可选；默认永久授权。两项均在右侧说明标明，不当作用户原始定稿。

接口依据：

- [增加剧目授权](https://developers.weixin.qq.com/miniprogram/dev/server/API/minidrama/authorizedrama/api_authorizedrama.html)
- [解除剧目授权](https://developers.weixin.qq.com/miniprogram/dev/server/API/minidrama/authorizedrama/api_deauthorizedrama.html)
- [查询授权信息](https://developers.weixin.qq.com/miniprogram/dev/server/API/minidrama/authorizedrama/api_getauthorizeobjects.html)

2026-10-13 读取官方原文：增加授权页的请求方式为GET，但错误码要求POST；参数表为authorized，但示例为authorized_appid。真实服务端接入前须联调或请微信确认。

已通过浏览器验证：初始空态、仅过审/当前池候选、多选及跨送审账号记录、AppID必填/格式/空格处理、上一步保留、重复关系拦截、逐剧部分失败与单独重试、请求级失败保留、授权/取消超时核实、取消失败保留与成功仅移除指定关系；桌面1280×800、1440×900、1920×1080布局。
