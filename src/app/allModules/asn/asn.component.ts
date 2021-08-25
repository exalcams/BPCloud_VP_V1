import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { AuthenticationDetails, UserWithRole, AppUsage } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl, ValidationErrors } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { ASNService } from 'app/services/asn.service';
import { ShareParameterService } from 'app/services/share-parameters.service';
import {
    BPCASNHeader, BPCASNItem, DocumentCenter, BPCASNView, BPCInvoiceAttachment,
    BPCCountryMaster, BPCCurrencyMaster, BPCDocumentCenterMaster, BPCASNPack, ASNItemXLSX, BPCASNFieldMaster, BPCASNItemBatch, BPCASNItemView, BPCASNItemSES, ASNListView
} from 'app/models/ASN';
import { BehaviorSubject } from 'rxjs';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { FuseConfigService } from '@fuse/services/config.service';
import { FactService } from 'app/services/fact.service';
import { VendorMasterService } from 'app/services/vendor-master.service';
import { POService } from 'app/services/po.service';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { BPCOFHeader, BPCOFSubconView, BPCOFItemView, ActionLog } from 'app/models/OrderFulFilment';
import { AttachmentDetails } from 'app/models/task';
import { DatePipe } from '@angular/common';
import { SubconService } from 'app/services/subcon.service';
import { ASNReleaseDialogComponent } from 'app/notifications/asnrelease-dialog/asnrelease-dialog.component';
import { ExcelService } from 'app/services/excel.service';
import * as XLSX from 'xlsx';
import { AsnPrintDialogComponent } from './asn-print-dialog/asn-print-dialog.component';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { ASNItemBatchDialogComponent } from './asnitem-batch-dialog/asnitem-batch-dialog.component';
import { NotificationDialog1Component } from 'app/notifications/notification-dialog1/notification-dialog1.component';
import { ASNItemServiceDialogComponent } from './asnitem-service-dialog/asnitem-service-dialog.component';
import { AuthService } from 'app/services/auth.service';
import { GateService } from 'app/services/gate.service';
import * as SecureLS from 'secure-ls';

@Component({
    selector: 'app-asn',
    templateUrl: './asn.component.html',
    styleUrls: ['./asn.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class ASNComponent implements OnInit {
    BGClassName: any;
    fuseConfig: any;
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserName: string;
    currentUserRole: string;
    MenuItems: string[];
    notificationSnackBarComponent: NotificationSnackBarComponent;
    IsProgressBarVisibile: boolean;
    AllASNHeaders: BPCASNHeader[] = [];
    ASNFormGroup: FormGroup;
    ASNItemFormGroup: FormGroup;
    ASNPackFormGroup: FormGroup;
    InvoiceDetailsFormGroup: FormGroup;
    IsInvoiceDetailsFormGroupEnabled: boolean;
    DocumentCenterFormGroup: FormGroup;
    AllUserWithRoles: UserWithRole[] = [];
    SelectedDocNumber: string;
    PO: BPCOFHeader;
    ASNQty_count: any = 0;
    ASNQty_count1: any = 0;
    POItems: BPCOFItemView[] = [];
    SelectedASNHeader: BPCASNHeader;
    SelectedASNNumber: string;
    SelectedASNView: BPCASNView;
    SelectedASNListView: ASNListView;
    @ViewChild('noOfPacks') noOfPacks: ElementRef;
    @ViewChild('volumetricWeight') volumetricWeight: ElementRef;
    ASNItems: BPCASNItem[] = [];
    ASNItemDisplayedColumns: string[] = [
        'Item',
        'Material',
        'MaterialText',
        'UnitPrice',
        'DeliveryDate',
        'HSN',
        'OrderedQty',
        'GRQty',
        'PipelineQty',
        'OpenQty',
        'ASNQty',
        'Batch',
        'SES',
        // 'ManufactureDate',
        // 'ExpiryDate'
    ];
    ASNItemFormArray: FormArray = this._formBuilder.array([]);
    ASNItemDataSource = new BehaviorSubject<AbstractControl[]>([]);
    @ViewChild(MatPaginator) asnItemPaginator: MatPaginator;
    @ViewChild(MatSort) asnItemSort: MatSort;


    ASNPacks: BPCASNItem[] = [];
    ASNPackDisplayedColumns: string[] = [
        'PackageID',
        'ReferenceNumber',
        'Dimension',
        'NetWeight',
        // 'NetWeightUOM',
        'GrossWeight',
        'GrossWeightUOM',
        'VolumetricWeight',
        'VolumetricWeightUOM'
    ];
    ASNPackFormArray: FormArray = this._formBuilder.array([]);
    ASNPackDataSource = new BehaviorSubject<AbstractControl[]>([]);
    @ViewChild(MatPaginator) asnPackPaginator: MatPaginator;
    @ViewChild(MatSort) asnPackSort: MatSort;


    invoiceAttachment: File;
    invAttach: BPCInvoiceAttachment;
    fileToUpload: File;
    fileToUploadList: File[] = [];
    math = Math;
    minDate: Date;
    maxDate: Date;
    AllDocumentCenters: DocumentCenter[] = [];
    DocumentCenterDisplayedColumns: string[] = [
        'DocumentType',
        'DocumentTitle',
        'Filename',
        'Action'
    ];
    DocumentCenterDataSource: MatTableDataSource<DocumentCenter>;
    @ViewChild(MatPaginator) DocumentCenterPaginator: MatPaginator;
    @ViewChild(MatSort) DocumentCenterSort: MatSort;

    selection = new SelectionModel<any>(true, []);
    searchText = '';

    AllCountries: BPCCountryMaster[] = [];
    AllCurrencies: BPCCurrencyMaster[] = [];
    AllDocumentCenterMaster: BPCDocumentCenterMaster[] = [];
    isWeightError: boolean;
    isPOBasicPriceError: boolean;
    @ViewChild('fileInput1') fileInput: ElementRef<HTMLElement>;
    selectedDocCenterMaster: BPCDocumentCenterMaster;
    ArrivalDateInterval: number;
    SubconViews: BPCOFSubconView[] = [];
    arrayBuffer: any;
    ASNItemXLSXs: ASNItemXLSX[] = [];
    IsAtleastOneASNQty: boolean;
    IsOneSERItem: boolean;
    AllASNFieldMaster: BPCASNFieldMaster[] = [];

    IsShipmentNotRelevant = false;
    IsPriceNotMatched = false;
    DocumentType: string;
    SelectedDocType: string;
    ActionLog: any;
    SecretKey: string;
    SecureStorage: SecureLS;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _masterService: MasterService,
        private _FactService: FactService,
        private _POService: POService,
        private _ASNService: ASNService,
        private _authservice: AuthService,
        private _subConService: SubconService,
        private _vendorMasterService: VendorMasterService,
        private _excelService: ExcelService,
        private _shareParameterService: ShareParameterService,
        private _gateService: GateService,
        private _datePipe: DatePipe,
        private _route: ActivatedRoute,
        private _router: Router,
        public snackBar: MatSnackBar,
        private dialog: MatDialog,
        private _formBuilder: FormBuilder) {
        this.SecretKey = this._authservice.SecretKey;
        this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.authenticationDetails = new AuthenticationDetails();
        this.IsProgressBarVisibile = false;
        this.PO = new BPCOFHeader();
        this.SelectedASNHeader = new BPCASNHeader();
        this.SelectedASNView = new BPCASNView();
        this.SelectedASNNumber = '';
        this.invAttach = new BPCInvoiceAttachment();
        this.minDate = new Date();
        this.minDate.setDate(this.minDate.getDate() + 1);
        this.maxDate = new Date();
        this.isWeightError = false;
        this.isPOBasicPriceError = false;
        this.selectedDocCenterMaster = new BPCDocumentCenterMaster();
        this.ArrivalDateInterval = 1;
        this.IsAtleastOneASNQty = false;
        this.IsOneSERItem = true;
        this.IsInvoiceDetailsFormGroupEnabled = true;
        this.DocumentType = '';
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
            this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
            if (this.MenuItems.indexOf('ASN') < 0) {
                if (this.currentUserRole !== 'GateUser') {
                    this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
                    );
                    this._router.navigate(['/auth/login']);
                }
            }

        } else {
            this._router.navigate(['/auth/login']);
        }
        this._route.queryParams.subscribe(params => {
            this.SelectedDocNumber = params['id'];
            this.SelectedDocType = params['type'];

        });

        if (this.currentUserRole === 'GateUser') {
            this.SelectedASNListView = this._shareParameterService.GetASNListView();
            if (this.SelectedASNListView) {
                this.SelectedDocNumber = this.SelectedASNListView.DocNumber;
                this.SelectedASNNumber = this.SelectedASNListView.ASNNumber;
            } else {
                this.notificationSnackBarComponent.openSnackBar('No ASN Selected', SnackBarStatus.danger);
                this._router.navigate(['/orderfulfilment/asnlist']);
            }
        }
        this.CreateAppUsage();
        this.InitializeASNFormGroup();
        this.GetAllASNFieldMaster();
        this.InitializeASNItemFormGroup();
        this.InitializeASNPackFormGroup();
        this.InitializeInvoiceDetailsFormGroup();
        this.InitializeDocumentCenterFormGroup();
        this.GetAllBPCCountryMasters();
        this.GetAllBPCCurrencyMasters();
        this.GetAllDocumentCenterMaster();
        this.GetASNBasedOnCondition();
    }
    CreateAppUsage(): void {
        const appUsage: AppUsage = new AppUsage();
        appUsage.UserID = this.currentUserID;
        appUsage.AppName = 'ASN';
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
    InitializeASNFormGroup(): void {
        this.ASNFormGroup = this._formBuilder.group({
            TransportMode: ['Road', Validators.required],
            VessleNumber: ['', Validators.required],
            AWBNumber: ['', Validators.required],
            AWBDate: [new Date(), Validators.required],
            NetWeight: ['', [Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]],
            // NetWeightUOM: ['KG', Validators.required],
            GrossWeight: ['', [Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]],
            GrossWeightUOM: ['KG', Validators.required],
            VolumetricWeight: ['', [Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]],
            VolumetricWeightUOM: ['KG'],
            DepartureDate: [new Date(), Validators.required],
            ArrivalDate: [this.minDate, Validators.required],
            NumberOfPacks: ['1', [Validators.pattern('^[1-9][0-9]*$')]],
            CountryOfOrigin: ['IND', Validators.required],
            ShippingAgency: [''],
            BillOfLading: ['', Validators.maxLength(20)],
            TransporterName: ['', Validators.maxLength(40)],
            AccessibleValue: ['', [Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,2})?$')]],
            ContactPerson: ['', Validators.maxLength(40)],
            ContactPersonNo: ['', [Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]],
            Field1: [''],
            Field2: [''],
            Field3: [''],
            Field4: [''],
            Field5: [''],
            Field6: [''],
            Field7: [''],
            Field8: [''],
            Field9: [''],
            Field10: [''],
        });
        // this.DynamicallyAddAcceptedValidation();
        this.RefreshPackages();
    }
    SetInitialValueForASNFormGroup(): void {
        this.ASNFormGroup.get('TransportMode').patchValue('Road');
        this.ASNFormGroup.get('AWBDate').patchValue(new Date());
        // this.ASNFormGroup.get('NetWeightUOM').patchValue('KG');
        this.ASNFormGroup.get('GrossWeightUOM').patchValue('KG');
        this.ASNFormGroup.get('VolumetricWeightUOM').patchValue('KG');
        this.ASNFormGroup.get('DepartureDate').patchValue(new Date());
        this.ASNFormGroup.get('ArrivalDate').patchValue(this.minDate);
        this.ASNFormGroup.get('CountryOfOrigin').patchValue('IND');
        this.ASNFormGroup.get('NumberOfPacks').patchValue('1');
        this.RefreshPackages();
    }
    InitializeASNItemFormGroup(): void {
        this.ASNItemFormGroup = this._formBuilder.group({
            ASNItems: this.ASNItemFormArray
        });
    }
    InitializeASNPackFormGroup(): void {
        this.ASNPackFormGroup = this._formBuilder.group({
            ASNPacks: this.ASNPackFormArray
        });
    }
    InitializeInvoiceDetailsFormGroup(): void {
        this.InvoiceDetailsFormGroup = this._formBuilder.group({
            InvoiceNumber: ['', [Validators.required, Validators.minLength(1), Validators.maxLength(16)]],
            POBasicPrice: ['', [Validators.required, Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,2})?$')]],
            TaxAmount: ['', [Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,2})?$')]],
            InvoiceAmount: ['', [Validators.required, Validators.pattern('^([0-9]{0,10})([.][0-9]{1,2})?$')]],
            InvoiceAmountUOM: ['', Validators.required],
            InvoiceDate: ['', Validators.required],
            InvoiceAttachment: [''],
        });
        this.InvoiceDetailsFormGroup.get('POBasicPrice').disable();
        // this.InvoiceDetailsFormGroup.get('POBasicPrice').valueChanges.subscribe(
        //     () => {
        //         this.CalculateInvoiceAmount();
        //     }
        // );
        // this.DynamicallyAddAcceptedValidation();
    }

    InitializeDocumentCenterFormGroup(): void {
        this.DocumentCenterFormGroup = this._formBuilder.group({
            DocumentType: ['', Validators.required],
            DocumentTitle: ['', Validators.required],
            Filename: [''],
        });
        // this.DynamicallyAddAcceptedValidation();
    }

    ResetControl(): void {
        this.SelectedASNHeader = new BPCASNHeader();
        this.SelectedASNView = new BPCASNView();
        this.SelectedASNNumber = '';
        this.ResetASNFormGroup();
        this.ResetASNPacksFormGroup();
        this.SetInitialValueForASNFormGroup();
        this.InitializeASNFormGroupByFieldMaster();
        this.ResetInvoiceDetailsFormGroup();
        this.ResetDocumentCenterFormGroup();
        this.ResetAttachments();
        this.AllDocumentCenters = [];
        this.DocumentCenterDataSource = new MatTableDataSource(this.AllDocumentCenters);
        this.isWeightError = false;
        this.isPOBasicPriceError = false;
        this.selectedDocCenterMaster = new BPCDocumentCenterMaster();
        this.IsAtleastOneASNQty = false;
        this.IsInvoiceDetailsFormGroupEnabled = true;
    }

    ResetASNFormGroup(): void {
        this.ResetFormGroup(this.ASNFormGroup);
    }
    ResetInvoiceDetailsFormGroup(): void {
        this.ResetFormGroup(this.InvoiceDetailsFormGroup);
        this.InvoiceDetailsFormGroup.get('POBasicPrice').disable();
    }
    ResetDocumentCenterFormGroup(): void {
        this.ResetFormGroup(this.DocumentCenterFormGroup);
    }
    ResetASNPacksFormGroup(): void {
        this.ResetFormGroup(this.ASNPackFormGroup);
        this.ClearFormArray(this.ASNPackFormArray);
        this.ASNPackDataSource.next(this.ASNPackFormArray.controls);
    }
    ResetFormGroup(formGroup: FormGroup): void {
        formGroup.reset();
        Object.keys(formGroup.controls).forEach(key => {
            formGroup.get(key).enable();
            formGroup.get(key).markAsUntouched();
        });
    }
    ClearASNItems(): void {
        this.ClearFormArray(this.ASNItemFormArray);
        this.ASNItemDataSource.next(this.ASNItemFormArray.controls);
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
    NoOfPacksEnterKeyDown(): boolean {
        this.noOfPacks.nativeElement.blur();
        this.volumetricWeight.nativeElement.focus();
        return true;
    }
    RefreshPackages(): void {
        const NoOfPacks = +this.ASNFormGroup.get('NumberOfPacks').value;
        const Remaing = NoOfPacks - this.SelectedASNView.ASNPacks.length;
        if (Remaing > 0) {
            for (let i = 0; i < Remaing; i++) {
                const pack: BPCASNPack = new BPCASNPack();
                pack.PackageID = (this.SelectedASNView.ASNPacks.length + 1).toString();
                this.SelectedASNView.ASNPacks.push(pack);
                this.InsertASNPacksFormGroup(pack);
            }
        }
        if (Remaing < 0) {
            const Remaining = this.math.abs(Remaing);
            for (let i = 0; i < Remaining; i++) {
                this.SelectedASNView.ASNPacks.pop();
                this.RemoveASNPacksFormGroup();
            }
        }
    }
    ShipmentNotRelevantChecked(completed: boolean): void {
        // this.CreateActionLogvalues("ShipmentNotRelevant");
        this.IsShipmentNotRelevant = completed;
        if (this.IsShipmentNotRelevant) {
            const aSNItemFormArray = this.ASNItemFormGroup.get('ASNItems') as FormArray;
            aSNItemFormArray.controls.forEach((x, i) => {
                x.get('ASNQty').patchValue(0);
            });
        }
    }
    GetASNBasedOnCondition(): void {
        if (this.currentUserRole === 'GateUser') {
            this.GetASNByDocAndASN();
        }
        else {
            if (this.SelectedDocNumber) {
                this.GetASNByDocAndPartnerID();
                this.GetPOByDocAndPartnerID(this.SelectedDocNumber);
                // this.GetPOItemsByDocAndPartnerID();
                this.GetArrivalDateIntervalByPOAndPartnerID();
            }
            else {
                this.GetAllASNByPartnerID();
            }
        }
    }

    TransportModeSelected(event): void {
        const selectedType = event.value;
        if (event.value) {
            // this.SelectedTask.Type = event.value;
        }
    }

    decimalOnly(event): boolean {

        console.log("event", event);
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
    Enable(index): void {
        this.ASNQty_count1 = 0;
        this.ASNItemFormArray.controls[index].get('ASNQty').setErrors({ qty: true });
        this.ASNItemFormArray.controls[index].get('ASNQty').markAsTouched();
        const aSNItemFormArray = this.ASNItemFormGroup.get('ASNItems') as FormArray;
        aSNItemFormArray.controls.forEach((x, i) => {
            const a = x.get('ASNQty').value;
            // console.log("eve",eve);

            if (x.get('ASNQty').value) {
                this.ASNQty_count1 = this.ASNQty_count1 + 1;
            }

        });

        if (this.ASNQty_count1 === 1) {

            this.ASNItemFormArray.controls.forEach((x, i) => {
                x.get('ASNQty').setErrors(null);
                x.get('ASNQty').markAsUntouched();
                // x.get('ASNQty').valid;

            });

        }
        else {
            this.ASNItemFormArray.controls[index].get('ASNQty').setErrors({ qty: true });
            this.ASNItemFormArray.controls[index].get('ASNQty').markAsTouched();
            this.ASNItemFormArray.controls.forEach((x, i) => {
                x.get('ASNQty').setErrors({ qty: true });
                x.get('ASNQty').markAsTouched();
            });
        }

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
                this.OpenAttachmentReplaceConfirmation(evt);
                // this.notificationSnackBarComponent.openSnackBar('Maximum one attachment is allowed, old is attachment is replaced', SnackBarStatus.warning);
            }
            else if (this.invAttach && this.invAttach.AttachmentName) {
                this.OpenAttachmentReplaceConfirmation(evt);
                // this.notificationSnackBarComponent.openSnackBar('Maximum one attachment is allowed, old is attachment is replaced', SnackBarStatus.warning);
            } else {
                this.invoiceAttachment = evt.target.files[0];
                this.invAttach = new BPCInvoiceAttachment();
            }
        }
    }
    OpenAttachmentReplaceConfirmation(evt): void {
        const dialogConfig: MatDialogConfig = {
            data: {
                Actiontype: 'Replace',
                Catagory: 'Attachment'
            },
            panelClass: 'confirmation-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
            result => {
                if (result) {
                    this.invoiceAttachment = evt.target.files[0];
                    this.invAttach = new BPCInvoiceAttachment();
                }
            });
    }
    handleFileInput(evt): void {
        if (evt.target.files && evt.target.files.length > 0) {
            const fil = evt.target.files[0] as File;
            if (fil.type.includes(this.selectedDocCenterMaster.Extension)) {
                const fileSize = this.math.round(fil.size / 1024);
                if (fileSize <= this.selectedDocCenterMaster.SizeInKB) {
                    this.fileToUpload = fil;
                    // this.fileToUploadList.push(this.fileToUpload);
                    this.DocumentCenterFormGroup.get('Filename').patchValue(this.fileToUpload.name);
                } else {
                    this.notificationSnackBarComponent.openSnackBar(`Maximum allowed file size is ${this.selectedDocCenterMaster.SizeInKB} KB only`, SnackBarStatus.danger);
                }
            } else {
                this.notificationSnackBarComponent.openSnackBar(`Please select only ${this.selectedDocCenterMaster.Extension} file`, SnackBarStatus.danger);
            }
        }
    }

    netWeightUnitSelected(event): void {

    }

    grossWeightUnitSelected(event): void {

    }

    VolumetricWeightUOMSelected(event): void {

    }

    CountryOfOriginSelected(event): void {

    }

    invoiceValueUnitSelected(event): void {

    }
    DepartureDateSelected(): void {
        const DepartureDateDVAL = this.ASNFormGroup.get('DepartureDate').value as Date;
        if (!this.SelectedASNView.ASNNumber) {
            this.ASNFormGroup.get('AWBDate').patchValue(DepartureDateDVAL);
        }
    }
    DocumentTypeSelected(event): void {
        if (event.value) {
            this.selectedDocCenterMaster = this.AllDocumentCenterMaster.filter(x => x.DocumentType === event.value)[0];
            if (this.selectedDocCenterMaster) {
                if (this.selectedDocCenterMaster.Mandatory) {
                    this.AddDocumentCenterFileValidator();
                } else {
                    this.RemoveDocumentCenterFileValidator();
                }
            }
        }
    }

    AddDocumentCenterFileValidator(): void {
        this.DocumentCenterFormGroup.get('Filename').setValidators(Validators.required);
        this.DocumentCenterFormGroup.get('Filename').updateValueAndValidity();
    }
    RemoveDocumentCenterFileValidator(): void {
        this.DocumentCenterFormGroup.get('Filename').clearValidators();
        this.DocumentCenterFormGroup.get('Filename').updateValueAndValidity();
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

    AddDocumentCenterToTable(): void {
        if (this.DocumentCenterFormGroup.valid) {
            // this.CreateActionLogvalues("AddDocumentCenter");
            const documentCenter = new DocumentCenter();
            documentCenter.DocumentType = this.DocumentCenterFormGroup.get('DocumentType').value;
            documentCenter.DocumentTitle = this.DocumentCenterFormGroup.get('DocumentTitle').value;
            if (this.fileToUpload) {
                documentCenter.Filename = this.fileToUpload.name;
                this.fileToUploadList.push(this.fileToUpload);
                this.fileToUpload = null;
            }
            if (!this.AllDocumentCenters || !this.AllDocumentCenters.length) {
                this.AllDocumentCenters = [];
            }
            this.AllDocumentCenters.push(documentCenter);
            this.DocumentCenterDataSource = new MatTableDataSource(this.AllDocumentCenters);
            this.ResetDocumentCenterFormGroup();
            this.selectedDocCenterMaster = new BPCDocumentCenterMaster();
        } else {
            this.ShowValidationErrors(this.DocumentCenterFormGroup);
        }
    }

    RemoveDocumentCenterFromTable(doc: DocumentCenter): void {
        // this.CreateActionLogvalues("Remove DocumentCenter");
        const index: number = this.AllDocumentCenters.indexOf(doc);
        if (index > -1) {
            this.AllDocumentCenters.splice(index, 1);
            const indexx = this.fileToUploadList.findIndex(x => x.name === doc.Filename);
            if (indexx > -1) {
                this.fileToUploadList.splice(indexx, 1);
            }
        }
        this.DocumentCenterDataSource = new MatTableDataSource(this.AllDocumentCenters);
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
    GetAllDocumentCenterMaster(): void {
        this._ASNService.GetAllDocumentCenterMaster().subscribe(
            (data) => {
                this.AllDocumentCenterMaster = data as BPCDocumentCenterMaster[];
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

    GetAllASNByPartnerID(): void {
        this._ASNService.GetAllASNByPartnerID(this.currentUserName).subscribe(
            (data) => {
                this.AllASNHeaders = data as BPCASNHeader[];
                if (this.AllASNHeaders && this.AllASNHeaders.length) {
                    this.LoadSelectedASN(this.AllASNHeaders[0]);
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }

    GetASNByDocAndASN(): void {
        this._ASNService.GetASNByDocAndASN(this.SelectedDocNumber, this.SelectedASNNumber).subscribe(
            (data) => {
                const result = data as BPCASNHeader;
                if (result) {
                    this.AllASNHeaders = [];
                    this.AllASNHeaders.push(result);
                    if (this.AllASNHeaders && this.AllASNHeaders.length) {
                        this.LoadSelectedASN(this.AllASNHeaders[0]);
                    }
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }

    GetASNByDocAndPartnerID(): void {
        this._ASNService.GetASNByDocAndPartnerID(this.SelectedDocNumber, this.currentUserName).subscribe(
            (data) => {
                this.AllASNHeaders = data as BPCASNHeader[];
            },
            (err) => {
                console.error(err);
            }
        );
    }
    GetPOByDocAndPartnerID(selectedDocNumber: string): void {
        this._POService.GetPOByDocAndPartnerID(selectedDocNumber, this.currentUserName).subscribe(
            (data) => {
                this.PO = data as BPCOFHeader;
                if (this.SelectedDocNumber) {
                    this.InvoiceDetailsFormGroup.get('InvoiceAmountUOM').patchValue(this.PO.Currency);
                }
                this.DocumentType = this.PO.DocType;
                if (this.PO && this.PO.DocType && this.PO.DocType.toLocaleLowerCase() === "subcon") {
                    this.GetSubconViewByDocAndPartnerID();
                }
                else if (this.SelectedDocNumber && !this.SelectedASNHeader.ASNNumber) {
                    this.GetPOItemsByDocAndPartnerID();
                }
                // this.GetPOItemsByDocAndPartnerID();
            },
            (err) => {
                console.error(err);
            }
        );
    }

    GetPOByDocAndPartnerID1(selectedDocNumber: string): void {
        if (selectedDocNumber) {
            this._POService.GetPOByDocAndPartnerID(selectedDocNumber, this.currentUserName).subscribe(
                (data) => {
                    const re = data as BPCOFHeader;
                    this.DocumentType = re.DocType;
                },
                (err) => {
                    console.error(err);
                }
            );
        }
    }

    GetPOItemsByDocAndPartnerID(): void {
        this._POService.GetPOItemViewsByDocAndPartnerID(this.SelectedDocNumber, this.currentUserName).subscribe(
            (data) => {
                console.log("items", data);
                this.POItems = data as BPCOFItemView[];
                this.ClearFormArray(this.ASNItemFormArray);
                if (this.POItems && this.POItems.length) {
                    this.SelectedASNHeader.Client = this.SelectedASNView.Client = this.POItems[0].Client;
                    this.SelectedASNHeader.Company = this.SelectedASNView.Company = this.POItems[0].Company;
                    this.SelectedASNHeader.Type = this.SelectedASNView.Type = this.POItems[0].Type;
                    this.SelectedASNHeader.PatnerID = this.SelectedASNView.PatnerID = this.POItems[0].PatnerID;
                    this.SelectedASNHeader.DocNumber = this.SelectedASNView.DocNumber = this.POItems[0].DocNumber;
                    this.POItems.forEach(poItem => {
                        if (poItem.OpenQty && poItem.OpenQty > 0) {
                            if (this.PO && this.PO.DocType && this.PO.DocType.toLocaleLowerCase() === "subcon") {
                                const sub = this.SubconViews.filter(x => x.Item === poItem.Item)[0];
                                if (sub) {
                                    const remainingQty = sub.OrderedQty - poItem.TransitQty;
                                    poItem.MaxAllowedQty = remainingQty;
                                }
                            } else {
                                poItem.MaxAllowedQty = poItem.OpenQty;
                            }
                            // poItem.MaxAllowedQty = poItem.OpenQty;
                        }

                        this.InsertPOItemsFormGroup(poItem);
                    });
                    this.CalculateShipmentAmount();
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }

    GetArrivalDateIntervalByPOAndPartnerID(): void {
        this._ASNService.GetArrivalDateIntervalByPOAndPartnerID(this.SelectedDocNumber, this.currentUserName).subscribe(
            (data) => {
                this.ArrivalDateInterval = data as number;
                if (this.ArrivalDateInterval && this.ArrivalDateInterval >= 0) {
                    const today = new Date();
                    today.setDate(today.getDate() + this.ArrivalDateInterval);
                    this.ASNFormGroup.get('ArrivalDate').patchValue(today);
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }

    GetSubconViewByDocAndPartnerID(): void {
        this._subConService.GetSubconViewByDocAndPartnerID(this.SelectedDocNumber, this.currentUserName).subscribe(
            (data) => {
                this.SubconViews = data as BPCOFSubconView[];
                if (this.SelectedDocNumber && !this.SelectedASNHeader.ASNNumber) {
                    this.GetPOItemsByDocAndPartnerID();
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }

    LoadSelectedASN(seletedASN: BPCASNHeader): void {
        this.SelectedASNHeader = seletedASN;
        if (this.SelectedASNHeader.Status === 'ShipmentNotRelevant') {
            this.IsShipmentNotRelevant = true;
        } else {
            this.IsShipmentNotRelevant = false;
        }
        this.SelectedASNView.ASNNumber = this.SelectedASNHeader.ASNNumber;
        this.SelectedASNNumber = this.SelectedASNHeader.ASNNumber;
        // this.GetPOByDocAndPartnerID(this.SelectedASNHeader.DocNumber);
        this.GetPOByDocAndPartnerID1(this.SelectedASNView.DocNumber);
        this.ClearASNItems();
        this.GetASNItemsByASN();
        this.GetASNPacksByASN();
        this.GetDocumentCentersByASN();
        this.GetInvoiceAttachmentByASN();
        this.SetASNHeaderValues();
        this.SetInvoiceDetailValues();
        this.CheckForEnableInvoiceDetailsFormGroup();
        if (this.currentUserRole === 'GateUser') {
            this.DisableAllFormGroup();
        }
    }

    CheckForEnableInvoiceDetailsFormGroup(): void {
        if (this.SelectedASNHeader.IsSubmitted) {
            this.DisableAllFormGroup();
            const diff = Math.abs(this.maxDate.getTime() - new Date(this.SelectedASNHeader.ASNDate as string).getTime());
            const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
            if (diffDays < 31) {
                this.EnableInvoiceDetailsFormGroup();
                this.IsInvoiceDetailsFormGroupEnabled = true;
            } else {
                this.DisableInvoiceDetailsFormGroup();
                this.IsInvoiceDetailsFormGroupEnabled = false;
            }
        } else {
            this.EnableAllFormGroup();
        }
        this.InvoiceDetailsFormGroup.get('POBasicPrice').disable();
    }
    DisableAllFormGroup(): void {
        this.ASNFormGroup.disable();
        this.ASNItemFormGroup.disable();
        this.ASNPackFormGroup.disable();
        this.InvoiceDetailsFormGroup.disable();
    }
    DisableASNFormGroup(): void {
        this.ASNFormGroup.disable();
    }
    DisableASNItemFormGroup(): void {
        this.ASNItemFormGroup.disable();
    }
    DisableASNPackFormGroup(): void {
        this.ASNPackFormGroup.disable();
    }
    DisableInvoiceDetailsFormGroup(): void {
        this.InvoiceDetailsFormGroup.disable();
    }
    EnableAllFormGroup(): void {
        this.ASNFormGroup.enable();
        this.ASNItemFormGroup.enable();
        this.ASNPackFormGroup.enable();
        this.InvoiceDetailsFormGroup.enable();
    }
    EnableASNItemFormGroup(): void {
        this.ASNItemFormGroup.enable();
    }
    EnableASNPackFormGroup(): void {
        this.ASNPackFormGroup.enable();
    }

    EnableInvoiceDetailsFormGroup(): void {
        this.InvoiceDetailsFormGroup.enable();
    }

    GetASNItemsByASN(): void {
        this._ASNService.GetASNItemsWithBatchesByASN(this.SelectedASNHeader.ASNNumber).subscribe(
            (data) => {
                this.SelectedASNView.ASNItems = data as BPCASNItemView[];
                this.ClearFormArray(this.ASNItemFormArray);
                if (this.SelectedASNView.ASNItems && this.SelectedASNView.ASNItems.length) {
                    this.SelectedASNView.ASNItems.forEach((x, i) => {
                        this.InsertASNItemsFormGroup(x);
                    });
                    this.CalculateShipmentAmount();
                }
                if (this.SelectedASNHeader.IsSubmitted) {
                    this.DisableASNItemFormGroup();
                } else {
                    this.EnableASNItemFormGroup();
                }
                // this._ASNService.GetASNItemBatchesByASN(this.SelectedASNHeader.ASNNumber).subscribe(
                //     (data1) => {
                //         this.SelectedASNView.ASNItemBatches = data1 as BPCASNItemBatch[];

                //     },
                //     (err) => {
                //         console.error(err);
                //     });
            },
            (err) => {
                console.error(err);
            }
        );
    }

    GetASNPacksByASN(): void {
        this._ASNService.GetASNPacksByASN(this.SelectedASNHeader.ASNNumber).subscribe(
            (data) => {
                this.SelectedASNView.ASNPacks = data as BPCASNPack[];
                this.ClearFormArray(this.ASNPackFormArray);
                if (this.SelectedASNView.ASNPacks && this.SelectedASNView.ASNPacks.length) {
                    this.SelectedASNView.ASNPacks.forEach(x => {
                        this.InsertASNPacksFormGroup(x);
                    });
                }
                if (this.SelectedASNHeader.IsSubmitted) {
                    this.DisableASNPackFormGroup();
                } else {
                    this.EnableASNPackFormGroup();
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }

    GetDocumentCentersByASN(): void {
        this._ASNService.GetDocumentCentersByASN(this.SelectedASNHeader.ASNNumber).subscribe(
            (data) => {
                this.AllDocumentCenters = data as DocumentCenter[];
                this.DocumentCenterDataSource = new MatTableDataSource(this.AllDocumentCenters);
            },
            (err) => {
                console.error(err);
            }
        );
    }
    GetInvoiceAttachmentByASN(): void {
        this._ASNService.GetInvoiceAttachmentByASN(this.SelectedASNHeader.ASNNumber, this.SelectedASNHeader.InvDocReferenceNo).subscribe(
            (data) => {
                this.invAttach = data as BPCInvoiceAttachment;
            },
            (err) => {
                console.error(err);
            }
        );
    }



    SetASNHeaderValues(): void {
        this.ASNFormGroup.get('TransportMode').patchValue(this.SelectedASNHeader.TransportMode);
        this.ASNFormGroup.get('VessleNumber').patchValue(this.SelectedASNHeader.VessleNumber);
        this.ASNFormGroup.get('AWBNumber').patchValue(this.SelectedASNHeader.AWBNumber);
        this.ASNFormGroup.get('AWBDate').patchValue(this.SelectedASNHeader.AWBDate);
        this.ASNFormGroup.get('CountryOfOrigin').patchValue(this.SelectedASNHeader.CountryOfOrigin);
        this.ASNFormGroup.get('ShippingAgency').patchValue(this.SelectedASNHeader.ShippingAgency);
        this.ASNFormGroup.get('NumberOfPacks').patchValue(this.SelectedASNHeader.NumberOfPacks);
        this.ASNFormGroup.get('DepartureDate').patchValue(this.SelectedASNHeader.DepartureDate);
        this.ASNFormGroup.get('ArrivalDate').patchValue(this.SelectedASNHeader.ArrivalDate);
        this.ASNFormGroup.get('GrossWeight').patchValue(this.SelectedASNHeader.GrossWeight);
        this.ASNFormGroup.get('GrossWeightUOM').patchValue(this.SelectedASNHeader.GrossWeightUOM);
        this.ASNFormGroup.get('NetWeight').patchValue(this.SelectedASNHeader.NetWeight);
        // this.ASNFormGroup.get('NetWeightUOM').patchValue(this.SelectedASNHeader.NetWeightUOM);
        this.ASNFormGroup.get('VolumetricWeight').patchValue(this.SelectedASNHeader.VolumetricWeight);
        this.ASNFormGroup.get('VolumetricWeightUOM').patchValue(this.SelectedASNHeader.VolumetricWeightUOM);
        this.ASNFormGroup.get('BillOfLading').patchValue(this.SelectedASNHeader.BillOfLading);
        this.ASNFormGroup.get('TransporterName').patchValue(this.SelectedASNHeader.TransporterName);
        this.ASNFormGroup.get('AccessibleValue').patchValue(this.SelectedASNHeader.AccessibleValue);
        this.ASNFormGroup.get('ContactPerson').patchValue(this.SelectedASNHeader.ContactPerson);
        this.ASNFormGroup.get('ContactPersonNo').patchValue(this.SelectedASNHeader.ContactPersonNo);
        this.ASNFormGroup.get('Field1').patchValue(this.SelectedASNHeader.Field1);
        this.ASNFormGroup.get('Field2').patchValue(this.SelectedASNHeader.Field2);
        this.ASNFormGroup.get('Field3').patchValue(this.SelectedASNHeader.Field3);
        this.ASNFormGroup.get('Field4').patchValue(this.SelectedASNHeader.Field4);
        this.ASNFormGroup.get('Field5').patchValue(this.SelectedASNHeader.Field5);
        this.ASNFormGroup.get('Field6').patchValue(this.SelectedASNHeader.Field6);
        this.ASNFormGroup.get('Field7').patchValue(this.SelectedASNHeader.Field7);
        this.ASNFormGroup.get('Field8').patchValue(this.SelectedASNHeader.Field8);
        this.ASNFormGroup.get('Field9').patchValue(this.SelectedASNHeader.Field9);
        this.ASNFormGroup.get('Field10').patchValue(this.SelectedASNHeader.Field10);
    }

    InsertPOItemsFormGroup(poItem: BPCOFItemView): void {
        const row = this._formBuilder.group({
            Item: [poItem.Item],
            Material: [poItem.Material],
            MaterialText: [poItem.MaterialText],
            DeliveryDate: [poItem.DeliveryDate],
            HSN: [poItem.HSN],
            OrderedQty: [poItem.OrderedQty],
            GRQty: [poItem.CompletedQty],
            PipelineQty: [poItem.TransitQty],
            OpenQty: [poItem.OpenQty],
            // ASNQty: [poItem.MaxAllowedQty],
            ASNQty: [''],
            UOM: [poItem.UOM],
            Batch: [[]],
            SES: [poItem.BPCOFItemSESes],
            ManufactureDate: [''],
            ExpiryDate: [''],
            PlantCode: [poItem.PlantCode],
            UnitPrice: [poItem.UnitPrice],
            Value: [poItem.Value],
            TaxAmount: [poItem.TaxAmount],
            TaxCode: [poItem.TaxCode],
        });
        row.disable();

        // if (poItem.MaxAllowedQty && poItem.MaxAllowedQty > 0) {
        //     row.get('ASNQty').setValidators([Validators.max(poItem.MaxAllowedQty), Validators.pattern('^([0-9]{0,10})([.][0-9]{1,3})?$')]);
        //     row.get('ASNQty').updateValueAndValidity();
        //     row.get('ASNQty').enable();
        // }
        // if (poItem.OpenQty && poItem.OpenQty > 0) {
        //     if (this.PO && this.PO.DocType && this.PO.DocType.toLocaleLowerCase() === "subcon") {
        //         const sub = this.SubconViews.filter(x => x.Item === poItem.Item)[0];
        //         if (sub) {
        //             const remainingQty = sub.OrderedQty - poItem.TransitQty;
        //             row.get('ASNQty').patchValue(remainingQty);
        //             if (remainingQty > 0) {
        //                 row.get('ASNQty').setValidators([Validators.required, Validators.max(remainingQty), Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]);
        //                 row.get('ASNQty').updateValueAndValidity();
        //                 row.get('ASNQty').enable();
        //             }
        //         }
        //     } else {
        //         row.get('ASNQty').setValidators([Validators.required, Validators.max(poItem.OpenQty), Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]);
        //         row.get('ASNQty').updateValueAndValidity();
        //         row.get('ASNQty').enable();
        //     }
        // }

        if (this.PO && this.PO.DocType && this.PO.DocType.toLocaleLowerCase() === "subcon") {
            const sub = this.SubconViews.filter(x => x.Item === poItem.Item)[0];
            if (sub) {
                const remainingQty = sub.OrderedQty - poItem.TransitQty;
                row.get('ASNQty').patchValue(remainingQty);
                if (remainingQty > 0) {
                    row.get('ASNQty').setValidators([Validators.required, Validators.max(remainingQty), Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]);
                    row.get('ASNQty').updateValueAndValidity();
                    row.get('ASNQty').enable();
                }
            }
        } else {
            row.get('ASNQty').setValidators([Validators.required, Validators.max(poItem.MaxAllowedQty), Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]);
            row.get('ASNQty').updateValueAndValidity();
            row.get('ASNQty').enable();
        }


        // row.get('Batch').enable();
        // row.get('ManufactureDate').enable();
        // row.get('ExpiryDate').enable();
        this.ASNItemFormArray.push(row);
        this.ASNItemDataSource.next(this.ASNItemFormArray.controls);
        // this.CalculateShipmentAmount();
        // return row;
    }

    InsertASNItemsFormGroup(asnItem: BPCASNItemView): void {
        const row = this._formBuilder.group({
            Item: [asnItem.Item],
            Material: [asnItem.Material],
            MaterialText: [asnItem.MaterialText],
            DeliveryDate: [asnItem.DeliveryDate],
            HSN: [asnItem.HSN],
            OrderedQty: [asnItem.OrderedQty],
            GRQty: [asnItem.CompletedQty],
            PipelineQty: [asnItem.TransitQty],
            OpenQty: [asnItem.OpenQty],
            ASNQty: [asnItem.ASNQty, [Validators.pattern('^([0-9]{0,10})([.][0-9]{1,3})?$')]],
            UOM: [asnItem.UOM],
            Batch: [asnItem.ASNItemBatches],
            SES: [asnItem.ASNItemSESes],
            // ManufactureDate: [asnItemBatch ? asnItemBatch.ManufactureDate : ''],
            // ExpiryDate: [asnItemBatch ? asnItemBatch.ExpiryDate : ''],
            PlantCode: [asnItem.PlantCode],
            UnitPrice: [asnItem.UnitPrice],
            Value: [asnItem.Value],
            TaxAmount: [asnItem.TaxAmount],
            TaxCode: [asnItem.TaxCode],
        });
        row.disable();
        // row.get('ASNQty').enable();
        // row.get('Batch').enable();
        // row.get('ManufactureDate').enable();
        // row.get('ExpiryDate').enable();

        if (this.PO && this.PO.DocType && this.PO.DocType.toLocaleLowerCase() === "subcon") {
            const sub = this.SubconViews.filter(x => x.Item === asnItem.Item)[0];
            if (sub) {
                const remainingQty = sub.OrderedQty - asnItem.TransitQty;
                // row.get('ASNQty').patchValue(remainingQty);
                if (remainingQty > 0) {
                    row.get('ASNQty').setValidators([Validators.required, Validators.max(remainingQty), Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]);
                    row.get('ASNQty').updateValueAndValidity();
                    row.get('ASNQty').enable();
                }
            }
        } else {
            row.get('ASNQty').setValidators([Validators.required, Validators.max(asnItem.OpenQty), Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]);
            row.get('ASNQty').updateValueAndValidity();
            row.get('ASNQty').enable();
        }

        this.ASNItemFormArray.push(row);
        this.ASNItemDataSource.next(this.ASNItemFormArray.controls);
        // return row;
    }

    InsertASNPacksFormGroup(pack: BPCASNPack): void {
        const row = this._formBuilder.group({
            PackageID: [pack.PackageID, Validators.required],
            ReferenceNumber: [pack.ReferenceNumber, Validators.required],
            Dimension: [pack.Dimension],
            NetWeight: [pack.NetWeight, [Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]],
            NetWeightUOM: [pack.GrossWeightUOM],
            GrossWeight: [pack.GrossWeight, [Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]],
            GrossWeightUOM: [pack.GrossWeightUOM],
            VolumetricWeight: [pack.VolumetricWeight, [Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]],
            VolumetricWeightUOM: [pack.VolumetricWeightUOM],
        }, {
            validator: MustValid('NetWeight', 'GrossWeight')
        });
        this.ASNPackFormArray.push(row);
        this.ASNPackDataSource.next(this.ASNPackFormArray.controls);
        // return row;
    }

    RemoveASNPacksFormGroup(): void {
        this.ASNPackFormArray.removeAt(this.ASNPackFormArray.controls.length - 1);
        this.ASNPackDataSource.next(this.ASNPackFormArray.controls);
    }

    SetInvoiceDetailValues(): void {
        this.InvoiceDetailsFormGroup.get('InvoiceNumber').patchValue(this.SelectedASNHeader.InvoiceNumber);
        this.InvoiceDetailsFormGroup.get('InvoiceDate').patchValue(this.SelectedASNHeader.InvoiceDate);
        this.InvoiceDetailsFormGroup.get('POBasicPrice').patchValue(this.SelectedASNHeader.POBasicPrice);
        this.InvoiceDetailsFormGroup.get('TaxAmount').patchValue(this.SelectedASNHeader.TaxAmount);
        this.InvoiceDetailsFormGroup.get('InvoiceAmount').patchValue(this.SelectedASNHeader.InvoiceAmount);
        this.InvoiceDetailsFormGroup.get('InvoiceAmountUOM').patchValue(this.SelectedASNHeader.InvoiceAmountUOM);
        this.InvoiceDetailsFormGroup.get('POBasicPrice').disable();
    }

    GetASNValues(): void {
        this.SelectedASNHeader.TransportMode = this.SelectedASNView.TransportMode = this.ASNFormGroup.get('TransportMode').value;
        this.SelectedASNHeader.VessleNumber = this.SelectedASNView.VessleNumber = this.ASNFormGroup.get('VessleNumber').value;
        this.SelectedASNHeader.AWBNumber = this.SelectedASNView.AWBNumber = this.ASNFormGroup.get('AWBNumber').value;
        this.SelectedASNHeader.AWBDate = this.SelectedASNView.AWBDate = this.ASNFormGroup.get('AWBDate').value;
        this.SelectedASNHeader.CountryOfOrigin = this.SelectedASNView.CountryOfOrigin = this.ASNFormGroup.get('CountryOfOrigin').value;
        this.SelectedASNHeader.ShippingAgency = this.SelectedASNView.ShippingAgency = this.ASNFormGroup.get('ShippingAgency').value;
        const depDate = this.ASNFormGroup.get('DepartureDate').value;
        if (depDate) {
            this.SelectedASNHeader.DepartureDate = this.SelectedASNView.DepartureDate = this._datePipe.transform(depDate, 'yyyy-MM-dd HH:mm:ss');
        } else {
            this.SelectedASNHeader.DepartureDate = this.SelectedASNView.DepartureDate = this.ASNFormGroup.get('DepartureDate').value;
        }
        const arrDate = this.ASNFormGroup.get('ArrivalDate').value;
        if (arrDate) {
            this.SelectedASNHeader.ArrivalDate = this.SelectedASNView.ArrivalDate = this._datePipe.transform(arrDate, 'yyyy-MM-dd HH:mm:ss');
        } else {
            this.SelectedASNHeader.ArrivalDate = this.SelectedASNView.ArrivalDate = this.ASNFormGroup.get('ArrivalDate').value;
        }
        this.SelectedASNHeader.GrossWeight = this.SelectedASNView.GrossWeight = this.ASNFormGroup.get('GrossWeight').value;
        this.SelectedASNHeader.GrossWeightUOM = this.SelectedASNView.GrossWeightUOM = this.ASNFormGroup.get('GrossWeightUOM').value;
        this.SelectedASNHeader.NetWeight = this.SelectedASNView.NetWeight = this.ASNFormGroup.get('NetWeight').value;
        this.SelectedASNHeader.NetWeightUOM = this.SelectedASNView.NetWeightUOM = this.ASNFormGroup.get('GrossWeightUOM').value;
        this.SelectedASNHeader.VolumetricWeight = this.SelectedASNView.VolumetricWeight = this.ASNFormGroup.get('VolumetricWeight').value;
        this.SelectedASNHeader.VolumetricWeightUOM = this.SelectedASNView.VolumetricWeightUOM = this.ASNFormGroup.get('VolumetricWeightUOM').value;
        this.SelectedASNHeader.NumberOfPacks = this.SelectedASNView.NumberOfPacks = this.ASNFormGroup.get('NumberOfPacks').value;
        // this.SelectedASNHeader.ParentVendor = this.SelectedASNView.ParentVendor = this.ASNFormGroup.get('ParentVendor').value;
        // this.SelectedASNHeader.Status = this.SelectedASNView.Status = this.ASNFormGroup.get('Status').value;
        this.SelectedASNHeader.ArrivalDateInterval = this.SelectedASNView.ArrivalDateInterval = this.calculateDiff(this.SelectedASNHeader.ArrivalDate);
        this.SelectedASNHeader.DocNumber = this.SelectedASNView.DocNumber = this.SelectedDocNumber ? this.SelectedDocNumber : this.SelectedASNHeader.DocNumber;
        this.SelectedASNHeader.BillOfLading = this.SelectedASNView.BillOfLading = this.ASNFormGroup.get('BillOfLading').value;
        this.SelectedASNHeader.TransporterName = this.SelectedASNView.TransporterName = this.ASNFormGroup.get('TransporterName').value;
        this.SelectedASNHeader.AccessibleValue = this.SelectedASNView.AccessibleValue = this.ASNFormGroup.get('AccessibleValue').value;
        this.SelectedASNHeader.ContactPerson = this.SelectedASNView.ContactPerson = this.ASNFormGroup.get('ContactPerson').value;
        this.SelectedASNHeader.ContactPersonNo = this.SelectedASNView.ContactPersonNo = this.ASNFormGroup.get('ContactPersonNo').value;
        this.SelectedASNHeader.Field1 = this.SelectedASNView.Field1 = this.ASNFormGroup.get('Field1').value;
        this.SelectedASNHeader.Field2 = this.SelectedASNView.Field2 = this.ASNFormGroup.get('Field2').value;
        this.SelectedASNHeader.Field3 = this.SelectedASNView.Field3 = this.ASNFormGroup.get('Field3').value;
        this.SelectedASNHeader.Field4 = this.SelectedASNView.Field4 = this.ASNFormGroup.get('Field4').value;
        this.SelectedASNHeader.Field5 = this.SelectedASNView.Field5 = this.ASNFormGroup.get('Field5').value;
        this.SelectedASNHeader.Field6 = this.SelectedASNView.Field6 = this.ASNFormGroup.get('Field6').value;
        this.SelectedASNHeader.Field7 = this.SelectedASNView.Field7 = this.ASNFormGroup.get('Field7').value;
        this.SelectedASNHeader.Field8 = this.SelectedASNView.Field8 = this.ASNFormGroup.get('Field8').value;
        this.SelectedASNHeader.Field9 = this.SelectedASNView.Field9 = this.ASNFormGroup.get('Field9').value;
        this.SelectedASNHeader.Field10 = this.SelectedASNView.Field10 = this.ASNFormGroup.get('Field10').value;
        if (this.SelectedDocNumber && this.PO) {
            this.SelectedASNHeader.Client = this.SelectedASNView.Client = this.PO.Client;
            this.SelectedASNHeader.Company = this.SelectedASNView.Company = this.PO.Company;
            this.SelectedASNHeader.Type = this.SelectedASNView.Type = this.PO.Type;
            this.SelectedASNHeader.PatnerID = this.SelectedASNView.PatnerID = this.PO.PatnerID;
            this.SelectedASNHeader.Plant = this.SelectedASNView.Plant = this.PO.Plant;
        } else {
            this.SelectedASNHeader.Client = this.SelectedASNView.Client = this.SelectedASNHeader.Client;
            this.SelectedASNHeader.Company = this.SelectedASNView.Company = this.SelectedASNHeader.Company;
            this.SelectedASNHeader.Type = this.SelectedASNView.Type = this.SelectedASNHeader.Type;
            this.SelectedASNHeader.PatnerID = this.SelectedASNView.PatnerID = this.SelectedASNHeader.PatnerID;
        }
    }

    calculateDiff(sentDate): number {
        const dateSent: Date = new Date(sentDate);
        const currentDate: Date = new Date();
        return Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) -
            Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    }

    GetASNItemValues(): void {
        this.SelectedASNView.ASNItems = [];
        this.IsAtleastOneASNQty = false;
        this.IsOneSERItem = true;
        let count = 0;
        const aSNItemFormArray = this.ASNItemFormGroup.get('ASNItems') as FormArray;
        aSNItemFormArray.controls.forEach((x, i) => {
            const item: BPCASNItemView = new BPCASNItemView();
            item.Item = x.get('Item').value;
            item.Material = x.get('Material').value;
            item.MaterialText = x.get('MaterialText').value;
            item.DeliveryDate = x.get('DeliveryDate').value;
            item.HSN = x.get('HSN').value;
            item.OrderedQty = x.get('OrderedQty').value;
            item.UOM = x.get('UOM').value;
            item.CompletedQty = +x.get('GRQty').value;
            item.TransitQty = +x.get('PipelineQty').value;
            item.OpenQty = +x.get('OpenQty').value;
            item.ASNQty = +x.get('ASNQty').value;
            item.ASNItemBatches = x.get('Batch').value;
            item.ASNItemSESes = x.get('SES').value;
            item.PlantCode = x.get('PlantCode').value;
            item.UnitPrice = x.get('UnitPrice').value;
            item.Value = x.get('Value').value;
            item.TaxAmount = x.get('TaxAmount').value;
            item.TaxCode = x.get('TaxCode').value;
            // const manufDate = x.get('ManufactureDate').value;
            // if (manufDate) {
            //     itemBatch.ManufactureDate = this._datePipe.transform(manufDate, 'yyyy-MM-dd HH:mm:ss');
            // } else {
            //     itemBatch.ManufactureDate = x.get('ManufactureDate').value;
            // }
            // const expDate = x.get('ExpiryDate').value;
            // if (expDate) {
            //     itemBatch.ExpiryDate = this._datePipe.transform(expDate, 'yyyy-MM-dd HH:mm:ss');
            // } else {
            //     itemBatch.ExpiryDate = x.get('ExpiryDate').value;
            // }
            if (this.SelectedDocNumber && this.PO) {
                if (this.DocumentType === 'SER') {
                    if (item.ASNQty > 0) {
                        count++;
                    }
                }
                item.Client = this.PO.Client;
                item.Company = this.PO.Company;
                item.Type = this.PO.Type;
                item.PatnerID = this.PO.PatnerID;
                item.ASNItemBatches.forEach(y => {
                    y.Client = this.PO.Client;
                    y.Company = this.PO.Company;
                    y.Type = this.PO.Type;
                    y.PatnerID = this.PO.PatnerID;
                    y.Item = item.Item;
                });
                item.ASNItemSESes.forEach(y => {
                    y.Client = this.PO.Client;
                    y.Company = this.PO.Company;
                    y.Type = this.PO.Type;
                    y.PatnerID = this.PO.PatnerID;
                    y.Item = item.Item;
                });
                // itemBatch.Client = this.PO.Client;
                // itemBatch.Company = this.PO.Company;
                // itemBatch.Type = this.PO.Type;
                // itemBatch.PatnerID = this.PO.PatnerID;
            } else {
                if (this.DocumentType === 'SER') {
                    if (item.ASNQty > 0) {
                        count++;
                    }
                }
                item.Client = this.SelectedASNHeader.Client;
                item.Company = this.SelectedASNHeader.Company;
                item.Type = this.SelectedASNHeader.Type;
                item.PatnerID = this.SelectedASNHeader.PatnerID;
                item.ASNItemBatches.forEach(y => {
                    y.Client = this.PO.Client;
                    y.Company = this.PO.Company;
                    y.Type = this.PO.Type;
                    y.PatnerID = this.PO.PatnerID;
                    y.Item = item.Item;
                });
                item.ASNItemSESes.forEach(y => {
                    y.Client = this.PO.Client;
                    y.Company = this.PO.Company;
                    y.Type = this.PO.Type;
                    y.PatnerID = this.PO.PatnerID;
                    y.Item = item.Item;
                });
                // itemBatch.Client = this.SelectedASNHeader.Client;
                // itemBatch.Company = this.SelectedASNHeader.Company;
                // itemBatch.Type = this.SelectedASNHeader.Type;
                // itemBatch.PatnerID = this.SelectedASNHeader.PatnerID;
            }
            if (item.ASNQty > 0) {
                this.IsAtleastOneASNQty = true;
            }
            this.SelectedASNView.ASNItems.push(item);
            // this.SelectedASNView.ASNItemBatches.push(itemBatch);
        });
        if (count > 1) {
            this.IsOneSERItem = false;
        }
    }
    OpenItemBatch(index: number): void {

        const fg = this.ASNItemFormArray.controls[index] as FormGroup;
        const asQ = fg.get('ASNQty').value;
        const asBatch = fg.get('Batch').value;
        const isEnabled = fg.get('ASNQty').enabled;
        if (asQ) {
            this.OpenASNItemBatchDialog(asQ, asBatch, isEnabled, index);
        } else {
            this.notificationSnackBarComponent.openSnackBar('Please enter ASN Qty value', SnackBarStatus.danger);
        }
    }

    OpenASNItemBatchDialog(asQ: number, asBatch: BPCASNItemBatch[], isEnabled: boolean, index: number): void {
        const Actiontype = "Submit";
        const dialogConfig: MatDialogConfig = {
            data: {
                ASNQty: asQ,
                ASNItemBatchs: asBatch,
                IsEnabled: isEnabled
            },
            panelClass: 'asn-item-batch-dialog'
        };
        const dialogRef = this.dialog.open(ASNItemBatchDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
            result => {
                if (result) {
                    // this.CreateActionLogvalues("ItemBatch");
                    const fg = this.ASNItemFormArray.controls[index] as FormGroup;
                    fg.get('Batch').patchValue(result);
                } else {

                }
            }, (err) => {

            });
    }
    OpenItemSES(index: number): void {
        const fg = this.ASNItemFormArray.controls[index] as FormGroup;
        const asQ = fg.get('ASNQty').value;
        const asSES = fg.get('SES').value;
        const isEnabled = fg.get('ASNQty').enabled;
        if (asQ) {
            this.OpenASNItemSESDialog(asQ, asSES, isEnabled, index);
        } else {
            this.notificationSnackBarComponent.openSnackBar('Please enter ASN Qty value', SnackBarStatus.danger);
        }
    }
    OpenASNItemSESDialog(asQ: number, asSES: BPCASNItemSES[], isEnabled: boolean, index: number): void {
        const Actiontype = "Submit";
        const dialogConfig: MatDialogConfig = {
            data: {
                ASNQty: asQ,
                ASNItemSESes: asSES,
                IsEnabled: isEnabled
            },
            panelClass: 'asn-item-ses-dialog'
        };
        const dialogRef = this.dialog.open(ASNItemServiceDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
            result => {
                if (result) {
                    const fg = this.ASNItemFormArray.controls[index] as FormGroup;
                    fg.get('SES').patchValue(result);
                } else {

                }
            }, (err) => {

            });
    }
    GetASNPacksValues(): void {
        this.SelectedASNView.ASNPacks = [];
        // const aSNPackFormArray = this.ASNItemFormGroup.get('ASNPacks') as FormArray;
        if (this.ASNPackFormGroup.valid) {
            this.ASNPackFormArray.controls.forEach((x, i) => {
                const pack: BPCASNPack = new BPCASNPack();
                pack.PackageID = x.get('PackageID').value;
                pack.ReferenceNumber = x.get('ReferenceNumber').value;
                pack.Dimension = x.get('Dimension').value;
                pack.GrossWeight = x.get('GrossWeight').value;
                pack.GrossWeightUOM = x.get('GrossWeightUOM').value;
                pack.NetWeight = x.get('NetWeight').value;
                pack.NetWeightUOM = x.get('GrossWeightUOM').value;
                pack.VolumetricWeight = x.get('VolumetricWeight').value;
                pack.VolumetricWeightUOM = x.get('VolumetricWeightUOM').value;
                if (this.SelectedDocNumber && this.PO) {
                    pack.Client = this.PO.Client;
                    pack.Company = this.PO.Company;
                    pack.Type = this.PO.Type;
                    pack.PatnerID = this.PO.PatnerID;
                } else {
                    pack.Client = this.SelectedASNHeader.Client;
                    pack.Company = this.SelectedASNHeader.Company;
                    pack.Type = this.SelectedASNHeader.Type;
                    pack.PatnerID = this.SelectedASNHeader.PatnerID;
                }
                this.SelectedASNView.ASNPacks.push(pack);
            });
        } else {
            this.ShowValidationErrors(this.ASNPackFormGroup);
        }
    }

    CheckForNonZeroOpenQty(): boolean {
        let NonZero = false;
        this.SelectedASNView.ASNItems.forEach(x => {
            if (x.OpenQty > 0) {
                NonZero = true;
            }
        });
        return NonZero;
    }

    GetInvoiceDetailValues(): void {
        this.SelectedASNHeader.InvoiceNumber = this.SelectedASNView.InvoiceNumber = this.InvoiceDetailsFormGroup.get('InvoiceNumber').value;
        const invDate = this.InvoiceDetailsFormGroup.get('InvoiceDate').value;
        if (invDate) {
            this.SelectedASNHeader.InvoiceDate = this.SelectedASNView.InvoiceDate = this._datePipe.transform(invDate, 'yyyy-MM-dd HH:mm:ss');
        } else {
            this.SelectedASNHeader.InvoiceDate = this.SelectedASNView.InvoiceDate = this.InvoiceDetailsFormGroup.get('InvoiceDate').value;
        }
        this.SelectedASNHeader.InvoiceAmountUOM = this.SelectedASNView.InvoiceAmountUOM = this.InvoiceDetailsFormGroup.get('InvoiceAmountUOM').value;
        this.SelectedASNHeader.POBasicPrice = this.SelectedASNView.POBasicPrice = this.InvoiceDetailsFormGroup.get('POBasicPrice').value;
        this.SelectedASNHeader.TaxAmount = this.SelectedASNView.TaxAmount = this.InvoiceDetailsFormGroup.get('TaxAmount').value;
        this.SelectedASNHeader.InvoiceAmount = this.SelectedASNView.InvoiceAmount = this.InvoiceDetailsFormGroup.get('InvoiceAmount').value;

    }

    CalculateShipmentAmount(): void {
        let TotalASNAmount = 0;
        this.ASNItemFormArray.controls.forEach((x, i) => {
            const asq = +x.get('ASNQty').value;
            const up = +x.get('UnitPrice').value;
            TotalASNAmount += (asq * up);
            TotalASNAmount = Math.round((TotalASNAmount + Number.EPSILON) * 100) / 100;
        });
        this.InvoiceDetailsFormGroup.get('POBasicPrice').patchValue(TotalASNAmount);
        this.InvoiceDetailsFormGroup.get('POBasicPrice').disable();
    }

    AmountCheck(): void {
        const shipmentAmount = + this.InvoiceDetailsFormGroup.get('POBasicPrice').value;
        const invoiceAmount = + this.InvoiceDetailsFormGroup.get('InvoiceAmount').value;
        if (shipmentAmount !== invoiceAmount) {
            // this.notificationSnackBarComponent.openSnackBar('Shipment amount is not matched with Invoice amount', SnackBarStatus.warning, 6000);
            this.IsPriceNotMatched = true;
            this.openNotificationDialog1();
        } else {
            this.IsPriceNotMatched = false;
        }
    }

    openNotificationDialog1(): void {
        const dialogConfig: MatDialogConfig = {
            data: {
                title: 'Price does not match with Shipment Value',
                // subtitle: 'Please create a support ticket to acknowledge it.'
            },
            panelClass: 'confirmation-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialog1Component, dialogConfig);
        dialogRef.afterClosed().subscribe(
            result => {
                if (result) {
                    this.IsPriceNotMatched = false;
                } else {
                    this.IsPriceNotMatched = true;
                }
            },
            () => {
                this.IsPriceNotMatched = true;
            });
    }

    CalculateInvoiceAmount(): void {
        this.CheckPOBasicPriceValidation();
        const poBasicPrice = +this.InvoiceDetailsFormGroup.get('POBasicPrice').value;
        const taxAmount = +this.InvoiceDetailsFormGroup.get('TaxAmount').value;
        this.InvoiceDetailsFormGroup.get('InvoiceAmount').patchValue(poBasicPrice + taxAmount);
    }

    CheckPOBasicPriceValidation(): void {
        const poBasicPrice = +this.InvoiceDetailsFormGroup.get('POBasicPrice').value;
        if (poBasicPrice) {
            let TotalASNAmount = 0;
            this.ASNItemFormArray.controls.forEach((x, i) => {
                const asq = +x.get('ASNQty').value;
                const up = +x.get('UnitPrice').value;
                TotalASNAmount += (asq * up);
                TotalASNAmount = Math.round((TotalASNAmount + Number.EPSILON) * 100) / 100;
            });
            if (TotalASNAmount !== 0 && poBasicPrice !== 0 && TotalASNAmount !== poBasicPrice) {
                this.isPOBasicPriceError = true;
            } else {
                this.isPOBasicPriceError = false;
            }
            // this.InvoiceDetailsFormGroup.get('POBasicPrice').updateValueAndValidity();
        }
    }

    GetDocumentCenterValues(): void {
        this.SelectedASNView.DocumentCenters = [];
        // this.SelectedBPVendorOnBoardingView.BPBanks.push(...this.BanksByVOB);
        this.AllDocumentCenters.forEach(x => {
            this.SelectedASNView.DocumentCenters.push(x);
        });
    }

    SaveClicked(): void {
        this.InvoiceDetailsFormGroup.get('POBasicPrice').disable();
        // if (this.ASNFormGroup.valid) {
        //     if (!this.isWeightError) {
        //         if (this.ASNItemFormGroup.valid) {
        //             if (this.ASNPackFormGroup.valid) {
        //                 if (this.InvoiceDetailsFormGroup.valid) {
        //                     this.GetASNValues();
        //                     this.GetASNItemValues();
        //                     this.GetASNPacksValues();
        //                     if (this.CheckForNonZeroOpenQty()) {
        //                         if (this.IsAtleastOneASNQty) {
        //                             this.CalculateInvoiceAmount();
        //                             if (!this.isPOBasicPriceError) {
        //                                 this.GetInvoiceDetailValues();
        //                                 this.GetDocumentCenterValues();
        //                                 this.SelectedASNView.IsSubmitted = false;
        //                                 this.SetActionToOpenConfirmation('Save');
        //                             }
        //                         } else {
        //                             this.notificationSnackBarComponent.openSnackBar('Atleast one item should have non zero value to proceed', SnackBarStatus.danger);
        //                         }
        //                     } else {
        //                         this.notificationSnackBarComponent.openSnackBar('There is no Open Qty', SnackBarStatus.danger);
        //                     }

        //                 } else {
        //                     this.ShowValidationErrors(this.InvoiceDetailsFormGroup);
        //                 }
        //             } else {
        //                 this.ShowValidationErrors(this.ASNPackFormGroup);
        //             }

        //         } else {
        //             this.ShowValidationErrors(this.ASNItemFormGroup);
        //         }
        //     }

        // } else {
        //     this.ShowValidationErrors(this.ASNFormGroup);
        // }
        if (!this.isWeightError) {
            this.GetASNValues();
            this.GetASNItemValues();
            this.GetASNPacksValues();
            if (this.CheckForNonZeroOpenQty()) {
                if (this.IsAtleastOneASNQty) {
                    // this.CalculateInvoiceAmount();
                    if (!this.isPOBasicPriceError) {
                        if (this.IsPriceNotMatched) {
                            const dialogConfig: MatDialogConfig = {
                                data: {
                                    title: 'Price does not match with Shipment Value',
                                    // subtitle: 'Please create a support ticket to acknowledge it.'
                                },
                                panelClass: 'confirmation-dialog'
                            };
                            const dialogRef = this.dialog.open(NotificationDialog1Component, dialogConfig);
                            dialogRef.afterClosed().subscribe(
                                result => {
                                    if (result) {
                                        this.IsPriceNotMatched = false;
                                        this.GetInvoiceDetailValues();
                                        this.GetDocumentCenterValues();
                                        this.SelectedASNView.IsSubmitted = false;
                                        this.SelectedASNView.Status = 'Saved';
                                        this.SetActionToOpenConfirmation('Save');
                                    } else {
                                        this.IsPriceNotMatched = true;
                                    }
                                },
                                () => {
                                    this.IsPriceNotMatched = true;
                                });
                        } else {
                            this.GetInvoiceDetailValues();
                            this.GetDocumentCenterValues();
                            this.SelectedASNView.IsSubmitted = false;
                            this.SelectedASNView.Status = 'Saved';
                            this.SetActionToOpenConfirmation('Save');
                        }
                    }
                } else {
                    this.notificationSnackBarComponent.openSnackBar('Atleast one item should have non zero value to proceed', SnackBarStatus.danger);
                }
            } else {
                this.notificationSnackBarComponent.openSnackBar('There is no Open Qty', SnackBarStatus.danger);
            }

        } else {
            this.ShowValidationErrors(this.InvoiceDetailsFormGroup);
        }
    }
    // SubmitClicked(): void {
    //     this.ASNQty_count = 0;
    //     this.EnableAllFormGroup();
    //     // this.CreateActionLogvalues("Submit");
    //     this.InvoiceDetailsFormGroup.get('POBasicPrice').disable();
    //     if (this.IsShipmentNotRelevant) {
    //         if (!this.isWeightError) {
    //             if (this.InvoiceDetailsFormGroup.valid) {
    //                 if ((this.invoiceAttachment && this.invoiceAttachment.name) || this.invAttach.AttachmentName) {
    //                     this.GetASNValues();
    //                     this.GetASNItemValues();
    //                     if ((this.SelectedDocType === "SER") && (this.ASNQty_count > 1)) {
    //                         this.notificationSnackBarComponent.openSnackBar('please enter only one ASNQty in Shipment Proposal Item', SnackBarStatus.danger);
    //                         this.ASNItemFormArray.controls.forEach((x, i) => {
    //                             x.get('ASNQty').setErrors({ qty: true });
    //                             x.get('ASNQty').markAsTouched();
    //                         });

    //                     }
    //                     else {
    //                         this.ASNItemFormArray.controls.forEach((x, i) => {
    //                             x.get('ASNQty').setErrors({ qty: false });
    //                             x.get('ASNQty').markAsUntouched();
    //                         });



    //                         this.GetASNPacksValues();
    //                         if (this.CheckForNonZeroOpenQty()) {
    //                             // this.CalculateInvoiceAmount();
    //                             if (!this.isPOBasicPriceError) {
    //                                 if (this.IsPriceNotMatched) {
    //                                     const dialogConfig: MatDialogConfig = {
    //                                         data: {
    //                                             title: 'Price does not match with Shipment Value',
    //                                             // subtitle: 'Please create a support ticket to acknowledge it.'
    //                                         },
    //                                         panelClass: 'confirmation-dialog'
    //                                     };
    //                                     const dialogRef = this.dialog.open(NotificationDialog1Component, dialogConfig);
    //                                     dialogRef.afterClosed().subscribe(
    //                                         result => {
    //                                             if (result) {
    //                                                 this.IsPriceNotMatched = false;
    //                                                 this.GetInvoiceDetailValues();
    //                                                 this.GetDocumentCenterValues();
    //                                                 this.SelectedASNView.IsSubmitted = true;
    //                                                 this.SelectedASNView.Status = 'ShipmentNotRelevant';
    //                                                 this.SetActionToOpenConfirmation('Submit');
    //                                             } else {
    //                                                 this.IsPriceNotMatched = true;
    //                                             }
    //                                         },
    //                                         () => {
    //                                             this.IsPriceNotMatched = true;
    //                                         });
    //                                 } else {
    //                                     this.GetInvoiceDetailValues();
    //                                     this.GetDocumentCenterValues();
    //                                     this.SelectedASNView.IsSubmitted = true;
    //                                     this.SelectedASNView.Status = 'ShipmentNotRelevant';
    //                                     this.SetActionToOpenConfirmation('Submit');
    //                                 }
    //                             }
    //                         } else {

    //                             this.notificationSnackBarComponent.openSnackBar('There is no Open Qty', SnackBarStatus.danger);
    //                         }
    //                     }
    //                 } else {
    //                     this.notificationSnackBarComponent.openSnackBar('Please add Invoice attachment', SnackBarStatus.danger);
    //                 }
    //             } else {
    //                 this.ShowValidationErrors(this.InvoiceDetailsFormGroup);
    //             }
    //         }
    //     } else {
    //         if (this.ASNFormGroup.valid) {
    //             if (!this.isWeightError) {
    //                 if (this.ASNItemFormGroup.valid) {
    //                     if (this.ASNPackFormGroup.valid) {
    //                         if (this.InvoiceDetailsFormGroup.valid) {
    //                             if ((this.invoiceAttachment && this.invoiceAttachment.name) || this.invAttach.AttachmentName) {
    //                                 this.GetASNValues();
    //                                 this.GetASNItemValues();
    //                                 if ((this.SelectedDocType === "SER") && (this.ASNQty_count > 1)) {
    //                                     this.notificationSnackBarComponent.openSnackBar('please enter only one ASNQty in Shipment Proposal Item', SnackBarStatus.danger);
    //                                     this.ASNItemFormArray.controls.forEach((x, i) => {
    //                                         x.get('ASNQty').setErrors({ qty: true });
    //                                         x.get('ASNQty').markAsTouched();
    //                                     });

    //                                 }
    //                                 else {
    //                                     this.ASNItemFormArray.controls.forEach((x, i) => {
    //                                         x.get('ASNQty').setErrors({ qty: false });
    //                                         x.get('ASNQty').markAsUntouched();
    //                                     });


    //                                     console.log("asnformarray", this.ASNItemFormArray);


    //                                     this.GetASNPacksValues();
    //                                     if (this.CheckForNonZeroOpenQty()) {
    //                                         if (this.IsAtleastOneASNQty) {
    //                                             // this.CalculateInvoiceAmount();
    //                                             if (!this.isPOBasicPriceError) {
    //                                                 if (this.IsPriceNotMatched) {
    //                                                     const dialogConfig: MatDialogConfig = {
    //                                                         data: {
    //                                                             title: 'Price does not match with Shipment Value',
    //                                                             // subtitle: 'Please create a support ticket to acknowledge it.'
    //                                                         },
    //                                                         panelClass: 'confirmation-dialog'
    //                                                     };
    //                                                     const dialogRef = this.dialog.open(NotificationDialog1Component, dialogConfig);
    //                                                     dialogRef.afterClosed().subscribe(
    //                                                         result => {
    //                                                             if (result) {
    //                                                                 this.IsPriceNotMatched = false;
    //                                                                 this.GetInvoiceDetailValues();
    //                                                                 this.GetDocumentCenterValues();
    //                                                                 this.SelectedASNView.Status = 'GateEntry';
    //                                                                 this.SelectedASNView.IsSubmitted = true;
    //                                                                 this.OpenASNReleaseDialog();
    //                                                             } else {
    //                                                                 this.IsPriceNotMatched = true;
    //                                                             }
    //                                                         },
    //                                                         () => {
    //                                                             this.IsPriceNotMatched = true;
    //                                                         });
    //                                                 } else {
    //                                                     this.GetInvoiceDetailValues();
    //                                                     this.GetDocumentCenterValues();
    //                                                     this.SelectedASNView.Status = 'GateEntry';
    //                                                     this.SelectedASNView.IsSubmitted = true;
    //                                                     this.OpenASNReleaseDialog();
    //                                                 }
    //                                             }
    //                                         } else {
    //                                             this.notificationSnackBarComponent.openSnackBar('Atleast one item should have non zero value to proceed', SnackBarStatus.danger);
    //                                         }
    //                                     } else {

    //                                         this.notificationSnackBarComponent.openSnackBar('There is no Open Qty', SnackBarStatus.danger);
    //                                     }
    //                                 }
    //                             } else {
    //                                 this.notificationSnackBarComponent.openSnackBar('Please add Invoice attachment', SnackBarStatus.danger);
    //                             }
    //                         } else {
    //                             this.ShowValidationErrors(this.InvoiceDetailsFormGroup);
    //                         }
    //                     } else {
    //                         this.ShowValidationErrors(this.ASNPackFormGroup);
    //                     }

    //                 } else {
    //                     this.ShowValidationErrors(this.ASNItemFormGroup);
    //                 }
    //             }

    //         } else {
    //             this.ShowValidationErrors(this.ASNFormGroup);
    //         }
    //     }
    // }
    SubmitClicked(): void {
        this.EnableAllFormGroup();
        // this.CreateActionLogvalues("Submit");
        this.InvoiceDetailsFormGroup.get('POBasicPrice').disable();
        if (this.IsShipmentNotRelevant) {
            if (!this.isWeightError) {
                if (this.ASNItemFormGroup.valid) {
                    if (this.ASNPackFormGroup.valid) {
                        if (this.InvoiceDetailsFormGroup.valid) {
                            if ((this.invoiceAttachment && this.invoiceAttachment.name) || (this.invAttach && this.invAttach.AttachmentName)) {
                                this.GetASNValues();
                                this.GetASNItemValues();
                                this.GetASNPacksValues();
                                if (this.CheckForNonZeroOpenQty()) {
                                    if (this.IsAtleastOneASNQty) {
                                        if (this.IsOneSERItem) {
                                            // this.CalculateInvoiceAmount();
                                            if (!this.isPOBasicPriceError) {
                                                if (this.IsPriceNotMatched) {
                                                    const dialogConfig: MatDialogConfig = {
                                                        data: {
                                                            title: 'Price does not match with Shipment Value',
                                                            // subtitle: 'Please create a support ticket to acknowledge it.'
                                                        },
                                                        panelClass: 'confirmation-dialog'
                                                    };
                                                    const dialogRef = this.dialog.open(NotificationDialog1Component, dialogConfig);
                                                    dialogRef.afterClosed().subscribe(
                                                        result => {
                                                            if (result) {
                                                                this.IsPriceNotMatched = false;
                                                                this.GetInvoiceDetailValues();
                                                                this.GetDocumentCenterValues();
                                                                this.SelectedASNView.IsSubmitted = true;
                                                                this.SelectedASNView.Status = 'ShipmentNotRelevant';
                                                                this.SetActionToOpenConfirmation('Submit');
                                                            } else {
                                                                this.IsPriceNotMatched = true;
                                                            }
                                                        },
                                                        () => {
                                                            this.IsPriceNotMatched = true;
                                                        });
                                                } else {
                                                    this.GetInvoiceDetailValues();
                                                    this.GetDocumentCenterValues();
                                                    this.SelectedASNView.IsSubmitted = true;
                                                    this.SelectedASNView.Status = 'ShipmentNotRelevant';
                                                    this.SetActionToOpenConfirmation('Submit');
                                                }
                                            }
                                        } else {
                                            this.notificationSnackBarComponent.openSnackBar('Please create ASN for only one item', SnackBarStatus.danger);
                                        }
                                    } else {
                                        this.notificationSnackBarComponent.openSnackBar('Atleast one item should have non zero value to proceed', SnackBarStatus.danger);
                                    }
                                } else {
                                    this.notificationSnackBarComponent.openSnackBar('There is no Open Qty', SnackBarStatus.danger);
                                }
                            } else {
                                this.notificationSnackBarComponent.openSnackBar('Please add Invoice attachment', SnackBarStatus.danger);
                            }
                        } else {
                            this.ShowValidationErrors(this.InvoiceDetailsFormGroup);
                        }
                    } else {
                        this.ShowValidationErrors(this.ASNPackFormGroup);
                    }
                } else {
                    this.ShowValidationErrors(this.ASNItemFormGroup);
                }
            }
        } else {
            if (this.ASNFormGroup.valid) {
                if (!this.isWeightError) {
                    if (this.ASNItemFormGroup.valid) {
                        if (this.ASNPackFormGroup.valid) {
                            if (this.InvoiceDetailsFormGroup.valid) {
                                if ((this.invoiceAttachment && this.invoiceAttachment.name) || (this.invAttach && this.invAttach.AttachmentName)) {
                                    this.GetASNValues();
                                    this.GetASNItemValues();
                                    this.GetASNPacksValues();
                                    if (this.CheckForNonZeroOpenQty()) {
                                        if (this.IsAtleastOneASNQty) {
                                            if (this.IsOneSERItem) {
                                                // this.CalculateInvoiceAmount();
                                                if (!this.isPOBasicPriceError) {
                                                    if (this.IsPriceNotMatched) {
                                                        const dialogConfig: MatDialogConfig = {
                                                            data: {
                                                                title: 'Price does not match with Shipment Value',
                                                                // subtitle: 'Please create a support ticket to acknowledge it.'
                                                            },
                                                            panelClass: 'confirmation-dialog'
                                                        };
                                                        const dialogRef = this.dialog.open(NotificationDialog1Component, dialogConfig);
                                                        dialogRef.afterClosed().subscribe(
                                                            result => {
                                                                if (result) {
                                                                    this.IsPriceNotMatched = false;
                                                                    this.GetInvoiceDetailValues();
                                                                    this.GetDocumentCenterValues();
                                                                    this.SelectedASNView.Status = 'GateEntry';
                                                                    this.SelectedASNView.IsSubmitted = true;
                                                                    this.OpenASNReleaseDialog();
                                                                } else {
                                                                    this.IsPriceNotMatched = true;
                                                                }
                                                            },
                                                            () => {
                                                                this.IsPriceNotMatched = true;
                                                            });
                                                    } else {
                                                        this.GetInvoiceDetailValues();
                                                        this.GetDocumentCenterValues();
                                                        this.SelectedASNView.Status = 'GateEntry';
                                                        this.SelectedASNView.IsSubmitted = true;
                                                        this.OpenASNReleaseDialog();
                                                    }
                                                }
                                            } else {
                                                this.notificationSnackBarComponent.openSnackBar('Please create ASN for only one item', SnackBarStatus.danger);
                                            }
                                        } else {
                                            this.notificationSnackBarComponent.openSnackBar('Atleast one item should have non zero value to proceed', SnackBarStatus.danger);
                                        }
                                    } else {
                                        this.notificationSnackBarComponent.openSnackBar('There is no Open Qty', SnackBarStatus.danger);
                                    }
                                } else {
                                    this.notificationSnackBarComponent.openSnackBar('Please add Invoice attachment', SnackBarStatus.danger);
                                }
                            } else {
                                this.ShowValidationErrors(this.InvoiceDetailsFormGroup);
                            }
                        } else {
                            this.ShowValidationErrors(this.ASNPackFormGroup);
                        }

                    } else {
                        this.ShowValidationErrors(this.ASNItemFormGroup);
                    }
                }

            } else {
                this.ShowValidationErrors(this.ASNFormGroup);
            }
        }
    }
    DeleteClicked(): void {
        // console.log("delete clicked");
        // console.log("asn",this.SelectedASNHeader);
        if (this.SelectedASNHeader.ASNNumber) {
            const Actiontype = 'Delete';
            const Catagory = 'ASN';
            this.OpenConfirmationDialog(Actiontype, Catagory);
        }
    }
    SetActionToOpenConfirmation(Actiontype: string): void {
        // if (this.SelectedASNHeader.ASNNumber) {
        //     const Catagory = 'ASN';
        //     this.OpenConfirmationDialog(Actiontype, Catagory);
        // } else {
        //     const Catagory = 'ASN';
        //     this.OpenConfirmationDialog(Actiontype, Catagory);
        // }
        // this.CreateActionLogvalues("Save");
        const Catagory = 'ASN';
        this.OpenConfirmationDialog(Actiontype, Catagory);
    }

    OpenASNReleaseDialog(): void {
        const Actiontype = "Submit";
        const dialogConfig: MatDialogConfig = {
            data: 'Is Good Dispatched',
            panelClass: 'asn-release-dialog'
        };
        const dialogRef = this.dialog.open(ASNReleaseDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
            result => {
                if (result) {
                    this.CreateActionLogvalues(Actiontype);
                    const dtt = result as Date;
                    const dt = this._datePipe.transform(dtt, 'yyyy-MM-dd');
                    this.SelectedASNHeader.ASNDate = dt;
                    this.SelectedASNView.ASNDate = this.SelectedASNHeader.ASNDate;
                    if (this.SelectedASNHeader.ASNNumber) {
                        this.UpdateASN(Actiontype);
                    } else {
                        this.CreateASN(Actiontype);
                    }
                } else {
                    this.CheckForEnableInvoiceDetailsFormGroup();
                }
            }, (err) => {
                this.CheckForEnableInvoiceDetailsFormGroup();
            });
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
                    this.CreateActionLogvalues(Actiontype);
                    if (Actiontype === 'Save' || Actiontype === 'Submit') {
                        if (this.SelectedASNHeader.ASNNumber) {
                            this.UpdateASN(Actiontype);
                        } else {
                            this.CreateASN(Actiontype);
                        }
                    } else if (Actiontype === 'Delete') {
                        this.DeleteASN();
                    } else if (Actiontype === 'Perform gate entry for') {
                        this.GateEntry(this.SelectedASNListView);
                    }

                }
            });
    }


    CreateASN(Actiontype: string): void {
        // this.GetASNValues();
        // this.GetBPASNSubItemValues();
        // this.SelectedASNView.CreatedBy = this.authenticationDetails.UserID.toString();
        this.IsProgressBarVisibile = true;
        this._ASNService.CreateASN(this.SelectedASNView).subscribe(
            (data) => {
                this.SelectedASNHeader.ASNNumber = (data as BPCASNHeader).ASNNumber;
                if (this.invoiceAttachment) {
                    this.AddInvoiceAttachment(Actiontype);
                } else {
                    if (this.fileToUploadList && this.fileToUploadList.length) {
                        this.AddDocumentCenterAttachment(Actiontype);
                    } else {
                        this.notificationSnackBarComponent.openSnackBar(`ASN ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
                        this.IsProgressBarVisibile = false;
                        // if (Actiontype === 'Submit' && !this.IsShipmentNotRelevant) {
                        if (Actiontype === 'Submit') {
                            this.CreateASNPdf();
                        } else {
                            this.ResetControl();
                            this.GetASNBasedOnCondition();
                        }
                    }
                }
            },
            (err) => {
                this.showErrorNotificationSnackBar(err);
            }
        );
    }

    AddInvoiceAttachment(Actiontype: string): void {
        this._ASNService.AddInvoiceAttachment(this.SelectedASNHeader.ASNNumber, this.currentUserID.toString(), this.invoiceAttachment).subscribe(
            (dat) => {
                if (this.fileToUploadList && this.fileToUploadList.length) {
                    this.AddDocumentCenterAttachment(Actiontype);
                } else {
                    this.notificationSnackBarComponent.openSnackBar(`ASN ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
                    this.IsProgressBarVisibile = false;
                    if (Actiontype === 'Submit') {
                        this.CreateASNPdf();
                    } else {
                        this.ResetControl();
                        this.GetASNBasedOnCondition();
                    }
                }
            },
            (err) => {
                this.showErrorNotificationSnackBar(err);
            });
    }
    AddDocumentCenterAttachment(Actiontype: string): void {
        this._ASNService.AddDocumentCenterAttachment(this.SelectedASNHeader.ASNNumber, this.currentUserID.toString(), this.fileToUploadList).subscribe(
            (dat) => {
                this.notificationSnackBarComponent.openSnackBar(`ASN ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                if (Actiontype === 'Submit') {
                    this.CreateASNPdf();
                } else {
                    this.ResetControl();
                    this.GetASNBasedOnCondition();
                }
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

    UpdateASN(Actiontype: string): void {
        // this.GetASNValues();
        // this.GetBPASNSubItemValues();
        // this.SelectedBPASNView.TransID = this.SelectedBPASN.TransID;
        // this.SelectedASNView.ModifiedBy = this.authenticationDetails.UserID.toString();
        this.IsProgressBarVisibile = true;

        this._ASNService.UpdateASN(this.SelectedASNView).subscribe(
            (data) => {
                this.SelectedASNHeader.ASNNumber = (data as BPCASNHeader).ASNNumber;
                if (this.invoiceAttachment) {
                    this.AddInvoiceAttachment(Actiontype);
                } else {
                    if (this.fileToUploadList && this.fileToUploadList.length) {
                        this.AddDocumentCenterAttachment(Actiontype);
                    } else {
                        this.notificationSnackBarComponent.openSnackBar(`ASN ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
                        this.IsProgressBarVisibile = false;
                        if (Actiontype === 'Submit') {
                            this.CreateASNPdf();
                        } else {
                            this.ResetControl();
                            this.GetASNBasedOnCondition();
                        }
                    }
                }
            },
            (err) => {
                console.error(err);
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                this.IsProgressBarVisibile = false;
            }
        );

    }

    DeleteASN(): void {
        this.GetASNValues();
        // this.SelectedBPASN.ModifiedBy = this.authenticationDetails.userID.toString();
        this.IsProgressBarVisibile = true;
        // console.log("asnHeader",this.SelectedASNHeader);
        this._ASNService.DeleteASN(this.SelectedASNHeader).subscribe(
            (data) => {
                console.log(data);
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar('ASN deleted successfully', SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                this.GetASNBasedOnCondition();
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

    GetInvoiceAttachment(fileName: string, file?: File): void {
        if (file && file.size) {
            const blob = new Blob([file], { type: file.type });
            this.OpenAttachmentDialog(fileName, blob);
        } else {
            this.IsProgressBarVisibile = true;
            this._ASNService.DowloandInvoiceAttachment(fileName, this.SelectedASNHeader.ASNNumber).subscribe(
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

    GetDocumentCenterAttachment(fileName: string): void {
        // this.CreateActionLogvalues("View DocumentCenter Attachment");
        const file = this.fileToUploadList.filter(x => x.name === fileName)[0];
        if (file && file.size) {
            const blob = new Blob([file], { type: file.type });
            this.OpenAttachmentDialog(fileName, blob);
        } else {
            this.IsProgressBarVisibile = true;
            this._ASNService.DowloandDocumentCenterAttachment(fileName, this.SelectedASNHeader.ASNNumber).subscribe(
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

    OpenASNPrintDialog(FileName: string, blob: Blob): void {
        const attachmentDetails: AttachmentDetails = {
            FileName: FileName,
            blob: blob
        };
        const dialogConfig: MatDialogConfig = {
            data: attachmentDetails,
            panelClass: 'asn-print-dialog'
        };
        const dialogRef = this.dialog.open(AsnPrintDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            this.ResetControl();
            this.GetASNBasedOnCondition();
        }, (err) => {
            this.ResetControl();
            this.GetASNBasedOnCondition();
        });
    }

    AmountSelected(): void {
        const GrossWeightVAL = +this.ASNFormGroup.get('GrossWeight').value;
        const NetWeightVAL = + this.ASNFormGroup.get('NetWeight').value;
        if (GrossWeightVAL < NetWeightVAL) {
            if (this.ASNFormGroup.get('GrossWeight').hasError('required')) {
                this.isWeightError = false;
            } else {
                this.isWeightError = true;
            }
        } else {
            this.isWeightError = false;
        }
    }

    DownloadASNItems(): void {
        this.GetASNItemValues();
        const itemsShowedd = [];
        this.SelectedASNView.ASNItems.forEach((x, i) => {
            const item: ASNItemXLSX = {
                'Item': x.Item,
                'Material': x.Material,
                'MaterialText': x.MaterialText,
                'UnitPrice': x.UnitPrice,
                'DeliveryDate': x.DeliveryDate ? this._datePipe.transform(x.DeliveryDate, 'dd-MM-yyyy') : '',
                'HSN': x.HSN,
                'OrderedQty': x.OrderedQty,
                'GRQty': x.CompletedQty,
                'PipelineQty': x.TransitQty,
                'OpenQty': x.OpenQty,
                'ASNQty': x.ASNQty,
                // 'Batch': this.SelectedASNView.ASNItemBatches[i].Batch,
                // tslint:disable-next-line:max-line-length
                // 'ManufactureDate': this.SelectedASNView.ASNItemBatches[i].ManufactureDate ? this._datePipe.transform(this.SelectedASNView.ASNItemBatches[i].ManufactureDate, 'dd-MM-yyyy') : '',
                // 'ExpiryDate': this.SelectedASNView.ASNItemBatches[i].ExpiryDate ? this._datePipe.transform(this.SelectedASNView.ASNItemBatches[i].ExpiryDate, 'dd-MM-yyyy') : '',
            };
            itemsShowedd.push(item);
        });
        this._excelService.exportAsExcelFile(itemsShowedd, 'asnItems');
    }
    onSelectFile(event): void {
        this.fileToUpload = event.target.files[0];
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(this.fileToUpload);
        fileReader.onload = (e) => {
            this.arrayBuffer = fileReader.result;
            const data = new Uint8Array(this.arrayBuffer);
            const arr = new Array();
            for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
            const bstr = arr.join("");
            const workbook = XLSX.read(bstr, { type: "binary" });
            if (workbook.SheetNames.length > 0) {
                const first_sheet_name = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[first_sheet_name];
                console.log(XLSX.utils.sheet_to_json(worksheet, { raw: true }));
                this.ASNItemXLSXs = XLSX.utils.sheet_to_json(worksheet, { raw: true }) as ASNItemXLSX[];
            }
            if (this.ASNItemXLSXs.length > 0 && this.SelectedASNHeader) {
                if (!this.SelectedASNHeader.ASNNumber) {
                    this.UpdateASNItemFormGroupUsingXLSXData();
                } else {
                    this.notificationSnackBarComponent.openSnackBar('ASN has already been created', SnackBarStatus.danger);
                }
            }
        };
    }

    UpdateASNItemFormGroupUsingXLSXData(): void {
        this.ASNItemFormArray.controls.forEach((x, i) => {
            const item: BPCASNItem = new BPCASNItem();
            item.Item = x.get('Item').value;
            item.Material = x.get('Material').value;
            const curr = this.ASNItemXLSXs.filter(y => y.Item === item.Item && y.Material === item.Material)[0];
            if (curr) {
                x.get('ASNQty').patchValue(curr.ASNQty);
                // x.get('Batch').patchValue(curr.Batch);
                // x.get('ManufactureDate').patchValue(curr.ManufactureDate);
                // x.get('ExpiryDate').patchValue(curr.ExpiryDate);
            }
        });
    }

    CreateASNPdf(): void {
        this.IsProgressBarVisibile = true;
        this._ASNService.CreateASNPdf(this.SelectedASNHeader.ASNNumber, true).subscribe(
            data => {
                if (data) {
                    this.IsProgressBarVisibile = false;
                    const fileType = 'application/pdf';
                    const blob = new Blob([data], { type: fileType });
                    const currentDateTime = this._datePipe.transform(new Date(), 'ddMMyyyyHHmmss');
                    const FileName = this.SelectedASNHeader.ASNNumber + '_' + currentDateTime + '.pdf';
                    this.OpenASNPrintDialog(FileName, blob);
                    // FileSaver.saveAs(blob, this.SelectedASNHeader.ASNNumber + '_' + currentDateTime + '.pdf');
                } else {
                    this.IsProgressBarVisibile = false;
                    this.ResetControl();
                    this.GetASNBasedOnCondition();
                }
            },
            error => {
                console.error(error);
                this.IsProgressBarVisibile = false;
                this.ResetControl();
                this.GetASNBasedOnCondition();
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

    // ASN Field related
    GetAllASNFieldMaster(): void {
        this._ASNService.GetASNFieldMasterByType(this.SelectedDocType).subscribe(
            (data) => {
                this.AllASNFieldMaster = data as BPCASNFieldMaster[];
                this.InitializeASNFormGroupByFieldMaster();
            },
            (err) => {
                console.error(err);
            }
        );
    }

    GetASNFieldLabel(field: string): string {
        if (this.AllASNFieldMaster && this.AllASNFieldMaster.length) {
            const fieldMaster = this.AllASNFieldMaster.filter(x => x.Field === field)[0];
            if (fieldMaster) {
                return fieldMaster.Text;
            }
        }
        return field;
    }

    GetASNFieldVisibility(field: string): string {
        if (this.AllASNFieldMaster && this.AllASNFieldMaster.length) {
            const fieldMaster = this.AllASNFieldMaster.filter(x => x.Field === field)[0];
            if (fieldMaster) {
                if (fieldMaster.Invisible) {
                    return 'none';
                }
            }
        }
        return 'inherit';
    }
    GetASNFieldMaster(field: string): BPCASNFieldMaster {
        if (this.AllASNFieldMaster && this.AllASNFieldMaster.length) {
            return this.AllASNFieldMaster.filter(x => x.Field === field)[0];
        }
        return null;
    }

    InitializeASNFormGroupByFieldMaster(): void {
        Object.keys(this.ASNFormGroup.controls).forEach(key => {
            const fieldMaster = this.GetASNFieldMaster(key);
            if (fieldMaster) {
                if (fieldMaster.Invisible) {
                    this.ASNFormGroup.get(key).clearValidators();
                    this.ASNFormGroup.get(key).updateValueAndValidity();
                } else {
                    if (fieldMaster.DefaultValue) {
                        // switch (key) {
                        //     case 'AWBDate':
                        //         if (!isNaN(Date.parse(fieldMaster.DefaultValue))) {
                        //             this.ASNFormGroup.get(key).patchValue(Date.parse(fieldMaster.DefaultValue));
                        //         }
                        //         break;
                        //     case 'DepartureDate':
                        //         if (!isNaN(Date.parse(fieldMaster.DefaultValue))) {
                        //             this.ASNFormGroup.get(key).patchValue(Date.parse(fieldMaster.DefaultValue));
                        //         }
                        //         break;
                        //     case 'ArrivalDate':
                        //         if (!isNaN(Date.parse(fieldMaster.DefaultValue))) {
                        //             this.ASNFormGroup.get(key).patchValue(Date.parse(fieldMaster.DefaultValue));
                        //         }
                        //         break;
                        //     default:
                        //         this.ASNFormGroup.get(key).patchValue(fieldMaster.DefaultValue);
                        // }
                        if (key === 'AWBDate' || key === 'DepartureDate' || key === 'ArrivalDate') {
                            // if (!isNaN(Date.parse(fieldMaster.DefaultValue))) {
                            //     this.ASNFormGroup.get(key).patchValue(Date.parse(fieldMaster.DefaultValue));
                            // }
                            // else {
                            //     this.ASNFormGroup.get(key).patchValue('');
                            // }
                        } else {
                            this.ASNFormGroup.get(key).patchValue(fieldMaster.DefaultValue);
                        }
                    } else {
                        // this.ASNFormGroup.get(key).patchValue('');
                    }
                    if (fieldMaster.Mandatory) {
                        if (key === 'NetWeight' || key === 'GrossWeight' || key === 'VolumetricWeight') {
                            this.ASNFormGroup.get(key).setValidators([Validators.required, Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]);
                        } else if (key === 'NumberOfPacks') {
                            this.ASNFormGroup.get(key).setValidators([Validators.required, Validators.pattern('^[1-9][0-9]*$')]);
                        } else if (key === 'AccessibleValue') {
                            this.ASNFormGroup.get(key).setValidators([Validators.required, Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,2})?$')]);
                        } else if (key === 'ContactPersonNo') {
                            this.ASNFormGroup.get(key).setValidators([Validators.required, Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]);
                        }
                        else {
                            this.ASNFormGroup.get(key).setValidators(Validators.required);
                        }
                        this.ASNFormGroup.get(key).updateValueAndValidity();
                    } else {
                        if (key === 'NetWeight' || key === 'GrossWeight' || key === 'VolumetricWeight') {
                            this.ASNFormGroup.get(key).setValidators([Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]);
                        } else if (key === 'NumberOfPacks') {
                            this.ASNFormGroup.get(key).setValidators([Validators.pattern('^[1-9][0-9]*$')]);
                        } else if (key === 'AccessibleValue') {
                            this.ASNFormGroup.get(key).setValidators([Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,2})?$')]);
                        } else if (key === 'ContactPersonNo') {
                            this.ASNFormGroup.get(key).setValidators([Validators.pattern('^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}$')]);
                        }
                        else {
                            this.ASNFormGroup.get(key).clearValidators();
                        }
                        this.ASNFormGroup.get(key).updateValueAndValidity();
                    }

                }
            }
        });
    }
    CreateActionLogvalues(text): void {
        this.ActionLog = new ActionLog();
        this.ActionLog.UserID = this.currentUserID;
        this.ActionLog.AppName = "ASN";
        this.ActionLog.ActionText = text + " is Clicked";
        this.ActionLog.Action = text;
        this.ActionLog.CreatedBy = this.currentUserName;
        this._authservice.CreateActionLog(this.ActionLog).subscribe(
            (data) => {
                console.log(data);
            },
            (err) => {
                console.log(err);
            }
        );
    }
    GateEntryClicked(): void {
        const Actiontype = 'Perform gate entry for';
        const Catagory = 'ASN';
        this.OpenConfirmationDialog(Actiontype, Catagory);
        // this.GateEntry(this.SelectedASNListView);
    }

    GateEntry(Asn: ASNListView): void {
        this.CreateActionLogvalues("Gate Entry");
        this._gateService.CreateGateEntryByAsnList(Asn).subscribe(
            (data) => {
                // this.Gate = data as BPCGateHoveringVechicles;
                this.notificationSnackBarComponent.openSnackBar("Gate Entry Successfull", SnackBarStatus.success);
                this._shareParameterService.SetASNListView(null);
                this._router.navigate(['/orderfulfilment/asnlist']);
                // this.SearchClicked();
            },
            (err) => {
                this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
            }
        );
    }
}

export function MustValid(NetWeight: string, GrossWeight: string): ValidationErrors | null {
    return (formGroup: FormGroup) => {
        const NetWeightcontrol = formGroup.get(`${NetWeight}`);
        const GrossWeightcontrol = formGroup.get(`${GrossWeight}`);

        if (GrossWeightcontrol.errors && !GrossWeightcontrol.errors.mustValid) {
            // return if another validator has already found an error on the matchingControl
            return;
        }
        const NetWeightVAL = + NetWeightcontrol.value;
        const GrossWeightVAL = +GrossWeightcontrol.value;
        if (GrossWeightVAL < NetWeightVAL) {
            GrossWeightcontrol.setErrors({ mustValid: true });
        } else {
            GrossWeightcontrol.setErrors(null);
        }
    };

}

