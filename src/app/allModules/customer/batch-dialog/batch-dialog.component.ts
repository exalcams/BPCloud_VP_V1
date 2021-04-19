import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { BPCRetItemBatch } from 'app/models/customer';
import { CustomerService } from 'app/services/customer.service';

@Component({
  selector: 'app-batch-dialog',
  templateUrl: './batch-dialog.component.html',
  styleUrls: ['./batch-dialog.component.scss']
})
export class BatchDialogComponent implements OnInit {
  BatchFormGroup: FormGroup;
  AllReturnItems: BPCRetItemBatch[] = [];
  ReturnItemBatch: BPCRetItemBatch;
  show: boolean;
  status_show: any;
  // ReturnItemDataSource: MatTableDataSource<unknown>;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<BatchDialogComponent>, private frombuilder: FormBuilder, private customerservice: CustomerService) { }
  BatchDataSource: MatTableDataSource<BPCRetItemBatch>;
  BatchDisplayedColumns: string[] = [
    "Batch",
    "RetQty",
    "Remove"
  ]
  ngOnInit() {
    this.status_show = this.data.status
    if (this.data.status == "submitted") {
      this.show = true
    }
    this.InitialiseBAtchFormGroup();
    console.log("batch data" + this.data.status)
    this.ReturnItemBatch = this.data.selecteditem as BPCRetItemBatch;

    this.AllReturnItems = this.data.batchlist as BPCRetItemBatch[];
    console.log("return" + this.AllReturnItems);
    this.BatchDataSource = new MatTableDataSource(this.AllReturnItems);

    // console.log(this.ReturnItemBatch);
    if (!this.AllReturnItems)
      this.GetBatchByRet();

  }

  InitialiseBAtchFormGroup() {
    this.BatchFormGroup = this.frombuilder.group({
      Batch: ['', Validators.required],
      RetQty: ['', Validators.required]
    }

    )
  }
  GetBatchByRet() {
    this.customerservice.GetAllReturnbatch(this.ReturnItemBatch.RetReqID).subscribe(
      (data) => {

        this.AllReturnItems = data as BPCRetItemBatch[],

          //  console.log("batch"+this.Batchlist)
          this.BatchDataSource = new MatTableDataSource(this.AllReturnItems);
      },
      (err) => {
        console.log(err);
      }
    )
  }
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
    this.dialogRef.close(this.AllReturnItems);
  }
  AddBatchToTable() {

    if (this.BatchFormGroup.valid) {
      var RItem = new BPCRetItemBatch();
      RItem.Batch = this.BatchFormGroup.get('Batch').value;
      RItem.RetQty = parseInt(this.BatchFormGroup.get('RetQty').value);
      RItem.Client = this.ReturnItemBatch.Client;
      RItem.Company = this.ReturnItemBatch.Company;
      RItem.Item = this.ReturnItemBatch.Item;
      RItem.PatnerID = this.ReturnItemBatch.PatnerID;
      RItem.RetReqID = this.ReturnItemBatch.RetReqID;
      RItem.Type = this.ReturnItemBatch.Type;
      //  RItem.ModifiedOn=RItem.ModifiedBy=RItem.CreatedOn=RItem.CreatedBy=null;

      console.log(RItem);

      this.AllReturnItems.push(RItem);
      this.BatchDataSource = new MatTableDataSource(this.AllReturnItems);
      console.log(this.BatchDataSource);
      // this.ResetReturnItemFormGroup();
      // this.selectedDocCenterMaster = new BPCDocumentCenterMaster();
    } else {
      // this.ShowValidationErrors(this.ReturnItemFormGroup);
    }



  }
  RemoveReturnBatchItemFromTable(item: BPCRetItemBatch): void {
    const index: number = this.AllReturnItems.indexOf(item);
    if (index > -1) {
      this.AllReturnItems.splice(index, 1);
    }
    this.BatchDataSource = new MatTableDataSource(this.AllReturnItems);

  }

  YesClicked() {
    if (this.AllReturnItems.length) {
      var rQty = 0;
      this.AllReturnItems.forEach(x => rQty = x.RetQty + rQty);
      if (rQty == this.ReturnItemBatch.RetQty)
        this.dialogRef.close(this.AllReturnItems);

    }
    else if(!this.AllReturnItems.length){
      this.CloseClicked();
    }

  }
}
