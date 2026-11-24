---
name: seo-pagina
description: Agrega o corrige los metadatos de SEO (título de la pestaña, meta description, noindex, URL canónica) de las páginas del cliente React de Mueblería Hermanos Jota usando el componente PageMeta y las etiquetas nativas de React 19, con sus tests. Usalo siempre que el usuario pida mejorar el SEO, cambiar el título de una página o de la pestaña, agregar una descripción para Google, ocultar una página de los buscadores, resolver contenido duplicado entre rutas o revisar los metadatos del frontend/client, por ejemplo "que el detalle muestre el nombre del producto en la pestaña", "sacá el admin de Google", "mejorá el SEO del catálogo" o "/favoritos no tiene título", aunque no diga "SEO". También aplica cuando alguien proponga instalar react-helmet o react-helmet-async.
---

# SEO de las páginas del cliente

El cliente (`client/`) es una SPA de Vite con React 19 y sin SSR. Los metadatos de cada página se declaran con el componente `PageMeta`, que renderiza `<title>`, `<meta>` y `<link>` nativos. React 19 los lleva solo al `<head>` y los saca cuando la página se desmonta.

Todo el texto va en castellano rioplatense con voseo, igual que el resto del sitio. No agregues comentarios en el código: las explicaciones van en el chat.

## Por qué no react-helmet

No instales `react-helmet` ni `react-helmet-async`. El primero está abandonado y usa ciclos de vida que React 19 marca como inseguros. El segundo no declara React 19 en sus `peerDependencies`. Su ventaja real es el SSR, que este proyecto no tiene. React 19 ya hace lo mismo sin Provider ni dependencias. Si alguien lo propone, explicá esto y usá `PageMeta`.

## El componente

`client/src/components/PageMeta/PageMeta.jsx`:

```jsx
<PageMeta
  title="Catálogo de muebles"
  description="Explorá el catálogo de ..."
  noIndex
  canonicalPath="/contact"
/>
```

| Prop | Qué hace |
|---|---|
| `title` | Arma `"<title> \| Mueblería Hermanos Jota"`. Sin `title` queda solo el nombre del sitio (lo usa la home). |
| `description` | `<meta name="description">`. Si no se pasa, no se renderiza. |
| `noIndex` | `<meta name="robots" content="noindex, nofollow">`. |
| `canonicalPath` | `<link rel="canonical">` con la URL absoluta armada desde `location.origin`. |

`SITE_NAME` y `buildPageTitle` viven en `pageTitle.js`, separados del componente para que no se rompa el fast refresh (regla `react-refresh/only-export-components`).

## Reglas

### Dónde ponerlo

- `PageMeta` va **adentro del elemento raíz que devuelve la página**, como primer hijo. No hace falta Fragment.
- Tiene que estar en **cada `return` que renderiza algo**: carga, error, vacío y éxito. Si falta en un estado, la pestaña conserva el título de la página anterior. Los `return <Navigate />` no lo necesitan.
- Si varias ramas comparten metadatos, definilos una vez en un objeto fuera del componente y pasalos con spread. Ejemplo: `productsMeta` en `client/src/pages/products/Products.jsx`.
- Las páginas que renderizan `NotFoundPage` no agregan su propio `PageMeta`. `NotFoundPage` ya usa su prop `title` como título de la pestaña y pone `noIndex`.

### Títulos

- Cortos y específicos, de 50 a 60 caracteres en total contando el sufijo del sitio. Lo importante va primero.
- En páginas con datos de la API, usá el dato real (`product.nombre`). Mientras carga, un título de estado (`"Cargando producto"`).
- No repitas el nombre del sitio en `title`: ya lo agrega `buildPageTitle`.

### Descripciones

- Solo en páginas indexables. Entre 120 y 155 caracteres, escritas para una persona que ve el resultado en Google: qué va a encontrar y por qué entrar.
- Cada página indexable tiene la suya. No reutilices la de la home.
- Si sale de datos de la API, normalizá los espacios y recortá a 155 con `…`. También necesita un texto por defecto para cuando el dato venga vacío. Referencia: `buildProductDescription` en `client/src/pages/productDetail/ProductDetail.jsx`.

### Qué no se indexa

`noIndex` va en: login, registro, todo `/admin`, la 404, los estados de error y cualquier página que dependa de la sesión del usuario (carrito, mis pedidos, perfil).

Además, `/admin` está bloqueado en `client/public/robots.txt`. Vite lo copia a la raíz del build, y Vercel lo sirve antes de aplicar el rewrite a `index.html` de `client/vercel.json`. Si agregás otra sección privada con prefijo propio, que no aporta nada a los buscadores, sumá su `Disallow`.

No bloquees en `robots.txt` las páginas que solo necesitan `noIndex` (login, registro, 404). Si el bot no puede rastrearlas, tampoco lee el `noindex`, y la URL puede seguir apareciendo en los resultados si otro sitio la enlaza.

### URL canónica

Usá `canonicalPath` cuando la misma página responde en más de una ruta (`/contact` y `/contacto` apuntan a `/contact`, que es la que usa el header) y en los detalles de recursos (`/productos/${id}`), para que los parámetros de query no generen duplicados.

### index.html

`client/index.html` tiene `lang="es-AR"`, el `<title>` por defecto, `theme-color` y las etiquetas Open Graph estáticas del sitio.

- **No agregues `<meta name="description">` en `index.html`.** React 19 reutiliza una `<meta>` existente solo si su `content` coincide exactamente. Si no coincide, agrega otra, y quedarían dos descripciones. El `<title>` sí lo adopta y lo reemplaza.
- Las etiquetas `og:*` quedan **solo** en `index.html`. WhatsApp, Facebook y LinkedIn no ejecutan JavaScript, así que ponerlas desde React no cambia la vista previa. Para tener vistas previas por producto hace falta prerender o SSR. Si el usuario lo pide, avisale que es otro trabajo.

## Tests

Las etiquetas quedan en `document.head`, y el `cleanup` de Testing Library desmonta la página y las saca entre tests.

```js
const getMeta = (name) =>
  document.head.querySelector(`meta[name="${name}"]`)

expect(document.title).toBe("Mesa Roble | Mueblería Hermanos Jota")
expect(getMeta("description")).toHaveAttribute("content", "Mesa de roble macizo")
expect(getMeta("robots")).toHaveAttribute("content", "noindex, nofollow")
expect(document.head.querySelector('link[rel="canonical"]'))
  .toHaveAttribute("href", `${globalThis.location.origin}/productos/abc123`)
```

Casos mínimos por página:
- Indexable: título y descripción. Si `robots` es `null`, también conviene comprobarlo.
- Privada o de error: título y `noindex`.
- Con datos: título y descripción armados desde la respuesta (mockeada con MSW), además del recorte y del texto por defecto si aplica.
- Rutas duplicadas: un test en `client/src/app/router.test.jsx` que renderice la ruta alternativa y verifique la canónica.

Referencias: `client/src/components/PageMeta/PageMeta.test.jsx`, `client/src/pages/productDetail/ProductDetail.test.jsx` y `client/src/app/router.test.jsx`.

## Verificar

Desde `client/`:

```bash
npm test
npx eslint src
npm run build
```

Las tres tienen que pasar. Al terminar, listá las páginas que tocaste con su título, si son indexables y si tienen canónica, con links a los archivos. No hagas commit salvo que el usuario lo pida.
