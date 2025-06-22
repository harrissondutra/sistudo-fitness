import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalCreateComponent } from './personal-create.component';

describe('PersonalCreateComponent', () => {
  let component: PersonalCreateComponent;
  let fixture: ComponentFixture<PersonalCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
