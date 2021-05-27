import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { BPCRetHeader } from 'app/models/customer';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { CustomerService } from 'app/services/customer.service';
import { FactService } from 'app/services/fact.service';
import { Guid } from 'guid-typescript';
import * as SecureLS from 'secure-ls';

@Component({
  selector: 'app-customer-return-list',
  templateUrl: './customer-return-list.component.html',
  styleUrls: ['./customer-return-list.component.scss']
})
export class CustomerReturnListComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  PartnerID: string;
  currentUserRole: string;
  MenuItems: string[];
  IsProgressBarVisibile: boolean;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  client: any;
  company: any;
  type: any;
  patnerid: any;

  ReturnDataSource: MatTableDataSource<BPCRetHeader>;
  AllReturns: BPCRetHeader[] = [];
  @ViewChild(MatPaginator) ReturnPaginator: MatPaginator;
  @ViewChild(MatSort) ReturnSort: MatSort;
  ReturnListDisplayedColumns: string[] = [
    "RequestID",
    "Date",
    "InvoiceReference",
    "SONumber",
    "CreditNote",
    "AWBNumber",
    "Transporter",
    "TruckNumber",
    "Status",
    // "StatusFlow",
  ];
  SecretKey: string;
    SecureStorage: SecureLS;
  // PurchaseDataSource: MatTableDataSource<BPCPIHeader>;
  // AllPurchase: BPCPIHeader[] = [];
  // @ViewChild(MatPaginator) PurchasePaginator: MatPaginator;
  // @ViewChild(MatSort) PurchaseSort: MatSort;
  constructor(public customerService:CustomerService,private _FactService: FactService, private _router: Router,
    private _authService: AuthService,
    ) {  this.SecretKey = this._authService.SecretKey;
      this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey }); }
// ReturnsData:
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
            this.GetReturnList();
        },
        (err) => {
            console.error(err);
        }
    );
}
GetReturnList(){
  this.IsProgressBarVisibile = true;
  this.customerService.GetReturnList(this.client,this.company,this.type,this.patnerid).subscribe(
    (data)=>{
      this.AllReturns=data as BPCRetHeader[];
      console.log(this.AllReturns);
      this.ReturnDataSource=new MatTableDataSource(this.AllReturns);
      this.ReturnDataSource.paginator=this.ReturnPaginator;
      this.ReturnDataSource.sort=this.ReturnSort;
      this.IsProgressBarVisibile = false;
    },
    (err)=>{     console.error(err);
      this.IsProgressBarVisibile = false;}
  )
}
Gotocreate(RetReqID) {
  this.IsProgressBarVisibile = true;
  if (RetReqID) {

    this._router.navigate(["/customer/customerreturn"], {
      queryParams: { id: RetReqID },
    });
  }
else {
  this._router.navigate(["/auth/login"]);
}
}
}
