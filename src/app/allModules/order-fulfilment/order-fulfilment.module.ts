import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {
  MatFormFieldModule, MatAutocompleteModule, MatBadgeModule, MatBottomSheetModule,
  MatButtonModule, MatButtonToggleModule, MatCardModule, MatCheckboxModule, MatChipsModule,
  MatStepperModule, MatDatepickerModule, MatDialogModule, MatDividerModule, MatExpansionModule,
  MatGridListModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule, MatNativeDateModule,
  MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule, MatRadioModule, MatRippleModule,
  MatSelectModule, MatSidenavModule, MatSliderModule, MatSlideToggleModule, MatSnackBarModule,
  MatSortModule, MatTableModule, MatTabsModule, MatToolbarModule, MatTooltipModule, MatTreeModule
} from '@angular/material';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule, FuseCountdownModule, FuseHighlightModule, FuseMaterialColorPickerModule, FuseWidgetModule } from '@fuse/components';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from "@ngx-translate/core";
import { ChartsModule } from "ng2-charts";
import "chartjs-plugin-labels";
import "chartjs-plugin-annotation";
import { OrderFulFilmentCenterComponent } from "./order-fulfilment-center/order-fulfilment-center.component";
import { PoSchedulesComponent } from './po-schedules/po-schedules.component';
import { ASNListComponent } from './asnlist/asnlist.component';
import { GRReceiptsComponent } from './gr-receipts/gr-receipts.component';
import { InvoiceListComponent } from './invoice-list/invoice-list.component';
import { AsnlistPrintDialogComponent } from './asnlist/asnlist-print-dialogue/asnlist-print-dialog/asnlist-print-dialog.component';
import { NgApexchartsModule } from 'ng-apexcharts';
import { ChatModule } from '../chat/chat.module';
import { SharedModule } from 'app/shared/shared-module';
import { SerListComponent } from './ser-list/ser-list.component';
import { ASNViewComponent } from './asnview/asnview.component';
const route: Routes = [
  {
    path: "orderfulfilmentCenter",
    component: OrderFulFilmentCenterComponent,
  },
  {
    path: 'poschedules',
    component: PoSchedulesComponent
  },
  {
    path: 'asnlist',
    component: ASNListComponent
  },
  {
    path: 'asnview',
    component: ASNViewComponent
  },
  {
    path: 'grReceipts',
    component: GRReceiptsComponent
  },
  {
    path: 'invoicelist',
    component: InvoiceListComponent
  },
  {
    path: 'serlist',
    component: SerListComponent
  }
];
@NgModule({
  declarations: [
    OrderFulFilmentCenterComponent,
    PoSchedulesComponent,
    ASNListComponent,
    GRReceiptsComponent,
    InvoiceListComponent,
    AsnlistPrintDialogComponent,
    SerListComponent,
    ASNViewComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(route),
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


    FuseSharedModule,
    FuseSidebarModule,

    FuseCountdownModule,
    FuseHighlightModule,
    FuseMaterialColorPickerModule,
    FuseWidgetModule,

    FormsModule,
    ChartsModule,
    TranslateModule,

    NgApexchartsModule,
    ChatModule,
    SharedModule
  ],
  entryComponents: [
    AsnlistPrintDialogComponent
  ]
})
export class OrderFulfilmentModule { }
