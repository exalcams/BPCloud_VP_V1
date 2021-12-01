import {
    Component,
    OnInit,
    ViewEncapsulation,
    OnDestroy,
    Compiler,
} from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { FuseConfigService } from "@fuse/services/config.service";
import { fuseAnimations } from "@fuse/animations";
import { Subject } from "rxjs";
import { Router } from "@angular/router";
import { AuthService } from "app/services/auth.service";
import { MatDialog, MatSnackBar, MatDialogConfig } from "@angular/material";
import { NotificationSnackBarComponent } from "app/notifications/notification-snack-bar/notification-snack-bar.component";
import { SnackBarStatus } from "app/notifications/notification-snack-bar/notification-snackbar-status-enum";
import { FuseNavigation } from "@fuse/types";
import { MenuUpdataionService } from "app/services/menu-update.service";
import {
    AuthenticationDetails,
    ChangePassword,
    EMailModel,
    UserPreference,
} from "app/models/master";
import { ChangePasswordDialogComponent } from "../change-password-dialog/change-password-dialog.component";
import { ForgetPasswordLinkDialogComponent } from "../forget-password-link-dialog/forget-password-link-dialog.component";
import { Guid } from "guid-typescript";
import { SoccDialogComponent } from '../socc-dialog/socc-dialog.component';
import { CookieService } from 'angular2-cookie/services/cookies.service';
import { LoginService } from 'app/services/login.service';
import { ForgetUserIdLinkDialogComponent } from "../forget-user-id-link-dialog/forget-user-id-link-dialog.component";
import { FactService } from "app/services/fact.service";
import { BPCFact } from "app/models/fact";
import * as SecureLS from 'secure-ls';
@Component({
    selector: "login",
    templateUrl: "./login.component.html",
    styleUrls: ["./login.component.scss"],
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
})
export class LoginComponent implements OnInit {
    loginForm: FormGroup;
    navigation: FuseNavigation[] = [];
    authenticationDetails: AuthenticationDetails;
    menuItems: string[] = [];
    children: FuseNavigation[] = [];
    subChildren: FuseNavigation[] = [];
    orderFulfilmentSubChildren: FuseNavigation[] = [];
    PurchaseSubChildren: FuseNavigation[] = [];
    ReturnSubChildren: FuseNavigation[] = [];
    gateSubChildren: FuseNavigation[] = [];
    qualitySubChildren: FuseNavigation[] = [];
    subconSubChildren: FuseNavigation[] = [];
    supportSubChildren: FuseNavigation[] = [];
    paymentSubChildren: FuseNavigation[] = [];
    configSubChildren: FuseNavigation[] = [];
    customerOrderFulfilmentSubChildren: FuseNavigation[] = [];
    customerSupportSubChildren: FuseNavigation[] = [];
    buyerSupportSubChildren: FuseNavigation[] = [];
    VendorCAPASubChildren: FuseNavigation[] = [];
    buyerCAPASubChildren: FuseNavigation[] = [];
    buyerReportChildren: FuseNavigation[] = [];
    rfqSubChildren: FuseNavigation[] = [];
    private _unsubscribeAll: Subject<any>;
    message = "Snack Bar opened.";
    actionButtonLabel = "Retry";
    action = true;
    setAutoHide = true;
    autoHide = 2000;
    addExtraClass: false;
    notificationSnackBarComponent: NotificationSnackBarComponent;
    isProgressBarVisibile: boolean;
    setIntervalID: any;
    currentIndex: number;
    cookieLength: string[] = [];
    allTexts: string[] = [];
    currentText: string;
    fuseConfig: any;
    Username = "";
    messages = [
        "Partner Collaboration",
        "Order fulfilment",
        "Payment Tracking",
        "Shipment Tracking",
        "Document Collection",
        "Digital Signature",
        "Payment Gateway",
        "RFQ process",
    ];
    currentMessage = 0;
    SecretKey: string;
    SecureStorage: SecureLS;
    public screenWidth: any;
    public screenHeight: any;
    constructor(
        private _fuseConfigService: FuseConfigService,
        private _formBuilder: FormBuilder,
        private _router: Router,
        private _authService: AuthService,
        private _factService: FactService,
        private _menuUpdationService: MenuUpdataionService,
        private _compiler: Compiler,
        // private _loginService: LoginService,
        public dialog: MatDialog,
        public snackBar: MatSnackBar,
        private _cookieService: CookieService
    ) {
        this.SecretKey = this._authService.SecretKey;
        this.SecureStorage = new SecureLS({ encodingType: 'des', isCompression: true, encryptionSecret: this.SecretKey });
        this.SecureStorage.remove("authorizationData");
        this.SecureStorage.remove("menuItemsData");
        this.SecureStorage.remove("userPreferenceData");
        // localStorage.removeItem("authorizationData");
        // localStorage.removeItem("menuItemsData");
        // localStorage.removeItem("userPreferenceData");
        this._compiler.clearCache();

        this._fuseConfigService.config = {
            layout: {
                navbar: {
                    hidden: true,
                },
                toolbar: {
                    hidden: true,
                },
                footer: {
                    hidden: true,
                },
                sidepanel: {
                    hidden: true,
                },
            },
        };

        this.notificationSnackBarComponent = new NotificationSnackBarComponent(
            this.snackBar
        );
        this.isProgressBarVisibile = false;
        this.currentIndex = 0;
        this.allTexts = ["Scalability", "Reliability"];
    }

    ngOnInit(): void {
        this.typeMessage();

        this.loginForm = this._formBuilder.group({
            userName: ["", Validators.required],
            password: ["", Validators.required],
        });

        if (undefined !== this._cookieService.get("key")) {
            this.Username = this._cookieService.get("key");
        }
        // this._cookieService.put("Userid", "Starsb");
        // this.setCurrentText();
        // this.setIntervalID = setInterval(() => {
        //     this.setCurrentText();
        // }, 2000);
        this.screenWidth = window.innerWidth;
        this.screenHeight = window.innerHeight;
    }

    setCurrentText(): void {
        if (this.currentIndex >= this.allTexts.length) {
            this.currentIndex = 0;
        }
        this.currentText = this.allTexts[this.currentIndex];
        this.currentIndex++;
    }

    loginClicked(): void {
        if (this.loginForm.valid) {
            this.isProgressBarVisibile = true;
            // console.log(new Date().getTimezoneOffset());
            this._authService
                .login(
                    this.loginForm.get("userName").value,
                    this.loginForm.get("password").value
                )
                .subscribe(
                    (data) => {
                        this._authService
                            .GetUserPreferenceByUserID(data.UserID as Guid)
                            .subscribe((data1) => {
                                let userPre = data1 as UserPreference;
                                // console.log(userPre);
                                if (!userPre) {
                                    userPre = new UserPreference();
                                    userPre.NavbarPrimaryBackground =
                                        "theme-primaryBackground";
                                    userPre.NavbarSecondaryBackground =
                                        "theme-secondaryBackground";
                                    userPre.ToolbarBackground = "theme-toolBar ";
                                }
                                this.SecureStorage.set(
                                    "userPreferenceData",
                                    JSON.stringify(userPre)
                                );
                                // console.log(userPre.ToolbarBackground);
                                this.UpdateUserPreference();
                            });
                        this.isProgressBarVisibile = false;
                        const dat = data as AuthenticationDetails;
                        if (data.isChangePasswordRequired === "Yes") {
                            this.notificationSnackBarComponent.openSnackBar(data.ReasonForReset, SnackBarStatus.danger);
                            this.openChangePasswordDialog(dat);
                        } else {
                            this.saveUserDetails(dat);
                        }
                        this._cookieService.put("key", this.Username);
                    },
                    (err) => {
                        this.isProgressBarVisibile = false;
                        console.error(err);
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                    }
                );
        } else {
            Object.keys(this.loginForm.controls).forEach((key) => {
                const abstractControl = this.loginForm.get(key);
                abstractControl.markAsDirty();
            });
        }
    }

    UpdateUserPreference(): void {
        this._fuseConfigService.config
            //   .pipe(takeUntil(this._unsubscribeAll))
            .subscribe((config) => {
                this.fuseConfig = config;
                // Retrive user preference from Local Storage
                const userPre = this.SecureStorage.get("userPreferenceData");
                if (userPre) {
                    const userPrefercence: UserPreference = JSON.parse(
                        userPre
                    ) as UserPreference;
                    if (
                        userPrefercence.NavbarPrimaryBackground &&
                        userPrefercence.NavbarPrimaryBackground !== "-"
                    ) {
                        this.fuseConfig.layout.navbar.primaryBackground =
                            userPrefercence.NavbarPrimaryBackground;
                    } else {
                        this.fuseConfig.layout.navbar.primaryBackground =
                            "theme-primaryBackground";
                    }
                    if (
                        userPrefercence.NavbarSecondaryBackground &&
                        userPrefercence.NavbarSecondaryBackground !== "-"
                    ) {
                        this.fuseConfig.layout.navbar.secondaryBackground =
                            userPrefercence.NavbarSecondaryBackground;
                    } else {
                        this.fuseConfig.layout.navbar.secondaryBackground =
                            "theme-secondaryBackground";
                    }
                    if (
                        userPrefercence.ToolbarBackground &&
                        userPrefercence.ToolbarBackground !== "-"
                    ) {
                        this.fuseConfig.layout.toolbar.background =
                            userPrefercence.ToolbarBackground;
                        this.fuseConfig.layout.toolbar.customBackgroundColor = true;
                    } else {
                        this.fuseConfig.layout.toolbar.background = "theme-toolBar";
                        this.fuseConfig.layout.toolbar.customBackgroundColor = true;
                    }
                } else {
                    this.fuseConfig.layout.navbar.primaryBackground =
                        "theme-primaryBackground";
                    this.fuseConfig.layout.navbar.secondaryBackground =
                        "theme-secondaryBackground";
                    this.fuseConfig.layout.toolbar.background = "theme-toolBar";
                    this.fuseConfig.layout.toolbar.customBackgroundColor = true;
                }
            });
        this._fuseConfigService.config = this.fuseConfig;
    }

    saveUserDetails(data: AuthenticationDetails): void {
        this.SecureStorage.set("authorizationData", JSON.stringify(data));
        this.updateMenu();
        this.notificationSnackBarComponent.openSnackBar(
            "Logged in successfully",
            SnackBarStatus.success
        );
        // if (data.userRole === 'Administrator') {
        //   this._router.navigate(['master/user']);
        // } else {
        //   this._router.navigate(['pages/dashboard']);
        // }
        if (data.UserRole === "Customer") {
            this._router.navigate(["customer/home"]);
        } else if (data.UserRole === "Administrator") {
            // this._router.navigate(["configuration/datamigration"]);
            this._router.navigate(["auth/log"]);
        } else if (data.UserRole === "HelpDeskAdmin") {
            this._router.navigate(["support/supportdesk"]);
        } else if (data.UserRole === "CustomerHelpDeskAdmin") {
            this._router.navigate(["customer/supportdesk"]);
        } else if (data.UserRole === "Buyer") {
            this._router.navigate(["buyer/polist"]);
        } else if (data.UserRole === "GateUser") {
            this._router.navigate(["orderfulfilment/asnlist"]);
        }
        else if (data.UserRole === "Expenditor") {
            this._router.navigate(["expenditor/dashboard"]);
        }
        else {
            this._router.navigate(["pages/home"]);
        }
    }

    openChangePasswordDialog(data: AuthenticationDetails): void {
        const dialogConfig: MatDialogConfig = {
            data: data,
            panelClass: "change-password-dialog",
        };
        const dialogRef = this.dialog.open(
            ChangePasswordDialogComponent,
            dialogConfig
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                const changePassword = result as ChangePassword;
                changePassword.UserID = data.UserID;
                changePassword.UserName = data.UserName;
                this._authService.ChangePassword(changePassword).subscribe(
                    (res) => {
                        if (res != null) {
                            this.notificationSnackBarComponent.openSnackBar('Password updated successfully, please log with new password', SnackBarStatus.success);
                        } else {
                            this.notificationSnackBarComponent.openSnackBar('Password Should Not Be Same As Previous 5 Passwords', SnackBarStatus.danger);
                        }
                        this._router.navigate(["/auth/login"]);
                    },
                    (err) => {
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                        this._router.navigate(["/auth/login"]);
                        console.error(err);
                    }
                );
            }
        });
    }

    openForgetPasswordLinkDialog(): void {
        const dialogConfig: MatDialogConfig = {
            data: null,
            panelClass: "forget-password-link-dialog",
        };
        const dialogRef = this.dialog.open(
            ForgetPasswordLinkDialogComponent,
            dialogConfig
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                const emailModel = result as EMailModel;
                this.isProgressBarVisibile = true;
                this._authService.SendResetLinkToMail(emailModel).subscribe(
                    (data) => {
                        const res = data as string;
                        // this.notificationSnackBarComponent.openSnackBar(
                        //     res,
                        //     SnackBarStatus.success
                        // );
                        this.notificationSnackBarComponent.openSnackBar(`Reset password link sent successfully to registered mail address`, SnackBarStatus.success);
                        // this.ResetControl();
                        this.isProgressBarVisibile = false;
                        // this._router.navigate(['auth/login']);
                    },
                    (err) => {
                        console.error(err);
                        this.isProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                        console.error(err);
                    }
                );
            }
        });
    }

    openForgetUserIDLinkDialog(): void {
        const dialogConfig: MatDialogConfig = {
            data: null,
            panelClass: "forget-userid-link-dialog",
        };
        const dialogRef = this.dialog.open(
            ForgetUserIdLinkDialogComponent,
            dialogConfig
        );
        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                const taxNumber = result as string;
                this.isProgressBarVisibile = true;
                this._factService.FindFactByTaxNumber(taxNumber).subscribe(
                    (data) => {
                        const res = data as BPCFact;
                        if (res && res.PatnerID) {
                            this.notificationSnackBarComponent.openSnackBar(
                                `User ID ${res.PatnerID} found`,
                                SnackBarStatus.success
                            );
                            this.loginForm.get('userName').patchValue(res.PatnerID);
                        }
                        this.isProgressBarVisibile = false;
                        // this._router.navigate(['auth/login']);
                    },
                    (err) => {
                        console.error(err);
                        this.isProgressBarVisibile = false;
                        this.notificationSnackBarComponent.openSnackBar(
                            err instanceof Object
                                ? "Something went wrong"
                                : err,
                            SnackBarStatus.danger
                        );
                        console.error(err);
                    }
                );
            }
        });
    }

    updateMenu(): void {
        const retrievedObject = this.SecureStorage.get("authorizationData");
        if (retrievedObject) {
            this.authenticationDetails = JSON.parse(
                retrievedObject
            ) as AuthenticationDetails;
            this.menuItems = this.authenticationDetails.MenuItemNames.split(
                ","
            );
        } else {
        }
        if (this.menuItems.indexOf("Home") >= 0) {
            this.children.push({
                id: "home",
                title: "Home",
                translate: "NAV.VENDOR.DASHBOARD",
                type: "item",
                icon: "home",
                // isSvgIcon: true,
                // icon: 'dashboard',
                url: "/pages/home",
            });
        }
        if (this.menuItems.indexOf("Dashboard") >= 0) {
            this.children.push({
                id: "dashboard",
                title: "Dashboard",
                translate: "NAV.VENDOR.DASHBOARD",
                type: "item",
                icon: "dashboardIcon",
                isSvgIcon: true,
                // icon: 'dashboard',
                url: "/pages/dashboard",
            });
        }
        if (this.menuItems.indexOf("Action Center") >= 0) {
            this.children.push({
                id: "Action Center",
                title: "Action Center",
                translate: "Action Center",
                type: "item",
                icon: "receipt",
                // isSvgIcon: true,
                // icon: 'dashboard',
                url: "/pages/actioncenter",
            });
        }
        this.GetVendorMenus();
        this.GetCustomerMenus();
        this.GetBuyerMenus();
        this.GetAdminMenus();
        this.GetExpenditorMenus();
        // this.GetCustomerMenus();
        // this.GetAdminMenus();

        if (this.menuItems.indexOf("Improvement") >= 0) {
            this.children.push({
                id: "improvement",
                title: "Improvement",
                translate: "NAV.VENDOR.IMPROVEMENT",
                type: "item",
                icon: "flipIcon",
                isSvgIcon: true,
                // icon: 'dashboard',
                url: "/pages/improvement",
            });
        }

        if (this.menuItems.indexOf("UserPreferences") >= 0) {
            this.children.push({
                id: "userpreferences",
                title: "User Preferences",
                type: "item",
                icon: "settingsIcon",
                isSvgIcon: true,
                url: "/master/userpreferences",
            });
        }
        // if (this.menuItems.indexOf("GRReceipts") >= 0) {
        //     this.qualitySubChildren.push({
        //         id: "grReceipts",
        //         title: "GR Receipts",
        //         translate: "NAV.VENDOR.GR_RECEIPTS",
        //         type: "item",
        //         url: "/orderfulfilment/grReceipts",
        //     });
        // }

        // if (this.menuItems.indexOf("GRReceipts") >= 0) {
        //     this.qualitySubChildren.push({
        //         id: "grReceipts",
        //         title: "GR Receipts",
        //         translate: "NAV.VENDOR.GR_RECEIPTS",
        //         type: "item",
        //         url: "/orderfulfilment/grReceipts",
        //     });
        // }

        this.navigation.push({
            id: "applications",
            title: "",
            translate: "NAV.APPLICATIONS",
            type: "group",
            children: this.children,
        });
        // Saving local Storage
        this.SecureStorage.set("menuItemsData", JSON.stringify(this.navigation));
        // Update the service in order to update menu
        this._menuUpdationService.PushNewMenus(this.navigation);
    }

    GetOrderFulfilmetMenus(): void {
        if (this.menuItems.indexOf("OrderFulFilmentCenter") >= 0) {
            this.orderFulfilmentSubChildren.push({
                id: "fulfilmentCenter",
                title: "Fulfilment Center",
                translate: "NAV.VENDOR.FULFILMENT_CENTER",
                type: "item",
                url: "/orderfulfilment/orderfulfilmentCenter",
            });
        }

        if (this.menuItems.indexOf("MaterialOrderfulfilment") >= 0) {
            this.orderFulfilmentSubChildren.push({
                id: "materialFulfilmentCenter",
                title: "Fulfilment Center by Material",
                translate: "NAV.VENDOR.FULFILMENT_CENTER",
                type: "item",
                url: "/orderfulfilment/materialOrderfulfilment",
            });
        }

        // this.orderFulfilmentSubChildren.push({
        //     id: "poschedules",
        //     title: "PO Schedules",
        //     translate: "NAV.VENDOR.FULFILMENT_CENTER",
        //     type: "item",
        //     url: "/orderfulfilment/poschedules",
        // });

        if (this.menuItems.indexOf("ASN") >= 0) {
            this.orderFulfilmentSubChildren.push({
                id: "asn",
                title: "ASN / SCN",
                translate: "NAV.VENDOR.ASN",
                type: "item",
                url: "/asn",
            });
        }
        if (this.menuItems.indexOf("ASNList") >= 0) {
            this.orderFulfilmentSubChildren.push({
                id: "asnlist",
                title: "ASN / SCN List",
                translate: "NAV.VENDOR.FULFILMENT_CENTER",
                type: "item",
                url: "/orderfulfilment/asnlist",
            });
        }
        if (this.menuItems.indexOf("GRReceipts") >= 0) {
            this.orderFulfilmentSubChildren.push({
                id: "grnlist",
                title: "GRN List",
                translate: "NAV.VENDOR.FULFILMENT_CENTER",
                type: "item",
                url: "/orderfulfilment/grReceipts",
            });
        }
        if (this.menuItems.indexOf("Invoice") >= 0) {
            this.orderFulfilmentSubChildren.push({
                id: "invoicelist",
                title: "Invoice List",
                translate: "NAV.VENDOR.FULFILMENT_CENTER",
                type: "item",
                url: "/invoice",
            });
        }
        // if (this.menuItems.indexOf("Invoice") >= 0) {
        //     this.paymentSubChildren.push({
        //         id: "invoice",
        //         title: "Invoice",
        //         translate: "NAV.VENDOR.INVOICE",
        //         type: "item",

        //         url: "/invoice",
        //     });
        // }
        if (this.menuItems.indexOf("SERList") >= 0) {
            this.orderFulfilmentSubChildren.push({
                id: "serlist",
                title: "SER List",
                translate: "NAV.VENDOR.FULFILMENT_CENTER",
                type: "item",
                url: "/orderfulfilment/serlist",
            });
        }

        if (this.menuItems.indexOf("OrderFulFilmentCenter") >= 0 || this.menuItems.indexOf("ASNList") >= 0 || this.menuItems.indexOf("GRReceipts") >= 0) {
            this.children.push({
                id: "orderfulfilmentCenter",
                title: "Order Fulfilment",
                translate: "NAV.VENDOR.ORDER_FULFILMENT",
                type: "collapsable",
                icon: "orderfulfilmentIcon",
                isSvgIcon: true,
                // icon: 'dashboard',
                children: this.orderFulfilmentSubChildren,
            });
        }
    }

    GetGateMenus(): void {
        if (this.menuItems.indexOf("GateEntry") >= 0) {
            this.gateSubChildren.push({
                id: "gateentry",
                title: "Gate Entry",
                translate: "NAV.VENDOR.FULFILMENT_CENTER",
                type: "item",
                url: "/gate/gateentry",
            });
        }
        if (this.menuItems.indexOf("VehicleTurnaround") >= 0) {
            this.gateSubChildren.push({
                id: "vehicleturn",
                title: "Vehicle Turnaround",
                translate: "NAV.VENDOR.FULFILMENT_CENTER",
                type: "item",
                url: "/gate/vehicleturn",
            });
        }

        if (this.menuItems.indexOf("HoveringVehicles") >= 0) {
            this.gateSubChildren.push({
                id: "hoveringvehicles",
                title: "Hovering Vehicles",
                translate: "NAV.VENDOR.FULFILMENT_CENTER",
                type: "item",
                url: "/gate/hoveringvehicle",
            });
        }
        if (
            this.menuItems.indexOf("GateEntry") >= 0 ||
            this.menuItems.indexOf("VehicleTurnaround") >= 0 ||
            this.menuItems.indexOf("HoveringVehicles") >= 0
        ) {
            this.children.push({
                id: "gate",
                title: "Gate",
                translate: "NAV.VENDOR.ORDER_FULFILMENT",
                type: "collapsable",
                icon: "commute",
                // isSvgIcon: true,
                // icon: 'dashboard',
                children: this.gateSubChildren,
            });
        }
    }

    GetQualityMenus(): void {
        if (this.menuItems.indexOf("Overview") >= 0) {
            this.qualitySubChildren.push({
                id: "overview",
                title: "Rejections",
                translate: "NAV.VENDOR.OVERVIEW",
                type: "item",
                url: "/quality/overview",
            });
        }

        if (this.menuItems.indexOf("PPM") >= 0) {
            this.qualitySubChildren.push({
                id: "ppm",
                title: "PPM",
                translate: "NAV.VENDOR.PPM",
                type: "item",
                url: "/quality/ppm",
            });
        }
        if (this.menuItems.indexOf("DOL") >= 0) {
            this.qualitySubChildren.push({
                id: "dol",
                title: "DOL",
                translate: "NAV.VENDOR.DOL",
                type: "item",
                url: "/quality/dol",
            });
        }
        if (this.menuItems.indexOf("InspectionPlan") >= 0) {
            this.qualitySubChildren.push({
                id: "inspectionPlan",
                title: "Inspection Plan",
                translate: "NAV.VENDOR.INSPECTION_PLAN",
                type: "item",
                url: "/quality/inspectionPlan",
            });
        }
        if (this.menuItems.indexOf("VendorRating") >= 0) {
            this.qualitySubChildren.push({
                id: "vendorRating",
                title: "Vendor Rating",
                translate: "NAV.VENDOR.VENDOR_RATING",
                type: "item",
                url: "/quality/vendorRating",
            });
        }

        if (
            this.menuItems.indexOf("PPM") >= 0 ||
            this.menuItems.indexOf("DOL") >= 0 ||
            this.menuItems.indexOf("VendorRating") >= 0 ||
            this.menuItems.indexOf("Overview") >= 0 ||
            this.menuItems.indexOf("InspectionPlan") >= 0
        ) {
            this.children.push({
                id: "quality",
                title: "Quality",
                translate: "NAV.VENDOR.REPORTS",
                type: "collapsable",
                icon: "reportIcon",
                isSvgIcon: true,
                // icon: 'view_list',
                children: this.qualitySubChildren,
            });
        }
    }

    GetSubconMenus(): void {
        if (this.menuItems.indexOf("FGChildPartStock") >= 0) {
            this.subconSubChildren.push({
                id: "fgChildPartStock",
                title: "FG Child Part Stock",
                translate: "NAV.VENDOR.FG_CHILD_PART_STOCK",
                type: "item",
                url: "/subcon/fgChildPartStock",
            });
        }

        if (this.menuItems.indexOf("FGChildPartStock") >= 0) {
            this.children.push({
                id: "subcon",
                title: "Subcon",
                translate: "NAV.VENDOR.PAYMENT",
                type: "collapsable",
                icon: "stockIcon",
                isSvgIcon: true,
                // icon: 'view_list',
                children: this.subconSubChildren,
            });
        }
    }

    GetPaymentMenus(): void {
        console.log("test");
        if (this.menuItems.indexOf("Flip") >= 0) {
            this.paymentSubChildren.push({
                id: "flip",
                title: "PO Flip",
                translate: "NAV.VENDOR.PO_FLIP",
                type: "item",
                url: "/poflip",
            });
        }
        if (this.menuItems.indexOf("UploadInvoice") >= 0) {
            this.paymentSubChildren.push({
                id: "uploadinvoice",
                title: "Upload Invoice",
                translate: "NAV.VENDOR.UPLOADINVOICE",
                type: "item",
                url: "/uploadinvoice",
            });
        }
        if (this.menuItems.indexOf("AccountStatement") >= 0) {
            this.paymentSubChildren.push({
                id: "accountStatement",
                title: "Account Statement",
                translate: "NAV.VENDOR.ACCOUNT_STATEMENT",
                type: "item",
                url: "/payment/accountStatement",
            });
        }
        if (this.menuItems.indexOf("Payable") >= 0) {
            this.paymentSubChildren.push({
                id: "payable",
                title: "Payables",
                translate: "NAV.VENDOR.PAYABLES",
                type: "item",
                url: "/payment/payable",
            });
        }
        if (this.menuItems.indexOf("Payments") >= 0) {
            this.paymentSubChildren.push({
                id: "payments",
                title: "Payments",
                translate: "NAV.VENDOR.PAYMENTS",
                type: "item",
                url: "/payment/payments",
            });
        }
        if (this.menuItems.indexOf("Payment") >= 0) {
            this.paymentSubChildren.push({
                id: "payment",
                title: "Payment Advise",
                translate: "NAV.VENDOR.PAYMENT_ADVISE",
                type: "item",
                url: "/payment/advise",
            });
        }
        if (this.menuItems.indexOf("TDS") >= 0) {
            this.paymentSubChildren.push({
                id: "tds",
                title: "TDS",
                translate: "NAV.VENDOR.TDS",
                type: "item",
                url: "/payment/tds",
            });
        }
        if (this.menuItems.indexOf("BalanceConfirmation") >= 0) {
            this.paymentSubChildren.push({
                id: "balanceconfirmation",
                title: "Balance Confirmation",
                translate: "NAV.VENDOR.TDS",
                type: "item",
                url: "/balanceconfirmation",
            });
        }

        if (this.menuItems.indexOf("InvoiceDiscount") >= 0) {
            this.paymentSubChildren.push({
                id: "InvoiceDiscount",
                title: "Invoice Discount",
                translate: "NAV.VENDOR.TDS",
                type: "item",
                url: "/discount/invoice-discount",
            });
        }

        if (
            this.menuItems.indexOf("Flip") >= 0 ||
            this.menuItems.indexOf("Payments") >= 0 ||
            this.menuItems.indexOf("Payable") >= 0 ||
            this.menuItems.indexOf("AccountStatement") >= 0 ||
            this.menuItems.indexOf("TDS") >= 0 ||
            this.menuItems.indexOf("Payment") >= 0 ||
            this.menuItems.indexOf("InvoiceDiscount") >= 0
        ) {
            this.children.push({
                id: "master",
                title: "Payment",
                translate: "NAV.VENDOR.PAYMENT",
                type: "collapsable",
                icon: "paymentmethodIcon",
                isSvgIcon: true,
                // icon: 'view_list',
                children: this.paymentSubChildren,
            });
        }

        // VendorCAPA
        if (this.menuItems.indexOf("CAPAVendorDashboard") >= 0) {
            this.VendorCAPASubChildren.push({
                id: "CAPAVendorDashboard",
                title: "Dashboard",
                translate: "NAV.VENDOR.CAPAVendorDashboard",
                type: "item",
                url: "/pages/capa-dashboard",
            });
        }

        if (
            this.menuItems.indexOf("CAPAVendorDashboard") >= 0) {
            this.children.push({
                id: "CAPA",
                title: "CAPA",
                translate: "NAV.VENDOR.CAPA",
                type: "collapsable",
                icon: "CAPAIcon",
                isSvgIcon: true,
                // icon: 'view_list',
                children: this.VendorCAPASubChildren,
            });
        }
    }

    GetSupportMenus(): void {
        if (this.menuItems.indexOf("SupportDesk") >= 0) {
            this.supportSubChildren.push({
                id: "supportdesk",
                title: "Get Solved",
                translate: "NAV.VENDOR.GET_SUPPORT",
                type: "item",
                url: "/support/supportdesk",
            });
        }

        if (this.menuItems.indexOf("Declaration") >= 0) {
            this.supportSubChildren.push({
                id: "declaration",
                title: "Declaration",
                translate: "NAV.VENDOR.GET_SUPPORT",
                type: "item",
                url: "/support/declaration",
            });
        }

        if (this.menuItems.indexOf("Resource") >= 0) {
            this.supportSubChildren.push({
                id: "resource",
                title: "Resource",
                translate: "NAV.VENDOR.RESOURCE",
                type: "item",
                url: "/support/resource",
            });
        }
        if (this.menuItems.indexOf("Fact") >= 0) {
            this.supportSubChildren.push({
                id: "fact",
                title: "My Details",
                translate: "NAV.VENDOR.MY_DETAILS",
                type: "item",
                // icon: 'dashboard',
                url: "/fact",
            });
        }
        if (
            this.menuItems.indexOf("SupportDesk") >= 0 ||
            this.menuItems.indexOf("Resource") >= 0 ||
            this.menuItems.indexOf("Fact") >= 0
        ) {
            this.children.push({
                id: "master",
                title: "Support",
                translate: "NAV.VENDOR.SUPPORT",
                type: "collapsable",
                icon: "supportIcon",
                isSvgIcon: true,
                // icon: 'view_list',
                children: this.supportSubChildren,
            });
        }
    }

    GetVendorMenus(): void {
        this.GetOrderFulfilmetMenus();
        this.GetGateMenus();
        this.GetQualityMenus();
        this.GetSubconMenus();
        this.GetPaymentMenus();
        this.GetRFQMenus();
        this.GetSupportMenus();
    }
    //
    GetCustomerMenus(): void {

        if (this.menuItems.indexOf("customerhome") >= 0) {
            this.children.push({
                id: "custhome",
                title: "Home",
                translate: "NAV.CUSTOMER.DASHBOARD",
                type: "item",
                icon: "home",
                // isSvgIcon: true,
                // icon: 'dashboard',
                url: "/customer/home",
            });
        }

        if (this.menuItems.indexOf("CustomerDashboard") >= 0) {
            this.children.push({
                id: "custdashboard",
                title: "Dashboard",
                translate: "NAV.CUSTOMER.DASHBOARD",
                type: "item",
                icon: "dashboardIcon",
                isSvgIcon: true,
                // icon: 'dashboard',
                url: "/customer/dashboard",
            });
        }


        if (this.menuItems.indexOf("CustomerOrderFulFilmentCenter") >= 0) {
            this.customerOrderFulfilmentSubChildren.push({
                id: "fulfilmentCenter",
                title: "Fulfilment Center",
                translate: "NAV.CUSTOMER.FULFILMENT_CENTER",
                type: "item",
                url: "/customer/orderfulfilment",
            });
        }

        if (this.menuItems.indexOf("CustomerOrderFulFilmentCenter") >= 0) {
            this.children.push({
                id: "orderfulfilmentCenter",
                title: "Order Fulfilment",
                translate: "NAV.CUSTOMER.ORDER_FULFILMENT",
                type: "collapsable",
                icon: "orderfulfilmentIcon",
                isSvgIcon: true,
                // icon: 'dashboard',
                children: this.customerOrderFulfilmentSubChildren,
            });
        }
        if (this.menuItems.indexOf("CustomerPurchaseList") >= 0) {
            this.PurchaseSubChildren.push({
                id: "PurchaseList",
                title: "List",
                translate: "NAV.CUSTOMER.PURCHASE_INDENT",
                type: "item",
                // icon: "purchaseIntentIcon",
                // isSvgIcon: true,
                // icon: 'dashboard',
                url: "/customer/purchaseindentList",
            });
        }
        if (this.menuItems.indexOf("PurchaseIndent") >= 0) {
            this.PurchaseSubChildren.push({
                id: "fact",
                title: "Create",
                translate: "NAV.CUSTOMER.PURCHASE_INDENT",
                type: "item",
                // icon: "purchaseIntentIcon",
                // isSvgIcon: true,
                // icon: 'dashboard',
                url: "/customer/purchaseindent",
            });
        }

        if (this.menuItems.indexOf("PurchaseIndent") >= 0) {
            this.children.push({
                id: "Purchase",
                title: "Purchase Indent",
                translate: "NAV.CUSTOMER.PURCHASE_INDENT",
                type: "collapsable",
                icon: "purchaseIntentIcon",
                isSvgIcon: true,
                // icon: 'dashboard',
                // url: "/customer/purchaseindent",
                children: this.PurchaseSubChildren,
            });
        }
        if (this.menuItems.indexOf("Return") >= 0) {
            this.ReturnSubChildren.push({
                id: "ReturnList",
                title: "List",
                translate: "NAV.CUSTOMER.RETURN",
                type: "item",
                // icon: "returnIcon",
                // isSvgIcon: true,
                // icon: 'dashboard',
                url: "/customer/customerreturnlist",
                // customerreturnlist
                // return
            });
        }
        if (this.menuItems.indexOf("Return") >= 0) {
            this.ReturnSubChildren.push({
                id: "fact",
                title: "Create",
                translate: "NAV.CUSTOMER.RETURN",
                type: "item",
                // icon: "returnIcon",
                // isSvgIcon: true,
                // icon: 'dashboard',
                url: "/customer/customerreturn",
                // customerreturnlist
                // return
            });
        }
        if (this.menuItems.indexOf("Return") >= 0) {
            this.children.push({
                id: "return",
                title: "Return",
                translate: "NAV.CUSTOMER.RETURN",
                // type: "item",
                type: "collapsable",
                icon: "returnIcon",
                isSvgIcon: true,
                children: this.ReturnSubChildren,
                // icon: 'dashboard',
                // url: "/customer/customerreturnlist",
                // customerreturnlist
                // return
            });
        }
        if (this.menuItems.indexOf("POD") >= 0) {
            this.children.push({
                id: "pod",
                title: "POD",
                translate: "NAV.CUSTOMER.POD",
                type: "item",
                icon: "podIcon",
                isSvgIcon: true,
                // icon: 'dashboard',
                url: "/customer/pod",
            });
        }
        if (this.menuItems.indexOf("InvoicePayment") >= 0) {
            this.children.push({
                id: "invoicepayment",
                title: "Invoice List",
                translate: "NAV.CUSTOMER.INVOICE_PAYMENT",
                type: "item",
                icon: "payment",
                isSvgIcon: false,
                // icon: 'dashboard',
                url: "/customer/invoicepayment",
            });
        }
        if (this.menuItems.indexOf("CustomerSupportDesk") >= 0) {
            this.customerSupportSubChildren.push({
                id: "custsupportdesk",
                title: "Get Support",
                translate: "NAV.CUSTOMER.GET_SUPPORT",
                type: "item",
                url: "/customer/supportdesk",
            });
        }

        if (this.menuItems.indexOf("CustomerFact") >= 0) {
            this.customerSupportSubChildren.push({
                id: "custfact",
                title: "My Details",
                translate: "NAV.CUSTOMER.MY_DETAILS",
                type: "item",
                // icon: 'dashboard',
                url: "/customer/fact",
            });
        }
        if (
            this.menuItems.indexOf("CustomerSupportDesk") >= 0 ||
            this.menuItems.indexOf("CustomerFact") >= 0
        ) {
            this.children.push({
                id: "master",
                title: "Support",
                translate: "NAV.VENDOR.SUPPORT",
                type: "collapsable",
                icon: "supportIcon",
                isSvgIcon: true,
                // icon: 'view_list',
                children: this.customerSupportSubChildren,
            });
        }
    }
    GetExpenditorMenus(): void {
        if (this.menuItems.indexOf("Expenditor_Dashboard") >= 0) {
            this.children.push({
                id: "expenditor_dashboard",
                title: "Dashboard",
                translate: "DASHBOARD.Expenditor_Dashboard",
                type: "item",
                icon: "billIcon",
                isSvgIcon: true,
                url: "/expenditor/dashboard",
            });
        }
    }
    GetBuyerMenus(): void {

        if (this.menuItems.indexOf("BuyerPOList") >= 0) {
            this.children.push({
                id: "buyerpolist",
                title: "PO List",
                translate: "NAV.CUSTOMER.GET_SUPPORT",
                type: "item",
                icon: "billIcon",
                isSvgIcon: true,
                url: "/buyer/polist",
            });
        }

        if (this.menuItems.indexOf("BuyerASNList") >= 0) {
            this.children.push({
                id: "buyerasnlist",
                title: "ASN List",
                translate: "NAV.CUSTOMER.GET_SUPPORT",
                type: "item",
                icon: "asnIcon",
                isSvgIcon: true,
                url: "/buyer/asnlist",
            });
        }

        if (this.menuItems.indexOf("BuyerGRNList") >= 0) {
            this.children.push({
                id: "buyergrnlist",
                title: "GRN List",
                translate: "NAV.CUSTOMER.GET_SUPPORT",
                type: "item",
                icon: "reportIcon",
                isSvgIcon: true,
                url: "/buyer/grnlist",
            });
        }
        if (this.menuItems.indexOf("BuyerInvoiceDiscount") >= 0) {
            this.children.push({
                id: "BuyerInvoiceDiscount",
                title: "Invoice Discount",
                translate: "NAV.CUSTOMER.GET_SUPPORT",
                type: "item",
                icon: "paymentIcon",
                isSvgIcon: true,
                url: "/discount/buyer-discount",
            });
        }
        // CAPA
        if (this.menuItems.indexOf("CAPABuyerDashboard") >= 0) {
            this.buyerCAPASubChildren.push({
                id: "Dashboard",
                title: "Dashboard",
                translate: "NAV.VENDOR.CAPABuyerDashboard",
                type: "item",
                // icon: 'dashboard',
                url: "/buyer/capa-dashboard",
            });
        }
        if (this.menuItems.indexOf("CAPACreate") >= 0) {
            this.buyerCAPASubChildren.push({
                id: "Create",
                title: "Create",
                translate: "NAV.VENDOR.CAPACreate",
                type: "item",
                // icon: 'dashboard',
                url: "/buyer/capa-create",
            });
        }
        if (
            this.menuItems.indexOf("CAPABuyerDashboard") >= 0 ||
            this.menuItems.indexOf("CAPACreate") >= 0) {
            this.children.push({
                id: "CAPA",
                title: "CAPA",
                translate: "NAV.VENDOR.CAPA",
                type: "collapsable",
                icon: "CAPAIcon",
                isSvgIcon: true,
                // icon: 'view_list',
                children: this.buyerCAPASubChildren,
            });
        }

        if (this.menuItems.indexOf("SupplierEvaluation") >= 0) {
            this.buyerReportChildren.push({
                id: "evaluation",
                title: "Supplier Evaluation",
                // translate: "NAV.VENDOR.CAPACreate",
                type: "item",
                // icon: 'dashboard',
                url: "/reports/evaluation",
            });
        }
        if (this.menuItems.indexOf("OTIF") >= 0) {
            this.buyerReportChildren.push({
                id: "otif",
                title: "OTIF",
                // translate: "NAV.VENDOR.CAPACreate",
                type: "item",
                // icon: 'dashboard',
                url: "/reports/otif",
            });
        }
        if (this.menuItems.indexOf("VendorReconciliation") >= 0) {
            this.buyerReportChildren.push({
                id: "reconciliation",
                title: "Vendor Reconciliation",
                // translate: "NAV.VENDOR.CAPACreate",
                type: "item",
                // icon: 'dashboard',
                url: "/reports/vendor-reconciliation",
            });
        }
        if (
            this.menuItems.indexOf("SupplierEvaluation") >= 0 || this.menuItems.indexOf("OTIF") >= 0) {
            this.children.push({
                id: "report",
                title: "Report",
                // translate: "NAV.VENDOR.CAPA",
                type: "collapsable",
                icon: "assignment",
                isSvgIcon: false,
                // icon: 'view_list',
                children: this.buyerReportChildren,
            });
        }


        // this.GetRFQMenus();
        if (this.menuItems.indexOf("BuyerSupportDesk") >= 0) {
            this.buyerSupportSubChildren.push({
                id: "buyersupportdesk",
                title: "Get Support",
                translate: "NAV.CUSTOMER.GET_SUPPORT",
                type: "item",
                url: "/buyer/supportdesk",
            });
        }

        if (this.menuItems.indexOf("BuyerFact") >= 0) {
            this.buyerSupportSubChildren.push({
                id: "buyerfact",
                title: "My Details",
                translate: "NAV.CUSTOMER.MY_DETAILS",
                type: "item",
                // icon: 'dashboard',
                url: "/buyer/fact",
            });
        }
        if (
            this.menuItems.indexOf("BuyerSupportDesk") >= 0 ||
            this.menuItems.indexOf("BuyerFact") >= 0) {
            this.children.push({
                id: "master",
                title: "Support",
                translate: "NAV.VENDOR.SUPPORT",
                type: "collapsable",
                icon: "supportIcon",
                isSvgIcon: true,
                // icon: 'view_list',
                children: this.buyerSupportSubChildren,
            });
        }



    }

    GetAdminMenus(): void {
        // if (this.menuItems.indexOf("DataMigration") >= 0) {
        //     this.children.push({
        //         id: "datamigration",
        //         title: "Data Migration",
        //         translate: "NAV.VENDOR.DATA_MIGRATION",
        //         type: "item",
        //         icon: "receiptIcon",
        //         isSvgIcon: true,
        //         // icon: 'receipt',
        //         url: "/configuration/datamigration",
        //     });
        // }
        if (this.menuItems.indexOf("Log") >= 0) {
            this.children.push({
                id: "log",
                title: "Log",
                translate: "NAV.ADMIN.LOG",
                type: "item",
                icon: "receiptIcon",
                isSvgIcon: true,
                // icon: 'receipt',
                url: "/auth/log",
            });
        }
        if (this.menuItems.indexOf("App") >= 0) {
            this.subChildren.push({
                id: "menuapp",
                title: "App",
                translate: "NAV.ADMIN.APP",
                type: "item",
                url: "/master/menuApp",
            });
        }
        if (this.menuItems.indexOf("Role") >= 0) {
            this.subChildren.push({
                id: "role",
                title: "Role",
                translate: "NAV.ADMIN.ROLE",
                type: "item",
                url: "/master/role",
            });
        }
        if (this.menuItems.indexOf("User") >= 0) {
            this.subChildren.push({
                id: "user",
                title: "User",
                translate: "NAV.ADMIN.USER",
                type: "item",
                url: "/master/user",
            });
        }
        if (this.menuItems.indexOf("PlantMaster") >= 0) {
            this.subChildren.push({
                id: "plantMaster",
                title: "Plant",
                translate: "NAV.ADMIN.USER",
                type: "item",
                url: "/master/plantMaster",
            });
        }
        if (
            this.menuItems.indexOf("App") >= 0 ||
            this.menuItems.indexOf("Role") >= 0 ||
            this.menuItems.indexOf("User") >= 0 ||
            this.menuItems.indexOf("PlantMaster") >= 0
        ) {
            this.children.push({
                id: "master",
                title: "Master",
                translate: "NAV.ADMIN.MASTER",
                type: "collapsable",
                icon: "menuwithdotsIcon",
                isSvgIcon: true,
                // icon: 'view_list',
                children: this.subChildren,
            });
        }
        if (this.menuItems.indexOf("Doctype") >= 0) {
            this.configSubChildren.push({
                id: "doctype",
                title: "ASN Doctype",
                translate: "NAV.ADMIN.ASN_DOCTYPE",
                type: "item",
                url: "/configuration/doctype",
            });
        }
        if (this.menuItems.indexOf("Products") >= 0) {
            this.configSubChildren.push({
                id: "products",
                title: "Products",
                translate: "NAV.ADMIN.PRODUCTS",
                type: "item",
                url: "/configuration/products",
            });
        }
        if (this.menuItems.indexOf("ASNField") >= 0) {
            this.configSubChildren.push({
                id: "asnfield",
                title: "ASN Fields",
                translate: "NAV.ADMIN.ASN_DOCTYPE",
                type: "item",
                url: "/configuration/asnfield",
            });
        }
        if (this.menuItems.indexOf("Session") >= 0) {
            this.configSubChildren.push({
                id: "session",
                title: "Session",
                translate: "NAV.ADMIN.SESSION",
                type: "item",
                url: "/configuration/session",
            });
        }
        if (true || this.menuItems.indexOf("CreditLimit") >= 0) {
            this.configSubChildren.push({
                id: "creditlimit",
                title: "Credit Limit",
                translate: "NAV.ADMIN.SESSION",
                type: "item",
                url: "/configuration/creditlimit",
            });
        }
        if (this.menuItems.indexOf("ExpenseType") >= 0) {
            this.configSubChildren.push({
                id: "expensetype",
                title: "Expense Type",
                type: "item",
                url: "/master/expensetype",
            });
        }
        if (this.menuItems.indexOf("SupportDeskMaster") >= 0) {
            this.configSubChildren.push({
                id: "supportmaster",
                title: "Support",
                translate: "NAV.ADMIN.SUPPORT",
                type: "item",
                url: "/configuration/supportmaster",
            });
        }
        this.configSubChildren.push({
            id: "welcomemsg",
            title: "Welcome Message",
            translate: "NAV.ADMIN.SUPPORT",
            type: "item",
            url: "/configuration/welcomemsg",
        });
        this.configSubChildren.push({
            id: "ceomsg",
            title: "CEO Message",
            translate: "NAV.ADMIN.SUPPORT",
            type: "item",
            url: "/configuration/ceomsg",
        });

        this.configSubChildren.push({
            id: "scocmsg",
            title: "SCOC Message",
            translate: "NAV.ADMIN.SUPPORT",
            type: "item",
            url: "/configuration/scocmsg",
        });
        this.configSubChildren.push({
            id: "cardupdate",
            title: "Card Update",
            translate: "NAV.ADMIN.SUPPORT",
            type: "item",
            url: "/configuration/cardupdate",
        });
        this.configSubChildren.push({
            id: "PO",
            title: "Notification",
            translate: "NAV.ADMIN.PO",
            type: "item",
            url: "/configuration/po",
        });
        if (
            this.menuItems.indexOf("Doctype") >= 0 ||
            this.menuItems.indexOf("Session") >= 0 ||
            this.menuItems.indexOf("SupportDeskMaster") >= 0
        ) {
            this.children.push({
                id: "configuration",
                title: "Configuration",
                translate: "NAV.ADMIN.CONFIGURATION",
                type: "collapsable",
                icon: "settings",
                isSvgIcon: false,
                // icon: 'view_list',
                children: this.configSubChildren,
            });
        }
        if (this.menuItems.indexOf("LoginHistory") >= 0) {
            this.children.push({
                id: "loginHistory",
                title: "Login History",
                translate: "NAV.ADMIN.LOGIN_HISTORY",
                type: "item",
                icon: "history",
                isSvgIcon: false,
                url: "/audit/loginHistory",
            });
        }
        // if (this.menuItems.indexOf("Improvement") >= 0) {
        //     this.children.push({
        //         id: "improvement",
        //         title: "Improvement",
        //         translate: "NAV.VENDOR.IMPROVEMENT",
        //         type: "item",
        //         icon: "flipIcon",
        //         isSvgIcon: true,
        //         // icon: 'dashboard',
        //         url: "/pages/improvement",
        //     });
        // }
    }

    GetRFQMenus(): void {
        if (this.menuItems.indexOf("PurchaseRequisition") >= 0) {
            if (this.rfqSubChildren.findIndex(x => x.id === 'purchaserequisition') < 0) {
                this.rfqSubChildren.push({
                    id: "purchaserequisition",
                    title: "Purchase Requisition",
                    translate: "NAV.CUSTOMER.ORDER_FULFILMENT",
                    type: "item",
                    // icon: "rfxIcon",
                    // isSvgIcon: true,
                    // icon: 'dashboard',
                    // children: this.customerOrderFulfilmentSubChildren,
                    url: "/rfq/pr"
                });
            }
        }
        if (this.menuItems.indexOf("RFQEngine") >= 0) {
            if (this.rfqSubChildren.findIndex(x => x.id === 'rfqengine') < 0) {
                this.rfqSubChildren.push({
                    id: "rfqengine",
                    title: "RFQ Engine",
                    translate: "NAV.CUSTOMER.ORDER_FULFILMENT",
                    type: "item",
                    // icon: "rfxIcon",
                    // isSvgIcon: true,
                    // icon: 'dashboard',
                    // children: this.customerOrderFulfilmentSubChildren,
                    url: "/rfq/engine"
                });
            }
        }
        if (this.menuItems.indexOf("RFQCreation") >= 0) {
            if (this.rfqSubChildren.findIndex(x => x.id === 'rfqcreation') < 0) {
                this.rfqSubChildren.push({
                    id: "rfqcreation",
                    title: "RFQ Creation",
                    translate: "NAV.CUSTOMER.ORDER_FULFILMENT",
                    type: "item",
                    // icon: "rfxIcon",
                    // isSvgIcon: true,
                    // icon: 'dashboard',
                    // children: this.customerOrderFulfilmentSubChildren,
                    url: "/rfq/creation"
                });
            }
        }
        if (this.menuItems.indexOf("RFQResponse") >= 0) {
            if (this.rfqSubChildren.findIndex(x => x.id === 'rfqresponse') < 0) {
                this.rfqSubChildren.push({
                    id: "rfqresponse",
                    title: "RFQ Response",
                    translate: "NAV.CUSTOMER.ORDER_FULFILMENT",
                    type: "item",
                    // icon: "rfxIcon",
                    // isSvgIcon: true,
                    // icon: 'dashboard',
                    // children: this.customerOrderFulfilmentSubChildren,
                    url: "/rfq/response"
                });
            }
        }

        if (this.menuItems.indexOf("PurchaseRequisition") >= 0 ||
            this.menuItems.indexOf("RFQEngine") >= 0 ||
            this.menuItems.indexOf("RFQCreation") >= 0 ||
            this.menuItems.indexOf("RFQResponse") >= 0) {
            if (this.children.findIndex(x => x.id === 'rfq') < 0) {
                this.children.push({
                    id: "rfq",
                    title: "RFQ",
                    translate: "NAV.CUSTOMER.ORDER_FULFILMENT",
                    type: "collapsable",
                    icon: "rfxIcon",
                    isSvgIcon: true,
                    // icon: 'dashboard',
                    children: this.rfqSubChildren,
                    // url: "/rfq/response"
                });
            }
        }
    }

    typeMessage(): void {
        if (!this.messages[this.currentMessage]) {
            this.currentMessage = 0;
        }
        const currentStr = this.messages[this.currentMessage];
        // currentStr.split();
        let part = "";
        let currentLetter = 0;
        const int1 = setInterval(() => {
            if (!currentStr[currentLetter]) {
                this.currentMessage++;
                setTimeout(() => {
                    this.deleteMessage(part);
                }, 4000);
                clearInterval(int1);
            } else {
                part += currentStr[currentLetter++];
                // mHTML.innerHTML = part;
                this.currentText = part;
            }
        }, 100);
    }

    deleteMessage(str): void {
        const int = setInterval(() => {
            if (str.length === 0) {
                setTimeout(() => {
                    this.typeMessage();
                }, 500);
                clearInterval(int);
            } else {
                str = str.split("");
                str.pop();
                str = str.join("");
                // mHTML.innerHTML = str;
                this.currentText = str;
            }
        }, 150);
    }

    openDialog(): void {
        // const dialogConfig: MatDialogConfig = {
        //     data: [this.screenWidth, this.screenHeight],
        //     panelClass:[]
        // };
        const dialogRef = this.dialog.open(
            SoccDialogComponent,
            { height: this.screenHeight, width: this.screenWidth },
            // dialogConfig
        );
    }
}
