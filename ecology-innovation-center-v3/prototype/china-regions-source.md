# OPC 省市二级选项数据来源

数据文件：`china-regions.js`

整理与核验日期：2026-09-10

用途：生态创新中心 OPC 入驻表单的本地省市联动下拉；页面运行时不依赖联网取数。

## 数据版本与时效边界

大陆地区采用可追溯的 **2023 年数据基线**，不是宣称截至 2026 年的最新官方行政区划名单。上游 README 标注统计截止时间为 2023-06-30、发布时间为 2023-09-11；上游已声明不再更新。若后续有行政区划调整，需人工复核并更新本地字典，不能把本次整理日期当作行政区划版本日期。

## 主来源与固定版本

- 上游：[modood/Administrative-divisions-of-China](https://github.com/modood/Administrative-divisions-of-China)。
- 固定快照：`c49d495b40ac73eb1a66f6eeae5f8fd10696f035`。
- 原始数据：[dist/pc-code.json（固定快照）](https://github.com/modood/Administrative-divisions-of-China/blob/c49d495b40ac73eb1a66f6eeae5f8fd10696f035/dist/pc-code.json)。
- 数据版本说明：[README（固定快照）](https://github.com/modood/Administrative-divisions-of-China/blob/c49d495b40ac73eb1a66f6eeae5f8fd10696f035/README.md)。
- 该文件最近一次上游变更为 2023-09-13，提交 `dc3a1d7acd85ca1b0979543e9259604142c52e8e`。版本口径以固定快照的 README 与实际文件为准；并非以仓库最新提交日期判定数据新旧。
- 数据来源由上游追溯至国家统计局的统计用区划和城乡划分代码；本项目复制并转换 JSON 数据，没有运行上游代码。
- 上游许可：[WTFPL v2](https://github.com/modood/Administrative-divisions-of-China/blob/c49d495b40ac73eb1a66f6eeae5f8fd10696f035/LICENSE)，完整许可保留在文末。

## 覆盖与省市两级口径

共 **34 个省级选项、393 个第二级选项**：

- 大陆 31 个省级选项、369 个第二级选项。
- 台湾省下 22 个县市选项；香港特别行政区和澳门特别行政区各 1 个同名选项。
- 一般省份第二级为地级市、地区、自治州、盟。省/自治区直辖县级单位直接展开为实际县市/林区，不展示无法定位的“省直辖县级行政区划”等分组占位项。
- 北京、天津、上海、重庆第二级均为同名城市，不把区县误作“市”展示；其第二级 `code` 复用省级代码。
- 河南含济源市；湖北含仙桃市、潜江市、天门市、神农架林区；海南含 4 个地级市及 15 个省直辖县级单位；新疆含 14 个地级单位及 12 个自治区直辖县级市。
- 新疆已包含白杨市（`659012`）。已对照[新疆政府 2023-01-20 设立白杨市公告](https://www.xinjiang.gov.cn/xinjiang/tzgg/202301/8bd4c6578fae4c469680d068c187c7b0.shtml)核验名称与自治区直辖口径。
- 台湾第二级采用 22 县市地址选项口径（6 个直辖市、13 个县、3 个市），包括金门县与连江县。名称以[地方政府名单](https://www.president.gov.tw/Page/106)及[邮递区号查询县市列表](https://www.post.gov.tw/post/internet/SearchZone/index.jsp?ID=208)交叉核对，页面统一为简体显示。仅整理行政地名事实，不复制页面文章。
- 台湾二级 `TW-01` 至 `TW-22` 是**本原型内部稳定标识，不是 GB/T 行政区划代码**。统一归入“台湾省”是本表单的全国省级地址选择分组，不将所有县市描述为实际均由省级行政机构管辖。
- 港澳第二级使用同名特别行政区作为地址选项，代码复用省级代码；不再拆分区级地址。
- 大陆上游两位省级、四位地级代码右侧补零到六位；已有六位县级代码原样保留。`code` 应作为不透明字符串使用，不对所有选项强制“六位数字”校验。
- 不包含普通地级单位所属区县，不提供街道/乡镇第三级；这与本次“省市二级筛选”要求一致。

各省级选项的二级条目数：

| 省级选项 | 数量 | 省级选项 | 数量 |
| --- | ---: | --- | ---: |
| 北京市 | 1 | 天津市 | 1 |
| 河北省 | 11 | 山西省 | 11 |
| 内蒙古自治区 | 12 | 辽宁省 | 14 |
| 吉林省 | 9 | 黑龙江省 | 13 |
| 上海市 | 1 | 江苏省 | 13 |
| 浙江省 | 11 | 安徽省 | 16 |
| 福建省 | 9 | 江西省 | 11 |
| 山东省 | 16 | 河南省 | 18 |
| 湖北省 | 17 | 湖南省 | 14 |
| 广东省 | 21 | 广西壮族自治区 | 14 |
| 海南省 | 19 | 重庆市 | 1 |
| 四川省 | 21 | 贵州省 | 9 |
| 云南省 | 16 | 西藏自治区 | 7 |
| 陕西省 | 10 | 甘肃省 | 14 |
| 青海省 | 8 | 宁夏回族自治区 | 5 |
| 新疆维吾尔自治区 | 26 | 台湾省 | 22 |
| 香港特别行政区 | 1 | 澳门特别行政区 | 1 |

## 上游许可原文

```text
        DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                    Version 2, December 2004

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT THE FUCK YOU WANT TO.
```
