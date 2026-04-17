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
    router.navigate(['/dashboard', usuario?.rol]);
    return false;
  }

  return true;
};
