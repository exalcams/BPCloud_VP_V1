import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { ASNListView, BPCASNHeader, BPCASNItem } from 'app/models/ASN';
import { DocumentDetails } from 'app/models/Dashboard';
import { AuthenticationDetails } from 'app/models/master';
import { ActionLog, BPCInvoice, BPCOFHeader, BPCOFItem, BPCPlantMaster } from 'app/models/OrderFulFilment';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { ASNService } from 'app/services/asn.service';
import { AuthService } from 'app/services/auth.service';
import { DashboardService } from 'app/services/dashboard.service';
import { GateService } from 'app/services/gate.service';
import { POService } from 'app/services/po.service';
import { ShareParameterService } from 'app/services/share-parameters.service';
import { Guid } from 'guid-typescript';
import * as SecureLS from 'secure-ls';
@Component({
  selector: 'app-gate-entry',
  templateUrl: './gate-entry.component.html',
  styleUrls: ['./gate-entry.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class GateEntryComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  BGClassName: any;
  fuseConfig: any;
  tabledata: any[] = [];
  SelectedASNListView: ASNListView;
  SelectedASN: BPCASNHeader;
  SelectedASNItems: BPCASNItem[] = [];
  SelectBPCOFHeader: BPCOFHeader;
  SelectedOFItems: BPCOFItem[] = [];
  SelectedDocuments: DocumentDetails[] = [];
  SelectedInvoices: BPCInvoice[] = [];
  ItemsCount: number;
  DocumentsCount: number;
  InvoicesCount: number;
  ItemPlantDetails: BPCPlantMaster;
  actionLog: ActionLog;
  SecretKey: string;
  SecureStorage: SecureLS;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  IsProgressBarVisibile1: boolean;
  IsProgressBarVisibile2: boolean;
  IsProgressBarVisibile3: boolean;
  bool = true;
  COUNT = 0;
  GateEntryFormGroup: FormGroup;
  displayColumn = ['Item', 'MaterialText', 'DeliveryDate', 'OrderedQty', 'CompletedQty', 'TransitQty', 'OpenQty', 'UOM'];
  dataSource: MatTableDataSource<any>;
  @ViewChild('MatPaginator1') paginator: MatPaginator;
  @ViewChild('MatSort1') sort: MatSort;

  documentDisplayColumns: string[] = ['ReferenceNo', 'AttachmentName', 'ContentType', 'CreatedOn'];
  documentDataSource: MatTableDataSource<DocumentDetails>;
  @ViewChild('MatPaginator2') documentPaginator: MatPaginator;
  @ViewChild('MatSort2') documentSort: MatSort;

  invoiceDisplayColumns: string[] = ['InvoiceNo', 'InvoiceDate', 'InvoiceAmount', 'AWBNumber', 'PoReference'];
  invoiceDataSource: MatTableDataSource<BPCInvoice>;
  @ViewChild('MatPaginator3') invoicePaginator: MatPaginator;
  @ViewChild('MatSort3') invoiceSort: MatSort;

  constructor(
    private _fuseConfigService: FuseConfigService,
    private _shareParameterService: ShareParameterService,
    private _authService: AuthService,
    private _asnService: ASNService,
    private _poService: POService,
    private _dashboardService: DashboardService,
    private _GateService: GateService,
    private formBuilder: FormBuilder,
    private _router: Router,
    private _datePipe: DatePipe,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.ItemPlantDetails = new BPCPlantMaster();
    this.SelectedASN = new BPCASNHeader();
    this.SelectBPCOFHeader = new BPCOFHeader();
    this.IsProgressBarVisibile = false;
    this.IsProgressBarVisibile1 = false;
    this.IsProgressBarVisibile2 = false;
    this.IsProgressBarVisibile3 = false;
    this.ItemsCount = 0;
    this.DocumentsCount = 0;
    this.InvoicesCount = 0;
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
      // if (this.MenuItems.indexOf('AccountStatement') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //   );
      //   this._router.navigate(['/auth/login']);
      // }

    } else {
      this._router.navigate(['/auth/login']);
    }
    this.SetUserPreference();
    this.InitializeGateEntryForm();
    this.SelectedASNListView = this._shareParameterService.GetASNListView();
    if (this.SelectedASNListView) {
      this._shareParameterService.SetASNListView(null);
      this.GetASNByASN();
      this.GetPOByDoc();
      this.GetTabData(true);
    } else {
      this.notificationSnackBarComponent.openSnackBar('No ASN Selected', SnackBarStatus.danger);
      this._router.navigate(['/orderfulfilment/asnlist']);
    }
  }

  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }

  InitializeGateEntryForm(): void {
    this.GateEntryFormGroup = this.formBuilder.group({
      VessleNumber: [''],
      AWBNumber: [''],
    });
    this.GateEntryFormGroup.disable();
  }
  ResetControl(): void {
    // this.AllASNList = [];
    this.ResetFormGroup(this.GateEntryFormGroup);
  }
  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }

  GetASNByASN(): void {
    this.IsProgressBarVisibile = true;
    this._asnService.GetASNByASN(this.SelectedASNListView.ASNNumber).subscribe(
      (data) => {
        this.SelectedASN = data as BPCASNHeader;
        if (this.SelectedASN) {
          this.GateEntryFormGroup.get('VessleNumber').patchValue(this.SelectedASN.VessleNumber);
          this.GateEntryFormGroup.get('AWBNumber').patchValue(this.SelectedASN.AWBNumber);
        }
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  GetPOByDoc(): void {
    this.IsProgressBarVisibile3 = true;
    this._poService.GetPOByDoc(this.SelectedASNListView.DocNumber).subscribe(
      (data) => {
        this.SelectBPCOFHeader = data as BPCOFHeader;
        this.IsProgressBarVisibile3 = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile3 = false;
      }
    );
  }
  GetTabData(IsPO: boolean): void {
    if (IsPO) {
      this.GetPOItemsByDoc();
      this.GetOFDocumentDetails();
      this.GetInvoicesByDoc();
    } else {
      this.GetASNItemsByASN();
      this.GetASNDocumentDetails();
      this.GetInvoicesByASN();
    }
  }
  GetPOItemsByDoc(): void {
    this.IsProgressBarVisibile1 = true;
    this._poService.GetPOItemsByDoc(this.SelectedASNListView.DocNumber).subscribe(
      (data) => {
        this.SelectedOFItems = data as BPCOFItem[];
        if (this.SelectedOFItems) {
          this.ItemsCount = this.SelectedOFItems.length;
        }
        this.dataSource = new MatTableDataSource(this.SelectedOFItems);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        if (this.SelectedOFItems.length > 0) {
          this.GetItemPlantDetails(this.SelectedOFItems[0].PlantCode);
        }
        this.IsProgressBarVisibile1 = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile1 = false;
      }
    );
  }

  GetOFDocumentDetails(): void {
    // this.IsProgressBarVisibile1 = true;
    this._poService.GetOFDocumentDetails(this.SelectedASNListView.DocNumber).subscribe(
      (data) => {
        this.SelectedDocuments = data as DocumentDetails[];
        if (this.SelectedDocuments) {
          this.DocumentsCount = this.SelectedDocuments.length;
        }
        this.documentDataSource = new MatTableDataSource(this.SelectedDocuments);
        this.documentDataSource.paginator = this.documentPaginator;
        this.documentDataSource.sort = this.documentSort;
        // this.IsProgressBarVisibile1 = false;
      },
      (err) => {
        console.error(err);
        // this.IsProgressBarVisibile1 = false;
      }
    );
  }

  GetInvoicesByDoc(): void {
    // this.IsProgressBarVisibile1 = true;
    this._poService.GetInvoicesByDoc(this.SelectedASNListView.DocNumber).subscribe(
      (data) => {
        this.SelectedInvoices = data as BPCInvoice[];
        if (this.SelectedInvoices) {
          this.InvoicesCount = this.SelectedInvoices.length;
        }
        this.invoiceDataSource = new MatTableDataSource(this.SelectedInvoices);
        this.invoiceDataSource.paginator = this.invoicePaginator;
        this.invoiceDataSource.sort = this.invoiceSort;
        // this.IsProgressBarVisibile1 = false;
      },
      (err) => {
        console.error(err);
        // this.IsProgressBarVisibile1 = false;
      }
    );
  }

  GetASNItemsByASN(): void {
    this.IsProgressBarVisibile1 = true;
    this._asnService.GetASNItemsByASN(this.SelectedASNListView.ASNNumber).subscribe(
      (data) => {
        this.SelectedASNItems = data as BPCASNItem[];
        if (this.SelectedASNItems) {
          this.ItemsCount = this.SelectedASNItems.length;
        }
        this.dataSource = new MatTableDataSource(this.SelectedASNItems);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        if (this.SelectedASNItems.length > 0) {
          this.GetItemPlantDetails(this.SelectedASNItems[0].PlantCode);
        }
        this.IsProgressBarVisibile1 = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile1 = false;
      }
    );
  }

  GetASNDocumentDetails(): void {
    // this.IsProgressBarVisibile1 = true;
    this._asnService.GetASNDocumentDetails(this.SelectedASNListView.ASNNumber).subscribe(
      (data) => {
        this.SelectedDocuments = data as DocumentDetails[];
        if (this.SelectedDocuments) {
          this.DocumentsCount = this.SelectedDocuments.length;
        }
        this.documentDataSource = new MatTableDataSource(this.SelectedDocuments);
        this.documentDataSource.paginator = this.documentPaginator;
        this.documentDataSource.sort = this.documentSort;
        // this.IsProgressBarVisibile1 = false;
      },
      (err) => {
        console.error(err);
        // this.IsProgressBarVisibile1 = false;
      }
    );
  }

  GetInvoicesByASN(): void {
    // this.IsProgressBarVisibile1 = true;
    this._asnService.GetInvoicesByASN(this.SelectedASNListView.ASNNumber).subscribe(
      (data) => {
        this.SelectedInvoices = data as BPCInvoice[];
        if (this.SelectedInvoices) {
          this.InvoicesCount = this.SelectedInvoices.length;
        }
        this.invoiceDataSource = new MatTableDataSource(this.SelectedInvoices);
        this.invoiceDataSource.paginator = this.invoicePaginator;
        this.invoiceDataSource.sort = this.invoiceSort;
        // this.IsProgressBarVisibile1 = false;
      },
      (err) => {
        console.error(err);
        // this.IsProgressBarVisibile1 = false;
      }
    );
  }


  GetItemPlantDetails(PlantCode: string): void {
    this.IsProgressBarVisibile2 = true;
    this._dashboardService.GetItemPlantDetails(PlantCode).subscribe(
      data => {
        this.ItemPlantDetails = data as BPCPlantMaster;
        this.IsProgressBarVisibile2 = false;
      },
      err => {
        console.error(err);
        this.IsProgressBarVisibile2 = false;
      }
    );
  }
  CreateGateEntry(): void {
    this.OpenConfirmationDialog('Post', 'Gate Entry');
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
          this.CreateGateEntryByAsnList();
        }
      });
  }
  CreateGateEntryByAsnList(): void {
    this.IsProgressBarVisibile = true;
    this.CreateActionLogvalues("Post");
    this._GateService.CreateGateEntryByAsnList(this.SelectedASNListView).subscribe(
      (data) => {
        this.notificationSnackBarComponent.openSnackBar("Gate entry completed Successfull", SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this._router.navigate(['/orderfulfilment/asnlist']);
      },
      (err) => {
        this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  CreateActionLogvalues(text): void {
    this.actionLog = new ActionLog();
    this.actionLog.UserID = this.currentUserID;
    this.actionLog.AppName = "Gate Entry";
    this.actionLog.ActionText = text + " is Clicked";
    this.actionLog.Action = text;
    this.actionLog.CreatedBy = this.currentUserName;
    this._authService.CreateActionLog(this.actionLog).subscribe(
      (data) => {
        // console.log(data);
      },
      (err) => {
        console.error(err);
      }
    );
  }
  check(): any {
    if (this.bool) {
      this.bool = false;
      return true;
    }
  }
  check2(): any {
    if (this.bool) {
      this.bool = true;
      return true;
    }
  }
}
