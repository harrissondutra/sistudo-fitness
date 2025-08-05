import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientProfessionalsComponent } from './client-professionals.component';

describe('ClientProfessionalsComponent', () => {
  let component: ClientProfessionalsComponent;
  let fixture: ComponentFixture<ClientProfessionalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientProfessionalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientProfessionalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
