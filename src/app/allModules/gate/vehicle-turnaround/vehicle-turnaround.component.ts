import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';

@Component({
  selector: 'app-vehicle-turnaround',
  templateUrl: './vehicle-turnaround.component.html',
  styleUrls: ['./vehicle-turnaround.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class VehicleTurnaroundComponent implements OnInit {
  BGClassName: any;
  fuseConfig: any;
  isExpanded: boolean;
  DataReport: Datareport[] = [];
  ReportColumn: string[] = ['EntryDate', 'EntryTime', 'Truck', 'Partner', 'DocNo', 'Transporter', 'Gate', 'Plant', 'ExitDt', 'ExitTime', 'TATime', 'Exception'];
  DataSource: MatTableDataSource<any>;

  constructor(private _fuseConfigService: FuseConfigService) { this.isExpanded = false; }

  ngOnInit(): void {
    this.GetVehicleTurnaroundDetails();
    this.SetUserPreference();
  }
  SetUserPreference(): void {
    this._fuseConfigService.config
        .subscribe((config) => {
            this.fuseConfig = config;
            this.BGClassName = config;
        });
    // this._fuseConfigService.config = this.fuseConfig;
}
  GetVehicleTurnaroundDetails(): void {
    this.DataReport = [
      { EntryDate: '23/07/2020', EntryTime: '10:32 AM ', Truck: 'Booked', Partner: 'ACC Cements', DocNo: '#36878756', Transporter: 'Maruthy Travels', Gate: '325', Plant: '1001', ExitDt: '28/07/2020', ExitTime: '12:32 PM', TATime: '56 mins', Exception: 'None' },
      { EntryDate: '23/07/2020', EntryTime: '10:32 AM ', Truck: 'Booked', Partner: 'ACC Cements', DocNo: '#36878756', Transporter: 'Maruthy Travels', Gate: '325', Plant: '1001', ExitDt: '28/07/2020', ExitTime: '12:32 PM', TATime: '56 mins', Exception: 'None' },
      { EntryDate: '23/07/2020', EntryTime: '10:32 AM ', Truck: 'Booked', Partner: 'ACC Cements', DocNo: '#36878756', Transporter: 'Maruthy Travels', Gate: '325', Plant: '1001', ExitDt: '28/07/2020', ExitTime: '12:32 PM', TATime: '56 mins', Exception: 'None' },
      { EntryDate: '23/07/2020', EntryTime: '10:32 AM ', Truck: 'Booked', Partner: 'ACC Cements', DocNo: '#36878756', Transporter: 'Maruthy Travels', Gate: '325', Plant: '1001', ExitDt: '28/07/2020', ExitTime: '12:32 PM', TATime: '56 mins', Exception: 'None' },
      { EntryDate: '23/07/2020', EntryTime: '10:32 AM ', Truck: 'Booked', Partner: 'ACC Cements', DocNo: '#36878756', Transporter: 'Maruthy Travels', Gate: '325', Plant: '1001', ExitDt: '28/07/2020', ExitTime: '12:32 PM', TATime: '56 mins', Exception: 'None' },
      { EntryDate: '23/07/2020', EntryTime: '10:32 AM ', Truck: 'Booked', Partner: 'ACC Cements', DocNo: '#36878756', Transporter: 'Maruthy Travels', Gate: '325', Plant: '1001', ExitDt: '28/07/2020', ExitTime: '12:32 PM', TATime: '56 mins', Exception: 'None' }
    ];
    this.DataSource = new MatTableDataSource(this.DataReport);
  }
  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
  }

}

export class Datareport {
  EntryDate: string;
  EntryTime: string;
  Truck: string;
  Partner: string;
  DocNo: string;
  Transporter: string;
  Gate: string;
  Plant: string;
  ExitDt: string;
  ExitTime: string;
  TATime: string;
  Exception: string;
}
