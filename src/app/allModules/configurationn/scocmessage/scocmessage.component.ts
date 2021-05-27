import { Component, OnInit } from '@angular/core';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BPCSCOCMessage } from 'app/models/Message.model';
import { POService } from 'app/services/po.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-scocmessage',
  templateUrl: './scocmessage.component.html',
  styleUrls: ['./scocmessage.component.scss']
})
export class SCOCMessageComponent implements OnInit {

  menuItems: string[];
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  notesForm: FormGroup;
  selectedSCOCMessage: BPCSCOCMessage;
  IsProgressBarVisibile: boolean;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _formBuilder: FormBuilder,
    private _POService: POService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _authService: AuthService,
  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.selectedSCOCMessage = new BPCSCOCMessage();
    this.IsProgressBarVisibile = false;
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit(): void {
    const retrievedObject = this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      // if (this.menuItems.indexOf('User') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
      //   this._router.navigate(['/auth/login']);
      // }
      this.notesForm = this._formBuilder.group({
        Notes: ['', Validators.required],
      });

      this.GetSCOCMessage();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }
  ResetControl(): void {
    this.selectedSCOCMessage = new BPCSCOCMessage();
    this.notesForm.reset();
    Object.keys(this.notesForm.controls).forEach(key => {
      this.notesForm.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  GetSCOCMessage(): void {
    this.IsProgressBarVisibile = true;
    this._POService.GetSCOCMessage().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.selectedSCOCMessage = data as BPCSCOCMessage;
        if (!this.selectedSCOCMessage) {
          this.selectedSCOCMessage = new BPCSCOCMessage();
        }
        if (this.selectedSCOCMessage && this.selectedSCOCMessage.SCOCMessage) {
          this.notesForm.get('Notes').patchValue(this.selectedSCOCMessage.SCOCMessage);
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  Releaselicked(): void {
    if (this.notesForm.valid) {
      this.selectedSCOCMessage.IsReleased = true;
      const Actiontype = 'Release';
      const Catagory = 'SCOC Message';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    } else {
      this.ShowValidationErrors();
    }
  }

  SaveClicked(): void {
    if (this.notesForm.valid) {
      // this.selectedSCOCMessage.IsReleased = false;
      const Actiontype = 'Save';
      const Catagory = 'SCOC Message';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    } else {
      this.ShowValidationErrors();
    }
  }
  ShowValidationErrors(): void {
    Object.keys(this.notesForm.controls).forEach(key => {
      this.notesForm.get(key).markAsTouched();
      this.notesForm.get(key).markAsDirty();
    });

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
          if (Actiontype !== 'Delete') {
            if (this.selectedSCOCMessage.MessageID) {
              this.UpdateSCOCMessage(Actiontype);
            } else {
              this.CreateSCOCMessage(Actiontype);
            }
          }
          else if (Actiontype === 'Delete') {
            this.DeleteSCOCMessage();
          }
        }
      });
  }

  CreateSCOCMessage(Actiontype: string): void {
    this.selectedSCOCMessage.SCOCMessage = this.notesForm.get('Notes').value;
    this.selectedSCOCMessage.CreatedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    this._POService.CreateSCOCMessage(this.selectedSCOCMessage).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar(`SCOC Message ${Actiontype}d successfully`, SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetSCOCMessage();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateSCOCMessage(Actiontype: string): void {
    this.selectedSCOCMessage.SCOCMessage = this.notesForm.get('Notes').value;
    this.selectedSCOCMessage.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    this._POService.UpdateSCOCMessage(this.selectedSCOCMessage).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar(`SCOC Message ${Actiontype}d successfully successfully`, SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetSCOCMessage();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteSCOCMessage(): void {
    this.selectedSCOCMessage.SCOCMessage = this.notesForm.get('Notes').value;
    this.selectedSCOCMessage.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    this._POService.DeleteSCOCMessage(this.selectedSCOCMessage).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('SCOC Message deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetSCOCMessage();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }


}
