import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainningCreateComponent } from './trainning-create.component';

describe('TrainningCreateComponent', () => {
  let component: TrainningCreateComponent;
  let fixture: ComponentFixture<TrainningCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainningCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TrainningCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
