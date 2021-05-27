import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogConfig, MatPaginator, MatSnackBar, MatSort, MatTableDataSource, throwMatDialogContentAlreadyAttachedError } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { CAPAAcceptItems, CAPAAttachment, CAPADialogResponseFiles, CAPAReqHeader, CAPAReqItem, CAPAReqItems } from 'app/models/CAPA';
import { BPCFact, CAPAvendor } from 'app/models/fact';
import { AuthenticationDetails } from 'app/models/master';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { CapaService } from 'app/services/capa.service';
import { AddvendorDialogComponent } from '../addvendor-dialog/addvendor-dialog.component';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-capa-dashboard',
  templateUrl: './capa-dashboard.component.html',
  styleUrls: ['./capa-dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CapaDashboardComponent implements OnInit {
  SelectedCard: any;
  TableName: any;
  DashboardtableColumn = ["HeaderText", "ItemText", "ItemDueDate", "Priority", "Impact", "Patners", "Status"];
  DashboardAccpetTableColumn = ["Select", "HeaderText", "ItemText", "ItemDueDate", "ResponseText", "ResponseDueDate", "Patners", "ResponseItemStatus", "Attachments", "Action"];

  DashboardAccpetDifferedTableColumn = ["HeaderText", "ItemText", "ItemDueDate", "ResponseText", "ResponseDueDate", "Patners", "ResponseItemStatus", "Attachments"];

  CAPADashboardtableColumn = ["ReqID", "Text", "DueDate", "Status"];

  DashboardTableDataSource = new MatTableDataSource<CAPAReqItems>();
  DashboardAccpetTableDataSource = new MatTableDataSource<CAPAAcceptItems>();
  DashboardCAPAClosedDataSource = new MatTableDataSource<CAPAReqItems>();

  SelectedResItem: CAPAAcceptItems[];
  @ViewChild(MatPaginator) tablePaginator: MatPaginator;
  @ViewChild(MatSort) tableSort: MatSort;
  RequestHeaderList: CAPAReqItems[] = [];
  ResponseItemList: CAPAAcceptItems[] = [];
  DueToRealseList: CAPAReqItems[] = [];
  RequestList: CAPAReqItems[] = [];
  DifferedList: CAPAAcceptItems[] = [];
  ResolvedList: CAPAAcceptItems[] = [];
  CAPACloseList: CAPAReqItems[] = [];
  ResolvedDifferedList: CAPAAcceptItems[] = [];
  AcceptAndRejectList: CAPAAcceptItems[] = [];
  AcceptList: CAPAAcceptItems[] = [];
  RejectList: CAPAAcceptItems[] = [];
  FileUploadList: CAPADialogResponseFiles[] = [];
  Vendors: BPCFact[] = [];
  ReqIds: any[] = [];
  ReqID = 0;
  isProgressBarVisibile = false;
  authenticationDetails: AuthenticationDetails;
  CurrentUserID: any;
  currentUserName: string;
  CurrentUserRole: string;
  MenuItems: string[];
  data: CAPAvendor;
  SelectAllCheckBox=false;
  CAPAAcceptResItems: CAPAAcceptItems[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsAllSelected = true;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(private _capaService: CapaService, private _router: Router, public snackBar: MatSnackBar, private dialog: MatDialog,
    private _authService: AuthService,

  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.SelectedResItem = [];
    this.data = new CAPAvendor();

  }

  ngOnInit() {
    const retrievedObject = this.SecureStorage.get('authorizationData');

    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.CurrentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.MenuItems.indexOf('CAPABuyerDashboard') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    }
    this.GetRequestHeaders();
  }
  GetRequestHeaders() {
    this.isProgressBarVisibile = true;
    this._capaService.GetAllCAPAReqs(this.currentUserName).subscribe(
      (res) => {
        this.RequestHeaderList = res as CAPAReqItems[];
        console.log("this.RequestHeaderList", this.RequestHeaderList);
        // this.ReqID = this.RequestHeaderList[0].ReqID;

        this.RequestHeaderList.forEach(headers => {
          // || headers.HeaderStatus === "Closed"
          if (headers.HeaderStatus === "Save") {
            var index = this.DueToRealseList.findIndex(x => x.ReqID == headers.ReqID);
            if (index >= 0) {
              this.DueToRealseList.splice(index, 1);
            }
            this.DueToRealseList.push(headers);
          }
          else if (headers.HeaderStatus === "Closed") {
            var index = this.CAPACloseList.findIndex(x => x.ReqID == headers.ReqID);
            if (index >= 0) {
              this.CAPACloseList.splice(index, 1);
            }
            this.CAPACloseList.push(headers);
          }
          else {
            this.RequestList.push(headers);
          }
          var index = this.ReqIds.findIndex(x => x == headers.ReqID);
          if (index >= 0) {
            this.ReqIds.splice(index, 1);
          }
          this.ReqIds.push(headers.ReqID);
        });

        this.DashboardTableDataSource = new MatTableDataSource<CAPAReqItems>(this.DueToRealseList);
        this.DashboardTableDataSource.sort = this.tableSort;
        this.DashboardTableDataSource.paginator = this.tablePaginator;
        this.TableName = "Due To Realse";
        this.SelectedCard = 1;
        this.isProgressBarVisibile = false;
        this.GetRespondCAPAReqs();

      },
      (err) => {
        this.isProgressBarVisibile = false;
        console.log(err);
      }
    );
  }
  DueToRealseCard(index: any) {
    this.isProgressBarVisibile = true;
    this.TableName = "Due To Realse";
    this.SelectedCard = index;
    this.DashboardCAPAClosedDataSource = new MatTableDataSource<CAPAReqItems>(this.DueToRealseList);
    this.DashboardCAPAClosedDataSource.sort = this.tableSort;
    this.DashboardCAPAClosedDataSource.paginator = this.tablePaginator;

    this.isProgressBarVisibile = false;

  }
  Request(index: any) {
    this.isProgressBarVisibile = true;
    this.TableName = "Request";
    this.SelectedCard = index;
    this.DashboardTableDataSource = new MatTableDataSource<CAPAReqItems>(this.RequestList);
    this.DashboardTableDataSource.sort = this.tableSort;
    this.DashboardTableDataSource.paginator = this.tablePaginator;

    this.isProgressBarVisibile = false;

    this.DashboardTableDataSource = new MatTableDataSource<CAPAReqItems>(this.RequestList);
    this.DashboardTableDataSource.sort = this.tableSort;
    this.DashboardTableDataSource.paginator = this.tablePaginator;
  }
  AcceptAndRejectCard(index: any) {
    this.isProgressBarVisibile = true;

    this.TableName = "Accept / Reject";
    this.SelectedCard = index;
    this.DashboardAccpetTableDataSource = new MatTableDataSource<CAPAAcceptItems>(this.AcceptAndRejectList);
    this.DashboardAccpetTableDataSource.sort = this.tableSort;
    this.DashboardAccpetTableDataSource.paginator = this.tablePaginator;

    this.isProgressBarVisibile = false;

  }
  ResolvedCard(index: any) {
    this.isProgressBarVisibile = true;

    this.TableName = "Resolved";
    this.SelectedCard = index;
    this.DashboardAccpetTableDataSource = new MatTableDataSource<CAPAAcceptItems>(this.ResolvedList);
    this.DashboardAccpetTableDataSource.sort = this.tableSort;
    this.DashboardAccpetTableDataSource.paginator = this.tablePaginator;

    this.isProgressBarVisibile = false;

    this.SelectedResItem=[];
    this.SelectAllCheckBox=false;

  }
  ResolvedDifferedCard(index: any) {
    this.isProgressBarVisibile = true;

    this.TableName = "Resolved / Differed";
    this.SelectedCard = index;
    this.DashboardAccpetTableDataSource = new MatTableDataSource<CAPAAcceptItems>(this.ResolvedDifferedList);
    this.DashboardAccpetTableDataSource.sort = this.tableSort;
    this.DashboardAccpetTableDataSource.paginator = this.tablePaginator;

    this.isProgressBarVisibile = false;

  }
  GetRespondCAPAReqs() {
    this.isProgressBarVisibile = true;
    this.ReqIds.forEach(ID => {
      this._capaService.GetRespondCAPAReqs(ID).subscribe(
        (data) => {
          this.ResponseItemList = data as CAPAAcceptItems[];

          this.ResponseItemList.forEach(ReqList => {
            if (ReqList.ResponseItemStatus == "Resolved") {
              this.ResolvedDifferedList.push(ReqList);
              this.ResolvedList.push(ReqList);
            }
            else if (ReqList.ResponseItemStatus == "Differed") {
              this.ResolvedDifferedList.push(ReqList);
              this.DifferedList.push(ReqList);
            }
            else if (ReqList.ResponseItemStatus == "Accept") {
              this.AcceptList.push(ReqList);
              this.AcceptAndRejectList.push(ReqList);
            }
            else if (ReqList.ResponseItemStatus == "Reject") {
              this.RejectList.push(ReqList);
              this.AcceptAndRejectList.push(ReqList);
            }
          });
          // this.isProgressBarVisibile = false;
        },
        (err) => {
          this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
          this.isProgressBarVisibile = false;
        }
      );
    });
    this.isProgressBarVisibile = false;
  }
  DifferedCard(index: any) {
    this.TableName = "Differed";
    this.SelectedCard = index;
    this.DashboardAccpetTableDataSource = new MatTableDataSource<CAPAAcceptItems>(this.DifferedList);
    this.DashboardAccpetTableDataSource.sort = this.tableSort;
    this.DashboardAccpetTableDataSource.paginator = this.tablePaginator;
    this.SelectedResItem=[];
    this.SelectAllCheckBox=false;
  }
  AcceptCard(index: any) {
    this.TableName = "Accept";
    this.SelectedCard = index;
    this.DashboardAccpetTableDataSource = new MatTableDataSource<CAPAAcceptItems>(this.AcceptList);
    this.DashboardAccpetTableDataSource.sort = this.tableSort;
    this.DashboardAccpetTableDataSource.paginator = this.tablePaginator;

  }
  RejectCard(index: any) {
    this.TableName = "Reject";
    this.SelectedCard = index;
    this.DashboardAccpetTableDataSource = new MatTableDataSource<CAPAAcceptItems>(this.RejectList);
    this.DashboardAccpetTableDataSource.sort = this.tableSort;
    this.DashboardAccpetTableDataSource.paginator = this.tablePaginator;

  }
  CAPAClosedCard(index: any) {
    this.TableName = "CAPA Closed";
    this.SelectedCard = index;
    this.DashboardCAPAClosedDataSource = new MatTableDataSource<CAPAReqItems>(this.CAPACloseList);
    this.DashboardCAPAClosedDataSource.sort = this.tableSort;
    this.DashboardCAPAClosedDataSource.paginator = this.tablePaginator;

  }
  RowSelected(row: CAPAReqItems) {
    console.log("RowSelected", row);
    this._router.navigate(["/buyer/capa-view"], { queryParams: { id: row.ReqID } });
  }
  AcceptTableRowSelected(row: CAPAAcceptItems) {
    // this._router.navigate(["/buyer/capa-view"], { queryParams: { id: row.ReqID } });
  }
  ViewAttachment(row: CAPAAcceptItems) {
    console.log("ViewAttachment", row);
    if (row.AttachmentID <= 0) {
      this.notificationSnackBarComponent.openSnackBar("No Attachments found", SnackBarStatus.danger);
    }
    else {
      this.isProgressBarVisibile = true;
      var index = this.FileUploadList.findIndex(x => x.ReqItemID == row.ReqItemID && x.PatnerID == row.Patners);
      if (index >= 0) {
        let fileType = 'image/jpg';
        fileType = this.FileUploadList[index].Files.name.toLowerCase().includes('.jpg') ? 'image/jpg' :
          this.FileUploadList[index].Files.name.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
            this.FileUploadList[index].Files.name.toLowerCase().includes('.png') ? 'image/png' :
              this.FileUploadList[index].Files.name.toLowerCase().includes('.gif') ? 'image/gif' :
                this.FileUploadList[index].Files.name.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
        const blob = new Blob([this.FileUploadList[index].Files], { type: fileType });
        this.isProgressBarVisibile = false;
        this.openAttachmentDialog(this.FileUploadList[index].Files.name, blob);
      }
      else {
        this._capaService.DownloadOfAttachment(row.ReqID, row.ReqItemID, row.ResItemID).subscribe(
          async data => {
            if (data) {
              console.log("Files", data);
              var files = data as CAPAAttachment;
              const base64Response = await fetch(`data:${files.ContentType};base64,${files.AttachmentFile}`);
              const blobs = await base64Response.blob();
              let fileType = 'image/jpg';
              fileType = files.AttachmentName.toLowerCase().includes('.jpg') ? 'image/jpg' :
                files.AttachmentName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
                  files.AttachmentName.toLowerCase().includes('.png') ? 'image/png' :
                    files.AttachmentName.toLowerCase().includes('.gif') ? 'image/gif' :
                      files.AttachmentName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
              const blob = new Blob([blobs], { type: fileType });

              var filedata = new CAPADialogResponseFiles();
              const file = new File([blob], files.AttachmentName, { type: fileType });
              filedata.ReqItemID = row.ReqItemID;
              filedata.PatnerID = row.Patners;
              filedata.Files = file;
              this.FileUploadList.push(filedata);


              this.openAttachmentDialog(files.AttachmentName, blob);
            }
            this.isProgressBarVisibile = false;
          },
          error => {
            console.error(error);
            this.isProgressBarVisibile = false;
          }
        );
      }
    }
  }
  openAttachmentDialog(FileName: string, blob: Blob): void {
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
  SelectTableRow(row: CAPAAcceptItems, Action = null) {
    this.IsAllSelected = !this.IsAllSelected;
    if (this.IsAllSelected) {
      this.SelectedResItem = [];
    }
    var ResItems = new CAPAAcceptItems();
    ResItems.ReqID = row.ReqID;
    ResItems.ReqItemID = row.ReqItemID;
    ResItems.ResItemID = row.ResItemID;
    ResItems.HeaderText = row.HeaderText;
    ResItems.ItemText = row.ItemText;
    ResItems.ResponseText = row.ResponseText;
    ResItems.ResponseDueDate = row.ResponseDueDate;
    ResItems.Patners = row.Patners;
    ResItems.ResponseItemStatus = row.ResponseItemStatus;
    ResItems.AttachmentID = row.AttachmentID;

    if (this.SelectedResItem.length > 0) {
      var index = this.SelectedResItem.findIndex(x => x.ReqID == row.ReqID && x.ResItemID == row.ResItemID && x.ReqItemID == row.ReqItemID);
      if (index >= 0) {
        this.SelectedResItem.splice(index, 1);
      }
      this.SelectedResItem.push(ResItems);
    }
    else {
      this.SelectedResItem.push(ResItems);
    }
    if (Action != null && Action == 'Accept') {
      this.AcceptResItems();
    }
    else if (Action != null && Action == 'Reject') {
      this.RejectResItems();
    }
  }
  SelectAllTableRow() {
    this.IsAllSelected = !this.IsAllSelected;
    if (this.IsAllSelected) {
      this.SelectedResItem = [];
      // this.IsAllSelected=false;
    }
    else {
      this.SelectedResItem = [];
      if (this.TableName == "Differed") {
        this.DifferedList.forEach(list => {
          this.SelectedResItem.push(list);
        });
      }
      else if (this.TableName == "Resolved") {
        this.ResolvedList.forEach(list => {
          this.SelectedResItem.push(list);
        });
      }
      else {
        this.ResolvedDifferedList.forEach(list => {
          this.SelectedResItem.push(list);
        });
      }
      this.SelectAllCheckBox=true;
    }
  }
  AcceptResItems() {
    if (this.SelectedResItem.length > 0) {
      this.SelectAllCheckBox=false;
      this.IsAllSelected=true;
      this.isProgressBarVisibile = true;
      this._capaService.AcceptCAPAResponseItem(this.SelectedResItem).subscribe(
        (data) => {
          this.ClearData();
          this.isProgressBarVisibile = false;
          this.GetRequestHeaders();
          this.DueToRealseCard(1);

          this.notificationSnackBarComponent.openSnackBar("Item Accepted", SnackBarStatus.success);
        },
        (err) => {
          this.isProgressBarVisibile = false;

          this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
        }
      );
    }
    else {
      this.notificationSnackBarComponent.openSnackBar("Please Select Atleast One Item", SnackBarStatus.danger);
    }
  }
  ClearData() {
    this.RequestList = [];
    this.DueToRealseList = [];
    this.SelectedResItem = [];
    this.ResolvedList = [];
    this.DifferedList = [];
    this.AcceptAndRejectList = [];
    this.AcceptList = [];
    this.RejectList = [];
    this.CAPACloseList = [];
    this.ResolvedDifferedList = [];
  }
  RejectResItems() {
    if (this.SelectedResItem.length > 0) {
      this.SelectAllCheckBox=false;
      this.IsAllSelected=true;
      console.log("RejectResItems",this.SelectedResItem);
      this.isProgressBarVisibile = true;
      this._capaService.RejectCAPAResponseItem(this.SelectedResItem).subscribe(
        (data) => {
          this.ClearData();
          this.isProgressBarVisibile = false;
          this.GetRequestHeaders();
          this.DueToRealseCard(1);
          this.notificationSnackBarComponent.openSnackBar("Item Rejected", SnackBarStatus.success);
        },
        (err) => {
          this.isProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
        }
      );
    }
    else {
      this.notificationSnackBarComponent.openSnackBar("Please Select Atleast One Item", SnackBarStatus.danger);
    }
  }
  ViewVendors(vendors: any[]) {
    this.isProgressBarVisibile = true;
    this._capaService.GetVendorDetails(vendors).subscribe(
      (response) => {
        this.Vendors = [];
        var ven = response as BPCFact[];
        ven.forEach(element => {
          this.Vendors.push(element);
        });
        this.isProgressBarVisibile = false;

        this.OpenVendorDialog();
      },
      (err) => {
        this.isProgressBarVisibile = false;

        this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
      }
    );
  }
  OpenVendorDialog() {
    this.data.Vendors = [];
    this.data.SelectedVendors = [];

    this.Vendors.forEach(element => {
      this.data.Vendors.push(element);
    });
    this.data.Action = false;
    const dialogConfig: MatDialogConfig = {
      data: this.data,
      panelClass: "addvendor-dialog",
      disableClose: true
    };
    const dialogRef = this.dialog.open(
      AddvendorDialogComponent,
      dialogConfig
    );
  }
}
