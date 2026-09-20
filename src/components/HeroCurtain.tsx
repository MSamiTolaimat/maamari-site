import React from 'react';
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { SmartImage } from './SmartImage';
import { unsplash } from '../data/projects';

interface HeroCurtainProps {
  isRevealed?: boolean;
  isPreloaderDone?: boolean;
  heroExitProgress?: MotionValue<number>;
  trackRef?: React.RefObject<HTMLDivElement>;
}

/**
 * ============================================================
 * الهيرو.
 *
 * ما تغيّر هنا:
 *
 * 1. صورة حقيقية خلف المشهد. كان الهيرو نصًا فوق خلفية سوداء
 *    وهالتي ضوء، وهو ما يجعل أول شاشة في موقع تصميم داخلي خالية
 *    من أي دليل بصري على العمل نفسه. الصورة الآن هي الخلفية،
 *    فوقها حجاب متدرّج يحفظ تباين النص.
 *
 * 2. حذف الشريطين العلوي والسفلي. كانا يحملان "مقياس الرسم
 *    1:50" و"دقة تنفيذية مطلقة" و"اسحب للأعلى لاستكشاف المكتب".
 *    ثلاث مشكلات: أرقام لاتينية وسط صفحة عربية، ونص زخرفي لا
 *    يضيف معلومة، وتعليمة تمرير متناقضة (تقول "اسحب للأعلى"
 *    بينما السهم يشير للأسفل). الهيرو الآن أربعة عناصر فقط:
 *    عنوان، فقرة، زرّان.
 *
 * 3. الحركة: الصورة تتحرك أبطأ من المحتوى عند التمرير (إزاحة
 *    رأسية وتكبير طفيف مشتقان من نفس قيمة heroExitProgress).
 *    فرق السرعة هو ما يعطي عمقًا بين الطبقتين.
 * ============================================================
 */
export const HeroCurtain: React.FC<HeroCurtainProps> = ({
  isRevealed = true,
  isPreloaderDone = false,
  heroExitProgress,
  trackRef,
}) => {
  const reduceMotion = useReducedMotion();
  const localTrackRef = React.useRef<HTMLDivElement>(null);

  // احتياط دفاعي إن استُخدم المكوّن دون تمرير heroExitProgress من الأب.
  const fallbackProgress = useMotionValue(0);
  const progress = heroExitProgress ?? fallbackProgress;

  // حركة خروج واحدة مهيمنة: تلاشٍ وتصغير طفيف. مشتقة مباشرة من
  // motion value عبر useTransform، فتتحدّث على كل إطار تمرير دون
  // setState ودون إعادة رسم React.
  const scrollOpacity = useTransform(progress, (v: number) =>
    reduceMotion ? 1 : Math.max(0, 1 - v * 1.05),
  );
  const scrollScale = useTransform(progress, (v: number) => (reduceMotion ? 1 : 1 - v * 0.06));
  const scrollPointerEvents = useTransform(progress, (v: number) => (v > 0.85 ? 'none' : 'auto'));

  // اختلاف المنظور: الخلفية تصعد 7% فقط بينما يصعد المحتوى كاملًا.
  // سلسلة transform كاملة في قيمة واحدة، لا خصائص y و scale منفصلة:
  // خلط الاثنين في نفس كائن style يجعل إحداهما تلغي الأخرى، كما أن
  // السلسلة الكاملة هي الشكل الذي يسرّعه العتاد فعليًا.
  const bgTransform = useTransform(progress, (v: number) =>
    reduceMotion ? 'translateY(0%) scale(1.06)' : `translateY(${-v * 7}%) scale(${1.06 + v * 0.06})`,
  );

  const frameOpacity = !isPreloaderDone
    ? !isRevealed && !reduceMotion
      ? 0.3
      : 1
    : scrollOpacity;

  const frameScale = !isPreloaderDone ? (!isRevealed && !reduceMotion ? 0.92 : 1) : scrollScale;
  const frameY = !isPreloaderDone && !isRevealed && !reduceMotion ? 40 : 0;
  const frameFilter = !isPreloaderDone && !isRevealed && !reduceMotion ? 'blur(8px)' : 'blur(0px)';
  const framePointerEvents = isPreloaderDone ? scrollPointerEvents : 'auto';

  const frameTransition = reduceMotion
    ? { duration: 0 }
    : !isPreloaderDone
      ? { duration: 1.2, ease: [0.23, 1, 0.32, 1] as const }
      : { duration: 0 };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  /** نمط الظهور المتدرّج للعناصر الثلاثة داخل الهيرو. */
  const entrance = (delay: number) => ({
    opacity: !isRevealed && !reduceMotion ? 0 : 1,
    transform: !isRevealed && !reduceMotion ? 'translateY(32px)' : 'translateY(0)',
    transition: reduceMotion
      ? 'none'
      : `opacity 1.1s var(--ease-out) ${delay}s, transform 1.1s var(--ease-out) ${delay}s`,
  });

  return (
    <div ref={trackRef ?? localTrackRef} id="hero-track" className="relative h-[160dvh] w-full">
      <motion.div
        id="hero-sticky-frame"
        className="sticky top-0 flex h-dvh w-full flex-col items-center justify-center overflow-hidden bg-[var(--color-office-bg)] will-change-[transform,opacity,filter]"
        style={{
          zIndex: 'var(--z-sticky)',
          opacity: frameOpacity,
          scale: frameScale,
          y: frameY,
          filter: frameFilter,
          pointerEvents: framePointerEvents,
        }}
        transition={frameTransition}
      >
        {/* ——— طبقة الصورة ——— */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-0 will-change-transform"
          style={{ transform: bgTransform }}
        >
          <SmartImage
            src={unsplash('1618773928121-c32242e63f39', 2000)}
            alt=""
            priority
          />
        </motion.div>

        {/* حجاب مزدوج: تدرّج رأسي يحفظ قراءة النص، وتعتيم مركزي
            يمنع الصورة من منافسة العنوان. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(180deg, rgba(20,21,22,0.82) 0%, rgba(20,21,22,0.62) 45%, rgba(20,21,22,0.94) 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 45%, rgba(20,21,22,0.55) 0%, rgba(20,21,22,0.2) 45%, transparent 75%)',
          }}
        />

        <div className="blueprint-grid pointer-events-none absolute inset-0 opacity-25" />

        {/* هالتا ضوء محيطيتان تتنفّسان ببطء شديد. */}
        <div
          aria-hidden="true"
          className="animate-ambient pointer-events-none absolute top-1/4 right-1/4 h-96 w-96 rounded-full bg-[var(--color-office-blue)]/12 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="animate-ambient-slow pointer-events-none absolute bottom-1/4 left-1/4 h-80 w-80 rounded-full bg-[var(--color-office-gold)]/10 blur-3xl"
        />

        {/* ——— المحتوى ——— */}
        <div className="relative z-[var(--z-base)] mx-auto flex max-w-5xl flex-col items-center px-6 text-center sm:px-12">
          <h1
            id="hero-main-title"
            className="hero-heading-glow mb-7 text-4xl leading-[1.4] font-normal tracking-tight will-change-[transform,opacity] sm:text-6xl sm:leading-[1.35] md:text-7xl"
            style={entrance(0.15)}
          >
            نَصوغ الفراغ الداخلي
            <br />
            بوقار السكون وفخامة الإتقان
          </h1>

          <p
            id="hero-subtitle"
            className="mb-10 max-w-2xl text-base leading-relaxed font-light text-[var(--color-office-ink)]/80 will-change-[transform,opacity] sm:text-lg"
            style={entrance(0.3)}
          >
            مكتب هندسي استشاري يُكرّس خبرته لعدد محدود من المشاريع النوعية، من فلسفة
            الخط الأول حتى تفاصيل التنفيذ.
          </p>

          <div
            className="flex w-full flex-col items-center gap-4 will-change-[transform,opacity] sm:w-auto sm:flex-row"
            style={entrance(0.45)}
          >
            <button
              id="hero-cta-projects"
              onClick={() => scrollToSection('projects-section')}
              className="w-full cursor-pointer rounded-[var(--radius-field)] bg-[var(--color-office-gold)] px-8 py-4 text-sm font-medium tracking-wide text-[var(--color-office-on-gold)] shadow-lg shadow-[var(--color-office-gold)]/10 transition-[filter,transform] duration-200 ease-[var(--ease-out)] hover:scale-[1.03] hover:brightness-110 active:scale-[0.98] sm:w-auto"
            >
              استعراض الأعمال
            </button>
            <button
              id="hero-cta-workflow"
              onClick={() => scrollToSection('workflow-section')}
              className="w-full cursor-pointer rounded-[var(--radius-field)] border border-[var(--color-office-ink)]/20 bg-[var(--color-office-ink)]/5 px-8 py-4 text-sm font-normal tracking-wide text-[var(--color-office-ink)] backdrop-blur-sm transition-[background-color,border-color,transform] duration-200 ease-[var(--ease-out)] hover:scale-[1.03] hover:border-[var(--color-office-ink)]/35 hover:bg-[var(--color-office-ink)]/10 active:scale-[0.98] sm:w-auto"
            >
              منهجية العمل
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
