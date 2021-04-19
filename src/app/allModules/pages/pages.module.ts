import { TourComponent } from "./tour/tour.component";
import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { FuseSidebarModule } from "@fuse/components";
import { MatCarouselModule } from "@ngmodule/material-carousel";
import { SharedModule } from 'app/shared/shared-module';

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
import { NgxChartsModule } from "@swimlane/ngx-charts";
import { NgxDonutChartModule } from "ngx-doughnut-chart";
import { NgxDropzoneModule } from 'ngx-dropzone';
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
import { HomeComponent } from "./home/home.component";
import { PoFactsheetComponent } from "./po-factsheet/po-factsheet.component";
import { PerformanceComponent } from "./performance/performance.component";
import { NgImageSliderModule } from "ng-image-slider";
import { TranslateModule } from "@ngx-translate/core";
import { ImprovementComponent } from "./improvement/improvement.component";

import { DashboardComponent } from './dashboard/dashboard.component';
import { ChatModule } from '../chat/chat.module';
// import { ChatModule } from '../chat';
// import 'chart.piecelabel.js';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ActionCenterComponent } from './action-center/action-center.component'; 
import {PoFactServiceDialogComponent} from './po-fact-service-dialog/po-fact-service-dialog.component';
import { CapaVendordashboardComponent } from './capa-vendordashboard/capa-vendordashboard.component';
import { CapaResponseComponent } from './capa-response/capa-response.component';
import { CapaResponseDialogComponent } from './capa-response-dialog/capa-response-dialog.component';
// npm install apexcharts ng-apexcharts — save

const routes = [
    {
        path: "dashboard",
        component: DashboardComponent,
    },
    {
        path: "home",
        component: HomeComponent,
    },
    {
        path: "actioncenter",
        component: ActionCenterComponent,
    },
    {
        path: "polookup",
        component: PoFactsheetComponent,
    },
    {
        path: "capa-dashboard",
        component:CapaVendordashboardComponent,
    },
    {
        path: "capa-response",
        component:CapaResponseComponent,
    },
    {
        path: "performance",
        component: PerformanceComponent,
    },
    {
        path: "improvement",
        component: ImprovementComponent,
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
        NgxDropzoneModule,
        ChartsModule,
        NgApexchartsModule,
        FuseSharedModule,
        SharedModule,
        FuseSidebarModule,
        FuseCountdownModule,
        FuseHighlightModule,
        FuseMaterialColorPickerModule,
        FuseWidgetModule,
        // NgMultiSelectDropDownModule,

        FormsModule,
        NgCircleProgressModule.forRoot({
            // set defaults here
            radius: 60,
            outerStrokeWidth: 5,
            innerStrokeWidth: 2,
            outerStrokeColor: "#f3705a",
            innerStrokeColor: "#f3705a",
            showInnerStroke: true,
            animationDuration: 300,
        }),
        NgImageSliderModule,
        RouterModule.forChild(routes),
        TranslateModule,
        MatCarouselModule,
        ChatModule,
    ],
    declarations: [
        HomeComponent,
        PoFactsheetComponent,
        PerformanceComponent,
        ImprovementComponent,
        TourComponent,
        DashboardComponent,
        ActionCenterComponent,
        PoFactServiceDialogComponent,
        CapaVendordashboardComponent,
        CapaResponseComponent,
        CapaResponseDialogComponent
    ],
    providers: [DecimalPipe],
    entryComponents: [TourComponent,PoFactServiceDialogComponent,CapaResponseDialogComponent],
})
export class PagesModule { }
