import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ReportService } from 'app/services/report.service';
import { BPCReportGRR } from 'app/models/ReportModel';
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
import { ThrowStmt } from '@angular/compiler';
import { ActionLog } from 'app/models/OrderFulFilment';
import { AuthService } from 'app/services/auth.service';
import { ASNListFilter, GRNListFilter } from 'app/models/ASN';
@Component({
  selector: 'app-gr-receipts',
  templateUrl: './gr-receipts.component.html',
  styleUrls: ['./gr-receipts.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class GRReceiptsComponent implements OnInit {
  BGClassName: any;
  fuseConfig: any;
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
  data: any[];
  grReceiptsReportDisplayedColumns: string[] = ['GRGIDoc', 'GRIDate', 'Item', 'Material', 'Description', 'GRGIQty'];
  grReceiptsReportDataSource: MatTableDataSource<BPCReportGRR>;
  grReceiptsReports: BPCReportGRR[] = [];
  @ViewChild(MatPaginator) grReceiptsPaginator: MatPaginator;
  @ViewChild(MatSort) grReceiptsSort: MatSort;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;

  // Left Side Chart
  public ChartType: ChartType = 'doughnut';
  public DoughnutChartData2: ChartDataSets[] = [
    { data: this.randomize() }
  ];
  public DoughnutChartOptions2: ChartOptions = {
    responsive: false,
    maintainAspectRatio: false,
    legend: {
      display: false
    },
    tooltips: {
      enabled: false
    },
    plugins: {
      labels: false
    },
    showLines: false,
    cutoutPercentage: 70,
  };
  public doughnutChartColors1: Array<any> = [{
    backgroundColor: ['#6dd7d3']
  }];


  // BarChart
  chartOptions = {
    responsive: true,
    height: "10px",


    legend: {

      height: "1px",
      width: "2px"

    },
    maintainAspectRatio: false,
    scales: {
      yAxes: [{
        ticks: {
          fontColor: "rgba(0,0,0,0.5)",
          fontStyle: "bold",
          beginAtZero: true,
          maxTicksLimit: 5,

          padding: 5,
          fontSize: 6,
          // borderWidth: 1 ,
          // barThickness: 30,
          // barPercentage: 0.9,

        },


      }],
      xAxes: [{
        ticks: {
          fontColor: "rgba(0,0,0,0.5)",
          // fontStyle: "bold",
          fontSize: 6,
          fontStyle: "bold",
          beginAtZero: true,
          // maxTicksLimit: 5,
          padding: 5,
          borderWidth: 1,
          // barThickness: 30,
          // barPercentage: 0.9,
        },

        gridLines: {
          drawTicks: false,
          display: false
        },

      }],
    }
  }

  labels = ['17/04/2020', '18/04/2020', '19/04/2020', '20/04/2020', '21/04/2020'];
  chartData = [
    {

      label: 'planned',
      data: [70, 40, 56, 45, 70],
      barThickness: 13,
      barPercentage: 0.3,
      //  type: 'category',
      // categoryPercentage: 0.8,
      // box-shadow: 0px -1px 5px 0 rgba(0, 0, 0, 0.4);


    },
    {
      label: 'actual',
      data: [45, 59, 70, 59, 80],
      barThickness: 13,
      barPercentage: 0.3,
      // opacity: 0.9,


    }
  ];

  colors = [
    {

      backgroundColor: '#ff8f3d'
      // backgroundColor:"linear-gradient(to top, #1b69d0, #2ea6e2)"  
      // backgroundColor:' rgba(255,0,0,0) ,rgba(255,0,0,1)'
      // “linear-gradient(to right, rgba(255,0,0,0), rgba(255,0,0,1))”,



    },
    {

      fill: true,
      backgroundColor: '#1b69d0'


    }
  ];
  i: any;
  // GRN: any;
  QTY: any;
  // material: any;
  Date: any;
  dateformat: any;
  formatdate: any;
  // Datefrom: any;
  // Dateto: any;
  ActionLog: any;
  Plants: string[] = [];

  constructor(
    private _fuseConfigService: FuseConfigService,
    private _reportService: ReportService,
    private formBuilder: FormBuilder,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _authService: AuthService,
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
      if (this.menuItems.indexOf('GRReceipts') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.CreateAppUsage();
    // this.GetGRReceiptsReports();
    this.initializeSearchForm();
    if (this.currentUserRole === 'GateUser') {
      this.GetUserPlants();
    } else {
      this.searchButtonClicked();
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

  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'GRReceipts';
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


  GetGRReceiptsReports(): void {
    this.isProgressBarVisibile = true;
    this._reportService.GetGRRByPartnerId(this.currentUserName).subscribe(
      (data) => {
        this.grReceiptsReports = data as BPCReportGRR[];
        this.grReceiptsReportDataSource = new MatTableDataSource(this.grReceiptsReports);
        this.grReceiptsReportDataSource.paginator = this.grReceiptsPaginator;
        this.grReceiptsReportDataSource.sort = this.grReceiptsSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  GetFilteredReportGRRByPartnerID(material, inspectionMethod): void {
    this.isProgressBarVisibile = true;
    this._reportService.GetFilteredReportGRRByPartnerID(this.currentUserName, material).subscribe(
      (data) => {
        this.grReceiptsReports = data as BPCReportGRR[];
        this.grReceiptsReportDataSource = new MatTableDataSource(this.grReceiptsReports);
        this.grReceiptsReportDataSource.paginator = this.grReceiptsPaginator;
        this.grReceiptsReportDataSource.sort = this.grReceiptsSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  // GetGRReceiptsReportByOption(grReceiptsReportOption: GRReceiptsReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetGRReceiptsReportByOption(grReceiptsReportOption).subscribe(
  //     (data) => {
  //       this.grReceiptsReports = data as BPCReportGRR[];
  //       this.grReceiptsReportDataSource = new MatTableDataSource(this.grReceiptsReports);
  //       this.grReceiptsReportDataSource.paginator = this.grReceiptsPaginator;
  //       this.grReceiptsReportDataSource.sort = this.grReceiptsSort;
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  // GetGRReceiptsReportByStatus(grReceiptsReportOption: GRReceiptsReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetGRReceiptsReportByStatus(grReceiptsReportOption).subscribe(
  //     (data) => {
  //       this.grReceiptsReports = data as BPCReportGRR[];
  //       this.grReceiptsReportDataSource = new MatTableDataSource(this.grReceiptsReports);
  //       this.grReceiptsReportDataSource.paginator = this.grReceiptsPaginator;
  //       this.grReceiptsReportDataSource.sort = this.grReceiptsSort;
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  // GetGRReceiptsReportByDate(grReceiptsReportOption: GRReceiptsReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetGRReceiptsReportByDate(grReceiptsReportOption).subscribe(
  //     (data) => {
  //       this.grReceiptsReports = data as BPCReportGRR[];
  //       this.grReceiptsReportDataSource = new MatTableDataSource(this.grReceiptsReports);
  //       this.grReceiptsReportDataSource.paginator = this.grReceiptsPaginator;
  //       this.grReceiptsReportDataSource.sort = this.grReceiptsSort;
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
      // PONumber: [''],
      Material: [''],
      GRNNo: [''],
      GRNDatefrom: [''],
      GRNDateto: []
      // FromDate: [this.defaultFromDate],
      // ToDate: [this.defaultToDate]
    });
  }

  resetControl(): void {
    this.grReceiptsReports = [];
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

  fromAndToDateChanged(): void {
    const FROMDATEVAL = this.searchFormGroup.get("GRNDatefrom")
      .value as Date;
    const TODATEVAL = this.searchFormGroup.get("GRNDateto").value as Date;
    if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
      this.isDateError = true;
    } else {
      this.isDateError = false;
    }
  }

  GetUserPlants(): void {
    this._authService.GetUserPlants(this.currentUserID).subscribe(
      (data) => {
        this.Plants = data as string[];
        this.Search1Clicked();
      },
      (err) => {
        console.error(err);
      }
    );
  }

  SearchBtnClicked(): void {
    if (this.currentUserRole === 'GateUser') {
      this.Search1Clicked();
    } else {
      this.searchButtonClicked();
    }
  }

  searchButtonClicked(): void {
    if (this.searchFormGroup.valid) {
      this.CreateActionLogvalues("Search");
      if (!this.isDateError) {
        this.QTY = "";
        this.Date = "";
        const Material = this.searchFormGroup.get('Material').value;
        const GRNNo = this.searchFormGroup.get('GRNNo').value;

        const FrDate = this.searchFormGroup.get('GRNDatefrom').value;
        let FromDate = '';
        if (FrDate) {
          FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
        }
        const TDate = this.searchFormGroup.get('GRNDateto').value;
        let ToDate = '';
        if (TDate) {
          ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
        }
        this._reportService.FilterGRRListByPartnerID(this.currentUserName, GRNNo, Material, FromDate, ToDate).subscribe(
          (data) => {
            this.grReceiptsReports = data as BPCReportGRR[];
            this.grReceiptsReportDataSource = new MatTableDataSource(this.grReceiptsReports);
            this.grReceiptsReportDataSource.paginator = this.grReceiptsPaginator;
            this.grReceiptsReportDataSource.sort = this.grReceiptsSort;
            this.isProgressBarVisibile = false;
          },

          (err) => {
            console.error(err);
          }
        );
      }
    } else {
      this.showValidationErrors(this.searchFormGroup);
    }
  }

  Search1Clicked(): void {
    if (this.searchFormGroup.valid) {
      const filter: GRNListFilter = new GRNListFilter();
      if (!this.isDateError) {
        this.Plants.forEach(x => filter.Plants.push(x));
        this.QTY = "";
        this.Date = "";
        filter.Material = this.searchFormGroup.get('Material').value;
        filter.GRN = this.searchFormGroup.get('GRNNo').value;

        const FrDate = this.searchFormGroup.get('GRNDatefrom').value;
        let FromDate = '';
        if (FrDate) {
          FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
        }
        filter.FromDate = FromDate;
        const TDate = this.searchFormGroup.get('GRNDateto').value;
        let ToDate = '';
        if (TDate) {
          ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
        }
        filter.ToDate = ToDate;
        this._reportService.FilterGRGIListByPlants(filter).subscribe(
          (data) => {
            this.grReceiptsReports = data as BPCReportGRR[];
            this.grReceiptsReportDataSource = new MatTableDataSource(this.grReceiptsReports);
            this.grReceiptsReportDataSource.paginator = this.grReceiptsPaginator;
            this.grReceiptsReportDataSource.sort = this.grReceiptsSort;
            this.isProgressBarVisibile = false;
          },

          (err) => {
            console.error(err);
          }
        );
      }
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
    this.CreateActionLogvalues("export As XLSX");
    const currentPageIndex = this.grReceiptsReportDataSource.paginator.pageIndex;
    const PageSize = this.grReceiptsReportDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.grReceiptsReports.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'GRN': x.GRGIDoc,
        'Date': x.GRIDate ? this._datePipe.transform(x.GRIDate, 'dd-MM-yyyy') : '',
        'Item': x.Item,
        'Material': x.Material,
        // 'Material': x.InvoiceDate ? this._datePipe.transform(x.InvoiceDate, 'dd-MM-yyyy') : '',
        // 'Posted on': x.PostedOn ? this._datePipe.transform(x.PostedOn, 'dd-MM-yyyy') : '',
        'Material Desc': x.MaterialText,
        'Quantity': x.GRGIQty,
        // 'Received Quantity': x.ReceivedQty,
        // 'Rejected PPM': x.RejectedPPM,
        // 'Rework Quantity': x.ReworkQty,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'grReceipts');
  }

  expandClicked(): void {
    //this.CreateActionLogvalues("Expand");
    this.isExpanded = !this.isExpanded;
  }
  CreateActionLogvalues(text): void {
    this.ActionLog = new ActionLog();
    this.ActionLog.UserID = this.currentUserID;
    this.ActionLog.AppName = "GRReceipts";
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
  applyFilter(event: Event): void {
    //this.CreateActionLogvalues("Search Bar Filter");
    const filterValue = (event.target as HTMLInputElement).value;
    this.grReceiptsReportDataSource.filter = filterValue.trim().toLowerCase();
  }
  randomize(): any[] {
    this.data = [];
    this.data.push(80);
    for (let i = 81; i <= 100; i++) {
      this.data.push(1);
    }
    return this.data;
  }


}


