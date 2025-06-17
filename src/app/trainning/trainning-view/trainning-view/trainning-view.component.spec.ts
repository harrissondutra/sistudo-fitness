import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainningViewComponent } from './trainning-view.component';

describe('TrainningViewComponent', () => {
  let component: TrainningViewComponent;
  let fixture: ComponentFixture<TrainningViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainningViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainningViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
