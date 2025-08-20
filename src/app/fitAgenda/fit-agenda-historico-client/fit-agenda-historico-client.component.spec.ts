import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FitAgendaHistoricoClientComponent } from './fit-agenda-historico-client.component';

describe('FitAgendaHistoricoClientComponent', () => {
  let component: FitAgendaHistoricoClientComponent;
  let fixture: ComponentFixture<FitAgendaHistoricoClientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FitAgendaHistoricoClientComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FitAgendaHistoricoClientComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
