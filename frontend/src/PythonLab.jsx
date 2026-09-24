import React, { useEffect, useRef, useState } from 'react';

export default function PythonLab({ lesson, profileId, onDone, exampleEnabled = true, inputsEnabled = true }) {
  const draftKey = `alzahrawi-python-draft-v1:${encodeURIComponent(profileId || 'guest')}:${lesson.id}`;
  function savedDraft() {
    try {
      const value = JSON.parse(localStorage.getItem(draftKey));
      return value && typeof value.code === 'string' && value.code.length <= 20000 && typeof value.inputs === 'string' && value.inputs.length <= 2000 ? value : null;
    } catch { return null; }
  }
  const [code, setCode] = useState(() => savedDraft()?.code ?? lesson.practice?.starter ?? lesson.code ?? '');
  const [inputs, setInputs] = useState(() => savedDraft()?.inputs ?? (lesson.practice?.inputs || []).join('\n'));
  const [output, setOutput] = useState('');
  const [cases, setCases] = useState([]);
  const [state, setState] = useState('idle');
  const [attempted, setAttempted] = useState(false);
  const workerRef = useRef(null);
  const timerRef = useRef(null);
  const runRef = useRef(0);
  function stop() {
    clearTimeout(timerRef.current);
    workerRef.current?.terminate();
    workerRef.current = null;
  }
  useEffect(() => () => stop(), []);
  useEffect(() => {
    try { localStorage.setItem(draftKey, JSON.stringify({ code, inputs })); } catch { /* Storage can be unavailable or full. */ }
  }, [draftKey, code, inputs]);
  function persist(nextCode, nextInputs) {
    try { localStorage.setItem(draftKey, JSON.stringify({ code: nextCode, inputs: nextInputs })); } catch { /* Storage can be unavailable or full. */ }
  }
  function resetResult() { setState('idle'); setOutput(''); setCases([]); onDone(false); }
  function edit(value) {
    if (state === 'running' || state === 'loading') { runRef.current++; stop(); }
    persist(value, inputs); setCode(value); resetResult();
  }
  function editInputs(value) {
    if (state === 'running' || state === 'loading') { runRef.current++; stop(); }
    persist(code, value); setInputs(value); resetResult();
  }
  function execute() {
    const id = ++runRef.current;
    const worker = workerRef.current || new Worker(new URL('./pythonWorker.js', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    setAttempted(true); setState('loading'); setOutput(''); setCases([]); onDone(false);
    const timeout = (ms, message) => {
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        if (runRef.current !== id) return;
        stop(); setState('error'); setOutput(message); onDone(false);
      }, ms);
    };
    timeout(60000, 'تعذر تحميل بايثون خلال دقيقة. تحقق من الاتصال وأعد المحاولة.');
    worker.onerror = () => { if (runRef.current !== id) return; stop(); setState('error'); setOutput('تعذر تشغيل بيئة بايثون. حدّث الصفحة ثم حاول مجددًا.'); };
    worker.onmessage = ({ data }) => {
      if (data.id !== id || runRef.current !== id) return;
      if (data.phase === 'ready') { setState('running'); timeout(12000, 'توقف البرنامج بعد 12 ثانية؛ راجع الحلقات أو المدخلات.'); return; }
      clearTimeout(timerRef.current);
      setOutput(data.output || 'لم يطبع البرنامج شيئًا.');
      setCases(data.cases || []);
      setState(data.passed ? 'passed' : 'failed'); onDone(!!data.passed);
    };
    const runtimeURL = new URL(import.meta.env.BASE_URL + 'pyodide/pyodide.mjs', location.origin).href;
    worker.postMessage({ id, code, inputs: inputs.split(/\r?\n/).slice(0, 20), cases: lesson.practice?.cases || [], runtimeURL });
  }
  const total = lesson.practice?.cases?.length || 0;
  const passed = cases.filter(item => item.passed).length;
  return <section className="python-lab" aria-label="مختبر بايثون">
    <div className="python-lab-head"><strong>⌘ مختبر بايثون</strong><small>التشغيل داخل متصفحك · {total} حالات فحص</small></div>
    <p>أكمل الأجزاء المكتوب عندها TODO ثم شغّل البرنامج. تُحفظ المسودة على هذا المتصفح؛ اجتياز كل الحالات مطلوب لحفظ إنجاز الدرس. شغّل كودًا كتبته أو راجعته فقط.</p>
    <label>الكود<textarea dir="ltr" spellCheck="false" value={code} onChange={e => edit(e.target.value)} aria-label="كود بايثون" /></label>
    {inputsEnabled && <label>مدخلات لتجربتك الخاصة، قيمة في كل سطر<input dir="ltr" value={inputs} onChange={e => editInputs(e.target.value)} placeholder="مثال: 12" /></label>}
    <div className="python-lab-actions"><button type="button" onClick={execute} disabled={state === 'loading' || state === 'running'}>{state === 'loading' ? 'تحميل بايثون…' : state === 'running' ? 'يجري التشغيل…' : '▶ تشغيل وفحص'}</button>{(state === 'loading' || state === 'running') && <button type="button" onClick={() => { runRef.current++; stop(); resetResult(); setOutput('أوقفت التشغيل.'); }}>إيقاف</button>}</div>
    <div role="status" className={'python-lab-result ' + state}><strong>{state === 'passed' ? `اجتزت ${passed} من ${total} حالات ✓` : state === 'failed' ? `اجتزت ${passed} من ${total} حالات · راجع التلميحات` : state === 'error' ? 'تعذر التشغيل' : state === 'loading' ? 'يُحمّل المفسّر للمرة الأولى…' : state === 'running' ? 'ينفذ البرنامج…' : 'مخرجات التجربة ونتائج الحالات ستظهر هنا'}</strong><pre dir="auto">{output}</pre></div>
    {cases.length > 0 && <div className="python-cases" aria-label="نتائج فحص الكود">{cases.map((item, index) => <div key={index} className={item.passed ? 'passed' : 'failed'}><strong>{item.passed ? '✓' : '↻'} {item.name}</strong>{!item.passed && <p>{item.hint}{item.error && !item.error.includes('AssertionError') ? ` · ${item.error.slice(0, 180)}` : ''}</p>}</div>)}</div>}
    {exampleEnabled && attempted && <details className="python-example"><summary>راجع مثال الدرس بعد المحاولة</summary><pre dir="ltr"><code>{lesson.code}</code></pre></details>}
    <small>هذه حالات تدريبية منشورة وليست تصحيحًا شاملًا أو تحكيمًا رسميًا. يحتاج تنزيل المفسّر مرة واحدة عند فتح المختبر.</small>
  </section>;
}
