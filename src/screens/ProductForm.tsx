"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { Icon } from "@/components/Icon";
import { PRODUCT_IMAGE_PRESETS } from "@/data/products";
import type { EstadoApp } from "@/hooks/estadoApp";
import { useConsulta } from "@/hooks/useConsulta";
import { ApiError, catalogoApi, gestionProductosApi } from "@/services/api";
import type {
  FormatoSolicitud,
  ProductoGestion,
  ProductoSolicitud,
  TipoFormato,
} from "@/types/api";

type Props = Pick<EstadoApp, "navigate" | "setToast" | "gestion" | "editingProductId">;

const TIPOS: Record<TipoFormato, string> = {
  PEQUENO: "Pequeña",
  INTERMEDIO: "Intermedia",
  MAYORISTA: "Mayorista",
};

/** Alta y edición de productos con varias presentaciones (RN-02) y alertas de precio bajo (RN-A3). */
export function ProductForm({ navigate, setToast, gestion, editingProductId }: Props) {
  const existente = useConsulta(
    editingProductId ? `producto-gestion:${editingProductId}` : "producto-nuevo",
    () =>
      editingProductId ? gestionProductosApi.detalle(editingProductId) : Promise.resolve(null),
  );
  if (existente.cargando) return <main className="cargando-pantalla">Cargando…</main>;
  if (!editingProductId && !gestion.activo) {
    return (
      <main className="content-page">
        <div className="container narrow-container page-title">
          <h1>Primero elige un agricultor</h1>
          <button className="btn btn-brand btn-lg mt-3" onClick={() => navigate("productor")}>
            Ir al panel
          </button>
        </div>
      </main>
    );
  }
  return (
    <Formulario
      key={editingProductId ?? "nuevo"}
      producto={existente.datos ?? null}
      productorId={existente.datos?.productorId ?? gestion.activo!.id}
      productor={existente.datos?.productor ?? gestion.activo!.nombreComercial}
      navigate={navigate}
      setToast={setToast}
    />
  );
}

function Formulario({
  producto,
  productorId,
  productor,
  navigate,
  setToast,
}: {
  producto: ProductoGestion | null;
  productorId: number;
  productor: string;
} & Pick<Props, "navigate" | "setToast">) {
  const categorias = useConsulta("categorias", (s) => catalogoApi.categorias(s));
  const referencias = useConsulta("precios-referencia", () => catalogoApi.preciosReferencia());
  const [d, setD] = useState<Omit<ProductoSolicitud, "formatos">>({
    productorId,
    categoriaId: producto?.categoriaId ?? 1,
    precioReferenciaId: producto?.precioReferenciaId ?? null,
    nombre: producto?.nombre ?? "",
    descripcion: producto?.descripcion ?? "",
    imagenUrl: producto?.imagenUrl ?? PRODUCT_IMAGE_PRESETS[0].value,
    organico: producto?.organico ?? false,
    fechaCosecha: producto?.fechaCosecha ?? null,
    vidaUtilDias: producto?.vidaUtilDias ?? null,
    calibre: producto?.calibre ?? "",
  });
  const [formatos, setFormatos] = useState<FormatoSolicitud[]>(
    producto?.formatos
      .filter((f) => f.activo)
      .map((f) => ({
        id: f.id,
        nombre: f.nombre,
        tipo: f.tipo,
        pesoKg: f.pesoKg,
        precio: f.precio,
        stock: f.stock,
        cantidadMinDescuento: f.descuento?.desdeCantidad ?? null,
        porcentajeDescuento: f.descuento?.porcentaje ?? null,
      })) ?? [{ nombre: "", tipo: "MAYORISTA", pesoKg: null, precio: 0, stock: 0 }],
  );
  const [guardado, setGuardado] = useState<ProductoGestion | null>(null);
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const campo = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) =>
    setD((a) => ({ ...a, [k]: v }));
  const cambiarFormato = (i: number, k: keyof FormatoSolicitud, v: string) =>
    setFormatos((fs) =>
      fs.map((f, j) =>
        j !== i
          ? f
          : { ...f, [k]: k === "nombre" || k === "tipo" ? v : v === "" ? null : Number(v) },
      ),
    );

  const guardar = async (publicar: boolean, e?: FormEvent) => {
    e?.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const datos: ProductoSolicitud = { ...d, publicar, formatos };
      const r = producto
        ? await gestionProductosApi.actualizar(producto.id, datos)
        : await gestionProductosApi.crear(datos);
      if (r.alertas.length) setGuardado(r);
      else {
        setToast(
          r.estado === "ACTIVO"
            ? `${r.nombre} ya está publicado.`
            : `Guardaste ${r.nombre} como borrador.`,
        );
        navigate("productor");
      }
    } catch (err) {
      setError(
        err instanceof ApiError ? [err.message, ...err.detalles].join(" ") : "No se pudo guardar.",
      );
    } finally {
      setEnviando(false);
    }
  };

  if (guardado) {
    return (
      <main className="content-page">
        <div className="container narrow-container">
          <section className="surface-card form-card">
            <h1 className="form-seccion">{guardado.nombre}: revisa el precio</h1>
            {guardado.alertas.map((a) => (
              <p key={a} className="aviso aviso-atencion">
                <Icon name="warning" size={18} /> {a}
              </p>
            ))}
            <p>
              Puedes mantenerlo así: el precio lo decides tú. La alerta es para que vendas
              informado.
            </p>
            <div className="acciones-fila mb-0">
              <button className="btn btn-claro" onClick={() => setGuardado(null)}>
                Cambiar el precio
              </button>
              <button className="btn btn-brand" onClick={() => navigate("productor")}>
                Mantener y volver al panel
              </button>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="content-page">
      <div className="container narrow-container">
        <button className="back-link" onClick={() => navigate("productor")}>
          ← Volver al panel
        </button>
        <div className="page-title compact">
          <h1>{producto ? `Editar ${producto.nombre}` : "Nuevo producto"}</h1>
          <p>
            De {productor}. Tú fijas el precio: el comprador no puede regatear y el agricultor lo
            recibe completo.
          </p>
        </div>
        <form className="surface-card form-card" onSubmit={(e) => guardar(true, e)}>
          {error ? (
            <p className="aviso aviso-error" role="alert">
              <Icon name="warning" size={18} /> {error}
            </p>
          ) : null}
          <div className="row g-3">
            <div className="col-md-6">
              <label className="campo">
                Nombre del producto
                <input
                  className="form-control"
                  required
                  maxLength={120}
                  value={d.nombre}
                  onChange={(e) => campo("nombre", e.target.value)}
                  placeholder="Ej. Papa amarilla"
                />
              </label>
            </div>
            <div className="col-md-6">
              <label className="campo">
                Categoría
                <select
                  className="form-select"
                  value={d.categoriaId}
                  onChange={(e) => campo("categoriaId", Number(e.target.value))}
                >
                  {(categorias.datos ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="col-md-6">
              <label className="campo">
                Precio de mercado para comparar
                <select
                  className="form-select"
                  value={d.precioReferenciaId ?? ""}
                  onChange={(e) =>
                    campo("precioReferenciaId", e.target.value ? Number(e.target.value) : null)
                  }
                >
                  <option value="">Sin referencia</option>
                  {(referencias.datos ?? []).map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombre}
                    </option>
                  ))}
                </select>
                <span className="campo-ayuda">
                  Te avisaremos si tu precio queda muy por debajo del mercado.
                </span>
              </label>
            </div>
            <div className="col-md-6">
              <label className="campo">
                Foto
                <select
                  className="form-select"
                  value={d.imagenUrl}
                  onChange={(e) => campo("imagenUrl", e.target.value)}
                >
                  {PRODUCT_IMAGE_PRESETS.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="col-md-4">
              <label className="campo">
                Fecha de cosecha
                <input
                  className="form-control"
                  type="date"
                  value={d.fechaCosecha ?? ""}
                  onChange={(e) => campo("fechaCosecha", e.target.value || null)}
                />
              </label>
            </div>
            <div className="col-md-4">
              <label className="campo">
                Se conserva (días)
                <input
                  className="form-control"
                  type="number"
                  min={1}
                  value={d.vidaUtilDias ?? ""}
                  onChange={(e) =>
                    campo("vidaUtilDias", e.target.value ? Number(e.target.value) : null)
                  }
                />
              </label>
            </div>
            <div className="col-md-4">
              <label className="campo">
                Calibre <span className="opcional">(opcional)</span>
                <input
                  className="form-control"
                  maxLength={60}
                  value={d.calibre ?? ""}
                  onChange={(e) => campo("calibre", e.target.value)}
                />
              </label>
            </div>
            <div className="col-12">
              <label className="campo">
                Descripción
                <textarea
                  className="form-control"
                  maxLength={1000}
                  value={d.descripcion ?? ""}
                  onChange={(e) => campo("descripcion", e.target.value)}
                />
              </label>
            </div>
          </div>
          <label className="check-line mb-3">
            <input
              type="checkbox"
              checked={!!d.organico}
              onChange={(e) => campo("organico", e.target.checked)}
            />{" "}
            Producción orgánica
          </label>

          <h2 className="form-seccion">Presentaciones de venta</h2>
          <ul className="editor-zonas editor-formatos">
            {formatos.map((f, i) => (
              <li key={i}>
                <label className="campo">
                  Nombre
                  <input
                    className="form-control"
                    required
                    value={f.nombre}
                    onChange={(e) => cambiarFormato(i, "nombre", e.target.value)}
                    placeholder="Saco de 50 kg"
                  />
                </label>
                <label className="campo">
                  Tipo
                  <select
                    className="form-select"
                    value={f.tipo}
                    onChange={(e) => cambiarFormato(i, "tipo", e.target.value)}
                  >
                    {(Object.keys(TIPOS) as TipoFormato[]).map((t) => (
                      <option key={t} value={t}>
                        {TIPOS[t]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="campo">
                  Peso (kg)
                  <input
                    className="form-control"
                    type="number"
                    min={0}
                    step="0.1"
                    value={f.pesoKg ?? ""}
                    onChange={(e) => cambiarFormato(i, "pesoKg", e.target.value)}
                  />
                </label>
                <label className="campo">
                  Precio (S/)
                  <input
                    className="form-control"
                    type="number"
                    required
                    min={0.1}
                    step="0.1"
                    value={f.precio || ""}
                    onChange={(e) => cambiarFormato(i, "precio", e.target.value)}
                  />
                </label>
                <label className="campo">
                  Stock
                  <input
                    className="form-control"
                    type="number"
                    required
                    min={0}
                    value={f.stock}
                    onChange={(e) => cambiarFormato(i, "stock", e.target.value)}
                  />
                </label>
                <label className="campo">
                  Descuento desde
                  <input
                    className="form-control"
                    type="number"
                    min={2}
                    value={f.cantidadMinDescuento ?? ""}
                    onChange={(e) => cambiarFormato(i, "cantidadMinDescuento", e.target.value)}
                    placeholder="Ej. 10"
                  />
                </label>
                <label className="campo">
                  Descuento (%)
                  <input
                    className="form-control"
                    type="number"
                    min={1}
                    max={30}
                    value={f.porcentajeDescuento ?? ""}
                    onChange={(e) => cambiarFormato(i, "porcentajeDescuento", e.target.value)}
                  />
                </label>
                {formatos.length > 1 ? (
                  <button
                    type="button"
                    className="btn btn-claro"
                    onClick={() => setFormatos((fs) => fs.filter((_, j) => j !== i))}
                  >
                    <Icon name="trash" size={16} /> Quitar
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
          {formatos.length < 6 ? (
            <button
              type="button"
              className="btn btn-claro mb-4"
              onClick={() =>
                setFormatos((fs) => [
                  ...fs,
                  { nombre: "", tipo: "PEQUENO", pesoKg: null, precio: 0, stock: 0 },
                ])
              }
            >
              <Icon name="plus" size={16} /> Agregar presentación
            </button>
          ) : null}
          <div className="acciones-fila mb-0">
            <button className="btn btn-brand btn-lg" disabled={enviando}>
              {enviando ? "Guardando…" : "Publicar"}
            </button>
            <button
              type="button"
              className="btn btn-claro"
              disabled={enviando}
              onClick={() => guardar(false)}
            >
              Guardar como borrador
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
