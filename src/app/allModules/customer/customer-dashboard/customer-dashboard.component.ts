import { Component, OnInit } from '@angular/core';
import { MenuApp, AuthenticationDetails, AppUsage } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { BPCFact, BPCFactView, BPCKRA, BPCFactBank, BPCFactContactPerson, BPCAIACT } from 'app/models/fact';
import { SelectionModel } from '@angular/cdk/collections';
import { FuseConfigService } from '@fuse/services/config.service';
import { MasterService } from 'app/services/master.service';
import { FactService } from 'app/services/fact.service';
import { VendorMasterService } from 'app/services/vendor-master.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-customer-dashboard',
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.scss']
})
export class CustomerDashboardComponent implements OnInit {

  MenuItems: string[];
  AllMenuApps: MenuApp[] = [];
  SelectedMenuApp: MenuApp;
  authenticationDetails: AuthenticationDetails;
  CurrentUserID: Guid;
  CurrentUserName: string;
  CurrentUserRole = '';
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  searchText = '';
  AllFacts: BPCFact[] = [];
  selectID: string;
  SelectedBPCFact: BPCFact;
  SelectedBPCFactView: BPCFactView;
  KRAsByPartnerID: BPCKRA[] = [];
  BanksByPartnerID: BPCFactBank[] = [];
  ContactPersonsByPartnerID: BPCFactContactPerson[] = [];
  AIACTsByPartnerID: BPCAIACT[] = [];
  AllActions: BPCAIACT[] = [];
  AllNotifications: BPCAIACT[] = [];
  selection = new SelectionModel<any>(true, []);
  todayDate: any;
  SelectedBPCAIACTByPartnerID: BPCAIACT;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _masterService: MasterService,
    private _FactService: FactService,
    private _vendorMasterService: VendorMasterService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder,
    private _authService: AuthService,

  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.SelectedBPCFact = new BPCFact();
    this.SelectedBPCAIACTByPartnerID = new BPCAIACT();
    this.SelectedBPCFactView = new BPCFactView();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.todayDate = new Date().getDate();
  }

  ngOnInit(): void {
    const retrievedObject =  this.SecureStorage.get('authorizationData');
    this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.CurrentUserID = this.authenticationDetails.UserID;
      this.CurrentUserName = this.authenticationDetails.UserName;
      this.CurrentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.MenuItems.indexOf('CustomerDashboard') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
      this.CreateAppUsage();
      this.GetFactByPartnerIDAndType();
    } else {
      this._router.navigate(['/auth/login']);
    }
  }
  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.CurrentUserID;
    appUsage.AppName = 'Dashboard';
    appUsage.UsageCount = 1;
    appUsage.CreatedBy = this.CurrentUserName;
    appUsage.ModifiedBy = this.CurrentUserName;
    this._masterService.CreateAppUsage(appUsage).subscribe(
      (data) => {
      },
      (err) => {
        console.error(err);
      }
    );
  }
  GetFactByPartnerIDAndType(): void {
    // console.log(this.authenticationDetails.EmailAddress);
    this._FactService.GetFactByPartnerIDAndType(this.CurrentUserName, 'C').subscribe(
      (data) => {
        const fact = data as BPCFact[];
        // console.log(fact);
        if (fact[0]) {
          this.GetAIACTsByPartnerID(fact[0].PatnerID);
          this.loadSelectedBPCFact(fact[0]);
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  loadSelectedBPCFact(selectedBPCFact: BPCFact): void {
    this.SelectedBPCFact = selectedBPCFact;
    this.selectID = selectedBPCFact.PatnerID;
  }

  getTodayDate(): any {
    const today = new Date();
    return today.getDate().toString();
  }

  typeSelected(event): void {
    const selectedType = event.value;
    if (event.value) {
      this.SelectedBPCFact.Type = event.value;
    }
  }

  GetKRAsByPartnerID(): void {
    this.IsProgressBarVisibile = true;
    this._FactService.GetKRAsByPartnerID(this.SelectedBPCFact.PatnerID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.KRAsByPartnerID = data as BPCKRA[];
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetBanksByPartnerID(): void {
    this.IsProgressBarVisibile = true;
    this._FactService.GetBanksByPartnerID(this.SelectedBPCFact.PatnerID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.BanksByPartnerID = data as BPCFactBank[];
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetContactPersonsByPartnerID(): void {
    this.IsProgressBarVisibile = true;
    this._FactService.GetContactPersonsByPartnerID(this.SelectedBPCFact.PatnerID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.ContactPersonsByPartnerID = data as BPCFactContactPerson[];
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
      }
    );
  }

  GetAIACTsByPartnerID(PartnerID: any): void {
    this.IsProgressBarVisibile = true;
    this._FactService.GetAIACTsByPartnerID(PartnerID).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.AIACTsByPartnerID = data as BPCAIACT[];
        this.AIACTsByPartnerID.forEach(x => {
          if (x.Type === 'Action') {
            this.AllActions.push(x);
          }
          else {
            this.AllNotifications.push(x);
          }
        });
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
        // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
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
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Actiontype === 'Accept') {
            this.AcceptAIACT();
          } else if (Actiontype === 'Reject') {
            this.RejectAIACT();
          }
        }
      });
  }

  GetBPCFactSubItemValues(): void {
    this.GetBPCKRAValues();
    this.GetBPCFactBankValues();
    this.GetBPCFactContactPersonValues();
    this.GetBPCAIACTValues();
  }

  GetBPCKRAValues(): void {
    this.SelectedBPCFactView.BPCKRAs = [];
    // this.SelectedBPCFactView.bPIdentities.push(...this.KRAsByPartnerID);
    this.KRAsByPartnerID.forEach(x => {
      this.SelectedBPCFactView.BPCKRAs.push(x);
    });
  }

  GetBPCFactBankValues(): void {
    this.SelectedBPCFactView.BPCFactBanks = [];
    // this.SelectedBPCFactView.BPCFactBanks.push(...this.BanksByPartnerID);
    this.BanksByPartnerID.forEach(x => {
      this.SelectedBPCFactView.BPCFactBanks.push(x);
    });
  }

  GetBPCFactContactPersonValues(): void {
    this.SelectedBPCFactView.BPCFactContactPersons = [];
    // this.SelectedBPCFactView.bPIdentities.push(...this.KRAsByPartnerID);
    this.ContactPersonsByPartnerID.forEach(x => {
      this.SelectedBPCFactView.BPCFactContactPersons.push(x);
    });
  }

  GetBPCAIACTValues(): void {
    this.SelectedBPCFactView.BPCAIACTs = [];
    // this.SelectedBPCFactView.BPCFactBanks.push(...this.BanksByPartnerID);
    this.AIACTsByPartnerID.forEach(x => {
      this.SelectedBPCFactView.BPCAIACTs.push(x);
    });
  }

  ShowValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        console.log(key);
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
                console.log(key2);
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

  ActionTextClicked(aIACTByPartnerID: BPCAIACT): void {
    if (aIACTByPartnerID) {
      if (aIACTByPartnerID.ActionText.toLowerCase() === "accept") {
        // this.SetActionToOpenConfirmation('Approve');
        this.SelectedBPCAIACTByPartnerID = aIACTByPartnerID;
        const Actiontype = 'Accept';
        const Catagory = 'PO';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      }
      else if (aIACTByPartnerID.ActionText.toLowerCase() === "reject") {
        // this.SetActionToOpenConfirmation('Approve');
        this.SelectedBPCAIACTByPartnerID = aIACTByPartnerID;
        const Actiontype = 'Reject';
        const Catagory = 'PO';
        this.OpenConfirmationDialog(Actiontype, Catagory);
      } else if (aIACTByPartnerID.ActionText.toLowerCase() === "view") {
        console.log("view called");
        this._router.navigate(['/orderfulfilment/orderfulfilmentCenter'], { queryParams: { id: aIACTByPartnerID.DocNumber } });
      }
    }
    else {

    }
  }

  AcceptAIACT(): void {
    this.SelectedBPCAIACTByPartnerID.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.SelectedBPCAIACTByPartnerID.Status = 'Accepted';
    this.SelectedBPCAIACTByPartnerID.ActionText = 'View';
    this.IsProgressBarVisibile = true;
    this._FactService.AcceptAIACT(this.SelectedBPCAIACTByPartnerID).subscribe(
      (data) => {
        this.notificationSnackBarComponent.openSnackBar('PO Accepted successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  RejectAIACT(): void {
    this.SelectedBPCAIACTByPartnerID.ModifiedBy = this.authenticationDetails.UserID.toString();
    this.SelectedBPCAIACTByPartnerID.Status = 'Rejected';
    this.SelectedBPCAIACTByPartnerID.ActionText = 'View';
    this.IsProgressBarVisibile = true;
    this._FactService.RejectAIACT(this.SelectedBPCAIACTByPartnerID).subscribe(
      (data) => {
        this.notificationSnackBarComponent.openSnackBar('PO Rejected successfully', SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
      }
    );
  }

  SetActionToOpenConfirmation(actiontype: string): void {
    if (this.SelectedBPCFact.PatnerID) {
      const Actiontype = actiontype;
      const Catagory = 'Vendor';
      this.OpenConfirmationDialog(Actiontype, Catagory);
    }
  }

  numberOnly(event): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 8 || charCode === 9 || charCode === 13 || charCode === 46
      || charCode === 37 || charCode === 39 || charCode === 123 || charCode === 190) {
      return true;
    }
    else if (charCode < 48 || charCode > 57) {
      return false;
    }
    return true;
  }
  // GetAttachment(fileName: string, file?: File): void {
  //   if (file && file.size) {
  //     const blob = new Blob([file], { type: file.type });
  //     this.OpenAttachmentDialog(fileName, blob);
  //   } else {
  //     this.IsProgressBarVisibile = true;
  //     this._FactService.DowloandBPCFactImage(fileName).subscribe(
  //       data => {
  //         if (data) {
  //           let fileType = 'image/jpg';
  //           fileType = fileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
  //             fileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
  //               fileName.toLowerCase().includes('.png') ? 'image/png' :
  //                 fileName.toLowerCase().includes('.gif') ? 'image/gif' : '';
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
  // OpenAttachmentDialog(FileName: string, blob: Blob): void {
  //   const attachmentDetails: AttachmentDetails = {
  //     FileName: FileName,
  //     blob: blob
  //   };
  //   const dialogConfig: MatDialogConfig = {
  //     data: attachmentDetails,
  //     panelClass: 'attachment-dialog'
  //   };
  //   const dialogRef = this.dialog.open(AttachmentDialogComponent, dialogConfig);
  //   dialogRef.afterClosed().subscribe(result => {
  //     if (result) {
  //     }
  //   });
  // }
  onClearAllButtonClicked(): void {

  }
}
