/**
 * Interfaces para los modelos de datos de la aplicación.
 */

export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: 'administrador' | 'cajero' | 'almacen' | 'quimico';
  password?: string; // Se usa solo en login, luego se descarta
}

export interface Producto {
  id: string;
  nombre: string;
  precio: number;
  stock: number;
  categoria: string;
  marca: string;
  fechaVencimiento: Date;
  lote: string;
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
  total: number;
  quimicoId: string; // ID del QF que generó la orden
  cajeroId?: string; // ID del cajero que procesó el pago
  clienteNombre?: string; // Nombre del cliente para la boleta/factura
  status: 'PENDIENTE_PAGO' | 'PAGADO' | 'ENVIADO' | 'ENTREGADO';
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
  status: 'PENDIENTE_RECEPCION' | 'EN_VERIFICACION' | 'CON_OBSERVACIONES' | 'PAGADO' | 'CANCELADO';
  observacionesAlmacen?: string;
}

export interface EstadoAutenticacion {
  estaAutenticado: boolean;
  usuarioActual: Usuario | null;
  token?: string; // Para capas más avanzadas
}
