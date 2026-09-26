
/* ══════════ المرحلة ٣: الدورات الجماعية ══════════ */
const P3_AUD={men:'رجال',women:'نساء',children:'أطفال',mixed:'مختلط'};
const P3_DAYS=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
function p3fd(v){return v?new Date(v+'T12:00:00').toLocaleDateString('ar-u-nu-latn',{day:'numeric',month:'long',year:'numeric'}):'';}
function p3NextDate(wd,tz){return (typeof _subNextDate==='function')?_subNextDate(wd,tz):new Date().toISOString().slice(0,10);}
function p3SlotsText(slots,tz){
  return (slots||[]).map(x=>{let t=SUB_DAYS[x.weekday]+' '+x.time;try{const d=zonedToDate(p3NextDate(x.weekday,tz||'Africa/Casablanca'),x.time,tz||'Africa/Casablanca');const lt=fmtLocalTime(d);if(lt!==x.time)t+=' ('+d.toLocaleDateString('ar-u-nu-latn',{weekday:'short'})+' '+lt+' بتوقيتك)';}catch(e){}return t;}).join('، ');
}
/* — صفحة الدورات للطالب — */
async function loadGroupCourses(){
  const box=document.getElementById('group-list');if(!box)return;
  const pg=document.getElementById('p-group');
  if(pg&&!pg.dataset.p3){pg.dataset.p3='1';const note=pg.querySelector('div[style*="rgba(39,174,96"]');if(note)note.innerHTML='📚 دورات بمنهج محدد، في مجموعات صغيرة، لها بداية ونهاية، والدفع شهري.';const hd=pg.querySelector('div[style*="font-weight:700"]');if(hd)hd.textContent='👥 الدورات الجماعية';}
  box.innerHTML='<div style="text-align:center;color:var(--tm);font-size:.72rem;padding:1.5rem">⏳ جاري التحميل...</div>';
  try{
    const {data,error}=await _sb.rpc('list_open_cohorts');if(error)throw error;
    const list=data||[];window._p3List=list;
    if(!list.length){box.innerHTML='<div style="text-align:center;color:var(--tm);padding:2rem 1rem"><div style="font-size:2rem;margin-bottom:.5rem">📚</div><div style="font-size:.78rem;font-weight:700;margin-bottom:.3rem">لا دفعات مفتوحة للتسجيل الآن</div><div style="font-size:.68rem">تُعلن الدفعات الجديدة هنا وفي إشعاراتك.</div></div>';return;}
    box.innerHTML=list.map(c=>{
      const left=Math.max(0,c.max_seats-c.paid_seats),months=c.weeks/4;
      const full=left<=0;
      return '<div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:14px;padding:.85rem;margin-bottom:.7rem">'
        +'<div style="display:flex;justify-content:space-between;gap:.5rem;align-items:flex-start"><div style="font-size:.86rem;font-weight:800">'+escapeHtml(c.title||'')+'</div>'
        +'<span style="font-size:.58rem;padding:.2rem .55rem;border-radius:20px;background:'+(c.status==='confirmed'?'rgba(39,174,96,.15);color:var(--grl)':'rgba(52,152,219,.15);color:#5dade2')+'">'+(c.status==='confirmed'?'مؤكَّدة الانطلاق':'التسجيل مفتوح')+'</span></div>'
        +(c.curriculum?'<div style="font-size:.66rem;color:var(--gl);margin-top:.2rem">📖 '+escapeHtml(c.curriculum)+'</div>':'')
        +(c.description?'<div style="font-size:.66rem;color:var(--tm);line-height:1.7;margin-top:.35rem">'+escapeHtml(c.description)+'</div>':'')
        +'<div style="font-size:.65rem;color:var(--tm);line-height:1.95;margin-top:.45rem">'
        +'<div>👨‍🏫 '+escapeHtml(c.teacher_name||'')+' • 🗣 لغة الشرح: '+escapeHtml(c.language||'')+' • 👥 '+(P3_AUD[c.audience]||'')+'</div>'
        +'<div>🗓 '+escapeHtml(p3SlotsText(c.slots,c.tz))+' <span style="font-size:.58rem">(بتوقيت المعلم)</span></div>'
        +'<div>📆 تبدأ '+p3fd(c.starts_on)+' • المدة '+c.weeks+' أسبوعًا ('+months+' '+(months>2?'أشهر':'شهر')+')</div>'
        +(c.level?'<div>🎯 المستوى: '+escapeHtml(c.level)+'</div>':'')
        +(c.outcomes?'<div>🏁 في النهاية: '+escapeHtml(c.outcomes)+'</div>':'')
        +'<div>💺 '+(full?'<b style="color:#e67e73">اكتملت المقاعد</b>'+(c.waitlist?' • في الانتظار '+c.waitlist:''):'المقاعد المتبقية: <b style="color:var(--wh)">'+left+'</b> من '+c.max_seats)+' • آخر موعد للتسجيل '+p3fd(c.enroll_deadline)+'</div>'
        +'<div style="font-size:.8rem;margin-top:.2rem">💰 <b style="color:var(--gl)" dir="ltr">'+escapeHtml(c.currency||'USD')+' '+Number(c.monthly_price).toFixed(2)+'</b> <span style="font-size:.62rem">شهريًا (كل ٤ أسابيع)</span></div></div>'
        +'<button class="btn '+(full?'bgh':'bgo')+' bfw" style="margin-top:.6rem;font-size:.7rem" onclick="p3Enroll(\''+c.id+'\','+(full?'true':'false')+')">'+(full?'⏳ انضم إلى قائمة الانتظار':'✍️ سجّل في الدورة')+'</button>'
        +'<div id="p3-pay-'+c.id+'"></div></div>';
    }).join('');
    if(window.__v14Translate){const l=localStorage.getItem('mm_lang');if(l&&l!=='ar')window.__v14Translate(l);}
  }catch(e){box.innerHTML='<div style="color:#e74c3c;text-align:center;padding:1rem;font-size:.7rem">تعذّر التحميل: '+escapeHtml(e.message||e)+'</div>';}
}
async function p3Enroll(id,full){
  if(!CU||!CU.id){toast('سجّل الدخول أولًا','i');goP('p-acc');return;}
  if(!confirm(full?'الانضمام إلى قائمة الانتظار؟ نبلغك فور شغور مقعد.':'التسجيل في هذه الدورة؟\n\nيُحجز مقعدك بعد تأكيد دفع الشهر الأول، ويُلغى التسجيل إن لم يُدفع خلال ٧٢ ساعة.\nبتأكيدك فإنك توافق على شروط الخدمة.'))return;
  const r=await p2Call('enroll_in_cohort',{p_cohort_id:id,p_method:'bank'},null);if(!r)return;
  if(r.waitlist){toast('أنت في قائمة الانتظار ✅','s');loadGroupCourses();return;}
  toast('سُجّلت — أكمل الدفع ✅','s');
  const cc=(window._p3List||[]).find(x=>x.id===id)||{};
  p3ShowPay({ref:r.ref,amount:r.amount,currency:r.currency,month:1,title:(cc.title||'')+(cc.teacher_name?' — '+cc.teacher_name:'')},'p3-pay-'+id);
}
function p3ShowPay(o,target){
  const el=document.getElementById(target);if(!el)return;
  const bank=(SITE_CONFIG&&SITE_CONFIG.bankRib)?'<div style="background:rgba(0,0,0,.25);border-radius:10px;padding:.6rem;margin:.5rem 0;font-size:.66rem;line-height:1.8"><div>🏦 '+escapeHtml(SITE_CONFIG.bankName||'CIH Bank')+'</div><div dir="ltr" style="font-family:monospace;font-size:.75rem;color:var(--gl)">'+escapeHtml(SITE_CONFIG.bankRib)+'</div>'+(SITE_CONFIG.bankHolder?'<div>باسم: '+escapeHtml(SITE_CONFIG.bankHolder)+'</div>':'')+'</div>':'<div style="font-size:.64rem;color:var(--tm);margin:.4rem 0">تُرسل إليك بيانات الحساب عبر واتساب.</div>';
  const msg='📋 *دورة جماعية — بانتظار الدفع*\n\n👤 *الطالب:* '+(CU?.name||'')+'\n📧 *البريد:* '+(CU?.email||'')+(o.title?'\n📚 *الدورة:* '+o.title:'')+'\n🗓 *الشهر:* '+(o.month||1)+'\n💰 *المبلغ:* '+(o.currency||'USD')+' '+Number(o.amount).toFixed(2)+'\n🔖 *المرجع:* '+o.ref+'\n\nالسلام عليكم، أريد تأكيد الدفع.';
  el.innerHTML='<div style="background:rgba(39,174,96,.07);border:1px solid rgba(39,174,96,.25);border-radius:12px;padding:.8rem;margin-top:.6rem">'
   +'<div style="font-size:.78rem;font-weight:800;margin-bottom:.3rem">⏳ بانتظار دفع الشهر '+(o.month||1)+'</div>'
   +'<div style="font-size:.66rem;color:var(--tm);line-height:1.9"><div>المبلغ: <b dir="ltr" style="color:var(--gl)">'+(o.currency||'USD')+' '+Number(o.amount).toFixed(2)+'</b></div><div>مرجع الدفع: <b dir="ltr" style="font-family:monospace;color:var(--wh)">'+escapeHtml(o.ref||'')+'</b></div></div>'
   +bank+'<a class="btn bgo bfw" style="display:block;text-align:center" target="_blank" rel="noopener" href="https://wa.me/'+(SITE_CONFIG&&SITE_CONFIG.whatsapp||'212681883238')+'?text='+encodeURIComponent(msg)+'">💬 إرسال الطلب والإيصال عبر واتساب</a></div>';
}
/* — «دوراتي» في لوحة الطالب — */
async function loadMyCohorts(){
  if(!_sb||!CU||!CU.id)return;
  let box=document.getElementById('my-cohorts');
  if(!box){const subs=document.getElementById('my-subs');const list=document.getElementById('student-lessons-list');const anchor=subs||(list&&(list.previousElementSibling||list));if(!anchor)return;box=document.createElement('div');box.id='my-cohorts';anchor.parentNode.insertBefore(box,anchor.nextSibling);}
  try{
    const {data:ens}=await _sb.from('cohort_enrollments').select('*').eq('student_id',CU.id).in('status',['pending_payment','active','waitlist','finished']).order('created_at',{ascending:false}).limit(20);
    const head='<div style="display:flex;align-items:center;justify-content:space-between;margin:.4rem 0 .6rem"><div style="font-size:.8rem;font-weight:700;color:var(--gl)">👥 دوراتي الجماعية</div><button class="btn bgh bsm" style="font-size:.62rem" onclick="goP(\'p-group\')">تصفّح الدورات</button></div>';
    if(!ens||!ens.length){box.innerHTML=head+'<div style="font-size:.66rem;color:var(--tm);text-align:center;padding:.3rem 0 1rem">لم تسجّل في دورة جماعية بعد.</div>';return;}
    const ids=ens.map(e=>e.cohort_id),eids=ens.map(e=>e.id);
    const [{data:cs},{data:ss},{data:pays},{data:sl}]=await Promise.all([
      _sb.from('course_cohorts').select('id,course_id,title,teacher_id,teacher_name,substitute_id,starts_on,enroll_deadline,weeks,min_seats,max_seats,language,audience,monthly_price,platform_pct,currency,status,min_alert_sent,created_at,updated_at,hidden').in('id',ids), /* [B.2] بلا meeting_link */
      _sb.from('cohort_sessions').select('*').in('cohort_id',ids).eq('status','scheduled').gte('starts_at',new Date(Date.now()-3600e3).toISOString()).order('starts_at').limit(60),
      _sb.from('payments').select('id,enrollment_id,month_index,gross_amount,currency,provider_ref,payment_status').in('enrollment_id',eids).eq('payment_status','pending'),
      _sb.from('cohort_slots').select('*').in('cohort_id',ids)
    ]);
    const C=new Map((cs||[]).map(c=>[c.id,c]));
    /* [B.2] الرابط يُطلب من الخادم، ويصل فقط لمن أُكّد دفعه */
    await Promise.all(ens.filter(e=>e.status==='active').map(async e=>{const c=C.get(e.cohort_id);if(!c)return;try{const {data:lk,error:le}=await _sb.rpc('get_cohort_meeting_link',{p_cohort:e.cohort_id});if(!le&&lk)c.meeting_link=lk;}catch(_){}}));
    const ST={pending_payment:['بانتظار الدفع','#5dade2'],active:['مسجَّل','var(--grl)'],waitlist:['قائمة الانتظار','var(--gl)'],finished:['أتممتها','var(--gl)']};
    box.innerHTML=head+ens.map(e=>{
      const c=C.get(e.cohort_id)||{};const st=ST[e.status]||['',''];
      const next=(ss||[]).filter(s=>s.cohort_id===e.cohort_id).slice(0,3);
      const pay=(pays||[]).find(p=>p.enrollment_id===e.id);
      const slots=(sl||[]).filter(x=>x.cohort_id===e.cohort_id).map(x=>({weekday:x.weekday,time:String(x.start_time).slice(0,5)}));
      let body='<div>👨‍🏫 '+escapeHtml(c.teacher_name||'')+' • 🗓 '+escapeHtml(slots.map(x=>SUB_DAYS[x.weekday]+' '+x.time).join('، '))+' <span style="font-size:.58rem">(بتوقيت المعلم)</span></div>';
      if(c.status==='open'||c.status==='confirmed')body+='<div>📆 تبدأ '+p3fd(c.starts_on)+(c.status==='confirmed'?' — تأكّد انطلاقها':' — بانتظار اكتمال العدد')+'</div>';
      if(next.length)body+='<div>⏭ القادمة: '+next.map(s=>{const d=new Date(s.starts_at);return fmtLocalDay(d)+' '+fmtLocalTime(d);}).join(' • ')+'</div>';
      if(e.status==='active')body+='<div>✅ أشهر مدفوعة: '+e.paid_months+' من '+((c.weeks||4)/4)+'</div>';
      let acts='';
      if(pay){const o=JSON.stringify({ref:pay.provider_ref,amount:pay.gross_amount,currency:pay.currency,month:pay.month_index||1,title:c.title||''}).replace(/"/g,'&quot;');
        body+='<div style="color:var(--gl)">💳 مطلوب: الشهر '+(pay.month_index||1)+' — <b dir="ltr">'+escapeHtml(pay.currency||'USD')+' '+Number(pay.gross_amount).toFixed(2)+'</b></div>';
        acts+='<button class="btn bgo bsm" style="flex:2;font-size:.62rem" onclick="p3ShowPay('+o+',\'p3-mpay-'+e.id+'\')">💳 تعليمات الدفع</button>';}
      if(e.status==='pending_payment'||e.status==='waitlist')acts+='<button class="btn bgh bsm" style="flex:1;font-size:.62rem;color:#e74c3c" onclick="p3CancelEnroll(\''+e.id+'\')">إلغاء</button>';
      if(c.meeting_link&&e.status==='active'&&next.length&&/^https?:\/\//i.test(c.meeting_link))acts+='<a class="btn bgh bsm" style="flex:1.4;font-size:.62rem;text-align:center" href="'+escapeHtml(c.meeting_link)+'" target="_blank" rel="noopener">🎥 دخول الجلسة</a>';
      return '<div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.7rem .8rem;margin-bottom:.5rem">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.3rem"><div style="font-size:.78rem;font-weight:800">'+escapeHtml(c.title||'دورة')+'</div><span style="font-size:.58rem;font-weight:700;color:'+st[1]+'">'+st[0]+'</span></div>'
        +'<div style="font-size:.65rem;color:var(--tm);line-height:1.9">'+body+'</div>'
        +(acts?'<div style="display:flex;gap:.4rem;margin-top:.5rem">'+acts+'</div>':'')+'<div id="p3-mpay-'+e.id+'"></div></div>';
    }).join('');
  }catch(e){box.innerHTML='';}
}
async function p3CancelEnroll(id){if(!confirm('إلغاء تسجيلك في هذه الدورة؟'))return;const r=await p2Call('cancel_cohort_enrollment',{p_enrollment_id:id},'أُلغي التسجيل');if(r)loadMyCohorts();}
/* — المعلم: جلسات الدفعات والحضور — */
async function p3LoadTeacherCohorts(){
  const host=document.getElementById('teacher-schedule');if(!host||!_sb||!CU||!CU.id)return;
  let box=document.getElementById('teacher-cohorts');
  if(!box){box=document.createElement('div');box.id='teacher-cohorts';const past=document.getElementById('teacher-past');(past||host).parentNode.insertBefore(box,(past||host).nextSibling);}
  try{
    const since=new Date(Date.now()-7*864e5).toISOString(),until=new Date(Date.now()+7*864e5).toISOString();
    const {data:ss}=await _sb.from('cohort_sessions').select('*').eq('teacher_id',CU.id).gte('starts_at',since).lte('starts_at',until).neq('status','cancelled').order('starts_at');
    if(!ss||!ss.length){box.innerHTML='';return;}
    const ids=[...new Set(ss.map(s=>s.cohort_id))];
    const [{data:cs},{data:ens},{data:att}]=await Promise.all([
      _sb.from('course_cohorts').select('id,title').in('id',ids),
      _sb.from('cohort_enrollments').select('cohort_id,student_id,student_name,status').in('cohort_id',ids).in('status',['active','finished']),
      _sb.from('cohort_attendance').select('session_id,student_id,present').in('session_id',ss.map(s=>s.id))
    ]);
    window._p3Ens=ens||[];window._p3Att=att||[];
    const T=new Map((cs||[]).map(c=>[c.id,c.title]));const now=Date.now();
    box.innerHTML='<div style="font-size:.8rem;font-weight:700;color:var(--gl);margin:1rem 0 .55rem">👥 جلسات دفعاتي (أسبوع مضى وأسبوع قادم)</div>'
     +ss.map(s=>{const d=new Date(s.starts_at),past=d.getTime()<=now,n=(ens||[]).filter(e=>e.cohort_id===s.cohort_id).length,marked=(att||[]).filter(a=>a.session_id===s.id);
       return '<div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.6rem .7rem;margin-bottom:.45rem">'
        +'<div style="display:flex;justify-content:space-between;gap:.4rem"><div style="font-size:.72rem;font-weight:700">'+escapeHtml(T.get(s.cohort_id)||'دورة')+' • الجلسة '+s.session_no+'</div><div style="font-size:.6rem;color:var(--tm)">'+n+' طلاب</div></div>'
        +'<div style="font-size:.62rem;color:var(--tm);margin:.2rem 0 .45rem">'+escapeHtml(fmtLocalDay(d)+' • '+fmtLocalTime(d))+(s.status==='completed'?' • مكتملة':'')+(marked.length?' • سُجّل الحضور ('+marked.filter(a=>a.present).length+'/'+marked.length+')':'')+'</div>'
        +'<div style="display:flex;gap:.35rem">'+(past?'<button class="btn bgh bsm" style="flex:1;font-size:.6rem" onclick="p3Attendance(\''+s.id+'\',\''+s.cohort_id+'\')">✔️ الحضور</button>':'')
        +(!s.payout_statement_id?'<button class="btn bgh bsm" style="flex:1;font-size:.6rem;color:#e67e73" onclick="p3TeacherAbsent(\''+s.id+'\')">⚠️ تعذّرت الجلسة</button>':'')+'</div></div>';}).join('');
  }catch(e){box.innerHTML='';}
}
function p3Attendance(sid,cid){
  const ens=(window._p3Ens||[]).filter(e=>e.cohort_id===cid);
  if(!ens.length){toast('لا طلاب مسجَّلون','i');return;}
  const prev=new Map((window._p3Att||[]).filter(a=>a.session_id===sid).map(a=>[a.student_id,a.present]));
  p3Form('✔️ تسجيل الحضور',ens.map(e=>({id:'att_'+e.student_id,label:e.student_name||'طالب',type:'check',value:prev.has(e.student_id)?prev.get(e.student_id):true})),async v=>{
    const present=ens.filter(e=>v['att_'+e.student_id]).map(e=>e.student_id);
    const r=await p2Call('mark_cohort_attendance',{p_session_id:sid,p_present:present},'سُجّل الحضور ✅');if(r)p3LoadTeacherCohorts();return !!r;
  });
}
async function p3TeacherAbsent(sid){if(!confirm('إعلان تعذّر هذه الجلسة؟ تُلغى، وتُضاف جلسة بديلة في آخر الدورة، ويُبلَّغ الطلاب والإدارة.'))return;const r=await p2Call('cohort_teacher_absent',{p_session_id:sid},'أُلغيت الجلسة وعُوِّضت');if(r)p3LoadTeacherCohorts();}
/* — نموذج عام بسيط — */
function p3Form(title,fields,onSubmit){
  let m=document.getElementById('p3-form');if(m)m.remove();
  m=document.createElement('div');m.id='p3-form';m.style.cssText='display:flex;position:fixed;inset:0;background:rgba(0,0,0,.85);z-index:9990;align-items:flex-end;justify-content:center';
  const inp=f=>{const v=f.value==null?'':f.value;
    if(f.type==='check')return '<label style="display:flex;align-items:center;gap:.5rem;font-size:.72rem;padding:.4rem 0;cursor:pointer"><input type="checkbox" id="p3f-'+f.id+'" '+(v?'checked':'')+'>'+escapeHtml(f.label)+'</label>';
    const lab='<label style="display:block;font-size:.62rem;color:var(--tm);margin:.55rem 0 .25rem">'+escapeHtml(f.label)+'</label>';
    if(f.type==='select')return lab+'<select id="p3f-'+f.id+'" class="ainp" style="width:100%">'+(f.options||[]).map(o=>'<option value="'+escapeHtml(o[0])+'" '+(String(o[0])===String(v)?'selected':'')+'>'+escapeHtml(o[1])+'</option>').join('')+'</select>';
    if(f.type==='textarea')return lab+'<textarea id="p3f-'+f.id+'" class="ainp" style="width:100%;min-height:70px">'+escapeHtml(v)+'</textarea>';
    if(f.type==='days')return lab+'<div style="display:flex;flex-wrap:wrap;gap:.3rem">'+P3_DAYS.map((n,i)=>'<label style="display:flex;align-items:center;gap:.2rem;font-size:.64rem;background:rgba(255,255,255,.05);padding:.25rem .5rem;border-radius:8px"><input type="checkbox" class="p3f-day" value="'+i+'">'+n+'</label>').join('')+'</div>';
    return lab+'<input id="p3f-'+f.id+'" class="ainp" style="width:100%" type="'+(f.type||'text')+'" value="'+escapeHtml(v)+'" '+(f.attrs||'')+'>';};
  m.innerHTML='<div style="background:linear-gradient(160deg,#0f2b21,#071812);border-radius:22px 22px 0 0;border:1px solid var(--bd);width:100%;max-width:560px;padding:1rem;max-height:90vh;overflow-y:auto">'
   +'<div style="display:flex;justify-content:space-between;align-items:center"><div style="font-size:.85rem;font-weight:700">'+escapeHtml(title)+'</div><button onclick="document.getElementById(\'p3-form\').remove()" style="background:none;border:none;color:var(--tm);font-size:1.1rem">✕</button></div>'
   +fields.map(inp).join('')+'<button class="btn bgo bfw" id="p3f-go" style="margin-top:.9rem">حفظ</button></div>';
  document.body.appendChild(m);
  document.getElementById('p3f-go').onclick=async()=>{
    const v={};fields.forEach(f=>{if(f.type==='days'){v[f.id]=[...document.querySelectorAll('.p3f-day:checked')].map(x=>+x.value);return;}const e=document.getElementById('p3f-'+f.id);v[f.id]=f.type==='check'?e.checked:e.value.trim();});
    const b=document.getElementById('p3f-go');b.disabled=true;b.textContent='⏳';
    const ok=await onSubmit(v);if(ok!==false)m.remove();else{b.disabled=false;b.textContent='حفظ';}
  };
}
/* — الإدارة: الدورات والدفعات — */
async function loadAdminCohorts(b,seg){
  b.innerHTML=seg+'<div style="color:var(--tm);text-align:center;padding:1rem;font-size:.7rem">⏳</div>';
  try{
    const [{data:courses},{data:cohorts},{data:ens},{data:tchs}]=await Promise.all([
      _sb.from('courses').select('*').order('created_at',{ascending:false}),
      _sb.from('course_cohorts').select('id,course_id,title,teacher_id,teacher_name,substitute_id,starts_on,enroll_deadline,weeks,min_seats,max_seats,language,audience,monthly_price,platform_pct,currency,status,min_alert_sent,created_at,updated_at,hidden').order('starts_on',{ascending:false}).limit(40) /* [B.2] */.then(r=>{window._p3Cohorts=r.data||[];return r;}),
      _sb.from('cohort_enrollments').select('cohort_id,status,student_name,refund_amount'),
      _sb.from('teacher_profiles').select('user_id,name').eq('status','active')
    ]);
    window._p3Courses=courses||[];window._p3Teachers=tchs||[];
    const ST={open:['التسجيل مفتوح','pgb'],confirmed:['مؤكَّدة','pgg'],running:['جارية','pgg'],finished:['منتهية','pgb'],cancelled:['ملغاة','pgr']};
    const cnt=(id,st)=>(ens||[]).filter(e=>e.cohort_id===id&&st.includes(e.status)).length;
    b.innerHTML=seg
     +'<div style="display:flex;gap:.4rem;margin-bottom:.7rem"><button class="btn bgo bsm" style="flex:1;font-size:.64rem" onclick="p3NewCourse()">➕ دورة (منهج)</button><button class="btn bgo bsm" style="flex:1;font-size:.64rem" onclick="p3NewCohort()">➕ دفعة</button></div>'
     +'<div style="font-size:.74rem;font-weight:700;color:var(--gl);margin-bottom:.4rem">📚 الدورات ('+(courses||[]).length+')</div>'
     +((courses||[]).map(c=>'<div style="font-size:.66rem;background:rgba(255,255,255,.03);border:1px solid var(--bdl);border-radius:10px;padding:.5rem .6rem;margin-bottom:.35rem"><div><b>'+escapeHtml(c.title)+'</b> • '+c.weeks+' أسبوعًا • '+c.sessions_per_week+' جلسة/أسبوع'+(c.active?'':' • <span style="color:#e67e73">مخفية</span>')+'</div>'
        +'<div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.35rem"><button class="ab abg" onclick="p3NewCourse(\''+c.id+'\')">تعديل</button><button class="ab abg" onclick="p3Simple(\'admin_toggle_course\',{p_course_id:\''+c.id+'\'},null)">'+(c.active?'إخفاء':'إظهار')+'</button><button class="ab abr" onclick="p3Simple(\'admin_delete_course\',{p_course_id:\''+c.id+'\'},\'حذف هذه الدورة نهائيًا؟\')">حذف</button></div></div>').join('')||'<div style="font-size:.64rem;color:var(--tm)">أنشئ دورة أولًا.</div>')
     +'<div style="font-size:.74rem;font-weight:700;color:var(--gl);margin:.9rem 0 .4rem">👥 الدفعات</div>'
     +((cohorts||[]).map(c=>{const s=ST[c.status]||['',''];const paid=cnt(c.id,['active','finished']);const pend=cnt(c.id,['pending_payment']);const wait=cnt(c.id,['waitlist']);
        let acts='';
        if(c.status==='open'||c.status==='confirmed')acts+=(paid?`<button class="ab abg" onclick="p3Admin('admin_start_cohort','${c.id}','بدء الدفعة الآن وتوليد جلساتها؟')">بدء الآن</button>`:'')+`<button class="ab abg" onclick="p3Postpone('${c.id}')">تأجيل</button>`;
        if(c.status==='running')acts+=`<button class="ab abg" onclick="p3Postpone('${c.id}')">تعليق/ترحيل</button><button class="ab abg" onclick="p3Switch('${c.id}')">معلم بديل</button>`;
        if(['open','confirmed','running'].includes(c.status))acts+=`<button class="ab abg" onclick="p3EditCohort('${c.id}')">تعديل</button><button class="ab abg" onclick="p3Simple('admin_update_cohort',{p_cohort_id:'${c.id}',p:{hidden:${!c.hidden}}},null)">${c.hidden?'إظهار':'إخفاء'}</button><button class="ab abr" onclick="p3CancelCohort('${c.id}')">إلغاء</button>`;
        if(c.status==='open'&&!paid&&!pend)acts+=`<button class="ab abr" onclick="p3Simple('admin_delete_cohort',{p_cohort_id:'${c.id}'},'حذف هذه الدفعة نهائيًا؟')">حذف</button>`;
        return `<div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.65rem .75rem;margin-bottom:.45rem">
          <div style="display:flex;justify-content:space-between;gap:.4rem;align-items:center"><div style="font-size:.74rem;font-weight:800">${escapeHtml(c.title||'')}${c.hidden?' <span style="font-size:.58rem;color:#e67e73">• مخفية</span>':''}</div><span class="pill ${s[1]}">${s[0]}</span></div>
          <div style="font-size:.62rem;color:var(--tm);line-height:1.9;margin-top:.2rem">👨‍🏫 ${escapeHtml(c.teacher_name||'')} • 📆 ${escapeHtml(c.starts_on)} • ${c.weeks} أسبوعًا • 🗣 ${escapeHtml(c.language||'')} • 👥 ${P3_AUD[c.audience]||''}<br>💺 مدفوع ${paid} (الحد ${c.min_seats}–${c.max_seats})${pend?' • بانتظار الدفع '+pend:''}${wait?' • انتظار '+wait:''} • 💰 $${Number(c.monthly_price).toFixed(2)}/شهر</div>
          ${acts?`<div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-top:.4rem">${acts}</div>`:''}</div>`;}).join('')||'<div style="font-size:.64rem;color:var(--tm)">لا دفعات بعد.</div>')
     +'<div style="font-size:.6rem;color:var(--tm);margin-top:.6rem;line-height:1.7">تأكيد دفعات الطلاب يتم من تبويب «المالية» (المراجع تبدأ بـ MG-). تبدأ الدفعة المؤكَّدة تلقائيًا قبل موعدها بيوم.</div>';
  }catch(e){b.innerHTML=seg+'<div style="color:#e74c3c;font-size:.7rem;padding:1rem">تعذّر التحميل: '+escapeHtml(e.message||e)+'</div>';}
}
function p3Reload(){if(typeof loadAdminBookings==='function')loadAdminBookings();}
function p3NewCourse(id){
  const c=id?(window._p3Courses||[]).find(x=>x.id===id)||{}:{weeks:8,sessions_per_week:2,active:true};
  p3Form(id?'تعديل الدورة':'دورة جديدة (منهج)',[
    {id:'title',label:'العنوان',value:c.title},{id:'curriculum',label:'المتن أو السلسلة أو المنهج',value:c.curriculum},
    {id:'description',label:'الوصف',type:'textarea',value:c.description},{id:'level',label:'المستوى المطلوب',value:c.level},
    {id:'outcomes',label:'مخرجات التعلم',type:'textarea',value:c.outcomes},{id:'weekly_plan',label:'الخطة الأسبوعية (يكتبها المعلم)',type:'textarea',value:c.weekly_plan},
    {id:'weeks',label:'المدة بالأسابيع (٤ أو مضاعفاتها)',type:'number',value:c.weeks,attrs:'min="4" step="4"'},
    {id:'sessions_per_week',label:'الجلسات في الأسبوع',type:'number',value:c.sessions_per_week,attrs:'min="1" max="7"'},
    {id:'active',label:'ظاهرة',type:'check',value:c.active!==false}],async v=>{v.id=id||'';const r=await p2Call('admin_save_course',{p:v},'حُفظت الدورة ✅');if(r)p3Reload();return !!r;});
}
function p3NewCohort(){
  const cs=(window._p3Courses||[]).filter(c=>c.active);const ts=window._p3Teachers||[];
  if(!cs.length){toast('أنشئ دورة أولًا','e');return;}
  p3Form('دفعة جديدة',[
    {id:'course_id',label:'الدورة',type:'select',options:cs.map(c=>[c.id,c.title])},
    {id:'teacher_id',label:'المعلم',type:'select',options:ts.map(t=>[t.user_id,t.name])},
    {id:'substitute_id',label:'المعلم البديل (اختياري)',type:'select',options:[['','—']].concat(ts.map(t=>[t.user_id,t.name]))},
    {id:'starts_on',label:'تاريخ البداية (بعد ٣ أيام على الأقل)',type:'date'},
    {id:'weeks',label:'المدة بالأسابيع (فارغ = مدة الدورة)',type:'number',attrs:'min="4" step="4"'},
    {id:'days',label:'أيام الجلسات',type:'days'},{id:'time',label:'ساعة الجلسة (بتوقيت المعلم)',type:'time',value:'20:00'},
    {id:'min_seats',label:'الحد الأدنى للانطلاق',type:'number',value:3},{id:'max_seats',label:'الحد الأعلى',type:'number',value:8},
    {id:'language',label:'لغة الشرح',value:'English'},
    {id:'audience',label:'الفئة',type:'select',options:[['mixed','مختلط'],['men','رجال'],['women','نساء'],['children','أطفال']]},
    {id:'monthly_price',label:'السعر الشهري للمقعد (USD)',type:'number',attrs:'min="0" step="0.01"'}],async v=>{
      if(!v.days.length){toast('اختر يومًا واحدًا على الأقل','e');return false;}
      const p={...v,slots:v.days.map(d=>({weekday:d,time:v.time}))};delete p.days;delete p.time;
      const r=await p2Call('admin_create_cohort',{p},'أُنشئت الدفعة ✅');if(r)p3Reload();return !!r;});
}
async function p3Simple(fn,args,q){if(q&&!confirm(q))return;const r=await p2Call(fn,args,'تم ✅');if(r)p3Reload();}
async function p3EditCohort(id){
  const c=(window._p3Cohorts||[]).find(x=>x.id===id);if(!c)return;
  /* [B.2] نجلب الرابط قبل فتح النموذج؛ إن تعذّر لا نفتحه حتى لا يُحفظ الرابط فارغاً */
  try{const {data:lk,error:le}=await _sb.rpc('get_cohort_meeting_link',{p_cohort:id});if(le)throw le;c.meeting_link=lk||'';}catch(e){toast('تعذّر تحميل رابط الجلسات؛ لم يُفتح النموذج حتى لا يُمسح الرابط','e');return;}const ts=window._p3Teachers||[];
  p3Form('تعديل الدفعة',[
    {id:'title',label:'العنوان',value:c.title},
    {id:'monthly_price',label:'السعر الشهري للمقعد (USD) — يسري على الدفعات القادمة',type:'number',value:c.monthly_price,attrs:'min="0" step="0.01"'},
    {id:'min_seats',label:'الحد الأدنى',type:'number',value:c.min_seats},{id:'max_seats',label:'الحد الأعلى',type:'number',value:c.max_seats},
    {id:'language',label:'لغة الشرح',value:c.language},
    {id:'audience',label:'الفئة',type:'select',value:c.audience,options:[['mixed','مختلط'],['men','رجال'],['women','نساء'],['children','أطفال']]},
    {id:'teacher_id',label:'المعلم الأساسي'+(c.status==='running'?' (الدفعة جارية: استعمل زر «معلم بديل»)':''),type:'select',value:c.teacher_id,options:ts.map(t=>[t.user_id,t.name])},
    {id:'substitute_id',label:'المعلم البديل (احتياطي، يتسلّم عند غياب الأساسي)',type:'select',value:c.substitute_id||'',options:[['','—']].concat(ts.map(t=>[t.user_id,t.name]))},
    {id:'meeting_link',label:'رابط الجلسات (Meet/Zoom)',value:c.meeting_link,attrs:'dir="ltr"'},
    {id:'hidden',label:'مخفية عن الطلاب',type:'check',value:!!c.hidden}],async v=>{const r=await p2Call('admin_update_cohort',{p_cohort_id:id,p:v},'حُفظت الدفعة ✅');if(r)p3Reload();return !!r;});
}
async function p3Admin(fn,id,q){if(q&&!confirm(q))return;const r=await p2Call(fn,{p_cohort_id:id},'تم ✅');if(r)p3Reload();}
async function p3Postpone(id){const d=prompt('عدد أيام التأجيل (١–٩٠):','7');if(!d)return;const r=await p2Call('admin_postpone_cohort',{p_cohort_id:id,p_days:+d},'تم التأجيل ✅');if(r)p3Reload();}
async function p3Switch(id){
  const ts=window._p3Teachers||[];
  p3Form('تسليم الدفعة لمعلم آخر',[{id:'t',label:'المعلم الذي يكمل الجلسات القادمة',type:'select',options:ts.map(t=>[t.user_id,t.name])}],async v=>{const r=await p2Call('admin_switch_cohort_teacher',{p_cohort_id:id,p_teacher_id:v.t},'تم التسليم ✅');if(r)p3Reload();return !!r;});
}
async function p3CancelCohort(id){
  if(!confirm('إلغاء الدفعة كلها؟ تُلغى جلساتها القادمة، ويُحسب ردّ كل طالب عمّا لم يُقدَّم من أشهره المدفوعة.'))return;
  const r=await p2Call('admin_cancel_cohort',{p_cohort_id:id},null);
  if(r){alert('أُلغيت الدفعة.\n\nالمستحق ردّه إجمالًا: '+(r.currency||'USD')+' '+Number(r.refund_total||0).toFixed(2)+'\n\n'+(r.refunds||[]).map(x=>'• '+(x.student||'طالب')+': '+Number(x.refund||0).toFixed(2)).join('\n'));p3Reload();}
}
/* النظام القديم للحصص الجماعية (group_classes) يُستبدل بالدورات */
window.renderGroupClasses=function(){const pg=document.getElementById('p-group');if(pg&&pg.classList.contains('on'))loadGroupCourses();};
/* — ربط الصفحات — */
(function(){
  const prev=window.goP;
  if(typeof prev==='function')window.goP=function(id){const r=prev.apply(this,arguments);if(id==='p-group')setTimeout(loadGroupCourses,60);if(id==='p-dash')setTimeout(()=>{if(CU&&CU.role==='teacher')p3LoadTeacherCohorts();else loadMyCohorts();},150);return r;};
  const pc=window.adminConfirmPayment;
  window.adminConfirmPayment=async function(id){
    try{const {data:p}=await _sb.from('payments').select('id,enrollment_id').eq('id',Number(id)).maybeSingle();
      if(p&&p.enrollment_id){if(!confirm('تأكيد استلام دفعة هذه الدورة؟'))return;const r=await p2Call('confirm_cohort_payment',{p_payment_id:Number(id)},'تم التأكيد ✅');if(r){if(typeof loadAdminFinance==='function')loadAdminFinance();p3Reload();}return;}
    }catch(e){}
    if(typeof pc==='function')return pc(id);
  };
})();

