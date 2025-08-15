import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioimpedanciaHistoryComponent } from './bioimpedancia-history.component';

describe('BioimpedanciaHistoryComponent', () => {
  let component: BioimpedanciaHistoryComponent;
  let fixture: ComponentFixture<BioimpedanciaHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BioimpedanciaHistoryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BioimpedanciaHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
