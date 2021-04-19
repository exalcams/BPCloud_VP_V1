import { NgModule } from "@angular/core";
import { RouterModule, Route, Routes } from "@angular/router";
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
import { ChartsModule } from "ng2-charts";
import "chartjs-plugin-labels";
import "chartjs-plugin-annotation";
import { CreationComponent } from './creation/creation.component';
import { SelectdialogComponent } from './selectdialog/selectdialog.component';
import { EngineComponent } from './engine/engine.component';
import { ResponseComponent } from './response/response.component';
import { ResponddialogComponent } from './responddialog/responddialog.component';
import { PurchaseRequisitionComponent } from './purchase-requisition/purchase-requisition.component';


// import 'chart.piecelabel.js';

const routes: Routes = [
    {
        path: 'creation',
        component: CreationComponent
    },
    {
        path: 'engine',
        component: EngineComponent
    },
    {
        path: 'response',
        component: ResponseComponent
    },
    {
        path: 'pr',
        component: PurchaseRequisitionComponent
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

        FuseSharedModule,
        FuseSidebarModule,

        FuseCountdownModule,
        FuseHighlightModule,
        FuseMaterialColorPickerModule,
        FuseWidgetModule,
        // NgMultiSelectDropDownModule,

        FormsModule,
        RouterModule.forChild(routes),
    ],
    declarations: [
        CreationComponent,
        SelectdialogComponent,
        EngineComponent,
        ResponseComponent,
        ResponddialogComponent,
        PurchaseRequisitionComponent],
    providers: [DecimalPipe],
    entryComponents: [SelectdialogComponent],
})
export class RFQModule { }
