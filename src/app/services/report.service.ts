import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { Guid } from 'guid-typescript';
import { catchError } from 'rxjs/operators';
import {
  BPCInvoice, BPCPayment, BPCInvoiceXLSX, BPCPaymentXLSX,
  OverviewReportOption, BPCReportPPMHeader, PPMReportOption,
  BPCReportOV, BPCReportVR,
  BPCReportDOL,
  BPCReportGRR,
  BPCReportFGCPS
} from 'app/models/ReportModel';
import { GRNListFilter } from 'app/models/ASN';

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  baseAddress: string;
  constructor(
    private _httpClient: HttpClient,
    private _authService: AuthService
  ) {
    this.baseAddress = _authService.baseAddress;
    // this.baseAddress = 'http://192.168.0.28:7010/';
  }
  // Error Handler
  errorHandler(error: HttpErrorResponse): Observable<string> {
    return throwError(error.error || error.message || 'Server Error');
  }

  GetAllInvoices(): Observable<BPCInvoice[] | string> {
    return this._httpClient.get<BPCInvoice[]>(`${this.baseAddress}reportapi/InvoiceReport/GetAllInvoices`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllInvoicesByPartnerID(PartnerID: string): Observable<BPCInvoice[] | string> {
    return this._httpClient.get<BPCInvoice[]>(`${this.baseAddress}reportapi/InvoiceReport/GetAllInvoicesByPartnerID?PartnerID=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }

  GetFilteredInvoices(InvoiceNo: string, PoReference: string, FromDate: string, ToDate: string, Status: string): Observable<BPCInvoice[] | string> {
    return this._httpClient.get<BPCInvoice[]>
      (`${this.baseAddress}reportapi/InvoiceReport/GetFilteredInvoices?InvoiceNo=${InvoiceNo}&PoReference=${PoReference}&FromDate=${FromDate}&ToDate=${ToDate}&Status=${Status}`)
      .pipe(catchError(this.errorHandler));
  }

  GetFilteredInvoicesByPartnerID(PartnerID: string, InvoiceNo: string, PoReference: string, FromDate: string, ToDate: string, Status: string): Observable<BPCInvoice[] | string> {
    return this._httpClient.get<BPCInvoice[]>
      (`${this.baseAddress}reportapi/InvoiceReport/GetFilteredInvoicesByPartnerID?PartnerID=${PartnerID}&InvoiceNo=${InvoiceNo}&PoReference=${PoReference}&FromDate=${FromDate}&ToDate=${ToDate}&Status=${Status}`)
      .pipe(catchError(this.errorHandler));
  }

  GetAllPayments(): Observable<BPCPayment[] | string> {
    return this._httpClient.get<BPCPayment[]>(`${this.baseAddress}reportapi/PaymentReport/GetAllPayments`)
      .pipe(catchError(this.errorHandler));
  }

  GetFilteredPayments(FromDate: string, ToDate: string): Observable<BPCPayment[] | string> {
    return this._httpClient.get<BPCPayment[]>
      (`${this.baseAddress}reportapi/PaymentReport/GetFilteredPayments?FromDate=${FromDate}&ToDate=${ToDate}`)
      .pipe(catchError(this.errorHandler));
  }

  CreateInvoices(Invoices: BPCInvoiceXLSX[]): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}reportapi/InvoiceReport/CreateInvoices`,
      Invoices,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }

  CreatePayments(Payments: BPCPaymentXLSX[]): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}reportapi/PaymentReport/CreatePayments`,
      Payments,
      // {
      //   headers: new HttpHeaders({
      //     'Content-Type': 'application/json'
      //   })
      // }
    ).pipe(catchError(this.errorHandler));
  }

  // PPM
  GetPPMReports(PartnerId: string): Observable<any> {
    return this._httpClient.get<BPCReportPPMHeader[]>(`${this.baseAddress}reportapi/Report/GetPPMReports?PartnerID=${PartnerId}`)
      .pipe(catchError(this.errorHandler));
  }

  GetPPMReportByDate(data: PPMReportOption): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}reportapi/Report/GetPPMReportByDate`, data)
      .pipe(catchError(this.errorHandler));
  }

  GetPPMReportByStatus(data: PPMReportOption): Observable<any> {
    return this._httpClient.post<any>(`${this.baseAddress}reportapi/Report/GetPPMReportByStatus`, data)
      .pipe(catchError(this.errorHandler));
  }

  GetPPMItemReportByPeriod(PartnerId: string, period: Date): Observable<any> {
    const data = [];
    const temp = {
      "PartnerID": PartnerId,
      "Period": period
    };
    data.push(temp);
    return this._httpClient.post<any>(`${this.baseAddress}reportapi/Report/GetPPMItemReportByPeriod?PartnerID=${PartnerId}&period=${period}`
      , data).pipe(catchError(this.errorHandler));
  }

  // Overview
  GetOverviewReports(PartnerId: string): Observable<any> {
    return this._httpClient.get<BPCReportOV[]>(`${this.baseAddress}reportapi/Report/GetOverviewReports?PartnerID=${PartnerId}`)
      .pipe(catchError(this.errorHandler));
  }

  GetOverviewReportByOption(overViewData: OverviewReportOption): Observable<any> {
    return this._httpClient.post<OverviewReportOption>(`${this.baseAddress}reportapi/Report/GetOverviewReportByOption`, overViewData)
      .pipe(catchError(this.errorHandler));
  }

  GetOverviewReportByStatus(overViewData: OverviewReportOption): Observable<any> {
    return this._httpClient.post<OverviewReportOption>(`${this.baseAddress}reportapi/Report/GetOverviewReportByStatus`, overViewData)
      .pipe(catchError(this.errorHandler));
  }

  GetOverviewReportByDate(overViewData: OverviewReportOption): Observable<any> {
    return this._httpClient.post<OverviewReportOption>(`${this.baseAddress}reportapi/Report/GetOverviewReportByDate`, overViewData)
      .pipe(catchError(this.errorHandler));
  }

  // DOL
  GetAllReportDOLByPartnerID(PartnerId: string): Observable<any> {
    return this._httpClient.get<BPCReportDOL[]>(`${this.baseAddress}reportapi/Report/GetAllReportDOLByPartnerID?PartnerID=${PartnerId}`)
      .pipe(catchError(this.errorHandler));
  }

  // Vendor Rating
  GetVendorRatingReports(PartnerId: string): Observable<any> {
    return this._httpClient.get<BPCReportVR[]>(`${this.baseAddress}reportapi/Report/GetVendorRatingReports?PartnerID=${PartnerId}`)
      .pipe(catchError(this.errorHandler));
  }

  // Inspection Plan
  GetAllReportIPByPartnerID(PartnerId: string): Observable<any> {
    return this._httpClient.get<BPCReportOV[]>(`${this.baseAddress}reportapi/Report/GetAllReportIPByPartnerID?PartnerID=${PartnerId}`)
      .pipe(catchError(this.errorHandler));
  }

  GetFilteredReportIPByPartnerID(PartnerId: string, material: string, method: string): Observable<any> {
    return this._httpClient.get<BPCReportOV[]>(`${this.baseAddress}reportapi/Report/GetFilteredReportIPByPartnerID?PartnerID=${PartnerId}&Material=${material}&Method=${method}`)
      .pipe(catchError(this.errorHandler));
  }


  // GetAllReportGRRByPartnerID(PartnerId: any): Observable<any> {
  // return this._httpClient.get<BPCReportGRR[]>(`${this.baseAddress}reportapi/Report/GetAllReportGRRByPartnerID?PartnerID=${PartnerId}`)
  // .pipe(catchError(this.errorHandler));
  // }


  // GRR 
  GetAllGRR(): Observable<any> {
    return this._httpClient.get<BPCReportGRR[]>(`${this.baseAddress}poapi/PO/GetAllGRR`)
      .pipe(catchError(this.errorHandler));
  }
  GetGRRByPartnerId(PartnerID: string): Observable<any> {
    return this._httpClient.get<BPCReportGRR[]>(`${this.baseAddress}poapi/PO/GetGRRByPartnerId?partnerId=${PartnerID}`)
      .pipe(catchError(this.errorHandler));
  }
  FilterGRRListByPartnerID(PartnerID: string, GRGIDoc: string, Material: string, StartDate: string, EndDate: string): Observable<BPCReportGRR[] | string> {
    return this._httpClient.get<BPCReportGRR[]>
      (`${this.baseAddress}poapi/PO/FilterGRRListByPartnerID?PartnerID=${PartnerID}&GRGIDoc=${GRGIDoc}&Material=${Material}&StartDate=${StartDate}&EndDate=${EndDate}`)
      .pipe(catchError(this.errorHandler));
  }
  FilterGRGIListByPlants(filter: GRNListFilter): Observable<BPCReportGRR[] | string> {
    return this._httpClient.post<BPCReportGRR[]>
      (`${this.baseAddress}poapi/PO/FilterGRGIListByPlants`, filter)
      .pipe(catchError(this.errorHandler));
  }
  FilterGRRListForBuyer(GRGIDoc: string, Material: string, StartDate: Date, EndDate: Date): Observable<BPCReportGRR[] | string> {
    return this._httpClient.get<BPCReportGRR[]>
      (`${this.baseAddress}poapi/PO/FilterGRRListForBuyer?GRGIDoc=${GRGIDoc}&Material=${Material}&ASNFromDate=${StartDate}&ASNToDate=${EndDate}`)
      .pipe(catchError(this.errorHandler));
  }
  //
  GetFilteredReportGRRByPartnerID(PartnerId: string, material: string): Observable<any> {
    return this._httpClient.get<BPCReportOV[]>(`${this.baseAddress}reportapi/Report/GetFilteredReportGRRByPartnerID?PartnerID=${PartnerId}&Material=${material}`)
      .pipe(catchError(this.errorHandler));
  }


  // FG Child Part Stock
  GetAllReportFGCPSByPartnerID(PartnerId: string): Observable<BPCReportFGCPS[] | string> {
    return this._httpClient.get<BPCReportFGCPS[]>(`${this.baseAddress}/reportapi/Report/GetAllReportFGCPSByPartnerID?PartnerID=${PartnerId}`)
      .pipe(catchError(this.errorHandler));
  }

  GetFilteredReportFGCPSByPartnerID(PartnerId: string, material: string, materialText: string): Observable<any> {
    return this._httpClient.get<BPCReportFGCPS[]>(`${this.baseAddress}reportapi/Report/GetFilteredReportGRRByPartnerID?PartnerID=${PartnerId}&Material=${material}
    &MaterialText=${materialText}`)
      .pipe(catchError(this.errorHandler));
  }

}
