import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatMenuTrigger, MatSort, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { BPCSE, OTIFChartDetails } from 'app/models/fact';
import { AuthenticationDetails, AppUsage } from 'app/models/master';
import { ActionLog } from 'app/models/OrderFulFilment';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { ExcelService } from 'app/services/excel.service';
import { FactService } from 'app/services/fact.service';
import { MasterService } from 'app/services/master.service';
import { PaymentService } from 'app/services/payment.service';
import { ChartType } from 'chart.js';
import { Guid } from 'guid-typescript';
import { BaseChartDirective } from 'ng2-charts';
import * as SecureLS from 'secure-ls';

@Component({
  selector: 'app-supplier-evaluation',
  templateUrl: './supplier-evaluation.component.html',
  styleUrls: ['./supplier-evaluation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class SupplierEvaluationComponent implements OnInit {
  @ViewChild(BaseChartDirective) BaseChart: BaseChartDirective;
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  IsProgressBarVisibile1: boolean;
  SEs: BPCSE[] = [];
  FilteredSEs: BPCSE[] = [];
  SearchFormGroup: FormGroup;
  isDateError: boolean;
  DefaultFromDate: Date;
  DefaultToDate: Date;
  searchText: string;
  SelectValue: string;
  isExpanded: boolean;
  tableDisplayedColumns: string[] = [
    'PatnerID',
    'ECriteria',
    'ECriteriaText',
    'ParentECriteria',
    'ParentECriteriaText',
    'Percentage',
  ];
  fuseConfig: any;
  BGClassName: any;
  isAccepted: boolean = false;
  render = false;
  tableDataSource: MatTableDataSource<BPCSE>;
  @ViewChild(MatPaginator) tablePaginator: MatPaginator;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  @ViewChild(MatSort) tableSort: MatSort;
  BPCSE: BPCSE[] = [];
  BCHeader: BPCSE;
  ActionLog: any;
  SecretKey: string;
  SecureStorage: SecureLS;
  OTIFCircleProgressValue = 10;

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
    cutoutPercentage: 70,
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
  public pieChartType: ChartType = "doughnut";
  public pieChartLegend = true;
  public pieChartLabels = [];
  public pieChartData: any[] = [];
  public pieChartColors: any[] = [
    { backgroundColor: ['#34ad65', "#fb863a", '#ff414e', "#5f2cff", '#40a8e2', "#74a2f1", "#c3d8fd", '#b5f9ff', '#8076a3', '#ffde22', '#9bc400'] }
    // { backgroundColor: ['#34ad65', '#9bc400', '#ffde22', "#fb863a", '#ff414e', '#5f255f', "#5f2cff", '#40a8e2', "#74a2f1", "#b5f9ff", "#c3d8fd"] },
  ];

  // public barChartOptions = {
  //   responsive: true,
  //   // cornerRadius: 20,
  //   maintainAspectRatio: false,
  //   legend: {
  //     position: "top",
  //     align: "end",
  //     labels: {
  //       fontSize: 10,
  //       usePointStyle: true,
  //     },
  //   },
  //   // // We use these empty structures as placeholders for dynamic theming.
  //   scales: {
  //     xAxes: [
  //       {
  //         barPercentage: 0.3,
  //         // categoryPercentage: -0.5,
  //         gridLines: {
  //           display: false
  //         }
  //       },
  //     ],
  //     yAxes: [
  //       {
  //         ticks: {
  //           stepSize: 20,
  //           beginAtZero: true,
  //         },
  //         gridLines: {
  //           display: false
  //         }
  //       },
  //     ],
  //   },

  // };
  // public barChartType: ChartType = "bar";
  // public barChartLegend = true;
  // public barChartLabels = [];
  // public barChartData: any[] = [
  //   { data: [], label: "Criteria" },
  // ];
  // public barChartColors: any[] = [
  //   { backgroundColor: "#5f2cff" },
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
    this.isDateError = false;
    this.searchText = '';
    this.SelectValue = 'All';
    this.isExpanded = false;
    this.DefaultFromDate = new Date();
    this.DefaultFromDate.setDate(this.DefaultFromDate.getDate() - 30);
    this.DefaultToDate = new Date();
    this.BCHeader = new BPCSE();

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
      // if (this.MenuItems.indexOf('SE') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //   );
      //   this._router.navigate(['/auth/login']);
      // }

    } else {
      this._router.navigate(['/auth/login']);
    }
    this.CreateAppUsage();
    this.InitializeSearchForm();
    this.GetAllSEs();
    this.GetSEPieChartData();
    // this.GetSEByPatnerID();
    // this.SearchClicked();
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
      Criteria: [''],
      ParentCriteria: [''],
      Percentage: [''],
    });
  }
  ResetControl(): void {
    this.SEs = [];
    this.ResetFormGroup(this.SearchFormGroup);
  }
  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }
  GetAllSEs(): void {
    this.IsProgressBarVisibile = true;
    this._factService.GetAllSEs().subscribe(
      (data) => {
        this.SEs = data as BPCSE[];
        this.BPCSE = this.SEs;
        this.FilteredSEs = this.SEs.filter(x => x.IsActive);
        this.tableDataSource = new MatTableDataSource(this.FilteredSEs);
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
  GetSEPieChartData(): void {
    this.IsProgressBarVisibile1 = true;
    this.SEPieChartData = [];
    this._factService.GetSEPieChartData().subscribe(
      (data) => {
        this.SEPieChartData = data as OTIFChartDetails[];
        this.pieChartLabels = [];
        this.pieChartData = [];
        setTimeout(() => {
          this.SEPieChartData.forEach(x => {
            this.pieChartLabels.push(x.label);
            this.pieChartData.push(x.Value);
            this.BaseChart.chart.config.data.labels = this.pieChartLabels;
            this.BaseChart.chart.update();
          }, 10);
        });
        // this.barChartLabels = [];
        // this.barChartData = [
        //   { data: [], label: "Criteria" },
        // ];
        // setTimeout(() => {
        //   this.SEPieChartData.forEach(x => {
        //     this.barChartLabels.push(x.label);
        //     this.barChartData[0].data.push(x.Value);
        //     this.barChartData[0].label = "Criteria";
        //     this.BaseChart.chart.update();
        //   }, 10);
        // });
        this.IsProgressBarVisibile1 = false;
      },
      (err) => {
        this.IsProgressBarVisibile1 = false;
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
      // if (!this.isDateError) {
      //   const FrDate = this.SearchFormGroup.get('FromDate').value;
      //   let FromDate = '';
      //   if (FrDate) {
      //     FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
      //   }
      //   const TDate = this.SearchFormGroup.get('ToDate').value;
      //   let ToDate = '';
      //   if (TDate) {
      //     ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
      //   }
      const PartnerID = this.SearchFormGroup.get('PartnerID').value;
      const Criteria = this.SearchFormGroup.get('Criteria').value;
      const ParentCriteria = this.SearchFormGroup.get('ParentCriteria').value;
      const Percentage = this.SearchFormGroup.get('Percentage').value;
      this.IsProgressBarVisibile = true;
      this._factService.FilterSEByPartnerID(PartnerID, Criteria, ParentCriteria, Percentage).subscribe(
        (data) => {
          this.SEs = data as BPCSE[];
          // this.BPCSE=this.SEs;
          this.FilteredSEs = this.SEs.filter(x => x.IsActive);
          this.tableDataSource = new MatTableDataSource(this.FilteredSEs);
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
      this.GetSEPieChartDataByPartnerID(PartnerID, Criteria, ParentCriteria, Percentage);
      // }
    } else {
      this.ShowValidationErrors(this.SearchFormGroup);
    }
  }
  GetSEPieChartDataByPartnerID(PartnerID: string, Criteria: string, ParentCriteria: string, Percentage: number | string | null): void {
    this.IsProgressBarVisibile1 = true;
    this.SEPieChartData = [];
    this._factService.GetSEPieChartDataByPartnerID(PartnerID, Criteria, ParentCriteria, Percentage).subscribe(
      (data) => {
        this.SEPieChartData = data as OTIFChartDetails[];
        this.pieChartLabels = [];
        this.pieChartData = [];
        setTimeout(() => {
          this.SEPieChartData.forEach(x => {
            this.pieChartLabels.push(x.label);
            this.pieChartData.push(x.Value);
            this.BaseChart.chart.config.data.labels = this.pieChartLabels;
            this.BaseChart.chart.update();
          }, 10);
        });
        // this.barChartLabels = [];
        // this.barChartData = [
        //   { data: [], label: "Criteria" },
        // ];
        // setTimeout(() => {
        //   this.SEPieChartData.forEach(x => {
        //     this.barChartLabels.push(x.label);
        //     this.barChartData[0].data.push(x.Value);
        //     this.barChartData[0].label = "Criteria";
        //     this.BaseChart.chart.update();
        //   }, 10);
        // });
        this.IsProgressBarVisibile1 = false;
      },
      (err) => {
        this.IsProgressBarVisibile1 = false;
        console.error(err);
      }
    );
  }
  pieChartClicked(e: any): void {
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
          this.FilteredSEs = this.SEs.filter(x => x.ECriteria === label);
          this.tableDataSource = new MatTableDataSource(this.FilteredSEs);
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
    const itemsShowed = this.FilteredSEs.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Partner ID': x.PatnerID,
        'Criteria': x.ECriteria,
        'Criteria Text': x.ECriteriaText,
        'Parent Criteria': x.ParentECriteria,
        'Parent Criteria Text': x.ParentECriteriaText,
        'Percentage': x.Percentage,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'SE');
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
  handle_accept(element: BPCSE): void {
    this.CreateActionLogvalues("Get Solved");
    // console.log('handle_accept', element);
    if (this.BPCSE.length >= 1) {
      this.BPCSE.pop();
    }
    this.BPCSE.push(element);
    this.OpenConfirmationDialog('Confirm', 'Balance');

  }
  handle_getsolved(element: BPCSE): void {
    this.BCHeader = element;
    this._router.navigate(["/support/supportticket"], {
      queryParams: { period: this.BCHeader.ECriteria },
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

        }
      });
  }

  CreateActionLogvalues(text): void {
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
