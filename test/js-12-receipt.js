
/* ===== إيصال الدفع — يظهر للطالب بعد تأكيد الدفع ===== */
function _rcptModal(){
  let m=document.getElementById('receipt-modal');if(m)return m;
  m=document.createElement('div');m.id='receipt-modal';m.setAttribute('data-no-translate','');
  m.style.cssText='display:none;position:fixed;inset:0;background:rgba(0,0,0,.88);z-index:9990;align-items:flex-end;justify-content:center';
  m.innerHTML='<div style="background:linear-gradient(160deg,#0f2b21,#071812);border-radius:22px 22px 0 0;border:1px solid var(--bd);width:100%;max-width:560px;padding:1rem;max-height:92vh;overflow-y:auto">'
    +'<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.8rem"><div style="font-size:.85rem;font-weight:700">🧾 إيصال الدفع</div><button onclick="closeReceipt()" style="background:none;border:none;color:var(--tm);font-size:1.1rem;cursor:pointer">✕</button></div>'
    +'<div id="receipt-content"></div>'
    +'<button class="btn bgo bfw" style="margin-top:.8rem" onclick="printReceipt()">📥 حفظ PDF / طباعة</button></div>';
  m.addEventListener('click',e=>{if(e.target===m)closeReceipt();});
  document.body.appendChild(m);return m;
}
function closeReceipt(){const m=document.getElementById('receipt-modal');if(m)m.style.display='none';}
function _rcptHTML(r){
  const e=escapeHtml,row=(k,v)=>'<tr><td style="padding:.38rem .5rem;color:#777;white-space:nowrap">'+k+'</td><td style="padding:.38rem .5rem;font-weight:600">'+v+'</td></tr>';
  return '<div id="receipt-printable" dir="rtl" style="background:#fff;color:#1a1a1a;border-radius:14px;padding:1.2rem;font-family:Cairo,Tahoma,sans-serif;font-size:13px;line-height:1.7">'
   +'<div style="text-align:center;border-bottom:2px solid #D4AF6A;padding-bottom:.7rem;margin-bottom:.8rem">'
   +'<div style="font-family:Amiri,serif;font-size:1.35rem;font-weight:700;color:#0F3D2E">منارة المعرفة</div>'
   +'<div style="font-size:.65rem;color:#888;letter-spacing:.12em">MANARAT AL-MAARIFA · manarat-almaarifa.com</div>'
   +(r.seller?'<div style="font-size:.7rem;color:#555;margin-top:.2rem">'+e(r.seller)+'</div>':'')
   +'</div>'
   +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.7rem"><div style="font-size:1rem;font-weight:800;color:#0F3D2E">إيصال دفع</div>'
   +'<div style="background:#e8f7ee;color:#1e8449;font-weight:800;padding:.2rem .7rem;border-radius:20px;font-size:.75rem">مدفوع ✓</div></div>'
   +'<table style="width:100%;border-collapse:collapse;margin-bottom:.7rem">'
   +row('رقم الإيصال',e(r.no))+row('تاريخ الدفع',e(r.paidAt))+row('الطالب',e(r.student))+(r.email?row('البريد',e(r.email)):'')
   +'</table>'
   +'<table style="width:100%;border-collapse:collapse;margin-bottom:.7rem;border:1px solid #eee">'
   +'<tr style="background:#D4AF6A;color:#fff"><th style="padding:.45rem;text-align:right">البيان</th><th style="padding:.45rem;text-align:left">المبلغ</th></tr>'
   +'<tr><td style="padding:.55rem"><div style="font-weight:700">'+e(r.title)+'</div>'+r.lines.map(x=>'<div style="font-size:.72rem;color:#777">'+e(x)+'</div>').join('')+'</td>'
   +'<td style="padding:.55rem;text-align:left;font-weight:700;white-space:nowrap" dir="ltr">'+e(r.amount)+'</td></tr>'
   +'<tr style="background:#f8f5ee;font-weight:800"><td style="padding:.55rem">الإجمالي المدفوع</td><td style="padding:.55rem;text-align:left;color:#0F3D2E" dir="ltr">'+e(r.amount)+'</td></tr>'
   +'</table>'
   +'<table style="width:100%;border-collapse:collapse">'+row('طريقة الدفع',e(r.method))+row('مرجع الدفع','<span dir="ltr" style="font-family:monospace">'+e(r.ref)+'</span>')+'</table>'
   +'<div style="text-align:center;font-size:.65rem;color:#999;margin-top:.9rem;padding-top:.55rem;border-top:1px solid #eee">هذا الإيصال يثبت استلام المبلغ المذكور أعلاه. شكرًا لثقتك بمنارة المعرفة.</div>'
   +'</div>';
}
async function showReceiptForBooking(bookingId){
  if(!_sb||!CU||!CU.id){toast('سجّل الدخول أولًا','e');return;}
  try{
    const [{data:b,error:be},{data:ps,error:pe}]=await Promise.all([
      _sb.from('bookings').select('*').eq('id',bookingId).maybeSingle(),
      _sb.from('payments').select('*').eq('booking_id',bookingId).eq('payment_status','succeeded').order('paid_at',{ascending:false}).limit(1)
    ]);
    if(be)throw be;if(pe)throw pe;
    const p=(ps||[])[0];
    if(!b||!p){toast('لا يوجد إيصال: لم يُؤكَّد دفع هذا الدرس بعد','i');return;}
    const x=_bkStart(b);
    showReceipt({
      no:'MM-R-'+String(p.id).padStart(6,'0'),
      paidAt:p.paid_at?new Date(p.paid_at).toLocaleString('ar-u-nu-latn',{dateStyle:'long',timeStyle:'short'}):'—',
      student:b.student_name||CU.name||'—',email:b.student_email||CU.email||'',
      title:'درس فردي — '+(b.hall_name||b.hall||'منارة المعرفة'),
      lines:['المعلم: '+(b.teacher_name||'—'),(b.section?'القسم: '+b.section:''),'الموعد: '+(x?fmtLocalDay(x)+' • '+fmtLocalTime(x)+' بتوقيتك':'—'),'المدة: '+(Number(b.duration)||60)+' دقيقة'].filter(Boolean),
      amount:(p.currency||'USD')+' '+Number(p.gross_amount||0).toFixed(2),
      method:_rcptMethod(p),
      ref:p.provider_ref||('#'+p.id),
      seller:SITE_CONFIG&&SITE_CONFIG.bankHolder?SITE_CONFIG.bankHolder:''
    });
  }catch(e){toast('تعذّر تحميل الإيصال: '+(e.message||e),'e');}
}
function _rcptMethod(p){
  const n=String(p.notes||'').toLowerCase(),pv=String(p.provider||'').toLowerCase();
  if(/\bbank\b/.test(n)||/bank/.test(pv))return 'تحويل بنكي';
  if(/whatsapp/.test(n))return 'تحويل عبر التنسيق بواتساب';
  return 'تحويل يدوي';
}
async function showReceiptForSubscription(subId){
  if(!_sb||!CU||!CU.id){toast('سجّل الدخول أولًا','e');return;}
  try{
    const [{data:x,error:xe},{data:ps,error:pe}]=await Promise.all([
      _sb.from('subscriptions').select('*,subscription_slots(weekday,start_time)').eq('id',subId).maybeSingle(),
      _sb.from('payments').select('*').eq('subscription_id',subId).eq('payment_status','succeeded').order('paid_at',{ascending:false}).limit(1)
    ]);
    if(xe)throw xe;if(pe)throw pe;
    const p=(ps||[])[0];
    if(!x||!p){toast('لا يوجد إيصال: لم يُؤكَّد دفع هذا الاشتراك بعد','i');return;}
    const days=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const slots=(x.subscription_slots||[]).sort((a,c)=>a.weekday-c.weekday).map(y=>days[y.weekday]+' '+String(y.start_time).slice(0,5)).join('، ');
    const fd=v=>v?new Date(v+'T12:00:00').toLocaleDateString('ar-u-nu-latn',{day:'numeric',month:'long',year:'numeric'}):'—';
    showReceipt({
      no:'MM-R-'+String(p.id).padStart(6,'0'),
      paidAt:p.paid_at?new Date(p.paid_at).toLocaleString('ar-u-nu-latn',{dateStyle:'long',timeStyle:'short'}):'—',
      student:x.student_name||CU.name||'—',email:x.student_email||CU.email||'',
      title:'اشتراك فردي — '+x.lessons_total+' درسًا (٤ أسابيع)',
      lines:['المعلم: '+(x.teacher_name||'—'),'المواعيد: '+slots+' (بتوقيت المعلم)','المدة: من '+fd(x.starts_on)+' إلى '+fd(x.ends_on),'سعر الدرس: '+(x.currency||'USD')+' '+Number(x.price_per_lesson||0).toFixed(2)],
      amount:(p.currency||'USD')+' '+Number(p.gross_amount||0).toFixed(2),
      method:_rcptMethod(p),ref:p.provider_ref||('#'+p.id),
      seller:SITE_CONFIG&&SITE_CONFIG.bankHolder?SITE_CONFIG.bankHolder:''
    });
  }catch(e){toast('تعذّر تحميل الإيصال: '+(e.message||e),'e');}
}
function showReceipt(r){
  window._currentReceipt=r;
  const m=_rcptModal();document.getElementById('receipt-content').innerHTML=_rcptHTML(r);m.style.display='flex';
}
function printReceipt(){
  const r=window._currentReceipt;if(!r)return;
  const w=window.open('','_blank');if(!w){toast('اسمح بالنوافذ المنبثقة لحفظ الإيصال','e');return;}
  w.document.write('<!doctype html><html dir="rtl" lang="ar"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+escapeHtml(r.no)+'</title>'
    +'<link href="https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet">'
    +'<style>body{margin:0;padding:18px;background:#fff}@page{size:A5;margin:12mm}@media print{#pbtn{display:none}}</style></head><body>'
    +_rcptHTML(r)
    +'<div id="pbtn" style="text-align:center;margin-top:14px"><button onclick="window.print()" style="font-family:Cairo,sans-serif;padding:10px 22px;border:0;border-radius:10px;background:#0F3D2E;color:#fff;font-weight:700">طباعة / حفظ PDF</button></div>'
    +'</body></html>');
  w.document.close();setTimeout(()=>{try{w.focus();w.print();}catch(e){}},700);
}

