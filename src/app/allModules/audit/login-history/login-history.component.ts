import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails, LoginHistoryFilter, UserLoginHistory } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar } from '@angular/material';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { MasterService } from 'app/services/master.service';
import { ExcelService } from 'app/services/excel.service';
import { fuseAnimations } from '@fuse/animations';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-login-history',
  templateUrl: './login-history.component.html',
  styleUrls: ['./login-history.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class LoginHistoryComponent implements OnInit {

  authenticationDetails: AuthenticationDetails;
  MenuItems: string[];
  CurrentUserEmailAddress: string;
  CurrentUserName: string;
  CurrentUserRole: string;
  CurrentUserID: Guid;
  IsProgressBarVisibile: boolean;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  SearchFormGroup: FormGroup;
  loginHistoryFilter: LoginHistoryFilter;
  AllUserLoginHistories: UserLoginHistory[] = [];
  DefaultFromDate: Date;
  DefaultToDate: Date;
  isDateError: boolean;
  isExpanded: boolean;
  searchText: string;
  SelectValue: string;
  tableDataSource: MatTableDataSource<UserLoginHistory>;
  tableDisplayedColumns: string[] = ['UserName', 'LoginTime', 'LogoutTime'];
  @ViewChild(MatPaginator) LoginHistoryPaginator: MatPaginator;
  @ViewChild(MatSort) LoginHistorySort: MatSort;

  constructor(public _matDialog: MatDialog,
    private _masterService: MasterService,
    private _formBuilder: FormBuilder,
    private _datePipe: DatePipe,
    private _excelService: ExcelService,
    private dialog: MatDialog,
    public snackBar: MatSnackBar,
    private _router: Router
  ) {
    this.authenticationDetails = new AuthenticationDetails();
    this.IsProgressBarVisibile = false;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.isDateError = false;
    this.isExpanded = false;
    this.searchText = '';
    this.SelectValue = 'All';
    this.DefaultFromDate = new Date();
    this.DefaultFromDate.setDate(this.DefaultFromDate.getDate() - 30);
    this.DefaultToDate = new Date();
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserID = this.authenticationDetails.UserID;
      this.CurrentUserName = this.authenticationDetails.UserName;
      this.CurrentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.MenuItems.indexOf('LoginHistory') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }

    } else {
      this._router.navigate(['/auth/login']);
    }
    this.InitializeSearchForm();
    this.SearchClicked();
  }

  InitializeSearchForm(): void {
    this.SearchFormGroup = this._formBuilder.group({
      UserName: [''],
      FromDate: [this.DefaultFromDate],
      ToDate: [this.DefaultToDate]
    });
  }

  ResetControl(): void {
    this.AllUserLoginHistories = [];
    this.ResetFormGroup(this.SearchFormGroup);
  }
  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }
  // Administrator
  GetAllUsersLoginHistory(): void {
    this._masterService.GetAllUsersLoginHistory().subscribe(
      (data) => {
        this.AllUserLoginHistories = data as UserLoginHistory[];
        this.tableDataSource = new MatTableDataSource(this.AllUserLoginHistories);
        this.tableDataSource.paginator = this.LoginHistoryPaginator;
        this.tableDataSource.sort = this.LoginHistorySort;
        this.IsProgressBarVisibile = false;
      }, (error) => {
        console.error(error);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  GetCurrentUserLoginHistory(): void {
    this._masterService.GetCurrentUserLoginHistory(this.CurrentUserID).subscribe(
      (data) => {
        this.AllUserLoginHistories = data as UserLoginHistory[];
        this.tableDataSource = new MatTableDataSource(this.AllUserLoginHistories);
        this.tableDataSource.paginator = this.LoginHistoryPaginator;
        this.tableDataSource.sort = this.LoginHistorySort;
        this.IsProgressBarVisibile = false;
      }, (error) => {
        console.error(error);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  SearchClicked(): void {
    if (this.SearchFormGroup.valid) {
      if (!this.isDateError) {
        this.IsProgressBarVisibile = true;
        const UserName = this.SearchFormGroup.get('UserName').value;
        const FrDate = this.SearchFormGroup.get('FromDate').value;
        let FromDate = '';
        if (FrDate) {
          FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
        }
        const TDate = this.SearchFormGroup.get('ToDate').value;
        let ToDate = '';
        if (TDate) {
          ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
        }
        if (this.CurrentUserRole === 'Administrator') {
          this._masterService.FilterLoginHistory(UserName, FromDate, ToDate)
            .subscribe((data) => {
              this.AllUserLoginHistories = data as UserLoginHistory[];
              this.tableDataSource = new MatTableDataSource(this.AllUserLoginHistories);
              this.tableDataSource.paginator = this.LoginHistoryPaginator;
              this.tableDataSource.sort = this.LoginHistorySort;
              this.IsProgressBarVisibile = false;
            }, (error) => {
              console.error(error);
              this.IsProgressBarVisibile = false;
            }
            );
        } else {
          this._masterService.FilterLoginHistoryByUser(UserName, FromDate, ToDate)
            .subscribe((data) => {
              this.AllUserLoginHistories = data as UserLoginHistory[];
              this.tableDataSource = new MatTableDataSource(this.AllUserLoginHistories);
              this.tableDataSource.paginator = this.LoginHistoryPaginator;
              this.tableDataSource.sort = this.LoginHistorySort;
              this.IsProgressBarVisibile = false;
            }, (error) => {
              console.error(error);
              this.IsProgressBarVisibile = false;
            }
            );
        }

      }
    } else {
      Object.keys(this.SearchFormGroup.controls).forEach(key => {
        this.SearchFormGroup.get(key).markAsTouched();
        this.SearchFormGroup.get(key).markAsDirty();
      });
    }
  }
  onKeydown(event): boolean {
    // console.log(event.key);
    if (event.key === 'Backspace' || event.key === 'Delete') {
      return true;
    } else {
      return false;
    }
  }
  DateSelected(): void {
    const FROMDATEVAL = this.SearchFormGroup.get('fromDate').value as Date;
    const TODATEVAL = this.SearchFormGroup.get('toDate').value as Date;
    if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
      this.isDateError = true;
    } else {
      this.isDateError = false;
    }
  }
  exportAsXLSX(): void {
    const currentPageIndex = this.tableDataSource.paginator.pageIndex;
    const PageSize = this.tableDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.AllUserLoginHistories.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'UserName': x.UserName,
        'Login Time': x.LoginTime ? this._datePipe.transform(x.LoginTime, 'dd-MM-yyyy') : '',
        'Logout Time': x.LogoutTime ? this._datePipe.transform(x.LoginTime, 'dd-MM-yyyy') : '',
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'loginHistory');
  }
  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
  }
}
