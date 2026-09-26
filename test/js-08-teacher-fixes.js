
/* V8.1 micro-fixes: legacy ijaza image + reviews safety. */
(function(){
  const _baseNormalize = normalizeTeacher;
  normalizeTeacher = function(raw){
    const n = _baseNormalize(raw);
    if(raw && raw.ijaza_image_data) n.ijazaImage = raw.ijaza_image_data;
    if(raw && raw.teacher_id) n.id = raw.teacher_id;
    if(raw && raw.profile_id) n.profile_id = raw.profile_id;
    if(raw && raw.bookable !== undefined) n.bookable = !!raw.bookable;
    return n;
  };
  window.loadTeacherReviews = async function(tid){
    if(String(tid||'').startsWith('legacy:')){
      const el=document.getElementById('tp-reviews');
      if(el) el.innerHTML='<div style="padding:.8rem;color:var(--tm);font-size:.68rem">لا توجد تقييمات مرتبطة بهذا الملف القديم بعد.</div>';
      return;
    }
    try{
      if(!_sb)return;
      const {data,error}=await _sb.from('public_reviews').select('*').eq('teacher_id',tid).order('created_at',{ascending:false}).limit(5);
      if(error)throw error;
      const el=document.getElementById('tp-reviews');if(!el)return;
      if(!data?.length){el.innerHTML='<div style="padding:.8rem;color:var(--tm);font-size:.68rem">لا توجد تقييمات بعد.</div>';return;}
      el.innerHTML=data.map(r=>{const nm=escapeHtml(r.student_name||'طالب'),cm=escapeHtml(r.comment||''),rr=Math.max(0,Math.min(5,Number(r.rating)||0));return '<div class="tp-rev"><div class="tp-rev-hd"><div class="tp-rev-av">'+nm[0]+'</div><div><div class="tp-rev-nm">'+nm+'</div><div class="tp-rev-dt">'+new Date(r.created_at).toLocaleDateString('ar-EG')+'</div></div><div class="tp-rev-stars" style="margin-right:auto">'+'★'.repeat(rr)+'☆'.repeat(5-rr)+'</div></div>'+(cm?'<div class="tp-rev-txt">"'+cm+'"</div>':'')+'</div>';}).join('');
    }catch(e){console.warn('loadTeacherReviews:',e.message||e);}
  };
})();
