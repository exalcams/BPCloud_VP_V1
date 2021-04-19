import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SoccDialogComponent } from './socc-dialog.component';

describe('SoccDialogComponent', () => {
  let component: SoccDialogComponent;
  let fixture: ComponentFixture<SoccDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SoccDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SoccDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
