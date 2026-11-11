import type {
  Categoria,
  FiltroCatalogo,
  PrecioReferencia,
  ProductoDetalle,
  ProductoGestion,
  ProductoResumen,
  ProductoSolicitud,
  EstadoProducto,
} from "@/types/api";
import { api, consulta } from "./cliente";

export const catalogoApi = {
  buscar: (filtro: FiltroCatalogo = {}) =>
    api.get<ProductoResumen[]>(`/api/productos${consulta({ ...filtro })}`),
  detalle: (id: number) => api.get<ProductoDetalle>(`/api/productos/${id}`),
  categorias: () => api.get<Categoria[]>("/api/categorias"),
  preciosReferencia: () => api.get<PrecioReferencia[]>("/api/precios-referencia"),

  favoritos: () => api.get<ProductoResumen[]>("/api/favoritos"),
  agregarFavorito: (productoId: number) => api.put<void>(`/api/favoritos/${productoId}`, {}),
  quitarFavorito: (productoId: number) => api.delete<void>(`/api/favoritos/${productoId}`),
};

/** Productos de quien gestiona: el agricultor, su agente o la administración. */
export const gestionProductosApi = {
  listar: (productorId?: number) =>
    api.get<ProductoGestion[]>(`/api/gestion/productos${consulta({ productorId })}`),
  detalle: (id: number) => api.get<ProductoGestion>(`/api/gestion/productos/${id}`),
  crear: (datos: ProductoSolicitud) => api.post<ProductoGestion>("/api/gestion/productos", datos),
  actualizar: (id: number, datos: ProductoSolicitud) =>
    api.put<ProductoGestion>(`/api/gestion/productos/${id}`, datos),
  cambiarEstado: (id: number, estado: EstadoProducto) =>
    api.patch<ProductoGestion>(`/api/gestion/productos/${id}/estado`, { estado }),
};
