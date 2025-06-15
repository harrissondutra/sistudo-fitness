import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateExerciseComponent } from './create-exercise.component';

describe('CreateExerciseComponent', () => {
  let component: CreateExerciseComponent;
  let fixture: ComponentFixture<CreateExerciseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateExerciseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateExerciseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
