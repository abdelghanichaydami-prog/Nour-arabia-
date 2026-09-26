
'use strict';
// ════════════════════════════════════════
//  نظام الإشعارات الموحّد
// ════════════════════════════════════════

/* ===================== الإشعارات — من القاعدة (user_notifications) =====================
   تُنشئها مشغّلات الخادم عند كل حدث (حجز، دفع، إلغاء، تغيير موعد، تسجيل، إشعار عام)،
   فتصل إلى صاحبها على أي جهاز. الواجهة تقرأ وتعلّم كمقروء وتحذف فقط. */
const NOTIF_ICONS={booking:'🗓',payment:'💳',paid:'✅',cancel:'❌',reschedule:'🔄',completed:'🎓',welcome:'🌙',user:'👤',application:'📝',teacher:'🎓',info:'🔔',promo:'🎁',alert:'⚠️',new:'🆕',success:'✅'};
let _NOTIFS=[];let _nfUid=null;let _nfChan=null;let _nfBusy=false;let _nfAgain=false;
try{localStorage.removeItem('mm_notifs');}catch(e){}

function _nfEsc(x){const d=document.createElement('div');d.textContent=x==null?'':String(x);return d.innerHTML;}
function _nfAgo(iso){
  const d=new Date(iso);if(isNaN(d))return '';
  const s=Math.max(0,(Date.now()-d.getTime())/1000);
  if(s<60)return 'الآن';
  if(s<3600)return 'منذ '+Math.floor(s/60)+' دقيقة';
  if(s<86400)return 'منذ '+Math.floor(s/3600)+' ساعة';
  if(s<604800)return 'منذ '+Math.floor(s/86400)+' يوم';
  return d.toLocaleDateString('ar-u-nu-latn',{day:'numeric',month:'short',year:'numeric'});
}
function _nfLogged(){return !!(typeof CU!=='undefined'&&CU&&CU.id&&typeof _sb!=='undefined'&&_sb);}

async function fetchNotifs(){
  if(!_nfLogged()){_NOTIFS=[];updateNotifBadge();loadNotifsPage();return;}
  if(_nfBusy){_nfAgain=true;return;}
  _nfBusy=true;
  try{
    const {data,error}=await _sb.from('user_notifications')
      .select('id,type,title,body,link,read_at,created_at,ref_table,ref_id')
      .order('created_at',{ascending:false}).limit(60);
    if(error)throw error;
    const list=data||[];
    const ids=[...new Set(list.filter(n=>n.ref_table==='bookings'&&n.ref_id).map(n=>n.ref_id))];
    if(ids.length){
      try{
        const {data:bks}=await _sb.from('bookings').select('id,starts_at,booking_time').in('id',ids);
        const m=new Map((bks||[]).map(b=>[String(b.id),b]));
        list.forEach(n=>{const b=n.ref_table==='bookings'&&m.get(String(n.ref_id));if(b&&b.starts_at){const d=new Date(b.starts_at);if(fmtLocalTime(d)!==String(b.booking_time||'').slice(0,5))n._local=fmtLocalDay(d)+' • '+fmtLocalTime(d);}});
      }catch(e){}
    }
    _NOTIFS=list;
  }catch(e){console.warn('notifications:',e.message||e);}
  finally{_nfBusy=false;}
  updateNotifBadge();loadNotifsPage();
  if(_nfAgain){_nfAgain=false;setTimeout(fetchNotifs,50);}
}
function _nfSubscribe(uid){
  try{if(_nfChan&&_sb)_sb.removeChannel(_nfChan);}catch(e){}
  _nfChan=null;
  if(!uid||!_sb||typeof _sb.channel!=='function')return;
  try{
    _nfChan=_sb.channel('nf-'+uid)
      .on('postgres_changes',{event:'*',schema:'public',table:'user_notifications',filter:'user_id=eq.'+uid},()=>fetchNotifs())
      .subscribe();
  }catch(e){console.warn('notifications realtime:',e);}
}
function _nfSync(){
  const uid=_nfLogged()?CU.id:null;
  if(uid===_nfUid)return;
  _nfUid=uid;_NOTIFS=[];updateNotifBadge();loadNotifsPage();
  _nfSubscribe(uid);
  if(uid){try{_sb.rpc('set_my_timezone',{p_tz:getUserTZ()}).then(()=>{},()=>{});}catch(e){}}
  if(uid)fetchNotifs();
}
setInterval(_nfSync,1500);
setInterval(()=>{if(_nfUid&&document.visibilityState==='visible')fetchNotifs();},90000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&_nfUid)fetchNotifs();});
setTimeout(()=>{try{_sb&&_sb.auth.onAuthStateChange(()=>setTimeout(()=>{if(_nfUid){_nfSubscribe(_nfUid);fetchNotifs();}else _nfSync();},400));}catch(e){}},0);

// كانت تكتب في ذاكرة الهاتف؛ الآن الخادم يُنشئ الإشعار، فنكتفي بتحديث القائمة
function addNotif(){setTimeout(fetchNotifs,1500);}

function updateNotifBadge(){
  const unread=_NOTIFS.filter(n=>!n.read_at).length;
  ['ndot','notif-badge','notif-dot'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display=unread>0?'block':'none';});
  document.querySelectorAll('.notif-count').forEach(el=>{el.textContent=unread>99?'99+':(unread||'');el.style.display=unread>0?'':'none';});
  const tools=document.getElementById('notifs-tools');if(tools)tools.style.display=_NOTIFS.length?'flex':'none';
}

function _nfEmpty(title,sub){
  return '<div style="text-align:center;padding:3rem 1rem;color:var(--tm)"><div style="font-size:2.2rem;margin-bottom:.6rem">🔔</div>'
    +'<div style="font-size:.78rem;font-weight:700;margin-bottom:.3rem">'+title+'</div>'
    +(sub?'<div style="font-size:.68rem;line-height:1.6">'+sub+'</div>':'')+'</div>';
}
function loadNotifsPage(){
  const el=document.getElementById('notifs-list');if(!el)return;
  if(!_nfLogged()){el.innerHTML=_nfEmpty('سجّل الدخول لرؤية إشعاراتك','');return;}
  if(!_NOTIFS.length){el.innerHTML=_nfEmpty('لا إشعارات بعد','ستصلك هنا تنبيهات الحجوزات والدفع والتحديثات');return;}
  el.innerHTML=_NOTIFS.map(n=>{
    const unread=!n.read_at;
    const ic=NOTIF_ICONS[n.type]||'🔔';
    const bg=unread?'rgba(212,175,106,.07)':'rgba(255,255,255,.03)';
    const bd=unread?'rgba(212,175,106,.22)':'var(--bdl)';
    return '<div onclick="openNotif('+n.id+')" style="background:'+bg+';border:1px solid '+bd+';border-radius:12px;padding:.7rem .75rem;margin-bottom:.45rem;display:flex;gap:.6rem;align-items:flex-start;cursor:pointer">'
      +'<div style="font-size:1.1rem;flex-shrink:0;line-height:1.3">'+ic+'</div>'
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-size:.74rem;font-weight:'+(unread?'800':'600')+';line-height:1.5">'+_nfEsc(n.title)+'</div>'
      +(n.body?'<div dir="rtl" style="font-size:.68rem;color:var(--tm);line-height:1.7;margin-top:.15rem;word-break:break-word;white-space:pre-line;text-align:right">'+_nfEsc(n.body)+'</div>':'')
      +(n._local?'<div style="font-size:.64rem;color:var(--gl);margin-top:.2rem">🕐 بتوقيتك: '+_nfEsc(n._local)+'</div>':'')
      +'<div style="font-size:.58rem;color:var(--tm);margin-top:.3rem;display:flex;align-items:center;gap:.35rem">'
      +(unread?'<span style="width:6px;height:6px;border-radius:50%;background:var(--go);display:inline-block"></span>':'')
      +_nfAgo(n.created_at)+'</div>'
      +'</div>'
      +'<button type="button" aria-label="حذف الإشعار" onclick="event.stopPropagation();deleteNotif('+n.id+')" style="background:rgba(255,255,255,.05);border:1px solid var(--bdl);color:var(--tm);width:26px;height:26px;border-radius:8px;font-size:.72rem;cursor:pointer;flex-shrink:0;display:flex;align-items:center;justify-content:center">✕</button>'
      +'</div>';
  }).join('');
}

async function markNotifRead(id){
  const n=_NOTIFS.find(x=>x.id===id);
  if(!n||n.read_at)return;
  n.read_at=new Date().toISOString();updateNotifBadge();loadNotifsPage();
  try{const {error}=await _sb.from('user_notifications').update({read_at:n.read_at}).eq('id',id);if(error)throw error;}
  catch(e){n.read_at=null;updateNotifBadge();loadNotifsPage();}
}
function openNotif(id){
  const n=_NOTIFS.find(x=>x.id===id);if(!n)return;
  markNotifRead(id);
  if(n.link&&document.getElementById(n.link)&&typeof goP==='function')goP(n.link);
}
async function markAllRead(){
  if(!_nfLogged())return;
  const pending=_NOTIFS.filter(n=>!n.read_at);
  if(!pending.length){toast('لا توجد إشعارات غير مقروءة','i');return;}
  const now=new Date().toISOString();
  pending.forEach(n=>n.read_at=now);updateNotifBadge();loadNotifsPage();
  try{const {error}=await _sb.from('user_notifications').update({read_at:now}).eq('user_id',CU.id).is('read_at',null);if(error)throw error;toast('تم تعليم الكل كمقروء','s');}
  catch(e){toast('تعذّر التحديث: '+(e.message||e),'e');fetchNotifs();}
}
async function deleteNotif(id){
  if(!_nfLogged())return;
  const keep=_NOTIFS;_NOTIFS=_NOTIFS.filter(n=>n.id!==id);updateNotifBadge();loadNotifsPage();
  try{const {error}=await _sb.from('user_notifications').delete().eq('id',id);if(error)throw error;}
  catch(e){_NOTIFS=keep;updateNotifBadge();loadNotifsPage();toast('تعذّر الحذف: '+(e.message||e),'e');}
}
async function clearNotifs(){
  if(!_nfLogged()||!_NOTIFS.length)return;
  if(!confirm('حذف كل الإشعارات؟ لا يمكن التراجع.'))return;
  const keep=_NOTIFS;_NOTIFS=[];updateNotifBadge();loadNotifsPage();
  try{const {error}=await _sb.from('user_notifications').delete().eq('user_id',CU.id);if(error)throw error;toast('تم حذف الإشعارات','i');}
  catch(e){_NOTIFS=keep;updateNotifBadge();loadNotifsPage();toast('تعذّر الحذف: '+(e.message||e),'e');}
}
function openNotifs(){
  if(typeof goP==='function')goP('p-notifs');
  loadNotifsPage();fetchNotifs();
}

function sanitize(str){
  const d=document.createElement('div');
  d.textContent=str||'';
  return d.innerHTML;
}
const HD={
  q:{secs:[{id:1,ic:'📖',nm:'أحكام التجويد',lv:'مبتدئ—متقدم'},{id:2,ic:'🎵',nm:'الحفظ ومراجعة القرآن',lv:'جميع المستويات'},{id:3,ic:'📜',nm:'القراءات السبع',lv:'متقدم'},{id:4,ic:'🏅',nm:'الإجازة بالسند المتصل',lv:'متقدم'}],nid:5},
  l:{secs:[{id:1,ic:'🌱',nm:'العربية للمبتدئين من الصفر',lv:'مبتدئ'},{id:2,ic:'📐',nm:'النحو والصرف التطبيقي',lv:'متوسط'},{id:3,ic:'🗣️',nm:'المحادثة والتواصل اليومي',lv:'جميع المستويات'},{id:4,ic:'✍️',nm:'الكتابة والإملاء والإنشاء',lv:'متوسط—متقدم'},{id:5,ic:'📚',nm:'الأدب والثقافة العربية',lv:'متقدم'},{id:6,ic:'💼',nm:'العربية للأعمال',lv:'متوسط—متقدم'}],nid:7},
  s:{secs:[{id:1,ic:'⚖️',nm:'الفقه وأصوله',lv:'جميع المستويات'},{id:2,ic:'📜',nm:'علم الحديث والمصطلح',lv:'متوسط'},{id:3,ic:'🌟',nm:'التفسير القرآني',lv:'متوسط—متقدم'},{id:4,ic:'🕌',nm:'العقيدة الإسلامية',lv:'مبتدئ—متوسط'},{id:5,ic:'📖',nm:'السيرة النبوية',lv:'جميع المستويات'}],nid:6},
  en:{secs:[{id:1,ic:'🌱',nm:'English for Beginners A1',lv:'مبتدئ'},{id:2,ic:'📗',nm:'Elementary A2',lv:'أساسي'},{id:3,ic:'📘',nm:'Intermediate B1',lv:'متوسط'},{id:4,ic:'📙',nm:'Upper Intermediate B2',lv:'فوق المتوسط'},{id:5,ic:'📕',nm:'Advanced C1',lv:'متقدم'},{id:6,ic:'🏆',nm:'Proficiency C2',lv:'احترافي'},{id:7,ic:'💼',nm:'Business English',lv:'مهني'},{id:8,ic:'🎓',nm:'IELTS & TOEFL',lv:'امتحانات'}],nid:9},
  fr:{secs:[{id:1,ic:'🌱',nm:'Français A1 — Débutant',lv:'مبتدئ'},{id:2,ic:'📗',nm:'Français A2 — Élémentaire',lv:'أساسي'},{id:3,ic:'📘',nm:'Français B1 — Intermédiaire',lv:'متوسط'},{id:4,ic:'📙',nm:'Français B2 — Avancé',lv:'متقدم'},{id:5,ic:'💼',nm:'Français des Affaires',lv:'مهني'},{id:6,ic:'🎓',nm:'DELF & DALF',lv:'امتحانات'}],nid:7},
  es:{secs:[{id:1,ic:'🌱',nm:'Español A1 — Principiante',lv:'مبتدئ'},{id:2,ic:'📘',nm:'Español B1 — Intermedio',lv:'متوسط'},{id:3,ic:'📙',nm:'Español B2 — Avanzado',lv:'متقدم'},{id:4,ic:'🎓',nm:'DELE',lv:'امتحانات'}],nid:5},
  de:{secs:[{id:1,ic:'🌱',nm:'Deutsch A1 — Anfänger',lv:'مبتدئ'},{id:2,ic:'📘',nm:'Deutsch B1 — Mittelstufe',lv:'متوسط'},{id:3,ic:'📙',nm:'Deutsch B2 — Fortgeschritten',lv:'متقدم'},{id:4,ic:'🎓',nm:'TestDaF & Goethe',lv:'امتحانات'}],nid:5},
  it:{secs:[{id:1,ic:'🌱',nm:'Italiano A1',lv:'مبتدئ'},{id:2,ic:'📘',nm:'Italiano B1',lv:'متوسط'},{id:3,ic:'📙',nm:'Italiano B2',lv:'متقدم'}],nid:4},
  zh:{secs:[{id:1,ic:'🌱',nm:'中文入门 — المبتدئ',lv:'مبتدئ'},{id:2,ic:'📘',nm:'中文初级 — الأساسي',lv:'أساسي'},{id:3,ic:'📙',nm:'中文中级 — المتوسط',lv:'متوسط'},{id:4,ic:'🎓',nm:'HSK امتحان',lv:'امتحانات'}],nid:5},
  ja:{secs:[{id:1,ic:'🌱',nm:'日本語 N5 — مبتدئ',lv:'مبتدئ'},{id:2,ic:'📘',nm:'日本語 N3 — متوسط',lv:'متوسط'},{id:3,ic:'🎓',nm:'JLPT امتحان',lv:'امتحانات'}],nid:4},
  ru:{secs:[{id:1,ic:'🌱',nm:'Русский A1 — مبتدئ',lv:'مبتدئ'},{id:2,ic:'📘',nm:'Русский B1 — متوسط',lv:'متوسط'},{id:3,ic:'📙',nm:'Русский B2 — متقدم',lv:'متقدم'}],nid:4},
  tr:{secs:[{id:1,ic:'🌱',nm:'Türkçe A1 — مبتدئ',lv:'مبتدئ'},{id:2,ic:'📘',nm:'Türkçe B1 — متوسط',lv:'متوسط'},{id:3,ic:'🎓',nm:'TÖMER امتحان',lv:'امتحانات'}],nid:4},
  math:{secs:[{id:1,ic:'🔢',nm:'رياضيات ابتدائي',lv:'ابتدائي'},{id:2,ic:'📐',nm:'رياضيات إعدادي',lv:'إعدادي'},{id:3,ic:'📊',nm:'رياضيات ثانوي',lv:'ثانوي'},{id:4,ic:'🎓',nm:'رياضيات جامعي',lv:'جامعي'},{id:5,ic:'🏆',nm:'تحضير الباك والبريفيه',lv:'امتحانات'}],nid:6},
  phys:{secs:[{id:1,ic:'⚗️',nm:'فيزياء إعدادي',lv:'إعدادي'},{id:2,ic:'🔬',nm:'فيزياء وكيمياء ثانوي',lv:'ثانوي'},{id:3,ic:'🎓',nm:'تحضير الباك علوم',lv:'امتحانات'}],nid:4},
  bio:{secs:[{id:1,ic:'🧬',nm:'علوم الحياة إعدادي',lv:'إعدادي'},{id:2,ic:'🌿',nm:'علوم الحياة والأرض ثانوي',lv:'ثانوي'},{id:3,ic:'🎓',nm:'تحضير الباك SVT',lv:'امتحانات'}],nid:4},
  hist:{secs:[{id:1,ic:'🏛️',nm:'تاريخ وجغرافيا إعدادي',lv:'إعدادي'},{id:2,ic:'🗺️',nm:'تاريخ وجغرافيا ثانوي',lv:'ثانوي'}],nid:3},
  prog:{secs:[{id:1,ic:'🐍',nm:'Python للمبتدئين',lv:'مبتدئ'},{id:2,ic:'🌐',nm:'تطوير الويب HTML/CSS/JS',lv:'مبتدئ—متوسط'},{id:3,ic:'⚛️',nm:'React & Vue',lv:'متوسط'},{id:4,ic:'📱',nm:'تطوير تطبيقات الجوال',lv:'متوسط—متقدم'},{id:5,ic:'🤖',nm:'الذكاء الاصطناعي',lv:'متقدم'}],nid:6},
  design:{secs:[{id:1,ic:'🎨',nm:'أساسيات التصميم',lv:'مبتدئ'},{id:2,ic:'🖼️',nm:'Photoshop & Illustrator',lv:'متوسط'},{id:3,ic:'📱',nm:'UI/UX Design',lv:'متوسط—متقدم'},{id:4,ic:'🎬',nm:'Motion Graphics',lv:'متقدم'}],nid:5},
  marketing:{secs:[{id:1,ic:'📱',nm:'إدارة السوشيال ميديا',lv:'مبتدئ'},{id:2,ic:'🔍',nm:'SEO والتسويق بالمحتوى',lv:'متوسط'},{id:3,ic:'📊',nm:'Google & Facebook Ads',lv:'متوسط—متقدم'}],nid:4},
  music:{secs:[{id:1,ic:'🎹',nm:'البيانو للمبتدئين',lv:'مبتدئ'},{id:2,ic:'🎸',nm:'الجيتار',lv:'مبتدئ—متوسط'},{id:3,ic:'🎻',nm:'العود',lv:'مبتدئ—متوسط'},{id:4,ic:'🎤',nm:'الغناء وتقنيات الصوت',lv:'جميع المستويات'}],nid:5},
};
const MNS=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
const CAL={y:new Date().getFullYear(),m:new Date().getMonth(),sel:null};
const BKD={};let selSlot=null,CU=null,isAdm=false;
let _sb;try{_sb=supabase.createClient('https://pcjdszewidzbmerhwwva.supabase.co','sb_publishable_OK7YI7YckURDPNa0kc2esA_c7RoY5EB');}catch(e){console.log('Supabase init:',e);}
/* [كلمة المرور] رابط «نسيت كلمة المرور»: نلتقطه قبل أن يمسح Supabase العنوان، ونفتح نافذة كلمة المرور الجديدة */
window.__mmRecovery=/type=recovery/.test(location.hash||'');
try{_sb&&_sb.auth.onAuthStateChange(function(ev){if(ev==='PASSWORD_RECOVERY'){window.__mmRecovery=true;setTimeout(function(){if(typeof mmOpenPasswordModal==='function')mmOpenPasswordModal(true);},600);}});}catch(e){}
document.addEventListener('DOMContentLoaded',function(){if(window.__mmRecovery)setTimeout(function(){if(typeof mmOpenPasswordModal==='function'&&!document.getElementById('mm-pw-modal'))mmOpenPasswordModal(true);},1500);});

// v20 — إعدادات الموقع المركزية: تُقرأ من القاعدة لكل زائر، لا من متصفح المدير فقط
async function loadSiteConfigFromDB(){
  if(!_sb) return;
  try{
    const {data,error}=await _sb.from('public_site_config').select('*').eq('id',1).maybeSingle();
    if(error||!data) return;
    const map={site_name:'siteName',site_name_en:'siteNameEn',tagline:'tagline',description:'description',whatsapp:'whatsapp',email:'email',primary_color:'primaryColor',accent_color:'accentColor',free_first_lesson:'freeFirstLesson',launch_badge:'launchBadge',bank_name:'bankName',bank_rib:'bankRib',bank_holder:'bankHolder'};
    for(const k in map){ if(data[k]!==null && data[k]!==undefined && data[k]!=='') SITE_CONFIG[map[k]]=data[k]; }
    SITE_CONFIG.teacherShare=75; SITE_CONFIG.platformShare=25;
    try{localStorage.setItem('mm_site_config', JSON.stringify(SITE_CONFIG));}catch(e){}
    if(typeof applySiteConfig==='function') applySiteConfig();
  }catch(e){ console.warn('loadSiteConfigFromDB:', e.message||e); }
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', loadSiteConfigFromDB);
else setTimeout(loadSiteConfigFromDB, 0);

function goP(id){
  const newPgs=['p-find-teacher','p-teacher-profile','p-my-profile','p-certs','p-progress','p-favorites','p-classroom','p-rate','p-referral'];
  document.querySelectorAll('.pg').forEach(p=>p.classList.remove('on'));
  document.querySelectorAll('.ni').forEach(n=>n.classList.remove('on'));
  document.getElementById('ni-teachers-cta')?.classList.remove('on');
  const pg=document.getElementById(id);if(pg)pg.classList.add('on');
  const map={'p-home':'ni-home','p-halls':'ni-halls','p-lib':'ni-lib','p-dash':'ni-dash','p-acc':'ni-acc','p-about':'ni-acc','p-join':'ni-acc','p-terms':'ni-acc','p-privacy':'ni-acc','p-teachers':'ni-teachers-cta'};
  const ni=document.getElementById(map[id]);if(ni)ni.classList.add('on');
  if(id==='p-book'){initCal();setTimeout(()=>{updBkS();populateBookingTeachers();},50);}
  if(id==='p-home')window.scrollTo&&document.getElementById('p-home')?.scrollTo(0,0);
  if(id==='p-find-teacher'){
    document.getElementById('ni-teachers-cta')?.classList.add('on');
    setTimeout(()=>renderTeachers('teachers-list'),100);
  }
  if(id==='p-favorites')setTimeout(renderFavorites,50);
  if(id==='p-dash')setTimeout(()=>{if(typeof loadMyDashboard==='function')loadMyDashboard();},60);
  if(id==='p-my-profile' && typeof loadMyProfile==='function') setTimeout(loadMyProfile,50);
  if(id==='p-progress'&&typeof renderProgress==='function')setTimeout(renderProgress,50); /* [إصلاح F5] */
  if(id==='p-referral')setTimeout(initReferral,50);
  if(id==='p-dash'){ setTimeout(loadAIInsight, 800); if(typeof applyRoleUI==='function') applyRoleUI(); if(typeof loadMyMeetLink==='function') loadMyMeetLink(); }
  if(id==='p-notifs') setTimeout(loadNotifsPage, 100);
  if(id==='p-community') setTimeout(renderCommunityPosts, 100);
  if(id==='p-notes') setTimeout(renderNotes, 100);
  if(id==='p-find-teacher'){ setTimeout(()=>renderTeachers('teachers-list'), 100); if(typeof loadTeachersFromDB==='function') Promise.resolve(loadTeachersFromDB()).then(ok=>{if(ok)renderTeachers('teachers-list');}); /* [إصلاح F4] */ }
  if(id==='p-teachers'){ setTimeout(()=>renderTeachers('teachers-list-public'), 80); if(typeof loadTeachersFromDB==='function') Promise.resolve(loadTeachersFromDB()).then(ok=>{if(ok)renderTeachers('teachers-list-public');}); /* [إصلاح F4] */ }
}
function renderH(k){
  const h=HD[k],c=document.getElementById(k+'-sl');if(!c)return;
  c.innerHTML='';
  h.secs.forEach(s=>{
    const el=document.createElement('div');el.className='sei';
    const sid=String(s.id??''),sic=escapeHtml(s.ic||''),snm=escapeHtml(s.nm||''),sst=escapeHtml(String(s.st??0)),slv=escapeHtml(s.lv||'');
    el.innerHTML=`<div class="seic">${sic}</div><div class="seif"><div class="senm">${snm}</div><div class="semt">${sst} طالب · ${slv}</div></div><span class="sebd">${slv.includes('مبتدئ')?'مبتدئ':slv.includes('متقدم')?'متقدم':'متوسط'}</span>${isAdm?`<button data-section-key="${escapeHtml(k)}" data-section-id="${escapeHtml(sid)}" style="background:rgba(192,57,43,.12);border:none;color:#e74c3c;border-radius:7px;cursor:pointer;padding:.18rem .5rem;font-size:.7rem;margin-right:.3rem;flex-shrink:0">حذف</button>`:''}<div class="sear">›</div>`;
    const del=el.querySelector('[data-section-id]');if(del)del.addEventListener('click',e=>{e.stopPropagation();rmS(del.dataset.sectionKey,del.dataset.sectionId);});
    el.addEventListener('click',e=>{if(e.target.tagName==='BUTTON')return;goP('p-book');setH(k);});
    c.appendChild(el);
  });
  const cnt=document.getElementById(k==='q'?'qcnt':k==='l'?'lcnt2':'scnt');if(cnt)cnt.textContent=h.secs.length;
  const bd=document.getElementById(k+'bd');if(bd)bd.textContent=h.secs.length+' أقسام';
  updBkS();
}
function addS(k){
  const i=document.getElementById(k+'-i');const n=i?.value.trim();
  if(!n){i?.focus();toast('أدخل اسم القسم','e');return;}
  const ics=['📌','🎯','💡','🔖','📒','🧩'];
  HD[k].secs.push({id:HD[k].nid++,ic:ics[Math.floor(Math.random()*ics.length)],nm:n,lv:'جميع المستويات',st:0});
  i.value='';renderH(k);svH();toast(`تم إضافة "${n}"`,'s');
}
function rmS(k,id){if(!confirm('حذف هذا القسم؟'))return;HD[k].secs=HD[k].secs.filter(s=>s.id!==id);renderH(k);svH();toast('تم حذف القسم','i');}
async function doForgotPw(){
  const em=document.getElementById('l-em')?.value.trim();
  if(!em){toast('أدخل بريدك الإلكتروني أولاً','e');return;}
  toast('جاري إرسال رابط إعادة التعيين...','i');
  try{
    if(_sb){
      const{error}=await _sb.auth.resetPasswordForEmail(em,{redirectTo:window.location.origin+window.location.pathname});
      if(error){toast('خطأ: '+error.message,'e');return;}
      toast('✅ تم إرسال رابط إعادة التعيين لبريدك الإلكتروني','s');
    }else{
      const msg=encodeURIComponent('مرحباً، أريد إعادة تعيين كلمة مرور حسابي. بريدي: '+em);
      window.open('https://wa.me/212681883238?text='+msg,'_blank','noopener,noreferrer');
    }
  }catch(e){toast('تواصل معنا عبر واتساب لإعادة تعيين كلمتك','e');}
}
function swH(k){
  document.querySelectorAll('.htb').forEach(t=>t.classList.remove('on'));
  document.querySelectorAll('.hcn').forEach(c=>{c.classList.remove('on');c.style.display='none';});
  const tb=document.getElementById('ht-'+k);
  const cn=document.getElementById('hc-'+k);
  if(tb)tb.classList.add('on');
  if(cn){cn.style.display='';cn.classList.add('on');}
}
function selLang(lang){
  const map={'الإنجليزية':'en','الفرنسية':'fr','الإسبانية':'es','الألمانية':'de','الإيطالية':'it','الصينية':'zh','اليابانية':'ja','الروسية':'ru','التركية':'tr'};
  const sel=document.getElementById('b-hall');
  if(sel&&map[lang])sel.value=map[lang];
  goP('p-book');
  toast('تم اختيار '+lang,'s');
}
async function submitTeacher(){
  const nm=document.getElementById('t-nm')?.value.trim();
  const em=document.getElementById('t-em')?.value.trim();
  const wa=document.getElementById('t-wa')?.value.trim();
  const sp=document.getElementById('t-sp')?.value;
  const price=document.getElementById('t-price')?.value||'12';
  const qual=document.getElementById('t-qual')?.value.trim();
  const bio=document.getElementById('t-bio')?.value.trim();
  if(!nm||!em||!wa||!sp){toast('أكمل الحقول المطلوبة','e');return;}
  if(!_sb){toast('الخدمة غير متاحة حالياً. تواصل معنا عبر واتساب.','e');return;}
  toast('جاري إرسال طلبك...','i');
  try{
    const {error}=await _sb.from('teacher_applications').insert([{name:nm,email:em,whatsapp:wa,specialty:sp,price_per_hour:parseFloat(price),qualification:qual,bio,status:'pending'}]);
    if(error) throw error;
    const msg=encodeURIComponent(`🎓 طلب معلم جديد:
👤 ${nm}
📧 ${em}
📱 ${wa}
🎯 ${sp}
💰 $${price}/حصة
📜 ${qual||'—'}`);
    setTimeout(()=>window.open(`https://wa.me/212681883238?text=${msg}`,'_blank'),600);
    toast('تم حفظ طلبك بنجاح. سيتواصل معك الفريق بعد مراجعته.','s');
    ['t-nm','t-em','t-wa','t-price','t-qual','t-bio'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    setTimeout(()=>goP('p-home'),2000);
  }catch(e){toast('لم يُرسل الطلب: '+(e.message||e),'e');}
}

function setH(k){const s=document.getElementById('b-hall');if(s){s.value=k;updBkS();}if(typeof renderSlots==='function'&&CAL?.sel)renderSlots();}
function updBkS(){
  const h=document.getElementById('b-hall')?.value||'q';
  const ss=document.getElementById('b-sec');
  if(!ss)return;
  const hall=HD[h];
  if(!hall||!hall.secs){
    ss.innerHTML='<option value="general">📚 عام</option>';
    return;
  }
  ss.innerHTML=hall.secs.map(s=>`<option value="${escapeHtml(s.id??'')}">${escapeHtml(s.ic||'')} ${escapeHtml(s.nm||'')}${s.lv?' — '+escapeHtml(s.lv):''}</option>`).join('');
}
// مراقب موثوق يعمل على جميع الأجهزة
function initHallListener(){
  const el=document.getElementById('b-hall');
  if(!el)return;
  ['change','input','click'].forEach(ev=>el.addEventListener(ev,()=>{setTimeout(updBkS,10);}));
}
function svH(){try{localStorage.setItem('mm_halls_v3',JSON.stringify(HD));}catch(e){}}
function ldH(){try{const d=localStorage.getItem('mm_halls_v3');if(d)Object.assign(HD,JSON.parse(d));}catch(e){}}
function initCal(){renderCal();const sw=document.getElementById('slw');if(sw)sw.style.display='none';}
function renderCal(){
  const{y,m}=CAL,t=document.getElementById('cal-t');if(t)t.textContent=MNS[m]+' '+y;
  const g=document.getElementById('cal-g');if(!g)return;g.innerHTML='';
  const first=new Date(y,m,1).getDay(),days=new Date(y,m+1,0).getDate(),td=new Date();
  for(let i=0;i<first;i++){const el=document.createElement('div');el.className='cd emp';g.appendChild(el);}
  for(let d=1;d<=days;d++){
    const dt=new Date(y,m,d),el=document.createElement('div');el.className='cd';el.textContent=d;
    const isPast=dt<new Date(td.getFullYear(),td.getMonth(),td.getDate());
    if(isPast)el.classList.add('pa');
    else if(CAL.sel&&dt.toDateString()===CAL.sel.toDateString())el.classList.add('sel');
    else if(dt.toDateString()===td.toDateString())el.classList.add('tod');
    if(!isPast)el.addEventListener('click',()=>{CAL.sel=dt;selSlot=null;renderCal();const sw=document.getElementById('slw');if(sw)sw.style.display='block';renderSlots();});
    g.appendChild(el);
  }
}
function calNav(d){CAL.m+=d;if(CAL.m>11){CAL.m=0;CAL.y++;}if(CAL.m<0){CAL.m=11;CAL.y--;}CAL.sel=null;selSlot=null;renderCal();const sw=document.getElementById('slw');if(sw)sw.style.display='none';}
// v20 — توفر المعلم: أيامه وساعاته من ملفه، لا قائمة ثابتة للجميع
const _TAV={};
function _avDays(v){
  let a=v;
  if(typeof a==='string'){ try{ a=JSON.parse(a); }catch(e){ a=a.replace(/[{}\[\]\s]/g,'').split(',').filter(x=>x!==''); } }
  return Array.isArray(a) ? a.map(Number).filter(n=>Number.isInteger(n)&&n>=0&&n<=6) : [];
}
async function getTeacherAvailability(tid){
  if(!_sb || !tid) return null;
  if(_TAV[tid]) return _TAV[tid];
  try{
    const {data,error}=await _sb.rpc('get_teacher_availability',{p_teacher_id:tid});
    if(error) throw error;
    const r={days:_avDays(data?.days), from:String(data?.from||'').slice(0,5), to:String(data?.to||'').slice(0,5), tz:String(data?.tz||'Africa/Casablanca')};
    _TAV[tid]=r; return r;
  }catch(e){ console.warn('getTeacherAvailability:', e.message||e); return null; }
}
async function renderTeacherAvailability(t, tid){
  const el=document.getElementById('tp-avail'); if(!el) return;
  const names=['الأح','الإث','الثل','الأر','الخم','الجم','السب'];
  let days=_avDays(t?.availability), from=String(t?.availability_from||'').slice(0,5), to=String(t?.availability_to||'').slice(0,5);
  if(!days.length && /^[0-9a-f-]{36}$/i.test(String(tid||''))){
    const av=await getTeacherAvailability(tid);
    if(av){ days=av.days; from=from||av.from; to=to||av.to; }
  }
  if(!days.length){ el.innerHTML='<div style="grid-column:1/-1;font-size:.72rem;color:var(--tm);text-align:center;padding:.4rem">لم يحدّد المعلم أيام تدريسه بعد</div>'; return; }
  el.innerHTML=names.map((n,i)=>{const on=days.includes(i);return '<div class="tp-day'+(on?' on':'')+'"><div class="tp-day-nm">'+n+'</div><div class="tp-day-sl">'+(on?'متاح':'—')+'</div></div>';}).join('')
    +((from&&to)?'<div style="grid-column:1/-1;font-size:.7rem;color:var(--tm);text-align:center;margin-top:.25rem">🕐 من '+escapeHtml(from)+' إلى '+escapeHtml(to)+'</div>':'');
}
async function renderSlots(){
  const g=document.getElementById('sl-g');if(!g)return;
  if(!CAL.sel){g.innerHTML='<div style="color:var(--tm);font-size:.7rem;text-align:center;padding:.8rem">اختر يوماً أولاً</div>';return;}
  let ts=['08:00','09:00','10:00','11:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];
  const date=`${CAL.y}-${String(CAL.m+1).padStart(2,'0')}-${String(CAL.sel.getDate()).padStart(2,'0')}`;
  let booked=[];
  const teacherId=document.getElementById('b-tch')?.value||currentTeacherId||'';
  /* [إصلاح F7] الزائر لا يستطيع رؤية المواعيد المحجوزة، فلا نعرض له كل المواعيد كأنها متاحة */
  if(typeof CU==='undefined'||!CU){g.innerHTML='<div style="color:var(--tm);font-size:.7rem;text-align:center;padding:.8rem;line-height:1.8">🔒 سجّل دخولك لعرض المواعيد المتاحة<br><button class="btn bgo bsm" style="margin-top:.5rem;font-size:.65rem" onclick="goP(\'p-acc\')">تسجيل الدخول</button></div>';return;}
  if(_sb && teacherId && /^[0-9a-f-]{36}$/i.test(String(teacherId))){
    g.innerHTML='<div style="color:var(--tm);font-size:.7rem;text-align:center;padding:.8rem">⏳ جاري التحقق من المواعيد...</div>';
    try{const {data,error}=await _sb.rpc('get_teacher_booked_slots',{p_teacher_id:teacherId,p_date:date});if(!error)booked=Array.isArray(data)?data:[];}catch(e){g.innerHTML='<div style="color:#e74c3c;font-size:.7rem;text-align:center;padding:.8rem">تعذر التحقق من التوفر. حاول مرة أخرى.</div>';return;}
  }
  // v20 — تقييد المواعيد بأيام المعلم وساعاته (الدرس ٦٠ دقيقة: آخر بداية قبل نهاية الدوام بساعة)
  if(_sb && teacherId && /^[0-9a-f-]{36}$/i.test(String(teacherId))){
    const av=await getTeacherAvailability(teacherId);
    if(av&&av.tz)window._slotTZ=av.tz;
    if(av && av.days.length){
      if(!av.days.includes(CAL.sel.getDay())){ g.innerHTML='<div style="color:var(--tm);font-size:.7rem;text-align:center;padding:.8rem">المعلم لا يدرّس في هذا اليوم — اختر يوماً آخر</div>'; return; }
      if(av.from && av.to) ts=ts.filter(t=>t>=av.from && t<av.to);
      if(!ts.length){ g.innerHTML='<div style="color:var(--tm);font-size:.7rem;text-align:center;padding:.8rem">لا مواعيد متاحة في ساعات المعلم لهذا اليوم</div>'; return; }
    }
  }
  const bookedSet=new Set(booked.map(String));
  const tTZ=window._slotTZ||'Africa/Casablanca',myTZ=getUserTZ();
  const conv=t=>{const d=zonedToDate(date,t,tTZ);return {d,t:fmtLocalTime(d)};};
  const diff=ts.length&&conv(ts[0]).t!==ts[0];
  const note=diff?'<div style="grid-column:1/-1;font-size:.62rem;color:var(--tm);text-align:center;line-height:1.6;margin-bottom:.2rem">الساعة الكبيرة بتوقيت المعلم، والصغيرة بتوقيتك أنت</div>':'';
  g.innerHTML=note+ts.map(t=>{const bk=bookedSet.has(t),ac=t===selSlot;let sub='';if(diff){const c=conv(t);const sameDay=c.d.toLocaleDateString('en-CA')===date;sub='<span style="display:block;font-size:.56rem;opacity:.8;margin-top:.1rem">'+c.t+(sameDay?'':' • '+c.d.toLocaleDateString('ar-u-nu-latn',{weekday:'short'}))+' بتوقيتك</span>';}return`<button class="slot${bk?' bk':''}${ac?' on':''}" onclick="${bk?'':`selT('${t}')`}" ${bk?'disabled':''} aria-label="${t}${bk?' — محجوز':''}">${t}${bk?' · محجوز':''}${sub}</button>`;}).join('');
}

function selT(t){selSlot=t;renderSlots();const b=document.getElementById('bkn2');if(b)b.disabled=false;}
function goBk(step){
  if(step===2){const n=document.getElementById('b-nm')?.value.trim(),e=document.getElementById('b-em')?.value.trim();if(!n||!e){toast('أدخل اسمك وبريدك الإلكتروني','e');return;}}
  if(step===3){if(!CAL.sel){toast('اختر تاريخاً من التقويم','e');return;}if(!selSlot){toast('اختر وقتاً للدرس','e');return;}buildSum().then(ok=>{if(ok){document.querySelectorAll('.bkp').forEach(p=>p.classList.remove('on'));document.getElementById('bp3')?.classList.add('on');document.querySelectorAll('.bks').forEach((s,i)=>{s.classList.remove('on','done');if(i+1<3)s.classList.add('done');if(i+1===3)s.classList.add('on');});}});return;}
  document.querySelectorAll('.bkp').forEach(p=>p.classList.remove('on'));
  document.getElementById('bp'+step)?.classList.add('on');
  document.querySelectorAll('.bks').forEach((s,i)=>{s.classList.remove('on','done');if(i+1<step)s.classList.add('done');if(i+1===step)s.classList.add('on');});
}
async function buildSum(){
  const hm={q:'🕌 القرآن',l:'📖 اللغة العربية',s:'⚖️ الشريعة'};
  const teacherId=document.getElementById('b-tch')?.value||currentTeacherId||'';
  const date=CAL.sel?`${CAL.y}-${String(CAL.m+1).padStart(2,'0')}-${String(CAL.sel.getDate()).padStart(2,'0')}`:'';
  let quote=null;
  let quoteError=null;
  if(!_sb){toast('لا اتصال بقاعدة البيانات.','e');return false;}
  if(!CU?.id){toast('سجّل دخولك أولاً لإتمام الحجز.','e');return false;}
  if(!teacherId){toast('اختر المعلم في الخطوة الأولى — القائمة فارغة أو لم يُختر أحد.','e');return false;}
  if(!date||!selSlot){toast('اختر التاريخ والوقت.','e');return false;}
  if(_sb && CU?.id && teacherId && date && selSlot){
    try{
      const {data,error}=await _sb.rpc('get_booking_quote',{p_teacher_id:teacherId,p_date:date,p_time:selSlot,p_duration:Number(PR.lessonDuration)||60,p_promo_code:appliedPromo?.code||null});
      if(error) throw error;
      if(!data) throw new Error('لم يصل عرض سعر خادمي');
      quote=data;
    }catch(e){quoteError=e;console.warn('get_booking_quote:',e.message||e);}
  }
  if(quoteError || !quote){toast('تعذر التسعير: '+(quoteError?.message||'لا رد من الخادم')+' — لم يُنشأ أي حجز.','e');return false;}
  if(quote && quote.ok===false){
    if(quote.code==='subscription_required'){
      if(confirm((quote.error||'استعملت درسك المجاني')+'\n\nهل تريد الاشتراك مع هذا المعلم بمواعيد أسبوعية ثابتة؟')){window._subTeacherId=teacherId;goP('p-subscribe');}
      return false;
    }
    toast(quote.error||'تعذر التسعير','e');return false;
  }
  const price=Number(quote?.final_price??0);
  const c=quote?.currency||PAYMENT_CONFIG.currency||'$';
  document.getElementById('sm-nm').textContent=document.getElementById('b-nm')?.value||'—';
  document.getElementById('sm-ha').textContent=hm[document.getElementById('b-hall')?.value]||'—';
  const opt=document.getElementById('b-tch')?.selectedOptions?.[0];
  document.getElementById('sm-tc').textContent=opt?.dataset?.name||opt?.textContent||'—';
  document.getElementById('sm-dt').textContent=CAL.sel?CAL.sel.toLocaleDateString('ar-u-nu-latn',{weekday:'long',day:'numeric',month:'long',year:'numeric'}):'—';
  document.getElementById('sm-sl').textContent=selSlot||'—';
  document.getElementById('sm-tot').textContent=price>0?c+price.toFixed(2):'مجاني';
  const bpkg=document.getElementById('b-pkg'); if(bpkg) bpkg.value=price;
  window._checkoutQuote=quote;
  return true;
}


async function isFirstLessonFree(){
  if(!_sb||!CU?.id||!PR.freeTrialEnabled) return false;
  try{
    const {data,error}=await _sb.from('bookings').select('id').eq('student_id',CU.id).not('status','in','("cancelled","no_show")').limit(1);
    if(error) throw error;
    return !(data||[]).length;
  }catch(e){ return false; }
}

async function procPay(){
  if(!_sb||!CU?.id){toast('يجب تسجيل الدخول أولاً','e');return;}
  const teacherId=document.getElementById('b-tch')?.value||currentTeacherId||'';
  const teacherOption=document.getElementById('b-tch')?.selectedOptions?.[0];
  const teacherName=teacherOption?.dataset?.name||teacherOption?.textContent?.replace(/^--.*$/,'').trim()||window._currentTeacher?.name||'';
  if(!teacherId){toast('اختر المعلم أولاً','e');return;}
  if(!CAL.sel||!selSlot){toast('اختر التاريخ والوقت أولاً','e');return;}
  if(selectedPayMethod!=='whatsapp' && selectedPayMethod!=='bank'){
    toast('اختر واتساب أو التحويل البنكي؛ الدفع الإلكتروني غير مفعّل بعد.','i');return;
  }

  const pkg=PR.packages.find(p=>p.lessons===1)?.price||12;
  const hall=document.getElementById('b-hall')?.value||'q';
  const hallName=({q:'القرآن والتجويد',l:'اللغة العربية',s:'العلوم الشرعية',en:'الإنجليزية',fr:'الفرنسية',es:'الإسبانية',de:'الألمانية',it:'الإيطالية',zh:'الصينية',ja:'اليابانية',ru:'الروسية',tr:'التركية',math:'الرياضيات',phys:'الفيزياء والكيمياء',bio:'علوم الحياة',hist:'التاريخ والجغرافيا',prog:'البرمجة',design:'التصميم',marketing:'التسويق الرقمي',music:'الموسيقى'})[hall]||(window.HALLS_V20?.halls?.find(x=>x.id===hall)?.name)||hall;
  const section=document.getElementById('b-sec')?.options[document.getElementById('b-sec')?.selectedIndex]?.text||'';
  const date=`${CAL.y}-${String(CAL.m+1).padStart(2,'0')}-${String(CAL.sel.getDate()).padStart(2,'0')}`;
  const studentName=document.getElementById('b-nm')?.value.trim()||CU.name||'طالب';
  const studentEmail=document.getElementById('b-em')?.value.trim()||CU.email||'';

  toast('⏳ جاري إنشاء الحجز الآمن...','i');
  const result=await createBooking({teacherId,teacherName,date,time:selSlot,hall,hallName,section,duration:PR.lessonDuration||60});
  if(!result.ok){toast(result.error,'e');return;}

  let payment={ok:true,payment:null,ref:''};
  if(Number(result.booking?.package_price||0)>0){
    payment=await createPaymentRecord({id:result.booking.id,hall,paymentMethod:selectedPayMethod});
    if(!payment.ok){toast('تم إنشاء الحجز، لكن تعذّر إنشاء طلب الدفع: '+payment.error,'e');return;}
  }

  const finalPrice=Number(payment.payment?.gross_amount??result.booking.package_price??0);
  const serverBookingStatus=String(result.booking?.status||'pending');
  const tShare=Number(payment.payment?.teacher_amount??0);
  const pShare=Number(payment.payment?.platform_fee??0);
  const dateStr=CAL.sel.toLocaleDateString('ar-EG');

  if(!(finalPrice>0)) sendBookingWhatsApp('admin',{studentName,studentEmail,hallName,sec:section,teacher:teacherName,dateStr,timeStr:selSlot,finalPrice,tShare,pShare,currency:PAYMENT_CONFIG.currency});
  addNotif(finalPrice>0?`⏳ تم إنشاء حجز ${hallName} مع ${teacherName} — بانتظار الدفع`:`✅ تم حجز درسك المجاني في ${hallName} مع ${teacherName}`);

  if(finalPrice>0){
    const payMsg=`📋 *حجز جديد — بانتظار الدفع*\n\n👤 *الطالب:* ${studentName}\n📧 *البريد:* ${studentEmail||'—'}\n📚 *الفصل:* ${hallName}\n📖 *القسم:* ${section||'—'}\n👨‍🏫 *المعلم:* ${teacherName}\n🗓 *التاريخ:* ${dateStr}\n🕐 *الوقت:* ${selSlot}\n💰 *المبلغ:* ${PAYMENT_CONFIG.currency}${finalPrice}\n💳 *طريقة الدفع:* ${selectedPayMethod==='bank'?'تحويل بنكي':'واتساب'}\n🔖 *مرجع الدفع:* ${payment.ref||''}\n\nالسلام عليكم، أريد تأكيد الدفع لهذا الحجز.`;
    window.open(`https://wa.me/212681883238?text=${encodeURIComponent(payMsg)}`,'_blank','noopener,noreferrer');
  }

  appliedPromo=null;
  setTimeout(()=>{
    goBk(1);CAL.sel=null;selSlot=null;
    const ic=document.getElementById('suc-ic');if(ic)ic.textContent=finalPrice>0?'⏳':'✅';
    const st=document.getElementById('suc-t');if(st)st.textContent=finalPrice>0?'تم إنشاء طلب الحجز':'تم حجز درسك المجاني';
    const sm=document.getElementById('suc-m');if(sm)sm.textContent=finalPrice>0?`تم إنشاء الحجز وحالته بانتظار الدفع. ${selectedPayMethod==='bank'?'أكمل التحويل البنكي ثم أرسل الإيصال عبر واتساب.':'تواصل عبر واتساب لإتمام الدفع.'}`:(serverBookingStatus==='confirmed'?`حجزك المجاني مع ${teacherName} تم تأكيده بنجاح.`:`تم إنشاء حجزك المجاني، وهو بانتظار تأكيد الإدارة.`);
    openMo('mo-suc');
  },700);
}

// ── إرسال واتساب تلقائي ──
function sendBookingWhatsApp(type, d){
  const adminWA = '212681883238';
  let msg = '';

  if(type === 'student'){
    msg = `🎓 *منارة المعرفة — تأكيد الحجز*

` +
          `مرحباً ${d.studentName}! ✅

` +
          `📚 *الفصل:* ${d.hallName}
` +
          `📖 *القسم:* ${d.sec}
` +
          `👨‍🏫 *المعلم:* ${d.teacher || 'سيتم التعيين'}
` +
          `🗓 *التاريخ:* ${d.dateStr}
` +
          `🕐 *الوقت:* ${d.timeStr}
` +
          `💰 *المبلغ:* ${d.currency}${d.finalPrice}

` +
          `📱 سيتواصل معك فريقنا قريباً لتأكيد رابط الدرس.
` +
          `📞 للاستفسار: wa.me/${adminWA}

` +
          `_منارة المعرفة — manarat-almaarifa.com_`;
    // نفتح واتساب للطالب ليرسل لنفسه أو لنا
    if(d.studentEmail){
      setTimeout(()=>{
        window.open(`https://wa.me/${adminWA}?text=${encodeURIComponent(msg)}`,'_blank');
      }, 800);
    }
  }

  if(type === 'admin'){
    msg = `📋 *حجز جديد — منارة المعرفة*

` +
          `👤 *الطالب:* ${d.studentName}
` +
          `📧 *البريد:* ${d.studentEmail}
` +
          `📚 *الفصل:* ${d.hallName}
` +
          `📖 *القسم:* ${d.sec}
` +
          `👨‍🏫 *المعلم المطلوب:* ${d.teacher || 'أي معلم'}
` +
          `🗓 *التاريخ:* ${d.dateStr}
` +
          `🕐 *الوقت:* ${d.timeStr}
` +
          (Number(d.finalPrice)>0 ? `💰 *المبلغ:* ${d.currency}${d.finalPrice}
` : `🎁 *درس تجريبي مجاني*
`) +
          `
⏰ ${new Date().toLocaleString('ar-EG')}`;
    // نفتح واتساب للمدير تلقائياً
    setTimeout(()=>{
      window.open(`https://wa.me/${adminWA}?text=${encodeURIComponent(msg)}`,'_blank');
    }, 2000);
  }
}

// ── Stripe Payment (جاهز للتفعيل) ──
async function payWithStripe(amount, currency='usd'){
  if(!_stripe){
    toast('الدفع بالبطاقة غير مفعّل حتى يتم ربط مزود دفع معتمد.','i');
    const adminWA = '212681883238';
    window.open(`https://wa.me/${adminWA}?text=${encodeURIComponent('مرحباً، أريد إتمام الدفع بالبطاقة لحجزي.')}`, '_blank');
    return;
  }
  try{
    // يحتاج endpoint على الخادم لإنشاء PaymentIntent
    toast('يتم توجيهك لصفحة الدفع الآمنة...','i');
  }catch(e){toast('خطأ في الدفع: '+e.message,'e');}
}
function swD(b,id){document.querySelectorAll('.dta').forEach(t=>t.classList.remove('on'));document.querySelectorAll('.dpn').forEach(p=>p.classList.remove('on'));b.classList.add('on');document.getElementById(id)?.classList.add('on');}

function swA(b,id){document.querySelectorAll('.atb').forEach(t=>t.classList.remove('on'));document.querySelectorAll('.apn').forEach(p=>p.classList.remove('on'));b.classList.add('on');document.getElementById(id)?.classList.add('on');}
function showAuth(){document.getElementById('auth-form').classList.add('on');document.getElementById('logged-in').style.display='none';}
function setUser(u){
  CU=u;try{localStorage.setItem('mm_v3',JSON.stringify(u));}catch(e){}
  const ini=u.name.slice(0,2);
  document.getElementById('uchip').classList.add('on');
  document.getElementById('lbtn').style.display='none';
  document.getElementById('uav').textContent=ini;
  document.getElementById('unm').textContent=u.name.split(' ')[0];
  document.getElementById('acc-av').textContent=ini;
  document.getElementById('acc-nm').textContent=u.name;
  document.getElementById('acc-ro').textContent=u.role==='admin'?'🔐 مدير':u.role==='teacher'?'👨‍🏫 معلم':'👨‍🎓 طالب';
  document.getElementById('acc-em').textContent=u.email;
  document.getElementById('d-nm').textContent=u.name.split(' ')[0]+' 👋';
  document.getElementById('auth-form').classList.remove('on');
  document.getElementById('logged-in').style.display='block';
  // Show admin menu item only for admins (verified server-side again on click)
  const adm=document.getElementById('mi-adm'); if(adm)adm.style.display=u.role==='admin'?'':'none';
  if(typeof applyRoleUI==="function") setTimeout(applyRoleUI,50);
}
async function doLogin(){
  const em=document.getElementById('l-em')?.value.trim(),pw=document.getElementById('l-pw')?.value;
  if(!em||!pw){toast('أدخل البريد وكلمة المرور','e');return;}
  toast('جاري تسجيل الدخول...','i');
  try{
    if(_sb){
      const{data,error}=await _sb.auth.signInWithPassword({email:em,password:pw});
      if(error){toast('فشل تسجيل الدخول: '+error.message,'e');return;}
      if(data.user){
        // جلب الدور من قاعدة البيانات
        const {data:prof}=await _sb.from('profiles').select('name,role').eq('id',data.user.id).maybeSingle();
        const userRole = prof?.role || 'student';
        const userName = prof?.name || em.split('@')[0];
        // إذا لم يكن الملف موجوداً، أنشئه
        if(!prof){
          await _sb.from('profiles').upsert({id:data.user.id,name:userName,email:em,role:userRole,status:'active'});
        }
        setUser({id:data.user.id,name:userName,email:em,role:userRole});
        toast('مرحباً '+userName+'! ✓','s'); return;
      }
    }
  }catch(e){console.log(e); toast('خطأ في الاتصال','e'); return;}
  toast('Supabase غير متصل','e');
}
async function doReg(){
  const n=document.getElementById('r-nm')?.value.trim(),em=document.getElementById('r-em')?.value.trim(),pw=document.getElementById('r-pw')?.value,requestedRole=document.getElementById('r-ro')?.value||'student';
  const ro='student';
  if(!n||!em||!pw){toast('أكمل جميع الحقول','e');return;}
  if(pw.length<6){toast('كلمة المرور 6 أحرف على الأقل','e');return;}
  toast('جاري إنشاء الحساب...','i');
  try{
    if(_sb){
      const{data,error}=await _sb.auth.signUp({email:em,password:pw,options:{data:{name:n,role:'student'}}});
      if(error){toast('خطأ: '+error.message,'e');return;}
      if(data.user){
        await _sb.from('profiles').upsert({id:data.user.id,name:n,email:em,role:'student',status:'active'});
        setUser({id:data.user.id,name:n,email:em,role:'student'});
        addNotif('🎉 مرحباً بك في منارة المعرفة!');
        if(requestedRole==='teacher'){
          toast('أُنشئ حسابك ✓ — أكمل الآن طلب الانضمام كمعلم، وبعد موافقة الإدارة يتحوّل حسابك إلى حساب معلم.','s');
          setTimeout(()=>{goP('p-join');const a=document.getElementById('t-nm'),b=document.getElementById('t-em');if(a&&!a.value)a.value=n;if(b&&!b.value)b.value=em;},400);
        }else{
          toast('مرحباً '+n+'! 🎉','s');
        }
        return;
      }
    }
  }catch(e){console.log(e);toast('تعذّر إنشاء الحساب: '+(e.message||e),'e');return;}
  toast('تعذّر إنشاء الحساب من Supabase. حاول مرة أخرى.','e');
}
async function socLogin(p){
  if(!_sb){toast('خدمة التسجيل غير متاحة','e');return;}
  try{
    const redirectTo=window.location.origin+window.location.pathname;
    if(p==='google')await _sb.auth.signInWithOAuth({provider:'google',options:{redirectTo}});
    else if(p==='facebook')await _sb.auth.signInWithOAuth({provider:'facebook',options:{redirectTo}});
  }catch(e){toast('خطأ في التسجيل: '+e.message,'e');}
}
function doLogout(silent){
  /* [إصلاح F1] إنهاء جلسة Supabase فعلياً، لا مسح الواجهة فقط */
  try{if(typeof _sb!=='undefined'&&_sb)_sb.auth.signOut().catch(()=>{});}catch(e){}
  CU=null;isAdm=false;document.body.classList.remove('adm');if(typeof applyRoleUI==='function')setTimeout(applyRoleUI,50);try{localStorage.removeItem('mm_v3');}catch(e){}
  document.getElementById('uchip').classList.remove('on');document.getElementById('lbtn').style.display='';
  document.getElementById('auth-form').classList.add('on');document.getElementById('logged-in').style.display='none';
  if(!silent)toast('تم تسجيل الخروج','i');
}
// ─── SECURE ADMIN SYSTEM (Supabase role-based) ────────────────────────────
// Admin status is determined by the 'role' column in the 'profiles' table.
// The actual data is ALSO protected server-side via Row Level Security (RLS).
// Even if someone bypasses the client, Supabase will refuse admin data.
async function checkIsAdmin(){
  if(!_sb)return false;
  try{
    const {data:{user}}=await _sb.auth.getUser();
    if(!user)return false;
    const {data,error}=await _sb.from('profiles').select('role').eq('id',user.id).maybeSingle();
    return !error && data && data.role==='admin';
  }catch(e){console.log('admin check failed',e);return false;}
}
async function enterAdmin(){
  const ok=await checkIsAdmin();
  if(!ok){toast('هذا القسم متاح لحسابات الإدارة المفعّلة فقط','e');return;}
  isAdm=true;
  try{localStorage.setItem('mm_notrack','1');}catch(e){}
  document.body.classList.add('adm');
  await buildAdminPanel();
  goP('p-adm');
  toast('مرحباً بالمدير! 🔐','s');
}
function deAdm(){
  isAdm=false; document.body.classList.remove('adm');
  const p=document.getElementById('p-adm'); if(p)p.remove();
  ['q','l','s'].forEach(k=>renderH(k));
  toast('تم الخروج من لوحة الإدارة','i'); goP('p-home');
}
async function buildAdminPanel(){
  // Remove old panel if exists
  const old=document.getElementById('p-adm'); if(old)old.remove();
  // Create fresh panel shell
  const cnt=document.getElementById('cnt'); if(!cnt)return;
  const p=document.createElement('div'); p.className='pg'; p.id='p-adm';
  p.innerHTML=`
    <div style="padding:1rem 1rem 0;display:flex;align-items:center;justify-content:space-between"><div><div style="font-size:.72rem;color:var(--re);font-weight:700">🔐 لوحة الإدارة</div><div style="font-size:.95rem;font-weight:700">وضع المدير مفعّل</div></div><button class="btn bsm" style="background:rgba(192,57,43,.1);border:1px solid rgba(192,57,43,.25);color:#e74c3c" onclick="deAdm()">خروج</button></div>
    <div class="admts"><button class="admt on" onclick="swAdm(this,'ao')">📊 الرئيسية</button><button class="admt" onclick="swAdm(this,'au')">👥 المستخدمون</button><button class="admt" onclick="swAdm(this,'atc')">👨‍🏫 المعلمون</button><button class="admt" onclick="swAdm(this,'ab')">🗓 الحجوزات</button><button class="admt" onclick="swAdm(this,'af')">💰 المالية</button><button class="admt" onclick="openAdminContentHub(this)">📚 المحتوى</button><button class="admt" onclick="swAdm(this,'an');loadAdminNotif()">🔔 الإشعارات</button><button class="admt" onclick="swAdm(this,'arr')">📈 التقارير</button><button class="admt" onclick="swAdm(this,'ast')">⚙️ التسعير</button><button class="admt" onclick="swAdm(this,'asite')">🎨 الموقع</button><button class="admt" onclick="swAdm(this,'alg')">📋 السجل</button></div>
    <div class="admp on" id="ao"><div id="ao-body" style="padding:1rem;text-align:center;color:var(--tm);font-size:.8rem">⏳ جاري تحميل الإحصاءات...</div></div>
    <div class="admp" id="au"><div id="au-body" style="padding:1rem;text-align:center;color:var(--tm);font-size:.8rem">⏳ جاري تحميل المستخدمين...</div></div>
    <div class="admp" id="af"><div id="af-body" style="padding:1rem;text-align:center;color:var(--tm);font-size:.8rem">⏳ جاري تحميل البيانات المالية...</div></div>
    <div class="admp" id="ab"><div id="ab-body" style="padding:1rem;text-align:center;color:var(--tm);font-size:.8rem">⏳ جاري تحميل الحجوزات...</div></div>
    <div class="admp" id="ast"><div id="ast-body" style="padding:1rem"></div></div>
    <div class="admp" id="alg"><div id="alg-body" style="padding:1rem;text-align:center;color:var(--tm);font-size:.8rem">⏳ جاري تحميل السجل...</div></div>
    <div class="admp" id="ac"><div id="ac-body" style="padding:1rem"></div></div>
    <div class="admp" id="ak"><div id="ak-body" style="padding:1rem"></div></div>
    <div class="admp" id="alib"><div id="alib-body" style="padding:1rem"></div></div><div class="admp" id="atc"><div id="atc-body" style="padding:1rem"></div></div>
    <div class="admp" id="awa"><div id="awa-body" style="padding:1rem"></div></div>
    <div class="admp" id="an"><div id="an-body" style="padding:1rem"></div></div>
    <div class="admp" id="agc"><div id="agc-body" style="padding:1rem"></div></div>
    <div class="admp" id="arr"><div id="arr-body" style="padding:1rem"></div></div>
    <div class="admp" id="amt"><div id="amt-body" style="padding:1rem"></div></div>
    <div class="admp" id="asite"><div id="asite-body" style="padding:1rem"></div></div>`;
  cnt.appendChild(p);
  // Load real data from Supabase (RLS on server will reject non-admins)
  loadAdminOverview(); loadAdminUsers(); loadAdminFinance(); loadAdminBookings(); loadAdminSettings(); loadAdminLog();
}

async function loadAdminTeacherCenter(){
  const b=document.getElementById('atc-body');
  if(!b)return;
  if(!_sb){
    b.innerHTML='<div style="color:#e74c3c;text-align:center;padding:1rem">لا يوجد اتصال بقاعدة البيانات.</div>';
    return;
  }
  b.innerHTML='<div style="text-align:center;color:var(--tm);padding:1.5rem">⏳ جاري مزامنة حسابات وملفات المعلمين...</div>';
  try{
    /*
      مصدر الحقيقة في الإدارة:
      1) profiles = الحساب الحقيقي ودوره وحالته.
      2) teacher_profiles = الملف التعريفي المرتبط بالحساب عبر user_id.
      3) teacher_applications = طلبات الانضمام، وهي مسار مستقل.
      لا نعتمد على teacher_profiles وحده حتى لا يظهر "0" عندما يوجد حساب معلم بلا ملف مكتمل.
    */
    const [profilesRes,teacherRes,appsRes]=await Promise.all([
      _sb.from('profiles').select('id,name,email,phone,role,status,created_at').eq('role','teacher').order('created_at',{ascending:false}).limit(200),
      _sb.from('teacher_profiles').select('id,user_id,name,email,whatsapp,specialty,qualification,bio,country,photo_url,price,verified,featured,rating,review_count,student_count,total_lessons,status,created_at').order('created_at',{ascending:false}).limit(200),
      _sb.from('teacher_applications').select('*').order('created_at',{ascending:false}).limit(100)
    ]);
    if(profilesRes.error)throw profilesRes.error;
    if(appsRes.error)throw appsRes.error;
    // فشل جلب الملف التعريفي لا يمنع عرض حسابات المعلمين الحقيقية.
    const teacherProfiles=teacherRes.error ? [] : (teacherRes.data||[]);
    const profiles=profilesRes.data||[];
    const apps=appsRes.data||[];
    const profileById=new Map(profiles.map(p=>[String(p.id),p]));
    const teacherByUser=new Map();
    teacherProfiles.forEach(t=>{if(t.user_id)teacherByUser.set(String(t.user_id),t);});

    /* حساب المعلمين النشطين من الحسابات الحقيقية، وليس من ملف محلي أو قائمة واجهة. */
    const activeAccounts=profiles.filter(p=>p.status==='active');
    const pending=apps.filter(x=>x.status==='pending');

    /* نعرض كل حساب معلم مرة واحدة، ونلحق به ملفه إن وجد. */
    const registered=profiles.map(p=>({profile:p,teacher:teacherByUser.get(String(p.id))||null}));

    /* ملفات موجودة بلا حساب: لا نحذفها ولا نخفيها؛ نعرضها كحالة تحتاج ربطاً. */
    const orphanProfiles=teacherProfiles.filter(t=>!t.user_id || !profileById.has(String(t.user_id)));

    const statCard=(n,label,color='var(--gl)')=>`<div class="ast"><div class="astn" style="color:${color}">${n}</div><div class="astl">${label}</div></div>`;

    const accountCard=({profile:p,teacher:t})=>{
      const active=p.status==='active';
      const name=escapeHtml(p.name||t?.name||'معلم بدون اسم');
      const email=escapeHtml(p.email||t?.email||'');
      const specialty=escapeHtml(t?.specialty||'لم يكتمل الملف التعريفي');
      const price=t?.price!=null?`$${Number(t.price||0).toFixed(0)}/درس`:'—';
      const verification=t?.verified
        ? '<span class="pill pgg">✓ موثّق</span>'
        : '<span class="pill pgb">غير موثّق</span>';
      const profileState=t
        ? `<span class="pill ${t.status==='active'?'pgg':'pgb'}">ملف ${t.status==='active'?'نشط':'غير نشط'}</span>`
        : '<span class="pill pgb">⚠️ الملف غير موجود</span>';
      return `<div style="background:rgba(255,255,255,.035);border:1px solid var(--bdl);border-radius:14px;padding:.75rem;margin-bottom:.5rem">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.6rem">
          <div style="min-width:0;flex:1">
            <div style="font-size:.8rem;font-weight:800">${name}</div>
            <div style="font-size:.62rem;color:var(--tm);margin-top:.18rem;word-break:break-word">${email}</div>
            <div style="font-size:.65rem;color:var(--gl);margin-top:.3rem">${specialty}</div>
          </div>
          <div style="display:flex;flex-direction:column;align-items:flex-end;gap:.25rem;flex-shrink:0">
            <span class="pill ${active?'pgg':'abr'}">${active?'● نشط':'● غير نشط'}</span>
            ${verification}
          </div>
        </div>
        <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.55rem;font-size:.61rem;color:var(--tm)">
          ${profileState}
          <span class="pill pgb">💰 ${price}</span>
          ${t?`<span class="pill pgb">⭐ ${Number(t.rating||0).toFixed(1)}</span><span class="pill pgb">👥 ${Number(t.student_count||0)} طالب</span><span class="pill pgb">📚 ${Number(t.total_lessons||0)} درس</span>`:''}
          ${t?.featured?'<span class="pill pgg">⭐ مميّز</span>':''}
        </div>
        <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.6rem">
          ${t?`<button class="ab ${t.verified?'abr':'abg'}" onclick="adminSetTeacherFlag('${t.user_id}','verified',${!t.verified})">${t.verified?'إلغاء التوثيق':'توثيق'}</button>
          <button class="ab" onclick="adminSetTeacherFlag('${t.user_id}','featured',${!t.featured})">${t.featured?'إلغاء التمييز':'تمييز'}</button>`:''}
          ${t?.whatsapp||p.phone?`<button class="ab" onclick="contactTeacher('${encodeURIComponent(t?.whatsapp||p.phone||'')}','${encodeURIComponent(p.name||t?.name||'')}')">💬 تواصل</button>`:''}
        </div>
      </div>`;
    };

    const orphanCard=t=>`<div style="background:rgba(212,175,106,.045);border:1px solid rgba(212,175,106,.18);border-radius:14px;padding:.75rem;margin-bottom:.5rem">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:.5rem">
        <div><div style="font-size:.78rem;font-weight:800">${escapeHtml(t.name||'ملف معلم')}</div><div style="font-size:.62rem;color:var(--tm)">${escapeHtml(t.email||'لا يوجد بريد')} • ${escapeHtml(t.specialty||'—')}</div></div>
        <span class="pill pgb">⚠️ بلا حساب</span>
      </div>
      <div style="font-size:.64rem;color:var(--tm);line-height:1.6;margin-top:.4rem">هذا ملف تعريفي موجود في قاعدة البيانات لكنه غير مرتبط بحساب مستخدم. لا يتم حذفه تلقائياً.</div>
    </div>`;

    b.innerHTML=`
      <div class="admst">
        ${statCard(activeAccounts.length,'حسابات معلمين نشطة','var(--grl)')}
        ${statCard(profiles.length,'حسابات معلمين','var(--gl)')}
        ${statCard(pending.length,'طلبات معلّقة','var(--gl)')}
        ${statCard(orphanProfiles.length,'ملفات بلا حساب','#e6a23c')}
      </div>

      <div style="font-size:.8rem;font-weight:800;color:var(--gl);margin:.2rem 0 .55rem">👨‍🏫 المعلمون المسجّلون</div>
      <div style="font-size:.64rem;color:var(--tm);line-height:1.6;margin-bottom:.7rem">يُحسب المعلم من حسابه الحقيقي في النظام، ويُعرض ملفه التعريفي إن كان مرتبطاً به.</div>
      ${registered.length?registered.map(accountCard).join(''):'<div style="font-size:.68rem;color:var(--tm);padding:.5rem 0 1rem">لا توجد حسابات بدور «معلم» حالياً.</div>'}

      ${orphanProfiles.length?`<div style="font-size:.8rem;font-weight:800;color:var(--gl);margin:1rem 0 .55rem">⚠️ ملفات تحتاج ربطاً</div>${orphanProfiles.map(orphanCard).join('')}`:''}

      <div style="font-size:.8rem;font-weight:800;color:var(--gl);margin:1rem 0 .55rem">⏳ طلبات الانضمام</div>
      ${pending.length?pending.map(t=>`<div style="background:rgba(255,255,255,.035);border:1px solid var(--bdl);border-radius:14px;padding:.7rem;margin-bottom:.45rem">
        <div style="display:flex;justify-content:space-between;gap:.5rem"><div><strong style="font-size:.75rem">${escapeHtml(t.name||'—')}</strong><div style="font-size:.62rem;color:var(--tm)">${escapeHtml(t.specialty||'—')} • ${escapeHtml(t.email||'')}</div></div><span class="pill pgb">معلّق</span></div>
        <div style="font-size:.64rem;color:var(--tm);line-height:1.6;margin:.4rem 0">${escapeHtml((t.bio||'لا توجد نبذة').slice(0,180))}</div>
        <div style="display:flex;gap:.35rem;flex-wrap:wrap"><button class="ab abg" onclick="approveTeacher('${t.id}')">قبول الطلب</button><button class="ab" onclick="contactTeacher('${encodeURIComponent(t.whatsapp||'')}','${encodeURIComponent(t.name||'')}')">💬 تواصل</button><button class="ab abr" onclick="rejectTeacher('${t.id}')">رفض</button></div>
      </div>`).join(''):'<div style="font-size:.68rem;color:var(--tm);padding:.4rem 0 1rem">لا توجد طلبات معلّقة.</div>'}`;
  }catch(e){
    b.innerHTML=`<div style="color:#e74c3c;text-align:center;padding:1rem;line-height:1.7">تعذّر تحميل إدارة المعلمين: ${escapeHtml(e.message||e)}<br><small style="color:var(--tm)">لم يتم تعديل أو حذف أي بيانات.</small></div>`;
  }
}
async function adminSetTeacherFlag(userId,field,value){
  if(!userId||!['verified','featured'].includes(field))return;
  try{const {error}=await _sb.from('teacher_profiles').update({[field]:!!value}).eq('user_id',userId);if(error)throw error;toast('تم تحديث بيانات المعلم ✅','s');loadAdminTeacherCenter();}
  catch(e){toast('فشل تحديث المعلم: '+(e.message||e),'e');}
}
function openAdminContentHub(btn){
  document.querySelectorAll('.admt').forEach(x=>x.classList.remove('on'));document.querySelectorAll('.admp').forEach(x=>x.classList.remove('on'));if(btn)btn.classList.add('on');
  const p=document.getElementById('ac');if(p)p.classList.add('on');const b=document.getElementById('ac-body');if(!b)return;
  b.innerHTML=`<div style="font-size:.8rem;font-weight:800;color:var(--gl);margin-bottom:.75rem">📚 مركز المحتوى</div><div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem">
    <button class="btn bgh" onclick="swAdmById('ac')">🏫 الفصول</button><button class="btn bgh" onclick="swAdmById('alib')">📖 المكتبة</button><button class="btn bgh" onclick="swAdmById('ak')">🎫 الكوبونات</button><button class="btn bgh" onclick="swAdmById('agc')">👥 الجماعية</button></div>
    <div style="margin-top:.8rem;font-size:.63rem;color:var(--tm);line-height:1.6">تنبيه: بعض أدوات المحتوى الحالية محلية على هذا الجهاز وليست قاعدة بيانات مركزية.</div>`;
}
function swAdmById(id){
  document.querySelectorAll('.admp').forEach(x=>x.classList.remove('on'));const p=document.getElementById(id);if(p)p.classList.add('on');
  if(id==='ac')loadAdminClasses();if(id==='alib')loadAdminLibrary();if(id==='ak')loadAdminCoupons();if(id==='agc')loadAdminGroupClasses();
}

async function loadAdminOverview(){
  const b=document.getElementById('ao-body'); if(!b)return;
  try{
    const [{count:studentsTotal},{count:teachersActive},{count:weekBookings},{data:revenue}]=await Promise.all([
      _sb.from('profiles').select('*',{count:'exact',head:true}).eq('role','student'),
      _sb.from('profiles').select('*',{count:'exact',head:true}).eq('role','teacher').eq('status','active'),
      _sb.from('bookings').select('*',{count:'exact',head:true}).gte('created_at',new Date(Date.now()-7*864e5).toISOString()),
      _sb.from('bookings').select('platform_share,created_at,status').in('status',['confirmed','completed']).gte('created_at',new Date(Date.now()-30*864e5).toISOString())
    ]);
    const monthlyRev=(revenue||[]).reduce((s,r)=>s+(+r.platform_share||0),0);
    b.style.textAlign=''; b.style.padding='';
    b.innerHTML=`<div class="admst"><div class="ast"><div class="astn">${studentsTotal||0}</div><div class="astl">إجمالي الطلاب</div></div><div class="ast"><div class="astn" style="color:var(--grl)">$${monthlyRev.toFixed(0)}</div><div class="astl">إيرادات الشهر</div></div><div class="ast"><div class="astn" style="color:#c39bd3">${teachersActive||0}</div><div class="astl">معلمون نشطون</div></div><div class="ast"><div class="astn" style="color:#5dade2">${weekBookings||0}</div><div class="astl">حصة هذا الأسبوع</div></div></div><div style="margin-top:1rem;font-size:.72rem;color:var(--tm);text-align:center">✅ البيانات محمّلة من Supabase مباشرة</div>`;
  }catch(e){b.innerHTML=`<div style="color:#e74c3c">تعذّر تحميل البيانات: ${escapeHtml(e.message||e)}</div>`;}
}
async function loadAdminUsers(){
  const b=document.getElementById('au-body'); if(!b)return;
  
  const addForm = `
    <div style="background:linear-gradient(135deg,rgba(39,174,96,.08),rgba(39,174,96,.02));border:1px solid rgba(39,174,96,.2);border-radius:14px;padding:.9rem;margin-bottom:.9rem">
      <div style="display:flex;align-items:center;gap:.45rem;margin-bottom:.6rem">
        <span style="font-size:1.05rem">➕</span>
        <div style="font-size:.76rem;font-weight:700">تسجيل حساب جديد</div>
      </div>
      <div style="font-size:.64rem;color:var(--tm);line-height:1.6;margin-bottom:.65rem">
        لمن لا يستطيع التسجيل بنفسه — أنشئ له حساباً وأرسل بياناته عبر واتساب
      </div>

      <select id="ns-role" onchange="toggleTeacherFields()" style="width:100%;background:rgba(255,255,255,.06);border:1px solid var(--bd);border-radius:8px;color:#fff;padding:.5rem;font-family:Cairo,sans-serif;font-size:.72rem;margin-bottom:.5rem">
        <option value="student">👨‍🎓 طالب</option>
        <option value="teacher">👨‍🏫 معلم</option>
      </select>

      <input id="ns-name" class="ainp" placeholder="الاسم الكامل *" style="width:100%;margin-bottom:.4rem">
      <input id="ns-email" class="ainp" type="email" placeholder="البريد الإلكتروني *" dir="ltr" style="width:100%;margin-bottom:.4rem">
      <input id="ns-pw" class="ainp" placeholder="كلمة المرور (6 أحرف على الأقل) *" dir="ltr" style="width:100%;margin-bottom:.4rem">
      <input id="ns-phone" class="ainp" placeholder="رقم واتساب (اختياري)" dir="ltr" style="width:100%;margin-bottom:.4rem">

      <div id="teacher-fields" style="display:none;border-top:1px solid var(--bdl);margin-top:.6rem;padding-top:.7rem">
        <div style="font-size:.7rem;font-weight:700;color:var(--gl);margin-bottom:.5rem">👨‍🏫 بيانات المعلم</div>
        <input id="ns-title" class="ainp" placeholder="المسمى (مثل: معلم قرآن وتجويد) *" style="width:100%;margin-bottom:.4rem">
        <input id="ns-specs" class="ainp" placeholder="التخصصات — افصل بفاصلة *" style="width:100%;margin-bottom:.4rem">
        <div style="display:flex;gap:.4rem;margin-bottom:.4rem">
          <input id="ns-country" class="ainp" placeholder="الدولة" style="flex:2">
          <input id="ns-flag" class="ainp" placeholder="🇲🇦" style="flex:1;text-align:center">
        </div>
        <input id="ns-ijaza" class="ainp" placeholder="الإجازة أو المؤهل (اختياري)" style="width:100%;margin-bottom:.4rem">
        <textarea id="ns-bio" placeholder="نبذة تعريفية *" rows="3" style="width:100%;background:rgba(255,255,255,.06);border:1px solid var(--bd);border-radius:8px;color:#fff;padding:.5rem;font-family:Cairo,sans-serif;font-size:.7rem;resize:vertical;margin-bottom:.4rem"></textarea>
        <div style="display:flex;gap:.4rem;margin-bottom:.4rem">
          <input id="ns-price" class="ainp" type="number" placeholder="السعر $" value="12" style="flex:1">
          <select id="ns-ages" style="flex:2;background:rgba(255,255,255,.06);border:1px solid var(--bd);border-radius:8px;color:#fff;padding:.45rem;font-family:Cairo,sans-serif;font-size:.68rem">
            <option value="أطفال,شباب,كبار">جميع الأعمار</option>
            <option value="أطفال">أطفال فقط</option>
            <option value="شباب,كبار">شباب وكبار</option>
          </select>
        </div>
        <input id="ns-video" class="ainp" placeholder="رابط فيديو تعريفي (اختياري)" dir="ltr" style="width:100%;margin-bottom:.4rem;font-size:.66rem">
        <input id="ns-avatar" class="ainp" placeholder="رابط الصورة الشخصية (اختياري)" dir="ltr" style="width:100%;margin-bottom:.5rem;font-size:.66rem">
        <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem;font-size:.68rem">
          <input type="checkbox" id="ns-featured" style="width:16px;height:16px">
          <label for="ns-featured">⭐ مميّز</label>
          <input type="checkbox" id="ns-trial" checked style="width:16px;height:16px;margin-right:.6rem">
          <label for="ns-trial">🎁 حصة مجانية</label>
        </div>
      </div>

      <button class="btn bgo" style="width:100%" onclick="adminCreateUser()">➕ إنشاء الحساب</button>
      <div id="ns-status" style="font-size:.65rem;margin-top:.45rem;line-height:1.6"></div>
    </div>`;

  b.style.textAlign=''; b.style.padding='';
  b.innerHTML = addForm + '<div id="users-table-area"><div style="color:var(--tm);text-align:center;padding:1rem;font-size:.7rem">⏳ جاري تحميل المستخدمين...</div></div>';
  
  const area = document.getElementById('users-table-area');
  
  try{
    if(!_sb) throw new Error('لا اتصال بقاعدة البيانات');
    const {data,error}=await _sb.from('profiles').select('id,email,name,role,status,created_at').order('created_at',{ascending:false}).limit(100);
    if(error)throw error;
    
    if(!data||!data.length){
      if(area) area.innerHTML='<div style="color:var(--tm);text-align:center;padding:1.2rem;font-size:.72rem">لا مستخدمون بعد</div>';
      return;
    }
    
    const roleMap={student:['طالب','pgb'],teacher:['معلم','pgo'],admin:['مدير','pgr']};
    if(area) area.innerHTML=`<div style="overflow-x:auto"><table class="dt"><thead><tr><th>المستخدم</th><th>الدور</th><th>الحالة</th><th>إجراءات</th></tr></thead><tbody>${data.map(u=>{const r=roleMap[u.role]||['—','pgb'];const active=u.status!=='blocked';return `<tr><td><strong>${escapeHtml(u.name||'—')}</strong><br><small style="color:var(--tm)">${escapeHtml(u.email||'')}</small></td><td><span class="pill ${r[1]}">${r[0]}</span></td><td><span class="pill ${active?'pgg':'pgr'}">${active?'نشط':'معطّل'}</span></td><td><button class="ab abr" onclick="adminToggleUser('${u.id}',${active})">${active?'تعطيل':'تفعيل'}</button></td></tr>`;}).join('')}</tbody></table></div>`;
  }catch(e){
    if(area) area.innerHTML=`<div style="color:#e74c3c;text-align:center;padding:1rem;font-size:.7rem">تعذّر تحميل القائمة: ${escapeHtml(e.message||e)}</div>`;
  }
}
async function adminToggleUser(id,currentlyActive){
  try{const {error}=await _sb.from('profiles').update({status:currentlyActive?'blocked':'active'}).eq('id',id); if(error)throw error; toast(currentlyActive?'تم تعطيل الحساب':'تم تفعيل الحساب','s'); loadAdminUsers();}
  catch(e){toast('فشل: '+(e.message||e),'e');}
}
async function loadAdminFinance(){
  const b=document.getElementById('af-body'); if(!b)return;
  try{
    const [allBookingsRes,pendingRes,pendingPaymentsRes]=await Promise.all([
      _sb.from('bookings').select('package_price,teacher_share,platform_share,status,payment_status'),
      _sb.from('payouts').select('id,amount,method,status,teacher_id,profiles(name)').eq('status','pending').order('created_at',{ascending:false}),
      _sb.from('payments').select('id,booking_id,subscription_id,enrollment_id,gross_amount,currency,provider_ref,payment_status,created_at').eq('payment_status','pending').order('created_at',{ascending:false}).limit(30)
    ]);
    const paidRes=await _sb.from('payments').select('gross_amount').eq('payment_status','succeeded');
    setTimeout(()=>{try{loadAdminStatements();}catch(e){}},50);
    if(allBookingsRes.error)throw allBookingsRes.error;
    if(pendingRes.error)throw pendingRes.error;
    if(pendingPaymentsRes.error)throw pendingPaymentsRes.error;
    const allBookings=allBookingsRes.data,pending=pendingRes.data,pendingPayments=pendingPaymentsRes.data;
    // المقبوض فعلًا من الدفعات المؤكدة؛ والمستحق للمعلم وربح المنصة من الدروس المكتملة فقط
    const tot=(paidRes.data||[]).reduce((s,r)=>s+(+r.gross_amount||0),0);
    const done=(allBookings||[]).filter(r=>r.status==='completed'&&(+r.package_price||0)>0);
    const tSh=done.reduce((s,r)=>s+(+r.teacher_share||0),0);
    const pSh=done.reduce((s,r)=>s+(+r.platform_share||0),0);
    const adv=(allBookings||[]).filter(r=>r.status==='confirmed'&&r.payment_status==='paid').reduce((s,r)=>s+(+r.package_price||0),0);
    const pendSum=(pending||[]).reduce((s,r)=>s+(+r.amount||0),0);
    b.style.textAlign=''; b.style.padding='';
    const rows=(pending||[]).map(p=>`<tr><td>${escapeHtml(p.profiles?.name||'—')}</td><td style="color:var(--gl)">$${(+p.amount||0).toFixed(2)}</td><td>${escapeHtml(p.method||'—')}</td><td><button class="ab abg" onclick="adminApprovePayout('${p.id}')">موافقة</button><button class="ab abr" onclick="adminRejectPayout('${p.id}')">رفض</button></td></tr>`).join('')||`<tr><td colspan="4" style="text-align:center;color:var(--tm);padding:1rem">لا توجد طلبات سحب معلّقة</td></tr>`;
    const paymentRows=(pendingPayments||[]).map(p=>`<tr><td>${escapeHtml(p.provider_ref||String(p.id))}${p.subscription_id?'<div style="font-size:.56rem;color:var(--go)">اشتراك</div>':''}${p.enrollment_id?'<div style="font-size:.56rem;color:var(--go)">دورة جماعية</div>':''}</td><td style="color:var(--gl)">${escapeHtml(p.currency||'USD')} ${(+p.gross_amount||0).toFixed(2)}</td><td>${new Date(p.created_at).toLocaleString('ar-u-nu-latn')}</td><td><button class="ab abg" onclick="adminConfirmPayment(${p.id})">تأكيد الدفع</button></td></tr>`).join('')||`<tr><td colspan="4" style="text-align:center;color:var(--tm);padding:1rem">لا توجد دفعات معلّقة</td></tr>`;
    b.innerHTML=`<div class="admst"><div class="ast"><div class="astn">$${tot.toFixed(2)}</div><div class="astl">المقبوض فعلًا</div></div><div class="ast"><div class="astn" style="color:#5dade2">$${adv.toFixed(2)}</div><div class="astl">مقبوض عن دروس لم تُقدَّم</div></div><div class="ast"><div class="astn" style="color:var(--gl)">$${tSh.toFixed(2)}</div><div class="astl">مستحق للمعلمين (دروس مكتملة)</div></div><div class="ast"><div class="astn" style="color:var(--grl)">$${pSh.toFixed(2)}</div><div class="astl">ربح المنصة المحقَّق</div></div></div>${pendSum>0?`<div style="font-size:.68rem;color:var(--tm);margin-top:.5rem">طلبات سحب معلّقة: <b style="color:var(--gl)">$${pendSum.toFixed(2)}</b></div>`:''}<div style="overflow-x:auto;margin-top:.85rem"><table class="dt"><thead><tr><th>المعلم</th><th>المبلغ</th><th>الطريقة</th><th>إجراء</th></tr></thead><tbody>${rows}</tbody></table></div><div style="overflow-x:auto;margin-top:.85rem"><div style="font-size:.78rem;font-weight:700;margin-bottom:.45rem;color:var(--gl)">💳 دفعات بانتظار التأكيد</div><table class="dt"><thead><tr><th>المرجع</th><th>المبلغ</th><th>التاريخ</th><th>إجراء</th></tr></thead><tbody>${paymentRows}</tbody></table></div>`;
  }catch(e){b.innerHTML=`<div style="color:#e74c3c;text-align:center;padding:1rem">تعذّر تحميل البيانات المالية: ${escapeHtml(e.message||e)}</div>`;}
}
async function adminConfirmPayment(id){
  if(!confirm('تأكيد استلام هذا الدفع؟'))return;
  try{const {error}=await _sb.rpc('confirm_payment',{p_payment_id:Number(id)});if(error)throw error;toast('تم تأكيد الدفع وربط الحجز به ✅','s');loadAdminFinance();loadAdminBookings();}
  catch(e){toast('فشل تأكيد الدفع: '+(e.message||e),'e');}
}
async function adminApprovePayout(id){try{const {error}=await _sb.rpc('admin_set_payout_status',{p_payout_id:Number(id),p_status:'processing'}); if(error)throw error; toast('تمت الموافقة ✅','s'); loadAdminFinance();}catch(e){toast('فشل: '+(e.message||e),'e');}}
async function adminRejectPayout(id){try{const {error}=await _sb.rpc('admin_set_payout_status',{p_payout_id:Number(id),p_status:'cancelled'}); if(error)throw error; toast('تم الرفض','i'); loadAdminFinance();}catch(e){toast('فشل: '+(e.message||e),'e');}}
async function loadAdminBookings(){
  const b=document.getElementById('ab-body'); if(!b)return;
  const view=window._admBkView||'single';
  const seg=`<div style="display:flex;gap:.4rem;margin-bottom:.75rem"><button class="btn bsm ${view==='single'?'bgo':'bgh'}" style="flex:1;font-size:.66rem" onclick="window._admBkView='single';loadAdminBookings()">الحجوزات المنفردة</button><button class="btn bsm ${view==='subs'?'bgo':'bgh'}" style="flex:1;font-size:.66rem" onclick="window._admBkView='subs';loadAdminBookings()">الاشتراكات</button><button class="btn bsm ${view==='cohorts'?'bgo':'bgh'}" style="flex:1;font-size:.66rem" onclick="window._admBkView='cohorts';loadAdminBookings()">الدورات</button></div>`;
  b.style.textAlign=''; b.style.padding='';
  if(view==='subs')return loadAdminSubscriptions(b,seg);
  if(view==='cohorts')return loadAdminCohorts(b,seg);
  try{
    const [{data,error},payRes]=await Promise.all([
      _sb.from('bookings').select('id,student_name,teacher_name,hall,date,time,package_price,status,payment_status,type').is('subscription_id',null).order('created_at',{ascending:false}).limit(60),
      _sb.from('payments').select('id,booking_id').eq('payment_status','pending')
    ]);
    if(error)throw error;
    const pendPay=new Map((payRes&&payRes.data||[]).map(p=>[String(p.booking_id),p.id]));
    if(!data||!data.length){b.innerHTML=seg+'<div style="color:var(--tm);text-align:center;padding:2rem">لا توجد حجوزات منفردة</div>';return;}
    const statusMap={confirmed:['مؤكد','pgg'],pending:['معلق','pgb'],cancelled:['ملغي','pgr'],completed:['مكتمل','pgg'],no_show:['لم يحضر','pgr']};
    b.innerHTML=seg+`<div style="overflow-x:auto"><table class="dt"><thead><tr><th>الطالب</th><th>المعلم</th><th>السعر</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>${data.map(r=>{const s=statusMap[r.status]||['—','pgb'];const d=r.date?new Date(r.date).toLocaleDateString('ar-u-nu-latn',{month:'short',day:'numeric'}):'—';return `<tr><td><strong>${escapeHtml(r.student_name||'—')}</strong>${r.type==='trial'?' <small style="color:var(--go)">تجريبي</small>':''}<br><small style="color:var(--tm)">${d} • ${escapeHtml(r.time||'')}</small></td><td>${escapeHtml(r.teacher_name||'—')}</td><td style="color:var(--gl)">$${(+r.package_price||0).toFixed(0)}</td><td><span class="pill ${s[1]}">${s[0]}</span></td><td><div style="display:flex;flex-direction:column;gap:.3rem;align-items:stretch">${r.status==='pending'?((r.payment_status==='paid'||(+r.package_price||0)===0)?`<button class="ab abg" onclick="adminConfirmBk('${r.id}')">تأكيد</button>`:(pendPay.has(String(r.id))?`<button class="ab abg" onclick="adminConfirmPayment(${pendPay.get(String(r.id))})">تأكيد الدفع</button>`:`<span style="font-size:.6rem;color:var(--tm)">بانتظار الدفع</span>`))+`<button class="ab abr" onclick="adminCancelBk('${r.id}')">إلغاء</button>`:r.status==='confirmed'?`<button class="ab abr" onclick="adminCancelBk('${r.id}')">إلغاء</button>`:'—'}</div></td></tr>`;}).join('')}</tbody></table></div>`;
  }catch(e){b.innerHTML=seg+`<div style="color:#e74c3c;text-align:center;padding:1rem">تعذّر تحميل الحجوزات: ${escapeHtml(e.message||e)}</div>`;}
}
async function loadAdminSubscriptions(b,seg){
  try{
    const {data,error}=await _sb.from('subscriptions').select('*,subscription_slots(weekday,start_time),payments(id,provider_ref,payment_status)').order('created_at',{ascending:false}).limit(60);
    if(error)throw error;
    const days=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
    const st={pending_payment:['بانتظار الدفع','pgb'],active:['نشط','pgg'],expired:['منتهٍ','pgr'],cancelled:['ملغى','pgr']};
    if(!data||!data.length){b.innerHTML=seg+'<div style="color:var(--tm);text-align:center;padding:2rem">لا اشتراكات بعد</div>';return;}
    b.innerHTML=seg+data.map(x=>{
      const s=st[x.status]||['—','pgb'];
      const slots=(x.subscription_slots||[]).sort((a,c)=>a.weekday-c.weekday||String(a.start_time).localeCompare(String(c.start_time))).map(y=>days[y.weekday]+' '+String(y.start_time).slice(0,5)).join('، ');
      const pay=(x.payments||[]).find(p=>p.payment_status==='pending');
      const acts=x.status==='pending_payment'?(pay?`<button class="ab abg" onclick="adminConfirmPayment(${pay.id})">تأكيد الدفع</button>`:'')+`<button class="ab abr" onclick="adminCancelSub('${x.id}')">إلغاء</button>`:x.status==='active'?`<button class="ab abr" onclick="adminCancelActiveSub('${x.id}')">إلغاء الاشتراك وحساب الرد</button>`:(x.refund_amount?`<span style="font-size:.6rem;color:#e67e73">مستحق ردّه: $${Number(x.refund_amount).toFixed(2)}</span>`:'');
      return `<div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.7rem .8rem;margin-bottom:.5rem">
        <div style="display:flex;justify-content:space-between;gap:.5rem;align-items:center"><div style="font-size:.76rem;font-weight:800">${escapeHtml(x.student_name||'—')} ← ${escapeHtml(x.teacher_name||'—')}</div><span class="pill ${s[1]}">${s[0]}</span></div>
        <div style="font-size:.64rem;color:var(--tm);line-height:1.9;margin-top:.25rem">
          <div>🗓 ${escapeHtml(slots)} (بتوقيت المعلم)</div>
          <div>🔢 ${x.lessons_total} درسًا${x.lessons_generated?' • وُلِّد '+x.lessons_generated:''} • 💰 $${(+x.amount||0).toFixed(2)}${x.renews_from?' • تجديد':''}</div>
          ${x.starts_on?`<div>📆 ${escapeHtml(x.starts_on)} ← ${escapeHtml(x.ends_on||'')}</div>`:''}
          ${pay?`<div>🔖 ${escapeHtml(pay.provider_ref||'')}</div>`:''}
        </div>${acts?`<div style="display:flex;gap:.4rem;margin-top:.45rem">${acts}</div>`:''}</div>`;
    }).join('');
  }catch(e){b.innerHTML=seg+`<div style="color:#e74c3c;text-align:center;padding:1rem">تعذّر تحميل الاشتراكات: ${escapeHtml(e.message||e)}</div>`;}
}
async function adminCancelSub(id){
  if(!confirm('إلغاء طلب الاشتراك وتحرير مواعيده؟'))return;
  const {data,error}=await _sb.rpc('cancel_pending_subscription',{p_subscription_id:id});
  if(error||!data?.ok){toast((error&&error.message)||data?.error||'تعذّر الإلغاء','e');return;}
  toast('أُلغي الاشتراك','i');loadAdminBookings();
}
async function adminConfirmBk(id){try{const{error}=await _sb.rpc('admin_set_booking_status',{p_booking_id:id,p_status:'confirmed'}); if(error)throw error; toast('تم التأكيد ✅','s'); loadAdminBookings();}catch(e){toast('فشل: '+(e.message||e),'e');}}
async function adminCancelBk(id){if(!confirm('إلغاء الحجز؟'))return; try{const{error}=await _sb.rpc('admin_set_booking_status',{p_booking_id:id,p_status:'cancelled'}); if(error)throw error; toast('تم الإلغاء','i'); loadAdminBookings();}catch(e){toast('فشل: '+(e.message||e),'e');}}
// ============================================================
//  PRICING SYSTEM — Single source of truth
// ============================================================
// أدوات العروض — لا تغيّر السعر في العميل؛ السعر النهائي يحدده الخادم.
let appliedPromo = null;
function applyPromo(){
  const inp=document.getElementById('promo-inp');
  const code=(inp?.value||'').trim().toUpperCase();
  if(!code){toast('أدخل رمز الخصم أولاً','e');return;}
  const promo=Array.isArray(PR?.promoCodes)?PR.promoCodes.find(p=>String(p.code||'').toUpperCase()===code&&p.active):null;
  if(!promo){toast('رمز الخصم غير صالح أو غير مفعّل','e');return;}
  // الخصم لا يُطبّق محلياً لأن قاعدة البيانات يجب أن تتحقق منه لاحقاً.
  appliedPromo=promo;
  const row=document.getElementById('promo-applied');
  const txt=document.getElementById('promo-applied-txt');
  if(row) row.style.display='flex';
  if(txt) txt.textContent=`${code} — ${Number(promo.discount)||0}% (سيُتحقق منه عند التأكيد)`;
  toast('تم التعرف على الرمز. سيُتحقق من الخصم عند التأكيد.','i');
}
function removePromo(){
  appliedPromo=null;
  const row=document.getElementById('promo-applied');
  const inp=document.getElementById('promo-inp');
  if(row) row.style.display='none';
  if(inp) inp.value='';
}
function updPkgCalc(i){
  if(!PR?.packages?.[i]) return;
  const p=PR.packages[i];
  p.price=Math.max(1,Number(p.price)||1);
  const c=PR.currency||'$';
  const t=(p.price*0.75).toFixed(2),pl=(p.price*0.25).toFixed(2);
  const box=document.getElementById('pkg-list');
  if(box) renderPkgList();
}

// ============================================================
const PRICING_KEY = 'mm_pricing_v1';
let PR = loadPricing();
PR.teacherSplit = 75;
PR.currency = '$';
PR.paymentMethods = ['whatsapp','bank'];

function loadPricing(){
  try{
    const s = localStorage.getItem(PRICING_KEY);
    if(s) return JSON.parse(s);
  }catch(e){}
  return {
    currency: '$',
    lessonDuration: 60,
    teacherSplit: 75,
    packages: [
      {id:1, name:'حصة واحدة', lessons:1, price:12, discount:0, highlight:false, active:true},
      {id:2, name:'5 حصص',    lessons:5, price:50,  discount:17, highlight:true,  active:true},
      {id:3, name:'10 حصص',   lessons:10,price:90,  discount:25, highlight:false, active:true},
    ],
    promoCodes: [],
    freeTrialEnabled: true,
    paymentMethods: ['whatsapp','bank'],
  };
}

function savePricing(){
  try{ localStorage.setItem(PRICING_KEY, JSON.stringify(PR)); }catch(e){}
  applyPricingEverywhere();
}

function applyPricingEverywhere(){
  const c = PR.currency;
  const basePrice = PR.packages.find(p=>p.lessons===1)?.price || 12;
  // Booking page
  const bkDisp = document.getElementById('bk-price-disp');
  if(bkDisp) bkDisp.textContent = c+basePrice;
  const bkDur = document.getElementById('bk-dur-disp');
  if(bkDur) bkDur.textContent = PR.lessonDuration+' دقيقة • مع معلم متخصص';
  const bpkg = document.getElementById('b-pkg');
  if(bpkg) bpkg.value = basePrice;

  // Home pricing cards
  rebuildPricingCards();
}

function rebuildPricingCards(){
  const grid = document.querySelector('.prc-grid');
  if(!grid) return;
  const c = PR.currency;
  const platSplit = 100 - PR.teacherSplit;
  const active = PR.packages.filter(p=>p.active);
  grid.innerHTML = active.map((p,i)=>{
    const perLesson = (p.price/p.lessons).toFixed(0);
    const origPrice = p.lessons * (PR.packages.find(x=>x.lessons===1)?.price||12);
    const saved = origPrice - p.price;
    const tShare = (p.price * PR.teacherSplit/100).toFixed(2);
    const pShare = (p.price * platSplit/100).toFixed(2);
    return `
    <div class="prc-c${p.highlight?' best':''}" onclick="goP('p-book')">
      ${p.highlight?`<div class="prc-best-tag"></div>`:''}
      <div class="prc-nm" id="prc-nm-${i}">${p.name}</div>
      <div class="prc-pr" id="prc-pr-${i}">${c}${p.price}</div>
      <div class="prc-per" id="prc-per-${i}">${p.lessons>1?`${c}${perLesson}/درس${saved>0?' — وفّر '+c+saved:''}`:PR.freeTrialEnabled?'درسك الأول مجاناً':'45 دقيقة مباشرة'}</div>
      <div class="prc-feats" id="prc-fl-${i}">
        ${p.lessons>1?`<div class="prc-feat">${PR.lessonDuration} دق × ${p.lessons} دروس</div>`:`<div class="prc-feat">${PR.lessonDuration} دقيقة مباشرة</div>`}
        <div class="prc-feat">اختيار المعلم</div>
        ${p.lessons>1?'<div class="prc-feat">إثبات إتمام عند توفره</div>':'<div class="prc-feat">بدون بطاقة</div>'}
        ${p.discount>0?`<div class="prc-feat">توفير ${p.discount}%</div>`:''}
      </div>
      ${p.lessons>1?`<div class="prc-split" id="prc-split-${i}">المعلم ${c}${tShare} • المنصة ${c}${pShare}</div>`:''}
      <button class="btn ${p.highlight?'bgo':'bgh'} bfw" id="prc-btn-${i}" onclick="goP('p-book')">${p.lessons>1?'اشترِ الآن':'ابدأ مجاناً'}</button>
    </div>`;
  }).join('');
}

async function loadAdminSettings(){
  const b=document.getElementById('ast-body'); if(!b)return;
  const c = PR.currency;
  const platSplit = 100 - PR.teacherSplit;

  b.innerHTML = `
  <div style="display:flex;flex-direction:column;gap:1.1rem">

    <!-- PRICING OVERVIEW -->
    <div style="background:linear-gradient(135deg,rgba(212,175,106,.12),rgba(212,175,106,.04));border:1px solid rgba(212,175,106,.3);border-radius:12px;padding:1rem">
      <div style="font-size:.8rem;font-weight:700;color:var(--gl);margin-bottom:.75rem">💰 ملخص النظام المالي الحالي</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.55rem">
        <div style="background:rgba(255,255,255,.05);border-radius:9px;padding:.65rem;text-align:center">
          <div style="font-size:1.4rem;font-weight:900;color:var(--gl)" id="ov-base">${c}${PR.packages.find(p=>p.lessons===1)?.price||12}</div>
          <div style="font-size:.6rem;color:var(--tm)">سعر الحصة</div>
        </div>
        <div style="background:rgba(255,255,255,.05);border-radius:9px;padding:.65rem;text-align:center">
          <div style="font-size:1.4rem;font-weight:900;color:var(--grl)" id="ov-tsplit">${PR.teacherSplit}%</div>
          <div style="font-size:.6rem;color:var(--tm)">حصة المعلم</div>
        </div>
        <div style="background:rgba(255,255,255,.05);border-radius:9px;padding:.65rem;text-align:center">
          <div style="font-size:1.4rem;font-weight:900;color:#5dade2" id="ov-psplit">${platSplit}%</div>
          <div style="font-size:.6rem;color:var(--tm)">حصة المنصة</div>
        </div>
      </div>
    </div>

    <!-- BASE PRICE -->
    <div style="background:rgba(255,255,255,.03);border:1px solid var(--bdl);border-radius:12px;padding:1rem">
      <div style="font-size:.8rem;font-weight:700;margin-bottom:.75rem">💵 سعر الحصة الأساسية</div>
      <div style="display:flex;align-items:center;gap:.6rem">
        <div class="fc" style="width:60px;text-align:center;opacity:.7" title="العملة الحالية في الإصدار الأول: USD">$</div>
        <input type="number" id="pr-base" class="fc" value="${PR.packages.find(p=>p.lessons===1)?.price||12}" min="1" max="500" style="flex:1" oninput="updBasePrice(this.value)">
        <div style="font-size:.7rem;color:var(--tm);flex-shrink:0">/حصة • ${PR.lessonDuration} دق</div>
      </div>
      <div style="margin-top:.65rem">
        <label style="font-size:.7rem;color:var(--tm)">مدة الحصة (دقيقة)</label>
        <div style="display:flex;gap:.38rem;margin-top:.3rem">
          ${[30,45,60,90].map(d=>`<button class="btn bsm ${PR.lessonDuration===d?'bgo':'bgh'}" onclick="PR.lessonDuration=${d};document.querySelectorAll('#dur-btns .btn').forEach(b=>b.className='btn bsm bgh');this.className='btn bsm bgo';savePricing()" id="dur-btns">${d} دق</button>`).join('')}
        </div>
      </div>
    </div>

    <!-- SPLIT RATIO -->
    <div style="background:rgba(255,255,255,.03);border:1px solid var(--bdl);border-radius:12px;padding:1rem">
      <div style="font-size:.8rem;font-weight:700;margin-bottom:.55rem">⚖️ توزيع الأرباح</div>
      <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.45rem">
        <span style="font-size:.7rem;color:var(--grl);width:70px">معلم <span id="sl-tv">${PR.teacherSplit}%</span></span>
        <input type="range" id="split-sl" min="75" max="75" value="75" disabled style="flex:1;accent-color:var(--go);opacity:.65" title="النسبة ثابتة: 75% للمعلم و25% للمنصة">
        <span style="font-size:.7rem;color:#5dade2;width:70px;text-align:left">منصة <span id="sl-pv">${platSplit}%</span></span>
      </div>
      <div style="height:10px;border-radius:100px;overflow:hidden;display:flex;margin-bottom:.55rem">
        <div id="split-bar-t" style="width:${PR.teacherSplit}%;background:linear-gradient(90deg,var(--gr),var(--grl));transition:width .3s"></div>
        <div id="split-bar-p" style="flex:1;background:linear-gradient(90deg,#3498db,#5dade2)"></div>
      </div>
      <div style="font-size:.68rem;color:var(--tm)">
        مثال على حصة بـ ${c}${PR.packages.find(p=>p.lessons===1)?.price||12}:
        المعلم يأخذ <strong style="color:var(--grl)">${c}<span id="ex-t">${((PR.packages.find(p=>p.lessons===1)?.price||12)*PR.teacherSplit/100).toFixed(2)}</span></strong>
        والمنصة <strong style="color:#5dade2">${c}<span id="ex-p">${((PR.packages.find(p=>p.lessons===1)?.price||12)*platSplit/100).toFixed(2)}</span></strong>
      </div>
    </div>

    <!-- PACKAGES -->
    <div style="background:rgba(255,255,255,.03);border:1px solid var(--bdl);border-radius:12px;padding:1rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
        <div style="font-size:.8rem;font-weight:700">📦 الباقات</div>
        <button class="btn bgo bsm" onclick="addPkg()">+ إضافة باقة</button>
      </div>
      <div id="pkg-list" style="display:flex;flex-direction:column;gap:.5rem"></div>
    </div>

    <!-- PROMO CODES -->
    <div style="background:rgba(255,255,255,.03);border:1px solid var(--bdl);border-radius:12px;padding:1rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.75rem">
        <div style="font-size:.8rem;font-weight:700">🏷️ رموز الخصم (Promo Codes)</div>
        <button class="btn bgo bsm" onclick="addPromo()">+ إضافة</button>
      </div>
      <div id="promo-list" style="display:flex;flex-direction:column;gap:.4rem"></div>
      ${PR.promoCodes.length===0?'<div style="font-size:.72rem;color:var(--tm);text-align:center;padding:.5rem">لا توجد رموز خصم بعد</div>':''}
    </div>

    <!-- PAYMENT METHODS -->
    <div style="background:rgba(255,255,255,.03);border:1px solid var(--bdl);border-radius:12px;padding:1rem">
      <div style="font-size:.8rem;font-weight:700;margin-bottom:.75rem">💳 طرق الدفع</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.45rem">
        ${[['whatsapp','🟢 واتساب'],['bank','🏦 تحويل بنكي']].map(([k,l])=>`
        <div style="display:flex;align-items:center;justify-content:space-between;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:.5rem .7rem">
          <span style="font-size:.74rem">${l}</span>
          <div class="tgl ${PR.paymentMethods.includes(k)?'on':''}" onclick="togglePay('${k}',this)"></div>
        </div>`).join('')}
      </div>
    </div>

    <!-- TOGGLES -->
    <div style="background:rgba(255,255,255,.03);border:1px solid var(--bdl);border-radius:12px;padding:1rem">
      <div style="font-size:.8rem;font-weight:700;margin-bottom:.75rem">⚙️ إعدادات عامة</div>
      <div style="display:flex;flex-direction:column;gap:.55rem">
        <div style="display:flex;align-items:center;justify-content:space-between">
          <div><div style="font-size:.78rem;font-weight:600">الدرس التجريبي المجاني</div><div style="font-size:.65rem;color:var(--tm)">السماح للطلاب بدرس أول مجاني</div></div>
          <div class="tgl ${PR.freeTrialEnabled?'on':''}" onclick="PR.freeTrialEnabled=!PR.freeTrialEnabled;this.classList.toggle('on');savePricing();toast('تم الحفظ','s')"></div>
        </div>
      </div>
    </div>

    <!-- SAVE -->
    <button class="btn bgo bfw" style="margin-top:.3rem" onclick="savePricingFull()">💾 حفظ جميع الإعدادات المالية</button>
  </div>`;

  renderPkgList();
  renderPromoList();
}

function updBasePrice(v){
  const pkg1 = PR.packages.find(p=>p.lessons===1);
  if(pkg1) pkg1.price = parseFloat(v)||12;
  updPrOv();
}

function updSplit(v){
  PR.teacherSplit = 75;
  const plat = 100 - PR.teacherSplit;
  const el = id => document.getElementById(id);
  if(el('sl-tv')) el('sl-tv').textContent = v+'%';
  if(el('sl-pv')) el('sl-pv').textContent = plat+'%';
  if(el('split-bar-t')) el('split-bar-t').style.width = v+'%';
  const base = PR.packages.find(p=>p.lessons===1)?.price||12;
  if(el('ex-t')) el('ex-t').textContent = (base*PR.teacherSplit/100).toFixed(2);
  if(el('ex-p')) el('ex-p').textContent = (base*plat/100).toFixed(2);
  updPrOv();
}

function updPrOv(){
  const c = PR.currency;
  const plat = 100-PR.teacherSplit;
  const base = PR.packages.find(p=>p.lessons===1)?.price||12;
  const el = id => document.getElementById(id);
  if(el('ov-base')) el('ov-base').textContent = c+base;
  if(el('ov-tsplit')) el('ov-tsplit').textContent = PR.teacherSplit+'%';
  if(el('ov-psplit')) el('ov-psplit').textContent = plat+'%';
}

function renderPkgList(){
  const c = PR.currency;
  const el = document.getElementById('pkg-list');
  if(!el) return;
  el.innerHTML = PR.packages.map((p,i)=>`
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:10px;padding:.72rem .85rem">
    <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.48rem">
      <input class="fc" value="${p.name}" style="flex:1;font-size:.76rem;padding:.35rem .55rem" onchange="PR.packages[${i}].name=this.value" placeholder="اسم الباقة">
      <div class="tgl ${p.active?'on':''}" onclick="PR.packages[${i}].active=!PR.packages[${i}].active;this.classList.toggle('on')"></div>
      ${p.lessons>1?`<button class="btn bsm abr" onclick="delPkg(${i})">🗑</button>`:''}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:.38rem">
      <div>
        <label style="font-size:.6rem;color:var(--tm)">عدد الحصص</label>
        <input type="number" class="fc" value="${p.lessons}" min="1" max="100" style="font-size:.75rem;padding:.32rem .5rem" onchange="PR.packages[${i}].lessons=parseInt(this.value)||1" ${p.lessons===1?'readonly':''}>
      </div>
      <div>
        <label style="font-size:.6rem;color:var(--tm)">السعر الإجمالي (${c})</label>
        <input type="number" class="fc" value="${p.price}" min="1" style="font-size:.75rem;padding:.32rem .5rem" onchange="PR.packages[${i}].price=parseFloat(this.value)||p.price;updPkgCalc(${i})">
      </div>
      <div>
        <label style="font-size:.6rem;color:var(--tm)">خصم %</label>
        <input type="number" class="fc" value="${p.discount}" min="0" max="99" style="font-size:.75rem;padding:.32rem .5rem" onchange="PR.packages[${i}].discount=parseInt(this.value)||0">
      </div>
    </div>
    <div style="display:flex;align-items:center;gap:.6rem;margin-top:.45rem">
      <div style="font-size:.65rem;color:var(--tm)">
        معلم: <strong style="color:var(--grl)">${c}${(p.price*PR.teacherSplit/100).toFixed(2)}</strong> •
        منصة: <strong style="color:#5dade2">${c}${(p.price*(100-PR.teacherSplit)/100).toFixed(2)}</strong>
      </div>
      <label style="margin-right:auto;font-size:.65rem;color:var(--go);display:flex;align-items:center;gap:.25rem;cursor:pointer">
        <input type="checkbox" ${p.highlight?'checked':''} onchange="PR.packages[${i}].highlight=this.checked"> مميزة
      </label>
    </div>
  </div>`).join('');
}

function addPkg(){
  const newId = Math.max(...PR.packages.map(p=>p.id),0)+1;
  const base = PR.packages.find(p=>p.lessons===1)?.price||12;
  PR.packages.push({id:newId,name:'باقة جديدة',lessons:3,price:base*3,discount:0,highlight:false,active:true});
  renderPkgList();
}

function delPkg(i){
  if(!confirm('حذف هذه الباقة؟')) return;
  PR.packages.splice(i,1);
  renderPkgList();
  toast('تم حذف الباقة','i');
}

function renderPromoList(){
  const el = document.getElementById('promo-list');
  if(!el) return;
  if(!PR.promoCodes.length){el.innerHTML='';return;}
  el.innerHTML = PR.promoCodes.map((p,i)=>`
  <div style="display:flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07);border-radius:9px;padding:.55rem .75rem">
    <input class="fc" value="${p.code}" style="flex:1;font-size:.76rem;padding:.3rem .5rem;font-family:monospace;text-transform:uppercase" onchange="PR.promoCodes[${i}].code=this.value.toUpperCase()">
    <input type="number" class="fc" value="${p.discount}" min="1" max="100" style="width:60px;font-size:.75rem;padding:.3rem .5rem" onchange="PR.promoCodes[${i}].discount=parseInt(this.value)">
    <span style="font-size:.7rem;color:var(--tm)">%</span>
    <div class="tgl ${p.active?'on':''}" onclick="PR.promoCodes[${i}].active=!PR.promoCodes[${i}].active;this.classList.toggle('on')"></div>
    <button class="btn bsm abr" onclick="PR.promoCodes.splice(${i},1);renderPromoList();toast('تم الحذف','i')">🗑</button>
  </div>`).join('');
}

function addPromo(){
  const code = 'CODE'+Math.random().toString(36).substring(2,6).toUpperCase();
  PR.promoCodes.push({code, discount:10, active:true, uses:0});
  renderPromoList();
  const pl = document.getElementById('promo-list');
  if(pl) pl.previousSibling?.remove?.();
}

function togglePay(k,el){
  const i = PR.paymentMethods.indexOf(k);
  if(i>-1) PR.paymentMethods.splice(i,1);
  else PR.paymentMethods.push(k);
  el.classList.toggle('on');
}

async function savePricingFull(){
  savePricing();
  // Try to save to Supabase settings table
  try{
    if(_sb){
      await _sb.from('settings').upsert({key:'pricing',value:JSON.stringify(PR)});
    }
  }catch(e){console.log('Supabase save:',e);}
  toast('✅ تم حفظ جميع الإعدادات المالية وتطبيقها فوراً!','s');
  // Reload settings panel to show updated values
  setTimeout(loadAdminSettings, 500);
}

async function adminToggleSetting(key,el){
  const newVal=!el.classList.contains('on');
  el.classList.toggle('on');
  try{if(_sb){const{error}=await _sb.from('settings').upsert({key,value:String(newVal)});if(error)throw error;}
  toast(newVal?'تم التفعيل':'تم الإيقاف','s');}
  catch(e){el.classList.toggle('on');toast('فشل: '+(e.message||e),'e');}
}
async function loadAdminLog(){
  const b=document.getElementById('alg-body'); if(!b)return;
  try{
    const {data,error}=await _sb.from('activity_log').select('*').order('created_at',{ascending:false}).limit(30);
    if(error)throw error;
    if(!data||!data.length){b.innerHTML='<div style="color:var(--tm);text-align:center;padding:2rem">لا يوجد سجلات بعد</div>';return;}
    const typeMap={success:'s',warning:'w',error:'e',info:'w'};
    b.style.textAlign=''; b.style.padding='';
    b.innerHTML=data.map(r=>{const t=new Date(r.created_at).toLocaleString('ar');return `<div class="logi"><div class="logd ${typeMap[r.details?.type]||'w'}"></div><div><div>${escapeHtml(r.action||r.details?.description||'')}</div><div class="logt">${t}</div></div></div>`;}).join('');
  }catch(e){b.innerHTML=`<div style="color:#e74c3c;text-align:center;padding:1rem">تعذّر تحميل السجل: ${escapeHtml(e.message||e)}</div>`;}
}
function openMo(id){document.getElementById(id)?.classList.add('on');}
function closeMo(id){document.getElementById(id)?.classList.remove('on');}
function toast(msg,type='i'){
  const c=document.getElementById('tc');if(!c)return;
  const ic={s:'✅',e:'❌',i:'ℹ️'};const cl={s:'ts',e:'te',i:'ti'};
  const el=document.createElement('div');el.className='toast '+(cl[type]||'ti');
  el.replaceChildren(Object.assign(document.createElement('span'),{textContent:ic[type]||'ℹ️'}),Object.assign(document.createElement('span'),{textContent:String(msg??'')}));
  c.appendChild(el);
  setTimeout(()=>{el.style.animation='tout .28s ease forwards';setTimeout(()=>el.remove(),280);},3500);
}

function tPwd(id,b){const f=document.getElementById(id);if(!f)return;if(f.type==='password'){f.type='text';b.textContent='🙈';}else{f.type='password';b.textContent='👁';}}
async function mkChart(){
  const g=document.getElementById('rev-ch');if(!g)return;
  const empty=msg=>{g.innerHTML=`<div style="width:100%;text-align:center;color:var(--tm);font-size:.68rem;padding:1.4rem .5rem">${msg}</div>`;};
  if(!_sb||!CU||CU.role!=='teacher'){empty('ستظهر الأرباح الحقيقية بعد تسجيل دخول المعلم ووجود مدفوعات ناجحة.');return;}
  try{
    const from=new Date();from.setDate(from.getDate()-41);
    const {data,error}=await _sb.from('payments').select('teacher_amount,paid_at').eq('teacher_id',CU.id).eq('payment_status','succeeded').gte('paid_at',from.toISOString());
    if(error)throw error;
    const weeks=Array.from({length:6},(_,i)=>({sum:0,label:`أسبوع ${i+1}`}));
    (data||[]).forEach(r=>{const dt=new Date(r.paid_at);if(Number.isNaN(dt.getTime()))return;const age=Math.floor((Date.now()-dt.getTime())/(7*86400000));const idx=Math.max(0,Math.min(5,5-age));weeks[idx].sum+=Number(r.teacher_amount)||0;});
    if(!(data||[]).length){empty('لا توجد مدفوعات ناجحة بعد.');return;}
    const mx=Math.max(...weeks.map(x=>x.sum),0.01);
    g.innerHTML=weeks.map(v=>`<div class="chcl"><div class="chvl">$${v.sum.toFixed(2)}</div><div class="chbw"><div class="chb go" style="height:${Math.max(4,(v.sum/mx)*70)}px"></div></div><div class="chlb">${v.label}</div></div>`).join('');
  }catch(e){empty('تعذّر تحميل بيانات الأرباح الحقيقية حالياً.');console.warn('mkChart:',e.message||e);}
}

// ══════════════════════════════════════════════
//  WORLD-CLASS SYSTEMS
// ══════════════════════════════════════════════
let FAVS=[];try{FAVS=JSON.parse(localStorage.getItem('mm_favs')||'[]');}catch(e){}
function saveFavs(){try{localStorage.setItem('mm_favs',JSON.stringify(FAVS));}catch(e){}}
function toggleFavTeacher(tid){const i=FAVS.indexOf(tid);if(i>-1){FAVS.splice(i,1);toast('أُزيل من المفضلة','i');}else{FAVS.push(tid);toast('أُضيف إلى المفضلة ❤️','s');}saveFavs();const btn=document.getElementById('tp-fav-btn');if(btn)btn.textContent=FAVS.includes(tid)?'❤️':'🤍';renderFavorites();}
function renderFavorites(){const el=document.getElementById('favs-list');if(!el)return;if(!FAVS.length){el.innerHTML='<div class="fav-empty"><div style="font-size:2rem">🤍</div><div style="font-size:.8rem;font-weight:700;margin:.5rem 0 .3rem">لا توجد مفضلات بعد</div><div style="font-size:.72rem;margin-bottom:.85rem">ابحث عن معلمين وأضفهم لمفضلتك</div><button class="btn bgo" onclick="goP(\'p-find-teacher\')">🔍 ابحث</button></div>';return;}el.innerHTML='<div style="padding:0 1rem .5rem;font-size:.78rem;color:var(--tm)">'+FAVS.length+' معلم محفوظ</div>'+FAVS.map(id=>'<div style="margin:.4rem 1rem;background:rgba(255,255,255,.03);border:1px solid var(--bdl);border-radius:12px;padding:.75rem;display:flex;align-items:center;gap:.65rem;cursor:pointer" onclick="openTeacherProfile(\''+id+'\')"><div style="width:42px;height:42px;border-radius:50%;background:linear-gradient(135deg,var(--go),var(--gl));display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:700;color:var(--navy)">م</div><div style="flex:1"><div style="font-size:.8rem;font-weight:700">معلم محفوظ</div><div style="font-size:.65rem;color:var(--tm)">اضغط لعرض الملف</div></div><button onclick="event.stopPropagation();toggleFavTeacher(\''+id+'\')" style="background:none;border:none;font-size:1.2rem;cursor:pointer">❤️</button></div>').join('');}
function initReferral(){if(!CU)return;const code='MM-'+btoa(CU.email||'guest').replace(/[^A-Z0-9]/g,'').substring(0,5);const el=document.getElementById('ref-code');if(el)el.textContent=code;}
function copyRefCode(){const code=document.getElementById('ref-code')?.textContent;if(!code)return;navigator.clipboard?.writeText(code).then(()=>toast('تم نسخ الكود ✅','s')).catch(()=>toast('الكود: '+code,'i'));}
function shareRef(){const code=document.getElementById('ref-code')?.textContent||'';window.open('https://wa.me/?text='+encodeURIComponent('🎓 انضم إلى منارة المعرفة!\nاستخدم كودي '+code+' واحصل على $5 خصم:\nmanarat-almaarifa.com'),'_blank');}
let currentStars=0,ratingTeacherId=null;
const starLabels=['','ضعيف 😕','مقبول 😐','جيد 🙂','جيد جداً 😊','ممتاز ⭐'];
function setStar(n){currentStars=n;document.querySelectorAll('.star-btn').forEach((b,i)=>b.classList.toggle('on',i<n));const lbl=document.getElementById('star-label');if(lbl)lbl.textContent=starLabels[n]||'';}
async function submitRating(){
  if(!currentStars){toast('اختر تقييمك أولاً','e');return;}
  if(!CU){toast('سجّل الدخول أولاً','e');return;}
  const comment=document.getElementById('rate-comment')?.value.trim()||'';
  // نستخدم آخر حجز مكتمل لهذا المعلم حتى يبقى نظام التقييم مرتبطاً بحجز حقيقي.
  try{
    if(!_sb){toast('لا اتصال بقاعدة البيانات','e');return;}
    const {data:bks,error}=await _sb.from('bookings').select('id,status,student_id,teacher_id,created_at').eq('student_id',CU.id).eq('teacher_id',ratingTeacherId).eq('status','completed').order('created_at',{ascending:false}).limit(20);
    if(error) throw error;
    if(!bks?.length){toast('يمكنك التقييم بعد إتمام درس مع هذا المعلم','e');return;}
    const ids=bks.map(b=>b.id);
    const {data:existingReviews,error:reviewErr}=await _sb.from('reviews').select('booking_id').in('booking_id',ids);
    if(reviewErr) throw reviewErr;
    const reviewed=new Set((existingReviews||[]).map(r=>r.booking_id));
    const bk=bks.find(b=>!reviewed.has(b.id));
    if(!bk){toast('لقد قيّمت جميع دروسك المكتملة مع هذا المعلم','e');return;}
    const result=await submitReview(bk.id,currentStars,comment);
    if(!result?.ok)return;
    currentStars=0;document.querySelectorAll('.star-btn').forEach(b=>b.classList.remove('on'));setTimeout(()=>goP('p-dash'),1200);
  }catch(e){toast('تعذّر إرسال التقييم: '+(e.message||e),'e');}
}
function openRatingPage(teacherName,teacherId){ratingTeacherId=teacherId;const el=document.getElementById('rate-teacher-nm');if(el)el.textContent='مع '+teacherName;currentStars=0;document.querySelectorAll('.star-btn').forEach(b=>b.classList.remove('on'));const lbl=document.getElementById('star-label');if(lbl)lbl.textContent='';const cm=document.getElementById('rate-comment');if(cm)cm.value='';goP('p-rate');}
let allTeachers=[],currentTeacherId=null;
async function loadTeachers(){try{if(_sb){const{data}=await _sb.from('public_teacher_directory').select('*').order('created_at',{ascending:false});if(data&&data.length){allTeachers=data;renderTeacherGrid(allTeachers);populateBookingTeachers();return;}}}catch(e){console.log(e);}renderTeacherGrid([]);}
function renderTeacherGrid(teachers){
  const el=document.getElementById('td-grid');if(!el)return;
  if(!teachers.length){el.innerHTML='<div style="text-align:center;padding:2rem;color:var(--tm)"><div style="font-size:2rem;margin-bottom:.65rem">👨‍🏫</div><div style="font-size:.82rem;font-weight:700;margin-bottom:.35rem">لا يوجد معلمون بعد</div><div style="font-size:.72rem;margin-bottom:.9rem">كن من أوائل المنضمين!</div><button class="btn bgo" onclick="goP(\'p-join\')">📩 انضم كمعلم</button></div>';return;}
  el.innerHTML=teachers.map(t=>{
    const id=escapeHtml(t.id||'');const name=escapeHtml(t.name||'—');const spec=escapeHtml(t.specialty||'—');const bio=escapeHtml(t.bio||'لا توجد نبذة');const photo=escapeHtml(t.photo_url||'');const price=Number(t.price)||12;const rating=Math.max(0,Math.min(5,Math.round(Number(t.rating)||0)));const langs=(t.languages||[]).map(l=>`<span class="tc-lang">${escapeHtml(l)}</span>`).join('');
    return `<div class="tc-card" onclick="openTeacherProfile('${id}')"><div class="tc-card-hd"><div class="tc-av" style="position:relative">${photo?`<img src="${photo}" alt="${name}" style="width:100%;height:100%;object-fit:cover">`:name.charAt(0)}${t.is_online?'<div class="tc-online"></div>':''}</div><div class="tc-info"><div class="tc-name">${name}</div><div class="tc-spec">${spec}</div><div class="tc-rating">${'★'.repeat(rating)}${'☆'.repeat(5-rating)}<span>${Number(t.rating)>0?Number(t.rating).toFixed(1):'—'} (${Number(t.review_count)||0})</span></div></div></div><div class="tc-card-bd"><div class="tc-langs">${langs}</div><div class="tc-bio-preview">${bio}</div><div class="tc-card-ft"><div class="tc-price">$${price}<span>/درس</span></div><div style="display:flex;gap:.65rem;align-items:center"><div class="tc-fav" onclick="event.stopPropagation();toggleFavTeacher('${id}')">${FAVS.includes(t.id)?'❤️':'🤍'}</div><button class="btn bgo bsm" onclick="event.stopPropagation();bookTeacher('${id}')">احجز</button></div></div></div></div>`;
  }).join('');
}
function filterBySubj(subj,btn){document.querySelectorAll('.td-filter').forEach(b=>b.classList.remove('on'));if(btn)btn.classList.add('on');renderTeacherGrid(subj==='all'?allTeachers:allTeachers.filter(t=>t.subject_category===subj));}
function filterTeachers(){const q=(document.getElementById('td-srch')?.value||'').toLowerCase();renderTeacherGrid(allTeachers.filter(t=>(t.name||'').toLowerCase().includes(q)||(t.specialty||'').toLowerCase().includes(q)));}
function sortTeachers(by){const s=[...allTeachers];if(by==='rating')s.sort((a,b)=>(b.rating||0)-(a.rating||0));else if(by==='price_asc')s.sort((a,b)=>(a.price||0)-(b.price||0));else if(by==='price_desc')s.sort((a,b)=>(b.price||0)-(a.price||0));renderTeacherGrid(s);}
async function openTeacherProfile(tid){
  currentTeacherId = tid;
  goP('p-teacher-profile');
  const t = await fetchTeacher(tid);
  if(t){ window._currentTeacher = t; populateTeacherProfile(t); }
  else { toast('تعذّر تحميل بيانات المعلم','e'); }
}
function populateTeacherProfile(t){
  const set = (id,val) => { const e=document.getElementById(id); if(e) e.textContent = val; };
  const setH = (id,val) => { const e=document.getElementById(id); if(e) e.innerHTML = val; };
  const hide = (id) => { const e=document.getElementById(id); if(e) e.style.display='none'; };
  const show = (id) => { const e=document.getElementById(id); if(e) e.style.display=''; };

  set('tp-name', t.name || '');
  set('tp-spec', t.title || t.specialty || '');
  set('tp-country', (t.flag||'🌍') + ' ' + (t.country||''));

  // التقييم — نخفيه إن لم يوجد بدل عرض —
  if(t.rating > 0){
    show('tp-rating-display');
    set('tp-rating-display', '⭐ ' + Number(t.rating).toFixed(1));
    set('tp-s3', Number(t.rating).toFixed(1));
    set('tp-rev-count', (t.review_count||0) + ' تقييم');
  } else {
    set('tp-rating-display', '🆕 معلم جديد');
    set('tp-s3', '—');
    set('tp-rev-count', 'لا تقييمات بعد');
  }

  set('tp-lessons-count', '📚 ' + (t.lessons||0) + ' درس');
  set('tp-s1', t.students || 0);
  set('tp-s2', t.lessons || 0);
  setH('tp-price', '$' + (t.price||12) + '<span style="font-size:.62rem;color:var(--tm)">/درس</span>');

  // النبذة
  const bioEl = document.getElementById('tp-bio');
  if(bioEl){
    if(t.bio){ bioEl.textContent = t.bio; bioEl.style.display=''; }
    else { bioEl.textContent = 'لم يضف المعلم نبذة بعد'; bioEl.style.opacity='.55'; }
  }

  // المؤهل
  const qualEl = document.getElementById('tp-qual');
  if(qualEl){
    if(t.ijaza){ qualEl.textContent = t.ijaza; qualEl.parentElement && (qualEl.parentElement.style.display=''); }
    else { qualEl.parentElement ? qualEl.parentElement.style.display='none' : qualEl.style.display='none'; }
  }

  /* [إصلاح] عرض الشهادة / الإجازة التي رفعها المدير (صورة تُعرض، وPDF رابط) */
  if(qualEl){
    let certBox=document.getElementById('tp-cert');
    if(!certBox){certBox=document.createElement('div');certBox.id='tp-cert';certBox.style.margin='-.35rem 0 .85rem';qualEl.insertAdjacentElement('afterend',certBox);}
    const cu=t.ijazaImage;
    if(cu && /^https:\/\//i.test(String(cu))){
      const su=escapeHtml(String(cu));
      certBox.innerHTML=/\.pdf(\?|$)/i.test(String(cu))
        ? '<a href="'+su+'" target="_blank" rel="noopener" class="btn bgh bsm" style="font-size:.7rem">📜 عرض الشهادة / الإجازة</a>'
        : '<a href="'+su+'" target="_blank" rel="noopener"><img src="'+su+'" alt="" loading="lazy" style="width:100%;max-width:420px;border-radius:10px;border:1px solid rgba(212,175,106,.25)"></a>';
      certBox.style.display='';
    } else { certBox.innerHTML=''; certBox.style.display='none'; }
  }

  // الصورة
  const av = document.getElementById('tp-avatar');
  if(av){
    av.innerHTML = t.avatar
      ? '<img src="'+t.avatar+'" style="width:100%;height:100%;object-fit:cover" alt="'+(t.name||'')+'">'
      : (t.name||'م')[0];
  }

  // اللغات
  const langs = document.getElementById('tp-langs');
  if(langs) langs.innerHTML = (t.languages||['العربية']).map(l=>'<span class="tp-lang">'+l+'</span>').join('');

  // الفيديو
  const vid = document.getElementById('tp-video');
  if(vid){
    if(t.video){
      const ytId = (typeof extractYouTubeId==='function') ? extractYouTubeId(t.video) : null;
      vid.innerHTML = ytId
        ? '<iframe src="https://www.youtube.com/embed/'+ytId+'" style="width:100%;height:190px;border:none;border-radius:12px" allowfullscreen></iframe>'
        : '<video src="'+t.video+'" controls style="width:100%;border-radius:12px"></video>';
      vid.style.display='';
    } else {
      vid.style.display='none';
    }
  }

  // التخصصات والمعلومات الإضافية
  const extra = document.getElementById('tp-extra');
  if(extra){
    let h = '';
    if(t.ijaza){
      h += '<div style="background:rgba(212,175,106,.08);border:1px solid rgba(212,175,106,.2);border-radius:12px;padding:.8rem;margin-bottom:.6rem">'
        + '<div style="font-size:.72rem;font-weight:700;color:var(--gl);margin-bottom:.35rem">📜 المؤهل</div>'
        + '<div style="font-size:.68rem;line-height:1.7">'+t.ijaza+'</div>';
      if(t.ijazaImage){
        h += '<img src="'+t.ijazaImage+'" onclick="viewIjaza(\''+t.id+'\')" style="width:100%;border-radius:10px;cursor:pointer;margin-top:.6rem;border:1px solid rgba(212,175,106,.25)">';
      }
      h += '</div>';
    }
    if((t.specialties||[]).length){
      h += '<div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.8rem;margin-bottom:.6rem">'
        + '<div style="font-size:.72rem;font-weight:700;margin-bottom:.5rem">📋 التخصصات</div>'
        + '<div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-bottom:.5rem">'
        + t.specialties.map(s=>'<span style="background:rgba(212,175,106,.12);color:var(--gl);font-size:.65rem;padding:.2rem .55rem;border-radius:100px">'+s+'</span>').join('')
        + '</div>'
        + '<div style="font-size:.68rem;color:var(--tm);line-height:1.8">'
        + '<div>🎯 المستويات: '+(t.levels||[]).join(' • ')+'</div>'
        + '<div>👥 الأعمار: '+(t.ages||[]).join(' • ')+'</div>'
        + (t.availability ? '<div>🕐 التوفر: '+t.availability+'</div>' : '')
        + '</div></div>';
    }
    extra.innerHTML = h;
  }

  const favBtn = document.getElementById('tp-fav-btn');
  if(favBtn && typeof FAVS!=='undefined') favBtn.textContent = FAVS.includes(currentTeacherId) ? '❤️' : '🤍';

  if(typeof renderTeacherAvailability==='function') renderTeacherAvailability(t, currentTeacherId);
  if(typeof loadTeacherReviews==='function') loadTeacherReviews(t.id);
}
async function loadTeacherReviews(tid){try{if(_sb){const{data}=await _sb.from('public_reviews').select('*').eq('teacher_id',tid).order('created_at',{ascending:false}).limit(5);const el=document.getElementById('tp-reviews');if(data&&data.length){el.innerHTML=data.map(r=>{const nm=escapeHtml(r.student_name||'طالب'),cm=escapeHtml(r.comment||'');const rr=Math.max(0,Math.min(5,Number(r.rating)||0));return '<div class="tp-rev"><div class="tp-rev-hd"><div class="tp-rev-av">'+nm[0]+'</div><div><div class="tp-rev-nm">'+nm+'</div><div class="tp-rev-dt">'+new Date(r.created_at).toLocaleDateString('ar-EG')+'</div></div><div class="tp-rev-stars" style="margin-right:auto">'+'★'.repeat(rr)+'☆'.repeat(5-rr)+'</div></div>'+(cm?'<div class="tp-rev-txt">"'+cm+'"</div>':'')+'</div>';}).join('');}}}catch(e){console.log(e);}}
function extractYouTubeId(url){const m=url.match(/(?:v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);return m?m[1]:null;}
async function populateBookingTeachers(){
  const el=document.getElementById('b-tch');
  if(!el||!_sb)return;
  try{
    const {data,error}=await _sb.from('public_teacher_directory').select('teacher_id,name,price,verified,bookable').eq('bookable',true).order('featured',{ascending:false}).order('name',{ascending:true});
    if(error) throw error;
    el.innerHTML='<option value="">-- اختر المعلم --</option>'+(data||[]).map(t=>`<option value="${escapeHtml(t.teacher_id||t.id||'')}" data-name="${escapeHtml(t.name||'')}" data-price="${Number(t.price)||12}">${escapeHtml(t.name||'معلم')} — $${Number(t.price)||12}</option>`).join('');
    if(currentTeacherId) el.value=currentTeacherId;
  }catch(e){console.warn('populateBookingTeachers:',e.message||e);}
}
function bookTeacher(tid){currentTeacherId=tid;goP('p-book');setTimeout(()=>populateBookingTeachers(),50);}
function bookThisTeacher(){if(currentTeacherId){goP('p-book');setTimeout(()=>populateBookingTeachers(),50);}else{goP('p-book');setTimeout(()=>populateBookingTeachers(),50);}}
function waTeacher(){window.open('https://wa.me/212681883238?text='+encodeURIComponent('مرحباً، أريد التواصل مع أحد معلميكم'),'_blank');}
// v20 — تعبئة المحرر بالقيم المحفوظة؛ بدونها يمسح كل حفظٍ النبذةَ والمؤهل
async function loadMyProfile(){
  if(!_sb || !CU?.id) return;
  try{
    const {data,error}=await _sb.from('teacher_profiles').select('bio,qualification,video_url,experience,country,availability_days,availability_from,availability_to').eq('user_id',CU.id).maybeSingle();
    if(error){ console.warn('loadMyProfile:', error.message); return; }
    if(!data) return;
    const setV=(id,v)=>{const e=document.getElementById(id); if(e && v!==null && v!==undefined && v!=='') e.value=v;};
    setV('my-bio',data.bio); setV('my-qual',data.qualification); setV('my-video',data.video_url);
    setV('my-exp',data.experience); setV('my-country',data.country);
    setV('av-from',String(data.availability_from||'').slice(0,5)); setV('av-to',String(data.availability_to||'').slice(0,5));
    const days=_avDays(data.availability_days);
    if(days.length) for(let i=0;i<7;i++){ const c=document.getElementById('av-'+i); if(c) c.checked=days.includes(i); }
  }catch(e){ console.warn('loadMyProfile:', e.message||e); }
}
async function saveMyProfile(){
  if(!CU){toast('سجّل دخولك أولاً','e');return;}
  const bio=document.getElementById('my-bio')?.value.trim();
  const qual=document.getElementById('my-qual')?.value.trim();
  const video=document.getElementById('my-video')?.value.trim();
  const exp=document.getElementById('my-exp')?.value;
  const country=document.getElementById('my-country')?.value.trim();
  const avFrom=document.getElementById('av-from')?.value;
  const avTo=document.getElementById('av-to')?.value;
  const avDays=[0,1,2,3,4,5,6].filter(i=>document.getElementById('av-'+i)?.checked);
  toast('جاري حفظ ملفك الشخصي...','i');
  try{
    if(!_sb) throw new Error('لا اتصال بقاعدة البيانات');
    const payload={user_id:CU.id,name:CU.name,email:CU.email,bio,qualification:qual,video_url:video,experience:exp,country,availability_days:avDays,availability_from:avFrom,availability_to:avTo,updated_at:new Date().toISOString()};
    const {error}=await _sb.from('teacher_profiles').upsert(payload,{onConflict:'user_id'});
    if(error) throw error;
    if(typeof _TAV!=='undefined') delete _TAV[CU.id];
    toast('✅ تم حفظ ملفك الشخصي!','s');
  }catch(e){toast('تعذّر حفظ الملف: '+(e.message||e),'e');}
}
async function uploadProfilePhoto(input){const file=input.files[0];if(!file)return;if(file.size>2*1024*1024){toast('الصورة أكبر من 2MB','e');return;}toast('جاري رفع الصورة...','i');try{if(_sb&&CU){const ext=(file.name.split('.').pop()||'').toLowerCase();if(!['jpg','jpeg','png','webp'].includes(ext)){toast('الصيغ المسموحة: JPG أو PNG أو WEBP','e');return;}/* [إصلاح F6] المسار المسموح: avatars/<معرّفك>/ */const path='avatars/'+CU.id+'/'+Date.now()+'.'+ext;const{error}=await _sb.storage.from('manarat-media').upload(path,file,{upsert:false});if(error){toast('خطأ في الرفع','e');return;}const{data:{publicUrl}}=_sb.storage.from('manarat-media').getPublicUrl(path);const avDisp=document.getElementById('my-av-display');if(avDisp)avDisp.innerHTML='<img src="'+publicUrl+'" style="width:100%;height:100%;object-fit:cover">';if(_sb)await _sb.from('teacher_profiles').update({photo_url:publicUrl,updated_at:new Date().toISOString()}).eq('user_id',CU.id);toast('✅ تم رفع الصورة!','s');}else{toast('يتطلب ربط Supabase Storage','i');}}catch(e){toast('خطأ في رفع الصورة','e');}}
function generateCert(studentName,courseName){const certId='MM-'+Date.now().toString(36).toUpperCase().substring(2,8);const date=new Date().toLocaleDateString('ar-EG',{year:'numeric',month:'long',day:'numeric'});document.getElementById('cert-student-name').textContent=studentName;document.getElementById('cert-course-name').textContent=courseName;document.getElementById('cert-date').textContent='بتاريخ '+date;document.getElementById('cert-id').textContent='رقم الشهادة: '+certId;const preview=document.getElementById('cert-preview');if(preview)preview.style.display='block';const list=document.getElementById('certs-list');if(list)list.style.display='none';goP('p-certs');toast('🎓 تهانينا! شهادتك جاهزة','s');}
function downloadCert(){toast('إنشاء ملف الشهادة PDF غير مفعّل بعد؛ لن ننشئ ملفاً وهمياً.','i');}
function shareCert(){toast('المشاركة ستتوفر بعد تفعيل إصدار الشهادات الرسمي.','i');}
function joinZoom(){toast('لا يوجد رابط فصل مرتبط بهذه الحصة بعد. عند إضافة رابط Zoom أو Google Meet سيظهر زر الانضمام هنا.','i');}
function toggleMic(btn){btn.classList.toggle('off');toast(btn.classList.contains('off')?'🔇 الميكروفون مكتوم':'🎙️ الميكروفون نشط','i');}
function toggleCam(btn){btn.classList.toggle('off');toast(btn.classList.contains('off')?'📷 الكاميرا متوقفة':'📷 الكاميرا نشطة','i');}
function shareScreen(){toast('مشاركة الشاشة متاحة عبر Zoom قريباً','i');}
function endClass(){if(confirm('هل تريد إنهاء الدرس؟'))goP('p-rate');}
function sendLcMsg(){const inp=document.getElementById('lc-msg-inp');const msg=inp?.value.trim();if(!msg)return;const chat=document.getElementById('lc-chat');if(chat){const div=document.createElement('div');div.className='lc-msg';const strong=document.createElement('strong');strong.textContent=(CU?.name||'أنا')+':';div.appendChild(strong);div.appendChild(document.createTextNode(' '+msg));chat.appendChild(div);chat.scrollTop=chat.scrollHeight;}inp.value='';}
async function loadAdminTeachers(){const b=document.getElementById('ast-body');if(!b)return;try{if(_sb){const{data}=await _sb.from('teacher_applications').select('*').order('created_at',{ascending:false});if(!data||!data.length){b.innerHTML='<div style="text-align:center;padding:1.5rem;color:var(--tm)">لا توجد طلبات بعد</div>';return;}b.innerHTML='<div style="font-size:.8rem;font-weight:700;color:var(--gl);margin-bottom:.75rem">📋 طلبات الانضمام ('+data.length+')</div><div style="display:flex;flex-direction:column;gap:.65rem">'+data.map(t=>'<div style="background:rgba(255,255,255,.03);border:1px solid var(--bdl);border-radius:12px;padding:.85rem"><div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:.55rem"><div><div style="font-size:.82rem;font-weight:700">'+(t.name||'—')+'</div><div style="font-size:.65rem;color:var(--gl)">'+(t.specialty||'—')+'</div><div style="font-size:.63rem;color:var(--tm)">'+t.email+' • '+t.whatsapp+'</div></div><span style="font-size:.58rem;padding:.15rem .45rem;border-radius:100px;font-weight:700;'+(t.status==='pending'?'background:rgba(212,175,106,.15);color:var(--gl)':t.status==='approved'?'background:rgba(39,174,96,.15);color:var(--grl)':'background:rgba(192,57,43,.15);color:#e74c3c')+'">'+(t.status==='pending'?'⏳ بانتظار':t.status==='approved'?'✅ مقبول':'❌ مرفوض')+'</span></div><div style="font-size:.7rem;color:var(--tm);margin-bottom:.55rem;line-height:1.6">'+(t.bio||'لا توجد نبذة').substring(0,120)+'</div><div style="font-size:.68rem;color:var(--tm);margin-bottom:.65rem">💰 $'+(t.price_per_hour||12)+'/حصة • 📜 '+(t.qualification||'—')+'</div>'+(t.status==='pending'?'<div style="display:flex;gap:.45rem"><button class="btn bsm" style="background:rgba(39,174,96,.2);color:var(--grl);flex:1" onclick="approveTeacher(\''+t.id+'\')">✅ قبول</button><button class="btn bsm" style="background:rgba(212,175,106,.15);color:var(--gl);flex:1" onclick="contactTeacher(\''+encodeURIComponent(t.whatsapp||'')+'\',\''+encodeURIComponent(t.name||'')+'\')">💬 تواصل</button><button class="btn bsm abr" onclick="rejectTeacher(\''+t.id+'\')">❌ رفض</button></div>':'')+'</div>').join('')+'</div>';}}catch(e){b.innerHTML='<div style="color:#e74c3c;font-size:.78rem">'+e.message+'</div>';}}
function contactTeacher(phone,name){
  const p=decodeURIComponent(String(phone||'')).replace(/[^\d]/g,'');
  const n=decodeURIComponent(String(name||'معلم'));
  if(!p){toast('لا يوجد رقم واتساب لهذا الطلب','e');return;}
  const msg=encodeURIComponent(`السلام عليكم ${n}، معك إدارة منارة المعرفة بخصوص طلب الانضمام كمعلم.`);
  window.open('https://wa.me/'+p+'?text='+msg,'_blank');
}
async function rejectTeacher(id){
  if(!confirm('رفض طلب الانضمام؟'))return;
  try{
    if(!_sb)throw new Error('لا اتصال بقاعدة البيانات');
    const {error}=await _sb.from('teacher_applications').update({status:'rejected'}).eq('id',id);
    if(error)throw error;
    toast('تم رفض الطلب','i');
    loadAdminTeachers();
  }catch(e){toast('تعذّر رفض الطلب: '+(e.message||e),'e');}
}
async function approveTeacher(id){
  if(!confirm('قبول هذا الطلب؟'))return;
  try{
    if(!_sb)throw new Error('لا اتصال بقاعدة البيانات');
    const {error}=await _sb.from('teacher_applications').update({status:'approved'}).eq('id',id);
    if(error)throw error;
    // طلب التقديم الحالي لا يحتوي user_id لـ auth.users، لذلك لا ننشئ teacher_profile وهمياً.
    toast('✅ تم قبول الطلب. أنشئ حساب المعلم من لوحة الإدارة لربطه بملفه.','s');
    loadAdminTeachers();
  }catch(e){toast('تعذّر قبول الطلب: '+(e.message||e),'e');}
}
async function installPWA(){
  if(!_pwaPrompt){
    toast('لتثبيت التطبيق: اضغط على قائمة المتصفح ← "إضافة إلى الشاشة الرئيسية"','i');
    return;
  }
  _pwaPrompt.prompt();
  const {outcome} = await _pwaPrompt.userChoice;
  if(outcome === 'accepted') toast('✅ تم تثبيت التطبيق بنجاح!','s');
  _pwaPrompt = null;
  document.getElementById('pwa-banner')?.style.setProperty('display','none');
}

// ══════════════════════════════════════════════
// طرق الدفع
// ══════════════════════════════════════════════
let selectedPayMethod = 'whatsapp';
function selPayMethod(el, method){
  if(method==='card'||method==='paypal'){toast('الدفع بالبطاقة وPayPal غير مفعّل بعد. اختر واتساب أو التحويل البنكي.','i');return;}
  document.querySelectorAll('.pay-method').forEach(m=>{
    m.classList.remove('selected');
    const input=m.querySelector('input');if(input)input.checked=false;
  });
  el.classList.add('selected');
  const input=el.querySelector('input');if(input)input.checked=true;
  selectedPayMethod=method;
}



// ══════════════════════════════════════════════
// لوحة الطالب والمعلم — من الحجوزات الحقيقية
// ══════════════════════════════════════════════
function _bkStart(b){if(b.starts_at){const a=new Date(b.starts_at);if(!isNaN(a))return a;}const d=b.booking_date,t=String(b.booking_time||'00:00').slice(0,5);const x=new Date(d+'T'+t+':00');return isNaN(x)?null:x;}
function _bkDateLabel(b){const x=_bkStart(b);if(!x)return '—';return fmtLocalDay(x)+' • '+fmtLocalTime(x)+' بتوقيتك';}
function _isoLocal(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
const _BK_PILL={confirmed:['مؤكَّد','rgba(39,174,96,.15)','var(--grl)'],pending:['بانتظار تأكيد الدفع','rgba(52,152,219,.15)','#5dade2'],completed:['مكتمل','rgba(212,175,106,.15)','var(--gl)']};
function _bkPill(s){const p=_BK_PILL[s];if(!p)return '';return '<span style="font-size:.58rem;font-weight:700;padding:.18rem .5rem;border-radius:20px;background:'+p[1]+';color:'+p[2]+';white-space:nowrap">'+p[0]+'</span>';}

async function loadMyDashboard(){
  if(!_sb||!CU||!CU.id)return;
  if(CU.role==='teacher'){loadTeacherSchedule();if(typeof loadMyMeetLink==='function')loadMyMeetLink();return;}
  loadStudentLessons();
}

async function loadStudentLessons(){
  const el=document.getElementById('student-lessons-list');
  if(!el||!_sb||!CU||!CU.id)return;
  try{
    const {data,error}=await _sb.from('bookings').select('*').eq('student_id',CU.id)
      .in('status',['pending','confirmed','completed'])
      .order('booking_date',{ascending:true}).order('booking_time',{ascending:true}).limit(200);
    if(error)throw error;
    const all=data||[];
    const now=new Date();
    const upcoming=all.filter(b=>b.status!=='completed'&&(!_bkStart(b)||_bkStart(b).getTime()+(Number(b.duration)||60)*60000>now.getTime()));
    const done=all.filter(b=>b.status==='completed').reverse();
    let reviewed=new Set();
    if(done.length){
      const {data:rv}=await _sb.from('reviews').select('booking_id').in('booking_id',done.map(b=>b.id));
      reviewed=new Set((rv||[]).map(r=>String(r.booking_id)));
    }
    const st=document.getElementById('st-lessons');if(st)st.textContent=done.length;
    if(!upcoming.length&&!done.length){
      el.innerHTML='<div style="text-align:center;padding:1.5rem;color:var(--tm)"><div style="font-size:2rem;margin-bottom:.5rem">🗓</div><div style="font-size:.8rem;font-weight:700;margin-bottom:.3rem">لا توجد دروس محجوزة بعد</div><div style="font-size:.72rem;margin-bottom:.85rem">درسك الأول مجاني</div><button class="btn bgo" onclick="goP(\'p-book\')">🗓 احجز درسك</button></div>';
      return;
    }
    const card=(b,extra)=>'<div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.7rem .8rem;margin-bottom:.5rem">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:.5rem">'
      +'<div style="min-width:0"><div style="font-size:.78rem;font-weight:800">'+escapeHtml(b.teacher_name||'المعلم')+(b.type==='trial'?' <span style="font-size:.58rem;color:var(--go)">• درس تجريبي</span>':'')+(b.makeup_of?' <span style="font-size:.58rem;color:var(--go)">• تعويضي</span>':'')+'</div>'
      +'<div style="font-size:.64rem;color:var(--tm);margin-top:.15rem">'+(b.subscription_id?'📅 ضمن اشتراكك':escapeHtml(b.hall_name||b.hall||'')+(b.section?' • '+escapeHtml(b.section):''))+'</div>'
      +'<div style="font-size:.66rem;color:var(--tx);margin-top:.25rem">🕐 '+escapeHtml(_bkDateLabel(b))+'</div></div>'
      +_bkPill(b.status)+'</div>'+(extra||'')+'</div>';
    let html='';
    if(upcoming.length){
      const more=upcoming.length>6&&!window._showAllLessons;
      const shown=more?upcoming.slice(0,6):upcoming;
      html+=shown.map(b=>{
        const link=b.status==='confirmed'&&b.meeting_link&&/^https?:\/\//i.test(b.meeting_link)?b.meeting_link:'';
        const rc=b.payment_status==='paid'&&Number(b.package_price)>0&&!b.subscription_id?'<button class="btn bgh bsm bfw" style="margin-top:.45rem;font-size:.64rem" onclick="showReceiptForBooking(\''+b.id+'\')">🧾 الإيصال</button>':'';
        const st=_bkStart(b),left=st?st.getTime()-Date.now():0;
        const canTrial=b.type==='trial'&&left>0&&(b.status==='confirmed'||b.status==='pending');
        const canSub=b.subscription_id&&b.status==='confirmed'&&left>=24*3600e3;
        const ap=canTrial?'<button class="btn bgh bsm bfw" style="margin-top:.45rem;font-size:.62rem;color:#e67e73" onclick="studentCancelLesson(\''+b.id+'\',true)">إلغاء الدرس التجريبي</button>'
               :canSub?'<button class="btn bgh bsm bfw" style="margin-top:.45rem;font-size:.62rem" onclick="studentCancelLesson(\''+b.id+'\',false)">🙏 اعتذار عن الدرس (قبل ٢٤ ساعة)</button>':'';
        return card(b,(link?'<a class="btn bgo bsm bfw" style="margin-top:.55rem;display:block;text-align:center;font-size:.66rem" href="'+escapeHtml(link)+'" target="_blank" rel="noopener">🎥 دخول الدرس</a>':'')+rc+ap);
      }).join('')+(more?'<button class="btn bgh bfw" style="font-size:.66rem;margin-bottom:.5rem" onclick="window._showAllLessons=true;loadStudentLessons()">عرض كل الدروس القادمة ('+upcoming.length+')</button>':'');
    }else{
      html+='<div style="text-align:center;padding:.9rem;color:var(--tm);font-size:.72rem">لا دروس قادمة — <a href="#" onclick="goP(\'p-book\');return false" style="color:var(--go)">احجز درسًا</a></div>';
    }
    if(done.length){
      html+='<div style="font-size:.8rem;font-weight:700;margin:1rem 0 .65rem;color:var(--gl)">✅ دروس مكتملة</div>';
      html+=done.slice(0,20).map(b=>{
        const can=!reviewed.has(String(b.id));
        const nm=JSON.stringify(String(b.teacher_name||'المعلم')).replace(/"/g,'&quot;');
        const tid=JSON.stringify(String(b.teacher_id||'')).replace(/"/g,'&quot;');
        const rc=b.payment_status==='paid'&&Number(b.package_price)>0?'<button class="btn bgh bsm bfw" style="margin-top:.45rem;font-size:.64rem" onclick="showReceiptForBooking(\''+b.id+'\')">🧾 الإيصال</button>':'';
        return card(b,(can?'<button class="btn bgo bsm bfw" style="margin-top:.55rem;font-size:.66rem" onclick="openRatingPage('+nm+','+tid+')">⭐ قيّم هذا الدرس</button>':'<div style="margin-top:.45rem;font-size:.6rem;color:var(--grl)">✓ قيّمت هذا الدرس</div>')+rc);
      }).join('');
    }
    el.innerHTML=html;
  }catch(e){
    el.innerHTML='<div style="color:#e74c3c;text-align:center;padding:1rem;font-size:.72rem">تعذّر تحميل دروسك: '+escapeHtml(e.message||e)+'</div>';
  }
}

// جدول المعلم الحقيقي — الحجوزات مرتبطة بـ user_id المعلم
async function loadTeacherSchedule(){
  const el=document.getElementById('teacher-schedule');
  if(!el)return;
  const days=['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  let bookings=[];
  try{
    if(_sb&&CU&&CU.id){
      const {data,error}=await _sb.from('bookings').select('*').eq('teacher_id',CU.id)
        .in('status',['pending','confirmed','completed'])
        .order('booking_date',{ascending:true}).order('booking_time',{ascending:true}).limit(500);
      if(error)throw error;
      bookings=data||[];
    }
  }catch(e){console.warn('teacher schedule:',e.message||e);}

  const now=new Date();
  try{p2RenderTeacherPast(bookings);}catch(e){}
  const active=bookings.filter(b=>b.status!=='completed'&&(!_bkStart(b)||_bkStart(b).getTime()+(Number(b.duration)||60)*60000>now.getTime()));
  const upcomingCount=active.filter(b=>b.status==='confirmed'&&_bkStart(b)&&_bkStart(b)>now).length;
  const students=new Set(bookings.map(b=>b.student_id).filter(Boolean)).size;
  const monthKey=_isoLocal(now).slice(0,7);
  const monthSum=bookings.filter(b=>b.status==='completed'&&String(b.booking_date||'').slice(0,7)===monthKey).reduce((a,b)=>a+(Number(b.teacher_share)||0),0);
  const tu=document.getElementById('t-upcoming');if(tu)tu.textContent=upcomingCount;
  const ts=document.getElementById('t-students');if(ts)ts.textContent=students;
  const tm=document.getElementById('t-month');if(tm)tm.textContent='$'+monthSum.toFixed(2);

  const grouped={};
  active.forEach(b=>{const x=_bkStart(b);const k=x?_isoLocal(x):String(b.booking_date||'');if(!k)return;(grouped[k]=grouped[k]||[]).push(b);});
  const weekDays=Array.from({length:7},(_,i)=>{const d=new Date(now);d.setDate(now.getDate()+i);return d;});
  el.innerHTML=weekDays.map((day,i)=>{
    const key=_isoLocal(day);
    const list=grouped[key]||[];
    const isToday=i===0;
    return '<div class="sch-day">'
      +'<div class="sch-day-hd" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display===\'none\'?\'block\':\'none\'">'
      +'<div><div class="sch-day-nm">'+(isToday?'🟢 ':'')+days[day.getDay()]+' '+day.getDate()+'/'+(day.getMonth()+1)+'</div>'
      +'<div class="sch-day-cnt">'+list.length+' حجز</div></div>'
      +'<span style="font-size:.8rem;color:var(--tm)">▾</span></div>'
      +'<div class="sch-slots" style="display:'+(isToday||list.length?'block':'none')+'">'
      +(list.length?list.map(b=>'<div class="sch-slot booked">'
          +'<div class="sch-time">🕐 '+escapeHtml(_bkStart(b)?fmtLocalTime(_bkStart(b)):(String(b.booking_time||'').slice(0,5)||'—'))+'</div>'
          +'<div class="sch-info"><div class="sch-student">👤 '+escapeHtml(b.student_name||'طالب')+(b.type==='trial'?' <span style="font-size:.56rem;color:var(--go)">• تجريبي</span>':'')+'</div>'
          +'<div class="sch-subj">'+(b.subscription_id?'📅 اشتراك':escapeHtml(b.hall_name||b.hall||'—')+(b.section?' • '+escapeHtml(b.section):''))+'</div>'
          +'<div style="margin-top:.2rem">'+_bkPill(b.status)+'</div></div>'
          +'<div class="sch-actions"><button class="btn bsm" style="background:rgba(52,152,219,.15);color:#5dade2;font-size:.6rem" onclick="msgStudent(\''+escapeHtml(String(b.student_email||'')).replace(/'/g,'')+'\')">💬</button></div>'
          +'</div>').join('')
        :'<div style="text-align:center;padding:.65rem;color:var(--tm);font-size:.72rem">لا توجد حجوزات هذا اليوم</div>')
      +'</div></div>';
  }).join('');
}

async function confirmLesson(id){
  if(!_sb || !id){toast('تعذر تأكيد الدرس: لا توجد جلسة قاعدة بيانات صالحة.','e');return;}
  try{
    const {error}=await _sb.rpc('teacher_set_booking_status',{p_booking_id:id,p_status:'confirmed'});
    if(error) throw error;
    toast('تم تأكيد الحجز في قاعدة البيانات ✅','s');
    addNotif('تم تأكيد الحجز بنجاح','success');
    if(typeof loadTeacherSchedule==='function') loadTeacherSchedule();
  }catch(e){toast('لم يتم تأكيد الحجز: '+(e.message||e),'e');}
}
async function msgStudent(email){
  const clean=String(email||'').trim();
  if(!clean){toast('لا توجد وسيلة تواصل محفوظة لهذا الطالب.','e');return;}
  try{
    if(_sb){
      const {data}=await _sb.from('profiles').select('phone').eq('email',clean).maybeSingle();
      const phone=String(data?.phone||'').replace(/[^\d]/g,'');
      if(phone){window.open('https://wa.me/'+phone,'_blank','noopener');return;}
    }
  }catch(e){}
  window.location.href='mailto:'+encodeURIComponent(clean)+'?subject='+encodeURIComponent('منارة المعرفة — بخصوص الدرس');
}

// ── إضافة تبويب الجدول في لوحة المعلم ──
function initTeacherDashboard(){
  const scheduleContainer = document.getElementById('teacher-schedule');
  if(scheduleContainer) loadTeacherSchedule();
}

// ══════════════════════════════════════════════
// تسجيل Service Worker للـ PWA
// ══════════════════════════════════════════════
let _pwaPrompt=null;
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();_pwaPrompt=e;});
window.addEventListener('appinstalled',()=>{_pwaPrompt=null;document.getElementById('pwa-banner')?.style.setProperty('display','none');});
// v20 — كان عامل الخدمة (sw.js) يخزّن نسخة قديمة من الصفحة ويقدّمها للزائر
// مهما رفعتَ من تحديثات. نُلغيه ونمسح مخزونه مرة واحدة، ثم نعيد التحميل.
if('serviceWorker' in navigator){
  window.addEventListener('load',async()=>{
    try{
      const regs=await navigator.serviceWorker.getRegistrations();
      let killed=false;
      for(const r of regs){ if(await r.unregister()) killed=true; }
      if(window.caches&&caches.keys){
        const keys=await caches.keys();
        await Promise.all(keys.map(k=>caches.delete(k)));
        if(keys.length) killed=true;
      }
      if(killed && !sessionStorage.getItem('sw_purged')){
        sessionStorage.setItem('sw_purged','1');
        location.reload();
      }
    }catch(e){ console.warn('sw purge:',e.message||e); }
  });
}

// ── تحديث loadAdminSettings لإضافة تبويب المعلمين ──
const _origLoadAdminSettings = loadAdminSettings;


// إضافة buildAdminPanel لتشمل تبويب المعلمين
const _origBuildAdminPanel = buildAdminPanel;


document.addEventListener('DOMContentLoaded',()=>{
  ldH();['q','l','s'].forEach(k=>renderH(k));updBkS();mkChart();
  try{const s=localStorage.getItem('mm_v3');if(s){CU=JSON.parse(s);setUser(CU);}}catch(e){}
  setTimeout(async()=>{
    if(typeof loadCentralPublicConfig==='function')await loadCentralPublicConfig();
    try{
      if(_sb){
        /* [إصلاح F2] لا نُبقي مستخدماً محفوظاً محلياً إن لم تعد له جلسة */
        const{data:sessData}=await _sb.auth.getSession();
        if(!sessData||!sessData.session){if(CU)doLogout(true);return;}
        const{data:{user}}=await _sb.auth.getUser();
        if(user){
          // المصدر الموثوق للدور هو profiles، وليس localStorage أو user_metadata.
          const{data:prof}=await _sb.from('profiles').select('name,role,status').eq('id',user.id).maybeSingle();
          const role=(prof?.role==='admin'||prof?.role==='teacher')?prof.role:'student';
          const name=prof?.name||user.user_metadata?.full_name||user.user_metadata?.name||user.email.split('@')[0];
          if(!prof){await _sb.from('profiles').upsert({id:user.id,name,email:user.email,role:'student',status:'active'});}
          if(prof?.status==='blocked'){await _sb.auth.signOut();CU=null;toast('هذا الحساب محظور','e');return;}
          setUser({id:user.id,name,email:user.email,role});
        }
      }
    }catch(e){console.log('Auth check:',e);}
  },600);
  // live counter disabled until real users
  renderBooks();
  // Apply pricing from saved settings
  applyPricingEverywhere();
  // Hall listener for mobile compatibility
  initHallListener();
  if(typeof initStripe==='function') initStripe();
  // تحميل جدول المعلم إذا كان المستخدم معلماً
  if(CU && CU.role === 'teacher') loadTeacherSchedule();
});

// ============================================================
//  FULL TRANSLATION SYSTEM — covers ALL sections
// ============================================================
const T = {
  ar: {
    dir:'rtl', lang:'ar',
    login:'دخول',
    title:'منارة المعرفة<br>تعلّم • اكتشف • تطوّر',
    sub:'دروس خصوصية 1-على-1 مع معلمين متخصصين — القرآن الكريم، والعربية، والعلوم الشرعية، واللغات. بلغتك وتوقيتك. درسك الأول مجاناً.',
    book_btn:'🗓 احجز درساً مجانياً', wa_btn:'💬 واتساب',
    srch_ph:'ماذا تريد أن تتعلم؟ (تجويد، حفظ، نحو، محادثة...)',
    srch_tags:['🕌 تجويد','📖 حفظ القرآن','✍️ نحو وصرف','🗣️ محادثة','🌍 لغات'],
    subj_h:'🏛️ <em>اختر</em> مجالك', subj_all:'عرض الكل ›',
    hallnames:['القرآن والتجويد','اللغة العربية','العلوم الشرعية','اللغات العالمية','الدعم الدراسي','المهارات المهنية'],
    hallsubs:['حفظ وتلاوة بسند متصل','لغير الناطقين بها','فقه وحديث وعقيدة','12 لغة • جميع المستويات','باك • بريفيه • جامعي','برمجة • تصميم • تسويق'],
    steps_h:'🚀 <em>كيف</em> يعمل',
    steps:[['اختر مجالك ومعلمك','تصفّح المعلمين، اقرأ تقييماتهم، واختر من يناسب مستواك ولغتك'],['احجز موعدك بنقرة واحدة','تقويم تفاعلي يعرض توقيتك المحلي تلقائياً — اختر اليوم والساعة'],['تعلّم مباشرة وتابع تقدّمك','فصل رقمي بالفيديو والصوت والسبورة — وإثبات إتمام عند توفره']],
    teacher_h:'👨‍🏫 <em>هل أنت معلم؟</em>',
    teacher_title:'انضم كمعلم واكسب 75%',
    teacher_desc:'نبحث عن معلمين متخصصين في القرآن والعربية والعلوم الشرعية — حدّد مواعيدك وسعرك بحرية كاملة',
    teacher_btn:'📩 تواصل للانضمام كمعلم',
    courses_h:'📚 <em>ماذا</em> ستتعلم',
    prc_h:'💰 <em>أسعار</em> شفافة 100%',
    
    trust_h:'🔒 <em>لماذا</em> تثق بنا',
    trust:[['🔰','درس مجاني','جرّب بدون أي التزام'],['💰','درس تجريبي','جرّب قبل أن تقرر'],['🔐','دفع آمن','تحويل بنكي أو واتساب'],['📜','معلمون مؤهلون','إجازات موثّقة']],
    faq_h:'❓ <em>أسئلة</em> شائعة',
    faqs:[['هل الدرس الأول مجاني حقاً؟','نعم تماماً. درسك الأول مجاني بدون بطاقة ائتمانية. اختر معلمك واحجز مباشرة.'],['كيف تتم الدروس؟','دروس مباشرة 1-على-1 عبر أدوات الفصل المتاحة على المنصة. أي تسجيل للدرس يخضع للأدوات والاتفاق المعتمد، وليس ميزة تسجيل تلقائي معلنة.'],['ما لغات التدريس؟','نقدم التدريس بعدة لغات منها العربية، الإنجليزية، الفرنسية، الإسبانية، الألمانية، الهولندية، التركية، الإيطالية، البرتغالية والأوردية. عدد اللغات يتوسع مع انضمام معلمين جدد.'],['كيف يتقاضى المعلم راتبه؟','75% من قيمة كل درس تذهب للمعلم، و25% للمنصة. يُحتسب نصيب المعلم وفق سياسة 75%، ويُصرف عبر وسيلة السحب التي تعتمدها المنصة بعد استكمال الربط والتحقق.'],['هل يمكنني تغيير المعلم؟','نعم في أي وقت. تصفّح ملفات المعلمين ومؤهلاتهم واختر الأنسب لك.']],
    cta_t:'🎓 ابدأ رحلتك اليوم',
    cta_s:'درسك الأول مجاناً — بدون بطاقة ائتمانية\nانضم وكن من أوائل طلاب منارة المعرفة',
    cta_btn:'🗓 احجز مجاناً', cta_wa:'💬 تحدث معنا',
    spot_title:'مكانك محجوز هنا',
    spot_desc:'هذا المكان لقصة نجاحك.\nاحجز درسك المجاني اليوم واترك أثرك.',
    spot_btn:'🗓 احجز درسك المجاني',
    nav:['الرئيسية','الفصول','المكتبة','لوحتي','حسابي'],
  },
  en: {
    dir:'ltr', lang:'en',
    login:'Login',
    title:'Manarat Al-Maarifa<br>Learn • Discover • Grow',
    sub:'A complete learning platform — Quran, languages, academic support & professional skills. Live 1-on-1 lessons in your language. First lesson free.',
    book_btn:'🗓 Book a Free Lesson', wa_btn:'💬 WhatsApp',
    srch_ph:'What do you want to learn? (Tajweed, Grammar, Fiqh...)',
    srch_tags:['🕌 Tajweed','📖 Grammar','⚖️ Fiqh','🌱 Beginner','🧒 Kids'],
    subj_h:'🏛️ <em>Choose</em> your subject', subj_all:'View all ›',
    hallnames:['Quran & Tajweed','Arabic Language','Islamic Sciences','World Languages','Academic Support','Professional Skills'],
    hallsubs:['Memorization & recitation with certified chain','For non-native speakers','Fiqh, Hadith & Aqeedah','12 languages • All levels','Bac • Brevet • University','Programming • Design • Marketing'],
    steps_h:'🚀 <em>How</em> it works',
    steps:[['Choose your subject & teacher','Browse teachers, read their reviews, and choose who suits your level and language'],['Book your slot in one click','Interactive calendar shows your local timezone automatically — pick day & time'],['Learn live & track your progress','Digital classroom with video, audio & whiteboard — plus a platform completion certificate']],
    teacher_h:'👨‍🏫 <em>Are you a teacher?</em>',
    teacher_title:'Join as a teacher & earn 75%',
    teacher_desc:'We are looking for specialized teachers in Quran, Arabic & Islamic Sciences — set your own schedule and price',
    teacher_btn:'📩 Contact us to join',
    courses_h:'📚 <em>What</em> you will learn',courses:['Tajweed Rules — from Beginner to Ijaza','Quran Memorization with Certified Chain','Arabic from Zero — A1 to B2','Arabic for Kids — Learn through Play','Fiqh, Hadith, Aqidah & Sira','English • French • Spanish & more','Math • Physics • Science & more','Programming • Design • Digital Marketing'],
    prc_h:'💰 <em>Pricing</em> — 100% transparent',
    
    step1_t:'Choose your subject & teacher',step1_s:'Browse teachers, read their reviews, and choose based on your level and language',step2_t:'Book your slot in one click',step2_s:'Interactive calendar showing your timezone automatically',step3_t:'Learn live & track your progress',step3_s:'Digital classroom with video, audio & interactive whiteboard — plus a platform completion certificate',trust_h:'🔒 <em>Why</em> trust us',
    trust:[['🔰','Free Lesson','Try with no commitment'],['💰','Free Trial','Try before you decide'],['🔐','Direct Payment','Bank transfer or WhatsApp'],['📜','Qualified Teachers','Verified credentials']],
    faq_h:'❓ <em>Frequently</em> asked questions',
    faqs:[['Is the first lesson really free?','Yes, the first lesson is free for an eligible new student when the booking is accepted by the platform. No card is required for the current manual-payment flow.'],['How do the lessons work?','Live 1-on-1 lessons via the available online classroom tools. Recording is not advertised as an automatic platform feature.'],['What teaching languages are available?','11 languages: Arabic, English, French, Spanish, German, Dutch, Turkish, Italian, Portuguese, Indonesian, and Urdu.'],['How does the teacher get paid?','75% of each confirmed payment is allocated to the teacher and 25% to the platform. Withdrawal is handled through the payout method enabled by the platform.'],['Can I change my teacher?','Yes, at any time. Browse teacher profiles and reviews and choose the best fit for you.']],
    cta_t:'🎓 Start your journey today',
    cta_s:'First lesson free — no credit card needed\nJoin and be among the first students of Manarat Al-Maarifa',
    cta_btn:'🗓 Book for free', cta_wa:'💬 Talk to us',
    spot_title:'Your spot is reserved here',
    spot_desc:'This is where your success story will be.\nBook your free lesson today and make your mark.',
    spot_btn:'🗓 Book your free lesson',
    nav:['Home','Halls','Library','Dashboard','Account'],
  },
  fr: {
    dir:'ltr', lang:'fr',
    login:'Connexion',
    title:'Manarat Al-Maarifa<br>Apprendre • Découvrir • Évoluer',
    sub:'Plateforme éducative complète — Coran, langues, soutien scolaire & compétences professionnelles. Cours 1-sur-1 en direct. Premier cours gratuit.',
    book_btn:'🗓 Réserver un cours gratuit', wa_btn:'💬 WhatsApp',
    srch_ph:'Que voulez-vous apprendre? (Tajweed, Grammaire, Fiqh...)',
    srch_tags:['🕌 Tajweed','📖 Grammaire','⚖️ Fiqh','🌱 Débutant','🧒 Enfants'],
    subj_h:'🏛️ <em>Choisissez</em> votre matière', subj_all:'Voir tout ›',
    hallnames:['Coran & Tajweed','Langue Arabe','Sciences Islamiques','Langues Mondiales','Soutien Scolaire','Compétences Pro'],
    hallsubs:['Mémorisation & récitation certifiée','Pour non-arabophones','Fiqh, Hadith & Aqeedah','12 langues • Tous niveaux','Bac • Brevet • Université','Prog • Design • Marketing'],
    steps_h:'🚀 <em>Comment</em> ça marche',
    steps:[['Choisissez votre matière & enseignant','Parcourez les enseignants, lisez leurs avis, et choisissez selon votre niveau et langue'],['Réservez votre créneau en un clic','Calendrier interactif affichant votre fuseau horaire automatiquement'],['Apprenez en direct & obtenez un certificat','Classe numérique avec vidéo, audio & tableau interactif — plus un certificat à la fin']],
    teacher_h:'👨‍🏫 <em>Êtes-vous enseignant?</em>',
    teacher_title:'Rejoignez-nous et gagnez 75%',
    teacher_desc:'Nous recherchons des enseignants spécialisés en Coran, Arabe & Sciences Islamiques — définissez vos horaires et tarifs librement',
    teacher_btn:'📩 Contactez-nous pour rejoindre',
    courses_h:'📚 <em>Ce que</em> vous allez apprendre',courses:['Règles Tajweed — débutant à Ijaza','Mémorisation Coran certifiée','Arabe de zéro — A1 à B2','Arabe pour enfants — par les jeux','Fiqh, Hadith, Aqidah & Sira','Anglais • Français • Espagnol +','Maths • Physique • Sciences +','Programmation • Design • Marketing'],
    prc_h:'💰 <em>Tarifs</em> — 100% transparents',
    
    trust_h:'🔒 <em>Pourquoi</em> nous faire confiance',
    trust:[['🔰','Cours Gratuit','Essayez sans engagement'],['💰','Essai Gratuit','Essayez avant de décider'],['🔐','Paiement Direct','Virement ou WhatsApp'],['📜','Certificat de la plateforme','Ijaza avec chaîne certifiée']],
    faq_h:'❓ <em>Questions</em> fréquentes',
    faqs:[['La première leçon est-elle vraiment gratuite?','Oui, absolument. Votre première leçon est gratuite sans carte de crédit. Choisissez votre enseignant et réservez directement.'],['Comment se déroulent les cours?','Cours 1-sur-1 en direct via notre classe numérique avec vidéo, audio et tableau interactif. Chaque cours est enregistré automatiquement.'],['Quelles langues d\'enseignement sont disponibles?','11 langues: Arabe, Anglais, Français, Espagnol, Allemand, Néerlandais, Turc, Italien, Portugais, Indonésien et Ourdou.'],['Comment l\'enseignant est-il rémunéré?','75% de chaque paiement va directement à l\'enseignant, 25% à la plateforme.'],['Puis-je changer d\'enseignant?','Oui, à tout moment. Parcourez les profils et avis des enseignants.']],
    cta_t:'🎓 Commencez votre parcours aujourd\'hui',
    cta_s:'Première leçon gratuite — sans carte de crédit\nRejoignez et soyez parmi les premiers étudiants',
    cta_btn:'🗓 Réserver gratuitement', cta_wa:'💬 Nous contacter',
    spot_title:'Votre place est réservée ici',
    spot_desc:'C\'est ici que sera votre histoire de réussite.\nRéservez votre cours gratuit aujourd\'hui.',
    spot_btn:'🗓 Réserver votre cours gratuit',
    nav:['Accueil','Salles','Bibliothèque','Tableau','Compte'],
  },
  es: {
    dir:'ltr', lang:'es',
    login:'Entrar',
    title:'Manarat Al-Maarifa<br>Aprender • Descubrir • Crecer',
    sub:'Clases 1-a-1 en vivo con maestros especializados — en tu idioma, a tu horario. Primera clase gratis.',
    book_btn:'🗓 Reservar clase gratis', wa_btn:'💬 WhatsApp',
    srch_ph:'¿Qué quieres aprender? (Tajweed, Gramática, Fiqh...)',
    srch_tags:['🕌 Tajweed','📖 Gramática','⚖️ Fiqh','🌱 Principiante','🧒 Niños'],
    subj_h:'🏛️ <em>Elige</em> tu materia', subj_all:'Ver todo ›',
    hallnames:['Corán y Tajweed','Lengua Árabe','Ciencias Islámicas','Idiomas Mundiales','Apoyo Escolar','Habilidades Pro'],
    hallsubs:['Memorización y recitación certificada','Para no arabófonos','Fiqh, Hadith y Aqeedah','12 idiomas • Todos los niveles','Bac • Brevet • Universidad','Prog • Diseño • Marketing'],
    steps_h:'🚀 <em>Cómo</em> funciona',
    steps:[['Elige tu materia y maestro','Explora maestros, lee sus reseñas y elige según tu nivel e idioma'],['Reserva tu horario con un clic','Calendario interactivo que muestra tu zona horaria automáticamente'],['Aprende en vivo y obtén un certificado','Clase digital con video, audio y pizarra interactiva — más un certificado al finalizar']],
    teacher_h:'👨‍🏫 <em>¿Eres maestro?</em>',
    teacher_title:'Únete como maestro y gana el 75%',
    teacher_desc:'Buscamos maestros especializados en Corán, Árabe y Ciencias Islámicas — define tu horario y precio libremente',
    teacher_btn:'📩 Contáctanos para unirte',
    courses_h:'📚 <em>Qué</em> aprenderás',courses:['Reglas del Tajweed — de principiante a Ijaza','Memorización del Corán con cadena certificada','Árabe desde cero — A1 a B2','Árabe para niños — Aprender jugando','Fiqh, Hadith, Aqida y Sira','Inglés • Francés • Español y más','Matemáticas • Física • Ciencias y más','Programación • Diseño • Marketing digital'],
    prc_h:'💰 <em>Precios</em> — 100% transparentes',
    
    step1_t:'Elige tu materia y profesor',step1_s:'Explora los profesores, lee sus opiniones y elige según tu nivel e idioma',step2_t:'Reserva tu horario con un clic',step2_s:'Calendario interactivo que muestra tu zona horaria automáticamente',step3_t:'Aprende en vivo y certifícate',step3_s:'Aula digital con video, audio y pizarra interactiva — más un certificado al final',trust_h:'🔒 <em>Por qué</em> confiar en nosotros',
    trust:[['🔰','Clase Gratis','Prueba sin compromiso'],['💰','Prueba Gratis','Prueba antes de decidir'],['🔐','Pago Directo','Transferencia o WhatsApp'],['📜','Profesores Cualificados','Credenciales verificadas']],
    faq_h:'❓ <em>Preguntas</em> frecuentes',
    faqs:[['¿La primera clase es realmente gratis?','Sí, absolutamente. Tu primera clase es gratis sin tarjeta de crédito.'],['¿Cómo son las clases?','Clases 1-a-1 en vivo con video, audio y pizarra interactiva. Cada clase se graba automáticamente.'],['¿Qué idiomas de enseñanza hay?','11 idiomas: Árabe, Inglés, Francés, Español, Alemán, Holandés, Turco, Italiano, Portugués, Indonesio y Urdu.'],['¿Cómo se paga al maestro?','El 75% de cada pago va directamente al maestro, el 25% a la plataforma.'],['¿Puedo cambiar de maestro?','Sí, en cualquier momento.']],
    cta_t:'🎓 Empieza tu viaje hoy',
    cta_s:'Primera clase gratis — sin tarjeta\nÚnete y sé de los primeros estudiantes',
    cta_btn:'🗓 Reservar gratis', cta_wa:'💬 Hablar con nosotros',
    spot_title:'Tu lugar está reservado aquí',
    spot_desc:'Aquí estará tu historia de éxito.\nReserva tu clase gratis hoy.',
    spot_btn:'🗓 Reservar tu clase gratis',
    nav:['Inicio','Salones','Biblioteca','Panel','Cuenta'],
  },
  de: {
    dir:'ltr', lang:'de',
    login:'Anmelden',
    title:'Manarat Al-Maarifa<br>Lernen • Entdecken • Wachsen',
    sub:'Live 1-zu-1 Stunden mit spezialisierten Lehrern — in deiner Sprache, zu deiner Zeit. Erste Stunde kostenlos.',
    book_btn:'🗓 Kostenlose Stunde buchen', wa_btn:'💬 WhatsApp',
    srch_ph:'Was möchtest du lernen? (Tajweed, Grammatik, Fiqh...)',
    srch_tags:['🕌 Tajweed','📖 Grammatik','⚖️ Fiqh','🌱 Anfänger','🧒 Kinder'],
    subj_h:'🏛️ <em>Wähle</em> dein Fach', subj_all:'Alle anzeigen ›',
    hallnames:['Quran & Tajweed','Arabische Sprache','Islamische Wissenschaften','Weltsprachen','Schulunterstützung','Berufskompetenzen'],
    hallsubs:['Auswendiglernen & zertifizierte Rezitation','Für Nicht-Muttersprachler','Fiqh, Hadith & Aqeedah','12 Sprachen • Alle Stufen','Abitur • Mittelstufe • Uni','Prog • Design • Marketing'],
    steps_h:'🚀 <em>So</em> funktioniert es',
    steps:[['Wähle dein Fach & Lehrer','Durchsuche Lehrer, lies Bewertungen und wähle nach Level und Sprache'],['Buche deinen Termin mit einem Klick','Interaktiver Kalender zeigt automatisch deine Zeitzone'],['Lerne live & erhalte ein Zertifikat','Digitales Klassenzimmer mit Video, Audio & Whiteboard — plus Zertifikat']],
    teacher_h:'👨‍🏫 <em>Bist du Lehrer?</em>',
    teacher_title:'Werde Lehrer & verdiene 75%',
    teacher_desc:'Wir suchen spezialisierte Lehrer für Quran, Arabisch & Islamische Wissenschaften — bestimme selbst Zeiten und Preise',
    teacher_btn:'📩 Kontakt aufnehmen',
    courses_h:'📚 <em>Was</em> du lernen wirst',courses:['Tajweed-Regeln — vom Anfänger bis zur Ijaza','Koran-Memorierung mit zertifizierter Kette','Arabisch von Null — A1 bis B2','Arabisch für Kinder — Spielerisch lernen','Fiqh, Hadith, Aqida und Sira','Englisch • Französisch • Spanisch und mehr','Mathe • Physik • Naturwissenschaften','Programmierung • Design • Digitales Marketing'],
    prc_h:'💰 <em>Preise</em> — 100% transparent',
    
    step1_t:'Wähle dein Fach & Lehrer',step1_s:'Durchsuche Lehrer, lies ihre Bewertungen und wähle nach deinem Niveau und deiner Sprache',step2_t:'Buche deinen Slot mit einem Klick',step2_s:'Interaktiver Kalender zeigt deine Zeitzone automatisch',step3_t:'Lerne live & werde zertifiziert',step3_s:'Digitales Klassenzimmer mit Video, Audio & interaktivem Whiteboard — plus ein Zertifikat',trust_h:'🔒 <em>Warum</em> uns vertrauen',
    trust:[['🔰','Kostenlose Stunde','Ausprobieren ohne Verpflichtung'],['💰','Kostenlose Probe','Testen vor Entscheidung'],['🔐','Direkte Zahlung','Überweisung oder WhatsApp'],['📜','Qualifizierte Lehrer','Geprüfte Qualifikationen']],
    faq_h:'❓ <em>Häufig gestellte</em> Fragen',
    faqs:[['Ist die erste Stunde wirklich kostenlos?','Ja, absolut. Deine erste Stunde ist kostenlos ohne Kreditkarte.'],['Wie laufen die Stunden ab?','Live 1-zu-1 Stunden mit Video, Audio und interaktivem Whiteboard. Jede Stunde wird automatisch aufgezeichnet.'],['Welche Unterrichtssprachen gibt es?','11 Sprachen: Arabisch, Englisch, Französisch, Spanisch, Deutsch, Niederländisch, Türkisch, Italienisch, Portugiesisch, Indonesisch und Urdu.'],['Wie wird der Lehrer bezahlt?','75% jeder Zahlung gehen direkt an den Lehrer, 25% an die Plattform.'],['Kann ich den Lehrer wechseln?','Ja, jederzeit.']],
    cta_t:'🎓 Starte deine Reise heute',
    cta_s:'Erste Stunde kostenlos — keine Kreditkarte\nWerde einer der ersten Studenten',
    cta_btn:'🗓 Kostenlos buchen', cta_wa:'💬 Uns kontaktieren',
    spot_title:'Dein Platz ist hier reserviert',
    spot_desc:'Hier wird deine Erfolgsgeschichte stehen.\nBuche deine kostenlose Stunde heute.',
    spot_btn:'🗓 Kostenlose Stunde buchen',
    nav:['Startseite','Hallen','Bibliothek','Dashboard','Konto'],
  },
  tr:{dir:'ltr',lang:'tr',login:'Giriş',title:'Manarat Al-Maarifa<br>Öğren • Keşfet • Büyü',sub:'Uzman öğretmenlerle canlı 1-e-1 dersler — kendi dilinizde, kendi saatinizde. İlk ders ücretsiz.',book_btn:'🗓 Ücretsiz ders rezerve et',wa_btn:'💬 WhatsApp',srch_ph:'Ne öğrenmek istiyorsun? (Tecvid, Gramer, Fıkıh...)',srch_tags:['🕌 Tecvid','📖 Gramer','⚖️ Fıkıh','🌱 Başlangıç','🧒 Çocuklar'],subj_h:'🏛️ <em>Konunuzu</em> seçin',subj_all:'Tümünü gör ›',hallnames:['Kuran & Tecvid','Arapça Dili','İslami Bilimler'],hallsubs:['Ezberleme ve sertifikalı okuma','Ana dili Arapça olmayanlar için','Fıkıh, Hadis ve Akide'],steps_h:'🚀 <em>Nasıl</em> çalışır',steps:[['Konunuzu ve öğretmeninizi seçin','Öğretmenlere göz atın, yorumları okuyun ve seviyenize uygun olanı seçin'],['Randevunuzu tek tıkla rezerve edin','Saat diliminizi otomatik gösteren interaktif takvim'],['Canlı öğrenin ve sertifika alın','Video, ses ve interaktif beyaz tahtayla dijital sınıf']],teacher_h:'👨‍🏫 <em>Öğretmen misiniz?</em>',teacher_title:'Öğretmen olarak katılın ve %75 kazanın',teacher_desc:'Her alanda uzman öğretmenler arıyoruz — Kuran, diller, akademik destek, mesleki beceriler',teacher_btn:'📩 Katılmak için iletişime geçin',courses_h:'📚 <em>Ne</em> öğreneceksiniz',courses:['Tecvid Kuralları — Başlangıçtan İcazete','Sertifikalı Zincirle Kuran Ezber','Sıfırdan Arapça — A1den B2ye','Çocuklar için Arapça — Oyunla Öğren','Fıkıh, Hadis, Akide ve Siyer','İngilizce • Fransızca • İspanyolca ve daha','Matematik • Fizik • Fen ve daha fazlası','Programlama • Tasarım • Dijital Pazarlama'],prc_h:'💰 <em>Fiyatlar</em> — %100 şeffaf',step1_t:'Konunu ve öğretmenini seç',step1_s:'Öğretmenlere göz at, yorumları oku ve seviyene göre seç',step2_t:'Tek tıkla rezervasyon yap',step2_s:'Saat diliminizi otomatik gösteren interaktif takvim',step3_t:'Canlı öğren ve sertifika al',step3_s:'Video, ses ve interaktif tahtalı dijital sınıf — artı sertifika',trust_h:'🔒 <em>Neden</em> güvenin',trust:[['🔰','Ücretsiz Ders','Taahhüt olmadan dene'],['💰','Ücretsiz Deneme','Karar vermeden dene'],['🔐','Direkt Ödeme','Havale veya WhatsApp'],['📜','Sertifikalar','Bağlı zincir']],faq_h:'❓ <em>Sık sorulan</em> sorular',faqs:[['İlk ders gerçekten ücretsiz mi?','Evet, kredi kartı olmadan.'],['Dersler nasıl işliyor?','Canlı 1-e-1 dersler, video ve interaktif tahta ile.'],['Hangi diller var?','Arapça, İngilizce, Fransızca, İspanyolca, Almanca ve daha fazlası. Yeni öğretmenler katıldıkça dil seçenekleri genişlemektedir.'],['Öğretmen nasıl ödeme alır?','Her ödemeden %75 öğretmene gider.'],['Öğretmeni değiştirebilir miyim?','Evet, istediğiniz zaman.']],cta_t:'🎓 Bugün yolculuğunuza başlayın',cta_s:'İlk ders ücretsiz — kart yok\nİlk öğrencilerden biri olun',cta_btn:'🗓 Ücretsiz rezerve et',cta_wa:'💬 Bizimle konuş',spot_title:'Yeriniz burada rezerve',spot_desc:'Başarı hikayeniz burada olacak.\nBugün ücretsiz dersinizi rezerve edin.',spot_btn:'🗓 Ücretsiz ders rezerve et',nav:['Ana Sayfa','Salonlar','Kütüphane','Panel','Hesap']},
  nl:{dir:'ltr',lang:'nl',login:'Inloggen',title:'Manarat Al-Maarifa<br>Leer • Ontdek • Groei',sub:'Live 1-op-1 lessen met gespecialiseerde leraren — in uw taal, op uw tijd. Eerste les gratis.',book_btn:'🗓 Gratis les boeken',wa_btn:'💬 WhatsApp',srch_ph:'Wat wil je leren? (Tajweed, Grammatica, Fiqh...)',srch_tags:['🕌 Tajweed','📖 Grammatica','⚖️ Fiqh','🌱 Beginner','🧒 Kinderen'],subj_h:'🏛️ <em>Kies</em> uw vak',subj_all:'Alles bekijken ›',hallnames:['Koran & Tajweed','Arabische Taal','Islamitische Wetenschappen'],hallsubs:['Memorisatie & gecertificeerde recitatie','Voor niet-moedertaalsprekers','Fiqh, Hadith & Aqeedah'],steps_h:'🚀 <em>Hoe</em> het werkt',steps:[['Kies uw vak & leraar','Blader door leraren, lees beoordelingen en kies op niveau en taal'],['Boek uw slot met één klik','Interactieve kalender toont automatisch uw tijdzone'],['Leer live & ontvang een certificaat','Digitaal klaslokaal met video, audio & whiteboard']],teacher_h:'👨‍🏫 <em>Ben jij leraar?</em>',teacher_title:'Word leraar & verdien 75%',teacher_desc:'We zoeken gespecialiseerde leraren in elke vakgebied — Koran, talen, schoolondersteuning, professionele vaardigheden',teacher_btn:'📩 Neem contact op',courses_h:'📚 <em>Wat</em> u gaat leren',prc_h:'💰 <em>Prijzen</em> — 100% transparant',trust_h:'🔒 <em>Waarom</em> ons vertrouwen',trust:[['🔰','Gratis Les','Probeer zonder verplichting'],['💰','Gratis Proefles','Probeer eerst'],['🔐','Directe Betaling','Overboeking of WhatsApp'],['📜','Certificaten','Gecertificeerde keten']],faq_h:'❓ <em>Veelgestelde</em> vragen',faqs:[['Is de eerste les echt gratis?','Ja, absoluut. Geen creditcard nodig.'],['Hoe verlopen de lessen?','Live 1-op-1 met video en interactief whiteboard.'],['Welke talen zijn er?','We bieden lessen in meerdere talen: Arabisch, Engels, Frans, Spaans, Duits en meer. Het aanbod groeit naarmate er meer leraren bijkomen.'],['Hoe wordt de leraar betaald?','75% gaat direct naar de leraar.'],['Kan ik van leraar wisselen?','Ja, op elk moment.']],cta_t:'🎓 Begin uw reis vandaag',cta_s:'Eerste les gratis — geen kaart\nWees een van de eerste studenten',cta_btn:'🗓 Gratis boeken',cta_wa:'💬 Contact opnemen',spot_title:'Uw plek is hier gereserveerd',spot_desc:'Hier staat straks uw succesverhaal.\nBoek uw gratis les vandaag.',spot_btn:'🗓 Gratis les boeken',nav:['Home','Zalen','Bibliotheek','Dashboard','Account']},
  it:{dir:'ltr',lang:'it',login:'Accedi',title:'Manarat Al-Maarifa<br>Impara • Scopri • Cresci',sub:'Lezioni 1-su-1 in diretta con insegnanti specializzati — nella tua lingua, al tuo orario. Prima lezione gratuita.',book_btn:'🗓 Prenota lezione gratuita',wa_btn:'💬 WhatsApp',srch_ph:'Cosa vuoi imparare? (Tajweed, Grammatica, Fiqh...)',srch_tags:['🕌 Tajweed','📖 Grammatica','⚖️ Fiqh','🌱 Principiante','🧒 Bambini'],subj_h:'🏛️ <em>Scegli</em> la tua materia',subj_all:'Vedi tutto ›',hallnames:['Corano & Tajweed','Lingua Araba','Scienze Islamiche'],hallsubs:['Memorizzazione & recitazione certificata','Per non madrelingua','Fiqh, Hadith e Aqeedah'],steps_h:'🚀 <em>Come</em> funziona',steps:[['Scegli la tua materia & insegnante','Esplora gli insegnanti, leggi le recensioni e scegli in base al livello e alla lingua'],['Prenota il tuo slot con un clic','Calendario interattivo che mostra automaticamente il tuo fuso orario'],['Impara dal vivo & ottieni un certificato','Classe digitale con video, audio & lavagna interattiva']],teacher_h:'👨‍🏫 <em>Sei un insegnante?</em>',teacher_title:'Unisciti come insegnante e guadagna il 75%',teacher_desc:'Cerchiamo insegnanti specializzati in qualsiasi materia — Corano, lingue, supporto scolastico, competenze professionali',teacher_btn:'📩 Contattaci per unirti',courses_h:'📚 <em>Cosa</em> imparerai',prc_h:'💰 <em>Prezzi</em> — 100% trasparenti',trust_h:'🔒 <em>Perché</em> fidarsi di noi',trust:[['🔰','Lezione Gratuita','Prova senza impegno'],['💰','Prova Gratuita','Prova prima di decidere'],['🔐','Pagamento Diretto','Bonifico o WhatsApp'],['📜','Certificati','Catena certificata']],faq_h:'❓ <em>Domande</em> frequenti',faqs:[['La prima lezione è davvero gratuita?','Sì, assolutamente. Senza carta di credito.'],['Come si svolgono le lezioni?','Lezioni 1-su-1 con video e lavagna interattiva.'],['Quali lingue di insegnamento ci sono?','Offriamo lezioni in arabo, inglese, francese, spagnolo, tedesco e altre lingue. L\'offerta cresce con l\'arrivo di nuovi insegnanti.'],['Come viene pagato l\'insegnante?','Il 75% va direttamente all\'insegnante.'],['Posso cambiare insegnante?','Sì, in qualsiasi momento.']],cta_t:'🎓 Inizia il tuo percorso oggi',cta_s:'Prima lezione gratuita — senza carta\nEntra tra i primi studenti',cta_btn:'🗓 Prenota gratis',cta_wa:'💬 Contattaci',spot_title:'Il tuo posto è riservato qui',spot_desc:'Qui ci sarà la tua storia di successo.\nPrenota la tua lezione gratuita oggi.',spot_btn:'🗓 Prenota lezione gratuita',nav:['Home','Sale','Biblioteca','Dashboard','Account']},
  pt:{dir:'ltr',lang:'pt',login:'Entrar',title:'Manarat Al-Maarifa<br>Aprenda • Descubra • Cresça',sub:'Aulas 1-a-1 ao vivo com professores especializados — no seu idioma, no seu horário. Primeira aula grátis.',book_btn:'🗓 Reservar aula grátis',wa_btn:'💬 WhatsApp',srch_ph:'O que você quer aprender? (Tajweed, Gramática, Fiqh...)',srch_tags:['🕌 Tajweed','📖 Gramática','⚖️ Fiqh','🌱 Iniciante','🧒 Crianças'],subj_h:'🏛️ <em>Escolha</em> sua matéria',subj_all:'Ver tudo ›',hallnames:['Alcorão & Tajweed','Língua Árabe','Ciências Islâmicas'],hallsubs:['Memorização & recitação certificada','Para não falantes de árabe','Fiqh, Hadith & Aqeedah'],steps_h:'🚀 <em>Como</em> funciona',steps:[['Escolha sua matéria e professor','Navegue pelos professores, leia avaliações e escolha por nível e idioma'],['Reserve seu horário com um clique','Calendário interativo que mostra seu fuso horário automaticamente'],['Aprenda ao vivo e obtenha um certificado','Sala de aula digital com vídeo, áudio e lousa interativa']],teacher_h:'👨‍🏫 <em>Você é professor?</em>',teacher_title:'Junte-se como professor e ganhe 75%',teacher_desc:'Buscamos professores especializados em qualquer área — Alcorão, idiomas, apoio acadêmico, habilidades profissionais',teacher_btn:'📩 Entre em contato',courses_h:'📚 <em>O que</em> você vai aprender',prc_h:'💰 <em>Preços</em> — 100% transparentes',trust_h:'🔒 <em>Por que</em> confiar em nós',trust:[['🔰','Aula Grátis','Tente sem compromisso'],['💰','Teste Grátis','Experimente antes'],['🔐','Pagamento Direto','Transferência ou WhatsApp'],['📜','Certificados','Cadeia certificada']],faq_h:'❓ <em>Perguntas</em> frequentes',faqs:[['A primeira aula é realmente grátis?','Sim, absolutamente. Sem cartão de crédito.'],['Como são as aulas?','Aulas 1-a-1 ao vivo com vídeo e lousa interativa.'],['Quais idiomas de ensino há?','Oferecemos em árabe, inglês, francês, espanhol, alemão e mais. A oferta cresce com a chegada de novos professores.'],['Como o professor é pago?','75% de cada pagamento vai diretamente ao professor.'],['Posso mudar de professor?','Sim, a qualquer momento.']],cta_t:'🎓 Comece sua jornada hoje',cta_s:'Primeira aula grátis — sem cartão\nSeja um dos primeiros alunos',cta_btn:'🗓 Reservar grátis',cta_wa:'💬 Fale conosco',spot_title:'Seu lugar está reservado aqui',spot_desc:'Aqui estará sua história de sucesso.\nReserve sua aula grátis hoje.',spot_btn:'🗓 Reservar aula grátis',nav:['Início','Salas','Biblioteca','Painel','Conta']},
  id:{dir:'ltr',lang:'id',login:'Masuk',title:'Manarat Al-Maarifa<br>Belajar • Temukan • Berkembang',sub:'Pelajaran 1-pada-1 langsung dengan guru spesialis — dalam bahasa Anda, sesuai waktu Anda. Pelajaran pertama gratis.',book_btn:'🗓 Pesan pelajaran gratis',wa_btn:'💬 WhatsApp',srch_ph:'Apa yang ingin Anda pelajari? (Tajweed, Tata Bahasa, Fiqh...)',srch_tags:['🕌 Tajweed','📖 Tata Bahasa','⚖️ Fiqh','🌱 Pemula','🧒 Anak-anak'],subj_h:'🏛️ <em>Pilih</em> mata pelajaran Anda',subj_all:'Lihat semua ›',hallnames:['Al-Quran & Tajweed','Bahasa Arab','Ilmu Islam'],hallsubs:['Hafalan & bacaan bersambung','Untuk penutur non-Arab','Fiqh, Hadis & Aqidah'],steps_h:'🚀 <em>Cara</em> kerjanya',steps:[['Pilih mata pelajaran & guru Anda','Jelajahi guru, baca ulasan, dan pilih yang sesuai level dan bahasa Anda'],['Pesan slot Anda dengan satu klik','Kalender interaktif yang menampilkan zona waktu lokal Anda secara otomatis'],['Belajar langsung & dapatkan sertifikat','Kelas digital dengan video, audio & papan tulis interaktif']],teacher_h:'👨‍🏫 <em>Apakah Anda guru?</em>',teacher_title:'Bergabung sebagai guru & dapatkan 75%',teacher_desc:'Kami mencari guru spesialis di bidang apapun — Al-Quran, bahasa, pendidikan akademik, keterampilan profesional',teacher_btn:'📩 Hubungi kami untuk bergabung',courses_h:'📚 <em>Apa</em> yang akan Anda pelajari',courses:['Aturan Tajweed — dari Pemula hingga Ijaza','Hafalan Quran dengan Rantai Bersertifikat','Bahasa Arab dari Nol — A1 hingga B2','Bahasa Arab untuk Anak — Belajar sambil Bermain','Fiqh, Hadits, Akidah dan Sirah','Inggris • Prancis • Spanyol dan lainnya','Matematika • Fisika • Sains dan lainnya','Pemrograman • Desain • Pemasaran Digital'],prc_h:'💰 <em>Harga</em> — 100% transparan',step1_t:'Pilih mata pelajaran & guru',step1_s:'Jelajahi guru, baca ulasan mereka, dan pilih berdasarkan tingkat dan bahasa Anda',step2_t:'Pesan slot dalam satu klik',step2_s:'Kalender interaktif menampilkan zona waktu Anda secara otomatis',step3_t:'Belajar langsung & dapatkan sertifikat',step3_s:'Kelas digital dengan video, audio & papan tulis interaktif — plus sertifikat',trust_h:'🔒 <em>Mengapa</em> percaya kami',trust:[['🔰','Pelajaran Gratis','Coba tanpa komitmen'],['💰','Uji Coba Gratis','Coba dulu'],['🔐','Pembayaran Langsung','Transfer bank atau WhatsApp'],['📜','Sertifikat','Rantai bersambung']],faq_h:'❓ <em>Pertanyaan</em> yang sering diajukan',faqs:[['Apakah pelajaran pertama benar-benar gratis?','Ya, benar. Tanpa kartu kredit.'],['Bagaimana pelajaran berlangsung?','Pelajaran 1-pada-1 langsung dengan video dan papan tulis interaktif.'],['Bahasa pengajaran apa yang tersedia?','Kami menawarkan dalam bahasa Arab, Inggris, Prancis, Spanyol, Jerman dan lainnya. Terus berkembang seiring bertambahnya guru baru.'],['Bagaimana guru dibayar?','75% dari setiap pembayaran langsung ke guru.'],['Bisakah saya ganti guru?','Ya, kapan saja.']],cta_t:'🎓 Mulai perjalanan Anda hari ini',cta_s:'Pelajaran pertama gratis — tanpa kartu\nJadi salah satu siswa pertama',cta_btn:'🗓 Pesan gratis',cta_wa:'💬 Bicara dengan kami',spot_title:'Tempat Anda dipesan di sini',spot_desc:'Di sinilah kisah sukses Anda akan ada.\nPersan pelajaran gratis Anda hari ini.',spot_btn:'🗓 Pesan pelajaran gratis',nav:['Beranda','Aula','Perpustakaan','Dasbor','Akun']},
};

function s(id,html,isHTML=false){const el=document.getElementById(id);if(el){if(isHTML)el.innerHTML=html;else el.textContent=html;}}
function applyLang(lang){
  const l=T[lang]||T['ar'];
  // Direction & lang
  document.documentElement.dir=l.dir;
  document.documentElement.lang=lang;
  // Header
  s('lbtn',l.login);
  // Hero
  s('h-title',l.title,true);
  s('h-sub',l.sub);
  s('h-book-btn',l.book_btn,true);
  s('h-wa-btn',l.wa_btn);
  // Search
  const si=document.getElementById('h-srch');if(si)si.placeholder=l.srch_ph;
  const tags=document.querySelectorAll('.srch-tag');
  if(l.srch_tags)l.srch_tags.forEach((t,i)=>{if(tags[i])tags[i].textContent=t;});
  // Subjects
  s('subj-h',l.subj_h,true);
  s('subj-all',l.subj_all);
  if(l.hallnames){s('subj-q-nm',l.hallnames[0]);s('subj-l-nm',l.hallnames[1]);s('subj-s-nm',l.hallnames[2]);s('subj-lg-nm',l.hallnames[3]||'');s('subj-edu-nm',l.hallnames[4]||'');s('subj-sk-nm',l.hallnames[5]||'');}
  if(l.hallsubs){s('subj-q-ss',l.hallsubs[0]);s('subj-l-ss',l.hallsubs[1]);s('subj-s-ss',l.hallsubs[2]);s('subj-lg-ss',l.hallsubs[3]||'');s('subj-edu-ss',l.hallsubs[4]||'');s('subj-sk-ss',l.hallsubs[5]||'');}
  // Steps
  s('steps-h',l.steps_h,true);
  if(l.steps){l.steps.forEach((st,i)=>{s('step'+(i+1)+'-t',st[0]);s('step'+(i+1)+'-d',st[1]);});}
  // Teacher join
  s('teacher-h',l.teacher_h,true);
  s('teacher-title',l.teacher_title);
  s('teacher-desc',l.teacher_desc);
  s('teacher-btn',l.teacher_btn);
  // Courses
  s('courses-h',l.courses_h,true);
  // Pricing

  if(l.prc_plans){
    l.prc_plans.forEach((p,i)=>{
      s('prc-nm-'+i,p[0]);s('prc-pr-'+i,p[1]);s('prc-per-'+i,p[2]);
      const fl=document.getElementById('prc-fl-'+i);
      if(fl)fl.innerHTML=p[3].map(f=>`<div class="prc-feat">${f}</div>`).join('');
      s('prc-split-'+i,p[4]);s('prc-btn-'+i,p[5]);
    });
  }
  // Trust
  s('trust-h',l.trust_h,true);
  if(l.trust){
    const ti=document.querySelectorAll('.trust-item');
    l.trust.forEach((t,i)=>{if(ti[i]){ti[i].querySelector('.trust-t').textContent=t[1];ti[i].querySelector('.trust-d').textContent=t[2];}});
  }
  // FAQ
  s('faq-h',l.faq_h,true);
  if(l.faqs){
    const fw=document.getElementById('faq-wrap');
    if(fw)fw.innerHTML=l.faqs.map((f,i)=>`<div class="faq-i${i===0?' on':''}" onclick="tFaq(this)"><div class="faq-q"><span>${f[0]}</span><span class="faq-ic">▼</span></div><div class="faq-a">${f[1]}</div></div>`).join('');
  }
  // CTA
  s('cta-t',l.cta_t);s('cta-s',l.cta_s,true);s('cta-btn',l.cta_btn);s('cta-wa',l.cta_wa);
  // Spot (first student card)
  s('spot-title',l.spot_title);s('spot-desc',l.spot_desc,true);s('spot-btn',l.spot_btn);
  // Footer — keep language consistent with the selected UI language.
  const ft={
    ar:{desc:'منصة تعليمية عالمية شاملة — دروس 1-على-1 في القرآن الكريم، واللغة العربية، والعلوم الشرعية، واللغات.',halls:'🏛️ الفصول التعليمية',book:'🗓 احجز درساً',lib:'📚 المكتبة',teachers:'👨‍🏫 المعلمون',join:'✍️ انضم كمعلم',about:'🌟 عن المنصة',terms:'📄 شروط الخدمة',privacy:'🔒 الخصوصية',support:'💬 دعم واتساب'},
    en:{desc:'A global learning platform — live 1-on-1 lessons in Quran, languages, academic support and professional skills.',halls:'🏛️ Learning Halls',book:'🗓 Book a Lesson',lib:'📚 Library',teachers:'👨‍🏫 Teachers',join:'✍️ Join as a Teacher',about:'🌟 About',terms:'📄 Terms of Service',privacy:'🔒 Privacy',support:'💬 WhatsApp Support'},
    fr:{desc:'Une plateforme éducative mondiale — cours individuels en direct de Coran, langues, soutien scolaire et compétences professionnelles.',halls:'🏛️ Cours',book:'🗓 Réserver un cours',lib:'📚 Bibliothèque',teachers:'👨‍🏫 Enseignants',join:'✍️ Devenir enseignant',about:'🌟 À propos',terms:'📄 Conditions',privacy:'🔒 Confidentialité',support:'💬 Support WhatsApp'},
    es:{desc:'Plataforma educativa mundial — clases individuales en directo de Corán, idiomas, apoyo académico y habilidades profesionales.',halls:'🏛️ Aulas',book:'🗓 Reservar una clase',lib:'📚 Biblioteca',teachers:'👨‍🏫 Profesores',join:'✍️ Unirse como profesor',about:'🌟 Sobre nosotros',terms:'📄 Términos',privacy:'🔒 Privacidad',support:'💬 Soporte WhatsApp'},
    de:{desc:'Globale Bildungsplattform — Live-Einzelunterricht in Koran, Sprachen, schulischer Unterstützung und beruflichen Fähigkeiten.',halls:'🏛️ Lernbereiche',book:'🗓 Unterricht buchen',lib:'📚 Bibliothek',teachers:'👨‍🏫 Lehrkräfte',join:'✍️ Als Lehrkraft beitreten',about:'🌟 Über uns',terms:'📄 Nutzungsbedingungen',privacy:'🔒 Datenschutz',support:'💬 Support WhatsApp'},
    nl:{desc:'Wereldwijd leerplatform — live 1-op-1 lessen in Koran, talen, studiebegeleiding en professionele vaardigheden.',halls:'🏛️ Lessen',book:'🗓 Les boeken',lib:'📚 Bibliotheek',teachers:'👨‍🏫 Leraren',join:'✍️ Word leraar',about:'🌟 Over ons',terms:'📄 Voorwaarden',privacy:'🔒 Privacy',support:'💬 Support WhatsApp'},
    tr:{desc:'Kuran, diller, akademik destek ve profesyonel beceriler için canlı bire bir dersler sunan küresel eğitim platformu.',halls:'🏛️ Dersler',book:'🗓 Ders ayırt',lib:'📚 Kütüphane',teachers:'👨‍🏫 Öğretmenler',join:'✍️ Öğretmen ol',about:'🌟 Hakkımızda',terms:'📄 Hizmet Şartları',privacy:'🔒 Gizlilik',support:'💬 7/24 Destek'},
    it:{desc:'Piattaforma educativa globale — lezioni individuali dal vivo di Corano, lingue, supporto scolastico e competenze professionali.',halls:'🏛️ Aule',book:'🗓 Prenota una lezione',lib:'📚 Biblioteca',teachers:'👨‍🏫 Insegnanti',join:'✍️ Diventa insegnante',about:'🌟 Chi siamo',terms:'📄 Termini',privacy:'🔒 Privacy',support:'💬 Supporto WhatsApp'},
    pt:{desc:'Plataforma educacional global — aulas individuais ao vivo de Alcorão, idiomas, apoio acadêmico e habilidades profissionais.',halls:'🏛️ Aulas',book:'🗓 Reservar aula',lib:'📚 Biblioteca',teachers:'👨‍🏫 Professores',join:'✍️ Ser professor',about:'🌟 Sobre',terms:'📄 Termos',privacy:'🔒 Privacidade',support:'💬 Suporte WhatsApp'},
    id:{desc:'Platform pembelajaran global — pelajaran 1-on-1 langsung untuk Al-Quran, bahasa, dukungan akademik, dan keterampilan profesional.',halls:'🏛️ Kelas',book:'🗓 Pesan pelajaran',lib:'📚 Perpustakaan',teachers:'👨‍🏫 Guru',join:'✍️ Bergabung sebagai guru',about:'🌟 Tentang',terms:'📄 Ketentuan',privacy:'🔒 Privasi',support:'💬 Dukungan WhatsApp'}
  }[lang]||null;
  if(ft){s('footer-desc',ft.desc);['halls','book','lib','teachers','join','about','terms','privacy'].forEach(k=>s('ft-'+k,ft[k]));}
  // Nav
  const niLbs=document.querySelectorAll('.ni-lb');
  if(l.nav)l.nav.forEach((n,i)=>{if(niLbs[i])niLbs[i].textContent=n;});
  try{localStorage.setItem('mm_lang',lang);}catch(e){}
  // ترجمة بطاقات الدروس
  if(l.courses){
    const ids=['crs-t-1','crs-t-2','crs-t-3','crs-t-4','crs-t-5','crs-t-6','crs-t-7','crs-t-8'];
    l.courses.forEach((t,i)=>{const el=document.getElementById(ids[i]);if(el)el.textContent=t;});
  }
}

// Load saved language on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  try {
    const saved = localStorage.getItem('mm_lang');
    if(saved) {
      const sel = document.getElementById('lsel');
      if(sel) sel.value = saved;
      if(saved !== 'ar') applyLang(saved);
    }
  } catch(e) {}
});


function tFaq(el){const o=el.classList.contains('on');document.querySelectorAll('.faq-i').forEach(i=>i.classList.remove('on'));if(!o)el.classList.add('on');}
function fCrs(cat,btn){document.querySelectorAll('.crs-tab').forEach(b=>b.classList.remove('on'));if(btn)btn.classList.add('on');document.querySelectorAll('.crs-card').forEach(c=>c.classList.toggle('hide',cat!=='all'&&c.dataset.cat!==cat));}
function doSearch(){const q=document.getElementById('h-srch')?.value.trim();if(!q)return;toast('جاري البحث عن: '+q,'i');goP('p-halls');}
function srchTag(t){const inp=document.getElementById('h-srch');if(inp)inp.value=t;doSearch();}
// ============================================================
//   LIBRARY
// ============================================================
const BOOKS = [
  {id:1,cat:'q',ic:'📖',title:'متن الجزرية في التجويد',author:'ابن الجزري',pages:24,free:true,badge:'free',pdf:'https://drive.google.com/file/d/PLACEHOLDER_Q1/preview'},
  {id:2,cat:'q',ic:'🕌',title:'تحفة الأطفال في التجويد',author:'سليمان الجمزوري',pages:16,free:true,badge:'free',pdf:''},
  {id:3,cat:'q',ic:'📜',title:'الوافي في شرح الشاطبية',author:'عبد الفتاح القاضي',pages:312,free:false,badge:'',pdf:''},
  {id:4,cat:'q',ic:'🏅',title:'النشر في القراءات العشر',author:'ابن الجزري',pages:420,free:false,badge:'hot',pdf:''},
  {id:5,cat:'l',ic:'✍️',title:'النحو الواضح للمبتدئين',author:'علي الجارم',pages:180,free:true,badge:'new',pdf:''},
  {id:6,cat:'l',ic:'📐',title:'قواعد اللغة العربية المبسطة',author:'مصطفى الغلاييني',pages:240,free:false,badge:'',pdf:''},
  {id:7,cat:'l',ic:'🗣️',title:'تعلم العربية بسهولة',author:'د. محمود فهمي',pages:160,free:true,badge:'new',pdf:''},
  {id:8,cat:'l',ic:'📚',title:'معجم الأفعال العربية',author:'م. السباعي',pages:320,free:false,badge:'',pdf:''},
  {id:9,cat:'s',ic:'📖',title:'شرح الأصول الثلاثة',author:'الشيخ عبد الرزاق البدر',pages:476,free:true,badge:'free',pdf:'https://drive.google.com/file/d/1PYeJu5pUu1vRwJ-b_iSQO8oKo3_t8Ldu/preview'},
  {id:10,cat:'l',ic:'📐',title:'الدروس النحوية',author:'مجموعة من الأساتذة',pages:415,free:false,badge:'',pdf:'https://drive.google.com/file/d/1wxLdJlylyYU1N-C2f-RnVLcqLm3ERc6t/view'},
  {id:11,cat:'q',ic:'📖',title:'شرح تحفة الأطفال بالإنجليزية',author:'ترجمة متخصصة',pages:84,free:false,badge:'new',pdf:'https://drive.google.com/file/d/1lW38C4EY4AOHDBwldAmboX2j9RXgTlHF/view'},
  {id:12,cat:'kids',ic:'🌟',title:'القاعدة النورانية',author:'محمد نور محمد الرعيني',pages:40,free:false,badge:'',pdf:'https://drive.google.com/file/d/1RtxmyDxkNo5DsvRlpSYxVG8GRaj5Tsdh/view'},
  {id:13,cat:'kids',ic:'🎨',title:'أتعلم العربية معك',author:'سلسلة تعليمية',pages:64,free:true,badge:'free',pdf:''},
  {id:14,cat:'kids',ic:'🌙',title:'حكايات الأنبياء للصغار',author:'مكتبة الأطفال',pages:120,free:false,badge:'hot',pdf:''},
];
let libCat='all',libQ='',selBook=null;

function renderBooks(){
  const g=document.getElementById('lib-grid');if(!g)return;
  const books=BOOKS.filter(b=>{
    const mc=libCat==='all'||b.cat===libCat;
    const mq=!libQ||b.title.includes(libQ)||b.author.includes(libQ);
    return mc&&mq;
  });
  if(!books.length){g.innerHTML='<div class="lib-empty" style="grid-column:1/-1"><div>📭</div><div>لا توجد كتب في هذه الفئة</div></div>';return;}
  g.innerHTML=books.map(b=>`<div class="book-card" onclick="openBook(${b.id})">
    <div class="book-cover ${b.cat}"><span>${b.ic}</span>
      ${b.badge?`<div class="book-badge ${b.badge}">${b.badge==='free'?'مجاني':b.badge==='new'?'جديد':'🔥 رائج'}</div>`:''}
    </div>
    <div class="book-info">
      <div class="book-title">${b.title}</div>
      <div class="book-author">${b.author}</div>
      <div class="book-footer">
        <span class="book-pages">${b.pages} صفحة</span>
        <button class="book-btn ${b.free?'read':'lock'}">${b.free?'📖 قراءة':'🔒 للأعضاء'}</button>
      </div>
    </div>
  </div>`).join('');
}

function filterCat(cat,el){
  libCat=cat;
  document.querySelectorAll('.lib-cat').forEach(c=>c.classList.remove('on'));
  el.classList.add('on');renderBooks();
}

function filterBooks(){
  libQ=document.getElementById('lib-q')?.value.trim()||'';renderBooks();
}

function openBook(url, title, cat){
  const u=String(url||'').trim();
  if(!u || /PLACEHOLDER/i.test(u)){
    toast('هذا الكتاب غير متاح للقراءة حالياً. سيتم تفعيله بعد إضافة رابط موثوق.','i');
    return;
  }
  if(!/^https:\/\//i.test(u)){ toast('رابط الكتاب غير صالح.','e'); return; }
  window.open(u, '_blank', 'noopener,noreferrer');
  if(typeof awardBadge==='function') awardBadge('library');
  if(typeof awardXP==='function') awardXP(5, 'فتح كتاب 📚');
  toast('جاري فتح: ' + String(title||'الكتاب'), 's');
}


// ════════════════════════════════════════
//  نظام XP والإنجازات
// ════════════════════════════════════════

const PLAYER = {xp:0, level:1, streak:0, totalLessons:0, badges:[]};
const LEVELS = [
  {min:0,    name:'مبتدئ',    ic:'🌱', color:'#6b7280'},
  {min:100,  name:'متعلم',    ic:'📚', color:'#3b82f6'},
  {min:300,  name:'متقدم',    ic:'⭐', color:'#8b5cf6'},
  {min:600,  name:'ماهر',     ic:'🔥', color:'#f59e0b'},
  {min:1000, name:'محترف',   ic:'💎', color:'#10b981'},
  {min:1500, name:'خبير',     ic:'🏆', color:'#f97316'},
  {min:2500, name:'أسطورة',  ic:'👑', color:'#c8963e'},
];
const BADGES = [
  {id:'first_lesson', name:'أول درس',     ic:'🎯', desc:'أكمل درسك الأول'},
  {id:'streak_3',     name:'3 أيام',      ic:'🔥', desc:'3 أيام متتالية'},
  {id:'streak_7',     name:'أسبوع كامل',  ic:'🌟', desc:'7 أيام متتالية'},
  {id:'xp_100',       name:'100 نقطة',    ic:'💯', desc:'اجمع 100 XP'},
  {id:'xp_500',       name:'500 نقطة',    ic:'⚡', desc:'اجمع 500 XP'},
  {id:'library',      name:'قارئ',         ic:'📖', desc:'افتح كتاباً من المكتبة'},
  {id:'booking',      name:'أول حجز',     ic:'🗓', desc:'احجز درسك الأول'},
  {id:'placement',    name:'اختبار',       ic:'🎓', desc:'أكمل اختبار المستوى'},
  {id:'social',       name:'مشارك',        ic:'👥', desc:'انضم لحصة جماعية'},
  {id:'profile',      name:'هوية',         ic:'🪪', desc:'أكمل ملفك الشخصي'},
  {id:'ai_chat',      name:'محادثة AI',   ic:'🤖', desc:'استخدم منارة AI'},
  {id:'night_owl',    name:'بومة الليل',  ic:'🦉', desc:'تعلّم بعد منتصف الليل'},
];

function savePlayer(){
  try{localStorage.setItem('mm_player_v3', JSON.stringify(PLAYER));}catch(e){}
}
function loadPlayer(){
  try{
    const s=localStorage.getItem('mm_player_v3');
    if(s) Object.assign(PLAYER, JSON.parse(s));
  }catch(e){}
}
function awardXP(pts, reason=''){
  loadPlayer();
  PLAYER.xp = (PLAYER.xp||0) + pts;
  const newLevel = LEVELS.filter(l=>PLAYER.xp>=l.min).pop();
  if(newLevel && newLevel.min > ((LEVELS.filter(l=>(PLAYER.xp-pts)>=l.min).pop()||LEVELS[0]).min)){
    toast(`🎉 ترقيت لـ ${newLevel.ic} ${newLevel.name}!`, 's');
  }
  PLAYER.level = LEVELS.filter(l=>PLAYER.xp>=l.min).length;
  savePlayer();
  if(reason) toast(`+${pts} XP — ${reason}`, 's');
  updateXPBar();
}
function awardBadge(id){
  loadPlayer();
  if(!PLAYER.badges) PLAYER.badges=[];
  if(PLAYER.badges.includes(id)) return;
  PLAYER.badges.push(id);
  const b = BADGES.find(x=>x.id===id);
  if(b){ toast(`🏅 شارة جديدة: ${b.ic} ${b.name}!`, 's'); }
  savePlayer();
}
function updateXPBar(){
  const xpEls = document.querySelectorAll('.xp-val');
  xpEls.forEach(el=>{ if(el) el.textContent = PLAYER.xp + ' XP'; });
}
function updateGamificationUI(){
  loadPlayer();
  const lv = LEVELS.filter(l=>PLAYER.xp>=l.min).pop() || LEVELS[0];
  document.querySelectorAll('.player-level').forEach(el=>{ el.textContent = lv.ic+' '+lv.name; });
  document.querySelectorAll('.player-xp').forEach(el=>{ el.textContent = PLAYER.xp+' XP'; });
  document.querySelectorAll('.player-streak').forEach(el=>{ el.textContent = '🔥 '+( PLAYER.streak||0); });
}

// ════════════════════════════════════════
//  مساعد AI — منارة AI
// ════════════════════════════════════════

let _aiOpen = false;
let _aiHistory = [];

function toggleAIChat(){
  const panel = document.getElementById('ai-chat-panel');
  if(!panel) return;
  _aiOpen = !_aiOpen;
  panel.classList.toggle('on', _aiOpen);
  if(_aiOpen){
    awardBadge('ai_chat');
    const inp = document.getElementById('ai-input');
    if(inp) setTimeout(()=>inp.focus(), 400);
  }
}

async function sendAIMessage(){
  const inp = document.getElementById('ai-input');
  if(!inp) return;
  const msg = inp.value.trim();
  if(!msg) return;
  inp.value=''; inp.style.height='auto';
  
  const msgs = document.getElementById('ai-messages');
  if(!msgs) return;
  
  msgs.insertAdjacentHTML('beforeend',
    `<div style="display:flex;justify-content:flex-end;margin-bottom:.65rem">
       <div style="background:linear-gradient(135deg,var(--go),var(--gl));color:var(--navy);padding:.6rem .9rem;border-radius:14px 14px 4px 14px;font-size:.75rem;max-width:78%;line-height:1.55">${sanitize(msg)}</div>
     </div>`
  );
  
  const thinking = document.createElement('div');
  thinking.id='ai-thinking';
  thinking.innerHTML=`<div style="display:flex;gap:.4rem;align-items:center;margin-bottom:.65rem"><div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6c3fc5,#9b59b6);display:flex;align-items:center;justify-content:center;font-size:.75rem">🤖</div><div style="background:rgba(255,255,255,.06);padding:.55rem .8rem;border-radius:4px 14px 14px 14px;font-size:.72rem;color:var(--tm)">يفكر...</div></div>`;
  msgs.appendChild(thinking);
  msgs.scrollTop = msgs.scrollHeight;
  
  _aiHistory.push({role:'user', content:msg});
  
  try{
    const res = await secureAIFetch('',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'claude-sonnet-4-6',
        max_tokens:600,
        system:`أنت "منارة AI" — المساعد الذكي الرسمي لمنصة منارة المعرفة التعليمية.

## عن المنصة
منارة المعرفة منصة تعليمية عالمية تقدّم دروساً مباشرة فردية (1-على-1) عبر الإنترنت. تأسست في المغرب وتخدم الطلاب في كل أنحاء العالم، خاصة الناطقين بغير العربية.
الموقع: manarat-almaarifa.com
واتساب: +212 681 883 238

## المجالات التعليمية
1. القرآن والتجويد — تحفيظ، تلاوة، أحكام التجويد، القاعدة النورانية
2. اللغة العربية — نحو، صرف، بلاغة، إملاء، وتعليم العربية لغير الناطقين بها
3. العلوم الشرعية — فقه، حديث، عقيدة، سيرة، تفسير
4. اللغات العالمية — بحسب المعلمين والبرامج المتاحة

## نظام الدروس
- درس أول مجاني واحد لكل طالب، مع المعلم الذي يختاره، بلا بطاقة ائتمانية.
- بعده تُحجز الدروس بالاشتراك فقط: يختار الطالب مواعيد أسبوعية ثابتة مع معلمه، والاشتراك ٤ أسابيع، وقيمته عدد المواعيد الأسبوعية × ٤ × سعر درس المعلم. المواعيد محجوزة له طوال الاشتراك، ويُجدَّد قبل نهايته.
- لا تُباع دروس منفردة مدفوعة.

## الأسعار
الدرس الأول مجاني تماماً لكل طالب جديد، بلا بطاقة ائتمانية. بعده تختلف الأسعار حسب المعلم، وتحددها الإدارة، ويراها الطالب في صفحة الحجز. لا تذكر أرقاماً للأسعار؛ أحِل الطالب إلى صفحة الحجز أو إلى واتساب.

## طرق الدفع
- تحويل بنكي إلى حساب CIH Bank — يظهر رقم الحساب عند اختيار هذه الطريقة في صفحة الحجز
- واتساب: للتنسيق المباشر مع الإدارة
بعد التحويل يرسل الطالب صورة الإيصال مع مرجع الدفع عبر واتساب، ويُؤكَّد الحجز بعد التحقق من وصول المبلغ. لا توجد طرق دفع أخرى حالياً؛ لا تَعِد بغيرها.

## المعلمون
معلمون متخصصون من عدة دول، بعضهم حاصل على إجازات قرآنية بالسند المتصل. كل معلم له صفحة تعرض تخصصه ومؤهلاته وتقييمه. يمكن للطالب تصفح المعلمين واختيار الأنسب له.

## المكتبة المجانية
أكثر من 18 مصدراً مجانياً موثوقاً: كتب النحو (النحو الواضح بأجزائه)، مكتبة هنداوي، المكتبة الشاملة، Quran.com، Sunnah.com، أكاديمية خان بالعربية، وغيرها. تُعرض الروابط المجانية المتاحة فقط، بينما يخضع المحتوى غير المجاني لصلاحية الوصول.

## المميزات الإضافية
- نظام نقاط وشارات يحفّز الطالب (7 مستويات، 12 شارة)
- بطاقات مفردات تفاعلية لحفظ الكلمات
- اختبار تحديد المستوى مع توصية ذكية
- دفتر ملاحظات شخصي مع تنظيم بالذكاء الاصطناعي
- مجتمع للطلاب لتبادل الأسئلة والنصائح
- الشهادات: قريباً
- الدروس عبر Zoom أو Google Meet

## كيف يبدأ الطالب
1. يتصفح الفصول أو يبحث عن معلم
2. يحجز درسه الأول مجاناً في موعد مناسب
3. إن أعجبه المعلم، يشترك معه من صفحته بزر «اشترك بمواعيد أسبوعية ثابتة»
4. يدفع ويرسل الإيصال، فتُفعَّل دروس الأسابيع الأربعة كلها في لوحته

## للمعلمين
للمعلم صفحة شخصية احترافية، ويحدد أوقات تدريسه، ويُتفق معه على نسبته عند الانضمام. لا تذكر نسباً أو أرقاماً. للانضمام: نموذج «انضم كمعلم» في الموقع أو التواصل عبر واتساب.

## أسلوبك
- أجب بلغة الطالب نفسها: إن كتب بالإنجليزية أو الفرنسية أو غيرهما فأجب بها، وإن كتب بالعربية فبالفصحى المبسّطة؛ بدفء واحترام
- استخدم الأسلوب السقراطي في التعليم: اطرح أسئلة توجيهية تقود الطالب للفهم بنفسه بدل إعطاء الإجابة جاهزة
- أجب عن أي سؤال تعليمي في تخصصات المنصة بعمق وفائدة
- أجب عن أسئلة المنصة من معرفتك أعلاه مباشرة — لا تحل الطالب على الإدارة إلا في أمور تحتاج قراراً بشرياً فعلياً (كالأسعار، أو الدفع، أو حالة استثنائية)
- لا تخترع معلومة عن المنصة غير مذكورة أعلاه: لا خصومات، ولا باقات، ولا طرق دفع، ولا مزايا غير موجودة
- إن سُئلت عن شيء لا تعرفه عن المنصة، اقترح التواصل عبر واتساب بلطف، لكن حاول أولاً أن تفيد بما تعرف
- شجّع الطالب دائماً وذكّره أن الدرس الأول مجاني`,
        messages: _aiHistory.slice(-8)
      })
    });
    const data = await res.json();
    const reply = data.content?.[0]?.text || 'عذراً، حدث خطأ. حاول مرة أخرى.';
    _aiHistory.push({role:'assistant', content:reply});
    thinking.remove();
    msgs.insertAdjacentHTML('beforeend',
      `<div style="display:flex;gap:.4rem;align-items:flex-start;margin-bottom:.65rem">
         <div style="width:28px;height:28px;border-radius:50%;background:linear-gradient(135deg,#6c3fc5,#9b59b6);display:flex;align-items:center;justify-content:center;font-size:.75rem;flex-shrink:0">🤖</div>
         <div style="background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.08);padding:.65rem .9rem;border-radius:4px 14px 14px 14px;font-size:.75rem;line-height:1.65;max-width:82%">${escapeHtml(reply).replace(/\n/g,'<br>')}</div>
       </div>`
    );
    msgs.scrollTop = msgs.scrollHeight;
  }catch(e){
    if(thinking.parentNode) thinking.remove();
    toast('تعذّر الاتصال بـ AI: '+(e?.message||e),'e'); console.warn('AI chat:', e);
  }
}

// ════════════════════════════════════════
//  بطاقات المفردات
// ════════════════════════════════════════

const DECKS = {
  arabic: {
    name:'العربية الأساسية', ic:'📖', 
    cards:[
      {f:'الصَّبْر',b:'Patience / الصبر — تحمّل الشدائد بهدوء'},
      {f:'العِلْم',b:'Knowledge / المعرفة — طلبها فريضة'},
      {f:'الإِخْلاص',b:'Sincerity / الإخلاص في النية'},
      {f:'التَّوَكُّل',b:'Reliance on God / الاعتماد على الله'},
      {f:'الشُّكْر',b:'Gratitude / شكر النعم'},
      {f:'التَّوْبَة',b:'Repentance / الرجوع إلى الله'},
      {f:'الذِّكْر',b:'Remembrance of God / ذكر الله'},
      {f:'الزُّهْد',b:'Asceticism / الزهد في الدنيا'},
    ]
  },
  tajweed: {
    name:'التجويد', ic:'🎤',
    cards:[
      {f:'الإِخْفَاء',b:'الإخفاء — إخفاء النون الساكنة عند حروف الإخفاء'},
      {f:'الإِدْغَام',b:'الإدغام — إدخال حرف في حرف'},
      {f:'الإِقْلَاب',b:'الإقلاب — قلب النون الساكنة ميماً عند الباء'},
      {f:'الإِظْهَار',b:'الإظهار — نطق النون ساكنة بوضوح'},
      {f:'الْمَدّ',b:'المد — إطالة الصوت بحروف العلة'},
      {f:'الغُنَّة',b:'الغنة — صوت أنفي عند الميم والنون'},
    ]
  },
  grammar: {
    name:'النحو والصرف', ic:'✍️',
    cards:[
      {f:'الفَاعِل',b:'Subject / من قام بالفعل — مرفوع دائماً'},
      {f:'الْمَفْعُول',b:'Object / من وقع عليه الفعل — منصوب'},
      {f:'الْمُبْتَدَأ',b:'Topic / ما تبدأ به الجملة الاسمية'},
      {f:'الْخَبَر',b:'Predicate / ما يُخبر عن المبتدأ'},
      {f:'الْجُمْلَة الفِعْلِيَّة',b:'Verbal Sentence / تبدأ بفعل'},
      {f:'الضَّمِير',b:'Pronoun / هو، هي، أنت...'},
    ]
  },
  english: {
    name:'الإنجليزية', ic:'🇬🇧',
    cards:[
      {f:'Present Simple',b:'المضارع البسيط: I study Arabic every day'},
      {f:'Past Simple',b:'الماضي البسيط: I studied Arabic yesterday'},
      {f:'Future Simple',b:'المستقبل: I will study Arabic tomorrow'},
      {f:'Present Perfect',b:'المضارع التام: I have studied Arabic'},
      {f:'Modal Verbs',b:'أفعال مساعدة: can, could, should, must'},
      {f:'Conditional',b:'الشرطية: If I study, I will succeed'},
    ]
  }
};

let _currentDeck = null;
let _cardIndex = 0;
let _cardFlipped = false;

function loadDeck(key){
  const deck = DECKS[key];
  if(!deck) return;
  _currentDeck = deck;
  _cardIndex = 0;
  _cardFlipped = false;
  renderCard();
  awardXP(5, 'بدء جلسة مذاكرة 📚');
}
function renderCard(){
  const c = _currentDeck?.cards[_cardIndex];
  if(!c) return;
  const front = document.getElementById('card-front');
  const back = document.getElementById('card-back');
  const counter = document.getElementById('card-counter');
  if(front) front.textContent = c.f;
  if(back) back.textContent = c.b;
  if(counter) counter.textContent = (_cardIndex+1)+'/'+_currentDeck.cards.length;
  const card = document.getElementById('flash-card');
  if(card){ card.classList.remove('flipped'); _cardFlipped=false; }
}
function flipCard(){
  const card = document.getElementById('flash-card');
  if(!card) return;
  _cardFlipped = !_cardFlipped;
  card.classList.toggle('flipped', _cardFlipped);
}
function nextCard(){
  if(!_currentDeck) return;
  if(_cardIndex < _currentDeck.cards.length-1){
    _cardIndex++;
  } else {
    _cardIndex = 0;
    awardXP(15, 'إتمام مجموعة بطاقات 🎴');
    toast('أحسنت! أتممت المجموعة كاملة 🎉','s');
  }
  renderCard();
}
function prevCard(){
  if(!_currentDeck) return;
  _cardIndex = Math.max(0, _cardIndex-1);
  renderCard();
}

// ════════════════════════════════════════
//  اختبار تحديد المستوى
// ════════════════════════════════════════

const PLACEMENT_QUESTIONS = {
  arabic:[
    {q:'ما إعراب كلمة "محمدٌ" في جملة: محمدٌ مجتهدٌ؟', opts:['فاعل','مبتدأ','خبر','مفعول به'], ans:1},
    {q:'ما المقصود بالإدغام في التجويد؟', opts:['إظهار الحرف','إخفاء الحرف','إدخال حرف في حرف','قلب الحرف'], ans:2},
    {q:'ما جمع كلمة "كتاب"؟', opts:['كتابات','كُتُب','كتيبات','أكتاب'], ans:1},
    {q:'أي الآيات التالية تحتوي على مد واجب متصل؟', opts:['بِسْمِ اللَّهِ','إِيَّاكَ نَعْبُدُ','الرَّحِيمِ','جَاءَ أَمْرُ اللَّهِ'], ans:3},
    {q:'ما مرجع الضمير في "أكرمتُه"؟', opts:['المتكلم','المخاطب','الغائب','المثنى'], ans:2},
  ],
  english:[
    {q:'Choose the correct form: "She ___ to school every day."', opts:['go','goes','going','gone'], ans:1},
    {q:'What is the past tense of "write"?', opts:['writed','wrote','written','writing'], ans:1},
    {q:'"I have been studying for 3 hours." What tense is this?', opts:['Past Simple','Present Perfect','Present Perfect Continuous','Past Continuous'], ans:2},
    {q:'Choose the correct article: "___ apple a day keeps the doctor away."', opts:['A','An','The','No article'], ans:1},
    {q:'What does "consequently" mean?', opts:['However','Therefore','Although','Meanwhile'], ans:1},
  ]
};

let _placement = {subject:'', questions:[], current:0, answers:[], started:false};

function startPlacementTest(subject){
  const qs = PLACEMENT_QUESTIONS[subject] || PLACEMENT_QUESTIONS.arabic;
  _placement = {subject, questions:qs, current:0, answers:[], started:true};
  renderPlacementQ();
  goP('p-placement');
}
function renderPlacementQ(){
  const q = _placement.questions[_placement.current];
  if(!q) return finishPlacement();
  const container = document.getElementById('placement-q');
  if(!container) return;
  container.innerHTML=`
    <div style="font-size:.68rem;color:var(--tm);margin-bottom:.65rem">سؤال ${_placement.current+1} من ${_placement.questions.length}</div>
    <div style="font-size:.85rem;font-weight:600;line-height:1.6;margin-bottom:1rem">${q.q}</div>
    <div style="display:flex;flex-direction:column;gap:.5rem">
      ${q.opts.map((o,i)=>`<button class="btn bgh" style="text-align:right;padding:.7rem .9rem;font-size:.78rem" onclick="answerPlacement(${i})">${o}</button>`).join('')}
    </div>`;
}
function answerPlacement(idx){
  const q = _placement.questions[_placement.current];
  _placement.answers.push(idx === q.ans);
  _placement.current++;
  if(_placement.current < _placement.questions.length){
    renderPlacementQ();
  } else {
    finishPlacement();
  }
}
async function finishPlacement(){
  const correct = _placement.answers.filter(Boolean).length;
  const total = _placement.questions.length;
  const pct = Math.round(correct/total*100);
  let level = pct>=80?'متقدم':pct>=50?'متوسط':'مبتدئ';
  
  awardXP(20, 'إتمام اختبار المستوى 🎓');
  awardBadge('placement');
  
  const container = document.getElementById('placement-q');
  if(!container) return;
  container.innerHTML=`
    <div style="text-align:center;padding:1.5rem 0">
      <div style="font-size:2.5rem;margin-bottom:.5rem">${pct>=80?'🏆':pct>=50?'⭐':'📚'}</div>
      <div style="font-size:1.1rem;font-weight:700;margin-bottom:.4rem">مستواك: ${level}</div>
      <div style="font-size:.78rem;color:var(--tm);margin-bottom:1rem">${correct}/${total} إجابة صحيحة (${pct}%)</div>
      <div id="ai-placement-tip" style="background:rgba(108,63,197,.1);border:1px solid rgba(108,63,197,.2);border-radius:12px;padding:.85rem;font-size:.72rem;color:var(--tm);line-height:1.7;margin-bottom:1rem">🤖 جاري تحليل نتيجتك...</div>
      <button class="btn bgo" onclick="goP('p-book')">احجز درسك المناسب</button>
    </div>`;
  
  try{
    const res = await secureAIFetch('',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:200,
        system:'مستشار تعليمي. أعطِ نصيحة مختصرة في جملتين بالعربية.',
        messages:[{role:'user',content:`طالب حصل على ${pct}% في اختبار ${_placement.subject} (مستوى ${level}). قدّم له نصيحة تعليمية مشجعة.`}]
      })
    });
    const d = await res.json();
    const tip = document.getElementById('ai-placement-tip');
    if(tip) tip.textContent = '🤖 ' + (d.content?.[0]?.text||'');
  }catch(e){}
}

// ════════════════════════════════════════
//  الحصص الجماعية
// ════════════════════════════════════════

let GROUP_CLASSES = [];
try{ const s = localStorage.getItem("mm_group_classes"); if(s) GROUP_CLASSES = JSON.parse(s); }catch(e){}

function renderGroupClasses(){
  const el = document.getElementById('group-list');
  if(!el) return;
  
  if(!GROUP_CLASSES.length && !_sb){
    el.innerHTML = `<div style="text-align:center;padding:2.5rem 1rem">
      <div style="font-size:2.2rem;margin-bottom:.6rem">👥</div>
      <div style="font-size:.8rem;font-weight:700;margin-bottom:.35rem">الحصص الجماعية قريباً</div>
      <div style="font-size:.7rem;color:var(--tm);line-height:1.7;max-width:290px;margin:0 auto .9rem">نعمل على تنظيم حصص جماعية بأسعار أقل. سجّل اهتمامك وسنخبرك فور توفرها</div>
      <button class="btn bgo" onclick="window.open('https://wa.me/212681883238?text='+encodeURIComponent('السلام عليكم، أريد التسجيل في الحصص الجماعية عند توفرها'),'_blank')">💬 سجّل اهتمامك</button>
    </div>`;
    return;
  }
  
  el.innerHTML = GROUP_CLASSES.map(g=>`
    <div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:16px;padding:.9rem;margin-bottom:.6rem">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:.5rem">
        <div>
          <div style="font-size:.82rem;font-weight:700">${g.title}</div>
          <div style="font-size:.68rem;color:var(--tm)">👨‍🏫 ${g.teacher}</div>
        </div>
        <div style="text-align:left">
          <div style="font-size:.85rem;font-weight:700;color:var(--gl)">$${g.price}</div>
          <div style="font-size:.6rem;color:var(--tm)">/حصة</div>
        </div>
      </div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap;margin-bottom:.65rem">
        <span style="background:rgba(212,175,106,.12);color:var(--gl);font-size:.6rem;padding:.15rem .5rem;border-radius:100px">🗓 ${g.day} ${g.time}</span>
        <span style="background:rgba(255,255,255,.06);font-size:.6rem;padding:.15rem .5rem;border-radius:100px">⏱ ${g.dur} دقيقة</span>
        <span style="background:rgba(255,255,255,.06);font-size:.6rem;padding:.15rem .5rem;border-radius:100px">👥 ${g.cur}/${g.max}</span>
      </div>
      <div style="display:flex;gap:.5rem;align-items:center">
        <div style="flex:1;background:rgba(255,255,255,.06);border-radius:100px;height:5px;overflow:hidden">
          <div style="background:var(--go);height:100%;width:${Math.round(g.cur/g.max*100)}%;border-radius:100px"></div>
        </div>
        <button class="btn bgo bsm" style="font-size:.62rem" onclick="joinGroupClass(${g.id})">انضم</button>
      </div>
    </div>`).join('');
}

function joinGroupClass(id){
  const g = GROUP_CLASSES.find(x=>x.id===id);
  if(!g) return;
  if(g.cur>=g.max){ toast('الفصل ممتلئ','e'); return; }
  
  // إذا يوجد رابط اجتماع — افتحه مباشرة
  const link = MEETING_LINKS['gc-'+id];
  if(link){
    const now = new Date();
    const hour = now.getHours();
    const classHour = parseInt(g.time.split(':')[0]);
    // إذا الوقت قريب (±30 دقيقة) افتح مباشرة
    if(Math.abs(hour - classHour) <= 1){
      window.open(link,'_blank');
      if(typeof awardXP==='function') awardXP(10,'حضور حصة جماعية 👥');
      toast('جاري فتح الفصل...','s');
      return;
    }
  }
  const msg = encodeURIComponent(`السلام عليكم 🌟
أريد الانضمام لحصة "${g.title}" الجماعية
🗓 ${g.day} ${g.time}
💰 $${g.price}/حصة
الاسم: ${CU?.name||'طالب جديد'}`);
  window.open('https://wa.me/212681883238?text='+msg,'_blank','noopener,noreferrer');
  awardBadge('social');
  awardXP(10,'الانضمام لحصة جماعية 👥');
  toast('يتم تحويلك لواتساب لإتمام التسجيل','s');
}



document.addEventListener('DOMContentLoaded',()=>{
  loadPlayer();
  updateGamificationUI();
  renderGroupClasses();
  
  // تهيئة شبكة الشارات
  const grid = document.getElementById('badges-grid');
  if(grid){
    loadPlayer();
    grid.innerHTML = BADGES.map(b=>`
      <div style="background:${(PLAYER.badges||[]).includes(b.id)?'rgba(212,175,106,.15)':'rgba(255,255,255,.04)'};border:1px solid ${(PLAYER.badges||[]).includes(b.id)?'rgba(212,175,106,.25)':'var(--bdl)'};border-radius:12px;padding:.65rem .4rem;text-align:center">
        <div style="font-size:1.4rem">${b.ic}</div>
        <div style="font-size:.58rem;font-weight:600;margin-top:.25rem;color:${(PLAYER.badges||[]).includes(b.id)?'var(--gl)':'var(--tm)'}">${b.name}</div>
      </div>`).join('');
  }
  
  // streak يومي
  const today = new Date().toDateString();
  const last = localStorage.getItem('mm_last_v3');
  if(last !== today){
    localStorage.setItem('mm_last_v3', today);
    if(last){
      const diff = (new Date()-new Date(last))/86400000;
      PLAYER.streak = diff<=1?(PLAYER.streak||0)+1:1;
    } else PLAYER.streak=1;
    if(PLAYER.streak>=3) awardBadge('streak_3');
    if(PLAYER.streak>=7) awardBadge('streak_7');
    awardXP(5,'فتح التطبيق اليوم 🌅');
    savePlayer();
  }
  
  // deck area toggle
  const deckButtons = document.querySelectorAll('[onclick^="loadDeck"]');
  deckButtons.forEach(btn=>{
    const orig = btn.onclick;
    btn.addEventListener('click',()=>{
      const area = document.getElementById('deck-area');
      if(area) area.style.display='block';
    });
  });
});

