import { DatePipe } from '@angular/common';
import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { BPCPayRecord } from 'app/models/customer';
import { BPCPayPayment } from 'app/models/Payment.model';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { DialogData } from 'app/notifications/notification-dialog/dialog-data';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';

@Component({
  selector: 'app-payment-dailog',
  templateUrl: './payment-dailog.component.html',
  styleUrls: ['./payment-dailog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations

})
export class PaymentDailogComponent implements OnInit {
  // PaymentAmount:number;
  InvoiceFormGroup: FormGroup;
  BalanceAmount: number;
  isMulitple: boolean;
  fileToUpload: File;
  fileToUploadList: File[] = [];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  constructor(
    public matDialogRef: MatDialogRef<PaymentDailogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _datePipe: DatePipe
  ) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }


  ngOnInit(): void {
    this.InitializeReturnFormGroup();
    this.BalanceAmount = this.data.Amount;
    this.isMulitple = this.data.isMultiple;
    // console.log("invoice", this.BalanceAmount, this.isMulitple);
    this.InvoiceFormGroup.get('PaymentAmount').setValue(this.BalanceAmount);
    if (this.isMulitple) {
      this.InvoiceFormGroup.get('PaymentAmount').disable();
    }
    this.fileToUpload = this.data.fileToUpload;
    // console.log( this.data.BalanceAmount);

  }
  InitializeReturnFormGroup(): void {
    this.InvoiceFormGroup = this._formBuilder.group({
      PaymentAmount: ['', [Validators.required, Validators.max(this.BalanceAmount)]],
      ReferenceNumber: ['', Validators.required],
      PaymentDate: [new Date, Validators.required],
      AccountNo: ['', Validators.required],
      Bank: ['', Validators.required],
      PaymentType: ['', Validators.required],
    });

  }
  //   AmountValid(control: FormControl){
  //     let amount=control.value;
  //     if (amount> this.BalanceAmount){
  // console.log(this.InvoiceFormGroup.get('PaymentAmount').value);
  //     return { 'AmountInvalid': true }; 
  //     }
  //     return null;
  //   }
  CloseClicked(): void {
    // console.log('Called');
    this.matDialogRef.close();
  }
  ShowValidationErrors(formGroup: FormGroup): void {
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
  GetFormDetails(): BPCPayRecord {
    const PaymentData = new BPCPayRecord();
    PaymentData.PaidAmount = +(this.InvoiceFormGroup.get('PaymentAmount').value);
    PaymentData.ReferenceNumber = this.InvoiceFormGroup.get('ReferenceNumber').value;
    PaymentData.PaymentDate = this._datePipe.transform(this.InvoiceFormGroup.get('PaymentDate').value, 'yyyy-MM-dd');
    PaymentData.Bank = this.InvoiceFormGroup.get('Bank').value;
    PaymentData.AccountNumber = this.InvoiceFormGroup.get('AccountNo').value;
    PaymentData.PaymentType = this.InvoiceFormGroup.get('PaymentType').value;
    PaymentData.PaymentDocument = this.fileToUpload;
    // PaymentData.DocumentNumber=this.InvoiceFormGroup.get('ReferenceNumber').value;
    //  PaymentData.BankName=this.InvoiceFormGroup.get('Bank').value;
    // console.log(PaymentData);
    return PaymentData;

  }

  handleFileInput1(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      const fil = evt.target.files[0] as File;
      if (fil.type.includes('pdf')) {
        if (this.fileToUpload && this.fileToUpload.name) {
          this.OpenAttachmentReplaceConfirmation(evt);
          // this.notificationSnackBarComponent.openSnackBar('Maximum one attachment is allowed, old is attachment is replaced', SnackBarStatus.warning);
        }
        // else if (this.invAttach && this.invAttach.AttachmentName) {
        //   this.OpenAttachmentReplaceConfirmation(evt);
        //   // this.notificationSnackBarComponent.openSnackBar('Maximum one attachment is allowed, old is attachment is replaced', SnackBarStatus.warning);
        // } 
        else {
          this.fileToUpload = evt.target.files[0];

        }
      } else {
        this.notificationSnackBarComponent.openSnackBar(`Please select only pdf file`, SnackBarStatus.danger);
      }
    }
  }
  OpenAttachmentReplaceConfirmation(evt): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: 'Replace',
        Catagory: 'Attachment'
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          this.fileToUpload = evt.target.files[0];
        }
      });
  }
  GetPaymentAttachment(): void {
    if (this.fileToUpload && this.fileToUpload.size) {
      const blob = new Blob([this.fileToUpload], { type: this.fileToUpload.type });
      this.OpenAttachmentDialog(this.fileToUpload.name, blob);
    }
  }
  OpenAttachmentDialog(FileName: string, blob: Blob): void {
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

  submit(): void {
    if (this.InvoiceFormGroup.valid) {
      if ((this.fileToUpload && this.fileToUpload.name)) {
        const PaymentData = this.GetFormDetails();
        this.matDialogRef.close(PaymentData);
      } else {
        this.notificationSnackBarComponent.openSnackBar('Please add the payment document', SnackBarStatus.danger);
      }
      // console.log("valid" + this.InvoiceFormGroup);
    }
    else {
      // console.log("invalid");
      this.ShowValidationErrors(this.InvoiceFormGroup);
    }
  }
}
