import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import { BPCOFHeader, BPCOFItem, BPCOFHeaderXLSX, BPCOFItemXLSX, BPCOFScheduleLineXLSX, BPCOFGRGIXLSX, BPCOFQMXLSX, BPCOFGRGI, SOItemCount, 
// BPCOFItemView, BPCInvoice, BPCRetNew, BPCOFHeaderView } from 'app/models/OrderFulFilment';
import {
  BPCOFHeader, BPCOFItem, BPCOFHeaderXLSX, BPCOFItemXLSX, BPCOFScheduleLineXLSX, BPCOFGRGIXLSX, BPCOFQMXLSX, BPCOFGRGI, SOItemCount,
  BPCOFItemView, BPCInvoice, BPCRetNew, InvoiceVendor, BPCOFHeaderView
} from 'app/models/OrderFulFilment';
import { BPCCEOMessage, BPCSCOCMessage, BPCWelcomeMessage } from 'app/models/Message.model';
import { BPCFact } from 'app/models/fact';
import { OverviewReportOption } from 'app/models/ReportModel';
import { BPCInvoicePayment, BPCInvoicePayView, BPCPayRecord } from 'app/models/customer';
import { DocumentDetails } from 'app/models/Dashboard';


@Injectable({
  providedIn: 'root'
})
export class POService {

  baseAddress: string;

  constructor(private _httpClient: HttpClient, private _authService: AuthService) {
    this.baseAddress = _authService.baseAddress;

  }

  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error || error.message || 'Server Error');
  }

  // POs
  GetAllPOList(): Observable<BPCOFHeader[] | string> {
    return this._httpClient.get<BPCOFHeader[]>(`${this.baseAddress}poapi/PO/GetAllPOList`)
      .pipe(catchError(this.errorHandler));
  }
  FilterPOList(VendorCode: string, PONumber: string, Status: string, FromDate: string, ToDate: string): Observable<BPCOFHeader[] | string> {
    // tslint:disable-next-line:max-line-length
    return this._httpClient.get<BPCOFHeader[]>(`${this.baseAddress}poapi/PO/FilterPOList?VendorCode=${VendorCode}&PONumber=${PONumber}&Status=${Status}&FromDate=${FromDate}&ToDate=${ToDate}`)
      .pipe(catchError(this.errorHandler));
  }
  GetPOByDoc(DocNumber: string): Observable<BPCOFHeader | string> {
    return this._httpClient.get<any>(`${this.baseAddress}poapi/PO/GetPOByDoc?DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }
  GetOFDocumentDetails(DocNumber: string): Observable<DocumentDetails[] | string> {
    return this._httpClient.get<DocumentDetails[]>(`${this.baseAddress}poapi/PO/GetOFDocumentDetails?DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }
  DownloadOFAttachment(AttachmentName: string, DocNumber: string): Observable<Blob | string> {
    return this._httpClient.get(`${this.baseAddress}poapi/PO/DownloadOFAttachment?AttachmentName=${AttachmentName}&DocNumber=${DocNumber}`, {
      responseType: 'blob',
      headers: new HttpHeaders().append('Content-Type', 'application/json')
    })
      .pipe(catchError(this.errorHandler));
  }
  GetPOByDocAndPartnerID(DocNumber: string, PartnerID: string): Observable<BPCOFHeader | string> {
    return this._httpClient.get<any>(`${this.baseAddress}poapi/PO/GetPOByDocAndPartnerID?DocNumber=${DocNumber}&PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetPOByDocAndImportVendor(DocNumber: string, ImportVendor: string): Observable<BPCOFHeader | string> {
    return this._httpClient.get<any>(`${this.baseAddress}poapi/PO/GetPOByDocAndImportVendor?DocNumber=${DocNumber}&ImportVendor=${ImportVendor}`)
      .pipe(catchError(this.errorHandler));
  }
  GetPOViewByDocAndPartnerID(DocNumber: string, PartnerID: string): Observable<BPCOFHeaderView | string> {
    return this._httpClient.get<any>(`${this.baseAddress}poapi/PO/GetPOViewByDocAndPartnerID?DocNumber=${DocNumber}&PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetPOPartnerID(PartnerID: string): Observable<BPCFact | string> {
    return this._httpClient.get<any>(`${this.baseAddress}poapi/PO/GetFactByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetPOItemsByDoc(DocNumber: string): Observable<BPCOFItem[] | string> {
    return this._httpClient.get<BPCOFItem[]>(`${this.baseAddress}poapi/PO/GetPOItemsByDoc?DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }
  GetInvoicesByDoc(DocNumber: string): Observable<BPCInvoice[] | string> {
    return this._httpClient.get<BPCInvoice[]>(`${this.baseAddress}poapi/Invoice/GetInvoicesByDoc?DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }
  GetSupportPOItemsByDoc(DocNumber: string): Observable<BPCOFItem[] | string> {
    return this._httpClient.get<BPCOFItem[]>(`${this.baseAddress}poapi/PO/GetSupportPOItemsByDoc?DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }
  GetPOItemsByDocAndPartnerID(DocNumber: string, PartnerID: string): Observable<BPCOFItem[] | string> {
    return this._httpClient.get<BPCOFItem[]>(`${this.baseAddress}poapi/PO/GetPOItemsByDocAndPartnerID?DocNumber=${DocNumber}&PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetPOItemViewsByDocAndPartnerID(DocNumber: string, PartnerID: string): Observable<BPCOFItemView[] | string> {
    return this._httpClient.get<BPCOFItemView[]>(`${this.baseAddress}poapi/PO/GetPOItemViewsByDocAndPartnerID?DocNumber=${DocNumber}&PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetPOItemViewsByDocAndImportVendor(DocNumber: string, ImportVendor: string): Observable<BPCOFItemView[] | string> {
    return this._httpClient.get<BPCOFItemView[]>(`${this.baseAddress}poapi/PO/GetPOItemViewsByDocAndImportVendor?DocNumber=${DocNumber}&ImportVendor=${ImportVendor}`)
      .pipe(catchError(this.errorHandler));
  }
  GetPOGRGIByDocAndPartnerID(DocNumber: string, PartnerID: string): Observable<BPCOFGRGI[] | string> {
    return this._httpClient.get<BPCOFGRGI[]>(`${this.baseAddress}poapi/PO/GetPOGRGIByDocAndPartnerID?DocNumber=${DocNumber}&PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetSOItemCountByDocAndPartnerID(DocNumber: string, PartnerID: string): Observable<SOItemCount | string> {
    return this._httpClient.get<SOItemCount>(`${this.baseAddress}poapi/PO/GetSOItemCountByDocAndPartnerID?DocNumber=${DocNumber}&PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetPlantByDocNmber(DocNumber: string, PartnerID: string): Observable<any> {
    return this._httpClient.get(`${this.baseAddress}poapi/PO/GetPlantByDocNmber?DocNumber=${DocNumber}&PartnerID=${PartnerID}`, { responseType: 'text' })
      .pipe(catchError(this.errorHandler));
  }
  GetPlantByASNNmber(ASNNumber: string, PartnerID: string): Observable<SOItemCount | string> {
    return this._httpClient.get<SOItemCount>(`${this.baseAddress}poapi/PO/GetPlantByASNNmber?ASNNumber=${ASNNumber}&PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  // Data Migration
  // madhu
  GetInvoiceByPartnerIdAnDocumentNo(PatnerID: string): Observable<BPCInvoice | any> {
    return this._httpClient.get<BPCInvoice>(`${this.baseAddress}poapi/Invoice/GetInvoiceByPartnerIdAnDocumentNo?PatnerID=${PatnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetPartnerAndRequestIDByPartnerId(PatnerID: string): Observable<BPCRetNew | any> {
    return this._httpClient.get<BPCRetNew>(`${this.baseAddress}poapi/Return/GetPartnerAndRequestIDByPartnerId?PatnerID=${PatnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  GetAttachmentByPatnerIdAndDocNum(DocNumber: string, PatnerID: string): Observable<DocumentDetails[] | string> {
    return this._httpClient.get<DocumentDetails[]>(`${this.baseAddress}poapi/Dashboard/GetAttachmentByPatnerIdAndDocNum?PatnerID=${PatnerID}&DocNumber=${DocNumber}`)
      .pipe(catchError(this.errorHandler));
  }

  //
  CreateOFHeaders(OFHeaders: BPCOFHeaderXLSX[]): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/PO/CreateOFHeaders`,
      OFHeaders,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }

  CreateOFItems(OFItems: BPCOFItemXLSX[]): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/PO/CreateOFItems`,
      OFItems,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }

  CreateOFScheduleLines(OFScheduleLines: BPCOFScheduleLineXLSX[]): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/PO/CreateOFScheduleLines`,
      OFScheduleLines,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }

  CreateOFGRGIs(OFGRGIs: BPCOFGRGIXLSX[]): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/PO/CreateOFGRGIs`,
      OFGRGIs,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }

  CreateOFQMs(OFQMs: BPCOFQMXLSX[]): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/PO/CreateOFQMs`,
      OFQMs,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }

  GetBPCQMByPartnerID(PartnerID: string): Observable<any> {
    return this._httpClient.get<any>(`${this.baseAddress}poapi/PO/GetBPCQMByPartnerID?PartnerID=${PartnerID}`
    ).pipe(catchError(this.errorHandler));
  }
  GetBPCQMByPartnerIDFilter(PartnerID: string): Observable<any> {
    return this._httpClient.get<any>(`${this.baseAddress}poapi/PO/GetBPCQMByPartnerIDFilter?PartnerID=${PartnerID}`
    ).pipe(catchError(this.errorHandler));
  }
  GetQMReportByDate(overViewData: OverviewReportOption): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/PO/GetQMReportByDate`,
      overViewData,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }
  GetQMReportByOption(overViewData: OverviewReportOption): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/PO/GetQMReportByOption`,
      overViewData,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }
  GetQMReportByStatus(overViewData: OverviewReportOption): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}poapi/PO/GetQMReportByStatus`,
      overViewData,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }

  // CEOMessage
  CreateCEOMessage(CEOMessage: BPCCEOMessage): Observable<any> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Message/CreateCEOMessage`,
        CEOMessage,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }

  GetCEOMessage(): Observable<BPCCEOMessage | string> {
    return this._httpClient
      .get<BPCCEOMessage>(
        `${this.baseAddress}poapi/Message/GetCEOMessage`
      )
      .pipe(catchError(this.errorHandler));
  }

  UpdateCEOMessage(CEOMessage: BPCCEOMessage): Observable<any> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Message/UpdateCEOMessage`,
        CEOMessage,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }

  DeleteCEOMessage(CEOMessage: BPCCEOMessage): Observable<any> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Message/DeleteCEOMessage`,
        CEOMessage,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }

  // SCOCMessage
  CreateSCOCMessage(SCOCMessage: BPCSCOCMessage): Observable<any> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Message/CreateSCOCMessage`,
        SCOCMessage,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }

  GetSCOCMessage(): Observable<BPCSCOCMessage | string> {
    return this._httpClient
      .get<BPCSCOCMessage>(
        `${this.baseAddress}poapi/Message/GetSCOCMessage`
      )
      .pipe(catchError(this.errorHandler));
  }

  UpdateSCOCMessage(SCOCMessage: BPCSCOCMessage): Observable<any> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Message/UpdateSCOCMessage`,
        SCOCMessage,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }


  DeleteSCOCMessage(SCOCMessage: BPCSCOCMessage): Observable<any> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Message/DeleteSCOCMessage`,
        SCOCMessage,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }
  // Welcome Message
  CreateWelcomeMessage(WelcomeMessage: BPCWelcomeMessage): Observable<any> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Message/CreateWelcomeMessage`,
        WelcomeMessage,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }

  GetWelcomeMessage(): Observable<BPCWelcomeMessage | string> {
    return this._httpClient
      .get<BPCWelcomeMessage>(
        `${this.baseAddress}poapi/Message/GetWelcomeMessage`
      )
      .pipe(catchError(this.errorHandler));
  }

  UpdateWelcomeMessage(WelcomeMessage: BPCWelcomeMessage): Observable<any> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Message/UpdateWelcomeMessage`,
        WelcomeMessage,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }

  DeleteWelcomeMessage(WelcomeMessage: BPCWelcomeMessage): Observable<any> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Message/DeleteCEOMessage`,
        WelcomeMessage,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }


  // invoice payment
  GetAllInvoices(): Observable<BPCInvoice[] | string> {
    return this._httpClient.get<BPCInvoice[]>(`${this.baseAddress}poapi/Invoice/GetAllInvoices`)
      .pipe(catchError(this.errorHandler));
  }
  GetAllInvoicesByPartnerID(PartnerID: string): Observable<BPCInvoice[] | string> {
    return this._httpClient.get<BPCInvoice[]>(`${this.baseAddress}poapi/Invoice/GetAllInvoicesByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  FilterInvoices(PatnerID: string, DocNumber: string, InvoiceNumber: string, FromDate: string, ToDate: string): Observable<BPCInvoice[] | string> {
    // tslint:disable-next-line:max-line-length
    return this._httpClient.get<BPCInvoice[]>(`${this.baseAddress}poapi/Invoice/FilterInvoices?PatnerID=${PatnerID}&DocNumber=${DocNumber}&InvoiceNumber=${InvoiceNumber}&FromDate=${FromDate}&ToDate=${ToDate}`)
      .pipe(catchError(this.errorHandler));
  }
  // (`${this.baseAddress}poapi/Invoice/GetExcel_VendorReconciliation?Excel_val=${Excel_val}&Selectedvendor=${Selectedvendor}`)
  //#region GetExcel_VendorReconciliation
  GetExcel_VendorReconciliationMismatch(Excel_val: InvoiceVendor, Selectedvendor): Observable<InvoiceVendor[]> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Invoice/GetExcel_VendorReconciliationMismatch?Selectedvendor=${Selectedvendor}`,
        Excel_val,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }
          ),
        }
      )
      .pipe(catchError(this.errorHandler));
  }

  GetExcel_VendorReconciliationPartialMatch(Excel_val: InvoiceVendor, Selectedvendor): Observable<InvoiceVendor[]> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Invoice/GetExcel_VendorReconciliationPartialMatch?Selectedvendor=${Selectedvendor}`,
        Excel_val,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }
  GetExcel_VendorReconciliationMatched(Excel_val: InvoiceVendor, Selectedvendor): Observable<InvoiceVendor[]> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Invoice/GetExcel_VendorReconciliationMatched?Selectedvendor=${Selectedvendor}`,
        Excel_val,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }
  GetExcel_VendorReconciliationAll(Excel_val: InvoiceVendor, Selectedvendor): Observable<InvoiceVendor[]> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Invoice/GetExcel_VendorReconciliationAll?Selectedvendor=${Selectedvendor}`,
        Excel_val,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }
  SendMail_VendorReconciliation(Excel_val: InvoiceVendor[], Selectedvendor, TextAreaValue, mailId): Observable<boolean> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Invoice/SendMail_VendorReconciliation?Selectedvendor=${Selectedvendor}&TextAreaValue=${TextAreaValue}&mailId=${mailId}`,
        Excel_val,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }
  //#endregion

  UpdateInvoice(InvoicePayment: BPCInvoicePayment): Observable<any> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Invoice/UpdateInvoice`,
        InvoicePayment,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }
  // invoice payment end
  // payment history
  GetAllPaymentRecord(): Observable<BPCPayRecord[] | string> {
    return this._httpClient.get<BPCPayRecord[]>(`${this.baseAddress}poapi/Invoice/GetAllPaymentRecord`)
      .pipe(catchError(this.errorHandler));
  }
  GetAllRecordDateFilter(): Observable<BPCPayRecord[] | string> {
    return this._httpClient.get<BPCPayRecord[]>(`${this.baseAddress}poapi/Invoice/GetAllRecordDateFilter`)
      .pipe(catchError(this.errorHandler));
  }
  GetPaymentRecordsByInvoice(PartnerID: string, DocNumber: string, InvoiceNumber: string): Observable<BPCPayRecord[] | string> {
    return this._httpClient.get<BPCPayRecord[]>
      (`${this.baseAddress}poapi/Invoice/GetPaymentRecordsByInvoice?PartnerID=${PartnerID}&DocNumber=${DocNumber}&InvoiceNumber=${InvoiceNumber}`)
      .pipe(catchError(this.errorHandler));
  }
  CreatePaymentRecord(InvoicePaymentRcrd: BPCPayRecord): Observable<any> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Invoice/CreatePaymentRecord`,
        InvoicePaymentRcrd,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }


  // inv with payrecord,payment,invoice

  UpdateInvoicePay(InvoicePayment: BPCInvoicePayView): Observable<any> {
    return this._httpClient
      .post<any>(
        `${this.baseAddress}poapi/Invoice/UpdateInvoicePay`,
        InvoicePayment,
        {
          headers: new HttpHeaders({
            "Content-Type": "application/json",
          }),
        }
      )
      .pipe(catchError(this.errorHandler));
  }


  AddPaymentRecord(InvoicePayment: BPCInvoicePayView, selectedFiles: File[]): Observable<any> {
    const formData: FormData = new FormData();
    if (selectedFiles && selectedFiles.length) {
        selectedFiles.forEach(x => {
            formData.append(x.name, x, x.name);
        });
    }
    formData.append('InvoicePayView', JSON.stringify(InvoicePayment));
    return this._httpClient.post<any>(`${this.baseAddress}poapi/Invoice/AddPaymentRecordWithAttachment`,
        formData,
        // {
        //   headers: new HttpHeaders({
        //     'Content-Type': 'application/json'
        //   })
        // }
    ).pipe(catchError(this.errorHandler));
}


  // end
}
