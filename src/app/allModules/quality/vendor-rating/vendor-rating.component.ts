import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ReportService } from 'app/services/report.service';
import { BPCReportVR, VendorRatingReportOption } from 'app/models/ReportModel';
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

@Component({
  selector: 'app-vendor-rating',
  templateUrl: './vendor-rating.component.html',
  styleUrls: ['./vendor-rating.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class VendorRatingComponent implements OnInit {
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
  vendorRatingReportDisplayedColumns: string[] = ['Material', 'MaterialText', 'OrderQty', 'ReceivedQty', 'RejectedPPM', 'ReworkQty'];
  vendorRatingReportDataSource: MatTableDataSource<BPCReportVR>;
  vendorRatingReports: BPCReportVR[] = [];
  @ViewChild(MatPaginator) vendorRatingPaginator: MatPaginator;
  @ViewChild(MatSort) vendorRatingSort: MatSort;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;

  public canvasWidth = 200;
  public needleValue = 87;
  public centralLabel = '1354';

  public options = {
    responsive: true,
    hasNeedle: true,
    needleSize: 20,
    needleColor: 'rgb(79, 86, 92)',
    needleUpdateSpeed: 1000,
    arcColors: [" rgb(250, 79, 38)", "rgb(248, 164, 38)", "rgb(248, 208, 38)", "rgb(152, 210, 38)", "rgb(38, 192, 60)"],
    arcDelimiters: [20, 40, 60, 80],
    rangeLabel: [],
    needleStartValue: 50,
    needleEndValue: 1354,

  };

  public canvasWidth1 = 200;
  public needleValue1 = 61;
  public centralLabel1 = '620';

  public options1 = {
    hasNeedle: true,
    needleSize: 20,
    needleColor: 'rgb(79, 86, 92)',
    needleUpdateSpeed: 1000,
    arcColors: [" rgb(250, 79, 38)", "rgb(248, 164, 38)", "rgb(248, 208, 38)", "rgb(152, 210, 38)", "rgb(38, 192, 60)"],
    arcDelimiters: [20, 40, 60, 80],
    rangeLabel: [],
    needleStartValue: 20,
    needleEndValue: 1354,
  };

  public canvasWidth2 = 200;
  public needleValue2 = 68;
  public centralLabel2 = '720';

  public options2 = {
    hasNeedle: true,
    needleSize: 10,
    needleColor: 'rgb(79, 86, 92)',
    needleUpdateSpeed: 1000,
    arcColors: [" rgb(250, 79, 38)", "rgb(248, 164, 38)", "rgb(248, 208, 38)", "rgb(152, 210, 38)", "rgb(38, 192, 60)"],
    arcDelimiters: [20, 40, 60, 80],
    rangeLabel: [],
    needleStartValue: 50,
    needleEndValue: 1354

  };
  constructor(
    private _fuseConfigService: FuseConfigService,

    private _reportService: ReportService,
    private formBuilder: FormBuilder,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _masterService: MasterService,
    private _datePipe: DatePipe,
    private _excelService: ExcelService) {
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
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      // if (this.menuItems.indexOf('VendorRating') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //   );
      //   this._router.navigate(['/auth/login']);
      // }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.CreateAppUsage();
    this.GetVendorRatingReports();
    // this.initializeSearchForm();
    // this.searchButtonClicked();
  }

  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'VendorRating';
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

  GetVendorRatingReports(): void {
    this.isProgressBarVisibile = true;
    this._reportService.GetVendorRatingReports(this.currentUserName).subscribe(
      (data) => {
        this.vendorRatingReports = data as BPCReportVR[];
        this.vendorRatingReportDataSource = new MatTableDataSource(this.vendorRatingReports);
        this.vendorRatingReportDataSource.paginator = this.vendorRatingPaginator;
        this.vendorRatingReportDataSource.sort = this.vendorRatingSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  // GetVendorRatingReportByOption(vendorRatingReportOption: VendorRatingReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetVendorRatingReportByOption(vendorRatingReportOption).subscribe(
  //     (data) => {
  //       this.vendorRatingReports = data as BPCReportVR[];
  //       this.vendorRatingReportDataSource = new MatTableDataSource(this.vendorRatingReports);
  //       this.vendorRatingReportDataSource.paginator = this.vendorRatingPaginator;
  //       this.vendorRatingReportDataSource.sort = this.vendorRatingSort;
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  // GetVendorRatingReportByStatus(vendorRatingReportOption: VendorRatingReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetVendorRatingReportByStatus(vendorRatingReportOption).subscribe(
  //     (data) => {
  //       this.vendorRatingReports = data as BPCReportVR[];
  //       this.vendorRatingReportDataSource = new MatTableDataSource(this.vendorRatingReports);
  //       this.vendorRatingReportDataSource.paginator = this.vendorRatingPaginator;
  //       this.vendorRatingReportDataSource.sort = this.vendorRatingSort;
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  // GetVendorRatingReportByDate(vendorRatingReportOption: VendorRatingReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetVendorRatingReportByDate(vendorRatingReportOption).subscribe(
  //     (data) => {
  //       this.vendorRatingReports = data as BPCReportVR[];
  //       this.vendorRatingReportDataSource = new MatTableDataSource(this.vendorRatingReports);
  //       this.vendorRatingReportDataSource.paginator = this.vendorRatingPaginator;
  //       this.vendorRatingReportDataSource.sort = this.vendorRatingSort;
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
    this.vendorRatingReports = [];
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
  //     const vendorRatingReportOption = new VendorRatingReportOption();
  //     vendorRatingReportOption.Material = material;
  //     vendorRatingReportOption.PO = poNumber;
  //     // vendorRatingReportOption.FromDate = FromDate;
  //     // vendorRatingReportOption.ToDate = ToDate;
  //     vendorRatingReportOption.PartnerID = this.currentUserName;
  //     this.GetVendorRatingReportByOption(vendorRatingReportOption);
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
    const currentPageIndex = this.vendorRatingReportDataSource.paginator.pageIndex;
    const PageSize = this.vendorRatingReportDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.vendorRatingReports.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Material': x.Material,
        // 'Material': x.InvoiceDate ? this._datePipe.transform(x.InvoiceDate, 'dd-MM-yyyy') : '',
        // 'Posted on': x.PostedOn ? this._datePipe.transform(x.PostedOn, 'dd-MM-yyyy') : '',
        'Material Text': x.MaterialText,
        'Order Quantity': x.OrderQty,
        'Received Quantity': x.ReceivedQty,
        'Rejected PPM': x.RejectedPPM,
        'Rework Quantity': x.ReworkQty,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'vendorRating');
  }

  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.vendorRatingReportDataSource.filter = filterValue.trim().toLowerCase();
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
