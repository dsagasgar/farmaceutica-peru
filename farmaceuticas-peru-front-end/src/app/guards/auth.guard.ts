/**
 * AUTH GUARD
 * =========
 * Protege las rutas - solo usuarios autenticados pueden acceder
 */

import { Injectable } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar si el usuario está autenticado
  if (!authService.obtenerUsuarioActual()) {
    router.navigate(['/login']);
    return false;
  }

  // Verificar el rol requerido
  const requiredRole = route.data['role'];
  const usuario = authService.obtenerUsuarioActual();

  if (requiredRole && usuario?.rol !== requiredRole) {
    // Si el usuario está autenticado pero intenta acceder a una ruta de otro rol,
    // lo redirigimos a su propio dashboard usando el mapa de rutas correcto.
    const rutaPorRol: Record<string, string> = {
      'ADMINISTRADOR': '/dashboard/administrador',
      'CAJERO': '/dashboard/cajero',
      'ALMACENERO': '/dashboard/almacen',
      'QUIMICO_FARMACEUTICO': '/dashboard/quimico'
    };
    const rutaUsuario = rutaPorRol[usuario!.rol];
    router.navigate([rutaUsuario]);
    return false;
  }

  return true;
};
