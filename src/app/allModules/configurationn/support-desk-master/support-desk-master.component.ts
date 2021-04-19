import { Component, OnInit, ViewEncapsulation, ViewChild, ElementRef } from '@angular/core';
import { fuseAnimations } from '@fuse/animations';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SelectionModel } from '@angular/cdk/collections';
import { AuthenticationDetails, UserWithRole, RoleWithApp } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormBuilder, FormGroup, Validators, FormArray, AbstractControl } from '@angular/forms';
import { MasterService } from 'app/services/master.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Guid } from 'guid-typescript';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { DatePipe } from '@angular/common';
import { SupportDeskService } from 'app/services/support-desk.service';
import { SupportMaster, SupportMasterView } from 'app/models/support-desk';
interface Reason {
    ReasonCode: string;
    ReasonText: string;
}
@Component({
    selector: 'app-support-desk-master',
    templateUrl: './support-desk-master.component.html',
    styleUrls: ['./support-desk-master.component.scss'],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations
})
export class SupportDeskMasterComponent implements OnInit {
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserName: string;
    currentUserRole: string;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    selection = new SelectionModel<any>(true, []);
    searchText = '';
    IsProgressBarVisibile: boolean;
    MenuItems: string[];
    UserWithRoles: UserWithRole[] = [];
    Roles: RoleWithApp[] = [];
    SupportMasters: SupportMaster[] = [];
    SupportMasterFormGroup: FormGroup;
    SelectedSupportMaster: SupportMaster;
    SelectedReasonCode: string;
    SelectedSupportMasterView: SupportMasterView;
    SupportDeskUsers: UserWithRole[] = [];
    Reasons: Reason[] = [];

    constructor(
        private _masterService: MasterService,
        private _supportDeskService: SupportDeskService,
        private _datePipe: DatePipe,
        private _router: Router,
        public snackBar: MatSnackBar,
        private dialog: MatDialog,
        private _formBuilder: FormBuilder) {
        this.authenticationDetails = new AuthenticationDetails();
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.IsProgressBarVisibile = false;
        this.SelectedSupportMaster = new SupportMaster();
        this.SelectedSupportMasterView = new SupportMasterView();
        this.SelectedReasonCode = null;
        this.Reasons = [{
            'ReasonCode': '1234',
            'ReasonText': 'Test1'
        },
        {
            'ReasonCode': '1235',
            'ReasonText': 'Test2'
        }];
    }

    ngOnInit(): void {
        // Retrive authorizationData
        const retrievedObject = localStorage.getItem('authorizationData');
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
            this.currentUserID = this.authenticationDetails.UserID;
            this.currentUserName = this.authenticationDetails.UserName;
            this.currentUserRole = this.authenticationDetails.UserRole;
            this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
            // if (this.MenuItems.indexOf('SupportMaster') < 0) {
            //     this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
            //     );
            //     this._router.navigate(['/auth/login']);
            // }

        } else {
            this._router.navigate(['/auth/login']);
        }
        this.InitializeSupportMasterFormGroup();
        this.GetSupportMasters();
        this.GetSupportDeskUsersByRoleName();
    }

    InitializeSupportMasterFormGroup(): void {
        this.SupportMasterFormGroup = this._formBuilder.group({
            ReasonCode: ['', Validators.required],
            ReasonText: ['', Validators.required],
            Client: ['', Validators.required],
            // PatnerID: ['', Validators.required],
            // Person1: ['', Validators.required],
            // Person2: ['', Validators.required]
        });
    }

    ResetControl(): void {
        this.SelectedSupportMaster = new SupportMaster();
        this.SelectedSupportMasterView = new SupportMasterView();
        this.SelectedReasonCode = null;
        this.ResetSupportMasterFormGroup();
    }

    ResetSupportMasterFormGroup(): void {
        this.ResetFormGroup(this.SupportMasterFormGroup);
    }

    ResetFormGroup(formGroup: FormGroup): void {
        formGroup.reset();
        Object.keys(formGroup.controls).forEach(key => {
            formGroup.get(key).enable();
            formGroup.get(key).markAsUntouched();
        });
    }

    GetSupportDeskUsersByRoleName(): void {
        this.IsProgressBarVisibile = true;
        this._masterService.GetSupportDeskUsersByRoleName('HelpDeskAdmin').subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                this.SupportDeskUsers = <UserWithRole[]>data;
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
            }
        );
    }

    GetSupportMasters(): void {
        this._supportDeskService.GetSupportMasters().subscribe(
            (data) => {
                this.SupportMasters = data as SupportMaster[];
                if (this.SupportMasters && this.SupportMasters.length) {
                    this.LoadSelectedSupportMaster(this.SupportMasters[0]);
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }

    GetSupportMastersByPartnerID(): void {
        this._supportDeskService.GetSupportMastersByPartnerID(this.authenticationDetails.UserName).subscribe(
            (data) => {
                this.SupportMasters = data as SupportMaster[];
                if (this.SupportMasters && this.SupportMasters.length) {
                    this.LoadSelectedSupportMaster(this.SupportMasters[0]);
                }
            },
            (err) => {
                console.error(err);
            }
        );
    }

    LoadSelectedSupportMaster(seletedSupportMaster: SupportMaster): void {
        this.SelectedSupportMaster = seletedSupportMaster;
        this.SelectedSupportMasterView.ReasonCode = this.SelectedSupportMaster.ReasonCode;
        this.SelectedReasonCode = this.SelectedSupportMaster.ReasonCode;
        this.SetSupportMasterValues();
    }

    SetSupportMasterValues(): void {
        this.SupportMasterFormGroup.get('ReasonCode').patchValue(this.SelectedSupportMaster.ReasonCode);
        this.SupportMasterFormGroup.get('ReasonText').patchValue(this.SelectedSupportMaster.ReasonText);
        this.SupportMasterFormGroup.get('Client').patchValue(this.SelectedSupportMaster.Client);
        // this.SupportMasterFormGroup.get('PatnerID').patchValue(this.SelectedSupportMaster.PatnerID);
        // this.SupportMasterFormGroup.get('Person1').patchValue(this.SelectedSupportMaster.Person1);
        // this.SupportMasterFormGroup.get('Person2').patchValue(this.SelectedSupportMaster.Person2);
    }

    GetSupportMasterValues(): void {
        this.SelectedSupportMaster.ReasonCode = this.SelectedSupportMasterView.ReasonCode = this.SupportMasterFormGroup.get('ReasonCode').value;
        this.SelectedSupportMaster.ReasonText = this.SelectedSupportMasterView.ReasonText = this.SupportMasterFormGroup.get('ReasonText').value;
        this.SelectedSupportMaster.Client = this.SelectedSupportMasterView.Client = this.SupportMasterFormGroup.get('Client').value;
        // this.SelectedSupportMaster.PatnerID = this.SelectedSupportMasterView.PatnerID = this.SupportMasterFormGroup.get('PatnerID').value;
        // this.SelectedSupportMaster.Person1 = this.SelectedSupportMasterView.Person1 = this.SupportMasterFormGroup.get('Person1').value;
        // this.SelectedSupportMaster.Person2 = this.SelectedSupportMasterView.Person2 = this.SupportMasterFormGroup.get('Person2').value;
    }

    SaveClicked(): void {
        if (this.SupportMasterFormGroup.valid) {
            this.GetSupportMasterValues();
            this.SetActionToOpenConfirmation('Save');
        } else {
            this.ShowValidationErrors(this.SupportMasterFormGroup);
        }
    }

    UpdateClicked(): void {
        if (this.SupportMasterFormGroup.valid) {
            this.GetSupportMasterValues();
            this.SetActionToOpenConfirmation('Update');
        } else {
            this.ShowValidationErrors(this.SupportMasterFormGroup);
        }
    }

    DeleteClicked(): void {
        if (this.SelectedSupportMaster.ReasonCode) {
            const Actiontype = 'Delete';
            const Catagory = 'SupportMaster';
            this.OpenConfirmationDialog(Actiontype, Catagory);
        }
    }

    SetActionToOpenConfirmation(Actiontype: string): void {
        const Catagory = 'SupportMaster';
        this.OpenConfirmationDialog(Actiontype, Catagory);
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
                    if (Actiontype === 'Save') {
                        this.CreateSupportMaster(Actiontype);
                    }
                    else if (Actiontype === 'Update') {
                        if (this.SelectedSupportMaster.ReasonCode) {
                            this.UpdateSupportMaster(Actiontype);
                        }
                    } else if (Actiontype === 'Delete') {
                        this.DeleteSupportMaster();
                    }
                }
            });
    }

    CreateSupportMaster(Actiontype: string): void {
        this.IsProgressBarVisibile = true;
        this.SelectedSupportMasterView.CreatedBy = this.authenticationDetails.UserName;
        this._supportDeskService.CreateSupportMaster(this.SelectedSupportMasterView).subscribe(
            (data) => {
                // this.SelectedSupportMaster.ID = (data as SupportMaster).ID;
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar(`SupportMaster ${Actiontype === 'Update' ? 'updated' : 'saved'} successfully`, SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                this.GetSupportMasters();
            },
            (err) => {
                this.showErrorNotificationSnackBar(err);
            }
        );
    }

    UpdateSupportMaster(Actiontype: string): void {
        this.IsProgressBarVisibile = true;
        this.SelectedSupportMasterView.ModifiedBy = this.authenticationDetails.UserName;
        this._supportDeskService.UpdateSupportMaster(this.SelectedSupportMasterView).subscribe(
            (data) => {
                // this.SelectedSupportMaster.ID = (data as SupportMaster).ID;
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar(`SupportMaster ${Actiontype === 'Update' ? 'updated' : 'saved'} successfully`, SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                this.GetSupportMasters();
            },
            (err) => {
                console.error(err);
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                this.IsProgressBarVisibile = false;
            }
        );
    }

    DeleteSupportMaster(): void {
        this.GetSupportMasterValues();
        this.IsProgressBarVisibile = true;
        this._supportDeskService.DeleteSupportMaster(this.SelectedSupportMaster).subscribe(
            (data) => {
                this.ResetControl();
                this.notificationSnackBarComponent.openSnackBar('SupportMaster deleted successfully', SnackBarStatus.success);
                this.IsProgressBarVisibile = false;
                this.GetSupportMasters();
            },
            (err) => {
                console.error(err);
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                this.IsProgressBarVisibile = false;
            }
        );
    }

    Developer1Selected(event): void {

    }

    Developer2Selected(event): void {

    }

    ReasonSelected(event): void {

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

    showErrorNotificationSnackBar(err: any): void {
        console.error(err);
        this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
        this.IsProgressBarVisibile = false;
    }

    calculateDiff(sentDate): number {
        const dateSent: Date = new Date(sentDate);
        const currentDate: Date = new Date();
        return Math.floor((Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate()) -
            Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate())) / (1000 * 60 * 60 * 24));
    }

    decimalOnly(event): boolean {
        // this.AmountSelected();
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

}

