import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  EnvelopeSimple,
  Phone,
  MapPin,
  Clock,
  ArrowUp,
  CheckCircle,
  ArrowLeft,
  X,
} from "@phosphor-icons/react";
import { Reveal, RevealWords, DrawLine } from "./Reveal";
import { SectionEyebrow } from "./Section";
import { ar } from "../lib/numerals";

const PROJECT_TYPES = [
  "فيلا سكنية خاصة",
  "بنتهاوس أو شقة فاخرة",
  "مقر عمل أو جناح تنفيذي",
  "قصر أو مجمع سكني خاص",
  "أخرى",
];

const MAP_QUERY = "الرياض، حي الملقا، مكتب المعماري للتصميم الداخلي";
const INQUIRY_EMAIL = "inquiry@al-maamari.sa";

/** نصوص الصفحات القانونية. مختصرة عمدًا، ومكتوبة لتُقرأ لا لتُملأ. */
const LEGAL = {
  privacy: {
    title: "سياسة الخصوصية",
    body: [
      "هذا الموقع تعريفي ولا يحتوي على نظام تسجيل أو حسابات. لا نضع ملفات تتبّع إعلانية، ولا نستخدم أدوات تحليل تُعرّف الزائر شخصيًا.",
      "نموذج طلب الاستشارة لا يرسل بياناتك إلى خادم لدينا: بالضغط على زر الإرسال يُفتح تطبيق البريد على جهازك برسالة معبّأة مسبقًا، وأنت من يرسلها. أي بيانات تصلنا بهذه الطريقة تُستخدم للرد على طلبك فقط، ولا تُشارك مع أي طرف ثالث.",
      "لطلب حذف مراسلاتك من سجلاتنا، راسلنا على البريد المذكور في هذه الصفحة.",
    ],
  },
  terms: {
    title: "شروط الاستخدام",
    body: [
      "كل الصور والرسوم والنصوص المعروضة هنا مملوكة لمكتب المعماري أو مستخدمة بترخيص. لا يجوز إعادة نشرها أو استخدامها تجاريًا دون إذن كتابي.",
      "الأرقام والمساحات ومدد التنفيذ المذكورة في ملفات المشاريع مبنية على مشاريع منفّذة، وتُعرض للاطلاع لا كتعهّد تعاقدي. كل مشروع يخضع لعقد مستقل يحدد النطاق والجدول والمقابل.",
      "الجلسة الاستشارية الأولى غير مُلزمة للطرفين ولا تنشئ أي التزام تعاقدي قبل توقيع العقد.",
    ],
  },
} as const;

type LegalKey = keyof typeof LEGAL;

/**
 * ============================================================
 * التواصل والتذييل.
 *
 * ما تغيّر:
 *
 * 1. حُذف اختراق الاتجاه. كان الصف الخارجي مضبوطًا على dir="ltr"
 *    ثم يُعاد كل عمود إلى dir="rtl" داخليًا، مع أصناف order للعكس
 *    مرة أخرى. ثلاث طبقات من قلب الاتجاه لتحقيق ترتيب تعطيه شبكة
 *    RTL عادية مجانًا: أول عنصر في الشجرة يقع يمينًا. الصف الآن
 *    RTL كبقية الموقع بلا استثناء، والترتيب هو ترتيب الشجرة.
 *
 * 2. تحقّق فعلي من المدخلات مع رسالة خطأ تحت الحقل. كان الاعتماد
 *    على required وحده، فيعطي المتصفح فقاعة بالإنجليزية أحيانًا،
 *    ولا يفحص أن "وسيلة التواصل" بريد أو رقم فعلًا.
 *
 * 3. الروابط القانونية كانت تشير إلى /privacy و /terms، وهما
 *    مساران غير موجودين في تطبيق صفحة واحدة: نقرة تؤدي إلى صفحة
 *    خطأ. صارت تفتح لوحة داخل الصفحة بنص حقيقي.
 *
 * 4. توحيد تسمية الإجراء. كان الموقع يستعمل ثلاث صيغ لطلب واحد:
 *    "حجز موعد استشاري" في الشريط العلوي، و"إرسال طلب الحجز
 *    الاستشاري" في الزر، و"تواصل معنا" في القائمة. الصيغة الآن
 *    واحدة: "حجز استشارة".
 * ============================================================
 */
export const ContactFooter: React.FC = () => {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [openLegal, setOpenLegal] = useState<LegalKey | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contact: "",
    projectType: PROJECT_TYPES[0],
  });
  const [errors, setErrors] = useState<{ name?: string; contact?: string }>({});
  const tagRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /** يقبل بريدًا إلكترونيًا أو رقم هاتف سعوديًا أو دوليًا. */
  const validate = () => {
    const next: { name?: string; contact?: string } = {};
    if (formData.name.trim().length < 3) {
      next.name = "اكتب اسمًا لا يقل عن ثلاثة أحرف حتى نعرف بمن نتواصل.";
    }
    const contact = formData.contact.trim();
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(contact);
    const isPhone = /^\+?[\d\s()-]{9,}$/.test(contact);
    if (!isEmail && !isPhone) {
      next.contact =
        "أدخل بريدًا إلكترونيًا صحيحًا أو رقم هاتف لا يقل عن تسعة أرقام.";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // لا يوجد خادم خلفي في هذا المشروع (موقع تعريفي ثابت)، لذا فإن
  // "الإرسال" الفعلي الوحيد الممكن دون بنية تحتية إضافية هو فتح
  // تطبيق البريد لدى الزائر برسالة معبّأة موجّهة إلى بريد المكتب،
  // بدل محاكاة محلية تعرض "تم استلام طلبك" دون أن يصل شيء لأحد.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const subject = `طلب استشارة أولى: ${formData.projectType}`;
    const body = [
      `الاسم: ${formData.name}`,
      `وسيلة التواصل: ${formData.contact}`,
      `طبيعة المشروع: ${formData.projectType}`,
    ].join("\n");

    window.location.href = `mailto:${INQUIRY_EMAIL}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(body)}`;

    setIsSubmitted(true);
  };

  // تنقل بالأسهم بين خيارات "طبيعة المشروع"، مطابق لسلوك
  // role="radiogroup" القياسي الذي تتوقعه قارئات الشاشة.
  const handleTagKeyDown = (e: React.KeyboardEvent, idx: number) => {
    let nextIdx: number | null = null;
    if (e.key === "ArrowRight") nextIdx = (idx + 1) % PROJECT_TYPES.length;
    if (e.key === "ArrowLeft")
      nextIdx = (idx - 1 + PROJECT_TYPES.length) % PROJECT_TYPES.length;
    if (nextIdx !== null) {
      e.preventDefault();
      setFormData((prev) => ({
        ...prev,
        projectType: PROJECT_TYPES[nextIdx!],
      }));
      tagRefs.current[nextIdx]?.focus();
    }
  };

  const fieldClass = (hasError: boolean) =>
    `w-full rounded-none border-0 border-b bg-transparent px-0 py-2.5 text-sm text-[var(--color-office-ink)] transition-[border-color] duration-200 ease-[var(--ease-out)] placeholder-[var(--color-office-ink)]/30 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-office-gold)] ${
      hasError
        ? "border-[#D4736A] focus:border-[#D4736A]"
        : "border-[var(--color-office-ink)]/20 focus:border-[var(--color-office-gold)]"
    }`;

  return (
    <footer
      id="contact-section"
      className="relative w-full px-5 py-12 text-[var(--color-office-ink)] sm:px-8 sm:py-16 md:px-12"
    >
      <div className="relative mx-auto max-w-7xl">
        {/* شبكة RTL عادية: أول عنصر في الشجرة يقع يمينًا. */}
        <div className="grid grid-cols-1 items-stretch gap-10 lg:grid-cols-12 lg:gap-16">
          {/* ——— السرد ———
              بلا حدود أو تعبئة عمدًا: امتداد مفتوح لبقية الصفحة بدل
              صندوق ثانٍ، ليكون التباين بين "اقرأ هذا" و"تصرّف هنا"
              تباينًا هيكليًا لا مجرد اختلاف عرض عمودين متشابهين. */}
          <div className="flex flex-col justify-center text-right lg:col-span-7">
            <SectionEyebrow>تواصل معنا</SectionEyebrow>

            <h2 className="mt-5 max-w-xl text-3xl leading-[1.4] font-normal text-[var(--color-office-ink)] sm:text-4xl md:text-5xl md:leading-[1.35]">
              <RevealWords text="نرحب بمناقشة مشروعك القادم، بجلسة أولى لدراسة إمكانات الحيز." />
            </h2>

            <DrawLine className="mt-6 w-24" delay={0.25} />

            <Reveal delay={0.12}>
              <p className="mt-6 mb-10 max-w-lg text-sm leading-[1.9] font-light text-[var(--color-office-ink)]/60 sm:text-base">
                الجلسة الأولى غير مُلزمة، ونستخدمها لفهم طبيعة المساحة وطموح
                المشروع قبل أي التزام تعاقدي.
              </p>
            </Reveal>

            <ul className="space-y-4 text-sm font-light text-[var(--color-office-ink)]/80 sm:space-y-5">
              <Reveal as="li" delay={0.16} className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-field)] border border-[var(--color-office-ink)]/10 bg-[var(--color-office-ink)]/5 text-[var(--color-office-gold)] sm:h-10 sm:w-10">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <span className="block">
                  <span className="block text-xs font-normal text-[var(--color-office-ink)] sm:text-sm">
                    الرياض، حي الملقا، المملكة العربية السعودية
                  </span>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      MAP_QUERY,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-[var(--color-office-gold)] hover:underline"
                  >
                    فتح الموقع في خرائط جوجل
                  </a>
                </span>
              </Reveal>

              <Reveal as="li" delay={0.2} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-field)] border border-[var(--color-office-ink)]/10 bg-[var(--color-office-ink)]/5 text-[var(--color-office-gold)] sm:h-10 sm:w-10">
                  <EnvelopeSimple className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <a
                  href={`mailto:${INQUIRY_EMAIL}`}
                  dir="ltr"
                  className="text-xs text-[var(--color-office-gold)] hover:underline sm:text-sm"
                >
                  {INQUIRY_EMAIL}
                </a>
              </Reveal>

              <Reveal as="li" delay={0.24} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-field)] border border-[var(--color-office-ink)]/10 bg-[var(--color-office-ink)]/5 text-[var(--color-office-gold)] sm:h-10 sm:w-10">
                  <Phone className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                {/* رقم الهاتف يبقى بالأرقام اللاتينية عمدًا: هو رقم
                    يُطلب ويُنسخ، لا رقم يُقرأ. */}
                <a
                  href="tel:+966114800000"
                  dir="ltr"
                  className="text-xs text-[var(--color-office-ink)]/70 transition-colors hover:text-[var(--color-office-gold)] sm:text-sm"
                >
                  +966 11 480 0000
                </a>
              </Reveal>

              <Reveal as="li" delay={0.28} className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-field)] border border-[var(--color-office-ink)]/10 bg-[var(--color-office-ink)]/5 text-[var(--color-office-gold)] sm:h-10 sm:w-10">
                  <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                </span>
                <span className="text-xs text-[var(--color-office-ink)]/60 sm:text-sm">
                  الأحد إلى الخميس، 9:00 صباحًا حتى 5:00 مساءً (بموعد مسبق)
                </span>
              </Reveal>
            </ul>
          </div>

          {/* ——— النموذج ———
              العنصر الوحيد في القسم الذي يأخذ سطحًا محددًا، فيُقرأ
              كأداة تفاعلية مستقلة لا كعمود جدولي. */}
          <Reveal
            delay={0.1}
            className="flex flex-col justify-center lg:col-span-5"
          >
            <div className="bezel">
              <div className="bezel-core p-6 text-right sm:p-8">
                {isSubmitted ? (
                  <div
                    role="status"
                    aria-live="polite"
                    className="animate-gentle-reveal flex flex-col items-center justify-center space-y-3 py-6 text-center"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-office-gold)]/40 bg-[var(--color-office-gold)]/10 text-[var(--color-office-gold)]">
                      <CheckCircle className="h-6 w-6" />
                    </span>
                    <h3 className="text-lg font-normal text-[var(--color-office-ink)]">
                      رسالتك جاهزة للإرسال
                    </h3>
                    <p className="max-w-sm text-xs leading-relaxed text-[var(--color-office-ink)]/70">
                      شكرًا لك {formData.name}، فتحنا تطبيق البريد لديك برسالة
                      معبّأة بتفاصيل مشروعك ({formData.projectType}). أكمل
                      إرسالها وسيتواصل معك أحد مهندسينا خلال يوم عمل واحد.
                    </p>
                    <button
                      onClick={() => {
                        setIsSubmitted(false);
                        setErrors({});
                        setFormData({
                          name: "",
                          contact: "",
                          projectType: PROJECT_TYPES[0],
                        });
                      }}
                      className="cursor-pointer pt-1 text-xs text-[var(--color-office-gold)] hover:underline"
                    >
                      إرسال طلب آخر
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-6"
                  >
                    <div>
                      <span className="mb-1 block text-xs font-medium tracking-wider text-[var(--color-office-gold)]">
                        حجز استشارة
                      </span>
                      <span className="block text-[11px] text-[var(--color-office-ink)]/50">
                        نرد خلال يوم عمل واحد
                      </span>
                    </div>

                    {/* كل حقل بعرض كامل وسطر مستقل: لا شبكة فرعية داخل
                        النموذج تتنافس مع شبكة القسم الخارجية. */}
                    <div>
                      <label
                        htmlFor="client-name"
                        className="mb-2 block text-xs font-normal text-[var(--color-office-ink)]/60"
                      >
                        الاسم الكريم *
                      </label>
                      <input
                        id="client-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (errors.name)
                            setErrors({ ...errors, name: undefined });
                        }}
                        aria-invalid={Boolean(errors.name)}
                        aria-describedby={
                          errors.name ? "client-name-error" : undefined
                        }
                        placeholder="الاسم الثلاثي أو اللقب"
                        className={fieldClass(Boolean(errors.name))}
                      />
                      {errors.name && (
                        <p
                          id="client-name-error"
                          className="mt-2 text-[11px] text-[#D4736A]"
                        >
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="client-contact"
                        className="mb-2 block text-xs font-normal text-[var(--color-office-ink)]/60"
                      >
                        رقم الهاتف أو البريد الإلكتروني *
                      </label>
                      {/* dir="ltr" مع محاذاة يمين: القيمة تُكتب بترتيب
                          لاتيني صحيح، وتبقى ملاصقة لبداية السطر في
                          نموذج عربي. */}
                      <input
                        id="client-contact"
                        type="text"
                        dir="ltr"
                        value={formData.contact}
                        onChange={(e) => {
                          setFormData({ ...formData, contact: e.target.value });
                          if (errors.contact)
                            setErrors({ ...errors, contact: undefined });
                        }}
                        aria-invalid={Boolean(errors.contact)}
                        aria-describedby={
                          errors.contact ? "client-contact-error" : undefined
                        }
                        placeholder="05XXXXXXXX أو البريد الإلكتروني"
                        className={`${fieldClass(Boolean(errors.contact))} text-right`}
                      />
                      {errors.contact && (
                        <p
                          id="client-contact-error"
                          className="mt-2 text-[11px] text-[#D4736A]"
                        >
                          {errors.contact}
                        </p>
                      )}
                    </div>

                    <div>
                      <span className="mb-2.5 block text-xs font-normal text-[var(--color-office-ink)]/60">
                        طبيعة المشروع
                      </span>
                      {/* شبكة ثابتة العرض بدل flex-wrap: كل الأزرار
                          بنفس العرض، فلا يبقى زر معزولًا في صف مستقل. */}
                      <div
                        className="grid grid-cols-2 gap-2 sm:grid-cols-3"
                        role="radiogroup"
                        aria-label="طبيعة المشروع"
                      >
                        {PROJECT_TYPES.map((type, idx) => {
                          const active = formData.projectType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              role="radio"
                              aria-checked={active}
                              tabIndex={active ? 0 : -1}
                              ref={(el) => {
                                tagRefs.current[idx] = el;
                              }}
                              onClick={() =>
                                setFormData({ ...formData, projectType: type })
                              }
                              onKeyDown={(e) => handleTagKeyDown(e, idx)}
                              className={`w-full cursor-pointer rounded-[var(--radius-field)] border px-3 py-2 text-center text-xs leading-snug transition-[color,border-color,background-color,transform] duration-200 ease-[var(--ease-out)] hover:scale-[1.03] active:scale-[0.97] ${
                                active
                                  ? "border-[var(--color-office-gold)] bg-[var(--color-office-gold)]/10 text-[var(--color-office-gold)]"
                                  : "border-[var(--color-office-ink)]/15 text-[var(--color-office-ink)]/60 hover:border-[var(--color-office-ink)]/35 hover:text-[var(--color-office-ink)]/85"
                              }`}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      id="submit-inquiry-btn"
                      type="submit"
                      className="group flex w-full cursor-pointer items-center justify-center gap-2 rounded-[var(--radius-field)] bg-[var(--color-office-gold)] py-3 text-sm font-medium text-[var(--color-office-on-gold)] shadow-lg shadow-[var(--color-office-gold)]/10 transition-[filter,transform] duration-200 ease-[var(--ease-out)] hover:scale-[1.015] hover:brightness-110 active:scale-[0.98]"
                    >
                      <span>حجز استشارة</span>
                      <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-200 ease-[var(--ease-out)] group-hover:-translate-x-0.5" />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        {/* ——— شريط التوقيع ——— */}
        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-[var(--color-office-ink)]/10 pt-6 text-[11px] font-light text-[var(--color-office-ink)]/50 sm:mt-20 sm:flex-row">
          <nav
            aria-label="روابط قانونية"
            className="order-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:order-1"
          >
            <span>
              مكتب المعماري للتصميم الداخلي © {ar(new Date().getFullYear())}
            </span>
            <span
              aria-hidden="true"
              className="h-3 w-px bg-[var(--color-office-ink)]/15"
            />
            <button
              onClick={() => setOpenLegal("privacy")}
              className="cursor-pointer transition-colors duration-200 hover:text-[var(--color-office-gold)]"
            >
              سياسة الخصوصية
            </button>
            <button
              onClick={() => setOpenLegal("terms")}
              className="cursor-pointer transition-colors duration-200 hover:text-[var(--color-office-gold)]"
            >
              شروط الاستخدام
            </button>
            <span className="tabular text-[var(--color-office-ink)]/30">
              س.ت 1010472931
            </span>
          </nav>

          <button
            id="footer-scroll-top-btn"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group order-1 flex cursor-pointer items-center gap-1.5 text-[var(--color-office-gold)] transition-[filter,transform] duration-200 ease-[var(--ease-out)] hover:scale-[1.04] hover:brightness-110 active:scale-[0.97] sm:order-2"
            aria-label="العودة لأعلى الصفحة"
          >
            <span>العودة للأعلى</span>
            <ArrowUp className="h-3 w-3 transition-transform duration-200 ease-[var(--ease-out)] group-hover:-translate-y-0.5" />
          </button>
        </div>
      </div>

      <LegalPanel activeKey={openLegal} onClose={() => setOpenLegal(null)} />
    </footer>
  );
};

/* ============================================================ */

/**
 * لوحة النصوص القانونية.
 *
 * تُفتح داخل الصفحة بدل التنقّل إلى مسار غير موجود. تنزلق من
 * الأسفل على الموبايل ومن جهة البداية على الشاشات الأوسع، وتخرج
 * من حيث دخلت: المسار المتماثل هو ما يجعل الإغلاق مفهومًا.
 */
const LegalPanel: React.FC<{
  activeKey: LegalKey | null;
  onClose: () => void;
}> = ({ activeKey, onClose }) => {
  const reduceMotion = useReducedMotion();
  const closeRef = useRef<HTMLButtonElement>(null);
  const open = activeKey !== null;

  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    html.classList.add("scroll-locked");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const t = window.setTimeout(() => closeRef.current?.focus(), 80);
    return () => {
      html.classList.remove("scroll-locked");
      window.removeEventListener("keydown", onKey);
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && activeKey && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={LEGAL[activeKey].title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
          onClick={onClose}
          className="fixed inset-0 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6"
          style={{ zIndex: "var(--z-overlay)" }}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={
              reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }
            }
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            className="bezel w-full max-w-xl"
          >
            <div className="bezel-core slim-scroll max-h-[80dvh] overflow-y-auto p-6 text-right sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-4">
                <h3 className="text-lg font-normal text-[var(--color-office-ink)]">
                  {LEGAL[activeKey].title}
                </h3>
                <button
                  ref={closeRef}
                  onClick={onClose}
                  aria-label="إغلاق"
                  className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-[var(--color-office-line)] text-[var(--color-office-muted)] transition-[border-color,color,transform] duration-200 hover:scale-110 hover:border-[var(--color-office-gold)]/45 hover:text-[var(--color-office-ink)]"
                >
                  <X className="h-3.5 w-3.5" weight="bold" />
                </button>
              </div>

              {/* space-y-5 يطابق تباعد الفقرات السردية في قسم "من
                  نحن" — نفس نوع المحتوى (فقرة تتبعها فقرة) يستحق
                  نفس الإيقاع في كل الموقع. */}
              <div className="space-y-5 text-sm leading-[1.95] font-light text-[var(--color-office-muted)]">
                {LEGAL[activeKey].body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)}>{paragraph}</p>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
