var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { nothing, html, LitElement } from "lit";
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
const _Deck = class _Deck {
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
};
__name(_Deck, "Deck");
let Deck = _Deck;
typeof Deck < "u" && Deck.registerSallaComponent("salla-look-slider");
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
.nq-look { background: var(--nq-section-bg, var(--page)); }
.nq-look-g { display: grid; gap: clamp(28px, 5vw, 64px); align-items: center; }
@container (min-width: 900px) { .nq-look-g { grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); } }
.nq-look-copy .nq-eyebrow b { color: var(--ink); font-weight: 400; letter-spacing: .1em; }
.nq-look-copy h2 { font-family: var(--serif); font-weight: 700; font-size: clamp(2rem, 4.6vw, 3.6rem); line-height: 1.15; margin: 0 0 16px; animation: nq-look-in .8s ease; }
.nq-look-copy > p { color: var(--muted); max-width: 44ch; margin: 0 0 26px; }
.nq-look-index { list-style: none; padding: 0; margin: 34px 0 0; display: grid; border-block-start: 1px solid var(--line); }
.nq-look-index button { position: relative; display: grid; grid-template-columns: 2.4rem 1fr; gap: 10px; width: 100%; padding: 14px 0; border: 0; border-block-end: 1px solid var(--line); background: transparent; color: var(--muted); font: inherit; text-align: start; cursor: pointer; transition: color .3s; }
.nq-look-index button i { font-style: normal; color: var(--gold); letter-spacing: .12em; }
.nq-look-index button[aria-current="true"] { color: var(--ink); }
.nq-look-index .nq-line { position: absolute; inset-inline: 0; bottom: -1px; height: 1px; background: var(--gold); transform: scaleX(0); transform-origin: right; }
[dir="ltr"] .nq-look-index .nq-line { transform-origin: left; }
.nq-look-index button[aria-current="true"] .nq-line.run { animation: nq-line var(--ms, 6500ms) linear forwards; }
.nq-look-index button[aria-current="true"] .nq-line.done { transform: scaleX(1); }
.nq-look.is-held .nq-line.run { animation-play-state: paused; }
.nq-look-media { position: relative; aspect-ratio: 4 / 5; max-height: 78vh; width: 100%; margin-inline: auto; overflow: hidden; background: linear-gradient(150deg, var(--sand), var(--sand-2)); touch-action: pan-y; }
.nq-look-media::after { content: ""; position: absolute; inset: 14px; border: 1px solid color-mix(in srgb, var(--ivory) 70%, transparent); pointer-events: none; z-index: 1; }
.nq-look-media img, .nq-look-media video, .nq-look-media iframe { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; animation: nq-look-fade 1s ease; }
.nq-look-media iframe { pointer-events: none; transform: scale(1.8); }
.nq-look-cap { position: absolute; z-index: 2; inset-inline: 28px; bottom: 26px; display: flex; justify-content: space-between; align-items: end; gap: 12px; color: #f7f4ef; text-shadow: 0 1px 12px rgb(0 0 0 / 40%); }
.nq-look-cap span { font-family: var(--serif); font-size: 1.05rem; }
.nq-look-cap small { letter-spacing: .3em; font-size: .66rem; }
.nq-look-sound { position: absolute; z-index: 3; top: 26px; inset-inline-end: 26px; min-height: 2.4rem; padding: 0 16px; border: 1px solid #f7f4ef; border-radius: 999px; background: rgb(16 16 20 / 45%); color: #f7f4ef; font: inherit; font-size: .8rem; letter-spacing: .08em; cursor: pointer; }
.nq-look-arrows { display: flex; gap: 10px; margin-top: 14px; justify-content: flex-end; }
[dir="rtl"] .nq-look-arrows svg { transform: scaleX(-1); }
.nq-look-arrows button { width: 46px; height: 46px; border-radius: 50%; border: 1px solid var(--gold); background: transparent; color: var(--ink); cursor: pointer; display: grid; place-items: center; }
.nq-look-arrows svg { width: 18px; height: 18px; }
@keyframes nq-line { to { transform: scaleX(1); } }
@keyframes nq-look-fade { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: none; } }
@keyframes nq-look-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .nq-look * { animation: none !important; } .nq-look-index .nq-line.run { transform: scaleX(1); } }
`, _LookSlider = class _LookSlider extends LitElement {
  constructor() {
    super(...arguments), this.deck = new Deck(this, 7e3, 18e3), this.stop = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("nq-host"), injectFonts(), injectStyles("nq-base", baseCss), injectStyles("nq-look-slider", css);
    const stopLocale = watchLocale(this), stopReveal = watchReveal(this);
    this.stop = () => {
      stopLocale(), stopReveal();
    };
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  media(slide, total) {
    const kind = Deck.kindOf(slide.video);
    return kind === "image" ? slide.image ? html`<img src=${slide.image} alt=${slide.alt || slide.title} />` : nothing : kind === "frame" ? html`<iframe src=${frameSrc(slide.video)} title=${slide.alt || slide.title} allow="autoplay; encrypted-media; picture-in-picture" loading="lazy"></iframe>` : html`<video src=${slide.video} poster=${slide.image || nothing} .muted=${!this.deck.sound} autoplay playsinline preload="metadata" ?loop=${total < 2 || this.deck.reduced}
        aria-label=${slide.alt || slide.title} @timeupdate=${this.deck.progress} @ended=${() => this.deck.go(1)} @error=${this.deck.fail}></video>
      <button type="button" class="nq-look-sound" @click=${() => this.deck.toggleSound()}>${this.deck.sound ? t({ ar: "كتم الصوت", en: "Mute" }) : t({ ar: "تشغيل الصوت", en: "Sound on" })}</button>`;
  }
  render() {
    const cfg = getConfig(this.config), slides = getCollectionItems(cfg.items, "items").map((item) => ({
      image: String(item.image || "").trim(),
      video: clipUrl(item.video),
      alt: localizedString(item.alt),
      tag: localizedString(item.tag),
      title: localizedString(item.title),
      text: localizedString(item.text),
      button: localizedString(item.button),
      url: String(item.url || "").trim()
    })).filter((item) => item.title || item.image || item.video), deck = this.deck;
    deck.sync(slides.map((item) => Deck.kindOf(item.video)));
    const slide = slides[deck.index], label = localizedString(cfg.title) || t({ ar: "سلايدر", en: "Slider" }), lineClass = deck.kind === "file" ? "" : deck.auto ? "run" : "done", left = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="1.4" /></svg>`, right = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.4" /></svg>`;
    return html`<section id="nq-look" class=${`nq-root nq-sec nq-look ${schemeOf(cfg)} ${deck.paused ? "is-held" : ""}`} style=${`${sectionStyle(cfg)};--ms:${deck.ms}ms`}
        aria-roledescription="carousel" aria-label=${label} @keydown=${deck.key}>
      <div class="nq-wrap">
        ${slide ? html`<div class="nq-look-g">
          <div class="nq-look-copy" aria-live="polite">
            <p class="nq-eyebrow">${localizedString(cfg.kicker) || label} · <b>${arDigits(deck.index + 1)} / ${arDigits(slides.length)}</b></p>
            ${slide.title ? html`<h2>${slide.title}</h2>` : nothing}
            ${slide.text ? html`<p>${slide.text}</p>` : nothing}
            ${slide.button ? renderCta(slide.button, slide.url) : nothing}
            ${slides.length > 1 ? html`<ul class="nq-look-index">${slides.map((item, index) => html`<li><button type="button" aria-current=${index === deck.index ? "true" : "false"} @click=${() => deck.pick(index)}>
              <i>${arDigits(index + 1)}</i><span>${item.title || item.tag}</span>
              <span class="nq-line ${index === deck.index ? lineClass : ""}" ?data-deck-fill=${index === deck.index && deck.kind === "file"} aria-hidden="true"></span>
            </button></li>`)}</ul>` : nothing}
          </div>
          <div>
            <div class="nq-look-media" @pointerdown=${deck.down} @pointerup=${deck.up} @pointercancel=${deck.up}>
              ${this.media(slide, slides.length)}
              ${slide.tag ? html`<div class="nq-look-cap"><span>${slide.tag}</span><small>${arDigits(deck.index + 1)}</small></div>` : nothing}
            </div>
            ${slides.length > 1 ? html`<div class="nq-look-arrows">
              <button type="button" aria-label=${t({ ar: "السابق", en: "Previous" })} @click=${() => deck.go(-1)}>${left}</button>
              <button type="button" aria-label=${t({ ar: "التالي", en: "Next" })} @click=${() => deck.go(1)}>${right}</button>
            </div>` : nothing}
          </div>
        </div>` : emptyCopy()}
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
