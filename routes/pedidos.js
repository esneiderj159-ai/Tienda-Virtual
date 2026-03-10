const express = require('express');
const router = express.Router();
const db = require('../db');

const ESTADOS_VALIDOS = ['pendiente', 'procesando', 'enviado', 'entregado', 'cancelado'];

// ═══════════════════════════════════════
// GET /pedidos — Listar todos
// Filtros: ?estado=  ?usuarioId=
// Headers: Authorization, X-App-Source
// ═══════════════════════════════════════
router.get('/', (req, res) => {

  const token = req.headers['authorization'] || 'No proporcionado';
  const source = req.headers['x-app-source'] || 'No proporcionado';
  const { estado, usuarioId } = req.query;

  let sql = `
    SELECT p.*, u.nombre AS usuarioNombre
    FROM pedidos p
    LEFT JOIN usuarios u ON p.usuarioId = u.id
    WHERE 1=1
  `;
  const params = [];

  if (estado) params.push(estado);
  if (usuarioId) params.push(usuarioId);

  if (estado) sql += ' AND p.estado = ?';
  if (usuarioId) sql += ' AND p.usuarioId = ?';

  db.all(sql, params, (err, pedidos) => {
    if (err) return res.status(500).json({ success: false, message: err.message });

    if (pedidos.length === 0) {
      return res.json({
        success: true,
        total: 0,
        headers_recibidos: { authorization: token, 'x-app-source': source },
        data: []
      });
    }

    let completados = 0;
    pedidos.forEach((pedido, i) => {
      db.all(
        'SELECT pp.*, pr.nombre AS productoNombre FROM pedido_productos pp LEFT JOIN productos pr ON pp.productoId = pr.id WHERE pp.pedidoId = ?',
        [pedido.id],
        (err, items) => {
          pedidos[i].productos = items || [];
          completados++;
          if (completados === pedidos.length) {
            res.json({
              success: true,
              total: pedidos.length,
              headers_recibidos: { authorization: token, 'x-app-source': source },
              data: pedidos
            });
          }
        }
      );
    });
  });

});


// ═══════════════════════════════════════
// GET /pedidos/:id
// ═══════════════════════════════════════
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    'SELECT p.*, u.nombre AS usuarioNombre FROM pedidos p LEFT JOIN usuarios u ON p.usuarioId = u.id WHERE p.id = ?',
    [id],
    (err, pedido) => {
      if (err) return res.status(500).json({ success: false, message: err.message });
      if (!pedido) return res.status(404).json({ success: false, message: `Pedido con id ${id} no encontrado` });

      db.all(
        'SELECT pp.*, pr.nombre AS productoNombre FROM pedido_productos pp LEFT JOIN productos pr ON pp.productoId = pr.id WHERE pp.pedidoId = ?',
        [id],
        (err, items) => {
          pedido.productos = items || [];
          res.json({ success: true, data: pedido });
        }
      );
    }
  );

});


// ═══════════════════════════════════════
// POST /pedidos — Crear nuevo pedido
// Validaciones: usuarioId existe, productos válidos, cantidades > 0
// ═══════════════════════════════════════
router.post('/', (req, res) => {
  const { usuarioId, productos } = req.body;

  if (!usuarioId || !productos || !Array.isArray(productos) || productos.length === 0) {
    return res.status(400).json({
      success: false,
      message: 'usuarioId y productos (array con al menos 1 item) son obligatorios'
    });
  }

  for (const p of productos) {
    if (!p.productoId || !p.cantidad || !p.precioUnit) {
      return res.status(400).json({ success: false, message: 'Cada producto debe tener productoId, cantidad y precioUnit' });
    }
    if (!Number.isInteger(Number(p.cantidad)) || Number(p.cantidad) <= 0) {
      return res.status(400).json({ success: false, message: 'La cantidad debe ser un número entero mayor a 0' });
    }
    if (isNaN(p.precioUnit) || Number(p.precioUnit) <= 0) {
      return res.status(400).json({ success: false, message: 'precioUnit debe ser un número mayor a 0' });
    }
  }

  db.get('SELECT id FROM usuarios WHERE id = ?', [usuarioId], (err, usuario) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!usuario) return res.status(400).json({ success: false, message: `El usuario con id ${usuarioId} no existe` });

    const total = productos.reduce((sum, p) => sum + (Number(p.precioUnit) * Number(p.cantidad)), 0);

    db.run('INSERT INTO pedidos (usuarioId, total) VALUES (?, ?)', [usuarioId, total], function(err) {
      if (err) return res.status(500).json({ success: false, message: err.message });

      const pedidoId = this.lastID;
      let insertados = 0;

      productos.forEach(p => {
        db.run(
          'INSERT INTO pedido_productos (pedidoId, productoId, cantidad, precioUnit) VALUES (?, ?, ?, ?)',
          [pedidoId, p.productoId, Number(p.cantidad), Number(p.precioUnit)],
          (err) => {
            if (err) console.error('Error insertando producto en pedido:', err.message);
            insertados++;
            if (insertados === productos.length) {
              res.status(201).json({
                success: true,
                message: 'Pedido creado correctamente',
                data: { id: pedidoId, usuarioId, total, estado: 'pendiente', productos }
              });
            }
          }
        );
      });

    });
  });

});


// ═══════════════════════════════════════
// PUT /pedidos/:id — Actualizar estado
// ═══════════════════════════════════════
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  db.get('SELECT * FROM pedidos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!row) return res.status(404).json({ success: false, message: `Pedido con id ${id} no encontrado` });

    if (!estado) return res.status(400).json({ success: false, message: 'El campo estado es obligatorio' });
    if (!ESTADOS_VALIDOS.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado inválido. Valores permitidos: ${ESTADOS_VALIDOS.join(', ')}`
      });
    }

    db.run('UPDATE pedidos SET estado = ? WHERE id = ?', [estado, id], function(err) {
      if (err) return res.status(500).json({ success: false, message: err.message });
      res.json({
        success: true,
        message: 'Estado del pedido actualizado correctamente',
        data: { ...row, estado }
      });
    });
  });
});


// ═══════════════════════════════════════
// DELETE /pedidos/:id
// ═══════════════════════════════════════
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM pedidos WHERE id = ?', [id], (err, row) => {
    if (err) return res.status(500).json({ success: false, message: err.message });
    if (!row) return res.status(404).json({ success: false, message: `Pedido con id ${id} no encontrado` });

    db.run('DELETE FROM pedido_productos WHERE pedidoId = ?', [id], (err) => {
      if (err) return res.status(500).json({ success: false, message: err.message });

      db.run('DELETE FROM pedidos WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json({ success: false, message: err.message });

        res.json({ success: true, message: 'Pedido eliminado correctamente', data: row });
      });
    });
  });
});

module.exports = router;