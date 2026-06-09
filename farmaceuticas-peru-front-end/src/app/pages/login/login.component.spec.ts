import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/types';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  // Mocks
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(() => {
    mockAuthService = {
      login: vi.fn()
    };

    mockRouter = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('#onLogin', () => {
    it('should show error if email or password are empty', () => {
      component.email = '';
      component.password = '';
      component.onLogin();

      expect(component.error).toBe('Por favor ingrese email y contraseña');
      expect(mockAuthService.login).not.toHaveBeenCalled();

      component.email = 'test@farmacia.com';
      component.password = '';
      component.onLogin();

      expect(component.error).toBe('Por favor ingrese email y contraseña');
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    const rolesAndRoutes = [
      { rol: 'ADMINISTRADOR', ruta: '/dashboard/administrador' },
      { rol: 'CAJERO', ruta: '/dashboard/cajero' },
      { rol: 'ALMACENERO', ruta: '/dashboard/almacen' },
      { rol: 'QUIMICO_FARMACEUTICO', ruta: '/dashboard/quimico' }
    ];

    rolesAndRoutes.forEach(({ rol, ruta }) => {
      it(`should login successfully and navigate to ${ruta} for role ${rol}`, () => {
        const dummyResponse = {
          jwt: 'mock-token',
          user: {
            id: 'U-1',
            email: 'user@farmacia.com',
            nombre: 'Juan Perez',
            rol: rol as any
          }
        };
        mockAuthService.login.mockReturnValue(of(dummyResponse));

        component.email = 'user@farmacia.com';
        component.password = 'password123';
        component.onLogin();

        expect(mockAuthService.login).toHaveBeenCalledWith('user@farmacia.com', 'password123');
        expect(component.procesando).toBe(false);
        expect(mockRouter.navigate).toHaveBeenCalledWith([ruta]);
      });
    });

    it('should handle 401 unauthorized error', () => {
      mockAuthService.login.mockReturnValue(throwError(() => ({ status: 401 })));

      component.email = 'wrong@farmacia.com';
      component.password = 'wrongpass';
      component.onLogin();

      expect(component.procesando).toBe(false);
      expect(component.error).toBe('Email o contraseña incorrectos.');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it('should handle generic server connection error', () => {
      mockVentaService: mockAuthService.login.mockReturnValue(throwError(() => ({ status: 500 })));

      component.email = 'fail@farmacia.com';
      component.password = 'pass';
      component.onLogin();

      expect(component.procesando).toBe(false);
      expect(component.error).toContain('No se pudo conectar con el servidor');
    });
  });
});
