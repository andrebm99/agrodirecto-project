import type { Order } from "@/types/domain";

export const INITIAL_ORDERS: Order[] = [
  {
    id: "AG-2408",
    producerId: 1,
    producer: "AndesVerde",
    date: "12 ago. 2026",
    status: "En preparación",
    items: [
      { productId: 1, quantity: 2 },
      { productId: 8, quantity: 1 },
    ],
    total: 331,
    address: "Av. Javier Prado 2450, San Borja",
    note: "Recepción por almacén de 9:00 a 13:00.",
  },
  {
    id: "AG-2381",
    producerId: 2,
    producer: "ValleFresco",
    date: "08 ago. 2026",
    status: "Entregado",
    items: [{ productId: 2, quantity: 3 }],
    total: 156,
    address: "Jr. Junín 520, Cercado de Lima",
    note: "Pedido recibido conforme.",
  },
  {
    id: "AG-2412",
    producerId: 1,
    producer: "AndesVerde",
    date: "13 ago. 2026",
    status: "Pendiente",
    items: [{ productId: 1, quantity: 1 }],
    total: 118,
    address: "Av. La Molina 1680, La Molina",
    note: "Confirmar disponibilidad por la mañana.",
  },
];
