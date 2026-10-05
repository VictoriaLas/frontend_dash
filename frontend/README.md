# VM Dashboard · Frontend

SPA en **React 19 + Vite** para gestionar máquinas virtuales contra la API FastAPI de `../backend`. Gráficos con **Recharts**.

## Puesta en marcha

Requisitos: Node.js 20 o superior y el backend corriendo en http://localhost:8000 (ver el README principal).

```bash
cd frontend
npm install
npm run dev        # http://localhost:5173
```

Usuarios de prueba: `admin@vmdashboard.com` / `admin123` (Administrador) y `cliente@vmdashboard.com` / `cliente123` (Cliente).

Otros comandos: `npm run build` genera `dist/` y `npm run preview` lo sirve en local.

### Configuración (`.env`, opcional; ver `.env.example`)

| Variable | Por defecto | Para qué |
|---|---|---|
| `BACKEND_URL` | `http://localhost:8000` | A dónde reenvía el proxy de desarrollo las rutas `/api/*` |
| `VITE_API_URL` | `/api` | Base de la API que usa el navegador |

## Cómo habla con la API

- El navegador llama a `/api/...` y Vite (en desarrollo) o Render (en producción) lo reenvía al backend quitando el prefijo. Así la SPA y la API comparten origen: la cookie de sesión es de primera parte y `SameSite=Lax` funciona sin tocar nada.
- **El token nunca pasa por JavaScript.** `POST /login` deja el JWT en una cookie `HttpOnly`; todas las peticiones usan `credentials: "include"`. Al recargar, `GET /me` dice si sigue habiendo sesión y con qué rol. `localStorage` solo guarda la preferencia de tema.
- Si una petición devuelve 401 (sesión caducada), el `AuthContext` cierra la sesión en la interfaz, avisa con un toast y las rutas privadas redirigen al login.
- **Tiempo real:** `useRealtime` abre `/api/ws` (la cookie viaja en el handshake) y recibe `vm.created`, `vm.updated` y `vm.deleted`. El estado global se actualiza y la fila o tarjeta cambiada se resalta con una animación breve. Si la conexión cae, reintenta con espera exponencial y recarga la lista al volver. La cabecera muestra "En vivo" mientras está conectada.

## Funcionalidades

| Requisito | Dónde |
|---|---|
| Ruta pública `/login` | `pages/LoginPage.jsx`, `routes/guards.jsx` (`PublicOnlyRoute`) |
| Dashboard privado `/dashboard` | `pages/DashboardPage.jsx` |
| Listado privado `/vms` | `pages/VmListPage.jsx`, `components/VmTable.jsx` |
| Crear y editar `/vms/new`, `/vms/:id/edit` (solo Administrador) | `pages/VmFormPage.jsx`, `routes/guards.jsx` (`AdminRoute`) |
| Botones de crear, editar y borrar ocultos (no renderizados) para Cliente | `isAdmin` en `VmListPage` y `VmTable` |
| Validación en tiempo real (RAM negativa, formato del nombre, rangos, nombre repetido) | `lib/validation.js` (mismas reglas que el backend) |
| Optimistic UI con reversión | `context/VmsContext.jsx` |
| Gráficos de recursos de las VMs activas | `components/charts/` |
| Skeletons, toasts y estados vacíos | `components/Skeleton.jsx`, `context/ToastContext.jsx`, `components/EmptyState.jsx` |
| Modo oscuro nativo (sigue al sistema y se puede cambiar) | `context/ThemeContext.jsx`, variables CSS en `styles.css` |
| Tiempo real con WebSocket | `hooks/useRealtime.js` |

### Optimistic UI

`VmsContext` guarda las VMs en un `useReducer`. Al crear, editar o borrar:

1. El cambio se aplica al estado al instante (una VM nueva lleva un id temporal negativo y la marca `pending`, que se ve como "Guardando…").
2. Se llama a la API.
3. Si responde bien, se sustituye la versión optimista por la del servidor y se muestra un toast de éxito.
4. Si falla, se restaura la versión anterior (o se quita la VM creada) y se muestra un toast de error con el motivo.

El resumen de los gráficos se calcula en el cliente a partir de ese mismo estado (`lib/summary.js`), así las gráficas también reaccionan al momento.

### Gráficos (Recharts)

- **Recursos de las VMs activas:** barras radiales con la suma de cores, RAM y disco de las VMs en ejecución como porcentaje del total asignado; el valor absoluto va en la leyenda y en los KPIs.
- **Estado de las VMs:** gráfico de dona.
- **VMs por sistema operativo:** barras horizontales.
- **Recursos por VM:** barras verticales, con selector de métrica (RAM, cores o disco).
- **Detalle de una VM:** serie temporal de CPU, RAM y disco (área o líneas) con rangos de 1 h, 6 h, 24 h y 7 días, y barras de uso actual. Las métricas las simula el backend.

Cada gráfico tiene tooltip y un botón "Tabla" que muestra los mismos datos en una tabla accesible.

**Por qué Recharts:** es una librería de componentes React (los gráficos se declaran en JSX y se actualizan con el estado, sin manejar instancias de canvas), cubre todos los tipos que necesitamos (barras, líneas, áreas, dona, radiales), es SVG y por tanto se estiliza con las mismas variables CSS del tema claro y oscuro. **Chart.js** (con `react-chartjs-2`) era la alternativa: dibuja en canvas, rinde mejor con decenas de miles de puntos, pero es imperativo y el tema hay que pasarlo por JavaScript. Con unas decenas de VMs, Recharts encaja mejor.

## Estructura de carpetas

```
src/
├── api/client.js          # fetch con credentials: "include", errores y URL del WebSocket
├── context/               # estado global con Context + useReducer
│   ├── AuthContext.jsx    #   sesión y rol (GET /me, login, logout, 401)
│   ├── VmsContext.jsx     #   VMs, mutaciones optimistas y eventos en tiempo real
│   ├── ToastContext.jsx   #   notificaciones
│   └── ThemeContext.jsx   #   modo claro/oscuro
├── hooks/useRealtime.js   # WebSocket con reconexión
├── routes/guards.jsx      # PrivateRoute, AdminRoute, PublicOnlyRoute
├── layouts/AppLayout.jsx  # cabecera y navegación de las rutas privadas
├── pages/                 # una por ruta
├── components/            # piezas reutilizables (tabla, modales, skeletons…)
│   └── charts/            # gráficos Recharts y su marco común
└── lib/                   # formato, validación y cálculo del resumen
```

Decisiones:

- **Context + `useReducer` en lugar de Redux o Zustand:** hay dos dominios de estado (sesión y VMs) y el reducer de VMs deja las transiciones optimistas en un único sitio fácil de probar. Sin dependencias extra.
- **React Router 7** para las rutas públicas y privadas, con guardas como rutas anidadas.
- **CSS plano con variables** para los temas: el modo oscuro cambia los tokens y todo, gráficos incluidos, lo hereda.
- **JavaScript sin TypeScript**, para que el proyecto sea fácil de abrir y revisar.

## Despliegue en Render

`render.yaml` (en la raíz) crea un *Static Site* `vm-dashboard-web` junto a la API. Reescribe `/api/*` hacia `https://vm-dashboard-api.onrender.com/*` (cámbialo si tu API tiene otra URL) y sirve `index.html` para el resto de rutas de la SPA. La API debe tener la URL del frontend en `VMD_CORS_ORIGINS`, porque el WebSocket comprueba el origen.

Las reescrituras de un Static Site de Render reenvían peticiones HTTP; si no reenvían el WebSocket, la app funciona igual pero sin actualizaciones en vivo (la cabecera muestra "Sin tiempo real"). Para tener tiempo real en producción sin depender de eso, la alternativa es servir `dist/` desde el propio backend.
