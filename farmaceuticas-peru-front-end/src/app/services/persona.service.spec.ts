import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PersonaService } from './persona.service';
import { PersonaRequest, PersonaResponse } from '../models/types';
import { environment } from '../../environments/environment';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('PersonaService', () => {
  let service: PersonaService;
  let httpMock: HttpTestingController;

  const dummyPersonas: PersonaResponse[] = [
    {
      idPersona: 1,
      nombres: 'Juan',
      apellidoPaterno: 'Perez',
      apellidoMaterno: 'Gomez',
      numDocumento: '12345678',
      telefono: '987654321',
      direccion: 'Av. Siempre Viva 123',
      sexoDescripcion: 'Masculino',
      tipoDocumentoDescripcion: 'DNI',
      ubigeoDescripcion: 'Lima - Lima - Lima'
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PersonaService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PersonaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('#getPersonas', () => {
    it('should return PersonaResponse[]', () => {
      service.getPersonas().subscribe(personas => {
        expect(personas).toEqual(dummyPersonas);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/persona`);
      expect(req.request.method).toBe('GET');
      req.flush(dummyPersonas);
    });
  });

  describe('#findPersonaById', () => {
    it('should request persona by id in body', () => {
      service.findPersonaById(1).subscribe(persona => {
        expect(persona).toEqual(dummyPersonas[0]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/persona/find`);
      expect(req.request.method).toBe('GET');
      expect(req.request.body).toEqual({ idPersona: 1 });
      req.flush(dummyPersonas[0]);
    });
  });

  describe('#findByNumDocumento', () => {
    it('should request persona by document number in body', () => {
      service.findByNumDocumento('12345678').subscribe(persona => {
        expect(persona).toEqual(dummyPersonas[0]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/persona/findNumdocumento`);
      expect(req.request.method).toBe('GET');
      expect(req.request.body).toEqual({ numDocumento: '12345678' });
      req.flush(dummyPersonas[0]);
    });
  });

  describe('#insertPersona', () => {
    it('should insert and return PersonaResponse', () => {
      const personaReq: PersonaRequest = {
        nombres: 'Juan',
        apellidoPaterno: 'Perez',
        numDocumento: '12345678'
      };

      service.insertPersona(personaReq).subscribe(persona => {
        expect(persona).toEqual(dummyPersonas[0]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/persona`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(personaReq);
      req.flush(dummyPersonas[0]);
    });
  });

  describe('#updatePersona', () => {
    it('should update and return PersonaResponse', () => {
      const personaReq: PersonaRequest = {
        idPersona: 1,
        nombres: 'Juan Carlos',
        apellidoPaterno: 'Perez',
        numDocumento: '12345678'
      };
      const updatedPersona: PersonaResponse = {
        ...dummyPersonas[0],
        nombres: 'Juan Carlos'
      };

      service.updatePersona(personaReq).subscribe(persona => {
        expect(persona).toEqual(updatedPersona);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/persona`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(personaReq);
      req.flush(updatedPersona);
    });
  });

  describe('#deletePersona', () => {
    it('should delete persona and return PersonaResponse', () => {
      service.deletePersona(1).subscribe(persona => {
        expect(persona).toEqual(dummyPersonas[0]);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/api/v1/persona`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.body).toEqual({ idPersona: 1 });
      req.flush(dummyPersonas[0]);
    });
  });
});
