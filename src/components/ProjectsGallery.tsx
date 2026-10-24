import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowUpLeft, CaretLeft, CaretRight } from '@phosphor-icons/react';
import { SmartImage } from './SmartImage';
import { SectionShell, SectionEyebrow } from './Section';
import { RevealWords, DrawLine } from './Reveal';
import { projects, PROJECT_FILTERS } from '../data/projects';
import { ProjectItem, ProjectType } from '../types';
import { ar } from '../lib/numerals';

interface ProjectsGalleryProps {
  onOpenProject: (project: ProjectItem) => void;
}

/**
 * ============================================================
 * فهرس الأعمال.
 *
 * ما تغيّر في هذه المراجعة:
 *
 * 1. حُذف الرقم الضخم "06" من الخلفية (انظر تعليق قسم الخدمات).
 *
 * 2. حُذف ترقيم البطاقات (01، 02، 03 …) من زاوية كل غلاف: الزائر
 *    يرى الترتيب بعينه، والرقم كان يتعارض مع الفلترة أصلًا (تصفية
 *    التصنيف تعيد ترقيم البطاقات فيتغيّر "رقم المشروع").
 *
 * 3. حالة المشروع نزلت من وسم عائم فوق الصورة إلى سطر البيانات
 *    أسفلها. الوسوم المعلّقة فوق الصور تُضعف الصورة والوسم معًا،
 *    والمعلومة نفسها تصل من سطر واحد نظيف.
 *
 * 4. أعداد التصنيفات أرقامًا لاتينية كبقية الموقع.
 *
 * 5. حُذفت الفقرة التي كانت تجاور العنوان في الترويسة. نمط
 *    "عنوان كبير يمينًا وفقرة شارحة يسارًا" يُنتج تركيزًا مشتتًا:
 *    العين لا تعرف أتقرأ العنوان أم تمسح الفقرة، وأي واحد يُقرأ
 *    أولًا. الترويسة الآن عمود واحد: وسم، عنوان، خط.
 *
 * 6. على الموبايل (أقل من md): الشبكة تحوّلت إلى سلايدر أفقي
 *    (carousel) بدل عمود واحد من البطاقات الكاملة. هذا يُقلّل
 *    التمرير العمودي بشكل كبير، ويجعل التصفّح أسرع.
 * ============================================================
 */

/** هل الشاشة أضيق من نقطة الكسر md (768px)؟ */
const useIsMobile = (breakpoint = 768) => {
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

export const ProjectsGallery: React.FC<ProjectsGalleryProps> = ({ onOpenProject }) => {
  const [filter, setFilter] = useState<ProjectType | 'all'>('all');
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const visible = useMemo(
    () => (filter === 'all' ? projects : projects.filter((p) => p.type === filter)),
    [filter],
  );

  return (
    <SectionShell id="projects-section">
      {/* ——— الترويسة ———
          كانت صفّين: العنوان يمينًا وفقرة تشرحه يسارًا على نفس
          السطر. حُذفت الفقرة: عمود نص صغير يعمل مهمة واحدة فقط
          (شرح ما تفعله البطاقات) بجانب عنوان يقول الشيء نفسه
          تقريبًا هو تكرار لا تناسب، وكل مشروع يشرح نفسه فور
          فتحه أصلًا. عمود واحد الآن: وسم، عنوان، خط. */}
      <div className="mb-8">
        <SectionEyebrow>الأعمال المنتقاة</SectionEyebrow>
        <h2 className="mt-5 max-w-2xl text-3xl leading-[1.4] font-normal text-[var(--color-office-ink)] sm:text-4xl">
          <RevealWords text="ستة مشاريع، كل واحد منها حلٌّ لمشكلة لم تكن جمالية." />
        </h2>
        <DrawLine className="mt-5 w-24" delay={0.25} />
      </div>

      {/* ——— شريط الفلترة ———
          المؤشر المتحرك بين التصنيفات مبني على layoutId: عنصر واحد
          ينتقل فيزيائيًا من تصنيف لآخر، بدل خمسة عناصر يظهر أحدها
          ويختفي الباقي. غرض الحركة هنا الاتساق المكاني (أين كنت
          وأين صرت) لا الزينة. */}
      <div
        role="tablist"
        aria-label="تصنيفات الأعمال"
        className="mb-10 flex flex-wrap items-center gap-1.5 border-b border-[var(--color-office-ink)]/10 pb-4 sm:mb-12 sm:gap-2"
      >
        {PROJECT_FILTERS.map((f) => {
          const active = filter === f.id;
          const count =
            f.id === 'all' ? projects.length : projects.filter((p) => p.type === f.id).length;

          return (
            <button
              key={f.id}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f.id)}
              className={`relative cursor-pointer rounded-full px-3.5 py-2 text-xs transition-[color,transform] duration-200 ease-[var(--ease-out)] hover:scale-[1.05] active:scale-[0.96] sm:px-4 sm:text-[13px] ${
                active
                  ? 'text-[var(--color-office-on-gold)]'
                  : 'text-[var(--color-office-muted)] hover:text-[var(--color-office-ink)]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="filter-pill"
                  className="absolute inset-0 rounded-full bg-[var(--color-office-gold)]"
                  transition={
                    reduceMotion ? { duration: 0 } : { type: 'spring', duration: 0.42, bounce: 0.18 }
                  }
                />
              )}
              <span className="relative flex items-center gap-1.5">
                {f.label}
                <span
                  className={`tabular text-[10px] ${
                    active
                      ? 'text-[var(--color-office-on-gold)]/60'
                      : 'text-[var(--color-office-muted)]/50'
                  }`}
                >
                  {ar(count)}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* ——— عرض المشاريع ———
          على الموبايل: سلايدر أفقي بتقنية scroll-snap مع مؤشر نقاط.
          على الشاشات الكبيرة: الشبكة التحريرية غير المتماثلة كما كانت. */}
      {isMobile ? (
        <MobileCarousel projects={visible} onOpenProject={onOpenProject} />
      ) : (
        <motion.div layout={!reduceMotion} className="grid gap-7 md:grid-cols-12">
          <AnimatePresence mode="popLayout" initial={false}>
            {visible.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onOpen={() => onOpenProject(project)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* ——— حالة فارغة ———
          لا يمكن الوصول إليها ببيانات اليوم، لكنها تُكتب الآن لا
          لاحقًا: إضافة تصنيف بلا مشاريع كان سيترك فراغًا بلا تفسير. */}
      {visible.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-sm text-[var(--color-office-muted)]">
            لا توجد أعمال منشورة ضمن هذا التصنيف بعد.
          </p>
          <button
            onClick={() => setFilter('all')}
            className="mt-3 cursor-pointer text-xs text-[var(--color-office-gold)] hover:underline"
          >
            عرض كل الأعمال
          </button>
        </div>
      )}
    </SectionShell>
  );
};

/* ============================================================
   سلايدر الموبايل — carousel أفقي بتقنية CSS scroll-snap
   ============================================================ */

interface MobileCarouselProps {
  projects: ProjectItem[];
  onOpenProject: (project: ProjectItem) => void;
}

const MobileCarousel: React.FC<MobileCarouselProps> = ({ projects, onOpenProject }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const reduceMotion = useReducedMotion();

  /** تتبع الشريحة النشطة عبر قياس الموضع بدقة مقارنة بالحاوية */
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

  /** التمرير المبرمج إلى بطاقة بعينها */
  const scrollTo = useCallback((idx: number) => {
    const el = scrollRef.current;
    if (!el) return;
    const child = el.children[idx] as HTMLElement | undefined;
    if (!child) return;
    child.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, []);

  /** إعادة تعيين الشريحة عند تغيّر البيانات (الفلترة). */
  useEffect(() => {
    setActiveIndex(0);
    const el = scrollRef.current;
    if (!el) return;
    const firstChild = el.firstElementChild as HTMLElement | undefined;
    firstChild?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [projects]);

  return (
    <div>
      {/* ——— حاوية التمرير الأفقي ——— */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="mobile-carousel -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-4"
        role="region"
        aria-label="معرض المشاريع — اسحب يمينًا ويسارًا"
      >
        {projects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.5,
              ease: [0.23, 1, 0.32, 1],
              delay: reduceMotion ? 0 : Math.min(index, 3) * 0.06,
            }}
            className="spotlight bezel group relative aspect-[4/3] w-[82vw] shrink-0 snap-center"
          >
            <div className="bezel-core relative h-full w-full">
              <div className="absolute inset-0" style={{ background: project.gradient }} />

              <SmartImage
                src={project.coverUrl}
                alt={`${project.name}، ${project.category} في ${project.location}`}
                className="scale-[1.03]"
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(10,11,12,0.35) 0%, rgba(10,11,12,0.10) 40%, rgba(10,11,12,0.90) 100%)',
                }}
              />

              <div
                className="absolute inset-x-0 bottom-0 p-4 pb-14 text-right"
                style={{ zIndex: 'var(--z-base)' }}
              >
                <div className="mb-2 flex items-center gap-2 text-[10px] font-light text-[var(--color-office-on-dark)]/55">
                  <span>{project.category}</span>
                  {project.status !== 'مكتمل' && (
                    <>
                      <span
                        aria-hidden="true"
                        className="inline-block h-1 w-1 rounded-full bg-[var(--color-office-gold)]"
                      />
                      <span className="text-[var(--color-office-gold)]">{project.status}</span>
                    </>
                  )}
                </div>

                <h3 className="text-xl leading-tight font-normal text-[var(--color-office-on-dark)]">
                  {project.name}
                </h3>

                <div className="mt-1.5 flex items-baseline gap-2 text-[10px] font-light text-[var(--color-office-on-dark)]/50">
                  <span>{project.location}</span>
                  <span aria-hidden="true" className="inline-block h-3 w-px bg-[var(--color-office-on-dark)]/20" />
                  <span className="tabular">{project.year}</span>
                </div>
              </div>

              <button
                onClick={() => onOpenProject(project)}
                aria-label={`فتح ملف مشروع ${project.name}`}
                className="absolute inset-0 cursor-pointer"
                style={{ zIndex: 'calc(var(--z-base) + 1)' }}
              >
                <span className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full border border-[var(--color-office-on-dark)]/15 bg-black/35 py-1.5 pr-3.5 pl-1.5 text-[10px] text-[var(--color-office-on-dark)]/85 backdrop-blur-md">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-office-gold)] text-[var(--color-office-on-gold)]">
                    <ArrowUpLeft className="h-3 w-3" weight="bold" />
                  </span>
                  <span>الملف الكامل</span>
                </span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ——— شريط التحكم: أسهم + مؤشر نقاط ——— */}
      {projects.length > 1 && (
        <div className="mt-4 flex items-center justify-center gap-3">
          {/* سهم يمين: ينقل النقطة والبطاقة إلى اليمين */}
          <button
            onClick={() => {
              const next = Math.max(0, activeIndex - 1);
              setActiveIndex(next);
              scrollTo(next);
            }}
            disabled={activeIndex <= 0}
            aria-label="المشروع السابق (يمين)"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-office-line)] text-[var(--color-office-muted)] transition-[border-color,color,opacity] duration-200 disabled:opacity-25 cursor-pointer"
          >
            <CaretRight className="h-3.5 w-3.5" weight="bold" />
          </button>

          {/* النقاط */}
          <div className="flex items-center gap-1.5">
            {projects.map((p, i) => (
              <button
                key={p.id}
                onClick={() => {
                  setActiveIndex(i);
                  scrollTo(i);
                }}
                aria-label={`الانتقال إلى ${p.name}`}
                className={`h-1.5 rounded-full transition-all duration-300 ease-[var(--ease-out)] cursor-pointer ${
                  i === activeIndex
                    ? 'w-6 bg-[var(--color-office-gold)]'
                    : 'w-1.5 bg-[var(--color-office-ink)]/20 hover:bg-[var(--color-office-ink)]/40'
                }`}
              />
            ))}
          </div>

          {/* سهم يسار: ينقل النقطة والبطاقة إلى اليسار */}
          <button
            onClick={() => {
              const next = Math.min(projects.length - 1, activeIndex + 1);
              setActiveIndex(next);
              scrollTo(next);
            }}
            disabled={activeIndex >= projects.length - 1}
            aria-label="المشروع التالي (يسار)"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-[var(--color-office-line)] text-[var(--color-office-muted)] transition-[border-color,color,opacity] duration-200 disabled:opacity-25 cursor-pointer"
          >
            <CaretLeft className="h-3.5 w-3.5" weight="bold" />
          </button>
        </div>
      )}
    </div>
  );
};

/* ============================================================ */

interface ProjectCardProps {
  project: ProjectItem;
  index: number;
  onOpen: () => void;
}

/** أنماط الامتداد داخل الشبكة: نمط متكرر كل أربع بطاقات يكسر الصف المتساوي. */
const SPANS = [
  'md:col-span-7 md:aspect-[16/11]',
  'md:col-span-5 md:aspect-[4/5] md:mt-14',
  'md:col-span-5 md:aspect-[4/5]',
  'md:col-span-7 md:aspect-[16/11] md:-mt-8',
];

const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onOpen }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

  /**
   * تتبّع المؤشر للحدّ المضيء. نكتب المتغيّرين على العنصر نفسه لا
   * على أب مشترك: تعيين متغيّر CSS على الأب يجبر المتصفح على إعادة
   * حساب أنماط كل الأبناء في كل حركة مؤشر.
   */
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - rect.left}px`);
    el.style.setProperty('--my', `${e.clientY - rect.top}px`);
  };

  return (
    <motion.div
      ref={cardRef}
      layout={!reduceMotion}
      onPointerMove={handlePointerMove}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 28, filter: 'blur(8px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.97 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{
        duration: 0.7,
        ease: [0.23, 1, 0.32, 1],
        delay: reduceMotion ? 0 : Math.min(index, 3) * 0.06,
      }}
      className={`spotlight bezel group relative aspect-[4/3] ${SPANS[index % SPANS.length]}`}
    >
      <div className="bezel-core relative h-full w-full">
        {/* تدرّج احتياطي أسفل الصورة: يظهر تلقائيًا إن فشل تحميلها. */}
        <div className="absolute inset-0" style={{ background: project.gradient }} />

        <SmartImage
          src={project.coverUrl}
          alt={`${project.name}، ${project.category} في ${project.location}`}
          className="scale-[1.03] transition-transform duration-[1.1s] ease-[var(--ease-out)] group-hover:scale-[1.09]"
        />

        {/* تعتيم متدرّج: خفيف في الأعلى ليبقى المشهد مقروءًا، وثقيل
            في الأسفل حيث يجلس النص. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(10,11,12,0.35) 0%, rgba(10,11,12,0.10) 40%, rgba(10,11,12,0.90) 100%)',
          }}
        />

        {/* المحتوى السفلي: الحدّ الأدنى فقط. */}
        <div
          className="absolute inset-x-0 bottom-0 p-5 pb-16 text-right sm:p-7 sm:pb-20"
          style={{ zIndex: 'var(--z-base)' }}
        >
          {/* سطر واحد قبل الاسم: التصنيف والحالة. الحالة تظهر
              بالذهبي حين يكون المشروع قيد التنفيذ فقط، لأن
              "مكتمل" هو الحالة المتوقعة ولا تستحق تمييزًا. */}
          <div className="mb-2.5 flex items-center gap-2.5 text-[11px] font-light text-[var(--color-office-on-dark)]/55">
            <span>{project.category}</span>
            {project.status !== 'مكتمل' && (
              <>
                <span
                  aria-hidden="true"
                  className="inline-block h-1 w-1 rounded-full bg-[var(--color-office-gold)]"
                />
                <span className="text-[var(--color-office-gold)]">{project.status}</span>
              </>
            )}
          </div>

          <h3 className="text-2xl leading-tight font-normal text-[var(--color-office-on-dark)] sm:text-[1.75rem] md:text-3xl">
            {project.name}
          </h3>

          {/* الموقع والسنة في سطر واحد ملاصق لبداية السطر: كانت
              أربع قيم مفصولة بثلاثة خطوط رأسية، تُقرأ كسطر بيانات
              تقني فوق صورة معمارية. وبقاؤها يمينًا يترك الزاوية
              اليسرى خالصة لزر "الملف الكامل". */}
          <div className="mt-2 flex items-baseline gap-2.5 text-[11px] font-light text-[var(--color-office-on-dark)]/50 sm:text-xs">
            <span>{project.location}</span>
            <span aria-hidden="true" className="inline-block h-3 w-px bg-[var(--color-office-on-dark)]/20" />
            <span className="tabular">{project.year}</span>
          </div>

          {/* خط ذهبي يُرسم من اليمين عند التحويم. تحوّل على
              transform:scaleX لا على width، فلا يُشغّل تخطيطًا. */}
          <span
            aria-hidden="true"
            className="mt-4 block h-px w-24 origin-right scale-x-0 bg-gradient-to-l from-[var(--color-office-gold)] to-transparent transition-transform duration-500 ease-[var(--ease-out)] group-hover:scale-x-100"
          />
        </div>

        {/*
          الزر الحقيقي يغطي البطاقة كلها، فيصبح هدف اللمس هو المساحة
          المرئية بأكملها لا رابطًا صغيرًا في الزاوية. الأيقونة داخل
          دائرتها الخاصة (نمط الزر داخل الزر)، وتتحرك قطريًا عند
          التحويم لتوليد شدّ حركي داخلي.
        */}
        <button
          onClick={onOpen}
          aria-label={`فتح ملف مشروع ${project.name}`}
          className="absolute inset-0 cursor-pointer"
          style={{ zIndex: 'calc(var(--z-base) + 1)' }}
        >
          <span className="absolute bottom-5 left-5 flex items-center gap-2.5 rounded-full border border-[var(--color-office-on-dark)]/15 bg-black/35 py-1.5 pr-4 pl-1.5 text-[11px] text-[var(--color-office-on-dark)]/85 backdrop-blur-md transition-colors duration-200 ease-[var(--ease-out)] group-hover:border-[var(--color-office-gold)]/55 sm:bottom-7 sm:left-7">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-office-gold)] text-[var(--color-office-on-gold)] transition-transform duration-300 ease-[var(--ease-out)] group-hover:-translate-x-0.5 group-hover:-translate-y-[1px] group-hover:scale-105">
              <ArrowUpLeft className="h-3.5 w-3.5" weight="bold" />
            </span>
            <span>الملف الكامل</span>
          </span>
        </button>
      </div>
    </motion.div>
  );
};
