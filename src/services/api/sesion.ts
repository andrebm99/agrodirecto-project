/**
 * Guarda el token de acceso. Con "Recordarme" persiste en localStorage; si no, solo dura la pestaña
 * (sessionStorage). El token nunca se guarda junto con la contraseña.
 */
const CLAVE = "agrodirecto-token";

function almacenes(): Storage[] {
  try {
    return [window.sessionStorage, window.localStorage];
  } catch {
    return [];
  }
}

export function leerToken(): string | null {
  for (const almacen of almacenes()) {
    const token = almacen.getItem(CLAVE);
    if (token) return token;
  }
  return null;
}

export function guardarToken(token: string, recordar: boolean) {
  borrarToken();
  try {
    (recordar ? window.localStorage : window.sessionStorage).setItem(CLAVE, token);
  } catch {
    // Navegación privada sin almacenamiento: la sesión vive solo en memoria.
  }
}

export function borrarToken() {
  almacenes().forEach((almacen) => almacen.removeItem(CLAVE));
}

/** Evento que avisa a la aplicación que la sesión expiró o fue revocada (por ejemplo, cuenta suspendida). */
export const EVENTO_SESION_EXPIRADA = "agrodirecto:sesion-expirada";
