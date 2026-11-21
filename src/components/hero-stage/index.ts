import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, linkHref, localizedString, watchLocale } from "../../utils/config.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { frame } from "../../utils/ui.js";

const css = `
.nq-hero { position: relative; overflow: hidden; background: var(--nq-section-bg, var(--ivory)); }
.nq-hero-g { display: grid; grid-template-columns: 1.02fr .98fr; gap: clamp(24px, 5vw, 70px); align-items: center; padding-block: clamp(40px, 7vw, 90px); }
.nq-hero h1 { font-family: var(--serif); font-weight: 700; font-size: clamp(2.5rem, 6.6vw, 5.1rem); line-height: 1.05; margin: 0 0 20px; letter-spacing: -.02em; }
.nq-hero h1 em { font-style: normal; color: var(--gold); }
.nq-hero .nq-copy { color: var(--ink-soft); font-size: clamp(1rem, 1.5vw, 1.12rem); max-width: 46ch; margin: 0 0 30px; }
.nq-hero-cta { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
.nq-hero-meta { display: flex; gap: 34px; margin-top: 40px; padding-top: 26px; border-top: 1px solid var(--line); }
.nq-hero-meta b { display: block; font-family: var(--serif); font-size: 1.7rem; font-weight: 700; line-height: 1; }
.nq-hero-meta span { font-size: .76rem; color: var(--muted); letter-spacing: .08em; }
.nq-stack { position: relative; display: grid; grid-template-columns: repeat(2, 1fr); gap: 14px; }
.nq-stack .tall { grid-row: span 2; aspect-ratio: 3/5.1; }
.nq-hero-tag { position: absolute; inset-inline-end: var(--pad); top: clamp(24px, 5vw, 60px); writing-mode: vertical-rl; font-size: .7rem; letter-spacing: .42em; color: var(--muted); text-transform: uppercase; }
@container (max-width: 880px) {
  .nq-hero-g { grid-template-columns: 1fr; }
  .nq-hero-tag { display: none; }
  .nq-stack .tall { grid-row: auto; aspect-ratio: 3/4; }
}
`;

export default class HeroStage extends LitElement {
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
    injectStyles("nq-hero-stage", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    this.stop = () => {
      stopLocale();
      stopReveal();
    };
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const line = localizedString(cfg.title_line);
    const before = localizedString(cfg.title_before);
    const accent = localizedString(cfg.title_accent);
    const after = localizedString(cfg.title_after);
    const photos = getCollectionItems<Record<string, any>>(cfg.photos, "photos").slice(0, 3);
    const stats = getCollectionItems<Record<string, any>>(cfg.stats, "stats")
      .map((item) => ({ value: localizedString(item.value), label: localizedString(item.label) }))
      .filter((item) => item.value);
    const secondary = localizedString(cfg.secondary_label);
    const secondaryUrl = linkHref(cfg.secondary_url);
    const tag = localizedString(cfg.side_tag);
    return html`<section class=${`nq-root nq-hero ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${line || "hero"}>
      ${tag ? html`<span class="nq-hero-tag">${tag}</span>` : nothing}
      <div class="nq-wrap nq-hero-g">
        <div class="nq-rev">
          ${localizedString(cfg.kicker) ? html`<p class="nq-eyebrow">${localizedString(cfg.kicker)}</p>` : nothing}
          ${line || before || accent || after ? html`<h1>${line ? html`${line}<br>` : nothing}${before} ${accent ? html`<em>${accent}</em>` : nothing} ${after}</h1>` : nothing}
          ${localizedString(cfg.text) ? html`<p class="nq-copy">${localizedString(cfg.text)}</p>` : nothing}
          <div class="nq-hero-cta">
            ${renderCta(cfg.primary_label, linkHref(cfg.primary_url))}
            ${secondary && secondaryUrl ? html`<a class="nq-btn ghost" href=${secondaryUrl}>${secondary}</a>` : nothing}
          </div>
          ${stats.length ? html`<div class="nq-hero-meta">${stats.map((item) => html`<div><b>${item.value}</b><span>${item.label}</span></div>`)}</div>` : nothing}
        </div>
        ${photos.length ? html`<div class="nq-stack nq-rev">
          ${photos.map((photo, index) => frame(String(photo.image || ""), localizedString(photo.caption), index === 0 ? "tall" : ""))}
        </div>` : nothing}
      </div>
    </section>`;
  }
}
