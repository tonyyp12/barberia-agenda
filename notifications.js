/* Web Push reception is prepared; server registration remains disabled until Cloudflare. */
window.AppointmentAlerts=(()=>{
  const prefsKey='barberia-alertas-v1';
  let prefs;try{prefs=JSON.parse(localStorage.getItem(prefsKey))||{};}catch{prefs={};}
  let seen=null,audio=null,registration=null;
  const supported=()=>isSecureContext&&'serviceWorker' in navigator&&'Notification' in window;
  const ready=supported()?navigator.serviceWorker.register('./sw.js').then(()=>navigator.serviceWorker.ready).then(r=>(registration=r)).catch(()=>null):Promise.resolve(null);
  const persist=()=>{try{localStorage.setItem(prefsKey,JSON.stringify(prefs));}catch{}};
  async function sound(){if(!prefs.sound||!audio||audio.state!=='running')return;try{const osc=audio.createOscillator(),gain=audio.createGain();osc.connect(gain);gain.connect(audio.destination);osc.frequency.value=740;gain.gain.setValueAtTime(.12,audio.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.35);osc.start();osc.stop(audio.currentTime+.35);}catch{}}
  async function show(test=false){
    if(!supported()||Notification.permission!=='granted')return false;
    const r=registration||await ready;if(!r)return false;
    try{await r.showNotification(test?'Prueba de notificaciones':'Nueva solicitud de cita',{body:test?'Las notificaciones están habilitadas en este dispositivo. Las alertas remotas se activarán con Cloudflare.':'Tienes una solicitud pendiente. Abre la agenda para revisarla.',tag:test?'barberia-prueba':'barberia-solicitudes',data:{url:new URL('./#solicitudes',document.baseURI).href}});return true;}catch{return false;}
  }
  function observe(appointments,manager){
    const ids=new Set(appointments.filter(a=>a.status==='pending').map(a=>a.id));
    if(seen!==null&&manager&&[...ids].some(id=>!seen.has(id))){sound();if(prefs.enabled)void show();}
    seen=ids;
  }
  function render(panel){
    const permission=supported()?Notification.permission:'unsupported';
    const status=permission==='granted'?(prefs.enabled?'Habilitadas en este dispositivo':'Permiso concedido; avisos desactivados'):permission==='denied'?'Bloqueadas en el navegador':permission==='unsupported'?'No disponibles en este navegador':'Pendiente de permiso';
    panel.innerHTML=`<h1>Que tu agenda se haga notar.</h1><p class="muted">Avisos para el encargado, en este dispositivo.</p><div class="layout"><section class="card"><h2>Notificaciones del celular</h2><p id="notification-status" role="status">${status}</p><button class="primary wide" id="enable-notifications" ${permission==='unsupported'||permission==='denied'?'disabled':''}>Activar notificaciones</button><button class="wide" id="test-notification" ${permission!=='granted'?'disabled':''}>Enviar notificación de prueba</button><button class="wide" id="disable-notifications">Desactivar avisos en este dispositivo</button><p class="hint">Si están bloqueadas, abre los permisos de este sitio en Chrome y permite las notificaciones. También deben estar habilitadas para Chrome en Android.</p><p class="hint">No podemos garantizar sonido ni entrega inmediata: dependen de internet, los permisos y la configuración del teléfono.</p></section><section class="card"><h2>Avisos dentro del panel</h2><p>Las solicitudes pendientes se muestran en un aviso visible y en el contador del menú.</p><label class="switch"><input type="checkbox" id="sound-alerts" ${prefs.sound?'checked':''}>Sonido con el panel abierto</label><button class="wide" id="test-sound">Activar y probar sonido</button><p class="hint">El navegador puede pedir una interacción para habilitar audio. Después de recargar, pulsa Probar sonido si no se escucha.</p><div class="notice"><strong>Prueba en GitHub Pages</strong><br>La notificación de prueba funciona en este dispositivo. Las nuevas solicitudes pueden avisar entre pestañas de este mismo navegador mientras el panel esté cargado.<br><br><strong>Pendiente de Cloudflare</strong><br>Recibir avisos de clientes desde otros dispositivos o con el panel cerrado requiere conectar el servidor de notificaciones push. Todavía no está activo.</div></section></div>`;
    const message=t=>{const el=document.querySelector('#notification-status');if(el)el.textContent=t;};
    document.querySelector('#enable-notifications').onclick=async()=>{
      try{const p=await Notification.requestPermission();if(p==='granted'){const r=await ready;if(!r){message('No se pudo preparar el servicio. Recarga y vuelve a intentarlo.');return;}prefs.enabled=true;persist();render(panel);}else{render(panel);}}catch{message('No se pudo solicitar el permiso. Abre esta página directamente en Chrome.');}
    };
    document.querySelector('#test-notification').onclick=async()=>message(await show(true)?'Prueba enviada. Revisa las notificaciones de tu dispositivo.':'No se pudo mostrar la prueba. Revisa los permisos de Chrome.');
    document.querySelector('#disable-notifications').onclick=()=>{prefs.enabled=false;persist();render(panel);};
    const enableAudio=async()=>{try{const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)throw Error();audio=audio||new Audio();await audio.resume();prefs.sound=true;persist();await sound();}catch{message('Este navegador no pudo reproducir el sonido.');}};
    document.querySelector('#sound-alerts').onchange=async e=>{prefs.sound=e.target.checked;persist();if(prefs.sound)await enableAudio();};
    document.querySelector('#test-sound').onclick=async()=>{await enableAudio();const box=document.querySelector('#sound-alerts');if(box)box.checked=!!prefs.sound;};
  }
  return {observe,render};
})();
