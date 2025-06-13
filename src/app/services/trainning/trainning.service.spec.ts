import { TestBed } from '@angular/core/testing';

import { TrainningService } from './trainning.service';

describe('TrainningService', () => {
  let service: TrainningService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrainningService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
