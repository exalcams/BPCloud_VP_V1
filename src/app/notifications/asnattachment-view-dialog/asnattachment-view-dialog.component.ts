import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource, MatDialog, MatSnackBar, MatDialogRef, MAT_DIALOG_DATA, MatDialogConfig } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { BPCASNAttachment, BPCInvoiceAttachment } from 'app/models/ASN';
import { AuthenticationDetails, UserWithRole } from 'app/models/master';
import { OfAttachmentData } from 'app/models/OrderFulFilment';
import { SupportHeaderView, SupportMaster, SupportHeader } from 'app/models/support-desk';
import { AttachmentDetails } from 'app/models/task';
import { ASNService } from 'app/services/asn.service';
import { AuthService } from 'app/services/auth.service';
import { DashboardService } from 'app/services/dashboard.service';
import { MasterService } from 'app/services/master.service';
import { SupportDeskService } from 'app/services/support-desk.service';
import { Guid } from 'guid-typescript';
import { AttachmentDialogComponent } from '../attachment-dialog/attachment-dialog.component';
import { AttachmentViewDialogComponent } from '../attachment-view-dialog/attachment-view-dialog.component';
import { NotificationDialogComponent } from '../notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from '../notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from '../snackbar-status-enum';

@Component({
  selector: 'app-asnattachment-view-dialog',
  templateUrl: './asnattachment-view-dialog.component.html',
  styleUrls: ['./asnattachment-view-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ASNAttachmentViewDialogComponent implements OnInit {

  IsProgressBarVisibile: boolean;
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  menuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  ofAttachments: BPCInvoiceAttachment[] = [];
  InvoiceAttachments: BPCASNAttachment[] = [];
  DocumentCenterAttachments: BPCASNAttachment[] = [];
  docNumber: string;
  invoiceAttachment: File;
  invoiceAttachments: File[] = [];
  invAttach: BPCInvoiceAttachment;
  users: UserWithRole[] = [];
  filteredUsers: UserWithRole[] = [];
  partnerID: string;
  supportTicketView: SupportHeaderView;
  supportMasters: SupportMaster[] = [];
  AttachmentDisplayedColumns: string[] = [
    'AttachmentName',
  ];
  // AttachmentDataSource: MatTableDataSource<BPCASNAttachment>;
  SecretKey: string;


  constructor(
    private dialog: MatDialog,
    public _dashboardService: DashboardService,
    private _asnService: ASNService,
    public snackBar: MatSnackBar,
    public matDialogRef: MatDialogRef<AttachmentViewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public ASNAttachments: BPCASNAttachment[]  ) {

    this.IsProgressBarVisibile = false;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    // this.AttachmentDataSource = new MatTableDataSource(this.ASNAttachments);
    // this.docNumber = this.ofAttachmentData.DocNumber;
  }

  ngOnInit(): void {
    this.InvoiceAttachments = this.ASNAttachments.filter(x => x.Type === 'Invoice');
    this.DocumentCenterAttachments = this.ASNAttachments.filter(x => x.Type === 'DocumentCenter');
  }

  closeClicked(docNumber: string): void {
    this.matDialogRef.close(docNumber);
  }

  GetInvoiceAttachment(element: BPCASNAttachment): void {
    const fileName = element.AttachmentName;
    this.IsProgressBarVisibile = true;
    this._asnService.DowloandInvoiceAttachment(fileName, element.ASNNumber).subscribe(
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
  DowloandDocumentCenterAttachment(element: BPCASNAttachment): void {
    const fileName = element.AttachmentName;
    this.IsProgressBarVisibile = true;
    this._asnService.DowloandDocumentCenterAttachment(fileName, element.ASNNumber).subscribe(
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
  // attachmentClicked(attachment: BPCInvoiceAttachment, file?: File): void {
  //   if (file && file.size) {
  //     const blob = new Blob([file], { type: file.type });
  //     this.OpenAttachmentDialog(file.name, blob);
  //   } else {
  //     // console.log(attachment);
  //     this.DownloadOfAttachment(attachment.AttachmentName, attachment.ReferenceNo);
  //   }
  // }

  // DownloadOfAttachment(fileName: string, docNumber: string): void {
  //   this.IsProgressBarVisibile = true;
  //   this._dashboardService.DownloadOfAttachment(this.authenticationDetails.UserName, fileName, docNumber).subscribe(
  //     data => {
  //       if (data) {
  //         let fileType = 'image/jpg';
  //         fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
  //           fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
  //             fileName.toLowerCase().includes('.png') ? 'image/png' :
  //               fileName.toLowerCase().includes('.gif') ? 'image/gif' :
  //                 fileName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
  //         const blob = new Blob([data], { type: fileType });
  //         this.OpenAttachmentDialog(fileName, blob);
  //       }
  //       this.IsProgressBarVisibile = false;
  //     },
  //     error => {
  //       console.error(error);
  //       this.IsProgressBarVisibile = false;
  //     }
  //   );
  // }

  // UploadOfAttachment(): void {
  //   this.IsProgressBarVisibile = true;
  //   this._dashboardService.UploadOfAttachment(this.authenticationDetails.UserName, this.docNumber, this.currentUserID.toString(), this.invoiceAttachment).subscribe(
  //     (data) => {
  //       if (data) {
  //         const uploadedAttachment = data as BPCInvoiceAttachment;
  //         // Create support ticket
  //         this.getSupportTicket(this.docNumber);
  //         this.CreateSupportTicket(this.docNumber);
  //       }
  //       else {

  //       }
  //     },
  //     (err) => {
  //       this.IsProgressBarVisibile = false;
  //     });
  // }

  // GetInvoiceAttachment(fileName: string, file?: File): void {
  //   if (file && file.size) {
  //     const blob = new Blob([file], { type: file.type });
  //     this.OpenAttachmentDialog(fileName, blob);
  //   } else {
  //     this.IsProgressBarVisibile = true;
  //     this._dashboardService.DownloadOfAttachment(this.authenticationDetails.UserName, fileName, this.docNumber).subscribe(
  //       data => {
  //         if (data) {
  //           let fileType = 'image/jpg';
  //           fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
  //             fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
  //               fileName.toLowerCase().includes('.png') ? 'image/png' :
  //                 fileName.toLowerCase().includes('.gif') ? 'image/gif' :
  //                   fileName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
  //           const blob = new Blob([data], { type: fileType });
  //           this.OpenAttachmentDialog(fileName, blob);
  //         }
  //         this.IsProgressBarVisibile = false;
  //       },
  //       error => {
  //         console.error(error);
  //         this.IsProgressBarVisibile = false;
  //       }
  //     );
  //   }
  // }

  // CreateSupportTicket(docNumber: string): void {
  //   this.IsProgressBarVisibile = true;
  //   // console.log(this.supportTicketView);
  //   this._supportDeskService.CreateSupportTicket(this.supportTicketView).subscribe(
  //     (data) => {
  //       const support = (data as SupportHeader);
  //       if (support) {
  //         this.AddSupportAttachment(docNumber, support.SupportID);
  //       }
  //       else {
  //         this.notificationSnackBarComponent.openSnackBar(`Attachment uploaded successfully`, SnackBarStatus.success);
  //         this.resetControl();
  //         this.closeClicked(docNumber);
  //         // this._router.navigate(['/orderfulfilment/orderfulfilmentCenter']);
  //       }
  //       // this.GetOfAttachmentsByPartnerIDAndDocNumber(docNumber);
  //       this.IsProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       this.IsProgressBarVisibile = false;
  //       this.closeClicked(docNumber);
  //       this.resetControl();
  //       // this.GetOfAttachmentsByPartnerIDAndDocNumber(docNumber);
  //       // this._router.navigate(['/orderfulfilment/orderfulfilmentCenter']);
  //       this.notificationSnackBarComponent.openSnackBar(`Attachment uploaded successfully`, SnackBarStatus.success);
  //     }
  //   );
  // }

  // AddSupportAttachment(docNumber: string, supportID: string): void {
  //   this.invoiceAttachments.push(this.invoiceAttachment);
  //   this._supportDeskService.AddSupportAttachment(supportID, this.currentUserID.toString(), this.invoiceAttachments).subscribe(
  //     (dat) => {
  //       this.notificationSnackBarComponent.openSnackBar(`Attachment uploaded successfully`, SnackBarStatus.success);
  //       this.resetControl();
  //       this.closeClicked(docNumber);
  //       // this._router.navigate(['/orderfulfilment/orderfulfilmentCenter']);
  //       this.IsProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       this.resetControl();
  //       this.IsProgressBarVisibile = false;
  //     }
  //   );
  // }

  // GetOfAttachmentsByPartnerIDAndDocNumber(docNumber: string): void {
  //   this.IsProgressBarVisibile = true;
  //   this._dashboardService.GetOfAttachmentsByPartnerIDAndDocNumber(this.authenticationDetails.UserName, docNumber)
  //     .subscribe((data) => {
  //       if (data) {
  //         this.ofAttachments = data as BPCInvoiceAttachment[];
  //         this.AttachmentDataSource = new MatTableDataSource(this.ofAttachments);
  //       }
  //       this.IsProgressBarVisibile = false;
  //     },
  //       (err) => {
  //         console.error(err);
  //         this.IsProgressBarVisibile = false;
  //       });
  // }

  // GetSupportMasters(): void {
  //   this.IsProgressBarVisibile = true;
  //   this._supportDeskService
  //     .GetSupportMasters()
  //     .subscribe((data) => {
  //       if (data) {
  //         this.supportMasters = <SupportMaster[]>data;
  //       }
  //       this.IsProgressBarVisibile = false;
  //     },
  //       (err) => {
  //         console.error(err);
  //         this.IsProgressBarVisibile = false;
  //       });
  // }

  // GetUsers(): void {
  //   this.IsProgressBarVisibile = true;
  //   this._masterService.GetAllUsers().subscribe(
  //     (data) => {
  //       this.IsProgressBarVisibile = false;
  //       this.users = <UserWithRole[]>data;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.IsProgressBarVisibile = false;
  //     }
  //   );
  // }

  resetControl(): void {
    this.invoiceAttachment = null;
    this.invoiceAttachments = [];
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

  // addAttachmentClicked(evt): void {
  //   if (evt.target.files && evt.target.files.length > 0) {
  //     if (this.invoiceAttachment && this.invoiceAttachment.name) {
  //       this.openAttachmentReplaceConfirmation(evt);
  //     }
  //     else if (this.invAttach && this.invAttach.AttachmentName) {
  //       this.openAttachmentReplaceConfirmation(evt);
  //     } else {
  //       this.invoiceAttachment = evt.target.files[0];
  //       this.invAttach = new BPCInvoiceAttachment();
  //       const ofattach = new BPCInvoiceAttachment;
  //       ofattach.AttachmentName = this.invoiceAttachment.name;
  //       ofattach.ContentType = this.invoiceAttachment.type;
  //       ofattach.ContentLength = this.invoiceAttachment.size;
  //       this.ofAttachments.forEach(x => {
  //         if (!x.AttachmentID) {
  //           const index = this.ofAttachments.indexOf(x, 0);
  //           if (index > -1) {
  //             this.ofAttachments.splice(index, 1);
  //           }
  //         }
  //       });
  //       this.ofAttachments.push(ofattach);
  //       this.AttachmentDataSource = new MatTableDataSource(this.ofAttachments);
  //     }
  //   }
  // }

  // uploadAttachmentClicked(): void {
  //   if (this.invoiceAttachment) {
  //     this.UploadOfAttachment();
  //   }
  //   else {
  //     this.notificationSnackBarComponent.openSnackBar(`Add file to save`, SnackBarStatus.danger);
  //   }
  // }

  // openAttachmentReplaceConfirmation(evt): void {
  //   const dialogConfig: MatDialogConfig = {
  //     data: {
  //       Actiontype: 'Replace',
  //       Catagory: 'Attachment'
  //     },
  //     panelClass: 'confirmation-dialog'
  //   };
  //   const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
  //   dialogRef.afterClosed().subscribe(
  //     result => {
  //       if (result) {
  //         this.invoiceAttachment = evt.target.files[0];
  //         this.invAttach = new BPCInvoiceAttachment();
  //         const ofattach = new BPCInvoiceAttachment;
  //         ofattach.AttachmentName = this.invoiceAttachment.name;
  //         ofattach.ContentType = this.invoiceAttachment.type;
  //         ofattach.ContentLength = this.invoiceAttachment.size;
  //         this.ofAttachments.forEach(x => {
  //           if (!x.AttachmentID) {
  //             const index = this.ofAttachments.indexOf(x, 0);
  //             if (index > -1) {
  //               this.ofAttachments.splice(index, 1);
  //             }
  //           }
  //         });
  //         this.ofAttachments.push(ofattach);
  //         this.AttachmentDataSource = new MatTableDataSource(this.ofAttachments);
  //       }
  //     });
  // }

  // getSupportTicket(documentRefNo: string): void {
  //   this.supportTicketView.Client = this.ofAttachmentData.Client;
  //   this.supportTicketView.Company = this.ofAttachmentData.Company;
  //   this.supportTicketView.Type = this.ofAttachmentData.Type;
  //   this.supportTicketView.PatnerID = this.ofAttachmentData.PatnerID;
  //   this.supportTicketView.ReasonCode = "4592";
  //   this.supportTicketView.Remarks = "ABC Ticket is raised for the PO " + documentRefNo;
  //   this.supportTicketView.DocumentRefNo = documentRefNo;
  //   this.supportTicketView.PatnerID = this.authenticationDetails.UserName;
  //   // let supportMaster = new SupportMaster();
  //   // supportMaster = this.supportMasters.find(x => x.ReasonCode === this.supportTicketView.ReasonCode);
  //   // if (supportMaster) {
  //   //   this.getFilteredUsers(supportMaster);
  //   // }
  //   // this.supportTicketView.Users = this.filteredUsers;
  //   // // console.log(this.filteredUsers);
  // }

  // getFilteredUsers(supportMaster: SupportMaster): any {
  //   if (supportMaster.Person1 && supportMaster.Person1 != null) {
  //     let user = new UserWithRole();
  //     user = this.users.find(x => x.UserName.toLowerCase() === supportMaster.Person1.toLowerCase());
  //     this.filteredUsers.push(user);
  //   }
  //   else if (supportMaster.Person2 && supportMaster.Person2 != null) {
  //     let user = new UserWithRole();
  //     user = this.users.find(x => x.UserName.toLowerCase() === supportMaster.Person2.toLowerCase());
  //     this.filteredUsers.push(user);
  //   }
  //   else if (supportMaster.Person3 && supportMaster.Person3 != null) {
  //     let user = new UserWithRole();
  //     user = this.users.find(x => x.UserName.toLowerCase() === supportMaster.Person3.toLowerCase());
  //     this.filteredUsers.push(user);
  //   }
  // }

}
