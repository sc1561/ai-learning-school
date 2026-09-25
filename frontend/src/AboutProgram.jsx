import React, { useEffect, useRef } from 'react';
import schoolLogo from './schoolLogo.js';
import './aboutProgram.css';

export default function AboutProgram({ onClose }) {
  const closeButton = useRef(null);
  useEffect(() => {
    closeButton.current?.focus();
    const onKeyDown = event => { if (event.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return <div className="about-overlay" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="about-dialog glass" role="dialog" aria-modal="true" aria-labelledby="about-program-title" dir="rtl">
      <button ref={closeButton} className="about-close" aria-label="إغلاق عن البرنامج" onClick={onClose}>×</button>
      <div className="about-identity"><img src={schoolLogo} alt="شعار مدرسة أبو القاسم الزهراوي"/><span>FUTURE LEARNING LAB / ABOUT</span></div>
      <h2 id="about-program-title">عن البرنامج</h2>
      <p>منصة تعليمية تفاعلية من مدرسة أبو القاسم الزهراوي، تساعد الطلاب على تعلم الذكاء الاصطناعي والبرمجة والأمن السيبراني والتقاط العلم، ثم تطبيق ما تعلموه في تحديات ومحاكاة ومشاريع ختامية.</p>
      <div className="about-credit"><span>تصميم</span><strong>الأستاذ أحمد الضامري</strong><span>مدرسة أبو القاسم الزهراوي · تقنية المعلومات</span><a href="mailto:ahm7d@moe.om" dir="ltr">ahm7d@moe.om</a></div>
      <small>التقدم والنتائج محفوظة محليًا في متصفح الطالب. أنشطة المسابقات هنا للتدريب وليست تحكيمًا رسميًا.</small>
    </section>
  </div>;
}
