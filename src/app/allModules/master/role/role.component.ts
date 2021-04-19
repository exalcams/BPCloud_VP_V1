import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { AuthenticationDetails, RoleWithApp, MenuApp } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';

@Component({
  selector: 'role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class RoleComponent implements OnInit {
  menuItems: string[];
  selectedRole: RoleWithApp;
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  selectID: Guid;
  searchText = '';
  roleMainFormGroup: FormGroup;
  AllMenuApps: MenuApp[] = [];
  AllRoles: RoleWithApp[] = [];
  AppIDListAllID: number;

  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.selectedRole = new RoleWithApp();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.isProgressBarVisibile = true;
    this.AppIDListAllID = 0;
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.menuItems.indexOf('User') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }

      this.roleMainFormGroup = this._formBuilder.group({
        roleName: ['', Validators.required],
        appIDList: [[], Validators.required]
        // appIDList: [[], CustomValidators.selectedRole('Administrator')]
      });
      this.GetAllMenuApps();
      this.GetAllRoles();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }

  ResetControl(): void {
    this.selectedRole = new RoleWithApp();
    this.selectID = Guid.createEmpty();
    this.roleMainFormGroup.reset();
    Object.keys(this.roleMainFormGroup.controls).forEach(key => {
      this.roleMainFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  
  GetAllMenuApps(): void {
    this._masterService.GetAllMenuApp().subscribe(
      (data) => {
        this.AllMenuApps = <MenuApp[]>data;
        if (this.AllMenuApps && this.AllMenuApps.length > 0) {
          const xy = this.AllMenuApps.filter(x => x.AppName === 'All')[0];
          if (xy) {
            this.AppIDListAllID = xy.AppID;
          }
        }
      },
      (err) => {
        console.log(err);
      }
    );
  }

  GetAllRoles(): void {
    this.isProgressBarVisibile = true;
    this._masterService.GetAllRoles().subscribe(
      (data) => {
        this.isProgressBarVisibile = false;
        this.AllRoles = <RoleWithApp[]>data;
        if (this.AllRoles && this.AllRoles.length) {
          this.loadSelectedRole(this.AllRoles[0]);
        }
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  OnAppNameChanged(): void {
    // console.log('changed');
    const SelectedValues = this.roleMainFormGroup.get('appIDList').value as number[];
    if (SelectedValues.includes(this.AppIDListAllID)) {
      this.roleMainFormGroup.get('appIDList').patchValue([this.AppIDListAllID]);
      this.notificationSnackBarComponent.openSnackBar('All have all the menu items, please uncheck All if you want to select specific menu', SnackBarStatus.info, 4000);

    }
    // console.log(this.roleMainFormGroup.get('appIDList').value);
  }

  loadSelectedRole(selectedRole: RoleWithApp): void {
    this.selectID = selectedRole.RoleID;
    this.selectedRole = selectedRole;
    this.SetRoleValues();
  }

  SetRoleValues(): void {
    this.roleMainFormGroup.get('roleName').patchValue(this.selectedRole.RoleName);
    this.roleMainFormGroup.get('appIDList').patchValue(this.selectedRole.AppIDList);
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
            this.CreateRole();
          } else if (Actiontype === 'Update') {
            this.UpdateRole();
          } else if (Actiontype === 'Delete') {
            this.DeleteRole();
          }
        }
      });
  }

  GetRoleValues(): void {
    this.selectedRole.RoleName = this.roleMainFormGroup.get('roleName').value;
    this.selectedRole.AppIDList = <number[]>this.roleMainFormGroup.get('appIDList').value;
  }

  CreateRole(): void {
    this.GetRoleValues();
    this.selectedRole.CreatedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.CreateRole(this.selectedRole).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Role created successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllRoles();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );

  }

  UpdateRole(): void {
    this.GetRoleValues();
    this.selectedRole.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.UpdateRole(this.selectedRole).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Role updated successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllRoles();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }

  DeleteRole(): void {
    this.GetRoleValues();
    this.selectedRole.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.DeleteRole(this.selectedRole).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Role deleted successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllRoles();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }

  ShowValidationErrors(): void {
    Object.keys(this.roleMainFormGroup.controls).forEach(key => {
      this.roleMainFormGroup.get(key).markAsTouched();
      this.roleMainFormGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    if (this.roleMainFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.selectedRole.RoleID) {
        const Actiontype = 'Update';
        const Catagory = 'Role';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'Role';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  DeleteClicked(): void {
    if (this.roleMainFormGroup.valid) {
      if (this.selectedRole.RoleID) {
        const Actiontype = 'Delete';
        const Catagory = 'Role';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }
}

