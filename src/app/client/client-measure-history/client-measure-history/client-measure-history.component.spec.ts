import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientMeasureHistoryComponent } from './client-measure-history.component';

describe('ClientMeasureHistoryComponent', () => {
  let component: ClientMeasureHistoryComponent;
  let fixture: ComponentFixture<ClientMeasureHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientMeasureHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientMeasureHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
