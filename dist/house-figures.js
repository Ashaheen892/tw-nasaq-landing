var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
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
function flag(value) {
  const raw = unwrapValue(value);
  if (raw === !0 || raw === 1) return !0;
  if (typeof raw == "string") {
    const text = raw.trim().toLowerCase();
    return text === "true" || text === "1" || text === "on" || text === "yes";
  }
  return !1;
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
function schemeOf(cfg) {
  const scheme = String(unwrapValue(cfg.color_scheme) || "auto");
  return scheme === "dark" ? "nq-dark" : scheme === "light" ? "nq-light" : "nq-auto";
}
__name(schemeOf, "schemeOf");
const AR = "٠١٢٣٤٥٦٧٨٩", NUM = /[+-]?[\d٠-٩]+(?:[.,٫٬][\d٠-٩]+)*/;
function parse(text) {
  const match = text.match(NUM);
  if (!match || match.index === void 0) return null;
  const raw = match[0], arabic = /[٠-٩]/.test(raw), latin = raw.replace(/[٠-٩]/g, (d) => String(AR.indexOf(d))), decimalMark = /[.٫](\d+)$/.exec(latin), decimals = decimalMark && decimalMark[1].length < 3 ? decimalMark[1].length : 0, grouped = /[,٬]/.test(latin) || !decimals && /[.٫]\d{3}/.test(latin), clean = decimals ? latin.replace(/[,٬]/g, "").replace(/[٫]/, ".") : latin.replace(/[.,٫٬]/g, ""), value = Number(clean);
  return !Number.isFinite(value) || value === 0 ? null : { before: text.slice(0, match.index), after: text.slice(match.index + raw.length), value, decimals, arabic, grouped };
}
__name(parse, "parse");
function format(n, p) {
  let out = p.decimals ? n.toFixed(p.decimals) : String(Math.round(n));
  return p.grouped && (out = out.replace(/\B(?=(\d{3})+(?!\d))/g, p.arabic ? "٬" : ",")), p.arabic && (out = out.replace(/\d/g, (d) => AR[Number(d)]).replace(".", "٫")), p.before + out + p.after;
}
__name(format, "format");
const done = /* @__PURE__ */ new WeakSet();
function countUp(root, selector, duration = 1400) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches, nodes = Array.from(root.querySelectorAll(selector)).filter((el) => !done.has(el));
  if (reduced || !nodes.length || !("IntersectionObserver" in window)) return () => {
  };
  const frames = /* @__PURE__ */ new Set(), io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);
      const final = el.dataset.countFinal || el.textContent || "", parsed = parse(final);
      if (!parsed) return;
      el.dataset.countFinal = final, done.add(el);
      const start = performance.now(), tick = /* @__PURE__ */ __name((now) => {
        const k = Math.min(1, (now - start) / duration), eased = 1 - Math.pow(1 - k, 3);
        el.textContent = k < 1 ? format(parsed.value * eased, parsed) : final, k < 1 && frames.add(requestAnimationFrame(tick));
      }, "tick");
      el.textContent = format(0, parsed), frames.add(requestAnimationFrame(tick));
    });
  }, { threshold: 0.4 });
  return nodes.forEach((el) => io.observe(el)), () => {
    io.disconnect(), frames.forEach((id) => cancelAnimationFrame(id));
  };
}
__name(countUp, "countUp");
function markEditing() {
  var _a, _b;
  const root = document.documentElement, read = /* @__PURE__ */ __name(() => {
    var _a2, _b2;
    let on = !0;
    try {
      const salla = window.Salla;
      on = window.self !== window.top || ((_b2 = (_a2 = salla == null ? void 0 : salla.config) == null ? void 0 : _a2.get) == null ? void 0 : _b2.call(_a2, "page.is_landing_page")) !== !0;
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
function emptyCopy() {
  return html`<p class="nq-empty">${t({ ar: "أضف عناصر هذا القسم من الإعدادات", en: "Add this section's items in the settings" })}</p>`;
}
__name(emptyCopy, "emptyCopy");
var __defProp2 = Object.defineProperty, __decorateClass = /* @__PURE__ */ __name((decorators, target, key, kind) => {
  for (var result = void 0, i = decorators.length - 1, decorator; i >= 0; i--)
    (decorator = decorators[i]) && (result = decorator(target, key, result) || result);
  return result && __defProp2(target, key, result), result;
}, "__decorateClass");
const css = `
.nq-stat-head { text-align: center; margin-bottom: clamp(28px, 4vw, 48px); }
.nq-stat-head .nq-kicker { margin: 0 0 10px; color: var(--gold); letter-spacing: .18em; font-size: .75rem; }
.nq-stat-head .nq-kicker::before, .nq-stat-head .nq-kicker::after { content: "◆"; margin-inline: .7em; font-size: .55em; vertical-align: middle; }
.nq-stats { display: grid; gap: 28px; }
@container (min-width: 720px) { .nq-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; } }
.nq-stat { position: relative; display: grid; justify-items: center; gap: 10px; padding: 8px 20px; text-align: center; }
@container (min-width: 720px) { .nq-stat + .nq-stat::before { content: ""; position: absolute; inset-inline-start: 0; top: 12%; bottom: 12%; width: 1px; background: linear-gradient(transparent, var(--gold), transparent); } }
.nq-stat b { font-family: var(--serif); font-size: clamp(2.3rem, 4.5vw, 3.6rem); font-weight: 700; line-height: 1; color: var(--ink); }
.nq-stat i { width: 28px; height: 1px; background: var(--gold); }
.nq-stat span { color: var(--muted); letter-spacing: .04em; }
.nq-stat.nq-rev { transition-delay: calc(var(--i, 0) * 110ms); }
`, _StatStrip = class _StatStrip extends LitElement {
  constructor() {
    super(...arguments), this.stop = () => {
    }, this.stopCount = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("nq-host"), injectFonts(), injectStyles("nq-base", baseCss), injectStyles("nq-stat-strip", css);
    const stopLocale = watchLocale(this), stopReveal = watchReveal(this);
    this.stop = () => {
      stopLocale(), stopReveal();
    };
  }
  disconnectedCallback() {
    this.stop(), this.stopCount(), super.disconnectedCallback();
  }
  updated() {
    const cfg = getConfig(this.config);
    (cfg.count_up === void 0 || cfg.count_up === "" || flag(cfg.count_up)) && (this.stopCount(), this.stopCount = countUp(this, ".nq-stat b"));
  }
  render() {
    const cfg = getConfig(this.config), items = getCollectionItems(cfg.items, "items").map((item) => ({ value: localizedString(item.value), label: localizedString(item.label) })).filter((item) => item.value);
    return html`<section id="nq-stats" class=${`nq-root nq-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "stats"}>
      <div class="nq-wrap">
        <div class="nq-stat-head">
          ${localizedString(cfg.kicker) ? html`<p class="nq-kicker">${localizedString(cfg.kicker)}</p>` : ""}
          ${localizedString(cfg.title) ? html`<h2 class="nq-h2">${localizedString(cfg.title)}</h2>` : ""}
        </div>
        ${items.length ? html`<div class="nq-stats">${items.map((item, index) => html`<article class="nq-stat nq-rev" style=${`--i:${index}`}><b .textContent=${item.value}></b><i aria-hidden="true"></i><span>${item.label}</span></article>`)}</div>` : emptyCopy()}
      </div>
    </section>`;
  }
};
__name(_StatStrip, "StatStrip");
let StatStrip = _StatStrip;
__decorateClass([
  property({ type: Object })
], StatStrip.prototype, "config");
typeof StatStrip < "u" && StatStrip.registerSallaComponent("salla-house-figures");
export {
  StatStrip as default
};
