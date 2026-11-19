import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { getCollectionItems, getConfig, linkHref, localizedString, t, watchLocale } from "../../utils/config.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.nq-foot { background: var(--nq-section-bg, var(--ink)); color: #b9b2a7; padding-block: 48px 34px; font-size: .86rem; }
.nq-foot .nq-logo { color: var(--ivory); }
.nq-ft { display: flex; flex-wrap: wrap; gap: 30px 48px; justify-content: space-between; align-items: flex-start; }
.nq-ft h5 { color: var(--ivory); font-family: var(--serif); font-size: 1rem; margin: 0 0 14px; font-weight: 700; }
.nq-ft ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.nq-about { max-width: 30ch; }
.nq-about p { margin: 14px 0 0; }
.nq-pay { display: flex; gap: 8px; margin-top: 14px; flex-wrap: wrap; }
.nq-pay span { border: 1px solid rgba(247,244,239,.2); padding: 5px 10px; font-size: .68rem; letter-spacing: .08em; }
.nq-copy { margin-top: 34px; padding-top: 20px; border-top: 1px solid rgba(247,244,239,.14); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-size: .78rem; }
.nq-logo { font-family: var(--serif); font-weight: 700; font-size: 1.5rem; letter-spacing: .02em; line-height: 1; color: var(--ivory); }
.nq-logo small { display: block; font-family: var(--sans); font-size: .6rem; letter-spacing: .4em; color: var(--gold); font-weight: 400; margin-top: 4px; }
.nq-logo img { height: 42px; width: auto; object-fit: contain; }
`;

export default class PageFooter extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private storeName = "";
  private stop = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("nq-host");
    injectFonts();
    injectStyles("nq-base", baseCss);
    injectStyles("nq-page-footer", css);
    this.stop = watchLocale(this);
    const api = (window as any).Salla;
    const read = () => {
      this.storeName = api?.config?.get("store.name") || "";
    };
    read();
    api?.onReady?.().then(read);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const brand = localizedString(cfg.brand) || this.storeName || t({ ar: "المتجر", en: "Store" });
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
    return html`<footer class="nq-root nq-foot" style=${sectionStyle(cfg)}>
      <div class="nq-wrap">
        <div class="nq-ft">
          <div class="nq-about">
            <a href="#" class="nq-logo">${cfg.logo ? html`<img src=${cfg.logo} alt=${brand} />` : html`${brand}${mark ? html`<small>${mark}</small>` : nothing}`}</a>
            ${localizedString(cfg.about) ? html`<p>${localizedString(cfg.about)}</p>` : nothing}
            ${pays.length ? html`<div class="nq-pay">${pays.map((pay) => html`<span>${pay}</span>`)}</div>` : nothing}
          </div>
          ${columns.map((column) => html`<div>
            ${column.title ? html`<h5>${column.title}</h5>` : nothing}
            <ul>${column.links.map((link) => html`<li><a href=${link.url}>${link.label}</a></li>`)}</ul>
          </div>`)}
        </div>
        <div class="nq-copy">
          <span>${localizedString(cfg.copyright)}</span>
          <span>${localizedString(cfg.legal)}</span>
        </div>
      </div>
    </footer>`;
  }
}
