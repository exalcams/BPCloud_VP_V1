import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { AuthenticationDetails } from 'app/models/master';
import { ActionLog } from 'app/models/OrderFulFilment';
import { BPCDiscountMaster, BPCPayDis } from 'app/models/Payment.model';
import { AuthService } from 'app/services/auth.service';
import { DiscountService } from 'app/services/discount.service';
import * as SecureLS from 'secure-ls';

@Component({
  selector: 'app-discount-dialogue',
  templateUrl: './discount-dialogue.component.html',
  styleUrls: ['./discount-dialogue.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class DiscountDialogueComponent implements OnInit {
  discountFormGroup: FormGroup;
  discountData: BPCPayDis = new BPCPayDis();
  discountMaster: BPCDiscountMaster[];
  isChange = false;
  ActionLog: any;
  authenticationDetails: any;
  currentUserID: any;
  currentUserName: any;
  currentUserRole: any;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<DiscountDialogueComponent>,
    public fb: FormBuilder,
    private _authService: AuthService,
    private _discountService: DiscountService,
    
  ) {
    this.SecretKey = this._authService.SecretKey;
        this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.discountFormGroup = this.fb.group({
      RemainingDays: [null],
      EPRD: [null, [Validators.required, Validators.max(this.CalculateRmDays()), Validators.min(5)]],
      DiscountProposed: [null],
      PostDiscountAmount: [null]
    });
  }

  ngOnInit(): void {
    const retrievedObject =this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      // if (this.MenuItems.indexOf('ASN') < 0) {
      //     this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //     );
      //     this._router.navigate(['/auth/login']);
      // }

    }
    // console.log("dialogData", this.dialogData);
    if (this.dialogData.isBuyer) {
      this.discountData = this.dialogData;
      this.discountFormGroup.get('RemainingDays').setValue(this.CalculateRmDays());
      this.discountFormGroup.get('EPRD').setValue(this.parseDays(this.discountData.ProposedDueDate));
      this.discountFormGroup.get('DiscountProposed').setValue(this.discountData.ProposedDiscount);
      this.discountFormGroup.get('PostDiscountAmount').setValue(this.discountData.PostDiscountAmount);
      this.discountFormGroup.disable();
    }
    else {
      this.discountFormGroup.get('RemainingDays').disable();
      this.discountFormGroup.get('DiscountProposed').disable();
      this.discountFormGroup.get('PostDiscountAmount').disable();
      this._discountService.FilterBPCPayDiscount(this.dialogData).subscribe(x => {
        // console.log("FormAPI", x);
        if (x != null) {
          this.isChange = true;
          this.discountFormGroup.get('EPRD').disable();
          this.discountData = x;
          this.discountFormGroup.get('EPRD').setValue(this.parseDays(this.discountData.ProposedDueDate));
          this.discountFormGroup.get('DiscountProposed').setValue(this.discountData.ProposedDiscount);
          this.discountFormGroup.get('PostDiscountAmount').setValue(this.discountData.PostDiscountAmount);
        }
        else {
          this.discountData.Client = this.dialogData.Client;
          this.discountData.Company = this.dialogData.Company;
          this.discountData.Type = this.dialogData.Type;
          this.discountData.PartnerID = this.dialogData.PartnerID;
          this.discountData.FiscalYear = this.dialogData.FiscalYear;
          this.discountData.DocumentNumber = this.dialogData.DocumentNumber;
          this.discountData.DocumentDate = this.dialogData.DocumentDate;
          this.discountData.InvoiceNumber = this.dialogData.InvoiceNumber;
          this.discountData.InvoiceDate = this.dialogData.InvoiceDate;
          this.discountData.InvoiceAmount = this.dialogData.InvoiceAmount;
          this.discountData.PaidAmount = this.dialogData.PaidAmount;
          this.discountData.BalanceAmount = this.dialogData.BalanceAmount;
          this.discountData.DueDate = this.dialogData.DueDate;
          this.discountData.ProfitCenter = this.dialogData.ProfitCenter;
          this.discountData.Plant = this.dialogData.Plant;
        }
      });
      this.discountFormGroup.get('RemainingDays').setValue(this.CalculateRmDays());
      this._discountService.GetDiscountMasters().subscribe(x => {
        // console.log(x);
        this.discountMaster = x;
      });
    }
  }
  CalculateRmDays(): number {
    const today = new Date();
    const dueDay = new Date(this.dialogData.DueDate);
    const Difference_In_Time = dueDay.getTime() - today.getTime();
    const Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);
    return Math.round(Difference_In_Days);
  }
  handleERPD(): void {
    const key = this.discountFormGroup.get('EPRD').value;
    if (key == null) {
      this.discountFormGroup.get('DiscountProposed').setValue(null);
      this.discountFormGroup.get('PostDiscountAmount').setValue(null);
    }
    else {
      const percentage = this.CalculateDiscountPercentage(key);
      this.discountFormGroup.get('DiscountProposed').setValue(percentage);
      this.discountFormGroup.get('PostDiscountAmount').setValue(this.CalculatePostDiscount(percentage));
    }
  }
  CalculatePostDiscount(percentage: number): number {
    const result = this.dialogData.BalanceAmount - ((this.dialogData.BalanceAmount / 100) * percentage);
    // console.log(result);
    return result;
  }
  CalculateDiscountPercentage(days: number): number {
    // if (days < this.discountMaster[0].Days) {
    //   return 0;
    // }
    // for (let i = this.discountMaster.length - 1; i >= 0; i--) {
    //   if (days >= this.discountMaster[i].Days) {
    //     return this.discountMaster[i].Discount;
    //   }
    // }
    for (let i = 0; i <= this.discountMaster.length - 1; i++) {
      if (this.discountData.BalanceAmount >= this.discountMaster[i].Amount) {
        if (days <= this.discountMaster[i].Days) {
          return this.discountMaster[i].Discount;
        }
      }
     
    }
    return 0;
  }
  addDays(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  }
  parseDays(ERPDdate: any): number {
    if (this.discountData.ModifiedOn != null) {
      return Math.round((new Date(ERPDdate).getTime() - new Date(this.discountData.ModifiedOn.toString()).getTime()) / (1000 * 3600 * 24));
    }
    else {
      return Math.round((new Date(ERPDdate).getTime() - new Date(this.discountData.CreatedOn.toString()).getTime()) / (1000 * 3600 * 24));
    }
  }
  YesClicked(): void {
    this.CreateActionLogvalues("Save");
    if (this.dialogData.isBuyer) {
      this.discountData.Status = "Accepted";
      this.dialogRef.close(this.discountData);
    }
    else {
      if (!this.discountFormGroup.valid) {
        this.ShowValidationErrors();
      }
      else {
        this.discountData.ProposedDueDate = this.addDays(this.discountFormGroup.get('EPRD').value);
        this.discountData.ProposedDiscount = this.discountFormGroup.get('DiscountProposed').value;
        this.discountData.PostDiscountAmount = this.discountFormGroup.get('PostDiscountAmount').value;
       // console.log("onClose", this.discountData);
        this.dialogRef.close(this.discountData);
      }
    }
  }

  CloseClicked(): void {
    if (this.dialogData.isBuyer) {
      this.CreateActionLogvalues("Reject");
      this.discountData.Status = "Rejected";
      this.dialogRef.close(this.discountData);
    }
    else {
      this.CreateActionLogvalues("Cancel");
      this.dialogRef.close(false);
    }
  }
  ShowValidationErrors(): void {
    Object.keys(this.discountFormGroup.controls).forEach(key => {
      this.discountFormGroup.get(key).markAsTouched();
      this.discountFormGroup.get(key).markAsDirty();
    });

  }

  ChangeClicked(): void {
    this.CreateActionLogvalues("Change");
    this.isChange = false;
    this.discountFormGroup.get('EPRD').enable();
  }
  CreateActionLogvalues(text): void {
    this.ActionLog = new ActionLog();
    this.ActionLog.UserID = this.currentUserID;
    this.ActionLog.AppName = "DiscountCalculation";
    this.ActionLog.ActionText = text + " is Clicked";
    this.ActionLog.Action = text;
    this.ActionLog.CreatedBy = this.currentUserName;
    this._authService.CreateActionLog(this.ActionLog).subscribe(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
