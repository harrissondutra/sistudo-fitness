import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientTrainningActiveComponent } from './client-trainning-active.component';

describe('ClientTrainningActiveComponent', () => {
  let component: ClientTrainningActiveComponent;
  let fixture: ComponentFixture<ClientTrainningActiveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClientTrainningActiveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClientTrainningActiveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
