import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";
import { clipUrl, frameSrc, isFileClip, setFrameSound } from "../../utils/video.js";

const css = `
.nq-mirror { background: var(--nq-section-bg, var(--ivory)); }
.nq-stage { display: grid; grid-template-columns: minmax(220px, 300px) minmax(0, 1fr); gap: clamp(22px, 4vw, 56px); align-items: start; margin-top: 34px; }
.nq-col { display: grid; gap: 14px; justify-items: start; }
.nq-glass { position: relative; width: 100%; aspect-ratio: 9 / 16; background: #14130f; color: #f7f4ef; overflow: hidden; }
.nq-glass::before { content: ""; position: absolute; inset: 12px; border: 1px solid rgba(247,244,239,.45); z-index: 2; pointer-events: none; }
.nq-glass video, .nq-glass iframe, .nq-glass img.nq-poster { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; background: #14130f; }
.nq-glass .nq-play { position: absolute; inset: 0; z-index: 3; display: grid; place-items: center; border: 0; background: linear-gradient(180deg, transparent 30%, rgba(16,16,20,.42)); color: #f7f4ef; cursor: pointer; }
.nq-glass .nq-play span { width: 64px; height: 64px; border: 1px solid rgba(247,244,239,.8); border-radius: 50%; display: grid; place-items: center; background: rgba(16,16,20,.35); }
.nq-glass .nq-play svg { width: 18px; height: 18px; margin-inline-start: 2px; }
.nq-still { position: absolute; inset: 0; z-index: 1; display: grid; align-content: end; padding: 28px 22px; background: linear-gradient(180deg, #14130f 0%, #2a241c 100%); }
.nq-still p { margin: 0; font-family: var(--serif); font-weight: 700; font-size: 1.35rem; line-height: 1.45; color: #f7f4ef; }
.nq-sound { position: absolute; z-index: 4; top: 22px; inset-inline-end: 22px; min-height: 34px; padding: 4px 12px; border: 1px solid rgba(247,244,239,.45); background: rgba(16,16,20,.55); color: #f7f4ef; font-family: inherit; font-size: .72rem; letter-spacing: .14em; cursor: pointer; }
.nq-words { display: grid; align-content: start; gap: 16px; padding-top: 8px; min-width: 0; }
.nq-words .nq-quote { font-family: var(--serif); font-weight: 700; font-size: clamp(1.6rem, 3vw, 2.4rem); line-height: 1.45; margin: 0; }
.nq-words .nq-who { margin: 0; color: var(--muted); letter-spacing: .08em; }
.nq-strip { display: flex; gap: 8px; width: 100%; }
.nq-sprocket { flex: 1 1 0; min-width: 0; height: 72px; padding: 8px; border: 1px solid var(--line); background: var(--card); color: var(--ink); cursor: pointer; position: relative; overflow: hidden; font-family: var(--serif); font-size: .95rem; text-align: start; }
.nq-sprocket img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.nq-sprocket b { position: relative; z-index: 1; display: block; font-weight: 700; }
.nq-sprocket.is-on { border-color: var(--ink); }
.nq-sprocket.is-on::after { content: ""; position: absolute; inset: 3px; border: 1px solid var(--gold); pointer-events: none; }
.nq-mirror .nq-actions { margin-top: 4px; }
@container (max-width: 800px) {
  .nq-stage { grid-template-columns: 1fr; }
  .nq-col, .nq-glass { max-width: 320px; }
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
    return html`<section class=${`nq-root nq-sec nq-mirror ${schemeOf(cfg)}`} id=${id} style=${sectionStyle(cfg)} aria-label=${title || "reels"}>
      <div class="nq-wrap">
        <div class="nq-rev">
          ${localizedString(cfg.kicker) ? html`<p class="nq-eyebrow">${localizedString(cfg.kicker)}</p>` : nothing}
          ${title ? html`<h2 class="nq-h2">${title}</h2>` : nothing}
          ${localizedString(cfg.text) ? html`<p class="nq-lead">${localizedString(cfg.text)}</p>` : nothing}
        </div>
        ${item ? html`<div class="nq-stage">
          <div class="nq-col">
            <div class="nq-glass">
              ${file
                ? html`<video class="nq-reel" src=${item.source} poster=${item.poster || nothing} muted playsinline loop preload="auto"></video>`
                : this.playing && item.source
                  ? html`<iframe src=${frameSrc(item.source)} title=${item.name || title || "reel"} allow="autoplay; encrypted-media; picture-in-picture"></iframe>`
                  : item.poster
                    ? html`<img class="nq-poster" src=${item.poster} alt="" />`
                    : html`<div class="nq-still"><p>${item.name || "عباية"}${item.place ? ` · ${item.place}` : ""}</p></div>`}
              ${item.source
                ? this.playing
                  ? html`<button type="button" class="nq-sound" aria-pressed=${this.sound ? "true" : "false"} @click=${() => { this.sound = !this.sound; }}>${this.sound ? t({ ar: "كتم", en: "Mute" }) : t({ ar: "صوت", en: "Sound" })}</button>`
                  : html`<button type="button" class="nq-play" aria-label=${t({ ar: "تشغيل", en: "Play" })} @click=${this.start}><span aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="currentColor" d="M8 5.5v13l11-6.5z" /></svg></span></button>`
                : nothing}
            </div>
            ${items.length > 1 ? html`<div class="nq-strip" role="tablist">
              ${items.map((clip, index) => html`<button type="button" class=${`nq-sprocket ${index === this.pick ? "is-on" : ""}`} role="tab" aria-selected=${index === this.pick ? "true" : "false"} aria-label=${clip.name || `${index + 1}`} @click=${() => this.choose(index)}>
                ${clip.poster ? html`<img src=${clip.poster} alt="" />` : nothing}
                <b>${clip.name || index + 1}</b>
              </button>`)}
            </div>` : nothing}
          </div>
          <div class="nq-words nq-rev">
            ${item.quote ? html`<p class="nq-quote">${item.quote}</p>` : nothing}
            ${item.name || item.place ? html`<p class="nq-who">${item.name}${item.place ? ` · ${item.place}` : ""}</p>` : nothing}
            <div class="nq-actions">${renderCta(cfg.button_label, String(cfg.button_url || ""))}</div>
          </div>
        </div>` : emptyCopy()}
      </div>
    </section>`;
  }
}
