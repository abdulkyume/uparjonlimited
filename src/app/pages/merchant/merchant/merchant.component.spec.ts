import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MerchantComponent } from './merchant.component';

describe('MerchantComponent', () => {
  let component: MerchantComponent;
  let fixture: ComponentFixture<MerchantComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MerchantComponent]
    });
    fixture = TestBed.createComponent(MerchantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
