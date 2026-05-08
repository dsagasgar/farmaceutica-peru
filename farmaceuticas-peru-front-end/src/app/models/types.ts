/**
 * Interfaces para los modelos de datos de la aplicación.
 */

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: 'ADMINISTRADOR' | 'CAJERO' | 'ALMACENERO' | 'QUIMICO_FARMACEUTICO';
  password?: string; // Se usa solo en login, luego se descarta
}

export interface Producto {
  id: string; // Mantenido como identificador único
  codigo?: string; // Nuevo: Código de barras o SKU
  nombre: string;
  descripcion: string;
  precioUnitario: number;
  stock: number; // Cantidad total en almacén
  stockVenta: number; // Cantidad disponible para la venta al público
  categoria: string;
  marca: string;
  fechaVencimiento: Date;
  lote: string;
  formato?: string; // Nuevo: Ej. "Caja x 20 tabletas"
}

export interface Venta {
  id: string;
  fecha: Date;
  items: {
    productoId: string;
    nombreProducto: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
  }[];
  itemsFormula?: FormulaMagistral[]; // Nuevo: Para fórmulas magistrales
  total: number;
  quimicoId: string; // ID del QF que generó la orden
  cajeroId?: string; // ID del cajero que procesó el pago
  clienteNombre?: string; // Nombre del cliente para la boleta/factura
  estado: 'PENDIENTE_PAGO' | 'PAGADO' | 'ENVIADO' | 'ENTREGADO';
}

export interface FormulaMagistral {
  id: string;
  nombre: string; // Ej: "Crema de hidrocortisona al 1%"
  composicion: string; // Detalle de componentes y cantidades
  procedimiento: string; // Pasos de elaboración
  precio: number;
}

export interface ItemCompra {
  productoId: string;
  nombreProducto: string;
  cantidadPedida: number;
  cantidadRecibida?: number;
  costoUnitario: number;
}

export interface CompraProveedor {
  id: string; // e.g., 'COMPRA-2024-001'
  proveedor: string;
  numeroFactura: string;
  fechaPedido: Date;
  fechaRecepcion?: Date;
  items: ItemCompra[];
  total: number;
  estado: 'PENDIENTE_RECEPCION' | 'EN_VERIFICACION' | 'RECIBIDO_CON_OBSERVACIONES' | 'RECIBIDO_OK' | 'PAGADO' | 'CANCELADO';
  observacionesAlmacen?: string;
}

export interface Informe {
  id: string;
  tipo: 'RECEPCION' | 'INVENTARIO' | 'DISCREPANCIAS';
  fechaGeneracion: Date;
  generadoPorId: string; // ID del usuario que lo generó (almacenero, admin)
  datos: any; // Contenido flexible según el tipo de informe
}

export interface EstadoAutenticacion {
  estaAutenticado: boolean;
  usuarioActual: Usuario | null;
  token?: string; // Para capas más avanzadas
}

export interface AdminStats {
  usuariosActivos: number;
  ventasHoy: number;
  productosTotales: number;
  ordenesCompletadas: number;
}

export interface ActividadReciente {
  id: string;
  titulo: string;
  tiempo: string; // Ej: "Hace 15 minutos"
  tipo: 'INFORME' | 'USUARIO' | 'COMPRA';
}
