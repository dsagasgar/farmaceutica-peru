import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService, Usuario } from './auth.service';
import { environment } from '../../environments/environment';
import { describe, beforeEach, afterEach, it, expect, vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let mockRouter: any;

  const dummyUser: Usuario = {
    id: '1',
    email: 'test@farmacia.com',
    nombre: 'Test User',
    rol: 'ADMINISTRADOR'
  };

  beforeEach(() => {
    mockRouter = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: mockRouter }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#login', () => {
    it('should login successfully and save session details in localStorage', () => {
      const email = 'test@farmacia.com';
      const password = 'password';
      const dummyResponse = {
        jwt: 'mock-jwt-token',
        user: dummyUser
      };

      service.login(email, password).subscribe(response => {
        expect(response).toEqual(dummyResponse);
        expect(localStorage.getItem('token')).toBe('mock-jwt-token');
        expect(localStorage.getItem('usuario')).toBe(JSON.stringify(dummyUser));
        expect(service.obtenerUsuarioActual()).toEqual(dummyUser);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/auth/login`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ email, password });
      req.flush(dummyResponse);
    });
  });

  describe('#logout', () => {
    it('should clear session details from localStorage and navigate to login', () => {
      localStorage.setItem('token', 'mock-jwt-token');
      localStorage.setItem('usuario', JSON.stringify(dummyUser));

      (service as any).cargarSesion();
      expect(service.obtenerUsuarioActual()).toEqual(dummyUser);

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('usuario')).toBeNull();
      expect(service.obtenerUsuarioActual()).toBeNull();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('#getToken', () => {
    it('should return the token from localStorage', () => {
      localStorage.setItem('token', 'mock-jwt-token');
      expect(service.getToken()).toBe('mock-jwt-token');
    });

    it('should return null if no token is saved', () => {
      expect(service.getToken()).toBeNull();
    });
  });
});
