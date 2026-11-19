import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { flag, getCollectionItems, getConfig, linkHref, localizedString, t, watchLocale } from "../../utils/config.js";
import { fetchProduct, landingProductId, money, openCheckout, pickedId, renderCta } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { amountOf, linesOf, silhouette, textOf } from "../../utils/ui.js";

const css = `
.nq-piece { background: var(--nq-section-bg, var(--ivory)); }
.nq-sp-g { display: grid; grid-template-columns: 1fr 1fr; gap: clamp(26px, 5vw, 70px); align-items: center; }
.nq-gal { display: grid; gap: 12px; grid-template-columns: 76px 1fr; }
.nq-thumbs { display: grid; gap: 12px; align-content: start; }
.nq-thumb { aspect-ratio: 3/4; border: 1px solid var(--line); background: linear-gradient(150deg, var(--sand), var(--sand-2)); cursor: pointer; transition: .3s; opacity: .6; padding: 0; position: relative; overflow: hidden; }
.nq-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
.nq-thumb[aria-selected="true"] { opacity: 1; border-color: var(--ink); }
.nq-piece h2 { font-family: var(--serif); font-size: clamp(1.8rem, 3.6vw, 2.7rem); margin: 0 0 10px; font-weight: 700; }
.nq-stars { color: var(--gold); letter-spacing: .2em; font-size: .9rem; }
.nq-stars small { color: var(--muted); letter-spacing: 0; margin-inline-start: 8px; font-family: var(--sans); }
.nq-price-row { display: flex; align-items: baseline; gap: 14px; margin: 22px 0; flex-wrap: wrap; }
.nq-price-row b { font-family: var(--serif); font-size: 2.2rem; font-weight: 700; }
.nq-price-row s { color: var(--muted); }
.nq-off { background: var(--ink); color: var(--ivory); font-size: .72rem; padding: 4px 10px; letter-spacing: .1em; }
.nq-opts { margin: 24px 0; }
.nq-opts h4 { font-size: .78rem; letter-spacing: .16em; color: var(--muted); margin: 0 0 10px; font-weight: 400; }
.nq-sizes, .nq-swatches { display: flex; gap: 8px; flex-wrap: wrap; }
.nq-swatches { gap: 10px; }
.nq-size { min-width: 46px; padding: 10px 12px; text-align: center; border: 1px solid var(--line); background: #fff; font-family: var(--sans); font-size: .86rem; cursor: pointer; transition: .25s; }
.nq-size[aria-pressed="true"] { background: var(--ink); color: var(--ivory); border-color: var(--ink); }
.nq-size[disabled] { opacity: .35; cursor: not-allowed; text-decoration: line-through; }
.nq-sw { width: 34px; height: 34px; border-radius: 50%; border: 1px solid var(--line); cursor: pointer; position: relative; padding: 0; }
.nq-sw[aria-pressed="true"]::after { content: ""; position: absolute; inset: -5px; border: 1px solid var(--ink); border-radius: 50%; }
.nq-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--line); margin-top: 30px; }
.nq-tab { padding: 12px 18px; background: none; border: 0; border-bottom: 1px solid transparent; font-family: var(--sans); font-size: .88rem; color: var(--muted); cursor: pointer; margin-bottom: -1px; }
.nq-tab[aria-selected="true"] { color: var(--ink); border-bottom-color: var(--ink); }
.nq-panel { padding-top: 16px; font-size: .92rem; color: var(--muted); }
.nq-panel[hidden] { display: none; }
.nq-panel ul { margin: 0; padding-inline-start: 18px; }
.nq-hero-cta { display: flex; flex-wrap: wrap; gap: 14px; align-items: center; }
.nq-sbb { position: fixed; inset-inline: 0; bottom: 0; z-index: 60; background: rgba(16,16,20,.95); backdrop-filter: blur(12px); color: var(--ivory); transform: translateY(110%); transition: transform .4s cubic-bezier(.2,.7,.2,1); padding-bottom: env(safe-area-inset-bottom, 0); }
.nq-sbb.show { transform: none; }
.nq-sbb-in { display: flex; align-items: center; gap: 18px; padding-block: 12px; }
.nq-sbb-th { width: 48px; height: 60px; background: linear-gradient(150deg, var(--sand), var(--sand-2)); flex: none; position: relative; overflow: hidden; }
.nq-sbb-th img { width: 100%; height: 100%; object-fit: cover; }
.nq-sbb b { font-family: var(--serif); font-size: 1.05rem; display: block; font-weight: 700; }
.nq-sbb small { color: #b9b2a7; font-size: .78rem; }
.nq-sbb .pr { margin-inline-start: auto; font-family: var(--serif); font-size: 1.3rem; white-space: nowrap; }
@container (max-width: 880px) { .nq-sp-g { grid-template-columns: 1fr; } }
@container (max-width: 560px) { .nq-sbb-th, .nq-sbb small { display: none; } .nq-sbb .pr { font-size: 1.1rem; } }
`;

type Choice = { label: string; disabled: boolean; picked: boolean };
type Swatch = { label: string; hex: string; picked: boolean };
type Photo = { image: string; caption: string };

export default class PieceStage extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private product: Record<string, any> | null = null;
  @state() private photo = 0;
  @state() private size = "";
  @state() private color = "";
  @state() private tab = 0;
  @state() private bar = false;
  private loadedId = "";
  private stop = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("nq-host");
    injectFonts();
    injectStyles("nq-base", baseCss);
    injectStyles("nq-piece-stage", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    document.addEventListener("scroll", this.onScroll, { capture: true, passive: true });
    this.stop = () => {
      stopLocale();
      stopReveal();
      document.removeEventListener("scroll", this.onScroll, { capture: true });
    };
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  protected updated() {
    const cfg = getConfig(this.config);
    const id = pickedId(cfg.product) || landingProductId() || "";
    if (id && id !== this.loadedId) {
      this.loadedId = id;
      fetchProduct(id).then((product) => {
        if (this.loadedId === id) this.product = product;
      });
    }
    if (!id && this.loadedId) {
      this.loadedId = "";
      this.product = null;
    }
  }

  private onScroll = (event?: Event) => {
    const target = event?.target;
    const nested = target && target !== document && target !== document.documentElement && "scrollTop" in (target as Element)
      ? (target as Element).scrollTop
      : 0;
    const top = Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0, nested);
    const next = top > 900;
    if (next !== this.bar) this.bar = next;
  };

  private buy = () => openCheckout();

  render() {
    const cfg = getConfig(this.config);
    const photos = this.photos(cfg);
    const sizes = this.sizes(cfg);
    const colors = this.colors(cfg);
    const tabs = this.tabs(cfg);
    const active = photos[this.photo] || photos[0];
    const title = textOf(this.product?.name) || localizedString(cfg.title);
    const price = this.price(cfg);
    const rating = this.rating(cfg);
    const sizeLabel = this.size || sizes.find((item) => item.picked && !item.disabled)?.label || sizes.find((item) => !item.disabled)?.label || "";
    const colorLabel = this.color || colors.find((item) => item.picked)?.label || colors[0]?.label || "";
    const id = String(cfg.anchor || "product");
    const note = [sizeLabel, colorLabel].filter(Boolean).join(" · ");
    return html`<section class="nq-root nq-sec nq-piece" id=${id} style=${sectionStyle(cfg)} aria-label=${title || "product"}>
      <div class="nq-wrap nq-sp-g">
        <div class="nq-gal nq-rev">
          ${photos.length > 1 ? html`<div class="nq-thumbs">
            ${photos.map((item, index) => html`<button type="button" class="nq-thumb" aria-label=${item.caption || String(index + 1)} aria-selected=${String(index === this.photo)} @click=${() => { this.photo = index; }}>
              ${item.image ? html`<img src=${item.image} alt="" />` : nothing}
            </button>`)}
          </div>` : nothing}
          <div class="nq-ph">
            ${active?.image ? html`<img src=${active.image} alt=${active.caption || title} />` : silhouette()}
            ${active?.caption ? html`<figure><figcaption>${active.caption}</figcaption></figure>` : nothing}
          </div>
        </div>
        <div class="nq-rev">
          ${localizedString(cfg.kicker) ? html`<p class="nq-eyebrow">${localizedString(cfg.kicker)}</p>` : nothing}
          ${title ? html`<h2>${title}</h2>` : nothing}
          ${rating ? html`<div class="nq-stars">★★★★★ <small>${rating}</small></div>` : nothing}
          <div class="nq-price-row">
            ${price.current ? html`<b>${price.current}</b>` : nothing}
            ${price.compare ? html`<s>${price.compare}</s>` : nothing}
            ${price.save ? html`<span class="nq-off">${price.save}</span>` : nothing}
          </div>
          ${localizedString(cfg.text) && !this.product ? html`<p class="nq-lead">${localizedString(cfg.text)}</p>` : nothing}
          ${this.product && textOf(this.product.promotion_title) ? html`<p class="nq-lead">${textOf(this.product.promotion_title)}</p>` : nothing}
          ${sizes.length ? html`<div class="nq-opts">
            <h4>${localizedString(cfg.size_label) || t({ ar: "المقاس", en: "Size" })}</h4>
            <div class="nq-sizes">
              ${sizes.map((item) => html`<button type="button" class="nq-size" ?disabled=${item.disabled} aria-pressed=${String(sizeLabel === item.label)} @click=${() => { this.size = item.label; }}>${item.label}</button>`)}
            </div>
          </div>` : nothing}
          ${colors.length ? html`<div class="nq-opts">
            <h4>${localizedString(cfg.color_label) || t({ ar: "اللون", en: "Color" })}</h4>
            <div class="nq-swatches">
              ${colors.map((item) => html`<button type="button" class="nq-sw" style=${`background:${item.hex}`} aria-label=${item.label} aria-pressed=${String(colorLabel === item.label)} @click=${() => { this.color = item.label; }}></button>`)}
            </div>
          </div>` : nothing}
          <div class="nq-hero-cta">
            ${renderCta(cfg.primary_label, linkHref(cfg.primary_url))}
            ${localizedString(cfg.secondary_label) && linkHref(cfg.secondary_url)
              ? html`<a class="nq-btn ghost" href=${linkHref(cfg.secondary_url)}>${localizedString(cfg.secondary_label)}</a>`
              : nothing}
          </div>
          ${tabs.length ? html`<div class="nq-tabs" role="tablist">
            ${tabs.map((item, index) => html`<button type="button" class="nq-tab" role="tab" aria-selected=${String(this.tab === index)} @click=${() => { this.tab = index; }}>${item.label}</button>`)}
          </div>
          ${tabs.map((item, index) => html`<div class="nq-panel" role="tabpanel" ?hidden=${this.tab !== index}><ul>${item.lines.map((line) => html`<li>${line}</li>`)}</ul></div>`)}` : nothing}
        </div>
      </div>
      ${flag(cfg.show_bar) ? html`<div class="nq-sbb ${this.bar ? "show" : ""}">
        <div class="nq-wrap nq-sbb-in">
          <div class="nq-sbb-th">${active?.image ? html`<img src=${active.image} alt="" />` : nothing}</div>
          <div><b>${title}</b>${note ? html`<small>${note}</small>` : nothing}</div>
          ${price.current ? html`<div class="pr">${price.current}</div>` : nothing}
          <button type="button" class="nq-btn light" @click=${this.buy}>${localizedString(cfg.primary_label) || t({ ar: "أضيفي للسلة", en: "Add to bag" })}</button>
        </div>
      </div>` : nothing}
    </section>`;
  }

  private photos(cfg: Record<string, any>): Photo[] {
    const remote = Array.isArray(this.product?.images)
      ? this.product.images.map((item: any) => String(item?.url || "")).filter(Boolean).map((image: string) => ({ image, caption: textOf(this.product?.name) }))
      : [];
    if (remote.length) return remote;
    return getCollectionItems<Record<string, any>>(cfg.photos, "photos")
      .map((item) => ({ image: String(item.image || ""), caption: localizedString(item.caption) }))
      .filter((item) => item.caption || item.image);
  }

  private sizes(cfg: Record<string, any>): Choice[] {
    const remote = this.optionValues(cfg.size_label);
    if (remote.length) return remote;
    return getCollectionItems<Record<string, any>>(cfg.sizes, "sizes")
      .map((item) => ({
        label: localizedString(item.label),
        disabled: item.available === false || item.available === "false",
        picked: item.picked === true || item.picked === "true",
      }))
      .filter((item) => item.label);
  }

  private colors(cfg: Record<string, any>): Swatch[] {
    return getCollectionItems<Record<string, any>>(cfg.colors, "colors")
      .map((item) => ({
        label: localizedString(item.label),
        hex: String(item.hex || "#15151a"),
        picked: item.picked === true || item.picked === "true",
      }))
      .filter((item) => item.label);
  }

  private tabs(cfg: Record<string, any>) {
    return getCollectionItems<Record<string, any>>(cfg.tabs, "tabs")
      .map((item) => ({ label: localizedString(item.label), lines: linesOf(item.lines) }))
      .filter((item) => item.label && item.lines.length);
  }

  private optionValues(label: unknown): Choice[] {
    const options = Array.isArray(this.product?.options) ? this.product.options : [];
    const wanted = localizedString(label);
    const match = options.find((option: any) => textOf(option?.name) === wanted) || options[0];
    const values = Array.isArray(match?.values) ? match.values : [];
    if (!values.length || options.length > 2) return [];
    return values.map((value: any) => ({
      label: textOf(value?.name || value?.option_value),
      disabled: Boolean(value?.is_out_of_stock || value?.is_out),
      picked: false,
    })).filter((item: Choice) => item.label);
  }

  private price(cfg: Record<string, any>) {
    const sale = amountOf(this.product?.sale_price);
    const regular = amountOf(this.product?.regular_price);
    const currentAmount = amountOf(this.product?.price);
    if (this.product && (sale || currentAmount)) {
      const current = sale && sale > 0 ? sale : currentAmount;
      const compare = regular && current && regular > current ? regular : null;
      const save = compare && current ? localizedString(cfg.save_label).replace("{n}", String(Math.round((1 - current / compare) * 100))) : "";
      return {
        current: current != null ? money(current) : "",
        compare: compare != null ? money(compare) : "",
        save,
      };
    }
    return {
      current: localizedString(cfg.price_text),
      compare: localizedString(cfg.compare_text),
      save: localizedString(cfg.save_text),
    };
  }

  private rating(cfg: Record<string, any>) {
    const stars = Number(this.product?.rating?.stars ?? this.product?.rating?.average);
    const count = Number(this.product?.rating?.count ?? this.product?.rating?.total_count);
    if (Number.isFinite(stars) && stars > 0) {
      const score = stars.toFixed(1);
      return count > 0
        ? t({ ar: `${score} من ${count} تقييماً`, en: `${score} from ${count} reviews` })
        : score;
    }
    return localizedString(cfg.rating_text);
  }
}
