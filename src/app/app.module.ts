import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import {
    MatButtonModule, MatIconModule, MatSnackBar, MatSnackBarModule, MatDialogModule, MatToolbarModule,
    MAT_DATE_LOCALE, MatProgressSpinnerModule, MatProgressBarModule, MatExpansionModule, MatTableModule, 
    MatDatepickerModule, MatFormFieldModule, MatAutocompleteModule, MatBadgeModule, MatBottomSheetModule, 
    MatButtonToggleModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatStepperModule, MatDividerModule, 
    MatGridListModule, MatInputModule, MatListModule, MatMenuModule, MatNativeDateModule, MatPaginatorModule, 
    MatRadioModule, MatRippleModule, MatSelectModule, MatSidenavModule, MatSliderModule, MatSlideToggleModule, 
    MatSortModule, MatTabsModule, MatTooltipModule, MatTreeModule
} from '@angular/material';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import 'hammerjs';

import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import {
    FuseProgressBarModule, FuseSidebarModule, FuseThemeOptionsModule, FuseCountdownModule,
    FuseHighlightModule, FuseMaterialColorPickerModule, FuseWidgetModule
} from '@fuse/components';

import { fuseConfig } from 'app/fuse-config';

import { AppComponent } from 'app/app.component';
import { LayoutModule } from 'app/layout/layout.module';
import { NotificationSnackBarComponent } from './notifications/notification-snack-bar/notification-snack-bar.component';
import { DatePipe } from '@angular/common';
import { NotificationDialogComponent } from './notifications/notification-dialog/notification-dialog.component';
import { WINDOW_PROVIDERS } from './window.providers';
import { AuthInterceptorService } from './services/auth-interceptor.service';
import { PaymentModule } from './allModules/payment/payment.module';
import { BnNgIdleService } from 'bn-ng-idle';
import { InformationDialogComponent } from './notifications/information-dialog/information-dialog.component';
import { ASNReleaseDialogComponent } from './notifications/asnrelease-dialog/asnrelease-dialog.component';
import { FormsModule } from '@angular/forms';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { NgxDonutChartModule } from 'ngx-doughnut-chart';
// import { NgxGaugeModule } from 'ngx-gauge';
import { ChartsModule } from 'ng2-charts';
import { AttachmentViewDialogComponent } from './notifications/attachment-view-dialog/attachment-view-dialog.component';
import { AttachmentDialogComponent } from './notifications/attachment-dialog/attachment-dialog.component';
import { NotificationDialog1Component } from './notifications/notification-dialog1/notification-dialog1.component';
import { UploadInvoiceComponent } from './allModules/upload-invoice/upload-invoice.component';
import { ASNAttachmentViewDialogComponent } from './notifications/asnattachment-view-dialog/asnattachment-view-dialog.component';


// import { ASNItemBatchDialogComponent } from './allModules/asn/asnitem-batch-dialog/asnitem-batch-dialog.component';
// import { InvoiceCreationComponent } from './allModules/invoice-creation/invoice-creation.component';
// import { ChatModule } from './allModules/chat/chat.module';

const appRoutes: Routes = [
    {
        path: 'auth',
        loadChildren: './allModules/authentication/authentication.module#AuthenticationModule'
    },
    {
        path: 'pages',
        loadChildren: './allModules/pages/pages.module#PagesModule'
    },
    {
        path: 'asn',
        loadChildren: './allModules/asn/asn.module#ASNModule'
    },
    {
        path: 'poflip',
        loadChildren: './allModules/po-flip/po-flip.module#POFlipModule'
    },
    {
        path: 'invoicecreat',
        loadChildren: './allModules/invoice-creation/invoice-creation.module#InvoiceCreationModule'
    },
    {
        path: 'gate',
        loadChildren: './allModules/gate/gate.module#GateModule'
    },
    {
        path: 'orderfulfilment',
        loadChildren: './allModules/order-fulfilment/order-fulfilment.module#OrderFulfilmentModule'
    },
    {
        path: 'master',
        loadChildren: './allModules/master/master.module#MasterModule'
    },
    {
        path: 'configuration',
        loadChildren: './allModules/configurationn/configuration.module#ConfigurationModule'
    },
    {
        path: 'audit',
        loadChildren: './allModules/audit/audit.module#AuditModule'
    },
    {
        path: 'invoice',
        loadChildren: './allModules/invoice/invoice.module#InvoiceModule'
    },
    {
        path: 'uploadinvoice',
        component: UploadInvoiceComponent
    },
    // {
    //     path: 'payment',
    //     loadChildren: './allModules/payment/payment.module#PaymentModule'
    // },
    {
        path: 'fact',
        loadChildren: './allModules/fact/fact.module#FactModule'
    },
    {
        path: 'reports',
        loadChildren: './allModules/reports/reports.module#ReportsModule'
    },
    {
        path: 'customer',
        loadChildren: './allModules/customer/customer.module#CustomerModule'
    },
    {
        path: 'buyer',
        loadChildren: './allModules/buyer/buyer.module#BuyerModule'
    },
    {
        path: 'rfq',
        loadChildren: './allModules/rfq/rfq.module#RFQModule'
    },
    {
        path: 'subcon',
        loadChildren: './allModules/subcon/subcon.module#SubconModule'
    },
    {
        path: 'payment',
        loadChildren: './allModules/payment/payment.module#PaymentModule'
    },
    {
        path: 'quality',
        loadChildren: './allModules/quality/quality.module#QaulityModule'
    },
    {
        path: 'support',
        loadChildren: './allModules/support/support.module#SupportModule'
    },
    {
        path: 'expenditor',
        loadChildren: './allModules/expenditor/expenditor.module#ExpenditorModule'
    },
    {
        path: 'balanceconfirmation',
        loadChildren: './allModules/balance-confirmation/balance-confirmation.module#BalanceConfirmationModule'
    },
    {
        path: 'discount',
        loadChildren: './allModules/discount/discount.module#DiscountModule'
    },
    {
        path: '**',
        redirectTo: 'auth/login'
    }
];

@NgModule({
    declarations: [
        AppComponent,
        NotificationSnackBarComponent,
        NotificationDialogComponent,
        AttachmentDialogComponent,
        AttachmentViewDialogComponent,
        InformationDialogComponent,
        ASNReleaseDialogComponent,
        NotificationDialog1Component,
        UploadInvoiceComponent,
        ASNAttachmentViewDialogComponent
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        RouterModule.forRoot(appRoutes, { preloadingStrategy: PreloadAllModules, useHash: true }),

        TranslateModule.forRoot(),
        // NgMultiSelectDropDownModule.forRoot(),


        // Material moment date module
        MatMomentDateModule,
        // Material
        MatButtonModule,
        MatIconModule,
        MatSnackBarModule,
        MatDialogModule,
        MatToolbarModule,
        MatExpansionModule,

        // Fuse modules
        FuseModule.forRoot(fuseConfig),
        FuseProgressBarModule,
        FuseSharedModule,
        FuseSidebarModule,
        FuseThemeOptionsModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatTableModule,
        MatDatepickerModule,
        // App modules
        LayoutModule,
        PaymentModule,
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
        // NgxGaugeModule,

        ChartsModule,

        FuseSharedModule,
        FuseSidebarModule,

        FuseCountdownModule,
        FuseHighlightModule,
        FuseMaterialColorPickerModule,
        FuseWidgetModule,
        // NgMultiSelectDropDownModule,

 
        FormsModule,
        // ElementModule
        // AuditModule,
        // ChatModule,
        // BalanceConfirmationModule
    ],
    // schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [
        DatePipe,
        WINDOW_PROVIDERS,
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptorService, multi: true },
        { provide: MAT_DATE_LOCALE, useValue: 'en-IN' },
        BnNgIdleService,
        TranslateService
    ],
    bootstrap: [
        AppComponent
    ],
    entryComponents: [
        NotificationDialogComponent,
        NotificationDialog1Component,
        AttachmentDialogComponent,
        AttachmentViewDialogComponent,
        InformationDialogComponent,
        ASNReleaseDialogComponent,
        ASNAttachmentViewDialogComponent
    ]
})
export class AppModule {
}
