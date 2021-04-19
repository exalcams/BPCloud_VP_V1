import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfirmationDetails } from 'app/models/BalanceConfirmation';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class BalanceConfirmationService {
    serviceUrl = "";
    constructor(private http: HttpClient, private _authService: AuthService) {
        this.serviceUrl = this._authService.baseAddress + "poapi/";
    }

    errorHandler(error: HttpErrorResponse): Observable<string> {
        return throwError(error.error instanceof Object ? error.error.Message ? error.error.Message : error.error : error.error || error.message || 'Server Error');
    }

    GetAllBCheaders(): Observable<any> {
        return this.http.get(this.serviceUrl + "balanceconfirmation/getallbcheaders")
            .pipe(catchError(this.errorHandler));
    }
    GetAllBCItems(): Observable<any> {
        return this.http.get(this.serviceUrl + "balanceconfirmation/getallbcitems")
            .pipe(catchError(this.errorHandler));
    }
    GetCurrentBCHeader(): Observable<any> {
        return this.http.get(this.serviceUrl + "balanceconfirmation/GetCurrentBCHeader")
            .pipe(catchError(this.errorHandler));
    }
    GetCurrentBCItems(): Observable<any> {
        return this.http.get(this.serviceUrl + "balanceconfirmation/GetCurrentBCItems")
            .pipe(catchError(this.errorHandler));
    }
    GetCurrentBCItemsByPeroid(): Observable<any> {
        return this.http.get(this.serviceUrl + "balanceconfirmation/GetCurrentBCItemsByPeroid")
            .pipe(catchError(this.errorHandler));
    }
    AcceptBC(confirmationDetails: ConfirmationDetails): Observable<any> {
        return this.http.post(this.serviceUrl + "balanceconfirmation/AcceptBC", confirmationDetails)
            .pipe(catchError(this.errorHandler));
    }

}
