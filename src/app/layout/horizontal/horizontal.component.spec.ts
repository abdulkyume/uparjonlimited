import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalComponent } from './horizontal.component';

describe('HorizontalComponent', () => {
  let component: HorizontalComponent;
  let fixture: ComponentFixture<HorizontalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HorizontalComponent]
    });
    fixture = TestBed.createComponent(HorizontalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
