import { Component, OnInit } from '@angular/core';
import { AuthenticationDetails, AppUsage } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SelectionModel } from '@angular/cdk/collections';
import { BPCAIACT, BPCFact } from 'app/models/fact';
import { FactService } from 'app/services/fact.service';
import { MasterService } from 'app/services/master.service';
import { DashboardService } from 'app/services/dashboard.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { TourComponent } from '../tour/tour.component';
import { FuseConfigService } from '@fuse/services/config.service';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';
import { ActionLog } from 'app/models/OrderFulFilment';
import { AuthService } from 'app/services/auth.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import * as SecureLS from 'secure-ls';
@Component({
  selector: 'app-action-center',
  templateUrl: './action-center.component.html',
  styleUrls: ['./action-center.component.scss']
})
export class ActionCenterComponent implements OnInit {

  fuseConfig: any;
  BGClassName: any;
  menuItems: string[];
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole = "";
  currentDisplayName: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  searchText = "";
  selectedPartnerID: string;
  selection = new SelectionModel<any>(true, []);
  todayDate: any;
  selectedFact: BPCFact;
  selectedAIACT: BPCAIACT;
  facts: BPCFact[] = [];
  actions: BPCAIACT[] = [];
  notifications: BPCAIACT[] = [];
  notificationCount: number;
  aIACTs: BPCAIACT[] = [];
  aIACTsView: BPCAIACT[] = [];
  SetIntervalID: any;
  fileToUpload1: File;
  fileToUpload2: File;
  fileToUploadList: File[] = [];
  AttachmentData1: SafeUrl;
  AttachmentData2: SafeUrl;
  ActionLog: any;

  Fatc_list: BPCFact[] = [];
  SecretKey: string;
  SecureStorage: SecureLS;
  default_Company: string;
  // TempActionData = [
  //   {
  //     PoNumber: '12345',
  //     Action: 'Accept',
  //     Time: '04:32 PM',
  //     Day: 'Today',
  //     Stage: 'PO'
  //   },
  //   {
  //     PoNumber: '56789',
  //     Action: 'View',
  //     Time: '04:32 PM',
  //     Day: 'Yesteday',
  //     Stage: 'Payment'
  //   },
  //   {
  //     PoNumber: '74838',
  //     Action: 'Ship',
  //     Time: '04:32 PM',
  //     Day: 'Today',
  //     Stage: 'PO'
  //   },
  //   {
  //     PoNumber: '12345',
  //     Action: 'View',
  //     Time: '04:32 PM',
  //     Day: 'Today',
  //     Stage: 'Support'
  //   }
  // ];
  constructor(
    private _fuseConfigService: FuseConfigService,

    private _factService: FactService,
    private _masterService: MasterService,
    private _dashboardService: DashboardService,
    private _authService: AuthService,
    private _router: Router,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    
  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.selectedFact = new BPCFact();

    this.selectedAIACT = new BPCAIACT();
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(
      this.snackBar
    );
    this.isProgressBarVisibile = false;
    this.todayDate = new Date().getDate();
  }

  ngOnInit(): void {
    this.SetUserPreference();

    const retrievedObject = this.SecureStorage.get("authorizationData");
    this.authenticationDetails = JSON.parse(
      retrievedObject
    ) as AuthenticationDetails;
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(
        retrievedObject
      ) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.currentDisplayName = this.authenticationDetails.DisplayName;
      this.menuItems = this.authenticationDetails.MenuItemNames.split(
        ","
      );
      if (this.menuItems.indexOf("Action Center") < 0) {
        this.notificationSnackBarComponent.openSnackBar(
          "You do not have permission to visit this page",
          SnackBarStatus.danger
        );
        this._router.navigate(["/auth/login"]);
      }
      this.CreateAppUsage();
      this.GetDashboardCard1();
      this.GetDashboardCard2();
      this.GetFactByPartnerIDAndType();
      this.GetActionsByPartnerID();
      this.GetNotificationsByPartnerID();
      // this.SetIntervalID = setInterval(() => {
      //   this.GetNotificationsByPartnerID();
      // }, 10000);
      // this.openTourScreenDialog();

      //   if (!this.authenticationDetails.TourStatus) {
      //       this.openTourScreenDialog();
      //   }
    } else {
      this._router.navigate(["/auth/login"]);
    }
  }
  getColor(stage): any {
    switch (stage) {
      case "01": return '#67c18b';

      case "04": return '#eb6767';

      case "05": return '#efb577';

    }
    console.log(stage);
  }
  openTourScreenDialog(): void {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.width = "50%";
    this.dialog.open(TourComponent, dialogConfig);
  }

  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = "Dashboard";
    appUsage.UsageCount = 1;
    appUsage.CreatedBy = this.currentUserName;
    appUsage.ModifiedBy = this.currentUserName;
    this._masterService.CreateAppUsage(appUsage).subscribe(
      () => { },
      (err) => {
        console.error(err);
      }
    );
  }
  GetDashboardCard1(): void {
    this._factService.GetDashboardCard1().subscribe(
      res => {
        if (res) {
          const blob = res.image;
          console.log(res.filename);
          if (blob && res.filename && res.type) {
            this.fileToUpload1 = new File([blob], res.filename, { type: res.type, lastModified: Date.now() });
          }
          const fileURL = URL.createObjectURL(blob);
          this.AttachmentData1 = fileURL;
          // this.AttachmentData1 = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
        }
        this.isProgressBarVisibile = false;
      },
      error => {
        console.error(error);
        this.isProgressBarVisibile = false;
      }
    );
  }
  GetDashboardCard2(): void {
    this._factService.GetDashboardCard2().subscribe(
      res => {
        if (res) {
          const blob = res.image;
          console.log(res.filename);
          if (blob && res.filename && res.type) {
            this.fileToUpload2 = new File([blob], res.filename, { type: res.type, lastModified: Date.now() });
          }
          const fileURL = URL.createObjectURL(blob);
          this.AttachmentData2 = fileURL;
          // this.AttachmentData2 = this.sanitizer.bypassSecurityTrustResourceUrl(fileURL);
        }
        this.isProgressBarVisibile = false;
      },
      error => {
        console.error(error);
        this.isProgressBarVisibile = false;
      }
    );
  }
  getCard1URL(): any {
    if (this.AttachmentData1) {
      return this.sanitizer.bypassSecurityTrustStyle(`url(${this.AttachmentData1})`);
    }
    return 'url("assets/images/StaySafe.png")';
  }
  getCard2URL(): any {
    if (this.AttachmentData2) {
      return this.sanitizer.bypassSecurityTrustStyle(`url(${this.AttachmentData2})`);
    }
    return 'url("assets/images/SafetyFirst.png")';
  }
  GetFactByPartnerIDAndType(): void {
    this._factService
      .GetFactByPartnerIDAndType(this.currentUserName, "V")
      .subscribe(
        (data) => {
          this.Fatc_list = data as BPCFact[];
          // console.log("Fatc_list", this.Fatc_list);
          // const fact = data as BPCFact;
          this.loadSelectedFact(this.Fatc_list[0]);
        },
        (err) => {
          console.error(err);
        }
      );
  }

  // GetAIACTsByPartnerID(PartnerID: any): void {
  //   this.isProgressBarVisibile = true;
  //   this._factService.GetAIACTsByPartnerID(PartnerID).subscribe(
  //     (data) => {
  //       this.isProgressBarVisibile = false;
  //       this.aIACTs = data as BPCAIACT[];
  //       this.aIACTs.forEach((x) => {
  //         if (x.Type === "Action") {
  //           this.actions.push(x);
  //         } else {
  //           this.notifications.push(x);
  //         }
  //       });
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.isProgressBarVisibile = false;
  //       // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
  //     }
  //   );
  // }

  GetActionsByPartnerID(): void {
    this.isProgressBarVisibile = true;
    this._factService
      .GetActionsByPartnerID(this.authenticationDetails.UserName)
      .subscribe(
        (data) => {
          if (data) {
            this.actions = data as BPCAIACT[];
          }
          this.isProgressBarVisibile = false;
        },
        (err) => {
          console.error(err);
          this.isProgressBarVisibile = false;
        }
      );
  }

  GetNotificationsByPartnerID(): void {
    this._factService
      .GetNotificationsByPartnerID(this.authenticationDetails.UserName)
      .subscribe(
        (data) => {
          if (data) {
            this.notifications = data as BPCAIACT[];
            this.notificationCount = this.notifications.length;
          }
        },
        (err) => {
          console.error(err);
        }
      );
  }

  UpdateAction(selectedNotification: BPCAIACT, buttonType: string): void {
    if (selectedNotification) {
      selectedNotification.IsSeen = true;
      this._factService
        .UpdateAIACT(selectedNotification)
        .subscribe(
          () => {
            if (buttonType === 'No') {
              this.GetActionsByPartnerID();
            }
            else if (buttonType === 'Yes') {
              if (selectedNotification.AppID === '01') { // PO
                this._router.navigate(['pages/polookup'], { queryParams: { id: selectedNotification.DocNumber } });
              }
            }
            else if (buttonType === 'View') {
              if (selectedNotification.AppID === '01') { // PO
                this._router.navigate(['pages/polookup'], { queryParams: { id: selectedNotification.DocNumber } });
              }
            }
          },
          (err) => {
            console.error(err);
          }
        );
    }
  }

  YesClicked(selectedNotification: BPCAIACT): void {
    this.CreateActionLogvalues("Yes");
    this.UpdateAction(selectedNotification, 'Yes');
  }
  NoClicked(selectedNotification: BPCAIACT): void {
    this.CreateActionLogvalues("NO");

    this.UpdateAction(selectedNotification, 'No');
  }
  ActionClicked(selectedNotification: BPCAIACT): void {
    this.CreateActionLogvalues("Action");

    this.UpdateAction(selectedNotification, selectedNotification.Action);
  }
  // AcceptAIACT(): void {
  //   this.selectedAIACT.ModifiedBy = this.authenticationDetails.UserID.toString();
  //   this.selectedAIACT.Status = "Accepted";
  //   this.selectedAIACT.ActionText = "View";
  //   this.isProgressBarVisibile = true;
  //   this._dashboardService.AcceptAIACT(this.selectedAIACT).subscribe(
  //     () => {
  //       this.notificationSnackBarComponent.openSnackBar(
  //         "PO Accepted successfully",
  //         SnackBarStatus.success
  //       );
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.notificationSnackBarComponent.openSnackBar(
  //         err instanceof Object ? "Something went wrong" : err,
  //         SnackBarStatus.danger
  //       );
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  // RejectAIACT(): void {
  //   this.selectedAIACT.ModifiedBy = this.authenticationDetails.UserID.toString();
  //   this.selectedAIACT.Status = "Rejected";
  //   this.selectedAIACT.ActionText = "View";
  //   this.isProgressBarVisibile = true;
  //   this._dashboardService.RejectAIACT(this.selectedAIACT).subscribe(
  //     () => {
  //       this.notificationSnackBarComponent.openSnackBar(
  //         "PO Rejected successfully",
  //         SnackBarStatus.success
  //       );
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.notificationSnackBarComponent.openSnackBar(
  //         err instanceof Object ? "Something went wrong" : err,
  //         SnackBarStatus.danger
  //       );
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  // AcceptAIACTs(): void {
  //   this.aIACTs.forEach((x) => {
  //     if (x.Status === "Open") {
  //       x.ModifiedBy = this.authenticationDetails.UserID.toString();
  //       x.Status = "Accepted";
  //       x.ActionText = "View";
  //       this.aIACTsView.push(x);
  //     }
  //   });
  //   this.isProgressBarVisibile = true;
  //   this._dashboardService.AcceptAIACTs(this.aIACTsView).subscribe(
  //     () => {
  //       this.notificationSnackBarComponent.openSnackBar(
  //         "POs Accepted successfully",
  //         SnackBarStatus.success
  //       );
  //       this.isProgressBarVisibile = false;
  //     },
  //     (err) => {
  //       console.error(err);
  //       this.notificationSnackBarComponent.openSnackBar(
  //         err instanceof Object ? "Something went wrong" : err,
  //         SnackBarStatus.danger
  //       );
  //       this.isProgressBarVisibile = false;
  //     }
  //   );
  // }

  loadSelectedFact(selectedBPCFact: BPCFact): void {
    if (selectedBPCFact) {
      this.selectedFact = selectedBPCFact;
      this.default_Company = this.selectedFact.Company;
      console.log(this.selectedFact);
      this.selectedPartnerID = selectedBPCFact.PatnerID;
    }
  }
  getCompany(item): void {
    this.selectedFact = item;
  }

  // openConfirmationDialog(Actiontype: string, Catagory: string): void {
  //   const dialogConfig: MatDialogConfig = {
  //     data: {
  //       Actiontype: Actiontype,
  //       Catagory: Catagory,
  //     },
  //     panelClass: "confirmation-dialog",
  //   };
  //   const dialogRef = this.dialog.open(
  //     NotificationDialogComponent,
  //     dialogConfig
  //   );
  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       if (Actiontype === "Accept") {
  //         this.AcceptAIACT();
  //       } else if (Actiontype === "Reject") {
  //         this.RejectAIACT();
  //       } else if (Actiontype === "Accept All") {
  //         this.AcceptAIACTs();
  //       }
  //     }
  //   });
  // }

  // actionTextButtonClicked(aIACTByPartnerID: BPCAIACT): void {
  //   if (aIACTByPartnerID) {
  //     if (aIACTByPartnerID.ActionText.toLowerCase() === "accept") {
  //       this.selectedAIACT = aIACTByPartnerID;
  //       const Actiontype = "Accept";
  //       const Catagory = "PO";
  //       this.openConfirmationDialog(Actiontype, Catagory);
  //     } else if (aIACTByPartnerID.ActionText.toLowerCase() === "reject") {
  //       this.selectedAIACT = aIACTByPartnerID;
  //       const Actiontype = "Reject";
  //       const Catagory = "PO";
  //       this.openConfirmationDialog(Actiontype, Catagory);
  //     } else if (aIACTByPartnerID.ActionText.toLowerCase() === "view") {
  //       this._router.navigate(["/pages/polookup"], {
  //         queryParams: { id: aIACTByPartnerID.DocNumber },
  //       });
  //     } else if (aIACTByPartnerID.ActionText.toLowerCase() === "ack") {
  //       this._router.navigate(["/pages/polookup"], {
  //         queryParams: { id: aIACTByPartnerID.DocNumber },
  //       });
  //     } else if (aIACTByPartnerID.ActionText.toLowerCase() === "asn") {
  //       this._router.navigate(["/asn"], {
  //         queryParams: { id: aIACTByPartnerID.DocNumber },
  //       });
  //     } else if (aIACTByPartnerID.ActionText.toLowerCase() === "grn") {
  //       this._router.navigate(["/pages/polookup"], {
  //         queryParams: { id: aIACTByPartnerID.DocNumber },
  //       });
  //     } else if (aIACTByPartnerID.ActionText.toLowerCase() === "gate") {
  //       this._router.navigate(["/pages/polookup"], {
  //         queryParams: { id: aIACTByPartnerID.DocNumber },
  //       });
  //     }
  //   } else {
  //   }
  // }

  noButtonClicked(): void { }

  // setActionToOpenConfirmation(actiontype: string): void {
  //   if (this.selectedFact.PatnerID) {
  //     const Actiontype = actiontype;
  //     const Catagory = "Vendor";
  //     this.openConfirmationDialog(Actiontype, Catagory);
  //   }
  // }

  numberOnly(event): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    if (
      charCode === 8 ||
      charCode === 9 ||
      charCode === 13 ||
      charCode === 46 ||
      charCode === 37 ||
      charCode === 39 ||
      charCode === 123 ||
      charCode === 190
    ) {
      return true;
    } else if (charCode < 48 || charCode > 57) {
      return false;
    }
    return true;
  }

  onFactSheetButtonClicked(): void {
    this.CreateActionLogvalues("Fact Sheet Button");
    this._router.navigate(["/fact"], { queryParams: { render: 1 } });
    // this._router.navigate(["/fact"]);
  }

  // onAcceptAllButtonClicked(): void {
  //   if (this.aIACTs && this.aIACTs.length > 0) {
  //     const Actiontype = "Accept All";
  //     const Catagory = "PO";
  //     this.openConfirmationDialog(Actiontype, Catagory);
  //   }
  // }

  onClearAllButtonClicked(): void {
    let seqNos = [];
    this.actions.forEach(x => seqNos.push(x.SeqNo));
    this.isProgressBarVisibile = true;
    this._factService
      .UpdateAIACTs(seqNos)
      .subscribe(
        (data) => {
          if (data) {
          }
          this.isProgressBarVisibile = false;
          this.GetActionsByPartnerID();
        },
        (err) => {
          console.error(err);
          this.isProgressBarVisibile = false;
        }
      );
  }

  getTodayDate(): any {
    const today = new Date();
    return today.getDate().toString();
  }

  typeSelected(event): void {
    if (event.value) {
      this.selectedFact.Type = event.value;
    }
  }

  getActionData(element: BPCAIACT, actionDataFor: string): string {
    switch (actionDataFor) {
      case "actionFirstData":
        return element.Status === "DueForACK"
          ? "acknowledge"
          : element.Status === "DueForASN"
            ? "ASN"
            : element.Status === "DueForGate"
              ? "GRN"
              : element.Status === "DueForGRN"
                ? "Gate"
                : element.Status === "Accepted"
                  ? "Accept"
                  : element.Status === "Rejected"
                    ? "Reject"
                    : "";
      case "actionSecondData":
        return element.Status === "DueForACK"
          ? "waiting for Acknowledgement "
          : element.Status === "DueForASN"
            ? "waiting for ASN"
            : element.Status === "DueForGate"
              ? "waiting for Gate"
              : element.Status === "DueForGRN"
                ? "waiting for GRN"
                : "";
      default:
        return "";
    }
  }
  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }
  CreateActionLogvalues(text): void {
    this.ActionLog = new ActionLog();
    this.ActionLog.UserID = this.currentUserID;
    this.ActionLog.AppName = "ActionCenter";
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
