import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Usuario } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root' 
})
export class AuthService {
  private usuarioActualSignal = signal<Usuario | null>(null);
  private estaAutenticadoSignal = signal<boolean>(false);

  public estaAutenticado$ = computed(() => this.estaAutenticadoSignal());
  public usuarioActual$ = computed(() => this.usuarioActualSignal());

  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  constructor() {
    this.cargarDelLocalStorage();
  }

  login(email: string, password: string): Observable<any> {
    // --- CONEXIÓN REAL CON EL BACKEND ---
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password }).pipe(
      tap(response => {
        // ✅ Login exitoso desde el backend
        const usuario = response.user;
        this.usuarioActualSignal.set(usuario);
        this.estaAutenticadoSignal.set(true);
        localStorage.setItem('usuarioActual', JSON.stringify(usuario));
        console.log(`✅ Login exitoso: ${usuario.nombre} (${usuario.rol})`);
      }),
      catchError(error => {
        // Limpiamos cualquier estado de sesión previo
        this.logout();
        // Propagamos el error para que el componente de login pueda mostrar un mensaje.
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.usuarioActualSignal.set(null);
    this.estaAutenticadoSignal.set(false);
    localStorage.removeItem('usuarioActual');
    console.log('✅ Sesión cerrada');
  }

  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActualSignal();
  }

  usuarioTieneRol(rol: string): boolean {
    const usuario = this.usuarioActualSignal();
    return usuario?.rol === rol;
  }

  private cargarDelLocalStorage(): void {
    try {
      const usuarioGuardado = localStorage.getItem('usuarioActual');
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        this.usuarioActualSignal.set(usuario);
        this.estaAutenticadoSignal.set(true);
      }
    } catch (error) {
      console.error('Error cargando usuario del localStorage', error);
    }
  }
}
