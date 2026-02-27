const express = require('express');
const router = express.Router();

// Base de datos en memoria
let categorias = [
  { id: 1, nombre: 'Tecnología',  descripcion: 'Dispositivos electrónicos y accesorios', activa: true },
  { id: 2, nombre: 'Ropa',        descripcion: 'Prendas de vestir para toda ocasión',    activa: true },
  { id: 3, nombre: 'Muebles',     descripcion: 'Mobiliario para hogar y oficina',         activa: true },
  { id: 4, nombre: 'Deportes',    descripcion: 'Artículos deportivos y fitness',          activa: false },
];
let nextId = 5;

// GET /categorias - Obtener todas (con filtro dinámico por query params)
// Ejemplo: GET /categorias?nombre=ropa  |  GET /categorias?activa=true
router.get('/', (req, res) => {
  const idioma = req.headers['accept-language'] || 'No proporcionado';
  const filtros = req.query;
  let data = [...categorias];

  if (Object.keys(filtros).length > 0) {
    data = data.filter(c =>
      Object.entries(filtros).every(([k, v]) =>
        c[k] !== undefined &&
        c[k].toString().toLowerCase().includes(v.toLowerCase())
      )
    );
  }

  res.json({
    success: true,
    total: data.length,
    filtros_aplicados: filtros,
    idioma_header: idioma,
    data
  });
});

// GET /categorias/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const categoria = categorias.find(c => c.id === id);

  if (!categoria) {
    return res.status(404).json({ success: false, message: `Categoría con id ${id} no encontrada` });
  }

  res.json({ success: true, data: categoria });
});

// POST /categorias
router.post('/', (req, res) => {
  const { nombre, descripcion } = req.body;

  if (!nombre) {
    return res.status(400).json({ success: false, message: 'El campo nombre es obligatorio' });
  }

  const nueva = {
    id: nextId++,
    nombre,
    descripcion: descripcion || '',
    activa: true
  };

  categorias.push(nueva);
  res.status(201).json({ success: true, message: 'Categoría creada correctamente', data: nueva });
});

// PUT /categorias/:id
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = categorias.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: `Categoría con id ${id} no encontrada` });
  }

  const { nombre, descripcion, activa } = req.body;

  if (nombre !== undefined)      categorias[index].nombre      = nombre;
  if (descripcion !== undefined) categorias[index].descripcion = descripcion;
  if (activa !== undefined)      categorias[index].activa      = activa;

  res.json({ success: true, message: 'Categoría actualizada correctamente', data: categorias[index] });
});

// DELETE /categorias/:id
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = categorias.findIndex(c => c.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: `Categoría con id ${id} no encontrada` });
  }

  const eliminada = categorias.splice(index, 1)[0];
  res.json({ success: true, message: 'Categoría eliminada correctamente', data: eliminada });
});

module.exports = router;