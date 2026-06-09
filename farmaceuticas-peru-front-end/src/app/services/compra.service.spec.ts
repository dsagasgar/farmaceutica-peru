import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { CompraService } from './compra.service';
import { CompraProveedor, ItemCompra } from '../models/types';
import { environment } from '../../environments/environment';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('CompraService', () => {
  let service: CompraService;
  let httpMock: HttpTestingController;

  const dummyCompras: CompraProveedor[] = [
    {
      id: 'COMPRA-1',
      proveedor: 'Proveedor A',
      numeroFactura: 'FAC-100',
      fechaPedido: '2026-06-09',
      items: [],
      total: 1500,
      estado: 'PENDIENTE'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CompraService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(CompraService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getComprasParaRecepcion', () => {
    it('should return CompraProveedor[] for reception', () => {
      service.getComprasParaRecepcion().subscribe(compras => {
        expect(compras).toEqual(dummyCompras);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/compras/para-recepcion`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyCompras);
    });
  });

  describe('#registrarRecepcion', () => {
    it('should post and return updated CompraProveedor', () => {
      const purchaseId = 'COMPRA-1';
      const items: ItemCompra[] = [
        {
          productoId: 'PROD-1',
          nombreProducto: 'Paracetamol',
          cantidadPedida: 100,
          cantidadRecibida: 100,
          costoUnitario: 1.5
        }
      ];
      const observaciones = 'Todo conforme';
      const responseCompra: CompraProveedor = {
        ...dummyCompras[0],
        estado: 'RECIBIDO',
        observacionesAlmacen: observaciones
      };

      service.registrarRecepcion(purchaseId, items, observaciones).subscribe(compra => {
        expect(compra).toEqual(responseCompra);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/compras/${purchaseId}/registrar-recepcion`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ items, observaciones });
      req.flush(responseCompra);
    });
  });

  describe('#getTodasLasCompras', () => {
    it('should return all CompraProveedor[]', () => {
      service.getTodasLasCompras().subscribe(compras => {
        expect(compras).toEqual(dummyCompras);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/compras`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyCompras);
    });
  });
});
