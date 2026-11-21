import fs from "node:fs";
import { applyLandingExtras } from "./landing-extras.mjs";

const L = (ar, en) => ({ ar, en });
const px = (id, w = 900) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;
const icon64 = (inner) => `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#f7f4ef"/>${inner}</svg>`)}`;
const PAY = {
  mada: icon64(`<rect x="12" y="20" width="40" height="24" rx="4" fill="none" stroke="#101014" stroke-width="2.5"/><rect x="12" y="26" width="40" height="6" fill="#101014"/>`),
  card: icon64(`<rect x="10" y="18" width="44" height="28" rx="4" fill="none" stroke="#101014" stroke-width="2.5"/><rect x="16" y="24" width="10" height="8" rx="1" fill="#b8945f"/>`),
  wallet: icon64(`<rect x="14" y="20" width="36" height="26" rx="4" fill="none" stroke="#101014" stroke-width="2.5"/><path d="M14 28h36" stroke="#101014" stroke-width="2.5"/>`),
  split: icon64(`<circle cx="20" cy="32" r="4" fill="#101014"/><circle cx="32" cy="32" r="4" fill="#b8945f"/><circle cx="44" cy="32" r="4" fill="#101014"/>`),
};
const SOCIAL = [
  ["instagram", "إنستغرام", "c1a7e6d0-3b24-4f91-8a66-1d2c3e4f5a01"],
  ["snapchat", "سناب شات", "c2b8f7e1-4c35-4a02-9b77-2e3d4f5a6b12"],
  ["tiktok", "تيك توك", "c3c9a8f2-5d46-4b13-8c88-3f4e5a6b7c23"],
  ["whatsapp", "واتساب", "c4dab903-6e57-4c24-9d99-4a5f6b7c8d34"],
  ["x", "إكس", "c5ebb014-7f68-4d35-8eaa-5b6a7c8d9e45"],
  ["youtube", "يوتيوب", "c6fcc125-8079-4e46-9fbb-6c7b8d9e0f56"],
];
const socialPick = (value) => {
  const [network, label, key] = SOCIAL.find((item) => item[0] === value);
  return [{ label, value: network, key }];
};
const text = (id, label, value, o = {}) => ({
  id,
  type: "string",
  format: o.format || "text",
  label,
  icon: o.icon || "sicon-format-text-alt",
  multilanguage: o.multilang !== false,
  required: false,
  description: o.desc ?? null,
  minLength: 0,
  maxLength: o.max ?? (o.format === "textarea" ? 800 : 180),
  value,
});
const area = (id, label, value, desc = null) => text(id, label, value, { format: "textarea", icon: "sicon-paragraph", desc, max: 800 });
const plain = (id, label, value, desc = null) => text(id, label, value, { multilang: false, desc });
const color = (id, label, value = "") => ({
  id, type: "string", format: "color", inputType: "color", label, icon: "sicon-format-fill", required: false, description: null, value,
});
const sw = (id, label, value, desc = null) => ({
  id, type: "boolean", format: "switch", label, icon: "sicon-toggle-off", required: false, description: desc, value, selected: value,
});
const image = (id, label, desc, value = "", labelHTML = "") => ({
  id, type: "string", format: "image", label, ...(labelHTML ? { labelHTML } : {}), icon: "sicon-image", required: false, description: desc, value,
});
const when = (id, label, value, desc) => ({
  id, type: "string", format: "datetime-local", inputType: "datetime-local",
  label, icon: "sicon-calendar-date", required: false, description: desc, value,
});
const faviconImage = (id, value = "") => ({
  id,
  type: "string",
  format: "image",
  label: "أيقونة 64×64",
  labelHTML: "المقاس: 64×64 بكسل، حجم فيف أيقون. PNG بخلفية شفافة.",
  icon: "sicon-image",
  required: false,
  description: "يظهر هذا المقاس فوق الصورة: 64×64 بكسل (فيف أيقون)، بصيغة PNG وخلفية شفافة.",
  value,
});
const url = (id, label, value = "", desc = null) => ({
  id,
  type: "string",
  format: "text",
  label,
  icon: "sicon-link",
  multilanguage: false,
  required: false,
  description: desc || "رابط داخل الصفحة مثل #product، أو رابط كامل يبدأ بـ https.",
  minLength: 0,
  maxLength: 500,
  value,
});
const line = (id) => ({ id, type: "static", format: "line" });
const num = (id, label, value, min, max, desc = null) => ({
  id, type: "number", format: "number", inputType: "number", label, icon: "sicon-calculator",
  required: false, description: desc, minimum: min, maximum: max, value,
});
const products = (id, label, desc) => ({
  id, type: "items", format: "dropdown-list", source: "products", label, icon: "sicon-box",
  placeholder: "ابحث عن منتج", required: false, description: desc,
  options: [], selected: [], value: [], searchable: true, multichoice: false,
});
const collection = (id, itemLabel, fields, value, min, max) => ({
  id, type: "collection", format: "collection", required: min > 0, minLength: min, maxLength: max,
  item_label: itemLabel,
  fields: fields.map((field) => ({ ...field, id: String(field.id).includes(".") ? field.id : `${id}.${field.id}` })),
  value: value.map((row) => {
    const out = {};
    for (const [key, val] of Object.entries(row)) out[key.startsWith(`${id}.`) ? key : `${id}.${key}`] = val;
    return out;
  }),
});
const buyHint = "في صفحة منتج يفتح الشراء السريع. في صفحة العروض يتبع رابط زر الصفحة، أو هذا الرابط إن وضعته.";
const KEY = {
  schemeAuto: "3c1f8a24-6e50-4b17-9d82-1a7c5e0b4f63",
  schemeLight: "7d2a9b35-7f61-4c28-8e93-2b8d6f1c5a74",
  schemeDark: "8e3b0c46-8a72-4d39-9fa4-3c9e7a2d6b85",
  modeLight: "2f4c1d57-9b83-4e4a-8ab5-4d0f8b3e7c96",
  modeDark: "4a5d2e68-0c94-4f5b-9bc6-5e1a9c4f8d07",
  modeSystem: "5b6e3f79-1d05-4a6c-8cd7-6f2b0d5a9e18",
  annMove: "e5c13a92-6d40-4b8c-9f37-4a0d9e2c6b83",
  annStill: "f6d24b03-7e51-4c9d-8a48-5b1e0f3d7c94",
  dockStart: "c6e0a3d4-5f78-4b90-9c23-4d5e6f708192",
  dockEnd: "d7f1b4e5-6089-4ca1-8d34-5e6f708192a3",
};
const opt = (value, label, key) => ({ label, value, key });
const drop = (id, label, options, selected, desc = null) => {
  const opts = options.map(([value, name, key]) => opt(value, name, key));
  const picked = opts.filter((item) => item.value === selected);
  return {
    id, type: "items", format: "dropdown-list", source: "Manual", label, icon: "sicon-list",
    required: false, description: desc, options: opts, selected: picked, value: picked,
  };
};
const scheme = (selected = "auto") => drop(
  "color_scheme",
  "وضع الألوان",
  [["auto", "حسب رأس الصفحة", KEY.schemeAuto], ["light", "فاتح دائماً", KEY.schemeLight], ["dark", "داكن دائماً", KEY.schemeDark]],
  selected,
  "حسب رأس الصفحة يتبع زر الفاتح والداكن. الفاتح أو الداكن يثبت القسم ولا يتأثر بالزر.",
);

const components = [
  {
    title: "رأس الصفحة",
    icon: "sicon-store",
    name: "page-bar",
    key: "987655b7-d713-48a7-9760-6700de724ed8",
    image: "",
    props: { "min-height": "74px" },
    fields: [
      text("announce", "الشريط الإعلاني", L("عبايات تُخاط بالطلب · التوصيل داخل المملكة", "Abayas cut to order · delivery across the Kingdom"), { desc: "يظهر فوق الشعار. اتركه فارغاً لإخفاء الشريط." }),
      drop("announce_mode", "حركة الشريط", [["move", "متحرك", KEY.annMove], ["still", "ثابت", KEY.annStill]], "move", "المتحرك يمرّ الجملة باستمرار. الثابت يُبقيها في الوسط."),
      line("pb-announce"),
      image("logo", "شعار", "اتركه فارغاً ليظهر اسم الدار بخط العنوان. المقاس المقترح 280×80 بكسل."),
      image("logo_dark", "شعار للوضع الداكن", "يظهر عندما تكون الصفحة داكنة. بدونه يُستخدم الشعار الأساسي."),
      text("brand", "اسم الدار", L("دار نَسَق", "Nasaq House")),
      text("mark", "سطر صغير تحت الاسم", L("NASAQ", "NASAQ")),
      url("home_url", "رابط الشعار", "#"),
      line("pb-brand"),
      collection("links", "رابط", [
        text("label", "النص", L("العبايات", "Abayas")),
        url("url", "الرابط", "#lookbook"),
      ], [
        { label: L("العبايات", "Abayas"), url: "#lookbook" },
        { label: L("أقمشة العباية", "Abaya cloth"), url: "#quality" },
        { label: L("عباية الموسم", "Season abaya"), url: "#product" },
        { label: L("أسئلة العباية", "Abaya questions"), url: "#faq" },
      ], 0, 6),
      line("pb-links"),
      sw("use_kit_font", "خط الصفحة", false, "الافتراضي خط المتجر من سلة، مثل سيليا. فعّله فقط إذا أردت خط أميري والمرعي."),
      line("pb-bar"),
      sw("sticky", "تثبيت الرأس عند التمرير", true, "يبقى الاسم ظاهراً أثناء نزول الزائرة."),
      sw("show_mode_toggle", "زر الفاتح والداكن", true, "أيقونة في الرأس تتبدل بين القمر والشمس، وتبدّل الأقسام المضبوطة على حسب الصفحة، وتتذكر اختيار الزائرة."),
      drop("default_mode", "وضع الصفحة عند الفتح", [["light", "فاتح", KEY.modeLight], ["dark", "داكن", KEY.modeDark], ["system", "حسب جهاز الزائرة", KEY.modeSystem]], "light"),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "افتتاح التشكيلة",
    icon: "sicon-image",
    name: "hero-stage",
    key: "a9909358-5974-4070-bfb8-68410b61c142",
    image: "",
    props: { "min-height": "640px" },
    fields: [
      text("kicker", "سطر صغير", L("عبايات شتاء ٢٠٢٦", "Abayas, winter 2026")),
      text("title_line", "سطر العنوان الأول", L("عباية ساكنة", "A quiet abaya"), { max: 80 }),
      text("title_before", "ما قبل الكلمة المميزة", L("في", "in the"), { max: 40 }),
      text("title_accent", "الكلمة المميزة", L("تفاصيل", "details"), { max: 40 }),
      text("title_after", "ما بعد الكلمة المميزة", L("القَصّة.", "of the cut."), { max: 80 }),
      area("text", "النص", L("عبايات مخيطة بأيدٍ سعودية من كريب مطفي وحرير مغسول، بقَصّات مدروسة تُحافظ على انسيابها بعد كل غسلة.", "Abayas sewn in Saudi hands from matte crepe and washed silk, cut so the fall stays after every wash.")),
      text("primary_label", "نص الزر الأساسي", L("تسوّقي العبايات", "Shop the abayas")),
      url("primary_url", "رابط الزر الأساسي", "#lookbook", buyHint),
      text("secondary_label", "نص الزر الثاني", L("تعرّفي على قماش العباية", "See the abaya cloth")),
      url("secondary_url", "رابط الزر الثاني", "#quality"),
      plain("side_tag", "عبارة جانبية", "عبايات ٢٠٢٦ · الرياض"),
      line("hs-media"),
      collection("photos", "صورة", [
        image("image", "الصورة", "المقاس المقترح 900×1400 بكسل. الصورة الافتراضية مجانية من Pexels ويمكن استبدالها بصورة العباية."),
        text("caption", "التعليق", L("كريب مطفي", "Matte crepe")),
      ], [
        { image: px(32279499, 1000), caption: L("عباية كريب مطفي", "Matte crepe abaya") },
        { image: px(29188564, 1000), caption: L("عباية حرير مغسول", "Washed silk abaya") },
        { image: px(29273199, 1000), caption: L("عباية كلوش", "Flared abaya") },
      ], 1, 3),
      collection("stats", "رقم", [
        text("value", "الرقم", L("١٢٤٠٠", "12,400"), { max: 20 }),
        text("label", "الوصف", L("عميلة", "clients"), { max: 40 }),
      ], [
        { value: L("١٢٤٠٠", "12,400"), label: L("عميلة", "clients") },
        { value: L("٤.٩", "4.9"), label: L("تقييم المتجر", "store rating") },
        { value: L("٤٨ س", "48h"), label: L("توصيل الرياض", "Riyadh delivery") },
      ], 0, 3),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "شريط العبارات",
    icon: "sicon-format-text-alt",
    name: "ribbon-line",
    key: "10e7afdc-4807-489b-a683-98d3d88a2e9d",
    image: "",
    props: { "min-height": "54px" },
    fields: [
      collection("items", "عبارة", [
        text("text", "العبارة", L("خياطة سعودية", "Sewn in Saudi Arabia")),
      ], [
        { text: L("عبايات مبطّنة", "Lined abayas") },
        { text: L("قماش لا يشف", "Cloth that is never sheer") },
        { text: L("قَصّة على مقاسك", "Cut to your measure") },
        { text: L("خياطة سعودية", "Sewn in Saudi Arabia") },
        { text: L("استرجاع ١٤ يوماً", "14-day returns") },
      ], 1, 8),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "شبكة القصّات",
    icon: "sicon-image",
    name: "cut-grid",
    key: "5d448cb2-aff8-4cf5-a632-811b877a9fdf",
    image: "",
    props: { "min-height": "640px" },
    fields: [
      plain("anchor", "معرّف القسم في الرابط", "lookbook", "يُستخدم في روابط الرأس، مثل #lookbook."),
      text("kicker", "سطر صغير", L("تشكيلة العبايات", "The abaya edit")),
      text("title", "العنوان", L("ثلاث عبايات تكفي خزانتك", "Three abayas are enough")),
      area("text", "النص", L("اخترنا الأكثر طلباً من ٢٨ عباية، وأعدنا ضبط أطوالها على القياس السعودي.", "The three most requested of 28 abayas, with lengths set to the Saudi measure.")),
      collection("cards", "قَصّة", [
        text("tag", "شارة", L("الأكثر طلباً", "Most requested"), { max: 40 }),
        image("image", "الصورة", "المقاس المقترح 800×1000 بكسل. الصورة الافتراضية مجانية من Pexels ويمكن استبدالها."),
        text("caption", "تعليق الصورة", L("Nasaq 01", "Nasaq 01"), { max: 40 }),
        text("title", "الاسم", L("عباية كلوش", "Flared abaya")),
        text("note", "سطر تحت الاسم", L("كريب مطفي · ٨ ألوان", "Matte crepe · 8 colors")),
        text("price", "السعر", L("٤٩٥", "495"), { max: 30 }),
        text("compare", "السعر قبل الخصم", L("٦٢٠ ر.س", "SAR 620"), { max: 30 }),
        url("url", "الرابط", "#product"),
      ], [
        { tag: L("الأكثر طلباً", "Most requested"), image: px(28222774, 900), caption: L("عباية كلوش", "Flared abaya"), title: L("عباية كلوش", "Flared abaya"), note: L("كريب مطفي · ٨ ألوان", "Matte crepe · 8 colors"), price: L("٤٩٥ ر.س", "SAR 495"), compare: L("٦٢٠ ر.س", "SAR 620"), url: "#product" },
        { tag: L("جديدة", "New"), image: px(37368651, 900), caption: L("عباية مطرزة", "Embroidered abaya"), title: L("عباية مطرزة", "Embroidered abaya"), note: L("حرير مغسول · تطريز يدوي", "Washed silk · hand embroidery"), price: L("٧٨٠ ر.س", "SAR 780"), compare: L("٩٥٠ ر.س", "SAR 950"), url: "#product" },
        { tag: L("يومية", "Everyday"), image: px(13838840, 900), caption: L("عباية مستقيمة", "Straight abaya"), title: L("عباية مستقيمة", "Straight abaya"), note: L("كريب خفيف · ٦ ألوان", "Light crepe · 6 colors"), price: L("٣٢٠ ر.س", "SAR 320"), compare: L("٤١٠ ر.س", "SAR 410"), url: "#product" },
      ], 1, 6),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "صف الأقمشة",
    icon: "sicon-shield-check",
    name: "craft-row",
    key: "6209a2b4-4202-4da9-b253-5e743804492c",
    image: "",
    props: { "min-height": "220px" },
    fields: [
      plain("anchor", "معرّف القسم في الرابط", "quality"),
      text("title", "وصف للقارئ", L("أقمشة العباية", "Abaya cloth")),
      collection("items", "سبب", [
        text("mark", "الرقم", L("١", "1"), { max: 4 }),
        text("title", "العنوان", L("قماش يُختبر أولاً", "Cloth is tested first")),
        area("text", "النص", L("كل دفعة قماش تُغسل ٥ مرات قبل الاعتماد؛ ما يتغيّر لونه أو يفقد انسيابه لا يدخل الورشة.", "Every cloth lot is washed five times before it is approved.")),
      ], [
        { mark: L("١", "1"), title: L("قماش يُختبر أولاً", "Cloth is tested first"), text: L("كل دفعة قماش تُغسل ٥ مرات قبل الاعتماد؛ ما يتغيّر لونه أو يفقد انسيابه لا يدخل الورشة.", "Every cloth lot is washed five times before it is approved. What fades or loses its fall never enters the workshop.") },
        { mark: L("٢", "2"), title: L("قياس على مقاسك", "Cut to your measure"), text: L("أرسلي طولك وطول الكتف، ونخيط العباية على مقاسك بلا فرق سعر.", "Send your height and shoulder, and the abaya is cut to you at the same price.") },
        { mark: L("٣", "3"), title: L("خياطة مزدوجة", "A double stitch"), text: L("حواشٍ مخفية ودرزة مزدوجة عند الأكمام — المنطقة الأولى التي تتلف عادةً.", "Hidden hems and a double stitch at the sleeve, the first place that usually wears.") },
        { mark: L("٤", "4"), title: L("استرجاع مريح", "An easy return"), text: L("١٤ يوماً للاستبدال أو الاسترجاع، والشحن علينا في حال اختلاف المقاس.", "14 days to exchange or return, and we cover shipping if the size is off.") },
      ], 1, 4),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "عباية الموسم",
    icon: "sicon-box",
    name: "piece-stage",
    key: "cf296df4-e4fa-4144-bcbe-3c96e1c42a28",
    image: "",
    props: { "min-height": "720px" },
    fields: [
      plain("anchor", "معرّف القسم في الرابط", "product"),
      products("product", "منتج من المتجر", "اتركه فارغاً لاستخدام منتج صفحة الهبوط. عند اختيار منتج تُستبدل الصورة والسعر والاسم."),
      text("kicker", "سطر صغير", L("عباية الموسم", "The season piece")),
      text("title", "الاسم", L("عباية نَسَق المطرزة", "Nasaq embroidered abaya")),
      text("rating_text", "سطر التقييم", L("٤.٩ من ٣٨٢ تقييماً", "4.9 from 382 reviews")),
      text("price_text", "السعر", L("٧٨٠ ر.س", "SAR 780"), { max: 30 }),
      text("compare_text", "السعر قبل الخصم", L("٩٥٠ ر.س", "SAR 950"), { max: 30 }),
      text("save_text", "شارة التوفير", L("وفّري ١٨٪", "Save 18%"), { max: 30 }),
      text("save_label", "صيغة التوفير عند ربط منتج", L("وفّري {n}٪", "Save {n}%"), { max: 30, desc: "{n} يُستبدل بنسبة الخصم." }),
      area("text", "الوصف", L("حرير مغسول بوزن ١٩ ممي، تطريز يدوي على الصدر والأكمام، بطانة قطنية تمنع الشفافية تماماً.", "Washed silk at 19 momme, hand embroidery on the chest and sleeves, and a cotton lining that is never sheer.")),
      line("ps-photos"),
      collection("photos", "صورة", [
        image("image", "الصورة", "المقاس المقترح 900×1200 بكسل. الصورة الافتراضية مجانية من Pexels ويمكن استبدالها."),
        text("caption", "التعليق", L("عباية نَسَق المطرزة", "Nasaq embroidered abaya")),
      ], [
        { image: px(29188563, 1000), caption: L("عباية نَسَق المطرزة", "Nasaq embroidered abaya") },
        { image: px(13791315, 1000), caption: L("التطريز", "Embroidery") },
        { image: px(35324617, 1000), caption: L("البطانة", "The lining") },
      ], 1, 4),
      line("ps-options"),
      text("size_label", "عنوان المقاس", L("المقاس", "Size"), { max: 40 }),
      collection("sizes", "مقاس", [
        text("label", "المقاس", L("54", "54"), { max: 12 }),
        sw("available", "متوفر", true),
        sw("picked", "مختار عند الفتح", false),
      ], [
        { label: L("52", "52"), available: true, picked: false },
        { label: L("54", "54"), available: true, picked: true },
        { label: L("56", "56"), available: true, picked: false },
        { label: L("58", "58"), available: true, picked: false },
        { label: L("60", "60"), available: false, picked: false },
      ], 0, 8),
      text("color_label", "عنوان اللون", L("اللون", "Color"), { max: 40 }),
      collection("colors", "لون", [
        text("label", "الاسم", L("أسود", "Black"), { max: 30 }),
        plain("hex", "درجة اللون", "#15151a"),
        sw("picked", "مختار عند الفتح", false),
      ], [
        { label: L("أسود", "Black"), hex: "#15151a", picked: true },
        { label: L("فحمي", "Charcoal"), hex: "#3b3f46", picked: false },
        { label: L("بني", "Brown"), hex: "#6b5847", picked: false },
        { label: L("رمادي بيج", "Warm grey"), hex: "#8d7f6d", picked: false },
      ], 0, 8),
      collection("tabs", "تبويب", [
        text("label", "العنوان", L("التفاصيل", "Details"), { max: 40 }),
        area("lines", "الأسطر", L("حرير مغسول ١٩ ممي + بطانة قطن ١٠٠٪", "19 momme washed silk + 100% cotton lining"), "سطر لكل نقطة."),
      ], [
        { label: L("التفاصيل", "Details"), lines: L("حرير مغسول ١٩ ممي + بطانة قطن ١٠٠٪\nتطريز يدوي بخيط حريري مطابق\nسحّاب مخفي جانبي · أزرار صدف", "19 momme washed silk + 100% cotton lining\nHand embroidery in a matching silk thread\nA hidden side zip · shell buttons") },
        { label: L("القياسات", "Measures"), lines: L("54: الطول ١٤٠ سم · الكتف ٤٠ سم\n56: الطول ١٤٥ سم · الكتف ٤٢ سم\nقياس مخصّص متاح مجاناً", "54: length 140 cm · shoulder 40 cm\n56: length 145 cm · shoulder 42 cm\nCustom measure is free") },
        { label: L("العناية", "Care"), lines: L("غسيل يدوي بماء بارد أو تنظيف جاف\nكي على حرارة منخفضة من الجهة الداخلية\nتُحفظ معلّقة على علاقة مبطّنة", "Hand wash cold or dry clean\nIron low from the inside\nHang it on a padded hanger") },
      ], 0, 4),
      line("ps-buy"),
      text("primary_label", "نص زر الشراء", L("أضيفي للسلة", "Add to bag")),
      url("primary_url", "رابط زر الشراء", "#product", buyHint),
      text("secondary_label", "نص الزر الثاني", L("اطلبي قياساً مخصّصاً", "Request a custom measure")),
      url("secondary_url", "رابط الزر الثاني", "#faq"),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "عدّاد العرض",
    icon: "sicon-time",
    name: "offer-clock",
    key: "47ba2d9d-8269-445f-ab0b-38c83b33eb2e",
    image: "",
    props: { "min-height": "220px" },
    fields: [
      text("kicker", "سطر صغير", L("عرض العبايات", "The abaya offer")),
      text("title", "العنوان", L("خصم ٢٠٪ على العبايات + تغليف هدية", "20% off the abayas, plus gift wrap")),
      area("text", "النص", L("ينتهي عرض العبايات في التاريخ المحدد، ولا يُمدّد.", "The abaya offer ends on the chosen date, and it is not extended.")),
      when("ends_at", "تاريخ انتهاء العرض", "2026-12-05T23:59", "يُحسب العدّاد حتى هذا التاريخ والوقت. يوم وساعة ودقيقة وثانية تُعرض وحدها، بلا حقول مدة."),
      sw("show_video", "خلفية فيديو", false, "عند التفعيل يظهر فيديو العباية خلف العدّاد بلا صوت، ويبقى النص فوقه. زر الشراء تضيفه سلة."),
      url("video_url", "رابط خلفية الفيديو", "", "ملف mp4 لعباية، أو رابط يوتيوب أو فيميو. لا يظهر إلا إذا كانت خلفية الفيديو مفعّلة."),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "آراء العميلات",
    icon: "sicon-star",
    name: "guest-notes",
    key: "eb42257e-8e02-4579-8df2-83bc3a5f5d4e",
    image: "",
    props: { "min-height": "420px" },
    fields: [
      text("kicker", "سطر صغير", L("آراء العميلات", "From clients")),
      text("title", "العنوان", L("٣٨٢ تقييماً بمعدل ٤.٩", "382 reviews, averaging 4.9")),
      collection("notes", "رأي", [
        area("quote", "النص", L("القماش ثقيل بشكل محترم وما يبيّن اللي تحته.", "The cloth has a proper weight and nothing shows through.")),
        text("name", "الاسم", L("لمى ع.", "Lama A.")),
        text("meta", "السطر الصغير", L("الرياض · مشترية موثّقة", "Riyadh · verified")),
        text("initial", "الحرف", L("ل", "L"), { max: 2 }),
      ], [
        { quote: L("العباية ثقيلة بشكل محترم وما تبين اللي تحتها. طلبت قياس مخصص ووصلني الطول على كعبي.", "The abaya has a proper weight and nothing shows through. I asked for a custom measure and the length met my heel."), name: L("لمى ع.", "Lama A."), meta: L("الرياض · مشترية موثّقة", "Riyadh · verified"), initial: L("ل", "L") },
        { quote: L("ثالث عباية أطلبها منهم. التطريز نظيف من الداخل، وهذا اللي يفرّق عن غيرهم.", "This is the third abaya I have ordered. The embroidery is clean on the inside, and that is the difference."), name: L("نورة ا.", "Noura A."), meta: L("جدة · مشترية موثّقة", "Jeddah · verified"), initial: L("ن", "N") },
        { quote: L("وصلت في ٣٦ ساعة والتغليف يصلح هدية مباشرة. خدمة العملاء ردّت على الواتس بدقيقتين.", "It arrived in 36 hours and the wrap is ready to gift. Support answered on WhatsApp in two minutes."), name: L("ريم س.", "Reem S."), meta: L("الدمام · مشترية موثّقة", "Dammam · verified"), initial: L("ر", "R") },
      ], 1, 6),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "أسئلة قبل الطلب",
    icon: "sicon-list",
    name: "ask-list",
    key: "beca001a-7963-4760-8ca8-05c86770fbb7",
    image: "",
    props: { "min-height": "420px" },
    fields: [
      plain("anchor", "معرّف القسم في الرابط", "faq"),
      text("kicker", "سطر صغير", L("عن العباية", "About the abaya")),
      text("title", "العنوان", L("أسئلة قبل طلب العباية", "Before you order an abaya")),
      area("text", "النص", L("ما لم تجديه عن العباية هنا، اسألينا على الواتساب ونرد في دقائق.", "If it is not here, ask us about the abaya on WhatsApp and we reply in minutes.")),
      collection("items", "سؤال", [
        text("q", "السؤال", L("كيف أختار مقاسي الصحيح؟", "How do I choose my size?")),
        area("a", "الجواب", L("قيسي طولك من الكتف حتى الكعب وأضيفي ٢ سم.", "Measure from shoulder to heel and add 2 cm.")),
      ], [
        { q: L("كيف أختار مقاسي الصحيح؟", "How do I choose my size?"), a: L("قيسي طولك من الكتف حتى الكعب وأضيفي ٢ سم. أو أرسلي طولك ووزنك لنا ونختار عنك — ٩٦٪ من الطلبات تصل مطابقة.", "Measure from shoulder to heel and add 2 cm. Or send your height and weight and we choose — 96% of orders arrive right.") },
        { q: L("هل القياس المخصّص بسعر إضافي؟", "Does a custom measure cost more?"), a: L("لا. القياس المخصّص مجاني ويحتاج ٣ أيام عمل إضافية فقط.", "No. A custom measure is free and needs only three extra working days.") },
        { q: L("كم تستغرق مدة التوصيل؟", "How long is delivery?"), a: L("الرياض ٤٨ ساعة، باقي مناطق المملكة ٢–٤ أيام، ودول الخليج ٥–٧ أيام.", "Riyadh in 48 hours, the rest of the Kingdom in 2–4 days, and the Gulf in 5–7 days.") },
        { q: L("هل يمكنني الاسترجاع إذا لم يناسبني المقاس؟", "Can I return it if the size is off?"), a: L("نعم، خلال ١٤ يوماً بشرط عدم الاستخدام وبقاء البطاقة. شحن الاستبدال علينا في حال خطأ المقاس.", "Yes, within 14 days if it is unworn and the tag is on. We cover the exchange if the size was wrong.") },
        { q: L("هل العباية شفافة؟", "Is the abaya sheer?"), a: L("لا. جميع عباياتنا مبطّنة بقطن ١٠٠٪، ونختبرها تحت ضوء مباشر قبل الاعتماد.", "No. Every abaya is lined in 100% cotton, and we test it under direct light before it is approved.") },
      ], 1, 8),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "دعوة الختام",
    icon: "sicon-megaphone",
    name: "close-invite",
    key: "27ec15c9-328c-438b-9a04-966c9b2b8cae",
    image: "",
    props: { "min-height": "360px" },
    fields: [
      text("kicker", "سطر صغير", L("جاهزة؟", "Ready?")),
      text("title", "العنوان", L("اختاري عبايتك اليوم، وتوصلك قبل المناسبة.", "Choose your abaya today, and it arrives before the occasion.")),
      area("text", "النص", L("طلبات العباية قبل الرابعة عصراً تُخرج من الورشة في نفس اليوم.", "Abaya orders placed before 4pm leave the workshop the same day.")),
      text("primary_label", "نص الزر الأساسي", L("تسوّقي العبايات", "Shop the abayas")),
      url("primary_url", "رابط الزر الأساسي", "#product", buyHint),
      text("secondary_label", "نص الزر الثاني", L("تواصلي واتساب", "WhatsApp us")),
      url("secondary_url", "رابط الزر الثاني", "#", "ضعي رابط الواتساب."),
      collection("perks", "ميزة", [
        text("text", "النص", L("شحن مجاني فوق ٣٠٠ ر.س", "Free shipping over SAR 300")),
      ], [
        { text: L("شحن مجاني فوق ٣٠٠ ر.س", "Free shipping over SAR 300") },
        { text: L("دفع عند الاستلام", "Pay on delivery") },
        { text: L("تقسيط تمارا وتابي", "Tamara and Tabby") },
        { text: L("استرجاع ١٤ يوماً", "14-day returns") },
      ], 0, 6),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "مرآة العميلات",
    icon: "sicon-play",
    name: "mirror-reels",
    key: "6c7f4a80-2e16-4b7d-9de8-7a3c1e6b0f29",
    image: "",
    props: { "min-height": "640px" },
    fields: [
      plain("anchor", "معرّف القسم في الرابط", "reels", "يُستخدم في روابط الرأس، مثل #reels."),
      text("kicker", "سطر صغير", L("من ورشة العبايات", "From the abaya workshop")),
      text("title", "العنوان", L("العميلات يَرَين العباية", "Clients show the abaya")),
      area("text", "النص", L("مقطع واحد لعباية في كل مرة. لا يشتغل وحده، والصوت لا يفتح إلا إذا طلبته الزائرة.", "One abaya clip at a time. It does not start on its own, and the sound stays off until she asks.")),
      collection("clips", "مقطع", [
        url("video_url", "رابط الفيديو", "", "ملف mp4 أو رابط يوتيوب أو فيميو."),
        image("poster", "صورة قبل التشغيل", "المقاس المقترح 720×1280 بكسل. تظهر حتى تضغط الزائرة على التشغيل."),
        text("name", "الاسم", L("لمى", "Lama")),
        text("place", "المدينة", L("الرياض", "Riyadh"), { max: 40 }),
        area("quote", "الجملة", L("العباية تمشي مع الخطوة، وما تبين اللي تحتها.", "The abaya moves with the step, and nothing shows through.")),
      ], [
        { video_url: "", poster: px(32279508, 800), name: L("لمى", "Lama"), place: L("الرياض", "Riyadh"), quote: L("العباية تمشي مع الخطوة، وما تبين اللي تحتها.", "The abaya moves with the step, and nothing shows through.") },
        { video_url: "", poster: px(32279505, 800), name: L("هيفاء", "Haifa"), place: L("جدة", "Jeddah"), quote: L("تطريز العباية من الداخل أنظف من الصورة.", "The abaya embroidery is cleaner on the inside than in the photo.") },
        { video_url: "", poster: px(33713539, 800), name: L("نورة", "Noura"), place: L("الخبر", "Khobar"), quote: L("طلبت قياس العباية المخصّص، ووصل الطول على كعبي.", "I asked for a custom abaya measure, and the length met my heel.") },
      ], 0, 6),
      text("button_label", "نص الزر", L("تسوّقي العبايات", "Shop the abayas")),
      url("button_url", "رابط الزر", "#product", buyHint),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "فوتر الصفحة",
    icon: "sicon-link",
    name: "page-footer",
    key: "c8fa9e35-19fc-427b-99a0-e6ba7d5a1fb3",
    image: "",
    props: { "min-height": "280px" },
    fields: [
      text("announce", "الشريط الإعلاني", L("المقاس يُضبط قبل القص · الاستبدال حسب سياسة الورشة", "The size is set before cutting · exchanges follow the workshop policy"), { desc: "يظهر فوق الفوتر. اتركه فارغاً لإخفاء الشريط." }),
      drop("announce_mode", "حركة الشريط", [["move", "متحرك", KEY.annMove], ["still", "ثابت", KEY.annStill]], "move", "المتحرك يمرّ الجملة باستمرار. الثابت يُبقيها في الوسط."),
      line("ft-announce"),
      image("logo", "شعار", "اتركه فارغاً ليظهر اسم الدار. المقاس المقترح 280×80 بكسل."),
      image("logo_dark", "شعار للوضع الداكن", "يظهر عندما تكون الصفحة داكنة. بدونه يُستخدم الشعار الأساسي."),
      text("brand", "اسم الدار", L("دار نَسَق", "Nasaq House")),
      text("mark", "سطر صغير تحت الاسم", L("NASAQ", "NASAQ")),
      area("about", "نبذة", L("ورشة خياطة سعودية في الرياض منذ ٢٠١٩. عبايات تُخاط بالطلب.", "A Saudi sewing workshop in Riyadh since 2019. Abayas cut to order.")),
      {
        id: "payments-size",
        type: "static",
        format: "description",
        label: "مقاس أيقونات الدفع",
        value: "كل وسيلة دفع صورة مربعة 64×64 بكسل بحجم فيف أيقون. ارفعي PNG بخلفية شفافة، وهذا التوضيح يظهر فوق الصورة.",
      },
      collection("payments", "وسيلة دفع", [
        faviconImage("image"),
        text("label", "الاسم", L("مدى", "mada"), { max: 20 }),
      ], [
        { image: PAY.mada, label: L("مدى", "mada") },
        { image: PAY.card, label: L("بطاقة", "Card") },
        { image: PAY.wallet, label: L("محفظة", "Wallet") },
        { image: PAY.split, label: L("تقسيط", "Split pay") },
      ], 0, 6),
      line("ft-cols"),
      text("col1_title", "عنوان العمود الأول", L("العبايات", "Abayas")),
      collection("col1", "رابط", [
        text("label", "النص", L("كلوش", "Flared")),
        url("url", "الرابط", "#lookbook"),
      ], [
        { label: L("كلوش", "Flared"), url: "#lookbook" },
        { label: L("مستقيمة", "Straight"), url: "#lookbook" },
        { label: L("مطرزة", "Embroidered"), url: "#product" },
        { label: L("صلاة وسفر", "Prayer and travel"), url: "#lookbook" },
      ], 0, 6),
      text("col2_title", "عنوان العمود الثاني", L("المساعدة", "Help")),
      collection("col2", "رابط", [
        text("label", "النص", L("دليل المقاسات", "Size guide")),
        url("url", "الرابط", "#faq"),
      ], [
        { label: L("دليل المقاسات", "Size guide"), url: "#faq" },
        { label: L("سياسة الاستبدال", "Exchange policy"), url: "#faq" },
        { label: L("تتبّع الطلب", "Track an order"), url: "#" },
        { label: L("اتصلي بنا", "Contact"), url: "#" },
      ], 0, 6),
      text("col3_title", "عنوان العمود الثالث", L("تابعينا", "Follow")),
      collection("social", "حساب", [
        drop("network", "الأيقونة", SOCIAL, "instagram", "تظهر الأيقونة بجانب الرابط."),
        url("url", "الرابط", "https://instagram.com/"),
      ], [
        { network: socialPick("instagram"), url: "https://instagram.com/" },
        { network: socialPick("snapchat"), url: "https://snapchat.com/" },
        { network: socialPick("tiktok"), url: "https://www.tiktok.com/" },
        { network: socialPick("whatsapp"), url: "https://wa.me/" },
      ], 0, 6),
      line("ft-base"),
      sw("show_top", "زر العودة للأعلى", true, "يظهر أثناء النزول، وفي أسفل الفوتر. الضغط يعيد الزائرة لبداية الصفحة."),
      text("top_label", "نص زر العودة", L("العودة للأعلى", "Back to top"), { max: 40 }),
      text("copyright", "سطر الحقوق", L("© ٢٠٢٦ دار نَسَق · جميع الحقوق محفوظة", "© 2026 Nasaq House")),
      text("legal", "السجل والرقم الضريبي", L("س.ت ١٠١٠XXXXXX · الرقم الضريبي ٣٠٠XXXXXXXX", "CR 1010XXXXXX · VAT 300XXXXXXXX")),
      color("bg_color", "لون الخلفية"),
    ],
  },
];

for (const component of components) component.fields.push(scheme());

const templates = [
  {
    name: "nasaq",
    id: "5f79e7d6-62a7-40a2-b12d-1a6a5988cb62",
    is_default: true,
    primary_color: "#101014",
    order: ["page-bar", "hero-stage", "ribbon-line", "cut-grid", "craft-row", "piece-stage", "mirror-reels", "offer-clock", "guest-notes", "ask-list", "close-invite", "page-footer"],
  },
  {
    name: "wasl",
    id: "605cc08e-57b1-46eb-ace2-d6c52dd52d4e",
    is_default: false,
    primary_color: "#b8945f",
    order: ["page-bar", "piece-stage", "offer-clock", "ask-list", "close-invite", "page-footer"],
  },
];

applyLandingExtras({ components, catalog: null, templates, L, text, color, sw, drop, line, collection, image, url, scheme, KEY });

const bundlePath = new URL("../twilight-bundle.json", import.meta.url);
let previous = { templates: [] };
if (fs.existsSync(bundlePath)) previous = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
const previousTemplates = new Map((previous.templates || []).map((item) => [item.path, item]));

const bundle = {
  name: { ar: "مجموعات العبايات", en: "Abaya Collections" },
  description: {
    ar: "صفحتان لعبايات. نَسَق تعرض التشكيلة كاملة، ووصل تختصر الطريق إلى المنتج والعرض والأسئلة.",
    en: "Two abaya landing pages. Nasaq shows the full edit, and Wasl goes straight to the piece, the offer, and the questions.",
  },
  author: {
    name: "Saji",
    email: "sajispprt@gmail.com",
    url: "https://saji-tech.com/",
  },
  author_email: "sajispprt@gmail.com",
  support_url: "https://github.com/Ashaheen892/tw-nasaq-landing",
  repository: "https://github.com/Ashaheen892/tw-nasaq-landing",
  features: ["landing-page-templates"],
  components,
  templates: templates.map((template) => {
    const path = `templates.${template.name}`;
    const saved = previousTemplates.get(path) || {};
    return {
      id: template.id,
      path,
      category_id: saved.category_id || "",
      primary_color: template.primary_color,
      thumbnail: saved.thumbnail || "",
      is_default: template.is_default,
      ...(saved.public_preview_url ? { public_preview_url: saved.public_preview_url } : {}),
    };
  }),
};

fs.writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 4)}\n`);
fs.mkdirSync(new URL("../templates/", import.meta.url), { recursive: true });
fs.mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
const byName = new Map(components.map((component) => [component.name, component]));
for (const template of templates) {
  const list = template.order.map((name) => structuredClone(byName.get(name)));
  fs.writeFileSync(new URL(`../templates/${template.name}.json`, import.meta.url), `${JSON.stringify({ id: template.id, components: list }, null, 2)}\n`);
}
fs.writeFileSync(new URL("../public/twilight-bundle.json", import.meta.url), `${JSON.stringify(bundle, null, 4)}\n`);
console.log("pages:", templates.map((template) => `${template.name}(${template.order.length})`).join(", "));
console.log("sections:", components.map((component) => component.name).join(", "));
