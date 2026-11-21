import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { flag, getCollectionItems, getConfig, linkHref, localizedString, t, unwrapValue, watchLocale } from "../../utils/config.js";
import { announceBar, announceCss } from "../../utils/announce.js";
import { clearDocks, syncDocks, type DockNodes } from "../../utils/dock.js";
import { currentTone, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.nq-foot { background: var(--nq-section-bg, var(--ink)); color: color-mix(in srgb, var(--ivory) 72%, transparent); padding-block: 48px 34px; font-size: .86rem; }
.nq-foot .nq-logo { color: var(--ivory); }
.nq-ft { display: flex; flex-wrap: wrap; gap: 30px 48px; justify-content: space-between; align-items: flex-start; }
.nq-ft h5 { color: var(--ivory); font-family: var(--serif); font-size: 1rem; margin: 0 0 14px; font-weight: 700; }
.nq-ft ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.nq-about { max-width: 30ch; }
.nq-about p { margin: 14px 0 0; }
.nq-pay-size { margin: 16px 0 8px; font-size: .68rem; letter-spacing: .08em; color: color-mix(in srgb, var(--ivory) 62%, transparent); }
.nq-pay { display: flex; gap: 8px; margin-top: 0; flex-wrap: wrap; align-items: center; }
.nq-pay img { width: 32px; height: 32px; object-fit: contain; background: #f7f4ef; border-radius: 8px; }
.nq-pay span { border: 1px solid color-mix(in srgb, var(--ivory) 22%, transparent); padding: 5px 10px; font-size: .68rem; letter-spacing: .08em; }
.nq-social { display: flex; gap: 10px; flex-wrap: wrap; }
.nq-social a { width: 40px; height: 40px; display: grid; place-items: center; border: 1px solid color-mix(in srgb, var(--ivory) 28%, transparent); color: var(--ivory); }
.nq-social a:hover { border-color: var(--gold); color: var(--gold); }
.nq-social svg { width: 18px; height: 18px; display: block; }
.nq-copy { margin-top: 34px; padding-top: 20px; border-top: 1px solid color-mix(in srgb, var(--ivory) 16%, transparent); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; font-size: .78rem; }
.nq-totop, .nq-top { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 8px 18px; border: 1px solid color-mix(in srgb, var(--ivory) 28%, transparent); background: transparent; color: var(--ivory); font-family: var(--sans); font-size: .78rem; letter-spacing: .14em; cursor: pointer; transition: .3s; }
.nq-foot .nq-totop { display: flex; width: fit-content; margin: 28px auto 0; }
.nq-totop:hover, .nq-top:hover { border-color: var(--gold); color: var(--gold); }
.nq-top { position: fixed; z-index: 70; inset-inline-end: 18px; bottom: 22px; background: var(--ink); opacity: 0; pointer-events: none; transform: translateY(10px); }
.nq-top.show { opacity: 1; pointer-events: auto; transform: none; }
.nq-dock { position: fixed; z-index: 80; display: inline-flex; align-items: center; justify-content: center; gap: .4rem; min-width: 3.35rem; min-height: 3.35rem; padding: .35rem .8rem; border-radius: 999px; border: 1px solid #b8945f; background: #101014; color: #f7f4ef; font-family: var(--font-main, inherit); letter-spacing: .06em; cursor: pointer; text-decoration: none; box-shadow: 0 12px 28px rgb(0 0 0 / 28%); }
.nq-dock[hidden] { display: none; }
.nq-dock svg { width: 1.2rem; height: 1.2rem; display: block; }
.nq-dock--wa { width: 3.45rem; height: 3.45rem; padding: 0; }
.nq-logo { font-family: var(--serif); font-weight: 700; font-size: 1.5rem; letter-spacing: .02em; line-height: 1; color: var(--ivory); }
.nq-logo small { display: block; font-family: var(--sans); font-size: .6rem; letter-spacing: .4em; color: var(--gold); font-weight: 400; margin-top: 4px; }
.nq-logo img { height: 42px; width: auto; object-fit: contain; }
`;

function socialIcon(name: string) {
  if (name === "instagram") return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"></rect><circle cx="12" cy="12" r="3.2"></circle><circle cx="17.2" cy="6.8" r=".8" fill="currentColor" stroke="none"></circle></svg>`;
  if (name === "snapchat") return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 4c2.4 0 4 1.8 4 4.2 0 1.2-.2 2 .4 2.6.3.3.8.4 1.1.6.4.3.3 1-.2 1.2-.8.3-1.3.2-1.7.6-.3.3-.4.8-.2 1.4.2.5-.2.9-.8.9-.7 0-1.1.4-1.6.7-.4.2-.7.2-1 .2s-.6 0-1-.2c-.5-.3-.9-.7-1.6-.7-.6 0-1-.4-.8-.9.2-.6.1-1.1-.2-1.4-.4-.4-.9-.3-1.7-.6-.5-.2-.6-.9-.2-1.2.3-.2.8-.3 1.1-.6.6-.6.4-1.4.4-2.6C8 5.8 9.6 4 12 4Z"></path></svg>`;
  if (name === "tiktok") return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 6c.6 2.2 2 3.6 4 4v2.2c-1.4 0-2.7-.4-4-1.2v5.2a5.2 5.2 0 1 1-5.2-5.2c.3 0 .6 0 .8.1v2.3a2.9 2.9 0 1 0 2 2.8V6H14Z"></path></svg>`;
  if (name === "whatsapp") return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.2A7.8 7.8 0 0 0 5.3 16l-.7 3.2 3.3-.7A7.8 7.8 0 1 0 12 4.2Zm3.7 10.3c-.2.5-1 .9-1.4 1-.4.1-.8.1-1.3-.1-.3-.1-.7-.2-1.2-.5-2.1-1.1-3.4-3.2-3.5-3.4-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .3 0 .5.4.2.5.6 1.6.7 1.7.1.2 0 .3-.1.5l-.3.4c-.1.1-.2.2 0 .4.2.3.7 1 1.5 1.6.6.5 1.1.6 1.3.5l.4-.3c.2-.1.3-.1.5 0 .2.2 1 .8 1.1 1 .1.1.1.3 0 .5Z"></path></svg>`;
  if (name === "youtube") return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.5" y="7" width="17" height="11" rx="2.5"></rect><path d="m11 10 4 2.2-4 2.2V10Z" fill="currentColor" stroke="none"></path></svg>`;
  if (name === "x") return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>`;
  return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="7"></circle></svg>`;
}

export default class PageFooter extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private storeName = "";
  @state() private dark = false;
  @state() private raised = false;
  @state() private atFooter = false;
  private stop = () => {};
  private floater: HTMLButtonElement | null = null;
  private docks: DockNodes = { wa: null, top: null };
  private seen?: IntersectionObserver;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("nq-host");
    injectFonts();
    injectStyles("nq-base", baseCss);
    injectStyles("nq-announce", announceCss("nq"));
    injectStyles("nq-page-footer", css);
    const stopLocale = watchLocale(this);
    const onTone = () => { this.dark = currentTone() === "dark"; };
    window.addEventListener("nq-tone", onTone);
    this.dark = currentTone() === "dark";
    this.stop = () => {
      stopLocale();
      window.removeEventListener("nq-tone", onTone);
    };
    document.addEventListener("scroll", this.onScroll, { capture: true, passive: true });
    const api = (window as any).Salla;
    const read = () => {
      this.storeName = api?.config?.get("store.name") || "";
    };
    read();
    api?.onReady?.().then(read);
    this.onScroll();
  }

  disconnectedCallback() {
    this.stop();
    document.removeEventListener("scroll", this.onScroll, { capture: true });
    this.seen?.disconnect();
    this.floater?.remove();
    this.floater = null;
    clearDocks(this.docks);
    super.disconnectedCallback();
  }

  protected updated() {
    this.floater?.remove();
    this.floater = null;
    this.docks = syncDocks(getConfig(this.config), "nq", this.docks, this.toTop, { hideTop: this.atFooter, topText: true });
    const button = this.querySelector(".nq-totop");
    this.seen?.disconnect();
    if (!button) {
      this.atFooter = false;
      return;
    }
    this.seen = new IntersectionObserver(([entry]) => {
      this.atFooter = entry.isIntersecting;
    }, { threshold: 0.5 });
    this.seen.observe(button);
  }

  private shown(value: unknown): boolean {
    if (value == null || value === "") return true;
    return flag(value);
  }

  private onScroll = (event?: Event) => {
    const target = event?.target;
    const nested = target instanceof Element ? target.scrollTop : 0;
    const top = Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0, nested);
    const next = top > 360;
    if (next !== this.raised) this.raised = next;
  };

  private toTop = (event: Event) => {
    event.preventDefault();
    const docs = [document];
    try {
      if (window.parent && window.parent !== window) docs.push(window.parent.document);
    } catch { /* the parent page is a different site */ }
    const nodes = new Set<Element>();
    docs.forEach((doc) => {
      nodes.add(doc.documentElement);
      if (doc.body) nodes.add(doc.body);
      if (doc.scrollingElement) nodes.add(doc.scrollingElement);
      doc.querySelectorAll("*").forEach((el) => {
        if (el.scrollTop > 0) nodes.add(el);
      });
    });
    let node: Element | null = this;
    while (node) {
      nodes.add(node);
      node = node.parentElement;
    }
    nodes.forEach((el) => {
      try { el.scrollTo({ top: 0, behavior: "smooth" }); } catch { el.scrollTop = 0; }
    });
  };

  private syncFloater() {
    const cfg = getConfig(this.config);
    const show = this.shown(cfg.show_top) && this.raised && !this.atFooter;
    if (!show) {
      this.floater?.classList.remove("show");
      return;
    }
    if (!this.floater) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "nq-top";
      button.addEventListener("click", this.toTop);
      document.body.appendChild(button);
      this.floater = button;
    }
    const label = localizedString(cfg.top_label) || t({ ar: "العودة للأعلى", en: "Back to top" });
    this.floater.setAttribute("aria-label", label);
    this.floater.replaceChildren();
    const text = document.createElement("span");
    text.textContent = label;
    const mark = document.createElement("span");
    mark.setAttribute("aria-hidden", "true");
    mark.textContent = "↑";
    this.floater.append(text, mark);
    this.floater.classList.add("show");
  }

  render() {
    const cfg = getConfig(this.config);
    const brand = localizedString(cfg.brand) || this.storeName || t({ ar: "المتجر", en: "Store" });
    const showTop = this.shown(cfg.show_top);
    const topLabel = localizedString(cfg.top_label) || t({ ar: "العودة للأعلى", en: "Back to top" });
    const mark = localizedString(cfg.mark);
    const columns = [1, 2].map((index) => ({
      title: localizedString(cfg[`col${index}_title`]),
      links: getCollectionItems<Record<string, any>>(cfg[`col${index}`], `col${index}`)
        .map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" }))
        .filter((item) => item.label),
    })).filter((column) => column.title || column.links.length);
    const socialTitle = localizedString(cfg.col3_title);
    const socials = getCollectionItems<Record<string, any>>(cfg.social, "social")
      .map((item) => ({
        network: String(unwrapValue(item.network) || "instagram"),
        url: linkHref(item.url) || "#",
        label: ({
          instagram: t({ ar: "إنستغرام", en: "Instagram" }),
          snapchat: t({ ar: "سناب شات", en: "Snapchat" }),
          tiktok: t({ ar: "تيك توك", en: "TikTok" }),
          whatsapp: t({ ar: "واتساب", en: "WhatsApp" }),
          x: t({ ar: "إكس", en: "X" }),
          youtube: t({ ar: "يوتيوب", en: "YouTube" }),
        } as Record<string, string>)[String(unwrapValue(item.network) || "instagram")] || t({ ar: "تواصل", en: "Social" }),
      }))
      .filter((item) => item.url);
    const pays = getCollectionItems<Record<string, any>>(cfg.payments, "payments")
      .map((item) => ({ image: String(item.image || ""), label: localizedString(item.label) }))
      .filter((item) => item.image || item.label);
    const logo = (this.dark && cfg.logo_dark) || cfg.logo;
    return html`${announceBar(cfg, "nq", `nq-root ${schemeOf(cfg)}`, "--ann-bg:var(--ink);--ann-ink:var(--ivory)")}
    <footer class=${`nq-root nq-foot ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <div class="nq-wrap">
        <div class="nq-ft">
          <div class="nq-about">
            <a href="#" class="nq-logo">${logo ? html`<img src=${logo} alt=${brand} />` : html`${brand}${mark ? html`<small>${mark}</small>` : nothing}`}</a>
            ${localizedString(cfg.about) ? html`<p>${localizedString(cfg.about)}</p>` : nothing}
            ${pays.length ? html`<p class="nq-pay-size">${t({ ar: "أيقونات الدفع ٦٤×٦٤ بكسل", en: "Payment icons, 64×64 px" })}</p><div class="nq-pay">${pays.map((pay) => pay.image
              ? html`<img src=${pay.image} alt=${pay.label} width="32" height="32" title=${pay.label} />`
              : html`<span>${pay.label}</span>`)}</div>` : nothing}
          </div>
          ${columns.map((column) => html`<div>
            ${column.title ? html`<h5>${column.title}</h5>` : nothing}
            <ul>${column.links.map((link) => html`<li><a href=${link.url}>${link.label}</a></li>`)}</ul>
          </div>`)}
          ${socialTitle || socials.length ? html`<div>
            ${socialTitle ? html`<h5>${socialTitle}</h5>` : nothing}
            <div class="nq-social">${socials.map((item) => html`<a href=${item.url} aria-label=${item.label} target="_blank" rel="noopener noreferrer">${socialIcon(item.network)}</a>`)}</div>
          </div>` : nothing}
        </div>
        ${showTop ? html`<button type="button" class="nq-totop" @click=${this.toTop}>${topLabel} <span aria-hidden="true">↑</span></button>` : nothing}
        <div class="nq-copy">
          <span>${localizedString(cfg.copyright)}</span>
          <span>${localizedString(cfg.legal)}</span>
        </div>
      </div>
    </footer>`;
  }
}
