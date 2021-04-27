import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogConfig, MatMenuTrigger, MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { FuseConfigService } from '@fuse/services/config.service';
import { AuthenticationDetails } from 'app/models/master';
import { ActionLog } from 'app/models/OrderFulFilment';
import { BPCPayAccountStatement, BPCPayDis } from 'app/models/Payment.model';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { DiscountService } from 'app/services/discount.service';
import { Guid } from 'guid-typescript';
import { DiscountDialogueComponent } from '../discount-dialogue/discount-dialogue.component';

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss']
})
export class DiscountComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  BGClassName: any;
  fuseConfig: any;
  isProgressBarVisibile: boolean;
  discountDisplayedColumns = ["DocumentNumber", "DocumentDate", "InvoiceNumber", "InvoiceDate", "InvoiceAmount", "PaidAmount", "BalanceAmount",
    "DueDate", "ProfitCenter", "Discount"];
  discountDataSource: MatTableDataSource<BPCPayAccountStatement>;
  @ViewChild(MatPaginator) discountPaginator: MatPaginator;
  @ViewChild(MatSort) discountSort: MatSort;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  AccountStatements: BPCPayAccountStatement[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  ActionLog: any;


  constructor(private dialog: MatDialog,
    private _discountService: DiscountService,
    private _router: Router,
    private _authService: AuthService,
    private _fuseConfigService: FuseConfigService,
    public snackBar: MatSnackBar) {
    this.isProgressBarVisibile = false;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  OpenCalculateDialogue(Data: any): void {
    Data.isBuyer = false;
    const dialogConfig: MatDialogConfig = {
      panelClass: 'discount-dialog',
      data: Data
    };
    const dialogRef = this.dialog.open(DiscountDialogueComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          this.SaveBPCPayDiscount(result);
          // console.log(result);
        }
      });
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
      // if (this.MenuItems.indexOf('ASN') < 0) {
      //     this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //     );
      //     this._router.navigate(['/auth/login']);
      // }

    } else {
      this._router.navigate(['/auth/login']);
    }
    this.SetUserPreference();
    this.GetTableData();
  }

  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }
  GetTableData(): void {
    this.isProgressBarVisibile = true;
    this._discountService.GetAccountStatementByPartnerID(this.currentUserName).subscribe((data) => {
      // console.log(data);
      this.AccountStatements = data;
      this.discountDataSource = new MatTableDataSource(this.AccountStatements);
      this.discountDataSource.paginator = this.discountPaginator;
      this.discountDataSource.sort = this.discountSort;
      this.isProgressBarVisibile = false;
    }, err => {
      this.isProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar("something went wrong", SnackBarStatus.danger);
    });
  }
  handleCalculate(item): void {
    // this.CreateActionLogvalues("Calculate");
    this.OpenCalculateDialogue(item);
  }

  SaveBPCPayDiscount(data: BPCPayDis): void {
    this.isProgressBarVisibile = true;
    data.CreatedBy = this.currentUserName;
    this._discountService.CreateBPCPayDiscount(data).subscribe(x => {
      this.isProgressBarVisibile = false;
      this.notificationSnackBarComponent.openSnackBar('Discount details saved', SnackBarStatus.success);
    },
      err => {
        console.log(err);
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar("something went wrong", SnackBarStatus.danger);
      });
  }
  CreateActionLogvalues(text): void {
    this.ActionLog = new ActionLog();
    this.ActionLog.UserID = this.currentUserID;
    this.ActionLog.AppName = "Invoice-discount";
    this.ActionLog.ActionText = text + " is Clicked";
    this.ActionLog.Action = text;
    this.ActionLog.CreatedBy = this.currentUserName;
    this._authService.CreateActionLog(this.ActionLog).subscribe(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
