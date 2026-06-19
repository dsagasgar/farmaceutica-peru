import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
<<<<<<< HEAD
import { describe, beforeEach, it, expect, vi } from 'vitest';
=======
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';
>>>>>>> 0652eeafdcae90cc961c68f508293576b946145a

import { CajeroDashboardComponent } from './cajero-dashboard.component';
import { AuthService } from '../../../services/auth.service';
import { VentaService } from '../../../services/venta.service';
import { Usuario, Venta } from '../../../models/types';

<<<<<<< HEAD

=======
>>>>>>> 0652eeafdcae90cc961c68f508293576b946145a
describe('CajeroDashboardComponent', () => {
  let component: CajeroDashboardComponent;
  let fixture: ComponentFixture<CajeroDashboardComponent>;

  let mockAuthService: { obtenerUsuarioActual: any; logout: any };
  let mockVentaService: { buscarOrdenPorId: any; registrarPago: any };
  let mockRouter: { navigate: any };

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

<<<<<<< HEAD
  beforeEach(async () => {
=======
  beforeEach(() => {
    vi.useFakeTimers();

>>>>>>> 0652eeafdcae90cc961c68f508293576b946145a
    mockAuthService = {
      obtenerUsuarioActual: vi.fn().mockReturnValue(dummyUser),
      logout: vi.fn()
    };

    mockVentaService = {
      buscarOrdenPorId: vi.fn().mockReturnValue(of(null)),
      registrarPago: vi.fn().mockReturnValue(of(null))
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

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize and load logged user', async () => {
    fixture.detectChanges();
    await vi.advanceTimersByTimeAsync(0);

    expect(component).toBeTruthy();
    expect(component.usuario).toEqual(dummyUser);
  });

  describe('#buscarOrden', () => {
    it('should do nothing if ordenIdBusqueda is empty', async () => {
      fixture.detectChanges();
      component.ordenIdBusqueda = '';
      component.buscarOrden();
      await vi.advanceTimersByTimeAsync(0);

      expect(mockVentaService.buscarOrdenPorId).not.toHaveBeenCalled();
    });

    it('should set ordenSeleccionada on success', async () => {
      mockVentaService.buscarOrdenPorId.mockReturnValue(of(dummyVenta));
      fixture.detectChanges();
      
      component.ordenIdBusqueda = 'VENTA-1';
      component.buscarOrden();
      await vi.advanceTimersByTimeAsync(0);

      expect(mockVentaService.buscarOrdenPorId).toHaveBeenCalledWith('VENTA-1');
      expect(component.ordenSeleccionada).toEqual(dummyVenta);
      expect(component.buscando).toBe(false);
      expect(component.errorBusqueda).toBe('');
    });

    it('should set error message when no order is returned', async () => {
      mockVentaService.buscarOrdenPorId.mockReturnValue(of(null));
      fixture.detectChanges();
      
      component.ordenIdBusqueda = 'VENTA-1';
      component.buscarOrden();
      await vi.advanceTimersByTimeAsync(0);

      expect(component.ordenSeleccionada).toBeNull();
      expect(component.errorBusqueda).toContain('No se encontró ninguna orden');
    });

    it('should set error message on 404', async () => {
      mockVentaService.buscarOrdenPorId.mockReturnValue(throwError(() => ({ status: 404 })));
      fixture.detectChanges();
      
      component.ordenIdBusqueda = 'VENTA-404';
      component.buscarOrden();
      await vi.advanceTimersByTimeAsync(0);

      expect(component.ordenSeleccionada).toBeNull();
      expect(component.errorBusqueda).toContain('No se encontró ninguna orden');
    });

    it('should set generic error message on other errors', async () => {
      mockVentaService.buscarOrdenPorId.mockReturnValue(throwError(() => ({ status: 500 })));
      fixture.detectChanges();
      
      component.ordenIdBusqueda = 'VENTA-500';
      component.buscarOrden();
      await vi.advanceTimersByTimeAsync(0);

      expect(component.errorBusqueda).toContain('El servidor de Spring Boot denegó el acceso');
    });
  });

  describe('#registrarPago', () => {
    it('should not proceed if no order selected', async () => {
      fixture.detectChanges();
      component.registrarPago();
      await vi.advanceTimersByTimeAsync(0);

      expect(mockVentaService.registrarPago).not.toHaveBeenCalled();
    });

    it('should update order on successful payment registration', async () => {
      const updatedVenta: Venta = { ...dummyVenta, estado: 'PAGADO', cajeroId: 'CAJERO-1' };
      mockVentaService.registrarPago.mockReturnValue(of(updatedVenta));
      fixture.detectChanges();
      
      component.ordenSeleccionada = dummyVenta;
      component.registrarPago();
      await vi.advanceTimersByTimeAsync(0);

      expect(mockVentaService.registrarPago).toHaveBeenCalledWith(dummyVenta.id, dummyUser.id);
      expect(component.ordenSeleccionada).toEqual(updatedVenta);
      expect(component.procesandoPago).toBe(false);
    });

    it('should handle errors on payment registration', async () => {
      mockVentaService.registrarPago.mockReturnValue(throwError(() => new Error('Error al pagar')));
      fixture.detectChanges();
      
      component.ordenSeleccionada = dummyVenta;
      component.registrarPago();
      await vi.advanceTimersByTimeAsync(0);

      expect(component.errorPago).toBe('Error al pagar');
      expect(component.procesandoPago).toBe(false);
    });
  });

  it('should logout successfully', async () => {
    fixture.detectChanges();
    component.logout();
    await vi.advanceTimersByTimeAsync(0);

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});