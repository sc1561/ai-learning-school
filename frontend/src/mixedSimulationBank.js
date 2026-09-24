export const simulationSkills = [
  { id: 'python-logic', title: 'منطق بايثون' },
  { id: 'python-data', title: 'بيانات بايثون' },
  { id: 'ctf-encoding', title: 'الترميز والقرائن' },
  { id: 'ctf-evidence', title: 'تحليل الأدلة' }
];

const q = (id, skill, prompt, evidence, choices, correct, explain, areaId, trackId, lessonId) => ({ id, skill, prompt, evidence, choices, correct, explain, areaId, trackId, lessonId });
export const simulationBank = [
  q('pl-1','python-logic','ما الرسالة عند x = 15 والشرط if x > 15: print("مراجعة") else: print("مقبول")؟','x = 15',['مراجعة','مقبول','لا تُطبع رسالة'],1,'القيمة 15 لا تزيد على الحد 15.', 'python','python-foundations','py-conditions'),
  q('pl-2','python-logic','إذا قرأ البرنامج النص "8" عبر input()، أي تعبير يعطي العدد 9؟','value = "8"',['value + 1','int(value) + 1','value * 1'],1,'نحوّل النص إلى int قبل جمع عدد صحيح.', 'python','python-foundations','py-input-conversion'),
  q('pl-3','python-logic','ما مجموع القيم التي تزورها الحلقة التالية؟','total = 0\nfor value in [3, 5, 2]:\n    total += value',['10','3','15'],0,'تضيف الحلقة 3 ثم 5 ثم 2 إلى المجموع.', 'python','python-foundations','py-loops'),
  q('pl-4','python-logic','أي قيمة تعيدها الدالة عند تمرير قائمة فارغة؟','def average(values):\n    if not values:\n        return None\n    return sum(values) / len(values)',['0','None','خطأ قسمة على صفر'],1,'الشرط يوقف الدالة ويعيد None قبل القسمة.', 'python','python-foundations','py-functions'),
  q('pl-5','python-logic','كم يتبقى عند توزيع 17 بطاقة على 5 مجموعات بالتساوي؟','17 % 5',['2','3','5'],0,'خمسة في ثلاثة تساوي 15، ويتبقى 2.', 'python','python-foundations','py-strings-math'),
  q('pd-1','python-data','ما أعلى قيمة في القائمة إذا كانت تتضمن أعدادًا سالبة فقط؟','scores = [-6, -2, -9]',['0','-2','-9'],1,'أعلى قيمة سالبة هي الأقرب إلى الصفر، وهي -2.', 'python','python-data-practice','py-list-index'),
  q('pd-2','python-data','بعد عدّ الفئات، كم مرة تظهر «علوم»؟','topics = ["علوم", "فن", "علوم", "برمجة"]',['1','2','3'],1,'تظهر علوم مرتين في القائمة.', 'python','python-data-practice','py-dict-count'),
  q('pd-3','python-data','ما حالة الإدخال "11" إذا كان المجال المسموح 0 إلى 10؟','score = int("11")',['خطأ تحويل','عدد صالح','عدد خارج المجال'],2,'التحويل ينجح لكن 11 يتجاوز الحد 10.', 'python','python-data-practice','py-validation'),
  q('pd-4','python-data','بعد استبعاد القراءات السالبة، ما متوسط القيم المتبقية؟','readings = [0, -3, 8]',['4','5','8'],0,'المتوسط بين 0 و8 يساوي 4.', 'python','python-data-practice','py-filter-average'),
  q('pd-5','python-data','أي ناتج لقائمة أرقام الفرق المتكررة مرة واحدة لكل رقم ومرتبة تصاعديًا؟','teams = [7, 4, 7, 2, 4, 4]',['[7, 4, 4]','[4, 7]','[2, 4, 7]'],1,'الفريقان 4 و7 تكررا؛ نستبعد 2 ثم نرتب.', 'python','python-competition-lab','py-ranking'),
  q('ce-1','ctf-encoding','إذا كان Hex 4337 يمثل معرّف حالة، فما النص الناتج؟','case_hex=4337',['C7','43','7C'],0,'43 يمثل C و37 يمثل 7 في جدول الأحرف.', 'ctf','ctf-evidence-lab','ctf-evidence-encoding'),
  q('ce-2','ctf-encoding','بعد فك Base64 إلى كلمة three، ما عدد أحرفها؟','encoded=dGhyZWU=',['3','5','6'],1,'الناتج three وطوله خمسة أحرف؛ نقرأ المطلوب بعد فك الترميز.', 'ctf','ctf-qualifier','ctf-qual-shift'),
  q('ce-3','ctf-encoding','ما الاستنتاج الصحيح عند رؤية نص مرمز بـ Base64 في ملف تدريبي؟','value=ZmxhZw==',['أصبح سرًا لا يمكن قراءته','يحتاج فك تمثيل ثم تحقق من علاقته بالسؤال','يثبت أن الملف أصلي'],1,'الترميز يغير تمثيل النص؛ بعد فكه ما زلنا نحتاج فهم السياق.', 'ctf','ctf-evidence-lab','ctf-evidence-encoding'),
  q('ce-4','ctf-encoding','أي قيمة Hex تختار إذا كانت القضية تطلب case=41 وfield=site؟','case=42 field=site hex=736561\ncase=41 field=color hex=626c7565\ncase=41 field=site hex=66616c616a',['736561','626c7565','66616c616a'],2,'نطابق الحالة والحقل معًا قبل فك القيمة.', 'ctf','ctf-evidence-lab','ctf-evidence-files'),
  q('ce-5','ctf-encoding','إذا كانت كل الأحرف قد أزيحت خطوة إلى الأمام وأصبحت ipnf، فما الكلمة الأصلية؟','ipnf',['home','hope','info'],0,'نعيد i→h وp→o وn→m وf→e.', 'ctf','ctf-investigate','ctf-shift'),
  q('ev-1','ctf-evidence','أي مصدر فشل ثم نجح خلال خمس دقائق؟','09:02 FAIL A\n09:04 FAIL B\n09:07 SUCCESS B\n09:09 SUCCESS A',['A','B','كلاهما'],1,'B لديه فرق ثلاث دقائق؛ A لديه سبع دقائق.', 'ctf','ctf-evidence-lab','ctf-evidence-timeline'),
  q('ev-2','ctf-evidence','كم حدث FAIL للمصدر A فقط؟','10:00 FAIL A\n10:02 SUCCESS A\n10:03 FAIL B\n10:05 FAIL A',['1','2','3'],1,'الفشل A عند 10:00 و10:05 فقط.', 'ctf','ctf-forensics','forensic-failure-count'),
  q('ev-3','ctf-evidence','إذا كانت القاعدة «verified=true ثم sort by rank»، فما أول كلمة؟','rank=3 verified=true word=Design\nrank=1 verified=true word=Create\nrank=0 verified=false word=Extra',['Extra','Create','Design'],1,'نستبعد الصف غير المعتمد ثم نرتب؛ الرتبة 1 أولًا.', 'ctf','ctf-evidence-lab','ctf-evidence-files'),
  q('ev-4','ctf-evidence','ما أول حدث زمني للحالة C7؟','09:15 case=C7 SUCCESS\n09:11 case=C7 FAIL\n09:08 case=D4 FAIL',['نجاح 09:15','فشل 09:11','فشل 09:08'],1,'نرشح C7 أولًا، ثم نرتب وقتيها 09:11 و09:15.', 'ctf','ctf-evidence-lab','ctf-evidence-timeline'),
  q('ev-5','ctf-evidence','إذا طلبت المذكرة site للحالة 42، أي صف يصلح دليلاً؟','line 2: case=42 field=site\nline 3: case=41 field=site\nline 4: case=42 field=color',['line 3','line 4','line 2'],2,'صف line 2 وحده يطابق الحالة والحقل معًا.', 'ctf','ctf-evidence-lab','ctf-evidence-files')
];

function shuffle(items, next) {
  const array = [...items];
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
export function selectSimulation(seed) {
  let state = seed >>> 0;
  const next = () => {
    state += 0x6D2B79F5;
    let x = state;
    x = Math.imul(x ^ x >>> 15, x | 1);
    x ^= x + Math.imul(x ^ x >>> 7, x | 61);
    return ((x ^ x >>> 14) >>> 0) / 4294967296;
  };
  return shuffle(simulationSkills.flatMap(skill => shuffle(simulationBank.filter(item => item.skill === skill.id), next).slice(0, 3)), next);
}
export function evaluateSimulation(run, finished = Date.now()) {
  const questions = run.questionIds.map(id => simulationBank.find(item => item.id === id)).filter(Boolean);
  const breakdown = Object.fromEntries(simulationSkills.map(skill => [skill.id, { correct: 0, total: 0 }]));
  for (const question of questions) {
    breakdown[question.skill].total++;
    if (run.answers?.[question.id] === question.correct) breakdown[question.skill].correct++;
  }
  const score = Object.values(breakdown).reduce((sum, item) => sum + item.correct, 0);
  return { id: run.id, finished, score, total: questions.length, breakdown, questionIds: run.questionIds, answers: run.answers || {} };
}
export function simulationRecommendation(report, completed = {}) {
  if (!report) return null;
  const ordered = report.questionIds.map(id => simulationBank.find(item => item.id === id)).filter(Boolean);
  const weakSkill = [...simulationSkills].filter(skill => report.breakdown?.[skill.id]?.total)
    .sort((a, b) => {
      const first = report.breakdown[a.id], second = report.breakdown[b.id];
      return first.correct / first.total - second.correct / second.total;
    }).find(skill => report.breakdown[skill.id].correct < report.breakdown[skill.id].total);
  const missed = ordered.filter(item => item.skill === weakSkill?.id && report.answers?.[item.id] !== item.correct);
  const target = missed.find(item => !completed[`academy:${item.lessonId}`]) || missed[0];
  if (target) return { areaId: target.areaId, trackId: target.trackId, lessonId: target.lessonId, title: target.skill.startsWith('python') ? 'راجع مهارة بايثون' : 'راجع مهارة التقاط العلم' };
  const next = ordered.find(item => !completed[`academy:${item.lessonId}`]) || ordered[0];
  return next ? { areaId: next.areaId, trackId: next.trackId, lessonId: next.lessonId, title: 'واصل التدريب بمسألة جديدة' } : null;
}
