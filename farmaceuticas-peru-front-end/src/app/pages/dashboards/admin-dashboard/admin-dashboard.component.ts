import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Usuario } from '../../../models/types';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard-container">
      <!-- ENCABEZADO -->
      <header class="dashboard-header">
        <div class="header-top">
          <h1>Panel de Administrador</h1>
          <div class="user-info">
            <span class="user-name">{{ usuario?.nombre }}</span>
            <span class="user-role">{{ usuario?.rol | uppercase }}</span>
            <button (click)="logout()" class="logout-btn">Cerrar Sesión</button>
          </div>
        </div>
      </header>

      <!-- CONTENIDO PRINCIPAL -->
      <main class="dashboard-main">
        <!-- ESTADÍSTICAS -->
        <section class="stats-section">
          <h2>Estadísticas del Sistema</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-content">
                <p class="stat-label">Usuarios Activos</p>
                <p class="stat-value">24</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-content">
                <p class="stat-label">Ventas Hoy</p>
                <p class="stat-value">$2,450</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-content">
                <p class="stat-label">Productos</p>
                <p class="stat-value">156</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-content">
                <p class="stat-label">Órdenes Completadas</p>
                <p class="stat-value">342</p>
              </div>
            </div>
          </div>
        </section>

        <!-- OPCIONES DE ADMINISTRACIÓN -->
        <section class="options-section">
          <h2>Gestión del Sistema</h2>
          <div class="options-grid">
            <!-- Opción para HU1, HU2, HU3 -->
            <div class="option-card">
              <h3>Gestión de Compras</h3>
              <p>Registrar facturas, enviar a almacén y gestionar pagos a proveedores.</p>
              <button (click)="navigate('/admin/compras')" class="option-btn">
                Gestionar
              </button>
            </div>

            <!-- Opción para HU4 -->
            <div class="option-card">
              <h3>Reportes de Áreas</h3>
              <p>Monitorear la operación con informes de ventas, inventario y más.</p>
              <button (click)="navigate('/admin/reportes')" class="option-btn">
                Ver Reportes
              </button>
            </div>

            <div class="option-card">
              <h3>Gestionar Usuarios</h3>
              <p>Crear, editar y eliminar cuentas de los empleados del sistema.</p>
              <button (click)="navigate('/admin/usuarios')" class="option-btn">
                Gestionar
              </button>
            </div>

            <div class="option-card">
              <h3>Configuración</h3>
              <p>Ajustar parámetros generales del sistema y la empresa.</p>
              <button (click)="navigate('/admin/configuracion')" class="option-btn">
                Configurar
              </button>
            </div>
          </div>
        </section>

        <section class="activity-section">
          <h2>Actividad Reciente</h2>
          <div class="activity-list">
            <div class="activity-item">
              <p class="activity-title">Informe de observaciones recibido para la compra 'COMPRA-2024-001' (Almacén)</p>
              <p class="activity-time">Hace 15 minutos</p>
            </div>

            <div class="activity-item">
              <p class="activity-title">Informe de ventas diario disponible (Caja)</p>
              <p class="activity-time">Hace 1 hora</p>
            </div>

            <div class="activity-item">
              <p class="activity-title">Nuevo usuario creado: 'Ana Almacén'</p>
              <p class="activity-time">Hace 3 horas</p>
            </div>

            <div class="activity-item">
              <p class="activity-title">Compra a proveedor 'PROVEEDOR-X' registrada</p>
              <p class="activity-time">Hace 5 horas</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      min-height: 100dvh;
      background-color: #f0f2f5;
    }

    .dashboard-header {
      background: white;
      border-bottom: 1px solid #dee2e6;
      padding: 1rem 2rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    h1 {
      margin: 0;
      font-size: 1.5rem;
      color: #343a40;
      font-weight: 600;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-name {
      font-weight: 600;
      color: #495057;
    }

    .user-role {
      background: #e9ecef;
      color: #495057;
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .logout-btn {
      background: #dc3545;
      color: white;
      border: none;
      padding: 0.6rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.3s ease;
    }

    .logout-btn:hover {
      background: #c82333;
    }

    .dashboard-main {
      flex: 1;
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      width: 100%;
    }

    section {
      background: white;
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.02);
    }

    h2 {
      font-size: 1.25rem; color: #343a40; margin: 0 0 1.5rem 0; font-weight: 600;
    }

    /* ESTADÍSTICAS */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
      border: 1px solid #dee2e6;
      background-color: #f8f9fa;
      transition: border-color 0.2s ease;
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      margin: 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    .stat-value {
      margin: 0.3rem 0 0 0;
      color: #0056b3;
      font-size: 2rem;
      font-weight: 700;
    }

    /* OPCIONES */
    .options-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.5rem;
    }

    .option-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      border: 1px solid #dee2e6;
      transition: box-shadow 0.2s ease, border-color 0.2s ease;
    }

    .option-card:hover {
      border-color: #0056b3;
      box-shadow: 0 4px 8px rgba(0,0,0,0.05);
    }

    .option-card h3 {
      margin: 0 0 0.5rem 0;
      color: #343a40;
      font-size: 1.1rem;
    }

    .option-card p {
      margin: 0 0 1.5rem 0;
      color: #6c757d;
      font-size: 0.9rem;
      flex-grow: 1;
    }

    .option-btn {
      background-color: #0056b3;
      color: white;
      border: none;
      padding: 0.7rem 1.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: background-color 0.2s ease;
    }

    .option-btn:hover {
      background-color: #004494;
    }

    /* ACTIVIDAD */
    .activity-item {
      padding: 1rem 0;
      border-bottom: 1px solid #e9ecef;
    }

    .activity-item:last-child {
      border-bottom: none;
    }

    .activity-title {
      margin: 0;
      color: #495057;
      font-weight: 600;
    }

    .activity-time {
      margin: 0.3rem 0 0 0;
      color: #6c757d;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .header-top {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      h1 {
        font-size: 1.5rem;
      }

      .user-info {
        flex-direction: column;
        gap: 0.75rem;
      }

      .stats-grid,
      .options-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent {
  /**
   * OBTENER USUARIO ACTUAL
   * (El usuario que está actualmente logueado)
   */
  usuario: Usuario | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.usuario = this.authService.obtenerUsuarioActual();
  }

  /**
   * CERRAR SESIÓN
   * Limpia el estado de autenticación y vuelve al login
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  /**
   * NAVEGAR
   * Helper para ir a otras páginas
   */
  navigate(path: string): void {
    this.router.navigate([path]);
  }
}
