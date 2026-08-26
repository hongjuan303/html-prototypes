const frame = document.querySelector("[data-prototype-frame]");
const adminFrame = document.querySelector("[data-admin-frame]");
const stage = document.querySelector("[data-prototype-stage]");
const prdPane = document.querySelector("[data-prd-pane]");
const prototypeButtons = [...document.querySelectorAll("[data-prototype-tab]")];
const prototypePanels = [...document.querySelectorAll("[data-prototype-panel]")];
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
let currentPrototype = "site";
let activeDoc = "overview";
let frameScrollTimer;

function resizePrototype() {
  const scale = Math.min(1, stage.clientWidth / 1440);
  prototypePanels.forEach(panel => {
    panel.style.transform = `scale(${scale})`;
    panel.style.height = `${Math.ceil(stage.clientHeight / scale)}px`;
  });
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
  if (currentDocument !== "site" || currentPrototype !== "site") return;
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

function syncFromAdmin() {
  if (currentPrototype !== "admin") return;
  const id = adminFrame.contentWindow?.location.hash === "#waterfall" ? "admin-waterfall" : "admin-applications";
  setActiveDoc(id);
}

function scrollPrototypeTo(id) {
  if (id.startsWith("admin-")) {
    const page = id === "admin-waterfall" ? "waterfall" : "applications";
    if (adminFrame.contentWindow) adminFrame.contentWindow.location.hash = page;
    return;
  }
  const doc = frame.contentDocument;
  const selector = prototypeTargets[id];
  const target = doc?.querySelector(selector);
  if (!target) return;
  frame.contentWindow.scrollTo({ top: target.offsetTop, behavior: "smooth" });
}

function scrollToPrototype() {
  document.body.scrollTo({ left: 0, behavior: "smooth" });
}

function switchPrototype(view, syncDocument = true) {
  if (!documentDefaults[view]) return;
  currentPrototype = view;
  prototypeButtons.forEach(button => button.classList.toggle("is-active", button.dataset.prototypeTab === view));
  prototypePanels.forEach(panel => { panel.hidden = panel.dataset.prototypePanel !== view; });
  resizePrototype();
  if (syncDocument) switchDocument(view, false);
  if (view === "admin") syncFromAdmin();
}

function switchDocument(view, syncPrototype = true) {
  if (!documentDefaults[view]) return;
  currentDocument = view;
  documentButtons.forEach(button => button.classList.toggle("is-active", button.dataset.documentView === view));
  documentPanels.forEach(panel => { panel.hidden = panel.dataset.documentPanel !== view; });
  outlinePanels.forEach(panel => { panel.hidden = panel.dataset.outlineView !== view; });
  activeDoc = "";
  setActiveDoc(documentDefaults[view], false);
  prdPane.scrollTo({ top: 0, behavior: "smooth" });
  if (syncPrototype) switchPrototype(view, false);
}

frame.addEventListener("load", () => {
  resizePrototype();
  frame.contentWindow.addEventListener("scroll", () => {
    clearTimeout(frameScrollTimer);
    frameScrollTimer = setTimeout(syncFromPrototype, 60);
  }, { passive: true });
});

function initializeAdminFrame() {
  const doc = adminFrame.contentDocument;
  if (!doc?.head) return;
  if (doc && !doc.getElementById("embedded-review-style")) {
    const style = doc.createElement("style");
    style.id = "embedded-review-style";
    style.textContent = `
      html, body { min-width: 0 !important; }
      .workspace { grid-template-columns: minmax(0, 1fr) !important; padding-right: 14px !important; }
      .docs-panel { display: none !important; }
    `;
    doc.head.appendChild(style);
  }
  resizePrototype();
  if (!adminFrame.contentWindow.__reviewHashSyncBound) {
    adminFrame.contentWindow.addEventListener("hashchange", syncFromAdmin);
    adminFrame.contentWindow.__reviewHashSyncBound = true;
  }
  syncFromAdmin();
}

adminFrame.addEventListener("load", initializeAdminFrame);
initializeAdminFrame();

docButtons.forEach(button => button.addEventListener("click", () => {
  const id = button.dataset.docTarget;
  setActiveDoc(id);
  scrollPrototypeTo(id);
}));

documentButtons.forEach(button => button.addEventListener("click", () => switchDocument(button.dataset.documentView)));
prototypeButtons.forEach(button => button.addEventListener("click", () => switchPrototype(button.dataset.prototypeTab)));
backPrototypeButton.addEventListener("click", scrollToPrototype);

window.addEventListener("resize", resizePrototype);
resizePrototype();
