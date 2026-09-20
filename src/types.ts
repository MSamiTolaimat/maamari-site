/**
 * تعريفات الأنواع المركزية للمشروع.
 *
 * ProjectItem وُسِّع ليحمل ما تحتاجه صفحة تفاصيل المشروع الكاملة
 * (معرض صور، جدول بيانات فنية، سرد من ثلاث حركات، لوحة خامات،
 * برنامج فراغي، جدول زمني، اعترافات مهنية) — بدل الحقول الثلاثة
 * السابقة التي كانت تكفي لبطاقة عرض فقط ولا تكفي لملف مشروع.
 */

/** صورة واحدة داخل معرض المشروع. */
export interface ProjectImage {
  /** رابط الصورة بدقة العرض. */
  url: string;
  /** وصف الصورة لقارئات الشاشة — إلزامي، لا يُترك فارغًا. */
  alt: string;
  /** تسمية تظهر أسفل الصورة في المعرض (اختيارية). */
  caption?: string;
  /**
   * وزن الصورة داخل شبكة المعرض. يسمح بمعرض غير متماثل
   * (صورة عريضة بجانب صورتين رأسيتين) بدل شبكة مربعات متساوية.
   */
  span?: 'wide' | 'tall' | 'normal';
}

/** سطر في جدول البيانات الفنية للمشروع. */
export interface ProjectMetaRow {
  label: string;
  value: string;
}

/** خامة واحدة في لوحة خامات المشروع. */
export interface ProjectMaterial {
  name: string;
  /** لون تقريبي يمثّل الخامة — يُعرض كعيّنة لونية. */
  swatch: string;
  /** أين استُخدمت هذه الخامة تحديدًا. */
  usage: string;
}

/** فراغ واحد ضمن البرنامج الفراغي للمشروع. */
export interface ProjectSpace {
  name: string;
  area: string;
  /** نسبة هذا الفراغ من إجمالي المساحة (0 إلى 100): تُرسم كشريط. */
  share: number;
}

/** مرحلة واحدة في الجدول الزمني للمشروع. */
export interface ProjectPhase {
  label: string;
  period: string;
  note: string;
}

/** السرد المكتوب للمشروع، مقسّم إلى ثلاث حركات. */
export interface ProjectNarrative {
  challenge: string;
  approach: string;
  outcome: string;
}

export type ProjectType = 'residential' | 'workplace' | 'hospitality' | 'cultural';

export interface ProjectItem {
  id: string;
  name: string;
  /** اسم لاتيني قصير يُستخدم كعلامة طباعية ثانوية. */
  latinName: string;
  category: string;
  /** تصنيف للفلترة — يطابق أحد معرّفات PROJECT_FILTERS. */
  type: ProjectType;
  location: string;
  year: string;
  status: 'مكتمل' | 'قيد التنفيذ' | 'قيد التصميم';
  /** تدرّج احتياطي يظهر إذا فشل تحميل صورة الغلاف. */
  gradient: string;
  accentColor: string;
  coverUrl: string;
  /** جملة واحدة تلخّص روح المشروع، تُعرض على الغلاف. */
  briefStatement: string;
  narrative: ProjectNarrative;
  gallery: ProjectImage[];
  meta: ProjectMetaRow[];
  materials: ProjectMaterial[];
  spaces: ProjectSpace[];
  phases: ProjectPhase[];
  /** أرقام مميزة تُعرض كثلاث بطاقات إحصائية داخل صفحة التفاصيل. */
  highlights: { value: string; label: string }[];
  /** جوائز أو نشر مهني — يُعرض فقط إن وُجد. */
  recognition?: string[];
}

export interface WorkStage {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  details: string[];
}

/** شهادة عميل. */
export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  project: string;
}
