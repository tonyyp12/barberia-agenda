# Agenda de barbería · Prototipo V1

Interfaz responsive en español, sin dependencias ni compilación. Abrir `index.html` o servir esta carpeta con `python -m http.server 8080`.

## Incluye
- Reserva pública de citas de una hora y disponibilidad por fecha.
- Panel de demostración: agenda, solicitudes, confirmación, rechazo, cancelación, reprogramación, atendida e inasistencia.
- Al confirmar aparece un mensaje editable y un enlace a WhatsApp; el encargado pulsa Enviar en WhatsApp. No se envían mensajes automáticamente.
- Horario habitual y excepciones por fecha, cierres y bloqueos. Se impiden cambios que afecten citas activas.
- Nombre y logo personalizables, vista previa y valores predeterminados.
- Solicitudes pendientes con vencimiento de dos horas, máximo dos citas futuras por teléfono.

## Límites de esta versión
Es una prueba de interfaz para GitHub Pages. Los datos se guardan en localStorage, solo en el navegador y origen actuales; no se comparten entre dispositivos. No hay autenticación real ni protección contra abuso en servidor. No introducir datos reales ni usar como agenda de producción. El nombre/logo también son locales durante esta prueba. No se configura Cloudflare ni D1 en esta etapa.

La disponibilidad se vuelve a revisar localmente al reservar. Evitar reservas simultáneas entre dispositivos exige el backend de Cloudflare y restricciones de base de datos, pendientes para la siguiente etapa.

## GitHub Pages
En el repositorio: **Settings → Pages → Build and deployment → Deploy from a branch → main → / (root) → Save**. No necesita npm, secretos ni GitHub Actions. Los recursos usan rutas relativas compatibles con un subdirectorio de Pages.

## Próxima etapa: Cloudflare
Conectar el almacenamiento mediante una API en Workers y D1, sesiones protegidas para el encargado, disponibilidad y confirmación transaccionales, validación de solicitudes en servidor, protección contra bots, almacenamiento del logo y respaldos. Mantener el envío manual por WhatsApp.
