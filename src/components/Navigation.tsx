import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from 'motion/react';
import { ArrowDownLeft } from '@phosphor-icons/react';

interface NavigationProps {
  isRevealed?: boolean;
  /** يُخفى الشريط حين تكون صفحة تفاصيل المشروع مفتوحة فوقه. */
  isHidden?: boolean;
}

const NAV_ITEMS = [
  { id: 'about-section', label: 'من نحن' },
  { id: 'workflow-section', label: 'مراحل العمل' },
  { id: 'projects-section', label: 'الأعمال' },
  { id: 'contact-section', label: 'تواصل معنا' },
];

export const Navigation: React.FC<NavigationProps> = ({
  isRevealed = true,
  isHidden = false,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [introOffset, setIntroOffset] = useState(0);
  const reduceMotion = useReducedMotion();

  /* المسافة التي "يستهلكها" المستخدم أثناء رسم الخط في المقدمة قبل أن
     ينفتح الهيرو — نفس معادلة lineTravel في Preloader. بدونها يصبح
     isScrolled صحيحًا فور ظهور الشريط، فلا تُرى حالته الأصلية أبدًا. */
  useEffect(() => {
    const compute = () => setIntroOffset(Math.max(320, Math.round(window.innerHeight * 0.4)));
    compute();
    window.addEventListener('resize', compute, { passive: true });
    return () => window.removeEventListener('resize', compute);
  }, []);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, 'change', (latest) => {
    setIsScrolled(latest - introOffset > 40);
  });

  /* ——— تتبّع القسم النشط ———
     كان الشريط لا يشير إطلاقًا إلى موضع الزائر في الصفحة، فيبقى
     التنقّل عمياء. IntersectionObserver برصد شريط أفقي ضيق في ثلث
     الشاشة العلوي هو الطريقة الصحيحة هنا: لا مستمع تمرير خام، ولا
     حساب مواضع في كل إطار. */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: [0, 0.25, 0.5] },
    );

    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  /* قفل التمرير أثناء فتح قائمة الموبايل — وإلا تحرّكت الصفحة تحت
     القائمة المفتوحة عند السحب. */
  useEffect(() => {
    const html = document.documentElement;
    if (mobileMenuOpen) html.classList.add('scroll-locked');
    else html.classList.remove('scroll-locked');
    return () => html.classList.remove('scroll-locked');
  }, [mobileMenuOpen]);

  /* Escape يغلق قائمة الموبايل. */
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const scrollTo = (id: string) => {
    setMobileMenuOpen(false);
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <>
      <header
        id="main-header"
        className={`fixed inset-x-0 top-0 transition-[background-color,padding,border-color] duration-300 ease-[var(--ease-out)] ${
          isScrolled
            ? 'border-b border-[var(--color-office-line)] bg-[var(--color-office-bg)]/80 py-3 backdrop-blur-xl'
            : 'border-b border-transparent bg-transparent py-5'
        }`}
        style={{
          zIndex: 'var(--z-nav)',
          opacity: !isRevealed || isHidden ? 0 : 1,
          transform: !isRevealed ? 'translateY(-16px)' : 'translateY(0)',
          transition:
            'opacity 0.55s var(--ease-out), transform 1s var(--ease-out) 0.05s, background-color 0.3s var(--ease-out), padding 0.3s var(--ease-out)',
          pointerEvents: isRevealed && !isHidden ? 'auto' : 'none',
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 sm:px-10">
          {/* ——— العلامة ——— */}
          <button
            id="nav-brand-logo"
            onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' })}
            className="group flex shrink-0 cursor-pointer items-baseline gap-2 text-right"
          >
            <span className="text-xl font-light tracking-tight text-[var(--color-office-ink)] sm:text-2xl">
              المعماري
            </span>
            <span className="border-e border-[var(--color-office-gold)]/30 pe-2 text-[10px] font-medium tracking-wide text-[var(--color-office-gold)] sm:text-xs">
              عمارة داخلية
            </span>
          </button>

          {/* ——— روابط سطح المكتب ———
              الرابط النشط يحمل نقطة ذهبية تنتقل فيزيائيًا بين العناصر
              عبر layoutId، فيقرأ الزائر موضعه في الصفحة من الشريط. */}
          <nav
            id="desktop-nav"
            className="hidden items-center gap-1 text-[14px] md:flex"
            aria-label="التنقل الرئيسي"
          >
            {NAV_ITEMS.map((item) => {
              const active = activeId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollTo(item.id)}
                  aria-current={active ? 'true' : undefined}
                  className={`relative cursor-pointer px-3 py-1.5 transition-colors duration-200 ease-[var(--ease-out)] ${
                    active
                      ? 'text-[var(--color-office-ink)]'
                      : 'text-[var(--color-office-ink)]/60 hover:text-[var(--color-office-ink)]/90'
                  }`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active-dot"
                      className="absolute inset-x-3 -bottom-0.5 h-px bg-[var(--color-office-gold)]"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: 'spring', duration: 0.4, bounce: 0.15 }
                      }
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* ——— نداء الفعل ——— */}
          <div className="hidden shrink-0 items-center md:flex">
            {/*
              زر الحجز.

              ما كان: سهم داخل دائرة ذهبية يزيح نصف بكسل قطريًا عند
              التحويم. الإزاحة أصغر من أن تُرى، فيبدو الزر جامدًا،
              والحدّ الذهبي الباهت يجعله يختفي وسط الشريط.

              ما صار:
              • التعبئة الذهبية تنمو من اليمين (بداية السطر في RTL)
                على transform:scaleX، فتُقرأ كامتلاء لا كتغيّر لون.
              • السهم يُستبدل بنسخته: النسخة الظاهرة تخرج قطريًا نحو
                أسفل اليسار، وأخرى تدخل من أعلى اليمين إلى مكانها.
                الحركة نفسها تشرح الوجهة: أسفل الصفحة، جهة اليسار.
              • الدائرة تنقلب إلى داكن على ذهبي عند التحويم، فيبقى
                التباين مضمونًا بعد امتلاء الخلفية.
            */}
            <button
              id="nav-cta-button"
              onClick={() => scrollTo('contact-section')}
              className="group relative flex cursor-pointer items-center gap-2.5 overflow-hidden rounded-full border border-[var(--color-office-gold)]/55 py-1.5 pr-4 pl-1.5 text-xs font-medium text-[var(--color-office-ink)] transition-[border-color,transform] duration-200 ease-[var(--ease-out)] hover:scale-[1.04] hover:border-[var(--color-office-gold)] active:scale-[0.97]"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 origin-right scale-x-0 bg-[var(--color-office-gold)] transition-transform duration-[450ms] ease-[var(--ease-out)] group-hover:scale-x-100"
              />

              <span className="relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[var(--color-office-gold)] text-[var(--color-office-on-gold)] transition-colors duration-300 ease-[var(--ease-out)] group-hover:bg-[var(--color-office-bg)] group-hover:text-[var(--color-office-gold)]">
                <ArrowDownLeft
                  className="h-3.5 w-3.5 transition-transform duration-[380ms] ease-[var(--ease-out)] group-hover:translate-x-[-140%] group-hover:translate-y-[140%]"
                  weight="bold"
                />
                <ArrowDownLeft
                  aria-hidden="true"
                  className="absolute translate-x-[140%] translate-y-[-140%] transition-transform duration-[380ms] ease-[var(--ease-out)] group-hover:translate-x-0 group-hover:translate-y-0 h-3.5 w-3.5"
                  weight="bold"
                />
              </span>

              <span className="relative transition-colors duration-300 ease-[var(--ease-out)] group-hover:text-[var(--color-office-on-gold)]">
                حجز استشارة
              </span>
            </button>
          </div>

          {/* ——— زر القائمة على الموبايل ———
              الخطّان يدوران ويتداخلان ليكوّنا X فعليًا، بدل استبدال
              أيقونة بأخرى — التحوّل نفسه يشرح أن الزر عاد إلى حالته. */}
          <button
            id="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="relative flex h-10 w-10 cursor-pointer items-center justify-center transition-transform duration-200 ease-[var(--ease-out)] hover:scale-110 active:scale-90 md:hidden"
            aria-label={mobileMenuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={mobileMenuOpen}
          >
            <span
              aria-hidden="true"
              className={`absolute h-px w-5 bg-[var(--color-office-ink)] transition-transform duration-300 ease-[var(--ease-out)] ${
                mobileMenuOpen ? 'rotate-45' : '-translate-y-[3px]'
              }`}
            />
            <span
              aria-hidden="true"
              className={`absolute h-px w-5 bg-[var(--color-office-ink)] transition-transform duration-300 ease-[var(--ease-out)] ${
                mobileMenuOpen ? '-rotate-45' : 'translate-y-[3px]'
              }`}
            />
          </button>
        </div>
      </header>

      {/* ——— قائمة الموبايل الكاملة ———
          طبقة تملأ الشاشة بزجاجية ثقيلة، وروابط تدخل متتالية بفارق
          50مل. الخروج يعكس الدخول فيبدو الطريق واحدًا في الاتجاهين. */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="fixed inset-0 bg-[var(--color-office-bg)]/95 backdrop-blur-2xl md:hidden"
            style={{ zIndex: 'calc(var(--z-nav) - 1)' }}
          >
            <nav className="flex h-full flex-col justify-center gap-1 px-8 text-right">
              {NAV_ITEMS.map((item, i) => (
                <motion.button
                  key={item.id}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
                  transition={{
                    duration: 0.4,
                    delay: reduceMotion ? 0 : 0.06 + i * 0.05,
                    ease: [0.23, 1, 0.32, 1],
                  }}
                  onClick={() => scrollTo(item.id)}
                  className="group flex cursor-pointer items-center justify-end gap-3 border-b border-[var(--color-office-line)] py-4"
                >
                  <span
                    className={`text-2xl font-light transition-colors duration-200 ${
                      activeId === item.id
                        ? 'text-[var(--color-office-gold)]'
                        : 'text-[var(--color-office-ink)]'
                    }`}
                  >
                    {item.label}
                  </span>
                </motion.button>
              ))}

              <motion.button
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{
                  duration: 0.4,
                  delay: reduceMotion ? 0 : 0.06 + NAV_ITEMS.length * 0.05,
                  ease: [0.23, 1, 0.32, 1],
                }}
                onClick={() => scrollTo('contact-section')}
                className="mt-8 flex cursor-pointer items-center justify-center gap-2.5 rounded-full bg-[var(--color-office-gold)] py-3.5 text-sm font-medium text-[var(--color-office-on-gold)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative flex h-4 w-4 items-center justify-center overflow-hidden">
                  <ArrowDownLeft className="h-4 w-4" weight="bold" />
                </span>
                <span>حجز استشارة</span>
              </motion.button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
