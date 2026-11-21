import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { arDigits } from "../../utils/ui.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";
import { clipUrl, frameSrc, isFileClip, setFrameSound } from "../../utils/video.js";

const css = `
.nq-mirror { background: var(--nq-section-bg, var(--ivory)); }
.nq-mirror-head { display: flex; justify-content: space-between; align-items: end; gap: 28px; }
.nq-mirror-head .nq-lead { max-width: 36ch; margin: 0; }
.nq-board { margin-top: 28px; display: grid; grid-template-columns: minmax(240px, 340px) minmax(0, 1fr); gap: 8px; padding: 12px; background: #14130f; color: #f7f4ef; border: 1px solid color-mix(in srgb, var(--gold) 42%, transparent); }
.nq-phone { position: relative; aspect-ratio: 9 / 16; background: #0e0d0b; overflow: hidden; border-radius: 18px; }
.nq-live { position: absolute; z-index: 4; inset-inline: 16px; bottom: 16px; display: flex; justify-content: space-between; align-items: end; gap: 12px; pointer-events: none; text-shadow: 0 1px 10px rgba(0,0,0,.65); }
.nq-live b { font-family: var(--serif); font-size: 1.2rem; font-weight: 700; }
.nq-live span { font-size: .72rem; letter-spacing: .14em; color: #e7d3a1; }
.nq-phone video, .nq-phone iframe, .nq-phone img.nq-poster { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; background: #0e0d0b; }
.nq-phone::after { content: ""; position: absolute; inset: 14px; border: 1px solid rgba(247,244,239,.35); pointer-events: none; z-index: 2; }
.nq-still { position: absolute; inset: 0; display: grid; align-content: end; padding: 28px 22px; background: linear-gradient(180deg, #14130f, #2a241c); }
.nq-still p { margin: 0; font-family: var(--serif); font-size: 1.4rem; font-weight: 700; }
.nq-play { position: absolute; inset: 0; z-index: 3; display: grid; place-items: center; border: 0; background: linear-gradient(180deg, transparent 20%, rgba(16,16,20,.55)); color: #f7f4ef; cursor: pointer; }
.nq-play span { width: 68px; height: 68px; border: 1px solid rgba(247,244,239,.85); border-radius: 50%; display: grid; place-items: center; background: rgba(16,16,20,.4); }
.nq-play svg { width: 18px; height: 18px; margin-inline-start: 2px; }
.nq-sound { position: absolute; z-index: 4; top: 22px; inset-inline-end: 22px; min-height: 34px; padding: 4px 12px; border: 1px solid rgba(247,244,239,.45); background: rgba(16,16,20,.55); color: #f7f4ef; font-family: inherit; font-size: .72rem; letter-spacing: .14em; cursor: pointer; }
.nq-side { display: grid; align-content: space-between; gap: 22px; padding: clamp(22px, 3vw, 42px); min-width: 0; }
.nq-index { margin: 0; letter-spacing: .22em; color: var(--gold-soft); font-size: .72rem; }
.nq-side .nq-quote { margin: 0; font-family: var(--serif); font-weight: 700; font-size: clamp(1.35rem, 2.4vw, 2rem); line-height: 1.5; }
.nq-side .nq-who { margin: 12px 0 0; letter-spacing: .08em; color: rgba(247,244,239,.72); }
.nq-film { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; }
.nq-side .nq-actions { margin-top: 18px; }
.nq-thumb { display: grid; grid-template-rows: 1fr auto; padding: 0; border: 1px solid rgba(247,244,239,.28); background: #1c1a16; color: #f7f4ef; cursor: pointer; overflow: hidden; text-align: start; }
.nq-thumb img { width: 100%; aspect-ratio: 3 / 4; object-fit: cover; display: block; }
.nq-thumb b { padding: 8px 10px 10px; background: #1c1a16; font-family: var(--serif); font-size: .82rem; font-weight: 700; }
.nq-thumb.is-on { border-color: var(--gold); }
@container (max-width: 860px) {
  .nq-mirror-head, .nq-board { display: grid; grid-template-columns: 1fr; }
  .nq-phone { max-width: 360px; }
}
`;

type Clip = { source: string; poster: string; name: string; place: string; quote: string };

export default class MirrorReels extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private pick = 0;
  @state() private playing = false;
  @state() private sound = false;
  private stop = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("nq-host");
    injectFonts();
    injectStyles("nq-base", baseCss);
    injectStyles("nq-mirror-reels", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    this.stop = () => { stopLocale(); stopReveal(); };
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  protected updated() {
    this.sync();
  }

  /** Play inside the click, while the video is already on the page. */
  private start = () => {
    this.playing = true;
    const video = this.querySelector(".nq-reel");
    if (video instanceof HTMLVideoElement) {
      video.muted = !this.sound;
      void video.play().catch(() => undefined);
    }
  };

  private sync() {
    const video = this.querySelector(".nq-reel");
    if (video instanceof HTMLVideoElement) {
      video.muted = !this.sound;
      video.volume = this.sound ? 1 : 0;
      if (this.playing && video.paused) void video.play().catch(() => undefined);
      if (!this.playing && !video.paused) video.pause();
    }
    const frame = this.querySelector("iframe");
    if (frame instanceof HTMLIFrameElement && this.playing) {
      const send = () => setFrameSound(frame, this.sound);
      frame.addEventListener("load", send, { once: true });
      window.setTimeout(send, 600);
    }
  }

  private clips(): Clip[] {
    return getCollectionItems<Record<string, any>>(getConfig(this.config).clips, "clips")
      .map((item) => ({
        source: clipUrl(item.video_url),
        poster: String(item.poster || ""),
        name: localizedString(item.name),
        place: localizedString(item.place),
        quote: localizedString(item.quote),
      }))
      .filter((item) => item.source || item.poster || item.quote || item.name);
  }

  private choose(index: number) {
    this.pick = index;
    this.sound = false;
    this.playing = true;
  }

  render() {
    const cfg = getConfig(this.config);
    const items = this.clips();
    const item = items[this.pick] || items[0];
    const title = localizedString(cfg.title);
    const file = item ? isFileClip(item.source) : false;
    const id = String(cfg.anchor || "reels").replace(/^#/, "");
    const indexLabel = `${arDigits(this.pick + 1)} / ${arDigits(items.length)}`;
    return html`<section class=${`nq-root nq-sec nq-mirror ${schemeOf(cfg)}`} id=${id} style=${sectionStyle(cfg)} aria-label=${title || "reels"}>
      <div class="nq-wrap">
        <div class="nq-mirror-head nq-rev">
          <div>
            ${localizedString(cfg.kicker) ? html`<p class="nq-eyebrow">${localizedString(cfg.kicker)}</p>` : nothing}
            ${title ? html`<h2 class="nq-h2">${title}</h2>` : nothing}
          </div>
          ${localizedString(cfg.text) ? html`<p class="nq-lead">${localizedString(cfg.text)}</p>` : nothing}
        </div>
        ${item ? html`<div class="nq-board">
          <div class="nq-phone">
            ${file
              ? html`<video class="nq-reel" src=${item.source} poster=${item.poster || nothing} muted playsinline loop preload="auto"></video>`
              : this.playing && item.source
                ? html`<iframe src=${frameSrc(item.source)} title=${item.name || title || "reel"} allow="autoplay; encrypted-media; picture-in-picture"></iframe>`
                : item.poster
                  ? html`<img class="nq-poster" src=${item.poster} alt=${item.name || ""} />`
                  : html`<div class="nq-still"><p>${item.name || "عباية"}${item.place ? ` · ${item.place}` : ""}</p></div>`}
            ${item.source
              ? this.playing
                ? html`<button type="button" class="nq-sound" aria-pressed=${this.sound ? "true" : "false"} @click=${() => { this.sound = !this.sound; }}>${this.sound ? t({ ar: "كتم", en: "Mute" }) : t({ ar: "صوت", en: "Sound" })}</button>`
                : html`<button type="button" class="nq-play" aria-label=${t({ ar: "تشغيل", en: "Play" })} @click=${this.start}><span aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5.5v13l11-6.5z" /></svg></span></button>`
              : nothing}
            ${item.name || item.place ? html`<p class="nq-live"><b>${item.name}</b><span>${item.place}</span></p>` : nothing}
          </div>
          <div class="nq-side">
            <div>
              <p class="nq-index">${indexLabel}</p>
              ${item.quote ? html`<p class="nq-quote">${item.quote}</p>` : nothing}
              ${item.name || item.place ? html`<p class="nq-who">${item.name}${item.place ? ` · ${item.place}` : ""}</p>` : nothing}
            </div>
            <div>
              ${items.length > 1 ? html`<div class="nq-film" role="tablist">
                ${items.map((clip, index) => html`<button type="button" class=${`nq-thumb ${index === this.pick ? "is-on" : ""}`} role="tab" aria-selected=${index === this.pick ? "true" : "false"} aria-label=${clip.name || `${index + 1}`} @click=${() => this.choose(index)}>
                  ${clip.poster ? html`<img src=${clip.poster} alt="" />` : nothing}
                  <b>${clip.name || index + 1}</b>
                </button>`)}
              </div>` : nothing}
              <div class="nq-actions">${renderCta(cfg.button_label, String(cfg.button_url || ""), "light")}</div>
            </div>
          </div>
        </div>` : emptyCopy()}
      </div>
    </section>`;
  }
}
