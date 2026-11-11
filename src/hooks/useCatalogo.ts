"use client";

import { useEffect, useState } from "react";

import { useConsulta } from "@/hooks/useConsulta";
import type { SesionState } from "@/hooks/useSesion";
import { catalogoApi, productoresApi } from "@/services/api";
import type { FiltroCatalogo } from "@/types/api";

export type Orden = NonNullable<FiltroCatalogo["orden"]> | "";

/**
 * Catálogo compartido entre pantallas (el inicio puede abrir el catálogo ya filtrado por categoría).
 * Los productos, categorías, regiones y favoritos vienen de la API.
 */
export function useCatalogo(sesion: SesionState) {
  const [busqueda, setBusqueda] = useState("");
  const [q, setQ] = useState("");
  const [categoria, setCategoria] = useState("");
  const [atiende, setAtiende] = useState("");
  const [soloOrganico, setSoloOrganico] = useState(false);
  const [orden, setOrden] = useState<Orden>("");
  const [soloFavoritos, setSoloFavoritos] = useState(false);

  // Espera a que se deje de escribir antes de buscar, para no consultar con cada tecla.
  useEffect(() => {
    const espera = window.setTimeout(() => setQ(busqueda.trim()), 300);
    return () => window.clearTimeout(espera);
  }, [busqueda]);

  const filtro: FiltroCatalogo = {
    q: q || undefined,
    categoria: categoria || undefined,
    atiende: atiende || undefined,
    organico: soloOrganico || undefined,
    orden: orden || undefined,
  };
  const productos = useConsulta(
    `productos:${JSON.stringify(filtro)}`,
    (signal) => catalogoApi.buscar(filtro, signal),
    { mantenerAnteriores: true },
  );
  const categorias = useConsulta("categorias", (signal) => catalogoApi.categorias(signal));
  const regiones = useConsulta("regiones", (signal) => productoresApi.regiones(signal));

  // Favoritos: viven en el servidor y solo existen con sesión.
  const usuarioId = sesion.usuario?.id ?? null;
  const favoritosServidor = useConsulta(usuarioId ? `favoritos:${usuarioId}` : null, (signal) =>
    catalogoApi.favoritos(signal),
  );
  // Cambios hechos en esta sesión, aplicados al instante sobre lo que devolvió el servidor.
  const [cambios, setCambios] = useState<{
    usuarioId: number | null;
    mapa: Record<number, boolean>;
  }>({
    usuarioId: null,
    mapa: {},
  });
  const mapaCambios = cambios.usuarioId === usuarioId ? cambios.mapa : {};
  const idsFavoritos = new Set(favoritosServidor.datos?.map((p) => p.id) ?? []);
  Object.entries(mapaCambios).forEach(([id, activo]) =>
    activo ? idsFavoritos.add(Number(id)) : idsFavoritos.delete(Number(id)),
  );

  /** Devuelve false si hace falta iniciar sesión. */
  const alternarFavorito = async (productoId: number): Promise<boolean> => {
    if (!usuarioId) return false;
    const activar = !idsFavoritos.has(productoId);
    setCambios({ usuarioId, mapa: { ...mapaCambios, [productoId]: activar } });
    try {
      await (activar
        ? catalogoApi.agregarFavorito(productoId)
        : catalogoApi.quitarFavorito(productoId));
      favoritosServidor.recargar();
    } catch {
      setCambios({ usuarioId, mapa: { ...mapaCambios, [productoId]: !activar } });
    }
    return true;
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setQ("");
    setCategoria("");
    setAtiende("");
    setSoloOrganico(false);
    setOrden("");
    setSoloFavoritos(false);
  };

  const listaFavoritos = (favoritosServidor.datos ?? []).filter((p) => idsFavoritos.has(p.id));
  const hayFiltros = Boolean(q || categoria || atiende || soloOrganico || soloFavoritos);

  return {
    busqueda,
    setBusqueda,
    categoria,
    setCategoria,
    atiende,
    setAtiende,
    soloOrganico,
    setSoloOrganico,
    orden,
    setOrden,
    soloFavoritos,
    setSoloFavoritos,
    limpiarFiltros,
    hayFiltros,
    productos: soloFavoritos ? listaFavoritos : (productos.datos ?? []),
    cargando: soloFavoritos ? favoritosServidor.cargando : productos.cargando,
    error: soloFavoritos ? favoritosServidor.error : productos.error,
    recargar: productos.recargar,
    categorias: categorias.datos ?? [],
    regiones: regiones.datos ?? [],
    idsFavoritos,
    alternarFavorito,
  };
}

export type CatalogoState = ReturnType<typeof useCatalogo>;
