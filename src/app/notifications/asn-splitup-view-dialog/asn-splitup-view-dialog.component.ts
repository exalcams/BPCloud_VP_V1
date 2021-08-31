import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ASNSplitView } from 'app/models/ASN';
import { DialogData } from '../notification-dialog/dialog-data';

@Component({
  selector: 'app-asn-splitup-view-dialog',
  templateUrl: './asn-splitup-view-dialog.component.html',
  styleUrls: ['./asn-splitup-view-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class AsnSplitupViewDialogComponent implements OnInit {
  PriceData:ASNSplitView=new ASNSplitView();
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: ASNSplitView,
    public dialogRef: MatDialogRef<AsnSplitupViewDialogComponent>
  ) { 
    this.PriceData=this.dialogData;
  }

  ngOnInit() {
  }

}
