import { TestBed } from '@angular/core/testing';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { describe, beforeEach, it, expect, vi } from 'vitest';

describe('authGuard', () => {
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(() => {
    mockAuthService = {
      obtenerUsuarioActual: vi.fn()
    };

    mockRouter = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    });
  });

  const executeGuard = (route: ActivatedRouteSnapshot) => {
    return TestBed.runInInjectionContext(() => authGuard(route, {} as any));
  };

  it('should return false and navigate to login when no user is authenticated', () => {
    mockAuthService.obtenerUsuarioActual.mockReturnValue(null);
    const mockRoute = { data: {} } as ActivatedRouteSnapshot;

    const result = executeGuard(mockRoute);

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return true when user is authenticated and no specific roles are required', () => {
    mockAuthService.obtenerUsuarioActual.mockReturnValue({ id: '1', rol: 'CAJERO' });
    const mockRoute = { data: {} } as ActivatedRouteSnapshot;

    const result = executeGuard(mockRoute);

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should return true when user has an allowed role', () => {
    mockAuthService.obtenerUsuarioActual.mockReturnValue({ id: '1', rol: 'ADMINISTRADOR' });
    const mockRoute = {
      data: { roles: ['ADMINISTRADOR', 'CAJERO'] }
    } as any as ActivatedRouteSnapshot;

    const result = executeGuard(mockRoute);

    expect(result).toBe(true);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
  });

  it('should return false and redirect to specific dashboard when user role is not allowed', () => {
    mockAuthService.obtenerUsuarioActual.mockReturnValue({ id: '1', rol: 'CAJERO' });
    const mockRoute = {
      data: { roles: ['ADMINISTRADOR'] }
    } as any as ActivatedRouteSnapshot;

    const result = executeGuard(mockRoute);

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard/cajero']);
  });

  it('should redirect to login if user role is not allowed and not mapped in dashboard paths', () => {
    mockAuthService.obtenerUsuarioActual.mockReturnValue({ id: '1', rol: 'UNKNOWN_ROLE' });
    const mockRoute = {
      data: { roles: ['ADMINISTRADOR'] }
    } as any as ActivatedRouteSnapshot;

    const result = executeGuard(mockRoute);

    expect(result).toBe(false);
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });
});
