"use client";

import { useState } from "react";

import { Icon } from "@/components/Icon";
import { ApiError, productoresApi } from "@/services/api";
import type { ProductorGestion, Zona } from "@/types/api";

/** Regiones a las que entrega el agricultor, con días de viaje, pedido mínimo y flete (RN-09, RN-11). */
export function EditorZonas({
  productor,
  regiones,
  onGuardado,
}: {
  productor: ProductorGestion;
  regiones: string[];
  onGuardado: () => void;
}) {
  const [zonas, setZonas] = useState<Zona[]>(productor.zonas);
  const [estado, setEstado] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const cambiar = (i: number, campo: keyof Zona, valor: string) =>
    setZonas((z) =>
      z.map((zona, j) =>
        j === i ? { ...zona, [campo]: campo === "region" ? valor : Number(valor) } : zona,
      ),
    );

  const guardar = async () => {
    setEstado(null);
    try {
      await productoresApi.reemplazarZonas(productor.id, zonas);
      setEstado({ tipo: "ok", texto: "Zonas guardadas." });
      onGuardado();
    } catch (e) {
      setEstado({
        tipo: "error",
        texto: e instanceof ApiError ? [e.message, ...e.detalles].join(" ") : "No se pudo guardar.",
      });
    }
  };

  return (
    <div>
      <ul className="editor-zonas">
        {zonas.map((z, i) => (
          <li key={i}>
            <label className="campo">
              Región
              <select
                className="form-select"
                value={z.region}
                onChange={(e) => cambiar(i, "region", e.target.value)}
              >
                <option value="">Elige</option>
                {regiones.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </select>
            </label>
            <label className="campo">
              Días de viaje
              <input
                className="form-control"
                type="number"
                min={0}
                max={30}
                value={z.diasTransito}
                onChange={(e) => cambiar(i, "diasTransito", e.target.value)}
              />
            </label>
            <label className="campo">
              Pedido mínimo (S/)
              <input
                className="form-control"
                type="number"
                min={0}
                step="0.5"
                value={z.pedidoMinimo}
                onChange={(e) => cambiar(i, "pedidoMinimo", e.target.value)}
              />
            </label>
            <label className="campo">
              Flete (S/)
              <input
                className="form-control"
                type="number"
                min={0}
                step="0.5"
                value={z.costoFlete}
                onChange={(e) => cambiar(i, "costoFlete", e.target.value)}
              />
            </label>
            <button
              className="btn btn-claro"
              type="button"
              onClick={() => setZonas((zs) => zs.filter((_, j) => j !== i))}
              aria-label={`Quitar ${z.region || "zona"}`}
            >
              <Icon name="trash" size={16} /> Quitar
            </button>
          </li>
        ))}
      </ul>
      <div className="acciones-fila">
        <button
          className="btn btn-claro"
          type="button"
          onClick={() =>
            setZonas((z) => [
              ...z,
              { region: "", diasTransito: 1, pedidoMinimo: 100, costoFlete: 20 },
            ])
          }
        >
          <Icon name="plus" size={16} /> Agregar región
        </button>
        <button className="btn btn-brand" type="button" onClick={guardar}>
          Guardar zonas
        </button>
      </div>
      {estado ? (
        <p className={`aviso ${estado.tipo === "ok" ? "aviso-ok" : "aviso-error"}`} role="status">
          {estado.texto}
        </p>
      ) : null}
    </div>
  );
}
