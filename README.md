# E-commerce Mueblería Hermanos Jota

Aplicación web de e-commerce para la mueblería **Hermanos Jota**. El proyecto
permite explorar el catálogo de productos, consultar el detalle de cada pieza,
agregar productos a un carrito y enviar consultas desde la sección de contacto.

## Integrantes

- Munné Lautaro
- Fabricio Ibarra
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
- MongoDB con Mongoose
- JWT y Google OAuth
- Yup
- CORS, cookies y rate limiting

### Chatbot

- n8n
- Docker
- MongoDB Atlas para persistir los mensajes del workflow

## Requisitos previos

- Node.js 18 o superior.
- npm.
- Docker Desktop, para ejecutar n8n.(intentamos hacer el deploy pero los planes gratuitos de render no lo soportaban bien)
- Una base de datos MongoDB Atlas.

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

| Variable               | Valor predeterminado                          | Descripción                                                                         |
| ---------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------- |
| `PORT`                 | `3000`                                        | Puerto en el que se inicia la API.                                                  |
| `CORS_WHITELIST`       | `http://localhost:5173,http://localhost:5174` | Orígenes permitidos para realizar peticiones a la API, separados por comas.         |
| `MONGODB_URI`          | —                                             | Cadena de conexión de MongoDB para usuarios, autenticación y consultas de contacto. |
| `MONGODB_DNS_SERVERS`  | `1.1.1.1,8.8.8.8`                             | Servidores DNS utilizados para resolver la conexión a MongoDB Atlas.                |
| `JWT_SECRET`           | —                                             | Clave secreta utilizada para firmar los tokens JWT.                                 |
| `JWT_EXPIRES_IN`       | `1d`                                          | Tiempo de expiración de los tokens JWT.                                             |
| `GOOGLE_CLIENT_ID`     | —                                             | Client ID utilizado por el backend para validar el inicio de sesión con Google.     |
| `N8N_CHAT_WEBHOOK_URL` | —                                             | URL del webhook de chat de n8n utilizado por el asistente.                          |

Para cambiar estos valores, crear un archivo `backend/.env`:

```env
PORT=3000
CORS_WHITELIST=http://localhost:5173,http://127.0.0.1:5173
MONGODB_URI=mongodb+srv://<usuario>:<contraseña>@<cluster>/<base-de-datos>
MONGODB_DNS_SERVERS=1.1.1.1,8.8.8.8
JWT_SECRET=una-clave-secreta-larga-y-segura
GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
N8N_CHAT_WEBHOOK_URL=http://localhost:5678/webhook/tu-webhook/chat
```

### URL de la API en el cliente

Por defecto, el cliente utiliza:

```text
http://localhost:3000/api
```

Si se necesita utilizar otra URL, crear `client/.env` con:

```env
VITE_API_URL=http://localhost:3000/api
VITE_GOOGLE_CLIENT_ID=tu-client-id.apps.googleusercontent.com
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

## Chatbot con n8n en Docker

El cliente muestra el asistente de Hermanos Jota y envía los mensajes al
endpoint `POST /api/chat` del backend. El backend valida el mensaje y lo
reenvía al webhook de n8n mediante `N8N_CHAT_WEBHOOK_URL`. El workflow de n8n
procesa la consulta y guarda los mensajes en MongoDB Atlas.

### 1. Iniciar n8n con Docker Compose

Crear una carpeta para n8n y guardar el siguiente contenido como
`docker-compose.yml`:

```yaml
version: "3.8"

volumes:
  n8n_data:

services:
  n8n:
    image: docker.io/n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=localhost
      - WEBHOOK_URL=http://localhost:5678/
      - GENERIC_TIMEZONE=America/Argentina/Buenos_Aires
    volumes:
      - n8n_data:/home/node/.n8n
```

Iniciar el contenedor:

```bash
docker compose up -d
```

Abrir n8n en `http://localhost:5678` y crear el usuario administrador cuando
la instalación lo solicite. El volumen `n8n_data` conserva las credenciales,
workflows y configuración aunque se reinicie el contenedor.

### 2. Importar y configurar el workflow

1. Abrir n8n y seleccionar **Import from File**.
2. Seleccionar el workflow del chatbot.
3. Configurar en n8n las credenciales y la conexión a MongoDB Atlas que utilice
   el workflow para persistir los mensajes.
4. Verificar que el workflow tenga un Webhook de producción y que esté activo.
5. Copiar la URL de producción del webhook en `backend/.env`:

```env
N8N_CHAT_WEBHOOK_URL=http://localhost:5678/webhook/tu-webhook/chat
```

El backend local puede acceder a n8n mediante `localhost` porque el puerto
`5678` se publica desde Docker. Si el backend también se ejecuta dentro de un
contenedor, se debe reemplazar `localhost` por el nombre del servicio de n8n
en la red de Docker.

### 3. Probar el chatbot

Con n8n y el backend iniciados, se puede probar directamente la API:

```powershell
Invoke-RestMethod -Method Post http://localhost:3000/api/chat `
  -ContentType "application/json" `
  -Body '{"message":"¿Qué productos tienen disponibles?","sessionId":"prueba-local"}'
```

El endpoint acepta mensajes de hasta 2000 caracteres y limita el uso a 20
solicitudes por cada 10 minutos. El `sessionId` permite que el workflow
identifique la conversación y gestione su historial.

Para detener n8n sin eliminar los datos:

```bash
docker compose stop
```

Para detenerlo y eliminar el contenedor, conservando el volumen:

```bash
docker compose down
```

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

| Método   | Ruta                 | Descripción                                                                                                                                                                                                      |
| -------- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`    | `/api/productos`     | Devuelve el listado completo de productos.                                                                                                                                                                       |
| `GET`    | `/api/productos/:id` | Devuelve un producto por su identificador.                                                                                                                                                                       |
| `POST`   | `/api/productos`     | Crea un producto con nombre, precio, stock, descripción, medidas, URL de imagen y atributos personalizados. El SKU se genera automáticamente con prefijo `HJ-`. La protección por rol está temporalmente desactivada. |
| `PUT`    | `/api/productos/:id` | Actualiza un producto. La protección por rol está temporalmente desactivada.                                                                                                                                        |
| `DELETE` | `/api/productos/:id` | Desactiva un producto del catálogo sin eliminar sus datos. La protección por rol está temporalmente desactivada.                                                                                                    |
| `POST`   | `/api/contacto`      | Valida y guarda una consulta de contacto en MongoDB.                                                                                                                                                             |
| `POST`   | `/api/auth/register` | Registra un usuario y devuelve un JWT.                                                                                                                                                                           |
| `POST`   | `/api/auth/login`    | Autentica un usuario y devuelve un JWT.                                                                                                                                                                          |
| `POST`   | `/api/chat`          | Envía un mensaje al workflow de n8n y devuelve la respuesta del asistente.                                                                                                                                       |
| `GET`    | `/api/auth/me`       | Devuelve el usuario autenticado. Requiere `Authorization: Bearer <token>`.                                                                                                                                       |

Para habilitar el panel de carga, registrá primero el usuario y asignale el rol `admin` directamente en MongoDB:

```js
db.users.updateOne({ email: "admin@ejemplo.com" }, { $set: { role: "admin" } })
```

Luego iniciá sesión con ese usuario y accedé a `/admin`. Desde allí podés
crear productos o editar los existentes. Para futuras entregas se volverá a
habilitar completamente el control de roles y estas operaciones requerirán
nuevamente un usuario autenticado con rol `admin`.

Los precios aceptan puntos como separadores de miles (`500.000`) y coma para centavos
(`500.000,50`). También se acepta el formato decimal técnico (`500.50`).

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
- **Services** concentra la lógica de negocio y las integraciones externas.
- **Models** define los documentos persistidos en MongoDB mediante Mongoose.
- **Schemas** valida los datos de entrada antes de ejecutar la lógica de negocio.
- **Middlewares** centraliza autenticación, validación, rate limiting, CORS,
  registro de peticiones y manejo de errores.
- **Config** contiene la configuración de CORS.

MongoDB Atlas almacena usuarios, productos y consultas de contacto. El chatbot
se integra mediante n8n; la persistencia de sus mensajes la realiza el
workflow en MongoDB Atlas.

### Frontend

El frontend utiliza una arquitectura basada en páginas, componentes y
features:

- **`app/`** configura los proveedores globales y las rutas.
- **`pages/`** representa las vistas asociadas a cada ruta.
- **`components/`** contiene componentes reutilizables de estructura, como el
  layout, header y footer.
- **`features/`** agrupa la lógica propia de cada dominio, como productos,
  carrito y contacto.
- El estado del carrito se gestiona con **React Context**, para compartirlo de
  forma clara y consistente entre los componentes que lo necesitan. Lo integramos de esta forma
  ya que todos contamos con los conocimientos para realizarlo de esta forma.
- **`services/`** centraliza las peticiones HTTP a la API.
- **`styles/`** contiene estilos globales y ajustes de terceros.

Las rutas principales son:

- `/` — Inicio.
- `/productos` — Catálogo.
- `/productos/:id` — Detalle de producto.
- `/admin/crear-producto` — Formulario para cargar productos y atributos personalizados.
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
- **MongoDB Atlas y Mongoose:** centralizan la persistencia de usuarios,
  productos y consultas de contacto, manteniendo los modelos y las reglas de
  validación en el backend.
- **Autenticación con JWT y Google OAuth:** permite autenticación local y
  federada, con roles para distinguir usuarios administradores.
- **Panel de administración:** la protección por rol se encuentra
  temporalmente desactivada para esta entrega. En futuras entregas se
  habilitará completamente el control de roles para que las operaciones de
  alta, edición y desactivación requieran un usuario autenticado con rol
  `admin`.
- **Arquitectura por capas en el backend:** routes, controllers, services,
  models y schemas separan responsabilidades y facilitan el mantenimiento.
- **Controles de seguridad en el backend:** se combinan CORS explícito,
  validación de entradas, autenticación, cookies, rate limiting y un manejo
  centralizado de errores.
- **Integración del chatbot mediante n8n:** el backend funciona como frontera
  de la API y no expone públicamente la URL del workflow al cliente. n8n
  procesa el mensaje y persiste el historial en MongoDB Atlas.
- **Variables de entorno:** permite cambiar puertos, orígenes CORS y la URL de
  la API sin modificar el código fuente.
- **CORS explícito:** restringe los orígenes que pueden comunicarse con el
  backend y conserva habilitados los puertos locales utilizados durante el
  desarrollo.
- **Tailwind CSS y tokens de marca:** centraliza la identidad visual,
  tipografías, colores, espaciados y utilidades reutilizables.
