import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Usuario, Venta } from '../../../models/types';
import { CatalogoProductosComponent } from '../../componentes/catalogo-productos/catalogo-productos.component';
import { NuevoPedidoComponent } from '../../componentes/nuevo-pedido/nuevo-pedido.component';

@Component({
  selector: 'app-quimico-dashboard',
  standalone: true,
  imports: [CommonModule, CatalogoProductosComponent, NuevoPedidoComponent, FormsModule],
  templateUrl: './quimico-dashboard.component.html',
  styleUrl: './quimico-dashboard.component.css'
})
export class QuimicoDashboardComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  // OPTIMIZED: Direct field initialization to remove the redundant constructor block
  usuario: Usuario | null = this.authService.obtenerUsuarioActual();
  mostrandoFormularioPedido = false;
  ordenGenerada: Venta | null = null;

  iniciarNuevoPedido(): void {
    this.mostrandoFormularioPedido = true;
    this.ordenGenerada = null;
  }

  onPedidoGenerado(venta: Venta): void {
    this.ordenGenerada = venta;
    this.mostrandoFormularioPedido = false;
  }

  onCancelarPedido(): void {
    this.mostrandoFormularioPedido = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}