const LIMIT = 2 * 1024 * 1024;
const plain = value => value !== null && typeof value === 'object' && !Array.isArray(value);

export function makeProgressBackup(id, profile) {
  if (!id || !profile) throw new Error('اختر الطالب أولًا');
  return JSON.stringify({ format: 'alzahrawi-progress', version: 1, exportedAt: new Date().toISOString(), id,
    profile: { name: profile.name, section: profile.section || '', xp: profile.xp || 0,
      completed: profile.completed || {}, attempts: profile.attempts || [],
      pilot: profile.pilot || null, exam: profile.exam?.status === 'finished' ? profile.exam : null,
      pythonDiagnostic: profile.pythonDiagnostic || null,
      mixedSimulation: profile.mixedSimulation || null,
      capstones: profile.capstones || {} } }, null, 2);
}

export function readProgressBackup(text, expectedId, expectedProfile) {
  if (!expectedId || !expectedProfile) throw new Error('اختر الطالب قبل استيراد تقدمه');
  if (typeof text !== 'string' || text.length > LIMIT) throw new Error('ملف النسخة كبير جدًا');
  let data;
  try { data = JSON.parse(text); } catch { throw new Error('ملف JSON غير صالح'); }
  if (!plain(data) || data.format !== 'alzahrawi-progress' || data.version !== 1 || data.id !== expectedId || !plain(data.profile)) {
    throw new Error('النسخة لا تخص الطالب المحدد أو تنسيقها غير مدعوم');
  }
  const p = data.profile;
  if (p.name !== expectedProfile.name || (p.section || '') !== (expectedProfile.section || '')) {
    throw new Error('الاسم أو الشعبة في النسخة لا يطابقان الطالب الحالي');
  }
  if (!Number.isSafeInteger(p.xp) || p.xp < 0 || p.xp > 1000000 || !plain(p.completed) ||
      Object.keys(p.completed).length > 2000 || Object.entries(p.completed).some(([key, value]) => key.length > 100 || value !== true) ||
      !Array.isArray(p.attempts) || p.attempts.length > 500 || p.attempts.some(x => !plain(x)) ||
      (p.pilot !== null && p.pilot !== undefined && !plain(p.pilot)) ||
      (p.exam !== null && p.exam !== undefined && !plain(p.exam)) ||
      (p.pythonDiagnostic !== null && p.pythonDiagnostic !== undefined &&
        (!plain(p.pythonDiagnostic) || !plain(p.pythonDiagnostic.latest) || !Array.isArray(p.pythonDiagnostic.history) || p.pythonDiagnostic.history.length > 5)) ||
      (p.mixedSimulation !== null && p.mixedSimulation !== undefined &&
        (!plain(p.mixedSimulation) || !Array.isArray(p.mixedSimulation.history || []) || p.mixedSimulation.history?.length > 8)) ||
      (p.capstones !== undefined && (!plain(p.capstones) || Object.keys(p.capstones).length > 80 || Object.entries(p.capstones).some(([id, item]) =>
        !/^[a-z0-9-]{3,48}$/.test(id) || !plain(item) ||
        ['goal','artifact','tests','reflection'].some(key => item[key] !== undefined && (typeof item[key] !== 'string' || item[key].length > 4000)) ||
        (item.submittedAt !== undefined && item.submittedAt !== null && (typeof item.submittedAt !== 'string' || item.submittedAt.length > 40)))))) {
    throw new Error('بيانات التقدم في الملف غير صالحة');
  }
  return { name: expectedProfile.name, section: expectedProfile.section || '', xp: p.xp,
    completed: Object.fromEntries(Object.entries(p.completed)), attempts: p.attempts,
    pilot: p.pilot || undefined, exam: p.exam?.status === 'finished' ? p.exam : null,
    pythonDiagnostic: p.pythonDiagnostic || undefined,
    mixedSimulation: p.mixedSimulation || undefined, capstones: p.capstones || {} };
}
