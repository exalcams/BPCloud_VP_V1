import { Guid } from 'guid-typescript';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, Subject } from 'rxjs';
import { _MatChipListMixinBase } from '@angular/material';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import {
  PO, OrderFulfilmentDetails, Acknowledgement, OfOption, DashboardGraphStatus,
  FulfilmentStatus, ItemDetails, ASNDetails, GRNDetails, RETURNDetails, QADetails, SLDetails, DocumentDetails, FlipDetails, FulfilmentDetails, OfOption1
} from 'app/models/Dashboard';
import { BPCPIHeader, SODetails } from 'app/models/customer';
import { BPCKRA, CustomerBarChartData } from 'app/models/fact';
import { BPCOFHeader, BPCOFAIACT, BPCPlantMaster, BPCOFHeaderView, BPCOFHeaderView1 } from 'app/models/OrderFulFilment';
import { BPCASNItemSES, BPCInvoiceAttachment } from 'app/models/ASN';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
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

  GetOfsByPartnerID(PartnerID: any): Observable<BPCOFHeaderView[] | string> {
    return this._httpClient.get<BPCOFHeaderView[]>(`${this.baseAddress}poapi/Dashboard/GetOfsByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetOfsByImportVendor(ImportVendor: any): Observable<BPCOFHeaderView[] | string> {
    return this._httpClient.get<BPCOFHeaderView[]>(`${this.baseAddress}poapi/Dashboard/GetOfsByImportVendor?ImportVendor=${ImportVendor}`)
      .pipe(catchError(this.errorHandler));
  }

  GetOfsByOption(ofOption: OfOption): Observable<BPCOFHeaderView[] | string> {
    return this._httpClient.post<BPCOFHeaderView[]>(`${this.baseAddress}poapi/Dashboard/GetOfsByOption`,
      ofOption,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  GetOfsByOptionForImportVendor(ofOption: OfOption): Observable<BPCOFHeaderView[] | string> {
    return this._httpClient.post<BPCOFHeaderView[]>(`${this.baseAddress}poapi/Dashboard/GetOfsByOptionForImportVendor`,
      ofOption,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  GetOFHeaderView1ByPartnerID(PartnerID: any): Observable<BPCOFHeaderView1[] | string> {
    return this._httpClient.get<BPCOFHeaderView1[]>(`${this.baseAddress}poapi/Dashboard/GetOFHeaderView1ByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetOFHeaderView1ByImportVendor(ImportVendor: any): Observable<BPCOFHeaderView1[] | string> {
    return this._httpClient.get<BPCOFHeaderView1[]>(`${this.baseAddress}poapi/Dashboard/GetOFHeaderView1ByImportVendor?ImportVendor=${ImportVendor}`)
      .pipe(catchError(this.errorHandler));
  }
  GetOFHeaderView1ByOption(ofOption: OfOption1): Observable<BPCOFHeaderView1[] | string> {
    return this._httpClient.post<BPCOFHeaderView1[]>(`${this.baseAddress}poapi/Dashboard/GetOFHeaderView1ByOption`,
      ofOption,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  GetOFHeaderView1ByOptionByImportVendor(ofOption: OfOption1): Observable<BPCOFHeaderView1[] | string> {
    return this._httpClient.post<BPCOFHeaderView1[]>(`${this.baseAddress}poapi/Dashboard/GetOFHeaderView1ByOptionByImportVendor`,
      ofOption,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }
  GetOfStatusByPartnerID(PartnerID: any): Observable<FulfilmentStatus | string> {
    return this._httpClient.get<FulfilmentStatus>(`${this.baseAddress}poapi/Dashboard/GetOfStatusByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetOfGraphDetailsByPartnerID(PartnerID: string): Observable<DashboardGraphStatus | string> {
    return this._httpClient
      .get<DashboardGraphStatus>(`${this.baseAddress}factapi/Fact/GetDashboardGraphStatus?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetOfItemsByPartnerIDAndDocNumber(PartnerID: any, DocNumber: any): Observable<ItemDetails[] | string> {
    return this._httpClient
      .get<ItemDetails[]>(`${this.baseAddress}poapi/Dashboard/GetOfItemsByPartnerIDAndDocNumber?PartnerID=${PartnerID}&DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }

  CreatePOPdf(DocNumber: string): Observable<Blob | string> {
    return this._httpClient.get(`${this.baseAddress}poapi/PO/CreatePOPdf?DocNumber=${DocNumber}`, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    })
      .pipe(catchError(this.errorHandler));
  }
  PrintPO(DocNumber: string): Observable<Blob | string> {
    return this._httpClient.get(`${this.baseAddress}poapi/PO/PrintPO?DocNumber=${DocNumber}`, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    })
      .pipe(catchError(this.errorHandler));
  }

  GetOfASNsByPartnerIDAndDocNumber(PartnerID: any, DocNumber: any): Observable<ASNDetails[] | string> {
    return this._httpClient
      .get<ASNDetails[]>(`${this.baseAddress}poapi/Dashboard/GetOfASNsByPartnerIDAndDocNumber?PartnerID=${PartnerID}&DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }

  GetOfGRGIsByPartnerIDAndDocNumber(PartnerID: any, DocNumber: any): Observable<GRNDetails[] | string> {
    return this._httpClient
      .get<GRNDetails[]>(`${this.baseAddress}poapi/Dashboard/GetOfGRGIsByPartnerIDAndDocNumber?PartnerID=${PartnerID}&DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }
  GetGRGIsByPartnerIDAndDocNumber(PartnerID: any, DocNumber: any): Observable<GRNDetails[] | string> {
    return this._httpClient
      .get<GRNDetails[]>(`${this.baseAddress}poapi/Dashboard/GetGRGIsByPartnerIDAndDocNumber?PartnerID=${PartnerID}&DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }
  GetCancelGRGIsByPartnerIDAndDocNumber(PartnerID: any, DocNumber: any): Observable<GRNDetails[] | string> {
    return this._httpClient
      .get<GRNDetails[]>(`${this.baseAddress}poapi/Dashboard/GetCancelGRGIsByPartnerIDAndDocNumber?PartnerID=${PartnerID}&DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }
  GetOfQMsByPartnerIDAndDocNumber(PartnerID: any, DocNumber: any): Observable<QADetails[] | string> {
    return this._httpClient
      .get<QADetails[]>(`${this.baseAddress}poapi/Dashboard/GetOfQMsByPartnerIDAndDocNumber?PartnerID=${PartnerID}&DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }

  GetOfSLsByPartnerIDAndDocNumber(PartnerID: any, DocNumber: any): Observable<SLDetails[] | string> {
    return this._httpClient
      .get<SLDetails[]>(`${this.baseAddress}poapi/Dashboard/GetOfSLsByPartnerIDAndDocNumber?PartnerID=${PartnerID}&DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }

  GetOfDocumentsByPartnerIDAndDocNumber(PartnerID: any, DocNumber: any): Observable<DocumentDetails[] | string> {
    return this._httpClient
      .get<DocumentDetails[]>(`${this.baseAddress}poapi/Dashboard/GetOfDocumentsByPartnerIDAndDocNumber?PartnerID=${PartnerID}&DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }

  GetOfFlipsByPartnerIDAndDocNumber(PartnerID: any, DocNumber: any): Observable<FlipDetails[] | string> {
    return this._httpClient
      .get<FlipDetails[]>(`${this.baseAddress}poapi/Dashboard/GetOfFlipsByPartnerIDAndDocNumber?PartnerID=${PartnerID}&DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }

  UploadOfAttachment(PartnerID: string, DocNumber: string, CreatedBy: string, selectedFile: File): Observable<any> {
    const formData: FormData = new FormData();
    if (selectedFile) {
      formData.append(selectedFile.name, selectedFile, selectedFile.name);
    }
    formData.append('PartnerID', PartnerID);
    formData.append('DocNumber', DocNumber);
    formData.append('CreatedBy', CreatedBy.toString());

    return this._httpClient.post<any>(`${this.baseAddress}poapi/Dashboard/UploadOfAttachment`,
      formData,
    ).pipe(catchError(this.errorHandler));

  }

  DownloadOfAttachment(PartnerID: string, AttachmentName: string, DocNumber: string): Observable<Blob | string> {
    return this._httpClient.get(`${this.baseAddress}poapi/Dashboard/DownloadOfAttachment?PartnerID=${PartnerID}&AttachmentName=${AttachmentName}&DocNumber=${DocNumber}`, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    })
      .pipe(catchError(this.errorHandler));
  }

  GetOfAttachmentsByPartnerIDAndDocNumber(PartnerID: string, DocNumber: string): Observable<BPCInvoiceAttachment[] | string> {
    return this._httpClient
      .get<BPCInvoiceAttachment[]>(`${this.baseAddress}poapi/Dashboard/GetOfAttachmentsByPartnerIDAndDocNumber?PartnerID=${PartnerID}&DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }

  // AIACT

  GetAIACTsByPartnerID(PartnerID: string): Observable<BPCOFAIACT[] | string> {
    return this._httpClient.get<BPCOFAIACT[]>(`${this.baseAddress}poapi/Dashboard/GetAIACTsByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetActionsByPartnerID(PartnerID: string): Observable<BPCOFAIACT[] | string> {
    return this._httpClient.get<BPCOFAIACT[]>(`${this.baseAddress}poapi/Dashboard/GetActionsByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetBPCOFHeader(PartnerID: string, refNo: string): Observable<BPCOFHeader | string> {
    return this._httpClient.get<BPCOFHeader>(`${this.baseAddress}poapi/Dashboard/GetBPCOFHeader?PartnerID=${PartnerID}&ReferenceNo=${refNo}`)
      .pipe(catchError(this.errorHandler));
  }
  GetBPCOFHeaderByImportVendor(ImportVendor: string, refNo: string): Observable<BPCOFHeader | string> {
    return this._httpClient.get<BPCOFHeader>(`${this.baseAddress}poapi/Dashboard/GetBPCOFHeaderByImportVendor?ImportVendor=${ImportVendor}&ReferenceNo=${refNo}`)
      .pipe(catchError(this.errorHandler));
  }
  GetOFItemSESByItem(item: string, DocumentNo: string, partnerId: string): Observable<BPCASNItemSES | string> {
    return this._httpClient.get<BPCASNItemSES>(`${this.baseAddress}poapi/PO/GetOFItemSESByItem?item=${item}&DocumentNo=${DocumentNo}&PartnerId=${partnerId}`)
      .pipe(catchError(this.errorHandler));
  }
  GetNotificationsByPartnerID(PartnerID: string): Observable<BPCOFAIACT[] | string> {
    return this._httpClient.get<BPCOFAIACT[]>(`${this.baseAddress}poapi/Dashboard/GetNotificationsByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  UpdateNotification(notification: BPCOFAIACT): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/Dashboard/UpdateNotification`,
      notification,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  AcceptAIACT(AIACT: BPCOFAIACT): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/Dashboard/AcceptAIACT`,
      AIACT,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  AcceptAIACTs(AIACT: any): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/Dashboard/AcceptAIACTs`,
      AIACT,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  RejectAIACT(AIACT: BPCOFAIACT): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/Dashboard/RejectAIACT`,
      AIACT,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  // Ramanji Methods(Vendor)

  GetPODetails(PatnerID: any): Observable<any | string> {
    return this._httpClient.get<any>(`${this.baseAddress}poapi/Dashboard/GetPODetails?PatnerID=${PatnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetOrderFulfilmentDetails(po: any, PatnerID: any): Observable<OrderFulfilmentDetails | string> {
    return this._httpClient
      .get<OrderFulfilmentDetails>(`${this.baseAddress}poapi/Dashboard/GetOrderFulfilmentDetails?PO=${po}&PatnerID=${PatnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetOrderFulfilmentDetailsByImportVendor(po: any, ImportVendor: any): Observable<OrderFulfilmentDetails | string> {
    return this._httpClient
      .get<OrderFulfilmentDetails>(`${this.baseAddress}poapi/Dashboard/GetOrderFulfilmentDetailsByImportVendor?PO=${po}&ImportVendor=${ImportVendor}`)
      .pipe(catchError(this.errorHandler));
  }

  GetItemPlantDetails(PlantCode: string): Observable<BPCPlantMaster | string> {
    return this._httpClient
      .get<BPCPlantMaster>(`${this.baseAddress}poapi/Dashboard/GetItemPlantDetails?PlantCode=${PlantCode}`)
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
  UpdatePOItems(ACK: Acknowledgement): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/Dashboard/UpdatePOItems`,
      ACK,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  GetAllPOBasedOnDate(poSearch: OfOption): Observable<PO[] | string> {
    return this._httpClient.post<PO[]>(`${this.baseAddress}poapi/Dashboard/GetAllPOBasedOnDate`,
      poSearch,
      {
        headers: new HttpHeaders({
          'Content-Type': 'application/json'
        })
      })
      .pipe(catchError(this.errorHandler));
  }

  GetDashboardGraphStatus(PartnerID: string): Observable<DashboardGraphStatus | string> {
    return this._httpClient
      .get<DashboardGraphStatus>(`${this.baseAddress}factapi/Fact/GetDashboardGraphStatus?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  // Customer

  GetSODetails(Client: string, Company: string, Type: string, PatnerID: string): Observable<SODetails[] | string> {
    return this._httpClient.get<SODetails[]>(`${this.baseAddress}poapi/Dashboard/GetSODetails?Client=${Client}&Company=${Company}&Type=${Type}&PatnerID=${PatnerID}`)
      .pipe(catchError(this.errorHandler));
  }


  GetFilteredSODetailsByPartnerID(Type: string, PatnerID: string, FromDate: string, ToDate: string, Status: string): Observable<SODetails[] | string> {
    return this._httpClient.get<SODetails[]>
      (`${this.baseAddress}poapi/Dashboard/GetFilteredSODetailsByPartnerID?Type=${Type}&PartnerID=${PatnerID}&FromDate=${FromDate}&ToDate=${ToDate}&Status=${Status}`)
      .pipe(catchError(this.errorHandler));
  }

  GetVendorKRAProcessCircle(PartnerID: string): Observable<BPCKRA | string> {
    return this._httpClient.get<BPCKRA>(`${this.baseAddress}factapi/Fact/GetVendorKRAProcessCircle?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetVendorPPMProcessCircle(PartnerID: string): Observable<BPCKRA | string> {
    return this._httpClient.get<BPCKRA>(`${this.baseAddress}factapi/Fact/GetVendorPPMProcessCircle?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetVendorDoughnutChartData(PartnerID: string): Observable<FulfilmentDetails[] | string> {
    return this._httpClient.get<FulfilmentDetails[]>(`${this.baseAddress}poapi/Dashboard/GetVendorDoughnutChartData?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetVendorDoughnutChartDataByImportVendor(ImportVendor: string): Observable<FulfilmentDetails[] | string> {
    return this._httpClient.get<FulfilmentDetails[]>(`${this.baseAddress}poapi/Dashboard/GetVendorDoughnutChartDataByImportVendor?ImportVendor=${ImportVendor}`)
      .pipe(catchError(this.errorHandler));
  }
  GetCustomerDoughnutChartData(PartnerID: string): Observable<BPCKRA[] | string> {
    return this._httpClient.get<BPCKRA[]>(`${this.baseAddress}factapi/Fact/GetCustomerDoughnutChartData?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetCustomerOpenProcessCircle(PartnerID: string): Observable<BPCKRA | string> {
    return this._httpClient.get<BPCKRA>(`${this.baseAddress}factapi/Fact/GetCustomerOpenProcessCircle?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetCustomerCreditLimitProcessCircle(PartnerID: string): Observable<BPCKRA | string> {
    return this._httpClient.get<BPCKRA>(`${this.baseAddress}factapi/Fact/GetCustomerCreditLimitProcessCircle?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetCustomerBarChartData(PartnerID: string): Observable<CustomerBarChartData | string> {
    return this._httpClient.get<CustomerBarChartData>(`${this.baseAddress}factapi/Fact/GetCustomerBarChartData?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

}
