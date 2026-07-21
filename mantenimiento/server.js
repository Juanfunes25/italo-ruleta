const path = require('path');
const express = require('express');
const { db, SUCURSALES, CATEGORIAS } = require('./db');
const { enviarNotificacion } = require('./notificar');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DIA_MS = 24 * 60 * 60 * 1000;

function hoyISO() {
  return new Date().toISOString().slice(0, 10);
}

function sumarMeses(fechaISO, meses) {
  const d = new Date(fechaISO + 'T00:00:00');
  d.setMonth(d.getMonth() + meses);
  return d.toISOString().slice(0, 10);
}

function calcularEstado(equipo) {
  if (!equipo.ultima_fecha) {
    return { ...equipo, proxima_fecha: null, dias_restantes: null, estado: 'sin_fecha' };
  }
  const proxima_fecha = sumarMeses(equipo.ultima_fecha, equipo.frecuencia_meses);
  const hoy = new Date(hoyISO() + 'T00:00:00');
  const prox = new Date(proxima_fecha + 'T00:00:00');
  const dias_restantes = Math.round((prox - hoy) / DIA_MS);
  let estado = 'ok';
  if (dias_restantes < 0) estado = 'vencido';
  else if (dias_restantes <= 15) estado = 'pronto';
  return { ...equipo, proxima_fecha, dias_restantes, estado };
}

function listarEquipos() {
  const equipos = db.prepare('SELECT * FROM equipos ORDER BY sucursal, categoria').all();
  return equipos.map(calcularEstado);
}

// ---- API ----

app.get('/api/equipos', (req, res) => {
  res.json(listarEquipos());
});

app.get('/api/meta', (req, res) => {
  res.json({ sucursales: SUCURSALES, categorias: CATEGORIAS.map((c) => c.nombre) });
});

app.post('/api/equipos', (req, res) => {
  const { sucursal, categoria, nombre, frecuencia_meses, ultima_fecha, notas } = req.body;
  if (!sucursal || !categoria || !nombre) {
    return res.status(400).json({ error: 'sucursal, categoria y nombre son obligatorios' });
  }
  const info = db
    .prepare(
      `INSERT INTO equipos (sucursal, categoria, nombre, frecuencia_meses, ultima_fecha, notas)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .run(sucursal, categoria, nombre, Number(frecuencia_meses) || 6, ultima_fecha || null, notas || '');
  res.json({ id: info.lastInsertRowid });
});

app.put('/api/equipos/:id', (req, res) => {
  const { nombre, frecuencia_meses, notas, ultima_fecha } = req.body;
  const equipo = db.prepare('SELECT * FROM equipos WHERE id = ?').get(req.params.id);
  if (!equipo) return res.status(404).json({ error: 'no encontrado' });
  db.prepare(
    `UPDATE equipos SET nombre = ?, frecuencia_meses = ?, notas = ?, ultima_fecha = ? WHERE id = ?`
  ).run(
    nombre ?? equipo.nombre,
    Number(frecuencia_meses) || equipo.frecuencia_meses,
    notas ?? equipo.notas,
    ultima_fecha === undefined ? equipo.ultima_fecha : ultima_fecha,
    req.params.id
  );
  res.json({ ok: true });
});

app.delete('/api/equipos/:id', (req, res) => {
  db.prepare('DELETE FROM historial WHERE equipo_id = ?').run(req.params.id);
  db.prepare('DELETE FROM equipos WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

app.post('/api/equipos/:id/completar', (req, res) => {
  const equipo = db.prepare('SELECT * FROM equipos WHERE id = ?').get(req.params.id);
  if (!equipo) return res.status(404).json({ error: 'no encontrado' });
  const fecha = req.body.fecha || hoyISO();
  const quien = req.body.quien || '';
  const nota = req.body.nota || '';
  db.prepare('UPDATE equipos SET ultima_fecha = ? WHERE id = ?').run(fecha, equipo.id);
  db.prepare(
    'INSERT INTO historial (equipo_id, fecha_completado, quien, nota) VALUES (?, ?, ?, ?)'
  ).run(equipo.id, fecha, quien, nota);
  res.json({ ok: true });
});

app.get('/api/equipos/:id/historial', (req, res) => {
  const rows = db
    .prepare('SELECT * FROM historial WHERE equipo_id = ? ORDER BY fecha_completado DESC, id DESC')
    .all(req.params.id);
  res.json(rows);
});

// Endpoint para el chequeo/notificación diaria (llamado por un cron externo gratuito, ej. cron-job.org)
app.get('/api/notificar', async (req, res) => {
  const token = req.query.token;
  if (!process.env.NOTIFY_TOKEN || token !== process.env.NOTIFY_TOKEN) {
    return res.status(401).json({ error: 'token inválido' });
  }
  try {
    const resultado = await enviarNotificacion(listarEquipos());
    res.json(resultado);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/tecnico', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'tecnico.html'));
});

app.get('/healthz', (req, res) => res.send('ok'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Mantenimiento Ítalo escuchando en puerto ${PORT}`);
});
