import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

import { CatalogoProductosComponent } from './catalogo-productos.component';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../../models/types';

describe('CatalogoProductosComponent', () => {
  let component: CatalogoProductosComponent;
  let fixture: ComponentFixture<CatalogoProductosComponent>;
  let mockProductoService: { buscarProductosParaVenta: any };

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
    vi.useFakeTimers();

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

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize and load default products on init', async () => {
    fixture.detectChanges(); 

    let loadedProducts: Producto[] = [];
    component.productos$.subscribe(products => {
      loadedProducts = products;
    });

    await vi.advanceTimersByTimeAsync(300); 

    expect(component).toBeTruthy();
    expect(mockProductoService.buscarProductosParaVenta).toHaveBeenCalledWith('');
    expect(loadedProducts).toEqual(dummyProductos);
  });

  it('should search products with debounce', async () => {
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);

    component.terminoBusquedaModel = 'Aspirina';
    component.onBusqueda();

    expect(mockProductoService.buscarProductosParaVenta).toHaveBeenCalledTimes(1); 

    await vi.advanceTimersByTimeAsync(150);
    expect(mockProductoService.buscarProductosParaVenta).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(150);
    expect(mockProductoService.buscarProductosParaVenta).toHaveBeenCalledTimes(2);
    expect(mockProductoService.buscarProductosParaVenta).toHaveBeenLastCalledWith('Aspirina');
  });
});