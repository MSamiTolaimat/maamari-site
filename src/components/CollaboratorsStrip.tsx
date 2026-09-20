import React from 'react';

/**
 * ============================================================
 * شريط المتعاونين.
 *
 * كان جزءًا من قسم "سجل الاستوديو" الذي حُذف بعد نزول أرقامه إلى
 * قسم "من نحن". بقي الشريط وحده لأنه يؤدي عملًا مختلفًا: الأرقام
 * تقول ماذا أنجز المكتب، وهذا يقول مع من.
 *
 * الحركة مستمرة بسرعة ثابتة. linear هو المنحنى الصحيح الوحيد
 * لحركة لا نهائية؛ أي منحنى آخر يُظهر تسارعًا وتباطؤًا دوريًا
 * تلتقطه العين فورًا. القائمة مكرّرة مرتين ليبدو الدوران بلا
 * انقطاع، والنسخة الثانية مخفية عن قارئات الشاشة.
 *
 * كل اسم يسبقه مربع بحرفه الأول: هذه أسماء شركات، والعلامة
 * الصغيرة تجعل الشريط يُقرأ كصف شعارات لا كقائمة نصية.
 * ============================================================
 */

const COLLABORATORS = [
  'بناء الأفق للمقاولات',
  'استوديو ضوء، دبي',
  'مجموعة صدى الهندسية',
  'مصنع الحرفة للنجارة',
  'أمانة منطقة الرياض',
  'مجموعة نجد للضيافة',
  'محاجر الرياض للحجر الطبيعي',
  'دارين للاستشارات',
];

export const CollaboratorsStrip: React.FC = () => (
  // الحشو الخارجي كان py-6 (24px) فقط، مضغوطًا بين قسمين بحشو
  // 96-128px (من نحن قبله، ومنهجية التنفيذ بعده). فرق بهذا الحجم
  // يُحسّ كنقطة اختناق في إيقاع الصفحة، لا كتباين مقصود. رفعناه
  // إلى py-14 sm:py-16 ليقترب من حشو الأقسام المجاورة دون أن
  // يفقد الشريط طابعه كـ"موجة عابرة" رفيعة الكثافة داخليًا
  // (الحشو الداخلي py-4 بقي كما هو؛ الإضافة كلها في الحافة
  // الخارجية حيث يبدأ التحوّل من القسم السابق وإليه).
  <div className="relative px-0 py-14 sm:py-16">
    <div className="marquee-mask relative overflow-hidden py-4">
      <div className="animate-marquee flex w-max items-center gap-10 sm:gap-16">
        {[0, 1].map((copy) => (
          <div key={copy} aria-hidden={copy === 1} className="flex items-center gap-10 sm:gap-16">
            {COLLABORATORS.map((name) => (
              <span
                key={name}
                className="flex shrink-0 items-center gap-3 text-xs font-light whitespace-nowrap text-[var(--color-office-muted)]/55 sm:text-sm"
              >
                <span
                  aria-hidden="true"
                  className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-field)] border border-[var(--color-office-gold)]/25 bg-[var(--color-office-gold)]/[0.06] text-[11px] text-[var(--color-office-gold)]/80"
                >
                  {name.charAt(0)}
                </span>
                {name}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  </div>
);
