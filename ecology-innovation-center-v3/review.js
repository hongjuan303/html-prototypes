const frame = document.querySelector("[data-prototype-frame]");
const stage = document.querySelector("[data-prototype-stage]");
const prdPane = document.querySelector("[data-prd-pane]");
const docButtons = [...document.querySelectorAll("[data-doc-target]")];
const docSections = [...document.querySelectorAll("[data-prd-section]")];
const documentButtons = [...document.querySelectorAll("[data-document-view]")];
const documentPanels = [...document.querySelectorAll("[data-document-panel]")];
const outlinePanels = [...document.querySelectorAll("[data-outline-view]")];
const backPrototypeButton = document.querySelector("[data-back-prototype]");

const prototypeTargets = {
  overview: "#top",
  home: "#top",
  network: ".network",
  map: "#map",
  opc: "#opc"
};

const documentDefaults = { site: "overview", admin: "admin-applications" };

let currentDocument = "site";
let activeDoc = "overview";
let frameScrollTimer;

function resizePrototype() {
  if (!frame.contentWindow) return;
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
  if (currentDocument !== "site") return;
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

function scrollToPrototype() {
  document.body.scrollTo({ left: 0, behavior: "smooth" });
}

function switchDocument(view) {
  if (!documentDefaults[view]) return;
  currentDocument = view;
  documentButtons.forEach(button => button.classList.toggle("is-active", button.dataset.documentView === view));
  documentPanels.forEach(panel => { panel.hidden = panel.dataset.documentPanel !== view; });
  outlinePanels.forEach(panel => { panel.hidden = panel.dataset.outlineView !== view; });
  activeDoc = "";
  setActiveDoc(documentDefaults[view], false);
  prdPane.scrollTo({ top: 0, behavior: "smooth" });
}

frame.addEventListener("load", () => {
  resizePrototype();
  frame.contentWindow.addEventListener("scroll", () => {
    clearTimeout(frameScrollTimer);
    frameScrollTimer = setTimeout(syncFromPrototype, 60);
  }, { passive: true });
});

docButtons.forEach(button => button.addEventListener("click", () => {
  const id = button.dataset.docTarget;
  setActiveDoc(id);
  if (currentDocument === "site") scrollPrototypeTo(id);
}));

documentButtons.forEach(button => button.addEventListener("click", () => switchDocument(button.dataset.documentView)));
backPrototypeButton.addEventListener("click", scrollToPrototype);

window.addEventListener("resize", resizePrototype);
resizePrototype();
