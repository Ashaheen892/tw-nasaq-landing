import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.nq-invite { position: relative; max-width: 860px; margin-inline: auto; padding: clamp(34px, 6vw, 64px) clamp(20px, 5vw, 56px); text-align: center; background: var(--card); border: 1px solid var(--gold); outline: 1px solid var(--gold-soft); outline-offset: -10px; }
.nq-invite .nq-h2 { margin-bottom: 10px; }
.nq-invite > p { margin: 0 auto 26px; color: var(--muted); max-width: 46ch; }
.nq-quick { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
.nq-quick a { display: inline-grid; justify-items: center; gap: 2px; min-width: 11rem; min-height: 3.4rem; padding: 10px 22px; border: 1px solid var(--gold); border-radius: 999px; color: inherit; text-decoration: none; transition: background .25s ease, color .25s ease; }
.nq-quick a:hover { background: var(--ink); color: var(--ivory); border-color: var(--ink); }
.nq-quick small { color: var(--gold); letter-spacing: .16em; font-size: .68rem; }
.nq-quick a:hover small { color: var(--gold-soft); }
.nq-quick b { font-size: 1rem; font-weight: 700; overflow-wrap: anywhere; }
.nq-quick a.nq-rev { transition-delay: calc(var(--i, 0) * 90ms); }
`;

function telHref(value: unknown): string {
  const raw = (typeof value === "string" ? value : localizedString(value)).trim();
  const num = raw.replace(/\D/g, "");
  if (!num) return "";
  if (raw.startsWith("+")) return `tel:+${num}`;
  if (num.startsWith("00")) return `tel:+${num.slice(2)}`;
  return `tel:${num}`;
}

function digits(value: unknown): string {
  const raw = typeof value === "string" ? value : localizedString(value);
  return raw.replace(/\D/g, "");
}

export default class QuickContact extends LitElement {
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
    injectStyles("nq-quick-contact", css);
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
    const phone = digits(cfg.phone);
    const wa = digits(cfg.whatsapp || "201153958512");
    const email = String(cfg.email || "").trim();
    const message = localizedString(cfg.whatsapp_message);
    const actions = [
      phone ? { kicker: localizedString(cfg.phone_label) || t({ ar: "اتصال", en: "Call" }), value: localizedString(cfg.phone_text) || phone, href: telHref(cfg.phone) } : null,
      wa ? { kicker: localizedString(cfg.whatsapp_label) || t({ ar: "واتساب", en: "WhatsApp" }), value: localizedString(cfg.whatsapp_text) || t({ ar: "اكتبي للمقاس", en: "Ask about the size" }), href: `https://wa.me/${wa}${message ? `?text=${encodeURIComponent(message)}` : ""}` } : null,
      email.includes("@") ? { kicker: localizedString(cfg.email_label) || t({ ar: "البريد", en: "Email" }), value: email, href: `mailto:${email}` } : null,
    ].filter((item) => item) as { kicker: string; value: string; href: string }[];
    return html`<section id="nq-contact" class=${`nq-root nq-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "contact"}>
      <div class="nq-wrap">
        <div class="nq-invite nq-rev">
        ${localizedString(cfg.title) ? html`<h2 class="nq-h2">${localizedString(cfg.title)}</h2>` : ""}
        ${localizedString(cfg.text) ? html`<p>${localizedString(cfg.text)}</p>` : ""}
        ${actions.length ? html`<div class="nq-quick">${actions.map((item, index) => html`<a class="nq-rev" style=${`--i:${index}`} href=${item.href}><small>${item.kicker}</small><b>${item.value}</b></a>`)}</div>` : emptyCopy()}
        </div>
      </div>
    </section>`;
  }
}
