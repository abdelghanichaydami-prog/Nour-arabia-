
(function(){
  'use strict';
  const status=document.getElementById('connection-status');
  function updateConnection(){
    if(!status) return;
    if(navigator.onLine){status.hidden=true;status.textContent='';}
    else{status.hidden=false;status.textContent='⚠️ أنت غير متصل بالإنترنت. ستعمل الأجزاء المحفوظة محلياً فقط حتى يعود الاتصال.';}
  }
  window.addEventListener('online',updateConnection,{passive:true});
  window.addEventListener('offline',updateConnection,{passive:true});
  updateConnection();
  function prepareImages(){document.querySelectorAll('img').forEach(img=>{if(!img.hasAttribute('loading'))img.setAttribute('loading','lazy');if(!img.hasAttribute('decoding'))img.setAttribute('decoding','async');});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepareImages,{once:true});else prepareImages();
  window.addEventListener('unhandledrejection',e=>{console.warn('Unhandled promise rejection:',e.reason);});
  window.addEventListener('error',e=>{console.warn('Client error:',e.message||e.error||e);});
  window.addEventListener('beforeinstallprompt',e=>{
    e.preventDefault();
    window._v11InstallPrompt=e;
    if(document.getElementById('v11-install-banner')) return;
    const b=document.createElement('div'); b.id='v11-install-banner'; b.className='pwa-banner';
    b.innerHTML='<div class="pwa-ic">📲</div><div class="pwa-txt"><div class="pwa-t">ثبّت منارة المعرفة على جهازك</div><div class="pwa-s">وصول أسرع وتجربة تطبيقية مع دعم العمل دون اتصال لبعض الصفحات.</div></div><button class="btn bgo bsm" type="button" id="v10-install-btn">تثبيت</button><button class="pwa-close" type="button" aria-label="إغلاق">×</button>';
    document.body.appendChild(b);
    b.querySelector('#v10-install-btn').onclick=async()=>{const p=window._v11InstallPrompt;if(!p)return;b.remove();await p.prompt();window._v11InstallPrompt=null;};
    b.querySelector('.pwa-close').onclick=()=>b.remove();
  });
  window.addEventListener('appinstalled',()=>{document.getElementById('v11-install-banner')?.remove();window._v11InstallPrompt=null;});
})();
