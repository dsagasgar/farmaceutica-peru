import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../../models/types';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  private productoService = inject(ProductoService);

  // Control de estado reactivo para las consultas al backend
  productos$!: Observable<Producto[]>;
  private busquedaSubject = new Subject<string>();
  
  // Modelos para los filtros de la interfaz
  busqueda = '';
  filtroEstado = '';
  filtroCategoria = '';
  
  // Variables de control del Modal de Almacén
  mostrarModal = false;
  editando = false;
  productoForm: Producto = this.inicializarFormulario();

  ngOnInit(): void {
    // Orquestación del flujo de datos con el pipeline asíncrono de Spring Boot
    this.productos$ = this.busquedaSubject.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.productoService.buscarProductosParaAlmacen(term))
    );
  }

  onBusqueda(): void {
    this.busquedaSubject.next(this.busqueda);
  }

  // Getters optimizados que operan sobre los datos reales devueltos por el backend
  get productosFiltrados$(): Observable<Producto[]> {
    return this.productos$.pipe(
      map(productos => productos.filter(p => {
        // Adaptado a las propiedades reales del modelo: nombre, marca, stock
        const coincideEstado = !this.filtroEstado || this.calcularEstado(p) === this.filtroEstado;
        const coincideCategoria = !this.filtroCategoria || p.categoria === this.filtroCategoria;
        return coincideEstado && coincideCategoria;
      }))
    );
  }

  abrirModalAgregar(): void {
    this.editando = false;
    this.productoForm = this.inicializarFormulario();
    this.mostrarModal = true;
  }

  editarProducto(producto: Producto): void {
    this.editando = true;
    this.productoForm = { ...producto };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarProducto(): void {
    if (this.editando && this.productoForm.id) {
      // Llama a tu endpoint real de actualización mapeando el stock de venta asignado
      this.productoService.actualizarStockVenta(this.productoForm.id, this.productoForm.stockVenta).subscribe({
        next: (prodActualizado) => {
          console.log('Stock de venta actualizado en PostgreSQL:', prodActualizado);
          this.busquedaSubject.next(this.busqueda); // Refresca la lista
          this.cerrarModal();
        },
        error: (err) => console.error('Error al guardar en el backend:', err)
      });
    }
  }

  // Helper necesario para calcular dinámicamente el estado visual en la vista del Almacenero
  calcularEstado(producto: Producto): string {
    if (!producto.stock || producto.stock === 0) return 'agotado';
    if (producto.stock < 50) return 'bajo-stock'; // Umbral de alerta mínima
    return 'disponible';
  }

  private inicializarFormulario(): Producto {
    return {
      id: '',
      codigo: '',
      nombre: '',
      descripcion: '',
      marca: '',
      categoria: '',
      formato: '',
      lote: '',
      precioUnitario: 0,
      stock: 0,
      stockVenta: 0,
      fechaVencimiento: new Date().toISOString().split('T')[0] // Formato YYYY-MM-DD para inputs de tipo date
    };
  }
}