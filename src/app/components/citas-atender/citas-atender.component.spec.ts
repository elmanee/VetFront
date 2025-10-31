import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CitasAtenderComponent } from './citas-atender.component';

describe('CitasAtenderComponent', () => {
  let component: CitasAtenderComponent;
  let fixture: ComponentFixture<CitasAtenderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CitasAtenderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CitasAtenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
