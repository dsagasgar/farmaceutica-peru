import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
<<<<<<< HEAD
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
=======
  template: `
    <!-- CONTENEDOR PRINCIPAL -->
    <div class="login-container">
      <!-- CAJA DE LOGIN -->
      <div class="login-box">
        <h1>Farmacéuticas Perú</h1>
        <p class="subtitle">Sistema de Gestión Interna</p>
        
        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label for="email">📧 Email</label>
            <input 
              type="email" 
              id="email"
              name="email"
              [(ngModel)]="email"
              placeholder="Ej: admin@farmacia.com"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">🔒 Contraseña</label>
            <input 
              type="password" 
              id="password"
              name="password"
              [(ngModel)]="password"
              placeholder="Contraseña"
              required
            />
          </div>

          <button type="submit" [disabled]="procesando" class="login-btn">
            {{ procesando ? '⏳ Iniciando sesión...' : 'Iniciar Sesión' }}
          </button>
        </form>

        <div *ngIf="error" class="error-message">
          ❌ {{ error }}
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100dvh;
      background-color: #f0f2f5;
      padding: 1rem;
    }

    .login-box {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      padding: 2.5rem;
      max-width: 420px;
      width: 100%;
      border: 1px solid #dee2e6;
    }

    h1 {
      color: #343a40;
      font-size: 1.75rem;
      margin: 0 0 0.5rem 0;
      text-align: center;
      font-weight: 600;
    }

    .subtitle {
      color: #6c757d;
      text-align: center;
      margin-bottom: 2rem;
      font-size: 1rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: #495057;
      font-weight: 600;
      font-size: 0.9rem;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #ced4da;
      border-radius: 6px;
      font-size: 1rem;
      font-family: inherit;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      box-sizing: border-box;
    }

    input:focus {
      outline: none;
      border-color: #0056b3;
      box-shadow: 0 0 0 3px rgba(0, 86, 179, 0.1);
    }

    .login-btn {
      width: 100%;
      padding: 0.85rem;
      background-color: #0056b3;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s ease;
      margin-top: 1rem;
    }

    .login-btn:hover:not(:disabled) {
      background-color: #004494;
    }

    .login-btn:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
    }

    .error-message {
      background-color: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      padding: 1rem;
      border-radius: 6px;
      margin-top: 1.5rem;
      font-weight: 500;
      text-align: center;
    }

    @media (max-width: 480px) {
      .login-box {
        padding: 1.5rem;
      }

      h1 {
        font-size: 1.5rem;
      }
    }
  `]
>>>>>>> 47604d8edd03a1fe6b2f9de2ae829b06998cc97b
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
