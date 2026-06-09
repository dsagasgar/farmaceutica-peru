import { Component, OnInit, inject, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { VentaService } from '../../../services/venta.service';
import { AuthService } from '../../../services/auth.service';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Producto, Venta, Usuario, FormulaMagistral } from '../../../models/types';

@Component({
  selector: 'app-nuevo-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-pedido.component.html',
  styleUrl: './nuevo-pedido.component.css'
})
export class NuevoPedidoComponent implements OnInit, OnDestroy {
  @Output() pedidoGenerado = new EventEmitter<Venta>();
  @Output() cancelar = new EventEmitter<void>();

  private productoService = inject(ProductoService);
  private ventaService = inject(VentaService);
  private authService = inject(AuthService);

  private searchTerms = new Subject<string>();
  private searchSubscription!: Subscription; // Para evitar fugas de memoria (memory leaks)

  usuario: Usuario | null = null;
  productosDisponibles: Producto[] = [];
  terminoBusquedaProducto = '';
  productosFiltrados: Producto[] = [];
  pedidoActual: { producto: Producto, cantidad: number }[] = [];
  formulasEnPedido: FormulaMagistral[] = [];
  
  formulaActual = { nombre: '', composicion: '', procedimiento: '', precio: 0 };
  clienteNombre = '';
  totalPedido = 0;
  procesandoPedido = false;
  errorMensaje = ''; // Alerta visual para problemas de stock en el backend

  ngOnInit(): void {
    this.usuario = this.authService.obtenerUsuarioActual();
    
    // Configura la búsqueda reactiva con el endpoint real /api/productos/venta
    this.searchSubscription = this.searchTerms.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.productoService.buscarProductosParaVenta(term)),
    ).subscribe({
      next: (productos: Producto[]) => this.productosFiltrados = productos,
      error: (err) => console.error('Error en el stream de búsqueda:', err)
    });
  }

  ngOnDestroy(): void {
    // Buenas prácticas: limpiamos la suscripción al destruir el componente
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  buscarProducto(): void {
    this.searchTerms.next(this.terminoBusquedaProducto);
  }

  agregarProducto(producto: Producto): void {
    const itemExistente = this.pedidoActual.find(item => item.producto.id === producto.id);
    if (itemExistente) {
      // CORREGIDO: Se valida contra stockVenta que es el límite real del mostrador
      if (itemExistente.cantidad < producto.stockVenta) itemExistente.cantidad++;
    } else {
      if (producto.stockVenta > 0) {
        this.pedidoActual.push({ producto, cantidad: 1 });
      }
    }
    this.terminoBusquedaProducto = '';
    this.productosFiltrados = [];
    this.calcularTotal();
  }

  actualizarCantidad(productoId: string, event: Event): void {
    const nuevaCantidad = parseInt((event.target as HTMLInputElement).value, 10);
    const item = this.pedidoActual.find(i => i.producto.id === productoId);
    
    // CORREGIDO: Consistencia con la cuota de stockVenta
    if (item && nuevaCantidad > 0 && nuevaCantidad <= item.producto.stockVenta) {
      item.cantidad = nuevaCantidad;
      this.calcularTotal();
    } else if (item) {
      (event.target as HTMLInputElement).value = item.cantidad.toString();
    }
  }

  eliminarProducto(productoId: string): void {
    this.pedidoActual = this.pedidoActual.filter(item => item.producto.id !== productoId);
    this.calcularTotal();
  }

  agregarFormula(): void {
    if (!this.formulaActual.nombre || !this.formulaActual.composicion || this.formulaActual.precio <= 0) {
      return;
    }
    const nuevaFormula: FormulaMagistral = {
      id: `temp-${Date.now()}`, 
      ...this.formulaActual
    };
    this.formulasEnPedido.push(nuevaFormula);
    this.formulaActual = { nombre: '', composicion: '', procedimiento: '', precio: 0 };
    this.calcularTotal();
  }

  eliminarFormula(formulaId: string): void {
    this.formulasEnPedido = this.formulasEnPedido.filter(f => f.id !== formulaId);
    this.calcularTotal();
  }

  calcularTotal(): void {
    const totalProductos = this.pedidoActual.reduce((total, item) => total + (item.producto.precioUnitario * item.cantidad), 0);
    const totalFormulas = this.formulasEnPedido.reduce((total, formula) => total + formula.precio, 0);
    this.totalPedido = totalProductos + totalFormulas;
  }

  generarOrden(): void {
    if ((this.pedidoActual.length === 0 && this.formulasEnPedido.length === 0) || !this.clienteNombre.trim() || !this.usuario) {
      return;
    }
    
    this.procesandoPedido = true;
    this.errorMensaje = '';

    // CORREGIDO: Estructura limpia que coincide con Omit<Venta, 'id' | 'fecha' | 'estado'>
    const nuevaVenta = {
      clienteNombre: this.clienteNombre,
      quimicoId: this.usuario.id,
      items: this.pedidoActual.map(item => ({
        productoId: item.producto.id,
        nombreProducto: item.producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precioUnitario,
        subtotal: item.producto.precioUnitario * item.cantidad
      })),
      itemsFormula: this.formulasEnPedido,
      total: this.totalPedido
    };

    // Removido el cast 'as any' para garantizar un tipado estricto (strict typing contract)
    this.ventaService.crearVenta(nuevaVenta).subscribe({
      next: (ventaGenerada: Venta) => {
        this.procesandoPedido = false;
        this.pedidoGenerado.emit(ventaGenerada);
      },
      error: (err) => {
        this.procesandoPedido = false;
        this.errorMensaje = 'Error al registrar la orden. Verifique el stock disponible en el servidor.';
        console.error('Database transaction rollback trigger:', err);
      }
    });
  }
}