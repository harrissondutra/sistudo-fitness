import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTrainningInactiveComponent } from './client-trainning-inactive.component';

describe('ClientTrainningInactiveComponent', () => {
  let component: ClientTrainningInactiveComponent;
  let fixture: ComponentFixture<ClientTrainningInactiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTrainningInactiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTrainningInactiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
