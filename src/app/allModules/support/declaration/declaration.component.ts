import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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
import { AuthService } from 'app/services/auth.service';
import { FactService } from 'app/services/fact.service';
import { SupportDeskService } from 'app/services/support-desk.service';
import { Guid } from 'guid-typescript';
import * as SecureLS from 'secure-ls';

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
  SecretKey: string;
  SecureStorage: SecureLS;
  IsMSMERequired: boolean;
  IsRPRequired: boolean;
  IsTDSRequired: boolean;


  constructor(private _fuseConfigService: FuseConfigService,
    private _authService: AuthService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _FactService: FactService,
    private _formBuilder: FormBuilder,
    private __supportDeskService: SupportDeskService,
    private dialog: MatDialog) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });

    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.SelectedBPCFact = new BPCFact();
    this.SelectedBPCFactView = new BPCFact();
    // this.AllAttachment = new BPCAttachments();
    this.AllAttachment_RelatedParty = new BPCAttachments();
    this.AllAttachment_LowerTDS = new BPCAttachments();
    this.IsMSMERequired = false;
    this.IsRPRequired = false;
    this.IsTDSRequired = false;
  }

  ngOnInit(): void {

    const retrievedObject = this.SecureStorage.get('authorizationData');
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
      this.InitializeSupportDeclarationFormGroup();
      this.SetUserPreference();
      this.GetFactByPartnerID();
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
  RecurringChanged(event): void {
    // console.log(event);
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
        const index = this.AllAttachment.findIndex(x => x.Category === "MSME");
        if (index >= 0) {
          this.AllAttachment.splice(index, 1);
        }
        if (this.SelectedBPCFact.MSME_Att_ID != null && this.SelectedBPCFact.MSME_Att_ID !== "") {
          Attachmnt.AttachmentID = +this.SelectedBPCFact.MSME_Att_ID;
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
        const index = this.AllAttachment.findIndex(x => x.Category === "RP");
        if (index >= 0) {
          this.AllAttachment.splice(index, 1);
        }
        Attachmnt.AttachmentID = 0;
        if (this.SelectedBPCFact.RP_Att_ID != null && this.SelectedBPCFact.RP_Att_ID !== "") {
          Attachmnt.AttachmentID = +this.SelectedBPCFact.RP_Att_ID;
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
      const index = this.AllAttachment.findIndex(x => x.Category === "TDS");
      if (index >= 0) {
        this.AllAttachment.splice(index, 1);
      }
      Attachmnt.Client = this.SelectedBPCFactView.Client;
      Attachmnt.AttachmentID = 0;
      if (this.SelectedBPCFact.TDS_Att_ID != null && this.SelectedBPCFact.TDS_Att_ID !== "") {
        Attachmnt.AttachmentID = + this.SelectedBPCFact.TDS_Att_ID;
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
    // console.log('AllAttachment', this.AllAttachment);
  }
  InitializeSupportDeclarationFormGroup(): void {
    this.SupportDeclarationFormGroup = this._formBuilder.group({
      MSMEType: [''],
      RelatedPartyName: [''],
      RelatedPartyType: [''],
      TDS_Cert_No: [''],
      // TDSRate: ['', [Validators.required, Validators.pattern('^([1-9]([0-9])([0-9])?|0)(\.[0-9]{1,2})?$')]],
      TDSRate: ['', [Validators.pattern('^([0-9]{0,2})([.][0-9]{1,2})?$')]],
      IsMSME: [''],
      IsRP: [''],
      IsLDS: ['']
    });
  }
  MSMESelectionChanged(event): void {
    if (event.value === "Yes") {
      this.bool_msme = true;
    }
    else {
      this.bool_msme = false;
    }
    this.MSMEPartChanged();
  }
  RPSelectionChanged(event): void {
    if (event.value === "Yes") {
      this.bool_RP = true;
    }
    else {
      this.bool_RP = false;
    }
    this.RPPartChanged();
  }
  TDSSelectionChanged(event): void {
    if (event.value === "Yes") {
      this.bool_TDSRate = true;
    }
    else {
      this.bool_TDSRate = false;
    }
    this.TDSPartChanged();
  }
  MSMEPartChanged(): void {
    const t = this.SupportDeclarationFormGroup.get('MSMEType').value;
    if (t) {
      this.IsMSMERequired = true;
    } else {
      this.IsMSMERequired = false;
    }
    this.UpdateFormRequiredFileds();
  }
  RPPartChanged(): void {
    const n = this.SupportDeclarationFormGroup.get('RelatedPartyName').value;
    const t = this.SupportDeclarationFormGroup.get('RelatedPartyType').value;
    if (n || t) {
      this.IsRPRequired = true;
    } else {
      this.IsRPRequired = false;
    }
    this.UpdateFormRequiredFileds();
  }
  TDSPartChanged(): void {
    const n = this.SupportDeclarationFormGroup.get('TDS_Cert_No').value;
    const r = this.SupportDeclarationFormGroup.get('TDSRate').value;
    if (n || r) {
      this.IsTDSRequired = true;
    } else {
      this.IsTDSRequired = false;
    }
    this.UpdateFormRequiredFileds();
  }
  UpdateFormRequiredFileds(): void {
    if (this.IsMSMERequired) {
      this.SupportDeclarationFormGroup.get('MSMEType').setValidators(Validators.required);
      this.SupportDeclarationFormGroup.get('MSMEType').updateValueAndValidity();
    } else {
      this.SupportDeclarationFormGroup.get('MSMEType').clearValidators();
      this.SupportDeclarationFormGroup.get('MSMEType').updateValueAndValidity();
    }
    if (this.IsRPRequired) {
      this.SupportDeclarationFormGroup.get('RelatedPartyName').setValidators(Validators.required);
      this.SupportDeclarationFormGroup.get('RelatedPartyName').updateValueAndValidity();
      this.SupportDeclarationFormGroup.get('RelatedPartyType').setValidators(Validators.required);
      this.SupportDeclarationFormGroup.get('RelatedPartyType').updateValueAndValidity();
    } else {
      this.SupportDeclarationFormGroup.get('RelatedPartyName').clearValidators();
      this.SupportDeclarationFormGroup.get('RelatedPartyName').updateValueAndValidity();
      this.SupportDeclarationFormGroup.get('RelatedPartyType').clearValidators();
      this.SupportDeclarationFormGroup.get('RelatedPartyType').updateValueAndValidity();
    }
    if (this.IsTDSRequired) {
      this.SupportDeclarationFormGroup.get('TDS_Cert_No').setValidators(Validators.required);
      this.SupportDeclarationFormGroup.get('TDS_Cert_No').updateValueAndValidity();
      this.SupportDeclarationFormGroup.get('TDSRate').setValidators([Validators.required, Validators.pattern('^([0-9]{0,2})([.][0-9]{1,2})?$')]);
      this.SupportDeclarationFormGroup.get('TDSRate').updateValueAndValidity();
    } else {
      this.SupportDeclarationFormGroup.get('TDS_Cert_No').clearValidators();
      this.SupportDeclarationFormGroup.get('TDS_Cert_No').updateValueAndValidity();
      this.SupportDeclarationFormGroup.get('TDSRate').setValidators(Validators.pattern('^([0-9]{0,2})([.][0-9]{1,2})?$'));
      this.SupportDeclarationFormGroup.get('TDSRate').updateValueAndValidity();
    }
  }

  GetFactByPartnerID(): void {
    this.IsProgressBarVisibile = true;

    this._FactService.GetFactByPartnerID(this.currentUserName).subscribe(
      (data) => {
        this.SelectedBPCFact = data as BPCFact;
        // console.log("selected", this.SelectedBPCFact);
        this.GetSupportValues();

        this.array_BPCAttach.push(this.SelectedBPCFact.MSME_Att_ID, this.SelectedBPCFact.RP_Att_ID, this.SelectedBPCFact.TDS_Att_ID);
        this.get_value = true;
        if (this.get_value === true) {
          for (let i = 0; i < this.array_BPCAttach.length; i++) {
            if (this.array_BPCAttach[i] != null && this.array_BPCAttach[i] !== "") {
              this.GettAttchmentByAttId(this.array_BPCAttach[i], i);
            }
          }
        }
        console.log("this.Attachments", this.Attachments);
        this.IsProgressBarVisibile = false;

      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  GettAttchmentByAttId(array_BPCAttach: any, i): void {
    this.IsProgressBarVisibile = true;
    this.get_value = false;

    this._FactService.GettAttchmentByAttId(array_BPCAttach).subscribe(
      (data) => {
        const attachments = data as BPCAttachments;
        if (data) {
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
        }

        this.IsProgressBarVisibile = false;

      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;

      }
    );

  }
  // tslint:disable-next-line:typedef
  async ViewAttachment(FileName: string) {
    const file = this.Attachments.find(x => x.AttachmentName === FileName);
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
    const UploadedFile = this.AllAttachment.find(x => x.AttachmentName === FileName);
    if (UploadedFile) {
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
      // console.log("Initial Load", this.SelectedBPCFact);
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
      this.MSMEPartChanged();
      this.RPPartChanged();
      this.TDSPartChanged();
    }
  }
  // setValue(event, Name): void {
  //   if (Name === "MSME") {
  //     if (event.value === "Yes") {
  //       this.bool_msme = true;
  //     }
  //     else {
  //       this.bool_msme = false;
  //     }
  //   }
  //   else if (Name === "RP") {
  //     if (event.value === "Yes") {
  //       this.bool_RP = true;
  //     }
  //     else {
  //       this.bool_RP = false;
  //     }
  //   }
  //   else if (Name === "LDS") {
  //     if (event.value === "Yes") {
  //       this.bool_TDSRate = true;
  //     }
  //     else {
  //       this.bool_TDSRate = false;
  //     }
  //   }
  // }
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
      let AllMSMEAtt = true;
      let AllRPAtt = true;
      let AllTDSAtt = true;
      if (this.IsMSMERequired) {
        // if (this.AllAttachment && this.AllAttachment.length) {
        //   const fil = this.AllAttachment.filter(x => x.Category === 'MSME')[0];
        //   if (fil) {
        //     AllMSMEAtt = true;
        //   } else {
        //     AllMSMEAtt = false;
        //   }
        // } else {
        //   AllMSMEAtt = false;
        // }
        if (this.uploadfile_name) {
          AllMSMEAtt = true;
        } else {
          AllMSMEAtt = false;
        }
      }
      if (this.IsRPRequired) {
        // if (this.AllAttachment && this.AllAttachment.length) {
        //   const fil = this.AllAttachment.filter(x => x.Category === 'PR')[0];
        //   if (fil) {
        //     AllRPAtt = true;
        //   } else {
        //     AllRPAtt = false;
        //   }
        // } else {
        //   AllRPAtt = false;
        // }
        if (this.uploadfile_RelatedParty) {
          AllRPAtt = true;
        } else {
          AllRPAtt = false;
        }
      }
      if (this.IsTDSRequired) {
        // if (this.AllAttachment && this.AllAttachment.length) {
        //   const fil = this.AllAttachment.filter(x => x.Category === 'TDS')[0];
        //   if (fil) {
        //     AllTDSAtt = true;
        //   } else {
        //     AllTDSAtt = false;
        //   }
        // } else {
        //   AllTDSAtt = false;
        // }
        if (this.uploadfile_TDS) {
          AllTDSAtt = true;
        } else {
          AllTDSAtt = false;
        }
      }
      if (AllMSMEAtt && AllRPAtt && AllTDSAtt) {
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        this.notificationSnackBarComponent.openSnackBar('Please add attachment for completed section', SnackBarStatus.danger);
      }

    } else {
      this.showValidationErrors(this.SupportDeclarationFormGroup);
    }
  }
  showValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        // console.log(key);
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
                // console.log(key2);
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
  AddAttachment(): void {
    this.GetAllVlaues();
    this.IsProgressBarVisibile = true;
    // // console.log("SelectedBPCFactView", this.SelectedBPCFactView);
    if (this.AllAttachment.length !== 0) {
      this._FactService.UpdateAttachment(this.AllAttachment).subscribe(
        (data) => {
          const attachs = data as BPCAttach[];
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
    this.IsProgressBarVisibile = true;
    this._FactService.UpdateFact_BPCFact(this.SelectedBPCFact).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(` declaration successfully updated`, SnackBarStatus.success);


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
    // // console.log(this.FilteredUsers);
    // SupportTicketView.Users = this.FilteredUsers;
    return SupportTicketView;
  }
  CreateSupportTicket(): void {
    this.IsProgressBarVisibile = true;
    const SupportTicketView = this.GetSupportTicket();
    this.__supportDeskService.CreateSupportTicket(SupportTicketView).subscribe(
      async (data) => {
        const response = data as SupportHeaderView;
        if (this.AllAttachment.length < 3) {
          const IsMSME = this.AllAttachment.findIndex(x => x.Category === "MSME");
          const IsRP = this.AllAttachment.findIndex(x => x.Category === "RP");
          const IsTDS = this.AllAttachment.findIndex(x => x.Category === "LDS");
          if (IsMSME < 0) {
            const attachment = new BPCAttachments();
            attachment.AttachmentName = this.uploadfile_name;
            const Index = this.Attachments.findIndex(x => x.AttachmentName === this.uploadfile_name && x.AttachmentID === +(this.SelectedBPCFact.MSME_Att_ID));
            if (Index !== -1) {
              const base64Response = await fetch(`data:${this.Attachments[Index].ContentType};base64,${this.Attachments[Index].AttachmentFile}`);
              const blobs = await base64Response.blob();
              let fileType = 'image/jpg';
              fileType = this.Attachments[Index].AttachmentName.toLowerCase().includes('.jpg') ? 'image/jpg' :
                this.Attachments[Index].AttachmentName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
                  this.Attachments[Index].AttachmentName.toLowerCase().includes('.png') ? 'image/png' :
                    this.Attachments[Index].AttachmentName.toLowerCase().includes('.pdf') ? 'application/pdf' :
                      this.Attachments[Index].AttachmentName.toLowerCase().includes('.gif') ? 'image/gif' : '';

              const file = new File([blobs], this.Attachments[Index].AttachmentName, { type: fileType });
              attachment.AttachmentFile = file;
              attachment.Category = "MSME";
              this.AllAttachment.push(attachment);
            }
          }
          if (IsRP < 0) {
            const attachment = new BPCAttachments();
            attachment.AttachmentName = this.uploadfile_RelatedParty;
            const Index = this.Attachments.findIndex(x => x.AttachmentName === this.uploadfile_RelatedParty && x.AttachmentID === +(this.SelectedBPCFact.RP_Att_ID));
            if (Index !== -1) {
              const base64Response = await fetch(`data:${this.Attachments[Index].ContentType};base64,${this.Attachments[Index].AttachmentFile}`);
              const blobs = await base64Response.blob();
              let fileType = 'image/jpg';
              fileType = this.Attachments[Index].AttachmentName.toLowerCase().includes('.jpg') ? 'image/jpg' :
                this.Attachments[Index].AttachmentName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
                  this.Attachments[Index].AttachmentName.toLowerCase().includes('.png') ? 'image/png' :
                    this.Attachments[Index].AttachmentName.toLowerCase().includes('.pdf') ? 'application/pdf' :
                      this.Attachments[Index].AttachmentName.toLowerCase().includes('.gif') ? 'image/gif' : '';

              const file = new File([blobs], this.Attachments[Index].AttachmentName, { type: fileType });
              attachment.AttachmentFile = file;
              attachment.Category = "RP";
              this.AllAttachment.push(attachment);
            }
          }
          if (IsTDS < 0) {
            const attachment = new BPCAttachments();
            attachment.AttachmentName = this.uploadfile_TDS;
            const Index = this.Attachments.findIndex(x => x.AttachmentName === this.uploadfile_TDS && x.AttachmentID === +(this.SelectedBPCFact.TDS_Att_ID));
            if (Index !== -1) {
              const base64Response = await fetch(`data:${this.Attachments[Index].ContentType};base64,${this.Attachments[Index].AttachmentFile}`);
              const blobs = await base64Response.blob();
              let fileType = 'image/jpg';
              fileType = this.Attachments[Index].AttachmentName.toLowerCase().includes('.jpg') ? 'image/jpg' :
                this.Attachments[Index].AttachmentName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
                  this.Attachments[Index].AttachmentName.toLowerCase().includes('.png') ? 'image/png' :
                    this.Attachments[Index].AttachmentName.toLowerCase().includes('.pdf') ? 'application/pdf' :
                      this.Attachments[Index].AttachmentName.toLowerCase().includes('.gif') ? 'image/gif' : '';

              const file = new File([blobs], this.Attachments[Index].AttachmentName, { type: fileType });
              attachment.AttachmentFile = file;
              attachment.Category = "TDS";
              this.AllAttachment.push(attachment);
            }
          }
        }
        const Files: File[] = [];
        this.AllAttachment.forEach(element => {
          const fileType = element.AttachmentFile.name.toLowerCase().includes('.jpg') ? 'image/jpg' :
            element.AttachmentFile.name.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
              element.AttachmentFile.name.toLowerCase().includes('.png') ? 'image/png' :
                element.AttachmentFile.name.toLowerCase().includes('.gif') ? 'image/gif' :
                  element.AttachmentFile.name.toLowerCase().includes('.pdf') ? 'application/pdf' : '';

          const fileName = element.Category + "_" + element.AttachmentFile.name;
          const SupportFile = new File([element.AttachmentFile], fileName, { type: fileType });
          Files.push(SupportFile);
        });
        this.__supportDeskService.AddSupportAttachment(response.SupportID, this.currentUserName, Files).subscribe(
          (data1) => {
            this.notificationSnackBarComponent.openSnackBar('Support Ticket Created successfully ', SnackBarStatus.success);
            // this.change = true;
            this.IsProgressBarVisibile = false;
            // this.FactFormGroup.disable();
            this.AllAttachment = [];
            this.Attachments = [];
            this.GetFactByPartnerID();
          }
        );
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
        if (result) {
          this.AddAttachment();
        }
      });
  }
}
