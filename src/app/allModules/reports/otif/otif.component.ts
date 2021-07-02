import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatMenuTrigger, MatSort, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { BPCOTIF, OTIFChartDetails } from 'app/models/fact';
import { AuthenticationDetails, AppUsage } from 'app/models/master';
import { ActionLog } from 'app/models/OrderFulFilment';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { AuthService } from 'app/services/auth.service';
import { ExcelService } from 'app/services/excel.service';
import { FactService } from 'app/services/fact.service';
import { MasterService } from 'app/services/master.service';
import * as Chart from 'chart.js';
import { ChartDataSets, ChartType } from 'chart.js';
import { Guid } from 'guid-typescript';
import { AnyKindOfDictionary } from 'lodash';
import { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexYAxis, ApexXAxis, ApexFill, ApexTitleSubtitle, ApexGrid, ApexTooltip, ApexStroke, ApexLegend, ApexMarkers, ApexResponsive, ApexOptions } from 'ng-apexcharts';
import { BaseChartDirective } from 'ng2-charts';
import * as SecureLS from 'secure-ls';

export interface ChartOptions {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  plotOptions: ApexPlotOptions;
  fill: ApexFill;
  stroke: ApexStroke;
}
// export interface ChartOptions {
//   series: ApexAxisChartSeries;
//   guageseries: ApexNonAxisChartSeries;
//   chart: ApexChart;
//   dataLabels: ApexDataLabels;
//   labels: string[];
//   plotOptions: ApexPlotOptions;
//   yaxis: ApexYAxis;
//   xaxis: ApexXAxis;
//   fill: ApexFill;
//   title: ApexTitleSubtitle;
//   grid: ApexGrid;
//   tooltip: ApexTooltip;
//   stroke: ApexStroke;
//   legend: ApexLegend;
//   markers: ApexMarkers;
//   colors: string[];
//   responsive: ApexResponsive[];
//   options: ApexOptions;
// }
@Component({
  selector: 'app-otif',
  templateUrl: './otif.component.html',
  styleUrls: ['./otif.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class OTIFComponent implements OnInit {
  public chartOptions: Partial<ChartOptions>;
  public TotalStockChartOptions: Partial<ChartOptions>;
  public OutOfStockChartOptions: Partial<ChartOptions>;
  public OTIFChartOptions: Partial<ChartOptions>;
  public TurnOverChartOptions: Partial<ChartOptions>;
  @ViewChild(BaseChartDirective) BaseChart: BaseChartDirective;
  // public BarchartOptions: Partial<ChartOptions>;
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  IsProgressBarVisibile1: boolean;
  IsProgressBarVisibile2: boolean;
  OTIFs: BPCOTIF[] = [];
  FilteredOTIFs: BPCOTIF[] = [];
  SearchFormGroup: FormGroup;
  isDateError: boolean;
  DefaultFromDate: Date;
  DefaultToDate: Date;
  searchText: string;
  SelectValue: string;
  isExpanded: boolean;
  tableDisplayedColumns: string[] = [
    'PatnerID',
    // 'KRA',
    'Material',
    'Date',
    'Text',
    'Value'
  ];
  fuseConfig: any;
  BGClassName: any;
  isAccepted: boolean = false;
  render = false;
  tableDataSource: MatTableDataSource<BPCOTIF>;
  @ViewChild(MatPaginator) tablePaginator: MatPaginator;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  @ViewChild(MatSort) tableSort: MatSort;
  BPCOTIF: BPCOTIF[] = [];
  BCHeader: BPCOTIF;
  ActionLog: any;
  SecretKey: string;
  SecureStorage: SecureLS;
  OTIFCircleProgressValue: number;

  // Gauge chart
  gaugeType = "arch";
  gaugeAppendText = "%";

  TotalStockPer = 95;
  TotalStockValue = 256;
  OutOfStockPer = 20;
  OutOfStockValue = 60;
  OTIFPer = 95;
  OTIFValue = 256;
  TurnOverPer = 20;
  TurnOverValue = 60;

  // Progress bar
  AvgSellTime = 35;
  AvgSubcon = 50;



  // Bar chart
  OTIFBarChartData: OTIFChartDetails[] = [];
  public barChartOptions = {
    responsive: true,
    // cornerRadius: 20,
    maintainAspectRatio: false,
    legend: {
      position: "right",
      align: "end",
      labels: {
        fontSize: 10,
        usePointStyle: true,
        padding: 20
      },
    },
    // // We use these empty structures as placeholders for dynamic theming.
    scales: {
      xAxes: [
        {
          barPercentage: 0.2,
          // categoryPercentage: -0.5,
          gridLines: {
            display: false
          }
        },
      ],
      yAxes: [
        {
          ticks: {
            stepSize: 50,
            beginAtZero: true,
          },
          gridLines: {
            display: false
          }
        },
      ],
    },

  };
  public barChartType: ChartType = "bar";
  public barChartLegend = true;
  public barChartLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  public barChartData: any[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Out of Stock', stack: 'a' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Total Stock', stack: 'a' }
  ];
  public barChartColors: any[] = [
    { backgroundColor: "#435cfc" }, { backgroundColor: "#280bc7" }
    // { backgroundColor: ["#435cfc", '#280bc7'] },
  ];

  // Line chart

  public lineChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Turn Over' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'On Time In Full' },
    { data: [120, 80, 70, 90, 100, 67, 85], label: 'Out Of stock' },
  ];
  public lineChartLabels: any[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July'];
  public lineChartOptions = {
    responsive: true,
    // cornerRadius: 20,
    maintainAspectRatio: false,
    legend: {
      // position: "right",
      // align: "end",
      labels: {
        fontSize: 10,
        usePointStyle: true,
        padding: 20
      },
    },
    // // We use these empty structures as placeholders for dynamic theming.
    scales: {
      xAxes: [
        {
          // barPercentage: 0.2,
          // categoryPercentage: -0.5,
          gridLines: {
            display: false
          }
        },
      ],
      yAxes: [
        {
          ticks: {
            stepSize: 25,
            beginAtZero: true,
          },
          gridLines: {
            display: false
          }
        },
      ],
    },
  };
  public lineChartColors: AnyKindOfDictionary[] = [
    {
      borderColor: '#54c4f5',
      backgroundColor: '#ebfafe',
      pointBackgroundColor: '#54c4f5',
      pointBorderColor: '#54c4f5',
    },
    {
      borderColor: '#ffffff00',
      backgroundColor: '#ffffff00',
      pointBackgroundColor: '#e043fc',
      pointBorderColor: '#e043fc',
    },
    {
      borderColor: '#ffffff00',
      backgroundColor: '#ffffff00',
      pointBackgroundColor: '#435cfc',
      pointBorderColor: '#435cfc',
    },
  ];
  public lineChartLegend = true;
  public lineChartType = 'line';
  public lineChartPlugins = [];

  constructor(
    private _fuseConfigService: FuseConfigService,
    private formBuilder: FormBuilder,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _authService: AuthService,
    private dialog: MatDialog,
    private _factService: FactService,
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
    this.IsProgressBarVisibile1 = false;
    this.IsProgressBarVisibile2 = false;
    this.isDateError = false;
    this.searchText = '';
    this.SelectValue = 'All';
    this.isExpanded = false;
    this.DefaultFromDate = new Date();
    this.DefaultFromDate.setDate(this.DefaultFromDate.getDate() - 30);
    this.DefaultToDate = new Date();
    this.BCHeader = new BPCOTIF();
    this.OTIFCircleProgressValue = 0;

    this.chartOptions = {
      chart: {
        height: 200,
        type: "radialBar"
      },
      series: [67],
      plotOptions: {
        radialBar: {
          startAngle: -125,
          endAngle: 125,
          track: {
            background: "#d8deff"
          },
          hollow: {
            margin: 5,
            size: "65%",
            // background: "#d8deff",
          },
          dataLabels: {
            name: {
              show: false,
            },
            value: {
              offsetY: 5,
              color: "#111",
              fontSize: "30px",
              show: true
            }
          }
        }
      },
      fill: {
        colors: ['#0e0ec7'],
        type: 'solid'
      },
      stroke: {
        lineCap: "round",
      },
      labels: [""]
    };
    this.TotalStockChartOptions = {
      series: [this.TotalStockPer],
      fill: {
        colors: ['#0e0ec7'],
        type: 'solid'
      },
    };
    this.OutOfStockChartOptions = {
      series: [this.OutOfStockPer],
      fill: {
        colors: ['#435cfc'],
        type: 'solid'
      },
    };
    this.OTIFChartOptions = {
      series: [this.OTIFPer],
      fill: {
        colors: ['#54c4f5'],
        type: 'solid'
      },
    };
    this.TurnOverChartOptions = {
      series: [this.TurnOverPer],
      fill: {
        colors: ['#e043fc'],
        type: 'solid'
      },
    };
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
      // if (this.MenuItems.indexOf('OTIF') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //   );
      //   this._router.navigate(['/auth/login']);
      // }

    } else {
      this._router.navigate(['/auth/login']);
    }
    this.CreateAppUsage();
    this.InitializeSearchForm();
    // this.GetAllOTIFs();
    // this.GetOTIFByPatnerID();
    this.SearchClicked('');
  }

  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'Supplier Evaluation';
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
      PartnerID: [''],
      Material: [''],
      FromDate: [this.DefaultFromDate],
      ToDate: [this.DefaultToDate],
    });
  }
  ResetControl(): void {
    this.OTIFs = [];
    this.FilteredOTIFs = [];
    this.ResetFormGroup(this.SearchFormGroup);
  }
  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }
  GetAllOTIFs(): void {
    this.IsProgressBarVisibile = true;
    this._factService.GetAllOTIFs().subscribe(
      (data) => {
        this.OTIFs = data as BPCOTIF[];
        this.FilteredOTIFs = this.OTIFs.filter(x => x.IsActive);
        this.BPCOTIF = this.OTIFs;
        this.tableDataSource = new MatTableDataSource<BPCOTIF>(this.FilteredOTIFs);
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
  SearchClicked(text: string): void {
    if (this.SearchFormGroup.valid) {
      if (text) {
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
        const PartnerID = this.SearchFormGroup.get('PartnerID').value;
        const Material = this.SearchFormGroup.get('Material').value;
        this.IsProgressBarVisibile = true;
        this._factService.FilterOTIFs(PartnerID, Material, FromDate, ToDate).subscribe(
          (data) => {
            this.OTIFs = data as BPCOTIF[];
            this.FilteredOTIFs = this.OTIFs.filter(x => x.IsActive);
            // this.BPCOTIF=this.OTIFs;
            this.tableDataSource = new MatTableDataSource(this.FilteredOTIFs);
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
        this.GetOTIFCircleProgressChartData(PartnerID, Material, FromDate, ToDate);
        this.GetOTIFBarChartData(PartnerID, Material, FromDate, ToDate);
      }
    } else {
      this.ShowValidationErrors(this.SearchFormGroup);
    }
  }
  GetOTIFCircleProgressChartData(PartnerID: string, Material: string, FromDate: string, ToDate: string): void {
    this.IsProgressBarVisibile1 = true;
    this._factService.GetOTIFCircleProgressChartData(PartnerID, Material, FromDate, ToDate).subscribe(
      (data) => {
        const dt = data as OTIFChartDetails;
        if (dt) {
          this.OTIFCircleProgressValue = dt.Value;
        }
        this.IsProgressBarVisibile1 = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile1 = false;
      }
    );
  }
  GetOTIFBarChartData(PartnerID: string, Material: string, FromDate: string, ToDate: string): void {
    this.IsProgressBarVisibile2 = true;
    this._factService.GetOTIFBarChartData(PartnerID, Material, FromDate, ToDate).subscribe(
      (data) => {
        // this.OTIFBarChartData = data as OTIFChartDetails[];
        // this.barChartLabels = [];
        // this.barChartData = [
        //   { data: [], label: "OTIF" },
        //   // { data: [], name: "Planned" },
        // ];
        // setTimeout(() => {
        //   this.OTIFBarChartData.forEach(x => {
        //     this.barChartLabels.push(x.label);
        //     this.barChartData[0].data.push(x.Value);
        //     this.barChartData[0].label = x.Name ? x.Name : "OTIF";
        //     this.BaseChart.chart.update();
        //   }, 10);
        // });
        this.IsProgressBarVisibile2 = false;
        // this.BarchartOptions = {
        //   series: this.barChartData,
        //   chart: {
        //     type: "bar",
        //     height: 150,
        //     animations: {
        //       enabled: false,
        //     },
        //     redrawOnParentResize: true,

        //   },
        //   colors: ['#40a8e2', '#fb863a'],

        //   plotOptions: {
        //     bar: {
        //       horizontal: false,
        //       rangeBarOverlap: true,
        //       columnWidth: "45%",
        //       endingShape: "flat"
        //     }
        //   },
        //   dataLabels: {
        //     enabled: false
        //   },
        //   legend: {
        //     position: 'top',
        //     horizontalAlign: 'right',
        //   },
        //   stroke: {
        //     show: true,
        //     width: 2,
        //     colors: ["transparent"]
        //   },
        //   xaxis: {
        //     categories: this.barChartLabels
        //   },
        //   yaxis: {
        //     title: {
        //     }
        //   },
        //   fill: {
        //     opacity: 1
        //   },
        //   tooltip: {
        //     enabled: true,
        //     // y: {
        //     //     formatter: function (val) {
        //     //         return  val;
        //     //     }
        //     // }
        //   }
        // };

      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile2 = false;
      }
    );
  }

  barChartClicked(e: any): void {
    // console.log(e);
    if (e.active.length > 0) {
      const chart = e.active[0]._chart;
      const activePoints = chart.getElementAtEvent(e.event);
      if (activePoints.length > 0) {
        // get the internal index of slice in pie chart
        const clickedElementIndex = activePoints[0]._index;
        const label = chart.data.labels[clickedElementIndex] as String;
        // get value by index
        const value = chart.data.datasets[0].data[clickedElementIndex];
        // console.log(clickedElementIndex, label, value);
        if (label) {
          console.log(label);
          this.FilteredOTIFs = this.OTIFs.filter(x => this._datePipe.transform(x.Date, "EEEE") === label);
          this.tableDataSource = new MatTableDataSource(this.FilteredOTIFs);
          this.tableDataSource.paginator = this.tablePaginator;
          this.tableDataSource.sort = this.tableSort;

        }
      }
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
    const itemsShowed = this.OTIFs.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Partner ID': x.PatnerID,
        'Material': x.Material,
        'Date': x.Date,
        'Text': x.Text,
        'Value': x.Value,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'OTIF');
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
  // handle_accept(element: BPCOTIF): void {
  //   this.CreateActionLogvalues("Get Solved");
  //   // console.log('handle_accept', element);
  //   if (this.BPCOTIF.length >= 1) {
  //     this.BPCOTIF.pop();
  //   }
  //   this.BPCOTIF.push(element);
  //   this.OpenConfirmationDialog('Confirm', 'Balance');

  // }
  // handle_getsolved(element: BPCOTIF): void {
  //   this.BCHeader = element;
  //   this._router.navigate(["/support/supportticket"], {
  //     queryParams: { period: this.BCHeader.ECriteria },
  //   });
  // }
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

        }
      });
  }

  CreateActionLogvalues(text: string): void {
    this.ActionLog = new ActionLog();
    this.ActionLog.UserID = this.currentUserID;
    this.ActionLog.AppName = "Supplier Evaluation";
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
