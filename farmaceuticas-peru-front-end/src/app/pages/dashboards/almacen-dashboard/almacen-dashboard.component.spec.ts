import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { AlmacenDashboardComponent } from './almacen-dashboard.component';
import { AuthService } from '../../../services/auth.service';
import { CompraService } from '../../../services/compra.service';
import { ProductoService } from '../../../services/producto.service';
import { Usuario, CompraProveedor, Producto, ItemCompra } from '../../../models/types';

describe('AlmacenDashboardComponent', () => {
  let component: AlmacenDashboardComponent;
  let fixture: ComponentFixture<AlmacenDashboardComponent>;

  // Mocks
  let mockAuthService: any;
  let mockCompraService: any;
  let mockProductoService: any;
  let mockRouter: any;

  const dummyUser: Usuario = {
    id: 'ALMACEN-1',
    email: 'almacen@farmacia.com',
    nombre: 'Juan Almacenero',
    rol: 'ALMACENERO'
  };

  const dummyCompras: CompraProveedor[] = [
    {
      id: 'COMPRA-1',
      proveedor: 'Proveedor A',
      numeroFactura: 'FAC-100',
      fechaPedido: '2026-06-09',
      items: [
        {
          productoId: 'PROD-1',
          nombreProducto: 'Paracetamol',
          cantidadPedida: 100,
          costoUnitario: 1.5
        }
      ],
      total: 150,
      estado: 'PENDIENTE'
    }
  ];

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
      customName: 'Genfar',
      fechaVencimiento: '2028-12-31',
      lote: 'L100',
      formato: 'Pastilla',
      marca: 'Genfar'
    }
  ];

  beforeEach(() => {
    mockAuthService = {
      obtenerUsuarioActual: vi.fn().mockReturnValue(dummyUser),
      logout: vi.fn()
    };

    mockCompraService = {
      getComprasParaRecepcion: vi.fn().mockReturnValue(of(dummyCompras)),
      registrarRecepcion: vi.fn()
    };

    mockProductoService = {
      buscarProductosParaAlmacen: vi.fn().mockReturnValue(of(dummyProductos)),
      actualizarStockVenta: vi.fn()
    };

    mockRouter = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [AlmacenDashboardComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: CompraService, useValue: mockCompraService },
        { provide: ProductoService, useValue: mockProductoService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AlmacenDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should initialize and load warehouse data', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(mockAuthService.obtenerUsuarioActual).toHaveBeenCalled();
    expect(mockCompraService.getComprasParaRecepcion).toHaveBeenCalled();
    expect(mockProductoService.buscarProductosParaAlmacen).toHaveBeenCalledWith('');
    expect(component.compras).toEqual(dummyCompras);
    expect(component.productosGestion).toEqual(dummyProductos);
  });

  it('should handle selecting a purchase and going back', () => {
    fixture.detectChanges();
    component.seleccionarCompra(dummyCompras[0]);

    expect(component.compraSeleccionada).toEqual(dummyCompras[0]);
    expect(component.itemsVerificacion.length).toBe(1);
    expect(component.itemsVerificacion[0].cantidadRecibida).toBe(100);

    component.volverALista();
    expect(component.compraSeleccionada).toBeNull();
    expect(component.itemsVerificacion.length).toBe(0);
  });

  describe('#enviarVerificacion', () => {
    it('should call registrarRecepcion and reload on success', () => {
      mockCompraService.registrarRecepcion.mockReturnValue(of({} as CompraProveedor));
      fixture.detectChanges();
      
      component.seleccionarCompra(dummyCompras[0]);
      component.observaciones = 'Todo OK';
      component.enviarVerificacion();

      expect(mockCompraService.registrarRecepcion).toHaveBeenCalledWith(
        dummyCompras[0].id,
        component.itemsVerificacion,
        'Todo OK'
      );
      expect(component.procesando).toBe(false);
      expect(component.compraSeleccionada).toBeNull();
    });

    it('should set error message on failure', () => {
      mockCompraService.registrarRecepcion.mockReturnValue(throwError(() => new Error('Error de conexión')));
      fixture.detectChanges();

      component.seleccionarCompra(dummyCompras[0]);
      component.enviarVerificacion();

      expect(component.errorVerificacion).toBe('Error de conexión');
      expect(component.procesando).toBe(false);
    });
  });

  describe('#actualizarStockVenta', () => {
    it('should prevent stockVenta from exceeding physical stock', () => {
      fixture.detectChanges();
      const invalidProduct = { ...dummyProductos[0], stockVenta: 150, stock: 100 };
      
      component.actualizarStockVenta(invalidProduct);
      
      expect(component.mensajeErrorStock).toContain('no puede superar al stock total físico');
      expect(mockProductoService.actualizarStockVenta).not.toHaveBeenCalled();
    });

    it('should update stockVenta successfully', () => {
      const targetProduct = { ...dummyProductos[0] };
      mockProductoService.actualizarStockVenta.mockReturnValue(of(targetProduct));
      fixture.detectChanges();

      component.actualizarStockVenta(targetProduct);

      expect(mockProductoService.actualizarStockVenta).toHaveBeenCalledWith(targetProduct.id, targetProduct.stockVenta);
      expect(component.mensajeExitoStock).toContain('actualizado con éxito');
    });

    it('should handle service errors when updating stockVenta', () => {
      const targetProduct = { ...dummyProductos[0] };
      mockProductoService.actualizarStockVenta.mockReturnValue(throwError(() => new Error('Server error')));
      fixture.detectChanges();

      component.actualizarStockVenta(targetProduct);

      expect(component.mensajeErrorStock).toContain('Error de comunicación con el servidor');
    });
  });

  it('should track by product id and logout', () => {
    fixture.detectChanges();
    expect(component.trackByProductoId(0, dummyProductos[0])).toBe('PROD-1');

    component.logout();
    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
