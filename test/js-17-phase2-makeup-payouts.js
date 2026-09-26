
/* ══════════ المرحلة ٢: الاعتذار والتعويض والغياب والمستحقات ══════════ */
const P2_DAYS=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
async function p2Call(fn,args,okMsg){
  try{const {data,error}=await _sb.rpc(fn,args);if(error)throw error;if(!data||data.ok===false)throw new Error(data&&data.error||'تعذّرت العملية');if(okMsg)toast(okMsg,'s');return data;}
  catch(e){toast(e.message||String(e),'e');return null;}
}
/* — الطالب: الاعتذار عن درس — */
async function studentCancelLesson(id,isTrial){
  const msg=isTrial?'إلغاء درسك التجريبي؟ يبقى درسك المجاني متاحًا لتحجزه في موعد آخر.':'الاعتذار عن هذا الدرس؟\n\nيُحفظ لك درس تعويضي تحجزه بموعد بديل قبل نهاية اشتراكك (تعويضان كحد أقصى في كل اشتراك).';
  if(!confirm(msg))return;
  const r=await p2Call('student_cancel_lesson',{p_booking_id:id},isTrial?'أُلغي الدرس التجريبي':'سُجّل اعتذارك — لك درس تعويضي ✅');
  if(r){if(typeof loadStudentLessons==='function')loadStudentLessons();if(typeof loadMySubscriptions==='function')loadMySubscriptions();}
}
/* — الطالب: حجز درس تعويضي — */
let MK={credit:null,sub:null,av:null,reserved:new Set()};
function _mkModal(){
  let m=document.getElementById('makeup-modal');if(m)return m;
  m=document.createElement('div');m.id='makeup-modal';
  m.style.cssText='display:none;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9990;align-items:flex-end;justify-content:center';
  m.innerHTML='<div style="background:linear-gradient(160deg,#0f2b21,#071812);border-radius:22px 22px 0 0;border:1px solid var(--bd);width:100%;max-width:560px;padding:1rem;max-height:88vh;overflow-y:auto">'
   +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.7rem"><div style="font-size:.85rem;font-weight:700">📅 حجز درس تعويضي</div><button onclick="document.getElementById(\'makeup-modal\').style.display=\'none\'" style="background:none;border:none;color:var(--tm);font-size:1.1rem;cursor:pointer">✕</button></div>'
   +'<div id="mk-info" style="font-size:.66rem;color:var(--tm);line-height:1.7;margin-bottom:.6rem"></div>'
   +'<label style="display:block;font-size:.64rem;color:var(--tm);margin-bottom:.3rem">اليوم (بتوقيت المعلم)</label>'
   +'<input type="date" id="mk-date" class="ainp" style="width:100%;margin-bottom:.7rem" onchange="mkLoadHours()">'
   +'<div id="mk-hours"></div></div>';
  m.addEventListener('click',e=>{if(e.target===m)m.style.display='none';});
  document.body.appendChild(m);return m;
}
async function openMakeup(creditId,subId,teacherId,teacherName,expires){
  MK={credit:creditId,sub:subId,teacher:teacherId,av:null,reserved:new Set(),expires};
  const m=_mkModal();m.style.display='flex';
  document.getElementById('mk-hours').innerHTML='';
  document.getElementById('mk-info').textContent='مع '+(teacherName||'معلمك')+' — آخر موعد مسموح: '+expires+'. اختر يومًا ثم ساعة متاحة.';
  const d=document.getElementById('mk-date');
  const tomorrow=new Date(Date.now()+864e5).toISOString().slice(0,10);
  d.min=tomorrow;d.max=expires;d.value='';
  try{const [av,res]=await Promise.all([getTeacherAvailability(teacherId),_sb.rpc('get_teacher_reserved_slots',{p_teacher_id:teacherId})]);MK.av=av;(res.data||[]).forEach(x=>MK.reserved.add(x.weekday+'|'+x.time));}catch(e){}
}
async function mkLoadHours(){
  const box=document.getElementById('mk-hours'),date=document.getElementById('mk-date').value,av=MK.av;
  if(!date){box.innerHTML='';return;}
  if(!av||!av.from||!av.to){box.innerHTML='<div style="font-size:.66rem;color:var(--tm)">لم يحدّد المعلم ساعاته. تواصل مع الإدارة.</div>';return;}
  const wd=new Date(date+'T12:00:00').getDay();
  if(av.days&&av.days.length&&!av.days.includes(wd)){box.innerHTML='<div style="font-size:.66rem;color:#e67e73">المعلم لا يدرّس يوم '+P2_DAYS[wd]+'.</div>';return;}
  box.innerHTML='<div style="font-size:.66rem;color:var(--tm)">⏳ جاري التحميل...</div>';
  let booked=[];try{const {data}=await _sb.rpc('get_teacher_booked_slots',{p_teacher_id:MK.teacher,p_date:date});booked=data||[];}catch(e){}
  const bset=new Set(booked.map(String)),tz=av.tz||'Africa/Casablanca';
  const h0=+av.from.slice(0,2),h1=+av.to.slice(0,2)+(+av.to.slice(3,5)>0?1:0);const hours=[];for(let h=h0;h+1<=h1;h++)hours.push(String(h).padStart(2,'0')+':00');
  const now=Date.now();
  const chips=hours.map(t=>{
    const d=zonedToDate(date,t,tz),taken=bset.has(t)||MK.reserved.has(wd+'|'+t)||d.getTime()<now+2*3600e3;
    const lt=fmtLocalTime(d),sub=lt!==t?'<span style="display:block;font-size:.52rem;opacity:.8">'+lt+'</span>':'';
    return '<button type="button" class="slot'+(taken?' bk':'')+'" '+(taken?'disabled':'onclick="mkBook(\''+date+'\',\''+t+'\')"')+' style="min-width:62px">'+t+sub+'</button>';
  }).join('');
  box.innerHTML='<div style="display:flex;flex-wrap:wrap;gap:.35rem">'+(chips||'<div style="font-size:.66rem;color:var(--tm)">لا ساعات متاحة</div>')+'</div>';
}
async function mkBook(date,time){
  if(!confirm('تأكيد الدرس التعويضي يوم '+date+' الساعة '+time+' (بتوقيت المعلم)؟'))return;
  const r=await p2Call('book_makeup_lesson',{p_credit_id:MK.credit,p_date:date,p_time:time},'تم حجز الدرس التعويضي ✅');
  if(r){document.getElementById('makeup-modal').style.display='none';if(typeof loadStudentLessons==='function')loadStudentLessons();if(typeof loadMySubscriptions==='function')loadMySubscriptions();}
}
async function p2LoadCredits(){
  if(!_sb||!CU||!CU.id)return [];
  try{const {data}=await _sb.from('makeup_credits').select('*').eq('student_id',CU.id).eq('status','available').order('created_at');return data||[];}catch(e){return [];}
}
/* — المعلم: تسجيل الغياب — */
async function markAttendance(id,mark){
  const msg=mark==='student_absent'?'تسجيل غياب الطالب عن هذا الدرس؟ يُحتسب الدرس وفق الشروط.':'تسجيل أنه تعذّر عليك تقديم هذا الدرس؟ لا يُحتسب لك، ويحصل الطالب على درس تعويضي، وتُبلَّغ الإدارة.';
  if(!confirm(msg))return;
  const r=await p2Call('mark_lesson_attendance',{p_booking_id:id,p_mark:mark},'تم التسجيل');
  if(r&&typeof loadTeacherSchedule==='function')loadTeacherSchedule();
}
async function p2RenderTeacherPast(bookings){
  const host=document.getElementById('teacher-schedule');if(!host)return;
  let box=document.getElementById('teacher-past');
  if(!box){box=document.createElement('div');box.id='teacher-past';host.parentNode.insertBefore(box,host.nextSibling);}
  const now=Date.now(),week=7*864e5;
  const past=(bookings||[]).filter(b=>{const x=_bkStart(b);return x&&x.getTime()<=now&&x.getTime()>=now-week&&(b.status==='confirmed'||b.status==='completed')&&!b.payout_statement_id;})
    .sort((a,b)=>_bkStart(b)-_bkStart(a));
  if(!past.length){box.innerHTML='';return;}
  box.innerHTML='<div style="font-size:.8rem;font-weight:700;color:var(--gl);margin:1rem 0 .55rem">🕘 دروس الأيام السبعة الماضية</div>'
   +'<div style="font-size:.62rem;color:var(--tm);margin-bottom:.55rem;line-height:1.6">سجّل هنا إن غاب الطالب، أو إن تعذّر عليك تقديم الدرس. وما لم تسجّله يُحتسب درسًا مكتملًا.</div>'
   +past.map(b=>{const x=_bkStart(b);return '<div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.6rem .7rem;margin-bottom:.45rem">'
     +'<div style="display:flex;justify-content:space-between;gap:.4rem;align-items:center"><div style="font-size:.72rem;font-weight:700">👤 '+escapeHtml(b.student_name||'طالب')+'</div>'+_bkPill(b.status)+'</div>'
     +'<div style="font-size:.62rem;color:var(--tm);margin:.2rem 0 .45rem">'+escapeHtml(fmtLocalDay(x)+' • '+fmtLocalTime(x))+'</div>'
     +'<div style="display:flex;gap:.35rem"><button class="btn bgh bsm" style="flex:1;font-size:.6rem" onclick="markAttendance(\''+b.id+'\',\'student_absent\')">🚫 غاب الطالب</button>'
     +'<button class="btn bgh bsm" style="flex:1;font-size:.6rem;color:#e67e73" onclick="markAttendance(\''+b.id+'\',\'teacher_absent\')">⚠️ تعذّر حضوري</button></div></div>';}).join('');
}
/* — المعلم: كشوف المستحقات — */
async function loadTeacherStatements(){
  const tab=document.getElementById('dp-e');if(!tab||!_sb||!CU||!CU.id)return;
  tab.innerHTML='<div style="padding:1rem;color:var(--tm);font-size:.72rem;text-align:center">⏳ جاري التحميل...</div>';
  try{
    const [{data:sts},{data:open}]=await Promise.all([
      _sb.from('payout_statements').select('*').eq('teacher_id',CU.id).order('period_start',{ascending:false}).limit(30),
      _sb.from('bookings').select('teacher_share,package_price,status').eq('teacher_id',CU.id).in('status',['completed','no_show']).is('payout_statement_id',null)
    ]);
    const list=sts||[];
    const cur=(open||[]).filter(b=>(+b.package_price||0)>0);
    const curAmt=cur.reduce((a,b)=>a+(+b.teacher_share||0),0);
    const pend=list.filter(x=>x.status==='pending').reduce((a,x)=>a+(+x.amount||0),0);
    const paid=list.filter(x=>x.status==='paid').reduce((a,x)=>a+(+x.amount||0),0);
    const fd=v=>v?new Date(v+'T12:00:00').toLocaleDateString('ar-u-nu-latn',{day:'numeric',month:'short'}):'';
    const card=(n,l,c)=>'<div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.7rem;text-align:center"><div style="font-size:1.15rem;font-weight:800;color:'+c+'" dir="ltr">$'+n.toFixed(2)+'</div><div style="font-size:.6rem;color:var(--tm);margin-top:.2rem">'+l+'</div></div>';
    tab.innerHTML='<div style="padding:.65rem 1rem 1rem">'
      +'<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.4rem;margin-bottom:.8rem">'+card(curAmt,'الفترة الجارية ('+cur.length+' درسًا)','var(--gl)')+card(pend,'كشوف بانتظار الصرف','#5dade2')+card(paid,'صُرف لك','var(--grl)')+'</div>'
      +'<div style="font-size:.62rem;color:var(--tm);line-height:1.7;margin-bottom:.8rem">تُصدر كشوف المستحقات كل ١٤ يومًا عن الدروس المكتملة (والدروس التي غاب عنها الطالب)، وتُصرف بعد صدورها.</div>'
      +'<div style="font-size:.78rem;font-weight:700;color:var(--gl);margin-bottom:.5rem">🧾 كشوفي</div>'
      +(list.length?list.map(x=>'<div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.6rem .75rem;margin-bottom:.45rem;display:flex;justify-content:space-between;align-items:center;gap:.5rem">'
        +'<div><div style="font-size:.7rem;font-weight:700">'+fd(x.period_start)+' — '+fd(x.period_end)+'</div><div style="font-size:.6rem;color:var(--tm)">'+x.lessons_count+' درسًا'+(x.status==='paid'&&x.reference?' • '+escapeHtml(x.reference):'')+'</div></div>'
        +'<div style="text-align:left"><div style="font-size:.78rem;font-weight:800;color:var(--gl)" dir="ltr">$'+Number(x.amount).toFixed(2)+'</div><div style="font-size:.56rem;color:'+(x.status==='paid'?'var(--grl)':'#5dade2')+'">'+(x.status==='paid'?'صُرف ✓':'بانتظار الصرف')+'</div></div></div>').join('')
       :'<div style="font-size:.66rem;color:var(--tm);text-align:center;padding:1rem">لا كشوف بعد. يصدر أول كشف بعد نهاية أول فترة من ١٤ يومًا.</div>')
      +'</div>';
    if(window.__v14Translate){const l=localStorage.getItem('mm_lang');if(l&&l!=='ar')window.__v14Translate(l);}
  }catch(e){tab.innerHTML='<div style="padding:1rem;color:#e74c3c;font-size:.7rem">تعذّر التحميل: '+escapeHtml(e.message||e)+'</div>';}
}
function openMyEarnings(){const t=document.getElementById('dta-e');if(t&&typeof swD==='function'){t.style.display='';swD(t,'dp-e');}loadTeacherStatements();}
/* — الإدارة: كشوف المستحقات وإلغاء اشتراك نشط — */
async function loadAdminStatements(){
  const b=document.getElementById('af-body');if(!b)return;
  let box=document.getElementById('adm-statements');
  if(!box){box=document.createElement('div');box.id='adm-statements';b.appendChild(box);}
  try{
    const {data}=await _sb.from('payout_statements').select('*').order('created_at',{ascending:false}).limit(40);
    const list=data||[];const fd=v=>v?new Date(v+'T12:00:00').toLocaleDateString('ar-u-nu-latn',{day:'numeric',month:'short'}):'';
    box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;margin:1.1rem 0 .55rem"><div style="font-size:.8rem;font-weight:700;color:var(--gl)">🧾 كشوف مستحقات المعلمين (كل ١٤ يومًا)</div><button class="btn bgh bsm" style="font-size:.6rem" onclick="adminGenStatements()">⟳ توليد الآن</button></div>'
     +(list.length?list.map(x=>'<div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.6rem .75rem;margin-bottom:.45rem">'
       +'<div style="display:flex;justify-content:space-between;gap:.5rem"><div style="font-size:.72rem;font-weight:700">'+escapeHtml(x.teacher_name||'معلم')+'</div><div style="font-size:.78rem;font-weight:800;color:var(--gl)" dir="ltr">$'+Number(x.amount).toFixed(2)+'</div></div>'
       +'<div style="font-size:.6rem;color:var(--tm);margin:.15rem 0 .4rem">'+fd(x.period_start)+' — '+fd(x.period_end)+' • '+x.lessons_count+' درسًا'+(x.status==='paid'?' • صُرف '+(x.method?'('+escapeHtml(x.method)+')':'')+(x.reference?' • '+escapeHtml(x.reference):''):'')+'</div>'
       +(x.status==='pending'?'<button class="ab abg" onclick="adminPayStatement(\''+x.id+'\')">تم الصرف</button>':'<span class="pill pgg">مدفوع</span>')+'</div>').join('')
      :'<div style="font-size:.66rem;color:var(--tm);text-align:center;padding:.8rem">لا كشوف بعد.</div>');
  }catch(e){box.innerHTML='<div style="color:#e74c3c;font-size:.66rem">تعذّر تحميل الكشوف: '+escapeHtml(e.message||e)+'</div>';}
}
async function adminGenStatements(){const r=await p2Call('admin_generate_payout_statements',{},null);if(r){toast('صدر '+(r.statements||0)+' كشفًا','s');loadAdminStatements();}}
async function adminPayStatement(id){
  const method=prompt('طريقة الصرف (مثلًا: CIH أو Payoneer):','CIH');if(method===null)return;
  const ref=prompt('مرجع التحويل (اختياري):','')||'';
  const r=await p2Call('admin_mark_statement_paid',{p_statement_id:id,p_method:method,p_reference:ref},'سُجّل الصرف ✅');
  if(r)loadAdminStatements();
}
async function adminCancelActiveSub(id){
  if(!confirm('إلغاء هذا الاشتراك النشط؟\n\nتُلغى دروسه القادمة، وتُسقط أرصدة التعويض، ويُحسب لك المبلغ المستحق ردّه للطالب.'))return;
  const r=await p2Call('admin_cancel_subscription',{p_subscription_id:id},null);
  if(r){alert('أُلغي الاشتراك.\n\nدروس قادمة أُلغيت: '+(r.lessons_cancelled||0)+'\nأرصدة تعويض أُسقطت: '+(r.credits_refunded||0)+'\n\nالمستحق ردّه للطالب: '+(r.currency||'USD')+' '+Number(r.refund_amount||0).toFixed(2));if(typeof loadAdminBookings==='function')loadAdminBookings();}
}

