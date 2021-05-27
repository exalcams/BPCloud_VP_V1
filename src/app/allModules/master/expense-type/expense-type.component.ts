import { Component, OnInit } from '@angular/core';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Guid } from 'guid-typescript';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { BPCExpenseTypeMaster } from 'app/models/POD';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-expense-type',
  templateUrl: './expense-type.component.html',
  styleUrls: ['./expense-type.component.scss']
})
export class ExpenseTypeComponent implements OnInit {
  AllExpenseType: BPCExpenseTypeMaster[] = [];
  menuItems: string[];
  authenticationDetails: AuthenticationDetails;
  selectedUser: BPCExpenseTypeMaster;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  selectID: number;
  ExpensetypeMainFormGroup: FormGroup;
  searchText = '';
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
    this.selectedUser = new BPCExpenseTypeMaster();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.isProgressBarVisibile = true;
   }

  ngOnInit() {
    const retrievedObject = this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.menuItems.indexOf('ExpenseType') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.ExpensetypeMainFormGroup = this._formBuilder.group({
        client: ['', Validators.required],
        company: ['', Validators.required],
        type: ['', Validators.required],
        partnerid: ['', [Validators.required]],
        expenseType: ['', Validators.required],
        MaxAmount:['', Validators.required]
      });
      this.GetAllExpenseType();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }
  ResetControl(): void {
    this.selectedUser = new BPCExpenseTypeMaster();
    this.selectID = null;
    this.ExpensetypeMainFormGroup.reset();
    Object.keys(this.ExpensetypeMainFormGroup.controls).forEach(key => {
      this.ExpensetypeMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  GetAllExpenseType(): void {
    this.isProgressBarVisibile = true;
    this._masterService.GetAllExpenseType().subscribe(
      (data) => {
        this.isProgressBarVisibile = false;
        this.AllExpenseType = <BPCExpenseTypeMaster[]>data;
        if (this.AllExpenseType && this.AllExpenseType.length) {
          this.loadSelectedUser(this.AllExpenseType[0]);
        }
      },
      (err) => {
        console.log(err);
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  loadSelectedUser(selectedUser: BPCExpenseTypeMaster): void {
    this.selectID = selectedUser.ID;
    this.selectedUser = selectedUser;
    this.SetUserValues();
  }
  SetUserValues(): void {
    this.ExpensetypeMainFormGroup.get('client').patchValue(this.selectedUser.Client);
    this.ExpensetypeMainFormGroup.get('company').patchValue(this.selectedUser.Company);
    this.ExpensetypeMainFormGroup.get('type').patchValue(this.selectedUser.Type);
    this.ExpensetypeMainFormGroup.get('partnerid').patchValue(this.selectedUser.PatnerID);
    this.ExpensetypeMainFormGroup.get('expenseType').patchValue(this.selectedUser.ExpenseType);
    this.ExpensetypeMainFormGroup.get('MaxAmount').patchValue(this.selectedUser.MaxAmount);
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
            this.CreateExpenseType();
          } else if (Actiontype === 'Update') {
            this.UpdateExpenseType();
          } else if (Actiontype === 'Delete') {
            this.DeleteExpenseType();
          }
        }
      });
  }
  GetUserValues(): void {
    this.selectedUser.Client = this.ExpensetypeMainFormGroup.get('client').value;
    this.selectedUser.Company = this.ExpensetypeMainFormGroup.get('company').value;
    this.selectedUser.Type = this.ExpensetypeMainFormGroup.get('type').value;
    this.selectedUser.PatnerID = this.ExpensetypeMainFormGroup.get('partnerid').value;
    this.selectedUser.ExpenseType = this.ExpensetypeMainFormGroup.get('expenseType').value;
    this.selectedUser.MaxAmount = this.ExpensetypeMainFormGroup.get('MaxAmount').value;
  }
  CreateExpenseType(): void {
    this.GetUserValues();
    this.selectedUser.CreatedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.CreateExpenseType(this.selectedUser).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Expense Type created successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllExpenseType();
      },
      (err) => {
        console.log(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );

  }

  UpdateExpenseType(): void {
    this.GetUserValues();
    this.selectedUser.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.UpdateExpenseType(this.selectedUser).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Expense Type updated successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllExpenseType();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }

  DeleteExpenseType(): void {
    this.GetUserValues();
    this.selectedUser.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.DeleteExpenseType(this.selectedUser).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Expense Type deleted successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllExpenseType();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }
  ShowValidationErrors(): void {
    Object.keys(this.ExpensetypeMainFormGroup.controls).forEach(key => {
      this.ExpensetypeMainFormGroup.get(key).markAsTouched();
      this.ExpensetypeMainFormGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    if (this.ExpensetypeMainFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.selectedUser.ID) {
        const Actiontype = 'Update';
        const Catagory = 'Expense Type';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'Expense Type';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  DeleteClicked(): void {
    if (this.ExpensetypeMainFormGroup.valid) {
      if (this.selectedUser.ID) {
        const Actiontype = 'Delete';
        const Catagory = 'Expense Type';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

}

