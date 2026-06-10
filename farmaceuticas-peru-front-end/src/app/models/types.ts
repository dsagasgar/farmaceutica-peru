export interface PersonaRequest {
  idPersona?: number;
  nombres?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  numDocumento?: string;
  telefono?: string;
  direccion?: string;
  idSexo?: string;
  idTipoDocumento?: number;
  idUbigeo?: string;
}

export interface PersonaResponse {
  idPersona: number;
  nombres: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  numDocumento: string;
  telefono: string;
  direccion: string;
  sexoDescripcion: string;
  tipoDocumentoDescripcion: string;
  ubigeoDescripcion: string;
}

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
  fechaVencimiento: string;
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
  fecha: string;
  items: ItemVenta[];
  itemsFormula: FormulaMagistral[];
  total: number;
  quimicoId: string;
  cajeroId: string;
  clienteNombre: string;
  estado: 'PENDIENTE_PAGO' | 'PAGADO' | 'CANCELADO';
}

export interface ItemCompra {
  id?: number;
  productoId: string;
  nombreProducto: string;
  cantidadPedida: number;
  cantidadRecibida?: number | null;
  costoUnitario: number;
}

// CORREGIDO: Añadimos el campo de observaciones para habilitar la auditoría gerencial
export interface CompraProveedor {
  id: string;
  proveedor: string;
  numeroFactura: string;
  fechaPedido: string;
  items: ItemCompra[];
  total: number;
  estado: string;
  observacionesAlmacen?: string | null; // 👈 CORREGIDO: Alineado con la columna de Spring
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