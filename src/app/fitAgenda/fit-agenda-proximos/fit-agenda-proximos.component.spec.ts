import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FitAgendaProximosComponent } from './fit-agenda-proximos.component';

describe('FitAgendaProximosComponent', () => {
  let component: FitAgendaProximosComponent;
  let fixture: ComponentFixture<FitAgendaProximosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FitAgendaProximosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FitAgendaProximosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
