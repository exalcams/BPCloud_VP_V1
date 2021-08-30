import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AuthenticationDetails, UserWithRole, AppUsage } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';

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
import { CustomerService } from 'app/services/customer.service';
import { ASNService } from 'app/services/asn.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import {
  BPCPIHeader, BPCPIView, BPCPIItem, BPCProd, BPCRetHeader, BPCRetView_new, BPCRetItem, BPCInvoicePayment,
  BPCRetItemBatch, BPCRetItemSerial, BPCRetItemView, BPCRetView
} from 'app/models/customer';
import { BPCFact } from 'app/models/fact';
import { BatchDialogComponent } from '../batch-dialog/batch-dialog.component';
import { SerialDialogComponent } from '../serial-dialog/serial-dialog.component';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-customer-return',
  templateUrl: './customer-return.component.html',
  styleUrls: ['./customer-return.component.scss']
})
export class CustomerReturnComponent implements OnInit {


  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  SelectedBPCFact: BPCFact;
  AllReturnHeaders: BPCRetHeader[] = [];
  ReturnFormGroup: FormGroup;
  ReturnItemFormGroup: FormGroup;
  InvoiceDetailsFormGroup: FormGroup;
  // ReturnItemFormGroup: FormGroup;
  AllUserWithRoles: UserWithRole[] = [];
  SelectedPIRNumber: string;
  PO: BPCOFHeader;
  POItems: BPCOFItem[] = [];
  SelectedReturnHeader: BPCRetHeader;
  SelectedReturnNumber: string;
  SelectedReturnView: BPCRetView;

  AllReturnItems: BPCRetItemView[] = [];
  ReturnItemDisplayedColumns: string[] = [
    'Item',
    'Material',
    'OrderQty',
    'ReturnQty',
    // 'Invoice',
    'ReasonText',
    'InvoiceAmount',
    'ReturnAmount',
    'Batch',
    'Serial',
    'Action'
  ];
  ReturnItemDataSource: MatTableDataSource<BPCRetItem>;
  @ViewChild(MatPaginator) ReturnItemPaginator: MatPaginator;
  @ViewChild(MatSort) ReturnItemSort: MatSort;
  invoiceAttachment: File;
  invAttach: BPCInvoiceAttachment;
  fileToUpload: File;
  fileToUploadList: File[] = [];
  math = Math;
  minDate: Date;
  maxDate: Date;

  selection = new SelectionModel<any>(true, []);
  searchText = '';
  InvoiceData: BPCInvoicePayment[] = [];
  AllCountries: BPCCountryMaster[] = [];
  AllCurrencies: BPCCurrencyMaster[] = [];
  AllProducts: BPCProd[] = [];
  isQtyError: boolean;
  @ViewChild('fileInput1') fileInput: ElementRef<HTMLElement>;
  selectedDocCenterMaster: BPCDocumentCenterMaster;
  ArrivalDateInterval: number;
  status_show: string;
  BatchListNo: number;
  Batchlist: BPCRetItemBatch[];
  SerialList: BPCRetItemSerial[];
  SerialListNo: number;
  hide: boolean;
  orderqty: number;
  ReturnQty: number;
  invoice_duplicate: any;
  length: number;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _masterService: MasterService,
    private _FactService: FactService,
    private _POService: POService,
    private _CustomerService: CustomerService,
    private _ASNService: ASNService,
    private _datePipe: DatePipe,
    private _authService: AuthService,
    private _route: ActivatedRoute,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.PO = new BPCOFHeader();
    this.SelectedReturnHeader = new BPCRetHeader();
    this.SelectedReturnHeader.Status = 'Open';
    this.SelectedReturnView = new BPCRetView();
    this.SelectedReturnNumber = '';
    this.invAttach = new BPCInvoiceAttachment();
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);
    this.maxDate = new Date();
    this.isQtyError = false;
    this.selectedDocCenterMaster = new BPCDocumentCenterMaster();
    this.ArrivalDateInterval = 1;
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
      if (this.MenuItems.indexOf('Return') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this._route.queryParams.subscribe(params => {
      this.SelectedPIRNumber = params['id'];
    });
    this.CreateAppUsage();
    this.InitializeReturnFormGroup();
    this.InitializeReturnItemFormGroup();
    this.GetAllBPCCountryMasters();
    this.GetAllBPCCurrencyMasters();
    this.GetFactByPartnerID();
    this.GetAllProducts();
    this.GetReturnBasedOnCondition();
    this.GetAllInvoices();
    if (!this.SelectedPIRNumber) {
      this.SelectedReturnHeader.Status = '';
    }
  }
  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'Return';
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

  InitializeReturnFormGroup(): void {
    this.ReturnFormGroup = this._formBuilder.group({
      RequestID: [''],
      Date: [new Date(), Validators.required],
      InvoiceReference: ['', Validators.required],
      SONumber: ['', Validators.required],
      CreditNote: ['', Validators.required],
      AWBNumber: ['', Validators.required],
      Transporter: ['', Validators.required],
      // TruckNumber: ['', [Validators.required, Validators.pattern('^[A-Z]{2}[-][0-9]{1,2}[-][A-Z]{1,2}[-][0-9]{3,4}?$')]],
      // TruckNumber: ['', [Validators.required, Validators.pattern('^[A-Z]{2}[ -][0-9]{1,2}(?: [A-Z])?(?: [A-Z]*)? [0-9]{3,4}$')]],
      TruckNumber: ['', [Validators.required, Validators.pattern('^[A-Z]{2}[ -][0-9]{1,2}[ -][A-Z]{2,3}[ -][0-9]{3,4}')]],
      Status: [''],
      TotalReturnQty: [''],
      TotalReturnAmount: [''],
    });
  }

  InitializeReturnItemFormGroup(): void {
    this.ReturnItemFormGroup = this._formBuilder.group({
      Item: ['', Validators.required],
      Material: ['', Validators.required],
      OrderQty: ['', [Validators.required, Validators.pattern('^([1-9][0-9]*)([.][0-9]{1,2})?$')]],
      ReturnQty: ['', [Validators.required, Validators.pattern('^([1-9][0-9]*)([.][0-9]{1,2})?$')]],
      ReasonText: [''],
      InvoiceAmount: ['', [Validators.required, Validators.pattern('^([1-9][0-9]*)([.][0-9]{1,2})?$')]],
      ReturnAmount: ['', [Validators.required, Validators.pattern('^([1-9][0-9]*)([.][0-9]{1,2})?$')]],
      // FileName: [''],
      // Invoice: ['', Validators.required],
      // Batches: [[]],
      // Serials: [[]]
    });
  }

  ResetControl(): void {
    this.SelectedReturnHeader = new BPCRetHeader();
    this.SelectedReturnHeader.Status = 'Open';
    this.SelectedReturnView = new BPCRetView();
    this.SelectedReturnNumber = '';
    this.ResetReturnFormGroup();
    // this.SetInitialValueForReturnFormGroup();
    this.ResetReturnItemFormGroup();
    this.ResetAttachments();
    this.AllReturnItems = [];
    this.ReturnItemDataSource = new MatTableDataSource(this.AllReturnItems);
    this.isQtyError = false;
    this.selectedDocCenterMaster = new BPCDocumentCenterMaster();
    this.SelectedPIRNumber = '';
    this.status_show = '';
    this.hide = false;
    this.ReturnFormGroup.get('Date').patchValue(new Date());
  }

  ResetReturnFormGroup(): void {
    this.ResetFormGroup(this.ReturnFormGroup);
  }
  ResetReturnItemFormGroup(): void {
    this.ResetFormGroup(this.ReturnItemFormGroup);
  }

  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }
  ClearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  ResetAttachments(): void {
    this.fileToUpload = null;
    this.fileToUploadList = [];
    this.invoiceAttachment = null;
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
  GetReturnBasedOnCondition(): void {
    if (this.SelectedPIRNumber) {
      // this.ReturnFormGroup.get('RequestID').disable();
      // this.ReturnFormGroup.get('CreditNote').disable();
      // this.ReturnFormGroup.get('SONumber').disable();
      // this.ReturnFormGroup.get('AWBNumber').disable();
      this.GetReturnByRetAndPartnerID();
    }
    else {
      this.SelectedReturnHeader.Status = "saved";
    }
  }
  // for batch dialog
  // GetBatchByRet(): void {
  //   this._CustomerService.GetAllReturnbatch(this.SelectedReturnHeader.RetReqID).subscribe(
  //     (data) => {
  //       this.Batchlist = data as BPCRetItemBatch[],
  //         this.BatchListNo = this.Batchlist.length;
  //       //  console.log("batch"+this.Batchlist)
  //       // this.BatchDataSource = new MatTableDataSource(this.AllReturnItems);
  //     },
  //     (err) => {
  //       console.log(err);
  //     }
  //   );
  // }
  // GetSerialByRet(): void {
  //   this._CustomerService.GetAllReturnSerial(this.SelectedReturnHeader.RetReqID).subscribe(
  //     (data) => {
  //       this.SerialList = data as BPCRetItemSerial[],
  //         this.SerialListNo = this.SerialList.length;
  //       //  console.log("batch"+this.SerialList)

  //     },
  //     (err) => {
  //       console.log(err);
  //     }
  //   );
  // }
  RemoveReturnItemFromTable(doc: BPCRetItemView): void {
    const index: number = this.AllReturnItems.indexOf(doc);
    if (index > -1) {
      this.AllReturnItems.splice(index, 1);
    }
    this.ReturnItemDataSource = new MatTableDataSource(this.AllReturnItems);
    this.CalculateTotalReturnQty();
    this.CalculateTotalReturnAmount();
    // this.SelectedReturnView.Batch;
    // this.Batchlist = null;
    // // this.SelectedReturnView.Batch = [];
    // this.BatchListNo = null;
    // this.SerialList = null;
    // this.SelectedReturnView.Serial = [];
    // this.SerialListNo = null;
  }
  GetAllInvoices(): void {
    this._POService.GetAllInvoices().subscribe(
      (data) => {
        this.InvoiceData = data as BPCInvoicePayment[];
        // console.log("invd"+  this.InvoiceData);
      },
      (err) => console.log(err)

    );
  }
  DateSelected(event): void {
    const selectedType = event.value;
    if (event.value) {
      // this.SelectedTask.Type = event.value;
    }
  }
  BatchOpen(selecteditem: BPCRetItemView): void {
    const index = this.AllReturnItems.indexOf(selecteditem);
    const dialogRef = this.dialog.open(BatchDialogComponent, {
      width: '500px',
      // height:'400px',
      data: { selecteditem: selecteditem, status: this.status_show }
    });
    dialogRef.afterClosed().subscribe(result => {

      this.Batchlist = result as BPCRetItemBatch[];
      this.BatchListNo = this.Batchlist.length;
      this.AllReturnItems[index].Batches = this.Batchlist;

      // if (!this.BatchListNo)
      //   this.GetBatchByRet();
      // console.log(this.BatchListNo);
    }
    );
  }

  SerialOpen(selecteditem: BPCRetItemView): void {
    const index = this.AllReturnItems.indexOf(selecteditem);
    const dialogRef = this.dialog.open(SerialDialogComponent, {
      width: '500px',
      data: { selecteditem: selecteditem, status: this.status_show }

    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.SerialList = result as BPCRetItemSerial[];
        this.SerialListNo = this.SerialList.length;
        this.AllReturnItems[index].Serials = this.SerialList;
      }

      // if (!this.SerialListNo)
      //   this.GetSerialByRet();
    });
  }

  decimalOnly(event): boolean {
    // this.AmountSelected();
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
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 8 || charCode === 9 || charCode === 13 || charCode === 46
      || charCode === 37 || charCode === 39 || charCode === 123) {
      return true;
    }
    else if (charCode < 48 || charCode > 57) {
      return false;
    }
    return true;
  }

  handleFileInput1(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      if (this.invoiceAttachment && this.invoiceAttachment.name) {
        this.notificationSnackBarComponent.openSnackBar('Maximum one attachment is allowed, old is attachment is replaced', SnackBarStatus.warning);
      }
      if (this.invAttach && this.invAttach.AttachmentName) {
        this.notificationSnackBarComponent.openSnackBar('Maximum one attachment is allowed, old is attachment is replaced', SnackBarStatus.warning);
      }
      this.invoiceAttachment = evt.target.files[0];
      this.invAttach = new BPCInvoiceAttachment();
    }
  }
  handleFileInput(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      const fil = evt.target.files[0] as File;
      this.fileToUpload = fil;
      // this.fileToUploadList.push(this.fileToUpload);
      this.ReturnItemFormGroup.get('FileName').patchValue(this.fileToUpload.name);
    }
  }

  // ProductSelected(event): void {
  //   if (event.value) {
  //     // const selectedProd = this.AllProducts.filter(x => x.ProductID === event.value)[0];
  //     // if (selectedProd) {
  //       console.log(this.SelectedReturnHeader.InvoiceDoc);

  //       this.ReturnItemFormGroup.get('InvoiceReference').patchValue(this.SelectedReturnHeader.InvoiceDoc);
  //     // }
  //   }
  // }
  InvoiceSelected(event): void {
    if (event.value) {
      // console.log(event.value);

      this.ReturnItemFormGroup.get('Invoice').patchValue(event.value);
      // this.invoice_duplicate=event.value
    }
  }

  // truck_func(){
  // // if( (this.BatchListNo = null)&&(this.SerialListNo = null)) {
  //   this.ReturnItemFormGroup.get('Invoice').patchValue(this.invoice_duplicate);
  // // }

  // }
  AddDocumentCenterFileValidator(): void {
    this.ReturnItemFormGroup.get('FileName').setValidators(Validators.required);
    this.ReturnItemFormGroup.get('FileName').updateValueAndValidity();
  }
  RemoveDocumentCenterFileValidator(): void {
    this.ReturnItemFormGroup.get('FileName').clearValidators();
    this.ReturnItemFormGroup.get('FileName').updateValueAndValidity();
  }

  AddReturnItemToTable(): void {
    if (this.ReturnItemFormGroup.valid) {
      const PIItem = new BPCRetItemView();
      PIItem.Client = this.SelectedBPCFact.Client;
      PIItem.Company = this.SelectedBPCFact.Company;
      PIItem.Type = this.SelectedBPCFact.Type;
      PIItem.PatnerID = this.SelectedBPCFact.PatnerID;
      PIItem.Item = this.ReturnItemFormGroup.get('Item').value;
      // PIItem.InvoiceNumber = this.ReturnItemFormGroup.get('Invoice').value;
      PIItem.Material = this.ReturnItemFormGroup.get('Material').value;
      PIItem.ReturnQty = this.ReturnItemFormGroup.get('ReturnQty').value;
      PIItem.OrderQty = this.ReturnItemFormGroup.get('OrderQty').value;
      // PIItem.DeliveryDate = this.ReturnItemFormGroup.get('DeliveryDate').value;
      // PIItem.UOM = this.ReturnItemFormGroup.get('UOM').value;
      PIItem.ReasonText = this.ReturnItemFormGroup.get('ReasonText').value;
      PIItem.InvoiceAmount = this.ReturnItemFormGroup.get('InvoiceAmount').value;
      PIItem.ReturnAmount = this.ReturnItemFormGroup.get('ReturnAmount').value;
      // PIItem.FileName = this.ReturnItemFormGroup.get('FileName').value;
      if (this.fileToUpload) {
        PIItem.FileName = this.fileToUpload.name;
        this.fileToUploadList.push(this.fileToUpload);
        this.fileToUpload = null;
      }
      if (!this.AllReturnItems || !this.AllReturnItems.length) {
        this.AllReturnItems = [];
      }
      this.AllReturnItems.push(PIItem);
      this.ReturnItemDataSource = new MatTableDataSource(this.AllReturnItems);
      this.CalculateTotalReturnQty();
      this.CalculateTotalReturnAmount();
      this.ResetReturnItemFormGroup();
      this.selectedDocCenterMaster = new BPCDocumentCenterMaster();
    } else {
      this.ShowValidationErrors(this.ReturnItemFormGroup);
    }
  }

  // RemoveReturnItemFromTable(doc: BPCRetItemView): void {
  //   const index: number = this.AllReturnItems.indexOf(doc);
  //   if (index > -1) {
  //     this.AllReturnItems.splice(index, 1);
  //     const indexx = this.fileToUploadList.findIndex(x => x.name === doc.FileName);
  //     if (indexx > -1) {
  //       this.fileToUploadList.splice(indexx, 1);
  //     }
  //   }
  //   this.ReturnItemDataSource = new MatTableDataSource(this.AllReturnItems);
  //   this.CalculateTotalReturnQty();
  //   this.CalculateTotalReturnAmount();
  // }

  CalculateTotalReturnQty(): void {
    let TotalReturnQty = 0;
    this.AllReturnItems.forEach((x, i) => {
      TotalReturnQty += +x.ReturnQty;
    });
    TotalReturnQty = Math.round((TotalReturnQty + Number.EPSILON) * 100) / 100;
    this.ReturnFormGroup.get('TotalReturnQty').patchValue(TotalReturnQty);
  }

  CalculateTotalReturnAmount(): void {
    let TotalReturnAmount = 0;
    this.AllReturnItems.forEach((x, i) => {
      TotalReturnAmount += +x.ReturnAmount;
    });
    TotalReturnAmount = Math.round((TotalReturnAmount + Number.EPSILON) * 100) / 100;
    this.ReturnFormGroup.get('TotalReturnAmount').patchValue(TotalReturnAmount);
  }

  GetAllBPCCountryMasters(): void {
    this._ASNService.GetAllBPCCountryMasters().subscribe(
      (data) => {
        this.AllCountries = data as BPCCountryMaster[];
      },
      (err) => {
        console.error(err);
      }
    );
  }

  GetAllBPCCurrencyMasters(): void {
    this._ASNService.GetAllBPCCurrencyMasters().subscribe(
      (data) => {
        this.AllCurrencies = data as BPCCurrencyMaster[];
      },
      (err) => {
        console.error(err);
      }
    );
  }

  GetAllProducts(): void {
    this._CustomerService.GetAllProducts().subscribe(
      (data) => {
        this.AllProducts = data as BPCProd[];
      },
      (err) => {
        console.error(err);
      }
    );
  }

  // GetAllReturnByPartnerID(): void {
  //     this._CustomerService.GetAllReturnByPartnerID(this.currentUserName).subscribe(
  //         (data) => {
  //             this.AllReturnHeaders = data as BPCPIHeader[];
  //             if (this.AllReturnHeaders && this.AllReturnHeaders.length) {
  //                 this.LoadSelectedReturn(this.AllReturnHeaders[0]);
  //             }
  //         },
  //         (err) => {
  //             console.error(err);
  //         }
  //     );
  // }
  // mouni
  GetReturnByRetAndPartnerID(): void {
    this._CustomerService.GetReturnByRetAndPartnerID_RetH(this.SelectedPIRNumber, this.currentUserName).subscribe(
      (data) => {
        this.SelectedReturnHeader = data as BPCRetHeader;
        this.status_show = this.SelectedReturnHeader.Status;
        // console.log("status", this.status_show);
        if (this.status_show === 'submitted') {
          this.ReturnFormGroup.get('RequestID').disable();
          this.ReturnFormGroup.get('Date').disable();
          this.ReturnFormGroup.get('InvoiceReference').disable();
          this.ReturnFormGroup.get('SONumber').disable();
          this.ReturnFormGroup.get('CreditNote').disable();
          this.ReturnFormGroup.get('AWBNumber').disable();
          this.ReturnFormGroup.get('Transporter').disable();
          this.ReturnFormGroup.get('TruckNumber').disable();
          this.ReturnFormGroup.get('Status').disable();
          // this.show = true;
        }
        else if (this.status_show === 'saved') {
          this.ReturnFormGroup.get('RequestID').disable();
          this.ReturnFormGroup.get('Status').disable();
        }
        if (!this.status_show || this.status_show === 'Open' || this.status_show === 'saved') {
          this.hide = false;
        } else {
          this.hide = true;
        }
        // console.log("ret" + this.SelectedReturnHeader);
        if (this.SelectedReturnHeader) {
          this.LoadSelectedReturn(this.SelectedReturnHeader);
        }
        else {

        }
      },
      (err) => {
        console.error(err);
      }
    );
  }
  // mouni end
  LoadSelectedReturn(seletedReturn: BPCRetHeader): void {
    this.SelectedReturnHeader = seletedReturn;
    this.SelectedReturnView.RetReqID = this.SelectedReturnHeader.RetReqID;
    this.SelectedReturnNumber = this.SelectedReturnHeader.RetReqID;
    this.SetReturnHeaderValues();
    // this.GetReturnItemsByRet();
    this.GetReturnItemsByReqID();
    // this.GetBatchByRet();
    // this.GetSerialByRet();
  }

  // moni
  // GetReturnItemsByRet(): void {
  //   this._CustomerService.GetReturnItemsByRet_RetI(this.SelectedReturnHeader.RetReqID).subscribe(
  //     (data) => {
  //       const dt = data as BPCRetItem[];
  //       if (dt && dt.length && dt.length > 0) {
  //         this.AllReturnItems = data as BPCRetItem[];
  //         this.ReturnItemDataSource = new MatTableDataSource(this.AllReturnItems);
  //       }
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }
  GetReturnItemsByReqID(): void {
    this._CustomerService.GetReturnItemsByReqID(this.SelectedReturnHeader.RetReqID).subscribe(
      (data) => {
        const dt = data as BPCRetItem[];
        if (dt && dt.length && dt.length > 0) {
          this.AllReturnItems = data as BPCRetItemView[];
          this.ReturnItemDataSource = new MatTableDataSource(this.AllReturnItems);
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }
  SetReturnHeaderValues(): void {
    this.ReturnFormGroup.get('RequestID').patchValue(this.SelectedReturnHeader.RetReqID);
    this.ReturnFormGroup.get('Date').patchValue(this.SelectedReturnHeader.Date);
    this.ReturnFormGroup.get('InvoiceReference').patchValue(this.SelectedReturnHeader.InvoiceDoc);
    this.ReturnFormGroup.get('SONumber').patchValue(this.SelectedReturnHeader.DocumentNumber);
    this.ReturnFormGroup.get('CreditNote').patchValue(this.SelectedReturnHeader.CreditNote);
    this.ReturnFormGroup.get('AWBNumber').patchValue(this.SelectedReturnHeader.AWBNumber);
    this.ReturnFormGroup.get('Transporter').patchValue(this.SelectedReturnHeader.Transporter);
    this.ReturnFormGroup.get('TruckNumber').patchValue(this.SelectedReturnHeader.TruckNumber);
    this.ReturnFormGroup.get('Status').patchValue(this.SelectedReturnHeader.Status);
    // this.ReturnFormGroup.get('Status').patchValue(this.SelectedReturnHeader.TruckNumber);
    console.log(this.ReturnFormGroup);

  }


  GetReturnValues(action): void {
    if (this.SelectedBPCFact) {
      this.SelectedReturnHeader.Client = this.SelectedReturnView.Client = this.SelectedBPCFact.Client;
      this.SelectedReturnHeader.Company = this.SelectedReturnView.Company = this.SelectedBPCFact.Company;
      this.SelectedReturnHeader.Type = this.SelectedReturnView.Type = this.SelectedBPCFact.Type;
      this.SelectedReturnHeader.PatnerID = this.SelectedReturnView.PatnerID = this.SelectedBPCFact.PatnerID;
    }
    const depDate = this.ReturnFormGroup.get('Date').value;
    if (depDate) {
      this.SelectedReturnHeader.Date = this.SelectedReturnView.Date = this._datePipe.transform(depDate, 'yyyy-MM-dd HH:mm:ss');
    } else {
      this.SelectedReturnHeader.Date = this.SelectedReturnView.Date = this.ReturnFormGroup.get('Date').value;
    }
    this.SelectedReturnHeader.InvoiceDoc = this.SelectedReturnView.InvoiceDoc = this.ReturnFormGroup.get('InvoiceReference').value;
    this.SelectedReturnHeader.CreditNote = this.SelectedReturnView.CreditNote = this.ReturnFormGroup.get('CreditNote').value;
    this.SelectedReturnHeader.DocumentNumber = this.SelectedReturnView.DocumentNumber = this.ReturnFormGroup.get('SONumber').value;
    this.SelectedReturnHeader.AWBNumber = this.SelectedReturnView.AWBNumber = this.ReturnFormGroup.get('AWBNumber').value;
    this.SelectedReturnHeader.Transporter = this.SelectedReturnView.Transporter = this.ReturnFormGroup.get('Transporter').value;
    this.SelectedReturnHeader.TruckNumber = this.SelectedReturnView.TruckNumber = this.ReturnFormGroup.get('TruckNumber').value;

    if (this.SelectedPIRNumber) {
      // this.SelectedReturnHeader.Client = this.SelectedReturnView.Client = this.PO.Client;
      // this.SelectedReturnHeader.Company = this.SelectedReturnView.Company = this.PO.Company;
      // this.SelectedReturnHeader.Type = this.SelectedReturnView.Type = this.PO.Type;
      // this.SelectedReturnHeader.PatnerID = this.SelectedReturnView.PatnerID = this.PO.PatnerID;
      // this.SelectedReturnHeader.Status = this.SelectedReturnView.Status = this.SelectedReturnHeader.Status;
      // if(action=="submitted")
      // this.SelectedReturnHeader.Status = "20";
      // else if(action=="saved")
      // {
      //     this.SelectedReturnHeader.Status =  "10";
      // }
    }
    // else {
    //   // this.SelectedReturnHeader.Client = this.SelectedReturnView.Client = this.SelectedReturnHeader.Client;
    //   // this.SelectedReturnHeader.Company = this.SelectedReturnView.Company = this.SelectedReturnHeader.Company;
    //   if (this.SelectedReturnHeader.Status == "saved")
    //     this.SelectedReturnHeader.Status  = "10";
    //   else if (this.SelectedReturnHeader.Status == "submitted") {
    //     this.SelectedReturnHeader.Status= "20";
    //   }
    // }
    // if (this.SelectedReturnHeader.Status == "saved")
    //   this.SelectedReturnHeader.Status ="10";
    // else if (this.SelectedReturnHeader.Status == "submitted") {
    //   this.SelectedReturnHeader.Status = "20";
    // }
  }

  calculateDiff(sentDate): number {
    const dateSent: Date = new Date(sentDate);
    const currentDate: Date = new Date();
    return Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) -
      Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
  }

  GetReturnItemValues(): void {
    this.SelectedReturnView.Items = [];
    if (this.AllReturnItems.length) {
      this.AllReturnItems.forEach(x => {
        if (this.SelectedReturnHeader) {
          x.Client = this.SelectedReturnHeader.Client;
          x.Company = this.SelectedReturnHeader.Company;
          x.Type = this.SelectedReturnHeader.Type;
          x.PatnerID = this.SelectedReturnHeader.PatnerID;

        }
        this.SelectedReturnView.Items.push(x);
      });
    }
  }
  // GetReturnBatchItemValues(): void {
  //   this.SelectedReturnView.Batch = [];

  //   if (this.Batchlist != null) {
  //     this.Batchlist.forEach(x => {
  //       if (this.Batchlist) {
  //         x.Client = this.SelectedBPCFact.Client;
  //         x.Company = this.SelectedBPCFact.Company;
  //         x.Type = this.SelectedBPCFact.Type;
  //         x.PatnerID = this.SelectedBPCFact.PatnerID;
  //         // x.RetReqID=this.SelectedReturnHeader.RetReqID;

  //       }
  //       this.SelectedReturnView.Batch.push(x);
  //     });
  //   }
  // }
  // GetReturnSerialItemValues(): void {
  //   this.SelectedReturnView.Serial = [];
  //   if (this.SerialList != null) {
  //     this.SerialList.forEach(x => {
  //       if (this.SelectedReturnHeader) {
  //         x.Client = this.SelectedReturnHeader.Client;
  //         x.Company = this.SelectedReturnHeader.Company;
  //         x.Type = this.SelectedReturnHeader.Type;
  //         x.PatnerID = this.SelectedReturnHeader.PatnerID;
  //         // x.RetReqID=this.SelectedReturnHeader.RetReqID;
  //       }
  //       this.SelectedReturnView.Serial.push(x);
  //     });
  //   }
  // }

  SaveClicked(): void {
    // if (this.ReturnFormGroup.valid) {
    if (!this.isQtyError) {
      // if (this.ReturnItemFormGroup.valid) {
      //     if (this.InvoiceDetailsFormGroup.valid) {
      this.GetReturnValues("saved");
      this.GetReturnItemValues();
      // this.GetReturnBatchItemValues();
      // this.GetReturnSerialItemValues();
      // this.GetInvoiceDetailValues();
      // this.GetDocumentCenterValues();
      // this.SelectedReturnView.IsSubmitted = false;
      this.SetActionToOpenConfirmation('Save');
      //     } else {
      //         this.ShowValidationErrors(this.InvoiceDetailsFormGroup);
      //     }

      // } else {
      //     this.ShowValidationErrors(this.ReturnItemFormGroup);
      // }
    }

    // }
    else {
      this.ShowValidationErrors(this.ReturnFormGroup);
    }
  }
  SubmitClicked(): void {
    if (this.ReturnFormGroup.valid) {
      if (!this.isQtyError) {
        this.GetReturnValues("submitted");
        this.GetReturnItemValues();
        // this.GetReturnBatchItemValues();
        // this.GetReturnSerialItemValues();
        // if (!this.SelectedPIRNumber) {
        //   this.length = 0;
        // }
        // else if (this.SelectedPIRNumber) {
        //   this.length = this.ReturnItemDataSource.data.length;
        // }
        if (this.AllReturnItems.length && this.AllReturnItems.length !== 0) {
          this.SetActionToOpenConfirmation('Submit');
        }
        else if (this.AllReturnItems.length === 0) {
          this.notificationSnackBarComponent.openSnackBar('Minimum one item should be in table', SnackBarStatus.danger);
        }
        // if ((this.AllReturnItems.length || this.ReturnItemFormGroup.status === "VALID") && (this.length !== 0)) {
        //   this.SetActionToOpenConfirmation('Submit');
        // }
        // else if (this.length === 0 && this.ReturnItemFormGroup.status === "INVALID") {
        //   this.ShowValidationErrors(this.ReturnItemFormGroup);
        // }
        // else if (this.length === 0 && this.ReturnItemFormGroup.status === "VALID") {
        //   this.notificationSnackBarComponent.openSnackBar('Minimum one item should be in Item table', SnackBarStatus.danger);
        // }

      }

    } else {
      this.ShowValidationErrors(this.ReturnFormGroup);
    }
  }
  // mouni
  DeleteClicked(): void {
    if (this.SelectedReturnHeader.RetReqID) {
      const Actiontype = 'Delete';
      const Catagory = 'Return';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    }
  }
  SetActionToOpenConfirmation(Actiontype: string): void {
    // if (this.SelectedReturnHeader.ReturnNumber) {
    //     const Catagory = 'Return';
    //     this.OpenConfirmationDialog(Actiontype, Catagory);
    // } else {
    //     const Catagory = 'Return';
    //     this.OpenConfirmationDialog(Actiontype, Catagory);
    // }
    const Catagory = 'Return';
    this.OpenConfirmationDialog(Actiontype, Catagory);
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
          if (Actiontype === 'Save' || Actiontype === 'Submit') {
            if (this.SelectedReturnHeader.RetReqID) {
              this.UpdateReturnHeader(Actiontype);
            } else {
              this.CreateReturnHeader(Actiontype);
            }
          } else if (Actiontype === 'Delete') {
            this.DeleteReturn();
          }
        }
      });
  }


  CreateReturnHeader(Actiontype: string): void {
    // this.GetReturnValues();
    // this.GetBPReturnSubItemValues();
    // this.SelectedReturnView.CreatedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    if (Actiontype === 'Submit') {
      this.SelectedReturnView.Status = '20';
    }
    else if (Actiontype === 'Save') {
      this.SelectedReturnView.Status = '10';
    }
    this._CustomerService.CreateReturnHeader(this.SelectedReturnView).subscribe(
      (data) => {
        this.SelectedReturnHeader.RetReqID = (data as BPCRetHeader).RetReqID;
        if (this.fileToUploadList && this.fileToUploadList.length) {
          this.AddReturnItemAttachment(Actiontype);
        } else {
          this.ResetControl();
          this.notificationSnackBarComponent.openSnackBar(`Return ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
          this.IsProgressBarVisibile = false;
        }
      },
      (err) => {
        this.showErrorNotificationSnackBar(err);
      }
    );
  }

  // AddInvoiceAttachment(Actiontype: string): void {
  //     this._CustomerService.AddInvoiceAttachment(this.SelectedReturnHeader.PIRNumber, this.currentUserID.toString(), this.invoiceAttachment).subscribe(
  //         (dat) => {
  //             if (this.fileToUploadList && this.fileToUploadList.length) {
  //                 this.AddReturnItemAttachment(Actiontype);
  //             } else {
  //                 this.ResetControl();
  //                 this.notificationSnackBarComponent.openSnackBar(`Return ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
  //                 this.IsProgressBarVisibile = false;
  //                 this.GetReturnBasedOnCondition();
  //             }
  //         },
  //         (err) => {
  //             this.showErrorNotificationSnackBar(err);
  //         });
  // }
  AddReturnItemAttachment(Actiontype: string): void {
    this._CustomerService.AddReturnItemAttachment(this.SelectedReturnHeader.RetReqID, this.currentUserID.toString(), this.fileToUploadList).subscribe(
      (dat) => {
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar(`Return ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetReturnBasedOnCondition();
      },
      (err) => {
        this.showErrorNotificationSnackBar(err);
      }
    );
  }

  GetReturnItemAttachment(fileName: string): void {
    const file = this.fileToUploadList.filter(x => x.name === fileName)[0];
    if (file && file.size) {
      const blob = new Blob([file], { type: file.type });
      this.OpenAttachmentDialog(fileName, blob);
    } else {
      this.IsProgressBarVisibile = true;
      this._CustomerService.DowloandReturnItemAttachment(fileName, this.SelectedReturnHeader.RetReqID).subscribe(
        data => {
          if (data) {
            let fileType = 'image/jpg';
            fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
              fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
                fileName.toLowerCase().includes('.png') ? 'image/png' :
                  fileName.toLowerCase().includes('.gif') ? 'image/gif' :
                    fileName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
            const blob = new Blob([data], { type: fileType });
            this.OpenAttachmentDialog(fileName, blob);
          }
          this.IsProgressBarVisibile = false;
        },
        error => {
          console.error(error);
          this.IsProgressBarVisibile = false;
        }
      );
    }
  }

  showErrorNotificationSnackBar(err: any): void {
    console.error(err);
    this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    this.IsProgressBarVisibile = false;
  }

  UpdateReturnHeader(Actiontype: string): void {
    // this.GetReturnValues();
    // this.GetBPReturnSubItemValues();
    // this.SelectedBPReturnView.TransID = this.SelectedBPReturn.TransID;
    // this.SelectedReturnView.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.IsProgressBarVisibile = true;
    if (Actiontype === 'Submit') {
      this.SelectedReturnView.Status = '20';
    }
    else if (Actiontype === 'Save') {
      this.SelectedReturnView.Status = '10';
    }

    this._CustomerService.UpdateReturnHeader(this.SelectedReturnView).subscribe(
      (data) => {
        this.SelectedReturnHeader.RetReqID = (data as BPCRetHeader).RetReqID;
        if (this.fileToUploadList && this.fileToUploadList.length) {
          this.AddReturnItemAttachment(Actiontype);
        } else {
          this.ResetControl();
          this.notificationSnackBarComponent.openSnackBar(`Return ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
          this.IsProgressBarVisibile = false;
        }
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  DeleteReturn(): void {
    // this.GetReturnValues();
    // this.SelectedBPReturn.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._CustomerService.DeleteReturnHeader(this.SelectedReturnHeader).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Return deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        // this.GetReturnBasedOnCondition();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
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

  // GetInvoiceAttachment(FileName: string, file?: File): void {
  //     if (file && file.size) {
  //         const blob = new Blob([file], { type: file.type });
  //         this.OpenAttachmentDialog(FileName, blob);
  //     } else {
  //         this.IsProgressBarVisibile = true;
  //         this._CustomerService.DowloandInvoiceAttachment(FileName, this.SelectedReturnHeader.ReturnNumber).subscribe(
  //             data => {
  //                 if (data) {
  //                     let fileType = 'image/jpg';
  //                     fileType = FileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
  //                         FileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
  //                             FileName.toLowerCase().includes('.png') ? 'image/png' :
  //                                 FileName.toLowerCase().includes('.gif') ? 'image/gif' :
  //                                     FileName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
  //                     const blob = new Blob([data], { type: fileType });
  //                     this.OpenAttachmentDialog(FileName, blob);
  //                 }
  //                 this.IsProgressBarVisibile = false;
  //             },
  //             error => {
  //                 console.error(error);
  //                 this.IsProgressBarVisibile = false;
  //             }
  //         );
  //     }
  // }

  // GetDocumentCenterAttachment(FileName: string): void {
  //     const file = this.fileToUploadList.filter(x => x.name === FileName)[0];
  //     if (file && file.size) {
  //         const blob = new Blob([file], { type: file.type });
  //         this.OpenAttachmentDialog(FileName, blob);
  //     } else {
  //         this.IsProgressBarVisibile = true;
  //         this._CustomerService.DowloandReturnItemAttachment(FileName, this.SelectedReturnHeader.ReturnNumber).subscribe(
  //             data => {
  //                 if (data) {
  //                     let fileType = 'image/jpg';
  //                     fileType = FileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
  //                         FileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
  //                             FileName.toLowerCase().includes('.png') ? 'image/png' :
  //                                 FileName.toLowerCase().includes('.gif') ? 'image/gif' :
  //                                     FileName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
  //                     const blob = new Blob([data], { type: fileType });
  //                     this.OpenAttachmentDialog(FileName, blob);
  //                 }
  //                 this.IsProgressBarVisibile = false;
  //             },
  //             error => {
  //                 console.error(error);
  //                 this.IsProgressBarVisibile = false;
  //             }
  //         );
  //     }
  // }

  OpenAttachmentDialog(FileName: string, blob: Blob): void {
    const attachmentDetails: AttachmentDetails = {
      FileName: FileName,
      blob: blob
    };
    const dialogConfig: MatDialogConfig = {
      data: attachmentDetails,
      panelClass: 'attachment-dialog'
    };
    const dialogRef = this.dialog.open(AttachmentDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  QtySelected(): void {
    const OrderQtyVAL = +this.ReturnItemFormGroup.get('OrderQty').value;

    this.ReturnQty = Number(this.ReturnItemFormGroup.get('ReturnQty').value);

    this.orderqty = Number(this.ReturnItemFormGroup.get('OrderQty').value);

    if ((this.ReturnQty > this.orderqty) && (this.orderqty !== 0)) {
      this.ReturnItemFormGroup.get('ReturnQty').setErrors({ qty1: true });
    }
    else if ((this.orderqty === 0)) {

      // this.ReturnItemFormGroup.get('ReturnQty').setErrors({ qty1: false })
      this.ReturnItemFormGroup.get('OrderQty').markAsTouched();
    }
    else if (this.ReturnQty <= this.orderqty) {
      this.ReturnItemFormGroup.get('OrderQty').markAsUntouched();

      // this.ReturnItemFormGroup.get('ReturnQty').setErrors({ qty1: false })
      this.ReturnItemFormGroup.get('ReturnQty').markAsUntouched();
      this.ReturnItemFormGroup.get('ReturnQty').setErrors(null);
    }

    // const ReturnQtyVAL = + this.ReturnItemFormGroup.get('ReturnQty').value;
    // if (OrderQtyVAL < ReturnQtyVAL) {
    //   this.isQtyError = true;
    // } else {
    //   this.isQtyError = false;
    // }
  }

  getStatusColor(StatusFor: string): string {
    switch (StatusFor) {
      case 'Draft':
        return this.SelectedReturnHeader.Status === '' ? 'gray' :
          this.SelectedReturnHeader.Status === 'saved' ? '#34ad65' :
            this.SelectedReturnHeader.Status === 'submitted' ? '#34ad65' :
              this.SelectedReturnHeader.Status === 'Accepted' ? '#34ad65' : 'gray';
      case 'Submitted':
        return this.SelectedReturnHeader.Status === '' ? 'gray' :
          this.SelectedReturnHeader.Status === 'saved' ? 'gray' :
            this.SelectedReturnHeader.Status === 'submitted' ? '#34ad65' :
              this.SelectedReturnHeader.Status === 'Accepted' ? '#34ad65' : 'gray';
      case 'Accepted':
        return this.SelectedReturnHeader.Status === '' ? 'gray' :
          this.SelectedReturnHeader.Status === 'saved' ? 'gray' :
            this.SelectedReturnHeader.Status === 'submitted' ? 'gray' :
              this.SelectedReturnHeader.Status === 'Accepted' ? '#34ad65' : 'gray';
      default:
        return '';
    }
  }

  getTimeline(StatusFor: string): string {
    switch (StatusFor) {
      case 'Draft':
        return this.SelectedReturnHeader.Status === '' ? 'white-timeline' :
          this.SelectedReturnHeader.Status === 'saved' ? 'green-timeline' :
            this.SelectedReturnHeader.Status === 'submitted' ? 'green-timeline' :
              this.SelectedReturnHeader.Status === 'Accepted' ? 'green-timeline' : 'white-timeline';
      case 'Submitted':
        return this.SelectedReturnHeader.Status === '' ? 'white-timeline' :
          this.SelectedReturnHeader.Status === 'saved' ? 'white-timeline' :
            this.SelectedReturnHeader.Status === 'submitted' ? 'green-timeline' :
              this.SelectedReturnHeader.Status === 'Accepted' ? 'green-timeline' : 'white-timeline';
      case 'Accepted':
        return this.SelectedReturnHeader.Status === '' ? 'white-timeline' :
          this.SelectedReturnHeader.Status === 'saved' ? 'white-timeline' :
            this.SelectedReturnHeader.Status === 'submitted' ? 'white-timeline' :
              this.SelectedReturnHeader.Status === 'Accepted' ? 'green-timeline' : 'white-timeline';
      default:
        return '';
    }
  }
  getRestTimeline(StatusFor: string): string {
    switch (StatusFor) {
      case 'Draft':
        return this.SelectedReturnHeader.Status === '' ? 'white-timeline' :
          this.SelectedReturnHeader.Status === '' ? 'white-timeline' :
            this.SelectedReturnHeader.Status === 'saved' ? 'white-timeline' :
              this.SelectedReturnHeader.Status === 'submitted' ? 'green-timeline' :
                this.SelectedReturnHeader.Status === 'Accepted' ? 'green-timeline' : 'white-timeline';
      case 'Submitted':
        return this.SelectedReturnHeader.Status === '' ? 'white-timeline' :
          this.SelectedReturnHeader.Status === 'saved' ? 'white-timeline' :
            this.SelectedReturnHeader.Status === 'submitted' ? 'white-timeline' :
              this.SelectedReturnHeader.Status === 'Accepted' ? 'green-timeline' : 'white-timeline';
      // case 'Accepted':
      //   return this.SelectedReturnHeader.Status === 'Draft' ? 'white-timeline' :
      //   this.SelectedReturnHeader.Status === 'Submitted' ? 'white-timeline' :
      //   this.SelectedReturnHeader.Status === 'Accepted' ? 'green-timeline' : 'green-timeline';
      default:
        return '';
    }
  }
  getStatusDate(StatusFor: string): string {
    const tt = this._datePipe.transform(this.maxDate, 'dd/MM/yyyy');
    switch (StatusFor) {
      case 'SO':
        return this.SelectedReturnHeader.Status === 'Open' ? '' : tt;
      case 'Shipped':
        return this.SelectedReturnHeader.Status === 'Open' ? '' :
          this.SelectedReturnHeader.Status === 'SO' ? '' : tt;
      case 'Invoiced':
        return this.SelectedReturnHeader.Status === 'Open' ? '' :
          this.SelectedReturnHeader.Status === 'SO' ? '' :
            this.SelectedReturnHeader.Status === 'Shipped' ? '' : tt;
      case 'Receipt':
        return this.SelectedReturnHeader.Status === 'Open' ? '' :
          this.SelectedReturnHeader.Status === 'SO' ? '' :
            this.SelectedReturnHeader.Status === '' ? '' :
              this.SelectedReturnHeader.Status === '' ? '' : tt;
      default:
        return '';
    }
  }

}
