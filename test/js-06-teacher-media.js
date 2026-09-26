
(function(){
'use strict';

/* ---------- Teacher media: real fields, previews, safe validation ---------- */
function byId(id){return document.getElementById(id)}
window.previewJoinPhoto=function(input){
  const f=input?.files?.[0], box=byId('join-photo-preview'); if(!box||!f)return;
  if(!/^image\/(jpeg|png|webp)$/.test(f.type)){input.value='';toast('صيغة الصورة غير مدعومة. استخدم JPG أو PNG أو WebP.','e');return;}
  if(f.size>5*1024*1024){input.value='';toast('الحد الأقصى للصورة 5MB.','e');return;}
  const u=URL.createObjectURL(f); box.innerHTML='<img alt="معاينة الصورة" src="'+u+'" style="width:100%;height:100%;object-fit:cover">'; box.dataset.ready='1';
  const n=byId('join-photo-name'); if(n)n.textContent=f.name;
};
window.previewJoinVideo=function(input){
  const f=input?.files?.[0], box=byId('join-video-preview'); if(!box||!f)return;
  if(!['video/mp4','video/webm','video/quicktime'].includes(f.type)){input.value='';toast('صيغة الفيديو غير مدعومة. استخدم MP4 أو WebM.','e');return;}
  if(f.size>50*1024*1024){input.value='';toast('الحد الأقصى للفيديو 50MB.','e');return;}
  const u=URL.createObjectURL(f); box.innerHTML='<video controls preload="metadata" style="width:100%;max-height:180px;border-radius:10px;background:#000"><source src="'+u+'" type="'+f.type+'"></video><div class="teacher-file-name">'+escapeHtml(f.name)+'</div>'; box.dataset.ready='1';
};
window.previewJoinCert=function(input){
  const f=input?.files?.[0], box=byId('join-cert-preview'); if(!box||!f)return;
  if(f.type!=='application/pdf'){input.value='';toast('الشهادة يجب أن تكون PDF.','e');return;}
  if(f.size>10*1024*1024){input.value='';toast('الحد الأقصى للشهادة 10MB.','e');return;}
  box.textContent='📄 '+f.name+' — جاهز للرفع';
};

async function uploadApplicationFile(file, applicationId, kind){
  if(!_sb||!file||!applicationId)return null;
  const rules={photo:{types:['image/jpeg','image/png','image/webp'],max:5*1024*1024,ext:'jpg'},video:{types:['video/mp4','video/webm','video/quicktime'],max:50*1024*1024,ext:'mp4'},certificate:{types:['application/pdf'],max:10*1024*1024,ext:'pdf'}};
  const r=rules[kind]; if(!r||!r.types.includes(file.type)||file.size>r.max)return null;
  const safeExt=(file.name.split('.').pop()||r.ext).toLowerCase().replace(/[^a-z0-9]/g,'')||r.ext;
  const path='teacher-applications/'+applicationId+'/'+kind+'-'+Date.now()+'.'+safeExt;
  try{
    const pr=byId('teacher-upload-progress'); if(pr)pr.style.display='block';
    const {error}=await _sb.storage.from('manarat-media').upload(path,file,{upsert:false,contentType:file.type});
    if(error)throw error;
    const {data}=_sb.storage.from('manarat-media').getPublicUrl(path);
    if(pr)pr.style.display='none';
    return data?.publicUrl||null;
  }catch(e){
    const pr=byId('teacher-upload-progress'); if(pr)pr.style.display='none';
    console.warn('teacher application media upload:',e);
    return null;
  }
}

/* Replace the old submit handler with a version that actually handles media. */
window.submitTeacher=async function(){
  const v=id=>byId(id)?.value?.trim()||'';
  const nm=v('t-nm'), em=v('t-em'), wa=v('t-wa'), sp=byId('t-sp')?.value||'';
  const country=v('t-country'), gender=byId('t-gender')?.value||'', exp=byId('t-exp')?.value||'';
  const price=Number(byId('t-price')?.value||12), qual=v('t-qual'), bio=v('t-bio'), certLink=v('t-cert'), yt=v('join-yt-link');
  const langs=[...document.querySelectorAll('input[name="t-langs"]:checked')].map(x=>x.value);
  const ages=[...document.querySelectorAll('input[name="t-ages"]:checked')].map(x=>x.value);
  const photo=byId('join-photo-input')?.files?.[0]||null, video=byId('join-video-input')?.files?.[0]||null, cert=byId('join-cert-input')?.files?.[0]||null;

  if(!nm||!em||!wa||!sp||!country||!gender||!exp){toast('أكمل الحقول المطلوبة (*) كلها.','e');return;}
  if(!/^\S+@\S+\.\S+$/.test(em)){toast('أدخل بريداً إلكترونياً صحيحاً.','e');return;}
  if(wa.replace(/\D/g,'').length<8){toast('أدخل رقم واتساب صحيحاً مع رمز الدولة.','e');return;}
  if(!langs.length){toast('اختر لغة تدريس واحدة على الأقل.','e');return;}
  if(!ages.length){toast('اختر فئة عمرية واحدة على الأقل.','e');return;}
  if(price<5||price>200){toast('السعر المقترح يجب أن يكون بين $5 و$200.','e');return;}

  toast('جاري إرسال طلبك...','i');
  let saved=false, photoUrl=null, videoUrl=null, certUrl=null;
  if(_sb){
    // مجلد الملفات يُولَّد محلياً — لا نحتاج قراءة الصف بعد إدراجه (الزائر لا يملك صلاحية القراءة)
    const folder=(crypto?.randomUUID?.()||('app-'+Date.now()+'-'+Math.random().toString(36).slice(2)));
    try{
      [photoUrl,videoUrl,certUrl]=await Promise.all([
        uploadApplicationFile(photo,folder,'photo'),
        uploadApplicationFile(video,folder,'video'),
        uploadApplicationFile(cert,folder,'certificate')
      ]);
    }catch(e){console.warn('application uploads:',e);}
    const base={name:nm,email:em,whatsapp:wa,specialty:sp,price_per_hour:price,qualification:qual,bio,status:'pending',languages:langs};
    const full={...base,country,gender,experience:exp,age_groups:ages,
      photo_url:photoUrl||null, video_url:videoUrl||yt||null, certificate_url:certUrl||certLink||null};
    try{
      let {error}=await _sb.from('teacher_applications').insert([full]);
      if(error && /column|schema cache/i.test(error.message||'')){
        console.warn('teacher_applications: extra columns missing, saving base fields:',error.message);
        ({error}=await _sb.from('teacher_applications').insert([base]));
      }
      if(error) throw error;
      saved=true;
    }catch(e){ console.warn('teacher application insert:',e.message||e); }
  }

  // الرسالة الكاملة للإدارة
  const L=[
    '🎓 طلب انضمام معلم جديد — منارة المعرفة',
    '','👤 الاسم: '+nm,'🚻 الجنس: '+gender,'🌍 الدولة: '+country,'📧 البريد: '+em,'📱 واتساب: '+wa,
    '','🎯 التخصص: '+sp,'🌐 لغات التدريس: '+langs.join('، '),'👥 الفئات العمرية: '+ages.join('، '),
    '⏳ الخبرة: '+exp,'💰 السعر المقترح: $'+price+' / 60 دقيقة',
    '📜 المؤهل: '+(qual||'—'),
    '','📝 نبذة:',(bio?bio.slice(0,700):'—')
  ];
  if(photoUrl) L.push('','📷 الصورة: '+photoUrl);
  if(videoUrl||yt) L.push('🎬 الفيديو: '+(videoUrl||yt));
  if(certUrl||certLink) L.push('📄 الشهادة: '+(certUrl||certLink));
  if(!saved) L.push('','⚠️ لم يُحفظ الطلب في قاعدة البيانات — هذه الرسالة هي النسخة الوحيدة.');
  const waUrl='https://wa.me/212681883238?text='+encodeURIComponent(L.join('\n'));

  showTeacherWelcome(nm, waUrl, saved);

  ['t-nm','t-em','t-wa','t-country','t-price','t-qual','t-bio','t-cert','join-yt-link'].forEach(id=>{const el=byId(id);if(el)el.value='';});
  ['t-sp','t-gender','t-exp'].forEach(id=>{const el=byId(id);if(el)el.selectedIndex=0;});
  document.querySelectorAll('input[name="t-langs"],input[name="t-ages"]').forEach(c=>c.checked=false);
  ['join-photo-input','join-video-input','join-cert-input'].forEach(id=>{const el=byId(id);if(el)el.value='';});
  const pp=byId('join-photo-preview');if(pp)pp.innerHTML='<span style="font-size:1.4rem">📷</span>';
  const vp=byId('join-video-preview');if(vp)vp.innerHTML=''; const cp=byId('join-cert-preview');if(cp)cp.textContent='';
};

// رسالة الترحيب — وزر واتساب بضغطة المستخدم نفسه (المتصفح يمنع الفتح التلقائي بعد الانتظار)
function showTeacherWelcome(name, waUrl, saved){
  byId('teacher-welcome-ov')?.remove();
  const ov=document.createElement('div'); ov.id='teacher-welcome-ov';
  ov.style.cssText='position:fixed;inset:0;z-index:99990;background:rgba(0,0,0,.72);display:flex;align-items:center;justify-content:center;padding:1rem';
  ov.innerHTML='<div style="background:var(--bg2,#0f1f1c);border:1px solid rgba(212,175,106,.35);border-radius:18px;max-width:420px;width:100%;padding:1.4rem 1.2rem;text-align:center;max-height:90vh;overflow:auto">'
   +'<div style="font-size:2.4rem;margin-bottom:.4rem">🌙</div>'
   +'<div style="font-family:\'Amiri\',serif;font-size:1.3rem;font-weight:700;color:var(--gl);margin-bottom:.6rem">أهلاً وسهلاً بك يا '+escapeHtml(name)+'</div>'
   +'<div style="font-size:.78rem;line-height:1.9;color:var(--tx,#eee);text-align:right">'
   +'جزاك الله خيراً على رغبتك في الانضمام إلى أسرة <b>منارة المعرفة</b>، وإسهامك في تعليم كتاب الله ولغته لمن لا يتكلمون العربية.<br><br>'
   +(saved?'✅ وصلنا طلبك، وسنراجعه خلال <b>٢٤ إلى ٤٨ ساعة</b>.':'⚠️ تعذّر حفظ الطلب آلياً، لكن لا بأس: أرسله عبر واتساب وسنتكفّل به.')+'<br><br>'
   +'<b>الخطوة الأخيرة والضرورية:</b> اضغط الزر أدناه لإرسال بياناتك إلى الإدارة عبر واتساب — فهو قناة تواصلنا معك.<br><br>'
   +'<b>بعد القبول:</b> ننشئ لك حساب معلم ونرسل إليك بيانات الدخول، ثم تكمل ملفك وتحدد أيامك وساعاتك.'
   +'</div>'
   +'<a href="'+waUrl+'" target="_blank" rel="noopener" onclick="setTimeout(()=>{document.getElementById(\'teacher-welcome-ov\')?.remove();goP(\'p-home\');},600)" style="display:block;margin-top:1.1rem;background:#25D366;color:#fff;font-weight:800;border-radius:12px;padding:.85rem;text-decoration:none;font-size:.9rem">📲 أرسل طلبي عبر واتساب</a>'
   +'<button onclick="document.getElementById(\'teacher-welcome-ov\')?.remove()" style="margin-top:.6rem;background:none;border:none;color:var(--tm);font-size:.72rem;cursor:pointer">إغلاق</button>'
   +'</div>';
  document.body.appendChild(ov);
}

/* ---------- Launch badge: explicit admin setting + reliable UI application ---------- */
function ensureLaunchSetting(){
  const host=byId('asite-body'); if(!host||byId('v14-launch-setting'))return;
  const card=document.createElement('div'); card.id='v14-launch-setting'; card.className='launch-settings-card';
  card.innerHTML='<div style="font-size:.75rem;font-weight:800;color:var(--gl)">🚀 شارة مرحلة الإطلاق</div><div style="font-size:.62rem;color:var(--tm);line-height:1.6;margin-top:.25rem">إظهار أو إخفاء شارة «مرحلة الإطلاق» في الصفحة الرئيسية، مع حفظ الاختيار مركزياً.</div><div style="display:flex;align-items:center;justify-content:space-between;margin-top:.65rem"><label for="cfg-launch-badge-v14" style="font-size:.7rem;font-weight:700">إظهار الشارة للزوار</label><input type="checkbox" id="cfg-launch-badge-v14" style="width:18px;height:18px;cursor:pointer"></div><div class="launch-preview"><span class="dot"></span><span style="font-size:.65rem;color:var(--gl);font-weight:700">🚀 منصة في طور الإطلاق — كن من الأوائل</span></div><div class="lang-status">الحالة محفوظة في إعدادات الموقع وليست مجرد تفضيل محلي.</div>';
  host.insertBefore(card,host.firstChild);
  const c=byId('cfg-launch-badge-v14'); if(c)c.checked=SITE_CONFIG.launchBadge!==false;
}
const oldLoad=window.loadAdminSiteSettings;
window.loadAdminSiteSettings=function(){if(typeof oldLoad==='function')oldLoad();setTimeout(ensureLaunchSetting,30);};
const oldSaveSiteConfig=window.saveSiteConfig;
window.saveSiteConfig=async function(){
  const v14=byId('cfg-launch-badge-v14');
  const legacy=byId('cfg-launch-badge');
  if(v14&&legacy) legacy.checked=v14.checked;
  if(v14) SITE_CONFIG.launchBadge=v14.checked;
  if(typeof oldSaveSiteConfig==='function') await oldSaveSiteConfig();
  setTimeout(()=>{const b=byId('cfg-launch-badge-v14');if(b)b.checked=SITE_CONFIG.launchBadge!==false;},50);
};

/* ---------- Full-platform language layer ---------- */
const V14_NAV={ar:['الرئيسية','الفصول','المكتبة','الحجوزات','لوحتي','حسابي'],en:['Home','Halls','Library','Bookings','Dashboard','Account'],fr:['Accueil','Cours','Bibliothèque','Réservations','Tableau de bord','Compte'],es:['Inicio','Clases','Biblioteca','Reservas','Panel','Cuenta'],de:['Startseite','Kurse','Bibliothek','Buchungen','Dashboard','Konto'],nl:['Home','Lessen','Bibliotheek','Boekingen','Dashboard','Account'],tr:['Ana Sayfa','Dersler','Kütüphane','Rezervasyonlar','Panel','Hesap'],it:['Home','Corsi','Biblioteca','Prenotazioni','Dashboard','Account'],pt:['Início','Aulas','Biblioteca','Reservas','Painel','Conta'],id:['Beranda','Kelas','Perpustakaan','Pemesanan','Dasbor','Akun']};
const P={
 en:{'الإعدادات':'Settings','اللغة':'Language','الإشعارات':'Notifications','إشعارات الحجوزات':'Booking notifications','تذكير اليومي':'Daily reminder','الحجوزات':'Bookings','الفصول':'Halls','المكتبة':'Library','لوحتي':'Dashboard','حسابي':'Account','الرئيسية':'Home','المعلمون':'Teachers','انضم كمعلم':'Join as a Teacher','البحث عن معلم':'Find a Teacher','ملفي الشخصي':'My Profile','المفضلة':'Favorites','تسجيل الدخول':'Login','إنشاء حساب':'Create account','تسجيل الخروج':'Log out','حفظ':'Save','إلغاء':'Cancel','حذف':'Delete','تعديل':'Edit','إرسال':'Submit','التالي':'Next','السابق':'Back','إغلاق':'Close','اختر تخصصك':'Choose your specialty','لغات التدريس':'Teaching languages','سعر الحصة':'Lesson price','المؤهل العلمي':'Academic qualification','نبذة عنك':'About you','رابط شهاداتك':'Certificate link','رفع صورة':'Upload photo','رفع فيديو':'Upload video','رفع شهادة أو مؤهل':'Upload certificate','تقديم طلب الانضمام':'Submit application','نموذج التسجيل':'Application form','مرحلة الإطلاق':'Launch phase','شارة مرحلة الإطلاق':'Launch badge','إظهار الشارة للزوار':'Show badge to visitors','حفظ جميع التغييرات':'Save all changes','اختر الموعد':'Choose a time','ملخص الحجز':'Booking summary','الدفع':'Payment','اختر الفصل':'Choose a hall','سعر الحصة الواحدة':'Price per lesson','الاسم الكامل':'Full name','البريد الإلكتروني':'Email','رقم الواتساب':'WhatsApp number','الدعم الدراسي':'Academic support','المهارات المهنية':'Professional skills','العلوم الشرعية':'Islamic sciences','اللغة العربية':'Arabic language','اللغات العالمية':'World languages','القرآن والتجويد':'Quran & Tajweed','عرض الكل ›':'View all ›','عن المنصة':'About the platform','شروط الخدمة':'Terms of Service','سياسة الخصوصية':'Privacy Policy','دعم واتساب':'WhatsApp support'},
 fr:{'الإعدادات':'Paramètres','اللغة':'Langue','الإشعارات':'Notifications','الحجوزات':'Réservations','الفصول':'Cours','المكتبة':'Bibliothèque','لوحتي':'Tableau de bord','حسابي':'Compte','الرئيسية':'Accueil','المعلمون':'Enseignants','انضم كمعلم':'Devenir enseignant','ملفي الشخصي':'Mon profil','تسجيل الدخول':'Connexion','إنشاء حساب':'Créer un compte','تسجيل الخروج':'Déconnexion','حفظ':'Enregistrer','إلغاء':'Annuler','حذف':'Supprimer','تعديل':'Modifier','إرسال':'Envoyer','التالي':'Suivant','السابق':'Retour','إغلاق':'Fermer','لغات التدريس':'Langues d’enseignement','سعر الحصة':'Prix du cours','المؤهل العلمي':'Qualification','نبذة عنك':'À propos de vous','رفع صورة':'Téléverser une photo','رفع فيديو':'Téléverser une vidéo','رفع شهادة أو مؤهل':'Téléverser un certificat','تقديم طلب الانضمام':'Envoyer la candidature','نموذج التسجيل':'Formulaire de candidature','مرحلة الإطلاق':'Phase de lancement','شارة مرحلة الإطلاق':'Badge de lancement','إظهار الشارة للزوار':'Afficher le badge','حفظ جميع التغييرات':'Enregistrer les modifications','اختر الموعد':'Choisir l’horaire','ملخص الحجز':'Résumé de réservation','الدفع':'Paiement','اختر الفصل':'Choisir un cours'},
 es:{'الإعدادات':'Configuración','اللغة':'Idioma','الإشعارات':'Notificaciones','الحجوزات':'Reservas','الفصول':'Clases','المكتبة':'Biblioteca','لوحتي':'Panel','حسابي':'Cuenta','الرئيسية':'Inicio','المعلمون':'Profesores','انضم كمعلم':'Unirse como profesor','ملفي الشخصي':'Mi perfil','تسجيل الدخول':'Iniciar sesión','إنشاء حساب':'Crear cuenta','تسجيل الخروج':'Cerrar sesión','حفظ':'Guardar','إلغاء':'Cancelar','حذف':'Eliminar','تعديل':'Editar','إرسال':'Enviar','التالي':'Siguiente','السابق':'Atrás','إغلاق':'Cerrar','لغات التدريس':'Idiomas de enseñanza','سعر الحصة':'Precio de la clase','المؤهل العلمي':'Cualificación','نبذة عنك':'Sobre ti','رفع صورة':'Subir foto','رفع فيديو':'Subir vídeo','رفع شهادة أو مؤهل':'Subir certificado','تقديم طلب الانضمام':'Enviar solicitud','نموذج التسجيل':'Formulario','مرحلة الإطلاق':'Fase de lanzamiento','شارة مرحلة الإطلاق':'Insignia de lanzamiento','إظهار الشارة للزوار':'Mostrar insignia','حفظ جميع التغييرات':'Guardar cambios','اختر الموعد':'Elegir horario','ملخص الحجز':'Resumen de reserva','الدفع':'Pago','اختر الفصل':'Elegir clase'},
 de:{'الإعدادات':'Einstellungen','اللغة':'Sprache','الإشعارات':'Benachrichtigungen','الحجوزات':'Buchungen','الفصول':'Kurse','المكتبة':'Bibliothek','لوحتي':'Dashboard','حسابي':'Konto','الرئيسية':'Startseite','المعلمون':'Lehrkräfte','انضم كمعلم':'Als Lehrkraft beitreten','ملفي الشخصي':'Mein Profil','تسجيل الدخول':'Anmelden','إنشاء حساب':'Konto erstellen','تسجيل الخروج':'Abmelden','حفظ':'Speichern','إلغاء':'Abbrechen','حذف':'Löschen','تعديل':'Bearbeiten','إرسال':'Senden','التالي':'Weiter','السابق':'Zurück','إغلاق':'Schließen','لغات التدريس':'Unterrichtssprachen','سعر الحصة':'Unterrichtspreis','المؤهل العلمي':'Qualifikation','نبذة عنك':'Über dich','رفع صورة':'Foto hochladen','رفع فيديو':'Video hochladen','رفع شهادة أو مؤهل':'Zertifikat hochladen','تقديم طلب الانضمام':'Bewerbung senden','نموذج التسجيل':'Bewerbungsformular','مرحلة الإطلاق':'Startphase','شارة مرحلة الإطلاق':'Start-Badge','إظهار الشارة للزوار':'Badge anzeigen','حفظ جميع التغييرات':'Änderungen speichern','اختر الموعد':'Zeit wählen','ملخص الحجز':'Buchungsübersicht','الدفع':'Zahlung','اختر الفصل':'Kurs wählen'},
 tr:{'الإعدادات':'Ayarlar','اللغة':'Dil','الإشعارات':'Bildirimler','الحجوزات':'Rezervasyonlar','الفصول':'Dersler','المكتبة':'Kütüphane','لوحتي':'Panel','حسابي':'Hesap','الرئيسية':'Ana Sayfa','المعلمون':'Öğretmenler','انضم كمعلم':'Öğretmen olarak katıl','ملفي الشخصي':'Profilim','تسجيل الدخول':'Giriş','إنشاء حساب':'Hesap oluştur','تسجيل الخروج':'Çıkış','حفظ':'Kaydet','إلغاء':'İptal','حذف':'Sil','تعديل':'Düzenle','إرسال':'Gönder','التالي':'İleri','السابق':'Geri','إغلاق':'Kapat','لغات التدريس':'Öğretim dilleri','سعر الحصة':'Ders fiyatı','المؤهل العلمي':'Akademik yeterlilik','نبذة عنك':'Hakkınızda','رفع صورة':'Fotoğraf yükle','رفع فيديو':'Video yükle','رفع شهادة أو مؤهل':'Sertifika yükle','تقديم طلب الانضمام':'Başvuruyu gönder','نموذج التسجيل':'Başvuru formu','مرحلة الإطلاق':'Başlangıç aşaması','شارة مرحلة الإطلاق':'Başlangıç rozeti','إظهار الشارة للزوار':'Rozeti göster','حفظ جميع التغييرات':'Tüm değişiklikleri kaydet','اختر الموعد':'Saat seç','ملخص الحجز':'Rezervasyon özeti','الدفع':'Ödeme','اختر الفصل':'Ders seç'},
 nl:{'الإعدادات':'Instellingen','اللغة':'Taal','الإشعارات':'Meldingen','الحجوزات':'Boekingen','الفصول':'Lessen','المكتبة':'Bibliotheek','لوحتي':'Dashboard','حسابي':'Account','الرئيسية':'Home','المعلمون':'Leraren','انضم كمعلم':'Word leraar','ملفي الشخصي':'Mijn profiel','تسجيل الدخول':'Inloggen','إنشاء حساب':'Account maken','تسجيل الخروج':'Uitloggen','حفظ':'Opslaan','إلغاء':'Annuleren','حذف':'Verwijderen','تعديل':'Bewerken','إرسال':'Versturen','التالي':'Volgende','السابق':'Terug','إغلاق':'Sluiten','لغات التدريس':'Onderwijstalen','سعر الحصة':'Lesprijs','المؤهل العلمي':'Kwalificatie','نبذة عنك':'Over jou','رفع صورة':'Foto uploaden','رفع فيديو':'Video uploaden','رفع شهادة أو مؤهل':'Certificaat uploaden','تقديم طلب الانضمام':'Aanvraag versturen','نموذج التسجيل':'Aanmeldformulier','مرحلة الإطلاق':'Lancering','شارة مرحلة الإطلاق':'Lancering-badge','إظهار الشارة للزوار':'Badge tonen','حفظ جميع التغييرات':'Alle wijzigingen opslaan','اختر الموعد':'Tijd kiezen','ملخص الحجز':'Boekingsoverzicht','الدفع':'Betaling','اختر الفصل':'Les kiezen'},
 id:{'الإعدادات':'Pengaturan','اللغة':'Bahasa','الإشعارات':'Notifikasi','الحجوزات':'Pemesanan','الفصول':'Kelas','المكتبة':'Perpustakaan','لوحتي':'Dasbor','حسابي':'Akun','الرئيسية':'Beranda','المعلمون':'Guru','انضم كمعلم':'Bergabung sebagai guru','ملفي الشخصي':'Profil saya','تسجيل الدخول':'Masuk','إنشاء حساب':'Buat akun','تسجيل الخروج':'Keluar','حفظ':'Simpan','إلغاء':'Batal','حذف':'Hapus','تعديل':'Edit','إرسال':'Kirim','التالي':'Berikutnya','السابق':'Kembali','إغلاق':'Tutup','لغات التدريس':'Bahasa pengajaran','سعر الحصة':'Harga pelajaran','المؤهل العلمي':'Kualifikasi','نبذة عنك':'Tentang Anda','رفع صورة':'Unggah foto','رفع فيديو':'Unggah video','رفع شهادة أو مؤهل':'Unggah sertifikat','تقديم طلب الانضمام':'Kirim pendaftaran','نموذج التسجيل':'Formulir pendaftaran','مرحلة الإطلاق':'Tahap peluncuran','شارة مرحلة الإطلاق':'Lencana peluncuran','إظهار الشارة للزوار':'Tampilkan lencana','حفظ جميع التغييرات':'Simpan semua perubahan','اختر الموعد':'Pilih waktu','ملخص الحجز':'Ringkasan pemesanan','الدفع':'Pembayaran','اختر الفصل':'Pilih kelas'}
};
window.__V14P=P;
window.__v14Translate=function(l){try{translateTextNodes(l);}catch(e){}};
function translateTextNodes(lang){
  const dict=P[lang]; if(!dict)return;
  const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
  const nodes=[]; let n; while(n=walker.nextNode())nodes.push(n);
  const EN=(lang!=='ar'&&P.en)?P.en:{};
  window._v14Orig=window._v14Orig||new WeakMap();
  nodes.forEach(node=>{
    if(node.parentElement?.closest('script,style,textarea,[data-no-translate]'))return;
    if(!window._v14Orig.has(node)) window._v14Orig.set(node,node.nodeValue);
    const original=window._v14Orig.get(node);
    const key=original.trim();
    if(!key)return;
    const tr=dict[key]||EN[key];
    node.nodeValue=tr?original.replace(key,tr):original;
  });
  document.querySelectorAll('input[placeholder],textarea[placeholder],button[aria-label],button[title],a[aria-label]').forEach(el=>{
    ['placeholder','aria-label','title'].forEach(a=>{
      if(!el.hasAttribute(a))return;
      const marker='data-v14-original-'+a;
      if(!el.hasAttribute(marker))el.setAttribute(marker,el.getAttribute(a)||'');
      const original=el.getAttribute(marker)||'';
      const tr=dict[original]||(lang!=='ar'&&P.en?P.en[original]:'');
      el.setAttribute(a,tr||original);
    });
  });
}
const originalApplyLang=window.applyLang;
window.applyLang=function(lang){
  if(typeof originalApplyLang==='function')originalApplyLang(lang);
  const labels=V14_NAV[lang]||V14_NAV.ar;
  document.querySelectorAll('.ni-lb').forEach((el,i)=>{if(labels[i])el.textContent=labels[i];});
  document.querySelectorAll('.ni').forEach((el,i)=>{if(labels[i]){el.setAttribute('aria-label',labels[i]);el.setAttribute('title',labels[i]);}});
  setTimeout(()=>{translateTextNodes(lang); if(lang==='ar')location.reload();},20);
  try{localStorage.setItem('mm_lang',lang);}catch(e){}
};

/* Make the settings selector expose every language that actually has a platform pack. */
function expandLanguageSelector(){
  const sel=document.getElementById('lsel'); if(!sel)return;
  const langs=[['ar','🇸🇦 العربية'],['en','🇬🇧 English'],['fr','🇫🇷 Français'],['es','🇪🇸 Español'],['de','🇩🇪 Deutsch'],['nl','🇳🇱 Nederlands'],['tr','🇹🇷 Türkçe'],['it','🇮🇹 Italiano'],['pt','🇵🇹 Português'],['id','🇮🇩 Bahasa Indonesia']];
  const current=sel.value; sel.innerHTML=langs.map(x=>'<option value="'+x[0]+'">'+x[1]+'</option>').join(''); sel.value=current||'ar';
}
function moveTeacherMediaBlock(){
  const input=byId('join-photo-input');
  const button=[...document.querySelectorAll('button')].find(b=>(b.textContent||'').includes('تقديم طلب الانضمام'));
  if(!input||!button)return;
  const media=input.closest('div[style*='+'\"padding:0 1rem .85rem\"'+']');
  if(media&&button.parentElement===media.parentElement) button.parentElement.insertBefore(media,button);
}
function bootV14(){expandLanguageSelector();ensureLaunchSetting();moveTeacherMediaBlock();const saved=localStorage.getItem('mm_lang');if(saved&&saved!=='ar')setTimeout(()=>translateTextNodes(saved),80);}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootV14);else bootV14();
})();
