import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

// Definimos las interfaces aquí para que el servicio sea autocontenido.
export interface Usuario {
  id: string;
  email: string;
  nombre: string;
  rol: 'ADMINISTRADOR' | 'QUIMICO_FARMACEUTICO' | 'ALMACENERO' | 'CAJERO';
}

interface AuthResponse {
  jwt: string;
  user: Usuario;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/auth`;

  private usuarioActualSubject = new BehaviorSubject<Usuario | null>(null);
  public usuarioActual$ = this.usuarioActualSubject.asObservable();

  constructor() {
    this.cargarSesion();
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(
        tap(response => this.guardarSesion(response.jwt, response.user))
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.usuarioActualSubject.next(null);
    this.router.navigate(['/login']);
    console.log('✅ Sesión cerrada');
  }

  obtenerUsuarioActual(): Usuario | null {
    return this.usuarioActualSubject.getValue();
  }

  // ESTE ES EL MÉTODO QUE SOLUCIONA EL ERROR
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  private guardarSesion(token: string, usuario: Usuario): void {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    this.usuarioActualSubject.next(usuario);
    console.log(`✅ Login exitoso: ${usuario.nombre} (${usuario.rol})`);
  }

  private cargarSesion(): void {
    const token = localStorage.getItem('token');
    const usuarioString = localStorage.getItem('usuario');
    if (token && usuarioString) {
      this.usuarioActualSubject.next(JSON.parse(usuarioString));
    }
  }
}