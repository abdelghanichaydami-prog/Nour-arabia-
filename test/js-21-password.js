
/* [كلمة المرور] نافذة تعيين/تغيير كلمة المرور — تعمل للطالب والمعلم والمدير */
function mmOpenPasswordModal(isRecovery){
  if(typeof _sb==='undefined'||!_sb){toast('تعذّر الاتصال بالخادم','e');return;}
  if(document.getElementById('mm-pw-modal'))return;
  var w=document.createElement('div');w.id='mm-pw-modal';
  w.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:1rem';
  w.innerHTML='<div style="background:var(--bg2,#0f2b2b);border:1px solid rgba(212,175,106,.3);border-radius:16px;padding:1.2rem;width:100%;max-width:380px;direction:rtl">'
   +'<div style="font-size:.95rem;font-weight:800;color:var(--gl);margin-bottom:.4rem">🔑 كلمة مرور جديدة</div>'
   +'<div style="font-size:.7rem;color:var(--tm);margin-bottom:.8rem;line-height:1.7">'+(isRecovery?'أدخل كلمة مرور جديدة لحسابك.':'اختر كلمة مرور جديدة، 8 أحرف على الأقل.')+'</div>'
   +'<input type="password" id="mm-pw1" class="fc" placeholder="كلمة المرور الجديدة" autocomplete="new-password" style="margin-bottom:.5rem;width:100%">'
   +'<input type="password" id="mm-pw2" class="fc" placeholder="أعد كتابة كلمة المرور" autocomplete="new-password" style="margin-bottom:.8rem;width:100%">'
   +'<div style="display:flex;gap:.5rem"><button class="btn bgo" style="flex:1" id="mm-pw-save">حفظ كلمة المرور</button>'
   +'<button class="btn bgh" id="mm-pw-cancel">إلغاء</button></div></div>';
  document.body.appendChild(w);
  document.getElementById('mm-pw-cancel').onclick=function(){w.remove();};
  document.getElementById('mm-pw-save').onclick=async function(){
    var a=document.getElementById('mm-pw1').value,b=document.getElementById('mm-pw2').value;
    if(a.length<8){toast('كلمة المرور قصيرة: 8 أحرف على الأقل','e');return;}
    if(a!==b){toast('كلمتا المرور غير متطابقتين','e');return;}
    var btn=this;btn.disabled=true;
    try{
      var r=await _sb.auth.updateUser({password:a});
      if(r.error)throw r.error;
      w.remove();window.__mmRecovery=false;
      toast('تم تغيير كلمة المرور بنجاح','s');
    }catch(e){
      btn.disabled=false;
      toast('تعذّر تغيير كلمة المرور: '+(e.message||e),'e');
    }
  };
}
/* ترجمة نصوص النافذة */
(function(){var P=window.__V14P;if(!P)return;var d={
"🔑 كلمة مرور جديدة":{en:"🔑 New password",fr:"🔑 Nouveau mot de passe",es:"🔑 Nueva contraseña",de:"🔑 Neues Passwort",tr:"🔑 Yeni şifre",nl:"🔑 Nieuw wachtwoord",id:"🔑 Kata sandi baru"},
"أدخل كلمة مرور جديدة لحسابك.":{en:"Enter a new password for your account.",fr:"Saisissez un nouveau mot de passe pour votre compte.",es:"Introduce una nueva contraseña para tu cuenta.",de:"Gib ein neues Passwort für dein Konto ein.",tr:"Hesabın için yeni bir şifre gir.",nl:"Voer een nieuw wachtwoord in voor je account.",id:"Masukkan kata sandi baru untuk akunmu."},
"اختر كلمة مرور جديدة، 8 أحرف على الأقل.":{en:"Choose a new password, at least 8 characters.",fr:"Choisissez un nouveau mot de passe, 8 caractères minimum.",es:"Elige una nueva contraseña de al menos 8 caracteres.",de:"Wähle ein neues Passwort mit mindestens 8 Zeichen.",tr:"En az 8 karakterli yeni bir şifre seç.",nl:"Kies een nieuw wachtwoord van minstens 8 tekens.",id:"Pilih kata sandi baru, minimal 8 karakter."},
"حفظ كلمة المرور":{en:"Save password",fr:"Enregistrer le mot de passe",es:"Guardar contraseña",de:"Passwort speichern",tr:"Şifreyi kaydet",nl:"Wachtwoord opslaan",id:"Simpan kata sandi"},
"تغيير كلمة المرور":{en:"Change password",fr:"Changer le mot de passe",es:"Cambiar contraseña",de:"Passwort ändern",tr:"Şifreyi değiştir",nl:"Wachtwoord wijzigen",id:"Ubah kata sandi"},
"لحماية حسابك":{en:"To protect your account",fr:"Pour protéger votre compte",es:"Para proteger tu cuenta",de:"Zum Schutz deines Kontos",tr:"Hesabını korumak için",nl:"Om je account te beschermen",id:"Untuk melindungi akunmu"}
};for(var k in d)for(var c in d[k]){P[c]=P[c]||{};P[c][k]=d[k][c];}})();
