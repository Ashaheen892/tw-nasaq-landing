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
function schemeOf(cfg) {
  const scheme = String(unwrapValue(cfg.color_scheme) || "auto");
  return scheme === "dark" ? "nq-dark" : scheme === "light" ? "nq-light" : "nq-auto";
}
__name(schemeOf, "schemeOf");
function arDigits(n) {
  return String(Math.max(0, n)).padStart(2, "0").replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}
__name(arDigits, "arDigits");
function emptyCopy() {
  return html`<p class="nq-empty">${t({ ar: "أضف عناصر هذا القسم من الإعدادات", en: "Add this section's items in the settings" })}</p>`;
}
__name(emptyCopy, "emptyCopy");
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
function clipUrl(value) {
  const raw = unwrapValue(value);
  if (typeof raw == "string") return raw.trim();
  if (raw && typeof raw == "object") {
    const url = raw.url ?? raw.src;
    if (typeof url == "string") return url.trim();
  }
  return "";
}
__name(clipUrl, "clipUrl");
function isFileClip(url) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url);
}
__name(isFileClip, "isFileClip");
function kindOf(url) {
  if (isFileClip(url)) return "file";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "youtu.be" || host.includes("youtube.com") || host.includes("youtube-nocookie.com")) return "youtube";
    if (host.includes("vimeo.com")) return "vimeo";
  } catch {
  }
  return "other";
}
__name(kindOf, "kindOf");
function frameSrc(url) {
  var _a, _b;
  let frame = url;
  const kind = kindOf(url);
  try {
    const parsed = new URL(url);
    if (kind === "youtube") {
      const host = parsed.hostname.replace(/^www\./, "");
      let id = "";
      host === "youtu.be" ? id = parsed.pathname.split("/").filter(Boolean)[0] || "" : parsed.pathname.includes("/embed/") ? id = ((_a = parsed.pathname.split("/embed/")[1]) == null ? void 0 : _a.split("/")[0]) || "" : parsed.pathname.includes("/shorts/") ? id = ((_b = parsed.pathname.split("/shorts/")[1]) == null ? void 0 : _b.split("/")[0]) || "" : id = parsed.searchParams.get("v") || "", id && (frame = `https://www.youtube-nocookie.com/embed/${id}`);
    } else if (kind === "vimeo") {
      const id = parsed.pathname.split("/").filter(Boolean).pop() || "";
      /^\d+$/.test(id) && (frame = `https://player.vimeo.com/video/${id}`);
    }
  } catch {
    frame = url;
  }
  if (kind === "file") return frame;
  const params = new URLSearchParams();
  return params.set("autoplay", "1"), params.set("playsinline", "1"), kind === "youtube" ? (params.set("mute", "1"), params.set("rel", "0"), params.set("enablejsapi", "1")) : (kind === "vimeo" || params.set("mute", "1"), params.set("muted", "1")), `${frame}${frame.includes("?") ? "&" : "?"}${params.toString()}`;
}
__name(frameSrc, "frameSrc");
function setFrameSound(frame, on) {
  const win = frame.contentWindow;
  if (!win) return;
  const src = frame.src || "";
  src.includes("youtube") ? (win.postMessage(JSON.stringify({ event: "command", func: on ? "unMute" : "mute", args: "" }), "*"), win.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [on ? 100 : 0] }), "*")) : src.includes("vimeo") && win.postMessage(JSON.stringify({ method: "setVolume", value: on ? 1 : 0 }), "*");
}
__name(setFrameSound, "setFrameSound");
var __defProp2 = Object.defineProperty, __decorateClass = /* @__PURE__ */ __name((decorators, target, key, kind) => {
  for (var result = void 0, i = decorators.length - 1, decorator; i >= 0; i--)
    (decorator = decorators[i]) && (result = decorator(target, key, result) || result);
  return result && __defProp2(target, key, result), result;
}, "__decorateClass");
const css = `
.nq-mirror { background: var(--nq-section-bg, var(--ivory)); }
.nq-mirror-head { display: flex; justify-content: space-between; align-items: end; gap: 28px; }
.nq-mirror-head .nq-lead { max-width: 36ch; margin: 0; }
.nq-board { margin-top: 28px; display: grid; grid-template-columns: minmax(240px, 340px) minmax(0, 1fr); gap: 8px; padding: 12px; background: #14130f; color: #f7f4ef; border: 1px solid color-mix(in srgb, var(--gold) 42%, transparent); }
.nq-phone { position: relative; aspect-ratio: 9 / 16; background: #0e0d0b; overflow: hidden; border-radius: 18px; }
.nq-live { position: absolute; z-index: 4; inset-inline: 16px; bottom: 16px; display: flex; justify-content: space-between; align-items: end; gap: 12px; pointer-events: none; text-shadow: 0 1px 10px rgba(0,0,0,.65); }
.nq-live b { font-family: var(--serif); font-size: 1.2rem; font-weight: 700; }
.nq-live span { font-size: .72rem; letter-spacing: .14em; color: #e7d3a1; }
.nq-phone video, .nq-phone iframe, .nq-phone img.nq-poster { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; background: #0e0d0b; }
.nq-phone::after { content: ""; position: absolute; inset: 14px; border: 1px solid rgba(247,244,239,.35); pointer-events: none; z-index: 2; }
.nq-still { position: absolute; inset: 0; display: grid; align-content: end; padding: 28px 22px; background: linear-gradient(180deg, #14130f, #2a241c); }
.nq-still p { margin: 0; font-family: var(--serif); font-size: 1.4rem; font-weight: 700; }
.nq-play { position: absolute; inset: 0; z-index: 3; display: grid; place-items: center; border: 0; background: linear-gradient(180deg, transparent 20%, rgba(16,16,20,.55)); color: #f7f4ef; cursor: pointer; }
.nq-play span { width: 68px; height: 68px; border: 1px solid rgba(247,244,239,.85); border-radius: 50%; display: grid; place-items: center; background: rgba(16,16,20,.4); }
.nq-play svg { width: 18px; height: 18px; margin-inline-start: 2px; }
.nq-sound { position: absolute; z-index: 4; top: 22px; inset-inline-end: 22px; min-height: 34px; padding: 4px 12px; border: 1px solid rgba(247,244,239,.45); background: rgba(16,16,20,.55); color: #f7f4ef; font-family: inherit; font-size: .72rem; letter-spacing: .14em; cursor: pointer; }
.nq-side { display: grid; align-content: space-between; gap: 22px; padding: clamp(22px, 3vw, 42px); min-width: 0; }
.nq-index { margin: 0; letter-spacing: .22em; color: var(--gold-soft); font-size: .72rem; }
.nq-side .nq-quote { margin: 0; font-family: var(--serif); font-weight: 700; font-size: clamp(1.35rem, 2.4vw, 2rem); line-height: 1.5; }
.nq-side .nq-who { margin: 12px 0 0; letter-spacing: .08em; color: rgba(247,244,239,.72); }
.nq-film { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.nq-side .nq-actions { margin-top: 18px; }
.nq-reel-thumb { display: grid; grid-template-rows: 1fr auto; padding: 0; border: 1px solid rgba(247,244,239,.28); background: #1c1a16; color: #f7f4ef; cursor: pointer; overflow: hidden; text-align: start; }
.nq-reel-thumb img { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; display: block; }
.nq-reel-thumb b { padding: 8px 10px 10px; background: #1c1a16; font-family: var(--serif); font-size: .82rem; font-weight: 700; }
.nq-reel-thumb.is-on { border-color: var(--gold); }
@container (max-width: 860px) {
  .nq-mirror-head, .nq-board { display: grid; grid-template-columns: 1fr; }
  .nq-phone { max-width: 360px; }
}
`, _MirrorReels = class _MirrorReels extends LitElement {
  constructor() {
    super(...arguments), this.pick = 0, this.playing = !1, this.sound = !1, this.stop = () => {
    }, this.start = () => {
      this.playing = !0;
      const video = this.querySelector(".nq-reel");
      video instanceof HTMLVideoElement && (video.muted = !this.sound, video.play().catch(() => {
      }));
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("nq-host"), injectFonts(), injectStyles("nq-base", baseCss), injectStyles("nq-mirror-reels", css);
    const stopLocale = watchLocale(this), stopReveal = watchReveal(this);
    this.stop = () => {
      stopLocale(), stopReveal();
    };
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  updated() {
    this.sync();
  }
  sync() {
    const video = this.querySelector(".nq-reel");
    video instanceof HTMLVideoElement && (video.muted = !this.sound, video.volume = this.sound ? 1 : 0, this.playing && video.paused && video.play().catch(() => {
    }), !this.playing && !video.paused && video.pause());
    const frame = this.querySelector("iframe");
    if (frame instanceof HTMLIFrameElement && this.playing) {
      const send = /* @__PURE__ */ __name(() => setFrameSound(frame, this.sound), "send");
      frame.addEventListener("load", send, { once: !0 }), window.setTimeout(send, 600);
    }
  }
  clips() {
    return getCollectionItems(getConfig(this.config).clips, "clips").map((item) => ({
      source: clipUrl(item.video_url),
      poster: String(item.poster || ""),
      name: localizedString(item.name),
      place: localizedString(item.place),
      quote: localizedString(item.quote)
    })).filter((item) => item.source || item.poster || item.quote || item.name);
  }
  choose(index) {
    this.pick = index, this.sound = !1, this.playing = !0;
  }
  render() {
    const cfg = getConfig(this.config), items = this.clips(), item = items[this.pick] || items[0], title = localizedString(cfg.title), file = item ? isFileClip(item.source) : !1, id = String(cfg.anchor || "reels").replace(/^#/, ""), indexLabel = `${arDigits(this.pick + 1)} / ${arDigits(items.length)}`;
    return html`<section class=${`nq-root nq-sec nq-mirror ${schemeOf(cfg)}`} id=${id} style=${sectionStyle(cfg)} aria-label=${title || "reels"}>
      <div class="nq-wrap">
        <div class="nq-mirror-head nq-rev">
          <div>
            ${localizedString(cfg.kicker) ? html`<p class="nq-eyebrow">${localizedString(cfg.kicker)}</p>` : nothing}
            ${title ? html`<h2 class="nq-h2">${title}</h2>` : nothing}
          </div>
          ${localizedString(cfg.text) ? html`<p class="nq-lead">${localizedString(cfg.text)}</p>` : nothing}
        </div>
        ${item ? html`<div class="nq-board">
          <div class="nq-phone">
            ${file ? html`<video class="nq-reel" src=${item.source} poster=${item.poster || nothing} muted playsinline loop preload="auto"></video>` : this.playing && item.source ? html`<iframe src=${frameSrc(item.source)} title=${item.name || title || "reel"} allow="autoplay; encrypted-media; picture-in-picture"></iframe>` : item.poster ? html`<img class="nq-poster" src=${item.poster} alt=${item.name || ""} />` : html`<div class="nq-still"><p>${item.name || "عباية"}${item.place ? ` · ${item.place}` : ""}</p></div>`}
            ${item.source ? this.playing ? html`<button type="button" class="nq-sound" aria-pressed=${this.sound ? "true" : "false"} @click=${() => {
      this.sound = !this.sound;
    }}>${this.sound ? t({ ar: "كتم", en: "Mute" }) : t({ ar: "صوت", en: "Sound" })}</button>` : html`<button type="button" class="nq-play" aria-label=${t({ ar: "تشغيل", en: "Play" })} @click=${this.start}><span aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5.5v13l11-6.5z" /></svg></span></button>` : nothing}
            ${item.name || item.place ? html`<p class="nq-live"><b>${item.name}</b><span>${item.place}</span></p>` : nothing}
          </div>
          <div class="nq-side">
            <div>
              <p class="nq-index">${indexLabel}</p>
              ${item.quote ? html`<p class="nq-quote">${item.quote}</p>` : nothing}
              ${item.name || item.place ? html`<p class="nq-who">${item.name}${item.place ? ` · ${item.place}` : ""}</p>` : nothing}
            </div>
            <div>
              ${items.length > 1 ? html`<div class="nq-film" role="tablist">
                ${items.map((clip, index) => html`<button type="button" class=${`nq-reel-thumb ${index === this.pick ? "is-on" : ""}`} role="tab" aria-selected=${index === this.pick ? "true" : "false"} aria-label=${clip.name || `${index + 1}`} @click=${() => this.choose(index)}>
                  ${clip.poster ? html`<img src=${clip.poster} alt="" />` : nothing}
                  <b>${clip.name || index + 1}</b>
                </button>`)}
              </div>` : nothing}
              <div class="nq-actions">${renderCta(cfg.button_label, String(cfg.button_url || ""), "light")}</div>
            </div>
          </div>
        </div>` : emptyCopy()}
      </div>
    </section>`;
  }
};
__name(_MirrorReels, "MirrorReels");
let MirrorReels = _MirrorReels;
__decorateClass([
  property({ type: Object })
], MirrorReels.prototype, "config");
__decorateClass([
  state()
], MirrorReels.prototype, "pick");
__decorateClass([
  state()
], MirrorReels.prototype, "playing");
__decorateClass([
  state()
], MirrorReels.prototype, "sound");
typeof MirrorReels < "u" && MirrorReels.registerSallaComponent("salla-mirror-reels");
export {
  MirrorReels as default
};
