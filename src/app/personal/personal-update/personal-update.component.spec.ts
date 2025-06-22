import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalUpdateComponent } from './personal-update.component';

describe('PersonalUpdateComponent', () => {
  let component: PersonalUpdateComponent;
  let fixture: ComponentFixture<PersonalUpdateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalUpdateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalUpdateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
