import { TestBed } from '@angular/core/testing';
import { TipoDocumentoService } from './tipo-documento.service';
import { describe, beforeEach, it, expect } from 'vitest';

describe('TipoDocumentoService', () => {
  let service: TipoDocumentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TipoDocumentoService]
    });
    service = TestBed.inject(TipoDocumentoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
