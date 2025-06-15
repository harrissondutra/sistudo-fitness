import { TestBed } from '@angular/core/testing';

import { ExerciseCategoryService } from './exercise-category.service';

describe('ExerciseCategoryService', () => {
  let service: ExerciseCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExerciseCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
