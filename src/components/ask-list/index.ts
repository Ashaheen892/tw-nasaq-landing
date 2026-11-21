import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.nq-faq { background: var(--nq-section-bg, var(--ivory)); }
.nq-faq-g { display: grid; grid-template-columns: .8fr 1.2fr; gap: clamp(24px, 5vw, 70px); align-items: start; }
.nq-ac { border-top: 1px solid var(--line); }
.nq-ac details { border-bottom: 1px solid var(--line); }
.nq-ac summary { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 22px 2px; cursor: pointer; font-size: 1rem; list-style: none; }
.nq-ac summary::-webkit-details-marker { display: none; }
.nq-ac summary::after { content: "+"; font-family: var(--serif); font-size: 1.5rem; color: var(--gold); }
.nq-ac details[open] summary::after { content: "−"; }
.nq-ac .ans { padding: 0 2px 24px; color: var(--muted); font-size: .93rem; margin: 0; }
@container (max-width: 880px) { .nq-faq-g { grid-template-columns: 1fr; } }
`;

export default class AskList extends LitElement {
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
    injectStyles("nq-ask-list", css);
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
    const title = localizedString(cfg.title);
    const items = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({ q: localizedString(item.q), a: localizedString(item.a) }))
      .filter((item) => item.q && item.a);
    const id = String(cfg.anchor || "faq");
    return html`<section class=${`nq-root nq-sec nq-faq ${schemeOf(cfg)}`} id=${id} style=${sectionStyle(cfg)} aria-label=${title || "faq"}>
      <div class="nq-wrap nq-faq-g">
        <div class="nq-rev">
          ${localizedString(cfg.kicker) ? html`<p class="nq-eyebrow">${localizedString(cfg.kicker)}</p>` : nothing}
          ${title ? html`<h2 class="nq-h2">${title}</h2>` : nothing}
          ${localizedString(cfg.text) ? html`<p class="nq-lead">${localizedString(cfg.text)}</p>` : nothing}
        </div>
        ${items.length
          ? html`<div class="nq-ac nq-rev">${items.map((item, index) => html`<details ?open=${index === 0}><summary>${item.q}</summary><p class="ans">${item.a}</p></details>`)}</div>`
          : emptyCopy()}
      </div>
    </section>`;
  }
}
