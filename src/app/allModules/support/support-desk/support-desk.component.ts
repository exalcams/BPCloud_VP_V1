import { Component, OnInit, ViewChild, ViewEncapsulation, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar } from '@angular/material';
import { HelpDeskAdminDetails, SupportHeader, SupportHeaderView, SupportMaster } from 'app/models/support-desk';
import { SupportDeskService } from 'app/services/support-desk.service';
import { AuthenticationDetails } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { fuseAnimations } from '@fuse/animations';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { Router, ActivatedRoute } from '@angular/router';
import { FuseConfigService } from '@fuse/services/config.service';
import { ActionLog } from 'app/models/OrderFulFilment';
import { AuthService } from 'app/services/auth.service';
import * as SecureLS from 'secure-ls';
import { MasterService } from 'app/services/master.service';
@Component({
  selector: 'app-support-desk',
  templateUrl: './support-desk.component.html',
  styleUrls: ['./support-desk.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})

export class SupportDeskComponent implements OnInit {
  BGClassName: any;
  fuseConfig: any;
  // private paginator: MatPaginator; private sort: MatSort;
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserRole: string;
  menuItems: string[];
  partnerID: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  isProgressBarVisibile1: boolean;
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

  Plants: string[] = [];
  supportMasters: SupportMaster[] = [];
  isSupport: boolean;
  ActionLog: any;
  currentUserName: string;
  SecretKey: string;
  SecureStorage: SecureLS;

  constructor(
    private _fuseConfigService: FuseConfigService,
    public _supportdeskService: SupportDeskService,
    private _authService: AuthService,
    public snackBar: MatSnackBar,
    private _masterService: MasterService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.partnerID = '';
    this.isSupport = false;
  }


  ngOnInit(): void {
    this.SetUserPreference();
    const retrievedObject = this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.currentUserName = this.authenticationDetails.UserName;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.menuItems.indexOf('SupportDesk') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
      this.GetSupportMasters();
      this.GetSupportTicketsByPartnerIDAndRole();
    } else {
      this._router.navigate(['/auth/login']);
    }
    this._activatedRoute.queryParams.subscribe(params => {
      this.docRefNo = params['id'];
    });
    // this.LoadBotChat();
  }
  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }

  LoadBotChat(): void {
    // (function (d, m) {
    //   var kommunicateSettings = { "appId": "10fd8a0b153726753ff1ad51af63846ce", "popupWidget": true, "automaticChatOpenOnNavigation": true };
    //   var s = document.createElement("script"); s.type = "text/javascript"; s.async = true;
    //   s.src = "https://api.kommunicate.io/v2/kommunicate.app";
    //   var h = document.getElementsByTagName("head")[0]; h.appendChild(s);
    //   (window as any).kommunicate = m; m._globals = kommunicateSettings;
    // })(document, (window as any).kommunicate || {});
    // (function (d, m) {
    //   var kommunicateSettings = { "appId": "10fd8a0b153726753ff1ad51af63846ce", "popupWidget": true, "automaticChatOpenOnNavigation": true };
    //   var s = document.createElement("script"); s.type = "text/javascript"; s.async = true;
    //   s.src = "https://api.kommunicate.io/v2/kommunicate.app";
    //   var h = document.getElementsByTagName("head")[0]; h.appendChild(s);
    //   (window as any).kommunicate = m; m._globals = kommunicateSettings;
    // })(document, (window as any).kommunicate || {});
  }

  loadSupportDeskBasedOnCondition(): void {
    if (this.docRefNo) {
      this._router.navigate(['/support/supportticket'], { queryParams: { DocRefNo: this.docRefNo } });
    }
    else {
      this.GetSupportMasters();
      this.GetSupportTicketsByPartnerIDAndRole();
    }
  }
  GetSupportTicketsByPartnerIDAndRole(): void {
    const rolName = this.authenticationDetails.UserRole;
    if ((rolName && rolName.includes("Help Desk") || rolName.includes("HelpDesk"))) {
      this.GetHelpDeskAdminPlants();
    } else {
      this.GetSupportTicketsByPartnerID();
    }

  }
  GetHelpDeskAdminPlants(): void {
    this._masterService
      .GetHelpDeskAdminPlants(this.currentUserID)
      .subscribe((data) => {
        if (data) {
          this.Plants = data as string[];
        } else {
          this.Plants = ['1000'];
        }
        this.GetHelpDeskAdminSupportTickets();
      },
        (err) => {
          console.error(err);
        });
  }

  GetHelpDeskAdminSupportTickets(): void {
    const helpDeskAdminDetails: HelpDeskAdminDetails = new HelpDeskAdminDetails();
    helpDeskAdminDetails.PatnerID = this.authenticationDetails.UserName;
    if (this.Plants && this.Plants.length) {
      this.Plants.forEach(x => {
        helpDeskAdminDetails.Plants.push(x);
      });
    } else {
      helpDeskAdminDetails.Plants = ['1000'];
    }
    this.isProgressBarVisibile = true;
    this._supportdeskService
      .GetHelpDeskAdminSupportTickets(helpDeskAdminDetails)
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

  GetSupportTicketsByPartnerID(): void {
    this.isProgressBarVisibile = true;
    this._supportdeskService
      .GetSupportTicketsByPartnerID(this.authenticationDetails.UserName)
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
    this.isProgressBarVisibile1 = true;
    this._supportdeskService
      .GetSupportMasters()
      .subscribe((data) => {
        if (data) {
          this.supportMasters = <SupportMaster[]>data;
        }
        this.isProgressBarVisibile1 = false;
      },
        (err) => {
          console.error(err);
          this.isProgressBarVisibile1 = false;
        });
  }

  addSupportTicketClicked(): void {
    this.CreateActionLogvalues("Add Support Ticket");
    this._router.navigate(['/support/supportticket']);
  }

  onSupportRowClicked(row: any): void {
    // this.CreateActionLogvalues("SupportRow");
    this._router.navigate(['/support/supportchat'], { queryParams: { SupportID: row.SupportID } });
  }
  CreateActionLogvalues(text): void {
    this.ActionLog = new ActionLog();
    this.ActionLog.UserID = this.currentUserID;
    this.ActionLog.AppName = "SupportDesk";
    this.ActionLog.ActionText = text + " is Clicked";
    this.ActionLog.Action = text;
    this.ActionLog.CreatedBy = this.currentUserName;
    this._authService.CreateActionLog(this.ActionLog).subscribe(
      (data) => {
        // console.log(data);
      },
      (err) => {
        console.error(err);
      }
    );
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
