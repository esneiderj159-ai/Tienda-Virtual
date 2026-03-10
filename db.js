// db.js — Conexión a SQLite y creación de tablas
// Este archivo se importa en cada archivo de rutas para acceder a la base de datos.
// SQLite crea el archivo database.db automáticamente si no existe.

const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) console.error('Error conectando a la base de datos:', err.message);
  else console.log('✅ Base de datos SQLite conectada → database.db');
});

// Activar llaves foráneas (FK) en SQLite — por defecto están desactivadas
db.run('PRAGMA foreign_keys = ON');

// ─────────────────────────────────────────────
// TABLA: categorias
// Debe crearse ANTES que productos porque productos tiene FK → categorias
// ─────────────────────────────────────────────
db.run(`
  CREATE TABLE IF NOT EXISTS categorias (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre      TEXT    NOT NULL UNIQUE,
    descripcion TEXT    DEFAULT '',
    activa      INTEGER NOT NULL DEFAULT 1 CHECK(activa IN (0,1))
  )
`, (err) => { if (err) console.error('Error creando tabla categorias:', err.message); });

// ─────────────────────────────────────────────
// TABLA: usuarios
// Se crea antes que pedidos porque pedidos tiene FK → usuarios
// ─────────────────────────────────────────────
db.run(`
  CREATE TABLE IF NOT EXISTS usuarios (
    id     INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre TEXT    NOT NULL,
    email  TEXT    NOT NULL UNIQUE,
    rol    TEXT    NOT NULL DEFAULT 'cliente' CHECK(rol IN ('admin','cliente','vendedor')),
    activo INTEGER NOT NULL DEFAULT 1 CHECK(activo IN (0,1))
  )
`, (err) => { if (err) console.error('Error creando tabla usuarios:', err.message); });

// ─────────────────────────────────────────────
// TABLA: productos
// FK: categoriaId → categorias.id
// ─────────────────────────────────────────────
db.run(`
  CREATE TABLE IF NOT EXISTS productos (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    nombre      TEXT    NOT NULL,
    precio      REAL    NOT NULL CHECK(precio > 0),
    categoriaId INTEGER NOT NULL,
    stock       INTEGER NOT NULL DEFAULT 0 CHECK(stock >= 0),
    activo      INTEGER NOT NULL DEFAULT 1 CHECK(activo IN (0,1)),
    FOREIGN KEY (categoriaId) REFERENCES categorias(id)
  )
`, (err) => { if (err) console.error('Error creando tabla productos:', err.message); });

// ─────────────────────────────────────────────
// TABLA: pedidos
// FK: usuarioId → usuarios.id
// ─────────────────────────────────────────────
db.run(`
  CREATE TABLE IF NOT EXISTS pedidos (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    usuarioId INTEGER NOT NULL,
    total     REAL    NOT NULL DEFAULT 0 CHECK(total >= 0),
    estado    TEXT    NOT NULL DEFAULT 'pendiente'
              CHECK(estado IN ('pendiente','procesando','enviado','entregado','cancelado')),
    fecha     TEXT    NOT NULL DEFAULT (date('now')),
    FOREIGN KEY (usuarioId) REFERENCES usuarios(id)
  )
`, (err) => { if (err) console.error('Error creando tabla pedidos:', err.message); });

// ─────────────────────────────────────────────
// TABLA: pedido_productos (tabla intermedia N:M)
// Relaciona pedidos con productos (un pedido puede tener muchos productos)
// ─────────────────────────────────────────────
db.run(`
  CREATE TABLE IF NOT EXISTS pedido_productos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    pedidoId   INTEGER NOT NULL,
    productoId INTEGER NOT NULL,
    cantidad   INTEGER NOT NULL CHECK(cantidad > 0),
    precioUnit REAL    NOT NULL CHECK(precioUnit > 0),
    FOREIGN KEY (pedidoId)   REFERENCES pedidos(id),
    FOREIGN KEY (productoId) REFERENCES productos(id)
  )
`, (err) => { if (err) console.error('Error creando tabla pedido_productos:', err.message); });

module.exports = db;