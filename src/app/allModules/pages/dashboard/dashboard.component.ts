import { Component, OnInit, ViewChild } from "@angular/core";
import { AuthenticationDetails, AppUsage } from "app/models/master";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { MatSnackBar, MatDialog, MatDialogConfig } from "@angular/material";
import { SelectionModel } from "@angular/cdk/collections";
import { FactService } from "app/services/fact.service";
import { Router } from "@angular/router";
import { NotificationDialogComponent } from "app/notifications/notification-dialog/notification-dialog.component";
import { SnackBarStatus } from "app/notifications/notification-snack-bar/notification-snackbar-status-enum";
import { Guid } from "guid-typescript";
import { BPCFact } from "app/models/fact";
import { DashboardService } from "app/services/dashboard.service";
import { BPCOFAIACT } from "app/models/OrderFulFilment";
import { MasterService } from "app/services/master.service";
import { TranslateService, TranslatePipe } from "@ngx-translate/core";
import { TourComponent } from "../tour/tour.component";
import { Chart, ChartType } from "chart.js";
import { POService } from 'app/services/po.service';
import { Validators } from '@angular/forms';
import { BPCCEOMessage, BPCSCOCMessage } from 'app/models/Message.model';
import { FuseConfigService } from '@fuse/services/config.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import * as SecureLS from 'secure-ls';

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
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
    public theme = 'blue';
    menuItems: string[] = [];
    authenticationDetails: AuthenticationDetails;
    IsProgressBarVisibile: boolean;
    selectedCEOMessage: BPCCEOMessage;
    selectedSCOCMessage: BPCSCOCMessage;
    i: any;
    a: any = 1;
    b: any = "#1f76d3";
    Index = [];
    array1: any = [];
    BarChartRender: boolean;
    BarChartcolor: any[] = ['#60c0ea', '#485865', '#9bc4ca', '#71a8ef'];
    TempBarChartcolor: any[] = ['#60c0ea', '#485865', '#9bc4ca', '#71a8ef'];
    BarchartColumnWidth: any = "60%";
    TempBarchartColumnWidth: any = "60%";
    fuseConfig: any;
    BGClassName: any;
    BarChartData: any[] = [{
        name: "Deliveries",
        data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
    },
    {
        name: "Bounces",
        data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
    },
    {
        name: "Supressions",
        data: [35, 41, 36, 26, 45, 48, 52, 53, 41]
    },
    {
        name: "Posts via Route",
        data: [15, 45, 34, 36, 45, 68, 72, 13, 90]
    }];
    TempBarChartData: any[] = [{
        name: "Deliveries",
        data: [44, 55, 57, 56, 61, 58, 63, 60, 66]
    },
    {
        name: "Bounces",
        data: [76, 85, 101, 98, 87, 105, 91, 114, 94]
    },
    {
        name: "Supressions",
        data: [35, 41, 36, 26, 45, 48, 52, 53, 41]
    },
    {
        name: "Posts via Route",
        data: [15, 45, 34, 36, 45, 68, 72, 13, 90]
    }];
    @ViewChild("chart") chart: ChartComponent;
    public BarchartOptions: Partial<ChartOptions>;

    public LineChartChartOptions1: Partial<ChartOptions>;
    public LineChartChartOptions2: Partial<ChartOptions>;

    public GuagechartOptionsOS: Partial<ChartOptions>;
    public GuagechartOptionsQI: Partial<ChartOptions>;
    public GuagechartOptionsOTIF: Partial<ChartOptions>;
    public GuagechartOptionsPV: Partial<ChartOptions>;
    public GuagechartOptionsRES: Partial<ChartOptions>;
    SecretKey: string;
    SecureStorage: SecureLS;

    constructor(
        private dialog: MatDialog,
        private _POService: POService,
        private _router: Router,
        private _authService: AuthService,

        private _fuseConfigService: FuseConfigService) {
        this.IsProgressBarVisibile = false;
        this.authenticationDetails = new AuthenticationDetails();
        this.selectedCEOMessage = new BPCCEOMessage();
        this.selectedSCOCMessage = new BPCSCOCMessage();
        this.SecretKey = this._authService.SecretKey;
        this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    }

    ngOnInit(): void {
        this.SetUserPreference();
        const retrievedObject = this.SecureStorage.get('authorizationData');
        // if (retrievedObject) {
        //     this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
        //     this.menuItems = this.authenticationDetails.MenuItemNames.split(',');
        //     // if (this.menuItems.indexOf('User') < 0) {
        //     //   this.notificationSnackBarComponent.openSnackBar('You do not have permission to visit this page', SnackBarStatus.danger);
        //     //   this._router.navigate(['/auth/login']);
        //     // }
        //     if (!this.authenticationDetails.TourStatus) {
        //         this.openTourScreenDialog();
        //     }
        // this.LoadBotChat();
        // this.GetCEOMessage();
        // this.GetSCOCMessage();
        // this.LoadCharts();
        this.LoadlineChart1();
        this.LoadlineChart2();
        this.LoadGaugaeChats();
        this.LoadBarChart();
        this.BarChartRender = true;
        // } else {
        //     this._router.navigate(['/auth/login']);
        // }
    }
    LoadGaugaeChats(): void {
        this.LoadGuagechartOptionsOSChart();
        this.LoadGuagechartOptionsQIChart();
        this.LoadGuagechartOptionsOTIFChart();
        this.LoadGuagechartOptionsPVChart();
        this.LoadGuagechartOptionsRESChart();
    }
    LoadGuagechartOptionsQIChart(): void {
        this.GuagechartOptionsQI = {
            guageseries: [90],
            chart: {
                height: 197,
                type: "radialBar",
                offsetX: -13
            },
            plotOptions: {
                radialBar: {
                    startAngle: -155,
                    endAngle: 155,
                    hollow: {
                        size: "60%"
                    },
                    dataLabels: {
                        value: {
                            offsetY: -14,
                            fontSize: "15px",
                            fontWeight: 'bold',
                            color: undefined,
                            formatter: function (val) {
                                return val + "%";
                            }
                        }
                    }
                }
            },
            fill: {

                type: "gradient",
                gradient: {
                    shade: "dark",
                    shadeIntensity: 0.15,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [0, 50, 65, 91]
                }
            },
            stroke: {
                dashArray: 2
            },
            labels: [""],
            responsive: [
                {
                    breakpoint: 1100,
                    options: {
                        chart: {
                            height: 185,
                            offsetX: -8
                        }
                    }
                }
            ]
        };
    }
    LoadGuagechartOptionsOTIFChart(): void {
        this.GuagechartOptionsOTIF = {
            guageseries: [90],
            chart: {
                height: 197,
                type: "radialBar",
                offsetX: -13
            },
            plotOptions: {
                radialBar: {
                    startAngle: -155,
                    endAngle: 155,
                    hollow: {
                        size: "60%"
                    },
                    dataLabels: {
                        name: {
                            fontSize: "10px",
                            color: "#f04747",
                            offsetY: 10
                        },
                        value: {
                            offsetY: -20,
                            fontSize: "15px",
                            fontWeight: 'bold',
                            color: undefined,
                            formatter: function (val) {
                                return val + "%";
                            }
                        }
                    }
                }
            },
            fill: {

                type: "gradient",
                gradient: {
                    shade: "dark",
                    shadeIntensity: 0.15,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [0, 50, 65, 91]
                }
            },
            stroke: {
                dashArray: 2
            },
            labels: ["Efficiency"],
            responsive: [
                {
                    breakpoint: 1100,
                    options: {
                        chart: {
                            height: 185
                        }
                    }
                }
            ]
        };
    }
    LoadGuagechartOptionsPVChart(): void {
        this.GuagechartOptionsPV = {
            guageseries: [90],
            chart: {
                height: 197,
                type: "radialBar",
                offsetX: -13
            },
            plotOptions: {
                radialBar: {
                    startAngle: -155,
                    endAngle: 155,
                    hollow: {
                        size: "60%"
                    },
                    dataLabels: {
                        value: {
                            offsetY: -14,
                            fontSize: "15px",
                            fontWeight: 'bold',
                            color: undefined,
                            formatter: function (val) {
                                return val + "%";
                            }
                        }
                    }
                }
            },
            fill: {

                type: "gradient",
                gradient: {
                    shade: "dark",
                    shadeIntensity: 0.15,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [0, 50, 65, 91]
                }
            },
            stroke: {
                dashArray: 2
            },
            labels: [""],
            responsive: [
                {
                    breakpoint: 1100,
                    options: {
                        chart: {
                            height: 185
                        }
                    }
                }
            ]
        };
    }
    LoadGuagechartOptionsRESChart(): void {
        this.GuagechartOptionsRES = {
            guageseries: [90],
            chart: {
                height: 197,
                type: "radialBar",
                offsetX: -13
            },
            plotOptions: {
                radialBar: {
                    startAngle: -155,
                    endAngle: 155,
                    hollow: {
                        size: "60%"
                    },
                    dataLabels: {
                        value: {
                            offsetY: -14,
                            fontSize: "15px",
                            fontWeight: 'bold',
                            color: undefined,
                            formatter: function (val) {
                                return val + "%";
                            }
                        }
                    }
                }
            },
            fill: {

                type: "gradient",
                gradient: {
                    shade: "dark",
                    shadeIntensity: 0.15,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [0, 50, 65, 91]
                }
            },
            stroke: {
                dashArray: 2
            },
            labels: [""],
            responsive: [
                {
                    breakpoint: 1100,
                    options: {
                        chart: {
                            height: 185
                        }
                    }
                }
            ]
        };
    }
    LoadGuagechartOptionsOSChart(): void {

        this.GuagechartOptionsOS = {
            guageseries: [90],
            chart: {
                height: 197,
                type: "radialBar",
                offsetX: -13
            },
            plotOptions: {
                radialBar: {
                    startAngle: -155,
                    endAngle: 155,
                    hollow: {
                        size: "60%"
                    },
                    dataLabels: {
                        value: {
                            offsetY: -14,
                            fontSize: "15px",
                            fontWeight: 'bold',
                            color: undefined,
                            formatter: function (val) {
                                return val + "%";
                            }
                        }
                    }
                }
            },
            fill: {

                type: "gradient",
                gradient: {
                    shade: "dark",
                    shadeIntensity: 0.15,
                    inverseColors: false,
                    opacityFrom: 1,
                    opacityTo: 1,
                    stops: [0, 50, 65, 91]
                }
            },
            labels: [""],
            responsive: [
                {
                    breakpoint: 1100,
                    options: {
                        chart: {
                            height: 185
                        }
                    }
                }
            ]

        };
    }
    LoadBarChart(): void {
        this.BarchartOptions = {
            series: this.BarChartData,
            chart: {
                type: "bar",
                height: 400,
                redrawOnParentResize: true,
                width: '100%'
            },
            plotOptions: {
                bar: {
                    horizontal: false,
                    columnWidth: this.BarchartColumnWidth,
                    endingShape: "flat"
                }
            },
            responsive: [
                {
                    breakpoint: 1100,
                    options: {
                        plotOptions: {
                            bar: {
                                horizontal: false,
                                columnWidth: 30
                            },
                            stroke: {
                                show: true,
                                width: 10,
                                colors: ["transparent"]
                            },
                        },
                        legend: {
                            position: "bottom"
                        }
                    }
                }
            ],
            dataLabels: {
                enabled: false
            },
            stroke: {
                show: true,
                width: 7,
                colors: ["transparent"]
            },
            xaxis: {
                categories: [
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sep",
                    "Oct"
                ]
            },
            grid: {
                show: true,
                borderColor: '#F2F0F0',
                strokeDashArray: 0,
                position: 'back',
                xaxis: {
                    lines: {
                        show: true,

                    }
                },
                yaxis: {
                    lines: {
                        show: true
                    }
                }
            },

            fill: {
                opacity: 1,
                colors: this.BarChartcolor
            },
            legend: {
                show: false,
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return "$ " + val + " thousands";
                    }
                }
            }
        };
    }
    FilterBarchart(value): void {
        let colorIndex = 0;
        if (value === "All") {
            this.BarChartData = [];
            this.BarChartcolor = [];
            for (let i = 0; i < this.TempBarChartData.length; i++) {
                this.BarChartData.push(this.TempBarChartData[i]);
                this.BarChartcolor.push(this.TempBarChartcolor[i]);
            }
            console.log("After", this.BarChartData);
            this.BarchartColumnWidth = this.TempBarchartColumnWidth;
            this.LoadBarChart();
        }
        else {
            if (this.Index.length >= 1) {
                this.BarChartData = [];
                this.BarChartcolor = [];
                for (let i = 0; i < this.TempBarChartData.length; i++) {
                    this.BarChartData.push(this.TempBarChartData[i]);
                    this.BarChartcolor.push(this.TempBarChartcolor[i]);
                }
            }
            this.Index = [];
            for (let i = 0; i < this.BarChartData.length; i++) {
                if (this.BarChartData[i].name !== value) {
                    this.Index.push(i);
                }
                else {
                    colorIndex = i;
                }
            }
            const len = this.Index.length - 1;
            for (let i = len; i >= 0; i--) {
                console.log(this.Index[i], "Index", i);
                this.BarChartData.splice(this.Index[i], 1);
                this.BarChartcolor.splice(this.Index[i], 1);
                // this.BarChartcolor.splice(this.Index[i], i);
            }
            this.BarchartColumnWidth = "30%";
            this.LoadBarChart();
        }
    }
    LoadlineChart1(): void {
        this.LineChartChartOptions1 = {
            series: [
                {
                    name: "High - 2013",
                    data: [28, 29, 33, 36, 32, 32, 33]
                },
                {
                    name: "Low - 2013",
                    data: [25, 26, 30, 33, 29, 29, 30]
                },
                {
                    name: "Low - 2015",
                    data: [22, 23, 27, 28, 26, 26, 27]
                }
            ],
            chart: {
                height: 200,
                type: "line",

                toolbar: {
                    show: false
                }
            },
            colors: ["#566f85", "#60c0ea", "#9bc4ca"],

            stroke: {
                curve: "smooth"
            },
            legend: {
                show: false,
            },
            markers: {
                size: 5,
                colors: ['#FFFDFD', '#FFFDFD', '#FFFDFD'],
                strokeColors: ['#566f85', '#60c0ea', '#9bc4ca']
            },
            xaxis: {
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],

            },
            yaxis: {
                title: {
                    text: "Temperature"
                },
                min: 5,
                max: 40
            },

        };
    }
    LoadlineChart2(): void {
        this.LineChartChartOptions2 = {
            series: [
                {
                    name: "High - 2013",
                    data: [28, 29, 33, 36, 32]
                }
            ],
            chart: {
                height: 200,
                type: "line",

                toolbar: {
                    show: false
                }
            },
            colors: ["#566f85"],

            stroke: {
                curve: "straight"
            },
            markers: {
                size: 5,
                discrete: [{
                    seriesIndex: 0,
                    dataPointIndex: 0,
                    fillColor: '#fb863a',
                    strokeColor: '#fb863a',
                    size: 5
                }, {
                    seriesIndex: 0,
                    dataPointIndex: 1,
                    fillColor: '#40a8e2',
                    strokeColor: '#40a8e2',
                    size: 5
                },
                {
                    seriesIndex: 0,
                    dataPointIndex: 2,
                    fillColor: '#485865',
                    strokeColor: '#485865',
                    size: 5
                }, {
                    seriesIndex: 0,
                    dataPointIndex: 3,
                    fillColor: '#40ed9a',
                    strokeColor: '#40ed9a',
                    size: 5
                },
                {
                    seriesIndex: 0,
                    dataPointIndex: 4,
                    fillColor: '#ffd15c',
                    strokeColor: '#ffd15c',
                    size: 5
                }]
            },
            xaxis: {
                categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            },
            yaxis: {
                title: {
                    text: "Temperature"
                },
                min: 5,
                max: 40
            },
        };
    }
    mouseEnter(): void {
        if (this.BarChartRender) {
            this.LoadBarChart();
            this.LoadGaugaeChats();
            this.BarChartRender = false;
        }
    }
    // mouseOut():void{
    //     if (!this.BarChartRender) {
    //         this.LoadBarChart();
    //         this.LoadGaugaeChats();
    //         this.BarChartRender = !false;
    //     }
    // }
    getBarChartWidth(): any {
        const barchart = document.getElementById("barchart");
        const width = barchart.offsetWidth;
        console.log("width", width, width.toString());
        return width.toString();
    }
    openTourScreenDialog(): void {
        const dialogConfig = new MatDialogConfig();

        dialogConfig.disableClose = true;
        dialogConfig.width = "50%";
        this.dialog.open(TourComponent, dialogConfig);
    }

    GetCEOMessage(): void {
        this.IsProgressBarVisibile = true;
        this._POService.GetCEOMessage().subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                this.selectedCEOMessage = data as BPCCEOMessage;
                if (!this.selectedCEOMessage) {
                    this.selectedCEOMessage = new BPCCEOMessage();
                }
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
            }
        );
    }

    GetSCOCMessage(): void {
        this.IsProgressBarVisibile = true;
        this._POService.GetSCOCMessage().subscribe(
            (data) => {
                this.IsProgressBarVisibile = false;
                this.selectedSCOCMessage = data as BPCSCOCMessage;
                if (!this.selectedSCOCMessage) {
                    this.selectedSCOCMessage = new BPCSCOCMessage();
                }
            },
            (err) => {
                console.error(err);
                this.IsProgressBarVisibile = false;
            }
        );
    }

    // LoadCharts(): void {
    //     for (this.i = 0; this.i <= 100; this.i++) {
    //         this.array1[this.i] = this.a;
    //     }

    //     for (this.i = 0; this.i <= 75; this.i++) {
    //         this.color_75[this.i] = this.b;
    //     }
    //     for (this.i = 0; this.i <= 90; this.i++) {
    //         this.color_90[this.i] = this.b;
    //     }
    //     new Chart("doughnut1", {
    //         type: "doughnut",
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             cutoutPercentage: 70,

    //             title: {
    //                 display: false,
    //                 text: "Doughnut chart",
    //             },

    //             legend: {
    //                 display: false,
    //                 position: "top",
    //             },
    //             plugins: {
    //                 labels: false,
    //             },
    //             animation: {
    //                 animateScale: true,
    //                 animateRotate: true,
    //             },
    //         },
    //         data: {
    //             datasets: [
    //                 {
    //                     data: this.array1,
    //                     backgroundColor: this.color_75,

    //                     label: "dataset1",
    //                 },
    //             ],
    //         },
    //     });
    //     new Chart("doughnut2", {
    //         type: "doughnut",
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             cutoutPercentage: 70,

    //             title: {
    //                 display: false,
    //                 text: "Doughnut chart",
    //             },

    //             legend: {
    //                 display: false,
    //                 position: "top",
    //             },
    //             plugins: {
    //                 labels: false,
    //             },
    //             animation: {
    //                 animateScale: true,
    //                 animateRotate: true,
    //             },
    //         },
    //         data: {
    //             datasets: [
    //                 {
    //                     data: this.array1,
    //                     backgroundColor: this.color_90,
    //                     label: "dataset1",
    //                 },
    //             ],
    //         },
    //     });
    //     new Chart("doughnut3", {
    //         type: "doughnut",
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             cutoutPercentage: 70,

    //             title: {
    //                 display: false,
    //                 text: "Doughnut chart",
    //             },

    //             legend: {
    //                 display: false,
    //                 position: "top",
    //             },
    //             plugins: {
    //                 labels: false,
    //             },
    //             animation: {
    //                 animateScale: true,
    //                 animateRotate: true,
    //             },
    //         },
    //         data: {
    //             datasets: [
    //                 {
    //                     data: this.array1,
    //                     backgroundColor: this.color_90,
    //                     label: "dataset1",
    //                 },
    //             ],
    //         },
    //     });
    //     new Chart("doughnut4", {
    //         type: "doughnut",
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             cutoutPercentage: 70,

    //             title: {
    //                 display: false,
    //                 text: "Doughnut chart",
    //             },

    //             legend: {
    //                 display: false,
    //                 position: "top",
    //             },
    //             plugins: {
    //                 labels: false,
    //             },
    //             animation: {
    //                 animateScale: true,
    //                 animateRotate: true,
    //             },
    //         },
    //         data: {
    //             datasets: [
    //                 {
    //                     data: this.array1,
    //                     backgroundColor: this.color_75,

    //                     label: "dataset1",
    //                 },
    //             ],
    //         },
    //     });

    //     new Chart("doughnut5", {
    //         type: "doughnut",
    //         options: {
    //             responsive: true,
    //             maintainAspectRatio: false,
    //             cutoutPercentage: 60,

    //             title: {
    //                 display: false,
    //                 text: "Doughnut chart",
    //             },

    //             legend: {
    //                 display: false,
    //                 position: "top",
    //             },
    //             animation: {
    //                 animateScale: true,
    //                 animateRotate: true,
    //             },
    //         },
    //         data: {
    //             datasets: [
    //                 {
    //                     data: [69, 31],
    //                     backgroundColor: ["#1f76d3", "#ebebed"],
    //                     label: "dataset1",
    //                 },
    //             ],
    //         },
    //     });
    // }

    LoadBotChat(): void {
        // (function (d, m) {
        //     var kommunicateSettings = { "appId": "10fd8a0b153726753ff1ad51af63846ce", "popupWidget": true, "automaticChatOpenOnNavigation": true };
        //     var s = document.createElement("script"); s.type = "text/javascript"; s.async = true;
        //     s.src = "https://api.kommunicate.io/v2/kommunicate.app";
        //     var h = document.getElementsByTagName("head")[0]; h.appendChild(s);
        //     (window as any).kommunicate = m; m._globals = kommunicateSettings;
        // })(document, (window as any).kommunicate || {});
        // (function (d, m) {
        //   var kommunicateSettings = { "appId": "10fd8a0b153726753ff1ad51af63846ce", "popupWidget": true, "automaticChatOpenOnNavigation": true };
        //   var s = document.createElement("script"); s.type = "text/javascript"; s.async = true;
        //   s.src = "https://api.kommunicate.io/v2/kommunicate.app";
        //   var h = document.getElementsByTagName("head")[0]; h.appendChild(s);
        //   (window as any).kommunicate = m; m._globals = kommunicateSettings;
        // })(document, (window as any).kommunicate || {});
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
