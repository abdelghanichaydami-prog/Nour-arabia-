
(function(){'use strict';
let bookingBusy=false;const originalProcPay=window.procPay;
if(typeof originalProcPay==='function'){window.procPay=async function(){if(bookingBusy){toast('جاري معالجة الحجز الحالي، انتظر قليلاً.','i');return}bookingBusy=true;const buttons=[...document.querySelectorAll('[onclick="procPay()"],#pay-btn,#bk-confirm')];buttons.forEach(b=>{b.dataset.v15Disabled=b.disabled?'1':'0';b.disabled=true});try{return await originalProcPay()}catch(e){console.error('procPay:',e);toast('تعذر إتمام العملية. حاول مرة أخرى.','e')}finally{bookingBusy=false;buttons.forEach(b=>{if(b.dataset.v15Disabled!=='1')b.disabled=false;delete b.dataset.v15Disabled})}}}
function hardenBlankLinks(root=document){root.querySelectorAll?.('a[target="_blank"]').forEach(a=>{a.rel='noopener noreferrer'})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>hardenBlankLinks(),{once:true});else hardenBlankLinks();
window.addEventListener('beforeunload',()=>{document.querySelectorAll('[src^="blob:"]').forEach(el=>{try{URL.revokeObjectURL(el.src)}catch(e){}})});
window.addEventListener('offline',()=>toast('لا يوجد اتصال بالإنترنت. بعض العمليات متوقفة حتى عودة الاتصال.','e'),{passive:true});
})();
