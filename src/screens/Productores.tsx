"use client";

import { useState } from "react";

import { Icon } from "@/components/Icon";
import type { EstadoApp } from "@/hooks/estadoApp";
import { useConsulta } from "@/hooks/useConsulta";
import { confianzaApi, productoresApi } from "@/services/api";
import type { NivelReputacion } from "@/types/api";

type Props = Pick<EstadoApp, "navigate" | "catalogo">;

const NIVEL: Record<NivelReputacion, string> = {
  NUEVO: "Nuevo en AgroDirecto",
  CONFIABLE: "Confiable",
  REGULAR: "Cumplimiento regular",
  EN_OBSERVACION: "En observación",
};

/** Directorio público: quién cultiva lo que compras, desde dónde y a qué regiones entrega. */
export function Productores({ navigate, catalogo }: Props) {
  const [atiende, setAtiende] = useState("");
  const directorio = useConsulta(`productores:${atiende}`, (signal) =>
    productoresApi.directorio({ atiende: atiende || undefined }, signal),
  );
  const productores = directorio.datos ?? [];
  const ids = productores.map((p) => p.id);
  const reputaciones = useConsulta(ids.length ? `reputaciones:${ids.join(",")}` : null, (signal) =>
    confianzaApi.reputaciones(ids, signal),
  );
  const reputacionDe = (id: number) => reputaciones.datos?.find((r) => r.productorId === id);

  return (
    <main className="content-page">
      <div className="container">
        <div className="page-title">
          <h1>Productores</h1>
          <p>
            Conoce a quienes cultivan lo que compras: su historia, su zona y a dónde pueden
            entregar.
          </p>
        </div>

        <div className="barra-directorio">
          <label className="filtro-region">
            Entregan en
            <select
              className="form-select"
              value={atiende}
              onChange={(e) => setAtiende(e.target.value)}
            >
              <option value="">Todo el Perú</option>
              {catalogo.regiones.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <span className="text-muted" aria-live="polite">
            {directorio.cargando ? "Buscando…" : `${productores.length} productores`}
          </span>
        </div>

        {directorio.error ? (
          <div className="aviso aviso-error" role="alert">
            <Icon name="warning" size={18} />
            <span>
              {directorio.error}{" "}
              <button className="enlace-texto" onClick={directorio.recargar}>
                Reintentar
              </button>
            </span>
          </div>
        ) : !directorio.cargando && !productores.length ? (
          <div className="empty-state">
            <h2>Aún nadie entrega en {atiende}</h2>
            <p>Prueba con una región cercana o elige recojo en chacra al hacer tu pedido.</p>
          </div>
        ) : (
          <ul className="directorio">
            {productores.map((p) => {
              const reputacion = reputacionDe(p.id);
              return (
                <li key={p.id} className="surface-card tarjeta-productor">
                  <div className="producer-header">
                    <span className="avatar large" aria-hidden="true">
                      {p.nombreComercial.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <h2>{p.nombreComercial}</h2>
                      <p>
                        {p.nombreTitular} · {p.provincia}, {p.region}
                      </p>
                    </div>
                  </div>
                  <ul className="etiquetas-productor">
                    {p.verificado ? (
                      <li className="positivo">
                        <Icon name="check" size={14} /> Verificado
                      </li>
                    ) : null}
                    {reputacion ? <li>{NIVEL[reputacion.nivel]}</li> : null}
                    {p.emiteFactura ? <li>Emite factura</li> : null}
                  </ul>
                  {p.historia ? <p className="historia">{p.historia}</p> : null}
                  <p className="entrega-en">
                    <strong>Entrega en:</strong> {p.zonas.map((z) => z.region).join(", ")}
                  </p>
                  <button className="btn btn-claro" onClick={() => navigate("perfil", p.id)}>
                    Ver perfil y productos <Icon name="arrow-right" size={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
