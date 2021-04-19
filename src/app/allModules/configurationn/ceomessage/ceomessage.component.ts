import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { BPCCEOMessage, BPCSCOCMessage } from 'app/models/Message.model';
import { POService } from 'app/services/po.service';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';

@Component({
  selector: 'app-ceomessage',
  templateUrl: './ceomessage.component.html',
  styleUrls: ['./ceomessage.component.scss']
})
export class CEOMessageComponent implements OnInit {
  menuItems: string[];
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  notesForm: FormGroup;
  selectedCEOMessage: BPCCEOMessage;
  selectedSCOCMessage: BPCSCOCMessage;
  IsProgressBarVisibile: boolean;
  constructor(
    private _formBuilder: FormBuilder,
    private _POService: POService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.selectedCEOMessage = new BPCCEOMessage();
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

      this.GetCEOMessage();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }
  ResetControl(): void {
    this.selectedCEOMessage = new BPCCEOMessage();
    this.notesForm.reset();
    Object.keys(this.notesForm.controls).forEach(key => {
      this.notesForm.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  GetCEOMessage(): void {
    this.IsProgressBarVisibile = true;
    this._POService.GetCEOMessage().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.selectedCEOMessage = data as BPCCEOMessage;
        if (!this.selectedCEOMessage) {
          this.selectedCEOMessage = new BPCCEOMessage();
        }
        if (this.selectedCEOMessage && this.selectedCEOMessage.CEOMessage) {
          this.notesForm.get('Notes').patchValue(this.selectedCEOMessage.CEOMessage);
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
      this.selectedCEOMessage.IsReleased = true;
      const Actiontype = 'Release';
      const Catagory = 'CEO Message';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    } else {
      this.ShowValidationErrors();
    }
  }

  SaveClicked(): void {
    if (this.notesForm.valid) {
      // this.selectedCEOMessage.IsReleased = false;
      const Actiontype = 'Save';
      const Catagory = 'CEO Message';
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
            if (this.selectedCEOMessage.MessageID) {
              this.UpdateCEOMessage(Actiontype);
            } else {
              this.CreateCEOMessage(Actiontype);
            }
          }
          else if (Actiontype === 'Delete') {
            this.DeleteCEOMessage();
          }
        }
      });
  }

  CreateCEOMessage(Actiontype: string): void {
    this.selectedCEOMessage.CEOMessage = this.notesForm.get('Notes').value;
    this.selectedCEOMessage.CreatedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    this._POService.CreateCEOMessage(this.selectedCEOMessage).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar(`CEO Message ${Actiontype}d successfully`, SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetCEOMessage();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateCEOMessage(Actiontype: string): void {
    this.selectedCEOMessage.CEOMessage = this.notesForm.get('Notes').value;
    this.selectedCEOMessage.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    this._POService.UpdateCEOMessage(this.selectedCEOMessage).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar(`CEO Message ${Actiontype}d successfully`, SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetCEOMessage();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteCEOMessage(): void {
    this.selectedCEOMessage.CEOMessage = this.notesForm.get('Notes').value;
    this.selectedCEOMessage.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    this._POService.DeleteCEOMessage(this.selectedCEOMessage).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('CEO Message deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetCEOMessage();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

}
