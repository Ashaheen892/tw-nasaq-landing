import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { flag, getCollectionItems, getConfig, linkHref, localizedString, t, watchLocale } from "../../utils/config.js";
import { currentTone, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

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
`;

export default class PageFooter extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private storeName = "";
  @state() private dark = false;
  @state() private raised = false;
  @state() private atFooter = false;
  private stop = () => {};
  private floater: HTMLButtonElement | null = null;
  private seen?: IntersectionObserver;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("nq-host");
    injectFonts();
    injectStyles("nq-base", baseCss);
    injectStyles("nq-page-footer", css);
    const stopLocale = watchLocale(this);
    const onTone = () => { this.dark = currentTone() === "dark"; };
    window.addEventListener("nq-tone", onTone);
    this.dark = currentTone() === "dark";
    this.stop = () => {
      stopLocale();
      window.removeEventListener("nq-tone", onTone);
    };
    document.addEventListener("scroll", this.onScroll, { capture: true, passive: true });
    const api = (window as any).Salla;
    const read = () => {
      this.storeName = api?.config?.get("store.name") || "";
    };
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
    super.disconnectedCallback();
  }

  protected updated() {
    this.syncFloater();
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

  private shown(value: unknown): boolean {
    if (value == null || value === "") return true;
    return flag(value);
  }

  private onScroll = (event?: Event) => {
    const target = event?.target;
    const nested = target instanceof Element ? target.scrollTop : 0;
    const top = Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0, nested);
    const next = top > 360;
    if (next !== this.raised) this.raised = next;
  };

  private toTop = (event: Event) => {
    event.preventDefault();
    const docs = [document];
    try {
      if (window.parent && window.parent !== window) docs.push(window.parent.document);
    } catch { /* the parent page is a different site */ }
    const nodes = new Set<Element>();
    docs.forEach((doc) => {
      nodes.add(doc.documentElement);
      if (doc.body) nodes.add(doc.body);
      if (doc.scrollingElement) nodes.add(doc.scrollingElement);
      doc.querySelectorAll("*").forEach((el) => {
        if (el.scrollTop > 0) nodes.add(el);
      });
    });
    let node: Element | null = this;
    while (node) {
      nodes.add(node);
      node = node.parentElement;
    }
    nodes.forEach((el) => {
      try { el.scrollTo({ top: 0, behavior: "smooth" }); } catch { el.scrollTop = 0; }
    });
  };

  private syncFloater() {
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
    const label = localizedString(cfg.top_label) || t({ ar: "العودة للأعلى", en: "Back to top" });
    this.floater.setAttribute("aria-label", label);
    this.floater.replaceChildren();
    const text = document.createElement("span");
    text.textContent = label;
    const mark = document.createElement("span");
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "↑";
    this.floater.append(text, mark);
    this.floater.classList.add("show");
  }

  render() {
    const cfg = getConfig(this.config);
    const brand = localizedString(cfg.brand) || this.storeName || t({ ar: "المتجر", en: "Store" });
    const showTop = this.shown(cfg.show_top);
    const topLabel = localizedString(cfg.top_label) || t({ ar: "العودة للأعلى", en: "Back to top" });
    const mark = localizedString(cfg.mark);
    const columns = [1, 2, 3].map((index) => ({
      title: localizedString(cfg[`col${index}_title`]),
      links: getCollectionItems<Record<string, any>>(cfg[`col${index}`], `col${index}`)
        .map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" }))
        .filter((item) => item.label),
    })).filter((column) => column.title || column.links.length);
    const pays = getCollectionItems<Record<string, any>>(cfg.payments, "payments")
      .map((item) => localizedString(item.label))
      .filter(Boolean);
    const logo = (this.dark && cfg.logo_dark) || cfg.logo;
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
}
