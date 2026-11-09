import type { Product, ProductStatus } from "@/types/domain";

export function productStatus(product: Product): ProductStatus {
  return product.status ?? "Activo";
}
