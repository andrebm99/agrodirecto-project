"use client";

import { useAgroDirecto } from "@/hooks/useAgroDirecto";
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
import { Icon } from "@/components/Icon";

export default function AgroDirectoApp() {
  const state = useAgroDirecto();
  const { view, navigate, setFavoritesOnly, sessionRole, cartCount, toast } = state;
  const screens = { inicio: Home, login: Login, registro: Register, catalogo: Catalog, producto: ProductDetail, carrito: Cart, confirmar: Checkout, pedidos: Orders, productor: ProducerDashboard, publicar: ProductForm, recibidos: ReceivedOrders, admin: Admin };
  const Screen = screens[view];

  return (
    <div className="site-shell">
      {view !== "login" && <Header {...state} />}
      <Screen {...state} />
      {view !== "login" && <Footer {...state} />}
      {view !== "login" ? <nav className="mobile-bottom-nav" aria-label="Navegacion movil">
        <button className={view === "inicio" ? "active" : ""} onClick={() => navigate("inicio")}><Icon name="home" size={18} />Inicio</button>
        <button className={view === "catalogo" || view === "producto" ? "active" : ""} onClick={() => { setFavoritesOnly(false); navigate("catalogo"); }}><Icon name="grid" size={18} />Productos</button>
        <button className={view === "pedidos" ? "active" : ""} onClick={() => navigate("pedidos")}><Icon name="settings" size={18} />Pedidos</button>
        <button className={["productor", "publicar", "recibidos", "admin"].includes(view) ? "active" : ""} onClick={() => sessionRole ? navigate(sessionRole === "administrador" ? "admin" : sessionRole === "productor" ? "productor" : "pedidos") : navigate("login")}><Icon name="user" size={18} />Panel</button>
        <button className={view === "carrito" || view === "confirmar" ? "active" : ""} onClick={() => navigate("carrito")}><Icon name="cart" size={18} />Carrito{cartCount ? <b>{cartCount}</b> : null}</button>
      </nav> : null}
      {toast ? <div className="toast-message" role="status"><Icon name="check" size={18} />{toast}</div> : null}
      <AppModal {...state} />
    </div>
  );
}
