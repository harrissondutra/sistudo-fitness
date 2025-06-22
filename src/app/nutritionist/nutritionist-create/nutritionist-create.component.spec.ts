import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionistCreateComponent } from './nutritionist-create.component';

describe('NutritionistCreateComponent', () => {
  let component: NutritionistCreateComponent;
  let fixture: ComponentFixture<NutritionistCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutritionistCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionistCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
