const MODO_TECNICO = window.MODO_TECNICO === true;

const ESTADO_LABEL = {
  vencido: 'Vencido',
  pronto: 'Próximo',
  ok: 'Al día',
  sin_fecha: 'Sin fecha',
};
const ESTADO_COLOR = {
  vencido: 'rojo',
  pronto: 'amarillo',
  ok: 'verde',
  sin_fecha: 'gris',
};

let equipos = [];
let filtroEstado = 'activos'; // activos = vencido+pronto+sin_fecha

function fmtFecha(iso) {
  if (!iso) return '—';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

async function cargar() {
  const res = await fetch('/api/equipos');
  equipos = await res.json();
  renderResumen();
  renderLista();
}

function renderResumen() {
  const cont = document.getElementById('resumen');
  const conteos = { vencido: 0, pronto: 0, ok: 0, sin_fecha: 0 };
  for (const e of equipos) conteos[e.estado]++;
  cont.innerHTML = `
    <div class="chip todos ${filtroEstado === 'activos' ? 'activo' : ''}" data-f="activos">⚠️ Pendientes (${conteos.vencido + conteos.pronto + conteos.sin_fecha})</div>
    <div class="chip rojo ${filtroEstado === 'vencido' ? 'activo' : ''}" data-f="vencido">Vencidos (${conteos.vencido})</div>
    <div class="chip amarillo ${filtroEstado === 'pronto' ? 'activo' : ''}" data-f="pronto">Próximos 15 días (${conteos.pronto})</div>
    <div class="chip gris ${filtroEstado === 'sin_fecha' ? 'activo' : ''}" data-f="sin_fecha">Sin fecha (${conteos.sin_fecha})</div>
    <div class="chip verde ${filtroEstado === 'todos' ? 'activo' : ''}" data-f="todos">Ver todos (${equipos.length})</div>
  `;
  cont.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      filtroEstado = chip.dataset.f;
      renderResumen();
      renderLista();
    });
  });
}

function pasaFiltro(e) {
  if (filtroEstado === 'todos') return true;
  if (filtroEstado === 'activos') return e.estado !== 'ok';
  return e.estado === filtroEstado;
}

function renderLista() {
  const cont = document.getElementById('contenedor');
  const porSucursal = {};
  for (const e of equipos) {
    if (!pasaFiltro(e)) continue;
    (porSucursal[e.sucursal] ||= []).push(e);
  }
  const sucursales = Object.keys(porSucursal).sort();
  if (sucursales.length === 0) {
    cont.innerHTML = '<div class="vacio">Nada que mostrar con este filtro 🎉</div>';
    return;
  }
  cont.innerHTML = sucursales
    .map((suc) => {
      const items = porSucursal[suc].sort((a, b) => (a.dias_restantes ?? -9999) - (b.dias_restantes ?? -9999));
      return `
      <div class="sucursal-bloque">
        <div class="sucursal-titulo">${suc}</div>
        ${items.map(filaEquipo).join('')}
      </div>`;
    })
    .join('');

  cont.querySelectorAll('[data-completar]').forEach((btn) => {
    btn.addEventListener('click', () => completar(btn.dataset.completar));
  });
  cont.querySelectorAll('[data-historial]').forEach((btn) => {
    btn.addEventListener('click', () => verHistorial(btn.dataset.historial));
  });
  if (!MODO_TECNICO) {
    cont.querySelectorAll('[data-editar]').forEach((btn) => {
      btn.addEventListener('click', () => abrirEditar(btn.dataset.editar));
    });
    cont.querySelectorAll('[data-eliminar]').forEach((btn) => {
      btn.addEventListener('click', () => eliminar(btn.dataset.eliminar));
    });
  }
}

function filaEquipo(e) {
  const color = ESTADO_COLOR[e.estado];
  const detalleFecha =
    e.estado === 'sin_fecha'
      ? 'Nunca registrado — agrega una fecha inicial'
      : `Última: ${fmtFecha(e.ultima_fecha)} · Próxima: ${fmtFecha(e.proxima_fecha)} (${e.dias_restantes >= 0 ? e.dias_restantes + ' días' : 'hace ' + Math.abs(e.dias_restantes) + ' días'})`;

  const accionesAdmin = MODO_TECNICO
    ? ''
    : `
      <button class="accion" data-editar="${e.id}">Editar</button>
      <button class="accion eliminar" data-eliminar="${e.id}">Eliminar</button>
    `;

  return `
    <div class="equipo-fila">
      <div class="equipo-info">
        <span class="badge ${color}">${ESTADO_LABEL[e.estado]}</span>
        <span class="equipo-nombre">${e.categoria} — ${e.nombre}</span>
        <div class="equipo-fecha">${detalleFecha}</div>
      </div>
      <div class="acciones">
        <button class="accion completar" data-completar="${e.id}">✅ Marcar hecho hoy</button>
        <button class="accion" data-historial="${e.id}">Historial</button>
        ${accionesAdmin}
      </div>
    </div>
  `;
}

async function completar(id) {
  const quien = MODO_TECNICO ? (prompt('¿Quién realizó el mantenimiento? (opcional)') || 'Técnico') : 'Encargado';
  await fetch(`/api/equipos/${id}/completar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quien }),
  });
  cargar();
}

async function verHistorial(id) {
  const res = await fetch(`/api/equipos/${id}/historial`);
  const rows = await res.json();
  const cont = document.getElementById('historialContenido');
  cont.innerHTML = rows.length
    ? `<ul class="historial-lista">${rows
        .map((r) => `<li>${fmtFecha(r.fecha_completado)} ${r.quien ? '— ' + r.quien : ''} ${r.nota ? '(' + r.nota + ')' : ''}</li>`)
        .join('')}</ul>`
    : '<p>Sin registros todavía.</p>';
  document.getElementById('dialogHistorial').showModal();
}

async function eliminar(id) {
  if (!confirm('¿Eliminar este equipo/grupo y su historial? Esta acción no se puede deshacer.')) return;
  await fetch(`/api/equipos/${id}`, { method: 'DELETE' });
  cargar();
}

// ---- Agregar (solo modo admin) ----
if (!MODO_TECNICO) {
  fetch('/api/meta')
    .then((r) => r.json())
    .then((meta) => {
      const sel = document.getElementById('selSucursal');
      sel.innerHTML = meta.sucursales.map((s) => `<option value="${s}">${s}</option>`).join('');
      const dl = document.getElementById('listaCategorias');
      dl.innerHTML = meta.categorias.map((c) => `<option value="${c}">`).join('');
    });

  document.getElementById('btnAgregar').addEventListener('click', () => {
    document.getElementById('dialogAgregar').showModal();
  });
  document.getElementById('btnCancelarAgregar').addEventListener('click', () => {
    document.getElementById('dialogAgregar').close();
  });
  document.getElementById('formAgregar').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(ev.target).entries());
    await fetch('/api/equipos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    ev.target.reset();
    document.getElementById('dialogAgregar').close();
    cargar();
  });

  document.getElementById('btnCancelarEditar').addEventListener('click', () => {
    document.getElementById('dialogEditar').close();
  });
  document.getElementById('formEditar').addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const data = Object.fromEntries(new FormData(ev.target).entries());
    await fetch(`/api/equipos/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    document.getElementById('dialogEditar').close();
    cargar();
  });
}

function abrirEditar(id) {
  const e = equipos.find((x) => String(x.id) === String(id));
  if (!e) return;
  const form = document.getElementById('formEditar');
  form.id.value = e.id;
  form.nombre.value = e.nombre;
  form.frecuencia_meses.value = e.frecuencia_meses;
  form.ultima_fecha.value = e.ultima_fecha || '';
  form.notas.value = e.notas || '';
  document.getElementById('dialogEditar').showModal();
}

document.getElementById('btnCerrarHistorial').addEventListener('click', () => {
  document.getElementById('dialogHistorial').close();
});

cargar();
