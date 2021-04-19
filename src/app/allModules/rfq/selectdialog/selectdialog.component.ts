import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';

@Component({
  selector: 'app-selectdialog',
  templateUrl: './selectdialog.component.html',
  styleUrls: ['./selectdialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class SelectdialogComponent implements OnInit {
  displayedPartnerColumns: string[] = ['paydoc', 'type', 'code', 'name', 'city', 'gst'];
  PartnerDataSource = new MatTableDataSource<PartnerData>(PartnerDetails);
  constructor() { }

  ngOnInit(): void {
  }

}
export interface PartnerData {
  Type: any;
  Usertable: any;
}
const PartnerDetails: PartnerData[] = [
  {
    Type: '', Usertable: ''
  }, {
    Type: '', Usertable: ''
  }, {
    Type: '', Usertable: ''
  }, {
    Type: '', Usertable: ''
  }, {
    Type: '', Usertable: ''
  }, {
    Type: '', Usertable: ''
  }
]