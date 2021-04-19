import { Component, OnInit } from '@angular/core';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { ResponddialogComponent } from '../responddialog/responddialog.component';

@Component({
  selector: 'app-response',
  templateUrl: './response.component.html',
  styleUrls: ['./response.component.scss']
})
export class ResponseComponent implements OnInit {

  displayedItemsColumns: string[] = ['select', 'item', 'material', 'materialtext', 'totalqty', 'per.sche qty', 'no.of.sche', 'biddingprice']
  ItemDataSource = new MatTableDataSource<ItemData>(ItemsDetails);
  displayedColumns: string[] = ['select', 'item', 'material', 'materialtext', 'totalqty', 'per.sche qty', 'no.of.sche', 'biddingprice', 'response']
  DataSource = new MatTableDataSource<ItemData>(Details);
  statusClass = 'Rectangle-826';
  constructor(public Dialog: MatDialog) { }

  ngOnInit(): void {
  }
  RespondClicked(): void {
    this.statusClass = 'active';
    const dialogRef = this.Dialog.open(ResponddialogComponent, {
      width: '600px',
      height: '700px',
    });
    dialogRef.afterClosed().subscribe(result => {

      this.statusClass = 'Rectangle-826';
    });

    // this.statusClass = 'Rectangle-826';

  }

}

export interface ItemData {
  Item: any;
  Material: any;
  MaterialText: any;
  Totalqty: any;
  Persche: any;
  Number: any;
  Bidding: any;
}
export interface Data {
  Item: any;
  Material: any;
  MaterialText: any;
  Totalqty: any;
  Persche: any;
  Number: any;
  Bidding: any;
}

const ItemsDetails: ItemData[] = [
  {
    Item: '', Material: '', MaterialText: '', Totalqty: '', Persche: '', Number: '', Bidding: ''
  },
  {
    Item: '', Material: '', MaterialText: '', Totalqty: '', Persche: '', Number: '', Bidding: ''
  }
]
const Details: Data[] = [
  {
    Item: '', Material: '', MaterialText: '', Totalqty: '', Persche: '', Number: '', Bidding: ''
  },
  {
    Item: '', Material: '', MaterialText: '', Totalqty: '', Persche: '', Number: '', Bidding: ''
  }
]
