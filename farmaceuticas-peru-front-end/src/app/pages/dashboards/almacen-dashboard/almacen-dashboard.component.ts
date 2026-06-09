import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CompraService } from '../../../services/compra.service';
import { Usuario, CompraProveedor, ItemCompra, Producto } from '../../../models/types';
import { Observable } from 'rxjs';
import { ProductoService } from '../../../services/producto.service';

@Component({
  selector: 'app-almacen-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './almacen-dashboard.component.html',
  styleUrl: './almacen-dashboard.component.css'
})
export class AlmacenDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private compraService = inject(CompraService);
  private router = inject(Router);
  private productoService = inject(ProductoService);

  // OPTIMIZED: Inline property assignment to remove the legacy constructor block
  usuario: Usuario | null = this.authService.obtenerUsuarioActual();
  compras$!: Observable<CompraProveedor[]>;
  productosGestion$!: Observable<Producto[]>;
  
  compraSeleccionada: CompraProveedor | null = null;
  itemsVerificacion: ItemCompra[] = [];
  observaciones: string = '';
  procesando: boolean = false;
  errorVerificacion: string = '';

  // NEW: State managers for user feedback on separate transactional operations
  idProductoEditando: string | null = null;
  mensajeExitoStock: string = '';
  mensajeErrorStock: string = '';

  ngOnInit(): void {
    this.cargarDatosAlmacen();
  }

  // Extracted data load logic for easier refreshing
  private cargarDatosAlmacen(): void {
    this.compras$ = this.compraService.getComprasParaRecepcion();
    this.productosGestion$ = this.productoService.buscarProductosParaAlmacen('');
  }

  seleccionarCompra(compra: CompraProveedor): void {
    this.compraSeleccionada = { ...compra };
    this.itemsVerificacion = compra.items.map(item => ({ ...item }));
    this.itemsVerificacion.forEach(item => {
      item.cantidadRecibida = item.cantidadRecibida ?? item.cantidadPedida;
    });
  }

  volverALista(): void {
    this.compraSeleccionada = null;
    this.itemsVerificacion = [];
    this.observaciones = '';
    this.errorVerificacion = '';
  }

  enviarVerificacion(): void {
    if (!this.compraSeleccionada) return;
    this.procesando = true;
    this.errorVerificacion = '';

    this.compraService.registrarRecepcion(this.compraSeleccionada.id, this.itemsVerificacion, this.observaciones)
      .subscribe({
        next: () => {
          this.procesando = false;
          this.volverALista();
          this.compras$ = this.compraService.getComprasParaRecepcion();
        },
        error: (err) => {
          this.errorVerificacion = err.message || 'Ocurrió un error al enviar la verificación.';
          this.procesando = false;
        }
      });
  }

  /**
   * Commits the updated retail stock allocation to the database
   * @param producto Selected core target entity
   */
  actualizarStockVenta(producto: Producto): void {
    // Structural business rule safeguard: Avoid exceeding physical limits
    if (producto.stockVenta > producto.stock) {
      this.mensajeErrorStock = `El stock de venta para "${producto.nombre}" no puede superar al stock total físico.`;
      this.mensajeExitoStock = '';
      return;
    }

    this.idProductoEditando = producto.id;
    this.mensajeErrorStock = '';
    this.mensajeExitoStock = '';

    this.productoService.actualizarStockVenta(producto.id, producto.stockVenta).subscribe({
      next: (productoActualizado) => {
        this.idProductoEditando = null;
        this.mensajeExitoStock = `¡Stock de venta para "${productoActualizado.nombre}" actualizado con éxito en PostgreSQL!`;
        console.log('Database synchronization successful:', productoActualizado);
      },
      error: (err) => {
        this.idProductoEditando = null;
        this.mensajeErrorStock = 'Error de comunicación con el servidor de Spring Boot. Reintente.';
        console.error('Transactional error payload:', err);
      }
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}