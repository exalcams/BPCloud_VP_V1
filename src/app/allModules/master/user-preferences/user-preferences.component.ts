import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { AuthenticationDetails, UserPreference } from 'app/models/master';
import { Subject } from 'rxjs';
import { FuseConfigService } from '@fuse/services/config.service';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { ActionLog } from 'app/models/OrderFulFilment';
import { AuthService } from 'app/services/auth.service';
import * as SecureLS from 'secure-ls';

@Component({
  selector: 'app-user-preferences',
  templateUrl: './user-preferences.component.html',
  styleUrls: ['./user-preferences.component.scss']
})
export class UserPreferencesComponent implements OnInit {

  BGClassName: any;
  userPreference: UserPreference;
  userPreferenceFormGroup: FormGroup;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  authenticationDetails: AuthenticationDetails;
  MenuItems: string[];
  IsProgressBarVisibile: boolean;
  fuseConfig: any;
  private _unsubscribeAll: Subject<any>;
  ActionLog: any;
  CurrentUserId: any;
  CurrentUserName: string;
  SecretKey: string;
  SecureStorage: SecureLS;

  constructor(private _fuseConfigService: FuseConfigService,
    private _masterService: MasterService,
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });

    this.userPreferenceFormGroup = this._formBuilder.group({
      navbarPrimaryBackground: [''],
      navbarSecondaryBackground: [''],
      toolbarBackground: ['']
    });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.userPreference = new UserPreference();
    this.authenticationDetails = new AuthenticationDetails();
    this._unsubscribeAll = new Subject();
  }

  ngOnInit(): void {
    // // console.log(this.currentSelecteduserPreference);
    // Retrive authorizationData
    const retrievedObject = this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserName = this.authenticationDetails.UserName;
      this.CurrentUserId = this.authenticationDetails.UserID;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.MenuItems.indexOf('UserPreferences') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.GetUserPreferenceByUserID();
  }
  ResetControl(): void {
    // this.userPreferenceFormGroup.get('appName').patchValue('');
    this.userPreference = new UserPreference();
    this.userPreferenceFormGroup.reset();
    Object.keys(this.userPreferenceFormGroup.controls).forEach(key => {
      this.userPreferenceFormGroup.get(key).markAsUntouched();
    });

  }
  GetUserPreferenceByUserID(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetUserPreferenceByUserID(this.authenticationDetails.UserID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        if (data) {
          this.userPreference = data as UserPreference;
          this.SecureStorage.set('userPreferenceData', JSON.stringify(this.userPreference));
          this.UpdateUserPreference();
          this.userPreferenceFormGroup.get('navbarPrimaryBackground').patchValue(this.userPreference.NavbarPrimaryBackground);
          this.userPreferenceFormGroup.get('navbarSecondaryBackground').patchValue(this.userPreference.NavbarSecondaryBackground);
          this.userPreferenceFormGroup.get('toolbarBackground').patchValue(this.userPreference.ToolbarBackground);
        } else {
          this.UpdateUserPreference();
          // console.log(this.userPreferenceFormGroup.get('navbarPrimaryBackground').value);
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  SaveClicked(): void {
    if (this.userPreferenceFormGroup.valid) {
      this.CreateActionLogvalues("Update/Create");
      const NavbarPrimaryBackground = this.userPreferenceFormGroup.get('navbarPrimaryBackground').value;
      const NavbarSecondaryBackground = this.userPreferenceFormGroup.get('navbarSecondaryBackground').value;
      const ToolbarBackground = this.userPreferenceFormGroup.get('toolbarBackground').value;
      if (!NavbarPrimaryBackground && !NavbarSecondaryBackground && !ToolbarBackground) {
        this.notificationSnackBarComponent.openSnackBar('Please select atleast on value', SnackBarStatus.danger);
      } else {
        if (this.userPreference.ID) {
          const dialogConfig: MatDialogConfig = {
            data: {
              Actiontype: 'Update',
              Catagory: 'User Preference'
            },
          };
          const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
          dialogRef.afterClosed().subscribe(
            result => {
              if (result) {
                this.IsProgressBarVisibile = true;
                this.userPreference.UserID = this.authenticationDetails.UserID;
                this.userPreference.NavbarPrimaryBackground = NavbarPrimaryBackground;
                this.userPreference.NavbarSecondaryBackground = NavbarSecondaryBackground;
                this.userPreference.ToolbarBackground = ToolbarBackground;
                this.userPreference.ModifiedBy = this.authenticationDetails.UserID.toString();
                this._masterService.UpdateUserPreference(this.userPreference).subscribe(
                  (data) => {
                    // // console.log(data);
                    this.ResetControl();
                    this.notificationSnackBarComponent.openSnackBar('User preference updated successfully', SnackBarStatus.success);
                    this.IsProgressBarVisibile = false;
                    this.GetUserPreferenceByUserID();
                  },
                  (err) => {
                    console.error(err);
                    this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                    this.IsProgressBarVisibile = false;
                    // this.ShowProgressBarEvent.emit('hide');
                  }
                );
              }
            });

        } else {
          const dialogConfig: MatDialogConfig = {
            data: {
              Actiontype: 'Create',
              Catagory: 'User Preference'
            },
          };
          const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
          dialogRef.afterClosed().subscribe(
            result => {
              if (result) {
                this.IsProgressBarVisibile = true;
                this.userPreference = new UserPreference();
                this.userPreference.UserID = this.authenticationDetails.UserID;
                this.userPreference.NavbarPrimaryBackground = NavbarPrimaryBackground;
                this.userPreference.NavbarSecondaryBackground = NavbarSecondaryBackground;
                this.userPreference.ToolbarBackground = ToolbarBackground;
                this.userPreference.CreatedBy = this.authenticationDetails.UserID.toString();
                this._masterService.CreateUserPreference(this.userPreference).subscribe(
                  (data) => {
                    // // console.log(data);
                    this.ResetControl();
                    this.notificationSnackBarComponent.openSnackBar('User preference created successfully', SnackBarStatus.success);
                    this.IsProgressBarVisibile = false;
                    this.GetUserPreferenceByUserID();
                  },
                  (err) => {
                    console.error(err);
                    this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                    this.IsProgressBarVisibile = false;
                    // this.ShowProgressBarEvent.emit('hide');
                  }
                );
              }
            });
        }
      }
    } else {
      Object.keys(this.userPreferenceFormGroup.controls).forEach(key => {
        this.userPreferenceFormGroup.get(key).markAsTouched();
        this.userPreferenceFormGroup.get(key).markAsDirty();
      });
    }
  }

  DeleteClicked(): void {
    // if (this.userPreferenceFormGroup.valid) {
    //   if (this.userPreference.ID) {
    //     const dialogConfig: MatDialogConfig = {
    //       data: {
    //         Actiontype: 'Delete',
    //         Catagory: 'User Preference'
    //       },
    //     };
    //     const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    //     dialogRef.afterClosed().subscribe(
    //       result => {
    //         if (result) {
    //           this.IsProgressBarVisibile = true;
    //           this.userPreference.UserID = this.authenticationDetails.UserID;
    //           this.userPreference.NavbarPrimaryBackground = this.userPreferenceFormGroup.get('navbarPrimaryBackground').value;
    //           this.userPreference.NavbarSecondaryBackground = this.userPreferenceFormGroup.get('navbarSecondaryBackground').value;
    //           this.userPreference.ToolbarBackground = this.userPreferenceFormGroup.get('toolbarBackground').value;
    //           this.userPreference.ModifiedBy = this.authenticationDetails.UserID.toString();
    //           this._masterService.DeleteUserPreference(this.userPreference).subscribe(
    //             (data) => {
    //               // // console.log(data);
    //               this.ResetControl();
    //               this.notificationSnackBarComponent.openSnackBar('User preference deleted successfully', SnackBarStatus.success);
    //               this.IsProgressBarVisibile = false;
    //               this.SecureStorage.remove('userPreferenceData');
    //               this.GetUserPreferenceByUserID();
    //               // this.SaveSucceed.emit('success');
    //               // this._masterService.TriggerNotification('App deleted successfully');
    //             },
    //             (err) => {
    //               console.error(err);
    //               this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    //               this.IsProgressBarVisibile = false;
    //               // this.ShowProgressBarEvent.emit('hide');
    //             }
    //           );
    //         }
    //       });
    //   }
    // } else {
    //   Object.keys(this.userPreferenceFormGroup.controls).forEach(key => {
    //     this.userPreferenceFormGroup.get(key).markAsTouched();
    //     this.userPreferenceFormGroup.get(key).markAsDirty();
    //   });
    // }
  }

  UpdateUserPreference(): void {
    this._fuseConfigService.config
      // .pipe(takeUntil(this._unsubscribeAll))
      .subscribe((config) => {
        // console.log("User Preference", config);
        this.fuseConfig = config;
        this.BGClassName = config;
        // Retrive user preference from Local Storage
        const userPre = this.SecureStorage.get('userPreferenceData');
        if (userPre) {
          const userPrefercence: UserPreference = JSON.parse(userPre) as UserPreference;
          if (userPrefercence.NavbarPrimaryBackground && userPrefercence.NavbarPrimaryBackground !== '-') {
            this.fuseConfig.layout.navbar.primaryBackground = userPrefercence.NavbarPrimaryBackground;
          } else {
            this.fuseConfig.layout.navbar.primaryBackground = 'fuse-navy-700';
          }
          if (userPrefercence.NavbarSecondaryBackground && userPrefercence.NavbarSecondaryBackground !== '-') {
            this.fuseConfig.layout.navbar.secondaryBackground = userPrefercence.NavbarSecondaryBackground;
          } else {
            this.fuseConfig.layout.navbar.secondaryBackground = 'fuse-navy-700';
          }
          if (userPrefercence.ToolbarBackground && userPrefercence.ToolbarBackground !== '-') {
            this.fuseConfig.layout.toolbar.background = userPrefercence.ToolbarBackground;
            this.fuseConfig.layout.toolbar.customBackgroundColor = true;
          } else {
            this.fuseConfig.layout.toolbar.background = 'blue-800';
            this.fuseConfig.layout.toolbar.customBackgroundColor = true;
          }
        } else {
          this.fuseConfig.layout.navbar.primaryBackground = 'fuse-navy-700';
          this.fuseConfig.layout.navbar.secondaryBackground = 'fuse-navy-700';
          this.fuseConfig.layout.toolbar.background = 'blue-800';
          this.fuseConfig.layout.toolbar.customBackgroundColor = true;
        }

      });
    this._fuseConfigService.config = this.fuseConfig;
  }
  CreateActionLogvalues(text): void {
    this.ActionLog = new ActionLog();
    this.ActionLog.UserID = this.CurrentUserId;
    this.ActionLog.AppName = "OrderFulfilmentCenter";
    this.ActionLog.ActionText = text + " is Clicked";
    this.ActionLog.Action = text;
    this.ActionLog.CreatedBy = this.CurrentUserName;
    this._authService.CreateActionLog(this.ActionLog).subscribe(
      (data) => {
        // console.log(data);
      },
      (err) => {
        console.error(err);
      }
    );
  }
}
