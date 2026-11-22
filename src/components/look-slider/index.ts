import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { Deck } from "../../utils/deck.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { arDigits, emptyCopy } from "../../utils/ui.js";
import { clipUrl, frameSrc } from "../../utils/video.js";

const css = `
.nq-look { background: var(--nq-section-bg, var(--page)); }
.nq-look-g { display: grid; gap: clamp(28px, 5vw, 64px); align-items: center; }
@container (min-width: 900px) { .nq-look-g { grid-template-columns: minmax(0, .9fr) minmax(0, 1.1fr); } }
.nq-look-copy .nq-eyebrow b { color: var(--ink); font-weight: 400; letter-spacing: .1em; }
.nq-look-copy h2 { font-family: var(--serif); font-weight: 700; font-size: clamp(2rem, 4.6vw, 3.6rem); line-height: 1.15; margin: 0 0 16px; animation: nq-look-in .8s ease; }
.nq-look-copy > p { color: var(--muted); max-width: 44ch; margin: 0 0 26px; }
.nq-look-index { list-style: none; padding: 0; margin: 34px 0 0; display: grid; border-block-start: 1px solid var(--line); }
.nq-look-index button { position: relative; display: grid; grid-template-columns: 2.4rem 1fr; gap: 10px; width: 100%; padding: 14px 0; border: 0; border-block-end: 1px solid var(--line); background: transparent; color: var(--muted); font: inherit; text-align: start; cursor: pointer; transition: color .3s; }
.nq-look-index button i { font-style: normal; color: var(--gold); letter-spacing: .12em; }
.nq-look-index button[aria-current="true"] { color: var(--ink); }
.nq-look-index .nq-line { position: absolute; inset-inline: 0; bottom: -1px; height: 1px; background: var(--gold); transform: scaleX(0); transform-origin: right; }
[dir="ltr"] .nq-look-index .nq-line { transform-origin: left; }
.nq-look-index button[aria-current="true"] .nq-line.run { animation: nq-line var(--ms, 6500ms) linear forwards; }
.nq-look-index button[aria-current="true"] .nq-line.done { transform: scaleX(1); }
.nq-look.is-held .nq-line.run { animation-play-state: paused; }
.nq-look-media { position: relative; aspect-ratio: 4 / 5; max-height: 78vh; width: 100%; margin-inline: auto; overflow: hidden; background: linear-gradient(150deg, var(--sand), var(--sand-2)); touch-action: pan-y; }
.nq-look-media::after { content: ""; position: absolute; inset: 14px; border: 1px solid color-mix(in srgb, var(--ivory) 70%, transparent); pointer-events: none; z-index: 1; }
.nq-look-media img, .nq-look-media video, .nq-look-media iframe { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; animation: nq-look-fade 1s ease; }
.nq-look-media iframe { pointer-events: none; transform: scale(1.8); }
.nq-look-cap { position: absolute; z-index: 2; inset-inline: 28px; bottom: 26px; display: flex; justify-content: space-between; align-items: end; gap: 12px; color: #f7f4ef; text-shadow: 0 1px 12px rgb(0 0 0 / 40%); }
.nq-look-cap span { font-family: var(--serif); font-size: 1.05rem; }
.nq-look-cap small { letter-spacing: .3em; font-size: .66rem; }
.nq-look-sound { position: absolute; z-index: 3; top: 26px; inset-inline-end: 26px; min-height: 2.4rem; padding: 0 16px; border: 1px solid #f7f4ef; border-radius: 999px; background: rgb(16 16 20 / 45%); color: #f7f4ef; font: inherit; font-size: .8rem; letter-spacing: .08em; cursor: pointer; }
.nq-look-arrows { display: flex; gap: 10px; margin-top: 14px; justify-content: flex-end; }
[dir="rtl"] .nq-look-arrows svg { transform: scaleX(-1); }
.nq-look-arrows button { width: 46px; height: 46px; border-radius: 50%; border: 1px solid var(--gold); background: transparent; color: var(--ink); cursor: pointer; display: grid; place-items: center; }
.nq-look-arrows svg { width: 18px; height: 18px; }
@keyframes nq-line { to { transform: scaleX(1); } }
@keyframes nq-look-fade { from { opacity: 0; transform: scale(1.04); } to { opacity: 1; transform: none; } }
@keyframes nq-look-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .nq-look * { animation: none !important; } .nq-look-index .nq-line.run { transform: scaleX(1); } }
`;

type Slide = { image: string; video: string; alt: string; tag: string; title: string; text: string; button: string; url: string };

export default class LookSlider extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  private deck = new Deck(this, 7000, 18000);
  private stop = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("nq-host");
    injectFonts();
    injectStyles("nq-base", baseCss);
    injectStyles("nq-look-slider", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    this.stop = () => { stopLocale(); stopReveal(); };
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  private media(slide: Slide, total: number) {
    const kind = Deck.kindOf(slide.video);
    if (kind === "image") return slide.image ? html`<img src=${slide.image} alt=${slide.alt || slide.title} />` : nothing;
    if (kind === "frame") return html`<iframe src=${frameSrc(slide.video)} title=${slide.alt || slide.title} allow="autoplay; encrypted-media; picture-in-picture" loading="lazy"></iframe>`;
    return html`<video src=${slide.video} poster=${slide.image || nothing} .muted=${!this.deck.sound} autoplay playsinline preload="metadata" ?loop=${total < 2 || this.deck.reduced}
        aria-label=${slide.alt || slide.title} @timeupdate=${this.deck.progress} @ended=${() => this.deck.go(1)} @error=${this.deck.fail}></video>
      <button type="button" class="nq-look-sound" @click=${() => this.deck.toggleSound()}>${this.deck.sound ? t({ ar: "كتم الصوت", en: "Mute" }) : t({ ar: "تشغيل الصوت", en: "Sound on" })}</button>`;
  }

  render() {
    const cfg = getConfig(this.config);
    const slides: Slide[] = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({
        image: String(item.image || "").trim(),
        video: clipUrl(item.video),
        alt: localizedString(item.alt),
        tag: localizedString(item.tag),
        title: localizedString(item.title),
        text: localizedString(item.text),
        button: localizedString(item.button),
        url: String(item.url || "").trim(),
      }))
      .filter((item) => item.title || item.image || item.video);
    const deck = this.deck;
    deck.sync(slides.map((item) => Deck.kindOf(item.video)));
    const slide = slides[deck.index];
    const label = localizedString(cfg.title) || t({ ar: "سلايدر", en: "Slider" });
    const lineClass = deck.kind === "file" ? "" : deck.auto ? "run" : "done";
    const left = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="1.4" /></svg>`;
    const right = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.4" /></svg>`;
    return html`<section id="nq-look" class=${`nq-root nq-sec nq-look ${schemeOf(cfg)} ${deck.paused ? "is-held" : ""}`} style=${`${sectionStyle(cfg)};--ms:${deck.ms}ms`}
        aria-roledescription="carousel" aria-label=${label} @keydown=${deck.key}>
      <div class="nq-wrap">
        ${slide ? html`<div class="nq-look-g">
          <div class="nq-look-copy" aria-live="polite">
            <p class="nq-eyebrow">${localizedString(cfg.kicker) || label} · <b>${arDigits(deck.index + 1)} / ${arDigits(slides.length)}</b></p>
            ${slide.title ? html`<h2>${slide.title}</h2>` : nothing}
            ${slide.text ? html`<p>${slide.text}</p>` : nothing}
            ${slide.button ? renderCta(slide.button, slide.url) : nothing}
            ${slides.length > 1 ? html`<ul class="nq-look-index">${slides.map((item, index) => html`<li><button type="button" aria-current=${index === deck.index ? "true" : "false"} @click=${() => deck.pick(index)}>
              <i>${arDigits(index + 1)}</i><span>${item.title || item.tag}</span>
              <span class="nq-line ${index === deck.index ? lineClass : ""}" ?data-deck-fill=${index === deck.index && deck.kind === "file"} aria-hidden="true"></span>
            </button></li>`)}</ul>` : nothing}
          </div>
          <div>
            <div class="nq-look-media" @pointerdown=${deck.down} @pointerup=${deck.up} @pointercancel=${deck.up}>
              ${this.media(slide, slides.length)}
              ${slide.tag ? html`<div class="nq-look-cap"><span>${slide.tag}</span><small>${arDigits(deck.index + 1)}</small></div>` : nothing}
            </div>
            ${slides.length > 1 ? html`<div class="nq-look-arrows">
              <button type="button" aria-label=${t({ ar: "السابق", en: "Previous" })} @click=${() => deck.go(-1)}>${left}</button>
              <button type="button" aria-label=${t({ ar: "التالي", en: "Next" })} @click=${() => deck.go(1)}>${right}</button>
            </div>` : nothing}
          </div>
        </div>` : emptyCopy()}
      </div>
    </section>`;
  }
}
