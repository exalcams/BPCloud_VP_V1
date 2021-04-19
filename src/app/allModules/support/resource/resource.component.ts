import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import {
    MatTableDataSource,
    MatPaginator,
    MatSort,
    MatSnackBar,
} from "@angular/material";
import { fuseAnimations } from "@fuse/animations";
import { ReportService } from "app/services/report.service";
import { AuthenticationDetails } from "app/models/master";
import { Guid } from "guid-typescript";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { FormGroup, FormBuilder, FormArray } from "@angular/forms";
import { Router } from "@angular/router";
import { ExcelService } from "app/services/excel.service";
import { DatePipe } from "@angular/common";
import { SnackBarStatus } from "app/notifications/notification-snack-bar/notification-snackbar-status-enum";
import { FuseConfigService } from '@fuse/services/config.service';

@Component({
    selector: "app-resource",
    templateUrl: "./resource.component.html",
    styleUrls: ["./resource.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class ResourceComponent implements OnInit {
    BGClassName: any;
  fuseConfig: any;
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserRole: string;
    menuItems: string[];
    notificationSnackBarComponent: NotificationSnackBarComponent;
    isProgressBarVisibile: boolean;
    // PaymentDataSource: MatTableDataSource<BPCPayment>;
    // AllPayments: BPCPayment[] = [];
    // PaymentDisplayedColumns: string[] = [
    //   "PaymentDoc",
    //   "Date",
    //   "Amount",
    //   "Attachment",
    //   "Remark",
    // ];
    // @ViewChild(MatPaginator) paginator: MatPaginator;
    // @ViewChild(MatSort) sort: MatSort;
    // SearchFormGroup: FormGroup;
    isDateError: boolean;
    searchText = "";
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        public snackBar: MatSnackBar,
        private _reportService: ReportService,
        private _excelService: ExcelService,
        private _datePipe: DatePipe
    ) { }

    ngOnInit(): void {
        this.SetUserPreference();
        const retrievedObject = localStorage.getItem("authorizationData");
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(
                retrievedObject
            ) as AuthenticationDetails;
            this.currentUserID = this.authenticationDetails.UserID;
            this.currentUserRole = this.authenticationDetails.UserRole;
            this.menuItems = this.authenticationDetails.MenuItemNames.split(
                ","
            );
            if (this.menuItems.indexOf("Resource") < 0) {
                this.notificationSnackBarComponent.openSnackBar(
                    "You do not have permission to visit this page",
                    SnackBarStatus.danger
                );
                this._router.navigate(["/auth/login"]);
            }
        } else {
            this._router.navigate(["/auth/login"]);
        }
        // this.InitializeSearchFormGroup();
        // this.GetAllPayments();
    }
    SetUserPreference(): void {
        this._fuseConfigService.config
            .subscribe((config) => {
                this.fuseConfig = config;
                this.BGClassName = config;
            });
        // this._fuseConfigService.config = this.fuseConfig;
    }

    // InitializeSearchFormGroup(): void {
    //   this.SearchFormGroup = this._formBuilder.group({
    //     FromDate: [''],
    //     ToDate: [''],
    //   });
    // }
    // ResetControl(): void {
    //   this.AllPayments = [];
    //   this.ResetFormGroup(this.SearchFormGroup);
    // }
    // ResetFormGroup(formGroup: FormGroup): void {
    //   formGroup.reset();
    //   Object.keys(formGroup.controls).forEach(key => {
    //     formGroup.get(key).enable();
    //     formGroup.get(key).markAsUntouched();
    //   });
    // }

    // GetAllPayments(): void {
    //   this.isProgressBarVisibile = true;
    //   this._reportService.GetAllPayments().subscribe(
    //     (data) => {
    //       this.AllPayments = data as BPCPayment[];
    //       this.PaymentDataSource = new MatTableDataSource(this.AllPayments);
    //       this.PaymentDataSource.paginator = this.paginator;
    //       this.PaymentDataSource.sort = this.sort;
    //       this.isProgressBarVisibile = false;
    //     },
    //     (err) => {
    //       console.error(err);
    //       this.isProgressBarVisibile = false;
    //     }
    //   );

    // }

    // SearchClicked(): void {
    //   if (this.SearchFormGroup.valid) {
    //     if (!this.isDateError) {
    //       const FrDate = this.SearchFormGroup.get('FromDate').value;
    //       let FromDate = '';
    //       if (FrDate) {
    //         FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
    //       }
    //       const TDate = this.SearchFormGroup.get('ToDate').value;
    //       let ToDate = '';
    //       if (TDate) {
    //         ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
    //       }
    //       this.isProgressBarVisibile = true;
    //       this._reportService.GetFilteredPayments(FromDate, ToDate).subscribe(
    //         (data) => {
    //           this.AllPayments = data as BPCPayment[];
    //           this.PaymentDataSource = new MatTableDataSource(this.AllPayments);
    //           this.PaymentDataSource.paginator = this.paginator;
    //           this.PaymentDataSource.sort = this.sort;
    //           this.isProgressBarVisibile = false;
    //         },
    //         (err) => {
    //           console.error(err);
    //           this.isProgressBarVisibile = false;
    //         }
    //       );
    //     }
    //   } else {
    //     this.ShowValidationErrors(this.SearchFormGroup);
    //   }
    // }

    // DateSelected(): void {
    //   const FROMDATEVAL = this.SearchFormGroup.get('FromDate').value as Date;
    //   const TODATEVAL = this.SearchFormGroup.get('ToDate').value as Date;
    //   if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
    //     this.isDateError = true;
    //   } else {
    //     this.isDateError = false;
    //   }
    // }

    // ShowValidationErrors(formGroup: FormGroup): void {
    //   Object.keys(formGroup.controls).forEach(key => {
    //     if (!formGroup.get(key).valid) {
    //       console.log(key);
    //     }
    //     formGroup.get(key).markAsTouched();
    //     formGroup.get(key).markAsDirty();
    //     if (formGroup.get(key) instanceof FormArray) {
    //       const FormArrayControls = formGroup.get(key) as FormArray;
    //       Object.keys(FormArrayControls.controls).forEach(key1 => {
    //         if (FormArrayControls.get(key1) instanceof FormGroup) {
    //           const FormGroupControls = FormArrayControls.get(key1) as FormGroup;
    //           Object.keys(FormGroupControls.controls).forEach(key2 => {
    //             FormGroupControls.get(key2).markAsTouched();
    //             FormGroupControls.get(key2).markAsDirty();
    //             if (!FormGroupControls.get(key2).valid) {
    //               console.log(key2);
    //             }
    //           });
    //         } else {
    //           FormArrayControls.get(key1).markAsTouched();
    //           FormArrayControls.get(key1).markAsDirty();
    //         }
    //       });
    //     }
    //   });

    // }

    onFAQClicked(): void {
        this._router.navigate(["support/faq"]);
    }

    onArticlesClicked(): void {
        // this._router.navigate(["/pages/improvement"]);
    }
}

