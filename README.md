INTEGRANTES: ANGEL GABRIEL VILLADA JIJMENEZ
ERICK SNEIDER JIMENEZ LOPEZ 
FICHA:3229209

 
 
 
 API REST – Tienda Virtual | SENA

> **Actividad:** Desarrollo de APIs REST con Node.js  
> **Programa:** Tecnología en Análisis y Desarrollo de Software  
> **Instructor:** Mateo  
> **Proyecto elegido:** Proyecto 1 – Tienda Virtual



##  Instalación y Ejecución

```bash
# 1. Clonar el repositorio
git clone <URL_DEL_REPOSITORIO>
cd tienda-virtual

# 2. Instalar dependencias
npm install

# 3. Ejecutar el servidor
npm start
# El servidor corre en http://localhost:3000
```

---

##  Estructura del Proyecto

```
tienda-virtual/
├── index.js          ← Servidor principal y registro de rutas
├── package.json
└── routes/
    ├── productos.js   ← API Productos
    ├── categorias.js  ← API Categorías
    ├── usuarios.js    ← API Usuarios
    └── pedidos.js     ← API Pedidos
```

---

##  Endpoints

###  API 1 – Productos `/productos`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/productos` | Listar todos los productos (soporta filtros por query) |
| GET | `/productos/:id` | Obtener un producto por ID |
| POST | `/productos` | Crear un nuevo producto |
| PUT | `/productos/:id` | Actualizar un producto existente |
| DELETE | `/productos/:id` | Eliminar un producto |

**Campos:** `id`, `nombre`, `precio`, `categoria`, `stock`, `activo`

**Ejemplos de uso:**
```
GET  /productos
GET  /productos?categoria=tecnologia
GET  /productos?nombre=laptop
GET  /productos/1
POST /productos        Body: { "nombre": "Mouse", "precio": 50000, "categoria": "tecnologia", "stock": 30 }
PUT  /productos/1      Body: { "precio": 2400000, "stock": 8 }
DEL  /productos/1
```
**Header requerido:** `Authorization: Bearer <token>`

---

###  API 2 – Categorías `/categorias`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/categorias` | Listar todas las categorías (soporta filtros) |
| GET | `/categorias/:id` | Obtener una categoría por ID |
| POST | `/categorias` | Crear una nueva categoría |
| PUT | `/categorias/:id` | Actualizar una categoría |
| DELETE | `/categorias/:id` | Eliminar una categoría |

**Campos:** `id`, `nombre`, `descripcion`, `activa`

**Ejemplos de uso:**
```
GET  /categorias
GET  /categorias?activa=true
GET  /categorias?nombre=ropa
GET  /categorias/2
POST /categorias        Body: { "nombre": "Hogar", "descripcion": "Artículos para el hogar" }
PUT  /categorias/2      Body: { "activa": false }
DEL  /categorias/2
```
**Header leído:** `Accept-Language`

---

###  API 3 – Usuarios `/usuarios`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/usuarios` | Listar todos los usuarios (soporta filtros) |
| GET | `/usuarios/:id` | Obtener un usuario por ID |
| POST | `/usuarios` | Registrar un nuevo usuario |
| PUT | `/usuarios/:id` | Actualizar datos de un usuario |
| DELETE | `/usuarios/:id` | Eliminar un usuario |

**Campos:** `id`, `nombre`, `email`, `rol`, `activo`

**Ejemplos de uso:**
```
GET  /usuarios
GET  /usuarios?rol=admin
GET  /usuarios?activo=true
GET  /usuarios/1
POST /usuarios        Body: { "nombre": "Juan Pérez", "email": "juan@email.com", "rol": "cliente" }
PUT  /usuarios/1      Body: { "rol": "vendedor" }
DEL  /usuarios/1
```
**Header leído:** `Authorization`

---

### API 4 – Pedidos `/pedidos`

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/pedidos` | Listar todos los pedidos (soporta filtros) |
| GET | `/pedidos/:id` | Obtener un pedido por ID |
| POST | `/pedidos` | Crear un nuevo pedido |
| PUT | `/pedidos/:id` | Actualizar estado de un pedido |
| DELETE | `/pedidos/:id` | Cancelar/eliminar un pedido |

**Campos:** `id`, `usuarioId`, `productos`, `total`, `estado`, `fecha`  
**Estados válidos:** `pendiente`, `procesando`, `enviado`, `entregado`, `cancelado`

**Ejemplos de uso:**
```
GET  /pedidos
GET  /pedidos?estado=pendiente
GET  /pedidos?usuarioId=2
GET  /pedidos/1
POST /pedidos   Body: {
                  "usuarioId": 2,
                  "productos": [
                    { "productoId": 1, "nombre": "Laptop", "cantidad": 1, "precioUnit": 2500000 }
                  ]
                }
PUT  /pedidos/1      Body: { "estado": "enviado" }
DEL  /pedidos/1
```
**Headers leídos:** `Authorization`, `X-App-Source`

---

##  Formato de Respuestas

**Respuesta exitosa:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Respuesta con lista:**
```json
{
  "success": true,
  "total": 4,
  "data": [ ... ]
}
```

**Recurso no encontrado (404):**
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
  "message": "Faltan campos obligatorios: nombre, precio, categoria"
}
```

---

##  Pruebas con Postman / Thunder Client

Importa la colección o crea requests manualmente usando la URL base:  
`http://localhost:3000`

**Ejemplo de request POST en Postman:**
- Method: `POST`
- URL: `http://localhost:3000/productos`
- Headers: `Content-Type: application/json`, `Authorization: Bearer mitoken123`
- Body (raw JSON):
```json
{
  "nombre": "Teclado Mecánico",
  "precio": 320000,
  "categoria": "tecnologia",
  "stock": 15
}
```

---

##  Tecnologías Utilizadas

- **Node.js** v18+
- **Express.js** v4.18+
- **Postman / Thunder Client** para pruebas

---

##  Notas

- Los datos se almacenan **en memoria** (se reinician al reiniciar el servidor).
- Para producción se recomienda conectar una base de datos como MongoDB o PostgreSQL.
