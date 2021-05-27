import { Guid } from 'guid-typescript';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import {
    BPCASNHeader, BPCASNView, BPCASNItem, DocumentCenter, BPCInvoiceAttachment,
    BPCCountryMaster, BPCCurrencyMaster, BPCDocumentCenterMaster, BPCASNPack, ASNListView, BPCASNFieldMaster, BPCASNItemBatch, BPCASNItemView, ASNListFilter, ASNListViewNewDoc
} from 'app/models/ASN';

@Injectable({
    providedIn: 'root'
})
export class ASNService {
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

    GetAllASNs(): Observable<BPCASNHeader[] | string> {
        return this._httpClient.get<BPCASNHeader[]>(`${this.baseAddress}poapi/ASN/GetAllASNs`)
            .pipe(catchError(this.errorHandler));
    }

    GetAllASNByPartnerID(PartnerID: string): Observable<BPCASNHeader[] | string> {
        return this._httpClient.get<BPCASNHeader[]>(`${this.baseAddress}poapi/ASN/GetAllASNByPartnerID?PartnerID=${PartnerID}`)
            .pipe(catchError(this.errorHandler));
    }
    GetAllASNList(): Observable<ASNListView[] | string> {
        return this._httpClient.get<ASNListView[]>(`${this.baseAddress}poapi/ASN/GetAllASNList`)
            .pipe(catchError(this.errorHandler));
    }
    GetAllASNListByPartnerID(PartnerID: string): Observable<ASNListView[] | string> {
        return this._httpClient.get<ASNListView[]>(`${this.baseAddress}poapi/ASN/GetAllASNListByPartnerID?PartnerID=${PartnerID}`)
            .pipe(catchError(this.errorHandler));
    }
    // tslint:disable-next-line:max-line-length
    FilterASNList(VendorCode: string, ASNNumber: string, DocNumber: string, Material: string, Status: string, ASNFromDate: string, ASNToDate: string): Observable<ASNListView[] | string> {
        return this._httpClient.get<ASNListView[]>
            // tslint:disable-next-line:max-line-length
            (`${this.baseAddress}poapi/ASN/FilterASNList?VendorCode=${VendorCode}&ASNNumber=${ASNNumber}&DocNumber=${DocNumber}&Material=${Material}&Status=${Status}&ASNFromDate=${ASNFromDate}&ASNToDate=${ASNToDate}`)
            .pipe(catchError(this.errorHandler));
    }
    FilterASNListByPlants(filter: ASNListFilter): Observable<ASNListViewNewDoc[] | string> {
        return this._httpClient.post<ASNListViewNewDoc[]>
            (`${this.baseAddress}poapi/ASN/FilterASNListByPlants`, filter)
            .pipe(catchError(this.errorHandler));
    }
    // doc
    
    DownloadOfAttachmentOnlyName( AttachmentName: string): Observable<Blob | string> {
    return this._httpClient.get(`${this.baseAddress}poapi/ASN/DownloadOfAttachmentOnlyName?AttachmentName=${AttachmentName}`, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    })
      .pipe(catchError(this.errorHandler));
  }

    // 

    // tslint:disable-next-line:max-line-length
    FilterASNListByPartnerID(PartnerID: string, ASNNumber: string, DocNumber: string, Material: string, Status: string, ASNFromDate: string, ASNToDate: string): Observable<ASNListView[] | string> {
        return this._httpClient.get<ASNListView[]>
            // tslint:disable-next-line:max-line-length
            (`${this.baseAddress}poapi/ASN/FilterASNListByPartnerID?PartnerID=${PartnerID}&ASNNumber=${ASNNumber}&DocNumber=${DocNumber}&Material=${Material}&Status=${Status}&ASNFromDate=${ASNFromDate}&ASNToDate=${ASNToDate}`)
            .pipe(catchError(this.errorHandler));
    }

    // tslint:disable-next-line:max-line-length
    FilterASNListBySER(PartnerID: string, ASNNumber: string, DocNumber: string, Material: string, Status: string, ASNFromDate: string, ASNToDate: string): Observable<ASNListView[] | string> {
        return this._httpClient.get<ASNListView[]>
            // tslint:disable-next-line:max-line-length
            (`${this.baseAddress}poapi/ASN/FilterASNListBySER?PartnerID=${PartnerID}&ASNNumber=${ASNNumber}&DocNumber=${DocNumber}&Material=${Material}&Status=${Status}&ASNFromDate=${ASNFromDate}&ASNToDate=${ASNToDate}`)
            .pipe(catchError(this.errorHandler));
    }

    GetASNByPartnerID(PartnerID: string): Observable<BPCASNHeader | string> {
        return this._httpClient.get<BPCASNHeader>(`${this.baseAddress}poapi/ASN/GetASNByPartnerID?PartnerID=${PartnerID}`)
            .pipe(catchError(this.errorHandler));
    }

    GetASNsByDoc(DocNumber: string): Observable<BPCASNHeader[] | string> {
        return this._httpClient.get<BPCASNHeader[]>(`${this.baseAddress}poapi/ASN/GetASNsByDoc?DocNumber=${DocNumber}`)
            .pipe(catchError(this.errorHandler));
    }
    GetASNByDocAndPartnerID(DocNumber: string, PartnerID: string): Observable<BPCASNHeader[] | string> {
        return this._httpClient.get<BPCASNHeader[]>
            (`${this.baseAddress}poapi/ASN/GetASNsByDoc?DocNumber=${DocNumber}&PartnerID=${PartnerID}`)
            .pipe(catchError(this.errorHandler));
    }
    GetASNByDocAndASN(DocNumber: string, ASNNumber: string): Observable<BPCASNHeader | string> {
        return this._httpClient.get<BPCASNHeader>(`${this.baseAddress}poapi/ASN/GetASNByDocAndASN?DocNumber=${DocNumber}&ASNNumber=${ASNNumber}`)
            .pipe(catchError(this.errorHandler));
    }
    GetASNByASN(ASNNumber: string): Observable<BPCASNHeader | string> {
        return this._httpClient.get<BPCASNHeader>(`${this.baseAddress}poapi/ASN/GetASNByASN?ASNNumber=${ASNNumber}`)
            .pipe(catchError(this.errorHandler));
    }

    CreateASN(ASN: BPCASNView): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}poapi/ASN/CreateASN`,
            ASN,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    UpdateASN(ASN: BPCASNView): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}poapi/ASN/UpdateASN`,
            ASN,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    DeleteASN(ASN: BPCASNHeader): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}poapi/ASN/DeleteASN`,
            ASN,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }
    GetAllASNFieldMaster(): Observable<BPCASNFieldMaster[] | string> {
        return this._httpClient.get<BPCASNFieldMaster[]>(`${this.baseAddress}poapi/ASN/GetAllASNFieldMaster`)
            .pipe(catchError(this.errorHandler));
    }
    GetASNFieldMasterByType(type: string): Observable<BPCASNFieldMaster[] | string> {
        return this._httpClient.get<BPCASNFieldMaster[]>(`${this.baseAddress}poapi/ASN/GetASNFieldMasterByType?DocType=${type}`)
            .pipe(catchError(this.errorHandler));
    }
    UpdateASNFieldMaster(ASNField: BPCASNFieldMaster): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}poapi/ASN/UpdateASNFieldMaster`,
            ASNField,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }
    GetArrivalDateIntervalByPO(DocNumber: string): Observable<number | string> {
        return this._httpClient.get<number>(`${this.baseAddress}poapi/ASN/GetArrivalDateIntervalByPO?DocNumber=${DocNumber}`)
            .pipe(catchError(this.errorHandler));
    }
    GetArrivalDateIntervalByPOAndPartnerID(DocNumber: string, PartnerID: string): Observable<number | string> {
        return this._httpClient.get<number>(`${this.baseAddress}poapi/ASN/GetArrivalDateIntervalByPOAndPartnerID?DocNumber=${DocNumber}&PartnerID=${PartnerID}`)
            .pipe(catchError(this.errorHandler));
    }
    GetASNItemsByASN(ASNNumber: string): Observable<BPCASNItem[] | string> {
        return this._httpClient.get<BPCASNItem[]>(`${this.baseAddress}poapi/ASN/GetASNItemsByASN?ASNNumber=${ASNNumber}`)
            .pipe(catchError(this.errorHandler));
    }
    GetASNItemsWithBatchesByASN(ASNNumber: string): Observable<BPCASNItemView[] | string> {
        return this._httpClient.get<BPCASNItemView[]>(`${this.baseAddress}poapi/ASN/GetASNItemsWithBatchesByASN?ASNNumber=${ASNNumber}`)
            .pipe(catchError(this.errorHandler));
    }
    GetASNItemBatchesByASN(ASNNumber: string): Observable<BPCASNItemBatch[] | string> {
        return this._httpClient.get<BPCASNItemBatch[]>(`${this.baseAddress}poapi/ASN/GetASNItemBatchesByASN?ASNNumber=${ASNNumber}`)
            .pipe(catchError(this.errorHandler));
    }
    GetASNPacksByASN(ASNNumber: string): Observable<BPCASNPack[] | string> {
        return this._httpClient.get<BPCASNPack[]>(`${this.baseAddress}poapi/ASN/GetASNPacksByASN?ASNNumber=${ASNNumber}`)
            .pipe(catchError(this.errorHandler));
    }
    GetDocumentCentersByASN(ASNNumber: string): Observable<DocumentCenter[] | string> {
        return this._httpClient.get<DocumentCenter[]>(`${this.baseAddress}poapi/ASN/GetDocumentCentersByASN?ASNNumber=${ASNNumber}`)
            .pipe(catchError(this.errorHandler));
    }

    AddInvoiceAttachment(ASNNumber: string, CreatedBy: string, selectedFile: File): Observable<any> {
        const formData: FormData = new FormData();
        if (selectedFile) {
            formData.append(selectedFile.name, selectedFile, selectedFile.name);
        }
        formData.append('ASNNumber', ASNNumber);
        formData.append('CreatedBy', CreatedBy.toString());

        return this._httpClient.post<any>(`${this.baseAddress}poapi/ASN/AddInvoiceAttachment`,
            formData,
            // {
            //   headers: new HttpHeaders({
            //     'Content-Type': 'application/json'
            //   })
            // }
        ).pipe(catchError(this.errorHandler));

    }

    AddDocumentCenterAttachment(ASNNumber: string, CreatedBy: string, selectedFiles: File[]): Observable<any> {
        const formData: FormData = new FormData();
        if (selectedFiles && selectedFiles.length) {
            selectedFiles.forEach(x => {
                formData.append(x.name, x, x.name);
            });
        }
        formData.append('ASNNumber', ASNNumber);
        formData.append('CreatedBy', CreatedBy.toString());

        return this._httpClient.post<any>(`${this.baseAddress}poapi/ASN/AddDocumentCenterAttachment`,
            formData,
            // {
            //   headers: new HttpHeaders({
            //     'Content-Type': 'application/json'
            //   })
            // }
        ).pipe(catchError(this.errorHandler));
    }

    DowloandInvoiceAttachment(AttachmentName: string, ASNNumber: string): Observable<Blob | string> {
        return this._httpClient.get(`${this.baseAddress}poapi/ASN/DowloandInvoiceAttachment?AttachmentName=${AttachmentName}&ASNNumber=${ASNNumber}`, {
            responseType: 'blob',
            headers: new HttpHeaders().append('Content-Type', 'application/json')
        })
            .pipe(catchError(this.errorHandler));
    }

    DowloandDocumentCenterAttachment(AttachmentName: string, ASNNumber: string): Observable<Blob | string> {
        return this._httpClient.get(`${this.baseAddress}poapi/ASN/DowloandDocumentCenterAttachment?AttachmentName=${AttachmentName}&ASNNumber=${ASNNumber}`, {
            responseType: 'blob',
            headers: new HttpHeaders().append('Content-Type', 'application/json')
        })
            .pipe(catchError(this.errorHandler));
    }


    CreateASNPdf(ASNNumber: string): Observable<Blob | string> {
        return this._httpClient.get(`${this.baseAddress}poapi/ASN/CreateASNPdf?ASNNumber=${ASNNumber}`, {
            responseType: 'blob',
            headers: new HttpHeaders().append('Content-Type', 'application/json')
        })
            .pipe(catchError(this.errorHandler));
    }

    GetInvoiceAttachmentByASN(ASNNumber: string, InvDocReferenceNo: string): Observable<BPCInvoiceAttachment | string> {
        return this._httpClient.get<BPCInvoiceAttachment>(`${this.baseAddress}poapi/ASN/GetInvoiceAttachmentByASN?ASNNumber=${ASNNumber}&InvDocReferenceNo=${InvDocReferenceNo}`)
            .pipe(catchError(this.errorHandler));
    }

    GetAllBPCCountryMasters(): Observable<BPCCountryMaster[] | string> {
        return this._httpClient.get<BPCCountryMaster[]>(`${this.baseAddress}poapi/Master/GetAllBPCCountryMasters`)
            .pipe(catchError(this.errorHandler));
    }
    GetAllBPCCurrencyMasters(): Observable<BPCCurrencyMaster[] | string> {
        return this._httpClient.get<BPCCurrencyMaster[]>(`${this.baseAddress}poapi/Master/GetAllBPCCurrencyMasters`)
            .pipe(catchError(this.errorHandler));
    }
    GetAllDocumentCenterMaster(): Observable<BPCDocumentCenterMaster[] | string> {
        return this._httpClient.get<BPCDocumentCenterMaster[]>(`${this.baseAddress}poapi/Master/GetAllDocumentCenterMaster`)
            .pipe(catchError(this.errorHandler));
    }

}
