import { TestBed } from '@angular/core/testing';

import { CategoryExerciseService } from './category-exercise.service';

describe('CategoryExerciseService', () => {
  let service: CategoryExerciseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CategoryExerciseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
