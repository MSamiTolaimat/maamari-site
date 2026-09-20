/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useMotionValue, useMotionValueEvent, useScroll } from 'motion/react';
import { Preloader } from './components/Preloader';
import { ScrollProgressBar } from './components/ScrollProgressBar';
import { Navigation } from './components/Navigation';
import { HeroCurtain } from './components/HeroCurtain';
import { AboutSection } from './components/AboutSection';
import { CollaboratorsStrip } from './components/CollaboratorsStrip';
import { SiteAtmosphere, CursorCompanion } from './components/Atmosphere';
import { WorkflowSection } from './components/WorkflowSection';
import { ProjectsGallery } from './components/ProjectsGallery';
import { TestimonialsSection } from './components/TestimonialsSection';
import { PhilosophyStatement } from './components/PhilosophyStatement';
import { ContactFooter } from './components/ContactFooter';
import { ProjectItem } from './types';

/**
 * طبقة تفاصيل المشروع تُحمَّل عند الطلب لا مع الصفحة.
 *
 * السبب قياس لا ذوق: الطبقة (مع معرضها ومعاينتها المكبّرة) تمثّل جزءًا
 * معتبرًا من حزمة JS، ولا يفتحها كل زائر. تأجيلها يُقصّر زمن التفاعل
 * الأول لكل من يتصفّح الصفحة فقط.
 */
const ProjectDetail = lazy(() =>
  import('./components/ProjectDetail').then((m) => ({ default: m.ProjectDetail })),
);

export default function App() {
  const [isRevealed, setIsRevealed] = useState(false);
  const [preloaderDone, setPreloaderDone] = useState(false);
  const heroTrackRef = useRef<HTMLDivElement>(null);

  /**
   * المشروع المفتوح حاليًا في طبقة التفاصيل. null = لا طبقة مفتوحة.
   * الحالة تعيش هنا لا داخل المعرض، لأن الطبقة تُعرض فوق الصفحة
   * كاملة وتحتاج أيضًا إخفاء الشريط العلوي — وهو شقيق للمعرض لا ابن له.
   */
  const [openProject, setOpenProject] = useState<ProjectItem | null>(null);

  /**
   * بمجرد أول فتح تبقى الطبقة مركّبة في الشجرة حتى لو أُغلقت.
   * لو أزلناها عند الإغلاق لاختفت فورًا بلا حركة خروج — AnimatePresence
   * لا يستطيع تحريك خروج مكوّن رُفع من الشجرة من فوقه.
   */
  const [detailMounted, setDetailMounted] = useState(false);

  const openProjectDetail = useCallback((project: ProjectItem) => {
    setDetailMounted(true);
    setOpenProject(project);
  }, []);

  // مصدر واحد مشترك لتقدّم "خروج الهيرو / دخول من نحن" — يُحسب مرة واحدة هنا
  // ويُمرَّر لكلا القسمين، بدل أن يحسب كل قسم رقمه الخاص بطريقته الخاصة.
  // القيمة motion value خام (لا React state): تتحدّث عبر .set() مباشرة من
  // حدث تمرير Motion بدل setState على كل إطار.
  const heroExitProgress = useMotionValue(0);
  const { scrollY } = useScroll();

  const recomputeHeroExit = useCallback(() => {
    const track = heroTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const containerHeight = track.offsetHeight;
    const windowHeight = window.innerHeight;
    const scrollableDistance = containerHeight - windowHeight;
    const introTravel = Math.max(320, Math.round(windowHeight * 0.4));

    if (scrollableDistance > introTravel) {
      const heroScrolled = Math.max(0, -rect.top - introTravel);
      const effectiveDistance = scrollableDistance - introTravel;
      const raw = heroScrolled / effectiveDistance;
      heroExitProgress.set(Math.min(1, Math.max(0, raw)));
    } else {
      heroExitProgress.set(0);
    }
  }, [heroExitProgress]);

  useMotionValueEvent(scrollY, 'change', () => {
    if (preloaderDone) recomputeHeroExit();
  });

  useEffect(() => {
    if (!preloaderDone) return;
    recomputeHeroExit();
    window.addEventListener('resize', recomputeHeroExit, { passive: true });
    return () => window.removeEventListener('resize', recomputeHeroExit);
  }, [preloaderDone, recomputeHeroExit]);

  return (
    <div className="relative min-h-dvh overflow-x-clip font-tajawal text-[var(--color-office-ink)] selection:bg-[var(--color-office-gold)]/30 selection:text-[var(--color-office-ink)]">
      {/* تخطّي إلى المحتوى — مخفي حتى يصله التركيز بلوحة المفاتيح.
          كان ناقصًا رغم وجود main-content أصلًا في الصفحة. */}
      <a
        href="#main-content"
        className="skip-link rounded-[var(--radius-field)] bg-[var(--color-office-gold)] px-4 py-2 text-xs font-medium text-[var(--color-office-on-gold)]"
      >
        تخطَّ إلى المحتوى الرئيسي
      </a>

      {/* الجو العام: خلفية وإضاءة الصفحة كلها في طبقة واحدة ثابتة
          خلف كل شيء. سابقًا كان كل قسم يحمل هالته داخل حاوية
          overflow-hidden، فتُقصّ الهالة عند حدّ القسم ويظهر خط قطع.
          مصدر ضوء واحد = لا حدود مرئية بين الأقسام. */}
      <SiteAtmosphere />

      {/* رفيق المؤشر: نقطة وحلقة تتبعان الفأرة بسرعتين مختلفتين.
          يختفي كليًا على اللمس ومع تقليل الحركة. */}
      <CursorCompanion />

      {/* 1. شاشة المقدمة */}
      <Preloader
        onStartReveal={() => setIsRevealed(true)}
        onComplete={() => {
          setIsRevealed(true);
          setPreloaderDone(true);
        }}
      />

      {/* مؤشر التمرير الذهبي — يختفي حين تفتح طبقة تفاصيل المشروع،
          لأنه يقيس تمرير الصفحة لا تمرير الطبقة، فيصبح مضللًا. */}
      {!openProject && <ScrollProgressBar />}

      <Navigation isRevealed={isRevealed} isHidden={openProject !== null} />

      <main id="main-content" className="relative w-full" style={{ zIndex: 1 }}>
        {/* 2 و3. الهيرو المثبّت مع انغلاق الستارة عند التمرير */}
        <HeroCurtain
          trackRef={heroTrackRef}
          isRevealed={isRevealed}
          isPreloaderDone={preloaderDone}
          heroExitProgress={heroExitProgress}
        />

        {/* 4. من نحن */}
        <AboutSection heroExitProgress={heroExitProgress} />

        {/* 5. شريط المتعاونين: أرقام المكتب نزلت إلى قسم "من نحن"
            أعلاه، وبقي هذا الشريط وحده لأنه يقول شيئًا آخر. */}
        <CollaboratorsStrip />

        {/* 6. منهجية التنفيذ: أربع مراحل في عرض أفقي دوّار، شاشة واحدة */}
        <WorkflowSection />

        {/* 7. فهرس الأعمال */}
        <ProjectsGallery onOpenProject={openProjectDetail} />

        {/* 8. آراء الملّاك بعد التسليم */}
        <TestimonialsSection />

        {/* 9. بيان الفلسفة */}
        <PhilosophyStatement />

        {/* 10. التواصل والتذييل */}
        <ContactFooter />
      </main>

      {/* طبقة تفاصيل المشروع — خارج <main> لأنها ليست جزءًا من تدفق
          المستند حين تُفتح، بل مشهد مستقل فوقه. */}
      {detailMounted && (
        <Suspense fallback={null}>
          <ProjectDetail
            project={openProject}
            onClose={() => setOpenProject(null)}
            onNavigate={setOpenProject}
          />
        </Suspense>
      )}

      {/* طبقة الحبيبات — ثابتة، بلا تفاعل، فوق كل شيء. تكسر السطوح
          الرقمية المسطّحة وتمنح الصفحة إحساس ورق مطبوع. */}
      <div className="grain-layer" aria-hidden="true" />
    </div>
  );
}
