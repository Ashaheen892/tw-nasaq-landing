import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.nq-stat-head { text-align: center; margin-bottom: clamp(28px, 4vw, 48px); }
.nq-stat-head .nq-kicker { margin: 0 0 10px; color: var(--gold); letter-spacing: .18em; font-size: .75rem; }
.nq-stat-head .nq-kicker::before, .nq-stat-head .nq-kicker::after { content: "◆"; margin-inline: .7em; font-size: .55em; vertical-align: middle; }
.nq-stats { display: grid; gap: 28px; }
@container (min-width: 720px) { .nq-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; } }
.nq-stat { position: relative; display: grid; justify-items: center; gap: 10px; padding: 8px 20px; text-align: center; }
@container (min-width: 720px) { .nq-stat + .nq-stat::before { content: ""; position: absolute; inset-inline-start: 0; top: 12%; bottom: 12%; width: 1px; background: linear-gradient(transparent, var(--gold), transparent); } }
.nq-stat b { font-family: var(--serif); font-size: clamp(2.3rem, 4.5vw, 3.6rem); font-weight: 700; line-height: 1; color: var(--ink); }
.nq-stat i { width: 28px; height: 1px; background: var(--gold); }
.nq-stat span { color: var(--muted); letter-spacing: .04em; }
.nq-stat.nq-rev { transition-delay: calc(var(--i, 0) * 110ms); }
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
        <div class="nq-stat-head">
          ${localizedString(cfg.kicker) ? html`<p class="nq-kicker">${localizedString(cfg.kicker)}</p>` : ""}
          ${localizedString(cfg.title) ? html`<h2 class="nq-h2">${localizedString(cfg.title)}</h2>` : ""}
        </div>
        ${items.length
          ? html`<div class="nq-stats">${items.map((item, index) => html`<article class="nq-stat nq-rev" style=${`--i:${index}`}><b>${item.value}</b><i aria-hidden="true"></i><span>${item.label}</span></article>`)}</div>`
          : emptyCopy()}
      </div>
    </section>`;
  }
}
