import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface ProductoInventario {
  id: string;
  nombre: string;
  marca: string;
  cantidad: number;
  alertaMinima: number;
  precio: number;
  fechaVencimiento: Date;
  lote: string;
  categoria: string;
  estado: 'disponible' | 'bajo-stock' | 'agotado' | 'vencido';
}

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent {
  productos: ProductoInventario[] = [
    {
      id: '1',
      nombre: 'Paracetamol 500mg',
      marca: 'Tafirol',
      cantidad: 150,
      alertaMinima: 50,
      precio: 2.50,
      fechaVencimiento: new Date('2025-12-31'),
      lote: 'LT001',
      categoria: 'Analgesicos',
      estado: 'disponible'
    },
    {
      id: '2',
      nombre: 'Amoxicilina 500mg',
      marca: 'Amoxicilina',
      cantidad: 30,
      alertaMinima: 50,
      precio: 8.50,
      fechaVencimiento: new Date('2025-06-30'),
      lote: 'LT002',
      categoria: 'Antibioticos',
      estado: 'bajo-stock'
    }
  ];

  busqueda = '';
  filtroEstado = '';
  filtroCategoria = '';
  mostrarModal = false;
  editando = false;
  productoForm: ProductoInventario = this.inicializarFormulario();

  get productosFiltrrados(): ProductoInventario[] {
    return this.productos.filter(p => {
      const coincideBusqueda = p.nombre.toLowerCase().includes(this.busqueda.toLowerCase()) ||
                             p.marca.toLowerCase().includes(this.busqueda.toLowerCase());
      const coincideEstado = !this.filtroEstado || p.estado === this.filtroEstado;
      const coincideCategoria = !this.filtroCategoria || p.categoria === this.filtroCategoria;
      return coincideBusqueda && coincideEstado && coincideCategoria;
    });
  }

  get valorTotal(): number {
    return this.productosFiltrrados.reduce((sum, p) => sum + (p.cantidad * p.precio), 0);
  }

  get productosBajoStock(): number {
    return this.productos.filter(p => p.estado === 'bajo-stock' || p.estado === 'agotado').length;
  }

  abrirModalAgregar(): void {
    this.editando = false;
    this.productoForm = this.inicializarFormulario();
    this.mostrarModal = true;
  }

  editarProducto(producto: ProductoInventario): void {
    this.editando = true;
    this.productoForm = { ...producto };
    this.mostrarModal = true;
  }

  cerrarModal(): void {
    this.mostrarModal = false;
  }

  guardarProducto(): void {
    if (this.editando) {
      const index = this.productos.findIndex(p => p.id === this.productoForm.id);
      if (index > -1) {
        this.productos[index] = this.productoForm;
      }
    } else {
      this.productoForm.id = Math.random().toString();
      this.productos.push(this.productoForm);
    }
    this.cerrarModal();
  }

  eliminarProducto(id: string): void {
    if (confirm('¿Desea eliminar este producto?')) {
      this.productos = this.productos.filter(p => p.id !== id);
    }
  }

  private inicializarFormulario(): ProductoInventario {
    return {
      id: '',
      nombre: '',
      marca: '',
      cantidad: 0,
      alertaMinima: 0,
      precio: 0,
      fechaVencimiento: new Date(),
      lote: '',
      categoria: '',
      estado: 'disponible'
    };
  }
}
