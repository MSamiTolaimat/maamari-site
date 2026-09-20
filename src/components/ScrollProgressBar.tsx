import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

export const ScrollProgressBar: React.FC = () => {
  // نفس مسافة "رسم الخط" في المقدمة (Preloader) قبل أن يُفتح الهيرو —
  // نستثنيها من الحساب لأن بداية الموقع الفعلية (من منظور الزائر) تبدأ
  // بعد اكتمالها، لا من أول بكسل في الصفحة. يُحفَظ في ref (لا state) لأنه
  // لا يحتاج إعادة رسم — يُقرأ فقط داخل دالة useTransform أدناه.
  const introOffsetRef = useRef(Math.max(320, Math.round(window.innerHeight * 0.4)));

  useEffect(() => {
    const handleResize = () => {
      introOffsetRef.current = Math.max(320, Math.round(window.innerHeight * 0.4));
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // useScroll يوفّر scrollY كـ motion value عبر مستمع passive محسَّن من
  // Motion بدل window.addEventListener('scroll') الخام. useTransform يشتق
  // نسبة التقدّم منها مباشرة، وتُطبَّق كل إطار عبر style على motion.div
  // دون أي setState أو إعادة رسم لشجرة React.
  const { scrollY } = useScroll();
  const progress = useTransform(scrollY, (latest) => {
    const introOffset = introOffsetRef.current;
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight - introOffset;
    if (totalHeight <= 0) return 0;
    return Math.min(100, Math.max(0, ((latest - introOffset) / totalHeight) * 100));
  });

  /* النمو على scaleX لا على width: عرض العنصر يُشغّل حساب تخطيط
     في كل إطار تمرير، بينما التحويل يعمل على GPU وحده. */
  const scaleX = useTransform(progress, (v) => v / 100);

  /*
    مؤشر واحد لا اثنان. كان في الصفحة شريط علوي رفيع ومؤشر رأسي
    على الحافة اليمنى يقيسان الشيء نفسه في وقت واحد، فيتنافسان
    على انتباه لا يستحقه قياس التمرير أصلًا.
  */
  return (
    <div
      id="scroll-progress-bar-top"
      style={{ zIndex: 'var(--z-progress)' }}
      className="pointer-events-none fixed inset-x-0 top-0 h-[2px] bg-[var(--color-office-bg)]/40 backdrop-blur-xs"
    >
      <motion.div
        className="h-full w-full origin-right bg-gradient-to-l from-[var(--color-office-gold-soft)] via-[var(--color-office-gold)] to-[var(--color-office-gold)]/40"
        style={{ scaleX }}
      />
    </div>
  );
};
