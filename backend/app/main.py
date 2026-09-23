import os, asyncio
from datetime import datetime, timezone
from contextlib import asynccontextmanager
import jwt
from jwt.exceptions import InvalidTokenError
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from pwdlib import PasswordHash
from sqlalchemy import select, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session as DBSession
from .db import Base, engine, Session, User, Course, Lesson, Question, Competition, Submission, PointEvent

SECRET=os.getenv('SECRET_KEY', 'local-dev-only-change-before-deploy')
ALGORITHM='HS256'
passwords=PasswordHash.recommended()
bearer=HTTPBearer()
def utc(dt): return dt.replace(tzinfo=timezone.utc) if dt.tzinfo is None else dt.astimezone(timezone.utc)
def db():
    with Session() as session: yield session

def current(credentials: HTTPAuthorizationCredentials=Depends(bearer), session: DBSession=Depends(db)):
    try:
        claims=jwt.decode(credentials.credentials,SECRET,algorithms=[ALGORITHM]); user=session.get(User,int(claims['sub']))
        if user: return user
    except (InvalidTokenError, ValueError, KeyError): pass
    raise HTTPException(401,'جلسة غير صالحة')
def teacher(user: User=Depends(current)):
    if user.role not in ('teacher','admin'): raise HTTPException(403,'يتطلب صلاحية معلّم')
    return user

def public_question(q): return {'id':q.id,'text':q.text,'choices':q.choices}
def award(session,user,source,amount):
    session.add(PointEvent(user_id=user.id,source=source,amount=amount))
    session.flush()
    user.points += amount

def seed(session):
    if session.scalar(select(func.count()).select_from(Course)): return
    data=[('مقدمة في البرمجة بلغة البايثون','المتغيرات والمدخلات وأول برنامج تفاعلي','تعلم كتابة برنامج يسأل المستخدم عن اسمه وعمره ثم يرحب به.', 'ما الدالة التي تقرأ إدخال المستخدم؟',['input()','print()','len()'],0),('منهجيات تطوير تطبيقات الذكاء الاصطناعي','مراحل تطوير التطبيق','ابدأ بتحديد المشكلة ثم جمع المتطلبات وتصميم الحل واختباره.', 'ما أول خطوة عند بناء تطبيق؟',['تحديد المشكلة','نشر التطبيق','تغيير الألوان'],0),('واجهة وتجربة المستخدم','الفرق بين UI و UX','واجهة المستخدم ما تراه؛ تجربة المستخدم مدى سهولة استخدامه وتحقيق الهدف.', 'ماذا يوضح المخطط الهيكلي Wireframe؟',['بنية الشاشة','كلمة المرور','سرعة الشبكة'],0)]
    for title,lesson_title,body,question,choices,answer in data:
        course=Course(title=title,description='محتوى تمهيدي مستوحى من أوراق التدريب المرفقة'); session.add(course);session.flush()
        lesson=Lesson(course_id=course.id,title=lesson_title,content=body);session.add(lesson);session.flush()
        session.add(Question(lesson_id=lesson.id,text=question,choices=choices,answer_index=answer))
    session.commit()

@asynccontextmanager
async def lifespan(app):
    Base.metadata.create_all(engine)
    with Session() as session: seed(session)
    yield
app=FastAPI(title='منصة التعلم والمسابقات',lifespan=lifespan)
app.add_middleware(CORSMiddleware,allow_origins=[s.strip() for s in os.getenv('CORS_ORIGINS','http://localhost:5173').split(',')],allow_methods=['*'],allow_headers=['*'])
class Credentials(BaseModel): username:str=Field(min_length=3,max_length=60);password:str=Field(min_length=8,max_length=128)
class Register(Credentials): display_name:str=Field(min_length=2,max_length=100)
class Answer(BaseModel): question_id:int;answer_index:int
class NewCompetition(BaseModel): title:str=Field(min_length=3);starts_at:datetime;ends_at:datetime;question_ids:list[int]

@app.post('/auth/register')
def register(body:Register,session:DBSession=Depends(db)):
    user=User(username=body.username,display_name=body.display_name,password_hash=passwords.hash(body.password),role='student')
    session.add(user)
    try: session.commit()
    except IntegrityError: session.rollback();raise HTTPException(409,'اسم المستخدم مستخدم')
    return {'id':user.id,'username':user.username}
@app.post('/auth/login')
def login(body:Credentials,session:DBSession=Depends(db)):
    user=session.scalar(select(User).where(User.username==body.username))
    if not user or not passwords.verify(body.password,user.password_hash): raise HTTPException(401,'بيانات الدخول غير صحيحة')
    token=jwt.encode({'sub':str(user.id),'exp':int(datetime.now(timezone.utc).timestamp())+3600},SECRET,algorithm=ALGORITHM)
    return {'access_token':token,'token_type':'bearer','role':user.role,'display_name':user.display_name}
@app.get('/me')
def me(user:User=Depends(current)): return {'id':user.id,'display_name':user.display_name,'role':user.role,'points':user.points}
@app.get('/courses')
def courses(session:DBSession=Depends(db)):
    return [{'id':c.id,'title':c.title,'description':c.description,'lessons':[{'id':l.id,'title':l.title,'content':l.content,'questions':[public_question(q) for q in session.scalars(select(Question).where(Question.lesson_id==l.id))]} for l in session.scalars(select(Lesson).where(Lesson.course_id==c.id).order_by(Lesson.order))]} for c in session.scalars(select(Course))]
@app.post('/lessons/{lesson_id}/answers')
def answer_lesson(lesson_id:int,body:Answer,user:User=Depends(current),session:DBSession=Depends(db)):
    q=session.get(Question,body.question_id)
    if not q or q.lesson_id!=lesson_id: raise HTTPException(404,'السؤال غير موجود')
    if not 0<=body.answer_index<len(q.choices): raise HTTPException(422,'اختيار غير صالح')
    previous=session.scalar(select(Submission).where(Submission.user_id==user.id,Submission.question_id==q.id,Submission.competition_id.is_(None)))
    if previous: raise HTTPException(409,'سبق تقديم الإجابة')
    correct=body.answer_index==q.answer_index
    session.add(Submission(user_id=user.id,question_id=q.id,lesson_id=lesson_id,answer_index=body.answer_index,correct=correct,awarded=10 if correct else 0))
    if correct: award(session,user,f'lesson:{user.id}:{q.id}',10)
    session.commit();return {'correct':correct,'awarded':10 if correct else 0}
@app.get('/leaderboard')
def leaderboard(session:DBSession=Depends(db)):
    return [{'name':u.display_name,'points':u.points} for u in session.scalars(select(User).where(User.role=='student').order_by(User.points.desc(),User.id).limit(50))]
@app.post('/competitions')
def create_comp(body:NewCompetition,admin:User=Depends(teacher),session:DBSession=Depends(db)):
    if utc(body.starts_at)>=utc(body.ends_at) or not body.question_ids or len(body.question_ids)!=len(set(body.question_ids)):raise HTTPException(422,'التوقيت أو الأسئلة غير صالحة')
    count=session.scalar(select(func.count()).select_from(Question).where(Question.id.in_(body.question_ids)))
    if count!=len(body.question_ids):raise HTTPException(422,'هناك أسئلة غير موجودة')
    comp=Competition(title=body.title,starts_at=utc(body.starts_at),ends_at=utc(body.ends_at),question_ids=body.question_ids)
    session.add(comp);session.commit();return {'id':comp.id}
@app.get('/competitions')
def competitions(session:DBSession=Depends(db)):
    now=datetime.now(timezone.utc)
    return [{'id':c.id,'title':c.title,'starts_at':utc(c.starts_at),'ends_at':utc(c.ends_at),'status':'upcoming' if now<utc(c.starts_at) else 'closed' if now>=utc(c.ends_at) else 'open'} for c in session.scalars(select(Competition).order_by(Competition.starts_at.desc()))]
@app.get('/competitions/{comp_id}/questions')
def comp_questions(comp_id:int,user:User=Depends(current),session:DBSession=Depends(db)):
    c=session.get(Competition,comp_id);now=datetime.now(timezone.utc)
    if not c:raise HTTPException(404,'المسابقة غير موجودة')
    if not utc(c.starts_at)<=now<utc(c.ends_at):raise HTTPException(403,'الغرفة مغلقة')
    return [public_question(session.get(Question,qid)) for qid in c.question_ids]
@app.post('/competitions/{comp_id}/answers')
def answer_comp(comp_id:int,body:Answer,user:User=Depends(current),session:DBSession=Depends(db)):
    c=session.get(Competition,comp_id);now=datetime.now(timezone.utc)
    if not c:raise HTTPException(404,'المسابقة غير موجودة')
    if not utc(c.starts_at)<=now<utc(c.ends_at):raise HTTPException(403,'الغرفة مغلقة')
    if body.question_id not in c.question_ids:raise HTTPException(404,'السؤال غير موجود')
    q=session.get(Question,body.question_id)
    if not 0<=body.answer_index<len(q.choices):raise HTTPException(422,'اختيار غير صالح')
    if session.scalar(select(Submission).where(Submission.user_id==user.id,Submission.question_id==q.id,Submission.competition_id==comp_id)):raise HTTPException(409,'سبق تقديم الإجابة')
    correct=body.answer_index==q.answer_index
    session.add(Submission(user_id=user.id,question_id=q.id,competition_id=comp_id,answer_index=body.answer_index,correct=correct,awarded=20 if correct else 0))
    if correct:award(session,user,f'competition:{comp_id}:{user.id}:{q.id}',20)
    session.commit();return {'correct':correct,'awarded':20 if correct else 0}
@app.websocket('/ws/competitions/{comp_id}')
async def live(websocket:WebSocket,comp_id:int):
    token=websocket.query_params.get('token','')
    try: claims=jwt.decode(token,SECRET,algorithms=[ALGORITHM])
    except InvalidTokenError: await websocket.close(code=1008);return
    with Session() as session:
        if not session.get(User,int(claims['sub'])) or not session.get(Competition,comp_id):await websocket.close(code=1008);return
    await websocket.accept()
    try:
        while True:
            with Session() as session:
                c=session.get(Competition,comp_id);now=datetime.now(timezone.utc)
                status='upcoming' if now<utc(c.starts_at) else 'closed' if now>=utc(c.ends_at) else 'open'
                rows=session.execute(select(User.display_name,func.sum(Submission.awarded).label('score')).join(Submission,User.id==Submission.user_id).where(Submission.competition_id==comp_id).group_by(User.id).order_by(func.sum(Submission.awarded).desc(),User.id).limit(20)).all()
                await websocket.send_json({'type':'state','status':status,'seconds_remaining':max(0,int((utc(c.ends_at)-now).total_seconds())) if status=='open' else 0,'leaderboard':[{'name':n,'points':p} for n,p in rows]})
            if status=='closed':await websocket.close();break
            await asyncio.sleep(1)
    except WebSocketDisconnect:pass
