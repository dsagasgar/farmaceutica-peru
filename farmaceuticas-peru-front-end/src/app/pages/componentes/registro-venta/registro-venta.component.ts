import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VentaService } from '../../../services/venta.service';
import { AuthService } from '../../../services/auth.service';
import { Venta, Usuario } from '../../../models/types';

@Component({
  selector: 'app-register-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-venta.component.html',
  styleUrl: './registro-venta.component.css'
})
export class RegisterVentaComponent implements OnInit {
  private ventaService = inject(VentaService);
  private authService = inject(AuthService);

  // State managers for order retrieval and checkout flow
  buscarTicketId = '';
  ordenActual: Venta | null = null;
  usuarioCajero: Usuario | null = null;
  
  procesandoPago = false;
  mensajeError = '';
  mensajeExito = '';

  ngOnInit(): void {
    // Captura las credenciales del cajero que inició sesión en el frontend
    this.usuarioCajero = this.authService.obtenerUsuarioActual();
  }

  // Looks up the pre-generated order token from the database
  buscarOrden(): void {
    if (!this.buscarTicketId.trim()) return;

    this.mensajeError = '';
    this.mensajeExito = '';
    this.ordenActual = null;

    this.ventaService.buscarOrdenPorId(this.buscarTicketId.trim()).subscribe({
      next: (venta: Venta) => {
        if (venta.estado !== 'PENDIENTE_PAGO') {
          this.mensajeError = `El ticket #${venta.id} ya se encuentra en estado: ${venta.estado}`;
          return;
        }
        this.ordenActual = venta;
      },
      error: (err) => {
        this.mensajeError = 'No se encontró ninguna orden pendiente con el ID proporcionado.';
        console.error('Ticket search failed:', err);
      }
    });
  }

  // Commits the payment transaction to Spring Boot and updates state in PostgreSQL
  emitirTicket(): void {
    if (!this.ordenActual || !this.usuarioCajero) return;

    this.procesandoPago = true;
    this.mensajeError = '';

    this.ventaService.registrarPago(this.ordenActual.id, this.usuarioCajero.id).subscribe({
      next: (ventaPagada: Venta) => {
        this.procesandoPago = false;
        this.mensajeExito = `¡Cobro procesado con éxito! Ticket #${ventaPagada.id} marcado como PAGADO.`;
        this.limpiarFormulario();
      },
      error: (err) => {
        this.procesandoPago = false;
        this.mensajeError = 'Hubo un problema al registrar el pago en el servidor. Inténtelo nuevamente.';
        console.error('Payment processing rollback trigger:', err);
      }
    });
  }

  limpiarFormulario(): void {
    this.buscarTicketId = '';
    this.ordenActual = null;
  }
}