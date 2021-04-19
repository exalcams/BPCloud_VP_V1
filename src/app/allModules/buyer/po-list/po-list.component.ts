import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { AuthenticationDetails, AppUsage } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { BPCInvoice } from 'app/models/ReportModel';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { FuseConfigService } from '@fuse/services/config.service';
import { Router } from '@angular/router';
import { MasterService } from 'app/services/master.service';
import { ExcelService } from 'app/services/excel.service';
import { DatePipe } from '@angular/common';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { POService } from 'app/services/po.service';
import { BPCOFHeader } from 'app/models/OrderFulFilment';

@Component({
  selector: 'app-po-list',
  templateUrl: './po-list.component.html',
  styleUrls: ['./po-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class PoListComponent implements OnInit {

  BGClassName: any;
  fuseConfig: any;
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  PODisplayedColumns: string[] = [
    'PatnerID',
    "DocNumber",
    "DocVersion",
    "DocType",
    "DocDate",
    "PlantName",
    'CrossAmount',
    'NetAmount',
    'Status',
  ];
  AllPOList: BPCOFHeader[];
  POListDataSource: MatTableDataSource<BPCOFHeader>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  SearchFormGroup: FormGroup;
  isDateError: boolean;
  DefaultFromDate: Date;
  DefaultToDate: Date;
  searchText: string;
  SelectValue: string;
  isExpanded: boolean;
  POStatuses: any[] = [];
  constructor(private _fuseConfigService: FuseConfigService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _masterService: MasterService,
    private _POService: POService,
    private _excelService: ExcelService,
    private _datePipe: DatePipe
  ) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.authenticationDetails = new AuthenticationDetails();
    this.IsProgressBarVisibile = false;
    this.isDateError = false;
    this.searchText = '';
    this.SelectValue = 'All';
    this.isExpanded = false;
    this.DefaultFromDate = new Date();
    this.DefaultFromDate.setDate(this.DefaultFromDate.getDate() - 30);
    this.DefaultToDate = new Date();
    this.POStatuses = [
      { Key: 'All', Value: 'All' },
      { Key: 'Due for ACK', Value: 'DueForACK' },
      { Key: 'Due for ASN', Value: 'DueForASN' },
      { Key: 'Due for Gate', Value: 'DueForGate' },
      { Key: 'Due for GRN', Value: 'DueForGRN' }
    ];
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
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      // if (this.MenuItems.indexOf('BuyerPOList') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //   );
      //   this._router.navigate(['/auth/login']);
      // }

    } else {
      this._router.navigate(['/auth/login']);
    }
    this.CreateAppUsage();
    this.InitializeSearchFormGroup();
    // this.GetAllPOList();
    this.SearchClicked();
  }
  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'Invoice';
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
  InitializeSearchFormGroup(): void {
    this.SearchFormGroup = this._formBuilder.group({
      FromDate: [this.DefaultFromDate],
      ToDate: [this.DefaultToDate],
      VendorCode: [''],
      PONumber: [''],
      Status: ['DueForACK'],
    });
  }
  ResetControl(): void {
    this.AllPOList = [];
    this.ResetFormGroup(this.SearchFormGroup);
  }
  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }
  getBackGroundColor(status: string): string {
    switch (status) {
      case 'Approved':
        return '#cdfcd6';
      case 'Awaiting Approval':
        return '#fdffc6';
      case 'Pending':
        return '#fdb9b1';
      default:
        return 'white';
    }
  }

  GetAllPOList(): void {
    this.IsProgressBarVisibile = true;
    this._POService.GetAllPOList().subscribe(
      (data) => {
        this.AllPOList = data as BPCOFHeader[];
        this.POListDataSource = new MatTableDataSource(this.AllPOList);
        this.POListDataSource.paginator = this.paginator;
        this.POListDataSource.sort = this.sort;
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );

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
        const VendorCode = this.SearchFormGroup.get('VendorCode').value;
        const PONumber = this.SearchFormGroup.get('PONumber').value;
        let Status = this.SearchFormGroup.get('Status').value as string;
        if (Status && Status.toLowerCase() === 'all') {
          Status = '';
        }
        this.IsProgressBarVisibile = true;
        this._POService.FilterPOList(VendorCode, PONumber, Status, FromDate, ToDate).subscribe(
          (data) => {
            this.AllPOList = data as BPCOFHeader[];
            this.POListDataSource = new MatTableDataSource(this.AllPOList);
            this.POListDataSource.paginator = this.paginator;
            this.POListDataSource.sort = this.sort;
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
  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
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
    const currentPageIndex = this.POListDataSource.paginator.pageIndex;
    const PageSize = this.POListDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.AllPOList.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Vendor': x.PatnerID,
        'PO Number': x.DocNumber,
        'PO Date': x.DocDate ? this._datePipe.transform(x.DocDate, 'dd-MM-yyyy') : '',
        'Version': x.DocVersion,
        'Type': x.DocType,
        'Plant': x.PlantName,
        'Gross Amount': x.CrossAmount,
        'Net Amount': x.NetAmount,
        'Status': x.Status,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'polist');
    // const itemsShowed1 = this.TransDetailsTable.nativeElement;
    // this.excelService.exportTableToExcel(itemsShowed1, 'Sample');
  }

  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.POListDataSource.filter = filterValue.trim().toLowerCase();
  }

}
