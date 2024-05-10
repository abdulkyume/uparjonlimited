import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqcrudComponent } from './faqcrud.component';

describe('FaqcrudComponent', () => {
  let component: FaqcrudComponent;
  let fixture: ComponentFixture<FaqcrudComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FaqcrudComponent]
    });
    fixture = TestBed.createComponent(FaqcrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
