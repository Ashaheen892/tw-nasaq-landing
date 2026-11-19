import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { flag, getCollectionItems, getConfig, linkHref, localizedString, t, watchLocale } from "../../utils/config.js";
import { renderCta } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";

const css = `
.nq-bar { position: relative; background: var(--nq-section-bg, rgba(247,244,239,.86)); backdrop-filter: blur(12px); border-bottom: 1px solid var(--line); }
.nq-nav { display: flex; align-items: center; gap: 26px; min-height: 74px; }
.nq-logo { font-family: var(--serif); font-weight: 700; font-size: 1.5rem; letter-spacing: .02em; line-height: 1; }
.nq-logo small { display: block; font-family: var(--sans); font-size: .6rem; letter-spacing: .4em; color: var(--gold); font-weight: 400; margin-top: 4px; }
.nq-logo img { height: 42px; width: auto; max-width: 42vw; object-fit: contain; }
.nq-nav ul { display: flex; gap: 28px; list-style: none; margin: 0; padding: 0; font-size: .88rem; }
.nq-nav ul a { position: relative; padding-block: 4px; }
.nq-nav ul a::after { content: ""; position: absolute; inset-inline: 0; bottom: 0; height: 1px; background: var(--ink); transform: scaleX(0); transform-origin: right; transition: .35s; }
.nq-nav ul a:hover::after { transform: scaleX(1); }
.nq-sp { margin-inline-start: auto; }
.nq-ico, .nq-menu { display: inline-grid; place-items: center; width: 40px; height: 40px; border: 1px solid var(--line); border-radius: 50%; background: transparent; color: inherit; cursor: pointer; font-size: .95rem; }
.nq-menu { display: none; }
@container (max-width: 860px) {
  .nq-nav { gap: 10px; }
  .nq-logo { font-size: 1.15rem; white-space: nowrap; }
  .nq-nav .nq-btn { padding: 10px 14px; min-height: 44px; white-space: nowrap; }
  .nq-nav ul { display: none; position: absolute; inset-inline: 0; top: 100%; z-index: 5; flex-direction: column; gap: 0; padding: 8px 0 14px; background: var(--ivory); border-bottom: 1px solid var(--line); }
  .nq-nav.is-open ul { display: flex; }
  .nq-nav ul a { display: block; padding: 12px var(--pad); }
  .nq-menu { display: inline-grid; }
}
`;

export default class PageBar extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private open = false;
  private stop = () => {};
  private pinned: HTMLElement | null = null;
  private opened: HTMLElement[] = [];

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
    this.stop = () => {
      stopLocale();
      stopReveal();
      this.release();
    };
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  protected updated() {
    this.pin();
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
    const search = linkHref(cfg.search_url);
    return html`<header class="nq-root nq-bar" style=${sectionStyle(cfg)}>
      <nav class="nq-nav nq-wrap ${this.open ? "is-open" : ""}">
        <a href=${linkHref(cfg.home_url) || "#"} class="nq-logo" aria-label=${brand}>
          ${cfg.logo
            ? html`<img src=${cfg.logo} alt=${brand} />`
            : html`${brand}${mark ? html`<small>${mark}</small>` : nothing}`}
        </a>
        ${links.length ? html`<ul>${links.map((item) => html`<li><a href=${item.url} @click=${() => { this.open = false; }}>${item.label}</a></li>`)}</ul>` : nothing}
        <span class="nq-sp"></span>
        ${flag(cfg.show_search) && search ? html`<a href=${search} class="nq-ico" aria-label=${t({ ar: "البحث", en: "Search" })}>⌕</a>` : nothing}
        <button type="button" class="nq-menu" aria-expanded=${this.open ? "true" : "false"} aria-label=${t({ ar: "القائمة", en: "Menu" })} @click=${() => { this.open = !this.open; }}>☰</button>
        ${renderCta(cfg.cta_label, linkHref(cfg.cta_url))}
      </nav>
    </header>`;
  }
}
