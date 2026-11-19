var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { LitElement, nothing, html } from "lit";
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
.nq-foot { background: var(--nq-section-bg, var(--ink)); color: #b9b2a7; padding-block: 48px 34px; font-size: .86rem; }
.nq-foot .nq-logo { color: var(--ivory); }
.nq-ft { display: flex; flex-wrap: wrap; gap: 30px 48px; justify-content: space-between; align-items: flex-start; }
.nq-ft h5 { color: var(--ivory); font-family: var(--serif); font-size: 1rem; margin: 0 0 14px; font-weight: 700; }
.nq-ft ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.nq-about { max-width: 30ch; }
.nq-about p { margin: 14px 0 0; }
.nq-pay { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.nq-pay span { border: 1px solid rgba(247,244,239,.2); padding: 5px 10px; font-size: .68rem; letter-spacing: .08em; }
.nq-copy { margin-top: 34px; padding-top: 20px; border-top: 1px solid rgba(247,244,239,.14); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-size: .78rem; }
.nq-logo { font-family: var(--serif); font-weight: 700; font-size: 1.5rem; letter-spacing: .02em; line-height: 1; color: var(--ivory); }
.nq-logo small { display: block; font-family: var(--sans); font-size: .6rem; letter-spacing: .4em; color: var(--gold); font-weight: 400; margin-top: 4px; }
.nq-logo img { height: 42px; width: auto; object-fit: contain; }
`, _PageFooter = class _PageFooter extends LitElement {
  constructor() {
    super(...arguments), this.storeName = "", this.stop = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    var _a;
    super.connectedCallback(), this.classList.add("nq-host"), injectFonts(), injectStyles("nq-base", baseCss), injectStyles("nq-page-footer", css), this.stop = watchLocale(this);
    const api = window.Salla, read = /* @__PURE__ */ __name(() => {
      var _a2;
      this.storeName = ((_a2 = api == null ? void 0 : api.config) == null ? void 0 : _a2.get("store.name")) || "";
    }, "read");
    read(), (_a = api == null ? void 0 : api.onReady) == null || _a.call(api).then(read);
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  render() {
    const cfg = getConfig(this.config), brand = localizedString(cfg.brand) || this.storeName || t({ ar: "المتجر", en: "Store" }), mark = localizedString(cfg.mark), columns = [1, 2, 3].map((index) => ({
      title: localizedString(cfg[`col${index}_title`]),
      links: getCollectionItems(cfg[`col${index}`], `col${index}`).map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" })).filter((item) => item.label)
    })).filter((column) => column.title || column.links.length), pays = getCollectionItems(cfg.payments, "payments").map((item) => localizedString(item.label)).filter(Boolean);
    return html`<footer class="nq-root nq-foot" style=${sectionStyle(cfg)}>
      <div class="nq-wrap">
        <div class="nq-ft">
          <div class="nq-about">
            <a href="#" class="nq-logo">${cfg.logo ? html`<img src=${cfg.logo} alt=${brand} />` : html`${brand}${mark ? html`<small>${mark}</small>` : nothing}`}</a>
            ${localizedString(cfg.about) ? html`<p>${localizedString(cfg.about)}</p>` : nothing}
            ${pays.length ? html`<div class="nq-pay">${pays.map((pay) => html`<span>${pay}</span>`)}</div>` : nothing}
          </div>
          ${columns.map((column) => html`<div>
            ${column.title ? html`<h5>${column.title}</h5>` : nothing}
            <ul>${column.links.map((link) => html`<li><a href=${link.url}>${link.label}</a></li>`)}</ul>
          </div>`)}
        </div>
        <div class="nq-copy">
          <span>${localizedString(cfg.copyright)}</span>
          <span>${localizedString(cfg.legal)}</span>
        </div>
      </div>
    </footer>`;
  }
};
__name(_PageFooter, "PageFooter");
let PageFooter = _PageFooter;
__decorateClass([
  property({ type: Object })
], PageFooter.prototype, "config");
__decorateClass([
  state()
], PageFooter.prototype, "storeName");
typeof PageFooter < "u" && PageFooter.registerSallaComponent("salla-page-footer");
export {
  PageFooter as default
};
