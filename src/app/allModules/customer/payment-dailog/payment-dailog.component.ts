import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { BPCPayPayment } from 'app/models/Payment.model';
import { DialogData } from 'app/notifications/notification-dialog/dialog-data';

@Component({
  selector: 'app-payment-dailog',
  templateUrl: './payment-dailog.component.html',
  styleUrls: ['./payment-dailog.component.scss']
})
export class PaymentDailogComponent implements OnInit {
  // PaymentAmount:number;
  InvoiceFormGroup:FormGroup;
    invoiceAmount:number;
    isMulitple:boolean;
    constructor(public matDialogRef: MatDialogRef<PaymentDailogComponent>,
      @Inject(MAT_DIALOG_DATA) public data:any,private _formBuilder: FormBuilder) { }
    

  ngOnInit() {
    this.InitializeReturnFormGroup();
this.invoiceAmount= this.data.Amount;
this.isMulitple=this.data.isMultiple;
console.log("invoice",this.invoiceAmount ,this.isMulitple);
this.InvoiceFormGroup.get('PaymentAmount').setValue(this.invoiceAmount);
if(this.isMulitple){
  this.InvoiceFormGroup.get('PaymentAmount').disable();
}
    //console.log( this.data.InvoiceAmount);
    
  }
  InitializeReturnFormGroup(): void {
    this.InvoiceFormGroup = this._formBuilder.group({
     
      PaymentAmount: ['',[Validators.required, (control: AbstractControl) => Validators.max(this.invoiceAmount)(control)]],
     ReferenceNo: ['', Validators.required],
     PaymentDate: [new Date, Validators.required],
     AccountNo: ['', Validators.required],
     Bank: ['', Validators.required],
     PaymentType: ['', Validators.required],

     
    });
   
  }
//   AmountValid(control: FormControl){
//     let amount=control.value;
//     if (amount> this.invoiceAmount){
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
  GetFormDetails()
  {
   var PaymentData=new BPCPayPayment();
   PaymentData.BankName=this.InvoiceFormGroup.get('Bank').value;
   PaymentData.PaidAmount=parseInt(this.InvoiceFormGroup.get('PaymentAmount').value);
   PaymentData.PaymentDate=this.InvoiceFormGroup.get('PaymentDate').value;
   PaymentData.BankAccount=this.InvoiceFormGroup.get('AccountNo').value;
   PaymentData.PaymentType=this.InvoiceFormGroup.get('PaymentType').value;
  // PaymentData.DocumentNumber=this.InvoiceFormGroup.get('ReferenceNo').value;
  //  PaymentData.BankName=this.InvoiceFormGroup.get('Bank').value;
console.log(PaymentData);
return PaymentData;

}
  submit(){
    if(this.InvoiceFormGroup.valid)
    {
      console.log("valid" + this.InvoiceFormGroup);
      var PaymentData=this.GetFormDetails();
    this.matDialogRef.close(PaymentData);

    }
    else {
      console.log("invalid")
      this.ShowValidationErrors(this.InvoiceFormGroup);
    }
  }
}
