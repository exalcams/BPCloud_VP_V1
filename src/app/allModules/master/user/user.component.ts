import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatSnackBar, MatDialogConfig, MatDialog, MatTableDataSource, MatPaginator, MatMenuTrigger, MatSort } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { UserWithRole, AuthenticationDetails, RoleWithApp, AppUsage, AppUsageView } from 'app/models/master';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { DatePipe } from '@angular/common';
import { ExcelService } from 'app/services/excel.service';
import { BPCPlantMaster } from 'app/models/OrderFulFilment';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class UserComponent implements OnInit {
  AllUsers: UserWithRole[] = [];
  AllRoles: RoleWithApp[] = [];
  AllPlant: BPCPlantMaster[] = [];
  selectedUser: UserWithRole;
  menuItems: string[];
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  selectID: Guid;
  userMainFormGroup: FormGroup;
  searchText: string;
  searchTextTwo: string;
  SelectValue: string;
  isExpanded: boolean;
  AppUsages: AppUsageView[] = [];
  selected: string[] = [];
  tableDisplayedColumns: string[] = [
    'AppName',
    'UsageCount',
    'LastUsedOn',
  ];
  tableDataSource: MatTableDataSource<AppUsageView>;
  @ViewChild(MatPaginator) tablePaginator: MatPaginator;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  @ViewChild(MatSort) tableSort: MatSort;
  role_name: any;
  bool_role: boolean = true;
  AllPlantForAllUsers: any[] = [];
  SelectedPlant: string[];
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _datePipe: DatePipe,
    private _excelService: ExcelService,) {
    this.selectedUser = new UserWithRole();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.isProgressBarVisibile = true;
    this.searchText = '';
    this.searchTextTwo = '',
      this.SelectValue = 'All';
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

      this.userMainFormGroup = this._formBuilder.group({
        userName: ['', Validators.required],
        roleID: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        contactNumber: ['', [Validators.required, Validators.pattern]],
        displayName: ['', Validators.required],
        profile: [''],
        Plant: []
      });
      this.GetAllRoles();
      this.GetAllPlant();
      // this.GetAllUsers();
      this.GetAllPlant_PO();
      //  this.selected.push("2000")

    } else {
      this._router.navigate(['/auth/login']);
    }

  }

  ResetControl(): void {
    this.selectedUser = new UserWithRole();
    this.selectID = Guid.createEmpty();
    this.userMainFormGroup.reset();
    Object.keys(this.userMainFormGroup.controls).forEach(key => {
      this.userMainFormGroup.get(key).markAsUntouched();
    });
    this.AppUsages = [];
    // this.fileToUpload = null;
  }
  GetAllPlant(): void {
    this._masterService.GetAllPlant_auth().subscribe(
      (data) => {
        // console.log("Getplant", data);
        this.AllPlantForAllUsers = data;
        // console.log("this.AllPlantForAllUsers", this.AllPlantForAllUsers)
        if (data) {
          this.GetAllUsers();
        }

      },
      (err) => {
        console.log(err);
      }
    );
  }
  GetAllPlant_PO(): void {
    this._masterService.GetAllPlant().subscribe(
      (data) => {
        this.AllPlant = <BPCPlantMaster[]>data;
        // console.log("plant", data);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  GetAllRoles(): void {
    this._masterService.GetAllRoles().subscribe(
      (data) => {
        this.AllRoles = <RoleWithApp[]>data;
        // console.log("allroles", this.AllRoles);
        // console.log(this.AllMenuApps);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  GetAllUsers(): void {
    this.isProgressBarVisibile = true;
    this._masterService.GetAllUsers().subscribe(
      (data) => {
        this.isProgressBarVisibile = false;
        this.AllUsers = <UserWithRole[]>data;
        // console.log("users", this.AllUsers);
        if (this.AllUsers && this.AllUsers.length) {
          this.loadSelectedUser(this.AllUsers[0]);
        }
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  loadSelectedUser(selectedUser: UserWithRole): void {
    this.bool_role = true;
    this._masterService.GetAllPlant_auth().subscribe(
      (data) => {
        // console.log("Getplant", data);
        this.AllPlantForAllUsers = data;
        // console.log("this.AllPlantForAllUsers", this.AllPlantForAllUsers)
        // if(data){
        //   this.GetAllUsers()
        // }
      },
      (err) => {
        console.log(err);
      }
    );
    this.selected = [];
    // this.selected.push("2000")
    this.selectID = selectedUser.UserID;
    // console.log("selectID", this.selectID);
    this.selectedUser = selectedUser;
    // console.log("selectedUser", this.selectedUser);
    this.SetUserValues();
    // console.log("roleid", this.userMainFormGroup.get('roleID').value);
    const rolID = this.userMainFormGroup.get('roleID').value;
    const rolName = this.GetUserRoleName(rolID);
    if (rolName === "Buyer" || rolName === "GateUser") {
      this.bool_role = false;
    }
    this.GetAppUsagesByUser();
    this.AllPlantForAllUsers.forEach(element => {
      if (element.UserID === this.selectID && element.UserName === selectedUser.UserName && element.Email === selectedUser.Email) {
        this.selected.push(element.PlantID);
      }
      // console.log("selected", this.selected);
    });
    this.userMainFormGroup.get('Plant').setValue(this.selected);
  }
  OnAppNameChanged(): void {
    const SelectedValues = this.userMainFormGroup.get('Plant').value as string[];
    // if (SelectedValues.includes(this.SelectedPlant)) {
    //   this.userMainFormGroup.get('appIDList').patchValue([this.SelectedPlant]);
    // //  this.notificationSnackBarComponent.openSnackBar('All have all the menu items, please uncheck All if you want to select specific menu', SnackBarStatus.info, 4000);

    // }
  }
  SetUserValues(): void {

    this.userMainFormGroup.get('userName').patchValue(this.selectedUser.UserName);
    this.userMainFormGroup.get('displayName').patchValue(this.selectedUser.DisplayName);
    this.userMainFormGroup.get('roleID').patchValue(this.selectedUser.RoleID);
    this.userMainFormGroup.get('email').patchValue(this.selectedUser.Email);
    this.userMainFormGroup.get('contactNumber').patchValue(this.selectedUser.ContactNumber);

    // this.userMainFormGroup.get('plant').patchValue(this.this.selectedUser)
  }

  GetAppUsagesByUser(): void {
    this.isProgressBarVisibile = true;
    this._masterService.GetAppUsagesByUser(this.selectedUser.UserID).subscribe(
      (data) => {
        this.isProgressBarVisibile = false;
        this.AppUsages = data as AppUsageView[];
        this.tableDataSource = new MatTableDataSource(this.AppUsages);
        this.tableDataSource.paginator = this.tablePaginator;
        this.tableDataSource.sort = this.tableSort;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
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
            this.CreateUser();
          } else if (Actiontype === 'Update') {
            this.UpdateUser();
          } else if (Actiontype === 'Delete') {
            this.DeleteUser();
          }
        }
      });
  }

  GetUserValues(): void {
    this.selectedUser.UserName = this.userMainFormGroup.get('userName').value;
    this.selectedUser.DisplayName = this.userMainFormGroup.get('displayName').value;
    this.selectedUser.RoleID = <Guid>this.userMainFormGroup.get('roleID').value;
    this.selectedUser.Email = this.userMainFormGroup.get('email').value;
    this.selectedUser.ContactNumber = this.userMainFormGroup.get('contactNumber').value;
    this.selectedUser.Plant = <string[]>this.userMainFormGroup.get('Plant').value;
  }
  GetUserRoleName(roleID: any): string {
    const res = this.AllRoles.filter(x => x.RoleID === roleID)[0];
    if (res) {
      return res.RoleName;
    }
    return '';
  }
  CreateUser(): void {
    this.GetUserValues();
    this.selectedUser.CreatedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.CreateUser(this.selectedUser).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('User created successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllUsers();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );

  }

  UpdateUser(): void {
    this.GetUserValues();
    this.selectedUser.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    // console.log("selected", this.selectedUser);

    this._masterService.UpdateUser(this.selectedUser).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('User updated successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllUsers();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }

  DeleteUser(): void {
    this.GetUserValues();
    this.selectedUser.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.DeleteUser(this.selectedUser).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('User deleted successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllUsers();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }

  ShowValidationErrors(): void {
    Object.keys(this.userMainFormGroup.controls).forEach(key => {
      this.userMainFormGroup.get(key).markAsTouched();
      this.userMainFormGroup.get(key).markAsDirty();
    });

  }
  Roleselect(eve): void {
    // console.log("eveofid", eve);
    this.AllRoles.forEach(element => {
      if (element.RoleID === eve.value) {
        this.role_name = element.RoleName;
      }
    });
    // console.log(this.role_name);
    if (this.role_name === "Buyer" || this.role_name === "GateUser") {
      this.bool_role = false;
      // this._masterService.GetAllPlant().subscribe(
      //   (data) => {
      //     this.AllPlant = <BPCPlantMaster[]>data;
      //     console.log("plant", data);
      //   },
      //   (err) => {
      //     console.log(err);
      //   }
      // );
    }
    else {
      this.bool_role = true;
    }

  }

  SaveClicked(): void {
    if (this.userMainFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.selectedUser.UserID) {
        const Actiontype = 'Update';
        const Catagory = 'User';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'User';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  DeleteClicked(): void {
    if (this.userMainFormGroup.valid) {
      if (this.selectedUser.UserID) {
        const Actiontype = 'Delete';
        const Catagory = 'User';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }


  exportAsXLSX(): void {
    const currentPageIndex = this.tableDataSource.paginator.pageIndex;
    const PageSize = this.tableDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.AppUsages.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'User ID': x.UserID,
        'User Name': x.UserName,
        'User Role': x.UserRole,
        'App Name': x.AppName,
        'Usages': x.UsageCount,
        'Last UsedOn': x.LastUsedOn ? this._datePipe.transform(x.LastUsedOn, 'dd-MM-yyyy') : '',
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, `${this.selectedUser.UserName}AppUsage`);
  }
  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
  }
}

