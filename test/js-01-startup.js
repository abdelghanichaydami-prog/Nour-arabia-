
document.addEventListener('DOMContentLoaded', ()=>{
  if(typeof updateNotifBadge==='function') setTimeout(updateNotifBadge, 300);
});


// أدوات أمان للواجهة — لا تغني عن RLS في Supabase.
function escapeHtml(v){return String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;',"\"":'&quot;'}[c]));}

// طبقة AI آمنة: لا يُستدعى Anthropic من المتصفح مباشرة.
// نفس واجهة Response القديمة تُحافظ على الوظائف الحالية دون كشف المفتاح السري.
async function secureAIFetch(_url, options={}){
  if(!_sb) throw new Error('خدمة الذكاء الاصطناعي غير متاحة بدون اتصال Supabase');
  if(!CU?.id) throw new Error('تسجيل الدخول مطلوب لاستخدام الذكاء الاصطناعي');
  let payload={};
  try{ payload=typeof options.body==='string'?JSON.parse(options.body):(options.body||{}); }catch(e){ throw new Error('طلب AI غير صالح'); }
  try{const l=localStorage.getItem('mm_lang')||'ar';const LN={en:'English',fr:'French',es:'Spanish',de:'German',tr:'Turkish',nl:'Dutch',it:'Italian',pt:'Portuguese',id:'Indonesian'};
    if(LN[l]){const add='IMPORTANT: The user interface language is '+LN[l]+'. Write your ENTIRE reply in '+LN[l]+' only — do not switch to Arabic — unless the user explicitly writes to you in another language.';
      if(typeof payload.system==='string')payload.system=add+'\n\n'+payload.system.replace(/\s*بالعربية(\s*الفصحى)?(\s*المبسّطة)?/g,'')+'\n\n'+add;else payload.system=add;}}catch(e){}
  const {data,error}=await _sb.functions.invoke('ai-assistant',{body:payload});
  if(error) throw error;
  return {ok:true,json:async()=>data};
}

// ═══════════════════════════════════════════════
//  البنية المالية — قابلة لربط أي مزود دفع
// ═══════════════════════════════════════════════

// الأسعار والحصص المالية المعروضة هنا للواجهة فقط؛ الحجز والدفع النهائيان يجب أن يأتيا من RPC/الخادم.
const PAYMENT_CONFIG = {
  platformFeeRate: 0.25,        // ٢٥٪ للمنصة
  teacherShareRate: 0.75,       // ٧٥٪ للمعلم
  currency: 'USD',
  provider: 'manual',           // manual | cmi | payzone | stripe
  // ⚠️ تُملأ لاحقاً عند التعاقد مع مزود دفع:
  providerConfig: {
    merchantId: null,
    endpoint: null,
    returnUrl: null,
    webhookUrl: null
  }
};

// CMI لا يُفعّل من الواجهة بدون بيانات التاجر الرسمية وملف التكامل الذي يسلّمه CMI.
// لا تُوضع مفاتيح CMI أو مفاتيح التوقيع في هذا الملف أبداً.
const CMI_READY = false;

// حساب التوزيع المالي
function calcShares(amount){
  const gross = Number(amount) || 0;
  const platformFee = Math.round(gross * PAYMENT_CONFIG.platformFeeRate * 100) / 100;
  const teacherAmount = Math.round(gross * PAYMENT_CONFIG.teacherShareRate * 100) / 100;
  return { gross_amount: gross, platform_fee: platformFee, teacher_amount: teacherAmount };
}

// إنشاء سجل دفع — الحالة pending دائماً
async function createPaymentRecord(booking){
  if(!_sb) return {ok:false,error:'لا اتصال بقاعدة البيانات'};
  const bookingId=booking?.bookingId||booking?.id||null;
  if(!bookingId) return {ok:false,error:'معرّف الحجز غير موجود'};
  try{
    // لا نقرأ teacher_profiles من المتصفح ولا نرسل المبلغ أو نسب التوزيع من الواجهة.
    // RPC آمنة تتحقق من الحجز وتحسب 75/25 داخل قاعدة البيانات.
    const ref='MM-'+Date.now()+'-'+Math.random().toString(36).slice(2,7).toUpperCase();
    const method=booking?.paymentMethod==='bank'?'manual_bank':'manual_whatsapp';
    const {data,error}=await _sb.rpc('create_pending_payment',{
      p_booking_id:bookingId,
      p_provider:PAYMENT_CONFIG.provider==='cmi'?'cmi':method,
      p_provider_ref:ref,
      p_currency:PAYMENT_CONFIG.currency||'USD',
      p_notes:[booking?.hall||'', booking?.paymentMethod==='bank'?'bank_transfer':'whatsapp'].filter(Boolean).join(' | ')
    });
    if(error) throw error;
    return {ok:true,payment:data,ref};
  }catch(e){
    return {ok:false,error:e.message||String(e)};
  }
}

// ⚠️ التأكيد الرسمي — لا يُستدعى من المتصفح إطلاقاً
// عند ربط مزود دفع، يستدعيه الخادم عبر Webhook
// هذه الدالة موثّقة هنا لتوضيح العقد المطلوب فقط
//
// المطلوب من الخادم:
//   1. التحقق من توقيع المزود (signature verification)
//   2. التحقق أن provider_ref لم يُعالج من قبل (منع التكرار)
//   3. تحديث payment_status
//   4. تحديث حالة الحجز إن نجح الدفع
//
// نموذج SQL للخادم:
//   UPDATE payments SET payment_status='succeeded', paid_at=NOW()
//   WHERE provider_ref = $1 AND payment_status = 'pending';
//   UPDATE bookings SET status='confirmed', payment_status='paid'
//   WHERE id = (SELECT booking_id FROM payments WHERE provider_ref = $1);

// حالة الدفع الحالية — للعرض فقط
async function checkPaymentStatus(ref){
  if(!_sb || !ref) return null;
  try{
    const { data } = await _sb.from('payments')
      .select('payment_status,gross_amount,paid_at')
      .eq('provider_ref', ref).maybeSingle();
    return data;
  }catch(e){ return null; }
}

// الدفع اليدوي الحالي — واتساب وتحويل بنكي
async function initiateManualPayment(booking){
  const rec = await createPaymentRecord(booking);
  if(!rec.ok){
    toast('تعذّر إنشاء طلب الدفع: ' + rec.error, 'e');
    return null;
  }
  window._currentPaymentRef = rec.ref;
  window._currentPaymentMethod = booking?.paymentMethod||'whatsapp';
  return rec;
}

// مستحقات المعلم
async function getTeacherEarnings(teacherId){
  if(!_sb || !teacherId) return null;
  try{
    const { data } = await _sb.from('payments')
      .select('teacher_amount,payment_status,payout_status')
      .eq('teacher_id', teacherId);
    if(!data) return null;

    const paid = data.filter(p=>p.payment_status==='succeeded');
    return {
      total:     paid.reduce((s,p)=>s+Number(p.teacher_amount||0),0),
      pending:   paid.filter(p=>p.payout_status==='pending').reduce((s,p)=>s+Number(p.teacher_amount||0),0),
      withdrawn: paid.filter(p=>p.payout_status==='paid').reduce((s,p)=>s+Number(p.teacher_amount||0),0),
      count:     paid.length
    };
  }catch(e){ return null; }
}


// ═══════════════════════════════════════════════
//  نظام الحجوزات — منع التكرار والتوقيت
// ═══════════════════════════════════════════════

const BOOKING_STATUS = {
  pending:   { ar:'بانتظار التأكيد', color:'#F59E0B', icon:'⏳' },
  confirmed: { ar:'مؤكّد',           color:'#10B981', icon:'✅' },
  completed: { ar:'مكتمل',           color:'#3B82F6', icon:'🎓' },
  cancelled: { ar:'ملغى',            color:'#EF4444', icon:'❌' },
  no_show:   { ar:'لم يحضر',         color:'#6B7280', icon:'⚠️' }
};

// مفتاح فريد للموعد — يمنع الحجز المزدوج
function makeSlotKey(dateStr, timeStr){
  return String(dateStr||'').trim() + '|' + String(timeStr||'').trim();
}

// المنطقة الزمنية للمستخدم
function getUserTZ(){
  try{ return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'; }
  catch(e){ return 'UTC'; }
}
// فرق منطقة زمنية عن UTC عند لحظة معيّنة (بالمللي ثانية)
function tzOffsetMs(tz,date){
  try{
    const f=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
    const p={};f.formatToParts(date).forEach(x=>p[x.type]=x.value);
    return Date.UTC(+p.year,+p.month-1,+p.day,(+p.hour)%24,+p.minute,+p.second)-date.getTime();
  }catch(e){return 0;}
}
// تاريخ وساعة بتوقيت منطقة ما → لحظة مطلقة
function zonedToDate(dateStr,timeStr,tz){
  const [y,m,d]=String(dateStr).split('-').map(Number),[hh,mm]=String(timeStr).split(':').map(Number);
  const base=Date.UTC(y,m-1,d,hh||0,mm||0);let t=base;
  for(let i=0;i<2;i++)t=base-tzOffsetMs(tz,new Date(t));
  return new Date(t);
}
function fmtLocalTime(d){return d.toLocaleTimeString('ar-u-nu-latn',{hour:'2-digit',minute:'2-digit',hour12:false});}
function fmtLocalDay(d){return d.toLocaleDateString('ar-u-nu-latn',{weekday:'long',day:'numeric',month:'long'});}

// هل الموعد متاح فعلاً؟ — القراءة المساعدة فقط؛ الحسم النهائي خادمي.
async function isSlotAvailable(teacherId, dateStr, timeStr){
  if(!_sb) return false;
  try{
    const {data,error}=await _sb.rpc('check_booking_slot_available',{p_teacher_id:teacherId,p_date:dateStr,p_time:timeStr});
    if(error) throw error;
    return data===true;
  }catch(e){
    console.warn('isSlotAvailable:',e.message||e);
    return false;
  }
}

// إنشاء الحجز عبر RPC خادمية: السعر، الدرس المجاني، وتعارض المواعيد
// كلها تُحسم داخل PostgreSQL ولا يثق الخادم بأي قيمة مالية من المتصفح.
async function createBooking(payload){
  if(!_sb) return {ok:false,error:'لا اتصال بقاعدة البيانات'};
  if(!CU?.id) return {ok:false,error:'جلسة المستخدم غير صالحة — سجّل الدخول من جديد'};
  const teacherId=payload?.teacherId||currentTeacherId||null;
  const date=String(payload?.date||'').trim();
  const time=String(payload?.time||'').trim();
  if(!teacherId) return {ok:false,error:'يجب اختيار المعلم'};
  if(!date||!time) return {ok:false,error:'يجب اختيار التاريخ والوقت'};
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(teacherId))){
    return {ok:false,error:'هذا المعلم غير قابل للحجز حتى ربطه بحساب حقيقي.'};
  }
  try{
    const {data,error}=await _sb.rpc('create_booking_secure',{
      p_teacher_id:teacherId,
      p_date:date,
      p_time:time,
      p_hall:payload.hall||null,
      p_hall_name:payload.hallName||null,
      p_section:payload.section||null,
      p_duration:Number(payload.duration)||60,
      p_promo_code:appliedPromo?.code||null
    });
    if(error) throw error;
    if(data && data.ok===false) return {ok:false,error:data.error||'تعذر إنشاء الحجز'};
    return {ok:true,booking:data};
  }catch(e){
    const msg=e?.message||String(e);
    if(/BOOKING_SLOT_TAKEN|الموعد محجوز|duplicate/i.test(msg)) return {ok:false,error:'حُجز هذا الموعد للتو — اختر موعداً آخر'};
    return {ok:false,error:msg};
  }
}

// ═══════════════════════════════════════════════
//  نظام التقييمات
// ═══════════════════════════════════════════════

// هل يحق للطالب التقييم؟
async function canReview(bookingId){
  if(!_sb || !CU) return { can:false, reason:'سجّل الدخول أولاً' };
  try{
    const { data: bk } = await _sb.from('bookings')
      .select('id,status,student_id,teacher_id')
      .eq('id', bookingId).maybeSingle();

    if(!bk) return { can:false, reason:'الحجز غير موجود' };
    if(bk.student_id !== CU.id) return { can:false, reason:'هذا ليس حجزك' };
    if(bk.status !== 'completed') return { can:false, reason:'يمكنك التقييم بعد إتمام الدرس' };

    const { data: ex } = await _sb.from('reviews')
      .select('id').eq('booking_id', bookingId).maybeSingle();
    if(ex) return { can:false, reason:'قيّمت هذا الدرس من قبل' };

    return { can:true, booking:bk };
  }catch(e){
    return { can:false, reason: e.message || e };
  }
}

// إرسال تقييم
async function submitReview(bookingId, rating, comment){
  const chk = await canReview(bookingId);
  if(!chk.can){ toast(chk.reason,'e'); return { ok:false }; }

  const r = Math.max(1, Math.min(5, Number(rating)||0));
  if(!r){ toast('اختر تقييماً من ١ إلى ٥','e'); return { ok:false }; }

  try{
    const { error } = await _sb.from('reviews').insert({
      booking_id: bookingId,
      teacher_id: chk.booking.teacher_id,
      student_id: CU.id,
      student_name: CU.name,
      rating: r,
      comment: (comment||'').trim() || null
    });
    if(error){
      if(error.code === '23505'){ toast('قيّمت هذا الدرس من قبل','e'); return { ok:false }; }
      throw error;
    }
    toast('شكراً لتقييمك ⭐','s');
    // المتوسط يُحدَّث تلقائياً بـ trigger في قاعدة البيانات
    return { ok:true };
  }catch(e){
    toast('تعذّر إرسال التقييم: ' + (e.message||e), 'e');
    return { ok:false };
  }
}

