import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails, UserWithRole, AppUsage } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { BPCOFHeader, BPCOFItem, POScheduleLineView, BPCOFSubcon, SubconItems, BPCOFHeaderView } from 'app/models/OrderFulFilment';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { BPCInvoiceAttachment, BPCCountryMaster, BPCCurrencyMaster, BPCDocumentCenterMaster } from 'app/models/ASN';
import { SelectionModel } from '@angular/cdk/collections';
import { FuseConfigService } from '@fuse/services/config.service';
import { MasterService } from 'app/services/master.service';
import { FactService } from 'app/services/fact.service';
import { POService } from 'app/services/po.service';
import { CustomerService } from 'app/services/customer.service';
import { ASNService } from 'app/services/asn.service';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';
import { SubconService } from 'app/services/subcon.service';
import * as SecureLS from 'secure-ls';
import { AuthService } from 'app/services/auth.service';

@Component({
  selector: 'app-subcon',
  templateUrl: './subcon.component.html',
  styleUrls: ['./subcon.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class SubconComponent implements OnInit {

  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  SelectedPO: BPCOFHeaderView;
  poStatus: string;
  gateStatus: string;
  grnStatus: string;
  SelectedPONumber: string;
  SelectedScheduleLineView: POScheduleLineView;
  POItems: BPCOFItem[] = [];
  SelectedPOItem: BPCOFItem;
  POScheduleLines: POScheduleLineView[] = [];
  SelectedSlLine = '';
  SelectedItem = '';
  searchText = '';
  AllSubconItems: BPCOFSubcon[] = [];
  SubconItemFormGroup: FormGroup;
  SubconItemDisplayedColumns: string[] = [
    'Date',
    'OrderedQty',
    'ShippedQty',
    'Batch',
    'Remarks',
    'Status',
    'Action'
  ];
  SubconItemDataSource: MatTableDataSource<BPCOFSubcon>;
  @ViewChild(MatPaginator) SubconItemPaginator: MatPaginator;
  @ViewChild(MatSort) SubconItemSort: MatSort;
  ReadyToBeShippedQty: number;
  ProducedQty: number;
  IsDeleteRequired: boolean;
  currentDate: Date;
  lastOrderedQty: number;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _masterService: MasterService,
    private _FactService: FactService,
    private _POService: POService,
    private _CustomerService: CustomerService,
    private _ASNService: ASNService,
    private _subConService: SubconService,
    private _datePipe: DatePipe,
    private _route: ActivatedRoute,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _authService: AuthService,
    private dialog: MatDialog,
    private _formBuilder: FormBuilder) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.SelectedPO = new BPCOFHeaderView();
    this.ReadyToBeShippedQty = 0;
    this.ProducedQty = 0;
    this.IsDeleteRequired = false;
    this.currentDate = new Date();
    this.lastOrderedQty = 0;
  }

  ngOnInit(): void {
    // Retrive authorizationData
    const retrievedObject = this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      // if (this.MenuItems.indexOf('PurchaseIndent') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //   );
      //   this._router.navigate(['/auth/login']);
      // }
    } else {
      this._router.navigate(['/auth/login']);
    }
    this._route.queryParams.subscribe(params => {
      this.SelectedPONumber = params['id'];
    });
    if (!this.SelectedPONumber) {
      this._router.navigate(['/auth/login']);
    }
    this.CreateAppUsage();
    this.InitializeSubconItemFormGroup();
    this.GetPOViewByDocAndPartnerID();
  }

  CreateAppUsage(): void {
    const appUsage: AppUsage = new AppUsage();
    appUsage.UserID = this.currentUserID;
    appUsage.AppName = 'Payment';
    appUsage.UsageCount = 1;
    appUsage.CreatedBy = this.currentUserName;
    appUsage.ModifiedBy = this.currentUserName;
    this._masterService.CreateAppUsage(appUsage).subscribe(
      (data) => {
      },
      (err) => {
        console.error(err);
      }
    );
  }

  ResetControl(): void {

  }

  ResetSubconItemFormGroup(): void {
    this.ResetFormGroup(this.SubconItemFormGroup);
    this.SubconItemFormGroup.get('Date').patchValue(this.currentDate);
    this.SubconItemFormGroup.get('OrderedQty').patchValue(this.lastOrderedQty);
  }

  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }
  ClearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }


  InitializeSubconItemFormGroup(): void {
    this.SubconItemFormGroup = this._formBuilder.group({
      Date: [this.currentDate, Validators.required],
      OrderedQty: ['', [Validators.required, Validators.pattern('^([1-9][0-9]*)([.][0-9]{1,2})?$')]],
      Batch: [''],
      Remarks: [''],
      Status: [''],
    });
  }


  GetPOViewByDocAndPartnerID(): void {
    this._POService.GetPOViewByDocAndPartnerID(this.SelectedPONumber, this.currentUserName).subscribe(
      (data) => {
        this.SelectedPO = data as BPCOFHeaderView;
        if (this.SelectedPO && this.SelectedPO.DocNumber) {
          // this.GetPOSLByDocAndPartnerID();
          this.poStatus = this.SelectedPO.Status;
          this.gateStatus = this.SelectedPO.GateStatus;
          this.grnStatus = this.SelectedPO.GRNStatus;
          this.GetPOItemsByDocAndPartnerID();
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }
  GetPOItemsByDocAndPartnerID(): void {
    this._POService.GetPOItemsByDocAndPartnerID(this.SelectedPO.DocNumber, this.currentUserName).subscribe(
      (data) => {
        this.POItems = data as BPCOFItem[];
        if (this.POItems && this.POItems.length && this.POItems.length > 0) {
          this.LoadSelectedItem(this.POItems[0]);
        }
      },
      (err) => {
        console.error(err);
      }
    );
  }

  // GetPOSLByDocAndPartnerID(): void {
  //   this._subConService.GetPOSLByDocAndPartnerID(this.SelectedPO.DocNumber, this.currentUserName).subscribe(
  //     (data) => {
  //       this.POScheduleLines = data as POScheduleLineView[];
  //       if (this.POScheduleLines && this.POScheduleLines.length && this.POScheduleLines.length > 0) {
  //         this.LoadSelectedSL(this.POScheduleLines[0]);
  //       }
  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }
  // LoadSelectedSL(ScheduleLineView: POScheduleLineView): void {
  //   this.SelectedSlLine = ScheduleLineView.SlLine;
  //   this.SelectedItem = ScheduleLineView.Item;
  //   this.SelectedScheduleLineView = ScheduleLineView;
  //   this.GetSubconBySLAndPartnerID();
  // }
  LoadSelectedItem(item: BPCOFItem): void {
    // this.SelectedSlLine = ScheduleLineView.SlLine;
    this.SelectedPOItem = item;
    this.SelectedItem = item.Item;
    // this.SelectedScheduleLineView = ScheduleLineView;
    this.GetSubconByItemAndPartnerID();
  }

  // GetSubconBySLAndPartnerID(): void {
  //   this._subConService.GetSubconBySLAndPartnerID(this.SelectedPO.DocNumber, this.SelectedItem, this.SelectedSlLine, this.currentUserName).subscribe(
  //     (data) => {
  //       this.ReadyToBeShippedQty = 0;
  //       this.ProducedQty = 0;
  //       this.AllSubconItems = data as BPCOFSubcon[];
  //       this.SubconItemDataSource = new MatTableDataSource(this.AllSubconItems);
  //       if (this.AllSubconItems && this.AllSubconItems.length && this.AllSubconItems.length > 0) {
  //         this.IsDeleteRequired = true;
  //         this.AllSubconItems.forEach(x => {
  //           this.ReadyToBeShippedQty += + x.OrderedQty;
  //           this.ProducedQty += +x.OrderedQty;
  //           this.SubconItemFormGroup.get('OrderedQty').patchValue(x.OrderedQty);
  //         });
  //       } else {
  //         this.IsDeleteRequired = false;
  //       }

  //     },
  //     (err) => {
  //       console.error(err);
  //     }
  //   );
  // }

  GetSubconByItemAndPartnerID(): void {
    this._subConService.GetSubconByItemAndPartnerID(this.SelectedPO.DocNumber, this.SelectedItem, this.currentUserName).subscribe(
      (data) => {
        this.ReadyToBeShippedQty = 0;
        this.ProducedQty = 0;
        this.AllSubconItems = data as BPCOFSubcon[];
        this.SubconItemDataSource = new MatTableDataSource(this.AllSubconItems);
        if (this.AllSubconItems && this.AllSubconItems.length && this.AllSubconItems.length > 0) {
          this.IsDeleteRequired = true;
          this.AllSubconItems.forEach(x => {
            this.ReadyToBeShippedQty += + x.ReadyToBeShippedQty;
            this.ProducedQty += +x.OrderedQty;
            this.SubconItemFormGroup.get('OrderedQty').patchValue(x.OrderedQty);
          });
        } else {
          this.IsDeleteRequired = false;
        }

      },
      (err) => {
        console.error(err);
      }
    );
  }

  AddSubconItemToTable(): void {
    if (this.SubconItemFormGroup.valid) {
      const SubItem = new BPCOFSubcon();
      SubItem.Client = this.SelectedPOItem.Client;
      SubItem.Company = this.SelectedPOItem.Company;
      SubItem.Type = this.SelectedPOItem.Type;
      SubItem.PatnerID = this.SelectedPOItem.PatnerID;
      SubItem.DocNumber = this.SelectedPOItem.DocNumber;
      SubItem.Item = this.SelectedPOItem.Item;
      // SubItem.SlLine = this.SelectedPOItem.SlLine;
      SubItem.Date = this.SubconItemFormGroup.get('Date').value;
      SubItem.OrderedQty = this.SubconItemFormGroup.get('OrderedQty').value;
      SubItem.ReadyToBeShippedQty = this.SubconItemFormGroup.get('OrderedQty').value;
      SubItem.Batch = this.SubconItemFormGroup.get('Batch').value;
      SubItem.Remarks = this.SubconItemFormGroup.get('Remarks').value;
      SubItem.Status = this.SubconItemFormGroup.get('Status').value;
      if (!this.AllSubconItems || !this.AllSubconItems.length) {
        this.AllSubconItems = [];
      }
      this.ProducedQty += +SubItem.OrderedQty;
      this.ReadyToBeShippedQty += +SubItem.ReadyToBeShippedQty;
      if (this.ProducedQty > this.SelectedPOItem.OrderedQty) {
        this.notificationSnackBarComponent.openSnackBar('Cumulative produced quantity should not greater than Order qty', SnackBarStatus.danger);
        this.ProducedQty -= +SubItem.OrderedQty;
        this.ReadyToBeShippedQty -= +SubItem.OrderedQty;
      } else {
        this.AllSubconItems.push(SubItem);
        this.SubconItemFormGroup.get('OrderedQty').patchValue(SubItem.OrderedQty);
        this.lastOrderedQty = SubItem.OrderedQty;
        this.SubconItemDataSource = new MatTableDataSource(this.AllSubconItems);
      }
      // this.ReadyToBeShippedQty = 0;
      // this.ProducedQty = 0;
      // this.AllSubconItems.forEach(x => {
      //   this.ReadyToBeShippedQty += +x.OrderedQty;
      //   this.ProducedQty += +x.OrderedQty;
      // });
      this.ResetSubconItemFormGroup();
    } else {
      this.ShowValidationErrors(this.SubconItemFormGroup);
    }
  }

  RemoveSubconItemFromTable(doc: BPCOFSubcon): void {
    const index: number = this.AllSubconItems.indexOf(doc);
    if (index > -1) {
      this.AllSubconItems.splice(index, 1);
    }
    this.SubconItemDataSource = new MatTableDataSource(this.AllSubconItems);
    this.ProducedQty -= +doc.OrderedQty;
    this.ReadyToBeShippedQty -= +doc.ReadyToBeShippedQty;
    // this.ReadyToBeShippedQty = 0;
    // this.ProducedQty = 0;
    // this.AllSubconItems.forEach(x => {
    //   this.ReadyToBeShippedQty += +x.OrderedQty;
    //   this.ProducedQty += +x.OrderedQty;
    // });
  }
  DeleteClicked(): void {
    this.SetActionToOpenConfirmation('Delete');
  }
  SaveClicked(): void {
    this.SetActionToOpenConfirmation('Save');
  }
  SubmitClicked(): void {
    this.SetActionToOpenConfirmation('Submit');
  }
  SetActionToOpenConfirmation(Actiontype: string): void {
    // if (this.SelectedPurchaseIndentHeader.PurchaseIndentNumber) {
    //     const Catagory = 'PurchaseIndent';
    //     this.OpenConfirmationDialog(Actiontype, Catagory);
    // } else {
    //     const Catagory = 'PurchaseIndent';
    //     this.OpenConfirmationDialog(Actiontype, Catagory);
    // }
    const Catagory = 'Subcon';
    this.OpenConfirmationDialog(Actiontype, Catagory);
  }

  OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
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
          if (Actiontype === 'Save' || Actiontype === 'Submit') {
            this.CreateSubcon(Actiontype);
          } else if (Actiontype === 'Delete') {
            this.DeleteSubcon();
          }
        }
      });
  }

  showErrorNotificationSnackBar(err: any): void {
    console.error(err);
    this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    this.IsProgressBarVisibile = false;
  }

  ShowValidationErrors(formGroup: FormGroup): void {
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

  OpenAttachmentDialog(FileName: string, blob: Blob): void {
    const attachmentDetails: AttachmentDetails = {
      FileName: FileName,
      blob: blob
    };
    const dialogConfig: MatDialogConfig = {
      data: attachmentDetails,
      panelClass: 'attachment-dialog'
    };
    const dialogRef = this.dialog.open(AttachmentDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
  }
  CreateSubcon(Actiontype: string): void {
    const subconItems: SubconItems = new SubconItems();
    this.AllSubconItems.forEach(x => {
      subconItems.items.push(x);
    });
    this.IsProgressBarVisibile = true;
    this._subConService.CreateSubcon(subconItems).subscribe(
      (data) => {
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar(`Subcon ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetSubconByItemAndPartnerID();
      },
      (err) => {
        this.showErrorNotificationSnackBar(err);
      }
    );
  }
  DeleteSubcon(): void {
    this.IsProgressBarVisibile = true;
    this._subConService.DeleteSubcon(this.AllSubconItems[0]).subscribe(
      (data) => {
        this.ResetControl();
        this.notificationSnackBarComponent.openSnackBar(`Subcon deleted successfully`, SnackBarStatus.success);
        this.IsProgressBarVisibile = false;
        this.GetSubconByItemAndPartnerID();
      },
      (err) => {
        this.showErrorNotificationSnackBar(err);
      }
    );
  }
  // getStatusColor(StatusFor: string): string {
  //   switch (StatusFor) {
  //     case 'ASN':
  //       return this.SelectedPO.Status === 'Open' ? 'gray' : this.SelectedPO.Status === 'ACK' ? '#efb577' : '#34ad65';
  //     case 'Gate':
  //       return this.SelectedPO.Status === 'Open' ? 'gray' : this.SelectedPO.Status === 'ACK' ? 'gray' : this.SelectedPO.Status === 'ASN' ? '#efb577' : '#34ad65';
  //     case 'GRN':
  //       return this.SelectedPO.Status === 'Open' ? 'gray' : this.SelectedPO.Status === 'ACK' ? 'gray' : this.SelectedPO.Status === 'ASN' ? 'gray' :
  //         this.SelectedPO.Status === 'Gate' ? '#efb577' : '#34ad65';
  //     default:
  //       return '';
  //   }
  // }
  // getTimeline(StatusFor: string): string {
  //   switch (StatusFor) {
  //     case 'ASN':
  //       return this.SelectedPO.Status === 'Open' ? 'white-timeline' : this.SelectedPO.Status === 'ACK' ? 'orange-timeline' : 'green-timeline';
  //     case 'Gate':
  //       return this.SelectedPO.Status === 'Open' ? 'white-timeline' : this.SelectedPO.Status === 'ACK' ? 'white-timeline' :
  //         this.SelectedPO.Status === 'ASN' ? 'orange-timeline' : 'green-timeline';
  //     case 'GRN':
  //       return this.SelectedPO.Status === 'Open' ? 'white-timeline' : this.SelectedPO.Status === 'ACK' ? 'white-timeline' : this.SelectedPO.Status === 'ASN' ? 'white-timeline' :
  //         this.SelectedPO.Status === 'Gate' ? 'orange-timeline' : 'green-timeline';
  //     default:
  //       return '';
  //   }
  // }

  // getRestTimeline(StatusFor: string): string {
  //   switch (StatusFor) {
  //     case 'ASN':
  //       return this.SelectedPO.Status === 'Open' ? 'white-timeline' : this.SelectedPO.Status === 'ACK' ? 'white-timeline' : 'green-timeline';
  //     case 'Gate':
  //       return this.SelectedPO.Status === 'Open' ? 'white-timeline' : this.SelectedPO.Status === 'ACK' ? 'white-timeline' :
  //         this.SelectedPO.Status === 'ASN' ? 'white-timeline' : 'green-timeline';
  //     case 'GRN':
  //       return this.SelectedPO.Status === 'Open' ? 'white-timeline' : this.SelectedPO.Status === 'ACK' ? 'white-timeline' : this.SelectedPO.Status === 'ASN' ? 'white-timeline' :
  //         this.SelectedPO.Status === 'Gate' ? 'white-timeline' : 'green-timeline';
  //     default:
  //       return '';
  //   }
  // }
  getStatusColor(statusFor: string): string {
    switch (statusFor) {
      case "ASN":
        return this.poStatus === "DueForACK"
          ? "gray"
          : this.poStatus === "DueForASN"
            ? "gray"
            : this.poStatus === "PartialASN"
              ? "#efb577" : "#34ad65";
      case "Gate":
        return this.poStatus === "DueForACK"
          ? "gray"
          : this.poStatus === "DueForASN"
            ? "gray"
            : this.poStatus === "PartialASN"
              ? "gray"
              : this.poStatus === "DueForGate"
                ? "gray"
                : "#34ad65";
      case "GRN":
        return this.poStatus === "DueForACK"
          ? "gray"
          : this.poStatus === "DueForASN"
            ? "gray"
            : this.poStatus === "PartialASN"
              ? "gray"
              : this.poStatus === "DueForGate"
                ? "gray"
                : this.poStatus === "DueForGRN"
                  ? "gray"
                  : this.poStatus === "PartialGRN"
                    ? "#efb577"
                    : "#34ad65";
      default:
        return "";
    }
  }
  getGateStatusColor(): string {
    return this.gateStatus === "DueForGate"
      ? "gray" : this.gateStatus === "PartialGate"
        ? "#efb577" : "#34ad65";
  }
  getGRNStatusColor(): string {
    return this.grnStatus === "DueForGRN"
      ? "gray" : this.grnStatus === "PartialGRN"
        ? "#efb577" : "#34ad65";
  }

  getNextProcess(element: any): void {
    if (this.poStatus === "DueForACK") {
      element.NextProcess = "ACK";
    } else if (this.poStatus === "DueForASN") {
      element.NextProcess = "ASN/SCN";
    } else if (this.poStatus === "PartialASN") {
      element.NextProcess = "ASN/SCN";
    }
    else if (this.poStatus === "DueForGate") {
      element.NextProcess = "Gate";
    } else if (this.poStatus === "PartialGRN") {
      element.NextProcess = "GRN";
    }
    else {
      element.NextProcess = "GRN";
    }
  }
  getTimeline(statusFor: string): string {
    switch (statusFor) {
      case "ASN":
        return this.poStatus === "DueForACK"
          ? "white-timeline"
          : this.poStatus === "DueForASN"
            ? "white-timeline"
            : this.poStatus === "PartialASN"
              ? "orange-timeline" : "green-timeline";
      case "Gate":
        return this.poStatus === "DueForACK"
          ? "white-timeline"
          : this.poStatus === "DueForASN"
            ? "white-timeline"
            : this.poStatus === "PartialASN"
              ? "white-timeline"
              : this.poStatus === "DueForGate"
                ? "white-timeline"
                : "green-timeline";
      case "GRN":
        return this.poStatus === "DueForACK"
          ? "white-timeline"
          : this.poStatus === "DueForASN"
            ? "white-timeline"
            : this.poStatus === "PartialASN"
              ? "white-timeline"
              : this.poStatus === "DueForGate"
                ? "white-timeline"
                : this.poStatus === "DueForGRN"
                  ? "white-timeline"
                  : this.poStatus === "PartialGRN"
                    ? "orange-timeline"
                    : "green-timeline";
      default:
        return "";
    }
  }
  getGateTimeline(): string {
    return this.gateStatus === "DueForGate"
      ? "white-timeline" : this.gateStatus === "PartialGate"
        ? "orange-timeline" : "green-timeline";
  }
  getGRNTimeline(): string {
    return this.grnStatus === "DueForGRN"
      ? "white-timeline" : this.grnStatus === "PartialGRN"
        ? "orange-timeline" : "green-timeline";
  }
  getRestTimeline(statusFor: string): string {
    switch (statusFor) {
      case "ASN":
        return this.poStatus === "DueForACK"
          ? "white-timeline"
          : this.poStatus === "DueForASN"
            ? "white-timeline"
            : this.poStatus === "PartialASN"
              ? this.gateStatus === 'PartialGate' ? "orange-timeline" : "white-timeline"
              : this.poStatus === "DueForGate"
                ? "white-timeline"
                : "green-timeline";
      case "Gate":
        return this.poStatus === "DueForACK"
          ? "white-timeline"
          : this.poStatus === "DueForASN"
            ? "white-timeline"
            : this.poStatus === "PartialASN"
              ? "white-timeline"
              : this.poStatus === "DueForGate"
                ? "white-timeline"
                : this.poStatus === "DueForGRN"
                  ? "white-timeline"
                  : "green-timeline";
      case "GRN":
        return this.poStatus === "DueForACK"
          ? "white-timeline"
          : this.poStatus === "DueForASN"
            ? "white-timeline"
            : this.poStatus === "PartialASN"
              ? "white-timeline"
              : this.poStatus === "DueForGate"
                ? "white-timeline"
                : this.poStatus === "DueForGRN"
                  ? "white-timeline"
                  : this.poStatus === "PartialGRN"
                    ? "white-timeline"
                    : "green-timeline";
      default:
        return "";
    }
  }
  getGateRestTimeline(): string {
    return this.gateStatus === "DueForGate"
      ? "white-timeline" : this.gateStatus === "PartialGate"
        ? this.grnStatus === 'PartialGRN' ? "orange-timeline" : 'white-timeline' : "green-timeline";
  }
  getGRNRestTimeline(): string {
    return this.grnStatus === "DueForGRN"
      ? "white-timeline" : this.grnStatus === "PartialGRN"
        ? "orange-timeline" : "green-timeline";
  }

}
