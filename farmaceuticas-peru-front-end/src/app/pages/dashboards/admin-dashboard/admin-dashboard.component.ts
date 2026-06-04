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
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
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
