import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientMeasureViewComponent } from './client-measure-view.component';

describe('ClientMeasureViewComponent', () => {
  let component: ClientMeasureViewComponent;
  let fixture: ComponentFixture<ClientMeasureViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientMeasureViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientMeasureViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
