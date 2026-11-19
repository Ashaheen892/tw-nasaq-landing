var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { nothing, html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
function getConfig(raw) {
  return raw ? raw.component && typeof raw.component == "object" ? raw.component : raw : {};
}
__name(getConfig, "getConfig");
function getLocale() {
  var _a, _b, _c;
  const lang = ((_c = (_b = (_a = window.Salla) == null ? void 0 : _a.lang) == null ? void 0 : _b.getLocale) == null ? void 0 : _c.call(_b)) || document.documentElement.lang || "ar";
  return String(lang).toLowerCase().startsWith("en") ? "en" : "ar";
}
__name(getLocale, "getLocale");
function localizedString(value) {
  if (value == null || value === "") return "";
  if (typeof value == "string") return value;
  if (typeof value == "object") {
    const obj = value, text = obj[getLocale()] || obj.ar || obj.en;
    return typeof text == "string" ? text : "";
  }
  return String(value);
}
__name(localizedString, "localizedString");
function t(strings) {
  return getLocale() === "ar" ? strings.ar : strings.en;
}
__name(t, "t");
function unwrapValue(value) {
  var _a;
  return Array.isArray(value) ? unwrapValue(((_a = value[0]) == null ? void 0 : _a.value) ?? value[0] ?? "") : value && typeof value == "object" && "value" in value ? value.value : value ?? "";
}
__name(unwrapValue, "unwrapValue");
function linkHref(value) {
  if (value == null || value === "") return "";
  if (typeof value == "string") return value.trim();
  if (Array.isArray(value)) return linkHref(value[0]);
  if (typeof value == "object") {
    const obj = value;
    if (obj.url) return linkHref(obj.url);
    if ("value" in obj) return linkHref(obj.value);
    if (obj.href) return linkHref(obj.href);
  }
  return "";
}
__name(linkHref, "linkHref");
function flag(value) {
  const raw = unwrapValue(value);
  return raw === !0 || raw === "true" || raw === 1 || raw === "1";
}
__name(flag, "flag");
function getCollectionItems(items, prefix) {
  return Array.isArray(items) ? items.map((item) => {
    if (!item || typeof item != "object") return {};
    const normalized = {};
    for (const [key, val] of Object.entries(item))
      normalized[key.startsWith(`${prefix}.`) ? key.slice(prefix.length + 1) : key] = val;
    return normalized;
  }) : [];
}
__name(getCollectionItems, "getCollectionItems");
function watchLocale(host) {
  const update = /* @__PURE__ */ __name(() => host.requestUpdate(), "update");
  return window.addEventListener("language-changed", update), () => window.removeEventListener("language-changed", update);
}
__name(watchLocale, "watchLocale");
function salla() {
  return window.Salla;
}
__name(salla, "salla");
function landingSettings() {
  var _a, _b;
  return ((_b = (_a = salla()) == null ? void 0 : _a.config) == null ? void 0 : _b.get("theme.settings")) || {};
}
__name(landingSettings, "landingSettings");
function isLandingPage() {
  var _a, _b;
  return ((_b = (_a = salla()) == null ? void 0 : _a.config) == null ? void 0 : _b.get("page.is_landing_page")) === !0;
}
__name(isLandingPage, "isLandingPage");
function pageMode() {
  var _a;
  const value = landingSettings().page_for_product;
  return typeof value == "boolean" || value == null ? value === !1 ? "promotion" : "product" : typeof value == "string" ? value === "promotion" ? "promotion" : "product" : Array.isArray(value) && ((_a = value[0]) == null ? void 0 : _a.value) === "promotion" ? "promotion" : "product";
}
__name(pageMode, "pageMode");
function landingProductId() {
  var _a, _b;
  if (!isLandingPage() || pageMode() !== "product") return null;
  const id = (_b = (_a = landingSettings().product) == null ? void 0 : _a.value) == null ? void 0 : _b[0];
  return id ? String(id) : null;
}
__name(landingProductId, "landingProductId");
function mainButton() {
  const settings = landingSettings();
  return { text: String(settings.main_btn_text || ""), url: String(settings.main_btn_url || "") };
}
__name(mainButton, "mainButton");
function openCheckout() {
  const checkout = document.querySelector(".s-block--fast-checkout"), layout = checkout == null ? void 0 : checkout.getAttribute("data-layout");
  if (window.innerWidth < 1024 || layout === "side-drawer" || !checkout) {
    window.dispatchEvent(new CustomEvent("open-checkout-drawer"));
    return;
  }
  checkout.scrollIntoView({ behavior: "smooth", block: "center" });
}
__name(openCheckout, "openCheckout");
function renderCta(labelValue, fallbackUrl = "", tone = "solid") {
  const label = localizedString(labelValue).trim();
  if (!label) return nothing;
  const cls = tone === "ghost" ? "nq-btn ghost" : tone === "light" ? "nq-btn light" : "nq-btn", productPage = !!landingProductId(), demo = !isLandingPage();
  if (productPage || demo && !fallbackUrl)
    return html`<button type="button" class=${cls} @click=${() => openCheckout()}>${label}</button>`;
  const href = (isLandingPage() && pageMode() === "promotion" ? mainButton().url : "") || fallbackUrl;
  return href ? html`<a class=${cls} href=${href}>${label}</a>` : html`<button type="button" class=${cls} @click=${() => openCheckout()}>${label}</button>`;
}
__name(renderCta, "renderCta");
function injectStyles(id, css2) {
  let style = document.getElementById(id);
  style || (style = document.createElement("style"), style.id = id, document.head.appendChild(style)), style.textContent !== css2 && (style.textContent = css2);
}
__name(injectStyles, "injectStyles");
function injectFonts() {
  if (document.getElementById("nq-fonts")) return;
  const preconnect = document.createElement("link");
  preconnect.id = "nq-fonts", preconnect.rel = "stylesheet", preconnect.href = "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Almarai:wght@300;400;700&display=swap", document.head.appendChild(preconnect);
}
__name(injectFonts, "injectFonts");
function sectionStyle(cfg) {
  return cfg.bg_color ? `--nq-section-bg:${cfg.bg_color}` : "";
}
__name(sectionStyle, "sectionStyle");
function watchReveal(host) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return host.querySelectorAll(".nq-rev").forEach((el) => el.classList.add("in")), () => {
    };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.isIntersecting && (entry.target.classList.add("in"), io.unobserve(entry.target));
    });
  }, { threshold: 0.14 }), scan = /* @__PURE__ */ __name(() => host.querySelectorAll(".nq-rev:not(.in)").forEach((el) => io.observe(el)), "scan"), mo = new MutationObserver(scan);
  return mo.observe(host, { childList: !0, subtree: !0 }), scan(), () => {
    io.disconnect(), mo.disconnect();
  };
}
__name(watchReveal, "watchReveal");
const baseCss = `
.nq-host { display: block; width: 100%; min-width: 0; container-type: inline-size; }
body:has(.nq-host) { background: #f7f4ef; }
.component-card:has(> .nq-host:not(:empty)) { min-height: 0; }
.nq-root {
  --ink:#101014; --ink-soft:#2a2a30; --ivory:#f7f4ef; --sand:#e8dfd3; --sand-2:#d9ccbb;
  --gold:#b8945f; --gold-soft:#d8c49c; --line:#ddd2c4; --muted:#7d7468;
  --max:1240px; --pad:clamp(18px,4vw,48px);
  --serif:'Amiri',"Times New Roman",serif; --sans:'Almarai',system-ui,sans-serif;
  display: block; box-sizing: border-box; color: var(--ink); font-family: var(--sans); font-weight: 300; line-height: 1.75;
  -webkit-font-smoothing: antialiased;
}
.nq-root *, .nq-root *::before, .nq-root *::after { box-sizing: border-box; }
.nq-root img { max-width: 100%; display: block; }
.nq-root a { color: inherit; text-decoration: none; }
.nq-root a.nq-btn, .nq-root button.nq-btn { color: var(--ivory); background: var(--ink); }
.nq-root a.nq-btn.ghost, .nq-root button.nq-btn.ghost { color: var(--ink); background: transparent; border-color: var(--line); }
.nq-root a.nq-btn.light, .nq-root button.nq-btn.light { color: var(--ink); background: var(--ivory); border-color: var(--ivory); }
.nq-root a.nq-btn:hover, .nq-root button.nq-btn:hover { background: transparent; color: var(--ink); }
.nq-root a.nq-btn.ghost:hover, .nq-root button.nq-btn.ghost:hover { color: var(--ink); border-color: var(--ink); }
.nq-root a.nq-btn.light:hover, .nq-root button.nq-btn.light:hover { background: transparent; color: var(--ivory); border-color: var(--gold); }
.nq-root h1, .nq-root h2, .nq-root h3, .nq-root h4, .nq-root p, .nq-root ul { margin: 0; }
.nq-root button, .nq-root a { font: inherit; }
.nq-wrap { max-width: var(--max); margin-inline: auto; padding-inline: var(--pad); }
.nq-sec { padding-block: clamp(56px, 9vw, 120px); }
.nq-eyebrow { font-size: .72rem; letter-spacing: .34em; text-transform: uppercase; color: var(--gold); margin: 0 0 14px; }
.nq-h2 { font-family: var(--serif); font-weight: 700; font-size: clamp(1.9rem, 4.4vw, 3.3rem); line-height: 1.2; margin: 0 0 14px; letter-spacing: -.01em; }
.nq-lead { color: var(--muted); max-width: 56ch; margin: 0; }
.nq-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; padding: 15px 30px; background: var(--ink); color: var(--ivory); font-family: var(--sans); font-size: .92rem; font-weight: 400; letter-spacing: .04em; border: 1px solid var(--ink); cursor: pointer; transition: .35s; }
.nq-btn:hover { background: transparent; color: var(--ink); }
.nq-btn.ghost { background: transparent; color: var(--ink); border-color: var(--line); }
.nq-btn.ghost:hover { border-color: var(--ink); }
.nq-btn.light { background: var(--ivory); color: var(--ink); border-color: var(--ivory); }
.nq-btn.light:hover { background: transparent; color: var(--ivory); border-color: var(--gold); }
.nq-btn:focus-visible, .nq-root a:focus-visible, .nq-root button:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; }
.nq-rev { opacity: 0; transform: translateY(26px); transition: opacity .9s cubic-bezier(.2,.7,.2,1), transform .9s cubic-bezier(.2,.7,.2,1); }
.nq-rev.in { opacity: 1; transform: none; }
.nq-ph { position: relative; overflow: hidden; background: linear-gradient(150deg, var(--sand), var(--sand-2)); aspect-ratio: 3/4; }
.nq-ph img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.nq-ph::before { content: ""; position: absolute; inset: 14px; border: 1px solid rgba(255,255,255,.5); z-index: 2; pointer-events: none; }
.nq-ph::after { content: ""; position: absolute; inset: 0; background: radial-gradient(70% 55% at 50% 12%, rgba(255,255,255,.55), transparent 60%), linear-gradient(180deg, transparent 45%, rgba(16,16,20,.16)); z-index: 1; pointer-events: none; }
.nq-ph figure { position: absolute; inset: 0; margin: 0; display: grid; place-items: end center; padding-bottom: 22px; z-index: 3; }
.nq-ph figcaption { position: relative; z-index: 2; font-size: .74rem; letter-spacing: .22em; color: #fff; text-transform: uppercase; }
.nq-silhouette { position: absolute; inset: 0; z-index: 1; opacity: .6; }
.nq-empty { padding: 1.2rem; border: 1px dashed var(--line); color: var(--muted); text-align: center; }
@media (prefers-reduced-motion: reduce) {
  .nq-rev { opacity: 1; transform: none; transition: none; }
  .nq-mq-track { animation: none !important; }
}
`;
var __defProp2 = Object.defineProperty, __decorateClass = /* @__PURE__ */ __name((decorators, target, key, kind) => {
  for (var result = void 0, i = decorators.length - 1, decorator; i >= 0; i--)
    (decorator = decorators[i]) && (result = decorator(target, key, result) || result);
  return result && __defProp2(target, key, result), result;
}, "__decorateClass");
const css = `
.nq-bar { position: relative; background: var(--nq-section-bg, rgba(247,244,239,.86)); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
.nq-nav { display: flex; align-items: center; gap: 26px; min-height: 74px; }
.nq-logo { font-family: var(--serif); font-weight: 700; font-size: 1.5rem; letter-spacing: .02em; line-height: 1; }
.nq-logo small { display: block; font-family: var(--sans); font-size: .6rem; letter-spacing: .4em; color: var(--gold); font-weight: 400; margin-top: 4px; }
.nq-logo img { height: 42px; width: auto; max-width: 42vw; object-fit: contain; }
.nq-nav ul { display: flex; gap: 28px; list-style: none; margin: 0; padding: 0; font-size: .88rem; }
.nq-nav ul a { position: relative; padding-block: 4px; }
.nq-nav ul a::after { content: ""; position: absolute; inset-inline: 0; bottom: 0; height: 1px; background: var(--ink); transform: scaleX(0); transform-origin: right; transition: .35s; }
.nq-nav ul a:hover::after { transform: scaleX(1); }
.nq-sp { margin-inline-start: auto; }
.nq-ico, .nq-menu { display: inline-grid; place-items: center; width: 40px; height: 40px; border: 1px solid var(--line); border-radius: 50%; background: transparent; color: inherit; cursor: pointer; font-size: .95rem; }
.nq-menu { display: none; }
@container (max-width: 860px) {
  .nq-nav { gap: 10px; }
  .nq-logo { font-size: 1.15rem; white-space: nowrap; }
  .nq-nav .nq-btn { padding: 10px 14px; min-height: 44px; white-space: nowrap; }
  .nq-nav ul { display: none; position: absolute; inset-inline: 0; top: 100%; z-index: 5; flex-direction: column; gap: 0; padding: 8px 0 14px; background: var(--ivory); border-bottom: 1px solid var(--line); }
  .nq-nav.is-open ul { display: flex; }
  .nq-nav ul a { display: block; padding: 12px var(--pad); }
  .nq-menu { display: inline-grid; }
}
`, _PageBar = class _PageBar extends LitElement {
  constructor() {
    super(...arguments), this.open = !1, this.stop = () => {
    }, this.pinned = null, this.opened = [];
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("nq-host"), injectFonts(), injectStyles("nq-base", baseCss), injectStyles("nq-page-bar", css);
    const stopLocale = watchLocale(this), stopReveal = watchReveal(this);
    this.stop = () => {
      stopLocale(), stopReveal(), this.release();
    };
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  updated() {
    this.pin();
  }
  outerBox() {
    let node = this;
    for (; node.parentElement && node.parentElement !== document.body && node.parentElement !== document.documentElement; ) {
      const parent = node.parentElement;
      if ([...parent.children].filter((el) => el.tagName !== "SCRIPT" && el.tagName !== "STYLE").length > 1) return node;
      node = parent;
    }
    return node;
  }
  pin() {
    const cfg = getConfig(this.config), sticky = flag(cfg.sticky), outer = this.outerBox();
    if (this.pinned && this.pinned !== outer && this.release(), this.pinned = outer, outer.style.position = sticky ? "sticky" : "", outer.style.top = sticky ? "0" : "", outer.style.zIndex = sticky ? "40" : "", this.opened.forEach((el) => {
      el.style.overflow = "";
    }), this.opened = [], !sticky) return;
    let node = outer.parentElement;
    for (; node && node !== document.body && node !== document.documentElement; ) {
      const flow = getComputedStyle(node);
      if (flow.overflowY === "auto" || flow.overflowY === "scroll") break;
      (flow.overflowY === "hidden" || flow.overflowX === "hidden") && (node.style.overflow = "clip", this.opened.push(node)), node = node.parentElement;
    }
  }
  release() {
    this.pinned && (this.pinned.style.position = this.pinned.style.top = this.pinned.style.zIndex = "", this.pinned = null), this.opened.forEach((el) => {
      el.style.overflow = "";
    }), this.opened = [];
  }
  render() {
    const cfg = getConfig(this.config), brand = localizedString(cfg.brand) || t({ ar: "المتجر", en: "Store" }), mark = localizedString(cfg.mark), links = getCollectionItems(cfg.links, "links").map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" })).filter((item) => item.label), search = linkHref(cfg.search_url);
    return html`<header class="nq-root nq-bar" style=${sectionStyle(cfg)}>
      <nav class="nq-nav nq-wrap ${this.open ? "is-open" : ""}">
        <a href=${linkHref(cfg.home_url) || "#"} class="nq-logo" aria-label=${brand}>
          ${cfg.logo ? html`<img src=${cfg.logo} alt=${brand} />` : html`${brand}${mark ? html`<small>${mark}</small>` : nothing}`}
        </a>
        ${links.length ? html`<ul>${links.map((item) => html`<li><a href=${item.url} @click=${() => {
      this.open = !1;
    }}>${item.label}</a></li>`)}</ul>` : nothing}
        <span class="nq-sp"></span>
        ${flag(cfg.show_search) && search ? html`<a href=${search} class="nq-ico" aria-label=${t({ ar: "البحث", en: "Search" })}>⌕</a>` : nothing}
        <button type="button" class="nq-menu" aria-expanded=${this.open ? "true" : "false"} aria-label=${t({ ar: "القائمة", en: "Menu" })} @click=${() => {
      this.open = !this.open;
    }}>☰</button>
        ${renderCta(cfg.cta_label, linkHref(cfg.cta_url))}
      </nav>
    </header>`;
  }
};
__name(_PageBar, "PageBar");
let PageBar = _PageBar;
__decorateClass([
  property({ type: Object })
], PageBar.prototype, "config");
__decorateClass([
  state()
], PageBar.prototype, "open");
typeof PageBar < "u" && PageBar.registerSallaComponent("salla-page-bar");
export {
  PageBar as default
};
