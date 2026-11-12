/**
 * Tipos de la API de AgroDirecto. Reflejan los DTO del backend (repositorio agrodirecto-backend):
 * si cambia un record en Java, se actualiza aquí.
 */

// ---------- Comunes ----------

export type Fecha = string; // ISO 8601: "2026-11-10T21:48:49"
export type Dinero = number;

export interface ErrorApi {
  estado: number;
  regla: string | null;
  mensaje: string;
  detalles: string[];
  fecha: Fecha;
}

// ---------- Usuarios y sesión ----------

export type RolApi = "COMPRADOR" | "PRODUCTOR" | "AGENTE" | "ADMINISTRADOR";
export type EstadoCuenta = "ACTIVO" | "SUSPENDIDO";

export interface Usuario {
  id: number;
  nombre: string;
  email: string;
  telefono: string | null;
  razonSocial: string | null;
  rol: RolApi;
  verificado: boolean;
  estado: EstadoCuenta;
  dobleFactorActivo: boolean;
}

export interface Sesion {
  token: string | null;
  tipo: "Bearer" | null;
  expiraEn: Fecha;
  usuario: Usuario | null;
  requiereSegundoFactor: boolean;
  tokenTemporal: string | null;
}

export interface RegistroSolicitud {
  nombre: string;
  email: string;
  password: string;
  telefono: string;
  dni?: string;
  ruc?: string;
  razonSocial?: string;
  rol: Exclude<RolApi, "ADMINISTRADOR">;
}

export interface EstadoDobleFactor {
  activo: boolean;
  obligatorio: boolean;
  codigosRespaldoDisponibles: number;
}

export interface ConfiguracionDobleFactor {
  secreto: string;
  uri: string;
  instrucciones: string;
}

export interface ActivacionDobleFactor {
  codigosRespaldo: string[];
  sesion: Sesion;
}

// ---------- Productores ----------

export type MetodoCobro = "YAPE" | "PLIN" | "CUENTA_DNI" | "CUENTA_BANCARIA";

export interface Zona {
  region: string;
  diasTransito: number;
  pedidoMinimo: Dinero;
  costoFlete: Dinero;
}

export interface Asociacion {
  id: number;
  nombre: string;
  region: string;
  emiteFactura: boolean;
}

export interface ProductorPublico {
  id: number;
  nombreComercial: string;
  nombreTitular: string;
  region: string;
  provincia: string;
  distrito: string | null;
  latitud: number | null;
  longitud: number | null;
  historia: string | null;
  practicas: string | null;
  verificado: boolean;
  emiteFactura: boolean;
  asociacion: Asociacion | null;
  zonas: Zona[];
}

export interface ProductorGestion extends Omit<ProductorPublico, "asociacion"> {
  dni: string;
  telefono: string;
  tieneRuc: boolean;
  ruc: string | null;
  metodoCobro: MetodoCobro;
  numeroCobro: string;
  asociacion: Asociacion | null;
  tieneCuentaPropia: boolean;
  agente: string | null;
  verificadoPor: string | null;
  fechaVerificacion: Fecha | null;
  estado: EstadoCuenta;
}

export interface ProductorSolicitud {
  nombreComercial: string;
  nombreTitular: string;
  dni: string;
  telefono: string;
  region: string;
  provincia: string;
  distrito?: string;
  latitud?: number;
  longitud?: number;
  historia?: string;
  practicas?: string;
  ruc?: string;
  metodoCobro: MetodoCobro;
  numeroCobro: string;
  asociacionId?: number;
}

// ---------- Catálogo ----------

export type EstadoProducto = "ACTIVO" | "BORRADOR" | "RETIRADO";
export type TipoFormato = "PEQUENO" | "INTERMEDIO" | "MAYORISTA";

export interface Formato {
  id: number;
  nombre: string;
  tipo: TipoFormato;
  pesoKg: number | null;
  precio: Dinero;
  precioPorKg: Dinero | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  descuento: { desdeCantidad: number; porcentaje: number } | null;
}

export interface PrecioReferencia {
  id: number;
  clave: string;
  nombre: string;
  precioMayoristaKg: Dinero;
  precioMinoristaKg: Dinero;
  fuente: string;
  fecha: string;
}

export interface Categoria {
  id: number;
  nombre: string;
}

export interface ProductoResumen {
  id: number;
  nombre: string;
  categoria: string;
  imagenUrl: string | null;
  organico: boolean;
  fechaCosecha: string | null;
  precioDesde: Dinero | null;
  formatoDesde: string | null;
  disponible: boolean;
  productor: {
    id: number;
    nombreComercial: string;
    region: string;
    provincia: string;
    verificado: boolean;
  };
}

export interface ProductoDetalle {
  id: number;
  nombre: string;
  categoria: string;
  descripcion: string | null;
  imagenUrl: string | null;
  organico: boolean;
  fechaCosecha: string | null;
  vidaUtilDias: number | null;
  calibre: string | null;
  disponible: boolean;
  formatos: Formato[];
  precioReferencia: PrecioReferencia | null;
  productor: ProductorPublico;
}

export interface ProductoGestion {
  id: number;
  productorId: number;
  productor: string;
  nombre: string;
  categoriaId: number;
  categoria: string;
  precioReferenciaId: number | null;
  descripcion: string | null;
  imagenUrl: string | null;
  organico: boolean;
  fechaCosecha: string | null;
  vidaUtilDias: number | null;
  calibre: string | null;
  estado: EstadoProducto;
  actualizadoEn: Fecha;
  formatos: Formato[];
  /** RN-A3: avisos cuando una presentación queda por debajo del precio de mercado. */
  alertas: string[];
}

export interface FormatoSolicitud {
  id?: number;
  nombre: string;
  tipo: TipoFormato;
  pesoKg?: number | null;
  precio: number;
  stock: number;
  cantidadMinDescuento?: number | null;
  porcentajeDescuento?: number | null;
}

export interface ProductoSolicitud {
  productorId: number;
  categoriaId: number;
  precioReferenciaId?: number | null;
  nombre: string;
  descripcion?: string;
  imagenUrl?: string;
  organico?: boolean;
  fechaCosecha?: string | null;
  vidaUtilDias?: number | null;
  calibre?: string;
  publicar?: boolean;
  formatos: FormatoSolicitud[];
}

export interface FiltroCatalogo {
  q?: string;
  categoria?: string;
  region?: string;
  atiende?: string;
  organico?: boolean;
  productorId?: number;
  orden?: "precio_asc" | "precio_desc" | "cosecha";
}

// ---------- Pedidos y pagos ----------

export type EstadoPedido =
  | "PENDIENTE_PAGO"
  | "PENDIENTE"
  | "ACEPTADO"
  | "EN_PREPARACION"
  | "LISTO_PARA_ENTREGA"
  | "ENTREGADO"
  | "COMPLETADO"
  | "EN_DISPUTA"
  | "REEMBOLSADO"
  | "RECHAZADO"
  | "CANCELADO";

export type ModalidadEntrega = "RECOJO_EN_CHACRA" | "ENTREGA_DEL_PRODUCTOR" | "AGENCIA_DE_CARGA";
export type CanalOperacion = "WEB" | "SMS" | "SISTEMA";
export type MetodoPago = "YAPE" | "PLIN" | "TARJETA" | "TRANSFERENCIA";
export type EstadoPago = "PENDIENTE" | "RETENIDO" | "LIBERADO" | "DEVUELTO" | "ANULADO";

export type AccionPedido =
  | "PAGAR"
  | "CANCELAR"
  | "CONFIRMAR_RECEPCION"
  | "REPORTAR_PROBLEMA"
  | "CALIFICAR"
  | "ACEPTAR"
  | "RECHAZAR"
  | "EN_PREPARACION"
  | "LISTO_PARA_ENTREGA"
  | "ENTREGADO"
  | "ENVIAR_DESCARGO";

export interface ItemPedido {
  formatoId: number;
  cantidad: number;
}

export interface PedidoSolicitud {
  items: ItemPedido[];
  modalidadEntrega: ModalidadEntrega;
  regionDestino: string;
  direccionEntrega: string;
  nota?: string;
}

export interface LineaPedido {
  formatoId: number;
  productoId: number;
  producto: string;
  formato: string;
  cantidad: number;
  precioUnitario: Dinero;
  porcentajeDescuento: number;
  subtotal: Dinero;
}

/** RN-A5: cuánto llega al agricultor y cuánto es el servicio de la plataforma. */
export interface Desglose {
  subtotal: Dinero;
  descuento: Dinero;
  costoFlete: Dinero;
  comision: Dinero;
  total: Dinero;
  montoProductor: Dinero;
  mensaje: string;
}

export interface Cotizacion {
  productorId: number;
  productor: string;
  emiteFactura: boolean;
  modalidadEntrega: ModalidadEntrega;
  regionDestino: string;
  diasTransito: number;
  fechaEntregaEstimada: string;
  lineas: LineaPedido[];
  desglose: Desglose;
}

export interface Pago {
  estado: EstadoPago;
  monto: Dinero;
  metodo: MetodoPago | null;
  referencia: string | null;
  pagadoEn: Fecha | null;
  liberadoEn: Fecha | null;
  devueltoEn: Fecha | null;
  destino: string | null;
  mensaje: string;
}

export interface Pedido {
  id: number;
  codigo: string;
  estado: EstadoPedido;
  creadoEn: Fecha;
  actualizadoEn: Fecha;
  fechaEntregaEstimada: string | null;
  entregadoEn: Fecha | null;
  modalidadEntrega: ModalidadEntrega;
  regionDestino: string;
  /** null para el agricultor hasta que acepta (RN-24). */
  direccionEntrega: string | null;
  nota: string | null;
  productor: {
    id: number;
    nombreComercial: string;
    region: string;
    emiteFactura: boolean;
    nombreTitular: string | null;
    telefono: string | null;
  };
  comprador: {
    nombre: string;
    razonSocial: string | null;
    verificado: boolean;
    telefono: string | null;
  };
  lineas: LineaPedido[];
  desglose: Desglose;
  historial: {
    estadoAnterior: EstadoPedido | null;
    estadoNuevo: EstadoPedido;
    canal: CanalOperacion;
    usuario: string | null;
    comentario: string | null;
    fecha: Fecha;
  }[];
  pago: Pago | null;
  acciones: AccionPedido[];
}

// ---------- Confianza ----------

export type MotivoDisputa =
  "NO_ENTREGADO" | "CALIDAD" | "CANTIDAD" | "PRODUCTO_DISTINTO" | "DANIO_TRANSPORTE" | "OTRO";
export type EstadoDisputa = "ABIERTA" | "A_FAVOR_COMPRADOR" | "A_FAVOR_PRODUCTOR";
export type NivelReputacion = "NUEVO" | "CONFIABLE" | "REGULAR" | "EN_OBSERVACION";

export interface Resena {
  id: number;
  pedido: string;
  autor: string;
  calificacion: number;
  comentario: string | null;
  creadoEn: Fecha;
}

export interface Reputacion {
  productorId: number;
  promedio: number | null;
  totalResenas: number;
  pedidosCompletados: number;
  pedidosRechazados: number;
  disputasPerdidas: number;
  tasaCumplimiento: number | null;
  nivel: NivelReputacion;
  descripcion: string;
}

export interface Disputa {
  id: number;
  pedidoId: number;
  pedido: string;
  montoEnJuego: Dinero;
  productor: string;
  comprador: string;
  motivo: MotivoDisputa;
  descripcion: string;
  evidenciaUrl: string | null;
  descargo: string | null;
  evidenciaDescargoUrl: string | null;
  descargoEn: Fecha | null;
  estado: EstadoDisputa;
  resolucion: string | null;
  resueltaPor: string | null;
  creadaEn: Fecha;
  resueltaEn: Fecha | null;
}

// ---------- Notificaciones y tiempo real ----------

export type CanalNotificacion = "SMS" | "WHATSAPP" | "WEB";

export interface Notificacion {
  id: number;
  canal: CanalNotificacion;
  destino: string | null;
  mensaje: string;
  enlace: string | null;
  pedidoId: number | null;
  leida: boolean;
  creadaEn: Fecha;
}

export interface Bandeja {
  noLeidas: number;
  notificaciones: Notificacion[];
}

export interface EventoPedido {
  tipo: "PEDIDO";
  pedidoId: number;
  codigo: string;
  anterior: EstadoPedido | null;
  estado: EstadoPedido;
  canal: CanalOperacion;
  productorId: number;
  productor: string;
  comprador: string;
  total: Dinero;
  montoProductor: Dinero;
  fecha: Fecha;
}

export interface EventoStock {
  tipo: "STOCK";
  productoId: number;
  formatos: { formatoId: number; nombre: string; stock: number; disponible: boolean }[];
}

// ---------- Administración ----------

export interface ResumenAdmin {
  usuariosPorRol: Partial<Record<RolApi, number>>;
  pendientesDeVerificacion: { agentes: number; compradores: number; productores: number };
  productores: number;
  productoresVerificados: number;
  productosActivos: number;
  pedidosPorEstado: Partial<Record<EstadoPedido, number>>;
  dinero: {
    transado: Dinero;
    pagadoAgricultores: Dinero;
    comisiones: Dinero;
    retenido: Dinero;
    porcentajeAlAgricultor: number | null;
  };
  disputasAbiertas: number;
  topProductores: {
    productorId: number;
    nombreComercial: string;
    ventas: Dinero;
    pedidos: number;
  }[];
}

export interface AccionAdministrativa {
  id: number;
  administrador: string;
  tipo: string;
  objetivo: string;
  objetivoId: number;
  detalle: string | null;
  fecha: Fecha;
}
