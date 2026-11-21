import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, linkHref, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy, frame } from "../../utils/ui.js";

const css = `
.nq-cuts { background: var(--nq-section-bg, var(--ivory)); }
.nq-lb { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(14px, 2.4vw, 26px); margin-top: 46px; }
.nq-card { position: relative; overflow: hidden; background: var(--card); border: 1px solid var(--line); color: inherit; display: block; }
.nq-card .nq-ph { aspect-ratio: 4/5; transition: transform 1.1s cubic-bezier(.2,.7,.2,1); }
.nq-card:hover .nq-ph { transform: scale(1.05); }
.nq-card-b { padding: 20px 22px 24px; display: flex; justify-content: space-between; align-items: flex-end; gap: 12px; }
.nq-card-b h3 { font-family: var(--serif); font-size: 1.25rem; margin: 0 0 4px; font-weight: 700; }
.nq-card-b p { margin: 0; font-size: .8rem; color: var(--muted); }
.nq-price { font-family: var(--serif); font-size: 1.15rem; white-space: nowrap; }
.nq-price s { display: block; font-size: .76rem; color: var(--muted); font-family: var(--sans); font-weight: 300; }
.nq-tagline { position: absolute; top: 14px; inset-inline-start: 14px; z-index: 4; background: var(--ivory); padding: 5px 12px; font-size: .68rem; letter-spacing: .16em; }
@container (max-width: 900px) { .nq-lb { grid-template-columns: repeat(2, 1fr); } }
@container (max-width: 600px) { .nq-lb { grid-template-columns: 1fr; } }
`;

export default class CutGrid extends LitElement {
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
    injectStyles("nq-cut-grid", css);
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
    const cards = getCollectionItems<Record<string, any>>(cfg.cards, "cards")
      .map((item) => ({
        tag: localizedString(item.tag),
        image: String(item.image || ""),
        caption: localizedString(item.caption),
        title: localizedString(item.title),
        note: localizedString(item.note),
        price: localizedString(item.price),
        compare: localizedString(item.compare),
        url: linkHref(item.url),
      }))
      .filter((item) => item.title);
    const id = String(cfg.anchor || "lookbook");
    return html`<section class=${`nq-root nq-sec nq-cuts ${schemeOf(cfg)}`} id=${id} style=${sectionStyle(cfg)} aria-label=${title || "lookbook"}>
      <div class="nq-wrap">
        <div class="nq-rev">
          ${localizedString(cfg.kicker) ? html`<p class="nq-eyebrow">${localizedString(cfg.kicker)}</p>` : nothing}
          ${title ? html`<h2 class="nq-h2">${title}</h2>` : nothing}
          ${localizedString(cfg.text) ? html`<p class="nq-lead">${localizedString(cfg.text)}</p>` : nothing}
        </div>
        ${cards.length ? html`<div class="nq-lb">${cards.map((card) => {
          const body = html`
            ${card.tag ? html`<span class="nq-tagline">${card.tag}</span>` : nothing}
            ${frame(card.image, card.caption)}
            <div class="nq-card-b">
              <div><h3>${card.title}</h3>${card.note ? html`<p>${card.note}</p>` : nothing}</div>
              ${card.price ? html`<div class="nq-price">${card.price}${card.compare ? html`<s>${card.compare}</s>` : nothing}</div>` : nothing}
            </div>`;
          return card.url
            ? html`<a class="nq-card nq-rev" href=${card.url}>${body}</a>`
            : html`<article class="nq-card nq-rev">${body}</article>`;
        })}</div>` : emptyCopy()}
      </div>
    </section>`;
  }
}
