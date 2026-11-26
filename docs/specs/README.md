# Specs de tareas del frontend — entrega final (2-dic-2026)

Índice completo, calendario, flujo de trabajo y contratos con el backend: en el repo `agrodirecto-backend/docs/specs/` (`README.md` y `contratos.md`). Este directorio contiene las tareas de **P3** (frontend) y las de **P4** que viven en este repo.

| Spec | Rol | PR | Merge |
|---|---|---|---|
| P3-01 Cliente y cold start | P3 | mié 25 | jue 26 |
| P3-02 Errores y accesibilidad | P3 | jue 26 | vie 27 |
| P3-06 Disputas y perfil | P3 | jue 26 | vie 27 |
| P3-04 Subida de imágenes | P3 | vie 27 | vie 27 |
| P3-03 Checkout | P3 | vie 27 | sáb 28 |
| P3-05 Recuperar contraseña | P3 | vie 27 | sáb 28 |
| P3-07 Admin y agente | P3 | sáb 28 | sáb 28 |
| P4-01 Limpieza de plantilla | P4 | mié 25 | jue 26 |
| P4-02 CI (spec en backend) | P4 | mié 25 | jue 26 |
| P4-04 Pruebas de pantallas y Playwright | P4 | sáb 28 | dom 29 |

Prompt base para el agente: *"Lee `docs/specs/<ID>.md`. Implementa solo lo descrito, tests primero, no hagas commit ni añadas Co-Authored-By. Al final lista archivos tocados y cómo verificar."* Verificación: `pnpm test && pnpm typecheck && pnpm lint`.

Dueños de archivos: P3 → `src/components/**`, `src/hooks/**`, `src/services/api/**`; P4 → `tests/**`, `.github/**`, limpieza de plantilla, `docs/**`.
