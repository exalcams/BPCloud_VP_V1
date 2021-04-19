import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { BPCASNItemSES, BPCASNItemSESQty } from 'app/models/ASN';

@Component({
  selector: 'app-po-fact-service-dialog',
  templateUrl: './po-fact-service-dialog.component.html',
  styleUrls: ['./po-fact-service-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class PoFactServiceDialogComponent implements OnInit {

  POFactSerDataSource:MatTableDataSource<BPCASNItemSES>;
  BPCFactSerDisplayedColumns:string[]=[
    'Item',
    'ServiceNo',
    'ServiceItem',
    'OrderedQty',
    'OpenQty',
    'ServiceQty',
  ];
  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: BPCASNItemSES[],
    public dialogRef: MatDialogRef<PoFactServiceDialogComponent>
  ) { 
    this.POFactSerDataSource=new MatTableDataSource(this.dialogData);
  }

  ngOnInit() {
  }
  YesClicked(): void {
    this.dialogRef.close();
  }
  CloseClicked(): void {
    this.dialogRef.close();
  }

}
