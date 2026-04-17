import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { CompraProveedor, ItemCompra } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class CompraService {

  private comprasDemo: CompraProveedor[] = [
    {
      id: 'COMPRA-2024-001',
      proveedor: 'FARMA-DISTRIBUCIONES S.A.C.',
      numeroFactura: 'F001-12345',
      fechaPedido: new Date('2024-04-10'),
      items: [
        { productoId: 'P001', nombreProducto: 'Paracetamol 500mg', cantidadPedida: 200, costoUnitario: 1.80 },
        { productoId: 'P002', nombreProducto: 'Ibuprofeno 400mg', cantidadPedida: 150, costoUnitario: 2.20 },
      ],
      total: 690.00,
      status: 'PENDIENTE_RECEPCION'
    },
    {
      id: 'COMPRA-2024-002',
      proveedor: 'LABORATORIOS QUIM-PERU',
      numeroFactura: 'F002-0890',
      fechaPedido: new Date('2024-04-12'),
      items: [
        { productoId: 'P005', nombreProducto: 'Omeprazol 20mg', cantidadPedida: 300, costoUnitario: 6.50 },
        { productoId: 'P007', nombreProducto: 'Mascarilla Quirúrgica (Caja x50)', cantidadPedida: 100, costoUnitario: 18.00 },
      ],
      total: 3750.00,
      status: 'PENDIENTE_RECEPCION'
    },
    {
      id: 'COMPRA-2024-003',
      proveedor: 'FARMA-DISTRIBUCIONES S.A.C.',
      numeroFactura: 'F001-12400',
      fechaPedido: new Date('2024-04-05'),
      items: [
        { productoId: 'P004', nombreProducto: 'Loratadina 10mg', cantidadPedida: 100, costoUnitario: 4.00 },
      ],
      total: 400.00,
      status: 'PAGADO', // Esta compra no debe aparecer en la lista del almacenero
      fechaRecepcion: new Date('2024-04-08')
    }
  ];

  constructor() { }

  getComprasParaRecepcion(): Observable<CompraProveedor[]> {
    const compras = this.comprasDemo.filter(c => c.status === 'PENDIENTE_RECEPCION');
    return of(compras).pipe(delay(500));
  }

  registrarRecepcion(compraId: string, itemsRecibidos: ItemCompra[], observaciones: string): Observable<CompraProveedor> {
    const compraIndex = this.comprasDemo.findIndex(c => c.id === compraId);
    if (compraIndex === -1) {
      return throwError(() => new Error('Compra no encontrada'));
    }

    const compra = this.comprasDemo[compraIndex];
    compra.items = itemsRecibidos;
    compra.observacionesAlmacen = observaciones;
    compra.fechaRecepcion = new Date();
    compra.status = observaciones.trim().length > 0 || itemsRecibidos.some(i => i.cantidadRecibida !== i.cantidadPedida) ? 'CON_OBSERVACIONES' : 'EN_VERIFICACION';

    return of(compra).pipe(delay(800));
  }
}