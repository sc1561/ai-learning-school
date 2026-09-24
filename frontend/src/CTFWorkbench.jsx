import React, { useState } from 'react';
import { transformClue } from './ctfTools.js';

export default function CTFWorkbench({ challenge, profile, profileId, completed, award }) {
  const notesKey = `alzahrawi-ctf-notes-v1:${encodeURIComponent(profileId || 'guest')}:${challenge.id}`;
  const [notes, setNotes] = useState(() => { try { return localStorage.getItem(notesKey) || ''; } catch { return ''; } });
  const [fileIndex, setFileIndex] = useState(0);
  const [hintCount, setHintCount] = useState(0);
  const [clue, setClue] = useState('');
  const [method, setMethod] = useState('base64');
  const [decoded, setDecoded] = useState('');
  const [flag, setFlag] = useState('');
  const [feedback, setFeedback] = useState('');
  const solved = completed || feedback.startsWith('صحيح');
  const files = challenge.files || [];
  const hints = challenge.hints?.length ? challenge.hints : [challenge.hint].filter(Boolean);
  function updateNotes(value) {
    setNotes(value);
    try { localStorage.setItem(notesKey, value); } catch { /* Local storage may be unavailable or full. */ }
  }
  function download(file) {
    const url = URL.createObjectURL(new Blob([file.content], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = file.name; anchor.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function decode() {
    try { setDecoded(transformClue(clue, method)); } catch (error) { setDecoded(error.message || 'تعذر فك القرينة'); }
  }
  function submit(event) {
    event.preventDefault();
    if (!profile) return setFeedback('اختر اسمك من الرئيسية لحفظ حل التحدي.');
    if (files.length && notes.trim().length < 20) return setFeedback('دوّن في دفتر القرائن كيف ربطت الملفات والدليل، في 20 حرفًا على الأقل.');
    if (flag.trim() !== challenge.flag) return setFeedback('العلم غير مطابق. راجع المطلوب ومصدر القرينة قبل المحاولة مجددًا.');
    if (!completed) award(`academy:${challenge.id}`, challenge.points || 40);
    setFeedback(`صحيح! ${completed ? 'أكملت التحدي مسبقًا.' : `+${challenge.points || 40} XP`}`);
  }
  return <section className="ctf-workbench"><p className="academy-prompt">{challenge.prompt}</p>{files.length > 0 && <div className="ctf-evidence"><h3>ملفات القضية · بيانات اصطناعية</h3><div className="ctf-file-tabs">{files.map((file, index) => <button key={file.name} className={fileIndex === index ? 'selected' : ''} onClick={() => setFileIndex(index)}>{file.name}</button>)}</div><div className="ctf-file-head"><span>{files[fileIndex]?.name}</span><button onClick={() => download(files[fileIndex])}>تنزيل الملف النصي ↓</button></div><pre dir="ltr">{files[fileIndex]?.content}</pre></div>}
    {files.length > 0 && <div className="ctf-tools"><h3>أداة فك القرائن</h3><p>انسخ قيمة قصيرة من الملف واختر طريقة التحويل. افحص معنى الناتج وعلاقته بالقضية؛ التحويل وحده لا يثبت الحل.</p><div><select value={method} onChange={event => { setMethod(event.target.value); setDecoded(''); }} aria-label="طريقة فك القرينة"><option value="base64">Base64 إلى نص</option><option value="hex">Hex إلى نص</option><option value="shift-back">إزاحة حرف للخلف</option></select><input dir="ltr" value={clue} onChange={event => { setClue(event.target.value); setDecoded(''); }} placeholder="الصق القيمة المرمزة" aria-label="القيمة المرمزة"/><button onClick={decode}>حلّل القرينة</button></div>{decoded && <p role="status" className="ctf-decode-result" dir="auto">النتيجة: {decoded}</p>}</div>}
    <div className="ctf-notes"><label>دفتر القرائن · اكتب مصدر الدليل وسبب اختيارك<textarea value={notes} onChange={event => updateNotes(event.target.value)} placeholder="مثال: وجدت رقم الحالة في المذكرة، ثم طابقت الصف في الملف الثاني…"/></label><small>الملاحظات تحفظ على هذا المتصفح فقط؛ لا تُرسل إلى خدمة خارجية ولا تنتقل مع ملف التقدم.</small></div>
    <div className="ctf-hints"><h3>تلميحات بالتدرج</h3>{hints.slice(0, hintCount).map((hint, index) => <p key={index}><b>{index + 1}</b> {hint}</p>)}{hintCount < hints.length && <button onClick={() => setHintCount(count => count + 1)}>أظهر التلميح {hintCount + 1} من {hints.length}</button>}</div>
    <form className="ctf-submit" onSubmit={submit}><label>العلم <input dir="ltr" autoComplete="off" spellCheck="false" placeholder="SCHOOL{...}" value={flag} onChange={event => setFlag(event.target.value)}/></label><button type="submit">إرسال العلم</button></form>{feedback && <p role="status" className={feedback.startsWith('صحيح') ? 'success' : 'ctf-feedback'}>{feedback}</p>}{solved && <div className="ctf-explanation"><h3>راجع طريق الحل</h3>{challenge.solutionSteps?.length ? <ol>{challenge.solutionSteps.map((step, index) => <li key={index}>{step}</li>)}</ol> : <p>{challenge.explain}</p>}</div>}
  </section>;
}
