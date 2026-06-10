import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { CajeroDashboardComponent } from './cajero-dashboard.component';
import { AuthService } from '../../../services/auth.service';
import { VentaService } from '../../../services/venta.service';
import { Usuario, Venta } from '../../../models/types';


describe('CajeroDashboardComponent', () => {
  let component: CajeroDashboardComponent;
  let fixture: ComponentFixture<CajeroDashboardComponent>;

  // Mocks
  let mockAuthService: any;
  let mockVentaService: any;
  let mockRouter: any;

  const dummyUser: Usuario = {
    id: 'CAJERO-1',
    email: 'cajero@farmacia.com',
    nombre: 'Carlos Cajero',
    rol: 'CAJERO'
  };

  const dummyVenta: Venta = {
    id: 'VENTA-1',
    fecha: '2026-06-09',
    items: [],
    itemsFormula: [],
    total: 100,
    quimicoId: 'QUIMICO-1',
    cajeroId: 'CAJERO-1',
    clienteNombre: 'Cliente Prueba',
    estado: 'PENDIENTE_PAGO'
  };

  beforeEach(async () => {
    mockAuthService = {
      obtenerUsuarioActual: vi.fn().mockReturnValue(dummyUser),
      logout: vi.fn()
    };

    mockVentaService = {
      buscarOrdenPorId: vi.fn(),
      registrarPago: vi.fn()
    };

    mockRouter = {
      navigate: vi.fn()
    };

    TestBed.overrideComponent(CajeroDashboardComponent, {
      set: {
        template: '',
        styles: []
      }
    });

    await TestBed.configureTestingModule({
      imports: [CajeroDashboardComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: VentaService, useValue: mockVentaService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CajeroDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should initialize and load logged user', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.usuario).toEqual(dummyUser);
  });

  describe('#buscarOrden', () => {
    it('should do nothing if ordenIdBusqueda is empty', () => {
      fixture.detectChanges();
      component.ordenIdBusqueda = '';
      component.buscarOrden();
      expect(mockVentaService.buscarOrdenPorId).not.toHaveBeenCalled();
    });

    it('should set ordenSeleccionada on success', () => {
      mockVentaService.buscarOrdenPorId.mockReturnValue(of(dummyVenta));
      fixture.detectChanges();
      component.ordenIdBusqueda = 'VENTA-1';
      component.buscarOrden();

      expect(mockVentaService.buscarOrdenPorId).toHaveBeenCalledWith('VENTA-1');
      expect(component.ordenSeleccionada).toEqual(dummyVenta);
      expect(component.buscando).toBe(false);
      expect(component.errorBusqueda).toBe('');
    });

    it('should set error message when no order is returned', () => {
      mockVentaService.buscarOrdenPorId.mockReturnValue(of(null));
      fixture.detectChanges();
      component.ordenIdBusqueda = 'VENTA-1';
      component.buscarOrden();

      expect(component.ordenSeleccionada).toBeNull();
      expect(component.errorBusqueda).toContain('No se encontró ninguna orden');
    });

    it('should set error message on 404', () => {
      mockVentaService.buscarOrdenPorId.mockReturnValue(throwError(() => ({ status: 404 })));
      fixture.detectChanges();
      component.ordenIdBusqueda = 'VENTA-404';
      component.buscarOrden();

      expect(component.ordenSeleccionada).toBeNull();
      expect(component.errorBusqueda).toContain('No se encontró ninguna orden');
    });

    it('should set generic error message on other errors', () => {
      mockVentaService.buscarOrdenPorId.mockReturnValue(throwError(() => ({ status: 500 })));
      fixture.detectChanges();
      component.ordenIdBusqueda = 'VENTA-500';
      component.buscarOrden();

      expect(component.errorBusqueda).toContain('El servidor de Spring Boot denegó el acceso');
    });
  });

  describe('#registrarPago', () => {
    it('should not proceed if no order selected', () => {
      fixture.detectChanges();
      component.registrarPago();
      expect(mockVentaService.registrarPago).not.toHaveBeenCalled();
    });

    it('should update order on successful payment registration', () => {
      const updatedVenta: Venta = { ...dummyVenta, estado: 'PAGADO', cajeroId: 'CAJERO-1' };
      mockVentaService.registrarPago.mockReturnValue(of(updatedVenta));
      
      fixture.detectChanges();
      component.ordenSeleccionada = dummyVenta;
      component.registrarPago();

      expect(mockVentaService.registrarPago).toHaveBeenCalledWith(dummyVenta.id, dummyUser.id);
      expect(component.ordenSeleccionada).toEqual(updatedVenta);
      expect(component.procesandoPago).toBe(false);
    });

    it('should handle errors on payment registration', () => {
      mockVentaService.registrarPago.mockReturnValue(throwError(() => new Error('Error al pagar')));
      
      fixture.detectChanges();
      component.ordenSeleccionada = dummyVenta;
      component.registrarPago();

      expect(component.errorPago).toBe('Error al pagar');
      expect(component.procesandoPago).toBe(false);
    });
  });

  it('should logout successfully', () => {
    fixture.detectChanges();
    component.logout();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
