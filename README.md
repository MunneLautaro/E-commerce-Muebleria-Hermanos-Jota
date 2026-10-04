# E-commerce Mueblería Hermanos Jota

Aplicación web de e-commerce para la mueblería **Hermanos Jota**. El proyecto
permite explorar el catálogo de productos, consultar el detalle de cada pieza,
agregar productos a un carrito y enviar consultas desde la sección de contacto.

## Integrantes

- Munné Lautaro
- Fabricio Ibarra
- Giovinazzo Sofia Belén
- Ariadna Luz Chiapin
- Guido Sut

## Tecnologías

### Cliente

- React 19
- Vite
- React Router
- Tailwind CSS
- React Toastify

### Servidor

- Node.js
- Express
- CORS
- dotenv

## Requisitos previos

- Node.js 18 o superior.
- npm.

## Instalación

Clonar el repositorio y acceder a su carpeta raíz:

```bash
git clone https://github.com/MunneLautaro/E-commerce-Muebleria-Hermanos-Jota.git
cd E-commerce-Muebleria-Hermanos-Jota
```

Instalar las dependencias del servidor:

```bash
cd backend
npm install
```

En otra terminal, instalar las dependencias del cliente:

```bash
cd client
npm install
```

## Configuración

### Variables del servidor

El servidor admite las siguientes variables de entorno:

| Variable         | Valor predeterminado                          | Descripción                                                                 |
| ---------------- | --------------------------------------------- | --------------------------------------------------------------------------- |
| `PORT`           | `3000`                                        | Puerto en el que se inicia la API.                                          |
| `CORS_WHITELIST` | `http://localhost:5173,http://localhost:5174` | Orígenes permitidos para realizar peticiones a la API, separados por comas. |

Para cambiar estos valores, crear un archivo `backend/.env`:

```env
PORT=3000
CORS_WHITELIST=http://localhost:5173
```

### URL de la API en el cliente

Por defecto, el cliente utiliza:

```text
http://localhost:3000/api
```

Si se necesita utilizar otra URL, crear `client/.env` con:

```env
VITE_API_URL=http://localhost:3000/api
```

Los archivos `.env` no deben subirse al repositorio porque pueden contener
configuración específica del entorno.

## Ejecución en desarrollo

Se deben ejecutar ambos servidores en terminales separadas.

### Servidor backend

```bash
cd backend
npm run dev
```

La API quedará disponible en `http://localhost:3000`.

También se puede iniciar sin el modo de recarga automática:

```bash
npm start
```

### Cliente frontend

```bash
cd client
npm run dev
```

Vite mostrará en la terminal la URL local, normalmente
`http://localhost:5173`.

## Deploy

- **Frontend:** [E-commerce Mueblería Hermanos Jota](https://e-commerce-muebleria-hermanos-jota-alpha.vercel.app/)
- **Backend/API:** [API de productos](https://e-commerce-muebleria-hermanos-jota-virid.vercel.app/api/productos)

## Otros comandos del cliente

Crear una compilación de producción:

```bash
cd client
npm run build
```

Previsualizar la compilación de producción:

```bash
npm run preview
```

Ejecutar el linter:

```bash
npm run lint
```

## API disponible

La API utiliza el prefijo `/api`.

| Método | Ruta                 | Descripción                                |
| ------ | -------------------- | ------------------------------------------ |
| `GET`  | `/api/productos`     | Devuelve el listado completo de productos. |
| `GET`  | `/api/productos/:id` | Devuelve un producto por su identificador. |

Ejemplo:

```bash
curl http://localhost:3000/api/productos
```

## Arquitectura

El proyecto está dividido en dos aplicaciones independientes:

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── index.js
│   │   └── server.js
│   └── package.json
└── client/
    ├── src/
    │   ├── app/
    │   ├── components/
    │   ├── features/
    │   ├── pages/
    │   ├── services/
    │   └── styles/
    └── package.json
```

### Backend

El backend sigue una separación por responsabilidades:

- **Routes** define las rutas HTTP y delega el procesamiento.
- **Controllers** recibe las peticiones, devuelve las respuestas y gestiona
  los códigos de error.
- **Services** concentra la lógica de acceso a los datos.
- **Models** abstrae la fuente de datos del catálogo.
- **Data** contiene actualmente el catálogo en memoria.
- **Middlewares** centraliza el registro de peticiones y el manejo de errores.
- **Config** contiene la configuración de CORS.

La API está preparada para reemplazar el catálogo en memoria por una base de
datos sin modificar las rutas ni la interfaz que consume el cliente.

### Frontend

El frontend utiliza una arquitectura basada en páginas, componentes y
features:

- **`app/`** configura los proveedores globales y las rutas.
- **`pages/`** representa las vistas asociadas a cada ruta.
- **`components/`** contiene componentes reutilizables de estructura, como el
  layout, header y footer.
- **`features/`** agrupa la lógica propia de cada dominio, como productos,
  carrito y contacto.
- **`services/`** centraliza las peticiones HTTP a la API.
- **`styles/`** contiene estilos globales y ajustes de terceros.

Las rutas principales son:

- `/` — Inicio.
- `/productos` — Catálogo.
- `/productos/:id` — Detalle de producto.
- `/contacto` — Formulario de contacto.

## Decisiones tomadas

- **Separación frontend/backend:** permite desarrollar, probar y desplegar la
  interfaz y la API de forma independiente.
- **React Router:** centraliza la navegación del cliente y permite mantener un
  layout compartido entre las páginas.
- **Organización por features:** mantiene juntas la UI, el estado y la lógica
  de cada dominio, facilitando el mantenimiento y la ampliación del proyecto.
- **Context API para el carrito:** el carrito debe estar disponible desde
  distintos componentes, por lo que se comparte mediante `CartProvider` sin
  incorporar una librería de estado global adicional.
- **Capa de servicios en ambos lados:** desacopla las páginas y controladores
  de la forma concreta en que se obtienen los datos.
- **Catálogo inicialmente en memoria:** permite tener una API funcional sin
  agregar la complejidad de una base de datos durante esta etapa. El acceso se
  encapsula en el modelo para facilitar una migración posterior.
- **Variables de entorno:** permite cambiar puertos, orígenes CORS y la URL de
  la API sin modificar el código fuente.
- **CORS explícito:** restringe los orígenes que pueden comunicarse con el
  backend y conserva habilitados los puertos locales utilizados durante el
  desarrollo.
- **Tailwind CSS y tokens de marca:** centraliza la identidad visual,
  tipografías, colores, espaciados y utilidades reutilizables.
