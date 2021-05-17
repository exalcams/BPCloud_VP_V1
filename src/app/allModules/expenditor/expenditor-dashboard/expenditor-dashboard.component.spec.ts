import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExpenditorDashboardComponent } from './expenditor-dashboard.component';

describe('ExpenditorDashboardComponent', () => {
  let component: ExpenditorDashboardComponent;
  let fixture: ComponentFixture<ExpenditorDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExpenditorDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExpenditorDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
