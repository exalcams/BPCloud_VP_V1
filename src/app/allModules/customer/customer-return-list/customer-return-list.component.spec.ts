import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerReturnListComponent } from './customer-return-list.component';

describe('CustomerReturnListComponent', () => {
  let component: CustomerReturnListComponent;
  let fixture: ComponentFixture<CustomerReturnListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomerReturnListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
