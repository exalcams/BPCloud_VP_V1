import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource, MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { SelectdialogComponent } from '../selectdialog/selectdialog.component';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { FuseConfigService } from '@fuse/services/config.service';
import { MenuApp, AuthenticationDetails, UserWithRole, AppUsage } from 'app/models/master';
import { SupportMaster, SupportHeader, SupportHeaderView } from 'app/models/support-desk';
import { CBPLocation } from 'app/models/vendor-master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { MasterService } from 'app/services/master.service';
import { RFxService } from 'app/services/rfx.service';
import { SupportDeskService } from 'app/services/support-desk.service';
import { VendorMasterService } from 'app/services/vendor-master.service';
import { Guid } from 'guid-typescript';
import { RFxHC, RFxHeader, RFxIC, RFxItem, RFxOD, RFxPartner, RFxVendor, RFxVendorView, RFxView } from 'app/models/RFx';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-creation',
  templateUrl: './creation.component.html',
  styleUrls: ['./creation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreationComponent implements OnInit {

  BGClassName: any;
  fuseConfig: any;
  MenuItems: string[];
  AllMenuApps: MenuApp[] = [];
  SelectedMenuApp: MenuApp;
  authenticationDetails: AuthenticationDetails;
  CurrentUserID: Guid;
  currentUserName: string;
  CurrentUserRole = '';
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  IsDisplayPhone2: boolean;
  IsDisplayEmail2: boolean;
  RFxFormGroup: FormGroup;
  RFxItemFormGroup: FormGroup;
  RFxHCDetailsFormGroup: FormGroup;
  RFxICFormGroup: FormGroup;
  RFxPartnerFormGroup: FormGroup;
  RFxVendorFormGroup: FormGroup;
  RFxODFormGroup: FormGroup;
  searchText = '';
  AllRFxs: RFxHeader[] = [];
  SelectedRFxID: string;
  SelectedRFx: RFxHeader;
  SelectedRFxView: RFxView;
  RFxItems: RFxItem[] = [];
  RFxHCs: RFxHC[] = [];
  RFxICs: RFxIC[] = [];
  RFxPartners: RFxPartner[] = [];
  RFxVendors: RFxVendor[] = [];
  RFxVendorViews: RFxVendorView[] = [];
  RFxODs: RFxOD[] = [];

  RFxHCDisplayedColumns: string[] = ['CriteriaID', 'Text', 'Action'];
  RFxItemDisplayedColumns: string[] = ['Item', 'Material', 'MaterialText', 'TotalQty', 'PerScheduleQty', 'TotalSchedules', 'BiddingPriceLow', 'Action']
  RFxICDisplayedColumns: string[] = ['Criteria', 'Text', 'Action'];
  RFxPartnerDisplayedColumns: string[] = ['Type', 'User', 'Action'];
  RFxVendorDisplayedColumns: string[] = ['Type', 'VendorName', 'GSTNumber', 'City', 'Action'];
  RFxODDisplayedColumns: string[] = ['Question', 'AnswerType', 'Action'];
  displayedAttachedColumns: string[] = ['select', 'document', 'remarks', 'Action'];

  RFxItemDataSource: MatTableDataSource<RFxItem>;
  RFxHCDataSource: MatTableDataSource<RFxHC>;
  RFxICDataSource: MatTableDataSource<RFxIC>;
  RFxPartnerDataSource: MatTableDataSource<RFxPartner>;
  RFxVendorDataSource: MatTableDataSource<RFxVendorView>;
  RFxODDataSource: MatTableDataSource<RFxOD>;

  selection = new SelectionModel<CriteriaData>(true, []);
  @ViewChild('iDNumber') iDNumber: ElementRef;
  @ViewChild('EvalDate') EvalDate: ElementRef;
  @ViewChild('accHolderName') accHolderName: ElementRef;
  @ViewChild('AccountName') AccountName: ElementRef;
  @ViewChild('RFxHCName') RFxHCName: ElementRef;
  @ViewChild('RFxHCID') RFxHCID: ElementRef;
  @ViewChild('RFxHCCity') RFxHCCity: ElementRef;
  @ViewChild('RFxICID') RFxICID: ElementRef;
  @ViewChild('title') title: ElementRef;
  @ViewChild('ContactNumber') ContactNumber: ElementRef;
  @ViewChild('email') email: ElementRef;
  @ViewChild('activityDate') activityDate: ElementRef;
  @ViewChild('activityTime') activityTime: ElementRef;
  @ViewChild('activityText') activityText: ElementRef;
  fileToUpload: File;
  fileToUploadList: File[] = [];
  math = Math;

  Users: UserWithRole[] = [];
  FilteredUsers: UserWithRole[] = [];
  SupportMasters: SupportMaster[] = [];
  SupportHeader: SupportHeader;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _masterService: MasterService,
    private _RFxService: RFxService,
    private _vendorMasterService: VendorMasterService,
    public _supportDeskService: SupportDeskService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _authService: AuthService,

  ) {
    // this._fuseConfigService.config = {
    //   layout: {
    //     navbar: {
    //       hidden: true
    //     },
    //     toolbar: {
    //       hidden: true
    //     },
    //     footer: {
    //       hidden: true
    //     },
    //     sidepanel: {
    //       hidden: true
    //     }
    //   }
    // };
    this.SecretKey = this._authService.SecretKey;
        this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.SelectedRFx = new RFxHeader();
    this.SelectedRFxView = new RFxView();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.IsDisplayPhone2 = false;
    this.IsDisplayEmail2 = false;
  }

  ngOnInit(): void {
    this.SetUserPreference();
    const retrievedObject =  this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.CurrentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.MenuItems.indexOf('RFQCreation') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
      this.CreateAppUsage();
      this.InitializeRFxFormGroup();
      this.InitializeRFxItemFormGroup();
      this.InitializeRFxHCDetailsFormGroup();
      this.InitializeRFxICFormGroup();
      this.InitializeRFxPartnerFormGroup();
      this.InitializeRFxVendorFormGroup();
      this.InitializeRFxODFormGroup();
      this.GetRFxByRFxID();
      this.GetSupportMasters();
      this.GetUsers();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }
  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.CurrentUserID;
    appUsage.AppName = 'RFQ Creation';
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
  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }
  InitializeRFxFormGroup(): void {
    this.RFxFormGroup = this._formBuilder.group({
      Client: ['', Validators.required],
      Company: ['', Validators.required],
      Plant: ['', Validators.required],
      RFxType: ['', Validators.required],
      RFxGroup: ['', Validators.required],
      ValidityStartDate: ['', Validators.required],
      ValidityEndDate: ['', Validators.required],
      ResponseStartDate: ['', Validators.required],
      ResponseEndDate: ['', Validators.required],
      Title: ['', Validators.required],
      Currency: ['', Validators.required],
    });
  }

  InitializeRFxItemFormGroup(): void {
    this.RFxItemFormGroup = this._formBuilder.group({
      Item: ['', Validators.required],
      Material: ['', Validators.required],
      MaterialText: ['', Validators.required],
      TotalQty: ['', Validators.required],
      PerScheduleQty: ['', Validators.required],
      TotalSchedules: ['', Validators.required],
      BiddingPriceLow: ['', Validators.required],
    });
  }

  InitializeRFxHCDetailsFormGroup(): void {
    this.RFxHCDetailsFormGroup = this._formBuilder.group({
      CriteriaID: ['', Validators.required],
      Text: ['', Validators.required],
    });
  }

  InitializeRFxICFormGroup(): void {
    this.RFxICFormGroup = this._formBuilder.group({
      Item: ['10', Validators.required],
      Criteria: ['', Validators.required],
      Text: ['', Validators.required],
    });
  }

  InitializeRFxPartnerFormGroup(): void {
    this.RFxPartnerFormGroup = this._formBuilder.group({
      Type: ['', Validators.required],
      User: ['', Validators.required],
    });
  }

  InitializeRFxVendorFormGroup(): void {
    this.RFxVendorFormGroup = this._formBuilder.group({
      Type: ['', Validators.required],
      VendorName: ['', Validators.required],
      GSTNumber: ['', Validators.required],
      City: ['', Validators.required],
    });
  }

  InitializeRFxODFormGroup(): void {
    this.RFxODFormGroup = this._formBuilder.group({
      Question: ['', Validators.required],
      AnswerType: ['', Validators.required],
    });
  }

  ResetControl(): void {
    this.SelectedRFx = new RFxHeader();
    this.SelectedRFxView = new RFxView();
    this.SelectedRFxID = '';
    this.RFxFormGroup.reset();
    Object.keys(this.RFxFormGroup.controls).forEach(key => {
      this.RFxFormGroup.get(key).enable();
      this.RFxFormGroup.get(key).markAsUntouched();
    });
    this.IsDisplayPhone2 = false;
    this.IsDisplayEmail2 = false;
    // this.fileToUpload = null;
    this.ClearRFxItemFormGroup();
    this.ClearRFxHCDetailsFormGroup();
    this.ClearRFxICFormGroup();
    this.ClearRFxPartnerFormGroup();
    this.ClearRFxItemDataSource();
    this.ClearRFxHCDetailsDataSource();
    this.ClearRFxICDataSource();
    this.ClearRFxPartnerDataSource();
  }

  ClearRFxItemFormGroup(): void {
    this.RFxItemFormGroup.reset();
    Object.keys(this.RFxItemFormGroup.controls).forEach(key => {
      this.RFxItemFormGroup.get(key).markAsUntouched();
    });
  }
  ClearRFxHCDetailsFormGroup(): void {
    this.RFxHCDetailsFormGroup.reset();
    Object.keys(this.RFxHCDetailsFormGroup.controls).forEach(key => {
      this.RFxHCDetailsFormGroup.get(key).markAsUntouched();
    });
  }
  ClearRFxICFormGroup(): void {
    this.RFxICFormGroup.reset();
    Object.keys(this.RFxICFormGroup.controls).forEach(key => {
      this.RFxICFormGroup.get(key).markAsUntouched();
    });
  }
  ClearRFxPartnerFormGroup(): void {
    this.RFxPartnerFormGroup.reset();
    Object.keys(this.RFxPartnerFormGroup.controls).forEach(key => {
      this.RFxPartnerFormGroup.get(key).markAsUntouched();
    });
  }

  ClearRFxVendorFormGroup(): void {
    this.RFxVendorFormGroup.reset();
    Object.keys(this.RFxVendorFormGroup.controls).forEach(key => {
      this.RFxVendorFormGroup.get(key).markAsUntouched();
    });
  }
  ClearRFxODFormGroup(): void {
    this.RFxODFormGroup.reset();
    Object.keys(this.RFxODFormGroup.controls).forEach(key => {
      this.RFxODFormGroup.get(key).markAsUntouched();
    });
  }
  ClearRFxItemDataSource(): void {
    this.RFxItems = [];
    this.RFxItemDataSource = new MatTableDataSource(this.RFxItems);
  }
  ClearRFxHCDetailsDataSource(): void {
    this.RFxHCs = [];
    this.RFxHCDataSource = new MatTableDataSource(this.RFxHCs);
  }
  ClearRFxICDataSource(): void {
    this.RFxICs = [];
    this.RFxICDataSource = new MatTableDataSource(this.RFxICs);
  }
  ClearRFxPartnerDataSource(): void {
    this.RFxPartners = [];
    this.RFxPartnerDataSource = new MatTableDataSource(this.RFxPartners);
  }

  GetRFxByRFxID(): void {
    this._RFxService.GetRFxByRFxID(this.currentUserName).subscribe(
      (data) => {
        const RFx = data as RFxHeader;
        if (RFx) {
          // this.loadSelectedRFx(RFx);
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }
  GetSupportMasters(): void {
    this.IsProgressBarVisibile = true;
    this._supportDeskService
      .GetSupportMasters()
      .subscribe((data) => {
        if (data) {
          this.SupportMasters = <SupportMaster[]>data;
        }
        this.IsProgressBarVisibile = false;
      },
        (err) => {
          console.error(err);
          this.IsProgressBarVisibile = false;
        });
  }

  GetUsers(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllUsers().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.Users = <UserWithRole[]>data;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  GetLocationByPincode(event): void {
    const Pincode = event.target.value;
    if (Pincode) {
      this._vendorMasterService.GetLocationByPincode(Pincode).subscribe(
        (data) => {
          const loc = data as CBPLocation;
          if (loc) {
            this.RFxFormGroup.get('City').patchValue(loc.District);
            this.RFxFormGroup.get('State').patchValue(loc.State);
            this.RFxFormGroup.get('Country').patchValue(loc.Country);
          }
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  DisplayPhone2(): void {
    this.RFxFormGroup.get('Phone2').setValidators([Validators.required, Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]);
    this.RFxFormGroup.get('Phone2').updateValueAndValidity();
    this.IsDisplayPhone2 = true;
  }
  DisplayEmail2(): void {
    this.RFxFormGroup.get('Email2').setValidators([Validators.required, Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]);
    this.RFxFormGroup.get('Email2').updateValueAndValidity();
    this.IsDisplayEmail2 = true;
  }


  loadSelectedRFx(selectedRFx: RFxHeader): void {
    this.ResetControl();
    this.SelectedRFx = selectedRFx;
    this.SelectedRFxID = selectedRFx.RFxID;
    // this.EnableAllRFxTypes();
    this.SetRFxValues();
    this.GetRFxSubItems();
  }
  // typeSelected(event): void {
  //   const selectedType = event.value;
  //   if (event.value) {
  //     this.SelectedRFx.Type = event.value;
  //   }
  // }
  // applyFilter(filterValue: string): void {
  //   this.RFxItemDataSource.filter = filterValue.trim().toLowerCase();
  // }

  // // EnableAllRFxTypes(): void {
  // //   Object.keys(this.RFxFormGroup.controls).forEach(key => {
  // //     this.RFxFormGroup.get(key).enable();
  // //   });
  // // }
  SetRFxValues(): void {
    this.RFxFormGroup.get('Client').patchValue(this.SelectedRFx.Client);
    this.RFxFormGroup.get('Company').patchValue(this.SelectedRFx.Company);
    this.RFxFormGroup.get('Plant').patchValue(this.SelectedRFx.Plant);
    this.RFxFormGroup.get('RFxType').patchValue(this.SelectedRFx.RFxType);
    this.RFxFormGroup.get('RFxGroup').patchValue(this.SelectedRFx.RFxGroup);
    this.RFxFormGroup.get('ValidityStartDate').patchValue(this.SelectedRFx.ValidityStartDate);
    this.RFxFormGroup.get('ValidityEndDate').patchValue(this.SelectedRFx.ValidityEndDate);
    this.RFxFormGroup.get('ResponseStartDate').patchValue(this.SelectedRFx.ResponseStartDate);
    this.RFxFormGroup.get('ResponseEndDate').patchValue(this.SelectedRFx.ResponseEndDate);
    this.RFxFormGroup.get('Title').patchValue(this.SelectedRFx.Title);
    this.RFxFormGroup.get('Currency').patchValue(this.SelectedRFx.Currency);
  }

  GetRFxSubItems(): void {
    this.GetRFxItemsByRFxID();
    this.GetRFxHCsByRFxID();
    this.GetRFxICsByRFxID();
    this.GetRFxPartnersByRFxID();
    this.GetRFxVendorsByRFxID();
  }

  GetRFxItemsByRFxID(): void {
    this.IsProgressBarVisibile = true;
    this._RFxService.GetRFxItemsByRFxID(this.SelectedRFxID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.RFxItems = data as RFxItem[];
        this.RFxItemDataSource = new MatTableDataSource(this.RFxItems);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetRFxHCsByRFxID(): void {
    this.IsProgressBarVisibile = true;
    this._RFxService.GetRFxHCsByRFxID(this.SelectedRFxID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.RFxHCs = data as RFxHC[];
        this.RFxHCDataSource = new MatTableDataSource(this.RFxHCs);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetRFxICsByRFxID(): void {
    this.IsProgressBarVisibile = true;
    this._RFxService.GetRFxICsByRFxID(this.SelectedRFxID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.RFxICs = data as RFxIC[];
        this.RFxICDataSource = new MatTableDataSource(this.RFxICs);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetRFxPartnersByRFxID(): void {
    this.IsProgressBarVisibile = true;
    this._RFxService.GetRFxPartnersByRFxID(this.SelectedRFxID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.RFxPartners = data as RFxPartner[];
        this.RFxPartnerDataSource = new MatTableDataSource(this.RFxPartners);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetRFxVendorsByRFxID(): void {
    this.IsProgressBarVisibile = true;
    this._RFxService.GetRFxVendorsByRFxID(this.SelectedRFxID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.RFxVendors = data as RFxVendor[];
        // this.RFxVendorDataSource = new MatTableDataSource(this.RFxVendors);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  GetRFxVendorViewsByRFxID(): void {
    this.IsProgressBarVisibile = true;
    this._RFxService.GetRFxVendorViewsByRFxID(this.SelectedRFxID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.RFxVendorViews = data as RFxVendorView[];
        this.RFxVendorDataSource = new MatTableDataSource(this.RFxVendorViews);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  AddRFxItemToTable(): void {
    if (this.RFxItemFormGroup.valid) {
      const FxItem = new RFxItem();
      FxItem.Item = this.RFxItemFormGroup.get('Item').value;
      FxItem.Material = this.RFxItemFormGroup.get('Material').value;
      FxItem.MaterialText = this.RFxItemFormGroup.get('MaterialText').value;
      FxItem.TotalQty = this.RFxItemFormGroup.get('TotalQty').value;
      FxItem.PerScheduleQty = this.RFxItemFormGroup.get('PerScheduleQty').value;
      FxItem.TotalSchedules = this.RFxItemFormGroup.get('TotalSchedules').value;
      FxItem.BiddingPriceLow = this.RFxItemFormGroup.get('BiddingPriceLow').value;
      if (!this.RFxItems || !this.RFxItems.length) {
        this.RFxItems = [];
      }
      this.RFxItems.push(FxItem);
      this.RFxItemDataSource = new MatTableDataSource(this.RFxItems);
      this.ClearRFxItemFormGroup();
    } else {
      this.ShowValidationErrors(this.RFxItemFormGroup);
    }
  }

  AddRFxHCToTable(): void {
    if (this.RFxHCDetailsFormGroup.valid) {
      const FxHC = new RFxHC();
      FxHC.CriteriaID = this.RFxHCDetailsFormGroup.get('CriteriaID').value;
      FxHC.Text = this.RFxHCDetailsFormGroup.get('Text').value;
      if (!this.RFxHCs || !this.RFxHCs.length) {
        this.RFxHCs = [];
      }
      this.RFxHCs.push(FxHC);
      this.RFxHCDataSource = new MatTableDataSource(this.RFxHCs);
      this.ClearRFxHCDetailsFormGroup();
    } else {
      this.ShowValidationErrors(this.RFxHCDetailsFormGroup);
    }
  }


  AddRFxICToTable(): void {
    if (this.RFxICFormGroup.valid) {
      const FxIC = new RFxIC();
      FxIC.Item = this.RFxICFormGroup.get('Item').value;
      FxIC.Criteria = this.RFxICFormGroup.get('Criteria').value;
      FxIC.Text = this.RFxICFormGroup.get('Text').value;
      if (!this.RFxICs || !this.RFxICs.length) {
        this.RFxICs = [];
      }
      this.RFxICs.push(FxIC);
      this.RFxICDataSource = new MatTableDataSource(this.RFxICs);
      this.ClearRFxICFormGroup();
    } else {
      this.ShowValidationErrors(this.RFxICFormGroup);
    }
  }

  AddRFxPartnerToTable(): void {
    if (this.RFxPartnerFormGroup.valid) {
      const FxPartner = new RFxPartner();
      FxPartner.Type = this.RFxPartnerFormGroup.get('Type').value;
      FxPartner.User = this.RFxPartnerFormGroup.get('User').value;
      if (!this.RFxPartners || !this.RFxPartners.length) {
        this.RFxPartners = [];
      }
      this.RFxPartners.push(FxPartner);
      this.RFxPartnerDataSource = new MatTableDataSource(this.RFxPartners);
      this.ClearRFxPartnerFormGroup();
    } else {
      this.ShowValidationErrors(this.RFxPartnerFormGroup);
    }
  }

  AddRFxVendorToTable(): void {
    if (this.RFxVendorFormGroup.valid) {
      const FxVendorView = new RFxVendorView();
      FxVendorView.Type = this.RFxVendorFormGroup.get('Type').value;
      FxVendorView.VendorName = this.RFxVendorFormGroup.get('VendorName').value;
      FxVendorView.GSTNumber = this.RFxVendorFormGroup.get('GSTNumber').value;
      FxVendorView.City = this.RFxVendorFormGroup.get('City').value;
      if (!this.RFxVendors || !this.RFxVendors.length) {
        this.RFxVendors = [];
      }
      if (!this.RFxVendorViews || !this.RFxVendorViews.length) {
        this.RFxVendorViews = [];
      }
      this.RFxVendorViews.push(FxVendorView);
      this.RFxVendorDataSource = new MatTableDataSource(this.RFxVendorViews);
      this.ClearRFxVendorFormGroup();
    } else {
      this.ShowValidationErrors(this.RFxVendorFormGroup);
    }
  }
  AddRFxODToTable(): void {
    if (this.RFxODFormGroup.valid) {
      const FxOD = new RFxOD();
      FxOD.Question = this.RFxODFormGroup.get('Question').value;
      FxOD.AnswerType = this.RFxODFormGroup.get('AnswerType').value;
      if (!this.RFxODs || !this.RFxODs.length) {
        this.RFxODs = [];
      }
      this.RFxODs.push(FxOD);
      this.RFxODDataSource = new MatTableDataSource(this.RFxODs);
      this.ClearRFxODFormGroup();
    } else {
      this.ShowValidationErrors(this.RFxODFormGroup);
    }
  }
  // RFxItemEnterKeyDown(): boolean {
  //   this.EvalDate.nativeElement.blur();
  //   this.AddRFxItemToTable();
  //   return true;
  // }

  // RFxHCEnterKeyDown(): boolean {
  //   this.RFxHCCity.nativeElement.blur();
  //   this.AddRFxHCToTable();
  //   return true;
  // }
  // RFxICEnterKeyDown(): boolean {
  //   this.email.nativeElement.blur();
  //   this.AddRFxICToTable();
  //   return true;
  // }
  // RFxPartnerEnterKeyDown(): boolean {
  //   this.activityText.nativeElement.blur();
  //   this.AddRFxPartnerToTable();
  //   return true;
  // }

  // keytab(elementName): void {
  //   switch (elementName) {
  //     case 'iDNumber': {
  //       this.iDNumber.nativeElement.focus();
  //       break;
  //     }
  //     case 'EvalDate': {
  //       this.EvalDate.nativeElement.focus();
  //       break;
  //     }
  //     case 'accHolderName': {
  //       this.accHolderName.nativeElement.focus();
  //       break;
  //     }
  //     case 'AccountName': {
  //       this.AccountName.nativeElement.focus();
  //       break;
  //     }
  //     case 'RFxHCName': {
  //       this.RFxHCName.nativeElement.focus();
  //       break;
  //     }
  //     case 'RFxHCID': {
  //       this.RFxHCID.nativeElement.focus();
  //       break;
  //     }
  //     case 'RFxHCCity': {
  //       this.RFxHCCity.nativeElement.focus();
  //       break;
  //     }
  //     case 'RFxICID': {
  //       this.RFxICID.nativeElement.focus();
  //       break;
  //     }
  //     case 'title': {
  //       this.title.nativeElement.focus();
  //       break;
  //     }
  //     case 'ContactNumber': {
  //       this.ContactNumber.nativeElement.focus();
  //       break;
  //     }
  //     case 'email': {
  //       this.email.nativeElement.focus();
  //       break;
  //     }
  //     case 'activityDate': {
  //       this.activityDate.nativeElement.focus();
  //       break;
  //     }
  //     case 'activityTime': {
  //       this.activityTime.nativeElement.focus();
  //       break;
  //     }
  //     case 'activityText': {
  //       this.activityText.nativeElement.focus();
  //       break;
  //     }
  //     default: {
  //       break;
  //     }
  //   }
  // }


  RemoveRFxItemFromTable(FxItem: RFxItem): void {
    const index: number = this.RFxItems.indexOf(FxItem);
    if (index > -1) {
      this.RFxItems.splice(index, 1);
    }
    this.RFxItemDataSource = new MatTableDataSource(this.RFxItems);
  }

  RemoveRFxHCFromTable(FxHC: RFxHC): void {
    const index: number = this.RFxHCs.indexOf(FxHC);
    if (index > -1) {
      this.RFxHCs.splice(index, 1);
    }
    this.RFxHCDataSource = new MatTableDataSource(this.RFxHCs);
  }


  RemoveRFxICFromTable(FxIC: RFxIC): void {
    const index: number = this.RFxICs.indexOf(FxIC);
    if (index > -1) {
      this.RFxICs.splice(index, 1);
    }
    this.RFxICDataSource = new MatTableDataSource(this.RFxICs);
  }

  RemoveRFxPartnerFromTable(FxPartner: RFxPartner): void {
    const index: number = this.RFxPartners.indexOf(FxPartner);
    if (index > -1) {
      this.RFxPartners.splice(index, 1);
    }
    this.RFxPartnerDataSource = new MatTableDataSource(this.RFxPartners);
  }

  RemoveRFxVendorFromTable(FxVendorView: RFxVendorView): void {
    const index: number = this.RFxVendorViews.indexOf(FxVendorView);
    if (index > -1) {
      this.RFxVendorViews.splice(index, 1);
    }
    this.RFxVendorDataSource = new MatTableDataSource(this.RFxVendorViews);
  }

  RemoveRFxODFromTable(FxOD: RFxOD): void {
    const index: number = this.RFxODs.indexOf(FxOD);
    if (index > -1) {
      this.RFxODs.splice(index, 1);
    }
    this.RFxODDataSource = new MatTableDataSource(this.RFxODs);
  }

  // OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
  //   const dialogConfig: MatDialogConfig = {
  //     data: {
  //       Actiontype: Actiontype,
  //       Catagory: Catagory
  //     },
  //     panelClass: 'confirmation-dialog'
  //   };
  //   const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
  //   dialogRef.afterClosed().subscribe(
  //     result => {
  //       if (result) {
  //         if (Actiontype === 'Update') {
  //           this.UpdateRFx();
  //         }
  //         else if (Actiontype === 'Approve') {
  //           // this.ApproveVendor();
  //         } else if (Actiontype === 'Reject') {
  //           // this.RejectVendor();
  //         } else if (Actiontype === 'Delete') {
  //           this.DeleteRFx();
  //         }
  //       }
  //     });
  // }

  GetRFxValues(): void {
    this.SelectedRFx.Client = this.SelectedRFxView.Client = this.RFxFormGroup.get('Client').value;
    this.SelectedRFx.Company = this.SelectedRFxView.Company = this.RFxFormGroup.get('Company').value;
    this.SelectedRFx.Plant = this.SelectedRFxView.Plant = this.RFxFormGroup.get('Plant').value;
    this.SelectedRFx.RFxType = this.SelectedRFxView.RFxType = this.RFxFormGroup.get('RFxType').value;
    this.SelectedRFx.RFxGroup = this.SelectedRFxView.RFxGroup = this.RFxFormGroup.get('RFxGroup').value;
    this.SelectedRFx.ValidityStartDate = this.SelectedRFxView.ValidityStartDate = this.RFxFormGroup.get('ValidityStartDate').value;
    this.SelectedRFx.ValidityEndDate = this.SelectedRFxView.ValidityEndDate = this.RFxFormGroup.get('ValidityEndDate').value;
    this.SelectedRFx.ResponseStartDate = this.SelectedRFxView.ResponseStartDate = this.RFxFormGroup.get('ResponseStartDate').value;
    this.SelectedRFx.ResponseEndDate = this.SelectedRFxView.ResponseEndDate = this.RFxFormGroup.get('ResponseEndDate').value;
    this.SelectedRFx.Title = this.SelectedRFxView.Title = this.RFxFormGroup.get('Title').value;
    this.SelectedRFx.Currency = this.SelectedRFxView.Currency = this.RFxFormGroup.get('Currency').value;
  }

  GetRFxSubItemValues(): void {
    this.GetRFxItemValues();
    this.GetRFxHCValues();
    this.GetRFxICValues();
    this.GetRFxPartnerValues();
  }

  GetRFxItemValues(): void {
    this.SelectedRFxView.RFxItems = [];
    // this.SelectedRFxView.bPIdentities.push(...this.RFxItems);
    this.RFxItems.forEach(x => {
      this.SelectedRFxView.RFxItems.push(x);
    });
  }

  GetRFxHCValues(): void {
    this.SelectedRFxView.RFxHCs = [];
    // this.SelectedRFxView.RFxHCs.push(...this.RFxHCs);
    this.RFxHCs.forEach(x => {
      this.SelectedRFxView.RFxHCs.push(x);
    });
  }

  GetRFxICValues(): void {
    this.SelectedRFxView.RFxICs = [];
    // this.SelectedRFxView.bPIdentities.push(...this.RFxItems);
    this.RFxICs.forEach(x => {
      this.SelectedRFxView.RFxICs.push(x);
    });
  }

  GetRFxPartnerValues(): void {
    this.SelectedRFxView.RFxPartners = [];
    // this.SelectedRFxView.RFxHCs.push(...this.RFxHCs);
    this.RFxPartners.forEach(x => {
      this.SelectedRFxView.RFxPartners.push(x);
    });
  }

  // SaveClicked(): void {
  //   if (this.RFxFormGroup.valid) {
  //     const Actiontype = 'Update';
  //     const Catagory = 'RFx';
  //     this.OpenConfirmationDialog(Actiontype, Catagory);
  //   } else {
  //     this.ShowValidationErrors(this.RFxFormGroup);
  //   }
  // }

  CreateRFx(): void {
    // this.GetRFxValues();
    // this.GetRFxSubItemValues();
    // this.SelectedRFxView.CreatedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._RFxService.CreateRFx(this.SelectedRFxView).subscribe(
      (data) => {
        this.SelectedRFx.RFxID = data;
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('RFQ Created successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        // this.GetRegisteredRFxs();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateRFx(): void {
    this.GetRFxValues();
    this.GetRFxSubItemValues();
    this.SelectedRFxView.RFxID = this.SelectedRFx.RFxID;
    // this.SelectedRFxView.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    this._RFxService.UpdateRFx(this.SelectedRFxView).subscribe(
      (data) => {
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('RFQ Updated successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteRFx(): void {
    this.GetRFxValues();
    // this.SelectedRFx.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._RFxService.DeleteRFx(this.SelectedRFx).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Vendor deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        // this.GetRegisteredRFxs();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  // GetSupportTicket(): SupportHeaderView {
  //   const SupportTicketView: SupportHeaderView = new SupportHeaderView();
  //   SupportTicketView.Client = this.SelectedRFx.Client;
  //   SupportTicketView.Company = this.SelectedRFx.Company;
  //   SupportTicketView.Type = this.SelectedRFx.Type;
  //   SupportTicketView.PatnerID = this.SelectedRFx.PatnerID;
  //   SupportTicketView.ReasonCode = '1236';
  //   SupportTicketView.Reason = 'Master Data Change';
  //   SupportTicketView.DocumentRefNo = this.SelectedRFx.PatnerID;
  //   SupportTicketView.CreatedBy = this.CurrentUserID.toString();
  //   let supportMaster = new SupportMaster();
  //   supportMaster = this.SupportMasters.find(x => x.ReasonCode === SupportTicketView.ReasonCode);
  //   if (supportMaster) {
  //     this.GetFilteredUsers(supportMaster);
  //   }
  //   console.log(this.FilteredUsers);
  //   SupportTicketView.Users = this.FilteredUsers;
  //   return SupportTicketView;
  // }

  // GetFilteredUsers(supportMaster: SupportMaster): any {
  //   if (supportMaster.Person1 && supportMaster.Person1 != null) {
  //     let user = new UserWithRole();
  //     user = this.Users.find(x => x.UserName.toLowerCase() === supportMaster.Person1.toLowerCase());
  //     this.FilteredUsers.push(user);
  //   }
  //   else if (supportMaster.Person2 && supportMaster.Person2 != null) {
  //     let user = new UserWithRole();
  //     user = this.Users.find(x => x.UserName.toLowerCase() === supportMaster.Person2.toLowerCase());
  //     this.FilteredUsers.push(user);
  //   }
  //   else if (supportMaster.Person3 && supportMaster.Person3 != null) {
  //     let user = new UserWithRole();
  //     user = this.Users.find(x => x.UserName.toLowerCase() === supportMaster.Person3.toLowerCase());
  //     this.FilteredUsers.push(user);
  //   }
  // }
  // CreateSupportTicket(): void {
  //   this.IsProgressBarVisibile = true;
  //   const SupportTicketView = this.GetSupportTicket();
  //   this._supportDeskService.CreateSupportTicket(SupportTicketView).subscribe(
  //     (data) => {
  //       this.ResetControl();
  //       this.notificationSnackBarComponent.openSnackBar('RFx details updated successfully', SnackBarStatus.success);
  //       this.IsProgressBarVisibile = false;
  //       this.GetRFxByRFxID();
  //     },
  //     (err) => {
  //       this.ShowErrorNotificationSnackBar(err);
  //     }
  //   );
  // }
  // ShowErrorNotificationSnackBar(err: any): void {
  //   console.error(err);
  //   this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
  //   this.IsProgressBarVisibile = false;
  // }
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

  // ApproveClicked(): void {
  //   if (this.RFxFormGroup.valid) {
  //     this.GetRFxValues();
  //     this.GetRFxSubItemValues();
  //     this.SetActionToOpenConfirmation('Approve');
  //   } else {
  //     this.ShowValidationErrors(this.RFxFormGroup);
  //   }
  // }
  // RejectClicked(): void {
  //   if (this.RFxFormGroup.valid) {
  //     this.GetRFxValues();
  //     this.GetRFxSubItemValues();
  //     this.SetActionToOpenConfirmation('Reject');
  //   } else {
  //     this.ShowValidationErrors(this.RFxFormGroup);
  //   }
  // }

  // SetActionToOpenConfirmation(actiontype: string): void {
  //   if (this.SelectedRFxID) {
  //     const Actiontype = actiontype;
  //     const Catagory = 'Vendor';
  //     this.OpenConfirmationDialog(Actiontype, Catagory);
  //   }
  // }

  // DeleteClicked(): void {
  //   // if (this.RFxFormGroup.valid) {
  //   if (this.SelectedRFxID) {
  //     const Actiontype = 'Delete';
  //     const Catagory = 'Vendor';
  //     this.OpenConfirmationDialog(Actiontype, Catagory);
  //   }
  //   // } else {
  //   //   this.ShowValidationErrors(this.RFxFormGroup);
  //   // }
  // }

  // handleFileRFxItem(evt): void {
  //   if (evt.target.files && evt.target.files.length > 0) {
  //     this.fileToUpload = evt.target.files[0];
  //     this.fileToUploadList.push(this.fileToUpload);
  //   }
  // }

  // numberOnly(event): boolean {
  //   const charCode = (event.which) ? event.which : event.keyCode;
  //   if (charCode === 8 || charCode === 9 || charCode === 13 || charCode === 46
  //     || charCode === 37 || charCode === 39 || charCode === 123 || charCode === 190) {
  //     return true;
  //   }
  //   else if (charCode < 48 || charCode > 57) {
  //     return false;
  //   }
  //   return true;
  // }
  // // GetAttachment(fileName: string, file?: File): void {
  // //   if (file && file.size) {
  // //     const blob = new Blob([file], { type: file.type });
  // //     this.OpenAttachmentDialog(fileName, blob);
  // //   } else {
  // //     this.IsProgressBarVisibile = true;
  // //     this._RFxService.DowloandRFxImage(fileName).subscribe(
  // //       data => {
  // //         if (data) {
  // //           let fileType = 'image/jpg';
  // //           fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
  // //             fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
  // //               fileName.toLowerCase().includes('.png') ? 'image/png' :
  // //                 fileName.toLowerCase().includes('.gif') ? 'image/gif' : '';
  // //           const blob = new Blob([data], { type: fileType });
  // //           this.OpenAttachmentDialog(fileName, blob);
  // //         }
  // //         this.IsProgressBarVisibile = false;
  // //       },
  // //       error => {
  // //         console.error(error);
  // //         this.IsProgressBarVisibile = false;
  // //       }
  // //     );
  // //   }
  // // }
  // // OpenAttachmentDialog(FileName: string, blob: Blob): void {
  // //   const attachmentDetails: AttachmentDetails = {
  // //     FileName: FileName,
  // //     blob: blob
  // //   };
  // //   const dialogConfig: MatDialogConfig = {
  // //     data: attachmentDetails,
  // //     panelClass: 'attachment-dialog'
  // //   };
  // //   const dialogRef = this.dialog.open(AttachmentDialogComponent, dialogConfig);
  // //   dialogRef.afterClosed().subscribe(result => {
  // //     if (result) {
  // //     }
  // //   });
  // // }


  // isAllSelected() {
  //   const numSelected = this.selection.selected.length;
  //   const numRows = this.CriteriaDataSource.data.length;
  //   return numSelected === numRows;
  // }

  // /** Selects all rows if they are not all selected; otherwise clear selection. */
  // masterToggle() {
  //   this.isAllSelected() ?
  //     this.selection.clear() :
  //     this.CriteriaDataSource.data.forEach(row => this.selection.select(row));
  // }

  // /** The label for the checkbox on the passed row */
  // checkboxLabel(row?: CriteriaData): string {
  //   if (!row) {
  //     return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
  //   }
  //   return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.Criteria + 1}`;
  // }

  // select_dialog(): void {
  //   const dialogRef = this.Dialog.open(SelectdialogComponent, {
  //     width: '1000px',
  //     height: '550px',
  //   });
  // }

}

export interface CriteriaData {
  Criteria: any;
  Description: any;
}
export interface ItemData {
  Item: any;
  Material: any;
  MaterialText: any;
  Totalqty: any;
  Persche: any;
  Number: any;
  Bidding: any;
}
export interface RatingData {
  Criteria: any;
  Description: any;
}
export interface PartnerData {
  Type: any;
  Usertable: any;
}
export interface VendorData {
  Type: any;
  Vendor: any;
  GST: any;
  City: any;
}
export interface OtherData {
  Question: any;
  Answer: any;
}
export interface AttachedData {
  Document: any;
  Remarks: any;
}
const EvaluationData: CriteriaData[] = [
  {
    Criteria: '', Description: ''
  }, {
    Criteria: '', Description: ''
  }
]
const ItemsDetails: ItemData[] = [
  {
    Item: '', Material: '', MaterialText: '', Totalqty: '', Persche: '', Number: '', Bidding: ''
  },
  {
    Item: '', Material: '', MaterialText: '', Totalqty: '', Persche: '', Number: '', Bidding: ''
  }
]
const RatingDetails: RatingData[] = [
  {
    Criteria: '', Description: ''
  }, {
    Criteria: '', Description: ''
  }
]
const PartnerDetails: PartnerData[] = [
  {
    Type: '', Usertable: ''
  }, {
    Type: '', Usertable: ''
  }
]
const VendorDetails: VendorData[] = [
  {
    Type: '', Vendor: '', GST: '', City: ''
  },
  {
    Type: '', Vendor: '', GST: '', City: ''
  }
]
const OtherDetails: OtherData[] = [
  {
    Question: '', Answer: ''
  },
  {
    Question: '', Answer: ''
  }
]
const AttachedDetails: AttachedData[] = [
  {
    Document: '', Remarks: ''
  },
  {
    Document: '', Remarks: ''
  }
]
