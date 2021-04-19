import { Guid } from 'guid-typescript';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { PO, OrderFulfilmentDetails, Acknowledgement, OfOption, DashboardGraphStatus } from 'app/models/Dashboard';
import { BPCOFHeader } from 'app/models/OrderFulFilment';

@Injectable({
  providedIn: 'root'
})
export class OrderFulFilmentCenterService {
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
    return throwError(error.error || error.message || 'Server Error');
  }

  // Order Fulfilment(OF)

  GetOfsByPartnerID(PartnerID: any): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}poapi/Dashboard/GetOfsByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetOfsByOption(ofOption: OfOption): Observable<BPCOFHeader[] | string> {
    return this._httpClient.post<BPCOFHeader[]>(`${this.baseAddress}poapi/Dashboard/GetOfsByOption`,
      ofOption,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  GetOfGraphDetailsByPartnerID(PartnerID: string): Observable<DashboardGraphStatus | string> {
    return this._httpClient
      .get<DashboardGraphStatus>(`${this.baseAddress}factapi/Fact/GetDashboardGraphStatus?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetOrderFulfilmentDetails(po: any, PatnerID: any): Observable<OrderFulfilmentDetails | string> {
    return this._httpClient
      .get<OrderFulfilmentDetails>(`${this.baseAddress}poapi/Dashboard/GetOrderFulfilmentDetails?PO=${po}&PatnerID=${PatnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  CreateAcknowledgement(ACK: Acknowledgement): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/Dashboard/CreateAcknowledgement`,
      ACK,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

}
