import { Component, OnInit } from '@angular/core';
import { RoleWithApp, AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { Guid } from 'guid-typescript';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { BPCDocumentCenterMaster } from 'app/models/ASN';

@Component({
  selector: 'app-doc-type-master',
  templateUrl: './doc-type-master.component.html',
  styleUrls: ['./doc-type-master.component.scss']
})
export class DocTypeMasterComponent implements OnInit {

  AllDocumentCenterMasters: BPCDocumentCenterMaster[] = [];
  AllExtensions: string[] = [];
  MandatoryList: any[] = [];
  selectedDocumentCenterMaster: BPCDocumentCenterMaster;
  menuItems: string[];
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  selectID: number;
  DocumentCenterMasterFormGroup: FormGroup;
  searchText = '';
  constructor(
    private _masterService: MasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.selectedDocumentCenterMaster = new BPCDocumentCenterMaster();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.isProgressBarVisibile = true;
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.menuItems.indexOf('Doctype') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.InitializeDocumentCenterMasterFormGroup();
      this.InitializeAllExtensions();
      this.InitializeMandatoryList();
      this.GetAllDocumentCenterMasters();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }
  InitializeDocumentCenterMasterFormGroup(): void {
    this.DocumentCenterMasterFormGroup = this._formBuilder.group({
      DocumentType: ['', Validators.required],
      Text: ['', Validators.required],
      Mandatory: ['', [Validators.required]],
      Extension: ['', [Validators.required, Validators.pattern]],
      SizeInKB: ['', [Validators.required, Validators.pattern('^[1-9][0-9]*$')]],
      ForwardMail: ['', [Validators.required, Validators.email]]
    });
  }

  ResetControl(): void {
    this.selectedDocumentCenterMaster = new BPCDocumentCenterMaster();
    this.selectID = 0;
    this.DocumentCenterMasterFormGroup.reset();
    Object.keys(this.DocumentCenterMasterFormGroup.controls).forEach(key => {
      this.DocumentCenterMasterFormGroup.get(key).markAsUntouched();
    });
    // this.fileToUpload = null;
  }
  InitializeAllExtensions(): void {
    this.AllExtensions = ['pdf', 'jpg', 'jpeg', 'png', 'svg', 'tif', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'txt'];
  }
  InitializeMandatoryList(): void {
    this.MandatoryList = [{ Key: 'Yes', Value: true }, { Key: 'No', Value: false }];
  }
  GetAllDocumentCenterMasters(): void {
    this.isProgressBarVisibile = true;
    this._masterService.GetAllDocumentCenterMaster().subscribe(
      (data) => {
        this.isProgressBarVisibile = false;
        this.AllDocumentCenterMasters = <BPCDocumentCenterMaster[]>data;
        if (this.AllDocumentCenterMasters && this.AllDocumentCenterMasters.length) {
          this.loadSelectedDocumentCenterMaster(this.AllDocumentCenterMasters[0]);
        }
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  loadSelectedDocumentCenterMaster(selectedDocumentCenterMaster: BPCDocumentCenterMaster): void {
    this.selectID = selectedDocumentCenterMaster.AppID;
    this.selectedDocumentCenterMaster = selectedDocumentCenterMaster;
    this.SetDocumentCenterMasterValues();
  }

  SetDocumentCenterMasterValues(): void {
    this.DocumentCenterMasterFormGroup.get('DocumentType').patchValue(this.selectedDocumentCenterMaster.DocumentType);
    this.DocumentCenterMasterFormGroup.get('Text').patchValue(this.selectedDocumentCenterMaster.Text);
    this.DocumentCenterMasterFormGroup.get('Mandatory').patchValue(this.selectedDocumentCenterMaster.Mandatory);
    this.DocumentCenterMasterFormGroup.get('Extension').patchValue(this.selectedDocumentCenterMaster.Extension);
    this.DocumentCenterMasterFormGroup.get('SizeInKB').patchValue(this.selectedDocumentCenterMaster.SizeInKB);
    this.DocumentCenterMasterFormGroup.get('ForwardMail').patchValue(this.selectedDocumentCenterMaster.ForwardMail);
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
            this.CreateDocumentCenterMaster();
          } else if (Actiontype === 'Update') {
            this.UpdateDocumentCenterMaster();
          } else if (Actiontype === 'Delete') {
            this.DeleteDocumentCenterMaster();
          }
        }
      });
  }

  GetDocumentCenterMasterValues(): void {
    this.selectedDocumentCenterMaster.DocumentType = this.DocumentCenterMasterFormGroup.get('DocumentType').value;
    this.selectedDocumentCenterMaster.Text = this.DocumentCenterMasterFormGroup.get('Text').value;
    this.selectedDocumentCenterMaster.Mandatory = this.DocumentCenterMasterFormGroup.get('Mandatory').value;
    this.selectedDocumentCenterMaster.Extension = this.DocumentCenterMasterFormGroup.get('Extension').value;
    this.selectedDocumentCenterMaster.SizeInKB = this.DocumentCenterMasterFormGroup.get('SizeInKB').value;
    this.selectedDocumentCenterMaster.ForwardMail = this.DocumentCenterMasterFormGroup.get('ForwardMail').value;
  }

  CreateDocumentCenterMaster(): void {
    this.GetDocumentCenterMasterValues();
    this.selectedDocumentCenterMaster.CreatedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.CreateDocumentCenterMaster(this.selectedDocumentCenterMaster).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Document Type Master created successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllDocumentCenterMasters();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );

  }

  UpdateDocumentCenterMaster(): void {
    this.GetDocumentCenterMasterValues();
    this.selectedDocumentCenterMaster.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.UpdateDocumentCenterMaster(this.selectedDocumentCenterMaster).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Document Type Master updated successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllDocumentCenterMasters();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }

  DeleteDocumentCenterMaster(): void {
    this.GetDocumentCenterMasterValues();
    this.selectedDocumentCenterMaster.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.DeleteDocumentCenterMaster(this.selectedDocumentCenterMaster).subscribe(
      (data) => {
        // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Document Type Master deleted successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllDocumentCenterMasters();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }

  ShowValidationErrors(): void {
    Object.keys(this.DocumentCenterMasterFormGroup.controls).forEach(key => {
      this.DocumentCenterMasterFormGroup.get(key).markAsTouched();
      this.DocumentCenterMasterFormGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    if (this.DocumentCenterMasterFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.selectedDocumentCenterMaster.AppID) {
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

  DeleteClicked(): void {
    if (this.DocumentCenterMasterFormGroup.valid) {
      if (this.selectedDocumentCenterMaster.AppID) {
        const Actiontype = 'Delete';
        const Catagory = 'Document type Master';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }
}
