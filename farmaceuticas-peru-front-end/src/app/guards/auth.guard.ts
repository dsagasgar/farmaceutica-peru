import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. OBTENEMOS EL USUARIO UNA SOLA VEZ
  const usuario = authService.obtenerUsuarioActual();

  // Verificar si el usuario está autenticado (Authentication check)
  if (!usuario) {
    router.navigate(['/login']);
    return false;
  }

  // Verificar el rol requerido (Role authorization check)
  const requiredRole = route.data['role'];

  if (requiredRole && usuario.rol !== requiredRole) {
    // Si intenta acceder a una ruta de otro rol, lo redirigimos a su propio dashboard
    const rutaPorRol: Record<string, string> = {
      'ADMINISTRADOR': '/dashboard/administrador',
      'CAJERO': '/dashboard/cajero',
      'ALMACENERO': '/dashboard/almacen',
      'QUIMICO_FARMACEUTICO': '/dashboard/quimico'
    };
    
    const rutaUsuario = rutaPorRol[usuario.rol];
    router.navigate([rutaUsuario]);
    return false;
  }

  return true;
};