import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationDetails } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SupportHeader, SupportHeaderView, SupportMaster } from 'app/models/support-desk';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { SupportDeskService } from 'app/services/support-desk.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { MasterService } from 'app/services/master.service';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-support-desk',
  templateUrl: './support-desk.component.html',
  styleUrls: ['./support-desk.component.scss']
})
export class SupportDeskComponent implements OnInit {

  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserRole: string;
  CurrentUserName: string;
  Plant: string;
  menuItems: string[];
  partnerID: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  docRefNo: any;
  supports: SupportHeaderView[] = [];
  selectedSupport: SupportHeader = new SupportHeader();
  supportDisplayedColumns: string[] = [
    'SupportID',
    'Reason',
    'Date',
    'Status',
  ];
  supportDataSource: MatTableDataSource<SupportHeaderView>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  supportMasters: SupportMaster[] = [];
  isSupport: boolean;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _authService: AuthService,
    private _masterService: MasterService,
    public _supportdeskService: SupportDeskService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _activatedRoute: ActivatedRoute) {
      this.SecretKey = this._authService.SecretKey;
      this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.partnerID = '';
    this.isSupport = false;
  }


  ngOnInit(): void {
    const retrievedObject =this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.CurrentUserName = this.authenticationDetails.UserName;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.menuItems.indexOf('BuyerSupportDesk') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
      this.GetSupportMasters();
      this.GetBuyerPlant();
      // this.GetBuyerSupportTickets();
    } else {
      this._router.navigate(['/auth/login']);
    }
    this._activatedRoute.queryParams.subscribe(params => {
      this.docRefNo = params['id'];
    });
  }

  loadSupportDeskBasedOnCondition(): void {
    if (this.docRefNo) {
      this._router.navigate(['/buyer/supportticket'], { queryParams: { DocRefNo: this.docRefNo } });
    }
    else {
      this.GetSupportMasters();
      this.GetBuyerPlant();
      // this.GetBuyerSupportTickets();
    }
  }

  // GetSupportTicketsByPartnerIDAndType(): void {
  //   this.isProgressBarVisibile = true;
  //   this._supportdeskService
  //     .GetSupportTicketsByPartnerIDAndType(this.authenticationDetails.UserName, 'B')
  //     .subscribe((data) => {
  //       if (data) {
  //         this.supports = <SupportHeaderView[]>data;
  //         if (this.supports && this.supports.length === 0) {
  //           this.isSupport = true;
  //         }
  //         this.supportDataSource = new MatTableDataSource(this.supports);
  //         this.supportDataSource.paginator = this.paginator;
  //         this.supportDataSource.sort = this.sort;
  //       }
  //       this.isProgressBarVisibile = false;
  //     },
  //       (err) => {
  //         console.error(err);
  //         this.isProgressBarVisibile = false;
  //       });
  // }
  GetBuyerPlant(): void {
    this._masterService
      .GetBuyerPlant(this.currentUserID)
      .subscribe((data) => {
        if (data) {
          this.Plant = data as string;
        } else {
          this.Plant = '1000';
        }
        this.GetBuyerSupportTickets();
      },
        (err) => {
          console.error(err);
        });
  }
  GetBuyerSupportTickets(): void {
    this.isProgressBarVisibile = true;
    this._supportdeskService
      .GetBuyerSupportTickets(this.CurrentUserName, this.Plant)
      .subscribe((data) => {
        if (data) {
          this.supports = <SupportHeaderView[]>data;
          if (this.supports && this.supports.length === 0) {
            this.isSupport = true;
          }
          this.supportDataSource = new MatTableDataSource(this.supports);
          this.supportDataSource.paginator = this.paginator;
          this.supportDataSource.sort = this.sort;
        }
        this.isProgressBarVisibile = false;
      },
        (err) => {
          console.error(err);
          this.isProgressBarVisibile = false;
        });
  }

  GetSupportMasters(): void {
    this.isProgressBarVisibile = true;
    this._supportdeskService
      .GetSupportMasters()
      .subscribe((data) => {
        if (data) {
          this.supportMasters = <SupportMaster[]>data;
        }
        this.isProgressBarVisibile = false;
      },
        (err) => {
          console.error(err);
          this.isProgressBarVisibile = false;
        });
  }

  addSupportTicketClicked(): void {
    this._router.navigate(['/buyer/supportticket']);
  }

  onSupportRowClicked(row: any): void {
    this._router.navigate(['/buyer/supportchat'], { queryParams: { SupportID: row.SupportID } });
  }
  getStatusColor(status): string {
    if (status) {
      switch (status) {
        case 'Open':
          return '#000000';
        case 'Resolved':
          return '#2605a8';
        case 'ReOpen':
          return '#efb577';
        case 'Closed':
          return '#34ad65';
        default:
          return '#000000';
      }
    }
    return '#000000';
  }
}
