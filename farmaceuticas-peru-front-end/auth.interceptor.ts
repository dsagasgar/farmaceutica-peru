import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Asumimos que el token se guarda en localStorage después del login
  const authToken = localStorage.getItem('authToken');

  // Clona la petición para añadir el nuevo header.
  if (authToken) {
    const authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });
    // Pasa la petición clonada al siguiente handler.
    return next(authReq);
  }

  // Si no hay token, pasa la petición original.
  return next(req);
};