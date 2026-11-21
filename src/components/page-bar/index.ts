import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { flag, getCollectionItems, getConfig, linkHref, localizedString, t, unwrapValue, watchLocale } from "../../utils/config.js";
import { applyTone, currentTone, savedTone, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, setKitFont, watchReveal } from "../../utils/styles.js";

const css = `
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

export default class PageBar extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private open = false;
  @state() private dark = false;
  private stop = () => {};
  private pinned: HTMLElement | null = null;
  private opened: HTMLElement[] = [];
  private modeKey = "";

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("nq-host");
    injectFonts();
    injectStyles("nq-base", baseCss);
    injectStyles("nq-page-bar", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    const onTone = () => { this.dark = currentTone() === "dark"; };
    window.addEventListener("nq-tone", onTone);
    this.stop = () => {
      stopLocale();
      stopReveal();
      window.removeEventListener("nq-tone", onTone);
      this.release();
    };
  }

  protected willUpdate() {
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

  protected updated() {
    this.pin();
  }

  private showMode(cfg: Record<string, any>): boolean {
    if (cfg.show_mode_toggle == null || cfg.show_mode_toggle === "") return true;
    return flag(cfg.show_mode_toggle);
  }

  /** Missing value keeps the page font. An explicit off inherits the Salla store font. */
  private kitFont(cfg: Record<string, any>): boolean {
    if (cfg.use_kit_font == null || cfg.use_kit_font === "") return true;
    return flag(cfg.use_kit_font);
  }

  private openingMode(cfg: Record<string, any>): "light" | "dark" {
    const base = String(unwrapValue(cfg.default_mode) || "light");
    if (this.showMode(cfg)) {
      const saved = savedTone();
      if (saved) return saved;
    }
    if (base === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return base === "dark" ? "dark" : "light";
  }

  /** Keep the page where it was. Focusing the sticky header otherwise jumps to the top. */
  private place(run: () => void) {
    const view = this.ownerDocument.defaultView;
    if (!view) {
      run();
      return;
    }
    const nodes = new Set<Element>([this.ownerDocument.documentElement, this.ownerDocument.body]);
    if (this.ownerDocument.scrollingElement) nodes.add(this.ownerDocument.scrollingElement);
    let node: HTMLElement | null = this;
    while (node) {
      nodes.add(node);
      node = node.parentElement;
    }
    const marks = [...nodes].map((el) => [el, el.scrollTop] as const);
    const x = view.scrollX;
    const y = view.scrollY;
    const put = () => {
      for (const [el, top] of marks) if (el.scrollTop !== top) el.scrollTop = top;
      if (Math.abs(view.scrollY - y) > 1 || Math.abs(view.scrollX - x) > 1) view.scrollTo(x, y);
    };
    run();
    put();
    view.requestAnimationFrame(() => {
      put();
      view.requestAnimationFrame(put);
    });
  }

  private outerBox(): HTMLElement {
    let node: HTMLElement = this;
    while (node.parentElement && node.parentElement !== document.body && node.parentElement !== document.documentElement) {
      const parent = node.parentElement;
      const sections = [...parent.children].filter((el) => el.tagName !== "SCRIPT" && el.tagName !== "STYLE");
      if (sections.length > 1) return node;
      node = parent;
    }
    return node;
  }

  private pin() {
    const cfg = getConfig(this.config);
    const sticky = flag(cfg.sticky);
    const outer = this.outerBox();
    if (this.pinned && this.pinned !== outer) this.release();
    this.pinned = outer;
    outer.style.position = sticky ? "sticky" : "";
    outer.style.top = sticky ? "0" : "";
    outer.style.zIndex = sticky ? "40" : "";
    this.opened.forEach((el) => { el.style.overflow = ""; });
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

  private release() {
    if (this.pinned) {
      this.pinned.style.position = this.pinned.style.top = this.pinned.style.zIndex = "";
      this.pinned = null;
    }
    this.opened.forEach((el) => { el.style.overflow = ""; });
    this.opened = [];
  }

  render() {
    const cfg = getConfig(this.config);
    const brand = localizedString(cfg.brand) || t({ ar: "المتجر", en: "Store" });
    const mark = localizedString(cfg.mark);
    const links = getCollectionItems<Record<string, any>>(cfg.links, "links")
      .map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" }))
      .filter((item) => item.label);
    const logo = (this.dark && cfg.logo_dark) || cfg.logo;
    return html`<header class=${`nq-root nq-bar ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <nav class="nq-nav nq-wrap ${this.open ? "is-open" : ""}">
        <a href=${linkHref(cfg.home_url) || "#"} class="nq-logo" aria-label=${brand}>
          ${logo
            ? html`<img src=${logo} alt=${brand} />`
            : html`${brand}${mark ? html`<small>${mark}</small>` : nothing}`}
        </a>
        ${links.length ? html`<ul>${links.map((item) => html`<li><a href=${item.url} @click=${() => { this.open = false; }}>${item.label}</a></li>`)}</ul>` : nothing}
        <span class="nq-sp"></span>
        ${this.showMode(cfg) ? html`<button type="button" class="nq-tone" aria-pressed=${this.dark ? "true" : "false"} aria-label=${this.dark ? t({ ar: "التبديل إلى الوضع الفاتح", en: "Switch to light mode" }) : t({ ar: "التبديل إلى الوضع الداكن", en: "Switch to dark mode" })} @mousedown=${(event: Event) => event.preventDefault()} @click=${() => this.place(() => { applyTone(this.dark ? "light" : "dark"); this.dark = currentTone() === "dark"; })}>
          ${this.dark
            ? html`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor" /><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" /></g></svg>`
            : html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.5 2.4a9 9 0 1 0 7.1 13.6A8 8 0 0 1 14.5 2.4z" /></svg>`}
        </button>` : nothing}
        <button type="button" class="nq-menu" aria-expanded=${this.open ? "true" : "false"} aria-label=${t({ ar: "القائمة", en: "Menu" })} @click=${() => { this.open = !this.open; }}>☰</button>
      </nav>
    </header>`;
  }
}
