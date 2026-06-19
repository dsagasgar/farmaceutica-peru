import { Component, inject, ChangeDetectorRef, NgZone } from '@angular/core';
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
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  usuario: Usuario | null = this.authService.obtenerUsuarioActual();
  ordenIdBusqueda: string = '';
  buscando: boolean = false;
  errorBusqueda: string = '';
  ordenSeleccionada: Venta | null = null;
  procesandoPago: boolean = false;
  errorPago: string = '';

  buscarOrden(): void {
    const idLimpio = this.ordenIdBusqueda ? this.ordenIdBusqueda.trim() : '';
    if (!idLimpio) return;

    this.buscando = true;
    this.errorBusqueda = '';
    this.errorPago = '';
    this.ordenSeleccionada = null;
    this.cdr.detectChanges(); 

    this.ventaService.buscarOrdenPorId(idLimpio).subscribe({
      next: (orden) => {
        this.ngZone.run(() => {
          this.buscando = false;
          if (orden) {
            this.ordenSeleccionada = orden;
          } else {
            this.errorBusqueda = `No se encontró ninguna orden con el ID "${idLimpio}".`;
          }
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.buscando = false;
          this.ordenSeleccionada = null;
          
          if (err.status === 404) {
            this.errorBusqueda = `No se encontró ninguna orden con el ID "${idLimpio}".`;
          } else {
            this.errorBusqueda = 'El servidor de Spring Boot denegó el acceso o se encuentra fuera de línea.';
          }
          console.error('Database communication failure payload:', err);
          this.cdr.detectChanges();
        });
      }
    });
  }

  registrarPago(): void {
    if (!this.ordenSeleccionada || !this.usuario) return;
    this.procesandoPago = true;
    this.errorPago = '';
    this.cdr.detectChanges();

    this.ventaService.registrarPago(this.ordenSeleccionada.id, this.usuario.id).subscribe({
      next: (ordenActualizada) => {
        this.ngZone.run(() => {
          this.ordenSeleccionada = ordenActualizada;
          this.procesandoPago = false;
          this.cdr.detectChanges();
        });
      },
      error: (err) => {
        this.ngZone.run(() => {
          this.errorPago = err.message || 'Ocurrió un error al registrar el pago.';
          console.error('Payment transaction rollback trigger:', err);
          this.procesandoPago = false;
          this.cdr.detectChanges();
        });
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}