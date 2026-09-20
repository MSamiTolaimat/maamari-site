import React, { useState } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  className?: string;
  /** يُمرَّر للصور الظاهرة فوق الطية فقط، فتُحمَّل فورًا بلا تكاسل. */
  priority?: boolean;
  /** نسبة أبعاد ثابتة تمنع قفز التخطيط قبل اكتمال التحميل. */
  aspect?: string;
}

/**
 * صورة بثلاث حالات صريحة: تحميل، نجاح، فشل.
 *
 * لماذا مكوّن مستقل بدل <img> مباشرة:
 * - كل الصور هنا خارجية (Unsplash). فشل الشبكة أو تغيّر معرّف الصورة
 *   كان سيترك مستطيلًا أبيض مكسورًا داخل تصميم داكن. الآن يظهر بدلًا
 *   منه سطح محايد بعلامة معمارية خفيفة، فلا ينكسر الانطباع البصري.
 * - الانتقال من التحميل إلى الظهور تلاشٍ على opacity فقط — لا حركة
 *   موضع، فلا يوجد ما يقفز أثناء التمرير.
 */
export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  className = '',
  priority = false,
  aspect,
}) => {
  const [state, setState] = useState<'loading' | 'ready' | 'failed'>('loading');

  return (
    <span
      className="relative block w-full h-full overflow-hidden bg-[var(--color-office-surface)]"
      style={aspect ? { aspectRatio: aspect } : undefined}
    >
      {/* سطح الانتظار: شبكة مخطط دقيقة بدل هيكل رمادي نابض — يبقى
          ضمن اللغة البصرية للموقع بدل إدخال نمط تحميل عام غريب عنه. */}
      {state !== 'ready' && (
        <span
          aria-hidden="true"
          className="absolute inset-0 blueprint-grid-fine bg-[var(--color-office-surface)]"
        />
      )}

      {state === 'failed' && (
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center"
        >
          <span className="w-10 h-10 border border-[var(--color-office-gold)]/35 rotate-45" />
        </span>
      )}

      {state !== 'failed' && (
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setState('ready')}
          onError={() => setState('failed')}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-[var(--ease-out)] ${
            state === 'ready' ? 'opacity-100' : 'opacity-0'
          } ${className}`}
        />
      )}
    </span>
  );
};
