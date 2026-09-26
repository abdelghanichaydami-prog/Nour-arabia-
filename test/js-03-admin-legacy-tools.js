

const WA_REPLIES = [
  {
    id: 1,
    tag: '/ترحيب',
    title: 'ترحيب بالزائر الجديد',
    cat: 'عام',
    text: `السلام عليكم ورحمة الله وبركاته 🌟

أهلاً وسهلاً بك في *منارة المعرفة* — منصة التعليم الإسلامي والعربي.

أنا هنا لمساعدتك! يمكنني الإجابة عن أسئلتك حول:
📚 الفصول التعليمية
👨‍🏫 المعلمين المتخصصين
🗓 كيفية الحجز
💰 الأسعار والعروض

كيف يمكنني مساعدتك اليوم؟ 😊`
  },
  {
    id: 2,
    tag: '/أسعار',
    title: 'الأسعار والباقات',
    cat: 'حجز',
    text: `💰 *الأسعار في منارة المعرفة:*

• الدرس الأول *مجاني* تماماً ✅
• بعده اشتراك كل ٤ أسابيع بمواعيدك الأسبوعية الثابتة
• قيمة الاشتراك = عدد مواعيدك في الأسبوع × ٤ × سعر درس المعلم، ويظهر المبلغ قبل الدفع
• لا يلزمك الدفع قبل أن تجرّب المعلم

لحجز درسك المجاني: manarat-almaarifa.com

أخبرني بالفصل الذي تريده، وأرشدك إلى المعلم المناسب 👇`
  },
  {
    id: 3,
    tag: '/فصول',
    title: 'الفصول التعليمية',
    cat: 'معلومات',
    text: `📚 *فصولنا التعليمية:*

🕌 *القرآن الكريم والتجويد*
تلاوة، تجويد، حفظ، القاعدة النورانية

📖 *اللغة العربية*
نحو، صرف، بلاغة، إملاء، وتعليم العربية لغير الناطقين بها

⚖️ *العلوم الشرعية*
فقه، حديث، تفسير، عقيدة، سيرة

🌍 *اللغات العالمية*
بحسب المعلمين المتاحين

لأي فصل تريد الانضمام؟ 👇`
  },
  {
    id: 4,
    tag: '/حجز',
    title: 'كيفية الحجز',
    cat: 'حجز',
    text: `🗓 *كيف تبدأ؟*

1️⃣ احجز درسك الأول *مجاناً* مع المعلم الذي تختاره 🎁
2️⃣ إن أعجبك، اشترك معه بمواعيد أسبوعية ثابتة
3️⃣ الاشتراك ٤ أسابيع، ومواعيدك محجوزة لك طوال مدته
4️⃣ ادفع وأرسل الإيصال، فتُفعَّل دروسك كلها

🔗 manarat-almaarifa.com

أخبرني بالفصل الذي تريده والأوقات المناسبة لك، وأرشدك إلى المعلم المناسب ✅`
  },
  {
    id: 5,
    tag: '/معلمين',
    title: 'معلومات عن المعلمين',
    cat: 'معلومات',
    text: `👨‍🏫 *معلمو منارة المعرفة:*

جميع معلمينا:
✅ مؤهلون ومتخصصون في مجالاتهم
✅ لديهم خبرة في التدريس عن بُعد
✅ مُقيَّمون من طلاب سابقين
✅ الدرس الأول مع المنصة مجاني

يمكنك:
🔍 تصفح ملفات المعلمين كاملةً على الموقع
⭐ قراءة تقييمات الطلاب
📹 مشاهدة فيديو تعريفي لكل معلم

هل تريد معلماً في تخصص معين؟ أخبرني وأرشدك 👇`
  },
  {
    id: 6,
    tag: '/تسجيل',
    title: 'التسجيل في المنصة',
    cat: 'حجز',
    text: `📝 *التسجيل في منارة المعرفة:*

التسجيل *مجاني* تماماً ✅

للتسجيل:
1️⃣ افتح: manarat-almaarifa.com
2️⃣ اضغط "تسجيل حساب"
3️⃣ أدخل اسمك وبريدك وكلمة مرور
4️⃣ تم! حسابك جاهز فوراً

بعد التسجيل تحصل على:
🎁 درس أول مجاني
📚 وصول إلى المكتبة التعليمية
🗓 إمكانية الحجز المباشر
🏆 نظام النقاط والشارات

هل تحتاج مساعدة في التسجيل؟`
  },
  {
    id: 7,
    tag: '/مكتبة',
    title: 'المكتبة المجانية',
    cat: 'معلومات',
    text: `📚 *مكتبة منارة المعرفة:*

مصادر وكتب تعليمية مجانية في:

🕌 التجويد والقراءات
📖 اللغة العربية والنحو
⚖️ الفقه والحديث والعقيدة

✅ مجانية بالكامل
✅ تُقرأ مباشرة في الموقع

اكتشف المكتبة: manarat-almaarifa.com`
  },
  {
    id: 8,
    tag: '/دفع',
    title: 'طرق الدفع',
    cat: 'حجز',
    text: `💳 *طرق الدفع:*

🏦 *تحويل بنكي* إلى حسابنا في CIH Bank — يظهر رقم الحساب في صفحة الحجز
💬 *واتساب* — للتنسيق المباشر مع الإدارة

📌 الدرس الأول *مجاني* ولا يحتاج دفعاً

بعد التحويل أرسل لنا صورة الإيصال مع *مرجع الدفع* الظاهر في حجزك، ونؤكد حجزك فور وصول المبلغ.

هل لديك أي استفسار حول الدفع؟`
  },
  {
    id: 9,
    tag: '/جماعي',
    title: 'الحصص الجماعية',
    cat: 'معلومات',
    text: `👥 *الدورات الجماعية:*

نعمل على إطلاق دورات جماعية بمنهج محدد (متن أو سلسلة تعليمية)، في مجموعات صغيرة، ولكل دورة بداية ونهاية.

سنعلن عنها قريباً إن شاء الله على الموقع.

أخبرني بما تريد تعلّمه ولغة الشرح المناسبة لك، لنبلغك عند افتتاح دورة تناسبك ✅`
  },
  {
    id: 10,
    tag: '/شكوى',
    title: 'معالجة الشكاوى',
    cat: 'دعم',
    text: `🙏 *نأسف لما مررت به*

رضاك أولويتنا في منارة المعرفة.

لمعالجة شكواك نحتاج:
📝 تفاصيل المشكلة
🗓 تاريخ وموعد الدرس المعني
👨‍🏫 اسم المعلم (إن وُجد)

سنتواصل معك خلال *24 ساعة* لحل المشكلة.

للاعتذار عن درس: يرجى الإشعار قبل *24 ساعة* من موعده.

نشكر ثقتك ونعمل دائماً على تحسين خدمتنا 💛`
  },
  {
    id: 11,
    tag: '/انضم_معلم',
    title: 'الانضمام كمعلم',
    cat: 'معلمون',
    text: `👨‍🏫 *هل تريد التدريس في منارة المعرفة؟*

نرحب بالمعلمين المتخصصين والمحترفين!

*المزايا:*
💰 نسبة عادلة من قيمة كل درس، تُحدَّد عند الاتفاق
⏰ أنت تحدد أوقات تدريسك
🌍 طلاب من كل أنحاء العالم
📊 لوحة تحكم متكاملة لمتابعة أرباحك

*المتطلبات:*
✅ مؤهل في تخصصك
✅ إنترنت مستقر
✅ حاسوب أو هاتف للتدريس

للتسجيل كمعلم:
manarat-almaarifa.com ← "انضم كمعلم"

أو راسلنا وسنكمل التسجيل معك مباشرة ✅`
  },
  {
    id: 12,
    tag: '/تواصل',
    title: 'معلومات التواصل',
    cat: 'عام',
    text: `📞 *تواصل مع منارة المعرفة:*

💬 *واتساب:* +212 681 883 238
📧 *بريد:* abdelghanichaydami@gmail.com
🌐 *الموقع:* manarat-almaarifa.com

⏰ *أوقات الرد:*
السبت — الخميس: 9 صباحاً — 10 مساءً
الجمعة: 2 ظهراً — 10 مساءً

للحجز المباشر: manarat-almaarifa.com
نرد على رسائل واتساب في أقرب وقت 🙏`
  },
];

let _adminLoginAttempts = {count:0, last:0};

function luhnCheck(n){
  let s=0,d=false;
  for(let i=n.length-1;i>=0;i--){
    let v=parseInt(n[i]);
    if(d&&(v*=2)>9)v-=9;
    s+=v;d=!d;
  }
  return s%10===0;
}

function submitCardPayment(){ toast('الدفع بالبطاقة غير متاح حتى يتم ربط مزود دفع حقيقي. لا تُدخل بيانات بطاقتك هنا.','i'); }

function renderLeaderboard(){
  const el = document.getElementById('leaderboard-list');
  if(!el) return;
  loadPlayer();
  const myXP = PLAYER.xp || 0;
  const lv = LEVELS.filter(l=>myXP>=l.min).pop() || LEVELS[0];
  
  el.innerHTML = `
    <div style="background:linear-gradient(135deg,rgba(212,175,106,.12),rgba(212,175,106,.04));border:1px solid rgba(212,175,106,.25);border-radius:14px;padding:1rem;text-align:center;margin-bottom:.6rem">
      <div style="font-size:1.8rem;margin-bottom:.3rem">${lv.ic}</div>
      <div style="font-size:.85rem;font-weight:700;color:var(--gl)">${lv.name}</div>
      <div style="font-size:1.1rem;font-weight:900;margin:.3rem 0">${myXP} XP</div>
      <div style="font-size:.65rem;color:var(--tm)">🔥 ${PLAYER.streak||0} يوم متواصل</div>
    </div>
    <div style="background:rgba(255,255,255,.03);border:1px solid var(--bdl);border-radius:12px;padding:.9rem;text-align:center">
      <div style="font-size:1.4rem;margin-bottom:.35rem">🏆</div>
      <div style="font-size:.73rem;font-weight:700;margin-bottom:.25rem">لوحة المتصدرين</div>
      <div style="font-size:.66rem;color:var(--tm);line-height:1.6">ستظهر هنا آراء الطلاب بعد دروسهم الأولى.</div>
    </div>`;
}






// ════════════════════════════════════════
//  إدارة الفصول
// ════════════════════════════════════════
function loadAdminClasses(){
  const b = document.getElementById('ac-body');
  if(!b) return;
  b.innerHTML = `
    <div style="font-size:.78rem;font-weight:700;margin-bottom:.85rem">🏫 إدارة الفصول التعليمية</div>
    <div style="margin-bottom:.85rem">
      <input id="new-hall-name" class="ainp" placeholder="اسم الفصل الجديد" style="width:100%;margin-bottom:.4rem">
      <select id="new-hall-cat" style="width:100%;background:rgba(255,255,255,.06);border:1px solid var(--bd);border-radius:8px;color:#fff;padding:.45rem;font-family:Cairo,sans-serif">
        <option value="q">🕌 القرآن</option>
        <option value="l">📖 العربية</option>
        <option value="s">⚖️ الشريعة</option>
        <option value="lg">🌍 اللغات</option>
        <option value="edu">🎓 الدراسة</option>
      </select>
      <button class="btn bgo" style="width:100%;margin-top:.4rem" onclick="adminAddClass()">+ إضافة فصل</button>
    </div>
    <div id="classes-list"></div>`;
  renderAdminClasses();
}
function adminAddClass(){
  const nm = document.getElementById('new-hall-name')?.value?.trim();
  const cat = document.getElementById('new-hall-cat')?.value;
  if(!nm){toast('أدخل اسم الفصل','e');return;}
  if(!HD[cat]) HD[cat] = {secs:[]};
  HD[cat].secs.push({id: Date.now(), nm, st:0, lv:'جميع المستويات', ic:'📚'});
  try{localStorage.setItem('mm_halls_v3', JSON.stringify(HD));}catch(e){}
  ldH(); renderH(cat);
  document.getElementById('new-hall-name').value='';
  toast('تم إضافة الفصل ✅','s');
  renderAdminClasses();
}
function renderAdminClasses(){
  const el = document.getElementById('classes-list');
  if(!el) return;
  const cats = {q:'🕌 القرآن',l:'📖 العربية',s:'⚖️ الشريعة',lg:'🌍 اللغات',edu:'🎓 الدراسة',sk:'💡 المهارات'};
  el.innerHTML = Object.entries(cats).map(([k,v])=>`
    <div style="margin-bottom:.65rem">
      <div style="font-size:.68rem;font-weight:700;color:var(--gl);margin-bottom:.3rem">${v}</div>
      ${(HD[k]?.secs||[]).map((s,i)=>`
        <div style="display:flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.04);border-radius:10px;padding:.5rem .7rem;margin-bottom:.3rem">
          <div style="flex:1;font-size:.72rem">${s.nm}</div>
          <div style="font-size:.62rem;color:var(--tm)">${s.st||0} طالب</div>
          <button class="btn bsm" style="background:rgba(192,57,43,.1);color:#e74c3c;border:1px solid rgba(192,57,43,.2);font-size:.6rem" onclick="adminDeleteClass('${k}',${i})">حذف</button>
        </div>`).join('')}
    </div>`).join('');
}
function adminDeleteClass(cat, idx){
  if(!confirm('حذف الفصل؟')) return;
  HD[cat]?.secs?.splice(idx,1);
  try{localStorage.setItem('mm_halls_v3', JSON.stringify(HD));}catch(e){}
  ldH(); renderH(cat);
  renderAdminClasses();
  toast('تم حذف الفصل','i');
}

// ════════════════════════════════════════
//  إدارة الكوبونات
// ════════════════════════════════════════
let ADMIN_COUPONS = [];
try{ADMIN_COUPONS = JSON.parse(localStorage.getItem('mm_coupons_v2')||'[]');}catch(e){}

function loadAdminCoupons(){
  const b = document.getElementById('ak-body');
  if(!b) return;
  b.innerHTML = `
    <div style="font-size:.78rem;font-weight:700;margin-bottom:.85rem">🎫 إدارة الكوبونات</div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:.4rem;margin-bottom:.85rem">
      <input id="cp-code" class="ainp" placeholder="كود الخصم (مثل: SAVE20)">
      <input id="cp-pct" class="ainp" type="number" placeholder="نسبة الخصم %" min="1" max="100">
      <input id="cp-uses" class="ainp" type="number" placeholder="عدد الاستخدامات" min="1">
      <select id="cp-type" style="background:rgba(255,255,255,.06);border:1px solid var(--bd);border-radius:8px;color:#fff;padding:.45rem;font-family:Cairo,sans-serif">
        <option value="percent">نسبة مئوية %</option>
        <option value="fixed">مبلغ ثابت $</option>
      </select>
    </div>
    <button class="btn bgo" style="width:100%;margin-bottom:1rem" onclick="adminAddCoupon()">+ إضافة كوبون</button>
    <div id="coupons-list"></div>`;
  renderCoupons();
}
function adminAddCoupon(){
  const code = document.getElementById('cp-code')?.value?.trim().toUpperCase();
  const pct = parseInt(document.getElementById('cp-pct')?.value||0);
  const uses = parseInt(document.getElementById('cp-uses')?.value||10);
  const type = document.getElementById('cp-type')?.value;
  if(!code||!pct){toast('أدخل الكود والخصم','e');return;}
  if(ADMIN_COUPONS.find(c=>c.code===code)){toast('الكود موجود مسبقاً','e');return;}
  ADMIN_COUPONS.push({code,pct,type,uses,used:0,active:true,created:Date.now()});
  try{localStorage.setItem('mm_coupons_v2',JSON.stringify(ADMIN_COUPONS));}catch(e){}
  toast(`تم إضافة كوبون ${code} ✅`,'s');
  document.getElementById('cp-code').value='';
  renderCoupons();
}
function adminDeleteCoupon(code){
  ADMIN_COUPONS = ADMIN_COUPONS.filter(c=>c.code!==code);
  try{localStorage.setItem('mm_coupons_v2',JSON.stringify(ADMIN_COUPONS));}catch(e){}
  toast('تم حذف الكوبون','i');
  renderCoupons();
}
function renderCoupons(){
  const el = document.getElementById('coupons-list');
  if(!el) return;
  if(!ADMIN_COUPONS.length){el.innerHTML='<div style="text-align:center;color:var(--tm);padding:1rem">لا توجد كوبونات بعد</div>';return;}
  el.innerHTML = ADMIN_COUPONS.map(c=>`
    <div style="display:flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:10px;padding:.6rem .8rem;margin-bottom:.35rem">
      <div style="flex:1">
        <div style="font-size:.78rem;font-weight:700;color:var(--gl)">${c.code}</div>
        <div style="font-size:.62rem;color:var(--tm)">${c.pct}${c.type==='percent'?'%':'$'} خصم • ${c.used||0}/${c.uses} استخدام</div>
      </div>
      <span style="font-size:.62rem;background:${c.active?'rgba(39,174,96,.12)':'rgba(192,57,43,.1)'};color:${c.active?'var(--grl)':'#e74c3c'};padding:.2rem .5rem;border-radius:100px">${c.active?'فعال':'معطّل'}</span>
      <button class="btn bsm" style="background:rgba(192,57,43,.1);color:#e74c3c;border:1px solid rgba(192,57,43,.2);font-size:.6rem" onclick="adminDeleteCoupon('${c.code}')">حذف</button>
    </div>`).join('');
}
function applyCoupon(code){
  const c = ADMIN_COUPONS.find(x=>x.code===code?.toUpperCase()&&x.active&&(x.used||0)<x.uses);
  return c || null;
}

// ════════════════════════════════════════
//  إدارة المكتبة
// ════════════════════════════════════════
function loadAdminLibrary(){
  const b = document.getElementById('alib-body');
  if(!b) return;
  b.innerHTML = `
    <div style="font-size:.78rem;font-weight:700;margin-bottom:.85rem">📚 إدارة المكتبة</div>
    <div style="margin-bottom:.85rem">
      <input id="bk-title" class="ainp" placeholder="عنوان الكتاب" style="width:100%;margin-bottom:.4rem">
      <input id="bk-url" class="ainp" placeholder="رابط الكتاب (archive.org أو hindawi.org)" style="width:100%;margin-bottom:.4rem">
      <input id="bk-author" class="ainp" placeholder="المؤلف" style="width:100%;margin-bottom:.4rem">
      <select id="bk-cat" style="width:100%;background:rgba(255,255,255,.06);border:1px solid var(--bd);border-radius:8px;color:#fff;padding:.45rem;font-family:Cairo,sans-serif;margin-bottom:.4rem">
        <option value="quran">🕌 القرآن والتجويد</option>
        <option value="arabic">📖 اللغة العربية</option>
        <option value="islamic">⚖️ العلوم الشرعية</option>
        <option value="lang">🌍 اللغات</option>
        <option value="edu">🎓 الدراسة</option>
      </select>
      <button class="btn bgo" style="width:100%" onclick="adminAddBook()">+ إضافة كتاب</button>
    </div>
    <div style="font-size:.68rem;color:var(--tm);margin-bottom:.5rem">الكتب الحالية: ${document.querySelectorAll('.lib-card').length}</div>
    <div style="font-size:.68rem;color:var(--grl)">✅ الكتب تُضاف مباشرة للمكتبة</div>`;
}
async function adminAddBook(){
  const title = document.getElementById('bk-title')?.value?.trim();
  const url = document.getElementById('bk-url')?.value?.trim();
  const author = document.getElementById('bk-author')?.value?.trim()||'مكتبة مجانية';
  const cat = document.getElementById('bk-cat')?.value;
  if(!title||!url){toast('أدخل العنوان والرابط','e');return;}
  let nurl=url;
  try{ nurl=(typeof window.normBookUrl==='function')?window.normBookUrl(url):url; }catch(e){ toast(e.message||'رابط غير صالح','e'); return; }
  if(!_sb||!CU?.id){toast('سجّل دخولك كمدير أولاً','e');return;}
  const catMap={quran:'q',arabic:'l',islamic:'s',lang:'lang',edu:'edu'};
  toast('جاري حفظ الكتاب...','i');
  try{
    const {error}=await _sb.from('library_books').insert({title,author,url:nurl,category:catMap[cat]||'edu',icon:'📗',pages:0,is_free:true,active:true,created_by:CU.id,updated_at:new Date().toISOString()});
    if(error) throw error;
    document.getElementById('bk-title').value='';
    document.getElementById('bk-url').value='';
    toast(`تم حفظ "${title}" في المكتبة ✅`,'s');
    if(typeof window.loadPublicLibraryV8==='function') window.loadPublicLibraryV8();
  }catch(e){ toast('لم يُحفظ الكتاب: '+(e.message||e),'e'); }
}

// ════════════════════════════════════════
//  إشعارات عامة
// ════════════════════════════════════════
function loadAdminNotif(){
  const b = document.getElementById('an-body');
  if(!b) return;
  b.innerHTML = `
    <div style="font-size:.78rem;font-weight:700;margin-bottom:.45rem">🔔 الإشعارات</div><div style="font-size:.62rem;color:var(--tm);background:rgba(212,175,106,.07);border:1px solid rgba(212,175,106,.12);border-radius:9px;padding:.5rem .6rem;margin-bottom:.75rem">ℹ️ السجل الحالي محلي في المتصفح؛ لا يرسل Push حقيقيًا للمستخدمين بعد.</div>
    <textarea id="notif-msg" placeholder="نص الإشعار للجميع..." rows="4" style="width:100%;background:rgba(255,255,255,.06);border:1px solid var(--bd);border-radius:10px;color:#fff;padding:.65rem;font-family:Cairo,sans-serif;font-size:.75rem;resize:vertical;outline:none;margin-bottom:.5rem"></textarea>
    <select id="notif-type" style="width:100%;background:rgba(255,255,255,.06);border:1px solid var(--bd);border-radius:8px;color:#fff;padding:.45rem;font-family:Cairo,sans-serif;margin-bottom:.5rem">
      <option value="info">ℹ️ معلومة عامة</option>
      <option value="promo">🎁 عرض وخصم</option>
      <option value="alert">⚠️ تنبيه مهم</option>
      <option value="new">🆕 جديد في المنصة</option>
    </select>
    <button class="btn bgo" style="width:100%;margin-bottom:1rem" onclick="adminSendNotif()">📤 حفظ الإشعار</button>
    <div style="font-size:.72rem;font-weight:700;margin-bottom:.5rem">الإشعارات السابقة</div>
    <div id="notif-history"></div>`;
  renderNotifHistory();
}
async function adminSendNotif(){
  const msg = document.getElementById('notif-msg')?.value?.trim();
  const type = document.getElementById('notif-type')?.value||'info';
  if(!msg){toast('اكتب نص الإشعار','e');return;}
  if(!_sb||!CU||!CU.id){toast('سجّل الدخول أولًا','e');return;}
  const icons = {info:'ℹ️',promo:'🎁',alert:'⚠️',new:'🆕'};
  const {error}=await _sb.from('admin_notifications').insert({title:'إشعار من منارة المعرفة',message:msg,type,audience:'all',active:true,created_by:CU.id});
  if(error){toast('فشل الإرسال: '+error.message,'e');return;}
  try{
    const history = JSON.parse(localStorage.getItem('mm_notif_history')||'[]');
    history.unshift({msg,type,time:new Date().toLocaleString('ar'),icon:icons[type]});
    localStorage.setItem('mm_notif_history', JSON.stringify(history.slice(0,50)));
  }catch(e){}
  toast('تم إرسال الإشعار لجميع المستخدمين ✅','s');
  document.getElementById('notif-msg').value='';
  renderNotifHistory();
}
function renderNotifHistory(){
  const el = document.getElementById('notif-history');
  if(!el) return;
  try{
    const history = JSON.parse(localStorage.getItem('mm_notif_history')||'[]');
    if(!history.length){el.innerHTML='<div style="color:var(--tm);font-size:.68rem">لا توجد إشعارات سابقة</div>';return;}
    el.innerHTML = history.slice(0,10).map(n=>`
      <div style="background:rgba(255,255,255,.03);border-radius:8px;padding:.5rem .7rem;margin-bottom:.3rem">
        <div style="font-size:.72rem">${n.icon} ${n.msg}</div>
        <div style="font-size:.6rem;color:var(--tm)">${n.time}</div>
      </div>`).join('');
  }catch(e){}
}

// ════════════════════════════════════════
//  إدارة الحصص الجماعية
// ════════════════════════════════════════
function loadAdminGroupClasses(){
  const b = document.getElementById('agc-body');
  if(!b) return;
  b.innerHTML = `
    <div style="font-size:.78rem;font-weight:700;margin-bottom:.85rem">👥 إدارة الحصص الجماعية</div>
    ${GROUP_CLASSES.map(g=>`
      <div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.75rem;margin-bottom:.5rem">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.3rem">
          <div style="font-size:.75rem;font-weight:700">${g.title}</div>
          <span style="font-size:.7rem;font-weight:700;color:var(--gl)">$${g.price}</span>
        </div>
        <div style="font-size:.63rem;color:var(--tm);margin-bottom:.45rem">👨‍🏫 ${g.teacher} • ${g.day} ${g.time} • ${g.cur}/${g.max} طالب</div>
        <div style="background:rgba(255,255,255,.06);border-radius:100px;height:5px;overflow:hidden;margin-bottom:.5rem">
          <div style="background:var(--go);height:100%;width:${Math.round(g.cur/g.max*100)}%;border-radius:100px"></div>
        </div>
        <div style="display:flex;gap:.4rem">
          <button class="btn bsm bgo" style="font-size:.62rem;flex:1" onclick="adminEditGC(${g.id})">تعديل</button>
          <button class="btn bsm" style="background:rgba(192,57,43,.1);color:#e74c3c;border:1px solid rgba(192,57,43,.2);font-size:.62rem;flex:1" onclick="adminDeleteGC(${g.id})">حذف</button>
        </div>
      </div>`).join('')}
    <button class="btn bgo" style="width:100%;margin-top:.5rem" onclick="adminAddGC()">+ إضافة حصة جماعية</button>`;
}
function adminDeleteGC(id){
  if(!confirm('حذف الحصة الجماعية؟')) return;
  const idx = GROUP_CLASSES.findIndex(g=>g.id===id);
  if(idx>-1){GROUP_CLASSES.splice(idx,1); renderGroupClasses(); loadAdminGroupClasses(); toast('تم الحذف','i');}
}
function adminEditGC(id){
  const g = GROUP_CLASSES.find(x=>x.id===id);
  if(!g) return;
  const price = prompt('السعر الجديد ($):', g.price);
  if(price&&!isNaN(price)){g.price=+price; renderGroupClasses(); loadAdminGroupClasses(); toast('تم التحديث ✅','s');}
}
function adminAddGC(){
  const title = prompt('عنوان الحصة:');
  if(!title) return;
  const teacher = prompt('اسم المعلم:');
  const day = prompt('اليوم (مثل: السبت):');
  const time = prompt('الوقت (مثل: 10:00):');
  const price = prompt('السعر ($):', '6');
  GROUP_CLASSES.push({
    id: Date.now(), title, teacher: teacher||'—', day: day||'—',
    time: time||'—', dur:60, max:8, cur:0, price:+price||6, meet:'zoom',
    level:'جميع المستويات', subj:'q'
  });
  try{localStorage.setItem('mm_group_classes',JSON.stringify(GROUP_CLASSES));}catch(e){}
  renderGroupClasses(); loadAdminGroupClasses();
  toast('تم إضافة الحصة ✅','s');
}

// ════════════════════════════════════════
//  التقارير الشاملة
// ════════════════════════════════════════
async function loadAdminReports(){
  const b = document.getElementById('arr-body');
  if(!b) return;
  b.innerHTML = '<div style="text-align:center;color:var(--tm);padding:2rem">⏳ جاري تحميل التقارير...</div>';
  
  try{
    const [{data:bookings},{data:users}] = await Promise.all([
      _sb.from('bookings').select('package_price,teacher_share,platform_share,status,created_at,hall'),
      _sb.from('profiles').select('role,created_at')
    ]);
    
    const paidBookings=(bookings||[]).filter(r=>r.status==='confirmed'||r.status==='completed');
    const totalRev=paidBookings.reduce((s,r)=>s+(+r.package_price||0),0);
    const confirmed = (bookings||[]).filter(r=>r.status==='confirmed').length;
    const students = (users||[]).filter(u=>u.role==='student').length;
    const teachers = (users||[]).filter(u=>u.role==='teacher').length;
    
    // أكثر الفصول حجزاً
    const hallCount = {};
    (bookings||[]).forEach(b=>{if(b.hall)hallCount[b.hall]=(hallCount[b.hall]||0)+1;});
    const topHall = Object.entries(hallCount).sort((a,b)=>b[1]-a[1])[0];
    
    b.innerHTML = `
      <div style="font-size:.78rem;font-weight:700;margin-bottom:.85rem">📊 تقارير المنصة</div>
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:.5rem;margin-bottom:1rem">
        <div style="background:rgba(212,175,106,.08);border:1px solid rgba(212,175,106,.15);border-radius:12px;padding:.75rem;text-align:center">
          <div style="font-size:1.4rem;font-weight:900;color:var(--gl)">$${totalRev.toFixed(0)}</div>
          <div style="font-size:.6rem;color:var(--tm)">إجمالي الإيرادات</div>
        </div>
        <div style="background:rgba(39,174,96,.08);border:1px solid rgba(39,174,96,.15);border-radius:12px;padding:.75rem;text-align:center">
          <div style="font-size:1.4rem;font-weight:900;color:var(--grl)">${confirmed}</div>
          <div style="font-size:.6rem;color:var(--tm)">حجوزات مؤكدة</div>
        </div>
        <div style="background:rgba(52,152,219,.08);border:1px solid rgba(52,152,219,.15);border-radius:12px;padding:.75rem;text-align:center">
          <div style="font-size:1.4rem;font-weight:900;color:#5dade2">${students}</div>
          <div style="font-size:.6rem;color:var(--tm)">طلاب مسجّلون</div>
        </div>
        <div style="background:rgba(142,68,173,.08);border:1px solid rgba(142,68,173,.15);border-radius:12px;padding:.75rem;text-align:center">
          <div style="font-size:1.4rem;font-weight:900;color:#c39bd3">${teachers}</div>
          <div style="font-size:.6rem;color:var(--tm)">معلمون نشطون</div>
        </div>
      </div>
      ${topHall?`<div style="background:rgba(255,255,255,.04);border-radius:12px;padding:.75rem;font-size:.72rem">
        🏆 أكثر الفصول طلباً: <strong style="color:var(--gl)">${topHall[0]}</strong> (${topHall[1]} حجز)
      </div>`:''}
      <button class="btn bgh" style="width:100%;margin-top:.85rem" onclick="exportReport()">📥 تصدير التقرير</button>`;
  }catch(e){
    b.innerHTML=`<div style="color:#e74c3c;text-align:center;padding:1rem">تعذّر تحميل التقارير: ${e.message||e}</div>`;
  }
}
function exportReport(){
  const data = 'data:text/csv;charset=utf-8,التاريخ,الإيرادات,الحجوزات,الطلاب\n'+new Date().toLocaleDateString('ar');
  const a = document.createElement('a');
  a.href=encodeURI(data); a.download='manarat-report.csv'; a.click();
  toast('تم تصدير التقرير 📥','s');
}

// ════════════════════════════════════════
//  ردود واتساب في الإدارة
// ════════════════════════════════════════
function loadAdminWA(){
  const b = document.getElementById('awa-body');
  if(!b) return;
  b.innerHTML = `
    <div style="font-size:.78rem;font-weight:700;margin-bottom:.65rem">💬 ردود واتساب السريعة</div>
    <div style="font-size:.68rem;color:var(--tm);background:rgba(37,211,102,.06);border:1px solid rgba(37,211,102,.15);border-radius:10px;padding:.55rem .7rem;margin-bottom:.75rem">
      💡 انسخ هذه الردود وضعها في واتساب Business → ردود سريعة
    </div>
    ${WA_REPLIES.map(r=>`
      <div style="background:rgba(255,255,255,.03);border:1px solid var(--bdl);border-radius:12px;padding:.65rem .8rem;margin-bottom:.4rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.3rem">
          <div>
            <span style="font-size:.72rem;font-weight:700">${r.title}</span>
            <span style="font-size:.6rem;color:var(--tm);margin-right:.35rem;background:rgba(255,255,255,.06);padding:.04rem .3rem;border-radius:4px;font-family:monospace">${r.tag}</span>
          </div>
          <div style="display:flex;gap:.3rem">
            <button class="btn bsm" style="font-size:.58rem;background:rgba(37,211,102,.1);color:#25d366;border:1px solid rgba(37,211,102,.2)" onclick="copyWAReply(${r.id})">📋 نسخ</button>
            <button class="btn bsm" style="font-size:.58rem;background:rgba(37,211,102,.15);color:#25d366;border:1px solid rgba(37,211,102,.3)" onclick="sendWADirect(${r.id})">📤 إرسال</button>
          </div>
        </div>
        <div style="font-size:.63rem;color:var(--tm);line-height:1.5">${r.text.substring(0,100)}...</div>
      </div>`).join('')}`;
}
function copyWAReply(id){
  const r = WA_REPLIES.find(x=>x.id===id);
  if(!r) return;
  navigator.clipboard?.writeText(r.text)
    .then(()=>toast('تم النسخ ✅','s'))
    .catch(()=>{
      const ta=document.createElement('textarea');ta.value=r.text;document.body.appendChild(ta);ta.select();document.execCommand('copy');document.body.removeChild(ta);
      toast('تم النسخ ✅','s');
    });
}
function sendWADirect(id){
  const r = WA_REPLIES.find(x=>x.id===id);
  if(!r) return;
  window.open('https://wa.me/?text='+encodeURIComponent(r.text),'_blank');
}

// استدعاء التبويبات عند الضغط

function swAdm(btn, id){
  document.querySelectorAll('.admt').forEach(b=>b.classList.remove('on'));
  document.querySelectorAll('.admp').forEach(p=>p.classList.remove('on'));
  if(btn) btn.classList.add('on');
  const panel = document.getElementById(id);
  if(panel) panel.classList.add('on');

  const loaders = {
    ac: typeof loadAdminClasses==='function' ? loadAdminClasses : null,
    ak: typeof loadAdminCoupons==='function' ? loadAdminCoupons : null,
    alib: typeof loadAdminLibrary==='function' ? loadAdminLibrary : null,
    awa: typeof loadAdminWA==='function' ? loadAdminWA : null,
    an: typeof loadAdminNotif==='function' ? loadAdminNotif : null,
    agc: typeof loadAdminGroupClasses==='function' ? loadAdminGroupClasses : null,
    arr: typeof loadAdminReports==='function' ? loadAdminReports : null,
    amt: typeof loadAdminMeetings==='function' ? loadAdminMeetings : null,
    asite: typeof loadAdminSiteSettings==='function' ? loadAdminSiteSettings : null,
        ao: typeof loadAdminOverview==='function' ? loadAdminOverview : null,
    au: typeof loadAdminUsers==='function' ? loadAdminUsers : null,
    af: typeof loadAdminFinance==='function' ? loadAdminFinance : null,
    ab: typeof loadAdminBookings==='function' ? loadAdminBookings : null,
    ast: typeof loadAdminSettings==='function' ? loadAdminSettings : null,
    atc: typeof loadAdminTeacherCenter==='function' ? loadAdminTeacherCenter : null,
    alg: typeof loadAdminLog==='function' ? loadAdminLog : null,
  };
  const fn = loaders[id];
  if(fn) setTimeout(()=>{ try{ fn(); }catch(e){ console.log('loader error',e); } }, 50);
}


// ════════════════════════════════════════
//  Supabase Storage — رفع الملفات
// ════════════════════════════════════════

const STORAGE_BUCKET = 'manarat-media';

// رفع صورة المعلم
async function uploadTeacherPhoto(file, teacherId){
  if(!_sb) return null;
  if(!file) return null;
  
  // فحص النوع والحجم
  const allowed = ['image/jpeg','image/png','image/webp'];
  if(!allowed.includes(file.type)){
    toast('يُقبل فقط JPG أو PNG أو WebP','e');
    return null;
  }
  if(file.size > 5 * 1024 * 1024){
    toast('الحد الأقصى للصورة 5MB','e');
    return null;
  }
  
  const ext = file.name.split('.').pop();
  const path = `teachers/${teacherId}/photo.${ext}`;
  
  try{
    toast('جاري رفع الصورة...','i');
    const {data, error} = await _sb.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {upsert: true, contentType: file.type});
    
    if(error) throw error;
    
    const {data: urlData} = _sb.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);
    
    toast('تم رفع الصورة ✅','s');
    return urlData.publicUrl;
  }catch(e){
    toast('فشل رفع الصورة: '+(e.message||e),'e');
    return null;
  }
}

// رفع فيديو تعريفي للمعلم
async function uploadTeacherVideo(file, teacherId){
  if(!_sb) return null;
  if(!file) return null;
  
  const allowed = ['video/mp4','video/webm','video/quicktime'];
  if(!allowed.includes(file.type)){
    toast('يُقبل فقط MP4 أو WebM','e');
    return null;
  }
  if(file.size > 50 * 1024 * 1024){
    toast('الحد الأقصى للفيديو 50MB','e');
    return null;
  }
  
  const ext = file.name.split('.').pop();
  const path = `teachers/${teacherId}/intro.${ext}`;
  
  try{
    toast('جاري رفع الفيديو... قد يستغرق دقيقة','i');
    
    // شريط تقدم
    const progressEl = document.getElementById('upload-progress');
    if(progressEl) progressEl.style.display = 'block';
    
    const {data, error} = await _sb.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {
        upsert: true,
        contentType: file.type,
      });
    
    if(error) throw error;
    
    if(progressEl) progressEl.style.display = 'none';
    
    const {data: urlData} = _sb.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);
    
    toast('تم رفع الفيديو ✅','s');
    return urlData.publicUrl;
  }catch(e){
    toast('فشل رفع الفيديو: '+(e.message||e),'e');
    return null;
  }
}

// رفع ملف PDF (شهادات، مؤهلات)
async function uploadTeacherDocument(file, teacherId, docType){
  if(!_sb) return null;
  if(!file) return null;
  
  if(file.type !== 'application/pdf'){
    toast('يُقبل فقط PDF','e');
    return null;
  }
  if(file.size > 10 * 1024 * 1024){
    toast('الحد الأقصى للملف 10MB','e');
    return null;
  }
  
  const path = `teachers/${teacherId}/${docType}.pdf`;
  
  try{
    toast('جاري رفع الملف...','i');
    const {data, error} = await _sb.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, {upsert: true, contentType: 'application/pdf'});
    
    if(error) throw error;
    
    const {data: urlData} = _sb.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);
    
    toast('تم رفع الملف ✅','s');
    return urlData.publicUrl;
  }catch(e){
    toast('فشل رفع الملف: '+(e.message||e),'e');
    return null;
  }
}

// حذف ملف
async function deleteStorageFile(path){
  if(!_sb) return;
  try{
    await _sb.storage.from(STORAGE_BUCKET).remove([path]);
    toast('تم الحذف','i');
  }catch(e){
    toast('فشل الحذف: '+(e.message||e),'e');
  }
}

// واجهة رفع الصورة في ملف المعلم
function renderPhotoUpload(containerId, teacherId){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = `
    <div style="text-align:center">
      <div id="photo-preview-${teacherId}" style="width:80px;height:80px;border-radius:50%;background:rgba(212,175,106,.15);border:2px dashed rgba(212,175,106,.3);display:flex;align-items:center;justify-content:center;margin:0 auto .65rem;overflow:hidden;cursor:pointer" onclick="document.getElementById('photo-input-${teacherId}').click()">
        <span style="font-size:1.8rem">📷</span>
      </div>
      <input type="file" id="photo-input-${teacherId}" accept="image/jpeg,image/png,image/webp" style="display:none"
        onchange="handlePhotoUpload(this,'${teacherId}')">
      <button class="btn bgh bsm" style="font-size:.65rem" onclick="document.getElementById('photo-input-${teacherId}').click()">
        📷 رفع صورة شخصية
      </button>
      <div style="font-size:.58rem;color:var(--tm);margin-top:.25rem">JPG أو PNG • حد أقصى 5MB</div>
    </div>`;
}

async function handlePhotoUpload(input, teacherId){
  const file = input.files[0];
  if(!file) return;
  
  const url = await uploadTeacherPhoto(file, teacherId);
  if(!url) return;
  
  // تحديث المعاينة
  const preview = document.getElementById('photo-preview-'+teacherId);
  if(preview){
    preview.innerHTML = `<img src="${url}" style="width:100%;height:100%;object-fit:cover">`;
  }
  
  // حفظ في Supabase
  if(_sb && teacherId !== 'demo'){
    await _sb.from('profiles').update({avatar_url: url}).eq('id', teacherId);
  }
}

// واجهة رفع الفيديو
function renderVideoUpload(containerId, teacherId){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = `
    <div style="background:rgba(255,255,255,.04);border:1px dashed rgba(255,255,255,.15);border-radius:12px;padding:1rem;text-align:center">
      <div style="font-size:1.5rem;margin-bottom:.4rem">🎬</div>
      <div style="font-size:.72rem;font-weight:600;margin-bottom:.3rem">فيديو تعريفي</div>
      <div style="font-size:.62rem;color:var(--tm);margin-bottom:.65rem">أو أضف رابط يوتيوب</div>
      
      <input id="yt-link-${teacherId}" class="ainp" placeholder="https://youtube.com/watch?v=..." style="width:100%;margin-bottom:.4rem">
      <button class="btn bgo bsm" style="width:100%;font-size:.65rem;margin-bottom:.4rem" onclick="saveYTLink('${teacherId}')">💾 حفظ رابط يوتيوب</button>
      
      <div style="font-size:.6rem;color:var(--tm);margin:.4rem 0">— أو —</div>
      
      <input type="file" id="video-input-${teacherId}" accept="video/mp4,video/webm" style="display:none"
        onchange="handleVideoUpload(this,'${teacherId}')">
      <button class="btn bgh bsm" style="width:100%;font-size:.65rem" onclick="document.getElementById('video-input-${teacherId}').click()">
        📁 رفع فيديو (MP4 • حد 50MB)
      </button>
      
      <div id="upload-progress" style="display:none;margin-top:.5rem">
        <div style="background:rgba(255,255,255,.1);border-radius:100px;height:6px;overflow:hidden">
          <div style="background:var(--go);height:100%;width:0%;border-radius:100px;animation:progressAnim 2s ease infinite" id="progress-bar"></div>
        </div>
        <div style="font-size:.62rem;color:var(--tm);margin-top:.3rem">جاري الرفع...</div>
      </div>
      
      <div id="video-preview-${teacherId}" style="margin-top:.5rem"></div>
    </div>`;
}

async function handleVideoUpload(input, teacherId){
  const file = input.files[0];
  if(!file) return;
  
  const url = await uploadTeacherVideo(file, teacherId);
  if(!url) return;
  
  // عرض الفيديو
  const preview = document.getElementById('video-preview-'+teacherId);
  if(preview){
    preview.innerHTML = `<video src="${url}" controls style="width:100%;border-radius:10px;margin-top:.5rem"></video>`;
  }
  
  // حفظ في Supabase
  if(_sb && teacherId !== 'demo'){
    await _sb.from('teacher_profiles').upsert({user_id: teacherId, intro_video: url},{onConflict:'user_id'});
  }
}

function saveYTLink(teacherId){
  const link = document.getElementById('yt-link-'+teacherId)?.value?.trim();
  if(!link){toast('أدخل رابط يوتيوب','e');return;}
  
  // تحويل الرابط لـ embed
  let videoId = '';
  const ytMatch = link.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  if(ytMatch) videoId = ytMatch[1];
  
  if(!videoId){toast('رابط يوتيوب غير صحيح','e');return;}
  
  const embedUrl = 'https://www.youtube.com/embed/'+videoId;
  const preview = document.getElementById('video-preview-'+teacherId);
  if(preview){
    preview.innerHTML = `<iframe src="${embedUrl}" style="width:100%;height:180px;border-radius:10px;border:none;margin-top:.5rem" allowfullscreen></iframe>`;
  }
  
  // حفظ في Supabase
  if(_sb && teacherId !== 'demo'){
    _sb.from('teacher_profiles').upsert({user_id: teacherId, intro_video: embedUrl},{onConflict:'user_id'});
  }
  toast('تم حفظ الفيديو ✅','s');
}

// واجهة رفع الشهادات والمؤهلات
function renderDocumentUpload(containerId, teacherId){
  const el = document.getElementById(containerId);
  if(!el) return;
  el.innerHTML = `
    <div style="font-size:.72rem;font-weight:700;margin-bottom:.5rem">📄 المؤهلات والشهادات</div>
    <div style="display:flex;flex-direction:column;gap:.4rem">
      ${['شهادة التعليم','إجازة التجويد','شهادة اللغة','شهادة أخرى'].map((doc,i)=>`
        <div style="display:flex;align-items:center;gap:.5rem;background:rgba(255,255,255,.04);border-radius:10px;padding:.5rem .7rem">
          <div style="flex:1;font-size:.7rem">${doc}</div>
          <input type="file" id="doc-${i}-${teacherId}" accept="application/pdf" style="display:none"
            onchange="handleDocUpload(this,'${teacherId}','doc_${i}')">
          <button class="btn bsm bgh" style="font-size:.6rem" onclick="document.getElementById('doc-${i}-${teacherId}').click()">📎 رفع</button>
          <span id="doc-status-${i}-${teacherId}" style="font-size:.6rem;color:var(--tm)"></span>
        </div>`).join('')}
    </div>`;
}

async function handleDocUpload(input, teacherId, docType){
  const file = input.files[0];
  if(!file) return;
  
  const url = await uploadTeacherDocument(file, teacherId, docType);
  if(!url) return;
  
  const statusId = 'doc-status-' + docType.replace('doc_','') + '-' + teacherId;
  const statusEl = document.getElementById(statusId.replace('doc_',''));
  if(statusEl) statusEl.textContent = '✅ تم';
  
  if(_sb && teacherId !== 'demo'){
    const update = {};
    update[docType+'_url'] = url;
    await _sb.from('teacher_profiles').upsert({user_id: teacherId, ...update},{onConflict:'user_id'});
  }
}


function previewJoinPhoto(input){
  const file = input.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const preview = document.getElementById('join-photo-preview');
    if(preview) preview.innerHTML = '<img src="'+e.target.result+'" style="width:100%;height:100%;object-fit:cover">';
  };
  reader.readAsDataURL(file);
}

function previewJoinVideo(input){
  const file = input.files[0];
  if(!file) return;
  if(file.size > 50*1024*1024){toast('الفيديو أكبر من 50MB','e');return;}
  const url = URL.createObjectURL(file);
  const preview = document.getElementById('join-video-preview');
  if(preview) preview.innerHTML = '<video src="'+url+'" controls style="width:100%;border-radius:10px;max-height:150px"></video>';
}

function previewJoinCert(input){
  const file = input.files[0];
  if(!file) return;
  const preview = document.getElementById('join-cert-preview');
  if(preview) preview.textContent = '✅ ' + file.name + ' (' + (file.size/1024).toFixed(0) + 'KB)';
}


function filterLib(cat, btn){
  // تحديث الأزرار
  document.querySelectorAll('#lib-tabs button').forEach(b=>{
    b.className = b===btn ? 'btn bgo bsm' : 'btn bgh bsm';
    b.style.whiteSpace = 'nowrap';
    b.style.fontSize = '.65rem';
  });
  
  // إظهار/إخفاء الأقسام
  const secMap = {
    all: ['quran','arabic','islamic','lang','edu'],
    quran: ['quran'],
    arabic: ['arabic'],
    islamic: ['islamic'],
    lang: ['lang'],
    edu: ['edu'],
  };
  const show = secMap[cat] || ['quran','arabic','islamic','lang','edu'];
  
  ['quran','arabic','islamic','lang','edu'].forEach(s=>{
    const el = document.getElementById('lib-sec-'+s);
    if(el) el.style.display = show.includes(s) ? 'block' : 'none';
  });
}

// ══ AI ملخص الكتاب ══
async function aiBookSummary(title, cat){
  const el = document.getElementById('ai-book-summary');
  if(!el) return;
  el.innerHTML = '<div style="text-align:center;color:var(--tm);font-size:.68rem;padding:.5rem">🤖 جاري تحضير الملخص...</div>';
  el.style.display = 'block';
  
  try{
    const res = await secureAIFetch('',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'claude-sonnet-4-6',
        max_tokens:300,
        system:'مساعد تعليمي. قدّم ملخصاً مختصراً للكتاب في 3 نقاط بالعربية. كل نقطة في سطر.',
        messages:[{role:'user',content:'لخّص كتاب "'+title+'" في مجال '+cat+' في 3 نقاط قصيرة ومفيدة.'}]
      })
    });
    const d = await res.json();
    const text = d.content?.[0]?.text || 'لا يمكن تحميل الملخص';
    el.innerHTML = '<div style="font-size:.68rem;line-height:1.7;color:var(--tm)">🤖 <strong style="color:var(--gl)">ملخص AI:</strong><br>'+escapeHtml(text).replace(/\n/g,'<br>')+'</div>';
  }catch(e){
    el.style.display='none';
  }
}


// AI في البحث
let _searchTimer = null;
function aiSmartSearch(query){
  if(!query || query.length < 2) return;
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(async()=>{
    const subjects = {
      'تجويد': 'q', 'قرآن': 'q', 'حفظ': 'q',
      'نحو': 'l', 'عربية': 'l', 'صرف': 'l',
      'فقه': 's', 'حديث': 's', 'عقيدة': 's',
      'إنجليزية': 'lg', 'فرنسية': 'lg', 'لغة': 'lg',
      'تفسير': 's', 'سيرة': 's', 'إجازة': 'q', 'تلاوة': 'q',
      'محادثة': 'l', 'كتابة': 'l', 'قراءة': 'l',
    };
    for(const [kw, hall] of Object.entries(subjects)){
      if(query.includes(kw)){
        const tags = document.getElementById('srch-tags');
        if(tags){
          const btn = tags.querySelector(`[onclick*="'${hall}'"]`);
          if(btn) btn.style.boxShadow='0 0 0 2px var(--go)';
        }
        break;
      }
    }
  }, 400);
}

async function loadAIInsight(){
  const el = document.getElementById('ai-insight-text');
  if(!el) return;
  loadPlayer();
  try{
    const res = await secureAIFetch('',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-6',
        max_tokens:220,
        system:'مستشار تعليمي. أعطِ نصيحة مشجعة في جملتين قصيرتين على الأكثر، نصًّا عاديًا بلا عناوين ولا تنسيق Markdown ولا نجوم. بالعربية.',
        messages:[{role:'user',content:`طالب لديه ${PLAYER.xp||0} XP و${PLAYER.streak||0} يوم متواصل. قيّمه وأعطه نصيحة.`}]
      })
    });
    const d = await res.json();
    if(el) el.textContent = String(d.content?.[0]?.text || 'استمر في التعلم يومياً! 🌟').replace(/[#*_`>]+/g,'').replace(/\s+/g,' ').trim();
  }catch(e){
    if(el) el.textContent = 'استمر في رحلتك التعليمية — كل يوم خطوة للأمام 🌟';
  }
}

async function aiSuggestTeacher(subject, level){
  try{
    const res = await secureAIFetch('',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:200,
        system:'مساعد تعليمي. أجب بجملتين بالعربية.',
        messages:[{role:'user',content:'نصيحة لطالب يريد تعلم "'+subject+'" في مستوى "'+level+'".'}]
      })
    });
    const d = await res.json();
    return d.content?.[0]?.text||'';
  }catch(e){return '';}
}

async function aiExplainAnswer(question, correctAnswer){
  try{
    const res = await secureAIFetch('',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:200,
        system:'مدرس. اشرح الإجابة الصحيحة في جملتين بالعربية.',
        messages:[{role:'user',content:'السؤال: '+question+' الإجابة: '+correctAnswer}]
      })
    });
    const d = await res.json();
    return d.content?.[0]?.text||'';
  }catch(e){return '';}
}

function changePassword(){
  if(!_sb||!CU){toast('سجّل الدخول أولاً','e');return;}
  const email = CU.email;
  _sb.auth.resetPasswordForEmail(email)
    .then(()=>toast('تم إرسال رابط إعادة تعيين كلمة المرور لـ '+email+' ✅','s'))
    .catch(e=>toast('خطأ: '+e.message,'e'));
}






// ════════════════════════════════════════
//  مجتمع منارة
// ════════════════════════════════════════

let COMMUNITY_POSTS = [];
try{ COMMUNITY_POSTS = JSON.parse(localStorage.getItem('mm_community')||'[]'); }catch(e){}

// منشورات افتراضية


let _currentCommunityTab = 'questions';

function swCommunity(cat, btn){
  _currentCommunityTab = cat;
  document.querySelectorAll('.cmt').forEach(b=>{
    b.className = b===btn ? 'btn bgo bsm cmt on' : 'btn bgh bsm cmt';
    b.style.whiteSpace='nowrap'; b.style.fontSize='.65rem';
  });
  renderCommunityPosts();
}

function renderCommunityPosts(){
  const el = document.getElementById('community-posts');
  if(!el) return;
  const posts = COMMUNITY_POSTS.filter(p=>p.cat===_currentCommunityTab);
  
  if(!posts.length){
    el.innerHTML = `<div style="text-align:center;padding:2.5rem 1rem">
      <div style="font-size:2.2rem;margin-bottom:.6rem">💬</div>
      <div style="font-size:.8rem;font-weight:700;margin-bottom:.35rem">المجتمع في بدايته</div>
      <div style="font-size:.7rem;color:var(--tm);line-height:1.7;max-width:280px;margin:0 auto">شارك سؤالاً أو نصيحة — مشاركتك قد تفيد طالباً آخر يبحث عن نفس الإجابة</div>
    </div>`;
    return;
  }
  
  el.innerHTML = posts.map(p=>`
    <div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:14px;padding:.85rem;margin-bottom:.55rem">
      <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.5rem">
        <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--go),var(--gl));display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:700;color:var(--navy);flex-shrink:0">${p.author[0]}</div>
        <div style="flex:1">
          <div style="font-size:.72rem;font-weight:700">${p.author}</div>
          <div style="font-size:.6rem;color:var(--tm)">${p.time}</div>
        </div>
      </div>
      <div style="font-size:.8rem;font-weight:700;margin-bottom:.35rem;line-height:1.5">${p.title}</div>
      <div style="font-size:.7rem;color:var(--tm);line-height:1.65;margin-bottom:.65rem">${p.body}</div>
      <div style="display:flex;gap:.75rem;font-size:.65rem;color:var(--tm)">
        <span onclick="likePost(${p.id})" style="cursor:pointer;display:flex;align-items:center;gap:.25rem">❤️ ${p.likes}</span>
        <span onclick="replyPost(${p.id})" style="cursor:pointer;display:flex;align-items:center;gap:.25rem">💬 ${p.replies} رد</span>
        <span onclick="sharePost(${p.id})" style="cursor:pointer;margin-right:auto">📤 مشاركة</span>
      </div>
    </div>`).join('');
}

function likePost(id){
  const p = COMMUNITY_POSTS.find(x=>x.id===id);
  if(!p) return;
  p.likes = (p.likes||0)+1;
  try{localStorage.setItem('mm_community',JSON.stringify(COMMUNITY_POSTS));}catch(e){}
  renderCommunityPosts();
  if(typeof awardXP==='function') awardXP(1,'تفاعل مع المجتمع ❤️');
}

function replyPost(id){
  const p = COMMUNITY_POSTS.find(x=>x.id===id);
  if(!p) return;
  const reply = prompt('اكتب ردك:');
  if(!reply) return;
  p.replies = (p.replies||0)+1;
  try{localStorage.setItem('mm_community',JSON.stringify(COMMUNITY_POSTS));}catch(e){}
  renderCommunityPosts();
  toast('تم إضافة ردك ✅','s');
  if(typeof awardXP==='function') awardXP(3,'رد في المجتمع 💬');
}

function sharePost(id){
  const p = COMMUNITY_POSTS.find(x=>x.id===id);
  if(!p) return;
  const text = `${p.title}\n\n${p.body}\n\nمن مجتمع منارة المعرفة 🌟\nmanarat-almaarifa.com`;
  if(navigator.share){
    navigator.share({title:p.title, text}).catch(()=>{});
  } else {
    window.open('https://wa.me/?text='+encodeURIComponent(text),'_blank');
  }
}

function openNewPost(){
  const m = document.getElementById('new-post-modal');
  if(m) m.style.display='flex';
}
function closeNewPost(){
  const m = document.getElementById('new-post-modal');
  if(m) m.style.display='none';
}
function submitPost(){
  const cat = document.getElementById('post-cat')?.value;
  const title = document.getElementById('post-title')?.value?.trim();
  const body = document.getElementById('post-body')?.value?.trim();
  if(!title||!body){toast('أكمل العنوان والمحتوى','e');return;}
  
  COMMUNITY_POSTS.unshift({
    id: Date.now(), cat, title, body,
    author: CU?.name || 'مستخدم',
    time: 'الآن', likes: 0, replies: 0
  });
  try{localStorage.setItem('mm_community',JSON.stringify(COMMUNITY_POSTS));}catch(e){}
  
  document.getElementById('post-title').value='';
  document.getElementById('post-body').value='';
  closeNewPost();
  _currentCommunityTab = cat;
  renderCommunityPosts();
  toast('تم نشر منشورك ✅','s');
  if(typeof awardXP==='function') awardXP(10,'منشور جديد في المجتمع ✍️');
}

// ════════════════════════════════════════
//  إعادة جدولة الدرس
// ════════════════════════════════════════

let _reschedulingBooking = null;

function openReschedule(bookingId){
  _reschedulingBooking = bookingId;
  const m = document.getElementById('reschedule-modal');
  if(m){
    m.style.display='flex';
    renderRescheduleSlots();
  }
}
function closeReschedule(){
  const m = document.getElementById('reschedule-modal');
  if(m) m.style.display='none';
  _reschedulingBooking = null;
}
function localISODate(d){
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
/* [B.3] نافذة إعادة الجدولة: أوقات المعلم الحقيقية، بلا المواعيد المحجوزة */
async function renderRescheduleSlots(){
  const el=document.getElementById('reschedule-slots');
  if(!el)return;
  const bookingId=_reschedulingBooking;
  el.innerHTML='<div style="color:var(--tm);font-size:.7rem;text-align:center;padding:.8rem">⏳ جاري تحميل المواعيد...</div>';
  try{
    if(!_sb||!bookingId)throw new Error('no-connection');
    const {data:bk,error:be}=await _sb.from('bookings').select('teacher_id').eq('id',bookingId).maybeSingle();
    if(be||!bk||!bk.teacher_id)throw be||new Error('no-booking');
    const av=await getTeacherAvailability(bk.teacher_id);
    const toMin=v=>{const p=String(v||'').split(':');return (+p[0]||0)*60+(+p[1]||0);};
    const fmt=m=>String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');
    let times=['08:00','10:00','14:00','16:00','18:00','20:00'];
    if(av&&av.from&&av.to){times=[];for(let m=toMin(av.from);m+60<=toMin(av.to);m+=60)times.push(fmt(m));}
    const today=new Date();
    let days=Array.from({length:7},(_,di)=>{
      const date=new Date(today);
      date.setHours(12,0,0,0);
      date.setDate(today.getDate()+di+1);
      return {iso:localISODate(date),dow:date.getDay(),label:date.toLocaleDateString('ar-u-nu-latn',{weekday:'long',day:'numeric',month:'short'})};
    });
    if(av&&av.days&&av.days.length)days=days.filter(x=>av.days.includes(x.dow));
    const booked=await Promise.all(days.map(async x=>{try{const {data,error}=await _sb.rpc('get_teacher_booked_slots',{p_teacher_id:bk.teacher_id,p_date:x.iso});return new Set(!error&&Array.isArray(data)?data.map(v=>String(v).slice(0,5)):[]);}catch(_){return new Set();}}));
    if(bookingId!==_reschedulingBooking)return;
    const rows=days.map((x,k)=>({x,free:times.filter(t=>!booked[k].has(t))})).filter(r=>r.free.length);
    if(!rows.length){el.innerHTML='<div style="color:var(--tm);font-size:.7rem;text-align:center;padding:.8rem">لا توجد مواعيد متاحة لدى المعلم خلال الأيام السبعة القادمة</div>';return;}
    const tzNote=(av&&av.tz&&typeof getUserTZ==='function'&&av.tz!==getUserTZ())?'<div style="font-size:.62rem;color:var(--tm);text-align:center;margin-bottom:.5rem">الأوقات بتوقيت المعلم</div>':'';
    el.innerHTML=tzNote+rows.map(({x,free})=>`
    <div style="margin-bottom:.65rem">
      <div style="font-size:.7rem;font-weight:700;color:var(--gl);margin-bottom:.35rem">${escapeHtml(x.label)}</div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:.35rem">
        ${free.map(t=>`<button class="btn bgh bsm" style="font-size:.65rem;padding:.4rem" onclick="confirmReschedule('${x.iso}','${t}')">${t}</button>`).join('')}
      </div>
    </div>`).join('');
  }catch(e){
    el.innerHTML='<div style="color:#e74c3c;font-size:.7rem;text-align:center;padding:.8rem">تعذّر تحميل المواعيد — حاول مرة أخرى</div>';
  }
}
async function confirmReschedule(newDate,newTime){
  if(!_reschedulingBooking){closeReschedule();return;}
  try{
    if(!_sb)throw new Error('لا اتصال بقاعدة البيانات');
    const {error}=await _sb.rpc('reschedule_booking',{p_booking_id:_reschedulingBooking,p_date:newDate,p_time:newTime});
    if(error)throw error;
    toast(`تم طلب إعادة جدولة درسك إلى ${newDate} ${newTime} ✅`,'s');
    const msg=encodeURIComponent(`🔄 طلب إعادة جدولة\n\nالطالب: ${CU?.name||'طالب'}\nالموعد الجديد: ${newDate} ${newTime}\n\nيرجى التأكيد.`);
    setTimeout(()=>window.open('https://wa.me/212681883238?text='+msg,'_blank'),1200);
    closeReschedule();
    if(typeof loadUpcoming==='function')loadUpcoming();
  }catch(e){toast('تعذّرت إعادة الجدولة: '+(e.message||e),'e');}
}


// ════════════════════════════════════════
//  دفتر الملاحظات
// ════════════════════════════════════════

let NOTES = [];
try{ NOTES = JSON.parse(localStorage.getItem('mm_notes')||'[]'); }catch(e){}
let _editingNote = null;
let _notesFilter = 'all';

function newNote(){
  _editingNote = null;
  document.getElementById('note-modal-title').textContent = '📝 ملاحظة جديدة';
  document.getElementById('note-title').value = '';
  document.getElementById('note-body').value = '';
  document.getElementById('note-cat').value = 'quran';
  document.getElementById('note-modal').style.display = 'flex';
}

function editNote(id){
  const n = NOTES.find(x=>x.id===id);
  if(!n) return;
  _editingNote = id;
  document.getElementById('note-modal-title').textContent = '✏️ تعديل الملاحظة';
  document.getElementById('note-title').value = n.title;
  document.getElementById('note-body').value = n.body;
  document.getElementById('note-cat').value = n.cat;
  document.getElementById('note-modal').style.display = 'flex';
}

function closeNote(){
  document.getElementById('note-modal').style.display = 'none';
  _editingNote = null;
}

function saveNote(){
  const title = document.getElementById('note-title')?.value?.trim();
  const body = document.getElementById('note-body')?.value?.trim();
  const cat = document.getElementById('note-cat')?.value;
  if(!title){toast('أدخل عنواناً للملاحظة','e');return;}
  
  if(_editingNote){
    const n = NOTES.find(x=>x.id===_editingNote);
    if(n){ n.title=title; n.body=body; n.cat=cat; n.updated=new Date().toLocaleDateString('ar-u-nu-latn'); }
    toast('تم تحديث الملاحظة ✅','s');
  } else {
    NOTES.unshift({
      id: Date.now(), title, body, cat,
      created: new Date().toLocaleDateString('ar-u-nu-latn'),
      updated: new Date().toLocaleDateString('ar-u-nu-latn')
    });
    toast('تم حفظ الملاحظة ✅','s');
    if(typeof awardXP==='function') awardXP(3,'ملاحظة جديدة 📝');
  }
  
  try{localStorage.setItem('mm_notes',JSON.stringify(NOTES));}catch(e){}
  closeNote();
  renderNotes();
}

function deleteNote(id){
  if(!confirm('حذف هذه الملاحظة؟')) return;
  NOTES = NOTES.filter(n=>n.id!==id);
  try{localStorage.setItem('mm_notes',JSON.stringify(NOTES));}catch(e){}
  renderNotes();
  toast('تم الحذف','i');
}

function filterNotes(cat, btn){
  _notesFilter = cat;
  document.querySelectorAll('.nt-tab').forEach(b=>{
    b.className = b===btn ? 'btn bgo bsm nt-tab' : 'btn bgh bsm nt-tab';
    b.style.whiteSpace='nowrap'; b.style.fontSize='.62rem';
  });
  renderNotes();
}

function renderNotes(search=''){
  const el = document.getElementById('notes-list');
  if(!el) return;
  
  const q = (search || document.getElementById('notes-search')?.value || '').toLowerCase();
  let list = NOTES;
  if(_notesFilter !== 'all') list = list.filter(n=>n.cat===_notesFilter);
  if(q) list = list.filter(n=>n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
  
  if(!list.length){
    el.innerHTML = `<div style="text-align:center;padding:2.5rem 1rem;color:var(--tm)">
      <div style="font-size:2rem;margin-bottom:.5rem">📝</div>
      <div style="font-size:.75rem">${q?'لا نتائج للبحث':'لا ملاحظات بعد — اضغط "+ ملاحظة"'}</div>
    </div>`;
    return;
  }
  
  const catIcons = {quran:'🕌',arabic:'📖',islamic:'⚖️',other:'✏️'};
  const catColors = {quran:'#34D399',arabic:'#60A5FA',islamic:'#10B981',other:'#A78BFA'};
  
  el.innerHTML = list.map(n=>`
    <div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-right:3px solid ${catColors[n.cat]||'var(--go)'};border-radius:12px;padding:.8rem;margin-bottom:.5rem">
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.35rem">
        <div style="display:flex;align-items:center;gap:.35rem;flex:1">
          <span style="font-size:.85rem">${catIcons[n.cat]||'📝'}</span>
          <div style="font-size:.78rem;font-weight:700;flex:1">${n.title}</div>
        </div>
        <div style="display:flex;gap:.3rem">
          <button onclick="editNote(${n.id})" style="background:rgba(255,255,255,.06);border:none;border-radius:6px;padding:.2rem .4rem;color:var(--tm);font-size:.65rem;cursor:pointer">✏️</button>
          <button onclick="deleteNote(${n.id})" style="background:rgba(192,57,43,.1);border:none;border-radius:6px;padding:.2rem .4rem;color:#e74c3c;font-size:.65rem;cursor:pointer">🗑</button>
        </div>
      </div>
      <div style="font-size:.68rem;color:var(--tm);line-height:1.6;max-height:60px;overflow:hidden;margin-bottom:.35rem">${n.body||'(فارغة)'}</div>
      <div style="font-size:.58rem;color:var(--td)">${n.updated||n.created}</div>
    </div>`).join('');
}

async function aiSummarizeNote(){
  const body = document.getElementById('note-body')?.value?.trim();
  if(!body){toast('اكتب الملاحظة أولاً','e');return;}
  
  toast('🤖 جاري التلخيص...','i');
  try{
    const res = await secureAIFetch('',{
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'claude-sonnet-4-6', max_tokens:400,
        system:'مساعد تعليمي. نظّم الملاحظات في نقاط واضحة بالعربية. حافظ على كل المعلومات المهمة.',
        messages:[{role:'user', content:'نظّم هذه الملاحظات في نقاط مرتبة:\n\n'+body}]
      })
    });
    const d = await res.json();
    const summary = d.content?.[0]?.text;
    if(summary){
      document.getElementById('note-body').value = summary;
      toast('تم تنظيم ملاحظاتك ✅','s');
      if(typeof awardXP==='function') awardXP(2,'استخدام AI 🤖');
    }
  }catch(e){
    toast('تعذّر الاتصال بـ AI','e');
  }
}


// ════════════════════════════════════════
//  الفصول الافتراضية — Zoom & Google Meet
// ════════════════════════════════════════

// روابط الاجتماعات — يملؤها المدير من لوحة الإدارة
let MEETING_LINKS = {};
try{ MEETING_LINKS = JSON.parse(localStorage.getItem('mm_meetings')||'{}'); }catch(e){}

// إنشاء رابط Google Meet فوري
function createInstantMeet(){
  const url = 'https://meet.google.com/new';
  window.open(url, '_blank');
  toast('سيفتح Google Meet — انسخ الرابط وأضفه للحصة','i');
}

// فتح الفصل الافتراضي
function joinClassroom(bookingId, meetType, meetLink){
  // إذا كان هناك رابط محفوظ
  const link = meetLink || MEETING_LINKS[bookingId];
  
  if(link){
    window.open(link, '_blank');
    if(typeof awardXP==='function') awardXP(10,'حضور الدرس 🎓');
    toast('جاري فتح الفصل...','s');
    return;
  }
  
  // إذا لا يوجد رابط — تواصل مع المعلم
  const msg = encodeURIComponent(`السلام عليكم 🌟\nأنا ${CU?.name||'طالب'} — موعد درسي الآن.\nهل يمكن إرسال رابط ${meetType==='meet'?'Google Meet':'Zoom'}؟`);
  window.open('https://wa.me/212681883238?text='+msg, '_blank');
  toast('طلب الرابط عبر واتساب','i');
}

// حفظ رابط الاجتماع (للمعلم/المدير)
async function saveMeetingLink(bookingId, link){
  if(!link) return false;
  const cleanLink=String(link).trim();
  const isZoom = /(^|\.)zoom\.us\//i.test(cleanLink);
  const isMeet = /(^|\.)meet\.google\.com\//i.test(cleanLink);
  if(!isZoom && !isMeet){ toast('الرابط يجب أن يكون Zoom أو Google Meet','e'); return false; }
  if(!_sb || !CU?.id){ toast('يجب تسجيل الدخول لحفظ الرابط','e'); return false; }
  try{
    const {error}=await _sb.rpc('teacher_set_booking_meeting_link',{p_booking_id:bookingId,p_meeting_link:cleanLink,p_meeting_type:isZoom?'zoom':'meet'});
    if(error) throw error;
    MEETING_LINKS[bookingId]=cleanLink;
    try{localStorage.setItem('mm_meetings',JSON.stringify(MEETING_LINKS));}catch(e){}
    toast('تم حفظ رابط الفصل وتأكيده من قاعدة البيانات ✅','s');
    return true;
  }catch(e){ toast('لم يُحفظ رابط الفصل: '+(e.message||e),'e'); return false; }
}

// واجهة إدارة روابط الفصول
function loadAdminMeetings(){
  const b = document.getElementById('amt-body');
  if(!b) return;
  
  b.innerHTML = `
    <div style="font-size:.78rem;font-weight:700;margin-bottom:.65rem">🎥 روابط الفصول الافتراضية</div>
    
    <div style="background:rgba(52,152,219,.06);border:1px solid rgba(52,152,219,.15);border-radius:12px;padding:.75rem;margin-bottom:.85rem">
      <div style="font-size:.7rem;color:#5dade2;line-height:1.6;margin-bottom:.5rem">
        💡 أنشئ رابطاً دائماً لكل فصل، أو رابطاً جديداً لكل حصة
      </div>
      <div style="display:flex;gap:.4rem">
        <button class="btn bgh bsm" style="flex:1;font-size:.62rem" onclick="createInstantMeet()">
          📹 إنشاء Google Meet
        </button>
        <button class="btn bgh bsm" style="flex:1;font-size:.62rem" onclick="window.open('https://zoom.us/meeting/schedule','_blank')">
          🎥 جدولة Zoom
        </button>
      </div>
    </div>
    
    <div style="font-size:.72rem;font-weight:700;margin-bottom:.5rem">روابط الحصص الجماعية</div>
    ${GROUP_CLASSES.map(g=>`
      <div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.7rem;margin-bottom:.45rem">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:.4rem">
          <div style="font-size:.74rem;font-weight:700">${g.title}</div>
          <span style="font-size:.6rem;background:${g.meet==='zoom'?'rgba(45,140,255,.15)':'rgba(0,172,71,.15)'};color:${g.meet==='zoom'?'#2D8CFF':'#00AC47'};padding:.15rem .45rem;border-radius:100px">
            ${g.meet==='zoom'?'🎥 Zoom':'📹 Meet'}
          </span>
        </div>
        <div style="font-size:.62rem;color:var(--tm);margin-bottom:.4rem">${g.day} ${g.time} • ${g.teacher}</div>
        <div style="display:flex;gap:.35rem">
          <input class="ainp" id="mlink-${g.id}" placeholder="الصق رابط الاجتماع هنا..."
            value="${MEETING_LINKS['gc-'+g.id]||''}" style="flex:1;font-size:.62rem;padding:.35rem .5rem">
          <button class="btn bgo bsm" style="font-size:.6rem;white-space:nowrap"
            onclick="saveMeetingLink('gc-${g.id}', document.getElementById('mlink-${g.id}').value)">💾</button>
        </div>
      </div>`).join('')}
  `;
}

// زر الدخول للفصل في لوحة الطالب
function renderClassroomButton(booking){
  const link = MEETING_LINKS[booking.id] || booking.meeting_link;
  const type = booking.meeting_type || 'meet';
  
  if(link){
    return `<button class="btn bgo bsm" style="font-size:.65rem;display:flex;align-items:center;gap:.3rem"
      onclick="joinClassroom('${booking.id}','${type}','${link}')">
      ${type==='zoom'?'🎥':'📹'} ادخل الفصل
    </button>`;
  }
  return `<button class="btn bgh bsm" style="font-size:.65rem"
    onclick="joinClassroom('${booking.id}','${type}')">
    📞 اطلب الرابط
  </button>`;
}


function loadNotesPage(){
  renderNotes();
}

// ════════════════════════════════════════
//  نظام الفواتير — تحسين الدفع عبر واتساب
// ════════════════════════════════════════

const BANK_ACCOUNTS = []; // بيانات الدفع البنكي لا تُخزّن في الواجهة العامة. تُعرض فقط من إعدادات الخادم/الدعم.


function generateInvoice(booking){
  const inv = {
    id: 'INV-' + Date.now().toString().slice(-8),
    date: new Date().toLocaleDateString('ar-u-nu-latn'),
    student: booking.student || CU?.name || 'طالب',
    email: booking.email || CU?.email || '',
    hall: booking.hall || 'درس خصوصي',
    teacher: booking.teacher || '—',
    slot: booking.slot || '—',
    sessions: booking.sessions || 1,
    price: booking.price || 12,
    discount: booking.discount || 0,
  };
  inv.total = (inv.price * inv.sessions) - inv.discount;
  return inv;
}

function showInvoice(booking){
  const inv = generateInvoice(booking);
  window._currentInvoice = inv;
  
  const el = document.getElementById('invoice-content');
  if(!el) return;
  
  el.innerHTML = `
    <div id="invoice-printable" style="background:#fff;color:#1a1a1a;border-radius:14px;padding:1.2rem;font-family:Cairo,sans-serif">
      <!-- ترويسة -->
      <div style="text-align:center;border-bottom:2px solid #D4AF6A;padding-bottom:.85rem;margin-bottom:.85rem">
        <div style="font-family:Amiri,serif;font-size:1.3rem;font-weight:700;color:#0F3D2E">منارة المعرفة</div>
        <div style="font-size:.62rem;color:#888;letter-spacing:.1em">MANARAT AL-MAARIFA</div>
        <div style="font-size:.6rem;color:#aaa;margin-top:.2rem">manarat-almaarifa.com</div>
      </div>
      
      <!-- رقم الفاتورة -->
      <div style="display:flex;justify-content:space-between;margin-bottom:.85rem;font-size:.7rem">
        <div><strong>فاتورة رقم:</strong> ${inv.id}</div>
        <div><strong>التاريخ:</strong> ${inv.date}</div>
      </div>
      
      <!-- بيانات الطالب -->
      <div style="background:#f8f5ee;border-radius:8px;padding:.7rem;margin-bottom:.85rem;font-size:.68rem;line-height:1.8">
        <div><strong>الطالب:</strong> ${inv.student}</div>
        ${inv.email?`<div><strong>البريد:</strong> ${inv.email}</div>`:''}
      </div>
      
      <!-- التفاصيل -->
      <table style="width:100%;border-collapse:collapse;font-size:.68rem;margin-bottom:.85rem">
        <thead>
          <tr style="background:#D4AF6A;color:#fff">
            <th style="padding:.45rem;text-align:right">البيان</th>
            <th style="padding:.45rem;text-align:center">العدد</th>
            <th style="padding:.45rem;text-align:left">المبلغ</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:.5rem">
              <div style="font-weight:700">${inv.hall}</div>
              <div style="font-size:.62rem;color:#888">المعلم: ${inv.teacher}</div>
              <div style="font-size:.62rem;color:#888">${inv.slot}</div>
            </td>
            <td style="padding:.5rem;text-align:center">${inv.sessions}</td>
            <td style="padding:.5rem;text-align:left">$${(inv.price*inv.sessions).toFixed(2)}</td>
          </tr>
          ${inv.discount>0?`
          <tr style="border-bottom:1px solid #eee;color:#27ae60">
            <td style="padding:.5rem" colspan="2">خصم</td>
            <td style="padding:.5rem;text-align:left">-$${inv.discount.toFixed(2)}</td>
          </tr>`:''}
        </tbody>
        <tfoot>
          <tr style="background:#f8f5ee;font-weight:700">
            <td style="padding:.6rem" colspan="2">الإجمالي</td>
            <td style="padding:.6rem;text-align:left;font-size:.85rem;color:#0F3D2E">$${inv.total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
      
      <!-- طرق الدفع -->
      <div style="background:#f8f5ee;border-radius:8px;padding:.75rem;font-size:.65rem;line-height:1.8">
        <div style="font-weight:700;margin-bottom:.4rem;color:#0F3D2E">💳 طرق الدفع</div>
        ${BANK_ACCOUNTS.length ? BANK_ACCOUNTS.map(b=>`
          <div style="margin-bottom:.4rem;padding-bottom:.4rem;border-bottom:1px dashed #ddd">
            <div style="font-weight:700">🏦 ${b.bank}</div>
            <div style="font-family:monospace;direction:ltr;text-align:right;font-size:.62rem">${b.rib}</div>
            <div style="font-size:.6rem;color:#888">باسم: ${b.holder}</div>
          </div>`).join('') : '<div style="font-size:.62rem;color:#888">تظهر تعليمات الدفع الآمنة بعد إنشاء طلب الدفع والتواصل مع الإدارة.</div>'}
        <div style="margin-top:.4rem">
          <div style="font-weight:700">💬 واتساب</div>
          <div style="font-size:.62rem;direction:ltr;text-align:right">+212 681 883 238</div>
        </div>
      </div>
      
      <!-- تذييل -->
      <div style="text-align:center;font-size:.58rem;color:#aaa;margin-top:.85rem;padding-top:.6rem;border-top:1px solid #eee">
        بعد الدفع، أرسل صورة الإيصال عبر واتساب لتأكيد الحجز<br>
        شكراً لثقتك بمنارة المعرفة 🌟
      </div>
    </div>
  `;
  
  document.getElementById('invoice-modal').style.display='flex';
}

function closeInvoice(){
  const m = document.getElementById('invoice-modal');
  if(m) m.style.display='none';
}

// إرسال الفاتورة عبر واتساب
function sendInvoiceWA(){
  const inv = window._currentInvoice;
  if(!inv) return;
  
  const msg = `🧾 *فاتورة حجز — منارة المعرفة*

📋 رقم الفاتورة: ${inv.id}
📅 التاريخ: ${inv.date}

👤 *الطالب:* ${inv.student}
📚 *الفصل:* ${inv.hall}
👨‍🏫 *المعلم:* ${inv.teacher}
🕐 *الموعد:* ${inv.slot}
🔢 *عدد الحصص:* ${inv.sessions}

💰 *المبلغ الإجمالي:* $${inv.total.toFixed(2)}
${inv.discount>0?`🎁 *الخصم المطبّق:* $${inv.discount.toFixed(2)}\n`:''}
━━━━━━━━━━━━━━━

💳 *طرق الدفع:*

🏦 التحويل البنكي: تُرسل بيانات الحساب من الإدارة بعد إنشاء طلب الدفع.

━━━━━━━━━━━━━━━
بعد التحويل، أرسل صورة الإيصال هنا لتأكيد الحجز ✅`;

  window.open('https://wa.me/212681883238?text='+encodeURIComponent(msg),'_blank');
  toast('تم إرسال الفاتورة عبر واتساب ✅','s');
}

// حفظ الفاتورة كصورة
function saveInvoiceImage(){
  const el = document.getElementById('invoice-printable');
  if(!el){toast('تعذّر حفظ الفاتورة','e');return;}
  
  // طباعة كـ PDF
  const printWindow = window.open('','_blank');
  printWindow.document.write(`
    <html dir="rtl"><head>
      <meta charset="UTF-8">
      <title>فاتورة ${window._currentInvoice?.id||''}</title>
      <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=Cairo:wght@400;700&display=swap" rel="stylesheet">
      <style>body{margin:0;padding:20px;background:#fff;font-family:Cairo,sans-serif}
/* ═══════════════════════════════════
   ✨ اللمسات الزمرّدية الفاخرة
   ═══════════════════════════════════ */

/* خلفية بعمق زمرّدي متدرّج */
body{
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(21,92,67,.45), transparent 60%),
    radial-gradient(ellipse 60% 40% at 90% 100%, rgba(212,175,106,.06), transparent 55%),
    #071812 !important;
  background-attachment:fixed;
}

/* الهيدر — زجاجي بلمعة ذهبية */
header{
  background:linear-gradient(180deg, rgba(15,61,46,.92), rgba(7,24,18,.88)) !important;
  backdrop-filter:blur(24px) saturate(1.3);
  border-bottom:1px solid rgba(212,175,106,.16) !important;
  box-shadow:0 1px 24px rgba(0,0,0,.4);
}

/* شريط ذهبي رفيع أسفل الهيدر */
header::after{
  content:'';position:absolute;bottom:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(212,175,106,.55),transparent);
}

/* شريط التنقل */
nav{
  background:linear-gradient(0deg, rgba(7,24,18,.97), rgba(15,61,46,.9)) !important;
  backdrop-filter:blur(24px) saturate(1.2);
  border-top:1px solid rgba(212,175,106,.16) !important;
}
nav::before{
  content:'';position:absolute;top:0;left:0;right:0;height:1px;
  background:linear-gradient(90deg,transparent,rgba(212,175,106,.5),transparent);
}

/* الأيقونة النشطة — توهّج ذهبي */
.ni.on{position:relative}
.ni.on .ni-ic{
  filter:drop-shadow(0 0 10px rgba(212,175,106,.6));
  transform:translateY(-2px);
  transition:all .3s cubic-bezier(.34,1.4,.64,1);
}

/* البطاقات — عمق زجاجي */
.hib, .crs-card, .subj-card, .lib-card, .tch-card{
  background:linear-gradient(145deg, rgba(15,61,46,.55), rgba(10,40,30,.35)) !important;
  border:1px solid rgba(212,175,106,.15) !important;
  backdrop-filter:blur(12px);
  transition:transform .25s cubic-bezier(.34,1.3,.64,1), border-color .25s, box-shadow .25s;
}
.hib:active, .crs-card:active, .subj-card:active, .lib-card:active{
  transform:scale(.975);
  border-color:rgba(212,175,106,.4) !important;
  box-shadow:0 6px 28px rgba(212,175,106,.12);
}

/* الأزرار الذهبية — تدرّج ولمعة */
.bgo, .btn.bgo{
  background:linear-gradient(135deg,#F0D9A8 0%,#D4AF6A 45%,#B8935A 100%) !important;
  color:#071812 !important;
  border:none !important;
  box-shadow:0 4px 18px rgba(212,175,106,.32), inset 0 1px 0 rgba(255,255,255,.35);
  font-weight:700;
  position:relative;
  overflow:hidden;
}
.bgo::before{
  content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;
  background:linear-gradient(90deg,transparent,rgba(255,255,255,.4),transparent);
  animation:shimmer 3.5s ease-in-out infinite;
}
@keyframes shimmer{
  0%,100%{left:-100%}
  50%{left:130%}
}
.bgo:active{transform:scale(.97);box-shadow:0 2px 10px rgba(212,175,106,.3)}

/* الأزرار الشفافة */
.bgh, .btn.bgh{
  background:rgba(212,175,106,.07) !important;
  border:1px solid rgba(212,175,106,.22) !important;
  color:#F0D9A8 !important;
  backdrop-filter:blur(8px);
}
.bgh:active{background:rgba(212,175,106,.14) !important}

/* العناوين الذهبية — توهّج خفيف */
.lo-t .ar, .hibtt, .sec-t, .crs-t{
  text-shadow:0 0 22px rgba(212,175,106,.22);
}

/* الشعار — هالة */
.logo{
  filter:drop-shadow(0 0 14px rgba(212,175,106,.35));
  transition:filter .4s;
}
.logo:hover{filter:drop-shadow(0 0 20px rgba(212,175,106,.55))}

/* زر AI — توهّج زمرّدي ذهبي */
.ai-fab{
  background:linear-gradient(135deg,#155C43,#0F3D2E) !important;
  border:2px solid rgba(212,175,106,.35) !important;
  box-shadow:0 6px 24px rgba(15,61,46,.6), 0 0 0 1px rgba(212,175,106,.12), inset 0 1px 0 rgba(212,175,106,.2) !important;
}
.ai-fab:active{transform:scale(.93)}

/* الحقول */
.ainp, input, textarea, select{
  background:rgba(15,61,46,.4) !important;
  border:1px solid rgba(212,175,106,.18) !important;
  color:#fff !important;
  transition:border-color .25s, box-shadow .25s;
}
.ainp:focus, input:focus, textarea:focus, select:focus{
  border-color:rgba(212,175,106,.5) !important;
  box-shadow:0 0 0 3px rgba(212,175,106,.1) !important;
  outline:none !important;
}

/* الشارات */
.pill, .badge{
  background:rgba(212,175,106,.12) !important;
  color:#F0D9A8 !important;
  border:1px solid rgba(212,175,106,.16);
}

/* النوافذ المنبثقة */
.ai-chat-panel, #new-post-modal > div, #note-modal > div,
#invoice-modal > div, #reschedule-modal > div{
  background:linear-gradient(165deg,#0F3D2E,#071812) !important;
  border:1px solid rgba(212,175,106,.2) !important;
  box-shadow:0 -12px 50px rgba(0,0,0,.6);
}

/* شريط التمرير */
::-webkit-scrollbar{width:5px;height:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{
  background:linear-gradient(180deg,rgba(212,175,106,.35),rgba(212,175,106,.15));
  border-radius:100px;
}

/* التحديد */
::selection{background:rgba(212,175,106,.28);color:#fff}

/* ظهور ناعم للصفحات */
.pg.on{animation:fadeUp .35s cubic-bezier(.22,1,.36,1)}
@keyframes fadeUp{
  from{opacity:0;transform:translateY(12px)}
  to{opacity:1;transform:translateY(0)}
}

/* فواصل ذهبية */
hr, .divider{
  border:none;height:1px;
  background:linear-gradient(90deg,transparent,rgba(212,175,106,.3),transparent);
}


/* ═══ الخلفية المتدرّجة تظهر في كل الصفحات ═══ */
#p-lib, #p-halls, #p-home, #p-book, #p-dash, #p-acc, #p-about,
#p-join, #p-terms, #p-privacy, #p-teachers, #p-find-teacher,
#p-teacher-profile, #p-my-profile, #p-certs, #p-progress,
#p-favorites, #p-classroom, #p-rate, #p-referral, #p-settings,
#p-notifs, #p-chat, #p-community, #p-notes, #p-group,
#p-placement, #p-flashcards, #p-gamification, #p-learning-path{
  background:transparent !important;
}

/* لوحة الإدارة — خلفية زمرّدية خفيفة */
#p-adm{
  background:linear-gradient(180deg, rgba(15,61,46,.35), transparent 40%) !important;
}

/* الحاوية نفسها شفافة */
#cnt{background:transparent !important}
#app{background:transparent !important}

/* أقسام المكتبة والفصول */
.lib-sec{background:transparent !important}


/* ═══════════════════════════════════════════════
   دعم RTL / LTR الكامل
   ═══════════════════════════════════════════════ */

/* الاتجاه يتبع lang تلقائياً */
html[dir="ltr"] body{ text-align:left }
html[dir="rtl"] body{ text-align:right }

/* عكس الأسهم في LTR */
html[dir="ltr"] .back-arrow,
html[dir="ltr"] [class*="arrow-back"]{ transform:scaleX(-1) }

/* الأزرار العائمة */
html[dir="rtl"] .ai-fab{ left:1rem; right:auto }
html[dir="ltr"] .ai-fab{ right:1rem; left:auto }

/* النوافذ المنبثقة */
html[dir="ltr"] .md,
html[dir="ltr"] .ai-chat-panel{ text-align:left }

/* حقول الإدخال */
html[dir="ltr"] .ainp,
html[dir="ltr"] input:not([dir]),
html[dir="ltr"] textarea:not([dir]){ text-align:left; direction:ltr }
html[dir="rtl"] .ainp,
html[dir="rtl"] input:not([dir]),
html[dir="rtl"] textarea:not([dir]){ text-align:right; direction:rtl }

/* الحقول التقنية تبقى LTR دائماً */
input[type="email"], input[type="tel"], input[type="url"],
input[type="number"], input[dir="ltr"]{ direction:ltr; text-align:left }

/* الجداول */
html[dir="ltr"] table th,
html[dir="ltr"] table td{ text-align:left }
html[dir="rtl"] table th,
html[dir="rtl"] table td{ text-align:right }

/* التمرير الأفقي للجداول على الشاشات الصغيرة */
table{ min-width:100% }
.dt-wrap, [style*="overflow-x:auto"]{ -webkit-overflow-scrolling:touch }

/* البطاقات — خصائص منطقية */
.pill, .badge{ margin-inline-end:.3rem }
.tp-lang{ margin-inline-end:.3rem; margin-block-end:.3rem }

/* ═══ الاستجابة ═══ */

/* منع تجاوز الشاشة */
*{ max-width:100% }
img, video, iframe{ max-width:100%; height:auto }
pre, code{ overflow-x:auto; white-space:pre-wrap; word-break:break-word }

/* الشاشات الصغيرة جداً */
@media (max-width:360px){
  :root{ --nh:58px }
  .btn{ font-size:.7rem; padding:.45rem .8rem }
  .lib-grid, .hall-grid{ grid-template-columns:1fr !important }
  .admts{ font-size:.62rem }
  .card-t, .hibtt{ font-size:.82rem }
}

/* الأجهزة اللوحية */
@media (min-width:600px) and (max-width:1024px){
  #app{ max-width:760px; margin-inline:auto }
  .lib-grid{ grid-template-columns:repeat(3,1fr) !important }
}

/* الشاشات الكبيرة — تحديد العرض */
@media (min-width:1025px){
  #app{ max-width:880px; margin-inline:auto; box-shadow:0 0 60px rgba(0,0,0,.5) }
  nav{ max-width:880px; margin-inline:auto }
  .ai-fab{ inset-inline-start:calc(50% - 420px) }
  .lib-grid{ grid-template-columns:repeat(4,1fr) !important }
}

/* منع النصوص المقطوعة */
.card-t, .hibtt, .crs-t, .senm, .lib-nm, .tp-name{
  word-break:break-word; overflow-wrap:anywhere;
}

/* أزرار قابلة للضغط على الجوال */
button, .btn, .ib, .ni, .lib-card, .hib{
  min-height:38px; touch-action:manipulation;
}

/* النوافذ لا تتجاوز الشاشة */
.md, .ai-chat-panel, #new-post-modal > div, #note-modal > div,
#invoice-modal > div, #reschedule-modal > div{
  max-height:90vh; overflow-y:auto; max-width:100vw;
}


/* === POLISH V3: unified navigation and mobile safety === */
@media(max-width:480px){
 header{padding:0 .55rem;gap:.35rem}.logo{width:32px;height:32px}
 .lo-t .ar{font-size:.75rem}.lo-t .en{font-size:.46rem}
 .live{width:30px;height:30px;padding:0;justify-content:center;font-size:0;border-radius:50%}
 .live .ldot{display:none}.live::after{content:"🚀";font-size:.78rem}
 .hr{gap:.25rem}.ib{width:30px;height:30px}
 #lsel{width:36px!important;font-size:.55rem!important;padding:.1rem!important}
 .uc{padding:.2rem .35rem}.uc .unm{display:none}
}
nav{padding-bottom:env(safe-area-inset-bottom);height:calc(var(--nh) + env(safe-area-inset-bottom))}
.pg{padding-bottom:calc(var(--nh) + env(safe-area-inset-bottom) + .75rem)}
.ni-lb{font-size:.56rem}.ni.on .ni-lb{color:var(--gl)}
.ni:focus-visible{outline:2px solid var(--gl);outline-offset:2px}
@media(max-width:360px){:root{--nh:62px}.ni-lb{font-size:.5rem}.ni-ic svg{width:19px;height:19px}}

</style>
    </head><body>${el.outerHTML}




\n</body></html>
  `);
  printWindow.document.close();
  setTimeout(()=>printWindow.print(), 600);
  toast('اختر "حفظ كـ PDF" من نافذة الطباعة','i');
}

// نسخ تفاصيل الدفع
function copyBankDetails(){
  const text = 'تعليمات الدفع البنكي تُرسل من الإدارة بعد إنشاء طلب الدفع.';
  navigator.clipboard?.writeText(text)
    .then(()=>toast('تم نسخ بيانات الحسابات ✅','s'))
    .catch(()=>{
      const ta=document.createElement('textarea');ta.value=text;
      document.body.appendChild(ta);ta.select();document.execCommand('copy');
      document.body.removeChild(ta);toast('تم النسخ ✅','s');
    });
}


function selPay(el, method){
  document.querySelectorAll('.paym').forEach(p=>p.classList.remove('on'));
  el.classList.add('on');
  const bankDiv = document.getElementById('bank-details');
  if(bankDiv) bankDiv.style.display = method==='bank' ? 'block' : 'none';
  window._payMethod = method;
}

function copyRIB(){
  const rib = String(SITE_CONFIG.bankRib||'').trim();
  if(!rib){toast('لم تُضف الإدارة رقم RIB بعد.','i');return;}
  navigator.clipboard?.writeText(rib)
    .then(()=>toast('تم نسخ رقم الحساب ✅','s'))
    .catch(()=>{
      const ta=document.createElement('textarea');
      ta.value=rib; document.body.appendChild(ta);
      ta.select(); document.execCommand('copy');
      document.body.removeChild(ta);
      toast('تم نسخ رقم الحساب ✅','s');
    });
}


// ════════════════════════════════════════
//  إعدادات الموقع العامة — تحكم كامل
// ════════════════════════════════════════

let SITE_CONFIG = {
  siteName: 'منارة المعرفة',
  siteNameEn: 'Manarat Al-Maarifa',
  tagline: 'تعلّم • اكتشف • تطوّر',
  description: 'منصة تعليمية عالمية — دروس مباشرة 1-على-1 مع معلمين متخصصين في القرآن الكريم، واللغة العربية، والعلوم الشرعية، واللغات. بلغتك وتوقيتك. درسك الأول مجاناً.',
  whatsapp: '212681883238',
  email: 'abdelghanichaydami@gmail.com',
  bankName: '',
  bankRib: '',
  bankHolder: '',
  teacherShare: 75,
  platformShare: 25,
  freeFirstLesson: true,
  launchBadge: true,
  primaryColor: '#D4AF6A',
  accentColor: '#F0D9A8',
};
try{ 
  const saved = JSON.parse(localStorage.getItem('mm_site_config')||'{}');
  SITE_CONFIG = {...SITE_CONFIG, ...saved};
}catch(e){}
// Financial policy is authoritative: 75% teacher / 25% platform.
SITE_CONFIG.teacherShare = 75;
SITE_CONFIG.platformShare = 25;
try{localStorage.setItem('mm_site_config', JSON.stringify(SITE_CONFIG));}catch(e){}

function loadAdminSiteSettings(){
  const b = document.getElementById('asite-body');
  if(!b) return;
  b.innerHTML = `
    <div style="font-size:.78rem;font-weight:700;margin-bottom:.85rem">🎨 إعدادات الموقع</div>
    
    <!-- الهوية -->
    <div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.85rem;margin-bottom:.6rem">
      <div style="font-size:.72rem;font-weight:700;color:var(--gl);margin-bottom:.6rem">✏️ الهوية والنصوص</div>
      <label style="font-size:.62rem;color:var(--tm)">اسم المنصة (عربي)</label>
      <input id="cfg-name" class="ainp" value="${SITE_CONFIG.siteName}" style="width:100%;margin-bottom:.45rem">
      <label style="font-size:.62rem;color:var(--tm)">اسم المنصة (إنجليزي)</label>
      <input id="cfg-name-en" class="ainp" value="${SITE_CONFIG.siteNameEn}" style="width:100%;margin-bottom:.45rem">
      <label style="font-size:.62rem;color:var(--tm)">الشعار النصي</label>
      <input id="cfg-tagline" class="ainp" value="${SITE_CONFIG.tagline}" style="width:100%;margin-bottom:.45rem">
      <label style="font-size:.62rem;color:var(--tm)">الوصف الرئيسي</label>
      <textarea id="cfg-desc" rows="3" style="width:100%;background:rgba(255,255,255,.06);border:1px solid var(--bd);border-radius:8px;color:#fff;padding:.5rem;font-family:Cairo,sans-serif;font-size:.7rem;resize:vertical">${SITE_CONFIG.description}</textarea>
    </div>

    <!-- التواصل -->
    <div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.85rem;margin-bottom:.6rem">
      <div style="font-size:.72rem;font-weight:700;color:var(--gl);margin-bottom:.6rem">📞 بيانات التواصل</div>
      <label style="font-size:.62rem;color:var(--tm)">رقم واتساب (بدون +)</label>
      <input id="cfg-wa" class="ainp" value="${SITE_CONFIG.whatsapp}" dir="ltr" style="width:100%;margin-bottom:.45rem">
      <label style="font-size:.62rem;color:var(--tm)">البريد الإلكتروني</label>
      <input id="cfg-email" class="ainp" value="${SITE_CONFIG.email}" dir="ltr" style="width:100%">
    </div>

    <!-- البنك -->
    <div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.85rem;margin-bottom:.6rem">
      <div style="font-size:.72rem;font-weight:700;color:var(--gl);margin-bottom:.6rem">🏦 الحساب البنكي</div>
      <label style="font-size:.62rem;color:var(--tm)">اسم البنك</label>
      <input id="cfg-bank" class="ainp" value="${SITE_CONFIG.bankName}" style="width:100%;margin-bottom:.45rem">
      <label style="font-size:.62rem;color:var(--tm)">رقم RIB</label>
      <input id="cfg-rib" class="ainp" value="${SITE_CONFIG.bankRib}" dir="ltr" style="width:100%;margin-bottom:.45rem">
      <label style="font-size:.62rem;color:var(--tm)">اسم صاحب الحساب</label>
      <input id="cfg-holder" class="ainp" value="${SITE_CONFIG.bankHolder}" style="width:100%">
    </div>

    <!-- العمولات -->
    <div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.85rem;margin-bottom:.6rem">
      <div style="font-size:.72rem;font-weight:700;color:var(--gl);margin-bottom:.35rem">💰 الأسعار ونسبة المنصة</div>
      <div style="font-size:.64rem;color:var(--tm);line-height:1.7">تُضبط لكل معلم على حدة من تبويب «المعلمون» ← «تعديل الملف»: سعر الدرس، ونسبة المنصة، والدرس المجاني.</div>
    </div>

    <!-- الخيارات -->
    <div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.85rem;margin-bottom:.6rem">
      <div style="font-size:.72rem;font-weight:700;color:var(--gl);margin-bottom:.6rem">⚙️ خيارات العرض</div>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:.5rem">
        <div style="font-size:.7rem">🎁 الدرس الأول مجاني</div>
        <input type="checkbox" id="cfg-free-lesson" ${SITE_CONFIG.freeFirstLesson?'checked':''} style="width:18px;height:18px;cursor:pointer">
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <div style="font-size:.7rem">🚀 شارة "مرحلة الإطلاق"</div>
        <input type="checkbox" id="cfg-launch-badge" ${SITE_CONFIG.launchBadge?'checked':''} style="width:18px;height:18px;cursor:pointer">
      </div>
    </div>

    <!-- الألوان -->
    <div style="background:rgba(255,255,255,.04);border:1px solid var(--bdl);border-radius:12px;padding:.85rem;margin-bottom:.85rem">
      <div style="font-size:.72rem;font-weight:700;color:var(--gl);margin-bottom:.6rem">🎨 ألوان المنصة</div>
      <div style="display:flex;gap:.6rem">
        <div style="flex:1">
          <label style="font-size:.62rem;color:var(--tm)">اللون الأساسي</label>
          <input type="color" id="cfg-color1" value="${SITE_CONFIG.primaryColor}" style="width:100%;height:38px;border:none;border-radius:8px;cursor:pointer;background:none">
        </div>
        <div style="flex:1">
          <label style="font-size:.62rem;color:var(--tm)">اللون الفاتح</label>
          <input type="color" id="cfg-color2" value="${SITE_CONFIG.accentColor}" style="width:100%;height:38px;border:none;border-radius:8px;cursor:pointer;background:none">
        </div>
      </div>
      <div style="display:flex;gap:.4rem;margin-top:.5rem">
        <button class="btn bgh bsm" style="flex:1;font-size:.62rem" onclick="applyPreset('gold')">🟡 ذهبي</button>
        <button class="btn bgh bsm" style="flex:1;font-size:.62rem" onclick="applyPreset('green')">🟢 أخضر</button>
        <button class="btn bgh bsm" style="flex:1;font-size:.62rem" onclick="applyPreset('blue')">🔵 أزرق</button>
      </div>
    </div>

    <button class="btn bgo" style="width:100%;padding:.75rem" onclick="saveSiteConfig()">💾 حفظ جميع التغييرات</button>
  `;
}

function applyPreset(preset){
  const presets = {
    gold:  {p:'#D4AF6A', a:'#F0D9A8'},
    green: {p:'#1e8449', a:'#52d68a'},
    blue:  {p:'#1f618d', a:'#5dade2'},
  };
  const c = presets[preset];
  if(!c) return;
  document.getElementById('cfg-color1').value = c.p;
  document.getElementById('cfg-color2').value = c.a;
  document.documentElement.style.setProperty('--go', c.p);
  document.documentElement.style.setProperty('--gl', c.a);
  toast('معاينة اللون — اضغط حفظ للتثبيت','i');
}

async function saveSiteConfig(){
  SITE_CONFIG = {
    siteName: document.getElementById('cfg-name')?.value || SITE_CONFIG.siteName,
    siteNameEn: document.getElementById('cfg-name-en')?.value || SITE_CONFIG.siteNameEn,
    tagline: document.getElementById('cfg-tagline')?.value || SITE_CONFIG.tagline,
    description: document.getElementById('cfg-desc')?.value || SITE_CONFIG.description,
    whatsapp: (document.getElementById('cfg-wa')?.value || SITE_CONFIG.whatsapp).replace(/\D/g,''),
    email: document.getElementById('cfg-email')?.value || SITE_CONFIG.email,
    bankName: document.getElementById('cfg-bank')?.value || SITE_CONFIG.bankName,
    bankRib: document.getElementById('cfg-rib')?.value || SITE_CONFIG.bankRib,
    bankHolder: document.getElementById('cfg-holder')?.value || SITE_CONFIG.bankHolder,
    teacherShare: 75,
    platformShare: 25,
    freeFirstLesson: document.getElementById('cfg-free-lesson')?.checked ?? true,
    launchBadge: document.getElementById('cfg-launch-badge')?.checked ?? true,
    primaryColor: document.getElementById('cfg-color1')?.value || '#D4AF6A',
    accentColor: document.getElementById('cfg-color2')?.value || '#F0D9A8',
  };
  
  try{localStorage.setItem('mm_site_config', JSON.stringify(SITE_CONFIG));}catch(e){}
  
  // المصدر المركزي للعرض العام: لا نعتبر الحفظ ناجحاً قبل تأكيد قاعدة البيانات.
  if(!_sb){ toast('لا يمكن حفظ الإعدادات مركزياً بدون اتصال قاعدة البيانات.','e'); return; }
  try{
    const publicRow={id:1,site_name:SITE_CONFIG.siteName,site_name_en:SITE_CONFIG.siteNameEn,tagline:SITE_CONFIG.tagline,description:SITE_CONFIG.description,whatsapp:SITE_CONFIG.whatsapp,email:SITE_CONFIG.email,primary_color:SITE_CONFIG.primaryColor,accent_color:SITE_CONFIG.accentColor,free_first_lesson:SITE_CONFIG.freeFirstLesson,launch_badge:SITE_CONFIG.launchBadge,bank_name:SITE_CONFIG.bankName,bank_rib:SITE_CONFIG.bankRib,bank_holder:SITE_CONFIG.bankHolder,updated_at:new Date().toISOString()};
    const {error}=await _sb.from('public_site_config').upsert(publicRow);
    if(error) throw error;
    try{localStorage.setItem('mm_site_config', JSON.stringify(SITE_CONFIG));}catch(e){}
    applySiteConfig();
    toast('تم حفظ الإعدادات مركزياً وتأكيدها من قاعدة البيانات ✅','s');
  }catch(e){
    toast('لم تُحفظ الإعدادات: '+(e.message||e),'e');
  }
}

function applySiteConfig(){
  // الألوان
  document.documentElement.style.setProperty('--go', SITE_CONFIG.primaryColor);
  document.documentElement.style.setProperty('--gl', SITE_CONFIG.accentColor);
  
  // اسم المنصة
  document.querySelectorAll('.lo-t .ar').forEach(e=>e.textContent = SITE_CONFIG.siteName);
  document.querySelectorAll('.lo-t .en').forEach(e=>e.textContent = SITE_CONFIG.siteNameEn);
  document.title = SITE_CONFIG.siteName + ' — منصة التعليم';
  
  // الوصف
  const sub = document.getElementById('h-sub');
  if(sub) sub.textContent = SITE_CONFIG.description;
  
  // روابط واتساب
  document.querySelectorAll('[href*="wa.me"]').forEach(a=>{
    a.href = a.href.replace(/wa\.me\/\d+/, 'wa.me/'+SITE_CONFIG.whatsapp);
  });
  
  // RIB في صفحة الحجز
  const ribEl = document.querySelector('#bank-details [style*="monospace"]');
  if(ribEl) ribEl.textContent = SITE_CONFIG.bankRib;
  
  // شارة الإطلاق
  // v20 — الشارة في موضعين: رأس الصفحة (.live) وبطاقة الترحيب (.h-badge).
  // كان الإخفاء يستهدف الثانية فقط، فتبقى شارة الرأس ظاهرة دائماً.
  const hideLaunch = SITE_CONFIG.launchBadge === false || SITE_CONFIG.launchBadge === 'false';
  document.body.classList.toggle('no-launch-badge', hideLaunch);
  document.querySelectorAll('.h-badge, .live').forEach(el => { el.style.display = hideLaunch ? 'none' : ''; });
}

// تطبيق عند التحميل
document.addEventListener('DOMContentLoaded', ()=>{
  setTimeout(applySiteConfig, 200);
});


// ════════════════════════════════════════
//  المعلمون
// ════════════════════════════════════════

let TEACHERS = [];
/* Production rule: teacher cards are DB-backed; legacy local demo rows are never treated as real. */
try{
  const saved = JSON.parse(localStorage.getItem('mm_teachers')||'[]');
  /* [إصلاح F3] نقبل الذاكرة المحلية فقط إن كانت معرّفاتها صالحة لصفحة الملف */
  const _validTid = t => t && typeof t.id==='string' && (/^[0-9a-f-]{36}$/i.test(t.id) || t.id.indexOf('legacy:')===0);
  if(saved.length && localStorage.getItem('mm_teachers_source')==='db' && saved.every(_validTid)) TEACHERS = saved;
}catch(e){}

function renderTeachers(containerId='teachers-list', filter=null){
  const el = document.getElementById(containerId);
  if(!el) return;
  
  let list = TEACHERS;
  if(filter) list = list.filter(t=>t.specialties.some(s=>s.includes(filter)));
  
  if(!list.length){
    el.innerHTML = '<div style="text-align:center;padding:2.5rem 1rem;color:var(--tm)"><div style="font-size:2rem;margin-bottom:.5rem">👨‍🏫</div><div style="font-size:.75rem">لا يوجد معلمون منشورون لهذا التخصص حالياً</div></div>';
    return;
  }
  
  el.innerHTML = list.map(t=>{const id=escapeHtml(t.id||''),name=escapeHtml(t.name||'معلم'),title=escapeHtml(t.title||''),country=escapeHtml(t.country||''),flag=escapeHtml(t.flag||''),ijaza=escapeHtml(t.ijaza||''),ages=(Array.isArray(t.ages)?t.ages:[]).map(x=>escapeHtml(String(x))),specialties=(Array.isArray(t.specialties)?t.specialties:[]).map(x=>escapeHtml(String(x))),avatar=/^(?:https?:\/\/|\/(?!\/)|\.\/|\.\.\/)/i.test(String(t.avatar||''))?escapeHtml(t.avatar):'',rating=Number(t.rating);return `
    <div data-teacher-id="${id}" style="background:rgba(255,255,255,.04);border:1px solid ${t.featured?'rgba(212,175,106,.25)':'var(--bdl)'};border-radius:16px;padding:.9rem;margin-bottom:.6rem;cursor:pointer;position:relative">
      ${t.featured?'<div style="position:absolute;top:.6rem;left:.6rem;background:linear-gradient(135deg,var(--go),var(--gl));color:var(--navy);font-size:.55rem;font-weight:700;padding:.15rem .45rem;border-radius:100px">⭐ مميّز</div>':''}
      <div style="display:flex;gap:.7rem;margin-bottom:.6rem">
        <div style="width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,var(--go),var(--gl));display:flex;align-items:center;justify-content:center;font-size:1.4rem;font-weight:700;color:var(--navy);flex-shrink:0;overflow:hidden">
          ${avatar?`<img src="${avatar}" style="width:100%;height:100%;object-fit:cover">`:name[0]||'م'}
        </div>
        <div style="flex:1;min-width:0">
          <div style="display:flex;align-items:center;gap:.3rem">
            <div style="font-size:.82rem;font-weight:700">${name}</div>
            ${t.verified?'<span style="color:#5dade2;font-size:.7rem" title="معلم موثّق">✓</span>':''}${t.ijazaImage?'<span style="font-size:.62rem;background:rgba(39,174,96,.15);color:var(--grl);padding:.08rem .35rem;border-radius:100px" title="إجازة موثّقة">📜</span>':''}
          </div>
          <div style="font-size:.68rem;color:var(--gl)">${title}</div>
          <div style="font-size:.62rem;color:var(--tm);margin-top:.15rem">${flag} ${country} • ${ages.join(' • ')}</div>
        </div>
        <div style="text-align:left;flex-shrink:0">
          <div style="font-size:.9rem;font-weight:700;color:var(--gl)">$${Number(t.price||0)}</div>
          <div style="font-size:.55rem;color:var(--tm)">/درس</div>
        </div>
      </div>
      ${ijaza?`<div style="background:rgba(39,174,96,.08);border:1px solid rgba(39,174,96,.15);border-radius:8px;padding:.45rem .6rem;margin-bottom:.5rem;font-size:.62rem;color:var(--grl);line-height:1.5">📜 ${ijaza}</div>`:''}
      <div style="display:flex;gap:.3rem;flex-wrap:wrap;margin-bottom:.55rem">${specialties.map(s=>`<span style="background:rgba(212,175,106,.1);color:var(--gl);font-size:.58rem;padding:.15rem .45rem;border-radius:100px">${s}</span>`).join('')}</div>
      <div style="display:flex;align-items:center;justify-content:space-between"><div style="display:flex;gap:.6rem;font-size:.62rem;color:var(--tm)"><span>⭐ ${Number.isFinite(rating)?rating.toFixed(1):'—'}</span><span>👥 ${Number(t.students||0)} طالب</span><span>📚 ${Number(t.lessons||0)} درس</span></div>${t.trialFree?'<span style="background:rgba(39,174,96,.15);color:var(--grl);font-size:.58rem;padding:.15rem .5rem;border-radius:100px;font-weight:700">🎁 درس مجاني</span>':''}</div>
    </div>`}).join('');
  el.querySelectorAll('[data-teacher-id]').forEach(card=>card.addEventListener('click',()=>openTeacherProfile(card.dataset.teacherId)));
}


function bookWithTeacher(){
  const t = window._currentTeacher;
  if(!t) return;
  window._currentBooking = {
    teacher: t.name,
    teacherId: t.id,
    hall: t.specialties[0],
    price: t.price,
  };
  goP('p-book');
  toast(`جاري الحجز مع ${t.name}`,'s');
}




function viewIjaza(teacherId){
  const t = TEACHERS.find(x=>x.id===teacherId);
  if(!t||!t.ijazaImage) return;
  
  const viewer = document.createElement('div');
  viewer.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.95);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:1rem';
  viewer.onclick = () => viewer.remove();
  viewer.innerHTML = `
    <div style="position:absolute;top:1rem;right:1rem;left:1rem;display:flex;justify-content:space-between;align-items:center;z-index:2">
      <div style="font-size:.75rem;color:var(--gl);font-weight:700">📜 إجازة ${t.name}</div>
      <button style="background:rgba(255,255,255,.12);border:none;border-radius:8px;padding:.4rem .7rem;color:#fff;font-size:.75rem;cursor:pointer">✕</button>
    </div>
    <img src="${t.ijazaImage}" style="max-width:100%;max-height:85vh;object-fit:contain;border-radius:8px">
  `;
  document.body.appendChild(viewer);
}

