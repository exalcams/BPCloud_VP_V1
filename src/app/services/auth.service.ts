import { TourStatusModel } from "app/models/TourStatusModel";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { map, catchError } from "rxjs/operators";
import {
    HttpClient,
    HttpErrorResponse,
    HttpHeaders,
} from "@angular/common/http";
import { Guid } from "guid-typescript";
import {
    ChangePassword,
    ForgotPassword,
    EMailModel,
    LoginModel,
    SessionMaster,
    UserPreference,
    ActionLogView,
} from "app/models/master";
import { environment } from "environments/environment";
import { ActionLog } from "app/models/OrderFulFilment";

@Injectable({
    providedIn: "root",
})
export class AuthService {
    baseAddress: string;
    clientId: string;
    constructor(private _httpClient: HttpClient) {
        this.baseAddress = environment.baseAddress;
        this.clientId = environment.clientId;
    }

    // Error Handler

    errorHandler(error: HttpErrorResponse): Observable<string> {
        return throwError(
            error.error.error_description ||
            error.error ||
            error.message ||
            "Server Error"
        );
    }

    errorHandler1(error: HttpErrorResponse): Observable<string> {
        return throwError(error.error || error.message || "Server Error");
    }

    login(userName: string, password: string): Observable<any> {
        // tslint:disable-next-line:prefer-const
        // let data = `grant_type=password&username=${userName}&password=${password}&client_id=${this.clientId}`;
        const loginModel: LoginModel = {
            UserName: userName,
            Password: password,
            clientId: this.clientId,
        };
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Auth/token`,
                loginModel
                // {
                //   headers: new HttpHeaders({
                //     'Content-Type': 'application/json'
                //   })
                // }
            )
            .pipe(catchError(this.errorHandler));
    }

    GetIPAddress(): Observable<any> {
        return this._httpClient
            .get<any>("https://freegeoip.net/json/?callback")
            .pipe(
                map((response) => response || {}),
                catchError(this.errorHandler1)
            );
    }

    SignOut(UserID: Guid): Observable<any> {
        return this._httpClient
            .get<any>(
                `${this.baseAddress}authenticationapi/Master/SignOut?UserID=${UserID}`
            )
            .pipe(catchError(this.errorHandler1));
    }

    GetSessionMasterByProject(
        ProjectName: string
    ): Observable<SessionMaster | string> {
        return this._httpClient
            .get<SessionMaster>(
                `${this.baseAddress}authenticationapi/Master/GetSessionMasterByProject?ProjectName=${ProjectName}`
            )
            .pipe(catchError(this.errorHandler1));
    }

    ChangePassword(changePassword: ChangePassword): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/ChangePassword`,
                changePassword,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler1));
    }
    CreateActionLog(log: ActionLog): Observable<any> {
        return this._httpClient.post<ActionLog>(`${this.baseAddress}authenticationapi/Master/CreateActionLog`,
            log,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler1));
    }
    GetAllActionLogs(): Observable<any> {
        return this._httpClient
            .get<ActionLogView[]>(
                `${this.baseAddress}authenticationapi/Master/GetAllActionLogs`)
            .pipe(catchError(this.errorHandler1));
    }
    GetExpenditorNotification(): Observable<any> {
        return this._httpClient
            .get<Notification[]>(
                `${this.baseAddress}authenticationapi/Master/GetExpenditorNotification`)
            .pipe(catchError(this.errorHandler1));
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
    FilterASNList(UserName: string, AppName: string, UsedDate: string): Observable<any> {
        return this._httpClient
            .get<ActionLogView[]>(
                `${this.baseAddress}authenticationapi/Master/FilterASNList?UserName=${UserName}&AppName=${AppName}&UsedDate=${UsedDate}`
            ).pipe(catchError(this.errorHandler));
    }
    GetUserPlants(UserID: Guid): Observable<string[] | string> {
        return this._httpClient
            .get<string[]>(
                `${this.baseAddress}authenticationapi/Master/GetUserPlants?UserID=${UserID}`
            ).pipe(catchError(this.errorHandler));
    }
    ForgotPassword(forgotPassword: ForgotPassword): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/ForgotPassword`,
                forgotPassword,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler1));
    }

    SendResetLinkToMail(eMailModelmail: EMailModel): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/SendResetLinkToMail`,
                eMailModelmail,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler1));
    }

    SetApplicationTourDisabled(tourStatus: TourStatusModel): Observable<any> {
        return this._httpClient
            .post<any>(
                `${this.baseAddress}authenticationapi/Master/SetApplicationTourDisabled`,
                tourStatus,
                {
                    headers: new HttpHeaders({
                        "Content-Type": "application/json",
                    }),
                }
            )
            .pipe(catchError(this.errorHandler1));
    }
}
