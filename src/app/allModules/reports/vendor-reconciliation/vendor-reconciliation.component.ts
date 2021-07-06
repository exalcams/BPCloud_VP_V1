import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogConfig, MatPaginator, MatSnackBar, MatSort, MatTableDataSource } from '@angular/material';
import { BPCInvoice, InvoiceVendor } from 'app/models/OrderFulFilment';
import { ExcelService } from 'app/services/excel.service';
import { MasterService } from 'app/services/master.service';
import { POService } from 'app/services/po.service';
import * as XLSX from 'xlsx';
import { Validators } from '@angular/forms';
import { NotificationDialogComponent } from 'app/notifications/notification-dialog/notification-dialog.component';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
// import { MAT_STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';


@Component({
  selector: 'app-vendor-reconciliation',
  templateUrl: './vendor-reconciliation.component.html',
  styleUrls: ['./vendor-reconciliation.component.scss'],

})

export class VendorReconciliationComponent implements OnInit {
  VendorExcelFormGroup: FormGroup;
  vendorList: string[] = [];
  excel: File;
  fileToUpload: File;
  arrayBuffer: any;
  IsProgressBarVisibile: boolean;
  ExcelItem: InvoiceVendor[] = [];
  Selectedvendor: string;
  excelval: string[] = [];
  ExcelItems: any[] = [];
  excelval1: InvoiceVendor;
  // tslint:disable-next-line:no-inferrable-types
  matchlist_bool: boolean = false;
  VendorMatchDataSource: MatTableDataSource<InvoiceVendor>;
  OverViewDataSource: MatTableDataSource<any>;
  VendorMatchColumns = ["InvoiceNo", "InvoiceDate", "InvoiceAmount", "BalanceAmount", "ReasonCode"];
  OverviewColumns = ["Type", "Occurance"];
  OverviewData: any[] = [];

  VendorMatchData: InvoiceVendor[] = [];
  AllArray: InvoiceVendor[] = [];
  VendorMatchData_ForExcel: InvoiceVendor[] = [];
  // tslint:disable-next-line:no-inferrable-types
  MissmatchTable: boolean = false;
  @ViewChild(MatSort) vendorSort: MatSort;
  @ViewChild(MatSort) overviewSort: MatSort;
  notificationSnackBarComponent: NotificationSnackBarComponent;
  isExpanded: boolean;
  Plants: string[] = [];
  count: number;
  length: number;
  tableVisible_bool: boolean = false;
  overviewTableVisible: boolean = false;
  disableTextbox = false;
  Exceldownloadvisible_bool: boolean = false;
  DeatilsVisible_Bool: boolean = false;
  FileNextBtnVisible_Bool: boolean = false;
  DetailNxtBtn_VisibleBool: boolean = false
  firstFormGroup: FormGroup;
  secondFormGroup: FormGroup;
  file_bool: boolean = true;
  details_bool: boolean;
  overview_bool: boolean = false;
  submit_bool: boolean = false;
  subbmit_visibleBool: boolean = false
  MatchedCount: number = 0;
  MisMatchCount: number = 0;
  flag1: boolean;
  flag2: boolean;
  TextAreaMinRow = 3;
  TextAreaMaxRow = 5;
  TextAreaValue = "";
  mailId: any;


  // tslint:disable-next-line:max-line-length
  constructor(private formBuilder: FormBuilder,
    private _MasterService: MasterService,
    private _POService: POService,
    private _excelService: ExcelService,
    private dialog: MatDialog,
    public snackBar: MatSnackBar) 
    {
    this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar); this.isExpanded = false;
    this.IsProgressBarVisibile = false;
    }

  ngOnInit()
   {
    this.InitializeChooseForm();
    this.vendor();
    this.firstFormGroup = this.formBuilder.group({
      firstCtrl: ['', Validators.required]
    });
    this.secondFormGroup = this.formBuilder.group({
      secondCtrl: ['', Validators.required]
    });
  }

  InitializeChooseForm(): void
   {

    this.VendorExcelFormGroup = this.formBuilder.group({
      Vendor: [''],
      Excel: [''],
    })

  }
  getPosts(vendor): void
   {

    this.Selectedvendor = vendor;
  }
  vendor(): void {
    this.IsProgressBarVisibile = true;
    this.matchlist_bool = false;
    this.MissmatchTable = false;
    this.VendorExcelFormGroup.get('Excel').disable();
    this._MasterService.GetVendor().subscribe(
      (data) => {
        this.vendorList = data as string[];
        console.log("data", data);
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        this.IsProgressBarVisibile = false;
        console.error(err);
      }
    );
  }
  handleFileInput(eve): void 
  {
    this.IsProgressBarVisibile = true;
    this.details_bool = false;
    this.file_bool = true;
    this.overviewTableVisible = false;
    this.subbmit_visibleBool = false;
    this.overview_bool = false;
    this.submit_bool = false;
    this.DeatilsVisible_Bool = false;

    this.DetailNxtBtn_VisibleBool = false;
    this.tableVisible_bool = false;
    this.MisMatchCount = 0;
    this.MatchedCount = 0;
    this.disableTextbox = !this.disableTextbox;
    this.VendorMatchDataSource = null;
    this.VendorMatchData = [];
    this.VendorMatchDataSource = new MatTableDataSource(this.VendorMatchData);
    this.VendorMatchDataSource.sort = this.vendorSort;
    this.excel = eve.target.files[0];
    this.VendorExcelFormGroup.get("Excel").setValue(this.excel.name);
    this.fileToUpload = eve.target.files[0];
    const fileReader = new FileReader();
    fileReader.readAsArrayBuffer(this.fileToUpload);
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      const data = new Uint8Array(this.arrayBuffer);
      const arr = new Array();
      for (let i = 0; i !== data.length; ++i) { arr[i] = String.fromCharCode(data[i]); }
      const bstr = arr.join("");
      const workbook = XLSX.read(bstr, { type: "binary" });
      if (workbook.SheetNames.length > 0) {
        const first_sheet_name = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[first_sheet_name];
        console.log(XLSX.utils.sheet_to_json(worksheet, { raw: true }));
        this.ExcelItem = XLSX.utils.sheet_to_json(worksheet, { raw: true }) as InvoiceVendor[];
        // this.Excel_disable_bool='true';
        this.excelval1 = this.ExcelItem[0];
        this.ExcelItems = [];
        this.ExcelItem.forEach(element => {
          this.ExcelItems.push(element);
        });

        if (this.Selectedvendor != null) {
          this.matchlist_bool = false;

          this.length = this.ExcelItems.length;

        }
        this.MatchedCount_func();
        this.MisMatchCount_func();
        this.PartialMatch_funcForAll();
        this._MasterService.GetMail(this.Selectedvendor).subscribe(
          (data) => {
            this.mailId = data[0];
            console.log(" this.mailId", data[0]);
          },
          (err) => {
            // this.IsProgressBarVisibile = false;
            console.error(err);
          }
        );

      }

    }
    this.FileNextBtnVisible_Bool = true;
    this.IsProgressBarVisibile = false;
  }

  fileNextBtn(): void 
  {
    //for chak
    //  this. subbmit_visibleBool=true;
    // chk
    this.details_bool = true;
    this.DetailNxtBtn_VisibleBool = true;
    this.DeatilsVisible_Bool = true;
    this.VendorExcelFormGroup.get("Excel").setValue(null);
    this.file_bool = false;
  }

  EmailToVendor(): void 
  {
    this.tableVisible_bool = false;
    this.submit_bool = true;
    this.IsProgressBarVisibile = true;

    console.log(" this.mailId", this.mailId);


    this._POService.SendMail_VendorReconciliation(this.ExcelItems, this.Selectedvendor, this.TextAreaValue, this.mailId).subscribe(
      (data) => {
        console.log(data);
        this.notificationSnackBarComponent.openSnackBar('Mail Sent Successfully', SnackBarStatus.success);
        this.details_bool = false;
        this.file_bool = true;
        this.overviewTableVisible = false;
        this.subbmit_visibleBool = false;
        this.overview_bool = false;
        this.submit_bool = false;
        this.DeatilsVisible_Bool = false;
        this.FileNextBtnVisible_Bool = true;
        this.DetailNxtBtn_VisibleBool = false;

        this.overview_bool = false;
        this.IsProgressBarVisibile = false;
      },
      (err) => {
        this.IsProgressBarVisibile = false;
        console.log(err);

      })

  }
  Deatils_Nextbtn(): void 
  {
    this.OverviewData = [];
    this.overview_bool = true
    this.details_bool = false

    const Mismatched = {
      Type: "Mismatched",
      Occurance: this.MisMatchCount
    }


    this.OverviewData.push(Mismatched)
    const Matched = {
      Type: "Matched",
      Occurance: this.MatchedCount
    }

    this.OverviewData.push(Matched)

    const All = {
      Type: "All",
      Occurance: this.ExcelItems.length
    }

    this.OverviewData.push(All)

    // if(this.flag1 && this.flag2)
    // {
    this.OverViewDataSource = new MatTableDataSource(this.OverviewData);
    this.OverViewDataSource.sort = this.overviewSort;
    this.overviewTableVisible = true

    // }
  }
  openNotificationDialog1(): void 
  {
    const dialogConfig: MatDialogConfig = {
      data: {
        Actiontype: 'Download',
        Catagory: 'Table Data'
      },
      panelClass: 'confirmation-dialog'
    };
    const dialogRef = this.dialog.open(NotificationDialogComponent, dialogConfig);
    dialogRef.afterClosed().subscribe(
      result => {
        if (result) {
          console.log("result", result);
          this.exportAsXLSX();

        }
        this.subbmit_visibleBool = true;
        this.submit_bool = true
        this.overview_bool = false
        // this.overview_Nextbtn();
      });
  }
  MatchedCount_func(): void {
    this.IsProgressBarVisibile = true;

    this.VendorMatchData_ForExcel = [];
    this.ExcelItems.forEach(element => {

      this._POService.GetExcel_VendorReconciliationMatched(element, this.Selectedvendor).subscribe(
        (data) => {
          if (data.length != 0) {

            this.MatchedCount = this.MatchedCount + 1;
            data.forEach(element => {

              this.VendorMatchData_ForExcel.push(element);
              console.log("this.VendorMatchData_ForExcel", this.VendorMatchData_ForExcel);

            });

          }
        });
    });
    this.IsProgressBarVisibile = false;

  }
  MisMatchCount_func(): void {

    this.ExcelItems.forEach(element => {
      this._POService.GetExcel_VendorReconciliationMismatch(element, this.Selectedvendor).subscribe(
        (data1) => {
          if (data1.length != 0) {

            this.MisMatchCount = this.MisMatchCount + 1;

          }
        })



    })
  }
  PartialMatch_funcForAll(): void {
    this.AllArray = [];
    this.ExcelItems.forEach(element => {
      this._POService.GetExcel_VendorReconciliationPartialMatch(element, this.Selectedvendor).subscribe(
        (data2) => {

          if (data2.length != 0) {
            data2.forEach(element => {
              this.AllArray.push(element);
            });

            if (this.AllArray.length != 0) {
              this.AllArray.forEach(element => {
                this.ExcelItems.forEach(element1 => {
                  if (element.InvoiceNo != element1.InvoiceNo) {
                    this.AllArray.push(element1);
                    console.log("(this.AllArray", this.AllArray);

                  }
                });
              });
            }

          }
        })
    })

  }
  Mismatched(): void {
    this.IsProgressBarVisibile = true;
    this.tableVisible_bool = true
    this.VendorMatchData = [];
    this.VendorMatchDataSource = new MatTableDataSource(this.VendorMatchData);
    console.log("ExcelItems", this.ExcelItems);
    this.count = 0;

    this.ExcelItems.forEach(element => {

      this._POService.GetExcel_VendorReconciliationMismatch(element, this.Selectedvendor).subscribe(
        (data) => {

          if (data != null) {
            this.count = this.count + 1;

            this.MissmatchTable = true;
            console.log("GetExcel_VendorReconciliationMismatch", data);

            data.forEach(element => {
              this.VendorMatchData.push(element);

            });
            if (this.count === this.length) {
              this.VendorMatchDataSource = null;
              this.VendorMatchDataSource = new MatTableDataSource(this.VendorMatchData);
              this.VendorMatchDataSource.sort = this.vendorSort;
              //  this.VendorMatchData=null;
            }

          }
          else {
            this.count = this.count + 1;
            this.VendorMatchDataSource = null;
            this.VendorMatchDataSource = new MatTableDataSource(this.VendorMatchData);
            this.VendorMatchDataSource.sort = this.vendorSort;
          }
          this.IsProgressBarVisibile = false;
        },

        (err) => {
          this.IsProgressBarVisibile = false;
          console.log(err);

        }

      )
    });
  }
  PartiallyMatched(): void {
    this.IsProgressBarVisibile = true;

    this.tableVisible_bool = true
    this.VendorMatchData = [];
    this.VendorMatchDataSource = new MatTableDataSource(this.VendorMatchData);
    this.count = 0;
    // this.VendorMatchData=null;

    this.ExcelItems.forEach(element => {

      this._POService.GetExcel_VendorReconciliationPartialMatch(element, this.Selectedvendor).subscribe(
        (data) => {
          this.IsProgressBarVisibile = false;
          if (data.length != 0) {
            this.count = this.count + 1;
            this.MissmatchTable = true;
            console.log("GetExcel_VendorReconciliationPartialMatch", data);
            data.forEach(element => {
              this.VendorMatchData.push(element);

            });
            // if (this.count === this.length) {
            this.VendorMatchDataSource = null;
            this.VendorMatchDataSource = new MatTableDataSource(this.VendorMatchData);
            this.VendorMatchDataSource.sort = this.vendorSort;

            // }
          }
          else {
            this.count = this.count + 1;
            this.VendorMatchDataSource = null;
            this.VendorMatchDataSource = new MatTableDataSource(this.VendorMatchData);
            this.VendorMatchDataSource.sort = this.vendorSort;
          }


        },
        (err) => {
          this.IsProgressBarVisibile = false;

          console.log(err);
        }

      )
    });

  }
  Matched(): void {
    this.IsProgressBarVisibile = true;

    this.tableVisible_bool = true
    this.VendorMatchData = [];
    this.VendorMatchDataSource = new MatTableDataSource(this.VendorMatchData);
    this.count = 0;

    for (let i = 0; i < this.ExcelItems.length; i++) {
      this._POService.GetExcel_VendorReconciliationMatched(this.ExcelItems[i], this.Selectedvendor).subscribe(
        (data) => {
          // if ( this.ExcelItems.length===i) {
          if (data.length != 0) {
            this.count = this.count + 1;

            this.Exceldownloadvisible_bool = true


            this.MissmatchTable = true;
            console.log("GetExcel_VendorReconciliationMatched", data);
            data.forEach(element => {
              this.VendorMatchData.push(element);
              this.VendorMatchData_ForExcel.push(element);
            });
            if (this.count === this.length) {
              this.VendorMatchDataSource = null;
              this.VendorMatchDataSource = new MatTableDataSource(this.VendorMatchData);
              this.VendorMatchDataSource.sort = this.vendorSort;

            }
          }
          else {
            this.Exceldownloadvisible_bool = false
            this.count = this.count + 1;
            this.VendorMatchDataSource = null;
            this.VendorMatchDataSource = new MatTableDataSource(this.VendorMatchData);
            this.VendorMatchDataSource.sort = this.vendorSort;
          }
          this.IsProgressBarVisibile = false;

        },
        (err) => {
          this.IsProgressBarVisibile = false;

          console.log(err);
        }

      )
    }


  }
  All(): void {

    this.IsProgressBarVisibile = true;

    this.VendorMatchData = [];

    this.tableVisible_bool = true

    this.AllArray.forEach(element => {
      this.VendorMatchData.push(element);
      this.VendorMatchDataSource = new MatTableDataSource(this.VendorMatchData);
      this.VendorMatchDataSource.sort = this.vendorSort;

    });
    this.IsProgressBarVisibile = false;

  }
  exportAsXLSX(): void {



    if (this.VendorMatchData_ForExcel.length != 0) {
      this._excelService.exportAsExcelFile(this.VendorMatchData_ForExcel, 'Matched Data');

    }
    else {
      this.notificationSnackBarComponent.openSnackBar('Matched Record Not Found', SnackBarStatus.warning);

    }
  }


  Round_color(RoundNmae): string {

    switch (RoundNmae) {
      case "File":
        return this.file_bool === true
          ? "round_blue"
          : this.file_bool === false
            ? "round_white"
            : "round_white";

      case "Details":
        return this.details_bool === true
          ? "round_blue"
          : this.details_bool === false
            ? "round_white"
            : "round_white";
      case "Overview":
        return this.overview_bool === true
          ? "round_blue"
          : this.overview_bool === false
            ? "round_white"
            : "round_white";

      case "Submit":
        return this.submit_bool === true
          ? "round_blue"
          : this.submit_bool === false
            ? "round_white"
            : "round_white";

      default:
        return "";
    }

  }

  Icon_color(RoundNmae): string {

    switch (RoundNmae) {
      case "File":
        return this.file_bool === true
          ? "icon_color_white"
          : this.file_bool === false
            ? "icon_color_black"
            : "icon_color_black";

      case "Details":
        return this.details_bool === true
          ? "icon_color_white"
          : this.details_bool === false
            ? "icon_color_black"
            : "icon_color_black";
      case "Overview":
        return this.overview_bool === true
          ? "icon_color_white"
          : this.overview_bool === false
            ? "icon_color_black"
            : "icon_color_black";

      case "Submit":
        return this.submit_bool === true
          ? "icon_color_white"
          : this.submit_bool === false
            ? "icon_color_black"
            : "icon_color_black";

      default:
        return "";
    }

  }
  Divider_color(RoundNmae): string {

    switch (RoundNmae) {
      case "File":
        return this.file_bool === true
          ? "matDivider_blackclr"
          : this.details_bool === true
            ? "matDivider_greenclr"
            : this.overview_bool === true
              ? "matDivider_greenclr"
              : this.submit_bool === true
                ? "matDivider_greenclr"
                : "matDivider_blackclr";

      case "Details":
        return this.file_bool === true
          ? "matDivider_blackclr"
          : this.details_bool === true
            ? "matDivider_blackclr"
            : this.overview_bool === true
              ? "matDivider_greenclr"
              : this.submit_bool === true
                ? "matDivider_greenclr"
                : "matDivider_blackclr";

      case "Overview":
        return this.file_bool === true
          ? "matDivider_blackclr"
          : this.details_bool === true
            ? "matDivider_blackclr"
            : this.overview_bool === true
              ? "matDivider_blackclr"
              : this.submit_bool === true
                ? "matDivider_greenclr"
                : "matDivider_blackclr";



      default:
        return "";
    }

  }


}
