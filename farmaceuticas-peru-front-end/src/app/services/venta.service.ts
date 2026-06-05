import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Venta } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VentaService {
  private http = inject(HttpClient);
  // 1. CORREGIDO: Se añade /api para mapear el @RequestMapping del controlador
  private apiUrl = `${environment.apiUrl}/api/ventas`; 

  // 2. CORREGIDO: Retorna directamente un Observable<Venta>
  buscarOrdenPorId(id: string): Observable<Venta> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}`);
  }

  registrarPago(id: string, cajeroId: string): Observable<Venta> {
    const payload = { cajeroId };
    return this.http.put<Venta>(`${this.apiUrl}/${id}/registrar-pago`, payload);
  }

  // 3. CORREGIDO: Se cambia 'status' por 'estado' para reflejar el modelo de Spring Boot
  crearVenta(nuevaVenta: Omit<Venta, 'id' | 'fecha' | 'estado'>): Observable<Venta> {
    return this.http.post<Venta>(this.apiUrl, nuevaVenta);
  }
}