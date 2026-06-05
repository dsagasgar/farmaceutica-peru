import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CompraService } from '../../../services/compra.service';
import { Usuario, CompraProveedor, ItemCompra, Producto } from '../../../models/types';
import { Observable } from 'rxjs';
import { ProductoService } from '../../../services/producto.service';

/**
 * Gestiona el panel del Almacenero.
 * Su principal responsabilidad es la HU1: verificar la recepción de compras de proveedores.
 */
@Component({
  selector: 'app-almacen-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- 1. ESTRUCTURA HTML: Define la vista del componente -->
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Panel de Almacén</h1>
          <div class="user-info">
            <span class="user-name">{{ usuario?.nombre }}</span>
            <span class="user-role">{{ usuario?.rol | uppercase }}</span>
            <button (click)="logout()" class="logout-btn">Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <!-- HU1: Recepción de Compras -->
        <section class="dashboard-section">
          <h2 class="section-title">Recepción de Compras de Proveedores</h2>
          <p class="section-description">
            {{ compraSeleccionada ? 'Verifique las cantidades recibidas contra las pedidas y anote cualquier observación.' : 'Seleccione una orden de compra para verificar los productos recibidos.' }}
          </p>
          
          <div class="section-content">
            <!-- Estructura condicional: Muestra la lista de compras o el detalle de una seleccionada -->
            <div *ngIf="!compraSeleccionada; else detalleCompra" class="animate-fade-in">
              <div *ngIf="compras$ | async as compras; else loading">
                <!-- Itera sobre las compras pendientes para mostrarlas como tarjetas -->
                <div *ngIf="compras.length > 0; else noCompras" class="compras-list">
                  <div *ngFor="let compra of compras" class="compra-card">
                    <div class="compra-card-header">
                      <h3>{{ compra.proveedor }}</h3>
                      <span>Factura: {{ compra.numeroFactura }}</span>
                    </div>
                    <div class="compra-card-body">
                      <p><strong>ID Compra:</strong> {{ compra.id }}</p>
                      <p><strong>Fecha Pedido:</strong> {{ compra.fechaPedido | date:'dd/MM/yyyy' }}</p>
                      <p><strong>Items a verificar:</strong> {{ compra.items.length }}</p>
                    </div>
                    <div class="compra-card-footer">
                      <!-- (click): Llama a la función 'seleccionarCompra' al hacer clic -->
                      <button (click)="seleccionarCompra(compra)">Verificar Recepción</button>
                    </div>
                  </div>
                </div>
                <ng-template #noCompras>
                  <div class="placeholder">No hay compras pendientes de recepción.</div>
                </ng-template>
              </div>
              <ng-template #loading>
                <div class="placeholder">Cargando compras pendientes...</div>
              </ng-template>
            </div>

            <!-- #detalleCompra: Template que se muestra cuando 'compraSeleccionada' tiene un valor -->
            <ng-template #detalleCompra>
              <div class="animate-fade-in">
                <button (click)="volverALista()" class="back-btn">&larr; Volver a la lista</button>
                <h4>Verificando Compra: {{ compraSeleccionada!.id }}</h4>
                <!-- (ngSubmit): Llama a 'enviarVerificacion' al enviar el formulario -->
                <form (ngSubmit)="enviarVerificacion()">
                  <div class="table-wrapper">
                    <table class="items-table">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad Pedida</th>
                          <th>Cantidad Recibida</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr *ngFor="let item of itemsVerificacion; let i = index">
                          <td>{{ item.nombreProducto }}</td>
                          <td>{{ item.cantidadPedida }}</td>
                          <td>
                            <!-- [(ngModel)]: Vinculación de datos bidireccional. El input y la propiedad del componente están sincronizados. -->
                            <input type="number" min="0" [(ngModel)]="item.cantidadRecibida" [name]="'cantidad-' + i" required>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div class="observaciones-section">
                    <label for="observaciones">Observaciones (ej: cajas dañadas, productos faltantes, etc.)</label>
                    <textarea id="observaciones" rows="4" [(ngModel)]="observaciones" name="observaciones"></textarea>
                  </div>
                  <div *ngIf="errorVerificacion" class="error-msg">{{ errorVerificacion }}</div>
                  <!-- [disabled]: Deshabilita el botón si la propiedad 'procesando' es verdadera -->
                  <button type="submit" class="submit-btn" [disabled]="procesando">
                    {{ procesando ? 'Enviando...' : 'Confirmar Recepción y Enviar a Administrador' }}
                  </button>
                </form>
              </div>
            </ng-template>
          </div>
        </section>

        <!-- NUEVA SECCIÓN: Gestión de Stock para Venta -->
        <section class="dashboard-section">
          <h2 class="section-title">Gestión de Stock para Venta</h2>
          <p class="section-description">
            Ajuste la cantidad de productos disponibles para la venta al público. El stock de venta no puede superar el stock total en almacén.
          </p>
          <div class="section-content">
            <div class="table-wrapper">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock Total</th>
                    <th>Stock para Venta</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <ng-container *ngIf="productosGestion$ | async as productos; else loadingStock">
                    <tr *ngFor="let producto of productos">
                      <td>{{ producto.nombre }} ({{ producto.codigo }})</td>
                      <td class="text-center">{{ producto.stock }}</td>
                      <td class="text-center">
                        <input 
                          type="number" 
                          min="0"
                          [max]="producto.stock"
                          [(ngModel)]="producto.stockVenta"
                          [name]="'stockVenta-' + producto.id"
                          class="stock-input"
                        >
                      </td>
                      <td class="text-center">
                        <button (click)="actualizarStockVenta(producto)" class="action-btn-small">Actualizar</button>
                      </td>
                    </tr>
                  </ng-container>
                </tbody>
                <ng-template #loadingStock><tr><td colspan="4" class="placeholder">Cargando productos...</td></tr></ng-template>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  // 2. ESTILOS CSS: Estilos encapsulados que solo aplican a este componente.
  styles: [`
    :host { display: block; background-color: #f0f2f5; min-height: 100dvh; }
    .dashboard-container { display: flex; flex-direction: column; }
    .dashboard-header { background: white; padding: 1rem 2rem; border-bottom: 1px solid #dee2e6; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .header-content { display: flex; justify-content: space-between; align-items: center; max-width: 1400px; margin: 0 auto; }
    h1 { margin: 0; font-size: 1.5rem; color: #343a40; font-weight: 600; }
    .user-info { display: flex; align-items: center; gap: 1rem; }
    .user-name { font-weight: 600; color: #495057; }
    .user-role { background: #e9ecef; color: #495057; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 500; }
    .logout-btn { background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background-color 0.2s; }
    .logout-btn:hover { background: #c82333; }
    .dashboard-main { padding: 2rem; max-width: 1400px; margin: 0 auto; width: 100%; }
    .dashboard-section { background: white; border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .section-title { font-size: 1.25rem; color: #343a40; margin: 0 0 0.5rem 0; font-weight: 600; }
    .section-description { font-size: 0.95rem; color: #6c757d; margin-bottom: 1.5rem; }
    .placeholder { text-align: center; padding: 2rem; border: 2px dashed #e9ecef; border-radius: 6px; color: #6c757d; }
    .action-btn:disabled { background-color: #6c757d; cursor: not-allowed; }
    .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .compras-list { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; }
    .compra-card { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 6px; display: flex; flex-direction: column; }
    .compra-card-header { padding: 1rem; border-bottom: 1px solid #dee2e6; }
    .compra-card-header h3 { margin: 0; font-size: 1.1rem; }
    .compra-card-header span { font-size: 0.9rem; color: #6c757d; }
    .compra-card-body { padding: 1rem; flex-grow: 1; }
    .compra-card-body p { margin: 0 0 0.5rem 0; }
    .compra-card-footer { padding: 1rem; border-top: 1px solid #dee2e6; }
    .compra-card-footer button { background-color: #0056b3; color: white; border: none; padding: 0.6rem 1rem; border-radius: 6px; cursor: pointer; width: 100%; }
    .back-btn { background: none; border: none; color: #0056b3; cursor: pointer; font-size: 1rem; margin-bottom: 1rem; }
    .table-wrapper { overflow-x: auto; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
    .items-table th, .items-table td { padding: 0.75rem; border: 1px solid #dee2e6; text-align: center; }
    .items-table thead th { background-color: #e9ecef; font-weight: 600; }
    .items-table td:first-child { text-align: left; }
    .text-center { text-align: center; }
    .items-table input { width: 80px; padding: 0.5rem; text-align: center; border: 1px solid #ced4da; border-radius: 4px; }
    .observaciones-section { margin-bottom: 1.5rem; }
    .observaciones-section label { display: block; margin-bottom: 0.5rem; font-weight: 600; }
    .observaciones-section textarea { width: 100%; padding: 0.75rem; border: 1px solid #ced4da; border-radius: 6px; font-family: inherit; }
    .submit-btn { background-color: #28a745; color: white; border: none; padding: 0.8rem 1.5rem; font-size: 1rem; font-weight: 600; border-radius: 6px; cursor: pointer; }
    .submit-btn:disabled { background-color: #6c757d; }
    .error-msg { color: #721c24; margin-bottom: 1rem; }
    .stock-input { width: 100px; }
    .action-btn-small {
      background-color: #17a2b8; color: white; border: none;
      padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer;
    }
  `]
})
// 3. LÓGICA TYPESCRIPT: Define el comportamiento del componente.
export class AlmacenDashboardComponent implements OnInit {
  // Inyección de dependencias: Angular nos provee las instancias de los servicios que necesitamos.
  private authService = inject(AuthService);
  private compraService = inject(CompraService);
  private router = inject(Router);
  private productoService = inject(ProductoService);

  // --- PROPIEDADES DE ESTADO ---
  usuario: Usuario | null = null;
  // Observable que contiene la lista de compras pendientes a recibir. El pipe `async` en el HTML se suscribe a él.
  compras$!: Observable<CompraProveedor[]>;
  // Observable para la lista de productos en la sección de gestión de stock.
  productosGestion$!: Observable<Producto[]>;
  // Almacena la compra que el usuario está verificando actualmente. Controla qué vista se muestra.
  compraSeleccionada: CompraProveedor | null = null;
  // Copia de los items de la compra seleccionada para poder editarlos en el formulario sin afectar el original.
  itemsVerificacion: ItemCompra[] = [];
  observaciones: string = '';
  procesando: boolean = false;
  errorVerificacion: string = '';

  // El constructor se usa para inicializar el componente y sus dependencias.
  constructor() {
    this.usuario = this.authService.obtenerUsuarioActual();
  }

  // ngOnInit: Gancho del ciclo de vida. Se ejecuta una vez que el componente se ha inicializado. Ideal para cargar datos iniciales.
  ngOnInit(): void {
    this.compras$ = this.compraService.getComprasParaRecepcion();
    this.productosGestion$ = this.productoService.buscarProductosParaAlmacen(''); // Carga todos los productos para la gestión
  }

  // --- MÉTODOS DE FLUJO DE TRABAJO ---

  /** Se activa al hacer clic en "Verificar". Cambia la vista a detalle y prepara el formulario. */
  seleccionarCompra(compra: CompraProveedor): void {
    this.compraSeleccionada = compra;
    // Clonamos los items de forma segura para no modificar el objeto original en la lista mientras editamos.
    this.itemsVerificacion = compra.items.map(item => ({ ...item }));
    // Pre-llenar la cantidad recibida con la cantidad pedida para facilitar la tarea
    this.itemsVerificacion.forEach(item => {
      item.cantidadRecibida = item.cantidadRecibida ?? item.cantidadPedida;
    });
  }

  /** Resetea la vista para mostrar nuevamente la lista de compras. */
  volverALista(): void {
    this.compraSeleccionada = null;
    this.itemsVerificacion = [];
    this.observaciones = '';
    this.errorVerificacion = '';
  }

  /** Envía los datos del formulario al servicio para registrar la recepción y actualiza la vista. */
  enviarVerificacion(): void {
    if (!this.compraSeleccionada) return;
    this.procesando = true;
    this.errorVerificacion = '';

    this.compraService.registrarRecepcion(this.compraSeleccionada.id, this.itemsVerificacion, this.observaciones)
      .subscribe({
        next: () => {
          this.procesando = false;
          this.volverALista();
          this.compras$ = this.compraService.getComprasParaRecepcion(); // Recarga la lista de compras pendientes.
          // Aquí se podría mostrar un mensaje de éxito
        },
        error: (err) => {
          this.errorVerificacion = err.message || 'Ocurrió un error al enviar la verificación.';
          this.procesando = false;
        }
      });
  }

  /** Actualiza la cantidad de stock disponible para la venta de un producto. */
  actualizarStockVenta(producto: Producto): void {
    // Aquí podrías añadir una lógica de feedback visual (ej. un spinner en el botón)
    this.productoService.actualizarStockVenta(producto.id, producto.stockVenta).subscribe({
      next: (productoActualizado) => {
        console.log('Stock de venta actualizado', productoActualizado);
        // Opcional: mostrar un toast/mensaje de éxito.
        // Para refrescar la lista, podrías re-llamar al servicio, o si el backend devuelve
        // el objeto actualizado, simplemente actualizarlo en la lista local.
      },
      error: (err) => console.error('Error al actualizar stock de venta', err)
    });
  }

  /** Cierra la sesión del usuario y lo redirige a la página de login. */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}