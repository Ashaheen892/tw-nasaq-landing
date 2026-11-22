import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.nq-kicker { margin: 0 0 10px; color: var(--gold); letter-spacing: .18em; font-size: .75rem; }
.nq-partners { display: grid; }
.nq-partner { display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; align-items: baseline; padding: 18px 0; border-block-end: 1px solid var(--line); }
.nq-partner i { color: var(--gold); font-style: normal; }
.nq-partner b { font-size: 1.2rem; font-weight: 700; }
.nq-partner span { grid-column: 2; color: var(--muted); }
.nq-partner.nq-rev { transition-delay: calc(var(--i, 0) * 90ms); }
`;

export default class PartnerRow extends LitElement {
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
    injectStyles("nq-partner-row", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    this.stop = () => { stopLocale(); stopReveal(); };
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const items = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({ name: localizedString(item.name), note: localizedString(item.note) }))
      .filter((item) => item.name);
    return html`<section id="nq-partners" class=${`nq-root nq-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "partners"}>
      <div class="nq-wrap">
        ${localizedString(cfg.kicker) ? html`<p class="nq-kicker">${localizedString(cfg.kicker)}</p>` : nothing}
        ${localizedString(cfg.title) ? html`<h2 class="nq-h2">${localizedString(cfg.title)}</h2>` : nothing}
        ${items.length
          ? html`<div class="nq-partners">${items.map((item, index) => html`<article class="nq-partner nq-rev" style=${`--i:${index}`}><i aria-hidden="true">—</i><b>${item.name}</b>${item.note ? html`<span>${item.note}</span>` : nothing}</article>`)}</div>`
          : emptyCopy()}
      </div>
    </section>`;
  }
}
