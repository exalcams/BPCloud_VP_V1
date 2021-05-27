import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { P } from '@angular/core/src/render3';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { AuthenticationDetails, PO } from 'app/models/master';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { MasterService } from 'app/services/master.service';
import { Guid } from 'guid-typescript';
import * as SecureLS from 'secure-ls';

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
  CreatedPo:PO[]=[];
  SelectedPO:PO;
  searchText="";
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  BuyerEmailAddress: string;
  selectID=0;
  AllPo=[];
  POTypes=["Import","Material","Service","Asset"];
  POAliasNames=["IMP","MAT","SER","AST"];
  Levels=["Notification","Remainder","Expenditor"];
  Stages=["PO Ack","Shipment","Reaching At Port","Port Creattion","During Payment"];
  Notifications=["To Supplier","To Buyer","To Expenditor"];
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(private _formBuilder: FormBuilder, public snackBar: MatSnackBar,
    private _authService: AuthService,
    private _router: Router,private _masterService:MasterService,) {
      this.SecretKey = this._authService.SecretKey;
      this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.SelectedPO=new PO();
  }

  ngOnInit() {
    const retrievedObject = this.SecureStorage.get('authorizationData');
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
    } 
    else {
      this._router.navigate(['/auth/login']);
    }

    this.InitializePoFormGroup();
    this.GetPo();
  }
  GetPo()
  {
    this._masterService.GetPO().subscribe(
      (data)=>
      {
        this.CreatedPo=data as PO[];
        if(this.CreatedPo.length >0)
        {
          this.loadSelectedProduct(this.CreatedPo[0]);
        }
      },
      (err)=>
      {
        console.log(err);
      }
    );
  }
  InitializePoFormGroup()
  {
    this.POFormGroup = this._formBuilder.group({
      POType: ['', Validators.required],
      Stage: ['', Validators.required],
      Level: ['', Validators.required],
      Interval:['', [Validators.required,Validators.pattern('[0-9]{1,3}$')]],
      BeforeEvent: [''],
      AfterEvent: [''],
      AfterDunning1: ['',Validators.pattern('[0-9]{1,3}$')],
      AfterDunning2: ['',Validators.pattern('[0-9]{1,3}$')],
      AfterDunning3: ['',Validators.pattern('[0-9]{1,3}$')],
    });
  }
  CreatePO()
  {
    this.getDetails();
    this._masterService.CreatePO(this.SelectedPO).subscribe(
      (data)=>
      {
        const response=data as PO;
        this.GetPo();
        this.notificationSnackBarComponent.openSnackBar('Create Success',SnackBarStatus.success);
      },
      (err)=>
      {
        this.notificationSnackBarComponent.openSnackBar(err,SnackBarStatus.danger);
        console.log(err); 
      }
    );
  }
  getDetails()
  {
    this.SelectedPO.ID=this.selectID;
    this.SelectedPO.UserId=this.currentUserID;
    const type=this.POFormGroup.get('POType').value;

    this.POTypes.forEach((poType,index) => {
      if(poType == type)
      {
        this.SelectedPO.POType=this.POAliasNames[index];
      }
    });
    // this.SelectedPO.POType=this.POFormGroup.get('POType').value;
    this.SelectedPO.Stage=this.POFormGroup.get('Stage').value;
    this.SelectedPO.Level=this.POFormGroup.get('Level').value;
    this.SelectedPO.Interval=this.POFormGroup.get('Interval').value;
    this.SelectedPO.BeforeEvent=this.POFormGroup.get('BeforeEvent').value;
    this.SelectedPO.AfterEvent=this.POFormGroup.get('AfterEvent').value;
    this.SelectedPO.AfterDunning1=parseInt(this.POFormGroup.get('AfterDunning1').value);
    this.SelectedPO.AfterDunning2=parseInt(this.POFormGroup.get('AfterDunning2').value);
    this.SelectedPO.AfterDunning3=parseInt(this.POFormGroup.get('AfterDunning3').value);

    console.log('SelectedPO',this.SelectedPO);
  }
  UpdatePO()
  {
    this.getDetails();
    this._masterService.UpdatePO(this.SelectedPO).subscribe(
      (data)=>{
        this.GetPo();
        this.notificationSnackBarComponent.openSnackBar('Update Success',SnackBarStatus.success);
      },
      (err)=>{
        this.notificationSnackBarComponent.openSnackBar(err,SnackBarStatus.danger);
      }
    );
  }
  loadSelectedProduct(Data:PO){
    console.log("loadSelectedProduct",Data);
    this.selectID=Data.ID;
    this.SelectedPO.ID=Data.ID;
    this.POAliasNames.forEach((poType,index) => {
      if(poType == Data.POType)
      {
        this.SelectedPO.POType=this.POTypes[index];
      }
    });
    this.SelectedPO.Level=Data.Level;
    this.SelectedPO.Stage=Data.Stage;
    this.SelectedPO.Interval=Data.Interval;
    this.SelectedPO.BeforeEvent=Data.BeforeEvent;
    this.SelectedPO.AfterDunning1=Data.AfterDunning1;
    this.SelectedPO.AfterDunning2=Data.AfterDunning2;
    this.SelectedPO.AfterDunning3=Data.AfterDunning3;

    this.SelectedPO.AfterEvent=Data.AfterEvent;

    this.LoadPoData(this.SelectedPO);
  }
  LoadPoData(SelectedPO:PO){
    this.POFormGroup.get('POType').patchValue(SelectedPO.POType);
    this.POFormGroup.get('Level').patchValue(SelectedPO.Level);
    this.POFormGroup.get('Stage').patchValue(SelectedPO.Stage);
    this.POFormGroup.get('Interval').patchValue(SelectedPO.Interval);
    this.POFormGroup.get('BeforeEvent').patchValue(SelectedPO.BeforeEvent);
    this.POFormGroup.get('AfterEvent').patchValue(SelectedPO.AfterEvent);
    this.POFormGroup.get('AfterDunning1').patchValue(SelectedPO.AfterDunning1);
    this.POFormGroup.get('AfterDunning2').patchValue(SelectedPO.AfterDunning2);
    this.POFormGroup.get('AfterDunning3').patchValue(SelectedPO.AfterDunning3);

  }
  ResetControl()
  {
    this.SelectedPO = new PO();
    this.selectID = 0;
    this.POFormGroup.reset();
    Object.keys(this.POFormGroup.controls).forEach(key => {
      this.POFormGroup.get(key).markAsUntouched();
    });
  }
}
