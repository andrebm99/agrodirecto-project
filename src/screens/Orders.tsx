"use client";

import { useState } from "react";

import { EstadoPedido } from "@/components/EstadoPedido";
import { Icon } from "@/components/Icon";
import type { EstadoApp } from "@/hooks/estadoApp";
import { useConsulta } from "@/hooks/useConsulta";
import { ApiError, confianzaApi, pedidosApi } from "@/services/api";
import type { MetodoPago, MotivoDisputa, Pedido } from "@/types/api";
import { fecha, money } from "@/utils/format";
import { EN_CURSO, ESTADO_PEDIDO, METODO_PAGO, MODALIDAD, MOTIVO_RECLAMO } from "@/utils/pedido";

type Props = Pick<EstadoApp, "navigate" | "setToast">;
type PropsLista = Props & Pick<EstadoApp, "tiempoReal">;
type Filtro = "curso" | "terminados" | "todos";

/** Mis pedidos: estado, dinero, historial y las acciones que permite cada estado. */
export function Orders({ navigate, setToast, tiempoReal }: PropsLista) {
  const [filtro, setFiltro] = useState<Filtro>("curso");
  const consulta = useConsulta(`mis-pedidos:${tiempoReal.version}`, () => pedidosApi.misPedidos(), {
    mantenerAnteriores: true,
  });
  const pedidos = (consulta.datos ?? []).filter((p) =>
    filtro === "todos"
      ? true
      : filtro === "curso"
        ? EN_CURSO.includes(p.estado)
        : !EN_CURSO.includes(p.estado),
  );

  return (
    <main className="content-page">
      <div className="container narrow-container">
        <div className="page-title compact">
          <h1>Mis pedidos</h1>
          <p>Tu pago queda protegido hasta que confirmas que recibiste el pedido.</p>
        </div>
        <div className="filter-pills mb-4" role="group" aria-label="Filtrar pedidos">
          {(
            [
              ["curso", "En curso"],
              ["terminados", "Terminados"],
              ["todos", "Todos"],
            ] as [Filtro, string][]
          ).map(([valor, texto]) => (
            <button
              key={valor}
              className={filtro === valor ? "active" : ""}
              aria-pressed={filtro === valor}
              onClick={() => setFiltro(valor)}
            >
              {texto}
            </button>
          ))}
        </div>
        {consulta.error ? (
          <p className="aviso aviso-error" role="alert">
            <Icon name="warning" size={18} />
            {consulta.error}
          </p>
        ) : !consulta.datos ? (
          <p className="cargando-pantalla">Cargando pedidos…</p>
        ) : !pedidos.length ? (
          <div className="empty-state surface-card">
            <h2>{filtro === "curso" ? "No tienes pedidos en curso" : "Aún no hay pedidos aquí"}</h2>
            <p>Elige productos de un agricultor y haz tu primer pedido.</p>
            <button className="btn btn-brand" onClick={() => navigate("catalogo")}>
              Explorar productos
            </button>
          </div>
        ) : (
          <ul className="lista-pedidos">
            {pedidos.map((p) => (
              <TarjetaPedido
                key={p.id}
                pedido={p}
                alCambiar={consulta.recargar}
                setToast={setToast}
                navigate={navigate}
              />
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}

type Accion = null | "pagar" | "cancelar" | "reclamar" | "calificar";

function TarjetaPedido({
  pedido: p,
  alCambiar,
  setToast,
  navigate,
}: { pedido: Pedido; alCambiar: () => void } & Props) {
  const [accion, setAccion] = useState<Accion>(null);
  const [metodo, setMetodo] = useState<MetodoPago>("YAPE");
  const [motivo, setMotivo] = useState<MotivoDisputa>("CALIDAD");
  const [texto, setTexto] = useState("");
  const [foto, setFoto] = useState("");
  const [estrellas, setEstrellas] = useState(5);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const ejecutar = async (operacion: () => Promise<unknown>, aviso: string) => {
    setError("");
    setEnviando(true);
    try {
      await operacion();
      setToast(aviso);
      setAccion(null);
      alCambiar();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo completar la acción.");
    } finally {
      setEnviando(false);
    }
  };
  const tiene = (a: string) => p.acciones.includes(a as Pedido["acciones"][number]);

  return (
    <li className="surface-card tarjeta-pedido">
      <div className="pedido-cabecera">
        <div>
          <h2>
            {p.codigo} · {p.productor.nombreComercial}
          </h2>
          <p>
            {fecha(p.creadoEn)} · {MODALIDAD[p.modalidadEntrega].titulo} · {p.regionDestino}
            {p.entregadoEn ? ` · Entregado el ${fecha(p.entregadoEn)}` : ""}
          </p>
        </div>
        <EstadoPedido estado={p.estado} />
      </div>
      <p className="pedido-lineas">
        {p.lineas.map((l) => `${l.cantidad} × ${l.formato} de ${l.producto}`).join(" · ")}
      </p>
      <div className="pedido-dinero">
        <strong>{money(p.desglose.total)}</strong>
        {p.pago ? <span>{p.pago.mensaje}</span> : null}
      </div>
      {p.productor.telefono ? (
        <p className="pedido-contacto">
          <Icon name="user" size={15} /> {p.productor.nombreTitular} ·{" "}
          <a href={`tel:+51${p.productor.telefono}`}>{p.productor.telefono}</a>
        </p>
      ) : null}

      <div className="acciones-fila mb-0">
        {tiene("PAGAR") ? (
          <button className="btn btn-brand" onClick={() => setAccion("pagar")}>
            Pagar
          </button>
        ) : null}
        {tiene("CONFIRMAR_RECEPCION") ? (
          <button
            className="btn btn-brand"
            disabled={enviando}
            onClick={() =>
              ejecutar(
                () => pedidosApi.confirmarRecepcion(p.id),
                `Confirmaste la recepción. Se liberó el pago a ${p.productor.nombreComercial}.`,
              )
            }
          >
            Recibí conforme
          </button>
        ) : null}
        {tiene("REPORTAR_PROBLEMA") ? (
          <button className="btn btn-claro" onClick={() => setAccion("reclamar")}>
            Reportar un problema
          </button>
        ) : null}
        {tiene("CALIFICAR") ? (
          <button className="btn btn-claro" onClick={() => setAccion("calificar")}>
            Calificar
          </button>
        ) : null}
        {tiene("CANCELAR") ? (
          <button className="btn btn-claro" onClick={() => setAccion("cancelar")}>
            Cancelar pedido
          </button>
        ) : null}
        <button className="btn btn-claro" onClick={() => navigate("perfil", p.productor.id)}>
          Ver productor
        </button>
      </div>

      {accion === "pagar" ? (
        <div className="panel-accion">
          <label className="campo">
            Paga con
            <select
              className="form-select"
              value={metodo}
              onChange={(e) => setMetodo(e.target.value as MetodoPago)}
            >
              {(Object.keys(METODO_PAGO) as MetodoPago[]).map((m) => (
                <option key={m} value={m}>
                  {METODO_PAGO[m]}
                </option>
              ))}
            </select>
          </label>
          <button
            className="btn btn-brand"
            disabled={enviando}
            onClick={() =>
              ejecutar(() => pedidosApi.pagar(p.id, metodo), `Pagaste el pedido ${p.codigo}.`)
            }
          >
            Pagar {money(p.desglose.total)}
          </button>
        </div>
      ) : null}
      {accion === "cancelar" ? (
        <div className="panel-accion">
          <p className="mb-2">
            ¿Cancelar {p.codigo}?{" "}
            {p.pago?.estado === "RETENIDO"
              ? "Te devolvemos el pago completo."
              : "No se hizo ningún cobro."}
          </p>
          <div className="acciones-fila mb-0">
            <button className="btn btn-claro" onClick={() => setAccion(null)}>
              No, mantener
            </button>
            <button
              className="btn btn-danger"
              disabled={enviando}
              onClick={() =>
                ejecutar(() => pedidosApi.cancelar(p.id), `Cancelaste el pedido ${p.codigo}.`)
              }
            >
              Sí, cancelar
            </button>
          </div>
        </div>
      ) : null}
      {accion === "reclamar" ? (
        <form
          className="panel-accion"
          onSubmit={(e) => {
            e.preventDefault();
            ejecutar(
              () =>
                confianzaApi.reportarProblema(p.id, motivo, texto.trim(), foto.trim() || undefined),
              "Recibimos tu reclamo. Tu pago queda congelado mientras lo revisamos.",
            );
          }}
        >
          <p className="mb-2">
            Tienes 24 horas desde la entrega. El agricultor podrá dar su versión y AgroDirecto
            decidirá con las pruebas de ambos.
          </p>
          <label className="campo">
            ¿Qué pasó?
            <select
              className="form-select"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value as MotivoDisputa)}
            >
              {(Object.keys(MOTIVO_RECLAMO) as MotivoDisputa[]).map((m) => (
                <option key={m} value={m}>
                  {MOTIVO_RECLAMO[m].texto}
                </option>
              ))}
            </select>
          </label>
          <label className="campo">
            Cuéntanos con detalle
            <textarea
              className="form-control"
              required
              maxLength={1000}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </label>
          <label className="campo">
            Enlace a una foto{" "}
            {MOTIVO_RECLAMO[motivo].requiereFoto ? (
              ""
            ) : (
              <span className="opcional">(opcional)</span>
            )}
            <input
              className="form-control"
              type="url"
              placeholder="https://"
              required={MOTIVO_RECLAMO[motivo].requiereFoto}
              value={foto}
              onChange={(e) => setFoto(e.target.value)}
            />
          </label>
          <button className="btn btn-brand" disabled={enviando}>
            Enviar reclamo
          </button>
        </form>
      ) : null}
      {accion === "calificar" ? (
        <form
          className="panel-accion"
          onSubmit={(e) => {
            e.preventDefault();
            ejecutar(
              () => confianzaApi.calificar(p.id, estrellas, texto.trim() || undefined),
              "Gracias por tu reseña.",
            );
          }}
        >
          <fieldset className="estrellas-elegir">
            <legend>¿Cómo te fue con {p.productor.nombreComercial}?</legend>
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} aria-label={`${n} de 5`}>
                <input
                  type="radio"
                  name={`estrellas-${p.id}`}
                  checked={estrellas === n}
                  onChange={() => setEstrellas(n)}
                />
                <Icon name="star" size={26} fill={n <= estrellas ? "currentColor" : "none"} />
              </label>
            ))}
          </fieldset>
          <label className="campo">
            Comentario <span className="opcional">(opcional)</span>
            <textarea
              className="form-control"
              maxLength={500}
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
            />
          </label>
          <button className="btn btn-brand" disabled={enviando}>
            Publicar reseña
          </button>
        </form>
      ) : null}
      {error ? (
        <p className="aviso aviso-error mt-3 mb-0" role="alert">
          <Icon name="warning" size={18} />
          {error}
        </p>
      ) : null}

      <details className="pedido-detalle">
        <summary>Detalle e historial</summary>
        <dl className="desglose">
          <div>
            <dt>Productos</dt>
            <dd>{money(p.desglose.subtotal)}</dd>
          </div>
          {p.desglose.descuento > 0 ? (
            <div>
              <dt>Descuento</dt>
              <dd>−{money(p.desglose.descuento)}</dd>
            </div>
          ) : null}
          <div>
            <dt>Flete</dt>
            <dd>{money(p.desglose.costoFlete)}</dd>
          </div>
          <div>
            <dt>Servicio AgroDirecto</dt>
            <dd>{money(p.desglose.comision)}</dd>
          </div>
          <div>
            <dt>Recibe el agricultor</dt>
            <dd>{money(p.desglose.montoProductor)}</dd>
          </div>
        </dl>
        <ol className="historial">
          {p.historial.map((h, i) => (
            <li key={i}>
              <strong>{ESTADO_PEDIDO[h.estadoNuevo].texto}</strong> · {fecha(h.fecha)}
              {h.canal === "SMS"
                ? " · respondió por SMS"
                : h.canal === "SISTEMA"
                  ? " · automático"
                  : ""}
              {h.comentario ? <span> — {h.comentario}</span> : null}
            </li>
          ))}
        </ol>
      </details>
    </li>
  );
}
