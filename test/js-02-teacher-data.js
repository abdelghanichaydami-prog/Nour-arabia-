
// ═══════════════════════════════════════════════
//  طبقة توحيد بيانات المعلمين
//  تحل اختلاف أسماء الحقول بين النظامين
// ═══════════════════════════════════════════════

function normalizeTeacher(raw){
  if(!raw) return null;
  const pick = (...keys) => { for(const k of keys){ if(raw[k]!==undefined && raw[k]!==null && raw[k]!=='') return raw[k]; } return undefined; };
  const arr = v => Array.isArray(v) ? v : (typeof v==='string' && v.trim() ? v.split(',').map(s=>s.trim()).filter(Boolean) : []);

  return {
    id:          pick('id','user_id') || ('tch-'+Date.now()),
    user_id:     pick('user_id'),
    name:        pick('name','full_name'),
    email:       pick('email'),
    whatsapp:    pick('whatsapp','phone'),
    title:       pick('title','specialty'),
    specialty:   pick('specialty','title'),
    ijaza:       pick('ijaza','qualification'),
    qualification: pick('qualification','ijaza'),
    ijazaImage:  pick('ijazaImage','ijaza_image'),
    bio:         pick('bio','about','description'),
    country:     pick('country'),
    flag:        pick('flag') || '🌍',
    avatar:      pick('avatar','photo_url','avatar_url'),
    photo_url:   pick('photo_url','avatar','avatar_url'),
    video:       pick('video','video_url','intro_video'),
    video_url:   pick('video_url','video','intro_video'),
    specialties: arr(pick('specialties','specialty')),
    languages:   arr(pick('languages')) .length ? arr(pick('languages')) : ['العربية'],
    levels:      arr(pick('levels')).length ? arr(pick('levels')) : ['مبتدئ','متوسط','متقدم'],
    ages:        arr(pick('ages')).length ? arr(pick('ages')) : ['أطفال','شباب','كبار'],
    price:       Number(pick('price','price_per_hour')) || 12,
    experience:  pick('experience'),
    availability: pick('availability','availability_days'),
    availability_from: pick('availability_from'),
    availability_to:   pick('availability_to'),
    meeting_link: pick('meeting_link'),
    trialFree:   pick('trialFree','trial_free') !== false,
    verified:    !!pick('verified'),
    featured:    !!pick('featured'),
    rating:      Number(pick('rating')) || 0,
    reviews:     Number(pick('reviews','review_count')) || 0,
    review_count:Number(pick('review_count','reviews')) || 0,
    students:    Number(pick('students','student_count')) || 0,
    student_count:Number(pick('student_count','students')) || 0,
    lessons:     Number(pick('lessons','total_lessons')) || 0,
    total_lessons:Number(pick('total_lessons','lessons')) || 0,
    status:      pick('status') || 'active',
    joined:      pick('joined','created_at')
  };
}

// تحميل المعلمين من Supabase مع التوحيد
async function loadTeachersFromDB(){
  if(!_sb){
    const pub=document.getElementById('teachers-list-public');
    if(pub) pub.innerHTML='<div class="empty-state">تعذر الاتصال بخدمة المعلمين حالياً. حاول تحديث الصفحة.</div>';
    return false;
  }
  try{
    // لا نفلتر بـ status حتى لا نخفي الصفوف القديمة (status=NULL)
    const {data, error} = await _sb
      .from('public_teacher_directory')
      .select('*')
      .order('featured',{ascending:false});

    if(error){ console.warn('teacher_profiles:', error.message); return false; }
    if(!data) return false;

    const dbTeachers = data.map(normalizeTeacher).filter(t => t && t.status !== 'hidden');

    // قاعدة البيانات هي المصدر الأساسي في الإنتاج؛ لا نخلط معها سجلات محلية قديمة.
    TEACHERS = dbTeachers;
    populateBookingTeachers();
    try{ localStorage.setItem('mm_teachers', JSON.stringify(TEACHERS)); localStorage.setItem('mm_teachers_source','db'); }catch(e){}
    const pub=document.getElementById('teachers-list-public');
    if(pub) renderTeachers('teachers-list-public',null);
    return true;
  }catch(e){
    console.warn('loadTeachersFromDB:', e.message||e);
    return false;
  }
}

// جلب معلم واحد — من قاعدة البيانات أولاً ثم المحلي
async function fetchTeacher(tid){
  const local = (TEACHERS||[]).find(t => String(t.id) === String(tid));

  if(_sb){
    try{
      const {data} = await _sb.from('public_teacher_directory').select('*').eq('teacher_id', String(tid)).maybeSingle();
      if(data) return normalizeTeacher(data);
    }catch(e){}
  }
  return local ? normalizeTeacher(local) : null;
}

// ════════════════════════════════════════
//  إظهار الواجهة حسب دور المستخدم
// ════════════════════════════════════════
function applyRoleUI(){
  const role = CU?.role || 'guest';
  const isTeacher = role==='teacher' || role==='admin';
  const isLogged = !!CU;
  
  // تبويبات لوحة التحكم
  const dtaT = document.getElementById('dta-t');
  const dtaE = document.getElementById('dta-e');
  if(dtaT) dtaT.style.display = isTeacher ? '' : 'none';
  if(dtaE) dtaE.style.display = isTeacher ? '' : 'none';
  
  if(!isTeacher){
    const sTab = document.getElementById('dta-s');
    const sPanel = document.getElementById('dp-s');
    if(sTab && sPanel){
      document.querySelectorAll('.dta').forEach(b=>b.classList.remove('on'));
      document.querySelectorAll('.dpn').forEach(p=>p.classList.remove('on'));
      sTab.classList.add('on');
      sPanel.classList.add('on');
    }
  }
  
  // إخفاء كل ما يقود لصفحة الانضمام عن المسجّلين
  const joinSelectors = [
    '[onclick*="p-join"]',
    "[onclick*='p-join']",
    '#teacher-cta',
    '.join-teacher-btn'
  ];
  joinSelectors.forEach(sel=>{
    try{
      document.querySelectorAll(sel).forEach(el=>{
        el.style.display = role==='teacher' ? 'none' : '';
      });
    }catch(e){}
  });
  
  // قسم "هل أنت معلم؟" كاملاً في الصفحة الرئيسية
  const teacherSection = document.getElementById('teacher-title');
  if(teacherSection){
    let parent = teacherSection.closest('div[style*="background"]') || teacherSection.parentElement;
    if(parent) parent.style.display = role==='teacher' ? 'none' : '';
  }
  
  // صفحة p-join نفسها — إن دخلها مسجّل أعده للرئيسية
  if(role==='teacher'){
    const joinPage = document.getElementById('p-join');
    if(joinPage && joinPage.classList.contains('on')){
      if(typeof goP==='function') goP('p-home');
    }
  }
  
  // زر الإدارة للمدير فقط
  document.querySelectorAll('[onclick*="enterAdmin"]').forEach(el=>{
    el.style.display = role==='admin' ? '' : 'none';
  });
}


async function saveMyMeetLink(){
  const link=document.getElementById('teacher-meet-link')?.value?.trim()||'';
  const status=document.getElementById('teacher-link-status');
  if(!link){toast('الصق رابط الفصل أولاً','e');return;}
  if(!/^https:\/\/([a-z0-9-]+\.)*(zoom\.us|meet\.google\.com)\//i.test(link)){toast('الرابط يجب أن يكون من Zoom أو Google Meet ويبدأ بـ https://','e');return;}
  if(!_sb||!CU){toast('سجّل الدخول أولًا','e');return;}
  try{
    const {data,error}=await _sb.rpc('set_my_meeting_link',{p_link:link});
    if(error)throw error;if(!data?.ok)throw new Error(data?.error||'تعذّر الحفظ');
    try{localStorage.setItem('mm_my_meet_link',link);}catch(e){}
    if(status)status.textContent='✅ تم الحفظ — أُضيف إلى '+(data.lessons_updated||0)+' درسًا قادمًا، وسيُضاف تلقائيًا إلى كل درس جديد';
    toast('تم حفظ رابط فصلك ✅','s');
  }catch(e){toast('تعذّر حفظ الرابط: '+(e.message||e),'e');}
}

async function loadMyMeetLink(){
  const inp=document.getElementById('teacher-meet-link');
  if(!inp)return;
  let link='';
  try{if(_sb&&CU&&CU.id){const {data}=await _sb.from('profiles').select('meeting_link').eq('id',CU.id).maybeSingle();link=data?.meeting_link||'';}}catch(e){}
  if(!link){try{link=localStorage.getItem('mm_my_meet_link')||'';}catch(e){}}
  if(link){inp.value=link;const st=document.getElementById('teacher-link-status');if(st)st.textContent='✅ رابطك محفوظ ويصل إلى طلابك في كل درس';}
}


// ════════════════════════════════════════
//  إنشاء حساب من لوحة الإدارة
// ════════════════════════════════════════
async function adminCreateUser(){
  const g = id => document.getElementById(id)?.value?.trim() || '';
  const name=g('ns-name'), email=g('ns-email'), pw=g('ns-pw');
  const phone=g('ns-phone'), role=document.getElementById('ns-role')?.value||'student';
  const status=document.getElementById('ns-status');
  if(!name||!email||!pw){toast('أكمل الحقول المطلوبة','e');return;}
  if(pw.length<6){toast('كلمة المرور 6 أحرف على الأقل','e');return;}
  if(!email.includes('@')){toast('البريد الإلكتروني غير صحيح','e');return;}
  if(role==='teacher' && (!g('ns-title')||!g('ns-specs')||!g('ns-bio'))){toast('أكمل بيانات المعلم المطلوبة (*)','e');return;}
  if(status)status.innerHTML='<span style="color:var(--gl)">⏳ جاري الإنشاء الآمن...</span>';
  try{
    if(!_sb)throw new Error('لا اتصال بقاعدة البيانات');
    const payload={
      name,email,password:pw,phone:phone||null,role,
      teacher:role==='teacher'?{
        specialty:g('ns-title'),specialties:g('ns-specs').split(',').map(x=>x.trim()).filter(Boolean),
        qualification:g('ns-ijaza')||null,bio:g('ns-bio'),country:g('ns-country')||null,flag:g('ns-flag')||'🌍',
        photo_url:g('ns-avatar')||null,intro_video:g('ns-video')||null,price:Number(g('ns-price'))||12,
        ages:(document.getElementById('ns-ages')?.value||'أطفال,شباب,كبار').split(','),
        trial_free:document.getElementById('ns-trial')?.checked??true,
        featured:document.getElementById('ns-featured')?.checked||false
      }:null
    };
    const {data,error}=await _sb.functions.invoke('admin-create-user',{body:payload});
    if(error)throw error;
    if(data?.error)throw new Error(data.error);
    const userId=data?.user?.id;
    if(!userId)throw new Error('لم يُرجع الخادم معرف المستخدم');
    if(status)status.innerHTML=`<span style="color:var(--grl)">✅ تم إنشاء حساب ${escapeHtml(name)} بنجاح</span>`;
    toast(`تم إنشاء حساب ${role==='teacher'?'المعلم':'الطالب'}: ${name} ✅`,'s');
    if(phone){
      const msg=encodeURIComponent(`السلام عليكم ${name} 🌟\n\nتم إنشاء حسابك في منارة المعرفة.\n🌐 manarat-almaarifa.com\n📧 البريد: ${email}\n\nيرجى التواصل مع الإدارة للحصول على كلمة المرور بشكل آمن.`);
      setTimeout(()=>{if(confirm('هل تريد إرسال رسالة ترحيب عبر واتساب؟'))window.open('https://wa.me/'+phone.replace(/[^\d]/g,'')+'?text='+msg,'_blank');},500);
    }
    ['ns-name','ns-email','ns-pw','ns-phone','ns-title','ns-specs','ns-bio','ns-ijaza','ns-video','ns-avatar','ns-country','ns-flag'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    setTimeout(loadAdminUsers,500);
  }catch(e){
    const msg=e?.context?.body?.error||e.message||String(e);
    if(status)status.innerHTML=`<span style="color:#e74c3c">❌ ${escapeHtml(msg)}</span>`;
    toast('تعذّر إنشاء الحساب: '+msg,'e');
  }
}


function toggleTeacherFields(){
  const role = document.getElementById('ns-role')?.value;
  const fields = document.getElementById('teacher-fields');
  if(fields) fields.style.display = role==='teacher' ? 'block' : 'none';
}

