import { TestBed } from '@angular/core/testing';

import { CedulaVerificationService } from './cedula-verification.service';

describe('CedulaVerificationService', () => {
  let service: CedulaVerificationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CedulaVerificationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
