import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PersonaRequest, PersonaResponse } from '../models/types';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/persona`;

  getPersonas(): Observable<PersonaResponse[]> {
    return this.http.get<PersonaResponse[]>(this.apiUrl);
  }

  findPersonaById(idPersona: number): Observable<PersonaResponse> {
    return this.http.request<PersonaResponse>('GET', `${this.apiUrl}/find`, {
      body: { idPersona }
    });
  }

  findByNumDocumento(numDocumento: string): Observable<PersonaResponse> {
    return this.http.request<PersonaResponse>('GET', `${this.apiUrl}/findNumdocumento`, {
      body: { numDocumento }
    });
  }

  insertPersona(persona: PersonaRequest): Observable<PersonaResponse> {
    return this.http.post<PersonaResponse>(this.apiUrl, persona);
  }

  updatePersona(persona: PersonaRequest): Observable<PersonaResponse> {
    return this.http.put<PersonaResponse>(this.apiUrl, persona);
  }

  deletePersona(idPersona: number): Observable<PersonaResponse> {
    return this.http.request<PersonaResponse>('DELETE', this.apiUrl, {
      body: { idPersona }
    });
  }
}