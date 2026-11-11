"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { Icon } from "@/components/Icon";
import { ApiError, productoresApi } from "@/services/api";
import type { MetodoCobro, ProductorGestion, ProductorSolicitud } from "@/types/api";
import { erroresPorCampo } from "@/utils/sesion";

const COBRO: Record<MetodoCobro, { texto: string; numero: string }> = {
  YAPE: { texto: "Yape", numero: "Celular de Yape (9 dígitos)" },
  PLIN: { texto: "Plin", numero: "Celular de Plin (9 dígitos)" },
  CUENTA_DNI: { texto: "Cuenta DNI (Banco de la Nación)", numero: "DNI de la cuenta (8 dígitos)" },
  CUENTA_BANCARIA: { texto: "Cuenta bancaria", numero: "CCI (20 dígitos)" },
};

interface Props {
  modo: "propio" | "asistido";
  regiones: string[];
  onListo: (productor: ProductorGestion) => void;
  onCancelar?: () => void;
}

/** Alta del perfil del agricultor: él mismo (con smartphone) o su agente de campo (registro asistido, RN-B1). */
export function FormularioProductor({ modo, regiones, onListo, onCancelar }: Props) {
  const [d, setD] = useState<ProductorSolicitud>({
    nombreComercial: "",
    nombreTitular: "",
    dni: "",
    telefono: "",
    region: "",
    provincia: "",
    metodoCobro: "YAPE",
    numeroCobro: "",
  });
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const cambiar = (campo: keyof ProductorSolicitud) => (valor: string) =>
    setD((a) => ({ ...a, [campo]: valor }));

  const enviar = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setErrores({});
    setEnviando(true);
    try {
      const limpio = {
        ...d,
        telefono: d.telefono.replace(/\s/g, ""),
        numeroCobro: d.numeroCobro.replace(/\s/g, ""),
      };
      onListo(
        await (modo === "propio"
          ? productoresApi.crearMiPerfil(limpio)
          : productoresApi.registrarAsistido(limpio)),
      );
    } catch (err) {
      if (err instanceof ApiError) {
        setErrores(erroresPorCampo(err.detalles));
        setError(err.message);
      } else setError("No se pudo guardar.");
    } finally {
      setEnviando(false);
    }
  };

  const texto = (
    campo: keyof ProductorSolicitud,
    etiqueta: string,
    extra: Record<string, unknown> = {},
  ) => (
    <label className="campo">
      {etiqueta}
      <input
        className="form-control"
        value={(d[campo] as string) ?? ""}
        onChange={(e) => cambiar(campo)(e.target.value)}
        aria-invalid={errores[campo] ? true : undefined}
        {...extra}
      />
      {errores[campo] ? <span className="campo-error">{errores[campo]}</span> : null}
    </label>
  );

  return (
    <form className="surface-card form-card" onSubmit={enviar}>
      <h2 className="form-seccion">
        {modo === "propio" ? "Completa tu perfil de productor" : "Registrar a un agricultor"}
      </h2>
      <p>
        {modo === "propio"
          ? "Con tu perfil los compradores conocen quién cultiva y desde dónde. Un agente o la administración verificará tu DNI en persona antes de que publiques."
          : "Registra al agricultor con sus datos. No necesita correo ni computadora: recibirá los pedidos por SMS y el dinero en su medio de cobro."}
      </p>
      {error ? (
        <p className="aviso aviso-error" role="alert">
          <Icon name="warning" size={18} /> {error}
        </p>
      ) : null}
      <div className="row g-3">
        <div className="col-md-6">
          {texto("nombreComercial", "Nombre de la chacra o marca", {
            required: true,
            maxLength: 120,
          })}
        </div>
        <div className="col-md-6">
          {texto("nombreTitular", "Nombres y apellidos del agricultor", {
            required: true,
            maxLength: 120,
          })}
        </div>
        <div className="col-md-6">
          {texto("dni", "DNI", { required: true, inputMode: "numeric", maxLength: 8 })}
        </div>
        <div className="col-md-6">
          {texto("telefono", "Celular (para los SMS)", { required: true, inputMode: "tel" })}
        </div>
        <div className="col-md-4">
          <label className="campo">
            Región
            <select
              className="form-select"
              required
              value={d.region}
              onChange={(e) => cambiar("region")(e.target.value)}
            >
              <option value="">Elige</option>
              {regiones.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="col-md-4">
          {texto("provincia", "Provincia", { required: true, maxLength: 60 })}
        </div>
        <div className="col-md-4">{texto("distrito", "Distrito", { maxLength: 60 })}</div>
        <div className="col-md-6">
          <label className="campo">
            ¿Dónde recibe su dinero?
            <select
              className="form-select"
              value={d.metodoCobro}
              onChange={(e) => cambiar("metodoCobro")(e.target.value)}
            >
              {(Object.keys(COBRO) as MetodoCobro[]).map((m) => (
                <option key={m} value={m}>
                  {COBRO[m].texto}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="col-md-6">
          {texto("numeroCobro", COBRO[d.metodoCobro].numero, {
            required: true,
            inputMode: "numeric",
          })}
        </div>
        <div className="col-12">
          <label className="campo">
            Su historia <span className="opcional">(opcional)</span>
            <textarea
              className="form-control"
              maxLength={1000}
              value={d.historia ?? ""}
              onChange={(e) => cambiar("historia")(e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="acciones-fila mb-0">
        <button className="btn btn-brand btn-lg" disabled={enviando}>
          {enviando ? "Guardando…" : "Guardar perfil"}
        </button>
        {onCancelar ? (
          <button type="button" className="btn btn-claro" onClick={onCancelar}>
            Cancelar
          </button>
        ) : null}
      </div>
    </form>
  );
}
