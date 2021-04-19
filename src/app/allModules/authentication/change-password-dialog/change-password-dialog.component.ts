import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ChangePassword } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatDialogRef, MatSnackBar, MAT_DIALOG_DATA } from '@angular/material';
import { CustomValidator } from 'app/shared/custom-validator';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-change-password-dialog',
  templateUrl: './change-password-dialog.component.html',
  styleUrls: ['./change-password-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ChangePasswordDialogComponent implements OnInit {
  resetPasswordForm: FormGroup;
  changePassword: ChangePassword;
  notificationSnackBarComponent: NotificationSnackBarComponent;

  constructor(
    public matDialogRef: MatDialogRef<ChangePasswordDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _formBuilder: FormBuilder,
    public snackBar: MatSnackBar

  ) {
    this.resetPasswordForm = this._formBuilder.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required,
        Validators.pattern('(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[$@$!%*?&])[A-Za-z\d$@$!%*?&].{8,}')]],
      confirmPassword: ['', [Validators.required, CustomValidator.confirmPasswordValidator]]
    });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit(): void {
  }

  YesClicked(): void {
    if (this.resetPasswordForm.valid) {
      this.changePassword = new ChangePassword();
      this.changePassword.CurrentPassword = this.resetPasswordForm.get('currentPassword').value;
      this.changePassword.NewPassword = this.resetPasswordForm.get('newPassword').value;

      var NewPassword = this.changePassword.NewPassword.toLocaleLowerCase();
      var username=this.data.UserName.toLocaleLowerCase();

      if (NewPassword.search('emami') >= 0 || NewPassword.search('admin') >= 0 || NewPassword.search('administrator') >= 0) {
        this.notificationSnackBarComponent.openSnackBar('Passwords Should Not Have Keywords ‘emami’, ‘admin’ And ‘administrator’', SnackBarStatus.danger);
      }
      else if (NewPassword.search(username) >=0 ){
        this.notificationSnackBarComponent.openSnackBar('Passwords Should Not Be Same As Username', SnackBarStatus.danger);
      }
      else if (this.changePassword.CurrentPassword === this.changePassword.NewPassword) {
        this.notificationSnackBarComponent.openSnackBar('New Password Should Be Different From Old Password', SnackBarStatus.danger);
      } else {
        this.matDialogRef.close(this.changePassword);
      }
    } else {
      Object.keys(this.resetPasswordForm.controls).forEach(key => {
        this.resetPasswordForm.get(key).markAsTouched();
        this.resetPasswordForm.get(key).markAsDirty();
      });

    }
  }

  CloseClicked(): void {
    // console.log('Called');
    this.matDialogRef.close(null);
  }

}
