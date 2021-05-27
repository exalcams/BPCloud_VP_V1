import {
    Component,
    OnInit,
    ViewEncapsulation,
    ViewChild,
    ElementRef,
} from "@angular/core";
import { fuseAnimations } from "@fuse/animations";
import {
    MatTableDataSource,
    MatPaginator,
    MatSort,
    MatSnackBar,
    MatMenuTrigger,
    MatDialogConfig,
    MatDialog,
} from "@angular/material";
import { SelectionModel } from "@angular/cdk/collections";
import {
    AuthenticationDetails,
    AppUsage,
    UserPreference,
} from "app/models/master";
import {
    ApexAxisChartSeries,
    ApexChart,
    ChartComponent,
    ApexDataLabels,
    ApexPlotOptions,
    ApexYAxis,
    ApexLegend,
    ApexStroke,
    ApexXAxis,
    ApexFill,
    ApexTooltip,
    ApexGrid,
    ApexTitleSubtitle,
    ApexMarkers,
    ApexResponsive,
    ApexNonAxisChartSeries,
    ApexOptions
} from "ng-apexcharts";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { FormBuilder, FormGroup } from "@angular/forms";
import { Router } from "@angular/router";
import { Guid } from "guid-typescript";
import { ChartType, Chart } from "chart.js";
import { SnackBarStatus } from "app/notifications/notification-snack-bar/notification-snackbar-status-enum";
import {
    OfStatus,
    DashboardGraphStatus,
    OTIFStatus,
    QualityStatus,
    FulfilmentStatus,
    Deliverystatus,
    OfType,
    OfOption,
    OrderFulfilmentDetails,
    FulfilmentDetails,
} from "app/models/Dashboard";
import { DatePipe } from "@angular/common";
import { ActionLog, BPCOFHeader, BPCOFHeaderView, OfAttachmentData } from "app/models/OrderFulFilment";
import { DashboardService } from "app/services/dashboard.service";
import { AttachmentViewDialogComponent } from "app/notifications/attachment-view-dialog/attachment-view-dialog.component";
import { BPCInvoiceAttachment } from "app/models/ASN";
import { MasterService } from "app/services/master.service";
import * as FileSaver from "file-saver";
import { FuseConfigService } from "@fuse/services/config.service";
import { BPCKRA } from 'app/models/fact';
import { FactService } from 'app/services/fact.service';
import { AuthService } from "app/services/auth.service";
export interface ChartOptions {
    series: ApexAxisChartSeries;
    guageseries: ApexNonAxisChartSeries;
    chart: ApexChart;
    dataLabels: ApexDataLabels;
    labels: string[];
    plotOptions: ApexPlotOptions;
    yaxis: ApexYAxis;
    xaxis: ApexXAxis;
    fill: ApexFill;
    title: ApexTitleSubtitle;
    grid: ApexGrid;
    tooltip: ApexTooltip;
    stroke: ApexStroke;
    legend: ApexLegend;
    markers: ApexMarkers;
    colors: string[];
    responsive: ApexResponsive[];
    options: ApexOptions;
}
import * as SecureLS from 'secure-ls';

@Component({
    selector: "app-order-fulfilment-center",
    templateUrl: "./order-fulfilment-center.component.html",
    styleUrls: ["./order-fulfilment-center.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class OrderFulFilmentCenterComponent implements OnInit {
    // @ViewChild("chart") chart: ChartComponent;
    public BarchartOptions: Partial<ChartOptions>;
    statusvalue = '';
    KRAData: BPCKRA[] = [];
    TableFooterShow = false;
    canvas: any;
    ctx: any;
    cx: any;
    cy: any;
    BGClassName: any;
    fuseConfig: any;
    userPreference: UserPreference;
    length: any;
    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserName: string;
    currentUserRole: string;
    partnerID: string;
    menuItems: string[];
    ActionLog: ActionLog;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    attachmentViewDialogComponent: AttachmentViewDialogComponent;
    isProgressBarVisibile: boolean;
    isDateError: boolean;
    ofDetails: BPCOFHeaderView[] = [];
    filteredOfDetails: BPCOFHeaderView[] = [];
    ofAttachments: BPCInvoiceAttachment[] = [];
    ofDetailsFormGroup: FormGroup;
    ofOption: OfOption;
    ofDetailsDisplayedColumns: string[] = [
        "DocNumber",
        // "DocVersion",
        "DocType",
        "DocDate",
        "PlantName",
        "Status",
        "Document",
        "NextProcess",
        "Action",
    ];
    ofDetailsDataSource: MatTableDataSource<BPCOFHeaderView>;
    @ViewChild(MatPaginator) ofDetailsPaginator: MatPaginator;
    @ViewChild(MatSort) ofDetailsSort: MatSort;
    @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
    selection = new SelectionModel<any>(true, []);
    Fulfilments: any[] = [];
    DeliveryStatus: any[] = [];
    ofStatusOptions: OfStatus[] = [
        { Value: "All", Name: "All" },
        { Value: "DueForACK", Name: "Due for ACK" },
        { Value: "DueForASN", Name: "Due for ASN" },
        { Value: "PartialASN", Name: "Partial ASN" },
        { Value: "DueForGate", Name: "Due for Gate" },
        { Value: "DueForGRN", Name: "Due for GRN" },
        { Value: "PartialGRN", Name: "Partial GRN" },
    ];
    ofTypeOptions: OfType[] = [
        { Value: "All", Name: "All" },
        { Value: "MAT", Name: "Material" },
        { Value: "SER", Name: "Service" },
        { Value: "AST", Name: "Asset" },
    ];
    searchText = "";
    FilterVal = "All";
    ActionModel = "Acknowledge";
    DashboardGraphStatus: DashboardGraphStatus = new DashboardGraphStatus();
    OTIFStatus: OTIFStatus = new OTIFStatus();
    QualityStatus: QualityStatus = new QualityStatus();
    fulfilmentStatus: FulfilmentStatus = new FulfilmentStatus();
    dashboardDeliverystatus: Deliverystatus = new Deliverystatus();
    selectedPoDetails: BPCOFHeader = new BPCOFHeader();

    // Circular Progress bar
    radius = 60;
    circumference = 2 * Math.PI * this.radius;
    dashoffset1: number;
    dashoffset2: number;
    progressPercentage1 = 0;
    progressPercentage2 = 0;
    nextProcess: string;

    // Doughnut Chart
    public doughnutChartOptions = {
        responsive: true,
        centertext: "9",
        maintainAspectRatio: false,
        title: {
            display: true,
            position: {
                "margin-top": "40px",
            },
            text: 'Upcoming Meetings',
            style: {
                "margin-top": "40px",
            }
        },
        legend: {
            position: "left",
            labels: {
                fontSize: 10,
                padding: 20,
                usePointStyle: true,
                centertext: "123",
            },
            centertext: "123",
        },
        cutoutPercentage: 80,
        elements: {
            arc: {
                borderWidth: 0,
            },
            centertext: "123",
        },
        plugins: {
            labels: {
                // tslint:disable-next-line:typedef
                render: function (args) {
                    // return args.value + "%";
                    return args.value;
                },
                fontColor: "#000",
                position: "outside",
                centertext: "123"
            },
        },
    };
    public doughnutChartType: ChartType = "doughnut";
    // public doughnutChartLabels: any[] = [
    //     "Due for ACK",
    //     "Due for ASN",
    //     "Due for Gate",
    //     "Due for GRN",
    // ];
    // public doughnutChartData: any[] = [
    //     [40, 20, 30, 10]
    // ];
    public doughnutChartLabels: any[] = [];
    public doughnutChartData: any[] = [];
    public colors: any[] = [
        { backgroundColor: ["#fb863a", "#40a8e2", "#485865", "#40ed9a"] },
    ];

    // Bar chart
    public barChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            position: "top",
            align: "end",
            labels: {
                fontSize: 10,
                usePointStyle: true,
            },
        },
        // // We use these empty structures as placeholders for dynamic theming.
        scales: {
            xAxes: [
                {
                    barPercentage: 1.3,
                    categoryPercentage: -0.5,
                },
            ],
            yAxes: [
                {
                    ticks: {
                        stepSize: 25,
                        beginAtZero: true,
                    },
                },
            ],
        },
        plugins: {
            labels: {
                // tslint:disable-next-line:typedef
                render: function (args) {
                    // return args.value + "%";
                    return args.value;
                },
                fontColor: "#000",
                position: "outside",
            },
        },
        // plugins: [{
        //     // tslint:disable-next-line:typedef
        //     beforeInit: function (chart, options) {
        //         // tslint:disable-next-line:typedef
        //         chart.legend.afterFit = function () {
        //             this.height += 100; // must use `function` and not => because of `this`
        //         };
        //     }
        // }]
    };
    @ViewChild("barCanvas") barCanvas: ElementRef;
    // public barChartLabels: any[] = ['17/02/20', '18/02/20', '19/02/20', '20/02/20', '21/02/20'];
    // barChartLabels: any[] = [];
    date1 = new Date();
    date2 = new Date();
    date3 = new Date();
    date4 = new Date();
    date5 = new Date();

    public barChartType: ChartType = "bar";
    public barChartLegend = true;
    // public barChartLabels: any[] = [];
    public barChartLabels = [];

    // barChartData: any[] = [
    //     { data: [65, 59, 80, 81, 56, 55, 40], label: "Actual" },
    //     { data: [28, 48, 40, 19, 86, 27, 90], label: "Planned" },
    // ];
    // [
    //     {
    //       name: "Net Profit",
    //       data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
    //     },
    //     {
    //       name: "Revenue",
    //       data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
    //     }
    public barChartData: any[] = [
        { data: [], name: "Actual" },
        { data: [], name: "Planned" },
    ];

    public barColors: any[] = [
        { backgroundColor: "#40a8e2" },
        { backgroundColor: "#fb863a" },
    ];
    SecretKey: string;
    SecureStorage: SecureLS;
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        public snackBar: MatSnackBar,
        public _dashboardService: DashboardService,
        public _authService: AuthService,
        private _masterService: MasterService,
        private _factService: FactService,
        private datePipe: DatePipe,
        private dialog: MatDialog,
        
    ) {
        this.SecretKey = this._authService.SecretKey;
        this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
        this.authenticationDetails = new AuthenticationDetails();
        this.isProgressBarVisibile = false;
        this.date1.setDate(this.date1.getDate());
        this.date2.setDate(this.date2.getDate() - 1);
        this.date3.setDate(this.date3.getDate() - 2);
        this.date4.setDate(this.date2.getDate() - 2);
        this.date5.setDate(this.date2.getDate() - 3);
        const dat1 = this.datePipe.transform(this.date1, "dd/MM/yyyy");
        const dat2 = this.datePipe.transform(this.date2, "dd/MM/yyyy");
        const dat3 = this.datePipe.transform(this.date3, "dd/MM/yyyy");
        const dat4 = this.datePipe.transform(this.date4, "dd/MM/yyyy");
        const dat5 = this.datePipe.transform(this.date5, "dd/MM/yyyy");
        // this.barChartLabels = [dat1, dat2, dat3, dat4, dat5];
        // this.Fulfilments = [
        //     {
        //         name: "Open",
        //         value: 40,
        //         label: "40%",
        //     },
        //     {
        //         name: "Scheduled",
        //         value: 20,
        //         label: "20%",
        //     },
        //     {
        //         name: "In Progress",
        //         value: 30,
        //         label: "30%",
        //     },
        //     {
        //         name: "Pending",
        //         value: 10,
        //         label: "10%",
        //     },
        // ];
        // this.DeliveryStatus = [
        //     {
        //         name: "17/02/20",
        //         series: [
        //             {
        //                 name: "Planned",
        //                 value: 88,
        //             },
        //             {
        //                 name: "Actual",
        //                 value: 70,
        //             },
        //         ],
        //     },

        //     {
        //         name: "18/02/20",
        //         series: [
        //             {
        //                 name: "Planned",
        //                 value: 60,
        //             },
        //             {
        //                 name: "Actual",
        //                 value: 88,
        //             },
        //         ],
        //     },
        //     {
        //         name: "19/02/20",
        //         series: [
        //             {
        //                 name: "Planned",
        //                 value: 40,
        //             },
        //             {
        //                 name: "Actual",
        //                 value: 88,
        //             },
        //         ],
        //     },
        // ];
    }

    ngOnInit(): void {
        this.SetUserPreference();

        // Retrive authorizationData
        const retrievedObject = this.SecureStorage.get("authorizationData");
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(
                retrievedObject
            ) as AuthenticationDetails;
            this.currentUserID = this.authenticationDetails.UserID;
            this.partnerID = this.authenticationDetails.UserName;
            this.currentUserName = this.authenticationDetails.UserName;
            this.currentUserRole = this.authenticationDetails.UserRole;
            this.menuItems = this.authenticationDetails.MenuItemNames.split(
                ","
            );
            // console.log(this.authenticationDetails);
            if (this.menuItems.indexOf("OrderFulFilmentCenter") < 0) {
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
        this.initialiseOfDetailsFormGroup();
        this.GetOfDetails();
        // this.GetOfGraphDetailsByPartnerID();
        this.GetVendorKRAProcessCircle();
        this.GetVendorPPMProcessCircle();
        this.GetVendorDoughnutChartData();
        // this.GetOfStatusByPartnerID();
        // this.GetKRAByPartnerID();
        this.SetTextInsideDountChart();
        // this._factService.GetKRAsByPartnerID("Visu").subscribe(
        //     (data) => {
        //         this.KRAData = <BPCKRA[]>data;
        //         if (this.KRAData.length > 0) {
        //             this._factService.CreateKRAs(this.KRAData, "100744").subscribe(
        //                 (data2) => {
        //                     console.log(data2);
        //                 },
        //                 (err) => {
        //                     console.log("CreateKRAs", err);
        //                 }
        //             );
        //         }
        //     }
        // );
        // this.GetOfAttachmentsByPartnerID();
    }

    CreateAppUsage(): void {
        const appUsage: AppUsage = new AppUsage();
        appUsage.UserID = this.currentUserID;
        appUsage.AppName = "Order fulfillment Center";
        appUsage.UsageCount = 1;
        appUsage.CreatedBy = this.currentUserName;
        appUsage.ModifiedBy = this.currentUserName;
        this._masterService.CreateAppUsage(appUsage).subscribe(
            (data) => { },
            (err) => {
                console.error(err);
            }
        );
    }

    GetOfDetails(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService.GetOfsByPartnerID(this.partnerID).subscribe(
            (data) => {
                if (data) {
                    this.length = data.length;
                    this.ofDetails = <BPCOFHeaderView[]>data;

                    this.ofDetailsDataSource = new MatTableDataSource(this.ofDetails);

                    this.ofDetailsDataSource.paginator = this.ofDetailsPaginator;
                    this.ofDetailsDataSource.sort = this.ofDetailsSort;
                }
                this.isProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
            }
        );
    }
    // GetKRAByPartnerID(): void {
    //     this.isProgressBarVisibile = true;
    //     this._factService.GetKRAsByPartnerID(this.authenticationDetails.UserName).subscribe(
    //         (data) => {
    //             this.KRAData = <BPCKRA[]>data;
    //             console.log(this.KRAData);
    //             let previous = "";
    //             this.KRAData.forEach(KRA => {
    //                 // console.log(KRA.KRAText.slice(2, 8));
    //                 if (previous !== KRA.KRAText.slice(0, 1) && KRA.KRAText.slice(2, 8) === "Actual") {
    //                     this.barChartLabels.push(this.datePipe.transform(KRA.EvalDate, "dd/MM/yyyy"));
    //                     this.barChartData[0].data.push(KRA.KRAValue);
    //                     previous = KRA.KRAText.slice(0, 1);
    //                     console.log("IF", KRA.KRAText);
    //                 }
    //                 else if (KRA.KRAText.slice(2, 8) === "Planed") {
    //                     // console.log("Else", previous);
    //                     this.barChartData[1].data.push(KRA.KRAValue);
    //                     console.log("ELse", KRA.KRAText);
    //                 }

    //             });
    //             console.log("barChartData", this.barChartData);
    //             console.log("barChartLabels", this.barChartLabels);
    //             // this.LoadBarChart();
    //             this.isProgressBarVisibile = false;
    //         },
    //         (err) => {
    //             this.isProgressBarVisibile = false;
    //         }
    //     );
    // }
    // LoadBarChart(): void {
    //     this.BarchartOptions = {
    //         series: this.barChartData,
    //         chart: {
    //             type: "bar",
    //             height: 150,
    //             animations: {
    //                 enabled: false,
    //             },
    //             redrawOnParentResize: true,

    //         },
    //         colors: ['#40a8e2', '#fb863a'],

    //         plotOptions: {
    //             bar: {
    //                 horizontal: false,
    //                 rangeBarOverlap: true,
    //                 columnWidth: "45%",
    //                 endingShape: "flat"
    //             }
    //         },
    //         dataLabels: {
    //             enabled: false
    //         },
    //         legend: {
    //             position: 'top',
    //             horizontalAlign: 'right',
    //         },
    //         stroke: {
    //             show: true,
    //             width: 2,
    //             colors: ["transparent"]
    //         },
    //         xaxis: {
    //             categories: this.barChartLabels
    //         },
    //         yaxis: {
    //             title: {
    //             }
    //         },
    //         fill: {
    //             opacity: 1
    //         },
    //         tooltip: {
    //             enabled: true,
    //             // y: {
    //             //     formatter: function (val) {
    //             //         return  val;
    //             //     }
    //             // }
    //         }
    //     };
    //     this.isProgressBarVisibile = false;
    // }
    ResetClicked(text): void {
        this.GetOfDetails();
        this.CreateActionLogvalues(text);
        this.initialiseOfDetailsFormGroup();
        this.TableFooterShow = false;
    }
    SetTextInsideDountChart(): any {


        this.canvas = document.getElementById("myChart");
        this.ctx = this.canvas.getContext("2d");
        // this.ctx.fillText
        this.cx = this.canvas.width / 2;
        this.cy = this.canvas.height / 2;
        this.ctx.textAlign = 'center';
        return {
            "margin-left": "23px",
            "margin-top": "20px",
            "position": "absolute"
        };
        // vertically align text around the specified point (cy)

    }
    GetOfsByOption(ofOption: OfOption, buttonText = null): void {
        this.isProgressBarVisibile = true;
        this._dashboardService.GetOfsByOption(ofOption).subscribe(
            (data) => {
                if (data) {
                    this.ofDetails = <BPCOFHeaderView[]>data;
                    this.ofDetailsDataSource = new MatTableDataSource(
                        this.ofDetails
                    );
                    if (this.ofDetails.length === 0) {
                        this.TableFooterShow = true;
                    }
                    else {
                        this.TableFooterShow = false;
                    }
                    this.ofDetailsDataSource.paginator = this.ofDetailsPaginator;
                    this.ofDetailsDataSource.sort = this.ofDetailsSort;
                    this.statusvalue = ofOption.DocType;
                }
                this.isProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
                this.notificationSnackBarComponent.openSnackBar(
                    err instanceof Object ? "Something went wrong" : err,
                    SnackBarStatus.danger
                );
            }
        );
        if (buttonText != null) {
            this.CreateActionLogvalues(buttonText);
        }
        this.clearOfDetailsFormGroup();
    }

    // ResetClicked(): void {
    //     this.GetOfDetails();
    // }
    CreateActionLogvalues(text): void {
        this.ActionLog = new ActionLog();
        this.ActionLog.UserID = this.currentUserID;
        this.ActionLog.AppName = "OrderFulfilmentCenter";
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
    GetOfStatusByPartnerID(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService.GetOfStatusByPartnerID(this.partnerID).subscribe(
            (data) => {
                if (data) {
                    this.fulfilmentStatus = <FulfilmentStatus>data;
                    let OpenDetails;
                    let ScheduledDetails;
                    let InProgressDetails;
                    let PendingDetails;
                    if (this.fulfilmentStatus) {
                        if (this.fulfilmentStatus.OpenDetails.Value !== null) {
                            OpenDetails = this.fulfilmentStatus.OpenDetails.Value;
                        }
                        else {
                            OpenDetails = 0;
                        }
                        if (this.fulfilmentStatus.ScheduledDetails.Value !== null) {
                            ScheduledDetails = this.fulfilmentStatus.ScheduledDetails.Value;
                        }
                        else {
                            ScheduledDetails = 0;
                        }
                        if (this.fulfilmentStatus.InProgressDetails.Value !== null) {
                            InProgressDetails = this.fulfilmentStatus.InProgressDetails.Value;
                        }
                        else {
                            InProgressDetails = 0;
                        }
                        if (this.fulfilmentStatus.PendingDetails.Value !== null) {
                            PendingDetails = this.fulfilmentStatus.PendingDetails.Value;
                        }
                        else {
                            PendingDetails = 0;
                        }
                        this.doughnutChartData = [
                            OpenDetails,
                            ScheduledDetails,
                            InProgressDetails,
                            PendingDetails,
                        ];
                    }
                }
                this.isProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.isProgressBarVisibile = false;
            }
        );
    }
    GetVendorKRAProcessCircle(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetVendorKRAProcessCircle(this.partnerID)
            .subscribe(
                (data) => {
                    if (data) {
                        const KRAProcessCircle = data as BPCKRA;
                        if (KRAProcessCircle && KRAProcessCircle.KRAValue) {
                            this.progress1(+KRAProcessCircle.KRAValue);
                        }
                    }
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                }
            );
    }
    GetVendorPPMProcessCircle(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetVendorPPMProcessCircle(this.partnerID)
            .subscribe(
                (data) => {
                    if (data) {
                        const PPMProcessCircle = data as BPCKRA;
                        if (PPMProcessCircle && PPMProcessCircle.KRAValue) {
                            this.progress2(+PPMProcessCircle.KRAValue);
                        }
                    }
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                }
            );
    }

    GetVendorDoughnutChartData(): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetVendorDoughnutChartData(this.partnerID)
            .subscribe(
                (data) => {
                    if (data) {
                        const fulfilmentDetails = data as FulfilmentDetails[];
                        this.doughnutChartLabels = fulfilmentDetails.map(
                            (x) => x.label
                        );
                        this.doughnutChartData = fulfilmentDetails.map(
                            (x) => +x.Value
                        );
                    }
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                }
            );
    }

    // GetOfGraphDetailsByPartnerID(): void {
    //     this.isProgressBarVisibile = true;
    //     this._dashboardService
    //         .GetOfGraphDetailsByPartnerID(this.partnerID)
    //         .subscribe(
    //             (data) => {
    //                 if (data) {
    //                     this.DashboardGraphStatus = <DashboardGraphStatus>data;
    //                     this.dashboardDeliverystatus = this.DashboardGraphStatus.deliverystatus;
    //                     this.OTIFStatus = this.DashboardGraphStatus.oTIFStatus;
    //                     this.QualityStatus = this.DashboardGraphStatus.qualityStatus;
    //                     this.fulfilmentStatus = this.DashboardGraphStatus.fulfilmentStatus;
    //                     const OTIF = Number(this.OTIFStatus.OTIF);
    //                     this.progress1(OTIF);
    //                     const Quality = Number(this.QualityStatus.Quality);
    //                     this.progress2(Quality);
    //                     // this.doughnutChartData = [this.fulfilmentStatus.OpenDetails.Value, this.fulfilmentStatus.ScheduledDetails.Value,
    //                     // this.fulfilmentStatus.InProgressDetails.Value, this.fulfilmentStatus.PendingDetails.Value];
    //                     // this.dashboardDeliverystatus.Planned1.Date = this.dashboardDeliverystatus.Planned1.Date
    //                     const Planned1Date = this.datePipe.transform(
    //                         this.dashboardDeliverystatus.Planned1.Date,
    //                         "dd/MM/yyyy"
    //                     );
    //                     const Planned2Date = this.datePipe.transform(
    //                         this.dashboardDeliverystatus.Planned2.Date,
    //                         "dd/MM/yyyy"
    //                     );
    //                     const Planned3Date = this.datePipe.transform(
    //                         this.dashboardDeliverystatus.Planned3.Date,
    //                         "dd/MM/yyyy"
    //                     );
    //                     const Planned4Date = this.datePipe.transform(
    //                         this.dashboardDeliverystatus.Planned4.Date,
    //                         "dd/MM/yyyy"
    //                     );
    //                     const Planned5Date = this.datePipe.transform(
    //                         this.dashboardDeliverystatus.Planned4.Date,
    //                         "dd/MM/yyyy"
    //                     );

    //                     // this.barChartLabels = [Planned1Date, Planned2Date, Planned3Date, Planned4Date, Planned5Date];
    //                     this.barChartData = [
    //                         {
    //                             data: [
    //                                 this.dashboardDeliverystatus.Planned1
    //                                     .Actual,
    //                                 this.dashboardDeliverystatus.Planned2
    //                                     .Actual,
    //                                 this.dashboardDeliverystatus.Planned3
    //                                     .Actual,
    //                                 this.dashboardDeliverystatus.Planned4
    //                                     .Actual,
    //                                 this.dashboardDeliverystatus.Planned5
    //                                     .Actual,
    //                             ],
    //                             label: "Actual",
    //                         },
    //                         {
    //                             data: [
    //                                 this.dashboardDeliverystatus.Planned1
    //                                     .Planned,
    //                                 this.dashboardDeliverystatus.Planned2
    //                                     .Planned,
    //                                 this.dashboardDeliverystatus.Planned3
    //                                     .Planned,
    //                                 this.dashboardDeliverystatus.Planned4
    //                                     .Planned,
    //                                 this.dashboardDeliverystatus.Planned5
    //                                     .Planned,
    //                             ],
    //                             label: "Planned",
    //                         },
    //                     ];
    //                     console.log(this.barChartData);
    //                     console.log(this.barChartLabels);
    //                     console.log(this.DashboardGraphStatus);
    //                 }
    //                 this.isProgressBarVisibile = false;
    //             },
    //             (err) => {
    //                 console.error(err);
    //                 this.isProgressBarVisibile = false;
    //             }
    //         );
    // }

    initialiseOfDetailsFormGroup(): void {
        this.ofDetailsFormGroup = this._formBuilder.group({
            DocNumber: [""],
            FromDate: [""],
            ToDate: [""],
            Status: [""],
            DocType: [""],
        });
    }

    clearOfDetailsFormGroup(): void {
        Object.keys(this.ofDetailsFormGroup.controls).forEach((key) => {
            this.ofDetailsFormGroup.get(key).markAsTouched();
            this.ofDetailsFormGroup.get(key).markAsDirty();
        });
    }

    getOfDetailsFormValues(): void { }

    getOfsByOptionClicked(buttonText: string): void {
        if (this.ofDetailsFormGroup.valid) {
            if (!this.isDateError) {
                this.ofOption = new OfOption();
                this.ofOption.DocNumber = this.ofDetailsFormGroup.get("DocNumber").value;
                this.ofOption.FromDate = this.datePipe.transform(
                    this.ofDetailsFormGroup.get("FromDate").value as Date,
                    "yyyy-MM-dd"
                );
                this.ofOption.ToDate = this.datePipe.transform(
                    this.ofDetailsFormGroup.get("ToDate").value as Date,
                    "yyyy-MM-dd"
                );
                this.ofOption.Status = this.ofDetailsFormGroup.get(
                    "Status"
                ).value;
                this.ofOption.DocType = this.ofDetailsFormGroup.get(
                    "DocType"
                ).value;

                this.ofOption.PartnerID = this.partnerID;
                this.GetOfsByOption(this.ofOption, buttonText);
            }
        }
        // this.initialiseOfDetailsFormGroup();
    }

    doughnutChartClicked(e: any): void {
        console.log(e);
        if (e.active.length > 0) {
            const chart = e.active[0]._chart;
            const activePoints = chart.getElementAtEvent(e.event);
            if (activePoints.length > 0) {
                // get the internal index of slice in pie chart
                const clickedElementIndex = activePoints[0]._index;
                const label = chart.data.labels[clickedElementIndex];
                // get value by index
                const value = chart.data.datasets[0].data[clickedElementIndex];
                console.log(clickedElementIndex, label, value);
                if (label !== null) {
                    var string = "Chart " + label;
                    this.CreateActionLogvalues(string);
                    this.loadOfDetailsByOfStatusChartLabel(label);
                }
            }
        }
    }

    loadOfDetailsByOfStatusChartLabel(label: any): void {
        if (label === "Due For ACK") {
            // this.filteredOfDetails = this.ofDetails.filter(x => x.Status === 'DueForACK');
            this.ofDetailsDataSource = null;
            this.ofOption = new OfOption();
            this.ofOption.Status = "DueForACK";
            this.statusvalue = "DueForACK";
            this.ofOption.PartnerID = this.partnerID;
            this.GetOfsByOption(this.ofOption);
        } else if (label === "Due For ASN") {
            this.ofDetailsDataSource = null;
            this.ofOption = new OfOption();
            this.ofOption.Status = "DueForASN";
            this.statusvalue = "DueForASN";

            this.ofOption.PartnerID = this.partnerID;
            this.GetOfsByOption(this.ofOption);
        } else if (label === "Partial ASN") {
            this.ofDetailsDataSource = null;
            this.ofOption = new OfOption();
            this.ofOption.Status = "Partial ASN";
            // this.statusvalue = "Partial ASN";

            this.ofOption.PartnerID = this.partnerID;
            this.GetOfsByOption(this.ofOption);
        } else if (label === "Due For Gate") {
            this.ofDetailsDataSource = null;
            this.ofOption = new OfOption();
            this.ofOption.Status = "DueForGate";
            this.statusvalue = "DueForGate";

            this.ofOption.PartnerID = this.partnerID;
            this.GetOfsByOption(this.ofOption);
        } else if (label === "Due For GRN") {
            this.ofDetailsDataSource = null;
            this.ofOption = new OfOption();
            this.ofOption.Status = "DueForGRN";
            this.ofOption.PartnerID = this.partnerID;
            this.GetOfsByOption(this.ofOption);
        }
        else if (label === "Partial GRN") {
            this.ofDetailsDataSource = null;
            this.ofOption = new OfOption();
            this.ofOption.Status = "PartialGRN";
            this.ofOption.PartnerID = this.partnerID;
            this.GetOfsByOption(this.ofOption);
        }
    }

    openMyMenu(index: any): void {
        alert(index);
        this.matMenuTrigger.openMenu();
    }

    closeMyMenu(index: any): void {
        alert(index);
        this.matMenuTrigger.closeMenu();
    }

    fromAndToDateChanged(): void {
        const FROMDATEVAL = this.ofDetailsFormGroup.get("FromDate")
            .value as Date;
        const TODATEVAL = this.ofDetailsFormGroup.get("ToDate").value as Date;
        if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
            this.isDateError = true;
        } else {
            this.isDateError = false;
        }
    }

    goToPOFactSheetClicked(po: string): void {
        this.CreateActionLogvalues("PO Fact Sheet");
        this._router.navigate(["/pages/polookup"], { queryParams: { id: po } });
    }

    acknowledgementClicked(po: string, text): void {
        this.CreateActionLogvalues(text);
        this._router.navigate(["/pages/polookup"], { queryParams: { id: po } });
    }

    goToPOFlipClicked(po: string): void {
        this._router.navigate(["/poflip"], { queryParams: { id: po } });
    }

    goToSupportDeskClicked(po: string): void {
        this.CreateActionLogvalues("Support Desk");
        this._router.navigate(["/support/supportticket"], {
            queryParams: { id: po, navigator_page: 'PO' },
        });
    }

    goToASNClicked(po: string, type: string): void {
        this.CreateActionLogvalues("ASN");
        this._router.navigate(["/asn"], { queryParams: { id: po, type: type } });
    }

    goToSubconClicked(po: string): void {
        this._router.navigate(['/subcon/productionlog'], { queryParams: { id: po } });
        // this._router.navigate(["/subcon"], { queryParams: { id: po } });
    }

    goToPrintPOClicked(po: string): void {
        this.isProgressBarVisibile = true;
        this.CreateActionLogvalues("Print PO");
        this._dashboardService.PrintPO(po).subscribe(
            (data) => {
                if (data) {
                    const fileType = "application/pdf";
                    const blob = new Blob([data], { type: fileType });
                    const currentDateTime = this.datePipe.transform(
                        new Date(),
                        "ddMMyyyyHHmmss"
                    );
                    FileSaver.saveAs(blob, po + "_" + currentDateTime + ".pdf");
                }
                this.isProgressBarVisibile = false;
            },
            (error) => {
                console.error(error);
                this.isProgressBarVisibile = false;
            }
        );
    }

    nextProcessClicked(nextProcess: string, po: string): void {
        this.CreateActionLogvalues("Next Process Clicked");
        if (nextProcess === "ACK") {
            this._router.navigate(["/pages/polookup"], {
                queryParams: { id: po },
            });
        } else if (nextProcess === "ASN/SCN") {
            this._router.navigate(["/asn"], { queryParams: { id: po } });
        }
    }

    onMouseMove(event): void {
        console.log(event); // true false
        // if true then the mouse is on control and false when you leave the mouse
    }

    progress1(value: number): void {
        // alert(value);
        const progress = value / 100;
        this.progressPercentage1 = Math.round(progress * 100);
        this.dashoffset1 = this.circumference * progress;
        // console.log(this.progressPercentage1);
    }

    progress2(value: number): void {
        // alert(value);
        const progress = value / 100;
        this.progressPercentage2 = Math.round(progress * 100);
        this.dashoffset2 = this.circumference * progress;
        // console.log(this.progressPercentage2);
    }

    formatSubtitle = (): string => {
        return "Effiency";
    }

    pieChartLabel(Fulfilments: any[], name: string): string {
        const item = Fulfilments.filter((data) => data.name === name);
        if (item.length > 0) {
            return item[0].label;
        }
        return name;
    }

    getStatusColor(element: BPCOFHeader, StatusFor: string): string {
        switch (StatusFor) {
            case "ASN":
                return element.Status === "DueForACK"
                    ? "gray"
                    : element.Status === "DueForASN"
                        ? "gray"
                        : element.Status === "PartialASN"
                            ? "#efb577" : "#34ad65";
            case "Gate":
                return element.Status === "DueForACK"
                    ? "gray"
                    : element.Status === "DueForASN"
                        ? "gray"
                        : element.Status === "PartialASN"
                            ? "gray"
                            : element.Status === "DueForGate"
                                ? "gray"
                                : "#34ad65";
            case "GRN":
                return element.Status === "DueForACK"
                    ? "gray"
                    : element.Status === "DueForASN"
                        ? "gray"
                        : element.Status === "PartialASN"
                            ? "gray"
                            : element.Status === "DueForGate"
                                ? "gray"
                                : element.Status === "DueForGRN"
                                    ? "gray"
                                    : element.Status === "PartialGRN"
                                        ? "#efb577"
                                        : "#34ad65";
            default:
                return "";
        }
    }

    getGateStatusColor(element: BPCOFHeaderView): string {
        return element.GateStatus === "DueForGate"
            ? "gray" : element.GateStatus === "PartialGate"
                ? "#efb577" : "#34ad65";
    }
    getGRNStatusColor(element: BPCOFHeaderView): string {
        return element.GRNStatus === "DueForGRN"
            ? "gray" : element.GRNStatus === "PartialGRN"
                ? "#efb577" : "#34ad65";
    }

    getNextProcess(element: any): void {
        if (element.Status === "DueForACK") {
            element.NextProcess = "ACK";
        } else if (element.Status === "DueForASN") {
            element.NextProcess = "ASN/SCN";
        } else if (element.Status === "PartialASN") {
            element.NextProcess = "ASN/SCN";
        }
        else if (element.Status === "DueForGate") {
            element.NextProcess = "Gate";
        } else if (element.Status === "PartialGRN") {
            element.NextProcess = "GRN";
        }
        else {
            element.NextProcess = "GRN";
        }
    }

    getTimeline(element: BPCOFHeaderView, StatusFor: string): string {
        switch (StatusFor) {
            case "ASN":
                return element.Status === "DueForACK"
                    ? "white-timeline"
                    : element.Status === "DueForASN"
                        ? "white-timeline"
                        : element.Status === "PartialASN"
                            ? "orange-timeline" : "green-timeline";
            case "Gate":
                return element.Status === "DueForACK"
                    ? "white-timeline"
                    : element.Status === "DueForASN"
                        ? "white-timeline"
                        : element.Status === "PartialASN"
                            ? "white-timeline"
                            : element.Status === "DueForGate"
                                ? "white-timeline"
                                : "green-timeline";
            case "GRN":
                return element.Status === "DueForACK"
                    ? "white-timeline"
                    : element.Status === "DueForASN"
                        ? "white-timeline"
                        : element.Status === "PartialASN"
                            ? "white-timeline"
                            : element.Status === "DueForGate"
                                ? "white-timeline"
                                : element.Status === "DueForGRN"
                                    ? "white-timeline"
                                    : element.Status === "PartialGRN"
                                        ? "orange-timeline"
                                        : "green-timeline";
            default:
                return "";
        }
    }
    getGateTimeline(element: BPCOFHeaderView): string {
        return element.GateStatus === "DueForGate"
            ? "white-timeline" : element.GateStatus === "PartialGate"
                ? "orange-timeline" : "green-timeline";
    }
    getGRNTimeline(element: BPCOFHeaderView): string {
        return element.GRNStatus === "DueForGRN"
            ? "white-timeline" : element.GRNStatus === "PartialGRN"
                ? "orange-timeline" : "green-timeline";
    }
    getRestTimeline(element: BPCOFHeaderView, StatusFor: string): string {
        switch (StatusFor) {
            case "ASN":
                return element.Status === "DueForACK"
                    ? "white-timeline"
                    : element.Status === "DueForASN"
                        ? "white-timeline"
                        : element.Status === "PartialASN"
                            ? element.GateStatus === 'PartialGate' ? "orange-timeline" : "white-timeline"
                            : element.Status === "DueForGate"
                                ? "white-timeline"
                                : "green-timeline";
            case "Gate":
                return element.Status === "DueForACK"
                    ? "white-timeline"
                    : element.Status === "DueForASN"
                        ? "white-timeline"
                        : element.Status === "PartialASN"
                            ? "white-timeline"
                            : element.Status === "DueForGate"
                                ? "white-timeline"
                                : element.Status === "DueForGRN"
                                    ? "white-timeline"
                                    : "green-timeline";
            case "GRN":
                return element.Status === "DueForACK"
                    ? "white-timeline"
                    : element.Status === "DueForASN"
                        ? "white-timeline"
                        : element.Status === "PartialASN"
                            ? "white-timeline"
                            : element.Status === "DueForGate"
                                ? "white-timeline"
                                : element.Status === "DueForGRN"
                                    ? "white-timeline"
                                    : element.Status === "PartialGRN"
                                        ? "white-timeline"
                                        : "green-timeline";
            default:
                return "";
        }
    }
    getGateRestTimeline(element: BPCOFHeaderView): string {
        return element.GateStatus === "DueForGate"
            ? "white-timeline" : element.GateStatus === "PartialGate"
                ? element.GRNStatus === 'PartialGRN' ? "orange-timeline" : 'white-timeline' : "green-timeline";
    }
    getGRNRestTimeline(element: BPCOFHeaderView): string {
        return element.GRNStatus === "DueForGRN"
            ? "white-timeline" : element.GRNStatus === "PartialGRN"
                ? "orange-timeline" : "green-timeline";
    }

    viewOfAttachmentClicked(element: BPCOFHeaderView): void {
        this.CreateActionLogvalues("view Attachment Clicked");
        // const attachments = this.ofAttachments.filter(x => x.AttachmentID.toString() === element.RefDoc);
        this.GetOfAttachmentsByPartnerIDAndDocNumber(element);
    }
    GetOfAttachmentsByPartnerIDAndDocNumber(element: BPCOFHeaderView): void {
        this.isProgressBarVisibile = true;
        this._dashboardService
            .GetOfAttachmentsByPartnerIDAndDocNumber(
                this.authenticationDetails.UserName,
                element.DocNumber
            )
            .subscribe(
                (data) => {
                    if (data) {
                        this.ofAttachments = data as BPCInvoiceAttachment[];
                        console.log(this.ofAttachments);
                        const ofAttachmentData = new OfAttachmentData();
                        ofAttachmentData.Client = element.Client;
                        ofAttachmentData.Company = element.Company;
                        ofAttachmentData.Type = element.Type;
                        ofAttachmentData.PatnerID = element.PatnerID;
                        ofAttachmentData.DocNumber = element.DocNumber;
                        ofAttachmentData.OfAttachments = this.ofAttachments;
                        this.openAttachmentViewDialog(ofAttachmentData);
                    }
                    this.isProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.isProgressBarVisibile = false;
                }
            );
    }
    openAttachmentViewDialog(ofAttachmentData: OfAttachmentData): void {
        const dialogConfig: MatDialogConfig = {
            data: ofAttachmentData,
            panelClass: "attachment-view-dialog",
        };
        const dialogRef = this.dialog.open(
            AttachmentViewDialogComponent,
            dialogConfig
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.GetOfDetails();
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
}
