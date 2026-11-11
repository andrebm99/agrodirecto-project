"use client";

import { useEffect, useRef } from "react";

import type { AgroDirectoState } from "@/hooks/useAgroDirecto";

/** Aviso informativo (por ejemplo, cómo recuperar la contraseña). Se cierra con el botón o con Escape. */
export function AppModal({ modal, setModal }: Pick<AgroDirectoState, "modal" | "setModal">) {
  const boton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!modal) return;
    boton.current?.focus();
    const alPresionar = (e: KeyboardEvent) => e.key === "Escape" && setModal(null);
    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [modal, setModal]);

  if (!modal) return null;
  return (
    <div className="modal-backdrop-custom">
      <div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="modal-titulo">
        <h2 id="modal-titulo">{modal.title}</h2>
        <p>{modal.message}</p>
        <div className="modal-actions">
          <button ref={boton} className="btn btn-brand" onClick={() => setModal(null)}>
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
