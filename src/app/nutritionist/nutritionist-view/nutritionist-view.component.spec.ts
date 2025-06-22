import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionistViewComponent } from './nutritionist-view.component';

describe('NutritionistViewComponent', () => {
  let component: NutritionistViewComponent;
  let fixture: ComponentFixture<NutritionistViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutritionistViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionistViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
