import os
from datetime import datetime, timezone
from sqlalchemy import create_engine, ForeignKey, String, Integer, DateTime, Boolean, UniqueConstraint, JSON
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship, sessionmaker

DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///./school.db')
engine = create_engine(DATABASE_URL, connect_args={'check_same_thread': False} if DATABASE_URL.startswith('sqlite') else {}, pool_pre_ping=True)
Session = sessionmaker(bind=engine)
def now(): return datetime.now(timezone.utc)
class Base(DeclarativeBase): pass
class User(Base):
    __tablename__='users'
    id: Mapped[int]=mapped_column(primary_key=True)
    username: Mapped[str]=mapped_column(String(60), unique=True, index=True)
    display_name: Mapped[str]=mapped_column(String(100))
    password_hash: Mapped[str]=mapped_column(String(255))
    role: Mapped[str]=mapped_column(String(20), default='student')
    points: Mapped[int]=mapped_column(Integer, default=0)
class Course(Base):
    __tablename__='courses'
    id: Mapped[int]=mapped_column(primary_key=True)
    title: Mapped[str]=mapped_column(String(150))
    description: Mapped[str]=mapped_column(String(500), default='')
class Lesson(Base):
    __tablename__='lessons'
    id: Mapped[int]=mapped_column(primary_key=True)
    course_id: Mapped[int]=mapped_column(ForeignKey('courses.id'))
    title: Mapped[str]=mapped_column(String(150))
    content: Mapped[str]=mapped_column(String(5000), default='')
    order: Mapped[int]=mapped_column(Integer, default=0)
class Question(Base):
    __tablename__='questions'
    id: Mapped[int]=mapped_column(primary_key=True)
    lesson_id: Mapped[int | None]=mapped_column(ForeignKey('lessons.id'), nullable=True)
    text: Mapped[str]=mapped_column(String(500))
    choices: Mapped[list]=mapped_column(JSON)
    answer_index: Mapped[int]=mapped_column(Integer)
class Competition(Base):
    __tablename__='competitions'
    id: Mapped[int]=mapped_column(primary_key=True)
    title: Mapped[str]=mapped_column(String(150))
    starts_at: Mapped[datetime]=mapped_column(DateTime(timezone=True))
    ends_at: Mapped[datetime]=mapped_column(DateTime(timezone=True))
    question_ids: Mapped[list]=mapped_column(JSON)
class Submission(Base):
    __tablename__='submissions'
    __table_args__=(UniqueConstraint('user_id','question_id','competition_id', name='uq_submission'),)
    id: Mapped[int]=mapped_column(primary_key=True)
    user_id: Mapped[int]=mapped_column(ForeignKey('users.id'))
    question_id: Mapped[int]=mapped_column(ForeignKey('questions.id'))
    competition_id: Mapped[int | None]=mapped_column(ForeignKey('competitions.id'), nullable=True)
    lesson_id: Mapped[int | None]=mapped_column(ForeignKey('lessons.id'), nullable=True)
    answer_index: Mapped[int]=mapped_column(Integer)
    correct: Mapped[bool]=mapped_column(Boolean)
    awarded: Mapped[int]=mapped_column(Integer, default=0)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=now)
class PointEvent(Base):
    __tablename__='point_events'
    __table_args__=(UniqueConstraint('source', name='uq_point_source'),)
    id: Mapped[int]=mapped_column(primary_key=True)
    user_id: Mapped[int]=mapped_column(ForeignKey('users.id'))
    source: Mapped[str]=mapped_column(String(120))
    amount: Mapped[int]=mapped_column(Integer)
    created_at: Mapped[datetime]=mapped_column(DateTime(timezone=True), default=now)
