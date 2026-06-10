import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CompraService } from '../../../services/compra.service';
import { Usuario, CompraProveedor, ItemCompra, Producto } from '../../../models/types';
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
  private cdr = inject(ChangeDetectorRef);

  usuario: Usuario | null = this.authService.obtenerUsuarioActual();
  
  compras: CompraProveedor[] = [];
  productosGestion: Producto[] = [];
  
  cargandoCompras: boolean = false;
  cargandoProductos: boolean = false;

  compraSeleccionada: CompraProveedor | null = null;
  itemsVerificacion: ItemCompra[] = [];
  observaciones: string = '';
  procesando: boolean = false;
  errorVerificacion: string = '';

  idProductoEditando: string | null = null;
  mensajeExitoStock: string = '';
  mensajeErrorStock: string = '';

  ngOnInit(): void {
    this.cargarDatosAlmacen();
  }

  private cargarDatosAlmacen(): void {
    this.cargandoCompras = true;
    this.cargandoProductos = true;

    this.compraService.getComprasParaRecepcion().subscribe({
      next: (data) => {
        this.compras = data;
        this.cargandoCompras = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar compras:', err);
        this.cargandoCompras = false;
        this.cdr.detectChanges();
      }
    });

    this.productoService.buscarProductosParaAlmacen('').subscribe({
      next: (data) => {
        this.productosGestion = data;
        this.cargandoProductos = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar catálogo:', err);
        this.cargandoProductos = false;
        this.cdr.detectChanges();
      }
    });
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
    this.cdr.detectChanges();

    this.compraService.registrarRecepcion(this.compraSeleccionada.id, this.itemsVerificacion, this.observaciones)
      .subscribe({
        next: () => {
          this.procesando = false;
          this.volverALista();
          this.cargarDatosAlmacen();
        },
        error: (err) => {
          this.errorVerificacion = err.message || 'Ocurrió un error al enviar la verificación.';
          this.procesando = false;
          this.cdr.detectChanges();
        }
      });
  }

  actualizarStockVenta(producto: Producto): void {
    if (producto.stockVenta > producto.stock) {
      this.mensajeErrorStock = `El stock de venta para "${producto.nombre}" no puede superar al stock total físico.`;
      this.mensajeExitoStock = '';
      return;
    }

    this.idProductoEditando = producto.id;
    this.mensajeErrorStock = '';
    this.mensajeExitoStock = '';
    this.cdr.detectChanges(); 

    this.productoService.actualizarStockVenta(producto.id, producto.stockVenta).subscribe({
      next: (productoActualizado) => {
        this.idProductoEditando = null; 
        this.mensajeExitoStock = `¡Stock de venta para "${productoActualizado.nombre}" actualizado con éxito en PostgreSQL!`;
        
        producto.stockVenta = productoActualizado.stockVenta;
        producto.stock = productoActualizado.stock; 
        
        this.cdr.detectChanges(); 
      },
      error: (err) => {
        this.idProductoEditando = null;
        this.mensajeErrorStock = 'Error de comunicación con el servidor de Spring Boot. Reintente.';
        console.error('Transactional error payload:', err);
        this.cdr.detectChanges();
      }
    });
  }

  trackByProductoId(index: number, producto: Producto): string {
    return producto.id;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}