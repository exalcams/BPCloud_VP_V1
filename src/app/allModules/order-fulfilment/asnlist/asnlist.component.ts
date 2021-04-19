import { Component, OnInit, ViewEncapsulation, ViewChild } from '@angular/core';
import { MatTableDataSource, MatSnackBar, MatDialog, MatPaginator, MatSort, MatDialogConfig } from '@angular/material';
import { FuseConfigService } from '@fuse/services/config.service';
import { ASNListFilter, ASNListView, BPCASNItem, BPCASNPack, BPCASNView, BPCInvoiceAttachment, DocumentCenter } from 'app/models/ASN';
import { ASNService } from 'app/services/asn.service';
import { AuthenticationDetails } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Router } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { fuseAnimations } from '@fuse/animations';
import { ExcelService } from 'app/services/excel.service';
import { FormGroup, FormBuilder, FormArray, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { DatePipe, formatDate, SlicePipe } from '@angular/common';
import { BPCPayAccountStatement } from 'app/models/Payment.model';
import { AsnFieldMasterComponent } from 'app/allModules/configurationn/asn-field-master/asn-field-master.component';
import { BPCASNHeader } from 'app/models/ASN';
import { AttachmentDetails } from 'app/models/task';
import { AsnlistPrintDialogComponent } from './asnlist-print-dialogue/asnlist-print-dialog/asnlist-print-dialog.component';
import { ActivatedRoute } from '@angular/router';
import { POService } from 'app/services/po.service';
import { ActionLog, BPCOFHeader, BPCOFItem, BPCOFSubconView } from 'app/models/OrderFulFilment';
import { SubconService } from 'app/services/subcon.service';
import { BehaviorSubject } from 'rxjs';
import { NumberFormat } from 'xlsx/types';
import { slice } from 'lodash';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { GateService } from 'app/services/gate.service';
import { BPCGateHoveringVechicles } from 'app/models/Gate';
import { AuthService } from 'app/services/auth.service';
import { OfStatus } from 'app/models/Dashboard';
import { ShareParameterService } from 'app/services/share-parameters.service';

@Component({
  selector: 'app-asnlist',
  templateUrl: './asnlist.component.html',
  styleUrls: ['./asnlist.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ASNListComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  SelectedDocNumber: string;
  SelectedASNHeader: BPCASNHeader;
  MenuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  BGClassName: any;
  fuseConfig: any;
  Gate: BPCGateHoveringVechicles;
  AllASNHeaders: BPCASNHeader[] = [];
  SelectedASNView: BPCASNView;
  AllASNList: ASNListView[] = [];
  // ASNPackFormGroup: FormGroup;
  SelectedASNNumber: string;
  ASNPackFormArray: FormArray = this._formBuilder.array([]);
  displayColumn: string[] = ['ASNNumber', 'ASNDate', 'DocNumber', 'Plant', 'AWBNumber', 'VessleNumber', 'DepartureDate',
    'ArrivalDate', 'Status', 'Action'];
  TableDetailsDataSource: MatTableDataSource<ASNListView>;
  @ViewChild(MatPaginator) tablePaginator: MatPaginator;
  @ViewChild(MatSort) tableSort: MatSort;
  truck_url = "assets/images/mover-truck.png ";
  ship_url = "assets/images/cargo-ship.png ";
  delivery_url = "assets/images/delivery.png ";
  isExpanded: boolean;
  SearchFormGroup: FormGroup;
  isDateError: boolean;
  DefaultFromDate: Date;
  DefaultToDate: Date;
  i: number;
  PO: BPCOFHeader;
  POItems: BPCOFItem[] = [];
  // ASNFormGroup: FormGroup;
  // ASNItemFormGroup: FormGroup;
  SubconViews: BPCOFSubconView[] = [];
  maxDate: Date;
  GateEntryCreatedDate: string;
  DateTime: Date;
  ActionLog: any;
  // InvoiceDetailsFormGroup: FormGroup;
  // ASNPackDataSource = new BehaviorSubject<AbstractControl[]>([]);
  // ASNItemFormArray: FormArray = this._formBuilder.array([]);
  // ASNItemDataSource = new BehaviorSubject<AbstractControl[]>([]);
  // AllDocumentCenters: DocumentCenter[] = [];
  // ArrivalDateInterval: number;
  // invAttach: BPCInvoiceAttachment;
  // IsInvoiceDetailsFormGroupEnabled: boolean;
  // DocumentCenterDataSource: MatTableDataSource<DocumentCenter>;
  // newAllASNList: any;
  // newAllASNList1: any;
  // searchText: "";
  // searchedList: any;
  // ASN_value: any = [];

  // filter_asn: string;
  // count: any;
  // num: any;
  // num_array: any = [];
  // j: number;
  // k: any;
  // num_present: number;
  ofStatusOptions: OfStatus[] = [
    { Value: "GateEntry", Name: "Gate Entry" },
    { Value: "GateEntry Completed", Name: "Gate Entry Completed" },
    { Value: "Cancelled", Name: "Cancelled" },
    { Value: "ShipmentNotRelevant", Name: "Shipment Not Relevant" },
    { Value: "Saved", Name: "Saved" }
  ];

  Plants: string[] = [];

  constructor(
    private _fuseConfigService: FuseConfigService,
    private formBuilder: FormBuilder,
    private _asnService: ASNService,
    private _ASNService: ASNService,
    private _excelService: ExcelService,
    private _shareParameterService: ShareParameterService,
    private _router: Router,
    private _route: ActivatedRoute,
    private _datePipe: DatePipe,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _subConService: SubconService,
    private _POService: POService,
    private _authService: AuthService,
    private _GateService: GateService,
    private _formBuilder: FormBuilder
  ) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.isExpanded = false;
    this.DateTime = new Date();
    this.DefaultFromDate = new Date();
    this.DefaultFromDate.setDate(this.DefaultFromDate.getDate() - 30);
    this.DefaultToDate = new Date();
    this.SelectedASNHeader = new BPCASNHeader();
    this.SelectedASNView = new BPCASNView();
    this.Gate = new BPCGateHoveringVechicles();
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
      // if (this.MenuItems.indexOf('AccountStatement') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //   );
      //   this._router.navigate(['/auth/login']);
      // }

    } else {
      this._router.navigate(['/auth/login']);
    }
    this._route.queryParams.subscribe(params => {
      this.SelectedDocNumber = params['id'];
    });
    this.InitializeSearchForm();
    // this.GetAllASNListByPartnerID();
    // this.SearchClicked();

    // this.GetASNBasedOnCondition();
    if (this.currentUserRole === 'GateUser') {
      this.GetUserPlants();
    } else {
      this.SearchClicked();
    }

    console.log("predicate" + this.TableDetailsDataSource);
  }

  // applyFilter(filterValue: string) {

  //   filterValue = filterValue.trim(); // Remove whitespace

  //   filterValue = filterValue.toLowerCase(); // MatTableDataSource defaults to lowercase matches
  //   console.log(filterValue)
  //   this.num_present = 0;
  //   this.count = slice(filterValue)

  //   for (this.i = 0; this.i < this.AllASNList.length; this.i++) {
  //     this.num = this.AllASNList[this.i].ASNNumber
  //     this.num_array = "";
  //     this.num_present = 0;
  //     this.num_array = slice(this.num)
  //     for (this.j = 0; this.j < this.num_array.length; this.j++) {
  //       for (this.k = 0; this.k < this.count.length; this.k++) {
  //         if (this.num_array[this.j] == this.count[this.k]) {
  //           this.num_present = +1
  //         }
  //       }

  //     }
  //     if (this.num_present!) {
  //       this.filter_asn = this.ASN_value.filter = filterValue;
  //       this.TableDetailsDataSource.filter = this.filter_asn;
  //     }

  //   }


  // }
  Pdfdownload(no: any): void {
    this.CreateActionLogvalues("Pdf download");
    this.IsProgressBarVisibile = true;
    // this.SelectedASNHeader.ASNNumber=""
    // this.SelectedASNHeader.ASNNumber="no"
    this._ASNService.CreateASNPdf(no).subscribe(
      // this._ASNService.CreateASNPdf(this.SelectedASNHeader.ASNNumber).subscribe(
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
          // this.GetASNBasedOnCondition();
        }
      },
      error => {
        console.error(error);
        this.IsProgressBarVisibile = false;
        this.ResetControl();
        // this.GetASNBasedOnCondition();
      }
    );

  }
  // GetASNBasedOnCondition(): void {
  //   if (this.SelectedDocNumber) {
  //     this.GetASNByDocAndPartnerID();
  //     this.GetPOByDocAndPartnerID(this.SelectedDocNumber);
  //     // this.GetPOItemsByDocAndPartnerID();
  //     this.GetArrivalDateIntervalByPOAndPartnerID();
  //   } else {
  //     this.GetAllASNByPartnerID();
  //   }
  // }
  // GetAllASNByPartnerID(): void {
  //   this._ASNService.GetAllASNByPartnerID(this.currentUserName).subscribe(
  //     (data) => {
  //       this.AllASNHeaders = data as BPCASNHeader[];
  //       if (this.AllASNHeaders && this.AllASNHeaders.length) {
  //         this.LoadSelectedASN(this.AllASNHeaders[0]);
  //       }
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }
  help(po: string): void {
    this.CreateActionLogvalues("Help Desk");
    this._router.navigate(["/support/supportticket"], {
      queryParams: { id: po, navigator_page: "ASN" },
    });
  }
  GateEntry(Asn: ASNListView): void {
    this.CreateActionLogvalues("Gate Entry");
    this._GateService.CreateGateEntryByAsnList(Asn).subscribe(
      (data) => {
        // this.Gate = data as BPCGateHoveringVechicles;
        this.notificationSnackBarComponent.openSnackBar("Gate Entry Successfull", SnackBarStatus.success);
        this.SearchBtnClicked();
        // this.SearchClicked();
      },
      (err) => {
        this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
      }
    );
  }
  CancelGateEntry(Asn: ASNListView): void {
    this.CreateActionLogvalues("Cancel Gate Entry");
    this._GateService.CancelGateEntryByAsnList(Asn).subscribe(
      (data) => {
        // this.Gate = data as BPCGateHoveringVechicles;
        this.notificationSnackBarComponent.openSnackBar("Cancel Gate Entry Successfull", SnackBarStatus.success);
        this.SearchBtnClicked();
      },
      (err) => {
        this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
      }
    );
  }
  // cancel(asnnumber: any): void {
  //   this.newAllASNList = this.AllASNList;
  //   console.log(this.newAllASNList);
  //   const Actiontype = 'Cancel';
  //   const Catagory = 'ASN';
  //   this.OpenConfirmationDialog(Actiontype, Catagory);
  //   this.AllASNList.splice(asnnumber, 1);
  //   this.TableDetailsDataSource = new MatTableDataSource(this.AllASNList);

  //   // this.AllASNList.splice(asnnumber)
  // }
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
          if (Actiontype === 'Cancel') {
          }
        }
      });
  }
  // LoadSelectedASN(seletedASN: BPCASNHeader): void {
  //   this.SelectedASNHeader = seletedASN;
  //   this.SelectedASNView.ASNNumber = this.SelectedASNHeader.ASNNumber;
  //   this.SelectedASNNumber = this.SelectedASNHeader.ASNNumber;
  //   this.GetPOByDocAndPartnerID(this.SelectedASNHeader.DocNumber);
  //   this.ClearASNItems();
  //   this.GetASNItemsByASN();
  //   this.GetASNPacksByASN();
  //   this.GetDocumentCentersByASN();
  //   this.GetInvoiceAttachmentByASN();
  //   this.SetASNHeaderValues();
  //   this.SetInvoiceDetailValues();
  //   this.CheckForEnableInvoiceDetailsFormGroup();
  // }
  // CheckForEnableInvoiceDetailsFormGroup(): void {
  //   if (this.SelectedASNHeader.IsSubmitted) {
  //     this.DisableAllFormGroup();
  //     const diff = Math.abs(this.maxDate.getTime() - new Date(this.SelectedASNHeader.ASNDate as string).getTime());
  //     const diffDays = Math.ceil(diff / (1000 * 3600 * 24));
  //     if (diffDays < 31) {
  //       this.EnableInvoiceDetailsFormGroup();
  //       this.IsInvoiceDetailsFormGroupEnabled = true;
  //     } else {
  //       this.DisableInvoiceDetailsFormGroup();
  //       this.IsInvoiceDetailsFormGroupEnabled = false;
  //     }
  //   } else {
  //     this.EnableAllFormGroup();
  //   }
  //   this.InvoiceDetailsFormGroup.get('InvoiceAmount').disable();
  // }
  // EnableAllFormGroup(): void {
  //   this.ASNFormGroup.enable();
  //   this.ASNItemFormGroup.enable();
  //   this.ASNPackFormGroup.enable();
  //   this.InvoiceDetailsFormGroup.enable();
  // }
  // DisableInvoiceDetailsFormGroup(): void {
  //   this.InvoiceDetailsFormGroup.disable();
  // }
  // EnableInvoiceDetailsFormGroup(): void {
  //   this.InvoiceDetailsFormGroup.enable();
  // }
  // DisableAllFormGroup(): void {
  //   this.ASNFormGroup.disable();
  //   this.ASNItemFormGroup.disable();
  //   this.ASNPackFormGroup.disable();
  //   this.InvoiceDetailsFormGroup.disable();
  // }
  // SetInvoiceDetailValues(): void {
  //   this.InvoiceDetailsFormGroup.get('InvoiceNumber').patchValue(this.SelectedASNHeader.InvoiceNumber);
  //   this.InvoiceDetailsFormGroup.get('InvoiceDate').patchValue(this.SelectedASNHeader.InvoiceDate);
  //   this.InvoiceDetailsFormGroup.get('POBasicPrice').patchValue(this.SelectedASNHeader.POBasicPrice);
  //   this.InvoiceDetailsFormGroup.get('TaxAmount').patchValue(this.SelectedASNHeader.TaxAmount);
  //   this.InvoiceDetailsFormGroup.get('InvoiceAmount').patchValue(this.SelectedASNHeader.InvoiceAmount);
  //   this.InvoiceDetailsFormGroup.get('InvoiceAmountUOM').patchValue(this.SelectedASNHeader.InvoiceAmountUOM);
  //   this.InvoiceDetailsFormGroup.get('InvoiceAmount').disable();
  // }
  // SetASNHeaderValues(): void {
  //   this.ASNFormGroup.get('TransportMode').patchValue(this.SelectedASNHeader.TransportMode);
  //   this.ASNFormGroup.get('VessleNumber').patchValue(this.SelectedASNHeader.VessleNumber);
  //   this.ASNFormGroup.get('AWBNumber').patchValue(this.SelectedASNHeader.AWBNumber);
  //   this.ASNFormGroup.get('AWBDate').patchValue(this.SelectedASNHeader.AWBDate);
  //   this.ASNFormGroup.get('CountryOfOrigin').patchValue(this.SelectedASNHeader.CountryOfOrigin);
  //   this.ASNFormGroup.get('ShippingAgency').patchValue(this.SelectedASNHeader.ShippingAgency);
  //   this.ASNFormGroup.get('NumberOfPacks').patchValue(this.SelectedASNHeader.NumberOfPacks);
  //   this.ASNFormGroup.get('DepartureDate').patchValue(this.SelectedASNHeader.DepartureDate);
  //   this.ASNFormGroup.get('ArrivalDate').patchValue(this.SelectedASNHeader.ArrivalDate);
  //   this.ASNFormGroup.get('GrossWeight').patchValue(this.SelectedASNHeader.GrossWeight);
  //   this.ASNFormGroup.get('GrossWeightUOM').patchValue(this.SelectedASNHeader.GrossWeightUOM);
  //   this.ASNFormGroup.get('NetWeight').patchValue(this.SelectedASNHeader.NetWeight);
  //   // this.ASNFormGroup.get('NetWeightUOM').patchValue(this.SelectedASNHeader.NetWeightUOM);
  //   this.ASNFormGroup.get('VolumetricWeight').patchValue(this.SelectedASNHeader.VolumetricWeight);
  //   this.ASNFormGroup.get('VolumetricWeightUOM').patchValue(this.SelectedASNHeader.VolumetricWeightUOM);
  //   this.ASNFormGroup.get('BillOfLading').patchValue(this.SelectedASNHeader.BillOfLading);
  //   this.ASNFormGroup.get('TransporterName').patchValue(this.SelectedASNHeader.TransporterName);
  //   this.ASNFormGroup.get('AccessibleValue').patchValue(this.SelectedASNHeader.AccessibleValue);
  //   this.ASNFormGroup.get('ContactPerson').patchValue(this.SelectedASNHeader.ContactPerson);
  //   this.ASNFormGroup.get('ContactPersonNo').patchValue(this.SelectedASNHeader.ContactPersonNo);
  //   this.ASNFormGroup.get('Field1').patchValue(this.SelectedASNHeader.Field1);
  //   this.ASNFormGroup.get('Field2').patchValue(this.SelectedASNHeader.Field2);
  //   this.ASNFormGroup.get('Field3').patchValue(this.SelectedASNHeader.Field3);
  //   this.ASNFormGroup.get('Field4').patchValue(this.SelectedASNHeader.Field4);
  //   this.ASNFormGroup.get('Field5').patchValue(this.SelectedASNHeader.Field5);
  //   this.ASNFormGroup.get('Field6').patchValue(this.SelectedASNHeader.Field6);
  //   this.ASNFormGroup.get('Field7').patchValue(this.SelectedASNHeader.Field7);
  //   this.ASNFormGroup.get('Field8').patchValue(this.SelectedASNHeader.Field8);
  //   this.ASNFormGroup.get('Field9').patchValue(this.SelectedASNHeader.Field9);
  //   this.ASNFormGroup.get('Field10').patchValue(this.SelectedASNHeader.Field10);
  // }

  // GetInvoiceAttachmentByASN(): void {
  //   this._ASNService.GetInvoiceAttachmentByASN(this.SelectedASNHeader.ASNNumber, this.SelectedASNHeader.InvDocReferenceNo).subscribe(
  //     (data) => {
  //       this.invAttach = data as BPCInvoiceAttachment;
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }
  // GetDocumentCentersByASN(): void {
  //   this._ASNService.GetDocumentCentersByASN(this.SelectedASNHeader.ASNNumber).subscribe(
  //     (data) => {
  //       this.AllDocumentCenters = data as DocumentCenter[];
  //       this.DocumentCenterDataSource = new MatTableDataSource(this.AllDocumentCenters);
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }
  // GetASNPacksByASN(): void {
  //   this._ASNService.GetASNPacksByASN(this.SelectedASNHeader.ASNNumber).subscribe(
  //     (data) => {
  //       this.SelectedASNView.ASNPacks = data as BPCASNPack[];
  //       this.ClearFormArray(this.ASNPackFormArray);
  //       if (this.SelectedASNView.ASNPacks && this.SelectedASNView.ASNPacks.length) {
  //         this.SelectedASNView.ASNPacks.forEach(x => {
  //           this.InsertASNPacksFormGroup(x);
  //         });
  //       }
  //       if (this.SelectedASNHeader.IsSubmitted) {
  //         this.DisableASNPackFormGroup();
  //       } else {
  //         this.EnableASNPackFormGroup();
  //       }
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }
  // EnableASNPackFormGroup(): void {
  //   this.ASNPackFormGroup.enable();
  // }
  // DisableASNPackFormGroup(): void {
  //   this.ASNPackFormGroup.disable();
  // }
  // InsertASNPacksFormGroup(pack: BPCASNPack): void {
  //   const row = this._formBuilder.group({
  //     PackageID: [pack.PackageID, Validators.required],
  //     ReferenceNumber: [pack.ReferenceNumber, Validators.required],
  //     Dimension: [pack.Dimension],
  //     NetWeight: [pack.NetWeight, [Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]],
  //     NetWeightUOM: [pack.GrossWeightUOM],
  //     GrossWeight: [pack.GrossWeight, [Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]],
  //     GrossWeightUOM: [pack.GrossWeightUOM],
  //     VolumetricWeight: [pack.VolumetricWeight, [Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]],
  //     VolumetricWeightUOM: [pack.VolumetricWeightUOM],
  //   }, {
  //     validator: MustValid('NetWeight', 'GrossWeight')
  //   });
  //   this.ASNPackFormArray.push(row);
  //   this.ASNPackDataSource.next(this.ASNPackFormArray.controls);
  //   // return row;
  // }

  // GetASNItemsByASN(): void {
  //   this._ASNService.GetASNItemsByASN(this.SelectedASNHeader.ASNNumber).subscribe(
  //     (data) => {
  //       this.SelectedASNView.ASNItems = data as BPCASNItem[];
  //       this.ClearFormArray(this.ASNItemFormArray);
  //       if (this.SelectedASNView.ASNItems && this.SelectedASNView.ASNItems.length) {
  //         this.SelectedASNView.ASNItems.forEach(x => {
  //           this.InsertASNItemsFormGroup(x);
  //         });
  //       }
  //       if (this.SelectedASNHeader.IsSubmitted) {
  //         this.DisableASNItemFormGroup();
  //       } else {
  //         this.EnableASNItemFormGroup();
  //       }
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }
  // EnableASNItemFormGroup(): void {
  //   this.ASNItemFormGroup.enable();
  // }
  // DisableASNItemFormGroup(): void {
  //   this.ASNItemFormGroup.disable();
  // }
  // InsertASNItemsFormGroup(asnItem: BPCASNItem): void {
  //   const row = this._formBuilder.group({
  //     Item: [asnItem.Item],
  //     Material: [asnItem.Material],
  //     MaterialText: [asnItem.MaterialText],
  //     DeliveryDate: [asnItem.DeliveryDate],
  //     OrderedQty: [asnItem.OrderedQty],
  //     GRQty: [asnItem.CompletedQty],
  //     PipelineQty: [asnItem.TransitQty],
  //     OpenQty: [asnItem.OpenQty],
  //     ASNQty: [asnItem.ASNQty, [Validators.pattern('^([0-9]{0,10})([.][0-9]{1,3})?$')]],
  //     UOM: [asnItem.UOM],
  //     Batch: [asnItem.Batch],
  //     ManufactureDate: [asnItem.ManufactureDate],
  //     ExpiryDate: [asnItem.ExpiryDate],
  //     PlantCode: [asnItem.PlantCode],
  //     UnitPrice: [asnItem.UnitPrice],
  //     Value: [asnItem.Value],
  //     TaxAmount: [asnItem.TaxAmount],
  //     TaxCode: [asnItem.TaxCode],
  //   });
  //   row.disable();
  //   // row.get('ASNQty').enable();
  //   row.get('Batch').enable();
  //   row.get('ManufactureDate').enable();
  //   row.get('ExpiryDate').enable();
  //   this.ASNItemFormArray.push(row);
  //   this.ASNItemDataSource.next(this.ASNItemFormArray.controls);
  //   // return row;
  // }


  // ClearASNItems(): void {
  //   this.ClearFormArray(this.ASNItemFormArray);
  //   this.ASNItemDataSource.next(this.ASNItemFormArray.controls);
  // }
  // GetArrivalDateIntervalByPOAndPartnerID(): void {
  //   this._ASNService.GetArrivalDateIntervalByPOAndPartnerID(this.SelectedDocNumber, this.currentUserName).subscribe(
  //     (data) => {
  //       this.ArrivalDateInterval = data as number;
  //       if (this.ArrivalDateInterval && this.ArrivalDateInterval >= 0) {
  //         let today = new Date();
  //         today.setDate(today.getDate() + this.ArrivalDateInterval);
  //         this.ASNFormGroup.get('ArrivalDate').patchValue(today);
  //       }
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }
  // GetASNByDocAndPartnerID(): void {
  //   this._ASNService.GetASNByDocAndPartnerID(this.SelectedDocNumber, this.currentUserName).subscribe(
  //     (data) => {
  //       this.AllASNHeaders = data as BPCASNHeader[];
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }
  // GetPOByDocAndPartnerID(selectedDocNumber: string): void {
  //   this._POService.GetPOByDocAndPartnerID(selectedDocNumber, this.currentUserName).subscribe(
  //     (data) => {
  //       this.PO = data as BPCOFHeader;
  //       if (this.SelectedDocNumber) {
  //         this.InvoiceDetailsFormGroup.get('InvoiceAmountUOM').patchValue(this.PO.Currency);
  //       }
  //       if (this.PO && this.PO.DocType && this.PO.DocType.toLocaleLowerCase() === "subcon") {
  //         this.GetSubconViewByDocAndPartnerID();
  //       }
  //       else if (this.SelectedDocNumber && !this.SelectedASNHeader.ASNNumber) {
  //         this.GetPOItemsByDocAndPartnerID();
  //       }
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }
  // GetPOItemsByDocAndPartnerID(): void {
  //   this._POService.GetPOItemsByDocAndPartnerID(this.SelectedDocNumber, this.currentUserName).subscribe(
  //     (data) => {
  //       this.POItems = data as BPCOFItem[];
  //       this.ClearFormArray(this.ASNItemFormArray);
  //       if (this.POItems && this.POItems.length) {
  //         this.SelectedASNHeader.Client = this.SelectedASNView.Client = this.POItems[0].Client;
  //         this.SelectedASNHeader.Company = this.SelectedASNView.Company = this.POItems[0].Company;
  //         this.SelectedASNHeader.Type = this.SelectedASNView.Type = this.POItems[0].Type;
  //         this.SelectedASNHeader.PatnerID = this.SelectedASNView.PatnerID = this.POItems[0].PatnerID;
  //         this.SelectedASNHeader.DocNumber = this.SelectedASNView.DocNumber = this.POItems[0].DocNumber;
  //         this.POItems.forEach(poItem => {
  //           if (poItem.OpenQty && poItem.OpenQty > 0) {
  //             if (this.PO && this.PO.DocType && this.PO.DocType.toLocaleLowerCase() === "subcon") {
  //               const sub = this.SubconViews.filter(x => x.Item === poItem.Item)[0];
  //               if (sub) {
  //                 const remainingQty = sub.OrderedQty - poItem.TransitQty;
  //                 poItem.MaxAllowedQty = remainingQty;
  //               }
  //             } else {
  //               poItem.MaxAllowedQty = poItem.OpenQty;
  //             }
  //           }
  //           this.InsertPOItemsFormGroup(poItem);
  //         });
  //       }
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }

  // InsertPOItemsFormGroup(poItem: BPCOFItem): void {
  //   const row = this._formBuilder.group({
  //     Item: [poItem.Item],
  //     Material: [poItem.Material],
  //     MaterialText: [poItem.MaterialText],
  //     DeliveryDate: [poItem.DeliveryDate],
  //     OrderedQty: [poItem.OrderedQty],
  //     GRQty: [poItem.CompletedQty],
  //     PipelineQty: [poItem.TransitQty],
  //     OpenQty: [poItem.OpenQty],
  //     ASNQty: [poItem.MaxAllowedQty],
  //     UOM: [poItem.UOM],
  //     Batch: [''],
  //     ManufactureDate: [''],
  //     ExpiryDate: [''],
  //     PlantCode: [poItem.PlantCode],
  //     UnitPrice: [poItem.UnitPrice],
  //     Value: [poItem.Value],
  //     TaxAmount: [poItem.TaxAmount],
  //     TaxCode: [poItem.TaxCode],
  //   });
  //   row.disable();
  //   if (poItem.MaxAllowedQty && poItem.MaxAllowedQty > 0) {
  //     row.get('ASNQty').setValidators([Validators.max(poItem.MaxAllowedQty), Validators.pattern('^([0-9]{0,10})([.][0-9]{1,3})?$')]);
  //     row.get('ASNQty').updateValueAndValidity();
  //     row.get('ASNQty').enable();
  //   }
  //   // if (poItem.OpenQty && poItem.OpenQty > 0) {
  //   //     if (this.PO && this.PO.DocType && this.PO.DocType.toLocaleLowerCase() === "subcon") {
  //   //         const sub = this.SubconViews.filter(x => x.Item === poItem.Item)[0];
  //   //         if (sub) {
  //   //             const remainingQty = sub.OrderedQty - poItem.TransitQty;
  //   //             row.get('ASNQty').patchValue(remainingQty);
  //   //             if (remainingQty > 0) {
  //   //                 row.get('ASNQty').setValidators([Validators.required, Validators.max(remainingQty), Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]);
  //   //                 row.get('ASNQty').updateValueAndValidity();
  //   //                 row.get('ASNQty').enable();
  //   //             }
  //   //         }
  //   //     } else {
  //   //         row.get('ASNQty').setValidators([Validators.required, Validators.max(poItem.OpenQty), Validators.pattern('^([1-9][0-9]{0,9})([.][0-9]{1,3})?$')]);
  //   //         row.get('ASNQty').updateValueAndValidity();
  //   //         row.get('ASNQty').enable();
  //   //     }
  //   // }
  //   row.get('Batch').enable();
  //   row.get('ManufactureDate').enable();
  //   row.get('ExpiryDate').enable();
  //   this.ASNItemFormArray.push(row);
  //   this.ASNItemDataSource.next(this.ASNItemFormArray.controls);
  //   // return row;
  // }


  ClearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }

  // GetSubconViewByDocAndPartnerID(): void {
  //   this._subConService.GetSubconViewByDocAndPartnerID(this.SelectedDocNumber, this.currentUserName).subscribe(
  //     (data) => {
  //       this.SubconViews = data as BPCOFSubconView[];
  //       if (this.SelectedDocNumber && !this.SelectedASNHeader.ASNNumber) {
  //         this.GetPOItemsByDocAndPartnerID();
  //       }
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }

  OpenASNPrintDialog(FileName: string, blob: Blob): void {
    const attachmentDetails: AttachmentDetails = {
      FileName: FileName,
      blob: blob
    };
    const dialogConfig: MatDialogConfig = {
      data: attachmentDetails,
      panelClass: 'asn-print-dialog'
    };
    const dialogRef = this.dialog.open(AsnlistPrintDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      this.ResetControl();
      // this.GetASNBasedOnCondition();
    }, (err) => {
      this.ResetControl();
      // this.GetASNBasedOnCondition();
    });
  }

  ASNnumber(asn: ASNListView): void {
    // this.CreateActionLogvalues("ASNNumber");
    this._shareParameterService.SetASNListView(asn);
    this._router.navigate(["/asn"]);
    // this._router.navigate(["/asn"], { queryParams: { id: asn.DocNumber } });
  }

  InitializeSearchForm(): void {
    this.SearchFormGroup = this.formBuilder.group({
      ASNNumber: [''],
      DocNumber: [''],
      Material: [''],
      Status: ['GateEntry'],
      ASNFromDate: [],
      ASNToDate: []
    });
  }
  ResetControl(): void {
    this.AllASNList = [];
    this.ResetFormGroup(this.SearchFormGroup);
  }
  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }
  GetAllASNListByPartnerID(): void {
    // this.CreateActionLogvalues("Filter-All")
    this._asnService.GetAllASNListByPartnerID(this.currentUserName).subscribe(
      (data) => {
        // console.log("data" + data)
        this.DateTime = new Date();
        this.AllASNList = data as ASNListView[];
        console.log("asnlist" + this.AllASNList);
        this.AllASNList.forEach(ASN => {
          ASN.CancelDuration = new Date(ASN.CancelDuration);
          ASN.Time = new Date(ASN.CancelDuration).getTime();
        });
        this.TableDetailsDataSource = new MatTableDataSource(this.AllASNList);
        this.TableDetailsDataSource.paginator = this.tablePaginator;
        this.TableDetailsDataSource.sort = this.tableSort;
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
      }
    );

  }

  DateSelected(): void {
    const FROMDATEVAL = this.SearchFormGroup.get('ASNFromDate').value as Date;
    const TODATEVAL = this.SearchFormGroup.get('ASNToDate').value as Date;
    if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
      this.isDateError = true;
    } else {
      this.isDateError = false;
    }
  }
  GetUserPlants(): void {
    this._authService.GetUserPlants(this.currentUserID).subscribe(
      (data) => {
        this.Plants = data as string[];
        this.Search1Clicked();
      },
      (err) => {
        console.error(err);
      }
    );
  }
  SearchBtnClicked(): void {
    if (this.currentUserRole === 'GateUser') {
      this.Search1Clicked();
    } else {
      this.SearchClicked();
    }
  }
  SearchClicked(): void {
    if (this.SearchFormGroup.valid) {
      if (!this.isDateError) {
        const FrDate = this.SearchFormGroup.get('ASNFromDate').value;
        let FromDate = '';
        if (FrDate) {
          FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
        }
        const TDate = this.SearchFormGroup.get('ASNToDate').value;
        let ToDate = '';
        if (TDate) {
          ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
        }
        const ASNNumber = this.SearchFormGroup.get('ASNNumber').value;
        const DocNumber = this.SearchFormGroup.get('DocNumber').value;
        const Material = this.SearchFormGroup.get('Material').value;
        let Status = this.SearchFormGroup.get('Status').value;
        if (!Status) {
          Status = "";
        }
        this.IsProgressBarVisibile = true;
        this._asnService.FilterASNListByPartnerID(this.currentUserName, ASNNumber, DocNumber, Material, Status, FromDate, ToDate).subscribe(
          (data) => {
            this.AllASNList = data as ASNListView[];
            // this.ASN_value[0]=this.AllASNList[0].ASNNumber
            // for (this.i = 0; this.i < this.AllASNList.length; this.i++) {
            //   this.ASN_value[this.i] = this.AllASNList[this.i].ASNNumber
            // }
            this.AllASNList.forEach(ASN => {
              ASN.CancelDuration = new Date(ASN.CancelDuration);
              ASN.Time = new Date(ASN.CancelDuration).getTime();
            });

            // var temp=new Date().getTime();
            // console.log(temp,this.AllASNList[19].Time);
            // console.log(new Date(temp),new Date(this.AllASNList[19].Time));

            this.TableDetailsDataSource = new MatTableDataSource(this.AllASNList);
            // console.log("AllASNList",this.AllASNList);
            this.DateTime = new Date();
            // this.DateTime=this.DateTime.getTime();
            this.TableDetailsDataSource.paginator = this.tablePaginator;
            this.TableDetailsDataSource.sort = this.tableSort;
            this.IsProgressBarVisibile = false;
          },
          (err) => {
            console.error(err);
            this.IsProgressBarVisibile = false;
          }
        );
      }
    }
    else {
      this.ShowValidationErrors(this.SearchFormGroup);
    }
  }
  Search1Clicked(): void {
    if (this.SearchFormGroup.valid) {
      const filter: ASNListFilter = new ASNListFilter();
      if (!this.isDateError) {
        this.Plants.forEach(x => filter.Plants.push(x));
        const FrDate = this.SearchFormGroup.get('ASNFromDate').value;
        let FromDate = '';
        if (FrDate) {
          FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
        }
        filter.ASNFromDate = FromDate;
        const TDate = this.SearchFormGroup.get('ASNToDate').value;
        let ToDate = '';
        if (TDate) {
          ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
        }
        filter.ASNToDate = ToDate;
        filter.ASNNumber = this.SearchFormGroup.get('ASNNumber').value;
        filter.DocNumber = this.SearchFormGroup.get('DocNumber').value;
        filter.Material = this.SearchFormGroup.get('Material').value;
        filter.Status = this.SearchFormGroup.get('Status').value;
        if (!filter.Status) {
          filter.Status = "";
        }
        this.IsProgressBarVisibile = true;
        this._asnService.FilterASNListByPlants(filter).subscribe(
          (data) => {
            this.AllASNList = data as ASNListView[];
            this.TableDetailsDataSource = new MatTableDataSource(this.AllASNList);
            this.TableDetailsDataSource.paginator = this.tablePaginator;
            this.TableDetailsDataSource.sort = this.tableSort;
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
  // SearchClicked(): void {
  //   if (this.SearchFormGroup.valid) {
  //     if (!this.isDateError) {
  //       const FrDate = this.SearchFormGroup.get('ASNFromDate').value;
  //       let FromDate = '';
  //       if (FrDate) {
  //         FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
  //       }
  //       const TDate = this.SearchFormGroup.get('ASNToDate').value;
  //       let ToDate = '';
  //       if (TDate) {
  //         ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
  //       }
  //       const ASNNumber = this.SearchFormGroup.get('ASNNumber').value;
  //       const DocNumber = this.SearchFormGroup.get('DocNumber').value;
  //       const Material = this.SearchFormGroup.get('Material').value;
  //       const Status = this.SearchFormGroup.get('Status').value;
  //       this.IsProgressBarVisibile = true;
  //       this._asnService.FilterASNListByPartnerID(this.currentUserName, ASNNumber, DocNumber, Material, Status, FromDate, ToDate).subscribe(

  //         (data) => {
  //           this.AllASNList = data as ASNListView[];
  //           this.TableDetailsDataSource = new MatTableDataSource(this.AllASNList);
  //           this.TableDetailsDataSource.paginator = this.tablePaginator;
  //           this.TableDetailsDataSource.sort = this.tableSort;
  //           this.IsProgressBarVisibile = false;
  //         },
  //         (err) => {
  //           console.error(err);
  //           this.IsProgressBarVisibile = false;
  //         }
  //       );
  //     }
  //   } else {
  //     this.ShowValidationErrors(this.SearchFormGroup);
  //   }
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


  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }
  exportAsXLSX(): void {
    this.CreateActionLogvalues("export As XLSX");
    const currentPageIndex = this.TableDetailsDataSource.paginator.pageIndex;
    const PageSize = this.TableDetailsDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.AllASNList.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'ASN': x.ASNNumber,
        'ASN Date': x.ASNDate ? this._datePipe.transform(x.ASNDate, 'dd-MM-yyyy') : '',
        'PO': x.DocNumber,
        'AWB': x.AWBNumber,
        'Truck': x.VessleNumber,
        // 'Material': x.Material,
        // 'Material Text': x.MaterialText,
        // 'ASN Qty': x.ASNQty,
        'Status': x.Status,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'accountstatement');
  }
  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
    // this.CreateActionLogvalues("Expand");
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.TableDetailsDataSource.filter = filterValue.trim().toLowerCase();
  }
  CreateActionLogvalues(text): void {
    this.ActionLog = new ActionLog();
    this.ActionLog.UserID = this.currentUserID;
    this.ActionLog.AppName = "ASNList";
    this.ActionLog.ActionText = text + " is Clicked";
    this.ActionLog.Action = text;
    this.ActionLog.CreatedBy = this.currentUserName;
    this._authService.CreateActionLog(this.ActionLog).subscribe(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.log(err);
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
