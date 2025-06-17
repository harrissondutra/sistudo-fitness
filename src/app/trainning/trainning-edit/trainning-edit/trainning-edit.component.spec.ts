import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainningEditComponent } from './trainning-edit.component';

describe('TrainningEditComponent', () => {
  let component: TrainningEditComponent;
  let fixture: ComponentFixture<TrainningEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainningEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainningEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
