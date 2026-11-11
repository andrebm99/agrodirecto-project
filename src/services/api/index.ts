/** Punto único de acceso a la API: un servicio por módulo del backend. */
export { ApiError, api, consulta } from "./cliente";
export { authApi } from "./auth";
export { catalogoApi, gestionProductosApi } from "./catalogo";
export { productoresApi } from "./productores";
export { pedidosApi, pedidosRecibidosApi } from "./pedidos";
export { confianzaApi } from "./confianza";
export { notificacionesApi } from "./notificaciones";
export { adminApi } from "./admin";
export { guardarToken, borrarToken, leerToken, EVENTO_SESION_EXPIRADA } from "./sesion";
