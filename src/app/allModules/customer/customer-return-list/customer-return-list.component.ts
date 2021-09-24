import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { BPCPIHeader, BPCRetHeader } from 'app/models/customer';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { CustomerService } from 'app/services/customer.service';
import { ExcelService } from 'app/services/excel.service';
import { FactService } from 'app/services/fact.service';
import { Guid } from 'guid-typescript';
import * as SecureLS from 'secure-ls';

@Component({
  selector: 'app-customer-return-list',
  templateUrl: './customer-return-list.component.html',
  styleUrls: ['./customer-return-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CustomerReturnListComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  PartnerID: string;
  currentUserRole: string;
  MenuItems: string[];
  IsProgressBarVisibile: boolean;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  client: any;
  company: any;
  type: any;
  patnerid: any;

  ReturnDataSource: MatTableDataSource<BPCRetHeader>;
  AllReturns: BPCRetHeader[] = [];
  @ViewChild(MatPaginator) ReturnPaginator: MatPaginator;
  @ViewChild(MatSort) ReturnSort: MatSort;
  ReturnListDisplayedColumns: string[] = [
    "RequestID",
    "Date",
    "InvoiceDoc",
    "DocumentNumber",
    // "CreditNote",
    "AWBNumber",
    // "Transporter",
    // "TruckNumber",
    "Status",
    // "StatusFlow",
  ];
  SecretKey: string;
  SecureStorage: SecureLS;
  isExpanded: boolean;

  SearchFormGroup: FormGroup;
  isDateError: boolean;
  DefaultFromDate: Date;
  DefaultToDate: Date;
  Statuses = [];
  searchText = '';
  constructor(
    private _formBuilder: FormBuilder,
    public _customerService: CustomerService,
    private _router: Router,
    private _FactService: FactService,
    private _authService: AuthService,
    private _excelService: ExcelService,
    public snackBar: MatSnackBar,
    private _datePipe: DatePipe
  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.authenticationDetails = new AuthenticationDetails();
    this.IsProgressBarVisibile = false;
    this.isExpanded = false;
    this.DefaultFromDate = new Date();
    this.DefaultFromDate.setDate(this.DefaultFromDate.getDate() - 30);
    this.DefaultToDate = new Date();
    this.Statuses = [
      { Key: 'All', Value: '' },
      { Key: 'Draft', Value: '10' },
      { Key: 'Submitted', Value: '20' },
      { Key: 'Accepted', Value: '30' },
      // { Key: 'Cancelled', Value: '40' }
    ];
  }
  // ReturnsData:
  ngOnInit(): void {
    const retrievedObject = this.SecureStorage.get("authorizationData");
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(
        retrievedObject
      ) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.PartnerID = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(
        ","
      );
      // console.log(this.authenticationDetails);
      if (this.MenuItems.indexOf("CustomerPurchaseList") < 0) {
        this.notificationSnackBarComponent.openSnackBar(
          "You do not have permission to visit this page",
          SnackBarStatus.danger
        );
        this._router.navigate(["/auth/login"]);
      }
    } else {
      this._router.navigate(["/auth/login"]);
    }
    // this.GetFactByPartnerID();
    this.InitializeSearchFormGroup();
    this.SearchClicked();
  }
  InitializeSearchFormGroup(): void {
    this.SearchFormGroup = this._formBuilder.group({
      FromDate: [this.DefaultFromDate],
      ToDate: [this.DefaultToDate],
      // VendorCode: [''],
      DocumentNumber: [''],
      Status: ['20'],
    });
  }
  ResetControl(): void {
    this.AllReturns = [];
    this.ResetFormGroup(this.SearchFormGroup);
  }
  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }
  // GetFactByPartnerID(): void {
  //   this._FactService.GetFactByPartnerID(this.currentUserName).subscribe(
  //     (data) => {

  //       this.client = data.Client,
  //         this.company = data.Company,
  //         this.type = data.Type,
  //         this.patnerid = data.PatnerID;
  //       if (data) {
  //         this.GetReturnList();
  //       }
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }
  // GetReturnList(): void {
  //   this.IsProgressBarVisibile = true;
  //   this._customerService.GetReturnList(this.client, this.company, this.type, this.patnerid).subscribe(
  //     (data) => {
  //       this.AllReturns = data as BPCRetHeader[];
  //       console.log(this.AllReturns);
  //       this.ReturnDataSource = new MatTableDataSource(this.AllReturns);
  //       this.ReturnDataSource.paginator = this.ReturnPaginator;
  //       this.ReturnDataSource.sort = this.ReturnSort;
  //       this.IsProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.IsProgressBarVisibile = false;
  //     }
  //   );
  // }
  Gotocreate(RetReqID): void {
    this.IsProgressBarVisibile = true;
    if (RetReqID) {

      this._router.navigate(["/customer/customerreturn"], {
        queryParams: { id: RetReqID },
      });
    }
    else {
      this._router.navigate(["/auth/login"]);
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
        // const PartnerID = this.SearchFormGroup.get('PartnerID').value;
        const DocumentNumber = this.SearchFormGroup.get('DocumentNumber').value;
        let Status = this.SearchFormGroup.get('Status').value as string;
        if (Status && Status.toLowerCase() === 'all') {
          Status = '';
        }
        this.IsProgressBarVisibile = true;
        this._customerService.FilterReturns(this.currentUserName, DocumentNumber, Status, FromDate, ToDate).subscribe(
          (data) => {
            this.AllReturns = data as BPCRetHeader[];
            // console.log(this.AllReturns);
            this.ReturnDataSource = new MatTableDataSource(this.AllReturns);
            this.ReturnDataSource.paginator = this.ReturnPaginator;
            this.ReturnDataSource.sort = this.ReturnSort;
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
  // SetUserPreference(): void {
  //   this._fuseConfigService.config
  //     .subscribe((config) => {
  //       this.fuseConfig = config;
  //       this.BGClassName = config;
  //     });
  //   // this._fuseConfigService.config = this.fuseConfig;
  // }
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
    const currentPageIndex = this.ReturnDataSource.paginator.pageIndex;
    const PageSize = this.ReturnDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.AllReturns.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        // 'Vendor': x.PatnerID,
        'ID': x.RetReqID,
        'Date': x.Date ? this._datePipe.transform(x.Date, 'dd-MM-yyyy') : '',
        'Inv Ref Number': x.InvoiceDoc,
        'SO Number': x.DocumentNumber,
        'Credit Note': x.CreditNote,
        'AWB Number': x.AWBNumber,
        'Transporter': x.Transporter,
        'Truck Number': x.TruckNumber,
        'Status': x.Status,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'returnlist');
    // const itemsShowed1 = this.TransDetailsTable.nativeElement;
    // this.excelService.exportTableToExcel(itemsShowed1, 'Sample');
  }

  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.ReturnDataSource.filter = filterValue.trim().toLowerCase();
  }
}
