import { API_URL } from "@/config/api";
import type { ErrorApi } from "@/types/api";
import { borrarToken, EVENTO_SESION_EXPIRADA, leerToken } from "./sesion";

/**
 * Error que devuelve el backend. `regla` indica la regla de negocio incumplida (por ejemplo "RN-01"),
 * para que la interfaz pueda explicar al usuario qué pasó.
 */
export class ApiError extends Error {
  readonly estado: number;
  readonly regla: string | null;
  readonly detalles: string[];

  constructor(
    estado: number,
    mensaje: string,
    regla: string | null = null,
    detalles: string[] = [],
  ) {
    super(mensaje);
    this.name = "ApiError";
    this.estado = estado;
    this.regla = regla;
    this.detalles = detalles;
  }
}

type Metodo = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface OpcionesPeticion {
  /** Token distinto al guardado (por ejemplo, justo después de iniciar sesión). */
  token?: string | null;
  /** Para peticiones públicas que no deben enviar el token. */
  sinToken?: boolean;
  signal?: AbortSignal;
}

export async function peticion<T>(
  metodo: Metodo,
  ruta: string,
  cuerpo?: unknown,
  opciones: OpcionesPeticion = {},
): Promise<T> {
  // es-PE: el backend devuelve los mensajes de validación en español.
  const cabeceras: Record<string, string> = {
    Accept: "application/json",
    "Accept-Language": "es-PE",
  };
  if (cuerpo !== undefined) cabeceras["Content-Type"] = "application/json";
  const token = opciones.sinToken ? null : (opciones.token ?? leerToken());
  if (token) cabeceras.Authorization = `Bearer ${token}`;

  let respuesta: Response;
  try {
    respuesta = await fetch(`${API_URL}${ruta}`, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo),
      signal: opciones.signal,
    });
  } catch (error) {
    if ((error as Error).name === "AbortError") throw error;
    throw new ApiError(
      0,
      "No pudimos conectar con AgroDirecto. Revisa tu conexión e inténtalo de nuevo.",
    );
  }

  if (respuesta.status === 204) return undefined as T;
  const texto = await respuesta.text();
  const datos = texto ? JSON.parse(texto) : undefined;

  if (!respuesta.ok) {
    const error = (datos ?? {}) as Partial<ErrorApi>;
    if (respuesta.status === 401 && token) {
      borrarToken();
      window.dispatchEvent(new CustomEvent(EVENTO_SESION_EXPIRADA, { detail: error.mensaje }));
    }
    throw new ApiError(
      respuesta.status,
      error.mensaje ?? `Error ${respuesta.status}`,
      error.regla ?? null,
      error.detalles ?? [],
    );
  }
  return datos as T;
}

export const api = {
  get: <T>(ruta: string, opciones?: OpcionesPeticion) =>
    peticion<T>("GET", ruta, undefined, opciones),
  post: <T>(ruta: string, cuerpo?: unknown, opciones?: OpcionesPeticion) =>
    peticion<T>("POST", ruta, cuerpo ?? {}, opciones),
  put: <T>(ruta: string, cuerpo: unknown, opciones?: OpcionesPeticion) =>
    peticion<T>("PUT", ruta, cuerpo, opciones),
  patch: <T>(ruta: string, cuerpo: unknown, opciones?: OpcionesPeticion) =>
    peticion<T>("PATCH", ruta, cuerpo, opciones),
  delete: <T>(ruta: string, opciones?: OpcionesPeticion) =>
    peticion<T>("DELETE", ruta, undefined, opciones),
};

/** Construye la cadena de consulta ignorando los filtros vacíos. */
export function consulta(
  parametros: Record<string, string | number | boolean | null | undefined>,
): string {
  const pares = Object.entries(parametros).filter(
    ([, valor]) => valor !== undefined && valor !== null && valor !== "",
  );
  if (!pares.length) return "";
  return `?${new URLSearchParams(pares.map(([clave, valor]) => [clave, String(valor)])).toString()}`;
}
