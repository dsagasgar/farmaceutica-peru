import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

import { NuevoPedidoComponent } from './nuevo-pedido.component';
import { ProductoService } from '../../../services/producto.service';
import { VentaService } from '../../../services/venta.service';
import { AuthService } from '../../../services/auth.service';
import { Producto, Venta, Usuario } from '../../../models/types';

describe('NuevoPedidoComponent', () => {
  let component: NuevoPedidoComponent;
  let fixture: ComponentFixture<NuevoPedidoComponent>;

  let mockProductoService: any;
  let mockVentaService: any;
  let mockAuthService: any;

  const dummyUser: Usuario = {
    id: 'QUIMICO-1',
    email: 'quimico@farmacia.com',
    nombre: 'Quimico Farmaceutico',
    rol: 'QUIMICO_FARMACEUTICO'
  };

  const dummyProducto: Producto = {
    id: 'PROD-1',
    codigo: 'P001',
    nombre: 'Paracetamol',
    descripcion: 'Para la fiebre',
    precioUnitario: 10,
    stock: 100,
    stockVenta: 5,
    categoria: 'Gastro',
    marca: 'Genfar',
    fechaVencimiento: '2028-12-31',
    lote: 'L100',
    formato: 'Pastilla'
  };

  beforeEach(() => {
    vi.useFakeTimers();

    mockProductoService = {
      buscarProductosParaVenta: vi.fn().mockReturnValue(of([dummyProducto]))
    };

    mockVentaService = {
      crearVenta: vi.fn()
    };

    mockAuthService = {
      obtenerUsuarioActual: vi.fn().mockReturnValue(dummyUser)
    };

    TestBed.configureTestingModule({
      imports: [NuevoPedidoComponent],
      providers: [
        { provide: ProductoService, useValue: mockProductoService },
        { provide: VentaService, useValue: mockVentaService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NuevoPedidoComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize and subscribe to search terms', async () => {
    fixture.detectChanges();
    
    await vi.advanceTimersByTimeAsync(300); 
    
    expect(component).toBeTruthy();
    expect(component.usuario).toEqual(dummyUser);
    
    expect(mockProductoService.buscarProductosParaVenta).not.toHaveBeenCalled();
  });

  it('should push search term to searchTerms subject', async () => {
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(300); 

    mockProductoService.buscarProductosParaVenta.mockClear();

    component.terminoBusquedaProducto = 'Paracetamol';
    component.buscarProducto();

    await vi.advanceTimersByTimeAsync(150);
    expect(mockProductoService.buscarProductosParaVenta).toHaveBeenCalledTimes(0); 

    await vi.advanceTimersByTimeAsync(150); 
    expect(mockProductoService.buscarProductosParaVenta).toHaveBeenCalledTimes(1);
    expect(mockProductoService.buscarProductosParaVenta).toHaveBeenLastCalledWith('Paracetamol');
  });

  describe('Manage Products in Order', () => {
    it('should add product to order and handle limits', () => {
      fixture.detectChanges();

      component.agregarProducto(dummyProducto);
      expect(component.pedidoActual.length).toBe(1);
      expect(component.pedidoActual[0].cantidad).toBe(1);
      expect(component.totalPedido).toBe(10);

      component.agregarProducto(dummyProducto);
      expect(component.pedidoActual[0].cantidad).toBe(2);
      expect(component.totalPedido).toBe(20);

      component.pedidoActual[0].cantidad = 5;
      component.agregarProducto(dummyProducto);
      expect(component.pedidoActual[0].cantidad).toBe(5); 
    });

    it('should update quantity correctly if valid', () => {
      fixture.detectChanges();
      component.agregarProducto(dummyProducto);

      const mockEvent = {
        target: { value: '3' }
      } as unknown as Event;

      component.actualizarCantidad('PROD-1', mockEvent);
      expect(component.pedidoActual[0].cantidad).toBe(3);
      expect(component.totalPedido).toBe(30);
    });

    it('should reset input value to current quantity if invalid', () => {
      fixture.detectChanges();
      component.agregarProducto(dummyProducto);

      const target = { value: '10' }; 
      const mockEvent = { target } as unknown as Event;

      component.actualizarCantidad('PROD-1', mockEvent);
      expect(component.pedidoActual[0].cantidad).toBe(1); 
      expect(target.value).toBe('1');
    });

    it('should delete product from order', () => {
      fixture.detectChanges();
      component.agregarProducto(dummyProducto);
      expect(component.pedidoActual.length).toBe(1);

      component.eliminarProducto('PROD-1');
      expect(component.pedidoActual.length).toBe(0);
      expect(component.totalPedido).toBe(0);
    });
  });

  describe('Manage Formulas in Order', () => {
    it('should add formula if valid', () => {
      fixture.detectChanges();
      component.formulaActual = {
        nombre: 'Formula 1',
        composicion: 'Ingrediente A, B',
        procedimiento: 'Mezclar',
        precio: 50
      };

      component.agregarFormula();

      expect(component.formulasEnPedido.length).toBe(1);
      expect(component.formulasEnPedido[0].nombre).toBe('Formula 1');
      expect(component.totalPedido).toBe(50);
      expect(component.formulaActual.nombre).toBe('');
    });

    it('should not add formula if missing data', () => {
      fixture.detectChanges();
      component.formulaActual = {
        nombre: '',
        composicion: '',
        procedimiento: '',
        precio: 0
      };

      component.agregarFormula();
      expect(component.formulasEnPedido.length).toBe(0);
    });

    it('should delete formula', () => {
      fixture.detectChanges();
      component.formulasEnPedido = [
        { id: 'F-1', nombre: 'F1', composicion: 'C1', procedimiento: 'P1', precio: 50 }
      ];
      component.calcularTotal();
      expect(component.totalPedido).toBe(50);

      component.eliminarFormula('F-1');
      expect(component.formulasEnPedido.length).toBe(0);
      expect(component.totalPedido).toBe(0);
    });
  });

  describe('#generarOrden', () => {
    it('should do nothing if order is empty', () => {
      fixture.detectChanges();
      component.generarOrden();
      expect(mockVentaService.crearVenta).not.toHaveBeenCalled();
    });

    it('should call ventaService and emit event on success', async () => {
      const createdVenta = { id: 'VENTA-1' } as Venta;
      mockVentaService.crearVenta.mockReturnValue(of(createdVenta));
      
      let emittedVenta: Venta | undefined;
      component.pedidoGenerado.subscribe(v => emittedVenta = v);

      fixture.detectChanges();
      component.agregarProducto(dummyProducto);
      component.clienteNombre = 'Juan Perez';
      component.generarOrden();
      await vi.advanceTimersByTimeAsync(0);

      expect(mockVentaService.crearVenta).toHaveBeenCalled();
      expect(component.procesandoPedido).toBe(false);
      expect(emittedVenta).toEqual(createdVenta);
    });

    it('should display error message on backend failure', async () => {
      mockVentaService.crearVenta.mockReturnValue(throwError(() => new Error('Error de base de datos')));

      fixture.detectChanges();
      component.agregarProducto(dummyProducto);
      component.clienteNombre = 'Juan Perez';
      component.generarOrden();
      await vi.advanceTimersByTimeAsync(0);

      expect(component.procesandoPedido).toBe(false);
      expect(component.errorMensaje).toContain('Verifique el stock disponible');
    });
  });
});