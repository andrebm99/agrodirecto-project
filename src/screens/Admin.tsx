"use client";

import { useState } from "react";

import { Icon } from "@/components/Icon";
import type { EstadoApp } from "@/hooks/estadoApp";
import { useConsulta } from "@/hooks/useConsulta";
import { adminApi, ApiError, catalogoApi, confianzaApi } from "@/services/api";
import type { PrecioReferenciaSolicitud } from "@/services/api/admin";
import type { Disputa, PrecioReferencia, RolApi, Usuario } from "@/types/api";
import { fecha, money } from "@/utils/format";
import { ESTADO_PEDIDO, MOTIVO_RECLAMO } from "@/utils/pedido";
import { ETIQUETA_ROL, rolDeApi } from "@/utils/sesion";

type Props = Pick<EstadoApp, "setToast">;
type Pestana = "resumen" | "cuentas" | "disputas" | "precios" | "auditoria";

/** Panel de administración: métricas, cuentas, disputas, precios de referencia y auditoría. */
export function Admin({ setToast }: Props) {
  const [pestana, setPestana] = useState<Pestana>("resumen");
  const [version, setVersion] = useState(0);
  const recargar = () => setVersion((v) => v + 1);
  const ejecutar = async (op: () => Promise<unknown>, aviso: string) => {
    try {
      await op();
      setToast(aviso);
      recargar();
      return true;
    } catch (e) {
      setToast(e instanceof ApiError ? e.message : "No se pudo completar.");
      return false;
    }
  };

  return (
    <main className="content-page">
      <div className="container">
        <div className="page-title compact">
          <h1>Administración</h1>
          <p>Cada acción pide un motivo y queda registrada en la auditoría.</p>
        </div>
        <div className="pestanas" role="tablist" aria-label="Secciones">
          {(
            [
              ["resumen", "Resumen"],
              ["cuentas", "Cuentas"],
              ["disputas", "Disputas"],
              ["precios", "Precios de referencia"],
              ["auditoria", "Auditoría"],
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
          {pestana === "resumen" ? <Resumen version={version} /> : null}
          {pestana === "cuentas" ? <Cuentas version={version} ejecutar={ejecutar} /> : null}
          {pestana === "disputas" ? <Disputas version={version} ejecutar={ejecutar} /> : null}
          {pestana === "precios" ? <Precios version={version} ejecutar={ejecutar} /> : null}
          {pestana === "auditoria" ? <Auditoria version={version} /> : null}
        </section>
      </div>
    </main>
  );
}

type Ejecutar = (op: () => Promise<unknown>, aviso: string) => Promise<boolean>;

function Resumen({ version }: { version: number }) {
  const { datos: r, error } = useConsulta(`admin-resumen:${version}`, () => adminApi.resumen());
  if (error) return <p className="aviso aviso-error">{error}</p>;
  if (!r) return <p className="text-muted">Cargando…</p>;
  return (
    <>
      <p className="precio-justo-nota">
        {r.dinero.porcentajeAlAgricultor !== null
          ? `De cada sol que pagan los compradores, ${r.dinero.porcentajeAlAgricultor}% llegó al agricultor.`
          : "Aún no hay pedidos completados para medir cuánto llega al agricultor."}
      </p>
      <dl className="desglose">
        <div>
          <dt>Transado (pedidos completados)</dt>
          <dd>{money(r.dinero.transado)}</dd>
        </div>
        <div>
          <dt>Pagado a agricultores</dt>
          <dd>{money(r.dinero.pagadoAgricultores)}</dd>
        </div>
        <div>
          <dt>Servicio AgroDirecto</dt>
          <dd>{money(r.dinero.comisiones)}</dd>
        </div>
        <div>
          <dt>Dinero retenido ahora</dt>
          <dd>{money(r.dinero.retenido)}</dd>
        </div>
        <div>
          <dt>Productores verificados</dt>
          <dd>
            {r.productoresVerificados} de {r.productores}
          </dd>
        </div>
        <div>
          <dt>Productos publicados</dt>
          <dd>{r.productosActivos}</dd>
        </div>
        <div>
          <dt>Disputas abiertas</dt>
          <dd>{r.disputasAbiertas}</dd>
        </div>
        <div>
          <dt>Por verificar</dt>
          <dd>
            {r.pendientesDeVerificacion.agentes} agentes · {r.pendientesDeVerificacion.compradores}{" "}
            compradores · {r.pendientesDeVerificacion.productores} productores
          </dd>
        </div>
      </dl>
      <h2 className="form-seccion">Pedidos por estado</h2>
      <ul className="etiquetas-productor mb-3">
        {Object.entries(r.pedidosPorEstado).map(([e, n]) => (
          <li key={e}>
            {ESTADO_PEDIDO[e as keyof typeof ESTADO_PEDIDO]?.texto ?? e}: {n}
          </li>
        ))}
        {!Object.keys(r.pedidosPorEstado).length ? <li>Sin pedidos</li> : null}
      </ul>
      <h2 className="form-seccion">Productores con más ventas</h2>
      {r.topProductores.length ? (
        <ol className="historial">
          {r.topProductores.map((p) => (
            <li key={p.productorId}>
              <strong>{p.nombreComercial}</strong> · {money(p.ventas)} en {p.pedidos} pedidos
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-muted">Todavía no hay ventas completadas.</p>
      )}
    </>
  );
}

function Cuentas({ version, ejecutar }: { version: number; ejecutar: Ejecutar }) {
  const [rol, setRol] = useState<RolApi | "">("");
  const [soloPendientes, setSoloPendientes] = useState(false);
  const { datos } = useConsulta(`admin-usuarios:${rol}:${soloPendientes}:${version}`, () =>
    adminApi.usuarios({ rol: rol || undefined, verificado: soloPendientes ? false : undefined }),
  );
  const [accion, setAccion] = useState<{
    usuario: Usuario;
    tipo: "verificar" | "suspender" | "reactivar";
  } | null>(null);
  const [motivo, setMotivo] = useState("");
  return (
    <>
      <div className="filtros-secundarios mb-3">
        <label className="filtro-region">
          Rol
          <select
            className="form-select"
            value={rol}
            onChange={(e) => setRol(e.target.value as RolApi | "")}
          >
            <option value="">Todos</option>
            {(["COMPRADOR", "PRODUCTOR", "AGENTE", "ADMINISTRADOR"] as RolApi[]).map((r) => (
              <option key={r} value={r}>
                {ETIQUETA_ROL[rolDeApi(r)]}
              </option>
            ))}
          </select>
        </label>
        <label className="check-line filtro-organico">
          <input
            type="checkbox"
            checked={soloPendientes}
            onChange={(e) => setSoloPendientes(e.target.checked)}
          />{" "}
          Solo sin verificar
        </label>
      </div>
      <ul className="lista-pedidos">
        {(datos ?? []).map((u) => (
          <li key={u.id} className="producto-gestion">
            <div className="pedido-cabecera">
              <div>
                <h2>{u.nombre}</h2>
                <p>
                  {ETIQUETA_ROL[rolDeApi(u.rol)]} · {u.email}
                  {u.telefono ? ` · ${u.telefono}` : ""}
                </p>
              </div>
              <span
                className={`status-badge estado-pedido status-${u.estado === "SUSPENDIDO" ? "danger" : u.verificado ? "success" : "warning"}`}
              >
                {u.estado === "SUSPENDIDO"
                  ? "Suspendida"
                  : u.verificado
                    ? "Verificada"
                    : "Sin verificar"}
              </span>
            </div>
            {u.rol !== "ADMINISTRADOR" ? (
              <div className="acciones-fila mt-3 mb-0">
                {!u.verificado && (u.rol === "AGENTE" || u.rol === "COMPRADOR") ? (
                  <button
                    className="btn btn-claro"
                    onClick={() => setAccion({ usuario: u, tipo: "verificar" })}
                  >
                    Verificar identidad
                  </button>
                ) : null}
                {u.estado === "ACTIVO" ? (
                  <button
                    className="btn btn-claro"
                    onClick={() => setAccion({ usuario: u, tipo: "suspender" })}
                  >
                    Suspender
                  </button>
                ) : (
                  <button
                    className="btn btn-claro"
                    onClick={() => setAccion({ usuario: u, tipo: "reactivar" })}
                  >
                    Reactivar
                  </button>
                )}
              </div>
            ) : null}
            {accion?.usuario.id === u.id ? (
              <form
                className="panel-accion"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const op =
                    accion.tipo === "verificar"
                      ? adminApi.verificarUsuario
                      : accion.tipo === "suspender"
                        ? adminApi.suspenderUsuario
                        : adminApi.reactivarUsuario;
                  if (
                    await ejecutar(
                      () => op(u.id, motivo.trim()),
                      `Cuenta de ${u.nombre}: ${accion.tipo === "verificar" ? "verificada" : accion.tipo === "suspender" ? "suspendida" : "reactivada"}.`,
                    )
                  ) {
                    setAccion(null);
                    setMotivo("");
                  }
                }}
              >
                <label className="campo">
                  Motivo (queda en la auditoría)
                  <input
                    className="form-control"
                    required
                    maxLength={400}
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    placeholder={
                      accion.tipo === "verificar"
                        ? "Ej. DNI y RUC validados en SUNAT"
                        : "Ej. Tres pedidos sin recoger"
                    }
                  />
                </label>
                <div className="acciones-fila mb-0">
                  <button className="btn btn-brand">Confirmar</button>
                  <button type="button" className="btn btn-claro" onClick={() => setAccion(null)}>
                    Cancelar
                  </button>
                </div>
              </form>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  );
}

function Disputas({ version, ejecutar }: { version: number; ejecutar: Ejecutar }) {
  const { datos } = useConsulta(`admin-disputas:${version}`, () => confianzaApi.disputasAdmin());
  const [texto, setTexto] = useState<Record<number, string>>({});
  if (!datos) return <p className="text-muted">Cargando…</p>;
  if (!datos.length) return <p className="text-muted">No hay disputas.</p>;
  const resolver = (d: Disputa, aFavor: "COMPRADOR" | "PRODUCTOR") =>
    ejecutar(
      () => confianzaApi.resolver(d.id, aFavor, (texto[d.id] ?? "").trim()),
      `Disputa de ${d.pedido} resuelta a favor del ${aFavor === "COMPRADOR" ? "comprador" : "agricultor"}.`,
    );
  return (
    <ul className="lista-pedidos">
      {datos.map((d) => (
        <li key={d.id} className="producto-gestion">
          <div className="pedido-cabecera">
            <div>
              <h2>
                {d.pedido} · {MOTIVO_RECLAMO[d.motivo].texto}
              </h2>
              <p>
                {d.comprador} contra {d.productor} · {money(d.montoEnJuego)} en juego ·{" "}
                {fecha(d.creadaEn)}
              </p>
            </div>
            <span
              className={`status-badge estado-pedido status-${d.estado === "ABIERTA" ? "warning" : "success"}`}
            >
              {d.estado === "ABIERTA"
                ? "Abierta"
                : d.estado === "A_FAVOR_COMPRADOR"
                  ? "A favor del comprador"
                  : "A favor del agricultor"}
            </span>
          </div>
          <p className="mt-2 mb-1">
            <strong>Comprador:</strong> {d.descripcion}{" "}
            {d.evidenciaUrl ? (
              <a href={d.evidenciaUrl} target="_blank" rel="noopener noreferrer">
                Ver foto
              </a>
            ) : null}
          </p>
          <p className="mb-1">
            <strong>Agricultor:</strong> {d.descargo ?? "Aún no presenta su versión."}{" "}
            {d.evidenciaDescargoUrl ? (
              <a href={d.evidenciaDescargoUrl} target="_blank" rel="noopener noreferrer">
                Ver foto
              </a>
            ) : null}
          </p>
          {d.estado === "ABIERTA" ? (
            <div className="panel-accion">
              <label className="campo">
                Resolución (se comunica a ambas partes)
                <textarea
                  className="form-control"
                  maxLength={1000}
                  value={texto[d.id] ?? ""}
                  onChange={(e) => setTexto({ ...texto, [d.id]: e.target.value })}
                />
              </label>
              <div className="acciones-fila mb-0">
                <button
                  className="btn btn-claro"
                  disabled={!texto[d.id]?.trim()}
                  onClick={() => resolver(d, "COMPRADOR")}
                >
                  Reembolsar al comprador
                </button>
                <button
                  className="btn btn-claro"
                  disabled={!texto[d.id]?.trim()}
                  onClick={() => resolver(d, "PRODUCTOR")}
                >
                  Liberar pago al agricultor
                </button>
              </div>
            </div>
          ) : (
            <p className="text-muted mb-0">
              {d.resolucion} — {d.resueltaPor}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

function Precios({ version, ejecutar }: { version: number; ejecutar: Ejecutar }) {
  const { datos } = useConsulta(`admin-precios:${version}`, () => catalogoApi.preciosReferencia());
  const [edicion, setEdicion] = useState<(PrecioReferenciaSolicitud & { id?: number }) | null>(
    null,
  );
  const hoy = new Date().toISOString().slice(0, 10);
  const editar = (p?: PrecioReferencia) =>
    setEdicion(
      p
        ? {
            id: p.id,
            clave: p.clave,
            nombre: p.nombre,
            precioMayoristaKg: p.precioMayoristaKg,
            precioMinoristaKg: p.precioMinoristaKg,
            fuente: p.fuente,
            fecha: hoy,
          }
        : {
            clave: "",
            nombre: "",
            precioMayoristaKg: 0,
            precioMinoristaKg: 0,
            fuente: "",
            fecha: hoy,
          },
    );
  return (
    <>
      <p>Las alertas de precio bajo para los agricultores se calculan con estos valores por kg.</p>
      <button className="btn btn-claro mb-3" onClick={() => editar()}>
        <Icon name="plus" size={16} /> Nuevo precio
      </button>
      {edicion ? (
        <form
          className="panel-accion mb-3"
          onSubmit={async (e) => {
            e.preventDefault();
            const { id, ...datosPrecio } = edicion;
            if (
              await ejecutar(
                () =>
                  id
                    ? adminApi.actualizarPrecio(id, datosPrecio)
                    : adminApi.crearPrecio(datosPrecio),
                `Precio de ${edicion.nombre} guardado.`,
              )
            )
              setEdicion(null);
          }}
        >
          <ul className="editor-zonas">
            <li>
              <label className="campo">
                Clave
                <input
                  className="form-control"
                  required
                  disabled={!!edicion.id}
                  value={edicion.clave}
                  onChange={(e) => setEdicion({ ...edicion, clave: e.target.value.toUpperCase() })}
                  placeholder="PAPA_AMARILLA"
                />
              </label>
              <label className="campo">
                Nombre
                <input
                  className="form-control"
                  required
                  value={edicion.nombre}
                  onChange={(e) => setEdicion({ ...edicion, nombre: e.target.value })}
                />
              </label>
              <label className="campo">
                Mayorista (S/ kg)
                <input
                  className="form-control"
                  type="number"
                  step="0.01"
                  min={0.01}
                  required
                  value={edicion.precioMayoristaKg || ""}
                  onChange={(e) =>
                    setEdicion({ ...edicion, precioMayoristaKg: Number(e.target.value) })
                  }
                />
              </label>
              <label className="campo">
                Minorista (S/ kg)
                <input
                  className="form-control"
                  type="number"
                  step="0.01"
                  min={0.01}
                  required
                  value={edicion.precioMinoristaKg || ""}
                  onChange={(e) =>
                    setEdicion({ ...edicion, precioMinoristaKg: Number(e.target.value) })
                  }
                />
              </label>
              <label className="campo">
                Fuente
                <input
                  className="form-control"
                  required
                  value={edicion.fuente}
                  onChange={(e) => setEdicion({ ...edicion, fuente: e.target.value })}
                  placeholder="Boletín de precios mayoristas"
                />
              </label>
              <label className="campo">
                Fecha
                <input
                  className="form-control"
                  type="date"
                  required
                  value={edicion.fecha}
                  onChange={(e) => setEdicion({ ...edicion, fecha: e.target.value })}
                />
              </label>
            </li>
          </ul>
          <div className="acciones-fila mb-0">
            <button className="btn btn-brand">Guardar</button>
            <button type="button" className="btn btn-claro" onClick={() => setEdicion(null)}>
              Cancelar
            </button>
          </div>
        </form>
      ) : null}
      <ul className="lista-pedidos">
        {(datos ?? []).map((p) => (
          <li key={p.id} className="producto-gestion pedido-cabecera">
            <div>
              <h2>{p.nombre}</h2>
              <p>
                Mayorista {money(p.precioMayoristaKg)}/kg · minorista {money(p.precioMinoristaKg)}
                /kg · {p.fuente}, {fecha(p.fecha)}
              </p>
            </div>
            <button className="btn btn-claro" onClick={() => editar(p)}>
              Actualizar
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}

function Auditoria({ version }: { version: number }) {
  const { datos } = useConsulta(`admin-auditoria:${version}`, () => adminApi.auditoria());
  if (!datos) return <p className="text-muted">Cargando…</p>;
  if (!datos.length) return <p className="text-muted">Aún no hay acciones registradas.</p>;
  return (
    <ol className="historial">
      {datos.map((a) => (
        <li key={a.id}>
          <strong>{a.tipo.replaceAll("_", " ").toLowerCase()}</strong> · {a.objetivo.toLowerCase()}{" "}
          {a.objetivoId} · {a.administrador} · {fecha(a.fecha)}
          {a.detalle ? ` — ${a.detalle}` : ""}
        </li>
      ))}
    </ol>
  );
}
