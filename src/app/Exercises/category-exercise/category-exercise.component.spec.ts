import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CategoryExerciseComponent } from './category-exercise.component';

describe('CategoryExerciseComponent', () => {
  let component: CategoryExerciseComponent;
  let fixture: ComponentFixture<CategoryExerciseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryExerciseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CategoryExerciseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
