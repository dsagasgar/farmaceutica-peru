import { Injectable, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Venta } from '../models/types';
import { ProductoService } from './producto.service';

@Injectable({
  providedIn: 'root'
})
export class VentaService {

  private productoService = inject(ProductoService);

  // Datos de demostración para simular órdenes de venta generadas por el QF.
  private ventasDemo: Venta[] = [
    {
      id: 'OV-2024-001',
      fecha: new Date(),
      items: [
        { productoId: 'P001', nombreProducto: 'Paracetamol 500mg', cantidad: 2, precioUnitario: 2.50, subtotal: 5.00 },
        { productoId: 'P006', nombreProducto: 'Vitamina C 1g', cantidad: 10, precioUnitario: 1.50, subtotal: 15.00 },
      ],
      total: 20.00,
      quimicoId: 'QF-01',
      clienteNombre: 'Juan Pérez',
      status: 'PENDIENTE_PAGO'
    },
    {
      id: 'OV-2024-002',
      fecha: new Date(new Date().getTime() - (1000 * 60 * 30)), // Hace 30 mins
      items: [
        { productoId: 'P004', nombreProducto: 'Loratadina 10mg', cantidad: 1, precioUnitario: 5.50, subtotal: 5.50 },
      ],
      total: 5.50,
      quimicoId: 'QF-02',
      clienteNombre: 'Ana Gómez',
      status: 'PENDIENTE_PAGO'
    },
    {
      id: 'OV-2024-003',
      fecha: new Date(new Date().getTime() - (1000 * 60 * 60 * 2)), // Hace 2 horas
      items: [
        { productoId: 'P002', nombreProducto: 'Ibuprofeno 400mg', cantidad: 1, precioUnitario: 3.00, subtotal: 3.00 },
      ],
      total: 3.00,
      quimicoId: 'QF-01',
      clienteNombre: 'Carlos Ruiz',
      status: 'PAGADO',
      cajeroId: 'CJ-01'
    }
  ];

  constructor() { }

  buscarOrdenPorId(id: string): Observable<Venta | undefined> {
    const orden = this.ventasDemo.find(v => v.id.toLowerCase() === id.toLowerCase());
    return of(orden).pipe(delay(500));
  }

  registrarPago(id: string, cajeroId: string): Observable<Venta> {
    const ordenIndex = this.ventasDemo.findIndex(v => v.id.toLowerCase() === id.toLowerCase());

    if (ordenIndex === -1) {
      return throwError(() => new Error('La orden no fue encontrada.'));
    }
    const orden = this.ventasDemo[ordenIndex];
    if (orden.status !== 'PENDIENTE_PAGO') {
      return throwError(() => new Error(`La orden ya se encuentra en estado: ${orden.status}.`));
    }
    orden.status = 'PAGADO';
    orden.cajeroId = cajeroId;

    // Interconexión: Actualizar stock de productos vendidos
    orden.items.forEach(item => {
      this.productoService.actualizarStock(item.productoId, item.cantidad);
    });

    return of(orden).pipe(delay(700));
  }

  crearVenta(nuevaVenta: Omit<Venta, 'id' | 'fecha' | 'status'>): Observable<Venta> {
    const id = `OV-2024-${(this.ventasDemo.length + 1).toString().padStart(3, '0')}`;
    const ventaCompleta: Venta = {
      ...nuevaVenta,
      id,
      fecha: new Date(),
      status: 'PENDIENTE_PAGO'
    };
    this.ventasDemo.unshift(ventaCompleta); // Añadir al principio de la lista
    return of(ventaCompleta).pipe(delay(500));
  }
}