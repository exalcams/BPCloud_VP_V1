import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource, MatSnackBar } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { BPCASNItem, BPCASNItemBatch, BPCASNItemBatchQty } from 'app/models/ASN';
import { NotificationSnackBarComponent } from '../../../notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from '../../../notifications/notification-snack-bar/notification-snackbar-status-enum';

@Component({
  selector: 'app-asnitem-batch-dialog',
  templateUrl: './asnitem-batch-dialog.component.html',
  styleUrls: ['./asnitem-batch-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ASNItemBatchDialogComponent implements OnInit {
  asnItemBatches: BPCASNItemBatch[] = [];
  ASNItemBatchDataSource: MatTableDataSource<BPCASNItemBatch>;
  ASNItemBatchDisplayColumns: string[] = ['Batch', 'Qty', 'ManufactureDate', 'ExpiryDate', 'Action'];
  ASNItemBatchFormGroup: FormGroup;
  toDay: Date;
  tomorrow: Date;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  constructor(
    private _formBuilder: FormBuilder,
    public snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public ASNItemBatchQty: BPCASNItemBatchQty,
    public dialogRef: MatDialogRef<ASNItemBatchDialogComponent>,
  ) {
    this.toDay = new Date();
    this.tomorrow = new Date();
    this.tomorrow.setDate(this.tomorrow.getDate() + 1);
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit(): void {
    this.ASNItemBatchFormGroup = this._formBuilder.group({
      Batch: ['', Validators.required],
      Qty: ['', [Validators.required, Validators.pattern('^([0-9]{0,10})([.][0-9]{1,3})?$')]],
      ManufactureDate: [''],
      ExpiryDate: [''],
    });
    this.ASNItemBatchQty.ASNItemBatchs.forEach(x => {
      this.asnItemBatches.push(x);
      this.ASNItemBatchDataSource = new MatTableDataSource(this.asnItemBatches);
    });
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
  ResetASNItemBatchFormGroup(): void {
    this.ResetFormGroup(this.ASNItemBatchFormGroup);
  }
  AddASNItemBatchToTable(): void {
    if (this.ASNItemBatchFormGroup.valid) {
      const itemBatch = new BPCASNItemBatch();
      // itemBatch.Client = this.asnItem.Client;
      // itemBatch.Company = this.asnItem.Company;
      // itemBatch.Type = this.asnItem.Type;
      // itemBatch.PatnerID = this.asnItem.PatnerID;
      // itemBatch.ASNNumber = this.asnItem.ASNNumber;
      // itemBatch.Item = this.asnItem.Item;
      itemBatch.Batch = this.ASNItemBatchFormGroup.get('Batch').value;
      itemBatch.Qty = this.ASNItemBatchFormGroup.get('Qty').value;
      itemBatch.ManufactureDate = this.ASNItemBatchFormGroup.get('ManufactureDate').value;
      itemBatch.ExpiryDate = this.ASNItemBatchFormGroup.get('ExpiryDate').value;
      this.asnItemBatches.push(itemBatch);
      this.ASNItemBatchDataSource = new MatTableDataSource(this.asnItemBatches);
      this.ResetASNItemBatchFormGroup();
    } else {
      this.ShowValidationErrors(this.ASNItemBatchFormGroup);
    }
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

  YesClicked(): void {
    if (this.QtyValidation()) {
      this.dialogRef.close(this.asnItemBatches);
    } else {
      this.notificationSnackBarComponent.openSnackBar('Sum of Batch qty is not matched with ASN Qty', SnackBarStatus.danger);
    }
  }

  RemoveASNItemBatchFromTable(bPIdentity: BPCASNItemBatch): void {
    const index: number = this.asnItemBatches.indexOf(bPIdentity);
    if (index > -1) {
      this.asnItemBatches.splice(index, 1);
    }
    this.ASNItemBatchDataSource = new MatTableDataSource(this.asnItemBatches);
  }

  QtyValidation(): boolean {
    let sum: number = 0;
    this.asnItemBatches.forEach(a => {
      const qt = +a.Qty;
      sum = +(sum + qt);
    });
    const asnQ = +this.ASNItemBatchQty.ASNQty;
    return sum === asnQ;
  }

  CloseClicked(): void {
    this.dialogRef.close(false);
  }

}
