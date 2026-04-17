import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Producto } from '../models/types';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  private productosDemo: Producto[] = [
    { id: 'P001', nombre: 'Paracetamol 500mg', precio: 2.50, stock: 150, categoria: 'Analgésico', marca: 'Genfar', fechaVencimiento: new Date('2025-12-31'), lote: 'LOTE001' },
    { id: 'P002', nombre: 'Ibuprofeno 400mg', precio: 3.00, stock: 80, categoria: 'Antiinflamatorio', marca: 'MK', fechaVencimiento: new Date('2026-06-30'), lote: 'LOTE002' },
    { id: 'P003', nombre: 'Amoxicilina 250mg', precio: 15.00, stock: 45, categoria: 'Antibiótico', marca: 'Bayer', fechaVencimiento: new Date('2025-08-01'), lote: 'LOTE003' },
    { id: 'P004', nombre: 'Loratadina 10mg', precio: 5.50, stock: 120, categoria: 'Antialérgico', marca: 'Clarityne', fechaVencimiento: new Date('2027-01-15'), lote: 'LOTE004' },
    { id: 'P005', nombre: 'Omeprazol 20mg', precio: 8.00, stock: 200, categoria: 'Gastrointestinal', marca: 'Genérico', fechaVencimiento: new Date('2026-10-20'), lote: 'LOTE005' },
    { id: 'P006', nombre: 'Vitamina C 1g', precio: 1.50, stock: 300, categoria: 'Vitaminas', marca: 'Redoxon', fechaVencimiento: new Date('2025-11-30'), lote: 'LOTE006' },
    { id: 'P007', nombre: 'Mascarilla Quirúrgica (Caja x50)', precio: 25.00, stock: 50, categoria: 'Insumos', marca: '3M', fechaVencimiento: new Date('2028-01-01'), lote: 'LOTE007' },
    { id: 'P008', nombre: 'Alcohol en Gel 250ml', precio: 7.00, stock: 90, categoria: 'Insumos', marca: 'Neko', fechaVencimiento: new Date('2026-05-01'), lote: 'LOTE008' }
  ];

  constructor() { }

  /**
   * Obtiene todos los productos.
   * En una app real, esto haría una petición HTTP a una API.
   * Usamos `of()` y `delay()` para simular una llamada asíncrona.
   */
  getProductos(): Observable<Producto[]> {
    return of(this.productosDemo).pipe(delay(500)); // Simula latencia de red
  }

  /**
   * Busca productos cuyo nombre contenga el término de búsqueda.
   * Es insensible a mayúsculas/minúsculas.
   */
  buscarProductos(termino: string): Observable<Producto[]> {
    if (!termino.trim()) {
      // Si no hay término de búsqueda, devuelve todos los productos.
      return this.getProductos();
    }

    const terminoBusqueda = termino.toLowerCase();
    const productosFiltrados = this.productosDemo.filter(p => p.nombre.toLowerCase().includes(terminoBusqueda));
    
    return of(productosFiltrados).pipe(delay(300)); // Simula latencia de búsqueda
  }

  /**
   * Actualiza el stock de un producto.
   * En una app real, esto sería una petición PATCH/PUT a la API.
   * La cantidad puede ser negativa (para ventas) o positiva (para devoluciones/ingresos).
   */
  actualizarStock(productoId: string, cantidadVendida: number): void {
    const producto = this.productosDemo.find(p => p.id === productoId);
    if (producto) {
      producto.stock -= cantidadVendida;
      console.log(`Stock de ${producto.nombre} actualizado a: ${producto.stock}`);
    }
  }
}