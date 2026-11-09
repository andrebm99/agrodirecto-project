"use client";

import { useEffect, useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type {
  View,
  Product,
  CartItem,
  Order,
  Role,
  ProductStatus,
  OrderStatus,
} from "@/types/domain";
import { PRODUCTS, PRODUCT_IMAGE_PRESETS } from "@/data/products";
import { INITIAL_ORDERS } from "@/data/orders";
import { VIEW_LABELS } from "@/config/navigation";
import { readStored, STORAGE_KEYS } from "@/services/storage";
import { productStatus } from "@/utils/product";
import { resizeProductImage } from "@/utils/image";

export function useAgroDirecto() {
  const [view, setView] = useState<View>("inicio");

  const [selectedProductId, setSelectedProductId] = useState(1);

  const [products, setProducts] = useState<Product[]>(PRODUCTS);

  const [cart, setCart] = useState<CartItem[]>([]);

  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);

  const [favorites, setFavorites] = useState<number[]>([]);

  const [sessionRole, setSessionRole] = useState<Role | null>(null);

  const [hydrated, setHydrated] = useState(false);

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("Todos");

  const [sort, setSort] = useState("relevancia");

  const [favoritesOnly, setFavoritesOnly] = useState(false);

  const [role, setRole] = useState<Role>("comprador");

  const [mobileOpen, setMobileOpen] = useState(false);

  const [toast, setToast] = useState("");

  const [modal, setModal] = useState<null | {
    type: "mixed" | "delete" | "order" | "info" | "reset";
    product?: Product;
    order?: Order;
    title?: string;
    message?: string;
  }>(null);

  const [adminTab, setAdminTab] = useState("resumen");

  const [orderFilter, setOrderFilter] = useState("Todos");

  const [buyerOrderFilter, setBuyerOrderFilter] = useState("Todos");

  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const [productImage, setProductImage] = useState<string>(PRODUCT_IMAGE_PRESETS[0].value);

  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const syncHash = () => {
      const raw = window.location.hash.replace(/^#/, "");
      if (!raw) return;
      const [screen, id] = raw.split("/");
      if (screen in VIEW_LABELS) setView(screen as View);
      if (id && Number(id)) setSelectedProductId(Number(id));
      if (screen === "publicar") setEditingProductId(id && Number(id) ? Number(id) : null);
    };
    const hydrate = window.setTimeout(() => {
      const storedProducts = readStored<Product[]>(STORAGE_KEYS.products, PRODUCTS);
      setProducts(storedProducts);
      setCart(
        readStored<CartItem[]>(STORAGE_KEYS.cart, readStored<CartItem[]>("agrodirecto-cart", [])),
      );
      setOrders(
        readStored<Order[]>(
          STORAGE_KEYS.orders,
          readStored<Order[]>("agrodirecto-orders", INITIAL_ORDERS),
        ),
      );
      setFavorites(readStored<number[]>(STORAGE_KEYS.favorites, []));
      const storedRole = localStorage.getItem(STORAGE_KEYS.sessionRole) as Role | null;
      if (storedRole && ["comprador", "productor", "administrador"].includes(storedRole)) {
        setSessionRole(storedRole);
        setRole(storedRole);
      }
      syncHash();
      const [, screen, id] = window.location.hash.match(/^#([^/]+)\/?(\d+)?/) ?? [];
      if (screen === "publicar" && id) {
        setProductImage(
          storedProducts.find((product) => product.id === Number(id))?.image ??
            PRODUCT_IMAGE_PRESETS[0].value,
        );
      }
      setHydrated(true);
    }, 0);
    window.addEventListener("hashchange", syncHash);
    window.addEventListener("popstate", syncHash);
    return () => {
      window.clearTimeout(hydrate);
      window.removeEventListener("hashchange", syncHash);
      window.removeEventListener("popstate", syncHash);
    };
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(products));
  }, [hydrated, products]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  }, [hydrated, cart]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders));
  }, [hydrated, orders]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
  }, [hydrated, favorites]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(""), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const navigate = (next: View, productId?: number) => {
    setView(next);
    if (productId) setSelectedProductId(productId);
    if (next === "producto") setQuantity(1);
    if (next === "publicar") {
      const editProduct = productId
        ? products.find((product) => product.id === productId)
        : undefined;
      setEditingProductId(productId ?? null);
      setProductImage(editProduct?.image ?? PRODUCT_IMAGE_PRESETS[0].value);
    }
    window.history.pushState(null, "", `#${productId ? `${next}/${productId}` : next}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
    setMobileOpen(false);
  };

  const selectedProduct = products.find((p) => p.id === selectedProductId) ?? products[0];

  const activeProducts = useMemo(
    () => products.filter((product) => productStatus(product) === "Activo"),
    [products],
  );

  const cartDetails = cart
    .map((item) => ({ ...item, product: products.find((p) => p.id === item.productId)! }))
    .filter((item) => item.product);

  const cartTotal = cartDetails.reduce((sum, item) => sum + item.quantity * item.product.price, 0);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const buyerOrders = orders.filter(
    (order) =>
      buyerOrderFilter === "Todos" ||
      (buyerOrderFilter === "En proceso"
        ? !["Entregado", "Cancelado", "Rechazado"].includes(order.status)
        : order.status === "Entregado"),
  );

  const filteredProducts = useMemo(() => {
    const term = search.toLocaleLowerCase("es");
    const result = activeProducts.filter(
      (p) =>
        (category === "Todos" || p.category === category) &&
        (!favoritesOnly || favorites.includes(p.id)) &&
        [p.name, p.producer, p.location].join(" ").toLocaleLowerCase("es").includes(term),
    );
    if (sort === "menor") return [...result].sort((a, b) => a.price - b.price);
    if (sort === "mayor") return [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [activeProducts, search, category, sort, favoritesOnly, favorites]);

  const addToCart = (product: Product, quantity = 1) => {
    if (productStatus(product) !== "Activo" || product.stock < 1) {
      setToast(`${product.name} no está disponible para pedidos.`);
      return;
    }
    const currentProducer = cartDetails[0]?.product.producerId;
    if (currentProducer && currentProducer !== product.producerId) {
      setModal({ type: "mixed", product });
      return;
    }
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if (existing)
        return current.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
            : item,
        );
      return [...current, { productId: product.id, quantity }];
    });
    setToast(`${product.name} se agregó al carrito.`);
  };

  const updateQuantity = (product: Product, quantity: number) => {
    if (quantity < 1) return;
    setCart((current) =>
      current.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: Math.min(product.stock, quantity) }
          : item,
      ),
    );
  };

  const removeFromCart = (productId: number) =>
    setCart((current) => current.filter((item) => item.productId !== productId));

  const toggleFavorite = (productId: number) => {
    setFavorites((current) =>
      current.includes(productId)
        ? current.filter((id) => id !== productId)
        : [...current, productId],
    );
    const product = products.find((item) => item.id === productId);
    setToast(
      favorites.includes(productId)
        ? `${product?.name ?? "Producto"} se quitó de favoritos.`
        : `${product?.name ?? "Producto"} se guardó en favoritos.`,
    );
  };

  const showInfo = (title: string, message: string) => setModal({ type: "info", title, message });

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    localStorage.setItem(STORAGE_KEYS.sessionRole, role);
    setSessionRole(role);
    setToast(`Acceso de demostración como ${role}.`);
    navigate(role === "productor" ? "productor" : role === "administrador" ? "admin" : "catalogo");
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.sessionRole);
    setSessionRole(null);
    setRole("comprador");
    setToast("Sesión de demostración cerrada.");
    navigate("inicio");
  };

  const handleRegister = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setToast("Cuenta de demostración creada correctamente.");
    navigate("login");
  };

  const handleCheckout = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!cartDetails.length) return;
    const data = new FormData(event.currentTarget);
    const producer = cartDetails[0].product;
    const lastOrderNumber = Math.max(
      2500,
      ...orders.map((order) => Number(order.id.replace(/\D/g, "")) || 0),
    );
    const order: Order = {
      id: `AG-${lastOrderNumber + 1}`,
      producerId: producer.producerId,
      producer: producer.producer,
      date: "14 ago. 2026",
      status: "Pendiente",
      items: cart,
      total: cartTotal,
      address: String(data.get("address") || "Dirección registrada"),
      note: String(data.get("note") || "Sin observaciones"),
    };
    setOrders((current) => [order, ...current]);
    setProducts((current) =>
      current.map((p) => {
        const ordered = cart.find((item) => item.productId === p.id);
        return ordered ? { ...p, stock: Math.max(0, p.stock - ordered.quantity) } : p;
      }),
    );
    setCart([]);
    setToast(`Pedido ${order.id} registrado. No se realizó ningún cobro.`);
    navigate("pedidos");
  };

  const saveProduct = (form: HTMLFormElement, status: ProductStatus) => {
    const data = new FormData(form);
    const existing = editingProductId
      ? products.find((product) => product.id === editingProductId)
      : undefined;
    const nextId = products.length ? Math.max(...products.map((product) => product.id)) + 1 : 1;
    const next: Product = {
      id: existing?.id ?? nextId,
      name: String(data.get("name") || existing?.name || "Borrador sin título"),
      category: String(data.get("category") || existing?.category || "Tubérculos"),
      producerId: 1,
      producer: "AndesVerde",
      location: "Concepción, Junín",
      lat: -11.917,
      lng: -75.314,
      unit: String(data.get("unit") || existing?.unit || "Saco de 50 kg"),
      price: Number(data.get("price") || existing?.price || 0),
      stock: Number(data.get("stock") || existing?.stock || 0),
      image: productImage || existing?.image || PRODUCT_IMAGE_PRESETS[0].value,
      organic: data.get("organic") === "on",
      harvest: existing?.harvest ?? "Disponibilidad inmediata",
      description: String(
        data.get("description") ||
          existing?.description ||
          "Descripción pendiente para completar antes de publicar.",
      ),
      status,
      updatedAt: new Date().toISOString(),
    };
    setProducts((current) =>
      existing
        ? current.map((product) => (product.id === existing.id ? next : product))
        : [next, ...current],
    );
    setEditingProductId(null);
    setProductImage(PRODUCT_IMAGE_PRESETS[0].value);
    setToast(
      status === "Borrador"
        ? "Borrador guardado en este dispositivo."
        : existing
          ? "Producto actualizado y publicado."
          : "Producto publicado en el prototipo.",
    );
    navigate("productor");
  };

  const handleProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    saveProduct(event.currentTarget, "Activo");
  };

  const saveDraft = (form: HTMLFormElement | null) => {
    if (form) saveProduct(form, "Borrador");
  };

  const handleProductImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      setProductImage(await resizeProductImage(file));
      setToast("Fotografía preparada para la vista previa local.");
    } catch (error) {
      showInfo(
        "No se pudo usar la fotografía",
        error instanceof Error ? error.message : "Selecciona otra imagen.",
      );
    } finally {
      event.target.value = "";
    }
  };

  const changeOrderStatus = (id: string, status: OrderStatus) => {
    const order = orders.find((item) => item.id === id);
    if (order?.status === "Pendiente" && status === "Rechazado") {
      setProducts((current) =>
        current.map((product) => {
          const ordered = order.items.find((item) => item.productId === product.id);
          return ordered ? { ...product, stock: product.stock + ordered.quantity } : product;
        }),
      );
    }
    setOrders((current) =>
      current.map((order) => (order.id === id ? { ...order, status } : order)),
    );
    setToast(`El pedido ${id} cambió a “${status}”.`);
  };

  const cancelOrder = (order: Order) => {
    if (order.status !== "Pendiente") return;
    setOrders((current) =>
      current.map((item) => (item.id === order.id ? { ...item, status: "Cancelado" } : item)),
    );
    setProducts((current) =>
      current.map((product) => {
        const ordered = order.items.find((item) => item.productId === product.id);
        return ordered ? { ...product, stock: product.stock + ordered.quantity } : product;
      }),
    );
    setModal(null);
    setToast(`Pedido ${order.id} cancelado y stock restablecido.`);
  };

  const deleteProduct = (product: Product) => {
    setProducts((current) =>
      current.map((item) =>
        item.id === product.id
          ? { ...item, status: "Retirado", updatedAt: new Date().toISOString() }
          : item,
      ),
    );
    setCart((current) => current.filter((item) => item.productId !== product.id));
    setModal(null);
    setToast(`${product.name} se retiró del prototipo.`);
  };

  const publishProduct = (productId: number) => {
    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? { ...product, status: "Activo", updatedAt: new Date().toISOString() }
          : product,
      ),
    );
    setToast("Producto publicado nuevamente.");
  };

  const resetDemo = () => {
    Object.values(STORAGE_KEYS).forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem("agrodirecto-cart");
    localStorage.removeItem("agrodirecto-orders");
    setProducts(PRODUCTS);
    setCart([]);
    setOrders(INITIAL_ORDERS);
    setFavorites([]);
    setSessionRole(null);
    setRole("comprador");
    setModal(null);
    setToast("Datos de demostración restablecidos.");
    navigate("inicio");
  };
  return {
    modal,
    setModal,
    setCart,
    setToast,
    deleteProduct,
    products,
    cancelOrder,
    resetDemo,
    navigate,
    setMobileOpen,
    mobileOpen,
    view,
    setFavoritesOnly,
    sessionRole,
    favorites,
    setSearch,
    setCategory,
    cartCount,
    logout,
    setRole,
    activeProducts,
    addToCart,
    toggleFavorite,
    role,
    handleLogin,
    showInfo,
    handleRegister,
    search,
    favoritesOnly,
    category,
    sort,
    setSort,
    filteredProducts,
    selectedProduct,
    setQuantity,
    quantity,
    cartDetails,
    removeFromCart,
    updateQuantity,
    cartTotal,
    handleCheckout,
    orders,
    buyerOrderFilter,
    setBuyerOrderFilter,
    buyerOrders,
    publishProduct,
    editingProductId,
    handleProduct,
    productImage,
    setProductImage,
    handleProductImage,
    saveDraft,
    orderFilter,
    setOrderFilter,
    changeOrderStatus,
    adminTab,
    setAdminTab,
    toast,
  };
}

export type AgroDirectoState = ReturnType<typeof useAgroDirecto>;
