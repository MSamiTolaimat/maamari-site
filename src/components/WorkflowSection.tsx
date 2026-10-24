import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { CaretLeft, CaretRight, Compass, Stack, Eye, Key } from '@phosphor-icons/react';
import { SmartImage } from './SmartImage';
import { unsplash } from '../data/projects';
import { SectionShell, SectionHeading } from './Section';
import { WorkStage } from '../types';

/**
 * ============================================================
 * منهجية التنفيذ. عرض أفقي دوّار، شاشة واحدة.
 *
 * تاريخ القسم في ثلاث محطات يشرح لماذا هو على هذا الشكل:
 *
 *   الأولى: أربعة أزرار ولوحة مقسومة إلى نصفين. تُقرأ كجدول،
 *   والمرحلة تتنافس مع نفسها.
 *
 *   الثانية: أربع شاشات كاملة متتابعة رأسيًا. حلّت مشكلة القراءة
 *   لكنها كسرت القسم: صار ما يفترض أنه قسم واحد يمتد خمس شاشات،
 *   فينفصل عمّا قبله ويتحوّل إلى فصل مستقل داخل صفحة واحدة.
 *
 *   الثالثة (هذه): شاشة واحدة، والمراحل تتحرك أفقيًا داخلها.
 *
 * لماذا الأفقي هنا تحديدًا: المحتوى نفسه تسلسل زمني. الحركة
 * الأفقية تقول "بعد" و"قبل" بالمكان لا بالنص، والمرحلتان
 * المجاورتان تبقيان مرئيتين خلف ضبابة خفيفة فيعرف الزائر أنه في
 * منتصف سلسلة لا أمام بطاقة معزولة.
 *
 * الدوران لا نهائي: بعد المرحلة الرابعة تأتي الأولى. لا حافة
 * يصطدم بها الزائر، ولا زر معطّل يشرح له أنه وصل الطرف.
 *
 * التنقّل: سهمان، أو نقر على المرحلة المجاورة، أو سحب بالإصبع،
 * أو أسهم لوحة المفاتيح حين يكون الدوّار مركَّزًا. أربع طرق
 * لأن أيًّا منها وحدها تفشل على جهاز ما.
 * ============================================================
 */

const stages: (WorkStage & { icon: React.ElementType; image: string })[] = [
  {
    number: '01',
    title: 'التخطيط ودراسة الحيز',
    subtitle: 'المسح الهندسي وسلوك الفراغ',
    description:
      'تحليل عميق لطبيعة المبنى ومسارات الضوء الطبيعي ودوران الهواء، مع تحديد الاحتياجات الوظيفية للعميل لتحويلها إلى مخطط حركة انسيابي أولي.',
    details: [
      'المسح الميداني وتوثيق القياسات المترية',
      'دراسة زوايا الإضاءة الطبيعية وتوجيه الفتحات',
      'مخطط الكتلة والفراغ قبل أي قرار جمالي',
    ],
    icon: Compass,
    image: unsplash('1524995997946-a1c2e315a42f', 1400),
  },
  {
    number: '02',
    title: 'التصميم التنفيذي والخامات',
    subtitle: 'نقاء المادة وتفصيل المليمتر',
    description:
      'صياغة الهوية الجمالية وتحديد الخامات الواقعية من رخام وأخشاب معتقة ومعادن، وإصدار المخططات التنفيذية التفصيلية بمقياس 1:10 و 1:20 لفرق الحرفيين.',
    details: [
      'انتقاء وتوثيق عينات المواد والملمس',
      'مخططات الأسقف وتوزيع الإنارة والتمديدات',
      'تفاصيل النجارة الحصرية وتكسيات الجدران',
    ],
    icon: Stack,
    image: unsplash('1615873968403-89e068629265', 1400),
  },
  {
    number: '03',
    title: 'الإشراف الميداني الصارم',
    subtitle: 'حراسة جودة التنفيذ',
    description:
      'حضور هندسي أسبوعي مباشر في موقع العمل. لا نترك التنفيذ لتأويلات المقاولين، بل نطابق كل خط رُسم على المخطط مع ما يُبنى على أرض الواقع.',
    details: [
      'فحص جودة الخامات الموردة ومطابقتها للمواصفة',
      'معاينة دقة الفواصل والمحاذاة والتشطيبات',
      'تقارير مرحلية دورية مع توثيق فوتوغرافي تقني',
    ],
    icon: Eye,
    image: unsplash('1582719478250-c89cae4dc85b', 1400),
  },
  {
    number: '04',
    title: 'المعايرة والتسليم النهائي',
    subtitle: 'المكان كما يجب أن يُعاش',
    description:
      'معايرة سيناريوهات الإضاءة ودرجات حرارة الألوان، تنسيق المفروشات والقطع الفنية، وتسليم المالك ملف التوثيق الشامل وكتيب الصيانة المستدامة.',
    details: [
      'ضبط مستويات الإنارة ودرجة حرارة اللون',
      'تنسيق الفراغ النهائي وفحص الأنظمة المتكاملة',
      'تسليم مخططات ما بعد التنفيذ مع شهادات الضمان',
    ],
    icon: Key,
    image: unsplash('1600573472550-8090b5e0745e', 1400),
  },
];

const TOTAL = stages.length;
const EASE = [0.23, 1, 0.32, 1] as const;

/** كشف شاشات الموبايل لتخصيص حركة الدوّار */
const useIsMobile = (breakpoint = 640) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  );

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    setIsMobile(mql.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [breakpoint]);

  return isMobile;
};

export const WorkflowSection: React.FC = () => {
  const [active, setActive] = useState(0);
  const reduceMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(640);

  const go = useCallback((delta: number) => {
    setActive((prev) => (prev + delta + TOTAL) % TOTAL);
  }, []);

  /* أسهم لوحة المفاتيح. في صفحة RTL السهم الأيسر يتقدّم والأيمن
     يرجع، مطابقةً لاتجاه حركة الشرائح على الشاشة. */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      go(1);
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      go(-1);
    }
  };

  /* منع تمرير الصفحة أثناء السحب الأفقي داخل الدوّار على اللمس. */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const stop = (e: TouchEvent) => {
      if (e.touches.length === 1) e.stopPropagation();
    };
    el.addEventListener('touchmove', stop, { passive: true });
    return () => el.removeEventListener('touchmove', stop);
  }, []);

  return (
    <SectionShell id="workflow-section" fullHeight>
      <div className="flex flex-col gap-8 lg:gap-10">
        <SectionHeading
          eyebrow="منهجية التنفيذ"
          title="أربع مراحل متتابعة، تضمن بقاء الفكرة نقية حتى استلام المفتاح."
          compact
          className="mb-0 max-w-2xl"
        />

        {/* ——— الدوّار ——— */}
        <div
          ref={trackRef}
          tabIndex={0}
          role="group"
          aria-roledescription="عرض دوّار"
          aria-label="مراحل التنفيذ الأربع"
          onKeyDown={handleKeyDown}
          className="relative h-[32rem] sm:h-[26rem] lg:h-[27rem] w-full"
        >
          {/* أسهم التنقل للشاشات المتوسطة والكبيرة */}
          <NavButton
            label="المرحلة السابقة"
            onClick={() => go(-1)}
            className="hidden sm:flex right-2 lg:right-4"
          >
            <CaretRight className="h-4 w-4" weight="bold" />
          </NavButton>

          <NavButton
            label="المرحلة التالية"
            onClick={() => go(1)}
            className="hidden sm:flex left-2 lg:left-4"
          >
            <CaretLeft className="h-4 w-4" weight="bold" />
          </NavButton>

          {stages.map((stage, i) => {
            let offset = (i - active + TOTAL) % TOTAL;
            if (offset > TOTAL / 2) offset -= TOTAL;

            const isActive = offset === 0;
            const isNeighbor = Math.abs(offset) === 1;

            return (
              <motion.article
                key={stage.number}
                aria-hidden={!isActive}
                onClick={() => !isActive && isNeighbor && go(offset)}
                drag={isActive && !reduceMotion ? 'x' : false}
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.14}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -70) go(1);
                  else if (info.offset.x > 70) go(-1);
                }}
                animate={{
                  x: isMobile ? `${offset * -100}%` : `${offset * -62}%`,
                  scale: isMobile ? (isActive ? 1 : 0.95) : (isActive ? 1 : 0.86),
                  opacity: isMobile ? (isActive ? 1 : 0) : (isActive ? 1 : isNeighbor ? 0.32 : 0),
                  filter: isMobile ? 'none' : (isActive ? 'blur(0px)' : 'blur(5px)'),
                  zIndex: isActive ? 2 : 1,
                }}
                transition={
                  reduceMotion
                    ? { duration: 0.15 }
                    : { duration: 0.55, ease: EASE, opacity: { duration: 0.35 } }
                }
                className={`absolute inset-y-0 left-1/2 w-[92%] -translate-x-1/2 sm:w-[78%] lg:w-[68%] ${
                  isActive ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'
                }`}
                style={{ pointerEvents: isActive || isNeighbor ? 'auto' : 'none' }}
              >
                <StageCard stage={stage} isActive={isActive} />
              </motion.article>
            );
          })}
        </div>

        {/* ——— شريط التقدّم والتحكم ——— */}
        <div className="flex items-center justify-center gap-3">
          {/* زر السابق للموبايل */}
          <button
            onClick={() => go(-1)}
            aria-label="المرحلة السابقة"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-office-line)] text-[var(--color-office-muted)] transition-opacity duration-200 cursor-pointer sm:hidden"
          >
            <CaretRight className="h-3.5 w-3.5" weight="bold" />
          </button>

          <div className="flex items-center justify-center gap-2">
            {stages.map((stage, i) => (
              <button
                key={stage.number}
                onClick={() => setActive(i)}
                aria-label={`الانتقال إلى ${stage.title}`}
                aria-current={active === i ? 'step' : undefined}
                className="group cursor-pointer py-3"
              >
                <span
                  className={`block h-[2px] transition-[width,background-color] duration-500 ease-[var(--ease-out)] ${
                    active === i
                      ? 'w-10 sm:w-14 bg-[var(--color-office-gold)]'
                      : 'w-5 sm:w-7 bg-[var(--color-office-ink)]/20 group-hover:bg-[var(--color-office-ink)]/40'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* زر التالي للموبايل */}
          <button
            onClick={() => go(1)}
            aria-label="المرحلة التالية"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-office-line)] text-[var(--color-office-muted)] transition-opacity duration-200 cursor-pointer sm:hidden"
          >
            <CaretLeft className="h-3.5 w-3.5" weight="bold" />
          </button>
        </div>
      </div>
    </SectionShell>
  );
};

/* ============================================================ */

const NavButton: React.FC<{
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}> = ({ label, onClick, children, className = '' }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-[var(--color-office-ink)]/15 bg-[var(--color-office-bg)]/70 text-[var(--color-office-ink)]/75 backdrop-blur-md transition-[border-color,color,transform] duration-200 ease-[var(--ease-out)] hover:scale-110 hover:border-[var(--color-office-gold)]/60 hover:text-[var(--color-office-gold)] active:scale-95 ${className}`}
  >
    {children}
  </button>
);

/* ============================================================ */

/**
 * بطاقة المرحلة.
 */
const StageCard: React.FC<{
  stage: WorkStage & { icon: React.ElementType; image: string };
  isActive: boolean;
}> = ({ stage, isActive }) => {
  const Icon = stage.icon;

  return (
    <div className="bezel h-full w-full">
      <div className="bezel-core relative h-full w-full">
        <div aria-hidden="true" className="absolute inset-0">
          <SmartImage src={stage.image} alt="" className="scale-[1.04]" />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(270deg, rgba(20,21,22,0.97) 0%, rgba(20,21,22,0.88) 42%, rgba(20,21,22,0.45) 100%)',
          }}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(20,21,22,0.35) 0%, transparent 30%, rgba(20,21,22,0.6) 100%)',
          }}
        />

        <div className="relative flex h-full flex-col justify-center p-6 sm:p-9 lg:p-11 text-right">
          <div className="max-w-xl">
            <div className="flex items-center gap-3.5 sm:gap-4">
              <span
                aria-hidden="true"
                className="tabular text-3xl sm:text-5xl leading-none font-normal text-[var(--color-office-gold)]/55"
              >
                {stage.number}
              </span>
              <span className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-[var(--radius-field)] border border-[var(--color-office-gold)]/25 bg-[var(--color-office-gold)]/[0.08] text-[var(--color-office-gold)]">
                <Icon className="h-4 w-4" weight="light" />
              </span>
            </div>

            <h3 className="mt-4 sm:mt-5 text-xl sm:text-3xl lg:text-[2.1rem] leading-[1.35] font-normal text-[var(--color-office-on-dark)]">
              {stage.title}
            </h3>

            <p className="mt-1.5 sm:mt-2.5 text-xs sm:text-sm text-[var(--color-office-gold)]">
              {stage.subtitle}
            </p>

            <p className="mt-3.5 sm:mt-5 max-w-[54ch] text-xs sm:text-[0.95rem] leading-[1.85] sm:leading-[1.9] font-light text-[var(--color-office-on-dark)]/72">
              {stage.description}
            </p>

            {/* المخرجات الثلاثة */}
            <ul className="mt-5 sm:mt-7 grid grid-cols-1 gap-x-6 gap-y-2.5 sm:gap-y-3.5 sm:grid-cols-3">
              {stage.details.map((detail, i) => (
                <motion.li
                  key={detail}
                  animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 8 }}
                  transition={{ duration: 0.45, delay: isActive ? 0.18 + i * 0.07 : 0, ease: EASE }}
                >
                  <span className="mb-1.5 sm:mb-2 block h-px w-full bg-gradient-to-l from-[var(--color-office-gold)]/60 to-transparent" />
                  <span className="block text-[11px] sm:text-[11.5px] leading-[1.65] font-light text-[var(--color-office-on-dark)]/62">
                    {detail}
                  </span>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
