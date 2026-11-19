import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, linkHref, localizedString, watchLocale } from "../../utils/config.js";
import { renderCta } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";

const css = `
.nq-fin { background: var(--nq-section-bg, linear-gradient(160deg, var(--sand) 0%, var(--sand-2) 100%)); position: relative; overflow: hidden; text-align: center; }
.nq-fin::before { content: ""; position: absolute; inset: clamp(18px, 3vw, 36px); border: 1px solid rgba(255,255,255,.6); pointer-events: none; }
.nq-fin-in { position: relative; z-index: 2; max-width: 62ch; margin-inline: auto; }
.nq-fin h2 { font-family: var(--serif); font-size: clamp(2rem, 5vw, 3.6rem); line-height: 1.1; margin: 0 0 16px; font-weight: 700; }
.nq-fin p { color: var(--ink-soft); margin: 0 0 30px; }
.nq-fin .nq-cta { display: flex; flex-wrap: wrap; gap: 14px; justify-content: center; }
.nq-perks { display: flex; flex-wrap: wrap; gap: 24px; justify-content: center; margin-top: 34px; font-size: .84rem; color: var(--ink-soft); }
.nq-perks div::before { content: "◆"; color: var(--gold); font-size: .5rem; margin-inline-end: 8px; vertical-align: middle; }
`;

export default class CloseInvite extends LitElement {
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
    injectStyles("nq-close-invite", css);
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
    const perks = getCollectionItems<Record<string, any>>(cfg.perks, "perks")
      .map((item) => localizedString(item.text))
      .filter(Boolean);
    const secondary = localizedString(cfg.secondary_label);
    const secondaryUrl = linkHref(cfg.secondary_url);
    return html`<section class="nq-root nq-sec nq-fin" style=${sectionStyle(cfg)} aria-label=${title || "close"}>
      <div class="nq-wrap nq-fin-in nq-rev">
        ${localizedString(cfg.kicker) ? html`<p class="nq-eyebrow">${localizedString(cfg.kicker)}</p>` : nothing}
        ${title ? html`<h2>${title}</h2>` : nothing}
        ${localizedString(cfg.text) ? html`<p>${localizedString(cfg.text)}</p>` : nothing}
        <div class="nq-cta">
          ${renderCta(cfg.primary_label, linkHref(cfg.primary_url))}
          ${secondary && secondaryUrl ? html`<a class="nq-btn ghost" href=${secondaryUrl}>${secondary}</a>` : nothing}
        </div>
        ${perks.length ? html`<div class="nq-perks">${perks.map((perk) => html`<div>${perk}</div>`)}</div>` : nothing}
      </div>
    </section>`;
  }
}
