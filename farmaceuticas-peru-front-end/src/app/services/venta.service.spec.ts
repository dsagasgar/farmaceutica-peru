import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { VentaService } from './venta.service';
import { Venta, ItemVenta } from '../models/types';
import { environment } from '../../environments/environment';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('VentaService', () => {
  let service: VentaService;
  let httpMock: HttpTestingController;

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
    TestBed.configureTestingModule({
      providers: [
        VentaService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(VentaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#buscarOrdenPorId', () => {
    it('should return a Venta by id', () => {
      service.buscarOrdenPorId('VENTA-1').subscribe(venta => {
        expect(venta).toEqual(dummyVenta);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/ventas/VENTA-1`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyVenta);
    });
  });

  describe('#registrarPago', () => {
    it('should PUT to register payment and return updated Venta', () => {
      const updatedVenta: Venta = {
        ...dummyVenta,
        estado: 'PAGADO',
        cajeroId: 'CAJERO-1'
      };

      service.registrarPago('VENTA-1', 'CAJERO-1').subscribe(venta => {
        expect(venta).toEqual(updatedVenta);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/ventas/VENTA-1/registrar-pago`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ cajeroId: 'CAJERO-1' });
      req.flush(updatedVenta);
    });
  });

  describe('#crearVenta', () => {
    it('should POST to create a Venta and return it', () => {
      const nuevaVentaReq: Omit<Venta, 'id' | 'fecha' | 'estado' | 'cajeroId' | 'items'> & { 
        items: Omit<ItemVenta, 'id'>[] 
      } = {
        total: 100,
        quimicoId: 'QUIMICO-1',
        clienteNombre: 'Cliente Prueba',
        itemsFormula: [],
        items: [
          {
            productoId: 'PROD-1',
            nombreProducto: 'Paracetamol',
            cantidad: 10,
            precioUnitario: 10,
            subtotal: 100
          }
        ]
      };

      service.crearVenta(nuevaVentaReq).subscribe(venta => {
        expect(venta).toEqual(dummyVenta);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/ventas`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(nuevaVentaReq);
      req.flush(dummyVenta);
    });
  });
});
