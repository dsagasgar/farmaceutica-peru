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
  
  private apiUrl = `${environment.apiUrl}/api/compras`;

  getComprasParaRecepcion(): Observable<CompraProveedor[]> {
    return this.http.get<CompraProveedor[]>(`${this.apiUrl}/para-recepcion`);
  }

  registrarRecepcion(compraId: string, items: ItemCompra[], observaciones: string): Observable<CompraProveedor> {
    const payload = { items, observaciones };
    return this.http.post<CompraProveedor>(`${this.apiUrl}/${compraId}/registrar-recepcion`, payload);
  }
}