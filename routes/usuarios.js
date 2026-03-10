const express = require('express');
const router = express.Router();
const db = require('../db');

// ═══════════════════════════════════════
// GET /usuarios — Listar todos
// Filtros: ?rol= ?activo= ?nombre=
// Header: Authorization
// ═══════════════════════════════════════
router.get('/', (req, res) => {

  const token = req.headers['authorization'] || 'No proporcionado';
  const { nombre, rol, activo } = req.query;

  let sql = 'SELECT * FROM usuarios WHERE 1=1';
  const params = [];

  if (nombre) {
    sql += ' AND nombre LIKE ?';
    params.push(`%${nombre}%`);
  }

  if (rol) {
    sql += ' AND rol = ?';
    params.push(rol);
  }

  if (activo !== undefined) {
    sql += ' AND activo = ?';
    params.push(activo === 'true' ? 1 : 0);
  }

  db.all(sql, params, (err, rows) => {

    if (err) {
      return res.status(500).json({
        success: false,
        message: err.message
      });
    }

    res.json({
      success: true,
      total: rows.length,
      authorization_header: token,
      data: rows
    });

  });

});


// ═══════════════════════════════════════
// GET /usuarios/:id
// ═══════════════════════════════════════
router.get('/:id', (req, res) => {

  const { id } = req.params;

  db.get(
    'SELECT * FROM usuarios WHERE id = ?',
    [id],
    (err, row) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: `Usuario con id ${id} no encontrado`
        });
      }

      res.json({
        success: true,
        data: row
      });

    }
  );

});


// ═══════════════════════════════════════
// POST /usuarios — Crear usuario
// ═══════════════════════════════════════
router.post('/', (req, res) => {

  const { nombre, email, rol } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({
      success: false,
      message: 'Los campos nombre y email son obligatorios'
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: 'El formato del email no es válido'
    });
  }

  const rolesValidos = ['admin', 'cliente', 'vendedor'];

  if (rol && !rolesValidos.includes(rol)) {
    return res.status(400).json({
      success: false,
      message: `rol debe ser uno de: ${rolesValidos.join(', ')}`
    });
  }

  db.get(
    'SELECT id FROM usuarios WHERE email = ?',
    [email.toLowerCase()],
    (err, row) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (row) {
        return res.status(400).json({
          success: false,
          message: `El email "${email}" ya está registrado`
        });
      }

      db.run(
        'INSERT INTO usuarios (nombre, email, rol) VALUES (?, ?, ?)',
        [nombre.trim(), email.toLowerCase(), rol || 'cliente'],
        function (err) {

          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message
            });
          }

          res.status(201).json({
            success: true,
            message: 'Usuario registrado correctamente',
            data: {
              id: this.lastID,
              nombre: nombre.trim(),
              email: email.toLowerCase(),
              rol: rol || 'cliente',
              activo: 1
            }
          });

        }
      );

    }
  );

});


// ═══════════════════════════════════════
// PUT /usuarios/:id — Actualizar usuario
// ═══════════════════════════════════════
router.put('/:id', (req, res) => {

  const { id } = req.params;
  const { nombre, email, rol, activo } = req.body;

  db.get(
    'SELECT * FROM usuarios WHERE id = ?',
    [id],
    (err, row) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: `Usuario con id ${id} no encontrado`
        });
      }

      const rolesValidos = ['admin', 'cliente', 'vendedor'];

      if (rol && !rolesValidos.includes(rol)) {
        return res.status(400).json({
          success: false,
          message: `rol debe ser uno de: ${rolesValidos.join(', ')}`
        });
      }

      if (email) {

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
          return res.status(400).json({
            success: false,
            message: 'El formato del email no es válido'
          });
        }

      }

      const nuevoNombre = nombre !== undefined ? nombre.trim() : row.nombre;
      const nuevoEmail = email !== undefined ? email.toLowerCase() : row.email;
      const nuevoRol = rol !== undefined ? rol : row.rol;
      const nuevoActivo = activo !== undefined ? (activo ? 1 : 0) : row.activo;

      db.run(
        'UPDATE usuarios SET nombre = ?, email = ?, rol = ?, activo = ? WHERE id = ?',
        [nuevoNombre, nuevoEmail, nuevoRol, nuevoActivo, id],
        function (err) {

          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message
            });
          }

          res.json({
            success: true,
            message: 'Usuario actualizado correctamente',
            data: {
              id: parseInt(id),
              nombre: nuevoNombre,
              email: nuevoEmail,
              rol: nuevoRol,
              activo: nuevoActivo
            }
          });

        }
      );

    }
  );

});


// ═══════════════════════════════════════
// DELETE /usuarios/:id
// ═══════════════════════════════════════
router.delete('/:id', (req, res) => {

  const { id } = req.params;

  db.get(
    'SELECT * FROM usuarios WHERE id = ?',
    [id],
    (err, row) => {

      if (err) {
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      if (!row) {
        return res.status(404).json({
          success: false,
          message: `Usuario con id ${id} no encontrado`
        });
      }

      db.run(
        'DELETE FROM usuarios WHERE id = ?',
        [id],
        (err) => {

          if (err) {
            return res.status(500).json({
              success: false,
              message: err.message
            });
          }

          res.json({
            success: true,
            message: 'Usuario eliminado correctamente',
            data: row
          });

        }
      );

    }
  );

});

module.exports = router;