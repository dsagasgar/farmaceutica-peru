import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { AdminDashboardComponent } from './admin-dashboard.component';
import { AuthService } from '../../../services/auth.service';
import { AdminDashboardService } from '../../../services/admin-dashboard.service';
import { VentaService } from '../../../services/venta.service';
import { CompraService } from '../../../services/compra.service';
import { Usuario, AdminStats, ActividadReciente, Venta, CompraProveedor } from '../../../models/types';

describe('AdminDashboardComponent', () => {
  let component: AdminDashboardComponent;
  let fixture: ComponentFixture<AdminDashboardComponent>;
  
  // Mocks
  let mockAuthService: any;
  let mockDashboardService: any;
  let mockVentaService: any;
  let mockCompraService: any;
  let mockRouter: any;

  const dummyUser: Usuario = {
    id: 'ADMIN-1',
    email: 'admin@farmacia.com',
    nombre: 'Edwin Admin',
    rol: 'ADMINISTRADOR'
  };

  const dummyStats: AdminStats = {
    totalUsuarios: 10,
    totalProductos: 200,
    ventasHoy: 5,
    ingresosHoy: 150.50
  };

  const dummyActivities: ActividadReciente[] = [
    {
      tipo: 'NUEVA_VENTA',
      descripcion: 'Venta #VENTA-1 por S/ 100.00',
      fecha: '2026-06-09T00:00:00',
      usuario: 'QUIMICO-1'
    }
  ];

  beforeEach(async () => {
    mockAuthService = {
      obtenerUsuarioActual: vi.fn().mockReturnValue(dummyUser),
      logout: vi.fn()
    };

    mockDashboardService = {
      getStats: vi.fn().mockReturnValue(of(dummyStats)),
      getActividadReciente: vi.fn().mockReturnValue(of(dummyActivities))
    };

    mockVentaService = {
      buscarOrdenPorId: vi.fn()
    };

    mockCompraService = {
      getTodasLasCompras: vi.fn().mockReturnValue(of([]))
    };

    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AdminDashboardComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AdminDashboardService, useValue: mockDashboardService },
        { provide: VentaService, useValue: mockVentaService },
        { provide: CompraService, useValue: mockCompraService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should create the component and load initial stats', () => {
    fixture.detectChanges(); // Ejecuta ngOnInit
    
    expect(component).toBeTruthy();
    expect(mockAuthService.obtenerUsuarioActual).toHaveBeenCalled();
    expect(component.usuario).toEqual(dummyUser);
    
    expect(mockDashboardService.getStats).toHaveBeenCalled();
    expect(mockDashboardService.getActividadReciente).toHaveBeenCalled();
  });

  it('should change active tab and trigger historical purchases if tab is almacen', () => {
    const compras: CompraProveedor[] = [
      {
        id: 'COMPRA-1',
        proveedor: 'Droguería Central',
        numeroFactura: 'F-001',
        fechaPedido: '2026-06-01',
        items: [],
        total: 500,
        estado: 'ENTREGADO'
      }
    ];
    mockCompraService.getTodasLasCompras.mockReturnValue(of(compras));

    fixture.detectChanges(); // ngOnInit
    
    // Cambiar a pestaña ventas
    component.cambiarPestana('ventas');
    expect(component.pestanaActiva).toBe('ventas');
    expect(mockCompraService.getTodasLasCompras).not.toHaveBeenCalled();

    // Cambiar a pestaña almacen (debería cargar compras)
    component.cambiarPestana('almacen');
    expect(component.pestanaActiva).toBe('almacen');
    expect(mockCompraService.getTodasLasCompras).toHaveBeenCalled();
    expect(component.comprasAuditoria).toEqual(compras);
    expect(component.cargandoCompras).toBe(false);
  });

  describe('#consultarVentaEspecifica', () => {
    it('should do nothing if idVentaBusqueda is empty or only spaces', () => {
      fixture.detectChanges();
      component.idVentaBusqueda = '   ';
      component.consultarVentaEspecifica();
      expect(mockVentaService.buscarOrdenPorId).not.toHaveBeenCalled();
    });

    it('should fetch sale details on success', () => {
      const dummyVenta: Venta = {
        id: 'VENTA-1',
        fecha: '2026-06-09',
        items: [],
        itemsFormula: [],
        total: 100,
        quimicoId: 'QUIMICO-1',
        cajeroId: 'CAJERO-1',
        clienteNombre: 'Cliente Prueba',
        estado: 'PAGADO'
      };
      mockVentaService.buscarOrdenPorId.mockReturnValue(of(dummyVenta));

      fixture.detectChanges();
      component.idVentaBusqueda = 'VENTA-1';
      component.consultarVentaEspecifica();

      expect(mockVentaService.buscarOrdenPorId).toHaveBeenCalledWith('VENTA-1');
      expect(component.ventaAuditoria).toEqual(dummyVenta);
      expect(component.buscandoVenta).toBe(false);
      expect(component.errorVenta).toBe('');
    });

    it('should set error message when sale not found (404)', () => {
      const errorResponse = { status: 404 };
      mockVentaService.buscarOrdenPorId.mockReturnValue(throwError(() => errorResponse));

      fixture.detectChanges();
      component.idVentaBusqueda = 'VENTA-NOT-FOUND';
      component.consultarVentaEspecifica();

      expect(mockVentaService.buscarOrdenPorId).toHaveBeenCalledWith('VENTA-NOT-FOUND');
      expect(component.ventaAuditoria).toBeNull();
      expect(component.buscandoVenta).toBe(false);
      expect(component.errorVenta).toContain('No existe registro de venta con el identificador');
    });

    it('should set generic error message on network failure', () => {
      const errorResponse = { status: 500 };
      mockVentaService.buscarOrdenPorId.mockReturnValue(throwError(() => errorResponse));

      fixture.detectChanges();
      component.idVentaBusqueda = 'VENTA-FAIL';
      component.consultarVentaEspecifica();

      expect(component.errorVenta).toContain('Error de red al conectar con el servidor');
    });
  });

  describe('#logout', () => {
    it('should call authService logout and navigate to login page', () => {
      fixture.detectChanges();
      component.logout();

      expect(mockAuthService.logout).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });
});
