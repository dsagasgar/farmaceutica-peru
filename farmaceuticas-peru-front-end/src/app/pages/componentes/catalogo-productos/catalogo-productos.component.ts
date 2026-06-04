import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../../models/types';
import { Observable, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-catalogo-productos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './catalogo-productos.component.html',
  styleUrl: './catalogo-productos.component.css'
})
export class CatalogoProductosComponent implements OnInit {
  private productoService = inject(ProductoService);
  
  productos$!: Observable<Producto[]>;
  private busquedaSubject = new Subject<string>();
  terminoBusquedaModel: string = '';

  ngOnInit(): void {
    this.productos$ = this.busquedaSubject.pipe(
      startWith(''), // Realiza una búsqueda inicial con un string vacío para cargar todo.
      // Espera 300ms después de la última pulsación antes de actuar
      debounceTime(300),
      // Ignora si el nuevo término es igual al anterior
      distinctUntilChanged(),
      // Cambia a la nueva búsqueda y cancela la anterior
      switchMap((term: string) => this.productoService.buscarProductosParaVenta(term)),
    );
  }

  onBusqueda(): void {
    // Cada vez que el modelo cambia, emitimos el nuevo valor al subject.
    this.busquedaSubject.next(this.terminoBusquedaModel);
  }
}