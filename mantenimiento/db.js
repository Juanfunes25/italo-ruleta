const path = require('path');
const Database = require('better-sqlite3');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'data.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS equipos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sucursal TEXT NOT NULL,
    categoria TEXT NOT NULL,
    nombre TEXT NOT NULL,
    frecuencia_meses INTEGER NOT NULL DEFAULT 6,
    ultima_fecha TEXT,
    notas TEXT DEFAULT '',
    creado_en TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS historial (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    equipo_id INTEGER NOT NULL,
    fecha_completado TEXT NOT NULL,
    quien TEXT DEFAULT '',
    nota TEXT DEFAULT '',
    registrado_en TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (equipo_id) REFERENCES equipos(id) ON DELETE CASCADE
  );
`);

const SUCURSALES = ['Sucursal 1', 'Sucursal 2', 'Sucursal 3', 'Sucursal 4', 'Sucursal 5'];
const CATEGORIAS = [
  { nombre: 'Aires acondicionados', frecuencia: 6 },
  { nombre: 'Refrigeradoras', frecuencia: 6 },
  { nombre: 'Freezers', frecuencia: 6 },
  { nombre: 'Bastidores', frecuencia: 6 },
  { nombre: 'Máquina de hielo', frecuencia: 6 },
  { nombre: 'Máquina de producción', frecuencia: 6 },
];

function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM equipos').get().c;
  if (count > 0) return;
  const insert = db.prepare(`
    INSERT INTO equipos (sucursal, categoria, nombre, frecuencia_meses)
    VALUES (@sucursal, @categoria, @nombre, @frecuencia)
  `);
  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });
  const rows = [];
  for (const sucursal of SUCURSALES) {
    for (const cat of CATEGORIAS) {
      rows.push({
        sucursal,
        categoria: cat.nombre,
        nombre: `${cat.nombre} - ${sucursal}`,
        frecuencia: cat.frecuencia,
      });
    }
  }
  insertMany(rows);
}

seedIfEmpty();

module.exports = { db, SUCURSALES, CATEGORIAS };
