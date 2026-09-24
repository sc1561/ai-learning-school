export const pythonSkills = [
  { id: 'basics', title: 'أساسيات البرمجة', trackId: 'python-foundations' },
  { id: 'data', title: 'التعامل مع البيانات', trackId: 'python-data-practice' },
  { id: 'algorithms', title: 'الخوارزميات والتحقق', trackId: 'python-competition-lab' }
];

export const pythonQuestions = [
  { id: 'b1', skill: 'basics', lessonId: 'py-input-conversion', question: 'إذا كتب المستخدم 7، فما نوع القيمة التي تعيدها input() قبل تحويلها؟', choices: ['عدد صحيح int', 'نص str', 'قيمة منطقية bool'], correct: 1, explain: 'تعيد input() نصًا؛ نستخدم int() عندما نحتاج عددًا.' },
  { id: 'b2', skill: 'basics', lessonId: 'py-conditions', question: 'إذا كان x = 20، أي فرع يعمل في if x > 20: ... else: ...؟', choices: ['فرع if', 'فرع else', 'كلاهما'], correct: 1, explain: '20 يساوي الحد ولا يزيد عليه.' },
  { id: 'b3', skill: 'basics', lessonId: 'py-loops', question: 'ما مجموع [2, 4, 6] بعد المرور على جميع قيمها وجمعها؟', choices: ['12', '6', '24'], correct: 0, explain: '2 + 4 + 6 = 12.' },
  { id: 'b4', skill: 'basics', lessonId: 'py-functions', question: 'ماذا تعيد الدالة def next_year(age): return age + 1 عند استدعائها بالقيمة 9؟', choices: ['9', '10', 'None'], correct: 1, explain: 'تُعيد return ناتج 9 + 1، وهو 10.' },
  { id: 'd1', skill: 'data', lessonId: 'py-list-index', question: 'ما قيمة [5, 8, 3][-1]؟', choices: ['5', '8', '3'], correct: 2, explain: 'الفهرس -1 يشير إلى آخر عنصر في القائمة.' },
  { id: 'd2', skill: 'data', lessonId: 'py-dict-count', question: 'إذا كان counts = {}، فما ناتج counts.get("علوم", 0)؟', choices: ['0', '1', 'KeyError'], correct: 0, explain: 'تعيد get القيمة الافتراضية عند غياب المفتاح.' },
  { id: 'd3', skill: 'data', lessonId: 'py-validation', question: 'ما الذي يحدث عند تنفيذ int("abc") دون معالجة الخطأ؟', choices: ['يعيد صفرًا', 'ينشأ ValueError', 'يعيد النص abc'], correct: 1, explain: 'النص abc لا يمثل عددًا صحيحًا، فينشأ ValueError.' },
  { id: 'd4', skill: 'data', lessonId: 'py-filter-average', question: 'إذا استبعدنا القيم السالبة من [4, -2, 6]، فما متوسط القيم المتبقية؟', choices: ['4', '5', '8'], correct: 1, explain: 'القيمتان 4 و6، ومتوسطهما 5.' },
  { id: 'a1', skill: 'algorithms', lessonId: 'py-search', question: 'عند البحث الخطي عن 9 في [4, 9, 2]، ما فهرس القيمة؟', choices: ['1', '2', '9'], correct: 0, explain: 'الفهرس يبدأ من صفر، لذلك 9 في الفهرس 1.' },
  { id: 'a2', skill: 'algorithms', lessonId: 'py-ranking', question: 'فريق 12 وفريق 3 لديهما 8 نقاط. إذا كان الأصغر رقمًا أولًا عند التعادل، فمن يتقدم؟', choices: ['الفريق 12', 'الفريق 3', 'لا يمكن الترتيب'], correct: 1, explain: 'الفريق 3 أصغر رقمًا بعد تعادل النقاط.' },
  { id: 'a3', skill: 'algorithms', lessonId: 'py-tests', question: 'أي حالة تكشف خطأ القسمة على صفر في دالة تحسب متوسط قائمة؟', choices: ['[2, 4]', '[5]', '[]'], correct: 2, explain: 'القائمة الفارغة طولها صفر؛ تحتاج معالجة صريحة.' },
  { id: 'a4', skill: 'algorithms', lessonId: 'py-capstone', question: 'ما أول خطوة قبل حساب متوسط نتائج فرق قد تحتوي على نقاط -1 غير صالحة؟', choices: ['حساب المتوسط مباشرة', 'استبعاد السجلات غير الصالحة', 'ترتيب أسماء الطلاب'], correct: 1, explain: 'نحدد البيانات الصالحة أولًا حتى لا تؤثر القيم غير الصحيحة على المتوسط.' }
];

export function assessPython(answers, finished = Date.now()) {
  const breakdown = Object.fromEntries(pythonSkills.map(skill => [skill.id, { correct: 0, total: 0 }]));
  for (const question of pythonQuestions) {
    breakdown[question.skill].total++;
    if (answers[question.id] === question.correct) breakdown[question.skill].correct++;
  }
  const score = Object.values(breakdown).reduce((sum, skill) => sum + skill.correct, 0);
  return { version: 1, finished, answers: Object.fromEntries(pythonQuestions.map(q => [q.id, answers[q.id]])), score, total: pythonQuestions.length, breakdown };
}

export function recommendPython(report, completed = {}, tracks = []) {
  const listed = pythonSkills.map(skill => ({ ...skill, track: tracks.find(track => track.id === skill.trackId) })).filter(skill => skill.track);
  const unfinished = skill => skill.track.lessons.filter(lesson => !completed[`academy:${lesson.id}`]);
  if (!listed.length) return null;
  if (!report) {
    const first = listed.find(skill => unfinished(skill).length) || listed[0];
    return { trackId: first.track.id, lessonId: (unfinished(first)[0] || first.track.lessons[0]).id, reason: 'ابدأ بهذا الدرس، أو خذ الاختبار التشخيصي لتحديد نقطة أنسب.' };
  }
  const weak = listed.find(skill => {
    const result = report.breakdown?.[skill.id];
    return result && result.correct < Math.ceil(result.total * .75);
  });
  const skill = weak && (unfinished(weak).length || !listed.some(other => unfinished(other).length)) ? weak : listed.find(item => unfinished(item).length) || weak || listed.at(-1);
  if (!skill) return null;
  const wrong = pythonQuestions.filter(q => q.skill === skill.id && report.answers?.[q.id] !== q.correct).map(q => q.lessonId);
  const lesson = unfinished(skill).find(item => wrong.includes(item.id)) || unfinished(skill)[0] || skill.track.lessons.find(item => wrong.includes(item.id)) || skill.track.lessons.at(-1);
  return { trackId: skill.track.id, lessonId: lesson.id, reason: weak === skill ? `راجع ${skill.title}، ثم جرّب التقييم من جديد بعد التطبيق.` : 'تقدم إلى الدرس التالي، واختبر ما تعلمته بعد إنجازه.' };
}
