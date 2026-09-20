import React from 'react';
import { motion, useReducedMotion } from 'motion/react';

/**
 * ============================================================
 * بدائيات الحركة المشتركة.
 *
 * قبل هذا الملف كان في المشروع ثلاث طرق مختلفة لإظهار عنصر عند
 * دخوله الشاشة: هوك useSectionInView مع أصناف transition، وحركة
 * whileInView مكتوبة يدويًا في كل قسم بأرقام مختلفة، ومكوّن
 * Reveal خاص بصفحة المشروع. النتيجة أن نصف الصفحة يدخل بإيقاع
 * ونصفها الآخر بإيقاع مختلف، وهو جزء أساسي من الإحساس بأن
 * الموقع مبني من تصميمين.
 *
 * الآن مصدر واحد: نفس المسافة (18 بكسل)، نفس المنحنى
 * (var(--ease-out))، نفس المدة، ونفس احترام تقليل الحركة.
 * ============================================================
 */

const EASE_OUT = [0.23, 1, 0.32, 1] as const;

interface RevealProps {
  children: React.ReactNode;
  /** تأخير الدخول بالثواني، للتتالي بين العناصر المتجاورة. */
  delay?: number;
  /** مسافة الصعود بالبكسل. تُصفَّر تلقائيًا مع تقليل الحركة. */
  y?: number;
  className?: string;
  as?: 'div' | 'li' | 'article' | 'figure' | 'section';
}

export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  y = 18,
  className = '',
  as = 'div',
}) => {
  const reduceMotion = useReducedMotion();
  const Component = motion[as];

  return (
    <Component
      className={className}
      initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{
        duration: reduceMotion ? 0.2 : 0.7,
        delay: reduceMotion ? 0 : delay,
        ease: EASE_OUT,
      }}
    >
      {children}
    </Component>
  );
};

/**
 * عنوان يدخل كلمة كلمة بفارق 45 مللي ثانية.
 *
 * الغرض تدرّج هرمي لا زينة: العين تتبع الجملة وهي تُكتب فتصل إلى
 * آخر كلمة وهي منتبهة، بدل أن تستقبل الكتلة كاملة دفعة واحدة.
 * مطبَّق على عناوين الأقسام فقط (مرة واحدة لكل قسم)، لا على أي
 * نص يُقرأ بتكرار.
 *
 * الكلمات تُلفّ في span بـ inline-block حتى تقبل transform، مع
 * مسافة حقيقية بينها فلا يلتصق النص لو عُطّلت الحركة.
 */
export const RevealWords: React.FC<{
  text: string;
  className?: string;
  delay?: number;
}> = ({ text, className = '', delay = 0 }) => {
  const reduceMotion = useReducedMotion();
  const words = text.split(' ');

  if (reduceMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ opacity: 0, y: '0.5em' }}
            whileInView={{ opacity: 1, y: '0em' }}
            viewport={{ once: true, margin: '0px 0px -80px 0px' }}
            transition={{
              duration: 0.65,
              delay: delay + i * 0.045,
              ease: EASE_OUT,
            }}
          >
            {word}
          </motion.span>
          {i < words.length - 1 && <span>&nbsp;</span>}
        </span>
      ))}
    </span>
  );
};

/**
 * الخط الذهبي الذي يُرسم تحت عناوين الأقسام.
 * ينمو على scaleX من جهة البداية (اليمين في RTL).
 */
export const DrawLine: React.FC<{ className?: string; delay?: number }> = ({
  className = '',
  delay = 0,
}) => {
  const reduceMotion = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{
        duration: reduceMotion ? 0 : 0.9,
        delay: reduceMotion ? 0 : delay,
        ease: EASE_OUT,
      }}
      className={`block h-px origin-right bg-gradient-to-l from-[var(--color-office-gold)] to-transparent ${className}`}
    />
  );
};
