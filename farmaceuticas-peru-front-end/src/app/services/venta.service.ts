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
  private apiUrl = `${environment.apiUrl}/ventas`;

  constructor() { }

  buscarOrdenPorId(id: string): Observable<Venta | undefined> {
    return this.http.get<Venta>(`${this.apiUrl}/${id}`);
  }

  registrarPago(id: string, cajeroId: string): Observable<Venta> {
    const payload = { cajeroId };
    // Se ajusta el método a PUT y la URL al endpoint correcto del backend.
    return this.http.put<Venta>(`${this.apiUrl}/${id}/registrar-pago`, payload);
  }

  crearVenta(nuevaVenta: Omit<Venta, 'id' | 'fecha' | 'status'>): Observable<Venta> {
    // El backend se encargará de generar el ID, la fecha y el estado inicial.
    return this.http.post<Venta>(this.apiUrl, nuevaVenta);
  }
}