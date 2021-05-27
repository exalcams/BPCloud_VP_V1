import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AbstractControl, FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatDialogConfig } from '@angular/material';
import { ASNDetails, GRNDetails, QADetails, ItemDetails, OrderFulfilmentDetails, Acknowledgement, DocumentDetails } from 'app/models/Dashboard';
import { AuthenticationDetails, AppUsage } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { ActivatedRoute, Router } from '@angular/router';
import { DashboardService } from 'app/services/dashboard.service';
import { DatePipe } from '@angular/common';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { fuseAnimations } from '@fuse/animations';
import { BPCOFItem, BPCOFGRGI, SOItemCount, BPCInvoice, BPCRetNew, OfAttachmentData } from 'app/models/OrderFulFilment';
import { POService } from 'app/services/po.service';
import { MasterService } from 'app/services/master.service';
import { BPCPODHeader, BPCPODItem } from 'app/models/POD';
import { PODService } from 'app/services/pod.service';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { AttachmentViewDialogComponent } from 'app/notifications/attachment-view-dialog/attachment-view-dialog.component';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';


@Component({
  selector: 'app-customer-polookup',
  templateUrl: './customer-polookup.component.html',
  styleUrls: ['./customer-polookup.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CustomerPolookupComponent implements OnInit {

  public tab1: boolean;
  public tab2: boolean;
  public tab3: boolean;
  public tab4: boolean;
  public tab5: boolean;
  // public tab3: boolean;
  public ItemCount: number;
  public GRGICount: number;
  public PODCount: number;
  public InvCount: number;
  public ReturnCount: number;
  // public DocumentCount :number;
  public DocumentCount: number;
  public FlipCount: number;

  IsProgressBarVisibile: boolean;
  sOItemCount: SOItemCount;
  SOtems: BPCOFItem[] = [];

  SOItemDisplayedColumns: string[] = [
    'Item',
    'Material',
    'MaterialText',
    'HSN',
    'OrderedQty',
    'CompletedQty',
    'OpenQty',
    'DeliveryDate'
  ];
  SOItemDataSource: MatTableDataSource<BPCOFItem>;
  SODocDataSource: MatTableDataSource<DocumentDetails>;
  DocNumberCount: SOItemCount;
  SODoc: DocumentDetails[] = []
  SODocDisplayedColumns: string[] = [

    'AttachmentName',
    'ReferenceNo',
    'ContentType',

  ];
  SOGRGIs: BPCOFGRGI[] = [];
  SOGRGIDisplayedColumns: string[] = [
    'Item',
    'Material',
    'MaterialText',
    'DeliveryDate',
    'GRGIQty',
    'ShippingPartner',
    'ShippingDoc'
  ];
  SOGRGIDataSource: MatTableDataSource<BPCOFGRGI>;
  AllPODI: BPCPODItem[] = [];
  AllReturn: BPCRetNew[] = [];
  AllBPCInv: BPCInvoice[] = [];
  PODDisplayedColumns: string[] = [
    'InvoiceNumber',
    'Item',
    'Material',
    'MaterialText',
    'Qty',
    'AttachmentName',

  ];
  InvoiceDisplayedColumns: string[] = ['InvoiceNo', 'InvoiceDate', 'InvoiceAmount', 'Currency']
  ReturnDisplayedColumns: string[] = ['ReturnOrder', 'Date', 'Material', 'Text', 'Qty', 'Status', 'Document']
  // PODataSource = new MatTableDataSource<BPCPODHeader>([]);
  PODDataSource = new MatTableDataSource<BPCPODItem>([]);
  ReturnDataSource = new MatTableDataSource<BPCRetNew>([]);
  // InvoiceDataSource = new MatTableDataSource<BPCPODItem>([]);
  InvoiceDDataSource = new MatTableDataSource<BPCInvoice>([]);
  OrderFulfilmentDetails: OrderFulfilmentDetails = new OrderFulfilmentDetails();
  DocNumber: string;
  ACKFormGroup: FormGroup;
  Acknowledgement: Acknowledgement = new Acknowledgement();
  // POItems: ItemDetails[] = [];
  POItemFormArray: FormArray = this.formBuilder.array([]);

  @ViewChild(MatPaginator) ItemPaginator: MatPaginator;
  @ViewChild(MatPaginator) PODPaginator: MatPaginator;
  @ViewChild(MatPaginator) InvoicePaginator: MatPaginator;
  @ViewChild(MatPaginator) ReturnPaginator: MatPaginator;
  @ViewChild(MatPaginator) DocPaginator: MatPaginator;


  @ViewChild(MatSort) itemSort: MatSort;
  @ViewChild(MatSort) asnSort: MatSort;
  @ViewChild(MatSort) grnSort: MatSort;
  @ViewChild(MatSort) qaSort: MatSort;
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  PartnerID: string;
  attachmentDetails: string;
  file: string;
  filetype: string;
  SecretKey: string;
    SecureStorage: SecureLS;
  constructor(
    private route: ActivatedRoute,
    public _dashboardService: DashboardService,
    public _POService: POService,
    public _PODService: PODService,
    private _masterService: MasterService,
    private _router: Router,
    private formBuilder: FormBuilder,
    private datepipe: DatePipe,
    private dialog: MatDialog,
    private _authService: AuthService,

  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    const retrievedObject = this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.PartnerID = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      // this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      // // console.log(this.authenticationDetails);
      // if (this.MenuItems.indexOf('Dashboard') < 0) {
      //     this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //     );
      //     this._router.navigate(['/auth/login']);
      // }

    } else {
      this._router.navigate(['/auth/login']);
    }

    this.route.queryParams.subscribe(params => {
      this.DocNumber = params['id'];
    });
    this.ACKFormGroup = this.formBuilder.group({
      Proposeddeliverydate: ['', Validators.required]
    });
    this.sOItemCount = new SOItemCount();
    this.tab1 = true;
    this.tab2 = false;
    this.tab3 = false;
    this.tab4 = false;
    this.tab5 = false;
    // this.tabCount = 1;
  }

  ngOnInit(): void {
    this.CreateAppUsage();
    this.GetSOItemCountByDocAndPartnerID();
    this.tabone();
  }
  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'SO Lookup';
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
  tabone(): void {
    this.tab1 = true;
    this.tab2 = false;
    this.tab3 = false;
    this.tab4 = false;
    this.tab5 = false;
    this.GetPOItemsByDocAndPartnerID();
    // this.ResetControl();
  }
  tabtwo(): void {
    this.tab1 = false;
    this.tab2 = true;
    this.tab3 = false;
    this.tab4 = false;
    this.tab5 = false;
    this.GetPODByPartnerIDAndDocument();
    // this.GetPOGRGIByDocAndPartnerID();
    // this.getallasn();
    // this.ResetControl();
  }
  tabthree(): void {
    this.tab1 = false;
    this.tab2 = false;
    this.tab3 = true;
    this.tab4 = false;
    this.tab5 = false;
    this.GetInvoiceByPartnerIdAnDocumentNo();
    // this.getallgrn();
    // this.ResetControl();
  }
  tabfour(): void {
    this.tab1 = false;
    this.tab2 = false;
    this.tab3 = false;
    this.tab4 = true;
    this.tab5 = false;
    // this.GetPODsByDocAndPartnerID();
    this.GetPartnerAndRequestIDByPartnerId();
  }
  tabfive(): void {
    this.tab1 = false;
    this.tab2 = false;
    this.tab3 = false;
    this.tab4 = false;
    this.tab5 = true;
    this.GetAttachmentByPatnerIdAndDocNum();
  }

  AttachmentName_clk(AttachmentName, index, ref) {
    this.file = this.SODoc[index].AttachmentFile;
    this.filetype = this.SODoc[index].ContentType;
    const blob = new Blob([this.file], { type: this.filetype });
    const ofAttachmentData = new OfAttachmentData();
    ofAttachmentData.DocNumber = ref;
    ofAttachmentData.OfAttachments = this.SODoc;
    ofAttachmentData.Type = "C";
    this.openAttachmentViewDialog(ofAttachmentData);
  }
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
        // this.GetSODetails();
      }
    });
  }

  GetSOItemCountByDocAndPartnerID(): void {

    this._POService.GetSOItemCountByDocAndPartnerID(this.DocNumber, this.PartnerID).subscribe(
      (data) => {
        this.sOItemCount = data as SOItemCount;
      },
      (err) => {
        console.error(err);
      }
    );
  }
  GetAttachmentByPatnerIdAndDocNum(): void {
    this._POService.GetAttachmentByPatnerIdAndDocNum(this.DocNumber, this.PartnerID).subscribe(
      (data) => {
        // DocNumberCount:SOItemCount;
        // SODoc:DocumentDetails[]=[]
        // SODocDisplayedColumns: string[] = [

        //   'AttachmentName',
        //   'ReferenceNo',
        //   'ContentType',

        // ];
        // this.blob=data.Attachment

        this.SODoc = data as DocumentDetails[];
        this.sOItemCount.ItemCount = this.SODoc.length;

        this.SODocDataSource = new MatTableDataSource(this.SODoc);
        this.SODocDataSource.paginator = this.DocPaginator
      },
      (err) => {
        console.error(err);
      }
    );

  }

  GetPOItemsByDocAndPartnerID(): void {
    this.IsProgressBarVisibile = true;
    //chng madhu
    this._POService.GetPOItemsByDocAndPartnerID(this.DocNumber, this.PartnerID).subscribe(
      (data) => {
        this.SOtems = data as BPCOFItem[];
        this.sOItemCount.ItemCount = this.SOtems.length;
        this.SOItemDataSource = new MatTableDataSource(this.SOtems);
        this.SOItemDataSource.paginator = this.ItemPaginator
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
      }
    );
  }
  GetPOGRGIByDocAndPartnerID(): void {
    this._POService.GetPOGRGIByDocAndPartnerID(this.DocNumber, this.PartnerID).subscribe(
      (data) => {
        this.SOGRGIs = data as BPCOFGRGI[];
        this.sOItemCount.GRGICount = this.SOGRGIs.length;
        this.SOGRGIDataSource = new MatTableDataSource(this.SOGRGIs);
      },
      (err) => {
        console.error(err);
      }
    );
  }
  // GetPODsByDocAndPartnerID(): void {
  //   this.IsProgressBarVisibile = true;
  //   this._PODService.GetPODsByDocAndPartnerID(this.DocNumber, this.PartnerID).subscribe(
  //     (data) => {
  //       this.AllPODHeaders = data as BPCPODHeader[];
  //       this.sOItemCount.PODCount = this.AllPODHeaders.length;
  //       this.PODataSource = new MatTableDataSource(this.AllPODHeaders);
  //       this.IsProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       this.IsProgressBarVisibile = false;
  //       console.error(err);
  //     }
  //   );
  // }

  GetPODByPartnerIDAndDocument(): void {
    this.IsProgressBarVisibile = true;
    this._PODService.GetPODByPartnerIDAndDocument(this.DocNumber, this.PartnerID).subscribe(
      (data) => {
        this.AllPODI = data as BPCPODItem[];
        this.sOItemCount.PODCount = this.AllPODI.length;
        this.PODDataSource = new MatTableDataSource(this.AllPODI);
        this.PODDataSource.paginator = this.PODPaginator
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        this.IsProgressBarVisibile = false;
        console.error(err);
      }
    );
  }
  GetPartnerAndRequestIDByPartnerId(): void {
    this._POService.GetPartnerAndRequestIDByPartnerId(this.PartnerID).subscribe(
      (data) => {
        this.AllReturn = data as BPCRetNew[];
        this.sOItemCount.ReturnCount = this.AllReturn.length;
        this.ReturnDataSource = new MatTableDataSource(this.AllReturn);
        this.ReturnDataSource.paginator = this.ReturnPaginator

        this.IsProgressBarVisibile = false;
        console.log("return:" + data)
        console.log("return1:" + this.ReturnDataSource)
      },
      (err) => {
        console.error(err);
      }
    );
  }

  GetInvoiceByPartnerIdAnDocumentNo(): void {
    this.IsProgressBarVisibile = true;
    this._POService.GetInvoiceByPartnerIdAnDocumentNo(this.PartnerID).subscribe(
      // this.PartnerID
      (data) => {
        this.AllBPCInv = data as BPCInvoice[];
        this.sOItemCount.InvCount = this.AllBPCInv.length;
        this.InvoiceDDataSource = new MatTableDataSource(this.AllBPCInv);
        this.InvoiceDDataSource.paginator = this.InvoicePaginator
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        this.IsProgressBarVisibile = false;
        console.error(err);
      }
    );
  }


  SaveClicked(): void {

  }
  SubmitClicked(): void {

  }
  DeleteClicked(): void {

  }

}

