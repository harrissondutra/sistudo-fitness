import { TestBed } from '@angular/core/testing';

import { FitAgendaService } from './fit-agenda.service';

describe('FitAgendaService', () => {
  let service: FitAgendaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FitAgendaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
