import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpedintesComponent } from './expedintes.component';

describe('ExpedintesComponent', () => {
  let component: ExpedintesComponent;
  let fixture: ComponentFixture<ExpedintesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExpedintesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExpedintesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
