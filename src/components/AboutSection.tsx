import React, { useEffect, useRef, useState } from 'react';
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { Reveal, RevealWords, DrawLine } from './Reveal';
import { SectionEyebrow } from './Section';
import { ar } from '../lib/numerals';

interface AboutSectionProps {
  heroExitProgress?: MotionValue<number>;
}

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * ============================================================
 * من نحن.
 *
 * التغيير الأهم هنا حذف، لا إضافة: كان أسفل هذا القسم ثلاث لوحات
 * رقمية (100% إشراف، < 5 مشاريع، 04 مراحل)، ثم يليه مباشرة قسم
 * "سجل الاستوديو" بأربع لوحات رقمية أخرى. سبع لوحات أرقام في شاشة
 * ونصف، بنظامي ترقيم مختلفين (لاتيني وهندي)، ومعنى مكرّر (عدد
 * المراحل مذكور أصلًا في قسم منهجية التنفيذ).
 *
 * الآن: مكان واحد في الصفحة تُعرض فيه الأرقام، هو سجل الاستوديو
 * تحت هذا القسم مباشرة. وهذا القسم يقول ما يقوله بالنص والرسم.
 *
 * الرسم التخطيطي: كان لوحة ساكنة بتعليقات لاتينية (PLAN 1/50،
 * REF A-101، 8,450 mm) داخل صفحة عربية. صار يُرسم خطًا خطًا عند
 * دخوله الشاشة، وتعليقاته بالعربية وبالأرقام الهندية.
 * ============================================================
 */
export const AboutSection: React.FC<AboutSectionProps> = ({ heroExitProgress }) => {
  const reduceMotion = useReducedMotion();

  const fallbackProgress = useMotionValue(1);
  const progress = heroExitProgress ?? fallbackProgress;

  // مرآة مباشرة لخروج الهيرو: نفس الرقم يقود اختفاء الهيرو وظهور
  // هذا القسم في اللحظة نفسها، فتصبح حركة واحدة متصلة بدل مشهدين
  // يتزامنان بالمصادفة.
  const sectionOpacity = useTransform(progress, (v: number) => (reduceMotion ? 1 : v));

  /** خط في المخطط: يُرسم من الصفر عند دخوله الشاشة. */
  const draw = (delay: number, duration = 1.1) => ({
    initial: reduceMotion ? { opacity: 0 } : { pathLength: 0, opacity: 0 },
    whileInView: { pathLength: 1, opacity: 1 },
    viewport: { once: true, margin: '0px 0px -80px 0px' },
    transition: {
      pathLength: { duration: reduceMotion ? 0 : duration, delay, ease: EASE_OUT },
      opacity: { duration: 0.25, delay },
    },
  });

  /** عناصر تظهر ولا تُرسم (نصوص، مربعات الأعمدة). */
  const appear = (delay: number) => ({
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: '0px 0px -80px 0px' },
    transition: { duration: 0.5, delay, ease: EASE_OUT },
  });

  return (
    <section id="about-section" className="relative px-5 py-24 sm:px-8 sm:py-32 md:px-12">
      <motion.div
        className="relative mx-auto max-w-7xl will-change-[opacity]"
        style={{ opacity: sectionOpacity }}
      >
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* ——— العمود النصي ——— */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <SectionEyebrow>من نحن</SectionEyebrow>

            <h2 className="mt-5 text-3xl leading-[1.4] font-normal text-[var(--color-office-ink)] sm:text-4xl md:text-5xl md:leading-[1.35]">
              <RevealWords text="لا نُكدّس المشاريع، بل نُفرِد لكل مساحة زمنها المعماري الكامل." />
            </h2>

            <DrawLine className="mt-7 w-24" delay={0.3} />

            <div className="mt-8 space-y-5 text-base leading-[1.95] font-light text-[var(--color-office-ink)]/75 sm:text-lg">
              <Reveal delay={0.1}>
                <p className="max-w-[62ch]">
                  تأسس مكتب{' '}
                  <strong className="font-medium text-[var(--color-office-ink)]">المعماري</strong>{' '}
                  بدافع واحد: إعادة الاعتبار لدقة التفاصيل التنفيذية في العمارة الداخلية. نؤمن بأن
                  الفراغ الراقي لا يتحقق بالمبالغة في الديكور، بل بالانضباط الهندسي وتناغم المواد
                  الطبيعية وتوجيه الضوء لخدمة السكون البصري.
                </p>
              </Reveal>
              <Reveal delay={0.18}>
                <p className="max-w-[62ch]">
                  لأننا نرفض نموذج «الإنتاج الكمي»، نلتزم بعدد محدود جدًا من المشاريع سنويًا. هذا
                  يسمح لمهندسينا بالتواجد الميداني المستمر، ومطابقة كل مليمتر في الموقع مع ما خُطط
                  له على الورق، من أول فكرة تخطيطية وحتى التسليم النهائي.
                </p>
              </Reveal>
            </div>

            <LedgerRow />
          </div>

          {/* ——— عمود المخطط الهندسي ——— */}
          <Reveal delay={0.15} className="lg:col-span-5">
            <div className="bezel mx-auto w-full max-w-md">
              <div className="bezel-core blueprint-grid-fine relative aspect-square p-6">
                <span className="absolute top-3 right-3 text-[10px] text-[var(--color-office-gold)]/75">
                  لوحة أ-101
                </span>
                <span className="absolute top-3 left-3 text-[10px] text-[var(--color-office-gold)]/75">
                  مقياس 1:50
                </span>
                <span className="absolute bottom-3 right-3 text-[10px] text-[var(--color-office-gold)]/75">
                  محور شمال-جنوب
                </span>
                <span className="absolute bottom-3 left-3 text-[10px] text-[var(--color-office-gold)]/75">
                  مكتب المعماري
                </span>

                <svg
                  viewBox="0 0 400 400"
                  className="h-full w-full"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  role="img"
                  aria-label="مسقط أفقي تخطيطي يوضح دراسة الفراغ الداخلي وأبعاده"
                >
                  {/* محاور الشبكة الإنشائية */}
                  {[
                    ['40', '50', '360', '50'],
                    ['40', '200', '360', '200'],
                    ['40', '340', '360', '340'],
                  ].map(([x1, y1, x2, y2], i) => (
                    <motion.line
                      key={`h-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="var(--color-office-blue)"
                      strokeWidth="0.8"
                      strokeDasharray="4 4"
                      strokeOpacity="0.45"
                      {...draw(0.05 * i, 0.9)}
                    />
                  ))}
                  {[
                    ['80', '30', '80', '360'],
                    ['220', '30', '220', '360'],
                    ['330', '30', '330', '360'],
                  ].map(([x1, y1, x2, y2], i) => (
                    <motion.line
                      key={`v-${i}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="var(--color-office-blue)"
                      strokeWidth="0.8"
                      strokeDasharray="4 4"
                      strokeOpacity="0.45"
                      {...draw(0.15 + 0.05 * i, 0.9)}
                    />
                  ))}

                  {/* الجدار الخارجي بسماكته */}
                  <motion.rect
                    x="80"
                    y="70"
                    width="250"
                    height="250"
                    stroke="var(--color-office-ink)"
                    strokeWidth="2"
                    strokeOpacity="0.85"
                    {...draw(0.35, 1.4)}
                  />
                  <motion.rect
                    x="88"
                    y="78"
                    width="234"
                    height="234"
                    stroke="var(--color-office-ink)"
                    strokeWidth="1"
                    strokeOpacity="0.28"
                    {...draw(0.5, 1.4)}
                  />

                  {/* القواطع الداخلية */}
                  <motion.path
                    d="M 88 190 L 210 190 L 210 240"
                    stroke="var(--color-office-ink)"
                    strokeWidth="1.75"
                    strokeOpacity="0.75"
                    {...draw(0.8, 0.8)}
                  />
                  <motion.path
                    d="M 245 190 L 322 190"
                    stroke="var(--color-office-ink)"
                    strokeWidth="1.75"
                    strokeOpacity="0.75"
                    {...draw(0.95, 0.6)}
                  />

                  {/* الأبواب وأقواس الدوران */}
                  <motion.path
                    d="M 210 190 L 210 225"
                    stroke="var(--color-office-gold)"
                    strokeWidth="1.2"
                    strokeOpacity="0.9"
                    {...draw(1.1, 0.4)}
                  />
                  <motion.path
                    d="M 210 225 A 35 35 0 0 0 245 190"
                    stroke="var(--color-office-gold)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    strokeOpacity="0.7"
                    {...draw(1.2, 0.6)}
                  />
                  <motion.path
                    d="M 155 78 L 155 110"
                    stroke="var(--color-office-gold)"
                    strokeWidth="1.2"
                    strokeOpacity="0.9"
                    {...draw(1.1, 0.4)}
                  />
                  <motion.path
                    d="M 155 110 A 32 32 0 0 1 187 78"
                    stroke="var(--color-office-gold)"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                    strokeOpacity="0.7"
                    {...draw(1.2, 0.6)}
                  />

                  {/* الأعمدة الإنشائية */}
                  {[
                    ['80', '70', '12'],
                    ['318', '70', '12'],
                    ['80', '308', '12'],
                    ['318', '308', '12'],
                    ['214', '184', '10'],
                  ].map(([x, y, s], i) => (
                    <motion.rect
                      key={`c-${i}`}
                      x={x}
                      y={y}
                      width={s}
                      height={s}
                      fill="var(--color-office-gold)"
                      fillOpacity="0.4"
                      stroke="var(--color-office-gold)"
                      strokeWidth="1"
                      {...appear(1.35 + i * 0.05)}
                    />
                  ))}

                  {/* خطوط الأبعاد */}
                  <motion.line
                    x1="80"
                    y1="45"
                    x2="330"
                    y2="45"
                    stroke="var(--color-office-gold)"
                    strokeWidth="0.9"
                    strokeOpacity="0.6"
                    {...draw(1.6, 0.7)}
                  />
                  <motion.line
                    x1="350"
                    y1="70"
                    x2="350"
                    y2="320"
                    stroke="var(--color-office-gold)"
                    strokeWidth="0.9"
                    strokeOpacity="0.6"
                    {...draw(1.7, 0.7)}
                  />
                  <motion.text
                    x="205"
                    y="40"
                    fill="var(--color-office-gold)"
                    fontSize="9"
                    fontFamily="'Tajawal', sans-serif"
                    textAnchor="middle"
                    {...appear(2)}
                  >
                    8,450 مم
                  </motion.text>
                  <motion.text
                    x="364"
                    y="200"
                    fill="var(--color-office-gold)"
                    fontSize="9"
                    fontFamily="'Tajawal', sans-serif"
                    textAnchor="middle"
                    transform="rotate(90 364 200)"
                    {...appear(2.05)}
                  >
                    8,450 مم
                  </motion.text>

                  {/* تسميات الفراغات */}
                  <motion.text
                    x="145"
                    y="140"
                    fill="var(--color-office-ink)"
                    fontSize="11"
                    fontFamily="'Tajawal', sans-serif"
                    fillOpacity="0.55"
                    textAnchor="middle"
                    {...appear(1.85)}
                  >
                    صالة الاستقبال
                  </motion.text>
                  <motion.text
                    x="145"
                    y="156"
                    fill="var(--color-office-gold)"
                    fontSize="8.5"
                    fontFamily="'Tajawal', sans-serif"
                    fillOpacity="0.6"
                    textAnchor="middle"
                    {...appear(1.9)}
                  >
                    منسوب +0.15
                  </motion.text>
                  <motion.text
                    x="270"
                    y="260"
                    fill="var(--color-office-ink)"
                    fontSize="11"
                    fontFamily="'Tajawal', sans-serif"
                    fillOpacity="0.55"
                    textAnchor="middle"
                    {...appear(1.95)}
                  >
                    فناء داخلي
                  </motion.text>
                  <motion.text
                    x="270"
                    y="276"
                    fill="var(--color-office-gold)"
                    fontSize="8.5"
                    fontFamily="'Tajawal', sans-serif"
                    fillOpacity="0.6"
                    textAnchor="middle"
                    {...appear(2)}
                  >
                    منسوب 0.00
                  </motion.text>

                  {/* سهم الشمال */}
                  <motion.g transform="translate(110, 265)" {...appear(2.1)}>
                    <circle
                      cx="15"
                      cy="15"
                      r="14"
                      stroke="var(--color-office-blue)"
                      strokeWidth="0.8"
                      strokeOpacity="0.7"
                    />
                    <polygon
                      points="15,4 19,23 15,19 11,23"
                      fill="var(--color-office-gold)"
                      fillOpacity="0.85"
                    />
                    <text
                      x="15"
                      y="2"
                      fill="var(--color-office-ink)"
                      fontSize="8"
                      fontFamily="'Tajawal', sans-serif"
                      textAnchor="middle"
                    >
                      ش
                    </text>
                  </motion.g>
                </svg>
              </div>
            </div>
          </Reveal>
        </div>
      </motion.div>
    </section>
  );
};

/* ============================================================ */

const LEDGER = [
  { value: 68, suffix: '', label: 'مشروعًا مُسلَّمًا' },
  { value: 12, suffix: '', label: 'سنة من الممارسة' },
  { value: 94, suffix: '%', label: 'تسليم ضمن الجدول' },
  { value: 31, suffix: ' ألف', label: 'م2 مصمَّمة' },
];

/**
 * صف أرقام المكتب.
 *
 * كان قسمًا مستقلًا بأرقام ضخمة يحتل شاشة كاملة تحت "من نحن".
 * نزل إلى هنا بحجم أصغر بكثير، ملاصقًا للنص الذي يفسّره وعلى
 * مستوى الصورة إلى جانبه: الرقم هنا سندٌ لما قيل في الفقرة، لا
 * إعلان مستقل. أربعة أرقام في سطر واحد تُقرأ في ثانية، بينما
 * أربع لوحات بحجم شاشة تُقرأ كلوحة قيادة لا كسيرة مكتب.
 *
 * العدّ يبدأ عند دخول الصف الشاشة لا عند تحميل الصفحة، ويُنفَّذ
 * بـ requestAnimationFrame لا بمؤقّت: المؤقّت يُنتج قفزات مرئية
 * على الأجهزة المشغولة.
 */
const LedgerRow: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -80px 0px' });

  return (
    <div
      ref={ref}
      className="mt-12 grid grid-cols-2 gap-x-6 gap-y-7 border-t border-[var(--color-office-ink)]/10 pt-8 sm:grid-cols-4"
    >
      {LEDGER.map((item, i) => (
        <Reveal key={item.label} delay={0.06 * i} y={12}>
          <span className="font-display block text-2xl leading-none font-normal text-[var(--color-office-ink)] sm:text-[1.75rem]">
            <CountUp to={item.value} suffix={item.suffix} play={inView} />
          </span>
          <span className="mt-2 block text-[11px] leading-snug font-light text-[var(--color-office-muted)]/80">
            {item.label}
          </span>
        </Reveal>
      ))}
    </div>
  );
};

const CountUp: React.FC<{ to: number; suffix: string; play: boolean }> = ({
  to,
  suffix,
  play,
}) => {
  const [value, setValue] = useState(0);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!play) return;
    if (reduceMotion) {
      setValue(to);
      return;
    }

    const duration = 1300;
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out cubic: يبطئ العدّ قرب النهاية فيبدو كأنه يستقر
      // لا كأنه انقطع فجأة.
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(to * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [play, to, reduceMotion]);

  return (
    <span className="tabular">
      {ar(value)}
      {suffix}
    </span>
  );
};
