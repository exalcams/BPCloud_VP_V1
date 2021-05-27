import { Component, OnInit } from '@angular/core';
import { SessionMaster, AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-session-master',
  templateUrl: './session-master.component.html',
  styleUrls: ['./session-master.component.scss']
})
export class SessionMasterComponent implements OnInit {

  menuItems: string[];
  selectedSessionMaster: SessionMaster;
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  selectID: number;
  SessionMasterMainFormGroup: FormGroup;
  searchText = '';
  AllSessionMasters: SessionMaster[] = [];
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
    this.selectedSessionMaster = new SessionMaster();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.isProgressBarVisibile = true;
    this.ProjectName = "BPCloud_VP";
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject =this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      // if (this.menuItems.indexOf('User') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
      //   this._router.navigate(['/auth/login']);
      // }
      this.SessionMasterMainFormGroup = this._formBuilder.group({
        SessionTimeOut: ['', [Validators.required, Validators.pattern('^[1-9][0-9]*$')]]
      });
      this.GetAllSessionMasters();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }
  ResetControl(): void {
    this.selectedSessionMaster = new SessionMaster();
    this.selectID = 0;
    this.SessionMasterMainFormGroup.reset();
    Object.keys(this.SessionMasterMainFormGroup.controls).forEach(key => {
      this.SessionMasterMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  GetAllSessionMasters(): void {
    this.isProgressBarVisibile = true;
    this._masterService.GetAllSessionMastersByProject(this.ProjectName).subscribe(
      (data) => {
        this.isProgressBarVisibile = false;
        this.AllSessionMasters = <SessionMaster[]>data;
        if (this.AllSessionMasters && this.AllSessionMasters.length) {
          this.loadSelectedSessionMaster(this.AllSessionMasters[0]);
        }
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  loadSelectedSessionMaster(selectedSessionMaster: SessionMaster): void {
    this.selectID = selectedSessionMaster.ID;
    this.selectedSessionMaster = selectedSessionMaster;
    this.SetSessionMasterValues();
  }

  SetSessionMasterValues(): void {
    this.SessionMasterMainFormGroup.get('SessionTimeOut').patchValue(this.selectedSessionMaster.SessionTimeOut);
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
            this.CreateSessionMaster();
          } else if (Actiontype === 'Update') {
            this.UpdateSessionMaster();
          } else if (Actiontype === 'Delete') {
            this.DeleteSessionMaster();
          }
        }
      });
  }

  GetSessionMasterValues(): void {
    this.selectedSessionMaster.SessionTimeOut = this.SessionMasterMainFormGroup.get('SessionTimeOut').value;
    this.selectedSessionMaster.ProjectName = this.ProjectName;
  }

  CreateSessionMaster(): void {
    this.GetSessionMasterValues();
    this.selectedSessionMaster.CreatedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.CreateSessionMaster(this.selectedSessionMaster).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Session Master created successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllSessionMasters();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );

  }

  UpdateSessionMaster(): void {
    this.GetSessionMasterValues();
    this.selectedSessionMaster.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.UpdateSessionMaster(this.selectedSessionMaster).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Session Master updated successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllSessionMasters();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }

  DeleteSessionMaster(): void {
    this.GetSessionMasterValues();
    this.selectedSessionMaster.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.DeleteSessionMaster(this.selectedSessionMaster).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Session Master deleted successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllSessionMasters();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }

  ShowValidationErrors(): void {
    Object.keys(this.SessionMasterMainFormGroup.controls).forEach(key => {
      this.SessionMasterMainFormGroup.get(key).markAsTouched();
      this.SessionMasterMainFormGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    if (this.SessionMasterMainFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.selectedSessionMaster.ID) {
        const Actiontype = 'Update';
        const Catagory = 'Session Master';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'Session Master';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  DeleteClicked(): void {
    if (this.SessionMasterMainFormGroup.valid) {
      if (this.selectedSessionMaster.ID) {
        const Actiontype = 'Delete';
        const Catagory = 'Session Master';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }
}
