import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AsnlistPrintDialogComponent } from './asnlist-print-dialog.component';

describe('AsnlistPrintDialogComponent', () => {
  let component: AsnlistPrintDialogComponent;
  let fixture: ComponentFixture<AsnlistPrintDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AsnlistPrintDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AsnlistPrintDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
