"use client";

import { useState } from "react";

import { EstadoPedido } from "@/components/EstadoPedido";
import { Icon } from "@/components/Icon";
import { useConsulta } from "@/hooks/useConsulta";
import { ApiError, confianzaApi, pedidosRecibidosApi } from "@/services/api";
import type { Pedido } from "@/types/api";
import { fecha, money } from "@/utils/format";
import { EN_CURSO, MODALIDAD } from "@/utils/pedido";

type Filtro = "atender" | "curso" | "terminados";
const AVANCE = {
  EN_PREPARACION: "Empecé a prepararlo",
  LISTO_PARA_ENTREGA: "Está listo para salir",
  ENTREGADO: "Ya lo entregué",
} as const;

/** Pedidos pagados que recibe el agricultor (los impagos no se muestran: podrían no concretarse). */
export function PedidosRecibidos({
  productorId,
  setToast,
}: {
  productorId: number;
  setToast: (t: string) => void;
}) {
  const [filtro, setFiltro] = useState<Filtro>("atender");
  const consulta = useConsulta(`recibidos:${productorId}`, () =>
    pedidosRecibidosApi.listar({ productorId }),
  );
  const todos = consulta.datos ?? [];
  const lista = todos.filter((p) =>
    filtro === "atender"
      ? p.estado === "PENDIENTE"
      : filtro === "curso"
        ? EN_CURSO.includes(p.estado) && p.estado !== "PENDIENTE"
        : !EN_CURSO.includes(p.estado),
  );
  const porAtender = todos.filter((p) => p.estado === "PENDIENTE").length;

  return (
    <>
      <div className="filter-pills mb-3" role="group" aria-label="Filtrar pedidos">
        {(
          [
            ["atender", `Por responder (${porAtender})`],
            ["curso", "En curso"],
            ["terminados", "Terminados"],
          ] as [Filtro, string][]
        ).map(([v, t]) => (
          <button
            key={v}
            className={filtro === v ? "active" : ""}
            aria-pressed={filtro === v}
            onClick={() => setFiltro(v)}
          >
            {t}
          </button>
        ))}
      </div>
      {consulta.error ? <p className="aviso aviso-error">{consulta.error}</p> : null}
      {!lista.length ? (
        <p className="text-muted">
          {consulta.cargando
            ? "Cargando pedidos…"
            : filtro === "atender"
              ? "No hay pedidos por responder."
              : "No hay pedidos aquí."}
        </p>
      ) : (
        <ul className="lista-pedidos">
          {lista.map((p) => (
            <Recibido key={p.id} pedido={p} alCambiar={consulta.recargar} setToast={setToast} />
          ))}
        </ul>
      )}
    </>
  );
}

function Recibido({
  pedido: p,
  alCambiar,
  setToast,
}: {
  pedido: Pedido;
  alCambiar: () => void;
  setToast: (t: string) => void;
}) {
  const [panel, setPanel] = useState<null | "rechazar" | "descargo">(null);
  const [texto, setTexto] = useState("");
  const [foto, setFoto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const ejecutar = async (op: () => Promise<unknown>, aviso: string) => {
    setError("");
    setEnviando(true);
    try {
      await op();
      setToast(aviso);
      setPanel(null);
      alCambiar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo completar.");
    } finally {
      setEnviando(false);
    }
  };
  const avance = p.acciones.find((a): a is keyof typeof AVANCE => a in AVANCE);

  return (
    <li className="surface-card tarjeta-pedido">
      <div className="pedido-cabecera">
        <div>
          <h2>
            {p.codigo} · {p.comprador.razonSocial ?? p.comprador.nombre}
          </h2>
          <p>
            {fecha(p.creadoEn)} · {MODALIDAD[p.modalidadEntrega].titulo} a {p.regionDestino}
            {p.fechaEntregaEstimada ? ` · entregar hasta el ${fecha(p.fechaEntregaEstimada)}` : ""}
            {p.comprador.verificado ? " · comprador verificado" : ""}
          </p>
        </div>
        <EstadoPedido estado={p.estado} />
      </div>
      <p className="pedido-lineas">
        {p.lineas.map((l) => `${l.cantidad} × ${l.formato} de ${l.producto}`).join(" · ")}
      </p>
      <div className="pedido-dinero">
        <strong>Recibes {money(p.desglose.montoProductor)}</strong>
        <span>
          {p.pago?.estado === "RETENIDO"
            ? "Pago asegurado: se libera cuando el comprador confirme."
            : p.pago?.mensaje}
        </span>
      </div>
      {p.direccionEntrega && p.comprador.telefono ? (
        <p className="pedido-contacto">
          <Icon name="home" size={15} /> {p.direccionEntrega} ·{" "}
          <a href={`tel:+51${p.comprador.telefono}`}>{p.comprador.telefono}</a>
        </p>
      ) : p.estado === "PENDIENTE" ? (
        <p className="pedido-contacto">
          La dirección y el celular del comprador aparecen cuando aceptas.
        </p>
      ) : null}
      {p.nota ? <p className="pedido-contacto">Nota: “{p.nota}”</p> : null}

      <div className="acciones-fila mb-0">
        {p.acciones.includes("ACEPTAR") ? (
          <button
            className="btn btn-brand"
            disabled={enviando}
            onClick={() =>
              ejecutar(() => pedidosRecibidosApi.aceptar(p.id), `Aceptaste ${p.codigo}.`)
            }
          >
            Aceptar pedido
          </button>
        ) : null}
        {p.acciones.includes("RECHAZAR") ? (
          <button className="btn btn-claro" onClick={() => setPanel("rechazar")}>
            No puedo atenderlo
          </button>
        ) : null}
        {avance ? (
          <button
            className="btn btn-brand"
            disabled={enviando}
            onClick={() =>
              ejecutar(
                () => pedidosRecibidosApi.avanzar(p.id, avance),
                `${p.codigo}: ${AVANCE[avance].toLowerCase()}.`,
              )
            }
          >
            {AVANCE[avance]}
          </button>
        ) : null}
        {p.acciones.includes("ENVIAR_DESCARGO") ? (
          <button className="btn btn-claro" onClick={() => setPanel("descargo")}>
            Dar mi versión del reclamo
          </button>
        ) : null}
      </div>

      {panel === "rechazar" ? (
        <form
          className="panel-accion"
          onSubmit={(e) => {
            e.preventDefault();
            ejecutar(
              () => pedidosRecibidosApi.rechazar(p.id, texto.trim() || undefined),
              `Rechazaste ${p.codigo}. Se devuelve el dinero al comprador.`,
            );
          }}
        >
          <label className="campo">
            ¿Por qué no puedes atenderlo? <span className="opcional">(opcional)</span>
            <input
              className="form-control"
              maxLength={300}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              placeholder="Ej. Helada en la zona"
            />
          </label>
          <button className="btn btn-danger" disabled={enviando}>
            Rechazar pedido
          </button>
        </form>
      ) : null}
      {panel === "descargo" ? (
        <form
          className="panel-accion"
          onSubmit={async (e) => {
            e.preventDefault();
            ejecutar(async () => {
              const disputa = await confianzaApi.disputaDePedido(p.id);
              await confianzaApi.enviarDescargo(disputa.id, texto.trim(), foto.trim() || undefined);
            }, "Enviamos tu versión. AgroDirecto revisará las pruebas de ambas partes.");
          }}
        >
          <p className="mb-2">
            Tu pago sigue asegurado mientras se revisa el caso. Cuenta qué pasó y, si tienes,
            comparte una foto del despacho.
          </p>
          <label className="campo">
            Tu versión
            <textarea
              className="form-control"
              required
              maxLength={1000}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </label>
          <label className="campo">
            Enlace a una foto <span className="opcional">(opcional)</span>
            <input
              className="form-control"
              type="url"
              placeholder="https://"
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
            />
          </label>
          <button className="btn btn-brand" disabled={enviando}>
            Enviar mi versión
          </button>
        </form>
      ) : null}
      {error ? (
        <p className="aviso aviso-error mt-3 mb-0" role="alert">
          <Icon name="warning" size={18} /> {error}
        </p>
      ) : null}
    </li>
  );
}
