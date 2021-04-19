import { Component, OnInit, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-asnrelease-dialog',
  templateUrl: './asnrelease-dialog.component.html',
  styleUrls: ['./asnrelease-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class ASNReleaseDialogComponent implements OnInit {
  ASNDispatchFormGroup: FormGroup;
  toDay: Date;
  constructor(
    private _formBuilder: FormBuilder,
    @Inject(MAT_DIALOG_DATA) public message: string,
    public dialogRef: MatDialogRef<ASNReleaseDialogComponent>,
  ) {
    this.toDay = new Date();
  }

  ngOnInit(): void {
    this.ASNDispatchFormGroup = this._formBuilder.group({
      DispatchedOn: [this.toDay, Validators.required],
    });
  }
  YesClicked(): void {
    if (this.ASNDispatchFormGroup.valid) {
      const DispatchedOn = this.ASNDispatchFormGroup.get('DispatchedOn').value as Date;
      this.dialogRef.close(DispatchedOn);
    } else {
      Object.keys(this.ASNDispatchFormGroup.controls).forEach(key => {
        if (!this.ASNDispatchFormGroup.get(key).valid) {
          console.log(key);
        }
        this.ASNDispatchFormGroup.get(key).markAsTouched();
        this.ASNDispatchFormGroup.get(key).markAsDirty();
      });
    }
  }
  CloseClicked(): void {
    this.dialogRef.close(false);
  }

}
