import { Injectable } from '@angular/core';
import { Subject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { Guid } from 'guid-typescript';
import { BPCFLIPHeaderView, BPCFLIPHeader, BPCFLIPCost, BPCFLIPItem, BPCExpenseTypeMaster, BPCTaxTypeMaster } from 'app/models/po-flip';

@Injectable({
  providedIn: 'root'
})
export class POFlipService {

  baseAddress: string;

  constructor(private _httpClient: HttpClient, private _authService: AuthService) {
    this.baseAddress = _authService.baseAddress;
  }

  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error || error.message || 'Server Error');
  }

  // POFLIPs
  GetPOFLIPsByPartnerID(PartnerID: string): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}poapi/PO/GetPOFLIPsByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetPOFLIPsByDocAndPartnerID(DocNumber: string, PartnerID: string): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}poapi/PO/GetPOFLIPsByDocAndPartnerID?DocNumber=${DocNumber}&PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  CreatePOFLIP(POFLIP: BPCFLIPHeaderView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/PO/CreatePOFLIP`,
      POFLIP,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  UpdatePOFLIP(POFLIP: BPCFLIPHeaderView): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/PO/UpdatePOFLIP`,
      POFLIP,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  DeletePOFLIP(POFLIP: BPCFLIPHeader): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/PO/DeletePOFLIP`,
      POFLIP,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  AddPOFLIPAttachment(FLIPID: string, CreatedBy: string, selectedFiles: File[]): Observable<any> {
    const formData: FormData = new FormData();
    if (selectedFiles && selectedFiles.length) {
      selectedFiles.forEach(x => {
        formData.append(x.name, x, x.name);
      });
    }
    formData.append('FLIPID', FLIPID);
    formData.append('CreatedBy', CreatedBy);
    return this._httpClient.post<any>(`${this.baseAddress}poapi/PO/AddPOFLIPAttachment`,
      formData,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));

  }

  GetFLIPItemsByFLIPID(FLIPID: string): Observable<BPCFLIPItem[] | string> {
    return this._httpClient.get<BPCFLIPItem[]>(`${this.baseAddress}poapi/PO/GetFLIPItemsByFLIPID?FLIPID=${FLIPID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetFlipAttachmentByDocNumber(DocNumber: string, AttachmentName: string): Observable<Blob | string> {
    return this._httpClient.get(`${this.baseAddress}poapi/PO/GetFlipAttachmentByDocNumber?DocNumber=${DocNumber}&AttachmentName=${AttachmentName}`, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    })
      .pipe(catchError(this.errorHandler));
  }
  GetFLIPCostsByFLIPID(FLIPID: string): Observable<BPCFLIPCost[] | string> {
    return this._httpClient.get<BPCFLIPCost[]>(`${this.baseAddress}poapi/PO/GetFLIPCostsByFLIPID?FLIPID=${FLIPID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetExpenseTypeMasters(): Observable<BPCExpenseTypeMaster[] | string> {
    return this._httpClient.get<BPCExpenseTypeMaster[]>(`${this.baseAddress}poapi/Master/GetExpenseTypeMasters`)
      .pipe(catchError(this.errorHandler));
  }
  GetTaxTypeMasters(): Observable<BPCTaxTypeMaster[] | string> {
    return this._httpClient.get<BPCTaxTypeMaster[]>(`${this.baseAddress}poapi/Master/GetTaxTypeMasters`)
      .pipe(catchError(this.errorHandler));
  }

}
