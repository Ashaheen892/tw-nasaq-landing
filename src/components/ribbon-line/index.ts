import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.nq-mq { border-block: 1px solid var(--line); background: var(--nq-section-bg, #fff); overflow: hidden; padding-block: 16px; }
.nq-mq-track { display: flex; gap: 60px; width: max-content; animation: nq-mq 30s linear infinite; }
.nq-mq-track span { font-family: var(--serif); font-size: 1.05rem; color: var(--muted); white-space: nowrap; display: flex; align-items: center; gap: 60px; }
.nq-mq-track span::after { content: "◆"; font-size: .55rem; color: var(--gold); }
@keyframes nq-mq { to { transform: translateX(50%); } }
`;

export default class RibbonLine extends LitElement {
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
    injectStyles("nq-ribbon-line", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const items = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => localizedString(item.text))
      .filter(Boolean);
    const loop = [...items, ...items];
    return html`<div class="nq-root nq-mq" style=${sectionStyle(cfg)} aria-hidden="true">
      <div class="nq-mq-track">${loop.map((item) => html`<span>${item}</span>`)}</div>
    </div>`;
  }
}
