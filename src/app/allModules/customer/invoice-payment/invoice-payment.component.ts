import { SelectionModel } from '@angular/cdk/collections';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatSnackBar, MatTableDataSource } from '@angular/material';
import {MatPaginator} from '@angular/material/paginator';
import { BPCInvoicePayment, BPCInvoicePayView, BPCPayRecord } from 'app/models/customer';
import { BPCPayPayment } from 'app/models/Payment.model';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/snackbar-status-enum';
import { POService } from 'app/services/po.service';
import { ReportService } from 'app/services/report.service';
import { PaymentDailogComponent } from '../payment-dailog/payment-dailog.component';
import { PaymentHistoryDialogComponent } from '../payment-history-dialog/payment-history-dialog.component';


@Component({
  selector: 'app-invoice-payment',
  templateUrl: './invoice-payment.component.html',
  styleUrls: ['./invoice-payment.component.scss']
})
export class InvoicePaymentComponent implements OnInit {
  InvoiceFormGroup: FormGroup;
  InvoiceItemFormGroup:FormGroup;

  // AllReturnItems:any[]=[];
  // AllProducts:any[]=[];
  IsProgressBarVisibile:boolean=false;
  notificationSnackBarComponent: NotificationSnackBarComponent;

  InvoiceFormdata:any[]=[];
  InvoicePaymentDataArray:BPCInvoicePayment[]=[]
  InvoiceDisplayedColumns: string[] = [
    'Select',
    'InvoiceNo',
    'Invoicedate',
    'PaidAmount',
    'AWBNumber',
    'PODStatus',
    'BalanceAmount',
    'Payment'
   
  ];
 
  InvoiceDataSource: MatTableDataSource<BPCInvoicePayment>;
  @ViewChild(MatPaginator) InvoicePaginator: MatPaginator;
  //mat-checkbox in table
  TableDataSelection = new SelectionModel<BPCInvoicePayment>(true, []);
  ispayment: boolean=false;
  InvoicePaymentRecordArray: BPCPayRecord[];
  PayDataSource: MatTableDataSource<BPCPayRecord>;
  SelectedPaymentData: BPCInvoicePayment[]=[];
  isPayButton: boolean;
  TotalPayAmount:number;
  isFullPayCheck:boolean;
  CreateandUpdateInvoicePay:BPCInvoicePayView;
  constructor(
    private _formBuilder: FormBuilder,
    private poservice:POService,
    public snackBar: MatSnackBar,
   public dialog:MatDialog
  ) {
    this.ispayment=false;
    this.isPayButton=false;
    this.isFullPayCheck=true;

    this.CreateandUpdateInvoicePay=new BPCInvoicePayView();
    // this.SelectedPaymentData.length=0;
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);

   }

  ngOnInit() {
    //this.InitializeReturnFormGroup();
    this.GetAllInvoices();
    this.GetAllRecordsDateFilter();
    // UpdateInvoicePay
  }
 
  GetAllInvoices(){
    this.poservice.GetAllInvoices().subscribe(
      (data)=>{
        this.InvoicePaymentDataArray=data as BPCInvoicePayment[],
        this.InvoiceDataSource=new MatTableDataSource( this.InvoicePaymentDataArray);
        this.InvoiceDataSource.paginator=this.InvoicePaginator;
        console.log(this.InvoicePaymentDataArray)},
      (err)=>{console.log(err)}
    )
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
  GetAllRecordsDateFilter(){
    this.poservice.GetAllRecordDateFilter().subscribe(
      (data)=>{
        this.InvoicePaymentRecordArray=data as BPCPayRecord[],
        // this.PayDataSource=new MatTableDataSource( this.InvoicePaymentRecordArray);
        // this.PayDataSource.paginator=this.InvoicePaginator;
        console.log(this.InvoicePaymentRecordArray)},
      (err)=>{console.log(err)}
    )
  }
  openPaymentdialog(data:BPCInvoicePayment){
   
    if(data!=null){
      var Invoicedata=new BPCInvoicePayment();
      console.log(data);
      Invoicedata=data as BPCInvoicePayment;
      
      Invoicedata.PaidAmount=data.PaidAmount;
      Invoicedata.InvoiceAmount=data.InvoiceAmount;
      console.log(Invoicedata);
      var BalanceAmount= Invoicedata.InvoiceAmount-Invoicedata.PaidAmount;
      const dialogRef = this.dialog.open(PaymentDailogComponent,{
        width: '700px',
         height:'420px',
        data:{Amount:BalanceAmount,isMultiple:false}
      });
      dialogRef.afterClosed().subscribe(result => {
        if(result!=null){
         console.log(result);
         var pay = result as BPCPayPayment;
         this.CreateandUpdateInvoicePay.PayPayment=[];
         this.CreateandUpdateInvoicePay.PayRecord=[];
         this.CreateandUpdateInvoicePay.Invoices=[];
         this.CreatePayPayment(Invoicedata,pay);
         this.CreatePayRecord(Invoicedata,pay.PaidAmount);
           var amount= pay.PaidAmount;
         Invoicedata.PaidAmount=Invoicedata.PaidAmount+amount;
        // this.CreateandUpdateInvoicePay.PaidAmount=Invoicedata.PaidAmount;
          // console.log(Invoicedata.PaidAmount,Invoicedata);
          this.CreateInvoice(Invoicedata, Invoicedata.PaidAmount);
          this.isFullPayCheck=false;
          console.log(this.InvoiceDataSource.data);
          this.UpdateInvoicePay();

        }
       
      });
    
    }
    else{
      this.TotalPayAmount=0;
      this.SelectedPaymentData.forEach(x=>{
        if(x.InvoiceAmount){
          var balance=x.InvoiceAmount-x.PaidAmount;
          this.TotalPayAmount= this.TotalPayAmount+balance;
        }
         
        });
        // console.log( this.TotalPayAmount);

      const dialogRef = this.dialog.open(PaymentDailogComponent,{
        width: '700px',
        height:'420px',
        data:{Amount:this.TotalPayAmount,isMultiple:true}
      });
      dialogRef.afterClosed().subscribe(result => {
        if(result!=null){
         console.log(result);
         var pay = result as BPCPayPayment;
         console.log( this.SelectedPaymentData);
         this.CreateandUpdateInvoicePay.PayPayment=[];
         this.CreateandUpdateInvoicePay.PayRecord=[];
         this.CreateandUpdateInvoicePay.Invoices=[];
         this.SelectedPaymentData.forEach(x=>{
          this.CreatePayPayment(x,pay);
          x.PaidAmount=x.InvoiceAmount-x.PaidAmount;
          this.CreatePayRecord(x, x.PaidAmount);
          this.CreateInvoice(x,null);
          });
          this.isFullPayCheck=false;
          this.UpdateInvoicePay();
        }
       
       
      });
    }
   
  }
  CreatePayPayment(Invoicedata:BPCInvoicePayment,pay:BPCPayPayment){
// add invoice no , reference no - missed fields
   var Pay = new BPCPayPayment();
    // Pay.PaidAmount=Invoicedata.PaidAmount;
    Pay.Client=Invoicedata.Client;
    Pay.Company=Invoicedata.Company;
    Pay.PartnerID=Invoicedata.PatnerID;
    Pay.Type=Invoicedata.Type;
    Pay.FiscalYear=Invoicedata.FiscalYear;
    Pay.DocumentNumber=Invoicedata.PoReference;
    Pay.BankAccount=pay.BankAccount;
    Pay.BankName=pay.BankName;
    Pay.PaidAmount=Invoicedata.PaidAmount+pay.PaidAmount;
    Pay.PaymentDate=pay.PaymentDate;
    Pay.PaymentType=pay.PaymentType;
    this.CreateandUpdateInvoicePay.PayPayment.push(Pay);
   
}


  UpdateInvoicePay(){
console.log(this.CreateandUpdateInvoicePay);

    this.poservice.UpdateInvoicePay(this.CreateandUpdateInvoicePay).subscribe(
      (data)=>{console.log(data),
        this.GetAllInvoices();
      this.notificationSnackBarComponent.openSnackBar('Succesfully created',SnackBarStatus.success);
  },
      (err)=>{console.log(err),
      this.notificationSnackBarComponent.openSnackBar('Failed to create',SnackBarStatus.danger);
  }
    )
  }
  SelectForPayment()
  {
   if(this.TableDataSelection.selected){
    this.isPayButton=true;
    this.SelectedPaymentData=Array.from(this.TableDataSelection.selected);
   }
   else if( this.SelectedPaymentData.length==0 && this.TableDataSelection.isEmpty()){
    this.isPayButton=false;
   }
   // this.TableDataSelection.selected.forEach(x=>this.SelectedPaymentData.push(x));
   
  }

  CreateInvoice(Invoicedata:BPCInvoicePayment,Amount:number){
   // console.log(Invoicedata);
   Invoicedata.DateofPayment=new Date();
  if(Amount!=null){
    Invoicedata.PaidAmount=Amount;
  }
  else{
    Invoicedata.PaidAmount=Invoicedata.InvoiceAmount;
  }
this.CreateandUpdateInvoicePay.Invoices.push(Invoicedata);
    // this.poservice.UpdateInvoice(Invoicedata).subscribe(
    
    //   (data)=>{console.log(data)
    //     this.CreatePayRecord(Invoicedata,amount);
    //     this.notificationSnackBarComponent.openSnackBar('Succesfully created',SnackBarStatus.success);
      
    //   },
    //   (err)=>{
    //     console.log(err),
    //     this.notificationSnackBarComponent.openSnackBar('Failed to create',SnackBarStatus.danger);

    //   }
      
    // )
  }
  CreatePayRecord(Invoicedata:BPCInvoicePayment,amount){
   
      var PayRecord= new BPCPayRecord();
      PayRecord.Client=Invoicedata.Client;
      PayRecord.Company=Invoicedata.Company;
      PayRecord.DocumentNumber=Invoicedata.PoReference;
      PayRecord.InvoiceNumber=Invoicedata.InvoiceNo;
      PayRecord.Type=Invoicedata.Type;
      PayRecord.PartnerID=Invoicedata.PatnerID;
      PayRecord.PaidAmount=amount;
      PayRecord.PaymentDate=new Date();
      this.CreateandUpdateInvoicePay.PayRecord.push(PayRecord);

   
// this.poservice.CreatePaymentRecord(PayRecord).subscribe(
    
//   (data)=>console.log(data),
//   (err)=>console.log(err)
  
// )
  }

   openPaidAmount(data){

    var Invoicedata=new BPCInvoicePayment();
// console.log(data);

Invoicedata=data as BPCInvoicePayment;
// var PayRecord = new BPCPayRecord();
 this.GetAllRecordsDateFilter();
var paymemtdata= this.InvoicePaymentRecordArray.filter(x=>x.InvoiceNumber==Invoicedata.InvoiceNo);
console.log(paymemtdata);

    const dialogRef = this.dialog.open(PaymentHistoryDialogComponent,{
      // width: '700px',
      // height:'300px',
      data:paymemtdata
    });
  
  }
 
}
