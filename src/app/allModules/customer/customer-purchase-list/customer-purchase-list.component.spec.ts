import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerPurchaseListComponent } from './customer-purchase-list.component';

describe('CustomerPurchaseListComponent', () => {
  let component: CustomerPurchaseListComponent;
  let fixture: ComponentFixture<CustomerPurchaseListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerPurchaseListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerPurchaseListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
