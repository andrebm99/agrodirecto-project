import type {
  ActivacionDobleFactor,
  ConfiguracionDobleFactor,
  EstadoDobleFactor,
  RegistroSolicitud,
  Sesion,
  Usuario,
} from "@/types/api";
import { api } from "./cliente";

/** Registro, inicio de sesión y verificación en dos pasos. */
export const authApi = {
  registrar: (datos: RegistroSolicitud) =>
    api.post<Usuario>("/api/auth/registro", datos, { sinToken: true }),
  iniciarSesion: (email: string, password: string) =>
    api.post<Sesion>("/api/auth/login", { email, password }, { sinToken: true }),
  verificarCodigo: (tokenTemporal: string, codigo: string) =>
    api.post<Sesion>("/api/auth/2fa/verificar", { tokenTemporal, codigo }, { sinToken: true }),
  yo: (token?: string) => api.get<Usuario>("/api/auth/yo", { token }),

  estadoDobleFactor: () => api.get<EstadoDobleFactor>("/api/auth/2fa"),
  configurarDobleFactor: () => api.post<ConfiguracionDobleFactor>("/api/auth/2fa/configurar"),
  activarDobleFactor: (codigo: string) =>
    api.post<ActivacionDobleFactor>("/api/auth/2fa/activar", { codigo }),
  desactivarDobleFactor: (codigo: string) =>
    api.post<EstadoDobleFactor>("/api/auth/2fa/desactivar", { codigo }),
};
