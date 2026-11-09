"use client";

import type { AgroDirectoState } from "@/hooks/useAgroDirecto";
import type { Role } from "@/types/domain";

export function Login({
  navigate,
  role,
  setRole,
  handleLogin,
  showInfo,
}: Pick<AgroDirectoState, "navigate" | "role" | "setRole" | "handleLogin" | "showInfo">) {
  return (
    <main className="auth-page">
      <div className="auth-visual">
        <div>
          <span className="eyebrow light">Bienvenido de vuelta</span>
          <h1>Conecta, compra y gestiona desde un solo lugar.</h1>
          <p>Este acceso es una demostración frontend. No almacenamos contraseñas.</p>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card">
          <button className="back-link" onClick={() => navigate("inicio")}>
            ← Volver al inicio
          </button>
          <h2>Iniciar sesión</h2>
          <p>Bienvenido de nuevo. Ingresa a tu cuenta para continuar.</p>
          <div className="role-tabs" role="group" aria-label="Seleccionar perfil">
            {(["cliente", "productor", "administrador"] as Role[]).map((item) => (
              <button
                key={item}
                className={role === item ? "active" : ""}
                onClick={() => setRole(item)}
              >
                {item[0].toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>
          <form onSubmit={handleLogin}>
            <label>
              Correo electrónico
              <input
                className="form-control"
                type="email"
                defaultValue={
                  role === "productor"
                    ? "productor@demo.pe"
                    : role === "administrador"
                      ? "admin@demo.pe"
                      : "comprador@demo.pe"
                }
                required
              />
            </label>
            <label>
              Contraseña
              <input className="form-control" type="password" defaultValue="Demo2026" required />
            </label>
            <div className="form-line">
              <label className="check-line">
                <input type="checkbox" /> Recordarme
              </label>
              <button
                type="button"
                className="link-button"
                onClick={() =>
                  showInfo(
                    "Recuperación simulada",
                    "En el Avance 1 no se envían correos. El flujo real de recuperación se implementará con Spring Security en el producto final.",
                  )
                }
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <button className="btn btn-brand w-100 btn-lg" type="submit">
              Iniciar Sesión
            </button>
          </form>
          <p className="auth-switch">
            ¿Aún no tienes cuenta? <button onClick={() => navigate("registro")}>Regístrate</button>
          </p>
        </div>
      </div>
    </main>
  );
}
