import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalRateFormComponent } from './legal-rate-form.component';

describe('LegalRateFormComponent', () => {
  let component: LegalRateFormComponent;
  let fixture: ComponentFixture<LegalRateFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LegalRateFormComponent]
    });
    fixture = TestBed.createComponent(LegalRateFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
