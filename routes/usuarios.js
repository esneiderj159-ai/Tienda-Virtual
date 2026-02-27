const express = require('express');
const router = express.Router();

// Base de datos en memoria
let usuarios = [
  { id: 1, nombre: 'Esneider Jiménez', email: 'esneider@email.com', rol: 'admin',    activo: true },
  { id: 2, nombre: 'María López',      email: 'maria@email.com',    rol: 'cliente',  activo: true },
  { id: 3, nombre: 'Carlos Ruiz',      email: 'carlos@email.com',   rol: 'cliente',  activo: true },
  { id: 4, nombre: 'Ana Gómez',        email: 'ana@email.com',      rol: 'vendedor', activo: false },
];
let nextId = 5;

// GET /usuarios - Obtener todos (con filtro dinámico por query params)
// Ejemplo: GET /usuarios?rol=admin  |  GET /usuarios?activo=true
router.get('/', (req, res) => {
  const token = req.headers['authorization'] || 'No proporcionado';
  const filtros = req.query;
  let data = [...usuarios];

  if (Object.keys(filtros).length > 0) {
    data = data.filter(u =>
      Object.entries(filtros).every(([k, v]) =>
        u[k] !== undefined &&
        u[k].toString().toLowerCase().includes(v.toLowerCase())
      )
    );
  }

  res.json({
    success: true,
    total: data.length,
    filtros_aplicados: filtros,
    autorization_header: token,
    data
  });
});

// GET /usuarios/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const usuario = usuarios.find(u => u.id === id);

  if (!usuario) {
    return res.status(404).json({ success: false, message: `Usuario con id ${id} no encontrado` });
  }

  res.json({ success: true, data: usuario });
});

// POST /usuarios
router.post('/', (req, res) => {
  const { nombre, email, rol } = req.body;

  if (!nombre || !email) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios: nombre, email'
    });
  }

  // Verificar email duplicado
  const existe = usuarios.find(u => u.email === email);
  if (existe) {
    return res.status(400).json({ success: false, message: 'Ya existe un usuario con ese email' });
  }

  const nuevo = {
    id: nextId++,
    nombre,
    email,
    rol: rol || 'cliente',
    activo: true
  };

  usuarios.push(nuevo);
  res.status(201).json({ success: true, message: 'Usuario registrado correctamente', data: nuevo });
});

// PUT /usuarios/:id
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = usuarios.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: `Usuario con id ${id} no encontrado` });
  }

  const { nombre, email, rol, activo } = req.body;

  if (nombre !== undefined) usuarios[index].nombre = nombre;
  if (email  !== undefined) usuarios[index].email  = email;
  if (rol    !== undefined) usuarios[index].rol    = rol;
  if (activo !== undefined) usuarios[index].activo = activo;

  res.json({ success: true, message: 'Usuario actualizado correctamente', data: usuarios[index] });
});

// DELETE /usuarios/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = usuarios.findIndex(u => u.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: `Usuario con id ${id} no encontrado` });
  }

  const eliminado = usuarios.splice(index, 1)[0];
  res.json({ success: true, message: 'Usuario eliminado correctamente', data: eliminado });
});

module.exports = router;