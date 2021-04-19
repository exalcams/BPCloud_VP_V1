import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountStatementComponent } from './account-statement/account-statement.component';
import { Routes, RouterModule } from '@angular/router';
import { PayableComponent } from './payable/payable.component';
import {
  MatFormFieldModule, MatAutocompleteModule, MatBadgeModule, MatBottomSheetModule, MatButtonModule,
  MatButtonToggleModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatStepperModule,
  MatDatepickerModule, MatDialogModule, MatDividerModule, MatExpansionModule, MatGridListModule,
  MatIconModule, MatInputModule, MatListModule, MatMenuModule, MatNativeDateModule, MatPaginatorModule,
  MatProgressBarModule, MatProgressSpinnerModule, MatRadioModule, MatRippleModule, MatSelectModule,
  MatSidenavModule, MatSliderModule, MatSlideToggleModule, MatSnackBarModule, MatSortModule,
  MatTableModule, MatTabsModule, MatToolbarModule, MatTooltipModule, MatTreeModule
} from '@angular/material';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxDonutChartModule } from 'ngx-doughnut-chart';
import { ChartsModule } from "ng2-charts";
import "chartjs-plugin-labels";
import "chartjs-plugin-annotation";
// import 'chartjs-plugin-datalabels';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseSidebarModule, FuseCountdownModule, FuseHighlightModule, FuseMaterialColorPickerModule, FuseWidgetModule } from '@fuse/components';
import { FormsModule } from '@angular/forms';
import { PaymentsComponent } from './payments/payments.component';
import { TDSComponent } from './tds/tds.component';
import { PaymentComponent } from './payment.component';
const routes: Routes = [
  {
    path: "advise",
    component: PaymentComponent,
  },
  {
    path: 'payments',
    component: PaymentsComponent
  },
  {
    path: 'accountStatement',
    component: AccountStatementComponent
  },
  {
    path: 'payable',
    component: PayableComponent
  },
  {
    path: 'tds',
    component: TDSComponent
  }
];
@NgModule({
  declarations: [PaymentComponent, AccountStatementComponent, PayableComponent, PaymentsComponent, TDSComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
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

    FormsModule
  ]
})
export class PaymentModule { }
