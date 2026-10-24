import React, { useCallback, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CaretLeft, CaretRight, Quotes } from '@phosphor-icons/react';
import { SectionShell, SectionHeading } from './Section';
import { Reveal } from './Reveal';
import { Testimonial } from '../types';

/**
 * ============================================================
 * آراء الملّاك.
 *
 * تاريخ القسم:
 * الشكل المكتبي: شهادة واحدة معروضة بحجم كبير في كل لحظة، وإلى
 * جانبها قائمة بأسماء أصحاب الشهادات الأربع. اسم واحد نشط،
 * والبقية تنتظر النقر أو التحويم.
 *
 * على الموبايل: تحويل العرض إلى سلايدر أفقي (Carousel) لبطاقات
 * الشهادات بأسلوب scroll-snap مع مؤشر نقاط وأسهم تنقل.
 * هذا يمنع التمرير العمودي الطويل وتراكم الأسماء عموديًا، ويتيح
 * للزائر تصفح كل شهادة مع سياقها ومشروعها بتمريرة واحدة سريعة.
 * ============================================================
 */

const testimonials: Testimonial[] = [
  {
    quote:
      'رفضوا أول فكرة اقترحتُها أنا، وشرحوا لماذا لن تعمل في هذا الحيز تحديدًا. هذا ما أدفع مقابله فعلًا.',
    author: 'سلطان العريفي',
    role: 'مالك، فيلا الوادي',
    project: 'فيلا الوادي',
  },
  {
    quote:
      'التقرير الأسبوعي المصوّر جعلني أتابع مشروعًا في الرياض وأنا في لندن دون قلق واحد.',
    author: 'نورة الحميدان',
    role: 'مالكة، بنتهاوس الأفق',
    project: 'بنتهاوس الأفق',
  },
  {
    quote:
      'قاسوا الضجيج قبل التصميم وبعده، وأعطونا الرقمين. لم يسبق لأحد أن قدّم لنا دليلًا بهذا الوضوح.',
    author: 'م. فيصل الدوسري',
    role: 'مدير التشغيل، دارين للاستشارات',
    project: 'مقر دارين',
  },
  {
    quote: 'سلّمونا المشروع قبل الموسم بأحد عشر يومًا، وهذا وحده غيّر سنتنا المالية.',
    author: 'ريم الغانم',
    role: 'الشريك المؤسس، مجموعة نجد',
    project: 'مطعم نجد الحديث',
  },
];

const EASE = [0.23, 1, 0.32, 1] as const;

export const TestimonialsSection: React.FC = () => {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const current = testimonials[active];

  return (
    <SectionShell id="testimonials-section">
      <SectionHeading eyebrow="آراء الملّاك" title="ما قالوه بعد استلام المفتاح." compact />

      {/* ——— على الموبايل والشاشات الصغيرة (< lg): سلايدر أفقي سلس ——— */}
      <MobileTestimonialsCarousel testimonials={testimonials} />

      {/* ——— على الشاشات الكبيرة (lg+): العرض التحريري المقروء ——— */}
      <div className="hidden lg:grid grid-cols-12 gap-14">
        {/* ——— الشهادة المعروضة ——— */}
        <div className="col-span-7">
          <Quotes
            className="mb-6 h-9 w-9 text-[var(--color-office-gold)]/50"
            weight="fill"
            aria-hidden="true"
          />

          {/* ارتفاع أدنى ثابت: بدونه يقفز ما تحت الاقتباس كلما
              تبدّل النص بين شهادة طويلة وأخرى قصيرة. */}
          <div className="min-h-[11rem]">
            <AnimatePresence mode="wait" initial={false}>
              <motion.blockquote
                key={current.author}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
                transition={{ duration: 0.38, ease: EASE }}
                className="text-right text-xl leading-[1.8] font-normal text-[var(--color-office-ink)] sm:text-2xl md:text-[1.7rem] md:leading-[1.75]"
              >
                {current.quote}
              </motion.blockquote>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.figcaption
              key={current.author + '-meta'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="mt-7 flex items-center gap-3 text-right"
            >
              <span
                aria-hidden="true"
                className="h-9 w-px bg-gradient-to-b from-[var(--color-office-gold)] to-transparent"
              />
              <span>
                <span className="block text-sm font-normal text-[var(--color-office-ink)]">
                  {current.author}
                </span>
                <span className="block text-[11px] font-light text-[var(--color-office-muted)]/75">
                  {current.role}
                </span>
              </span>
            </motion.figcaption>
          </AnimatePresence>
        </div>

        {/* ——— قائمة أصحاب الشهادات ———
            بلا إطارات: صفوف مفصولة بخط شعري. المؤشر الذهبي عنصر
            واحد ينتقل بين الصفوف بـ layoutId، فيُقرأ كانتقال لا
            كظهور واختفاء. */}
        <div className="col-span-5">
          <ul className="border-t border-[var(--color-office-ink)]/10">
            {testimonials.map((t, i) => {
              const isActive = active === i;
              return (
                <Reveal as="li" key={t.author} delay={0.05 * i}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => setActive(i)}
                    aria-current={isActive}
                    className="group relative flex w-full cursor-pointer items-center border-b border-[var(--color-office-ink)]/10 py-4 text-right"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="testimonial-marker"
                        aria-hidden="true"
                        className="absolute inset-y-0 right-0 w-[2px] bg-[var(--color-office-gold)]"
                        transition={
                          reduceMotion
                            ? { duration: 0 }
                            : { type: 'spring', duration: 0.45, bounce: 0.15 }
                        }
                      />
                    )}

                    <span
                      className={`pr-4 transition-[color,transform] duration-300 ease-[var(--ease-out)] ${
                        isActive ? 'translate-x-[4px]' : ''
                      }`}
                    >
                      <span
                        className={`block text-sm font-normal transition-colors duration-300 ${
                          isActive
                            ? 'text-[var(--color-office-ink)]'
                            : 'text-[var(--color-office-ink)]/50'
                        }`}
                      >
                        {t.author}
                      </span>
                      <span className="mt-0.5 block text-[11px] font-light text-[var(--color-office-muted)]/60">
                        {t.project}
                      </span>
                    </span>
                  </button>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </div>
    </SectionShell>
  );
};

/**
 * ============================================================
 * سلايدر شهادات الموبايل (أقل من lg)
 * ============================================================
 */
interface MobileTestimonialsCarouselProps {
  testimonials: Testimonial[];
}

const MobileTestimonialsCarousel: React.FC<MobileTestimonialsCarouselProps> = ({
  testimonials,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  /** تتبع الشريحة النشطة عبر قياس الموضع بالنسبة للحاوية */
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const containerRect = el.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    Array.from(el.children).forEach((child, i) => {
      const childRect = (child as HTMLElement).getBoundingClientRect();
      const childCenter = childRect.left + childRect.width / 2;
      const distance = Math.abs(containerCenter - childCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = i;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  /** التمرير المبرمج إلى شهادة بعينها */
  const scrollTo = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement | undefined;
    child?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, []);

  return (
    <div className="block lg:hidden">
      {/* ——— حاوية التمرير الأفقي ——— */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="mobile-carousel -mx-5 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-5 pb-3 pt-1"
        role="region"
        aria-label="آراء الملّاك — اسحب يمينًا ويسارًا"
      >
        {testimonials.map((t, index) => (
          <motion.div
            key={t.author}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.45,
              ease: EASE,
              delay: reduceMotion ? 0 : index * 0.05,
            }}
            className="relative flex w-[85vw] max-w-[370px] shrink-0 snap-center flex-col justify-between border border-[var(--color-office-ink)]/10 bg-[var(--color-office-paper)]/40 p-6 text-right"
          >
            <div>
              {/* رأس البطاقة: أيقونة الاقتباس وتسمية المشروع */}
              <div className="mb-4 flex items-center justify-between">
                <Quotes
                  className="h-7 w-7 text-[var(--color-office-gold)]/60"
                  weight="fill"
                  aria-hidden="true"
                />
                <span className="text-[11px] font-normal text-[var(--color-office-gold)]">
                  {t.project}
                </span>
              </div>

              {/* نص الاقتباس */}
              <blockquote className="text-base leading-[1.85] font-normal text-[var(--color-office-ink)]">
                «{t.quote}»
              </blockquote>
            </div>

            {/* صاحب الشهادة وموقعه */}
            <div className="mt-6 flex items-center gap-3 border-t border-[var(--color-office-ink)]/10 pt-4">
              <span
                aria-hidden="true"
                className="h-8 w-[2px] rounded-full bg-[var(--color-office-gold)]"
              />
              <div>
                <span className="block text-sm font-medium text-[var(--color-office-ink)]">
                  {t.author}
                </span>
                <span className="block text-[11px] font-light text-[var(--color-office-muted)]/75">
                  {t.role}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ——— شريط التحكم: أسهم + مؤشر نقاط ——— */}
      <div className="mt-4 flex items-center justify-center gap-3">
        {/* زر يمين: ينقل النقطة والشهادة إلى اليمين */}
        <button
          onClick={() => {
            const next = Math.max(0, activeIndex - 1);
            setActiveIndex(next);
            scrollTo(next);
          }}
          disabled={activeIndex <= 0}
          aria-label="الشهادة السابقة (يمين)"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-office-line)] text-[var(--color-office-muted)] transition-[border-color,color,opacity] duration-200 disabled:opacity-25 cursor-pointer"
        >
          <CaretRight className="h-3.5 w-3.5" weight="bold" />
        </button>

        {/* مؤشر النقاط */}
        <div className="flex items-center gap-1.5">
          {testimonials.map((t, i) => (
            <button
              key={t.author}
              onClick={() => {
                setActiveIndex(i);
                scrollTo(i);
              }}
              aria-label={`الانتقال إلى شهادة ${t.author}`}
              className={`h-1.5 rounded-full transition-all duration-300 ease-[var(--ease-out)] cursor-pointer ${
                i === activeIndex
                  ? 'w-6 bg-[var(--color-office-gold)]'
                  : 'w-1.5 bg-[var(--color-office-ink)]/20 hover:bg-[var(--color-office-ink)]/40'
              }`}
            />
          ))}
        </div>

        {/* زر يسار: ينقل النقطة والشهادة إلى اليسار */}
        <button
          onClick={() => {
            const next = Math.min(testimonials.length - 1, activeIndex + 1);
            setActiveIndex(next);
            scrollTo(next);
          }}
          disabled={activeIndex >= testimonials.length - 1}
          aria-label="الشهادة التالية (يسار)"
          className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-office-line)] text-[var(--color-office-muted)] transition-[border-color,color,opacity] duration-200 disabled:opacity-25 cursor-pointer"
        >
          <CaretLeft className="h-3.5 w-3.5" weight="bold" />
        </button>
      </div>
    </div>
  );
};

