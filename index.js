const express = require('express');
const app = express();

app.use(express.json());

// Registrar rutas
app.use('/productos',  require('./routes/productos'));
app.use('/categorias', require('./routes/categorias'));
app.use('/usuarios',   require('./routes/usuarios'));
app.use('/pedidos',    require('./routes/pedidos'));

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API Tienda Virtual - SENA',
    version: '1.0.0',
    endpoints: ['/productos', '/categorias', '/usuarios', '/pedidos']
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

const server = app.listen(3000, () =>
  console.log(`API Tienda Virtual corriendo en http://localhost:${server.address().port}`)
);
