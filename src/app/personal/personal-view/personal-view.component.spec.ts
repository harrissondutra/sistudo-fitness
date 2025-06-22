import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalViewComponent } from './personal-view.component';

describe('PersonalViewComponent', () => {
  let component: PersonalViewComponent;
  let fixture: ComponentFixture<PersonalViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
