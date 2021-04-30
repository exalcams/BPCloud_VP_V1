import { animate, style, transition, trigger } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { CAPADialogResponse, CAPAReqItem, CAPAResponseView } from 'app/models/CAPA';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';

@Component({
  selector: 'app-capa-response-dialog',
  templateUrl: './capa-response-dialog.component.html',
  styleUrls: ['./capa-response-dialog.component.scss'],
  encapsulation:ViewEncapsulation.None
})
export class CapaResponseDialogComponent implements OnInit {

  TextAreaMinRow = 5;
  TextAreaMaxRow = 10;
  MinDate:Date;
  ResponseFormGroup: FormGroup;
  ResponseDetails: CAPAResponseView;
  ResponseStatus = ["Resolved", "Differed"];
  Files: File;
  Fileslist: File[] = [];
  IsAttachmentRequried: any;
  IsDueDateRequried: any;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  SelectTiggerd=null;

  constructor(private dialog: MatDialog,
    private _datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public Item: CAPADialogResponse,
    public matDialogRef: MatDialogRef<CapaResponseDialogComponent>,
    private _formBuilder: FormBuilder, public snackBar: MatSnackBar) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.ResponseDetails = new CAPAResponseView();
  }

  ngOnInit() {
    this.InitializeResponseFormGroup();
    this.LoadDialogData();
  }
  InitializeResponseFormGroup(): void {
    this.ResponseFormGroup = this._formBuilder.group({
      Text: ['', Validators.required],
      DueDate: ['', Validators.required],
      Status: ['', Validators.required]
    });
    this.ResponseFormGroup.get('DueDate').disable();
  }
  SelectToggled()
  {
    // if(this.ResponseStatus.length >3)
    // {
    //   this.ResponseStatus.pop();
    //   this.ResponseStatus.pop();
    //   this.ResponseStatus.pop();
    // }
    // if(this.SelectTiggerd != null && !this.SelectTiggerd)
    // {
    //   this.ResponseStatus.push("Accept");
    //   this.ResponseStatus.push("Reject");
    //   this.ResponseStatus.push("Open");

    //   this.ResponseFormGroup.get('Status').patchValue(this.Item.Status);
    // }
    // console.log("this.ResponseStatus",this.ResponseStatus);
  }
  LoadDialogData() {
    console.log("LoadDialogData-Item",this.Item);
    const NewDate=new Date(this.Item.MinDate);
    this.MinDate = new Date(NewDate.getFullYear(), NewDate.getMonth(), NewDate.getDate() + 1);

    if (this.Item.IsDocumentRequried === "Yes") {
      this.IsAttachmentRequried = true;
    }
    else {
      this.IsAttachmentRequried = false;
    }
    if (this.Item.Status != null) {
      if (this.Item.ActionStatus !== "Show") {
        this.ResponseStatus.push("Accept");
        this.ResponseStatus.push("Reject");
      }
      // this.ResponseStatus.push("Open");
      //Item
      this.ResponseFormGroup.get('Text').patchValue(this.Item.Text);
      this.ResponseFormGroup.get('DueDate').patchValue(new Date(this.Item.DueDate));
      // if(this.Item.Status === "Resolved" || this.Item.Status === "Differed")
      // {
        this.ResponseFormGroup.get('Status').patchValue(this.Item.Status);
      // }
      if (this.Item.Status !== "Resolved") {
        this.ResponseFormGroup.get('DueDate').enable();
        this.IsDueDateRequried=true;
      }
      else {
        this.ResponseFormGroup.get('DueDate').disable();
        this.IsDueDateRequried=false;
      }

      //File
      if (this.Item.Files) {
        this.Fileslist.push(this.Item.Files);
      }
    }

  }
  OpenAttachmentDialog(): void {
    const FileName = this.Fileslist[0].name;
    let fileType = 'image/jpg';
    fileType = FileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
      FileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
        FileName.toLowerCase().includes('.png') ? 'image/png' :
          FileName.toLowerCase().includes('.gif') ? 'image/gif' :
            FileName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
    const blob = new Blob([this.Fileslist[0]], { type: fileType });
    const attachmentDetails: AttachmentDetails = {
      FileName: FileName,
      blob: blob
    };
    const dialogConfig: MatDialogConfig = {
      data: attachmentDetails,
      panelClass: 'attachment-dialog'
    };
    const dialogRef = this.dialog.open(AttachmentDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }
  closeDialog() {
    this.matDialogRef.close(false);
  }
  handleFileInput(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.Files = evt.target.files[0] as File;
      if (this.Fileslist.length > 0) {
        this.Fileslist.pop();
      }
      this.Fileslist.push(this.Files);
    }
  }
  selectChange(event) {

    this.SelectTiggerd=true;
    if (event.value === "Differed") {
      this.IsDueDateRequried = true;
      this.ResponseFormGroup.get('DueDate').enable();
    }
    else {
      this.ResponseFormGroup.get('DueDate').disable();
      this.IsDueDateRequried = false;
    }
  }
  Response() {
    // if (Status === "Resolved") {
    //   this.ResponseFormGroup.get('DueDate').disable();
    // }
    // else {
    //   this.ResponseFormGroup.get('DueDate').enable();
    // }
    if (this.ResponseFormGroup.valid) {

      this.SendResponse(this.ResponseFormGroup.get('Status').value);
    }
    else {
      this.showValidationErrors(this.ResponseFormGroup);
    }
  }
  SendResponse(Status: any) {
    var responseData = new CAPADialogResponse();

    //Item
    responseData.Text = this.ResponseFormGroup.get('Text').value;
    // responseData.Status = this.ResponseFormGroup.get('Status').value;
    responseData.Status = Status;
    if (responseData.Status === "Differed") {
      responseData.DueDate = this._datePipe.transform(this.ResponseFormGroup.get('DueDate').value, 'yyyy-MM-dd');
    }
    else if(responseData.Status === "Resolved" && this.ResponseFormGroup.get('DueDate').value !== null)
    {
      responseData.DueDate = this._datePipe.transform(this.ResponseFormGroup.get('DueDate').value, 'yyyy-MM-dd');
    }
    else {
      responseData.DueDate = null;
    }
    if (Status !== "Differed" && this.IsAttachmentRequried && this.Fileslist.length > 0) {
      responseData.Files = this.Fileslist[0];
      console.log('Dialog Response',responseData);
      this.matDialogRef.close(responseData);
    }
    else if (!this.IsAttachmentRequried) {
      if (this.Fileslist.length > 0) {
        responseData.Files = this.Fileslist[0];
      }
      this.matDialogRef.close(responseData);
    }
    else {
      if(Status !== "Differed")
      {
        this.notificationSnackBarComponent.openSnackBar('Attachment is Required', SnackBarStatus.danger);
      }
      else
      {
        this.matDialogRef.close(responseData);
      }
    }
  }
  showValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        console.log(key);
      }
      formGroup.get(key).markAsTouched();
      formGroup.get(key).markAsDirty();
      if (formGroup.get(key) instanceof FormArray) {
        const FormArrayControls = formGroup.get(key) as FormArray;
        Object.keys(FormArrayControls.controls).forEach(key1 => {
          if (FormArrayControls.get(key1) instanceof FormGroup) {
            const FormGroupControls = FormArrayControls.get(key1) as FormGroup;
            Object.keys(FormGroupControls.controls).forEach(key2 => {
              FormGroupControls.get(key2).markAsTouched();
              FormGroupControls.get(key2).markAsDirty();
              if (!FormGroupControls.get(key2).valid) {
                console.log(key2);
              }
            });
          } else {
            FormArrayControls.get(key1).markAsTouched();
            FormArrayControls.get(key1).markAsDirty();
          }
        });
      }
    });
  }
  clearResponseFormGroup(): void {
    this.ResponseFormGroup.reset();
    Object.keys(this.ResponseFormGroup.controls).forEach(key => {
      this.ResponseFormGroup.get(key).markAsUntouched();
    });
  }
}
