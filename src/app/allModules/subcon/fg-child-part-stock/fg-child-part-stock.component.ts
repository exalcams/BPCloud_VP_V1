import { Component, OnInit, ViewEncapsulation, ViewChild } from "@angular/core";
import { ReportService } from "app/services/report.service";
import { BPCReportFGCPS } from "app/models/ReportModel";
import { MatTableDataSource } from "@angular/material/table";
import { ChartOptions, ChartDataSets } from "chart.js";
import * as Chart from "chart.js";
import * as XLSX from "xlsx";
import { colorSets } from "@swimlane/ngx-charts/release/utils";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { AuthenticationDetails, AppUsage } from "app/models/master";
import { Guid } from "guid-typescript";
import { FormGroup, FormBuilder, FormArray } from "@angular/forms";
import {
    MatPaginator,
    MatMenuTrigger,
    MatSort,
    MatSnackBar,
    MatDialog,
} from "@angular/material";
import { Router } from "@angular/router";
import { DatePipe } from "@angular/common";
import { ExcelService } from "app/services/excel.service";
import { MasterService } from "app/services/master.service";
import { SnackBarStatus } from "app/notifications/notification-snack-bar/notification-snackbar-status-enum";
import { fuseAnimations } from "@fuse/animations";
import { ChartType } from "chart.js";
import { FuseConfigService } from "@fuse/services/config.service";
@Component({
    selector: "app-fg-child-part-stock",
    templateUrl: "./fg-child-part-stock.component.html",
    styleUrls: ["./fg-child-part-stock.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class FGChildPartStockComponent implements OnInit {
    BGClassName: any;
    fuseConfig: any;
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserName: string;
    currentUserRole: string;
    menuItems: string[];
    notificationSnackBarComponent: NotificationSnackBarComponent;
    isProgressBarVisibile: boolean;
    searchFormGroup: FormGroup;
    isDateError: boolean;
    searchText: string;
    selectValue: string;
    isExpanded: boolean;
    defaultFromDate: Date;
    defaultToDate: Date;
    data: any[];
    fgChildPartStockReportDisplayedColumns: string[] = [
        "Plant",
        "Material",
        "MaterialText",
        "StickQty",
        "UOM",
        "Batch",
        "Price",
    ];
    fgChildPartStockReportDataSource: MatTableDataSource<BPCReportFGCPS>;
    fgChildPartStockReports: BPCReportFGCPS[] = [];
    @ViewChild(MatPaginator) fgChildPartStockPaginator: MatPaginator;
    @ViewChild(MatSort) fgChildPartStockSort: MatSort;
    @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;

    // // DoughnutChart1
    // public doughnutChart1DataSets: Array<any> = [{
    //   // label: '# of Votes',
    //   data: [60, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    //   backgroundColor:
    //     ["#6dd7d3", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey",
    //       "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey",
    //       "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey",
    //       "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey"],
    //   hoverBackgroundColor: ["#6dd7d3"],
    //   // borderColor: [
    //   //   'rgba(255, 99, 132, 1)',
    //   //   'rgba(54, 162, 235, 1)',
    //   //   'rgba(255, 206, 86, 1)',
    //   //   'rgba(75, 192, 192, 1)',
    //   //   'rgba(153, 102, 255, 1)',
    //   //   'rgba(255, 159, 64, 1)'
    //   // ],
    //   borderWidth: 2
    // }, {
    //   data: [100],
    //   backgroundColor: ["white"],

    // }, {
    //   data: [90],
    //   // hoverBackgroundColor: ["#6dd7d3"],
    //   borderColor: ["#6dd7d3"],
    //   // borderWidth: 5
    // }];
    // public doughnutChart1Options: any = {
    //   responsive: true,
    //   cutoutPercentage: 50,
    //   plugins: {
    //     labels: false
    //   },
    //   tooltips: {
    //     enabled: false
    //   },
    //   legend: {
    //     display: false
    //   },
    //   animation: {
    //     animateRotate: true,
    //     animateScale: true
    //   },
    //   // scales: {
    //   //   yAxes: [{
    //   //     ticks: {
    //   //       beginAtZero: true
    //   //     }
    //   //   }]
    //   // }
    // };
    // // public doughnutChart1Colors: Array<any> = [{
    // //   backgroundColor: ['#fb9e61', '#3c9cdf']
    // // }];
    // public doughnutChart1Type: ChartType = 'doughnut';
    // public doughnutChart1Legend = false;

    // // DoughnutChart2
    // public doughnutChart2DataSets: Array<any> = [{
    //   // label: '# of Votes',
    //   data: [30, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    //   backgroundColor:
    //     ["#6dd7d3", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey",
    //       "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey",
    //       "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey",
    //       "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey", "lightgrey"],
    //   hoverBackgroundColor: ["#6dd7d3"],
    //   // borderColor: [
    //   //   'rgba(255, 99, 132, 1)',
    //   //   'rgba(54, 162, 235, 1)',
    //   //   'rgba(255, 206, 86, 1)',
    //   //   'rgba(75, 192, 192, 1)',
    //   //   'rgba(153, 102, 255, 1)',
    //   //   'rgba(255, 159, 64, 1)'
    //   // ],
    //   borderWidth: 2
    // }, {
    //   data: [100],
    //   backgroundColor: ["white"],

    // }, {
    //   data: [90],
    //   // hoverBackgroundColor: ["#6dd7d3"],
    //   borderColor: ["#6dd7d3"],
    //   // borderWidth: 5
    // }];
    // public doughnutChart2Options: any = {
    //   responsive: true,
    //   cutoutPercentage: 50,
    //   plugins: {
    //     labels: false
    //   },
    //   tooltips: {
    //     enabled: false
    //   },
    //   legend: {
    //     display: false
    //   },
    //   animation: {
    //     animateRotate: true,
    //     animateScale: true
    //   },
    //   // scales: {
    //   //   yAxes: [{
    //   //     ticks: {
    //   //       beginAtZero: true
    //   //     }
    //   //   }]
    //   // }
    // };
    // // public doughnutChart2Colors: Array<any> = [{
    // //   backgroundColor: ['#fb9e61', '#3c9cdf']
    // // }];
    // public doughnutChart2Type: ChartType = 'doughnut';
    // public doughnutChart2Legend = false;

    // Left Side Chart
    public ChartType: ChartType = "doughnut";
    public DoughnutChartData1: ChartDataSets[] = [{ data: this.randomize() }];
    public DoughnutChartOptions1: ChartOptions = {
        responsive: false,
        maintainAspectRatio: false,
        legend: {
            display: false,
        },
        tooltips: {
            enabled: false,
        },
        plugins: {
            labels: false,
        },
        showLines: false,
        cutoutPercentage: 70,
    };
    public doughnutChartColors1: Array<any> = [
        {
            backgroundColor: ["#6dd7d3"],
        },
    ];

    // Left Side Chart
    public DoughnutChartData2: ChartDataSets[] = [{ data: this.randomize() }];
    public DoughnutChartOptions2: ChartOptions = {
        responsive: false,
        maintainAspectRatio: false,
        legend: {
            display: false,
        },
        tooltips: {
            enabled: false,
        },
        plugins: {
            labels: false,
        },
        showLines: false,
        cutoutPercentage: 70,
    };
    public doughnutChartColors2: Array<any> = [
        {
            backgroundColor: ["#6dd7d3"],
        },
    ];
    constructor(
        private _fuseConfigService: FuseConfigService,

        private _reportService: ReportService,
        private formBuilder: FormBuilder,
        private _router: Router,
        public snackBar: MatSnackBar,
        private dialog: MatDialog,
        private _masterService: MasterService,
        private _datePipe: DatePipe,
        private _excelService: ExcelService
    ) {
        this.authenticationDetails = new AuthenticationDetails();
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
        this.isProgressBarVisibile = false;
        this.isDateError = false;
        this.searchText = "";
        this.selectValue = "All";
        this.isExpanded = false;
        this.defaultFromDate = new Date();
        this.defaultFromDate.setDate(this.defaultFromDate.getDate() - 30);
        this.defaultToDate = new Date();
    }

    ngOnInit(): void {
        this.SetUserPreference();

        // Retrive authorizationData
        const retrievedObject = localStorage.getItem("authorizationData");
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(
                retrievedObject
            ) as AuthenticationDetails;
            this.currentUserID = this.authenticationDetails.UserID;
            this.currentUserName = this.authenticationDetails.UserName;
            this.currentUserRole = this.authenticationDetails.UserRole;
            this.menuItems = this.authenticationDetails.MenuItemNames.split(
                ","
            );
            if (this.menuItems.indexOf("FGChildPartStock") < 0) {
                this.notificationSnackBarComponent.openSnackBar(
                    "You do not have permission to visit this page",
                    SnackBarStatus.danger
                );
                this._router.navigate(["/auth/login"]);
            }
        } else {
            this._router.navigate(["/auth/login"]);
        }
        this.CreateAppUsage();
        this.GetFGChildPartStockReports();
        // this.initializeSearchForm();
        // this.searchButtonClicked();
    }

    CreateAppUsage(): void {
        const appUsage: AppUsage = new AppUsage();
        appUsage.UserID = this.currentUserID;
        appUsage.AppName = "FGChildPartStock";
        appUsage.UsageCount = 1;
        appUsage.CreatedBy = this.currentUserName;
        appUsage.ModifiedBy = this.currentUserName;
        this._masterService.CreateAppUsage(appUsage).subscribe(
            (data) => {},
            (err) => {
                console.error(err);
            }
        );
    }

    GetFGChildPartStockReports(): void {
        this.isProgressBarVisibile = true;
        this._reportService
            .GetAllReportFGCPSByPartnerID(this.currentUserName)
            .subscribe(
                (data) => {
                    this.fgChildPartStockReports = data as BPCReportFGCPS[];
                    this.fgChildPartStockReportDataSource = new MatTableDataSource(
                        this.fgChildPartStockReports
                    );
                    this.fgChildPartStockReportDataSource.paginator = this.fgChildPartStockPaginator;
                    this.fgChildPartStockReportDataSource.sort = this.fgChildPartStockSort;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                }
            );
    }

    GetFilteredReportFGCPSByPartnerID(
        material: string,
        materialText: string
    ): void {
        this.isProgressBarVisibile = true;
        this._reportService
            .GetFilteredReportFGCPSByPartnerID(
                this.currentUserName,
                material,
                materialText
            )
            .subscribe(
                (data) => {
                    this.fgChildPartStockReports = data as BPCReportFGCPS[];
                    this.fgChildPartStockReportDataSource = new MatTableDataSource(
                        this.fgChildPartStockReports
                    );
                    this.fgChildPartStockReportDataSource.paginator = this.fgChildPartStockPaginator;
                    this.fgChildPartStockReportDataSource.sort = this.fgChildPartStockSort;
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                }
            );
    }

    // GetFGChildPartStockReportByOption(fgChildPartStockReportOption: FGChildPartStockReportOption): void {
    //   this.isProgressBarVisibile = true;
    //   this._reportService.GetFGChildPartStockReportByOption(fgChildPartStockReportOption).subscribe(
    //     (data) => {
    //       this.fgChildPartStockReports = data as BPCReportFGCPS[];
    //       this.fgChildPartStockReportDataSource = new MatTableDataSource(this.fgChildPartStockReports);
    //       this.fgChildPartStockReportDataSource.paginator = this.fgChildPartStockPaginator;
    //       this.fgChildPartStockReportDataSource.sort = this.fgChildPartStockSort;
    //       this.isProgressBarVisibile = false;
    //     },
    //     (err) => {
    //       console.error(err);
    //       this.isProgressBarVisibile = false;
    //     }
    //   );
    // }

    // GetFGChildPartStockReportByStatus(fgChildPartStockReportOption: FGChildPartStockReportOption): void {
    //   this.isProgressBarVisibile = true;
    //   this._reportService.GetFGChildPartStockReportByStatus(fgChildPartStockReportOption).subscribe(
    //     (data) => {
    //       this.fgChildPartStockReports = data as BPCReportFGCPS[];
    //       this.fgChildPartStockReportDataSource = new MatTableDataSource(this.fgChildPartStockReports);
    //       this.fgChildPartStockReportDataSource.paginator = this.fgChildPartStockPaginator;
    //       this.fgChildPartStockReportDataSource.sort = this.fgChildPartStockSort;
    //       this.isProgressBarVisibile = false;
    //     },
    //     (err) => {
    //       console.error(err);
    //       this.isProgressBarVisibile = false;
    //     }
    //   );
    // }

    // GetFGChildPartStockReportByDate(fgChildPartStockReportOption: FGChildPartStockReportOption): void {
    //   this.isProgressBarVisibile = true;
    //   this._reportService.GetFGChildPartStockReportByDate(fgChildPartStockReportOption).subscribe(
    //     (data) => {
    //       this.fgChildPartStockReports = data as BPCReportFGCPS[];
    //       this.fgChildPartStockReportDataSource = new MatTableDataSource(this.fgChildPartStockReports);
    //       this.fgChildPartStockReportDataSource.paginator = this.fgChildPartStockPaginator;
    //       this.fgChildPartStockReportDataSource.sort = this.fgChildPartStockSort;
    //       this.isProgressBarVisibile = false;
    //     },
    //     (err) => {
    //       console.error(err);
    //       this.isProgressBarVisibile = false;
    //     }
    //   );
    // }

    initializeSearchForm(): void {
        this.searchFormGroup = this.formBuilder.group({
            // PONumber: [''],
            Material: [""],
            // FromDate: [this.defaultFromDate],
            // ToDate: [this.defaultToDate]
        });
    }

    resetControl(): void {
        this.fgChildPartStockReports = [];
        this.resetFormGroup(this.searchFormGroup);
    }

    resetFormGroup(formGroup: FormGroup): void {
        formGroup.reset();
        Object.keys(formGroup.controls).forEach((key) => {
            formGroup.get(key).enable();
            formGroup.get(key).markAsUntouched();
        });
    }

    // dateSelected(): void {
    //   const FROMDATEVAL = this.searchFormGroup.get('FromDate').value as Date;
    //   const TODATEVAL = this.searchFormGroup.get('ToDate').value as Date;
    //   if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
    //     this.isDateError = true;
    //   } else {
    //     this.isDateError = false;
    //   }
    // }

    searchButtonClicked(): void {
        if (this.searchFormGroup.valid) {
            // if (!this.isDateError) {
            // const FrDate = this.searchFormGroup.get('FromDate').value;
            // let FromDate = '';
            // if (FrDate) {
            //   FromDate = this._datePipe.transform(FrDate, 'yyyy-MM-dd');
            // }
            // const TDate = this.searchFormGroup.get('ToDate').value;
            // let ToDate = '';
            // if (TDate) {
            //   ToDate = this._datePipe.transform(TDate, 'yyyy-MM-dd');
            // }
            // const poNumber = this.searchFormGroup.get('PONumber').value;
            const material = this.searchFormGroup.get("Material").value;
            const materialText = this.searchFormGroup.get("MaterialText").value;
            // const fgChildPartStockReportOption = new FGChildPartStockReportOption();
            // fgChildPartStockReportOption.Material = material;
            // fgChildPartStockReportOption.PO = poNumber;
            // fgChildPartStockReportOption.FromDate = FromDate;
            // fgChildPartStockReportOption.ToDate = ToDate;
            // fgChildPartStockReportOption.PartnerID = this.currentUserName;
            this.GetFilteredReportFGCPSByPartnerID(material, materialText);
            // }
        } else {
            this.showValidationErrors(this.searchFormGroup);
        }
    }

    showValidationErrors(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach((key) => {
            if (!formGroup.get(key).valid) {
                console.log(key);
            }
            formGroup.get(key).markAsTouched();
            formGroup.get(key).markAsDirty();
            if (formGroup.get(key) instanceof FormArray) {
                const FormArrayControls = formGroup.get(key) as FormArray;
                Object.keys(FormArrayControls.controls).forEach((key1) => {
                    if (FormArrayControls.get(key1) instanceof FormGroup) {
                        const FormGroupControls = FormArrayControls.get(
                            key1
                        ) as FormGroup;
                        Object.keys(FormGroupControls.controls).forEach(
                            (key2) => {
                                FormGroupControls.get(key2).markAsTouched();
                                FormGroupControls.get(key2).markAsDirty();
                                if (!FormGroupControls.get(key2).valid) {
                                    console.log(key2);
                                }
                            }
                        );
                    } else {
                        FormArrayControls.get(key1).markAsTouched();
                        FormArrayControls.get(key1).markAsDirty();
                    }
                });
            }
        });
    }

    exportAsXLSX(): void {
        const currentPageIndex = this.fgChildPartStockReportDataSource.paginator
            .pageIndex;
        const PageSize = this.fgChildPartStockReportDataSource.paginator
            .pageSize;
        const startIndex = currentPageIndex * PageSize;
        const endIndex = startIndex + PageSize;
        const itemsShowed = this.fgChildPartStockReports.slice(
            startIndex,
            endIndex
        );
        const itemsShowedd = [];
        itemsShowed.forEach((x) => {
            const item = {
                Plant: x.Plant,
                Material: x.Material,
                // 'Material': x.InvoiceDate ? this._datePipe.transform(x.InvoiceDate, 'dd-MM-yyyy') : '',
                // 'Posted on': x.PostedOn ? this._datePipe.transform(x.PostedOn, 'dd-MM-yyyy') : '',
                "Material Desc": x.MaterialText,
                "Stick Quantity": x.StickQty,
                UOM: x.UOM,
                Batch: x.Batch,
                Price: x.Price,
            };
            itemsShowedd.push(item);
        });
        this._excelService.exportAsExcelFile(itemsShowedd, "fgChildPartStock");
    }

    expandClicked(): void {
        this.isExpanded = !this.isExpanded;
    }

    applyFilter(event: Event): void {
        const filterValue = (event.target as HTMLInputElement).value;
        this.fgChildPartStockReportDataSource.filter = filterValue
            .trim()
            .toLowerCase();
    }

    filterClicked(): void {}

    resetFilterClicked(): void {}
    randomize(): any[] {
        this.data = [];
        this.data.push(80);
        for (let i = 81; i <= 100; i++) {
            this.data.push(1);
        }
        return this.data;
    }
    SetUserPreference(): void {
        this._fuseConfigService.config.subscribe((config) => {
            this.fuseConfig = config;
            this.BGClassName = config;
        });
        // this._fuseConfigService.config = this.fuseConfig;
    }
}
