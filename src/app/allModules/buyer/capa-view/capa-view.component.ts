import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { MatTabBase } from '@angular/material/tabs/typings/tab';
import { fuseAnimations } from '@fuse/animations';
import { CAPAReqItem, CAPAReqPartner, CAPAReqView } from 'app/models/CAPA';
import { BPCFact, CAPAvendor } from 'app/models/fact';
import { AttachmentDetails } from 'app/models/task';
import { CapaService } from 'app/services/capa.service';
import { FactService } from 'app/services/fact.service';
import { AddvendorDialogComponent } from '../addvendor-dialog/addvendor-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { DatePipe } from '@angular/common';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-capa-view',
  templateUrl: './capa-view.component.html',
  styleUrls: ['./capa-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CapaViewComponent implements OnInit {


  SelectedTabIndex = null;
  RadioBtnValue = "Dialog";
  TextAreaMinRow = 10;
  TextAreaMaxRow = 20
  Types = ["Correctie Action", "Preventive Action", "Documnet Collection", "Root Cause Analysis"];
  IsDocumentRequireds = ["Yes", "No"];
  CheckListFormGroup: FormGroup;
  isProgressBarVisibile = false;
  notificationSnackBarComponent: NotificationSnackBarComponent;

  HeaderFormGroup: FormGroup;
  Vendors: BPCFact[] = [];
  Selectedvendors: BPCFact[] = [];
  TextAreaValue = "";
  NextTabIndex = 0;
  CAPAView: CAPAReqView;
  @ViewChild(MatPaginator) CheckListPaginator: MatPaginator;
  @ViewChild(MatSort) CheckListSort: MatSort;
  CheckListDataSource = new MatTableDataSource<CAPAReqItem>();
  VendorDataSource = new MatTableDataSource<BPCFact>();
  RadioButton = "";
  CheckListItems: CAPAReqItem[] = [];
  data: CAPAvendor;
  CheckListDisplayColumns = ["Text", "DueDate", "Priority", "Impact", "Department", "Type", "IsDocumentRequired", "Action"];
  VendorTableDisplayedColumns = ["S.No", "Vendor", "VendorName", "GSTNumber", "City", "Action"];
  Priorities = ["None", "Low", "Medium", "High"];
  Impacts = ["None", "Low", "Medium", "High"];
  Recurring = ["Yes", "No"];
  SelectedItemIndex: any;
  SelectedItemRow: CAPAReqItem;
  SelectedID: any;
  IsFooterDisable = true;
  authenticationDetails: AuthenticationDetails;
  currentUserID: any;
  currentUserRole: string;
  MenuItems: string[];
  currentUserName: string;
  BuyerEmailAddress: string;
  Type: any;
  IsRecurring: any;
  minDate: Date;
  maxDate: Date;
  DueMinDate: Date;
  ISHeaderFormValid = false;
  ProgressBarValue = 0;
  IsItem = false;
  ISCheckListFormValid = false;
  IsVendorListValid = false;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(private _formBuilder: FormBuilder, private dialog: MatDialog,
    private _factService: FactService, private _capaService: CapaService, private _datePipe: DatePipe,
    public snackBar: MatSnackBar, private _route: ActivatedRoute, private _router: Router,
    private _authService: AuthService,
    ) {

      this.SecretKey = this._authService.SecretKey;
      this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.data = new CAPAvendor();
    this.CAPAView = new CAPAReqView();
    this.CAPAView.CAPAReqItems = [];
    this.CAPAView.CAPAReqPartners = [];
    var TodayDate = new Date()
    this.minDate = new Date(TodayDate.getFullYear(), TodayDate.getMonth(), TodayDate.getDate());
    this.maxDate = new Date(TodayDate.getFullYear() + 5, 5, 30, TodayDate.getHours(), TodayDate.getMinutes(), TodayDate.getSeconds());

  }

  ngOnInit() {
    this._route.queryParams.subscribe(params => {
      this.SelectedID = params['id'];
    });
    const retrievedObject = this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      this.BuyerEmailAddress = this.authenticationDetails.EmailAddress;

      // if (this.MenuItems.indexOf('BuyerPOList') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //   );
      //   this._router.navigate(['/auth/login']);
      // }

    }
    else {
      this._router.navigate(['/auth/login']);
    }
    // this.GetAllVendors();
    this.InitializeCheckListFormGroup();
    this.InitializeHeaderFormGroup();
    this.InitializeVendorsTable();
    this.GetCAPADetilsByReqId();

  }
  GetCAPADetilsByReqId() {
    this.isProgressBarVisibile = true;
    this._capaService.GetCAPAReqByReqId(this.SelectedID).subscribe(
      (res) => {
        var details = res as CAPAReqView;
        console.log('GetCAPADetilsByReqId', details);
        //Header
        this.CAPAView.Text = details.Text;
        this.CAPAView.Status = details.Status;
        this.CAPAView.ReqID = details.ReqID;
        this.CAPAView.DueDate = details.DueDate;
        this.CAPAView.StartDate = details.StartDate;
        this.CAPAView.Recurring = details.Recurring;
        this.CAPAView.Ocurrence = details.Ocurrence;
        this.CAPAView.Interval = details.Interval;



        if (this.CAPAView.Status === "Open" || this.CAPAView.Status === "Closed") {
          this.IsFooterDisable = false;
        }
        //Items
        details.CAPAReqItems.forEach(items => {
          var data = items as CAPAReqItem;
          this.CAPAView.CAPAReqItems.push(data);
        });

        //vendors
        details.CAPAReqPartners.forEach(vendor => {
          this.CAPAView.CAPAReqPartners.push(vendor);
        });

        console.log("Initial Load", this.CAPAView);
        this.LoadRequestDetails();
      },
      (err) => {
        this.isProgressBarVisibile = false;

        console.log(err);
      }
    )
  }
  LoadRequestDetails() {

    //Header
    this.HeaderFormGroup.get('Text').patchValue(this.CAPAView.Text);
    this.HeaderFormGroup.get('DueDate').patchValue(this.CAPAView.DueDate);

    this.CheckListFormGroup.get('DueDate').patchValue(this.CAPAView.DueDate);

    this.HeaderFormGroup.get('StartDate').patchValue(this.CAPAView.StartDate);
    this.HeaderFormGroup.get('Recurring').patchValue(this.CAPAView.Recurring);
    this.HeaderFormGroup.get('Interval').patchValue(this.CAPAView.Interval);
    this.HeaderFormGroup.get('Ocurrence').patchValue(this.CAPAView.Ocurrence);

    //Header
    this.ProgressBarValue += 25;
    this.ISHeaderFormValid = true;

    this.IsRecurring = this.CAPAView.Recurring;

    var dates = new Date(this.CAPAView.StartDate);
    this.DueMinDate = new Date(dates.getFullYear(), dates.getMonth(), dates.getDate() + 1);
    //Dialog
    if (this.CAPAView.CAPAReqItems.length === 1 && this.CAPAView.CAPAReqItems[0].Priority === null) {
      this.RadioBtnValue = "Dialog";
      this.TextAreaValue = this.CAPAView.CAPAReqItems[0].Text;
      this.IsItem = true;
      this.ProgressBarValue += 25;
    }
    else {
      this.RadioBtnValue = "CheckList";
      //Checklist
      this.CheckListItems = [];
      this.CAPAView.CAPAReqItems.forEach(items => {
        if (items.IsDocumentRequired === true) {
          items.IsDocumentRequired = "Yes";
        }
        else {
          items.IsDocumentRequired = "No";
        }
        this.CheckListItems.push(items);
      });
      this.ISCheckListFormValid = true;
      this.ProgressBarValue += 25;
      this.CheckListDataSource = new MatTableDataSource<CAPAReqItem>(this.CheckListItems);
      this.CheckListDataSource.sort = this.CheckListSort;
    }

    //Vendors
    this._factService.GetAllVendors().subscribe(
      (data) => {
        this.Vendors = data as BPCFact[];

        this.CAPAView.CAPAReqPartners.forEach(ReqVendors => {
          var fact = this.Vendors.find(x => x.PatnerID == ReqVendors.PatnerID);
          this.Selectedvendors.push(fact)
        });
        if (this.Selectedvendors.length > 0) {
          this.IsVendorListValid = true;
          this.ProgressBarValue += 50;
        }
        this.VendorDataSource = new MatTableDataSource<BPCFact>(this.Selectedvendors);
        this.VendorDataSource.sort = this.CheckListSort;
        this.isProgressBarVisibile = false;
      }
    );

  }
  UpdateProgressbar() {

    if (this.HeaderFormGroup.valid) { // Header
      if (!this.ISHeaderFormValid) {
        this.ISHeaderFormValid = true;
        this.ProgressBarValue += 25;
      }
    }
    else {
      if (this.ISHeaderFormValid) {
        this.ISHeaderFormValid = false;
        this.ProgressBarValue -= 25;
      }
    }

    if (this.RadioBtnValue == "Dialog") { // Dialog
      if (!this.IsItem && this.TextAreaValue != "") {
        this.IsItem = true;
        this.ProgressBarValue += 25;
      }
      else {
        if (this.IsItem && this.TextAreaValue == "") {
          this.IsItem = false;
          this.ProgressBarValue -= 25;
        }
      }
    }
    else {
      if (this.CheckListItems.length > 0) {
        if (!this.ISCheckListFormValid) {
          this.ISCheckListFormValid = true;
          this.ProgressBarValue += 25;
        }
      }
      else {
        if (this.ISCheckListFormValid) {
          this.ISCheckListFormValid = false;
          this.ProgressBarValue -= 25;
        }
      }
    }
  }
  TabSelected(event): void {
    this.SelectedTabIndex = parseInt(event);
  }
  RadioBtnChanged(event): void {
    this.RadioBtnValue = event.value;
    // console.log(this.RadioBtnValue);


    if (this.IsItem || this.ISCheckListFormValid) {
      this.ProgressBarValue -= 25;
      console.log('Items', this.IsItem, this.ISCheckListFormValid);
      this.IsItem = false;
      this.ISCheckListFormValid = false;
    }

    if (this.RadioBtnValue == "Dialog" && this.TextAreaValue != "") {
      this.IsItem = true;
      this.ProgressBarValue += 25;
    }
    else {
      if (this.CheckListItems.length > 0) {
        this.ISCheckListFormValid = true;
        this.ProgressBarValue += 25;
      }
    }
  }
  InitializeCheckListFormGroup(): void {
    this.CheckListFormGroup = this._formBuilder.group({
      Text: ['', Validators.required],
      DueDate: ['', Validators.required],
      Priority: ['Medium', Validators.required],
      Impact: ['Medium', Validators.required],
      Department: ['', Validators.required],
      Type: ['', Validators.required],
      IsDocumentRequired: ['', Validators.required],
    });
    this.CheckListFormGroup.get('Priority').patchValue('Medium');
    this.CheckListFormGroup.get('Impact').patchValue('Medium');

  }
  InitializeHeaderFormGroup(): void {
    this.HeaderFormGroup = this._formBuilder.group({
      Text: ['', Validators.required],
      DueDate: ['', Validators.required],
      StartDate: ['', Validators.required],
      Recurring: ['', Validators.required],
      Interval: ['', [Validators.required, Validators.pattern('[0-9]{1,}')]],
      Ocurrence: ['', [Validators.required, Validators.pattern('[0-9]{1,}')]]
    });
    this.HeaderFormGroup.get('Interval').disable;
    this.HeaderFormGroup.get('Ocurrence').disable;
  }
  RecurringChanged(event) {
    this.IsRecurring = event.value;
    if (this.IsRecurring == "Yes") {
      this.HeaderFormGroup.get('Ocurrence').enable();
      this.HeaderFormGroup.get('Interval').enable();
    }
    else {
      this.HeaderFormGroup.get('Ocurrence').disable();
      this.HeaderFormGroup.get('Interval').disable();
    }
    this.UpdateProgressbar();
  }
  AddToCheckListTable() {
    if (this.CheckListFormGroup.valid) {
      const item = new CAPAReqItem();
      item.Text = this.CheckListFormGroup.get('Text').value;
      item.DueDate = this._datePipe.transform(this.CheckListFormGroup.get('DueDate').value, 'yyyy-MM-dd');
      item.Priority = this.CheckListFormGroup.get('Priority').value;
      item.Impact = this.CheckListFormGroup.get('Impact').value;
      item.Department = this.CheckListFormGroup.get('Department').value;
      item.CType = this.CheckListFormGroup.get('Type').value;
      item.IsDocumentRequired = this.CheckListFormGroup.get('IsDocumentRequired').value;

      if (this.SelectedItemIndex >= 0 && this.SelectedItemIndex != null) {
        this.CheckListItems[this.SelectedItemIndex].Text = this.CheckListFormGroup.get('Text').value;
        this.CheckListItems[this.SelectedItemIndex].DueDate = this._datePipe.transform(this.CheckListFormGroup.get('DueDate').value, 'yyyy-MM-dd');;
        this.CheckListItems[this.SelectedItemIndex].Priority = this.CheckListFormGroup.get('Priority').value;
        this.CheckListItems[this.SelectedItemIndex].Impact = this.CheckListFormGroup.get('Impact').value;
        this.CheckListItems[this.SelectedItemIndex].Department = this.CheckListFormGroup.get('Department').value;
        this.CheckListItems[this.SelectedItemIndex].CType = this.CheckListFormGroup.get('Type').value;
        this.CheckListItems[this.SelectedItemIndex].IsDocumentRequired = this.CheckListFormGroup.get('IsDocumentRequired').value;
      }
      else {
        this.CheckListItems.push(item);
      }
      this.CheckListDataSource = new MatTableDataSource<CAPAReqItem>(this.CheckListItems);
      this.CheckListDataSource.sort = this.CheckListSort;
      this.clearCheckListFormGroup();
      this.SelectedItemIndex = null;
      this.UpdateProgressbar();

    }
    else {
      this.showValidationErrors(this.CheckListFormGroup);
    }
  }
  TextTableClicked(index: any, row: CAPAReqItem) {
    this.SelectedItemIndex = index;
    this.SelectedItemRow = row;

    this.CheckListFormGroup.get('Text').patchValue(row.Text);
    this.CheckListFormGroup.get('DueDate').patchValue(row.DueDate);
    this.CheckListFormGroup.get('Priority').patchValue(row.Priority);
    this.CheckListFormGroup.get('Impact').patchValue(row.Impact);
    this.CheckListFormGroup.get('Department').patchValue(row.Department);
    this.CheckListFormGroup.get('Type').patchValue(row.CType);
    this.CheckListFormGroup.get('IsDocumentRequired').patchValue(row.IsDocumentRequired);
  }
  showValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {

      if (!formGroup.get(key).valid) {
        console.log(key);
      }
      formGroup.get(key).markAsTouched();
      formGroup.get(key).markAsDirty();
      if (formGroup.get(key) instanceof FormArray) {
        const FormArrayControls = formGroup.get(key) as FormArray;
        Object.keys(FormArrayControls.controls).forEach(key1 => {
          if (FormArrayControls.get(key1) instanceof FormGroup) {
            const FormGroupControls = FormArrayControls.get(key1) as FormGroup;
            Object.keys(FormGroupControls.controls).forEach(key2 => {
              FormGroupControls.get(key2).markAsTouched();
              FormGroupControls.get(key2).markAsDirty();
              if (!FormGroupControls.get(key2).valid) {
                console.log(key2);
              }
            });
          } else {
            FormArrayControls.get(key1).markAsTouched();
            FormArrayControls.get(key1).markAsDirty();
          }
        });
      }
    });
  }
  clearCheckListFormGroup(): void {
    this.CheckListFormGroup.reset();
    Object.keys(this.CheckListFormGroup.controls).forEach(key => {
      this.CheckListFormGroup.get(key).markAsUntouched();
    });
    this.CheckListFormGroup.get('DueDate').patchValue(this.HeaderFormGroup.get('DueDate').value);
    this.CheckListFormGroup.get('Priority').patchValue('Medium');
    this.CheckListFormGroup.get('Impact').patchValue('Medium');
  }

  clearBankTable(index: any) {
    this.CheckListItems.splice(index, 1);
    this.CheckListDataSource = new MatTableDataSource<CAPAReqItem>(this.CheckListItems);
    this.CheckListDataSource.sort = this.CheckListSort;

    this.UpdateProgressbar();

  }
  openVendorDialog(): void {
    this.data.Vendors = [];
    this.data.SelectedVendors = [];
    this.Vendors.forEach(element => {
      this.data.Vendors.push(element);
    });
    this.Selectedvendors.forEach(element => {
      this.data.SelectedVendors.push(element);
    });
    this.data.Action = true;
    const dialogConfig: MatDialogConfig = {
      data: this.data,
      panelClass: "addvendor-dialog",
      disableClose: true
    };
    const dialogRef = this.dialog.open(
      AddvendorDialogComponent,
      dialogConfig
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.Selectedvendors = []
        var vendordata = result as BPCFact[];
        vendordata.forEach(element => {
          this.Selectedvendors.push(element);
        });
        console.log(this.Selectedvendors);
        this.VendorDataSource = new MatTableDataSource<BPCFact>(this.Selectedvendors);
        this.VendorDataSource.sort = this.CheckListSort;

        if (this.Selectedvendors.length > 0) {
          if (!this.IsVendorListValid) {
            this.IsVendorListValid = true;
            this.ProgressBarValue += 50;
          }
        }
        else {
          if (this.IsVendorListValid) {
            this.IsVendorListValid = false;
            this.ProgressBarValue -= 50;
          }
        }
      }
    });
  }
  GetAllVendors() {
    this._factService.GetAllVendors().subscribe(
      (data) => {
        this.Vendors = data as BPCFact[];
        console.log("All Vendors", this.Vendors);
      },
      (err) => {
      }
    );
  }
  clearVendorTable(index: any) {
    this.Selectedvendors.splice(index, 1);
    this.VendorDataSource = new MatTableDataSource<BPCFact>(this.Selectedvendors);
    this.VendorDataSource.sort = this.CheckListSort;

    if (this.Selectedvendors.length == 0) {
      if (this.IsVendorListValid) {
        this.ProgressBarValue -= 50;
        this.IsVendorListValid = false;
      }
    }
  }
  InitializeVendorsTable() {
    console.log("Selectedvendors", this.Selectedvendors);
    this.VendorDataSource = new MatTableDataSource<BPCFact>(this.Selectedvendors);
    this.VendorDataSource.sort = this.CheckListSort;
  }

  SaveClicked(action: any) {
    if (action == 'Save') {
      if (this.HeaderFormGroup.valid) {
        this.openConfirmationDialog(action);
      }
      else {
        this.notificationSnackBarComponent.openSnackBar("Header Details Required To Save", SnackBarStatus.danger);
        this.showValidationErrors(this.HeaderFormGroup);
      }
    }
    else {
      if (this.HeaderFormGroup.valid) {
        if (this.RadioBtnValue === "Dialog" && this.TextAreaValue !== "") {
          if (this.Selectedvendors.length > 0) {
            this.openConfirmationDialog(action);
          }
          else {
            this.notificationSnackBarComponent.openSnackBar("Please Select Atleast One Vendor", SnackBarStatus.danger);
          }
        }
        else if (this.RadioBtnValue === "CheckList" && this.CheckListItems.length > 0) {
          if (this.Selectedvendors.length > 0) {
            this.openConfirmationDialog(action);
          }
          else {
            this.notificationSnackBarComponent.openSnackBar("Please Select Atleast One Vendor", SnackBarStatus.danger);
          }
        }
        else {
          if (this.RadioBtnValue === "Dialog") {
            this.notificationSnackBarComponent.openSnackBar("Please Fill Content For Dialog", SnackBarStatus.danger);
          }
          else {
            this.notificationSnackBarComponent.openSnackBar("Please Fill Atleast One Item", SnackBarStatus.danger);
          }
        }
      } else {
        this.notificationSnackBarComponent.openSnackBar("Please Fill Details for Header", SnackBarStatus.danger);

        this.showValidationErrors(this.HeaderFormGroup)
      }
    }
  }
  CreateCAPAReq(action: any) {
    this.isProgressBarVisibile = true;
    this.GetReqDetails();
    this.CAPAView.Status = action;
    this._capaService.CreateCAPAReq(this.CAPAView).subscribe(
      (response) => {
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar("Vendor Success", SnackBarStatus.success);
        this.ClearData();
      },
      (err) => {
        this.isProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
      }
    );
  }
  ClearData() {
    this.Selectedvendors = [];
    this.TextAreaValue = "";
    this.VendorDataSource = new MatTableDataSource<BPCFact>(this.Selectedvendors);
    this.CheckListItems = [];
    this.CheckListDataSource = new MatTableDataSource<CAPAReqItem>(this.CheckListItems);
    this.CAPAView = new CAPAReqView();
    this.CAPAView.CAPAReqItems = [];
    this.CAPAView.CAPAReqPartners = [];
    this.GetCAPADetilsByReqId();
  }
  DueDateChange(event) {
    const PreviousDueDate=this._datePipe.transform(this.CheckListFormGroup.get('DueDate').value,'yyyy-MM-dd');
    this.CheckListFormGroup.get('DueDate').patchValue(event.value);
    var newDueDate=this._datePipe.transform(event.value,'yyyy-MM-dd');

    console.log("PreviousDueDate",PreviousDueDate,newDueDate);
    this.CheckListItems.forEach(element => {
      if(PreviousDueDate == element.DueDate)
      {
        element.DueDate = newDueDate;
      }
    });
    this.CheckListDataSource = new MatTableDataSource<CAPAReqItem>(this.CheckListItems);

    this.UpdateProgressbar();
  }
  StartDateChange(event) {
    this.HeaderFormGroup.get('StartDate').patchValue(event.value);
    var dates = new Date(event.value);
    this.DueMinDate = new Date(dates.getFullYear(), dates.getMonth(), dates.getDate() + 1);

    this.UpdateProgressbar();
  }
  GetReqDetails() {
    this.CAPAView.CAPAReqItems = [];
    this.CAPAView.CAPAReqPartners = [];
    //Header
    this.CAPAView.ReqID = parseInt(this.SelectedID);
    this.CAPAView.Text = this.HeaderFormGroup.get('Text').value;
    this.CAPAView.DueDate = this._datePipe.transform(this.HeaderFormGroup.get('DueDate').value, 'yyyy-MM-dd');
    this.CAPAView.StartDate = this.HeaderFormGroup.get('StartDate').value;
    this.CAPAView.Recurring = this.HeaderFormGroup.get('Recurring').value;
    if (this.CAPAView.Recurring === "Yes") {
      this.CAPAView.Interval = this.HeaderFormGroup.get('Interval').value;
      this.CAPAView.Ocurrence = this.HeaderFormGroup.get('Ocurrence').value;
    }
    this.CAPAView.BuyerID = this.currentUserName;
    this.CAPAView.BuyerMailID = this.BuyerEmailAddress;

    if (this.RadioBtnValue === "CheckList") {
      this.CheckListItems.forEach(items => {
        if (items.IsDocumentRequired === "Yes") {
          items.IsDocumentRequired = true;
        }
        else {
          items.IsDocumentRequired = false;
        }
        this.CAPAView.CAPAReqItems.push(items);
      });
      this.TextAreaValue = "";
    }
    else {
      this.CAPAView.CAPAReqItems = [];
      this.CheckListItems = [];
      this.CheckListDataSource = new MatTableDataSource<CAPAReqItem>(this.CheckListItems);
      var item = new CAPAReqItem();
      item.Text = this.TextAreaValue;
      item.DueDate = this._datePipe.transform(this.HeaderFormGroup.get('DueDate').value, 'yyyy-MM-dd');
      this.CAPAView.CAPAReqItems.push(item);
    }
    //Vendors
    this.Selectedvendors.forEach(vendors => {
      var ven = new CAPAReqPartner();
      ven.PatnerID = vendors.PatnerID;
      if (vendors.Email1 != null || vendors.Email1 != "") {
        ven.Email = vendors.Email1;
      }
      else {
        ven.Email = vendors.Email2;
      }
      this.CAPAView.CAPAReqPartners.push(ven);
    });
    console.log("GetReqDetails", this.CAPAView);
  }
  openConfirmationDialog(Actiontype: string, Catagory = "CAPA Request"): void {
    // if (Actiontype == "Open") {
    //   Actiontype = "Submit";
    // }
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: Catagory
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          this.CreateCAPAReq(Actiontype);
        }
      });
  }
  NextTab(index: any) {
    this.NextTabIndex = index + 1;
  }
  PreviousTab(index: any) {
    this.NextTabIndex = index - 1;
  }
}
