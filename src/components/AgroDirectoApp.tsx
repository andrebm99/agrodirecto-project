"use client";

import { useAgroDirecto } from "@/hooks/useAgroDirecto";
import { useSesion } from "@/hooks/useSesion";
import { useCatalogo } from "@/hooks/useCatalogo";
import { useCarrito } from "@/hooks/useCarrito";
import type { EstadoApp } from "@/hooks/estadoApp";
import { AppModal } from "@/components/AppModal";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Home } from "@/screens/Home";
import { Login } from "@/screens/Login";
import { Register } from "@/screens/Register";
import { Catalog } from "@/screens/Catalog";
import { ProductDetail } from "@/screens/ProductDetail";
import { Cart } from "@/screens/Cart";
import { Checkout } from "@/screens/Checkout";
import { Orders } from "@/screens/Orders";
import { ProducerDashboard } from "@/screens/ProducerDashboard";
import { ProductForm } from "@/screens/ProductForm";
import { ReceivedOrders } from "@/screens/ReceivedOrders";
import { Admin } from "@/screens/Admin";
import { Seguridad } from "@/screens/Seguridad";
import { Productores } from "@/screens/Productores";
import { PerfilProductor } from "@/screens/PerfilProductor";
import { accesoA, ETIQUETA_ROL, panelDe } from "@/utils/sesion";
import { Icon } from "@/components/Icon";

export default function AgroDirectoApp() {
  const sesion = useSesion();
  const catalogo = useCatalogo(sesion);
  const carrito = useCarrito();
  const base = useAgroDirecto(sesion);
  const state: EstadoApp = { ...base, catalogo, carrito, cartCount: carrito.unidades };
  const { view, navigate, sessionRole, cartCount, toast } = state;
  const screens = { inicio: Home, login: Login, registro: Register, catalogo: Catalog, producto: ProductDetail, carrito: Cart, confirmar: Checkout, pedidos: Orders, productor: ProducerDashboard, publicar: ProductForm, recibidos: ReceivedOrders, admin: Admin, seguridad: Seguridad, productores: Productores, perfil: PerfilProductor };
  const acceso = accesoA(view, sesion.usuario);
  // Una pantalla privada sin sesión muestra el login en su lugar (la dirección no cambia: al ingresar se continúa ahí).
  // Si falta configurar el segundo factor, se muestra la pantalla de seguridad.
  const visible =
    acceso === "requiere-sesion" ? "login" : acceso === "requiere-doble-factor" ? "seguridad" : view;
  const Screen = screens[visible];

  const contenido =
    acceso === "requiere-sesion" && sesion.cargandoSesion ? (
      <main className="cargando-pantalla" aria-busy="true">
        Cargando…
      </main>
    ) : acceso === "sin-permiso" && sessionRole ? (
      <main className="content-page">
        <div className="container narrow-container page-title">
          <h1>Esta sección no es para tu cuenta</h1>
          <p>Ingresaste como {ETIQUETA_ROL[sessionRole].toLowerCase()}. Vuelve a tu panel para continuar.</p>
          <button className="btn btn-brand btn-lg mt-4" onClick={() => navigate(panelDe(sessionRole))}>
            Ir a mi panel
          </button>
        </div>
      </main>
    ) : (
      <Screen {...state} />
    );

  return (
    <div className="site-shell">
      {visible !== "login" && <Header {...state} />}
      {contenido}
      {visible !== "login" && <Footer {...state} />}
      {visible !== "login" ? <nav className="mobile-bottom-nav" aria-label="Navegacion movil">
        <button className={view === "inicio" ? "active" : ""} onClick={() => navigate("inicio")}><Icon name="home" size={18} />Inicio</button>
        <button className={view === "catalogo" || view === "producto" ? "active" : ""} onClick={() => { catalogo.setSoloFavoritos(false); navigate("catalogo"); }}><Icon name="grid" size={18} />Productos</button>
        <button className={view === "pedidos" ? "active" : ""} onClick={() => navigate("pedidos")}><Icon name="settings" size={18} />Pedidos</button>
        <button className={["productor", "publicar", "recibidos", "admin"].includes(view) ? "active" : ""} onClick={() => sessionRole ? navigate(panelDe(sessionRole)) : navigate("login")}><Icon name="user" size={18} />{sessionRole ? "Panel" : "Ingresar"}</button>
        <button className={view === "carrito" || view === "confirmar" ? "active" : ""} onClick={() => navigate("carrito")}><Icon name="cart" size={18} />Carrito{cartCount ? <b>{cartCount}</b> : null}</button>
      </nav> : null}
      {toast ? <div className="toast-message" role="status"><Icon name="check" size={18} />{toast}</div> : null}
      <AppModal {...state} />
    </div>
  );
}
