const projectData = [
  ["杭州", "浙江省", 120.15, 30.28, -66, -54, 7, "《马年限定之新春有约》", "浙江省杭州市富阳区", "文旅短剧", "容量短剧出品的春节年俗轻喜剧，在富阳龙门古镇实地取景，以中外文化碰撞展现年味新表达。", "qa-script-1.jpg"],
  ["宁波", "浙江省", 121.55, 29.87, 44, -36, 1, "《甬忆南侨梦归人》", "浙江省宁波市", "文旅短剧", "讲述马来西亚华侨寻根与抗战历史的红色文旅短剧。", "qa-script-2.jpg"],
  ["舟山", "浙江省", 122.2, 30.0, 79, -6, 1, "《约等于100岁》", "浙江省舟山市", "公益短剧", "以柴山岛上的海岛岁月治愈展现青春成长。", "qa-script-3.jpg"],
  ["台州", "浙江省", 121.42, 28.66, 66, 20, 3, "《寻天记》之和合圣境", "浙江省台州市天台县", "文旅短剧", "融合天台山和合文化与奇幻喜剧，呈现富有辨识度的地域故事。", "qa-script-4.jpg"],
  ["金华", "浙江省", 119.65, 29.08, -78, 24, 1, "《带你去个好地方》", "浙江省金华市武义县", "乡村振兴短剧", "以旅行视角展现乡村风貌与共同富裕。", "qa-script-5.jpg"],
  ["磐安", "浙江省", 120.45, 29.05, -25, 58, 1, "《辣妈回村》", "浙江省磐安县", "乡村振兴短剧", "讲述驻村第一书记带领乡村振兴的女性励志故事。", "qa-script-6.jpg"],
  ["温州", "浙江省", 120.7, 27.99, 50, 68, 1, "雁荡山杯文旅OPC技能大赛", "浙江省温州市乐清市", "文旅赛事", "联动创作者与区域资源，共同打造年轻化文旅IP。", "qa-script-7.jpg"],
  ["苏州", "江苏省", 120.62, 31.3, -72, -84, 2, "《面若桃花》第二季", "江苏省苏州市", "文旅短剧", "以穿越宋韵文化塑造城市品牌的精品文旅短剧。", "qa-script-8.jpg"],
  ["张家港", "江苏省", 120.55, 31.87, 12, -104, 1, "《我在张家港遇到河神》", "江苏省苏州市张家港市", "文旅短剧", "融合奇幻元素与江南文化，讲述具有城市气质的年轻故事。", "qa-script-9.jpg"],
  ["桂林", "广西壮族自治区", 110.29, 25.27, -46, 27, 1, "《漓江仙子的人间烟火》", "广西壮族自治区桂林市", "文旅短剧", "广西重点扶持项目，讲述亲情守护与励志成长的修仙题材短剧。", "qa-script-10.jpg"],
  ["香格里拉", "云南省", 99.7, 27.83, -80, -8, 1, "《香格里拉下雪了吗》", "云南省迪庆藏族自治州香格里拉市", "文旅短剧", "展现藏族风情与治愈旅行的民族文旅短剧。", "qa-script-11.jpg"],
  ["延边州", "吉林省", 129.5, 42.9, 24, -28, 1, "《G331号秘境来信》", "吉林省延边朝鲜族自治州", "乡村振兴短剧", "以边境振兴为主题，呈现东北边境的青春采风故事。", "qa-script-12.jpg"],
  ["茂名·高州", "广东省", 110.85, 21.9, 34, 36, 1, "《我在荔乡当冼夫人合伙人》", "广东省茂名市高州市", "乡村振兴短剧", "融合冼夫人文化与荔枝产业的乡村振兴非遗短剧。", "qa-script-1.jpg"]
];

const extraHangzhouWorks = [
  ["《上元欢·宋》", "余杭区 · 文旅短剧"],
  ["《我见过你的征途》", "淳安县 · 红色短剧"],
  ["《我在巴黎当侠客》", "西湖区 · 文旅短剧"]
];

const svg = document.querySelector(".china-map");
const shapeLayer = document.querySelector("[data-map-shapes]");
const routeLayer = document.querySelector("[data-map-routes]");
const markerLayer = document.querySelector("[data-map-markers]");
const NS = "http://www.w3.org/2000/svg";
const bounds = { minLon: 72, maxLon: 136, minLat: 17, maxLat: 54 };

function project(lon, lat) {
  const x = 38 + ((lon - bounds.minLon) / (bounds.maxLon - bounds.minLon)) * 844;
  const y = 30 + ((bounds.maxLat - lat) / (bounds.maxLat - bounds.minLat)) * 510;
  return [x, y];
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

function createSvg(tag, attrs = {}) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
  return node;
}

function renderMap(geo) {
  geo.features.forEach(feature => {
    const path = createSvg("path", { d: featurePath(feature), class: "province-shape" });
    shapeLayer.appendChild(path);
  });
  const [hubX, hubY] = project(120.15, 30.28);
  projectData.forEach((city, index) => {
    const [x, y] = project(city[2], city[3]);
    if (index > 0) routeLayer.appendChild(createSvg("path", { d: `M${hubX},${hubY} Q${(hubX + x) / 2},${Math.min(hubY, y) - 28} ${x},${y}`, class: "route-line" }));
    const group = createSvg("g", { class: `city-marker ${index === 0 ? "is-active" : ""}`, tabindex: "0", role: "button", "data-index": index });
    const line = createSvg("line", { x1: x, y1: y, x2: x + city[4], y2: y + city[5], class: "city-leader" });
    const dot = createSvg("circle", { cx: x, cy: y, r: 4.5, class: "city-dot" });
    const pulse = createSvg("circle", { cx: x, cy: y, r: 10, class: "city-pulse" });
    const labelX = x + city[4];
    const labelY = y + city[5];
    const label = createSvg("g", { class: "city-label" });
    const width = city[0].length > 4 ? 72 : 52;
    label.appendChild(createSvg("rect", { x: labelX - width / 2, y: labelY - 14, width, height: 28, rx: 4 }));
    const text = createSvg("text", { x: labelX, y: labelY + 4, "text-anchor": "middle" });
    text.textContent = city[0];
    label.appendChild(text);
    group.append(line, pulse, dot, label);
    group.addEventListener("mouseenter", () => selectCity(index));
    group.addEventListener("focus", () => selectCity(index));
    group.addEventListener("click", () => selectCity(index));
    markerLayer.appendChild(group);
  });
}

function selectCity(index) {
  const city = projectData[index];
  document.querySelectorAll(".city-marker").forEach(marker => marker.classList.toggle("is-active", Number(marker.dataset.index) === index));
  document.querySelector("[data-region]").textContent = city[1];
  document.querySelector("[data-city]").textContent = city[0];
  document.querySelector("[data-project-count]").textContent = `${city[6]} 个合作项目`;
  document.querySelector("[data-cover]").src = `../ai-drama-website-optimization/assets/${city[11]}`;
  document.querySelector("[data-category]").textContent = city[9];
  document.querySelector("[data-location]").textContent = city[8];
  document.querySelector("[data-work]").textContent = city[7];
  document.querySelector("[data-description]").textContent = city[10];
  const works = index === 0 ? extraHangzhouWorks : [[city[7], `${city[0]} · ${city[9]}`]];
  document.querySelector("[data-work-list]").innerHTML = works.map((work, workIndex) => `<button type="button"><span>0${workIndex + 1}</span><div><strong>${work[0]}</strong><small>${work[1]}</small></div><em>↗</em></button>`).join("");
}

fetch("china.geo.json").then(response => response.json()).then(renderMap).catch(() => {
  document.querySelector(".map-meta strong").textContent = "地图数据加载失败，请刷新重试";
});
selectCity(0);
