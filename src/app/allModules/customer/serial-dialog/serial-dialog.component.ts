import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { BPCRetItemSerial, BPCRetItemView } from 'app/models/customer';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { CustomerService } from 'app/services/customer.service';

@Component({
  selector: 'app-serial-dialog',
  templateUrl: './serial-dialog.component.html',
  styleUrls: ['./serial-dialog.component.scss']
})
export class SerialDialogComponent implements OnInit {
  SerailFormGroup: FormGroup;
  // AllReturnItems: BPCRetItemView[] = [];
  ReturnItem: BPCRetItemView;
  ReturnItemSerials: BPCRetItemSerial[] = [];
  SerialDataSource: MatTableDataSource<BPCRetItemSerial>;
  SerialDisplayedColumns: string[] = [
    "Serial",
    "ReturnQty",
    "Remove"
  ];
  status_show: any;
  show: boolean;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  // ReturnItemDataSource: MatTableDataSource<unknown>;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SerialDialogComponent>,
    private frombuilder: FormBuilder,
    private customerservice: CustomerService,
    public snackBar: MatSnackBar,
  ) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }
  ngOnInit(): void {
    this.status_show = this.data.status;
    if (this.data.status === "submitted") {
      this.show = true;
    }
    this.InitialiseSerialFormGroup();
    this.ReturnItem = this.data.selecteditem as BPCRetItemView;
    if (this.ReturnItem.Serials && this.ReturnItem.Serials.length) {
      this.ReturnItem.Serials.forEach(x => {
        this.ReturnItemSerials.push(x);
      });
    }
    // this.AllReturnItems = this.data.SerialList as BPCRetItemSerial[];
    // if (!this.AllReturnItems) {
    //   this.GetSerialByRet();
    // }

    // console.log("return"+this.AllReturnItems.values());
    this.SerialDataSource = new MatTableDataSource(this.ReturnItemSerials);

    // console.log(this.ReturnItemBatch);

  }

  InitialiseSerialFormGroup(): void {
    this.SerailFormGroup = this.frombuilder.group({
      Serial: ['', Validators.required],
      ReturnQty: ['', [Validators.required, Validators.pattern('^[1-9][0-9]{0,9}$')]]
    }

    );
  }
  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }
  // ClearASNItems(): void {
  //   this.ClearFormArray(this.ASNItemFormArray);
  //   this.ASNItemDataSource.next(this.ASNItemFormArray.controls);
  // }
  ResetItemSerialFormGroup(): void {
    this.ResetFormGroup(this.SerailFormGroup);
  }
  // GetSerialByRet() {
  //   this.customerservice.GetAllReturnSerial(this.ReturnItemSerial.RetReqID).subscribe(
  //     (data) => {
  //       this.AllReturnItems = data as BPCRetItemSerial[],
  //         this.SerialTabledata = this.AllReturnItems;
  //       //  console.log("batch"+this.Batchlist)
  //       this.SerialDataSource = new MatTableDataSource(this.AllReturnItems);
  //     },
  //     (err) => {
  //       console.log(err);
  //     }
  //   );
  // }
  decimalOnly(event): boolean {
    // this.AmountSelected();
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode === 8 || charCode === 9 || charCode === 13 || charCode === 46
      || charCode === 37 || charCode === 39 || charCode === 123 || charCode === 190) {
      return true;
    }
    else if (charCode < 48 || charCode > 57) {
      return false;
    }
    return true;
  }
  CloseClicked(): void {
    this.dialogRef.close(null);
  }
  AddSerialToTable(): void {
    if (this.SerailFormGroup.valid) {
      const RItem = new BPCRetItemSerial();
      RItem.Serial = this.SerailFormGroup.get('Serial').value;
      RItem.ReturnQty = +this.SerailFormGroup.get('ReturnQty').value;
      RItem.Client = this.ReturnItem.Client;
      RItem.Company = this.ReturnItem.Company;
      RItem.Type = this.ReturnItem.Type;
      RItem.PatnerID = this.ReturnItem.PatnerID;
      RItem.RetReqID = this.ReturnItem.RetReqID;
      RItem.Item = this.ReturnItem.Item;
      //  RItem.ModifiedOn=RItem.ModifiedBy=RItem.CreatedOn=RItem.CreatedBy=null;
      // console.log(RItem);
      this.ReturnItemSerials.push(RItem);
      this.SerialDataSource = new MatTableDataSource(this.ReturnItemSerials);
      this.ResetItemSerialFormGroup();
      // console.log(this.SerialDataSource);
      // this.ResetReturnItemFormGroup();
      // this.selectedDocCenterMaster = new BPCDocumentCenterMaster();
    } else {
      this.ShowValidationErrors();
    }
  }
  ShowValidationErrors(): void {
    Object.keys(this.SerailFormGroup.controls).forEach(key => {
      this.SerailFormGroup.get(key).markAsTouched();
      this.SerailFormGroup.get(key).markAsDirty();
    });
  }
  RemoveReturnSerialItemFromTable(item: BPCRetItemSerial): void {
    const index: number = this.ReturnItemSerials.indexOf(item);
    if (index > -1) {
      this.ReturnItemSerials.splice(index, 1);
    }
    this.SerialDataSource = new MatTableDataSource(this.ReturnItemSerials);
  }

  YesClicked(): void {
    if (this.ReturnItemSerials.length) {
      let rQty = 0;
      this.ReturnItemSerials.forEach(x => rQty = x.ReturnQty + rQty);
      if (+(rQty) === (+this.ReturnItem.ReturnQty)) {
        this.dialogRef.close(this.ReturnItemSerials);
      } else {
        this.notificationSnackBarComponent.openSnackBar('Sum of Serial qty is not matched with Return Qty', SnackBarStatus.danger);
      }
      // console.log(this.AllReturnItems);

    }
    else if (!this.ReturnItem.Serials.length) {
      this.CloseClicked();
    }

  }

}
