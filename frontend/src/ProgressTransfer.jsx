import React, { useState } from 'react';
import { makeProgressBackup, readProgressBackup } from './progressBackup.js';

export default function ProgressTransfer({ activeId, profile, setData, saveFile }) {
  const [pending, setPending] = useState(null);
  const [message, setMessage] = useState('');
  function download() {
    if (!profile || !activeId) return;
    saveFile('student-progress.json', makeProgressBackup(activeId, profile));
    setMessage('نُزّلت نسخة التقدم. احتفظ بالملف في مكان خاص.');
  }
  async function selectFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    setPending(null);
    if (!file) return;
    try {
      if (file.size > 2 * 1024 * 1024) throw new Error('ملف النسخة كبير جدًا');
      const restored = readProgressBackup(await file.text(), activeId, profile);
      setPending(restored);
      setMessage('راجع عدد الإنجازات والنقاط أدناه قبل تطبيق النسخة.');
    } catch (error) { setMessage(error.message || 'تعذرت قراءة الملف'); }
  }
  function apply() {
    if (!pending || !activeId || !profile) return;
    setData(current => {
      if (current.active !== activeId || current.profiles[activeId]?.name !== pending.name) return current;
      return { ...current, profiles: { ...current.profiles, [activeId]: pending } };
    });
    setPending(null);
    setMessage('استُعيد تقدم الطالب على هذا الجهاز.');
  }
  return <article className="glass progress-transfer"><i>⇄</i><h2>نقل تقدمي بين الأجهزة</h2><p>اختر اسم الطالب، ثم نزّل نسخة من تقدمه. على الجهاز الآخر اختر الاسم والشعبة نفسيهما واستورد الملف. هذه عملية يدوية؛ الملف يحتوي اسم الطالب ونتائجه، فلا تشاركه علنًا.</p>{profile?<><button type="button" onClick={download}>تنزيل نسخة التقدم</button><label className="progress-file">اختيار ملف النسخة لاستعادتها<input type="file" accept=".json,application/json" onChange={selectFile}/></label>{pending&&<div className="progress-preview"><strong>نسخة {pending.name}</strong><span>{Object.keys(pending.completed).length} إنجازًا · {pending.xp} XP</span><p>تطبيق النسخة يستبدل تقدم هذا الطالب الموجود على الجهاز الحالي.</p><button type="button" onClick={apply}>تطبيق النسخة لهذا الطالب</button></div>}</>:<p>اختر اسمك من الرئيسية لتفعيل النقل.</p>}{message&&<p role="status">{message}</p>}</article>;
}
