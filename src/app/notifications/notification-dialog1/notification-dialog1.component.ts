import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { DialogData1 } from '../notification-dialog/dialog-data';

@Component({
  selector: 'app-notification-dialog1',
  templateUrl: './notification-dialog1.component.html',
  styleUrls: ['./notification-dialog1.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class NotificationDialog1Component implements OnInit {

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogData1,
    public dialogRef: MatDialogRef<NotificationDialog1Component>,
  ) {

  }

  ngOnInit(): void {

  }
  YesClicked(): void {
    this.dialogRef.close(true);
  }

  CloseClicked(): void {
    this.dialogRef.close(false);
  }

}
