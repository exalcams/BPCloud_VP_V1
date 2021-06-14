import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { POScheduleLineView, BPCOFSubcon, SubconItems, BPCOFSubconView } from 'app/models/OrderFulFilment';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SubconService {

  baseAddress: string;

  constructor(private _httpClient: HttpClient, private _authService: AuthService) {
    this.baseAddress = _authService.baseAddress;
  }

  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error instanceof Object ? error.error.Message ? error.error.Message : error.error : error.error || error.message || 'Server Error');
  }

  GetPOSLByDocAndPartnerID(DocNumber: string, PartnerID: string): Observable<POScheduleLineView[] | string> {
    return this._httpClient.get<POScheduleLineView[]>
      (`${this.baseAddress}poapi/PO/GetPOSLByDocAndPartnerID?DocNumber=${DocNumber}&PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  CreateSubcon(subcons: SubconItems): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/Subcon/CreateSubcon`,
      subcons,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  DeleteSubcon(subcon: BPCOFSubcon): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/Subcon/DeleteSubcon`,
      subcon,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  GetSubconByDocAndPartnerID(DocNumber: string, PartnerID: string): Observable<BPCOFSubcon[] | string> {
    return this._httpClient.get<BPCOFSubcon[]>
      (`${this.baseAddress}poapi/Subcon/GetSubconByDocAndPartnerID?DocNumber=${DocNumber}&PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetSubconByItemAndPartnerID(DocNumber: string, Item: string, PartnerID: string): Observable<BPCOFSubcon[] | string> {
    return this._httpClient.get<BPCOFSubcon[]>
      (`${this.baseAddress}poapi/Subcon/GetSubconByItemAndPartnerID?DocNumber=${DocNumber}&Item=${Item}&PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetSubconBySLAndPartnerID(DocNumber: string, Item: string, SlLine: string, PartnerID: string): Observable<BPCOFSubcon[] | string> {
    return this._httpClient.get<BPCOFSubcon[]>
      (`${this.baseAddress}poapi/Subcon/GetSubconBySLAndPartnerID?DocNumber=${DocNumber}&Item=${Item}&SlLine=${SlLine}&PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetSubconViewByDocAndPartnerID(DocNumber: string, PartnerID: string): Observable<BPCOFSubconView[] | string> {
    return this._httpClient.get<BPCOFSubconView[]>
      (`${this.baseAddress}poapi/Subcon/GetSubconViewByDocAndPartnerID?DocNumber=${DocNumber}&PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
}
