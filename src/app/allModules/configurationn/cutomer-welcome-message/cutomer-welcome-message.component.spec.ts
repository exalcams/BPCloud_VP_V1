import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CutomerWelcomeMessageComponent } from './cutomer-welcome-message.component';

describe('CutomerWelcomeMessageComponent', () => {
  let component: CutomerWelcomeMessageComponent;
  let fixture: ComponentFixture<CutomerWelcomeMessageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CutomerWelcomeMessageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CutomerWelcomeMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
