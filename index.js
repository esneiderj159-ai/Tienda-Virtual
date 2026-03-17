// Cargar variables de entorno PRIMERO, antes de cualquier otra cosa
require('dotenv').config();

const express = require('express');
const app = express();

// Importar la conexión a la base de datos
require('./db');

// Middleware para leer JSON
app.use(express.json());

// ═══════════════════════════════════════════════════
// MIDDLEWARE DE AUTENTICACIÓN — Guía 3
// Todas las rutas requieren el header: password
// Si no se envía → 401 Unauthorized
// Si la password es incorrecta → 403 Forbidden
// ═══════════════════════════════════════════════════
app.use((req, res, next) => {
  const apiKey = req.headers['password'];

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API key requerida. Debes enviar el header: password'
    });
  }

  if (apiKey !== process.env.API_PASSWORD) {
    return res.status(403).json({
      success: false,
      message: 'Password incorrecta'
    });
  }

  // Si la password es correcta, continúa a la ruta
  next();
});

// Registrar rutas
app.use('/productos', require('./routes/productos'));
app.use('/categorias', require('./routes/categorias'));
app.use('/usuarios', require('./routes/usuarios'));
app.use('/pedidos', require('./routes/pedidos'));

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Tienda Virtual - SENA Guía 3 — Desplegada en Render',
    version: '3.0.0',
    entorno: process.env.NODE_ENV || 'development',
    endpoints: ['/productos', '/categorias', '/usuarios', '/pedidos']
  });
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// ═══════════════════════════════════════════════════
// PUERTO DINÁMICO
// Render asigna process.env.PORT automáticamente.
// En local usa 3000 como fallback.
// ═══════════════════════════════════════════════════
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`🚀 API Tienda Virtual corriendo en http://localhost:${server.address().port}`);
});