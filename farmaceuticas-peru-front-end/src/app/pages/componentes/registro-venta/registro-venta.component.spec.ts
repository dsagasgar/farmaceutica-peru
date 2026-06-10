import { TestBed, ComponentFixture } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { RegisterVentaComponent } from './registro-venta.component';
import { VentaService } from '../../../services/venta.service';
import { AuthService } from '../../../services/auth.service';
import { Venta, Usuario } from '../../../models/types';

describe('RegisterVentaComponent', () => {
  let component: RegisterVentaComponent;
  let fixture: ComponentFixture<RegisterVentaComponent>;

  // Mocks
  let mockVentaService: any;
  let mockAuthService: any;

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
    cajeroId: '',
    clienteNombre: 'Cliente Prueba',
    estado: 'PENDIENTE_PAGO'
  };

  beforeEach(async () => {
    mockVentaService = {
      buscarOrdenPorId: vi.fn(),
      registrarPago: vi.fn()
    };

    mockAuthService = {
      obtenerUsuarioActual: vi.fn().mockReturnValue(dummyUser)
    };

    await TestBed.configureTestingModule({
      imports: [RegisterVentaComponent],
      providers: [
        { provide: VentaService, useValue: mockVentaService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterVentaComponent);
    component = fixture.componentInstance;
  });

  it('should initialize and load cajero user', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.usuarioCajero).toEqual(dummyUser);
  });

  describe('#buscarOrden', () => {
    it('should do nothing if search ID is empty', () => {
      fixture.detectChanges();
      component.buscarTicketId = '   ';
      component.buscarOrden();

      expect(mockVentaService.buscarOrdenPorId).not.toHaveBeenCalled();
    });

    it('should set ordenActual if pending payment', () => {
      mockVentaService.buscarOrdenPorId.mockReturnValue(of(dummyVenta));
      fixture.detectChanges();
      component.buscarTicketId = 'VENTA-1';
      component.buscarOrden();

      expect(mockVentaService.buscarOrdenPorId).toHaveBeenCalledWith('VENTA-1');
      expect(component.ordenActual).toEqual(dummyVenta);
      expect(component.mensajeError).toBe('');
    });

    it('should set error message if order status is not PENDIENTE_PAGO', () => {
      const alreadyPaidVenta: Venta = { ...dummyVenta, estado: 'PAGADO' };
      mockVentaService.buscarOrdenPorId.mockReturnValue(of(alreadyPaidVenta));
      
      fixture.detectChanges();
      component.buscarTicketId = 'VENTA-1';
      component.buscarOrden();

      expect(component.ordenActual).toBeNull();
      expect(component.mensajeError).toContain('ya se encuentra en estado: PAGADO');
    });

    it('should set error message if search fails', () => {
      mockVentaService.buscarOrdenPorId.mockReturnValue(throwError(() => new Error('Not found')));
      
      fixture.detectChanges();
      component.buscarTicketId = 'VENTA-NOT-FOUND';
      component.buscarOrden();

      expect(component.ordenActual).toBeNull();
      expect(component.mensajeError).toContain('No se encontró ninguna orden pendiente');
    });
  });

  describe('#emitirTicket', () => {
    it('should not call service if no active order', () => {
      fixture.detectChanges();
      component.emitirTicket();
      expect(mockVentaService.registrarPago).not.toHaveBeenCalled();
    });

    it('should pay and clear form on success', () => {
      const paidVenta: Venta = { ...dummyVenta, estado: 'PAGADO', cajeroId: 'CAJERO-1' };
      mockVentaService.registrarPago.mockReturnValue(of(paidVenta));

      fixture.detectChanges();
      component.ordenActual = dummyVenta;
      component.emitirTicket();

      expect(mockVentaService.registrarPago).toHaveBeenCalledWith(dummyVenta.id, dummyUser.id);
      expect(component.procesandoPago).toBe(false);
      expect(component.mensajeExito).toContain('Cobro procesado con éxito');
      expect(component.ordenActual).toBeNull();
      expect(component.buscarTicketId).toBe('');
    });

    it('should display error message on backend failure', () => {
      mockVentaService.registrarPago.mockReturnValue(throwError(() => new Error('Server error')));

      fixture.detectChanges();
      component.ordenActual = dummyVenta;
      component.emitirTicket();

      expect(component.procesandoPago).toBe(false);
      expect(component.mensajeError).toContain('Hubo un problema al registrar el pago');
      expect(component.ordenActual).toEqual(dummyVenta); // No se limpia
    });
  });

  it('should clear form values on limpiarFormulario', () => {
    fixture.detectChanges();
    component.buscarTicketId = 'ID-123';
    component.ordenActual = dummyVenta;

    component.limpiarFormulario();

    expect(component.buscarTicketId).toBe('');
    expect(component.ordenActual).toBeNull();
  });
});
