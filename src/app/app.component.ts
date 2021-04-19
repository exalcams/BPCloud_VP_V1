import { Component, Inject, OnDestroy, OnInit, Compiler } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Platform } from '@angular/cdk/platform';
import { TranslateService } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { FuseConfigService } from '@fuse/services/config.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { FuseSplashScreenService } from '@fuse/services/splash-screen.service';
import { FuseTranslationLoaderService } from '@fuse/services/translation-loader.service';

import { navigation } from 'app/navigation/navigation';
import { locale as navigationEnglish } from 'app/navigation/i18n/en';
import { locale as navigationTurkish } from 'app/navigation/i18n/tr';
import { MenuUpdataionService } from './services/menu-update.service';
import { MatIconRegistry, MatSnackBar, MatDialogConfig, MatDialog } from '@angular/material';
import { DomSanitizer } from '@angular/platform-browser';
import { BnNgIdleService } from 'bn-ng-idle';
import { AuthenticationDetails, SessionMaster, UserPreference } from './models/master';
import { NotificationSnackBarComponent } from './notifications/notification-snack-bar/notification-snack-bar.component';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';
import { SnackBarStatus } from './notifications/notification-snack-bar/notification-snackbar-status-enum';
import { InformationDialogComponent } from './notifications/information-dialog/information-dialog.component';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
    fuseConfig: any;
    navigation: any;
    sessionMaster: SessionMaster;
    sessionTimeOut: number;
    isShowPopup: boolean;
    authenticationDetails: AuthenticationDetails;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    // Private
    private _unsubscribeAll: Subject<any>;

    /**
     * Constructor
     *
     * @param {DOCUMENT} document
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {FuseSplashScreenService} _fuseSplashScreenService
     * @param {FuseTranslationLoaderService} _fuseTranslationLoaderService
     * @param {Platform} _platform
     * @param {TranslateService} _translateService
     */
    constructor(
        @Inject(DOCUMENT) private document: any,
        private _fuseConfigService: FuseConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
        private _fuseSplashScreenService: FuseSplashScreenService,
        private _fuseTranslationLoaderService: FuseTranslationLoaderService,
        private _translateService: TranslateService,
        private _platform: Platform,
        private _menuUpdationService: MenuUpdataionService,
        mdIconRegistry: MatIconRegistry,
        sanitizer: DomSanitizer,
        private bnIdle: BnNgIdleService,
        public snackBar: MatSnackBar,
        private dialog: MatDialog,
        private _authService: AuthService,
        private _compiler: Compiler,
        private _router: Router,
    ) {
        this.authenticationDetails = new AuthenticationDetails();
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.sessionTimeOut = 300;
        this.isShowPopup = true;
        this.GetSessionMasterByProject();

        // Get default navigation
        this.navigation = navigation;

        // Register the navigation to the service
        this._fuseNavigationService.register('main', this.navigation);

        // Set the main navigation as our current navigation
        this._fuseNavigationService.setCurrentNavigation('main');

        // Add languages
        this._translateService.addLangs(['en', 'tr']);

        // Set the default language
        this._translateService.setDefaultLang('en');

        // Set the navigation translations
        this._fuseTranslationLoaderService.loadTranslations(navigationEnglish, navigationTurkish);

        // Use a language
        this._translateService.use('en');
        mdIconRegistry.addSvgIcon('menuIcon', sanitizer.bypassSecurityTrustResourceUrl('assets/images/menu/menu.svg'));
        mdIconRegistry.addSvgIcon('dashboardIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/dashboard.svg'));
        mdIconRegistry.addSvgIcon('receiptIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/receipt.svg'));
        mdIconRegistry.addSvgIcon('assignmentIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/assignment.svg'));
        mdIconRegistry.addSvgIcon('viewListIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/viewList.svg'));
        mdIconRegistry.addSvgIcon('accountCircleIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/accountCircle.svg'));
        mdIconRegistry.addSvgIcon('exitToAppIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/exitToApp.svg'));
        mdIconRegistry.addSvgIcon('closeIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/close.svg'));
        mdIconRegistry.addSvgIcon('infoIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/info.svg'));
        mdIconRegistry.addSvgIcon('keyboardArrowDownIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/keyboardArrowDown.svg'));
        mdIconRegistry.addSvgIcon('keyboardArrowRightIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/keyboardArrowRight.svg'));
        mdIconRegistry.addSvgIcon('addIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/add-button.svg'));
        mdIconRegistry.addSvgIcon('searchIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/search.svg'));
        mdIconRegistry.addSvgIcon('reportIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/report.svg'));
        mdIconRegistry.addSvgIcon('powerIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/power.svg'));
        mdIconRegistry.addSvgIcon('powerOffIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/powerOff.svg'));

        mdIconRegistry.addSvgIcon('addBlueIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/addBlue.svg'));

        mdIconRegistry.addSvgIcon('orderfulfilmentIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/orderfulfilment.svg'));

        mdIconRegistry.addSvgIcon('detailsIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/details.svg'));
        mdIconRegistry.addSvgIcon('asnIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/asn.svg'));
        mdIconRegistry.addSvgIcon('billIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/bill.svg'));
        mdIconRegistry.addSvgIcon('paymentIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/payment.svg'));

        mdIconRegistry.addSvgIcon('calendarIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/calendar.svg'));

        mdIconRegistry.addSvgIcon('flipIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/flip.svg'));
        mdIconRegistry.addSvgIcon('resourceIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/resource.svg'));
        mdIconRegistry.addSvgIcon('questionIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/question.svg'));
        mdIconRegistry.addSvgIcon('articleIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/article.svg'));
        mdIconRegistry.addSvgIcon('supportIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/headphoneswhite.svg'));
        mdIconRegistry.addSvgIcon('glyphIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/glyph.svg'));

        mdIconRegistry.addSvgIcon('bpCollapsedMenuIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/bpCollapsedMenu.svg'));
        mdIconRegistry.addSvgIcon('bpOpenedMenuIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/bpOpenedMenu.svg'));

        mdIconRegistry.addSvgIcon('podIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/pod.svg'));
        mdIconRegistry.addSvgIcon('menuwithdotsIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/menuwithdots.svg'));
        mdIconRegistry.addSvgIcon('paymentmethodIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/paymentmethod.svg'));
        mdIconRegistry.addSvgIcon('lookupIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/lookup.svg'));
        mdIconRegistry.addSvgIcon('returnIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/return.svg'));
        mdIconRegistry.addSvgIcon('thunderBlackIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/thunder_black.svg'));
        mdIconRegistry.addSvgIcon('purchaseIntentIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/purchaseIntent.svg'));
        mdIconRegistry.addSvgIcon('stockIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/stock.svg'));
        mdIconRegistry.addSvgIcon('settingsIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/settings.svg'));
        mdIconRegistry.addSvgIcon('CAPAIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/CAPA.svg'));

        mdIconRegistry.addSvgIcon('rfxIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/rfx.svg'));

        mdIconRegistry.addSvgIcon('unlockIcon', sanitizer.bypassSecurityTrustResourceUrl('/assets/icons/custom/whiteUnlock.svg'));

        /**
         * ------------------------------------------------------------------
         * ngxTranslate Fix Start
         * ------------------------------------------------------------------
         * If you are using a language other than the default one, i.e. Turkish in this case,
         * you may encounter an issue where some of the components are not actually being
         * translated when your app first initialized.
         *
         * This is related to ngxTranslate module and below there is a temporary fix while we
         * are moving the multi language implementation over to the Angular's core language
         * service.
         **/

        // Set the default language to 'en' and then back to 'tr'.
        // '.use' cannot be used here as ngxTranslate won't switch to a language that's already
        // been selected and there is no way to force it, so we overcome the issue by switching
        // the default language back and forth.
        /**
         setTimeout(() => {
            this._translateService.setDefaultLang('en');
            this._translateService.setDefaultLang('tr');
         });
         */

        /**
         * ------------------------------------------------------------------
         * ngxTranslate Fix End
         * ------------------------------------------------------------------
         */

        // Add is-mobile class to the body if the platform is mobile
        if (this._platform.ANDROID || this._platform.IOS) {
            this.document.body.classList.add('is-mobile');
        }

        // Set the private defaults
        this._unsubscribeAll = new Subject();
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------
    GetSessionMasterByProject(): void {
        this._authService.GetSessionMasterByProject('BPCloud_VP').subscribe(
            (data) => {
                this.sessionMaster = data as SessionMaster;
                if (this.sessionMaster && this.sessionMaster.SessionTimeOut) {
                    this.sessionTimeOut = this.sessionMaster.SessionTimeOut * 60;
                    this.InitializeNgIdleService();
                } else {
                    this.InitializeNgIdleService();
                }
            },
            (err) => {
                this.InitializeNgIdleService();
            }
        );
    }

    InitializeNgIdleService(): void {
        this.bnIdle.startWatching(this.sessionTimeOut).subscribe((res) => {
            if (res) {
                // Retrive authorizationData
                const retrievedObject = localStorage.getItem('authorizationData');
                if (retrievedObject) {
                    this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
                    this.SignoutAndExit();
                }
            }
        });
    }

    OpenInformationDialog(): void {
        const dialogConfig: MatDialogConfig = {
            data: 'Your session has expired! Please login again',
            panelClass: 'information-dialog'
        };
        const dialogRef = this.dialog.open(InformationDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
            result => {
                this._router.navigate(['auth/login']);
            },
            err => {
                this._router.navigate(['auth/login']);
            });
    }

    SignoutAndExit(): void {
        this._authService.SignOut(this.authenticationDetails.UserID).subscribe(
            (data) => {
                localStorage.removeItem('authorizationData');
                localStorage.removeItem('menuItemsData');
                this._compiler.clearCache();
                // this._router.navigate(['auth/login']);
                console.error('Your session has expired! Please login again');
                this.OpenInformationDialog();
                // this.notificationSnackBarComponent.openSnackBar('Idle timout occurred , please login again', SnackBarStatus.danger);
            },
            (err) => {
                console.error(err);
                // this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                localStorage.removeItem('authorizationData');
                localStorage.removeItem('menuItemsData');
                this._compiler.clearCache();
                // this._router.navigate(['auth/login']);
                console.error('Your session has expired! Please login again');
                this.OpenInformationDialog();
                // this.notificationSnackBarComponent.openSnackBar('Idle timout occurred , please login again', SnackBarStatus.danger);
            }
        );
    }

    /**
     * On init
     */
    ngOnInit(): void {
        // Subscribe to config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {

                this.fuseConfig = config;

                // Boxed
                if (this.fuseConfig.layout.width === 'boxed') {
                    this.document.body.classList.add('boxed');
                }
                else {
                    this.document.body.classList.remove('boxed');
                }

                // Color theme - Use normal for loop for IE11 compatibility
                for (let i = 0; i < this.document.body.classList.length; i++) {
                    const className = this.document.body.classList[i];

                    if (className.startsWith('theme-')) {
                        this.document.body.classList.remove(className);
                    }
                }

                this.document.body.classList.add(this.fuseConfig.colorTheme);
            });

        // Retrive menu items from Local Storage
        const menuItems = localStorage.getItem('menuItemsData');
        if (menuItems) {
            this.navigation = JSON.parse(menuItems);
            this._fuseNavigationService.unregister('main');
            this._fuseNavigationService.register('main', this.navigation);
            this._fuseNavigationService.setCurrentNavigation('main');
        }

        // Update the menu items on First time after log in
        this._menuUpdationService.GetAndUpdateMenus().subscribe(
            data => {
                this.navigation = data;
                this._fuseNavigationService.unregister('main');
                this._fuseNavigationService.register('main', this.navigation);
                this._fuseNavigationService.setCurrentNavigation('main');
            }
        );

        this.UpdateUserPreference();
    }

    UpdateUserPreference(): void {
        this._fuseConfigService.config
          // .pipe(takeUntil(this._unsubscribeAll))
          .subscribe((config) => {
            this.fuseConfig = config;
            // Retrive user preference from Local Storage
            const userPre = localStorage.getItem('userPreferenceData');
            if (userPre) {
              const userPrefercence: UserPreference = JSON.parse(userPre) as UserPreference;
              if (userPrefercence.NavbarPrimaryBackground && userPrefercence.NavbarPrimaryBackground !== '-') {
                this.fuseConfig.layout.navbar.primaryBackground = userPrefercence.NavbarPrimaryBackground;
              } else {
                this.fuseConfig.layout.navbar.primaryBackground = 'fuse-navy-700';
              }
              if (userPrefercence.NavbarSecondaryBackground && userPrefercence.NavbarSecondaryBackground !== '-') {
                this.fuseConfig.layout.navbar.secondaryBackground = userPrefercence.NavbarSecondaryBackground;
              } else {
                this.fuseConfig.layout.navbar.secondaryBackground = 'fuse-navy-700';
              }
              if (userPrefercence.ToolbarBackground && userPrefercence.ToolbarBackground !== '-') {
                this.fuseConfig.layout.toolbar.background = userPrefercence.ToolbarBackground;
                this.fuseConfig.layout.toolbar.customBackgroundColor = true;
              } else {
                this.fuseConfig.layout.toolbar.background = 'blue-800';
                this.fuseConfig.layout.toolbar.customBackgroundColor = true;
              }
            } else {
              this.fuseConfig.layout.navbar.primaryBackground = 'fuse-navy-700';
              this.fuseConfig.layout.navbar.secondaryBackground = 'fuse-navy-700';
              this.fuseConfig.layout.toolbar.background = 'blue-800';
              this.fuseConfig.layout.toolbar.customBackgroundColor = true;
            }
    
          });
        this._fuseConfigService.config = this.fuseConfig;
      }

    /**
     * On destroy
     */
    ngOnDestroy(): void {
        // Unsubscribe from all subscriptions
        this._unsubscribeAll.next();
        this._unsubscribeAll.complete();

    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------

    /**
     * Toggle sidebar open
     *
     * @param key
     */
    toggleSidebarOpen(key): void {
        this._fuseSidebarService.getSidebar(key).toggleOpen();
    }
}
