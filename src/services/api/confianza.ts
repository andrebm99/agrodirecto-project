import type { Disputa, EstadoDisputa, MotivoDisputa, Resena, Reputacion } from "@/types/api";
import { api, consulta } from "./cliente";

export const confianzaApi = {
  calificar: (pedidoId: number, calificacion: number, comentario?: string) =>
    api.post<Resena>(`/api/pedidos/${pedidoId}/resena`, { calificacion, comentario }),
  resenas: (productorId: number, signal?: AbortSignal) =>
    api.get<Resena[]>(`/api/productores/${productorId}/resenas`, { signal }),
  reputacion: (productorId: number, signal?: AbortSignal) =>
    api.get<Reputacion>(`/api/productores/${productorId}/reputacion`, { signal }),
  reputaciones: (productorIds: number[], signal?: AbortSignal) =>
    api.get<Reputacion[]>(
      `/api/reputaciones${consulta({ productorIds: productorIds.join(",") })}`,
      { signal },
    ),

  reportarProblema: (
    pedidoId: number,
    motivo: MotivoDisputa,
    descripcion: string,
    evidenciaUrl?: string,
  ) => api.post<Disputa>(`/api/pedidos/${pedidoId}/disputa`, { motivo, descripcion, evidenciaUrl }),
  disputa: (id: number) => api.get<Disputa>(`/api/disputas/${id}`),
  enviarDescargo: (id: number, descargo: string, evidenciaUrl?: string) =>
    api.post<Disputa>(`/api/disputas/${id}/descargo`, { descargo, evidenciaUrl }),

  // Administración
  disputasAdmin: (estado?: EstadoDisputa) =>
    api.get<Disputa[]>(`/api/admin/disputas${consulta({ estado })}`),
  resolver: (id: number, aFavorDe: "COMPRADOR" | "PRODUCTOR", resolucion: string) =>
    api.post<Disputa>(`/api/admin/disputas/${id}/resolver`, { aFavorDe, resolucion }),
};
