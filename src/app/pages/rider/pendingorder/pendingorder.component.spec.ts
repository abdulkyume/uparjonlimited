import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingorderComponent } from './pendingorder.component';

describe('PendingorderComponent', () => {
  let component: PendingorderComponent;
  let fixture: ComponentFixture<PendingorderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PendingorderComponent]
    });
    fixture = TestBed.createComponent(PendingorderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
