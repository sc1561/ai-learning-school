import { simulationSkills } from './mixedSimulationBank.js';

export const practicalTasks = [
  { id: 'pyc-even-count', kind: 'python', skill: 'python-logic', title: 'عدّ القراءات الزوجية', description: 'اكتب دالة، ثم اجتز حالات فحص للقيم السالبة والصفر والقائمة الفارغة.' },
  { id: 'pyc-topic-frequency', kind: 'python', skill: 'python-data', title: 'فئات معرض المدرسة', description: 'نظّف البيانات واكتب قاموس تكرارات، ثم اختبر الحالات الحدية.' },
  { id: 'pyc-ranking', kind: 'python', skill: 'python-data', title: 'ترتيب الفرق عند التعادل', description: 'طبّق ترتيبًا بقواعد تعادل واضحة دون تغيير بيانات المصدر.' },
  { id: 'ctf-qual-base', kind: 'ctf', skill: 'ctf-encoding', title: 'الكلمة ثم طولها', trackId: 'ctf-qualifier', description: 'فك ترميز الرسالة واستخرج الجواب المطلوب من سياق القضية.' },
  { id: 'ctf-file-join', kind: 'ctf', skill: 'ctf-evidence', title: 'فهرس معرض الماء', trackId: 'ctf-evidence-lab', description: 'اربط سجلات الأدلة الاصطناعية واكتب سبب اختيارك.' },
  { id: 'ctf-timeline-join', kind: 'ctf', skill: 'ctf-evidence', title: 'الحدث المرتبط', trackId: 'ctf-evidence-lab', description: 'حلّل الخط الزمني، واستبعد القرائن غير المرتبطة قبل تسليم العلم.' }
];

export function orderedPracticalTasks(report, completed = {}) {
  if (!report) return [];
  const weakness = Object.fromEntries(simulationSkills.map(skill => {
    const score = report.breakdown?.[skill.id];
    return [skill.id, score?.total ? (score.total - score.correct) / score.total : 0];
  }));
  return practicalTasks.map((task, index) => ({ ...task, completed: !!completed[task.kind === 'python' ? `python-challenge:${task.id}` : `academy:${task.id}`], priority: weakness[task.skill] || 0, index }))
    .sort((a, b) => Number(a.completed) - Number(b.completed) || b.priority - a.priority || a.index - b.index);
}
