import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { BPCAttach, BPCAttachments, BPCFact } from 'app/models/fact';
import { AuthenticationDetails } from 'app/models/master';
import { SupportHeaderView, SupportLog } from 'app/models/support-desk';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { FactService } from 'app/services/fact.service';
import { SupportDeskService } from 'app/services/support-desk.service';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-declaration',
  templateUrl: './declaration.component.html',
  styleUrls: ['./declaration.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class DeclarationComponent implements OnInit {
  BGClassName: any;
  fuseConfig: any;
  fileToUpload: File;
  uploadfile_name: any;
  size_KB: string;
  upload_msme_bool: boolean;
  uploadfile_RelatedParty: any;
  size_KB_RelatedParty: string;
  upload_RealtedParty_bool: boolean;
  uploadfile_TDS: any;
  size_KB_TDS: string;
  upload_TDS_bool: boolean;
  authenticationDetails: AuthenticationDetails;
  CurrentUserID: Guid;
  currentUserName: string;
  CurrentUserRole = '';
  MenuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;

  SelectedBPCFact: BPCFact;
  SupportDeclarationFormGroup: FormGroup;
  SelectedSupportLog: SupportLog;
  SelectedSupportLogView: SupportLog;
  SelectedBPCFactView: BPCFact;
  AllAttachment: BPCAttachments[] = [];
  Attachments: BPCAttachments[] = [];
  IsDeclaration = ["Yes", "No"];
  AllAttachment_RelatedParty: BPCAttachments;
  AllAttachment_LowerTDS: BPCAttachments;
  bool: boolean;
  bool_msme: boolean;
  bool_RP: boolean;
  bool_TDSRate: boolean;
  base64: string | ArrayBuffer;
  result_action: any;
  Attch: BPCAttach;
  array_BPCAttach: any = [];
  get_value: boolean;
  IsProgressBarVisibile: boolean;
  BASE64_MARKER = ';base64,';
  LowerTDS = "";
  // pattern= "^[0-9]$";
  constructor(private _fuseConfigService: FuseConfigService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _FactService: FactService,
    private _formBuilder: FormBuilder,
    private __supportDeskService: SupportDeskService,
    private dialog: MatDialog) {
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.SelectedBPCFact = new BPCFact();
    this.SelectedBPCFactView = new BPCFact();
    // this.AllAttachment = new BPCAttachments();
    this.AllAttachment_RelatedParty = new BPCAttachments();
    this.AllAttachment_LowerTDS = new BPCAttachments();


  }

  ngOnInit(): void {

    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.CurrentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.MenuItems.indexOf('Declaration') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
      this.SetUserPreference();
      this.GetFactByPartnerID();
      this.InitializeSupportDeclarationFormGroup();
      // this.GetSupportValues();

    }
    else {
      this._router.navigate(['/auth/login']);
    }

    // if (this.size_KB == "") {
    //   this.upload_msme_bool = false
    // }
  }
  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }
  RecurringChanged(event) {
    console.log(event);
  }
  convertDataURIToBinary(dataURI): Uint8Array {
    const base64Index = dataURI.indexOf(this.BASE64_MARKER) + this.BASE64_MARKER.length;
    const base64 = dataURI.substring(base64Index);
    const raw = window.atob(base64);
    const rawLength = raw.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));

    for (let i = 0; i < rawLength; i++) {
      array[i] = raw.charCodeAt(i);
    }
    return array;
  }
  handleFileInput(eve: any): void {

    if (eve.srcElement.id === 'file_msme') {

      const file = eve.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {

        this.base64 = reader.result;
        this.uploadfile_name = eve.target.files[0].name;
        const size = eve.target.files[0].size;
        this.size_KB = Math.round(size / 1024) + " KB";
        this.upload_msme_bool = true;
        const Attachmnt = new BPCAttachments();

        Attachmnt.AttachmentID = 0;
        var index = this.AllAttachment.findIndex(x => x.Category == "MSME");
        if (index >= 0) {
          this.AllAttachment.splice(index, 1);
        }
        if (this.SelectedBPCFact.MSME_Att_ID != null && this.SelectedBPCFact.MSME_Att_ID != "") {
          Attachmnt.AttachmentID = parseInt(this.SelectedBPCFact.MSME_Att_ID);
        }
        Attachmnt.Type = this.SelectedBPCFactView.Type;
        Attachmnt.Company = this.SelectedBPCFactView.Company;
        Attachmnt.PatnerID = this.SelectedBPCFactView.PatnerID;
        Attachmnt.AttachmentName = eve.target.files[0].name;
        Attachmnt.ContentType = eve.target.files[0].type;
        Attachmnt.ContentLength = size;
        Attachmnt.AttachmentFile = eve.target.files[0];
        Attachmnt.Category = "MSME";
        Attachmnt.Client = this.SelectedBPCFactView.Client;

        this.AllAttachment.push(Attachmnt);
      };
    }
    if (eve.srcElement.id === 'file_relatedparty') {
      const file = eve.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        this.base64 = reader.result;
        this.uploadfile_RelatedParty = eve.target.files[0].name;
        const size = eve.target.files[0].size;
        this.size_KB_RelatedParty = Math.round(size / 1024) + " KB";
        this.upload_RealtedParty_bool = true;
        const Attachmnt = new BPCAttachments();
        Attachmnt.Client = this.SelectedBPCFactView.Client;
        var index = this.AllAttachment.findIndex(x => x.Category == "RP");
        if (index >= 0) {
          this.AllAttachment.splice(index, 1);
        }
        Attachmnt.AttachmentID = 0;
        if (this.SelectedBPCFact.RP_Att_ID != null && this.SelectedBPCFact.RP_Att_ID != "") {
          Attachmnt.AttachmentID = parseInt(this.SelectedBPCFact.RP_Att_ID);
        }
        Attachmnt.Type = this.SelectedBPCFactView.Type;
        Attachmnt.Company = this.SelectedBPCFactView.Company;
        Attachmnt.PatnerID = this.SelectedBPCFactView.PatnerID;
        Attachmnt.AttachmentName = eve.target.files[0].name;
        Attachmnt.ContentType = eve.target.files[0].type;
        Attachmnt.ContentLength = size;
        Attachmnt.AttachmentFile = eve.target.files[0];
        Attachmnt.Category = "RP";
        this.AllAttachment.push(Attachmnt);
      };

    }
    if (eve.srcElement.id === 'file_TDS') {
      const file = eve.target.files[0];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {

        this.base64 = reader.result;
      };
      this.uploadfile_TDS = eve.target.files[0].name;
      const size = eve.target.files[0].size;
      this.size_KB_TDS = Math.round(size / 1024) + " KB";
      this.upload_TDS_bool = true;

      const Attachmnt = new BPCAttachments();
      var index = this.AllAttachment.findIndex(x => x.Category == "TDS");
      if (index >= 0) {
        this.AllAttachment.splice(index, 1);
      }
      Attachmnt.Client = this.SelectedBPCFactView.Client;
      Attachmnt.AttachmentID = 0;
      if (this.SelectedBPCFact.TDS_Att_ID != null && this.SelectedBPCFact.TDS_Att_ID != "") {
        Attachmnt.AttachmentID = parseInt(this.SelectedBPCFact.TDS_Att_ID);
      }
      Attachmnt.Type = this.SelectedBPCFactView.Type;
      Attachmnt.Company = this.SelectedBPCFactView.Company;
      Attachmnt.PatnerID = this.SelectedBPCFactView.PatnerID;
      Attachmnt.AttachmentName = eve.target.files[0].name;
      Attachmnt.ContentType = eve.target.files[0].type;
      Attachmnt.ContentLength = size;
      Attachmnt.AttachmentFile = eve.target.files[0];
      Attachmnt.Category = "TDS";
      this.AllAttachment.push(Attachmnt);
    }
    console.log('AllAttachment', this.AllAttachment);
  }
  InitializeSupportDeclarationFormGroup(): void {
    this.SupportDeclarationFormGroup = this._formBuilder.group({
      MSMEType: ['', Validators.required],
      RelatedPartyName: ['', Validators.required],
      RelatedPartyType: ['', Validators.required],
      TDS_Cert_No: ['', Validators.required],
      TDSRate: ['', [Validators.required, Validators.pattern('^([1-9]([0-9])([0-9])?|0)(\.[0-9]{1,2})?$')]],
      IsMSME: [''],
      IsRP: [''],
      IsLDS: ['']



    });
  }

  GetFactByPartnerID(): void {
    this.IsProgressBarVisibile = true;

    this._FactService.GetFactByPartnerID(this.currentUserName).subscribe(
      (data) => {
        this.SelectedBPCFact = data as BPCFact;
        console.log("selected", this.SelectedBPCFact);
        this.GetSupportValues();

        this.array_BPCAttach.push(this.SelectedBPCFact.MSME_Att_ID, this.SelectedBPCFact.RP_Att_ID, this.SelectedBPCFact.TDS_Att_ID);
        this.get_value = true;
        if (this.get_value === true) {
          for (let i = 0; i < this.array_BPCAttach.length; i++) {
            if (this.array_BPCAttach[i] != null && this.array_BPCAttach[i] != "")
              this.GettAttchmentByAttId(this.array_BPCAttach[i], i);
          }
        }
        this.IsProgressBarVisibile = false;

      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  GettAttchmentByAttId(array_BPCAttach: any, i): void {
    this.IsProgressBarVisibile=true;
    this.get_value = false;

    this._FactService.GettAttchmentByAttId(array_BPCAttach).subscribe(
      (data) => {
        var attachments = data as BPCAttachments;
        this.Attachments.push(attachments);
        this.IsProgressBarVisibile = true;

        if (i === 0) {
          this.uploadfile_name = data.AttachmentName;
          this.size_KB = data.ContentLength;
          this.upload_msme_bool = true;

          if (this.size_KB) {
            this.get_value = true;
          }

        }
        if (i === 1) {

          this.uploadfile_RelatedParty = data.AttachmentName;
          this.size_KB_RelatedParty = data.ContentLength;
          this.upload_RealtedParty_bool = true;

          if (this.size_KB_RelatedParty) {
            this.get_value = true;
          }

        }
        if (i === 2) {
          this.uploadfile_TDS = data.AttachmentName;
          this.size_KB_TDS = data.ContentLength;
          this.upload_TDS_bool = true;

          if (this.size_KB_TDS) {
            this.get_value = true;
          }
        }
        this.IsProgressBarVisibile = false;

      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile=false;

      }
    );

  }
  async ViewAttachment(FileName: string) {
    var file = this.Attachments.find(x => x.AttachmentName == FileName);
    if (file) {
      const base64Response = await fetch(`data:${file.ContentType};base64,${file.AttachmentFile}`);
      const blobs = await base64Response.blob();
      let fileType = 'image/jpg';
      fileType = FileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
        FileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
          FileName.toLowerCase().includes('.png') ? 'image/png' :
            FileName.toLowerCase().includes('.pdf') ? 'application/pdf' :
              FileName.toLowerCase().includes('.gif') ? 'image/gif' : '';
      const blob = new Blob([blobs], { type: fileType });
      this.OpenAttachmentDialog(FileName, blob);
    }
    var UploadedFile=this.AllAttachment.find(x=>x.AttachmentName == FileName);
    if(UploadedFile){
      let fileType = 'image/jpg';
      fileType = FileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
        FileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
          FileName.toLowerCase().includes('.png') ? 'image/png' :
            FileName.toLowerCase().includes('.pdf') ? 'application/pdf' :
              FileName.toLowerCase().includes('.gif') ? 'image/gif' : '';
      const blob = new Blob([UploadedFile.AttachmentFile], { type: fileType });
      this.OpenAttachmentDialog(FileName, blob);
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
  GetSupportValues(): void {
    if (this.SelectedBPCFact) {
      console.log("Initial Load", this.SelectedBPCFact);
      this.SupportDeclarationFormGroup.get('MSMEType').patchValue(this.SelectedBPCFact.MSME_TYPE);
      this.SupportDeclarationFormGroup.get('RelatedPartyName').patchValue(this.SelectedBPCFact.RP_Name);
      this.SupportDeclarationFormGroup.get('RelatedPartyType').patchValue(this.SelectedBPCFact.RP_Type);
      this.SupportDeclarationFormGroup.get('TDS_Cert_No').patchValue(this.SelectedBPCFact.TDS_Cert_No);

      this.SupportDeclarationFormGroup.get('TDSRate').patchValue(this.SelectedBPCFact.TDS_RATE);
      this.SelectedBPCFactView.MSME_Att_ID = this.SelectedBPCFact.MSME_Att_ID;
      this.SelectedBPCFactView.RP_Att_ID = this.SelectedBPCFact.RP_Att_ID;
      this.SelectedBPCFactView.TDS_Att_ID = this.SelectedBPCFact.TDS_Att_ID;
      // this.TDS_ID=
      if (this.SelectedBPCFact.MSME) {
        this.SupportDeclarationFormGroup.get('IsMSME').patchValue("Yes");
      }
      else {
        this.SupportDeclarationFormGroup.get('IsMSME').patchValue("No");
      }

      if (this.SelectedBPCFact.RP) {
        this.SupportDeclarationFormGroup.get('IsRP').patchValue("Yes");
      }
      else {
        this.SupportDeclarationFormGroup.get('IsRP').patchValue("No");
      }

      if (this.SelectedBPCFact.Reduced_TDS) {
        this.SupportDeclarationFormGroup.get('IsLDS').patchValue("Yes");
      }
      else {
        this.SupportDeclarationFormGroup.get('IsLDS').patchValue("No");
      }
      this.bool_msme = this.SelectedBPCFact.MSME;
      this.bool_RP = this.SelectedBPCFact.RP;
      this.bool_TDSRate = this.SelectedBPCFact.Reduced_TDS;
      this.SelectedBPCFactView.Client = this.SelectedBPCFact.Client;
      this.SelectedBPCFactView.Type = this.SelectedBPCFact.Type;
      this.SelectedBPCFactView.Company = this.SelectedBPCFact.Company;
      this.SelectedBPCFactView.PatnerID = this.SelectedBPCFact.PatnerID;
    }
  }
  setValue(event, Name): void {
    if (Name === "MSME") {
      if (event.value == "Yes") {
        this.bool_msme = true;
      }
      else {
        this.bool_msme = false;
      }
    }
    else if (Name === "RP") {
      if (event.value == "Yes") {
        this.bool_RP = true;
      }
      else {
        this.bool_RP = false;
      }
    }
    else if (Name === "LDS") {
      if (event.value == "Yes") {
        this.bool_TDSRate = true;
      }
      else {
        this.bool_TDSRate = false;
      }
    }
  }
  GetAllVlaues(): void {
    this.SelectedBPCFact.MSME_TYPE = this.SelectedBPCFactView.MSME_TYPE = this.SupportDeclarationFormGroup.get('MSMEType').value;
    this.SelectedBPCFact.RP_Name = this.SelectedBPCFactView.RP_Name = this.SupportDeclarationFormGroup.get('RelatedPartyName').value;
    this.SelectedBPCFact.RP_Type = this.SelectedBPCFactView.RP_Type = this.SupportDeclarationFormGroup.get('RelatedPartyType').value;
    this.SelectedBPCFact.TDS_Cert_No = this.SelectedBPCFactView.TDS_Cert_No = this.SupportDeclarationFormGroup.get('TDS_Cert_No').value;
    this.SelectedBPCFact.TDS_RATE = this.SelectedBPCFactView.TDS_RATE = this.SupportDeclarationFormGroup.get('TDSRate').value;
  
    this.SelectedBPCFact.MSME = this.SelectedBPCFactView.MSME = this.bool_msme;
    this.SelectedBPCFact.RP = this.SelectedBPCFactView.RP = this.bool_RP;
    this.SelectedBPCFact.Reduced_TDS = this.SelectedBPCFactView.Reduced_TDS = this.bool_TDSRate;
    this.SelectedBPCFact.Client = this.SelectedBPCFactView.Client = this.SelectedBPCFact.Client;
    this.SelectedBPCFact.Type = this.SelectedBPCFactView.Type = this.SelectedBPCFact.Type;
    this.SelectedBPCFact.Company = this.SelectedBPCFactView.Company = this.SelectedBPCFact.Company;
    this.SelectedBPCFact.PatnerID = this.SelectedBPCFactView.PatnerID = this.SelectedBPCFact.PatnerID;
  }
  submitclicked(): void {

    const Actiontype = 'Update';
    const Catagory = 'Declaration';
    if (this.SupportDeclarationFormGroup.valid) {
      this.OpenConfirmationDialog(Actiontype, Catagory);
    }
  }
  AddAttachment(): void {
    this.GetAllVlaues();
    this.IsProgressBarVisibile = true;
    // console.log("SelectedBPCFactView", this.SelectedBPCFactView);
    if (this.AllAttachment.length !== 0) {
      this._FactService.UpdateAttachment(this.AllAttachment).subscribe(
        (data) => {
          var attachs = data as BPCAttach[];
          if (data != null) {
            attachs.forEach(element => {
              if (element.Catogery === "MSME") {
                this.SelectedBPCFact.MSME_Att_ID = this.SelectedBPCFactView.MSME_Att_ID = element.AttachmentID.toString();
              }
              if (element.Catogery === "RP") {
                this.SelectedBPCFact.RP_Att_ID = this.SelectedBPCFactView.RP_Att_ID = element.AttachmentID.toString();
              }
              if (element.Catogery === "TDS") {
                this.SelectedBPCFact.TDS_Att_ID = this.SelectedBPCFactView.TDS_Att_ID = element.AttachmentID.toString();
              }
            });
            // if (data[0] && this.SelectedBPCFactView.MSME_Att_ID === "") {
            //   this.SelectedBPCFactView.MSME_Att_ID = data[0].AttachmentID;
            // }
            // if (data[1] && this.SelectedBPCFactView.RP_Att_ID === "") {
            //   this.SelectedBPCFactView.RP_Att_ID = data[1].AttachmentID;
            // }
            // if (data[0] && this.SelectedBPCFactView.RP_Att_ID === "") {
            //   this.SelectedBPCFactView.RP_Att_ID = data[0].AttachmentID;
            // }
            // if (data[2] && this.SelectedBPCFactView.TDS_Att_ID === "") {
            //   this.SelectedBPCFactView.TDS_Att_ID = data[2].AttachmentID;
            // }
            // else if (data[0] && this.SelectedBPCFactView.TDS_Att_ID === "") {
            //   this.SelectedBPCFactView.TDS_Att_ID = data[0].AttachmentID;
            // }
            // else if (data[1] && this.SelectedBPCFactView.TDS_Att_ID === "") {
            //   this.SelectedBPCFactView.TDS_Att_ID = data[1].AttachmentID;
            // }
            this.IsProgressBarVisibile = false;

            this.update();
          }
        },
        (err) => {
          this.IsProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        });
    }
    else {
      this.IsProgressBarVisibile = false;
      this.update();

    }
  }
  update(): void {
    this.IsProgressBarVisibile=true;
    this._FactService.UpdateFact_BPCFact(this.SelectedBPCFact).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(` declaration successfully updated`, SnackBarStatus.success);
        this.AllAttachment = [];
        this.Attachments = [];
        this.GetFactByPartnerID();
        this.CreateSupportTicket();
      },
      (err) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      });
  }
  GetSupportTicket(): SupportHeaderView {
    const SupportTicketView: SupportHeaderView = new SupportHeaderView();
    SupportTicketView.Client = this.SelectedBPCFactView.Client;
    SupportTicketView.Company = this.SelectedBPCFactView.Company;
    SupportTicketView.Type = this.SelectedBPCFactView.Type;
    SupportTicketView.PatnerID = this.SelectedBPCFactView.PatnerID;
    SupportTicketView.ReasonCode = '1236';
    SupportTicketView.Plant = '1000';
    SupportTicketView.Reason = 'Master Data Change';
    SupportTicketView.DocumentRefNo = this.SelectedBPCFactView.PatnerID;
    SupportTicketView.CreatedBy = this.CurrentUserID.toString();
    // let supportMaster = new SupportMaster();
    // supportMaster = this.SupportMasters.find(x => x.ReasonCode === SupportTicketView.ReasonCode);
    // if (supportMaster) {
    //   this.GetFilteredUsers(supportMaster);
    // }
    // console.log(this.FilteredUsers);
    // SupportTicketView.Users = this.FilteredUsers;
    return SupportTicketView;
  }
  CreateSupportTicket(): void {
    this.IsProgressBarVisibile = true;
    const SupportTicketView = this.GetSupportTicket();
    this.__supportDeskService.CreateSupportTicket(SupportTicketView).subscribe(
      (data) => {
        console.log("Support Ticket Created");
        this.notificationSnackBarComponent.openSnackBar('Support Ticket Created successfully ', SnackBarStatus.success);
        // this.change = true;
        this.IsProgressBarVisibile = false;
        // this.FactFormGroup.disable();
        this.GetFactByPartnerID();
      },
      (err) => {
        this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
      }
    );
  }
  OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
    this.result_action = false;
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
        this.result_action = result;
        this.AddAttachment();
      });
  }


}
