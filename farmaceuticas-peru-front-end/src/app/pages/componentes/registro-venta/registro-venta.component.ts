import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ItemOrden {
  id: string;
  nombre: string;
  cantidad: number;
  precio: number;
  subtotal: number;
}

@Component({
  selector: 'app-register-venta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-venta.component.html',
  styleUrl: './registro-venta.component.css'
})
export class RegisterVentaComponent {
  ticketNumber = Math.random().toString().substring(7, 12).toUpperCase();
  currentDate = new Date().toLocaleDateString();

  cliente = {
    nombre: '',
    cedula: '',
    telefono: ''
  };

  productos = [
    { id: '1', nombre: 'Paracetamol 500mg', precio: 2.50 },
    { id: '2', nombre: 'Amoxicilina 500mg', precio: 8.50 },
    { id: '3', nombre: 'Vitamin C 1000mg', precio: 4.20 },
    { id: '4', nombre: 'Ibuprofeno 400mg', precio: 3.75 }
  ];

  items: ItemOrden[] = [];
  busquedaProducto = '';
  selectedProducto = '';
  cantidadProducto = 1;
  notas = '';
  impuestoPorcentaje = 15;

  get cantidadTotal(): number {
    return this.items.reduce((sum, item) => sum + item.cantidad, 0);
  }

  get subtotal(): number {
    return this.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  get impuesto(): number {
    return this.subtotal * (this.impuestoPorcentaje / 100);
  }

  get total(): number {
    return this.subtotal + this.impuesto;
  }

  agregarProducto(): void {
    if (!this.selectedProducto || this.cantidadProducto <= 0) return;

    const producto = this.productos.find(p => p.id === this.selectedProducto);
    if (!producto) return;

    const item: ItemOrden = {
      id: producto.id,
      nombre: producto.nombre,
      cantidad: this.cantidadProducto,
      precio: producto.precio,
      subtotal: producto.precio * this.cantidadProducto
    };

    this.items.push(item);
    this.selectedProducto = '';
    this.cantidadProducto = 1;
  }

  eliminarItem(index: number): void {
    this.items.splice(index, 1);
  }

  limpiarFormulario(): void {
    this.cliente = { nombre: '', cedula: '', telefono: '' };
    this.items = [];
    this.notas = '';
    this.selectedProducto = '';
    this.cantidadProducto = 1;
  }

  emitirTicket(): void {
    if (this.items.length === 0) return;

    alert(`Ticket #${this.ticketNumber} emitido para ${this.cliente.nombre}\nTotal: $${this.total.toFixed(2)}`);
    this.limpiarFormulario();
  }
}
