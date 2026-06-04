import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { VentaService } from '../../../services/venta.service';
import { AuthService } from '../../../services/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Producto, Venta, Usuario, FormulaMagistral } from '../../../models/types';

@Component({
  selector: 'app-nuevo-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
<<<<<<< HEAD
  templateUrl: './nuevo-pedido.component.html',
  styleUrl: './nuevo-pedido.component.css'
=======
  template: `
    <div class="nuevo-pedido-container animate-fade-in">
      <h4>Nuevo Pedido</h4>
      
      <!-- Buscador de Productos -->
      <div class="form-group">
        <label for="producto-search">Buscar y Agregar Producto:</label>
        <input 
          type="text" 
          id="producto-search"
          placeholder="Escriba el nombre del producto..."
          [(ngModel)]="terminoBusquedaProducto"
          (keyup)="buscarProducto()"
        >
        <div *ngIf="productosFiltrados.length > 0" class="search-results">
          <div *ngFor="let p of productosFiltrados" (click)="agregarProducto(p)" class="result-item">
            {{ p.nombre }} - <strong>Stock: {{ p.stock }}</strong>
          </div>
        </div>
      </div>

      <!-- Items del Pedido -->
      <div *ngIf="pedidoActual.length > 0" class="pedido-items">
        <h5>Productos en el pedido:</h5>
        <div *ngFor="let item of pedidoActual" class="pedido-item">
          <span>{{ item.producto.nombre }}</span>
          <div class="item-controls">
            <input type="number" [min]="1" [max]="item.producto.stock" [value]="item.cantidad" (change)="actualizarCantidad(item.producto.id, $event)">
            <span>x {{ item.producto.precioUnitario | currency:'S/ ' }} = {{ (item.producto.precioUnitario * item.cantidad) | currency:'S/ ' }}</span>
            <button (click)="eliminarProducto(item.producto.id)" class="delete-btn">&times;</button>
          </div>
        </div>
        <div class="total-pedido">
          <strong>Total: {{ totalPedido | currency:'S/ ' }}</strong>
        </div>
      </div>

      <!-- Sección para Fórmulas Magistrales -->
      <div class="formula-section">
        <h5>Añadir Fórmula Magistral (Opcional)</h5>
        <div class="form-group">
          <input type="text" [(ngModel)]="formulaActual.nombre" placeholder="Nombre de la fórmula">
        </div>
        <div class="form-group">
          <textarea [(ngModel)]="formulaActual.composicion" placeholder="Composición..."></textarea>
        </div>
        <div class="form-group">
          <textarea [(ngModel)]="formulaActual.procedimiento" placeholder="Procedimiento..."></textarea>
        </div>
        <div class="form-group formula-price">
          <label for="formula-precio">Precio:</label>
          <input type="number" id="formula-precio" [(ngModel)]="formulaActual.precio" placeholder="0.00">
          <button type="button" (click)="agregarFormula()" [disabled]="!formulaActual.nombre || formulaActual.precio <= 0" class="add-formula-btn">Añadir Fórmula</button>
        </div>
      </div>

      <!-- Fórmulas en el Pedido -->
      <div *ngIf="formulasEnPedido.length > 0" class="pedido-items">
        <h5>Fórmulas en el pedido:</h5>
        <div *ngFor="let formula of formulasEnPedido" class="pedido-item">
          <span>{{ formula.nombre }}</span>
          <div class="item-controls">
            <span>{{ formula.precio | currency:'S/ ' }}</span>
            <button (click)="eliminarFormula(formula.id)" class="delete-btn">&times;</button>
          </div>
        </div>
      </div>


      <!-- Datos del Cliente y Acciones -->
      <div *ngIf="pedidoActual.length > 0" class="form-group">
        <label for="cliente-nombre">Nombre del Cliente:</label>
        <input type="text" id="cliente-nombre" [(ngModel)]="clienteNombre" placeholder="Nombre para la boleta/factura">
      </div>

      <div class="acciones">
        <button (click)="cancelar.emit()" class="cancel-btn">Cancelar</button>
        <button 
          (click)="generarOrden()" 
          class="submit-btn" 
          [disabled]="procesandoPedido || (pedidoActual.length === 0 && formulasEnPedido.length === 0) || !clienteNombre.trim()">
          {{ procesandoPedido ? 'Generando...' : 'Generar Orden de Venta' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .nuevo-pedido-container { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; }
    h4 { margin: 0 0 1.5rem 0; font-weight: 600; }
    .form-group { margin-bottom: 1.5rem; position: relative; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 600; color: #495057; }
    input { width: 100%; padding: 0.75rem; border: 1px solid #ced4da; border-radius: 6px; }
    .search-results { position: absolute; background: white; width: 100%; border: 1px solid #dee2e6; border-top: none; border-radius: 0 0 6px 6px; z-index: 10; }
    .result-item { padding: 0.75rem; cursor: pointer; }
    .result-item:hover { background: #e9ecef; }
    .pedido-items { margin-bottom: 1.5rem; }
    .pedido-item { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #e9ecef; }
    .item-controls { display: flex; align-items: center; gap: 1rem; }
    .item-controls input { width: 60px; text-align: center; }
    .delete-btn { background: #dc3545; color: white; border: none; border-radius: 50%; width: 24px; height: 24px; cursor: pointer; font-weight: bold; }
    .total-pedido { text-align: right; margin-top: 1rem; font-size: 1.2rem; }
    .acciones { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
    .cancel-btn { background: #6c757d; color: white; }
    .submit-btn { background: #28a745; color: white; }
    .acciones button { border: none; padding: 0.7rem 1.2rem; border-radius: 6px; font-weight: 600; cursor: pointer; }
    .acciones button:disabled { background: #adb5bd; }
    .formula-section { border-top: 2px solid #0056b3; margin-top: 2rem; padding-top: 1.5rem; }
    .formula-section h5 { margin-bottom: 1rem; }
    .formula-price { display: flex; align-items: center; gap: 1rem; }
    .add-formula-btn { background-color: #0056b3; color: white; border: none; padding: 0.75rem; border-radius: 6px; cursor: pointer; }
    .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  `]
>>>>>>> 47604d8edd03a1fe6b2f9de2ae829b06998cc97b
})
export class NuevoPedidoComponent implements OnInit {
  @Output() pedidoGenerado = new EventEmitter<Venta>();
  @Output() cancelar = new EventEmitter<void>();

  private productoService = inject(ProductoService);
  private ventaService = inject(VentaService);
  private authService = inject(AuthService);

  private searchTerms = new Subject<string>();
  usuario: Usuario | null = null;
  productosDisponibles: Producto[] = [];
  terminoBusquedaProducto = '';
  productosFiltrados: Producto[] = [];
  pedidoActual: { producto: Producto, cantidad: number }[] = [];
  formulasEnPedido: FormulaMagistral[] = [];
  formulaActual: { nombre: string, composicion: string, procedimiento: string, precio: number } = { nombre: '', composicion: '', procedimiento: '', precio: 0 };
  clienteNombre = '';
  totalPedido = 0;
  procesandoPedido = false;

  ngOnInit(): void {
    this.usuario = this.authService.obtenerUsuarioActual();
    
    // Configura la búsqueda reactiva con debounce
    this.searchTerms.pipe(
      debounceTime(300), // Espera 300ms después de la última pulsación
      distinctUntilChanged(), // Ignora si el término de búsqueda es el mismo
      // Cambia a una nueva búsqueda cada vez que el término cambia
      switchMap((term: string) => this.productoService.buscarProductosParaVenta(term)),
    ).subscribe((productos: Producto[]) => {
      this.productosFiltrados = productos;
    });
  }

  buscarProducto(): void {
    this.searchTerms.next(this.terminoBusquedaProducto);
  }

  agregarProducto(producto: Producto): void {
    const itemExistente = this.pedidoActual.find(item => item.producto.id === producto.id);
    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock) itemExistente.cantidad++;
    } else {
      this.pedidoActual.push({ producto, cantidad: 1 });
    }
    this.terminoBusquedaProducto = '';
    this.productosFiltrados = [];
    this.calcularTotal();
  }

  actualizarCantidad(productoId: string, event: Event): void {
    const nuevaCantidad = parseInt((event.target as HTMLInputElement).value, 10);
    const item = this.pedidoActual.find(i => i.producto.id === productoId);
    if (item && nuevaCantidad > 0 && nuevaCantidad <= item.producto.stock) {
      item.cantidad = nuevaCantidad;
      this.calcularTotal();
    } else if (item) {
      (event.target as HTMLInputElement).value = item.cantidad.toString();
    }
  }

  eliminarProducto(productoId: string): void {
    this.pedidoActual = this.pedidoActual.filter(item => item.producto.id !== productoId);
    this.calcularTotal();
  }

  agregarFormula(): void {
    if (!this.formulaActual.nombre || !this.formulaActual.composicion || this.formulaActual.precio <= 0) {
      // Podrías mostrar un error al usuario
      return;
    }
    const nuevaFormula: FormulaMagistral = {
      id: `temp-${Date.now()}`, // ID temporal para el frontend
      ...this.formulaActual
    };
    this.formulasEnPedido.push(nuevaFormula);
    // Resetear el formulario de la fórmula
    this.formulaActual = { nombre: '', composicion: '', procedimiento: '', precio: 0 };
    this.calcularTotal();
  }

  eliminarFormula(formulaId: string): void {
    this.formulasEnPedido = this.formulasEnPedido.filter(f => f.id !== formulaId);
    this.calcularTotal();
  }

  calcularTotal(): void {
    const totalProductos = this.pedidoActual.reduce((total, item) => total + (item.producto.precioUnitario * item.cantidad), 0);
    const totalFormulas = this.formulasEnPedido.reduce((total, formula) => total + formula.precio, 0);
    this.totalPedido = totalProductos + totalFormulas;
  }

  generarOrden(): void {
    if ((this.pedidoActual.length === 0 && this.formulasEnPedido.length === 0) || !this.clienteNombre.trim() || !this.usuario) {
      return;
    }
    
    this.procesandoPedido = true;
    const nuevaVenta = {
      clienteNombre: this.clienteNombre,
      quimicoId: this.usuario.id,
      items: this.pedidoActual.map(item => ({
        productoId: item.producto.id,
        nombreProducto: item.producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precioUnitario,
        subtotal: item.producto.precioUnitario * item.cantidad
      })),
      itemsFormula: this.formulasEnPedido,
      total: this.totalPedido,
      // Se añade el estado inicial para que el objeto cumpla con la interfaz Venta
      estado: 'PENDIENTE_PAGO'
    };

    this.ventaService.crearVenta(nuevaVenta as any).subscribe((ventaGenerada: Venta) => {
      this.procesandoPedido = false;
      this.pedidoGenerado.emit(ventaGenerada);
    });
  }
}