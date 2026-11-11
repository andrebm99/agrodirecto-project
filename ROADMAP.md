# Roadmap del frontend — AgroDirecto

El objetivo es conectar el prototipo del Avance 1 (datos en `localStorage`) con la API real del backend
([`agrodirecto-backend`](https://github.com/lesssC/agrodirecto-backend)), **manteniendo la identidad visual** que ya se presentó
y puliéndola con la skill de diseño Impeccable.

Cada tarea se desarrolla en su propia rama, se prueba y se integra a `main` con su commit.

## Resumen

| #   | Rama                          | Tarea                                                                            | Tema del curso (Unidad 2)                     | Estado     |
| --- | ----------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------- | ---------- |
| F0  | `chore/cliente-api`           | Cliente HTTP, tipos y servicios de la API                                        | S11–12 Consumo de API y peticiones asíncronas | Completada |
| F1  | `feat/sesion-real`            | Login, registro y verificación en dos pasos reales; menú por rol                 | S13 Autenticación en el frontend              | Completada |
| F2  | `feat/catalogo-api`           | Catálogo, ficha de producto, directorio de productores y favoritos desde la API  | S6 Navegación y estado · S12                  | Completada |
| F3  | `feat/compra`                 | Carrito, cotización transparente, pago simulado, mis pedidos, reclamos y reseñas | S11 Formularios · S12                         | Completada |
| F4  | `feat/panel-productor-agente` | Panel del productor y del agente de campo                                        | S11 Formularios · S12                         | Completada |
| F5  | `feat/tiempo-real`            | Pedidos y stock en vivo con WebSocket; campana de avisos                         | S9–10 Reactividad                             | Completada |
| F6  | `feat/admin`                  | Panel de administración                                                          | S12                                           | Completada |
| F7  | `chore/pulido`                | Diseño, accesibilidad, versión móvil, pruebas y documentación                    | S7–8 Estilos · S14 Despliegue                 | Completada |

Después de F7: despliegue del backend (tarea 11 del backend) y configuración de `VITE_API_URL` en Cloudflare.

## Arquitectura de llegada

Hoy todo el estado vive en un solo hook (`useAgroDirecto.ts`) y se guarda en el navegador. Se reorganiza **por funcionalidad**, igual que los módulos del backend:

```text
src/
  config/api.ts            Dirección del backend (VITE_API_URL)
  types/api.ts             Tipos equivalentes a los DTO del backend
  services/api/            Un servicio por módulo: auth, catalogo, productores, pedidos,
                           confianza, notificaciones, admin (+ cliente HTTP común)
  hooks/                   Estado por funcionalidad: useSesion, useCatalogo, useCarrito,
                           usePedidos, useGestion, useTiempoReal, useAdmin
  screens/                 Pantallas (se conservan y se agregan las nuevas)
  components/              Componentes reutilizables
```

- **Se conserva:** la navegación por `#` (`#catalogo`, `#producto/1`), Bootstrap, Leaflet, los estilos y las imágenes.
- **Se elimina:** los datos de demostración en el código (`data/products.ts`, `data/orders.ts`) y el uso de `localStorage` para productos y pedidos. Solo quedan en el navegador el carrito (antes de confirmar) y el token de sesión.
- **Dependencias nuevas:** `vitest` (pruebas unitarias, F0), `qrcode` (código QR del segundo factor, F1) y `@stomp/stompjs` (WebSocket, F5).

## Detalle por tarea

### F0 · Cliente de la API — `chore/cliente-api`

- `VITE_API_URL` en `.env.local` (plantilla en `.env.example`), con `http://localhost:8080` por defecto.
- Cliente HTTP:
  - adjunta el JWT en cada petición;
  - convierte los errores del backend en `ApiError`, con el estado, la **regla de negocio** (`RN-01`, etc.) y un mensaje legible;
  - ante un 401, cierra la sesión y avisa a la aplicación;
  - si no hay conexión, muestra un mensaje en lenguaje simple.
- Tipos de todas las respuestas del backend y un servicio por módulo.
- Vitest con pruebas del cliente.
- Corrección del error de lint en `Footer.tsx`.
- Verificado en F1: `VITE_API_URL` llega a la compilación.

### F1 · Sesión real — `feat/sesion-real`

- **Login** con correo y contraseña reales y la opción "Recordarme".
- **Segundo paso** para administradores y agentes: pantalla para ingresar el código de 6 dígitos o un código de respaldo.
- **Activación del segundo factor:** código QR para Google Authenticator, clave para ingresarla a mano y entrega de los 8 códigos de respaldo.
- **Registro** de comprador, productor o agente, con DNI, RUC y razón social según el rol, y validaciones iguales a las del backend.
- Sesión compartida (`useSesion`): usuario actual, cierre de sesión y aviso cuando la sesión expira.
- **Menú y panel según el rol:** comprador, productor, **agente** (nuevo) y administrador. Las pantallas privadas redirigen al login.
- Corrección del error previo: las pestañas del login usaban `"cliente"` en lugar de `"comprador"`.

### F2 · Catálogo y productores — `feat/catalogo-api`

- **Inicio** con productos destacados reales.
- **Catálogo** con búsqueda que ignora tildes, categorías, **región de entrega**, orgánico y orden por precio o cosecha.
- **Ficha del producto:**
  - presentaciones (pequeña, intermedia, mayorista) con precio por kg y descuento por volumen;
  - **comparación con el precio de mercado** (RN-A2);
  - reputación del productor;
  - zonas de cobertura;
  - mapa con la ubicación aproximada.
- **Directorio de productores** (pantalla nueva, la que pedía el informe), con perfil, historia, prácticas, reseñas y nivel de reputación.
- **Favoritos** guardados en el servidor.
- Estados de carga, error y "sin resultados" en cada pantalla.

### F3 · Compra — `feat/compra`

- **Carrito** por presentación: adelantado a F2, porque la ficha del producto ya agrega presentaciones.
- **Checkout:**
  - región de destino, modalidad de entrega y dirección;
  - **cotización con el desglose transparente**: cuánto recibe el agricultor y cuánto es el servicio (RN-A5).
- **Pago simulado** (Yape, Plin, tarjeta o transferencia), explicando que el dinero queda retenido hasta la entrega.
- **Mis pedidos:** estado, historial y los botones que permite cada estado (pagar, cancelar, confirmar recepción, reportar un problema con foto, calificar).
- Los errores de negocio (RN-03, RN-09, RN-10, RN-11, RN-18) se muestran en lenguaje simple y con una sugerencia de qué hacer.

### F4 · Panel del productor y del agente — `feat/panel-productor-agente`

- **Productor:**
  - mis productos, con alta y edición de varias presentaciones;
  - **alertas de precio bajo** (RN-A3);
  - publicar, guardar como borrador o retirar;
  - perfil, medio de cobro y zonas de cobertura.
- **Pedidos recibidos:** aceptar o rechazar, avanzar de estado y ver los datos de contacto cuando corresponde.
- **Agente de campo** (pantallas nuevas):
  - mis agricultores;
  - **registro asistido**;
  - **verificación presencial**;
  - mensajes SMS y WhatsApp enviados a cada agricultor, con el botón para reenviar por WhatsApp.
- Presentación del **descargo** en las disputas.

### F5 · Tiempo real — `feat/tiempo-real`

- Conexión STOMP a `/ws` con el JWT y reconexión automática.
- El comprador ve **sus pedidos cambiar de estado en vivo**.
- El productor y el agente ven **llegar los pedidos pagados** sin recargar.
- La ficha del producto muestra el **stock en vivo**.
- **Campana de avisos** con el contador de no leídos.

### F6 · Administración — `feat/admin`

- **Resumen** con el indicador **% del dinero que llega al agricultor**, el dinero transado, las comisiones, el dinero retenido y los pedidos por estado.
- Cuentas: verificar, suspender o reactivar, siempre con motivo.
- Productores: suspender y reasignar agente.
- **Disputas:** evidencia del comprador, descargo del agricultor y resolución.
- Precios de referencia y registro de **auditoría**.

### F7 · Pulido — `chore/pulido`

- Revisión con **Impeccable**: `audit` (accesibilidad, rendimiento y versión móvil), `critique`, `polish`, `harden` (errores y casos límite), `adapt` (pantallas pequeñas) y `onboard` (estados vacíos y primer uso).
- Formato Prettier de los 9 archivos que ya estaban sin formatear en `main`.
- Actualización de las pruebas de renderizado, del `README.md` y de `docs/estructura.md`.
- Capturas nuevas para el informe.

## Cómo probar con el backend

```bash
# Backend (otra terminal), en agrodirecto-backend:
docker compose up -d && ./mvnw spring-boot:run   # API en http://localhost:8080

# Frontend:
cp .env.example .env.local
pnpm install && pnpm dev                          # http://localhost:3000
pnpm test                                         # pruebas unitarias + compilación + renderizado
```
