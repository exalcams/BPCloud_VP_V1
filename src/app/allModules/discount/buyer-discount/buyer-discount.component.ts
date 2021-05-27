import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatMenuTrigger, MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { FuseConfigService } from '@fuse/services/config.service';
import { AuthenticationDetails } from 'app/models/master';
import { BPCPayDis } from 'app/models/Payment.model';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { DiscountService } from 'app/services/discount.service';
import { MasterService } from 'app/services/master.service';
import { Guid } from 'guid-typescript';
import { DiscountDialogueComponent } from '../discount-dialogue/discount-dialogue.component';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-buyer-discount',
  templateUrl: './buyer-discount.component.html',
  styleUrls: ['./buyer-discount.component.scss']
})
export class BuyerDiscountComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  BGClassName: any;
  fuseConfig: any;
  BuyerDiscountData: BPCPayDis[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  BuyerDiscDisplayedColumns = ["PartnerID", "InvoiceNumber", "InvoiceDate", "DocumentNumber", "DocumentDate", "PaidAmount",
    "BalanceAmount", "PostDiscountAmount", "DueDate", "ProfitCenter", "Proceed"];
  BuyerDiscDataSource: MatTableDataSource<BPCPayDis>;
  @ViewChild(MatPaginator) discountPaginator: MatPaginator;
  @ViewChild(MatSort) discountSort: MatSort;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  isProgressBarVisibile: boolean;
  Plants: string[] = [];
  SecretKey: string;
    SecureStorage: SecureLS;
  constructor(
    private _discountService: DiscountService,
    private _masterService: MasterService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    private _fuseConfigService: FuseConfigService,
    private _router: Router,
    private _authService: AuthService,

  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.isProgressBarVisibile = false;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject =  this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      // if (this.MenuItems.indexOf('ASN') < 0) {
      //     this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //     );
      //     this._router.navigate(['/auth/login']);
      // }

    } else {
      this._router.navigate(['/auth/login']);
    }
    this.SetUserPreference();
    this.GetBuyerPlants();
    // this.GetTableData();
  }

  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }
  GetBuyerPlants(): void {
    this._masterService
      .GetBuyerPlants(this.currentUserID)
      .subscribe((data) => {
        if (data) {
          this.Plants = data as string[];
          this.GetTableData();
        }
        
      },
        (err) => {
          console.error(err);
        });
  }

  GetTableData(): void {
    this.isProgressBarVisibile = true;
    this._discountService.GetBPCPayDiscountByPlants(this.Plants).subscribe(data => {
      // console.log(data);
      this.BuyerDiscountData = data;
      this.BuyerDiscDataSource = new MatTableDataSource(this.BuyerDiscountData);
      this.BuyerDiscDataSource.paginator = this.discountPaginator;
      this.BuyerDiscDataSource.sort = this.discountSort;
      this.isProgressBarVisibile = false;
    }, err => {

    });
  }

  handleProceed(item): void {
    this.OpenProceedeDialogue(item);
  }

  OpenProceedeDialogue(Data: any): void {
    Data.isBuyer = true;
    const dialogConfig: MatDialogConfig = {
      panelClass: 'discount-dialog',
      data: Data
    };
    const dialogRef = this.dialog.open(DiscountDialogueComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        console.log(result);
        if (result.Status === "Accepted") {
          result.ApprovedBy = this.currentUserName;
          this.ApproveDiscount(result);
          // console.log(result);
        }
        else if (result.Status === "Rejected") {
          this.RejectDiscount(result);
        }
      });
  }
  ApproveDiscount(data: BPCPayDis): void {
    this.isProgressBarVisibile = true;
    this._discountService.ApproveBPCPayDiscount(data).subscribe(x => {
      this.isProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar('Discount Approved', SnackBarStatus.success);

    },
      err => {
        console.log(err);
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar("something went wrong", SnackBarStatus.danger);

      });
  }
  RejectDiscount(data: BPCPayDis): void {
    this.isProgressBarVisibile = true;
    this._discountService.RejecteBPCPayDiscount(data).subscribe(x => {
      this.isProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar('Discount Rejected', SnackBarStatus.success);
    },
      err => {
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar("something went wrong", SnackBarStatus.danger);
      });
  }

}
