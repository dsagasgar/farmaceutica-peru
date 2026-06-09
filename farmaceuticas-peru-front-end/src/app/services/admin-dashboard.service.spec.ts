import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AdminDashboardService } from './admin-dashboard.service';
import { AdminStats, ActividadReciente } from '../models/types';
import { environment } from '../../environments/environment';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminDashboardService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(AdminDashboardService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getStats', () => {
    it('should return AdminStats', () => {
      const dummyStats: AdminStats = {
        totalUsuarios: 10,
        totalProductos: 200,
        ventasHoy: 5,
        ingresosHoy: 150.50
      };

      service.getStats().subscribe(stats => {
        expect(stats).toEqual(dummyStats);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/admin/dashboard/stats`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyStats);
    });
  });

  describe('#getActividadReciente', () => {
    it('should return ActividadReciente[]', () => {
      const dummyActivities: ActividadReciente[] = [
        {
          tipo: 'NUEVA_VENTA',
          descripcion: 'Venta #VENTA-1 por S/ 100.00',
          fecha: '2026-06-09T00:00:00',
          usuario: 'QUIMICO-1'
        }
      ];

      service.getActividadReciente().subscribe(activities => {
        expect(activities).toEqual(dummyActivities);
        expect(activities.length).toBe(1);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/admin/dashboard/activity`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyActivities);
    });
  });
});
