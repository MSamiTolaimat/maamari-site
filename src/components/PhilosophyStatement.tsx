import React from "react";
import { Reveal, RevealWords } from "./Reveal";

/**
 * ============================================================
 * بيان الفلسفة.
 *
 * هذا هو الموضع الوحيد في الموقع الذي يُسمح فيه بالتوسيط: جملة
 * واحدة هي كل القسم، فالرسالة نفسها هي التصميم.
 *
 * كان هذا القسم يستخدم خط Reem Kufi وحده في الصفحة كلها، فيبدو
 * دخيلًا. الآن صار Reem Kufi خط العناوين في كل قسم (معرَّف مرة
 * واحدة في index.css)، فالجملة هنا امتداد لنظام طباعي قائم لا
 * استثناء منه.
 *
 * الحركة: الجملة تُكشف كلمة كلمة عند دخولها الشاشة. الغرض إيقاع
 * القراءة: جملة بهذا الحجم تُقرأ ببطء، وظهورها دفعة واحدة يجعل
 * العين تقفز إلى آخرها.
 * ============================================================
 */
export const PhilosophyStatement: React.FC = () => (
  <section
    id="philosophy-section"
    className="relative w-full px-6 py-16 text-[var(--color-office-ink)] sm:px-16 sm:py-20"
  >
    <div className="relative mx-auto flex max-w-6xl flex-col items-center justify-center text-center">
      {/* علامة ذهبية مركزية */}
      <Reveal y={10}>
        <div className="mb-10 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-[var(--color-office-gold)]/60" />
          <span className="h-2 w-2 rotate-45 border border-[var(--color-office-gold)]" />
          <span className="h-px w-10 bg-[var(--color-office-gold)]/60" />
        </div>
      </Reveal>

      <blockquote
        id="philosophy-quote"
        className="max-w-5xl text-3xl leading-[1.55] font-normal text-[var(--color-office-ink)] sm:text-5xl sm:leading-[1.5] md:text-6xl lg:text-7xl"
      >
        <RevealWords text="«العمارة الداخلية ليست تأثيثًا للفراغ، بل نحتٌ للسكون والضوء ليصبح المكان امتدادًا لروح من يسكنه.»" />
      </blockquote>

      <Reveal delay={0.4}>
        <div className="mt-12 flex flex-col items-center gap-1">
          <span className="text-sm font-medium tracking-widest text-[var(--color-office-gold)]">
            فلسفة المعماري في السكون الفراغي
          </span>
          <span className="text-xs text-[var(--color-office-ink)]/50">
            مكتب المعماري للعمارة والتصميم الداخلي، الرياض
          </span>
        </div>
      </Reveal>
    </div>
  </section>
);
