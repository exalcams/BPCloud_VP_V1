import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MenuApp, AuthenticationDetails, AppUsage, UserWithRole } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { BPCFact, BPCFactView, BPCKRA, BPCFactBank, BPCFactContactPerson, BPCAIACT, BPCCertificate } from 'app/models/fact';
import { MatTableDataSource, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FuseConfigService } from '@fuse/services/config.service';
import { MasterService } from 'app/services/master.service';
import { FactService } from 'app/services/fact.service';
import { VendorMasterService } from 'app/services/vendor-master.service';
import { Router } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { CBPLocation } from 'app/models/vendor-master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { SupportHeaderView, SupportMaster, SupportHeader } from 'app/models/support-desk';
import { SupportDeskService } from 'app/services/support-desk.service';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-fact',
  templateUrl: './fact.component.html',
  styleUrls: ['./fact.component.scss']
})
export class FactComponent implements OnInit {

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
  FactFormGroup: FormGroup;
  KRAFormGroup: FormGroup;
  bankDetailsFormGroup: FormGroup;
  ContactPersonFormGroup: FormGroup;
  AIACTFormGroup: FormGroup;
  CertificateFormGroup: FormGroup;
  searchText = '';
  AllFacts: BPCFact[] = [];
  selectID: string;
  SelectedBPCFact: BPCFact;
  SelectedBPCFactView: BPCFactView;
  KRAsByPartnerID: BPCKRA[] = [];
  BanksByPartnerID: BPCFactBank[] = [];
  ContactPersonsByPartnerID: BPCFactContactPerson[] = [];
  AIACTsByPartnerID: BPCAIACT[] = [];
  CertificatesByPartnerID: BPCCertificate[] = [];
  KRADisplayedColumns: string[] = [
    'KRA',
    'KRAText',
    'KRAValue',
    'EvalDate',
    // 'Action'
  ];
  bankDetailsDisplayedColumns: string[] = [
    'AccountNumber',
    // 'Name',
    'AccountName',
    'BankName',
    'BankID',
    // 'City',
    // 'Action'
  ];

  ContactPersonDisplayedColumns: string[] = [
    'Name',
    'ContactPersonID',
    'ContactNumber',
    'Email',
    // 'Action'
  ];
  AIACTDisplayedColumns: string[] = [
    'SeqNo',
    'Date',
    'Time',
    'ActionText',
    // 'Action'
  ];
  CertificateDisplayedColumns: string[] = [
    'CertificateType',
    'CertificateName',
    'Validity',
    'Attachment',
    // 'Action'
  ];
  KRADataSource = new MatTableDataSource<BPCKRA>();
  bankDetailsDataSource = new MatTableDataSource<BPCFactBank>();
  ContactPersonDataSource = new MatTableDataSource<BPCFactContactPerson>();
  AIACTDataSource = new MatTableDataSource<BPCAIACT>();
  CertificateDataSource = new MatTableDataSource<BPCCertificate>();
  selection = new SelectionModel<any>(true, []);
  @ViewChild('iDNumber') iDNumber: ElementRef;
  @ViewChild('EvalDate') EvalDate: ElementRef;
  @ViewChild('accHolderName') accHolderName: ElementRef;
  @ViewChild('AccountName') AccountName: ElementRef;
  @ViewChild('bankName') bankName: ElementRef;
  @ViewChild('BankID') BankID: ElementRef;
  @ViewChild('bankCity') bankCity: ElementRef;
  @ViewChild('ContactPersonID') ContactPersonID: ElementRef;
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
    private _FactService: FactService,
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
    this.SelectedBPCFact = new BPCFact();
    this.SelectedBPCFactView = new BPCFactView();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.IsDisplayPhone2 = false;
    this.IsDisplayEmail2 = false;
  }

  ngOnInit(): void {
    const retrievedObject = this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.CurrentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.MenuItems.indexOf('BuyerFact') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
      this.CreateAppUsage();
      this.InitializeFactFormGroup();
      this.InitializeKRAFormGroup();
      this.InitializeBankDetailsFormGroup();
      this.InitializeContactPersonFormGroup();
      this.InitializeAIACTFormGroup();
      this.GetFactByPartnerIDAndType();
      this.GetSupportMasters();
      this.GetUsers();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }
  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.CurrentUserID;
    appUsage.AppName = 'My details';
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
  InitializeFactFormGroup(): void {
    this.FactFormGroup = this._formBuilder.group({
      Client: ['', Validators.required],
      Company: ['', Validators.required],
      LegalName: ['', Validators.required],
      AddressLine1: ['', Validators.required],
      AddressLine2: ['', Validators.required],
      City: ['', Validators.required],
      State: ['', Validators.required],
      Country: ['', Validators.required],
      PinCode: ['', Validators.required],
      Type: [''],
      Phone1: ['', [Validators.required, Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]],
      Phone2: ['', [Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]],
      Email1: ['', [Validators.required, Validators.email]],
      Email2: ['', [Validators.email]],
    });
    this.FactFormGroup.get('City').disable();
    this.FactFormGroup.get('State').disable();
    this.FactFormGroup.get('Country').disable();
  }

  InitializeKRAFormGroup(): void {
    this.KRAFormGroup = this._formBuilder.group({
      Type: ['', Validators.required],
      KRAText: ['', Validators.required],
      EvalDate: ['', Validators.required],
    });
  }

  InitializeBankDetailsFormGroup(): void {
    this.bankDetailsFormGroup = this._formBuilder.group({
      AccountNumber: ['', Validators.required],
      AccountName: ['', Validators.required],
      BankName: ['', Validators.required],
      BankID: ['', Validators.required],
    });
  }

  InitializeContactPersonFormGroup(): void {
    this.ContactPersonFormGroup = this._formBuilder.group({
      Name: ['', Validators.required],
      ContactPersonID: ['', Validators.required],
      ContactNumber: ['', [Validators.required, Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]],
      Email: ['', [Validators.required, Validators.email]],
    });
  }

  InitializeAIACTFormGroup(): void {
    this.AIACTFormGroup = this._formBuilder.group({
      SeqNo: ['', Validators.required],
      Date: ['', Validators.required],
      Time: ['', Validators.required],
      ActionText: ['', Validators.required],
    });
  }
  InitializeCertificateFormGroup(): void {
    this.CertificateFormGroup = this._formBuilder.group({
      CertificateType: ['', Validators.required],
      CertificateName: ['', Validators.required],
      Validity: ['', Validators.required],
      Attachment: ['', Validators.required],
    });
  }

  ResetControl(): void {
    this.SelectedBPCFact = new BPCFact();
    this.SelectedBPCFactView = new BPCFactView();
    this.selectID = '';
    this.FactFormGroup.reset();
    Object.keys(this.FactFormGroup.controls).forEach(key => {
      this.FactFormGroup.get(key).enable();
      this.FactFormGroup.get(key).markAsUntouched();
    });
    this.IsDisplayPhone2 = false;
    this.IsDisplayEmail2 = false;
    // this.fileToUpload = null;
    this.ClearKRAFormGroup();
    this.ClearBankDetailsFormGroup();
    this.ClearContactPersonFormGroup();
    this.ClearAIACTFormGroup();
    this.ClearKRADataSource();
    this.ClearBankDetailsDataSource();
    this.ClearContactPersonDataSource();
    this.ClearAIACTDataSource();
  }

  ClearKRAFormGroup(): void {
    this.KRAFormGroup.reset();
    Object.keys(this.KRAFormGroup.controls).forEach(key => {
      this.KRAFormGroup.get(key).markAsUntouched();
    });
  }
  ClearBankDetailsFormGroup(): void {
    this.bankDetailsFormGroup.reset();
    Object.keys(this.bankDetailsFormGroup.controls).forEach(key => {
      this.bankDetailsFormGroup.get(key).markAsUntouched();
    });
  }
  ClearContactPersonFormGroup(): void {
    this.ContactPersonFormGroup.reset();
    Object.keys(this.ContactPersonFormGroup.controls).forEach(key => {
      this.ContactPersonFormGroup.get(key).markAsUntouched();
    });
  }
  ClearAIACTFormGroup(): void {
    this.AIACTFormGroup.reset();
    Object.keys(this.AIACTFormGroup.controls).forEach(key => {
      this.AIACTFormGroup.get(key).markAsUntouched();
    });
  }
  ClearCertificateFormGroup(): void {
    this.CertificateFormGroup.reset();
    Object.keys(this.CertificateFormGroup.controls).forEach(key => {
      this.CertificateFormGroup.get(key).markAsUntouched();
    });
  }
  ClearKRADataSource(): void {
    this.KRAsByPartnerID = [];
    this.KRADataSource = new MatTableDataSource(this.KRAsByPartnerID);
  }
  ClearBankDetailsDataSource(): void {
    this.BanksByPartnerID = [];
    this.bankDetailsDataSource = new MatTableDataSource(this.BanksByPartnerID);
  }
  ClearContactPersonDataSource(): void {
    this.ContactPersonsByPartnerID = [];
    this.ContactPersonDataSource = new MatTableDataSource(this.ContactPersonsByPartnerID);
  }
  ClearAIACTDataSource(): void {
    this.AIACTsByPartnerID = [];
    this.AIACTDataSource = new MatTableDataSource(this.AIACTsByPartnerID);
  }

  GetFactByPartnerIDAndType(): void {
    this._FactService.GetFactByPartnerIDAndType(this.currentUserName, 'B').subscribe(
      (data) => {
        const fact = data as BPCFact[];
        if (fact[0]) {
          this.loadSelectedBPCFact(fact[0]);
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
            this.FactFormGroup.get('City').patchValue(loc.District);
            this.FactFormGroup.get('State').patchValue(loc.State);
            this.FactFormGroup.get('Country').patchValue(loc.Country);
          }
        },
        (err) => {
          console.error(err);
        }
      );
    }
  }

  DisplayPhone2(): void {
    this.FactFormGroup.get('Phone2').setValidators([Validators.required, Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]);
    this.FactFormGroup.get('Phone2').updateValueAndValidity();
    this.IsDisplayPhone2 = true;
  }
  DisplayEmail2(): void {
    this.FactFormGroup.get('Email2').setValidators([Validators.required, Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]);
    this.FactFormGroup.get('Email2').updateValueAndValidity();
    this.IsDisplayEmail2 = true;
  }


  loadSelectedBPCFact(selectedBPCFact: BPCFact): void {
    this.ResetControl();
    this.SelectedBPCFact = selectedBPCFact;
    this.selectID = selectedBPCFact.PatnerID;
    // this.EnableAllFactTypes();
    this.SetBPCFactValues();
    this.GetBPCFactSubItems();
  }
  typeSelected(event): void {
    const selectedType = event.value;
    if (event.value) {
      this.SelectedBPCFact.Type = event.value;
    }
  }
  applyFilter(filterValue: string): void {
    this.KRADataSource.filter = filterValue.trim().toLowerCase();
  }

  // EnableAllFactTypes(): void {
  //   Object.keys(this.FactFormGroup.controls).forEach(key => {
  //     this.FactFormGroup.get(key).enable();
  //   });
  // }
  SetBPCFactValues(): void {
    this.FactFormGroup.get('Client').patchValue(this.SelectedBPCFact.Client);
    this.FactFormGroup.get('Type').patchValue(this.SelectedBPCFact.Type);
    this.FactFormGroup.get('Company').patchValue(this.SelectedBPCFact.Company);
    this.FactFormGroup.get('LegalName').patchValue(this.SelectedBPCFact.LegalName);
    this.FactFormGroup.get('AddressLine1').patchValue(this.SelectedBPCFact.AddressLine1);
    this.FactFormGroup.get('AddressLine2').patchValue(this.SelectedBPCFact.AddressLine2);
    this.FactFormGroup.get('PinCode').patchValue(this.SelectedBPCFact.PinCode);
    this.FactFormGroup.get('City').patchValue(this.SelectedBPCFact.City);
    this.FactFormGroup.get('State').patchValue(this.SelectedBPCFact.State);
    this.FactFormGroup.get('Country').patchValue(this.SelectedBPCFact.Country);
    this.FactFormGroup.get('Phone1').patchValue(this.SelectedBPCFact.Phone1);
    this.FactFormGroup.get('Phone2').patchValue(this.SelectedBPCFact.Phone2);
    this.FactFormGroup.get('Email1').patchValue(this.SelectedBPCFact.Email1);
    this.FactFormGroup.get('Email2').patchValue(this.SelectedBPCFact.Email2);
    // this.ContactPersonFormGroup.get('Email').validator({}as AbstractControl);
  }

  GetBPCFactSubItems(): void {
    this.GetKRAsByPartnerID();
    this.GetBanksByPartnerID();
    this.GetContactPersonsByPartnerID();
    this.GetAIACTsByPartnerID();
    this.GetCertificatesByPartnerID();
  }

  GetKRAsByPartnerID(): void {
    this.IsProgressBarVisibile = true;
    this._FactService.GetKRAsByPartnerID(this.SelectedBPCFact.PatnerID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.KRAsByPartnerID = data as BPCKRA[];
        this.KRADataSource = new MatTableDataSource(this.KRAsByPartnerID);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetBanksByPartnerID(): void {
    this.IsProgressBarVisibile = true;
    this._FactService.GetBanksByPartnerID(this.SelectedBPCFact.PatnerID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.BanksByPartnerID = data as BPCFactBank[];
        this.bankDetailsDataSource = new MatTableDataSource(this.BanksByPartnerID);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetContactPersonsByPartnerID(): void {
    this.IsProgressBarVisibile = true;
    this._FactService.GetContactPersonsByPartnerID(this.SelectedBPCFact.PatnerID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.ContactPersonsByPartnerID = data as BPCFactContactPerson[];
        this.ContactPersonDataSource = new MatTableDataSource(this.ContactPersonsByPartnerID);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetAIACTsByPartnerID(): void {
    this.IsProgressBarVisibile = true;
    this._FactService.GetAIACTsByPartnerID(this.SelectedBPCFact.PatnerID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.AIACTsByPartnerID = data as BPCAIACT[];
        this.AIACTDataSource = new MatTableDataSource(this.AIACTsByPartnerID);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }
  GetCertificatesByPartnerID(): void {
    this.IsProgressBarVisibile = true;
    this._FactService.GetCertificatesByPartnerID(this.SelectedBPCFact.PatnerID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.CertificatesByPartnerID = data as BPCCertificate[];
        this.CertificateDataSource = new MatTableDataSource(this.CertificatesByPartnerID);
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  AddKRAToTable(): void {
    if (this.KRAFormGroup.valid) {
      const bPCKRA = new BPCKRA();
      bPCKRA.Type = this.KRAFormGroup.get('Type').value;
      bPCKRA.KRAText = this.KRAFormGroup.get('KRAText').value;
      bPCKRA.EvalDate = this.KRAFormGroup.get('EvalDate').value;
      if (!this.KRAsByPartnerID || !this.KRAsByPartnerID.length) {
        this.KRAsByPartnerID = [];
      }
      this.KRAsByPartnerID.push(bPCKRA);
      this.KRADataSource = new MatTableDataSource(this.KRAsByPartnerID);
      this.ClearKRAFormGroup();
    } else {
      this.ShowValidationErrors(this.KRAFormGroup);
    }
  }

  AddBankToTable(): void {
    if (this.bankDetailsFormGroup.valid) {
      const bPCFactBank = new BPCFactBank();
      bPCFactBank.AccountNo = this.bankDetailsFormGroup.get('AccountNumber').value;
      bPCFactBank.Name = this.bankDetailsFormGroup.get('AccountName').value;
      bPCFactBank.BankName = this.bankDetailsFormGroup.get('BankName').value;
      bPCFactBank.BankID = this.bankDetailsFormGroup.get('BankID').value;
      if (!this.BanksByPartnerID || !this.BanksByPartnerID.length) {
        this.BanksByPartnerID = [];
      }
      this.BanksByPartnerID.push(bPCFactBank);
      this.bankDetailsDataSource = new MatTableDataSource(this.BanksByPartnerID);
      this.ClearBankDetailsFormGroup();
    } else {
      this.ShowValidationErrors(this.bankDetailsFormGroup);
    }
  }


  AddContactPersonToTable(): void {
    if (this.ContactPersonFormGroup.valid) {
      const bPCFactContactPerson = new BPCFactContactPerson();
      bPCFactContactPerson.Name = this.ContactPersonFormGroup.get('Name').value;
      bPCFactContactPerson.ContactPersonID = this.ContactPersonFormGroup.get('ContactPersonID').value;
      bPCFactContactPerson.ContactNumber = this.ContactPersonFormGroup.get('ContactNumber').value;
      bPCFactContactPerson.Email = this.ContactPersonFormGroup.get('Email').value;
      if (!this.ContactPersonsByPartnerID || !this.ContactPersonsByPartnerID.length) {
        this.ContactPersonsByPartnerID = [];
      }
      this.ContactPersonsByPartnerID.push(bPCFactContactPerson);
      this.ContactPersonDataSource = new MatTableDataSource(this.ContactPersonsByPartnerID);
      this.ClearContactPersonFormGroup();
    } else {
      this.ShowValidationErrors(this.ContactPersonFormGroup);
    }
  }

  AddAIACTToTable(): void {
    if (this.AIACTFormGroup.valid) {
      const bPCAIACT = new BPCAIACT();
      bPCAIACT.SeqNo = this.AIACTFormGroup.get('SeqNo').value;
      bPCAIACT.Date = this.AIACTFormGroup.get('Date').value;
      bPCAIACT.Time = this.AIACTFormGroup.get('Time').value;
      bPCAIACT.ActionText = this.AIACTFormGroup.get('ActionText').value;
      if (!this.AIACTsByPartnerID || !this.AIACTsByPartnerID.length) {
        this.AIACTsByPartnerID = [];
      }
      this.AIACTsByPartnerID.push(bPCAIACT);
      this.AIACTDataSource = new MatTableDataSource(this.AIACTsByPartnerID);
      this.ClearAIACTFormGroup();
    } else {
      this.ShowValidationErrors(this.AIACTFormGroup);
    }
  }

  KRAEnterKeyDown(): boolean {
    this.EvalDate.nativeElement.blur();
    this.AddKRAToTable();
    return true;
  }

  BankEnterKeyDown(): boolean {
    this.bankCity.nativeElement.blur();
    this.AddBankToTable();
    return true;
  }
  ContactPersonEnterKeyDown(): boolean {
    this.email.nativeElement.blur();
    this.AddContactPersonToTable();
    return true;
  }
  AIACTEnterKeyDown(): boolean {
    this.activityText.nativeElement.blur();
    this.AddAIACTToTable();
    return true;
  }

  keytab(elementName): void {
    switch (elementName) {
      case 'iDNumber': {
        this.iDNumber.nativeElement.focus();
        break;
      }
      case 'EvalDate': {
        this.EvalDate.nativeElement.focus();
        break;
      }
      case 'accHolderName': {
        this.accHolderName.nativeElement.focus();
        break;
      }
      case 'AccountName': {
        this.AccountName.nativeElement.focus();
        break;
      }
      case 'bankName': {
        this.bankName.nativeElement.focus();
        break;
      }
      case 'BankID': {
        this.BankID.nativeElement.focus();
        break;
      }
      case 'bankCity': {
        this.bankCity.nativeElement.focus();
        break;
      }
      case 'ContactPersonID': {
        this.ContactPersonID.nativeElement.focus();
        break;
      }
      case 'title': {
        this.title.nativeElement.focus();
        break;
      }
      case 'ContactNumber': {
        this.ContactNumber.nativeElement.focus();
        break;
      }
      case 'email': {
        this.email.nativeElement.focus();
        break;
      }
      case 'activityDate': {
        this.activityDate.nativeElement.focus();
        break;
      }
      case 'activityTime': {
        this.activityTime.nativeElement.focus();
        break;
      }
      case 'activityText': {
        this.activityText.nativeElement.focus();
        break;
      }
      default: {
        break;
      }
    }
  }


  RemoveKRAFromTable(bPCKRA: BPCKRA): void {
    const index: number = this.KRAsByPartnerID.indexOf(bPCKRA);
    if (index > -1) {
      this.KRAsByPartnerID.splice(index, 1);
    }
    this.KRADataSource = new MatTableDataSource(this.KRAsByPartnerID);
  }

  RemoveBankFromTable(bPCFactBank: BPCFactBank): void {
    const index: number = this.BanksByPartnerID.indexOf(bPCFactBank);
    if (index > -1) {
      this.BanksByPartnerID.splice(index, 1);
    }
    this.bankDetailsDataSource = new MatTableDataSource(this.BanksByPartnerID);
  }


  RemoveContactPersonFromTable(bPCFactContactPerson: BPCFactContactPerson): void {
    const index: number = this.ContactPersonsByPartnerID.indexOf(bPCFactContactPerson);
    if (index > -1) {
      this.ContactPersonsByPartnerID.splice(index, 1);
    }
    this.ContactPersonDataSource = new MatTableDataSource(this.ContactPersonsByPartnerID);
  }

  RemoveAIACTFromTable(bPCAIACT: BPCAIACT): void {
    const index: number = this.AIACTsByPartnerID.indexOf(bPCAIACT);
    if (index > -1) {
      this.AIACTsByPartnerID.splice(index, 1);
    }
    this.AIACTDataSource = new MatTableDataSource(this.AIACTsByPartnerID);
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
          if (Actiontype === 'Update') {
            this.UpdateFact();
          }
          else if (Actiontype === 'Approve') {
            // this.ApproveVendor();
          } else if (Actiontype === 'Reject') {
            // this.RejectVendor();
          } else if (Actiontype === 'Delete') {
            this.DeleteFact();
          }
        }
      });
  }

  GetBPCFactValues(): void {
    this.SelectedBPCFact.Client = this.SelectedBPCFactView.Client = this.FactFormGroup.get('Client').value;
    this.SelectedBPCFact.Type = this.SelectedBPCFactView.Type = this.FactFormGroup.get('Type').value;
    this.SelectedBPCFact.Company = this.SelectedBPCFactView.Company = this.FactFormGroup.get('Company').value;
    this.SelectedBPCFact.LegalName = this.SelectedBPCFactView.LegalName = this.FactFormGroup.get('LegalName').value;
    this.SelectedBPCFact.AddressLine1 = this.SelectedBPCFactView.AddressLine1 = this.FactFormGroup.get('AddressLine1').value;
    this.SelectedBPCFact.AddressLine2 = this.SelectedBPCFactView.AddressLine2 = this.FactFormGroup.get('AddressLine2').value;
    this.SelectedBPCFact.City = this.SelectedBPCFactView.City = this.FactFormGroup.get('City').value;
    this.SelectedBPCFact.State = this.SelectedBPCFactView.State = this.FactFormGroup.get('State').value;
    this.SelectedBPCFact.Country = this.SelectedBPCFactView.Country = this.FactFormGroup.get('Country').value;
    this.SelectedBPCFact.PinCode = this.SelectedBPCFactView.PinCode = this.FactFormGroup.get('PinCode').value;
    this.SelectedBPCFact.Phone1 = this.SelectedBPCFactView.Phone1 = this.FactFormGroup.get('Phone1').value;
    this.SelectedBPCFact.Phone2 = this.SelectedBPCFactView.Phone2 = this.FactFormGroup.get('Phone2').value;
    this.SelectedBPCFact.Email1 = this.SelectedBPCFactView.Email1 = this.FactFormGroup.get('Email1').value;
    this.SelectedBPCFact.Email2 = this.SelectedBPCFactView.Email2 = this.FactFormGroup.get('Email2').value;
    // this.SelectedBPCFact.VendorCode = this.SelectedBPCFactView.VendorCode = this.FactFormGroup.get('VendorCode').value;
    // this.SelectedBPCFact.ParentVendor = this.SelectedBPCFactView.ParentVendor = this.FactFormGroup.get('ParentVendor').value;
    // this.SelectedBPCFact.Status = this.SelectedBPCFactView.Status = this.FactFormGroup.get('Status').value;

  }

  GetBPCFactSubItemValues(): void {
    this.GetBPCKRAValues();
    this.GetBPCFactBankValues();
    this.GetBPCFactContactPersonValues();
    this.GetBPCAIACTValues();
  }

  GetBPCKRAValues(): void {
    this.SelectedBPCFactView.BPCKRAs = [];
    // this.SelectedBPCFactView.bPIdentities.push(...this.KRAsByPartnerID);
    this.KRAsByPartnerID.forEach(x => {
      this.SelectedBPCFactView.BPCKRAs.push(x);
    });
  }

  GetBPCFactBankValues(): void {
    this.SelectedBPCFactView.BPCFactBanks = [];
    // this.SelectedBPCFactView.BPCFactBanks.push(...this.BanksByPartnerID);
    this.BanksByPartnerID.forEach(x => {
      this.SelectedBPCFactView.BPCFactBanks.push(x);
    });
  }

  GetBPCFactContactPersonValues(): void {
    this.SelectedBPCFactView.BPCFactContactPersons = [];
    // this.SelectedBPCFactView.bPIdentities.push(...this.KRAsByPartnerID);
    this.ContactPersonsByPartnerID.forEach(x => {
      this.SelectedBPCFactView.BPCFactContactPersons.push(x);
    });
  }

  GetBPCAIACTValues(): void {
    this.SelectedBPCFactView.BPCAIACTs = [];
    // this.SelectedBPCFactView.BPCFactBanks.push(...this.BanksByPartnerID);
    this.AIACTsByPartnerID.forEach(x => {
      this.SelectedBPCFactView.BPCAIACTs.push(x);
    });
  }

  SaveClicked(): void {
    if (this.FactFormGroup.valid) {
      const Actiontype = 'Update';
      const Catagory = 'Fact';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    } else {
      this.ShowValidationErrors(this.FactFormGroup);
    }
  }

  CreateFact(): void {
    // this.GetBPCFactValues();
    // this.GetBPCFactSubItemValues();
    // this.SelectedBPCFactView.CreatedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._FactService.CreateFact(this.SelectedBPCFactView).subscribe(
      (data) => {
        this.SelectedBPCFact.PatnerID = data;
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Vendor registered successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        // this.GetRegisteredFacts();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );

  }

  UpdateFact(): void {
    this.GetBPCFactValues();
    this.GetBPCFactSubItemValues();
    this.SelectedBPCFactView.PatnerID = this.SelectedBPCFact.PatnerID;
    this.SelectedBPCFactView.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    this._FactService.UpdateFact(this.SelectedBPCFactView).subscribe(
      (data) => {
        this.CreateSupportTicket();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteFact(): void {
    this.GetBPCFactValues();
    // this.SelectedBPCFact.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._FactService.DeleteFact(this.SelectedBPCFact).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Vendor deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        // this.GetRegisteredFacts();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  GetSupportTicket(): SupportHeaderView {
    const SupportTicketView: SupportHeaderView = new SupportHeaderView();
    SupportTicketView.Client = this.SelectedBPCFact.Client;
    SupportTicketView.Company = this.SelectedBPCFact.Company;
    SupportTicketView.Type = this.SelectedBPCFact.Type;
    SupportTicketView.PatnerID = this.SelectedBPCFact.PatnerID;
    SupportTicketView.ReasonCode = '1236';
    SupportTicketView.Reason = 'Master Data Change';
    SupportTicketView.DocumentRefNo = this.SelectedBPCFact.PatnerID;
    SupportTicketView.CreatedBy = this.CurrentUserID.toString();
    // let supportMaster = new SupportMaster();
    // supportMaster = this.SupportMasters.find(x => x.ReasonCode === SupportTicketView.ReasonCode);
    // if (supportMaster) {
    //   this.GetFilteredUsers(supportMaster);
    // }
    // console.log(this.FilteredUsers);
    // SupportTicketView.Users = this.FilteredUsers;
    return SupportTicketView;
  }

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
  CreateSupportTicket(): void {
    this.IsProgressBarVisibile = true;
    const SupportTicketView = this.GetSupportTicket();
    this._supportDeskService.CreateSupportTicket(SupportTicketView).subscribe(
      (data) => {
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Fact details updated successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetFactByPartnerIDAndType();
      },
      (err) => {
        this.ShowErrorNotificationSnackBar(err);
      }
    );
  }
  ShowErrorNotificationSnackBar(err: any): void {
    console.error(err);
    this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    this.IsProgressBarVisibile = false;
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

  ApproveClicked(): void {
    if (this.FactFormGroup.valid) {
      this.GetBPCFactValues();
      this.GetBPCFactSubItemValues();
      this.SetActionToOpenConfirmation('Approve');
    } else {
      this.ShowValidationErrors(this.FactFormGroup);
    }
  }
  RejectClicked(): void {
    if (this.FactFormGroup.valid) {
      this.GetBPCFactValues();
      this.GetBPCFactSubItemValues();
      this.SetActionToOpenConfirmation('Reject');
    } else {
      this.ShowValidationErrors(this.FactFormGroup);
    }
  }

  SetActionToOpenConfirmation(actiontype: string): void {
    if (this.SelectedBPCFact.PatnerID) {
      const Actiontype = actiontype;
      const Catagory = 'Vendor';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    }
  }

  DeleteClicked(): void {
    // if (this.FactFormGroup.valid) {
    if (this.SelectedBPCFact.PatnerID) {
      const Actiontype = 'Delete';
      const Catagory = 'Vendor';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    }
    // } else {
    //   this.ShowValidationErrors(this.FactFormGroup);
    // }
  }

  handleFileBPCKRA(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.fileToUpload = evt.target.files[0];
      this.fileToUploadList.push(this.fileToUpload);
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 8 || charCode === 9 || charCode === 13 || charCode === 46
      || charCode === 37 || charCode === 39 || charCode === 123 || charCode === 190) {
      return true;
    }
    else if (charCode < 48 || charCode > 57) {
      return false;
    }
    return true;
  }
  // GetAttachment(fileName: string, file?: File): void {
  //   if (file && file.size) {
  //     const blob = new Blob([file], { type: file.type });
  //     this.OpenAttachmentDialog(fileName, blob);
  //   } else {
  //     this.IsProgressBarVisibile = true;
  //     this._FactService.DowloandBPCFactImage(fileName).subscribe(
  //       data => {
  //         if (data) {
  //           let fileType = 'image/jpg';
  //           fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
  //             fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
  //               fileName.toLowerCase().includes('.png') ? 'image/png' :
  //                 fileName.toLowerCase().includes('.gif') ? 'image/gif' : '';
  //           const blob = new Blob([data], { type: fileType });
  //           this.OpenAttachmentDialog(fileName, blob);
  //         }
  //         this.IsProgressBarVisibile = false;
  //       },
  //       error => {
  //         console.error(error);
  //         this.IsProgressBarVisibile = false;
  //       }
  //     );
  //   }
  // }
  // OpenAttachmentDialog(FileName: string, blob: Blob): void {
  //   const attachmentDetails: AttachmentDetails = {
  //     FileName: FileName,
  //     blob: blob
  //   };
  //   const dialogConfig: MatDialogConfig = {
  //     data: attachmentDetails,
  //     panelClass: 'attachment-dialog'
  //   };
  //   const dialogRef = this.dialog.open(AttachmentDialogComponent, dialogConfig);
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //     }
  //   });
  // }

}
