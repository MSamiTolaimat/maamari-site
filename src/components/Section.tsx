import React from "react";
import { Reveal, RevealWords, DrawLine } from "./Reveal";

/**
 * ============================================================
 * الغلاف الموحّد للأقسام + ترويسة القسم.
 *
 * مراجعة هذه النسخة:
 *
 * 1. لا خلفية ولا حدّ علوي. الخلفية والإضاءة صارتا طبقة واحدة
 *    ثابتة خلف الصفحة كلها (SiteAtmosphere)، فاختفت الخطوط
 *    الفاصلة بين الأقسام واختفى معها الإحساس بأن الصفحة مكوّنة
 *    من ألواح مركّبة. الفصل الآن بالمسافة وحدها.
 *
 * 2. الوسم العلوي صار إلزاميًا لا استثنائيًا. كان في ثلاثة أقسام
 *    من تسعة، فبدت الأقسام الأخرى ناقصة ترويسة. القاعدة الآن:
 *    كل قسم يحمل اسمه فوق عنوانه، بنفس الشكل وبنفس الموضع.
 * ============================================================
 */

interface SectionShellProps {
  id: string;
  children: React.ReactNode;
  /** يجعل القسم يملأ شاشة كاملة على الشاشات الواسعة. */
  fullHeight?: boolean;
  className?: string;
}

export const SectionShell: React.FC<SectionShellProps> = ({
  id,
  children,
  fullHeight = false,
  className = "",
}) => (
  <section
    id={id}
    className={`relative px-5 sm:px-8 md:px-12 ${
      // الحشو الرأسي لأقسام الشاشة الكاملة كان py-20 lg:py-24 مقابل
      // py-24 sm:py-32 للأقسام العادية — فجوة 32px عند نقطة كسر lg
      // تُحسّ عند الانتقال بين قسمين متجاورين مختلفي الإيقاع. رفعناه
      // درجة (lg:py-28) ليقترب من إيقاع الأقسام العادية دون أن يلغي
      // اعتماد هذه الأقسام على التوسيط الرأسي (min-h-dvh) بدل الحشو
      // وحده لخلق التوازن.
      fullHeight
        ? "flex flex-col justify-center py-12 sm:py-16 lg:py-20"
        : "py-12 sm:py-16"
    } ${className}`}
  >
    <div className="relative mx-auto w-full max-w-7xl">{children}</div>
  </section>
);

interface SectionHeadingProps {
  /** اسم القسم. إلزامي: كل قسم يحمل اسمه فوق عنوانه. */
  eyebrow: string;
  title: string;
  lead?: string;
  /** ترويسة مضغوطة للأقسام التي تملأ شاشة واحدة. */
  compact?: boolean;
  className?: string;
}

export const SectionEyebrow: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <Reveal y={10}>
    <span className="flex items-center gap-3">
      <span className="h-px w-8 bg-[var(--color-office-gold)]" />
      <span className="text-[10px] font-medium tracking-[0.22em] text-[var(--color-office-gold)]">
        {children}
      </span>
    </span>
  </Reveal>
);

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  lead,
  compact = false,
  className = "",
}) => (
  <div
    className={`${compact ? "mb-8" : "mb-12 sm:mb-16"} max-w-3xl ${className}`}
  >
    <SectionEyebrow>{eyebrow}</SectionEyebrow>

    <h2
      className={`mt-5 font-normal text-[var(--color-office-ink)] ${
        compact
          ? "text-2xl leading-[1.4] sm:text-3xl md:text-4xl"
          : "text-3xl leading-[1.4] sm:text-4xl md:text-5xl md:leading-[1.35]"
      }`}
    >
      <RevealWords text={title} />
    </h2>

    <DrawLine className={`${compact ? "mt-5" : "mt-6"} w-24`} delay={0.25} />

    {lead && (
      <Reveal delay={0.12}>
        <p
          className={`mt-6 max-w-[62ch] font-light text-[var(--color-office-muted)] ${
            compact ? "text-sm leading-[1.85]" : "text-base leading-[1.9]"
          }`}
        >
          {lead}
        </p>
      </Reveal>
    )}
  </div>
);
