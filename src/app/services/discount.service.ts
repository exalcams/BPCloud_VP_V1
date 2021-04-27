import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BPCPayDis } from 'app/models/Payment.model';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class DiscountService {

  serviceUrl = "";
  constructor(private http: HttpClient, private _authService: AuthService) {
    this.serviceUrl = this._authService.baseAddress + "poapi/";
  }

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error instanceof Object ? error.error.Message ? error.error.Message : error.error : error.error || error.message || 'Server Error');
  }

  GetAccountStatementByPartnerID(parnter_id: string): Observable<any> {
    return this.http.get(this.serviceUrl + "Payment/GetAccountStatementByPartnerID?PartnerID=" + parnter_id)
      .pipe(catchError(this.errorHandler));
  }
  GetDiscountByPartnerID(parnter_id: string): Observable<any> {
    return this.http.get(this.serviceUrl + "Discount/GetBPCPayDiscounts?PartnerID=" + parnter_id)
      .pipe(catchError(this.errorHandler));
  }
  GetBPCPayDiscountByPlants(plants: string[]): Observable<any> {
    return this.http.post(this.serviceUrl + "Discount/GetBPCPayDiscountByPlants", plants, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  GetDiscountMasters(): Observable<any> {
    return this.http.get(this.serviceUrl + "Discount/GetDiscountMasters")
      .pipe(catchError(this.errorHandler));
  }
  CreateBPCPayDiscount(data: BPCPayDis): Observable<any> {
    return this.http.post(this.serviceUrl + "Discount/CreateBPCPayDiscount", data, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  ApproveBPCPayDiscount(data: BPCPayDis): Observable<any> {
    return this.http.post(this.serviceUrl + "Discount/ApproveBPCPayDiscount", data, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  RejecteBPCPayDiscount(data: BPCPayDis): Observable<any> {
    return this.http.post(this.serviceUrl + "Discount/RejectBPCPayDiscount", data, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  FilterBPCPayDiscount(data: BPCPayDis): Observable<any> {
    return this.http.post(this.serviceUrl + "Discount/FilterBPCPayDiscount", data, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
}
