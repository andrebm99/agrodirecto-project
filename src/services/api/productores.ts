import type {
  Asociacion,
  ProductorGestion,
  ProductorPublico,
  ProductorSolicitud,
  Zona,
} from "@/types/api";
import { api, consulta } from "./cliente";

export const productoresApi = {
  directorio: (filtro: { region?: string; atiende?: string } = {}, signal?: AbortSignal) =>
    api.get<ProductorPublico[]>(`/api/productores${consulta(filtro)}`, { signal }),
  detalle: (id: number, signal?: AbortSignal) =>
    api.get<ProductorPublico>(`/api/productores/${id}`, { signal }),
  regiones: (signal?: AbortSignal) => api.get<string[]>("/api/regiones", { signal }),
  asociaciones: () => api.get<Asociacion[]>("/api/asociaciones"),

  gestionados: () => api.get<ProductorGestion[]>("/api/gestion/productores"),
  detalleGestion: (id: number) => api.get<ProductorGestion>(`/api/gestion/productores/${id}`),
  crearMiPerfil: (datos: ProductorSolicitud) =>
    api.post<ProductorGestion>("/api/gestion/productores/mi-perfil", datos),
  registrarAsistido: (datos: ProductorSolicitud) =>
    api.post<ProductorGestion>("/api/gestion/productores/asistidos", datos),
  actualizar: (id: number, datos: ProductorSolicitud) =>
    api.put<ProductorGestion>(`/api/gestion/productores/${id}`, datos),
  verificar: (id: number) => api.post<ProductorGestion>(`/api/gestion/productores/${id}/verificar`),
  reemplazarZonas: (id: number, zonas: Zona[]) =>
    api.put<ProductorGestion>(`/api/gestion/productores/${id}/zonas`, zonas),
};
