import { html, nothing } from "lit";
import { isRtl, localizedString, unwrapValue } from "./config.js";

const COPIES = 12;

/** Full-width announcement bar. Empty merchant colors fall through to the store primary. */
export function announceCss(prefix: string): string {
  return `
.${prefix}-ann.${prefix}-ann {
  overflow: hidden;
  padding-block: 5px;
  border: 0;
  font-family: var(--font-main, inherit);
  background: var(--ann-bg-light, var(--ann-bg, var(--color-primary)));
  color: var(--ann-ink-light, var(--ann-ink, var(--color-primary-reverse, #fff)));
}
html.${prefix}-mode-dark .${prefix}-ann.${prefix}-auto, .${prefix}-ann.${prefix}-dark {
  background: var(--ann-bg-dark, var(--ann-bg-light, var(--ann-bg, var(--color-primary))));
  color: var(--ann-ink-dark, var(--ann-ink-light, var(--ann-ink, var(--color-primary-reverse, #fff))));
}
.${prefix}-ann__still {
  padding: 5px 1.5rem;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  line-height: 26px;
}
.${prefix}-ann__list {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 5px 0;
  list-style: none;
  white-space: nowrap;
}
.${prefix}-ann__item {
  flex: none;
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
  line-height: 26px;
  animation: ${prefix}-ann-ltr var(--ann-speed, 18s) linear infinite;
}
.${prefix}-ann.is-rtl .${prefix}-ann__item { animation-name: ${prefix}-ann-rtl; }
.${prefix}-ann__list:hover .${prefix}-ann__item { animation-play-state: paused; }
.${prefix}-ann__text {
  display: inline-flex;
  align-items: center;
  gap: 1.5rem;
  padding-inline: 1.5rem;
}
.${prefix}-ann__text::after {
  content: "";
  width: .35rem;
  height: .35rem;
  border-radius: 50%;
  background: currentColor;
  opacity: .55;
  flex: none;
}
@keyframes ${prefix}-ann-ltr { to { transform: translateX(-100%); } }
@keyframes ${prefix}-ann-rtl { to { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) {
  .${prefix}-ann__item { animation: none; }
  .${prefix}-ann__item[aria-hidden="true"] { display: none; }
  .${prefix}-ann__list { justify-content: center; }
  .${prefix}-ann__text::after { display: none; }
}
`;
}

export function announceTone(cfg: Record<string, any>): string {
  const paint = (key: string, variable: string) => {
    const value = String(cfg[key] || "").trim();
    return value ? `${variable}:${value}` : "";
  };
  return [
    paint("announce_bg", "--ann-bg-light"),
    paint("announce_ink", "--ann-ink-light"),
    paint("announce_bg_dark", "--ann-bg-dark"),
    paint("announce_ink_dark", "--ann-ink-dark"),
  ].filter(Boolean).join(";");
}

export function announceBar(cfg: Record<string, any>, prefix: string, extraClass = "", tone = "") {
  const text = localizedString(cfg.announce).trim();
  if (!text) return nothing;
  const moving = String(unwrapValue(cfg.announce_mode) || "move") !== "still";
  if (!moving) {
    return html`<div class="${prefix}-ann ${prefix}-ann__still ${extraClass}" style=${tone}>${text}</div>`;
  }
  const rtl = isRtl() ? " is-rtl" : "";
  return html`<div class="${prefix}-ann${rtl} ${extraClass}" style=${tone}>
    <ul class="${prefix}-ann__list">
      ${Array.from({ length: COPIES }, (_, index) => html`<li class="${prefix}-ann__item" aria-hidden=${index ? "true" : "false"}><span class="${prefix}-ann__text">${text}</span></li>`)}
    </ul>
  </div>`;
}
