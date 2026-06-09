import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const usuario = authService.obtenerUsuarioActual();

  // Verificar si el usuario está autenticado (Authentication verification)
  if (!usuario) {
    router.navigate(['/login']);
    return false;
  }

  // CORREGIDO: Recuperamos la lista de roles autorizados para este segmento del cliente
  const allowedRoles = route.data['roles'] as string[];

  // CORREGIDO: Validamos si el rol del usuario actual está incluido en los accesos permitidos
  if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
    
    const rutaPorRol: Record<string, string> = {
      'ADMINISTRADOR': '/dashboard/administrador',
      'CAJERO': '/dashboard/cajero',
      'ALMACENERO': '/dashboard/almacen',
      'QUIMICO_FARMACEUTICO': '/dashboard/quimico'
    };
    
    const rutaUsuario = rutaPorRol[usuario.rol] || '/login';
    router.navigate([rutaUsuario]);
    return false;
  }

  return true;
};