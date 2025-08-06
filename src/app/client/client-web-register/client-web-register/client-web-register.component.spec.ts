import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientWebRegisterComponent } from './client-web-register.component';

describe('ClientWebRegisterComponent', () => {
  let component: ClientWebRegisterComponent;
  let fixture: ComponentFixture<ClientWebRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientWebRegisterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientWebRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
