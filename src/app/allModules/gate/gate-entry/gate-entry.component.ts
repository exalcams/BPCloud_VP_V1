import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { ASNListView, BPCASNHeader, BPCASNItem } from 'app/models/ASN';
import { BPCOFHeader, BPCPlantMaster } from 'app/models/OrderFulFilment';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { ASNService } from 'app/services/asn.service';
import { AuthService } from 'app/services/auth.service';
import { DashboardService } from 'app/services/dashboard.service';
import { GateService } from 'app/services/gate.service';
import { POService } from 'app/services/po.service';
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
  SelectedASNItems: BPCASNItem[] = [];
  SelectBPCOFHeader: BPCOFHeader;
  ItemPlantDetails: BPCPlantMaster;
  SecretKey: string;
  SecureStorage: SecureLS;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  IsProgressBarVisibile1: boolean;
  IsProgressBarVisibile2: boolean;
  IsProgressBarVisibile3: boolean;
  bool = true;
  COUNT = 0;
  SearchFormGroup: FormGroup;
  displayColumn = ['Item', 'MaterialText', 'DeliveryDate', 'OrderedQty', 'CompletedQty', 'TransitQty', 'OpenQty', 'UOM'];

  dataSource: MatTableDataSource<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _shareParameterService: ShareParameterService,
    private _authService: AuthService,
    private _asnService: ASNService,
    private _poService: POService,
    private _dashboardService: DashboardService,
    private _GateService: GateService,
    private formBuilder: FormBuilder,
    private _router: Router,
    private _datePipe: DatePipe,
    public snackBar: MatSnackBar,
  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.ItemPlantDetails = new BPCPlantMaster();
    this.SelectedASN = new BPCASNHeader();
    this.SelectBPCOFHeader = new BPCOFHeader();
    this.IsProgressBarVisibile = false;
    this.IsProgressBarVisibile1 = false;
    this.IsProgressBarVisibile2 = false;
    this.IsProgressBarVisibile3 = false;
  }

  ngOnInit(): void {
    this.SetUserPreference();
    this.InitializeSearchForm();
    this.SelectedASNListView = this._shareParameterService.GetASNListView();
    if (this.SelectedASNListView) {
      this._shareParameterService.SetASNListView(null);
      this.GetASNByASN();
      this.GetASNItemsByASN();
      this.GetPOByDoc();
    } else {
      this.notificationSnackBarComponent.openSnackBar('No ASN Selected', SnackBarStatus.danger);
      this._router.navigate(['/orderfulfilment/asnlist']);
    }
  }
  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }

  InitializeSearchForm(): void {
    this.SearchFormGroup = this.formBuilder.group({
      VessleNumber: [''],
      AWBNumber: [''],
    });
  }
  ResetControl(): void {
    // this.AllASNList = [];
    this.ResetFormGroup(this.SearchFormGroup);
  }
  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }

  GetASNByASN(): void {
    this.IsProgressBarVisibile = true;
    this._asnService.GetASNByASN(this.SelectedASNListView.ASNNumber).subscribe(
      (data) => {
        this.SelectedASN = data as BPCASNHeader;
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  GetASNItemsByASN(): void {
    this.IsProgressBarVisibile1 = true;
    this._asnService.GetASNItemsByASN(this.SelectedASNListView.ASNNumber).subscribe(
      (data) => {
        this.SelectedASNItems = data as BPCASNItem[];
        this.dataSource = new MatTableDataSource(this.SelectedASNItems);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;

        if (this.SelectedASNItems.length > 0) {
          this.GetItemPlantDetails(this.SelectedASNItems[0].PlantCode);
        }
        this.IsProgressBarVisibile1 = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile1 = false;
      }
    );
  }
  GetPOByDoc(): void {
    this.IsProgressBarVisibile3 = true;
    this._poService.GetPOByDoc(this.SelectedASNListView.DocNumber).subscribe(
      (data) => {
        this.SelectBPCOFHeader = data as BPCOFHeader;
        this.IsProgressBarVisibile3 = false;
      },
      (err) => {
        console.error(err);
        this.IsProgressBarVisibile3 = false;
      }
    );
  }
  GetItemPlantDetails(PlantCode: string): void {
    this.IsProgressBarVisibile2 = true;
    this._dashboardService.GetItemPlantDetails(PlantCode).subscribe(
      data => {
        this.ItemPlantDetails = data as BPCPlantMaster;
        this.IsProgressBarVisibile2 = false;
      },
      err => {
        console.error(err);
        this.IsProgressBarVisibile2 = false;
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
