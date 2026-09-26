
/* ===== إحصاءات الزوار — معرّف عشوائي، بلا IP، بلا طرف ثالث ===== */
(function(){
  let vid,off=false;
  try{off=localStorage.getItem('mm_notrack')==='1'||navigator.webdriver;vid=localStorage.getItem('mm_vid');
    if(!vid){vid=(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)).replace(/[^A-Za-z0-9_-]/g,'');localStorage.setItem('mm_vid',vid);}}catch(e){off=true;}
  /* [إصلاح F8] دوال log_visit/log_page غير موجودة في قاعدة البيانات بعد؛ نوقف الاستدعاءات حتى تُبنى */
  const TRACKING_BACKEND_READY=true;
  if(!TRACKING_BACKEND_READY||off||!vid||typeof _sb==='undefined'||!_sb)return;
  const cur=()=>{const p=document.querySelector('.pg.on');return p?p.id:'p-home';};
  let ready,last=null;
  const ua=navigator.userAgent||'';
  const device=/iPad|Tablet/i.test(ua)||(/Android/i.test(ua)&&!/Mobile/i.test(ua))?'tablet':/Mobi|Android|iPhone/i.test(ua)?'mobile':'desktop';
  let ref=null;try{const q=new URLSearchParams(location.search);ref=q.get('utm_source')||q.get('ref');if(!ref&&document.referrer){const h=new URL(document.referrer).hostname.replace(/^www\./,'');if(h&&h!==location.hostname.replace(/^www\./,''))ref=h;}}catch(e){}
  let tz=null;try{tz=Intl.DateTimeFormat().resolvedOptions().timeZone||null;}catch(e){}
  function start(){
    if(ready)return;last=cur();
    ready=_sb.rpc('log_visit',{p_vid:vid,p_tz:tz,p_lang:navigator.language||null,p_device:device,p_ref:ref,p_page:last}).then(()=>{},()=>{});
  }
  function page(id){
    if(!id||id===last||id==='p-adm'||(typeof isAdm!=='undefined'&&isAdm))return;last=id;
    (ready||Promise.resolve()).then(()=>_sb.rpc('log_page',{p_vid:vid,p_page:id})).then(()=>{},()=>{});
  }
  const prev=window.goP;
  if(typeof prev==='function')window.goP=function(id){const r=prev.apply(this,arguments);try{if(ready)page(id);}catch(e){}return r;};
  if(document.readyState==='complete')setTimeout(start,1500);else window.addEventListener('load',()=>setTimeout(start,1500));
})();
