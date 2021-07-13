import { Subject, Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError } from 'rxjs/operators';
import { SupportHeader, SupportLog, SupportHeaderView, SupportMaster, SupportMasterView, SupportAppMaster, HelpDeskAdminDetails } from 'app/models/support-desk';
import { UserWithRole } from 'app/models/master';

@Injectable({
    providedIn: 'root'
})
export class SupportDeskService {
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

    errorHandler(error: HttpErrorResponse): Observable<string> {
        return throwError(error.error || error.message || 'Server Error');
    }

    // Support Masters  

    GetSupportMasters(): Observable<any | string> {
        return this._httpClient.get<any>(`${this.baseAddress}supportapi/SupportDesk/GetSupportMasters`)
            .pipe(catchError(this.errorHandler));
    }
    GetSupportAppMasters(): Observable<SupportAppMaster[] | string> {
        return this._httpClient.get<SupportAppMaster[]>(`${this.baseAddress}supportapi/SupportDesk/GetSupportAppMasters`)
            .pipe(catchError(this.errorHandler));
    }

    GetSupportMastersByPartnerID(PartnerID: any): Observable<any | string> {
        return this._httpClient.get<any>(`${this.baseAddress}supportapi/SupportDesk/GetSupportMastersByPartnerID?PartnerID=${PartnerID}`)
            .pipe(catchError(this.errorHandler));
    }

    CreateSupportMaster(supportMaster: SupportMasterView): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}supportapi/SupportDesk/CreateSupportMaster`,
            supportMaster,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    UpdateSupportMaster(supportMaster: SupportMasterView): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}supportapi/SupportDesk/UpdateSupportMaster`,
            supportMaster,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    DeleteSupportMaster(supportMaster: SupportMaster): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}supportapi/SupportDesk/DeleteSupportMaster`,
            supportMaster,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    GetSupportDetailsByPartnerAndSupportID(SupportID: any, PartnerID: any): Observable<any | string> {
        return this._httpClient.get<any>(`${this.baseAddress}supportapi/SupportDesk/GetSupportDetailsByPartnerAndSupportID?SupportID=${SupportID}&PartnerID=${PartnerID}`)
            .pipe(catchError(this.errorHandler));
    }

    GetSupportDetailsBySupportID(SupportID: any): Observable<any | string> {
        return this._httpClient.get<any>
            (`${this.baseAddress}supportapi/SupportDesk/GetSupportDetailsBySupportID?SupportID=${SupportID}`)
            .pipe(catchError(this.errorHandler));
    }

    GetSupportDetailsByPartnerAndSupportIDAndType(SupportID: any, PartnerID: any, Type: string): Observable<any | string> {
        return this._httpClient.get<any>
            (`${this.baseAddress}supportapi/SupportDesk/GetSupportDetailsByPartnerAndSupportIDAndType?SupportID=${SupportID}&PartnerID=${PartnerID}&Type=${Type}`)
            .pipe(catchError(this.errorHandler));
    }

    // Support Tickets

    GetSupportTicketsByPartnerID(PartnerID: any): Observable<any | string> {
        return this._httpClient.get<any>(`${this.baseAddress}supportapi/SupportDesk/GetSupportTicketsByPartnerID?PartnerID=${PartnerID}`)
            .pipe(catchError(this.errorHandler));
    }

    GetSupportTicketsByPartnerIDAndType(PartnerID: any, Type: string): Observable<any | string> {
        return this._httpClient.get<any>(`${this.baseAddress}supportapi/SupportDesk/GetSupportTicketsByPartnerIDAndType?PartnerID=${PartnerID}&Type=${Type}`)
            .pipe(catchError(this.errorHandler));
    }

    GetBuyerSupportTickets(PartnerID: any, Plant: string): Observable<any | string> {
        return this._httpClient.get<any>(`${this.baseAddress}supportapi/SupportDesk/GetBuyerSupportTickets?PartnerID=${PartnerID}&Plant=${Plant}`)
            .pipe(catchError(this.errorHandler));
    }

    GetHelpDeskAdminSupportTickets(helpDeskAdminDetails: HelpDeskAdminDetails): Observable<SupportHeaderView[] | string> {
        return this._httpClient.post<SupportHeaderView[]>(`${this.baseAddress}supportapi/SupportDesk/GetHelpDeskAdminSupportTickets`,
            helpDeskAdminDetails,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    CreateSupportTicket(supportHeader: SupportHeaderView): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}supportapi/SupportDesk/CreateSupportTicket`,
            supportHeader,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    // Support Logs

    GetSupportLogsByPartnerAndSupportID(SupportID: any, PartnerID: any): Observable<any | string> {
        return this._httpClient.get<any>(`${this.baseAddress}supportapi/SupportDesk/GetSupportLogsByPartnerAndSupportID?SupportID=${SupportID}&PartnerID=${PartnerID}`)
            .pipe(catchError(this.errorHandler));
    }

    GetSupportLogsByPartnerAndSupportIDAndType(SupportID: any, PartnerID: any, Type: string): Observable<any | string> {
        return this._httpClient.get<any>
            (`${this.baseAddress}supportapi/SupportDesk/GetSupportLogsByPartnerAndSupportIDAndType?SupportID=${SupportID}&PartnerID=${PartnerID}&Type=${Type}`)
            .pipe(catchError(this.errorHandler));
    }

    CreateSupportLog(supportLog: SupportLog): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}supportapi/SupportDesk/CreateSupportLog`,
            supportLog,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    UpdateSupportLog(supportLog: SupportLog): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}supportapi/SupportDesk/UpdateSupportLog`,
            supportLog,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    ReOpenSupportTicket(supportLog: SupportLog): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}supportapi/SupportDesk/ReOpenSupportTicket`,
            supportLog,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    CloseSupportTicket(header: SupportHeader): Observable<any> {
        return this._httpClient.post<any>(`${this.baseAddress}supportapi/SupportDesk/CloseSupportTicket`,
            header,
            {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json'
                })
            })
            .pipe(catchError(this.errorHandler));
    }

    // Support Attachments

    AddSupportAttachment(SupportID: string, CreatedBy: string, selectedFiles: File[]): Observable<any> {
        const formData: FormData = new FormData();
        if (selectedFiles && selectedFiles.length) {
            selectedFiles.forEach(x => {
                formData.append(x.name, x, x.name);
            });
        }
        formData.append('SupportID', SupportID);
        formData.append('CreatedBy', CreatedBy.toString());

        return this._httpClient.post<any>(`${this.baseAddress}supportapi/SupportDesk/AddSupportAttachment`,
            formData,
            // {
            //   headers: new HttpHeaders({
            //     'Content-Type': 'application/json'
            //   })
            // }
        ).pipe(catchError(this.errorHandler));
    }

    AddSupportLogAttachment(SupportID: string, SupportLogID: string, CreatedBy: string, selectedFiles: File[]): Observable<any> {
        const formData: FormData = new FormData();
        if (selectedFiles && selectedFiles.length) {
            selectedFiles.forEach(x => {
                formData.append(x.name, x, x.name);
            });
        }
        formData.append('SupportID', SupportID);
        formData.append('SupportLogID', SupportLogID);
        formData.append('CreatedBy', CreatedBy.toString());

        return this._httpClient.post<any>(`${this.baseAddress}supportapi/SupportDesk/AddSupportLogAttachment`,
            formData,
            // {
            //   headers: new HttpHeaders({
            //     'Content-Type': 'application/json'
            //   })
            // }
        ).pipe(catchError(this.errorHandler));
    }

    DownloadSupportAttachment(AttachmentName: string, SupportID: string): Observable<Blob | string> {
        return this._httpClient.get(`${this.baseAddress}supportapi/SupportDesk/DownloadSupportAttachment?AttachmentName=${AttachmentName}&SupportID=${SupportID}`, {
            responseType: 'blob',
            headers: new HttpHeaders().append('Content-Type', 'application/json')
        })
            .pipe(catchError(this.errorHandler));
    }

    SaveFAQAttachment(CreatedBy: string, selectedFile: File): Observable<any> {
        const formData: FormData = new FormData();
        formData.append(selectedFile.name, selectedFile, selectedFile.name);
        formData.append('CreatedBy', CreatedBy.toString());

        return this._httpClient.post<any>(`${this.baseAddress}supportapi/SupportDesk/SaveFAQAttachment`,
            formData,
            // {
            //   headers: new HttpHeaders({
            //     'Content-Type': 'application/json'
            //   })
            // }
        ).pipe(catchError(this.errorHandler));
    }

    GetFAQAttachment(): Observable<Blob | string> {
        return this._httpClient.get(`${this.baseAddress}supportapi/SupportDesk/GetFAQAttachment`, {
            responseType: 'blob',
            headers: new HttpHeaders().append('Content-Type', 'application/json')
        })
            .pipe(catchError(this.errorHandler));
    }

}
