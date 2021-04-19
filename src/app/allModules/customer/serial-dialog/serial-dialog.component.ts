import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { BPCRetItemSerial } from 'app/models/customer';
import { CustomerService } from 'app/services/customer.service';

@Component({
  selector: 'app-serial-dialog',
  templateUrl: './serial-dialog.component.html',
  styleUrls: ['./serial-dialog.component.scss']
})
export class SerialDialogComponent implements OnInit {


  SerailFormGroup: FormGroup;
  AllReturnItems: BPCRetItemSerial[] = [];
  ReturnItemSerial: BPCRetItemSerial;
  SerialTabledata: BPCRetItemSerial[];
  status_show: any;
  show: boolean;
  // ReturnItemDataSource: MatTableDataSource<unknown>;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SerialDialogComponent>, private frombuilder: FormBuilder, private customerservice: CustomerService) { }
  SerialDataSource: MatTableDataSource<BPCRetItemSerial>;
  SerialDisplayedColumns: string[] = [
    "Serial",
    "RetQty",
    "Remove"
  ]
  ngOnInit() {
    this.status_show = this.data.status
    if (this.data.status == "submitted") {
      this.show = true
    }
    this.InitialiseSerialFormGroup();
    this.ReturnItemSerial = this.data.selecteditem as BPCRetItemSerial;

    this.AllReturnItems = this.data.SerialList as BPCRetItemSerial[];
    if (!this.AllReturnItems)
      this.GetSerialByRet();

    // console.log("return"+this.AllReturnItems.values());
    this.SerialDataSource = new MatTableDataSource(this.AllReturnItems);

    // console.log(this.ReturnItemBatch);

  }

  InitialiseSerialFormGroup() {
    this.SerailFormGroup = this.frombuilder.group({
      Serial: ['', Validators.required],
      RetQty: ['', Validators.required]
    }

    )
  }
  GetSerialByRet() {
    this.customerservice.GetAllReturnSerial(this.ReturnItemSerial.RetReqID).subscribe(
      (data) => {
        this.AllReturnItems = data as BPCRetItemSerial[],
          this.SerialTabledata = this.AllReturnItems;
        //  console.log("batch"+this.Batchlist)
        this.SerialDataSource = new MatTableDataSource(this.AllReturnItems);
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
  AddSerialToTable() {

    if (this.SerailFormGroup.valid) {
      var RItem = new BPCRetItemSerial();
      RItem.Serial = this.SerailFormGroup.get('Serial').value;
      RItem.RetQty = parseInt(this.SerailFormGroup.get('RetQty').value);
      RItem.Client = this.ReturnItemSerial.Client;
      RItem.Company = this.ReturnItemSerial.Company;
      RItem.Item = this.ReturnItemSerial.Item;
      RItem.PatnerID = this.ReturnItemSerial.PatnerID;
      RItem.RetReqID = this.ReturnItemSerial.RetReqID;
      RItem.Type = this.ReturnItemSerial.Type;
      //  RItem.ModifiedOn=RItem.ModifiedBy=RItem.CreatedOn=RItem.CreatedBy=null;

      console.log(RItem);

      this.AllReturnItems.push(RItem);
      this.SerialDataSource = new MatTableDataSource(this.AllReturnItems);
      console.log(this.SerialDataSource);
      // this.ResetReturnItemFormGroup();
      // this.selectedDocCenterMaster = new BPCDocumentCenterMaster();
    } else {
      // this.ShowValidationErrors(this.ReturnItemFormGroup);
    }



  }
  RemoveReturnSerialItemFromTable(item: BPCRetItemSerial): void {
    const index: number = this.AllReturnItems.indexOf(item);
    if (index > -1) {
      this.AllReturnItems.splice(index, 1);
    }
    this.SerialDataSource = new MatTableDataSource(this.AllReturnItems);
  }

  YesClicked() {
    if (this.AllReturnItems.length) {
      var rQty = 0;
      this.AllReturnItems.forEach(x => rQty = x.RetQty + rQty);
      if (rQty == this.ReturnItemSerial.RetQty)

        this.dialogRef.close(this.AllReturnItems);
      console.log(this.AllReturnItems);

    }
    else   if ( !this.AllReturnItems.length) {
      this.CloseClicked();
    }

  }

}
