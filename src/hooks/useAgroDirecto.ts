"use client";

import { useEffect, useState } from "react";

import { VIEW_LABELS } from "@/config/navigation";
import type { SesionState } from "@/hooks/useSesion";
import type { Usuario } from "@/types/api";
import type { Role, View } from "@/types/domain";
import { accesoA, panelDe, requiereConfigurarDobleFactor, rolDeApi } from "@/utils/sesion";

/**
 * Estado de la interfaz que comparten todas las pantallas: navegación por "#", avisos, menú móvil,
 * modal informativo y lo que ocurre después de iniciar sesión. Los datos del negocio viven en
 * sus propios hooks (catálogo, carrito, gestión, tiempo real) y se leen de la API.
 */
export function useAgroDirecto(sesion: SesionState) {
  const [view, setView] = useState<View>("inicio");
  /** Id que acompaña a la ruta: #producto/3, #perfil/2. */
  const [selectedProductId, setSelectedProductId] = useState(1);
  /** Producto en edición (#publicar/5) o null para uno nuevo (#publicar). */
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  /** Rol sugerido al abrir el registro (por ejemplo, "Quiero vender" preselecciona productor). */
  const [role, setRole] = useState<Role>("comprador");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [modal, setModal] = useState<null | { title: string; message: string }>(null);

  // Lee la ruta de la dirección (también al usar los botones atrás/adelante del navegador).
  useEffect(() => {
    const leerRuta = () => {
      const [pantalla, id] = window.location.hash.replace(/^#/, "").split("/");
      if (!pantalla || !(pantalla in VIEW_LABELS)) return;
      setView(pantalla as View);
      if (id && Number(id)) setSelectedProductId(Number(id));
      if (pantalla === "publicar") setEditingProductId(id && Number(id) ? Number(id) : null);
    };
    const inicial = window.setTimeout(leerRuta, 0);
    window.addEventListener("hashchange", leerRuta);
    window.addEventListener("popstate", leerRuta);
    return () => {
      window.clearTimeout(inicial);
      window.removeEventListener("hashchange", leerRuta);
      window.removeEventListener("popstate", leerRuta);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const espera = window.setTimeout(() => setToast(""), 3600);
    return () => window.clearTimeout(espera);
  }, [toast]);

  const navigate = (next: View, id?: number) => {
    setView(next);
    if (id) setSelectedProductId(id);
    if (next === "publicar") setEditingProductId(id ?? null);
    window.history.pushState(null, "", `#${id ? `${next}/${id}` : next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileOpen(false);
  };

  const showInfo = (title: string, message: string) => setModal({ title, message });

  /**
   * Después de ingresar o registrarse: primero el segundo factor si falta; si se llegó al login desde una
   * pantalla privada, se continúa en ella; si no, se va al panel del rol.
   */
  const despuesDeIngresar = (usuario: Usuario, mensaje?: string) => {
    setToast(mensaje ?? `Hola, ${usuario.nombre.split(" ")[0]}.`);
    if (requiereConfigurarDobleFactor(usuario)) {
      navigate("seguridad");
      return;
    }
    const venia = view !== "login" && view !== "registro" && accesoA(view, usuario) === "permitido";
    if (!venia) navigate(panelDe(rolDeApi(usuario.rol)));
  };

  const logout = () => {
    sesion.cerrarSesion();
    setRole("comprador");
    setToast("Cerraste sesión.");
    navigate("inicio");
  };

  return {
    sesion,
    usuario: sesion.usuario,
    sessionRole: sesion.rol,
    view,
    navigate,
    selectedProductId,
    editingProductId,
    role,
    setRole,
    mobileOpen,
    setMobileOpen,
    toast,
    setToast,
    modal,
    setModal,
    showInfo,
    despuesDeIngresar,
    logout,
    /** Lo reemplaza el carrito real en AgroDirectoApp. */
    cartCount: 0,
  };
}

export type AgroDirectoState = ReturnType<typeof useAgroDirecto>;
