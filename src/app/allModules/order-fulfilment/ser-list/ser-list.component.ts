import { DatePipe } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, MatSnackBar, MatDialogConfig } from '@angular/material';
import { Router, ActivatedRoute } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseConfigService } from '@fuse/services/config.service';
import { BPCASNHeader, BPCASNView, ASNListView } from 'app/models/ASN';
import { AuthenticationDetails } from 'app/models/master';
import { ActionLog, BPCOFHeader, BPCOFItem, BPCOFSubconView } from 'app/models/OrderFulFilment';
import { AttachmentDetails } from 'app/models/task';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { ASNService } from 'app/services/asn.service';
import { AuthService } from 'app/services/auth.service';
import { ExcelService } from 'app/services/excel.service';
import { Guid } from 'guid-typescript';
import { AsnlistPrintDialogComponent } from '../asnlist/asnlist-print-dialogue/asnlist-print-dialog/asnlist-print-dialog.component';
import * as SecureLS from 'secure-ls';

@Component({
  selector: 'app-ser-list',
  templateUrl: './ser-list.component.html',
  styleUrls: ['./ser-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations
})
export class SerListComponent implements OnInit {
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
  displayColumn: string[] = ['ASNNumber', 'ASNDate', 'DocNumber', 'AWBNumber', 'VessleNumber', 'DepartureDate',
    'ArrivalDate', 'Status', 'Action'];
  TableDetailsDataSource: MatTableDataSource<ASNListView>;
  @ViewChild(MatPaginator) tablePaginator: MatPaginator;
  @ViewChild(MatSort) tableSort: MatSort;
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
  ActionLog: any;
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _fuseConfigService: FuseConfigService,
    private formBuilder: FormBuilder,
    private _authService: AuthService,
    private _asnService: ASNService,
    private _excelService: ExcelService,
    private _router: Router,
    private _datePipe: DatePipe,
    public snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
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
    const retrievedObject = this.SecureStorage.get('authorizationData');
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
    this.InitializeSearchForm();
    // this.GetAllASNListByPartnerID();
    this.SearchClicked();
  }
  InitializeSearchForm(): void {
    this.SearchFormGroup = this.formBuilder.group({
      ASNNumber: [''],
      DocNumber: [''],
      // Material: [''],
      Status: [''],
      ASNFromDate: [this.DefaultFromDate],
      ASNToDate: [this.DefaultToDate]
    });


  }
  ResetControl(): void {
    this.AllASNList = [];
    this.ResetFormGroup(this.SearchFormGroup);
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
  SearchClicked(): void {
    if (this.SearchFormGroup.valid) {
      this.CreateActionLogvalues("Search");
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
        const Status = this.SearchFormGroup.get('Status').value;
        const ASNNumber = this.SearchFormGroup.get('ASNNumber').value;
        const DocNumber = this.SearchFormGroup.get('DocNumber').value;
        const Material = this.SearchFormGroup.get('Material').value;
        // const Status = this.SearchFormGroup.get('Status').value;
        this.IsProgressBarVisibile = true;
        this._asnService.FilterASNListBySER(this.currentUserName, ASNNumber, DocNumber, Material, Status, FromDate, ToDate).subscribe(
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

  SetUserPreference(): void {
    this._fuseConfigService.config
      .subscribe((config) => {
        this.fuseConfig = config;
        this.BGClassName = config;
      });
    // this._fuseConfigService.config = this.fuseConfig;
  }
  exportAsXLSX(): void {
    this.CreateActionLogvalues("export As XLSX");
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
    // this.CreateActionLogvalues("Expand");
    this.isExpanded = !this.isExpanded;
  }
  Pdfdownload(no: any): void {
    this.CreateActionLogvalues("Pdf download");
    this.IsProgressBarVisibile = true;
    // this.SelectedASNHeader.ASNNumber=""
    // this.SelectedASNHeader.ASNNumber="no"
    this._asnService.CreateASNPdf(no, false).subscribe(
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
  help(po: string): void {
    this.CreateActionLogvalues("Support Desk");
    this._router.navigate(["/support/supportticket"], {
      queryParams: { id: po, navigator_page: "asnlist" },
    });
  }
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.TableDetailsDataSource.filter = filterValue.trim().toLowerCase();
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
  ASNnumber(asn: any): void {
    this._router.navigate(["/asn"], { queryParams: { id: asn } });
  }
  CreateActionLogvalues(text): void {
    this.ActionLog = new ActionLog();
    this.ActionLog.UserID = this.currentUserID;
    this.ActionLog.AppName = "SER List";
    this.ActionLog.ActionText = text + " is Clicked";
    this.ActionLog.Action = text;
    this.ActionLog.CreatedBy = this.currentUserName;
    this._authService.CreateActionLog(this.ActionLog).subscribe(
      (data) => {
        console.log(data);
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
