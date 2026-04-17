import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProductoInventario {
  id: string;
  nombre: string;
  marca: string;
  cantidad: number;
  alertaMinima: number;
  precio: number;
  fechaVencimiento: Date;
  lote: string;
  categoria: string;
  estado: 'disponible' | 'bajo-stock' | 'agotado' | 'vencido';
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="inventario-container">
      <div class="header">
        <h1>Gestión de Inventario</h1>
        <button (click)="abrirModalAgregar()" class="btn-nuevo">+ Agregar Producto</button>
      </div>

      <div class="controles">
        <div class="search-group">
          <input type="text" [(ngModel)]="busqueda" placeholder="Buscar producto..."/>
        </div>
        <div class="filter-group">
          <select [(ngModel)]="filtroEstado">
            <option value="">Todos los estados</option>
            <option value="disponible">Disponible</option>
            <option value="bajo-stock">Bajo Stock</option>
            <option value="agotado">Agotado</option>
            <option value="vencido">Vencido</option>
          </select>
          <select [(ngModel)]="filtroCategoria">
            <option value="">Todas las categorías</option>
            <option value="Antibioticos">Antibióticos</option>
            <option value="Anti-inflamatorio">Anti-inflamatorio</option>
            <option value="Vitaminas">Vitaminas</option>
            <option value="Analgesicos">Analgésicos</option>
          </select>
        </div>
        <div class="stats">
          <div class="stat">
            <span class="label">Total Productos:</span>
            <span class="valor">{{ productosFiltrrados.length }}</span>
          </div>
          <div class="stat">
            <span class="label">Valor Inventario:</span>
            <span class="valor">{{ valorTotal.toFixed(2) }}</span>
          </div>
          <div class="stat alert">
            <span class="label">Bajo Stock:</span>
            <span class="valor">{{ productosBajoStock }}</span>
          </div>
        </div>
      </div>

      <div class="tabla-contenedor">
        <table class="tabla-inventario">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Marca</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Mínimo</th>
              <th>Precio</th>
              <th>Vencimiento</th>
              <th>Lote</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let producto of productosFiltrrados" [ngClass]="'estado-' + producto.estado">
              <td class="nombre">{{ producto.nombre }}</td>
              <td>{{ producto.marca }}</td>
              <td>{{ producto.categoria }}</td>
              <td class="cantidad">{{ producto.cantidad }}</td>
              <td>{{ producto.alertaMinima }}</td>
              <td class="precio">{{ producto.precio.toFixed(2) }}</td>
              <td>{{ producto.fechaVencimiento | date:'dd/MM/yyyy' }}</td>
              <td>{{ producto.lote }}</td>
              <td>
                <span [ngClass]="'badge-' + producto.estado">
                  {{ producto.estado | uppercase }}
                </span>
              </td>
              <td class="acciones-cell">
                <button (click)="editarProducto(producto)" class="btn-editar">Editar</button>
                <button (click)="eliminarProducto(producto.id)" class="btn-eliminar">Eliminar</button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="productosFiltrrados.length === 0" class="sin-resultados">
          <p>No hay productos que coincidan con los criterios de búsqueda</p>
        </div>
      </div>

      <!-- Modal para agregar/editar producto -->
      <div *ngIf="mostrarModal" class="modal-overlay" (click)="cerrarModal()">
        <div class="modal-contenido" (click)="$event.stopPropagation()">
          <h2>{{ editando ? 'Editar' : 'Agregar' }} Producto</h2>
          
          <div class="form-group">
            <label>Nombre del Producto</label>
            <input type="text" [(ngModel)]="productoForm.nombre" placeholder="Nombre del producto"/>
          </div>

          <div class="form-group">
            <label>Marca</label>
            <input type="text" [(ngModel)]="productoForm.marca" placeholder="Marca"/>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Categoría</label>
              <select [(ngModel)]="productoForm.categoria">
                <option value="">Seleccionar categoría</option>
                <option value="Antibioticos">Antibióticos</option>
                <option value="Anti-inflamatorio">Anti-inflamatorio</option>
                <option value="Vitaminas">Vitaminas</option>
                <option value="Analgesicos">Analgésicos</option>
              </select>
            </div>
            <div class="form-group">
              <label>Cantidad</label>
              <input type="number" [(ngModel)]="productoForm.cantidad" min="0"/>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Alerta Mínima</label>
              <input type="number" [(ngModel)]="productoForm.alertaMinima" min="0"/>
            </div>
            <div class="form-group">
              <label>Precio</label>
              <input type="number" [(ngModel)]="productoForm.precio" min="0" step="0.01"/>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Fecha de Vencimiento</label>
              <input type="date" [(ngModel)]="productoForm.fechaVencimiento"/>
            </div>
            <div class="form-group">
              <label>Lote</label>
              <input type="text" [(ngModel)]="productoForm.lote" placeholder="Número de lote"/>
            </div>
          </div>

          <div class="modal-acciones">
            <button (click)="cerrarModal()" class="btn-cancelar">Cancelar</button>
            <button (click)="guardarProducto()" class="btn-guardar">Guardar</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inventario-container {
      padding: 2rem;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    h1 {
      margin: 0;
      color: var(--gray-900);
    }

    .btn-nuevo {
      padding: 0.75rem 1.5rem;
      background: var(--red-to-pink-to-purple-horizontal-gradient);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-nuevo:hover {
      opacity: 0.9;
    }

    .controles {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .search-group {
      margin-bottom: 1rem;
    }

    .search-group input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid var(--gray-400);
      border-radius: 6px;
      font-size: 1rem;
    }

    .filter-group {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .filter-group select {
      padding: 0.75rem;
      border: 2px solid var(--gray-400);
      border-radius: 6px;
      font-size: 1rem;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .stat {
      background: var(--gray-400);
      padding: 1rem;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stat.alert {
      background: var(--hot-red);
      color: white;
    }

    .stat .label {
      color: var(--gray-700);
      font-size: 0.9rem;
    }

    .stat.alert .label {
      color: white;
    }

    .stat .valor {
      font-weight: 600;
      font-size: 1.2rem;
      color: var(--bright-blue);
    }

    .stat.alert .valor {
      color: white;
    }

    .tabla-contenedor {
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .tabla-inventario {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9rem;
    }

    .tabla-inventario thead {
      background: var(--gray-900);
      color: white;
    }

    .tabla-inventario th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
    }

    .tabla-inventario td {
      padding: 1rem;
      border-bottom: 1px solid var(--gray-400);
    }

    .tabla-inventario tbody tr.estado-disponible {
      background: #f0fdf4;
    }

    .tabla-inventario tbody tr.estado-bajo-stock {
      background: #fffbeb;
    }

    .tabla-inventario tbody tr.estado-agotado {
      background: #fef2f2;
    }

    .tabla-inventario tbody tr.estado-vencido {
      background: #fee2e2;
    }

    .nombre {
      font-weight: 600;
      color: var(--bright-blue);
    }

    .cantidad {
      font-weight: 600;
    }

    .precio {
      color: var(--bright-blue);
      font-weight: 600;
    }

    .badge-disponible {
      background: #22c55e;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .badge-bajo-stock {
      background: #f59e0b;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .badge-agotado {
      background: #ef4444;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .badge-vencido {
      background: #dc2626;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .acciones-cell {
      display: flex;
      gap: 0.5rem;
    }

    .btn-editar,
    .btn-eliminar {
      padding: 0.4rem 0.8rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .btn-editar {
      background: var(--bright-blue);
      color: white;
    }

    .btn-eliminar {
      background: var(--hot-red);
      color: white;
    }

    .sin-resultados {
      text-align: center;
      padding: 2rem;
      color: var(--gray-700);
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal-contenido {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      max-width: 500px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-contenido h2 {
      margin-top: 0;
      color: var(--gray-900);
    }

    .form-group {
      margin-bottom: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--gray-900);
      font-weight: 600;
      font-size: 0.9rem;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid var(--gray-400);
      border-radius: 6px;
      font-family: inherit;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--bright-blue);
    }

    .modal-acciones {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn-cancelar,
    .btn-guardar {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-cancelar {
      background: var(--gray-400);
      color: var(--gray-900);
    }

    .btn-guardar {
      background: var(--red-to-pink-to-purple-horizontal-gradient);
      color: white;
    }

    @media (max-width: 768px) {
      .tabla-inventario {
        font-size: 0.8rem;
      }

      .tabla-inventario th,
      .tabla-inventario td {
        padding: 0.5rem;
      }

      .acciones-cell {
        flex-direction: column;
      }
    }
  `]
})
export class InventarioComponent {
  productos: ProductoInventario[] = [
    {
      id: '1',
      nombre: 'Paracetamol 500mg',
      marca: 'Tafirol',
      cantidad: 150,
      alertaMinima: 50,
      precio: 2.50,
      fechaVencimiento: new Date('2025-12-31'),
      lote: 'LT001',
      categoria: 'Analgesicos',
      estado: 'disponible'
    },
    {
      id: '2',
      nombre: 'Amoxicilina 500mg',
      marca: 'Amoxicilina',
      cantidad: 30,
      alertaMinima: 50,
      precio: 8.50,
      fechaVencimiento: new Date('2025-06-30'),
      lote: 'LT002',
      categoria: 'Antibioticos',
      estado: 'bajo-stock'
    }
  ];

  busqueda = '';
  filtroEstado = '';
  filtroCategoria = '';
  mostrarModal = false;
  editando = false;
  productoForm: ProductoInventario = this.inicializarFormulario();

  get productosFiltrrados(): ProductoInventario[] {
    return this.productos.filter(p => {
      const coincideBusqueda = p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                             p.marca.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideEstado = !this.filtroEstado || p.estado === this.filtroEstado;
      const coincideCategoria = !this.filtroCategoria || p.categoria === this.filtroCategoria;
      return coincideBusqueda && coincideEstado && coincideCategoria;
    });
  }

  get valorTotal(): number {
    return this.productosFiltrrados.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);
  }

  get productosBajoStock(): number {
    return this.productos.filter(p => p.estado === 'bajo-stock' || p.estado === 'agotado').length;
  }

  abrirModalAgregar(): void {
    this.editando = false;
    this.productoForm = this.inicializarFormulario();
    this.mostrarModal = true;
  }

  editarProducto(producto: ProductoInventario): void {
    this.editando = true;
    this.productoForm = { ...producto };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarProducto(): void {
    if (this.editando) {
      const index = this.productos.findIndex(p => p.id === this.productoForm.id);
      if (index > -1) {
        this.productos[index] = this.productoForm;
      }
    } else {
      this.productoForm.id = Math.random().toString();
      this.productos.push(this.productoForm);
    }
    this.cerrarModal();
  }

  eliminarProducto(id: string): void {
    if (confirm('¿Desea eliminar este producto?')) {
      this.productos = this.productos.filter(p => p.id !== id);
    }
  }

  private inicializarFormulario(): ProductoInventario {
    return {
      id: '',
      nombre: '',
      marca: '',
      cantidad: 0,
      alertaMinima: 0,
      precio: 0,
      fechaVencimiento: new Date(),
      lote: '',
      categoria: '',
      estado: 'disponible'
    };
  }
}
