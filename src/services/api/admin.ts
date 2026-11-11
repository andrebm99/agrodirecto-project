import type {
  AccionAdministrativa,
  EstadoCuenta,
  PrecioReferencia,
  ProductorGestion,
  ResumenAdmin,
  RolApi,
  Usuario,
} from "@/types/api";
import { api, consulta } from "./cliente";

export interface PrecioReferenciaSolicitud {
  clave: string;
  nombre: string;
  precioMayoristaKg: number;
  precioMinoristaKg: number;
  fuente: string;
  fecha: string;
}

/** Toda acción de la administración exige un motivo: queda en la auditoría. */
export const adminApi = {
  resumen: () => api.get<ResumenAdmin>("/api/admin/resumen"),
  usuarios: (filtro: { rol?: RolApi; verificado?: boolean; estado?: EstadoCuenta } = {}) =>
    api.get<Usuario[]>(`/api/admin/usuarios${consulta(filtro)}`),
  verificarUsuario: (id: number, motivo: string) =>
    api.post<Usuario>(`/api/admin/usuarios/${id}/verificar`, { motivo }),
  suspenderUsuario: (id: number, motivo: string) =>
    api.post<Usuario>(`/api/admin/usuarios/${id}/suspender`, { motivo }),
  reactivarUsuario: (id: number, motivo: string) =>
    api.post<Usuario>(`/api/admin/usuarios/${id}/reactivar`, { motivo }),
  suspenderProductor: (id: number, motivo: string) =>
    api.post<ProductorGestion>(`/api/admin/productores/${id}/suspender`, { motivo }),
  reactivarProductor: (id: number, motivo: string) =>
    api.post<ProductorGestion>(`/api/admin/productores/${id}/reactivar`, { motivo }),
  reasignarAgente: (id: number, agenteId: number, motivo: string) =>
    api.post<ProductorGestion>(`/api/admin/productores/${id}/agente`, { agenteId, motivo }),
  crearPrecio: (datos: PrecioReferenciaSolicitud) =>
    api.post<PrecioReferencia>("/api/admin/precios-referencia", datos),
  actualizarPrecio: (id: number, datos: PrecioReferenciaSolicitud) =>
    api.put<PrecioReferencia>(`/api/admin/precios-referencia/${id}`, datos),
  auditoria: (filtro: { objetivo?: string; objetivoId?: number } = {}) =>
    api.get<AccionAdministrativa[]>(`/api/admin/auditoria${consulta(filtro)}`),
};
