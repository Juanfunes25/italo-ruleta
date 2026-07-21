const nodemailer = require('nodemailer');

function agruparPorSucursal(equipos) {
  const relevantes = equipos.filter((e) => e.estado === 'vencido' || e.estado === 'pronto' || e.estado === 'sin_fecha');
  const grupos = {};
  for (const e of relevantes) {
    if (!grupos[e.sucursal]) grupos[e.sucursal] = [];
    grupos[e.sucursal].push(e);
  }
  return grupos;
}

function textoEquipo(e) {
  if (e.estado === 'sin_fecha') return `   • ${e.categoria} (${e.nombre}) — nunca registrado, agregar fecha inicial`;
  if (e.estado === 'vencido') return `   • ${e.categoria} (${e.nombre}) — VENCIDO hace ${Math.abs(e.dias_restantes)} días (venció ${e.proxima_fecha})`;
  return `   • ${e.categoria} (${e.nombre}) — vence en ${e.dias_restantes} días (${e.proxima_fecha})`;
}

function construirMensaje(equipos) {
  const grupos = agruparPorSucursal(equipos);
  const sucursales = Object.keys(grupos);
  if (sucursales.length === 0) return null;

  let texto = 'Resumen de mantenimiento de equipos - Ítalo\n\n';
  for (const sucursal of sucursales.sort()) {
    texto += `${sucursal}:\n`;
    const items = grupos[sucursal].sort((a, b) => (a.dias_restantes ?? -9999) - (b.dias_restantes ?? -9999));
    for (const e of items) texto += textoEquipo(e) + '\n';
    texto += '\n';
  }
  texto += 'Entra al panel para marcar lo que ya se hizo.\n';
  if (process.env.APP_URL) texto += process.env.APP_URL + '\n';

  const totalVencidos = equipos.filter((e) => e.estado === 'vencido').length;
  const asunto = totalVencidos > 0
    ? `⚠️ Mantenimiento: ${totalVencidos} equipo(s) vencido(s)`
    : `Recordatorio de mantenimiento próximo`;

  return { asunto, texto };
}

async function enviarNotificacion(equipos) {
  const mensaje = construirMensaje(equipos);
  if (!mensaje) return { enviado: false, motivo: 'nada pendiente en los próximos 15 días' };

  const { GMAIL_USER, GMAIL_APP_PASSWORD, NOTIFY_TO } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !NOTIFY_TO) {
    return { enviado: false, motivo: 'faltan variables de entorno GMAIL_USER / GMAIL_APP_PASSWORD / NOTIFY_TO', mensaje };
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
  });

  await transporter.sendMail({
    from: GMAIL_USER,
    to: NOTIFY_TO,
    subject: mensaje.asunto,
    text: mensaje.texto,
  });

  return { enviado: true, asunto: mensaje.asunto };
}

module.exports = { enviarNotificacion, construirMensaje };
