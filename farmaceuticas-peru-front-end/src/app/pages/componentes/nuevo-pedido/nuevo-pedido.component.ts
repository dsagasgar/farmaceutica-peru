import { Component, OnInit, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { VentaService } from '../../../services/venta.service';
import { AuthService } from '../../../services/auth.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Producto, Venta, Usuario, FormulaMagistral } from '../../../models/types';

@Component({
  selector: 'app-nuevo-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './nuevo-pedido.component.html',
  styleUrl: './nuevo-pedido.component.css'
})
export class NuevoPedidoComponent implements OnInit {
  @Output() pedidoGenerado = new EventEmitter<Venta>();
  @Output() cancelar = new EventEmitter<void>();

  private productoService = inject(ProductoService);
  private ventaService = inject(VentaService);
  private authService = inject(AuthService);

  private searchTerms = new Subject<string>();
  usuario: Usuario | null = null;
  productosDisponibles: Producto[] = [];
  terminoBusquedaProducto = '';
  productosFiltrados: Producto[] = [];
  pedidoActual: { producto: Producto, cantidad: number }[] = [];
  formulasEnPedido: FormulaMagistral[] = [];
  formulaActual: { nombre: string, composicion: string, procedimiento: string, precio: number } = { nombre: '', composicion: '', procedimiento: '', precio: 0 };
  clienteNombre = '';
  totalPedido = 0;
  procesandoPedido = false;

  ngOnInit(): void {
    this.usuario = this.authService.obtenerUsuarioActual();
    
    // Configura la búsqueda reactiva con debounce
    this.searchTerms.pipe(
      debounceTime(300), // Espera 300ms después de la última pulsación
      distinctUntilChanged(), // Ignora si el término de búsqueda es el mismo
      // Cambia a una nueva búsqueda cada vez que el término cambia
      switchMap((term: string) => this.productoService.buscarProductosParaVenta(term)),
    ).subscribe((productos: Producto[]) => {
      this.productosFiltrados = productos;
    });
  }

  buscarProducto(): void {
    this.searchTerms.next(this.terminoBusquedaProducto);
  }

  agregarProducto(producto: Producto): void {
    const itemExistente = this.pedidoActual.find(item => item.producto.id === producto.id);
    if (itemExistente) {
      if (itemExistente.cantidad < producto.stock) itemExistente.cantidad++;
    } else {
      this.pedidoActual.push({ producto, cantidad: 1 });
    }
    this.terminoBusquedaProducto = '';
    this.productosFiltrados = [];
    this.calcularTotal();
  }

  actualizarCantidad(productoId: string, event: Event): void {
    const nuevaCantidad = parseInt((event.target as HTMLInputElement).value, 10);
    const item = this.pedidoActual.find(i => i.producto.id === productoId);
    if (item && nuevaCantidad > 0 && nuevaCantidad <= item.producto.stock) {
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
      // Podrías mostrar un error al usuario
      return;
    }
    const nuevaFormula: FormulaMagistral = {
      id: `temp-${Date.now()}`, // ID temporal para el frontend
      ...this.formulaActual
    };
    this.formulasEnPedido.push(nuevaFormula);
    // Resetear el formulario de la fórmula
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
      total: this.totalPedido,
      // Se añade el estado inicial para que el objeto cumpla con la interfaz Venta
      estado: 'PENDIENTE_PAGO'
    };

    this.ventaService.crearVenta(nuevaVenta as any).subscribe((ventaGenerada: Venta) => {
      this.procesandoPedido = false;
      this.pedidoGenerado.emit(ventaGenerada);
    });
  }
}