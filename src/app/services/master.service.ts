import { Injectable } from "@angular/core";
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError, Subject } from "rxjs";
import { _MatChipListMixinBase } from "@angular/material";
import { AuthService } from "./auth.service";
import { catchError } from "rxjs/operators";
import {
    MenuApp,
    RoleWithApp,
    UserWithRole,
    UserNotification,
    Reason,
    UserView,
    VendorUser,
    SessionMaster,
    UserLoginHistory,
    LoginHistoryFilter,
    AppUsage,
    AppUsageView,
    UserPreference,
    PO,
} from "app/models/master";
import { BPCDocumentCenterMaster } from "app/models/ASN";
import { Guid } from "guid-typescript";
import { BPCExpenseTypeMaster } from "app/models/POD";
import { BPCProd } from "app/models/customer";
import { BPCHSNMaster } from "app/models/po-flip";

@Injectable({
    providedIn: "root",
})
export class MasterService {
    baseAddress: string;
    NotificationEvent: Subject<any>;

    GetNotification(): Observable<any> {
        return this.NotificationEvent.asObservable();
    }

    TriggerNotification(eventName: string): void {
        this.NotificationEvent.next(eventName);
    }

    constructor(
        private _httpClient: HttpClient,
        private _authService: AuthService
    ) {
        this.baseAddress = _authService.baseAddress;
        this.NotificationEvent = new Subject();
    }

    // Error Handler
    errorHandler(error: HttpErrorResponse): Observable<string> {
        return throwError(error.error || error.message || "Server Error");
    }
    CreatePO(Pos: PO): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/CreatePO`,
                Pos,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    UpdatePO(Pos: PO): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/UpdatePO`,
                Pos,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    GetPO(): Observable<PO[] | string> {
        return this._httpClient
            .get<PO[]>(
                `${this.baseAddress}authenticationapi/Master/GetPo`
            )
            .pipe(catchError(this.errorHandler));
    }
    // App
    CreateMenuApp(menuApp: MenuApp): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/CreateApp`,
                menuApp,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllMenuApp(): Observable<MenuApp[] | string> {
        return this._httpClient
            .get<MenuApp[]>(
                `${this.baseAddress}authenticationapi/Master/GetAllApps`
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateMenuApp(menuApp: MenuApp): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/UpdateApp`,
                menuApp,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    DeleteMenuApp(menuApp: MenuApp): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/DeleteApp`,
                menuApp,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    // AppUsage
    CreateAppUsage(appUsage: AppUsage): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/CreateAppUsage`,
                appUsage,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllAppUsage(): Observable<AppUsageView[] | string> {
        return this._httpClient
            .get<AppUsageView[]>(
                `${this.baseAddress}authenticationapi/Master/GetAllAppUsages`
            )
            .pipe(catchError(this.errorHandler));
    }

    GetBuyerPlant(UserID: Guid): Observable<any> {
        return this._httpClient
            .get(
                `${this.baseAddress}authenticationapi/Master/GetBuyerPlant?UserID=${UserID}`, {
                responseType: 'text'
            }
            )
            .pipe(catchError(this.errorHandler));
    }
    GetBuyerPlants(UserID: Guid): Observable<string[] | string> {
        return this._httpClient.get<string[]>(`${this.baseAddress}authenticationapi/Master/GetBuyerPlants?UserID=${UserID}`)
        .pipe(catchError(this.errorHandler));
    }

    GetAppUsagesByUser(UserID: Guid): Observable<AppUsageView[] | string> {
        return this._httpClient
            .get<AppUsageView[]>(
                `${this.baseAddress}authenticationapi/Master/GetAppUsagesByUser?UserID=${UserID}`
            )
            .pipe(catchError(this.errorHandler));
    }

    // UpdateAppUsage(appUsage: AppUsage): Observable<any> {
    //   return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/UpdateAppUsage`,
    //   appUsage,
    //     {
    //       headers: new HttpHeaders({
    //         'Content-Type': 'application/json'
    //       })
    //     })
    //     .pipe(catchError(this.errorHandler));
    // }

    // DeleteAppUsage(appUsage: AppUsage): Observable<any> {
    //   return this._httpClient.post<any>(`${this.baseAddress}authenticationapi/Master/DeleteAppUsage`,
    //   appUsage,
    //     {
    //       headers: new HttpHeaders({
    //         'Content-Type': 'application/json'
    //       })
    //     })
    //     .pipe(catchError(this.errorHandler));
    // }

    // Reason
    CreateReason(reason: Reason): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/CreateReason`,
                reason,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllReasons(): Observable<Reason[] | string> {
        return this._httpClient
            .get<Reason[]>(
                `${this.baseAddress}authenticationapi/Master/GetAllReasons`
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateReason(reason: Reason): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/UpdateReason`,
                reason,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    DeleteReason(reason: Reason): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/DeleteReason`,
                reason,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    //plant map with user
    GetAllPlant_auth(): Observable<any> {
        return this._httpClient
            .get<any>(
                `${this.baseAddress}authenticationapi/Master/GetAllPlant`
            )
            .pipe(catchError(this.errorHandler));
    }

    // Role
    CreateRole(role: RoleWithApp): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/CreateRole`,
                role,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllRoles(): Observable<RoleWithApp[] | string> {
        return this._httpClient
            .get<RoleWithApp[]>(
                `${this.baseAddress}authenticationapi/Master/GetAllRoles`
            )
            .pipe(catchError(this.errorHandler));
    }
    //#region 
    GetAllPlant(): Observable<any[] | string> {
        return this._httpClient
            .get<RoleWithApp[]>(
                `${this.baseAddress}poapi/Master/GetAllPlant`
            )
            .pipe(catchError(this.errorHandler));
    }
    //#endregion

    UpdateRole(role: RoleWithApp): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/UpdateRole`,
                role,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    DeleteRole(role: RoleWithApp): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/DeleteRole`,
                role,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    // Users

    CreateUser1(user: UserWithRole, file: File): Observable<any> {
        const formData: FormData = new FormData();
        formData.append("uploadFile", file, file.name);
        formData.append("userName", user.UserName);

        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/CreateUser1`,
                formData
                // {
                //   headers: new HttpHeaders({
                //     'Content-Type': 'application/json'
                //   })
                // }
            )
            .pipe(catchError(this.errorHandler));
    }

    CreateUser(user: UserWithRole): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/CreateUser`,
                user
                // {
                //   headers: new HttpHeaders({
                //     'Content-Type': 'application/json'
                //   })
                // }
            )
            .pipe(catchError(this.errorHandler));
    }
    CreateVendorUser(vendorUser: VendorUser): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/CreateVendorUser`,
                vendorUser
                // {
                //   headers: new HttpHeaders({
                //     'Content-Type': 'application/json'
                //   })
                // }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllUsers(): Observable<UserWithRole[] | string> {
        return this._httpClient
            .get<UserWithRole[]>(
                `${this.baseAddress}authenticationapi/Master/GetAllUsers`
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllDevelopers(): Observable<UserView[] | string> {
        return this._httpClient
            .get<UserView[]>(
                `${this.baseAddress}authenticationapi/Master/GetAllDevelopers`
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllDevelopersAndTLs(): Observable<UserView[] | string> {
        return this._httpClient
            .get<UserView[]>(
                `${this.baseAddress}authenticationapi/Master/GetAllDevelopersAndTLs`
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateUser(user: UserWithRole): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/UpdateUser`,
                user
                // {
                //   headers: new HttpHeaders({
                //     'Content-Type': 'application/json'
                //   })
                // }
            )
            .pipe(catchError(this.errorHandler));
    }

    DeleteUser(user: UserWithRole): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/DeleteUser`,
                user,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllNotificationByUserID(
        UserID: string
    ): Observable<UserNotification[] | string> {
        return this._httpClient
            .get<UserNotification[]>(
                `${this.baseAddress}authenticationapi/Notification/GetAllNotificationByUserID?UserID=${UserID}`
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateNotification(
        SelectedNotification: UserNotification
    ): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Notification/UpdateNotification`,
                SelectedNotification,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetSupportDeskUsersByRoleName(
        RoleName: string
    ): Observable<UserWithRole[] | string> {
        return this._httpClient
            .get<UserWithRole[]>(
                `${this.baseAddress}authenticationapi/Master/GetSupportDeskUsersByRoleName?RoleName=${RoleName}`
            )
            .pipe(catchError(this.errorHandler));
    }
    //#region VendorReconciliation 
    GetVendor(): Observable<string[] | any> {
        return this._httpClient
            .get<string[]>(
                `${this.baseAddress}authenticationapi/Master/GetVendor`
            )
            .pipe(catchError(this.errorHandler));
    }
    GetMail(Selectedvendor): Observable<string[] | any> {
        return this._httpClient
        .post<string[]>(
          `${this.baseAddress}authenticationapi/Master/GetMail?Selectedvendor=${Selectedvendor}`,   
          {
            headers: new HttpHeaders({
              "Content-Type": "application/json",
            }),
          }
        )
        .pipe(catchError(this.errorHandler));
    }
    //#endregion
    // UserPreferences
    CreateUserPreference(role: UserPreference): Observable<any> {
        return this._httpClient.post<any>(
            `${this.baseAddress}authenticationapi/Master/SetUserPreference`,
            role,
            {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            }
        );
    }

    GetUserPreferenceByUserID(
        UserID: Guid
    ): Observable<UserPreference | string> {
        return this._httpClient
            .get<UserPreference>(
                `${this.baseAddress}authenticationapi/Master/GetUserPreferenceByUserID?UserID=${UserID}`
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateUserPreference(role: UserPreference): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/SetUserPreference`,
                role,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllExpenseType(): Observable<BPCExpenseTypeMaster[] | string> {
        return this._httpClient
            .get<BPCExpenseTypeMaster[]>(
                `${this.baseAddress}poapi/Master/GetExpenseTypeMasters`
            )
            .pipe(catchError(this.errorHandler));
    }
    CreateExpenseType(role: BPCExpenseTypeMaster): Observable<any> {
        return this._httpClient.post<any>(
            `${this.baseAddress}poapi/Master/CreateExpenseTypeMaster`,
            role,
            {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            }
        );
    }
    UpdateExpenseType(role: BPCExpenseTypeMaster): Observable<any> {
        return this._httpClient.post<any>(
            `${this.baseAddress}poapi/Master/UpdateExpenseTypeMaster`,
            role,
            {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            }
        );
    }
    DeleteExpenseType(role: BPCExpenseTypeMaster): Observable<any> {
        return this._httpClient.post<any>(
            `${this.baseAddress}poapi/Master/DeleteExpenseTypeMaster`,
            role,
            {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            }
        );
    }

    GetAllHSNMasters(): Observable<BPCHSNMaster[] | string> {
        return this._httpClient
            .get<BPCHSNMaster[]>(
                `${this.baseAddress}poapi/Master/GetAllHSNMasters`
            )
            .pipe(catchError(this.errorHandler));
    }
    CreateHSN(role: BPCHSNMaster): Observable<any> {
        return this._httpClient.post<any>(
            `${this.baseAddress}poapi/Master/CreateHSNMaster`,
            role,
            {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            }
        );
    }
    UpdateHSN(role: BPCHSNMaster): Observable<any> {
        return this._httpClient.post<any>(
            `${this.baseAddress}poapi/Master/UpdateHSNMaster`,
            role,
            {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            }
        );
    }
    DeleteHSN(role: BPCHSNMaster): Observable<any> {
        return this._httpClient.post<any>(
            `${this.baseAddress}poapi/Master/DeleteHSNMaster`,
            role,
            {
                headers: new HttpHeaders({
                    "Content-Type": "application/json",
                }),
            }
        );
    }

    GetAllDocumentCenterMaster(): Observable<
        BPCDocumentCenterMaster[] | string
    > {
        return this._httpClient
            .get<BPCDocumentCenterMaster[]>(
                `${this.baseAddress}poapi/Master/GetAllDocumentCenterMaster`
            )
            .pipe(catchError(this.errorHandler));
    }
    CreateDocumentCenterMaster(
        center: BPCDocumentCenterMaster
    ): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}poapi/Master/CreateDocumentCenterMaster`,
                center,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateDocumentCenterMaster(
        center: BPCDocumentCenterMaster
    ): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}poapi/Master/UpdateDocumentCenterMaster`,
                center,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    DeleteDocumentCenterMaster(
        center: BPCDocumentCenterMaster
    ): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}poapi/Master/DeleteDocumentCenterMaster`,
                center,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    // Products
    GetAllProducts(): Observable<BPCProd[] | string> {
        return this._httpClient.get<BPCProd[]>(`${this.baseAddress}poapi/Product/GetAllProducts`)
            .pipe(catchError(this.errorHandler));
    }
    CreateProduct(
        product: BPCProd
    ): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}poapi/Product/CreateProduct`,
                product,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateProduct(
        product: BPCProd
    ): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}poapi/Product/UpdateProduct`,
                product,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    DeleteProduct(
        product: BPCProd
    ): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}poapi/Product/DeleteProduct`,
                product,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }
    //product end
    // SessionMaster

    GetSessionMasterByProject(
        ProjectName: string
    ): Observable<SessionMaster | string> {
        return this._httpClient
            .get<SessionMaster>(
                `${this.baseAddress}authenticationapi/Master/GetSessionMasterByProject?ProjectName=${ProjectName}`
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllSessionMasters(): Observable<SessionMaster[] | string> {
        return this._httpClient
            .get<SessionMaster[]>(
                `${this.baseAddress}authenticationapi/Master/GetAllSessionMasters`
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllSessionMastersByProject(
        ProjectName: string
    ): Observable<SessionMaster[] | string> {
        return this._httpClient
            .get<SessionMaster[]>(
                `${this.baseAddress}authenticationapi/Master/GetAllSessionMastersByProject?ProjectName=${ProjectName}`
            )
            .pipe(catchError(this.errorHandler));
    }

    CreateSessionMaster(sessionMaster: SessionMaster): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/CreateSessionMaster`,
                sessionMaster,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    UpdateSessionMaster(sessionMaster: SessionMaster): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/UpdateSessionMaster`,
                sessionMaster,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    DeleteSessionMaster(sessionMaster: SessionMaster): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/DeleteSessionMaster`,
                sessionMaster,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetAllUsersLoginHistory(): Observable<UserLoginHistory[] | string> {
        return this._httpClient
            .get<UserLoginHistory[]>(
                `${this.baseAddress}authenticationapi/Master/GetAllUsersLoginHistory`
            )
            .pipe(catchError(this.errorHandler));
    }

    FilterLoginHistory(
        UserName: string,
        FromDate: string,
        ToDate: string
    ): Observable<UserLoginHistory[] | string> {
        return this._httpClient
            .get<UserLoginHistory[]>(
                `${this.baseAddress}authenticationapi/Master/FilterLoginHistory?UserName=${UserName}&FromDate=${FromDate}&ToDate=${ToDate}`
            )
            .pipe(catchError(this.errorHandler));
    }

    GetCurrentUserLoginHistory(
        UserID: Guid
    ): Observable<UserLoginHistory[] | string> {
        return this._httpClient
            .get<UserLoginHistory[]>(
                `${this.baseAddress}authenticationapi/Master/GetCurrentUserLoginHistory?UserID=${UserID}`
            )
            .pipe(catchError(this.errorHandler));
    }

    FilterLoginHistoryByUser(
        UserName: string,
        FromDate: string,
        ToDate: string
    ): Observable<UserLoginHistory[] | string> {
        return this._httpClient
            .get<UserLoginHistory[]>(
                `${this.baseAddress}authenticationapi/Master/FilterLoginHistory?UserName=${UserName}&FromDate=${FromDate}&ToDate=${ToDate}`
            )
            .pipe(catchError(this.errorHandler));
    }
}
