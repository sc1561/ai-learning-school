import React, { useEffect, useState } from 'react';
import { selectSimulation, simulationBank, simulationSkills, evaluateSimulation, simulationRecommendation } from './mixedSimulationBank.js';
import './mixedSimulation.css';

const DURATION = 15 * 60 * 1000;
const formatTime = seconds => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

export default function MixedSimulation({ profile, updateProfile, onOpenLesson }) {
  const [now, setNow] = useState(Date.now());
  const [index, setIndex] = useState(0);
  const [review, setReview] = useState(false);
  const simulation = profile?.mixedSimulation;
  const run = simulation?.run;
  const report = simulation?.latest;
  const questions = run?.questionIds.map(id => simulationBank.find(item => item.id === id)).filter(Boolean) || [];
  const current = questions[index] || questions[0];
  const remaining = run ? Math.max(0, Math.ceil((run.deadline - now) / 1000)) : 0;
  useEffect(() => { if (!run) return; const timer = setInterval(() => setNow(Date.now()), 1000); return () => clearInterval(timer); }, [run?.id]);
  useEffect(() => { if (run && remaining === 0) finish(run.id); }, [run?.id, remaining]);
  function start() {
    if (!profile) return;
    const id = Date.now();
    const seed = crypto.getRandomValues(new Uint32Array(1))[0];
    const questionIds = selectSimulation(seed).map(question => question.id);
    updateProfile(currentProfile => ({ ...currentProfile, mixedSimulation: {
      ...currentProfile.mixedSimulation,
      run: { id, started: id, deadline: id + DURATION, questionIds, answers: {} }
    } }));
    setNow(id); setIndex(0); setReview(false);
  }
  function answer(questionId, choice) {
    if (remaining === 0) return;
    updateProfile(currentProfile => {
      const active = currentProfile.mixedSimulation?.run;
      if (!active || active.id !== run.id) return currentProfile;
      return { ...currentProfile, mixedSimulation: { ...currentProfile.mixedSimulation,
        run: { ...active, answers: { ...active.answers, [questionId]: choice } } } };
    });
  }
  function finish(id = run?.id) {
    if (!id) return;
    updateProfile(currentProfile => {
      const active = currentProfile.mixedSimulation?.run;
      if (!active || active.id !== id) return currentProfile;
      const result = evaluateSimulation(active);
      return { ...currentProfile, mixedSimulation: { run: null, latest: result,
        history: [...(currentProfile.mixedSimulation?.history || []), result].slice(-8) } };
    });
    setReview(false);
  }
  const next = simulationRecommendation(report, profile?.completed);
  return <section className="mixed-simulation"><header className="mixed-heading"><span className="eyebrow">PYTHON × CTF / PRACTICE QUALIFIER</span><h1>محاكاة تصفيات المهارات</h1><p>12 مسألة من بايثون والتقاط العلم، خلال 15 دقيقة. يتغير اختيار المسائل بين المحاولات. يُحفظ الوقت والإجابات على هذا الجهاز لاستكمال المحاولة بعد تحديث الصفحة.</p></header>
    {!profile ? <div className="glass mixed-intro"><h2>اختر الطالب أولًا</h2><p>افتح ملفك من الرئيسية ثم ارجع لبدء المحاكاة وحفظ نتيجتك.</p></div> : run && current ? <><div className="mixed-status glass"><strong>الوقت المتبقي <b>{formatTime(remaining)}</b></strong><span>أجبت عن {Object.keys(run.answers || {}).length} / {questions.length}</span><span>الوقت يستمر عند مغادرة الصفحة</span></div><div className="mixed-question glass"><div className="mixed-topline"><span>السؤال {index + 1} / {questions.length}</span><span>{simulationSkills.find(skill => skill.id === current.skill)?.title}</span></div><h2>{current.prompt}</h2>{current.evidence && <pre dir="auto">{current.evidence}</pre>}<div className="mixed-choices">{current.choices.map((choice, choiceIndex) => <button key={choiceIndex} className={run.answers?.[current.id] === choiceIndex ? 'selected' : ''} aria-pressed={run.answers?.[current.id] === choiceIndex} onClick={() => answer(current.id, choiceIndex)}>{choice}</button>)}</div><div className="mixed-navigation"><button disabled={index === 0} onClick={() => setIndex(i => i - 1)}>السابق</button><button disabled={index === questions.length - 1} onClick={() => setIndex(i => i + 1)}>التالي ←</button></div></div><div className="mixed-question-map">{questions.map((question, questionIndex) => <button key={question.id} className={index === questionIndex ? 'current' : Object.prototype.hasOwnProperty.call(run.answers || {}, question.id) ? 'answered' : ''} onClick={() => setIndex(questionIndex)} aria-label={`انتقل للسؤال ${questionIndex + 1}`}>{questionIndex + 1}</button>)}</div><button className="mixed-submit" onClick={() => finish()}>تسليم المحاولة وعرض التقرير</button></> : report ? <><div className="mixed-report glass"><div><small>آخر محاولة · {new Date(report.finished).toLocaleDateString('ar-OM')}</small><h2>{report.score} / {report.total}</h2><p>النتيجة للتدريب والمراجعة، ولا تدخل في لوحة ترتيب رسمية.</p></div><div className="mixed-skill-scores">{simulationSkills.map(skill => { const item = report.breakdown?.[skill.id]; return <div key={skill.id}><span>{skill.title}</span><progress value={item?.correct || 0} max={item?.total || 3} aria-label={skill.title}/><b>{item?.correct || 0}/{item?.total || 3}</b></div>; })}</div></div>{next && <div className="mixed-next glass"><span>الدرس المقترح للمراجعة</span><h3>{next.title}</h3><p>يفتح الدرس المرتبط بإحدى مهارات المحاكاة على جهازك.</p><button onClick={() => onOpenLesson(next)}>افتح الدرس ←</button></div>}<div className="mixed-report-actions"><button onClick={() => setReview(value => !value)}>{review ? 'إخفاء تفسير الإجابات' : 'مراجعة الإجابات والتفسير'}</button><button onClick={start}>محاولة جديدة بأسئلة متنوعة</button></div>{review && <div className="mixed-review">{report.questionIds.map(id => simulationBank.find(item => item.id === id)).filter(Boolean).map((question, questionIndex) => <article className="glass" key={question.id}><small>{questionIndex + 1} · {simulationSkills.find(skill => skill.id === question.skill)?.title}</small><h3>{question.prompt}</h3>{question.evidence && <pre dir="auto">{question.evidence}</pre>}<p className={report.answers?.[question.id] === question.correct ? 'right' : 'wrong'}>إجابتك: {question.choices[report.answers?.[question.id]] || 'لم تُجب'}</p><p>الصحيح: {question.choices[question.correct]}</p><small>{question.explain}</small></article>)}</div>}{simulation.history?.length > 1 && <p className="mixed-history">آخر المحاولات: {simulation.history.map(item => `${item.score}/${item.total}`).join(' ← ')}</p>}</> : <div className="mixed-intro glass"><h2>ماذا ستتدرب عليه؟</h2><p>ثلاث مسائل لكل مهارة: منطق بايثون، بيانات بايثون، الترميز، وتحليل الأدلة. يمكنك الرجوع للأسئلة وتسليم المحاولة قبل انتهاء الوقت. تُعرض الإجابات والتفسيرات بعد التسليم فقط.</p><button onClick={start}>ابدأ محاكاة 15 دقيقة ←</button></div>}
  </section>;
}
