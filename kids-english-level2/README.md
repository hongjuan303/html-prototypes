# 小小英语角

基于家长提供的 Level2 期末卷，为 4 岁孩子与家长提供中英文点读及游戏复习。

- 8 个主题，27 张原卷学习图，166 个词条，153 条问答与句子示例。
- 每个词和句子均有英文及中文音频，支持双语连读、慢速和停止播放。
- 551 个去重后的本机合成音频，静态 AAC 文件，无语音服务密钥。
- 听音选图每轮最多 5 题，允许重试；不会录音或自动评分。
- 十天复习方案、分日点读清单、词条星标与完成记录；仅保存在浏览器本机。
- 原图保持原内容；补充的完整回答标为情境示例，适当纠正原卷拼写和不严谨用法。

## 访问

公开地址为 https://hongjuan303.github.io/html-prototypes/kids-english-level2/ 。
沿用 main 根目录 GitHub Pages 配置；使用相对资源路径，可放在指定子目录中。

本地从工作空间目录启动 HTTP 服务后，访问 `/html-prototypes/kids-english-level2/`。

## 内容说明

英文采用英式发音，由 macOS Daniel（en-GB）合成；中文由 Tingting 合成。英文音频使用独立的 `assets/audio/en-gb/` 地址，避免继续命中旧版美式语音缓存。页面直接播放预生成音频；英文加载失败时仅尝试设备上的 en-GB 语音。实际音量取决于设备媒体音量，微信内有播放限制时建议使用系统浏览器。没有广告、账号或儿童身份信息收集。

家长带练方法参考 British Council 家庭英语启蒙建议：
https://learnenglishkids.britishcouncil.org/parents/helping-your-child/how-start-teaching-kids-english-home

词义均依据题图语境。特别说明：strong 与 beautiful 不是反义词；aunt、uncle、cousin 按家庭实际称谓翻译；原卷 Look and chose 的用词应为 Look and choose；in the nighttime 可用 at night 表达。
