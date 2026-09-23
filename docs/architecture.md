# مخطط البيانات والواجهات

## العلاقات

- `users(id, username, display_name, password_hash, role, points)`.
- `courses(id, title, description)` → `lessons(id, course_id, title, content, order)` → `questions(id, lesson_id, text, choices JSON, answer_index)`.
- `competitions(id, title, starts_at, ends_at, question_ids JSON)`؛ يعاد تصميم قائمة الأسئلة كجدول ارتباط عند إضافة تحرير الأسئلة أو ترتيبها الإداري.
- `submissions(id, user_id, question_id, competition_id?, lesson_id?, answer_index, correct, awarded, created_at)`؛ قيد فريد يمنع تكرار سؤال المسابقة، وفحص إضافي في الخادم للأسئلة التدريبية.
- `point_events(id, user_id, source UNIQUE, amount, created_at)`؛ سجل محاسبي للنقاط، بينما `users.points` مجموع جاهز للقراءة.

## REST API

| الطريقة | المسار | الدور | الوظيفة |
| --- | --- | --- | --- |
| POST | `/auth/register` | عام | إنشاء حساب طالب |
| POST | `/auth/login` | عام | رمز JWT لمدة ساعة |
| GET | `/me` | مسجل | بيانات الحساب والنقاط |
| GET | `/courses` | عام | المسارات والدروس والأسئلة دون الحلول |
| POST | `/lessons/{id}/answers` | مسجل | تصحيح سؤال تدريبي |
| GET | `/leaderboard` | عام | أفضل 50 طالبًا |
| POST | `/competitions` | معلم/مدير | جدولة مسابقة من معرفات أسئلة موجودة |
| GET | `/competitions` | عام | الأوقات والحالة |
| GET | `/competitions/{id}/questions` | مسجل خلال المسابقة | الأسئلة دون الحلول |
| POST | `/competitions/{id}/answers` | مسجل خلال المسابقة | تسليم إجابة ومنح النقاط |

الطلبات المحمية تستخدم `Authorization: Bearer <token>`؛ جسم الإجابة: `{"question_id":1,"answer_index":0}`. نموذج إنشاء المسابقة: `{"title":"تحدي بايثون","starts_at":"2026-09-24T12:00:00+04:00","ends_at":"2026-09-24T12:15:00+04:00","question_ids":[1,2]}`.

## WebSocket

`ws://localhost:8000/ws/competitions/{id}?token=<JWT>`؛ يرسل الخادم كل ثانية `{"type":"state","status":"open","seconds_remaining":57,"leaderboard":[{"name":"طالب","points":20}]}`. الحالات `upcoming/open/closed`؛ يغلق الخادم الاتصال عند انتهاء الوقت. تجنب تسجيل عنوان الاتصال الكامل لأن الرمز يظهر في query؛ للإنتاج يُفضّل رمز اتصال قصير العمر وبيئة `wss`.
