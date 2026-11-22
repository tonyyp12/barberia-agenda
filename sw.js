'use strict';
// No fetch cache: GitHub Pages continues serving the newest HTML/CSS/JS.
self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
  // Payload intentionally excludes client names and phone numbers from lock screens.
  event.waitUntil(self.registration.showNotification('Nueva solicitud de cita',{
    body:'Tienes una solicitud pendiente. Abre la agenda para revisarla.',
    tag:'barberia-solicitudes',data:{url:new URL('./#solicitudes',self.registration.scope).href}
  }));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();
  const url=new URL('./#solicitudes',self.registration.scope).href;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async windows=>{
    for(const client of windows){if(client.url.startsWith(self.registration.scope)&&'focus' in client){await client.navigate(url);return client.focus();}}
    return self.clients.openWindow(url);
  }));
});
