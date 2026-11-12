# 小小英语角

基于家长提供的 Level2 期末卷，为 4 岁孩子与家长提供中英文点读及游戏复习。

- 8 个主题，27 张原卷学习图，166 个词条，153 条原有问答与句子示例。
- 每张卡片关联具体问答，共 171 组。电脑端在卡片旁显示，手机端紧接当前卡片所在行展开；“本小节完整句型”仍可展开查阅。
- 每个词和句子均有英文及中文音频，支持双语连读、慢速和停止播放。
- 818 段去重静态音频，包括 410 段英式英文 MP3 和 408 段中文 AAC，无语音服务密钥。
- 听音选图每轮最多 5 题，允许重试；不会录音或自动评分。
- 十天复习方案、分日点读清单、词条星标与完成记录；仅保存在浏览器本机。
- 原图保持原内容；补充的完整回答标为情境示例，适当纠正原卷拼写和不严谨用法。

## 访问

公开地址为 https://hongjuan303.github.io/html-prototypes/kids-english-level2/ 。
沿用 main 根目录 GitHub Pages 配置；使用相对资源路径，可放在指定子目录中。

本地从工作空间目录启动 HTTP 服务后，访问 `/html-prototypes/kids-english-level2/`。

## 内容说明

英文采用家长试听确认的 Google Gemini TTS Lumi 女声，使用英式幼儿老师表达要求生成，包含自然的提问和鼓励语气；中文继续使用 Tingting。英文使用独立的 `assets/audio/en-gb-lumi-v1/` 路径，避免旧语音缓存。英文与中文之间停顿 500ms，每条表达之间停顿 1000ms。页面播放预生成音频，家长使用时无需 Google 账号或 API key。英文加载失败会提示重试；中文保留设备语音回退。没有广告、账号或儿童身份信息收集。

卡片问答是按原卷句型为当前图片补全的练习示例。食物喜好保留肯定与否定两种答案；原有 153 条完整表达和原卷图片均保留。

家长带练方法参考 British Council 家庭英语启蒙建议：
https://learnenglishkids.britishcouncil.org/parents/helping-your-child/how-start-teaching-kids-english-home

词义均依据题图语境。特别说明：strong 与 beautiful 不是反义词；aunt、uncle、cousin 按家庭实际称谓翻译；原卷 Look and chose 的用词应为 Look and choose；in the nighttime 可用 at night 表达。
