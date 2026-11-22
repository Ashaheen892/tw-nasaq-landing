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

// tw-nasaq-landing/src/components/page-footer/index.ts
import { html as html3, LitElement, nothing as nothing3 } from "lit";
import { property, state } from "lit/decorators.js";

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
function isRtl() {
  return (document.documentElement.dir || (getLocale() === "ar" ? "rtl" : "ltr")) === "rtl";
}
__name(isRtl, "isRtl");
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
function t(strings) {
  return getLocale() === "ar" ? strings.ar : strings.en;
}
__name(t, "t");
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
function flag(value) {
  const raw = unwrapValue(value);
  if (raw === true || raw === 1) return true;
  if (typeof raw === "string") {
    const text = raw.trim().toLowerCase();
    return text === "true" || text === "1" || text === "on" || text === "yes";
  }
  return false;
}
__name(flag, "flag");
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

// tw-nasaq-landing/src/utils/announce.ts
import { html, nothing } from "lit";
var COPIES = 12;
function announceCss(prefix) {
  return `
.${prefix}-ann.${prefix}-ann {
  overflow: hidden;
  padding-block: 5px;
  border: 0;
  font-family: var(--font-main, inherit);
  background: var(--ann-bg-light, var(--ann-bg, var(--color-primary)));
  color: var(--ann-ink-light, var(--ann-ink, var(--color-primary-reverse, #fff)));
}
html.${prefix}-mode-dark .${prefix}-ann.${prefix}-auto, .${prefix}-ann.${prefix}-dark {
  background: var(--ann-bg-dark, var(--ann-bg-light, var(--ann-bg, var(--color-primary))));
  color: var(--ann-ink-dark, var(--ann-ink-light, var(--ann-ink, var(--color-primary-reverse, #fff))));
}
.${prefix}-ann__still {
  padding: 5px 1.5rem;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  line-height: 26px;
}
.${prefix}-ann__list {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 5px 0;
  list-style: none;
  white-space: nowrap;
}
.${prefix}-ann__item {
  flex: none;
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
  line-height: 26px;
  animation: ${prefix}-ann-ltr var(--ann-speed, 18s) linear infinite;
}
.${prefix}-ann.is-rtl .${prefix}-ann__item { animation-name: ${prefix}-ann-rtl; }
.${prefix}-ann__list:hover .${prefix}-ann__item { animation-play-state: paused; }
.${prefix}-ann__text {
  display: inline-flex;
  align-items: center;
  gap: 1.5rem;
  padding-inline: 1.5rem;
}
.${prefix}-ann__text::after {
  content: "";
  width: .35rem;
  height: .35rem;
  border-radius: 50%;
  background: currentColor;
  opacity: .55;
  flex: none;
}
@keyframes ${prefix}-ann-ltr { to { transform: translateX(-100%); } }
@keyframes ${prefix}-ann-rtl { to { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) {
  .${prefix}-ann__item { animation: none; }
  .${prefix}-ann__item[aria-hidden="true"] { display: none; }
  .${prefix}-ann__list { justify-content: center; }
  .${prefix}-ann__text::after { display: none; }
}
`;
}
__name(announceCss, "announceCss");
function announceTone(cfg) {
  const paint2 = /* @__PURE__ */ __name((key, variable) => {
    const value = String(cfg[key] || "").trim();
    return value ? `${variable}:${value}` : "";
  }, "paint");
  return [
    paint2("announce_bg", "--ann-bg-light"),
    paint2("announce_ink", "--ann-ink-light"),
    paint2("announce_bg_dark", "--ann-bg-dark"),
    paint2("announce_ink_dark", "--ann-ink-dark")
  ].filter(Boolean).join(";");
}
__name(announceTone, "announceTone");
function announceBar(cfg, prefix, extraClass = "", tone = "") {
  const text = localizedString(cfg.announce).trim();
  if (!text) return nothing;
  const moving = String(unwrapValue(cfg.announce_mode) || "move") !== "still";
  if (!moving) {
    return html`<div class="${prefix}-ann ${prefix}-ann__still ${extraClass}" style=${tone}>${text}</div>`;
  }
  const rtl = isRtl() ? " is-rtl" : "";
  return html`<div class="${prefix}-ann${rtl} ${extraClass}" style=${tone}>
    <ul class="${prefix}-ann__list">
      ${Array.from({ length: COPIES }, (_, index) => html`<li class="${prefix}-ann__item" aria-hidden=${index ? "true" : "false"}><span class="${prefix}-ann__text">${text}</span></li>`)}
    </ul>
  </div>`;
}
__name(announceBar, "announceBar");

// tw-nasaq-landing/src/utils/dock.ts
var WA = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.2A7.8 7.8 0 0 0 5.3 16l-.7 3.2 3.3-.7A7.8 7.8 0 1 0 12 4.2Zm3.7 10.3c-.2.5-1 .9-1.4 1-.4.1-.8.1-1.3-.1-.3-.1-.7-.2-1.2-.5-2.1-1.1-3.4-3.2-3.5-3.4-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .3 0 .5.4.2.5.6 1.6.7 1.7.1.2 0 .3-.1.5l-.3.4c-.1.1-.2.2 0 .4.2.3.7 1 1.5 1.6.6.5 1.1.6 1.3.5l.4-.3c.2-.1.3-.1.5 0 .2.2 1 .8 1.1 1 .1.1.1.3 0 .5Z"></path></svg>`;
var UP = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 19V8.8L7.4 12.4 6 11l6-6 6 6-1.4 1.4L13 8.8V19h-2Z"></path></svg>`;
function shown(value) {
  if (value == null || value === "") return true;
  return flag(value);
}
__name(shown, "shown");
function sideOf(value, fallback) {
  return String(unwrapValue(value) || fallback) === "end" ? "end" : "start";
}
__name(sideOf, "sideOf");
function digitsOf(value) {
  const raw = typeof value === "string" ? value : localizedString(value);
  return raw.replace(/\D/g, "");
}
__name(digitsOf, "digitsOf");
function paint(el, bg, ink) {
  el.style.background = String(bg || "").trim();
  el.style.color = String(ink || "").trim();
}
__name(paint, "paint");
function place(el, side, raised) {
  el.style.bottom = raised ? "5.6rem" : "1.15rem";
  el.style.insetInlineStart = side === "start" ? "1.15rem" : "auto";
  el.style.insetInlineEnd = side === "end" ? "1.15rem" : "auto";
}
__name(place, "place");
function syncDocks(cfg, prefix, nodes, onTop, options = {}) {
  const showWa = shown(cfg.show_whatsapp);
  const showTop = shown(cfg.show_top) && !options.hideTop;
  const waSide = sideOf(cfg.whatsapp_side, "start");
  const topSide = sideOf(cfg.top_side, "end");
  const stacked = showWa && showTop && waSide === topSide;
  const digits = digitsOf(cfg.whatsapp_number || "201153958512");
  const message = localizedString(cfg.whatsapp_message);
  const href = digits ? `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}` : "";
  if (showWa && href) {
    if (!nodes.wa) {
      const link = document.createElement("a");
      link.className = `${prefix}-dock ${prefix}-dock--wa`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.innerHTML = WA;
      document.body.appendChild(link);
      nodes.wa = link;
    }
    nodes.wa.href = href;
    nodes.wa.setAttribute("aria-label", t({ ar: "\u0648\u0627\u062A\u0633\u0627\u0628", en: "WhatsApp" }));
    paint(nodes.wa, cfg.whatsapp_bg, cfg.whatsapp_ink);
    place(nodes.wa, waSide, stacked);
    nodes.wa.hidden = false;
  } else if (nodes.wa) nodes.wa.hidden = true;
  const label = localizedString(cfg.top_label) || t({ ar: "\u0623\u0639\u0644\u0649", en: "Top" });
  if (shown(cfg.show_top)) {
    if (!nodes.top) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `${prefix}-dock ${prefix}-dock--top`;
      button.innerHTML = UP;
      button.addEventListener("click", onTop);
      document.body.appendChild(button);
      nodes.top = button;
    }
    nodes.top.setAttribute("aria-label", label);
    if (options.topText) {
      let caption = nodes.top.querySelector("span");
      if (!caption) {
        caption = document.createElement("span");
        nodes.top.appendChild(caption);
      }
      caption.textContent = label;
    }
    paint(nodes.top, cfg.top_bg, cfg.top_ink);
    place(nodes.top, topSide, false);
    nodes.top.hidden = !showTop;
  } else if (nodes.top) nodes.top.hidden = true;
  return nodes;
}
__name(syncDocks, "syncDocks");
function clearDocks(nodes) {
  nodes.wa?.remove();
  nodes.top?.remove();
  nodes.wa = null;
  nodes.top = null;
}
__name(clearDocks, "clearDocks");

// tw-nasaq-landing/src/utils/landing.ts
import { html as html2, nothing as nothing2 } from "lit";
function currentTone() {
  return document.documentElement.classList.contains("nq-mode-dark") ? "dark" : "light";
}
__name(currentTone, "currentTone");
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

// tw-nasaq-landing/src/components/page-footer/index.ts
var css = `
.nq-foot { background: var(--nq-section-bg, var(--ink)); color: color-mix(in srgb, var(--ivory) 72%, transparent); padding-block: 48px 34px; font-size: .86rem; }
.nq-foot .nq-flogo { color: var(--ivory); }
.nq-ft { display: flex; flex-wrap: wrap; gap: 30px 48px; justify-content: space-between; align-items: flex-start; }
.nq-ft h5 { color: var(--ivory); font-family: var(--serif); font-size: 1rem; margin: 0 0 14px; font-weight: 700; }
.nq-ft ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.nq-about { max-width: 30ch; }
.nq-about p { margin: 14px 0 0; }
.nq-pay-size { margin: 16px 0 8px; font-size: .68rem; letter-spacing: .08em; color: color-mix(in srgb, var(--ivory) 62%, transparent); }
.nq-pay { display: flex; gap: 8px; margin-top: 0; flex-wrap: wrap; align-items: center; }
.nq-pay img { width: 32px; height: 32px; object-fit: contain; background: #f7f4ef; border-radius: 8px; }
.nq-pay span { border: 1px solid color-mix(in srgb, var(--ivory) 22%, transparent); padding: 5px 10px; font-size: .68rem; letter-spacing: .08em; }
.nq-social { display: flex; gap: 10px; flex-wrap: wrap; }
.nq-social a { width: 40px; height: 40px; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--ivory) 28%, transparent); color: var(--ivory); }
.nq-social a:hover { border-color: var(--gold); color: var(--gold); }
.nq-social svg { width: 18px; height: 18px; display: block; }
.nq-foot-copy { margin-top: 34px; padding-top: 20px; border-top: 1px solid color-mix(in srgb, var(--ivory) 16%, transparent); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-size: .78rem; }
.nq-totop, .nq-top { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 8px 18px; border: 1px solid color-mix(in srgb, var(--ivory) 28%, transparent); background: transparent; color: var(--ivory); font-family: var(--sans); font-size: .78rem; letter-spacing: .14em; cursor: pointer; transition: .3s; }
.nq-foot .nq-totop { display: flex; width: fit-content; margin: 28px auto 0; }
.nq-totop:hover, .nq-top:hover { border-color: var(--gold); color: var(--gold); }
.nq-top { position: fixed; z-index: 70; inset-inline-end: 18px; bottom: 22px; background: var(--ink); opacity: 0; pointer-events: none; transform: translateY(10px); }
.nq-top.show { opacity: 1; pointer-events: auto; transform: none; }
.nq-dock { position: fixed; z-index: 80; display: inline-flex; align-items: center; justify-content: center; gap: .4rem; min-width: 3.35rem; min-height: 3.35rem; padding: .35rem .8rem; border-radius: 999px; border: 1px solid #b8945f; background: #101014; color: #f7f4ef; font-family: var(--font-main, inherit); letter-spacing: .06em; cursor: pointer; text-decoration: none; box-shadow: 0 12px 28px rgb(0 0 0 / 28%); }
.nq-dock[hidden] { display: none; }
.nq-dock svg { width: 1.2rem; height: 1.2rem; display: block; }
.nq-dock--wa { width: 3.45rem; height: 3.45rem; padding: 0; }
.nq-flogo { font-family: var(--serif); font-weight: 700; font-size: 1.5rem; letter-spacing: .02em; line-height: 1; color: var(--ivory); }
.nq-flogo small { display: block; font-family: var(--sans); font-size: .6rem; letter-spacing: .4em; color: var(--gold); font-weight: 400; margin-top: 4px; }
.nq-flogo img { height: 42px; width: auto; object-fit: contain; }
`;
function socialIcon(name) {
  if (name === "instagram") return html3`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"></rect><circle cx="12" cy="12" r="3.2"></circle><circle cx="17.2" cy="6.8" r=".8" fill="currentColor" stroke="none"></circle></svg>`;
  if (name === "snapchat") return html3`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 4c2.4 0 4 1.8 4 4.2 0 1.2-.2 2 .4 2.6.3.3.8.4 1.1.6.4.3.3 1-.2 1.2-.8.3-1.3.2-1.7.6-.3.3-.4.8-.2 1.4.2.5-.2.9-.8.9-.7 0-1.1.4-1.6.7-.4.2-.7.2-1 .2s-.6 0-1-.2c-.5-.3-.9-.7-1.6-.7-.6 0-1-.4-.8-.9.2-.6.1-1.1-.2-1.4-.4-.4-.9-.3-1.7-.6-.5-.2-.6-.9-.2-1.2.3-.2.8-.3 1.1-.6.6-.6.4-1.4.4-2.6C8 5.8 9.6 4 12 4Z"></path></svg>`;
  if (name === "tiktok") return html3`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 6c.6 2.2 2 3.6 4 4v2.2c-1.4 0-2.7-.4-4-1.2v5.2a5.2 5.2 0 1 1-5.2-5.2c.3 0 .6 0 .8.1v2.3a2.9 2.9 0 1 0 2 2.8V6H14Z"></path></svg>`;
  if (name === "whatsapp") return html3`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.2A7.8 7.8 0 0 0 5.3 16l-.7 3.2 3.3-.7A7.8 7.8 0 1 0 12 4.2Zm3.7 10.3c-.2.5-1 .9-1.4 1-.4.1-.8.1-1.3-.1-.3-.1-.7-.2-1.2-.5-2.1-1.1-3.4-3.2-3.5-3.4-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .3 0 .5.4.2.5.6 1.6.7 1.7.1.2 0 .3-.1.5l-.3.4c-.1.1-.2.2 0 .4.2.3.7 1 1.5 1.6.6.5 1.1.6 1.3.5l.4-.3c.2-.1.3-.1.5 0 .2.2 1 .8 1.1 1 .1.1.1.3 0 .5Z"></path></svg>`;
  if (name === "youtube") return html3`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.5" y="7" width="17" height="11" rx="2.5"></rect><path d="m11 10 4 2.2-4 2.2V10Z" fill="currentColor" stroke="none"></path></svg>`;
  if (name === "x") return html3`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>`;
  return html3`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="7"></circle></svg>`;
}
__name(socialIcon, "socialIcon");
var _PageFooter = class _PageFooter extends LitElement {
  constructor() {
    super(...arguments);
    this.storeName = "";
    this.dark = false;
    this.raised = false;
    this.atFooter = false;
    this.stop = /* @__PURE__ */ __name(() => {
    }, "stop");
    this.floater = null;
    this.docks = { wa: null, top: null };
    this.onScroll = /* @__PURE__ */ __name((event) => {
      const target = event?.target;
      const nested = target instanceof Element ? target.scrollTop : 0;
      const top = Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0, nested);
      const next = top > 360;
      if (next !== this.raised) this.raised = next;
    }, "onScroll");
    this.toTop = /* @__PURE__ */ __name((event) => {
      event.preventDefault();
      const docs = [document];
      try {
        if (window.parent && window.parent !== window) docs.push(window.parent.document);
      } catch {
      }
      const nodes = /* @__PURE__ */ new Set();
      docs.forEach((doc) => {
        nodes.add(doc.documentElement);
        if (doc.body) nodes.add(doc.body);
        if (doc.scrollingElement) nodes.add(doc.scrollingElement);
        doc.querySelectorAll("*").forEach((el) => {
          if (el.scrollTop > 0) nodes.add(el);
        });
      });
      let node = this;
      while (node) {
        nodes.add(node);
        node = node.parentElement;
      }
      nodes.forEach((el) => {
        try {
          el.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
          el.scrollTop = 0;
        }
      });
    }, "toTop");
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    this.classList.add("nq-host");
    injectFonts();
    injectStyles("nq-base", baseCss);
    injectStyles("nq-announce", announceCss("nq"));
    injectStyles("nq-page-footer", css);
    const stopLocale = watchLocale(this);
    const onTone = /* @__PURE__ */ __name(() => {
      this.dark = currentTone() === "dark";
    }, "onTone");
    window.addEventListener("nq-tone", onTone);
    this.dark = currentTone() === "dark";
    this.stop = () => {
      stopLocale();
      window.removeEventListener("nq-tone", onTone);
    };
    document.addEventListener("scroll", this.onScroll, { capture: true, passive: true });
    const api = window.Salla;
    const read = /* @__PURE__ */ __name(() => {
      this.storeName = api?.config?.get("store.name") || "";
    }, "read");
    read();
    api?.onReady?.().then(read);
    this.onScroll();
  }
  disconnectedCallback() {
    this.stop();
    document.removeEventListener("scroll", this.onScroll, { capture: true });
    this.seen?.disconnect();
    this.floater?.remove();
    this.floater = null;
    clearDocks(this.docks);
    super.disconnectedCallback();
  }
  updated() {
    this.floater?.remove();
    this.floater = null;
    this.docks = syncDocks(getConfig(this.config), "nq", this.docks, this.toTop, { hideTop: this.atFooter, topText: true });
    const button = this.querySelector(".nq-totop");
    this.seen?.disconnect();
    if (!button) {
      this.atFooter = false;
      return;
    }
    this.seen = new IntersectionObserver(([entry]) => {
      this.atFooter = entry.isIntersecting;
    }, { threshold: 0.5 });
    this.seen.observe(button);
  }
  shown(value) {
    if (value == null || value === "") return true;
    return flag(value);
  }
  syncFloater() {
    const cfg = getConfig(this.config);
    const show = this.shown(cfg.show_top) && this.raised && !this.atFooter;
    if (!show) {
      this.floater?.classList.remove("show");
      return;
    }
    if (!this.floater) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "nq-top";
      button.addEventListener("click", this.toTop);
      document.body.appendChild(button);
      this.floater = button;
    }
    const label = localizedString(cfg.top_label) || t({ ar: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0623\u0639\u0644\u0649", en: "Back to top" });
    this.floater.setAttribute("aria-label", label);
    this.floater.replaceChildren();
    const text = document.createElement("span");
    text.textContent = label;
    const mark = document.createElement("span");
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "\u2191";
    this.floater.append(text, mark);
    this.floater.classList.add("show");
  }
  render() {
    const cfg = getConfig(this.config);
    const brand = localizedString(cfg.brand) || this.storeName || t({ ar: "\u0627\u0644\u0645\u062A\u062C\u0631", en: "Store" });
    const showTop = this.shown(cfg.show_top);
    const topLabel = localizedString(cfg.top_label) || t({ ar: "\u0627\u0644\u0639\u0648\u062F\u0629 \u0644\u0644\u0623\u0639\u0644\u0649", en: "Back to top" });
    const mark = localizedString(cfg.mark);
    const columns = [1, 2].map((index) => ({
      title: localizedString(cfg[`col${index}_title`]),
      links: getCollectionItems(cfg[`col${index}`], `col${index}`).map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" })).filter((item) => item.label)
    })).filter((column) => column.title || column.links.length);
    const socialTitle = localizedString(cfg.col3_title);
    const socials = getCollectionItems(cfg.social, "social").map((item) => ({
      network: String(unwrapValue(item.network) || "instagram"),
      url: linkHref(item.url) || "#",
      label: {
        instagram: t({ ar: "\u0625\u0646\u0633\u062A\u063A\u0631\u0627\u0645", en: "Instagram" }),
        snapchat: t({ ar: "\u0633\u0646\u0627\u0628 \u0634\u0627\u062A", en: "Snapchat" }),
        tiktok: t({ ar: "\u062A\u064A\u0643 \u062A\u0648\u0643", en: "TikTok" }),
        whatsapp: t({ ar: "\u0648\u0627\u062A\u0633\u0627\u0628", en: "WhatsApp" }),
        x: t({ ar: "\u0625\u0643\u0633", en: "X" }),
        youtube: t({ ar: "\u064A\u0648\u062A\u064A\u0648\u0628", en: "YouTube" })
      }[String(unwrapValue(item.network) || "instagram")] || t({ ar: "\u062A\u0648\u0627\u0635\u0644", en: "Social" })
    })).filter((item) => item.url);
    const pays = getCollectionItems(cfg.payments, "payments").map((item) => ({ image: String(item.image || ""), label: localizedString(item.label) })).filter((item) => item.image || item.label);
    const logo = this.dark && cfg.logo_dark || cfg.logo;
    return html3`${announceBar(cfg, "nq", `nq-root ${schemeOf(cfg)}`, announceTone(cfg))}
    <footer class=${`nq-root nq-foot ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <div class="nq-wrap">
        <div class="nq-ft">
          <div class="nq-about">
            <a href="#" class="nq-flogo">${logo ? html3`<img src=${logo} alt=${brand} />` : html3`${brand}${mark ? html3`<small>${mark}</small>` : nothing3}`}</a>
            ${localizedString(cfg.about) ? html3`<p>${localizedString(cfg.about)}</p>` : nothing3}
            ${pays.length ? html3`<p class="nq-pay-size">${t({ ar: "\u0623\u064A\u0642\u0648\u0646\u0627\u062A \u0627\u0644\u062F\u0641\u0639 \u0666\u0664\xD7\u0666\u0664 \u0628\u0643\u0633\u0644", en: "Payment icons, 64\xD764 px" })}</p><div class="nq-pay">${pays.map((pay) => pay.image ? html3`<img src=${pay.image} alt=${pay.label} width="32" height="32" title=${pay.label} />` : html3`<span>${pay.label}</span>`)}</div>` : nothing3}
          </div>
          ${columns.map((column) => html3`<div>
            ${column.title ? html3`<h5>${column.title}</h5>` : nothing3}
            <ul>${column.links.map((link) => html3`<li><a href=${link.url}>${link.label}</a></li>`)}</ul>
          </div>`)}
          ${socialTitle || socials.length ? html3`<div>
            ${socialTitle ? html3`<h5>${socialTitle}</h5>` : nothing3}
            <div class="nq-social">${socials.map((item) => html3`<a href=${item.url} aria-label=${item.label} target="_blank" rel="noopener noreferrer">${socialIcon(item.network)}</a>`)}</div>
          </div>` : nothing3}
        </div>
        ${showTop ? html3`<button type="button" class="nq-totop" @click=${this.toTop}>${topLabel} <span aria-hidden="true">↑</span></button>` : nothing3}
        <div class="nq-foot-copy">
          <span>${localizedString(cfg.copyright)}</span>
          <span>${localizedString(cfg.legal)}</span>
        </div>
      </div>
    </footer>`;
  }
};
__name(_PageFooter, "PageFooter");
__decorateClass([
  property({ type: Object })
], _PageFooter.prototype, "config", 2);
__decorateClass([
  state()
], _PageFooter.prototype, "storeName", 2);
__decorateClass([
  state()
], _PageFooter.prototype, "dark", 2);
__decorateClass([
  state()
], _PageFooter.prototype, "raised", 2);
__decorateClass([
  state()
], _PageFooter.prototype, "atFooter", 2);
var PageFooter = _PageFooter;
export {
  PageFooter as default
};
typeof PageFooter < "u" && PageFooter.registerSallaComponent("salla-page-footer");
