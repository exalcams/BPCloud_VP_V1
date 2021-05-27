import { Component, OnInit } from '@angular/core';
import { AuthenticationDetails, UserWithRole } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { SupportDetails, SupportHeader, SupportLog, BPCSupportAttachment } from 'app/models/support-desk';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { SupportDeskService } from 'app/services/support-desk.service';
import { MasterService } from 'app/services/master.service';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { BPCFact } from 'app/models/fact';
import { FactService } from 'app/services/fact.service';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'cust-support-chat',
  templateUrl: './support-chat.component.html',
  styleUrls: ['./support-chat.component.scss']
})
export class SupportChatComponent implements OnInit {

  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  Users: UserWithRole[] = [];
  PartnerID: string;
  SelectedBPCFact: BPCFact;
  SupportID: string;
  SupportDetails: SupportDetails = new SupportDetails();
  SupportHeader: SupportHeader = new SupportHeader();
  SupportLogs: SupportLog[] = [];
  SelectedSupportLog: SupportLog;
  SelectedSupportLogView: SupportLog;
  SupportAttachments: BPCSupportAttachment[] = [];
  SupportLogAttachments: BPCSupportAttachment[] = [];
  IsProgressBarVisibile: boolean;
  fileToUpload: File;
  fileToUploadList: File[] = [];
  dialog: any;
  SupportLogFormGroup: FormGroup;
  Status: string;
  TicketResolved: boolean;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  SecretKey: string;
    SecureStorage: SecureLS;
  constructor(
    private route: ActivatedRoute,
    public _supportDeskService: SupportDeskService,
    private _masterService: MasterService,
    private _FactService: FactService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.TicketResolved = false;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.SelectedSupportLog = new SupportLog();
    this.SelectedSupportLogView = new SupportLog();
  }

  ngOnInit(): void {
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
      this.SupportID = params['SupportID'];
    });
    this.GetUsers();
    this.GetFactByPartnerID();
    this.GetSupportDetailsByPartnerAndSupportIDAndType();
    this.InitializeSupportLogFormGroup();
  }

  InitializeSupportLogFormGroup(): void {
    this.SupportLogFormGroup = this._formBuilder.group({
      Comments: ['', Validators.required],
    });
  }

  ClearSupportLogForm(): void {
    this.SupportLogFormGroup.reset();
    Object.keys(this.SupportLogFormGroup.controls).forEach(key => {
      this.SupportLogFormGroup.get(key).markAsUntouched();
    });
  }

  ResetControl(): void {
    this.fileToUpload = null;
    this.fileToUploadList = [];
    this.ClearSupportLogForm();
    this.SelectedSupportLog = new SupportLog();
    this.SelectedSupportLogView = new SupportLog();
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
  GetSupportDetailsByPartnerAndSupportIDAndType(): void {
    this.IsProgressBarVisibile = true;
    this._supportDeskService.GetSupportDetailsByPartnerAndSupportIDAndType(this.SupportID, this.PartnerID, 'C').subscribe(
      data => {
        if (data) {
          this.SupportDetails = data as SupportDetails;
          this.SupportHeader = this.SupportDetails.supportHeader;
          this.Status = this.SupportHeader.Status;
          this.SupportLogs = this.SupportDetails.supportLogs;
          this.SupportAttachments = this.SupportDetails.supportAttachments;
          this.SupportLogAttachments = this.SupportDetails.supportLogAttachments;
          this.IsProgressBarVisibile = false;
        }
      },
      err => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  GetSupportLogsByPartnerAndSupportID(): void {
    // this.IsProgressBarVisibile = true;
    this._supportDeskService
      .GetSupportLogsByPartnerAndSupportID(this.SupportID, this.PartnerID)
      .subscribe((data) => {
        if (data) {
          this.SupportLogs = <SupportLog[]>data;
        }
        this.IsProgressBarVisibile = false;
      },
        (err) => {
          console.error(err);
          this.IsProgressBarVisibile = false;
        });
  }

  GetSupportAttachment(fileName: string, file?: File): void {
    if (file && file.size) {
      const blob = new Blob([file], { type: file.type });
      this.OpenAttachmentDialog(fileName, blob);
    }
    else {
      this.IsProgressBarVisibile = true;
      this._supportDeskService.DownloadSupportAttachment(fileName, this.SupportID).subscribe(
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

  GetUsers(): void {
    this.IsProgressBarVisibile = true;
    this._masterService.GetAllUsers().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.Users = <UserWithRole[]>data;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  SendResponseClicked(): void {
    if (this.SupportLogFormGroup.valid) {
      const Actiontype = 'Reply';
      const Catagory = 'Support Ticket';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    } else {
      this.ShowFormValidationErrors(this.SupportLogFormGroup);
    }
  }

  MarkAsResolvedClicked(): void {
    if (this.SupportLogFormGroup.valid) {
      const Actiontype = 'Mark As Resolved';
      const Catagory = 'Support Ticket';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    } else {
      this.ShowFormValidationErrors(this.SupportLogFormGroup);
    }
  }

  AddCommentClicked(): void {
    const supportLog = new SupportLog();
    supportLog.PatnerID = this.PartnerID;
    // supportLog.Status = "Open";
    supportLog.IsResolved = false;
    supportLog.CreatedOn = new Date();
    this.SupportLogs.push(supportLog);
  }

  OnFileClicked(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.fileToUpload = evt.target.files[0];
      this.fileToUploadList.push(this.fileToUpload);
      console.log(this.fileToUploadList);
    }
  }

  GetSupportLogValues(): void {
    if (this.SelectedBPCFact) {
      this.SelectedSupportLog.Client = this.SelectedSupportLogView.Client = this.SelectedBPCFact.Client;
      this.SelectedSupportLog.Company = this.SelectedSupportLogView.Company = this.SelectedBPCFact.Company;
      this.SelectedSupportLog.Type = this.SelectedSupportLogView.Type = this.SelectedBPCFact.Type;
      this.SelectedSupportLog.PatnerID = this.SelectedSupportLogView.PatnerID = this.SelectedBPCFact.PatnerID;
    }
    this.SelectedSupportLog.SupportID = this.SelectedSupportLogView.SupportID = this.SupportID;
    this.SelectedSupportLog.PatnerID = this.SelectedSupportLogView.PatnerID = this.PartnerID;
    this.SelectedSupportLog.Remarks = this.SelectedSupportLogView.Remarks = this.SupportLogFormGroup.get('Comments').value;
    this.SelectedSupportLog.CreatedBy = this.SelectedSupportLogView.CreatedBy = this.authenticationDetails.UserName;
    let user = new UserWithRole();
    user = this.Users.find(x => x.UserName.toLowerCase() === this.SupportHeader.PatnerID.toLowerCase());
    // this.SelectedSupportLog.PatnerEmail = this.SelectedSupportLogView.PatnerEmail = user.Email;
  }

  CreateSupportLog(): void {
    this.IsProgressBarVisibile = true;
    this.GetSupportLogValues();
    this._supportDeskService.CreateSupportLog(this.SelectedSupportLogView).subscribe(
      (data) => {
        this.SelectedSupportLog = (data as SupportLog);
        if (this.fileToUploadList && this.fileToUploadList.length) {
          this.AddSupportLogAttachment();
        } else {
          this.ResetControl();
          this.notificationSnackBarComponent.openSnackBar(`Support Log created successfully`, SnackBarStatus.success);
          this.IsProgressBarVisibile = false;
          this.GetSupportDetailsByPartnerAndSupportIDAndType();
        }
      },
      (err) => {
        this.ShowErrorNotificationSnackBar(err);
      }
    );
  }

  UpdateSupportLog(): void {
    this.IsProgressBarVisibile = true;
    this.GetSupportLogValues();
    this._supportDeskService.UpdateSupportLog(this.SelectedSupportLogView).subscribe(
      (data) => {
        this.SelectedSupportLog = (data as SupportLog);
        if (this.fileToUploadList && this.fileToUploadList.length) {
          this.AddSupportLogAttachment();
        } else {
          this.ResetControl();
          this.notificationSnackBarComponent.openSnackBar(`Support Log updated successfully`, SnackBarStatus.success);
          this.IsProgressBarVisibile = false;
          this.GetSupportDetailsByPartnerAndSupportIDAndType();
        }
      },
      (err) => {
        this.ShowErrorNotificationSnackBar(err);
      }
    );
  }

  AddSupportLogAttachment(): void {
    this._supportDeskService.AddSupportLogAttachment(this.SupportHeader.SupportID.toString(), this.SelectedSupportLog.SupportLogID.toString(),
      this.currentUserID.toString(), this.fileToUploadList).subscribe(
        (dat) => {
          this.notificationSnackBarComponent.openSnackBar('Support Log created successfully', SnackBarStatus.success);
          this.IsProgressBarVisibile = false;
          this.ResetControl();
          this.GetSupportDetailsByPartnerAndSupportIDAndType();
        },
        (err) => {
          this.ShowErrorNotificationSnackBar(err);
        }
      );
  }

  OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: Catagory
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this._dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Actiontype === 'Reply') {
            this.CreateSupportLog();
          }
          else if (Actiontype === 'Mark As Resolved') {
            this.UpdateSupportLog();
          }
        }
      });
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
    const dialogRef = this._dialog.open(AttachmentDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }

  ShowFormValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        console.log(key);
      }
      formGroup.get(key).markAsTouched();
      formGroup.get(key).markAsDirty();
    });
  }

  ShowErrorNotificationSnackBar(err: any): void {
    console.error(err);
    this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    this.IsProgressBarVisibile = false;
  }

  getStatusColor(StatusFor: string): string {
    // alert(this.Status);
    switch (StatusFor) {
      case 'Pending':
        return this.Status === 'Open' ? 'gray' : this.Status === 'Pending' ? '#efb577' : '#34ad65';
      case 'Closed':
        return this.Status === 'Open' ? 'gray' : this.Status === 'Pending' ? 'gray' : this.Status === 'Closed' ? '#34ad65' : this.Status === 'Pending' ? '#efb577' : '#34ad65';
      default:
        return '';
    }
  }

  getTimeline(StatusFor: string): string {
    switch (StatusFor) {
      case 'Pending':
        return this.Status === 'Open' ? 'white-timeline' : this.Status === 'Pending' ? 'orange-timeline' : 'green-timeline';
      case 'Closed':
        return this.Status === 'Open' ? 'white-timeline' : this.Status === 'Pending' ? 'white-timeline' : this.Status === 'Closed' ? 'orange-timeline' : 'green-timeline';
      default:
        return '';
    }
  }

  getRestTimeline(StatusFor: string): string {
    switch (StatusFor) {
      case 'Pending':
        return this.Status === 'Open' ? 'white-timeline' : this.Status === 'Pending' ? 'white-timeline' : 'green-timeline';
      case 'Closed':
        return this.Status === 'Open' ? 'white-timeline' : this.Status === 'Pending' ? 'white-timeline' : this.Status === 'Closed' ? 'white-timeline' : 'green-timeline';
      default:
        return '';
    }
  }

}
