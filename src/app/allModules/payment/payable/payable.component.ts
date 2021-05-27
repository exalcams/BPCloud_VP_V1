import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatMenuTrigger, MatSort, MatSnackBar, MatDialog } from '@angular/material';
import { PO } from 'app/models/Dashboard';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { fuseAnimations } from '@fuse/animations';
import { ChartType } from 'chart.js';
import { AuthenticationDetails, AppUsage } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Router } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { BPCPayPayable } from 'app/models/Payment.model';
import { PaymentService } from 'app/services/payment.service';
import { DatePipe } from '@angular/common';
import { ExcelService } from 'app/services/excel.service';
import { MasterService } from 'app/services/master.service';
import { FuseConfigService } from '@fuse/services/config.service';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-payable',
  templateUrl: './payable.component.html',
  styleUrls: ['./payable.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class PayableComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  Payables: BPCPayPayable[] = [];
  SearchFormGroup: FormGroup;
  isDateError: boolean;
  searchText: string;
  SelectValue: string;
  isExpanded: boolean;
  tableDisplayedColumns: string[] = [
    // 'Vendor',
    'Invoice',
    'InvoiceDate',
    'PostedOn',
    'DueDate',
    'AdvAmount',
    'Amount',
    'Currency'
  ];

  fuseConfig: any;
  BGClassName: any;

  tableDataSource: MatTableDataSource<BPCPayPayable>;
  @ViewChild(MatPaginator) tablePaginator: MatPaginator;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  @ViewChild(MatSort) tableSort: MatSort;
  DefaultFromDate: Date;
  DefaultToDate: Date;
  // Bar chart
  public barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      // position: 'top',
      // align: 'end',
      // labels: {
      //   fontSize: 10,
      //   usePointStyle: true
      // }
      display: false
    },
    // // We use these empty structures as placeholders for dynamic theming.
    scales: {
      yAxes: [{
        barPercentage: 0.4,
        // categoryPercentage: -0.5,
        gridLines: {
          display: false,
          drawBorder: false
        },
        // ticks: {
        //   display: false
        // }
      }],
      xAxes: [{
        ticks: {
          stepSize: 20000,
          beginAtZero: true,
        },
        gridLines: {
          display: false
        },
        // labels: {
        //   x: 25,
        //   y: -25,
        //   align: 'left'
        // }
      }],
    },
    plugins: {
      // datalabels: {
      //   display: true,
      //   anchor: 'end',
      //   align: 'end',
      // }
      labels: {
        // tslint:disable-next-line:typedef
        render: function (args) {
          return args.value + '%';
        },
        fontColor: '#000',
        position: 'outside',
        // overlap: true,
        // outsidePadding: 4
        // textMargin: 4
      }
    },
    animation: {
      onComplete: function (): void {
        const chartInstance = this.chart,
          ctx = chartInstance.ctx;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        this.data.datasets.forEach((dataset: any, i: any) => {
          const meta = chartInstance.controller.getDatasetMeta(i);
          meta.data.forEach((bar: any, index: any) => {
            const data = dataset.data[index];
            ctx.fillText(data, bar._model.x + 20, bar._model.y + 5);
            // const label = bar._model.label;
            // const xOffset = 40;
            // const yOffset = bar._model.y - 10;
            // ctx.fillText(label, xOffset, yOffset);
          });
        });
      }
    }
  };
  public barChartLabels: any[] = ['Total payment', 'Advance', 'Overdue'];
  public barChartType: ChartType = 'horizontalBar';
  public barChartLegend = true;
  public barChartData: any[] = [
    { data: [88945, 55231, 67983], label: 'Payments' }
  ];
  public barColors: any[] = [{ backgroundColor: '#1b69d0' }];
  // doughnutChart
  public doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      position: 'left',
      labels: {
        fontSize: 10,
        padding: 20,
        usePointStyle: true
      }
    },
    cutoutPercentage: 80,
    elements: {
      arc: {
        borderWidth: 0
      }
    },
    plugins: {
      labels: {
        // tslint:disable-next-line:typedef
        render: function (args) {
          return args.value + '%';
        },
        fontColor: '#000',
        position: 'outside',
        // overlap: true,
        // outsidePadding: 4
        // textMargin: 4
      }
    }
  };
  public doughnutChartType: ChartType = 'doughnut';
  public doughnutChartLabels: any[] = ['0 - 30', '31 - 60', '61 - 90', '91 - above'];
  public doughnutChartData: any[] = [
    [40, 20, 30, 10]
  ];
  public colors: any[] = [{ backgroundColor: ['#716391', '#9ae9d9', '#fbe300', '#f66861'] }];

  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private formBuilder: FormBuilder,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private paymentService: PaymentService,
    private _masterService: MasterService,
    private _datePipe: DatePipe,
    private _excelService: ExcelService,
    private _authService: AuthService,

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
      if (this.MenuItems.indexOf('Payable') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.CreateAppUsage();
    this.InitializeSearchForm();
    // this.GetPayableByPatnerID();
    this.SearchClicked();
  }
  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'Payables';
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
      Invoice: [''],
      FromDate: [this.DefaultFromDate],
      ToDate: [this.DefaultToDate]
    });
  }
  ResetControl(): void {
    this.Payables = [];
    this.ResetFormGroup(this.SearchFormGroup);
  }
  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }
  GetPayableByPatnerID(): void {
    this.IsProgressBarVisibile = true;
    this.paymentService.GetPayableByPartnerID(this.currentUserName).subscribe(
      (data) => {
        this.Payables = data as BPCPayPayable[];
        this.tableDataSource = new MatTableDataSource(this.Payables);
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
        const Invoice = this.SearchFormGroup.get('Invoice').value;
        this.IsProgressBarVisibile = true;
        this.paymentService.FilterPayableByPartnerID(this.currentUserName, Invoice, FromDate, ToDate).subscribe(
          (data) => {
            this.Payables = data as BPCPayPayable[];
            this.tableDataSource = new MatTableDataSource(this.Payables);
            this.tableDataSource.paginator = this.tablePaginator;
            this.tableDataSource.sort = this.tableSort;
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
    const currentPageIndex = this.tableDataSource.paginator.pageIndex;
    const PageSize = this.tableDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.Payables.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Invoice': x.Invoice,
        'Invoice Date': x.InvoiceDate ? this._datePipe.transform(x.InvoiceDate, 'dd-MM-yyyy') : '',
        'Posted on': x.PostedOn ? this._datePipe.transform(x.PostedOn, 'dd-MM-yyyy') : '',
        'Due Date': x.DueDate,
        'Adv Amount': x.AdvAmount,
        'Invoice value': x.Amount,
        'Currency': x.Currency,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'payable');
  }
  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
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

