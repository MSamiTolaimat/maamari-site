import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Quotes } from '@phosphor-icons/react';
import { SectionShell, SectionHeading } from './Section';
import { Reveal } from './Reveal';
import { Testimonial } from '../types';

/**
 * ============================================================
 * آراء الملّاك.
 *
 * تاريخ القسم: جدار اقتباسات غير متماثل، شهادة كبيرة وثلاث
 * بطاقات محاطة بإطارات إلى جانبها. المشكلة أن الأربع تُعرض دفعة
 * واحدة بأوزان مختلفة، فتتنافس على الانتباه: العين لا تعرف أتقرأ
 * الكبيرة أم تمسح الصغيرات، والبطاقات المؤطّرة تجعل الشهادة تبدو
 * منتجًا معروضًا لا كلامًا قاله شخص.
 *
 * الشكل الحالي: شهادة واحدة معروضة بحجم كبير في كل لحظة، وإلى
 * جانبها قائمة بأسماء أصحاب الشهادات الأربع. اسم واحد نشط،
 * والبقية تنتظر النقر أو التحويم.
 *
 * لماذا هذا أفضل هنا: الشهادة نص يُقرأ لا بيان يُمسح، وإفراد
 * مساحة كاملة لواحدة يعطيها فرصة أن تُقرأ فعلًا. والقائمة إلى
 * جانبها تُبقي العدد ظاهرًا، فلا يظن الزائر أن لدى المكتب رأيًا
 * واحدًا.
 *
 * لا دوران تلقائي: النص يتبدّل تحت عين القارئ فيقطع عليه الجملة.
 * التبديل بفعل الزائر وحده.
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

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
        {/* ——— الشهادة المعروضة ——— */}
        <div className="lg:col-span-7">
          <Quotes
            className="mb-6 h-9 w-9 text-[var(--color-office-gold)]/50"
            weight="fill"
            aria-hidden="true"
          />

          {/* ارتفاع أدنى ثابت: بدونه يقفز ما تحت الاقتباس كلما
              تبدّل النص بين شهادة طويلة وأخرى قصيرة. */}
          <div className="min-h-[9.5rem] sm:min-h-[11rem]">
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
        <div className="lg:col-span-5">
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
