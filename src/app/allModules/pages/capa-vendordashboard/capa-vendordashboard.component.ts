import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogConfig, MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { CAPAAcceptItems, CAPAAttachment, CAPADialogResponseFiles, CAPAReqHeader } from 'app/models/CAPA';
import { AuthenticationDetails } from 'app/models/master';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { CapaService } from 'app/services/capa.service';
import * as SecureLS from 'secure-ls';

@Component({
  selector: 'app-capa-vendordashboard',
  templateUrl: './capa-vendordashboard.component.html',
  styleUrls: ['./capa-vendordashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CapaVendordashboardComponent implements OnInit {

  HeaderList: CAPAReqHeader[] = [];
  RequestList: CAPAReqHeader[] = [];
  ClosedList: CAPAReqHeader[] = [];
  FileUploadList: CAPADialogResponseFiles[] = [];

  TableName: any;
  @ViewChild(MatSort) tableSort: MatSort;
  @ViewChild(MatPaginator) tablePaginator: MatPaginator;

  DashboardtableColumn = ["ReqID", "Text", "DueDate", "Status", "Action"];
  DashboardAccpetTableColumn = ["HeaderText", "ItemText", "ItemDueDate", "ResponseText", "ResponseDueDate", "Patners", "ResponseItemStatus", "Attachments", "Action"];

  DashboardTableDataSource = new MatTableDataSource<CAPAReqHeader>();
  DashboardAccpetTableDataSource = new MatTableDataSource<CAPAAcceptItems>();
  AccpetedList: CAPAAcceptItems[] = [];
  RejectedList: CAPAAcceptItems[] = [];
  ResolvedAndDifferedList: CAPAAcceptItems[] = [];
  ResolvedList: CAPAAcceptItems[] = [];
  DifferedList: CAPAAcceptItems[] = [];
  SelectedCard: number;
  authenticationDetails: any;
  CurrentUserID: any;
  currentUserName: any;
  CurrentUserRole: any;
  MenuItems: any;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile = false;
  ReqIds: any[] = [];
  ResponseItemList: CAPAAcceptItems[];
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(private _capaService: CapaService, private _router: Router, public snackBar: MatSnackBar, private _authService: AuthService,
    private dialog: MatDialog) {
      this.SecretKey = this._authService.SecretKey;
        this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit() {
    const retrievedObject =  this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.CurrentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.MenuItems.indexOf('CAPAVendorDashboard') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    }
    this.GetRequestHeaders();
  }
  GetRequestHeaders() {
    this.isProgressBarVisibile = true;
    this._capaService.GetCAPAReqHeadersByVendorID(this.currentUserName).subscribe(
      (res) => {
        this.HeaderList = res as CAPAReqHeader[];
        console.log("HeaderList",this.HeaderList);
        this.HeaderList.forEach(headers => {
          if (headers.Status === "Open") {
            this.RequestList.push(headers);
          }
          else if (headers.Status === "Closed"){
            this.ClosedList.push(headers);
          }
          this.ReqIds.push(headers.ReqID);
        });
        this.RequestCard(1);
        this.isProgressBarVisibile = false;
        this.GetRespondCAPAReqs();
      },
      (err) => {
        this.isProgressBarVisibile = false;
        console.log(err);
      }
    );
  }
  GetRespondCAPAReqs() {
    this.isProgressBarVisibile = true;
    this.ReqIds.forEach(ID => {
      this._capaService.GetBuyerRespondCAPAReqs(ID, this.currentUserName).subscribe(
        (data) => {
          this.ResponseItemList = data as CAPAAcceptItems[];
          console.log("CAPAAcceptItems", this.ResponseItemList);

          this.ResponseItemList.forEach(ReqList => {
            if (ReqList.ResponseItemStatus == "Accept") {
              this.AccpetedList.push(ReqList);
            }
            else if (ReqList.ResponseItemStatus == "Reject") {
              this.RejectedList.push(ReqList);
            }
            else if (ReqList.ResponseItemStatus == "Resolved" ) {
              this.ResolvedList.push(ReqList);
              this.ResolvedAndDifferedList.push(ReqList);
            }
            else if(ReqList.ResponseItemStatus == "Differed")
            {
              this.DifferedList.push(ReqList);
              this.ResolvedAndDifferedList.push(ReqList);
            }
          });
          this.isProgressBarVisibile = false;
        },
        (err) => {
          this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
          this.isProgressBarVisibile = false;
        }
      );
    });
    this.isProgressBarVisibile = false;
  }
  Response(element: CAPAReqHeader) {
    this._router.navigate(["/pages/capa-response"], { queryParams: { id: element.ReqID, Type: 'Respond' } });
  }
  ViewBuyerResponse(element: any, Action: any) {
    if(Action === "Resolved" || Action === "Differed")
    {
      Action="ResolvedDiffered"
    }
    this._router.navigate(["/pages/capa-response"], { queryParams: { id: element.ReqID, Type: Action } });
  }
  RequestCard(index: any) {
    this.SelectedCard = index;
    this.TableName = "Yet To Respond"
    this.DashboardTableDataSource = new MatTableDataSource<CAPAReqHeader>(this.RequestList);
    this.DashboardTableDataSource.paginator=this.tablePaginator;
    this.DashboardTableDataSource.sort=this.tableSort;

  }
  AcceptedCard(index: any) {
    this.SelectedCard = index;
    this.TableName = "Accept"
    this.DashboardAccpetTableDataSource = new MatTableDataSource<CAPAAcceptItems>(this.AccpetedList);
    this.DashboardAccpetTableDataSource.paginator=this.tablePaginator;
    this.DashboardAccpetTableDataSource.sort=this.tableSort;
  }
  RejectedCard(index: any) {
    this.SelectedCard = index;
    this.TableName = "Reject"
    this.DashboardAccpetTableDataSource = new MatTableDataSource<CAPAAcceptItems>(this.RejectedList);
    this.DashboardAccpetTableDataSource.paginator=this.tablePaginator;
    this.DashboardAccpetTableDataSource.sort=this.tableSort;

  }
  ClosedCard(index: any) {
    this.SelectedCard = index;
    this.TableName = "Closed"
    this.DashboardTableDataSource = new MatTableDataSource<CAPAReqHeader>(this.ClosedList);
    this.DashboardTableDataSource.paginator=this.tablePaginator;
    this.DashboardTableDataSource.sort=this.tableSort;

  }
  ResolvedAndDifferedCard(index: any) {
    this.SelectedCard = index;
    this.TableName = "ResolvedDiffered"
    this.DashboardAccpetTableDataSource = new MatTableDataSource<CAPAAcceptItems>(this.ResolvedAndDifferedList);
    this.DashboardAccpetTableDataSource.paginator=this.tablePaginator;
    this.DashboardAccpetTableDataSource.sort=this.tableSort;
  }
  ResolvedCard(index: any) {
    this.SelectedCard = index;
    this.TableName = "Resolved"
    this.DashboardAccpetTableDataSource = new MatTableDataSource<CAPAAcceptItems>(this.ResolvedList);
    this.DashboardAccpetTableDataSource.paginator=this.tablePaginator;
    this.DashboardAccpetTableDataSource.sort=this.tableSort;
  }
  DifferedCard(index: any) {
    this.SelectedCard = index;
    this.TableName = "Differed"
    this.DashboardAccpetTableDataSource = new MatTableDataSource<CAPAAcceptItems>(this.DifferedList);
    this.DashboardAccpetTableDataSource.paginator=this.tablePaginator;
    this.DashboardAccpetTableDataSource.sort=this.tableSort;
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
}
