/**
 * ROOT COMPONENT - APP
 * ====================
 * 
 * Este es el componente "padre" de toda la aplicación
 * Todo lo que ves en pantalla está dentro de este componente
 * 
 * Estructura:
 * APP
 */

import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
  ],
  template: `
    <router-outlet></router-outlet>
  `,
  styles: [` 
    :host {
      /* Aquí puedes cambiar la fuente principal de toda la aplicación */
      font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI",
        Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji",
        "Segoe UI Emoji", "Segoe UI Symbol";
    }
  `]
})
export class App {
  authService = inject(AuthService);
}
