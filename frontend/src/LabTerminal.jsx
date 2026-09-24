import React,{useState} from 'react';

// This is a scripted exercise. Input is compared to authored answers; no shell or network is invoked.
export default function LabTerminal({exercise,onDone}){
 const [index,setIndex]=useState(0),[input,setInput]=useState(''),[history,setHistory]=useState([]),[message,setMessage]=useState('');
 const step=exercise.steps[index];
 function submit(e){e.preventDefault();if(!step)return;const answer=input.trim().replace(/\s+/g,' ');if(answer!==step.command){setMessage('هذا الأمر لا يحقق المهمة. اقرأ التلميح وحاول مجددًا.');return}setHistory(h=>[...h,{command:answer,output:step.output}]);setInput('');setMessage('');if(index===exercise.steps.length-1){setIndex(index+1);onDone()}else setIndex(index+1)}
 return <section className="academy-terminal" aria-label="طرفية تدريبية محاكية"><header><span>⌁ مختبر أوامر محلي</span><small>المهمة {Math.min(index+1,exercise.steps.length)} من {exercise.steps.length}</small></header><p>المخرجات أدناه أمثلة ثابتة داخل الموقع؛ لا يتم تشغيل أي أمر على جهازك أو الشبكة.</p><div className="academy-terminal-screen" dir="ltr">{history.map((line,i)=><div key={i}><strong>student@lab:~$ {line.command}</strong><pre>{line.output}</pre></div>)}</div>{step?<><h4>{step.prompt}</h4><small>تلميح: {step.hint}</small><form onSubmit={submit}><span dir="ltr">student@lab:~$</span><input dir="ltr" aria-label="أمر المختبر" value={input} onChange={e=>setInput(e.target.value)} autoComplete="off" spellCheck="false" placeholder="اكتب الأمر هنا"/><button type="submit">جرّب الأمر</button></form>{message&&<p role="status" className="academy-terminal-error">{message}</p>}</>:<p className="academy-terminal-success">أكملت مهام الطرفية التدريبية ✓</p>}</section>
}
