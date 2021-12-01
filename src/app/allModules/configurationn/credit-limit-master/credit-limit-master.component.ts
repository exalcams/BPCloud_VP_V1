import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { CreditLimitMaster, AuthenticationDetails, UserView } from 'app/models/master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { MasterService } from 'app/services/master.service';
import * as SecureLS from 'secure-ls';

@Component({
  selector: 'app-credit-limit-master',
  templateUrl: './credit-limit-master.component.html',
  styleUrls: ['./credit-limit-master.component.scss']
})
export class CreditLimitMasterComponent implements OnInit {

  menuItems: string[];
  selectedCreditLimitMaster: CreditLimitMaster;
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  IsProgressBarVisibile1: boolean;
  selectID: number;
  CreditLimitMasterMainFormGroup: FormGroup;
  searchText = '';
  AllBuyers: UserView[] = [];
  AllCreditLimitMasters: CreditLimitMaster[] = [];
  ProjectName: string;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.selectedCreditLimitMaster = new CreditLimitMaster();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.IsProgressBarVisibile1 = false;
    this.ProjectName = "BPCloud_VP";
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      // if (this.menuItems.indexOf('User') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
      //   this._router.navigate(['/auth/login']);
      // }
      this.CreditLimitMasterMainFormGroup = this._formBuilder.group({
        UserName: ['', [Validators.required]],
        Email: ['', [Validators.required, Validators.email]]
      });
      this.GetAllBuyers();
      this.GetAllCreditLimitMasters();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }
  ResetControl(): void {
    this.selectedCreditLimitMaster = new CreditLimitMaster();
    this.selectID = 0;
    this.CreditLimitMasterMainFormGroup.reset();
    Object.keys(this.CreditLimitMasterMainFormGroup.controls).forEach(key => {
      this.CreditLimitMasterMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }

  GetAllBuyers(): void {
    this.IsProgressBarVisibile1 = true;
    this._masterService.GetAllBuyers().subscribe(
      (data) => {
        this.IsProgressBarVisibile1 = false;
        this.AllBuyers = <UserView[]>data;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile1 = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  Userselect(event): void {
    if (event && event.value) {
      const buyer = this.AllBuyers.find(x => x.UserName === event.value);
      if (buyer) {
        this.CreditLimitMasterMainFormGroup.get('Email').patchValue(buyer.Email);
      }
    }
  }

  GetAllCreditLimitMasters(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllCreditLimitMasters().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.AllCreditLimitMasters = <CreditLimitMaster[]>data;
        if (this.AllCreditLimitMasters && this.AllCreditLimitMasters.length) {
          this.loadSelectedCreditLimitMaster(this.AllCreditLimitMasters[0]);
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  loadSelectedCreditLimitMaster(selectedCreditLimitMaster: CreditLimitMaster): void {
    this.selectID = selectedCreditLimitMaster.ID;
    this.selectedCreditLimitMaster = selectedCreditLimitMaster;
    this.SetCreditLimitMasterValues();
  }

  SetCreditLimitMasterValues(): void {
    this.CreditLimitMasterMainFormGroup.get('UserName').patchValue(this.selectedCreditLimitMaster.UserName);
    this.CreditLimitMasterMainFormGroup.get('Email').patchValue(this.selectedCreditLimitMaster.Email);
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 8 || charCode === 9 || charCode === 13 || charCode === 46
      || charCode === 37 || charCode === 39 || charCode === 123) {
      return true;
    }
    else if (charCode < 48 || charCode > 57) {
      return false;
    }
    return true;
  }

  OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: Catagory
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Actiontype === 'Create') {
            this.CreateCreditLimitMaster();
          } else if (Actiontype === 'Update') {
            this.UpdateCreditLimitMaster();
          } else if (Actiontype === 'Delete') {
            this.DeleteCreditLimitMaster();
          }
        }
      });
  }

  GetCreditLimitMasterValues(): void {
    this.selectedCreditLimitMaster.UserName = this.CreditLimitMasterMainFormGroup.get('UserName').value;
    this.selectedCreditLimitMaster.Email = this.CreditLimitMasterMainFormGroup.get('Email').value;
  }

  CreateCreditLimitMaster(): void {
    this.GetCreditLimitMasterValues();
    this.selectedCreditLimitMaster.CreatedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.CreateCreditLimitMaster(this.selectedCreditLimitMaster).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Credit Limit Master created successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllCreditLimitMasters();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateCreditLimitMaster(): void {
    this.GetCreditLimitMasterValues();
    this.selectedCreditLimitMaster.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.UpdateCreditLimitMaster(this.selectedCreditLimitMaster).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Credit Limit Master updated successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllCreditLimitMasters();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteCreditLimitMaster(): void {
    this.GetCreditLimitMasterValues();
    this.selectedCreditLimitMaster.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    this._masterService.DeleteCreditLimitMaster(this.selectedCreditLimitMaster).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Credit Limit Master deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetAllCreditLimitMasters();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  ShowValidationErrors(): void {
    Object.keys(this.CreditLimitMasterMainFormGroup.controls).forEach(key => {
      this.CreditLimitMasterMainFormGroup.get(key).markAsTouched();
      this.CreditLimitMasterMainFormGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    if (this.CreditLimitMasterMainFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.selectedCreditLimitMaster.ID) {
        const Actiontype = 'Update';
        const Catagory = 'Credit Limit Master';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'Credit Limit Master';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  DeleteClicked(): void {
    if (this.CreditLimitMasterMainFormGroup.valid) {
      if (this.selectedCreditLimitMaster.ID) {
        const Actiontype = 'Delete';
        const Catagory = 'Credit Limit Master';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

}
