import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialogConfig, MatDialog, MatSort } from '@angular/material';
import { ASNDetails, ItemDetails, GRNDetails, QADetails, OrderFulfilmentDetails, Acknowledgement, SLDetails, DocumentDetails, FlipDetails } from 'app/models/Dashboard';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from 'app/services/dashboard.service';
import { FormGroup, FormBuilder, Validators, FormArray, AbstractControl } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { fuseAnimations } from '@fuse/animations';
import { Guid } from 'guid-typescript';
import { AuthenticationDetails, AppUsage } from 'app/models/master';
import { MasterService } from 'app/services/master.service';
import { BPCOFHeader, BPCPlantMaster, OfAttachmentData } from 'app/models/OrderFulFilment';
import { BPCPIHeader } from 'app/models/customer';
import { CustomerService } from 'app/services/customer.service';
import { BPCASNItemSES, BPCInvoiceAttachment } from 'app/models/ASN';
import { AttachmentViewDialogComponent } from 'app/notifications/attachment-view-dialog/attachment-view-dialog.component';
import { NotificationDialog1Component } from 'app/notifications/notification-dialog1/notification-dialog1.component';
import { Location } from '@angular/common';
import { PoFactServiceDialogComponent } from '../po-fact-service-dialog/po-fact-service-dialog.component';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
    selector: 'app-po-factsheet',
    templateUrl: './po-factsheet.component.html',
    styleUrls: ['./po-factsheet.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class PoFactsheetComponent implements OnInit {

    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserName: string;
    currentUserRole: string;
    partnerID: string;
    isProgressBarVisibile: boolean;
    DocumentType: string;
    DocumentNumber: string;
    isDeliveryDateMismatched: boolean;

    public tab1: boolean;
    public tab2: boolean;
    public tab3: boolean;
    public tab4: boolean;
    public tab5: boolean;
    public tab6: boolean;
    public tab7: boolean;
    public tab8: boolean;
    public tabCount: number;

    orderFulfilmentDetails: OrderFulfilmentDetails = new OrderFulfilmentDetails();
    items: ItemDetails[] = [];
    asn: ASNDetails[] = [];
    grn: GRNDetails[] = [];
    return: GRNDetails[] = [];
    qa: QADetails[] = [];
    sl: SLDetails[] = [];
    element: BPCOFHeader;
    document: DocumentDetails[] = [];
    flip: FlipDetails[] = [];
    public itemsCount: number;
    public asnCount: number;
    public grnCount: number;
    public returnCount: number;
    public qaCount: number;
    public slCount: number;
    public documentCount: number;
    public flipCount: number;
    ItemPlantDetails: BPCPlantMaster;
    itemDisplayedColumns: string[] = [
        'Item',
        'Material',
        'Description',
        'DeliveryDate',
        'Proposeddeliverydate',
        'OrderQty',
        'GRQty',
        'PipelineQty',
        'OpenQty',
        'UOM',
        // 'PlantCode',
        'UnitPrice',
        'Value',
        // 'TaxAmount',
        // 'TaxCode'
        'Service'
    ];
    asnDisplayedColumns: string[] = [
        'ASN',
        'Date',
        'Truck',
        'Status',
        'QRCode',
        'PrintASN'
    ];
    grnDisplayedColumns: string[] = [
        'GRGIDoc',
        'Item',
        'Material',
        'Description',
        'GRNDate',
        'Qty',
        'DeliveryNote'
    ];
    returnDisplayedColumns: string[] = [
        'GRGIDoc',
        'Item',
        'Material',
        'Description',
        'GRNDate',
        'Qty',
        'DeliveryNote'
    ];
    qaDisplayedColumns: string[] = [
        'Item',
        'SerialNumber',
        'Material',
        'MaterialText',
        'Date',
        // 'LotQty',
        'RejQty',
        'RejReason'
    ];
    slDisplayedColumns: string[] = [
        'Item',
        'SlLine',
        'DeliveryDate',
        'OrderedQty',
        'Material',
        'Description',
        // 'Proposeddeliverydate',
        // 'OrderQty',
        // 'GRQty',
        // 'PipelineQty',
        'OpenQty',
        'UOM'
    ];
    documentDisplayedColumns: string[] = [
        'ReferenceNo',
        'AttachmentName',
        'CreatedOn',
        'ContentType'
    ];
    flipDisplayedColumns: string[] = [
        'FLIPID',
        'InvoiceNumber',
        'InvoiceDate',
        'InvoiceAmount'
    ];
    itemDataSource = new BehaviorSubject<AbstractControl[]>([]);
    // itemDataSource: MatTableDataSource<ItemDetails>;
    asnDataSource: MatTableDataSource<ASNDetails>;
    grnDataSource: MatTableDataSource<GRNDetails>;
    returnDataSource: MatTableDataSource<GRNDetails>;
    qaDataSource: MatTableDataSource<QADetails>;
    slDataSource: MatTableDataSource<SLDetails>;
    documentDataSource: MatTableDataSource<DocumentDetails>;
    flipDataSource: MatTableDataSource<FlipDetails>;

    @ViewChild(MatPaginator) itemPaginator: MatPaginator;
    @ViewChild(MatPaginator) asnPaginator: MatPaginator;
    @ViewChild(MatPaginator) grnPaginator: MatPaginator;
    @ViewChild(MatPaginator) returnPaginator: MatPaginator;
    @ViewChild(MatPaginator) qaPaginator: MatPaginator;
    @ViewChild(MatPaginator) slPaginator: MatPaginator;
    @ViewChild(MatPaginator) documentPaginator: MatPaginator;
    @ViewChild(MatPaginator) flipPaginator: MatPaginator;

    @ViewChild(MatSort) itemSort: MatSort;
    @ViewChild(MatSort) asnSort: MatSort;
    @ViewChild(MatSort) grnSort: MatSort;
    @ViewChild(MatSort) returnSort: MatSort;
    @ViewChild(MatSort) qaSort: MatSort;
    @ViewChild(MatSort) slSort: MatSort;
    @ViewChild(MatSort) documentSort: MatSort;
    @ViewChild(MatSort) flipSort: MatSort;

    PO: any;
    poStatus: string;
    gateStatus: string;
    grnStatus: string;
    ackFormGroup: FormGroup;
    acknowledgement: Acknowledgement = new Acknowledgement();
    poItemFormArray: FormArray = this.formBuilder.array([]);
    ret: BPCPIHeader[];
    ofAttachments: BPCInvoiceAttachment[];
    yesterday = new Date();
    SecretKey: string;
    SecureStorage: SecureLS;
    constructor(
        private route: ActivatedRoute,
        public _dashboardService: DashboardService,
        public _customerService: CustomerService,
        private _masterService: MasterService,
        private _router: Router,
        private formBuilder: FormBuilder,
        private datepipe: DatePipe,
        private dialog: MatDialog,
        private _location: Location,
        private _authService: AuthService,


    ) {
        this.tab1 = true;
        this.tab2 = false;
        this.tab3 = false;
        this.tab4 = false;
        this.tab5 = false;
        this.tab6 = false;
        this.tab7 = false;
        this.tab8 = false;
        this.ItemPlantDetails = new BPCPlantMaster();
        this.isDeliveryDateMismatched = false;
        this.SecretKey = this._authService.SecretKey;
        this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    }

    ngOnInit(): void {
        const retrievedObject = this.SecureStorage.get('authorizationData');
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
            this.currentUserID = this.authenticationDetails.UserID;
            this.currentUserName = this.authenticationDetails.UserName;
            this.partnerID = this.authenticationDetails.UserName;
            this.currentUserRole = this.authenticationDetails.UserRole;
            // this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
            // // console.log(this.authenticationDetails);
            // if (this.menuItems.indexOf('Dashboard') < 0) {
            //     this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
            //     );
            //     this._router.navigate(['/auth/login']);
            // }
        } else {
            this._router.navigate(['/auth/login']);
        }

        this.route.queryParams.subscribe(params => {
            this.PO = params['id'];
        });
        this.tabCount = 1;
        this.CreateAppUsage();
        this.GetOfDetailsByPartnerIDAndDocNumber();
        this.initializeACKFormGroup();
        this.initializePOItemFormGroup();
        this.GetBPCHeaderDocType();
    }

    CreateAppUsage(): void {
        const appUsage: AppUsage = new AppUsage();
        appUsage.UserID = this.currentUserID;
        appUsage.AppName = 'PO Factsheet';
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

    GetOfDetailsByPartnerIDAndDocNumber(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService.GetOrderFulfilmentDetails(this.PO, this.partnerID).subscribe(
            data => {
                // console.log("details", data);
                if (data) {
                    this.orderFulfilmentDetails = <OrderFulfilmentDetails>data;
                    this.poStatus = this.orderFulfilmentDetails.Status;
                    this.gateStatus = this.orderFulfilmentDetails.GateStatus;
                    this.grnStatus = this.orderFulfilmentDetails.GRNStatus;
                    this.asn = this.orderFulfilmentDetails.aSNDetails;
                    // console.log("asn", this.asn);
                    this.items = this.orderFulfilmentDetails.itemDetails;
                    if (this.items.length > 0) {
                        this.GetItemPlantDetails(this.items[0].PlantCode);
                    }
                    this.grn = this.orderFulfilmentDetails.gRNDetails;
                    this.qa = this.orderFulfilmentDetails.qADetails;
                    this.sl = this.orderFulfilmentDetails.slDetails;
                    this.return = this.orderFulfilmentDetails.ReturnDetails;
                    this.document = this.orderFulfilmentDetails.documentDetails;
                    this.flip = this.orderFulfilmentDetails.flipDetails;
                    this.itemsCount = this.orderFulfilmentDetails.ItemCount;
                    this.asnCount = this.orderFulfilmentDetails.ASNCount;
                    this.grnCount = this.orderFulfilmentDetails.GRNCount;
                    this.returnCount = this.orderFulfilmentDetails.ReturnCount;
                    this.qaCount = this.orderFulfilmentDetails.QACount;
                    this.slCount = this.orderFulfilmentDetails.SLCount;
                    this.documentCount = this.orderFulfilmentDetails.DocumentCount;
                    this.flipCount = this.orderFulfilmentDetails.FlipCount;
                    this.asnDataSource = new MatTableDataSource(this.asn);
                    this.grnDataSource = new MatTableDataSource(this.grn);
                    // console.log("grnDataSource", this.grnDataSource.data);
                    this.returnDataSource = new MatTableDataSource(this.return);
                    this.qaDataSource = new MatTableDataSource(this.qa);
                    this.slDataSource = new MatTableDataSource(this.sl);
                    this.documentDataSource = new MatTableDataSource(this.document);
                    this.flipDataSource = new MatTableDataSource(this.flip);

                    this.asnDataSource.paginator = this.asnPaginator;
                    this.grnDataSource.paginator = this.grnPaginator;
                    this.returnDataSource.paginator = this.returnPaginator;
                    this.qaDataSource.paginator = this.qaPaginator;
                    this.slDataSource.paginator = this.slPaginator;
                    this.documentDataSource.paginator = this.documentPaginator;
                    this.flipDataSource.paginator = this.flipPaginator;

                    this.asnDataSource.sort = this.asnSort;
                    this.grnDataSource.sort = this.grnSort;
                    this.returnDataSource.sort = this.returnSort;
                    this.qaDataSource.sort = this.qaSort;
                    this.slDataSource.sort = this.slSort;
                    this.documentDataSource.sort = this.documentSort;
                    this.flipDataSource.sort = this.flipSort;
                    this.items.forEach(x => {
                        this.insertPOItemsFormGroup(x);
                    });
                }
                this.isProgressBarVisibile = false;
            },
            err => {
                console.error(err);
                this.isProgressBarVisibile = false;
            }
        );
    }
    GetItemPlantDetails(PlantCode: string): void {
        this._dashboardService.GetItemPlantDetails(PlantCode).subscribe(
            data => {
                this.ItemPlantDetails = data as BPCPlantMaster;
            },
            err => {
                console.error(err);
            }
        );
    }
    viewOfAttachmentClicked(data: DocumentDetails): void {
        // const attachments = this.ofAttachments.filter(x => x.AttachmentID.toString() === element.RefDoc);
        this.GetOfAttachmentsByPartnerIDAndDocNumber(data);
    }
    GethighlightColor(element: GRNDetails): any {
        if (element.Qty < 0) {
            return {
                'background-color': 'red',
                'color': 'white',
                'padding': '5px'
            };
        }
    }
    GetBPCHeaderDocType(): void {
        this.route.queryParams.subscribe(params => {
            this.DocumentNumber = params['id'];
            // console.log("docNo", this.DocumentNumber);
        });
        this._dashboardService.GetBPCOFHeader(this.authenticationDetails.UserName, this.DocumentNumber).subscribe((header) => {
            const data = header as BPCOFHeader;
            console.log("header", data);
            this.DocumentType = data.DocType;
        },
            err => {
                console.log(err);
            });
    }
    GetOfAttachmentsByPartnerIDAndDocNumber(Document: DocumentDetails): void {
        this._dashboardService.GetBPCOFHeader(this.authenticationDetails.UserName, Document.ReferenceNo).subscribe(
            (header) => {
                this.element = header as BPCOFHeader;
                console.log("BPCOFHeader", this.element);
                this.isProgressBarVisibile = true;
                this._dashboardService
                    .GetOfAttachmentsByPartnerIDAndDocNumber(
                        this.authenticationDetails.UserName,
                        this.element.DocNumber
                    )
                    .subscribe(
                        (data) => {
                            if (data) {
                                const attachments = data as BPCInvoiceAttachment[];
                                // console.log("attachments", attachments);
                                for (let i = 0; i < attachments.length; i++) {
                                    if (attachments[i].AttachmentName !== Document.AttachmentName) {
                                        attachments.splice(i, 1);
                                    }
                                }
                                this.ofAttachments = attachments;
                                console.log(this.ofAttachments);
                                const ofAttachmentData = new OfAttachmentData();
                                ofAttachmentData.Client = this.element.Client;
                                ofAttachmentData.Company = this.element.Company;
                                ofAttachmentData.Type = this.element.Type;
                                ofAttachmentData.PatnerID = this.element.PatnerID;
                                ofAttachmentData.DocNumber = this.element.DocNumber;
                                ofAttachmentData.OfAttachments = this.ofAttachments;
                                this.openAttachmentViewDialog(ofAttachmentData);
                            }
                            this.isProgressBarVisibile = false;
                        },
                        (err) => {
                            console.error(err);
                            this.isProgressBarVisibile = false;
                        }
                    );
            },
            (err) => {
                console.log(err);
            }
        );

    }
    openAttachmentViewDialog(ofAttachmentData: OfAttachmentData): void {
        const dialogConfig: MatDialogConfig = {
            data: ofAttachmentData,
            panelClass: "attachment-view-dialog",
        };
        const dialogRef = this.dialog.open(
            AttachmentViewDialogComponent,
            dialogConfig
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                // this.GetOfDetails();
            }
        });
    }
    GetOfItemsByPartnerIDAndDocNumber(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService.GetOfItemsByPartnerIDAndDocNumber(this.partnerID, this.PO).subscribe(
            data => {
                if (data) {
                    this.items = <ItemDetails[]>data;
                    this.items.forEach(x => {
                        this.insertPOItemsFormGroup(x);
                    });
                }
                this.isProgressBarVisibile = false;
            },
            err => {
                console.error(err);
                this.isProgressBarVisibile = false;
            }
        );
    }

    GetOfASNsByPartnerIDAndDocNumber(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService.GetOfASNsByPartnerIDAndDocNumber(this.partnerID, this.PO).subscribe(
            data => {
                if (data) {
                    this.asn = <ASNDetails[]>data;
                    this.asnDataSource = new MatTableDataSource(this.asn);
                    this.asnDataSource.paginator = this.asnPaginator;
                    this.asnDataSource.sort = this.asnSort;
                }
                this.isProgressBarVisibile = false;
            },
            err => {
                console.error(err);
                this.isProgressBarVisibile = false;
            }
        );
    }

    GetOfGRGIsByPartnerIDAndDocNumber(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService.GetGRGIsByPartnerIDAndDocNumber(this.partnerID, this.PO).subscribe(
            data => {
                if (data) {
                    this.grn = <GRNDetails[]>data;
                    this.grnDataSource = new MatTableDataSource(this.grn);
                    // console.log("GetOfGRGIsByPartnerIDAndDocNumber", this.grnDataSource);
                    this.grnDataSource.paginator = this.grnPaginator;
                    this.grnDataSource.sort = this.grnSort;
                }
                this.isProgressBarVisibile = false;
            },
            err => {
                console.error(err);
                this.isProgressBarVisibile = false;
            }
        );
    }

    GetCancelGRGIsByPartnerIDAndDocNumber(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService.GetCancelGRGIsByPartnerIDAndDocNumber(this.partnerID, this.PO).subscribe(
            data => {
                if (data) {
                    this.return = <GRNDetails[]>data;
                    this.returnDataSource = new MatTableDataSource(this.return);
                    this.returnDataSource.paginator = this.returnPaginator;
                    this.returnDataSource.sort = this.returnSort;
                }
                this.isProgressBarVisibile = false;
            },
            err => {
                console.error(err);
                this.isProgressBarVisibile = false;
            }
        );
    }

    // GetAllReturns(): void {
    //     this.isProgressBarVisibile = true;
    //     this._customerService.GetAllReturns().subscribe(
    //         data => {
    //             if (data) {
    //                 // this.returnCount=data.length;
    //                 this.return = <BPCPIHeader[]>data;
    //                 this.returnDataSource = new MatTableDataSource(this.return);
    //                 this.returnDataSource.paginator = this.returnPaginator;
    //                 this.returnDataSource.sort = this.returnSort;
    //                 console.log(data);
    //                 console.log("helo");
    //             }
    //             this.isProgressBarVisibile = false;
    //         },
    //         err => {
    //             console.error(err);
    //             this.isProgressBarVisibile = false;
    //         }
    //     );
    // }

    GetOfQMsByPartnerIDAndDocNumber(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService.GetOfQMsByPartnerIDAndDocNumber(this.partnerID, this.PO).subscribe(
            data => {
                if (data) {
                    this.qa = <QADetails[]>data;
                    this.qaDataSource = new MatTableDataSource(this.qa);
                    this.qaDataSource.paginator = this.qaPaginator;
                    this.qaDataSource.sort = this.qaSort;
                }
                this.isProgressBarVisibile = false;
            },
            err => {
                console.error(err);
                this.isProgressBarVisibile = false;
            }
        );
    }

    GetOfSLsByPartnerIDAndDocNumber(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService.GetOfSLsByPartnerIDAndDocNumber(this.partnerID, this.PO).subscribe(
            data => {
                if (data) {
                    console.log("sl" + data);
                    this.sl = <SLDetails[]>data;
                    this.slDataSource = new MatTableDataSource(this.sl);
                    this.slDataSource.paginator = this.slPaginator;
                    this.slDataSource.sort = this.slSort;
                }
                this.isProgressBarVisibile = false;
            },
            err => {
                console.error(err);
                this.isProgressBarVisibile = false;
            }
        );
    }

    GetOfDocumentsByPartnerIDAndDocNumber(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService.GetOfDocumentsByPartnerIDAndDocNumber(this.partnerID, this.PO).subscribe(
            data => {
                if (data) {
                    this.document = <DocumentDetails[]>data;
                    this.documentDataSource = new MatTableDataSource(this.document);
                    this.documentDataSource.paginator = this.documentPaginator;
                    this.documentDataSource.sort = this.documentSort;
                }
                this.isProgressBarVisibile = false;
            },
            err => {
                console.error(err);
                this.isProgressBarVisibile = false;
            }
        );
    }

    GetOfFlipsByPartnerIDAndDocNumber(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService.GetOfFlipsByPartnerIDAndDocNumber(this.partnerID, this.PO).subscribe(
            data => {
                if (data) {
                    this.flip = <FlipDetails[]>data;
                    this.flipDataSource = new MatTableDataSource(this.flip);
                    this.flipDataSource.paginator = this.flipPaginator;
                    this.flipDataSource.sort = this.flipSort;
                }
                this.isProgressBarVisibile = false;
            },
            err => {
                console.error(err);
                this.isProgressBarVisibile = false;
            }
        );
    }

    CreateAcknowledgement(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService.CreateAcknowledgement(this.acknowledgement).subscribe(
            (data) => {
                this._router.navigate(['/orderfulfilment/orderfulfilmentCenter']);
                this.isProgressBarVisibile = false;
            },
            (err) => {
                this.isProgressBarVisibile = false;
                console.error(err);
            }
        );
    }
    UpdatePOItems(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService.UpdatePOItems(this.acknowledgement).subscribe(
            (data) => {
                this._router.navigate(["/support/supportticket"], {
                    queryParams: { id: this.acknowledgement.PONumber, navigator_page: 'polookup', reason: 'Delivery Date Mismatch' },
                });
                this.isProgressBarVisibile = false;
            },
            (err) => {
                this.isProgressBarVisibile = false;
                console.error(err);
            }
        );
    }

    tabOneClicked(): void {
        this.tab1 = true;
        this.tab2 = false;
        this.tab3 = false;
        this.tab4 = false;
        this.tab5 = false;
        this.tab6 = false;
        this.tab7 = false;
        this.tab8 = false;
        this.getItems();
        this.tabCount = 1;
        // this.ResetControl();
    }

    tabTwoClicked(): void {
        this.tab1 = false;
        this.tab2 = true;
        this.tab3 = false;
        this.tab4 = false;
        this.tab5 = false;
        this.tab6 = false;
        this.tab7 = false;
        this.tab8 = false;
        this.getSLs();
        this.tabCount = 2;
        // this.ResetControl();
    }

    tabThreeClicked(): void {
        this.tab1 = false;
        this.tab2 = false;
        this.tab3 = true;
        this.tab4 = false;
        this.tab5 = false;
        this.tab6 = false;
        this.tab7 = false;
        this.tab8 = false;
        this.getASNs();
        this.tabCount = 3;
        // this.ResetControl();
    }

    tabFourClicked(): void {
        this.tab1 = false;
        this.tab2 = false;
        this.tab3 = false;
        this.tab4 = true;
        this.tab5 = false;
        this.tab6 = false;
        this.tab7 = false;
        this.tab8 = false;
        this.getGRNs();
        this.tabCount = 4;
        // this.ResetControl();
    }

    tabFiveClicked(): void {
        this.tab1 = false;
        this.tab2 = false;
        this.tab3 = false;
        this.tab4 = false;
        this.tab5 = true;
        this.tab6 = false;
        this.tab7 = false;
        this.tab8 = false;
        this.getQAs();
        this.tabCount = 5;
        // this.ResetControl();
    }

    tabSixClicked(): void {
        this.tab1 = false;
        this.tab2 = false;
        this.tab3 = false;
        this.tab4 = false;
        this.tab5 = false;
        this.tab6 = true;
        this.tab7 = false;
        this.tab8 = false;
        this.getDocuments();
        this.tabCount = 6;
    }

    tabSevenClicked(): void {
        this.tab1 = false;
        this.tab2 = false;
        this.tab3 = false;
        this.tab4 = false;
        this.tab5 = false;
        this.tab6 = false;
        this.tab7 = true;
        this.tab8 = false;
        this.getFlips();
        this.tabCount = 7;
    }

    tabEightClicked(): void {
        this.tab1 = false;
        this.tab2 = false;
        this.tab3 = false;
        this.tab4 = false;
        this.tab5 = false;
        this.tab6 = false;
        this.tab7 = false;
        this.tab8 = true;
        this.getReturn();
        this.tabCount = 8;
    }


    initializeACKFormGroup(): void {
        this.ackFormGroup = this.formBuilder.group({
            Proposeddeliverydate: ['', Validators.required]
        });
    }

    initializePOItemFormGroup(): void {
        this.ackFormGroup = this.formBuilder.group({
            POItems: this.poItemFormArray
        });
    }

    insertPOItemsFormGroup(poItem: ItemDetails): void {
        const row = this.formBuilder.group({
            Item: [poItem.Item],
            Material: [poItem.Material],
            MaterialText: [poItem.MaterialText],
            DeliveryDate: [poItem.DeliveryDate],
            Proposeddeliverydate: [poItem.Proposeddeliverydate, Validators.required],
            OrderQty: [poItem.OrderQty],
            GRQty: [poItem.GRQty],
            PipelineQty: [poItem.PipelineQty],
            OpenQty: [poItem.OpenQty],
            UOM: [poItem.UOM],
            PlantCode: [poItem.PlantCode],
            UnitPrice: [poItem.UnitPrice],
            Value: [poItem.Value],
            TaxAmount: [poItem.TaxAmount],
            TaxCode: [poItem.TaxCode],
        });
        row.disable();
        row.get('Proposeddeliverydate').enable();
        this.poItemFormArray.push(row);
        this.itemDataSource.next(this.poItemFormArray.controls);
        // return row;
    }

    getPOItemValues(): void {
        this.orderFulfilmentDetails.itemDetails = [];
        this.isDeliveryDateMismatched = false;
        const poItemFormArray = this.ackFormGroup.get('POItems') as FormArray;
        poItemFormArray.controls.forEach((x, i) => {
            const item: ItemDetails = new ItemDetails();
            item.Item = x.get('Item').value;
            item.Material = x.get('Material').value;
            item.MaterialText = x.get('MaterialText').value;
            item.DeliveryDate = x.get('DeliveryDate').value as Date;
            const DeliveryDat = new Date(item.DeliveryDate);
            const DeliveryDate1 = DeliveryDat.setHours(0, 0, 0, 0);
            const proposeddeliverydate = x.get('Proposeddeliverydate').value as Date;
            const proposeddeliverydate1 = proposeddeliverydate.setHours(0, 0, 0, 0);
            item.Proposeddeliverydate = this.datepipe.transform(proposeddeliverydate, 'yyyy-MM-dd HH:mm:ss');
            item.OrderQty = x.get('OrderQty').value;
            item.UOM = x.get('UOM').value;
            item.GRQty = x.get('GRQty').value;
            item.PipelineQty = x.get('PipelineQty').value;
            item.OpenQty = x.get('OpenQty').value;
            this.orderFulfilmentDetails.itemDetails.push(item);
            if (DeliveryDate1 !== proposeddeliverydate1) {
                this.isDeliveryDateMismatched = true;
            }
            // else {
            //     this.isDeliveryDateMismatched = false;
            // }
            // console.log(this.orderFulfilmentDetails.itemDetails);
        });
    }

    acknowledgePOClicked(): void {
        if (this.ackFormGroup.valid) {
            this.getPOItemValues();
            this.acknowledgement.PONumber = this.PO;
            this.acknowledgement.ItemDetails = this.orderFulfilmentDetails.itemDetails;
            if (this.isDeliveryDateMismatched) {
                this.openNotificationDialog1();
            } else {
                this.openNotificationDialog();
            }
        } else {
            this.ShowValidationErrors(this.ackFormGroup);
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
    openNotificationDialog(): void {
        const dialogConfig: MatDialogConfig = {
            data: {
                Actiontype: 'Acknowledgement',
                Catagory: 'PO'
            },
            panelClass: 'confirmation-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
            result => {
                if (result) {
                    this.CreateAcknowledgement();
                }
            });
    }

    openNotificationDialog1(): void {
        const dialogConfig: MatDialogConfig = {
            data: {
                title: 'Unable to acknowledge the record since proposed delivery date is mismatched.',
                subtitle: 'Please create a support ticket to acknowledge it.'
            },
            panelClass: 'confirmation-dialog'
        };
        const dialogRef = this.dialog.open(NotificationDialog1Component, dialogConfig);
        dialogRef.afterClosed().subscribe(
            result => {
                if (result) {
                    this.UpdatePOItems();
                }
            });
    }

    goToASNClicked(po: string): void {
        // alert(po);
        this._router.navigate(['/asn'], { queryParams: { id: po } });
    }

    getItems(): void {
        // this.itemDataSource = new MatTableDataSource(this.items);
    }

    getASNs(): void {
        this.asnDataSource = new MatTableDataSource(this.asn);
    }

    getGRNs(): void {
        this.grnDataSource = new MatTableDataSource(this.grn);
    }

    getQAs(): void {
        this.qaDataSource = new MatTableDataSource(this.qa);
    }

    getSLs(): void {
        this.slDataSource = new MatTableDataSource(this.sl);
    }

    getDocuments(): void {
        this.documentDataSource = new MatTableDataSource(this.document);
    }

    getFlips(): void {
        this.flipDataSource = new MatTableDataSource(this.flip);
    }

    getReturn(): void {
        this.returnDataSource = new MatTableDataSource(this.return);
    }

    getStatusColor(statusFor: string): string {
        switch (statusFor) {
            case "ASN":
                return this.poStatus === "DueForACK"
                    ? "gray"
                    : this.poStatus === "DueForASN"
                        ? "gray"
                        : this.poStatus === "PartialASN"
                            ? "#efb577" : "#34ad65";
            case "Gate":
                return this.poStatus === "DueForACK"
                    ? "gray"
                    : this.poStatus === "DueForASN"
                        ? "gray"
                        : this.poStatus === "PartialASN"
                            ? "gray"
                            : this.poStatus === "DueForGate"
                                ? "gray"
                                : "#34ad65";
            case "GRN":
                return this.poStatus === "DueForACK"
                    ? "gray"
                    : this.poStatus === "DueForASN"
                        ? "gray"
                        : this.poStatus === "PartialASN"
                            ? "gray"
                            : this.poStatus === "DueForGate"
                                ? "gray"
                                : this.poStatus === "DueForGRN"
                                    ? "gray"
                                    : this.poStatus === "PartialGRN"
                                        ? "#efb577"
                                        : "#34ad65";
            default:
                return "";
        }
    }
    getGateStatusColor(): string {
        return this.gateStatus === "DueForGate"
            ? "gray" : this.gateStatus === "PartialGate"
                ? "#efb577" : "#34ad65";
    }
    getGRNStatusColor(): string {
        return this.grnStatus === "DueForGRN"
            ? "gray" : this.grnStatus === "PartialGRN"
                ? "#efb577" : "#34ad65";
    }

    getNextProcess(element: any): void {
        if (this.poStatus === "DueForACK") {
            element.NextProcess = "ACK";
        } else if (this.poStatus === "DueForASN") {
            element.NextProcess = "ASN/SCN";
        } else if (this.poStatus === "PartialASN") {
            element.NextProcess = "ASN/SCN";
        }
        else if (this.poStatus === "DueForGate") {
            element.NextProcess = "Gate";
        } else if (this.poStatus === "PartialGRN") {
            element.NextProcess = "GRN";
        }
        else {
            element.NextProcess = "GRN";
        }
    }
    getTimeline(statusFor: string): string {
        switch (statusFor) {
            case "ASN":
                return this.poStatus === "DueForACK"
                    ? "white-timeline"
                    : this.poStatus === "DueForASN"
                        ? "white-timeline"
                        : this.poStatus === "PartialASN"
                            ? "orange-timeline" : "green-timeline";
            case "Gate":
                return this.poStatus === "DueForACK"
                    ? "white-timeline"
                    : this.poStatus === "DueForASN"
                        ? "white-timeline"
                        : this.poStatus === "PartialASN"
                            ? "white-timeline"
                            : this.poStatus === "DueForGate"
                                ? "white-timeline"
                                : "green-timeline";
            case "GRN":
                return this.poStatus === "DueForACK"
                    ? "white-timeline"
                    : this.poStatus === "DueForASN"
                        ? "white-timeline"
                        : this.poStatus === "PartialASN"
                            ? "white-timeline"
                            : this.poStatus === "DueForGate"
                                ? "white-timeline"
                                : this.poStatus === "DueForGRN"
                                    ? "white-timeline"
                                    : this.poStatus === "PartialGRN"
                                        ? "orange-timeline"
                                        : "green-timeline";
            default:
                return "";
        }
    }
    getGateTimeline(): string {
        return this.gateStatus === "DueForGate"
            ? "white-timeline" : this.gateStatus === "PartialGate"
                ? "orange-timeline" : "green-timeline";
    }
    getGRNTimeline(): string {
        return this.grnStatus === "DueForGRN"
            ? "white-timeline" : this.grnStatus === "PartialGRN"
                ? "orange-timeline" : "green-timeline";
    }
    getRestTimeline(statusFor: string): string {
        switch (statusFor) {
            case "ASN":
                return this.poStatus === "DueForACK"
                    ? "white-timeline"
                    : this.poStatus === "DueForASN"
                        ? "white-timeline"
                        : this.poStatus === "PartialASN"
                            ? this.gateStatus === 'PartialGate' ? "orange-timeline" : "white-timeline"
                            : this.poStatus === "DueForGate"
                                ? "white-timeline"
                                : "green-timeline";
            case "Gate":
                return this.poStatus === "DueForACK"
                    ? "white-timeline"
                    : this.poStatus === "DueForASN"
                        ? "white-timeline"
                        : this.poStatus === "PartialASN"
                            ? "white-timeline"
                            : this.poStatus === "DueForGate"
                                ? "white-timeline"
                                : this.poStatus === "DueForGRN"
                                    ? "white-timeline"
                                    : "green-timeline";
            case "GRN":
                return this.poStatus === "DueForACK"
                    ? "white-timeline"
                    : this.poStatus === "DueForASN"
                        ? "white-timeline"
                        : this.poStatus === "PartialASN"
                            ? "white-timeline"
                            : this.poStatus === "DueForGate"
                                ? "white-timeline"
                                : this.poStatus === "DueForGRN"
                                    ? "white-timeline"
                                    : this.poStatus === "PartialGRN"
                                        ? "white-timeline"
                                        : "green-timeline";
            default:
                return "";
        }
    }
    getGateRestTimeline(): string {
        return this.gateStatus === "DueForGate"
            ? "white-timeline" : this.gateStatus === "PartialGate"
                ? this.grnStatus === 'PartialGRN' ? "orange-timeline" : 'white-timeline' : "green-timeline";
    }
    getGRNRestTimeline(): string {
        return this.grnStatus === "DueForGRN"
            ? "white-timeline" : this.grnStatus === "PartialGRN"
                ? "orange-timeline" : "green-timeline";
    }
    gotoorderfulfilment(): void {
        this._router.navigate(['/orderfulfilment/orderfulfilmentCenter']);
    }


    POFactSerClicked(item): void {
        item.enable();

        const Item = item.value;
        console.log("POFactSerClicked", Item, this.orderFulfilmentDetails.PONumber, this.currentUserName);
        this._dashboardService.GetOFItemSESByItem(Item.Item, this.orderFulfilmentDetails.PONumber, this.currentUserName).subscribe((data) => {
            const ItemSES = data;
            this.OpenPOFactServiceDialog(data);
            console.log("ses", ItemSES);
        }, err => {
            console.log(err);
        });
    }
    OpenPOFactServiceDialog(Data: any): void {
        const dialogConfig: MatDialogConfig = {
            panelClass: 'po-fact-item-ses-dialog',
            data: Data
        };
        const dialogRef = this.dialog.open(PoFactServiceDialogComponent, dialogConfig);
    }
}
