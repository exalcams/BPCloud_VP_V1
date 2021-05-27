import { Component, OnInit } from '@angular/core';
import { BPCASNFieldMaster } from 'app/models/ASN';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { ASNService } from 'app/services/asn.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-asn-field-master',
  templateUrl: './asn-field-master.component.html',
  styleUrls: ['./asn-field-master.component.scss']
})
export class AsnFieldMasterComponent implements OnInit {

  AllASNFieldMasters: BPCASNFieldMaster[] = [];
  AllExtensions: string[] = [];
  MandatoryList: any[] = [];
  selectedASNFieldMaster: BPCASNFieldMaster;
  menuItems: string[];
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  selectID: number;
  ASNFieldMasterFormGroup: FormGroup;
  searchText = '';
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _masterService: MasterService,
    private _asnService: ASNService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    ) {
      this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });

    this.selectedASNFieldMaster = new BPCASNFieldMaster();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.isProgressBarVisibile = true;
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject =  this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.menuItems.indexOf('Doctype') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.InitializeASNFieldMasterFormGroup();
      this.InitializeMandatoryList();
      this.GetAllASNFieldMasters();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }
  InitializeASNFieldMasterFormGroup(): void {
    this.ASNFieldMasterFormGroup = this._formBuilder.group({
      Field: ['', Validators.required],
      Text: ['', Validators.required],
      DefaultValue: [''],
      Mandatory: ['', [Validators.required]],
      Invisible: ['', [Validators.required]],
      Type:['',[Validators.required]]
    });
    this.ASNFieldMasterFormGroup.get('Field').disable();
  }

  ResetControl(): void {
    this.selectedASNFieldMaster = new BPCASNFieldMaster();
    this.selectID = 0;
    this.ASNFieldMasterFormGroup.reset();
    Object.keys(this.ASNFieldMasterFormGroup.controls).forEach(key => {
      this.ASNFieldMasterFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  InitializeAllExtensions(): void {
    this.AllExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'svg', 'tif', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'];
  }
  InitializeMandatoryList(): void {
    this.MandatoryList = [{ Key: 'Yes', Value: true }, { Key: 'No', Value: false }];
  }
  GetAllASNFieldMasters(): void {
    this.isProgressBarVisibile = true;
    this._asnService.GetAllASNFieldMaster().subscribe(
      (data) => {
        this.isProgressBarVisibile = false;
        this.AllASNFieldMasters = <BPCASNFieldMaster[]>data;
        if (this.AllASNFieldMasters && this.AllASNFieldMasters.length) {
          this.loadSelectedASNFieldMaster(this.AllASNFieldMasters[0]);
        }
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  loadSelectedASNFieldMaster(selectedASNFieldMaster: BPCASNFieldMaster): void {
    this.selectID = selectedASNFieldMaster.ID;
    this.selectedASNFieldMaster = selectedASNFieldMaster;
    this.SetASNFieldMasterValues();
  }

  SetASNFieldMasterValues(): void {
    this.ASNFieldMasterFormGroup.get('Field').patchValue(this.selectedASNFieldMaster.Field);
    this.ASNFieldMasterFormGroup.get('Text').patchValue(this.selectedASNFieldMaster.Text);
    this.ASNFieldMasterFormGroup.get('DefaultValue').patchValue(this.selectedASNFieldMaster.DefaultValue);
    this.ASNFieldMasterFormGroup.get('Mandatory').patchValue(this.selectedASNFieldMaster.Mandatory);
    this.ASNFieldMasterFormGroup.get('Invisible').patchValue(this.selectedASNFieldMaster.Invisible);
    this.ASNFieldMasterFormGroup.get('Type').patchValue(this.selectedASNFieldMaster.DocType);
    this.ASNFieldMasterFormGroup.get('Field').disable();
    this.ASNFieldMasterFormGroup.get('Type').disable();
  }
  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 8 || charCode === 9 || charCode === 13 || charCode === 46
      || charCode === 37 || charCode === 39 || charCode === 123) {
      return true;
    }
    else if (charCode < 48 || charCode > 57) {
      return false;
    }
    return true;
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
          if (Actiontype === 'Create') {
            // this.CreateASNFieldMaster();
          } else if (Actiontype === 'Update') {
            this.UpdateASNFieldMaster();
          } else if (Actiontype === 'Delete') {
            // this.DeleteASNFieldMaster();
          }
        }
      });
  }

  GetASNFieldMasterValues(): void {
    this.selectedASNFieldMaster.Field = this.ASNFieldMasterFormGroup.get('Field').value;
    this.selectedASNFieldMaster.FieldName = this.ASNFieldMasterFormGroup.get('Field').value;
    this.selectedASNFieldMaster.Text = this.ASNFieldMasterFormGroup.get('Text').value;
    this.selectedASNFieldMaster.DefaultValue = this.ASNFieldMasterFormGroup.get('DefaultValue').value;
    this.selectedASNFieldMaster.Mandatory = this.ASNFieldMasterFormGroup.get('Mandatory').value;
    this.selectedASNFieldMaster.Invisible = this.ASNFieldMasterFormGroup.get('Invisible').value;
    this.selectedASNFieldMaster.DocType = this.ASNFieldMasterFormGroup.get('Type').value;
  }

  // CreateASNFieldMaster(): void {
  //   this.GetASNFieldMasterValues();
  //   this.selectedASNFieldMaster.CreatedBy = this.authenticationDetails.UserID.toString();
  //   this.isProgressBarVisibile = true;
  //   this._masterService.CreateASNFieldMaster(this.selectedASNFieldMaster).subscribe(
  //     (data) => {
  //       // console.log(data);
  //       this.ResetControl();
  //       this.notificationSnackBarComponent.openSnackBar('Document Type Master created successfully', SnackBarStatus.success);
  //       this.isProgressBarVisibile = false;
  //       this.GetAllASNFieldMasters();
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );

  // }

  UpdateASNFieldMaster(): void {
    this.GetASNFieldMasterValues();
    this.selectedASNFieldMaster.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._asnService.UpdateASNFieldMaster(this.selectedASNFieldMaster).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('ASN Field Configuration updated successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllASNFieldMasters();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }

  // DeleteASNFieldMaster(): void {
  //   this.GetASNFieldMasterValues();
  //   this.selectedASNFieldMaster.ModifiedBy = this.authenticationDetails.UserID.toString();
  //   this.isProgressBarVisibile = true;
  //   this._masterService.DeleteASNFieldMaster(this.selectedASNFieldMaster).subscribe(
  //     (data) => {
  //       // console.log(data);
  //       this.ResetControl();
  //       this.notificationSnackBarComponent.openSnackBar('Document Type Master deleted successfully', SnackBarStatus.success);
  //       this.isProgressBarVisibile = false;
  //       this.GetAllASNFieldMasters();
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  ShowValidationErrors(): void {
    Object.keys(this.ASNFieldMasterFormGroup.controls).forEach(key => {
      this.ASNFieldMasterFormGroup.get(key).markAsTouched();
      this.ASNFieldMasterFormGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    if (this.ASNFieldMasterFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.selectedASNFieldMaster.ID) {
        const Actiontype = 'Update';
        const Catagory = 'Document type Master';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'Document type Master';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  // DeleteClicked(): void {
  //   if (this.ASNFieldMasterFormGroup.valid) {
  //     if (this.selectedASNFieldMaster.ID) {
  //       const Actiontype = 'Delete';
  //       const Catagory = 'Document type Master';
  //       this.OpenConfirmationDialog(Actiontype, Catagory);
  //     }
  //   } else {
  //     this.ShowValidationErrors();
  //   }
  // }

}
