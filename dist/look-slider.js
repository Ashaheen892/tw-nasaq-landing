var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { nothing, html, LitElement } from "lit";
import { property } from "lit/decorators.js";
function getConfig(raw) {
  return raw ? raw.component && typeof raw.component == "object" ? raw.component : raw : {};
}
__name(getConfig, "getConfig");
function getLocale() {
  var _a2, _b, _c;
  const lang = ((_c = (_b = (_a2 = window.Salla) == null ? void 0 : _a2.lang) == null ? void 0 : _b.getLocale) == null ? void 0 : _c.call(_b)) || document.documentElement.lang || "ar";
  return String(lang).toLowerCase().startsWith("en") ? "en" : "ar";
}
__name(getLocale, "getLocale");
function isRtl() {
  return (document.documentElement.dir || (getLocale() === "ar" ? "rtl" : "ltr")) === "rtl";
}
__name(isRtl, "isRtl");
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
  var _a2;
  return Array.isArray(value) ? unwrapValue(((_a2 = value[0]) == null ? void 0 : _a2.value) ?? value[0] ?? "") : value && typeof value == "object" && "value" in value ? value.value : value ?? "";
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
  var _a2, _b;
  let frame = url;
  const kind = kindOf(url);
  try {
    const parsed = new URL(url);
    if (kind === "youtube") {
      const host = parsed.hostname.replace(/^www\./, "");
      let id = "";
      host === "youtu.be" ? id = parsed.pathname.split("/").filter(Boolean)[0] || "" : parsed.pathname.includes("/embed/") ? id = ((_a2 = parsed.pathname.split("/embed/")[1]) == null ? void 0 : _a2.split("/")[0]) || "" : parsed.pathname.includes("/shorts/") ? id = ((_b = parsed.pathname.split("/shorts/")[1]) == null ? void 0 : _b.split("/")[0]) || "" : id = parsed.searchParams.get("v") || "", id && (frame = `https://www.youtube-nocookie.com/embed/${id}`);
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
var _a;
const Deck = (_a = class {
  constructor(host, imageMs = 6500, frameMs = 18e3) {
    this.host = host, this.imageMs = imageMs, this.frameMs = frameMs, this.index = 0, this.sound = !1, this.paused = !1, this.reduced = !1, this.kinds = [], this.failed = /* @__PURE__ */ new Set(), this.timer = 0, this.left = 0, this.since = 0, this.point = 0, this.pointing = !1, this.pause = () => {
      this.paused || (this.paused = !0, this.timer && (window.clearTimeout(this.timer), this.timer = 0, this.left = Math.max(400, this.left - (performance.now() - this.since))), this.host.requestUpdate());
    }, this.resume = () => {
      this.paused && (this.paused = !1, this.auto && this.left && (this.since = performance.now(), this.timer = window.setTimeout(() => this.go(1), this.left)), this.host.requestUpdate());
    }, this.fail = () => {
      this.failed.has(this.index) || (this.failed.add(this.index), this.arm(), this.host.requestUpdate());
    }, this.key = (event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const forward = isRtl() ? event.key === "ArrowLeft" : event.key === "ArrowRight";
      this.go(forward ? 1 : -1);
    }, this.down = (event) => {
      event.target.closest("button, a") || (this.point = event.clientX, this.pointing = !0);
    }, this.up = (event) => {
      if (!this.pointing) return;
      this.pointing = !1;
      const delta = event.clientX - this.point;
      if (Math.abs(delta) < 48) return;
      const forward = isRtl() ? delta > 0 : delta < 0;
      this.go(forward ? 1 : -1);
    }, this.progress = (event) => {
      const video = event.currentTarget, bar = this.host.querySelector("[data-deck-fill]");
      bar && video.duration && (bar.style.transform = `scaleX(${video.currentTime / video.duration})`);
    }, host.addController(this);
  }
  static kindOf(video) {
    return video ? isFileClip(video) ? "file" : "frame" : "image";
  }
  hostConnected() {
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches, this.host.addEventListener("pointerenter", this.pause), this.host.addEventListener("pointerleave", this.resume), this.host.addEventListener("focusin", this.pause), this.host.addEventListener("focusout", this.resume);
  }
  hostDisconnected() {
    window.clearTimeout(this.timer), this.host.removeEventListener("pointerenter", this.pause), this.host.removeEventListener("pointerleave", this.resume), this.host.removeEventListener("focusin", this.pause), this.host.removeEventListener("focusout", this.resume);
  }
  /** Call from render with the current slides. Starts the clock on the first call and when the slides change. */
  sync(kinds) {
    const changed = kinds.join() !== this.kinds.join();
    changed && this.failed.clear(), this.kinds = kinds, this.index >= kinds.length && (this.index = 0), changed && this.arm();
  }
  get count() {
    return this.kinds.length;
  }
  get kind() {
    const kind = this.kinds[this.index] || "image";
    return kind === "file" && this.failed.has(this.index) ? "image" : kind;
  }
  /** How long the current slide stays, or 0 when it waits for a video to end. */
  get ms() {
    return this.kind === "file" ? 0 : this.kind === "frame" ? this.frameMs : this.imageMs;
  }
  get auto() {
    return !this.reduced && this.count > 1;
  }
  arm(ms = this.ms) {
    window.clearTimeout(this.timer), this.timer = 0, this.left = ms, !(!this.auto || !ms) && (this.since = performance.now(), !this.paused && (this.timer = window.setTimeout(() => this.go(1), ms)));
  }
  go(dir) {
    this.count < 2 || (this.index = (this.index + dir + this.count) % this.count, this.arm(), this.host.requestUpdate());
  }
  pick(index) {
    this.index = index, this.arm(), this.host.requestUpdate();
  }
  toggleSound() {
    this.sound = !this.sound, this.host.requestUpdate();
  }
}, __name(_a, "Deck"), _a);
function salla() {
  return window.Salla;
}
__name(salla, "salla");
function landingSettings() {
  var _a2, _b;
  return ((_b = (_a2 = salla()) == null ? void 0 : _a2.config) == null ? void 0 : _b.get("theme.settings")) || {};
}
__name(landingSettings, "landingSettings");
function isLandingPage() {
  var _a2, _b;
  return ((_b = (_a2 = salla()) == null ? void 0 : _a2.config) == null ? void 0 : _b.get("page.is_landing_page")) === !0;
}
__name(isLandingPage, "isLandingPage");
function pageMode() {
  var _a2;
  const value = landingSettings().page_for_product;
  return typeof value == "boolean" || value == null ? value === !1 ? "promotion" : "product" : typeof value == "string" ? value === "promotion" ? "promotion" : "product" : Array.isArray(value) && ((_a2 = value[0]) == null ? void 0 : _a2.value) === "promotion" ? "promotion" : "product";
}
__name(pageMode, "pageMode");
function landingProductId() {
  var _a2, _b;
  if (!isLandingPage() || pageMode() !== "product") return null;
  const id = (_b = (_a2 = landingSettings().product) == null ? void 0 : _a2.value) == null ? void 0 : _b[0];
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
function markEditing() {
  var _a2, _b;
  const root = document.documentElement, read = /* @__PURE__ */ __name(() => {
    var _a3, _b2;
    let on = !0;
    try {
      const salla2 = window.Salla;
      on = window.self !== window.top || ((_b2 = (_a3 = salla2 == null ? void 0 : salla2.config) == null ? void 0 : _a3.get) == null ? void 0 : _b2.call(_a3, "page.is_landing_page")) !== !0;
    } catch {
      on = !0;
    }
    root.dataset.lpEditing = on ? "1" : "0";
  }, "read");
  if (!root.dataset.lpEditing) {
    read();
    try {
      (_b = (_a2 = window.Salla) == null ? void 0 : _a2.onReady) == null || _b.call(_a2, read);
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
function arDigits(n) {
  return String(Math.max(0, n)).padStart(2, "0").replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}
__name(arDigits, "arDigits");
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
.nq-look { position: relative; isolation: isolate; overflow: hidden; color: #f7f4ef; background: #0e0d0b; --look-h: min(92svh, 860px); }
.nq-look.is-tall { --look-h: min(78svh, 720px); }
.nq-look.is-medium { --look-h: 560px; }
.nq-look-stage { position: relative; display: grid; grid-template-rows: 1fr auto; min-height: var(--look-h); touch-action: pan-y; }
.nq-look-bg { position: absolute; inset: 0; z-index: -2; }
.nq-look-bg img, .nq-look-bg video, .nq-look-bg iframe, .nq-look-frame img, .nq-look-frame video, .nq-look-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: var(--look-focus, center); border: 0; animation: nq-look-fade 1.1s ease; }
.nq-look-bg iframe, .nq-look-frame iframe { pointer-events: none; transform: scale(1.8); }
.nq-look-bg picture, .nq-look-frame picture { display: contents; }
.nq-look-shade { position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background:
    linear-gradient(to var(--look-to, left), rgb(10 9 7 / var(--look-a, .78)) 0%, rgb(10 9 7 / calc(var(--look-a, .78) * .55)) 42%, rgb(10 9 7 / 0) 78%),
    linear-gradient(to top, rgb(10 9 7 / .72) 0%, rgb(10 9 7 / 0) 46%); }
.nq-look.is-ltr { --look-to: right; }
.nq-look.is-soft { --look-a: .55; }
.nq-look.is-strong { --look-a: .92; }
.nq-look-in { position: relative; display: grid; align-items: end; gap: 40px; width: min(1240px, calc(100% - 40px)); margin-inline: auto; padding-block: clamp(110px, 16vh, 170px) 34px; }
.nq-look-copy { max-width: 620px; }
.nq-look-copy .nq-eyebrow { color: #d8c49c; }
.nq-look-copy .nq-eyebrow b { color: #f7f4ef; font-weight: 400; }
.nq-look-copy h2 { font-family: var(--serif); font-weight: 700; font-size: clamp(2.3rem, 5.6vw, 4.6rem); line-height: 1.1; margin: 0 0 18px; color: #f7f4ef; text-wrap: balance; animation: nq-look-in .9s ease; }
.nq-look-copy > p { color: rgb(247 244 239 / 82%); max-width: 46ch; margin: 0 0 30px; font-size: 1.04rem; line-height: 1.85; animation: nq-look-in 1.1s ease; }
.nq-look-copy .nq-btn { background: #f7f4ef; color: #101014; border-color: #f7f4ef; }
.nq-look-copy .nq-btn:hover { background: transparent; color: #f7f4ef; border-color: #d8c49c; }
.nq-look-frame { display: none; position: relative; overflow: hidden; width: clamp(260px, 27vw, 380px); aspect-ratio: 3 / 4.15; border-radius: 999px 999px 4px 4px; outline: 1px solid rgb(216 196 156 / 70%); outline-offset: 10px; box-shadow: 0 30px 80px rgb(0 0 0 / 45%); }
.nq-look-tag { position: absolute; z-index: 2; inset-inline: 0; bottom: 18px; text-align: center; font-family: var(--serif); font-size: 1.05rem; color: #f7f4ef; text-shadow: 0 1px 12px rgb(0 0 0 / 50%); }
.nq-look-chip { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 18px; padding: 7px 14px; border: 1px solid rgb(216 196 156 / 60%); font-size: .78rem; letter-spacing: .12em; color: #f7f4ef; }
@container (min-width: 900px) {
  .nq-look.is-framed .nq-look-in { grid-template-columns: minmax(0, 1fr) auto; }
  .nq-look.is-framed .nq-look-frame { display: block; margin-block-end: 8px; }
  .nq-look.is-framed .nq-look-bg img, .nq-look.is-framed .nq-look-bg video { filter: blur(26px) saturate(.85) brightness(.75); transform: scale(1.15); }
  .nq-look.is-framed .nq-look-bg iframe { display: none; }
  .nq-look.is-framed .nq-look-copy .nq-look-chip { display: none; }
}
.nq-look-bar { position: relative; display: flex; align-items: center; gap: 22px; width: min(1240px, calc(100% - 40px)); margin-inline: auto; padding-block: 0 30px; }
.nq-look-index { flex: 1; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 14px; list-style: none; margin: 0; padding: 0; }
.nq-look-index button { position: relative; display: grid; gap: 8px; width: 100%; padding: 0 0 12px; border: 0; background: transparent; color: rgb(247 244 239 / 58%); font: inherit; font-size: .84rem; text-align: start; cursor: pointer; transition: color .3s; }
.nq-look-index button i { font-style: normal; color: #d8c49c; letter-spacing: .14em; font-size: .74rem; }
.nq-look-index button span:not(.nq-line) { display: none; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.nq-look-index button[aria-current="true"] { color: #f7f4ef; }
.nq-look-index button::after { content: ""; position: absolute; inset-inline: 0; bottom: 0; height: 1px; background: rgb(247 244 239 / 28%); }
.nq-look-index .nq-line { position: absolute; z-index: 1; inset-inline: 0; bottom: 0; height: 1px; background: #d8c49c; transform: scaleX(0); transform-origin: right; }
.nq-look.is-ltr .nq-look-index .nq-line { transform-origin: left; }
.nq-look-index button[aria-current="true"] .nq-line.run { animation: nq-line var(--ms, 7000ms) linear forwards; }
.nq-look-index button[aria-current="true"] .nq-line.done { transform: scaleX(1); }
.nq-look.is-held .nq-line.run { animation-play-state: paused; }
@container (min-width: 700px) { .nq-look-index button span:not(.nq-line) { display: block; } }
.nq-look-arrows { display: flex; gap: 10px; flex: none; }
.nq-look-arrows button { width: 48px; height: 48px; border-radius: 50%; border: 1px solid rgb(247 244 239 / 55%); background: rgb(14 13 11 / 25%); color: #f7f4ef; cursor: pointer; display: grid; place-items: center; backdrop-filter: blur(6px); transition: border-color .3s, background .3s; }
.nq-look-arrows button:hover { border-color: #d8c49c; background: rgb(14 13 11 / 55%); }
.nq-look-arrows svg { width: 18px; height: 18px; }
.nq-look-sound { position: absolute; z-index: 3; top: 24px; inset-inline-end: 24px; min-height: 2.4rem; padding: 0 16px; border: 1px solid rgb(247 244 239 / 70%); border-radius: 999px; background: rgb(16 16 20 / 45%); color: #f7f4ef; font: inherit; font-size: .8rem; letter-spacing: .08em; cursor: pointer; }
.nq-look :focus-visible { outline: 2px solid #d8c49c; outline-offset: 3px; }
@keyframes nq-line { to { transform: scaleX(1); } }
@keyframes nq-look-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes nq-look-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .nq-look * { animation: none !important; } .nq-look-index .nq-line.run { transform: scaleX(1); } }
`, pick = /* @__PURE__ */ __name((value, allowed, fallback) => {
  const raw = String(unwrapValue(value) || fallback);
  return allowed.includes(raw) ? raw : fallback;
}, "pick"), _LookSlider = class _LookSlider extends LitElement {
  constructor() {
    super(...arguments), this.deck = new Deck(this, 7e3, 18e3), this.stop = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("nq-host"), injectFonts(), injectStyles("nq-base", baseCss), injectStyles("nq-look-slider", css), this.stop = watchLocale(this);
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  picture(slide) {
    if (!slide.image) return nothing;
    const alt = slide.alt || slide.title;
    return slide.mobile ? html`<picture><source media="(max-width: 699px)" srcset=${slide.mobile} /><img src=${slide.image} alt=${alt} /></picture>` : html`<img src=${slide.image} alt=${alt} />`;
  }
  moving(slide, total) {
    return Deck.kindOf(slide.video) === "frame" ? html`<iframe src=${frameSrc(slide.video)} title=${slide.alt || slide.title} allow="autoplay; encrypted-media; picture-in-picture" loading="lazy"></iframe>` : html`<video src=${slide.video} poster=${slide.image || nothing} .muted=${!this.deck.sound} autoplay playsinline preload="metadata" ?loop=${total < 2 || this.deck.reduced}
      aria-label=${slide.alt || slide.title} @timeupdate=${this.deck.progress} @ended=${() => this.deck.go(1)} @error=${this.deck.fail}></video>`;
  }
  render() {
    const cfg = getConfig(this.config), slides = getCollectionItems(cfg.items, "items").map((item) => ({
      image: String(item.image || "").trim(),
      mobile: String(item.image_mobile || "").trim(),
      video: clipUrl(item.video),
      alt: localizedString(item.alt),
      tag: localizedString(item.tag),
      title: localizedString(item.title),
      text: localizedString(item.text),
      button: localizedString(item.button),
      url: String(item.url || "").trim()
    })).filter((item) => item.title || item.image || item.video), deck = this.deck;
    deck.sync(slides.map((item) => Deck.kindOf(item.video)));
    const slide = slides[deck.index], label = localizedString(cfg.title) || t({ ar: "سلايدر", en: "Slider" });
    if (!slide) return html`<section class="nq-root nq-sec"><div class="nq-wrap">${emptyCopy()}</div></section>`;
    const framed = pick(cfg.fit, ["framed", "cover"], "framed") === "framed", height = pick(cfg.height, ["screen", "tall", "medium"], "screen"), shade = pick(cfg.shade, ["soft", "medium", "strong"], "medium"), focus = pick(cfg.focus, ["top", "center", "bottom"], "top"), classes = ["nq-root", "nq-look", framed ? "is-framed" : "", `is-${height}`, `is-${shade}`, isRtl() ? "" : "is-ltr", deck.paused ? "is-held" : ""].filter(Boolean).join(" "), kind = Deck.kindOf(slide.video), lineClass = deck.kind === "file" ? "" : deck.auto ? "run" : "done", prev = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.4" /></svg>`, next = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="1.4" /></svg>`, color = String(cfg.bg_color || "").trim(), bg = kind === "image" || framed ? this.picture(slide) : this.moving(slide, slides.length), frame = framed ? kind === "image" ? this.picture(slide) : this.moving(slide, slides.length) : nothing;
    return html`<section id="nq-look" class=${classes} style=${`--ms:${deck.ms}ms;--look-focus:${focus} center;${color ? `background:${color};` : ""}`}
        aria-roledescription="carousel" aria-label=${label} @keydown=${deck.key}>
      <div class="nq-look-stage" @pointerdown=${deck.down} @pointerup=${deck.up} @pointercancel=${deck.up}>
        <div class="nq-look-bg" aria-hidden=${framed ? "true" : "false"}>${bg}</div>
        <div class="nq-look-shade"></div>
        ${kind === "file" ? html`<button type="button" class="nq-look-sound" @click=${() => deck.toggleSound()}>${deck.sound ? t({ ar: "كتم الصوت", en: "Mute" }) : t({ ar: "تشغيل الصوت", en: "Sound on" })}</button>` : nothing}
        <div class="nq-look-in">
          <div class="nq-look-copy" aria-live="polite">
            <p class="nq-eyebrow">${localizedString(cfg.kicker) || label} · <b>${arDigits(deck.index + 1)} / ${arDigits(slides.length)}</b></p>
            ${slide.tag ? html`<span class="nq-look-chip">${slide.tag}</span>` : nothing}
            ${slide.title ? html`<h2>${slide.title}</h2>` : nothing}
            ${slide.text ? html`<p>${slide.text}</p>` : nothing}
            ${slide.button ? renderCta(slide.button, slide.url, "light") : nothing}
          </div>
          ${framed ? html`<div class="nq-look-frame">${frame}${slide.tag ? html`<span class="nq-look-tag">${slide.tag}</span>` : nothing}</div>` : nothing}
        </div>
        ${slides.length > 1 ? html`<div class="nq-look-bar">
          <ul class="nq-look-index">${slides.map((item, index) => html`<li><button type="button" aria-current=${index === deck.index ? "true" : "false"} aria-label=${item.title || item.tag || String(index + 1)} @click=${() => deck.pick(index)}>
            <i>${arDigits(index + 1)}</i><span>${item.title || item.tag}</span>
            <span class="nq-line ${index === deck.index ? lineClass : ""}" ?data-deck-fill=${index === deck.index && deck.kind === "file"} aria-hidden="true"></span>
          </button></li>`)}</ul>
          <div class="nq-look-arrows">
            <button type="button" aria-label=${t({ ar: "السابق", en: "Previous" })} @click=${() => deck.go(-1)}>${isRtl() ? prev : next}</button>
            <button type="button" aria-label=${t({ ar: "التالي", en: "Next" })} @click=${() => deck.go(1)}>${isRtl() ? next : prev}</button>
          </div>
        </div>` : nothing}
      </div>
    </section>`;
  }
};
__name(_LookSlider, "LookSlider");
let LookSlider = _LookSlider;
__decorateClass([
  property({ type: Object })
], LookSlider.prototype, "config");
typeof LookSlider < "u" && LookSlider.registerSallaComponent("salla-look-slider");
export {
  LookSlider as default
};
