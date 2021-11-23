import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import { MatPaginator } from '@angular/material/paginator';
import { BPCInvoicePayView, BPCPayRecord } from 'app/models/customer';
import { AuthenticationDetails } from 'app/models/master';
import { BPCInvoice } from 'app/models/OrderFulFilment';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { AuthService } from 'app/services/auth.service';
import { POService } from 'app/services/po.service';
import { ReportService } from 'app/services/report.service';
import { Guid } from 'guid-typescript';
import { PaymentDailogComponent } from '../payment-dailog/payment-dailog.component';
import { PaymentHistoryDialogComponent } from '../payment-history-dialog/payment-history-dialog.component';
import * as SecureLS from 'secure-ls';
import { Router } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { DatePipe } from '@angular/common';
import { ExcelService } from 'app/services/excel.service';


@Component({
  selector: 'app-invoice-payment',
  templateUrl: './invoice-payment.component.html',
  styleUrls: ['./invoice-payment.component.scss'],
  encapsulation: ViewEncapsulation.None,
  animations: fuseAnimations

})
export class InvoicePaymentComponent implements OnInit {
  InvoiceFormGroup: FormGroup;
  InvoiceItemFormGroup: FormGroup;

  // AllReturnItems:any[]=[];
  // AllProducts:any[]=[];
  IsProgressBarVisibile = false;
  notificationSnackBarComponent: NotificationSnackBarComponent;

  InvoiceFormdata: any[] = [];
  AllInvoices: BPCInvoice[] = [];
  InvoiceDisplayedColumns: string[] = [
    // 'Select',
    'InvoiceNo',
    'DocNumber',
    'Invoicedate',
    'InvoiceAmount',
    'PaidAmount',
    'BalanceAmount',
    'Status',
    'PODStatus',
    'Payment'
  ];

  InvoiceDataSource: MatTableDataSource<BPCInvoice>;
  @ViewChild(MatPaginator) InvoicePaginator: MatPaginator;
  // mat-checkbox in table
  TableDataSelection = new SelectionModel<BPCInvoice>(true, []);
  ispayment = false;
  InvoicePaymentRecordArray: BPCPayRecord[];
  PayDataSource: MatTableDataSource<BPCPayRecord>;
  SelectedPaymentData: BPCInvoice[] = [];
  isPayButton: boolean;
  TotalPayAmount: number;
  isFullPayCheck: boolean;
  InvoicePayView: BPCInvoicePayView;
  fileToUpload: File;
  fileToUploadList: File[];
  authenticationDetails: AuthenticationDetails;
  currentUserID: Guid;
  currentUserName: string;
  currentUserRole: string;
  SecretKey: string;
  SecureStorage: SecureLS;
  MenuItems: string[];
  SearchFormGroup: FormGroup;
  isDateError: boolean;
  DefaultFromDate: Date;
  DefaultToDate: Date;
  isExpanded: boolean;
  searchText = '';
  constructor(
    private _formBuilder: FormBuilder,
    private _authService: AuthService,
    private formBuilder: FormBuilder,
    private _router: Router,
    private poservice: POService,
    public snackBar: MatSnackBar,
    public dialog: MatDialog,
    public _datePipe: DatePipe,
    private _excelService: ExcelService
  ) {
    this.ispayment = false;
    this.isPayButton = false;
    this.isFullPayCheck = true;

    this.InvoicePayView = new BPCInvoicePayView();
    // this.SelectedPaymentData.length=0;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
    this.SecretKey = this._authService.SecretKey;
    this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    this.authenticationDetails = new AuthenticationDetails();
    this.DefaultFromDate = new Date();
    this.DefaultFromDate.setDate(this.DefaultFromDate.getDate() - 30);
    this.DefaultToDate = new Date();
    this.isExpanded = false;
  }

  ngOnInit(): void {
    // this.InitializeReturnFormGroup();
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
    this.fileToUpload = null;
    this.fileToUploadList = [];
    this.InitializeSearchForm();
    this.SearchClicked();
    // this.GetAllInvoicesByPartnerID();
    // this.GetAllRecordsDateFilter();
    // UpdateInvoicePay
  }

  // GetAllInvoices(): void {
  //   this.IsProgressBarVisibile = true;
  //   this.poservice.GetAllInvoices().subscribe(
  //     (data) => {
  //       this.IsProgressBarVisibile = false;
  //       this.AllInvoices = data as BPCInvoice[],
  //         this.InvoiceDataSource = new MatTableDataSource(this.AllInvoices);
  //       this.InvoiceDataSource.paginator = this.InvoicePaginator;
  //       // console.log(this.AllInvoices);
  //     },
  //     (err) => {
  //       console.log(err);
  //       this.IsProgressBarVisibile = false;
  //     }
  //   );
  // }

  InitializeSearchForm(): void {
    this.SearchFormGroup = this.formBuilder.group({
      // VendorCode: [''],
      InvoiceNumber: [''],
      DocNumber: [''],
      // Material: [''],
      // Status: ['GateEntry'],
      FromDate: [this.DefaultFromDate],
      ToDate: [this.DefaultToDate]
    });


  }
  ResetControl(): void {
    this.AllInvoices = [];
    this.ResetFormGroup(this.SearchFormGroup);
  }
  ResetFormGroup(formGroup: FormGroup): void {
    formGroup.reset();
    Object.keys(formGroup.controls).forEach(key => {
      formGroup.get(key).enable();
      formGroup.get(key).markAsUntouched();
    });
  }

  DateSelected(): void {
    const FROMDATEVAL = this.SearchFormGroup.get('FromDate').value as Date;
    const TODATEVAL = this.SearchFormGroup.get('ToDate').value as Date;
    if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
      this.isDateError = true;
    } else {
      this.isDateError = false;
    }
  }

  SearchClicked(): void {
    if (this.SearchFormGroup.valid) {
      if (!this.isDateError) {
        this.fileToUpload = null;
        this.fileToUploadList = [];
        const FrDate = this.SearchFormGroup.get('FromDate').value;
        let FromDate = '';
        if (FrDate) {
          FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
        }
        const TDate = this.SearchFormGroup.get('ToDate').value;
        let ToDate = '';
        if (TDate) {
          ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
        }
        // const VendorCode = this.SearchFormGroup.get('VendorCode').value;
        const InvoiceNumber = this.SearchFormGroup.get('InvoiceNumber').value;
        const DocNumber = this.SearchFormGroup.get('DocNumber').value;
        // const Material = this.SearchFormGroup.get('Material').value;
        // let Status = this.SearchFormGroup.get('Status').value;
        // if (!Status) {
        //   Status = "";
        // }
        this.IsProgressBarVisibile = true;
        this.poservice.FilterInvoices(this.currentUserName, DocNumber, InvoiceNumber, FromDate, ToDate).subscribe(
          (data) => {
            this.IsProgressBarVisibile = false;
            this.AllInvoices = data as BPCInvoice[],
              this.InvoiceDataSource = new MatTableDataSource(this.AllInvoices);
            this.InvoiceDataSource.paginator = this.InvoicePaginator;
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

  expandClicked(): void {
    this.isExpanded = !this.isExpanded;
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.InvoiceDataSource.filter = filterValue.trim().toLowerCase();
  }

  GetAllInvoicesByPartnerID(): void {
    this.fileToUpload = null;
    this.fileToUploadList = [];
    this.IsProgressBarVisibile = true;
    this.poservice.GetAllInvoicesByPartnerID(this.currentUserName).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.AllInvoices = data as BPCInvoice[],
          this.InvoiceDataSource = new MatTableDataSource(this.AllInvoices);
        this.InvoiceDataSource.paginator = this.InvoicePaginator;
        // console.log(this.AllInvoices);
      },
      (err) => {
        console.log(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  // GetAllRecords(){
  //   this.poservice.GetAllPaymentRecord().subscribe(
  //     (data)=>{
  //       this.InvoicePaymentRecordArray=data as BPCPayRecord[],
  //       // this.PayDataSource=new MatTableDataSource( this.InvoicePaymentRecordArray);
  //       // this.PayDataSource.paginator=this.InvoicePaginator;
  //       console.log(this.InvoicePaymentRecordArray)},
  //     (err)=>{console.log(err)}
  //   )
  // }
  // openPaidAmount(data: BPCInvoice): void {

  //   let Invoicedata = new BPCInvoice();
  //   // console.log(data);

  //   Invoicedata = data as BPCInvoice;
  //   // var PayRecord = new BPCPayRecord();
  //   this.GetAllRecordsDateFilter();
  //   const paymemtdata = this.InvoicePaymentRecordArray.filter(x => x.InvoiceNumber === Invoicedata.InvoiceNo);
  //   console.log(paymemtdata);

  //   const dialogRef = this.dialog.open(PaymentHistoryDialogComponent, {
  //     // width: '700px',
  //     // height:'300px',
  //     data: paymemtdata
  //   });

  // }
  GetPaymentRecordsByInvoice(inv: BPCInvoice): void {
    this.IsProgressBarVisibile = true;
    this.poservice.GetPaymentRecordsByInvoice(this.currentUserName, inv.PoReference, inv.InvoiceNo).subscribe(
      (data) => {
        this.IsProgressBarVisibile = false;
        this.InvoicePaymentRecordArray = data as BPCPayRecord[];
        const dialogRef = this.dialog.open(PaymentHistoryDialogComponent, {
          // width: '700px',
          // height:'300px',
          data: this.InvoicePaymentRecordArray
        });
        // this.PayDataSource=new MatTableDataSource( this.InvoicePaymentRecordArray);
        // this.PayDataSource.paginator=this.InvoicePaginator;
        // console.log(this.InvoicePaymentRecordArray);
      },
      (err) => {
        console.log(err);
        this.IsProgressBarVisibile = false;
      }
    );
  }
  GetAllRecordsDateFilter(): void {
    this.poservice.GetAllRecordDateFilter().subscribe(
      (data) => {
        this.InvoicePaymentRecordArray = data as BPCPayRecord[],
          // this.PayDataSource=new MatTableDataSource( this.InvoicePaymentRecordArray);
          // this.PayDataSource.paginator=this.InvoicePaginator;
          console.log(this.InvoicePaymentRecordArray);
      },
      (err) => { console.log(err); }
    );
  }
  openPaymentdialog(data: BPCInvoice): void {

    if (data != null) {
      let Invoicedata = new BPCInvoice();
      // console.log(data);
      Invoicedata = data as BPCInvoice;
      Invoicedata.PaidAmount = data.PaidAmount;
      Invoicedata.InvoiceAmount = data.InvoiceAmount;
      // console.log(Invoicedata);
      const BalanceAmount = Invoicedata.InvoiceAmount - Invoicedata.PaidAmount;
      const dialogRef = this.dialog.open(PaymentDailogComponent, {
        panelClass: 'payment-dialog',
        data: { Amount: BalanceAmount, isMultiple: false, fileToUpload: this.fileToUpload }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result != null) {
          // console.log(result);
          // tslint:disable-next-line:prefer-const
          let pay = result as BPCPayRecord;
          if (pay.PaymentDocument instanceof File) {
            this.fileToUpload = pay.PaymentDocument as File;
            pay.AttachmentName = this.fileToUpload.name;
            pay.Status = 'Open';
          }
          this.InvoicePayView.PayPayment = [];
          this.InvoicePayView.PayRecord = [];
          this.InvoicePayView.Invoices = [];
          // this.CreatePayPayment(Invoicedata, pay);
          this.GetPayRecord(Invoicedata, pay);
          const amount = pay.PaidAmount;
          Invoicedata.PaidAmount = Invoicedata.PaidAmount + amount;
          // this.InvoicePayView.PaidAmount=Invoicedata.PaidAmount;
          // console.log(Invoicedata.PaidAmount,Invoicedata);
          this.GetInvoice(Invoicedata, Invoicedata.PaidAmount, pay);
          this.isFullPayCheck = false;
          // console.log(this.InvoiceDataSource.data);
          // this.UpdateInvoicePay();
          this.AddPaymentRecord();

        }

      });

    }
    else {
      this.TotalPayAmount = 0;
      this.SelectedPaymentData.forEach(x => {
        if (x.InvoiceAmount) {
          const balance = x.InvoiceAmount - x.PaidAmount;
          this.TotalPayAmount = this.TotalPayAmount + balance;
        }

      });
      // console.log( this.TotalPayAmount);

      const dialogRef = this.dialog.open(PaymentDailogComponent, {
        panelClass: 'attachment-dialog',
        data: { Amount: this.TotalPayAmount, isMultiple: true, fileToUpload: this.fileToUpload }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (result != null) {
          // console.log(result);
          // tslint:disable-next-line:prefer-const
          let pay = result as BPCPayRecord;
          if (pay.PaymentDocument instanceof File) {
            this.fileToUpload = pay.PaymentDocument as File;
            pay.AttachmentName = this.fileToUpload.name;
            pay.Status = 'Open';
          }
          // console.log(this.SelectedPaymentData);
          this.InvoicePayView.PayPayment = [];
          this.InvoicePayView.PayRecord = [];
          this.InvoicePayView.Invoices = [];
          this.SelectedPaymentData.forEach(x => {
            // this.CreatePayPayment(x, pay);
            x.PaidAmount = x.InvoiceAmount - x.PaidAmount;
            this.GetPayRecord(x, pay);
            this.GetInvoice(x, null, pay);
          });
          this.isFullPayCheck = false;
          // this.UpdateInvoicePay();
          this.AddPaymentRecord();
        }


      });
    }

  }
  // CreatePayPayment(Invoicedata: BPCInvoice, pay: BPCPayRecord): void {
  //   // add invoice no , reference no - missed fields
  //   const Pay = new BPCPayRecord();
  //   // Pay.PaidAmount=Invoicedata.PaidAmount;
  //   Pay.Client = Invoicedata.Client;
  //   Pay.Company = Invoicedata.Company;
  //   Pay.PartnerID = Invoicedata.PatnerID;
  //   Pay.Type = Invoicedata.Type;
  //   // Pay.FiscalYear = Invoicedata.FiscalYear;
  //   Pay.DocumentNumber = Invoicedata.PoReference;
  //   Pay.InvoiceNumber = pay.InvoiceNumber;
  //   // Pay.PaidAmount = pay.PaidAmount;
  //   Pay.PaidAmount = Invoicedata.PaidAmount + pay.PaidAmount;
  //   Pay.UOM = pay.UOM;
  //   Pay.ReferenceNumber = pay.ReferenceNumber;
  //   Pay.PaymentDate = pay.PaymentDate;
  //   Pay.AccountNumber = pay.AccountNumber;
  //   Pay.Bank = pay.Bank;
  //   Pay.PaymentType = pay.PaymentType;
  //   this.InvoicePayView.PayPayment.push(Pay);

  // }


  UpdateInvoicePay(): void {
    // console.log(this.InvoicePayView);
    this.IsProgressBarVisibile = true;
    this.poservice.UpdateInvoicePay(this.InvoicePayView).subscribe(
      (data) => {
        // console.log(data),
        this.IsProgressBarVisibile = false;
        // this.GetAllInvoicesByPartnerID();
        this.SearchClicked();
        this.notificationSnackBarComponent.openSnackBar('Payment details updated successfully', SnackBarStatus.success);
      },
      (err) => {
        console.log(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Failed to update payment details', SnackBarStatus.danger);
      }
    );
  }

  AddPaymentRecord(): void {
    // console.log(this.InvoicePayView);
    this.IsProgressBarVisibile = true;
    this.fileToUploadList = [];
    this.fileToUploadList.push(this.fileToUpload);
    this.poservice.AddPaymentRecord(this.InvoicePayView, this.fileToUploadList).subscribe(
      (data) => {
        // console.log(data),
        this.IsProgressBarVisibile = false;
        // this.GetAllInvoicesByPartnerID();
        this.SearchClicked();
        this.notificationSnackBarComponent.openSnackBar('Payment details updated successfully', SnackBarStatus.success);
      },
      (err) => {
        console.log(err);
        this.IsProgressBarVisibile = false;
        this.notificationSnackBarComponent.openSnackBar('Failed to update payment details', SnackBarStatus.danger);
      }
    );
  }

  SelectForPayment(): void {
    if (this.TableDataSelection.selected) {
      this.isPayButton = true;
      this.SelectedPaymentData = Array.from(this.TableDataSelection.selected);
    }
    else if (this.SelectedPaymentData.length === 0 && this.TableDataSelection.isEmpty()) {
      this.isPayButton = false;
    }
    // this.TableDataSelection.selected.forEach(x=>this.SelectedPaymentData.push(x));

  }

  GetInvoice(Invoicedata: BPCInvoice, Amount: number, PayRecord: BPCPayRecord): void {
    // console.log(Invoicedata);
    Invoicedata.DateofPayment = PayRecord.PaymentDate;
    if (Amount != null) {
      Invoicedata.PaidAmount = Amount;
    }
    else {
      Invoicedata.PaidAmount = Invoicedata.InvoiceAmount;
    }
    this.InvoicePayView.Invoices.push(Invoicedata);
    // this.poservice.UpdateInvoice(Invoicedata).subscribe(

    //   (data)=>{console.log(data)
    //     this.GetPayRecord(Invoicedata,amount);
    //     this.notificationSnackBarComponent.openSnackBar('Succesfully created',SnackBarStatus.success);

    //   },
    //   (err)=>{
    //     console.log(err),
    //     this.notificationSnackBarComponent.openSnackBar('Failed to create',SnackBarStatus.danger);

    //   }

    // )
  }
  GetPayRecord(Invoicedata: BPCInvoice, PayRecord: BPCPayRecord): void {
    PayRecord.Client = Invoicedata.Client;
    PayRecord.Company = Invoicedata.Company;
    PayRecord.DocumentNumber = Invoicedata.PoReference;
    PayRecord.InvoiceNumber = Invoicedata.InvoiceNo;
    PayRecord.Type = Invoicedata.Type;
    PayRecord.PartnerID = Invoicedata.PatnerID;
    PayRecord.PaymentDocument = null;
    this.InvoicePayView.PayRecord.push(PayRecord);
    // this.poservice.CreatePaymentRecord(PayRecord).subscribe(

    //   (data)=>console.log(data),
    //   (err)=>console.log(err)

    // )
  }


  exportAsXLSX(): void {
    const currentPageIndex = this.InvoiceDataSource.paginator.pageIndex;
    const PageSize = this.InvoiceDataSource.paginator.pageSize;
    const startIndex = currentPageIndex * PageSize;
    const endIndex = startIndex + PageSize;
    const itemsShowed = this.AllInvoices.slice(startIndex, endIndex);
    const itemsShowedd = [];
    itemsShowed.forEach(x => {
      const item = {
        'Invoice No': x.InvoiceNo,
        'PO Reference': x.PoReference,
        'Invoice Date': x.InvoiceDate ? this._datePipe.transform(x.InvoiceDate, 'dd-MM-yyyy') : '',
        // 'Posted on': x.PostedOn ? this._datePipe.transform(x.PostedOn, 'dd-MM-yyyy') : '',
        'Invoice Amount': x.InvoiceAmount,
        'Paid Amount': x.PaidAmount,
        'Balance Amount': x.BalanceAmount,
        'POD Status': (x.PODDate && x.PODConfirmedBy) ? 'Confirmed' : 'Open',
      };
      itemsShowedd.push(item);
    });
    this._excelService.exportAsExcelFile(itemsShowedd, 'Invoices');
  }


}
