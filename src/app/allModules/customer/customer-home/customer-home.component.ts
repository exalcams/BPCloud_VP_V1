import { Component, OnInit } from '@angular/core';
import { BPCCEOMessage, BPCWelcomeMessage } from 'app/models/Message.model';
import { POService } from 'app/services/po.service';
import { AuthenticationDetails, AppUsage } from "app/models/master";
import { MatDialogConfig } from '@angular/material';
import { Router } from '@angular/router';
@Component({
  selector: 'app-customer-home',
  templateUrl: './customer-home.component.html',
  styleUrls: ['./customer-home.component.scss']
})
export class CustomerHomeComponent implements OnInit {
  IsProgressBarVisibile: boolean;
  selectedWelcomeMessage: BPCWelcomeMessage;
  authenticationDetails: AuthenticationDetails;
  menuItems: string[] = [];
  constructor(private _POService: POService, private _router: Router,) { this.selectedWelcomeMessage = new BPCWelcomeMessage(); }

  ngOnInit() {
    // console.log("workss")
    this.GetWelcomeMessage();
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
        this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
        this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
        // if (this.menuItems.indexOf('User') < 0) {
        //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        //   this._router.navigate(['/auth/login']);
        // }
        // if (!this.authenticationDetails.TourStatus) {
        //     this.openTourScreenDialog();
        // }
        // this.LoadBotChat();
      
    } else {
        this._router.navigate(['/auth/login']);
    }
  }
//   openTourScreenDialog(): void {
//     const dialogConfig = new MatDialogConfig();

//     dialogConfig.disableClose = true;
//     dialogConfig.width = "50%";
//     this.dialog.open(TourComponent, dialogConfig);
// }
  GetWelcomeMessage(): void {
    this.IsProgressBarVisibile = true;
    this._POService.GetWelcomeMessage().subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.selectedWelcomeMessage = data as BPCWelcomeMessage;
        if (!this.selectedWelcomeMessage) {
          this.selectedWelcomeMessage = new BPCWelcomeMessage();
        }
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }
}
