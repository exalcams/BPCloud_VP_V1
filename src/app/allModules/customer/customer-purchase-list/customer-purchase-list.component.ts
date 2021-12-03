import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { CustomerService } from 'app/services/customer.service';
import {
  AuthenticationDetails,
  UserWithRole,
  AppUsage,
  UserPreference,
} from "app/models/master";
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { Router } from '@angular/router';
import { BPCPIHeader } from 'app/models/customer';
import { MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { FactService } from 'app/services/fact.service';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ExcelService } from 'app/services/excel.service';
import { fuseAnimations } from '@fuse/animations';
import { customAnimation } from 'app/animations/custom-animations';

@Component({
  selector: 'app-customer-purchase-list',
  templateUrl: './customer-purchase-list.component.html',
  styleUrls: ['./customer-purchase-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: [fuseAnimations, customAnimation]
})
export class CustomerPurchaseListComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  PartnerID: string;
  currentUserRole: string;
  MenuItems: string[];
  IsProgressBarVisibile: boolean;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  PurchaseDataSource: MatTableDataSource<BPCPIHeader>;
  AllPurchase: BPCPIHeader[] = [];
  @ViewChild(MatPaginator) PurchasePaginator: MatPaginator;
  @ViewChild(MatSort) PurchaseSort: MatSort;
  PurchaseDisplayedColumns: string[] = [
    "PIRNumber",
    "Date",
    "ReferenceDoc",
    "Status",
    // "StatusFlow",
  ];
  client: any;
  company: any;
  type: any;
  patnerid: any;
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
      { Key: 'Created', Value: '30' },
      { Key: 'Cancelled', Value: '40' }
    ];
  }

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
    this.InitializeSearchFormGroup();
    // this.GetAllPurchaseIndentsByPartnerID();
    // this.GetFactByPartnerID();
    this.SearchClicked();
  }

  InitializeSearchFormGroup(): void {
    this.SearchFormGroup = this._formBuilder.group({
      FromDate: [this.DefaultFromDate],
      ToDate: [this.DefaultToDate],
      // VendorCode: [''],
      RefNumber: [''],
      Status: ['20'],
    });
  }
  ResetControl(): void {
    this.AllPurchase = [];
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
  //         this.GetAllPurchaseIndentsByPartnerID();
  //       }
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }
  // GetAllPurchaseIndentsByPartnerID(): void {
  //   this.IsProgressBarVisibile = true;
  //   this._customerService.GetAllPurchaseIndentsByPartnerID(this.client, this.company, this.type, this.patnerid).subscribe(
  //     (data) => {

  //       // console.log("data" + data);
  //       this.AllPurchase = data as BPCPIHeader[];

  //       this.PurchaseDataSource = new MatTableDataSource(this.AllPurchase);
  //       this.PurchaseDataSource.paginator = this.PurchasePaginator;
  //       this.PurchaseDataSource.sort = this.PurchaseSort;
  //       this.IsProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.IsProgressBarVisibile = false;
  //     }
  //   );
  // }
  Gotocreate(PIRNnum): void {
    this.IsProgressBarVisibile = true;
    if (PIRNnum) {

      this._router.navigate(["/customer/purchaseindent"], {
        queryParams: { id: PIRNnum },
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
        const RefNumber = this.SearchFormGroup.get('RefNumber').value;
        let Status = this.SearchFormGroup.get('Status').value as string;
        if (Status && Status.toLowerCase() === 'all') {
          Status = '';
        }
        this.IsProgressBarVisibile = true;
        this.AllPurchase = [];
        this.PurchaseDataSource = new MatTableDataSource(this.AllPurchase);
        this._customerService.FilterPurchaseIndents(this.currentUserName, RefNumber, Status, FromDate, ToDate).subscribe(
          (data) => {
            this.AllPurchase = data as BPCPIHeader[];
            this.PurchaseDataSource = new MatTableDataSource(this.AllPurchase);
            this.PurchaseDataSource.paginator = this.PurchasePaginator;
            this.PurchaseDataSource.sort = this.PurchaseSort;
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
    const currentPageIndex = this.PurchaseDataSource.paginator.pageIndex;
    const PageSize = this.PurchaseDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.AllPurchase.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        // 'Vendor': x.PatnerID,
        'Order': x.PIRNumber,
        'Date': x.Date ? this._datePipe.transform(x.Date, 'dd-MM-yyyy') : '',
        'Ref Number': x.ReferenceDoc,
        'Status': x.Status,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'purchaselist');
    // const itemsShowed1 = this.TransDetailsTable.nativeElement;
    // this.excelService.exportTableToExcel(itemsShowed1, 'Sample');
  }

  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.PurchaseDataSource.filter = filterValue.trim().toLowerCase();
  }

}
