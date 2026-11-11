"use client";

import type { EstadoApp } from "@/hooks/estadoApp";
import { Icon } from "@/components/Icon";
import { ETIQUETA_ROL, panelDe } from "@/utils/sesion";
import { Campana } from "@/components/layout/Campana";

export function Header({
  navigate, setMobileOpen, mobileOpen, view, sessionRole, catalogo, cartCount, logout, usuario, tiempoReal,
}: Pick<EstadoApp, "navigate" | "setMobileOpen" | "mobileOpen" | "view" | "sessionRole" | "catalogo" | "cartCount" | "logout" | "usuario" | "tiempoReal">) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <button className="brand" onClick={() => navigate("inicio")} aria-label="Ir al inicio de AgroDirecto">
          <span className="brand-mark">A</span>
          <span><strong>Agro</strong>Directo<small>Del campo a tu negocio</small></span>
        </button>
        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-expanded={mobileOpen} aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}>
          <Icon name={mobileOpen ? "close" : "menu"} size={20} />
        </button>
        <nav className={`main-nav ${mobileOpen ? "is-open" : ""}`} aria-label="Navegacion principal">
          <button className={view === "inicio" ? "active" : ""} onClick={() => navigate("inicio")}>Inicio</button>
          <button className={view === "catalogo" || view === "producto" ? "active" : ""} onClick={() => { catalogo.setSoloFavoritos(false); navigate("catalogo"); }}>Productos</button>
          <button onClick={() => { navigate("inicio"); window.setTimeout(() => document.getElementById("como-funciona")?.scrollIntoView({ behavior: "smooth" }), 100); }}>Como funciona</button>
          <button className={view === "productores" || view === "perfil" ? "active" : ""} onClick={() => navigate("productores")}>Productores</button>
          {usuario ? (
            <button className={view === "seguridad" ? "active" : ""} onClick={() => navigate("seguridad")}>
              Seguridad
            </button>
          ) : null}
        </nav>
        <div className="header-actions">
          <button
            className="account-link"
            onClick={() => (sessionRole ? navigate(panelDe(sessionRole)) : navigate("login"))}
            title={usuario && sessionRole ? `${usuario.nombre} · ${ETIQUETA_ROL[sessionRole]}` : undefined}
          >
            <Icon name="user" size={17} />{" "}
            <span className="cuenta-nombre">{usuario ? usuario.nombre.split(" ")[0] : "Ingresar"}</span>
          </button>
          {catalogo.idsFavoritos.size ? <button className="favorites-link" onClick={() => { catalogo.limpiarFiltros(); catalogo.setSoloFavoritos(true); navigate("catalogo"); }} aria-label={`${catalogo.idsFavoritos.size} productos favoritos`}>
            <Icon name="heart" size={18} fill="currentColor" /><span>{catalogo.idsFavoritos.size}</span>
          </button> : null}
          <Campana usuario={usuario} version={tiempoReal.version} />
          <button className="cart-link" onClick={() => navigate("carrito")} aria-label={`Carrito con ${cartCount} productos`}>
            <Icon name="cart" size={20} /><span className="cart-badge">{cartCount}</span>
          </button>
          {sessionRole ? <button className="logout-link" onClick={logout}>Salir</button> : null}
        </div>
      </div>
    </header>
  );
}
