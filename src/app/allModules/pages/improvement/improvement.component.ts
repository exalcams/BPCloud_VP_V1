import { Component, OnInit } from "@angular/core";
import { MasterService } from 'app/services/master.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatDialog } from '@angular/material';
import { BPCFact } from 'app/models/fact';
import { BPCOFAIACT } from 'app/models/OrderFulFilment';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { Guid } from 'guid-typescript';
import * as SecureLS from 'secure-ls';
import { AuthService } from "app/services/auth.service";

@Component({
    selector: "app-improvement",
    templateUrl: "./improvement.component.html",
    styleUrls: ["./improvement.component.scss"],
})
export class ImprovementComponent implements OnInit {
  menuItems: string[];
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole = '';
  currentDisplayName: string;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isProgressBarVisibile: boolean;
  SecretKey: string;
    SecureStorage: SecureLS;
    constructor(
        private _masterService: MasterService,
        private _router: Router,
        public snackBar: MatSnackBar,
        private dialog: MatDialog,
        private _authService: AuthService,

    ) {
        this.SecretKey = this._authService.SecretKey;
        this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
        this.authenticationDetails = new AuthenticationDetails();
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
        this.isProgressBarVisibile = false;
    }

    ngOnInit(): void {
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
            // if (this.menuItems.indexOf("improvement") < 0) {
            //     this.notificationSnackBarComponent.openSnackBar(
            //         "You do not have permission to visit this page",
            //         SnackBarStatus.danger
            //     );
            //     this._router.navigate(["/auth/login"]);
            // }
        } else {
            this._router.navigate(["/auth/login"]);
        }
    }
}
