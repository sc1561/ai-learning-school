import React, { useMemo, useState } from 'react';
import { readProgressBackup } from './progressBackup.js';
import { simulationSkills } from './mixedSimulationBank.js';
import academyCatalog from './academyCatalog.json';
import { capstoneBriefs } from './Capstone.jsx';
import './teacherDashboard.css';

const csvCell = value => {
  const text = String(value ?? '');
  return `"${(/^[\s\u0000-\u001f]*[=+@-]/u.test(text) ? `'${text}` : text).replaceAll('"', '""')}\"`;
};
export function teacherRows(records, grades = {}) {
  const header = ['الطالب', 'الشعبة', 'إنجازات الدروس والتحديات', 'نتيجة المحاكاة', ...simulationSkills.map(x => x.title), 'مشاريع جاهزة للمراجعة', 'تقييمات المعلم'];
  return [header, ...records.map(({ id, profile: p }) => {
    const report = p.mixedSimulation?.latest;
    const submitted = Object.entries(p.capstones || {}).filter(([, project]) => project.submittedAt);
    return [p.name, p.section, Object.keys(p.completed || {}).length, report ? `${report.score}/${report.total}` : '', ...simulationSkills.map(skill => {
      const item = report?.breakdown?.[skill.id]; return item ? `${item.correct}/${item.total}` : '';
    }), submitted.length, submitted.map(([trackId]) => grades[`${id}:${trackId}`]?.every(x => x !== '') ? `${trackId}: ${grades[`${id}:${trackId}`].reduce((sum, value) => sum + Number(value), 0)}/12` : '').filter(Boolean).join('؛ ')];
  })];
}
export function parseTeacherBackup(text) {
  if (text.length > 2 * 1024 * 1024) throw new Error('ملف كبير جدًا');
  const raw = JSON.parse(text);
  if (typeof raw?.id !== 'string' || raw.id.length > 200 || !raw.profile || typeof raw.profile.name !== 'string') throw new Error('ملف تقدم غير صالح');
  return { id: raw.id, exportedAt: raw.exportedAt || '', profile: readProgressBackup(text, raw.id, raw.profile) };
}

export default function TeacherDashboard({ saveFile, packs = [] }) {
  const [records, setRecords] = useState([]);
  const [grades, setGrades] = useState({});
  const [message, setMessage] = useState('');
  const tracks = academyCatalog.areas.flatMap(area => [...area.tracks, ...packs.filter(track => track.areaId === area.id)].map(track => ({ ...track, areaId: area.id })));
  const submitted = records.flatMap(record => Object.entries(record.profile.capstones || {}).filter(([, project]) => project.submittedAt).map(([trackId, project]) => ({ record, trackId, project, track: tracks.find(x => x.id === trackId) })));
  const weaknesses = useMemo(() => simulationSkills.map(skill => {
    const scores = records.map(x => x.profile.mixedSimulation?.latest?.breakdown?.[skill.id]).filter(x => x?.total);
    return { ...skill, learners: scores.length, percent: scores.length ? Math.round(scores.reduce((sum, x) => sum + x.correct, 0) / scores.reduce((sum, x) => sum + x.total, 0) * 100) : null };
  }).sort((a, b) => (a.percent ?? 101) - (b.percent ?? 101)), [records]);
  async function importFiles(event) {
    const files = [...(event.target.files || [])]; event.target.value = '';
    if (!files.length) return;
    if (files.length > 100) return setMessage('اختر 100 ملف أو أقل في كل مرة.');
    const accepted = [], rejected = [];
    for (const file of files) {
      try { if (file.size > 2 * 1024 * 1024) throw Error(); accepted.push(parseTeacherBackup(await file.text())); }
      catch { rejected.push(file.name); }
    }
    setRecords(old => {
      const byId = new Map(old.map(item => [item.id, item]));
      for (const record of accepted) if (!byId.has(record.id) || record.exportedAt >= byId.get(record.id).exportedAt) byId.set(record.id, record);
      return [...byId.values()].sort((a, b) => a.profile.name.localeCompare(b.profile.name, 'ar'));
    });
    setMessage(`قُرئ ${accepted.length} ملف، ورُفض ${rejected.length}. عند تكرار الطالب تُستخدم أحدث نسخة.`);
  }
  function exportCsv() { saveFile('تقرير-المعلم.csv', '\uFEFF' + teacherRows(records, grades).map(row => row.map(csvCell).join(',')).join('\n'), 'text/csv;charset=utf-8'); }
  function grade(key, index, value) { setGrades(old => { const values = [...(old[key] || ['', '', '', ''])]; values[index] = value; return { ...old, [key]: values }; }); }
  return <section className="teacher-dashboard"><header><span className="eyebrow">TEACHER REVIEW / قراءة محلية</span><h1>لوحة متابعة المعلم</h1><p>استورد نسخ تقدم الطلاب التي شاركوها معك بصورة خاصة. تُقرأ الملفات في هذه الصفحة فقط ولا تُرفع إلى GitHub أو إلى خادم؛ أغلق الصفحة لمسح السجلات والتقييمات المؤقتة.</p><label className="teacher-import">اختيار ملفات تقدم الطلاب<input type="file" accept=".json,application/json" multiple onChange={importFiles}/></label>{records.length > 0 && <><button onClick={exportCsv}>تنزيل التقرير CSV</button><button className="teacher-clear" onClick={() => { setRecords([]); setGrades({}); setMessage('مُسحت البيانات المؤقتة.'); }}>مسح البيانات المعروضة</button></>}{message && <p role="status">{message}</p>}</header>{records.length > 0 && <><div className="teacher-stats"><article className="glass"><strong>{records.length}</strong><span>طالبًا في الملفات</span></article><article className="glass"><strong>{records.filter(x => x.profile.mixedSimulation?.latest).length}</strong><span>أكملوا المحاكاة</span></article><article className="glass"><strong>{submitted.length}</strong><span>مشروعًا للمراجعة</span></article></div><div className="teacher-skills glass"><h2>المهارات التي تحتاج تدريبًا</h2><p>نسبة الإجابات الصحيحة في آخر محاكاة لكل طالب مستورد؛ تظهر المهارة الأضعف أولًا.</p>{weaknesses.map(skill => <div key={skill.id}><span>{skill.title}</span><progress value={skill.percent ?? 0} max="100"/><strong>{skill.percent === null ? 'لا بيانات' : `${skill.percent}% · ${skill.learners} طلاب`}</strong></div>)}</div><div className="teacher-table-wrap glass"><h2>ملخص الطلاب</h2><table><thead><tr><th>الطالب</th><th>الشعبة</th><th>الإنجازات</th><th>المحاكاة</th><th>مشاريع للمراجعة</th></tr></thead><tbody>{records.map(({ id, profile }) => <tr key={id}><td>{profile.name}</td><td>{profile.section}</td><td>{Object.keys(profile.completed || {}).length}</td><td>{profile.mixedSimulation?.latest ? `${profile.mixedSimulation.latest.score}/${profile.mixedSimulation.latest.total}` : '—'}</td><td>{Object.values(profile.capstones || {}).filter(x => x.submittedAt).length}</td></tr>)}</tbody></table></div><div className="teacher-projects"><h2>مراجعة المشاريع الختامية</h2>{submitted.length === 0 && <p>لا توجد مشاريع مجهزة للمراجعة في الملفات المستوردة.</p>}{submitted.map(({ record, trackId, project, track }) => { const key = `${record.id}:${trackId}`, rubric = capstoneBriefs[track?.areaId]?.criteria || []; return <details key={key} className="glass"><summary>{record.profile.name} · {track?.title || trackId}</summary><div className="teacher-project-content">{[['الهدف والخطة','goal'],['العمل أو الحل','artifact'],['الاختبارات','tests'],['المراجعة','reflection']].map(([label, field]) => <div key={field}><strong>{label}</strong><p>{project[field] || 'لم يكتب الطالب هذا القسم'}</p></div>)}{rubric.length > 0 && <div className="teacher-rubric"><h3>تقدير المعلم · 0 لم يظهر / 1 بداية / 2 جيد / 3 متقن</h3>{rubric.map((criterion, index) => <label key={criterion}>{criterion}<select value={grades[key]?.[index] ?? ''} onChange={e => grade(key, index, e.target.value)}><option value="">اختر</option>{[0,1,2,3].map(n => <option key={n} value={n}>{n}</option>)}</select></label>)}<strong>المجموع: {grades[key]?.every(x => x !== '') ? `${grades[key].reduce((sum, value) => sum + Number(value), 0)}/12` : 'أكمل المعايير الأربعة'}</strong><p>احتفظ بملف CSV قبل إغلاق الصفحة؛ الدرجات هنا لا تُرسل إلى الطالب تلقائيًا.</p></div>}</div></details>; })}</div></>}</section>;
}
