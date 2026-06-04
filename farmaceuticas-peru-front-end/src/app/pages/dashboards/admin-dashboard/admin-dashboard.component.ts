import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { AdminDashboardService } from '../../../services/admin-dashboard.service';
import { Usuario, AdminStats, ActividadReciente } from '../../../models/types';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true, // RouterModule es necesario para los botones con [routerLink]
  imports: [CommonModule, RouterModule],
<<<<<<< HEAD
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
=======
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
        <!-- ESTADÍSTICAS (Ahora dinámicas con el pipe async) -->
        <ng-container *ngIf="stats$ | async as stats; else loadingStats">
          <section class="stats-section">
            <h2>Estadísticas del Sistema</h2>
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-content">
                  <p class="stat-label">Total Usuarios</p>
                  <p class="stat-value">{{ stats.totalUsuarios }}</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-content">
                  <p class="stat-label">Ingresos de Hoy</p>
                  <p class="stat-value">{{ stats.ingresosHoy | currency:'S/ ' }}</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-content">
                  <p class="stat-label">Total Productos</p>
                  <p class="stat-value">{{ stats.totalProductos }}</p>
                </div>
              </div>

              <div class="stat-card">
                <div class="stat-content">
                  <p class="stat-label">Ventas de Hoy</p>
                  <p class="stat-value">{{ stats.ventasHoy }}</p>
                </div>
              </div>
            </div>
          </section>
        </ng-container>

        <ng-container *ngIf="actividadReciente$ | async as actividades; else loadingActivity">
          <section class="activity-section">
            <h2>Actividad Reciente</h2>
            <div class="activity-list">
              <div *ngFor="let item of actividades" class="activity-item">
                <p class="activity-title">{{ item.descripcion }}</p>
                <p class="activity-time">{{ item.fecha | date:'medium' }}</p>
              </div>
              <div *ngIf="actividades.length === 0" class="no-activity">No hay actividad reciente.</div>
            </div>
          </section>
        </ng-container>

        <!-- TEMPLATES DE CARGA -->
        <ng-template #loadingStats>
          <div class="placeholder">Cargando estadísticas...</div>
        </ng-template>
        <ng-template #loadingActivity>
          <div class="placeholder">Cargando actividad reciente...</div>
        </ng-template>
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

    .placeholder, .no-activity {
      text-align: center; padding: 2rem; border: 2px dashed #e9ecef;
      border-radius: 6px; color: #6c757d; margin-top: 1rem;
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
>>>>>>> 47604d8edd03a1fe6b2f9de2ae829b06998cc97b
})
export class AdminDashboardComponent implements OnInit {
  // Inyección de dependencias moderna con inject()
  private authService = inject(AuthService);
  private router = inject(Router);
  private dashboardService = inject(AdminDashboardService);

  usuario: Usuario | null = null;
  stats$!: Observable<AdminStats>;
  actividadReciente$!: Observable<ActividadReciente[]>;

  constructor() {
    this.usuario = this.authService.obtenerUsuarioActual();
  }

  ngOnInit(): void {
    // Al iniciar, obtenemos los observables de los servicios
    this.stats$ = this.dashboardService.getStats();
    this.actividadReciente$ = this.dashboardService.getActividadReciente();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
