"use client";

import { useEffect, useState } from "react";

import { ApiError } from "@/services/api";

interface Resultado<T> {
  clave: string;
  datos?: T;
  error?: string;
  /** Regla de negocio del error (RN-xx), si el backend la indicó. */
  regla?: string | null;
}

/**
 * Lee datos de la API cada vez que cambia `clave` (por ejemplo, los filtros serializados).
 * - Cancela la petición anterior si la clave cambia antes de que responda.
 * - `cargando` se deriva de la clave: no hace falta marcarlo con setState dentro del efecto.
 * - Con `mantenerAnteriores`, los datos previos siguen visibles mientras llegan los nuevos (filtros).
 * - Con `clave = null` no se consulta nada (por ejemplo, favoritos sin sesión).
 */
export function useConsulta<T>(
  clave: string | null,
  cargar: (signal: AbortSignal) => Promise<T>,
  opciones: { mantenerAnteriores?: boolean } = {},
) {
  const [resultado, setResultado] = useState<Resultado<T> | null>(null);
  const [version, setVersion] = useState(0);
  const claveCompleta = clave === null ? null : `${clave}#${version}`;

  useEffect(() => {
    if (claveCompleta === null) return;
    const control = new AbortController();
    cargar(control.signal)
      .then((datos) => setResultado({ clave: claveCompleta, datos }))
      .catch((error: unknown) => {
        if ((error as Error).name === "AbortError") return;
        setResultado({
          clave: claveCompleta,
          error: error instanceof ApiError ? error.message : "No pudimos cargar la información.",
          regla: error instanceof ApiError ? error.regla : null,
        });
      });
    return () => control.abort();
    // `cargar` cambia en cada render; la clave es la que define cuándo volver a consultar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveCompleta]);

  const vigente = resultado !== null && resultado.clave === claveCompleta;
  const datos = vigente || opciones.mantenerAnteriores ? resultado?.datos : undefined;
  return {
    datos,
    error: vigente ? resultado.error : undefined,
    regla: vigente ? (resultado.regla ?? null) : null,
    cargando: claveCompleta !== null && !vigente,
    recargar: () => setVersion((v) => v + 1),
  };
}
