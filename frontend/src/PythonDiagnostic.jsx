import React, { useState } from 'react';
import { assessPython, pythonQuestions, pythonSkills, recommendPython } from './pythonDiagnostic.js';

export function PythonGuide({ profile, tracks, onStart, onOpen }) {
  const latest = profile?.pythonDiagnostic?.latest;
  const recommendation = recommendPython(latest, profile?.completed, tracks);
  const track = tracks.find(item => item.id === recommendation?.trackId);
  const lesson = track?.lessons.find(item => item.id === recommendation?.lessonId);
  return <section className="python-guide glass"><div><span className="eyebrow">YOUR PYTHON ROUTE / مسارك المقترح</span><h3>{latest ? 'من نتيجتك إلى خطوتك التالية' : 'ابدأ من المستوى المناسب لك'}</h3><p>{latest ? `آخر تقييم: ${latest.score} من ${latest.total} · ${new Date(latest.finished).toLocaleDateString('ar-OM')}` : 'اختبار تشخيصي قصير يحدد مهاراتك الثلاث ويوجهك إلى درس مناسب.'}</p>{lesson && <p className="python-guide-tip">{recommendation.reason} <strong>{track.title} ← {lesson.title}</strong></p>}</div><div className="python-guide-actions"><button onClick={onStart} disabled={!profile}>{latest ? 'إعادة التقييم' : 'ابدأ التقييم التشخيصي'}</button>{lesson && <button className="secondary" onClick={() => onOpen(recommendation)} disabled={!profile}>افتح الدرس المقترح ←</button>}{!profile && <small>اختر اسمك من الرئيسية لحفظ نتيجتك.</small>}</div></section>;
}

export default function PythonDiagnostic({ profile, tracks, onSave, onClose, onOpen }) {
  const [running, setRunning] = useState(false);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [report, setReport] = useState(null);
  const [review, setReview] = useState(false);
  const current = pythonQuestions[index];
  const latest = report || profile?.pythonDiagnostic?.latest;
  const recommendation = recommendPython(latest, profile?.completed, tracks);
  const track = tracks.find(item => item.id === recommendation?.trackId);
  const lesson = track?.lessons.find(item => item.id === recommendation?.lessonId);
  function start() { setAnswers({}); setIndex(0); setReport(null); setReview(false); setRunning(true); }
  function finish() {
    if (pythonQuestions.some(question => !Object.prototype.hasOwnProperty.call(answers, question.id))) return;
    const result = assessPython(answers);
    onSave(result); setReport(result); setRunning(false); setReview(false);
  }
  return <section className="python-diagnostic"><button className="academy-back" onClick={onClose}>→ العودة إلى مسارات بايثون</button><header className="python-diagnostic-heading"><span className="eyebrow">PYTHON SKILL CHECK / تقييم تدريبي</span><h2>اعرف نقطة البداية، ثم تقدم بخطوات واضحة</h2><p>12 سؤالًا في ثلاث مهارات. خذ وقتك وفكر في الإجابة؛ النتيجة إرشادية ومحفوظة على جهازك، ويمكن إعادة الاختبار.</p></header>
    {running ? <div className="python-diagnostic-question glass"><div className="python-diagnostic-progress"><span>السؤال {index + 1} / {pythonQuestions.length}</span><span>{pythonSkills.find(skill => skill.id === current.skill)?.title}</span></div><progress aria-label="الأسئلة المجاب عنها" value={Object.keys(answers).length} max={pythonQuestions.length} /><h3>{current.question}</h3><div className="python-diagnostic-options">{current.choices.map((choice, choiceIndex) => <button key={choiceIndex} type="button" aria-pressed={answers[current.id] === choiceIndex} className={answers[current.id] === choiceIndex ? 'selected' : ''} onClick={() => setAnswers(previous => ({ ...previous, [current.id]: choiceIndex }))}>{choice}</button>)}</div><div className="python-diagnostic-nav"><button onClick={() => setIndex(i => i - 1)} disabled={index === 0}>السابق</button>{index + 1 === pythonQuestions.length ? <button className="primary" onClick={finish} disabled={Object.keys(answers).length !== pythonQuestions.length}>عرض النتيجة</button> : <button className="primary" onClick={() => setIndex(i => i + 1)} disabled={!Object.prototype.hasOwnProperty.call(answers, current.id)}>التالي ←</button>}</div></div> : latest ? <><div className="python-diagnostic-result glass"><div><span className="eyebrow">تقرير المهارات</span><h3>{latest.score} / {latest.total}</h3><p>النتيجة توجه المراجعة ولا تعني اجتياز منافسة رسمية.</p></div><div className="python-skill-bars">{pythonSkills.map(skill => { const result = latest.breakdown?.[skill.id]; return <div key={skill.id}><span>{skill.title}</span><progress aria-label={skill.title} max={result?.total || 4} value={result?.correct || 0} /><b>{result?.correct || 0}/{result?.total || 4}</b></div>; })}</div></div>{lesson && <div className="python-diagnostic-next glass"><span>خطوتك المقترحة</span><h3>{lesson.title}</h3><p>{recommendation.reason}</p><button onClick={() => onOpen(recommendation)}>افتح الدرس ←</button></div>}<div className="python-diagnostic-nav"><button onClick={() => setReview(value => !value)}>{review ? 'إخفاء مراجعة الإجابات' : 'راجع الإجابات وتفسيرها'}</button><button onClick={start}>أعد التقييم</button></div>{review && <div className="python-diagnostic-review">{pythonQuestions.map((question, questionIndex) => <article className="glass" key={question.id}><span>{questionIndex + 1}. {pythonSkills.find(skill => skill.id === question.skill)?.title}</span><h4>{question.question}</h4><p className={latest.answers?.[question.id] === question.correct ? 'right' : 'wrong'}>إجابتك: {question.choices[latest.answers?.[question.id]] ?? 'بلا إجابة'}</p><p>الإجابة الصحيحة: {question.choices[question.correct]}</p><small>{question.explain}</small></article>)}</div>}</> : <div className="python-diagnostic-intro glass"><h3>ثلاث مهارات، نقطة بداية واحدة</h3><p>أساسيات البرمجة · البيانات · الخوارزميات والتحقق</p><button onClick={start} disabled={!profile}>ابدأ الأسئلة ←</button>{!profile && <small>اختر اسمك من الرئيسية أولًا.</small>}</div>}
    {profile?.pythonDiagnostic?.history?.length > 1 && !running && <p className="python-diagnostic-history">محاولات محفوظة على هذا الجهاز: {profile.pythonDiagnostic.history.map(item => `${item.score}/${item.total}`).join(' ← ')}</p>}
  </section>;
}
