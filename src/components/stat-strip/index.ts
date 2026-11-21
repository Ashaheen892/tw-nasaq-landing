import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { arDigits, emptyCopy } from "../../utils/ui.js";

const css = `
.nq-kicker { margin: 0 0 10px; color: var(--gold); letter-spacing: .18em; font-size: .75rem; }
.nq-stats { display: grid; }
.nq-stat { display: grid; grid-template-columns: auto 1fr; gap: 8px 18px; align-items: baseline; padding: 22px 0; border-block-end: 1px solid var(--line); }
.nq-stat i { grid-row: span 2; font-style: normal; color: var(--gold); letter-spacing: .16em; }
.nq-stat b { font-size: clamp(1.8rem, 3vw, 2.7rem); font-weight: 700; line-height: 1; }
.nq-stat span { color: var(--muted); }
`;

export default class StatStrip extends LitElement {
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
    injectStyles("nq-stat-strip", css);
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
      .map((item) => ({ value: localizedString(item.value), label: localizedString(item.label) }))
      .filter((item) => item.value);
    return html`<section id="nq-stats" class=${`nq-root nq-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "stats"}>
      <div class="nq-wrap">
        ${localizedString(cfg.kicker) ? html`<p class="nq-kicker">${localizedString(cfg.kicker)}</p>` : ""}
        ${localizedString(cfg.title) ? html`<h2 class="nq-h2">${localizedString(cfg.title)}</h2>` : ""}
        ${items.length
          ? html`<div class="nq-stats">${items.map((item, index) => html`<article class="nq-stat nq-rev"><i>${arDigits(index + 1)}</i><b>${item.value}</b><span>${item.label}</span></article>`)}</div>`
          : emptyCopy()}
      </div>
    </section>`;
  }
}
