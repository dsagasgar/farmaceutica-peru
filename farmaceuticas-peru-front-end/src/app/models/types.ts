export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: 'ADMINISTRADOR' | 'QUIMICO_FARMACEUTICO' | 'ALMACENERO' | 'CAJERO';
}

export interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  precioUnitario: number;
  stock: number;
  stockVenta: number;
  categoria: string;
  marca: string;
  fechaVencimiento: string; // ISO Date string
  lote: string;
  formato: string;
}

export interface ItemVenta {
  id: number;
  productoId: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface FormulaMagistral {
  id: string;
  nombre: string;
  composicion: string;
  procedimiento: string;
  precio: number;
}

export interface Venta {
  id: string;
  fecha: string; // ISO Date string
  items: ItemVenta[];
  itemsFormula: FormulaMagistral[];
  total: number;
  quimicoId: string;
  cajeroId: string;
  clienteNombre: string;
  estado: 'PENDIENTE_PAGO' | 'PAGADO' | 'CANCELADO';
}

export interface CompraProveedor {
  id: string;
  proveedor: string;
  numeroFactura: string;
  fechaPedido: string; // ISO Date string
  fechaRecepcion?: string; // ISO Date string
  items: ItemCompra[];
  total: number;
  estado: 'PENDIENTE_RECEPCION' | 'RECIBIDO_PARCIAL' | 'RECIBIDO_COMPLETO' | 'PAGADO';
  observacionesAlmacen?: string;
}

export interface ItemCompra {
  id: number;
  productoId: string;
  nombreProducto: string;
  cantidadPedida: number;
  cantidadRecibida?: number;
  costoUnitario: number;
}

export interface AdminStats {
  totalUsuarios: number;
  totalProductos: number;
  ventasHoy: number;
  ingresosHoy: number;
}

export interface ActividadReciente {
  tipo: string;
  descripcion: string;
  fecha: string; // ISO DateTime string
  usuario: string;
}