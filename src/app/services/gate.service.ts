// import { Injectable } from '@angular/core';
import { Guid } from 'guid-typescript';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { BPCGateHoveringVechicles } from 'app/models/Gate';
import { ASNListView } from 'app/models/ASN';
@Injectable({
  providedIn: 'root'
})
export class GateService {
  baseAddress: string;
  constructor(private _httpClient: HttpClient, private _authService: AuthService) {
    this.baseAddress = _authService.baseAddress;
  }
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error instanceof Object ? error.error.Message ? error.error.Message : error.error : error.error || error.message || 'Server Error');
  }
  CreateGateHV(HV: BPCGateHoveringVechicles): Observable<any> {
    console.log("Gate", HV);
    return this._httpClient.post<any>(`${this.baseAddress}poapi/Gate/CreateAllVechicleTurnAround`,
      HV,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  CreateGateEntryByAsnList(ASN: ASNListView): Observable<any> {
    // console.log("Gate", HV);
    return this._httpClient.post<any>(`${this.baseAddress}poapi/Gate/CreateGateEntryByAsnList`,
    ASN,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  CancelGateEntryByAsnList(ASN: ASNListView): Observable<any> {
    // console.log("Gate", HV);
    return this._httpClient.post<any>(`${this.baseAddress}poapi/Gate/CancelGateEntryByAsnList`,
    ASN,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
}
