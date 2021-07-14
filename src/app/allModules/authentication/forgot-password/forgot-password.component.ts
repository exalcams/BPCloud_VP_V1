import { Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { AuthService } from 'app/services/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { MatSnackBar } from '@angular/material';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { CustomValidator } from 'app/shared/custom-validator';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { ForgotPassword } from 'app/models/master';

@Component({
  selector: 'forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ForgotPasswordComponent implements OnInit {
  resetPasswordForm: FormGroup;
  forgotPassword: ForgotPassword;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  setIntervalID: any;
  currentIndex: number;
  cookieLength: string[] = [];
  allTexts: string[] = [];
  currentText: string;
  fuseConfig: any;
  Username = "";
  messages = [
    "Partner Collaboration",
    "Order fulfilment",
    "Payment Tracking",
    "Shipment Tracking",
    "Document Collection",
    "Digital Signature",
    "Payment Gateway",
    "RFQ process",
  ];
  currentMessage = 0;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    public snackBar: MatSnackBar
  ) {
    // Configure the layout
    this._fuseConfigService.config = {
      layout: {
        navbar: {
          hidden: true
        },
        toolbar: {
          hidden: true
        },
        footer: {
          hidden: true
        },
        sidepanel: {
          hidden: true
        }
      }
    };
    // // console.log(this._activatedRoute.snapshot.queryParamMap.get('Id'));
    // // console.log(this._activatedRoute.snapshot.queryParamMap.get('token'));
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.currentIndex = 0;
    this.allTexts = ["Scalability", "Reliability"];
  }

  ngOnInit(): void {
    this.typeMessage();
    this.resetPasswordForm = this._formBuilder.group({
      newPassword: ['', [Validators.required,
      Validators.pattern('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[`~!@#\$%\^\&*\)\(\\+=.,_-])[A-Za-z\d`~!@#\$%\^\&*\)\(\\+=.,_-].{9,}')]],
      confirmPassword: ['', [Validators.required, CustomValidator.confirmPasswordValidator]]
    });
  }
  setCurrentText(): void {
    if (this.currentIndex >= this.allTexts.length) {
      this.currentIndex = 0;
    }
    this.currentText = this.allTexts[this.currentIndex];
    this.currentIndex++;
  }
  typeMessage(): void {
    if (!this.messages[this.currentMessage]) {
      this.currentMessage = 0;
    }
    const currentStr = this.messages[this.currentMessage];
    // currentStr.split();
    let part = "";
    let currentLetter = 0;
    const int1 = setInterval(() => {
      if (!currentStr[currentLetter]) {
        this.currentMessage++;
        setTimeout(() => {
          this.deleteMessage(part);
        }, 4000);
        clearInterval(int1);
      } else {
        part += currentStr[currentLetter++];
        // mHTML.innerHTML = part;
        this.currentText = part;
      }
    }, 100);
  }

  deleteMessage(str): void {
    const int = setInterval(() => {
      if (str.length === 0) {
        setTimeout(() => {
          this.typeMessage();
        }, 500);
        clearInterval(int);
      } else {
        str = str.split("");
        str.pop();
        str = str.join("");
        // mHTML.innerHTML = str;
        this.currentText = str;
      }
    }, 150);
  }
  ResetControl(): void {
    this.resetPasswordForm.get('newPassword').patchValue('');
    this.resetPasswordForm.get('confirmPassword').patchValue('');
    this.forgotPassword = null;
    this.resetPasswordForm.reset();
    this.resetPasswordForm.markAsUntouched();
    Object.keys(this.resetPasswordForm.controls).forEach(key => {
      const control = this.resetPasswordForm.get(key);
      // control.setErrors(null);
      // this.menuAppMainFormGroup.get(key).markAsUntouched();
      // this.menuAppMainFormGroup.get(key).updateValueAndValidity();
      // // console.log(this.menuAppMainFormGroup.get(key).setErrors(Validators.required)
    });

  }
  ChangePasswordClick(): void {
    if (this.resetPasswordForm.valid) {
      this.IsProgressBarVisibile = true;
      this.forgotPassword = new ForgotPassword();
      this.forgotPassword.UserID = <any>this._activatedRoute.snapshot.queryParamMap.get('Id');
      this.forgotPassword.Token = this._activatedRoute.snapshot.queryParamMap.get('token');
      this.forgotPassword.NewPassword = this.resetPasswordForm.get('newPassword').value;
      this._authService.ForgotPassword(this.forgotPassword).subscribe(
        (data) => {
          this.ResetControl();
          this.IsProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar('Password changed successfully', SnackBarStatus.success);
          this._router.navigate(['auth/login']);
        },
        (err) => {
          console.error(err);
          this.IsProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        }
      );
    }
    else {
      Object.keys(this.resetPasswordForm.controls).forEach(key => {
        this.resetPasswordForm.get(key).markAsDirty();
      });
    }
  }

}

