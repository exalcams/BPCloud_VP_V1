import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AuthenticationDetails } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { ASNListFilter, ASNListView, ASNListViewNewDoc } from 'app/models/ASN';
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialog, MatDialogConfig } from '@angular/material';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { FuseConfigService } from '@fuse/services/config.service';
import { ASNService } from 'app/services/asn.service';
import { ExcelService } from 'app/services/excel.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { fuseAnimations } from '@fuse/animations';
import { OfStatus } from 'app/models/Dashboard';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { ActionLog } from 'app/models/OrderFulFilment';
import { AuthService } from 'app/services/auth.service';
import { GateService } from 'app/services/gate.service';
import { AsnlistPrintDialogComponent } from './asnlist-print-dialogue/asnlist-print-dialog/asnlist-print-dialog.component';
import { AttachmentDetails } from 'app/models/task';
import { AttachmentDialogComponent } from 'app/notifications/attachment-dialog/attachment-dialog.component';

@Component({
  selector: 'app-asn-list',
  templateUrl: './asn-list.component.html',
  styleUrls: ['./asn-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class AsnListComponent implements OnInit {

  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  MenuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  BGClassName: any;
  fuseConfig: any;
  AllASNList: ASNListView[] = [];
  displayColumn: string[] = ['PatnerID', 'ASNNumber', 'ASNDate', 'DocNumber', 'AWBNumber', 'VessleNumber', 'DepartureDate',
    'ArrivalDate','AttachmentName', 'Status', 'Action'];
  TableDetailsDataSource: MatTableDataSource<ASNListView>;
  @ViewChild(MatPaginator) tablePaginator: MatPaginator;
  @ViewChild(MatSort) tableSort: MatSort;
  DateTime: Date;

  ofStatusOptions: OfStatus[] = [
    { Value: "GateEntry", Name: "GateEntry" },
    { Value: "GateEntry Completed", Name: "GateEntry Completed" },
    { Value: "Cancelled", Name: "Cancelled" },
    { Value: "ShipmentNotRelevant", Name: "ShipmentNotRelevant" },
    { Value: "Saved", Name: "Saved" }
  ];

  truck_url = "assets/images/mover-truck.png ";
  ship_url = "assets/images/cargo-ship.png ";
  delivery_url = "assets/images/delivery.png ";
  isExpanded: boolean;
  SearchFormGroup: FormGroup;
  isDateError: boolean;
  DefaultFromDate: Date;
  DefaultToDate: Date;
  SelectValue: string;
  TableSelectValue: string;
  Plants: string[] = [];
  constructor(
    private _fuseConfigService: FuseConfigService,
    private formBuilder: FormBuilder,
    private _asnService: ASNService,
    private _authService: AuthService,
    private _excelService: ExcelService,
    private _GateService: GateService,
    private _router: Router,
    private _datePipe: DatePipe,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.authenticationDetails = new AuthenticationDetails();
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.IsProgressBarVisibile = false;
    this.isExpanded = false;
    this.DefaultFromDate = new Date();
    this.DefaultFromDate.setDate(this.DefaultFromDate.getDate() - 30);
    this.DefaultToDate = new Date();
    this.SelectValue = 'All';
    this.TableSelectValue = 'Action';
  }

  ngOnInit(): void {
    this.SetUserPreference();
    // Retrive authorizationData
    const retrievedObject = localStorage.getItem('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserName = this.authenticationDetails.UserName;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      // if (this.MenuItems.indexOf('AccountStatement') < 0) {
      //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
      //   );
      //   this._router.navigate(['/auth/login']);
      // }

    } else {
      this._router.navigate(['/auth/login']);
    }
    this.DateTime = new Date();
    this.InitializeSearchForm();
    // this.GetAllASNListByPartnerID();
    if (this.currentUserRole === 'Buyer') {
      this.GetUserPlants();
    } else {
      this.SearchClicked();
    }
  }
  InitializeSearchForm(): void {
    this.SearchFormGroup = this.formBuilder.group({
      VendorCode: [''],
      ASNNumber: [''],
      DocNumber: [''],
      Material: [''],
      Status: [''],
      ASNFromDate: [this.DefaultFromDate],
      ASNToDate: [this.DefaultToDate]
    });


  }
  ResetControl(): void {
    this.AllASNList = [];
    this.ResetFormGroup(this.SearchFormGroup);
  }
  
  Attachmentclk(filename): void{

    this._asnService.DownloadOfAttachmentOnlyName(filename).subscribe(
      data => {
        if (data) {
          const FileName = filename;
    let fileType = 'image/jpg';
    fileType = FileName.toLowerCase().includes('.jpg') ? 'image/jpg' :
      FileName.toLowerCase().includes('.jpeg') ? 'image/jpeg' :
        FileName.toLowerCase().includes('.png') ? 'image/png' :
          FileName.toLowerCase().includes('.gif') ? 'image/gif' :
            FileName.toLowerCase().includes('.pdf') ? 'application/pdf' : '';
    const blob = new Blob([data], { type: fileType });
    const attachmentDetails: AttachmentDetails = {
      FileName: FileName,
      blob: blob
    };
    const dialogConfig: MatDialogConfig = {
      data: attachmentDetails,
      panelClass: 'attachment-dialog'
    };
    const dialogRef = this.dialog.open(AttachmentDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
      }
    });
        }
    
      },
      error => {
        console.error(error);
      
      }
    );
  }
 
  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }
  GetAllASNList(): void {
    this._asnService.GetAllASNList().subscribe(
      (data) => {
        this.AllASNList = data as ASNListView[];
        this.TableDetailsDataSource = new MatTableDataSource(this.AllASNList);
        this.TableDetailsDataSource.paginator = this.tablePaginator;
        this.TableDetailsDataSource.sort = this.tableSort;
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        console.error(err);
      }
    );

  }

  DateSelected(): void {
    const FROMDATEVAL = this.SearchFormGroup.get('ASNFromDate').value as Date;
    const TODATEVAL = this.SearchFormGroup.get('ASNToDate').value as Date;
    if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
      this.isDateError = true;
    } else {
      this.isDateError = false;
    }
  }
  GetUserPlants(): void {
    this._authService.GetUserPlants(this.currentUserID).subscribe(
      (data) => {
        this.Plants = data as string[];
        this.Search1Clicked();
      },
      (err) => {
        console.error(err);
      }
    );
  }
  SearchBtnClicked(): void {
    if (this.currentUserRole === 'GateUser') {
      this.Search1Clicked();
    } else {
      this.SearchClicked();
    }
  }
  SearchClicked(): void {
    if (this.SearchFormGroup.valid) {
      if (!this.isDateError) {
        const FrDate = this.SearchFormGroup.get('ASNFromDate').value;
        let FromDate = '';
        if (FrDate) {
          FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
        }
        const TDate = this.SearchFormGroup.get('ASNToDate').value;
        let ToDate = '';
        if (TDate) {
          ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
        }
        const VendorCode = this.SearchFormGroup.get('VendorCode').value;
        const ASNNumber = this.SearchFormGroup.get('ASNNumber').value;
        const DocNumber = this.SearchFormGroup.get('DocNumber').value;
        const Material = this.SearchFormGroup.get('Material').value;
        var Status = this.SearchFormGroup.get('Status').value;
        if (!Status) {
          Status = "";
        }
        this.IsProgressBarVisibile = true;
        this._asnService.FilterASNList(VendorCode, ASNNumber, DocNumber, Material, Status, FromDate, ToDate).subscribe(
          (data) => {
            this.AllASNList = data as ASNListView[];
            this.TableDetailsDataSource = new MatTableDataSource(this.AllASNList);
            this.TableDetailsDataSource.paginator = this.tablePaginator;
            this.TableDetailsDataSource.sort = this.tableSort;
            this.IsProgressBarVisibile = false;
          },
          (err) => {
            console.error(err);
            this.IsProgressBarVisibile = false;
          }
        );
      }
    } else {
      this.ShowValidationErrors(this.SearchFormGroup);
    }
  }
  Search1Clicked(): void {
    if (this.SearchFormGroup.valid) {
      const filter: ASNListFilter = new ASNListFilter();
      if (!this.isDateError) {
        this.Plants.forEach(x => filter.Plants.push(x));
        const FrDate = this.SearchFormGroup.get('ASNFromDate').value;
        let FromDate = '';
        if (FrDate) {
          FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
        }
        filter.ASNFromDate = FromDate;
        const TDate = this.SearchFormGroup.get('ASNToDate').value;
        let ToDate = '';
        if (TDate) {
          ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
        }
        filter.ASNToDate = ToDate;
        filter.ASNNumber = this.SearchFormGroup.get('ASNNumber').value;
        filter.DocNumber = this.SearchFormGroup.get('DocNumber').value;
        filter.Material = this.SearchFormGroup.get('Material').value;
        filter.Status = this.SearchFormGroup.get('Status').value;
        if (!filter.Status) {
          filter.Status = "";
        }
        this.IsProgressBarVisibile = true;
        this._asnService.FilterASNListByPlants(filter).subscribe(
          (data) => {
            this.AllASNList = data as ASNListView[];
            this.TableDetailsDataSource = new MatTableDataSource(this.AllASNList);
            this.TableDetailsDataSource.paginator = this.tablePaginator;
            this.TableDetailsDataSource.sort = this.tableSort;
            this.IsProgressBarVisibile = false;
          },
          (err) => {
            console.error(err);
            this.IsProgressBarVisibile = false;
          }
        );
      }
    } else {
      this.ShowValidationErrors(this.SearchFormGroup);
    }
  }
  ShowValidationErrors(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      if (!formGroup.get(key).valid) {
        console.log(key);
      }
      formGroup.get(key).markAsTouched();
      formGroup.get(key).markAsDirty();
      if (formGroup.get(key) instanceof FormArray) {
        const FormArrayControls = formGroup.get(key) as FormArray;
        Object.keys(FormArrayControls.controls).forEach(key1 => {
          if (FormArrayControls.get(key1) instanceof FormGroup) {
            const FormGroupControls = FormArrayControls.get(key1) as FormGroup;
            Object.keys(FormGroupControls.controls).forEach(key2 => {
              FormGroupControls.get(key2).markAsTouched();
              FormGroupControls.get(key2).markAsDirty();
              if (!FormGroupControls.get(key2).valid) {
                console.log(key2);
              }
            });
          } else {
            FormArrayControls.get(key1).markAsTouched();
            FormArrayControls.get(key1).markAsDirty();
          }
        });
      }
    });

  }

  Pdfdownload(no: any): void {
    this.CreateActionLogvalues("Pdf download");
    this.IsProgressBarVisibile = true;
    // this.SelectedASNHeader.ASNNumber=""
    // this.SelectedASNHeader.ASNNumber="no"
    this._asnService.CreateASNPdf(no).subscribe(
      // this._ASNService.CreateASNPdf(this.SelectedASNHeader.ASNNumber).subscribe(
      data => {
        if (data) {
          this.IsProgressBarVisibile = false;
          const fileType = 'application/pdf';
          const blob = new Blob([data], { type: fileType });
          const currentDateTime = this._datePipe.transform(new Date(), 'ddMMyyyyHHmmss');
          const FileName = no + '_' + currentDateTime + '.pdf';
          this.OpenASNPrintDialog(FileName, blob);
          // FileSaver.saveAs(blob, this.SelectedASNHeader.ASNNumber + '_' + currentDateTime + '.pdf');
        } else {
          this.IsProgressBarVisibile = false;
          this.ResetControl();
          // this.GetASNBasedOnCondition();
        }
      },
      error => {
        console.error(error);
        this.IsProgressBarVisibile = false;
        this.ResetControl();
        // this.GetASNBasedOnCondition();
      }
    );

  }
  OpenASNPrintDialog(FileName: string, blob: Blob): void {
    const attachmentDetails: AttachmentDetails = {
      FileName: FileName,
      blob: blob
    };
    const dialogConfig: MatDialogConfig = {
      data: attachmentDetails,
      panelClass: 'asn-print-dialog'
    };
    const dialogRef = this.dialog.open(AsnlistPrintDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(result => {
      this.ResetControl();
      // this.GetASNBasedOnCondition();
    }, (err) => {
      this.ResetControl();
      // this.GetASNBasedOnCondition();
    });
  }
  help(po: string): void {
    this.CreateActionLogvalues("Help Desk");
    this._router.navigate(["/support/supportticket"], {
      queryParams: { id: po, navigator_page: "ASN" },
    });
  }
  GateEntry(Asn: ASNListView): void {
    this.CreateActionLogvalues("Gate Entry");
    this._GateService.CreateGateEntryByAsnList(Asn).subscribe(
      (data) => {
        // this.Gate = data as BPCGateHoveringVechicles;
        this.notificationSnackBarComponent.openSnackBar("Gate Entry Successfull", SnackBarStatus.success);
        this.Search1Clicked();
        // this.SearchClicked();
      },
      (err) => {
        this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
      }
    );
  }
  CancelGateEntry(Asn: ASNListView): void {
    this.CreateActionLogvalues("Cancel Gate Entry");
    this._GateService.CancelGateEntryByAsnList(Asn).subscribe(
      (data) => {
        // this.Gate = data as BPCGateHoveringVechicles;
        this.notificationSnackBarComponent.openSnackBar("Cancel Gate Entry Successfull", SnackBarStatus.success);
        this.Search1Clicked();
      },
      (err) => {
        this.notificationSnackBarComponent.openSnackBar(err, SnackBarStatus.danger);
      }
    );
  }
  CreateActionLogvalues(text): void {
    const actionLog = new ActionLog();
    actionLog.UserID = this.currentUserID;
    actionLog.AppName = "ASNList";
    actionLog.ActionText = text + " is Clicked";
    actionLog.Action = text;
    actionLog.CreatedBy = this.currentUserName;
    this._authService.CreateActionLog(actionLog).subscribe(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }
  exportAsXLSX(): void {
    const currentPageIndex = this.TableDetailsDataSource.paginator.pageIndex;
    const PageSize = this.TableDetailsDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.AllASNList.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'ASN': x.ASNNumber,
        'ASN Date': x.ASNDate ? this._datePipe.transform(x.ASNDate, 'dd-MM-yyyy') : '',
        'PO': x.DocNumber,
        'AWB': x.AWBNumber,
        'Truck': x.VessleNumber,
        // 'Material': x.Material,
        // 'Material Text': x.MaterialText,
        // 'ASN Qty': x.ASNQty,
        'Status': x.Status,
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'accountstatement');
  }
  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.TableDetailsDataSource.filter = filterValue.trim().toLowerCase();
  }
}
