import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { FuseConfigService } from '@fuse/services/config.service';
import { BPCGateHoveringVechicles } from 'app/models/Gate';
import { ASNService } from 'app/services/asn.service';
import { GateService } from 'app/services/gate.service';

@Component({
  selector: 'app-hovering-vehicles',
  templateUrl: './hovering-vehicles.component.html',
  styleUrls: ['./hovering-vehicles.component.scss']
})
export class HoveringVehiclesComponent implements OnInit {
  BGClassName: any;
  fuseConfig: any;
  GateHV: BPCGateHoveringVechicles;
  DataReport: Datareport[] = [];
  ReportColumn: string[] = ['EntryDate', 'EntryTime', 'Truck', 'Partner', 'DocNo', 'Transporter', 'Gate', 'Plant'];
  DataSource: MatTableDataSource<any>;
  Table: any = [{
    client: '001',
    company: '002',
    type: 'V',
    patnerID: '100744',
    item: 'Daikin AC 1.5Ton',
    material_text: 'Split AC 1.5Ton Inverter AC 5 Star rating',
    date: '22/04/2020',
    order_qty: '100',
    gr_qty: '10',
    pipeline_qty: '20',
    open_qty: '20',
    uom: 'kg',
  },
  {
    client: '001',
    company: '002',
    type: 'V',
    patnerID: '100744',
    item: 'Daikin AC 1.5Ton',
    material_text: 'Split AC 1.5Ton Inverter AC 5 Star rating',
    date: '22/04/2020',
    order_qty: '105',
    gr_qty: '11',
    pipeline_qty: '120',
    open_qty: '120',
    uom: 'kg',
  },
  {
    client: '001',
    company: '002',
    type: 'V',
    patnerID: '100744',
    item: 'Daikin AC 1.5Ton',
    material_text: 'Split AC 1.5Ton Inverter AC 5 Star rating',
    date: '22/04/2020',
    order_qty: '120',
    gr_qty: '20',
    pipeline_qty: '30',
    open_qty: '120',
    uom: 'kg',
  },
  {
    client: '001',
    company: '002',
    type: 'V',
    patnerID: '100744',
    item: 'Daikin AC 1.5Ton',
    material_text: 'Split AC 1.5Ton Inverter AC 5 Star rating',
    date: '22/04/2020',
    order_qty: '190',
    gr_qty: '90',
    pipeline_qty: '30',
    open_qty: '50',
    uom: 'kg',
  },
  {
    client: '001',
    company: '002',
    type: 'V',
    patnerID: '100744',
    item: 'Daikin AC 1.5Ton',
    material_text: 'Split AC 1.5Ton Inverter AC 5 Star rating',
    date: '22/04/2020',
    order_qty: '40',
    gr_qty: '30',
    pipeline_qty: '10',
    open_qty: '20',
    uom: 'kg',
  },
  {
    client: '001',
    company: '002',
    type: 'V',
    patnerID: '100744',
    item: 'Daikin AC 1.5Ton',
    material_text: 'Split AC 1.5Ton Inverter AC 5 Star rating',
    date: '22/04/2020',
    order_qty: '100',
    gr_qty: '10',
    pipeline_qty: '20',
    open_qty: '20',
    uom: 'kg',
  }];
  constructor(private _fuseConfigService: FuseConfigService, private _gateService: GateService, private datePipe: DatePipe,
    private _asnService: ASNService) { }

  ngOnInit(): void {
    this.GetHoveringVehicleDetails();
    this.SetUserPreference();
    this.GateHV = new BPCGateHoveringVechicles();
    this.GateHV.client = '001';
    this.GateHV.company = '002';
    this.GateHV.type = 'V';
    this.GateHV.patnerID = '100744';
    this.GateHV.partner = 'Acc cements';
    this.GateHV.date = new Date();
    this.GateHV.time=new Date();
    this.GateHV.plant = '001';
    this.GateHV.docNo = '36878756';
    this.GateHV.transporter = 'Maruthy Travels';
    this.GateHV.gate = '325';
    this.GateHV.IsActive = true;
    this.GateHV.CreatedOn = new Date();
    this.GateHV.CreatedBy = null;
    this.GateHV.ModifiedBy = null;
    this.GateHV.ModifiedOn = new Date();
    this._gateService.CreateGateHV(this.GateHV).subscribe(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
    // this._asnService.GetOfsByPartnerID()
  }
  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }
  GetHoveringVehicleDetails(): void {
    this.DataReport = [
      { EntryDate: '23/07/2020', EntryTime: '10:32 AM ', Truck: 'Booked', Partner: 'ACC Cements', DocNo: '#36878756', Transporter: 'Maruthy Travels', Gate: '325', Plant: '1001' },
      { EntryDate: '23/07/2020', EntryTime: '10:32 AM ', Truck: 'Booked', Partner: 'ACC Cements', DocNo: '#36878756', Transporter: 'Maruthy Travels', Gate: '325', Plant: '1001' },
      { EntryDate: '23/07/2020', EntryTime: '10:32 AM ', Truck: 'Booked', Partner: 'ACC Cements', DocNo: '#36878756', Transporter: 'Maruthy Travels', Gate: '325', Plant: '1001' },
      { EntryDate: '23/07/2020', EntryTime: '10:32 AM ', Truck: 'Booked', Partner: 'ACC Cements', DocNo: '#36878756', Transporter: 'Maruthy Travels', Gate: '325', Plant: '1001' },
      { EntryDate: '23/07/2020', EntryTime: '10:32 AM ', Truck: 'Booked', Partner: 'ACC Cements', DocNo: '#36878756', Transporter: 'Maruthy Travels', Gate: '325', Plant: '1001' },
      { EntryDate: '23/07/2020', EntryTime: '10:32 AM ', Truck: 'Booked', Partner: 'ACC Cements', DocNo: '#36878756', Transporter: 'Maruthy Travels', Gate: '325', Plant: '1001' }
    ];
    this.DataSource = new MatTableDataSource(this.DataReport);
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
  // ExitDt:string;
  // ExitTime:string;
  // TATime:string;
  // Exception:string;
}