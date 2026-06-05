import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Usuario, Venta } from '../../../models/types';
import { CatalogoProductosComponent } from '../../componentes/catalogo-productos/catalogo-productos.component';
import { NuevoPedidoComponent } from '../../componentes/nuevo-pedido/nuevo-pedido.component';

@Component({
  selector: 'app-quimico-dashboard',
  standalone: true,
  imports: [CommonModule, CatalogoProductosComponent, NuevoPedidoComponent, FormsModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <h1>Panel del Químico Farmacéutico</h1>
          <div class="user-info">
            <span class="user-name">{{ usuario?.nombre }}</span>
            <span class="user-role">{{ usuario?.rol | uppercase }}</span>
            <button (click)="logout()" class="logout-btn">Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <section class="dashboard-section">
          <h2 class="section-title">Consulta de Productos</h2>
          <p class="section-description">
            Busque productos en el inventario para ver detalles, stock y precios.
          </p>
          <div class="section-content">
            <app-catalogo-productos></app-catalogo-productos>
          </div>
        </section>

        <section class="dashboard-section">
          <h2 class="section-title">Nuevo Pedido</h2>
          <p class="section-description">
            Tome nota de los productos para un cliente y genere una orden de venta.
          </p>
          <div class="section-content">
            <div *ngIf="!mostrandoFormularioPedido">
              <button class="action-btn" (click)="iniciarNuevoPedido()">Iniciar Nuevo Pedido</button>
              
              <div *ngIf="ordenGenerada" class="orden-generada-info animate-fade-in">
                <p><strong>¡Orden generada con éxito!</strong></p>
                <p>Entregue el siguiente ID al cliente para que realice el pago en caja:</p>
                <div class="orden-id">{{ ordenGenerada.id }}</div>
              </div>
            </div>

            <app-nuevo-pedido 
              *ngIf="mostrandoFormularioPedido"
              (pedidoGenerado)="onPedidoGenerado($event)"
              (cancelar)="onCancelarPedido()">
            </app-nuevo-pedido>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background-color: #f0f2f5;
      min-height: 100dvh;
    }
    .dashboard-container {
      display: flex;
      flex-direction: column;
    }
    .dashboard-header {
      background: white;
      padding: 1rem 2rem;
      border-bottom: 1px solid #dee2e6;
      box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    }
    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1400px;
      margin: 0 auto;
    }
    h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #343a40;
      font-weight: 600;
    }
    .user-info { display: flex; align-items: center; gap: 1rem; }
    .user-name { font-weight: 600; color: #495057; }
    .user-role { background: #e9ecef; color: #495057; padding: 0.25rem 0.75rem; border-radius: 1rem; font-size: 0.8rem; font-weight: 500; }
    .logout-btn { background: #dc3545; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-weight: 500; transition: background-color 0.2s; }
    .logout-btn:hover { background: #c82333; }
    .dashboard-main { padding: 2rem; max-width: 1400px; margin: 0 auto; width: 100%; }
    .dashboard-section {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }
    .section-title { font-size: 1.25rem; color: #343a40; margin: 0 0 0.5rem 0; font-weight: 600; }
    .section-description { font-size: 0.95rem; color: #6c757d; margin-bottom: 1.5rem; }
    .placeholder { text-align: center; padding: 2rem; border: 2px dashed #e9ecef; border-radius: 6px; color: #6c757d; }
    .action-btn { background-color: #0056b3; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 6px; cursor: pointer; font-weight: 500; }
    .orden-generada-info { margin-top: 1.5rem; padding: 1rem; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 6px; text-align: center; }
    .orden-id { background: #28a745; color: white; padding: 0.5rem 1rem; border-radius: 4px; display: inline-block; font-size: 1.2rem; font-weight: bold; margin-top: 0.5rem; }
    .animate-fade-in { animation: fadeIn 0.5s ease-in-out; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .action-btn:disabled { background-color: #6c757d; cursor: not-allowed; }
  `]
})
export class QuimicoDashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  usuario: Usuario | null = null;
  mostrandoFormularioPedido = false;
  ordenGenerada: Venta | null = null;

  constructor() {
    this.usuario = this.authService.obtenerUsuarioActual();
  }

  iniciarNuevoPedido(): void {
    this.mostrandoFormularioPedido = true;
    this.ordenGenerada = null;
  }

  onPedidoGenerado(venta: Venta): void {
    this.ordenGenerada = venta;
    this.mostrandoFormularioPedido = false;
  }

  onCancelarPedido(): void {
    this.mostrandoFormularioPedido = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}