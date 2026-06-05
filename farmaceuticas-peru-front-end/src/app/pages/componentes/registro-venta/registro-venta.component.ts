import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ItemOrden {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

@Component({
  selector: 'app-register-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="register-venta-container">
      <div class="header">
        <h1>Registrar Orden de Venta</h1>
        <div class="ticket-info">
          <span>Ticket #: {{ ticketNumber }}</span>
          <span>Fecha: {{ currentDate }}</span>
        </div>
      </div>

      <div class="content-grid">
        <div class="section cliente-section">
          <h2>Datos del Cliente</h2>
          <div class="form-group">
            <label>Nombre del Cliente</label>
            <input type="text" [(ngModel)]="cliente.nombre" placeholder="Ingrese nombre del cliente"/>
          </div>
          <div class="form-group">
            <label>Cédula/RUC</label>
            <input type="text" [(ngModel)]="cliente.cedula" placeholder="Ingrese cédula o RUC"/>
          </div>
          <div class="form-group">
            <label>Teléfono</label>
            <input type="text" [(ngModel)]="cliente.telefono" placeholder="Ingrese teléfono"/>
          </div>
        </div>

        <div class="section productos-section">
          <h2>Productos/Medicamentos</h2>
          <div class="add-producto">
            <input type="text" placeholder="Buscar producto..." [(ngModel)]="busquedaProducto" class="search-input"/>
            <select [(ngModel)]="selectedProducto" class="select-producto">
              <option value="">Seleccionar producto</option>
              <option *ngFor="let p of productos" [value]="p.id">{{ p.nombre }} - {{ p.precio }}</option>
            </select>
            <input type="number" [(ngModel)]="cantidadProducto" placeholder="Cantidad" min="1" class="cantidad-input"/>
            <button (click)="agregarProducto()" class="btn-agregar">Agregar</button>
          </div>

          <div class="items-list" *ngIf="items.length > 0">
            <div class="item-header">
              <span>Producto</span>
              <span>Cantidad</span>
              <span>Precio</span>
              <span>Subtotal</span>
              <span>Acción</span>
            </div>
            <div *ngFor="let item of items; let i = index" class="item-row">
              <span>{{ item.nombre }}</span>
              <span>{{ item.cantidad }}</span>
              <span>{{ item.precio.toFixed(2) }}</span>
              <span class="subtotal">{{ item.subtotal.toFixed(2) }}</span>
              <button (click)="eliminarItem(i)" class="btn-eliminar">Eliminar</button>
            </div>
          </div>

          <div *ngIf="items.length === 0" class="no-items">
            <p>No hay productos agregados</p>
          </div>
        </div>
      </div>

      <div class="resumen-section">
        <h2>Resumen de la Orden</h2>
        <div class="resumen-grid">
          <div class="resumen-item">
            <span class="label">Cantidad de Productos:</span>
            <span class="valor">{{ cantidadTotal }}</span>
          </div>
          <div class="resumen-item">
            <span class="label">Subtotal:</span>
            <span class="valor">{{ subtotal.toFixed(2) }}</span>
          </div>
          <div class="resumen-item">
            <span class="label">Impuesto ({{ impuestoPorcentaje }}%):</span>
            <span class="valor">{{ impuesto.toFixed(2) }}</span>
          </div>
          <div class="resumen-item total">
            <span class="label">Total:</span>
            <span class="valor">{{ total.toFixed(2) }}</span>
          </div>
        </div>

        <div class="notas">
          <label>Notas/Observaciones:</label>
          <textarea [(ngModel)]="notas" placeholder="Agregar notas o instrucciones especiales..."></textarea>
        </div>

        <div class="acciones">
          <button (click)="limpiarFormulario()" class="btn-limpiar">Limpiar Formulario</button>
          <button (click)="emitirTicket()" [disabled]="items.length === 0" class="btn-emitir">Emitir Ticket</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .register-venta-container {
      padding: 2rem;
      background: #f5f5f5;
      min-height: 100vh;
    }

    .header {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    h1 {
      margin: 0;
      color: var(--gray-900);
      font-size: 1.8rem;
    }

    .ticket-info {
      display: flex;
      gap: 2rem;
      font-size: 0.9rem;
      color: var(--gray-700);
    }

    .content-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .section h2 {
      margin: 0 0 1.5rem 0;
      color: var(--gray-900);
      font-size: 1.2rem;
      border-bottom: 2px solid var(--gray-400);
      padding-bottom: 0.75rem;
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--gray-900);
      font-weight: 600;
      font-size: 0.9rem;
    }

    input[type="text"],
    input[type="number"],
    select,
    textarea {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid var(--gray-400);
      border-radius: 6px;
      font-family: inherit;
      font-size: 1rem;
      box-sizing: border-box;
    }

    input:focus,
    select:focus,
    textarea:focus {
      outline: none;
      border-color: var(--bright-blue);
    }

    .add-producto {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .search-input {
      grid-column: 1 / -1;
    }

    .cantidad-input {
      grid-column: 2 / 3;
      width: 100%;
    }

    .btn-agregar {
      grid-column: 1 / -1;
      padding: 0.75rem;
      background: var(--red-to-pink-to-purple-horizontal-gradient);
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
    }

    .btn-agregar:hover {
      opacity: 0.9;
    }

    .items-list {
      margin-top: 1rem;
    }

    .item-header {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr 0.8fr;
      gap: 0.5rem;
      font-weight: 600;
      color: var(--gray-900);
      padding: 0.75rem;
      background: var(--gray-400);
      border-radius: 6px;
      margin-bottom: 0.5rem;
      font-size: 0.85rem;
    }

    .item-row {
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr 1fr 0.8fr;
      gap: 0.5rem;
      padding: 0.75rem;
      background: var(--gray-400);
      border-radius: 6px;
      margin-bottom: 0.5rem;
      align-items: center;
      font-size: 0.9rem;
    }

    .subtotal {
      font-weight: 600;
      color: var(--bright-blue);
    }

    .btn-eliminar {
      padding: 0.4rem 0.6rem;
      background: var(--hot-red);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.8rem;
    }

    .no-items {
      text-align: center;
      padding: 1.5rem;
      background: var(--gray-400);
      border-radius: 6px;
      color: var(--gray-700);
    }

    .resumen-section {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .resumen-section h2 {
      margin: 0 0 1.5rem 0;
      color: var(--gray-900);
      font-size: 1.2rem;
    }

    .resumen-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .resumen-item {
      background: var(--gray-400);
      padding: 1rem;
      border-radius: 6px;
      display: flex;
      justify-content: space-between;
    }

    .resumen-item.total {
      grid-column: 1 / -1;
      background: var(--red-to-pink-to-purple-horizontal-gradient);
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .label {
      color: var(--gray-700);
    }

    .resumen-item.total .label {
      color: white;
    }

    .valor {
      font-weight: 600;
      color: var(--bright-blue);
    }

    .resumen-item.total .valor {
      color: white;
    }

    .notas {
      margin-bottom: 1.5rem;
    }

    textarea {
      resize: vertical;
      min-height: 80px;
    }

    .acciones {
      display: flex;
      gap: 1rem;
    }

    .btn-limpiar,
    .btn-emitir {
      flex: 1;
      padding: 0.75rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 1rem;
    }

    .btn-limpiar {
      background: var(--gray-400);
      color: var(--gray-900);
    }

    .btn-limpiar:hover:not(:disabled) {
      opacity: 0.8;
    }

    .btn-emitir {
      background: var(--red-to-pink-to-purple-horizontal-gradient);
      color: white;
    }

    .btn-emitir:hover:not(:disabled) {
      opacity: 0.9;
    }

    .btn-emitir:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .content-grid {
        grid-template-columns: 1fr;
      }

      .add-producto {
        grid-template-columns: 1fr;
      }

      .acciones {
        flex-direction: column;
      }
    }
  `]
})
export class RegisterVentaComponent {
  ticketNumber = Math.random().toString().substring(7, 12).toUpperCase();
  currentDate = new Date().toLocaleDateString();

  cliente = {
    nombre: '',
    cedula: '',
    telefono: ''
  };

  productos = [
    { id: '1', nombre: 'Paracetamol 500mg', precio: 2.50 },
    { id: '2', nombre: 'Amoxicilina 500mg', precio: 8.50 },
    { id: '3', nombre: 'Vitamin C 1000mg', precio: 4.20 },
    { id: '4', nombre: 'Ibuprofeno 400mg', precio: 3.75 }
  ];

  items: ItemOrden[] = [];
  busquedaProducto = '';
  selectedProducto = '';
  cantidadProducto = 1;
  notas = '';
  impuestoPorcentaje = 15;

  get cantidadTotal(): number {
    return this.items.reduce((sum, item) => sum + item.cantidad, 0);
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get impuesto(): number {
    return this.subtotal * (this.impuestoPorcentaje / 100);
  }

  get total(): number {
    return this.subtotal + this.impuesto;
  }

  agregarProducto(): void {
    if (!this.selectedProducto || this.cantidadProducto <= 0) return;

    const producto = this.productos.find(p => p.id === this.selectedProducto);
    if (!producto) return;

    const item: ItemOrden = {
      id: producto.id,
      nombre: producto.nombre,
      cantidad: this.cantidadProducto,
      precio: producto.precio,
      subtotal: producto.precio * this.cantidadProducto
    };

    this.items.push(item);
    this.selectedProducto = '';
    this.cantidadProducto = 1;
  }

  eliminarItem(index: number): void {
    this.items.splice(index, 1);
  }

  limpiarFormulario(): void {
    this.cliente = { nombre: '', cedula: '', telefono: '' };
    this.items = [];
    this.notas = '';
    this.selectedProducto = '';
    this.cantidadProducto = 1;
  }

  emitirTicket(): void {
    if (this.items.length === 0) return;

    alert(`Ticket #${this.ticketNumber} emitido para ${this.cliente.nombre}\nTotal: $${this.total.toFixed(2)}`);
    this.limpiarFormulario();
  }
}
