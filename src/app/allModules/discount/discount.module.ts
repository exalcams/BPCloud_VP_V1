import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MatAutocompleteModule, MatBadgeModule, MatBottomSheetModule, MatButtonModule, MatButtonToggleModule, MatCardModule, MatCheckboxModule, MatChipsModule, MatDatepickerModule, MatDialogModule, MatDividerModule, MatExpansionModule, MatFormFieldModule, MatGridListModule, MatIconModule, MatInputModule, MatListModule, MatMenuModule, MatNativeDateModule, MatPaginatorModule, MatProgressBarModule, MatProgressSpinnerModule, MatRadioModule, MatRippleModule, MatSelectModule, MatSidenavModule, MatSliderModule, MatSlideToggleModule, MatSnackBarModule, MatSortModule, MatStepperModule, MatTableModule, MatTabsModule, MatToolbarModule, MatTooltipModule, MatTreeModule } from '@angular/material';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { FuseSidebarModule, FuseCountdownModule, FuseHighlightModule, FuseMaterialColorPickerModule, FuseWidgetModule } from '@fuse/components';
import { FuseSharedModule } from '@fuse/shared.module';
import { DiscountComponent } from './Invoice-discount/discount.component';
import { BuyerDiscountComponent } from './buyer-discount/buyer-discount.component';
import { DiscountDialogueComponent } from './discount-dialogue/discount-dialogue.component';
import { DiscountService } from 'app/services/discount.service';

const routes = [
  {
    path: 'invoice-discount',
    component: DiscountComponent
  },
  {
    path: 'buyer-discount',
    component: BuyerDiscountComponent
  },
  {
    path: "**",
    redirectTo: "/auth/login",
  }
];

@NgModule({
  declarations: [
    DiscountComponent,
    BuyerDiscountComponent,
    DiscountDialogueComponent
  ],
  imports: [
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
    RouterModule.forChild(routes),
    TranslateModule
  ],
  entryComponents: [DiscountDialogueComponent],
  providers:[DiscountService]
})
export class DiscountModule { }
