import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails, UserWithRole, AppUsage } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormArray, AbstractControl, FormBuilder, Validators } from '@angular/forms';
import { BPCOFHeader, BPCOFItem } from 'app/models/OrderFulFilment';
import { BehaviorSubject } from 'rxjs';
import { MatPaginator, MatSort, MatTableDataSource, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { FuseConfigService } from '@fuse/services/config.service';
import { MasterService } from 'app/services/master.service';
import { FactService } from 'app/services/fact.service';
import { POService } from 'app/services/po.service';
import { VendorMasterService } from 'app/services/vendor-master.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { BPCPIHeader, BPCPIView, BPCPIItem, BPCProd } from 'app/models/customer';
import { BPCInvoiceAttachment, DocumentCenter, BPCCountryMaster, BPCCurrencyMaster, BPCDocumentCenterMaster } from 'app/models/ASN';
import { CustomerService } from 'app/services/customer.service';
import { ASNService } from 'app/services/asn.service';
import { fuseAnimations } from '@fuse/animations';
import { PO } from 'app/models/Dashboard';
import { BPCFact } from 'app/models/fact';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
    selector: 'app-purchase-indent',
    templateUrl: './purchase-indent.component.html',
    styleUrls: ['./purchase-indent.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class PurchaseIndentComponent implements OnInit {

    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserName: string;
    currentUserRole: string;
    MenuItems: string[];
    notificationSnackBarComponent: NotificationSnackBarComponent;
    IsProgressBarVisibile: boolean;
    SelectedBPCFact: BPCFact;
    AllPurchaseIndentHeaders: BPCPIHeader[] = [];
    PurchaseIndentFormGroup: FormGroup;
    PurchaseIndentItemFormGroup: FormGroup;
    InvoiceDetailsFormGroup: FormGroup;
    DocumentCenterFormGroup: FormGroup;
    AllUserWithRoles: UserWithRole[] = [];
    SelectedPIRNumber: string;
    PO: BPCOFHeader;
    POItems: BPCOFItem[] = [];
    SelectedPurchaseIndentHeader: BPCPIHeader;
    SelectedPurchaseIndentNumber: string;
    SelectedPurchaseIndentView: BPCPIView;
    AllPurchaseIndentItems: BPCPIItem[] = [];
    PurchaseIndentItemDisplayedColumns: string[] = [
        'Item',
        'Material',
        'MaterialText',
        'HSN',
        'OrderQty',
        // 'UOM',
        'DeliveryDate',
        'Action'
    ];
    PurchaseIndentItemDataSource: MatTableDataSource<BPCPIItem>;
    @ViewChild(MatPaginator) PurchaseIndentItemPaginator: MatPaginator;
    @ViewChild(MatSort) PurchaseIndentItemSort: MatSort;
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
    AllProd: BPCProd[] = [];
    AllProducts: BPCProd[] = [];
    isWeightError: boolean;
    @ViewChild('fileInput1') fileInput: ElementRef<HTMLElement>;
    selectedDocCenterMaster: BPCDocumentCenterMaster;
    ArrivalDateInterval: number;
    status_show: any;
    Material_Text: any;
    i: number;
    Status_pageload: any;
    isHidden = true;
    show: boolean;
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
        private _route: ActivatedRoute,
        private _router: Router,
        public snackBar: MatSnackBar,
        private dialog: MatDialog,
        private _formBuilder: FormBuilder,
        private _authService: AuthService,
    ) {
        this.SecretKey = this._authService.SecretKey;
        this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.authenticationDetails = new AuthenticationDetails();
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.IsProgressBarVisibile = false;
        this.PO = new BPCOFHeader();
        this.SelectedPurchaseIndentHeader = new BPCPIHeader();
        // mchng
        // this.SelectedPurchaseIndentHeader.Status = 'Open';
        // mchng
        this.SelectedPurchaseIndentView = new BPCPIView();
        this.SelectedPurchaseIndentNumber = '';
        this.invAttach = new BPCInvoiceAttachment();
        this.minDate = new Date();
        this.minDate.setDate(this.minDate.getDate() + 1);
        this.maxDate = new Date();
        this.isWeightError = false;
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
            if (this.MenuItems.indexOf('PurchaseIndent') < 0) {
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
        this.InitializePurchaseIndentFormGroup();
        this.InitializePurchaseIndentItemFormGroup();
        this.GetAllBPCCountryMasters();
        this.GetAllBPCCurrencyMasters();
        this.GetFactByPartnerID();
        this.GetAllProducts();
        this.GetPurchaseIndentBasedOnCondition();
        //     this.AllProd=[{Material:"001",
        //     MaterialText:"mad",
        //     Client:"001",
        //     Company
        // }]


    }
    CreateAppUsage(): void {
        const appUsage: AppUsage = new AppUsage();
        appUsage.UserID = this.currentUserID;
        appUsage.AppName = 'Purchase Indent';
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
    InitializePurchaseIndentFormGroup(): void {
        this.PurchaseIndentFormGroup = this._formBuilder.group({
            PIRNumber: [''],
            Date: [new Date(), Validators.required],
            ReferenceDoc: ['', Validators.required],
            // NetAmount: ['', [Validators.required, Validators.pattern('^([0-9]*[1-9][0-9]*(\\.[0-9]+)?|[0]*\\.[0-9]*[1-9][0-9]*)$')]],
            // GrossAmount: ['', [Validators.required, Validators.pattern('^([0-9]*[1-9][0-9]*(\\.[0-9]+)?|[0]*\\.[0-9]*[1-9][0-9]*)$')]],
            // Currency: ['', Validators.required],
            Status: [''],
        });
    }
    // SetInitialValueForPurchaseIndentFormGroup(): void {
    //     this.PurchaseIndentFormGroup.get('Date').patchValue('Road');
    //     this.PurchaseIndentFormGroup.get('AWBDate').patchValue(new Date());
    //     this.PurchaseIndentFormGroup.get('NetAmountUOM').patchValue('KG');
    //     this.PurchaseIndentFormGroup.get('GrossAmountUOM').patchValue('KG');
    //     this.PurchaseIndentFormGroup.get('DepartureDate').patchValue(new Date());
    //     this.PurchaseIndentFormGroup.get('ArrivalDate').patchValue(this.minDate);
    //     this.PurchaseIndentFormGroup.get('CountryOfOrigin').patchValue('IND');
    // }
    InitializePurchaseIndentItemFormGroup(): void {
        this.PurchaseIndentItemFormGroup = this._formBuilder.group({
            Item: ['', Validators.required],
            // ProdcutID: ['', Validators.required],
            MaterialText: [''],

            HSN: ['', Validators.required],
            OrderQty: ['', [Validators.required, Validators.pattern('^([1-9][0-9]*)([.][0-9]{1,2})?$')]],

            DeliveryDate: ['', Validators.required],
            // UOM: [''],
            Material: ['', Validators.required],

        });
    }

    ResetControl(): void {
        this.SelectedPurchaseIndentHeader = new BPCPIHeader();
        // mchng
        // this.SelectedPurchaseIndentHeader.Status = 'Open';
        // mchng
        this.SelectedPurchaseIndentView = new BPCPIView();
        this.SelectedPurchaseIndentNumber = '';
        this.ResetPurchaseIndentFormGroup();
        // this.SetInitialValueForPurchaseIndentFormGroup();
        this.ResetPurchaseIndentItemFormGroup();
        this.ResetAttachments();
        this.AllPurchaseIndentItems = [];
        this.PurchaseIndentItemDataSource = new MatTableDataSource(this.AllPurchaseIndentItems);
        this.isWeightError = false;
        this.selectedDocCenterMaster = new BPCDocumentCenterMaster();
    }

    ResetPurchaseIndentFormGroup(): void {
        this.ResetFormGroup(this.PurchaseIndentFormGroup);
    }
    ResetPurchaseIndentItemFormGroup(): void {
        this.ResetFormGroup(this.PurchaseIndentItemFormGroup);
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
    selectionChange(ProductId) {
        //    this. Material_Text=Materialtext
        console.log("Materialtext", ProductId.value);
        //     const PODItemFormArray = this. AllProducts 
        //   PODItemFormArray.controls.forEach((x, i) => {})
        for (this.i = 0; this.i <= this.AllProducts.length; this.i++) {
            if (this.AllProducts[this.i].ProductID === ProductId.value) {
                this.Material_Text = this.AllProducts[this.i].MaterialText;
            }
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
    GetPurchaseIndentBasedOnCondition(): void {
        if (this.SelectedPIRNumber) {

            this.GetPurchaseIndentByPIAndPartnerID();

        }
    }


    DateSelected(event): void {
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

    ProductSelected(event): void {
        if (event.value) {
            const selectedProd = this.AllProducts.filter(x => x.ProductID === event.value)[0];
            if (selectedProd) {
                this.PurchaseIndentItemFormGroup.get('MaterialText').patchValue(selectedProd.MaterialText);
                this.PurchaseIndentItemFormGroup.get('MaterialText').disable();
                if (selectedProd.HSN) {
                    this.PurchaseIndentItemFormGroup.get('HSN').patchValue(selectedProd.HSN);
                    this.PurchaseIndentItemFormGroup.get('HSN').disable();
                } else {
                    this.PurchaseIndentItemFormGroup.get('HSN').enable();
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

    AddPurchaseIndentItemToTable(): void {
        if (this.PurchaseIndentItemFormGroup.valid) {
            const PIItem = new BPCPIItem();
            PIItem.Item = this.PurchaseIndentItemFormGroup.get('Item').value;
            // PIItem.ProdcutID = this.PurchaseIndentItemFormGroup.get('ProdcutID').value;
            PIItem.MaterialText = this.PurchaseIndentItemFormGroup.get('MaterialText').value;
            PIItem.HSN = this.PurchaseIndentItemFormGroup.get('HSN').value;
            PIItem.OrderQty = this.PurchaseIndentItemFormGroup.get('OrderQty').value;
            PIItem.DeliveryDate = this.PurchaseIndentItemFormGroup.get('DeliveryDate').value;
            // PIItem.UOM = this.PurchaseIndentItemFormGroup.get('UOM').value;
            PIItem.Material = this.PurchaseIndentItemFormGroup.get('Material').value;

            if (!this.AllPurchaseIndentItems || !this.AllPurchaseIndentItems.length) {
                this.AllPurchaseIndentItems = [];
            }
            this.AllPurchaseIndentItems.push(PIItem);
            this.PurchaseIndentItemDataSource = new MatTableDataSource(this.AllPurchaseIndentItems);
            this.ResetPurchaseIndentItemFormGroup();
            this.selectedDocCenterMaster = new BPCDocumentCenterMaster();
        } else {
            this.ShowValidationErrors(this.PurchaseIndentItemFormGroup);
        }
    }

    RemovePurchaseIndentItemFromTable(doc: BPCPIItem): void {
        const index: number = this.AllPurchaseIndentItems.indexOf(doc);
        if (index > -1) {
            this.AllPurchaseIndentItems.splice(index, 1);
        }
        this.PurchaseIndentItemDataSource = new MatTableDataSource(this.AllPurchaseIndentItems);
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

    // GetAllPurchaseIndentByPartnerID(): void {
    //     this._CustomerService.GetAllPurchaseIndentByPartnerID(this.currentUserName).subscribe(
    //         (data) => {
    //             this.AllPurchaseIndentHeaders = data as BPCPIHeader[];
    //             if (this.AllPurchaseIndentHeaders && this.AllPurchaseIndentHeaders.length) {
    //                 this.LoadSelectedPurchaseIndent(this.AllPurchaseIndentHeaders[0]);
    //             }
    //         },
    //         (err) => {
    //             console.error(err);
    //         }
    //     );
    // }

    GetPurchaseIndentByPIAndPartnerID(): void {
        this._CustomerService.GetPurchaseIndentByPIAndPartnerID(this.SelectedPIRNumber, this.currentUserName).subscribe(
            (data) => {
                this.SelectedPurchaseIndentHeader = data as BPCPIHeader;
                this.status_show = this.SelectedPurchaseIndentHeader.Status;
                console.log("status", this.status_show);
                if (this.status_show === "submitted") {
                    this.PurchaseIndentFormGroup.get('PIRNumber').disable();
                    this.PurchaseIndentFormGroup.get('Date').disable();
                    this.PurchaseIndentFormGroup.get('ReferenceDoc').disable();
                    this.PurchaseIndentFormGroup.get('Status').disable();
                    this.PurchaseIndentFormGroup.get('Date').disable();
                    this.show = true;
                }
                else if (this.status_show === "saved") {
                    this.PurchaseIndentFormGroup.get('PIRNumber').disable();
                    this.PurchaseIndentFormGroup.get('Status').disable();
                }


                if (this.SelectedPurchaseIndentHeader) {
                    this.LoadSelectedPurchaseIndent(this.SelectedPurchaseIndentHeader);
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }

    LoadSelectedPurchaseIndent(seletedPurchaseIndent: BPCPIHeader): void {
        this.SelectedPurchaseIndentHeader = seletedPurchaseIndent;
        this.SelectedPurchaseIndentView.PIRNumber = this.SelectedPurchaseIndentHeader.PIRNumber;
        this.SelectedPurchaseIndentNumber = this.SelectedPurchaseIndentHeader.PIRNumber;
        this.SetPurchaseIndentHeaderValues();
        this.GetPurchaseIndentItemsByPI();
    }

    GetPurchaseIndentItemsByPI(): void {
        this._CustomerService.GetPurchaseIndentItemsByPI(this.SelectedPurchaseIndentHeader.PIRNumber).subscribe(
            (data) => {
                const dt = data as BPCPIItem[];
                if (dt && dt.length && dt.length > 0) {
                    this.AllPurchaseIndentItems = data as BPCPIItem[];
                    this.PurchaseIndentItemDataSource = new MatTableDataSource(this.AllPurchaseIndentItems);
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }

    SetPurchaseIndentHeaderValues(): void {
        this.PurchaseIndentFormGroup.get('PIRNumber').patchValue(this.SelectedPurchaseIndentHeader.PIRNumber);
        this.PurchaseIndentFormGroup.get('Date').patchValue(this.SelectedPurchaseIndentHeader.Date);
        this.PurchaseIndentFormGroup.get('ReferenceDoc').patchValue(this.SelectedPurchaseIndentHeader.ReferenceDoc);
        // this.PurchaseIndentFormGroup.get('GrossAmount').patchValue(this.SelectedPurchaseIndentHeader.GrossAmount);
        // this.PurchaseIndentFormGroup.get('NetAmount').patchValue(this.SelectedPurchaseIndentHeader.NetAmount);
        this.PurchaseIndentFormGroup.get('PIRNumber').patchValue(this.SelectedPurchaseIndentHeader.PIRNumber);
        // this.PurchaseIndentFormGroup.get('Currency').patchValue(this.SelectedPurchaseIndentHeader.Currency);
        this.PurchaseIndentFormGroup.get('Status').patchValue(this.SelectedPurchaseIndentHeader.Status);

    }

    GetPurchaseIndentValues(action): void {
        if (this.SelectedBPCFact) {
            this.SelectedPurchaseIndentHeader.Client = this.SelectedPurchaseIndentView.Client = this.SelectedBPCFact.Client;
            this.SelectedPurchaseIndentHeader.Company = this.SelectedPurchaseIndentView.Company = this.SelectedBPCFact.Company;
            this.SelectedPurchaseIndentHeader.Type = this.SelectedPurchaseIndentView.Type = this.SelectedBPCFact.Type;
            this.SelectedPurchaseIndentHeader.PatnerID = this.SelectedPurchaseIndentView.PatnerID = this.SelectedBPCFact.PatnerID;
        }
        const depDate = this.PurchaseIndentFormGroup.get('Date').value;
        if (depDate) {
            this.SelectedPurchaseIndentHeader.Date = this.SelectedPurchaseIndentView.Date = this._datePipe.transform(depDate, 'yyyy-MM-dd HH:mm:ss');
        } else {
            this.SelectedPurchaseIndentHeader.Date = this.SelectedPurchaseIndentView.Date = this.PurchaseIndentFormGroup.get('Date').value;
        }
        this.SelectedPurchaseIndentHeader.ReferenceDoc = this.SelectedPurchaseIndentView.ReferenceDoc = this.PurchaseIndentFormGroup.get('ReferenceDoc').value;
        // this.SelectedPurchaseIndentHeader.GrossAmount = this.SelectedPurchaseIndentView.GrossAmount = this.PurchaseIndentFormGroup.get('GrossAmount').value;
        // this.SelectedPurchaseIndentHeader.NetAmount = this.SelectedPurchaseIndentView.NetAmount = this.PurchaseIndentFormGroup.get('NetAmount').value;
        // this.SelectedPurchaseIndentHeader.Currency = this.SelectedPurchaseIndentView.Currency = this.PurchaseIndentFormGroup.get('Currency').value;
        if (this.SelectedPIRNumber) {
            // this.SelectedPurchaseIndentHeader.Client = this.SelectedPurchaseIndentView.Client = this.PO.Client;
            // this.SelectedPurchaseIndentHeader.Company = this.SelectedPurchaseIndentView.Company = this.PO.Company;
            // this.SelectedPurchaseIndentHeader.Type = this.SelectedPurchaseIndentView.Type = this.PO.Type;
            // this.SelectedPurchaseIndentHeader.PatnerID = this.SelectedPurchaseIndentView.PatnerID = this.PO.PatnerID;
            // // this.SelectedPurchaseIndentHeader.Status = this.SelectedPurchaseIndentView.Status = this.SelectedPurchaseIndentHeader.Status;
            // if(action=="submitted")
            // this.SelectedPurchaseIndentHeader.Status = this.SelectedPurchaseIndentView.Status = "20";
            // else if(action=="saved")
            // {
            //     this.SelectedPurchaseIndentHeader.Status = this.SelectedPurchaseIndentView.Status = "10";
            // }
        }
        else {
            // this.SelectedPurchaseIndentHeader.Client = this.SelectedPurchaseIndentView.Client = this.SelectedPurchaseIndentHeader.Client;
            // this.SelectedPurchaseIndentHeader.Company = this.SelectedPurchaseIndentView.Company = this.SelectedPurchaseIndentHeader.Company;
            if (action === "submitted") {
                this.SelectedPurchaseIndentHeader.Status = this.SelectedPurchaseIndentView.Status = "20";
            }
            else if (action === "saved") {
                this.SelectedPurchaseIndentHeader.Status = this.SelectedPurchaseIndentView.Status = "10";
            }
        }
    }

    calculateDiff(sentDate): number {
        const dateSent: Date = new Date(sentDate);
        const currentDate: Date = new Date();
        return Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) -
            Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    }

    GetPurchaseIndentItemValues(): void {
        this.SelectedPurchaseIndentView.Items = [];
        if (this.AllPurchaseIndentItems != null) {
            this.AllPurchaseIndentItems.forEach(x => {
                if (this.SelectedBPCFact) {
                    x.Client = this.SelectedBPCFact.Client;
                    x.Company = this.SelectedBPCFact.Company;
                    x.Type = this.SelectedBPCFact.Type;
                    x.PatnerID = this.SelectedBPCFact.PatnerID;
                }
                this.SelectedPurchaseIndentView.Items.push(x);
            });
        }
    }

    SaveClicked(): void {
        if (this.PurchaseIndentFormGroup.valid) {
            if (!this.isWeightError) {
                // if (this.PurchaseIndentItemFormGroup.valid) {
                //     if (this.InvoiceDetailsFormGroup.valid) {
                this.GetPurchaseIndentValues("saved");
                this.GetPurchaseIndentItemValues();
                // this.GetInvoiceDetailValues();
                // this.GetDocumentCenterValues();
                // this.SelectedPurchaseIndentView.IsSubmitted = false;
                this.SetActionToOpenConfirmation('Save');
                //     } else {
                //         this.ShowValidationErrors(this.InvoiceDetailsFormGroup);
                //     }

                // } else {
                //     this.ShowValidationErrors(this.PurchaseIndentItemFormGroup);
                // }
            }

        } else {
            this.ShowValidationErrors(this.PurchaseIndentFormGroup);
        }
    }
    SubmitClicked(): void {
        if ((this.PurchaseIndentFormGroup.valid)) {
            // if(this.PurchaseIndentFormGroup.valid) {
            if (!this.isWeightError) {
                // if (this.PurchaseIndentItemFormGroup.valid) {
                //     if (this.InvoiceDetailsFormGroup.valid) {
                this.GetPurchaseIndentValues("submitted");
                this.GetPurchaseIndentItemValues();
                // this.GetInvoiceDetailValues();
                // this.GetDocumentCenterValues();
                // this.SelectedPurchaseIndentView.IsSubmitted = true;
                // if (!this.SelectedPIRNumber) {
                //     this.length = 0;
                // }
                // else if (this.SelectedPIRNumber) {
                //     this.length = this.PurchaseIndentItemDataSource.data.length;
                // }

                if (this.AllPurchaseIndentItems.length && this.AllPurchaseIndentItems.length !== 0) {
                    this.SetActionToOpenConfirmation('Submit');
                }
                else if (this.AllPurchaseIndentItems.length === 0) {
                    this.notificationSnackBarComponent.openSnackBar('Minimum one item should be in table', SnackBarStatus.danger);
                }

                // if ((this.PurchaseIndentItemFormGroup.status === "VALID" || this.AllPurchaseIndentItems.length) && this.length !== 0) {
                //     this.SetActionToOpenConfirmation('Submit');
                // }
                // else if (this.PurchaseIndentItemFormGroup.status === "INVALID" && this.length === 0) {
                //     // this.ShowValidationErrors(this.PurchaseIndentItemFormGroup);
                //     this.ShowValidationErrors(this.PurchaseIndentItemFormGroup);
                // }
                // else if (this.PurchaseIndentItemFormGroup.status === "VALID" && this.length === 0) {
                //     this.notificationSnackBarComponent.openSnackBar('Maximum one item should be in table', SnackBarStatus.danger);

                // }

                //     } else {
                //         this.ShowValidationErrors(this.InvoiceDetailsFormGroup);
                //     }

                // } else {
                //     this.ShowValidationErrors(this.PurchaseIndentItemFormGroup);
                // }
            }
            // }
            // else {
            //     this.ShowValidationErrors(this.PurchaseIndentFormGroup);

            // }
        }
        else {
            // this.ShowValidationErrors(this.PurchaseIndentItemFormGroup);
            this.ShowValidationErrors(this.PurchaseIndentFormGroup);
        }
    }
    DeleteClicked(): void {
        if (this.SelectedPurchaseIndentHeader.PIRNumber) {
            const Actiontype = 'Delete';
            const Catagory = 'PurchaseIndent';
            this.OpenConfirmationDialog(Actiontype, Catagory);
        }
    }
    SetActionToOpenConfirmation(Actiontype: string): void {
        // if (this.SelectedPurchaseIndentHeader.PurchaseIndentNumber) {
        //     const Catagory = 'PurchaseIndent';
        //     this.OpenConfirmationDialog(Actiontype, Catagory);
        // } else {
        //     const Catagory = 'PurchaseIndent';
        //     this.OpenConfirmationDialog(Actiontype, Catagory);
        // }
        const Catagory = 'PurchaseIndent';
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
                        if (this.SelectedPurchaseIndentHeader.PIRNumber) {
                            this.UpdatePurchaseIndent(Actiontype);
                        } else {
                            this.CreatePurchaseIndent(Actiontype);
                        }
                    } else if (Actiontype === 'Delete') {
                        this.DeletePurchaseIndent();
                    }
                }
            });
    }


    CreatePurchaseIndent(Actiontype: string): void {
        // this.GetPurchaseIndentValues();
        // this.GetBPPurchaseIndentSubItemValues();
        // this.SelectedPurchaseIndentView.CreatedBy = this.authenticationDetails.UserID.toString();
        this.IsProgressBarVisibile = true;
        if (Actiontype === 'Submit') {
            this.SelectedPurchaseIndentView.Status = '20';
        }
        else if (Actiontype === 'Save') {
            this.SelectedPurchaseIndentView.Status = '10';
        }
        console.log("SelectedPurchaseIndentView" + this.SelectedPurchaseIndentView);
        // mchng
        this._CustomerService.CreatePurchaseIndent(this.SelectedPurchaseIndentView).subscribe(
            (data) => {
                this.SelectedPurchaseIndentHeader.PIRNumber = (data as BPCPIHeader).PIRNumber;
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar(`PurchaseIndent ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
            },
            (err) => {
                this.showErrorNotificationSnackBar(err);
            }
        );
        // mchng
    }

    // AddInvoiceAttachment(Actiontype: string): void {
    //     this._CustomerService.AddInvoiceAttachment(this.SelectedPurchaseIndentHeader.PIRNumber, this.currentUserID.toString(), this.invoiceAttachment).subscribe(
    //         (dat) => {
    //             if (this.fileToUploadList && this.fileToUploadList.length) {
    //                 this.AddDocumentCenterAttachment(Actiontype);
    //             } else {
    //                 this.ResetControl();
    //                 this.notificationSnackBarComponent.openSnackBar(`PurchaseIndent ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
    //                 this.IsProgressBarVisibile = false;
    //                 this.GetPurchaseIndentBasedOnCondition();
    //             }
    //         },
    //         (err) => {
    //             this.showErrorNotificationSnackBar(err);
    //         });
    // }
    // AddDocumentCenterAttachment(Actiontype: string): void {
    //     this._CustomerService.AddDocumentCenterAttachment(this.SelectedPurchaseIndentHeader.PurchaseIndentNumber, this.currentUserID.toString(), this.fileToUploadList).subscribe(
    //         (dat) => {
    //             this.ResetControl();
    //             this.notificationSnackBarComponent.openSnackBar(`PurchaseIndent ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
    //             this.IsProgressBarVisibile = false;
    //             this.GetPurchaseIndentBasedOnCondition();
    //         },
    //         (err) => {
    //             this.showErrorNotificationSnackBar(err);
    //         }
    //     );
    // }

    showErrorNotificationSnackBar(err: any): void {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
    }

    UpdatePurchaseIndent(Actiontype: string): void {
        // this.GetPurchaseIndentValues();
        // this.GetBPPurchaseIndentSubItemValues();
        // this.SelectedBPPurchaseIndentView.TransID = this.SelectedBPPurchaseIndent.TransID;
        // this.SelectedPurchaseIndentView.ModifiedBy = this.authenticationDetails.UserID.toString();
        this.IsProgressBarVisibile = true;
        if (Actiontype === 'Submit') {
            this.SelectedPurchaseIndentView.Status = '20';
        }
        else if (Actiontype === 'Save') {
            this.SelectedPurchaseIndentView.Status = '10';
        }
        console.log("SelectedPurchaseIndentView" + this.SelectedPurchaseIndentView);
        // mchng
        this._CustomerService.UpdatePurchaseIndent(this.SelectedPurchaseIndentView).subscribe(
            (data) => {
                this.SelectedPurchaseIndentHeader.PIRNumber = (data as BPCPIHeader).PIRNumber;
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar(`PurchaseIndent ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                this.IsProgressBarVisibile = false;
            }
        );
        // mchng
    }

    DeletePurchaseIndent(): void {
        // mchng
        // this.GetPurchaseIndentValues();
        // mchng
        // this.SelectedBPPurchaseIndent.ModifiedBy = this.authenticationDetails.userID.toString();
        this.IsProgressBarVisibile = true;
        this._CustomerService.DeletePurchaseIndent(this.SelectedPurchaseIndentHeader).subscribe(
            (data) => {
                // console.log(data);
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar('PurchaseIndent deleted successfully', SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                // this.GetPurchaseIndentBasedOnCondition();
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

    // GetInvoiceAttachment(fileName: string, file?: File): void {
    //     if (file && file.size) {
    //         const blob = new Blob([file], { type: file.type });
    //         this.OpenAttachmentDialog(fileName, blob);
    //     } else {
    //         this.IsProgressBarVisibile = true;
    //         this._CustomerService.DowloandInvoiceAttachment(fileName, this.SelectedPurchaseIndentHeader.PurchaseIndentNumber).subscribe(
    //             data => {
    //                 if (data) {
    //                     let fileType = 'image/jpg';
    //                     fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
    //                         fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
    //                             fileName.toLowerCase().includes('.png') ? 'image/png' :
    //                                 fileName.toLowerCase().includes('.gif') ? 'image/gif' :
    //                                     fileName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
    //                     const blob = new Blob([data], { type: fileType });
    //                     this.OpenAttachmentDialog(fileName, blob);
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

    // GetDocumentCenterAttachment(fileName: string): void {
    //     const file = this.fileToUploadList.filter(x => x.name === fileName)[0];
    //     if (file && file.size) {
    //         const blob = new Blob([file], { type: file.type });
    //         this.OpenAttachmentDialog(fileName, blob);
    //     } else {
    //         this.IsProgressBarVisibile = true;
    //         this._CustomerService.DowloandDocumentCenterAttachment(fileName, this.SelectedPurchaseIndentHeader.PurchaseIndentNumber).subscribe(
    //             data => {
    //                 if (data) {
    //                     let fileType = 'image/jpg';
    //                     fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
    //                         fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
    //                             fileName.toLowerCase().includes('.png') ? 'image/png' :
    //                                 fileName.toLowerCase().includes('.gif') ? 'image/gif' :
    //                                     fileName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
    //                     const blob = new Blob([data], { type: fileType });
    //                     this.OpenAttachmentDialog(fileName, blob);
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

    AmountSelected(): void {
        const GrossAmountVAL = +this.PurchaseIndentFormGroup.get('GrossAmount').value;
        const NetAmountVAL = + this.PurchaseIndentFormGroup.get('NetAmount').value;
        if (GrossAmountVAL && GrossAmountVAL && GrossAmountVAL <= NetAmountVAL) {
            this.isWeightError = true;
        } else {
            this.isWeightError = false;
        }
    }

    getStatusColor(StatusFor: string): string {
        switch (StatusFor) {
            case 'saved':
                return this.SelectedPurchaseIndentHeader.Status === 'saved' ? '#34ad65' :
                    this.SelectedPurchaseIndentHeader.Status === 'submitted' ? '#34ad65' :
                        this.SelectedPurchaseIndentHeader.Status === 'created' ? '#34ad65' :
                            this.SelectedPurchaseIndentHeader.Status === 'cancelled' ? '#34ad65' : 'gray';


            case 'submitted':
                return this.SelectedPurchaseIndentHeader.Status === 'saved' ? 'gray' :
                    this.SelectedPurchaseIndentHeader.Status === 'submitted' ? '#34ad65' :
                        this.SelectedPurchaseIndentHeader.Status === 'created' ? '#34ad65' :
                            this.SelectedPurchaseIndentHeader.Status === 'cancelled' ? '#34ad65' : 'gray';

            case 'created':
                return this.SelectedPurchaseIndentHeader.Status === 'saved' ? 'gray' :
                    this.SelectedPurchaseIndentHeader.Status === 'submitted' ? 'gray' :
                        this.SelectedPurchaseIndentHeader.Status === 'created' ? '#34ad65' :
                            this.SelectedPurchaseIndentHeader.Status === 'cancelled' ? '#34ad65' : 'gray';
            case 'cancelled':
                return this.SelectedPurchaseIndentHeader.Status === 'saved' ? 'gray' :
                    this.SelectedPurchaseIndentHeader.Status === 'submitted' ? 'gray' :
                        this.SelectedPurchaseIndentHeader.Status === 'created' ? 'gray' :
                            this.SelectedPurchaseIndentHeader.Status === 'cancelled' ? '#34ad65' : 'gray';
            default:
                return '';
        }
    }

    getTimeline(StatusFor: string): string {
        switch (StatusFor) {
            case 'saved':
                return this.SelectedPurchaseIndentHeader.Status === 'saved' ? 'green-timeline' :
                    this.SelectedPurchaseIndentHeader.Status === 'submitted' ? 'green-timeline' :
                        this.SelectedPurchaseIndentHeader.Status === 'created' ? 'green-timeline' :
                            this.SelectedPurchaseIndentHeader.Status === 'cancelled' ? 'green-timeline' : 'white-timeline';
            case 'submitted':
                return this.SelectedPurchaseIndentHeader.Status === 'saved' ? 'white-timeline' :
                    this.SelectedPurchaseIndentHeader.Status === 'submitted' ? 'green-timeline' :
                        this.SelectedPurchaseIndentHeader.Status === 'created' ? 'green-timeline' :
                            this.SelectedPurchaseIndentHeader.Status === 'cancelled' ? 'green-timeline' : 'white-timeline';


            case 'created':
                return this.SelectedPurchaseIndentHeader.Status === 'saved' ? 'white-timeline' :
                    this.SelectedPurchaseIndentHeader.Status === 'submitted' ? 'white-timeline' :
                        this.SelectedPurchaseIndentHeader.Status === 'created' ? 'green-timeline' :
                            this.SelectedPurchaseIndentHeader.Status === 'cancelled' ? 'green-timeline' : 'white-timeline';
            // case 'created':
            //     return this.SelectedPurchaseIndentHeader.Status === 'Open' ? 'white-timeline' :
            //         this.SelectedPurchaseIndentHeader.Status === 'SO' ? 'white-timeline' :
            //             this.SelectedPurchaseIndentHeader.Status === 'saved' ? 'white-timeline' :
            //                 this.SelectedPurchaseIndentHeader.Status === 'Invoiced' ? 'orange-timeline' : 'green-timeline';
            case 'cancelled':
                return this.SelectedPurchaseIndentHeader.Status === 'saved' ? 'white-timeline' :
                    this.SelectedPurchaseIndentHeader.Status === 'submitted' ? 'white-timeline' :
                        this.SelectedPurchaseIndentHeader.Status === 'created' ? 'white-timeline' :
                            this.SelectedPurchaseIndentHeader.Status === 'cancelled' ? 'green-timeline' : 'white-timeline';
            default:
                return '';
        }
    }
    getRestTimeline(StatusFor: string): string {
        switch (StatusFor) {
            case 'saved':
                return this.SelectedPurchaseIndentHeader.Status === 'saved' ? 'white-timeline' :
                    this.SelectedPurchaseIndentHeader.Status === 'submitted' ? 'green-timeline' :
                        this.SelectedPurchaseIndentHeader.Status === 'created' ? 'green-timeline' :
                            this.SelectedPurchaseIndentHeader.Status === 'cancelled' ? 'green-timeline' : 'white-timeline';
            case 'submitted':
                return this.SelectedPurchaseIndentHeader.Status === 'saved' ? 'white-timeline' :
                    this.SelectedPurchaseIndentHeader.Status === 'submitted' ? 'white-timeline' :
                        this.SelectedPurchaseIndentHeader.Status === 'created' ? 'green-timeline' :
                            this.SelectedPurchaseIndentHeader.Status === 'cancelled' ? 'green-timeline' : 'white-timeline';


            case 'created':
                return this.SelectedPurchaseIndentHeader.Status === 'saved' ? 'white-timeline' :
                    this.SelectedPurchaseIndentHeader.Status === 'submitted' ? 'white-timeline' :
                        this.SelectedPurchaseIndentHeader.Status === 'created' ? 'white-timeline' :
                            this.SelectedPurchaseIndentHeader.Status === 'cancelled' ? 'green-timeline' : 'white-timeline';
            // case 'created':
            //     return this.SelectedPurchaseIndentHeader.Status === 'Open' ? 'white-timeline' :
            //         this.SelectedPurchaseIndentHeader.Status === 'SO' ? 'white-timeline' :
            //             this.SelectedPurchaseIndentHeader.Status === 'saved' ? 'white-timeline' :
            //                 this.SelectedPurchaseIndentHeader.Status === 'Invoiced' ? 'orange-timeline' : 'green-timeline';
            // case 'cancelled':
            //     return this.SelectedPurchaseIndentHeader.Status === 'saved' ? 'white-timeline' :
            //     this.SelectedPurchaseIndentHeader.Status === 'submitted' ? 'white-timeline' :
            //         this.SelectedPurchaseIndentHeader.Status === 'created' ?  'white-timeline' :
            //             this.SelectedPurchaseIndentHeader.Status === 'cancelled' ? 'green-timeline' : 'white-timeline';
            default:
                return '';
        }
    }
    getStatusDate(StatusFor: string): string {
        const tt = this._datePipe.transform(this.maxDate, 'dd/MM/yyyy');
        switch (StatusFor) {
            case 'SO':
                return this.SelectedPurchaseIndentHeader.Status === 'Open' ? '' : tt;
            case 'Shipped':
                return this.SelectedPurchaseIndentHeader.Status === 'Open' ? '' :
                    this.SelectedPurchaseIndentHeader.Status === 'SO' ? '' : tt;
            case 'Invoiced':
                return this.SelectedPurchaseIndentHeader.Status === 'Open' ? '' :
                    this.SelectedPurchaseIndentHeader.Status === 'SO' ? '' :
                        this.SelectedPurchaseIndentHeader.Status === 'Shipped' ? '' : tt;
            case 'Receipt':
                return this.SelectedPurchaseIndentHeader.Status === 'Open' ? '' :
                    this.SelectedPurchaseIndentHeader.Status === 'SO' ? '' :
                        this.SelectedPurchaseIndentHeader.Status === '' ? '' :
                            this.SelectedPurchaseIndentHeader.Status === '' ? '' : tt;
            default:
                return '';
        }
    }
}
