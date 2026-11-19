import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.nq-feat { background: var(--nq-section-bg, #fff); border-block: 1px solid var(--line); }
.nq-fg { display: grid; grid-template-columns: repeat(4, 1fr); }
.nq-fi { padding: clamp(28px, 4vw, 46px) clamp(18px, 2.4vw, 32px); border-inline-start: 1px solid var(--line); }
.nq-fi:first-child { border-inline-start: 0; }
.nq-fi i { display: block; font-family: var(--serif); font-size: 1.6rem; color: var(--gold); font-style: normal; margin-bottom: 16px; }
.nq-fi h3 { font-family: var(--serif); font-size: 1.18rem; margin: 0 0 8px; font-weight: 700; }
.nq-fi p { margin: 0; font-size: .88rem; color: var(--muted); }
@container (max-width: 880px) {
  .nq-fg { grid-template-columns: repeat(2, 1fr); }
  .nq-fi:nth-child(odd) { border-inline-start: 0; }
  .nq-fi:nth-child(n+3) { border-top: 1px solid var(--line); }
}
@container (max-width: 520px) {
  .nq-fg { grid-template-columns: 1fr; }
  .nq-fi { border-inline-start: 0 !important; border-top: 1px solid var(--line); }
  .nq-fi:first-child { border-top: 0; }
}
`;

export default class CraftRow extends LitElement {
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
    injectStyles("nq-craft-row", css);
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
    const items = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({
        mark: localizedString(item.mark),
        title: localizedString(item.title),
        text: localizedString(item.text),
      }))
      .filter((item) => item.title);
    const id = String(cfg.anchor || "quality");
    return html`<section class="nq-root nq-feat" id=${id} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "quality"}>
      <div class="nq-wrap">
        ${items.length
          ? html`<div class="nq-fg">${items.map((item) => html`<article class="nq-fi nq-rev">
              ${item.mark ? html`<i>${item.mark}</i>` : nothing}
              <h3>${item.title}</h3>
              ${item.text ? html`<p>${item.text}</p>` : ""}
            </article>`)}</div>`
          : emptyCopy()}
      </div>
    </section>`;
  }
}
