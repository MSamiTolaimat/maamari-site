import React, { useEffect, useState, useCallback, useRef } from 'react';
import { ArrowUp } from '@phosphor-icons/react';
import { useScroll, useMotionValueEvent } from 'motion/react';
import { ar as toArabic } from '../lib/numerals';

interface PreloaderProps {
  onComplete?: () => void;
  onStartReveal?: () => void;
  onRevealProgress?: (ratio: number) => void;
}

const INTRO_SESSION_KEY = 'samt-intro-seen';

export const Preloader: React.FC<PreloaderProps> = ({ onComplete, onStartReveal, onRevealProgress }) => {
  const [scrollY, setScrollY] = useState(0);
  const [windowHeight, setWindowHeight] = useState(800);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [showVeil, setShowVeil] = useState(false);
  const [veilOpacity, setVeilOpacity] = useState(0);

  // إذا كانت المقدمة قد عُرضت من قبل في نفس الجلسة، نتخطاها بالكامل دون أي أنيميشن
  const [skipIntro] = useState(() => {
    try {
      return sessionStorage.getItem(INTRO_SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    // Reduced motion check
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(motionQuery.matches);
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    motionQuery.addEventListener('change', handleMotionChange);

    // Ensure clean start from the top on page load/reload
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    setWindowHeight(window.innerHeight);

    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // تتبّع التمرير عبر useScroll (Motion) بدل window.addEventListener('scroll')
  // الخام — يعتمد على مستمع passive مُحسَّن ومُجمَّع (batched) على الإطار
  // بشكل مبني داخل المكتبة، بدل جدولة requestAnimationFrame يدويًا.
  const { scrollY: motionScrollY } = useScroll();
  useMotionValueEvent(motionScrollY, 'change', (latest) => {
    setScrollY(latest);
  });

  // Line drawing travel distance: controlled by user scroll (around 320px)
  const lineTravel = Math.max(320, Math.round(windowHeight * 0.40));

  // Current line ratio based on user scrolling down/up
  const scrollLineRatio = Math.min(1, Math.max(0, scrollY / lineTravel));

  const [forcedLineRatio, setForcedLineRatio] = useState<number | null>(null);
  const lineDrawRatio = forcedLineRatio !== null ? forcedLineRatio : scrollLineRatio;

  // Split ratio for the doors aperture (0 to 1)
  const [splitRatio, setSplitRatio] = useState(0);
  const [isFullyOpen, setIsFullyOpen] = useState(false);

  const autoOpeningStartedRef = useRef(false);
  const animationFrameRef = useRef<number | null>(null);

  const markIntroSeen = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, '1');
    } catch {
      /* لا شيء — بعض المتصفحات تمنع sessionStorage في وضع التصفح الخاص، نتجاهل بصمت */
    }
  }, []);

  // تخطٍ فوري وصامت للمقدمة عند التكرار في نفس الجلسة (بدون أنيميشن أو توهج)
  useEffect(() => {
    if (skipIntro) {
      autoOpeningStartedRef.current = true;
      setSplitRatio(1);
      setIsFullyOpen(true);
      if (onStartReveal) onStartReveal();
      if (onRevealProgress) onRevealProgress(1);
      if (onComplete) onComplete();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipIntro]);

  // Trigger smooth automatic gradual opening once line is fully completed
  const startAutoOpen = useCallback(() => {
    if (autoOpeningStartedRef.current) return;
    autoOpeningStartedRef.current = true;
    setForcedLineRatio(1);

    // تثبيت scrollY فورًا على نقطة اكتمال الخط قبل أي شيء آخر (يشمل مسار
    // "تقليل الحركة" أيضًا): مع نزلة قوية قد يكون scrollY الحقيقي قد تجاوز
    // lineTravel بالفعل قبل وصول التنفيذ إلى هنا (الزخم فوري من المتصفح،
    // بينما اكتشاف اكتمال الخط يمرّ عبر دورة React). المقدمة معتمة بالكامل
    // الآن فلا يرى الزائر هذه القفزة — بلا حركة سلسة، تصحيح فوري فقط.
    if (Math.round(window.scrollY) !== lineTravel) {
      window.scrollTo({ top: lineTravel, behavior: 'auto' });
    }

    if (isReducedMotion) {
      setSplitRatio(1);
      setIsFullyOpen(true);
      if (onStartReveal) onStartReveal();
      if (onRevealProgress) onRevealProgress(1);
      if (onComplete) onComplete();
      markIntroSeen();

      // حتى مع تفعيل "تقليل الحركة"، نطبّق تلاشيًا لونيًا بسيطًا بدل القطع الفوري
      // (بدون أي حركة مكانية كبيرة، احترامًا لتفضيل المستخدم)
      setShowVeil(true);
      setVeilOpacity(1);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setVeilOpacity(0));
      });
      window.setTimeout(() => setShowVeil(false), 400);
      return;
    }

    // قفل تمرير الصفحة بالكامل أثناء تشغيل حركة فتح الأبواب الآلية
    // (تمنع "تجاوز" المستخدم للمسافة المتوقعة إذا استمر بالتمرير بسرعة أثناء المشهد،
    // بعد أن ثُبّت scrollY أعلاه على نقطة البداية الصحيحة)
    const previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const startTime = performance.now();
    const DURATION = 550; // ms: a brief architectural beat, not a forced pause
    let revealFired = false;

    const easeInOutCubic = (t: number) =>
      t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / DURATION);
      const eased = easeInOutCubic(t);
      setSplitRatio(eased);
      if (onRevealProgress) onRevealProgress(eased);

      // Trigger the hero entrance motion when the doors have parted by 25%
      // (~360px center opening), so the user visibly watches the elements ascend and scale!
      if (eased >= 0.25 && !revealFired) {
        revealFired = true;
        if (onStartReveal) onStartReveal();
      }

      if (t < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setSplitRatio(1);
        setIsFullyOpen(true);
        if (!revealFired) {
          revealFired = true;
          if (onStartReveal) onStartReveal();
        }
        if (onRevealProgress) onRevealProgress(1);
        if (onComplete) onComplete();
        markIntroSeen();

        // فكّ قفل التمرير — الموقع الحقيقي الآن يستجيب للتمرير بشكل طبيعي
        document.body.style.overflow = previousBodyOverflow;

        // انتقال خفيف: توهج ذهبي يظهر لحظة اكتمال الفتح ثم يتلاشى بنعومة
        setShowVeil(true);
        setVeilOpacity(1);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => setVeilOpacity(0));
        });
        window.setTimeout(() => setShowVeil(false), 750);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isReducedMotion, onComplete, onStartReveal, onRevealProgress, markIntroSeen, lineTravel]);

  // When user scrolls and the line reaches 100% completion, open automatically!
  useEffect(() => {
    if (scrollLineRatio >= 1 && !autoOpeningStartedRef.current) {
      startAutoOpen();
    }
  }, [scrollLineRatio, startAutoOpen]);

  // Clean up RAF on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const apertureWidthVw = splitRatio * 100; // 0vw to 100vw
  const halfApertureVw = apertureWidthVw / 2; // 0vw to 50vw

  // Prompt cue visibility: visible while doors are closed
  const cueOpacity = splitRatio === 0 ? 1 : 0;

  // Click handler on prompt or line to open smoothly
  const handleTriggerOpen = useCallback(() => {
    if (autoOpeningStartedRef.current) return;

    window.scrollTo({
      top: lineTravel,
      behavior: 'smooth',
    });

    const startRatio = lineDrawRatio;
    const animStart = performance.now();
    const LINE_ANIM_DURATION = 350;

    const animateLine = (now: number) => {
      if (autoOpeningStartedRef.current) return;
      const progress = Math.min(1, (now - animStart) / LINE_ANIM_DURATION);
      const current = startRatio + (1 - startRatio) * progress;
      setForcedLineRatio(current);

      if (progress < 1) {
        requestAnimationFrame(animateLine);
      } else {
        startAutoOpen();
      }
    };

    requestAnimationFrame(animateLine);
  }, [lineTravel, lineDrawRatio, startAutoOpen]);

  return (
    <>
      {showVeil && (
        <div
          className="pointer-events-none fixed inset-0"
          style={{
            zIndex: 'calc(var(--z-intro) + 4)',
            background:
              'radial-gradient(circle at center, rgba(226,199,125,0.35), rgba(10,21,38,0) 70%)',
            opacity: veilOpacity,
            transition: 'opacity 0.7s ease-out',
          }}
        />
      )}
      <div
      id="preloader-overlay"
      className={`fixed inset-0 select-none overflow-hidden transition-opacity duration-500 ${
        isFullyOpen ? 'pointer-events-none opacity-0 invisible' : 'opacity-100 visible'
      }`}
      style={{
        opacity: isFullyOpen ? 0 : 1,
        zIndex: 'var(--z-intro)',
      }}
      aria-hidden={isFullyOpen}
    >
      {/* Background backing sheet ensuring ZERO see-through to underlying pages before split */}
      {splitRatio === 0 && (
        <div className="pointer-events-none absolute inset-0 bg-[var(--color-office-bg)]" />
      )}

      {/* ============================================================ */}
      {/* Left Door Panel: Retracts to the left once split starts      */}
      {/* Background curtain door panel                                */}
      {/* ============================================================ */}
      <div
        id="preloader-panel-left"
        className="fixed top-0 bottom-0 left-0 overflow-hidden bg-[var(--color-office-bg)] will-change-[width]"
        style={{
          zIndex: 'var(--z-intro)',
          width: isReducedMotion ? '50%' : `calc(50% - ${halfApertureVw}vw)`,
          borderRight: splitRatio > 0 ? '2px solid var(--color-office-gold)' : 'none',
          boxShadow: splitRatio > 0 ? '0 0 25px rgba(201, 161, 59, 0.4)' : 'none',
        }}
      >
        <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" />

        {/* Technical axis tick marks on the inner edge */}
        <div
          className="absolute top-10 right-2 text-[9px] text-[var(--color-office-gold)] transition-opacity duration-150"
          style={{ opacity: lineDrawRatio >= 1 ? (1 - splitRatio * 0.4) : 0 }}
        >
          منسوب 0.00
        </div>
        <div
          className="absolute bottom-10 right-2 text-[9px] text-[var(--color-office-gold)] transition-opacity duration-150"
          style={{ opacity: lineDrawRatio >= 1 ? (1 - splitRatio * 0.4) : 0 }}
        >
          محور غرب
        </div>
      </div>

      {/* ============================================================ */}
      {/* Right Door Panel: Retracts to the right once split starts    */}
      {/* Background curtain door panel                                */}
      {/* ============================================================ */}
      <div
        id="preloader-panel-right"
        className="fixed top-0 bottom-0 right-0 overflow-hidden bg-[var(--color-office-bg)] will-change-[width]"
        style={{
          zIndex: 'var(--z-intro)',
          width: isReducedMotion ? '50%' : `calc(50% - ${halfApertureVw}vw)`,
          borderLeft: splitRatio > 0 ? '2px solid var(--color-office-gold)' : 'none',
          boxShadow: splitRatio > 0 ? '0 0 25px rgba(201, 161, 59, 0.4)' : 'none',
        }}
      >
        <div className="absolute inset-0 blueprint-grid opacity-20 pointer-events-none" />

        {/* Technical axis tick marks on the inner edge */}
        <div
          className="absolute top-10 left-2 text-[9px] text-[var(--color-office-gold)] transition-opacity duration-150"
          style={{ opacity: lineDrawRatio >= 1 ? (1 - splitRatio * 0.4) : 0 }}
        >
          منسوب 0.00
        </div>
        <div
          className="absolute bottom-10 left-2 text-[9px] text-[var(--color-office-gold)] transition-opacity duration-150"
          style={{ opacity: lineDrawRatio >= 1 ? (1 - splitRatio * 0.4) : 0 }}
        >
          محور شرق
        </div>
      </div>

      {/* ============================================================ */}
      {/* Phase 1: Straight Vertical Line linked to Scroll Down/Up      */}
      {/* Appears from the vertical center and expands in both         */}
      {/* directions (up and down) as user scrolls down.               */}
      {/* Retracts back to the center as user scrolls up.              */}
      {/* ============================================================ */}
      {splitRatio === 0 && lineDrawRatio > 0 && (
        <div
          id="center-straight-line"
          onClick={handleTriggerOpen}
          className="fixed left-1/2 w-[2px] -translate-x-1/2 cursor-pointer will-change-[top,height,opacity]"
          title="انقر لفتح الفراغ"
          style={{
            zIndex: 'calc(var(--z-intro) + 2)',
            top: `${(1 - lineDrawRatio) * 50}vh`,
            height: `${lineDrawRatio * 100}vh`,
            opacity: lineDrawRatio > 0.01 ? 1 : 0,
            background: 'linear-gradient(to bottom, rgba(201, 161, 59, 0.3), #e2c77d 25%, #ffffff 50%, #e2c77d 75%, rgba(201, 161, 59, 0.3))',
            boxShadow: '0 0 18px rgba(201, 161, 59, 0.85)',
          }}
        >
          {/* Top expanding lead tip */}
          {lineDrawRatio > 0.05 && lineDrawRatio < 0.98 && (
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full border border-[var(--color-office-gold)] flex items-center justify-center bg-[var(--color-office-bg)] shadow-sm shadow-[var(--color-office-gold)]"
              style={{
                transform: `translate(-50%, -50%) scale(${Math.min(1, lineDrawRatio * 2)})`,
              }}
            >
              <div className="w-1 h-1 rounded-full bg-[#e2c77d]" />
            </div>
          )}

          {/* Central architectural origin indicator (slender and non-intrusive) */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full border border-[var(--color-office-gold)] flex items-center justify-center bg-[var(--color-office-bg)] shadow-sm shadow-[var(--color-office-gold)]/60"
            style={{
              transform: `translate(-50%, -50%) scale(${Math.min(1, lineDrawRatio * 2)})`,
              opacity: Math.min(1, lineDrawRatio * 2),
            }}
          >
            <div className="w-1 h-1 rounded-full bg-[var(--color-office-gold)]" />
          </div>

          {/* Bottom expanding lead tip */}
          {lineDrawRatio > 0.05 && lineDrawRatio < 0.98 && (
            <div
              className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3 h-3 rounded-full border border-[var(--color-office-gold)] flex items-center justify-center bg-[var(--color-office-bg)] shadow-sm shadow-[var(--color-office-gold)]"
              style={{
                transform: `translate(-50%, 50%) scale(${Math.min(1, lineDrawRatio * 2)})`,
              }}
            >
              <div className="w-1 h-1 rounded-full bg-[#e2c77d]" />
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* Phase 2: Widening Aperture & Architectural Framing            */}
      {/* Once line is complete, it splits apart revealing background  */}
      {/* ============================================================ */}
      {splitRatio > 0.01 && splitRatio < 0.99 && (
        <>
          {/* Inward subtle gold atmosphere in the widening aperture */}
          <div
            className="pointer-events-none fixed top-0 bottom-0 left-1/2 -translate-x-1/2 will-change-[width]"
            style={{
              zIndex: 'calc(var(--z-intro) + 1)',
              width: `${apertureWidthVw}vw`,
              boxShadow: 'inset 0 0 40px rgba(201, 161, 59, 0.25)',
            }}
          />

          {/* Top Architectural Dimension Ruler */}
          <div
            className="pointer-events-none fixed top-8 left-1/2 flex -translate-x-1/2 items-center justify-between px-3 text-[10px] tracking-wider text-[var(--color-office-gold)] will-change-[width]"
            style={{ zIndex: 'calc(var(--z-intro) + 2)', width: `${apertureWidthVw}vw` }}
          >
            <span className="font-bold text-[var(--color-office-gold)]">|◀</span>
            <span className="bg-[var(--color-office-bg)]/85 px-2.5 py-0.5 rounded border border-[var(--color-office-gold)]/40 shadow-sm">
              {toArabic(Math.round(apertureWidthVw))}% من العرض
            </span>
            <span className="text-[var(--color-office-gold)] font-bold">▶|</span>
          </div>

          {/* Bottom Architectural Axis Tag */}
          <div
            className="pointer-events-none fixed bottom-8 left-1/2 flex -translate-x-1/2 items-center justify-between px-3 text-[9px] text-[var(--color-office-gold)]/80 will-change-[width]"
            style={{ zIndex: 'calc(var(--z-intro) + 2)', width: `${apertureWidthVw}vw` }}
          >
            <span>غرب</span>
            <span className="text-[9px] tracking-[0.12em] text-[var(--color-office-ink)]/50">
              مكتب المعماري
            </span>
            <span>شرق</span>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* Studio Branding & Content (Single unified screen)             */}
      {/* Kept 100% solid, fully readable, unclipped throughout the     */}
      {/* line drawing. Once the aperture starts splitting (splitRatio>0)*/}
      {/* it smoothly fades out as the background is revealed.          */}
      {/* ============================================================ */}
      {splitRatio < 0.95 && (
        <div
          id="preloader-content-layer"
          className="pointer-events-none fixed inset-0 flex flex-col items-center justify-between px-6 py-12 will-change-[opacity]"
          style={{
            zIndex: 'calc(var(--z-intro) + 3)',
            opacity: splitRatio === 0 ? 1 : Math.max(0, 1 - splitRatio * 2.5),
          }}
        >
          {/* Top studio meta */}
          <div className="flex items-center gap-2 text-xs tracking-wider text-[var(--color-office-ink)]/50">
            <span>مكتب المعماري</span>
            <span className="inline-block w-px h-3 bg-[var(--color-office-ink)]/15" />
            <span>2026</span>
          </div>

          {/* Center Studio Identity */}
          <div className="relative my-auto flex w-full max-w-sm flex-col items-center justify-center text-center">
            {/*
              العنصر الحركي في شاشة المقدمة: حلقتا بوصلة تدوران في
              اتجاهين متعاكسين بسرعتين مختلفتين (48 و72 ثانية
              للدورة) خلف اسم المكتب.

              كانت هناك حلقة ثالثة تنبض وتتّسع حول الشعار، فحُذفت:
              حركتها الدورية (كل 5.5 ثانية) كانت تسحب العين عن
              النص أكثر مما تضيف، وتتنافس مع دورانَي الحلقتين
              البطيئتين بدل أن تكمّلهما.

              البطء مقصود إلى حدّ أن الحركة لا تُلاحظ كحركة: ما
              يُلاحظ أن الشاشة حيّة لا صورة ثابتة معلّقة تنتظر.
              كل شيء على transform و opacity، وخلف النص تمامًا
              فلا ينافسه على القراءة.
            */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 sm:h-72 sm:w-72"
            >
              <div className="animate-slow-spin absolute inset-0">
                <svg viewBox="0 0 200 200" className="h-full w-full">
                  <circle
                    cx="100"
                    cy="100"
                    r="94"
                    fill="none"
                    stroke="var(--color-office-gold)"
                    strokeOpacity="0.16"
                    strokeWidth="0.75"
                    strokeDasharray="2 10"
                  />
                  <circle
                    cx="100"
                    cy="100"
                    r="72"
                    fill="none"
                    stroke="var(--color-office-blue)"
                    strokeOpacity="0.16"
                    strokeWidth="0.75"
                  />
                </svg>
              </div>

              <div className="animate-slow-spin-reverse absolute inset-6">
                <svg viewBox="0 0 200 200" className="h-full w-full">
                  <circle
                    cx="100"
                    cy="100"
                    r="90"
                    fill="none"
                    stroke="var(--color-office-gold)"
                    strokeOpacity="0.2"
                    strokeWidth="0.75"
                    strokeDasharray="30 170"
                  />
                  <rect
                    x="96"
                    y="6"
                    width="8"
                    height="8"
                    fill="var(--color-office-gold)"
                    fillOpacity="0.35"
                  />
                </svg>
              </div>
            </div>

            <span className="relative mb-4 text-xs font-medium tracking-[0.35em] text-[var(--color-office-gold)]">
              هندسة العمارة الداخلية
            </span>

            <h1 className="relative mb-6 text-5xl font-normal tracking-tight text-[var(--color-office-ink)] sm:text-6xl">
              المعماري
            </h1>

            {/* Slender gold line drawing itself horizontally */}
            <div className="relative h-[1.5px] w-48 overflow-hidden rounded-full bg-[var(--color-office-blue)]/30 sm:w-64">
              <div className="h-full bg-gradient-to-r from-[var(--color-office-gold)]/60 via-[#e2c77d] to-[var(--color-office-gold)] animate-draw-line" />
            </div>

            <p className="relative mt-5 text-sm font-light tracking-wide text-[var(--color-office-ink)]/60">
              صياغة الحيز بدقة متناهية
            </p>
          </div>

          {/* Bottom Scroll Prompt */}
          <div
            className="flex flex-col items-center justify-center"
            style={{
              opacity: cueOpacity,
              pointerEvents: cueOpacity > 0.1 ? 'auto' : 'none',
            }}
          >
            <button
              id="intro-scroll-prompt-btn"
              onClick={handleTriggerOpen}
              className="flex flex-col items-center gap-2 text-xs text-[var(--color-office-gold)]/90 hover:text-[var(--color-office-gold)] transition-colors cursor-pointer group focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-office-gold)] pointer-events-auto"
              aria-label="ارفع للأعلى أو انقر لفتح الفراغ"
            >
              {/* ثلاث كلمات. النص السابق كان جملة كاملة تشرح
                  الاستعارة ("لرسم المستقيم وفتح الفراغ") في موضع
                  لا يُقرأ فيه إلا الفعل المطلوب. */}
              <span className="text-xs font-normal tracking-widest text-[var(--color-office-ink)]/70 transition-colors group-hover:text-[var(--color-office-ink)]">
                ارفع للأعلى
              </span>

              {/* السهم يشير للأعلى الآن ويقفز قفزة صغيرة. كان يشير
                  للأسفل بينما الحركة المطلوبة على اللمس رفع الإصبع
                  للأعلى، فيتناقض الرمز مع الفعل. */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-office-gold)]/30 transition-[border-color,transform] duration-200 ease-[var(--ease-out)] group-hover:scale-110 group-hover:border-[var(--color-office-gold)]">
                <ArrowUp className="animate-nudge-up h-3.5 w-3.5 text-[var(--color-office-gold)]" />
              </div>
            </button>
          </div>
        </div>
      )}
    </div>
    </>
  );
};
