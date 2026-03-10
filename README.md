# 🛒 API REST – Tienda Virtual | SENA Guía 2

> **Actividad:** Modelo de Base de Datos y Validaciones  
> **Programa:** Tecnología en Análisis y Desarrollo de Software  
> **Instructor:** Mateo  
> **Proyecto:** Proyecto 1 – Tienda Virtual  
> **Integrantes:** Angel Gabriel Villada Jiménez y Erick Sneider Jiménez López  
> **Ficha:** 3229209

---

## 🛠️ Tecnologías Utilizadas

- **Node.js** v18+
- **Express.js** v4.22+
- **SQLite3** v5.1+ (base de datos persistente en archivo local)
- **Postman** para pruebas de endpoints

---

## 🚀 Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd tienda-virtual

# 2. Instalar dependencias
npm install

# 3. Ejecutar el servidor
npm start
# El servidor corre en http://localhost:3000
# La base de datos database.db se crea automáticamente
```

---

## 📁 Estructura del Proyecto

```
tienda-virtual/
├── index.js          ← Servidor principal y registro de rutas
├── db.js             ← Conexión SQLite y creación de tablas
├── database.db       ← Archivo SQLite (generado automáticamente)
├── package.json
├── .gitignore
└── routes/
    ├── productos.js  ← API Productos
    ├── categorias.js ← API Categorías
    ├── usuarios.js   ← API Usuarios
    └── pedidos.js    ← API Pedidos
```

---

## 🗄️ Modelo de Base de Datos

### Diagrama Entidad-Relación

```
categorias (PK: id)
      |
      | 1:N
      |
productos (PK: id, FK: categoriaId → categorias.id)
      |
      | N:M (a través de pedido_productos)
      |
pedidos (PK: id, FK: usuarioId → usuarios.id)
      |
      | 1:N
      |
usuarios (PK: id)
```

### Relaciones
- Una **categoría** tiene muchos **productos** (1:N)
- Un **usuario** tiene muchos **pedidos** (1:N)
- Un **pedido** puede tener muchos **productos** y un **producto** puede estar en muchos **pedidos** (N:M → tabla intermedia `pedido_productos`)

---

## 📋 Diccionario de Datos

### Tabla: `categorias`
| Campo | Tipo | PK | FK | Restricción | Descripción |
|-------|------|----|----|-------------|-------------|
| id | INTEGER | ✅ | ❌ | AUTOINCREMENT | Identificador único |
| nombre | TEXT | ❌ | ❌ | NOT NULL, UNIQUE | Nombre de la categoría |
| descripcion | TEXT | ❌ | ❌ | DEFAULT '' | Descripción opcional |
| activa | INTEGER | ❌ | ❌ | DEFAULT 1, CHECK(0,1) | 1=activa, 0=inactiva |

### Tabla: `usuarios`
| Campo | Tipo | PK | FK | Restricción | Descripción |
|-------|------|----|----|-------------|-------------|
| id | INTEGER | ✅ | ❌ | AUTOINCREMENT | Identificador único |
| nombre | TEXT | ❌ | ❌ | NOT NULL | Nombre completo |
| email | TEXT | ❌ | ❌ | NOT NULL, UNIQUE | Correo electrónico |
| rol | TEXT | ❌ | ❌ | CHECK(admin,cliente,vendedor) | Rol del usuario |
| activo | INTEGER | ❌ | ❌ | DEFAULT 1, CHECK(0,1) | 1=activo, 0=inactivo |

### Tabla: `productos`
| Campo | Tipo | PK | FK | Restricción | Descripción |
|-------|------|----|----|-------------|-------------|
| id | INTEGER | ✅ | ❌ | AUTOINCREMENT | Identificador único |
| nombre | TEXT | ❌ | ❌ | NOT NULL | Nombre del producto |
| precio | REAL | ❌ | ❌ | NOT NULL, CHECK(>0) | Precio de venta |
| categoriaId | INTEGER | ❌ | ✅ | FK → categorias.id | Categoría del producto |
| stock | INTEGER | ❌ | ❌ | DEFAULT 0, CHECK(>=0) | Unidades disponibles |
| activo | INTEGER | ❌ | ❌ | DEFAULT 1, CHECK(0,1) | 1=activo, 0=inactivo |

### Tabla: `pedidos`
| Campo | Tipo | PK | FK | Restricción | Descripción |
|-------|------|----|----|-------------|-------------|
| id | INTEGER | ✅ | ❌ | AUTOINCREMENT | Identificador único |
| usuarioId | INTEGER | ❌ | ✅ | FK → usuarios.id | Usuario que hizo el pedido |
| total | REAL | ❌ | ❌ | DEFAULT 0, CHECK(>=0) | Total calculado automáticamente |
| estado | TEXT | ❌ | ❌ | CHECK(pendiente,procesando,enviado,entregado,cancelado) | Estado del pedido |
| fecha | TEXT | ❌ | ❌ | DEFAULT date('now') | Fecha de creación automática |

### Tabla: `pedido_productos` (intermedia N:M)
| Campo | Tipo | PK | FK | Restricción | Descripción |
|-------|------|----|----|-------------|-------------|
| id | INTEGER | ✅ | ❌ | AUTOINCREMENT | Identificador único |
| pedidoId | INTEGER | ❌ | ✅ | FK → pedidos.id | Pedido al que pertenece |
| productoId | INTEGER | ❌ | ✅ | FK → productos.id | Producto incluido |
| cantidad | INTEGER | ❌ | ❌ | NOT NULL, CHECK(>0) | Cantidad pedida |
| precioUnit | REAL | ❌ | ❌ | NOT NULL, CHECK(>0) | Precio unitario al comprar |

---

## 📌 Endpoints

### 🛍️ API 1 – Productos `/productos`

| Método | Ruta | Descripción | Código |
|--------|------|-------------|--------|
| GET | `/productos` | Listar todos (filtros: ?nombre= ?categoriaId= ?activo=) | 200 |
| GET | `/productos/:id` | Obtener por ID | 200 / 404 |
| POST | `/productos` | Crear producto | 201 / 400 |
| PUT | `/productos/:id` | Actualizar producto | 200 / 404 |
| DELETE | `/productos/:id` | Eliminar producto | 200 / 404 |

**Header leído:** `Authorization`

**Validaciones POST:**
- `nombre`, `precio`, `categoriaId` son obligatorios
- `precio` debe ser número mayor a 0
- `stock` debe ser entero mayor o igual a 0
- `categoriaId` debe existir en la base de datos

---

### 🏷️ API 2 – Categorías `/categorias`

| Método | Ruta | Descripción | Código |
|--------|------|-------------|--------|
| GET | `/categorias` | Listar todas (filtros: ?nombre= ?activa=) | 200 |
| GET | `/categorias/:id` | Obtener por ID | 200 / 404 |
| POST | `/categorias` | Crear categoría | 201 / 400 |
| PUT | `/categorias/:id` | Actualizar categoría | 200 / 404 |
| DELETE | `/categorias/:id` | Eliminar categoría | 200 / 404 |

**Header leído:** `Accept-Language`

**Validaciones POST:**
- `nombre` es obligatorio y mínimo 2 caracteres
- `nombre` debe ser único (no puede repetirse)

---

### 👤 API 3 – Usuarios `/usuarios`

| Método | Ruta | Descripción | Código |
|--------|------|-------------|--------|
| GET | `/usuarios` | Listar todos (filtros: ?nombre= ?rol= ?activo=) | 200 |
| GET | `/usuarios/:id` | Obtener por ID | 200 / 404 |
| POST | `/usuarios` | Registrar usuario | 201 / 400 |
| PUT | `/usuarios/:id` | Actualizar usuario | 200 / 404 |
| DELETE | `/usuarios/:id` | Eliminar usuario | 200 / 404 |

**Header leído:** `Authorization`

**Validaciones POST:**
- `nombre` y `email` son obligatorios
- `email` debe tener formato válido (usuario@dominio.com)
- `email` debe ser único (no puede repetirse)
- `rol` debe ser: `admin`, `cliente` o `vendedor`

---

### 📦 API 4 – Pedidos `/pedidos`

| Método | Ruta | Descripción | Código |
|--------|------|-------------|--------|
| GET | `/pedidos` | Listar todos (filtros: ?estado= ?usuarioId=) | 200 |
| GET | `/pedidos/:id` | Obtener por ID | 200 / 404 |
| POST | `/pedidos` | Crear pedido | 201 / 400 |
| PUT | `/pedidos/:id` | Actualizar estado | 200 / 400 / 404 |
| DELETE | `/pedidos/:id` | Eliminar pedido | 200 / 404 |

**Headers leídos:** `Authorization`, `X-App-Source`

**Validaciones POST:**
- `usuarioId` es obligatorio y debe existir en la base de datos
- `productos` debe ser un array con al menos 1 item
- Cada producto debe tener `productoId`, `cantidad` y `precioUnit`
- `cantidad` debe ser entero mayor a 0
- `precioUnit` debe ser número mayor a 0
- `total` se calcula automáticamente

**Estados válidos:** `pendiente`, `procesando`, `enviado`, `entregado`, `cancelado`

---

## 📋 Formato de Respuestas

**Exitosa (201 Created):**
```json
{
  "success": true,
  "message": "Producto creado correctamente",
  "data": { "id": 1, "nombre": "Laptop HP", "precio": 2500000 }
}
```

**Exitosa con lista (200 OK):**
```json
{
  "success": true,
  "total": 3,
  "data": [ ... ]
}
```

**No encontrado (404):**
```json
{
  "success": false,
  "message": "Producto con id 99 no encontrado"
}
```

**Datos inválidos (400):**
```json
{
  "success": false,
  "message": "precio debe ser un número mayor a 0"
}
```

---

## 🧪 Pruebas en Postman — Orden correcto

Insertar datos en este orden para respetar las llaves foráneas:

```
1. POST /categorias   → crear categoría primero
2. POST /usuarios     → crear usuario
3. POST /productos    → crear producto (necesita categoriaId)
4. POST /pedidos      → crear pedido (necesita usuarioId y productoId)
```

---

## 📝 Notas

- Los datos se almacenan en **SQLite** (`database.db`) y son **persistentes** — no se pierden al reiniciar el servidor.
- El archivo `database.db` se genera automáticamente al iniciar el servidor por primera vez.
- `database.db` y `node_modules/` están en `.gitignore` y no se suben a GitHub.
