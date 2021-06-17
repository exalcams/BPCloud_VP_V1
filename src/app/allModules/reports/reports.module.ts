import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FuseSidebarModule } from "@fuse/components";
import {
    MatFormFieldModule,
    MatAutocompleteModule,
    MatBadgeModule,
    MatBottomSheetModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatDividerModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    MatTreeModule,
} from "@angular/material";
import { GaugeChartModule } from 'angular-gauge-chart';
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { NgxDonutChartModule } from "ngx-doughnut-chart";
import {
    FuseCountdownModule,
    FuseHighlightModule,
    FuseMaterialColorPickerModule,
    FuseWidgetModule,
} from "@fuse/components";
import { FuseSharedModule } from "@fuse/shared.module";
import { FormsModule } from "@angular/forms";
import { DecimalPipe } from "@angular/common";
import { NgCircleProgressModule } from "ng-circle-progress";
import { ChartsModule } from "ng2-charts";
import "chartjs-plugin-labels";
import "chartjs-plugin-annotation";
import { NgImageSliderModule } from "ng-image-slider";
import { TranslateModule } from '@ngx-translate/core';
import { ReportComponent } from './report/report.component';
import { SupplierEvaluationComponent } from './supplier-evaluation/supplier-evaluation.component';
import { OTIFComponent } from './otif/otif.component';
import { NgApexchartsModule } from "ng-apexcharts";
// import 'chart.piecelabel.js';

const routes = [
    {
        path: "report",
        component: ReportComponent,
    },
    {
        path: "evaluation",
        component: SupplierEvaluationComponent,
    },
    {
        path: "otif",
        component: OTIFComponent,
    },
    {
        path: "**",
        redirectTo: "/auth/login",
    },
];
@NgModule({
    imports: [
        // HttpClientModule,
        // TranslateModule,
        GaugeChartModule,
        MatFormFieldModule,
        MatAutocompleteModule,
        MatBadgeModule,
        MatBottomSheetModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatStepperModule,
        MatDatepickerModule,
        MatDialogModule,
        MatDividerModule,
        MatExpansionModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatNativeDateModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSliderModule,
        MatSlideToggleModule,
        MatSnackBarModule,
        MatSortModule,
        MatTableModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatTreeModule,

        NgxChartsModule,
        NgxDonutChartModule,

        ChartsModule,

        FuseSharedModule,
        FuseSidebarModule,

        FuseCountdownModule,
        FuseHighlightModule,
        FuseMaterialColorPickerModule,
        FuseWidgetModule,
        // NgMultiSelectDropDownModule,

        FormsModule,
        NgCircleProgressModule.forRoot({
            // set defaults here
            // radius: 60,
            // clockwise: true,
            // titleColor: "#444444",
            // subtitleColor: "#A9A9A9",
            // outerStrokeWidth: 10,
            // innerStrokeWidth: 10,
            // outerStrokeColor: "#4882c2",
            // outerStrokeGradientStopColor: "#53a9ff",
            // innerStrokeColor: "#e7e8ea",
            // showInnerStroke: true,
            // showZeroOuterStroke: true,
            // animationDuration: 300,
            "radius": 75,
            "space": -10,
            "outerStrokeGradient": true,
            "outerStrokeWidth": 10,
            "outerStrokeColor": "#5f2cff",
            "outerStrokeGradientStopColor": "#5f2cff",
            "innerStrokeColor": "#e7e8ea",
            "innerStrokeWidth": 10,
            "subtitle": "Overall value",
            "subtitleFontSize": "15",
            "subtitleColor": "#acacac",
            "animateTitle": false,
            "animationDuration": 300,
            "showUnits": false,
            "showBackground": false,
            "startFromZero": false,
            // "lazy": true
        }),
        NgApexchartsModule,
        NgImageSliderModule,
        RouterModule.forChild(routes),
        TranslateModule
    ],
    declarations: [
        ReportComponent,
        SupplierEvaluationComponent,
        OTIFComponent,
    ],
    providers: [DecimalPipe],
    entryComponents: [],
})
export class ReportsModule { }

