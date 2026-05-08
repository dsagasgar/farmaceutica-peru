import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CompraProveedor, ItemCompra } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompraService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/compras`;

  getComprasParaRecepcion(): Observable<CompraProveedor[]> {
    return this.http.get<CompraProveedor[]>(`${this.apiUrl}/para-recepcion`);
  }

  registrarRecepcion(compraId: string, items: ItemCompra[], observaciones: string): Observable<void> {
    const payload = { items, observaciones };
    return this.http.post<void>(`${this.apiUrl}/${compraId}/registrar-recepcion`, payload);
  }
}