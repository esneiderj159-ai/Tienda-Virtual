const express = require('express');
const app = express();

// Importar la conexión a la base de datos
require('./db');

// Middleware para leer JSON
app.use(express.json());

// Registrar rutas
app.use('/productos', require('./routes/productos'));
app.use('/categorias', require('./routes/categorias'));
app.use('/usuarios', require('./routes/usuarios'));
app.use('/pedidos', require('./routes/pedidos'));

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Tienda Virtual con SQLite - SENA Guía 2',
    version: '2.0.0',
    endpoints: [
      '/productos',
      '/categorias',
      '/usuarios',
      '/pedidos'
    ]
  });
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada'
  });
});

// Iniciar servidor
const PORT = 3000;

app.listen(PORT, () => {
  console.log(` API Tienda Virtual corriendo en http://localhost:${PORT}`);
});