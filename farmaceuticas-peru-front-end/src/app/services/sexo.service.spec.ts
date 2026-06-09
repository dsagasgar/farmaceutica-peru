import { TestBed } from '@angular/core/testing';
import { SexoService } from './sexo.service';
import { describe, beforeEach, it, expect } from 'vitest';

describe('SexoService', () => {
  let service: SexoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SexoService]
    });
    service = TestBed.inject(SexoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
