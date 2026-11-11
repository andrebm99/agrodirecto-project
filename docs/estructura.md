# Organización del proyecto

El código de la aplicación está en `src`. Los archivos de configuración permanecen en la raíz porque las herramientas los buscan allí.

```text
src/
  app/              Entrada de la aplicación, metadatos y orden de las hojas de estilo
  config/           Dirección de la API (VITE_API_URL), nombres de pantallas y fotos disponibles
  types/            api.ts: tipos equivalentes a los DTO del backend · domain.ts: pantallas y roles
  services/api/     Cliente HTTP (JWT, errores con regla de negocio) y un servicio por módulo del backend
  hooks/            Estado compartido por funcionalidad:
                      useSesion (login, 2FA) · useCatalogo (filtros, favoritos) · useCarrito
                      useGestion (agricultores que administra el usuario) · useTiempoReal (WebSocket)
                      useConsulta (lecturas de la API con carga, error y cancelación)
                      useAgroDirecto (navegación por "#", avisos y modal)
  screens/          Una pantalla por vista (#catalogo, #producto/3, #perfil/2, #pedidos, #productor...)
  components/       Elementos reutilizables; gestion/ agrupa los del panel del productor y del agente
  utils/            Reglas puras y probadas: sesión y permisos, carrito, precio justo, textos de pedidos
  styles/           globals.css (sistema base del Avance 1) + una hoja por funcionalidad
tests/              unit/ (Vitest) y rendered-html.test.mjs (compilación y alcance)
docs/               Documentación y capturas
```

## Cómo fluye una pantalla

1. `src/app/page.tsx` carga `AgroDirectoApp`.
2. `AgroDirectoApp` crea los hooks (sesión, catálogo, carrito, gestión, tiempo real), decide qué pantalla mostrar según la dirección (`#catalogo`) y si el usuario tiene acceso (`utils/sesion.ts`).
3. Cada pantalla recibe solo lo que necesita (`Pick<EstadoApp, ...>`) y lee de la API con `useConsulta` o con los servicios de `services/api`.

## Reglas de la interfaz

- Los montos los calcula siempre el backend; el frontend solo muestra precios referenciales en el carrito.
- En el navegador solo se guardan el token de sesión y el carrito sin confirmar.
- Las pantallas privadas muestran el inicio de sesión en su lugar y, al ingresar, se continúa donde se estaba.
- Los errores de negocio llegan con su regla (`RN-01`, `RN-10`...) y la interfaz explica qué hacer.
- Diseño: ver `DESIGN.md` (concepto "El mercado de chacra", celular primero, texto legible y sin datos inventados).
