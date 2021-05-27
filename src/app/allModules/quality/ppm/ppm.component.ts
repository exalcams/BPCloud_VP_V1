import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { ReportService } from 'app/services/report.service';
import { BPCReportPPMHeader, PPMReportOption, BPCReportPPMItem } from 'app/models/ReportModel';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl, Validators, FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { toDate } from '@angular/common/src/i18n/format_date';
import { fuseAnimations } from '@fuse/animations';
import { Guid } from 'guid-typescript';
import { AuthenticationDetails, AppUsage } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { MatPaginator, MatSort, MatMenuTrigger, MatSnackBar, MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ExcelService } from 'app/services/excel.service';
import { MasterService } from 'app/services/master.service';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { FuseConfigService } from '@fuse/services/config.service';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-ppm',
  templateUrl: './ppm.component.html',
  styleUrls: ['./ppm.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class PPMComponent implements OnInit {
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
  ppmHeaderReports: BPCReportPPMHeader[] = [];
  ppmItemReports: BPCReportPPMItem[] = [];
  ppmReportOption = new PPMReportOption();
  ppmHeaderReportDataSource: MatTableDataSource<BPCReportPPMHeader>;
  ppmHeaderReportDisplayedColumns: string[] = ['Period', 'ReceiptQty', 'RejectedQty', 'PPM', 'TotalPPM'];
  @ViewChild(MatPaginator) ppmHeaderPaginator: MatPaginator;
  @ViewChild(MatSort) ppmHeaderSort: MatSort;
  ppmItemReportDataSource: MatTableDataSource<BPCReportPPMItem>;
  ppmItemReportDisplayedColumns: string[] = ['Material', 'MaterialText', 'ReceiptQty', 'RejQty', 'PPM'];
  @ViewChild(MatPaginator) ppmItemPaginator: MatPaginator;
  @ViewChild(MatSort) ppmItemSort: MatSort;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  SecretKey: string;
  SecureStorage: SecureLS;
  // PPMData: any[] = [];
  // fromdate: any = '';
  // todate: any = '';
  constructor(private _reportService: ReportService,
    private _fuseConfigService: FuseConfigService,
    private _authService: AuthService,
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
      if (this.menuItems.indexOf('PPM') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.CreateAppUsage();
    this.GetPPMReports();
    this.initializeSearchForm();
    // this.searchButtonClicked();

  }

  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'PPM';
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

  GetPPMReports(): void {
    this.isProgressBarVisibile = true;
    this._reportService.GetPPMReports(this.currentUserName).subscribe(
      (data) => {
        this.ppmHeaderReports = data as BPCReportPPMHeader[];
        this.ppmHeaderReportDataSource = new MatTableDataSource(this.ppmHeaderReports);
        this.ppmHeaderReportDataSource.paginator = this.ppmHeaderPaginator;
        this.ppmHeaderReportDataSource.sort = this.ppmHeaderSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  GetPPMItemReports(): void {
    this.isProgressBarVisibile = true;
    this._reportService.GetPPMReports(this.currentUserName).subscribe(
      (data) => {
        this.ppmItemReports = data as BPCReportPPMItem[];
        this.ppmItemReportDataSource = new MatTableDataSource(this.ppmItemReports);
        this.ppmItemReportDataSource.paginator = this.ppmItemPaginator;
        this.ppmItemReportDataSource.sort = this.ppmItemSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  GetPPMReportByDate(ppmReportOption: PPMReportOption): void {
    this.isProgressBarVisibile = true;
    this._reportService.GetPPMReportByDate(ppmReportOption).subscribe(
      (data) => {
        this.ppmHeaderReports = data as BPCReportPPMHeader[];
        this.ppmHeaderReportDataSource = new MatTableDataSource(this.ppmHeaderReports);
        this.ppmHeaderReportDataSource.paginator = this.ppmHeaderPaginator;
        this.ppmHeaderReportDataSource.sort = this.ppmHeaderSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  GetPPMReportByStatus(ppmReportOption: any): void {
    this.isProgressBarVisibile = true;
    this._reportService.GetPPMReportByStatus(ppmReportOption).subscribe(
      (data) => {
        this.ppmHeaderReports = data as BPCReportPPMHeader[];
        this.ppmHeaderReportDataSource = new MatTableDataSource(this.ppmHeaderReports);
        this.ppmHeaderReportDataSource.paginator = this.ppmHeaderPaginator;
        this.ppmHeaderReportDataSource.sort = this.ppmHeaderSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  GetPPMItemReportByPeriod(currentUserName: string, period: Date): void {
    this.isProgressBarVisibile = true;
    this._reportService.GetPPMItemReportByPeriod(currentUserName, period).subscribe(
      (data) => {
        this.ppmItemReports = data as BPCReportPPMItem[];
        this.ppmItemReportDataSource = new MatTableDataSource(this.ppmItemReports);
        this.ppmItemReportDataSource.paginator = this.ppmItemPaginator;
        this.ppmItemReportDataSource.sort = this.ppmItemSort;
        this.isProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
      }
    );
  }

  initializeSearchForm(): void {
    this.searchFormGroup = this.formBuilder.group({
      // PONumber: [''],
      // Material: ['']
      FromDate: [this.defaultFromDate],
      ToDate: [this.defaultToDate]
    });
  }

  resetControl(): void {
    this.ppmHeaderReports = [];
    this.resetFormGroup(this.searchFormGroup);
  }

  resetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }

  dateSelected(): void {
    const FROMDATEVAL = this.searchFormGroup.get('FromDate').value as Date;
    const TODATEVAL = this.searchFormGroup.get('ToDate').value as Date;
    if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
      this.isDateError = true;
    } else {
      this.isDateError = false;
    }
  }

  searchButtonClicked(): void {
    if (this.searchFormGroup.valid) {
      if (!this.isDateError) {
        const FrDate = this.searchFormGroup.get('FromDate').value;
        let FromDate = '';
        if (FrDate) {
          FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
        }
        const TDate = this.searchFormGroup.get('ToDate').value;
        let ToDate = '';
        if (TDate) {
          ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
        }
        // const poNumber = this.searchFormGroup.get('PONumber').value;
        // const material = this.searchFormGroup.get('Material').value;
        const ppmReportOption = new PPMReportOption();
        // ppmReportOption.Material = material;
        // ppmReportOption.PO = poNumber;
        ppmReportOption.FromDate = FromDate;
        ppmReportOption.ToDate = ToDate;
        ppmReportOption.PartnerID = this.currentUserName;
        this.GetPPMReportByDate(ppmReportOption);
      }
    } else {
      this.showValidationErrors(this.searchFormGroup);
    }
  }

  ppmHeaderRowClicked(row: BPCReportPPMHeader): void {
    if (row) {
      this.GetPPMItemReportByPeriod(row.PatnerID, row.Period);
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

  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }
  // getPPMReportByDateClicked(): void {
  //   this.ppmReportOption.PartnerID = this.PPMData[0].PatnerID;
  //   this.ppmReportOption.Material = this.PPMData[0].Material;
  //   this.ppmReportOption.PO = "po";
  //   this.ppmReportOption.Status = this.PPMData[0].IsActive;

  //   if (this.fromdate) {
  //     this.ppmReportOption.FromDate = this.fromdate;
  //     this.ppmReportOption.ToDate = null;
  //   }
  //   else if (this.todate) {
  //     this.ppmReportOption.ToDate = this.todate;
  //     this.ppmReportOption.FromDate = null;
  //   }
  //   else {
  //     this.ppmReportOption.FromDate = this.fromdate;
  //     this.ppmReportOption.ToDate = this.todate;
  //   }
  //   this.GetPPMReportByDate(this.ppmReportOption);
  // }
}
