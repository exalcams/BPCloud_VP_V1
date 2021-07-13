import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
    // tslint:disable-next-line:max-line-length
    MatButtonModule, MatCardModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule,
    MatStepperModule, MatListModule, MatMenuModule, MatRadioModule, MatSidenavModule, MatToolbarModule,
    MatProgressSpinnerModule, MatTooltipModule, MatDatepickerModule, MatTableModule, MatPaginatorModule
} from '@angular/material';

import { FuseSharedModule } from '@fuse/shared.module';
import { FileUploadModule } from 'ng2-file-upload';
import { MenuAppComponent } from './menu-app/menu-app.component';
import { RoleComponent } from './role/role.component';
import { UserComponent } from './user/user.component';
import { ReasonComponent } from './reason/reason.component';
import { UserPreferencesComponent } from './user-preferences/user-preferences.component';
import { FuseMaterialColorPickerModule } from '@fuse/components';
import { ExpenseTypeComponent } from './expense-type/expense-type.component';
import { PlantMasterComponent } from './plant-master/plant-master.component';


const menuRoutes: Routes = [
    {
        path: 'menuApp',
        component: MenuAppComponent,
    },
    {
        path: 'role',
        component: RoleComponent,
    },
    {
        path: 'user',
        component: UserComponent,
    },
    {
        path: 'reason',
        component: ReasonComponent,
    },
    {
        path: 'userpreferences',
        component: UserPreferencesComponent
    },
    {
        path: 'expensetype',
        component: ExpenseTypeComponent
    },
    {
        path: 'plantMaster',
        component: PlantMasterComponent,
    }
];
@NgModule({
    declarations: [
        UserComponent,
        RoleComponent,
        MenuAppComponent,
        ReasonComponent,
        UserPreferencesComponent,
        ExpenseTypeComponent,
        PlantMasterComponent
    ],
    imports: [
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatSelectModule,
        MatDatepickerModule,
        MatTableModule,
        MatPaginatorModule,
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
        FuseMaterialColorPickerModule,
        RouterModule.forChild(menuRoutes)
    ],
    providers: [

    ]
})
export class MasterModule {
}

