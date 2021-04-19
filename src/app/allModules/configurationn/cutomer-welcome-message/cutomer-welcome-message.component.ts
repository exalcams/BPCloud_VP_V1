import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { BPCCEOMessage, BPCSCOCMessage, BPCWelcomeMessage } from 'app/models/Message.model';
import { POService } from 'app/services/po.service';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';

@Component({
  selector: 'app-cutomer-welcome-message',
  templateUrl: './cutomer-welcome-message.component.html',
  styleUrls: ['./cutomer-welcome-message.component.scss']
})
export class CutomerWelcomeMessageComponent implements OnInit {
  menuItems: string[];
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  notesForm: FormGroup;
  selectedWelcomeMessage: BPCWelcomeMessage;
  selectedSCOCMessage: BPCWelcomeMessage;
  IsProgressBarVisibile: boolean;
  constructor(
    private _formBuilder: FormBuilder,
    private _POService: POService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.selectedWelcomeMessage = new BPCWelcomeMessage();
    this.IsProgressBarVisibile = false;
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit(): void {
    const retrievedObject = localStorage.getItem('authorizationData');
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

      this.GetWelcomeMessage();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }
  ResetControl(): void {
    this.selectedWelcomeMessage = new BPCWelcomeMessage();
    this.notesForm.reset();
    Object.keys(this.notesForm.controls).forEach(key => {
      this.notesForm.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  GetWelcomeMessage(): void {
    this.IsProgressBarVisibile = true;
    this._POService.GetWelcomeMessage().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.selectedWelcomeMessage = data as BPCWelcomeMessage;
        if (!this.selectedWelcomeMessage) {
          this.selectedWelcomeMessage = new BPCWelcomeMessage();
        }
        if (this.selectedWelcomeMessage && this.selectedWelcomeMessage.WelcomeMessage) {
          this.notesForm.get('Notes').patchValue(this.selectedWelcomeMessage.WelcomeMessage);
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
      this.selectedWelcomeMessage.IsReleased = true;
      const Actiontype = 'Release';
      const Catagory = 'Welcome Message';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    } else {
      this.ShowValidationErrors();
    }
  }

  SaveClicked(): void {
    if (this.notesForm.valid) {
      // this.selectedCEOMessage.IsReleased = false;
      const Actiontype = 'Save';
      const Catagory = 'Welcome Message';
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
            if (this.selectedWelcomeMessage.MessageID) {
              this.UpdateWelcomeMessage(Actiontype);
            } else {
              this.CreateWelcomeMessage(Actiontype);
            }
          }
          else if (Actiontype === 'Delete') {
            this.DeleteWelcomeMessage();
          }
        }
      });
  }

  CreateWelcomeMessage(Actiontype: string): void {
    this.selectedWelcomeMessage.WelcomeMessage = this.notesForm.get('Notes').value;
    this.selectedWelcomeMessage.CreatedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    this._POService.CreateWelcomeMessage(this.selectedWelcomeMessage).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar(`Welcome Message ${Actiontype}d successfully`, SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetWelcomeMessage();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateWelcomeMessage(Actiontype: string): void {
    this.selectedWelcomeMessage.WelcomeMessage = this.notesForm.get('Notes').value;
    this.selectedWelcomeMessage.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    this._POService.UpdateWelcomeMessage(this.selectedWelcomeMessage).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar(`Welcome Message ${Actiontype}d successfully`, SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetWelcomeMessage();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteWelcomeMessage(): void {
    this.selectedWelcomeMessage.WelcomeMessage = this.notesForm.get('Notes').value;
    this.selectedWelcomeMessage.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    this._POService.DeleteWelcomeMessage(this.selectedWelcomeMessage).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Welcome Message deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetWelcomeMessage();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }


}
