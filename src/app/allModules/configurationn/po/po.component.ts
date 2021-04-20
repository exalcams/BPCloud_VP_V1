import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';

@Component({
  selector: 'app-po',
  templateUrl: './po.component.html',
  styleUrls: ['./po.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class POComponent implements OnInit {

  POFormGroup: FormGroup;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  authenticationDetails: AuthenticationDetails;
  currentUserID: any;
  searchText="";
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  BuyerEmailAddress: string;
  AllPo=[];
  POTypes=["Import","Material"];
  Levels=["Notification","Remainder","Expenditor"];
  Stages=["PO Ack","Shipment","Reaching At Port","Port Creattion","During Payment"];
  Notifications=["To Supplier","To Buyer","To Expenditor"];
  constructor(private _formBuilder: FormBuilder, public snackBar: MatSnackBar,private _router: Router) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit() {
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      this.BuyerEmailAddress = this.authenticationDetails.EmailAddress;

      if (this.MenuItems.indexOf('PO') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }

    this.InitializePoFormGroup();
  }
  InitializePoFormGroup()
  {
    this.POFormGroup = this._formBuilder.group({
      POType: ['', Validators.required],
      Stage: ['', Validators.required],
      Level: ['', Validators.required],
      BeforeEvent: [''],
      AfterEvent: [''],
      AfterDunning1: [''],
      AfterDunning2: [''],
      AfterDunning3: [''],
    });
  }
  Create()
  {
    console.log("POFormGroup",this.POFormGroup.value);
  }
}
