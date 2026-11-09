# Organización del proyecto

El código de la aplicación está en `src`. Los archivos de configuración permanecen en la raíz porque las herramientas de desarrollo los buscan allí.

```text
src/
  app/              # Entrada de la aplicación y metadatos
  components/       # Elementos reutilizables y contenedor principal
    layout/         # Cabecera y pie de página
  screens/          # Las doce pantallas del prototipo
  hooks/            # Estado compartido y acciones de la aplicación
  types/            # Tipos de productos, pedidos, perfiles y vistas
  data/             # Productos y pedidos de demostración
  config/           # Nombres de vistas y pasos de los pedidos
  services/         # Lectura del almacenamiento del navegador
  utils/            # Formato de moneda, estados y preparación de imágenes
  styles/           # Estilos globales
  db/               # Preparación para Drizzle/D1; esquema todavía vacío
  worker/           # Entrada del servidor de Cloudflare
  integrations/     # Integraciones opcionales, separadas del flujo principal
public/             # Imágenes y recursos públicos
tests/              # Pruebas del HTML generado y del alcance del prototipo
docs/               # Documentación y capturas
build/              # Complemento de empaquetado para el despliegue
drizzle/            # Archivos de migración, cuando se defina el esquema
examples/           # Ejemplos de integraciones; no son funciones implementadas
```

## Por dónde empezar

1. `src/app/page.tsx` carga `src/components/AgroDirectoApp.tsx`.
2. `AgroDirectoApp` obtiene el estado de `src/hooks/useAgroDirecto.ts` y selecciona la pantalla según la navegación actual.
3. Cada pantalla de `src/screens` recibe mediante propiedades únicamente los datos y las acciones que necesita. Sus tipos se derivan del hook para mantenerlos sincronizados.
4. Los componentes comunes, como las tarjetas de producto, los indicadores de estado y el mapa, están en `src/components`.

La navegación conserva las direcciones con `#`, por ejemplo `#catalogo` o `#producto/1`. Las pantallas de `screens` son componentes; no son rutas independientes del servidor.

## Dónde hacer cambios

| Cambio                                        | Archivo o carpeta             |
| --------------------------------------------- | ----------------------------- |
| Página de inicio                              | `src/screens/Home.tsx`        |
| Catálogo y filtros visuales                   | `src/screens/Catalog.tsx`     |
| Formulario de publicación                     | `src/screens/ProductForm.tsx` |
| Reglas del carrito, pedidos y sesión simulada | `src/hooks/useAgroDirecto.ts` |
| Productos iniciales e imágenes disponibles    | `src/data/products.ts`        |
| Pedidos iniciales                             | `src/data/orders.ts`          |
| Claves y lectura de localStorage              | `src/services/storage.ts`     |
| Diseño y adaptación a móviles                 | `src/styles/globals.css`      |
| Estructura de los datos                       | `src/types/domain.ts`         |

El alias `@/` apunta a `src/`. Por ejemplo, `@/types/domain` corresponde a `src/types/domain.ts`.

## Alcance actual

El hook centraliza el estado porque el prototipo comparte productos, carrito, pedidos y sesión entre pantallas. Esta separación permite modificar la presentación sin mezclarla con las acciones del negocio. Al incorporar el backend, las operaciones remotas se pueden añadir a `services` y conectar desde el hook.

Los datos siguen guardándose en `localStorage`, con las mismas claves para conservar la información existente. Los perfiles son simulados y todavía no hay API de negocio ni persistencia multiusuario.

La configuración de despliegue `.openai/hosting.json` es opcional para compilar localmente. Cuando existe, Vite lee sus enlaces a D1 y R2. Su ausencia no activa una base de datos ni crea credenciales de despliegue.

## Verificación

```bash
pnpm install --frozen-lockfile
pnpm typecheck
pnpm format:check
pnpm lint
pnpm test
pnpm dev
```

`pnpm test` compila la aplicación y ejecuta las pruebas existentes. Las pruebas de alcance inspeccionan archivos fuente; no sustituyen una comprobación interactiva de todos los recorridos.

`pnpm format` aplica el formato compartido con Prettier. Los scripts también se pueden ejecutar con `npm run`, manteniendo pnpm para instalar dependencias y conservar un solo archivo de bloqueo.
