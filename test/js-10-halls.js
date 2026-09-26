
/* ═══════ v20 — الفصول وأقسامها من قاعدة البيانات ═══════ */
function _hvColor(c){c=String(c||'').trim();if(/^#[0-9a-f]{3}$/i.test(c))c='#'+c.slice(1).split('').map(x=>x+x).join('');return /^#[0-9a-f]{6}$/i.test(c)?c:'#D4AF6A';}
function _hvEsc(v){return typeof escapeHtml==='function'?escapeHtml(v):String(v??'').replace(/[&<>"']/g,'');}
window.HALLS_V20=null;

async function loadHallsV20(){
  if(typeof _sb==='undefined'||!_sb)return;
  try{
    const [h,s]=await Promise.all([
      _sb.from('learning_halls').select('*').order('sort_order').order('name'),
      _sb.from('learning_sections').select('*').order('sort_order').order('name')
    ]);
    if(h.error)throw h.error;
    const halls=(h.data||[]).filter(x=>x.active!==false);
    if(!halls.length)return;                 // لا فصول بعد: تبقى الصفحة القديمة
    const secs=(s.error?[]:(s.data||[])).filter(x=>x.active!==false);
    window.HALLS_V20={halls,secs};
    if(typeof HD!=='undefined')halls.forEach(x=>{HD[x.id]={secs:secs.filter(z=>z.category===x.id).map(z=>({id:z.id,ic:z.icon,nm:z.name,lv:z.level})),nid:1e6};});
    renderHallsV20();syncBookingHallsV20();syncHomeHallsV20();renderDomainStripV20();
  }catch(e){console.warn('halls v20:',e.message||e);}
}
window.loadHallsV20=loadHallsV20;

function renderHallsV20(active){
  const root=document.getElementById('halls-v20'),legacy=document.getElementById('halls-legacy'),D=window.HALLS_V20;
  if(!root||!D||!D.halls.length)return;
  const E=_hvEsc,ids=D.halls.map(h=>h.id);
  const cur=ids.includes(active)?active:(ids.includes(root.dataset.cur)?root.dataset.cur:ids[0]);
  root.dataset.cur=cur;
  const h=D.halls.find(x=>x.id===cur),c=_hvColor(h.color),list=D.secs.filter(s=>s.category===cur);

  const tabs='<div class="hv-tabs">'+D.halls.map(x=>{const xc=_hvColor(x.color),on=x.id===cur;
    return '<button class="hv-tab'+(on?' on':'')+'" data-hv="'+E(x.id)+'"'+(on?' style="background:'+xc+'33;border-color:'+xc+'aa;box-shadow:0 6px 18px '+xc+'33"':'')+'><em>'+E(x.icon||'📚')+'</em>'+E(x.name)+'</button>';}).join('')+'</div>';

  const hero='<div class="hv-hero" style="background:linear-gradient(145deg,'+c+'3d 0%,'+c+'14 55%,rgba(255,255,255,.02) 100%);border:1px solid '+c+'55">'
    +'<div class="hv-hero-bg">'+E(h.icon||'📚')+'</div>'
    +'<div class="hv-hero-top"><div class="hv-hero-ic" style="background:linear-gradient(135deg,'+c+','+c+'99);box-shadow:0 8px 24px '+c+'55">'+E(h.icon||'📚')+'</div><div class="hv-hero-t">'+E(h.name)+'</div></div>'
    +(h.description?'<div class="hv-hero-d">'+E(h.description)+'</div>':'')
    +'<div class="hv-chips"><span class="hv-chip">📚 '+list.length+' '+(list.length===1?'قسم':'أقسام')+'</span><span class="hv-chip">👤 دروس فردية مباشرة</span><span class="hv-chip">⏱️ 60 دقيقة</span></div></div>';

  const grid='<div class="hv-sub"><div class="hv-sub-t">الأقسام</div><div class="hv-sub-n">اختر قسماً لتحجز فيه</div></div><div class="hv-grid">'
    +(list.length?list.map(s=>'<div class="hv-sec" style="--hv-c:'+c+'" data-hvs="'+E(s.id)+'">'
      +'<div class="hv-sec-ic">'+E(s.icon||'📌')+'</div>'
      +'<div class="hv-sec-nm">'+E(s.name)+'</div>'
      +(s.description?'<div class="hv-sec-ds">'+E(s.description)+'</div>':'')
      +(s.level?'<span class="hv-sec-lv" style="background:'+c+'22;color:'+c+';border:1px solid '+c+'55">'+E(s.level)+'</span>':'')
      +'<div class="hv-sec-go" style="color:'+c+'">احجز في هذا القسم ←</div></div>').join('')
      :'<div class="hv-empty">لا أقسام منشورة في هذا الفصل بعد.</div>')
    +'</div>';

  const cta='<button class="hv-cta" data-hvcta="1" style="background:linear-gradient(135deg,'+c+','+c+'cc);box-shadow:0 8px 24px '+c+'44">🗓 احجز حصة في '+E(h.name)+'</button>';

  root.innerHTML=tabs+hero+grid+cta;
  root.style.display='';if(legacy)legacy.style.display='none';
  root.querySelectorAll('[data-hv]').forEach(b=>b.onclick=()=>renderHallsV20(b.dataset.hv));
  root.querySelectorAll('[data-hvs]').forEach(b=>b.onclick=()=>bookSectionV20(cur,b.dataset.hvs));
  const ct=root.querySelector('[data-hvcta]');if(ct)ct.onclick=()=>bookSectionV20(cur,null);
  const on=root.querySelector('.hv-tab.on');if(on&&root.offsetParent)try{on.scrollIntoView({inline:'center',block:'nearest'});}catch(e){}
}

function bookSectionV20(hid,sid){
  goP('p-book');
  setTimeout(()=>{
    const hs=document.getElementById('b-hall');
    if(hs){if(![...hs.options].some(o=>o.value===hid))syncBookingHallsV20();hs.value=hid;if(typeof updBkS==='function')updBkS();}
    const ss=document.getElementById('b-sec');if(ss&&sid)ss.value=String(sid);
  },150);
}

function syncBookingHallsV20(){
  const sel=document.getElementById('b-hall'),D=window.HALLS_V20;if(!sel||!D)return;
  const cur=sel.value,E=_hvEsc;
  sel.innerHTML=D.halls.map(h=>'<option value="'+E(h.id)+'">'+E(h.icon||'')+' '+E(h.name)+'</option>').join('');
  if(D.halls.some(h=>h.id===cur))sel.value=cur;
  if(typeof updBkS==='function')updBkS();
}

function syncHomeHallsV20(){
  const D=window.HALLS_V20;if(!D)return;
  const cards=[...document.querySelectorAll('.subj[onclick*="swH("]')];if(!cards.length)return;
  const grid=cards[0].parentElement,keyOf=el=>((el.getAttribute('onclick')||'').match(/swH\('([^']+)'\)/)||[])[1];
  const count=id=>D.secs.filter(s=>s.category===id).length;
  cards.forEach(el=>{
    const k=keyOf(el),h=D.halls.find(x=>x.id===k);
    el.style.display=h?'':'none';
    if(h){const nm=el.querySelector('.subj-nm');if(nm)nm.textContent=h.name;const bd=el.querySelector('.subj-bd');if(bd)bd.textContent=count(k)+' أقسام';}
  });
  grid.querySelectorAll('[data-hall-v20]').forEach(x=>x.remove());
  const known=cards.map(keyOf);
  D.halls.filter(h=>!known.includes(h.id)).forEach(h=>{
    const c=_hvColor(h.color),n=count(h.id),d=document.createElement('div');
    d.className='subj';d.setAttribute('data-hall-v20',h.id);
    d.style.cssText='background:linear-gradient(145deg,'+c+'1f,'+c+'0a);border-color:'+c+'44';
    d.innerHTML=(n?'<div class="subj-bd">'+n+' أقسام</div>':'')+'<em class="subj-ic">'+_hvEsc(h.icon||'📚')+'</em><div class="subj-nm" style="color:'+c+'">'+_hvEsc(h.name)+'</div><div class="subj-ss">'+_hvEsc((h.description||'').slice(0,42))+'</div>';
    d.onclick=()=>{goP('p-halls');renderHallsV20(h.id);};
    grid.appendChild(d);
  });
}
function renderDomainStripV20(){
  const box=document.getElementById('dom-chips'),D=window.HALLS_V20;if(!box||!D||!D.halls.length)return;
  box.innerHTML=D.halls.map(h=>{const c=_hvColor(h.color);return '<span class="dom-chip" data-dh="'+_hvEsc(h.id)+'" style="border-color:'+c+'77;background:'+c+'1c">'+_hvEsc(h.icon||'📚')+' <span>'+_hvEsc(h.name)+'</span></span>';}).join('');
  try{const l=localStorage.getItem('mm_lang');if(l&&l!=='ar'&&window.__v14Translate)setTimeout(()=>window.__v14Translate(l),30);}catch(e){}
  box.querySelectorAll('[data-dh]').forEach(el=>el.onclick=()=>{goP('p-halls');renderHallsV20(el.dataset.dh);});
}

(function(){const _o=window.swH;window.swH=function(k){if(window.HALLS_V20&&document.getElementById('halls-v20')){renderHallsV20(k);return;}if(typeof _o==='function')return _o(k);};})();
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(loadHallsV20,300));else setTimeout(loadHallsV20,300);
