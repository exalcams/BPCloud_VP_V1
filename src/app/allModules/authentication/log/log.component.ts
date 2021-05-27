import { DatePipe } from '@angular/common';
import { ThrowStmt } from '@angular/compiler';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { ActionLogView, AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { ExcelService } from 'app/services/excel.service';
import * as SecureLS from 'secure-ls';

@Component({
  selector: 'app-log',
  templateUrl: './log.component.html',
  styleUrls: ['./log.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations

})
export class LogComponent implements OnInit {
  tableDisplayedColumns: string[] = ['UserName', 'AppName', 'Action', 'ActionText', "UsedOn"];
  tableDataSource: MatTableDataSource<ActionLogView>;
  ASNList: ActionLogView[] = [];
  IsProgressBarVisibile: boolean;
  SearchFormGroup: FormGroup;
  isExpanded: boolean;
  @ViewChild(MatPaginator) LoginHistoryPaginator: MatPaginator;
  @ViewChild(MatSort) LoginHistorySort: MatSort;
  fuseConfig: any;
  BGClassName: any;
  authenticationDetails: AuthenticationDetails;
  currentUserID: any;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(private _authService: AuthService, 
    private formBuilder: FormBuilder, 
    private _datePipe: DatePipe, 
    private _excelService: ExcelService,
    private _fuseConfigService: FuseConfigService,
    private _router: Router,
    public snackBar: MatSnackBar,
  ) {
    this.IsProgressBarVisibile = false;
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.isExpanded = false;
  }

  ngOnInit() {
    this.SetUserPreference();
    const retrievedObject =  this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.MenuItems.indexOf('Log') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }

    } else {
      this._router.navigate(['/auth/login']);
    }
    this.GetAllActionLogs();
    this.InitializeSearchForm();
  }
  GetAllActionLogs()
  {
    this.IsProgressBarVisibile = true;
    this._authService.GetAllActionLogs().subscribe(
      (data) => {
        this.ASNList = data as ActionLogView[];
        this.tableDataSource = new MatTableDataSource<ActionLogView>(data);
        this.tableDataSource.paginator = this.LoginHistoryPaginator;
        this.tableDataSource.sort = this.LoginHistorySort;
        this.IsProgressBarVisibile = false;
      }
    );
  }
  InitializeSearchForm(): void {
    this.SearchFormGroup = this.formBuilder.group({
      UserName: [''],
      AppName: [''],
      UsedOn: [''],
    });
  }
  SearchClicked(): void {
    if (this.SearchFormGroup.valid) {
        const UsedOn = this.SearchFormGroup.get('UsedOn').value;
        let UsedDate = '';
        if (UsedOn) {
          UsedDate = this._datePipe.transform(UsedOn, 'yyyy-MM-dd');
        }
       
        const UserName = this.SearchFormGroup.get('UserName').value;
        const AppName = this.SearchFormGroup.get('AppName').value;
        this.IsProgressBarVisibile = true;
        this._authService.FilterASNList(UserName, AppName,UsedDate).subscribe(
          (data) => {
            this.ASNList = data as ActionLogView[];
            this.tableDataSource = new MatTableDataSource<ActionLogView>(this.ASNList);
            this.tableDataSource.paginator = this.LoginHistoryPaginator;
            this.tableDataSource.sort = this.LoginHistorySort;
            this.IsProgressBarVisibile = false;
          },
          (err) => {
            console.error(err);
            this.IsProgressBarVisibile = false;
          }
        );
    } 
    else {
      this.ShowValidationErrors(this.SearchFormGroup);
    }
  }
  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
  }
  exportAsXLSX(): void {
    const currentPageIndex = this.tableDataSource.paginator.pageIndex;
    const PageSize = this.tableDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.ASNList.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Username': x.CreatedBy,
        'App Name': x.AppName,
        'Action': x.Action,
        'Action Text': x.ActionText,
        'Used On': x.UsedOn ? this._datePipe.transform(x.UsedOn, 'dd-MM-yyyy') : '',
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'ActionLog');
  }
  ShowValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        console.log(key);
      }
      formGroup.get(key).markAsTouched();
      formGroup.get(key).markAsDirty();
      if (formGroup.get(key) instanceof FormArray) {
        const FormArrayControls = formGroup.get(key) as FormArray;
        Object.keys(FormArrayControls.controls).forEach(key1 => {
          if (FormArrayControls.get(key1) instanceof FormGroup) {
            const FormGroupControls = FormArrayControls.get(key1) as FormGroup;
            Object.keys(FormGroupControls.controls).forEach(key2 => {
              FormGroupControls.get(key2).markAsTouched();
              FormGroupControls.get(key2).markAsDirty();
              if (!FormGroupControls.get(key2).valid) {
                console.log(key2);
              }
            });
          } else {
            FormArrayControls.get(key1).markAsTouched();
            FormArrayControls.get(key1).markAsDirty();
          }
        });
      }
    });

  }
  ResetFilter(){
    this.ClearSearchFormGroup();
    this.GetAllActionLogs();
  }
  ClearSearchFormGroup(): void {
    this.SearchFormGroup.reset();
    Object.keys(this.SearchFormGroup.controls).forEach(key => {
      this.SearchFormGroup.get(key).markAsUntouched();
    });
  }
  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }
}
