import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ReportService } from 'app/services/report.service';
import { BPCReportDOL } from 'app/models/ReportModel';
import { MatTableDataSource } from '@angular/material/table';
import { Chart } from 'chart.js';
import * as XLSX from 'xlsx';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { colorSets } from '@swimlane/ngx-charts/release/utils';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { AuthenticationDetails, AppUsage } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { MatPaginator, MatMenuTrigger, MatSort, MatSnackBar, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ExcelService } from 'app/services/excel.service';
import { MasterService } from 'app/services/master.service';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-dol',
  templateUrl: './dol.component.html',
  styleUrls: ['./dol.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class DOLComponent implements OnInit {
  fuseConfig: any;
  BGClassName: any;
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  menuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  searchFormGroup: FormGroup;
  isDateError: boolean;
  searchText: string;
  selectValue: string;
  isExpanded: boolean;
  defaultFromDate: Date;
  defaultToDate: Date;
  dolReportDisplayedColumns: string[] = ['Material', 'MaterialText'];
  dolReportDataSource: MatTableDataSource<BPCReportDOL>;
  dolReports: BPCReportDOL[] = [];
  @ViewChild(MatPaginator) dolPaginator: MatPaginator;
  @ViewChild(MatSort) dolSort: MatSort;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _authService: AuthService,
    private _reportService: ReportService,
    private formBuilder: FormBuilder,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _masterService: MasterService,
    private _datePipe: DatePipe,
    private _excelService: ExcelService) {
      this.SecretKey = this._authService.SecretKey;
      this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.isProgressBarVisibile = false;
    this.isDateError = false;
    this.searchText = '';
    this.selectValue = 'All';
    this.isExpanded = false;
    this.defaultFromDate = new Date();
    this.defaultFromDate.setDate(this.defaultFromDate.getDate() - 30);
    this.defaultToDate = new Date();
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
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.menuItems.indexOf('DOL') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.CreateAppUsage();
    this.GetDOLReportsByPartnerID();
    // this.initializeSearchForm();
    // this.searchButtonClicked();
  }

  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'DOL';
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

  GetDOLReportsByPartnerID(): void {
    this.isProgressBarVisibile = true;
    this._reportService.GetAllReportDOLByPartnerID(this.currentUserName).subscribe(
      (data) => {
        this.dolReports = data as BPCReportDOL[];
        this.dolReportDataSource = new MatTableDataSource(this.dolReports);
        this.dolReportDataSource.paginator = this.dolPaginator;
        this.dolReportDataSource.sort = this.dolSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  // GetDOLReportByOption(dolReportOption: DOLReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetDOLReportByOption(dolReportOption).subscribe(
  //     (data) => {
  //       this.dolReports = data as BPCReportDOL[];
  //       this.dolReportDataSource = new MatTableDataSource(this.dolReports);
  //       this.dolReportDataSource.paginator = this.dolPaginator;
  //       this.dolReportDataSource.sort = this.dolSort;
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  // GetDOLReportByStatus(dolReportOption: DOLReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetDOLReportByStatus(dolReportOption).subscribe(
  //     (data) => {
  //       this.dolReports = data as BPCReportDOL[];
  //       this.dolReportDataSource = new MatTableDataSource(this.dolReports);
  //       this.dolReportDataSource.paginator = this.dolPaginator;
  //       this.dolReportDataSource.sort = this.dolSort;
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  // GetDOLReportByDate(dolReportOption: DOLReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetDOLReportByDate(dolReportOption).subscribe(
  //     (data) => {
  //       this.dolReports = data as BPCReportDOL[];
  //       this.dolReportDataSource = new MatTableDataSource(this.dolReports);
  //       this.dolReportDataSource.paginator = this.dolPaginator;
  //       this.dolReportDataSource.sort = this.dolSort;
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  initializeSearchForm(): void {
    this.searchFormGroup = this.formBuilder.group({
      PONumber: [''],
      Material: ['']
      // FromDate: [this.defaultFromDate],
      // ToDate: [this.defaultToDate]
    });
  }

  resetControl(): void {
    this.dolReports = [];
    this.resetFormGroup(this.searchFormGroup);
  }

  resetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }

  // dateSelected(): void {
  //   const FROMDATEVAL = this.searchFormGroup.get('FromDate').value as Date;
  //   const TODATEVAL = this.searchFormGroup.get('ToDate').value as Date;
  //   if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
  //     this.isDateError = true;
  //   } else {
  //     this.isDateError = false;
  //   }
  // }

  // searchButtonClicked(): void {
  //   if (this.searchFormGroup.valid) {
  //     // if (!this.isDateError) {
  //     // const FrDate = this.searchFormGroup.get('FromDate').value;
  //     // let FromDate = '';
  //     // if (FrDate) {
  //     //   FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
  //     // }
  //     // const TDate = this.searchFormGroup.get('ToDate').value;
  //     // let ToDate = '';
  //     // if (TDate) {
  //     //   ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
  //     // }
  //     const poNumber = this.searchFormGroup.get('PONumber').value;
  //     const material = this.searchFormGroup.get('Material').value;
  //     const dolReportOption = new DOLReportOption();
  //     dolReportOption.Material = material;
  //     dolReportOption.PO = poNumber;
  //     // dolReportOption.FromDate = FromDate;
  //     // dolReportOption.ToDate = ToDate;
  //     dolReportOption.PartnerID = this.currentUserName;
  //     this.GetDOLReportByOption(dolReportOption);
  //     // }
  //   } else {
  //     this.showValidationErrors(this.searchFormGroup);
  //   }
  // }

  showValidationErrors(formGroup: FormGroup): void {
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
    const currentPageIndex = this.dolReportDataSource.paginator.pageIndex;
    const PageSize = this.dolReportDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.dolReports.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Material': x.Material,
        // 'Material': x.InvoiceDate ? this._datePipe.transform(x.InvoiceDate, 'dd-MM-yyyy') : '',
        // 'Posted on': x.PostedOn ? this._datePipe.transform(x.PostedOn, 'dd-MM-yyyy') : '',
        'Material Text': x.MaterialText,
        // 'Input Quantity': x.InputQty,
        // 'Accepted Quantity': x.AccQty,
        // 'Rejected Quantity': x.RejQty,
        // 'Rejected Percentage': x.RejPercentage,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'dol');
  }

  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dolReportDataSource.filter = filterValue.trim().toLowerCase();
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
