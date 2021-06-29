import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { AuthenticationDetails, UserWithRole, AppUsage } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { BPCPODHeader, BPCPODView, BPCPODItem, ChartDetails } from 'app/models/POD';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { BPCOFHeader, BPCOFItem } from 'app/models/OrderFulFilment';
import { BehaviorSubject } from 'rxjs';
import { MatPaginator, MatSort, MatTableDataSource, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { BPCInvoiceAttachment, DocumentCenter, BPCCountryMaster, BPCCurrencyMaster, BPCDocumentCenterMaster } from 'app/models/ASN';
import { SelectionModel } from '@angular/cdk/collections';
import { FuseConfigService } from '@fuse/services/config.service';
import { MasterService } from 'app/services/master.service';
import { FactService } from 'app/services/fact.service';
import { POService } from 'app/services/po.service';
import { PODService } from 'app/services/pod.service';
import { VendorMasterService } from 'app/services/vendor-master.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { ASNService } from 'app/services/asn.service';
import { BPCFact } from 'app/models/fact';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';
import { ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { ExcelService } from 'app/services/excel.service';

@Component({
  selector: 'app-pod',
  templateUrl: './pod.component.html',
  styleUrls: ['./pod.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class PODComponent implements OnInit {
  @ViewChild(BaseChartDirective) BaseChart: BaseChartDirective;
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  SearchFormGroup: FormGroup;
  isDateError: boolean;
  isExpanded: boolean;
  searchText: string;
  DefaultFromDate: Date;
  DefaultToDate: Date;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  IsProgressBarVisibile1: boolean;
  SelectedBPCFact: BPCFact;
  AllPODHeaders: BPCPODHeader[] = [];
  FilteredPODHeaders: BPCPODHeader[] = [];
  StatusOptions = [
    { Value: "All", Name: "All" },
    { Value: "Open", Name: "Open" },
    { Value: "Saved", Name: "Saved" },
    { Value: "PartiallyConfirmed", Name: "PartiallyConfirmed" },
    { Value: "Confirmed", Name: "Confirmed" },
  ];
  PODDisplayedColumns: string[] = [
    'InvoiceNumber',
    'InvoiceDate',
    'Amount',
    'Currency',
    'DocNumber',
    'TruckNumber',
    'Transporter',
    'VessleNumber',
    'Status',
  ];
  // PODataSource = new MatTableDataSource<BPCPODHeader>([]);
  // @ViewChild(MatPaginator) PODItemPaginator: MatPaginator;
  // @ViewChild(MatSort) PODItemSort: MatSort;
  PODataSource: MatTableDataSource<BPCPODHeader>;
  // @ViewChild(MatPaginator) PODDetails: MatPaginator;
  @ViewChild(MatPaginator) POPaginator: MatPaginator;
  @ViewChild(MatSort) PODSort: MatSort;
  SecretKey: string;
  SecureStorage: SecureLS;

  // Pie chart
  PODPieChartData: ChartDetails[] = [];
  public pieChartOptions = {
    //  responsive: true,
    //  // cornerRadius: 20,
    //  maintainAspectRatio: false,
    //  legend: {
    //    position: "right",
    //    // align: "end",
    //    labels: {
    //      fontSize: 10,
    //      usePointStyle: true,
    //    },
    //  },
    //  plugins: {
    //    labels: {
    //      render: 'value',
    //      fontSize: 12,
    //      fontColor: '#000',
    //    }
    //  }
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
    { backgroundColor: ['#fb863a', '#40a8e2', '#5f2cff', '#34ad65'] }
    // { backgroundColor: ['#34ad65', '#9bc400', '#ffde22', "#fb863a", '#ff414e', '#5f255f', "#5f2cff", '#40a8e2', "#74a2f1", "#b5f9ff", "#c3d8fd"] },
  ];

  constructor(
    private _fuseConfigService: FuseConfigService,
    private _masterService: MasterService,
    private _FactService: FactService,
    private _ASNService: ASNService,
    private _PODService: PODService,
    private _vendorMasterService: VendorMasterService,
    private _excelService: ExcelService,
    private _datePipe: DatePipe,
    private _route: ActivatedRoute,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _authService: AuthService,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.IsProgressBarVisibile1 = false;
    this.isExpanded = false;
    this.isDateError = false;
    this.searchText = '';
    this.DefaultFromDate = new Date();
    this.DefaultFromDate.setDate(this.DefaultFromDate.getDate() - 30);
    this.DefaultToDate = new Date();
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });

  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      // if (this.MenuItems.indexOf('POD') < 0) {
      //     this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //     );
      //     this._router.navigate(['/auth/login']);
      // }

    } else {
      this._router.navigate(['/auth/login']);
    }
    this.CreateAppUsage();
    this.InitializeSearchForm();
    this.GetFactByPartnerID();
    // this.GetAllPODByPartnerID();
    // this.GetPODPieChartDataByPartnerID();
    this.SearchClicked('Search');
  }
  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'POD';
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
    this.SearchFormGroup = this._formBuilder.group({
      InvoiceNumber: [''],
      Status: [''],
      FromDate: [''],
      ToDate: [''],
      // FromDate: [this.DefaultFromDate],
      // ToDate: [this.DefaultToDate],
    });
  }
  GetFactByPartnerID(): void {
    this._FactService.GetFactByPartnerID(this.currentUserName).subscribe(
      (data) => {
        this.SelectedBPCFact = data as BPCFact;
      },
      (err) => {
        console.error(err);
      }
    );
  }
  GetAllPODByPartnerID(): void {
    this.IsProgressBarVisibile = true;
    // this.FilteredPODHeaders = [];
    this._PODService.GetAllPODByPartnerID(this.currentUserName).subscribe(
      (data) => {
        this.AllPODHeaders = data as BPCPODHeader[];
        this.FilteredPODHeaders = this.AllPODHeaders.filter(x => x.IsActive);
        this.PODataSource = new MatTableDataSource(this.FilteredPODHeaders);
        this.PODataSource.paginator = this.POPaginator;
        this.PODataSource.sort = this.PODSort;
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        this.IsProgressBarVisibile = false;
        console.error(err);
      }
    );
  }
  GetPODPieChartDataByPartnerID(): void {
    this.IsProgressBarVisibile1 = true;
    this.PODPieChartData = [];
    this._PODService.GetPODPieChartDataByPartnerID(this.currentUserName).subscribe(
      (data) => {
        // this.AllPODHeaders = data as BPCPODHeader[];
        // this.PODataSource = new MatTableDataSource(this.AllPODHeaders);
        // this.PODataSource.paginator = this.POPaginator;
        // this.IsProgressBarVisibile = false;
        this.PODPieChartData = data as ChartDetails[];
        this.pieChartLabels = [];
        this.pieChartData = [];
        setTimeout(() => {
          this.PODPieChartData.forEach(x => {
            this.pieChartLabels.push(x.label);
            this.pieChartData.push(x.Value);
            this.BaseChart.chart.config.data.labels = this.pieChartLabels;
            this.BaseChart.chart.update();
          }, 10);
        });
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
  SearchClicked(text: string): void {
    if (this.SearchFormGroup.valid) {
      // if (text) {
      //   this.CreateActionLogvalues(text);
      // }
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
        const InvoiceNumber = this.SearchFormGroup.get('InvoiceNumber').value;
        let Status = this.SearchFormGroup.get('Status').value;
        Status = Status === 'All' ? '' : Status;
        this.IsProgressBarVisibile = true;
        this._PODService.FilterPOD(this.currentUserName, InvoiceNumber, Status, FromDate, ToDate).subscribe(
          (data) => {
            this.AllPODHeaders = data as BPCPODHeader[];
            this.FilteredPODHeaders = this.AllPODHeaders.filter(x => x.IsActive);
            this.PODataSource = new MatTableDataSource(this.FilteredPODHeaders);
            this.PODataSource.paginator = this.POPaginator;
            this.PODataSource.sort = this.PODSort;
            this.IsProgressBarVisibile = false;
          },
          (err) => {
            console.error(err);
            this.IsProgressBarVisibile = false;
          }
        );
        this.FilterPODPieChartData(this.currentUserName, InvoiceNumber, Status, FromDate, ToDate);
      }
    } else {
      this.ShowValidationErrors(this.SearchFormGroup);
    }
  }
  FilterPODPieChartData(PartnerID: string, InvoiceNumber: string, Status: string, FromDate: string, ToDate): void {
    this.IsProgressBarVisibile1 = true;
    this.PODPieChartData = [];
    this._PODService.FilterPODPieChartData(this.currentUserName, InvoiceNumber, Status, FromDate, ToDate).subscribe(
      (data) => {
        this.PODPieChartData = data as ChartDetails[];
        this.pieChartLabels = [];
        this.pieChartData = [];
        setTimeout(() => {
          this.PODPieChartData.forEach(x => {
            this.pieChartLabels.push(x.label);
            this.pieChartData.push(x.Value);
            this.BaseChart.chart.config.data.labels = this.pieChartLabels;
            this.BaseChart.chart.update();
          }, 10);
        });
        this.IsProgressBarVisibile1 = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile1 = false;
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
          this.FilteredPODHeaders = this.AllPODHeaders.filter(x => x.Status === label);
          this.PODataSource = new MatTableDataSource(this.FilteredPODHeaders);
          this.PODataSource.paginator = this.POPaginator;
          this.PODataSource.sort = this.PODSort;
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
    // this.CreateActionLogvalues("Export As XLSX");
    const currentPageIndex = this.PODataSource.paginator.pageIndex;
    const PageSize = this.PODataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.FilteredPODHeaders.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Invoice No': x.InvoiceNumber,
        'Invoice Date': x.InvoiceDate ? this._datePipe.transform(x.InvoiceDate, 'dd-MM-yyyy') : '',
        'Amount': x.Amount,
        'Currency': x.Currency,
        'Doc Number': x.DocNumber,
        'Truck Number': x.TruckNumber,
        'Transporter': x.Transporter,
        'Vessle Number': x.VessleNumber,
        'Status': x.Status,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'POD');
  }
  expandClicked(): void {
    // this.CreateActionLogvalues("Expand");
    this.isExpanded = !this.isExpanded;
  }
  applyFilter(event: Event): void {
    // this.CreateActionLogvalues("SearchBarFilter");
    const filterValue = (event.target as HTMLInputElement).value;
    this.PODataSource.filter = filterValue.trim().toLowerCase();
  }
  GotoPODDetails(invoiceNumber: string): void {
    if (invoiceNumber) {
      this._router.navigate(['/customer/poddetails'], { queryParams: { id: invoiceNumber } });
    }
  }

}
