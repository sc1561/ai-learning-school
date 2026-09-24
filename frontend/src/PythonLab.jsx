import React, { useEffect, useRef, useState } from 'react';

export default function PythonLab({ lesson, onDone }) {
  const [code, setCode] = useState(lesson.code || '');
  const [inputs, setInputs] = useState((lesson.practice?.inputs || []).join('\n'));
  const [output, setOutput] = useState('');
  const [state, setState] = useState('idle');
  const workerRef = useRef(null);
  const timerRef = useRef(null);
  const runRef = useRef(0);
  function stop() {
    clearTimeout(timerRef.current);
    workerRef.current?.terminate();
    workerRef.current = null;
  }
  useEffect(() => () => stop(), []);
  function edit(value) { if (state==='running'||state==='loading') { runRef.current++; stop(); } setCode(value); setState('idle'); setOutput(''); onDone(false); }
  function execute() {
    const id = ++runRef.current;
    const worker = workerRef.current || new Worker(new URL('./pythonWorker.js', import.meta.url), { type: 'module' });
    workerRef.current = worker;
    setState('loading'); setOutput(''); onDone(false);
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
      if (data.phase === 'ready') { setState('running'); timeout(8000, 'توقف البرنامج بعد 8 ثوانٍ؛ راجع الحلقات أو المدخلات.'); return; }
      clearTimeout(timerRef.current); setOutput(data.output || 'لم يطبع البرنامج شيئًا.');
      setState(data.passed ? 'passed' : 'failed'); onDone(!!data.passed);
    };
    const runtimeURL = new URL(import.meta.env.BASE_URL + 'pyodide/pyodide.mjs', location.origin).href;
    worker.postMessage({ id, code, inputs: inputs.split(/\r?\n/).filter(Boolean).slice(0, 20), tests: lesson.practice?.tests || 'assert False', runtimeURL });
  }
  return <section className="python-lab" aria-label="مختبر بايثون"><div className="python-lab-head"><strong>⌘ مختبر بايثون</strong><small>التشغيل داخل متصفحك · فحص عملي تدريبي</small></div><p>عدّل المثال وشغّله؛ يجب أن ينجح اختبار الدرس لحفظ النقاط. انسخ أي تعديل مهم قبل مغادرة الصفحة. شغّل كودًا كتبته أو راجعته فقط.</p><label>الكود<textarea dir="ltr" spellCheck="false" value={code} onChange={e=>edit(e.target.value)} aria-label="كود بايثون" /></label><label>مدخلات تجريبية لـ input()، قيمة في كل سطر<input dir="ltr" value={inputs} onChange={e=>{if(state==='running'||state==='loading'){runRef.current++;stop()}setInputs(e.target.value);setState('idle');setOutput('');onDone(false)}} placeholder="مثال: 12" /></label><div className="python-lab-actions"><button type="button" onClick={execute} disabled={state==='loading'||state==='running'}>{state==='loading'?'تحميل بايثون…':state==='running'?'يجري التشغيل…':'▶ تشغيل وفحص'}</button>{(state==='loading'||state==='running')&&<button type="button" onClick={()=>{runRef.current++;stop();setState('idle');setOutput('أوقفت التشغيل.')}}>إيقاف</button>}</div><div role="status" className={'python-lab-result '+state}><strong>{state==='passed'?'اجتاز الفحص العملي ✓':state==='failed'?'راجع الكود وجرّب ثانية':state==='error'?'تعذر التشغيل':state==='loading'?'يُحمّل المفسّر للمرة الأولى…':state==='running'?'ينفذ البرنامج…':'المخرجات ستظهر هنا'}</strong><pre dir="auto">{output}</pre></div><small>الفحص يعتمد على حالات تدريبية منشورة؛ لا يمثل تصحيحًا شاملًا أو تحكيمًا رسميًا. يحتاج تنزيل المفسّر مرة على الأقل عند فتح المختبر.</small></section>;
}
