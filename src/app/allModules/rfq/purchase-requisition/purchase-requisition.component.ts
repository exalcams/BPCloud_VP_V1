import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

@Component({
  selector: 'app-purchase-requisition',
  templateUrl: './purchase-requisition.component.html',
  styleUrls: ['./purchase-requisition.component.scss']
})
export class PurchaseRequisitionComponent implements OnInit {
  RFQDisplayedColumns: string[] = ['Type', 'RFQID', 'Date', 'Expiry', 'full', 'Next'];
  RFQDataSource = new MatTableDataSource<RFQData>(RFQDetails);
  constructor() { }

  ngOnInit(): void {
  }

}

export interface RFQData {
  Type: any;
  RFQID: any;
  Date: any;
  Expiry: any;

}
const RFQDetails: RFQData[] = [
  {
    Type: 'AN', RFQID: '600000075', Date: '12/08/2020', Expiry: '22/08/2020'
  },
  {
    Type: 'AN', RFQID: '600000075', Date: '12/08/2020', Expiry: '22/08/2020'
  },
  {
    Type: 'AN', RFQID: '600000075', Date: '12/08/2020', Expiry: '22/08/2020'
  },
  {
    Type: 'AN', RFQID: '600000075', Date: '12/08/2020', Expiry: '22/08/2020'
  },
  {
    Type: 'AN', RFQID: '600000075', Date: '12/08/2020', Expiry: '22/08/2020'
  },
  {
    Type: 'AN', RFQID: '600000075', Date: '12/08/2020', Expiry: '22/08/2020'
  }
]
