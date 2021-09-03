import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatMenuTrigger, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { FuseConfigService } from '@fuse/services/config.service';
import { ChartOptions } from 'app/allModules/pages/dashboard/dashboard.component';
import { BPCInvoiceAttachment } from 'app/models/ASN';
import { OfOption, OfStatus, OfType, DashboardGraphStatus, OTIFStatus, QualityStatus, FulfilmentStatus, Deliverystatus, FulfilmentDetails, OfOption1 } from 'app/models/Dashboard';
import { BPCKRA } from 'app/models/fact';
import { UserPreference, AuthenticationDetails, AppUsage } from 'app/models/master';
import { ActionLog, BPCOFHeaderView, BPCOFHeader, OfAttachmentData, BPCOFHeaderView1 } from 'app/models/OrderFulFilment';
import { AttachmentViewDialogComponent } from 'app/notifications/attachment-view-dialog/attachment-view-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { DashboardService } from 'app/services/dashboard.service';
import { FactService } from 'app/services/fact.service';
import { MasterService } from 'app/services/master.service';
import { ChartType } from 'chart.js';
import { Guid } from 'guid-typescript';
import * as SecureLS from 'secure-ls';
import * as FileSaver from "file-saver";
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-material-order-fulfilment',
  templateUrl: './material-order-fulfilment.component.html',
  styleUrls: ['./material-order-fulfilment.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class MaterialOrderFulfilmentComponent implements OnInit {

  public BarchartOptions: Partial<ChartOptions>;
  statusvalue = '';
  KRAData: BPCKRA[] = [];
  TableFooterShow = false;
  canvas: any;
  ctx: any;
  cx: any;
  cy: any;
  BGClassName: any;
  fuseConfig: any;
  userPreference: UserPreference;
  length: any;
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  partnerID: string;
  menuItems: string[];
  ActionLog: ActionLog;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  attachmentViewDialogComponent: AttachmentViewDialogComponent;
  isProgressBarVisibile: boolean;
  isDateError: boolean;
  ofDetails: BPCOFHeaderView1[] = [];
  filteredOfDetails: BPCOFHeaderView1[] = [];
  ofAttachments: BPCInvoiceAttachment[] = [];
  ofDetailsFormGroup: FormGroup;
  ofOption: OfOption1;
  ofDetailsDisplayedColumns: string[] = [
    "Material",
    "DocNumber",
    // "DocVersion",
    "DocType",
    "DocDate",
    "TransitQty",
    "OpenQty",
    "PlantCode",
    "Status",
    "Document",
  ];
  ofDetailsDataSource: MatTableDataSource<BPCOFHeaderView1>;
  @ViewChild(MatPaginator) ofDetailsPaginator: MatPaginator;
  @ViewChild(MatSort) ofDetailsSort: MatSort;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  selection = new SelectionModel<any>(true, []);
  Fulfilments: any[] = [];
  DeliveryStatus: any[] = [];
  ofStatusOptions: OfStatus[] = [
    { Value: "All", Name: "All" },
    { Value: "DueForACK", Name: "Due for ACK" },
    { Value: "DueForASN", Name: "Due for ASN" },
    { Value: "PartialASN", Name: "Partial ASN" },
    { Value: "DueForGate", Name: "Due for Gate" },
    { Value: "DueForGRN", Name: "Due for GRN" },
    { Value: "PartialGRN", Name: "Partial GRN" },
  ];
  ofTypeOptions: OfType[] = [
    { Value: "All", Name: "All" },
    { Value: "MAT", Name: "Material" },
    { Value: "SER", Name: "Service" },
    { Value: "AST", Name: "Asset" },
  ];
  searchText = "";
  FilterVal = "All";
  ActionModel = "Acknowledge";
  DashboardGraphStatus: DashboardGraphStatus = new DashboardGraphStatus();
  OTIFStatus: OTIFStatus = new OTIFStatus();
  QualityStatus: QualityStatus = new QualityStatus();
  fulfilmentStatus: FulfilmentStatus = new FulfilmentStatus();
  dashboardDeliverystatus: Deliverystatus = new Deliverystatus();
  selectedPoDetails: BPCOFHeader = new BPCOFHeader();

  // Circular Progress bar
  radius = 60;
  circumference = 2 * Math.PI * this.radius;
  dashoffset1: number;
  dashoffset2: number;
  progressPercentage1 = 0;
  progressPercentage2 = 0;
  nextProcess: string;


  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _formBuilder: FormBuilder,
    private _router: Router,
    public snackBar: MatSnackBar,
    public _dashboardService: DashboardService,
    public _authService: AuthService,
    private _masterService: MasterService,
    private _factService: FactService,
    private datePipe: DatePipe,
    private dialog: MatDialog,

  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(
      this.snackBar
    );
    this.authenticationDetails = new AuthenticationDetails();
    this.isProgressBarVisibile = false;

  }

  ngOnInit(): void {
    this.SetUserPreference();

    // Retrive authorizationData
    const retrievedObject = this.SecureStorage.get("authorizationData");
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(
        retrievedObject
      ) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.partnerID = this.authenticationDetails.UserName;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(
        ","
      );
      // console.log(this.authenticationDetails);
      if (this.menuItems.indexOf("OrderFulFilmentCenter") < 0) {
        this.notificationSnackBarComponent.openSnackBar(
          "You do not have permission to visit this page",
          SnackBarStatus.danger
        );
        this._router.navigate(["/auth/login"]);
      }
    } else {
      this._router.navigate(["/auth/login"]);
    }
    this.CreateAppUsage();
    this.initialiseOfDetailsFormGroup();
    this.GetOfDetails();

  }

  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = "Order fulfillment Center";
    appUsage.UsageCount = 1;
    appUsage.CreatedBy = this.currentUserName;
    appUsage.ModifiedBy = this.currentUserName;
    this._masterService.CreateAppUsage(appUsage).subscribe(
      (data) => { },
      (err) => {
        console.error(err);
      }
    );
  }

  GetOfDetails(): void {
    if (this.currentUserRole === 'Import Vendor') {
      this.isProgressBarVisibile = true;
      this._dashboardService.GetOFHeaderView1ByImportVendor(this.partnerID).subscribe(
        (data) => {
          if (data) {
            this.length = data.length;
            this.ofDetails = <BPCOFHeaderView1[]>data;

            this.ofDetailsDataSource = new MatTableDataSource(this.ofDetails);

            this.ofDetailsDataSource.paginator = this.ofDetailsPaginator;
            this.ofDetailsDataSource.sort = this.ofDetailsSort;
          }
          this.isProgressBarVisibile = false;
        },
        (err) => {
          console.error(err);
          this.isProgressBarVisibile = false;
        }
      );
    } else {
      this.isProgressBarVisibile = true;
      this._dashboardService.GetOFHeaderView1ByPartnerID(this.partnerID).subscribe(
        (data) => {
          if (data) {
            this.length = data.length;
            this.ofDetails = <BPCOFHeaderView1[]>data;

            this.ofDetailsDataSource = new MatTableDataSource(this.ofDetails);

            this.ofDetailsDataSource.paginator = this.ofDetailsPaginator;
            this.ofDetailsDataSource.sort = this.ofDetailsSort;
          }
          this.isProgressBarVisibile = false;
        },
        (err) => {
          console.error(err);
          this.isProgressBarVisibile = false;
        }
      );
    }

  }

  ResetClicked(text): void {
    this.GetOfDetails();
    this.CreateActionLogvalues(text);
    this.initialiseOfDetailsFormGroup();
    this.TableFooterShow = false;
  }

  GetOfsByOption(ofOption: OfOption1, buttonText = null): void {
    if (this.currentUserRole === 'Import Vendor') {
      ofOption.ImportVendor = this.currentUserName;
      this.isProgressBarVisibile = true;
      this._dashboardService.GetOFHeaderView1ByOptionByImportVendor(ofOption).subscribe(
        (data) => {
          if (data) {
            this.ofDetails = <BPCOFHeaderView1[]>data;
            this.ofDetailsDataSource = new MatTableDataSource(
              this.ofDetails
            );
            if (this.ofDetails.length === 0) {
              this.TableFooterShow = true;
            }
            else {
              this.TableFooterShow = false;
            }
            this.ofDetailsDataSource.paginator = this.ofDetailsPaginator;
            this.ofDetailsDataSource.sort = this.ofDetailsSort;
            this.statusvalue = ofOption.DocType;
          }
          this.isProgressBarVisibile = false;
        },
        (err) => {
          console.error(err);
          this.isProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar(
            err instanceof Object ? "Something went wrong" : err,
            SnackBarStatus.danger
          );
        }
      );
    } else {
      this.isProgressBarVisibile = true;
      this._dashboardService.GetOFHeaderView1ByOption(ofOption).subscribe(
        (data) => {
          if (data) {
            this.ofDetails = <BPCOFHeaderView1[]>data;
            this.ofDetailsDataSource = new MatTableDataSource(
              this.ofDetails
            );
            if (this.ofDetails.length === 0) {
              this.TableFooterShow = true;
            }
            else {
              this.TableFooterShow = false;
            }
            this.ofDetailsDataSource.paginator = this.ofDetailsPaginator;
            this.ofDetailsDataSource.sort = this.ofDetailsSort;
            this.statusvalue = ofOption.DocType;
          }
          this.isProgressBarVisibile = false;
        },
        (err) => {
          console.error(err);
          this.isProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar(
            err instanceof Object ? "Something went wrong" : err,
            SnackBarStatus.danger
          );
        }
      );
    }

    if (buttonText != null) {
      this.CreateActionLogvalues(buttonText);
    }
    this.clearOfDetailsFormGroup();
  }

  // ResetClicked(): void {
  //     this.GetOfDetails();
  // }
  CreateActionLogvalues(text): void {
    this.ActionLog = new ActionLog();
    this.ActionLog.UserID = this.currentUserID;
    this.ActionLog.AppName = "OrderFulfilmentCenter";
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


  initialiseOfDetailsFormGroup(): void {
    this.ofDetailsFormGroup = this._formBuilder.group({
      DocNumber: [""],
      FromDate: [""],
      ToDate: [""],
      Status: [""],
      DocType: [""],
      Material: [""],
      Plant: [""],
      TransitQty: [""],
      OpenQty: [""],
    });
  }

  clearOfDetailsFormGroup(): void {
    Object.keys(this.ofDetailsFormGroup.controls).forEach((key) => {
      this.ofDetailsFormGroup.get(key).markAsTouched();
      this.ofDetailsFormGroup.get(key).markAsDirty();
    });
  }

  getOfDetailsFormValues(): void { }

  getOfsByOptionClicked(buttonText: string): void {
    if (this.ofDetailsFormGroup.valid) {
      if (!this.isDateError) {
        this.ofOption = new OfOption1();
        this.ofOption.DocNumber = this.ofDetailsFormGroup.get("DocNumber").value;
        this.ofOption.FromDate = this.datePipe.transform(
          this.ofDetailsFormGroup.get("FromDate").value as Date,
          "yyyy-MM-dd"
        );
        this.ofOption.ToDate = this.datePipe.transform(
          this.ofDetailsFormGroup.get("ToDate").value as Date,
          "yyyy-MM-dd"
        );
        this.ofOption.Status = this.ofDetailsFormGroup.get(
          "Status"
        ).value;
        this.ofOption.DocType = this.ofDetailsFormGroup.get(
          "DocType"
        ).value;
        this.ofOption.Material = this.ofDetailsFormGroup.get("Material").value;
        this.ofOption.Plant = this.ofDetailsFormGroup.get("Plant").value;
        this.ofOption.TransitQty = this.ofDetailsFormGroup.get("TransitQty").value;
        this.ofOption.OpenQty = this.ofDetailsFormGroup.get("OpenQty").value;
        this.ofOption.PartnerID = this.partnerID;
        this.GetOfsByOption(this.ofOption, buttonText);
      }
    }
    // this.initialiseOfDetailsFormGroup();
  }



  openMyMenu(index: any): void {
    alert(index);
    this.matMenuTrigger.openMenu();
  }

  closeMyMenu(index: any): void {
    alert(index);
    this.matMenuTrigger.closeMenu();
  }

  fromAndToDateChanged(): void {
    const FROMDATEVAL = this.ofDetailsFormGroup.get("FromDate")
      .value as Date;
    const TODATEVAL = this.ofDetailsFormGroup.get("ToDate").value as Date;
    if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
      this.isDateError = true;
    } else {
      this.isDateError = false;
    }
  }

  goToPOFactSheetClicked(po: string): void {
    this.CreateActionLogvalues("PO Fact Sheet");
    this._router.navigate(["/pages/polookup"], { queryParams: { id: po } });
  }

  acknowledgementClicked(po: string, text): void {
    this.CreateActionLogvalues(text);
    this._router.navigate(["/pages/polookup"], { queryParams: { id: po } });
  }

  goToPOFlipClicked(po: string): void {
    this._router.navigate(["/poflip"], { queryParams: { id: po } });
  }

  goToSupportDeskClicked(po: string): void {
    this.CreateActionLogvalues("Support Desk");
    this._router.navigate(["/support/supportticket"], {
      queryParams: { id: po, navigator_page: 'PO' },
    });
  }

  goToASNClicked(po: string, type: string): void {
    this.CreateActionLogvalues("ASN");
    this._router.navigate(["/asn"], { queryParams: { id: po, type: type } });
  }

  goToSubconClicked(po: string): void {
    this._router.navigate(['/subcon/productionlog'], { queryParams: { id: po } });
    // this._router.navigate(["/subcon"], { queryParams: { id: po } });
  }

  goToPrintPOClicked(po: string): void {
    this.isProgressBarVisibile = true;
    this.CreateActionLogvalues("Print PO");
    this._dashboardService.PrintPO(po).subscribe(
      (data) => {
        if (data) {
          const fileType = "application/pdf";
          const blob = new Blob([data], { type: fileType });
          const currentDateTime = this.datePipe.transform(
            new Date(),
            "ddMMyyyyHHmmss"
          );
          FileSaver.saveAs(blob, po + "_" + currentDateTime + ".pdf");
        }
        this.isProgressBarVisibile = false;
      },
      (error) => {
        console.error(error);
        this.isProgressBarVisibile = false;
      }
    );
  }

  nextProcessClicked(nextProcess: string, po: string): void {
    this.CreateActionLogvalues("Next Process Clicked");
    if (nextProcess === "ACK") {
      this._router.navigate(["/pages/polookup"], {
        queryParams: { id: po },
      });
    } else if (nextProcess === "ASN/SCN") {
      this._router.navigate(["/asn"], { queryParams: { id: po } });
    }
  }

  onMouseMove(event): void {
    console.log(event); // true false
    // if true then the mouse is on control and false when you leave the mouse
  }

  progress1(value: number): void {
    // alert(value);
    const progress = value / 100;
    this.progressPercentage1 = Math.round(progress * 100);
    this.dashoffset1 = this.circumference * progress;
    // console.log(this.progressPercentage1);
  }

  progress2(value: number): void {
    // alert(value);
    const progress = value / 100;
    this.progressPercentage2 = Math.round(progress * 100);
    this.dashoffset2 = this.circumference * progress;
    // console.log(this.progressPercentage2);
  }

  formatSubtitle = (): string => {
    return "Effiency";
  }

  pieChartLabel(Fulfilments: any[], name: string): string {
    const item = Fulfilments.filter((data) => data.name === name);
    if (item.length > 0) {
      return item[0].label;
    }
    return name;
  }

  getStatusColor(element: BPCOFHeader, StatusFor: string): string {
    switch (StatusFor) {
      case "ASN":
        return element.Status === "DueForACK"
          ? "gray"
          : element.Status === "DueForASN"
            ? "gray"
            : element.Status === "PartialASN"
              ? "#efb577" : "#34ad65";
      case "Gate":
        return element.Status === "DueForACK"
          ? "gray"
          : element.Status === "DueForASN"
            ? "gray"
            : element.Status === "PartialASN"
              ? "gray"
              : element.Status === "DueForGate"
                ? "gray"
                : "#34ad65";
      case "GRN":
        return element.Status === "DueForACK"
          ? "gray"
          : element.Status === "DueForASN"
            ? "gray"
            : element.Status === "PartialASN"
              ? "gray"
              : element.Status === "DueForGate"
                ? "gray"
                : element.Status === "DueForGRN"
                  ? "gray"
                  : element.Status === "PartialGRN"
                    ? "#efb577"
                    : "#34ad65";
      default:
        return "";
    }
  }

  getGateStatusColor(element: BPCOFHeaderView): string {
    return element.GateStatus === "DueForGate"
      ? "gray" : element.GateStatus === "PartialGate"
        ? "#efb577" : "#34ad65";
  }
  getGRNStatusColor(element: BPCOFHeaderView): string {
    return element.GRNStatus === "DueForGRN"
      ? "gray" : element.GRNStatus === "PartialGRN"
        ? "#efb577" : "#34ad65";
  }

  getNextProcess(element: any): void {
    if (element.Status === "DueForACK") {
      element.NextProcess = "ACK";
    } else if (element.Status === "DueForASN") {
      element.NextProcess = "ASN/SCN";
    } else if (element.Status === "PartialASN") {
      element.NextProcess = "ASN/SCN";
    }
    else if (element.Status === "DueForGate") {
      element.NextProcess = "Gate";
    } else if (element.Status === "PartialGRN") {
      element.NextProcess = "GRN";
    }
    else {
      element.NextProcess = "GRN";
    }
  }

  getTimeline(element: BPCOFHeaderView, StatusFor: string): string {
    switch (StatusFor) {
      case "ASN":
        return element.Status === "DueForACK"
          ? "white-timeline"
          : element.Status === "DueForASN"
            ? "white-timeline"
            : element.Status === "PartialASN"
              ? "orange-timeline" : "green-timeline";
      case "Gate":
        return element.Status === "DueForACK"
          ? "white-timeline"
          : element.Status === "DueForASN"
            ? "white-timeline"
            : element.Status === "PartialASN"
              ? "white-timeline"
              : element.Status === "DueForGate"
                ? "white-timeline"
                : "green-timeline";
      case "GRN":
        return element.Status === "DueForACK"
          ? "white-timeline"
          : element.Status === "DueForASN"
            ? "white-timeline"
            : element.Status === "PartialASN"
              ? "white-timeline"
              : element.Status === "DueForGate"
                ? "white-timeline"
                : element.Status === "DueForGRN"
                  ? "white-timeline"
                  : element.Status === "PartialGRN"
                    ? "orange-timeline"
                    : "green-timeline";
      default:
        return "";
    }
  }
  getGateTimeline(element: BPCOFHeaderView): string {
    return element.GateStatus === "DueForGate"
      ? "white-timeline" : element.GateStatus === "PartialGate"
        ? "orange-timeline" : "green-timeline";
  }
  getGRNTimeline(element: BPCOFHeaderView): string {
    return element.GRNStatus === "DueForGRN"
      ? "white-timeline" : element.GRNStatus === "PartialGRN"
        ? "orange-timeline" : "green-timeline";
  }
  getRestTimeline(element: BPCOFHeaderView, StatusFor: string): string {
    switch (StatusFor) {
      case "ASN":
        return element.Status === "DueForACK"
          ? "white-timeline"
          : element.Status === "DueForASN"
            ? "white-timeline"
            : element.Status === "PartialASN"
              ? element.GateStatus === 'PartialGate' ? "orange-timeline" : "white-timeline"
              : element.Status === "DueForGate"
                ? "white-timeline"
                : "green-timeline";
      case "Gate":
        return element.Status === "DueForACK"
          ? "white-timeline"
          : element.Status === "DueForASN"
            ? "white-timeline"
            : element.Status === "PartialASN"
              ? "white-timeline"
              : element.Status === "DueForGate"
                ? "white-timeline"
                : element.Status === "DueForGRN"
                  ? "white-timeline"
                  : "green-timeline";
      case "GRN":
        return element.Status === "DueForACK"
          ? "white-timeline"
          : element.Status === "DueForASN"
            ? "white-timeline"
            : element.Status === "PartialASN"
              ? "white-timeline"
              : element.Status === "DueForGate"
                ? "white-timeline"
                : element.Status === "DueForGRN"
                  ? "white-timeline"
                  : element.Status === "PartialGRN"
                    ? "white-timeline"
                    : "green-timeline";
      default:
        return "";
    }
  }
  getGateRestTimeline(element: BPCOFHeaderView): string {
    return element.GateStatus === "DueForGate"
      ? "white-timeline" : element.GateStatus === "PartialGate"
        ? element.GRNStatus === 'PartialGRN' ? "orange-timeline" : 'white-timeline' : "green-timeline";
  }
  getGRNRestTimeline(element: BPCOFHeaderView): string {
    return element.GRNStatus === "DueForGRN"
      ? "white-timeline" : element.GRNStatus === "PartialGRN"
        ? "orange-timeline" : "green-timeline";
  }

  viewOfAttachmentClicked(element: BPCOFHeaderView): void {
    this.CreateActionLogvalues("view Attachment Clicked");
    // const attachments = this.ofAttachments.filter(x => x.AttachmentID.toString() === element.RefDoc);
    this.GetOfAttachmentsByPartnerIDAndDocNumber(element);
  }
  GetOfAttachmentsByPartnerIDAndDocNumber(element: BPCOFHeaderView): void {
    this.isProgressBarVisibile = true;
    this._dashboardService
      .GetOfAttachmentsByPartnerIDAndDocNumber(
        this.authenticationDetails.UserName,
        element.DocNumber
      )
      .subscribe(
        (data) => {
          if (data) {
            this.ofAttachments = data as BPCInvoiceAttachment[];
            console.log(this.ofAttachments);
            const ofAttachmentData = new OfAttachmentData();
            ofAttachmentData.Client = element.Client;
            ofAttachmentData.Company = element.Company;
            ofAttachmentData.Type = element.Type;
            ofAttachmentData.PatnerID = element.PatnerID;
            ofAttachmentData.DocNumber = element.DocNumber;
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
        this.GetOfDetails();
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

}
