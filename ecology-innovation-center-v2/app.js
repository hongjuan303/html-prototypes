const projectData = [
  ["杭州", "浙江省", 120.15, 30.28, -66, -54, 7, "《马年限定之新春有约》", "浙江省杭州市富阳区", "文旅短剧", "容量短剧出品的春节年俗轻喜剧，在富阳龙门古镇实地取景，以中外文化碰撞展现年味新表达。", "assets/posters/ma-nian.jpg"],
  ["宁波", "浙江省", 121.55, 29.87, 44, -36, 1, "《甬忆南侨梦归人》", "浙江省宁波市", "文旅短剧", "讲述马来西亚华侨寻根与抗战历史的红色文旅短剧。", "assets/posters/yong-yi.jpg"],
  ["舟山", "浙江省", 122.2, 30.0, 79, -6, 1, "《约等于一百岁》", "浙江省舟山市", "公益短剧", "以海岛生活与银发群体为切口，讲述温暖治愈的地域故事。", "assets/posters/yi-bai-sui.jpg"],
  ["台州", "浙江省", 121.42, 28.66, 66, 20, 3, "《寻天记》之和合圣境", "浙江省台州市天台县", "文旅短剧", "融合天台山和合文化与奇幻喜剧，呈现富有辨识度的地域故事。", "assets/posters/xun-tian-ji.jpg"],
  ["金华", "浙江省", 119.65, 29.08, -78, 24, 1, "《带你去个好地方》", "浙江省金华市武义县", "乡村振兴短剧", "以旅行视角展现乡村风貌与共同富裕。", "assets/posters/hao-di-fang.jpg"],
  ["磐安", "浙江省", 120.45, 29.05, -25, 58, 1, "《辣妈回村》", "浙江省磐安县", "乡村振兴短剧", "讲述驻村第一书记带领乡村振兴的女性励志故事。", "assets/posters/la-ma-hui-cun.jpg"],
  ["苏州", "江苏省", 120.62, 31.3, -72, -84, 2, "《面若桃花》第二季", "江苏省苏州市", "文旅短剧", "以穿越宋韵文化塑造城市品牌的精品文旅短剧。", "assets/posters/mian-ruo-tao-hua.jpg"],
  ["张家港", "江苏省", 120.55, 31.87, 12, -104, 1, "《我在张家港遇到河神》", "江苏省苏州市张家港市", "文旅短剧", "融合奇幻元素与江南文化，讲述具有城市气质的年轻故事。", "assets/posters/zhang-jia-gang.jpg"],
  ["桂林", "广西壮族自治区", 110.29, 25.27, -46, 27, 1, "《漓江仙子的人间烟火》", "广西壮族自治区桂林市", "文旅短剧", "广西重点扶持项目，讲述亲情守护与励志成长的修仙题材短剧。", "assets/posters/li-jiang-xian-zi.jpg"],
  ["香格里拉", "云南省", 99.7, 27.83, -80, -8, 1, "《香格里拉下雪了吗》", "云南省迪庆藏族自治州香格里拉市", "文旅短剧", "展现藏族风情与治愈旅行的民族文旅短剧。", "assets/posters/xiang-ge-li-la.jpg"],
  ["延边州", "吉林省", 129.5, 42.9, 24, -28, 1, "《G331号秘境来信》", "吉林省延边朝鲜族自治州", "乡村振兴短剧", "以边境振兴为主题，呈现东北边境的青春采风故事。", "assets/posters/g331.jpg"],
  ["茂名·高州", "广东省", 110.85, 21.9, 34, 36, 1, "《我在荔乡当冼夫人合伙人》", "广东省茂名市高州市", "乡村振兴短剧", "融合冼夫人文化与荔枝产业的乡村振兴非遗短剧。", "assets/posters/li-xiang.jpg"]
];

const additionalCityWorks = {
  0: [
    { title: "《上元欢》", location: "余杭区 · 文旅短剧", description: "以宋韵上元灯会为背景，呈现杭州传统节俗与年轻情感。", image: "assets/posters/shang-yuan-huan.jpg" },
    { title: "《我在巴黎当侠客》", location: "西湖区 · 文旅短剧", description: "连接杭州文化与国际视野，讲述东方侠义的当代表达。", image: "assets/posters/paris-xiake.jpg" },
    { title: "《我见过你的征途》", location: "淳安县 · 红色短剧", description: "以真实地域与红色记忆为线索，讲述跨越时代的青春征途。", image: "assets/posters/zheng-tu.jpg" },
    { title: "《水韵风情梦塘栖》", location: "临平区 · 文旅短剧", description: "沿塘栖水乡展开人文故事，展现江南古镇的生活气息。", image: "assets/posters/meng-tang-qi.jpg" },
    { title: "《临平，向幸福出发》", location: "临平区 · 城市短剧", description: "从普通人的幸福生活出发，描绘城市发展与温暖日常。", image: "assets/posters/lin-ping.jpg" },
    { title: "《临安秘史·缉妖传》", location: "临安区 · 奇幻短剧", description: "融合临安地域文化与东方奇幻元素，打造年轻化城市故事。", image: "assets/posters/lin-an-mi-shi.jpg" }
  ],
  3: [
    { title: "《宋服嫁到》", location: "黄岩区 · 文旅短剧", description: "以宋服文化与年轻人的情感故事，呈现传统美学新表达。", image: "assets/posters/song-fu-jia-dao.jpg" },
    { title: "《海屿岛之恋》", location: "玉环市 · 文旅短剧", description: "以海岛风光与青春爱情为主线，呈现台州滨海城市气质。", image: "assets/posters/hai-yu-dao.jpg" }
  ]
};

const specialProjects = [
  { type: "space", name: "云谷中心OPC社区", lon: 120.08, lat: 30.31, dx: -92, dy: 38, region: "浙江省 · 杭州市", city: "西湖区", count: "产业空间", category: "OPC社区", location: "云谷中心", title: "容量短剧（云谷中心）人工智能影视OPC社区", description: "面向影视OPC团队开放的线下创作社区，提供办公场地、制作工具、算力、版权、发行和产业项目资源。", image: "assets/opc-community.png", items: [["创作场地", "团队办公与协同制作"], ["生产支持", "工具、算力与内容版权"], ["商业服务", "发行、出海与产业订单"]], action: "我要加入", joinDirection: "云谷中心人工智能影视OPC社区", joinTitle: "申请加入云谷中心人工智能影视OPC社区" },
  { type: "space", name: "永嘉创新应用中心", lon: 120.69, lat: 28.15, dx: 88, dy: 80, region: "浙江省 · 温州市", city: "永嘉县", count: "产业空间", category: "创新中心", location: "温州 · 永嘉", title: "容量短剧（永嘉）人工智能创新应用中心", description: "联动地方产业、城市文化与创作人才，承接人工智能内容共创、产业培训和区域项目孵化。", image: "assets/innovation-center.png", items: [["区域共创", "城市文化内容开发"], ["产业培训", "人工智能影视实践课程"], ["项目孵化", "创作团队与产业资源对接"]], action: "我要加入", joinDirection: "永嘉人工智能创新应用中心", joinTitle: "申请加入永嘉人工智能创新应用中心" },
  { type: "school", name: "浙传创新实验班", lon: 120.35, lat: 30.32, dx: -96, dy: -104, region: "浙江省 · 杭州市", city: "钱塘区", count: "校企合作", category: "产教融合", location: "浙江传媒学院", title: "容量短剧 × 浙江传媒学院人工智能创新实验班", description: "联合高校建设人工智能影视实践专班，面向师生开放创作工具、真实项目、算力支持与创业孵化资源。", image: "assets/aigc-class-graduation.png", items: [["实践专班", "真实项目进入课堂"], ["创作支持", "工具与算力开放"], ["成长通道", "实训、就业与创业孵化"]], action: "我要合作", joinDirection: "校企合作", joinTitle: "提交校企合作申请" },
  { type: "event", name: "雁荡山杯", lon: 121.08, lat: 28.37, dx: 87, dy: 36, region: "浙江省 · 温州市", city: "乐清市", count: "创作赛事", category: "技能大赛", location: "温州 · 雁荡山", title: "雁荡山杯文旅OPC技能大赛", description: "聚焦文旅内容与OPC创作能力，面向全国创作团队开放主题赛题、产业资源与成果展示机会。", image: "assets/posters/xun-tian-ji.jpg", items: [["赛事方向", "文旅内容与漫剧创作"], ["参赛对象", "OPC团队与专业创作者"], ["赛事状态", "报名进行中"]], action: "我要参赛", href: "https://www.data0086.com" },
  { type: "event", name: "大广赛·即将开启", lon: 116.4, lat: 39.9, dx: 80, dy: -38, region: "北京市", city: "北京", count: "创作赛事", category: "营销创作", location: "北京", title: "大广赛营销创客单元竞赛", description: "连接高校创意人才与产业真实命题，探索人工智能内容创作、品牌表达与青年创新实践。", image: "../ai-drama-website-optimization/assets/qa-banner-1.jpg", items: [["赛事方向", "品牌营销与内容创新"], ["参赛对象", "高校学生与青年创作者"], ["赛事状态", "即将开启"]], action: "敬请期待", message: "大广赛营销创客单元竞赛即将开启" },
  { type: "coming", name: "新疆·即将呈现", lon: 87.6, lat: 43.8, dx: -22, dy: -34, region: "新疆维吾尔自治区", city: "新疆", count: "筹备项目", category: "即将呈现", location: "新疆维吾尔自治区", title: "辽阔边疆与多元文化，等待被镜头重新发现", description: "围绕地域文化、自然景观与多民族生活展开内容调研，新的城市故事正在筹备中。", image: "assets/coming-regions.jpg", items: [["内容方向", "地域文化与自然人文"], ["当前阶段", "前期调研与合作洽谈"], ["合作机会", "面向本地机构与创作者开放"]], action: "查看筹备方向", target: ".coming-projects" },
  { type: "coming", name: "三星堆·即将呈现", lon: 104.23, lat: 31.0, dx: -79, dy: -50, region: "四川省 · 德阳市", city: "广汉市", count: "筹备项目", category: "即将呈现", location: "四川 · 三星堆", title: "让古蜀文明穿越时间，在人工智能影像中焕发新生", description: "以古蜀文明、考古发现与东方想象为内容源头，探索传统文化的年轻化影像表达。", image: "assets/coming-regions.jpg", items: [["内容方向", "古蜀文明与东方想象"], ["当前阶段", "创意策划与资源连接"], ["合作机会", "文化机构与制作团队共创"]], action: "查看筹备方向", target: ".coming-projects" },
  { type: "coming", name: "武夷山·即将呈现", lon: 118.0, lat: 27.75, dx: -94, dy: 68, region: "福建省 · 南平市", city: "武夷山市", count: "筹备项目", category: "即将呈现", location: "福建 · 武夷山", title: "从山水茶韵到东方故事，一场影像共创正在酝酿", description: "围绕武夷山水、茶文化与非遗技艺，策划兼具地域辨识度和传播潜力的精品内容。", image: "assets/coming-regions.jpg", items: [["内容方向", "山水茶韵与非遗文化"], ["当前阶段", "项目策划与伙伴招募"], ["合作机会", "文旅机构与创作者共创"]], action: "查看筹备方向", target: ".coming-projects" }
];

const projectAreaCodes = ["330100", "330200", "330900", "331000", "330700", "330700", "320500", "320500", "450300", "533400", "222400", "440900"];
const projectDistrictNames = ["富阳区", "宁波市", "舟山市", "天台县", "武义县", "磐安县", "苏州市", "张家港市", "桂林市", "香格里拉市", "延边州", "高州市"];
const specialAreaCodes = ["330100", "330300", "330100", "330300", "110000", "650000", "510600", "350700"];
const areaDisplayNames = {
  "110000": "北京市区县", "222400": "延边朝鲜族自治州", "320500": "苏州市", "330100": "杭州市", "330200": "宁波市", "330300": "温州市",
  "330700": "金华市", "330900": "舟山市", "331000": "台州市", "350700": "南平市", "440900": "茂名市", "450300": "桂林市",
  "510600": "德阳市", "533400": "迪庆藏族自治州", "650000": "新疆维吾尔自治区"
};

const svg = document.querySelector(".china-map");
const glowLayer = document.querySelector("[data-map-glow]");
const shapeLayer = document.querySelector("[data-map-shapes]");
const routeLayer = document.querySelector("[data-map-routes]");
const markerLayer = document.querySelector("[data-map-markers]");
const specialMarkerLayer = document.querySelector("[data-special-markers]");
const districtGlowLayer = document.querySelector("[data-district-glow]");
const districtShapeLayer = document.querySelector("[data-district-shapes]");
const districtLabelLayer = document.querySelector("[data-district-labels]");
const districtMarkerLayer = document.querySelector("[data-district-markers]");
const mapShell = document.querySelector(".map-shell");
const storyPanel = document.querySelector("[data-story-panel]");
const mapBackButton = document.querySelector("[data-map-back]");
const mapZoomInButton = document.querySelector("[data-map-zoom-in]");
const mapZoomOutButton = document.querySelector("[data-map-zoom-out]");
const mapResetButton = document.querySelector("[data-map-reset]");
const mapZoomLevel = document.querySelector("[data-map-zoom-level]");
const NS = "http://www.w3.org/2000/svg";
const bounds = { minLon: 72, maxLon: 136, minLat: 17, maxLat: 54 };
const baseMapView = { x: 0, y: 0, width: 920, height: 590 };
const minMapZoom = 1;
const maxMapZoom = 8;
const districtZoomThreshold = 2.2;
let pinnedCity = null;
let pinnedSpecial = null;
let currentPanelAction = null;
let currentFeaturedAction = null;
let currentAreaCode = null;
let currentMapFilter = "all";
let currentMapView = { ...baseMapView };
let currentMapZoom = 1;
let selectedMapFocus = null;
let districtSummary = null;
let mapViewAnimation = null;
let mapPointerState = null;
const districtCache = new Map();

function project(lon, lat) {
  const x = 38 + ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 844;
  const y = 30 + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 510;
  return [x, y];
}

function clampMapView(view) {
  const width = Math.min(baseMapView.width, Math.max(baseMapView.width / maxMapZoom, view.width));
  const height = width * (baseMapView.height / baseMapView.width);
  return {
    x: Math.min(baseMapView.width - width, Math.max(0, view.x)),
    y: Math.min(baseMapView.height - height, Math.max(0, view.y)),
    width,
    height
  };
}

function updateMapContext() {
  const districtVisible = Boolean(currentAreaCode && districtSummary && currentMapZoom >= districtZoomThreshold);
  mapShell.classList.toggle("is-district-visible", districtVisible);
  mapBackButton.hidden = !currentAreaCode && currentMapZoom <= 1.001;
  mapZoomLevel.textContent = `${Math.round(currentMapZoom * 100)}%`;
  mapZoomInButton.disabled = currentMapZoom >= maxMapZoom - .01;
  mapZoomOutButton.disabled = currentMapZoom <= minMapZoom + .01;
  if (districtVisible) {
    document.querySelector("[data-map-level]").textContent = "区县级合作视图";
    document.querySelector("[data-map-area]").textContent = areaDisplayNames[currentAreaCode] || "项目区域";
    document.querySelector("[data-map-status]").textContent = `${districtSummary.featureCount} 个区县边界 · ${districtSummary.projectCount} 个合作项目`;
  } else if (currentAreaCode) {
    document.querySelector("[data-map-level]").textContent = "全国合作网络";
    document.querySelector("[data-map-area]").textContent = areaDisplayNames[currentAreaCode] || "已选项目";
    document.querySelector("[data-map-status]").textContent = districtSummary
      ? `已选择项目区域 · 继续放大查看 ${districtSummary.featureCount} 个区县边界`
      : "正在加载区县级行政边界";
  } else {
    document.querySelector("[data-map-level]").textContent = "全国合作网络";
    document.querySelector("[data-map-area]").textContent = "中国";
    document.querySelector("[data-map-status]").textContent = currentMapZoom > 1.01 ? "拖拽地图继续查看" : "全国合作项目持续更新";
  }
}

function renderMapView(view) {
  currentMapView = clampMapView(view);
  currentMapZoom = baseMapView.width / currentMapView.width;
  svg.setAttribute("viewBox", `${currentMapView.x.toFixed(3)} ${currentMapView.y.toFixed(3)} ${currentMapView.width.toFixed(3)} ${currentMapView.height.toFixed(3)}`);
  updateMapContext();
}

function animateMapView(targetView, duration = 210) {
  const target = clampMapView(targetView);
  const start = { ...currentMapView };
  const startTime = performance.now();
  if (mapViewAnimation) cancelAnimationFrame(mapViewAnimation);
  const step = now => {
    const progress = Math.min(1, (now - startTime) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    renderMapView({
      x: start.x + (target.x - start.x) * eased,
      y: start.y + (target.y - start.y) * eased,
      width: start.width + (target.width - start.width) * eased,
      height: start.height + (target.height - start.height) * eased
    });
    if (progress < 1) mapViewAnimation = requestAnimationFrame(step);
    else mapViewAnimation = null;
  };
  mapViewAnimation = requestAnimationFrame(step);
}

function getMapPoint(clientX, clientY) {
  const rect = svg.getBoundingClientRect();
  return {
    ratioX: Math.min(1, Math.max(0, (clientX - rect.left) / rect.width)),
    ratioY: Math.min(1, Math.max(0, (clientY - rect.top) / rect.height))
  };
}

function zoomMap(nextZoom, pointer = null) {
  const zoom = Math.min(maxMapZoom, Math.max(minMapZoom, nextZoom));
  const width = baseMapView.width / zoom;
  const height = baseMapView.height / zoom;
  let focusX;
  let focusY;
  let ratioX = .5;
  let ratioY = .5;
  if (pointer) {
    const ratio = getMapPoint(pointer.clientX, pointer.clientY);
    ratioX = ratio.ratioX;
    ratioY = ratio.ratioY;
    focusX = currentMapView.x + currentMapView.width * ratioX;
    focusY = currentMapView.y + currentMapView.height * ratioY;
  } else if (selectedMapFocus) {
    [focusX, focusY] = selectedMapFocus;
  } else {
    focusX = currentMapView.x + currentMapView.width / 2;
    focusY = currentMapView.y + currentMapView.height / 2;
  }
  animateMapView({ x: focusX - width * ratioX, y: focusY - height * ratioY, width, height });
}

function ringPath(ring) {
  return ring.map((point, index) => {
    const [x, y] = project(point[0], point[1]);
    return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";
}

function featurePath(feature) {
  const { type, coordinates } = feature.geometry;
  if (type === "Polygon") return coordinates.map(ringPath).join(" ");
  if (type === "MultiPolygon") return coordinates.flatMap(polygon => polygon.map(ringPath)).join(" ");
  return "";
}

function geometryPoints(geometry) {
  if (geometry.type === "Polygon") return geometry.coordinates.flat();
  if (geometry.type === "MultiPolygon") return geometry.coordinates.flat(2);
  return [];
}

function getGeoBounds(geo) {
  const points = geo.features.flatMap(feature => geometryPoints(feature.geometry));
  return points.reduce((result, point) => ({
    minLon: Math.min(result.minLon, point[0]), maxLon: Math.max(result.maxLon, point[0]),
    minLat: Math.min(result.minLat, point[1]), maxLat: Math.max(result.maxLat, point[1])
  }), { minLon: Infinity, maxLon: -Infinity, minLat: Infinity, maxLat: -Infinity });
}

function detailFeaturePath(feature, detailProject) {
  const makeRing = ring => ring.map((point, index) => {
    const [x, y] = detailProject(point[0], point[1]);
    return `${index ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ") + " Z";
  const { type, coordinates } = feature.geometry;
  if (type === "Polygon") return coordinates.map(makeRing).join(" ");
  if (type === "MultiPolygon") return coordinates.flatMap(polygon => polygon.map(makeRing)).join(" ");
  return "";
}

function createSvg(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function addSpecialIcon(group, type) {
  group.appendChild(createSvg("circle", { cx: 0, cy: 0, r: 11, class: "special-shell" }));
  if (type === "space") {
    group.appendChild(createSvg("rect", { x: -5, y: -6, width: 10, height: 12, rx: 1, class: "special-glyph" }));
    [-3, 1].forEach(x => [-3, 1].forEach(y => group.appendChild(createSvg("rect", { x, y, width: 2, height: 2, class: "special-window" }))));
  } else if (type === "school") {
    group.appendChild(createSvg("path", { d: "M-7,-2 L0,-7 L7,-2 Z M-5,-1 H5 V6 H-5 Z", class: "special-glyph" }));
    group.appendChild(createSvg("line", { x1: -7, y1: 7, x2: 7, y2: 7, class: "special-stroke" }));
  } else if (type === "event") {
    group.appendChild(createSvg("path", { d: "M-6,-6 H6 V-2 C6,2 3,5 0,5 C-3,5 -6,2 -6,-2 Z M0,5 V8 M-4,8 H4", class: "special-glyph special-trophy" }));
  } else {
    group.appendChild(createSvg("circle", { cx: 0, cy: 0, r: 6, class: "special-coming" }));
    group.appendChild(createSvg("circle", { cx: 0, cy: 0, r: 1.8, class: "special-coming-dot" }));
  }
}

function renderSpecialMarkers() {
  specialProjects.forEach((item, index) => {
    const [x, y] = project(item.lon, item.lat);
    const group = createSvg("g", {
      class: `special-marker map-type-${item.type}`,
      transform: `translate(${x} ${y})`,
      tabindex: "0",
      role: "button",
      "data-map-type": item.type,
      "data-special-index": index
    });
    const leader = createSvg("line", { x1: 0, y1: 0, x2: item.dx, y2: item.dy, class: "special-leader" });
    const anchor = createSvg("g", { class: "special-anchor" });
    anchor.appendChild(createSvg("circle", { cx: 0, cy: 0, r: 4.6, class: "special-anchor-ring" }));
    anchor.appendChild(createSvg("circle", { cx: 0, cy: 0, r: 1.8, class: "special-anchor-dot" }));
    const icon = createSvg("g", { class: "special-icon", transform: `translate(${item.dx} ${item.dy})` });
    addSpecialIcon(icon, item.type);
    const labelOffsetY = item.dy >= 0 ? item.dy + 28 : item.dy - 28;
    const label = createSvg("g", { class: "special-label", transform: `translate(${item.dx} ${labelOffsetY})` });
    const width = Math.max(78, item.name.length * 10 + 18);
    label.appendChild(createSvg("rect", { x: -width / 2, y: -14, width, height: 28, rx: 4 }));
    const text = createSvg("text", { x: 0, y: 4, "text-anchor": "middle" });
    text.textContent = item.name;
    label.appendChild(text);
    group.append(leader, anchor, icon, label);
    group.addEventListener("click", () => {
      pinnedCity = null;
      pinnedSpecial = index;
      showSpecial(index, true);
    });
    group.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        group.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
    });
    specialMarkerLayer.appendChild(group);
  });
}

function renderMap(geo) {
  geo.features.forEach(feature => {
    const d = featurePath(feature);
    const glow = createSvg("path", { d, class: "province-glow" });
    const path = createSvg("path", { d, class: "province-shape" });
    glowLayer.appendChild(glow);
    shapeLayer.appendChild(path);
  });
  const [hubX, hubY] = project(120.15, 30.28);
  projectData.forEach((city, index) => {
    const [x, y] = project(city[2], city[3]);
    if (index > 0) routeLayer.appendChild(createSvg("path", { d: `M${hubX},${hubY} Q${(hubX + x) / 2},${Math.min(hubY, y) - 28} ${x},${y}`, class: "route-line" }));
    const group = createSvg("g", { class: "city-marker map-type-drama", tabindex: "0", role: "button", "data-index": index, "data-map-type": "drama" });
    const line = createSvg("line", { x1: x, y1: y, x2: x + city[4], y2: y + city[5], class: "city-leader" });
    const anchor = createSvg("g", { class: "city-anchor", transform: `translate(${x} ${y})` });
    anchor.appendChild(createSvg("circle", { cx: 0, cy: 0, r: 3.8, class: "city-anchor-ring" }));
    anchor.appendChild(createSvg("circle", { cx: 0, cy: 0, r: 1.5, class: "city-anchor-dot" }));
    const iconWrap = createSvg("g", { transform: `translate(${x + city[4]} ${y + city[5]})` });
    const icon = createSvg("g", { class: "city-icon" });
    const dot = createSvg("circle", { cx: 0, cy: 0, r: 4.5, class: "city-dot" });
    const pulse = createSvg("circle", { cx: 0, cy: 0, r: 10, class: "city-pulse" });
    icon.append(pulse, dot);
    iconWrap.appendChild(icon);
    const labelX = x + city[4];
    const labelY = y + city[5];
    const label = createSvg("g", { class: "city-label" });
    const width = city[0].length > 4 ? 72 : 52;
    label.appendChild(createSvg("rect", { x: labelX - width / 2, y: labelY - 14, width, height: 28, rx: 4 }));
    const text = createSvg("text", { x: labelX, y: labelY + 4, "text-anchor": "middle" });
    text.textContent = city[0];
    label.appendChild(text);
    group.append(line, anchor, iconWrap, label);
    group.addEventListener("click", () => {
      pinnedCity = index;
      pinnedSpecial = null;
      showCity(index, true);
    });
    group.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        group.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      }
    });
    markerLayer.appendChild(group);
  });
  renderSpecialMarkers();
}

function populateCity(index) {
  const city = projectData[index];
  document.querySelector("[data-region]").textContent = city[1];
  document.querySelector("[data-city]").textContent = city[0];
  document.querySelector("[data-project-count]").textContent = `${city[6]} 个合作项目`;
  document.querySelector("[data-cover]").src = city[11];
  document.querySelector("[data-category]").textContent = city[9];
  document.querySelector("[data-location]").textContent = city[8];
  document.querySelector("[data-work]").textContent = city[7];
  document.querySelector("[data-description]").textContent = city[10];
  document.querySelector("[data-panel-action]").innerHTML = "我要合作 <span>↗</span>";
  currentPanelAction = { type: "join", direction: `${city[0]}精品短剧合作`, title: `申请合作${city[7]}` };
  currentFeaturedAction = { type: "trailer", title: city[7], image: city[11] };
  const works = additionalCityWorks[index] || [];
  document.querySelector("[data-work-list]").classList.toggle("has-work-cards", works.length > 0);
  document.querySelector("[data-work-list]").innerHTML = works.map((work, workIndex) => `<button class="city-work-card" type="button" data-map-trailer data-trailer-name="${work.title}"><img src="${work.image}" alt="${work.title}海报"><span>0${workIndex + 2}</span><div><strong>${work.title}</strong><small>${work.location}</small><p>${work.description}</p></div><em>↗</em></button>`).join("");
}

function populateSpecial(index) {
  const item = specialProjects[index];
  document.querySelector("[data-region]").textContent = item.region;
  document.querySelector("[data-city]").textContent = item.city;
  document.querySelector("[data-project-count]").textContent = item.count;
  document.querySelector("[data-cover]").src = item.image;
  document.querySelector("[data-category]").textContent = item.category;
  document.querySelector("[data-location]").textContent = item.location;
  document.querySelector("[data-work]").textContent = item.title;
  document.querySelector("[data-description]").textContent = item.description;
  document.querySelector("[data-panel-action]").innerHTML = `${item.action} <span>↗</span>`;
  document.querySelector("[data-work-list]").classList.remove("has-work-cards");
  document.querySelector("[data-work-list]").innerHTML = item.items.map((detail, detailIndex) => `<div class="detail-row"><span>0${detailIndex + 1}</span><div><strong>${detail[0]}</strong><small>${detail[1]}</small></div></div>`).join("");
  if (item.href) currentPanelAction = { type: "href", value: item.href };
  else if (item.joinDirection) currentPanelAction = { type: "join", direction: item.joinDirection, title: item.joinTitle };
  else if (item.target) currentPanelAction = { type: "target", value: item.target };
  else currentPanelAction = { type: "toast", message: item.message || `${item.title}正在筹备中` };
  currentFeaturedAction = currentPanelAction;
}

function populateAdditionalWork(cityIndex, workIndex) {
  const city = projectData[cityIndex];
  const work = additionalCityWorks[cityIndex][workIndex];
  const district = work.location.split("·")[0].trim();
  document.querySelector("[data-region]").textContent = `${city[1]} · ${city[0]}`;
  document.querySelector("[data-city]").textContent = district;
  document.querySelector("[data-project-count]").textContent = "精品短剧";
  document.querySelector("[data-cover]").src = work.image;
  document.querySelector("[data-category]").textContent = work.location.split("·")[1]?.trim() || "合作短剧";
  document.querySelector("[data-location]").textContent = `${city[1]}${city[0]}${district}`;
  document.querySelector("[data-work]").textContent = work.title;
  document.querySelector("[data-description]").textContent = work.description;
  document.querySelector("[data-work-list]").classList.remove("has-work-cards");
  document.querySelector("[data-work-list]").innerHTML = "";
  document.querySelector("[data-panel-action]").innerHTML = "我要合作 <span>↗</span>";
  currentPanelAction = { type: "join", direction: `${district}精品短剧合作`, title: `申请合作${work.title}` };
  currentFeaturedAction = { type: "trailer", title: work.title, image: work.image };
}

function getDetailPoints(areaCode) {
  const points = [];
  projectData.forEach((city, cityIndex) => {
    if (projectAreaCodes[cityIndex] !== areaCode) return;
    points.push({ type: "drama", target: projectDistrictNames[cityIndex], name: city[7], lon: city[2], lat: city[3], kind: "city", cityIndex });
    (additionalCityWorks[cityIndex] || []).forEach((work, workIndex) => {
      points.push({ type: "drama", target: work.location.split("·")[0].trim(), name: work.title, kind: "work", cityIndex, workIndex });
    });
  });
  specialProjects.forEach((item, specialIndex) => {
    if (specialAreaCodes[specialIndex] !== areaCode) return;
    points.push({ type: item.type, target: item.city, name: item.title, lon: item.lon, lat: item.lat, kind: "special", specialIndex });
  });
  return points;
}

function activateDetailPoint(point) {
  if (point.kind === "city") populateCity(point.cityIndex);
  else if (point.kind === "work") populateAdditionalWork(point.cityIndex, point.workIndex);
  else populateSpecial(point.specialIndex);
  mapShell.classList.add("is-detail-visible");
  storyPanel.setAttribute("aria-hidden", "false");
  document.querySelectorAll(".detail-project-marker").forEach(marker => marker.classList.toggle("is-active", marker.dataset.pointKey === point.key));
}

function renderDistrictMarker(point, detailProject, featureByName, duplicateIndex) {
  const feature = featureByName.get(point.target);
  const fallback = feature?.properties?.centroid || feature?.properties?.center;
  const coordinates = fallback || (point.lon && point.lat ? [point.lon, point.lat] : null);
  if (!coordinates) return;
  const [baseX, baseY] = detailProject(coordinates[0], coordinates[1]);
  const angle = duplicateIndex * 1.9;
  const offset = duplicateIndex ? 11 + duplicateIndex * 2 : 0;
  const x = baseX + Math.cos(angle) * offset;
  const y = baseY + Math.sin(angle) * offset;
  const group = createSvg("g", { class: `detail-project-marker map-type-${point.type}`, transform: `translate(${x} ${y}) scale(.24)`, tabindex: "0", role: "button", "data-map-type": point.type, "data-point-key": point.key });
  group.appendChild(createSvg("circle", { cx: 0, cy: 0, r: 7, class: "district-project-ring" }));
  group.appendChild(createSvg("circle", { cx: 0, cy: 0, r: 4.5, class: "district-project-core" }));
  const label = createSvg("g", { class: "district-marker-label", transform: "translate(0 20)" });
  const labelText = point.target.length > 7 ? point.target.slice(0, 7) : point.target;
  const width = Math.max(48, labelText.length * 11 + 16);
  label.appendChild(createSvg("rect", { x: -width / 2, y: -12, width, height: 24, rx: 3 }));
  const text = createSvg("text", { x: 0, y: 4 });
  text.textContent = labelText;
  label.appendChild(text);
  group.appendChild(label);
  group.addEventListener("click", () => activateDetailPoint(point));
  group.addEventListener("keydown", event => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      activateDetailPoint(point);
    }
  });
  districtMarkerLayer.appendChild(group);
}

async function renderDistrictMap(areaCode, activePoint) {
  currentAreaCode = areaCode;
  districtSummary = null;
  document.querySelector("[data-map-status]").textContent = "正在加载区县级行政边界";
  updateMapContext();
  let geo = districtCache.get(areaCode);
  if (!geo) {
    const response = await fetch(`maps/${areaCode}.json`);
    if (!response.ok) throw new Error("district map unavailable");
    geo = await response.json();
    districtCache.set(areaCode, geo);
  }
  if (currentAreaCode !== areaCode) return;
  districtGlowLayer.replaceChildren();
  districtShapeLayer.replaceChildren();
  districtLabelLayer.replaceChildren();
  districtMarkerLayer.replaceChildren();
  const geoBounds = getGeoBounds(geo);
  selectedMapFocus = project((geoBounds.minLon + geoBounds.maxLon) / 2, (geoBounds.minLat + geoBounds.maxLat) / 2);
  const detailProject = project;
  const detailPoints = getDetailPoints(areaCode).map((point, index) => ({ ...point, key: `${point.kind}-${point.cityIndex ?? point.specialIndex}-${point.workIndex ?? 0}-${index}` }));
  const featureByName = new Map(geo.features.map(feature => [feature.properties.name, feature]));
  const relatedNames = new Set(detailPoints.map(point => point.target));
  geo.features.forEach(feature => {
    const name = feature.properties.name;
    const d = detailFeaturePath(feature, detailProject);
    districtGlowLayer.appendChild(createSvg("path", { d, class: "district-glow" }));
    const path = createSvg("path", { d, class: `district-shape${relatedNames.has(name) ? " is-related" : ""}`, "data-district-name": name });
    const title = createSvg("title");
    title.textContent = name;
    path.appendChild(title);
    const matchingPoint = detailPoints.find(point => point.target === name);
    if (matchingPoint) path.addEventListener("click", () => activateDetailPoint(matchingPoint));
    districtShapeLayer.appendChild(path);
  });
  const labelSlots = [];
  const labelOffsets = [[0, 0], [0, -5], [6, 0], [-6, 0], [0, 5], [7, -5], [-7, -5], [7, 5], [-7, 5], [0, -10], [10, 0], [-10, 0], [10, -8], [-10, -8]];
  [...geo.features].sort((a, b) => Number(relatedNames.has(b.properties.name)) - Number(relatedNames.has(a.properties.name))).forEach(feature => {
    const name = feature.properties.name;
    const center = feature.properties.centroid || feature.properties.center;
    if (center) {
      const [x, y] = detailProject(center[0], center[1]);
      const labelWidth = Math.max(7, name.length * 2.15);
      const labelHeight = 3.6;
      const offset = labelOffsets.find(([dx, dy]) => !labelSlots.some(slot => Math.abs((x + dx) - slot.x) < (labelWidth + slot.width) / 2 + 1 && Math.abs((y + dy) - slot.y) < (labelHeight + slot.height) / 2 + .8));
      if (!offset) return;
      const labelX = x + offset[0];
      const labelY = y + offset[1];
      labelSlots.push({ x: labelX, y: labelY, width: labelWidth, height: labelHeight });
      if (offset[0] || offset[1]) districtLabelLayer.appendChild(createSvg("line", { x1: x, y1: y, x2: labelX, y2: labelY, class: "district-label-guide" }));
      const label = createSvg("text", { x: labelX, y: labelY + .8, class: "district-label" });
      label.textContent = name;
      districtLabelLayer.appendChild(label);
    }
  });
  const duplicateCounter = new Map();
  detailPoints.forEach(point => {
    const count = duplicateCounter.get(point.target) || 0;
    duplicateCounter.set(point.target, count + 1);
    renderDistrictMarker(point, detailProject, featureByName, count);
  });
  districtSummary = { featureCount: geo.features.length, projectCount: detailPoints.length };
  mapBackButton.hidden = false;
  applyMapFilter(currentMapFilter);
  if (activePoint) {
    const keyPoint = detailPoints.find(point => point.kind === activePoint.kind && point.cityIndex === activePoint.cityIndex && point.specialIndex === activePoint.specialIndex);
    if (keyPoint) document.querySelectorAll(".detail-project-marker").forEach(marker => marker.classList.toggle("is-active", marker.dataset.pointKey === keyPoint.key));
  }
  updateMapContext();
}

function returnToNationalMap() {
  currentAreaCode = null;
  districtSummary = null;
  selectedMapFocus = null;
  mapShell.classList.remove("is-district-visible", "is-detail-visible");
  storyPanel.setAttribute("aria-hidden", "true");
  districtGlowLayer.replaceChildren();
  districtShapeLayer.replaceChildren();
  districtLabelLayer.replaceChildren();
  districtMarkerLayer.replaceChildren();
  animateMapView(baseMapView, 240);
}

function applyMapFilter(type, syncPanel = false) {
  currentMapFilter = type;
  document.querySelectorAll("[data-map-type]").forEach(marker => marker.classList.toggle("is-filtered-out", type !== "all" && marker.dataset.mapType !== type));
  if (!syncPanel || !currentAreaCode || type === "all") return;
  const firstMatch = document.querySelector(`.detail-project-marker[data-map-type="${type}"]`);
  if (firstMatch) firstMatch.dispatchEvent(new MouseEvent("click", { bubbles: true }));
  else hidePanel();
}

function showCity(index, pinned = false) {
  populateCity(index);
  selectedMapFocus = project(projectData[index][2], projectData[index][3]);
  mapShell.classList.add("is-detail-visible");
  storyPanel.setAttribute("aria-hidden", "false");
  document.querySelectorAll(".city-marker").forEach(marker => {
    const selected = Number(marker.dataset.index) === index;
    marker.classList.toggle("is-preview", selected && !pinned);
    marker.classList.toggle("is-active", selected && (pinned || pinnedCity === index));
  });
  document.querySelectorAll(".special-marker").forEach(marker => marker.classList.remove("is-active", "is-preview"));
  renderDistrictMap(projectAreaCodes[index], { kind: "city", cityIndex: index }).catch(() => showToast("区县地图加载失败，请稍后重试"));
}

function showSpecial(index, pinned = false) {
  populateSpecial(index);
  selectedMapFocus = project(specialProjects[index].lon, specialProjects[index].lat);
  mapShell.classList.add("is-detail-visible");
  storyPanel.setAttribute("aria-hidden", "false");
  document.querySelectorAll(".city-marker").forEach(marker => marker.classList.remove("is-active", "is-preview"));
  document.querySelectorAll(".special-marker").forEach(marker => {
    const selected = Number(marker.dataset.specialIndex) === index;
    marker.classList.toggle("is-preview", selected && !pinned);
    marker.classList.toggle("is-active", selected && (pinned || pinnedSpecial === index));
  });
  renderDistrictMap(specialAreaCodes[index], { kind: "special", specialIndex: index }).catch(() => showToast("区县地图加载失败，请稍后重试"));
}

function hidePanel() {
  mapShell.classList.remove("is-detail-visible");
  storyPanel.setAttribute("aria-hidden", "true");
  document.querySelectorAll(".city-marker").forEach(marker => marker.classList.remove("is-preview", "is-active"));
  document.querySelectorAll(".special-marker").forEach(marker => marker.classList.remove("is-preview", "is-active"));
}

fetch("china.geo.json").then(response => response.json()).then(renderMap).catch(() => {
  showToast("地图数据加载失败，请刷新重试");
});
populateCity(0);

document.querySelectorAll("[data-map-filter]").forEach(button => {
  button.addEventListener("click", () => {
    const type = button.dataset.mapFilter;
    document.querySelectorAll("[data-map-filter]").forEach(item => item.classList.toggle("is-active", item === button));
    applyMapFilter(type, true);
    pinnedCity = null;
    pinnedSpecial = null;
  });
});

mapBackButton.addEventListener("click", returnToNationalMap);
mapResetButton.addEventListener("click", returnToNationalMap);
mapZoomInButton.addEventListener("click", () => zoomMap(currentMapZoom * 1.5));
mapZoomOutButton.addEventListener("click", () => zoomMap(currentMapZoom / 1.5));

svg.addEventListener("wheel", event => {
  event.preventDefault();
  zoomMap(currentMapZoom * (event.deltaY < 0 ? 1.28 : 1 / 1.28), event);
}, { passive: false });

svg.addEventListener("pointerdown", event => {
  if (event.button !== 0 || event.target.closest(".city-marker,.special-marker,.detail-project-marker")) return;
  if (mapViewAnimation) cancelAnimationFrame(mapViewAnimation);
  mapViewAnimation = null;
  mapPointerState = { id: event.pointerId, x: event.clientX, y: event.clientY, view: { ...currentMapView } };
  svg.setPointerCapture(event.pointerId);
  svg.classList.add("is-panning");
});

svg.addEventListener("pointermove", event => {
  if (!mapPointerState || mapPointerState.id !== event.pointerId) return;
  const rect = svg.getBoundingClientRect();
  const dx = (event.clientX - mapPointerState.x) * (mapPointerState.view.width / rect.width);
  const dy = (event.clientY - mapPointerState.y) * (mapPointerState.view.height / rect.height);
  renderMapView({ ...mapPointerState.view, x: mapPointerState.view.x - dx, y: mapPointerState.view.y - dy });
});

function finishMapPan(event) {
  if (!mapPointerState || mapPointerState.id !== event.pointerId) return;
  if (svg.hasPointerCapture(event.pointerId)) svg.releasePointerCapture(event.pointerId);
  mapPointerState = null;
  svg.classList.remove("is-panning");
}

svg.addEventListener("pointerup", finishMapPan);
svg.addEventListener("pointercancel", finishMapPan);
renderMapView(baseMapView);

const joinModal = document.querySelector("[data-join-modal]");
const joinDialog = joinModal.querySelector(".join-dialog");
const joinForm = document.querySelector("[data-join-form]");
const formSuccess = document.querySelector("[data-form-success]");
const submitButton = document.querySelector("[data-submit-form]");
const trailerModal = document.querySelector("[data-trailer-modal]");
const toast = document.querySelector("[data-toast]");
const opcCitySelect = document.querySelector("[data-opc-city]");
const opcActionButton = document.querySelector("[data-opc-action]");
const opcCommunities = {
  "杭州": { scale: 38, copy: "聚合本地漫剧制作团队，共享剧本、算力、项目协作与发行资源。" },
  "成都": { scale: 27, copy: "连接都市剧情与动态分镜团队，协同承接制作和发行项目。" },
  "广州": { scale: 21, copy: "聚焦科幻视觉与出海内容制作，连接海外发行合作机会。" }
};
let toastTimer;
let videoTimer;
let videoSeconds = 0;

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2800);
}

function openJoinModal(direction, options = {}) {
  const isSpace = direction.includes("云谷") || direction.includes("永嘉");
  joinForm.reset();
  joinForm.hidden = false;
  formSuccess.hidden = true;
  submitButton.disabled = false;
  submitButton.textContent = "提交申请";
  joinDialog.classList.toggle("is-space-form", isSpace);
  document.querySelector("[data-form-title]").textContent = options.title || (direction === "商务合作" ? "提交商务合作申请" : `申请加入${direction}`);
  document.querySelector("[data-form-subtitle]").textContent = isSpace
    ? "请留下团队信息，空间运营人员将在审核后与您联系。"
    : "提交申请后，我们将在审核后与您联系。";
  document.querySelector("[data-form-direction]").value = direction;
  ["city", "model", "portfolio"].forEach(name => {
    const field = joinForm.elements[name];
    field.disabled = isSpace;
    if (name === "city") field.required = !isSpace;
  });
  if (options.city) {
    joinForm.elements.city.disabled = false;
    joinForm.elements.city.required = true;
    joinForm.elements.city.value = options.city;
    joinForm.elements.city.readOnly = true;
  } else joinForm.elements.city.readOnly = false;
  joinModal.hidden = false;
  document.body.classList.add("has-modal");
  setTimeout(() => joinForm.elements.company.focus(), 30);
}

function updateOpcCommunity(city) {
  const community = opcCommunities[city];
  const exists = Boolean(community);
  document.querySelector("[data-opc-city-name]").textContent = city;
  document.querySelector("[data-opc-state]").textContent = exists ? "社区已建立" : "等待首位发起人";
  document.querySelector("[data-opc-scale]").textContent = exists ? community.scale : 0;
  document.querySelector("[data-opc-city-copy]").textContent = exists
    ? community.copy
    : "该城市尚未建立官方线上社区。提交创建申请并通过审核后，你将成为首批共建成员。";
  opcActionButton.innerHTML = `${exists ? "申请加入" : "申请创建"}${city}社区 <b>→</b>`;
  opcActionButton.dataset.mode = exists ? "join" : "create";
  document.querySelector("[data-opc-city-result]").classList.toggle("is-create", !exists);
}

function closeModal(layer) {
  layer.hidden = true;
  if (layer === trailerModal) resetVideoPlayer();
  if (joinModal.hidden && trailerModal.hidden) document.body.classList.remove("has-modal");
}

function updateVideoPlayer() {
  const progress = Math.min(100, (videoSeconds / 45) * 100);
  document.querySelector("[data-video-progress]").style.width = `${progress}%`;
  document.querySelector("[data-video-time]").textContent = `00:${String(videoSeconds).padStart(2, "0")}`;
}

function resetVideoPlayer() {
  clearInterval(videoTimer);
  videoSeconds = 0;
  updateVideoPlayer();
  const toggle = document.querySelector("[data-video-toggle]");
  toggle.classList.remove("is-playing");
  toggle.querySelector("b").textContent = "播放片花";
}

function openTrailer(title, image) {
  document.querySelector("[data-trailer-title]").textContent = `${title} · 高光片花`;
  if (image) document.querySelector(".trailer-player > img").src = image;
  resetVideoPlayer();
  trailerModal.hidden = false;
  document.body.classList.add("has-modal");
}

document.querySelectorAll("[data-join]").forEach(button => button.addEventListener("click", () => openJoinModal(button.dataset.join)));
opcCitySelect.addEventListener("change", () => updateOpcCommunity(opcCitySelect.value));
opcActionButton.addEventListener("click", () => {
  const city = opcCitySelect.value;
  const action = opcActionButton.dataset.mode === "create" ? "创建" : "加入";
  openJoinModal(`${city}线上OPC社区`, { city, title: `申请${action}${city}线上OPC社区` });
});
updateOpcCommunity(opcCitySelect.value);

document.addEventListener("click", event => {
  const trigger = event.target.closest("[data-trailer], [data-map-trailer]");
  if (!trigger) return;
  const title = trigger.dataset.trailer || trigger.dataset.trailerName || document.querySelector("[data-work]").textContent;
  const image = trigger.querySelector("img")?.src || document.querySelector("[data-cover]").src;
  openTrailer(title, image);
});

function runPanelAction(action) {
  if (!action) return;
  if (action.type === "trailer") openTrailer(action.title, action.image);
  else if (action.type === "href") window.open(action.value, "_blank", "noopener,noreferrer");
  else if (action.type === "join") openJoinModal(action.direction, { title: action.title });
  else if (action.type === "target") {
    const target = document.querySelector(action.value);
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    else showToast("项目正在筹备中，合作信息将持续更新");
  }
  else showToast(action.message);
}

document.querySelector("[data-featured-work]").addEventListener("click", () => runPanelAction(currentFeaturedAction));
document.querySelector("[data-featured-work]").addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    runPanelAction(currentFeaturedAction);
  }
});
document.querySelector("[data-panel-action]").addEventListener("click", () => runPanelAction(currentPanelAction));
document.querySelector("[data-panel-close]").addEventListener("click", () => {
  pinnedCity = null;
  pinnedSpecial = null;
  hidePanel();
});

const carousel = document.querySelector("[data-carousel]");
const carouselSlides = [...document.querySelectorAll("[data-slide]")];
const carouselDots = [...document.querySelectorAll("[data-carousel-dot]")];
let carouselIndex = 0;
let carouselTimer;

function showCarouselSlide(index) {
  carouselIndex = (index + carouselSlides.length) % carouselSlides.length;
  carouselSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-current", slideIndex === carouselIndex);
    slide.classList.toggle("is-prev", slideIndex === (carouselIndex - 1 + carouselSlides.length) % carouselSlides.length);
    slide.classList.toggle("is-next", slideIndex === (carouselIndex + 1) % carouselSlides.length);
  });
  carouselDots.forEach((dot, dotIndex) => dot.classList.toggle("is-active", dotIndex === carouselIndex));
}

function startCarousel() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(() => showCarouselSlide(carouselIndex + 1), 3000);
}

document.querySelector("[data-carousel-prev]").addEventListener("click", () => { showCarouselSlide(carouselIndex - 1); startCarousel(); });
document.querySelector("[data-carousel-next]").addEventListener("click", () => { showCarouselSlide(carouselIndex + 1); startCarousel(); });
carouselDots.forEach(dot => dot.addEventListener("click", () => { showCarouselSlide(Number(dot.dataset.carouselDot)); startCarousel(); }));
carousel.addEventListener("mouseenter", () => clearInterval(carouselTimer));
carousel.addEventListener("mouseleave", startCarousel);
document.querySelectorAll("[data-banner-city]").forEach(banner => banner.addEventListener("click", () => {
  const index = Number(banner.dataset.bannerCity);
  pinnedCity = index;
  pinnedSpecial = null;
  showCity(index, true);
  document.querySelector("#map").scrollIntoView({ behavior: "smooth", block: "center" });
}));
document.querySelectorAll("[data-banner-target]").forEach(banner => banner.addEventListener("click", () => {
  document.querySelector(banner.dataset.bannerTarget)?.scrollIntoView({ behavior: "smooth", block: "start" });
}));
showCarouselSlide(0);
startCarousel();

document.querySelectorAll("[data-modal-close]").forEach(button => button.addEventListener("click", () => closeModal(button.closest(".modal-layer"))));
[joinModal, trailerModal].forEach(layer => layer.addEventListener("click", event => { if (event.target === layer) closeModal(layer); }));
document.addEventListener("keydown", event => {
  if (event.key !== "Escape") return;
  if (!joinModal.hidden) closeModal(joinModal);
  if (!trailerModal.hidden) closeModal(trailerModal);
});

joinForm.addEventListener("submit", event => {
  event.preventDefault();
  submitButton.disabled = true;
  submitButton.textContent = "提交中...";
  setTimeout(() => {
    joinForm.hidden = true;
    formSuccess.hidden = false;
    submitButton.disabled = false;
    submitButton.textContent = "提交申请";
  }, 900);
});

document.querySelector("[data-success-close]").addEventListener("click", () => {
  closeModal(joinModal);
  showToast("申请已提交，审核通过后将计入社群人数");
});

document.querySelector("[data-video-toggle]").addEventListener("click", event => {
  const button = event.currentTarget;
  const playing = button.classList.toggle("is-playing");
  button.querySelector("b").textContent = playing ? "播放中" : "播放片花";
  clearInterval(videoTimer);
  if (playing) {
    videoTimer = setInterval(() => {
      videoSeconds += 1;
      if (videoSeconds >= 45) {
        resetVideoPlayer();
        return;
      }
      updateVideoPlayer();
    }, 1000);
  }
});

document.querySelector("[data-gallery]")?.addEventListener("click", () => showToast("结业成果画廊已打开"));
