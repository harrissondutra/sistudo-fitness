import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NutritionistListComponent } from './nutritionist-list.component';

describe('NutritionistListComponent', () => {
  let component: NutritionistListComponent;
  let fixture: ComponentFixture<NutritionistListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NutritionistListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NutritionistListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
