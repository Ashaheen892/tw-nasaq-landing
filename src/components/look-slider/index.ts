import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, isRtl, localizedString, t, unwrapValue, watchLocale } from "../../utils/config.js";
import { Deck } from "../../utils/deck.js";
import { renderCta } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles } from "../../utils/styles.js";
import { arDigits, emptyCopy } from "../../utils/ui.js";
import { clipUrl, frameSrc } from "../../utils/video.js";

/**
 * Full-width lookbook. The slide fills the section as its background and the words sit on it.
 * "framed" keeps a tall abaya photo whole: a blurred copy fills the width and the sharp photo
 * stands in an arch at the end side. On phones every slide fills the screen.
 */
const css = `
.nq-look { position: relative; isolation: isolate; overflow: hidden; color: #f7f4ef; background: #0e0d0b; --look-h: min(92svh, 860px); }
.nq-look.is-tall { --look-h: min(78svh, 720px); }
.nq-look.is-medium { --look-h: 560px; }
.nq-look-stage { position: relative; display: grid; grid-template-rows: 1fr auto; min-height: var(--look-h); touch-action: pan-y; }
.nq-look-bg { position: absolute; inset: 0; z-index: -2; }
.nq-look-bg img, .nq-look-bg video, .nq-look-bg iframe, .nq-look-frame img, .nq-look-frame video, .nq-look-frame iframe { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: var(--look-focus, center); border: 0; animation: nq-look-fade 1.1s ease; }
.nq-look-bg iframe, .nq-look-frame iframe { pointer-events: none; transform: scale(1.8); }
.nq-look-bg picture, .nq-look-frame picture { display: contents; }
.nq-look-shade { position: absolute; inset: 0; z-index: -1; pointer-events: none;
  background:
    linear-gradient(to var(--look-to, left), rgb(10 9 7 / var(--look-a, .78)) 0%, rgb(10 9 7 / calc(var(--look-a, .78) * .55)) 42%, rgb(10 9 7 / 0) 78%),
    linear-gradient(to top, rgb(10 9 7 / .72) 0%, rgb(10 9 7 / 0) 46%); }
.nq-look.is-ltr { --look-to: right; }
.nq-look.is-soft { --look-a: .55; }
.nq-look.is-strong { --look-a: .92; }
.nq-look-in { position: relative; display: grid; align-items: end; gap: 40px; width: min(1240px, calc(100% - 40px)); margin-inline: auto; padding-block: clamp(110px, 16vh, 170px) 34px; }
.nq-look-copy { max-width: 620px; }
.nq-look-copy .nq-eyebrow { color: #d8c49c; }
.nq-look-copy .nq-eyebrow b { color: #f7f4ef; font-weight: 400; }
.nq-look-copy h2 { font-family: var(--serif); font-weight: 700; font-size: clamp(2.3rem, 5.6vw, 4.6rem); line-height: 1.1; margin: 0 0 18px; color: #f7f4ef; text-wrap: balance; animation: nq-look-in .9s ease; }
.nq-look-copy > p { color: rgb(247 244 239 / 82%); max-width: 46ch; margin: 0 0 30px; font-size: 1.04rem; line-height: 1.85; animation: nq-look-in 1.1s ease; }
.nq-look-copy .nq-btn { background: #f7f4ef; color: #101014; border-color: #f7f4ef; }
.nq-look-copy .nq-btn:hover { background: transparent; color: #f7f4ef; border-color: #d8c49c; }
.nq-look-frame { display: none; position: relative; overflow: hidden; width: clamp(260px, 27vw, 380px); aspect-ratio: 3 / 4.15; border-radius: 999px 999px 4px 4px; outline: 1px solid rgb(216 196 156 / 70%); outline-offset: 10px; box-shadow: 0 30px 80px rgb(0 0 0 / 45%); }
.nq-look-tag { position: absolute; z-index: 2; inset-inline: 0; bottom: 18px; text-align: center; font-family: var(--serif); font-size: 1.05rem; color: #f7f4ef; text-shadow: 0 1px 12px rgb(0 0 0 / 50%); }
.nq-look-chip { display: inline-flex; align-items: center; gap: 10px; margin-bottom: 18px; padding: 7px 14px; border: 1px solid rgb(216 196 156 / 60%); font-size: .78rem; letter-spacing: .12em; color: #f7f4ef; }
@container (min-width: 900px) {
  .nq-look.is-framed .nq-look-in { grid-template-columns: minmax(0, 1fr) auto; }
  .nq-look.is-framed .nq-look-frame { display: block; margin-block-end: 8px; }
  .nq-look.is-framed .nq-look-bg img, .nq-look.is-framed .nq-look-bg video { filter: blur(26px) saturate(.85) brightness(.75); transform: scale(1.15); }
  .nq-look.is-framed .nq-look-bg iframe { display: none; }
  .nq-look.is-framed .nq-look-copy .nq-look-chip { display: none; }
}
.nq-look-bar { position: relative; display: flex; align-items: center; gap: 22px; width: min(1240px, calc(100% - 40px)); margin-inline: auto; padding-block: 0 30px; }
.nq-look-index { flex: 1; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 14px; list-style: none; margin: 0; padding: 0; }
.nq-look-index button { position: relative; display: grid; gap: 8px; width: 100%; padding: 0 0 12px; border: 0; background: transparent; color: rgb(247 244 239 / 58%); font: inherit; font-size: .84rem; text-align: start; cursor: pointer; transition: color .3s; }
.nq-look-index button i { font-style: normal; color: #d8c49c; letter-spacing: .14em; font-size: .74rem; }
.nq-look-index button span:not(.nq-line) { display: none; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.nq-look-index button[aria-current="true"] { color: #f7f4ef; }
.nq-look-index button::after { content: ""; position: absolute; inset-inline: 0; bottom: 0; height: 1px; background: rgb(247 244 239 / 28%); }
.nq-look-index .nq-line { position: absolute; z-index: 1; inset-inline: 0; bottom: 0; height: 1px; background: #d8c49c; transform: scaleX(0); transform-origin: right; }
.nq-look.is-ltr .nq-look-index .nq-line { transform-origin: left; }
.nq-look-index button[aria-current="true"] .nq-line.run { animation: nq-line var(--ms, 7000ms) linear forwards; }
.nq-look-index button[aria-current="true"] .nq-line.done { transform: scaleX(1); }
.nq-look.is-held .nq-line.run { animation-play-state: paused; }
@container (min-width: 700px) { .nq-look-index button span:not(.nq-line) { display: block; } }
.nq-look-arrows { display: flex; gap: 10px; flex: none; }
.nq-look-arrows button { width: 48px; height: 48px; border-radius: 50%; border: 1px solid rgb(247 244 239 / 55%); background: rgb(14 13 11 / 25%); color: #f7f4ef; cursor: pointer; display: grid; place-items: center; backdrop-filter: blur(6px); transition: border-color .3s, background .3s; }
.nq-look-arrows button:hover { border-color: #d8c49c; background: rgb(14 13 11 / 55%); }
.nq-look-arrows svg { width: 18px; height: 18px; }
.nq-look-sound { position: absolute; z-index: 3; top: 24px; inset-inline-end: 24px; min-height: 2.4rem; padding: 0 16px; border: 1px solid rgb(247 244 239 / 70%); border-radius: 999px; background: rgb(16 16 20 / 45%); color: #f7f4ef; font: inherit; font-size: .8rem; letter-spacing: .08em; cursor: pointer; }
.nq-look :focus-visible { outline: 2px solid #d8c49c; outline-offset: 3px; }
@keyframes nq-line { to { transform: scaleX(1); } }
@keyframes nq-look-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes nq-look-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .nq-look * { animation: none !important; } .nq-look-index .nq-line.run { transform: scaleX(1); } }
`;

type Slide = { image: string; mobile: string; video: string; alt: string; tag: string; title: string; text: string; button: string; url: string };

const pick = (value: unknown, allowed: string[], fallback: string) => {
  const raw = String(unwrapValue(value) || fallback);
  return allowed.includes(raw) ? raw : fallback;
};

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
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  private picture(slide: Slide) {
    if (!slide.image) return nothing;
    const alt = slide.alt || slide.title;
    if (!slide.mobile) return html`<img src=${slide.image} alt=${alt} />`;
    return html`<picture><source media="(max-width: 699px)" srcset=${slide.mobile} /><img src=${slide.image} alt=${alt} /></picture>`;
  }

  private moving(slide: Slide, total: number) {
    const kind = Deck.kindOf(slide.video);
    if (kind === "frame") return html`<iframe src=${frameSrc(slide.video)} title=${slide.alt || slide.title} allow="autoplay; encrypted-media; picture-in-picture" loading="lazy"></iframe>`;
    return html`<video src=${slide.video} poster=${slide.image || nothing} .muted=${!this.deck.sound} autoplay playsinline preload="metadata" ?loop=${total < 2 || this.deck.reduced}
      aria-label=${slide.alt || slide.title} @timeupdate=${this.deck.progress} @ended=${() => this.deck.go(1)} @error=${this.deck.fail}></video>`;
  }

  render() {
    const cfg = getConfig(this.config);
    const slides: Slide[] = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({
        image: String(item.image || "").trim(),
        mobile: String(item.image_mobile || "").trim(),
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
    if (!slide) return html`<section class="nq-root nq-sec"><div class="nq-wrap">${emptyCopy()}</div></section>`;

    const framed = pick(cfg.fit, ["framed", "cover"], "framed") === "framed";
    const height = pick(cfg.height, ["screen", "tall", "medium"], "screen");
    const shade = pick(cfg.shade, ["soft", "medium", "strong"], "medium");
    const focus = pick(cfg.focus, ["top", "center", "bottom"], "top");
    const classes = ["nq-root", "nq-look", framed ? "is-framed" : "", `is-${height}`, `is-${shade}`, isRtl() ? "" : "is-ltr", deck.paused ? "is-held" : ""].filter(Boolean).join(" ");
    const kind = Deck.kindOf(slide.video);
    const lineClass = deck.kind === "file" ? "" : deck.auto ? "run" : "done";
    const prev = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="1.4" /></svg>`;
    const next = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="1.4" /></svg>`;
    const color = String(cfg.bg_color || "").trim();
    // In framed mode the clip plays inside the arch and the background keeps the still photo.
    const bg = kind === "image" || framed ? this.picture(slide) : this.moving(slide, slides.length);
    const frame = framed ? (kind === "image" ? this.picture(slide) : this.moving(slide, slides.length)) : nothing;
    return html`<section id="nq-look" class=${classes} style=${`--ms:${deck.ms}ms;--look-focus:${focus} center;${color ? `background:${color};` : ""}`}
        aria-roledescription="carousel" aria-label=${label} @keydown=${deck.key}>
      <div class="nq-look-stage" @pointerdown=${deck.down} @pointerup=${deck.up} @pointercancel=${deck.up}>
        <div class="nq-look-bg" aria-hidden=${framed ? "true" : "false"}>${bg}</div>
        <div class="nq-look-shade"></div>
        ${kind === "file" ? html`<button type="button" class="nq-look-sound" @click=${() => deck.toggleSound()}>${deck.sound ? t({ ar: "كتم الصوت", en: "Mute" }) : t({ ar: "تشغيل الصوت", en: "Sound on" })}</button>` : nothing}
        <div class="nq-look-in">
          <div class="nq-look-copy" aria-live="polite">
            <p class="nq-eyebrow">${localizedString(cfg.kicker) || label} · <b>${arDigits(deck.index + 1)} / ${arDigits(slides.length)}</b></p>
            ${slide.tag ? html`<span class="nq-look-chip">${slide.tag}</span>` : nothing}
            ${slide.title ? html`<h2>${slide.title}</h2>` : nothing}
            ${slide.text ? html`<p>${slide.text}</p>` : nothing}
            ${slide.button ? renderCta(slide.button, slide.url, "light") : nothing}
          </div>
          ${framed ? html`<div class="nq-look-frame">${frame}${slide.tag ? html`<span class="nq-look-tag">${slide.tag}</span>` : nothing}</div>` : nothing}
        </div>
        ${slides.length > 1 ? html`<div class="nq-look-bar">
          <ul class="nq-look-index">${slides.map((item, index) => html`<li><button type="button" aria-current=${index === deck.index ? "true" : "false"} aria-label=${item.title || item.tag || String(index + 1)} @click=${() => deck.pick(index)}>
            <i>${arDigits(index + 1)}</i><span>${item.title || item.tag}</span>
            <span class="nq-line ${index === deck.index ? lineClass : ""}" ?data-deck-fill=${index === deck.index && deck.kind === "file"} aria-hidden="true"></span>
          </button></li>`)}</ul>
          <div class="nq-look-arrows">
            <button type="button" aria-label=${t({ ar: "السابق", en: "Previous" })} @click=${() => deck.go(-1)}>${isRtl() ? prev : next}</button>
            <button type="button" aria-label=${t({ ar: "التالي", en: "Next" })} @click=${() => deck.go(1)}>${isRtl() ? next : prev}</button>
          </div>
        </div>` : nothing}
      </div>
    </section>`;
  }
}
