import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BioimpedanciaCreateComponent } from './bioimpedancia-create.component';

describe('BioimpedanciaCreateComponent', () => {
  let component: BioimpedanciaCreateComponent;
  let fixture: ComponentFixture<BioimpedanciaCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BioimpedanciaCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BioimpedanciaCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
