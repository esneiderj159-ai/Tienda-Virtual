const express = require('express');
const router = express.Router();

// Base de datos en memoria
let productos = [
  { id: 1, nombre: 'Laptop HP 15"', precio: 2500000, categoria: 'tecnologia', stock: 10, activo: true },
  { id: 2, nombre: 'Camisa Polo Azul', precio: 75000, categoria: 'ropa', stock: 50, activo: true },
  { id: 3, nombre: 'Auriculares Bluetooth', precio: 180000, categoria: 'tecnologia', stock: 25, activo: true },
  { id: 4, nombre: 'Silla Ergonómica', precio: 450000, categoria: 'muebles', stock: 8, activo: false },
];
let nextId = 5;

// GET /productos - Obtener todos (con filtro dinámico por query params)
// Ejemplo: GET /productos?nombre=laptop&categoria=tecnologia
router.get('/', (req, res) => {
  // Leer header de autorización (requisito de headers)
  const token = req.headers['authorization'] || 'No proporcionado';
  const filtros = req.query;

  let data = [...productos];

  // Filtro dinámico por cualquier campo
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
    autorization_header: token,
    data
  });
});

// GET /productos/:id - Obtener producto por ID
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({ success: false, message: `Producto con id ${id} no encontrado` });
  }

  res.json({ success: true, data: producto });
});

// POST /productos - Crear nuevo producto
router.post('/', (req, res) => {
  const { nombre, precio, categoria, stock } = req.body;

  if (!nombre || precio === undefined || !categoria) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios: nombre, precio, categoria'
    });
  }

  const nuevo = {
    id: nextId++,
    nombre,
    precio,
    categoria,
    stock: stock ?? 0,
    activo: true
  };

  productos.push(nuevo);
  res.status(201).json({ success: true, message: 'Producto creado correctamente', data: nuevo });
});

// PUT /productos/:id - Actualizar producto
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = productos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: `Producto con id ${id} no encontrado` });
  }

  const { nombre, precio, categoria, stock, activo } = req.body;

  if (nombre !== undefined)    productos[index].nombre    = nombre;
  if (precio !== undefined)    productos[index].precio    = precio;
  if (categoria !== undefined) productos[index].categoria = categoria;
  if (stock !== undefined)     productos[index].stock     = stock;
  if (activo !== undefined)    productos[index].activo    = activo;

  res.json({ success: true, message: 'Producto actualizado correctamente', data: productos[index] });
});

// DELETE /productos/:id - Eliminar producto
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = productos.findIndex(p => p.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, message: `Producto con id ${id} no encontrado` });
  }

  const eliminado = productos.splice(index, 1)[0];
  res.json({ success: true, message: 'Producto eliminado correctamente', data: eliminado });
});

module.exports = router;