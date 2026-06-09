import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  // MODERNIZED: Clean dependency injection using functional tokens
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  error = '';
  procesando = false;

  onLogin(): void {
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Por favor ingrese email y contraseña';
      return;
    }

    this.procesando = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.procesando = false;
        const usuario = response.user;
        
        // Symmetrical routing contract mapping matching our dashboards path layouts
        const rutaPorRol: Record<string, string> = {
          'ADMINISTRADOR': '/dashboard/administrador',
          'CAJERO': '/dashboard/cajero',
          'ALMACENERO': '/dashboard/almacen',
          'QUIMICO_FARMACEUTICO': '/dashboard/quimico'
        };
        
        this.router.navigate([rutaPorRol[usuario.rol]]);
      },
      error: (err) => {
        this.procesando = false;
        if (err.status === 401) {
          this.error = 'Email o contraseña incorrectos.';
        } else {
          this.error = 'No se pudo conectar con el servidor de Spring Boot. Intente más tarde.';
        }
        console.error('Authentication gateway network failure:', err);
      }
    });
  }
}