import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogConfig, MatMenuTrigger, MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { BalanceConfirmationHeader, BalanceConfirmationItem, ConfirmationDetails } from 'app/models/BalanceConfirmation';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { BalanceConfirmationService } from 'app/services/balance-confirmation.service';
import { ExcelService } from 'app/services/excel.service';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-balance-confirmation',
  templateUrl: './balance-confirmation.component.html',
  styleUrls: ['./balance-confirmation.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class BalanceConfirmationComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  confirmationDetails: ConfirmationDetails;
  isProgressBarVisibile: boolean;
  isAccepted: boolean = false;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  fuseConfig: any;
  @ViewChild(MatPaginator) balanceConfirmationPaginator: MatPaginator;
  @ViewChild(MatSort) balanceConfirmationSort: MatSort;
  @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
  BGClassName: any;
  BCHeader: BalanceConfirmationHeader;
  BCItems: BalanceConfirmationItem[];
  balanceConfirmationDataSource: MatTableDataSource<BalanceConfirmationItem>;
  balanceConfirmationDisplayedColumns = ["FiscalYear", "DocNumber", "DocDate", "InvoiceNumber", "InvoiceAmount", "BillAmount", "PaidAmont",
   "TDSAmount", "TotalPaidAmount", "DownPayment", "NetDueAmount", "Currency", "BalDate"];
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _bcService: BalanceConfirmationService,
    private _excelService: ExcelService,
    private _datePipe: DatePipe,
    public snackBar: MatSnackBar,
    private _router: Router,
    private dialog: MatDialog,
  ) {
    this.isProgressBarVisibile = false;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.confirmationDetails = new ConfirmationDetails();
    this.BCHeader = new BalanceConfirmationHeader();
  }

  ngOnInit(): void {
    this.isProgressBarVisibile = true;
    this.SetUserPreference();
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
    this.GetHeader();
    this.GetBCTableData();
  }

  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }

  GetHeader(): void {
    this._bcService.GetCurrentBCHeader().subscribe((data: BalanceConfirmationHeader) => {
      this.BCHeader = data;
    });
  }

  GetBCTableData(): void {
    this._bcService.GetCurrentBCItemsByPeroid().subscribe((data: BalanceConfirmationItem[]) => {
      this.BCItems = data;
      this.balanceConfirmationDataSource = new MatTableDataSource(this.BCItems);
      this.balanceConfirmationDataSource.paginator = this.balanceConfirmationPaginator;
      this.balanceConfirmationDataSource.sort = this.balanceConfirmationSort;
      this.isProgressBarVisibile = false;
      // console.log(data);
    },
    (err)=>{
      this.isProgressBarVisibile=false;
    });
  }

  exportAsXLSX(): void {
    const currentPageIndex = this.balanceConfirmationDataSource.paginator.pageIndex;
    const PageSize = this.balanceConfirmationDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.BCItems.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Period': x.FiscalYear,
        'DocNumber': x.DocNumber,
        'DocDate': x.DocDate ? this._datePipe.transform(x.DocDate, 'dd-MM-yyyy') : '',
        'InvoiceNumber': x.InvoiceNumber,
        'InvoiceAmount': x.InvoiceAmount,
        'BillAmount':x.BillAmount,
        'PaidAmount': x.PaidAmont,
        'TDSAmount': x.TDSAmount,
        'TotalPaidAmount': x.TotalPaidAmount,
        'DownPayment': x.DownPayment,
        'NetDueAmount': x.NetDueAmount,
        'Currency': x.Currency,
        'BalDate': x.BalDate,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'BalanceConfirmation');
  }

  handle_getsolved(): void {
    this._router.navigate(["/support/supportticket"], {
      queryParams: { period: this.BCHeader.FiscalYear },
    });
  }
  handle_accept(): void {
    // console.log(this.isAccepted);
    if (this.BCHeader.Status !== 'Accepted') {
      this.OpenConfirmationDialog('Confirm', 'Balance');
    } else {
      this.notificationSnackBarComponent.openSnackBar('Sorry! Details have been confirmed already', SnackBarStatus.danger);
    }
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
          this.AcceptBC();
        }
      });
  }

  AcceptBC(): void {
    this.confirmationDetails = new ConfirmationDetails();
    this.confirmationDetails.ConfirmedBy = this.currentUserName;
    this._bcService.AcceptBC(this.confirmationDetails).subscribe(x => {
      this.notificationSnackBarComponent.openSnackBar('Balance Confirmed', SnackBarStatus.success);
    }, err => {
      this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    });
  }
}
