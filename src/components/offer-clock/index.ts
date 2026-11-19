import { html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
import { getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { renderCta } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { arDigits } from "../../utils/ui.js";

const css = `
.nq-cd { background: var(--nq-section-bg, var(--ink)); color: var(--ivory); position: relative; overflow: hidden; }
.nq-cd::after { content: ""; position: absolute; inset: 0; background: radial-gradient(60% 80% at 85% 10%, rgba(184,148,95,.22), transparent 60%); }
.nq-cd-g { position: relative; z-index: 2; display: flex; flex-wrap: wrap; gap: 34px; align-items: center; justify-content: space-between; }
.nq-cd h2 { font-family: var(--serif); font-size: clamp(1.7rem, 3.6vw, 2.6rem); margin: 0 0 8px; font-weight: 700; }
.nq-cd p { margin: 0; color: #c9c2b7; font-size: .95rem; }
.nq-clock { display: flex; gap: 12px; }
.nq-unit { min-width: 86px; text-align: center; border: 1px solid rgba(247,244,239,.22); padding: 14px 10px; }
.nq-unit b { display: block; font-family: var(--serif); font-size: 2.1rem; line-height: 1; font-variant-numeric: tabular-nums; }
.nq-unit span { font-size: .68rem; letter-spacing: .2em; color: var(--gold-soft); }
`;

export default class OfferClock extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private left = 0;
  private stop = () => {};
  private timer = 0;
  private end = 0;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("nq-host");
    injectFonts();
    injectStyles("nq-base", baseCss);
    injectStyles("nq-offer-clock", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    this.arm();
    this.timer = window.setInterval(() => {
      this.left = Math.max(0, this.end - Date.now());
    }, 1000);
    this.stop = () => {
      stopLocale();
      stopReveal();
      window.clearInterval(this.timer);
    };
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  protected willUpdate() {
    this.arm();
  }

  private arm() {
    const cfg = getConfig(this.config);
    const hours = Math.min(Math.max(Number(cfg.hours) || 56, 1), 240);
    const key = `nq-offer-end-${hours}`;
    let end = 0;
    try {
      end = Number(sessionStorage.getItem(key)) || 0;
    } catch {
      end = 0;
    }
    if (!end || end < Date.now() - 1000) {
      end = Date.now() + hours * 3600000;
      try { sessionStorage.setItem(key, String(end)); } catch { /* private mode */ }
    }
    this.end = end;
    this.left = Math.max(0, end - Date.now());
  }

  render() {
    const cfg = getConfig(this.config);
    const title = localizedString(cfg.title);
    const seconds = Math.floor(this.left / 1000);
    const parts = [
      [Math.floor(seconds / 86400), localizedString(cfg.day_label) || "يوم"],
      [Math.floor((seconds % 86400) / 3600), localizedString(cfg.hour_label) || "ساعة"],
      [Math.floor((seconds % 3600) / 60), localizedString(cfg.minute_label) || "دقيقة"],
      [seconds % 60, localizedString(cfg.second_label) || "ثانية"],
    ];
    return html`<section class="nq-root nq-cd nq-sec" style=${sectionStyle(cfg)} aria-label=${title || "offer"}>
      <div class="nq-wrap nq-cd-g">
        <div class="nq-rev">
          ${localizedString(cfg.kicker) ? html`<p class="nq-eyebrow">${localizedString(cfg.kicker)}</p>` : ""}
          ${title ? html`<h2>${title}</h2>` : ""}
          ${localizedString(cfg.text) ? html`<p>${localizedString(cfg.text)}</p>` : ""}
        </div>
        <div class="nq-clock nq-rev" aria-live="polite">
          ${parts.map(([value, label]) => html`<div class="nq-unit"><b>${arDigits(Number(value))}</b><span>${label}</span></div>`)}
        </div>
        ${renderCta(cfg.button_label, cfg.button_url || "", "light")}
      </div>
    </section>`;
  }
}
