
(function(){
  'use strict';
  const esc = (v) => typeof escapeHtml==='function' ? escapeHtml(v) : String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const money = v => '$'+Number(v||0).toFixed(2);
  const toastV8 = (m,t='i') => { if(typeof toast==='function') toast(m,t); };
  const adminOnly = () => !!(_sb && isAdm && CU && CU.role==='admin');
  const byId = id => document.getElementById(id);

  /* -------------------- Admin modal -------------------- */
  function ensureModal(){
    let m=byId('adm-v8-modal');
    if(m)return m;
    m=document.createElement('div');
    m.id='adm-v8-modal';
    m.style.cssText='position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.82);backdrop-filter:blur(6px);display:none;align-items:flex-end;overflow:auto';
    m.innerHTML='<div id="adm-v8-box" style="width:100%;max-height:94vh;overflow:auto;background:linear-gradient(160deg,#0f3d2e,#071812);border:1px solid var(--bd);border-radius:22px 22px 0 0;padding:1rem"></div>';
    m.addEventListener('click',e=>{if(e.target===m)closeModal();});
    document.body.appendChild(m);
    return m;
  }
  function closeModal(){const m=byId('adm-v8-modal');if(m)m.style.display='none';}
  function modal(title,body,onSave){
    const m=ensureModal(),box=byId('adm-v8-box');
    box.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center;gap:.5rem;margin-bottom:.8rem"><strong style="font-size:.9rem;color:var(--gl)">'+esc(title)+'</strong><button class="btn bgh bsm" id="adm-v8-close">إغلاق</button></div>'+body+'<div style="display:flex;gap:.45rem;margin-top:.8rem"><button class="btn bgh" id="adm-v8-cancel" style="flex:1">إلغاء</button><button class="btn bgo" id="adm-v8-save" style="flex:2">💾 حفظ</button></div>';
    box.querySelector('#adm-v8-close').onclick=closeModal;
    box.querySelector('#adm-v8-cancel').onclick=closeModal;
    box.querySelector('#adm-v8-save').onclick=async()=>{const b=box.querySelector('#adm-v8-save');b.disabled=true;try{await onSave(box);closeModal();}catch(e){toastV8('فشل الحفظ: '+(e.message||e),'e');}finally{b.disabled=false;}};
    m.style.display='flex';
  }
  const input=(id,label,value='',type='text',extra='')=>'<label style="display:block;font-size:.63rem;color:var(--tm);margin:.45rem 0 .25rem">'+esc(label)+'</label><input id="'+id+'" class="ainp" type="'+type+'" value="'+esc(value)+'" style="width:100%" '+extra+'>';
  const area=(id,label,value='')=>'<label style="display:block;font-size:.63rem;color:var(--tm);margin:.45rem 0 .25rem">'+esc(label)+'</label><textarea id="'+id+'" class="ainp" rows="4" style="width:100%;resize:vertical">'+esc(value)+'</textarea>';
  const select=(id,label,value,opts)=>'<label style="display:block;font-size:.63rem;color:var(--tm);margin:.45rem 0 .25rem">'+esc(label)+'</label><select id="'+id+'" class="ainp" style="width:100%">'+opts.map(o=>'<option value="'+esc(o[0])+'" '+(String(o[0])===String(value)?'selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select>';

  const AGE_OPTS=['أطفال','شباب','كبار'];
  const LEVEL_OPTS=['مبتدئ','متوسط','متقدم'];
  const chks=(cls,label,opts,sel)=>{sel=Array.isArray(sel)?sel.map(String):[];return '<label style="display:block;font-size:.63rem;color:var(--tm);margin:.45rem 0 .25rem">'+esc(label)+'</label><div style="display:flex;gap:.4rem;flex-wrap:wrap">'+opts.map(o=>'<label style="display:flex;align-items:center;gap:.25rem;font-size:.66rem;background:rgba(255,255,255,.05);padding:.28rem .55rem;border-radius:8px;cursor:pointer"><input type="checkbox" class="'+cls+'" value="'+esc(o)+'" '+(sel.includes(String(o))?'checked':'')+'>'+esc(o)+'</label>').join('')+'</div>';};
  const chkVals=cls=>[...document.querySelectorAll('input.'+cls+':checked')].map(x=>x.value);
  const fileIn=(id,label,accept)=>'<label style="display:block;font-size:.63rem;color:var(--tm);margin:.45rem 0 .25rem">'+esc(label)+'</label><input id="'+id+'" class="ainp" type="file" accept="'+accept+'" style="width:100%;padding:.4rem">';
  async function upTeacherFile(id,folder){
    const el=byId(id); const f=el&&el.files&&el.files[0]; if(!f)return null;
    if(f.size>20*1024*1024) throw new Error('حجم الملف أكبر من 20 ميغابايت');
    const ext=(f.name.split('.').pop()||'bin').toLowerCase();
    const path=folder+'/'+Date.now()+'-'+Math.random().toString(36).slice(2,8)+'.'+ext;
    const {error}=await _sb.storage.from('teacher-media').upload(path,f,{upsert:false});
    if(error) throw new Error('تعذر رفع الملف: '+error.message);
    return _sb.storage.from('teacher-media').getPublicUrl(path).data.publicUrl;
  }

  /* -------------------- Admin shell -------------------- */
  window.buildAdminPanel = async function buildAdminPanelV8(){
    if(!adminOnly()){toastV8('يجب أن تكون مديراً نشطاً','e');return;}
    const old=byId('p-adm');if(old)old.remove();
    const cnt=byId('cnt');if(!cnt)return;
    const p=document.createElement('div');p.className='pg';p.id='p-adm';
    p.innerHTML=`
      <div style="padding:1rem 1rem .55rem;display:flex;align-items:center;justify-content:space-between;gap:.6rem">
        <div><div style="font-size:.72rem;color:var(--re);font-weight:800">🔐 لوحة الإدارة</div><div style="font-size:.95rem;font-weight:800">مركز التحكم الكامل</div><div style="font-size:.6rem;color:var(--tm);margin-top:.18rem">المصدر المركزي: Supabase • لا يعتمد على localStorage في بيانات التشغيل</div></div>
        <button class="btn bsm" style="background:rgba(192,57,43,.1);border:1px solid rgba(192,57,43,.25);color:#e74c3c" onclick="deAdm()">خروج</button>
      </div>
      <div class="admts" id="adm-v8-tabs">
        <button class="admt on" data-tab="overview">📊 الرئيسية</button>
        <button class="admt" data-tab="users">👥 المستخدمون</button>
        <button class="admt" data-tab="teachers">👨‍🏫 المعلمون</button>
        <button class="admt" data-tab="bookings">🗓 الحجوزات</button>
        <button class="admt" data-tab="finance">💰 المالية</button>
        <button class="admt" data-tab="content">📚 المحتوى</button>
        <button class="admt" data-tab="notifications">🔔 الإشعارات</button>
        <button class="admt" data-tab="reports">📈 التقارير</button>
        <button class="admt" data-tab="visitors">👣 الزوار</button>
        <button class="admt" data-tab="settings">⚙️ الإعدادات</button>
        <button class="admt" data-tab="log">📋 السجل</button>
      </div>
      <div id="adm-v8-body" style="padding-bottom:1rem"></div>`;
    cnt.appendChild(p);
    p.querySelectorAll('[data-tab]').forEach(btn=>btn.onclick=()=>openTab(btn.dataset.tab,btn));
    await openTab('overview',p.querySelector('[data-tab="overview"]'));
  };

  async function openTab(tab,btn){
    if(!adminOnly())return;
    document.querySelectorAll('#adm-v8-tabs .admt').forEach(x=>x.classList.toggle('on',x===btn));
    const b=byId('adm-v8-body');if(!b)return;
    b.innerHTML='<div style="padding:2rem;text-align:center;color:var(--tm)">⏳ جاري التحميل...</div>';
    const f={overview:loadAdminOverviewV8,users:loadAdminUsersV8,teachers:loadAdminTeacherCenterV8,bookings:loadAdminBookingsV8,finance:loadAdminFinanceV8,content:loadAdminContentV8,notifications:loadAdminNotificationsV8,reports:loadAdminReportsV8,visitors:loadAdminVisitorsV8,settings:loadAdminSettingsV8,log:loadAdminLogV8}[tab];
    if(f)await f();
  }

  const stat=(n,l,c='var(--gl)')=>'<div class="ast"><div class="astn" style="color:'+c+'">'+esc(n)+'</div><div class="astl">'+esc(l)+'</div></div>';
  const toolbar=(html)=>'<div style="display:flex;gap:.45rem;flex-wrap:wrap;margin-bottom:.7rem">'+html+'</div>';
  const card=(html)=>'<div style="background:rgba(255,255,255,.035);border:1px solid var(--bdl);border-radius:14px;padding:.75rem;margin-bottom:.5rem">'+html+'</div>';

  async function loadAdminOverviewV8(){
    const b=byId('adm-v8-body');
    try{
      const [{count:students},{count:teachers},{count:activeTeachers},{count:bookings},{data:rev}]=await Promise.all([
        _sb.from('profiles').select('*',{count:'exact',head:true}).eq('role','student'),
        _sb.from('profiles').select('*',{count:'exact',head:true}).eq('role','teacher'),
        _sb.from('profiles').select('*',{count:'exact',head:true}).eq('role','teacher').eq('status','active'),
        _sb.from('bookings').select('*',{count:'exact',head:true}),
        _sb.from('payments').select('platform_fee,payment_status').eq('payment_status','succeeded')
      ]);
      const revenue=(rev||[]).reduce((s,x)=>s+Number(x.platform_fee||0),0);
      b.innerHTML='<div class="admst">'+stat(students||0,'إجمالي الطلاب','var(--grl)')+stat(teachers||0,'حسابات المعلمين','var(--gl)')+stat(activeTeachers||0,'معلمون نشطون','#5dade2')+stat(bookings||0,'إجمالي الحجوزات','#c39bd3')+stat(money(revenue),'حصة المنصة','var(--grl)')+'</div>'+card('<div style="font-size:.72rem;font-weight:800;color:var(--gl);margin-bottom:.35rem">🔐 مبدأ الإدارة المركزي</div><div class="admin-v8-note">الحسابات والملفات والمحتوى والحجوزات والمالية تُقرأ من Supabase. البيانات المحلية القديمة لا تُستخدم كمصدر تشغيلي.</div>');
    }catch(e){b.innerHTML=card('<div style="color:#e74c3c">تعذر تحميل لوحة التحكم: '+esc(e.message||e)+'</div>');}
  }

  /* -------------------- Users -------------------- */
  async function loadAdminUsersV8(){
    const b=byId('adm-v8-body');
    const [{data,error},{data:teachers}]=await Promise.all([
      _sb.from('profiles').select('id,name,email,role,status,phone,country,bio,meeting_link,created_at,updated_at').order('created_at',{ascending:false}),
      _sb.from('teacher_profiles').select('user_id,name,specialty,price,verified,featured,status')
    ]);
    if(error)throw error;
    const tmap=new Map((teachers||[]).map(t=>[t.user_id,t]));
    let rows=data||[];
    b.innerHTML=toolbar('<input id="adm-user-q" class="ainp" placeholder="بحث بالاسم أو البريد أو الهاتف" style="flex:1;min-width:190px"><select id="adm-user-role" class="ainp"><option value="">كل الأدوار</option><option value="student">طلاب</option><option value="teacher">معلمون</option><option value="admin">مديرون</option></select><select id="adm-user-status" class="ainp"><option value="">كل الحالات</option><option value="active">نشط</option><option value="blocked">معطّل</option></select><button class="btn bgo" id="adm-add-user">➕ حساب جديد</button>')+'<div id="adm-users-list"></div>';
    const render=()=>{
      const q=(byId('adm-user-q')?.value||'').toLowerCase().trim(),r=byId('adm-user-role')?.value||'',s=byId('adm-user-status')?.value||'';
      const filtered=rows.filter(u=>(!q||[u.name,u.email,u.phone].some(v=>String(v||'').toLowerCase().includes(q)))&&(!r||u.role===r)&&(!s||u.status===s));
      const el=byId('adm-users-list');
      el.innerHTML=filtered.length?filtered.map(u=>{const t=tmap.get(u.id);return card('<div style="display:flex;justify-content:space-between;gap:.5rem;align-items:flex-start"><div style="min-width:0"><div style="font-size:.8rem;font-weight:800">'+esc(u.name||'بدون اسم')+'</div><div style="font-size:.62rem;color:var(--tm);word-break:break-all">'+esc(u.email||'')+(u.phone?' • '+esc(u.phone):'')+'</div><div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.35rem"><span class="pill pgb">'+(u.role==='teacher'?'👨‍🏫 معلم':u.role==='admin'?'🔐 مدير':'👨‍🎓 طالب')+'</span><span class="pill '+(u.status==='active'?'pgg':'abr')+'">'+(u.status==='active'?'● نشط':'● معطّل')+'</span>'+(t?'<span class="pill pgb">'+esc(t.specialty||'معلم')+'</span>':'')+'</div></div><div style="display:flex;gap:.3rem;flex-wrap:wrap;justify-content:flex-end"><button class="ab" data-edit-user="'+u.id+'">تعديل</button>'+ (u.id!==CU.id?'<button class="ab" data-toggle-user="'+u.id+'" data-active="'+(u.status==='active')+'">'+(u.status==='active'?'تعطيل':'تفعيل')+'</button>':'')+(u.id!==CU.id?'<button class="ab abr" data-delete-user="'+u.id+'">حذف نهائي</button>':'')+'</div></div>');}).join(''):'<div class="admin-v8-note" style="padding:1rem;text-align:center">لا توجد نتائج.</div>';
      el.querySelectorAll('[data-edit-user]').forEach(x=>x.onclick=()=>editUser(rows.find(u=>u.id===x.dataset.editUser)));
      el.querySelectorAll('[data-toggle-user]').forEach(x=>x.onclick=()=>toggleUser(x.dataset.toggleUser,x.dataset.active==='true'));
      el.querySelectorAll('[data-delete-user]').forEach(x=>x.onclick=()=>deleteUser(x.dataset.deleteUser));
    };
    byId('adm-user-q').oninput=render;byId('adm-user-role').onchange=render;byId('adm-user-status').onchange=render;byId('adm-add-user').onclick=()=>openCreateUserModal();render();
  }
  function editUser(u){
    if(!u)return;
    if(u.role==='teacher'){openTeacherForm(u,null,loadAdminUsersV8);return;}
    modal('تعديل حساب المستخدم',select('eu-role','نوع الحساب',u.role||'student',[['student','طالب'],['teacher','معلم'],['admin','مدير']])+input('eu-name','الاسم',u.name)+input('eu-phone','الهاتف',u.phone||'','tel','dir="ltr"')+input('eu-country','الدولة',u.country||'')+area('eu-bio','نبذة',u.bio||'')+'<div style="font-size:.6rem;color:var(--grl);margin-top:.4rem">عند التحويل إلى «معلم» يُفتح ملف المعلم الكامل مباشرة بعد الحفظ.</div>',async()=>{
      const role=byId('eu-role').value;
      const payload={name:byId('eu-name').value.trim(),phone:byId('eu-phone').value.trim()||null,country:byId('eu-country').value.trim()||null,bio:byId('eu-bio').value.trim()||null,updated_at:new Date().toISOString()};
      if(role!==(u.role||'student'))payload.role=role;
      const {error}=await _sb.from('profiles').update(payload).eq('id',u.id);if(error)throw error;
      toastV8('تم تحديث الحساب ✅','s');
      if(role==='teacher'&&u.role!=='teacher'){setTimeout(()=>openTeacherForm({...u,...payload},null,loadAdminUsersV8),60);return;}
      await loadAdminUsersV8();
    });
  }
  async function toggleUser(id,active){
    if(!confirm(active?'تعطيل هذا الحساب؟':'إعادة تفعيل هذا الحساب؟'))return;
    const {error}=await _sb.from('profiles').update({status:active?'blocked':'active',updated_at:new Date().toISOString()}).eq('id',id);
    if(error){toastV8('فشل: '+error.message,'e');return;}toastV8(active?'تم تعطيل الحساب':'تم تفعيل الحساب','s');loadAdminUsersV8();
  }
  async function deleteUser(id){
    if(!confirm('الحذف النهائي لا يتم إلا إذا لم يكن للحساب سجل حجوزات أو مدفوعات أو تقييمات. هل تريد المتابعة؟'))return;
    try{const {data,error}=await _sb.functions.invoke('admin-delete-user',{body:{user_id:id,confirm:true}});if(error)throw error;if(data?.error)throw new Error(data.error);toastV8('تم حذف الحساب نهائياً','s');loadAdminUsersV8();}catch(e){toastV8('لم يتم الحذف: '+(e.message||e),'e');}
  }
  async function fnErrMsg(error,fallback){
    let det='';
    try{const r=error?.context;if(r&&typeof r.text==='function'){det=await r.text();try{const j=JSON.parse(det);det=j.error||j.message||det;}catch(_){}}}catch(_){}
    return (det||error?.message||fallback)+(error?.context?.status?' ['+error.context.status+']':'');
  }
  function openCreateUserModal(){
    modal('إنشاء حساب جديد',select('cu-role','نوع الحساب','student',[['student','طالب'],['teacher','معلم']])+input('cu-name','الاسم الكامل')+input('cu-email','البريد الإلكتروني','','email','dir="ltr"')+input('cu-pw','كلمة المرور (6 أحرف على الأقل)','','password','dir="ltr"')+input('cu-phone','واتساب (اختياري)','','tel','dir="ltr"'),async()=>{
      const name=byId('cu-name').value.trim(),email=byId('cu-email').value.trim().toLowerCase(),password=byId('cu-pw').value,phone=byId('cu-phone').value.trim();
      if(!name||!email||!password)throw new Error('الاسم والبريد وكلمة المرور مطلوبة');
      if(password.length<6)throw new Error('كلمة المرور 6 أحرف على الأقل');
      const {data,error}=await _sb.functions.invoke('admin-create-user',{body:{name,email,password,phone,role:'student',teacher:null}});
      if(error)throw new Error(await fnErrMsg(error,'تعذر الاتصال بدالة إنشاء الحساب'));
      if(data?.error)throw new Error(data.error);
      toastV8('تم إنشاء حساب الطالب ✅','s');await loadAdminUsersV8();
    });
    byId('cu-role').onchange=()=>{
      if(byId('cu-role').value!=='teacher')return;
      const pf={name:byId('cu-name').value.trim(),email:byId('cu-email').value.trim(),password:byId('cu-pw').value,phone:byId('cu-phone').value.trim()};
      openTeacherForm(null,pf,loadAdminUsersV8);
    };
  }

  /* -------------------- Teachers -------------------- */
  async function loadAdminTeacherCenterV8(){
    const b=byId('adm-v8-body');
    const [{data:profiles,error:pErr},{data:tp,error:tErr},{data:apps,error:aErr},{data:legacy,error:lErr}]=await Promise.all([
      _sb.from('profiles').select('id,name,email,role,status,phone,country,created_at').eq('role','teacher').order('created_at',{ascending:false}),
      _sb.from('teacher_profiles').select('*').order('created_at',{ascending:false}),
      _sb.from('teacher_applications').select('*').order('created_at',{ascending:false}),
      _sb.from('legacy_teacher_catalog').select('*').order('created_at',{ascending:false})
    ]);
    if(pErr||tErr||aErr||lErr)throw (pErr||tErr||aErr||lErr);
    const map=new Map((tp||[]).map(t=>[t.user_id,t]));
    const active=(profiles||[]).filter(p=>p.status==='active');
    b.innerHTML='<div class="admst">'+stat(active.length,'معلمون نشطون','var(--grl)')+stat((profiles||[]).length,'حسابات معلمين','var(--gl)')+stat((apps||[]).filter(a=>a.status==='pending').length,'طلبات معلقة','#e6a23c')+stat((legacy||[]).filter(x=>x.active&&!x.linked_user_id).length,'ملفات قديمة تحتاج ربطاً','#5dade2')+'</div>'+
      toolbar('<button class="btn bgo" id="adm-new-teacher">➕ إضافة معلم</button><button class="btn bgh" id="adm-refresh-teachers">🔄 تحديث</button>')+
      '<div style="font-size:.8rem;font-weight:800;color:var(--gl);margin:.7rem 0 .5rem">👨‍🏫 الحسابات الحقيقية</div><div id="adm-teacher-accounts"></div>'+
      '<div style="font-size:.8rem;font-weight:800;color:var(--gl);margin:1rem 0 .5rem">⚠️ الملفات القديمة غير المرتبطة</div><div id="adm-legacy-teachers"></div>'+
      '<div style="font-size:.8rem;font-weight:800;color:var(--gl);margin:1rem 0 .5rem">⏳ طلبات الانضمام</div><div id="adm-teacher-apps"></div>';
    const ta=byId('adm-teacher-accounts');ta.innerHTML=(profiles||[]).length?(profiles||[]).map(p=>{const t=map.get(p.id);return card('<div style="display:flex;justify-content:space-between;gap:.5rem;align-items:flex-start"><div><div style="font-size:.8rem;font-weight:800">'+esc(p.name||t?.name||'معلم')+'</div><div style="font-size:.62rem;color:var(--tm)">'+esc(p.email||'')+' • '+(p.status==='active'?'نشط':'معطّل')+'</div><div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-top:.35rem"><span class="pill pgb">'+esc(t?.specialty||'ملف غير مكتمل')+'</span>'+(t?'<span class="pill '+(t.verified?'pgg':'pgb')+'">'+(t.verified?'✓ موثّق':'غير موثّق')+'</span><span class="pill pgb">$'+Number(t.price||12)+'</span>':'')+'</div></div><div style="display:flex;gap:.3rem;flex-wrap:wrap;justify-content:flex-end"><button class="ab" data-edit-t="'+p.id+'">تعديل الملف</button>'+(t?'<button class="ab" data-flag-t="'+p.id+'" data-field="verified" data-val="'+(!t.verified)+'">'+(t.verified?'إلغاء التوثيق':'توثيق')+'</button><button class="ab" data-flag-t="'+p.id+'" data-field="featured" data-val="'+(!t.featured)+'">'+(t.featured?'إلغاء التمييز':'تمييز')+'</button>':'<button class="ab abg" data-create-profile="'+p.id+'">إنشاء الملف</button>')+'</div></div>');}).join(''):'<div class="admin-v8-note">لا توجد حسابات معلمين.</div>';
    ta.querySelectorAll('[data-edit-t]').forEach(x=>x.onclick=()=>editTeacher((profiles||[]).find(p=>p.id===x.dataset.editT)));
    ta.querySelectorAll('[data-flag-t]').forEach(x=>x.onclick=()=>setTeacherFlag(x.dataset.flagT,x.dataset.field,x.dataset.val==='true'));
    ta.querySelectorAll('[data-create-profile]').forEach(x=>x.onclick=()=>createMissingTeacherProfile((profiles||[]).find(p=>p.id===x.dataset.createProfile)));
    const le=byId('adm-legacy-teachers');le.innerHTML=(legacy||[]).filter(x=>x.active&&!x.linked_user_id).length?(legacy||[]).filter(x=>x.active&&!x.linked_user_id).map(l=>card('<div style="display:flex;justify-content:space-between;gap:.5rem"><div><div style="font-size:.8rem;font-weight:800">'+esc(l.name)+'</div><div style="font-size:.62rem;color:var(--tm)">'+esc(l.title||l.specialty||'')+' • $'+Number(l.price||12)+'</div><div style="font-size:.62rem;color:var(--tm);margin-top:.25rem">هذا الملف محفوظ من النسخة الأصلية، لكنه لا يملك حساب Auth بعد.</div></div><button class="ab abg" data-link-legacy="'+esc(l.id)+'">ربط بحساب</button></div>')).join(''):'<div class="admin-v8-note">لا توجد ملفات قديمة غير مرتبطة.</div>';
    le.querySelectorAll('[data-link-legacy]').forEach(x=>x.onclick=()=>linkLegacyTeacher((legacy||[]).find(l=>l.id===x.dataset.linkLegacy)));
    const ae=byId('adm-teacher-apps');const pending=(apps||[]).filter(a=>a.status==='pending');ae.innerHTML=pending.length?pending.map(a=>card('<div style="display:flex;justify-content:space-between;gap:.5rem"><div><div style="font-size:.78rem;font-weight:800">'+esc(a.name||'—')+'</div><div style="font-size:.62rem;color:var(--tm)">'+esc(a.specialty||'')+' • '+esc(a.email||'')+'</div></div><div style="display:flex;gap:.3rem"><button class="ab abg" data-app-ok="'+a.id+'">قبول</button><button class="ab abr" data-app-no="'+a.id+'">رفض</button></div></div>')).join(''):'<div class="admin-v8-note">لا توجد طلبات معلقة.</div>';
    ae.querySelectorAll('[data-app-ok]').forEach(x=>x.onclick=()=>setApplication(x.dataset.appOk,'approved'));
    ae.querySelectorAll('[data-app-no]').forEach(x=>x.onclick=()=>setApplication(x.dataset.appNo,'rejected'));
    byId('adm-new-teacher').onclick=()=>openTeacherForm(null,null,loadAdminTeacherCenterV8);byId('adm-refresh-teachers').onclick=()=>loadAdminTeacherCenterV8();
  }
  /* نموذج المعلم الموحّد: إضافة وتعديل في مكان واحد، بكل الحقول */
  const DAY_NAMES=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const tfSec=t=>'<div style="font-size:.74rem;font-weight:800;color:var(--gl);margin:1rem 0 .1rem;padding-top:.65rem;border-top:1px solid rgba(255,255,255,.08)">'+t+'</div>';
  const tfNote=t=>'<div style="font-size:.6rem;color:var(--grl);margin-top:.35rem">'+t+'</div>';
  const tfChk=(id,label,on)=>'<label style="display:flex;align-items:center;gap:.4rem;font-size:.68rem;margin-top:.55rem;cursor:pointer"><input type="checkbox" id="'+id+'" '+(on?'checked':'')+'>'+esc(label)+'</label>';
  const tfDays=v=>{let a=v;if(typeof a==='string'){try{a=JSON.parse(a);}catch(e){a=a.replace(/[{}\[\]\s]/g,'').split(',').filter(x=>x!=='');}}const d=Array.isArray(a)?a.map(Number):[];return '<label style="display:block;font-size:.63rem;color:var(--tm);margin:.45rem 0 .25rem">أيام التدريس</label><div style="display:flex;gap:.35rem;flex-wrap:wrap">'+DAY_NAMES.map((n,i)=>'<label style="display:flex;align-items:center;gap:.25rem;font-size:.66rem;background:rgba(255,255,255,.05);padding:.28rem .55rem;border-radius:8px;cursor:pointer"><input type="checkbox" class="tf-days" value="'+i+'" '+(d.includes(i)?'checked':'')+'>'+n+'</label>').join('')+'</div>';};
  const tfNum=(id,def)=>{const x=String(byId(id)?.value??'').trim();if(x==='')return def;const n=Number(x);return Number.isFinite(n)?n:NaN;};
  async function openTeacherForm(p,prefill,after){
    const isNew=!p;let t=null;const pf=prefill||{};
    if(!isNew){
      const [{data:pr,error:pe},{data:tp,error:te}]=await Promise.all([
        _sb.from('profiles').select('*').eq('id',p.id).maybeSingle(),
        _sb.from('teacher_profiles').select('*').eq('user_id',p.id).maybeSingle()
      ]);
      if(pe||te){toastV8('تعذر تحميل بيانات المعلم: '+((pe||te).message),'e');return;}
      p={...p,...(pr||{})};t=tp||null;
    }
    const pick=(...xs)=>{for(const x of xs)if(x!==null&&x!==undefined&&x!=='')return x;return '';};
    const body=
      tfSec('👤 الحساب')+
      input('tf-name','الاسم الكامل',pick(p?.name,t?.name,pf.name))+
      (isNew?input('tf-email','البريد الإلكتروني',pf.email||'','email','dir="ltr"')+input('tf-pw','كلمة المرور (6 أحرف على الأقل)',pf.password||'','password','dir="ltr"'):tfNote('البريد: '+esc(p.email||'—')))+
      input('tf-phone','واتساب',pick(t?.whatsapp,p?.phone,pf.phone),'tel','dir="ltr"')+
      input('tf-country','الدولة',pick(t?.country,p?.country))+
      input('tf-meet','رابط الدرس الثابت (Meet / Zoom)',pick(p?.meeting_link),'url','dir="ltr"')+
      (isNew?'':select('tf-status','حالة الحساب',p.status||'active',[['active','نشط'],['blocked','معطّل']]))+
      tfSec('📚 التدريس')+
      input('tf-specialty','التخصص',pick(t?.specialty))+
      input('tf-qual','المؤهل / الإجازة',pick(t?.qualification))+
      input('tf-exp','سنوات الخبرة',pick(t?.experience),'number','min="0" step="1"')+
      area('tf-bio','النبذة',pick(t?.bio,p?.bio))+
      chks('tf-ages','الفئة العمرية',AGE_OPTS,t?t.ages:AGE_OPTS)+
      chks('tf-levels','المستويات',LEVEL_OPTS,t?t.levels:LEVEL_OPTS)+
      tfSec('🕐 أوقات التدريس')+
      tfDays(t?.availability_days)+
      input('tf-from','من الساعة',String(t?.availability_from||'').slice(0,5),'time','dir="ltr"')+
      input('tf-to','إلى الساعة',String(t?.availability_to||'').slice(0,5),'time','dir="ltr"')+
      tfSec('💰 السعر والنسبة — للإدارة فقط')+
      input('tf-price','سعر الدرس بالدولار',t?.price??12,'number','min="0" step="0.01"')+
      input('tf-pct','نسبة المنصة %',t?.platform_pct??20,'number','min="0" max="100" step="1"')+
      tfChk('tf-trial','الدرس الأول مجاني مع هذا المعلم',t?t.trial_free!==false:true)+
      tfSec('🏷️ الظهور')+
      tfChk('tf-active','الملف نشط ويظهر في دليل المعلمين',t?(t.status||'active')==='active':true)+
      tfChk('tf-verified','موثّق',!!t?.verified)+
      tfChk('tf-featured','مميّز',!!t?.featured)+
      tfSec('🖼️ الوسائط')+
      (t?.photo_url?tfNote('✅ توجد صورة حالية'):'')+fileIn('tf-photo',t?.photo_url?'تغيير الصورة':'صورة المعلم','image/*')+
      (t?.intro_video?tfNote('✅ يوجد فيديو حالي'):'')+fileIn('tf-video',t?.intro_video?'تغيير فيديو التعريف':'فيديو التعريف','video/*')+
      (t?.certificate_url?tfNote('✅ توجد شهادة حالية'):'')+fileIn('tf-cert',t?.certificate_url?'تغيير الشهادة':'الشهادة / الإجازة','image/*,application/pdf');
    modal(isNew?'إضافة معلم':'ملف المعلم — '+(p.name||''),body,async()=>{
      const name=byId('tf-name').value.trim();
      const phone=byId('tf-phone').value.trim()||null,country=byId('tf-country').value.trim()||null,meeting=byId('tf-meet').value.trim()||null;
      const specialty=byId('tf-specialty').value.trim(),bio=byId('tf-bio').value.trim();
      if(!name)throw new Error('الاسم مطلوب');
      if(!specialty||!bio)throw new Error('أكمل التخصص والنبذة');
      const days=[...document.querySelectorAll('input.tf-days:checked')].map(x=>Number(x.value));
      const from=byId('tf-from').value||null,to=byId('tf-to').value||null;
      if(from&&to&&from>=to)throw new Error('وقت البداية يجب أن يسبق وقت النهاية');
      const price=tfNum('tf-price',12),pct=tfNum('tf-pct',20),exp=tfNum('tf-exp',null);
      if(!(price>=0))throw new Error('السعر غير صالح');
      if(!(pct>=0&&pct<=100))throw new Error('نسبة المنصة بين 0 و100');
      if(exp!==null&&!(exp>=0))throw new Error('سنوات الخبرة غير صالحة');
      const tp={name,specialty,qualification:byId('tf-qual').value.trim()||null,experience:exp,bio,whatsapp:phone,country,
        ages:chkVals('tf-ages'),levels:chkVals('tf-levels'),availability_days:days,availability_from:from,availability_to:to,
        price,platform_pct:pct,trial_free:byId('tf-trial').checked,status:byId('tf-active').checked?'active':'hidden',
        verified:byId('tf-verified').checked,featured:byId('tf-featured').checked,updated_at:new Date().toISOString()};
      const ph=await upTeacherFile('tf-photo','photos');if(ph)tp.photo_url=ph;
      const vi=await upTeacherFile('tf-video','videos');if(vi)tp.intro_video=vi;
      const ce=await upTeacherFile('tf-cert','certificates');if(ce)tp.certificate_url=ce;
      let uid=p?.id,email=p?.email;
      if(isNew){
        email=byId('tf-email').value.trim().toLowerCase();const password=byId('tf-pw').value;
        if(!email||!password)throw new Error('البريد وكلمة المرور مطلوبان');
        if(password.length<6)throw new Error('كلمة المرور 6 أحرف على الأقل');
        const {data,error}=await _sb.functions.invoke('admin-create-user',{body:{name,email,password,phone,role:'teacher',teacher:{specialty,bio,qualification:tp.qualification,price,platform_pct:pct,ages:tp.ages,levels:tp.levels,photo_url:tp.photo_url||null,intro_video:tp.intro_video||null,certificate_url:tp.certificate_url||null,trial_free:tp.trial_free}}});
        if(error)throw new Error(await fnErrMsg(error,'تعذر الاتصال بدالة إنشاء الحساب'));
        if(data?.error)throw new Error(data.error);
        uid=data?.user_id||data?.user?.id||data?.id||null;
        if(!uid){const {data:pr}=await _sb.from('profiles').select('id').eq('email',email).maybeSingle();uid=pr?.id||null;}
        if(!uid)throw new Error('أُنشئ الحساب، لكن تعذر العثور عليه لإكمال الملف. افتح «تعديل الملف» من قائمة المعلمين.');
      }
      const pp={name,phone,country,bio,meeting_link:meeting,updated_at:new Date().toISOString()};
      if(!isNew)pp.status=byId('tf-status').value;
      const {error:pe}=await _sb.from('profiles').update(pp).eq('id',uid);if(pe)throw new Error('الحساب: '+pe.message);
      const {error:te}=await _sb.from('teacher_profiles').upsert({user_id:uid,email,...tp},{onConflict:'user_id'});if(te)throw new Error('ملف المعلم: '+te.message);
      if(typeof _TAV!=='undefined')try{delete _TAV[uid];}catch(_){}
      toastV8(isNew?'تمت إضافة المعلم بملفه الكامل ✅':'تم حفظ ملف المعلم ✅','s');
      await (after||loadAdminTeacherCenterV8)();
    });
  }
  function editTeacher(p){if(p)openTeacherForm(p,null,loadAdminTeacherCenterV8);}
  function createMissingTeacherProfile(p){if(p)openTeacherForm(p,null,loadAdminTeacherCenterV8);}
  async function setTeacherFlag(uid,field,value){const {error}=await _sb.from('teacher_profiles').update({[field]:value}).eq('user_id',uid);if(error){toastV8('فشل: '+error.message,'e');return;}toastV8('تم التحديث ✅','s');loadAdminTeacherCenterV8();}
  async function linkLegacyTeacher(l){
    if(!l)return;
    const teachers=await _sb.from('profiles').select('id,name,email').eq('role','teacher').eq('status','active').order('created_at',{ascending:false});
    const opts=(teachers.data||[]).map(t=>[t.id,(t.name||'معلم')+' — '+(t.email||'')]);
    if(!opts.length){toastV8('أنشئ حساب المعلم أولاً ثم عد لربط الملف القديم','i');return;}
    modal('ربط الملف القديم: '+l.name,select('lt-user','الحساب المستهدف','',opts),async()=>{const uid=byId('lt-user').value;if(!uid)throw new Error('اختر الحساب');const {error}=await _sb.rpc('link_legacy_teacher',{p_legacy_id:l.id,p_user_id:uid});if(error)throw error;toastV8('تم ربط الملف بالحساب وأصبح قابلاً للحجز ✅','s');await loadAdminTeacherCenterV8();loadTeachersFromDB();});
  }
  async function setApplication(id,status){const {error}=await _sb.from('teacher_applications').update({status,updated_at:new Date().toISOString()}).eq('id',id);if(error){toastV8('فشل: '+error.message,'e');return;}toastV8(status==='approved'?'تم قبول الطلب':'تم رفض الطلب','s');loadAdminTeacherCenterV8();}

  /* -------------------- Content -------------------- */
  async function loadAdminContentV8(){
    const b=byId('adm-v8-body');
    b.innerHTML='<div class="adm-v8-subtabs" style="display:flex;gap:.35rem;overflow:auto;margin-bottom:.7rem"><button class="btn bgo" data-c="books">📖 المكتبة</button><button class="btn bgh" data-c="sections">🏫 الفصول والأقسام</button><button class="btn bgh" data-c="groups">👥 الجماعية</button></div><div id="adm-content-v8"></div>';
    b.querySelectorAll('[data-c]').forEach(x=>x.onclick=()=>{b.querySelectorAll('[data-c]').forEach(y=>y.className='btn bgh');x.className='btn bgo';loadContentSub(x.dataset.c);});
    await loadContentSub('books');
  }
  async function loadContentSub(kind){
    const b=byId('adm-content-v8');if(!b)return;
    if(kind==='books')return loadBooksAdmin(b);
    if(kind==='sections')return loadSectionsAdmin(b);
    return loadGroupsAdmin(b);
  }
  async function loadBooksAdmin(b){
    const {data,error}=await _sb.from('library_books').select('*').order('sort_order').order('created_at');if(error)throw error;
    b.innerHTML=toolbar('<button class="btn bgo" id="add-book-v8">➕ إضافة كتاب</button>')+(data||[]).map(x=>card('<div style="display:flex;justify-content:space-between;gap:.5rem"><div><div style="font-size:.78rem;font-weight:800">'+esc(x.icon)+' '+esc(x.title)+'</div><div style="font-size:.61rem;color:var(--tm)">'+esc(x.author)+' • '+(x.is_free?'مجاني':'للأعضاء')+' • '+(x.active?'ظاهر':'مخفي')+'</div></div><div style="display:flex;gap:.3rem"><button class="ab" data-eb="'+x.id+'">تعديل</button><button class="ab" data-bstatus="'+x.id+'" data-active="'+x.active+'">'+(x.active?'إخفاء':'إظهار')+'</button><button class="ab abr" data-db="'+x.id+'">حذف</button></div></div>')).join('')||'<div class="admin-v8-note">لا توجد كتب.</div>';
    byId('add-book-v8').onclick=()=>editBook();b.querySelectorAll('[data-eb]').forEach(x=>x.onclick=()=>editBook(data.find(r=>r.id===x.dataset.eb)));b.querySelectorAll('[data-bstatus]').forEach(x=>x.onclick=()=>toggleContent('library_books',x.dataset.bstatus,x.dataset.active==='true'));b.querySelectorAll('[data-db]').forEach(x=>x.onclick=()=>deleteContent('library_books',x.dataset.db,()=>loadBooksAdmin(b)));
  }
  function normBookUrl(u){
    u=String(u||'').trim().replace(/\s+/g,'');
    if(!u)throw new Error('الرابط مطلوب');
    if(/^www\./i.test(u))u='https://'+u;
    if(/\.local(\/|$)|\/\/localhost|^file:/i.test(u))throw new Error('هذا رابط محلي لا يعمل إلا على جهازك — استعمل /books/… أو https://…');
    if(/^books\//i.test(u))u='/'+u;
    if(u.startsWith('/'))return u.replace(/\/{2,}/g,'/');
    if(/^https:\/\//i.test(u))return u;
    if(/^http:\/\//i.test(u))return 'https://'+u.slice(7);
    throw new Error('الرابط يجب أن يبدأ بـ https:// أو /books/');
  }
  window.normBookUrl=normBookUrl;
  window.uploadBookPdf=async function(inp){
    const st=byId('bk-up-st'),f=inp.files&&inp.files[0];
    const say=(t)=>{if(st)st.textContent=t;};
    if(!f)return;
    if(!/\.pdf$/i.test(f.name)&&f.type!=='application/pdf'){say('❌ الملف يجب أن يكون PDF');inp.value='';return;}
    if(f.size>45*1024*1024){say('❌ الحجم '+(f.size/1048576).toFixed(1)+'MB — اضغط الملف أولاً (الحد 45MB)');inp.value='';return;}
    say('⏳ جاري الرفع… '+(f.size/1048576).toFixed(1)+'MB — لا تغلق النافذة');
    try{
      let safe=f.name.replace(/\.pdf$/i,'').replace(/[^\w\-]+/g,'-').replace(/-+/g,'-').replace(/^-|-$/g,'').toLowerCase();
      if(!safe||safe.length<2)safe='book';
      const path='books/'+Date.now()+'-'+safe.slice(0,60)+'.pdf';
      const up=await _sb.storage.from('manarat-media').upload(path,f,{contentType:'application/pdf',upsert:false});
      if(up.error)throw up.error;
      const {data}=_sb.storage.from('manarat-media').getPublicUrl(path);
      if(!data?.publicUrl)throw new Error('تعذّر توليد الرابط');
      byId('bk-url-v8').value=data.publicUrl;
      const pg=byId('bk-pages-v8');if(pg&&!Number(pg.value))pg.value=0;
      say('✅ تم الرفع — الرابط جاهز في الحقل أعلاه. اضغط حفظ.');
    }catch(e){ say('❌ فشل الرفع: '+(e.message||e)); inp.value=''; }
  };
  function editBook(x){
    modal(x?'تعديل الكتاب':'إضافة كتاب',input('bk-title-v8','العنوان',x?.title||'')+input('bk-author-v8','المؤلف',x?.author||'—')+input('bk-url-v8','رابط الكتاب أو مساره في الموقع',x?.url||'','text','dir="ltr" placeholder="/books/my-book.pdf"')+'<div style="margin:-.45rem 0 .8rem;padding:.6rem .7rem;border:1px dashed rgba(212,175,106,.4);border-radius:12px;background:rgba(212,175,106,.05)">'
      +'<label style="display:block;font-size:.68rem;font-weight:800;color:#D4AF6A;margin-bottom:.35rem">📎 أو ارفع ملف PDF من جهازك</label>'
      +'<input type="file" accept="application/pdf,.pdf" id="bk-pdf-file" onchange="window.uploadBookPdf(this)" style="width:100%;font-size:.65rem;color:var(--tm)">'
      +'<div id="bk-up-st" style="font-size:.63rem;color:var(--tm);margin-top:.35rem;line-height:1.7">يُرفع إلى مخزن المنصة ويُملأ الرابط تلقائياً • الحد 45 ميغابايت</div></div>'+input('bk-pages-v8','عدد الصفحات',x?.pages||0,'number','min="0"')+input('bk-icon-v8','الأيقونة',x?.icon||'📗')+select('bk-cat-v8','التصنيف',x?.category||'q',[['q','القرآن والتجويد'],['l','العربية'],['s','العلوم الشرعية'],['lang','اللغات'],['edu','الدراسة'],['kids','الأطفال']])+select('bk-free-v8','الحالة السعرية',String(x?.is_free!==false),[['true','مجاني'],['false','للأعضاء']])+select('bk-active-v8','الظهور',String(x?.active!==false),[['true','ظاهر'],['false','مخفي']]),async()=>{
      const row={title:byId('bk-title-v8').value.trim(),author:byId('bk-author-v8').value.trim()||'—',url:normBookUrl(byId('bk-url-v8').value),pages:Number(byId('bk-pages-v8').value)||0,icon:byId('bk-icon-v8').value.trim()||'📗',category:byId('bk-cat-v8').value,is_free:byId('bk-free-v8').value==='true',active:byId('bk-active-v8').value==='true',updated_at:new Date().toISOString()};if(!row.title||!row.url)throw new Error('العنوان والرابط مطلوبان');const r=x?await _sb.from('library_books').update(row).eq('id',x.id):await _sb.from('library_books').insert({...row,created_by:CU.id});if(r.error)throw r.error;toastV8('تم حفظ الكتاب ✅','s');loadBooksAdmin(byId('adm-content-v8'));loadPublicContentV8();
    });
  }
  /* ═══════ v20 — إدارة الفصول وأقسامها ═══════ */
  const HV_LEVELS=['جميع المستويات','مبتدئ','مبتدئ—متوسط','متوسط','متوسط—متقدم','متقدم'];
  const hvColor=c=>{c=String(c||'').trim();if(/^#[0-9a-f]{3}$/i.test(c))c='#'+c.slice(1).split('').map(x=>x+x).join('');return /^#[0-9a-f]{6}$/i.test(c)?c:'#D4AF6A';};
  async function hvReorder(table,list,idx,dir){
    const j=idx+dir;if(j<0||j>=list.length)return;
    const arr=list.slice();[arr[idx],arr[j]]=[arr[j],arr[idx]];
    const ups=arr.map((r,i)=>({id:r.id,o:(i+1)*10,old:Number(r.sort_order)})).filter(u=>u.old!==u.o);
    const res=await Promise.all(ups.map(u=>_sb.from(table).update({sort_order:u.o}).eq('id',u.id)));
    const bad=res.find(r=>r.error);if(bad)throw bad.error;
  }
  function hvAfterChange(){
    const box=byId('adm-content-v8');if(box)loadSectionsAdmin(box);
    if(typeof loadPublicContentV8==='function')loadPublicContentV8();
    if(typeof window.loadHallsV20==='function')window.loadHallsV20();
  }
  async function loadSectionsAdmin(b){
    const [hr,sr]=await Promise.all([
      _sb.from('learning_halls').select('*').order('sort_order').order('name'),
      _sb.from('learning_sections').select('*').order('sort_order').order('name')
    ]);
    if(hr.error){
      b.innerHTML=card('<div style="font-size:.76rem;font-weight:800;color:#e74c3c;margin-bottom:.35rem">جدول الفصول غير موجود بعد</div><div style="font-size:.66rem;color:var(--tm);line-height:1.8">نفّذ ملف <b>manarat-halls.sql</b> في Supabase أولاً، ثم أعد فتح هذا التبويب.<br><span dir="ltr">'+esc(hr.error.message)+'</span></div>');
      return;
    }
    if(sr.error)throw sr.error;
    const halls=hr.data||[],secs=sr.data||[];
    const btn=(attr,label,cls='')=>'<button class="ab '+cls+'" '+attr+'>'+label+'</button>';
    function secRow(s,j,hid,orphan){
      return '<div style="display:flex;align-items:center;gap:.5rem;padding:.55rem .6rem;border-radius:12px;background:rgba(0,0,0,.2);margin-bottom:.35rem'+(s.active?'':';opacity:.55')+'">'
        +'<span style="font-size:1.15rem;flex-shrink:0">'+esc(s.icon||'📌')+'</span>'
        +'<div style="flex:1;min-width:0"><div style="font-size:.72rem;font-weight:700;line-height:1.45">'+esc(s.name)+'</div>'
        +'<div style="font-size:.58rem;color:var(--tm)">'+esc(s.level||'')+(s.active?'':' • مخفي')+(orphan?' • الرمز: '+esc(s.category):'')+'</div></div>'
        +'<div style="display:flex;gap:.2rem;flex-wrap:wrap;justify-content:flex-end;flex-shrink:0">'
        +(orphan?'':btn('data-sup="'+esc(hid)+'|'+j+'"','⬆️')+btn('data-sdn="'+esc(hid)+'|'+j+'"','⬇️'))
        +btn('data-se="'+esc(s.id)+'"','✏️')+btn('data-st="'+esc(s.id)+'"',s.active?'🙈':'👁')+btn('data-sd="'+esc(s.id)+'"','🗑','abr')
        +'</div></div>';
    }
    const hallHtml=(h,i)=>{
      const c=hvColor(h.color),list=secs.filter(s=>s.category===h.id);
      return '<details open style="border:1px solid '+c+'55;border-radius:18px;margin-bottom:.75rem;background:linear-gradient(135deg,'+c+'17,rgba(255,255,255,.02));overflow:hidden'+(h.active?'':';opacity:.7')+'">'
        +'<summary style="list-style:none;cursor:pointer;padding:.8rem;display:flex;align-items:center;gap:.65rem">'
        +'<span style="width:46px;height:46px;border-radius:14px;background:linear-gradient(135deg,'+c+','+c+'99);display:flex;align-items:center;justify-content:center;font-size:1.35rem;flex-shrink:0;box-shadow:0 6px 16px '+c+'44">'+esc(h.icon||'📚')+'</span>'
        +'<span style="flex:1;min-width:0"><span style="display:block;font-size:.84rem;font-weight:800;line-height:1.45">'+esc(h.name)+(h.active?'':' <span style="font-size:.58rem;color:#e67e22">• مخفي</span>')+'</span>'
        +'<span style="display:block;font-size:.6rem;color:var(--tm)">'+list.length+' '+(list.length===1?'قسم':'أقسام')+' • الرمز: <span dir="ltr">'+esc(h.id)+'</span></span></span>'
        +'<span style="font-size:.7rem;color:var(--tm)">▾</span></summary>'
        +'<div style="display:flex;gap:.3rem;flex-wrap:wrap;padding:0 .8rem .65rem">'
        +btn('data-hup="'+i+'"','⬆️')+btn('data-hdn="'+i+'"','⬇️')+btn('data-he="'+esc(h.id)+'"','✏️ تعديل')
        +btn('data-ht="'+esc(h.id)+'"',h.active?'🙈 إخفاء':'👁 إظهار')+btn('data-hd="'+esc(h.id)+'"','🗑 حذف','abr')+'</div>'
        +'<div style="padding:0 .8rem .8rem">'
        +(list.length?list.map((s,j)=>secRow(s,j,h.id,false)).join(''):'<div style="font-size:.66rem;color:var(--tm);padding:.3rem 0 .5rem">لا أقسام في هذا الفصل بعد.</div>')
        +'<button class="btn bgh bsm" data-sa="'+esc(h.id)+'" style="width:100%;margin-top:.3rem;border:1px dashed '+c+'88">➕ قسم جديد في «'+esc(h.name)+'»</button>'
        +'</div></details>';
    };
    const orphans=secs.filter(s=>!halls.some(h=>h.id===s.category));
    b.innerHTML=toolbar('<button class="btn bgo" id="add-hall-v20">➕ فصل جديد</button>')
      +'<div style="font-size:.64rem;color:var(--tm);line-height:1.8;margin-bottom:.7rem">الفصل هو المجال الكبير (القرآن، العربية…)، وفي كل فصل أقسام. الإخفاء يُبقي المحتوى محفوظاً ويمكن إظهاره لاحقاً؛ الحذف نهائي.</div>'
      +(halls.length?halls.map(hallHtml).join(''):card('<div style="font-size:.7rem;color:var(--tm)">لا فصول بعد — أضف أول فصل.</div>'))
      +(orphans.length?card('<div style="font-size:.72rem;font-weight:800;color:#e67e22;margin-bottom:.3rem">⚠️ أقسام بلا فصل</div><div style="font-size:.62rem;color:var(--tm);margin-bottom:.5rem">رمز فصلها غير موجود، فلا تظهر للزوار. عدّلها واختر لها فصلاً، أو احذفها.</div>'+orphans.map(s=>secRow(s,0,'',true)).join('')):'');

    const on=(sel,fn)=>b.querySelectorAll(sel).forEach(x=>x.onclick=async e=>{e.preventDefault();e.stopPropagation();try{await fn(x);}catch(err){toastV8('فشل: '+(err.message||err),'e');}});
    byId('add-hall-v20').onclick=()=>editHall(null,halls);
    on('[data-hup]',async x=>{await hvReorder('learning_halls',halls,+x.dataset.hup,-1);hvAfterChange();});
    on('[data-hdn]',async x=>{await hvReorder('learning_halls',halls,+x.dataset.hdn,1);hvAfterChange();});
    on('[data-he]',x=>editHall(halls.find(h=>h.id===x.dataset.he),halls));
    on('[data-ht]',async x=>{const h=halls.find(r=>r.id===x.dataset.ht);await toggleContent('learning_halls',h.id,h.active);hvAfterChange();});
    on('[data-hd]',async x=>{
      const h=halls.find(r=>r.id===x.dataset.hd),n=secs.filter(s=>s.category===h.id).length;
      if(!confirm('حذف فصل «'+h.name+'» نهائياً'+(n?' مع أقسامه ('+n+')':'')+'؟\n\nالإخفاء أسلم: يبقى محفوظاً ويمكن إظهاره لاحقاً.'))return;
      if(n){const r1=await _sb.from('learning_sections').delete().eq('category',h.id);if(r1.error)throw r1.error;}
      const r2=await _sb.from('learning_halls').delete().eq('id',h.id);if(r2.error)throw r2.error;
      toastV8('تم حذف الفصل','i');hvAfterChange();
    });
    on('[data-sa]',x=>editSection(null,halls,x.dataset.sa));
    on('[data-sup]',async x=>{const [hid,j]=x.dataset.sup.split('|');await hvReorder('learning_sections',secs.filter(s=>s.category===hid),+j,-1);hvAfterChange();});
    on('[data-sdn]',async x=>{const [hid,j]=x.dataset.sdn.split('|');await hvReorder('learning_sections',secs.filter(s=>s.category===hid),+j,1);hvAfterChange();});
    on('[data-se]',x=>editSection(secs.find(s=>String(s.id)===x.dataset.se),halls));
    on('[data-st]',async x=>{const s=secs.find(r=>String(r.id)===x.dataset.st);await toggleContent('learning_sections',s.id,s.active);hvAfterChange();});
    on('[data-sd]',async x=>{
      const s=secs.find(r=>String(r.id)===x.dataset.sd);
      if(!confirm('حذف قسم «'+s.name+'» نهائياً؟\n\nالإخفاء أسلم.'))return;
      const r=await _sb.from('learning_sections').delete().eq('id',s.id);if(r.error)throw r.error;
      toastV8('تم حذف القسم','i');hvAfterChange();
    });
  }
  function editHall(x,halls){
    halls=halls||[];
    modal(x?'تعديل الفصل':'فصل جديد',
      (x?'':input('hv-id','الرمز — حروف لاتينية صغيرة، فريد، لا يتغيّر بعد الإنشاء','','text','dir="ltr" placeholder="kids-quran"'))
      +input('hv-name','اسم الفصل',x?.name||'')
      +area('hv-desc','الوصف (يظهر في رأس الفصل)',x?.description||'')
      +input('hv-icon','الأيقونة (رمز تعبيري)',x?.icon||'📚')
      +input('hv-color','لون الفصل',hvColor(x?.color),'color')
      +select('hv-active','الظهور',String(x?.active!==false),[['true','ظاهر'],['false','مخفي']]),
      async()=>{
        const row={name:byId('hv-name').value.trim(),description:byId('hv-desc').value.trim()||null,icon:byId('hv-icon').value.trim()||'📚',color:hvColor(byId('hv-color').value),active:byId('hv-active').value==='true',updated_at:new Date().toISOString()};
        if(!row.name)throw new Error('اسم الفصل مطلوب');
        let r;
        if(x){r=await _sb.from('learning_halls').update(row).eq('id',x.id);}
        else{
          const id=byId('hv-id').value.trim().toLowerCase();
          if(!/^[a-z][a-z0-9_-]{0,23}$/.test(id))throw new Error('الرمز: حروف لاتينية صغيرة وأرقام فقط، ويبدأ بحرف');
          if(halls.some(h=>h.id===id))throw new Error('هذا الرمز مستعمل لفصل آخر');
          const maxO=Math.max(0,...halls.map(h=>Number(h.sort_order)||0));
          r=await _sb.from('learning_halls').insert({...row,id,sort_order:maxO+10});
        }
        if(r.error)throw r.error;
        toastV8('تم حفظ الفصل ✅','s');hvAfterChange();
      });
  }
  function editSection(x,halls,hid){
    halls=halls||[];
    const lv=x?.level||'جميع المستويات',lvOpts=HV_LEVELS.includes(lv)?HV_LEVELS:[lv,...HV_LEVELS];
    if(!halls.length){toastV8('أضف فصلاً أولاً','i');return;}
    modal(x?'تعديل القسم':'قسم جديد',
      select('sv-hall','الفصل',x?.category||hid||halls[0].id,halls.map(h=>[h.id,(h.icon||'')+' '+h.name]))
      +input('sv-name','اسم القسم',x?.name||'')
      +input('sv-icon','الأيقونة',x?.icon||'📌')
      +select('sv-level','المستوى',lv,lvOpts.map(v=>[v,v]))
      +area('sv-desc','وصف قصير (اختياري)',x?.description||'')
      +select('sv-active','الظهور',String(x?.active!==false),[['true','ظاهر'],['false','مخفي']]),
      async()=>{
        const row={category:byId('sv-hall').value,name:byId('sv-name').value.trim(),icon:byId('sv-icon').value.trim()||'📌',level:byId('sv-level').value,description:byId('sv-desc').value.trim()||null,active:byId('sv-active').value==='true',updated_at:new Date().toISOString()};
        if(!row.category)throw new Error('اختر الفصل');
        if(!row.name)throw new Error('اسم القسم مطلوب');
        let r;
        if(x){r=await _sb.from('learning_sections').update(row).eq('id',x.id);}
        else{
          const {data:last}=await _sb.from('learning_sections').select('sort_order').eq('category',row.category).order('sort_order',{ascending:false}).limit(1);
          r=await _sb.from('learning_sections').insert({...row,sort_order:(Number(last?.[0]?.sort_order)||0)+10,created_by:CU.id});
        }
        if(r.error)throw r.error;
        toastV8('تم حفظ القسم ✅','s');hvAfterChange();
      });
  }
  async function loadGroupsAdmin(b){
    b.innerHTML='<div style="background:rgba(212,175,106,.06);border:1px solid rgba(212,175,106,.22);border-radius:12px;padding:1rem;font-size:.72rem;line-height:1.8">👥 <b>الحصص الجماعية القديمة استُبدلت بنظام الدورات الجماعية.</b><br>أنشئ الدورات ودفعاتها من: <b>الحجوزات ← الدورات</b>.</div>';return;
    // eslint-disable-next-line no-unreachable
    const [{data,error},{data:teachers}]=await Promise.all([_sb.from('group_classes').select('*').order('created_at',{ascending:false}),_sb.from('teacher_profiles').select('id,name').order('name')]);if(error)throw error;
    b.innerHTML=toolbar('<button class="btn bgo" id="add-group-v8">➕ إضافة حصة جماعية</button>')+(data||[]).map(x=>card('<div style="display:flex;justify-content:space-between;gap:.5rem"><div><div style="font-size:.78rem;font-weight:800">👥 '+esc(x.title)+'</div><div style="font-size:.61rem;color:var(--tm)">'+esc(x.teacher_name||'—')+' • '+esc(x.day)+' '+esc(x.time)+' • '+money(x.price)+' • '+x.current_students+'/'+x.max_students+'</div></div><div style="display:flex;gap:.3rem"><button class="ab" data-eg="'+x.id+'">تعديل</button><button class="ab" data-gstatus="'+x.id+'" data-active="'+x.active+'">'+(x.active?'إخفاء':'إظهار')+'</button><button class="ab abr" data-dg="'+x.id+'">حذف</button></div></div>')).join('')||'<div class="admin-v8-note">لا توجد حصص جماعية.</div>';
    byId('add-group-v8').onclick=()=>editGroup(null,teachers||[]);b.querySelectorAll('[data-eg]').forEach(x=>x.onclick=()=>editGroup(data.find(r=>r.id===x.dataset.eg),teachers||[]));b.querySelectorAll('[data-gstatus]').forEach(x=>x.onclick=()=>toggleContent('group_classes',x.dataset.gstatus,x.dataset.active==='true'));b.querySelectorAll('[data-dg]').forEach(x=>x.onclick=()=>deleteContent('group_classes',x.dataset.dg,()=>loadGroupsAdmin(b)));
  }
  function editGroup(x,teachers){
    const opts=[['','بدون معلم']].concat(teachers.map(t=>[t.id,t.name||'معلم']));
    modal(x?'تعديل الحصة الجماعية':'إضافة حصة جماعية',input('gc-title-v8','العنوان',x?.title||'')+select('gc-teacher-v8','المعلم',x?.teacher_id||'',opts)+input('gc-day-v8','اليوم',x?.day||'')+input('gc-time-v8','الوقت',x?.time||'')+input('gc-dur-v8','المدة بالدقائق',x?.duration||60,'number','min="1"')+input('gc-max-v8','الحد الأقصى',x?.max_students||8,'number','min="1"')+input('gc-price-v8','السعر بالدولار',x?.price||6,'number','min="0" step="0.01"')+input('gc-level-v8','المستوى',x?.level||'جميع المستويات')+input('gc-subj-v8','رمز المادة',x?.subject||'q')+input('gc-link-v8','رابط الاجتماع',x?.meeting_link||'','url','dir="ltr"')+select('gc-active-v8','الظهور',String(x?.active!==false),[['true','ظاهر'],['false','مخفي']]),async()=>{const tid=byId('gc-teacher-v8').value||null;const t=(teachers||[]).find(z=>z.id===tid);const row={title:byId('gc-title-v8').value.trim(),teacher_id:tid,teacher_name:t?.name||'—',day:byId('gc-day-v8').value.trim()||'—',time:byId('gc-time-v8').value.trim()||'—',duration:Number(byId('gc-dur-v8').value)||60,max_students:Number(byId('gc-max-v8').value)||8,price:Number(byId('gc-price-v8').value)||0,level:byId('gc-level-v8').value.trim()||'جميع المستويات',subject:byId('gc-subj-v8').value.trim()||'q',meeting_link:byId('gc-link-v8').value.trim()||null,active:byId('gc-active-v8').value==='true',updated_at:new Date().toISOString()};if(!row.title)throw new Error('عنوان الحصة مطلوب');const r=x?await _sb.from('group_classes').update(row).eq('id',x.id):await _sb.from('group_classes').insert({...row,created_by:CU.id});if(r.error)throw r.error;toastV8('تم حفظ الحصة الجماعية ✅','s');loadGroupsAdmin(byId('adm-content-v8'));loadPublicContentV8();});
  }
  async function toggleContent(table,id,active){const {error}=await _sb.from(table).update({active:!active,updated_at:new Date().toISOString()}).eq('id',id);if(error)throw error;toastV8(!active?'تم الإظهار':'تم الإخفاء','s');}
  async function deleteContent(table,id,reload){if(!confirm('الحذف النهائي لهذا المحتوى؟'))return;const {error}=await _sb.from(table).delete().eq('id',id);if(error){toastV8('فشل الحذف: '+error.message,'e');return;}toastV8('تم الحذف','i');reload();loadPublicContentV8();}

  /* -------------------- Existing core tabs, kept intact -------------------- */
  async function loadAdminBookingsV8(){const b=byId('adm-v8-body');document.querySelectorAll('#p-adm [id="ab-body"]').forEach(e=>e.removeAttribute('id'));if(typeof loadAdminBookings==='function'&&loadAdminBookings!==loadAdminBookingsV8){b.innerHTML='<div id="ab-body" style="padding:1rem"></div>';return loadAdminBookings();}b.innerHTML=card('إدارة الحجوزات متاحة من النسخة الأصلية.');}
  async function loadAdminFinanceV8(){const b=byId('adm-v8-body');document.querySelectorAll('#p-adm [id="af-body"]').forEach(e=>e.removeAttribute('id'));b.innerHTML='<div id="af-body" style="padding:1rem"></div>';if(typeof loadAdminFinance==='function'&&loadAdminFinance!==loadAdminFinanceV8)return loadAdminFinance();b.innerHTML=card('إدارة المالية متاحة من النسخة الأصلية.');}
  async function loadAdminReportsV8(){const b=byId('adm-v8-body');document.querySelectorAll('#p-adm [id="arr-body"]').forEach(e=>e.removeAttribute('id'));b.innerHTML='<div id="arr-body" style="padding:1rem"></div>';if(typeof loadAdminReports==='function'&&loadAdminReports!==loadAdminReportsV8)return loadAdminReports();b.innerHTML=card('التقارير متاحة من النسخة الأصلية.');}
  async function loadAdminSettingsV8(){const b=byId('adm-v8-body');document.querySelectorAll('#p-adm [id="asite-body"]').forEach(e=>e.removeAttribute('id'));b.innerHTML='<div id="asite-body" style="padding:1rem"></div>';if(typeof loadAdminSiteSettings==='function')return loadAdminSiteSettings();b.innerHTML=card('الإعدادات متاحة من النسخة الأصلية.');}
  async function loadAdminLogV8(){const b=byId('adm-v8-body');document.querySelectorAll('#p-adm [id="alg-body"]').forEach(e=>e.removeAttribute('id'));b.innerHTML='<div id="alg-body" style="padding:1rem"></div>';if(typeof loadAdminLog==='function')return loadAdminLog();b.innerHTML=card('السجل متاح من النسخة الأصلية.');}
  async function loadAdminVisitorsV8(days){
    const b=byId('adm-v8-body');days=days||window._visDays||7;window._visDays=days;
    const {data:r,error}=await _sb.rpc('admin_visitor_stats',{p_days:days});if(error)throw error;
    let RN;try{RN=new Intl.DisplayNames(['ar'],{type:'region'});}catch(e){}
    const flag=c=>/^[A-Z]{2}$/.test(c)?String.fromCodePoint(...[...c].map(x=>127397+x.charCodeAt(0))):'🌐';
    const cname=c=>/^[A-Z]{2}$/.test(c)?((RN&&RN.of(c))||c):'غير معروف';
    const PG={'p-home':'الرئيسية','p-halls':'الفصول','p-lib':'المكتبة','p-dash':'لوحتي','p-acc':'حسابي','p-about':'عن المنصة','p-join':'انضم كمعلم','p-terms':'الشروط','p-privacy':'الخصوصية','p-teachers':'المعلمون','p-find-teacher':'البحث عن معلم','p-teacher-profile':'ملف معلم','p-subscribe':'الاشتراك','p-book':'الحجز','p-group':'الدورات الجماعية','p-notifs':'الإشعارات','p-community':'المجتمع','p-my-profile':'ملفي'};
    const DV={mobile:'📱 هاتف',tablet:'📟 لوحي',desktop:'💻 حاسوب'};
    const bars=(arr,lab,tot)=>arr.length?arr.map(x=>{const w=tot?Math.max(3,Math.round(x.n*100/tot)):0;return '<div style="margin-bottom:.4rem"><div style="display:flex;justify-content:space-between;font-size:.66rem;margin-bottom:.15rem"><span>'+lab(x.k)+'</span><span style="color:var(--tm)">'+x.n+'</span></div><div style="height:5px;background:rgba(255,255,255,.06);border-radius:3px"><div style="height:5px;width:'+w+'%;background:var(--go);border-radius:3px"></div></div></div>';}).join(''):'<div style="font-size:.65rem;color:var(--tm)">لا بيانات</div>';
    const sec=(t,h)=>card('<div style="font-size:.72rem;font-weight:800;color:var(--gl);margin-bottom:.5rem">'+t+'</div>'+h);
    const m=new Map((r.daily||[]).map(x=>[x.d,x]));const dd=[];
    for(let i=days-1;i>=0;i--){const d=new Date(Date.now()-i*864e5).toISOString().slice(0,10);const x=m.get(d)||{n:0,nw:0};dd.push({d,n:x.n,nw:x.nw});}
    const mx=Math.max(1,...dd.map(x=>x.n));
    const chart='<div style="display:flex;align-items:flex-end;gap:2px;height:90px;direction:ltr">'+dd.map(x=>'<div title="'+x.d+': '+x.n+' (جدد '+x.nw+')" style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;height:100%"><div style="height:'+Math.round((x.n-x.nw)*88/mx)+'px;background:var(--go);opacity:.55;border-radius:2px 2px 0 0"></div><div style="height:'+Math.round(x.nw*88/mx)+'px;background:var(--go)"></div></div>').join('')+'</div><div style="display:flex;justify-content:space-between;font-size:.58rem;color:var(--tm);margin-top:.25rem;direction:ltr"><span>'+dd[0].d.slice(5)+'</span><span>'+dd[dd.length-1].d.slice(5)+'</span></div><div style="font-size:.6rem;color:var(--tm);margin-top:.3rem">الجزء السفلي من العمود: زوار جدد • التاريخ بتوقيت UTC</div>';
    const vt=r.visitors||0;
    const seg=[7,30,90].map(n=>'<button class="btn bsm '+(n===days?'bgo':'bgh')+'" style="flex:1;font-size:.66rem" data-vd="'+n+'">'+n+' يومًا</button>').join('');
    b.innerHTML='<div style="padding:1rem"><div style="display:flex;gap:.4rem;margin-bottom:.75rem">'+seg+'</div>'
      +'<div class="admst">'+stat(vt,'زائر')+stat(r.new_visitors||0,'زائر جديد','var(--grl)')+stat(r.sessions||0,'زيارة','#5dade2')+stat(r.views||0,'مشاهدة صفحة','#c39bd3')+stat(r.members||0,'زائر مسجَّل الدخول')+stat(r.signups||0,'حساب جديد','var(--grl)')+'</div>'
      +sec('📈 الزوار يوميًا',chart)
      +sec('🌍 البلدان',bars(r.countries||[],k=>flag(k)+' '+esc(cname(k)),vt))
      +sec('📄 الصفحات الأكثر زيارة',bars(r.pages||[],k=>esc(PG[k]||k),vt))
      +sec('🔗 مصادر الزيارات',bars(r.refs||[],k=>esc(k),r.sessions||0))
      +sec('📱 الأجهزة',bars(r.devices||[],k=>esc(DV[k]||k),vt))
      +sec('🗣️ لغة الجهاز',bars(r.langs||[],k=>esc(k),vt))
      +((r.unknown_tz||[]).length?'<div style="font-size:.6rem;color:var(--tm)">مناطق زمنية بلا بلد: '+esc(r.unknown_tz.join('، '))+'</div>':'')
      +'<div style="font-size:.6rem;color:var(--tm);margin-top:.4rem;line-height:1.7">البلد تقديري من المنطقة الزمنية للجهاز. لا تُحسب زيارات حسابات الإدارة ولا هذا الجهاز.</div></div>';
    b.querySelectorAll('[data-vd]').forEach(x=>x.onclick=()=>loadAdminVisitorsV8(+x.dataset.vd).catch(e=>toastV8(e.message||e,'e')));
  }
  async function loadAdminNotificationsV8(){
    const b=byId('adm-v8-body');const {data,error}=await _sb.from('admin_notifications').select('*').order('created_at',{ascending:false}).limit(50);if(error)throw error;
    b.innerHTML=toolbar('<button class="btn bgo" id="add-notif-v8">➕ إشعار جديد</button>')+(data||[]).map(n=>card('<div style="display:flex;justify-content:space-between;gap:.5rem"><div><div style="font-size:.75rem;font-weight:800">'+esc(n.title)+'</div><div style="font-size:.63rem;color:var(--tm);line-height:1.6">'+esc(n.message)+'</div><div style="font-size:.58rem;color:var(--tm);margin-top:.25rem">'+esc(n.audience)+' • '+(n.active?'نشط':'مخفي')+'</div></div><div style="display:flex;gap:.3rem"><button class="ab" data-nstatus="'+n.id+'" data-active="'+n.active+'">'+(n.active?'إخفاء':'إظهار')+'</button><button class="ab abr" data-dn="'+n.id+'">حذف</button></div></div>')).join('')||'<div class="admin-v8-note">لا توجد إشعارات.</div>';
    byId('add-notif-v8').onclick=()=>editNotification();b.querySelectorAll('[data-nstatus]').forEach(x=>x.onclick=()=>toggleContent('admin_notifications',x.dataset.nstatus,x.dataset.active==='true'));b.querySelectorAll('[data-dn]').forEach(x=>x.onclick=()=>deleteContent('admin_notifications',x.dataset.dn,()=>loadAdminNotificationsV8()));
  }
  function editNotification(){modal('إشعار جديد',input('nn-title','العنوان','إشعار من منارة المعرفة')+area('nn-msg','الرسالة')+select('nn-type','النوع','info',[['info','معلومة'],['promo','عرض'],['alert','تنبيه'],['new','جديد'],['success','نجاح']])+select('nn-aud','الجمهور','all',[['all','الجميع'],['students','الطلاب'],['teachers','المعلمون']]),async()=>{const row={title:byId('nn-title').value.trim()||'إشعار من منارة المعرفة',message:byId('nn-msg').value.trim(),type:byId('nn-type').value,audience:byId('nn-aud').value,active:true,created_by:CU.id};if(!row.message)throw new Error('نص الإشعار مطلوب');const {error}=await _sb.from('admin_notifications').insert(row);if(error)throw error;toastV8('تم حفظ الإشعار المركزي ✅','s');loadAdminNotificationsV8();});}

  /* -------------------- Public central content -------------------- */
  async function loadTeachersFromDBV8(){
    if(!_sb)return false;
    const {data,error}=await _sb.from('public_teacher_directory').select('*').order('featured',{ascending:false}).order('name',{ascending:true});
    if(error){console.warn('public_teacher_directory:',error.message);return false;}
    TEACHERS=(data||[]).map(t=>{const n=normalizeTeacher(t);n.bookable=!!t.bookable;n.directory_id=t.teacher_id;n.id=t.teacher_id;n.profile_id=t.profile_id||null;return n;});
    allTeachers=data||[];
    try{localStorage.setItem('mm_teachers',JSON.stringify(TEACHERS));}catch(e){}
    populateBookingTeachersV8();
    return true;
  }
  window.loadTeachersFromDB=loadTeachersFromDBV8;
  window.fetchTeacher=async function(tid){
    if(!_sb)return null;
    const {data,error}=await _sb.from('public_teacher_directory').select('*').eq('teacher_id',String(tid)).maybeSingle();
    if(error||!data)return null;
    const n=normalizeTeacher(data);n.bookable=!!data.bookable;n.directory_id=data.teacher_id;n.id=data.teacher_id;n.profile_id=data.profile_id||null;return n;
  };
  window.renderTeachers=function(containerId='teachers-list',filter=null){
    const el=byId(containerId);if(!el)return;let list=TEACHERS||[];if(filter)list=list.filter(t=>(t.specialties||[]).some(s=>String(s).includes(filter)));
    if(!list.length){el.innerHTML='<div style="text-align:center;padding:2.5rem 1rem;color:var(--tm)"><div style="font-size:2rem">👨‍🏫</div><div style="font-size:.75rem">لا يوجد معلمون منشورون لهذا التخصص حالياً</div></div>';return;}
    el.innerHTML=list.map(t=>{const id=esc(t.id),name=esc(t.name||'—'),photo=esc(t.avatar||t.photo_url||''),spec=esc(t.title||t.specialty||'—');return '<div onclick="openTeacherProfile(\''+id+'\')" style="background:rgba(255,255,255,.04);border:1px solid '+(t.featured?'rgba(212,175,106,.25)':'var(--bdl)')+';border-radius:16px;padding:.9rem;margin-bottom:.6rem;cursor:pointer;position:relative">'+(t.featured?'<div style="position:absolute;top:.6rem;left:.6rem;background:linear-gradient(135deg,var(--go),var(--gl));color:var(--navy);font-size:.55rem;font-weight:700;padding:.15rem .45rem;border-radius:100px">⭐ مميّز</div>':'')+'<div style="display:flex;gap:.7rem;margin-bottom:.6rem"><div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--go),var(--gl));display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:700;color:var(--navy);flex-shrink:0;overflow:hidden">'+(photo?'<img src="'+photo+'" style="width:100%;height:100%;object-fit:cover">':name.charAt(0))+'</div><div style="flex:1;min-width:0"><div style="font-size:.82rem;font-weight:700">'+name+(t.verified?'<span style="color:#5dade2;font-size:.7rem;margin-right:.25rem">✓</span>':'')+'</div><div style="font-size:.68rem;color:var(--gl)">'+spec+'</div><div style="font-size:.62rem;color:var(--tm);margin-top:.15rem">'+esc(t.flag||'🌍')+' '+esc(t.country||'')+' • '+esc((t.ages||[]).join(' • '))+'</div></div><div style="text-align:left;flex-shrink:0"><div style="font-size:.9rem;font-weight:700;color:var(--gl)">'+money(t.price||12)+'</div><div style="font-size:.55rem;color:var(--tm)">/درس</div></div></div>'+(t.ijaza?'<div style="background:rgba(39,174,96,.08);border:1px solid rgba(39,174,96,.15);border-radius:8px;padding:.45rem .6rem;margin-bottom:.5rem;font-size:.62rem;color:var(--grl);line-height:1.5">📜 '+esc(t.ijaza)+'</div>':'')+'<div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:.55rem">'+(t.specialties||[]).map(s=>'<span style="background:rgba(212,175,106,.1);color:var(--gl);font-size:.58rem;padding:.15rem .45rem;border-radius:100px">'+esc(s)+'</span>').join('')+'</div><div style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;gap:.6rem;font-size:.62rem;color:var(--tm)"><span>⭐ '+Number(t.rating||0).toFixed(1)+'</span><span>👥 '+Number(t.students||0)+' طالب</span><span>📚 '+Number(t.lessons||0)+' درس</span></div>'+(t.bookable?'<span style="background:rgba(39,174,96,.15);color:var(--grl);font-size:.58rem;padding:.15rem .5rem;border-radius:100px;font-weight:700">🎁 درس مجاني</span>':'<span style="background:rgba(212,175,106,.12);color:var(--gl);font-size:.58rem;padding:.15rem .5rem;border-radius:100px;font-weight:700">⚠️ الملف قيد الربط</span>')+'</div></div>';}).join('');
  };
  window.loadTeachers=async function(){const ok=await loadTeachersFromDBV8();if(!ok){renderTeachers('teachers-list');}else{renderTeacherGridV8(allTeachers);}return ok;};
  function renderTeacherGridV8(teachers){const el=byId('td-grid');if(!el)return;el.innerHTML=(teachers||[]).map(t=>'<div class="tc-card" onclick="openTeacherProfile(\''+esc(t.teacher_id)+'\')"><div class="tc-card-hd"><div class="tc-av">'+esc((t.name||'م')[0])+'</div><div class="tc-info"><div class="tc-name">'+esc(t.name||'—')+'</div><div class="tc-spec">'+esc(t.specialty||'—')+'</div><div class="tc-rating">'+('★'.repeat(Math.round(Number(t.rating)||0)))+'☆'.repeat(5-Math.round(Number(t.rating)||0))+'</div></div></div><div class="tc-card-bd"><div class="tc-bio-preview">'+esc(t.bio||'لا توجد نبذة')+'</div><div class="tc-card-ft"><div class="tc-price">'+money(t.price||12)+'<span>/درس</span></div><button class="btn bgo bsm" onclick="event.stopPropagation();bookTeacher(\''+esc(t.teacher_id)+'\')" '+(t.bookable?'':'disabled')+'>'+ (t.bookable?'احجز':'قيد الربط')+'</button></div></div></div>').join('')||'<div style="padding:2rem;text-align:center;color:var(--tm)">لا يوجد معلمون بعد.</div>';}
  window.bookTeacher=async function(tid){let t=(TEACHERS||[]).find(x=>String(x.id)===String(tid));if(!t&&window._currentTeacher&&String(window._currentTeacher.id)===String(tid))t=window._currentTeacher;if(!t&&typeof fetchTeacher==='function'){try{t=await fetchTeacher(tid);}catch(e){}}if(!t){toastV8('تعذّر تحميل بيانات المعلم — أعد تحميل الصفحة','e');return;}if(!t.bookable){toastV8('هذا الملف محفوظ من النسخة الأصلية ويحتاج إلى ربط حساب المعلم قبل الحجز','i');return;}currentTeacherId=tid;goP('p-book');setTimeout(()=>populateBookingTeachersV8(),50);};
  window.populateBookingTeachers=populateBookingTeachersV8;
  async function populateBookingTeachersV8(){const el=byId('b-tch');if(!el||!_sb)return;try{const {data}=await _sb.from('public_teacher_directory').select('teacher_id,name,price,verified,bookable').eq('bookable',true).order('featured',{ascending:false}).order('name');el.innerHTML='<option value="">-- اختر المعلم --</option>'+(data||[]).map(t=>'<option value="'+esc(t.teacher_id)+'" data-name="'+esc(t.name||'')+'" data-price="'+Number(t.price||12)+'">'+esc(t.name||'معلم')+' — $'+Number(t.price||12)+'</option>').join('');if(!(data||[]).length){el.innerHTML='<option value="">لا يوجد معلمون مفعّلون للحجز حالياً</option>';toastV8('لا يوجد معلم مفعّل للحجز بعد','i');}if(currentTeacherId){el.value=currentTeacherId;if(el.value!==String(currentTeacherId))toastV8('هذا المعلم غير مفعّل للحجز بعد — تواصل معنا عبر واتساب','i');}}catch(e){console.warn(e);toastV8('تعذّر تحميل المعلمين: '+(e.message||e),'e');}}

  /* Library and sections become DB-first; original V3 remains fallback if DB is empty. */
  window.openBook=function(idOrUrl,title,cat){let b=null;if(typeof idOrUrl==='string'&&/^https?:\/\//i.test(idOrUrl)){window.open(idOrUrl,'_blank','noopener');return;}b=(window._V8_BOOKS||[]).find(x=>String(x.id)===String(idOrUrl))||((typeof BOOKS!=='undefined')?BOOKS.find(x=>String(x.id)===String(idOrUrl)):null);if(!b){toastV8('الكتاب غير موجود','e');return;}if(b.is_free===false&&!b.url&&!b.pdf){toastV8('هذا المحتوى غير متاح للقراءة العامة حالياً. سيتم تفعيل الوصول للأعضاء عند اكتمال نظام الاستحقاقات.','i');return;}if(!b.url&&!b.pdf){toastV8('هذا الكتاب لا يملك رابط قراءة بعد','i');return;}const url=b.url||b.pdf;window.open(url,'_blank','noopener');if(typeof awardBadge==='function')awardBadge('library');if(typeof awardXP==='function')awardXP(5,'فتح كتاب 📚');};
  window.renderBooks=async function(){const g=byId('lib-grid');if(!g)return;const books=window._V8_BOOKS?.length?window._V8_BOOKS:((typeof BOOKS!=='undefined')?BOOKS:[]);const filtered=books.filter(b=>(libCat==='all'||b.category===libCat||b.cat===libCat)&&(!libQ||String(b.title||'').includes(libQ)||String(b.author||'').includes(libQ)));g.innerHTML=filtered.length?filtered.map(b=>'<div class="book-card" onclick="openBook(\''+esc(b.id)+'\')"><div class="book-cover '+esc(b.category||b.cat||'q')+'"><span>'+esc(b.icon||b.ic||'📗')+'</span>'+(b.badge?'<div class="book-badge '+esc(b.badge)+'">'+(b.badge==='free'?'مجاني':b.badge==='new'?'جديد':'🔥 رائج')+'</div>':'')+'</div><div class="book-info"><div class="book-title">'+esc(b.title)+'</div><div class="book-author">'+esc(b.author||'—')+'</div><div class="book-footer"><span class="book-pages">'+Number(b.pages||0)+' صفحة</span><button class="book-btn '+(b.is_free!==false&&b.free!==false?'read':'lock')+'">'+(b.is_free!==false&&b.free!==false?'📖 قراءة':'🔒 للأعضاء')+'</button></div></div></div>').join(''):'<div class="lib-empty" style="grid-column:1/-1"><div>📭</div><div>لا توجد كتب في هذه الفئة</div></div>';};
  async function loadPublicLibraryV8(){
    if(!_sb)return;
    const errs=[];
    let r=await _sb.from('public_library_books').select('*').order('sort_order').order('created_at');
    if(r.error){errs.push('view: '+r.error.message);r=await _sb.from('public_library_books').select('*');}
    if(r.error||!(r.data||[]).length){
      if(r.error)errs.push('view: '+r.error.message);
      const t=await _sb.from('library_books').select('*').eq('active',true).order('created_at',{ascending:false});
      if(!t.error&&(t.data||[]).length)r=t;else if(t.error)errs.push('table: '+t.error.message);
    }
    const data=r.error?[]:(r.data||[]);
    window._V8_BOOKS=data;
    try{injectDbBooksIntoSections(data);}catch(e){errs.push('inject: '+(e.message||e));}
    try{const p=window.renderBooks&&window.renderBooks();if(p&&p.catch)p.catch(()=>{});}catch(e){}
    window._LIB_DIAG={count:data.length,errors:errs};
    if(errs.length||!data.length)console.warn('library v20:',window._LIB_DIAG);
    if(typeof isAdm!=='undefined'&&isAdm&&(!data.length))toastV8('تنبيه للمدير: لم تُحمَّل كتب المكتبة من القاعدة'+(errs.length?' — '+errs.join(' | '):' (صفر كتاب)'),'e');
  }
  window.loadPublicLibraryV8=loadPublicLibraryV8;
  /* v20 — صفحة المكتبة تعرض أقساماً ثابتة ولا تحوي lib-grid الذي يرسم فيه renderBooks؛
     فكتب القاعدة لم تكن تظهر إطلاقاً. نحقنها في القسم المطابق، في أول القائمة. */
  function injectDbBooksIntoSections(books){
    const map={q:'quran',quran:'quran',l:'arabic',arabic:'arabic',s:'islamic',islamic:'islamic',lang:'lang',edu:'edu',kids:'edu'};
    document.querySelectorAll('.lib-card[data-db-book]').forEach(x=>x.remove());
    (books||[]).slice().reverse().forEach(b=>{
      if(b.active===false)return;
      let url=String(b.url||b.link||b.file_url||'').trim();if(/^www\./i.test(url))url='https://'+url;if(url.startsWith('/'))url=location.origin+url;if(!/^https?:\/\//i.test(url))return;const isPdf=/\.pdf(\?|#|$)/i.test(url);
      const grid=document.querySelector('#lib-sec-'+(map[b.category||b.cat]||'edu')+' .lib-grid');if(!grid)return;
      const card=document.createElement('div');card.className='lib-card';card.setAttribute('data-db-book','1');
      card.onclick=()=>window.open(url,'_blank','noopener');
      card.style.position='relative';
      card.innerHTML=(isPdf?'<span style="position:absolute;top:.4rem;left:.4rem;font-size:.5rem;font-weight:800;letter-spacing:.06em;color:#D4AF6A;background:rgba(212,175,106,.14);border:1px solid rgba(212,175,106,.35);border-radius:6px;padding:.1rem .3rem">PDF</span>':'')+'<div class="lib-ic">'+esc(b.icon||'📗')+'</div><div class="lib-nm">'+esc(b.title||'')+'</div><div class="lib-au">'+esc(b.author||'—')+'</div>';
      grid.insertBefore(card,grid.firstChild);
    });
  }
  async function loadSectionsV8(){if(!_sb||typeof HD==='undefined')return;const {data,error}=await _sb.from('learning_sections').select('category,icon,name,level,sort_order').eq('active',true).order('category').order('sort_order');if(error||!data?.length)return;const grouped={};data.forEach(x=>(grouped[x.category]||(grouped[x.category]=[])).push({id:x.id,ic:x.icon,nm:x.name,lv:x.level}));Object.keys(grouped).forEach(k=>{if(HD[k])HD[k].secs=grouped[k];else HD[k]={secs:grouped[k],nid:grouped[k].length+1};try{renderH(k);}catch(e){}});}
  async function loadGroupClassesV8(){if(!_sb||typeof GROUP_CLASSES==='undefined')return;const {data,error}=await _sb.from('public_group_classes').select('*').order('created_at',{ascending:false});if(error||!data)return;GROUP_CLASSES=data.map(g=>({id:g.id,title:g.title,teacher:g.teacher_name,teacher_id:g.teacher_id,day:g.day,time:g.time,dur:g.duration,max:g.max_students,cur:g.current_students,price:Number(g.price||0),meet:g.meeting_type,level:g.level,subj:g.subject,meeting_link:null}));renderGroupClasses();}
  async function loadPublicContentV8(){await Promise.allSettled([loadPublicLibraryV8(),loadSectionsV8(),loadGroupClassesV8()]);}
  window.loadPublicContentV8=loadPublicContentV8;

  /* Prevent the old fake card handler from claiming a payment succeeded. */
  window.submitCardPayment=function(){toastV8('الدفع بالبطاقة غير مفعّل حالياً. استخدم وسيلة الدفع الظاهرة في صفحة الحجز.','i');};

  /* Seed/migration is never automatic. The SQL migration is explicit and idempotent. */
  document.addEventListener('DOMContentLoaded',()=>setTimeout(()=>{loadPublicContentV8();loadTeachersFromDBV8().then(ok=>{/* [إصلاح F4] عرض القائمة المحدّثة */if(ok&&typeof renderTeachers==='function'){renderTeachers('teachers-list');renderTeachers('teachers-list-public');}});},900));
})();

