import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioimpedanciaViewComponent } from './bioimpedancia-view.component';

describe('BioimpedanciaViewComponent', () => {
  let component: BioimpedanciaViewComponent;
  let fixture: ComponentFixture<BioimpedanciaViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BioimpedanciaViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BioimpedanciaViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
