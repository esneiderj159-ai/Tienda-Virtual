const express = require('express');
const router = express.Router();
const db = require('../db');

// ══════════════════════════════════════════
// GET /productos — Listar todos
// Filtros: ?nombre=  ?categoriaId=  ?activo=
// Lee header: Authorization
// ══════════════════════════════════════════
router.get('/', (req, res) => {
  const token = req.headers['authorization'] || 'No proporcionado';
  const { nombre, categoriaId, activo } = req.query;

  let sql = `
    SELECT p.*, c.nombre AS categoriaNombre
    FROM productos p
    LEFT JOIN categorias c ON p.categoriaId = c.id
    WHERE 1=1
  `;

  const params = [];

  if (nombre) {
    sql += ' AND p.nombre LIKE ?';
    params.push(`%${nombre}%`);
  }

  if (categoriaId) {
    sql += ' AND p.categoriaId = ?';
    params.push(categoriaId);
  }

  if (activo !== undefined) {
    sql += ' AND p.activo = ?';
    params.push(activo === 'true' ? 1 : 0);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    res.json({
      success: true,
      total: rows.length,
      authorization_header: token,
      data: rows
    });
  });
});


// ══════════════════════════════════════════
// GET /productos/:id
// ══════════════════════════════════════════
router.get('/:id', (req, res) => {
  const { id } = req.params;

  db.get(
    `
    SELECT p.*, c.nombre AS categoriaNombre
    FROM productos p
    LEFT JOIN categorias c ON p.categoriaId = c.id
    WHERE p.id = ?
    `,
    [id],
    (err, row) => {
      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: `Producto con id ${id} no encontrado`
        });
      }

      res.json({ success: true, data: row });
    }
  );
});


// ══════════════════════════════════════════
// POST /productos — Crear producto
// ══════════════════════════════════════════
router.post('/', (req, res) => {
  const { nombre, precio, categoriaId, stock } = req.body;

  if (!nombre || precio === undefined || !categoriaId) {
    return res.status(400).json({
      success: false,
      message: 'Los campos nombre, precio y categoriaId son obligatorios'
    });
  }

  if (nombre.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'El nombre no puede estar vacío'
    });
  }

  if (isNaN(precio) || Number(precio) <= 0) {
    return res.status(400).json({
      success: false,
      message: 'precio debe ser un número mayor a 0'
    });
  }

  if (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
    return res.status(400).json({
      success: false,
      message: 'stock debe ser un número entero mayor o igual a 0'
    });
  }

  db.get(
    'SELECT id FROM categorias WHERE id = ?',
    [categoriaId],
    (err, cat) => {

      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      if (!cat) {
        return res.status(400).json({
          success: false,
          message: `La categoría con id ${categoriaId} no existe`
        });
      }

      db.run(
        `
        INSERT INTO productos (nombre, precio, categoriaId, stock)
        VALUES (?, ?, ?, ?)
        `,
        [nombre.trim(), Number(precio), Number(categoriaId), Number(stock) || 0],
        function (err) {

          if (err) {
            return res.status(500).json({ success: false, message: err.message });
          }

          res.status(201).json({
            success: true,
            message: 'Producto creado correctamente',
            data: {
              id: this.lastID,
              nombre: nombre.trim(),
              precio: Number(precio),
              categoriaId: Number(categoriaId),
              stock: Number(stock) || 0,
              activo: 1
            }
          });
        }
      );
    }
  );
});


// ══════════════════════════════════════════
// PUT /productos/:id — Actualizar producto
// ══════════════════════════════════════════
router.put('/:id', (req, res) => {

  const { id } = req.params;
  const { nombre, precio, categoriaId, stock, activo } = req.body;

  db.get('SELECT * FROM productos WHERE id = ?', [id], (err, row) => {

    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: `Producto con id ${id} no encontrado`
      });
    }

    if (precio !== undefined && (isNaN(precio) || Number(precio) <= 0)) {
      return res.status(400).json({
        success: false,
        message: 'precio debe ser un número mayor a 0'
      });
    }

    if (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'stock debe ser un número entero mayor o igual a 0'
      });
    }

    const nuevoNombre = nombre !== undefined ? nombre.trim() : row.nombre;
    const nuevoPrecio = precio !== undefined ? Number(precio) : row.precio;
    const nuevoCategoriaId = categoriaId !== undefined ? Number(categoriaId) : row.categoriaId;
    const nuevoStock = stock !== undefined ? Number(stock) : row.stock;
    const nuevoActivo = activo !== undefined ? (activo ? 1 : 0) : row.activo;

    db.run(
      `
      UPDATE productos
      SET nombre = ?, precio = ?, categoriaId = ?, stock = ?, activo = ?
      WHERE id = ?
      `,
      [nuevoNombre, nuevoPrecio, nuevoCategoriaId, nuevoStock, nuevoActivo, id],
      function (err) {

        if (err) {
          return res.status(500).json({ success: false, message: err.message });
        }

        res.json({
          success: true,
          message: 'Producto actualizado correctamente',
          data: {
            id: parseInt(id),
            nombre: nuevoNombre,
            precio: nuevoPrecio,
            categoriaId: nuevoCategoriaId,
            stock: nuevoStock,
            activo: nuevoActivo
          }
        });
      }
    );
  });
});


// ══════════════════════════════════════════
// DELETE /productos/:id
// ══════════════════════════════════════════
router.delete('/:id', (req, res) => {

  const { id } = req.params;

  db.get('SELECT * FROM productos WHERE id = ?', [id], (err, row) => {

    if (err) {
      return res.status(500).json({ success: false, message: err.message });
    }

    if (!row) {
      return res.status(404).json({
        success: false,
        message: `Producto con id ${id} no encontrado`
      });
    }

    db.run('DELETE FROM productos WHERE id = ?', [id], (err) => {

      if (err) {
        return res.status(500).json({ success: false, message: err.message });
      }

      res.json({
        success: true,
        message: 'Producto eliminado correctamente',
        data: row
      });
    });
  });
});

module.exports = router;