# Conexión pendiente a Cloudflare

No se ha creado ni desplegado ningún recurso de Cloudflare. La versión de Pages continúa siendo local y sin autenticación real. No usar datos reales.

## Implementado en la prueba
- Registro local de clientes, búsqueda desde Nueva cita, edición, archivo/reactivación, eliminación con confirmación e historial.
- El número se guarda con 10 dígitos; +52 se añade solo en el enlace a WhatsApp. Las citas antiguas con prefijo mexicano se migran sin cambiar la clave de almacenamiento.
- No se revelan datos del cliente al introducir su número en la reserva pública. Una coincidencia enlaza el cliente internamente y no modifica el nombre guardado.
- Menú y botón a la izquierda, indicador visible de solicitudes pendientes.
- Permiso de notificaciones solicitado solo tras pulsar Activar; prueba local mediante service worker. No se solicita al abrir la página.
- Sonido optativo tras interacción; recepción entre pestañas mediante storage mientras el panel está cargado. No es push entre dispositivos.
- sw.js preparado para recibir push y abrir Solicitudes, sin datos personales en la notificación.
- Limpieza manual con revisión: citas de más de 12 meses, rechazadas/vencidas de más de 60 días y bloqueos de más de 60 días. Conserva clientes. No hay borrado automático habilitado.

## Backend necesario
1. Servir el frontend en HTTPS con Workers y enlazar D1. Crear sesiones de encargado con cookie HttpOnly, Secure y SameSite; contraseñas derivadas y límites de intentos. Las rutas de clientes, configuración y suscripciones push requieren sesión. Ninguna credencial debe estar en el frontend o en Git.
2. Exponer API pública de horarios y solicitudes; validar fecha, hora, teléfono, Turnstile y límites de solicitudes en servidor. No exponer búsqueda de clientes, nombres ni historial públicamente. Buscar/enlazar el teléfono internamente en el backend.
3. Reservas y confirmaciones transaccionales: liberar pendientes vencidas primero, validar horario y bloqueos en servidor, impedir carreras entre creación, confirmación y bloqueos. Una restricción única evita dos citas activas del mismo horario; también validar solapamientos de intervalos y cambios de horario en transacciones.
4. Añadir GET /api/push/public-key, POST /api/push/subscriptions y DELETE /api/push/subscriptions con sesión y validación del origen/CSRF. Registrar PushSubscription exclusivamente en el dispositivo autorizado del encargado usando PushManager.subscribe({userVisibleOnly:true,applicationServerKey}). El permiso de notificación por sí solo NO registra push remoto.
5. Generar VAPID fuera del repositorio y guardar la clave privada como secreto. Guardar endpoints y claves de suscripción en D1, nunca devolverlos públicamente. Validar endpoints contra servicios push permitidos para evitar SSRF.
6. Insertar evento en notification_outbox en la misma transacción de la solicitud. Enviar Web Push desde Worker/Queue con reintentos y deduplicación; eliminar suscripciones HTTP 404/410; no confundir envío al proveedor con entrega al dispositivo. Mantener el contador y el aviso pendiente aunque falle el envío.
7. Añadir tarea programada para vencimiento y mantenimiento, respaldos y almacenamiento del logo fuera de D1. Aplicar la política de conservación aprobada sin eliminar clientes por inactividad automáticamente.
8. Probar Android Chrome con pantalla bloqueada, panel cerrado, varios dispositivos, permisos denegados, sin conexión, reintentos y caducidad. Comprobar sesión antes de mostrar datos al pulsar una notificación.

El origen y los permisos de GitHub Pages no se transfieren al dominio de Cloudflare. Hay que activar notificaciones otra vez en el dominio final. WhatsApp se mantiene manual; no necesita API ni envía mensajes automáticamente.
