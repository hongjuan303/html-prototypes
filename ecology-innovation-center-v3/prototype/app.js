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
  { type: "event", name: "雁荡山杯", lon: 121.08, lat: 28.37, dx: 87, dy: 36, region: "浙江省 · 温州市", city: "乐清市", count: "创作赛事", category: "技能大赛", location: "温州 · 雁荡山", title: "雁荡山杯文旅OPC技能大赛", description: "聚焦文旅内容与OPC创作能力，面向全国创作团队开放主题赛题、产业资源与成果展示机会。", image: "assets/posters/xun-tian-ji.jpg", items: [["赛事方向", "文旅内容与漫剧创作"], ["参赛对象", "OPC团队与专业创作者"], ["赛事状态", "已结束"]], action: "已结束", disabled: true },
  { type: "event", name: "大广赛·即将开启", lon: 116.4, lat: 39.9, dx: 80, dy: -38, region: "北京市", city: "北京", count: "创作赛事", category: "营销创作", location: "北京", title: "大广赛营销创客单元竞赛", description: "连接高校创意人才与产业真实命题，探索人工智能内容创作、品牌表达与青年创新实践。", image: "../ai-drama-website-optimization/assets/qa-banner-1.jpg", items: [["赛事方向", "品牌营销与内容创新"], ["参赛对象", "高校学生与青年创作者"], ["赛事状态", "即将开启"]], action: "敬请期待", message: "大广赛营销创客单元竞赛即将开启" },
  { type: "coming", name: "新疆·即将呈现", lon: 87.6, lat: 43.8, dx: -22, dy: -34, region: "新疆维吾尔自治区", city: "新疆", count: "筹备项目", category: "即将呈现", location: "新疆维吾尔自治区", title: "辽阔边疆与多元文化，等待被镜头重新发现", description: "围绕地域文化、自然景观与多民族生活展开内容调研，新的城市故事正在筹备中。", image: "assets/coming-regions.jpg", items: [["内容方向", "地域文化与自然人文"], ["当前阶段", "前期调研与合作洽谈"], ["合作机会", "面向本地机构与创作者开放"]], action: "查看筹备方向", target: ".coming-projects" },
  { type: "coming", name: "三星堆·即将呈现", lon: 104.23, lat: 31.0, dx: -79, dy: -50, region: "四川省 · 德阳市", city: "广汉市", count: "筹备项目", category: "即将呈现", location: "四川 · 三星堆", title: "让古蜀文明穿越时间，在人工智能影像中焕发新生", description: "以古蜀文明、考古发现与东方想象为内容源头，探索传统文化的年轻化影像表达。", image: "assets/coming-regions.jpg", items: [["内容方向", "古蜀文明与东方想象"], ["当前阶段", "创意策划与资源连接"], ["合作机会", "文化机构与制作团队共创"]], action: "查看筹备方向", target: ".coming-projects" },
  { type: "coming", name: "武夷山·即将呈现", lon: 118.0, lat: 27.75, dx: -94, dy: 68, region: "福建省 · 南平市", city: "武夷山市", count: "筹备项目", category: "即将呈现", location: "福建 · 武夷山", title: "从山水茶韵到东方故事，一场影像共创正在酝酿", description: "围绕武夷山水、茶文化与非遗技艺，策划兼具地域辨识度和传播潜力的精品内容。", image: "assets/coming-regions.jpg", items: [["内容方向", "山水茶韵与非遗文化"], ["当前阶段", "项目策划与伙伴招募"], ["合作机会", "文旅机构与创作者共创"]], action: "查看筹备方向", target: ".coming-projects" }
];

const projectAreaCodes = ["330100", "330200", "330900", "331000", "330700", "330700", "320500", "320500", "450300", "533400", "222400", "440900"];
const projectLocations = [
  { name: "富阳区", level: "district", lon: 119.839599, lat: 29.995217 },
  { name: "宁波市", level: "city", lon: 121.55, lat: 29.87 },
  { name: "舟山市", level: "city", lon: 122.2, lat: 30.0 },
  { name: "天台县", level: "district", lon: 120.977207, lat: 29.145258 },
  { name: "武义县", level: "district", lon: 119.714529, lat: 28.768287 },
  { name: "磐安县", level: "district", lon: 120.559672, lat: 29.037893 },
  { name: "苏州市", level: "city", lon: 120.62, lat: 31.3 },
  { name: "张家港市", level: "district", lon: 120.62796, lat: 31.903366 },
  { name: "桂林市", level: "city", lon: 110.29, lat: 25.27 },
  { name: "香格里拉市", level: "district", lon: 99.822449, lat: 27.902251 },
  { name: "延边州", level: "city", lon: 129.5, lat: 42.9 },
  { name: "高州市", level: "district", lon: 110.969672, lat: 22.02936 }
];
const projectDistrictNames = projectLocations.map(location => location.name);
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
const featuredWork = document.querySelector("[data-featured-work]");
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

function setFeaturedCoverMode(isDrama) {
  featuredWork.removeAttribute("aria-disabled");
  featuredWork.tabIndex = 0;
  featuredWork.classList.toggle("is-portrait-cover", isDrama);
  if (isDrama) {
    featuredWork.style.width = "216px";
    featuredWork.style.height = "384px";
    featuredWork.style.aspectRatio = "9 / 16";
    featuredWork.style.marginLeft = "auto";
    featuredWork.style.marginRight = "auto";
  } else {
    ["width", "height", "aspect-ratio", "margin-left", "margin-right"].forEach(property => featuredWork.style.removeProperty(property));
  }
}

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
    const location = projectLocations[index];
    const [x, y] = project(location.lon, location.lat);
    if (index > 0) routeLayer.appendChild(createSvg("path", { d: `M${hubX},${hubY} Q${(hubX + x) / 2},${Math.min(hubY, y) - 28} ${x},${y}`, class: "route-line" }));
    const group = createSvg("g", { class: "city-marker map-type-drama", tabindex: "0", role: "button", "data-index": index, "data-map-type": "drama", "data-geo-level": location.level });
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
    const width = Math.max(52, location.name.length * 13 + 20);
    label.appendChild(createSvg("rect", { x: labelX - width / 2, y: labelY - 14, width, height: 28, rx: 4 }));
    const text = createSvg("text", { x: labelX, y: labelY + 4, "text-anchor": "middle" });
    text.textContent = location.name;
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
  const location = projectLocations[index];
  storyPanel.classList.add("is-drama-panel");
  setFeaturedCoverMode(true);
  document.querySelector("[data-region]").textContent = city[1];
  document.querySelector("[data-city]").textContent = location.name;
  document.querySelector("[data-project-count]").textContent = "1 个合作项目";
  document.querySelector("[data-cover]").src = city[11];
  document.querySelector("[data-category]").textContent = city[9];
  document.querySelector("[data-location]").textContent = city[8];
  document.querySelector("[data-work]").textContent = city[7];
  document.querySelector("[data-description]").textContent = city[10];
  document.querySelector("[data-panel-action]").innerHTML = "我要合作 <span>↗</span>";
  document.querySelector("[data-panel-action]").disabled = false;
  currentPanelAction = { type: "form", formType: "drama", direction: `${location.name}精品短剧合作`, title: "" };
  currentFeaturedAction = { type: "trailer", title: city[7], image: city[11] };
  document.querySelector("[data-work-list]").classList.remove("has-work-cards");
  document.querySelector("[data-work-list]").innerHTML = "";
}

function populateSpecial(index) {
  const item = specialProjects[index];
  storyPanel.classList.remove("is-drama-panel");
  setFeaturedCoverMode(false);
  document.querySelector("[data-region]").textContent = item.region;
  document.querySelector("[data-city]").textContent = item.city;
  document.querySelector("[data-project-count]").textContent = item.count;
  document.querySelector("[data-cover]").src = item.image;
  document.querySelector("[data-category]").textContent = item.category;
  document.querySelector("[data-location]").textContent = item.location;
  document.querySelector("[data-work]").textContent = item.title;
  document.querySelector("[data-description]").textContent = item.description;
  const panelAction = document.querySelector("[data-panel-action]");
  panelAction.disabled = Boolean(item.disabled);
  panelAction.innerHTML = item.disabled ? item.action : `${item.action} <span>↗</span>`;
  if (item.disabled) {
    featuredWork.setAttribute("aria-disabled", "true");
    featuredWork.tabIndex = -1;
  }
  const details = item.type === "coming" ? (item.items || []) : [];
  document.querySelector("[data-work-list]").classList.remove("has-work-cards");
  document.querySelector("[data-work-list]").innerHTML = details.map((detail, detailIndex) => `<div class="detail-row"><span>0${detailIndex + 1}</span><div><strong>${detail[0]}</strong><small>${detail[1]}</small></div></div>`).join("");
  if (item.disabled) currentPanelAction = null;
  else if (item.formType) currentPanelAction = { type: "form", formType: item.formType, direction: item.title, title: `${item.title}报名申报` };
  else if (item.joinDirection) currentPanelAction = { type: "form", formType: item.type === "school" ? "school" : "opc", direction: item.joinDirection, title: item.joinTitle };
  else if (item.target) currentPanelAction = { type: "target", value: item.target };
  else currentPanelAction = { type: "toast", message: item.message || `${item.title}正在筹备中` };
  currentFeaturedAction = currentPanelAction;
}

function populateAdditionalWork(cityIndex, workIndex) {
  const city = projectData[cityIndex];
  const work = additionalCityWorks[cityIndex][workIndex];
  const district = work.location.split("·")[0].trim();
  const parentCity = /(?:市|州|盟)$/.test(city[0]) ? city[0] : `${city[0]}市`;
  storyPanel.classList.add("is-drama-panel");
  setFeaturedCoverMode(true);
  document.querySelector("[data-region]").textContent = `${city[1]} · ${parentCity}`;
  document.querySelector("[data-city]").textContent = district;
  document.querySelector("[data-project-count]").textContent = "精品短剧";
  document.querySelector("[data-cover]").src = work.image;
  document.querySelector("[data-category]").textContent = work.location.split("·")[1]?.trim() || "合作短剧";
  document.querySelector("[data-location]").textContent = `${city[1]}${parentCity}${district}`;
  document.querySelector("[data-work]").textContent = work.title;
  document.querySelector("[data-description]").textContent = work.description;
  document.querySelector("[data-work-list]").classList.remove("has-work-cards");
  document.querySelector("[data-work-list]").innerHTML = "";
  document.querySelector("[data-panel-action]").innerHTML = "我要合作 <span>↗</span>";
  document.querySelector("[data-panel-action]").disabled = false;
  currentPanelAction = { type: "form", formType: "drama", direction: `${district}精品短剧合作`, title: "" };
  currentFeaturedAction = { type: "trailer", title: work.title, image: work.image };
}

function getDetailPoints(areaCode) {
  const points = [];
  projectData.forEach((city, cityIndex) => {
    if (projectAreaCodes[cityIndex] !== areaCode) return;
    const location = projectLocations[cityIndex];
    points.push({ type: "drama", target: location.name, level: location.level, name: city[7], lon: location.lon, lat: location.lat, kind: "city", cityIndex });
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

function renderDistrictMarker(point, detailProject, featureByName, duplicateIndex, labelSlots, markerSlots) {
  const feature = featureByName.get(point.target);
  const fallback = feature?.properties?.centroid || feature?.properties?.center;
  const coordinates = fallback || (point.lon && point.lat ? [point.lon, point.lat] : null);
  if (!coordinates) return;
  const [baseX, baseY] = detailProject(coordinates[0], coordinates[1]);
  const markerOffsets = [[9, -8], [10, 8], [-10, 8], [-9, -8], [14, 0], [-14, 0], [0, 13], [0, -13], [15, -11], [-15, -11], [15, 11], [-15, 11], [19, 0], [-19, 0], [0, 18], [0, -18]];
  const orderedOffsets = markerOffsets.map((_, index) => markerOffsets[(index + duplicateIndex * 3) % markerOffsets.length]);
  const chosenOffset = orderedOffsets.find(([dx, dy]) => {
    const x = baseX + dx;
    const y = baseY + dy;
    const clearsLabels = !labelSlots.some(slot => Math.abs(x - slot.x) < slot.width / 2 + 2.6 && Math.abs(y - slot.y) < slot.height / 2 + 2.6);
    const clearsMarkers = !markerSlots.some(slot => Math.hypot(x - slot.x, y - slot.y) < 5.5);
    return clearsLabels && clearsMarkers;
  }) || markerOffsets[(duplicateIndex * 3) % markerOffsets.length];
  const x = baseX + chosenOffset[0];
  const y = baseY + chosenOffset[1];
  markerSlots.push({ x, y });
  districtMarkerLayer.appendChild(createSvg("line", { x1: baseX, y1: baseY, x2: x, y2: y, class: "district-project-leader" }));
  const group = createSvg("g", { class: `detail-project-marker map-type-${point.type}`, transform: `translate(${x} ${y}) scale(.24)`, tabindex: "0", role: "button", "data-map-type": point.type, "data-point-key": point.key });
  const title = createSvg("title");
  title.textContent = point.title || point.target;
  group.appendChild(title);
  group.appendChild(createSvg("circle", { cx: 0, cy: 0, r: 7, class: "district-project-ring" }));
  group.appendChild(createSvg("circle", { cx: 0, cy: 0, r: 4.5, class: "district-project-core" }));
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
      const labelWidth = Math.max(8, name.length * 2.8);
      const labelHeight = 4.2;
      const offset = labelOffsets.find(([dx, dy]) => !labelSlots.some(slot => Math.abs((x + dx) - slot.x) < (labelWidth + slot.width) / 2 + 1 && Math.abs((y + dy) - slot.y) < (labelHeight + slot.height) / 2 + .8));
      if (!offset) return;
      const labelX = x + offset[0];
      const labelY = y + offset[1];
      if (offset[0] || offset[1]) districtLabelLayer.appendChild(createSvg("line", { x1: x, y1: y, x2: labelX, y2: labelY, class: "district-label-guide" }));
      const label = createSvg("text", { x: labelX, y: labelY + .8, class: "district-label" });
      label.textContent = name;
      districtLabelLayer.appendChild(label);
      const actualBounds = label.getBBox();
      labelSlots.push({ x: actualBounds.x + actualBounds.width / 2, y: actualBounds.y + actualBounds.height / 2, width: actualBounds.width, height: actualBounds.height });
    }
  });
  const duplicateCounter = new Map();
  const markerSlots = [];
  detailPoints.forEach(point => {
    const count = duplicateCounter.get(point.target) || 0;
    duplicateCounter.set(point.target, count + 1);
    renderDistrictMarker(point, detailProject, featureByName, count, labelSlots, markerSlots);
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
  selectedMapFocus = project(projectLocations[index].lon, projectLocations[index].lat);
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
const formBody = document.querySelector("[data-form-body]");
const trailerModal = document.querySelector("[data-trailer-modal]");
const toast = document.querySelector("[data-toast]");
const opcCitySelect = document.querySelector("[data-opc-city]");
const opcActionButton = document.querySelector("[data-opc-action]");
const opcCommunities = {
  "杭州": { scale: 38, copy: "聚合本地漫剧制作团队，共享剧本、算力、项目协作与发行资源。" },
  "成都": { scale: 27, copy: "连接都市剧情与动态分镜团队，协同承接制作和发行项目。" },
  "广州": { scale: 21, copy: "聚焦科幻视觉与出海内容制作，连接海外发行合作机会。" }
};
const opcMemberWall = document.querySelector("[data-opc-member-wall]");
const opcMemberList = document.querySelector("[data-opc-member-list]");
let toastTimer;
let videoTimer;
let videoSeconds = 0;

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2800);
}

const field = {
  input: (name, label, options = {}) => `<label class="${options.wide ? "form-wide" : ""}"><span>${label}${options.required ? " *" : ""}</span><input name="${name}" ${options.required ? "required" : ""} ${options.type ? `type="${options.type}"` : ""} ${options.pattern ? `pattern="${options.pattern}" maxlength="${options.maxlength || ""}"` : ""} ${options.min ? `min="${options.min}"` : ""} placeholder="${options.placeholder || "请输入"}"></label>`,
  textarea: (name, label, options = {}) => `<label class="form-wide"><span>${label}${options.required ? " *" : ""}</span><textarea name="${name}" ${options.required ? "required" : ""} placeholder="${options.placeholder || "请输入"}"></textarea></label>`,
  radio: (name, label, choices, options = {}) => `<fieldset class="form-choice ${options.wide === false ? "" : "form-wide"}" ${options.hook ? `data-choice-hook="${options.hook}"` : ""}><legend>${label}${options.required ? " *" : ""}</legend><div>${choices.map((choice, index) => `<label><input type="radio" name="${name}" value="${choice}" ${options.required && index === 0 ? "required" : ""}><span>${choice}</span></label>`).join("")}</div></fieldset>`,
  checks: (name, label, choices, required = false) => `<fieldset class="form-choice form-wide"><legend>${label}${required ? " *" : ""}</legend><div>${choices.map((choice, index) => `<label><input type="checkbox" name="${name}" value="${choice}" ${required && index === 0 ? "data-checkbox-required" : ""}><span>${choice}</span></label>`).join("")}</div></fieldset>`,
  file: (name, label, required = false) => `<label class="form-wide form-file"><span>${label}${required ? " *" : ""}</span><input type="file" name="${name}" ${required ? "required" : ""}><small>支持上传文档、图片或视频文件，原型仅演示选择状态</small></label>`
};

const opcPersonalFields = () => `
  <div class="form-grid" data-identity-fields="personal">
    ${field.input("name", "姓名", { required: true, placeholder: "请输入姓名" })}
    ${field.input("phone", "联系手机号", { required: true, type: "tel", pattern: "1[3-9][0-9]{9}", maxlength: "11", placeholder: "请输入11位手机号" })}
    ${field.input("wechat", "微信/企业微信", { required: true, placeholder: "用于业务对接" })}
    <fieldset class="form-location"><legend>所在城市 *</legend><div class="form-location-controls"><select name="province" data-opc-province required aria-label="所在省份"><option value="">请选择省份</option></select><select name="city" data-opc-form-city required disabled aria-label="所在城市"><option value="">请先选择省份</option></select></div></fieldset>
    ${field.textarea("bio", "个人简介", { placeholder: "简述短剧创作经历、擅长题材和代表作品" })}
    ${field.radio("opcRegistration", "是否需要协助注册 OPC 一人公司", ["需要协助咨询注册", "暂不需要，以个人身份参与"], { required: true })}
    <label><span>意向团队规模 *</span><select name="plannedTeamSize" required><option value="">请选择</option><option>1人（独立个人创作）</option><option>2-3人（小型协作小组）</option><option>4-6人</option><option>7人以上，10人以下</option></select></label>
    ${field.radio("physicalSpace", "是否有意向入驻 OPC 实体空间", ["是", "否，仅线上参与生态"], { required: true, hook: "space" })}
    <label data-conditional="workstations" hidden><span>意向工位数 *</span><input name="workstations" type="number" min="1" placeholder="请输入工位数"></label>
    ${field.checks("expertise", "擅长方向", ["AI漫剧", "AI仿真人剧", "精品剧", "运营", "发行", "译配出海", "培训教育", "版权营销", "其他"], true)}
    ${field.radio("hasWorks", "是否有过往短剧作品", ["有", "无"], { required: true, hook: "works" })}
    <div class="form-wide form-conditional" data-conditional="works" hidden>${field.input("portfolioLink", "作品链接", { wide: true, placeholder: "请输入作品链接或网盘地址" })}${field.file("portfolioFile", "作品附件")}</div>
    ${field.checks("projectTypes", "可承接的项目类型", ["产业订单", "精品项目", "赛事创作任务", "IP联合开发"])}
    ${field.checks("resources", "意向资源诉求", ["IP授权", "场地工位", "订单对接", "发行推广", "工商注册咨询", "创业政策辅导", "其他"])}
  </div>`;

const opcTeamFields = () => `<div class="form-grid" data-identity-fields="team" hidden>
  ${field.input("company", "团队/企业名称", { required: true })}${field.input("contact", "对接人姓名", { required: true })}
  ${field.input("phone", "联系手机号", { required: true, type: "tel", pattern: "1[3-9][0-9]{9}", maxlength: "11", placeholder: "请输入11位手机号" })}${field.input("wechat", "微信/企业微信", { required: true })}
  ${field.input("creditCode", "企业统一社会信用代码", { required: true, placeholder: "请输入统一社会信用代码" })}${field.input("teamSize", "现有团队总人数", { required: true, type: "number", min: "1", placeholder: "请输入人数" })}
  ${field.textarea("capability", "团队简介与核心能力", { required: true, placeholder: "介绍业务方向、代表作和核心成员情况" })}${field.input("portfolioLink", "过往作品链接", { wide: true, placeholder: "请输入作品链接或网盘地址" })}${field.file("portfolioFile", "过往作品附件")}
  ${field.checks("expertise", "擅长方向", ["AI漫剧", "AI仿真人剧", "精品剧", "运营", "发行", "译配出海", "教育培训", "版权营销", "其他"])}
  ${field.checks("projectTypes", "可承接项目类型", ["产业订单", "精品项目", "赛事创作", "IP联合开发"])}
  ${field.checks("resources", "意向资源诉求", ["IP素材授权", "场地工位", "订单对接", "发行推广", "工商注册咨询", "创业政策辅导", "其他"])}
  ${field.radio("physicalSpace", "是否有意向入驻 OPC 实体空间", ["是", "否，仅线上参与生态"], { required: true, hook: "space" })}
  <label data-conditional="workstations" hidden><span>意向工位数 *</span><input name="workstations" type="number" min="1" placeholder="请输入工位数"></label>
</div>`;

function getFormConfig(formType, context = {}) {
  if (formType === "school") return { kicker: "产教融合实践", title: context.title || "提交校企合作申请", subtitle: "联合高校共建项目实践班、实训基地、联合课题、学生接单通道与创作赛事。", submit: "提交校企合作申请", success: "申请已提交，我方将在 5-7 个工作日内安排专人对接洽谈合作细节。", body: `<aside class="form-guidance">本表单面向高校院系对接人；在校学生如希望参与创作接单，请前往「加入 OPC 社区」。</aside><div class="form-grid">${field.input("school", "学校全称", { required: true })}${field.input("department", "二级院系/部门", { required: true, placeholder: "如：新闻与传播学院" })}${field.input("contact", "对接负责人", { required: true })}${field.input("position", "职务", { required: true })}${field.input("phone", "联系手机号码", { required: true, type: "tel", pattern: "1[3-9][0-9]{9}", maxlength: "11", placeholder: "请输入11位手机号" })}${field.input("email", "对接邮箱", { required: true, type: "email", placeholder: "用于正式函件、资料往来" })}${field.input("wechat", "微信", { placeholder: "用于日常沟通" })}${field.checks("cooperationModes", "意向合作模式", ["共建AI影视项目实践班", "共建产教融合实训实践基地", "学生实训实习、团队接单通道", "联合开发课程/教学案例库", "联合承办微短剧、AI创作类赛事", "IP联合共创、师生联合内容开发", "其他"], true)}${field.textarea("studentMajors", "可参与的学生专业/年级", { placeholder: "如：数字媒体艺术，本科大二至大四、研究生" })}${field.input("studentScale", "预估每年可参与学生规模", { type: "number", min: "1", placeholder: "请输入人数" })}${field.textarea("foundation", "学校现有基础条件与合作设想", { placeholder: "可填写实验室、师资、课程基础及校方合作诉求" })}${field.checks("resources", "希望获取平台配套资源", ["AI智能体/算力资源开放", "产业项目订单供给", "行业导师进课堂", "IP素材库开放使用", "作品出海发行、成果展示渠道", "创业孵化、政策申报辅导", "其他"], true)}${field.file("attachment", "附件上传")}</div>` };
  if (formType === "drama") return { kicker: "“微短剧+”精品内容合作", title: context.title || "提交精品剧合作申请", subtitle: "面向地方文旅单位、创作团队与企业，联合开展文旅、非遗及城市 IP 精品短剧创制。", submit: "提交精品剧合作申请", success: "申请已提交，我方将在 5-7 个工作日完成材料评估并安排专人对接。", body: `<aside class="form-guidance">创作者如希望长期入驻生态，可前往「加入 OPC 社区」提交申请。</aside><div class="form-grid">${field.radio("entityType", "主体类型", ["个人创作者", "创作团队", "企业单位", "地方文旅/事业单位"], { required: true })}${field.input("entityName", "主体名称", { required: true })}${field.input("contact", "对接人", { required: true })}${field.input("phone", "联系手机号", { required: true, type: "tel", pattern: "1[3-9][0-9]{9}", maxlength: "11", placeholder: "请输入11位手机号" })}${field.input("email", "对接邮箱", { required: true, type: "email" })}${field.input("wechat", "微信/企业微信")}${field.checks("cooperationTypes", "合作类型", ["文旅定制", "非遗主题", "城市形象宣传", "IP联合开发共创", "其他"], true)}${field.input("region", "项目属地地区", { required: true, placeholder: "请输入省/市/区县" })}${field.textarea("intent", "已有 IP/文旅素材及合作意向", { required: true, placeholder: "填写合作背景、题材方向和合作意向" })}${field.input("cases", "过往同类项目案例", { wide: true, placeholder: "请输入案例链接或简要说明" })}</div>` };
  if (formType === "event") return { kicker: "微短剧创作大赛", title: context.title || "提交大赛报名申报", subtitle: "提交剧本或成片作品参赛，优秀作品可获得流量扶持、产业订单、出海发行与 IP 联合开发机会。", submit: "提交大赛报名申报", success: "报名提交成功，将按照对应赛事规则开展后续评审工作，请留意通知。", body: `<aside class="form-guidance">报名赛事：<strong>${context.direction || "当前主题赛事"}</strong> · 报名截止时间以赛事公告为准</aside><div class="form-grid">${field.radio("identity", "参赛身份", ["个人创作者", "创作团队", "企业", "高校师生团队"], { required: true })}${field.input("entrantName", "参赛名称（个人姓名/团队名称）", { required: true })}${field.input("contact", "对接人", { required: true })}${field.input("phone", "联系手机号", { required: true, type: "tel", pattern: "1[3-9][0-9]{9}", maxlength: "11", placeholder: "请输入11位手机号" })}${field.input("email", "联系邮箱", { required: true, type: "email" })}${field.input("wechat", "微信")}${field.textarea("workIntro", "参赛作品名称及简介", { required: true, placeholder: "介绍核心剧情、创作亮点、与命题的契合点，并附网盘链接" })}${field.radio("filing", "是否已备案", ["是", "否"], { required: true, hook: "filing" })}<label data-conditional="filingNumber" hidden><span>备案号 *</span><input name="filingNumber" placeholder="请输入备案号"></label>${field.radio("workStatus", "作品状态", ["剧本阶段", "半成品", "成片完成"], { required: true })}${field.input("workLink", "剧本/成片链接", { required: true, wide: true, placeholder: "请输入网盘或作品链接" })}${field.file("workFile", "剧本/成片附件")}${field.radio("commercial", "是否意向承接赛事衍生商业订单", ["是", "否"], { required: true, hook: "commercial" })}<div class="form-wide" data-conditional="commercialCases" hidden>${field.textarea("commercialCases", "过往案例及团队主创介绍", { required: true, placeholder: "请介绍过往案例和团队主创" })}</div><aside class="form-guidance form-wide">如希望长期接单或入驻生态，可前往「加入 OPC 社区」提交入驻申请。</aside></div>` };
  return { kicker: "AI 影视 OPC 社区入驻申请", title: context.title || "提交入驻申请", subtitle: "面向全国 AI 内容创作者与创作团队，连接订单、精品项目、赛事及产业资源。", submit: "提交入驻申请", success: "提交成功，工作人员将在 3-5 个工作日与您联系对接。", body: `<aside class="form-guidance">个人可选择以自然人接单，或咨询注册 OPC 一人市场主体参与产业项目。</aside>${field.radio("identity", "申请身份", ["个人创作者", "创作团队 / 企业"], { required: true, hook: "identity" })}${opcPersonalFields()}${opcTeamFields()}` };
}

function setConditionalRequired(container, active) {
  container.hidden = !active;
  container.querySelectorAll("input,select,textarea").forEach(control => {
    if (control.dataset.wasRequired === undefined) control.dataset.wasRequired = String(control.required);
    control.required = active && control.dataset.wasRequired === "true";
    control.disabled = !active;
  });
}

function updateOpcCityAvailability() {
  const provinceSelect = formBody.querySelector("[data-opc-province]");
  const citySelect = formBody.querySelector("[data-opc-form-city]");
  if (!provinceSelect || !citySelect) return;
  const isPersonal = !provinceSelect.closest("[data-identity-fields]").hidden;
  provinceSelect.disabled = !isPersonal;
  provinceSelect.required = isPersonal;
  citySelect.disabled = !isPersonal || !provinceSelect.value;
  citySelect.required = isPersonal;
}

function populateOpcCities(provinceName, selectedCity = "") {
  const citySelect = formBody.querySelector("[data-opc-form-city]");
  const province = CHINA_REGIONS.find(region => region.name === provinceName);
  citySelect.replaceChildren(new Option(province ? "请选择城市" : "请先选择省份", ""));
  province?.cities.forEach(city => citySelect.add(new Option(city.name, city.name)));
  citySelect.value = province?.cities.some(city => city.name === selectedCity) ? selectedCity : "";
  updateOpcCityAvailability();
}

function initializeOpcLocation(sourceCity = "") {
  const provinceSelect = formBody.querySelector("[data-opc-province]");
  provinceSelect.replaceChildren(new Option("请选择省份", ""));
  CHINA_REGIONS.forEach(region => provinceSelect.add(new Option(region.name, region.name)));
  // Community cards use short names (杭州); enum values retain full names (杭州市).
  const normalize = name => name.trim().replace(/市$/, "");
  const province = sourceCity ? CHINA_REGIONS.find(region => region.cities.some(city => normalize(city.name) === normalize(sourceCity))) : undefined;
  const city = province?.cities.find(item => normalize(item.name) === normalize(sourceCity));
  provinceSelect.value = province ? province.name : "";
  populateOpcCities(provinceSelect.value, city?.name);
  provinceSelect.addEventListener("change", () => populateOpcCities(provinceSelect.value));
}

function bindDynamicFormRules() {
  formBody.querySelectorAll("[data-checkbox-required]").forEach(first => {
    const group = [...first.closest("fieldset").querySelectorAll('input[type="checkbox"]')];
    const validate = () => first.setCustomValidity(group.some(item => item.checked) ? "" : "请至少选择一项");
    group.forEach(item => item.addEventListener("change", validate));
    validate();
  });
  // Replace the delegated handler when the modal is rebuilt; never stack listeners.
  formBody.onchange = event => {
    const { name, value } = event.target;
    if (name === "identity" && joinForm.elements.formType.value === "opc") {
      setConditionalRequired(formBody.querySelector('[data-identity-fields="personal"]'), value === "个人创作者");
      setConditionalRequired(formBody.querySelector('[data-identity-fields="team"]'), value === "创作团队 / 企业");
      updateOpcCityAvailability();
    }
    if (name === "physicalSpace") setConditionalRequired(event.target.closest('[data-identity-fields]')?.querySelector('[data-conditional="workstations"]'), value === "是");
    if (name === "hasWorks") setConditionalRequired(event.target.closest('[data-identity-fields]')?.querySelector('[data-conditional="works"]'), value === "有");
    if (name === "filing") setConditionalRequired(formBody.querySelector('[data-conditional="filingNumber"]'), value === "是");
    if (name === "commercial") setConditionalRequired(formBody.querySelector('[data-conditional="commercialCases"]'), value === "是");
  };
}

function openApplicationModal(formType, options = {}) {
  const config = getFormConfig(formType, options);
  joinForm.reset();
  joinForm.hidden = false;
  formSuccess.hidden = true;
  submitButton.disabled = false;
  submitButton.textContent = config.submit;
  document.querySelector("[data-form-kicker]").textContent = config.kicker;
  const formTitle = document.querySelector("[data-form-title]");
  formTitle.textContent = options.title ?? config.title;
  formTitle.hidden = !formTitle.textContent;
  document.querySelector("[data-form-subtitle]").textContent = config.subtitle;
  document.querySelector("[data-form-type]").value = formType;
  document.querySelector("[data-form-direction]").value = options.direction || "";
  document.querySelector("[data-success-copy]").textContent = config.success;
  formBody.innerHTML = config.body;
  bindDynamicFormRules();
  if (formType === "opc") {
    setConditionalRequired(formBody.querySelector('[data-identity-fields="personal"]'), true);
    setConditionalRequired(formBody.querySelector('[data-identity-fields="team"]'), false);
    initializeOpcLocation(options.city);
  }
  joinModal.hidden = false;
  document.body.classList.add("has-modal");
  setTimeout(() => joinForm.querySelector("input:not([type=hidden]),select,textarea")?.focus(), 30);
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

function renderOpcCommunities() {
  const communities = Object.entries(opcCommunities);
  opcMemberWall.hidden = communities.length === 0;
  opcMemberList.replaceChildren(...communities.map(([city, community]) => {
    const card = document.createElement("article");
    card.innerHTML = `<div><h4>${city}</h4><strong><b>${community.scale}</b> 位成员</strong></div><button type="button" data-opc-member-join data-city="${city}">申请加入</button>`;
    return card;
  }));
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

document.querySelectorAll("[data-join]").forEach(button => button.addEventListener("click", () => openApplicationModal("drama", { direction: button.dataset.join, title: "提交精品剧合作申请" })));
opcMemberList.addEventListener("click", event => {
  const button = event.target.closest("[data-opc-member-join]");
  if (!button) return;
  const city = button.dataset.city;
  openApplicationModal("opc", { direction: `${city}线上OPC社区`, city, title: `申请加入${city}线上OPC社区` });
});
opcMemberList.addEventListener("wheel", event => {
  if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
  event.preventDefault();
  opcMemberList.scrollLeft += event.deltaY;
}, { passive: false });
opcCitySelect.addEventListener("change", () => updateOpcCommunity(opcCitySelect.value));
opcActionButton.addEventListener("click", () => {
  const city = opcCitySelect.value;
  const action = opcActionButton.dataset.mode === "create" ? "创建" : "加入";
  openApplicationModal("opc", { direction: `${city}线上OPC社区`, city, title: `申请${action}${city}线上OPC社区` });
});
renderOpcCommunities();
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
  else if (action.type === "form") openApplicationModal(action.formType, { direction: action.direction, title: action.title });
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
    submitButton.textContent = getFormConfig(joinForm.elements.formType.value).submit;
  }, 900);
});

document.querySelector("[data-success-close]").addEventListener("click", () => {
  closeModal(joinModal);
  showToast(document.querySelector("[data-success-copy]").textContent);
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
