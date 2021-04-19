import { NgModule } from '@angular/core';
import {
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatStepperModule,
    MatListModule,
    MatMenuModule,
    MatRadioModule,
    MatSidenavModule,
    MatToolbarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDatepickerModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatCheckboxModule,
    MatDialogModule
} from '@angular/material';
import { RouterModule, Routes } from '@angular/router';

import { FuseSharedModule } from '@fuse/shared.module';
import { LoginComponent } from './login/login.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { ForgetPasswordLinkDialogComponent } from './forget-password-link-dialog/forget-password-link-dialog.component';
import { ChangePasswordDialogComponent } from './change-password-dialog/change-password-dialog.component';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { SoccDialogComponent } from './socc-dialog/socc-dialog.component';
import { CookieOptions } from 'angular2-cookie/services/base-cookie-options';
import { ForgetUserIdLinkDialogComponent } from './forget-user-id-link-dialog/forget-user-id-link-dialog.component';
import { LogComponent } from './log/log.component';

// import { PdfViewerModule } from 'ng2-pdf-viewer';
// import { PdfViewerModule } from 'ng2-pdf-viewer';
const authRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'changePassword',
        component: ChangePasswordComponent
    },
    {
        path: 'log',
        component: LogComponent
    },
    {
        path: 'forgotPassword',
        component: ForgotPasswordComponent
    },
    {
        path: '**',
        redirectTo: 'login'
    }
];

@NgModule({
    declarations: [
        LoginComponent,
        ChangePasswordComponent,
        ForgotPasswordComponent,
        ChangePasswordDialogComponent,
        ForgetPasswordLinkDialogComponent,
        SoccDialogComponent,
        // ForgetUserIDLinkDialogComponent,
        ForgetUserIdLinkDialogComponent,
        LogComponent
    ],
    imports: [
        // PdfViewerModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        MatStepperModule,
        MatProgressSpinnerModule,
        MatListModule,
        MatMenuModule,
        MatRadioModule,
        MatSidenavModule,
        MatToolbarModule,
        MatTooltipModule,

        FuseSharedModule,
        MatDialogModule,
        MatCheckboxModule,

        RouterModule.forChild(authRoutes)
    ],
    providers: [
        CookieService,
        { provide: CookieOptions, useValue: {} }
    ],
    entryComponents: [
        ChangePasswordDialogComponent,
        ForgetPasswordLinkDialogComponent,
        ForgetUserIdLinkDialogComponent,
        SoccDialogComponent
    ],

})
export class AuthenticationModule {
}
