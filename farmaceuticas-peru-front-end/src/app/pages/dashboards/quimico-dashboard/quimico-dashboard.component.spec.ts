import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { QuimicoDashboardComponent } from './quimico-dashboard.component';
import { AuthService } from '../../../services/auth.service';
import { Usuario, Venta } from '../../../models/types';

describe('QuimicoDashboardComponent', () => {
  let component: QuimicoDashboardComponent;
  let fixture: ComponentFixture<QuimicoDashboardComponent>;

  // Mocks
  let mockAuthService: any;
  let mockRouter: any;

  const dummyUser: Usuario = {
    id: 'QUIMICO-1',
    email: 'quimico@farmacia.com',
    nombre: 'Quimico Farmaceutico',
    rol: 'QUIMICO_FARMACEUTICO'
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

  beforeEach(() => {
    mockAuthService = {
      obtenerUsuarioActual: vi.fn().mockReturnValue(dummyUser),
      logout: vi.fn()
    };

    mockRouter = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [QuimicoDashboardComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(QuimicoDashboardComponent);
    component = fixture.componentInstance;
  });

  it('should initialize and load chemical user', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.usuario).toEqual(dummyUser);
    expect(component.mostrandoFormularioPedido).toBe(false);
  });

  it('should start a new order', () => {
    fixture.detectChanges();
    component.iniciarNuevoPedido();

    expect(component.mostrandoFormularioPedido).toBe(true);
    expect(component.ordenGenerada).toBeNull();
  });

  it('should handle order generated event', () => {
    fixture.detectChanges();
    component.onPedidoGenerado(dummyVenta);

    expect(component.ordenGenerada).toEqual(dummyVenta);
    expect(component.mostrandoFormularioPedido).toBe(false);
  });

  it('should handle order cancellation', () => {
    fixture.detectChanges();
    component.mostrandoFormularioPedido = true;
    component.onCancelarPedido();

    expect(component.mostrandoFormularioPedido).toBe(false);
  });

  it('should logout successfully', () => {
    fixture.detectChanges();
    component.logout();

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
