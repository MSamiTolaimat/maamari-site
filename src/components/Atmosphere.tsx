import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';

/**
 * ============================================================
 * طبقة الجو العام.
 *
 * المشكلة التي تحلّها: كان كل قسم يحمل هالة ضوء خاصة به داخل
 * حاوية عليها overflow-hidden، فتُقصّ الهالة عند حدّ القسم
 * ويظهر خط قطع أفقي واضح. والأسوأ أن بعض الأقسام كانت تحمل هالة
 * وبعضها لا، فيبدو نصف الموقع مضاءً ونصفه سادة.
 *
 * الحل: مصدر إضاءة واحد لكل الصفحة، طبقة ثابتة خلف كل المحتوى،
 * لا تُقصّ لأنها ليست داخل أي قسم. كل الأقسام صارت شفافة الخلفية
 * فوقها، فلا فواصل ولا حدود بينها، والانتقال من قسم إلى آخر يصير
 * تغيّرًا في المحتوى لا انتقالًا بين لوحين.
 * ============================================================
 */
export const SiteAtmosphere: React.FC = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 overflow-hidden bg-[var(--color-office-bg)]"
    style={{ zIndex: 0 }}
  >
    {/* شبكة المخطط: نسيج واحد يمتد تحت الصفحة كلها. */}
    <div className="blueprint-grid absolute inset-0 opacity-[0.55]" />

    {/* ثلاثة مصادر ضوء تتنفّس ببطء شديد، بمواضع غير متناظرة حتى
        لا يقرأ التوزيع كزخرفة متماثلة. */}
    <div className="animate-ambient absolute top-[8%] right-[18%] h-[32rem] w-[32rem] rounded-full bg-[var(--color-office-gold)]/[0.055] blur-[120px]" />
    <div className="animate-ambient-slow absolute top-[46%] left-[8%] h-[28rem] w-[28rem] rounded-full bg-[var(--color-office-blue)]/[0.07] blur-[120px]" />
    <div className="animate-ambient absolute bottom-[6%] right-[32%] h-[26rem] w-[26rem] rounded-full bg-[var(--color-office-gold)]/[0.04] blur-[110px]" />

    {/* تعتيم الأطراف: يدفع الانتباه إلى وسط الشاشة. */}
    <div
      className="absolute inset-0"
      style={{
        background:
          'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(20,21,22,0.55) 100%)',
      }}
    />
  </div>
);

/**
 * ============================================================
 * رفيق المؤشر.
 *
 * نقطة ذهبية صغيرة تلتصق بالمؤشر، وحلقة أوسع تتأخر عنها بنابض.
 * فرق السرعة بين الاثنتين هو كل الفكرة: النقطة تقول "أنت هنا"
 * والحلقة تقول "كنت هناك قبل لحظة"، فيُقرأ العنصر كجسم له كتلة
 * لا كمؤشر ثانٍ.
 *
 * شروط الظهور:
 *   • جهاز بمؤشر دقيق فعلًا (فأرة). على اللمس لا يوجد مؤشر أصلًا،
 *     وعنصر يطارد آخر لمسة هو ضجيج محض.
 *   • المستخدم لم يطلب تقليل الحركة.
 *
 * الأداء: الموضع يُكتب في motion values مباشرة من حدث المؤشر،
 * فلا setState ولا إعادة رسم React في كل حركة. والحلقة تكبر عند
 * المرور فوق أي عنصر تفاعلي، فتصبح تأكيدًا للهدف لا زينة.
 * ============================================================
 */
export const CursorCompanion: React.FC = () => {
  const reduceMotion = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [isOverInteractive, setIsOverInteractive] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const rafRef = useRef<number | null>(null);

  const x = useMotionValue(-100);
  const y = useMotionValue(-100);

  // النقطة: نابض سريع وجافّ، تكاد تلتصق بالمؤشر.
  const dotX = useSpring(x, { stiffness: 900, damping: 45, mass: 0.35 });
  const dotY = useSpring(y, { stiffness: 900, damping: 45, mass: 0.35 });

  // الحلقة: نابض أبطأ وأثقل، تصل بعد النقطة بجزء من الثانية.
  const ringX = useSpring(x, { stiffness: 170, damping: 22, mass: 0.9 });
  const ringY = useSpring(y, { stiffness: 170, damping: 22, mass: 0.9 });

  useEffect(() => {
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    setEnabled(canHover && !reduceMotion);
  }, [reduceMotion]);

  useEffect(() => {
    if (!enabled) return;

    const handleMove = (e: PointerEvent) => {
      // تجميع الأحداث في إطار واحد: متصفحات كثيرة ترسل أحداث مؤشر
      // أكثر من عدد إطارات الشاشة، ومعالجتها كلها عمل مهدور.
      if (rafRef.current !== null) return;
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null;
        x.set(e.clientX);
        y.set(e.clientY);
        setIsVisible(true);

        const el = document.elementFromPoint(e.clientX, e.clientY);
        setIsOverInteractive(Boolean(el?.closest('a, button, input, textarea, [role="tab"]')));
      });
    };

    const handleLeave = () => setIsVisible(false);

    window.addEventListener('pointermove', handleMove, { passive: true });
    document.addEventListener('pointerleave', handleLeave);

    return () => {
      window.removeEventListener('pointermove', handleMove);
      document.removeEventListener('pointerleave', handleLeave);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0"
      style={{ zIndex: 'var(--z-cursor)' }}
    >
      <motion.span
        className="absolute top-0 left-0 block h-1.5 w-1.5 rounded-full bg-[var(--color-office-gold)]"
        style={{ x: dotX, y: dotY, translateX: '-50%', translateY: '-50%' }}
        animate={{ opacity: isVisible ? 1 : 0, scale: isOverInteractive ? 0.4 : 1 }}
        transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
      />
      <motion.span
        className="absolute top-0 left-0 block rounded-full border border-[var(--color-office-gold)]/45"
        style={{ x: ringX, y: ringY, translateX: '-50%', translateY: '-50%' }}
        animate={{
          opacity: isVisible ? (isOverInteractive ? 0.9 : 0.45) : 0,
          width: isOverInteractive ? 44 : 26,
          height: isOverInteractive ? 44 : 26,
        }}
        transition={{ duration: 0.32, ease: [0.23, 1, 0.32, 1] }}
      />
    </div>
  );
};
