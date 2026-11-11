"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import QRCode from "qrcode";

import { Icon } from "@/components/Icon";
import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import { ApiError, authApi } from "@/services/api";
import type { ConfiguracionDobleFactor, EstadoDobleFactor } from "@/types/api";
import { agruparClave, panelDe, rolDeApi } from "@/utils/sesion";

type Props = Pick<AgroDirectoState, "navigate" | "setToast" | "sesion">;

/**
 * Verificación en dos pasos: configurar la app de autenticación, guardar los códigos de respaldo
 * y, si el rol lo permite, desactivarla.
 */
export function Seguridad({ navigate, setToast, sesion }: Props) {
  const usuario = sesion.usuario;
  const [estado, setEstado] = useState<EstadoDobleFactor | null>(null);
  const [configuracion, setConfiguracion] = useState<ConfiguracionDobleFactor | null>(null);
  const [qr, setQr] = useState("");
  const [codigo, setCodigo] = useState("");
  const [respaldos, setRespaldos] = useState<string[] | null>(null);
  const [guardados, setGuardados] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    authApi
      .estadoDobleFactor()
      .then(setEstado)
      .catch((e) => setError(mensajeDe(e)));
  }, []);

  useEffect(() => {
    if (!configuracion) return;
    QRCode.toDataURL(configuracion.uri, {
      width: 360,
      margin: 1,
      color: { dark: "#123c2d", light: "#ffffff" },
    }).then(setQr);
  }, [configuracion]);

  if (!usuario) return null;
  const irAlPanel = () => navigate(panelDe(rolDeApi(usuario.rol)));

  const empezar = async () => {
    setError("");
    setEnviando(true);
    try {
      setConfiguracion(await authApi.configurarDobleFactor());
    } catch (e) {
      setError(mensajeDe(e));
    } finally {
      setEnviando(false);
    }
  };

  const activar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setError("");
    setEnviando(true);
    try {
      const activacion = await authApi.activarDobleFactor(codigo);
      sesion.reemplazarSesion(activacion.sesion);
      setRespaldos(activacion.codigosRespaldo);
      setEstado((actual) =>
        actual ? { ...actual, activo: true, codigosRespaldoDisponibles: 8 } : actual,
      );
      setConfiguracion(null);
    } catch (e) {
      setError(mensajeDe(e));
      setCodigo("");
    } finally {
      setEnviando(false);
    }
  };

  const desactivar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    setError("");
    setEnviando(true);
    try {
      setEstado(await authApi.desactivarDobleFactor(codigo));
      await sesion.refrescarUsuario();
      setCodigo("");
      setToast("Desactivaste la verificación en dos pasos.");
    } catch (e) {
      setError(mensajeDe(e));
    } finally {
      setEnviando(false);
    }
  };

  const copiar = async (texto: string, aviso: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setToast(aviso);
    } catch {
      setToast("No se pudo copiar. Selecciona el texto y cópialo a mano.");
    }
  };

  const descargarRespaldos = () => {
    if (!respaldos) return;
    const contenido = [
      "AgroDirecto · Códigos de respaldo",
      `Cuenta: ${usuario.email}`,
      "Cada código sirve una sola vez si no tienes tu celular.",
      "",
      ...respaldos,
    ].join("\n");
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(new Blob([contenido], { type: "text/plain;charset=utf-8" }));
    enlace.download = "agrodirecto-codigos-respaldo.txt";
    enlace.click();
    URL.revokeObjectURL(enlace.href);
  };

  const alerta = error ? (
    <p className="aviso aviso-error" role="alert">
      <Icon name="warning" size={18} />
      {error}
    </p>
  ) : null;

  return (
    <main className="content-page">
      <div className="container narrow-container">
        <div className="page-title">
          <h1>Seguridad de tu cuenta</h1>
          <p>
            La verificación en dos pasos pide, además de tu contraseña, un código que genera tu
            celular. Así nadie entra a tu cuenta aunque conozca tu contraseña.
          </p>
        </div>

        <section className="surface-card form-card">
          {respaldos ? (
            <>
              <h2 className="form-seccion">Guarda tus códigos de respaldo</h2>
              <p>
                Si pierdes tu celular, cada uno de estos códigos te deja entrar{" "}
                <strong>una sola vez</strong>. No volverán a mostrarse: guárdalos fuera de tu
                celular.
              </p>
              <ul className="respaldos">
                {respaldos.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
              <div className="acciones-fila">
                <button
                  type="button"
                  className="btn btn-claro"
                  onClick={() => copiar(respaldos.join("\n"), "Copiaste los códigos de respaldo.")}
                >
                  <Icon name="copy" size={17} />
                  Copiar
                </button>
                <button type="button" className="btn btn-claro" onClick={descargarRespaldos}>
                  <Icon name="download" size={17} />
                  Descargar
                </button>
              </div>
              <label className="check-line">
                <input
                  type="checkbox"
                  checked={guardados}
                  onChange={(e) => setGuardados(e.target.checked)}
                />
                Ya guardé mis códigos en un lugar seguro.
              </label>
              <button
                className="btn btn-brand btn-lg mt-4"
                disabled={!guardados}
                onClick={irAlPanel}
              >
                Continuar
              </button>
            </>
          ) : !estado ? (
            error ? (
              alerta
            ) : (
              <p className="cargando-pantalla">Cargando…</p>
            )
          ) : estado.activo ? (
            <>
              <div className="estado-2fa">
                <span className="sello">
                  <Icon name="lock" size={26} />
                </span>
                <div>
                  <h2>Verificación en dos pasos activa</h2>
                  <p>
                    Te quedan {estado.codigosRespaldoDisponibles} código
                    {estado.codigosRespaldoDisponibles === 1 ? "" : "s"} de respaldo.
                  </p>
                </div>
              </div>
              {estado.obligatorio ? (
                <p className="aviso aviso-info mt-4">
                  <Icon name="info" size={18} />
                  Tu rol la requiere siempre, por eso no se puede desactivar.
                </p>
              ) : (
                <form className="mt-4" onSubmit={desactivar}>
                  {alerta}
                  <label className="campo">
                    Para desactivarla, escribe el código actual de tu app
                    <input
                      className="form-control codigo-input"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      value={codigo}
                      onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                    />
                  </label>
                  <button className="btn btn-claro" type="submit" disabled={enviando}>
                    {enviando ? "Desactivando…" : "Desactivar verificación"}
                  </button>
                </form>
              )}
            </>
          ) : (
            <>
              {estado.obligatorio ? (
                <p className="aviso aviso-atencion">
                  <Icon name="lock" size={18} />
                  Tu rol requiere la verificación en dos pasos. Actívala para continuar: toma menos
                  de dos minutos.
                </p>
              ) : null}
              {alerta}
              {!configuracion ? (
                <>
                  <p>Necesitas tu celular con una app de autenticación gratuita.</p>
                  <button className="btn btn-brand btn-lg" onClick={empezar} disabled={enviando}>
                    {enviando ? "Preparando…" : "Activar verificación en dos pasos"}
                  </button>
                </>
              ) : (
                <ol className="pasos-2fa">
                  <li>
                    <div>
                      <h2>Instala una app de autenticación</h2>
                      <p>
                        Google Authenticator, Microsoft Authenticator o Authy. Todas son gratuitas.
                      </p>
                    </div>
                  </li>
                  <li>
                    <div>
                      <h2>Escanea este código con la app</h2>
                      {qr ? (
                        <img
                          className="qr-2fa"
                          src={qr}
                          alt="Código QR para agregar AgroDirecto a tu app de autenticación"
                        />
                      ) : null}
                      <p>¿No puedes escanearlo? Elige “Ingresar clave” en la app y escribe:</p>
                      <div className="clave-manual">
                        <code>{agruparClave(configuracion.secreto)}</code>
                        <button
                          type="button"
                          className="btn btn-claro"
                          onClick={() => copiar(configuracion.secreto, "Copiaste la clave.")}
                        >
                          <Icon name="copy" size={17} />
                          Copiar clave
                        </button>
                      </div>
                    </div>
                  </li>
                  <li>
                    <form onSubmit={activar}>
                      <h2>Escribe el código de 6 dígitos que muestra la app</h2>
                      <label className="campo">
                        <span className="visually-hidden">Código de verificación</span>
                        <input
                          className="form-control codigo-input"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          pattern="[0-9]{6}"
                          maxLength={6}
                          required
                          value={codigo}
                          onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                        />
                      </label>
                      <button className="btn btn-brand btn-lg" type="submit" disabled={enviando}>
                        {enviando ? "Activando…" : "Activar"}
                      </button>
                    </form>
                  </li>
                </ol>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function mensajeDe(error: unknown): string {
  return error instanceof ApiError ? error.message : "Algo salió mal. Inténtalo de nuevo.";
}
