import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FuseSidebarModule } from '@fuse/components';

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
    MatTreeModule
} from '@angular/material';

import { NgxChartsModule } from '@swimlane/ngx-charts';
import {
    FuseCountdownModule,
    FuseHighlightModule,
    FuseMaterialColorPickerModule,
    FuseWidgetModule
} from '@fuse/components';

import { FuseSharedModule } from '@fuse/shared.module';
import { FormsModule } from '@angular/forms';
import { ChartsModule } from "ng2-charts";
import "chartjs-plugin-labels";
import "chartjs-plugin-annotation";
import { CKEditorModule } from 'ngx-ckeditor';
import { DecimalPipe } from '@angular/common';

import { AsnListComponent } from './asn-list/asn-list.component';
import { SupportDeskComponent } from './support-desk/support-desk.component';
import { SupportTicketComponent } from './support-ticket/support-ticket.component';
import { SupportChatComponent } from './support-chat/support-chat.component';
import { PoListComponent } from './po-list/po-list.component';
import { FactComponent } from './fact/fact.component';
import { GrnListComponent } from './grn-list/grn-list.component';
import { CreateCapaComponent } from './create-capa/create-capa.component';
import { CapaDashboardComponent } from './capa-dashboard/capa-dashboard.component';
import { AddvendorDialogComponent } from './addvendor-dialog/addvendor-dialog.component';
import { CapaViewComponent } from './capa-view/capa-view.component';
import { AsnlistPrintDialogComponent } from './asn-list/asnlist-print-dialogue/asnlist-print-dialog/asnlist-print-dialog.component';

const routes = [
    {
        path: 'polist',
        component: PoListComponent
    },
    {
        path: 'asnlist',
        component: AsnListComponent
    },
    {
        path: 'supportchat',
        component: SupportChatComponent
    },
    {
        path: 'supportdesk',
        component: SupportDeskComponent
    },
    {
        path: 'capa-create',
        component: CreateCapaComponent
    },
    {
        path: 'capa-dashboard',
        component: CapaDashboardComponent
    },
    {
        path: 'capa-view',
        component: CapaViewComponent
    },
    {
        path: 'supportticket',
        component: SupportTicketComponent
    },
    {
        path: 'fact',
        component: FactComponent
    },
    {
        path: 'grnlist',
        component: GrnListComponent
    },
    {
        path: '**',
        redirectTo: '/auth/login'
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routes),
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
        FuseSharedModule,
        FuseSidebarModule,
        FuseCountdownModule,
        FuseHighlightModule,
        FuseMaterialColorPickerModule,
        FuseWidgetModule,
        FormsModule,
        ChartsModule,
        CKEditorModule
    ],
    declarations: [AsnListComponent, SupportChatComponent, GrnListComponent, AsnlistPrintDialogComponent,
        SupportDeskComponent, SupportTicketComponent, PoListComponent, FactComponent, CreateCapaComponent, CapaDashboardComponent, AddvendorDialogComponent, CapaViewComponent],
    providers: [
        DecimalPipe
    ],
    entryComponents: [AddvendorDialogComponent, AsnlistPrintDialogComponent]
})
export class BuyerModule { }
