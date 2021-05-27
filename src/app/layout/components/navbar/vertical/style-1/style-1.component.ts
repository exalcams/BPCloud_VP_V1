import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation, Compiler } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { delay, filter, take, takeUntil } from 'rxjs/operators';
import { FuseConfigService } from '@fuse/services/config.service';
import { FuseNavigationService } from '@fuse/components/navigation/navigation.service';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { FuseSidebarService } from '@fuse/components/sidebar/sidebar.service';
import { AuthenticationDetails, ChangePassword } from 'app/models/master';
import { AuthService } from 'app/services/auth.service';
import { MatDialog, MatDialogConfig, MatSnackBar } from '@angular/material';
import { SnackBarStatus } from 'app/notifications/notification-snack-bar/notification-snackbar-status-enum';
import { NotificationSnackBarComponent } from 'app/notifications/notification-snack-bar/notification-snack-bar.component';
import { ChangePassDialogComponent } from 'app/layout/components/toolbar/change-pass-dialog/change-pass-dialog.component';
import * as SecureLS from 'secure-ls';
@Component({
    selector: 'navbar-vertical-style-1',
    templateUrl: './style-1.component.html',
    styleUrls: ['./style-1.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class NavbarVerticalStyle1Component implements OnInit, OnDestroy {
    fuseConfig: any;
    navigation: any;
    authenticationDetails: AuthenticationDetails;
    CurrentLoggedInUser: string;
    CurrentLoggedInUserProfile: string;
    CurrentLoggedInUserEmailAddress: string;
    isShowIcon: boolean;
    notificationSnackBarComponent: NotificationSnackBarComponent;

    // Private
    private _fusePerfectScrollbar: FusePerfectScrollbarDirective;
    private _unsubscribeAll: Subject<any>;
    SecretKey: string;
    SecureStorage: SecureLS;
    /**
     * Constructor
     *
     * @param {FuseConfigService} _fuseConfigService
     * @param {FuseNavigationService} _fuseNavigationService
     * @param {FuseSidebarService} _fuseSidebarService
     * @param {Router} _router
     */
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _fuseNavigationService: FuseNavigationService,
        private _fuseSidebarService: FuseSidebarService,
        private _router: Router,
        private _authService: AuthService,
        private _compiler: Compiler,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
    ) {
        // Set the private defaults
        this._unsubscribeAll = new Subject();
        this.CurrentLoggedInUser = 'Support';
        this.CurrentLoggedInUserEmailAddress = 'support@exalca.com';
        this.CurrentLoggedInUserProfile = 'assets/images/avatars/support.png';
        this.isShowIcon = true;
        this.notificationSnackBarComponent = new NotificationSnackBarComponent(this.snackBar);
        this.SecretKey = this._authService.SecretKey;
        this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Accessors
    // -----------------------------------------------------------------------------------------------------

    // Directive
    @ViewChild(FusePerfectScrollbarDirective)
    set directive(theDirective: FusePerfectScrollbarDirective) {
        if (!theDirective) {
            return;
        }

        this._fusePerfectScrollbar = theDirective;

        // Update the scrollbar on collapsable item toggle
        this._fuseNavigationService.onItemCollapseToggled
            .pipe(
                delay(500),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this._fusePerfectScrollbar.update();
            });

        // Scroll to the active item position
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                take(1)
            )
            .subscribe(() => {
                setTimeout(() => {
                    const activeNavItem: any = document.querySelector('navbar .nav-link.active');

                    if (activeNavItem) {
                        const activeItemOffsetTop = activeNavItem.offsetTop,
                            activeItemOffsetParentTop = activeNavItem.offsetParent.offsetTop,
                            scrollDistance = activeItemOffsetTop - activeItemOffsetParentTop - (48 * 3) - 168;

                        this._fusePerfectScrollbar.scrollToTop(scrollDistance);
                    }
                });
            }
            );
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        this._router.events
            .pipe(
                filter((event) => event instanceof NavigationEnd),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                if (this._fuseSidebarService.getSidebar('navbar')) {
                    this._fuseSidebarService.getSidebar('navbar').close();
                }
            }
            );

        // Subscribe to the config changes
        this._fuseConfigService.config
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.fuseConfig = config;
            });

        // Get current navigation
        this._fuseNavigationService.onNavigationChanged
            .pipe(
                filter(value => value !== null),
                takeUntil(this._unsubscribeAll)
            )
            .subscribe(() => {
                this.navigation = this._fuseNavigationService.getCurrentNavigation();
            });

        // Retrive authorizationData
        const retrievedObject =  this.SecureStorage.get('authorizationData');
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(retrievedObject) as AuthenticationDetails;
            this.CurrentLoggedInUser = this.authenticationDetails.DisplayName;
            this.CurrentLoggedInUserEmailAddress = this.authenticationDetails.EmailAddress;
            // if (this.authenticationDetails.profile && this.authenticationDetails.profile !== 'Empty') {
            //     this.CurrentLoggedInUserProfile = this.authenticationDetails.profile;
            // }
        }
        this._fuseSidebarService.getSidebar('navbar').toggleFold();
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
     * Toggle sidebar opened status
     */
    toggleSidebarOpened(): void {
        // console.log('Called')
        this.isShowIcon = true;
        this._fuseSidebarService.getSidebar('navbar').unfold();
    }

    /**
     * Toggle sidebar folded status
     */
    toggleSidebarFolded(): void {
        this.isShowIcon = !this.isShowIcon;
        this._fuseSidebarService.getSidebar('navbar').fold();
        // this._fuseSidebarService.getSidebar('navbar').toggleFold();
        // console.log(test.folded());
        // }
        // else{
        //     this.isShowIcon=false;
        //     this._fuseSidebarService.getSidebar('navbar').toggleFold();
        // }

    }

    logOutClick(): void {
        this._authService.SignOut(this.authenticationDetails.UserID).subscribe(
            (data) => {
                this.SecureStorage.remove('authorizationData');
                this.SecureStorage.remove('menuItemsData');
                this.SecureStorage.remove('userPreferenceData');
                this._compiler.clearCache();
                this._router.navigate(['auth/login']);
                this.notificationSnackBarComponent.openSnackBar('Signed out successfully', SnackBarStatus.success);
            },
            (err) => {
                console.error(err);
                this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
            }
        );
         this._router.navigate(['auth/login']);
        // this.notificationSnackBarComponent.openSnackBar('Signed out successfully', SnackBarStatus.success);
    }
    ChangePasswordClick(): void {
        // this._router.navigate(['auth/changePassword']);
        const dialogConfig: MatDialogConfig = {
            data: this.authenticationDetails,
            panelClass: 'change-pass-dialog'
        };
        const dialogRef = this.dialog.open(ChangePassDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(
            result => {
                if (result) {
                    const changePassword = result as ChangePassword;
                    changePassword.UserID = this.authenticationDetails.UserID;
                    changePassword.UserName = this.authenticationDetails.UserName;
                    this._authService.ChangePassword(changePassword).subscribe(
                        (res) => {
                            console.log(res);
                            this.notificationSnackBarComponent.openSnackBar('Password updated successfully, please log with new password', SnackBarStatus.success);
                            this.SecureStorage.remove('authorizationData');
                            this.SecureStorage.remove('menuItemsData');
                            this._compiler.clearCache();
                            this._router.navigate(['auth/login']);
                        }, (err) => {
                            this.notificationSnackBarComponent.openSnackBar(err instanceof Object ? 'Something went wrong' : err, SnackBarStatus.danger);
                            // this._router.navigate(['/auth/login']);
                            console.error(err);
                        }
                    );
                }
            }
        );
    }
}
