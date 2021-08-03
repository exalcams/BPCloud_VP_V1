import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatSnackBar, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { BPCRetItemBatch, BPCRetItemView } from 'app/models/customer';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { CustomerService } from 'app/services/customer.service';

@Component({
  selector: 'app-batch-dialog',
  templateUrl: './batch-dialog.component.html',
  styleUrls: ['./batch-dialog.component.scss']
})
export class BatchDialogComponent implements OnInit {
  BatchFormGroup: FormGroup;
  // AllReturnItems: BPCRetItemBatch[] = [];
  ReturnItem: BPCRetItemView;
  ReturnItemBatches: BPCRetItemBatch[] = [];
  BatchDataSource: MatTableDataSource<BPCRetItemBatch>;
  BatchDisplayedColumns: string[] = [
    "Batch",
    "RetQty",
    "Remove"
  ];
  show: boolean;
  status_show: any;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  // ReturnItemDataSource: MatTableDataSource<unknown>;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<BatchDialogComponent>,
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
    this.InitialiseBAtchFormGroup();
    this.ReturnItem = this.data.selecteditem as BPCRetItemView;
    if (this.ReturnItem.Batches && this.ReturnItem.Batches.length) {
      this.ReturnItem.Batches.forEach(x => {
        this.ReturnItemBatches.push(x);
      });
    }
    this.BatchDataSource = new MatTableDataSource(this.ReturnItemBatches);
    // console.log("batch data" + this.data.status);
    // this.ReturnItemBatch = this.data.selecteditem as BPCRetItemBatch;

    // this.AllReturnItems = this.data.batchlist as BPCRetItemBatch[];
    // console.log("return" + this.AllReturnItems);
    // this.BatchDataSource = new MatTableDataSource(this.AllReturnItems);

    // // console.log(this.ReturnItemBatch);
    // if (!this.AllReturnItems) {
    //   this.GetBatchByRet();
    // }

  }

  InitialiseBAtchFormGroup(): void {
    this.BatchFormGroup = this.frombuilder.group({
      Batch: ['', Validators.required],
      RetQty: ['', Validators.required]
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
  ResetItemBatchFormGroup(): void {
    this.ResetFormGroup(this.BatchFormGroup);
  }
  // GetBatchByRet() {
  //   this.customerservice.GetAllReturnbatch(this.ReturnItemBatch.RetReqID).subscribe(
  //     (data) => {

  //       this.AllReturnItems = data as BPCRetItemBatch[],

  //         //  console.log("batch"+this.Batchlist)
  //         this.BatchDataSource = new MatTableDataSource(this.AllReturnItems);
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
    this.dialogRef.close(this.ReturnItemBatches);
  }
  AddBatchToTable(): void {
    if (this.BatchFormGroup.valid) {
      const RItem = new BPCRetItemBatch();
      RItem.Batch = this.BatchFormGroup.get('Batch').value;
      RItem.RetQty = +this.BatchFormGroup.get('RetQty').value;
      RItem.Client = this.ReturnItem.Client;
      RItem.Company = this.ReturnItem.Company;
      RItem.Item = this.ReturnItem.Item;
      RItem.PatnerID = this.ReturnItem.PatnerID;
      RItem.RetReqID = this.ReturnItem.RetReqID;
      RItem.Type = this.ReturnItem.Type;
      //  RItem.ModifiedOn=RItem.ModifiedBy=RItem.CreatedOn=RItem.CreatedBy=null;
      // console.log(RItem);
      this.ReturnItemBatches.push(RItem);
      this.BatchDataSource = new MatTableDataSource(this.ReturnItemBatches);
      // console.log(this.BatchDataSource);
      this.ResetItemBatchFormGroup();
      // this.ResetReturnItemFormGroup();
      // this.selectedDocCenterMaster = new BPCDocumentCenterMaster();
    } else {
      // this.ShowValidationErrors(this.ReturnItemFormGroup);
    }



  }
  RemoveReturnBatchItemFromTable(item: BPCRetItemBatch): void {
    const index: number = this.ReturnItemBatches.indexOf(item);
    if (index > -1) {
      this.ReturnItemBatches.splice(index, 1);
    }
    this.BatchDataSource = new MatTableDataSource(this.ReturnItemBatches);

  }

  YesClicked(): void {
    if (this.ReturnItemBatches.length) {
      let rQty = 0;
      this.ReturnItemBatches.forEach(x => rQty = x.RetQty + rQty);
      if (+(rQty) === (+this.ReturnItem.RetQty)) {
        this.dialogRef.close(this.ReturnItemBatches);
      } else {
        this.notificationSnackBarComponent.openSnackBar('Sum of Batch qty is not matched with Return Qty', SnackBarStatus.danger);
      }
    }
    else if (!this.ReturnItemBatches.length) {
      this.CloseClicked();
    }

  }
}
