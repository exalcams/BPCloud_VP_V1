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
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import { Guid } from 'guid-typescript';
import { ApexAxisChartSeries, ApexNonAxisChartSeries, ApexChart, ApexDataLabels, ApexPlotOptions, ApexYAxis, ApexXAxis, ApexFill, ApexTitleSubtitle, ApexGrid, ApexTooltip, ApexStroke, ApexLegend, ApexMarkers, ApexResponsive, ApexOptions } from 'ng-apexcharts';
import { BaseChartDirective } from 'ng2-charts';
import * as SecureLS from 'secure-ls';
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
  OutOfStockValue = 256;
  OTIFPer = 95;
  OTIFValue = 256;
  TurnOverPer = 20;
  TurnOverValue = 256;

  // Progress bar
  AvgSellTime = 35;
  AvgSubcon = 50;

  // Pie chart
  SEPieChartData: OTIFChartDetails[] = [];
  public pieChartOptions = {
    // responsive: true,
    // // cornerRadius: 20,
    // maintainAspectRatio: false,
    // legend: {
    //   position: "right",
    //   // align: "end",
    //   labels: {
    //     fontSize: 10,
    //     usePointStyle: true,
    //   },
    // },
    // plugins: {
    //   labels: {
    //     render: 'value',
    //     fontSize: 12,
    //     fontColor: '#000',
    //   }
    // }
    responsive: true,
    // centertext: "9",
    maintainAspectRatio: false,
    circumference: 1.5 * Math.PI,
    rotation: 0.75 * Math.PI,
    legend: {
      position: "right",
      labels: {
        fontSize: 10,
        padding: 20,
        usePointStyle: true,
        // centertext: "123",
      },
      // centertext: "123",
    },
    cutoutPercentage: 75,
    elements: {
      arc: {
        borderWidth: 0,
      },
      // centertext: "123",
    },
    plugins: {
      labels: {
        // tslint:disable-next-line:typedef
        render: function (args) {
          // return args.value + "%";
          return args.value;
        },
        fontColor: "#000",
        // position: "outside",
        // centertext: "123"
      },
    },
  };
  public pieChartType = "RoundedDoughnut";
  public pieChartLegend = true;
  public pieChartLabels = [];
  public pieChartData: any[] = [300, 500];
  public pieChartColors: any[] = [
    { backgroundColor: ['#34ad65', "#d8deff"] }
    // { backgroundColor: ['#34ad65', '#9bc400', '#ffde22', "#fb863a", '#ff414e', '#5f255f', "#5f2cff", '#40a8e2', "#74a2f1", "#b5f9ff", "#c3d8fd"] },
  ];
  // public pieChartColors: any[] = [
  //   { backgroundColor: ['#34ad65', "#fb863a", '#ff414e', "#5f2cff", '#40a8e2', "#74a2f1", "#c3d8fd", '#b5f9ff', '#8076a3', '#ffde22', '#9bc400'] }
  //   // { backgroundColor: ['#34ad65', '#9bc400', '#ffde22', "#fb863a", '#ff414e', '#5f255f', "#5f2cff", '#40a8e2', "#74a2f1", "#b5f9ff", "#c3d8fd"] },
  // ];

  // Bar chart
  OTIFBarChartData: OTIFChartDetails[] = [];
  public barChartOptions = {
    responsive: true,
    // cornerRadius: 20,
    maintainAspectRatio: false,
    legend: {
      position: "top",
      align: "end",
      labels: {
        fontSize: 10,
        usePointStyle: true,
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
  public barChartLabels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartData: any[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A', stack: 'a' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B', stack: 'a' }
  ];
  public barChartColors: any[] = [
    { backgroundColor: "#435cfc" }, { backgroundColor: "#280bc7" }
    // { backgroundColor: ["#435cfc", '#280bc7'] },
  ];

  // public barChartOptions: ChartOptions = {
  //   responsive: true,
  // };
  // public barChartLabels = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  // public barChartType: ChartType = 'bar';
  // public barChartLegend = true;
  // public barChartPlugins = [];

  // public barChartData = [
  //   { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
  //   { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
  // ];


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

    Chart.defaults.RoundedDoughnut = Chart.helpers.clone(Chart.defaults.doughnut);
    Chart.controllers.RoundedDoughnut = Chart.controllers.doughnut.extend({
      draw: function (ease) {
        let ctx = this.chart.ctx;
        let easingDecimal = ease || 1;
        let arcs = this.getMeta().data;
        Chart.helpers.each(arcs, function (arc, i) {
          arc.transition(easingDecimal).draw();

          const pArc = arcs[i === 0 ? arcs.length - 1 : i - 1];
          const pColor = pArc._view.backgroundColor;

          const vm = arc._view;
          const radius = (vm.outerRadius + vm.innerRadius) / 2;
          const thickness = (vm.outerRadius - vm.innerRadius) / 2;
          const startAngle = Math.PI - vm.startAngle - Math.PI / 2;
          const angle = Math.PI - vm.endAngle - Math.PI / 2;

          ctx.save();
          ctx.translate(vm.x, vm.y);

          ctx.fillStyle = i === 0 ? vm.backgroundColor : pColor;
          ctx.beginPath();
          ctx.arc(radius * Math.sin(startAngle), radius * Math.cos(startAngle), thickness, 0, 2 * Math.PI);
          ctx.fill();

          ctx.fillStyle = vm.backgroundColor;
          ctx.beginPath();
          ctx.arc(radius * Math.sin(angle), radius * Math.cos(angle), thickness, 0, 2 * Math.PI);
          ctx.fill();

          ctx.restore();
        });
      }
    });

    // Chart.pluginService.register({
    //   afterUpdate: function (chart) {
    //     if (chart.config.options.elements.arc.roundedCornersFor !== undefined) {
    //       var arc = chart.getDatasetMeta(0).data[chart.config.options.elements.arc.roundedCornersFor];
    //       arc.round = {
    //         x: (chart.chartArea.left + chart.chartArea.right) / 2,
    //         y: (chart.chartArea.top + chart.chartArea.bottom) / 2,
    //         radius: (chart.outerRadius + chart.innerRadius) / 2,
    //         thickness: (chart.outerRadius - chart.innerRadius) / 2 - 1,
    //         backgroundColor: arc._model.backgroundColor
    //       }
    //     }
    //   },

    //   afterDraw: function (chart) {
    //     if (chart.config.options.elements.arc.roundedCornersFor !== undefined) {
    //       var ctx = chart.chart.ctx;
    //       var arc = chart.getDatasetMeta(0).data[chart.config.options.elements.arc.roundedCornersFor];
    //       var startAngle = Math.PI / 2 - arc._view.startAngle;
    //       var endAngle = Math.PI / 2 - arc._view.endAngle;

    //       ctx.save();
    //       ctx.translate(arc.round.x, arc.round.y);
    //       console.log(arc.round.startAngle)
    //       ctx.fillStyle = arc.round.backgroundColor;
    //       ctx.beginPath();
    //       ctx.arc(arc.round.radius * Math.sin(startAngle), arc.round.radius * Math.cos(startAngle), arc.round.thickness, 0, 2 * Math.PI);
    //       ctx.arc(arc.round.radius * Math.sin(endAngle), arc.round.radius * Math.cos(endAngle), arc.round.thickness, 0, 2 * Math.PI);
    //       ctx.closePath();
    //       ctx.fill();
    //       ctx.restore();
    //     }
    //   },
    // });
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
