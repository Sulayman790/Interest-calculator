import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateFirstAdminFormComponent } from './create-first-admin-form.component';

describe('CreateFirstAdminFormComponent', () => {
  let component: CreateFirstAdminFormComponent;
  let fixture: ComponentFixture<CreateFirstAdminFormComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateFirstAdminFormComponent]
    });
    fixture = TestBed.createComponent(CreateFirstAdminFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
