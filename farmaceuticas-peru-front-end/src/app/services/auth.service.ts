import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError, timer } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { Usuario } from '../models/types';

@Injectable({
  providedIn: 'root' // Disponible en toda la aplicación
})
export class AuthService {
  private usuarioActualSignal = signal<Usuario | null>(null);
  private estaAutenticadoSignal = signal<boolean>(false);

  public estaAutenticado$ = computed(() => this.estaAutenticadoSignal());
  public usuarioActual$ = computed(() => this.usuarioActualSignal());

  // private http = inject(HttpClient);
  // private apiUrl = 'http://localhost:3000/api';

  private usuariosDemo: Usuario[] = [
    { id: '1', email: 'admin@farmacia.com', nombre: 'Juan Admin', rol: 'administrador', password: '123456' },
    { id: '2', email: 'quimico@farmacia.com', nombre: 'Dr. Químico', rol: 'quimico', password: '123456' },
    { id: '3', email: 'cajero@farmacia.com', nombre: 'María Cajera', rol: 'cajero', password: '123456' },
    { id: '4', email: 'almacen@farmacia.com', nombre: 'Carlos Almacén', rol: 'almacen', password: '123456' }
  ];

  constructor() {
    this.cargarDelLocalStorage();
  }

  login(email: string, password: string): Observable<any> {
    // --- SIMULACIÓN DE LOGIN (SIN BACKEND) ---
    const usuarioEncontrado = this.usuariosDemo.find(
      u => u.email === email && u.password === password
    );

    // Simular un pequeño retraso de red
    return timer(500).pipe(
      map(() => {
        if (usuarioEncontrado) {
          // ✅ Login exitoso
          const { password, ...user } = usuarioEncontrado; // Quitar la contraseña
          this.usuarioActualSignal.set(user);
          this.estaAutenticadoSignal.set(true);
          localStorage.setItem('usuarioActual', JSON.stringify(user));
          console.log(`✅ Login simulado exitoso: ${user.nombre} (${user.rol})`);
          return { user }; // Devolver la estructura que el componente espera
        } else {
          // ❌ Login fallido
          throw { status: 401, message: 'Credenciales incorrectas' };
        }
      }),
      catchError(error => {
        this.logout();
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
