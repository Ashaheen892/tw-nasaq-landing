var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// tw-nasaq-landing/src/components/ribbon-line/index.ts
import { html as html2, LitElement } from "lit";
import { property } from "lit/decorators.js";

// tw-nasaq-landing/src/utils/config.ts
function getConfig(raw) {
  if (!raw) return {};
  if (raw.component && typeof raw.component === "object") return raw.component;
  return raw;
}
__name(getConfig, "getConfig");
function getLocale() {
  const lang = window.Salla?.lang?.getLocale?.() || document.documentElement.lang || "ar";
  return String(lang).toLowerCase().startsWith("en") ? "en" : "ar";
}
__name(getLocale, "getLocale");
function localizedString(value) {
  if (value === null || value === void 0 || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const obj = value;
    const text = obj[getLocale()] || obj.ar || obj.en;
    return typeof text === "string" ? text : "";
  }
  return String(value);
}
__name(localizedString, "localizedString");
function unwrapValue(value) {
  if (Array.isArray(value)) return unwrapValue(value[0]?.value ?? value[0] ?? "");
  if (value && typeof value === "object" && "value" in value) return value.value;
  return value ?? "";
}
__name(unwrapValue, "unwrapValue");
function getCollectionItems(items, prefix) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (!item || typeof item !== "object") return {};
    const normalized = {};
    for (const [key, val] of Object.entries(item)) {
      normalized[key.startsWith(`${prefix}.`) ? key.slice(prefix.length + 1) : key] = val;
    }
    return normalized;
  });
}
__name(getCollectionItems, "getCollectionItems");
function watchLocale(host) {
  const update = /* @__PURE__ */ __name(() => host.requestUpdate(), "update");
  window.addEventListener("language-changed", update);
  return () => window.removeEventListener("language-changed", update);
}
__name(watchLocale, "watchLocale");

// tw-nasaq-landing/src/utils/landing.ts
import { html, nothing } from "lit";
function schemeOf(cfg) {
  const scheme = String(unwrapValue(cfg.color_scheme) || "auto");
  if (scheme === "dark") return "nq-dark";
  if (scheme === "light") return "nq-light";
  return "nq-auto";
}
__name(schemeOf, "schemeOf");

// tw-nasaq-landing/src/utils/styles.ts
function injectStyles(id, css2) {
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }
  if (style.textContent !== css2) style.textContent = css2;
}
__name(injectStyles, "injectStyles");
var KIT_FONT = "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Almarai:wght@300;400;700&display=swap";
function setKitFont(on) {
  document.documentElement.classList.toggle("nq-kit-font", on);
  const current = document.getElementById("nq-fonts");
  if (!on) {
    current?.remove();
    return;
  }
  if (current) return;
  const link = document.createElement("link");
  link.id = "nq-fonts";
  link.rel = "stylesheet";
  link.href = KIT_FONT;
  document.head.appendChild(link);
}
__name(setKitFont, "setKitFont");
function injectFonts() {
  if (!document.documentElement.classList.contains("nq-kit-font")) return;
  setKitFont(true);
}
__name(injectFonts, "injectFonts");
function sectionStyle(cfg) {
  return cfg.bg_color ? `--nq-section-bg:${cfg.bg_color}` : "";
}
__name(sectionStyle, "sectionStyle");
var LIGHT = `--ink:#101014; --ink-soft:#2a2a30; --ivory:#f7f4ef; --sand:#e8dfd3; --sand-2:#d9ccbb; --gold:#b8945f; --gold-soft:#d8c49c; --line:#ddd2c4; --muted:#7d7468; --card:#ffffff; --page:#f7f4ef;`;
var DARK = `--ink:#f3efe8; --ink-soft:#d9d1c6; --ivory:#14130f; --sand:#2a261f; --sand-2:#3a342b; --gold:#d4b483; --gold-soft:#e6d3b0; --line:rgba(243,239,232,.16); --muted:#b7ab9c; --card:#1c1a16; --page:#0e0d0b;`;
var baseCss = `
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

// tw-nasaq-landing/src/components/ribbon-line/index.ts
var css = `
.nq-mq { border-block: 1px solid var(--line); background: var(--nq-section-bg, var(--card)); overflow: hidden; padding-block: 16px; }
.nq-mq-track { display: flex; width: max-content; animation: nq-mq 36s linear infinite; }
.nq-mq-set { display: flex; flex: none; align-items: center; }
.nq-mq-set span { font-family: var(--serif); font-size: 1.05rem; color: var(--muted); white-space: nowrap; display: inline-flex; align-items: center; gap: 48px; padding-inline-end: 48px; }
.nq-mq-set span::after { content: "\u25C6"; font-size: .55rem; color: var(--gold); }
.nq-mq:hover .nq-mq-track, .nq-mq:focus-within .nq-mq-track { animation-play-state: paused; }
@keyframes nq-mq { to { transform: translateX(50%); } }
html[dir="ltr"] .nq-mq-track { animation-name: nq-mq-ltr; }
@keyframes nq-mq-ltr { to { transform: translateX(-50%); } }
`;
var _RibbonLine = class _RibbonLine extends LitElement {
  constructor() {
    super(...arguments);
    this.stop = /* @__PURE__ */ __name(() => {
    }, "stop");
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    this.classList.add("nq-host");
    injectFonts();
    injectStyles("nq-base", baseCss);
    injectStyles("nq-ribbon-line", css);
    this.stop = watchLocale(this);
  }
  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }
  render() {
    const cfg = getConfig(this.config);
    const items = getCollectionItems(cfg.items, "items").map((item) => localizedString(item.text)).filter(Boolean);
    const times = items.length ? Math.max(2, Math.ceil(12 / items.length)) : 0;
    const unit = times ? Array.from({ length: times }, () => items).flat() : [];
    const row = /* @__PURE__ */ __name((hidden) => html2`<div class="nq-mq-set" aria-hidden=${hidden ? "true" : "false"}>${unit.map((item) => html2`<span>${item}</span>`)}</div>`, "row");
    return html2`<div class=${`nq-root nq-mq ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <div class="nq-mq-track">${row(false)}${row(true)}</div>
    </div>`;
  }
};
__name(_RibbonLine, "RibbonLine");
__decorateClass([
  property({ type: Object })
], _RibbonLine.prototype, "config", 2);
var RibbonLine = _RibbonLine;
export {
  RibbonLine as default
};
typeof RibbonLine < "u" && RibbonLine.registerSallaComponent("salla-ribbon-line");
