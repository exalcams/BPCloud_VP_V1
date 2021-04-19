import { Guid } from 'guid-typescript';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { ResHC, ResHeader, ResIC, ResItem, ResOD, ResponseView, RFxHC, RFxHeader, RFxIC, RFxItem, RFxOD, RFxPartner, RFxVendor, RFxVendorView, RFxView } from 'app/models/RFx';


@Injectable({
    providedIn: 'root'
})
export class RFxService {
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
        return throwError(error.error instanceof Object ? error.error.Message ? error.error.Message : error.error : error.error || error.message || 'Server Error');
    }

    GetAllRFxs(): Observable<RFxHeader[] | string> {
        return this._httpClient.get<RFxHeader[]>(`${this.baseAddress}rfxapi/RFx/GetAllRFxs`)
            .pipe(catchError(this.errorHandler));
    }

    GetRFxByRFxID(RFxID: string): Observable<RFxHeader | string> {
        return this._httpClient.get<RFxHeader>(`${this.baseAddress}rfxapi/RFx/GetRFxByRFxID?RFxID=${RFxID}`)
            .pipe(catchError(this.errorHandler));
    }


    GetRFxItemsByRFxID(RFxID: string): Observable<RFxItem[] | string> {
        return this._httpClient.get<RFxItem[]>(`${this.baseAddress}rfxapi/RFx/GetRFxItemsByRFxID?RFxID=${RFxID}`)
            .pipe(catchError(this.errorHandler));
    }

    GetRFxHCsByRFxID(RFxID: string): Observable<RFxHC[] | string> {
        return this._httpClient.get<RFxHC[]>(`${this.baseAddress}rfxapi/RFx/GetRFxHCsByRFxID?RFxID=${RFxID}`)
            .pipe(catchError(this.errorHandler));
    }
    GetRFxICsByRFxID(RFxID: string): Observable<RFxIC[] | string> {
        return this._httpClient.get<RFxIC[]>(`${this.baseAddress}rfxapi/RFx/GetRFxICsByRFxID?RFxID=${RFxID}`)
            .pipe(catchError(this.errorHandler));
    }

    GetRFxPartnersByRFxID(RFxID: string): Observable<RFxPartner[] | string> {
        return this._httpClient.get<RFxPartner[]>(`${this.baseAddress}rfxapi/RFx/GetRFxPartnersByRFxID?RFxID=${RFxID}`)
            .pipe(catchError(this.errorHandler));
    }
    GetRFxVendorsByRFxID(RFxID: string): Observable<RFxVendor[] | string> {
        return this._httpClient.get<RFxVendor[]>(`${this.baseAddress}rfxapi/RFx/GetRFxVendorsByRFxID?RFxID=${RFxID}`)
            .pipe(catchError(this.errorHandler));
    }
    GetRFxVendorViewsByRFxID(RFxID: string): Observable<RFxVendorView[] | string> {
        return this._httpClient.get<RFxVendorView[]>(`${this.baseAddress}rfxapi/RFx/GetRFxVendorViewsByRFxID?RFxID=${RFxID}`)
            .pipe(catchError(this.errorHandler));
    }
    GetRFxODsByRFxID(RFxID: string): Observable<RFxOD[] | string> {
        return this._httpClient.get<RFxOD[]>(`${this.baseAddress}rfxapi/RFx/GetRFxODsByRFxID?RFxID=${RFxID}`)
            .pipe(catchError(this.errorHandler));
    }
    CreateRFx(RFx: RFxView): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}rfxapi/RFx/CreateRFx`,
            RFx,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    UpdateRFx(RFx: RFxView): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}rfxapi/RFx/UpdateRFx`,
            RFx,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    DeleteRFx(RFx: RFxHeader): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}rfxapi/RFx/DeleteRFx`,
            RFx,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }


    GetAllResponses(): Observable<ResHeader[] | string> {
        return this._httpClient.get<ResHeader[]>(`${this.baseAddress}Responseapi/Response/GetAllResponses`)
            .pipe(catchError(this.errorHandler));
    }

    GetResponseByResponseID(ResponseID: string): Observable<ResHeader | string> {
        return this._httpClient.get<ResHeader>(`${this.baseAddress}Responseapi/Response/GetResponseByResponseID?ResponseID=${ResponseID}`)
            .pipe(catchError(this.errorHandler));
    }


    GetResItemsByResponseID(ResponseID: string): Observable<ResItem | string> {
        return this._httpClient.get<ResItem>(`${this.baseAddress}Responseapi/Response/GetResItemsByResponseID?ResponseID=${ResponseID}`)
            .pipe(catchError(this.errorHandler));
    }

    GetResHCsByResponseID(ResponseID: string): Observable<ResHC[] | string> {
        return this._httpClient.get<ResHC[]>(`${this.baseAddress}Responseapi/Response/GetResHCsByResponseID?ResponseID=${ResponseID}`)
            .pipe(catchError(this.errorHandler));
    }
    GetResICsByResponseID(ResponseID: string): Observable<ResIC[] | string> {
        return this._httpClient.get<ResIC[]>(`${this.baseAddress}Responseapi/Response/GetResICsByResponseID?ResponseID=${ResponseID}`)
            .pipe(catchError(this.errorHandler));
    }

    GetResODsByResponseID(ResponseID: string): Observable<ResOD[] | string> {
        return this._httpClient.get<ResOD[]>(`${this.baseAddress}Responseapi/Response/GetResODsByResponseID?ResponseID=${ResponseID}`)
            .pipe(catchError(this.errorHandler));
    }
    CreateResponse(Response: ResponseView): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}Responseapi/Response/CreateResponse`,
            Response,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    UpdateResponse(Response: ResponseView): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}Responseapi/Response/UpdateResponse`,
            Response,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    DeleteResponse(Response: ResHeader): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}Responseapi/Response/DeleteResponse`,
            Response,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

}
