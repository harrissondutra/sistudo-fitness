import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorPatientListComponent } from './doctor-patient-list.component';

describe('DoctorPatientListComponent', () => {
  let component: DoctorPatientListComponent;
  let fixture: ComponentFixture<DoctorPatientListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DoctorPatientListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DoctorPatientListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
