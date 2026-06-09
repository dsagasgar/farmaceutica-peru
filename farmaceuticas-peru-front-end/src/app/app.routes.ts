import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { AdminDashboardComponent } from './pages/dashboards/admin-dashboard/admin-dashboard.component';
import { QuimicoDashboardComponent } from './pages/dashboards/quimico-dashboard/quimico-dashboard.component';
import { CajeroDashboardComponent } from './pages/dashboards/cajero-dashboard/cajero-dashboard.component';
import { AlmacenDashboardComponent } from './pages/dashboards/almacen-dashboard/almacen-dashboard.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'dashboard/administrador',
    component: AdminDashboardComponent,
    canActivate: [authGuard],
    // CORREGIDO: Migración a arreglo estructurado de accesos (multi-role arrays)
    data: { roles: ['ADMINISTRADOR'] }
  },
  {
    path: 'dashboard/quimico',
    component: QuimicoDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['QUIMICO_FARMACEUTICO', 'ADMINISTRADOR'] } // Permite auditoría de fórmulas
  },
  {
    path: 'dashboard/cajero',
    component: CajeroDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['CAJERO', 'ADMINISTRADOR'] } // CORREGIDO: El administrador puede ingresar a supervisar cajas
  },
  {
    path: 'dashboard/almacen',
    component: AlmacenDashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['ALMACENERO', 'ADMINISTRADOR'] } // CORREGIDO: El administrador puede ingresar a ver stock e inventario
  },
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];