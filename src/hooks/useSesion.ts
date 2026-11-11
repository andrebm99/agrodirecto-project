"use client";

import { useCallback, useEffect, useState } from "react";

import {
  ApiError,
  authApi,
  borrarToken,
  EVENTO_SESION_EXPIRADA,
  guardarToken,
  leerToken,
  tokenRecordado,
} from "@/services/api";
import type { RegistroSolicitud, Sesion, Usuario } from "@/types/api";
import type { Role } from "@/types/domain";
import { rolDeApi } from "@/utils/sesion";

/** Resultado del primer paso del login: entra directo o pide el código de la app. */
export type ResultadoIngreso =
  | { etapa: "listo"; usuario: Usuario }
  | { etapa: "codigo"; tokenTemporal: string; recordar: boolean };

/**
 * Sesión real contra la API: inicio de sesión (con segundo paso si corresponde), registro,
 * recuperación de la sesión al recargar y cierre cuando el backend la rechaza.
 */
export function useSesion() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  // Solo hay algo que recuperar si existe un token guardado (en el servidor siempre es false).
  const [cargando, setCargando] = useState(() => leerToken() !== null);
  /** Mensaje para mostrar cuando la sesión terminó sin que el usuario la cerrara. */
  const [avisoExpirada, setAvisoExpirada] = useState("");

  // Al cargar la página, recupera la sesión si había un token guardado.
  useEffect(() => {
    let vigente = true;
    if (!leerToken()) return;
    authApi
      .yo()
      .then((datos) => vigente && setUsuario(datos))
      .catch(() => vigente && borrarToken())
      .finally(() => vigente && setCargando(false));
    return () => {
      vigente = false;
    };
  }, []);

  // El cliente HTTP avisa cuando el backend responde 401 (token vencido o cuenta suspendida).
  useEffect(() => {
    const alExpirar = (evento: Event) => {
      setUsuario(null);
      setAvisoExpirada(
        (evento as CustomEvent<string | undefined>).detail ??
          "Tu sesión terminó. Vuelve a ingresar.",
      );
    };
    window.addEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
    return () => window.removeEventListener(EVENTO_SESION_EXPIRADA, alExpirar);
  }, []);

  const completar = useCallback((sesion: Sesion, recordar: boolean): Usuario => {
    if (!sesion.token || !sesion.usuario) {
      throw new ApiError(500, "El servidor no devolvió la sesión completa.");
    }
    guardarToken(sesion.token, recordar);
    setUsuario(sesion.usuario);
    setAvisoExpirada("");
    return sesion.usuario;
  }, []);

  const iniciarSesion = useCallback(
    async (email: string, password: string, recordar: boolean): Promise<ResultadoIngreso> => {
      const sesion = await authApi.iniciarSesion(email.trim(), password);
      if (sesion.requiereSegundoFactor && sesion.tokenTemporal) {
        return { etapa: "codigo", tokenTemporal: sesion.tokenTemporal, recordar };
      }
      return { etapa: "listo", usuario: completar(sesion, recordar) };
    },
    [completar],
  );

  const verificarCodigo = useCallback(
    async (tokenTemporal: string, codigo: string, recordar: boolean): Promise<Usuario> =>
      completar(await authApi.verificarCodigo(tokenTemporal, codigo.replace(/\s/g, "")), recordar),
    [completar],
  );

  /** Crea la cuenta e inicia sesión con ella (una cuenta nueva aún no tiene segundo factor). */
  const registrar = useCallback(
    async (datos: RegistroSolicitud): Promise<Usuario> => {
      await authApi.registrar(datos);
      const resultado = await iniciarSesion(datos.email, datos.password, false);
      if (resultado.etapa !== "listo")
        throw new ApiError(500, "No se pudo iniciar la sesión nueva.");
      return resultado.usuario;
    },
    [iniciarSesion],
  );

  /** Tras activar el segundo factor, el backend entrega un token nuevo que lo incluye. */
  const reemplazarSesion = useCallback(
    (sesion: Sesion) => completar(sesion, tokenRecordado()),
    [completar],
  );

  const refrescarUsuario = useCallback(async () => {
    setUsuario(await authApi.yo());
  }, []);

  const cerrarSesion = useCallback(() => {
    borrarToken();
    setUsuario(null);
  }, []);

  const rol: Role | null = usuario ? rolDeApi(usuario.rol) : null;

  return {
    usuario,
    rol,
    cargandoSesion: cargando,
    avisoExpirada,
    limpiarAvisoExpirada: () => setAvisoExpirada(""),
    iniciarSesion,
    verificarCodigo,
    registrar,
    reemplazarSesion,
    refrescarUsuario,
    cerrarSesion,
  };
}

export type SesionState = ReturnType<typeof useSesion>;
