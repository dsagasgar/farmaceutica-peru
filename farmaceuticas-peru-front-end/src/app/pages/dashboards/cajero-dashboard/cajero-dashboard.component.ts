import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { VentaService } from '../../../services/venta.service';
import { Usuario, Venta } from '../../../models/types';

@Component({
  selector: 'app-cajero-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Panel del Cajero</h1>
          <div class="user-info">
            <span class="user-name">{{ usuario?.nombre }}</span>
            <span class="user-role">{{ usuario?.rol | uppercase }}</span>
            <button (click)="logout()" class="logout-btn">Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <!-- HU1: Registrar Orden de Venta -->
        <section class="dashboard-section">
          <h2 class="section-title">Registrar Pago de Orden</h2>
          <p class="section-description">
            Busque una orden de venta por su ID para registrar el pago y emitir el comprobante.
          </p>
          <div class="section-content">
            <div class="orden-venta-container">
              <!-- Paso 1: Buscador de Orden -->
              <div class="buscador-orden">
                <label for="ordenId">ID de la Orden de Venta:</label>
                <div class="input-group">
                  <input 
                    type="text" 
                    id="ordenId" 
                    [(ngModel)]="ordenIdBusqueda"
                    placeholder="Ej: OV-2024-001"
                    (keyup.enter)="buscarOrden()"
                    [disabled]="buscando"
                  >
                  <button (click)="buscarOrden()" [disabled]="buscando || !ordenIdBusqueda">
                    {{ buscando ? 'Buscando...' : 'Buscar' }}
                  </button>
                </div>
                <div *ngIf="errorBusqueda" class="error-msg">{{ errorBusqueda }}</div>
              </div>

              <!-- Paso 2: Detalles de la Orden y Pago -->
              <div *ngIf="ordenSeleccionada" class="detalle-orden animate-fade-in">
                <h3>Detalles de la Orden: {{ ordenSeleccionada.id }}</h3>
                <div class="info-cliente">
                  <span><strong>Cliente:</strong> {{ ordenSeleccionada.clienteNombre || 'N/A' }}</span>
                  <span><strong>Fecha:</strong> {{ ordenSeleccionada.fecha | date:'dd/MM/yyyy HH:mm' }}</span>
                </div>
                <table class="items-table">
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>P. Unit.</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of ordenSeleccionada.items">
                      <td>{{ item.nombreProducto }}</td>
                      <td>{{ item.cantidad }}</td>
                      <td>{{ item.precioUnitario | currency:'S/ ' }}</td>
                      <td>{{ item.subtotal | currency:'S/ ' }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="3">Total a Pagar</td>
                      <td>{{ ordenSeleccionada.total | currency:'S/ ' }}</td>
                    </tr>
                  </tfoot>
                </table>
                
                <div *ngIf="ordenSeleccionada.estado === 'PENDIENTE_PAGO'" class="acciones-pago">
                  <button class="pagar-btn" (click)="registrarPago()" [disabled]="procesandoPago">
                    {{ procesandoPago ? 'Procesando...' : 'Registrar Pago y Emitir Comprobante' }}
                  </button>
                </div>
                
                <div *ngIf="ordenSeleccionada.estado === 'PAGADO'" class="pago-confirmado">
                  <p>✅ Pago registrado exitosamente por el usuario {{ usuario?.nombre }}.</p>
                  <button class="imprimir-btn">Imprimir Boleta</button>
                  <button class="imprimir-btn">Imprimir Factura</button>
                </div>

                 <div *ngIf="errorPago" class="error-msg">{{ errorPago }}</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
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
    .action-btn { background-color: #0056b3; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
    .action-btn:disabled { background-color: #6c757d; cursor: not-allowed; }
    .error-msg { color: #721c24; margin-top: 0.5rem; font-size: 0.9rem; }
    .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
    .orden-venta-container { display: flex; flex-direction: column; gap: 2rem; }
    .buscador-orden label { font-weight: 600; color: #495057; margin-bottom: 0.5rem; display: block; }
    .input-group { display: flex; gap: 0.5rem; }
    .input-group input { flex-grow: 1; padding: 0.6rem; border: 1px solid #ced4da; border-radius: 6px; font-size: 1rem; }
    .input-group button { background-color: #0056b3; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
    .input-group button:disabled { background-color: #6c757d; cursor: not-allowed; }
    .detalle-orden { border-top: 1px solid #e9ecef; padding-top: 1.5rem; }
    .detalle-orden h3 { margin: 0 0 1rem 0; }
    .info-cliente { display: flex; gap: 2rem; margin-bottom: 1rem; color: #6c757d; }
    .items-table { width: 100%; border-collapse: collapse; margin-bottom: 1.5rem; }
    .items-table th, .items-table td { padding: 0.75rem; border-bottom: 1px solid #dee2e6; text-align: left; }
    .items-table thead th { background-color: #f8f9fa; font-weight: 600; }
    .items-table tfoot { font-weight: bold; color: #343a40; }
    .items-table tfoot td { border-bottom: none; }
    .items-table tfoot td:first-child { text-align: right; }
    .acciones-pago { margin-top: 1rem; }
    .pagar-btn { background-color: #28a745; color: white; width: 100%; padding: 0.8rem; font-size: 1.1rem; font-weight: 600; border: none; border-radius: 6px; cursor: pointer; }
    .pagar-btn:disabled { background-color: #6c757d; }
    .pago-confirmado { margin-top: 1rem; background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; padding: 1rem; border-radius: 6px; text-align: center; }
    .pago-confirmado p { margin: 0 0 1rem 0; font-weight: 600; }
    .imprimir-btn { background-color: #17a2b8; color: white; border: none; padding: 0.6rem 1rem; border-radius: 6px; cursor: pointer; margin: 0 0.5rem; }
  `]
})
export class CajeroDashboardComponent {
  private authService = inject(AuthService);
  private ventaService = inject(VentaService);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  usuario: Usuario | null = null;
  ordenIdBusqueda: string = '';
  buscando: boolean = false;
  errorBusqueda: string = '';
  ordenSeleccionada: Venta | null = null;
  procesandoPago: boolean = false;
  errorPago: string = '';

  constructor() {
    this.usuario = this.authService.obtenerUsuarioActual();
  }

  buscarOrden(): void {
    if (!this.ordenIdBusqueda) return;
    this.buscando = true;
    this.errorBusqueda = '';
    this.ordenSeleccionada = null;
    this.errorPago = '';
    this.ventaService.buscarOrdenPorId(this.ordenIdBusqueda).subscribe({
      next: (orden) => {
        if (orden) {
          this.ordenSeleccionada = orden;
        } else {
          this.errorBusqueda = `No se encontró ninguna orden con el ID "${this.ordenIdBusqueda}".`;
        }
        this.buscando = false;
      },
      error: (err) => {
        this.errorBusqueda = 'Ocurrió un error al buscar la orden.';
        console.error(err);
        this.buscando = false;
      }
    });
  }

  registrarPago(): void {
    if (!this.ordenSeleccionada || !this.usuario) return;
    this.procesandoPago = true;
    this.errorPago = '';
    this.ventaService.registrarPago(this.ordenSeleccionada.id, this.usuario.id).subscribe({
      next: (ordenActualizada) => {
        this.ordenSeleccionada = ordenActualizada;
        this.procesandoPago = false;
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.errorPago = err.message || 'Ocurrió un error al registrar el pago.';
        console.error(err);
        this.procesandoPago = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}