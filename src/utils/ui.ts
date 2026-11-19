import { html, nothing, type TemplateResult } from "lit";
import { localizedString, t } from "./config.js";

export function arDigits(n: number): string {
  return String(Math.max(0, n)).padStart(2, "0").replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

export function emptyCopy() {
  return html`<p class="nq-empty">${t({ ar: "أضف عناصر هذا القسم من الإعدادات", en: "Add this section's items in the settings" })}</p>`;
}

export function silhouette(): TemplateResult {
  return html`<svg class="nq-silhouette" viewBox="0 0 100 160" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><path d="M50 18c6 0 9 4 9 9 0 5-2 7-2 10l14 7c6 3 9 8 10 15l6 81H13l6-81c1-7 4-12 10-15l14-7c0-3-2-5-2-10 0-5 3-9 9-9z" fill="rgba(16,16,20,.34)"/></svg>`;
}

export function frame(src: string, caption: string, extra = ""): TemplateResult {
  return html`<div class="nq-ph ${extra}">
    ${src ? html`<img src=${src} alt=${caption} />` : silhouette()}
    ${caption ? html`<figure><figcaption>${caption}</figcaption></figure>` : nothing}
  </div>`;
}

export function textOf(value: unknown): string {
  if (typeof value === "string") return value;
  return localizedString(value);
}

export function amountOf(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (value && typeof value === "object" && "amount" in (value as Record<string, unknown>)) {
    const n = Number((value as { amount: unknown }).amount);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function linesOf(value: unknown): string[] {
  return localizedString(value).split("\n").map((line) => line.trim()).filter(Boolean);
}
