import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { MatTableDataSource, MatPaginator, MatSort, MatSnackBar, MatDialogConfig, MatDialog } from "@angular/material";
import { fuseAnimations } from "@fuse/animations";
import { AuthenticationDetails } from 'app/models/master';
import { Guid } from 'guid-typescript';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { FormGroup, FormBuilder, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { ExcelService } from 'app/services/excel.service';
import { DatePipe } from '@angular/common';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { DataMigrationService } from 'app/services/data-migration.service';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import * as XLSX from 'xlsx';
import { FactService } from 'app/services/fact.service';
import { POService } from 'app/services/po.service';
import { ReportService } from 'app/services/report.service';
import { BPCFactBankXLSX, BPCFactXLSX } from 'app/models/fact';
import { BPCOFHeaderXLSX, BPCOFItemXLSX, BPCOFScheduleLineXLSX, BPCOFGRGIXLSX, BPCOFQMXLSX } from 'app/models/OrderFulFilment';
import { BPCInvoiceXLSX, BPCPaymentXLSX } from 'app/models/ReportModel';
import * as SecureLS from 'secure-ls';
import { AuthService } from "app/services/auth.service";

@Component({
  selector: "app-data-migration",
  templateUrl: "./data-migration.component.html",
  styleUrls: ["./data-migration.component.scss"],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations,
})
export class DataMigrationComponent implements OnInit {
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserRole: string;
  MenuItems: string[];
  notificationSnackBarComponent: NotificationSnackBarComponent;
  IsProgressBarVisibile: boolean;
  IsProgressBarVisibile1: boolean;
  IsProgressBarVisibile2: boolean;
  IsProgressBarVisibile3: boolean;
  IsProgressBarVisibile4: boolean;
  IsProgressBarVisibile5: boolean;
  IsProgressBarVisibile6: boolean;
  IsProgressBarVisibile7: boolean;
  IsProgressBarVisibile8: boolean;
  IsProgressBarVisibile9: boolean;

  arrayBuffer: any;
  fileToUpload: File;
  fileToUploadList: File[] = [];

  BPCFactXLSXs: BPCFactXLSX[] = [];
  BPCFactBankXLSXs: BPCFactBankXLSX[] = [];
  BPCOFHeaderXLSXs: BPCOFHeaderXLSX[] = [];
  BPCOFItemXLSXs: BPCOFItemXLSX[] = [];
  BPCOFScheduleLineXLSXs: BPCOFScheduleLineXLSX[] = [];
  BPCOFGRGIXLSXs: BPCOFGRGIXLSX[] = [];
  BPCOFQMXLSXs: BPCOFQMXLSX[] = [];
  BPCInvoiceXLSXs: BPCInvoiceXLSX[] = [];
  BPCPaymentXLSXs: BPCPaymentXLSX[] = [];
  SecretKey: string;
  SecureStorage: SecureLS;
  constructor(
    private _formBuilder: FormBuilder,
    private _router: Router,
    public snackBar: MatSnackBar,
    private _dataMigrationService: DataMigrationService,
    private _factService: FactService,
    private _poService: POService,
    private _reportService: ReportService,
    private _excelService: ExcelService,
    private _datePipe: DatePipe,
    private dialog: MatDialog,
    private _authService: AuthService,
  ) {
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.IsProgressBarVisibile = false;
    this.IsProgressBarVisibile1 = false;
    this.IsProgressBarVisibile2 = false;
    this.IsProgressBarVisibile3 = false;
    this.IsProgressBarVisibile4 = false;
    this.IsProgressBarVisibile5 = false;
    this.IsProgressBarVisibile6 = false;
    this.IsProgressBarVisibile7 = false;
    this.IsProgressBarVisibile8 = false;
    this.IsProgressBarVisibile9 = false;
  }

  ngOnInit(): void {
    const retrievedObject =this.SecureStorage.get('authorizationData');
    if (retrievedObject) {
      this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
      this.currentUserID = this.authenticationDetails.UserID;
      this.currentUserRole = this.authenticationDetails.UserRole;
      this.MenuItems = this.authenticationDetails.MenuItemNames.split(',');
      if (this.MenuItems.indexOf('DataMigration') < 0) {
        this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger
        );
        this._router.navigate(['/auth/login']);
      }
    } else {
      this._router.navigate(['/auth/login']);
    }
  }

  UploadDataMigrationClicked(): void {
    if (this.fileToUpload) {
      this.fileToUploadList.push(this.fileToUpload);
      this.fileToUpload = null;
    }
    this.SetActionToOpenConfirmation('Submit');
  }

  UploadDataMigrationAttachment(Actiontype: string): void {
    if (this.fileToUploadList && this.fileToUploadList.length > 0) {
      if (this.BPCFactXLSXs && this.BPCFactXLSXs.length > 0) {
        this.UpdateFacts();
      }
      if (this.BPCFactBankXLSXs && this.BPCFactBankXLSXs.length > 0) {
        this.UpdateBanks();
      }
      if (this.BPCOFHeaderXLSXs && this.BPCOFHeaderXLSXs.length > 0) {
        this.UpdateOFHeaders();
      }
      if (this.BPCOFItemXLSXs && this.BPCOFItemXLSXs.length > 0) {
        this.UpdateOFItems();
      }
      if (this.BPCOFScheduleLineXLSXs && this.BPCOFScheduleLineXLSXs.length > 0) {
        this.UpdateOFScheduleLines();
      }
      if (this.BPCOFQMXLSXs && this.BPCOFQMXLSXs.length > 0) {
        this.UpdateOFQMs();
      }
      if (this.BPCOFGRGIXLSXs && this.BPCOFGRGIXLSXs.length > 0) {
        this.UpdateOFGRGIs();
      }
      if (this.BPCInvoiceXLSXs && this.BPCInvoiceXLSXs.length > 0) {
        this.UpdateInvoices();
      }
      if (this.BPCPaymentXLSXs && this.BPCPaymentXLSXs.length > 0) {
        this.UpdatePayments();
      }

      this.ResetControl();
      // this._dataMigrationService.UploadDataMigrationAttachment(this.currentUserID.toString(), this.fileToUploadList).subscribe(
      //   (dat) => {
      //     this.ResetControl();
      //     this.notificationSnackBarComponent.openSnackBar(`Data Migration ${Actiontype === 'Submit' ? 'submitted' : 'saved'} successfully`, SnackBarStatus.success);
      //     this.IsProgressBarVisibile = false;
      //   },
      //   (err) => {
      //     this.showErrorNotificationSnackBar(err);
      //   });
    }
  }

  UpdateFacts(): void {
    this.IsProgressBarVisibile = true;
    if (this.BPCFactXLSXs) {
      this._factService.CreateFacts(this.BPCFactXLSXs).subscribe((data) => {
        this.IsProgressBarVisibile = false;
      },
        (err) => {
          this.IsProgressBarVisibile = false;
          console.error(err);
        });
    }
  }

  UpdateBanks(): void {
    this.IsProgressBarVisibile1 = true;
    if (this.BPCFactBankXLSXs) {
      this._factService.CreateFactBanks(this.BPCFactBankXLSXs).subscribe((data) => {
        this.IsProgressBarVisibile1 = false;
      },
        (err) => {
          this.IsProgressBarVisibile1 = false;
        });
    }
  }

  UpdateOFHeaders(): void {
    this.IsProgressBarVisibile2 = true;
    if (this.BPCOFHeaderXLSXs) {
      this._poService.CreateOFHeaders(this.BPCOFHeaderXLSXs).subscribe((data) => {
        this.IsProgressBarVisibile2 = false;
      },
        (err) => {
          this.IsProgressBarVisibile2 = false;
        });
    }
  }

  UpdateOFItems(): void {
    this.IsProgressBarVisibile3 = true;
    if (this.BPCOFItemXLSXs) {
      this._poService.CreateOFItems(this.BPCOFItemXLSXs).subscribe((data) => {
        this.IsProgressBarVisibile3 = false;
      },
        (err) => {
          this.IsProgressBarVisibile3 = false;
        });
    }
  }

  UpdateOFScheduleLines(): void {
    this.IsProgressBarVisibile4 = true;
    if (this.BPCOFScheduleLineXLSXs) {
      this._poService.CreateOFScheduleLines(this.BPCOFScheduleLineXLSXs).subscribe((data) => {
        this.IsProgressBarVisibile4 = false;
      },
        (err) => {
          this.IsProgressBarVisibile4 = false;
        });
    }
  }

  UpdateOFGRGIs(): void {
    this.IsProgressBarVisibile5 = true;
    if (this.BPCOFGRGIXLSXs) {
      this._poService.CreateOFGRGIs(this.BPCOFGRGIXLSXs).subscribe((data) => {
        this.IsProgressBarVisibile5 = false;
      },
        (err) => {
          this.IsProgressBarVisibile5 = false;
        });
    }
  }

  UpdateOFQMs(): void {
    this.IsProgressBarVisibile6 = true;
    if (this.BPCOFQMXLSXs) {
      this._poService.CreateOFQMs(this.BPCOFQMXLSXs).subscribe((data) => {
        this.IsProgressBarVisibile6 = false;
      },
        (err) => {
          this.IsProgressBarVisibile6 = false;
        });
    }
  }

  UpdateInvoices(): void {
    this.IsProgressBarVisibile7 = true;
    if (this.BPCInvoiceXLSXs) {
      this._reportService.CreateInvoices(this.BPCInvoiceXLSXs).subscribe((data) => {
        this.IsProgressBarVisibile7 = false;
      },
        (err) => {
          this.IsProgressBarVisibile7 = false;
        });
    }
  }

  UpdatePayments(): void {
    this.IsProgressBarVisibile8 = true;
    if (this.BPCPaymentXLSXs) {
      this._reportService.CreatePayments(this.BPCPaymentXLSXs).subscribe((data) => {
        this.IsProgressBarVisibile8 = false;
      },
        (err) => {
          this.IsProgressBarVisibile8 = false;
        });
    }
  }

  ResetControl(): void {
    this.BPCFactXLSXs = [];
    this.BPCFactBankXLSXs = [];
    this.BPCOFHeaderXLSXs = [];
    this.BPCOFItemXLSXs = [];
    this.BPCOFScheduleLineXLSXs = [];
    this.BPCOFQMXLSXs = [];
    this.BPCOFGRGIXLSXs = [];
    this.BPCInvoiceXLSXs = [];
    this.BPCPaymentXLSXs = [];
    this.ResetAttachments();
  }

  ResetAttachments(): void {
    this.fileToUpload = null;
    this.fileToUploadList = [];
  }

  SetActionToOpenConfirmation(Actiontype: string): void {
    const Catagory = 'Data Migration';
    this.OpenConfirmationDialog(Actiontype, Catagory);
  }

  OpenConfirmationDialog(Actiontype: string, Catagory: string): void {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: Actiontype,
        Catagory: Catagory
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          if (Actiontype === 'Submit') {
            this.UploadDataMigrationAttachment(Actiontype);
          }
        }
      });
  }

  onSelectFile(event): void {
    this.ResetControl();
    this.fileToUpload = event.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(this.fileToUpload);
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      const data = new Uint8Array(this.arrayBuffer);
      const arr = new Array();
      for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
      const bstr = arr.join("");
      const workbook = XLSX.read(bstr, { type: "binary" });
      workbook.SheetNames.forEach(element => {
        if (element.toLowerCase() === 'bpc_fact') {
          const worksheet1 = workbook.Sheets[element];
          this.BPCFactXLSXs = XLSX.utils.sheet_to_json(worksheet1, { raw: true }) as BPCFactXLSX[];
        }
        else if (element.toLowerCase() === 'bpc_fact_bank') {
          const worksheet1 = workbook.Sheets[element];
          this.BPCFactBankXLSXs = XLSX.utils.sheet_to_json(worksheet1, { raw: true }) as BPCFactBankXLSX[];
        }
        else if (element.toLowerCase() === 'bpc_of_h') {
          const worksheet1 = workbook.Sheets[element];
          this.BPCOFHeaderXLSXs = XLSX.utils.sheet_to_json(worksheet1, { raw: true }) as BPCOFHeaderXLSX[];
        }
        else if (element.toLowerCase() === 'bpc_of_i') {
          const worksheet1 = workbook.Sheets[element];
          this.BPCOFItemXLSXs = XLSX.utils.sheet_to_json(worksheet1, { raw: true }) as BPCOFItemXLSX[];
        }
        else if (element.toLowerCase() === 'bpc_of_sl') {
          const worksheet1 = workbook.Sheets[element];
          this.BPCOFScheduleLineXLSXs = XLSX.utils.sheet_to_json(worksheet1, { raw: true }) as BPCOFScheduleLineXLSX[];
        }
        else if (element.toLowerCase() === 'bpc_of_grgi') {
          const worksheet1 = workbook.Sheets[element];
          this.BPCOFGRGIXLSXs = XLSX.utils.sheet_to_json(worksheet1, { raw: true }) as BPCOFGRGIXLSX[];
        }
        else if (element.toLowerCase() === 'bpc_of_qm') {
          const worksheet1 = workbook.Sheets[element];
          this.BPCOFQMXLSXs = XLSX.utils.sheet_to_json(worksheet1, { raw: true }) as BPCOFQMXLSX[];
        }
        else if (element.toLowerCase() === 'bpc_inv_h') {
          const worksheet1 = workbook.Sheets[element];
          this.BPCInvoiceXLSXs = XLSX.utils.sheet_to_json(worksheet1, { raw: true }) as BPCInvoiceXLSX[];
        }
        else if (element.toLowerCase() === 'bpc_pay_h') {
          const worksheet1 = workbook.Sheets[element];
          this.BPCPaymentXLSXs = XLSX.utils.sheet_to_json(worksheet1, { raw: true }) as BPCPaymentXLSX[];
        }
      });
      // const first_sheet_name = workbook.SheetNames[0];
      // const worksheet = workbook.Sheets[first_sheet_name];
      // console.log(XLSX.utils.sheet_to_json(worksheet, { raw: true }));
      // const arraylist = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      // this.fileToUploadList = [];
      // console.log(this.fileToUploadList);
    };
  }

  showErrorNotificationSnackBar(err: any): void {
    console.error(err);
    this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
    this.IsProgressBarVisibile = false;
  }

}
