# Mantenimiento de Equipos — Ítalo

App aparte (no toca la ruleta) para llevar el control del mantenimiento de:
**aires acondicionados, refrigeradoras, freezers, bastidores, máquinas de hielo
y máquinas de producción** en las 5 sucursales.

Idea central: en vez de llevar fecha por unidad individual, cada fila del
panel es **un grupo por sucursal + categoría** (ej. "Aires acondicionados —
Sucursal 2"). Así, cuando el técnico visita una sucursal y hace todos los
aires de una vez, marcas un solo botón y quedan sincronizados — no se
desfasan entre sí.

## Qué hace

- Dashboard con semáforo: 🔴 vencido, 🟡 vence en ≤15 días, ⚪ sin fecha
  registrada todavía, 🟢 al día.
- Botón **"Marcar hecho hoy"** que registra la fecha y recalcula
  automáticamente la próxima según la frecuencia (por defecto 6 meses,
  editable a 4 o lo que necesites por grupo).
- **Historial** por grupo: queda guardado cada mantenimiento con fecha y
  quién lo hizo.
- Agregar / editar / eliminar grupos desde el panel (sin tocar código).
- **Vista para el técnico** en `/tecnico`: mismo panel pero sin edición ni
  borrado, solo ver pendientes e historial y marcar como hecho. Ese link es
  el que le compartes por WhatsApp.
- **Notificaciones por correo** (opcional, ver abajo) para que te llegue un
  aviso sin tener que entrar a revisar.

## Datos iniciales

Al arrancar por primera vez se crean automáticamente 5 sucursales
("Sucursal 1"…"Sucursal 5") con las 6 categorías, todas con frecuencia de
6 meses y sin fecha inicial. **Edita los nombres de sucursal y borra los
grupos que no apliquen** directamente desde el panel (no hace falta tocar
el código) — es solo un punto de partida.

## Correr en local

```bash
cd mantenimiento
npm install
npm start        # http://localhost:3000
```

## Desplegar en Render (gratis)

Este repo incluye `render.yaml` en la raíz apuntando a esta subcarpeta, así
que puedes usar un **Blueprint**:

1. En Render → **New → Blueprint**, conecta el repo `italo-ruleta`.
2. Render detecta `render.yaml` y crea el servicio `italo-mantenimiento`
   (plan **Free**), usando `mantenimiento/` como raíz — completamente
   separado del sitio de la ruleta.
3. Te va a pedir las variables de entorno marcadas como `sync: false`
   (`NOTIFY_TOKEN`, `GMAIL_USER`, `GMAIL_APP_PASSWORD`, `NOTIFY_TO`,
   `APP_URL`) — puedes dejarlas vacías si no quieres notificaciones por
   correo todavía y configurarlas después.
4. Al terminar el deploy vas a tener una URL tipo
   `https://italo-mantenimiento.onrender.com` — esa es la que revisas tú, y
   `https://italo-mantenimiento.onrender.com/tecnico` es la que le pasas al
   técnico.

**Nota sobre los datos:** se guardan en un archivo SQLite dentro del
servicio. En el plan Free de Render esos datos sobreviven mientras no hagas
un nuevo deploy (el servicio se "duerme" por inactividad y despierta solo,
sin perder datos). Si en algún momento vuelves a hacer `git push` con
cambios de código, sí se reinicia el disco — por eso conviene, una vez que
lo tengas configurado a tu gusto, evitar redeploys innecesarios. Si más
adelante quieres algo 100% a prueba de esto, se puede migrar a una base de
datos externa (Postgres gratis de Render, o Supabase) sin cambiar el resto
de la app.

## Notificaciones por correo (opcional pero recomendado)

La app no puede "despertarse sola" para avisarte en un plan gratis, pero sí
puede **responder cuando alguien la llama**. La solución simple: un
servicio externo gratuito que llama a un link de la app una vez al día.

1. En Render, ve a tu servicio → **Environment** y agrega:
   - `GMAIL_USER`: tu correo de Gmail (el que va a enviar el aviso).
   - `GMAIL_APP_PASSWORD`: una "contraseña de aplicación" de Gmail (no tu
     contraseña normal). Se genera en
     https://myaccount.google.com/apppasswords (necesitas verificación en
     dos pasos activada en esa cuenta de Gmail).
   - `NOTIFY_TO`: el correo (o correos separados por coma, si tu proveedor
     lo soporta) donde quieres recibir el aviso — puede ser el tuyo y el
     del técnico.
   - `NOTIFY_TOKEN`: cualquier palabra/clave secreta que inventes, ej.
     `italo2026xyz` — protege el link para que no lo dispare cualquiera.
   - `APP_URL`: la URL pública de tu servicio, ej.
     `https://italo-mantenimiento.onrender.com`.
2. Crea una cuenta gratis en **https://cron-job.org** (u otro servicio
   similar de cron gratuito).
3. Crea un cron job que llame, una vez al día (por ejemplo 8:00 am), a:
   ```
   https://TU-SERVICIO.onrender.com/api/notificar?token=TU_NOTIFY_TOKEN
   ```
4. Ese llamado revisa todos los equipos: si hay algo vencido o que vence en
   los próximos 15 días, te envía un correo con el resumen agrupado por
   sucursal. Si no hay nada pendiente, no envía nada (para no llenarte de
   correos innecesarios).

Esto resuelve justo el problema de "se me olvida revisar": el aviso llega
solo a tu correo, sin que tengas que acordarte de entrar.

## Compartir con el técnico

Envíale el link `/tecnico` (ej. por WhatsApp). Ahí puede:
- Ver qué está vencido o próximo, por sucursal.
- Marcar "Hecho hoy" cuando termine, dejando su nombre y quedando en el
  historial.

No puede agregar, editar frecuencias ni borrar equipos — eso queda solo en
el panel principal (sin login, es una herramienta interna simple; si más
adelante quieres protegerlo con contraseña, se puede agregar).

## Estructura

```
mantenimiento/
├─ server.js       Express: rutas API + sirve el frontend estático
├─ db.js           SQLite (better-sqlite3), esquema y semilla inicial
├─ notificar.js    Envío de correo de resumen (nodemailer + Gmail)
└─ public/
   ├─ index.html   Panel principal (admin)
   ├─ tecnico.html Panel simplificado para el técnico
   ├─ app.js       Lógica compartida (detecta modo técnico vs admin)
   └─ style.css
```
