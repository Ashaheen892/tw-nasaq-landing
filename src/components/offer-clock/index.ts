import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { flag, getConfig, localizedString, t, unwrapValue, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { arDigits } from "../../utils/ui.js";
import { clipUrl, frameSrc, isFileClip } from "../../utils/video.js";

const css = `
.nq-cd { background: var(--nq-section-bg, var(--ink)); color: var(--ivory); position: relative; overflow: hidden; }
.nq-cd::after { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: radial-gradient(60% 80% at 85% 10%, rgba(184,148,95,.22), transparent 60%); }
.nq-cd-video { position: absolute; inset: 0; z-index: 0; width: 100%; height: 100%; object-fit: cover; border: 0; pointer-events: none; }
.nq-cd.has-video { color: #f7f4ef; background: #101014; }
.nq-cd.has-video::before { content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: rgba(16,16,20,.45); }
.nq-cd.has-video::after { z-index: 1; }
.nq-cd.has-video p { color: rgba(247,244,239,.82); }
.nq-cd-g { position: relative; z-index: 2; display: flex; flex-wrap: wrap; gap: 34px; align-items: center; justify-content: space-between; }
.nq-cd h2 { font-family: var(--serif); font-size: clamp(1.7rem, 3.6vw, 2.6rem); margin: 0 0 8px; font-weight: 700; }
.nq-cd p { margin: 0; color: color-mix(in srgb, var(--ivory) 72%, transparent); font-size: .95rem; }
.nq-clock { display: flex; gap: 12px; }
.nq-unit { min-width: 86px; text-align: center; border: 1px solid color-mix(in srgb, var(--ivory) 22%, transparent); padding: 14px 10px; }
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

  protected updated() {
    const video = this.querySelector(".nq-cd-video");
    if (!(video instanceof HTMLVideoElement)) return;
    video.muted = true;
    video.defaultMuted = true;
    if (video.paused) void video.play().catch(() => undefined);
  }

  private arm() {
    const raw = String(unwrapValue(getConfig(this.config).ends_at) || "").trim();
    const end = raw ? Date.parse(raw) : 0;
    this.end = Number.isFinite(end) ? end : 0;
    this.left = Math.max(0, this.end - Date.now());
  }

  render() {
    const cfg = getConfig(this.config);
    const title = localizedString(cfg.title);
    const seconds = Math.floor(this.left / 1000);
    const parts = [
      [Math.floor(seconds / 86400), t({ ar: "يوم", en: "day" })],
      [Math.floor((seconds % 86400) / 3600), t({ ar: "ساعة", en: "hour" })],
      [Math.floor((seconds % 3600) / 60), t({ ar: "دقيقة", en: "min" })],
      [seconds % 60, t({ ar: "ثانية", en: "sec" })],
    ];
    const video = flag(cfg.show_video) ? clipUrl(cfg.video_url) : "";
    const file = video && (isFileClip(video) || !/youtube|youtu\.be|vimeo/i.test(video));
    return html`<section class=${`nq-root nq-cd nq-sec ${schemeOf(cfg)} ${video ? "has-video" : ""}`} style=${sectionStyle(cfg)} aria-label=${title || "offer"}>
      ${video
        ? file
          ? html`<video class="nq-cd-video" src=${video} autoplay muted loop playsinline aria-hidden="true"></video>`
          : html`<iframe class="nq-cd-video" src=${frameSrc(video)} title="" allow="autoplay; encrypted-media" tabindex="-1"></iframe>`
        : nothing}
      <div class="nq-wrap nq-cd-g">
        <div class="nq-rev">
          ${localizedString(cfg.kicker) ? html`<p class="nq-eyebrow">${localizedString(cfg.kicker)}</p>` : ""}
          ${title ? html`<h2>${title}</h2>` : ""}
          ${localizedString(cfg.text) ? html`<p>${localizedString(cfg.text)}</p>` : ""}
        </div>
        <div class="nq-clock nq-rev" aria-live="polite">
          ${parts.map(([value, label]) => html`<div class="nq-unit"><b>${arDigits(Number(value))}</b><span>${label}</span></div>`)}
        </div>
      </div>
    </section>`;
  }
}
