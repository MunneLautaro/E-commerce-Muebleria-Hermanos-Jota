---
name: nueva-pagina
description: Crea una página nueva en el cliente React de Mueblería Hermanos Jota siguiendo las convenciones del proyecto (carpeta en pages/, archivo de estilos Tailwind con los tokens de marca, ruta en router.jsx, servicio en features/ si consume la API, guard de admin si corresponde y tests con Vitest + Testing Library + MSW). Usalo siempre que el usuario pida agregar una página, pantalla, vista, sección navegable o ruta nueva en el frontend/client, por ejemplo "hacé una página de nosotros", "agregá la vista de mis pedidos", "necesito una pantalla de admin para usuarios" o "sumá /favoritos", aunque no diga la palabra "página".
---

# Nueva página del cliente

Este skill crea una página del cliente (`client/`) que se vea y se comporte igual que las que ya existen. El objetivo es que quien revise el PR no note diferencias de estilo entre lo nuevo y lo viejo, y que la página llegue con tests.

Todo el texto visible va en castellano rioplatense con voseo ("Ingresá", "Volvé al inicio", "No se pudo cargar…"), como el resto del sitio. No agregues comentarios en el código: el repo prácticamente no los usa y las explicaciones van en el chat.

## 1. Aclarar antes de escribir

Si el pedido no lo deja claro, preguntá (en una sola tanda) lo que cambie el resultado:

- **Ruta**: en castellano y en minúsculas (`/nosotros`, `/mis-pedidos`, `/admin/usuarios`).
- **Datos**: si la página consume la API, cuál endpoint. Si el endpoint todavía no existe en `backend/`, avisá y ofrecé crearlo con el skill `nuevo-endpoint`.
- **Acceso**: pública, solo usuarios logueados o solo admin.
- **Navegación**: si va en el menú del header.

Si algo tiene un default razonable (por ejemplo, página pública sin link en el header), elegilo, decilo y seguí.

## 2. Archivos de la página

Creá `client/src/pages/<carpetaCamelCase>/`:

- `<Nombre>Page.jsx`: componente con `export default function <Nombre>Page()`.
- `<Nombre>PageStyles.jsx`: un objeto con las clases de Tailwind, `export const <nombre>Styles = { ... }`. En el componente se importa como `import { <nombre>Styles as s } from "./<Nombre>PageStyles"` y se usa `className={s.titulo}`.

Separar las clases en el archivo de estilos es la convención de todo el cliente. Mantené el JSX legible y no pongas clases largas inline.

Referencias canónicas para copiar el estilo:
- `client/src/pages/notFound/NotFoundPage.jsx` + `NotFoundPageStyles.jsx`: página simple con props y links.
- `client/src/pages/productDetail/ProductDetail.jsx`: página que carga datos, con estados de carga, error y 404.
- `client/src/pages/admin/AdminProductsPage.jsx`: página solo para admin.

### Estructura y accesibilidad

- `Layout` ya envuelve todo en `<main id="contenido">` con ancho máximo y padding. La raíz de la página es un `<section>` o `<div>`, **nunca otro `<main>`**, porque quedarían dos landmarks main.
- Un solo `<h1>` por página. Si usás `<section>`, asociale el título con `aria-labelledby`.
- Para navegar dentro del sitio usá `Link`/`NavLink` de `react-router-dom`, no `<a href>`.
- Las imágenes llevan `alt` descriptivo, y las decorativas `aria-hidden="true"`.

### Tokens de diseño

Están definidos en `client/src/index.css` (`@theme`). Usá los tokens en lugar de colores hex sueltos:

| Uso | Clases |
|---|---|
| Colores de marca | `siena` (principal), `salvia`, `alabastro`, `oro`, `rosa` |
| Texto | `text-ink`, `text-ink-soft` |
| Fondos/bordes | `bg-crema`, `border-linea`, `bg-superficie`, `bg-panel-marca`, `bg-panel-salvia` |
| Tipografía | `font-display` / `font-serif` (títulos), `font-body` |
| Espaciado de letras | `tracking-title`, `tracking-cta`, `tracking-caption` |
| Bordes y sombras | `rounded-marca`, `shadow-marca`, `shadow-tarjeta` |
| Errores | `text-error`, `bg-error-bg` |

Botones habituales:
- Primario: `inline-flex items-center justify-center rounded-marca bg-siena px-6 py-3 text-sm font-medium uppercase tracking-cta text-white transition-colors hover:bg-ink`
- Secundario: `inline-flex items-center justify-center rounded-marca border border-siena px-6 py-3 text-sm font-medium uppercase tracking-cta text-siena transition-colors hover:bg-alabastro`

El diseño es mobile first: la base es para mobile y se amplía con `sm:`/`md:`/`lg:`.

## 3. Si la página consume la API

### Servicio

Las llamadas HTTP viven en `client/src/features/<feature>/services/<feature>Service.js` y usan `fetchApi` de `client/src/services/api.js`. `fetchApi` ya agrega el token, arma la URL base y, si la respuesta no es OK, lanza un `Error` con `status` y el mensaje del backend.

```js
import { fetchApi } from "../../../services/api"

export const pedidoService = {
  async getPedidos(params = {}) {
    const query = new URLSearchParams(params).toString()
    return fetchApi(query ? `/pedidos?${query}` : "/pedidos")
  },
}
```

Exportalo desde `client/src/features/<feature>/index.js` y desde la página importá el barrel (`../../features/<feature>`). Si la feature ya existe, sumá el método al servicio que ya tiene.

### Carga de datos en la página

Seguí el patrón de `ProductDetail.jsx`:
- Una función async dentro del `useEffect`, una bandera `isActive` para ignorar respuestas viejas, `void fetchX()` y un cleanup que pone `isActive = false`.
- Estados de carga, error y, si aplica, "no encontrado".
- Si es un error de red o de servidor, guardá un mensaje en `error`, mostralo con `toast.error(...)` (de `react-toastify`) y logueá con `console.error`.
- Si el backend responde 404 (o 400 por un id con formato inválido), renderizá `NotFoundPage` de `../notFound/NotFoundPage` con un `title` y una `description` adaptados ("Pedido no encontrado"). No muestres toast en ese caso, porque no es una falla.

### Formularios que crean o editan

Cuando el guardado sale bien, mostrá `toast.success(...)` y redirigí con `useNavigate` a donde el usuario ve el resultado: el listado o panel del recurso (por ejemplo, `navigate("/admin")` después de crear o editar un producto). Si el usuario queda en el mismo formulario, no sabe si se guardó y puede reenviarlo por error. El `ToastContainer` vive en `App.jsx`, así que el toast sigue visible después de navegar.

No mandes al usuario a una página que podría no mostrar el recurso. Por ejemplo, el detalle público oculta los productos inactivos. Si el guardado falla, quedate en el formulario con los datos cargados y mostrá `toast.error(error.message || ...)` para que pueda corregir y reintentar.

## 4. Páginas protegidas

Usá `useAuth()` de `../../features/auth`, igual que `AdminProductsPage.jsx`:

```jsx
const { user, loading } = useAuth()

if (loading) return <section aria-busy="true"><p>Verificando permisos...</p></section>
if (!user) return <Navigate to="/login" replace />
if (user.role !== "admin") return <Navigate to="/" replace />
```

Para páginas que solo piden login, omití la línea del rol. Disparar los fetch solo cuando el usuario tiene permiso evita requests que el backend rechazaría con 401/403.

## 5. Registrar la ruta

En `client/src/app/router.jsx`, importá la página y agregá el `<Route>` dentro del `<Route element={<Layout />}>`, **antes** de `path="*"`. El comodín muestra la 404 y tiene que quedar último.

Si va en el menú, agregala al array `navLinks` de `client/src/components/Header/Header.jsx`. Ese array alimenta tanto el menú de escritorio como el de mobile.

## 6. Tests

Los tests van al lado del archivo (`<Nombre>Page.test.jsx`, `<feature>Service.test.js`). Herramientas disponibles:

- `renderWithProviders(ui, { route, auth })` de `client/src/test/renderWithProviders.jsx`: envuelve en `MemoryRouter` y `AuthContext`. Con `auth: { user: { role: "admin" }, isAuthenticated: true }` simulás un admin. Devuelve `user` (userEvent) para interacciones.
- Si la página (o el `Layout`) usa el carrito, envolvé también en `CartProvider` de `features/cart`.
- Para leer `useParams`, renderizá dentro de `<Routes><Route path="/x/:id" element={<Page />} /></Routes>` y pasá `route: "/x/123"`.
- MSW: `server.use(http.get(apiUrl("/pedidos"), () => HttpResponse.json(...)))` con `server` de `client/src/test/msw/server` y `apiUrl` de `client/src/test/msw/handlers`. El setup usa `onUnhandledRequest: "error"`, así que **cada request que haga la página necesita su handler** o el test falla.
- En los tests que provocan errores, silenciá `console.error` con `vi.spyOn(console, "error").mockImplementation(() => {})` y restaurá en `afterEach`.

Casos mínimos:
- Página: renderiza el `<h1>` y el contenido principal. Si carga datos: éxito, error del servidor (500 → mensaje de error) y 404 → `NotFoundPage`. Si está protegida: sin usuario redirige y con el rol correcto muestra la página.
- Servicio: pide el path y los parámetros correctos y propaga el `status` del error. Copiá el helper `captureRequest` de `client/src/features/products/services/productService.test.js`.
- Formulario: después de guardar con éxito redirige, y si falla se queda. Para comprobar la redirección, registrá la ruta destino en el test con un elemento simple (`<Route path="/admin" element={<h1>Panel</h1>} />`) y esperá ese heading. Referencia: `client/src/pages/admin/CreateProductPage.test.jsx`.
- Ruta: si agregaste lógica especial de routing, un test en `client/src/app/router.test.jsx`.

Buscá elementos por rol y nombre accesible (`getByRole("heading", { level: 1, name: ... })`), como en el resto de los tests del repo.

## 7. Verificar

Desde `client/`:

```bash
npm test
npx eslint src
npm run build
```

Las tres tienen que pasar antes de dar la tarea por terminada. El lint incluye `react-hooks`, que marca dependencias faltantes en los efectos. Si algo falla, corregilo en vez de silenciar la regla.

## 8. Cierre

Al terminar, resumí qué archivos creaste o modificaste, con links, y qué cubren los tests. No hagas commit salvo que el usuario lo pida.
