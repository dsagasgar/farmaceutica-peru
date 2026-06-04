import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../../models/types';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-catalogo-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
<<<<<<< HEAD
  templateUrl: './catalogo-productos.component.html',
  styleUrl: './catalogo-productos.component.css'
=======
  template: `
    <div class="catalogo-container">
      <div class="search-bar">
        <input 
          type="text" 
          placeholder="Buscar producto por nombre..."
          [(ngModel)]="terminoBusquedaModel"
          (ngModelChange)="onBusqueda()"
        />
      </div>

      <div class="table-wrapper">
        <table class="product-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Precio Unit.</th>
              <th>Stock Disponible</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngIf="productos$ | async as productos; else loading">
              <tr *ngFor="let producto of productos">
                <td>{{ producto.nombre }}</td>
                <td>{{ producto.categoria }}</td>
                <td>{{ producto.marca }}</td>
                <td>{{ producto.precioUnitario | currency:'S/ ' }}</td>
                <td>{{ producto.stockVenta }}</td>
              </tr>
              <tr *ngIf="productos.length === 0">
                <td colspan="5" class="no-results">No se encontraron productos.</td>
              </tr>
            </ng-container>
          </tbody>
        </table>
        <ng-template #loading>
          <tbody>
            <tr>
              <td colspan="5" class="loading-state">Cargando productos...</td>
            </tr>
          </tbody>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .catalogo-container { padding: 1rem; background-color: #f8f9fa; border-radius: 6px; }
    .search-bar { margin-bottom: 1rem; }
    .search-bar input {
      width: 100%;
      padding: 0.75rem;
      font-size: 1rem;
      border: 1px solid #ced4da;
      border-radius: 6px;
    }
    .table-wrapper { overflow-x: auto; }
    .product-table {
      width: 100%;
      border-collapse: collapse;
      background-color: white;
    }
    .product-table th, .product-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #dee2e6;
      text-align: left;
      vertical-align: middle;
    }
    .product-table thead th {
      background-color: #e9ecef;
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
    }
    .no-results, .loading-state { text-align: center; padding: 2rem; color: #6c757d; }
  `]
>>>>>>> 47604d8edd03a1fe6b2f9de2ae829b06998cc97b
})
export class CatalogoProductosComponent implements OnInit {
  private productoService = inject(ProductoService);
  
  productos$!: Observable<Producto[]>;
  private busquedaSubject = new Subject<string>();
  terminoBusquedaModel: string = '';

  ngOnInit(): void {
    this.productos$ = this.busquedaSubject.pipe(
      startWith(''), // Realiza una búsqueda inicial con un string vacío para cargar todo.
      // Espera 300ms después de la última pulsación antes de actuar
      debounceTime(300),
      // Ignora si el nuevo término es igual al anterior
      distinctUntilChanged(),
      // Cambia a la nueva búsqueda y cancela la anterior
      switchMap((term: string) => this.productoService.buscarProductosParaVenta(term)),
    );
  }

  onBusqueda(): void {
    // Cada vez que el modelo cambia, emitimos el nuevo valor al subject.
    this.busquedaSubject.next(this.terminoBusquedaModel);
  }
}