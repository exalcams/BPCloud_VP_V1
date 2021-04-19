import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { BPCPayAccountStatement, BPCPayPayable, BPCPayPayment, BPCPayTDS } from 'app/models/Payment.model';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  baseAddress: string;
  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService
  ) {
    this.baseAddress = _authService.baseAddress;
  }
  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error instanceof Object ? error.error.Message ? error.error.Message : error.error : error.error || error.message || 'Server Error');
  }

  GetAccountStatementByPartnerID(PartnerID: string): Observable<BPCPayAccountStatement[] | string> {
    return this._httpClient.get<BPCPayAccountStatement[]>(`${this.baseAddress}poapi/Payment/GetAccountStatementByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  FilterAccountStatementByPartnerID(PartnerID: string, DocumentID: string, ProfitCenter: string, FromDate: string, ToDate: string): Observable<BPCPayAccountStatement[] | string> {
    return this._httpClient.get<BPCPayAccountStatement[]>
      // tslint:disable-next-line:max-line-length
      (`${this.baseAddress}poapi/Payment/FilterAccountStatementByPartnerID?PartnerID=${PartnerID}&DocumentID=${DocumentID}&ProfitCenter=${ProfitCenter}&FromDate=${FromDate}&ToDate=${ToDate}`)
      .pipe(catchError(this.errorHandler));
  }
  GetPayableByPartnerID(PartnerID: string): Observable<BPCPayPayable[] | string> {
    return this._httpClient.get<BPCPayPayable[]>(`${this.baseAddress}poapi/Payment/GetPayableByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  FilterPayableByPartnerID(PartnerID: string, Invoice: string, FromDate: string, ToDate: string): Observable<BPCPayPayable[] | string> {
    return this._httpClient.get<BPCPayPayable[]>
      (`${this.baseAddress}poapi/Payment/FilterPayableByPartnerID?PartnerID=${PartnerID}&Invoice=${Invoice}&FromDate=${FromDate}&ToDate=${ToDate}`)
      .pipe(catchError(this.errorHandler));
  }
  GetPaymentByPartnerID(PartnerID: string): Observable<BPCPayPayment[] | string> {
    return this._httpClient.get<BPCPayPayment[]>(`${this.baseAddress}poapi/Payment/GetPaymentByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  FilterPaymentByPartnerID(PartnerID: string, FromDate: string, ToDate: string): Observable<BPCPayPayment[] | string> {
    return this._httpClient.get<BPCPayPayment[]>
      (`${this.baseAddress}poapi/Payment/FilterPaymentByPartnerID?PartnerID=${PartnerID}&FromDate=${FromDate}&ToDate=${ToDate}`)
      .pipe(catchError(this.errorHandler));
  }
  GetTDSByPartnerID(PartnerID: string): Observable<BPCPayTDS[] | string> {
    return this._httpClient.get<BPCPayTDS[]>(`${this.baseAddress}poapi/Payment/GetTDSByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  FilterTDSByPartnerID(PartnerID: string, FromDate: string, ToDate: string): Observable<BPCPayTDS[] | string> {
    return this._httpClient.get<BPCPayTDS[]>
      (`${this.baseAddress}poapi/Payment/FilterTDSByPartnerID?PartnerID=${PartnerID}&FromDate=${FromDate}&ToDate=${ToDate}`)
      .pipe(catchError(this.errorHandler));
  }
  AcceptBC(bPCPayAccountStatement: BPCPayAccountStatement[]): Observable<any> {
    return this._httpClient.post(`${this.baseAddress}poapi/Payment/AcceptBC`, bPCPayAccountStatement, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }).pipe(catchError(this.errorHandler));
  }
}
