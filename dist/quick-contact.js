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

// tw-nasaq-landing/src/components/quick-contact/index.ts
import { html as html3, LitElement } from "lit";
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
function emptyCopy() {
  return html2`<p class="nq-empty">${t({ ar: "\u0623\u0636\u0641 \u0639\u0646\u0627\u0635\u0631 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645 \u0645\u0646 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A", en: "Add this section's items in the settings" })}</p>`;
}
__name(emptyCopy, "emptyCopy");

// tw-nasaq-landing/src/components/quick-contact/index.ts
var css = `
.nq-invite { position: relative; max-width: 860px; margin-inline: auto; padding: clamp(34px, 6vw, 64px) clamp(20px, 5vw, 56px); text-align: center; background: var(--card); border: 1px solid var(--gold); outline: 1px solid var(--gold-soft); outline-offset: -10px; }
.nq-invite .nq-h2 { margin-bottom: 10px; }
.nq-invite > p { margin: 0 auto 26px; color: var(--muted); max-width: 46ch; }
.nq-quick { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.nq-quick a { display: inline-grid; justify-items: center; gap: 2px; min-width: 11rem; min-height: 3.4rem; padding: 10px 22px; border: 1px solid var(--gold); border-radius: 999px; color: inherit; text-decoration: none; transition: background .25s ease, color .25s ease; }
.nq-quick a:hover { background: var(--ink); color: var(--ivory); border-color: var(--ink); }
.nq-quick small { color: var(--gold); letter-spacing: .16em; font-size: .68rem; }
.nq-quick a:hover small { color: var(--gold-soft); }
.nq-quick b { font-size: 1rem; font-weight: 700; overflow-wrap: anywhere; }
.nq-quick a.nq-rev { transition-delay: calc(var(--i, 0) * 90ms); }
`;
function telHref(value) {
  const raw = (typeof value === "string" ? value : localizedString(value)).trim();
  const num = raw.replace(/\D/g, "");
  if (!num) return "";
  if (raw.startsWith("+")) return `tel:+${num}`;
  if (num.startsWith("00")) return `tel:+${num.slice(2)}`;
  return `tel:${num}`;
}
__name(telHref, "telHref");
function digits(value) {
  const raw = typeof value === "string" ? value : localizedString(value);
  return raw.replace(/\D/g, "");
}
__name(digits, "digits");
var _QuickContact = class _QuickContact extends LitElement {
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
    injectStyles("nq-quick-contact", css);
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
    const phone = digits(cfg.phone);
    const wa = digits(cfg.whatsapp || "201153958512");
    const email = String(cfg.email || "").trim();
    const message = localizedString(cfg.whatsapp_message);
    const actions = [
      phone ? { kicker: localizedString(cfg.phone_label) || t({ ar: "\u0627\u062A\u0635\u0627\u0644", en: "Call" }), value: localizedString(cfg.phone_text) || phone, href: telHref(cfg.phone) } : null,
      wa ? { kicker: localizedString(cfg.whatsapp_label) || t({ ar: "\u0648\u0627\u062A\u0633\u0627\u0628", en: "WhatsApp" }), value: localizedString(cfg.whatsapp_text) || t({ ar: "\u0627\u0643\u062A\u0628\u064A \u0644\u0644\u0645\u0642\u0627\u0633", en: "Ask about the size" }), href: `https://wa.me/${wa}${message ? `?text=${encodeURIComponent(message)}` : ""}` } : null,
      email.includes("@") ? { kicker: localizedString(cfg.email_label) || t({ ar: "\u0627\u0644\u0628\u0631\u064A\u062F", en: "Email" }), value: email, href: `mailto:${email}` } : null
    ].filter((item) => item);
    return html3`<section id="nq-contact" class=${`nq-root nq-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "contact"}>
      <div class="nq-wrap">
        <div class="nq-invite nq-rev">
        ${localizedString(cfg.title) ? html3`<h2 class="nq-h2">${localizedString(cfg.title)}</h2>` : ""}
        ${localizedString(cfg.text) ? html3`<p>${localizedString(cfg.text)}</p>` : ""}
        ${actions.length ? html3`<div class="nq-quick">${actions.map((item, index) => html3`<a class="nq-rev" style=${`--i:${index}`} href=${item.href}><small>${item.kicker}</small><b>${item.value}</b></a>`)}</div>` : emptyCopy()}
        </div>
      </div>
    </section>`;
  }
};
__name(_QuickContact, "QuickContact");
__decorateClass([
  property({ type: Object })
], _QuickContact.prototype, "config", 2);
var QuickContact = _QuickContact;
export {
  QuickContact as default
};
typeof QuickContact < "u" && QuickContact.registerSallaComponent("salla-quick-contact");
