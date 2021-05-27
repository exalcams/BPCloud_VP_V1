import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ReportService } from 'app/services/report.service';
import { BPCReportIP } from 'app/models/ReportModel';
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
  selector: 'app-inspection-plan',
  templateUrl: './inspection-plan.component.html',
  styleUrls: ['./inspection-plan.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class InspectionPlanComponent implements OnInit {
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
  inspectionPlanReportDisplayedColumns: string[] = ['Material', 'MaterialText', 'Desc', 'LowerLimit', 'UpperLimit', 'UOM',
    'Method', 'ModRule'];
  inspectionPlanReportDataSource: MatTableDataSource<BPCReportIP>;
  inspectionPlanReports: BPCReportIP[] = [];
  @ViewChild(MatPaginator) inspectionPlanPaginator: MatPaginator;
  @ViewChild(MatSort) inspectionPlanSort: MatSort;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  data: any[];

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
    backgroundColor: ['#58dfa7']
  }];

  // right Side Chart
  public DoughnutChartData: Array<number> = [32.5, 33, 33];
  public DoughnutlabelMFL: Array<any> = [
    {
      data: this.DoughnutChartData,
    }
  ];
  public DoughnutChartOptions: any = {
    maintainAspectRatio: false,
    responsive: false,
    cutoutPercentage: 70,
    borderWidth: 5,
    plugins: {
      labels: {
        fontColor: '#fff',
        fontFamily: 'Segoe UI',
        fontSize: 13

      }
    },
    elements: {
      arc: {
        borderWidth: 0
      }
    }
  };
  public doughnutChartColors2: Array<any> = [{
    backgroundColor: ['#3c9cdf', '#fddc0e', '#58dfa7']

  }];
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
      // if (this.menuItems.indexOf('InspectionPlan') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //   );
      //   this._router.navigate(['/auth/login']);
      // }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.CreateAppUsage();
    this.GetInspectionPlanReports();
    this.initializeSearchForm();
    // this.searchButtonClicked();
  }

  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'InspectionPlan';
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

  GetInspectionPlanReports(): void {
    this.isProgressBarVisibile = true;
    this._reportService.GetAllReportIPByPartnerID(this.currentUserName).subscribe(
      (data) => {
        this.inspectionPlanReports = data as BPCReportIP[];
        this.inspectionPlanReportDataSource = new MatTableDataSource(this.inspectionPlanReports);
        this.inspectionPlanReportDataSource.paginator = this.inspectionPlanPaginator;
        this.inspectionPlanReportDataSource.sort = this.inspectionPlanSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  GetFilteredReportIPByPartnerID(material, inspectionMethod): void {
    this.isProgressBarVisibile = true;
    this._reportService.GetFilteredReportIPByPartnerID(this.currentUserName, material, inspectionMethod).subscribe(
      (data) => {
        this.inspectionPlanReports = data as BPCReportIP[];
        this.inspectionPlanReportDataSource = new MatTableDataSource(this.inspectionPlanReports);
        this.inspectionPlanReportDataSource.paginator = this.inspectionPlanPaginator;
        this.inspectionPlanReportDataSource.sort = this.inspectionPlanSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  // GetInspectionPlanReportByOption(inspectionPlanReportOption: InspectionPlanReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetInspectionPlanReportByOption(inspectionPlanReportOption).subscribe(
  //     (data) => {
  //       this.inspectionPlanReports = data as BPCReportIP[];
  //       this.inspectionPlanReportDataSource = new MatTableDataSource(this.inspectionPlanReports);
  //       this.inspectionPlanReportDataSource.paginator = this.inspectionPlanPaginator;
  //       this.inspectionPlanReportDataSource.sort = this.inspectionPlanSort;
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  // GetInspectionPlanReportByStatus(inspectionPlanReportOption: InspectionPlanReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetInspectionPlanReportByStatus(inspectionPlanReportOption).subscribe(
  //     (data) => {
  //       this.inspectionPlanReports = data as BPCReportIP[];
  //       this.inspectionPlanReportDataSource = new MatTableDataSource(this.inspectionPlanReports);
  //       this.inspectionPlanReportDataSource.paginator = this.inspectionPlanPaginator;
  //       this.inspectionPlanReportDataSource.sort = this.inspectionPlanSort;
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  // GetInspectionPlanReportByDate(inspectionPlanReportOption: InspectionPlanReportOption): void {
  //   this.isProgressBarVisibile = true;
  //   this._reportService.GetInspectionPlanReportByDate(inspectionPlanReportOption).subscribe(
  //     (data) => {
  //       this.inspectionPlanReports = data as BPCReportIP[];
  //       this.inspectionPlanReportDataSource = new MatTableDataSource(this.inspectionPlanReports);
  //       this.inspectionPlanReportDataSource.paginator = this.inspectionPlanPaginator;
  //       this.inspectionPlanReportDataSource.sort = this.inspectionPlanSort;
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
      InspectionMethod: [''],
      Material: ['']
      // FromDate: [this.defaultFromDate],
      // ToDate: [this.defaultToDate]
    });
  }

  randomize(): any[] {
    this.data = [];
    this.data.push(80);
    for (let i = 81; i <= 100; i++) {
      this.data.push(1);
    }
    return this.data;
  }

  resetControl(): void {
    this.inspectionPlanReports = [];
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
      const inspectionMethod = this.searchFormGroup.get('InspectionMethod').value;
      const material = this.searchFormGroup.get('Material').value;
      // const inspectionPlanReportOption = new InspectionPlanReportOption();
      // inspectionPlanReportOption.Material = material;
      // inspectionPlanReportOption.PO = inspectionMethod;
      // inspectionPlanReportOption.FromDate = FromDate;
      // inspectionPlanReportOption.ToDate = ToDate;
      // inspectionPlanReportOption.PartnerID = this.currentUserName;
      this.GetFilteredReportIPByPartnerID(material, inspectionMethod);
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
    const currentPageIndex = this.inspectionPlanReportDataSource.paginator.pageIndex;
    const PageSize = this.inspectionPlanReportDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.inspectionPlanReports.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Material': x.Material,
        // 'Material': x.InvoiceDate ? this._datePipe.transform(x.InvoiceDate, 'dd-MM-yyyy') : '',
        // 'Posted on': x.PostedOn ? this._datePipe.transform(x.PostedOn, 'dd-MM-yyyy') : '',
        'Material Text': x.MaterialText,
        'Material Characteritics': x.MaterialChar,
        'Description': x.Desc,
        'Lower Limit': x.LowerLimit,
        'Upper Limit': x.UpperLimit,
        'UOM': x.UOM,
        'Inspection Method': x.Method,
        'Mod Rule': x.ModRule,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'inspectionPlan');
  }

  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.inspectionPlanReportDataSource.filter = filterValue.trim().toLowerCase();
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

