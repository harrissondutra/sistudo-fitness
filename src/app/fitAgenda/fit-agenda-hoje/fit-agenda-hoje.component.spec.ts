import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FitAgendaHojeComponent } from './fit-agenda-hoje.component';

describe('FitAgendaHojeComponent', () => {
  let component: FitAgendaHojeComponent;
  let fixture: ComponentFixture<FitAgendaHojeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FitAgendaHojeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FitAgendaHojeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
