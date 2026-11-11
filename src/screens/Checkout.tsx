"use client";

import { useState } from "react";

import { Icon } from "@/components/Icon";
import type { EstadoApp } from "@/hooks/estadoApp";
import { useConsulta } from "@/hooks/useConsulta";
import { ApiError, pedidosApi } from "@/services/api";
import type { MetodoPago, ModalidadEntrega, Pedido, PedidoSolicitud } from "@/types/api";
import { fecha, money } from "@/utils/format";
import { METODO_PAGO, MODALIDAD, sugerencia } from "@/utils/pedido";

type Props = Pick<EstadoApp, "carrito" | "catalogo" | "navigate" | "setToast">;

/** Checkout: cómo recibirlo, desglose transparente (RN-A5), confirmación y pago protegido (RN-C1). */
export function Checkout({ carrito, catalogo, navigate, setToast }: Props) {
  const [region, setRegion] = useState("");
  const [modalidad, setModalidad] = useState<ModalidadEntrega>("ENTREGA_DEL_PRODUCTOR");
  const [direccion, setDireccion] = useState("");
  const [nota, setNota] = useState("");
  const [pedido, setPedido] = useState<Pedido | null>(null);
  const [metodo, setMetodo] = useState<MetodoPago>("YAPE");
  const [operacion, setOperacion] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<{ mensaje: string; regla: string | null } | null>(null);

  const items = carrito.items.map((i) => ({ formatoId: i.formatoId, cantidad: i.cantidad }));
  const solicitud: PedidoSolicitud = {
    items,
    modalidadEntrega: modalidad,
    regionDestino: region,
    direccionEntrega: direccion.trim() || "Por definir",
    nota: nota.trim() || undefined,
  };
  // La cotización depende de productos, región y modalidad; la dirección no cambia los montos.
  const cotizacion = useConsulta(
    region && items.length && !pedido
      ? `cotizar:${JSON.stringify([items, region, modalidad])}`
      : null,
    () => pedidosApi.cotizar(solicitud),
  );

  const confirmar = async () => {
    setError(null);
    setEnviando(true);
    try {
      setPedido(await pedidosApi.crear({ ...solicitud, direccionEntrega: direccion.trim() }));
    } catch (e) {
      setError(
        e instanceof ApiError
          ? { mensaje: e.message, regla: e.regla }
          : { mensaje: "No se pudo registrar.", regla: null },
      );
    } finally {
      setEnviando(false);
    }
  };

  const pagar = async () => {
    if (!pedido) return;
    setError(null);
    setEnviando(true);
    try {
      await pedidosApi.pagar(pedido.id, metodo, operacion.trim() || undefined);
      carrito.vaciar();
      setToast(
        `Pagaste el pedido ${pedido.codigo}. El dinero queda protegido hasta que lo recibas.`,
      );
      navigate("pedidos");
    } catch (e) {
      setError({ mensaje: e instanceof ApiError ? e.message : "No se pudo pagar.", regla: null });
    } finally {
      setEnviando(false);
    }
  };

  if (!carrito.items.length && !pedido) {
    return (
      <main className="content-page">
        <div className="container narrow-container page-title">
          <h1>No hay productos para pedir</h1>
          <p>Agrega productos de un agricultor a tu carrito para continuar.</p>
          <button className="btn btn-brand btn-lg mt-4" onClick={() => navigate("catalogo")}>
            Ir al catálogo
          </button>
        </div>
      </main>
    );
  }

  const c = cotizacion.datos;
  const errorCotizacion = cotizacion.error;
  const bloqueo =
    error ?? (errorCotizacion ? { mensaje: errorCotizacion, regla: cotizacion.regla } : null);

  return (
    <main className="content-page">
      <div className="container">
        <div className="page-title compact">
          <h1>{pedido ? "Paga tu pedido" : "Confirma tu pedido"}</h1>
          <p>
            {pedido
              ? `Pedido ${pedido.codigo} registrado. El agricultor lo recibe en cuanto pagues.`
              : `Pedido a ${carrito.items[0].productor}. Elige cómo recibirlo.`}
          </p>
        </div>
        <div className="checkout-grid">
          <section className="surface-card form-card">
            {!pedido ? (
              <>
                <h2 className="form-seccion">Entrega</h2>
                <label className="campo">
                  Región de entrega
                  <select
                    className="form-select"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    required
                  >
                    <option value="">Elige la región de tu negocio</option>
                    {catalogo.regiones.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </label>
                <fieldset className="formatos">
                  <legend>¿Cómo lo recibes?</legend>
                  {(Object.keys(MODALIDAD) as ModalidadEntrega[]).map((m) => (
                    <label key={m} className={`formato ${modalidad === m ? "elegido" : ""}`}>
                      <input
                        type="radio"
                        name="modalidad"
                        checked={modalidad === m}
                        onChange={() => setModalidad(m)}
                      />
                      <span className="formato-nombre">{MODALIDAD[m].titulo}</span>
                      <span className="formato-detalle">{MODALIDAD[m].detalle}</span>
                    </label>
                  ))}
                </fieldset>
                <label className="campo">
                  {modalidad === "RECOJO_EN_CHACRA"
                    ? "Referencia para coordinar el recojo"
                    : "Dirección de entrega"}
                  <input
                    className="form-control"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    autoComplete="street-address"
                    maxLength={250}
                  />
                  <span className="campo-ayuda">
                    El agricultor la verá solo cuando acepte tu pedido.
                  </span>
                </label>
                <label className="campo">
                  Nota para el agricultor <span className="opcional">(opcional)</span>
                  <textarea
                    className="form-control"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    maxLength={500}
                  />
                </label>
              </>
            ) : (
              <>
                <h2 className="form-seccion">Método de pago</h2>
                <p className="aviso aviso-info">
                  <Icon name="lock" size={18} />
                  AgroDirecto guarda tu pago y lo entrega al agricultor cuando confirmas que
                  recibiste el pedido. Si no pagas en 60 minutos, el pedido se cancela. En esta
                  demostración el cobro es simulado.
                </p>
                <fieldset className="formatos">
                  <legend>Paga con</legend>
                  {(Object.keys(METODO_PAGO) as MetodoPago[]).map((m) => (
                    <label key={m} className={`formato ${metodo === m ? "elegido" : ""}`}>
                      <input
                        type="radio"
                        name="metodo"
                        checked={metodo === m}
                        onChange={() => setMetodo(m)}
                      />
                      <span className="formato-nombre">{METODO_PAGO[m]}</span>
                    </label>
                  ))}
                </fieldset>
                <label className="campo">
                  Número de operación <span className="opcional">(opcional)</span>
                  <input
                    className="form-control"
                    value={operacion}
                    onChange={(e) => setOperacion(e.target.value)}
                    maxLength={40}
                  />
                </label>
              </>
            )}
            {bloqueo ? (
              <div className="aviso aviso-error" role="alert">
                <Icon name="warning" size={18} />
                <div>
                  <p className="mb-1">{bloqueo.mensaje}</p>
                  {sugerencia(bloqueo.regla ?? null) ? (
                    <p className="mb-0">{sugerencia(bloqueo.regla)}</p>
                  ) : null}
                </div>
              </div>
            ) : null}
          </section>

          <aside className="order-summary surface-card" aria-live="polite">
            <h2>Resumen</h2>
            <ul className="lineas-resumen">
              {(pedido?.lineas ?? c?.lineas ?? []).map((l) => (
                <li key={l.formatoId}>
                  <span>
                    {l.cantidad} × {l.formato} · {l.producto}
                    {l.porcentajeDescuento > 0 ? ` (−${l.porcentajeDescuento}%)` : ""}
                  </span>
                  <strong>{money(l.subtotal)}</strong>
                </li>
              ))}
            </ul>
            {(() => {
              const d = pedido?.desglose ?? c?.desglose;
              if (!d) {
                return (
                  <p>
                    {region
                      ? cotizacion.cargando
                        ? "Calculando…"
                        : ""
                      : "Elige la región para ver el monto exacto."}
                  </p>
                );
              }
              return (
                <>
                  <div>
                    <span>Productos</span>
                    <strong>{money(d.subtotal)}</strong>
                  </div>
                  {d.descuento > 0 ? (
                    <div>
                      <span>Descuento por volumen</span>
                      <strong>−{money(d.descuento)}</strong>
                    </div>
                  ) : null}
                  <div>
                    <span>Flete</span>
                    <strong>{d.costoFlete > 0 ? money(d.costoFlete) : "Sin flete"}</strong>
                  </div>
                  <div>
                    <span>Servicio AgroDirecto (5%)</span>
                    <strong>{money(d.comision)}</strong>
                  </div>
                  <hr />
                  <div className="summary-total">
                    <span>Total</span>
                    <strong>{money(d.total)}</strong>
                  </div>
                  <p className="precio-justo-nota">{d.mensaje}</p>
                  {c && !pedido ? (
                    <p>
                      Entrega estimada: {fecha(c.fechaEntregaEstimada)} · Comprobante:{" "}
                      {c.emiteFactura ? "factura o boleta" : "boleta"}
                    </p>
                  ) : null}
                </>
              );
            })()}
            {!pedido ? (
              <button
                className="btn btn-brand btn-lg w-100"
                disabled={!c || enviando || !direccion.trim()}
                onClick={confirmar}
              >
                {enviando
                  ? "Registrando…"
                  : !direccion.trim() && c
                    ? "Escribe la dirección"
                    : "Confirmar pedido"}
              </button>
            ) : (
              <button className="btn btn-brand btn-lg w-100" disabled={enviando} onClick={pagar}>
                {enviando
                  ? "Procesando…"
                  : `Pagar ${money(pedido.desglose.total)} con ${METODO_PAGO[metodo]}`}
              </button>
            )}
            {!pedido ? (
              <button className="text-link mt-3" onClick={() => navigate("carrito")}>
                <Icon name="arrow-left" size={16} /> Volver al carrito
              </button>
            ) : null}
          </aside>
        </div>
      </div>
    </main>
  );
}
