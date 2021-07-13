import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
import { AuthenticationDetails } from 'app/models/master';
import { BPCPlantMaster, CBPLocation } from 'app/models/OrderFulFilment';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { ASNService } from 'app/services/asn.service';
import { AuthService } from 'app/services/auth.service';
import { MasterService } from 'app/services/master.service';
import * as SecureLS from 'secure-ls';

@Component({
  selector: 'app-plant-master',
  templateUrl: './plant-master.component.html',
  styleUrls: ['./plant-master.component.scss']
})
export class PlantMasterComponent implements OnInit {

  AllPlantMasters: BPCPlantMaster[] = [];
  AllExtensions: string[] = [];
  MandatoryList: any[] = [];
  selectedPlantMaster: BPCPlantMaster;
  menuItems: string[];
  authenticationDetails: AuthenticationDetails;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  selectedPlantCode: string;
  PlantMasterFormGroup: FormGroup;
  searchText = '';
  SecretKey: string;
  SecureStorage: SecureLS;

  constructor(
    private _masterService: MasterService,
    private _authService: AuthService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });

    this.selectedPlantMaster = new BPCPlantMaster();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.isProgressBarVisibile = true;
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.menuItems.indexOf('PlantMaster') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        this._router.navigate(['/auth/login']);
      }
      this.InitializePlantMasterFormGroup();
      this.GetAllPlantMasters();
    } else {
      this._router.navigate(['/auth/login']);
    }

  }
  InitializePlantMasterFormGroup(): void {
    this.PlantMasterFormGroup = this._formBuilder.group({
      PlantCode: ['', Validators.required],
      PlantText: ['', Validators.required],
      PinCode: ['', [Validators.required]],
      City: ['', [Validators.required]],
      State: ['', [Validators.required]],
      Country: ['', [Validators.required]],
      AddressLine1: ['', [Validators.required]],
      AddressLine2: ['']
    });
    // this.PlantMasterFormGroup.get('Field').disable();
  }

  ResetControl(): void {
    this.selectedPlantMaster = new BPCPlantMaster();
    this.selectedPlantCode = '';
    this.PlantMasterFormGroup.reset();
    Object.keys(this.PlantMasterFormGroup.controls).forEach(key => {
      this.PlantMasterFormGroup.get(key).markAsUntouched();
    });
    this.PlantMasterFormGroup.get('PlantCode').enable();
    // this.fileToUpload = null;
  }

  GetAllPlantMasters(): void {
    this.isProgressBarVisibile = true;
    this._masterService.GetAllPlant().subscribe(
      (data) => {
        this.isProgressBarVisibile = false;
        this.AllPlantMasters = <BPCPlantMaster[]>data;
        if (this.AllPlantMasters && this.AllPlantMasters.length) {
          this.loadSelectedPlantMaster(this.AllPlantMasters[0]);
        }
      },
      (err) => {
        console.error(err);
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  loadSelectedPlantMaster(selectedPlantMaster: BPCPlantMaster): void {
    this.selectedPlantCode = selectedPlantMaster.PlantCode;
    this.selectedPlantMaster = selectedPlantMaster;
    this.SetPlantMasterValues();
  }

  SetPlantMasterValues(): void {
    this.PlantMasterFormGroup.get('PlantCode').patchValue(this.selectedPlantMaster.PlantCode);
    this.PlantMasterFormGroup.get('PlantText').patchValue(this.selectedPlantMaster.PlantText);
    this.PlantMasterFormGroup.get('PinCode').patchValue(this.selectedPlantMaster.PinCode);
    this.PlantMasterFormGroup.get('City').patchValue(this.selectedPlantMaster.City);
    this.PlantMasterFormGroup.get('State').patchValue(this.selectedPlantMaster.State);
    this.PlantMasterFormGroup.get('Country').patchValue(this.selectedPlantMaster.Country);
    this.PlantMasterFormGroup.get('AddressLine1').patchValue(this.selectedPlantMaster.AddressLine1);
    this.PlantMasterFormGroup.get('AddressLine2').patchValue(this.selectedPlantMaster.AddressLine2);

    this.PlantMasterFormGroup.get('PlantCode').disable();
  }

  OnPincodeKeyEnter(event): void {
    const Pincode = event.target.value;
    console.log('OnPincodeKeyEnter Pincode', Pincode);
    if (Pincode) {
      this._masterService.GetLocationByPincode(Pincode).subscribe(
        (data) => {
          const postal = data as CBPLocation;
          if (postal) {
            this.PlantMasterFormGroup.get('City').patchValue(postal.District);
            this.PlantMasterFormGroup.get('State').patchValue(postal.State);
            this.PlantMasterFormGroup.get('Country').patchValue(postal.Country);
            this.PlantMasterFormGroup.get('AddressLine1').patchValue('');
            this.PlantMasterFormGroup.get('AddressLine2').patchValue('');
            // this.PlantMasterFormGroup.get('AddressLine1').patchValue(postal.Taluk + ',' + postal.State);
            // this.PlantMasterFormGroup.get('AddressLine2').patchValue(postal.Taluk + ',' + postal.State);
          }
        },
        (err) => {
          console.error(err);
        }
      );

    }
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
            this.CreatePlantMaster();
          } else if (Actiontype === 'Update') {
            this.UpdatePlantMaster();
          } else if (Actiontype === 'Delete') {
            this.DeletePlantMaster();
          }
        }
      });
  }

  GetPlantMasterValues(): void {
    this.selectedPlantMaster.PlantCode = this.PlantMasterFormGroup.get('PlantCode').value;
    this.selectedPlantMaster.PlantText = this.PlantMasterFormGroup.get('PlantText').value;
    this.selectedPlantMaster.PinCode = this.PlantMasterFormGroup.get('PinCode').value;
    this.selectedPlantMaster.City = this.PlantMasterFormGroup.get('City').value;
    this.selectedPlantMaster.State = this.PlantMasterFormGroup.get('State').value;
    this.selectedPlantMaster.Country = this.PlantMasterFormGroup.get('Country').value;
    this.selectedPlantMaster.AddressLine1 = this.PlantMasterFormGroup.get('AddressLine1').value;
    this.selectedPlantMaster.AddressLine2 = this.PlantMasterFormGroup.get('AddressLine2').value;
  }

  CreatePlantMaster(): void {
    this.GetPlantMasterValues();
    this.selectedPlantMaster.CreatedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.CreatePlantMaster(this.selectedPlantMaster).subscribe(
      (data) => {
        // // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Plant master created successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllPlantMasters();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );

  }

  UpdatePlantMaster(): void {
    this.GetPlantMasterValues();
    this.selectedPlantMaster.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.UpdatePlantMaster(this.selectedPlantMaster).subscribe(
      (data) => {
        // // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Plant master updated successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllPlantMasters();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }

  DeletePlantMaster(): void {
    this.GetPlantMasterValues();
    this.selectedPlantMaster.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.isProgressBarVisibile = true;
    this._masterService.DeletePlantMaster(this.selectedPlantMaster).subscribe(
      (data) => {
        // // console.log(data);
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar('Plant master deleted successfully', SnackBarStatus.success);
        this.isProgressBarVisibile = false;
        this.GetAllPlantMasters();
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }

  ShowValidationErrors(): void {
    Object.keys(this.PlantMasterFormGroup.controls).forEach(key => {
      this.PlantMasterFormGroup.get(key).markAsTouched();
      this.PlantMasterFormGroup.get(key).markAsDirty();
    });

  }

  SaveClicked(): void {
    if (this.PlantMasterFormGroup.valid) {
      // const file: File = this.fileToUpload;
      if (this.selectedPlantMaster.CreatedOn) {
        const Actiontype = 'Update';
        const Catagory = 'Plant master';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else {
        const Actiontype = 'Create';
        const Catagory = 'Plant master';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

  DeleteClicked(): void {
    if (this.PlantMasterFormGroup.valid) {
      if (this.selectedPlantMaster.PlantCode) {
        const Actiontype = 'Delete';
        const Catagory = 'Plant master';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
    } else {
      this.ShowValidationErrors();
    }
  }

}
