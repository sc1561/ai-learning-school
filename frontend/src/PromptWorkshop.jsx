import React,{useState} from 'react';

// Assembles the student's own description locally. No prompt is sent to an image or video service.
export default function PromptWorkshop({kind,onDone}){
 const [form,setForm]=useState({goal:'',subject:'',place:'',composition:'',light:'',style:'',aspect:'',motion:'',camera:'',sequence:'',duration:'',constraints:''});
 const [copied,setCopied]=useState(false),[accepted,setAccepted]=useState(false);
 const video=kind==='video';
 const fields=[['goal','الغرض من الناتج','مثال: مشهد افتتاحي لعرض مدرسي'],['subject','العنصر أو الشخصية','مثال: نموذج تعليمي لفلج، دون طلاب حقيقيين'],['place','المكان والخلفية','مثال: بيئة عُمانية مستوحاة من الأفلاج'],['composition','اللقطة أو التكوين','مثال: لقطة واسعة تُظهر مجرى الماء'],['light','الإضاءة والألوان','مثال: إضاءة صباحية طبيعية وألوان هادئة'],['style','الأسلوب البصري','مثال: رسم تعليمي واضح أو صورة واقعية']];
 const extra=video?[['motion','حركة العنصر','مثال: يتحرك الماء ببطء في المجرى'],['camera','حركة الكاميرا','مثال: تتقدم الكاميرا ببطء دون قطع'],['sequence','تسلسل الحدث','مثال: بداية واسعة، ثم اقتراب من التفاصيل'],['duration','المدة المقترحة','مثال: 6 ثوانٍ؛ إذا كانت الأداة تدعمها']]:[['aspect','نسبة الأبعاد','مثال: 16:9 لشريحة عرض']];
 const necessary=video?['goal','subject','place','motion','camera']:['goal','subject','place','composition'];
 const ready=necessary.every(k=>form[k].trim().length>3);
 const labels={goal:'الهدف',subject:'الموضوع',place:'البيئة',composition:'التكوين',light:'الإضاءة',style:'الأسلوب',aspect:'نسبة الأبعاد',motion:'حركة العنصر',camera:'حركة الكاميرا',sequence:'تسلسل اللقطات',duration:'المدة',constraints:'حدود وملاحظات'};
 const order=['goal','subject','place','composition','light','style',...(video?['motion','camera','sequence','duration']:['aspect']),'constraints'];
 const prompt=order.filter(k=>form[k].trim()).map(k=>`${labels[k]}: ${form[k].trim()}`).join('؛ ')+'.';
 function change(k,v){setForm(f=>({...f,[k]:v}));setCopied(false);if(accepted){setAccepted(false);onDone(false)}}
 async function copy(){if(!ready)return;try{await navigator.clipboard.writeText(prompt);setCopied(true)}catch{setCopied(false)}}
 return <section className="prompt-workshop"><header><span>✦ استوديو كتابة طلب {video?'الفيديو':'الصورة'}</span><small>مسودة محلية · لا يولّد وسائط</small></header><p>املأ الحقول ببيانات خيالية أو عامة. راجع دقة وصف البيئة العُمانية ولا تُدخل أسماء أو صور طلاب حقيقيين.</p><div className="prompt-fields">{[...fields,...extra,['constraints','ما الذي تريد استبعاده أو التحقق منه؟','مثال: بلا نص داخل الصورة، وبلا شعارات غير مرخصة']].map(([key,label,placeholder])=><label key={key}>{label}<input value={form[key]} onChange={e=>change(key,e.target.value)} placeholder={placeholder}/></label>)}</div><div className="prompt-preview"><strong>طلبك المركّب</strong><p>{ready?prompt:'اكتب الهدف والموضوع والمكان ثم أكمل الحقول الأساسية لعرض طلبك هنا.'}</p></div><div className="prompt-actions"><button disabled={!ready} onClick={copy}>{copied?'نُسخ النص ✓':'نسخ الطلب'}</button><button disabled={!ready||accepted} onClick={()=>{setAccepted(true);onDone(true)}}>{accepted?'اعتمدت المسودة ✓':'اعتماد المسودة التدريبية'}</button></div><small>جرّب الطلب لاحقًا في أداة مصرح بها، وقارن الناتج بالهدف، ثم عدّل وصفًا واحدًا في كل محاولة. النسخ يعمل عندما يسمح المتصفح بذلك.</small></section>
}
