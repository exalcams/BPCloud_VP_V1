import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
    // tslint:disable-next-line:max-line-length
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule,
    MatStepperModule, MatListModule, MatMenuModule, MatRadioModule, MatSidenavModule, MatToolbarModule,
    MatProgressSpinnerModule, MatTooltipModule
} from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';
import { FileUploadModule } from 'ng2-file-upload';
import { CKEditorModule } from 'ngx-ckeditor';
import { DocTypeMasterComponent } from './doc-type-master/doc-type-master.component';
import { SessionMasterComponent } from './session-master/session-master.component';
import { SupportDeskMasterComponent } from './support-desk-master/support-desk-master.component';
import { CEOMessageComponent } from './ceomessage/ceomessage.component';
import { SCOCMessageComponent } from './scocmessage/scocmessage.component';
import { AsnFieldMasterComponent } from './asn-field-master/asn-field-master.component';
import { CardUpdateComponent } from './card-update/card-update.component';
import { DataMigrationComponent } from "./data-migration/data-migration.component";
import { NgxDropzoneModule } from 'ngx-dropzone';
import { ProductsComponent } from './products/products.component';
import { CutomerWelcomeMessageComponent } from './cutomer-welcome-message/cutomer-welcome-message.component';
import { POComponent } from './po/po.component';
import { CreditLimitMasterComponent } from './credit-limit-master/credit-limit-master.component';

const menuRoutes: Routes = [
    {
        path: 'asnfield',
        component: AsnFieldMasterComponent,
    },
    {
        path: 'doctype',
        component: DocTypeMasterComponent,
    },
    {
        path: 'session',
        component: SessionMasterComponent,
    },
    {
        path: 'creditlimit',
        component: CreditLimitMasterComponent,
    },
    {
        path: 'supportmaster',
        component: SupportDeskMasterComponent
    },
    {
        path: 'ceomsg',
        component: CEOMessageComponent
    },
    {
        path: 'scocmsg',
        component: SCOCMessageComponent
    },
    {
        path: 'cardupdate',
        component: CardUpdateComponent
    },
    {
        path: "datamigration",
        component: DataMigrationComponent,
    },
    {
        path: "products",
        component: ProductsComponent,
    },
    {
        path: "welcomemsg",
        component: CutomerWelcomeMessageComponent,
    },
    {
        path: "po",
        component: POComponent,
    },
];
@NgModule({
    declarations: [
        DocTypeMasterComponent,
        SessionMasterComponent,
        SupportDeskMasterComponent,
        CEOMessageComponent,
        SCOCMessageComponent,
        AsnFieldMasterComponent,
        CardUpdateComponent,
        DataMigrationComponent,
        ProductsComponent,
        CutomerWelcomeMessageComponent,
        POComponent,
        CreditLimitMasterComponent
    ],
    imports: [
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatStepperModule,
        MatProgressSpinnerModule,
        MatListModule,
        MatMenuModule,
        MatRadioModule,
        MatSidenavModule,
        MatToolbarModule,
        MatTooltipModule,
        FuseSharedModule,
        FileUploadModule,
        CKEditorModule,
        NgxDropzoneModule,
        RouterModule.forChild(menuRoutes)
    ],
    providers: [

    ]
})
export class ConfigurationModule {
}

