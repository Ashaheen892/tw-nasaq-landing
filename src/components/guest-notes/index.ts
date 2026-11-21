import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.nq-notes { background: var(--nq-section-bg, var(--ivory)); }
.nq-notes .nq-intro { text-align: center; }
.nq-notes .nq-lead { margin-inline: auto; }
.nq-rv { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(16px, 2.6vw, 28px); margin-top: 46px; }
.nq-q { background: var(--card); border: 1px solid var(--line); padding: clamp(24px, 3vw, 34px); }
.nq-q .mark { font-family: var(--serif); font-size: 3rem; line-height: .6; color: var(--gold); display: block; margin-bottom: 14px; }
.nq-q p { margin: 0 0 20px; font-size: .96rem; }
.nq-who { display: flex; align-items: center; gap: 12px; padding-top: 18px; border-top: 1px solid var(--line); }
.nq-av { width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(140deg, var(--sand), var(--sand-2)); display: grid; place-items: center; font-family: var(--serif); font-weight: 700; }
.nq-who b { display: block; font-size: .9rem; font-weight: 400; }
.nq-who span { font-size: .76rem; color: var(--muted); }
@container (max-width: 900px) { .nq-rv { grid-template-columns: 1fr; } }
`;

export default class GuestNotes extends LitElement {
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
    injectStyles("nq-guest-notes", css);
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
    const notes = getCollectionItems<Record<string, any>>(cfg.notes, "notes")
      .map((item) => ({
        quote: localizedString(item.quote),
        name: localizedString(item.name),
        meta: localizedString(item.meta),
        initial: localizedString(item.initial),
      }))
      .filter((item) => item.quote);
    return html`<section class=${`nq-root nq-sec nq-notes ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "reviews"}>
      <div class="nq-wrap">
        <div class="nq-rev nq-intro">
          ${localizedString(cfg.kicker) ? html`<p class="nq-eyebrow">${localizedString(cfg.kicker)}</p>` : nothing}
          ${title ? html`<h2 class="nq-h2">${title}</h2>` : nothing}
        </div>
        ${notes.length ? html`<div class="nq-rv">${notes.map((note) => html`<article class="nq-q nq-rev">
          <span class="mark">”</span>
          <p>${note.quote}</p>
          <div class="nq-who"><span class="nq-av">${note.initial || note.name.slice(0, 1)}</span><div><b>${note.name}</b>${note.meta ? html`<span>${note.meta}</span>` : nothing}</div></div>
        </article>`)}</div>` : emptyCopy()}
      </div>
    </section>`;
  }
}
