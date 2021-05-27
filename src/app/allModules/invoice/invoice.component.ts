import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails, AppUsage } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { FuseConfigService } from '@fuse/services/config.service';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { fuseAnimations } from '@fuse/animations';
import { ReportService } from 'app/services/report.service';
import { BPCInvoice } from 'app/models/ReportModel';
import { DatePipe } from '@angular/common';
import { ExcelService } from 'app/services/excel.service';
import { MasterService } from 'app/services/master.service';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class InvoiceComponent implements OnInit {
  BGClassName: any;
  fuseConfig: any;
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  InvoiceDisplayedColumns: string[] = [
    'InvoiceNo',
    'InvoiceDate',
    'PostingDate',
    'InvoiceAmount',
    'Currency',
    'ASN',
    'ASNDate',
   
  ];
  AllInvoices: BPCInvoice[];
  InvoiceDataSource: MatTableDataSource<BPCInvoice>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  SearchFormGroup: FormGroup;
  isDateError: boolean;
  DefaultFromDate: Date;
  DefaultToDate: Date;
  searchText: string;
  SelectValue: string;
  isExpanded: boolean;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(private _fuseConfigService: FuseConfigService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _masterService: MasterService,
    private _reportService: ReportService,
    private _excelService: ExcelService,
    private _datePipe: DatePipe,
    private _authService: AuthService,

  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.authenticationDetails = new AuthenticationDetails();
    this.IsProgressBarVisibile = false;
    this.isDateError = false;
    this.searchText = '';
    this.SelectValue = 'All';
    this.isExpanded = false;
    this.DefaultFromDate = new Date();
    this.DefaultFromDate.setDate(this.DefaultFromDate.getDate() - 30);
    this.DefaultToDate = new Date();
  }

  ngOnInit(): void {
    this.SetUserPreference();
    // Retrive authorizationData
    const retrievedObject =  this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      // if (this.MenuItems.indexOf('Dashboard') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //   );
      //   this._router.navigate(['/auth/login']);
      // }

    } else {
      this._router.navigate(['/auth/login']);
    }
    this.CreateAppUsage();
    this.InitializeSearchFormGroup();
    // this.GetAllInvoicesByPartnerID();
    this.SearchClicked();
  }
  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'Invoice';
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
  InitializeSearchFormGroup(): void {
    this.SearchFormGroup = this._formBuilder.group({
      FromDate: [this.DefaultFromDate],
      ToDate: [this.DefaultToDate],
      PONumber: [''],
      InvoiceNumber: [''],
      Status: ['All'],
    });
  }
  ResetControl(): void {
    this.AllInvoices = [];
    this.ResetFormGroup(this.SearchFormGroup);
  }
  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }
  getBackGroundColor(status: string): string {
    switch (status) {
      case 'Approved':
        return '#cdfcd6';
      case 'Awaiting Approval':
        return '#fdffc6';
      case 'Pending':
        return '#fdb9b1';
      default:
        return 'white';
    }
  }

  GetAllInvoicesByPartnerID(): void {
    this.IsProgressBarVisibile = true;
    this._reportService.GetAllInvoicesByPartnerID(this.currentUserName).subscribe(
      (data) => {
        this.AllInvoices = data as BPCInvoice[];
        this.InvoiceDataSource = new MatTableDataSource(this.AllInvoices);
        this.InvoiceDataSource.paginator = this.paginator;
        this.InvoiceDataSource.sort = this.sort;
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );

  }
  SearchClicked(): void {
    if (this.SearchFormGroup.valid) {
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
        const PONumberr = this.SearchFormGroup.get('PONumber').value;
        const InvoiceNumberr = this.SearchFormGroup.get('InvoiceNumber').value;
        const Statuss = this.SearchFormGroup.get('Status').value;
        this.IsProgressBarVisibile = true;
        this._reportService.GetFilteredInvoicesByPartnerID(this.currentUserName, InvoiceNumberr, PONumberr, FromDate, ToDate, Statuss).subscribe(
          (data) => {
            this.AllInvoices = data as BPCInvoice[];
            this.InvoiceDataSource = new MatTableDataSource(this.AllInvoices);
            this.InvoiceDataSource.paginator = this.paginator;
            this.InvoiceDataSource.sort = this.sort;
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
  SetUserPreference(): void {
    this._fuseConfigService.config
        .subscribe((config) => {
            this.fuseConfig = config;
            this.BGClassName = config;
        });
    // this._fuseConfigService.config = this.fuseConfig;
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
    const currentPageIndex = this.InvoiceDataSource.paginator.pageIndex;
    const PageSize = this.InvoiceDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.AllInvoices.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Invoice No': x.InvoiceNo,
        'Invoice Date': x.InvoiceDate ? this._datePipe.transform(x.InvoiceDate, 'dd-MM-yyyy') : '',
        'Po Reference': x.PoReference,
        'Invoice Amount': x.InvoiceAmount,
        'Paid Amount': x.PaidAmount,
        'Payment Date': x.DateofPayment ? this._datePipe.transform(x.DateofPayment, 'dd-MM-yyyy') : '',
        'Status': x.Status,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'invoice');
    // const itemsShowed1 = this.TransDetailsTable.nativeElement;
    // this.excelService.exportTableToExcel(itemsShowed1, 'Sample');
  }
  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.InvoiceDataSource.filter = filterValue.trim().toLowerCase();
  }
}

