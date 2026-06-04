import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CompraService } from '../../../services/compra.service';
import { Usuario, CompraProveedor, ItemCompra, Producto } from '../../../models/types';
import { Observable } from 'rxjs';
import { ProductoService } from '../../../services/producto.service';

/**
 * Gestiona el panel del Almacenero.
 * Su principal responsabilidad es la HU1: verificar la recepción de compras de proveedores.
 */
@Component({
  selector: 'app-almacen-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule], // Importamos CatalogoProductosComponent para usarlo
  templateUrl: './almacen-dashboard.component.html',
  styleUrl: './almacen-dashboard.component.css'
})
// 3. LÓGICA TYPESCRIPT: Define el comportamiento del componente.
export class AlmacenDashboardComponent implements OnInit {
  // Inyección de dependencias: Angular nos provee las instancias de los servicios que necesitamos.
  private authService = inject(AuthService);
  private compraService = inject(CompraService);
  private router = inject(Router);
  private productoService = inject(ProductoService);

  // --- PROPIEDADES DE ESTADO ---
  usuario: Usuario | null = null;
  // Observable que contiene la lista de compras pendientes a recibir. El pipe `async` en el HTML se suscribe a él.
  compras$!: Observable<CompraProveedor[]>;
  // Observable para la lista de productos en la sección de gestión de stock.
  productosGestion$!: Observable<Producto[]>;
  // Almacena la compra que el usuario está verificando actualmente. Controla qué vista se muestra.
  compraSeleccionada: CompraProveedor | null = null;
  // Copia de los items de la compra seleccionada para poder editarlos en el formulario sin afectar el original.
  itemsVerificacion: ItemCompra[] = [];
  observaciones: string = '';
  procesando: boolean = false;
  errorVerificacion: string = '';

  // El constructor se usa para inicializar el componente y sus dependencias.
  constructor() {
    this.usuario = this.authService.obtenerUsuarioActual();
  }

  // ngOnInit: Gancho del ciclo de vida. Se ejecuta una vez que el componente se ha inicializado. Ideal para cargar datos iniciales.
  ngOnInit(): void {
    this.compras$ = this.compraService.getComprasParaRecepcion();
    this.productosGestion$ = this.productoService.buscarProductosParaAlmacen(''); // Carga todos los productos para la gestión
  }

  // --- MÉTODOS DE FLUJO DE TRABAJO ---

  /** Se activa al hacer clic en "Verificar". Cambia la vista a detalle y prepara el formulario. */
  seleccionarCompra(compra: CompraProveedor): void {
    this.compraSeleccionada = compra;
    // Clonamos los items de forma segura para no modificar el objeto original en la lista mientras editamos.
    this.itemsVerificacion = compra.items.map(item => ({ ...item }));
    // Pre-llenar la cantidad recibida con la cantidad pedida para facilitar la tarea
    this.itemsVerificacion.forEach(item => {
      item.cantidadRecibida = item.cantidadRecibida ?? item.cantidadPedida;
    });
  }

  /** Resetea la vista para mostrar nuevamente la lista de compras. */
  volverALista(): void {
    this.compraSeleccionada = null;
    this.itemsVerificacion = [];
    this.observaciones = '';
    this.errorVerificacion = '';
  }

  /** Envía los datos del formulario al servicio para registrar la recepción y actualiza la vista. */
  enviarVerificacion(): void {
    if (!this.compraSeleccionada) return;
    this.procesando = true;
    this.errorVerificacion = '';

    this.compraService.registrarRecepcion(this.compraSeleccionada.id, this.itemsVerificacion, this.observaciones)
      .subscribe({
        next: () => {
          this.procesando = false;
          this.volverALista();
          this.compras$ = this.compraService.getComprasParaRecepcion(); // Recarga la lista de compras pendientes.
          // Aquí se podría mostrar un mensaje de éxito
        },
        error: (err) => {
          this.errorVerificacion = err.message || 'Ocurrió un error al enviar la verificación.';
          this.procesando = false;
        }
      });
  }

  /** Actualiza la cantidad de stock disponible para la venta de un producto. */
  actualizarStockVenta(producto: Producto): void {
    // Aquí podrías añadir una lógica de feedback visual (ej. un spinner en el botón)
    this.productoService.actualizarStockVenta(producto.id, producto.stockVenta).subscribe({
      next: (productoActualizado) => {
        console.log('Stock de venta actualizado', productoActualizado);
        // Opcional: mostrar un toast/mensaje de éxito.
        // Para refrescar la lista, podrías re-llamar al servicio, o si el backend devuelve
        // el objeto actualizado, simplemente actualizarlo en la lista local.
      },
      error: (err) => console.error('Error al actualizar stock de venta', err)
    });
  }

  /** Cierra la sesión del usuario y lo redirige a la página de login. */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}