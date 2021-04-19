import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateAttachmentComponent } from './update-attachment.component';

describe('UpdateAttachmentComponent', () => {
  let component: UpdateAttachmentComponent;
  let fixture: ComponentFixture<UpdateAttachmentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateAttachmentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateAttachmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
