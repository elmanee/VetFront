import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FooterAuxiliarComponent } from './footer-auxiliar.component';

describe('FooterAuxiliarComponent', () => {
  let component: FooterAuxiliarComponent;
  let fixture: ComponentFixture<FooterAuxiliarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FooterAuxiliarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FooterAuxiliarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
