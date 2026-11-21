import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.nq-brands { display: flex; flex-wrap: wrap; justify-content: center; gap: 18px 0; padding-block: 8px; }
.nq-brand { display: grid; justify-items: center; gap: 8px; min-width: 9rem; padding-inline: 1.3rem; color: inherit; text-decoration: none; }
.nq-brand + .nq-brand { box-shadow: -1px 0 0 var(--gold); }
.nq-brand img { height: 36px; width: auto; max-width: 88px; object-fit: contain; }
.nq-brand b { font-weight: 500; letter-spacing: .12em; }
.nq-brand small { color: var(--muted); letter-spacing: .04em; }
`;

export default class BrandRow extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  private stop = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("nq-host");
    injectFonts();
    injectStyles("nq-base", baseCss);
    injectStyles("nq-brand-row", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const items = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({ name: localizedString(item.name), note: localizedString(item.note), image: String(item.image || "").trim(), url: String(item.url || "").trim() }))
      .filter((item) => item.name);
    const mark = (item: { name: string; note: string; image: string }) => html`${item.image ? html`<img src=${item.image} alt="" />` : nothing}<b>${item.name}</b>${item.note ? html`<small>${item.note}</small>` : nothing}`;
    return html`<section id="nq-brands" class=${`nq-root nq-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "brands"}>
      <div class="nq-wrap">
        ${localizedString(cfg.title) ? html`<h2 class="nq-h2" style="text-align:center">${localizedString(cfg.title)}</h2>` : nothing}
        ${items.length ? html`<div class="nq-brands">${items.map((item) => item.url ? html`<a class="nq-brand" href=${item.url}>${mark(item)}</a>` : html`<span class="nq-brand">${mark(item)}</span>`)}</div>` : emptyCopy()}
      </div>
    </section>`;
  }
}
