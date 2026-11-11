"use client";

import { useState } from "react";

import { Icon } from "@/components/Icon";
import { useConsulta } from "@/hooks/useConsulta";
import { notificacionesApi } from "@/services/api";
import type { Usuario } from "@/types/api";
import { fecha } from "@/utils/format";

/** Avisos del usuario. Se actualiza con cada evento en tiempo real (`version`). */
export function Campana({ usuario, version }: { usuario: Usuario | null; version: number }) {
  const [abierta, setAbierta] = useState(false);
  const bandeja = useConsulta(
    usuario ? `bandeja:${usuario.id}:${version}` : null,
    () => notificacionesApi.bandeja(),
    {
      mantenerAnteriores: true,
    },
  );
  if (!usuario) return null;
  const datos = bandeja.datos;
  const noLeidas = datos?.noLeidas ?? 0;

  return (
    <div className="campana">
      <button
        className="cart-link"
        onClick={() => setAbierta(!abierta)}
        aria-expanded={abierta}
        aria-label={noLeidas ? `${noLeidas} avisos sin leer` : "Avisos"}
      >
        <Icon name="bell" size={20} />
        {noLeidas ? <span className="cart-badge">{noLeidas}</span> : null}
      </button>
      {abierta ? (
        <div className="campana-panel" role="dialog" aria-label="Avisos">
          <div className="campana-cabecera">
            <strong>Avisos</strong>
            {noLeidas ? (
              <button
                className="enlace-texto"
                onClick={async () => {
                  await notificacionesApi.marcarTodas();
                  bandeja.recargar();
                }}
              >
                Marcar como leídos
              </button>
            ) : null}
          </div>
          {datos?.notificaciones.length ? (
            <ul>
              {datos.notificaciones.slice(0, 12).map((n) => (
                <li key={n.id} className={n.leida ? "" : "nueva"}>
                  <p>{n.mensaje}</p>
                  <small>{fecha(n.creadaEn)}</small>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted mb-0">No tienes avisos todavía.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
