import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientMeasureComponent } from './client-measure.component';

describe('ClientMeasureComponent', () => {
  let component: ClientMeasureComponent;
  let fixture: ComponentFixture<ClientMeasureComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientMeasureComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientMeasureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
