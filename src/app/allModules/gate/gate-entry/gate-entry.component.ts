import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatSnackBar, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { ASNListView, BPCASNHeader } from 'app/models/ASN';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { ASNService } from 'app/services/asn.service';
import { AuthService } from 'app/services/auth.service';
import { GateService } from 'app/services/gate.service';
import { ShareParameterService } from 'app/services/share-parameters.service';
import * as SecureLS from 'secure-ls';
@Component({
  selector: 'app-gate-entry',
  templateUrl: './gate-entry.component.html',
  styleUrls: ['./gate-entry.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class GateEntryComponent implements OnInit {
  BGClassName: any;
  fuseConfig: any;
  tabledata: any[] = [];
  SelectedASNListView: ASNListView;
  SelectedASN: BPCASNHeader;
  SecretKey: string;
  SecureStorage: SecureLS;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  bool = true;
  COUNT = 0;
  displayedColumns = ['Item', 'MaterialText', 'DeliveryDate', 'OrderQty', 'GRQty', 'PipelineQty', 'OpenQty', 'UOM'];

  dataSource: MatTableDataSource<any>;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _shareParameterService: ShareParameterService,
    private _authService: AuthService,
    private _asnService: ASNService,
    private _GateService: GateService,
    private _router: Router,
    private _datePipe: DatePipe,
    public snackBar: MatSnackBar,
  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
  }

  ngOnInit(): void {
    this.SetUserPreference();
    this.SelectedASNListView = this._shareParameterService.GetASNListView();
    if (this.SelectedASNListView) {
      this._shareParameterService.SetASNListView(null);
      this.GetASNByASN();
    } else {
      this.notificationSnackBarComponent.openSnackBar('No ASN Selected', SnackBarStatus.danger);
      this._router.navigate(['/orderfulfilment/asnlist']);
    }

    this.tabledata = [
      {

        item: 'Daikin AC 1.5Ton',
        material_text: 'Split AC 1.5Ton Inverter AC 5 Star rating',
        date: '22/04/2020',
        order_qty: '100',
        gr_qty: '10',
        pipeline_qty: '20',
        open_qty: '20',
        uom: 'kg'
      },
      {

        item: 'Daikin AC 1.5Ton',
        material_text: 'Split AC 1.5Ton Inverter AC 5 Star rating',
        date: '22/04/2020',
        order_qty: '100',
        gr_qty: '10',
        pipeline_qty: '20',
        open_qty: '20',
        uom: 'kg'
      },
      {

        item: 'Daikin AC 1.5Ton',
        material_text: 'Split AC 1.5Ton Inverter AC 5 Star rating',
        date: '22/04/2020',
        order_qty: '100',
        gr_qty: '10',
        pipeline_qty: '20',
        open_qty: '20',
        uom: 'kg'
      },
      {
        item: 'Daikin AC 1.5Ton',
        material_text: 'Split AC 1.5Ton Inverter AC 5 Star rating',
        date: '22/04/2020',
        order_qty: '100',
        gr_qty: '10',
        pipeline_qty: '20',
        open_qty: '20',
        uom: 'kg'
      },
      {
        item: 'Daikin AC 1.5Ton',
        material_text: 'Split AC 1.5Ton Inverter AC 5 Star rating',
        date: '22/04/2020',
        order_qty: '100',
        gr_qty: '10',
        pipeline_qty: '20',
        open_qty: '20',
        uom: 'kg'
      }
    ];
    console.log(this.tabledata);
    this.dataSource = new MatTableDataSource(this.tabledata);
  }
  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }

  GetASNByASN(): void {
    this._asnService.GetASNByASN(this.SelectedASNListView.ASNNumber).subscribe(
      (data) => {
        this.SelectedASN = data as BPCASNHeader;
      },
      (err) => {
        console.error(err);
      }
    );
  }

  check(): any {
    if (this.bool) {
      this.bool = false;
      return true;
    }
  }
  check2(): any {
    if (this.bool) {
      this.bool = true;
      return true;
    }
  }
}
