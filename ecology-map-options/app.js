const cities = [
  { name: "杭州", x: 69, y: 56, count: 7, work: "《马年限定之新春有约》", desc: "春节年俗轻喜剧，在富阳龙门古镇实地取景。" },
  { name: "宁波", x: 82, y: 58, count: 1, work: "《甬忆南侨梦归人》", desc: "讲述马来西亚华侨寻根与抗战历史的红色文旅短剧。" },
  { name: "舟山", x: 89, y: 52, count: 1, work: "《约等于100岁》", desc: "以柴山岛海岛岁月展现治愈与青春成长。" },
  { name: "台州", x: 86, y: 68, count: 3, work: "《寻天记》之和合圣境", desc: "融合天台山和合文化与奇幻喜剧的文旅作品。" },
  { name: "金华", x: 67, y: 69, count: 1, work: "《带你去个好地方》", desc: "以旅行视角展现乡村风貌与共同富裕。" },
  { name: "磐安", x: 74, y: 65, count: 1, work: "《辣妈回村》", desc: "驻村第一书记带领乡村振兴的女性励志短剧。" },
  { name: "温州", x: 80, y: 78, count: 1, work: "雁荡山杯文旅OPC技能大赛", desc: "以仙侠秘境为主题，联动创作者共建文旅IP。" }
];

const storyItems = [
  ["杭州", "《上元欢·宋》", "以AIGC技术呈现宋韵文化，让传统文化在年轻叙事中焕新。", "qa-script-1.jpg"],
  ["台州", "《海屿岛之恋》", "时空穿越与海岛风光交织，打造高辨识度地域内容。", "qa-script-2.jpg"],
  ["苏州", "《面若桃花》第二季", "穿越宋韵文化，以精品短剧塑造城市内容品牌。", "qa-script-3.jpg"],
  ["桂林", "《漓江仙子的人间烟火》", "融合山水人文与亲情成长，呈现桂林文旅新表达。", "qa-script-4.jpg"]
];

document.querySelectorAll("[data-option]").forEach(button => button.addEventListener("click", () => {
  const option = button.dataset.option;
  document.querySelectorAll("[data-option]").forEach(item => item.classList.toggle("is-active", item === button));
  document.querySelectorAll("[data-panel]").forEach(panel => panel.classList.toggle("is-active", panel.dataset.panel === option));
}));

function markerMarkup(style) {
  return cities.map((city, index) => `<button type="button" class="map-marker ${index === 0 ? "is-active" : ""}" style="--x:${city.x}%;--y:${city.y}%" data-city="${index}" data-style="${style}"><i></i><strong>${city.name}</strong><span>${city.count}</span></button>`).join("");
}

document.querySelectorAll("[data-markers]").forEach(layer => { layer.innerHTML = markerMarkup(layer.dataset.markers); });

function setCity(style, index) {
  const city = cities[index];
  document.querySelectorAll(`[data-style="${style}"]`).forEach(marker => marker.classList.toggle("is-active", Number(marker.dataset.city) === index));
  if (style === "a") {
    document.querySelector('[data-title="a"]').textContent = `浙江 · ${city.name}`;
    document.querySelector('[data-count="a"]').textContent = `${city.count} 个项目`;
    document.querySelector('[data-list="a"]').innerHTML = `<button><i></i><span><strong>${city.work}</strong><small>${city.desc}</small></span><em>查看</em></button><button><i></i><span><strong>${city.name}生态合作</strong><small>城市内容共创与产业伙伴合作信息</small></span><em>详情</em></button>`;
    const card = document.querySelector('[data-card="a"]');
    card.innerHTML = `<span>${city.name} · 文旅短剧</span><strong>${city.work}</strong><p>${city.desc}</p>`;
    card.classList.add("is-visible");
  }
}

document.querySelectorAll("[data-city]").forEach(marker => marker.addEventListener("click", () => setCity(marker.dataset.style, Number(marker.dataset.city))));

document.querySelectorAll("[data-region]").forEach(button => button.addEventListener("click", () => {
  document.querySelectorAll("[data-region]").forEach(item => item.classList.toggle("is-active", item === button));
}));

function setStory(index) {
  const [city, title, desc, image] = storyItems[index];
  document.querySelectorAll("[data-story]").forEach(pin => pin.classList.toggle("is-active", Number(pin.dataset.story) === index));
  document.querySelector("[data-story-detail]").innerHTML = `<span>${city} · 城市共创作品</span><h4>${title}</h4><p>${desc}</p><button type="button">查看项目详情 <b>↗</b></button>`;
  document.querySelector(".story-detail").style.setProperty("--cover", `url('../ai-drama-website-optimization/assets/${image}')`);
  document.querySelector(".story-progress span").textContent = `0${index + 1}`;
}

document.querySelectorAll("[data-story]").forEach(pin => pin.addEventListener("click", () => setStory(Number(pin.dataset.story))));
setCity("a", 0);
setStory(0);
