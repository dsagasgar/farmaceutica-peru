import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta, ItemVenta } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/ventas`;

  buscarOrdenPorId(id: string): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}`);
  }

  registrarPago(id: string, cajeroId: string): Observable<Venta> {
    const payload = { cajeroId };
    return this.http.put<Venta>(`${this.apiUrl}/${id}/registrar-pago`, payload);
  }

  crearVenta(
    nuevaVenta: Omit<Venta, 'id' | 'fecha' | 'estado' | 'cajeroId' | 'items'> & { 
      items: Omit<ItemVenta, 'id'>[] 
    }
  ): Observable<Venta> {
    return this.http.post<Venta>(this.apiUrl, nuevaVenta);
  }
}