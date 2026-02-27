const express = require('express');
const router = express.Router();

// Base de datos en memoria
let pedidos = [
  {
    id: 1,
    usuarioId: 2,
    productos: [
      { productoId: 1, nombre: 'Laptop HP 15"',    cantidad: 1, precioUnit: 2500000 },
      { productoId: 3, nombre: 'Auriculares BT',   cantidad: 2, precioUnit: 180000  }
    ],
    total: 2860000,
    estado: 'entregado',
    fecha: '2025-01-15'
  },
  {
    id: 2,
    usuarioId: 3,
    productos: [
      { productoId: 2, nombre: 'Camisa Polo Azul', cantidad: 3, precioUnit: 75000 }
    ],
    total: 225000,
    estado: 'pendiente',
    fecha: '2025-02-20'
  },
];
let nextId = 3;

const ESTADOS_VALIDOS = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

// GET /pedidos - Obtener todos (con filtro por estado, usuarioId)
// Ejemplo: GET /pedidos?estado=pendiente  |  GET /pedidos?usuarioId=2
router.get('/', (req, res) => {
  const token  = req.headers['authorization']  || 'No proporcionado';
  const source = req.headers['x-app-source']   || 'No proporcionado';
  const filtros = req.query;
  let data = [...pedidos];

  if (Object.keys(filtros).length > 0) {
    data = data.filter(p =>
      Object.entries(filtros).every(([k, v]) =>
        p[k] !== undefined &&
        p[k].toString().toLowerCase().includes(v.toLowerCase())
      )
    );
  }

  res.json({
    success: true,
    total: data.length,
    filtros_aplicados: filtros,
    headers_recibidos: { authorization: token, 'x-app-source': source },
    data
  });
});

// GET /pedidos/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const pedido = pedidos.find(p => p.id === id);

  if (!pedido) {
    return res.status(404).json({ success: false, message: `Pedido con id ${id} no encontrado` });
  }

  res.json({ success: true, data: pedido });
});

// POST /pedidos - Crear nuevo pedido
router.post('/', (req, res) => {
  const { usuarioId, productos } = req.body;

  if (!usuarioId || !productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios: usuarioId, productos (array con al menos 1 item)'
    });
  }

  // Calcular total automáticamente
  const total = productos.reduce((sum, p) => sum + (p.precioUnit * p.cantidad), 0);

  const nuevo = {
    id: nextId++,
    usuarioId,
    productos,
    total,
    estado: 'pendiente',
    fecha: new Date().toISOString().split('T')[0]
  };

  pedidos.push(nuevo);
  res.status(201).json({ success: true, message: 'Pedido creado correctamente', data: nuevo });
});

// PUT /pedidos/:id - Actualizar estado del pedido
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = pedidos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: `Pedido con id ${id} no encontrado` });
  }

  const { estado, productos, total } = req.body;

  if (estado !== undefined) {
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Estados permitidos: ${ESTADOS_VALIDOS.join(', ')}`
      });
    }
    pedidos[index].estado = estado;
  }
  if (productos !== undefined) pedidos[index].productos = productos;
  if (total    !== undefined)  pedidos[index].total     = total;

  res.json({ success: true, message: 'Pedido actualizado correctamente', data: pedidos[index] });
});

// DELETE /pedidos/:id - Cancelar/eliminar pedido
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = pedidos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: `Pedido con id ${id} no encontrado` });
  }

  const eliminado = pedidos.splice(index, 1)[0];
  res.json({ success: true, message: 'Pedido cancelado/eliminado correctamente', data: eliminado });
});

module.exports = router;