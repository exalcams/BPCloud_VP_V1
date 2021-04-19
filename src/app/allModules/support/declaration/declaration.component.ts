import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { BPCAttach, BPCAttachments, BPCFact } from 'app/models/fact';
import { AuthenticationDetails } from 'app/models/master';
import { SupportLog } from 'app/models/support-desk';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { FactService } from 'app/services/fact.service';
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

  // pattern= "^[0-9]$";
  constructor(private _fuseConfigService: FuseConfigService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _FactService: FactService,
    private _formBuilder: FormBuilder,
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

        Attachmnt.Client = this.SelectedBPCFactView.Client;
        Attachmnt.Type = this.SelectedBPCFactView.Type;
        Attachmnt.Company = this.SelectedBPCFactView.Company;
        Attachmnt.PatnerID = this.SelectedBPCFactView.PatnerID;
        Attachmnt.AttachmentName = eve.target.files[0].name;
        Attachmnt.ContentType = eve.target.files[0].type;
        Attachmnt.ContentLength = size;
        Attachmnt.AttachmentFile = eve.target.files[0];
        this.SelectedBPCFactView.MSME_Att_ID = "";

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
        Attachmnt.Type = this.SelectedBPCFactView.Type;
        Attachmnt.Company = this.SelectedBPCFactView.Company;
        Attachmnt.PatnerID = this.SelectedBPCFactView.PatnerID;
        Attachmnt.AttachmentName = eve.target.files[0].name;
        Attachmnt.ContentType = eve.target.files[0].type;
        Attachmnt.ContentLength = size;
        Attachmnt.AttachmentFile = eve.target.files[0];
        this.SelectedBPCFactView.RP_Att_ID = "";
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

      Attachmnt.Client = this.SelectedBPCFactView.Client;
      Attachmnt.Type = this.SelectedBPCFactView.Type;
      Attachmnt.Company = this.SelectedBPCFactView.Company;
      Attachmnt.PatnerID = this.SelectedBPCFactView.PatnerID;
      Attachmnt.AttachmentName = eve.target.files[0].name;
      Attachmnt.ContentType = eve.target.files[0].type;
      Attachmnt.ContentLength = size;
      Attachmnt.AttachmentFile = eve.target.files[0];
      this.SelectedBPCFactView.TDS_Att_ID = "";
      this.AllAttachment.push(Attachmnt);


    }

  }
  InitializeSupportDeclarationFormGroup(): void {
    this.SupportDeclarationFormGroup = this._formBuilder.group({
      MSMEType: ['', Validators.required],
      RelatedPartyName: ['', Validators.required],
      RelatedPartyType: ['', Validators.required],
      TDSRate: ['', [Validators.required, Validators.pattern('^([1-9]([0-9])([0-9])?|0)(\.[0-9]{1,2})?$')]],


    });
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

            this.GettAttchmentByAttId(this.array_BPCAttach[i], i);

          }
        }
        this.IsProgressBarVisibile = false;

      },
      (err) => {
        console.error(err);
      }
    );
  }
  GettAttchmentByAttId(array_BPCAttach: any, i): void {
    this.get_value = false;

    this._FactService.GettAttchmentByAttId(array_BPCAttach).subscribe(
      (data) => {
        this.IsProgressBarVisibile = true;

        if (i === 0) {



          this.uploadfile_name = data.AttachmentName;
          this.size_KB = data.ContentLength;
          this.upload_msme_bool = true;

          if (this.size_KB){
            this.get_value = true;
          }

        }
        if (i === 1) {

          this.uploadfile_RelatedParty = data.AttachmentName;
          this.size_KB_RelatedParty = data.ContentLength;
          this.upload_RealtedParty_bool = true;

          if (this.size_KB_RelatedParty){
            this.get_value = true;
          }

        }
        if (i === 2) {
          this.uploadfile_TDS = data.AttachmentName;
          this.size_KB_TDS = data.ContentLength;
          this.upload_TDS_bool = true;

          if (this.size_KB_TDS){
            this.get_value = true;
          }
        }
        this.IsProgressBarVisibile = false;

      },
      (err) => {
        console.error(err);
      }
    );

  }
  GetSupportValues(): void {
    if (this.SelectedBPCFact) {
      this.SupportDeclarationFormGroup.get('MSMEType').patchValue(this.SelectedBPCFact.MSME_TYPE);
      this.SupportDeclarationFormGroup.get('RelatedPartyName').patchValue(this.SelectedBPCFact.RP_Name);
      this.SupportDeclarationFormGroup.get('RelatedPartyType').patchValue(this.SelectedBPCFact.RP_Type);
      this.SupportDeclarationFormGroup.get('TDSRate').patchValue(this.SelectedBPCFact.TDS_RATE);
      this.SelectedBPCFactView.MSME_Att_ID = this.SelectedBPCFact.MSME_Att_ID;
      this.SelectedBPCFactView.RP_Att_ID = this.SelectedBPCFact.RP_Att_ID;
      this.SelectedBPCFactView.TDS_Att_ID = this.SelectedBPCFact.TDS_Att_ID;
      // this.TDS_ID=
      this.bool_msme = this.SelectedBPCFact.MSME;
      this.bool_RP = this.SelectedBPCFact.RP;
      this.bool_TDSRate = this.SelectedBPCFact.Reduced_TDS;

      this.SelectedBPCFactView.Client = this.SelectedBPCFact.Client;
      this.SelectedBPCFactView.Type = this.SelectedBPCFact.Type;
      this.SelectedBPCFactView.Company = this.SelectedBPCFact.Company;
      this.SelectedBPCFactView.PatnerID = this.SelectedBPCFact.PatnerID;
    }

  }
  setValue(e): void {
    if (e.source.id === "slide_msme") {
      this.bool_msme = e.checked;
    }
    else if (e.source.id === "slide_RelatedParty") {
      this.bool_RP = e.checked;
    }
    else if (e.source.id === "slide_LowerDedution") {
      this.bool_TDSRate = e.checked;
    }
  }
  GetAllVlaues(): void {
    this.SelectedBPCFactView.MSME_TYPE = this.SupportDeclarationFormGroup.get('MSMEType').value;
    this.SelectedBPCFactView.RP_Name = this.SupportDeclarationFormGroup.get('RelatedPartyName').value;
    this.SelectedBPCFactView.RP_Type = this.SupportDeclarationFormGroup.get('RelatedPartyType').value;
    this.SelectedBPCFactView.TDS_RATE = this.SupportDeclarationFormGroup.get('TDSRate').value;
    this.SelectedBPCFactView.MSME = this.bool_msme;
    this.SelectedBPCFactView.RP = this.bool_RP;

    this.SelectedBPCFactView.Reduced_TDS = this.bool_TDSRate;

    this.SelectedBPCFactView.Client = this.SelectedBPCFact.Client;
    this.SelectedBPCFactView.Type = this.SelectedBPCFact.Type;
    this.SelectedBPCFactView.Company = this.SelectedBPCFact.Company;
    this.SelectedBPCFactView.PatnerID = this.SelectedBPCFact.PatnerID;



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
          if (data[0] && this.SelectedBPCFactView.MSME_Att_ID === ""){
            this.SelectedBPCFactView.MSME_Att_ID = data[0].AttachmentID;
          }
          if (data[1] && this.SelectedBPCFactView.RP_Att_ID === "") {
            this.SelectedBPCFactView.RP_Att_ID = data[1].AttachmentID;
          }
          if (data[0] && this.SelectedBPCFactView.RP_Att_ID === "") {
            this.SelectedBPCFactView.RP_Att_ID = data[0].AttachmentID;
          }
          if (data[2] && this.SelectedBPCFactView.TDS_Att_ID === ""){
            this.SelectedBPCFactView.TDS_Att_ID = data[2].AttachmentID;
          }
          else if (data[0] && this.SelectedBPCFactView.TDS_Att_ID === "") {
            this.SelectedBPCFactView.TDS_Att_ID = data[0].AttachmentID;
          }
          else if (data[1] && this.SelectedBPCFactView.TDS_Att_ID === "") {
            this.SelectedBPCFactView.TDS_Att_ID = data[1].AttachmentID;
          }

          this.update();

        },
        (err) => {
          this.IsProgressBarVisibile = false;
          this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        });
    }
    else {
      this.update();
    }
  }
  update(): void {

    this._FactService.UpdateFact_BPCFact(this.SelectedBPCFactView).subscribe(
      (data) => {

        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(` declaration successfully updated`, SnackBarStatus.success);
      },
      (err) => {
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      });

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
