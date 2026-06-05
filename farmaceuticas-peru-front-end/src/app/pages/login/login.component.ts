import { Component } from '@angular/core';
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
  email: string = '';
  password: string = '';
  error: string = '';
  procesando: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogin(): void {
    this.error = '';

    if (!this.email || !this.password) {
      this.error = 'Por favor ingrese email y contraseña';
      return;
    }

    // Mostrar que está procesando
    this.procesando = true;

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        this.procesando = false;
        // Si el login es exitoso, response tendrá el usuario y navegaremos.
        const usuario = response.user;
        
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
        // Si el error es 401, son credenciales inválidas. Otros errores son de red/servidor.
        if (err.status === 401) {
          this.error = 'Email o contraseña incorrectos.';
        } else {
          this.error = 'No se pudo conectar con el servidor. Intente más tarde.';
        }
        console.error('Error de conexión:', err);
      }
    });
  }
}
