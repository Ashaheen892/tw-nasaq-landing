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

// tw-nasaq-landing/src/components/page-bar/index.ts
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
  const paint = /* @__PURE__ */ __name((key, variable) => {
    const value = String(cfg[key] || "").trim();
    return value ? `${variable}:${value}` : "";
  }, "paint");
  return [
    paint("announce_bg", "--ann-bg-light"),
    paint("announce_ink", "--ann-ink-light"),
    paint("announce_bg_dark", "--ann-bg-dark"),
    paint("announce_ink_dark", "--ann-ink-dark")
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

// tw-nasaq-landing/src/utils/landing.ts
import { html as html2, nothing as nothing2 } from "lit";
var TONE_KEY = "nq-landing-tone";
function applyTone(mode) {
  document.documentElement.classList.remove("nq-mode-light", "nq-mode-dark");
  document.documentElement.classList.add(mode === "dark" ? "nq-mode-dark" : "nq-mode-light");
  try {
    localStorage.setItem(TONE_KEY, mode);
  } catch {
  }
  window.dispatchEvent(new CustomEvent("nq-tone"));
}
__name(applyTone, "applyTone");
function currentTone() {
  return document.documentElement.classList.contains("nq-mode-dark") ? "dark" : "light";
}
__name(currentTone, "currentTone");
function savedTone() {
  try {
    const saved = localStorage.getItem(TONE_KEY);
    return saved === "dark" || saved === "light" ? saved : "";
  } catch {
    return "";
  }
}
__name(savedTone, "savedTone");
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

// tw-nasaq-landing/src/components/page-bar/index.ts
var css = `
.nq-bar { position: relative; background: var(--nq-section-bg, color-mix(in srgb, var(--ivory) 86%, transparent)); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
.nq-nav { display: flex; align-items: center; gap: 26px; min-height: 74px; }
.nq-logo { font-family: var(--serif); font-weight: 700; font-size: 1.5rem; letter-spacing: .02em; line-height: 1; }
.nq-logo small { display: block; font-family: var(--sans); font-size: .6rem; letter-spacing: .4em; color: var(--gold); font-weight: 400; margin-top: 4px; }
.nq-logo img { height: 42px; width: auto; max-width: 42vw; object-fit: contain; }
.nq-nav ul { display: flex; gap: 28px; list-style: none; margin: 0; padding: 0; font-size: .88rem; }
.nq-nav ul a { position: relative; padding-block: 4px; }
.nq-nav ul a::after { content: ""; position: absolute; inset-inline: 0; bottom: 0; height: 1px; background: var(--ink); transform: scaleX(0); transform-origin: right; transition: .35s; }
.nq-nav ul a:hover::after { transform: scaleX(1); }
.nq-sp { margin-inline-start: auto; }
.nq-menu, .nq-tone { display: inline-grid; place-items: center; width: 40px; height: 40px; border: 1px solid var(--line); border-radius: 50%; background: transparent; color: inherit; cursor: pointer; font-size: .95rem; padding: 0; }
.nq-tone svg { width: 18px; height: 18px; }
.nq-menu { display: none; }
@container (max-width: 860px) {
  .nq-nav { gap: 10px; }
  .nq-logo { font-size: 1.15rem; white-space: nowrap; }
  .nq-nav ul { display: none; position: absolute; inset-inline: 0; top: 100%; z-index: 5; flex-direction: column; gap: 0; padding: 8px 0 14px; background: var(--ivory); border-bottom: 1px solid var(--line); }
  .nq-nav.is-open ul { display: flex; }
  .nq-nav ul a { display: block; padding: 12px var(--pad); }
  .nq-menu { display: inline-grid; }
}
`;
var _PageBar = class _PageBar extends LitElement {
  constructor() {
    super(...arguments);
    this.open = false;
    this.dark = false;
    this.stop = /* @__PURE__ */ __name(() => {
    }, "stop");
    this.pinned = null;
    this.opened = [];
    this.modeKey = "";
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
    injectStyles("nq-page-bar", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    const onTone = /* @__PURE__ */ __name(() => {
      this.dark = currentTone() === "dark";
    }, "onTone");
    window.addEventListener("nq-tone", onTone);
    this.stop = () => {
      stopLocale();
      stopReveal();
      window.removeEventListener("nq-tone", onTone);
      this.release();
    };
  }
  willUpdate() {
    const cfg = getConfig(this.config);
    setKitFont(this.kitFont(cfg));
    const key = `${unwrapValue(cfg.default_mode) || "light"}|${this.showMode(cfg)}`;
    if (key === this.modeKey) return;
    this.modeKey = key;
    applyTone(this.openingMode(cfg));
    this.dark = currentTone() === "dark";
  }
  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }
  updated() {
    this.pin();
  }
  showMode(cfg) {
    if (cfg.show_mode_toggle == null || cfg.show_mode_toggle === "") return true;
    return flag(cfg.show_mode_toggle);
  }
  /** Missing or off inherits the Salla store font. On uses the kit typeface. */
  kitFont(cfg) {
    if (cfg.use_kit_font == null || cfg.use_kit_font === "") return false;
    return flag(cfg.use_kit_font);
  }
  openingMode(cfg) {
    const base = String(unwrapValue(cfg.default_mode) || "light");
    if (this.showMode(cfg)) {
      const saved = savedTone();
      if (saved) return saved;
    }
    if (base === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return base === "dark" ? "dark" : "light";
  }
  /** Keep the page where it was. Focusing the sticky header otherwise jumps to the top. */
  place(run) {
    const view = this.ownerDocument.defaultView;
    if (!view) {
      run();
      return;
    }
    const nodes = /* @__PURE__ */ new Set([this.ownerDocument.documentElement, this.ownerDocument.body]);
    if (this.ownerDocument.scrollingElement) nodes.add(this.ownerDocument.scrollingElement);
    let node = this;
    while (node) {
      nodes.add(node);
      node = node.parentElement;
    }
    const marks = [...nodes].map((el) => [el, el.scrollTop]);
    const x = view.scrollX;
    const y = view.scrollY;
    const put = /* @__PURE__ */ __name(() => {
      for (const [el, top] of marks) if (el.scrollTop !== top) el.scrollTop = top;
      if (Math.abs(view.scrollY - y) > 1 || Math.abs(view.scrollX - x) > 1) view.scrollTo(x, y);
    }, "put");
    run();
    put();
    view.requestAnimationFrame(() => {
      put();
      view.requestAnimationFrame(put);
    });
  }
  outerBox() {
    let node = this;
    while (node.parentElement && node.parentElement !== document.body && node.parentElement !== document.documentElement) {
      const parent = node.parentElement;
      const sections = [...parent.children].filter((el) => el.tagName !== "SCRIPT" && el.tagName !== "STYLE");
      if (sections.length > 1) return node;
      node = parent;
    }
    return node;
  }
  pin() {
    const cfg = getConfig(this.config);
    const sticky = flag(cfg.sticky);
    const outer = this.outerBox();
    if (this.pinned && this.pinned !== outer) this.release();
    this.pinned = outer;
    outer.style.position = sticky ? "sticky" : "";
    outer.style.top = sticky ? "0" : "";
    outer.style.zIndex = sticky ? "40" : "";
    this.opened.forEach((el) => {
      el.style.overflow = "";
    });
    this.opened = [];
    if (!sticky) return;
    let node = outer.parentElement;
    while (node && node !== document.body && node !== document.documentElement) {
      const flow = getComputedStyle(node);
      if (flow.overflowY === "auto" || flow.overflowY === "scroll") break;
      if (flow.overflowY === "hidden" || flow.overflowX === "hidden") {
        node.style.overflow = "clip";
        this.opened.push(node);
      }
      node = node.parentElement;
    }
  }
  release() {
    if (this.pinned) {
      this.pinned.style.position = this.pinned.style.top = this.pinned.style.zIndex = "";
      this.pinned = null;
    }
    this.opened.forEach((el) => {
      el.style.overflow = "";
    });
    this.opened = [];
  }
  render() {
    const cfg = getConfig(this.config);
    const brand = localizedString(cfg.brand) || t({ ar: "\u0627\u0644\u0645\u062A\u062C\u0631", en: "Store" });
    const mark = localizedString(cfg.mark);
    const links = getCollectionItems(cfg.links, "links").map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" })).filter((item) => item.label);
    const logo = this.dark && cfg.logo_dark || cfg.logo;
    return html3`${announceBar(cfg, "nq", `nq-root ${schemeOf(cfg)}`, announceTone(cfg))}
    <header class=${`nq-root nq-bar ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <nav class="nq-nav nq-wrap ${this.open ? "is-open" : ""}">
        <a href=${linkHref(cfg.home_url) || "#"} class="nq-logo" aria-label=${brand}>
          ${logo ? html3`<img src=${logo} alt=${brand} />` : html3`${brand}${mark ? html3`<small>${mark}</small>` : nothing3}`}
        </a>
        ${links.length ? html3`<ul>${links.map((item) => html3`<li><a href=${item.url} @click=${() => {
      this.open = false;
    }}>${item.label}</a></li>`)}</ul>` : nothing3}
        <span class="nq-sp"></span>
        ${this.showMode(cfg) ? html3`<button type="button" class="nq-tone" aria-pressed=${this.dark ? "true" : "false"} aria-label=${this.dark ? t({ ar: "\u0627\u0644\u062A\u0628\u062F\u064A\u0644 \u0625\u0644\u0649 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0641\u0627\u062A\u062D", en: "Switch to light mode" }) : t({ ar: "\u0627\u0644\u062A\u0628\u062F\u064A\u0644 \u0625\u0644\u0649 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u062F\u0627\u0643\u0646", en: "Switch to dark mode" })} @mousedown=${(event) => event.preventDefault()} @click=${() => this.place(() => {
      applyTone(this.dark ? "light" : "dark");
      this.dark = currentTone() === "dark";
    })}>
          ${this.dark ? html3`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor" /><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" /></g></svg>` : html3`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.5 2.4a9 9 0 1 0 7.1 13.6A8 8 0 0 1 14.5 2.4z" /></svg>`}
        </button>` : nothing3}
        <button type="button" class="nq-menu" aria-expanded=${this.open ? "true" : "false"} aria-label=${t({ ar: "\u0627\u0644\u0642\u0627\u0626\u0645\u0629", en: "Menu" })} @click=${() => {
      this.open = !this.open;
    }}>☰</button>
      </nav>
    </header>`;
  }
};
__name(_PageBar, "PageBar");
__decorateClass([
  property({ type: Object })
], _PageBar.prototype, "config", 2);
__decorateClass([
  state()
], _PageBar.prototype, "open", 2);
__decorateClass([
  state()
], _PageBar.prototype, "dark", 2);
var PageBar = _PageBar;
export {
  PageBar as default
};
typeof PageBar < "u" && PageBar.registerSallaComponent("salla-page-bar");
