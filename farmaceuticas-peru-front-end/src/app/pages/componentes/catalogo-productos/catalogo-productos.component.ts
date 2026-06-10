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
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term: string) => this.productoService.buscarProductosParaVenta(term)),
    );
  }

  onBusqueda(): void {
    this.busquedaSubject.next(this.terminoBusquedaModel);
  }
}