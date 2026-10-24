import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  X,
  ArrowRight,
  ArrowLeft,
  Medal,
  Ruler,
  Stack,
  Path,
  Images,
  CaretRight,
  CaretLeft,
} from '@phosphor-icons/react';
import { SmartImage } from './SmartImage';
import { ProjectItem } from '../types';
import { getNextProject, getPrevProject } from '../data/projects';
import { ar } from '../lib/numerals';

interface ProjectDetailProps {
  project: ProjectItem | null;
  onClose: () => void;
  onNavigate: (project: ProjectItem) => void;
}

/**
 * ============================================================
 * صفحة تفاصيل المشروع.
 *
 * تُقدَّم كطبقة فوق الصفحة لا كمسار منفصل، لأن المشروع تطبيق
 * صفحة واحدة بلا موجّه (router) — والطبقة تحفظ موضع تمرير
 * المعرض خلفها، فيعود الزائر بعد الإغلاق إلى البطاقة نفسها
 * التي فتحها، لا إلى أعلى القسم.
 *
 * ترتيب القراءة مقصود: الصورة الكبرى تبني الانطباع، ثم الأرقام
 * تثبّته، ثم السرد الثلاثي يشرح "لماذا"، ثم البيانات الفنية
 * والمعرض يقدّمان الدليل.
 * ============================================================
 */
export const ProjectDetail: React.FC<ProjectDetailProps> = ({
  project,
  onClose,
  onNavigate,
}) => {
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const isOpen = project !== null;

  /* ——— قفل تمرير الصفحة خلف الطبقة ———
     بدون هذا، عجلة الفأرة فوق الطبقة تمرّر الصفحة تحتها، فيفقد
     الزائر موضعه في المعرض عند الإغلاق. */
  useEffect(() => {
    if (!isOpen) return;
    const html = document.documentElement;
    html.classList.add('scroll-locked');
    return () => html.classList.remove('scroll-locked');
  }, [isOpen]);

  /* ——— إدارة التركيز ———
     عند الفتح: حفظ العنصر الذي كان يحمل التركيز، ونقل التركيز إلى
     زر الإغلاق. عند الإغلاق: إعادته إلى بطاقة المشروع نفسها — وإلا
     عاد مستخدم لوحة المفاتيح إلى أول الصفحة. */
  useEffect(() => {
    if (isOpen) {
      restoreFocusRef.current = document.activeElement as HTMLElement;
      const t = window.setTimeout(() => closeBtnRef.current?.focus(), 80);
      return () => window.clearTimeout(t);
    }
    restoreFocusRef.current?.focus?.();
  }, [isOpen]);

  /* ——— مفاتيح لوحة المفاتيح ———
     Escape يغلق المعاينة المكبّرة أولًا إن كانت مفتوحة، ثم الطبقة —
     ترتيب الإغلاق يتبع ترتيب الفتح. */
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (lightboxIndex !== null) setLightboxIndex(null);
        else onClose();
      }
    },
    [isOpen, lightboxIndex, onClose],
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  /* عند الانتقال لمشروع آخر: العودة إلى أعلى الطبقة، وإلا بقي
     الزائر في منتصف المحتوى وكأن شيئًا لم يتغيّر. */
  const goTo = (next: ProjectItem) => {
    // إغلاق أي معاينة مكبّرة قبل التبديل: الفهرس يشير إلى معرض
    // المشروع القديم، وإبقاؤه يفتح صورة من مشروع آخر.
    setLightboxIndex(null);
    onNavigate(next);
    scrollRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          key="project-detail"
          role="dialog"
          aria-modal="true"
          aria-label={`ملف مشروع ${project.name}`}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
          transition={{ duration: 0.34, ease: [0.23, 1, 0.32, 1] }}
          className="fixed inset-0 bg-[var(--color-office-bg)]"
          style={{ zIndex: 'var(--z-overlay)' }}
        >
          <div
            ref={scrollRef}
            className="slim-scroll h-full w-full overflow-y-auto overscroll-contain"
          >
            {/* ——— الشريط العلوي الثابت داخل الطبقة ——— */}
            <header className="sticky top-0 z-20 border-b border-[var(--color-office-line)] bg-[var(--color-office-bg)]/85 backdrop-blur-xl">
              <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
                <div className="flex min-w-0 items-baseline gap-2.5 text-right">
                  <span className="truncate text-sm font-normal text-[var(--color-office-ink)]">
                    {project.name}
                  </span>
                  <span className="hidden truncate text-[11px] text-[var(--color-office-muted)] sm:inline">
                    {project.latinName}
                  </span>
                </div>

                <button
                  ref={closeBtnRef}
                  onClick={onClose}
                  className="group flex shrink-0 items-center gap-2 rounded-full border border-[var(--color-office-line)] bg-[var(--color-office-ink)]/[0.03] py-1.5 pl-1.5 pr-3.5 text-[11px] text-[var(--color-office-muted)] transition-[border-color,color,transform] duration-200 ease-[var(--ease-out)] hover:scale-[1.03] hover:border-[var(--color-office-gold)]/45 hover:text-[var(--color-office-ink)] cursor-pointer"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-office-ink)]/8 transition-transform duration-200 ease-[var(--ease-out)] group-hover:scale-105">
                    <X className="h-3 w-3" weight="bold" />
                  </span>
                  <span>إغلاق</span>
                  <kbd className="hidden rounded border border-[var(--color-office-line)] px-1 text-[9px] text-[var(--color-office-muted)]/70 sm:inline">
                    ESC
                  </kbd>
                </button>
              </div>
            </header>

            {/* ——— 1. الغلاف ——— */}
            <section className="relative h-[62vh] min-h-[380px] w-full overflow-hidden sm:h-[72vh]">
              <div className="absolute inset-0" style={{ background: project.gradient }} />
              <SmartImage
                src={project.coverUrl}
                alt={`${project.name} — لقطة الغلاف`}
                priority
              />
              <div
                aria-hidden="true"
                className="absolute inset-0"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(10,11,12,0.35) 0%, rgba(10,11,12,0.15) 40%, rgba(20,21,22,0.97) 100%)',
                }}
              />

              <div className="absolute bottom-0 inset-x-0">
                <div className="mx-auto max-w-6xl px-5 pb-10 sm:px-8 sm:pb-14 text-right">
                  <motion.div
                    initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1, ease: [0.23, 1, 0.32, 1] }}
                  >
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-[var(--color-office-gold)]/40 bg-[var(--color-office-gold)]/10 px-2.5 py-1 text-[10px] tracking-[0.18em] text-[var(--color-office-gold)]">
                        {project.category}
                      </span>
                      <span className="rounded-full border border-[var(--color-office-on-dark)]/15 bg-black/30 px-2.5 py-1 text-[10px] text-[var(--color-office-on-dark)]/70 backdrop-blur-sm">
                        {project.status}
                      </span>
                    </div>

                    <h1 className="mb-3 text-4xl font-light leading-[1.15] text-[var(--color-office-on-dark)] sm:text-6xl md:text-7xl">
                      {project.name}
                    </h1>

                    <p className="max-w-2xl text-sm font-light leading-relaxed text-[var(--color-office-on-dark)]/70 sm:text-base">
                      {project.briefStatement}
                    </p>

                    <div className="tabular mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-[11px] text-[var(--color-office-on-dark)]/50 sm:text-xs">
                      <span>{project.location}</span>
                      <span aria-hidden="true" className="h-3 w-px bg-[var(--color-office-on-dark)]/20" />
                      <span>{project.year}</span>
                      <span aria-hidden="true" className="h-3 w-px bg-[var(--color-office-on-dark)]/20" />
                      <span className="tracking-[0.18em]">{project.latinName}</span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </section>

            <div className="mx-auto max-w-6xl px-5 sm:px-8">
              {/* ——— 2. الأرقام المميزة ——— */}
              <section className="grid grid-cols-1 gap-4 border-b border-[var(--color-office-line)] py-12 sm:grid-cols-3 sm:py-16">
                {project.highlights.map((h, i) => (
                  <Reveal key={h.label} delay={i * 0.07}>
                    <div className="bezel h-full">
                      <div className="bezel-core h-full p-5 text-right sm:p-6">
                        <span className="tabular block text-3xl font-light text-[var(--color-office-gold)] sm:text-4xl">
                          {h.value}
                        </span>
                        <span className="mt-2 block text-xs font-light leading-relaxed text-[var(--color-office-muted)]">
                          {h.label}
                        </span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </section>

              {/* ——— 3. السرد الثلاثي ——— */}
              <section className="border-b border-[var(--color-office-line)] py-14 sm:py-20">
                <SectionLabel icon={Path} text="قراءة المشروع" />

                <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3 sm:gap-10">
                  {[
                    { key: 'challenge', num: ar('01'), title: 'الحيز قبل التدخّل', body: project.narrative.challenge },
                    { key: 'approach', num: ar('02'), title: 'القرار التصميمي', body: project.narrative.approach },
                    { key: 'outcome', num: ar('03'), title: 'ما الذي تغيّر', body: project.narrative.outcome },
                  ].map((mv, i) => (
                    <Reveal key={mv.key} delay={i * 0.08}>
                      <article className="text-right">
                        <div className="mb-3 flex items-center gap-2.5">
                          <span className="tabular text-xs font-medium text-[var(--color-office-gold)]">
                            {mv.num}
                          </span>
                          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-[var(--color-office-gold)]/60" />
                          <h3 className="text-base font-normal text-[var(--color-office-ink)]">
                            {mv.title}
                          </h3>
                        </div>
                        <span
                          aria-hidden="true"
                          className="mb-4 block h-px w-full bg-gradient-to-l from-[var(--color-office-gold)]/45 to-transparent"
                        />
                        <p className="text-sm font-light leading-[1.9] text-[var(--color-office-muted)]">
                          {mv.body}
                        </p>
                      </article>
                    </Reveal>
                  ))}
                </div>
              </section>

              {/* ——— 4. البيانات الفنية ——— */}
              <section className="border-b border-[var(--color-office-line)] py-14 sm:py-20">
                <SectionLabel icon={Ruler} text="البيانات الفنية" />

                <dl className="mt-8 grid grid-cols-1 gap-x-12 sm:grid-cols-2">
                  {project.meta.map((row, i) => (
                    <Reveal key={row.label} delay={Math.min(i, 5) * 0.04}>
                      <div className="flex items-baseline justify-between gap-6 border-b border-[var(--color-office-line)] py-3.5 text-right">
                        <dt className="shrink-0 text-[11px] text-[var(--color-office-muted)]/75 sm:text-xs">
                          {row.label}
                        </dt>
                        <dd className="tabular text-xs font-light text-[var(--color-office-ink)] sm:text-sm">
                          {row.value}
                        </dd>
                      </div>
                    </Reveal>
                  ))}
                </dl>
              </section>

              {/* ——— 5. المعرض ——— */}
              <section className="border-b border-[var(--color-office-line)] py-14 sm:py-20">
                <SectionLabel icon={Images} text={`معرض المشروع، ${ar(project.gallery.length)} لقطات`} />

                <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
                  {project.gallery.map((shot, i) => (
                    <Reveal
                      key={shot.url + i}
                      delay={Math.min(i, 5) * 0.05}
                      className={
                        shot.span === 'wide'
                          ? 'col-span-2 md:col-span-2'
                          : shot.span === 'tall'
                            ? 'col-span-2 row-span-2 md:col-span-1'
                            : 'col-span-1'
                      }
                    >
                      <button
                        onClick={() => setLightboxIndex(i)}
                        aria-label={`تكبير الصورة: ${shot.alt}`}
                        className="spotlight group relative block h-full w-full cursor-zoom-in overflow-hidden rounded-[var(--radius-core)] border border-[var(--color-office-line)]"
                      >
                        <SmartImage
                          src={shot.url}
                          alt={shot.alt}
                          aspect={shot.span === 'tall' ? '3/4' : shot.span === 'wide' ? '16/9' : '4/3'}
                          className="transition-transform duration-700 ease-[var(--ease-out)] group-hover:scale-[1.06]"
                        />
                        {shot.caption && (
                          <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 text-right text-[10px] font-light leading-snug text-[var(--color-office-on-dark)]/80 opacity-0 transition-opacity duration-300 ease-[var(--ease-out)] group-hover:opacity-100 sm:text-[11px]">
                            {shot.caption}
                          </span>
                        )}
                      </button>
                    </Reveal>
                  ))}
                </div>
              </section>

              {/* ——— 6. لوحة الخامات ——— */}
              <section className="border-b border-[var(--color-office-line)] py-14 sm:py-20">
                <SectionLabel icon={Stack} text="لوحة الخامات" />

                <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {project.materials.map((m, i) => (
                    <Reveal key={m.name} delay={Math.min(i, 5) * 0.05}>
                      <div className="flex h-full items-start gap-3.5 rounded-[var(--radius-core)] border border-[var(--color-office-line)] bg-[var(--color-office-ink)]/[0.02] p-3.5 text-right transition-colors duration-200 ease-[var(--ease-out)] hover:border-[var(--color-office-gold)]/30">
                        {/* عيّنة الخامة: مربع بحدّ داخلي فاتح يوحي بسمك
                            مادي، بدل دائرة لون مسطّحة. */}
                        <span
                          aria-hidden="true"
                          className="mt-0.5 h-9 w-9 shrink-0 rounded-[var(--radius-field)] shadow-[inset_0_1px_0_rgba(255,255,255,0.22),inset_0_-1px_0_rgba(0,0,0,0.3)]"
                          style={{ backgroundColor: m.swatch }}
                        />
                        <div className="min-w-0">
                          <span className="block text-xs font-normal text-[var(--color-office-ink)] sm:text-sm">
                            {m.name}
                          </span>
                          <span className="mt-1 block text-[11px] font-light leading-relaxed text-[var(--color-office-muted)]/85">
                            {m.usage}
                          </span>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </section>

              {/* ——— 7. البرنامج الفراغي ——— */}
              <section className="border-b border-[var(--color-office-line)] py-14 sm:py-20">
                <SectionLabel icon={Ruler} text="توزيع البرنامج الفراغي" />

                <div className="mt-8 space-y-4">
                  {project.spaces.map((s, i) => (
                    <Reveal key={s.name} delay={Math.min(i, 5) * 0.05}>
                      <div className="text-right">
                        <div className="mb-1.5 flex items-baseline justify-between gap-4">
                          <span className="text-xs font-light text-[var(--color-office-ink)] sm:text-sm">
                            {s.name}
                          </span>
                          <span className="tabular text-[11px] text-[var(--color-office-muted)]">
                            {s.area} · {ar(s.share)}%
                          </span>
                        </div>

                        {/* الشريط ينمو على transform:scaleX من اليمين — لا
                            على width، فلا يُشغّل حساب تخطيط في كل إطار. */}
                        <div className="h-[3px] w-full overflow-hidden rounded-full bg-[var(--color-office-ink)]/8">
                          <motion.div
                            initial={{ scaleX: 0 }}
                            whileInView={{ scaleX: s.share / 100 }}
                            viewport={{ once: true }}
                            transition={{
                              duration: reduceMotion ? 0 : 0.85,
                              delay: reduceMotion ? 0 : 0.1 + i * 0.06,
                              ease: [0.23, 1, 0.32, 1],
                            }}
                            className="h-full origin-right rounded-full bg-gradient-to-l from-[var(--color-office-gold)] to-[var(--color-office-gold-soft)]"
                          />
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </div>
              </section>

              {/* ——— 8. الجدول الزمني ——— */}
              <section className="border-b border-[var(--color-office-line)] py-14 sm:py-20">
                <SectionLabel icon={Path} text="مسار المشروع" />

                <ol className="relative mt-8 pr-6">
                  {/* الخط الرأسي الرابط — يمين العناصر لأن الاتجاه RTL. */}
                  <span
                    aria-hidden="true"
                    className="absolute right-[3px] top-2 bottom-2 w-px bg-gradient-to-b from-[var(--color-office-gold)]/55 via-[var(--color-office-line)] to-transparent"
                  />
                  {project.phases.map((p, i) => (
                    <Reveal key={p.label} delay={i * 0.07}>
                      <li className="relative pb-8 text-right last:pb-0">
                        <span
                          aria-hidden="true"
                          className="absolute right-[-25px] top-1.5 h-[9px] w-[9px] rounded-full border border-[var(--color-office-gold)] bg-[var(--color-office-bg)]"
                        />
                        <div className="mb-1 flex flex-wrap items-baseline gap-x-3">
                          <h4 className="text-sm font-normal text-[var(--color-office-ink)]">
                            {p.label}
                          </h4>
                          <span className="tabular text-[11px] text-[var(--color-office-muted)]/70">
                            {p.period}
                          </span>
                        </div>
                        <p className="text-xs font-light leading-relaxed text-[var(--color-office-muted)]">
                          {p.note}
                        </p>
                      </li>
                    </Reveal>
                  ))}
                </ol>
              </section>

              {/* ——— 9. الاعتراف المهني (شرطي) ——— */}
              {project.recognition && project.recognition.length > 0 && (
                <section className="border-b border-[var(--color-office-line)] py-14 sm:py-20">
                  <SectionLabel icon={Medal} text="اعتراف مهني" />
                  <ul className="mt-6 space-y-3">
                    {project.recognition.map((r, i) => (
                      <Reveal key={r} delay={i * 0.06}>
                        <li className="flex items-start gap-3 text-right">
                          <span
                            aria-hidden="true"
                            className="mt-[7px] h-1.5 w-1.5 shrink-0 rotate-45 border border-[var(--color-office-gold)]"
                          />
                          <span className="text-sm font-light leading-relaxed text-[var(--color-office-muted)]">
                            {r}
                          </span>
                        </li>
                      </Reveal>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            {/* ——— 10. التنقّل بين المشاريع ——— */}
            <nav
              aria-label="التنقّل بين المشاريع"
              className="mx-auto grid max-w-6xl grid-cols-1 gap-3 px-5 py-14 sm:grid-cols-2 sm:px-8 sm:py-20"
            >
              <AdjacentProject
                project={getPrevProject(project.id)}
                direction="prev"
                onSelect={goTo}
              />
              <AdjacentProject
                project={getNextProject(project.id)}
                direction="next"
                onSelect={goTo}
              />
            </nav>

            {/* ——— ذيل الطبقة ——— */}
            <div className="border-t border-[var(--color-office-line)] px-5 py-8 text-center sm:px-8">
              <button
                onClick={onClose}
                className="text-xs text-[var(--color-office-gold)] transition-opacity duration-200 hover:opacity-75 cursor-pointer"
              >
                العودة إلى فهرس الأعمال
              </button>
            </div>
          </div>

          {/* ——— المعاينة المكبّرة ——— */}
          <Lightbox
            images={project.gallery}
            index={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
            onIndexChange={setLightboxIndex}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ============================================================ */

/** عنوان قسم داخلي موحّد — يمنع تكرار نفس التركيب في تسعة مواضع. */
const SectionLabel: React.FC<{ icon: React.ElementType; text: string }> = ({
  icon: Icon,
  text,
}) => (
  <div className="flex items-center gap-2.5">
    <Icon className="h-3.5 w-3.5 text-[var(--color-office-gold)]" weight="light" />
    <span className="text-[11px] tracking-[0.2em] text-[var(--color-office-gold)]">
      {text}
    </span>
    <span aria-hidden="true" className="h-px flex-1 bg-[var(--color-office-line)]" />
  </div>
);

/** غلاف كشف عند الدخول للعرض — تلاشٍ وارتفاع خفيف مع تتالٍ. */
const Reveal: React.FC<{
  children: React.ReactNode;
  delay?: number;
  className?: string;
}> = ({ children, delay = 0, className = '' }) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -40px 0px' }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.6,
        delay: reduceMotion ? 0 : delay,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      {children}
    </motion.div>
  );
};

/** بطاقة المشروع المجاور في أسفل صفحة التفاصيل. */
const AdjacentProject: React.FC<{
  project: ProjectItem;
  direction: 'prev' | 'next';
  onSelect: (p: ProjectItem) => void;
}> = ({ project, direction, onSelect }) => {
  const isNext = direction === 'next';
  // في RTL، "التالي" يتقدّم نحو اليسار.
  const Icon = isNext ? ArrowLeft : ArrowRight;

  return (
    <button
      onClick={() => onSelect(project)}
      className="spotlight bezel group text-right cursor-pointer"
    >
      <div className="bezel-core relative flex items-center gap-4 p-4">
        <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-[var(--radius-field)]">
          <div className="absolute inset-0" style={{ background: project.gradient }} />
          <SmartImage src={project.coverUrl} alt="" />
        </div>

        <div className="min-w-0 flex-1">
          <span className="mb-1 flex items-center gap-1.5 text-[10px] tracking-[0.18em] text-[var(--color-office-gold)]">
            <Icon
              className="h-3 w-3 transition-transform duration-300 ease-[var(--ease-out)] group-hover:translate-x-[-2px]"
              weight="bold"
            />
            {isNext ? 'المشروع التالي' : 'المشروع السابق'}
          </span>
          <span className="block truncate text-sm font-light text-[var(--color-office-ink)]">
            {project.name}
          </span>
          <span className="block truncate text-[11px] text-[var(--color-office-muted)]/70">
            {project.category} · {project.year}
          </span>
        </div>
      </div>
    </button>
  );
};

/* ============================================================ */

/**
 * المعاينة المكبّرة.
 *
 * طبقة مستقلة فوق صفحة التفاصيل بمستوى z أعلى. التنقّل بالأسهم
 * يمين/يسار مدعوم لأن المستخدم الذي فتح صورة سيريد التالية غالبًا،
 * ومدّ يده للفأرة في كل مرة احتكاك بلا سبب.
 */
const Lightbox: React.FC<{
  images: ProjectItem['gallery'];
  index: number | null;
  onClose: () => void;
  onIndexChange: (i: number) => void;
}> = ({ images, index, onClose, onIndexChange }) => {
  const reduceMotion = useReducedMotion();
  const open = index !== null;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') onIndexChange((index! + 1) % images.length);
      if (e.key === 'ArrowRight') onIndexChange((index! - 1 + images.length) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, index, images.length, onIndexChange]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="معاينة الصورة"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          onClick={onClose}
          className="fixed inset-0 flex flex-col items-center justify-center bg-black/92 backdrop-blur-sm p-4 sm:p-10"
          style={{ zIndex: 'var(--z-lightbox)' }}
        >
          <motion.figure
            key={index}
            initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-full w-full max-w-5xl"
          >
            <img
              src={images[index!].url}
              alt={images[index!].alt}
              className="mx-auto max-h-[74vh] w-auto rounded-[var(--radius-core)] object-contain"
            />
            <figcaption className="mt-4 text-center text-xs font-light text-[var(--color-office-on-dark)]/70">
              {images[index!].caption ?? images[index!].alt}
              <span className="tabular me-3 text-[var(--color-office-gold)]">
                {ar(index! + 1)} / {ar(images.length)}
              </span>
            </figcaption>
          </motion.figure>

          {/* أدوات التنقّل — توقف انتشار النقر حتى لا تُغلق الطبقة. */}
          <div
            className="mt-6 flex items-center gap-2"
            onClick={(e) => e.stopPropagation()}
          >
            <LightboxBtn
              label="الصورة السابقة"
              onClick={() => onIndexChange((index! - 1 + images.length) % images.length)}
            >
              <CaretRight className="h-4 w-4" weight="bold" />
            </LightboxBtn>

            <button
              onClick={onClose}
              className="rounded-full border border-[var(--color-office-on-dark)]/15 px-4 py-2 text-[11px] text-[var(--color-office-on-dark)]/70 transition-[color,border-color,transform] duration-200 hover:scale-[1.04] hover:border-[var(--color-office-gold)]/50 hover:text-[var(--color-office-on-dark)] cursor-pointer"
            >
              إغلاق المعاينة
            </button>

            <LightboxBtn
              label="الصورة التالية"
              onClick={() => onIndexChange((index! + 1) % images.length)}
            >
              <CaretLeft className="h-4 w-4" weight="bold" />
            </LightboxBtn>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const LightboxBtn: React.FC<{
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, onClick, children }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-office-on-dark)]/15 text-[var(--color-office-on-dark)]/75 transition-[transform,border-color] duration-200 ease-[var(--ease-out)] hover:scale-110 hover:border-[var(--color-office-gold)]/50 active:scale-95 cursor-pointer"
  >
    {children}
  </button>
);
