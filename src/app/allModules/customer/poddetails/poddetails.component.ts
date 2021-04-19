import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails, UserWithRole, AppUsage } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { BPCPODHeader, BPCPODView, BPCPODItem, BPCReasonMaster } from 'app/models/POD';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { MatPaginator, MatSort, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { BPCInvoiceAttachment, BPCCountryMaster, BPCCurrencyMaster } from 'app/models/ASN';
import { SelectionModel } from '@angular/cdk/collections';
import { FuseConfigService } from '@fuse/services/config.service';
import { MasterService } from 'app/services/master.service';
import { FactService } from 'app/services/fact.service';
import { ASNService } from 'app/services/asn.service';
import { PODService } from 'app/services/pod.service';
import { VendorMasterService } from 'app/services/vendor-master.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { fuseAnimations } from '@fuse/animations';
import { NotesDialogComponent } from '../notes-dialog/notes-dialog.component';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { PODItemAttachmentDialogComponent } from '../poditem-attachment-dialog/poditem-attachment-dialog.component';
import { BPCFact } from 'app/models/fact';

@Component({
  selector: 'app-poddetails',
  templateUrl: './poddetails.component.html',
  styleUrls: ['./poddetails.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class PODDetailsComponent implements OnInit {

  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  SelectedBPCFact: BPCFact;
  AllPODHeaders: BPCPODHeader[] = [];
  PODFormGroup: FormGroup;
  PODItemFormGroup: FormGroup;
  AllUserWithRoles: UserWithRole[] = [];
  SelectedInvoiceNumber: string;
  SelectedPODHeader: BPCPODHeader;
  SelectedPODView: BPCPODView;
  PODItems: BPCPODItem[] = [];
  PODItemDisplayedColumns: string[] = [
    'Item',
    'Material',
    'MaterialText',
    'Qty',
    'ReceivedQty',
    'MissingQty',
    'BreakageQty',

    'AcceptedQty',
    'Reason',
    'AttachmentName',
    'Remarks'
  ];
  PODItemFormArray: FormArray = this._formBuilder.array([]);
  PODItemDataSource = new BehaviorSubject<AbstractControl[]>([]);
  @ViewChild(MatPaginator) PODItemPaginator: MatPaginator;
  @ViewChild(MatSort) PODItemSort: MatSort;
  invoiceAttachment: File;
  invAttach: BPCInvoiceAttachment;
  fileToUpload: File;
  fileToUploadList: File[] = [];
  math = Math;
  minDate: Date;
  maxDate: Date;

  selection = new SelectionModel<any>(true, []);
  searchText = '';

  AllCountries: BPCCountryMaster[] = [];
  AllCurrencies: BPCCurrencyMaster[] = [];
  AllReasons: BPCReasonMaster[] = [];
  isWeightError: boolean;
  @ViewChild('fileInput1') fileInput1: ElementRef<HTMLElement>;
  ArrivalDateInterval: number;
  a: any;
  b: any;
  recive: any;
  item: AbstractControl;
  c: any;
  d: any;
  e: number;
  f: any;
  Qtty: any;
  recivedStatus: any;
  recivedStatus1: any;
  recivedStatus2: any;
  recivedStatus2_noteq: any;
  recivedStatus1_eq: any;
  Recived_status: any;
  doc: string;

  constructor(
    private _fuseConfigService: FuseConfigService,
    private _masterService: MasterService,
    private _FactService: FactService,
    private _ASNService: ASNService,
    private _PODService: PODService,
    private _vendorMasterService: VendorMasterService,
    private _datePipe: DatePipe,
    private _route: ActivatedRoute,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.SelectedPODHeader = new BPCPODHeader();
    this.SelectedPODView = new BPCPODView();
    this.SelectedInvoiceNumber = '';
    this.invAttach = new BPCInvoiceAttachment();
    this.minDate = new Date();
    this.minDate.setDate(this.minDate.getDate() + 1);
    this.maxDate = new Date();
    this.isWeightError = false;
    this.ArrivalDateInterval = 1;

  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
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
    this._route.queryParams.subscribe(params => {
      this.SelectedInvoiceNumber = params['id'];
    });
    this.CreateAppUsage();
    this.InitializePODFormGroup();
    this.InitializePODItemFormGroup();
    this.GetFactByPartnerID();
    this.GetAllBPCCurrencyMasters();
    this.GetAllReasonMaster();
    this.GetPODBasedOnCondition();
  }
  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'POD Details';
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
  InitializePODFormGroup(): void {
    this.PODFormGroup = this._formBuilder.group({
      InvoiceNumber: ['', Validators.required],
      DocNumber: ['', Validators.required],
      InvoiceDate: [new Date(), Validators.required],
      TruckNumber: ['', Validators.required],
      VessleNumber: ['', Validators.required],
      Amount: ['', [Validators.pattern('^([0-9]*[1-9][0-9]*(\\.[0-9]+)?|[0]*\\.[0-9]*[1-9][0-9]*)$')]],
      Currency: ['KG', Validators.required],
      Transporter: [''],
      Status: [''],
    });
    // this.PODFormGroup.get('InvoiceNumber').disable();
    // this.PODFormGroup.get('InvoiceDate').disable();
    // this.PODFormGroup.get('TruckNumber').disable();
    // this.PODFormGroup.get('VessleNumber').disable();
    // this.PODFormGroup.get('Amount').disable();
    // this.PODFormGroup.get('Currency').disable();
    // this.PODFormGroup.get('Transporter').disable();
    // this.PODFormGroup.get('Status').disable();
    // this.DynamicallyAddAcceptedValidation();
  }

  InitializePODItemFormGroup(): void {
    this.PODItemFormGroup = this._formBuilder.group({
      PODItems: this.PODItemFormArray
    });
  }


  ResetControl(): void {
    this.SelectedPODHeader = new BPCPODHeader();
    this.SelectedPODView = new BPCPODView();
    // this.SelectedInvoiceNumber = '';
    this.ResetPODFormGroup();
    this.isWeightError = false;
    this.ResetAttachments();
  }

  ResetPODFormGroup(): void {
    this.ResetFormGroup(this.PODFormGroup);
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
  GetPODBasedOnCondition(): void {
    if (this.SelectedInvoiceNumber) {
      this.GetPODByInvAndPartnerID();
    } else {
      // this.GetAllPODByPartnerID();
    }
  }

  TruckNumberSelected(event): void {
    const selectedType = event.value;
    if (event.value) {
      // this.SelectedTask.Type = event.value;
    }
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

  AmountUnitSelected(event): void {

  }

  grossWeightUnitSelected(event): void {

  }

  VolumetricWeightUOMSelected(event): void {

  }

  CountryOfOriginSelected(event): void {

  }

  invoiceValueUnitSelected(event): void {

  }


  // AddDocCenterAttClicked(): void {
  //     const DocumentTypeVal = this.DocumentCenterFormGroup.get('DocumentType').value;
  //     if (DocumentTypeVal) {
  //         // const el: HTMLElement = this.fileInput.nativeElement;
  //         // el.click();
  //         const event = new MouseEvent('click', {bubbles: false});
  //         this.fileInput.nativeElement.dispatchEvent(event);
  //     } else {
  //         this.notificationSnackBarComponent.openSnackBar('Please selected Document type', SnackBarStatus.danger);
  //     }
  // }

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
  GetAllReasonMaster(): void {
    this._PODService.GetAllReasonMaster().subscribe(
      (data) => {
        this.AllReasons = data as BPCReasonMaster[];
      },
      (err) => {
        console.error(err);
      }
    );
  }

  GetAllPODByPartnerID(): void {
    this._PODService.GetAllPODByPartnerID(this.currentUserName).subscribe(
      (data) => {
        this.AllPODHeaders = data as BPCPODHeader[];
        if (this.AllPODHeaders && this.AllPODHeaders.length) {
          this.LoadSelectedPOD(this.AllPODHeaders[0]);
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  GetPODByInvAndPartnerID(): void {
    this._PODService.GetPODByInvAndPartnerID(this.SelectedInvoiceNumber, this.currentUserName).subscribe(
      (data) => {
        const pod = data as BPCPODHeader;
        this.doc = pod.DocNumber
        console.log("doc", this.doc)
        if (pod) {
          this.LoadSelectedPOD(pod);
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }


  LoadSelectedPOD(seletedPOD: BPCPODHeader): void {
    this.SelectedPODHeader = seletedPOD;
    this.SelectedPODView.InvoiceNumber = this.SelectedPODHeader.InvoiceNumber;
    this.SelectedInvoiceNumber = this.SelectedPODHeader.InvoiceNumber;
    this.GetPODItemsByPOD();
    this.SetPODHeaderValues();
 
  }

  GetPODItemsByPOD(): void {
    this.IsProgressBarVisibile = true;
    this._PODService.GetPODItemsByPOD(this.SelectedPODHeader.InvoiceNumber).subscribe(
      (data) => {

        this.IsProgressBarVisibile = false;
        this.SelectedPODView.PODItems = data as BPCPODItem[];
        this.ClearFormArray(this.PODItemFormArray);

        if (this.SelectedPODView.PODItems && this.SelectedPODView.PODItems.length) {
          this.SelectedPODView.PODItems.forEach(x => {
            this.InsertPODItemsFormGroup(x);
          });
        }
       
      },
      (err) => {
        this.IsProgressBarVisibile = true;
        console.error(err);
      }
    );
  }


  SetPODHeaderValues(): void {
    this.PODFormGroup.get('TruckNumber').patchValue(this.SelectedPODHeader.TruckNumber);
    this.PODFormGroup.get('DocNumber').patchValue(this.SelectedPODHeader.DocNumber);
    this.PODFormGroup.get('VessleNumber').patchValue(this.SelectedPODHeader.VessleNumber);
    this.PODFormGroup.get('InvoiceNumber').patchValue(this.SelectedPODHeader.InvoiceNumber);
    this.PODFormGroup.get('InvoiceDate').patchValue(this.SelectedPODHeader.InvoiceDate);
    this.PODFormGroup.get('Transporter').patchValue(this.SelectedPODHeader.Transporter);
    this.PODFormGroup.get('Amount').patchValue(this.SelectedPODHeader.Amount);
    this.PODFormGroup.get('Currency').patchValue(this.SelectedPODHeader.Currency);
    this.PODFormGroup.get('Status').patchValue(this.SelectedPODHeader.Status);

    // this.PODFormGroup.get('Status').disable();
    this.PODFormGroup.disable();

  }


  InsertPODItemsFormGroup(PODItem: BPCPODItem): void {
    const row = this._formBuilder.group({
      Item: [PODItem.Item],
      Material: [PODItem.Material],
      MaterialText: [PODItem.MaterialText],
      Qty: [PODItem.Qty],
      ReceivedQty: [PODItem.ReceivedQty, [Validators.required, Validators.pattern('^([1-9][0-9]*)([.][0-9]{1,3})?$')]],
      BreakageQty: [PODItem.BreakageQty, [Validators.max(PODItem.Qty), Validators.pattern('^([0-9][0-9]*)([.][0-9]{1,3})?$')]],
      MissingQty: [PODItem.MissingQty, [Validators.max(PODItem.Qty), Validators.pattern('^([0-9][0-9]*)([.][0-9]{1,3})?$')]],
      AcceptedQty: [PODItem.AcceptedQty, [Validators.required, Validators.max(PODItem.Qty), Validators.pattern('^([1-9][0-9]*)([.][0-9]{1,3})?$')]],
      Reason: [PODItem.Reason],
      Remarks: [PODItem.Remarks],
      AttachmentName: [PODItem.AttachmentName]
    });
    row.disable();
     if (this.SelectedPODHeader.Status == 'Submitted') {
      row.get('ReceivedQty').disable();
      row.get('MissingQty').disable();
      row.get('BreakageQty').disable();
      row.get('AcceptedQty').disable();
      row.get('Remarks').enable();
    }
    else{
      row.get('ReceivedQty').enable();
      row.get('BreakageQty').enable();
      row.get('MissingQty').enable();
      row.get('AcceptedQty').enable();
      row.get('Reason').enable();
      row.get('Remarks').enable();
    }
 
    this.PODItemFormArray.push(row);
    this.PODItemDataSource.next(this.PODItemFormArray.controls);

    // return row;
  }


  GetPODValues(): void {
    if (this.SelectedBPCFact) {
      this.SelectedPODHeader.Client = this.SelectedPODView.Client = this.SelectedBPCFact.Client;
      this.SelectedPODHeader.Company = this.SelectedPODView.Company = this.SelectedBPCFact.Company;
      this.SelectedPODHeader.Type = this.SelectedPODView.Type = this.SelectedBPCFact.Type;
      this.SelectedPODHeader.PatnerID = this.SelectedPODView.PatnerID = this.SelectedBPCFact.PatnerID;
    }
    this.SelectedPODHeader.TruckNumber = this.SelectedPODView.TruckNumber = this.PODFormGroup.get('TruckNumber').value;
    this.SelectedPODHeader.VessleNumber = this.SelectedPODView.VessleNumber = this.PODFormGroup.get('VessleNumber').value;
    this.SelectedPODHeader.InvoiceNumber = this.SelectedPODView.InvoiceNumber = this.PODFormGroup.get('InvoiceNumber').value;
    this.SelectedPODHeader.InvoiceDate = this.SelectedPODView.InvoiceDate = this.PODFormGroup.get('InvoiceDate').value;
    this.SelectedPODHeader.Transporter = this.SelectedPODView.Transporter = this.PODFormGroup.get('Transporter').value;
    this.SelectedPODHeader.Amount = this.SelectedPODView.Amount = this.PODFormGroup.get('Amount').value;
    this.SelectedPODHeader.Currency = this.SelectedPODView.Currency = this.PODFormGroup.get('Currency').value;
    // this.SelectedPODHeader.DocNumber = this.SelectedPODView.DocNumber = this.SelectedInvoiceNumber ? this.SelectedInvoiceNumber : this.SelectedPODHeader.DocNumber;
    this.SelectedPODHeader.DocNumber = this.SelectedPODView.DocNumber = this.SelectedPODHeader.DocNumber;

    this.SelectedPODHeader.Status = this.SelectedPODView.Status = this.PODFormGroup.get('Status').value;
    this.SelectedPODHeader.Client = this.SelectedPODView.Client = this.SelectedPODHeader.Client;
    this.SelectedPODHeader.Company = this.SelectedPODView.Company = this.SelectedPODHeader.Company;
    this.SelectedPODHeader.Type = this.SelectedPODView.Type = this.SelectedPODHeader.Type;
    this.SelectedPODHeader.PatnerID = this.SelectedPODView.PatnerID = this.SelectedPODHeader.PatnerID;
  }

  calculateDiff(sentDate): number {
    const dateSent: Date = new Date(sentDate);
    const currentDate: Date = new Date();
    return Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) -
      Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
  }

  GetPODItemValues(): void {
    this.SelectedPODView.PODItems = [];
    const PODItemFormArray = this.PODItemFormGroup.get('PODItems') as FormArray;
    PODItemFormArray.controls.forEach((x, i) => {
      const item: BPCPODItem = new BPCPODItem();
      if (this.SelectedBPCFact) {
        item.Client = this.SelectedBPCFact.Client;
        item.Company = this.SelectedBPCFact.Company;
        item.Type = this.SelectedBPCFact.Type;
        item.PatnerID = this.SelectedBPCFact.PatnerID;
      }
      item.Item = x.get('Item').value;
      item.Material = x.get('Material').value;
      item.MaterialText = x.get('MaterialText').value;
      item.Qty = x.get('Qty').value;
      item.ReceivedQty = x.get('ReceivedQty').value;

      item.BreakageQty = x.get('BreakageQty').value;
      item.MissingQty = x.get('MissingQty').value;
      item.AcceptedQty = x.get('AcceptedQty').value;
      item.Reason = x.get('Reason').value;
      item.Remarks = x.get('Remarks').value;
      item.AttachmentName = x.get('AttachmentName').value;

      item.Client = this.SelectedPODHeader.Client;
      item.Company = this.SelectedPODHeader.Company;
      item.Type = this.SelectedPODHeader.Type;
      item.PatnerID = this.SelectedPODHeader.PatnerID;
      this.SelectedPODView.PODItems.push(item);
    });
    //Qty checking
    // for()
    this.b = this.PODItemFormGroup.get("PODItems") as FormArray
    this.item = (<FormArray>this.PODItemFormGroup.get('PODItems')).at(0);
    PODItemFormArray.controls.forEach((x, i) => {
      // this.PODItemFormGroup.get('PODItems').get('ReceivedQty').hasError;
      (<FormArray>this.PODItemFormGroup.get('PODItems')).controls[i].markAsTouched();
    })
    //  this.item.value.forEach(element => {
    //       this.c=element;
    //       });
    console.log("c" + this.c);

    // this.PODItemFormArray.controls.forEach((element,index) => {
    //   this.a= Number(element.ReceivedQty)+Number(element.MissingQty);
    //   if(this.a!=element.Qty){
    //     this.PODItemFormGroup.controls[index].get('ReceivedQty').markAsTouched
    // this.b= this.PODItemFormGroup.get('ReceivedQty').value
    //     console.log("b"+this.b)
    //         }
    // });
    // this.recive=Number(item.ReceivedQty)


    //
  }
  GetPODItemAttachments(): void {
    if (this.fileToUploadList.length && this.SelectedPODView.PODItems.length) {
      this.fileToUploadList = this.fileToUploadList.filter(x => this.SelectedPODView.PODItems.some(y => x.name === y.AttachmentName));
    }
  }
  CheckForNonZeroMissingQty(): boolean {
    let NonZero = false;
    this.SelectedPODView.PODItems.forEach(x => {
      if (x.MissingQty > 0) {
        NonZero = true;
      }
    });
    return NonZero;
  }



  SaveClicked(): void {
    this.PODFormGroup.enable();
    if (this.PODFormGroup.valid) {
      if (!this.isWeightError) {
        if (this.PODItemFormGroup.valid) {
          this.GetPODValues();
          this.GetPODItemValues();
          this.GetPODItemAttachments();
          this.SelectedPODHeader.Status = this.SelectedPODView.Status = 'Partially Accepted';
          this.SetActionToOpenConfirmation('Save');

        } else {
          this.ShowValidationErrors(this.PODItemFormGroup);
        }
      }

    } else {
      this.ShowValidationErrors(this.PODFormGroup);
    }
  }
  Qty(event) {
    const PODItemFormArray = this.PODItemFormGroup.get('PODItems') as FormArray;
    PODItemFormArray.controls.forEach((x, i) => {
      console.log(event)
      this.a = Number(this.PODItemFormArray.controls[i].get('ReceivedQty').value);
      this.b = Number(this.PODItemFormArray.controls[i].get('MissingQty').value);
      this.c = this.a + this.b;
      this.Qtty = this.PODItemFormArray.controls[i].get('Qty').value
      if (this.Qtty != this.c) {
        if (this.Qtty != this.c) {
          this.PODItemFormArray.controls[i].get('ReceivedQty').setErrors({ qty1: true })
          this.PODItemFormArray.controls[i].get('MissingQty').setErrors({ out: true })
        }
      }


      console.log(this.PODItemFormArray)
      if (this.Qtty != this.c) {
        this.PODItemFormArray.controls[i].get('MissingQty').setErrors({ miss: true })
        this.PODItemFormArray.controls[i].get('ReceivedQty').setErrors({ recive: true })
      }
      if (this.Qtty == this.c) {
        this.PODItemFormArray.controls[i].get('MissingQty').setErrors(null)
        this.PODItemFormArray.controls[i].get('ReceivedQty').setErrors(null)
      }
      this.d = Number(this.PODItemFormArray.controls[i].get('BreakageQty').value);
      this.e = Number(this.PODItemFormArray.controls[i].get('AcceptedQty').value);
      this.f = this.d + this.e;
      this.recive = this.PODItemFormArray.controls[i].get('ReceivedQty').value
      if (this.recive != this.f) {
        if (this.recive != this.f)
          this.PODItemFormArray.controls[i].get('BreakageQty').setErrors({ invalid: true })
        console.log(this.PODItemFormArray)
        this.PODItemFormArray.controls[i].get('AcceptedQty').setErrors({ invalid: true })

        if (this.PODItemFormArray.controls[i].get('ReceivedQty').value != this.f) {

          console.log(this.PODItemFormArray)
          this.PODItemFormArray.controls[i].get('AcceptedQty').setErrors({ invalid: true })
          this.PODItemFormArray.controls[i].get('BreakageQty').setErrors({ invalid: true })
        }

        //  this.PODItemFormArray.controls[i].get('ReceivedQty').('required');
      }
      if (this.a == this.f) {
        this.PODItemFormArray.controls[i].get('AcceptedQty').setErrors(null)
        this.PODItemFormArray.controls[i].get('BreakageQty').setErrors(null)
      }
    })
  }
  SubmitClicked(): void {
    this.recivedStatus1_eq = 0;
    this.recivedStatus2_noteq = 0;
    const PODItemFormArray = this.PODItemFormGroup.get('PODItems') as FormArray;

    PODItemFormArray.controls.forEach((x, i) => {
      // this.PODItemFormGroup.get('PODItems').get('ReceivedQty').hasError;
      //  (<FormArray>this.PODItemFormGroup.get('PODItems')).controls[i].markAsTouched();
      //  (<FormArray>this.PODItemFormGroup.get('PODItems')).controls[i].setErrors;
      //  this.PODItemFormArray.controls[i].get('ReceivedQty').markAsTouched();
      this.a = Number(this.PODItemFormArray.controls[i].get('ReceivedQty').value);
      this.b = Number(this.PODItemFormArray.controls[i].get('MissingQty').value);
      this.c = this.a + this.b;
      this.Qtty = this.PODItemFormArray.controls[i].get('Qty').value
      if (this.Qtty != this.c) {
        if (this.Qtty != this.c) {
          this.PODItemFormArray.controls[i].get('ReceivedQty').setErrors({ qty1: true })
          this.PODItemFormArray.controls[i].get('MissingQty').setErrors({ out: true })
        }


        console.log(this.PODItemFormArray)
        if (this.PODItemFormArray.controls[i].get('Qty').value == this.c)
          this.PODItemFormArray.controls[i].get('MissingQty').setErrors({ miss: true })
        this.PODItemFormArray.controls[i].get('ReceivedQty').setErrors({ recive: true })
      }

      //  .setValidators( [Validators.max(this.a+this.b),Validators.min(this.a+this.b)])
      console.log(this.PODItemFormArray)
      this.d = Number(this.PODItemFormArray.controls[i].get('BreakageQty').value);
      this.e = Number(this.PODItemFormArray.controls[i].get('AcceptedQty').value);
      this.f = this.d + this.e;
      this.recive = this.PODItemFormArray.controls[i].get('ReceivedQty').value
      if (this.recive != this.f) {
        if (this.recive != this.f)
          this.PODItemFormArray.controls[i].get('BreakageQty').setErrors({ invalid: true })
        console.log(this.PODItemFormArray)
        this.PODItemFormArray.controls[i].get('AcceptedQty').setErrors({ invalid: true })

        if (this.PODItemFormArray.controls[i].get('ReceivedQty').value == this.f)

          console.log(this.PODItemFormArray)
        this.PODItemFormArray.controls[i].get('AcceptedQty').setErrors({ invalid: true })
        this.PODItemFormArray.controls[i].get('BreakageQty').setErrors({ invalid: true })
        //  this.PODItemFormArray.controls[i].get('ReceivedQty').('required');
      }
      if ((this.PODItemFormArray.controls[i].get('Qty').value) == (this.PODItemFormArray.controls[i].get('AcceptedQty').value)) {
        this.recivedStatus1_eq = this.recivedStatus1_eq + 1
      }
      else if ((this.PODItemFormArray.controls[i].get('Qty').value) != (this.PODItemFormArray.controls[i].get('AcceptedQty').value)) {
        this.recivedStatus2_noteq = this.recivedStatus2_noteq + 1
      }
    })
    // if (this.recivedStatus2_noteq >= 1) {
    //   this.Recived_status = "40"
    // }
    // else if (this.recivedStatus2_noteq == 0) {
    //   this.Recived_status = "50"
    // }
    console.log("   this.recivedStatus1_eq", this.recivedStatus1_eq)
    console.log("   this.recivedStatus2_noteq", this.recivedStatus2_noteq)
    this.PODFormGroup.enable();
    if (this.PODFormGroup.valid) {
      if (!this.isWeightError) {
        if (this.PODItemFormGroup.valid) {
          this.GetPODValues();
          this.GetPODItemValues();
          this.GetPODItemAttachments();
          this.SelectedPODHeader.Status = this.SelectedPODView.Status = 'Submitted';
          this.SetActionToOpenConfirmation('Submit');

        } else {
          this.ShowValidationErrors(this.PODItemFormGroup);
        }
      }

    } else {
      this.ShowValidationErrors(this.PODFormGroup);
    }
  }
  DeleteClicked(): void {
    if (this.SelectedPODHeader.InvoiceNumber) {
      const Actiontype = 'Delete';
      const Catagory = 'POD';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    }
  }
  SetActionToOpenConfirmation(Actiontype: string): void {
    // if (this.SelectedPODHeader.InvoiceNumber) {
    //     const Catagory = 'POD';
    //     this.OpenConfirmationDialog(Actiontype, Catagory);
    // } else {
    //     const Catagory = 'POD';
    //     this.OpenConfirmationDialog(Actiontype, Catagory);
    // }
    const Catagory = 'POD';
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
            if (this.SelectedPODHeader.InvoiceNumber) {
              this.UpdatePOD(Actiontype);
            } else {
              this.CreatePOD(Actiontype);
            }
          } else if (Actiontype === 'Delete') {
            this.DeletePOD();
          }
        } else {
          this.PODFormGroup.disable();
        }
      },
      () => {
        this.PODFormGroup.disable();
      });
  }


  CreatePOD(Actiontype: string): void {

    // this.GetPODValues();
    // this.GetBPPODSubItemValues();
    // this.SelectedPODView.CreatedBy = this.authenticationDetails.UserID.toString();

    this.IsProgressBarVisibile = true;
    this._PODService.CreatePOD(this.SelectedPODView).subscribe(
      (data) => {
        this.SelectedPODHeader.InvoiceNumber = (data as BPCPODHeader).InvoiceNumber;
        if (this.fileToUploadList && this.fileToUploadList.length) {
          this.AddPODItemAttachment(Actiontype);
        } else {
          this.ResetControl();
          this.notificationSnackBarComponent.openSnackBar(`POD ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
          this.IsProgressBarVisibile = false;
          this.GetPODBasedOnCondition();
        }
      },
      (err) => {
        this.showErrorNotificationSnackBar(err);
      }
    );
  }

  AddPODItemAttachment(Actiontype: string): void {
    this._PODService.AddPODItemAttachment(this.SelectedPODHeader.DocNumber, this.SelectedPODHeader.InvoiceNumber, this.currentUserID.toString(), this.fileToUploadList).subscribe(
      (dat) => {
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar(`POD ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetPODBasedOnCondition();
      },
      (err) => {
        this.showErrorNotificationSnackBar(err);
      }
    );
  }

  showErrorNotificationSnackBar(err: any): void {
    console.error(err);
    this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    this.IsProgressBarVisibile = false;
  }

  UpdatePOD(Actiontype: string): void {
    // this.GetPODValues();
    // this.GetBPPODSubItemValues();
    // this.SelectedBPPODView.TransID = this.SelectedBPPOD.TransID;
    // this.SelectedPODView.ModifiedBy = this.authenticationDetails.UserID.toString();
    // if(Actiontype=="Submit"){

    // }
    this.IsProgressBarVisibile = true;

    this._PODService.UpdatePOD(this.SelectedPODView,).subscribe(
      (data) => {

        this.UpdateSO();
        this.SelectedPODHeader.InvoiceNumber = (data as BPCPODHeader).InvoiceNumber;

        if (this.fileToUploadList && this.fileToUploadList.length) {
          this.AddPODItemAttachment(Actiontype);
        } else {
          this.ResetControl();
          this.notificationSnackBarComponent.openSnackBar(`POD ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
          this.IsProgressBarVisibile = false;
          this.GetPODBasedOnCondition();
        }
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  UpdateSO() {
    this.SelectedPODView.Recived_status = this.Recived_status
    this.SelectedPODView.Doc = this.doc
    this._PODService.UpdateSO(this.SelectedPODView,).subscribe(
      (data) => {
        console.log(data)
      },
      (err) => {
        console.error(err);
      }
    );
  }

  DeletePOD(): void {
    this.GetPODValues();
    // this.SelectedBPPOD.ModifiedBy = this.authenticationDetails.userID.toString();
    this.IsProgressBarVisibile = true;
    this._PODService.DeletePOD(this.SelectedPODHeader).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('POD deleted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetPODBasedOnCondition();
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

  AmountSelected(): void {
    const GrossWeightVAL = +this.PODFormGroup.get('GrossWeight').value;
    const AmountVAL = + this.PODFormGroup.get('Amount').value;
    if (GrossWeightVAL < AmountVAL) {
      this.isWeightError = true;
    } else {
      this.isWeightError = false;
    }
  }
  CheckPODItemAttachment(index: number): void {
    const fileName = this.PODItemFormArray.controls[index].get('AttachmentName').value;
    if (fileName) {
      const file = this.fileToUploadList.filter(x => x.name === fileName)[0];
      if (file && file.size) {
        const blob = new Blob([file], { type: file.type });
        this.OpenPODItemAttachmentDialog(index, blob, fileName);
      } else {
        this.IsProgressBarVisibile = true;
        this._PODService.DowloandPODItemAttachment(fileName).subscribe(
          data => {
            if (data) {
              let fileType = 'image/jpg';
              fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
                fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
                  fileName.toLowerCase().includes('.png') ? 'image/png' :
                    fileName.toLowerCase().includes('.gif') ? 'image/gif' :
                      fileName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
              const blob = new Blob([data], { type: fileType });
              this.OpenPODItemAttachmentDialog(index, blob, fileName);
              // this.OpenAttachmentDialog(fileName, blob);
            }
            this.IsProgressBarVisibile = false;
          },
          error => {
            console.error(error);
            this.IsProgressBarVisibile = false;
          }
        );
      }
    } else {
      // const el: HTMLElement = this.fileInput1.nativeElement;
      // el.click();
      this.OpenPODItemAttachmentDialog(index);
    }
  }
  OpenPODItemAttachmentDialog(index: number, blob?: Blob, fileName?: string): void {
    let dialogConfig: MatDialogConfig;
    if (blob && fileName) {
      const file = new File([blob], fileName);
      dialogConfig = {
        data: file,
        panelClass: 'pod-item-attach-dialog'
      };
    } else {
      dialogConfig = {
        panelClass: 'pod-item-attach-dialog'
      };
    }
    const dialogRef = this.dialog.open(PODItemAttachmentDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          const result1 = result as File;
          if (result1) {
            this.fileToUpload = result1;
            this.fileToUploadList.push(result1);
            this.PODItemFormArray.controls[index].get('AttachmentName').patchValue(this.fileToUpload.name);
          }
        }
      });
  }
  handleFileInput(evt, index: number): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.fileToUpload = evt.target.files[0];
      this.fileToUploadList.push(this.fileToUpload);
      this.PODItemFormArray.controls[index].get('AttachmentName').patchValue(this.fileToUpload.name);
    }
  }
  MenuBookClicked(index: number): void {
    // console.log(index);
    const Notess = this.PODItemFormArray.controls[index].get('Remarks').value;
    this.OpenNotesDialog(index, Notess);
  }
  OpenNotesDialog(index: number, Notess: any): void {
    const dialogConfig: MatDialogConfig = {
      data: Notess,
      panelClass: 'notes-dialog'
    };
    const dialogRef = this.dialog.open(NotesDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          // console.log(result);
          this.PODItemFormArray.controls[index].get('Remarks').patchValue(result);
        }
      });
  }

  ViewPODItemAttachment(index: number): void {
    const fileName = this.PODItemFormArray.controls[index].get('AttachmentName').value;
    const file = this.fileToUploadList.filter(x => x.name === fileName)[0];
    if (file && file.size) {
      const blob = new Blob([file], { type: file.type });
      this.OpenAttachmentDialog(fileName, blob);
    } else {
      this.IsProgressBarVisibile = true;
      this._PODService.DowloandPODItemAttachment(fileName).subscribe(
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




}

