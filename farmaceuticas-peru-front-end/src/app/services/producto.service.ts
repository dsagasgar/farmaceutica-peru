import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Producto } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/productos`;

  // Para la vista del QF
  buscarProductosParaVenta(term: string): Observable<Producto[]> {
    const params = new HttpParams().set('nombre', term);
    return this.http.get<Producto[]>(`${this.apiUrl}/venta`, { params });
  }

  // Para la vista del Almacenero/Admin
  buscarProductosParaAlmacen(term: string): Observable<Producto[]> {
    const params = new HttpParams().set('nombre', term);
    return this.http.get<Producto[]>(`${this.apiUrl}/almacen`, { params });
  }

  actualizarStockVenta(id: string, stockVenta: number): Observable<Producto> {
    return this.http.put<Producto>(`${this.apiUrl}/${id}/stock-venta`, { stockVenta });
  }
}