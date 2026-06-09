import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { VentaService } from '../../../services/venta.service';
import { Usuario, Venta } from '../../../models/types';

@Component({
  selector: 'app-cajero-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './cajero-dashboard.component.html',
  styleUrl: './cajero-dashboard.component.css'
})
export class CajeroDashboardComponent {
  private authService = inject(AuthService);
  private ventaService = inject(VentaService);
  private router = inject(Router);

  // OPTIMIZED: Inline property assignment to clean up the legacy constructor block
  usuario: Usuario | null = this.authService.obtenerUsuarioActual();
  ordenIdBusqueda: string = '';
  buscando: boolean = false;
  errorBusqueda: string = '';
  ordenSeleccionada: Venta | null = null;
  procesandoPago: boolean = false;
  errorPago: string = '';

  buscarOrden(): void {
    if (!this.ordenIdBusqueda.trim()) return;
    this.buscando = true;
    this.errorBusqueda = '';
    this.ordenSeleccionada = null;
    this.errorPago = '';

    this.ventaService.buscarOrdenPorId(this.ordenIdBusqueda.trim()).subscribe({
      next: (orden) => {
        if (orden) {
          this.ordenSeleccionada = orden;
        } else {
          this.errorBusqueda = `No se encontró ninguna orden con el ID "${this.ordenIdBusqueda}".`;
        }
        this.buscando = false;
      },
      error: (err) => {
        this.errorBusqueda = 'No se pudo conectar con el servidor de Spring Boot para recuperar el ticket.';
        console.error('Database communication failure:', err);
        this.buscando = false;
      }
    });
  }

  registrarPago(): void {
    if (!this.ordenSeleccionada || !this.usuario) return;
    this.procesandoPago = true;
    this.errorPago = '';

    this.ventaService.registrarPago(this.ordenSeleccionada.id, this.usuario.id).subscribe({
      next: (ordenActualizada) => {
        this.ordenSeleccionada = ordenActualizada;
        this.procesandoPago = false;
        // Cleaned up the redundant manual ChangeDetectorRef trigger layout
      },
      error: (err) => {
        this.errorPago = err.message || 'Ocurrió un error al registrar el pago.';
        console.error('Payment transaction rollback trigger:', err);
        this.procesandoPago = false;
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}