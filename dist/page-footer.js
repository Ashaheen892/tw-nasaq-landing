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
function unwrapValue(value) {
  var _a;
  return Array.isArray(value) ? unwrapValue(((_a = value[0]) == null ? void 0 : _a.value) ?? value[0] ?? "") : value && typeof value == "object" && "value" in value ? value.value : value ?? "";
}
__name(unwrapValue, "unwrapValue");
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
function currentTone() {
  return document.documentElement.classList.contains("nq-mode-dark") ? "dark" : "light";
}
__name(currentTone, "currentTone");
function schemeOf(cfg) {
  const scheme = String(unwrapValue(cfg.color_scheme) || "auto");
  return scheme === "dark" ? "nq-dark" : scheme === "light" ? "nq-light" : "nq-auto";
}
__name(schemeOf, "schemeOf");
function injectStyles(id, css2) {
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
const LIGHT = "--ink:#101014; --ink-soft:#2a2a30; --ivory:#f7f4ef; --sand:#e8dfd3; --sand-2:#d9ccbb; --gold:#b8945f; --gold-soft:#d8c49c; --line:#ddd2c4; --muted:#7d7468; --card:#ffffff; --page:#f7f4ef;", DARK = "--ink:#f3efe8; --ink-soft:#d9d1c6; --ivory:#14130f; --sand:#2a261f; --sand-2:#3a342b; --gold:#d4b483; --gold-soft:#e6d3b0; --line:rgba(243,239,232,.16); --muted:#b7ab9c; --card:#1c1a16; --page:#0e0d0b;", baseCss = `
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
  display: block; box-sizing: border-box; color: var(--ink); font-family: inherit; font-weight: 300; line-height: 1.75;
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
.nq-foot { background: var(--nq-section-bg, var(--ink)); color: color-mix(in srgb, var(--ivory) 72%, transparent); padding-block: 48px 34px; font-size: .86rem; }
.nq-foot .nq-logo { color: var(--ivory); }
.nq-ft { display: flex; flex-wrap: wrap; gap: 30px 48px; justify-content: space-between; align-items: flex-start; }
.nq-ft h5 { color: var(--ivory); font-family: var(--serif); font-size: 1rem; margin: 0 0 14px; font-weight: 700; }
.nq-ft ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.nq-about { max-width: 30ch; }
.nq-about p { margin: 14px 0 0; }
.nq-pay { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.nq-pay span { border: 1px solid color-mix(in srgb, var(--ivory) 22%, transparent); padding: 5px 10px; font-size: .68rem; letter-spacing: .08em; }
.nq-copy { margin-top: 34px; padding-top: 20px; border-top: 1px solid color-mix(in srgb, var(--ivory) 16%, transparent); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-size: .78rem; }
.nq-totop, .nq-top { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 8px 18px; border: 1px solid color-mix(in srgb, var(--ivory) 28%, transparent); background: transparent; color: var(--ivory); font-family: var(--sans); font-size: .78rem; letter-spacing: .14em; cursor: pointer; transition: .3s; }
.nq-foot .nq-totop { display: flex; width: fit-content; margin: 28px auto 0; }
.nq-totop:hover, .nq-top:hover { border-color: var(--gold); color: var(--gold); }
.nq-top { position: fixed; z-index: 70; inset-inline-end: 18px; bottom: 22px; background: var(--ink); opacity: 0; pointer-events: none; transform: translateY(10px); }
.nq-top.show { opacity: 1; pointer-events: auto; transform: none; }
.nq-logo { font-family: var(--serif); font-weight: 700; font-size: 1.5rem; letter-spacing: .02em; line-height: 1; color: var(--ivory); }
.nq-logo small { display: block; font-family: var(--sans); font-size: .6rem; letter-spacing: .4em; color: var(--gold); font-weight: 400; margin-top: 4px; }
.nq-logo img { height: 42px; width: auto; object-fit: contain; }
`, _PageFooter = class _PageFooter extends LitElement {
  constructor() {
    super(...arguments), this.storeName = "", this.dark = !1, this.raised = !1, this.atFooter = !1, this.stop = () => {
    }, this.floater = null, this.onScroll = (event) => {
      const target = event == null ? void 0 : event.target, nested = target instanceof Element ? target.scrollTop : 0, next = Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0, nested) > 360;
      next !== this.raised && (this.raised = next);
    }, this.toTop = (event) => {
      event.preventDefault();
      const docs = [document];
      try {
        window.parent && window.parent !== window && docs.push(window.parent.document);
      } catch {
      }
      const nodes = /* @__PURE__ */ new Set();
      docs.forEach((doc) => {
        nodes.add(doc.documentElement), doc.body && nodes.add(doc.body), doc.scrollingElement && nodes.add(doc.scrollingElement), doc.querySelectorAll("*").forEach((el) => {
          el.scrollTop > 0 && nodes.add(el);
        });
      });
      let node = this;
      for (; node; )
        nodes.add(node), node = node.parentElement;
      nodes.forEach((el) => {
        try {
          el.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
          el.scrollTop = 0;
        }
      });
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    var _a;
    super.connectedCallback(), this.classList.add("nq-host"), injectFonts(), injectStyles("nq-base", baseCss), injectStyles("nq-page-footer", css);
    const stopLocale = watchLocale(this), onTone = /* @__PURE__ */ __name(() => {
      this.dark = currentTone() === "dark";
    }, "onTone");
    window.addEventListener("nq-tone", onTone), this.dark = currentTone() === "dark", this.stop = () => {
      stopLocale(), window.removeEventListener("nq-tone", onTone);
    }, document.addEventListener("scroll", this.onScroll, { capture: !0, passive: !0 });
    const api = window.Salla, read = /* @__PURE__ */ __name(() => {
      var _a2;
      this.storeName = ((_a2 = api == null ? void 0 : api.config) == null ? void 0 : _a2.get("store.name")) || "";
    }, "read");
    read(), (_a = api == null ? void 0 : api.onReady) == null || _a.call(api).then(read), this.onScroll();
  }
  disconnectedCallback() {
    var _a, _b;
    this.stop(), document.removeEventListener("scroll", this.onScroll, { capture: !0 }), (_a = this.seen) == null || _a.disconnect(), (_b = this.floater) == null || _b.remove(), this.floater = null, super.disconnectedCallback();
  }
  updated() {
    var _a;
    this.syncFloater();
    const button = this.querySelector(".nq-totop");
    if ((_a = this.seen) == null || _a.disconnect(), !button) {
      this.atFooter = !1;
      return;
    }
    this.seen = new IntersectionObserver(([entry]) => {
      this.atFooter = entry.isIntersecting;
    }, { threshold: 0.5 }), this.seen.observe(button);
  }
  shown(value) {
    return value == null || value === "" ? !0 : flag(value);
  }
  syncFloater() {
    var _a;
    const cfg = getConfig(this.config);
    if (!(this.shown(cfg.show_top) && this.raised && !this.atFooter)) {
      (_a = this.floater) == null || _a.classList.remove("show");
      return;
    }
    if (!this.floater) {
      const button = document.createElement("button");
      button.type = "button", button.className = "nq-top", button.addEventListener("click", this.toTop), document.body.appendChild(button), this.floater = button;
    }
    const label = localizedString(cfg.top_label) || t({ ar: "العودة للأعلى", en: "Back to top" });
    this.floater.setAttribute("aria-label", label), this.floater.replaceChildren();
    const text = document.createElement("span");
    text.textContent = label;
    const mark = document.createElement("span");
    mark.setAttribute("aria-hidden", "true"), mark.textContent = "↑", this.floater.append(text, mark), this.floater.classList.add("show");
  }
  render() {
    const cfg = getConfig(this.config), brand = localizedString(cfg.brand) || this.storeName || t({ ar: "المتجر", en: "Store" }), showTop = this.shown(cfg.show_top), topLabel = localizedString(cfg.top_label) || t({ ar: "العودة للأعلى", en: "Back to top" }), mark = localizedString(cfg.mark), columns = [1, 2, 3].map((index) => ({
      title: localizedString(cfg[`col${index}_title`]),
      links: getCollectionItems(cfg[`col${index}`], `col${index}`).map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" })).filter((item) => item.label)
    })).filter((column) => column.title || column.links.length), pays = getCollectionItems(cfg.payments, "payments").map((item) => localizedString(item.label)).filter(Boolean), logo = this.dark && cfg.logo_dark || cfg.logo;
    return html`<footer class=${`nq-root nq-foot ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <div class="nq-wrap">
        <div class="nq-ft">
          <div class="nq-about">
            <a href="#" class="nq-logo">${logo ? html`<img src=${logo} alt=${brand} />` : html`${brand}${mark ? html`<small>${mark}</small>` : nothing}`}</a>
            ${localizedString(cfg.about) ? html`<p>${localizedString(cfg.about)}</p>` : nothing}
            ${pays.length ? html`<div class="nq-pay">${pays.map((pay) => html`<span>${pay}</span>`)}</div>` : nothing}
          </div>
          ${columns.map((column) => html`<div>
            ${column.title ? html`<h5>${column.title}</h5>` : nothing}
            <ul>${column.links.map((link) => html`<li><a href=${link.url}>${link.label}</a></li>`)}</ul>
          </div>`)}
        </div>
        ${showTop ? html`<button type="button" class="nq-totop" @click=${this.toTop}>${topLabel} <span aria-hidden="true">↑</span></button>` : nothing}
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
__decorateClass([
  state()
], PageFooter.prototype, "dark");
__decorateClass([
  state()
], PageFooter.prototype, "raised");
__decorateClass([
  state()
], PageFooter.prototype, "atFooter");
typeof PageFooter < "u" && PageFooter.registerSallaComponent("salla-page-footer");
export {
  PageFooter as default
};
