export const STORAGE_KEYS = {
  products: "agrodirecto-products-v2",
  cart: "agrodirecto-cart-v2",
  orders: "agrodirecto-orders-v2",
  favorites: "agrodirecto-favorites-v2",
  sessionRole: "agrodirecto-session-role-v2",
} as const;

export function readStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
