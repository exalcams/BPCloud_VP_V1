import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MatPaginator, MatTableDataSource, MAT_DIALOG_DATA } from '@angular/material';
import { BPCPayRecord } from 'app/models/customer';
import { DialogData } from 'app/notifications/notification-dialog/dialog-data';

@Component({
  selector: 'app-payment-history-dialog',
  templateUrl: './payment-history-dialog.component.html',
  styleUrls: ['./payment-history-dialog.component.scss']
})
export class PaymentHistoryDialogComponent implements OnInit {

  constructor(public matDialogRef: MatDialogRef<PaymentHistoryDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BPCPayRecord[]) { }
  PayDataSource: MatTableDataSource<BPCPayRecord>;
  @ViewChild(MatPaginator) PayPaginator: MatPaginator;
  PayDisplayedColumns: string[] = [
    // 'InvoiceNumber',
    'PaidAmount',
    'ReferenceNumber',
    'Paymentdate',
  ];

  ngOnInit(): void {
    if (this.data.length) {
      this.PayDataSource = new MatTableDataSource(this.data);
      this.PayDataSource.paginator = this.PayPaginator;
    }

  }
  CloseClicked(): void {
    // console.log('Called');
    this.matDialogRef.close();
  }

}
