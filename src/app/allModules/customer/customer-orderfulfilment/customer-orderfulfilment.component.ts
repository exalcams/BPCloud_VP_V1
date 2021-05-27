import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    ViewEncapsulation,
} from "@angular/core";
import {
    AuthenticationDetails,
    UserWithRole,
    AppUsage,
    UserPreference,
} from "app/models/master";
import { Guid } from "guid-typescript";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { Task } from "app/models/task";
import { FormGroup, FormBuilder } from "@angular/forms";
import {
    POSearch,
    PO,
    Status,
    DashboardGraphStatus,
    OTIFStatus,
    QualityStatus,
    FulfilmentStatus,
    Deliverystatus,
} from "app/models/Dashboard";
import {
    MatTableDataSource,
    MatPaginator,
    MatMenuTrigger,
    MatSort,
    MatSnackBar,
    MatDialogConfig,
    MatDialog,
} from "@angular/material";
import { SelectionModel } from "@angular/cdk/collections";
import { FuseConfigService } from "@fuse/services/config.service";
import { Router } from "@angular/router";
import { DashboardService } from "app/services/dashboard.service";
import { DatePipe } from "@angular/common";
import { SnackBarStatus } from "app/notifications/notification-snack-bar/notification-snackbar-status-enum";
import { ChartType } from "chart.js";
import { fuseAnimations } from "@fuse/animations";
import { SODetails } from "app/models/customer";
import { BPCFact, BPCKRA, CustomerBarChartData } from "app/models/fact";
import { MasterService } from "app/services/master.service";
import { OfAttachmentData } from "app/models/OrderFulFilment";
import { BPCInvoiceAttachment } from "app/models/ASN";
import { AttachmentViewDialogComponent } from 'app/notifications/attachment-view-dialog/attachment-view-dialog.component';
import { FactService } from "app/services/fact.service";
import * as SecureLS from 'secure-ls';
import { AuthService } from "app/services/auth.service";

@Component({
    selector: "app-customer-orderfulfilment",
    templateUrl: "./customer-orderfulfilment.component.html",
    styleUrls: ["./customer-orderfulfilment.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class CustomerOrderfulfilmentComponent implements OnInit {
    BGClassName: any;
    fuseConfig: any;
    userPreference: UserPreference;

    authenticationDetails: AuthenticationDetails;
    currentUserID: Guid;
    currentUserName: string;
    currentUserRole: string;
    PartnerID: string;
    MenuItems: string[];
    notificationSnackBarComponent: NotificationSnackBarComponent;
    IsProgressBarVisibile: boolean;
    AllOwners: UserWithRole[] = [];
    AllTasks: Task[] = [];
    AllTasksCount: number;
    AllNewTasksCount: number;
    AllOpenTasksCount: number;
    AllEscalatedTasksCount: number;
    AllReworkTasksCount: number;
    SODisplayedColumns: string[] = [
        // "PIRNumber",
        "SO",
        // 'Version',
        // "PIRType",
        "SODate",
        "Status",
        "Document",
        // 'NextProcess',
        "Action",
    ];
    poFormGroup: FormGroup;
    isDateError: boolean;
    ShowAddBtn: boolean;
    SOSearch: POSearch;
    SODataSource: MatTableDataSource<SODetails>;
    @ViewChild(MatPaginator) SOPaginator: MatPaginator;
    @ViewChild(MatSort) SOSort: MatSort;
    @ViewChild(MatMenuTrigger) matMenuTrigger: MatMenuTrigger;
    // @ViewChild(MatPaginator) paginator: MatPaginator;
    selection = new SelectionModel<any>(true, []);
    AllTickets: any[] = [];
    AllActivities: any[] = [];
    Fulfilments: any[] = [];
    donutChartData: any[] = [];
    DeliveryStatus: any[] = [];
    AllStatus: Status[] = [
        { Value: "All", Name: "All" },
        { Value: "10", Name: "Dispatch" },
        { Value: "20", Name: "Partial Dispatch" },
        { Value: "30", Name: "Recived" },
        { Value: "40", Name: "Partial Recived" },
        { Value: "50", Name: "Paid" },
        { Value: "60", Name: "Partial Paid" },
        // { Value: 'All', Name: 'All' },
    ];
    // foods: string[] = [
    //     {value: 'steak-0', viewValue: 'Steak'},
    //     {value: 'pizza-1', viewValue: 'Pizza'},
    //     {value: 'tacos-2', viewValue: 'Tacos'}
    //   ];
    searchText = "";
    FilterVal = "All";
    ActionModel = "Acknowledge";
    AllSOs: SODetails[] = [];
    DashboardGraphStatus: DashboardGraphStatus = new DashboardGraphStatus();
    OTIFStatus: OTIFStatus = new OTIFStatus();
    QualityStatus: QualityStatus = new QualityStatus();
    FulfilmentStatus: FulfilmentStatus = new FulfilmentStatus();
    dashboardDeliverystatus: Deliverystatus = new Deliverystatus();
    selectedPORow: PO = new PO();
    ofAttachments: BPCInvoiceAttachment[] = [];
    // Circular Progress bar
    radius = 60;
    circumference = 2 * Math.PI * this.radius;
    dashoffset1: number;
    dashoffset2: number;
    progressPercentage1 = 0;
    progressPercentage2 = 0;
    nextProcess: string;
    SecretKey: string;
    SecureStorage: SecureLS;
    // Doughnut Chart
    public doughnutChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
            position: "left",
            labels: {
                fontSize: 10,
                padding: 20,
                usePointStyle: true,
            },
        },
        cutoutPercentage: 80,
        elements: {
            arc: {
                borderWidth: 0,
            },
        },
        plugins: {
            labels: {
                // tslint:disable-next-line:typedef
                render: function (args) {
                    return args.value + '%';
                    // return args.value;
                },
                fontColor: "#000",
                position: "outside",
            },
        },
    };
    public doughnutChartType: ChartType = "doughnut";
    // public doughnutChartLabels: any[] = ['Open', 'Scheduled', 'In Progress', 'Pending'];
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
                    return args.value + "%";
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
    public barChartLabels: any[] = [];
    public barChartType: ChartType = "bar";
    public barChartLegend = true;
    // public barChartData: any[] = [
    //     { data: [45, 70, 65, 20, 80], label: 'Actual' },
    //     { data: [87, 50, 40, 71, 56], label: 'Planned' }
    // ];
    public barChartData: any[] = [
        { data: [], label: "Actual" },
        { data: [], label: "Planned" },
    ];
    public barColors: any[] = [
        { backgroundColor: "#40a8e2" },
        { backgroundColor: "#fb863a" },
    ];
    SelectedBPCFact: any;
    client: any;
    type: any;
    company: any;
    patnerid: any;

    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _FactService: FactService,
        public snackBar: MatSnackBar,
        public _dashboardService: DashboardService,
        private _masterService: MasterService,
        private datePipe: DatePipe,
        private dialog: MatDialog,
        private _authService: AuthService,
    ) {
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
        this.authenticationDetails = new AuthenticationDetails();
        this.IsProgressBarVisibile = false;
        this.poFormGroup = this._formBuilder.group({
            FromDate: [""],
            ToDate: [""],
            Status: [""],
        });
        this.ShowAddBtn = true;
        this.SecretKey = this._authService.SecretKey;
        this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
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
            this.currentUserName = this.authenticationDetails.UserName;
            this.PartnerID = this.authenticationDetails.UserName;
            this.currentUserRole = this.authenticationDetails.UserRole;
            this.MenuItems = this.authenticationDetails.MenuItemNames.split(
                ","
            );
            // console.log(this.authenticationDetails);
            if (this.MenuItems.indexOf("CustomerOrderFulFilmentCenter") < 0) {
                this.notificationSnackBarComponent.openSnackBar(
                    "You do not have permission to visit this page",
                    SnackBarStatus.danger
                );
                this._router.navigate(["/auth/login"]);
            }
        } else {
            this._router.navigate(["/auth/login"]);
        }
        this.GetFactByPartnerID();
        this.CreateAppUsage();
       
        // this.GetSODetails();
        this.GetCustomerOpenProcessCircle();
        this.GetCustomerCreditLimitProcessCircle();
        this.GetCustomerDoughnutChartData();
        this.GetCustomerBarChartData();
     
        this.Fulfilments = [
            {
                name: "Open",
                value: 40,
                label: "40%",
            },
            {
                name: "Scheduled",
                value: 20,
                label: "20%",
            },
            {
                name: "In Progress",
                value: 30,
                label: "30%",
            },
            {
                name: "Pending",
                value: 10,
                label: "10%",
            },
        ];
        this.donutChartData = [
            {
                label: "Liverpool FC",
                value: 5,
                color: "red",
            },
            {
                label: "Real Madrid	",
                value: 13,
                color: "black",
            },
            {
                label: "FC Bayern München",
                value: 5,
                color: "blue",
            },
        ];
        this.DeliveryStatus = [
            {
                name: "17/02/20",
                series: [
                    {
                        name: "Planned",
                        value: 88,
                    },
                    {
                        name: "Actual",
                        value: 70,
                    },
                ],
            },

            {
                name: "18/02/20",
                series: [
                    {
                        name: "Planned",
                        value: 60,
                    },
                    {
                        name: "Actual",
                        value: 88,
                    },
                ],
            },
            {
                name: "19/02/20",
                series: [
                    {
                        name: "Planned",
                        value: 40,
                    },
                    {
                        name: "Actual",
                        value: 88,
                    },
                ],
            },
        ];

        // this.Pos = [
        //     { TransID: 122, Version: '1.1', PODate: new Date(), Status: 'Open', Document: '', NextProcess: 'Acknowledgement' },
        //     { TransID: 123, Version: '1.1', PODate: new Date(), Status: 'PO', Document: '', NextProcess: 'Acknowledgement' },
        //     { TransID: 124, Version: '1.1', PODate: new Date(), Status: 'ASN', Document: '', NextProcess: 'Acknowledgement' },
        //     { TransID: 125, Version: '1.1', PODate: new Date(), Status: 'Gate', Document: '', NextProcess: 'Acknowledgement' },
        //     { TransID: 126, Version: '1.1', PODate: new Date(), Status: 'GRN', Document: '', NextProcess: 'Acknowledgement' },
        // ];
        // this.posDataSource = new MatTableDataSource(this.Pos);
    }
    openMyMenu(index: any): void {
        alert(index);
        this.matMenuTrigger.openMenu();
    }
    closeMyMenu(index: any): void {
        alert(index);
        this.matMenuTrigger.closeMenu();
    }
    CreateAppUsage(): void {
        const appUsage: AppUsage = new AppUsage();
        appUsage.UserID = this.currentUserID;
        appUsage.AppName = "Order Fulfillment";
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
    GetFactByPartnerID(): void {
        this._FactService.GetFactByPartnerID(this.currentUserName).subscribe(
            (data) => {
                this.SelectedBPCFact = data as BPCFact;
                this.client=data.Client, 
                this.company= data.Company,
                this.type=data.Type,
                this.patnerid=data.PatnerID
                if(data)
                this.GetSODetails();
            },
            (err) => {
                console.error(err);
            }
        );
    }
    GetSODetails(): void {
        this.IsProgressBarVisibile = true;
     
        this._dashboardService.GetSODetails(this.client,this.company,this.type,this.patnerid).subscribe(
            // this.type
            // "C", this.PartnerID
            (data) => {
                if (data) {
                    this.AllSOs = data as SODetails[];
                    this.SODataSource = new MatTableDataSource(this.AllSOs);
                    this.SODataSource.paginator = this.SOPaginator;
                    this.SODataSource.sort = this.SOSort;
                }
                this.IsProgressBarVisibile = false;
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
            }
        );
    }

    GetCustomerOpenProcessCircle(): void {
        this.IsProgressBarVisibile = true;
        this._dashboardService
            .GetCustomerOpenProcessCircle(this.PartnerID)
            .subscribe(
                (data) => {
                    if (data) {
                        const OpenProcessCircle = data as BPCKRA;
                        if (OpenProcessCircle && OpenProcessCircle.KRAValue) {
                            this.progress1(+OpenProcessCircle.KRAValue);
                        }
                    }
                    this.IsProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.IsProgressBarVisibile = false;
                }
            );
    }
    GetCustomerCreditLimitProcessCircle(): void {
        this.IsProgressBarVisibile = true;
        this._dashboardService
            .GetCustomerCreditLimitProcessCircle(this.PartnerID)
            .subscribe(
                (data) => {
                    if (data) {
                        const CreditLimitProcessCircle = data as BPCKRA;
                        if (
                            CreditLimitProcessCircle &&
                            CreditLimitProcessCircle.KRAValue
                        ) {
                            this.progress2(+CreditLimitProcessCircle.KRAValue);
                        }
                    }
                    this.IsProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.IsProgressBarVisibile = false;
                }
            );
    }
    GetCustomerDoughnutChartData(): void {
        this.IsProgressBarVisibile = true;
        this._dashboardService
            .GetCustomerDoughnutChartData(this.PartnerID)
            .subscribe(
                (data) => {
                    if (data) {
                        const DoughnutChartData = data as BPCKRA[];
                        this.doughnutChartLabels = DoughnutChartData.map(
                            (x) => x.KRA
                        );
                        this.doughnutChartData = DoughnutChartData.map(
                            (x) => +x.KRAValue
                        );
                    }
                    this.IsProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.IsProgressBarVisibile = false;
                }
            );
    }
    GetCustomerBarChartData(): void {
        this.IsProgressBarVisibile = true;
        this._dashboardService
            .GetCustomerBarChartData(this.PartnerID)
            .subscribe(
                (data) => {
                    if (data) {
                        const BarChartData = data as CustomerBarChartData;
                        this.barChartLabels = BarChartData.BarChartLabels;
                        this.barChartData = [
                            {
                                data: BarChartData.ActualData.map((x) => +x),
                                label: "Actual",
                            },
                            {
                                data: BarChartData.PlannedData.map((x) => +x),
                                label: "Planned",
                            },
                        ];
                    }
                    this.IsProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.IsProgressBarVisibile = false;
                }
            );
    }
    DateSelected(): void {
        // console.log('Called');
        const FROMDATEVAL = this.poFormGroup.get("FromDate").value as Date;
        const TODATEVAL = this.poFormGroup.get("ToDate").value as Date;
        if (FROMDATEVAL && TODATEVAL && FROMDATEVAL > TODATEVAL) {
            this.isDateError = true;
        } else {
            this.isDateError = false;
        }
    }
    GetAllPOBasedOnDate(): void {
        if (this.poFormGroup.valid) {
            if (!this.isDateError) {
                this.IsProgressBarVisibile = true;
                this.SOSearch = new POSearch();
                const FrDate = this.poFormGroup.get("FromDate").value;
                let FromDate = "";
                if (FrDate) {
                    FromDate = this.datePipe.transform(FrDate, "yyyy-MM-dd");
                }
                const TDate = this.poFormGroup.get("ToDate").value;
                let ToDate = "";
                if (TDate) {
                    ToDate = this.datePipe.transform(TDate, "yyyy-MM-dd");
                }
                const Status1 = this.poFormGroup.get("Status").value;
                this._dashboardService
                    .GetFilteredSODetailsByPartnerID(
                        "C",
                        this.PartnerID,
                        FromDate,
                        ToDate,
                        Status1
                    )
                    .subscribe(
                        (data) => {
                            if (data) {
                                this.AllSOs = data as SODetails[];
                                this.SODataSource = new MatTableDataSource(
                                    this.AllSOs
                                );
                                this.SODataSource.paginator = this.SOPaginator;
                                this.SODataSource.sort = this.SOSort;
                            }
                            this.IsProgressBarVisibile = false;
                        },
                        (err) => {
                            console.error(err);
                            this.IsProgressBarVisibile = false;
                            this.notificationSnackBarComponent.openSnackBar(
                                err instanceof Object
                                    ? "Something went wrong"
                                    : err,
                                SnackBarStatus.danger
                            );
                        }
                    );
            }
        }
        Object.keys(this.poFormGroup.controls).forEach((key) => {
            this.poFormGroup.get(key).markAsTouched();
            this.poFormGroup.get(key).markAsDirty();
        });
    }
    GotoPOLookup(so: string): void {
        // alert(po);
        if (so) {
            this._router.navigate(["/customer/polookup"], {
                queryParams: { id: so },
            });
        } else {
            this.notificationSnackBarComponent.openSnackBar(
                "Sales order not yet created",
                SnackBarStatus.danger
            );
        }
    }
    goToSupportDesk(so: string): void {
        if (so) {
            this._router.navigate(["/customer/supportticket"], {
                queryParams: { id: so },
            });
        } else {
            this.notificationSnackBarComponent.openSnackBar(
                "Sales order not yet created",
                SnackBarStatus.danger
            );
        }
    }
    GotoPIR(PIRNumber?: string, PIRType?: string): void {
        // alert(po);
        if (PIRNumber) {
            if (PIRType) {
                const type = PIRType.toLowerCase();
                if (type === "pi") {
                    this._router.navigate(["/customer/purchaseindent"], {
                        queryParams: { id: PIRNumber },
                    });
                } else if (type === "return") {
                    this._router.navigate(["/customer/customerreturn"], {
                        queryParams: { id: PIRNumber },
                    });
                }
            }
        } else {
            this._router.navigate(["/customer/purchaseindent"]);
        }
    }
    GotoReturn(PIRType?: string): void {
        // alert(po);
        if (PIRType) {
            this._router.navigate(["/customer/return"], {
                queryParams: { id: PIRType },
            });
        } else {
            this._router.navigate(["/customer/customerreturn"]);
        }
    }
    // Acknowledgement(po: string): void {
    //   // alert(po);
    //   this._router.navigate(['/pages/polookup'], { queryParams: { id: po } });
    // }
    // POFlip(po: string): void {
    //   this._router.navigate(['/poflip'], { queryParams: { id: po } });
    // }
    // Checked(po: string): void {
    //   this._router.navigate(['/pages/polookup'], { queryParams: { id: po } });
    // }
    // AdvanceShipment(po: string): void {
    //   // alert(po);
    //   this._router.navigate(['/pages/asn'], { queryParams: { id: po } });
    // }
    // NextProcess(nextProcess: string, po: string): void {
    //   if (nextProcess === 'ACK') {
    //     // this.nextProcess = 'ACK';
    //     this._router.navigate(['/pages/polookup'], { queryParams: { id: po } });
    //   }
    //   else if (nextProcess === 'ASN') {
    //     // this.nextProcess = 'ASN';
    //     this._router.navigate(['/pages/asn'], { queryParams: { id: po } });
    //   }
    // }
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
    };

    pieChartLabel(Fulfilments: any[], name: string): string {
        const item = Fulfilments.filter((data) => data.name === name);
        if (item.length > 0) {
            return item[0].label;
        }
        return name;
    }
    getStatusColor(element: SODetails, StatusFor: string): string {
        switch (StatusFor) {
            
            case "order":
                return element.Status === "order"
                    ? "#34ad65"
                    : element.Status === "partial_Recived"
                    ? "#34ad65"
                    : element.Status === "Fully_Recived"
                    ? "#34ad65"
                    : element.Status === "partial_Dispatch"
                    ? "#34ad65"
                    : element.Status === "Fully_Dispatch"
                    ? "#34ad65"
                    : element.Status === "partial_paid"
                    ? "#34ad65"
                    : element.Status === "Fully_Recived"
                    ? "#34ad65"
                   : "gray";
 
            case "Dispatch":
                return element.Status === "order"
                    ? "gray"
                    : element.Status === "partial_Recived"
                    ? "#34ad65"
                    : element.Status === "Fully_Recived"
                    ? "#34ad65"
                    : element.Status === "partial_Dispatch"
                    ? "#efb577"
                    : element.Status === "Fully_Dispatch"
                    ? "#34ad65"
                    : element.Status === "partial_paid"
                    ? "#34ad65"
                    : element.Status === "Fully_Recived"
                    ? "#34ad65"
                   : "gray";
            case "Recived":
                return element.Status === "order"
                    ? "gray"
                    : element.Status === "partial_Dispatch"
                    ? "gray"
                    : element.Status === "Fully_Dispatch"
                    ? "gray"
                    : element.Status === "partial_Recived"
                    ? "#efb577"
                    : element.Status === "Fully_Recived"
                    ?"#34ad65"
 
                    : element.Status === "partial_paid"
                    ? "#34ad65"
                    : element.Status === "fully_paid"
                    ?"#34ad65"
                    : "gray";
            case "Paid":
                return element.Status === "order"
                    ? "gray"
                    : element.Status === "partial_Dispatch"
                    ? "gray"
                    : element.Status === "Fully_Dispatch"
                    ? "gray"
                  
                    : element.Status === "partial_Recived"
                    ? "gray"
                    : element.Status === "Fully_Recived"
                    ? "gray"
                    : element.Status === "partial_paid"
                    ? "#efb577"
                    : element.Status === "Fully_Recived"
                    ?"#34ad65"
                    : "gray";
            default:
                return "";
        }
    }
    // getStatusColor(element: SODetails, StatusFor: string): string {
    //     switch (StatusFor) {
    //         case "Shipped":
    //             return element.Status === "Open"
    //                 ? "gray"
    //                 : element.Status === "SO"
    //                 ? "#efb577"
    //                 : "#34ad65";
    //         case "Invoiced":
    //             return element.Status === "Open"
    //                 ? "gray"
    //                 : element.Status === "SO"
    //                 ? "gray"
    //                 : element.Status === "Shipped"
    //                 ? "#efb577"
    //                 : "#34ad65";
    //         case "Receipt":
    //             return element.Status === "Open"
    //                 ? "gray"
    //                 : element.Status === "SO"
    //                 ? "gray"
    //                 : element.Status === "Shipped"
    //                 ? "gray"
    //                 : element.Status === "Invoiced"
    //                 ? "#efb577"
    //                 : "#34ad65";
    //         default:
    //             return "";
    //     }
    // }

    // getTimeline(element: SODetails, StatusFor: string): string {
    //     switch (StatusFor) {
    //         case "Shipped":
    //             return element.Status === "Open"
    //                 ? "white-timeline"
    //                 : element.Status === "SO"
    //                 ? "orange-timeline"
    //                 : "green-timeline";
    //         case "Invoiced":
    //             return element.Status === "Open"
    //                 ? "white-timeline"
    //                 : element.Status === "SO"
    //                 ? "white-timeline"
    //                 : element.Status === "Shipped"
    //                 ? "orange-timeline"
    //                 : "green-timeline";
    //         case "Receipt":
    //             return element.Status === "Open"
    //                 ? "white-timeline"
    //                 : element.Status === "SO"
    //                 ? "white-timeline"
    //                 : element.Status === "Shipped"
    //                 ? "white-timeline"
    //                 : element.Status === "Invoiced"
    //                 ? "orange-timeline"
    //                 : "green-timeline";
    //         default:
    //             return "";
    //     }
    // }
    getTimeline(element: SODetails, StatusFor: string): string {
        switch (StatusFor) {
 
            case "order":
                return element.Status === "order"
                ? "green-timeline"
                    : element.Status === "partial_Dispatch"
                    ? "green-timeline"
                    : element.Status === "Fully_Dispatch"
                    ? "green-timeline"  
                    : element.Status === "partial_Recived"
                    ? "green-timeline"
                : element.Status === "Fully_Recived"
                ? "green-timeline"   
                    
                    : element.Status === "partial_paid"
                    ? "green-timeline"
                    : element.Status === "fully_paid"
                    ? "green-timeline"     
                    : "white-timeline";
 
            case "Dispatch":
                return element.Status === "order"
                    ? "white-timeline"
                    : element.Status === "partial_Dispatch"
                    ? "orange-timeline"  
                    : element.Status === "Fully_Dispatch"
                    ? "green-timeline"     
                    : element.Status === "partial_Recived"
                    ? "green-timeline"
                : element.Status === "Fully_Recived"
                    ? "green-timeline"    
                    
                    : element.Status === "partial_paid"
                    ? "green-timeline"  
                    : element.Status === "fully_paid"
                    ? "green-timeline"     
                    : "white-timeline";
            case "Recived":
                return element.Status === "order"
                    ? "white-timeline"
                    : element.Status === "partial_Dispatch"
                    ? "white-timeline"
                    : element.Status === "Fully_Dispatch"
                    ? "white-timeline" 
                     : element.Status === "partial_Recived"
                    ? "orange-timeline"
                    : element.Status === "partial_paid"
                    ? "green-timeline"
                    : element.Status === "fully_paid"
                    ? "green-timeline"
                    : "white-timeline";
            case "Paid":
                return element.Status === "order"
                    ? "white-timeline"
                    : element.Status === "partial_Dispatch"
                    ? "white-timeline"
                    : element.Status === "Fully_Dispatch"
                    ? "white-timeline"
                    : element.Status === "partial_Recived"
                    ? "white-timeline"
                    : element.Status === "Fully_Recived"
                    ? "white-timeline"
                    : element.Status === "partial_paid"
                    ? "orange-timeline"
                    : element.Status === "fully_paid"
                    ? "green-timeline"
                    : "white-timeline";
            default:
                return "";
        }
    }
    getRestTimeline(element: SODetails, StatusFor: string): string {
        switch (StatusFor) {
            case "order":
                return element.Status === "order"
                ? "white-timeline"
                    : element.Status === "partial_Dispatch"
                    ? "green-timeline" 
                    : element.Status === "Fully_Dispatch"
                    ? "green-timeline"     
                    : element.Status === "partial_Recived"
                    ? "green-timeline"
                : element.Status === "Fully_Recived"
                    ? "green-timeline"    
                    
                    : element.Status === "partial_paid"
                    ? "green-timeline"  
                    : element.Status === "fully_paid"
                    ? "green-timeline"     
                    : "white-timeline";
 
            case "Dispatch":
                return element.Status === "order"
                    ? "white-timeline"
                    : element.Status === "partial_Dispatch"
                    ? "white-timeline"
                    : element.Status === "Fully_Dispatch"
                    ? "white-timeline"
                    : element.Status === "partial_Recived"
                    ? "green-timeline"
                : element.Status === "Fully_Recived"
                    ? "green-timeline"    
                    
                    : element.Status === "partial_paid"
                    ? "green-timeline"  
                    : element.Status === "fully_paid"
                    ? "green-timeline"     
                    : "white-timeline";
            case "Recived":
                return element.Status === "order"
                    ? "white-timeline"
                    : element.Status === "partial_Dispatch"
                    ? "white-timeline"
                    : element.Status === "Fully_Dispatch"
                    ? "white-timeline" 
                     : element.Status === "partial_Recived"
                     ? "white-timeline"
                     : element.Status === "Fully_Recived"
                     ? "white-timeline"
                    : element.Status === "partial_paid"
                    ? "green-timeline"
                    : element.Status === "fully_paid"
                    ? "green-timeline"
                    : "white-timeline";
                    default:
                        return "";
                }
            }
    // getRestTimeline(element: SODetails, StatusFor: string): string {
    //     switch (StatusFor) {
    //         case "Shipped":
    //             return element.Status === "Open"
    //                 ? "white-timeline"
    //                 : element.Status === "SO"
    //                 ? "white-timeline"
    //                 : "green-timeline";
    //         case "Invoiced":
    //             return element.Status === "Open"
    //                 ? "white-timeline"
    //                 : element.Status === "SO"
    //                 ? "white-timeline"
    //                 : element.Status === "Shipped"
    //                 ? "white-timeline"
    //                 : "green-timeline";
    //         case "Receipt":
    //             return element.Status === "Open"
    //                 ? "white-timeline"
    //                 : element.Status === "SO"
    //                 ? "white-timeline"
    //                 : element.Status === "Shipped"
    //                 ? "white-timeline"
    //                 : element.Status === "Invoiced"
    //                 ? "white-timeline"
    //                 : "green-timeline";
    //         default:
    //             return "";
    //     }
    // }
    // getNextProcess(element: any) {
    //   // console.log(element);
    //   // if (element.Status === 'Open') {
    //   //     this.nextProcess = 'ACK';
    //   // }
    //   // else if (element.Status === 'ACK') {
    //   //     this.nextProcess = 'ASN';
    //   // }
    //   // else if (element.Status === 'ASN') {
    //   //     this.nextProcess = 'Gate';
    //   // }
    //   // else {
    //   //     this.nextProcess = 'GRN';
    //   // }
    //   if (element.Status === 'Open') {
    //     element.NextProcess = 'ACK';
    //   }
    //   else if (element.Status === 'ACK') {
    //     element.NextProcess = 'ASN';
    //   }
    //   else if (element.Status === 'ASN') {
    //     element.NextProcess = 'Gate';
    //   }
    //   else {
    //     element.NextProcess = 'GRN';
    //   }

    // }
    AddClicked(): void {
        this.ShowAddBtn = false;
    }

    ClearClicked(): void {
        this.ShowAddBtn = true;
    }

    viewOfAttachmentClicked(element: SODetails): void {
        // const attachments = this.ofAttachments.filter(x => x.AttachmentID.toString() === element.RefDoc);
        if (element.SO) {
            this.GetOfAttachmentsByPartnerIDAndDocNumber(element.SO);
        } else {
            this.notificationSnackBarComponent.openSnackBar(
                "Sales order not yet created",
                SnackBarStatus.danger
            );
        }
    }

    GetOfAttachmentsByPartnerIDAndDocNumber(docNumber: string): void {
        this.IsProgressBarVisibile = true;
        this._dashboardService
            .GetOfAttachmentsByPartnerIDAndDocNumber(
                this.authenticationDetails.UserName,
                docNumber
            )
            .subscribe(
                (data) => {
                    if (data) {
                        this.ofAttachments = data as BPCInvoiceAttachment[];
                        console.log(this.ofAttachments);
                        const ofAttachmentData = new OfAttachmentData();
                        ofAttachmentData.DocNumber = docNumber;
                        ofAttachmentData.OfAttachments = this.ofAttachments;
                        ofAttachmentData.Type = "C";
                        this.openAttachmentViewDialog(ofAttachmentData);
                    }
                    this.IsProgressBarVisibile = false;
                },
                (err) => {
                    console.error(err);
                    this.IsProgressBarVisibile = false;
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
                this.GetSODetails();
            }
        });
    }

    SetUserPreference(): void {
        this._fuseConfigService.config.subscribe((config) => {
            this.fuseConfig = config;
            this.BGClassName = config;
        });
        // this._fuseConfigService.config = this.fuseConfig;
    }
}
