import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormArray, AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { BPCASNItemSES, BPCASNItemSESQty } from 'app/models/ASN';
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-asnitem-service-dialog',
  templateUrl: './asnitem-service-dialog.component.html',
  styleUrls: ['./asnitem-service-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ASNItemServiceDialogComponent implements OnInit {
  BPCASNItemSESes: BPCASNItemSES[] = [];
  BPCASNItemSESDisplayedColumns: string[] = [
    'Item',
    'ServiceNo',
    'ServiceItem',
    'OrderedQty',
    'OpenQty',
    'ServiceQty',
  ];
  ASNItemSESFormGroup: FormGroup;
  ASNItemSESFormArray: FormArray = this._formBuilder.array([]);
  ASNItemSESDataSource = new BehaviorSubject<AbstractControl[]>([]);
  constructor(
    private _formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public ASNItemSESQty: BPCASNItemSESQty,
    public dialogRef: MatDialogRef<ASNItemServiceDialogComponent>,
  ) { }

  ngOnInit(): void {
    this.InitializeASNItemSES();
    this.InitializeASNItemSESFormGroup();
    this.InitializeASNItemSESFormGroupValue();
  }
  InitializeASNItemSES(): void {
    this.ASNItemSESQty.ASNItemSESes.forEach(x => {
      this.BPCASNItemSESes.push(x);
    });
  }
  InitializeASNItemSESFormGroup(): void {
    this.ASNItemSESFormGroup = this._formBuilder.group({
      ASNItemSESes: this.ASNItemSESFormArray
    });
  }
  ClearASNItems(): void {
    this.ClearFormArray(this.ASNItemSESFormArray);
    this.ASNItemSESDataSource.next(this.ASNItemSESFormArray.controls);
  }
  ClearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }
  InitializeASNItemSESFormGroupValue(): void {
    if (this.BPCASNItemSESes && this.BPCASNItemSESes.length) {
      this.BPCASNItemSESes.forEach((x, i) => {
        this.InsertASNItemsFormGroup(x);
      });
    }
  }

  InsertASNItemsFormGroup(asnItem: BPCASNItemSES): void {
    const row = this._formBuilder.group({
      Item: [asnItem.Item],
      ServiceNo: [asnItem.ServiceNo],
      ServiceItem: [asnItem.ServiceItem],
      OrderedQty: [asnItem.OrderedQty],
      OpenQty: [asnItem.OpenQty],
      ServiceQty: [asnItem.ServiceQty],
    });
    if (!this.ASNItemSESQty.IsEnabled) {
      row.disable();
    }

    this.ASNItemSESFormArray.push(row);
    this.ASNItemSESDataSource.next(this.ASNItemSESFormArray.controls);
    // return row;
  }


  GetASNItemSESValues(): void {
    this.BPCASNItemSESes = [];
    const aSNItemFormArray = this.ASNItemSESFormGroup.get('ASNItemSESes') as FormArray;
    aSNItemFormArray.controls.forEach((x, i) => {
      const item: BPCASNItemSES = new BPCASNItemSES();
      item.Item = x.get('Item').value;
      item.ServiceNo = x.get('ServiceNo').value;
      item.ServiceItem = x.get('ServiceItem').value;
      item.OrderedQty = x.get('OrderedQty').value;
      item.OpenQty = x.get('OpenQty').value;
      item.ServiceQty = x.get('ServiceQty').value;
      this.BPCASNItemSESes.push(item);
      // this.SelectedASNView.ASNItemBatches.push(itemBatch);
    });
  }


  YesClicked(): void {
    this.GetASNItemSESValues();
    this.dialogRef.close(this.BPCASNItemSESes);
  }
  CloseClicked(): void {
    this.dialogRef.close(false);
  }
}
