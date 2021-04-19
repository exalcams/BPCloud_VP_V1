import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { EMailModel } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FactService } from 'app/services/fact.service';
import { WINDOW } from 'app/window.providers';
import { ForgetPasswordLinkDialogComponent } from '../forget-password-link-dialog/forget-password-link-dialog.component';

@Component({
  selector: 'app-forget-user-id-link-dialog',
  templateUrl: './forget-user-id-link-dialog.component.html',
  styleUrls: ['./forget-user-id-link-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ForgetUserIdLinkDialogComponent implements OnInit {

  forgotUserIDForm: FormGroup;
  Origin: string;
  emailModel: EMailModel;
  notificationSnackBarComponent: NotificationSnackBarComponent;

  constructor(
    public matDialogRef: MatDialogRef<ForgetPasswordLinkDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    private _factService: FactService,
    @Inject(WINDOW) private window: Window

  ) {
    this.forgotUserIDForm = this._formBuilder.group({
      taxNumber: ['', [Validators.required]]
      // UserName: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // if (isDevMode()) {
    //   this.Origin = this.window.location.origin;
    // } else {
    //   this.Origin = this.window.location.origin;
    // }
    this.Origin = this.window.location.origin;
  }
  YesClicked(): void {
    if (this.forgotUserIDForm.valid) {
      const taxNumber = this.forgotUserIDForm.get('taxNumber').value;
      this.matDialogRef.close(taxNumber);
    } else {
      Object.keys(this.forgotUserIDForm.controls).forEach(key => {
        this.forgotUserIDForm.get(key).markAsTouched();
        this.forgotUserIDForm.get(key).markAsDirty();
      });

    }
  }

  CloseClicked(): void {
    // console.log('Called');
    this.matDialogRef.close(null);
  }

}
