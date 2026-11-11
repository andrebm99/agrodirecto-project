import type { Bandeja, Notificacion } from "@/types/api";
import { api } from "./cliente";

export const notificacionesApi = {
  bandeja: () => api.get<Bandeja>("/api/notificaciones"),
  marcarLeida: (id: number) => api.post<void>(`/api/notificaciones/${id}/leida`),
  marcarTodas: () => api.post<void>("/api/notificaciones/leidas"),
  /** SMS y WhatsApp enviados a un agricultor (con el enlace wa.me para reenviar). */
  mensajesDelProductor: (productorId: number) =>
    api.get<Notificacion[]>(`/api/gestion/mensajes?productorId=${productorId}`),
};
