"use client";

import { useState } from "react";

import { useConsulta } from "@/hooks/useConsulta";
import type { SesionState } from "@/hooks/useSesion";
import { productoresApi } from "@/services/api";

/**
 * Agricultores que el usuario administra: el propio perfil (productor), los de sus agricultores (agente)
 * o todos (administración). Recuerda cuál se está gestionando en el panel.
 */
export function useGestion(sesion: SesionState) {
  const rol = sesion.rol;
  const habilitado = rol === "productor" || rol === "agente" || rol === "administrador";
  const consulta = useConsulta(
    habilitado && sesion.usuario ? `gestionados:${sesion.usuario.id}` : null,
    () => productoresApi.gestionados(),
  );
  const [elegido, setElegido] = useState<number | null>(null);
  const productores = consulta.datos ?? [];
  const activo = productores.find((p) => p.id === elegido) ?? productores[0] ?? null;

  return {
    productores,
    activo,
    elegir: setElegido,
    cargando: consulta.cargando,
    error: consulta.error,
    recargar: consulta.recargar,
  };
}

export type GestionState = ReturnType<typeof useGestion>;
