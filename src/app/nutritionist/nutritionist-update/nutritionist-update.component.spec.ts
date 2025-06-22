import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionistUpdateComponent } from './nutritionist-update.component';

describe('NutritionistUpdateComponent', () => {
  let component: NutritionistUpdateComponent;
  let fixture: ComponentFixture<NutritionistUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutritionistUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionistUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
