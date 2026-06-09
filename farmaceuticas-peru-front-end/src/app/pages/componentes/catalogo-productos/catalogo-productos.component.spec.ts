import { TestBed, ComponentFixture, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { CatalogoProductosComponent } from './catalogo-productos.component';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../../models/types';

describe('CatalogoProductosComponent', () => {
  let component: CatalogoProductosComponent;
  let fixture: ComponentFixture<CatalogoProductosComponent>;

  // Mocks
  let mockProductoService: any;

  const dummyProductos: Producto[] = [
    {
      id: 'PROD-1',
      codigo: 'P001',
      nombre: 'Paracetamol',
      descripcion: 'Para la fiebre',
      precioUnitario: 1.5,
      stock: 100,
      stockVenta: 40,
      categoria: 'Gastro',
      marca: 'Genfar',
      fechaVencimiento: '2028-12-31',
      lote: 'L100',
      formato: 'Pastilla'
    }
  ];

  beforeEach(() => {
    mockProductoService = {
      buscarProductosParaVenta: vi.fn().mockReturnValue(of(dummyProductos))
    };

    TestBed.configureTestingModule({
      imports: [CatalogoProductosComponent],
      providers: [
        { provide: ProductoService, useValue: mockProductoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogoProductosComponent);
    component = fixture.componentInstance;
  });

  it('should initialize and load default products on init', fakeAsync(() => {
    fixture.detectChanges(); // Ejecuta ngOnInit
    tick(300); // Para saltar el debounceTime(300)

    let loadedProducts: Producto[] = [];
    component.productos$.subscribe(products => {
      loadedProducts = products;
    });

    tick();

    expect(component).toBeTruthy();
    expect(mockProductoService.buscarProductosParaVenta).toHaveBeenCalledWith('');
    expect(loadedProducts).toEqual(dummyProductos);
  }));

  it('should search products with debounce', fakeAsync(() => {
    fixture.detectChanges();
    tick(300);

    // Cambiar término de búsqueda
    component.terminoBusquedaModel = 'Aspirina';
    component.onBusqueda();

    // No debe haber llamado aún debido al debounceTime
    expect(mockProductoService.buscarProductosParaVenta).toHaveBeenCalledTimes(1); // Solo la llamada inicial

    tick(150); // Esperar parte del tiempo
    expect(mockProductoService.buscarProductosParaVenta).toHaveBeenCalledTimes(1);

    tick(150); // Completar el debounce de 300ms
    expect(mockProductoService.buscarProductosParaVenta).toHaveBeenCalledTimes(2);
    expect(mockProductoService.buscarProductosParaVenta).toHaveBeenLastCalledWith('Aspirina');
  }));
});
