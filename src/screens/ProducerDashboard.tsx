"use client";

import { useState } from "react";

import { Icon } from "@/components/Icon";
import { EditorZonas } from "@/components/gestion/EditorZonas";
import { FormularioProductor } from "@/components/gestion/FormularioProductor";
import { MensajesProductor } from "@/components/gestion/MensajesProductor";
import { PedidosRecibidos } from "@/components/gestion/PedidosRecibidos";
import type { EstadoApp } from "@/hooks/estadoApp";
import { useConsulta } from "@/hooks/useConsulta";
import { ApiError, gestionProductosApi, productoresApi } from "@/services/api";
import type { EstadoProducto, ProductoGestion } from "@/types/api";
import { money } from "@/utils/format";

type Props = Pick<
  EstadoApp,
  "navigate" | "setToast" | "gestion" | "catalogo" | "sessionRole" | "view"
>;
type Pestana = "productos" | "pedidos" | "entregas" | "mensajes";

const ESTADO: Record<EstadoProducto, { texto: string; tono: string }> = {
  ACTIVO: { texto: "Publicado", tono: "success" },
  BORRADOR: { texto: "Borrador", tono: "warning" },
  RETIRADO: { texto: "Retirado", tono: "danger" },
};

/** Panel del productor y del agente de campo: productos, pedidos, entregas y mensajes de cada agricultor. */
export function ProducerDashboard({
  navigate,
  setToast,
  gestion,
  catalogo,
  sessionRole,
  view,
}: Props) {
  const [pestana, setPestana] = useState<Pestana>(view === "recibidos" ? "pedidos" : "productos");
  const [registrando, setRegistrando] = useState(false);
  const activo = gestion.activo;
  const esAgente = sessionRole === "agente";

  if (gestion.cargando && !gestion.productores.length)
    return <main className="cargando-pantalla">Cargando tu panel…</main>;

  if (registrando || !activo) {
    const modo = sessionRole === "productor" ? "propio" : "asistido";
    return (
      <main className="content-page">
        <div className="container narrow-container">
          {!activo && !registrando && esAgente ? (
            <div className="page-title">
              <h1>Tus agricultores</h1>
              <p>
                Aún no registras agricultores. Regístralos aquí aunque no tengan correo ni
                computadora.
              </p>
            </div>
          ) : null}
          {sessionRole === "administrador" && !activo ? (
            <p className="aviso aviso-info">No hay productores registrados todavía.</p>
          ) : (
            <FormularioProductor
              modo={modo}
              regiones={catalogo.regiones}
              onCancelar={activo ? () => setRegistrando(false) : undefined}
              onListo={(p) => {
                setToast(
                  modo === "propio"
                    ? "Tu perfil está listo."
                    : `Registraste a ${p.nombreComercial}.`,
                );
                setRegistrando(false);
                gestion.recargar();
                gestion.elegir(p.id);
              }}
            />
          )}
        </div>
      </main>
    );
  }

  const verificar = async () => {
    try {
      await productoresApi.verificar(activo.id);
      setToast(`Verificaste a ${activo.nombreComercial}. Ya puede publicar productos.`);
      gestion.recargar();
    } catch (e) {
      setToast(e instanceof ApiError ? e.message : "No se pudo verificar.");
    }
  };

  return (
    <main className="content-page">
      <div className="container">
        <div className="panel-cabecera">
          <div>
            <h1 className="perfil-nombre">{activo.nombreComercial}</h1>
            <p>
              {activo.nombreTitular} · {activo.provincia}, {activo.region}
              {activo.tieneCuentaPropia ? "" : " · sin cuenta propia, lo gestionas tú"}
            </p>
          </div>
          <div className="acciones-fila mb-0">
            {gestion.productores.length > 1 ? (
              <label className="filtro-region">
                Agricultor
                <select
                  className="form-select"
                  value={activo.id}
                  onChange={(e) => gestion.elegir(Number(e.target.value))}
                >
                  {gestion.productores.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombreComercial}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            {esAgente ? (
              <button className="btn btn-claro" onClick={() => setRegistrando(true)}>
                <Icon name="plus" size={16} /> Registrar agricultor
              </button>
            ) : null}
          </div>
        </div>

        {!activo.verificado ? (
          <div className="aviso aviso-atencion">
            <Icon name="info" size={18} />
            <div>
              <p className="mb-1">
                Falta verificar su identidad en persona: puede preparar borradores, pero no
                publicar.
              </p>
              {sessionRole !== "productor" ? (
                <button className="btn btn-claro" onClick={verificar}>
                  Comprobé su DNI en persona: verificar
                </button>
              ) : (
                <p className="mb-0">Un agente de AgroDirecto te visitará para comprobar tu DNI.</p>
              )}
            </div>
          </div>
        ) : null}

        <div className="pestanas" role="tablist" aria-label="Secciones del panel">
          {(
            [
              ["productos", "Productos"],
              ["pedidos", "Pedidos"],
              ["entregas", "Entregas y cobro"],
              ["mensajes", "Mensajes"],
            ] as [Pestana, string][]
          ).map(([v, t]) => (
            <button
              key={v}
              role="tab"
              aria-selected={pestana === v}
              className={pestana === v ? "active" : ""}
              onClick={() => setPestana(v)}
            >
              {t}
            </button>
          ))}
        </div>

        <section className="surface-card form-card" role="tabpanel">
          {pestana === "productos" ? (
            <Productos productorId={activo.id} navigate={navigate} setToast={setToast} />
          ) : null}
          {pestana === "pedidos" ? (
            <PedidosRecibidos productorId={activo.id} setToast={setToast} />
          ) : null}
          {pestana === "entregas" ? (
            <>
              <dl className="desglose">
                <div>
                  <dt>Cobra en</dt>
                  <dd>
                    {activo.metodoCobro.replace("_", " ")} ···{activo.numeroCobro.slice(-3)}
                  </dd>
                </div>
                <div>
                  <dt>Celular para SMS</dt>
                  <dd>{activo.telefono}</dd>
                </div>
                <div>
                  <dt>Comprobante</dt>
                  <dd>{activo.emiteFactura ? "Factura o boleta" : "Boleta"}</dd>
                </div>
                <div>
                  <dt>Verificación</dt>
                  <dd>
                    {activo.verificado
                      ? `Por ${activo.verificadoPor ?? "AgroDirecto"}`
                      : "Pendiente"}
                  </dd>
                </div>
              </dl>
              <h2 className="form-seccion">¿A dónde entrega?</h2>
              <EditorZonas
                key={activo.id}
                productor={activo}
                regiones={catalogo.regiones}
                onGuardado={gestion.recargar}
              />
            </>
          ) : null}
          {pestana === "mensajes" ? <MensajesProductor productorId={activo.id} /> : null}
        </section>
      </div>
    </main>
  );
}

function Productos({
  productorId,
  navigate,
  setToast,
}: { productorId: number } & Pick<Props, "navigate" | "setToast">) {
  const consulta = useConsulta(`productos-gestion:${productorId}`, () =>
    gestionProductosApi.listar(productorId),
  );
  const cambiar = async (p: ProductoGestion, estado: EstadoProducto) => {
    try {
      await gestionProductosApi.cambiarEstado(p.id, estado);
      setToast(`${p.nombre}: ${ESTADO[estado].texto.toLowerCase()}.`);
      consulta.recargar();
    } catch (e) {
      setToast(e instanceof ApiError ? e.message : "No se pudo cambiar el estado.");
    }
  };
  const productos = consulta.datos ?? [];
  return (
    <>
      <div className="acciones-fila">
        <button className="btn btn-brand" onClick={() => navigate("publicar")}>
          <Icon name="plus" size={16} /> Nuevo producto
        </button>
      </div>
      {!productos.length ? (
        <p className="text-muted">
          {consulta.cargando ? "Cargando productos…" : "Todavía no hay productos. Crea el primero."}
        </p>
      ) : (
        <ul className="lista-pedidos">
          {productos.map((p) => (
            <li key={p.id} className="tarjeta-pedido producto-gestion">
              <div className="pedido-cabecera">
                <div>
                  <h2>{p.nombre}</h2>
                  <p>
                    {p.formatos
                      .filter((f) => f.activo)
                      .map((f) => `${f.nombre}: ${money(f.precio)} · ${f.stock} disp.`)
                      .join(" · ")}
                  </p>
                </div>
                <span className={`status-badge status-${ESTADO[p.estado].tono} estado-pedido`}>
                  {ESTADO[p.estado].texto}
                </span>
              </div>
              {p.alertas.map((a) => (
                <p key={a} className="aviso aviso-atencion mt-2 mb-0">
                  <Icon name="warning" size={18} /> {a}
                </p>
              ))}
              <div className="acciones-fila mt-3 mb-0">
                <button className="btn btn-claro" onClick={() => navigate("publicar", p.id)}>
                  Editar
                </button>
                {p.estado !== "ACTIVO" ? (
                  <button className="btn btn-claro" onClick={() => cambiar(p, "ACTIVO")}>
                    Publicar
                  </button>
                ) : null}
                {p.estado === "ACTIVO" ? (
                  <button className="btn btn-claro" onClick={() => cambiar(p, "RETIRADO")}>
                    Retirar
                  </button>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
