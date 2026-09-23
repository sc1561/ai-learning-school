import os
os.environ['DATABASE_URL']='sqlite:///./test_school.db'
os.environ['SECRET_KEY']='unit-test-secret'
from datetime import datetime, timedelta, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.db import Session, User

def test_learning_and_timed_competition():
    with TestClient(app) as client:
        r=client.post('/auth/register',json={'username':'student1','password':'example-pass-123','display_name':'طالب تجريبي'})
        assert r.status_code==200
        r=client.post('/auth/login',json={'username':'student1','password':'example-pass-123'})
        assert r.status_code==200
        headers={'Authorization':'Bearer '+r.json()['access_token']}
        course=client.get('/courses').json()[0]
        lesson=course['lessons'][0]
        q=lesson['questions'][0]
        assert 'answer_index' not in q
        answer=client.post(f'/lessons/{lesson["id"]}/answers',json={'question_id':q['id'],'answer_index':0},headers=headers)
        assert answer.json()=={'correct':True,'awarded':10}
        assert client.post(f'/lessons/{lesson["id"]}/answers',json={'question_id':q['id'],'answer_index':0},headers=headers).status_code==409
        assert client.get('/me',headers=headers).json()['points']==10
        with Session() as session:
            u=session.query(User).filter_by(username='student1').one();u.role='teacher';session.commit()
        start=datetime.now(timezone.utc)-timedelta(seconds=5)
        end=start+timedelta(seconds=60)
        r=client.post('/competitions',json={'title':'مسابقة تجريبية','starts_at':start.isoformat(),'ends_at':end.isoformat(),'question_ids':[q['id']]},headers=headers)
        assert r.status_code==200,r.text
        comp_id=r.json()['id']
        assert len(client.get(f'/competitions/{comp_id}/questions',headers=headers).json())==1
        with client.websocket_connect(f'/ws/competitions/{comp_id}?token={headers["Authorization"].split()[1]}') as ws:
            state=ws.receive_json();assert state['status']=='open'
        r=client.post(f'/competitions/{comp_id}/answers',json={'question_id':q['id'],'answer_index':0},headers=headers)
        assert r.json()['awarded']==20
        assert client.get('/me',headers=headers).json()['points']==30
        assert client.post(f'/competitions/{comp_id}/answers',json={'question_id':q['id'],'answer_index':0},headers=headers).status_code==409
