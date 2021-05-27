import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ReportService } from 'app/services/report.service';
import { BPCReportOV, OverviewReportOption } from 'app/models/ReportModel';
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
import { ActionLog, BPCOFQM } from 'app/models/OrderFulFilment';
import { POService } from 'app/services/po.service';
import { AuthService } from 'app/services/auth.service';
import * as SecureLS from 'secure-ls';

@Component({
  selector: 'app-overview',
  templateUrl: './overview.component.html',
  styleUrls: ['./overview.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class OverviewComponent implements OnInit {
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
  // overviewReportDisplayedColumns: string[] = ['Material', 'MaterialText', 'InputQty', 'AccQty', 'RejQty', 'RejPercentage'];
  // overviewReportDataSource: MatTableDataSource<BPCReportOV>;
  // overviewReports: BPCReportOV[] = [];
  overviewReportDisplayedColumns: string[] = ['DocNumber', 'Item', 'SerialNumber', 'Material', 'MaterialText', 'GRGIQty', 'LotQty', 'RejQty', 'RejReason'];
  overviewReportDataSource: MatTableDataSource<BPCOFQM>;
  overviewReports: BPCOFQM[] = [];
  @ViewChild(MatPaginator) overviewPaginator: MatPaginator;
  @ViewChild(MatSort) overviewSort: MatSort;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  AcceptedQty: number = 0;
  RejectedQty: number = 0;
  // DoughnutChart
  public doughnutChartData: Array<number> = [];
  public doughnutChartLabels: any[] = [
    'Rejected', 'Accepted'

  ];
  public doughnutChartDataSets: Array<any> = [{ data: this.doughnutChartData, }];
  public doughnutChartOptions: any = {
    maintainAspectRatio: false,
    responsive: false,
    legend: false,
    cutoutPercentage: 65,
    plugins: {
      labels: {
        fontColor: '#fff',
        fontFamily: 'Segoe UI',
        fontSize: 13
      },

    },

  };
  public doughnutChartColors: Array<any> = [{
    backgroundColor: ['#fb9e61', '#3c9cdf']
  }];
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartLegend = false;

  // BarChart
  public barChartColors: Array<any> =
    [{
      backgroundColor: ['#3c9cdf', '#3c9cdf', '#3c9cdf', '#3c9cdf', '#3c9cdf']
    }];
  public barChartOptions: ChartOptions = {
    responsive: false,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        gridLines: {
          drawTicks: false,
          display: false
        },
      }], yAxes: [{
        ticks: {
          beginAtZero: true
        }
      }]
    },
  };
  public barChartLabels: any[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = false;
  public barChartData: ChartDataSets[];

  ActionLog: any;
  Chartdata: BPCOFQM[];
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
    private _POService: POService,
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
    const retrievedObject =  this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.menuItems.indexOf('Overview') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.GetBPCQMByPartnerIDFilter();
    this.CreateAppUsage();
    this.GetOverviewReports();
    this.initializeSearchForm();
    // this.GetBPCQMByPartnerIDFilter();
    //  this.ChartLoading();

    // this.searchButtonClicked();
  }

  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'Overview';
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

  ChartLoadingdata(): void {
    this.doughnutChartDataSets = [];
    this.doughnutChartData = [this.RejectedQty, this.AcceptedQty];
    this.doughnutChartDataSets.push({ data: this.doughnutChartData });
    console.log(this.doughnutChartDataSets);
    let Rejectedqty = [];
    let Material = [];
    for (let i = 0; i < 5; i++) {
      Rejectedqty.push(this.Chartdata[i].RejQty);
      Material.push(this.Chartdata[i].Material);
    }
    console.log(Rejectedqty, Material);

    this.barChartLabels = Material;
    this.barChartData = [
      {
        data: Rejectedqty, label: 'Rejected Material',
        barPercentage: 0.5,
      }

    ];

  }
  GetOverviewReports(): void {
    this.isProgressBarVisibile = true;
    this._POService.GetBPCQMByPartnerID(this.currentUserName).subscribe(
      (data) => {
        this.overviewReports = data as BPCOFQM[];
        this.overviewReportDataSource = new MatTableDataSource(this.overviewReports);
        this.overviewReportDataSource.paginator = this.overviewPaginator;
        this.overviewReportDataSource.sort = this.overviewSort;
        this.isProgressBarVisibile = false;
        this.GetDoughtchartdata();
        console.log(this.overviewReports);

      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }
  GetBPCQMByPartnerIDFilter(): void {
    this._POService.GetBPCQMByPartnerIDFilter(this.currentUserName).subscribe(
      (data) => {
        this.Chartdata = data as BPCOFQM[];
        this.isProgressBarVisibile = false;
        // this.GetDoughtchartdata();
        console.log(this.Chartdata);

      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }
  GetDoughtchartdata(): void {
    this.overviewReports.forEach(x => {
      if (x.GRGIQty === 0) {
        this.AcceptedQty = this.AcceptedQty + (x.LotQty - x.RejQty);
      }
      else {
        this.AcceptedQty = this.AcceptedQty + x.GRGIQty;
      }
      if (x.RejQty === 0) {
        this.RejectedQty = this.RejectedQty + (x.LotQty - x.GRGIQty);
      }
      else {
        this.RejectedQty = this.RejectedQty + x.RejQty;
      }
    });
    this.ChartLoadingdata();

  }
  GetOverviewReportByOption(overviewReportOption: OverviewReportOption): void {
    this.isProgressBarVisibile = true;
    this._POService.GetQMReportByOption(overviewReportOption).subscribe(
      (data) => {
        this.overviewReports = data as BPCOFQM[];
        this.overviewReportDataSource = new MatTableDataSource(this.overviewReports);
        this.overviewReportDataSource.paginator = this.overviewPaginator;
        this.overviewReportDataSource.sort = this.overviewSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  GetOverviewReportByStatus(overviewReportOption: OverviewReportOption): void {
    this.isProgressBarVisibile = true;
    this._POService.GetQMReportByStatus(overviewReportOption).subscribe(
      (data) => {
        this.overviewReports = data as BPCOFQM[];
        this.overviewReportDataSource = new MatTableDataSource(this.overviewReports);
        this.overviewReportDataSource.paginator = this.overviewPaginator;
        this.overviewReportDataSource.sort = this.overviewSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  GetOverviewReportByDate(overviewReportOption: OverviewReportOption): void {
    this.isProgressBarVisibile = true;
    this._POService.GetQMReportByDate(overviewReportOption).subscribe(
      (data) => {
        this.overviewReports = data as BPCOFQM[];
        this.overviewReportDataSource = new MatTableDataSource(this.overviewReports);
        this.overviewReportDataSource.paginator = this.overviewPaginator;
        this.overviewReportDataSource.sort = this.overviewSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  // GetOverviewReports(): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetOverviewReports(this.currentUserName).subscribe(
  //     (data) => {
  //       this.overviewReports = data as BPCReportOV[];
  //       this.overviewReportDataSource = new MatTableDataSource(this.overviewReports);
  //       this.overviewReportDataSource.paginator = this.overviewPaginator;
  //       this.overviewReportDataSource.sort = this.overviewSort;
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  // GetOverviewReportByOption(overviewReportOption: OverviewReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetOverviewReportByOption(overviewReportOption).subscribe(
  //     (data) => {
  //       this.overviewReports = data as BPCReportOV[];
  //       this.overviewReportDataSource = new MatTableDataSource(this.overviewReports);
  //       this.overviewReportDataSource.paginator = this.overviewPaginator;
  //       this.overviewReportDataSource.sort = this.overviewSort;
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  // GetOverviewReportByStatus(overviewReportOption: OverviewReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetOverviewReportByStatus(overviewReportOption).subscribe(
  //     (data) => {
  //       this.overviewReports = data as BPCReportOV[];
  //       this.overviewReportDataSource = new MatTableDataSource(this.overviewReports);
  //       this.overviewReportDataSource.paginator = this.overviewPaginator;
  //       this.overviewReportDataSource.sort = this.overviewSort;
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  // GetOverviewReportByDate(overviewReportOption: OverviewReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetOverviewReportByDate(overviewReportOption).subscribe(
  //     (data) => {
  //       this.overviewReports = data as BPCReportOV[];
  //       this.overviewReportDataSource = new MatTableDataSource(this.overviewReports);
  //       this.overviewReportDataSource.paginator = this.overviewPaginator;
  //       this.overviewReportDataSource.sort = this.overviewSort;
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
    this.overviewReports = [];
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

  searchButtonClicked(): void {
    if (this.searchFormGroup.valid) {
      // if (!this.isDateError) {
      // const FrDate = this.searchFormGroup.get('FromDate').value;
      // let FromDate = '';
      // if (FrDate) {
      //   FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
      // }
      // const TDate = this.searchFormGroup.get('ToDate').value;
      // let ToDate = '';
      // if (TDate) {
      //   ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
      // }
      this.CreateActionLogvalues("Search");
      const poNumber = this.searchFormGroup.get('PONumber').value;
      const material = this.searchFormGroup.get('Material').value;
      const overviewReportOption = new OverviewReportOption();
      overviewReportOption.Material = material;
      overviewReportOption.PO = poNumber;
      // overviewReportOption.FromDate = FromDate;
      // overviewReportOption.ToDate = ToDate;
      overviewReportOption.PartnerID = this.currentUserName;
      this.GetOverviewReportByOption(overviewReportOption);
      // }
    } else {
      this.showValidationErrors(this.searchFormGroup);
    }
  }

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
    this.CreateActionLogvalues("Export As XLSX");
    const currentPageIndex = this.overviewReportDataSource.paginator.pageIndex;
    const PageSize = this.overviewReportDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.overviewReports.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Doc Number': x.DocNumber,
        'Item': x.Item,
        'Serial No': x.SerialNumber,
        'Material': x.Material,
        // 'Material': x.InvoiceDate ? this._datePipe.transform(x.InvoiceDate, 'dd-MM-yyyy') : '',
        // 'Posted on': x.PostedOn ? this._datePipe.transform(x.PostedOn, 'dd-MM-yyyy') : '',
        'Material Text': x.MaterialText,
        'GRGI Quantity': x.GRGIQty,
        'Lot Quantity': x.LotQty,
        'Rejected Quantity': x.RejQty,
        'Rejected Reason': x.RejReason,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'overview');
  }

  expandClicked(): void {
    // this.CreateActionLogvalues("Expand");
    this.isExpanded = !this.isExpanded;
  }

  applyFilter(event: Event): void {
    // this.CreateActionLogvalues("SearchFilter");
    const filterValue = (event.target as HTMLInputElement).value;
    this.overviewReportDataSource.filter = filterValue.trim().toLowerCase();
  }

  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }
  CreateActionLogvalues(text): void {
    this.ActionLog = new ActionLog();
    this.ActionLog.UserID = this.currentUserID;
    this.ActionLog.AppName = "Overview";
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
