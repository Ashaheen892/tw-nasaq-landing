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

// tw-nasaq-landing/src/components/hero-stage/index.ts
import { html as html3, LitElement, nothing as nothing3 } from "lit";
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
function linkHref(value) {
  if (value == null || value === "") return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return linkHref(value[0]);
  if (typeof value === "object") {
    const obj = value;
    if (obj.url) return linkHref(obj.url);
    if ("value" in obj) return linkHref(obj.value);
    if (obj.href) return linkHref(obj.href);
  }
  return "";
}
__name(linkHref, "linkHref");
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
function salla() {
  return window.Salla;
}
__name(salla, "salla");
function landingSettings() {
  return salla()?.config?.get("theme.settings") || {};
}
__name(landingSettings, "landingSettings");
function isLandingPage() {
  return salla()?.config?.get("page.is_landing_page") === true;
}
__name(isLandingPage, "isLandingPage");
function pageMode() {
  const value = landingSettings().page_for_product;
  if (typeof value === "boolean" || value == null) return value === false ? "promotion" : "product";
  if (typeof value === "string") return value === "promotion" ? "promotion" : "product";
  return Array.isArray(value) && value[0]?.value === "promotion" ? "promotion" : "product";
}
__name(pageMode, "pageMode");
function landingProductId() {
  if (!isLandingPage() || pageMode() !== "product") return null;
  const id = landingSettings().product?.value?.[0];
  return id ? String(id) : null;
}
__name(landingProductId, "landingProductId");
function mainButton() {
  const settings = landingSettings();
  return { text: String(settings.main_btn_text || ""), url: String(settings.main_btn_url || "") };
}
__name(mainButton, "mainButton");
function openCheckout() {
  const checkout = document.querySelector(".s-block--fast-checkout");
  const layout = checkout?.getAttribute("data-layout");
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
  const cls = tone === "ghost" ? "nq-btn ghost" : tone === "light" ? "nq-btn light" : "nq-btn";
  const productPage = Boolean(landingProductId());
  const demo = !isLandingPage();
  if (productPage || demo && !fallbackUrl) {
    return html`<button type="button" class=${cls} @click=${() => openCheckout()}>${label}</button>`;
  }
  const href = (isLandingPage() && pageMode() === "promotion" ? mainButton().url : "") || fallbackUrl;
  if (!href) return html`<button type="button" class=${cls} @click=${() => openCheckout()}>${label}</button>`;
  return html`<a class=${cls} href=${href}>${label}</a>`;
}
__name(renderCta, "renderCta");
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
function watchReveal(host) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    host.querySelectorAll(".nq-rev").forEach((el) => el.classList.add("in"));
    return () => {
    };
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    });
  }, { threshold: 0.14 });
  const scan = /* @__PURE__ */ __name(() => host.querySelectorAll(".nq-rev:not(.in)").forEach((el) => io.observe(el)), "scan");
  const mo = new MutationObserver(scan);
  mo.observe(host, { childList: true, subtree: true });
  scan();
  return () => {
    io.disconnect();
    mo.disconnect();
  };
}
__name(watchReveal, "watchReveal");
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

// tw-nasaq-landing/src/utils/ui.ts
import { html as html2, nothing as nothing2 } from "lit";
function silhouette() {
  return html2`<svg class="nq-silhouette" viewBox="0 0 100 160" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><path d="M50 18c6 0 9 4 9 9 0 5-2 7-2 10l14 7c6 3 9 8 10 15l6 81H13l6-81c1-7 4-12 10-15l14-7c0-3-2-5-2-10 0-5 3-9 9-9z" fill="rgba(16,16,20,.34)"/></svg>`;
}
__name(silhouette, "silhouette");
function frame(src, caption, extra = "") {
  return html2`<div class="nq-ph ${extra}">
    ${src ? html2`<img src=${src} alt=${caption} />` : silhouette()}
    ${caption ? html2`<figure><figcaption>${caption}</figcaption></figure>` : nothing2}
  </div>`;
}
__name(frame, "frame");

// tw-nasaq-landing/src/components/hero-stage/index.ts
var css = `
.nq-hero { position: relative; overflow: hidden; background: var(--nq-section-bg, var(--ivory)); }
.nq-hero-g { display: grid; grid-template-columns: 1.02fr .98fr; gap: clamp(24px, 5vw, 70px); align-items: center; padding-block: clamp(40px, 7vw, 90px); }
.nq-hero h1 { font-family: var(--serif); font-weight: 700; font-size: clamp(2.5rem, 6.6vw, 5.1rem); line-height: 1.05; margin: 0 0 20px; letter-spacing: -.02em; }
.nq-hero h1 em { font-style: normal; color: var(--gold); }
.nq-hero .nq-copy { color: var(--ink-soft); font-size: clamp(1rem, 1.5vw, 1.12rem); max-width: 46ch; margin: 0 0 30px; }
.nq-hero-cta { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
.nq-hero-meta { display: flex; gap: 34px; margin-top: 40px; padding-top: 26px; border-top: 1px solid var(--line); }
.nq-hero-meta b { display: block; font-family: var(--serif); font-size: 1.7rem; font-weight: 700; line-height: 1; }
.nq-hero-meta span { font-size: .76rem; color: var(--muted); letter-spacing: .08em; }
.nq-stack { position: relative; display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.nq-stack .tall { grid-row: span 2; aspect-ratio: 3/5.1; }
.nq-hero-tag { position: absolute; inset-inline-end: var(--pad); top: clamp(24px, 5vw, 60px); writing-mode: vertical-rl; font-size: .7rem; letter-spacing: .42em; color: var(--muted); text-transform: uppercase; }
@container (max-width: 880px) {
  .nq-hero-g { grid-template-columns: 1fr; }
  .nq-hero-tag { display: none; }
  .nq-stack .tall { grid-row: auto; aspect-ratio: 3/4; }
}
`;
var _HeroStage = class _HeroStage extends LitElement {
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
    injectStyles("nq-hero-stage", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    this.stop = () => {
      stopLocale();
      stopReveal();
    };
  }
  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }
  render() {
    const cfg = getConfig(this.config);
    const line = localizedString(cfg.title_line);
    const before = localizedString(cfg.title_before);
    const accent = localizedString(cfg.title_accent);
    const after = localizedString(cfg.title_after);
    const photos = getCollectionItems(cfg.photos, "photos").slice(0, 3);
    const stats = getCollectionItems(cfg.stats, "stats").map((item) => ({ value: localizedString(item.value), label: localizedString(item.label) })).filter((item) => item.value);
    const secondary = localizedString(cfg.secondary_label);
    const secondaryUrl = linkHref(cfg.secondary_url);
    const tag = localizedString(cfg.side_tag);
    return html3`<section class=${`nq-root nq-hero ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${line || "hero"}>
      ${tag ? html3`<span class="nq-hero-tag">${tag}</span>` : nothing3}
      <div class="nq-wrap nq-hero-g">
        <div class="nq-rev">
          ${localizedString(cfg.kicker) ? html3`<p class="nq-eyebrow">${localizedString(cfg.kicker)}</p>` : nothing3}
          ${line || before || accent || after ? html3`<h1>${line ? html3`${line}<br>` : nothing3}${before} ${accent ? html3`<em>${accent}</em>` : nothing3} ${after}</h1>` : nothing3}
          ${localizedString(cfg.text) ? html3`<p class="nq-copy">${localizedString(cfg.text)}</p>` : nothing3}
          <div class="nq-hero-cta">
            ${renderCta(cfg.primary_label, linkHref(cfg.primary_url))}
            ${secondary && secondaryUrl ? html3`<a class="nq-btn ghost" href=${secondaryUrl}>${secondary}</a>` : nothing3}
          </div>
          ${stats.length ? html3`<div class="nq-hero-meta">${stats.map((item) => html3`<div><b>${item.value}</b><span>${item.label}</span></div>`)}</div>` : nothing3}
        </div>
        ${photos.length ? html3`<div class="nq-stack nq-rev">
          ${photos.map((photo, index) => frame(String(photo.image || ""), localizedString(photo.caption), index === 0 ? "tall" : ""))}
        </div>` : nothing3}
      </div>
    </section>`;
  }
};
__name(_HeroStage, "HeroStage");
__decorateClass([
  property({ type: Object })
], _HeroStage.prototype, "config", 2);
var HeroStage = _HeroStage;
export {
  HeroStage as default
};
typeof HeroStage < "u" && HeroStage.registerSallaComponent("salla-hero-stage");
