const days = [
  {day:"D1",date:"9月26日",title:"抵达乌鲁木齐 · 市区休整",roads:"乌鲁木齐市区道路",stay:"阿里酒店（和田二街店）",group:"north",points:[[43.8256,87.6168],[43.7900,87.6100]]},
  {day:"D2",date:"9月27日",title:"乌鲁木齐 → 阿勒泰",roads:"乌鲁木齐西绕城/G7 → 五家渠东互通 → S21阿乌高速 → 北屯南互通 → G3014奎阿高速",stay:"山风来信美宿（将军山滑雪场店）",group:"north",points:[[43.7900,87.6100],[44.1700,87.5400],[46.0800,87.7600],[47.3500,87.8000],[47.8450,88.1300]]},
  {day:"D3",date:"9月28日",title:"阿勒泰 → 布尔津 → 喀纳斯",roads:"阿勒泰 → 北屯 → G217 → 布尔津 → S232喀布公路 → 贾登峪 → 景区区间车",stay:"喀纳斯景区内住宿（待定）",group:"north",points:[[47.8450,88.1300],[47.3500,87.8000],[47.7000,86.8600],[48.1800,86.9800],[48.5000,87.1300],[48.6900,87.0200]]},
  {day:"D4",date:"9月29日",title:"喀纳斯游玩 → 白哈巴",roads:"喀纳斯湖与三湾 → 喀纳斯换乘中心 → 景区区间车 → 白哈巴",stay:"归云民宿",group:"north",points:[[48.6900,87.0200],[48.6300,87.0400],[48.4500,86.7400],[48.0600,86.4200]]},
  {day:"D5",date:"9月30日",title:"白哈巴晨景 → 克拉玛依",roads:"白哈巴 → 铁热克提 → G219 → 哈巴河 → G331 → 布尔津 → G217/G3014 → 克拉玛依",stay:"克拉玛依市区酒店（待定）",group:"north",points:[[48.0600,86.4200],[48.0500,86.4100],[48.0600,86.4300],[47.7000,86.8600],[46.7500,86.0000],[45.5800,84.8900]]},
  {day:"D6",date:"10月1日",title:"克拉玛依 → 精河 · 轻转场",roads:"克拉玛依 → G3014奎阿高速 → 奎屯 → G30连霍高速 → 精河",stay:"文华印象大酒店",group:"west",points:[[45.5800,84.8900],[44.4300,84.9000],[44.6000,82.8900]]},
  {day:"D7",date:"10月2日",title:"精河 → 赛里木湖环湖 → 那拉提",roads:"G30连霍高速 → 赛里木湖东门 → 环湖公路 → 南门 → 果子沟段 → G3016清伊高速 → G218伊若线 → 那拉提",stay:"云栖墨山假日酒店（那拉提景区店）",group:"west",points:[[44.6000,82.8900],[44.6300,81.1500],[44.5100,81.0400],[44.3000,81.2300],[43.9500,81.5200],[43.7000,82.5500],[43.3000,84.0000]]},
  {day:"D8",date:"10月3日",title:"那拉提完整游玩一天",roads:"那拉提景区内部道路 / 区间车",stay:"继续住云栖墨山假日酒店",group:"west",points:[[43.3000,84.0000],[43.3300,84.0800],[43.2800,84.1500],[43.2500,84.0700],[43.3000,84.0000]]},
  {day:"D9",date:"10月4日",title:"那拉提 → 独库北段 → 乌鲁木齐",roads:"G217独库公路 → 乔尔玛 → 哈希勒根隧道 → 独山子 → G30连霍高速 → 乌鲁木齐",stay:"根据返程航班决定",group:"west",points:[[43.3000,84.0000],[43.8300,84.0800],[44.1000,84.2800],[44.3300,84.8800],[44.1000,86.2000],[43.8256,87.6168]]}
];

const stops = [
  {name:"乌鲁木齐",coord:[43.8256,87.6168],number:"1",major:true},
  {name:"阿勒泰",coord:[47.8450,88.1300],number:"2",major:true},
  {name:"喀纳斯",coord:[48.6900,87.0200],number:"3"},
  {name:"白哈巴",coord:[48.0600,86.4200],number:"4"},
  {name:"克拉玛依",coord:[45.5800,84.8900],number:"5"},
  {name:"精河",coord:[44.6000,82.8900],number:"6",major:true},
  {name:"赛里木湖",coord:[44.6300,81.1500],number:"7"},
  {name:"那拉提",coord:[43.3000,84.0000],number:"8",major:true},
  {name:"独山子",coord:[44.3300,84.8800],number:"9"}
];

const colors = {north:"#e86f32",west:"#2f8f83"};
const map = L.map("map",{zoomControl:false,attributionControl:true,preferCanvas:true});
L.control.zoom({position:"topright"}).addTo(map);
map.attributionControl.setPrefix("Leaflet");
fetch("/html-prototypes/xinjiang-road-trip-map/xinjiang.geojson")
  .then((response)=>response.json())
  .then((geojson)=>{
    L.geoJSON(geojson,{
      style:{color:"#9fb1b7",weight:1,opacity:.9,fillColor:"#edf2f1",fillOpacity:.88},
      onEachFeature:(feature,layer)=>layer.bindTooltip(feature.properties.name,{sticky:true,className:"region-label"})
    }).addTo(map).bringToBack();
  });

const routeLayers = [];
const hotelLayers = [];
const allBounds = L.latLngBounds([]);
const hotelOffsets = [[-.10,.10],[-.08,.12],[-.05,.12],[-.08,-.12],[-.10,-.12],[-.10,.12],[-.10,.12]];

days.forEach((item,index)=>{
  item.points.forEach((point)=>allBounds.extend(point));
  const line=L.polyline(item.points,{color:colors[item.group],weight:5,opacity:.72,lineCap:"round",lineJoin:"round",dashArray:index===7?"6 8":null}).addTo(map);
  line.bindTooltip(`${item.day} · ${item.title}`,{sticky:true});
  line.on("click",()=>selectDay(index));
  routeLayers.push(line);
  if(index<7){
    const end=item.points[item.points.length-1];
    const hotelPoint=[end[0]+hotelOffsets[index][0],end[1]+hotelOffsets[index][1]];
    const icon=L.divIcon({className:"",html:'<div class="hotel-marker"><span>住</span></div>',iconSize:[20,20],iconAnchor:[10,10]});
    const marker=L.marker(hotelPoint,{icon,zIndexOffset:700}).bindPopup(`<div class="popup-title">${item.day} 住宿</div><div class="popup-meta">${item.stay}</div>`).addTo(map);
    hotelLayers.push(marker);
  }
});

stops.forEach((stop)=>{
  const icon=L.divIcon({className:"",html:`<div class="place-marker${stop.major?" major":""}">${stop.number}</div>`,iconSize:[28,28],iconAnchor:[14,14]});
  L.marker(stop.coord,{icon,zIndexOffset:500}).bindTooltip(stop.name,{permanent:true,direction:"top",offset:[0,-11],className:"place-label"}).addTo(map);
});

const dayTabs=document.querySelector("#dayTabs");
const dayList=document.querySelector("#dayList");

days.forEach((item,index)=>{
  const tab=document.createElement("button");
  tab.className="day-tab";
  tab.type="button";
  tab.innerHTML=`<b>${item.day}</b>${item.date.replace("月","/").replace("日","")}`;
  tab.addEventListener("click",()=>selectDay(index));
  dayTabs.appendChild(tab);

  const card=document.createElement("button");
  card.className="day-card";
  card.type="button";
  card.innerHTML=`<span class="date-block"><b>${item.day}</b><span>${item.date}</span></span><span><h3>${item.title}</h3><p class="roads">${item.roads}</p><span class="stay-row"><i></i>${item.stay}</span></span>`;
  card.addEventListener("click",()=>selectDay(index));
  dayList.appendChild(card);
});

function selectDay(index){
  const item=days[index];
  routeLayers.forEach((layer,i)=>layer.setStyle({weight:i===index?8:3,opacity:i===index?1:.16}));
  document.querySelectorAll(".day-tab").forEach((el,i)=>el.classList.toggle("active",i===index));
  document.querySelectorAll(".day-card").forEach((el,i)=>el.classList.toggle("active",i===index));
  document.querySelectorAll(".day-card")[index].scrollIntoView({block:"nearest",behavior:"smooth"});
  document.querySelector("#summaryDay").textContent=item.day;
  document.querySelector("#summaryTitle").textContent=item.title;
  document.querySelector("#summaryMeta").textContent=`${item.date} · 住宿：${item.stay}`;
  map.fitBounds(L.latLngBounds(item.points),{padding:[90,90],maxZoom:9});
  routeLayers[index].bringToFront();
}

function showOverview(){
  routeLayers.forEach((layer)=>layer.setStyle({weight:5,opacity:.72}));
  document.querySelectorAll(".day-tab,.day-card").forEach((el)=>el.classList.remove("active"));
  document.querySelector("#summaryDay").textContent="全程";
  document.querySelector("#summaryTitle").textContent="乌鲁木齐出发 · 喀纳斯/白哈巴环线";
  document.querySelector("#summaryMeta").textContent="9天8晚 · 9月26日—10月4日";
  map.fitBounds(allBounds,{padding:[65,65]});
}

document.querySelector("#overviewButton").addEventListener("click",showOverview);
document.querySelector("#hotelToggle").addEventListener("change",(event)=>{
  hotelLayers.forEach((marker)=>event.target.checked?marker.addTo(map):marker.removeFrom(map));
});

showOverview();
