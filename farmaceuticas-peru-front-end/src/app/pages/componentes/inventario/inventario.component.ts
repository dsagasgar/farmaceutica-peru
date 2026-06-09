import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../../models/types';
import { Subject, Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith, map, shareReplay } from 'rxjs/operators';

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

  // NUEVO: Observables para los contadores estadísticos de la cabecera
  totalProductos$!: Observable<number>;
  valorInventario$!: Observable<number>;
  bajoStock$!: Observable<number>;

  ngOnInit(): void {
    // Pipeline asíncrono optimizado con shareReplay para que los contadores no disparen peticiones HTTP extra
    this.productos$ = this.busquedaSubject.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.productoService.buscarProductosParaAlmacen(term)),
      shareReplay(1) 
    );

    // Inicialización de la telemetría estadística del almacén
    this.totalProductos$ = this.productosFiltrados$.pipe(map(list => list.length));
    
    this.valorInventario$ = this.productosFiltrados$.pipe(
      map(list => list.reduce((sum, p) => sum + (p.stock * p.precioUnitario), 0))
    );
    
    this.bajoStock$ = this.productosFiltrados$.pipe(
      map(list => list.filter(p => this.calcularEstado(p) === 'bajo-stock' || this.calcularEstado(p) === 'agotado').length)
    );
  }

  onBusqueda(): void {
    this.busquedaSubject.next(this.busqueda);
  }

  // Getters optimizados que operan sobre los datos reales devueltos por el backend
  get productosFiltrados$(): Observable<Producto[]> {
    return this.productos$.pipe(
      map(productos => productos.filter(p => {
        const coincideBusqueda = p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                                 p.marca.toLowerCase().includes(this.busqueda.toLowerCase());
        const coincideEstado = !this.filtroEstado || this.calcularEstado(p) === this.filtroEstado;
        const coincideCategoria = !this.filtroCategoria || p.categoria === this.filtroCategoria;
        return coincideBusqueda && coincideEstado && coincideCategoria;
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
      this.productoService.actualizarStockVenta(this.productoForm.id, this.productoForm.stockVenta).subscribe({
        next: (prodActualizado) => {
          console.log('Stock de venta actualizado en PostgreSQL:', prodActualizado);
          this.busquedaSubject.next(this.busqueda); 
          this.cerrarModal();
        },
        error: (err) => console.error('Error al guardar en el backend:', err)
      });
    }
  }

  calcularEstado(producto: Producto): string {
    if (!producto.stock || producto.stock === 0) return 'agotado';
    if (producto.stock < 50) return 'bajo-stock'; 
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
      fechaVencimiento: new Date().toISOString().split('T')[0]
    };
  }
}