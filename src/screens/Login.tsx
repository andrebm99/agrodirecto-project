"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { FormEvent } from "react";

import { Icon } from "@/components/Icon";
import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import { ApiError } from "@/services/api";

type Props = Pick<AgroDirectoState, "navigate" | "showInfo" | "sesion" | "despuesDeIngresar">;

/** Cuentas ficticias de los datos de demostración del backend. */
const CUENTAS_DEMO = [
  {
    email: "compras@saborandino.pe",
    nombre: "Restaurante Sabor Andino",
    rol: "Comprador verificado",
  },
  { email: "donlucho@correo.pe", nombre: "Bodega Don Lucho", rol: "Comprador nuevo" },
  { email: "andesverde@agrodirecto.pe", nombre: "AndesVerde", rol: "Productor" },
  { email: "promotora@agrodirecto.pe", nombre: "Rosa Quispe", rol: "Agente · pide código" },
  { email: "admin@agrodirecto.pe", nombre: "Administración", rol: "Administración · pide código" },
];
const CLAVE_DEMO = "demo1234";

type Etapa =
  { tipo: "credenciales" } | { tipo: "codigo"; tokenTemporal: string; recordar: boolean };

export function Login({ navigate, showInfo, sesion, despuesDeIngresar }: Props) {
  const [etapa, setEtapa] = useState<Etapa>({ tipo: "credenciales" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verClave, setVerClave] = useState(false);
  const [recordar, setRecordar] = useState(false);
  const [codigo, setCodigo] = useState("");
  const [usarRespaldo, setUsarRespaldo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const idError = useId();
  const campoCodigo = useRef<HTMLInputElement>(null);

  // Al pasar al código (o cambiar a código de respaldo) el foco va al campo: útil con teclado y lector de pantalla.
  useEffect(() => {
    if (etapa.tipo === "codigo") campoCodigo.current?.focus();
  }, [etapa.tipo, usarRespaldo]);

  const ingresar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const resultado = await sesion.iniciarSesion(email, password, recordar);
      if (resultado.etapa === "codigo") {
        setEtapa({ tipo: "codigo", tokenTemporal: resultado.tokenTemporal, recordar });
        setCodigo("");
      } else {
        despuesDeIngresar(resultado.usuario);
      }
    } catch (e) {
      setError(mensajeDe(e));
    } finally {
      setEnviando(false);
    }
  };

  const verificar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (etapa.tipo !== "codigo") return;
    setError("");
    setEnviando(true);
    try {
      despuesDeIngresar(await sesion.verificarCodigo(etapa.tokenTemporal, codigo, etapa.recordar));
    } catch (e) {
      const expiro = e instanceof ApiError && e.message.includes("expiró");
      setError(mensajeDe(e));
      if (expiro) setEtapa({ tipo: "credenciales" });
      setCodigo("");
    } finally {
      setEnviando(false);
    }
  };

  const volverACredenciales = () => {
    setEtapa({ tipo: "credenciales" });
    setError("");
    setUsarRespaldo(false);
  };

  return (
    <main className="auth-page">
      <div className="auth-visual">
        <div>
          <h1>Del campo a tu negocio, sin tantos intermediarios.</h1>
          <p>
            El agricultor recibe su precio íntegro y tu pago queda protegido hasta que recibes el
            pedido.
          </p>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          {etapa.tipo === "credenciales" ? (
            <>
              <button className="back-link" onClick={() => navigate("inicio")}>
                ← Volver al inicio
              </button>
              <h2>Iniciar sesión</h2>
              <p>Ingresa con el correo y la contraseña de tu cuenta.</p>

              {sesion.avisoExpirada && !error ? (
                <p className="aviso aviso-info" role="status">
                  <Icon name="info" size={18} />
                  {sesion.avisoExpirada}
                </p>
              ) : null}
              {error ? (
                <p className="aviso aviso-error" role="alert" id={idError}>
                  <Icon name="warning" size={18} />
                  {error}
                </p>
              ) : null}

              <form onSubmit={ingresar}>
                <label className="campo">
                  Correo electrónico
                  <input
                    className="form-control"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-describedby={error ? idError : undefined}
                  />
                </label>
                <label className="campo campo-clave">
                  Contraseña
                  <input
                    className="form-control"
                    type={verClave ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="ver-clave"
                    onClick={() => setVerClave(!verClave)}
                    aria-pressed={verClave}
                  >
                    <Icon name={verClave ? "eye-off" : "eye"} size={17} />
                    {verClave ? "Ocultar" : "Mostrar"}
                  </button>
                </label>
                <div className="form-line">
                  <label className="check-line">
                    <input
                      type="checkbox"
                      checked={recordar}
                      onChange={(e) => setRecordar(e.target.checked)}
                    />
                    Mantener la sesión en este dispositivo
                  </label>
                  <button
                    type="button"
                    className="enlace-texto"
                    onClick={() =>
                      showInfo(
                        "¿Olvidaste tu contraseña?",
                        "La recuperación por correo todavía no está disponible. Pide a la administración de AgroDirecto que restablezca tu acceso.",
                      )
                    }
                  >
                    ¿La olvidaste?
                  </button>
                </div>
                <button className="btn btn-brand w-100 btn-lg" type="submit" disabled={enviando}>
                  {enviando ? "Ingresando…" : "Ingresar"}
                </button>
              </form>

              <p className="auth-switch">
                ¿Aún no tienes cuenta?{" "}
                <button onClick={() => navigate("registro")}>Regístrate</button>
              </p>

              <details className="cuentas-demo">
                <summary>Cuentas de demostración</summary>
                <p>
                  Datos ficticios para probar la plataforma. La contraseña de todas es{" "}
                  <strong>{CLAVE_DEMO}</strong>. Las cuentas de agente y administración piden además
                  el código de una app de autenticación.
                </p>
                <ul>
                  {CUENTAS_DEMO.map((cuenta) => (
                    <li key={cuenta.email}>
                      <span>
                        <strong>{cuenta.nombre}</strong>
                        <small>
                          {cuenta.rol} · {cuenta.email}
                        </small>
                      </span>
                      <button
                        type="button"
                        className="btn btn-claro"
                        onClick={() => {
                          setEmail(cuenta.email);
                          setPassword(CLAVE_DEMO);
                          setError("");
                        }}
                      >
                        Usar
                      </button>
                    </li>
                  ))}
                </ul>
              </details>
            </>
          ) : (
            <>
              <button className="back-link" onClick={volverACredenciales}>
                ← Usar otra cuenta
              </button>
              <h2>Verificación en dos pasos</h2>
              <p>
                {usarRespaldo
                  ? "Escribe uno de los códigos de respaldo que guardaste al activar la verificación. Cada código sirve una sola vez."
                  : "Abre tu app de autenticación (Google Authenticator, Microsoft Authenticator o Authy) y escribe el código de 6 dígitos de AgroDirecto."}
              </p>

              {error ? (
                <p className="aviso aviso-error" role="alert" id={idError}>
                  <Icon name="warning" size={18} />
                  {error}
                </p>
              ) : null}

              <form onSubmit={verificar}>
                <label className="campo">
                  {usarRespaldo ? "Código de respaldo" : "Código de verificación"}
                  <input
                    className={`form-control codigo-input ${usarRespaldo ? "respaldo" : ""}`}
                    inputMode={usarRespaldo ? "text" : "numeric"}
                    autoComplete="one-time-code"
                    pattern={usarRespaldo ? "[A-Za-z0-9]{5}-?[A-Za-z0-9]{5}" : "[0-9]{6}"}
                    maxLength={usarRespaldo ? 11 : 6}
                    required
                    ref={campoCodigo}
                    value={codigo}
                    onChange={(e) =>
                      setCodigo(usarRespaldo ? e.target.value : e.target.value.replace(/\D/g, ""))
                    }
                    aria-describedby={error ? idError : undefined}
                  />
                  {!usarRespaldo ? (
                    <span className="campo-ayuda">
                      El código cambia cada 30 segundos. Tienes 5 minutos para completar este paso.
                    </span>
                  ) : null}
                </label>
                <button className="btn btn-brand w-100 btn-lg" type="submit" disabled={enviando}>
                  {enviando ? "Verificando…" : "Verificar"}
                </button>
              </form>

              <p className="auth-switch">
                <button
                  onClick={() => {
                    setUsarRespaldo(!usarRespaldo);
                    setCodigo("");
                    setError("");
                  }}
                >
                  {usarRespaldo
                    ? "Usar el código de la app"
                    : "¿No tienes tu celular? Usa un código de respaldo"}
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}

function mensajeDe(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  return "Algo salió mal. Inténtalo de nuevo.";
}
