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
import { Router } from '@angular/router';
import { AuthenticationDetails } from 'app/models/master';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-create-capa',
  templateUrl: './create-capa.component.html',
  styleUrls: ['./create-capa.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class CreateCapaComponent implements OnInit {

  SelectedTabIndex = null;
  RadioBtnValue = "Dialog";
  isProgressBarVisibile = false;
  TextAreaMinRow = 10;
  TextAreaMaxRow = 20
  Types = ["Correctie Action", "Preventive Action", "Document Collection", "Root Cause Analysis"];
  IsDocumentRequireds = ["Yes", "No"];
  Recurring = ["Yes", "No"];
  CheckListFormGroup: FormGroup;
  notificationSnackBarComponent: NotificationSnackBarComponent;

  HeaderFormGroup: FormGroup;
  Vendors: BPCFact[] = [];
  Selectedvendors: BPCFact[] = [];
  TextAreaValue = "";
  NextTabIndex = 0;
  ProgressBarValue = 0;
  CAPAView: CAPAReqView;
  @ViewChild(MatPaginator) Paginator: MatPaginator;
  @ViewChild(MatSort) CheckListSort: MatSort;
  CheckListDataSource = new MatTableDataSource<CAPAReqItem>();
  VendorDataSource = new MatTableDataSource<BPCFact>();

  CheckListItems: CAPAReqItem[] = [];
  data: CAPAvendor;
  CheckListDisplayColumns = ["Text", "DueDate", "Priority", "Impact", "Department", "Type", "IsDocumentRequired", "Action"];
  VendorTableDisplayedColumns = ["S.No", "Vendor", "VendorName", "GSTNumber", "City", "Action"];
  Priorities = ["None", "Low", "Medium", "High"];
  Impacts = ["None", "Low", "Medium", "High"];
  SelectedItemIndex: any;
  SelectedItemRow: CAPAReqItem;
  IsFooterDisable = false;
  authenticationDetails: any;
  currentUserID: any;
  currentUserName: any;
  currentUserRole: any;
  MenuItems: any;
  BuyerEmailAddress: any;
  IsRecurring: any;
  minDate: Date;
  maxDate: Date;
  DueMinDate: Date;
  ISHeaderFormValid = false;
  IsItem = false;
  ISCheckListFormValid = false;
  IsVendorListValid=false;
  constructor(private _formBuilder: FormBuilder, private dialog: MatDialog,
    private _factService: FactService,
    private _datePipe: DatePipe,
    private _capaService: CapaService, public snackBar: MatSnackBar,
    private _router: Router) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);

    this.data = new CAPAvendor();
    this.CAPAView = new CAPAReqView();

    var TodayDate = new Date();
    this.minDate = new Date(TodayDate.getFullYear(), TodayDate.getMonth(), TodayDate.getDate());
    this.maxDate = new Date(TodayDate.getFullYear() + 5, 5, 30, TodayDate.getHours(), TodayDate.getMinutes(), TodayDate.getSeconds());

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

      if (this.MenuItems.indexOf('CAPACreate') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this.GetAllVendors();
    this.InitializeCheckListFormGroup();
    this.InitializeHeaderFormGroup();
    this.InitializeVendorsTable();
  }
  TabSelected(event): void {
    this.SelectedTabIndex = parseInt(event);
  }
  RadioBtnChanged(event): void {
    this.RadioBtnValue = event.value;
    console.log('RadioBtnChanged');
    if(this.IsItem || this.ISCheckListFormValid)
    {
      this.ProgressBarValue-=25;
      console.log('Items',this.IsItem,this.ISCheckListFormValid);
      this.IsItem=false;
      this.ISCheckListFormValid=false;
    }
    
    if(this.RadioBtnValue == "Dialog" && this.TextAreaValue != "")
    {
      this.IsItem=true;
      this.ProgressBarValue+=25;
    }
    else
    {
      if(this.CheckListItems.length > 0)
      {
        this.ISCheckListFormValid=true;
        this.ProgressBarValue+=25;
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
  AddToCheckListTable() {
    if (this.CheckListFormGroup.valid) {
      const item = new CAPAReqItem();
      item.Text = this.CheckListFormGroup.get('Text').value;
      item.DueDate = this._datePipe.transform(this.CheckListFormGroup.get('DueDate').value,'yyyy-MM-dd');
      item.Priority = this.CheckListFormGroup.get('Priority').value;
      item.Impact = this.CheckListFormGroup.get('Impact').value;
      item.Department = this.CheckListFormGroup.get('Department').value;
      item.CType = this.CheckListFormGroup.get('Type').value;
      item.IsDocumentRequired = this.CheckListFormGroup.get('IsDocumentRequired').value;

      if (this.SelectedItemIndex >= 0 && this.SelectedItemIndex != null) {
        this.CheckListItems[this.SelectedItemIndex].Text = this.CheckListFormGroup.get('Text').value;
        this.CheckListItems[this.SelectedItemIndex].DueDate = this._datePipe.transform(this.CheckListFormGroup.get('DueDate').value,'yyyy-MM-dd');
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

    this.UpdateProgressbar();//To Update Progress Bar
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
  DueDateChange(event) {
    const PreviousDueDate=this._datePipe.transform(this.CheckListFormGroup.get('DueDate').value,'yyyy-MM-dd');
    this.CheckListFormGroup.get('DueDate').patchValue(event.value);
    console.log("PreviousDueDate",PreviousDueDate);
    this.CheckListItems.forEach(element => {
      var newDueDate=this._datePipe.transform(event.value,'yyyy-MM-dd');
      if(PreviousDueDate == element.DueDate)
      {
        element.DueDate = newDueDate;
      }
    });
    this.CheckListDataSource = new MatTableDataSource<CAPAReqItem>(this.CheckListItems);

    this.UpdateProgressbar();//To Update Progress Bar
  }
  StartDateChange(event) {
    this.HeaderFormGroup.get('StartDate').patchValue(event.value);
    var dates = new Date(event.value);
    this.DueMinDate = new Date(dates.getFullYear(), dates.getMonth(), dates.getDate() + 1);
    // console.log(this.DueMinDate,dates.getFullYear(),dates.getMonth(),dates.getDate(),dates);


    this.UpdateProgressbar();//To Update Progress Bar
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
  clearHeaderFormGroup(): void {
    this.HeaderFormGroup.reset();
    Object.keys(this.HeaderFormGroup.controls).forEach(key => {
      this.HeaderFormGroup.get(key).markAsUntouched();
    });
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
        this.VendorDataSource = new MatTableDataSource<BPCFact>(this.Selectedvendors);
        this.VendorDataSource.paginator = this.Paginator;

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
  GetAllVendors() {
    this.isProgressBarVisibile = true;
    this._factService.GetAllVendors().subscribe(
      (data) => {
        this.Vendors = data as BPCFact[];
        this.isProgressBarVisibile = false;

      },
      (err) => {

      }
    );
  }
  clearVendorTable(index: any) {
    this.Selectedvendors.splice(index, 1);
    this.VendorDataSource = new MatTableDataSource<BPCFact>(this.Selectedvendors);
    this.VendorDataSource.paginator = this.Paginator;
    this.VendorDataSource.sort = this.CheckListSort;

    if (this.Selectedvendors.length == 0) {
      if(this.IsVendorListValid)
      {
        this.ProgressBarValue -= 50;
        this.IsVendorListValid=false;
      }
    }
  }
  InitializeVendorsTable() {
    this.VendorDataSource = new MatTableDataSource<BPCFact>(this.Selectedvendors);
    this.VendorDataSource.paginator = this.Paginator;
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
        // if (action == "Open") {
        this.IsFooterDisable = true;
        this.clearAll();
        // }
        this.notificationSnackBarComponent.openSnackBar(`CAPA Request ${action} Success`, SnackBarStatus.success);
        this.isProgressBarVisibile = false;
      },
      (err) => {
        this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
        this.isProgressBarVisibile = false;
      }
    );
  }
  GetReqDetails() {
    this.CAPAView.CAPAReqItems = [];
    this.CAPAView.CAPAReqPartners = [];
    //Header
    this.CAPAView.Text = this.HeaderFormGroup.get('Text').value;

    this.CAPAView.DueDate = this._datePipe.transform(this.HeaderFormGroup.get('DueDate').value, 'yyyy-MM-dd');

    this.CAPAView.StartDate = this._datePipe.transform(this.HeaderFormGroup.get('StartDate').value, 'yyyy-MM-dd');
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
    }
    else {
      var item = new CAPAReqItem();
      item.Text = this.TextAreaValue;
      item.DueDate =  this._datePipe.transform(this.HeaderFormGroup.get('DueDate').value, 'yyyy-MM-dd');
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
  clearAll() {
    this.clearCheckListFormGroup();
    this.clearHeaderFormGroup();
    this.Selectedvendors = [];
    this.TextAreaValue = "";
    this.VendorDataSource = new MatTableDataSource<BPCFact>(this.Selectedvendors);
    this.CheckListItems = [];
    this.CheckListDataSource = new MatTableDataSource<CAPAReqItem>(this.CheckListItems);
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
