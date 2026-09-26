
/* ══════════ الاشتراك الفردي — واجهة الطالب ══════════ */
const SUB_DAYS=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
let SUB={teacher:null,av:null,reserved:new Set(),picked:new Set(),method:'bank',busy:false};

function _subEnsurePage(){
  if(document.getElementById('p-subscribe'))return;
  const ref=document.getElementById('p-book');if(!ref)return;
  const pg=document.createElement('div');pg.className='pg';pg.id='p-subscribe';
  pg.innerHTML='<div style="padding:1rem 1rem 6rem">'
   +'<div style="display:flex;align-items:center;gap:.6rem;margin-bottom:.9rem"><button class="btn bgh bsm" onclick="history.back()||goP(\'p-dash\')">‹</button>'
   +'<div style="font-family:\'Amiri\',serif;font-size:1.15rem;font-weight:700">📅 اشترك مع معلم</div></div>'
   +'<div style="font-size:.7rem;color:var(--tm);line-height:1.7;margin-bottom:.9rem">اختر مواعيدك الأسبوعية الثابتة. يتكرر كل موعد ٤ أسابيع، وتُحجز لك طوال اشتراكك، ويجدَّد الاشتراك كل ٤ أسابيع.</div>'
   +'<label style="display:block;font-size:.66rem;color:var(--tm);margin-bottom:.3rem">المعلم</label>'
   +'<select id="sub-tch" class="ainp" style="width:100%;margin-bottom:.9rem" onchange="subPickTeacher(this.value)"><option value="">— اختر المعلم —</option></select>'
   +'<div id="sub-grid"></div>'
   +'<div id="sub-sum" style="display:none;background:rgba(212,175,106,.06);border:1px solid rgba(212,175,106,.22);border-radius:14px;padding:.85rem;margin-top:.9rem"></div>'
   +'<div id="sub-result"></div>'
   +'</div>';
  ref.parentNode.insertBefore(pg,ref);
}
function _subNextDate(weekday,tz){
  const today=(()=>{const p={};new Intl.DateTimeFormat('en-CA',{timeZone:tz,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()).forEach(x=>p[x.type]=x.value);return new Date(Date.UTC(+p.year,+p.month-1,+p.day));})();
  const add=((weekday-today.getUTCDay())+7)%7||7;today.setUTCDate(today.getUTCDate()+add);
  return today.toISOString().slice(0,10);
}
async function initSubscribePage(teacherId){
  _subEnsurePage();
  if(!CU||!CU.id){toast('سجّل الدخول أولًا','i');goP('p-acc');return;}
  const sel=document.getElementById('sub-tch');
  try{
    const {data}=await _sb.from('public_teacher_directory').select('teacher_id,name,price,bookable').eq('bookable',true).order('name');
    sel.innerHTML='<option value="">— اختر المعلم —</option>'+(data||[]).map(t=>'<option value="'+escapeHtml(t.teacher_id)+'" data-price="'+(Number(t.price)||0)+'" data-name="'+escapeHtml(t.name||'')+'">'+escapeHtml(t.name||'')+'</option>').join('');
  }catch(e){}
  const tid=teacherId||(SUB.teacher&&SUB.teacher.id)||'';
  if(tid){sel.value=tid;subPickTeacher(tid);}else{document.getElementById('sub-grid').innerHTML='';document.getElementById('sub-sum').style.display='none';}
  document.getElementById('sub-result').innerHTML='';
}
async function subPickTeacher(tid){
  SUB.picked=new Set();SUB.reserved=new Set();SUB.teacher=null;SUB.av=null;
  const g=document.getElementById('sub-grid'),sum=document.getElementById('sub-sum');
  sum.style.display='none';document.getElementById('sub-result').innerHTML='';
  if(!tid){g.innerHTML='';return;}
  const opt=document.querySelector('#sub-tch option[value="'+CSS.escape(tid)+'"]');
  SUB.teacher={id:tid,name:opt?.dataset.name||'',price:Number(opt?.dataset.price)||0};
  SUB.blocked=false;SUB.note='';
  try{const {data:mine}=await _sb.from('subscriptions').select('status,payment_expires_at').eq('student_id',CU.id).eq('teacher_id',tid).in('status',['active','pending_payment']);
    const pend=(mine||[]).some(x=>x.status==='pending_payment'&&(!x.payment_expires_at||new Date(x.payment_expires_at)>new Date()));
    const act=(mine||[]).some(x=>x.status==='active');
    if(pend){SUB.blocked=true;SUB.note='⏳ لديك طلب اشتراك مع هذا المعلم بانتظار الدفع. أكمل دفعه أو ألغِه من «اشتراكاتي» قبل طلب آخر.';}
    else if(act)SUB.note='ℹ️ لديك اشتراك نشط مع هذا المعلم. ما تختاره هنا اشتراك إضافي بمواعيد أخرى، له دورته ودفعه المستقلان.';
  }catch(e){}
  g.innerHTML='<div style="text-align:center;color:var(--tm);font-size:.72rem;padding:1rem">⏳ جاري تحميل أوقات المعلم...</div>';
  try{
    const [av,res]=await Promise.all([getTeacherAvailability(tid),_sb.rpc('get_teacher_reserved_slots',{p_teacher_id:tid})]);
    SUB.av=av;(res.data||[]).forEach(x=>SUB.reserved.add(x.weekday+'|'+x.time));
  }catch(e){}
  subRenderGrid();
}
function subRenderGrid(){
  const g=document.getElementById('sub-grid');const av=SUB.av;
  if(!av||!av.days||!av.days.length||!av.from||!av.to){g.innerHTML='<div style="text-align:center;color:var(--tm);font-size:.72rem;padding:1rem">لم يحدّد هذا المعلم أوقات تدريسه بعد. تواصل مع الإدارة عبر واتساب.</div>';return;}
  const tz=av.tz||'Africa/Casablanca',h0=+av.from.slice(0,2),h1=+av.to.slice(0,2)+(+av.to.slice(3,5)>0?1:0);
  const hours=[];for(let h=h0;h+1<=h1;h++)hours.push(String(h).padStart(2,'0')+':00');
  let diff=false;
  const html=av.days.slice().sort((a,b)=>a-b).map(wd=>{
    const ref=_subNextDate(wd,tz);
    const chips=hours.map(t=>{
      const key=wd+'|'+t,taken=SUB.reserved.has(key),on=SUB.picked.has(key);
      const d=zonedToDate(ref,t,tz),lt=fmtLocalTime(d);let sub='';
      if(lt!==t){diff=true;const dayShift=d.toLocaleDateString('en-CA')!==ref;sub='<span style="display:block;font-size:.52rem;opacity:.8">'+lt+(dayShift?' '+d.toLocaleDateString('ar-u-nu-latn',{weekday:'short'}):'')+'</span>';}
      return '<button type="button" class="slot'+(taken?' bk':'')+(on?' on':'')+'" '+(taken?'disabled':'onclick="subToggle(\''+key+'\')"')+' style="min-width:62px">'+t+(taken?' · محجوز':'')+sub+'</button>';
    }).join('');
    return '<div style="margin-bottom:.75rem"><div style="font-size:.72rem;font-weight:700;margin-bottom:.35rem;color:var(--gl)">'+SUB_DAYS[wd]+'</div><div style="display:flex;flex-wrap:wrap;gap:.35rem">'+chips+'</div></div>';
  }).join('');
  const note=SUB.note?'<div style="font-size:.66rem;line-height:1.7;background:rgba(212,175,106,.07);border:1px solid rgba(212,175,106,.2);border-radius:10px;padding:.55rem .7rem;margin-bottom:.7rem">'+escapeHtml(SUB.note)+'</div>':'';
  if(SUB.blocked){g.innerHTML=note+'<button class="btn bgh bfw" onclick="goP(\'p-dash\')">📅 اشتراكاتي</button>';document.getElementById('sub-sum').style.display='none';return;}
  g.innerHTML=note+(diff?'<div style="font-size:.62rem;color:var(--tm);margin-bottom:.6rem;line-height:1.6">الساعة الكبيرة بتوقيت المعلم، والصغيرة بتوقيتك أنت.</div>':'')+html;
  subRenderSummary();
}
function subToggle(key){if(SUB.picked.has(key))SUB.picked.delete(key);else SUB.picked.add(key);subRenderGrid();}
function subSetMethod(m){SUB.method=m;subRenderSummary();}
function subRenderSummary(){
  const sum=document.getElementById('sub-sum');const n=SUB.picked.size;
  if(!n){sum.style.display='none';return;}
  const lessons=n*4,amount=lessons*(SUB.teacher.price||0);
  const list=[...SUB.picked].map(k=>{const [wd,t]=k.split('|');return SUB_DAYS[+wd]+' '+t;}).join('، ');
  const mb=(m,l)=>'<button type="button" class="btn bsm '+(SUB.method===m?'bgo':'bgh')+'" style="flex:1;font-size:.66rem" onclick="subSetMethod(\''+m+'\')">'+l+'</button>';
  sum.style.display='block';
  sum.innerHTML='<div style="font-size:.78rem;font-weight:800;margin-bottom:.45rem">ملخص الاشتراك</div>'
   +'<div style="font-size:.68rem;line-height:1.9;color:var(--tm)">'
   +'<div>المعلم: <b style="color:var(--wh)">'+escapeHtml(SUB.teacher.name)+'</b></div>'
   +'<div>المواعيد الأسبوعية: <b style="color:var(--wh)">'+escapeHtml(list)+'</b> <span style="font-size:.6rem">(بتوقيت المعلم)</span></div>'
   +'<div>المدة: <b style="color:var(--wh)">٤ أسابيع</b> — '+n+' × ٤ = <b style="color:var(--wh)">'+lessons+' درسًا</b> (٦٠ دقيقة)</div>'
   +'<div style="font-size:.9rem;margin-top:.3rem">المبلغ: <b style="color:var(--gl)" dir="ltr">USD '+amount.toFixed(2)+'</b></div></div>'
   +'<div style="font-size:.64rem;color:var(--tm);margin:.6rem 0 .35rem">طريقة الدفع</div>'
   +'<div style="display:flex;gap:.4rem;margin-bottom:.7rem">'+mb('bank','🏦 تحويل بنكي')+mb('whatsapp','💬 واتساب')+'</div>'
   +'<button class="btn bgo bfw" id="sub-go" onclick="subSubmit()">🔒 تأكيد الاشتراك</button>'
   +'<div style="font-size:.6rem;color:var(--tm);text-align:center;margin-top:.5rem;line-height:1.6">بتأكيدك فإنك توافق على <a href="#" onclick="goP(\'p-terms\');return false" style="color:var(--go)">شروط الخدمة</a>. تُفعَّل دروسك بعد التحقق من وصول الدفع، وتُلغى المواعيد إن لم يُدفع خلال ٧٢ ساعة.</div>';
}
async function subSubmit(){
  if(SUB.busy||!SUB.teacher||!SUB.picked.size)return;
  SUB.busy=true;const btn=document.getElementById('sub-go');if(btn){btn.disabled=true;btn.textContent='⏳ جاري إنشاء الاشتراك...';}
  const slots=[...SUB.picked].map(k=>{const [wd,t]=k.split('|');return {weekday:+wd,time:t};});
  try{
    const {data,error}=await _sb.rpc('create_subscription',{p_teacher_id:SUB.teacher.id,p_slots:slots,p_method:SUB.method,p_hall:null,p_hall_name:null,p_section:null});
    if(error)throw error;
    if(!data||!data.ok)throw new Error(data&&data.error||'تعذّر إنشاء الاشتراك');
    document.getElementById('sub-sum').style.display='none';
    document.getElementById('sub-grid').innerHTML='';
    subShowPayment({teacher:SUB.teacher.name,slots,lessons:data.lessons_total,amount:data.amount,ref:data.ref,method:SUB.method},'sub-result');
    SUB.picked=new Set();
  }catch(e){
    toast(e.message||String(e),'e');
    if(/محجوز/.test(e.message||''))subPickTeacher(SUB.teacher.id);
  }finally{SUB.busy=false;const b=document.getElementById('sub-go');if(b){b.disabled=false;b.textContent='🔒 تأكيد الاشتراك';}}
}
function subPayMsg(o){
  const list=(o.slots||[]).map(x=>SUB_DAYS[x.weekday]+' '+x.time).join('، ');
  return '📋 *اشتراك جديد — بانتظار الدفع*\n\n👤 *الطالب:* '+(CU?.name||'')+'\n📧 *البريد:* '+(CU?.email||'')+'\n👨‍🏫 *المعلم:* '+o.teacher
   +(list?'\n🗓 *المواعيد:* '+list+' (بتوقيت المعلم)':'')+'\n🔢 *الدروس:* '+o.lessons+' خلال ٤ أسابيع\n💰 *المبلغ:* USD '+Number(o.amount).toFixed(2)
   +'\n💳 *الطريقة:* '+(o.method==='bank'?'تحويل بنكي':'واتساب')+'\n🔖 *المرجع:* '+o.ref+'\n\nالسلام عليكم، أريد تأكيد الدفع لهذا الاشتراك.';
}
function subShowPayment(o,targetId){
  const el=document.getElementById(targetId);if(!el)return;
  window._subLastPay=o;
  const bank=(SITE_CONFIG&&SITE_CONFIG.bankRib)?'<div style="background:rgba(0,0,0,.25);border-radius:10px;padding:.6rem;margin:.5rem 0;font-size:.66rem;line-height:1.8">'
     +'<div>🏦 '+escapeHtml(SITE_CONFIG.bankName||'CIH Bank')+'</div><div dir="ltr" style="font-family:monospace;font-size:.75rem;color:var(--gl)">'+escapeHtml(SITE_CONFIG.bankRib)+'</div>'
     +(SITE_CONFIG.bankHolder?'<div>باسم: '+escapeHtml(SITE_CONFIG.bankHolder)+'</div>':'')+'</div>':'<div style="font-size:.64rem;color:var(--tm);margin:.4rem 0">تُرسل إليك بيانات الحساب عبر واتساب.</div>';
  el.innerHTML='<div style="background:rgba(39,174,96,.07);border:1px solid rgba(39,174,96,.25);border-radius:14px;padding:.9rem;margin-top:.9rem">'
   +'<div style="font-size:.85rem;font-weight:800;margin-bottom:.35rem">⏳ اشتراكك بانتظار الدفع</div>'
   +'<div style="font-size:.68rem;line-height:1.9;color:var(--tm)">'
   +'<div>المبلغ: <b dir="ltr" style="color:var(--gl)">USD '+Number(o.amount).toFixed(2)+'</b> — '+o.lessons+' درسًا</div>'
   +'<div>مرجع الدفع: <b dir="ltr" style="font-family:monospace;color:var(--wh)">'+escapeHtml(o.ref)+'</b></div></div>'
   +(o.method==='bank'?bank:'')
   +'<div style="font-size:.64rem;color:var(--tm);line-height:1.7;margin:.4rem 0 .6rem">ادفع خلال ٧٢ ساعة، ثم أرسل صورة الإيصال مع المرجع. تُفعَّل دروسك فور التحقق من وصول المبلغ.</div>'
   +'<a class="btn bgo bfw" style="display:block;text-align:center" target="_blank" rel="noopener" href="https://wa.me/'+(SITE_CONFIG&&SITE_CONFIG.whatsapp||'212681883238')+'?text='+encodeURIComponent(subPayMsg(o))+'">💬 إرسال الطلب والإيصال عبر واتساب</a>'
   +(String(targetId).indexOf('sub-pay-')===0?'':'<button class="btn bgh bfw" style="margin-top:.45rem" onclick="goP(\'p-dash\')">اشتراكاتي</button>')+'</div>';
}

/* ── اشتراكاتي في لوحة الطالب ── */
const _SUB_ST={pending_payment:['بانتظار الدفع','rgba(52,152,219,.15)','#5dade2'],active:['نشط','rgba(39,174,96,.15)','var(--grl)'],expired:['منتهٍ','rgba(231,76,60,.12)','#e67e73']};
async function loadMySubscriptions(){
  if(!_sb||!CU||!CU.id)return;
  let box=document.getElementById('my-subs');
  if(!box){const list=document.getElementById('student-lessons-list');if(!list)return;box=document.createElement('div');box.id='my-subs';list.parentNode.insertBefore(box,list.previousElementSibling||list);}
  try{
    const {data,error}=await _sb.from('subscriptions').select('*,subscription_slots(weekday,start_time),payments(provider_ref,payment_status,created_at)')
      .eq('student_id',CU.id).in('status',['pending_payment','active','expired']).order('created_at',{ascending:false}).limit(20);
    if(error)throw error;
    const today=new Date().toISOString().slice(0,10);
    const ord={active:0,pending_payment:1,expired:2};
    const subs=(data||[]).filter(s=>s.status!=='expired'||(s.hold_until&&s.hold_until>=today)).sort((a,b)=>(ord[a.status]-ord[b.status])||String(a.created_at).localeCompare(String(b.created_at)));
    const fd=v=>{if(!v)return '';const d=new Date(v+'T12:00:00');return d.toLocaleDateString('ar-u-nu-latn',{day:'numeric',month:'long',year:'numeric'});};
    const daysLeft=v=>v?Math.round((new Date(v+'T12:00:00')-new Date(today+'T12:00:00'))/864e5):99;
    const renewed=new Set(subs.filter(s=>s.renews_from).map(s=>s.renews_from));
    const credits=await p2LoadCredits();
    const head='<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.6rem"><div style="font-size:.8rem;font-weight:700;color:var(--gl)">📅 اشتراكاتي</div><button class="btn bgh bsm" style="font-size:.62rem" onclick="goP(\'p-subscribe\')">➕ اشتراك جديد</button></div>';
    if(!subs.length){box.innerHTML=head+'<div style="font-size:.68rem;color:var(--tm);text-align:center;padding:.6rem 0 1rem">لا اشتراك لديك بعد. بعد درسك المجاني اشترك بمواعيدك الأسبوعية الثابتة.</div>';return;}
    box.innerHTML=head+subs.map(s=>{
      const st=_SUB_ST[s.status]||['—','',''];
      const slots=(s.subscription_slots||[]).sort((a,b)=>a.weekday-b.weekday||String(a.start_time).localeCompare(b.start_time)).map(x=>SUB_DAYS[x.weekday]+' '+String(x.start_time).slice(0,5)).join('، ');
      const pay=(s.payments||[]).sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)))[0];
      let body='<div>🗓 '+escapeHtml(slots)+' <span style="font-size:.58rem">(بتوقيت المعلم)</span></div>';
      let acts='';
      if(s.status==='pending_payment'){
        const base=s.renews_from&&subs.find(x=>x.id===s.renews_from);
        body+='<div>💰 <b dir="ltr" style="color:var(--gl)">USD '+Number(s.amount).toFixed(2)+'</b> — '+s.lessons_total+' درسًا'+(s.renews_from?' • تجديد':'')+'</div>'
             +(base&&base.ends_on?'<div>▶️ يبدأ بعد انتهاء اشتراكك الحالي في '+fd(base.ends_on)+'</div>':'')
             +(pay?'<div>🔖 المرجع: <b dir="ltr" style="font-family:monospace">'+escapeHtml(pay.provider_ref||'')+'</b></div>':'');
        const o=JSON.stringify({teacher:s.teacher_name||'',slots:(s.subscription_slots||[]).map(x=>({weekday:x.weekday,time:String(x.start_time).slice(0,5)})),lessons:s.lessons_total,amount:s.amount,ref:pay?.provider_ref||'',method:'bank'}).replace(/"/g,'&quot;');
        acts='<button class="btn bgo bsm" style="flex:2;font-size:.62rem" onclick="subShowPayment('+o+',\'sub-pay-'+s.id+'\')">💳 تعليمات الدفع</button>'
            +'<button class="btn bgh bsm" style="flex:1;font-size:.62rem;color:#e74c3c" onclick="subCancel(\''+s.id+'\')">إلغاء</button>';
      }else if(s.status==='active'){
        const dl=daysLeft(s.ends_on);
        body+='<div>📆 من '+fd(s.starts_on)+' إلى '+fd(s.ends_on)+' — '+(s.lessons_generated||s.lessons_total)+' درسًا</div>'
             +(dl<=7&&dl>=0?'<div style="color:var(--gl)">⏳ ينتهي بعد '+dl+' يوم</div>':'');
        const mine=credits.filter(c=>c.subscription_id===s.id);
        if(mine.length){const c=mine[0];body+='<div style="color:var(--gl)">🎟 رصيد تعويض: '+mine.length+(c.reason==='teacher_absent'?' (بسبب غياب المعلم)':'')+' — قبل '+fd(c.expires_on)+'</div>';}
        acts='<button class="btn bgh bsm" style="flex:1;font-size:.62rem" onclick="showReceiptForSubscription(\''+s.id+'\')">🧾 الإيصال</button>'
            +(mine.length?'<button class="btn bgo bsm" style="flex:1.4;font-size:.62rem" onclick="openMakeup(\''+mine[0].id+'\',\''+s.id+'\',\''+s.teacher_id+'\','+JSON.stringify(String(s.teacher_name||'')).replace(/"/g,'&quot;')+',\''+mine[0].expires_on+'\')">📅 احجز درسًا تعويضيًا</button>':'');
        if(!renewed.has(s.id)&&dl<=7)acts+='<button class="btn bgo bsm" style="flex:1;font-size:.62rem" onclick="subRenew(\''+s.id+'\')">🔄 جدّد الآن</button>';
      }else if(s.status==='expired'){
        body+='<div>⏳ مواعيدك محجوزة لك حتى '+fd(s.hold_until)+'</div>';
        if(!renewed.has(s.id))acts='<button class="btn bgo bsm" style="flex:1;font-size:.62rem" onclick="subRenew(\''+s.id+'\')">🔄 جدّد واحتفظ بمواعيدك</button>';
      }
      return '<div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.7rem .8rem;margin-bottom:.5rem">'
        +'<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.3rem"><div style="font-size:.78rem;font-weight:800">'+escapeHtml(s.teacher_name||'المعلم')+'</div>'
        +'<span style="font-size:.58rem;font-weight:700;padding:.18rem .5rem;border-radius:20px;background:'+st[1]+';color:'+st[2]+'">'+st[0]+'</span></div>'
        +'<div style="font-size:.66rem;color:var(--tm);line-height:1.9">'+body+'</div>'
        +(acts?'<div style="display:flex;gap:.4rem;margin-top:.5rem">'+acts+'</div>':'')
        +'<div id="sub-pay-'+s.id+'"></div></div>';
    }).join('')+'<div style="height:.4rem"></div>';
  }catch(e){box.innerHTML='<div style="color:#e74c3c;font-size:.66rem;padding:.5rem 0">تعذّر تحميل الاشتراكات: '+escapeHtml(e.message||e)+'</div>';}
}
async function subCancel(id){
  if(!confirm('إلغاء طلب الاشتراك وتحرير مواعيده؟'))return;
  const {data,error}=await _sb.rpc('cancel_pending_subscription',{p_subscription_id:id});
  if(error||!data?.ok){toast((error&&error.message)||data?.error||'تعذّر الإلغاء','e');return;}
  toast('أُلغي طلب الاشتراك','i');loadMySubscriptions();
}
async function subRenew(id){
  const {data,error}=await _sb.rpc('request_subscription_renewal',{p_subscription_id:id,p_method:'bank'});
  if(error||!data?.ok){toast((error&&error.message)||data?.error||'تعذّر التجديد','e');return;}
  toast('أُنشئ طلب التجديد — اتبع تعليمات الدفع','s');await loadMySubscriptions();
}

/* ── ربط الصفحات ── */
(function(){
  const prevGoP=window.goP;
  if(typeof prevGoP!=='function')return;
  window.goP=function(id){
    if(id==='p-subscribe')_subEnsurePage();
    const r=prevGoP.apply(this,arguments);
    if(id==='p-subscribe')setTimeout(()=>initSubscribePage(window._subTeacherId||''),40);
    if(id==='p-dash')setTimeout(()=>{if(CU&&CU.role!=='teacher')loadMySubscriptions();},80);
    document.body.classList.toggle('no-fab',['p-adm','p-subscribe','p-terms','p-privacy','p-notifs','p-book','p-dash'].includes(id));
    window._subTeacherId='';
    return r;
  };
})();
function subscribeWithTeacher(){const t=window._currentTeacher;window._subTeacherId=t&&t.id||'';goP('p-subscribe');}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',_subEnsurePage);else _subEnsurePage();

/* ── الإدارة: تأكيد دفعة الاشتراك من المكان نفسه ── */
(function(){
  const prev=window.adminConfirmPayment;
  window.adminConfirmPayment=async function(id){
    try{
      const {data:p}=await _sb.from('payments').select('id,subscription_id').eq('id',Number(id)).maybeSingle();
      if(p&&p.subscription_id){
        if(!confirm('تأكيد استلام دفعة هذا الاشتراك وتفعيل دروسه؟'))return;
        const {data,error}=await _sb.rpc('confirm_subscription_payment',{p_subscription_id:p.subscription_id});
        if(error)throw error;if(!data?.ok)throw new Error(data?.error||'تعذّر التفعيل');
        toast('تم تفعيل الاشتراك وتوليد '+data.lessons_generated+' درسًا ✅','s');
        if(typeof loadAdminFinance==='function')loadAdminFinance();
        if(typeof loadAdminBookings==='function')loadAdminBookings();
        return;
      }
    }catch(e){toast('فشل التأكيد: '+(e.message||e),'e');return;}
    if(typeof prev==='function')return prev(id);
  };
})();

