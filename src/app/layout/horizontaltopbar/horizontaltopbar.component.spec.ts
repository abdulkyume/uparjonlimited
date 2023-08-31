import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontaltopbarComponent } from './horizontaltopbar.component';

describe('HorizontaltopbarComponent', () => {
  let component: HorizontaltopbarComponent;
  let fixture: ComponentFixture<HorizontaltopbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HorizontaltopbarComponent]
    });
    fixture = TestBed.createComponent(HorizontaltopbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
