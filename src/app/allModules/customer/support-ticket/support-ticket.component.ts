import { Component, OnInit } from '@angular/core';
import { AuthenticationDetails, UserWithRole, AppUsage } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SupportHeader, SupportHeaderView, SupportMaster } from 'app/models/support-desk';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SupportDeskService } from 'app/services/support-desk.service';
import { MasterService } from 'app/services/master.service';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { BPCFact } from 'app/models/fact';
import { FactService } from 'app/services/fact.service';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';
import { POService } from 'app/services/po.service';

@Component({
  selector: 'app-support-ticket',
  templateUrl: './support-ticket.component.html',
  styleUrls: ['./support-ticket.component.scss']
})
export class SupportTicketComponent implements OnInit {

  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  Users: UserWithRole[] = [];
  FilteredUsers: UserWithRole[] = [];
  SelectedBPCFact: BPCFact;
  PartnerID: string;
  fileToUpload: File;
  fileToUploadList: File[] = [];
  math = Math;
  IsProgressBarVisibile: boolean;
  SupportTicketFormGroup: FormGroup;
  SupportTicket: SupportHeader;
  SupportTicketView: SupportHeaderView;
  SupportMasters: SupportMaster[] = [];
  SupportHeader: SupportHeader;
  dateOfCreation: Date;
  docRefNo: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  reason: string;
  navigator_page: any;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    public _supportDeskService: SupportDeskService,
    private _masterService: MasterService,
    private _FactService: FactService,
    private _authService: AuthService,
    private _POService: POService
  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.authenticationDetails = new AuthenticationDetails();
    this.dateOfCreation = new Date();
    this.SupportTicketView = new SupportHeaderView();
    this.SupportTicket = new SupportHeader();
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
      // if (this.MenuItems.indexOf('SupportDesk') < 0) {
      //     this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //     );
      //     this._router.navigate(['/auth/login']);
      // }

    } else {
      this._router.navigate(['/auth/login']);
    }

    this._activatedRoute.queryParams.subscribe(params => {
      this.docRefNo = params['id'];
      this.reason = params['reason'];
      this.navigator_page = params["navigator_page"];
    });
    if (!this.docRefNo) {
      this.docRefNo = '';
    }

    this.InitializeSupportTicketFormGroup();
    this.GetSupportMasters();
    this.GetUsers();
    this.GetPlantBasedOnCondition();
    this.GetFactByPartnerID();
  }
  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'Support ticket';
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
  InitializeSupportTicketFormGroup(): void {
    this.SupportTicketFormGroup = this._formBuilder.group({
      ReasonCode: ['', Validators.required],
      AppID: [''],
      Plant: [''],
      DocumentRefNo: [this.docRefNo, Validators.required],
      Remarks: ['', Validators.required]
    });
  }

  ClearSupportTicketForm(): void {
    this.SupportTicketFormGroup.reset();
    Object.keys(this.SupportTicketFormGroup.controls).forEach(key => {
      this.SupportTicketFormGroup.get(key).markAsUntouched();
    });
  }

  ResetControl(): void {
    this.fileToUpload = null;
    this.fileToUploadList = [];
    this.SupportTicket = null;
    this.SupportTicketView = null;
    this.ClearSupportTicketForm();
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
  GetSupportMasters(): void {
    this.IsProgressBarVisibile = true;
    this._supportDeskService
      .GetSupportMasters()
      .subscribe((data) => {
        if (data) {
          this.SupportMasters = <SupportMaster[]>data;
        }
        this.IsProgressBarVisibile = false;
      },
        (err) => {
          console.error(err);
          this.IsProgressBarVisibile = false;
        });
  }
  GetPlantBasedOnCondition(): void {
    if (this.navigator_page) {
      if (this.navigator_page === 'PO') {
        this.GetPlantByDocNmber(this.docRefNo);
      }
      else if (this.navigator_page === 'ASN') {
        this.GetPlantByASNNmber(this.docRefNo);
      }
      else if (this.navigator_page === 'Payment') {

      } else {
        this.SupportTicketFormGroup.get('Plant').patchValue('1000');
      }
    } else {
      this.SupportTicketFormGroup.get('Plant').patchValue('1000');
    }
  }
  GetPlantByDocNmber(docRefNo): void {
    this._POService.GetPlantByDocNmber(docRefNo, this.currentUserName).subscribe(
      (data) => {
        const plant = data as string;
        if (plant) {
          this.SupportTicketFormGroup.get('Plant').patchValue(plant);
        } else {
          this.SupportTicketFormGroup.get('Plant').patchValue('1000');
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }
  GetPlantByASNNmber(docRefNo): void {
    this._POService.GetPlantByASNNmber(docRefNo, this.currentUserName).subscribe(
      (data) => {
        const plant = data as string;
        if (plant) {
          this.SupportTicketFormGroup.get('Plant').patchValue(plant);
        } else {
          this.SupportTicketFormGroup.get('Plant').patchValue('1000');
        }
      },
      (err) => {
        console.error(err);
      }
    );
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
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  SaveClicked(): void {
    if (this.SupportTicketFormGroup.valid) {
      this.GetSupportTicket();
      this.OpenNotificationDialog();
    }
    else {
      this.ShowValidationErrors(this.SupportTicketFormGroup);
    }
  }
  ShowValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        console.log(key);
      }
      formGroup.get(key).markAsTouched();
      formGroup.get(key).markAsDirty();
    });

  }
  OnFileClicked(evt): void {
    if (evt.target.files && evt.target.files.length > 0) {
      this.fileToUpload = evt.target.files[0];
      this.fileToUploadList.push(this.fileToUpload);
      console.log(this.fileToUploadList);
    }
  }

  GetSupportTicket(): void {
    if (this.SelectedBPCFact) {
      this.SupportTicket.Client = this.SupportTicketView.Client = this.SelectedBPCFact.Client;
      this.SupportTicket.Company = this.SupportTicketView.Company = this.SelectedBPCFact.Company;
      this.SupportTicket.Type = this.SupportTicketView.Type = this.SelectedBPCFact.Type;
    }
    this.SupportTicket.PatnerID = this.SupportTicketView.PatnerID = this.currentUserName;
    this.SupportTicket.ReasonCode = this.SupportTicketView.ReasonCode = this.SupportTicketFormGroup.get('ReasonCode').value;
    this.SupportTicket.Remarks = this.SupportTicketView.Remarks = this.SupportTicketFormGroup.get('Remarks').value;
    this.SupportTicket.DocumentRefNo = this.SupportTicketView.DocumentRefNo = this.SupportTicketFormGroup.get('DocumentRefNo').value;
    this.SupportTicket.ReasonCode = this.SupportTicketView.ReasonCode = this.SupportTicketFormGroup.get('ReasonCode').value;
    this.SupportTicket.Plant = this.SupportTicketView.Plant = this.SupportTicketFormGroup.get('Plant').value;
    this.SupportTicket.AppID = this.SupportTicketView.AppID = this.SupportTicketFormGroup.get('AppID').value;
    this.SupportTicket.CreatedBy = this.SupportTicketView.CreatedBy = this.currentUserName;
    // this.SupportTicket.PatnerID = this.SupportTicketView.PatnerID = this.PartnerID;
    // this.SupportTicket.Type = this.SupportTicketView.Type = 'Customer';
    // let supportMaster = new SupportMaster();
    // supportMaster = this.SupportMasters.find(x => x.ReasonCode === this.SupportTicket.ReasonCode);
    // if (supportMaster) {
    //   this.GetFilteredUsers(supportMaster);
    // }
    // console.log(this.FilteredUsers);
    // this.SupportTicketView.Users = this.FilteredUsers;
  }

  // GetFilteredUsers(supportMaster: SupportMaster): any {
  //   if (supportMaster.Person1 && supportMaster.Person1 != null) {
  //     let user = new UserWithRole();
  //     user = this.Users.find(x => x.UserName.toLowerCase() === supportMaster.Person1.toLowerCase());
  //     this.FilteredUsers.push(user);
  //   }
  //   else if (supportMaster.Person2 && supportMaster.Person2 != null) {
  //     let user = new UserWithRole();
  //     user = this.Users.find(x => x.UserName.toLowerCase() === supportMaster.Person2.toLowerCase());
  //     this.FilteredUsers.push(user);
  //   }
  //   else if (supportMaster.Person3 && supportMaster.Person3 != null) {
  //     let user = new UserWithRole();
  //     user = this.Users.find(x => x.UserName.toLowerCase() === supportMaster.Person3.toLowerCase());
  //     this.FilteredUsers.push(user);
  //   }
  // }

  CreateSupportTicket(): void {
    this.IsProgressBarVisibile = true;
    this._supportDeskService.CreateSupportTicket(this.SupportTicketView).subscribe(
      (data) => {
        this.SupportHeader = (data as SupportHeader);
        if (this.fileToUploadList && this.fileToUploadList.length) {
          this.AddSupportAttachment();
        } else {
          this.ResetControl();
          this.notificationSnackBarComponent.openSnackBar(`Ticket Created successfully`, SnackBarStatus.success);
          this.IsProgressBarVisibile = false;
          this._router.navigate(['/customer/supportdesk']);
        }
      },
      (err) => {
        this.ShowErrorNotificationSnackBar(err);
      }
    );
  }

  AddSupportAttachment(): void {
    this._supportDeskService.AddSupportAttachment(this.SupportHeader.SupportID, this.currentUserID.toString(), this.fileToUploadList).subscribe(
      (dat) => {
        this.notificationSnackBarComponent.openSnackBar('Ticket Created successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.ResetControl();
        this._router.navigate(['/customer/supportdesk']);
      },
      (err) => {
        this.ShowErrorNotificationSnackBar(err);
      }
    );
  }

  OpenNotificationDialog(): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: 'Create',
        Catagory: 'Ticket'
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          this.CreateSupportTicket();
        }
      });
  }

  ShowErrorNotificationSnackBar(err: any): void {
    console.error(err);
    this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    this.IsProgressBarVisibile = false;
  }

  GetSupportAttachment(fileName: string, file?: File): void {
    if (file && file.size) {
      const blob = new Blob([file], { type: file.type });
      this.OpenAttachmentDialog(fileName, blob);
    }
    else {
      this.IsProgressBarVisibile = true;
      this._supportDeskService.DownloadSupportAttachment(fileName, this.SupportHeader.SupportID).subscribe(
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


}
