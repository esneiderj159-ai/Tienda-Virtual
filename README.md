#  API REST – Tienda Virtual | SENA Guía 3

> **Actividad:** Despliegue de API REST en Render  
> **Programa:** Tecnología en Análisis y Desarrollo de Software  
> **Instructor:** Mateo  
> **Proyecto:** Proyecto 1 – Tienda Virtual  
> **Integrantes:** Angel Gabriel Villada Jiménez y Erick Sneider Jiménez López  
> **Ficha:** 3229209

---

##  URL de la API en Producción

```
https://tienda-virtual-1-lvbf.onrender.com
```

> ⚠️ El plan gratuito de Render suspende el servidor tras 15 minutos de inactividad.
> La primera petición puede tardar ~30 segundos (cold start). Espera y vuelve a intentar.

---

##  Autenticación

Todos los endpoints requieren el siguiente header en cada petición:

```
password: MiPasswordSegura2024
```

Sin este header la API responde `401 Unauthorized`.  
Con password incorrecta responde `403 Forbidden`.

---

##  Tecnologías Utilizadas

- **Node.js** v18+
- **Express.js** v4.22+
- **SQLite3** v5.1+
- **dotenv** v16+
- **Render.com** (plataforma de despliegue gratuita)
- **Postman** para pruebas

---

##  Instalación y Ejecución Local

```bash
# 1. Clonar el repositorio
git clone https://github.com/esneiderj159-ai/Tienda-Virtual
cd tienda-virtual

# 2. Instalar dependencias
npm install

# 3. Crear archivo .env en la raíz del proyecto
# (ver sección Variables de Entorno abajo)

# 4. Ejecutar el servidor
npm start
# Corre en http://localhost:3000
```

---

##  Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```
PORT=3000
API_PASSWORD=MiPasswordSegura2024
NODE_ENV=development
```

> ⚠️ El archivo `.env` NO se sube a GitHub. Está en el `.gitignore`.  
> En Render estas variables se configuran en la sección **Environment**.

---

##  Estructura del Proyecto

```
tienda-virtual/
├── index.js          ← Servidor con middleware de autenticación
├── db.js             ← Conexión SQLite y creación de tablas
├── database.db       ← Archivo SQLite (se genera automáticamente)
├── package.json      ← Dependencias y script start
├── .env              ← Variables de entorno (NO se sube a GitHub)
├── .gitignore        ← Excluye node_modules/, database.db y .env
└── routes/
    ├── productos.js
    ├── categorias.js
    ├── usuarios.js
    └── pedidos.js
```

---

##  Endpoints

> **Base URL producción:** `https://tienda-virtual-1-lvbf.onrender.com`  
> **Header requerido en todas las peticiones:** `password: MiPasswordSegura2024`

###  Productos `/productos`

| Método | Ruta | Descripción | Código |
|--------|------|-------------|--------|
| GET | `/productos` | Listar todos | 200 |
| GET | `/productos/:id` | Obtener por ID | 200 / 404 |
| POST | `/productos` | Crear producto | 201 / 400 |
| PUT | `/productos/:id` | Actualizar | 200 / 404 |
| DELETE | `/productos/:id` | Eliminar | 200 / 404 |

###  Categorías `/categorias`

| Método | Ruta | Descripción | Código |
|--------|------|-------------|--------|
| GET | `/categorias` | Listar todas | 200 |
| GET | `/categorias/:id` | Obtener por ID | 200 / 404 |
| POST | `/categorias` | Crear categoría | 201 / 400 |
| PUT | `/categorias/:id` | Actualizar | 200 / 404 |
| DELETE | `/categorias/:id` | Eliminar | 200 / 404 |

###  Usuarios `/usuarios`

| Método | Ruta | Descripción | Código |
|--------|------|-------------|--------|
| GET | `/usuarios` | Listar todos | 200 |
| GET | `/usuarios/:id` | Obtener por ID | 200 / 404 |
| POST | `/usuarios` | Registrar usuario | 201 / 400 |
| PUT | `/usuarios/:id` | Actualizar | 200 / 404 |
| DELETE | `/usuarios/:id` | Eliminar | 200 / 404 |

###  Pedidos `/pedidos`

| Método | Ruta | Descripción | Código |
|--------|------|-------------|--------|
| GET | `/pedidos` | Listar todos | 200 |
| GET | `/pedidos/:id` | Obtener por ID | 200 / 404 |
| POST | `/pedidos` | Crear pedido | 201 / 400 |
| PUT | `/pedidos/:id` | Actualizar estado | 200 / 404 |
| DELETE | `/pedidos/:id` | Eliminar | 200 / 404 |

---

##  Códigos de autenticación

| Código | Causa |
|--------|-------|
| `401` | No se envió el header `password` |
| `403` | La password es incorrecta |

---

##  Ejemplos con curl

```bash
# Listar productos
curl https://tienda-virtual-1-lvbf.onrender.com/productos \
  -H "password: MiPasswordSegura2024"

# Crear categoría
curl -X POST https://tienda-virtual-1-lvbf.onrender.com/categorias \
  -H "password: MiPasswordSegura2024" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Tecnología","descripcion":"Dispositivos electrónicos"}'
```

---

##  Orden correcto para insertar datos

```
1. POST /categorias   → primero
2. POST /usuarios     → segundo
3. POST /productos    → tercero (necesita categoriaId)
4. POST /pedidos      → último (necesita usuarioId y productoId)
```

---

##  Notas

- Los datos en Render se pierden al redesplegar — es normal en el plan gratuito.
- `database.db`, `node_modules/` y `.env` están en `.gitignore` y no se suben a GitHub.