import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PickdropzoneComponent } from './pickdropzone.component';

describe('PickdropzoneComponent', () => {
  let component: PickdropzoneComponent;
  let fixture: ComponentFixture<PickdropzoneComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PickdropzoneComponent]
    });
    fixture = TestBed.createComponent(PickdropzoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
