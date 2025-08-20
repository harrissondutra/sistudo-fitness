import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FitAgendaNovoComponent } from './fit-agenda-novo.component';

describe('FitAgendaNovoComponent', () => {
  let component: FitAgendaNovoComponent;
  let fixture: ComponentFixture<FitAgendaNovoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FitAgendaNovoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FitAgendaNovoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
