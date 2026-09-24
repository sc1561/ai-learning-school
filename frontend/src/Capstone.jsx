import React, { useState } from 'react';
import './capstone.css';

export const capstoneBriefs = {
  ai: { title: 'نموذج مساعد تعليمي مسؤول', mission: 'صمّم فكرة مساعد تعليمي مرتبطة بموضوع هذا المسار. جهّز طلبًا واضحًا، وقارن نتيجتين اختباريتين، واشرح كيف تحققت منهما دون بيانات طلاب حقيقية.', criteria: ['هدف وجمهور واضحان', 'طلب دقيق مع قيود للخصوصية', 'اختبار حالتين وتوثيق النتائج', 'مراجعة الأخطاء واقتراح تحسين'] },
  cyber: { title: 'خطة فحص آمن لمختبر تدريبي', mission: 'اكتب خطة ضمن بيئة تدريبية مصرح بها فقط: نطاق العمل، القرائن، طريقة الفحص، والإصلاح المقترح. لا تفحص أجهزة المدرسة أو حساباتها.', criteria: ['نطاق وإذن واضحان', 'أدلة اصطناعية قابلة للتتبع', 'تفسير النتيجة دون مبالغة', 'إصلاح أو إجراء وقائي'] },
  ctf: { title: 'تقرير حل قضية التقاط علم', mission: 'اختر قضية من هذا المسار. وثّق الملف أو القرينة التي استخدمتها، خطوات الاستبعاد والتحقق، ثم اكتب تفسيرًا يصلح لعرضه على فريقك.', criteria: ['تحديد الأدلة المرتبطة', 'خطوات حل قابلة لإعادة التحقق', 'تبرير استبعاد قرينة مضللة', 'شرح واضح وحدود الاستنتاج'] },
  python: { title: 'برنامج لحل مشكلة من المسار', mission: 'اكتب برنامج بايثون صغيرًا من فكرة هذا المسار، وصف مدخلاته ومخرجاته، وجرب الحالات العادية والحدية ثم فسّر تحسينًا واحدًا.', criteria: ['حل يعمل لمدخلات متعددة', 'تحقق من المدخلات والحالات الحدية', 'اختبارات موثقة بنتائجها', 'شرح الفكرة وتحسين ممكن'] },
  data: { title: 'تحليل بيانات تدريبية', mission: 'استخدم أرقامًا افتراضية أو بيانات عامة في موضوع المسار. نظف القيم، احسب مؤشرًا مناسبًا، ثم فسّر النتيجة وحدودها.', criteria: ['مصدر بيانات مسموح وواضح', 'تنظيف ومعالجة القيم الشاذة', 'حساب يمكن إعادة فحصه', 'استنتاج يذكر حدود البيانات'] }
};
const fields = [
  ['goal', 'الهدف وخطة العمل', 'ما المشكلة؟ ولمن الحل؟ وما الخطوات؟'],
  ['artifact', 'العمل أو خطوات الحل', 'ضع هنا الكود أو الطلب أو خطوات القضية. لا تدخل بيانات خاصة أو روابط حساسة.'],
  ['tests', 'الاختبارات والأدلة', 'اذكر حالتين اختباريتين، والنتيجة المتوقعة والفعلية لكل حالة.'],
  ['reflection', 'المراجعة والتحسين', 'ما الذي لم ينجح؟ وكيف ستطوّر الحل؟']
];

export default function Capstone({ areaId, track, profile, updateProfile }) {
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState('');
  const brief = capstoneBriefs[areaId];
  if (!brief) return null;
  const entry = profile?.capstones?.[track.id] || {};
  const complete = fields.every(([key]) => (entry[key] || '').trim().length >= 20);
  const change = (key, value) => updateProfile(p => ({ ...p, capstones: { ...p.capstones, [track.id]: { ...p.capstones?.[track.id], [key]: value.slice(0, 4000), submittedAt: null } } }));
  const submit = () => {
    if (!complete) return setMessage('اكتب 20 حرفًا على الأقل في كل قسم قبل تجهيز العمل للمراجعة.');
    updateProfile(p => ({ ...p, capstones: { ...p.capstones, [track.id]: { ...p.capstones?.[track.id], submittedAt: new Date().toISOString() } } }));
    setMessage('أصبح المشروع جاهزًا لعرضه على المعلم؛ التقييم يتم يدويًا.');
  };
  return <section className="capstone glass"><div className="capstone-lead"><span className="eyebrow">CAPSTONE / مشروع ختامي</span><h3>{brief.title}</h3><p>{track.title} · {brief.mission}</p><span>{entry.submittedAt ? 'جاهز لمراجعة المعلم ✓' : complete ? 'اكتملت الأقسام · أرسله للمراجعة' : 'مسودة قابلة للحفظ على هذا الجهاز'}</span><button onClick={() => setExpanded(!expanded)}>{expanded ? 'إغلاق النموذج' : 'ابدأ مشروع المسار ←'}</button></div>{expanded && <div className="capstone-body"><h4>معايير التقييم للمعلم</h4><ol>{brief.criteria.map(item => <li key={item}>{item}</li>)}</ol><p>يقيّم المعلم كل معيار من 0 إلى 3: لم يظهر، بداية، جيد، متقن. المجموع من 12؛ لا تمنح المنصة الدرجة تلقائيًا.</p>{fields.map(([key, label, placeholder]) => <label key={key}>{label}<textarea value={entry[key] || ''} maxLength={4000} onChange={event => change(key, event.target.value)} placeholder={placeholder} rows={4} disabled={!profile}/><small>{(entry[key] || '').trim().length} حرفًا · يحفظ تلقائيًا</small></label>)}<button disabled={!profile || !complete} onClick={submit}>تجهيز المشروع لمراجعة المعلم</button>{!profile && <p>اختر اسم الطالب من الرئيسية لحفظ المشروع.</p>}{message && <p role="status">{message}</p>}<p>لإحضار المشروع للمعلم استخدم «تنزيل نسخة التقدم» من الإدارة، وشاركه معه بطريقة خاصة. اسم الطالب ونص المشروع موجودان داخل الملف.</p></div>}</section>;
}
