import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatMenuTrigger, MatSort, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { PO } from 'app/models/Dashboard';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { BPCPayAccountStatement } from 'app/models/Payment.model';
import { AuthenticationDetails, AppUsage } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Router } from '@angular/router';
import { PaymentService } from 'app/services/payment.service';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { BPCPayment } from 'app/models/ReportModel';
import { DatePipe } from '@angular/common';
import { ExcelService } from 'app/services/excel.service';
import { MasterService } from 'app/services/master.service';
import { FuseConfigService } from '@fuse/services/config.service';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { ActionLog } from 'app/models/OrderFulFilment';
import { AuthService } from 'app/services/auth.service';
import * as SecureLS from 'secure-ls';

@Component({
  selector: 'app-account-statement',
  templateUrl: './account-statement.component.html',
  styleUrls: ['./account-statement.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class AccountStatementComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  AccountStatements: BPCPayAccountStatement[] = [];
  SearchFormGroup: FormGroup;
  isDateError: boolean;
  DefaultFromDate: Date;
  DefaultToDate: Date;
  searchText: string;
  SelectValue: string;
  isExpanded: boolean;
  tableDisplayedColumns: string[] = [
    'DocumentNumber',
    'DocumentDate',
    'ProfitCenter',
    'InvoiceNumber',
    'InvoiceDate',
    'InvoiceAmount',
    'PaidAmount',
    'Reference',
    'Balance',
    'Action'
  ];
  fuseConfig: any;
  BGClassName: any;
  isAccepted = false;
  render = false;
  tableDataSource: MatTableDataSource<BPCPayAccountStatement>;
  @ViewChild(MatPaginator) tablePaginator: MatPaginator;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  @ViewChild(MatSort) tableSort: MatSort;
  BPCPayAccountStatement: BPCPayAccountStatement[] = [];
  BCHeader: BPCPayAccountStatement;
  ActionLog: any;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private formBuilder: FormBuilder,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _authService: AuthService,
    private dialog: MatDialog,
    private paymentService: PaymentService,
    private _masterService: MasterService,
    private _datePipe: DatePipe,
    private _excelService: ExcelService,

  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.isDateError = false;
    this.searchText = '';
    this.SelectValue = 'All';
    this.isExpanded = false;
    this.DefaultFromDate = new Date();
    this.DefaultFromDate.setDate(this.DefaultFromDate.getDate() - 30);
    this.DefaultToDate = new Date();
    this.BCHeader = new BPCPayAccountStatement();

  }

  ngOnInit(): void {
    this.SetUserPreference();
    // Retrive authorizationData
    const retrievedObject = this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.MenuItems.indexOf('AccountStatement') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }

    } else {
      this._router.navigate(['/auth/login']);
    }
    this.CreateAppUsage();
    this.InitializeSearchForm();
    // this.GetAccountStatementByPatnerID();
    this.SearchClicked();
  }

  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'Account Statement';
    appUsage.UsageCount = 1;
    appUsage.CreatedBy = this.currentUserName;
    appUsage.ModifiedBy = this.currentUserName;
    this._masterService.CreateAppUsage(appUsage).subscribe(
      (data) => {
      },
      (err) => {
        console.error(err);
      }
    );
  }

  InitializeSearchForm(): void {
    this.SearchFormGroup = this.formBuilder.group({
      DocumentID: [''],
      ProfitCenter: [''],
      FromDate: [this.DefaultFromDate],
      ToDate: [this.DefaultToDate]
    });
  }
  ResetControl(): void {
    this.AccountStatements = [];
    this.ResetFormGroup(this.SearchFormGroup);
  }
  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }
  GetAccountStatementByPatnerID(): void {
    this.IsProgressBarVisibile = true;
    this.paymentService.GetAccountStatementByPartnerID(this.currentUserName).subscribe(
      (data) => {
        this.AccountStatements = data as BPCPayAccountStatement[];
        this.BPCPayAccountStatement = this.AccountStatements;
        this.tableDataSource = new MatTableDataSource<BPCPayAccountStatement>(this.AccountStatements);
        console.log('AccountStatements Table', this.tableDataSource.data);
        this.tableDataSource.paginator = this.tablePaginator;
        this.tableDataSource.sort = this.tableSort;
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        this.IsProgressBarVisibile = false;
        console.error(err);
      }
    );
  }

  DateSelected(): void {
    const FROMDATEVAL = this.SearchFormGroup.get('FromDate').value as Date;
    const TODATEVAL = this.SearchFormGroup.get('ToDate').value as Date;
    if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
      this.isDateError = true;
    } else {
      this.isDateError = false;
    }
  }
  SearchClicked(text = null): void {
    if (this.SearchFormGroup.valid) {
      if (text != null) {
        this.CreateActionLogvalues(text);
      }
      if (!this.isDateError) {
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
        const DocumentID = this.SearchFormGroup.get('DocumentID').value;
        const ProfitCenter = this.SearchFormGroup.get('ProfitCenter').value;
        this.IsProgressBarVisibile = true;
        this.paymentService.FilterAccountStatementByPartnerID(this.currentUserName, DocumentID, ProfitCenter, FromDate, ToDate).subscribe(
          (data) => {
            this.AccountStatements = data as BPCPayAccountStatement[];
            // this.BPCPayAccountStatement=this.AccountStatements;
            this.tableDataSource = new MatTableDataSource(this.AccountStatements);
            this.tableDataSource.paginator = this.tablePaginator;
            this.tableDataSource.sort = this.tableSort;
            this.render = true;
            this.IsProgressBarVisibile = false;

          },
          (err) => {
            console.error(err);
            this.IsProgressBarVisibile = false;
          }
        );
      }
    } else {
      this.ShowValidationErrors(this.SearchFormGroup);
    }
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
  exportAsXLSX(): void {
    this.CreateActionLogvalues("Export As XLSX");
    const currentPageIndex = this.tableDataSource.paginator.pageIndex;
    const PageSize = this.tableDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.AccountStatements.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Document Number': x.DocumentNumber,
        'Document Date': x.DocumentDate ? this._datePipe.transform(x.DocumentDate, 'dd-MM-yyyy') : '',
        'Invoice Number': x.InvoiceNumber,
        'Invoice Date': x.InvoiceDate ? this._datePipe.transform(x.InvoiceDate, 'dd-MM-yyyy') : '',
        'Invoice Amount': x.InvoiceAmount,
        'Paid Amount': x.PaidAmount,
        'Reference': x.Reference,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'accountstatement');
  }
  expandClicked(): void {
    // this.CreateActionLogvalues("Expand");
    this.isExpanded = !this.isExpanded;
  }
  applyFilter(event: Event): void {
    // this.CreateActionLogvalues("SearchBarFilter");
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
  }
  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // console.log("Account-statement",this.BGClassName);
    // this._fuseConfigService.config = this.fuseConfig;
  }
  handle_accept(element: BPCPayAccountStatement): void {
    this.CreateActionLogvalues("Get Solved");
    // console.log('handle_accept', element);
    if (this.BPCPayAccountStatement.length >= 1) {
      this.BPCPayAccountStatement.pop();
    }
    this.BPCPayAccountStatement.push(element);
    this.OpenConfirmationDialog('Confirm', 'Balance');

  }
  handle_getsolved(element: BPCPayAccountStatement): void {
    this.BCHeader = element;
    this._router.navigate(["/support/supportticket"], {
      queryParams: { period: this.BCHeader.FiscalYear },
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
          this.AccpetAccountStatement();
        }
      });
  }
  AccpetAccountStatement(): void {
    this.IsProgressBarVisibile = true;
    this.BPCPayAccountStatement.forEach((Payment) => {
      Payment.AcceptedBy = this.currentUserName;
    });
    // console.log('AccpetAccountStatement', this.BPCPayAccountStatement);
    this.paymentService.AcceptBC(this.BPCPayAccountStatement).subscribe(x => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar('Account Statement Confirmed', SnackBarStatus.success);
      this.SearchClicked();
    }, err => {
      this.IsProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    });
  }
  CreateActionLogvalues(text): void {
    this.ActionLog = new ActionLog();
    this.ActionLog.UserID = this.currentUserID;
    this.ActionLog.AppName = "Account statement";
    this.ActionLog.ActionText = text + " is Clicked";
    this.ActionLog.Action = text;
    this.ActionLog.CreatedBy = this.currentUserName;
    this._authService.CreateActionLog(this.ActionLog).subscribe(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
  }
}

export class Test {
  Document: string;
  DocumentDate: Date;
  PostingDate: Date;
  Reference: string;
  DebitAmount: number;
  CreditAmount: number;
  LineItemText: string;
}
