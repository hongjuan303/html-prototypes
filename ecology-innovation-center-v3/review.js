const frame = document.querySelector("[data-prototype-frame]");
const stage = document.querySelector("[data-prototype-stage]");
const prdPane = document.querySelector("[data-prd-pane]");
const viewButtons = [...document.querySelectorAll("[data-view-mode]")];
const docButtons = [...document.querySelectorAll("[data-doc-target]")];
const docSections = [...document.querySelectorAll("[data-prd-section]")];
const openPrdButton = document.querySelector("[data-open-prd]");
const backPrototypeButton = document.querySelector("[data-back-prototype]");

const prototypeTargets = {
  overview: "#top",
  home: "#top",
  network: ".network",
  map: "#map",
  opc: "#opc"
};

let currentMode = "fit";
let activeDoc = "overview";
let frameScrollTimer;

function resizePrototype() {
  if (!frame.contentWindow || currentMode !== "fit") return;
  const scale = Math.min(1, stage.clientWidth / 1440);
  frame.style.transform = `scale(${scale})`;
  frame.style.height = `${Math.ceil(stage.clientHeight / scale)}px`;
}

function setActiveDoc(id, syncDocument = true) {
  if (!id || activeDoc === id) return;
  activeDoc = id;
  docButtons.forEach(button => button.classList.toggle("is-active", button.dataset.docTarget === id));
  docSections.forEach(section => section.classList.toggle("is-active", section.dataset.prdSection === id));
  if (syncDocument) {
    const section = document.querySelector(`[data-prd-section="${id}"]`);
    if (section) prdPane.scrollTo({ top: section.offsetTop - 112, behavior: "smooth" });
  }
}

function syncFromPrototype() {
  const doc = frame.contentDocument;
  const win = frame.contentWindow;
  if (!doc || !win) return;
  const scrollY = win.scrollY;
  const networkTop = doc.querySelector(".network")?.offsetTop ?? 700;
  const mapTop = doc.querySelector("#map")?.offsetTop ?? 1500;
  const opcTop = doc.querySelector("#opc")?.offsetTop ?? 2500;
  let id = scrollY < 80 ? "overview" : "home";
  if (scrollY >= networkTop - 180) id = "network";
  if (scrollY >= mapTop - 180) id = "map";
  if (scrollY >= opcTop - 180) id = "opc";
  setActiveDoc(id);
}

function scrollPrototypeTo(id) {
  const doc = frame.contentDocument;
  const selector = prototypeTargets[id];
  const target = doc?.querySelector(selector);
  if (!target) return;
  frame.contentWindow.scrollTo({ top: target.offsetTop, behavior: "smooth" });
}

function showCanvas(index) {
  document.body.scrollTo({ left: index * window.innerWidth, behavior: "smooth" });
}

frame.addEventListener("load", () => {
  resizePrototype();
  frame.contentWindow.addEventListener("scroll", () => {
    clearTimeout(frameScrollTimer);
    frameScrollTimer = setTimeout(syncFromPrototype, 60);
  }, { passive: true });
});

viewButtons.forEach(button => button.addEventListener("click", () => {
  currentMode = button.dataset.viewMode;
  stage.classList.toggle("is-fit", currentMode === "fit");
  stage.classList.toggle("is-actual", currentMode === "actual");
  viewButtons.forEach(item => item.classList.toggle("is-active", item === button));
  if (currentMode === "fit") resizePrototype();
  else {
    frame.style.transform = "none";
    frame.style.height = "100%";
  }
}));

docButtons.forEach(button => button.addEventListener("click", () => {
  const id = button.dataset.docTarget;
  setActiveDoc(id);
  scrollPrototypeTo(id);
}));

openPrdButton.addEventListener("click", () => showCanvas(1));
backPrototypeButton.addEventListener("click", () => showCanvas(0));

window.addEventListener("resize", resizePrototype);
resizePrototype();
