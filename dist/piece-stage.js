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
function pickedId(value) {
  const first = Array.isArray(value) ? value[0] : value;
  if (first == null || first === "") return null;
  if (typeof first == "object") {
    const id = first.value ?? first.id;
    return id ? String(id) : null;
  }
  return String(first);
}
__name(pickedId, "pickedId");
async function fetchProduct(id) {
  var _a, _b, _c, _d;
  const api = window.Salla;
  if (!id || !((_b = (_a = api == null ? void 0 : api.product) == null ? void 0 : _a.api) != null && _b.getDetails)) return null;
  try {
    await ((_c = api.onReady) == null ? void 0 : _c.call(api));
    const res = await api.product.api.getDetails(id, ["images", "rating", "options"]);
    return (_d = res == null ? void 0 : res.data) != null && _d.id ? res.data : null;
  } catch {
    return null;
  }
}
__name(fetchProduct, "fetchProduct");
function money(amount) {
  const api = window.Salla;
  return api != null && api.money ? api.money(amount) : String(amount);
}
__name(money, "money");
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
function schemeOf(cfg) {
  const scheme = String(unwrapValue(cfg.color_scheme) || "auto");
  return scheme === "dark" ? "nq-dark" : scheme === "light" ? "nq-light" : "nq-auto";
}
__name(schemeOf, "schemeOf");
function markEditing() {
  var _a, _b;
  const root = document.documentElement, read = /* @__PURE__ */ __name(() => {
    var _a2, _b2;
    let on = !0;
    try {
      const salla2 = window.Salla;
      on = window.self !== window.top || ((_b2 = (_a2 = salla2 == null ? void 0 : salla2.config) == null ? void 0 : _a2.get) == null ? void 0 : _b2.call(_a2, "page.is_landing_page")) !== !0;
    } catch {
      on = !0;
    }
    root.dataset.lpEditing = on ? "1" : "0";
  }, "read");
  if (!root.dataset.lpEditing) {
    read();
    try {
      (_b = (_a = window.Salla) == null ? void 0 : _a.onReady) == null || _b.call(_a, read);
    } catch {
    }
  }
}
__name(markEditing, "markEditing");
function injectStyles(id, css2) {
  markEditing();
  let style = document.getElementById(id);
  style || (style = document.createElement("style"), style.id = id, document.head.appendChild(style)), style.textContent !== css2 && (style.textContent = css2);
}
__name(injectStyles, "injectStyles");
const KIT_FONT = "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Almarai:wght@300;400;700&display=swap";
function setKitFont(on) {
  if (document.documentElement.classList.toggle("nq-kit-font", on), document.getElementById("nq-fonts")) return;
  const link = document.createElement("link");
  link.id = "nq-fonts", link.rel = "stylesheet", link.href = KIT_FONT, document.head.appendChild(link);
}
__name(setKitFont, "setKitFont");
function injectFonts() {
  document.documentElement.classList.contains("nq-kit-font") && setKitFont(!0);
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
const LIGHT = "--ink:#101014; --ink-soft:#2a2a30; --ivory:#f7f4ef; --sand:#e8dfd3; --sand-2:#d9ccbb; --gold:#b8945f; --gold-soft:#d8c49c; --line:#ddd2c4; --muted:#7d7468; --card:#ffffff; --page:#f7f4ef;", DARK = "--ink:#f3efe8; --ink-soft:#d9d1c6; --ivory:#14130f; --sand:#2a261f; --sand-2:#3a342b; --gold:#d4b483; --gold-soft:#e6d3b0; --line:rgba(243,239,232,.16); --muted:#b7ab9c; --card:#1c1a16; --page:#0e0d0b;", baseCss = `
html[data-lp-editing="0"] .nq-empty, html[data-lp-editing="0"] .nq-hint { display: none !important; }
.nq-host { display: block; width: 100%; min-width: 0; container-type: inline-size; }
body:has(.nq-host) { background: #f7f4ef; }
html.nq-mode-light { ${LIGHT} }
html.nq-mode-dark { ${DARK} }
html.nq-mode-dark body:has(.nq-host) { background: #0e0d0b; }
.component-card:has(> .nq-host:not(:empty)) { min-height: 0; }
.nq-root {
  ${LIGHT}
  --max:1240px; --pad:clamp(18px,4vw,48px);
  --serif:inherit; --sans:inherit;
  display: block; box-sizing: border-box; color: var(--ink); font-family: var(--font-main, inherit); font-weight: 300; line-height: 1.75;
  -webkit-font-smoothing: antialiased;
}
html.nq-kit-font .nq-root { --serif:'Amiri',"Times New Roman",serif; --sans:'Almarai',system-ui,sans-serif; font-family: var(--sans); }
.nq-root.nq-light { ${LIGHT} }
.nq-root.nq-dark, html.nq-mode-dark .nq-root.nq-auto { ${DARK} }
@media (prefers-color-scheme: dark) {
  html:not(.nq-mode-light) body:has(.nq-host) { background: #0e0d0b; }
  html:not(.nq-mode-light) .nq-root.nq-auto { ${DARK} }
}
.nq-root *, .nq-root *::before, .nq-root *::after { box-sizing: border-box; }
.nq-root img { max-width: 100%; display: block; }
.nq-root a { color: inherit; text-decoration: none; }
.nq-root a.nq-btn, .nq-root button.nq-btn { color: var(--color-primary-reverse, var(--ivory)); background: var(--color-primary, var(--ink)); border-color: var(--color-primary, var(--ink)); }
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
.nq-btn { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; padding: 15px 30px; background: var(--color-primary, var(--ink)); color: var(--color-primary-reverse, var(--ivory)); font-family: var(--font-main, inherit); font-size: .92rem; font-weight: 500; letter-spacing: .04em; border: 1px solid var(--color-primary, var(--ink)); cursor: pointer; transition: .35s; }
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
function silhouette() {
  return html`<svg class="nq-silhouette" viewBox="0 0 100 160" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><path d="M50 18c6 0 9 4 9 9 0 5-2 7-2 10l14 7c6 3 9 8 10 15l6 81H13l6-81c1-7 4-12 10-15l14-7c0-3-2-5-2-10 0-5 3-9 9-9z" fill="rgba(16,16,20,.34)"/></svg>`;
}
__name(silhouette, "silhouette");
function textOf(value) {
  return typeof value == "string" ? value : localizedString(value);
}
__name(textOf, "textOf");
function amountOf(value) {
  if (typeof value == "number" && Number.isFinite(value)) return value;
  if (value && typeof value == "object" && "amount" in value) {
    const n = Number(value.amount);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
__name(amountOf, "amountOf");
function linesOf(value) {
  return localizedString(value).split(`
`).map((line) => line.trim()).filter(Boolean);
}
__name(linesOf, "linesOf");
var __defProp2 = Object.defineProperty, __decorateClass = /* @__PURE__ */ __name((decorators, target, key, kind) => {
  for (var result = void 0, i = decorators.length - 1, decorator; i >= 0; i--)
    (decorator = decorators[i]) && (result = decorator(target, key, result) || result);
  return result && __defProp2(target, key, result), result;
}, "__decorateClass");
const css = `
.nq-piece { background: var(--nq-section-bg, var(--ivory)); }
.nq-sp-g { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(26px, 5vw, 70px); align-items: center; }
.nq-gal { display: grid; gap: 12px; grid-template-columns: 76px 1fr; }
.nq-thumbs { display: grid; gap: 12px; align-content: start; }
.nq-thumb { aspect-ratio: 3/4; border: 1px solid var(--line); background: linear-gradient(150deg, var(--sand), var(--sand-2)); cursor: pointer; transition: .3s; opacity: .6; padding: 0; position: relative; overflow: hidden; }
.nq-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.nq-thumb[aria-selected="true"] { opacity: 1; border-color: var(--ink); }
.nq-piece h2 { font-family: var(--serif); font-size: clamp(1.8rem, 3.6vw, 2.7rem); margin: 0 0 10px; font-weight: 700; }
.nq-stars { color: var(--gold); letter-spacing: .2em; font-size: .9rem; }
.nq-stars small { color: var(--muted); letter-spacing: 0; margin-inline-start: 8px; font-family: var(--sans); }
.nq-price-row { display: flex; align-items: baseline; gap: 14px; margin: 22px 0; flex-wrap: wrap; }
.nq-price-row b { font-family: var(--serif); font-size: 2.2rem; font-weight: 700; }
.nq-price-row s { color: var(--muted); }
.nq-off { background: var(--ink); color: var(--ivory); font-size: .72rem; padding: 4px 10px; letter-spacing: .1em; }
.nq-opts { margin: 24px 0; }
.nq-opts h4 { font-size: .78rem; letter-spacing: .16em; color: var(--muted); margin: 0 0 10px; font-weight: 400; }
.nq-sizes, .nq-swatches { display: flex; gap: 8px; flex-wrap: wrap; }
.nq-swatches { gap: 10px; }
.nq-size { min-width: 46px; padding: 10px 12px; text-align: center; border: 1px solid var(--line); background: var(--card); font-family: var(--sans); font-size: .86rem; cursor: pointer; transition: .25s; }
.nq-size[aria-pressed="true"] { background: var(--ink); color: var(--ivory); border-color: var(--ink); }
.nq-size[disabled] { opacity: .35; cursor: not-allowed; text-decoration: line-through; }
.nq-sw { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--line); cursor: pointer; position: relative; padding: 0; }
.nq-sw[aria-pressed="true"]::after { content: ""; position: absolute; inset: -5px; border: 1px solid var(--ink); border-radius: 50%; }
.nq-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--line); margin-top: 30px; }
.nq-tab { padding: 12px 18px; background: none; border: 0; border-bottom: 1px solid transparent; font-family: var(--sans); font-size: .88rem; color: var(--muted); cursor: pointer; margin-bottom: -1px; }
.nq-tab[aria-selected="true"] { color: var(--ink); border-bottom-color: var(--ink); }
.nq-panel { padding-top: 16px; font-size: .92rem; color: var(--muted); }
.nq-panel[hidden] { display: none; }
.nq-panel ul { margin: 0; padding-inline-start: 18px; }
.nq-hero-cta { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
@container (max-width: 880px) { .nq-sp-g { grid-template-columns: 1fr; } }
`, _PieceStage = class _PieceStage extends LitElement {
  constructor() {
    super(...arguments), this.product = null, this.photo = 0, this.size = "", this.color = "", this.tab = 0, this.loadedId = "", this.stop = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("nq-host"), injectFonts(), injectStyles("nq-base", baseCss), injectStyles("nq-piece-stage", css);
    const stopLocale = watchLocale(this), stopReveal = watchReveal(this);
    this.stop = () => {
      stopLocale(), stopReveal();
    };
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  updated() {
    const cfg = getConfig(this.config), id = pickedId(cfg.product) || landingProductId() || "";
    id && id !== this.loadedId && (this.loadedId = id, fetchProduct(id).then((product) => {
      this.loadedId === id && (this.product = product);
    })), !id && this.loadedId && (this.loadedId = "", this.product = null);
  }
  render() {
    var _a, _b, _c, _d, _e;
    const cfg = getConfig(this.config), photos = this.photos(cfg), sizes = this.sizes(cfg), colors = this.colors(cfg), tabs = this.tabs(cfg), active = photos[this.photo] || photos[0], title = textOf((_a = this.product) == null ? void 0 : _a.name) || localizedString(cfg.title), price = this.price(cfg), rating = this.rating(cfg), sizeLabel = this.size || ((_b = sizes.find((item) => item.picked && !item.disabled)) == null ? void 0 : _b.label) || ((_c = sizes.find((item) => !item.disabled)) == null ? void 0 : _c.label) || "", colorLabel = this.color || ((_d = colors.find((item) => item.picked)) == null ? void 0 : _d.label) || ((_e = colors[0]) == null ? void 0 : _e.label) || "", id = String(cfg.anchor || "product");
    return html`<section class=${`nq-root nq-sec nq-piece ${schemeOf(cfg)}`} id=${id} style=${sectionStyle(cfg)} aria-label=${title || "product"}>
      <div class="nq-wrap nq-sp-g">
        <div class="nq-gal nq-rev">
          ${photos.length > 1 ? html`<div class="nq-thumbs">
            ${photos.map((item, index) => html`<button type="button" class="nq-thumb" aria-label=${item.caption || String(index + 1)} aria-selected=${String(index === this.photo)} @click=${() => {
      this.photo = index;
    }}>
              ${item.image ? html`<img src=${item.image} alt="" />` : nothing}
            </button>`)}
          </div>` : nothing}
          <div class="nq-ph">
            ${active != null && active.image ? html`<img src=${active.image} alt=${active.caption || title} />` : silhouette()}
            ${active != null && active.caption ? html`<figure><figcaption>${active.caption}</figcaption></figure>` : nothing}
          </div>
        </div>
        <div class="nq-rev">
          ${localizedString(cfg.kicker) ? html`<p class="nq-eyebrow">${localizedString(cfg.kicker)}</p>` : nothing}
          ${title ? html`<h2>${title}</h2>` : nothing}
          ${rating ? html`<div class="nq-stars">★★★★★ <small>${rating}</small></div>` : nothing}
          <div class="nq-price-row">
            ${price.current ? html`<b>${price.current}</b>` : nothing}
            ${price.compare ? html`<s>${price.compare}</s>` : nothing}
            ${price.save ? html`<span class="nq-off">${price.save}</span>` : nothing}
          </div>
          ${localizedString(cfg.text) && !this.product ? html`<p class="nq-lead">${localizedString(cfg.text)}</p>` : nothing}
          ${this.product && textOf(this.product.promotion_title) ? html`<p class="nq-lead">${textOf(this.product.promotion_title)}</p>` : nothing}
          ${sizes.length ? html`<div class="nq-opts">
            <h4>${localizedString(cfg.size_label) || t({ ar: "المقاس", en: "Size" })}</h4>
            <div class="nq-sizes">
              ${sizes.map((item) => html`<button type="button" class="nq-size" ?disabled=${item.disabled} aria-pressed=${String(sizeLabel === item.label)} @click=${() => {
      this.size = item.label;
    }}>${item.label}</button>`)}
            </div>
          </div>` : nothing}
          ${colors.length ? html`<div class="nq-opts">
            <h4>${localizedString(cfg.color_label) || t({ ar: "اللون", en: "Color" })}</h4>
            <div class="nq-swatches">
              ${colors.map((item) => html`<button type="button" class="nq-sw" style=${`background:${item.hex}`} aria-label=${item.label} aria-pressed=${String(colorLabel === item.label)} @click=${() => {
      this.color = item.label;
    }}></button>`)}
            </div>
          </div>` : nothing}
          <div class="nq-hero-cta">
            ${renderCta(cfg.primary_label, linkHref(cfg.primary_url))}
            ${localizedString(cfg.secondary_label) && linkHref(cfg.secondary_url) ? html`<a class="nq-btn ghost" href=${linkHref(cfg.secondary_url)}>${localizedString(cfg.secondary_label)}</a>` : nothing}
          </div>
          ${tabs.length ? html`<div class="nq-tabs" role="tablist">
            ${tabs.map((item, index) => html`<button type="button" class="nq-tab" role="tab" aria-selected=${String(this.tab === index)} @click=${() => {
      this.tab = index;
    }}>${item.label}</button>`)}
          </div>
          ${tabs.map((item, index) => html`<div class="nq-panel" role="tabpanel" ?hidden=${this.tab !== index}><ul>${item.lines.map((line) => html`<li>${line}</li>`)}</ul></div>`)}` : nothing}
        </div>
      </div>
    </section>`;
  }
  photos(cfg) {
    var _a;
    const remote = Array.isArray((_a = this.product) == null ? void 0 : _a.images) ? this.product.images.map((item) => String((item == null ? void 0 : item.url) || "")).filter(Boolean).map((image) => {
      var _a2;
      return { image, caption: textOf((_a2 = this.product) == null ? void 0 : _a2.name) };
    }) : [];
    return remote.length ? remote : getCollectionItems(cfg.photos, "photos").map((item) => ({ image: String(item.image || ""), caption: localizedString(item.caption) })).filter((item) => item.caption || item.image);
  }
  sizes(cfg) {
    const remote = this.optionValues(cfg.size_label);
    return remote.length ? remote : getCollectionItems(cfg.sizes, "sizes").map((item) => ({
      label: localizedString(item.label),
      disabled: item.available === !1 || item.available === "false",
      picked: item.picked === !0 || item.picked === "true"
    })).filter((item) => item.label);
  }
  colors(cfg) {
    return getCollectionItems(cfg.colors, "colors").map((item) => ({
      label: localizedString(item.label),
      hex: String(item.hex || "#15151a"),
      picked: item.picked === !0 || item.picked === "true"
    })).filter((item) => item.label);
  }
  tabs(cfg) {
    return getCollectionItems(cfg.tabs, "tabs").map((item) => ({ label: localizedString(item.label), lines: linesOf(item.lines) })).filter((item) => item.label && item.lines.length);
  }
  optionValues(label) {
    var _a;
    const options = Array.isArray((_a = this.product) == null ? void 0 : _a.options) ? this.product.options : [], wanted = localizedString(label), match = options.find((option) => textOf(option == null ? void 0 : option.name) === wanted) || options[0], values = Array.isArray(match == null ? void 0 : match.values) ? match.values : [];
    return !values.length || options.length > 2 ? [] : values.map((value) => ({
      label: textOf((value == null ? void 0 : value.name) || (value == null ? void 0 : value.option_value)),
      disabled: !!(value != null && value.is_out_of_stock || value != null && value.is_out),
      picked: !1
    })).filter((item) => item.label);
  }
  price(cfg) {
    var _a, _b, _c;
    const sale = amountOf((_a = this.product) == null ? void 0 : _a.sale_price), regular = amountOf((_b = this.product) == null ? void 0 : _b.regular_price), currentAmount = amountOf((_c = this.product) == null ? void 0 : _c.price);
    if (this.product && (sale || currentAmount)) {
      const current = sale && sale > 0 ? sale : currentAmount, compare = regular && current && regular > current ? regular : null, save = compare && current ? localizedString(cfg.save_label).replace("{n}", String(Math.round((1 - current / compare) * 100))) : "";
      return {
        current: current != null ? money(current) : "",
        compare: compare != null ? money(compare) : "",
        save
      };
    }
    return {
      current: localizedString(cfg.price_text),
      compare: localizedString(cfg.compare_text),
      save: localizedString(cfg.save_text)
    };
  }
  rating(cfg) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const stars = Number(((_b = (_a = this.product) == null ? void 0 : _a.rating) == null ? void 0 : _b.stars) ?? ((_d = (_c = this.product) == null ? void 0 : _c.rating) == null ? void 0 : _d.average)), count = Number(((_f = (_e = this.product) == null ? void 0 : _e.rating) == null ? void 0 : _f.count) ?? ((_h = (_g = this.product) == null ? void 0 : _g.rating) == null ? void 0 : _h.total_count));
    if (Number.isFinite(stars) && stars > 0) {
      const score = stars.toFixed(1);
      return count > 0 ? t({ ar: `${score} من ${count} تقييماً`, en: `${score} from ${count} reviews` }) : score;
    }
    return localizedString(cfg.rating_text);
  }
};
__name(_PieceStage, "PieceStage");
let PieceStage = _PieceStage;
__decorateClass([
  property({ type: Object })
], PieceStage.prototype, "config");
__decorateClass([
  state()
], PieceStage.prototype, "product");
__decorateClass([
  state()
], PieceStage.prototype, "photo");
__decorateClass([
  state()
], PieceStage.prototype, "size");
__decorateClass([
  state()
], PieceStage.prototype, "color");
__decorateClass([
  state()
], PieceStage.prototype, "tab");
typeof PieceStage < "u" && PieceStage.registerSallaComponent("salla-piece-stage");
export {
  PieceStage as default
};
