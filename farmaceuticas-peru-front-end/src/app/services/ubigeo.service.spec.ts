import { TestBed } from '@angular/core/testing';
import { UbigeoService } from './ubigeo.service';
import { describe, beforeEach, it, expect } from 'vitest';

describe('UbigeoService', () => {
  let service: UbigeoService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UbigeoService]
    });
    service = TestBed.inject(UbigeoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
