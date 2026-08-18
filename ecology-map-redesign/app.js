const projectData = [
  ["杭州", "浙江省", 120.15, 30.28, -66, -54, 7, "《马年限定之新春有约》", "浙江省杭州市富阳区", "文旅短剧", "容量短剧出品的春节年俗轻喜剧，在富阳龙门古镇实地取景，以中外文化碰撞展现年味新表达。", "qa-script-1.jpg"],
  ["宁波", "浙江省", 121.55, 29.87, 44, -36, 1, "《甬忆南侨梦归人》", "浙江省宁波市", "文旅短剧", "讲述马来西亚华侨寻根与抗战历史的红色文旅短剧。", "qa-script-2.jpg"],
  ["舟山", "浙江省", 122.2, 30.0, 79, -6, 1, "《约等于100岁》", "浙江省舟山市", "公益短剧", "以柴山岛上的海岛岁月治愈展现青春成长。", "qa-script-3.jpg"],
  ["台州", "浙江省", 121.42, 28.66, 66, 20, 3, "《寻天记》之和合圣境", "浙江省台州市天台县", "文旅短剧", "融合天台山和合文化与奇幻喜剧，呈现富有辨识度的地域故事。", "qa-script-4.jpg"],
  ["金华", "浙江省", 119.65, 29.08, -78, 24, 1, "《带你去个好地方》", "浙江省金华市武义县", "乡村振兴短剧", "以旅行视角展现乡村风貌与共同富裕。", "qa-script-5.jpg"],
  ["磐安", "浙江省", 120.45, 29.05, -25, 58, 1, "《辣妈回村》", "浙江省磐安县", "乡村振兴短剧", "讲述驻村第一书记带领乡村振兴的女性励志故事。", "qa-script-6.jpg"],
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

const specialProjects = [
  { type: "space", name: "云谷中心OPC社区", lon: 120.08, lat: 30.31, dx: -92, dy: 38, target: "#spaces" },
  { type: "space", name: "永嘉AI创新中心", lon: 120.69, lat: 28.15, dx: 88, dy: 80, target: "#spaces" },
  { type: "school", name: "浙传AIGC实验班", lon: 120.35, lat: 30.32, dx: -96, dy: -104, target: ".academy-events" },
  { type: "event", name: "雁荡山杯", lon: 121.08, lat: 28.37, dx: 87, dy: 36, href: "https://www.data0086.com" },
  { type: "event", name: "大广赛·即将开启", lon: 116.4, lat: 39.9, dx: 80, dy: -38, message: "大广赛营销创客单元竞赛即将开启" },
  { type: "coming", name: "新疆·即将呈现", lon: 87.6, lat: 43.8, dx: -22, dy: -34, target: ".coming-projects" },
  { type: "coming", name: "三星堆·即将呈现", lon: 104.23, lat: 31.0, dx: -79, dy: -50, target: ".coming-projects" },
  { type: "coming", name: "武夷山·即将呈现", lon: 118.0, lat: 27.75, dx: -94, dy: 68, target: ".coming-projects" }
];

const svg = document.querySelector(".china-map");
const glowLayer = document.querySelector("[data-map-glow]");
const shapeLayer = document.querySelector("[data-map-shapes]");
const routeLayer = document.querySelector("[data-map-routes]");
const markerLayer = document.querySelector("[data-map-markers]");
const specialMarkerLayer = document.querySelector("[data-special-markers]");
const mapShell = document.querySelector(".map-shell");
const storyPanel = document.querySelector("[data-story-panel]");
const NS = "http://www.w3.org/2000/svg";
const bounds = { minLon: 72, maxLon: 136, minLat: 17, maxLat: 54 };
let pinnedCity = null;

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
    const icon = createSvg("g", { class: "special-icon" });
    addSpecialIcon(icon, item.type);
    const label = createSvg("g", { class: "special-label", transform: `translate(${item.dx} ${item.dy})` });
    const width = Math.max(78, item.name.length * 10 + 18);
    label.appendChild(createSvg("rect", { x: -width / 2, y: -14, width, height: 28, rx: 4 }));
    const text = createSvg("text", { x: 0, y: 4, "text-anchor": "middle" });
    text.textContent = item.name;
    label.appendChild(text);
    group.append(leader, icon, label);
    const activate = () => group.classList.add("is-active");
    const deactivate = () => group.classList.remove("is-active");
    group.addEventListener("mouseenter", activate);
    group.addEventListener("mouseleave", deactivate);
    group.addEventListener("focus", activate);
    group.addEventListener("blur", deactivate);
    group.addEventListener("click", () => {
      if (item.href) window.open(item.href, "_blank", "noopener,noreferrer");
      else if (item.message) showToast(item.message);
      else document.querySelector(item.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
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
    group.addEventListener("mouseenter", () => { if (pinnedCity === null) showCity(index); });
    group.addEventListener("mouseleave", () => { if (pinnedCity === null) hideCity(); });
    group.addEventListener("focus", () => { if (pinnedCity === null) showCity(index); });
    group.addEventListener("blur", () => { if (pinnedCity === null) hideCity(); });
    group.addEventListener("click", () => {
      pinnedCity = index;
      showCity(index, true);
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
  document.querySelector("[data-cover]").src = `../ai-drama-website-optimization/assets/${city[11]}`;
  document.querySelector("[data-category]").textContent = city[9];
  document.querySelector("[data-location]").textContent = city[8];
  document.querySelector("[data-work]").textContent = city[7];
  document.querySelector("[data-description]").textContent = city[10];
  const works = index === 0 ? extraHangzhouWorks : [[city[7], `${city[0]} · ${city[9]}`]];
  document.querySelector("[data-work-list]").innerHTML = works.map((work, workIndex) => `<button type="button" data-map-trailer data-trailer-name="${work[0]}"><span>0${workIndex + 1}</span><div><strong>${work[0]}</strong><small>${work[1]}</small></div><em>↗</em></button>`).join("");
}

function showCity(index, pinned = false) {
  populateCity(index);
  mapShell.classList.add("is-detail-visible");
  storyPanel.setAttribute("aria-hidden", "false");
  document.querySelectorAll(".city-marker").forEach(marker => {
    const selected = Number(marker.dataset.index) === index;
    marker.classList.toggle("is-preview", selected && !pinned);
    marker.classList.toggle("is-active", selected && (pinned || pinnedCity === index));
  });
}

function hideCity() {
  mapShell.classList.remove("is-detail-visible");
  storyPanel.setAttribute("aria-hidden", "true");
  document.querySelectorAll(".city-marker").forEach(marker => marker.classList.remove("is-preview"));
}

fetch("china.geo.json").then(response => response.json()).then(renderMap).catch(() => {
  document.querySelector(".map-meta strong").textContent = "地图数据加载失败，请刷新重试";
});
populateCity(0);

document.querySelectorAll("[data-map-filter]").forEach(button => {
  button.addEventListener("click", () => {
    const type = button.dataset.mapFilter;
    document.querySelectorAll("[data-map-filter]").forEach(item => item.classList.toggle("is-active", item === button));
    document.querySelectorAll("[data-map-type]").forEach(marker => {
      marker.classList.toggle("is-filtered-out", type !== "all" && marker.dataset.mapType !== type);
    });
    if (type !== "all" && type !== "drama") {
      pinnedCity = null;
      hideCity();
    }
  });
});

document.querySelectorAll("[data-map-view]").forEach(button => {
  button.addEventListener("click", () => {
    const isEast = button.dataset.mapView === "east";
    document.querySelectorAll("[data-map-view]").forEach(item => item.classList.toggle("is-active", item === button));
    mapShell.classList.toggle("is-east-focus", isEast);
  });
});

const joinModal = document.querySelector("[data-join-modal]");
const joinDialog = joinModal.querySelector(".join-dialog");
const joinForm = document.querySelector("[data-join-form]");
const formSuccess = document.querySelector("[data-form-success]");
const submitButton = document.querySelector("[data-submit-form]");
const trailerModal = document.querySelector("[data-trailer-modal]");
const toast = document.querySelector("[data-toast]");
let toastTimer;
let videoTimer;
let videoSeconds = 0;

function showToast(message) {
  toast.textContent = message;
  toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.hidden = true; }, 2800);
}

function openJoinModal(direction) {
  const isSpace = direction.includes("云谷") || direction.includes("永嘉");
  joinForm.reset();
  joinForm.hidden = false;
  formSuccess.hidden = true;
  submitButton.disabled = false;
  submitButton.textContent = "提交申请";
  joinDialog.classList.toggle("is-space-form", isSpace);
  document.querySelector("[data-form-title]").textContent = `申请加入${direction}`;
  document.querySelector("[data-form-subtitle]").textContent = isSpace
    ? "请留下团队信息，空间运营人员将在审核后与您联系。"
    : "提交申请后，我们将在审核后与您联系。";
  document.querySelector("[data-form-direction]").value = direction;
  ["city", "model", "portfolio"].forEach(name => {
    const field = joinForm.elements[name];
    field.disabled = isSpace;
    if (name === "city") field.required = !isSpace;
  });
  joinModal.hidden = false;
  document.body.classList.add("has-modal");
  setTimeout(() => joinForm.elements.company.focus(), 30);
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
document.querySelector("[data-scroll-join]").addEventListener("click", () => document.querySelector("#join").scrollIntoView({ behavior: "smooth" }));

document.addEventListener("click", event => {
  const trigger = event.target.closest("[data-trailer], [data-map-trailer]");
  if (!trigger) return;
  const title = trigger.dataset.trailer || trigger.dataset.trailerName || document.querySelector("[data-work]").textContent;
  const image = trigger.querySelector("img")?.src || document.querySelector("[data-cover]").src;
  openTrailer(title, image);
});

document.querySelector("[data-map-trailer]").addEventListener("keydown", event => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openTrailer(document.querySelector("[data-work]").textContent, document.querySelector("[data-cover]").src);
  }
});

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

document.querySelector("[data-gallery]").addEventListener("click", () => showToast("结业成果画廊已打开"));
document.querySelector(".detail-button").addEventListener("click", () => showToast(`${document.querySelector("[data-city]").textContent}合作项目已展开`));
