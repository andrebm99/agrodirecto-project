"use client";

import type { ProductStatus } from "@/types/domain";

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  const className =
    status === "Activo"
      ? "status-success"
      : status === "Borrador"
        ? "status-warning"
        : "status-danger";
  return <span className={`status-badge ${className}`}>{status}</span>;
}
