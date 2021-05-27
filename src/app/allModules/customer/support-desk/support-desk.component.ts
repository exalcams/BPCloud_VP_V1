import { Component, OnInit, ViewChild } from '@angular/core';
import { AuthenticationDetails } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SupportHeader, SupportMaster } from 'app/models/support-desk';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { SupportDeskService } from 'app/services/support-desk.service';
import { Router, ActivatedRoute } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'cust-support-desk',
  templateUrl: './support-desk.component.html',
  styleUrls: ['./support-desk.component.scss']
})
export class SupportDeskComponent implements OnInit {

  // private paginator: MatPaginator; private sort: MatSort;
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserRole: string;
  menuItems: string[];
  partnerID: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  docRefNo: any;
  supports: SupportHeader[] = [];
  selectedSupport: SupportHeader = new SupportHeader();
  supportDisplayedColumns: string[] = [
    'Reason',
    'Date',
    'Status',
    'AssignTo',
  ];
  supportDataSource: MatTableDataSource<SupportHeader>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  supportMasters: SupportMaster[] = [];
  isSupport: boolean;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    public _supportdeskService: SupportDeskService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _activatedRoute: ActivatedRoute,
    private _authService: AuthService,
    ) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.partnerID = '';
    this.isSupport = false;
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
  }


  ngOnInit(): void {
    const retrievedObject =this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.menuItems.indexOf('CustomerSupportDesk') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
      this.GetSupportMasters();
      this.GetSupportTicketsByPartnerIDAndType();
    } else {
      this._router.navigate(['/auth/login']);
    }
    this._activatedRoute.queryParams.subscribe(params => {
      this.docRefNo = params['id'];
    });
  }

  loadSupportDeskBasedOnCondition(): void {
    if (this.docRefNo) {
      this._router.navigate(['/customer/supportticket'], { queryParams: { DocRefNo: this.docRefNo } });
    }
    else {
      this.GetSupportMasters();
      this.GetSupportTicketsByPartnerIDAndType();
    }
  }

  GetSupportTicketsByPartnerIDAndType(): void {
    this.isProgressBarVisibile = true;
    this._supportdeskService
      .GetSupportTicketsByPartnerIDAndType(this.authenticationDetails.UserName, 'C')
      .subscribe((data) => {
        if (data) {
          this.supports = <SupportHeader[]>data;
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
    this._router.navigate(['/customer/supportticket']);
  }

  onSupportRowClicked(row: any): void {
    this._router.navigate(['/customer/supportchat'], { queryParams: { SupportID: row.SupportID } });
  }
}
