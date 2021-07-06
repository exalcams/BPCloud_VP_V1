import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VendorReconciliationComponent } from './vendor-reconciliation.component';

describe('VendorReconciliationComponent', () => {
  let component: VendorReconciliationComponent;
  let fixture: ComponentFixture<VendorReconciliationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VendorReconciliationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VendorReconciliationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
