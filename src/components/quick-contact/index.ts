import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.nq-quick { display: grid; border: 1px solid var(--line); }
@container (min-width: 760px) { .nq-quick { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.nq-quick a { display: block; padding: 28px 22px; color: inherit; text-decoration: none; border-block-end: 1px solid var(--line); }
@container (min-width: 760px) {
  .nq-quick a { border-block-end: 0; border-inline-start: 1px solid var(--line); }
  .nq-quick a:first-child { border-inline-start: 0; }
}
.nq-quick small { display: block; color: var(--gold); letter-spacing: .16em; font-size: .72rem; }
.nq-quick b { display: block; margin-top: 10px; font-size: 1.25rem; font-weight: 700; }
.nq-quick a.nq-rev { transition-delay: calc(var(--i, 0) * 90ms); }
`;

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
      phone ? { kicker: localizedString(cfg.phone_label) || t({ ar: "اتصال", en: "Call" }), value: localizedString(cfg.phone_text) || phone, href: `tel:+${phone}` } : null,
      wa ? { kicker: localizedString(cfg.whatsapp_label) || t({ ar: "واتساب", en: "WhatsApp" }), value: localizedString(cfg.whatsapp_text) || t({ ar: "اكتبي للمقاس", en: "Ask about the size" }), href: `https://wa.me/${wa}${message ? `?text=${encodeURIComponent(message)}` : ""}` } : null,
      email.includes("@") ? { kicker: localizedString(cfg.email_label) || t({ ar: "البريد", en: "Email" }), value: email, href: `mailto:${email}` } : null,
    ].filter((item) => item) as { kicker: string; value: string; href: string }[];
    return html`<section id="nq-contact" class=${`nq-root nq-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "contact"}>
      <div class="nq-wrap">
        ${localizedString(cfg.title) ? html`<h2 class="nq-h2">${localizedString(cfg.title)}</h2>` : ""}
        ${localizedString(cfg.text) ? html`<p style="margin:0 0 18px;color:var(--muted);max-width:46ch">${localizedString(cfg.text)}</p>` : ""}
        ${actions.length ? html`<div class="nq-quick">${actions.map((item, index) => html`<a class="nq-rev" style=${`--i:${index}`} href=${item.href}><small>${item.kicker}</small><b>${item.value}</b></a>`)}</div>` : emptyCopy()}
      </div>
    </section>`;
  }
}
