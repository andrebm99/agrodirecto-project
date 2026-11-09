export type View =
  | "inicio"
  | "login"
  | "registro"
  | "catalogo"
  | "producto"
  | "carrito"
  | "confirmar"
  | "pedidos"
  | "productor"
  | "publicar"
  | "recibidos"
  | "admin";

export type Role = "comprador" | "productor" | "administrador";

export type ProductStatus = "Activo" | "Borrador" | "Retirado";

export type OrderStatus =
  | "Pendiente"
  | "Aceptado"
  | "Rechazado"
  | "En preparación"
  | "Listo para entrega"
  | "Entregado"
  | "Cancelado";

export type Product = {
  id: number;
  name: string;
  category: string;
  producerId: number;
  producer: string;
  location: string;
  lat: number;
  lng: number;
  unit: string;
  price: number;
  stock: number;
  image: string;
  organic?: boolean;
  harvest: string;
  description: string;
  status?: ProductStatus;
  updatedAt?: string;
};

export type CartItem = { productId: number; quantity: number };

export type Order = {
  id: string;
  producerId: number;
  producer: string;
  date: string;
  status: OrderStatus;
  items: CartItem[];
  total: number;
  address: string;
  note: string;
};
