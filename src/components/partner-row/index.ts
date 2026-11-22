import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.nq-partner-head { text-align: center; margin-bottom: clamp(26px, 4vw, 44px); }
.nq-partner-head .nq-kicker { margin: 0 0 10px; color: var(--gold); letter-spacing: .18em; font-size: .75rem; }
.nq-partners { display: grid; gap: 18px; }
@container (min-width: 640px) { .nq-partners { grid-template-columns: repeat(auto-fit, minmax(210px, 270px)); justify-content: center; gap: 22px; } }
.nq-partner { position: relative; display: grid; justify-items: center; align-content: end; gap: 8px; min-height: 230px; padding: 70px 22px 30px; text-align: center; border: 1px solid var(--gold-soft); border-radius: 999px 999px 4px 4px; background: linear-gradient(180deg, color-mix(in srgb, var(--sand) 55%, transparent), var(--card)); }
.nq-partner::before { content: ""; position: absolute; inset: 8px 8px auto; height: calc(100% - 16px); border: 1px solid color-mix(in srgb, var(--gold) 35%, transparent); border-radius: 999px 999px 2px 2px; pointer-events: none; }
.nq-partner i { font-style: normal; color: var(--gold); font-size: .7rem; }
.nq-partner b { font-family: var(--serif); font-size: 1.3rem; font-weight: 700; }
.nq-partner span { color: var(--muted); letter-spacing: .06em; font-size: .88rem; }
.nq-partner.nq-rev { transition-delay: calc(var(--i, 0) * 110ms); }
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
        <div class="nq-partner-head">
          ${localizedString(cfg.kicker) ? html`<p class="nq-kicker">${localizedString(cfg.kicker)}</p>` : nothing}
          ${localizedString(cfg.title) ? html`<h2 class="nq-h2">${localizedString(cfg.title)}</h2>` : nothing}
        </div>
        ${items.length
          ? html`<div class="nq-partners">${items.map((item, index) => html`<article class="nq-partner nq-rev" style=${`--i:${index}`}><i aria-hidden="true">◆</i><b>${item.name}</b>${item.note ? html`<span>${item.note}</span>` : nothing}</article>`)}</div>`
          : emptyCopy()}
      </div>
    </section>`;
  }
}
