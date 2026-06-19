import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of } from 'rxjs';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

import { InventarioComponent } from './inventario.component';
import { ProductoService } from '../../../services/producto.service';
import { Producto } from '../../../models/types';

describe('InventarioComponent', () => {
  let component: InventarioComponent;
  let fixture: ComponentFixture<InventarioComponent>;
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
    },
    {
      id: 'PROD-2',
      codigo: 'P002',
      nombre: 'Ibuprofeno',
      descripcion: 'Antiinflamatorio',
      precioUnitario: 2.0,
      stock: 10,
      stockVenta: 5,
      categoria: 'Gastro',
      marca: 'Bayer',
      fechaVencimiento: '2028-12-31',
      lote: 'L200',
      formato: 'Pastilla'
    },
    {
      id: 'PROD-3',
      codigo: 'P003',
      nombre: 'Amoxicilina',
      descripcion: 'Antibiótico',
      precioUnitario: 3.5,
      stock: 0,
      stockVenta: 0,
      categoria: 'Respiratoria',
      marca: 'Genfar',
      fechaVencimiento: '2028-12-31',
      lote: 'L300',
      formato: 'Jarabe'
    }
  ];

  beforeEach(() => {
    vi.useFakeTimers();

    mockProductoService = {
      buscarProductosParaAlmacen: vi.fn().mockReturnValue(of(dummyProductos)),
      actualizarStockVenta: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [InventarioComponent],
      providers: [
        { provide: ProductoService, useValue: mockProductoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(InventarioComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize and load metrics correctly', async () => {
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300);

    let total = 0;
    let valor = 0;
    let bajoStock = 0;

    component.totalProductos$.subscribe(v => total = v);
    component.valorInventario$.subscribe(v => valor = v);
    component.bajoStock$.subscribe(v => bajoStock = v);

    await vi.advanceTimersByTimeAsync(0); // Procesa la cola de microtareas

    expect(component).toBeTruthy();
    expect(mockProductoService.buscarProductosParaAlmacen).toHaveBeenCalledWith('');
    expect(total).toBe(3);
    expect(valor).toBe((100 * 1.5) + (10 * 2.0) + (0 * 3.5)); // 170.0
    expect(bajoStock).toBe(2);
  });

  describe('Filters', () => {
    it('should filter by search text (nombre/marca)', async () => {
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(300);

      component.busqueda = 'Bayer';
      let filtered: Producto[] = [];
      component.productosFiltrados$.subscribe(list => filtered = list);
      await vi.advanceTimersByTimeAsync(0);

      expect(filtered.length).toBe(1);
      expect(filtered[0].nombre).toBe('Ibuprofeno');
    });

    it('should filter by estado (agotado / bajo-stock / disponible)', async () => {
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(300);

      component.filtroEstado = 'agotado';
      let filtered: Producto[] = [];
      component.productosFiltrados$.subscribe(list => filtered = list);
      await vi.advanceTimersByTimeAsync(0);

      expect(filtered.length).toBe(1);
      expect(filtered[0].nombre).toBe('Amoxicilina');
    });

    it('should filter by categoria', async () => {
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(300);

      component.filtroCategoria = 'Respiratoria';
      let filtered: Producto[] = [];
      component.productosFiltrados$.subscribe(list => filtered = list);
      await vi.advanceTimersByTimeAsync(0);

      expect(filtered.length).toBe(1);
      expect(filtered[0].nombre).toBe('Amoxicilina');
    });
  });

  describe('Modal interactions', () => {
    it('should open modal for add', () => {
      fixture.detectChanges();
      component.abrirModalAgregar();

      expect(component.editando).toBe(false);
      expect(component.mostrarModal).toBe(true);
      expect(component.productoForm.id).toBe('');
    });

    it('should open modal for edit with product values', () => {
      fixture.detectChanges();
      component.editarProducto(dummyProductos[0]);

      expect(component.editando).toBe(true);
      expect(component.mostrarModal).toBe(true);
      expect(component.productoForm).toEqual(dummyProductos[0]);
    });

    it('should close modal', () => {
      fixture.detectChanges();
      component.mostrarModal = true;
      component.cerrarModal();

      expect(component.mostrarModal).toBe(false);
    });
  });

  describe('#guardarProducto', () => {
    it('should call service when editando is true and has product id', async () => {
      mockProductoService.actualizarStockVenta.mockReturnValue(of(dummyProductos[0]));
      fixture.detectChanges();
      await vi.advanceTimersByTimeAsync(300);

      component.editarProducto(dummyProductos[0]);
      component.productoForm.stockVenta = 50;
      component.guardarProducto();
      await vi.advanceTimersByTimeAsync(0);

      expect(mockProductoService.actualizarStockVenta).toHaveBeenCalledWith('PROD-1', 50);
      expect(component.mostrarModal).toBe(false);
    });

    it('should not call service if not editando', () => {
      fixture.detectChanges();
      component.abrirModalAgregar();
      component.guardarProducto();

      expect(mockProductoService.actualizarStockVenta).not.toHaveBeenCalled();
    });
  });

  it('should calculate state correctly', () => {
    expect(component.calcularEstado(dummyProductos[0])).toBe('disponible');
    expect(component.calcularEstado(dummyProductos[1])).toBe('bajo-stock');
    expect(component.calcularEstado(dummyProductos[2])).toBe('agotado');
  });
});