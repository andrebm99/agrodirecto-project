"use client";

import { useState } from "react";
import type { FormEvent, InputHTMLAttributes, ReactNode } from "react";

import { Icon } from "@/components/Icon";
import type { IconName } from "@/components/Icon";
import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import { ApiError } from "@/services/api";
import type { RegistroSolicitud } from "@/types/api";
import type { Role } from "@/types/domain";
import { erroresPorCampo } from "@/utils/sesion";

type Props = Pick<
  AgroDirectoState,
  "navigate" | "role" | "setRole" | "sesion" | "despuesDeIngresar"
>;
type RolRegistro = Exclude<Role, "administrador">;

const OPCIONES: { rol: RolRegistro; icono: IconName; titulo: string; detalle: string }[] = [
  {
    rol: "comprador",
    icono: "home",
    titulo: "Soy comprador",
    detalle: "Restaurante, bodega o comercio",
  },
  { rol: "productor", icono: "sprout", titulo: "Soy productor", detalle: "Vendo lo que cultivo" },
  {
    rol: "agente",
    icono: "user",
    titulo: "Soy agente de campo",
    detalle: "Ayudo a agricultores a vender",
  },
];

const API_ROL: Record<RolRegistro, RegistroSolicitud["rol"]> = {
  comprador: "COMPRADOR",
  productor: "PRODUCTOR",
  agente: "AGENTE",
};

interface Datos {
  nombre: string;
  email: string;
  telefono: string;
  dni: string;
  ruc: string;
  razonSocial: string;
  password: string;
  confirmacion: string;
}

const VACIO: Datos = {
  nombre: "",
  email: "",
  telefono: "",
  dni: "",
  ruc: "",
  razonSocial: "",
  password: "",
  confirmacion: "",
};

function sin(errores: Record<string, string>, campo: string): Record<string, string> {
  const copia = { ...errores };
  delete copia[campo];
  return copia;
}

/** Mismas reglas que el backend, para avisar antes de enviar. */
function validar(datos: Datos, rol: RolRegistro): Record<string, string> {
  const errores: Record<string, string> = {};
  const telefono = datos.telefono.replace(/\s/g, "");
  if (!datos.nombre.trim()) errores.nombre = "Escribe tu nombre.";
  if (!/^\S+@\S+\.\S+$/.test(datos.email.trim())) errores.email = "Escribe un correo válido.";
  if (!/^9\d{8}$/.test(telefono))
    errores.telefono = "Debe ser un celular de 9 dígitos que empiece con 9.";
  if (rol === "agente" && !datos.dni)
    errores.dni = "El agente necesita su DNI para ser verificado.";
  if (datos.dni && !/^\d{8}$/.test(datos.dni)) errores.dni = "El DNI tiene 8 dígitos.";
  if (datos.ruc && !/^(10|20)\d{9}$/.test(datos.ruc))
    errores.ruc = "El RUC tiene 11 dígitos y empieza con 10 o 20.";
  if (datos.ruc && !datos.razonSocial.trim())
    errores.razonSocial = "Escribe la razón social del RUC.";
  if (datos.password.length < 8) errores.password = "Usa al menos 8 caracteres.";
  if (datos.confirmacion !== datos.password) errores.confirmacion = "Las contraseñas no coinciden.";
  return errores;
}

export function Register({ navigate, role, setRole, sesion, despuesDeIngresar }: Props) {
  const rol: RolRegistro = role === "administrador" ? "comprador" : role;
  const [datos, setDatos] = useState<Datos>(VACIO);
  const [errores, setErrores] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [acepta, setAcepta] = useState(false);

  const cambiar = (campo: keyof Datos) => (valor: string) => {
    setDatos((actual) => ({ ...actual, [campo]: valor }));
    if (errores[campo]) setErrores((actuales) => sin(actuales, campo));
  };

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setError("");
    const encontrados = validar(datos, rol);
    if (!acepta) encontrados.acepta = "Necesitamos tu autorización para crear la cuenta.";
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;

    setEnviando(true);
    try {
      const usuario = await sesion.registrar({
        nombre: datos.nombre.trim(),
        email: datos.email.trim(),
        password: datos.password,
        telefono: datos.telefono.replace(/\s/g, ""),
        dni: datos.dni || undefined,
        ruc: rol === "comprador" && datos.ruc ? datos.ruc : undefined,
        razonSocial: rol === "comprador" && datos.ruc ? datos.razonSocial.trim() : undefined,
        rol: API_ROL[rol],
      });
      const mensajes: Record<RolRegistro, string> = {
        comprador: "Tu cuenta está lista. Ya puedes hacer pedidos.",
        productor: "Tu cuenta está lista. El siguiente paso es completar tu perfil de productor.",
        agente: "Tu cuenta está lista. Activa la verificación en dos pasos para continuar.",
      };
      despuesDeIngresar(usuario, mensajes[rol]);
    } catch (e) {
      if (e instanceof ApiError && e.detalles.length) setErrores(erroresPorCampo(e.detalles));
      setError(
        e instanceof ApiError ? e.message : "No pudimos crear la cuenta. Inténtalo de nuevo.",
      );
    } finally {
      setEnviando(false);
    }
  };

  const campo = (
    nombre: keyof Datos,
    etiqueta: string,
    entrada: Partial<InputHTMLAttributes<HTMLInputElement>>,
    extra?: { opcional?: boolean; ayuda?: ReactNode },
  ) => (
    <label className="campo">
      {etiqueta}
      {extra?.opcional ? <span className="opcional">(opcional)</span> : null}
      <input
        className="form-control"
        value={datos[nombre]}
        onChange={(e) => cambiar(nombre)(e.target.value)}
        aria-invalid={errores[nombre] ? true : undefined}
        aria-describedby={`ayuda-${nombre}`}
        {...entrada}
      />
      {errores[nombre] ? (
        <span className="campo-error" id={`ayuda-${nombre}`}>
          {errores[nombre]}
        </span>
      ) : extra?.ayuda ? (
        <span className="campo-ayuda" id={`ayuda-${nombre}`}>
          {extra.ayuda}
        </span>
      ) : null}
    </label>
  );

  return (
    <main className="content-page">
      <div className="container narrow-container">
        <button className="back-link" onClick={() => navigate("inicio")}>
          ← Volver
        </button>
        <div className="page-title">
          <h1>Crea tu cuenta</h1>
          <p>Elige cómo vas a usar AgroDirecto.</p>
        </div>
        <form className="surface-card form-card" onSubmit={enviar} noValidate>
          <div className="role-choice tres" role="radiogroup" aria-label="Tipo de cuenta">
            {OPCIONES.map((opcion) => (
              <button
                key={opcion.rol}
                type="button"
                role="radio"
                aria-checked={rol === opcion.rol}
                className={rol === opcion.rol ? "selected" : ""}
                onClick={() => setRole(opcion.rol)}
              >
                <span>
                  <Icon name={opcion.icono} size={28} strokeWidth={1.7} />
                </span>
                <strong>{opcion.titulo}</strong>
                <small>{opcion.detalle}</small>
              </button>
            ))}
          </div>

          {rol === "agente" ? (
            <p className="aviso aviso-info">
              <Icon name="info" size={18} />
              Antes de registrar agricultores, AgroDirecto verifica tu identidad en persona. También
              necesitarás una app de autenticación en tu celular para entrar.
            </p>
          ) : null}

          {error ? (
            <p className="aviso aviso-error" role="alert">
              <Icon name="warning" size={18} />
              {error}
            </p>
          ) : null}

          <div className="row g-3">
            <div className="col-md-6">
              {campo(
                "nombre",
                rol === "comprador" ? "Nombre del negocio o tu nombre" : "Nombres y apellidos",
                { autoComplete: rol === "comprador" ? "organization" : "name", required: true },
              )}
            </div>
            <div className="col-md-6">
              {campo("email", "Correo electrónico", {
                type: "email",
                autoComplete: "email",
                required: true,
              })}
            </div>
            <div className="col-md-6">
              {campo(
                "telefono",
                "Celular",
                {
                  inputMode: "tel",
                  autoComplete: "tel-national",
                  placeholder: "987 654 321",
                  required: true,
                },
                { ayuda: "Te avisaremos por aquí cuando cambie un pedido." },
              )}
            </div>
            <div className="col-md-6">
              {campo(
                "dni",
                "DNI",
                { inputMode: "numeric", maxLength: 8, required: rol === "agente" },
                {
                  opcional: rol !== "agente",
                  ayuda:
                    rol === "productor" ? "Lo necesitarás para verificar tu perfil." : undefined,
                },
              )}
            </div>
            {rol === "comprador" ? (
              <>
                <div className="col-md-6">
                  {campo(
                    "ruc",
                    "RUC",
                    { inputMode: "numeric", maxLength: 11 },
                    { opcional: true, ayuda: "Para recibir factura." },
                  )}
                </div>
                <div className="col-md-6">
                  {campo(
                    "razonSocial",
                    "Razón social",
                    { autoComplete: "organization" },
                    { opcional: !datos.ruc },
                  )}
                </div>
              </>
            ) : null}
            <div className="col-md-6">
              {campo(
                "password",
                "Contraseña",
                { type: "password", autoComplete: "new-password", required: true },
                { ayuda: "Al menos 8 caracteres." },
              )}
            </div>
            <div className="col-md-6">
              {campo("confirmacion", "Repite la contraseña", {
                type: "password",
                autoComplete: "new-password",
                required: true,
              })}
            </div>
          </div>

          <label className="check-line mt-2">
            <input
              type="checkbox"
              checked={acepta}
              onChange={(e) => {
                setAcepta(e.target.checked);
                if (e.target.checked) setErrores((actuales) => sin(actuales, "acepta"));
              }}
              aria-invalid={errores.acepta ? true : undefined}
              aria-describedby="ayuda-acepta"
            />
            Acepto que AgroDirecto use mis datos solo para gestionar mi cuenta y mis pedidos (Ley
            N.° 29733 de Protección de Datos Personales).
          </label>
          {errores.acepta ? (
            <span className="campo-error" id="ayuda-acepta">
              {errores.acepta}
            </span>
          ) : null}
          <button className="btn btn-brand btn-lg mt-4" type="submit" disabled={enviando}>
            {enviando ? "Creando tu cuenta…" : "Crear cuenta"}
          </button>
          <p className="auth-switch">
            ¿Ya tienes cuenta?{" "}
            <button type="button" onClick={() => navigate("login")}>
              Inicia sesión
            </button>
          </p>
        </form>
      </div>
    </main>
  );
}
