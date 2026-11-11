import type { RolApi, Usuario } from "@/types/api";
import type { Role, View } from "@/types/domain";

/** Rol del backend (COMPRADOR...) → rol que usa la interfaz (comprador...). */
export function rolDeApi(rol: RolApi): Role {
  const roles: Record<RolApi, Role> = {
    COMPRADOR: "comprador",
    PRODUCTOR: "productor",
    AGENTE: "agente",
    ADMINISTRADOR: "administrador",
  };
  return roles[rol];
}

export const ETIQUETA_ROL: Record<Role, string> = {
  comprador: "Comprador",
  productor: "Productor",
  agente: "Agente de campo",
  administrador: "Administración",
};

/** Pantalla de inicio de cada rol después de iniciar sesión. */
export function panelDe(rol: Role): View {
  if (rol === "administrador") return "admin";
  // El panel propio del agente llega en F4; mientras tanto usa el de gestión de productores.
  if (rol === "productor" || rol === "agente") return "productor";
  return "catalogo";
}

/** Roles que deben usar verificación en dos pasos (igual que en el backend). */
export const ROLES_CON_DOBLE_FACTOR: Role[] = ["administrador", "agente"];

export function requiereConfigurarDobleFactor(usuario: Usuario | null): boolean {
  return (
    !!usuario &&
    !usuario.dobleFactorActivo &&
    ROLES_CON_DOBLE_FACTOR.includes(rolDeApi(usuario.rol))
  );
}

/** Pantallas privadas y los roles que pueden verlas. Las que no están aquí son públicas. */
const PRIVADAS: Partial<Record<View, Role[] | "con-sesion">> = {
  pedidos: ["comprador"],
  confirmar: ["comprador"],
  productor: ["productor", "agente", "administrador"],
  publicar: ["productor", "agente", "administrador"],
  recibidos: ["productor", "agente", "administrador"],
  admin: ["administrador"],
  seguridad: "con-sesion",
};

export type Acceso = "permitido" | "requiere-sesion" | "sin-permiso" | "requiere-doble-factor";

export function accesoA(vista: View, usuario: Usuario | null): Acceso {
  const regla = PRIVADAS[vista];
  if (!regla) return "permitido";
  if (!usuario) return "requiere-sesion";
  if (vista !== "seguridad" && requiereConfigurarDobleFactor(usuario))
    return "requiere-doble-factor";
  if (regla === "con-sesion") return "permitido";
  return regla.includes(rolDeApi(usuario.rol)) ? "permitido" : "sin-permiso";
}

/**
 * El backend devuelve los errores de validación como "campo: mensaje".
 * Los agrupa por campo para mostrarlos junto al dato correcto del formulario.
 */
export function erroresPorCampo(detalles: string[]): Record<string, string> {
  const resultado: Record<string, string> = {};
  for (const detalle of detalles) {
    const separador = detalle.indexOf(":");
    if (separador > 0) {
      const campo = detalle.slice(0, separador).trim();
      resultado[campo] ??= detalle.slice(separador + 1).trim();
    }
  }
  return resultado;
}

/** "AGRODIRECTOADMIN..." → "AGRO DIRE CTOA ...": más fácil de copiar a mano en el celular. */
export function agruparClave(secreto: string): string {
  return secreto.replace(/(.{4})/g, "$1 ").trim();
}
