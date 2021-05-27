import { Component, OnInit, ViewChild } from '@angular/core';
import { CustomerService } from 'app/services/customer.service';
import {
  AuthenticationDetails,
  UserWithRole,
  AppUsage,
  UserPreference,
} from "app/models/master";
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { Router } from '@angular/router';
import { BPCPIHeader } from 'app/models/customer';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { FactService } from 'app/services/fact.service';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-customer-purchase-list',
  templateUrl: './customer-purchase-list.component.html',
  styleUrls: ['./customer-purchase-list.component.scss']
})
export class CustomerPurchaseListComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  PartnerID: string;
  currentUserRole: string;
  MenuItems: string[];
  IsProgressBarVisibile: boolean;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  PurchaseDataSource: MatTableDataSource<BPCPIHeader>;
  AllPurchase: BPCPIHeader[] = [];
  @ViewChild(MatPaginator) PurchasePaginator: MatPaginator;
  @ViewChild(MatSort) PurchaseSort: MatSort;
  PurchaseDisplayedColumns: string[] = [
    "PIRNumber",
    "Date",
    "ReferenceDoc",
    "Status",
    // "StatusFlow",
  ];
  client: any;
  company: any;
  type: any;
  patnerid: any;
  SecretKey: string;
  SecureStorage: SecureLS;
  
  constructor(public _customerService: CustomerService, private _router: Router,private _FactService: FactService,
    private _authService: AuthService,
    ) {
      this.SecretKey = this._authService.SecretKey;
        this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
     }

  ngOnInit() {

    const retrievedObject = this.SecureStorage.get("authorizationData");
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(
        retrievedObject
      ) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.PartnerID = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(
        ","
      );
      // console.log(this.authenticationDetails);
      if (this.MenuItems.indexOf("CustomerPurchaseList") < 0) {
        this.notificationSnackBarComponent.openSnackBar(
          "You do not have permission to visit this page",
          SnackBarStatus.danger
        );
        this._router.navigate(["/auth/login"]);
      }
    } else {
      this._router.navigate(["/auth/login"]);
    }
    // this.GetAllPurchaseIndentsByPartnerID();
    this.GetFactByPartnerID();
  }
  GetFactByPartnerID(): void {
    this._FactService.GetFactByPartnerID(this.currentUserName).subscribe(
        (data) => {
          
            this.client=data.Client, 
            this.company= data.Company,
            this.type=data.Type,
            this.patnerid=data.PatnerID
            if(data)
            this.GetAllPurchaseIndentsByPartnerID();
        },
        (err) => {
            console.error(err);
        }
    );
}
  GetAllPurchaseIndentsByPartnerID() {
    this.IsProgressBarVisibile = true;
    this._customerService.GetAllPurchaseIndentsByPartnerID(this.client,this.company,this.type,this.patnerid).subscribe(
      (data) => {
       
        console.log("data" + data)
        this.AllPurchase = data as BPCPIHeader[];

        this.PurchaseDataSource = new MatTableDataSource(this.AllPurchase);
        this.PurchaseDataSource.paginator = this.PurchasePaginator;
        this.PurchaseDataSource.sort = this.PurchaseSort;
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  Gotocreate(PIRNnum) {
    this.IsProgressBarVisibile = true;
    if (PIRNnum) {

      this._router.navigate(["/customer/purchaseindent"], {
        queryParams: { id: PIRNnum },
      });
    }
  else {
    this._router.navigate(["/auth/login"]);
}
  }
}
