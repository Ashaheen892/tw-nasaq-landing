import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.nq-mq { border-block: 1px solid var(--line); background: var(--nq-section-bg, var(--card)); overflow: hidden; padding-block: 16px; }
.nq-mq-track { display: flex; width: max-content; animation: nq-mq 36s linear infinite; }
.nq-mq-set { display: flex; flex: none; align-items: center; }
.nq-mq-set span { font-family: var(--serif); font-size: 1.05rem; color: var(--muted); white-space: nowrap; display: inline-flex; align-items: center; gap: 48px; padding-inline-end: 48px; }
.nq-mq-set span::after { content: "◆"; font-size: .55rem; color: var(--gold); }
.nq-mq:hover .nq-mq-track, .nq-mq:focus-within .nq-mq-track { animation-play-state: paused; }
@keyframes nq-mq { to { transform: translateX(50%); } }
html[dir="ltr"] .nq-mq-track { animation-name: nq-mq-ltr; }
@keyframes nq-mq-ltr { to { transform: translateX(-50%); } }
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
    const times = items.length ? Math.max(2, Math.ceil(12 / items.length)) : 0;
    const unit = times ? Array.from({ length: times }, () => items).flat() : [];
    const row = (hidden: boolean) => html`<div class="nq-mq-set" aria-hidden=${hidden ? "true" : "false"}>${unit.map((item) => html`<span>${item}</span>`)}</div>`;
    return html`<div class=${`nq-root nq-mq ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <div class="nq-mq-track">${row(false)}${row(true)}</div>
    </div>`;
  }
}
