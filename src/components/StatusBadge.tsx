"use client";

import type { OrderStatus } from "@/types/domain";
import { statusClass } from "@/utils/order";

export function StatusBadge({ status }: { status: OrderStatus }) {
  return <span className={`status-badge ${statusClass(status)}`}>{status}</span>;
}
