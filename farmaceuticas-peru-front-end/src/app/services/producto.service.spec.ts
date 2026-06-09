import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ProductoService } from './producto.service';
import { Producto } from '../models/types';
import { environment } from '../../environments/environment';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('ProductoService', () => {
  let service: ProductoService;
  let httpMock: HttpTestingController;

  const dummyProductos: Producto[] = [
    {
      id: 'PROD-1',
      codigo: 'P001',
      nombre: 'Paracetamol',
      descripcion: 'Para la fiebre',
      precioUnitario: 1.5,
      stock: 100,
      stockVenta: 40,
      categoria: 'Gastro',
      marca: 'Genfar',
      fechaVencimiento: '2028-12-31',
      lote: 'L100',
      formato: 'Pastilla'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductoService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ProductoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#buscarProductosParaVenta', () => {
    it('should query products for sale with parameters', () => {
      const term = 'Para';
      service.buscarProductosParaVenta(term).subscribe(productos => {
        expect(productos).toEqual(dummyProductos);
      });

      const req = httpMock.expectOne(request => 
        request.url === `${environment.apiUrl}/api/productos/venta` && 
        request.params.get('nombre') === term
      );
      expect(req.request.method).toBe('GET');
      req.flush(dummyProductos);
    });
  });

  describe('#buscarProductosParaAlmacen', () => {
    it('should query products for warehouse with parameters', () => {
      const term = 'Para';
      service.buscarProductosParaAlmacen(term).subscribe(productos => {
        expect(productos).toEqual(dummyProductos);
      });

      const req = httpMock.expectOne(request => 
        request.url === `${environment.apiUrl}/api/productos/almacen` && 
        request.params.get('nombre') === term
      );
      expect(req.request.method).toBe('GET');
      req.flush(dummyProductos);
    });
  });

  describe('#actualizarStockVenta', () => {
    it('should PUT and return updated product', () => {
      const productId = 'PROD-1';
      const newStock = 60;
      const updatedProduct: Producto = {
        ...dummyProductos[0],
        stockVenta: newStock
      };

      service.actualizarStockVenta(productId, newStock).subscribe(producto => {
        expect(producto).toEqual(updatedProduct);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/productos/${productId}/stock-venta`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({ stockVenta: newStock });
      req.flush(updatedProduct);
    });
  });
});
