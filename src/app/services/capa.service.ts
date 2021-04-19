import { Guid } from 'guid-typescript';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { CAPAAcceptItems, CAPAAttachment, CAPADialogResponseFiles, CAPAReqHeader, CAPAReqItem, CAPAReqItems, CAPAReqView, CAPAResItem, CAPAResItemView, CAPAResponseView } from 'app/models/CAPA';
@Injectable({
  providedIn: 'root'
})
export class CapaService {
  baseAddress: string;
  constructor(private _httpClient: HttpClient,
    private _authService: AuthService) {
    this.baseAddress = _authService.baseAddress;
  }

  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error instanceof Object ? error.error.Message ? error.error.Message : error.error : error.error || error.message || 'Server Error');
  }
  CreateCAPAReq(CAPA: CAPAReqView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}capaapi/CAPA/CreateCAPAReq`,
      CAPA,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  GetAllCAPAReqs(partnerID: any): Observable<CAPAReqItems[] | string> {
    return this._httpClient.get<CAPAReqItems[]>(`${this.baseAddress}capaapi/CAPA/GetAllCAPAReqs?PatnerID=${partnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetCAPAReqByReqId(ReqId: any): Observable<any> {
    return this._httpClient.get<CAPAReqView>(`${this.baseAddress}capaapi/CAPA/GetCAPAReqByReqId?ReqId=${ReqId}`)
      .pipe(catchError(this.errorHandler));
  }
  GetRespondCAPAReqs(ReqId: any): Observable<any> {
    return this._httpClient.get<CAPAAcceptItems>(`${this.baseAddress}capaapi/CAPA/GetRespondCAPAReqs?ReqId=${ReqId}`)
      .pipe(catchError(this.errorHandler));
  }
  GetBuyerRespondCAPAReqs(ReqId: any,patnerID:string): Observable<any> {
    return this._httpClient.get<CAPAAcceptItems>(`${this.baseAddress}capaapi/CAPA/GetBuyerRespondCAPAReqs?ReqId=${ReqId}&patnerID=${patnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetCAPAReqHeadersByVendorID(Vendorid: string): Observable<CAPAReqHeader[] | string> {
    return this._httpClient.get<CAPAReqHeader[]>(`${this.baseAddress}capaapi/CAPA/GetCAPAReqHeadersByVendorID?Vendorid=${Vendorid}`)
      .pipe(catchError(this.errorHandler));
  }

  CreateCAPAResponse(CAPA: CAPAResponseView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}capaapi/CAPA/CreateCAPAResponse`,
      CAPA,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  AcceptCAPAResponseItem(CAPA: CAPAAcceptItems[]): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}capaapi/CAPA/AcceptCAPAResponseItem`,
      CAPA,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  GetVendorDetails(CAPA: any[]): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}capaapi/CAPA/GetVendorDetails`,
      CAPA,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  RejectCAPAResponseItem(CAPA: CAPAAcceptItems[]): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}capaapi/CAPA/RejectCAPAResponseItem`,
      CAPA,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  UploadOfAttachment(selectedFile: CAPADialogResponseFiles, ReqId: any): Observable<any> {
    let formData = new FormData();
    if (selectedFile) {
      formData.append(selectedFile.Files.name, selectedFile.Files, selectedFile.Files.name);
    }
    formData.append('ReqItemID', selectedFile.ReqItemID.toString());
    formData.append('ReqID', ReqId.toString());
    formData.append('PatnerID', selectedFile.PatnerID);
    return this._httpClient.post<any>(`${this.baseAddress}capaapi/CAPA/UploadOfAttachment`,
      formData,
    ).pipe(catchError(this.errorHandler));
  }
  // DownloadOfAttachment(ReqID: number, ReqItemID: number, ResItemID: number): Observable<Blob | string> {
  //   return this._httpClient.get(`${this.baseAddress}capaapi/CAPA/DownloadOfAttachment?ReqID=${ReqID}&ReqItemID=${ReqItemID}&ResItemID=${ResItemID}`, {
  //     responseType: 'blob',
  //     headers: new HttpHeaders().append('Content-Type', 'application/json')
  //   }).pipe(catchError(this.errorHandler));
  // }
  DownloadOfAttachment(ReqID: number, ReqItemID: number, ResItemID: number): Observable<any> {
    return this._httpClient.get<CAPAAttachment>(`${this.baseAddress}capaapi/CAPA/DownloadOfAttachment?ReqID=${ReqID}&ReqItemID=${ReqItemID}&ResItemID=${ResItemID}`)
    .pipe(catchError(this.errorHandler));
  }
  ViewResponseItem(ReqID: number, ReqItemID: number,PatnerID:string): Observable<CAPAResItemView | string > {
    return this._httpClient.get<CAPAResItemView>(`${this.baseAddress}capaapi/CAPA/ViewResponseItem?ReqID=${ReqID}&ReqItemID=${ReqItemID}&PatnerID=${PatnerID}`)
    .pipe(catchError(this.errorHandler));
  }
  GetCAPABuyerResponseItem(ReqID: number, PatnerID: string,Status:string): Observable<CAPAReqItem[] | string> {
    return this._httpClient.get<CAPAReqItem[]>(`${this.baseAddress}capaapi/CAPA/GetCAPABuyerResponseItem?ReqID=${ReqID}&PatnerID=${PatnerID}&Status=${Status}`)
    .pipe(catchError(this.errorHandler));
  }
}
