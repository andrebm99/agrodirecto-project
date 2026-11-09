"use client";

import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import { Icon } from "@/components/Icon";

export function Register({
  navigate,
  handleRegister,
  role,
  setRole,
}: Pick<AgroDirectoState, "navigate" | "handleRegister" | "role" | "setRole">) {
  return (
    <main className="content-page">
      <div className="container narrow-container">
        <button className="back-link" onClick={() => navigate("inicio")}>
          ← Volver
        </button>
        <div className="page-title">
          <span className="eyebrow">Únete a AgroDirecto</span>
          <h1>Crea una cuenta de demostración</h1>
          <p>Completa los datos para visualizar el recorrido de comprador o productor.</p>
        </div>
        <form className="surface-card form-card" onSubmit={handleRegister}>
          <div className="role-choice">
            <button
              type="button"
              className={role === "comprador" ? "selected" : ""}
              onClick={() => setRole("comprador")}
            >
              <span>
                <Icon name="home" size={28} strokeWidth={1.7} />
              </span>
              <strong>Soy comprador</strong>
              <small>Restaurante, bodega o comercio</small>
            </button>
            <button
              type="button"
              className={role === "productor" ? "selected" : ""}
              onClick={() => setRole("productor")}
            >
              <span>
                <Icon name="sprout" size={28} strokeWidth={1.7} />
              </span>
              <strong>Soy productor</strong>
              <small>Productor o asociación agrícola</small>
            </button>
          </div>
          <div className="row g-3">
            <div className="col-md-6">
              <label>
                Nombres
                <input className="form-control" required placeholder="Ej. Ana María" />
              </label>
            </div>
            <div className="col-md-6">
              <label>
                Apellidos
                <input className="form-control" required placeholder="Ej. Torres Rojas" />
              </label>
            </div>
            <div className="col-md-6">
              <label>
                Correo
                <input
                  className="form-control"
                  type="email"
                  required
                  placeholder="correo@ejemplo.pe"
                />
              </label>
            </div>
            <div className="col-md-6">
              <label>
                Teléfono
                <input
                  className="form-control"
                  inputMode="tel"
                  required
                  placeholder="999 999 999"
                />
              </label>
            </div>
            {role === "productor" && (
              <>
                <div className="col-md-6">
                  <label>
                    Nombre comercial
                    <input className="form-control" required placeholder="Ej. Valle Verde" />
                  </label>
                </div>
                <div className="col-md-6">
                  <label>
                    Región
                    <select className="form-select" required defaultValue="">
                      <option value="" disabled>
                        Selecciona una región
                      </option>
                      <option>Junín</option>
                      <option>Ica</option>
                      <option>Ayacucho</option>
                      <option>Puno</option>
                      <option>San Martín</option>
                    </select>
                  </label>
                </div>
                <div className="col-12">
                  <div className="location-preview">
                    <div>
                      <strong>Ubicación aproximada</strong>
                      <span>La dirección exacta no será pública.</span>
                    </div>
                    <span>Concepción, Junín</span>
                  </div>
                </div>
              </>
            )}
            <div className="col-md-6">
              <label>
                Contraseña
                <input
                  className="form-control"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Mínimo 8 caracteres"
                />
              </label>
            </div>
            <div className="col-md-6">
              <label>
                Confirmar contraseña
                <input
                  className="form-control"
                  type="password"
                  required
                  minLength={8}
                  placeholder="Repite la contraseña"
                />
              </label>
            </div>
          </div>
          <label className="check-line mt-3">
            <input type="checkbox" required /> Acepto el uso de datos ficticios para esta
            demostración académica.
          </label>
          <button className="btn btn-brand btn-lg mt-4" type="submit">
            Crear cuenta de demostración
          </button>
        </form>
      </div>
    </main>
  );
}
