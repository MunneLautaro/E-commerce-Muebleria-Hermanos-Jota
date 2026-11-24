---
name: nuevo-endpoint
description: Crea endpoints nuevos en el backend Express + Mongoose de Mueblería Hermanos Jota siguiendo las capas del proyecto (schema yup → model → service → controller → routes → app.js), con los middlewares existentes (validate, validateQuery, requireAuth, requireAdmin, rate limit), el manejo de errores con status/expose y tests de integración con supertest y mongodb-memory-server. Usalo siempre que el usuario pida agregar o ampliar una ruta, endpoint, recurso, CRUD o API en backend/, por ejemplo "agregá un endpoint para pedidos", "necesito GET /api/categorias", "hacé el CRUD de usuarios para el admin" o "sumá un filtro por categoría a productos", aunque no diga "endpoint".
---

# Nuevo endpoint del backend

Este skill agrega endpoints a `backend/` respetando su arquitectura en capas, para que el código nuevo sea indistinguible del existente y llegue con tests.

Los mensajes que ve el cliente (errores y validaciones) van en castellano con voseo ("Ingresá un correo válido", "Elegí un motivo válido"). No agregues comentarios en el código: el repo prácticamente no los usa y las explicaciones van en el chat.

## 1. Aclarar antes de escribir

Si el pedido no lo deja claro, preguntá en una sola tanda:

- **Recurso y ruta**: el path va en castellano y en plural (`/api/pedidos`, `/api/categorias`).
- **Operaciones**: listar, ver por id, crear, editar, borrar, u otra acción.
- **Acceso**: público, usuario logueado o solo admin.
- **Campos**: nombre, tipo, si es obligatorio, límites, valores permitidos y si son únicos.
- **Borrado**: lógico (`isActive: false`, como productos) o físico. El default del proyecto es lógico.

Si el recurso ya existe (por ejemplo, un filtro nuevo para productos), extendé sus archivos en lugar de crear otros.

## 2. Capas y archivos

Todo vive en `backend/src/`. Referencia simple: el módulo de contacto. Referencia completa con CRUD, auth y paginación: el módulo de productos.

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Schema | `schemas/<recurso>.schema.js` | Validación yup del body (`create…Schema`, `update…Schema`) y, si hay filtros, `schemas/<recurso>.query.schema.js` |
| Model | `models/<recurso>.model.js` | Schema de Mongoose |
| Service | `services/<recurso>.service.js` | Lógica y acceso a la base. Traduce errores de Mongo a errores HTTP |
| Controller | `controllers/<recurso>.controller.js` | Lee `req`, llama al service y responde |
| Routes | `routes/<recurso>.routes.js` | Arma la cadena de middlewares por ruta |
| App | `app.js` | `app.use("/api/<recurso>", <recurso>Routes)` |

### Schema (yup)

```js
import * as yup from "yup"

export const createPedidoSchema = yup.object({
  direccion: yup
    .string()
    .trim()
    .min(5, "La dirección debe tener al menos 5 caracteres")
    .max(200, "La dirección no puede superar los 200 caracteres")
    .required("La dirección es obligatoria"),
})
```

- El middleware `validate(schema)` corre con `abortEarly: false` y `stripUnknown: true`, y reemplaza `req.body` por el resultado. Los campos desconocidos se descartan solos, y así un cliente no puede colar `isActive`, `role`, etc.
- Si falla, responde `400 { error: "Datos inválidos", details: [mensajes] }`. Los mensajes del schema son lo que ve el usuario, así que redactalos bien.
- Para campos que genera el servidor (ids, SKU), copiá el patrón de `generatedSku` en `schemas/product.schema.js`, que rechaza el campo si viene en el body.
- Para query strings, `validateQuery(schema)` deja el resultado en `req.validatedQuery` y responde `400 { error: "Parámetros inválidos", details }`. Para paginar, seguí `schemas/product.query.schema.js` (`page`, `limit`, defaults).

### Model (Mongoose)

```js
const pedidoSchema = new mongoose.Schema({ ... }, { timestamps: true })

const Pedido = mongoose.models.Pedido || mongoose.model("Pedido", pedidoSchema)

export default Pedido
```

El `mongoose.models.X ||` evita el error de recompilar el modelo en los tests y en el entorno serverless de Vercel. Repetí en el model las restricciones del schema yup (`required`, `trim`, `maxlength`, `enum`): yup valida la entrada HTTP y Mongoose protege la base de escrituras que no pasan por la API (seeders, scripts).

Cada campo es **obligatorio** (`required: true`, sin `default`) **u opcional** (`default` con un valor válido, sin `required`), nunca las dos cosas a la vez. `required` más `default: ""` es contradictorio: Mongoose considera que el string vacío no cumple `required`, así que el default nunca sirve y solo confunde a quien lee el modelo. Que coincida con el schema yup: si yup tiene `.required(...)`, el model usa `required: true`, y si yup tiene `.default(x)`, el model usa `default: x`.

### Service

- Exportá funciones `<accion><Recurso>Service`.
- Antes de consultar por id, validá con `mongoose.isValidObjectId(id)`. Si es inválido, lanzá un error 400 ("El ID del <recurso> no es válido"). Si no lo validás, Mongo lanza `CastError` y el mensaje queda genérico.
- Para errores que el cliente tiene que ver, creá un `Error` con `status` y `expose = true`:

  ```js
  const error = new Error("Ya existe un pedido con ese código")
  error.status = 409
  error.expose = true
  throw error
  ```

  `middlewares/errorHandler.js` solo muestra `err.message` cuando `expose` es `true`. Si no, responde "Error interno del servidor", para no filtrar detalles internos.
- Mapeá los errores de Mongo como en `services/contact.service.js` y `services/product.service.js`: duplicado (`code 11000`) → 409, `ValidationError` → 400 con los mensajes, y servidor no disponible → 503 "La base de datos no está disponible".
- Usá `.lean()` en lecturas y en `findByIdAndUpdate` con `{ returnDocument: "after", runValidators: true }`.
- Si el recurso tiene `isActive`, las lecturas públicas filtran `isActive: true` y las de admin no.
- Si el recurso devuelve datos del usuario, nunca incluyas `password` (usá `select`).
- Listados paginados: devolvé `{ items, pagination: { page, limit, total, totalPages } }`, igual que productos, porque el cliente ya consume esa forma.

### Controller

```js
export const getPedidoById = async (req, res, next) => {
  try {
    const pedido = await getPedidoByIdService(req.params.id)

    if (!pedido) {
      return res.status(404).json({ error: "Pedido no encontrado" })
    }

    return res.json(pedido)
  } catch (error) {
    return next(error)
  }
}
```

Siempre `try/catch` con `next(error)`, para que el `errorHandler` central decida el status. Los creates responden `201`. Las respuestas de error usan la forma `{ error: "mensaje" }`, que es lo que lee `fetchApi` en el cliente. El usuario autenticado está en `req.user` (`sub`, `email`, `role`).

### Routes

```js
import { Router } from "express"

const pedidoRoutes = Router()

pedidoRoutes.get("/", requireAuth, validateQuery(pedidoQuerySchema), getPedidos)
pedidoRoutes.post("/", requireAuth, pedidoWriteRateLimit, validate(createPedidoSchema), createPedido)

export default pedidoRoutes
```

Orden de los middlewares: `requireAuth` → `requireAdmin` → rate limit → `validate`/`validateQuery` → controller. Autenticar primero evita gastar cuota de rate limit y validación en requests anónimos. Las rutas fijas (`/admin`) se declaran **antes** que `/:id`, porque si no Express interpreta "admin" como un id.

### Montar en app.js

Importá las rutas y agregá `app.use("/api/<recurso>", <recurso>Routes)` junto a los demás, **antes** del handler 404 y del `errorHandler`. Si los montás después, nunca reciben requests.

## 3. Rate limit

Usalo en las escrituras públicas o costosas. Agregá el limiter en `middlewares/rateLimit.js` con `createLimiter(ventanaMs, limite)`.

**Importante:** `backend/tests/setup.js` mockea `rateLimit.js` entero con `vi.mock`. Si agregás un export nuevo y no lo sumás a ese mock como `passThrough`, el import queda `undefined` y Express rompe al arrancar en todos los tests.

## 4. Variables de entorno

Si el endpoint necesita configuración nueva, agregala a `backend/.env.example` con un valor de ejemplo y documentala en la sección "Variables del servidor" del `README.md`. Si los tests la necesitan, agregala al bloque `env` de `backend/vitest.config.js`.

## 5. Tests

Creá `backend/tests/<recurso>.test.js`. El entorno ya resuelve la infraestructura:

- `globalSetup.js` levanta un MongoDB en memoria y `setup.js` conecta y vacía todas las colecciones después de cada test. Cada test arranca con la base vacía.
- Usá `request(app)` de supertest con `app` de `../src/app.js`.
- En `tests/helpers.js` tenés `createUser({ role: "admin" })` y `tokenFor(user)`. Si necesitás crear documentos del recurso directamente en la base, sumá ahí un helper `create<Recurso>` y un `valid<Recurso>Body`.
- Para simular la base caída, copiá los dos tests de 503 de `tests/contact.test.js` (mock de `readyState` y de `Model.create`).

Casos a cubrir según aplique:
- Camino feliz: status, forma de la respuesta y lo que quedó guardado en la base.
- Validación: un `it.each` con cada regla del schema, verificando `details` exactos (`toEqual([mensaje])`) y que no se guardó nada.
- Campos desconocidos descartados.
- Rutas con `requireAuth`: `401` sin token y con un token inválido. Rutas con `requireAdmin`: además, `403` con un usuario que no es admin y `401` con un admin inactivo (`isActive: false`). `requireAuth` solo no consulta la base, así que no detecta usuarios inactivos.
- `404` con un id válido inexistente (`new mongoose.Types.ObjectId()`) y `400` con un id malformado.
- `409` por duplicado si hay campos únicos.
- Paginación y filtros si hay listados, incluidos los parámetros inválidos.

Los nombres de los tests van en castellano y describen el comportamiento ("devuelve 404 si el pedido no existe").

## 6. Documentar

Agregá una fila por endpoint a la tabla de la sección "API disponible" del `README.md` raíz, con método, ruta y una descripción que mencione si requiere auth o admin.

Si hay una colección de Postman para ese recurso en `backend/postman/`, ofrecé actualizarla.

## 7. Verificar

Desde `backend/`:

```bash
npm test
```

Todos los tests tienen que pasar, no solo los nuevos. Cambiar `setup.js` o `app.js` afecta a toda la suite.

## 8. Cierre

Resumí los endpoints creados (método, ruta y acceso), los archivos tocados con links y qué cubren los tests. Si el cliente va a consumir el endpoint, ofrecé agregar el método al servicio de la feature en `client/src/features/` o crear la página con el skill `nueva-pagina`. No hagas commit salvo que el usuario lo pida.
