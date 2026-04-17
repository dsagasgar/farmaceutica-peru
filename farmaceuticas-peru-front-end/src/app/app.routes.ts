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
    data: { role: 'administrador' }
  },
  {
    path: 'dashboard/quimico',
    component: QuimicoDashboardComponent,
    canActivate: [authGuard],
    data: { role: 'quimico' }
  },
  {
    path: 'dashboard/cajero',
    component: CajeroDashboardComponent,
    canActivate: [authGuard],
    data: { role: 'cajero' }
  },
  {
    path: 'dashboard/almacen',
    component: AlmacenDashboardComponent,
    canActivate: [authGuard],
    data: { role: 'almacen' }
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
