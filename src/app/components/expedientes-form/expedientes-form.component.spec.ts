import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpedientesFormComponent } from './expedientes-form.component';

describe('ExpedientesFormComponent', () => {
  let component: ExpedientesFormComponent;
  let fixture: ComponentFixture<ExpedientesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpedientesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpedientesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
