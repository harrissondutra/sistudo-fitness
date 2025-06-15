import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InactiveTrainningComponent } from './inactive-trainning.component';

describe('InactiveTrainningComponent', () => {
  let component: InactiveTrainningComponent;
  let fixture: ComponentFixture<InactiveTrainningComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InactiveTrainningComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InactiveTrainningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
